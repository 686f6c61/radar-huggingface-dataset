# chenyumo/MoziAier-27B-TQ

## Resumen

MoziAier 27B-TQ es un modelo de lenguaje denso de 27.320.697.856 parámetros (unos 27B) publicado por el usuario chenyumo en Hugging Face, derivado por cuantización del modelo base Qwen/Qwen3.8-27B. Su rasgo diferencial es el uso de cuantización ternaria: los pesos principales se comprimen a valores {-1, 0, +1} mediante un contenedor propietario denominado PTQ1.0, lo que reduce el archivo de pesos a 6,98 GiB y permite ejecutar un contexto de hasta 256K tokens en una GPU de 16 GB. Se distribuye en formato GGUF y está pensado para su uso con una compilación específica de llama.cpp que soporta el tipo ternario (la versión oficial no lo soporta).

El modelo incorpora además un proyector visual mmproj en Q8_0 (600 MB) para entrada de imágenes, soporte declarado de tool calling y una capa MTP (multi-token prediction) que, según la model card, ofrece decodificación especulativa con un incremento medido del 29,4 % en velocidad de generación (de 47,3 a 61,2 tok/s, con tasa de aceptación del 57,19 %). El autor describe un esquema de razonamiento estructurado propio ("siete dimensiones de pensamiento") y un bucle de agente con criterios de salida, presentados como incrementos originales sobre el modelo base.

Es relevante ahora porque ocupa un nicho poco cubierto: contexto muy largo y capacidades multimodales en hardware de consumo, a costa de una pérdida de precisión difícil de cuantificar sin benchmarks independientes. La información disponible procede casi exclusivamente de la model card del autor y no incluye evaluaciones en MMLU, HumanEval, GSM8K ni comparaciones con modelos de referencia, por lo que las cifras de rendimiento deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B), 65 capas incluyendo capa MTP, atención GQA con 24 cabezas y 4 cabezas KV, dimensión oculta 5.120, FFN 17.408 |
| Parametros totales | 27.320.697.856 (27B, denso) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Máximo 256K (262.144 tokens); 128K recomendado por defecto |
| Tipos de cuantizacion | Ternaria {-1, 0, +1} en contenedor PTQ1.0 (GGUF type 143); KV cache en q4_0; proyector visual en Q8_0; capa MTP en Q5_0 |
| Idiomas soportados | Chino (zh) e inglés (en), con prioridad declarada para chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama-cpp); pesos originales en safetensors según metadatos de Hugging Face |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso heredado de Qwen3.8-27B, con 65 capas (una de ellas la capa MTP), atención con grouped-query attention (24 cabezas de consulta y 4 de clave/valor), dimensión oculta de 5.120 y FFN de 17.408. No es un modelo MoE ni híbrido SSM: es un transformer denso convencional sobre el que se aplica una cuantización post-entrenamiento ternaria. El autor no documenta el proceso de entrenamiento original (número de tokens, composición del dataset, fases de RLHF o DPO), que corresponde al modelo base Qwen3.8-27B y no se detalla en la información disponible.

La innovación técnica principal es el contenedor de cuantización PTQ1.0, que empaqueta los pesos en valores ternarios y reduce el tamaño a 6,98 GiB. Se complementa con una capa MTP conservada en Q5_0 (278 MB) que actúa como modelo borrador para decodificación especulativa, con un máximo de 2 tokens especulativos por paso (`--spec-draft-n-max 2`). Según la model card, esta es la única variante de la familia MoziAier con ganancia positiva de MTP (+29,4 %); en la variante 9B el mismo mecanismo resulta en una pérdida del 13,7 %. El autor también describe un esquema de salida estructurado en "siete dimensiones" y un bucle de agente, aunque no se aportan detalles sobre cómo se entrenaron o si son instrucciones de prompt más que comportamiento aprendido.

## Capacidades

