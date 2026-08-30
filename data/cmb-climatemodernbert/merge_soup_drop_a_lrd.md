# CMB-ClimateModernBERT/Merge_Soup_drop_A_LRD

## Resumen

`CMB-ClimateModernBERT/Merge_Soup_drop_A_LRD` es un encoder de lenguaje especializado en dominio climático, obtenido mediante continuación de pretraining sobre el modelo base `answerdotai/ModernBERT-base`. Forma parte de la familia ClimateModernBERT, desarrollada por el grupo CMB-ClimateModernBERT, cuyo objetivo es adaptar representaciones transformer a textos científicos, periodísticos y corporativos relacionados con el cambio climático. Este checkpoint concreto se generó mediante un merge lineal (uniform soup) de dos modelos entrenados sobre corpus sintético (𝒮) y web climática (ℱ), eliminando deliberadamente el corpus académico (𝒜) para estudiar el impacto de la composición de datos en el rendimiento final.

El modelo tiene 149,6 millones de parámetros, 22 capas, dimensión oculta 768, 12 cabezas de atención y un vocabulario de 50.368 tokens, con una ventana de contexto de 8.192 tokens. Está diseñado para tareas de enmascarado de lenguaje (fill-mask) y para ser fine-tuneado en tareas posteriores de clasificación, etiquetado múltiple y recuperación. Su relevancia actual radica en que aborda una pregunta metodológica clave en la adaptación de dominio: cómo influye la exclusión de datos académicos en el rendimiento sobre benchmarks climáticos, un tema de interés para investigadores que construyen modelos verticales con recursos limitados.

El autor advierte explícitamente que este checkpoint no es un modelo principal, sino una pieza de investigación para reproducibilidad y análisis de ablación. Para uso general recomienda el modelo completo `CMB-ClimateModernBERT/Merge_Soup_LRD`, que alcanza una F1 media de 76,3 en los benchmarks climáticos del paper, frente a 73,5 del baseline ModernBERT-Base y 72,1 de ClimateBERT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-Base) |
| Parametros totales | 149.655.232 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en BF16/FP32, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT-Base, un transformer encoder con atencion bidireccional, 22 capas, dimension oculta 768 y 12 cabezas, disenado para contextos largos de hasta 8.192 tokens. No es un modelo MoE ni hibrido; es un encoder denso clasico con atencion full self-attention. La continuacion de pretraining se realizo en dos fases, siguiendo la receta de ModernBERT: una primera fase de extension de contexto con 3 epocas, LR constante 3e-4, batch global 576, secuencia de 8.192 tokens, masking MLM al 30% y optimizador StableAdamW en BF16; y una segunda fase de especializacion LRD (learning rate decay) con 3 epocas adicionales y un schedule de decaimiento `1 - sqrt(t)` partiendo de LR 3e-4 y factor final 1e-3.

Los datos de entrenamiento provienen de un corpus total de 6,42 mil millones de tokens, del cual este modelo solo utiliza dos subconjuntos: el corpus sintetico (𝒮, ~0,14B tokens) generado por LLM a partir de extractos semilla del dominio, y el corpus web climatica (ℱ, ~5B tokens) obtenido filtrando FineWeb-Edu con un filtro de 166 terminos y un clasificador FastText. El corpus academico (𝒜, ~1,28B tokens) se excluyo deliberadamente en este merge. El entrenamiento se realizo en 4 GPU NVIDIA A100 con MosaicML Composer, y los checkpoints finales se convirtieron al formato Hugging Face Transformers. El merge se hizo con mergekit usando un promedio lineal uniforme de los dos modelos base (`F_CX_LRD` y `S_CX_LRD`).

## Capacidades

- Representacion de texto en ingles especializada en dominio climatico: genera embeddings contextuales de alta calidad para frases y documentos sobre cambio climatico, energia, emisiones y sostenibilidad.
- Fine-tuning para clasificacion de secuencias: puede adaptarse a tareas como deteccion de compromisos climaticos, analisis de sentimiento, clasificacion de informes corporativos y etiquetado multi-etiqueta.
- Recuperacion de informacion: al ser un encoder, puede usarse para construir indices de busqueda semantica sobre colecciones de documentos climaticos (via SentenceTransformers u otros frameworks).
- Enmascarado de lenguaje (fill-mask): permite predecir tokens enmascarados en contexto, util para tareas de completado y analisis linguistico.
- Soporte de contexto largo: con 8.192 tokens, puede procesar parrafos extensos o documentos completos en una sola pasada, ventaja frente a encoders clasicos como BERT (512 tokens).
- No es un modelo generativo ni de instrucciones: no genera texto libre ni sigue prompts conversacionales; su salida son representaciones vectoriales o predicciones de tokens enmascarados.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Analisis de informes de sostenibilidad: el modelo puede fine-tunearse para clasificar declaraciones de empresas sobre emisiones de alcance 1, 2 y 3, extrayendo compromisos y reducciones. Su contexto de 8.192 tokens permite procesar secciones completas de informes anuales sin truncamiento.
- Deteccion de compromisos climaticos en documentos politicos: fine-tuning para identificar frases que contengan objetivos de reduccion de emisiones o metas net-zero en politicas nacionales y regionales, aprovechando su entrenamiento en corpus web y sintetico.
- Recuperacion semantica de literatura cientifica: al generar embeddings densos, puede integrarse en sistemas RAG para buscar articulos, preprints o noticias climaticas relevantes a partir de consultas en lenguaje natural, especialmente util en dominios donde el corpus academico fue excluido para estudiar el efecto de esa decision.
- Clasificacion de sentimiento climatico en redes sociales y noticias: fine-tuning para analizar el tono (positivo, negativo, neutral) de textos sobre cambio climatico, util para seguimiento de opinion publica.
- Etiquetado de recomendaciones TCFD: el modelo puede adaptarse para identificar si un informe corporativo sigue las recomendaciones del Task Force on Climate-related Financial Disclosures, una tarea multi-etiqueta con taxonomia especifica.
- Investigacion metodologica en adaptacion de dominio: este checkpoint sirve como abalacion controlada para estudiar como la ausencia de datos academicos afecta el rendimiento en tareas climaticas, permitiendo a otros investigadores replicar y extender los hallazgos del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint especifico en la informacion disponible. El autor indica explicitamente que el manuscrito no reporta una puntuacion agregada para este modelo, ya que se libera con fines de procedencia y trabajo de seguimiento, no como modelo principal.

