# MUWU/MAGIC-RN50-experts

## Resumen

MAGIC-RN50-experts es un conjunto de ocho checkpoints de clasificacion de imagenes derivados de un backbone ResNet-50 (RN50) preentrenado con CLIP de OpenAI. Cada uno de los ocho expertos ha sido ajustado por los autores del proyecto MAGIC sobre una tarea concreta de clasificacion: SUN397 (escenas), Cars (vehiculos), RESISC45 (imagenes aereas), EuroSAT (satelite), SVHN (digitos de calle), GTSRB (senales de trafico), MNIST (digitos manuscritos) y DTD (texturas). No se trata de checkpoints de terceros, sino de los propios expertos experimentales usados en el trabajo MAGIC sobre fusion de modelos.

El interes de este repositorio no esta en un unico modelo generalista, sino en la reproducibilidad de un experimento de model merging: los ocho expertos comparten exactamente la misma inicializacion (el checkpoint CLIP RN50 de OpenAI, identificado por un SHA256 publico), lo que permite estudiar como se combinan sus pesos y como se comporta la fusion frente a los expertos individuales. El repositorio incluye cabezas de clasificacion congeladas, configuraciones de entrenamiento, splits exactos, rankings de sensibilidad y ajustes de fusion.

Arquitectura y tamano corresponden a un ResNet-50 clasico con cabezas lineales por tarea; no es un modelo generativo ni un LLM, sino un clasificador de vision. El repo ocupa 2,1 GB en total, con ocho ficheros de encoder de aproximadamente 257 MB cada uno. La relevancia actual es acotada pero clara para quien investiga tecnicas de merging, ensembles o adaptacion eficiente de backbones CLIP en dominios especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (RN50) como image encoder de CLIP, con cabeza de clasificacion lineal congelada por tarea |
| Parametros totales | no disponible (el encoder RN50 de CLIP se situa en torno a 25,5 M de parametros; el dato exacto no figura en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas de idioma del repositorio) |
| Licencia | no disponible |
| Formato de pesos | PyTorch serializado (`.pt`), objetos `src.modeling.ImageEncoder` y cabezas `head_{task}.pt` |
| Tamano del repositorio | 2,1 GB |
| Tamano por encoder | 257.106.027 bytes (ocho expertos: 2.056.848.216 bytes) |
| Tamano de cabezas | 3.122.914 bytes en total |
| Tareas | SUN397, Cars, RESISC45, EuroSAT, SVHN, GTSRB, MNIST, DTD |
| Inicializacion compartida | CLIP RN50 de OpenAI, SHA256 `97f59cabfac09d49710ad095f9594a9d2bbff65c78a251d21dc1062791b83d40` |
| Pipeline | image-classification |

## Arquitectura y entrenamiento

Cada experto es un `ImageEncoder` basado en ResNet-50, inicializado desde el mismo checkpoint CLIP RN50 de OpenAI. Sobre ese backbone se entrena una cabeza de clasificacion congelada por tarea, de modo que el ajuste se concentra en el encoder. El entrenamiento usa AdamW con weight decay 0,1, batch size 128, decaimiento cosine del learning rate y gradient clipping con norma 1. Las semillas de modelo y de split son 42 y 22 respectivamente.

Las estadisticas de BatchNorm permanecen fijas en la inicializacion compartida y no deben recalcularse en evaluacion: hay que usar `model.eval()`. Existen dos politicas de BatchNorm registradas en las configuraciones: `all`, que congela tambien los parametros afines, y `stats`, que permite aprendizaje de los afines. Cada tarea tiene su propio learning rate, presupuesto de epocas, paciencia de validacion, epoca seleccionada y politica de BatchNorm, documentados en `configs/{task}/config.json` y `result.json`.

El repositorio esta orientado al experimento de fusion de modelos: incluye `configs/fusion_settings.json` con las variantes de merger, escalas y correcciones realmente usadas, `configs/calibration_split.json` y `sensitivity.json` con indices de calibracion y rankings de sensibilidad, y `configs/DEFAULT_RESULTS.json` con los resultados actuales de respuesta RN50 con cota superior fija 2. Los splits originales de entrenamiento y validacion estan en `configs/splits.json`, sin imagenes de entrenamiento incluidas. El manifiesto de entrenamiento registra orden de clases, checksum de inicializacion compartida y tamanos de dataset.

## Capacidades

