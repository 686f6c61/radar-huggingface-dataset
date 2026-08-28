# Ganth1811/sino-nom-to-vietnamese-mbart-5epoch

## Resumen

El modelo `Ganth1811/sino-nom-to-vietnamese-mbart-5epoch` es un fine-tuning del modelo multilingüe mBART (Multilingual Denoising Pre-training for Neural Machine Translation) especializado en la traducción de texto en chữ Nôm (escritura sino-vietnamita histórica) al vietnamita moderno. Lo desarrolla Ngo Quang Thang (usuario Ganth1811 en HuggingFace), con el objetivo de facilitar la lectura y digitalización de documentos históricos vietnamitas escritos en esta grafía.

El modelo tiene 611.129.542 parámetros (aproximadamente 611 millones), lo que coincide con la arquitectura mBART-large, y se distribuye en formato safetensors con un tamaño de repositorio de 2,5 GB. Según el nombre del checkpoint, el entrenamiento se realizó durante 5 épocas, aunque no se publican detalles sobre el conjunto de datos ni los hiperparámetros. La tarea principal es text2text-generation, es decir, generación de texto a partir de texto, en este caso traducción automática.

La relevancia de este modelo radica en la preservación del patrimonio cultural vietnamita: el chữ Nôm fue el sistema de escritura utilizado en Vietnam durante casi un milenio, y su traducción automática al vietnamita actual abre la puerta a la investigación histórica, la digitalización de archivos y el acceso público a textos antiguos. El autor también ha publicado un checkpoint intermedio (`sino-nom-checkpoint`) y una aplicación móvil en Google Play ("Kim Hán Nôm") que utiliza esta tecnología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mBART (transformer encoder-decoder) |
| Parametros totales | 611.129.542 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (mBART base usa 1024 tokens, no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por la tarea: chino/sino-nom a vietnamita) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

mBART es un modelo transformer encoder-decoder preentrenado mediante denoising multilingüe sobre corpus de 25 idiomas. El fine-tuning para traducción sino-nom a vietnamita se realizó sobre esta base, ajustando los pesos durante 5 épocas. No se dispone de información sobre el dataset de entrenamiento, el preprocesamiento ni los hiperparámetros exactos. El tag `arxiv:1910.09700` hace referencia al paper original de mBART, lo que confirma la arquitectura base. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o mecanismos de atención alternativos.

## Capacidades

- Traducción automática de texto en chữ Nôm (escritura sino-vietnamita) al vietnamita moderno.
- Generación de texto a partir de texto (text2text-generation) mediante la librería Transformers.
- Compatible con la API de Transformers y con endpoints de inferencia (etiqueta `endpoints_compatible`).
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio. El modelo es estrictamente un traductor neuronal.

## Casos de uso

- Digitalización de manuscritos históricos: el modelo puede convertir transcripciones en chữ Nôm a vietnamita moderno, facilitando la creación de archivos digitales legibles para investigadores y el público general.
- Investigación académica en historia y filología vietnamita: permite analizar documentos antiguos sin necesidad de un experto en chữ Nôm, acelerando el estudio de fuentes primarias.
- Traducción de inscripciones y documentos religiosos: muchas estelas, textos budistas y registros administrativos están en chữ Nôm; este modelo puede ayudar a traducirlos para su difusión.
- Desarrollo de aplicaciones de patrimonio cultural: el autor ya ha publicado una app en Google Play ("Kim Hán Nôm") que utiliza esta tecnología, lo que demuestra su viabilidad en productos comerciales.
- Enriquecimiento de bases de datos lingüísticas: el modelo puede generar pares de traducción para construir corpus paralelos sino-nom-vietnamita, útiles para entrenar otros modelos.
- Acceso público a la literatura clásica vietnamita: permite traducir obras literarias escritas en chữ Nôm, como la poesía de Hồ Xuân Hương, para lectores contemporáneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas como BLEU, METEOR o comparaciones con otros modelos de traducción en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: con 611 millones de parámetros, en precisión fp32 el modelo ocupa aproximadamente 2,4 GB de memoria. En fp16 (si se convierte) ocuparía unos 1,2 GB. Se recomienda al menos 4 GB de VRAM para inferencia cómoda en fp32.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4060, o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Despliegue: compatible con la librería Transformers de HuggingFace, vLLM, TGI (Text Generation Inference) y otros frameworks que soporten modelos seq2seq. No se ha confirmado soporte para llama.cpp u Ollama, que están orientados a modelos decoder-only.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (por ejemplo, RTX 3090) se espera una latencia de decenas de milisegundos por secuencia, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ganth1811/sino-nom-to-vietnamese-mbart-5epoch | 611 M | no disponible | Traducción sino-nom → vietnamita | no disponible | HuggingFace |
| mBART-large (original) | 680 M | 1024 tokens | Traducción multilingüe (50 idiomas) | MIT | HuggingFace |
| BARTpho (VinAIResearch) | 224 M | 1024 tokens | Modelo vietnamita encoder-decoder | MIT | GitHub/HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la tarea específica de traducción sino-nom. BARTpho está diseñado para vietnamita moderno, no para chữ Nôm, por lo que no es una alternativa directa. mBART original no está entrenado para esta tarea, por lo que este fine-tuning es un caso de uso especializado.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o riesgos de alucinación. Al ser un modelo de traducción pequeño (611 M), puede producir traducciones inexactas en textos complejos o con vocabulario poco frecuente.
- La longitud de contexto no está confirmada; si sigue el estándar de mBART (1024 tokens), documentos largos deberán segmentarse, lo que puede afectar la coherencia.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- El modelo no ha sido evaluado públicamente con métricas estándar, por lo que su calidad real es desconocida.
- Al estar especializado en chữ Nôm, su rendimiento en vietnamita moderno o en otros idiomas es limitado.
- No se proporcionan datos sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos regionales o históricos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Ganth1811/sino-nom-to-vietnamese-mbart-5epoch)
- [Checkpoint intermedio del mismo autor](https://huggingface.co/Ganth1811/sino-nom-checkpoint)
- [Perfil del autor en HuggingFace](https://huggingface.co/Ganth1811)
- [App "Kim Hán Nôm" en Google Play](https://play.google.com/store/apps/details?id=com.sinonomtranslatorapp&hl=en-US)
- [Paper de mBART (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
- [Repositorio de BARTpho (VinAIResearch)](https://github.com/VinAIResearch/BARTpho)
