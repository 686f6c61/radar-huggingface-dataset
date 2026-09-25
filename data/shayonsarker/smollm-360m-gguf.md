# ShayonSarker/SmolLM-360M-GGUF

## Resumen

SmolLM-360M-GGUF es una conversión a formato GGUF del modelo base SmolLM-360M de Hugging Face, publicada por el usuario ShayonSarker. No se trata de un modelo nuevo ni de un ajuste fino: es un empaquetado reproducible para `llama.cpp` de los pesos originales de 361.821.120 parámetros (aproximadamente 362 millones), pensado para ejecución en CPU y en hardware de gama baja sin necesidad de GPU dedicada.

El interés de esta publicación es acotado pero práctico. El autor documenta la conversión con un compromiso de `llama.cpp` fijado (`6b790a9c291b5d7af3312bbf9f0c558aa023b13e`), la revisión del modelo original y una validación con perplejidad sobre WikiText-2 (raw test, 8 fragmentos de 512 tokens), además de una prueba de generación determinista con la cuantización Q4_K_M. Esto permite auditar el efecto de la cuantización con un dato medible, algo que muchas conversiones comunitarias no ofrecen.

Es importante subrayar que se trata de un modelo base, no de un asistente ajustado por instrucciones: no ha pasado por RLHF ni DPO y no está pensado para diálogo directo. Su ventana de contexto es de 2.048 tokens, propia de la familia SmolLM original, no de SmolLM2. La licencia Apache-2.0 y el tamaño reducido lo hacen adecuado para prototipado, experimentación docente y despliegues en el borde, no para tareas de razonamiento complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo Llama (detalle de capas, cabezas y dimension oculta: no disponible en la informacion proporcionada) |
| Parametros totales | 361.821.120 (aproximadamente 362 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | F16 (referencia), Q8_0 y Q4_K_M |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`SmolLM-360M-F16.gguf`, `SmolLM-360M-Q8_0.gguf`, `SmolLM-360M-Q4_K_M.gguf`); no se publican safetensors en este repositorio |

Datos adicionales del repositorio: tamano total de 1,4 GB, etiquetas `transformers`, `gguf`, `llama.cpp`, `text-generation`, `smollm`, `endpoints_compatible`; modelo base declarado `HuggingFaceTB/SmolLM-360M`.

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base SmolLM-360M: un transformer decoder-only autorregresivo con atención causal, tokenizador propio de la familia SmolLM y una ventana de contexto de 2.048 tokens. El repositorio no aporta detalles adicionales sobre número de capas, dimensiones ocultas, uso de grouped-query attention, normalización o estrategia posicional. Tampoco se documenta en esta model card la composición del dataset de entrenamiento ni el número de tokens vistos.

Según la documentación pública de la familia SmolLM de Hugging Face, los modelos de 135 M y 360 M se entrenaron sobre aproximadamente 600.000 millones de tokens procedentes del corpus SmolLM-Corpus (mezcla de FineWeb-Edu, Cosmopedia v2 y Python-Edu). Esa información procede del blog y del repositorio oficial del modelo base, no de esta conversión GGUF, y no se ha podido verificar contra los ficheros de este repositorio.

La innovación de esta publicación no está en el entrenamiento, sino en el proceso de conversión: el script `build_gguf.py` fija tanto el commit de `llama.cpp` como la revisión del modelo upstream, lo que garantiza reproducibilidad bit a bit del pipeline de cuantización, y no sobrescribe ni sube artefactos automáticamente. No hay ajuste por instrucciones, RLHF ni DPO en ninguna fase de este artefacto.

## Capacidades

- Generación de texto por continuación de prefijo (modelo base, sin plantilla de chat ni formato instruct).
- Modelado de lenguaje autoregresivo: sirve para scoring de secuencias y cálculo de perplejidad.
- Generación de código y contenido técnico en la medida en que el corpus original (Python-Edu) lo permite; sin garantías cuantificadas.
- Razonamiento básico y conocimiento del mundo a pequeña escala, limitado por los 362 M de parámetros.
- Ejecución en CPU pura mediante `llama.cpp`, con soporte de GPU opcional por offload de capas.
- Salida determinista verificada al menos para la cuantización Q4_K_M en la prueba de humo del autor.
- Capacidades multilingües: no declaradas ni evaluadas en la información disponible.
- Tool calling, function calling, modo thinking, agentes multi-paso, visión y audio: no soportados ni documentados.