- Clasificacion de imagenes en ocho dominios especializados: escenas (SUN397), coches (Cars), imagenes aereas (RESISC45), satelite (EuroSAT), digitos de calle (SVHN), senales de trafico (GTSRB), digitos manuscritos (MNIST) y texturas (DTD).
- Extraccion de caracteristicas visuales mediante el encoder RN50 heredado de CLIP.
- Evaluacion reproducible gracias a cabezas congeladas, splits exactos y checksums SHA256.
- Analisis de fusion de modelos: los pesos y ajustes de merger permiten reproducir experimentos de merging sobre expertos con inicializacion comun.
- Analisis de sensibilidad por tarea mediante los rankings incluidos en `sensitivity.json`.
- Preprocesado de imagen embebido en el propio modelo (`encoder.val_preprocess`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un clasificador visual, no un LLM.
- Capacidades multilingues: no aplica; el repositorio declara solo `en`.

## Casos de uso

- Investigacion en model merging: usar los ocho expertos con inicializacion identica para reproducir y comparar variantes de fusion (pesos medios, task arithmetic, correcciones por sensibilidad) frente a los expertos individuales, apoyandose en `fusion_settings.json`.
- Clasificacion de escenas y entornos: desplegar el experto SUN397 para etiquetar imagenes de interiores y exteriores en catalogos fotograficos o sistemas de organizacion automatica de bibliotecas de imagenes.
- Reconocimiento de senales de trafico: el experto GTSRB permite clasificar senales en pipelines de asistencia a la conduccion o de auditoria de inventario viario, siempre con validacion adicional en dominio real.
- Clasificacion de imagenes de satelite: el experto EuroSAT sirve para tareas de etiquetado de uso del suelo en imagenes Sentinel, integrado como etapa de preetiquetado en flujos de anulado supervisado.
- Lectura de digitos manuscritos: el experto MNIST es util como referencia o componente de linea base en sistemas de digitalizacion de formularios, combinado con detectores de regiones.
- Analisis de imagenes aereas: el experto RESISC45 permite clasificar escenas en datasets de teledeteccion para experimentos de comparacion de backbones CLIP.
- Estudio de sensibilidad al ajuste: usar `calibration_split.json` y `sensitivity.json` para medir que tareas son mas fragiles ante la fusion y disenar estrategias de regularizacion.
- Baseline academico reproducible: como punto de partida controlado (semillas y checksums publicos) en papers sobre adaptacion de CLIP a dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye ficheros `result.json` por tarea con resumenes de epoca seleccionada y `DEFAULT_RESULTS.json` con resultados de respuesta del experimento de fusion, pero sus cifras no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; cada encoder pesa aproximadamente 257 MB en precision original, por lo que un solo experto en fp32 requiere del orden de 1 GB de memoria considerando activaciones de batch pequeno.
- Los ocho expertos juntos suman 2.056.848.216 bytes de pesos, unos 2 GB en precision original; cargarlos simultaneamente exige al menos 2-3 GB de VRAM o el uso de CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente para un unico experto; para fusion o comparaciones simultaneas de varios expertos conviene una RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, con holgura, al tratarse de un ResNet-50.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` con `weights_only=False`), previa instalacion del codigo fuente de MAGIC y haciendo importable su paquete `src`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de compatibilidad: con versiones recientes de torchvision, los pickles de transformacion antiguos pueden requerir el helper `ensure_transform_compatibility` para anadir el atributo `antialias` en memoria.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAGIC-RN50-experts | ResNet-50 (CLIP) + cabeza lineal | no disponible | no aplica | no disponible | Hugging Face (MUWU) |
| CLIP RN50 original (OpenAI) | ResNet-50 + proyeccion texto-imagen | no disponible | no aplica | no disponible en esta ficha | GitHub de OpenAI CLIP |
| Expertos RN50 de terceros | ResNet-50 (CLIP) | no disponible | no aplica | variable | repositorios de terceros |
| Backbones ViT de CLIP | Vision Transformer | no disponible | no aplica | no disponible en esta ficha | OpenAI CLIP |

La comparativa se limita a la familia CLIP RN50 porque no se dispone de datos de rendimiento de alternativas en la informacion proporcionada. La diferencia principal frente a terceros es que estos expertos comparten inicializacion verificable por checksum, lo que facilita experimentos de merging controlados.

## Limitaciones y advertencias

- Modelo exclusivamente de vision y clasificacion: no genera texto, no razona y no soporta tool calling ni agentes.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que consultar el repositorio de GitHub de MAGIC antes de cualquier despliegue productivo.
- El backbone subyacente es CLIP RN50, con los sesgos conocidos de los datasets de preentrenamiento web de CLIP; los expertos heredan esos sesgos y anaden los de sus datasets especificos.
- Riesgo de sobreajuste a los dominios de entrenamiento: cada experto esta ajustado a una tarea concreta y no se ha validado su generalizacion fuera de ella en la informacion disponible.
- Las estadisticas de BatchNorm estan congeladas; recalcularlas altera el comportamiento esperado del modelo.
- El formato `.pt` serializado requiere `weights_only=False` y el codigo fuente de MAGIC, lo que implica cargar codigo de terceros en el entorno de ejecucion.
- Posible incompatibilidad de los pickles de transformacion con versiones nuevas de torchvision, que puede requerir el helper `ensure_transform_compatibility`.
- No se incluyen imagenes de entrenamiento ni rutas privadas; los splits son solo indices, lo que limita la reproduccion completa sin acceso a los datasets originales.
- Idioma declarado solo `en`; las etiquetas de clase y la documentacion estan en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MUWU/MAGIC-RN50-experts
- Codigo de MAGIC: https://github.com/lyymuwu/MAGIC
- CLIP de OpenAI: https://github.com/openai/CLIP
- Ficha en Free2AITools: https://free2aitools.com/model/muwu/magic-rn50-experts