- Generación de texto conversacional en chino e inglés, con prioridad declarada para el chino.
- Razonamiento estructurado mediante un esquema propio de "siete dimensiones" (comprensión de la tarea, evaluación de complejidad, dependencias, riesgos, recursos, criterios de aceptación y estrategia de ejecución), con expansión variable según la dificultad estimada.
- Bucle de agente ("Agent LOOP") con fases de ejecución, evaluación, ajuste y verificación, y reglas de salida para evitar bucles infinitos.
- Tool calling / function calling: el autor indica que el modelo emite un formato de llamada a herramientas parseable por frameworks de agentes.
- Entrada de imágenes mediante proyector mmproj Q8_0 (600 MB), orientada a preguntas sobre capturas de pantalla, lectura de gráficos y documentos escaneados.
- Contexto largo de hasta 256K tokens para análisis de documentos completos o bases de código medianas.
- Decodificación especulativa MTP con ganancia medida del 29,4 % en throughput.
- Comportamiento declarado de rechazo a la fabricación: responde que no dispone de la información en lugar de inventar datos históricos.
- No se documentan capacidades de audio, vídeo ni ejecución de código nativa.

## Casos de uso

- Análisis de documentos extensos: con 256K tokens de contexto y KV cache cuantizada, el modelo puede procesar contratos completos, informes anuales o libros enteros en una sola pasada sobre una GPU de 16 GB, sin fragmentar el texto en trozos.
- Revisión de bases de código medianas: el contexto de 250K permite cargar varios módulos de un repositorio y hacer preguntas cruzadas sobre dependencias; el soporte de tool calling facilita integrarlo en asistentes de IDE que consulten el sistema de archivos.
- Atención al cliente con contexto acumulado: conversaciones multi-turno largas se benefician del contexto extendido y del bucle de agente para resolver incidencias en varios pasos, con salida estructurada que un sistema externo puede parsear.
- Procesamiento de documentos escaneados y capturas: la entrada visual vía mmproj permite extraer datos de facturas, gráficos o pantallas de aplicación y combinarlos con razonamiento textual en la misma sesión.
- Despliegue local privado en estaciones de trabajo: al caber en 12,89 GB con contexto de 256K, es viable en un equipo con GPU de 16 GB sin enviar datos a la nube, lo que encaja en entornos con requisitos de confidencialidad.
- Agentes automatizados de varios pasos: el bucle de ejecución-evaluación y el formato de tool calling permiten orquestar tareas como recopilar datos, validarlos y generar un informe, con criterios de aceptación por fase.
- Generación de resúmenes y traducción zh-en: el modelo está entrenado principalmente en chino e inglés, por lo que sirve para resumir documentación técnica china o traducirla al inglés en flujos internos.

## Benchmarks y rendimiento

La información disponible no incluye resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MMLU-Pro ni similares). El autor solo publica métricas de velocidad de inferencia medidas en su propio entorno:

