# shreshthsaini/brightrate-study-gemma4-12b-sdr

## Resumen

El modelo `shreshthsaini/brightrate-study-gemma4-12b-sdr` es un adaptador PEFT (LoRA) desarrollado por Shreshth Saini y colaboradores como parte del estudio BrightRate-LM, orientado a la evaluación automática de calidad perceptual de vídeo HDR generado por usuarios (UGC). Se basa en el modelo multimodal `google/gemma-4-12B-it` de Google DeepMind, que combina capacidades de procesamiento de texto e imagen. El adaptador convierte el modelo base en un evaluador de calidad sin referencia (no-reference) que recibe ocho fotogramas HDR tonemapeados a SDR como entrada y produce una puntuación de calidad perceptual.

La relevancia de este modelo radica en que aborda un problema práctico: la medición objetiva de la calidad de vídeo HDR en entornos donde no se dispone de la versión original de referencia. Al estar basado en un LLM multimodal, aprovecha el razonamiento visual y lingüístico del modelo base para interpretar distorsiones y artefactos. El adaptador es ligero (0.3 GB) y se publica con fines de investigación, con métricas reportadas en un conjunto de prueba de 420 vídeos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 12B) con adaptador LoRA |
| Parametros totales | No disponible (el adaptador LoRA tiene rank 16, el modelo base tiene 12B) |
| Parametros activos | No disponible (el adaptador es un LoRA, no un MoE) |
| Longitud de contexto | No disponible (depende del modelo base Gemma 4 12B, no especificado) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el modelo base puede cuantizarse) |
| Idiomas soportados | No disponible (el modelo base Gemma 4 soporta multiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `google/gemma-4-12B-it`, un modelo multimodal de 12 mil millones de parametros que procesa tanto texto como imagenes. El adaptador LoRA tiene rango 16, alpha 32 y dropout 0.05, y se entrena sobre el dataset BrightVQ, especificamente en la particion 0 separada por contenido. La entrada consiste en ocho fotogramas HDR muestreados uniformemente, tonemapeados a un proxy SDR y pasados como imagenes en orden temporal. Los objetivos de calidad (MOS) se interpolan a traves de cinco palabras de calidad (probablemente etiquetas como "excelente", "bueno", etc.). El entrenamiento usa dos epocas, un horizonte de coseno de tres epocas, tasa de aprendizaje 1e-4, micro-batch 1 y acumulacion de gradientes 8.

El modelo base Gemma 4 incorpora innovaciones como multi-token prediction y un modelo draft para decodificacion especulativa, lo que acelera la inferencia sin perdida de calidad. Sin embargo, el adaptador se centra en la tarea especifica de regresion de calidad, no en generacion de texto general.

## Capacidades

- Evaluacion de calidad perceptual de video HDR sin referencia: el adaptador puntua la calidad de un video a partir de ocho fotogramas muestreados.
- Procesamiento multimodal: combina informacion visual (fotogramas) con el razonamiento del LLM base.
- Salida numerica: produce una puntuacion de calidad (MOS) en una escala continua.
- Especializado en video UGC HDR: entrenado con datos de BrightVQ, que contiene videos generados por usuarios.
- No soporta tool calling ni funciones de agente: es un adaptador de regresion, no un asistente conversacional.
- Capacidades multilingues: no especificadas, pero el modelo base Gemma 4 soporta multiples idiomas; el adaptador no las aprovecha directamente.

## Casos de uso

- Control de calidad en plataformas de video UGC: el adaptador puede integrarse en pipelines de moderacion para detectar videos con baja calidad perceptual antes de su publicacion, puntuando automaticamente cada video.
- Optimizacion de transcodificacion: en servicios de streaming, se puede usar para comparar la calidad percibida de diferentes versiones transcodificadas de un mismo video HDR, ayudando a elegir los parametros de codificacion que maximicen la calidad subjetiva.
- Investigacion en calidad de video: permite a investigadores evaluar rapidamente nuevos algoritmos de mejora o restauracion de video HDR sin necesidad de estudios subjetivos con usuarios, usando el adaptador como proxy de opinion.
- Monitorizacion de calidad en tiempo real: en sistemas de videovigilancia o transmision en directo, el adaptador puede analizar fotogramas periodicamente para alertar sobre degradaciones de calidad.
- Benchmarking de codecs: al puntuar videos codificados con diferentes codecs o bitrates, se puede comparar objetivamente su rendimiento perceptual en contenido HDR.
- Filtrado de datasets de entrenamiento: en la creacion de datasets para otros modelos de video, el adaptador puede filtrar videos de baja calidad, asegurando que solo se usen muestras con calidad aceptable.

## Benchmarks y rendimiento

El autor reporta metricas en el conjunto de prueba de la particion 0 de BrightVQ (420 videos):

| Metrica | Valor |
|---|---|
| SROCC (Spearman) | 0.7763 |
| PLCC (Pearson) | 0.7821 |
| KRCC (Kendall) | 0.5833 |
| RMSE | 8.3258 |

No se proporcionan comparaciones con otros modelos de evaluacion de calidad en la informacion disponible. Estas metricas indican una correlacion moderada-alta con las opiniones humanas, pero no son directamente comparables con otros benchmarks generales como MMLU o HumanEval, ya que la tarea es especifica de calidad de video.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.3 GB), pero requiere cargar el modelo base Gemma 4 12B, que en precision FP16 ocupa aproximadamente 24 GB de VRAM.
- Con cuantizacion (por ejemplo, 8 bits o 4 bits), el modelo base puede caber en GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB) en 8 bits, o incluso en 4 bits en GPUs de 16 GB como RTX 4080.
- Para inferencia rapida, se recomienda una GPU con al menos 24 GB de VRAM si se usa FP16, o 12-16 GB con cuantizacion.
- El despliegue puede realizarse con librerias que soporten PEFT, como Hugging Face Transformers con `peft`, o mediante servidores de inferencia como vLLM (si se integra el adaptador) o TGI.
- Dado que el modelo procesa ocho imagenes por video, la latencia dependera del tamaño de los fotogramas y de la GPU. No se proporcionan datos de throughput especificos.

