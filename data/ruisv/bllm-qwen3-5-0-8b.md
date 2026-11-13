# ruisv/bllm-qwen3.5-0.8b

## Resumen

`ruisv/bllm-qwen3.5-0.8b` es una compilación nativa para BPU del modelo Qwen3.5-0.8B de Alibaba, empaquetada por el desarrollador ruisv para las placas D-Robotics RDK S100 y S100P. No se trata de un checkpoint cargable con `transformers`, sino de un binario compilado (ficheros `.hbm`) que se ejecuta íntegramente en la NPU (Nash BPU) de dichas placas mediante el runtime BLLM, sin GPU, CUDA ni conexión a la nube.

El modelo base es multimodal (imagen y texto) y emplea una arquitectura híbrida poco habitual: 18 capas de Gated-DeltaNet (atención lineal tipo SSM) combinadas con 6 capas de atención completa, con `head_dim=256`. Esta arquitectura no está cubierta por la toolchain oficial OE-LLM de D-Robotics (`libxlm`), por lo que la compilación existe precisamente porque BLLM compila el grafo directamente contra `hbDNN`/`hbUCP`.

Su relevancia actual radica en que demuestra inferencia de un VLM de 0,8B con cuantización int8/int16 en hardware edge de bajo consumo, con el decodificador de texto ejecutándose al 100% en la BPU (`CPU_inference_time_cost == 0`) y alcanzando entre 18,5 y 23,2 tokens/s según la ventana de contexto configurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 capas Gated-DeltaNet (atención lineal SSM) + 6 capas de atención completa |
| Parametros totales | 0,8B (heredados del modelo base Qwen3.5-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (`ctx4k`) o 512 tokens (`ctx512`), según variante |
| Tipos de cuantizacion | int8 pesos (per-channel) / int16 activaciones (estática, data-free) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | `.hbm` (binario compilado para BPU), más `embed_tokens.bin` y `tokenizer.json`; no es safetensors ni GGUF |
| Hardware objetivo | D-Robotics RDK S100 (J6E, 80 TOPS, march `nash-e`) y RDK S100P (J6M, 128 TOPS, march `nash-m`) |
| Modalidad | Imagen + texto (torre de visión incluida, bucket de 320 px, 100 tokens por imagen) |
| Runtime | BLLM (nativo, sin `libxlm`) |
| Tamaño del repo | 11,8 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas de atención lineal basadas en Gated-DeltaNet (un mecanismo SSM con compuertas) con un pequeño número de capas de atención completa, en una proporción de 18 a 6. Esta mezcla busca reducir el coste computacional y de memoria del contexto largo manteniendo la capacidad de recuperación de información de la atención completa. El `head_dim=256` y la presencia de SSM son los elementos que impiden el uso de la toolchain oficial de D-Robotics.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. La contribución de este repositorio no es el entrenamiento, sino la compilación y cuantización: pesos en int8 por canal y activaciones en int16 estáticas con calibración data-free, generando dos builds separados (`nash-e` y `nash-m`) a partir del mismo grafo y los mismos pesos. La build de texto usa un doble grafo (prefill y decode) más un grafo adicional de prefill troceado con N=32.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Comprensión de imágenes y respuesta a preguntas sobre ellas (image-text-to-text), con la torre de visión incluida en el paquete.
- Ejecución del decodificador de texto íntegramente en la BPU, con coste de CPU declarado igual a cero.
- Carga opcional sin la torre de visión (`vision=False`) para uso exclusivamente textual con menor consumo de memoria.
- Decodificación greedy verificada con paridad token a token entre builds.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras modalidades.

## Casos de uso

- Inspección visual en robótica embarcada: la placa RDK S100/S100P puede procesar una imagen de 320 px y responder preguntas sobre ella en 1,2-1,5 s de TTFT, lo que permite bucles de percepción-consulta dentro de un robot sin depender de conectividad.
- Asistente de voz o texto en dispositivo sin nube: con 18,5-23,2 tokens/s de decodificación, el modelo puede mantener conversaciones multi-turno localmente en inglés o chino, útil en entornos con requisitos de privacidad o sin red.
- Etiquetado y descripción automática de imágenes en el edge: generación de descripciones o respuestas a preguntas sobre capturas de cámara directamente en la placa, evitando enviar imágenes a un servidor.
- Prototipado de producto sobre hardware D-Robotics: al ser un binario verificado en placa, sirve para validar la viabilidad de un VLM de 0,8B en el presupuesto térmico y energético de un dispositivo embebido antes de invertir en un modelo mayor.
- Aplicaciones de inspección con contexto corto: la variante `ctx512` decodifica más rápido (23,18 frente a 18,52 tok/s) y es adecuada para prompts y respuestas breves, como clasificación visual o respuestas de una frase.
- Despliegue en flotas de dispositivos con presupuesto de memoria ajustado: los 11,8 GB del repositorio incluyen ambas builds y ambas ventanas de contexto, pero cada despliegue solo necesita la carpeta correspondiente a su placa.
- Investigación en cuantización y compilación para NPU: el par de repositorios (BLLM y bllm-model-zoo) documenta el método de compilación, los datos de aceptación y lo que se probó y descartó, lo que lo convierte en material de referencia para portar otras arquitecturas híbridas.

## Benchmarks y rendimiento

Datos medidos en hardware por el autor. La build `s100p` se midió en una RDK S100P en modo rendimiento con 3 ejecuciones repetidas; la build `s100` se aceptó ejecutándola sobre silicio S100P (un binario `nash-e` carga y funciona allí) contra la build S100P como línea base en la misma sesión.

| Build | Decode | TTFT (imagen) | Paridad prefill↔decode | Perplejidad | Contraste de imagen | Anclas de tarea |
|---|---|---|---|---|---|---|
| `s100p/ctx4096` | 18,52 tok/s | 1,32 s | PASS | 83,09 | PASS | PASS* |
| `s100p/ctx512` | 23,18 tok/s | 1,19 s | PASS | 83,60 | PASS | PASS |
| `s100/ctx4k` (nash-e) | 18,55 tok/s | 1,478 s | PASS | 83,0899 | PASS | PASS* |
| `s100p/ctx4k` (nash-m, base) | 18,54 tok/s | 1,479 s | PASS | 83,0899 | PASS | PASS* |
| `s100/ctx512` (nash-e) | 23,04 tok/s | 1,321 s | PASS | 83,5979 | PASS | PASS |
| `s100p/ctx512` (nash-m, base) | 23,15 tok/s | 1,318 s | PASS | 83,5979 | PASS | PASS |

Las respuestas generadas fueron idénticas token a token entre ambas builds en todas las pruebas, y las perplejidades coinciden hasta cuatro decimales. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: placa D-Robotics RDK S100 (12 GB, J6E, 80 TOPS) o RDK S100P (24 GB, J6M, 128 TOPS). No funciona en GPU convencional ni en CPU genérica.
- La carpeta `s100/` solo carga en placas S100 y `s100p/` solo en S100P; un `.hbm` únicamente se carga en su propio tier de SoC.
- Software: versión `sw >= 4.0.5` y un carveout ION ampliado (`hb_switch_ion.sh balanced` seguido de reinicio).
- Instalación del runtime: `conda install -c https://mirrors.ruis.ai/conda -c conda-forge bllm`.
- Memoria: el repositorio completo ocupa 11,8 GB, pero el despliegue solo requiere la carpeta de la variante elegida.
- No cabe en GPU de consumo: no existe build para CUDA, ROCm, Metal ni CPU.
- Opciones de despliegue: exclusivamente el runtime BLLM; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: 18,52-18,55 tok/s con contexto de 4096 y 23,04-23,18 tok/s con contexto de 512; TTFT con imagen entre 1,19 s y 1,48 s.
- El autor advierte que las cifras de la build `s100` son tiempos medidos en S100P, no en S100, al no disponer de una placa S100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ruisv/bllm-qwen3.5-0.8b` (este) | 0,8B | 512 o 4096 | `.hbm` para BPU Nash (RDK S100/S100P) | Apache-2.0 | Público en HF, 0 descargas |
| `ruisv/bllm-qwen3.5-2b` | 2B | no disponible | `.hbm` para BPU Nash | no disponible | Público en HF |
| `ruisv/bllm-qwen3.5-4b` | 4B | no disponible | `.hbm` para BPU Nash | no disponible | Público en HF |
| `Qwen/Qwen3.5-0.8B` | 0,8B | no disponible | safetensors, `transformers` | Apache-2.0 | Público en HF |

La comparación más directa es con el modelo base sin compilar: misma arquitectura y licencia, pero aquel es un checkpoint estándar que requiere `transformers` y una GPU o CPU, mientras que este solo se ejecuta en la BPU de las placas D-Robotics. Los hermanos de 2B y 4B de la misma familia ofrecen más capacidad a cambio de mayor huella de memoria, presumiblemente con menor throughput, aunque no se dispone de sus cifras.

## Limitaciones y advertencias

- No es un checkpoint de `transformers`: no se puede cargar con `AutoModel` ni usar con las herramientas habituales del ecosistema Hugging Face; la página no tiene widget de Inference API.
- Solo funciona en dos placas concretas (RDK S100 y S100P); una carpeta equivocada no carga.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Contexto máximo de 4096 tokens, y de solo 512 en la variante rápida, lo que restringe conversaciones largas y documentos extensos.
- Resolución de imagen fija en bucket de 320 px y 100 tokens por imagen, insuficiente para tareas que requieran detalle fino (OCR de documentos densos, lectura de matrículas, etc.).
- Cuantización agresiva (int8/int16) con calibración data-free: cabe esperar degradación frente al modelo base en tareas sensibles a la precisión numérica, aunque el autor reporta perplejidades de 83,09 y 83,60 sin comparación con el original.
- Riesgo de alucinación inherente a un modelo de 0,8B; no se han publicado evaluaciones de veracidad ni de sesgos.
- La build `s100` no se ha verificado en una placa S100 real; sus cifras de rendimiento son extrapolaciones medidas en S100P.
- Aunque la licencia Apache-2.0 permite uso comercial, la dependencia del runtime BLLM y de hardware D-Robotics condiciona la viabilidad en producción.
- Repositorio con 0 descargas y 0 likes: sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruisv/bllm-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Runtime BLLM: https://github.com/ruisv/bllm
- Método de compilación y datos de aceptación: https://github.com/ruisv/bllm-model-zoo
- Hermano de 2B: https://huggingface.co/ruisv/bllm-qwen3.5-2b
- Hermano de 4B: https://huggingface.co/ruisv/bllm-qwen3.5-4b
