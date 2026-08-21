# liserman/climaparl-xlm-roberta-v05

## Resumen

ClimaParl es un modelo de clasificación de texto multilingüe desarrollado por Lukas Isermann, diseñado específicamente para detectar y clasificar referencias al cambio climático en discursos parlamentarios. El modelo distingue entre referencias "estrechas" (narrow) y "amplias" (broad) al cambio climático, lo que permite analizar cómo los parlamentos europeos abordan esta temática en sus debates.

El modelo se basa en XLM-RoBERTa, una arquitectura transformer multilingüe de Facebook AI, y ha sido fine-tuneado con discursos parlamentarios anotados manualmente procedentes de 27 países europeos. Con aproximadamente 278 millones de parámetros, ofrece un equilibrio entre capacidad y eficiencia computacional, siendo adecuado para tareas de análisis político y de políticas públicas a escala.

La relevancia de este modelo radica en su utilidad para la investigación en ciencia política, estudios medioambientales y análisis de discurso, proporcionando una herramienta estandarizada y reproducible para medir la atención política al cambio climático en contextos parlamentarios multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder) |
| Parametros totales | 278.045.955 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingue (XLM-RoBERTa soporta 100+ idiomas; el fine-tuning cubre 27 paises europeos) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa, una arquitectura transformer basada en el enfoque de RoBERTa pero entrenada con datos multilingües a gran escala. XLM-RoBERTa utiliza el objetivo de modelado de lenguaje enmascarado (MLM) sobre un corpus que cubre más de 100 idiomas, lo que le confiere una sólida capacidad de representación multilingüe.

El fine-tuning se realizó sobre discursos parlamentarios anotados manualmente de 27 países europeos, clasificando cada intervención según si contiene referencias estrechas o amplias al cambio climático. La metodología del proyecto ClimaParl se centra en distinguir entre menciones directas y específicas al cambio climático (narrow) frente a referencias más generales o contextuales (broad). No se dispone de información detallada sobre el número exacto de tokens de entrenamiento, el régimen de entrenamiento (épocas, tasa de aprendizaje) ni si se emplearon técnicas adicionales como data augmentation.

## Capacidades

- Clasificacion de textos en dos categorias: referencias estrechas (narrow) y amplias (broad) al cambio climatico.
- Procesamiento multilingue de discursos parlamentarios, cubriendo las lenguas de 27 paises europeos.
- Analisis de discurso politico y de politicas publicas relacionadas con el clima.
- Clasificacion de textos de hasta 512 tokens por secuencia.
- No es un modelo generativo: no produce texto, solo clasifica.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Investigacion en ciencia politica: permite cuantificar la atencion que los parlamentos europeos dedican al cambio climatico, comparando paises, partidos o periodos legislativos.
- Analisis de politicas publicas: los equipos de investigacion pueden usar el modelo para rastrear como evoluciona el discurso climatico en relacion con la aprobacion de leyes o acuerdos internacionales.
- Monitoreo mediatico y de transparencia: organizaciones de la sociedad civil pueden analizar si los representantes electos abordan el cambio climatico de forma sustantiva o solo superficial.
- Estudios comparativos transnacionales: al ser multilingue, permite comparar directamente discursos en diferentes idiomas sin necesidad de traduccion previa.
- Periodismo de datos: los medios pueden emplear el modelo para analizar la cobertura parlamentaria del clima y generar reportajes basados en evidencia.
- Educacion y divulgacion: sirve como herramienta didactica para estudiantes de ciencia politica y estudios medioambientales que quieran explorar el analisis automatizado de discursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (precision, F1, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo encoder de 278M parametros, la inferencia es ligera. En precision FP32, el modelo ocupa aproximadamente 1,1 GB en memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA GTX 1060 o superior, o una RTX 3060, son mas que adecuadas.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual.
- Opciones de despliegue: puede ejecutarse con la libreria transformers de Hugging Face en Python, o exportarse a ONNX para inferencia optimizada. Tambien es compatible con frameworks como FastAPI para servir el modelo como API.
- Latencia y throughput: no se dispone de datos oficiales, pero para un modelo de este tamano, la inferencia en CPU es de decenas de milisegundos por secuencia, y en GPU, de unos pocos milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| ClimaParl (este modelo) | 278M | 512 | Clasificacion de referencias climaticas en discursos parlamentarios | no disponible |
| XLM-RoBERTa base | 278M | 512 | Modelo multilingue de proposito general | MIT |
| mBERT | 178M | 512 | Modelo multilingue de proposito general | Apache 2.0 |

La comparativa directa con otros modelos fine-tuneados para la misma tarea no esta disponible, ya que ClimaParl es un proyecto especifico sin alternativas publicadas equivalentes.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada, lo que genera incertidumbre sobre su uso comercial y la necesidad de contactar al autor para aclaraciones.
- El modelo esta entrenado exclusivamente con discursos parlamentarios europeos, por lo que su rendimiento puede degradarse en otros dominios o regiones geograficas.
- La distincion entre referencias "estrechas" y "amplias" al cambio climatico es una tarea subjetiva que depende de las definiciones operativas utilizadas en la anotacion manual; los resultados deben interpretarse con cautela.
- La longitud de contexto de 512 tokens puede ser insuficiente para discursos parlamentarios largos, requiriendo truncamiento o estrategias de ventana deslizante.
- No se han publicado metricas de evaluacion, por lo que se desconoce la precision real del modelo en diferentes idiomas o paises.
- Como modelo basado en XLM-RoBERTa, puede heredar sesgos presentes en los datos de preentrenamiento, especialmente en idiomas o culturas menos representadas.
- Riesgo de alucinacion: no aplica directamente, al ser un modelo de clasificacion y no generativo, pero la clasificacion erronea es posible en textos ambiguos o con dobles sentidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liserman/climaparl-xlm-roberta-v05
- Proyecto ClimaParl: https://lukasisermann.com/project/climaparl/
- Documentacion de XLM-RoBERTa en Hugging Face: https://huggingface.co/docs/transformers/main/model_doc/xlm-roberta
- Repositorio de transformers en GitHub: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/xlm-roberta.md