Como referencia contextual del paper (no para este modelo), bajo el mismo protocolo de evaluacion sobre nueve benchmarks climaticos (Climate Detection, Climate Specificity, Commitments & Actions, Climate Sentiment, Net Zero & Reduction, TCFD Recommendations, WFB Nature, WXImpactBench y ClimRetrieve), el baseline ModernBERT-Base alcanza una F1 media de 73,5, ClimateBERT 72,1, y el modelo completo `Merge_Soup_LRD` 76,3. Este checkpoint, al eliminar el corpus academico, degrada la F1 media en 4,0 puntos relativos respecto al soup completo, segun la figura 2 del paper.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision BF16, el modelo ocupa aproximadamente 300 MB (149,6M parametros × 2 bytes). En FP32 serian unos 600 MB. Con la ventana de contexto maxima de 8.192 tokens, el uso de memoria para activaciones puede aumentar, pero sigue siendo modesto.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para inferencia y fine-tuning con batch pequeno (por ejemplo, NVIDIA GTX 1060, RTX 2060, RTX 3060, RTX 4090). Tambien es viable en CPU para inferencia de baja latencia, aunque con menor throughput.
- Cabe en GPUs consumer: si, sin problema. Incluso en sistemas con 2 GB de VRAM se puede ejecutar con cuantizacion dinamica o reduciendo el batch.
- Opciones de despliegue: al ser un encoder de transformers, se puede servir con la libreria `transformers` (Python), exportar a ONNX para inferencia en CPU/GPU, o usar frameworks de embedding como SentenceTransformers. No es compatible directamente con vLLM ni llama.cpp, orientados a modelos generativos.
- Latencia y throughput estimados: no disponible en la documentacion proporcionada. En una GPU moderna (RTX 3090 o superior), la inferencia de una secuencia corta (<512 tokens) deberia completarse en milisegundos, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 media (benchmarks climaticos) | Licencia | Notas |
|---|---|---|---|---|---|
| CMB-ClimateModernBERT/Merge_Soup_drop_A_LRD | 149,6M | 8.192 | no reportado (degradacion ~4.0 vs soup completo) | no disponible | Merge sin corpus academico, para abalacion |
| CMB-ClimateModernBERT/Merge_Soup_LRD | 149,6M | 8.192 | 76,3 | no disponible | Modelo completo recomendado por el autor |
| answerdotai/ModernBERT-base | 149,6M | 8.192 | 73,5 (baseline) | Apache 2.0 | Modelo base original, sin adaptacion climatica |
| ClimateBERT | 110M (aprox.) | 512 (aprox.) | 72,1 | no disponible | Encoder climatico clasico basado en BERT, contexto corto |

Los datos de ClimateBERT (parametros y contexto) son aproximaciones publicas conocidas, pero no estan verificados en la informacion proporcionada. La comparativa se basa en los resultados reportados en el paper de ClimateModernBERT bajo el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- El modelo es exclusivamente en ingles; no soporta otros idiomas.
- Es un modelo de lenguaje enmascarado (MLM), no un sistema de instrucciones ni un generador de texto. No produce respuestas factuales calibradas sobre ciencia climatica.
- Al excluir el corpus academico, el modelo degrada su rendimiento en tareas que requieren comprension fina de discurso y compromisos, segun el analisis del paper. No debe usarse como sustituto del modelo completo para aplicaciones criticas.
- Los benchmarks climaticos actuales operan principalmente a nivel de frase o pasaje, por lo que la capacidad de contexto largo (8.192 tokens) no queda completamente ejercitada en la evaluacion reportada.
- Los datos sinteticos tienen efectos dependientes de la tarea: ayudan en tareas basadas en taxonomias y marcos, pero perjudican tareas que requieren comprension de discurso y compromisos.
- La licencia no esta disponible; se debe contactar con el autor antes de un uso comercial o de redistribucion.
- El texto academico original no se redistribuye; solo se liberan los pipelines de procesamiento, lo que puede limitar la reproducibilidad exacta del corpus.
- El modelo no ofrece garantias de precision factual; cualquier aplicacion en produccion debe incluir validacion humana de las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_drop_A_LRD
- Repositorio original (pesos identicos): https://huggingface.co/sraj/Merge_Drop_MARK_FastText
- Coleccion ClimateModernBERT: https://huggingface.co/collections/sraj/climatemodernbert
- Modelo completo recomendado: https://huggingface.co/CMB-ClimateModernBERT/Merge_Soup_LRD
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Proyecto web: https://michaelyya.github.io/ClimateModernBERT/
- Codigo y pipelines: https://github.com/Michaelyya/ClimateModernBERT
