# ccmusic-database/chest_falsetto

## Resumen

El modelo `chest_falsetto` del repositorio `ccmusic-database` es un clasificador de audio entrenado para distinguir entre voz de pecho y voz de falsete, diferenciando ademas por genero. Concretamente, resuelve una tarea de clasificacion en cuatro clases: voz de pecho masculina, falsete masculino, voz de pecho femenina y falsete femenino. Esta desarrollado por el grupo ccmusic-database, vinculado al proyecto CCMUSIC DATASET para investigacion en musicologia computacional, y se publica bajo licencia MIT.

La aproximacion tecnica es la habitual en clasificacion de audio basada en vision por computador: el audio se transforma en representaciones tiempo-frecuencia (espectrogramas Mel, CQT o Chroma) y se reutiliza una red troncal preentrenada en el dominio de la vision, afinada para la tarea de discriminacion vocal. El modelo card reporta resultados de varios backbones (Swin-S V2, MaxViT-T, AlexNet, ShuffleNet V2 2.0, GoogleNet, MNASNet-A3, SqueezeNet 1.1) sobre las tres representaciones, con un mejor resultado de exactitud de 0,994 usando AlexNet con espectrograma Mel.

Es relevante para tareas de analisis vocal en produccion musical, procesamiento de voz y musicologia computacional, donde la deteccion automatica de registro vocal (pecho frente a falsete) permite etiquetado, busqueda y analisis de grabaciones. El repositorio ocupa 2,3 GB y la model card no detalla arquitectura exacta, numero de parametros ni longitud de contexto, por lo que varios datos tecnicos no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red troncal de vision por computador (CNN o transformer visual) sobre espectrogramas de audio; backbones evaluados: Swin-S V2, MaxViT-T, AlexNet, ShuffleNet V2 2.0, GoogleNet, MNASNet-A3, SqueezeNet 1.1 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clasificacion por segmento de audio, no modelo generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 2,3 GB; la model card solo describe descarga via `snapshot_download`) |

## Arquitectura y entrenamiento

El modelo sigue un paradigma de clasificacion de audio mediante vision por computador. El audio de entrada se convierte en una representacion tiempo-frecuencia (espectrograma Mel, CQT o Chroma) y se procesa con una red troncal preentrenada en vision, que se afina para la tarea de cuatro clases. La model card menciona explicitamente el uso de un backbone de dominio CV y el ajuste fino para mejorar la exactitud en el reconocimiento de categorias vocales.

El entrenamiento utiliza un dataset que contiene muestras de voz real y sintetica, con el objetivo de que el modelo aprenda caracteristicas relevantes de voces de pecho y falsete en ambos generos. El dataset asociado es `ccmusic-database/chest_falsetto` y procede del Music Data Sharing Platform for Computational Musicology Research (CCMUSIC DATASET), citado con DOI 10.5281/zenodo.5676893. No se detallan en la informacion disponible el numero de tokens o muestras de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un clasificador de este tipo).

## Capacidades

