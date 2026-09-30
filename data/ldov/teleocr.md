# ldov/TeleOCR

## Resumen

TeleOCR es un modelo de visión-lenguaje (VLM) de código abierto, ligero y especializado en el parseo de documentos. Lo desarrolla el equipo de TeleAI (StarDoc-AI) y esta publicado bajo licencia Apache 2.0. Su particularidad frente a otros sistemas de OCR y *document parsing* es que unifica en un único marco de trabajo dos escenarios que tradicionalmente se han tratado por separado: documentos digitales nativos (PDF con capa de texto) y documentos capturados con cámara (fotografías con perspectiva, curvatura y deformación geométrica). El repositorio analizado aquí, `ldov/TeleOCR`, es una réplica del modelo original publicada por el usuario Rafael (ldov).

El modelo declara en su *model card* un tamaño de aproximadamente 1,2B de parámetros, aunque el recuento real de los pesos en `safetensors` del repositorio es de 1.415.072.768 parámetros (unos 1,42B), cifra que probablemente incluye el codificador visual además del decodificador de lenguaje. La etiqueta de arquitectura del repositorio apunta a `qwen2_5_vl`, es decir, una arquitectura transformer multimodal derivada de Qwen2.5-VL, con pesos en formato `safetensors` y `custom_code` obligatorio para cargarlo con Transformers. El repositorio ocupa 2,8 GB.

Su relevancia actual radica en que ofrece resultados de estado del arte en *benchmarks* públicos de parseo documental (OmniDocBench v1.6, Dr.DocBench) con un coste computacional muy inferior al de los VLM generalistas de gran tamaño, lo que lo hace desplegable en una sola GPU de consumo. Además, el pipeline incluye soporte para `text-generation-inference` y compatibilidad con `endpoints_compatible`, orientado a su uso como servicio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje, etiquetada como `qwen2_5_vl` (Qwen2.5-VL); requiere `custom_code` |
| Parámetros totales | 1.415.072.768 (~1,42B) según `safetensors`; la *model card* declara ~1,2B |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información del repositorio; existe una conversión GGUF de la comunidad para la versión previa NaviDC-OCR |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (repositorio de 2,8 GB) |
| Pipeline declarado | `image-text-to-text` |
| Fecha de publicación del repositorio | 29 de septiembre de 2026 |

## Arquitectura y entrenamiento

TeleOCR es un modelo multimodal de tipo *image-text-to-text* construido sobre una arquitectura transformer con codificador visual y decodificador de lenguaje, etiquetada en el repositorio como `qwen2_5_vl`, lo que lo emparenta directamente con la familia Qwen2.5-VL. El modelo consume una imagen de documento y produce una secuencia de texto estructurado (contenido, orden de lectura, tablas y fórmulas), sin necesidad de un modelo de rectificación previo: en los conjuntos DocUNet y DIR300 el modelo realiza el análisis de *layout* y contenido directamente sobre documentos deformados, sin *dewarping*.

El entrenamiento se describe como un pipeline progresivo de cuatro etapas. Entre las innovaciones metodológicas que la *model card* enumera destacan: Multi-node Consensus Voting (MCV) para la generación automática de pseudo-etiquetas; modelado geométricamente consciente para documentos capturados con cámara; muestreo Curvature-Guided Douglas-Peucker (CGDP) para manejar la curvatura del papel; autoverificación imagen-a-imagen para el refinado automático de datos; y Content-Structure Decoupled Learning, que separa el aprendizaje del contenido y de la estructura en tablas y fórmulas. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del *dataset* ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Parseo de documentos digitales y capturados con cámara dentro de un mismo modelo, incluyendo documentos con perspectiva, curvatura y deformación geométrica.
- Reconocimiento óptico de caracteres (OCR) y extracción de texto con orden de lectura correcto.
- Análisis de *layout*: detección y segmentación de bloques de contenido en la página.
- Reconocimiento y reconstrucción de tablas, con métricas específicas de estructura (TEDS y TEDS-S reportadas en OmniDocBench).
- Reconocimiento y transcripción de fórmulas matemáticas, evaluado mediante CDM (Content Distance Metric).
- Interacción conversacional multimodal (`conversational`), lo que permite diálogo multi-turno sobre una o varias imágenes.
- Salida en formato texto estructurado apto para consumo por otros sistemas.
- Capacidades multilingües limitadas a chino e inglés.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de audio o vídeo: no disponible en la información proporcionada.

## Casos de uso