## Casos de uso

- Prototipado de pipelines de inferencia local: permite validar una integración con `llama.cpp`, `llama-cpp-python` o un servidor HTTP compatible con OpenAI antes de migrar a un modelo mayor, gracias a su huella de memoria inferior a 1 GB en F16.
- Despliegue en dispositivos de borde: con la cuantización Q4_K_M el modelo ocupa del orden de 0,25 GB, por lo que cabe en Raspberry Pi, mini-PC, routers con CPU ARM o incluso entornos móviles, sin GPU.
- Generación de texto offline y privada: al ejecutarse íntegramente en local, es apto para continuación de documentos, borradores o resúmenes extractivos en escenarios donde los datos no pueden salir de la máquina.
- Evaluación comparativa de cuantizaciones: sus tres ficheros (F16, Q8_0, Q4_K_M) y la tabla de perplejidad publicada permiten reproducir el impacto de la cuantización sobre la calidad sin necesidad de convertir los pesos uno mismo.
- Filtrado y curación de corpus por perplejidad: al ser un modelo base pequeño y rápido, se puede usar para puntuar perplejidad sobre grandes volúmenes de texto y descartar documentos anómalos o redundantes en un pipeline de preparación de datos.
- Generación de datos sintéticos a baja escala: útil para aumentar datasets de pruebas, generar variaciones de plantillas o crear corpus sintéticos de validación donde la calidad no es crítica.
- Investigación y docencia: es un banco de pruebas asequible para estudiar tokenización, efecto de la temperatura, atención causal o decodificación, con tiempos de iteración de segundos en CPU.
- Punto de partida para ajuste fino: sirve como inicialización para un fine-tuning específico de dominio (clasificación, extracción, estilo) cuando el presupuesto de cómputo es muy reducido.

## Benchmarks y rendimiento

El autor solo publica evaluación de perplejidad sobre WikiText-2 (raw test, 8 fragmentos de 512 tokens). No hay resultados de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra prueba de capacidades en la información disponible.

| Formato | Perplejidad (WikiText-2) | Ratio respecto a F16 |
|---|---:|---:|
| F16 | 14,5685 | Referencia |
| Q8_0 | 14,6009 | 1,0022 |
| Q4_K_M | 14,8333 | 1,0182 |

Lectura de los datos: la degradación por cuantización es muy contenida. Q8_0 apenas se desvía un 0,22 % en perplejidad respecto a F16 y Q4_K_M un 1,82 %, lo que indica que la cuantización de 4 bits es una opción razonable para este tamaño de modelo. No se han publicado mediciones de latencia ni de throughput. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (cálculo derivado del número de parámetros, excluyendo caché KV y overhead del runtime):
  - F16: aproximadamente 0,69-0,75 GB.
  - Q8_0: aproximadamente 0,37-0,42 GB.
  - Q4_K_M: aproximadamente 0,22-0,28 GB.
