# sarkarsudipta/bart-base-scihigh

## Resumen

`sarkarsudipta/bart-base-scihigh` es un modelo de generacion de texto cientifico desarrollado por Sudipta Sarkar para la tarea 1 de la competicion SciHigh 2026. Consiste en un fine-tuning del modelo BART-base de Facebook (`facebook/bart-base`) mediante la tecnica de adaptacion de bajo rango LoRA, aplicada exclusivamente a las proyecciones de atencion `q_proj` y `v_proj`. El objetivo es generar highlights de investigacion concisos e informativos a partir de abstracts o textos cientificos.

El modelo aborda el problema de la sintesis automatica de contribuciones cientificas: dado un abstract, produce un resumen breve que destaca los hallazgos y aportaciones clave. Esta tarea resulta relevante en un contexto de sobrecarga de publicaciones academicas, donde los investigadores necesitan evaluar rapidamente la relevancia de un articulo. El checkpoint entrenado se distribuye como `checkpoint_epoch_30.pth`, correspondiente a 30 epocas de entrenamiento sobre el dataset de SciHigh 2026.

La arquitectura subyacente es BART, un transformer encoder-decoder de tipo seq2seq que combina un encoder bidireccional (estilo BERT) con un decoder autorregresivo (estilo GPT), lo que le permite tanto comprender como generar texto. El modelo esta especializado en ingles y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART encoder-decoder (seq2seq transformer) |
| Parametros totales | ~139 millones (BART-base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (estandar de BART-base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo se basa en BART-base, un transformer encoder-decoder propuesto por Lewis et al. en el articulo "BART: Denoising Sequence-to-Sequence Pre-training for Natural Language Generation, Translation, and Comprehension". BART combina un encoder bidireccional tipo BERT con un decoder autorregresivo tipo GPT, y se preentrena mediante la corrupcion de texto (ruido) y su posterior reconstruccion. Esta arquitectura es especialmente adecuada para tareas de generacion de texto como la sumarizacion.

El fine-tuning se realizo con LoRA (Low-Rank Adaptation), una tecnica de ajuste de parametros eficiente que congela los pesos preentrenados e inyecta matrices de bajo rango en las capas objetivo. En este caso, los adaptadores LoRA se aplicaron a las proyecciones de atencion `q_proj` y `v_proj`. El entrenamiento se llevo a cabo sobre el dataset de la tarea 1 de SciHigh 2026, que consiste en pares de abstracts cientificos y sus highlights correspondientes. El checkpoint final corresponde a la epoca 30 de entrenamiento. No se detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset en la informacion disponible.

## Capacidades

- Generacion de highlights de investigacion: dado un abstract cientifico, produce un resumen conciso que destaca la contribucion principal.
- Sumarizacion de texto cientifico: puede condensar abstracts o fragmentos de articulos en resumenes breves.
- Generacion de texto secuencia a secuencia: al ser un modelo BART, mantiene capacidades generales de generacion condicionada de texto.
- Comprension de lenguaje cientifico en ingles: el fine-tuning sobre el dataset SciHigh 2026 lo especializa en el registro academico-cientifico.
- Procesamiento de entradas de hasta 1024 tokens (limitacion del modelo base); el ejemplo de inferencia usa truncamiento a 512 tokens.
- Generacion con beam search: el ejemplo de inferencia utiliza `num_beams=4` con `early_stopping`, lo que permite obtener salidas de mayor calidad que la decodificacion greedy.

## Casos de uso

- Generacion de highlights para articulos cientificos: el modelo puede procesar el abstract de un paper y producir un highlight listo para usar en indices, bases de datos bibliograficas o resumenes de conferencias.
- Automatizacion de boletines de novedades cientificas: instituciones o grupos de investigacion pueden alimentar el modelo con abstracts de nuevos articulos para generar resumenes breves destinados a newsletters o alertas de publicacion.
- Triaje de literatura: en revisiones sistematicas o busquedas bibliograficas, el modelo puede generar resumenes rapidos de cada candidato para decidir si merece una lectura completa, reduciendo el tiempo de cribado.
- Asistente para revisores: los revisores de articulos pueden obtener una sintesis rapida de la contribucion del manuscrito antes de la revision detallada, facilitando la evaluacion preliminar.
- Generacion de metadatos para repositorios academicos: el modelo puede producir highlights para indexar articulos en repositorios institucionales o plataformas de literatura cientifica.
- Resumen de abstracts para divulgacion: permite transformar abstracts tecnicos en resumenes mas accesibles para audiencias no especializadas, aunque con las limitaciones propias de un modelo entrenado especificamente para highlights cientificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se presenta como un checkpoint de competicion sin metricas reportadas (como ROUGE, BLEU o METEOR) en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo BART-base tiene ~139 millones de parametros, lo que equivale a aproximadamente 560 MB en precision fp32. Con el checkpoint de 0.6 GB, la inferencia en fp32 requiere menos de 2 GB de VRAM, incluyendo los tensores de activacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1660, RTX 3060 o RTX 4070 funcionan sin problemas. El codigo de inferencia proporcionado tambien soporta CPU (`map_location="cpu"`), por lo que puede ejecutarse sin GPU para cargas de baja latencia no critica.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo moderna. El modelo es pequeno comparado con los LLMs actuales.
- Opciones de despliegue: el modelo se carga con la libreria Transformers de Hugging Face (`AutoModelForSeq2SeqLM`) y requiere PyTorch, PEFT y sentencepiece. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la informacion disponible, aunque al ser un modelo BART estandar podria adaptarse.
- Latencia estimada: no disponible. No hay datos medidos publicados, aunque para un modelo de 139M de parametros la generacion de un highlight de 128 tokens deberia completarse en menos de un segundo en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia |
|---|---|---|---|---|
| sarkarsudipta/bart-base-scihigh | ~139M | 1024 tokens | Highlights cientificos | MIT |
| facebook/bart-base | ~139M | 1024 tokens | Sumarizacion general | Apache 2.0 |
| google/pegasus | ~568M | 512 tokens | Sumarizacion abstractiva | Apache 2.0 |
| t5-base | ~220M | 512 tokens | Texto a texto (incluye sumarizacion) | Apache 2.0 |

La comparativa se basa en las especificaciones publicas de los modelos base. No hay datos de rendimiento comparativo disponibles para este fine-tuning especifico.

## Limitaciones y advertencias

- Especializacion limitada: el modelo fue ajustado exclusivamente para el dataset de SciHigh 2026 - Tarea 1. Su rendimiento puede degradarse en textos cientificos de dominios o distribuciones diferentes a las del entrenamiento.
- Riesgo de alucinacion: los highlights generados pueden contener imprecisiones factuales, omisiones, descripciones incompletas o afirmaciones demasiado generales, como advierte el propio autor en la model card.
- Idioma: solo soporta ingles. No se ha entrenado ni evaluado en otros idiomas.
- Formato de checkpoint propietario: el modelo se distribuye como un checkpoint de PyTorch (`.pth`) que requiere cargar primero el modelo base y despues los pesos entrenados. No se proporciona en formato safetensors ni como adaptador PEFT estandar, lo que complica su uso con herramientas como vLLM o TGI.
- Sin benchmarks publicados: no hay metricas objetivas que permitan evaluar la calidad del modelo frente a alternativas.
- Sin datos de entrenamiento publicados: el dataset SciHigh 2026 no esta descrito en detalle (tamano, composicion, dominios cientificos cubiertos).
- Uso en produccion: el autor indica que el texto generado debe evaluarse antes de usarse en aplicaciones cientificas posteriores. No es adecuado para uso automatico sin supervision humana.
- El repositorio no presenta descargas ni valoraciones (0 descargas, 0 likes), lo que sugiere que se trata de una publicacion reciente sin validacion por parte de la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sarkarsudipta/bart-base-scihigh
- Modelo base: https://huggingface.co/facebook/bart-base
- Articulo original de BART (Lewis et al.): https://arxiv.org/abs/1910.13461
- Repositorio de referencia de BART-base en GitHub: https://github.com/abselhi/bart-base
- Guia sobre BART (Bidirectional & Autoregressive Transformer): https://quantumailabs.net/guide-to-bart-bidirectional-autoregressive-transformer/
- Variante Keras de BART-base: https://huggingface.co/keras/bart_base_en
- Analisis de bart-base (usos y alternativas): https://www.aimodels.fyi/models/huggingFace/bart-base-facebook
