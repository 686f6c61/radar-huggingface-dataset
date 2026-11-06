# FlagRelease/MiniCPM-OCR-Jev-BF16-metax-FlagOS

## Resumen

MiniCPM-OCR Jev es un modelo de 2B parámetros desarrollado por ModelBest en colaboración con OpenBMB, diseñado específicamente como "inspector de calidad" automatizado para resultados de OCR y parseo de documentos. Su función no es extraer texto, sino evaluar la fiabilidad de una transcripción OCR comparando la imagen original con una imagen renderizada a partir del texto extraído, emitiendo una puntuación de consistencia. Se trata de una tarea de clasificación de secuencias (sequence classification) construida sobre la arquitectura Qwen3.5, con capacidades de visión para procesar pares de imágenes.

El modelo se publica en el repositorio `FlagRelease/MiniCPM-OCR-Jev-BF16-metax-FlagOS`, una adaptación del checkpoint original a la pila de software FlagOS para el acelerador MetaX (MACA). Esta build concreta permite ejecutar el modelo en hardware MetaX mediante Torch-FL, con un rendimiento reportado del 98,7% del throughput nativo de NVIDIA. El checkpoint incluye 2.213.245.760 parámetros en formato BF16 y ocupa 4,4 GB en el repositorio.

La relevancia actual del modelo radica en que aborda un problema práctico de los pipelines de digitalización documental: el output del OCR sigue requiriendo verificación humana. Jev actúa como filtro automático que puntúa la fiabilidad de cada parseo, con un AUROC de 0,936 en JevOCRBench, muy cercano al 0,938 de Qwen3.5-397B-A17B pese a ser dos órdenes de magnitud menor. Está pensado para integrarse con distintos motores OCR y marcar qué contenido necesita revisión manual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer con capacidades de visión), clase `Qwen3_5ForSequenceClassification` |
| Parámetros totales | 2.213.245.760 (2,2B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (checkpoint publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 adaptada a una cabeza de clasificación de secuencias (`Qwen3_5ForSequenceClassification`). Procesa entradas multimodales: dos imágenes (la original y la renderizada a partir del texto OCR) junto con el texto extraído, y produce una puntuación de consistencia binaria (1 = consistente, 0 = inconsistente). El checkpoint publicado corresponde a un paso de entrenamiento intermedio (`qwen35_2b_l2_triple_value_checkpoint-3000`), lo que sugiere un proceso de ajuste supervisado sobre datos de pares imagen-OCR con etiquetas de consistencia. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación principal no está en la arquitectura sino en el caso de uso: un modelo pequeño especializado en evaluación de calidad OCR que sirve como capa de verificación sobre otros sistemas de extracción. La build FlagOS añade una capa de portabilidad multi-chip (MetaX, y por extensión otras 12 plataformas según la model card) mediante Torch-FL, con un stack que incluye FlagTree 0.7.0, FlagGems 5.4.0 y FlagCX 0.14.0. La validación de consistencia reportada muestra diferencias mínimas entre la ejecución nativa NVIDIA y la build MetaX-FlagOS en las métricas de evaluación.

## Capacidades

- Evaluación de fiabilidad de OCR: compara imagen original con imagen renderizada del texto extraído y emite una puntuación de consistencia binaria.
- Clasificación de secuencias multimodal: procesa pares de imágenes junto con texto en una única pasada.
- Detección de errores de transcripción: identifica discrepancias entre el contenido visual y el texto OCR.
- Soporte bilingüe chino-inglés en la evaluación de documentos.
- Integración con distintos motores OCR como capa de post-procesado y control de calidad.
- No se documentan capacidades de generación de texto libre, tool calling, agentes ni razonamiento multi-paso; el modelo está especializado en la tarea de clasificación descrita.

## Casos de uso

- Control de calidad en pipelines de digitalización: Jev se inserta tras el motor OCR y puntúa cada página, marcando automáticamente las que requieren revisión humana y reduciendo el volumen de verificación manual.
- Procesamiento de documentos escaneados y fotografías: al evaluar la consistencia entre la imagen original y el texto renderizado, detecta errores en escaneos degradados, páginas curvadas o re-fotografías de pantallas.
- Extracción de información en entornos regulados: en banca, seguros o administración pública, donde la exactitud del parseo es crítica, Jev actúa como filtro auditable antes de la validación final.
- Despliegue en edge computing: según la model card, en dispositivos ARM completa una evaluación de bloque de página en 1,20 segundos usando solo la CPU M5, lo que permite calidad OCR en terminales sin GPU.
- Integración multi-chip en centros de datos: la build FlagOS permite desplegar el mismo modelo en MetaX y otras plataformas sin reentrenamiento, facilitando la portabilidad en infraestructuras heterogéneas.
- Enriquecimiento de pipelines RAG documentales: antes de indexar texto extraído de PDFs e imágenes, Jev filtra las transcripciones poco fiables para evitar propagar errores al sistema de recuperación.
- Evaluación comparativa de motores OCR: permite puntuar sistemáticamente la calidad de distintos motores sobre el mismo corpus y seleccionar el más adecuado por tipo de documento.

## Benchmarks y rendimiento

| Métrica | Jev NVIDIA nativo | Jev MetaX FlagOS |
|---|---|---|
| ocr_rm_mini (12 entradas) avg_prob_1 | 0,4817 | 0,482337 |
| omnidocbench-render-compare (60 entradas) avg_prob_1 | 0,2397 | 0,23971 |

| Métrica global | Valor |
|---|---|
| AUROC en JevOCRBench | 0,936 |
| AUROC de referencia Qwen3.5-397B-A17B en JevOCRBench | 0,938 |
| Throughput FlagOS vs. nativo NVIDIA | 98,7% |
| Tiempo de evaluación por bloque de página en ARM (CPU M5) | 1,20 s de media |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,5 GB solo para pesos, más overhead de activaciones y procesador de visión; se recomienda al menos 8 GB para un despliegue cómodo.
- GPU recomendadas: aceleradores MetaX (build FlagOS específica), NVIDIA (A100, H100, RTX 4090) para la versión nativa.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas con 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070 en adelante); en cuantizaciones menores no documentadas podría reducirse aún más.
- Despliegue: la build FlagOS se ejecuta mediante contenedor Docker con vLLM 0.24.0 sobre MACA 3.8.1.3; requiere `import torch_fl` antes de `import torch` y el dispositivo `flagos:0`. Para la versión nativa, transformers 5.17.0 con `Qwen3_5ForSequenceClassification`.
- Latencia: 1,20 s por bloque de página en CPU ARM M5; en aceleradores MetaX se reporta el 98,7% del throughput nativo NVIDIA (valores absolutos no disponibles).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AUROC JevOCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR Jev | 2,2B | no disponible | 0,936 | Apache 2.0 | Hugging Face (build FlagOS) |
| MiniCPM-OCR 1.0 | 1,3B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Qwen3.5-397B-A17B | 397B (17B activos) | no disponible | 0,938 | no disponible | no disponible |

La comparación directa con Qwen3.5-397B-A17B es la más relevante: Jev alcanza un AUROC de 0,936 frente a 0,938 del modelo gigante, con un tamaño dos órdenes de magnitud menor. MiniCPM-OCR 1.0 es el modelo hermano orientado a la extracción, no a la verificación, y reporta 93,68 en Real5-OmniDocBench.

## Limitaciones y advertencias

- El modelo está especializado en clasificación de consistencia OCR; no es un modelo generativo general y no debe usarse para tareas fuera de ese ámbito.
- Idiomas limitados a chino e inglés; el rendimiento en otros idiomas no está documentado.
- El prompt de inferencia está fijado en chino en la model card para garantizar la reproducibilidad de los resultados; traducirlo puede alterar el comportamiento.
- Riesgo de falsos positivos y negativos en la clasificación binaria: un AUROC de 0,936 implica que una fracción no trivial de casos se clasifica incorrectamente, por lo que el filtro no sustituye completamente la revisión humana.
- La build publicada está atada al stack FlagOS/MetaX (MACA 3.8.1.3, Torch-FL, FlagTree, FlagGems); el despliegue en otras plataformas requiere la versión nativa o builds específicas.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los checkpoints base de Qwen3.5 subyacentes.
- No se documentan sesgos específicos del modelo; al entrenarse sobre datos de documentos, puede heredar sesgos de los corpus utilizados.
- El repositorio tiene muy pocas descargas (8) y ningún "like", lo que sugiere una adopción temprana y poca validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-OCR-Jev-BF16-metax-FlagOS
- Model card de referencia (contenido citado en la información disponible)
- Contenedor Docker: `harbor.baai.ac.cn/flagrelease-public/vllm0.24.0-metax-maca3.8.1.3:jev-ocr-rm-2b-torchfl`
- Descarga de pesos vía ModelScope: `modelscope download --model FlagRelease/MiniCPM-OCR-Jev-BF16-metax-FlagOS`
- Organizaciones: ModelBest y OpenBMB (desarrolladores originales); FlagOS (adaptación multi-chip)
