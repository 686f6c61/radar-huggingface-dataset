# nolimit/Inkling-2-Mini-Unbound-ink4060

## Resumen

Inkling-2-Mini-Unbound-ink4060 es una cuantización asimétrica de un solo archivo del modelo multimodal nokeepai/Inkling-2-Mini-Unbound, una variante "uncensored/abliterated" de la familia Inkling-2-Mini. La publica el usuario nolimit y está empaquetada específicamente para el runtime propietario ink4060, orientado a Windows sobre GPUs de consumo de 16 GB (RTX 4060 Ti y RTX 5060 Ti). El modelo base es un transformer con mezcla de expertos (MoE) que procesa entradas de imagen y texto (pipeline image-text-to-text) y está orientado a tareas de código y razonamiento multimodal.

La aportación principal de esta ficha no es un modelo nuevo, sino un artefacto de despliegue: un archivo único de 14.747.503.504 bytes (13,735 GiB) que incluye config.json, tokenizer.json, la torre de visión en BF16 y un drafter DSpark para decodificación especulativa. La cuantización es asimétrica y por capas: el núcleo MoE recurrente (capas 6 a 17, ejecutadas tres veces por token) se guarda en NVFP4 nativo sin pérdida, mientras que las capas MoE externas usan un formato ternario de 3,25 bits por peso y la atención densa se cuantiza a 6 bits.

Es relevante ahora porque demuestra una estrategia de compresión agresiva pero medida (KLD de 0,0216 frente al modelo sin pérdida, Top-1 del 96,90%) que permite ejecutar un MoE multimodal con 156.576 tokens de contexto en una GPU de 16 GB, algo que con pesos BF16 requeriría bastante más VRAM. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas recurrentes ("loop-core", 3x/token), torre de vision y drafter especulativo DSpark (block-8, modulo mtp) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (estructura MoE confirmada, sin cifra publicada) |
| Longitud de contexto | 156.576 tokens (perfil k4v4) / 113.584 tokens (perfil k8v4), sin spill |
| Tipos de cuantizacion | NVFP4 nativo sin perdida (loop-core), NF3_G32_E4M3 3,25 bpw (MoE externo), Q6_G32 (atencion densa + unembed), Q8_G32 (drafter), BF16/FP32 (embed, vision, norms) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Archivo unico propietario `.ik4060` (no safetensors ni GGUF); incluye config.json y tokenizer.json embebidos |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos que combina capas densas y un bloque central recurrente: las capas 6 a 17 se ejecutan tres veces por token (loop-core), mientras que las capas 0 a 5 y 18 a 23 se ejecutan una sola vez. Incluye una torre de visión (image-text-to-text) y un modulo de predicción multi-token (mtp) que actúa como drafter para decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card solo indica que la variante Unbound es "uncensored/abliterated", es decir, con los mecanismos de rechazo eliminados mediante edición de pesos.