- Caché KV: despreciable en la práctica, dado el contexto máximo de 2.048 tokens.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo está muy por debajo de la capacidad de cualquiera de ellas; el offload completo a GPU solo aporta latencia baja, no desbloquea capacidades.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria unificada (Apple Silicon, Intel Iris Xe, AMD APU).
- CPU: funciona sin GPU. Es el escenario principal de este artefacto.
- Opciones de despliegue: `llama.cpp` (CLI y servidor), Ollama, LM Studio, Jan, KoboldCpp, `llama-cpp-python`, contenedores compatibles con la API de OpenAI mediante el servidor de `llama.cpp`. El soporte de GGUF en vLLM y TGI es limitado o experimental; para producción a gran escala lo habitual es convertir a safetensors y usar vLLM.
- Transformers: la etiqueta `transformers` aparece en los metadatos y las versiones recientes permiten cargar GGUF directamente, pero este repositorio no incluye `config.json` ni tokenizador propios; conviene tomar esos ficheros del modelo base `HuggingFaceTB/SmolLM-360M`.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados de sus fichas públicas; el rendimiento en benchmarks no se compara porque no hay cifras verificables en la información proporcionada para este artefacto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| SmolLM-360M (este GGUF, ShayonSarker) | 361,8 M | 2.048 | Apache-2.0 | GGUF (F16, Q8_0, Q4_K_M) |
| SmolLM-360M (original, HuggingFaceTB) | 361,8 M | 2.048 | Apache-2.0 | safetensors, transformers |
| SmolLM2-360M (HuggingFaceTB) | 361,8 M | 8.192 | Apache-2.0 | safetensors y GGUF comunitarios (base e instruct) |
| Qwen2.5-0.5B (Alibaba) | 494 M aprox. | 32.768 | Apache-2.0 | safetensors y GGUF |
| TinyLlama-1.1B ( comunidad) | 1.100 M aprox. | 2.048 | Apache-2.0 | safetensors y GGUF |

Consideraciones: frente a SmolLM2-360M, el salto de contexto (2.048 frente a 8.192 tokens) y la mejora declarada en seguimiento de instrucciones, conocimiento y razonamiento hacen que SmolLM2 sea preferible para casi cualquier uso nuevo. Este artefacto conserva valor si se necesita exactamente la generación SmolLM original, si se busca un binario GGUF con perplejidad de cuantización documentada o si se quiere el mínimo consumo posible manteniendo compatibilidad con el ecosistema `llama.cpp`. Qwen2.5-0.5B ofrece más contexto y una variante instruct, a costa de un 36 % más de parámetros.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responderá correctamente a formatos de chat, system prompts ni instrucciones directas. Para diálogo hay que usar una variante instruct o hacer fine-tuning.
- Riesgo alto de alucinación y de texto incoherente en secuencias largas, propio de un modelo de 362 M de parámetros.
- Sesgos: al derivar de corpus web (FineWeb-Edu, Cosmopedia) hereda los sesgos presentes en ellos. No se documenta ningún proceso de mitigación en este repositorio.
- Sin alineamiento: no ha pasado por RLHF ni DPO, por lo que puede generar contenido tóxico, ofensivo o factualmente erróneo sin filtros.
- Limitación de contexto: 2.048 tokens es insuficiente para documentos largos, conversaciones multi-turno extensas o análisis de código de tamaño medio. Además, la calidad decae dentro de esa ventana.
- Idiomas: no declarados ni evaluados. El comportamiento fuera del inglés no está garantizado y probablemente sea pobre.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la atribución al modelo base y a la conversión; el artefacto se distribuye sin garantías.
- Validación limitada: la única métrica publicada es perplejidad en WikiText-2 con 8 fragmentos de 512 tokens, una muestra pequeña y de un único dominio. No hay evaluación en tareas downstream.
- Adopción nula: 0 descargas y 0 "likes" en el momento de los datos, mantenido por un único autor. No existe validación independiente de la fidelidad de la conversión más allá de lo que declara la propia model card.
- El repositorio no incluye tokenizador ni `config.json`; hay que obtenerlos del modelo base, lo que añade un paso manual y un punto de fallo en el despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ShayonSarker/SmolLM-360M-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-360M
- Repositorio de construcción (build hub): https://github.com/Dadhichi-Sarker-Shayon/SmolLM-360M-GGUF
- Conversión GGUF alternativa (QuantFactory, base): https://huggingface.co/QuantFactory/SmolLM-360M-GGUF
- Conversión GGUF alternativa (QuantFactory, instruct): https://huggingface.co/QuantFactory/SmolLM-360M-Instruct-GGUF
- Repositorio oficial de la familia SmolLM y SmolVLM: https://github.com/huggingface/smollm
- Blog oficial de SmolLM: https://huggingface.co/blog/smollm
- Ficha de SmolLM2-360M-GGUF en Inferix (referencia de la familia): https://inferix.co/models/QuantFactory/SmolLM2-360M-GGUF
- Directorio de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
