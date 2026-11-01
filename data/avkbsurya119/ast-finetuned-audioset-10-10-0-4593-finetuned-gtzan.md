# avkbsurya119/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan

## Resumen

El modelo `avkbsurya119/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan` es un ajuste fino del Audio Spectrogram Transformer (AST) de MIT, concretamente del checkpoint `MIT/ast-finetuned-audioset-10-10-0.4593`, especializado en clasificación de generos musicales sobre el conjunto de datos GTZAN. Lo desarrolla el usuario avkbsurya119 y se publica bajo licencia BSD-3-Clause, lo que permite su uso comercial sin restricciones significativas.

El modelo resuelve la tarea de clasificacion de audio (audio-classification) en diez categorias de genero musical, partiendo de un backbone preentrenado en AudioSet, un corpus a gran escala de eventos sonoros. Con 86,2 millones de parametros, es un modelo compacto que puede ejecutarse en hardware modesto y que se integra de forma nativa en el ecosistema Transformers.

Su relevancia actual radica en que demuestra como un modelo de proposito general preentrenado en eventos sonoros puede adaptarse con un coste computacional reducido (8 epocas, batch efectivo de 16) a una tarea musical especifica, alcanzando un 0,91 de exactitud declarada en el conjunto de evaluacion. Es una referencia util para quien necesite un clasificador de generos musicales ligero y desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | 86.196.490 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de espectrograma de audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en el Audio Spectrogram Transformer, una arquitectura de tipo transformer puro que aplica mecanismos de atencion sobre espectrogramas de Mel divididos en parches, sin convoluciones. El backbone parte del checkpoint `MIT/ast-finetuned-audioset-10-10-0.4593`, preentrenado en AudioSet, y se ajusta posteriormente sobre el dataset GTZAN (configuracion `all`), que contiene fragmentos de audio etiquetados con diez generos musicales.

El ajuste fino se realizo durante 8 epocas con un learning rate de 3e-05, batch de entrenamiento de 8, acumulacion de gradientes de 2 (batch efectivo de 16), optimizador AdamW con betas (0,9; 0,999), scheduler lineal con 45 pasos de calentamiento y precision mixta nativa (AMP). La perdida de entrenamiento cae de 0,8715 en la primera epoca a 0,0015 en la octava, mientras que la perdida de validacion se estabiliza en torno a 0,33 y la exactitud alcanza su maximo de 0,92 en la epoca 7, cerrando en 0,91 en la epoca 8. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, al tratarse de una tarea de clasificacion y no de generacion.

## Capacidades

- Clasificacion de audio en diez categorias de genero musical (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock) segun el etiquetado de GTZAN.
- Extraccion de representaciones a partir de espectrogramas de Mel mediante atencion sobre parches.
- Inferencia directa con la pipeline `audio-classification` de Transformers.
- Ajuste fino adicional sobre nuevos datasets de audio con coste reducido.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingues ni de generacion de texto.
- No incorpora modo thinking, vision ni audio generativo.

## Casos de uso

- Clasificacion automatica de generos musicales en plataformas de streaming: el modelo puede etiquetar pistas entrantes con uno de los diez generos de GTZAN para alimentar sistemas de recomendacion o catalogacion, con un coste de inferencia bajo gracias a sus 86 millones de parametros.
- Organizacion de bibliotecas musicales personales: integrado en scripts locales, permite agrupar automaticamente colecciones de audio por genero sin depender de servicios en la nube.
- Preetiquetado en pipelines de anotacion: sirve como primer paso para reducir el trabajo manual de etiquetado en proyectos de curaduria musical, dejando la revision final a anotadores humanos.
- Filtrado de contenido en emisoras o podcasts: permite detectar y separar segmentos musicales por genero dentro de grabaciones largas, combinado con un segmentador previo.
- Investigacion en musicologia computacional: proporciona una linea base reproducible con hiperparametros documentados para experimentos de clasificacion de genero sobre GTZAN.
- Prototipado rapido de aplicaciones de audio: al ser compatible con la pipeline de Transformers, se puede desplegar en pocas lineas de codigo para demos o pruebas de concepto.
- Educacion y docencia: sirve como ejemplo didactico de ajuste fino de un transformer de audio con el Trainer de Hugging Face.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| GTZAN (`marsyas/gtzan`, config `all`) | train | Accuracy | 0,91 |
| GTZAN (evaluacion, epoca 8) | evaluacion | Loss | 0,3362 |
| GTZAN (evaluacion, epoca 8) | evaluacion | Accuracy | 0,91 |
| GTZAN (evaluacion, epoca 7) | evaluacion | Accuracy | 0,92 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,35 GB solo para pesos (86,2 M de parametros), mas el overhead de activaciones y buffers de audio.
- VRAM estimada en FP16: en torno a 0,2 GB para pesos, con margen adicional para el procesamiento del espectrograma.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1060, RTX 2060, RTX 3060, RTX 4090, asi como en CPU para inferencia por lotes pequenos.
- GPU recomendadas para produccion de alto throughput: A100, H100, L4 o T4; para desarrollo, cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: pipeline `audio-classification` de Transformers, TorchServe, TGI (si se adapta la tarea), ONNX Runtime y exportacion a formatos optimizados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dataset | Accuracy declarada | Licencia |
|---|---|---|---|---|---|
| avkbsurya119/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan | 86,2 M | Clasificacion de genero musical | GTZAN | 0,91 | BSD-3-Clause |
| MIT/ast-finetuned-audioset-10-10-0.4593 (modelo base) | 86,2 M | Clasificacion de eventos sonoros | AudioSet | no disponible | BSD-3-Clause |
| Otros ajustes de AST sobre GTZAN | no disponible | Clasificacion de genero musical | GTZAN | no disponible | no disponible |

La comparativa con alternativas especificas de la misma categoria no esta disponible en la informacion proporcionada; el unico punto de referencia documentado es el modelo base del que deriva.

## Limitaciones y advertencias

- La exactitud de 0,91 declarada por el autor no ha sido verificada de forma independiente y procede de un unico split de evaluacion.
- El modelo se ha ajustado exclusivamente sobre GTZAN, un dataset con solo diez generos y conocido por sus limitaciones (desbalanceo, posible contaminacion entre splits y baja diversidad musical); la generalizacion a generos fuera de esa lista es limitada.
- No se documentan sesgos especificos, pero al derivar de AudioSet hereda los sesgos de etiquetado de dicho corpus.
- No se proporciona informacion sobre el preprocesado exacto de audio (frecuencia de muestreo, duracion de fragmento) ni sobre robustez ante ruido, lo que puede provocar degradacion en produccion si la entrada difiere de la distribucion de entrenamiento.
- Al ser un modelo de clasificacion, no genera texto y no admite prompts; cualquier expectativa de uso conversacional es inaplicable.
- La licencia BSD-3-Clause permite uso comercial, pero conviene revisar las condiciones del modelo base MIT y del dataset GTZAN, que pueden tener sus propias restricciones.
- El numero de descargas (59) y la ausencia de likes sugieren una validacion comunitaria muy limitada; se recomienda evaluar el modelo en el dominio objetivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avkbsurya119/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