- Digitalización masiva de archivos digitales: el modelo convierte lotes de PDF e imágenes de documentos nativos en texto estructurado, con métricas de edición de texto de 0,027 en OmniDocBench v1.6, lo que reduce la necesidad de corrección manual posterior.
- Captura de documentos con teléfono móvil para digitalización en campo: al no requerir *dewarping* ni un modelo de rectificación previo, es adecuado para escenarios donde el usuario fotografía facturas, albaranes o formularios en condiciones no controladas.
- Extracción de tablas a estructuras de datos: con un TEDS de 97,05 en OmniDocBench, es apropiado para convertir tablas de informes financieros o técnicos en HTML o Markdown y volcarlas a bases de datos.
- Conversión de fórmulas a LaTeX: útil en entornos académicos y editoriales para digitalizar artículos científicos y material docente sin retipear expresiones matemáticas.
- Alimentación de pipelines RAG: el texto estructurado que produce sirve como entrada para la indexación y la recuperación semántica sobre corpus documentales técnicos, normativos o legales.
- Digitalización de documentación técnica en mantenimiento industrial: el operario fotografía manuales o esquemas en planta y el modelo devuelve contenido estructurado, incluidos tablas de repuestos y fórmulas, sin necesidad de equipos de digitalización dedicados.
- Procesamiento de formularios y documentos administrativos: extracción de campos y bloques de texto en flujos de gestión documental con idioma chino o inglés.
- Aplicaciones conversacionales de consulta documental: gracias a su naturaleza `conversational` y al pipeline `image-text-to-text`, permite preguntar sobre el contenido de una imagen de documento en varios turnos.

## Benchmarks y rendimiento

Resultados en OmniDocBench v1.6 (métricas: Overall y valores de edición; mayor es mejor en Overall, CDM y TEDS; menor es mejor en las métricas de edición):

| Tipo | Método | Parámetros | Overall ↑ | Text Edit ↓ | Formula CDM ↑ | Table TEDS ↑ | Table TEDS-S ↑ | Read Order Edit ↓ |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| VLM especializado | TeleOCR | 1,2B | 96,87 | 0,027 | 96,36 | 97,05 | 98,52 | 0,122 |
| VLM especializado | OvisOCR2 | 0,8B | 96,58 | 0,025 | 97,53 | 94,76 | 97,16 | 0,111 |
| VLM especializado | PaddleOCR-VL-1.6 | 0,9B | 96,33 | 0,033 | 97,49 | 94,76 | 97,11 | 0,127 |
| VLM especializado | MinerU2.5-Pro | 1,2B | 95,75 | 0,036 | 97,45 | 93,42 | 95,92 | 0,120 |
| VLM especializado | GLM-OCR | 0,9B | 95,22 | 0,044 | 97,18 | 92,83 | 95,39 | 0,133 |
| VLM especializado | PaddleOCR-VL-1.5 | 0,9B | 94,87 | 0,038 | 96,69 | 91,67 | 94,37 | 0,130 |
| VLM especializado | HunyuanOCR-1.5 | 1B | 94,74 | 0,033 | 97,49 | 94,76 | 97,1 | (dato truncado en la fuente) |

Resultados en el Dr.DocBench Challenge (EMNLP 2026):

| Modelo | Overall ↑ | Text edit ↓ | Formula CDM ↑ | Table TEDS ↑ | Order edit ↓ |
|---|---:|---:|---:|---:|---:|
| TeleOCR | 67,96 | 0,1903 | 0,02 | 64,97 | 0,398 |
| MinerU 2.5 Pro | 62,26 | 0,3402 | 0,04 | 67,75 | 0,356 |
| OvisOCR2 | 59,25 | 0,3883 | 0,00 | 61,59 | 0,3791 |
| PaddleOCR-VL 1.6 | 55,11 | 0,4364 | 0,21 | 51,34 | 0,412 |

Además, la *model card* reporta evaluaciones visuales cualitativas sobre los conjuntos de *dewarping* DocUNet y DIR300, sin cifras numéricas publicadas en la información disponible.

## Requisitos de hardware

