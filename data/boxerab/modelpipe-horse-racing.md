# boxerab/modelpipe-horse-racing

## Resumen

`modelpipe-horse-racing` es un conjunto de tres clasificadores de imagen publicados por el usuario boxerab como parte de la demo `horse_racing` del proyecto modelpipe, una herramienta de Collabora para construir pipelines de visión por computador. No se trata de un modelo generativo ni de un LLM, sino de tres checkpoints independientes de redes convolucionales destinados a analizar retransmisiones de carreras de caballos: detectar el estado de la carrera, determinar si las puertas de salida ya se han abierto y leer el número del dorsal de cada caballo.

Los tres modelos se obtuvieron mediante fine-tuning de pesos ImageNet de torchvision: dos EfficientNet-B0 (a 256 px y 512 px) y un ResNet-18 (a 128 px). El entrenamiento se realizó sobre nueve retransmisiones del hipódromo venezolano La Rinconada disponibles en Wikimedia Commons, con validación sobre una décima retransmisión reservada. El repositorio ocupa 0,1 GB y se distribuye bajo licencia MPL-2.0.

Su relevancia es acotada: es un ejemplo práctico y reproducible de pipeline de clasificación de vídeo para un dominio muy específico (carreras de caballos), útil como referencia para quien quiera montar sistemas similares de segmentación de eventos deportivos o lectura de dorsales, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (race_state, race_start_window) y ResNet-18 (numbers) |
| Parametros totales | no disponible (EfficientNet-B0 ~5,3 M; ResNet-18 ~11,7 M, según arquitecturas estándar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MPL-2.0 |
| Formato de pesos | `.pth` (checkpoints PyTorch con dict de `architecture`, `classes`, `image_size` y `state_dict`) |

## Arquitectura y entrenamiento

Cada checkpoint es un clasificador convolucional independiente. `race_state.pth` usa EfficientNet-B0 a 256 px y clasifica en tres clases: `gate_scene`, `other` y `race_running`. `race_start_window.pth` usa EfficientNet-B0 a 512 px y clasifica en `after` y `before` respecto a la apertura de las puertas. `numbers.pth` usa ResNet-18 a 128 px para leer el número del dorsal de un recorte de caballo, con clases de `1` a `14` más `none`. Los tres parten de pesos ImageNet de torchvision y se cargan mediante el script `plugins/python/utils/image_classifier.py` del repositorio modelpipe.

El ajuste fino se realizó sobre nueve emisiones «REUNIÓN 0N - HIPÓDROMO LA RINCONADA» de Wikimedia Commons (marcadas PD-VenezuelaGov), y la evaluación se hizo sobre la emisión reservada «REUNIÓN 08». La model card remite a `demo/horse_racing/README.md` para los pasos de entrenamiento y los resultados, pero no se incluyen cifras en la información disponible.

## Capacidades

- Clasificación del estado de la carrera en tres categorías (previa/puertas, otros, carrera en curso) a partir de fotogramas de vídeo.
- Detección del instante de apertura de puertas (clase binaria antes/después).
- Reconocimiento del número de dorsal de un caballo recortado, con 14 clases numéricas más una clase `none`.
- Procesamiento de imagen únicamente; no soporta texto, audio, tool calling ni razonamiento multi-paso.
- Integración en pipelines de vídeo a través de modelpipe, encadenando los tres clasificadores sobre fotogramas y recortes.

## Casos de uso

- Segmentación automática de retransmisiones de carreras: aplicar `race_state` fotograma a fotograma para separar los tramos previos a la salida, los momentos muertos y la carrera en curso, y generar capítulos o clips automáticos.
- Detección del momento exacto de la salida: `race_start_window` permite marcar el instante en que se abren las puertas, útil para sincronizar estadísticas o cortes publicitarios.
- Identificación de participantes: tras detectar caballos, `numbers` lee el dorsal y permite asociar cada ejemplar a su número de programa en una base de datos de la carrera.
- Generación de resúmenes deportivos: combinando los tres clasificadores se puede producir un resumen estructurado (salida, participantes, desarrollo) a partir del vídeo bruto.
- Investigación en visión por computador aplicada al deporte: sirve como referencia reproducible de fine-tuning ligero (EfficientNet-B0 y ResNet-18) sobre un dominio acotado.
- Prototipos de arbitraje o verificación: la clasificación de estado y de apertura de puertas puede usarse como señal auxiliar en sistemas de revisión de salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados sobre la emisión reservada «REUNIÓN 08» están en `demo/horse_racing/README.md`, pero esas cifras no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: muy baja; al tratarse de EfficientNet-B0 (~5,3 M de parámetros) y ResNet-18 (~11,7 M), la inferencia cabe holgadamente en cualquier GPU consumer con 4-8 GB.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior, T4, L4, A10). Incluso CPU es viable para procesamiento por lotes de fotogramas.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 4 GB de VRAM; también en iGPU para flujos de baja resolución.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre los `.pth`), exportación a TorchScript u ONNX, y ejecución dentro del pipeline de modelpipe.
- Latencia y throughput: no disponibles; dependen del hardware y de la resolución (128, 256 y 512 px).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de clasificación específica de carreras de caballos. Como referencia genérica de arquitectura, EfficientNet-B0 y ResNet-18 son clasificadores ImageNet estándar ampliamente usados, pero no hay datos de rendimiento de este ajuste frente a alternativas.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado solo con retransmisiones del hipódromo La Rinconada; el rendimiento en otras pistas, cámaras o resoluciones puede degradarse.
- Sin métricas publicadas en la información disponible: no se puede evaluar la precisión real sin consultar el README del repositorio.
- Riesgo de falsos positivos y negativos en la lectura de dorsales (oclusión, mala iluminación, números no visibles).
- No soporta texto, audio ni interacción conversacional; no es un modelo de propósito general.
- Licencia MPL-2.0: permite uso comercial y modificación, pero las obras derivadas deben distribuirse bajo la misma licencia y conservar los avisos; conviene revisar las obligaciones de copyleft débil.
- Los datos de entrenamiento provienen de emisiones marcadas PD-VenezuelaGov; verificar la situación de derechos si se reutilizan para otros fines.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/boxerab/modelpipe-horse-racing
- Repositorio modelpipe: https://github.com/collabora/modelpipe
- Categoría de Wikimedia Commons (Hipódromo de La Rinconada): https://commons.wikimedia.org/wiki/Category:Hip%C3%B3dromo_de_La_Rinconada
