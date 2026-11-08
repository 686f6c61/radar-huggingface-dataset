# mradermacher/Open-R1-Video-7B-GGUF

## Resumen

Open-R1-Video-7B es un modelo multimodal de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) desarrollado originalmente por Xiaodong bajo el identificador `Xiaodong/Open-R1-Video-7B`. Esta ficha describe la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo está orientado al razonamiento sobre vídeo y texto, dentro de la estela de la familia R1 de DeepSeek, y se entrenó sobre el conjunto de datos `Xiaodong/open-r1-video-4k`.

La relevancia de esta publicación radica en que traduce un modelo multimodal de investigación a un formato práctico para inferencia local: los cuantizados GGUF van desde Q2_K (3,1 GB) hasta f16 (15,3 GB), además de un proyector multimodal `mmproj-fp16` de 1,5 GB necesario para procesar vídeo. Esto lo convierte en una opción viable para experimentación en una sola GPU de consumo, algo poco habitual en modelos de razonamiento sobre vídeo.

No se dispone de información pública en la documentación proporcionada sobre la longitud de contexto, la licencia del modelo base ni los detalles exactos de su entrenamiento; estos datos se marcan como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal texto-vídeo, base transformer; detalles no publicados en la información disponible) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal mmproj-fp16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizados estáticos); el modelo base se distribuye en safetensors |
| Modelo base | Xiaodong/Open-R1-Video-7B |
| Dataset de entrenamiento | Xiaodong/open-r1-video-4k |
| Tamano del repo | 69,5 GB |
| Descargas | 662 |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo base `Xiaodong/Open-R1-Video-7B` es un modelo multimodal que combina un codificador visual con un modelo de lenguaje de aproximadamente 7,6 mil millones de parámetros, orientado al razonamiento sobre secuencias de vídeo. La información disponible no detalla la arquitectura interna exacta (número de capas, dimensión oculta, mecanismo de atención, tipo de codificador visual) ni el número total de tokens de entrenamiento. El conjunto de datos declarado es `Xiaodong/open-r1-video-4k`, que por su nombre sugiere un corpus de vídeo con anotaciones de razonamiento, pero no se especifica su composición, tamaño ni si se aplicaron etapas de RLHF o DPO.

La innovación principal que se puede inferir del nombre y del ecosistema es la aplicación del paradigma de razonamiento tipo R1 (cadenas de pensamiento largas y explícitas) al dominio del vídeo. La versión aquí descrita es una cuantización estática realizada por mradermacher con `convert_type: hf` y `output_tensor_quantised: 1`; el autor indica que no ha publicado cuantizados ponderados o con imatrix en el momento de la publicación. El proyector multimodal `mmproj-fp16` es imprescindible para la entrada visual y debe cargarse junto con el modelo de lenguaje.

## Capacidades