- Los pesos en `safetensors` ocupan 2,8 GB en el repositorio, lo que corresponde a una representación en bf16/fp16 de los ~1,42B de parámetros.
- VRAM estimada para inferencia en bf16: en torno a 3,5-5 GB, sumando pesos, *activaciones* y caché KV para imágenes de resolución alta. Se recomienda reservar al menos 6-8 GB para operar con margen.
- VRAM estimada en cuantización INT8: aproximadamente 1,5-2,5 GB. En INT4: aproximadamente 0,8-1,5 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. Con cuantización GGUF de 4 bits podría ejecutarse en GPUs de 6-8 GB o incluso en CPU.
- GPU de centro de datos: A100, H100 y L40S lo ejecutan con holgura y permiten lotes grandes; el modelo es lo bastante pequeño como para servir muchas instancias por GPU.
- Opciones de despliegue: Transformers con `custom_code` (formato nativo del repositorio), Text Generation Inference (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (la arquitectura base Qwen2.5-VL está soportada) y llama.cpp mediante GGUF, si bien la conversión GGUF documentada corresponde a la versión previa NaviDC-OCR y no a este repositorio concreto.
- Existe experiencia comunitaria de despliegue en aceleradores Ascend 910B.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Overall OmniDocBench v1.6 ↑ | Table TEDS ↑ | Formula CDM ↑ | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| TeleOCR (este repositorio) | 1,42B (declarado 1,2B) | 96,87 | 97,05 | 96,36 | Apache 2.0 | HuggingFace (`ldov/TeleOCR`), GitHub |
| OvisOCR2 | 0,8B | 96,58 | 94,76 | 97,53 | no disponible | HuggingFace |
| PaddleOCR-VL-1.6 | 0,9B | 96,33 | 94,76 | 97,49 | no disponible | HuggingFace |
| MinerU2.5-Pro | 1,2B | 95,75 | 93,42 | 97,45 | no disponible | HuggingFace |

Frente a OvisOCR2, TeleOCR es algo mayor y obtiene mejor puntuación global y mejores resultados en tablas, aunque OvisOCR2 le supera ligeramente en edición de texto (0,025 frente a 0,027) y en orden de lectura (0,111 frente a 0,122), además de tener un CDM de fórmulas superior. Frente a MinerU2.5-Pro, con parámetros declarados equivalentes, TeleOCR mejora en todas las métricas de OmniDocBench salvo en orden de lectura (0,122 frente a 0,120) y en el TEDS de tablas del Dr.DocBench (64,97 frente a 67,75), donde MinerU es superior. La licencia de los modelos comparados no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte para chino e inglés. El rendimiento en castellano o en otras lenguas no está documentado y no debería asumirse.
- Contexto: la longitud de contexto no está publicada, lo que impide planificar con precisión el procesamiento de documentos de muchas páginas en una sola pasada.
- Discrepancia de parámetros: la *model card* indica ~1,2B mientras que los pesos reales suman 1,415B. Conviene verificar la cifra antes de dimensionar infraestructura.
- Rendimiento desigual en tablas: en el Dr.DocBench Challenge el TEDS de tablas (64,97) es inferior al de MinerU 2.5 Pro (67,75), y el CDM de fórmulas (0,02) es notablemente bajo en ese mismo conjunto, aunque muy alto en OmniDocBench (96,36). La evaluación de fórmulas parece muy dependiente del conjunto de datos.
- Riesgo de alucinación: no hay información publicada sobre tasas de alucinación en campos ausentes o tablas incompletas, un riesgo inherente a los modelos generativos aplicados a OCR. En entornos de producción conviene validar los campos extraídos.
- Sesgos: no se documenta ningún análisis de sesgos ni de robustez frente a tipos de documento poco representados en el entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio requiere `custom_code` para cargar el modelo, lo que implica ejecutar código remoto del autor; conviene auditar ese código antes de desplegarlo en producción.
- Madurez del repositorio: la réplica aquí analizada tiene 0 descargas y 0 *likes* en el momento del análisis, y fue creada el 29 de septiembre de 2026. El repositorio de referencia del equipo original es `StarDoc-AI/TeleOCR`. Para producción se recomienda usar la fuente original y verificar la integridad de los pesos.
- El soporte GGUF de llama.cpp documentado corresponde a la versión previa NaviDC-OCR, no a este repositorio; la compatibilidad no está garantizada.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/ldov/TeleOCR
- Repositorio oficial del equipo: https://huggingface.co/StarDoc-AI/TeleOCR
- Repositorio previo (NaviDC-OCR): https://huggingface.co/StarDoc-AI/NaviDC-OCR
- Repositorio GitHub: https://github.com/caipeng328/TeleOCR
- Informe técnico (arXiv): https://arxiv.org/abs/2608.12898
- PDF del informe técnico: https://arxiv.org/pdf/2608.12898
- Conversión GGUF de la comunidad (NaviDC-OCR): https://huggingface.co/nandraj/NaviDC-OCR-GGUF
- Demo en TeleAI: https://www.teleai.com.cn/docparse/DocumentParsing
- OmniDocBench: https://github.com/opendatalab/OmniDocBench
- Dr.DocBench Challenge (EMNLP 2026): https://eval.ai/web/challenges/challenge-page/2717/overview
- Experiencia de despliegue en Ascend 910B: https://zhuanlan.zhihu.com/p/2078516899093155893