| Metrica | Valor | Condiciones |
|---|---|---|
| Throughput con MTP activado | 61,2 tok/s | AMD Radeon AI PRO R9700 (32 GB), ROCm 7.13, contexto 150K |
| Throughput sin MTP | 47,3 tok/s | Mismas condiciones |
| Ganancia de MTP | +29,4 % | Tasa de aceptación 57,19 % |
| Throughput en estado estacionario (tres preguntas) | 58,19 tok/s | MTP activado, contexto 150K |
| Latencia del primer token | ~6,1 s | Contexto 150K |
| Memoria con contexto 256K | ~12,89 GB | KV cache q4_0, flash-attn activado |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 10,0 GB con contexto de 128K, unos 12,89 GB con 256K y unos 9,4 GB con 100K, según las cifras del autor con KV cache en q4_0 y flash-attn activado.
- GPU recomendadas: el autor valida el modelo en una AMD Radeon AI PRO R9700 (32 GB) con ROCm 7.13. Para el objetivo declarado de 250K de contexto basta una GPU de 16 GB; no se especifican modelos concretos de NVIDIA.
- GPU de consumo: cabe en tarjetas de 16 GB o más (por ejemplo, RTX 4080/4090 de 16-24 GB o equivalentes AMD) siempre que se use la compilación ternaria de llama.cpp con soporte flash-attn.
- Opciones de despliegue: llama.cpp con compilación específica para el tipo ternario (linaje Prism, licencia MIT). La versión oficial de llama.cpp no soporta este formato. Se lanza con `llama-server` y expone una API compatible con endpoints en el puerto 8080. No se documenta soporte en vLLM, TGI ni Ollama.
- Parámetros críticos de despliegue: `--parallel 1` (el valor por defecto de 4 divide el contexto entre ranuras), `--cache-type-k q4_0 --cache-type-v q4_0` y `--flash-attn on`; sin flash-attn el kernel ternario no se activa y la salida degenera según el autor.
- Latencia y throughput: primer token en torno a 6,1 s con 150K de contexto; 58-61 tok/s en estado estacionario con MTP en la R9700. No hay datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoziAier 27B-TQ | 27B denso | 256K | Ternaria PTQ1.0 (GGUF) | Apache-2.0 | Hugging Face, ModelScope |
| MoziAier 27B Q4_K_M (misma familia) | 27B denso | 256K | Q4_K_M (13,7 GB) | Apache-2.0 | Según el autor, misma familia |
| MoziAier 9B-TQ (misma familia) | 9B denso | 256K | Ternaria PTQ1.0 | Apache-2.0 | Según el autor, misma familia |
| Qwen3.8-27B (modelo base) | 27B denso | No disponible | safetensors / varias | Apache-2.0 | Hugging Face |

El autor aporta dos comparaciones internas: frente a la variante Q4_K_M del mismo modelo, el tamaño se reduce a la mitad y la decodificación es "varios órdenes de magnitud" más rápida según su medición; frente a la variante 9B-TQ, el 27B triplica parámetros y multiplica por 3,75 el tamaño, pero es la única con ganancia positiva de MTP. No se dispone de comparaciones con modelos de otros desarrolladores (Llama, Mistral, Gemma u otros) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización ternaria introduce una pérdida de precisión no cuantificada: no hay benchmarks de calidad que permitan estimar la degradación frente al modelo base Qwen3.8-27B.
- Requiere una compilación no oficial de llama.cpp; la versión estándar no carga el tipo GGUF 143. Esto complica el mantenimiento, la actualización y el soporte en producción.
- El soporte multilingüe se limita a chino e inglés; no hay evidencia de rendimiento en castellano ni en otras lenguas.
- Riesgo de alucinación inherente a los modelos de 27B, agravado por la cuantización agresiva; el autor afirma un comportamiento de rechazo a inventar datos, pero no aporta evaluación sistemática.
- Las capacidades de razonamiento estructurado y bucle de agente son descritas por el autor sin documentación de entrenamiento; podrían depender del prompt más que de comportamiento aprendido, y no están verificadas de forma independiente.
- El rendimiento declarado (61,2 tok/s, +29,4 % con MTP) se midió únicamente en una AMD Radeon AI PRO R9700 con ROCm 7.13; no es extrapolable a otras GPU ni a CUDA.
- La configuración es sensible: `--parallel` distinto de 1 divide el contexto, y desactivar flash-attn degrada la salida según el autor.
- El repositorio tiene muy poca tracción (470 descargas y 1 like en el momento de la consulta) y un único autor; no hay validación comunitaria ni auditoría de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero se debe respetar el archivo NOTICE de atribución al modelo base y verificar las condiciones heredadas de Qwen3.8-27B.

## Enlaces

- Hugging Face: https://huggingface.co/chenyumo/MoziAier-27B-TQ
- ModelScope: https://modelscope.cn/models/chenyumo/MoziAier-27B-TQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio llama.cpp (compilación ternaria, linaje Prism, MIT): no disponible en la información proporcionada
- Paper técnico: no disponible
- Blog o demo: no disponible
