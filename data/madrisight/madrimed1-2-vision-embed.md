# madrisight/madrimed1.2-vision-embed

## Resumen

Madrimed 1.2 Vision Embed es un codificador visual aislado (vision encoder) desarrollado por madrisight, orientado a la extraccion de caracteristicas densas de imagenes medicas y radiologicas. El modelo proyecta imagenes de resolucion dinamica en un espacio de embeddings de 2048 dimensiones normalizados en L2, disenado para alineacion cross-modal y para la construccion de topologias de Graph Retrieval-Augmented Generation (Graph RAG). Se distribuye como un tower visual independiente, sin cabezal generativo, y se usa en conjuncion con el modelo de texto madrisight/madrimed1.2-text-embed para recuperacion semantica imagen-texto.

Arquitectonicamente es un Vision Transformer (ViT) basado en la familia Qwen3-VL (`qwen3_vl_vision`), con patch merging espacial mediante proyeccion lineal 2x2 y una dimension de caracteristica de 2048, pensada para coincidir con la dimension de entrada de modelos de lenguaje transformer. Cuenta con aproximadamente 407 millones de parametros (406.957.056 segun los pesos en safetensors) y un repositorio de 1,6 GB.

Su relevancia actual radica en el auge de los pipelines de recuperacion aumentada sobre imagenes clinicas: indexacion visual en PACS hospitalarios, recuperacion de casos radiologicos similares y construccion de grafos de conocimiento medico. Frente a modelos generativos multimodales, este encoder ofrece una salida puramente vectorial, mas ligera y adecuada para busqueda por similitud y clustering a escala de cohortes de pacientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) basado en Qwen3-VL (`qwen3_vl_vision`) con patch merging 2x2 por proyeccion lineal |
| Parametros totales | 406.957.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de extraccion de caracteristicas, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer con resolucion dinamica que procesa imagenes medicas de distintas modalidades (TC, RM, rayos X) y las proyecta a un espacio de embeddings de 2048 dimensiones normalizados en L2. Incorpora un patch merger espacial que comprime parches 2x2 mediante proyeccion lineal, lo que reduce la secuencia de tokens visuales antes de la proyeccion final. La geometria de caracteristicas resultante es de tipo "modality-dominant": los scans se agrupan principalmente por fisica de imagen y contraste tisular, lo que resulta util para separar cohortes por modalidad antes de refinar por similitud estructural.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o ajuste contrastivo supervisado. Tampoco se especifican innovaciones como decodificacion especulativa o atencion lineal. La documentacion si incluye directrices operativas para el despliegue en pipelines de recuperacion: aplicar centrado de medias (mean-centering) o correccion de hubness antes de umbralizar por coseno estatico, para evitar la formacion de nodos hub de alto grado en el grafo.

## Capacidades

- Extraccion de caracteristicas visuales densas de imagenes medicas: TC, RM, rayos X y otras modalidades radiologicas.
- Proyeccion a embeddings de 2048 dimensiones normalizados en L2, listos para busqueda por similitud coseno.
- Alineacion cross-modal con el modelo de texto madrisight/madrimed1.2-text-embed para recuperacion visual mediante consultas textuales.
- Indexacion visual para Graph RAG: construccion de grafos de k-vecinos mas cercanos (k-NN) basados en similitud coseno.
- Recuperacion de casos radiologicos visual y estructuralmente similares (Content-Based Image Retrieval, CBIR).
- Soporte de resolucion dinamica de imagen.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni agentes: es exclusivamente un encoder de caracteristicas.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado solo para ingles.

## Casos de uso

