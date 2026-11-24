# ccmusic-database/CTIS

## Resumen

CTIS (Chinese Traditional Instrument Sound Model) es un clasificador de audio especializado en reconocer las caracteristicas sonoras de instrumentos musicales tradicionales chinos. Lo desarrolla el equipo ccmusic-database, vinculado al proyecto CCMusic, una base de datos abierta para investigacion en recuperacion de informacion musical china. El modelo cubre grabaciones de mas de 200 tipos de instrumentos tradicionales, instrumentos modificados e instrumentos de minorias etnicas, incluyendo algunos poco conocidos entre el publico general en China.

El modelo no es un LLM ni un transformer generativo: se trata de una familia de clasificadores de imagen (backbones de vision como regnet_y_32gf, vgg19_bn, swin_t, vit_l_32, entre otros) reentrenados sobre representaciones espectrograficas de audio (Mel, CQT y Chroma). Cada backbone se evalua por separado y el mejor resultado publicado alcanza un 0.980 de exactitud con regnet_y_32gf sobre caracteristicas CQT.

Es relevante ahora porque demuestra que backbones de vision preentrenados, aplicados a espectrogramas, pueden resolver tareas de clasificacion de audio con exactitud alta y coste computacional moderado. El repositorio ocupa 5.3 GB e incluye los pesos de multiples backbones y sus variantes de representacion, lo que permite elegir el equilibrio entre precision y tamano segun el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN y transformers de vision (regnet_y_32gf, vgg19_bn, resnet101, swin_t, vit_l_32, alexnet, inception_v3) sobre espectrogramas Mel, CQT y Chroma |
| Parametros totales | Variable segun backbone: desde 27.2 M (inception_v3) hasta 306.5 M (vit_l_32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion de audio, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la salida es clasificacion de instrumentos, no texto) |
| Licencia | MIT |
| Formato de pesos | no disponible en la informacion proporcionada (repo de 5.3 GB con multiples backbones; se descarga via `snapshot_download`) |

## Arquitectura y entrenamiento

La familia CTIS agrupa varios backbones de vision preentrenados, reutilizados como extractores de caracteristicas sobre imagenes de espectrograma. Las representaciones acusticas empleadas son Mel, CQT (Constant-Q Transform) y Chroma. Para cada combinacion backbone-representacion se entrena un clasificador sobre el dataset de instrumentos tradicionales chinos, con mas de 200 clases. El backbone mas pequeno es inception_v3 (27.2 M parametros) y el mayor vit_l_32 (306.5 M); regnet_y_32gf (145 M) y vgg19_bn (143.7 M) se situan en el rango medio-alto.

Los detalles de entrenamiento (numero de epochs, composicion exacta del dataset, augmentacion, funcion de perdida, hiperparametros) no estan disponibles en la informacion proporcionada. La model card documenta curvas de perdida, curvas de exactitud de entrenamiento y validacion, y matriz de confusion para el mejor resultado (regnet_y_32gf con CQT, entrenado el 2024-12-02). El dataset asociado esta publicado en Hugging Face como `ccmusic-database/CTIS` y el codigo de evaluacion en el repositorio GitHub `monetjoe/ccmusic_eval`.

## Capacidades

- Clasificacion de audio en mas de 200 clases de instrumentos tradicionales chinos, instrumentos modificados e instrumentos de minorias etnicas.
- Extraccion de caracteristicas acusticas mediante tres representaciones: Mel, CQT y Chroma.
- Multiples backbones intercambiables para ajustar precision frente a coste: regnet_y_32gf, vgg19_bn, resnet101, swin_t, vit_l_32, alexnet, inception_v3.
- Identificacion de instrumentos poco frecuentes en el repertorio general, segun la model card.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No se documentan capacidades multilingues, vision general, audio generativo ni modo de razonamiento.

## Casos de uso