La innovación técnica de esta ficha es la cuantización asimétrica por componente, calibrada para minimizar la pérdida donde más importa: el loop-core (ejecutado tres veces por token) se mantiene en NVFP4 nativo con SQNR infinito y coseno 1,000000, mientras que las capas externas aceptan un formato ternario de 3,25 bits por peso (SQNR ≈ 15,8 dB, coseno ≈ 0,987). La atención densa se lleva a 6 bits (SQNR ≈ 33,0 dB) y el drafter a 8 bits (SQNR = 45,8 dB). La pérdida extremo a extremo medida sobre 420 tokens mixtos de código, matemáticas y prosa es KLD = 0,0216 con Top-1 del 96,90% y Top-5 del 100% en el perfil por defecto. El sistema de caché en tres niveles (VRAM, 25% de RAM y hasta 200 GiB de SSD) permite reanudar contextos largos con recargas de 4,9 s a 64K y 9,2 s a 150K.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes y texto como entrada (pipeline image-text-to-text) y produce texto.
- Codificación: el autor etiqueta el modelo como "coding" y las pruebas de pérdida usan mezclas de código, matemáticas y prosa.
- Decodificación especulativa integrada mediante el drafter DSpark block-8, activable o desactivable en el runtime.
- Contexto largo: hasta 156.576 tokens con el perfil k4v4 y 113.584 con k8v4, sin spill a memoria del sistema en las pruebas del autor.
- Visión con coste de VRAM permanente de 0 MiB (codificación en caliente de ~200 ms).
- Caché persistente en tres niveles (VRAM, RAM, SSD) para reanudar conversaciones o documentos largos.
- Variante "uncensored/abliterated": no aplica rechazos aprendidos, lo que cambia el perfil de comportamiento frente al modelo original.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre GPU de consumo: un desarrollador con una RTX 4060 Ti de 16 GB puede ejecutar el modelo en Windows con el runtime ink4060 y usarlo para autocompletado, explicación y refactorización, aprovechando los 53-62 tok/s en decodificación con textos cortos de código.
- Análisis de repositorios y documentos largos: con 156.576 tokens de contexto y caché en SSD, se puede cargar un árbol de proyecto o un informe extenso y hacer preguntas multi-turno sin recargar el contexto completo.
- Procesamiento de capturas y diagramas: la torre de visión permite pasar pantallazos de interfaces, diagramas de arquitectura o gráficos y obtener descripciones o código a partir de ellos, con un coste de VRAM permanente nulo.
- Extracción de información de documentos escaneados en local: al no requerir conexión ni enviar datos a la nube, encaja en flujos con requisitos de confidencialidad, siempre que se acepte el perfil "uncensored" del modelo.
- Prototipado de agentes con contexto largo: la combinación de decodificación especulativa y caché de tres niveles permite sesiones de razonamiento de varios pasos sobre 100K-150K tokens con 28,6 tok/s a 150K, suficiente para tareas interactivas no críticas.
- Evaluación de técnicas de cuantización: investigadores pueden comparar los perfiles k4v4 y k8v4 (KLD 0,0216 frente a 0,0138) sobre el mismo modelo base para estudiar el impacto de la compresión asimétrica en tareas multimodales.
- Despliegue en estaciones de trabajo Windows sin Linux: el runtime está empaquetado como ZIP de ~5,7 MiB con start.bat, lo que reduce la fricción para equipos que no pueden migrar a Linux ni a contenedores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad de cuantización y de rendimiento del runtime:

| Metrica | Perfil k4v4 (por defecto) | Perfil k8v4 (opcional) |
|---|---|---|
| KLD vs modelo sin perdida | 0,0216 | 0,0138 |
| Top-1 agreement | 96,90% | 97,38% |
| Top-5 agreement | 100,00% | 100,00% |
| Contexto maximo | 156.576 tokens | 113.584 tokens |

| Metrica de runtime (RTX 4060 Ti 16 GB, Windows WDDM) | Valor |
|---|---|
| Prefill, chunk=1024, 2K | 1.956 tok/s |
| Prefill, 16K | 1.810 tok/s |
| Prefill, 64K | 1.497 tok/s |
| Prefill, 100K | 1.316 tok/s |
| Prefill, 150K | 1.136 tok/s |
| Decode, DSpark ON, codigo corto | 53-62 tok/s |
| Decode, contexto caliente 16K-64K | 46-55 tok/s |
| Decode a 150K | 28,6 tok/s (EXACT PASS) |
| Recarga de cache a 64K | 4,9 s |
| Recarga de cache a 150K | 9,2 s |

## Requisitos de hardware