- Recuperacion de casos radiologicos similares en PACS hospitalarios: el encoder indexa los estudios de una cohorte en un espacio de 2048 dimensiones y permite recuperar scans visual y estructuralmente parecidos mediante similitud coseno, apoyando el razonamiento basado en casos.
- Construccion de grafos de conocimiento medico para Graph RAG: genera embeddings que alimentan grafos k-NN, sobre los que se ejecutan consultas de recuperacion de subgrafos de contexto para sistemas de soporte a la decision.
- Busqueda visual mediante consultas de texto: combinado con madrimed1.2-text-embed, permite localizar imagenes medicas a partir de descripciones textuales, util en interfaces de exploracion de archivos clinicos.
- Clustering y estratificacion de cohortes: agrupa estudios por modalidad y contraste tisular para organizar grandes volumenes de imagenes antes de analisis posteriores.
- Deduplicacion y control de calidad de datasets medicos: detecta imagenes duplicadas o casi duplicadas en repositorios de entrenamiento mediante umbrales de similitud coseno corregidos por hubness.
- Enriquecimiento de pipelines de investigacion clinica: genera representaciones vectoriales reutilizables para tareas posteriores de clasificacion, regresion o analisis topologico sin reentrenar el encoder.
- Indexacion en sistemas de recuperacion de imagenes medicas a escala: con 407 millones de parametros y pesos en safetensors, puede desplegarse en infraestructura GPU moderada para servir busquedas por similitud.

## Benchmarks y rendimiento

La model card incluye evaluaciones cualitativas mediante notebooks y graficos (Medical Image Graph RAG sobre sistemas corporales y un diagnostico del espacio visual), pero no presenta tablas con metricas numericas (MMLU, recall@k, mAP u otras) en la informacion disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 407 millones de parametros, en FP32 ocupa aproximadamente 1,6 GB de pesos; en FP16/BF16 alrededor de 0,8 GB. La VRAM total depende del tamano de lote y de la resolucion de las imagenes procesadas.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en precision media; A100 o H100 para indexacion masiva de cohortes y procesamiento por lotes de alta resolucion.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, siempre ajustando el tamano de lote a la VRAM disponible.
- Opciones de despliegue: transformers con `Qwen3VLVisionModel` y `trust_remote_code=True`; el ejemplo oficial usa el paquete `metalliger` (instalable desde GitHub) para la construccion del grafo y la recuperacion Graph RAG. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| madrisight/madrimed1.2-vision-embed | 406.957.056 | no disponible | Vision encoder (ViT, Qwen3-VL) | apache-2.0 | Hugging Face |
| madrisight/madrimed1.2-VL-2B | no disponible | no disponible | Modelo vision-lenguaje | no disponible | Hugging Face |
| madrisight/madrimed1.2-text-embed | no disponible | no disponible | Encoder de texto | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa con encoders visuales medicos de otros autores no esta disponible.

## Limitaciones y advertencias

- No es una herramienta de diagnostico: produce representaciones vectoriales para recuperacion y clustering; no sustituye la revision de un radiologo certificado.
- Anisotropia visual: los embeddings pueden formar nodos hub de alto grado; la model card recomienda aplicar centrado de medias o correccion de hubness antes de umbralizar por coseno estatico.
- Riesgo de similitudes enganosas: la geometria esta dominada por la modalidad de imagen y el contraste tisular, por lo que la recuperacion puede agrupar scans por fisica de imagen antes que por patologia.
- Idioma: solo etiquetado para ingles; el rendimiento en consultas u otros idiomas no esta documentado.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado con datos radiologicos no especificados, puede heredar sesgos de representacion de la poblacion de entrenamiento.
- Datos de entrenamiento no publicados: no se detalla el dataset, lo que dificulta evaluar la cobertura de modalidades y la generalizacion a equipos o protocolos distintos.
- Licencia apache-2.0: permite uso comercial, pero el autor restringe explicitamente el uso como herramienta diagnostica primaria.
- Dependencia de codigo externo: el ejemplo oficial requiere el paquete `metalliger` y `trust_remote_code=True`, lo que anade superficie de mantenimiento y riesgos de seguridad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/madrisight/madrimed1.2-vision-embed
- Modelo de texto complementario: https://huggingface.co/madrisight/madrimed1.2-text-embed
- Modelo vision-lenguaje relacionado: https://huggingface.co/madrisight/madrimed1.2-VL-2B
- Repositorio del paquete metalliger: https://github.com/krrish-v/metalliger
- Notebook de evaluacion de embeddings: https://github.com/krrish-v/all_huggingface/blob/main/embedding_model_evaluation/embedding_vision_graphrag.ipynb
