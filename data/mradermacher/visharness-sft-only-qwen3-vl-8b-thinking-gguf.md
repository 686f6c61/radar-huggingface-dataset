# mradermacher/VisHarness-SFT-Only-Qwen3-VL-8B-Thinking-GGUF

## Resumen

VisHarness-SFT-Only-Qwen3-VL-8B-Thinking es un modelo multimodal de 8.190 millones de parámetros derivado de Qwen3-VL-8B-Thinking mediante ajuste fino supervisado (SFT) sobre el dataset `fyw1999/VisHarness-SFT-Data`. Lo desarrolla el usuario fyw1999 y esta versión concreta es una cuantización estática en formato GGUF publicada por mradermacher, orientada a inferencia local y despliegue en entornos con recursos limitados. El modelo combina visión y lenguaje con un modo de razonamiento explícito ("thinking") y está especializado en tool-use multimodal bajo el paraguas del proyecto VisHarness.

La relevancia de esta ficha reside en que el repositorio original no incluye una model card técnica detallada: la información disponible se limita a los metadatos de Hugging Face y a la model card del cuantizador, que describe los ficheros GGUF y sus tamaños. Por tanto, muchas especificaciones (longitud de contexto, composición del dataset, benchmarks) no están publicadas y se indican como "no disponible" en lugar de inferirse.

Al tratarse de una cuantización GGUF estática de un modelo de 8B, el interés práctico está en la posibilidad de ejecutar un modelo visión-lenguaje con tool calling en hardware de consumo (desde 4-5 GB de VRAM en Q4_K_S) usando llama.cpp u Ollama, a costa de renunciar a los quants con imatrix, que el autor indica que no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3-VL-8B-Thinking; arquitectura del base no detallada en la información proporcionada) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (más proyector multimodal mmproj en GGUF) |

## Arquitectura y entrenamiento

El modelo base es `fyw1999/VisHarness-SFT-Only-Qwen3-VL-8B-Thinking`, un ajuste fino supervisado de Qwen3-VL-8B-Thinking sobre el dataset `fyw1999/VisHarness-SFT-Data`. El sufijo "SFT-Only" indica que el entrenamiento se limita a supervisión (no se documenta una fase posterior de RLHF o DPO en la información disponible), y "Thinking" señala la presencia de un modo de razonamiento explícito heredado del modelo Qwen3-VL subyacente. Los tags del repositorio (`multimodal`, `tool-use`, `visharness`) apuntan a una especialización en uso de herramientas con entrada visual.

La información proporcionada no detalla la composición del dataset de SFT, el número de tokens de entrenamiento ni innovaciones arquitectónicas específicas más allá de las del modelo Qwen3-VL original. Esta versión publicada por mradermacher es una conversión estática a GGUF (conversión tipo `hf`, cuantización de tensores de salida) sin quants ponderados ni imatrix, según indica el propio autor. Se incluye además un proyector multimodal (`mmproj`) en dos precisiones (Q8_0 y f16) necesario para el procesamiento de imágenes en llama.cpp.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" explícito, heredado del modelo Qwen3-VL-8B-Thinking.
- Procesamiento de imágenes (visión-lenguaje) mediante el proyector multimodal mmproj incluido en el repositorio.
- Tool calling / function calling, según los tags `tool-use` del modelo.
- Flujos de agente multimodal orientados al proyecto VisHarness (uso de herramientas sobre entradas visuales).
- Conversación multi-turno (tag `conversational`).
- Capacidades multilingües limitadas al inglés según el campo `language` del repositorio; no se documentan otros idiomas.
- No se documentan capacidades de audio ni otras modalidades distintas de texto e imagen.

## Casos de uso