- Recuperacion de informacion musical (MIR): clasificar automaticamente el instrumento presente en una grabacion para indexar archivos de audio en bibliotecas musicales y facilitar busquedas por instrumento.
- Catalogacion de archivos etnomusicologicos: etiquetar grabaciones historicas de instrumentos tradicionales chinos, incluyendo instrumentos de minorias, para preservacion digital y documentacion.
- Analisis musicologico asistido: apoyar a investigadores en la identificacion sistematica de instrumentos en corpus de grabaciones, reduciendo el trabajo manual de anotacion.
- Educacion musical: construir herramientas que reconozcan el instrumento reproducido en un audio y sirvan de apoyo en el aprendizaje del repertorio tradicional chino.
- Preservacion del patrimonio inmaterial: documentar y clasificar el sonido de instrumentos en riesgo de desaparicion, contribuyendo a su conservacion y estudio.
- Filtrado y moderacion de contenido musical: clasificar el instrumento predominante en un audio para organizar colecciones, generar metadatos o enriquecer plataformas de streaming.
- Investigacion comparativa de representaciones: usar las distintas combinaciones backbone-representacion (Mel, CQT, Chroma) como base para experimentos sobre que espectrograma rinde mejor en clasificacion instrumental.

## Benchmarks y rendimiento

Resultados de exactitud publicados en la model card, por backbone y representacion:

| Backbone | Parametros (M) | Mel | CQT | Chroma |
|---|---|---|---|---|
| vit_l_32 | 306.5 | 0.936 | 0.921 | 0.845 |
| swin_t | 28.3 | 0.956 | 0.940 | 0.759 |
| regnet_y_32gf | 145 | 0.973 | 0.980 | 0.848 |
| vgg19_bn | 143.7 | 0.966 | 0.965 | 0.852 |
| alexnet | 61.1 | 0.936 | 0.921 | 0.661 |
| resnet101 | 44.5 | 0.953 | 0.949 | 0.782 |
| inception_v3 | 27.2 | 0.860 | 0.855 | 0.664 |

El mejor resultado corresponde a regnet_y_32gf con CQT (0.980). La representacion Chroma es sistematicamente la peor en todos los backbones, mientras que Mel y CQT rinden de forma similar. No se publican resultados comparativos con otros modelos de clasificacion instrumental en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa, los backbones van de 27.2 M a 306.5 M parametros, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente para los backbones pequenos y medianos; para vit_l_32 (306.5 M) se recomienda al menos 8 GB de VRAM.
- Cabe en consumer GPU: si, en todas las variantes, dado el reducido tamano de los backbones.
- Opciones de despliegue: descarga via `huggingface_hub.snapshot_download`; demo publica en Hugging Face Spaces (`ccmusic-database/CTIS`); espejo en ModelScope. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador de audio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de clasificacion de instrumentos tradicionales chinos en la informacion proporcionada. La comparativa interna entre backbones del propio CTIS se recoge en la tabla de benchmarks.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CTIS (regnet_y_32gf, CQT) | 145 M | no disponible | 0.980 exactitud | MIT | Hugging Face, ModelScope |
| CTIS (swin_t, Mel) | 28.3 M | no disponible | 0.956 exactitud | MIT | Hugging Face, ModelScope |
| CTIS (resnet101, Mel) | 44.5 M | no disponible | 0.953 exactitud | MIT | Hugging Face, ModelScope |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; el rendimiento puede variar segun la calidad de grabacion, el ruido de fondo y la similitud acustica entre instrumentos.
- Riesgo de alucinacion: no aplica en sentido generativo, pero existe riesgo de clasificacion erronea (falsos positivos) en audios con instrumentos superpuestos o fuera de distribucion.
- Limitaciones de contexto o idioma: el modelo esta entrenado sobre instrumentos tradicionales chinos; la clasificacion de instrumentos occidentales u otros repertorios no esta garantizada.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; conviene revisar los terminos del dataset asociado.
- Caveats para produccion: no se documentan detalles de preprocesado de audio (sample rate, duracion de ventana, normalizacion), lo que puede dificultar la reproducibilidad; el repositorio de 5.3 GB incluye multiples backbones y puede requerir seleccion manual del checkpoint adecuado.
- La representacion Chroma rinde notablemente peor que Mel y CQT; no se recomienda para despliegues que prioricen exactitud.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ccmusic-database/CTIS
- Demo (Space de inferencia): https://huggingface.co/spaces/ccmusic-database/CTIS
- Dataset: https://huggingface.co/datasets/ccmusic-database/CTIS
- Espejo en ModelScope: https://www.modelscope.cn/models/ccmusic-database/CTIS
- Codigo de evaluacion: https://github.com/monetjoe/ccmusic_eval
- Paper (CCMusic, TISMIR 2025): https://doi.org/10.5334/tismir.194