## Comparativa con modelos similares

No se dispone de informacion sobre otros adaptadores o modelos especificamente disenados para evaluacion de calidad de video HDR con LLMs. Los modelos tradicionales de calidad sin referencia (como NIQE, BRISQUE o VMAF) no son directamente comparables porque no usan arquitecturas multimodales. El modelo base Gemma 4 12B puede compararse con otros LLMs multimodales de tamano similar, pero el adaptador es una capa especializada. Por tanto, la comparativa directa no esta disponible.

## Limitaciones y advertencias

- El adaptador esta calibrado exclusivamente para el dataset BrightVQ y su particion 0; las puntuaciones no son transferibles a otros datasets, pipelines de visualizacion o dominios de video sin recalibracion.
- No se especifica la licencia del adaptador ni del modelo base en la informacion proporcionada; se debe verificar antes de uso comercial.
- El modelo base Gemma 4 puede presentar sesgos y alucinaciones en generacion de texto, aunque el adaptador no genera texto libre, sino una puntuacion numerica.
- La entrada requiere un preprocesamiento especifico: ocho fotogramas HDR tonemapeados a SDR en orden temporal; un uso incorrecto puede degradar las predicciones.
- Las metricas reportadas (SROCC 0.7763, PLCC 0.7821) indican una correlacion moderada, no perfecta; no debe usarse como sustituto de evaluaciones subjetivas en entornos criticos.
- El adaptador es un resultado de investigacion (paper en estado "submitted") y puede no estar optimizado para produccion.

## Enlaces

- HuggingFace: https://huggingface.co/shreshthsaini/brightrate-study-gemma4-12b-sdr
- Repositorio BrightRate-LM: https://github.com/shreshthsaini/BrightRate-LM
- Dataset BrightVQ: https://github.com/shreshthsaini/BrightVQ
- Modelo base Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4: https://ai.google.dev/gemma/docs/core
- Repositorio Gemma de Google DeepMind: https://github.com/google-deepmind/gemma
