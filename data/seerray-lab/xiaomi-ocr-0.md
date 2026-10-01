# SeerRay-Lab/Xiaomi-OCR-0

## Resumen

Xiaomi-OCR-0 es un modelo de visión-lenguaje (image-text-to-text) de 873.438.784 parámetros (aproximadamente 0,87B) especializado en dos tareas complementarias: el parseo de documentos y la comprensión centrada en OCR. Lo desarrolla SeerRay-Lab, que lo construye a partir del modelo base Qwen3.5-0.8B-Base mediante un entrenamiento progresivo sobre un corpus de aproximadamente 170 millones de muestras de índole OCR (denominado custom-ocr-centric-corpus).

El problema que aborda es doble. Por un lado, el parseo robusto de documentos: recuperar texto, tablas y fórmulas de imágenes escaneadas, deformadas, fotografiadas o recapturadas sin que la calidad se degrade. Por otro, la comprensión sobre OCR, es decir, no limitarse a transcribir, sino responder preguntas sobre el contenido del documento y extraer campos estructurados (key information extraction). La model card insiste en que un único modelo compacto cubre ambos frentes, en lugar de encadenar un OCR y un modelo de lenguaje separado.

Su relevancia actual se apoya en la eficiencia de parámetros. Con 0,8B supera, según las tablas publicadas por el autor, a modelos de OCR especializados de 0,8B a 1,2B en OmniDocBench v1.6, Real5-OmniDocBench y Wild-OmniDocBench, y también a Qwen3.5-2B y Qwen3.5-4B en la media de cinco benchmarks de VQA orientada a OCR, quedando por debajo de Qwen3.5-4B únicamente por poco margen. La licencia Apache-2.0 y su tamaño permiten desplegarlo en hardware modesto. El modelo se publicó el 29 de septiembre de 2026 y se actualizó al día siguiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje multimodal (image-text-to-text) basado en Qwen3.5-0.8B-Base; etiqueta de arquitectura `qwen3_5`. Detalle del vision encoder no disponible |
| Parametros totales | 873.438.784 (aproximadamente 0,87B) |
| Parametros activos | No aplica: no se describe como MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; los pesos se distribuyen en safetensors) |
| Idiomas soportados | No disponible (la model card no declara idiomas; el README se ofrece en inglés y chino simplificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B-Base |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 1,8 GB |
| Dataset de entrenamiento | custom-ocr-centric-corpus (aproximadamente 170M muestras) |
| Metricas declaradas | accuracy, TEDS, CDM |
| Compatibilidad | `endpoints_compatible` (etiqueta del repositorio) |
| Fecha de publicacion | 29 de septiembre de 2026 (actualizado el 30 de septiembre de 2026) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su naturaleza de modelo de visión-lenguaje multimodal construido sobre Qwen3.5-0.8B-Base, con pipeline `image-text-to-text`. El autor no especifica el número de capas, la dimensión del encoder visual ni el mecanismo de proyección entre visión y lenguaje, por lo que cualquier afirmación al respecto sería especulativa.

El entrenamiento se describe como una receta progresiva en tres etapas sobre un corpus OCR de aproximadamente 170 millones de muestras:

1. Q-Mask text anchoring: alineación de texto fino con su localización en la imagen.
2. Pretrenamiento continuado centrado en OCR (CPT): construcción de capacidad multitarea amplia.
3. Aprendizaje por refuerzo multitarea (Mix-RL): uso de recompensas verificables sobre ejemplos difíciles.

El motor de datos es probablemente el elemento más singular. Las anotaciones de texto, tablas y fórmulas se generan mediante un pool heterogéneo de modelos expertos que, según el informe técnico, incluye PaddleOCR-VL-1.6, MinerU2.5-Pro, GLM-OCR, dots.mocr, HunyuanOCR-1.5, TeleOCR, OvisOCR2 y Qianfan-OCR. Sobre ese pool se aplica Ensemble Triplet Consensus (ETC), que ordena los candidatos por acuerdo global, selecciona un subconjunto de consenso de tres expertos y deriva los casos inciertos a refinamiento. Cuando los expertos discrepan, se recurre a Render-Guided Refine-and-Judge: la anotación candidata se vuelve a renderizar como imagen y se compara con la región original, lo que facilita detectar errores estructurales en tablas y fórmulas. La selección final de muestras combina acuerdo entre expertos, autoconsistencia del modelo, agrupamiento semántico y patrones de fallo verificados, con dos vías de síntesis: por cobertura (estructuras, estilos, glifos y dominios infrarrepresentados) y por fallo (errores recurrentes durante el entrenamiento). La información disponible menciona además una comparación entre Mix-RL y MOPD (un profesor de parseo y otro de comprensión), pero el texto de la model card está truncado en ese punto y no permite reproducir las conclusiones completas.

## Capacidades

- Generación de texto a partir de imágenes: transcripción de documentos con salida estructurada.
- Parseo de documentos: recuperación de texto, tablas y fórmulas, con robustez declarada ante documentos escaneados, deformados, fotografiados, inclinados o recapturados.
- Comprensión sobre OCR (OCR-centric understanding): respuesta a preguntas sobre el contenido de un documento, no solo transcripción.
- Extracción de información clave (KIE): extracción de campos estructurados a partir de documentos.
- Visual question answering documental: evaluación declarada en DocVQA, InfoVQA, ChartQA, OCRBench y TextVQA.
- Conversacional: la etiqueta `conversational` figura en el repositorio, lo que apunta a interacción multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue directo en Hugging Face Inference Endpoints.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible; la model card no declara lista de idiomas.
- Modo de razonamiento explícito (thinking), audio o vídeo: no disponible en la información proporcionada.

## Casos de uso

- Digitalización masiva de archivos históricos o administrativos: el modelo está entrenado explícitamente para mantener el rendimiento en documentos escaneados, deformados o fotografiados, de modo que puede alimentar un pipeline de conversión a texto sin necesidad de un preprocesado geométrico agresivo.
- Extracción de campos en facturas, albaranes y formularios: al soportar KIE, permite definir un esquema de salida y obtener campos como fecha, emisor, base imponible o número de referencia directamente desde la imagen, integrándose en un ERP o en un sistema de cuentas a pagar.
- Ingesta documental para RAG: la salida de parseo con tablas y fórmulas preservadas sirve como etapa previa a un índice vectorial, de forma que el recuperador trabaja sobre contenido estructurado en lugar de texto plano degradado.
- Atención al cliente sobre documentación contractual: con la etiqueta `conversational` y la capacidad de VQA, puede resolver preguntas del tipo "¿cuál es la fecha de vencimiento de esta póliza?" sobre un PDF aportado por el usuario.
- Análisis de literatura científica y documentación financiera: la combinación de parseo de fórmulas y de tablas con VQA sobre gráficos (ChartQA) lo hace apto para extraer métricas de tablas y describir gráficos en informes.
- Despliegue en el borde o en infraestructura propia con datos sensibles: con 0,87B de parámetros, el modelo puede ejecutarse en una GPU de gama media o incluso en CPU, lo que permite procesar documentos médicos, jurídicos o financieros sin enviarlos a un servicio externo.
- Auditoría y control de calidad documental: al devolver la transcripción junto con la localización del texto (gracias al anclaje Q-Mask), puede usarse para contrastar documentos escaneados con su versión digital y señalar discrepancias.
- Automatización de back office en portales de administración: extracción de datos de solicitudes y justificantes adjuntos, con validación posterior por reglas de negocio.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. En la tabla de parseo, las tres columnas son puntuación Overall; "—" indica que la tabla de origen no lo reporta.

| Modelo | Tamano | OmniDocBench v1.6 (mayor mejor) | Real5 (mayor mejor) | Wild (mayor mejor) |
|:--|--:|--:|--:|--:|
| Xiaomi-OCR-0 | 0,8B | 96,83 | 95,24 | 87,94 |
| TeleOCR | 1,2B | 96,87 | — | 88,53 |
| OvisOCR2 | 0,8B | 96,58 | 92,29 | 87,91 |
| PaddleOCR-VL-1.6 | 0,9B | 96,33 | 93,19 | 87,36 |
| MinerU2.5-Pro | 1,2B | 95,75 | 88,94 | 87,33 |
| GLM-OCR | 0,9B | 95,22 | 90,32 | 85,08 |

| Modelo | Tamano | DocVQA | InfoVQA | ChartQA | OCRBench | TextVQA | Media |
|:--|--:|--:|--:|--:|--:|--:|--:|
| Xiaomi-OCR-0 | 0,8B | 93,1 | 75,1 | 84,6 | 84,6 | 78,6 | 83,2 |
| Qwen3.5-0.8B | 0,8B | 88,5 | 60,3 | 69,5 | 77,9 | 68,3 | 72,9 |
| Qwen3.5-2B | 2B | 92,4 | 72,4 | 77,0 | 85,9 | 76,9 | 80,9 |
| Qwen3.5-4B | 4B | 94,4 | 80,4 | 82,4 | 86,6 | 80,8 | 84,9 |
| MiniCPM-V-4.5 | 8B | 84,9 | 69,6 | 87,4 | 89,0 | 82,2 | 82,6 |

La media de la segunda tabla es la media aritmética de los cinco benchmarks en escala 0-100. El autor advierte de que la negrita en sus tablas solo marca Xiaomi-OCR-0 y no implica necesariamente el mejor valor de la columna; de hecho, TeleOCR supera a Xiaomi-OCR-0 en OmniDocBench v1.6 y en Wild, y Qwen3.5-2B lo supera en OCRBench.

Las métricas declaradas en el repositorio (accuracy, TEDS, CDM) no se acompañan de valores numéricos desglosados en la información disponible.

## Requisitos de hardware

No se publican requisitos oficiales de hardware, latencias ni throughput. Las cifras siguientes son estimaciones derivadas del número de parámetros y deben tratarse como orientativas:

- Pesos en bf16/fp16: aproximadamente 1,75 GB solo para los pesos, más el encoder visual y la caché KV. El repositorio completo ocupa 1,8 GB.
- VRAM estimada para inferencia en bf16: del orden de 3-4 GB, dependiendo de la resolución de imagen y de la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 1-1,5 GB. No obstante, el autor no publica pesos cuantizados, por lo que habría que generar versiones GGUF o AWQ por cuenta propia.
- GPU consumer: por tamaño, cabe con holgura en cualquier GPU con 8 GB o más (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090). En tarjetas con 4-6 GB requeriría cuantización.
- GPU de centro de datos: A100, H100, L40S o similares quedan muy por encima del mínimo necesario; su uso tendría sentido solo para agregar muchas peticiones concurrentes, no por memoria.
- CPU: el tamaño hace plausible la inferencia en CPU, aunque no hay confirmación de soporte ni cifras publicadas.
- Opciones de despliegue: la vía confirmada es transformers con pesos safetensors, y la etiqueta `endpoints_compatible` apunta a Hugging Face Inference Endpoints. El soporte en vLLM, TGI, SGLang, llama.cpp u Ollama no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | OmniDocBench v1.6 | Real5 | Wild | Media VQA OCR | Licencia |
|:--|--:|--:|--:|--:|--:|:--|
| Xiaomi-OCR-0 | 0,87B | 96,83 | 95,24 | 87,94 | 83,2 | Apache-2.0 |
| OvisOCR2 | 0,8B | 96,58 | 92,29 | 87,91 | no disponible | no disponible |
| PaddleOCR-VL-1.6 | 0,9B | 96,33 | 93,19 | 87,36 | no disponible | no disponible |
| GLM-OCR | 0,9B | 95,22 | 90,32 | 85,08 | no disponible | no disponible |
| MinerU2.5-Pro | 1,2B | 95,75 | 88,94 | 87,33 | no disponible | no disponible |
| TeleOCR | 1,2B | 96,87 | no disponible | 88,53 | no disponible | no disponible |
| Qwen3.5-0.8B | 0,8B | no disponible | no disponible | no disponible | 72,9 | no disponible |
| Qwen3.5-2B | 2B | no disponible | no disponible | no disponible | 80,9 | no disponible |
| Qwen3.5-4B | 4B | no disponible | no disponible | no disponible | 84,9 | no disponible |
| MiniCPM-V-4.5 | 8B | no disponible | no disponible | no disponible | 82,6 | no disponible |

La comparativa se apoya exclusivamente en las tablas de la model card. Solo se conoce la licencia de Xiaomi-OCR-0; para el resto de modelos habría que consultar sus propias fichas. La longitud de contexto de ninguno de los modelos comparados está disponible en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación en extracción de campos: en tareas de KIE y VQA sobre documentos, el modelo puede generar valores plausibles que no aparecen en la imagen, especialmente en documentos de baja calidad o con campos poco legibles. Es imprescindible validar las extracciones críticas con reglas o revisión humana.
- Sesgo de destilación heredado del motor de datos: buena parte de las anotaciones de entrenamiento procede del consenso entre modelos expertos externos. Esto puede trasladar al modelo los sesgos, los formatos de salida y los errores sistemáticos de ese pool, además de limitar su techo de calidad a la del conjunto de profesores.
- Idiomas no declarados: la model card no especifica la cobertura lingüística. No se puede asumir un rendimiento homogéneo en castellano ni en alfabetos no presentes en el corpus de entrenamiento sin una evaluación propia.
- Longitud de contexto desconocida: al no publicarse la ventana de contexto, no se puede garantizar el procesado de documentos extensos en una sola pasada. En producción conviene paginar o trocear y asumir que puede ser necesario un paso de agregación.
- Benchmarks reportados por el propio autor: todas las cifras proceden de la model card y del informe técnico del desarrollador. No se han verificado de forma independiente en la información disponible, y algunas columnas de la comparativa no están reportadas para varios competidores.
- El modelo no es el mejor en todas las métricas que se citan: TeleOCR lo supera en OmniDocBench v1.6 (96,87 frente a 96,83) y en Wild (88,53 frente a 87,94), y Qwen3.5-2B lo supera en OCRBench (85,9 frente a 84,6). La elección debe depender del benchmark relevante para cada caso.
- Licencia: el modelo se distribuye bajo Apache-2.0, lo que en principio permite uso comercial. No obstante, deriva de Qwen3.5-0.8B-Base, cuyos términos deben verificarse de forma independiente, ya que la información disponible no los detalla.
- Nombre y atribución: el modelo se denomina "Xiaomi-OCR-0" pero lo publica SeerRay-Lab. La información disponible no aclara la relación con Xiaomi, por lo que no debe asumirse que se trate de un modelo oficial de esa compañía.
- Documentación incompleta: la model card está truncada en la sección de hallazgos clave, de modo que las conclusiones sobre la comparación entre Mix-RL y MOPD no pueden reproducirse a partir de lo disponible.
- Madurez del despliegue: el repositorio es reciente (septiembre de 2026) y no se documentan integraciones con servidores de inferencia de alto rendimiento, lo que añade trabajo de ingeniería para un despliegue a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeerRay-Lab/Xiaomi-OCR-0
- Repositorio GitHub: https://github.com/SeerRay-Lab/Xiaomi-OCR-0
- Informe técnico en arXiv: https://arxiv.org/abs/2609.36136
- PDF del informe técnico: https://arxiv.org/pdf/2609.36136
- Página de proyecto (Space): https://huggingface.co/spaces/SeerRay-Lab/Xiaomi-OCR-0
- Página estática del proyecto: https://seerray-lab-xiaomi-ocr-0.static.hf.space/index.html
- README en chino simplificado: https://huggingface.co/SeerRay-Lab/Xiaomi-OCR-0/blob/main/README_zh.md
- Organización en GitHub: https://github.com/SeerRay-Lab
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