- Automatización de tareas GUI: el modelo puede interpretar capturas de pantalla y decidir acciones sobre herramientas o interfaces, aprovechando su especialización en tool-use multimodal y su modo de razonamiento.
- Extracción de datos de documentos e imágenes: dado un formulario, factura o tabla escaneada, el modelo puede razonar sobre el contenido visual y devolver campos estructurados mediante llamadas a funciones.
- Agentes de navegación web: con entradas de capturas de página y tool calling, puede encadenar pasos de razonamiento para rellenar formularios o localizar información, ejecutándose en local con llama.cpp.
- Asistentes de soporte con capturas de error: el usuario adjunta una imagen de un fallo y el modelo razona sobre ella y consulta herramientas internas (API de tickets, base de conocimiento) mediante function calling.
- Prototipado e investigación en entornos con GPU de consumo: al existir quants desde Q2_K (3,4 GB) hasta Q8_0 (8,8 GB), permite experimentar con un VLM de 8B en estaciones de trabajo modestas sin infraestructura en la nube.
- Evaluación de pipelines de agentes visuales: sirve como componente de referencia para comparar estrategias de razonamiento y tool-use en tareas de harness visual, dado su origen en el dataset VisHarness-SFT-Data.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en formato GGUF, permite procesar imágenes sensibles sin enviarlas a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar KV cache ni el proyector): aproximadamente 3,4 GB en Q2_K, 4,9-5,1 GB en Q4_K_S/Q4_K_M, 6,8 GB en Q6_K y 8,8 GB en Q8_0. El proyector multimodal añade 0,9 GB (mmproj-Q8_0) o 1,3 GB (mmproj-f16).
- GPU recomendadas: no disponibles de forma específica en la información proporcionada. Por tamaño, un modelo de 8B en Q4 encaja en GPUs de consumo con 8 GB o más de VRAM; los quants Q6_K y Q8_0 requieren 12-16 GB para operar con comodidad.
- Cabe en GPU de consumo: sí, en Q4_K_S/Q4_K_M con GPUs de 8 GB o superiores; los quants Q2_K y Q3 caben en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con soporte mmproj para visión), Ollama y otros runners compatibles con GGUF. El repositorio incluye el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VisHarness-SFT-Only-Qwen3-VL-8B-Thinking (GGUF, este) | 8,19 B | no disponible | apache-2.0 | GGUF + mmproj | SFT especializado en tool-use multimodal; quants estáticos sin imatrix |
| Qwen3-VL-8B-Thinking (modelo base de la familia) | ~8 B | no disponible | no disponible en esta información | safetensors (original) | Modelo generalista visión-lenguaje con modo thinking; sin el ajuste VisHarness |
| Otros VLM de ~8B en GGUF (p. ej. variantes de la familia Qwen2.5-VL) | ~7-8 B | no disponible | no disponible en esta información | GGUF + mmproj | Alternativas generalistas de visión-lenguaje; sin especialización declarada en tool-use |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- La model card original no documenta sesgos conocidos; al entrenarse solo con datos en inglés, el comportamiento en otros idiomas no está garantizado.
- No hay benchmarks publicados, por lo que el rendimiento real frente al modelo base Qwen3-VL-8B-Thinking es desconocido; el ajuste SFT puede degradar capacidades generales no cubiertas por el dataset VisHarness.
- Riesgo de alucinación inherente a los modelos de lenguaje y agravado en tareas visuales cuando la imagen es ambigua o de baja calidad; no se documentan mitigaciones específicas.
- El repositorio de cuantización no incluye quants ponderados ni imatrix; el autor advierte que podrían no publicarse. Los quants de menor precisión (Q2_K, Q3_K_M) degradan la calidad según las notas del propio autor.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de SFT antes de un despliegue en producción.
- El campo `language` solo declara inglés; no se garantiza soporte de castellano ni de otros idiomas.
- El tamaño del repositorio (75,3 GB) incluye todos los quants; descargar solo el fichero necesario para evitar consumo innecesario de disco.
- La fecha de creación del repositorio (2026-10-31) y el reducido número de descargas (356) y likes (0) indican un modelo poco validado por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VisHarness-SFT-Only-Qwen3-VL-8B-Thinking-GGUF
- Modelo base: https://huggingface.co/fyw1999/VisHarness-SFT-Only-Qwen3-VL-8B-Thinking
- Dataset de SFT: https://huggingface.co/datasets/fyw1999/VisHarness-SFT-Data
- Página de descargas del cuantizador: https://hf.tst.eu/model#VisHarness-SFT-Only-Qwen3-VL-8B-Thinking-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