- Razonamiento multimodal sobre vídeo y texto: el modelo está diseñado para responder preguntas y razonar sobre contenido audiovisual, no solo sobre imágenes estáticas.
- Generación de cadenas de razonamiento explícitas, heredadas del enfoque R1.
- Procesamiento de entrada de vídeo mediante el proyector `mmproj-fp16`, que debe acompañar al cuantizado del modelo de lenguaje.
- Conversación multi-turno en inglés (etiqueta `conversational`).
- Compatibilidad con endpoints y con el ecosistema `transformers` en su versión original; en GGUF, con llama.cpp y derivados.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Análisis de vídeo para investigación: el modelo permite formular preguntas en lenguaje natural sobre secuencias de vídeo y obtener razonamientos paso a paso, útil para prototipos de comprensión temporal de eventos.
- Moderación de contenido audiovisual: se puede usar para describir y razonar sobre escenas de vídeo subido por usuarios, generando justificaciones textuales que faciliten la revisión humana.
- Indexación semántica de archivos de vídeo: generar descripciones y resúmenes razonados que alimenten un motor de búsqueda sobre una videoteca, aprovechando la capacidad de razonamiento del modelo.
- Asistencia en accesibilidad: producir descripciones detalladas y contextualizadas de vídeos para audiencias con discapacidad visual, con la ventaja de que el modelo explica el porqué de sus conclusiones.
- Evaluación de modelos y pipelines: servir como referencia local (en cuantización Q4_K_M o Q5_K_M) para comparar el rendimiento de sistemas de razonamiento sobre vídeo sin depender de APIs externas.
- Docencia y demostraciones: al caber en una GPU de consumo en cuantizaciones Q3 o Q4, permite montar talleres prácticos sobre modelos multimodales de razonamiento en entornos con hardware limitado.
- Investigación sobre cuantización: comparar la degradación de calidad entre Q2_K y f16 en una tarea multimodal concreta, dado que el autor publica toda la escala de cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ~3,1 GB; Q3_K_M ~3,9 GB; IQ4_XS ~4,4 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB. Hay que sumar ~1,5 GB del proyector `mmproj-fp16` y el espacio para la caché KV, que depende del contexto y del número de frames de vídeo.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, una RTX 4070 Ti Super o RTX 4080; para f16, una RTX 4090 (24 GB) o GPUs de centro de datos como A100 o H100.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 con GPUs de 12-16 GB; f16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, llama-cpp-python, KoboldCpp); el modelo base es compatible con `transformers`. No se documenta soporte de vLLM o TGI para esta versión GGUF multimodal.
- Latencia y throughput estimados: no disponibles. El procesamiento de vídeo añade coste por frame y depende del número de frames y de la resolución, que no se especifican en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Open-R1-Video-7B (este, GGUF) | 7,6 B | no disponible | texto + vídeo | no disponible | GGUF |
| Video-R1-7B (mradermacher/Video-R1-7B-GGUF) | ~7 B (no confirmado en la información) | no disponible | texto + vídeo | no disponible | GGUF |
| Qwen2.5-VL-7B | ~7 B | no disponible en esta ficha | texto + imagen + vídeo | no disponible en esta ficha | safetensors, GGUF |
| LLaVA-OneVision-7B | ~7 B | no disponible en esta ficha | texto + imagen + vídeo | no disponible en esta ficha | safetensors, GGUF |

La comparación cuantitativa con alternativas no puede completarse porque la información proporcionada no incluye benchmarks ni especificaciones de contexto de los modelos comparables. La alternativa más directa documentada es `mradermacher/Video-R1-7B-GGUF`, otro cuantizado GGUF de un modelo de razonamiento sobre vídeo de tamaño similar, pero no se dispone de datos para establecer diferencias de rendimiento.

## Limitaciones y advertencias

- La licencia del modelo base no está declarada en la información disponible; antes de un uso comercial es imprescindible verificar la licencia en `Xiaodong/Open-R1-Video-7B`.
- El modelo solo declara soporte de inglés; el rendimiento en castellano no está garantizado ni documentado.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- Riesgo de alucinación inherente a los modelos de razonamiento con cadenas de pensamiento largas: las justificaciones pueden sonar plausibles sin corresponder al contenido real del vídeo.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M para uso rápido.
- El autor no ha publicado cuantizados con imatrix ni ponderados, que suelen ofrecer mejor relación calidad/tamaño en modelos multimodales.
- El procesamiento de vídeo requiere cargar el proyector `mmproj-fp16` por separado; olvidarlo impide la entrada visual.
- El repo ocupa 69,5 GB e incluye todos los cuantizados; conviene descargar solo el archivo necesario.
- No hay información sobre sesgos, datos de entrenamiento ni filtros de seguridad aplicados al modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Open-R1-Video-7B-GGUF
- Modelo base: https://huggingface.co/Xiaodong/Open-R1-Video-7B
- Dataset: https://huggingface.co/datasets/Xiaodong/open-r1-video-4k
- Página de descargas del autor: https://hf.tst.eu/model#Open-R1-Video-7B-GGUF
- Modelo comparable cuantizado: https://huggingface.co/mradermacher/Video-R1-7B-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