- Clasificacion de audio en cuatro categorias: voz de pecho masculina, falsete masculino, voz de pecho femenina y falsete femenino.
- Discriminacion de genero y de registro vocal (pecho frente a falsete) en muestras de audio.
- Procesamiento de audio representado como espectrograma Mel, CQT o Chroma.
- Entrenamiento con muestras reales y sinteticas, lo que puede aportar robustez frente a voces generadas artificialmente.
- No soporta tool calling ni function calling (es un clasificador, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no aplica; el modelo clasifica caracteristicas acusticas, no texto.
- No dispone de modo thinking, vision, audio generativo ni otras capacidades especiales mas alla de la clasificacion.

## Casos de uso

- Etiquetado automatico de archivos de audio en bibliotecas musicales: el modelo permite anotar cada grabacion con la categoria de registro vocal (pecho o falsete) y genero, facilitando la busqueda y organizacion de catalogos.
- Analisis musicologico de corpus vocales: investigadores pueden procesar grandes colecciones de grabaciones para estudiar la distribucion de registros vocales por genero, epoca o estilo, usando la clasificacion como variable cuantitativa.
- Produccion musical y postproduccion: en un flujo de trabajo de mezcla o edicion, el modelo puede identificar segmentos de falsete para aplicar tratamientos especificos (ecualizacion, compresion, efectos) de forma automatizada.
- Deteccion de voz sintetica o manipulada: dado que el entrenamiento incluye muestras reales y sinteticas, el clasificador puede emplearse como componente auxiliar para detectar inconsistencias de registro en voces generadas por sintesis.
- Herramientas de entrenamiento vocal: una aplicacion puede analizar la grabacion de un cantante y clasificar si esta usando voz de pecho o falsete, ofreciendo retroalimentacion objetiva sobre el registro empleado.
- Investigacion en procesamiento de voz: el modelo sirve como baseline reproducible para experimentos de clasificacion de registro vocal, con resultados publicados por backbone y representacion que permiten comparaciones directas.
- Moderacion y analisis de contenido en plataformas de audio: clasificacion rapida de clips para filtrar o categorizar por tipo de voz en pipelines de ingestión.

## Benchmarks y rendimiento

Resultados de exactitud reportados en la model card por backbone y representacion:

| Backbone | Mel | CQT | Chroma |
|---|---|---|---|
| Swin-S V2 | **0,968** | 0,268 | **0,268** |
| MaxViT-T | 0,820 | **0,933** | 0,250 |
| AlexNet | **0,994** | **0,963** | **0,586** |
| ShuffleNet V2 2.0 | 0,939 | 0,669 | 0,222 |
| GoogleNet | 0,983 | 0,274 | 0,292 |
| MNASNet-A3 | 0,756 | 0,260 | 0,320 |
| SqueezeNet 1.1 | 0,963 | 0,900 | 0,378 |
| Media | 0,918 | 0,610 | 0,331 |

El mejor resultado global es AlexNet con representacion Mel (0,994). No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un clasificador de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al tratarse de un clasificador con backbones tipo AlexNet, SqueezeNet o GoogleNet, la huella de inferencia es previsiblemente baja (del orden de cientos de MB a pocos GB), pero no se confirma en la model card.
- GPU recomendadas: no especificadas. Por el tamano de los backbones, una GPU consumer moderna seria suficiente en la mayoria de casos, aunque no hay datos oficiales.
- Cabe en GPU consumer: no confirmado oficialmente; los backbones evaluados son ligeros, pero el repositorio completo ocupa 2,3 GB.
- Opciones de despliegue: la model card solo documenta descarga via `huggingface_hub.snapshot_download` y un Space de demostracion; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables de clasificacion de registro vocal (pecho frente a falsete) con los que establecer una comparativa de parametros, contexto, rendimiento y licencia. La model card unicamente compara internamente distintos backbones (Swin-S V2, MaxViT-T, AlexNet, ShuffleNet V2 2.0, GoogleNet, MNASNet-A3, SqueezeNet 1.1) sobre tres representaciones (Mel, CQT, Chroma), cuyos resultados se recogen en la seccion de benchmarks.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos; al clasificar por genero y registro vocal, existe riesgo de sesgo hacia las caracteristicas de la poblacion presente en el dataset de entrenamiento.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de clasificaciones erroneas en muestras fuera de distribucion (voces atipicas, estilos no representados, grabaciones con ruido).
- Limitaciones de contexto o idioma: el modelo clasifica caracteristicas acusticas; el metadato de idioma "en" no implica restriccion linguistica real, pero no se documenta el comportamiento en otros idiomas o estilos vocales.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribucion y sin garantias; conviene revisar los terminos del dataset asociado.
- Para produccion: la informacion sobre arquitectura exacta, parametros, formato de pesos y requisitos de hardware es incompleta; es necesario validar el rendimiento en el dominio concreto antes de desplegar.
- El modelo se entreno con muestras reales y sinteticas; su comportamiento en voces sinteticas de nuevos generadores no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccmusic-database/chest_falsetto
- Dataset: https://huggingface.co/datasets/ccmusic-database/chest_falsetto
- Demo (Space): https://huggingface.co/spaces/ccmusic-database/chest_falsetto
- Mirror en ModelScope: https://www.modelscope.cn/models/ccmusic-database/chest_falsetto
- Repositorio de evaluacion: https://github.com/monetjoe/ccmusic_eval
- Cita del dataset (Zenodo): https://doi.org/10.5281/zenodo.5676893