- VRAM: el archivo ocupa 13,735 GiB; el autor lo valida en GPUs de 16 GB con contexto de 156K sin spill. Los pesos en VRAM suman aproximadamente 12,185 GiB (6,407 + 4,627 + 0,836 + 0,315), y el resto (embed, visión, norms) reside en RAM del sistema o se carga de forma perezosa.
- GPU recomendadas: RTX 4060 Ti 16 GB (sm_89), probada en hardware físico; RTX 5060 Ti 16 GB (sm_120a con NVFP4 nativo), solo compilada y no probada en hardware real, marcada como experimental. Para esta última existe la variable INK4060_DISABLE_SM120_FP4=1 para volver a Tensor Cores BF16.
- GPU de consumo: sí, en las dos tarjetas de 16 GB mencionadas. No se documenta funcionamiento en GPUs de 8 o 12 GB.
- RAM del sistema: se reserva hasta un 25% para el nivel intermedio de caché; además, ~1,525 GiB de componentes (embed, visión, norms) viven en RAM de host.
- Almacenamiento: hasta 200 GiB de SSD para el tercer nivel de caché.
- Opciones de despliegue: exclusivamente el runtime ink4060 (ZIP ink4060-v1.0.0-win-x64, ~5,7 MiB, Windows x64). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario .ik4060.
- Latencia y throughput: prefill de 1.136 a 1.956 tok/s según longitud; decodificación de 28,6 a 62 tok/s según contexto y activación de DSpark; codificación de visión en ~200 ms en caliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound-ink4060 | no disponible (MoE) | 156.576 tok | .ik4060, runtime ink4060 en Windows | Apache 2.0 | Cuantizacion asimetrica NVFP4/NF3/Q6/Q8, drafter DSpark, probado en RTX 4060 Ti 16 GB |
| nokeepai/Inkling-2-Mini-Unbound (base) | no disponible (MoE) | no disponible | safetensors (presumible) | Apache 2.0 | Modelo sin cuantizar; sin metricas de rendimiento publicadas en la informacion disponible |
| Alternativas de 16 GB para codigo multimodal | no disponible | no disponible | GGUF / safetensors | variable | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría; los datos de rendimiento publicados corresponden únicamente a este artefacto sobre una RTX 4060 Ti 16 GB.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": se han eliminado los mecanismos de rechazo del modelo original, por lo que puede generar contenido que el modelo base rechazaría. Requiere filtros y políticas de uso propias en cualquier despliegue.
- Sesgos: no hay documentación sobre sesgos en la información disponible; al derivar de un modelo base sin datos de evaluación publicados, no puede descartarse un comportamiento sesgado en idiomas y dominios poco representados.
- Alucinación: sin benchmarks estándar publicados, no es posible cuantificar la tasa de alucinación; la pérdida de cuantización (Top-1 del 96,90%) implica que aproximadamente 3 de cada 100 tokens muestreados difieren del modelo sin pérdida.
- Idiomas: no se especifican los idiomas soportados; el uso en castellano no está validado.
- Formato propietario: el archivo .ik4060 solo se carga con el runtime ink4060, disponible únicamente para Windows x64. No hay interoperabilidad con vLLM, llama.cpp, Ollama o TGI, lo que limita el despliegue en servidores Linux y en pipelines en contenedores.
- Soporte de hardware parcial: la RTX 5060 Ti 16 GB está marcada como experimental y no probada en hardware físico; el fallback a BF16 puede alterar el rendimiento y el consumo de VRAM.
- Requisitos de almacenamiento: el tercer nivel de caché puede ocupar hasta 200 GiB de SSD, lo que es un requisito operativo relevante.
- Licencia Apache 2.0: permite uso comercial, pero el autor recomienda uso responsable; la licencia del modelo base es la misma, por lo que no hay restricciones adicionales documentadas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el runtime es un proyecto personal (lzsnolimit/ink4060); conviene tratarlo como experimental en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nolimit/Inkling-2-Mini-Unbound-ink4060
- Modelo base: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Runtime ink4060 (repositorio): https://github.com/lzsnolimit/ink4060
- Releases del runtime (ZIP Windows x64): https://github.com/lzsnolimit/ink4060/releases
- Mirror de descarga alternativo: https://hf-mirror.com
