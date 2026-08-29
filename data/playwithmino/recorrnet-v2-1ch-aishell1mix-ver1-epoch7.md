# playwithmino/recorrnet-v2-1ch-aishell1mix-ver1-epoch7

## Resumen

RecorrNet-v2 es un modelo de separacion de voz de un solo canal desarrollado por playwithmino, basado en la arquitectura RecorrNet-v2 con una cabeza de filtro directa de 9 taps. Se presenta como un checkpoint fine-tuned sobre el dataset AISHELL-1 Mix ver1, una version en mandarin del conocido WSJ0-Mix, con mezclas variables de 1 a 5 hablantes y condiciones de audio limpio y con ruido (mix_clean y mix_both). El modelo se inicializa a partir de un SR-CorrNet previamente entrenado en ingles con WSJ0 variable 2-5 hablantes, y se ajusta durante 7 epocas exclusivamente con datos de AISHELL-1 Mix.

Este modelo es relevante porque aborda el problema de la separacion de voz en mandarin, un idioma con caracteristicas tonales y foneticas diferentes al ingles, y demuestra que el fine-tuning sobre un dataset especifico puede transferir capacidades de separacion de un idioma a otro. El checkpoint corresponde al epoch 7 de la version ver1, utilizado en comparaciones entre SR-CorrNet y RecorrNet, aunque no se publican resultados cuantitativos en la informacion disponible. La licencia MIT permite uso comercial y modificacion, y el codigo esta disponible en el repositorio byd-speech-separation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RecorrNet-v2 (cabeza de filtro directa de 9 taps) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en ventanas, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | mandarin (entrenado con AISHELL-1 Mix) |
| Licencia | MIT |
| Formato de pesos | model.pt (PyTorch, weights only) y config.yaml |

## Arquitectura y entrenamiento

RecorrNet-v2 es una variante de la familia SR-CorrNet, disenada para separacion de voz de un solo canal. La arquitectura utiliza una cabeza de filtro directa de 9 taps, que probablemente aplica una transformacion temporal sobre la senal de entrada para estimar las fuentes separadas. El modelo se inicializa con pesos de un SR-CorrNet entrenado en WSJ0 (ingles) con mezclas de 2 a 5 hablantes, y se fine-tunea sobre AISHELL-1 Mix ver1, que incluye mezclas variables de 1 a 5 hablantes en mandarin, con y sin ruido (mix_clean y mix_both). El entrenamiento se realizo durante 7 epocas, como indica el checkpoint `epoch.0007.pth`. No se especifican detalles sobre el dataset de entrenamiento (numero total de horas, proporciones de ruido, etc.) ni sobre tecnicas adicionales como data augmentation o regularizacion.

## Capacidades

- Separacion de voz de un solo canal: extrae las voces individuales de una mezcla mono de hasta 5 hablantes.
- Manejo de mezclas variables: soporta desde 1 hasta 5 hablantes simultaneos, lo que lo hace util para escenarios realistas con numero desconocido de participantes.
- Robustez a ruido: entrenado con condiciones mix_both (con ruido WHAM!-style), lo que mejora su rendimiento en entornos ruidosos.
- Procesamiento audio-audio: la entrada y salida son senales de audio (formato WAV u otro), sin transcripcion intermedia.
- Transferencia interidioma: el fine-tuning sobre mandarin partiendo de pesos en ingles demuestra cierta capacidad de adaptacion a nuevos idiomas.

## Casos de uso

- Transcripcion automatica de reuniones: preprocesar grabaciones mono de reuniones con varios participantes para separar las voces y mejorar la precision de sistemas ASR en mandarin.
- Mejora de audiolibros y podcasts: separar la voz del locutor de musica de fondo o ruido ambiental en grabaciones de un solo canal.
- Extraccion de hablante objetivo: aislar la voz de una persona concreta en una conversacion grabada con un microfono unico (por ejemplo, entrevistas periodisticas).
- Preparacion de datos para entrenamiento de ASR: generar mezclas separadas para crear datasets de entrenamiento con etiquetas de hablante en mandarin.
- Analisis forense de audio: separar voces en grabaciones de llamadas o videos para identificar a los participantes.
- Aplicaciones de accesibilidad: mejorar la inteligibilidad de conversaciones telefonicas o videoconferencias para personas con discapacidad auditiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se menciona como parte de comparaciones entre SR-CorrNet y RecorrNet, pero no se proporcionan metricas concretas (p.ej., SI-SNRi, PESQ, STOI) ni comparaciones con otros modelos de separacion de voz.

## Requisitos de hardware

- Tamano del repositorio: 0.1 GB, lo que sugiere un modelo compacto (probablemente menos de 100 millones de parametros, aunque no confirmado).
- VRAM estimada: no disponible, pero dado el tamano reducido, es probable que quepa en GPUs consumer con al menos 4 GB de VRAM (p.ej., GTX 1650, RTX 3050).
- GPU recomendadas: no se especifican; se puede ejecutar en CPU para pruebas pequenas, pero para inferencia en tiempo real se recomienda una GPU.
- Opciones de despliegue: el codigo de inference se basa en la libreria sr-corrnet (via `SSInference.from_pretrained`) y el repositorio byd-speech-separation. No se mencionan integraciones con vLLM, llama.cpp u otras herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan datos comparativos con otros modelos de separacion de voz (p.ej., ConvTasNet, SepFormer, DPRNN). Se recomienda consultar la literatura de SR-CorrNet y RecorrNet para establecer comparaciones.

## Limitaciones y advertencias

- Entrenado exclusivamente en mandarin: puede degradar su rendimiento con otros idiomas, especialmente aquellos con fonetica muy diferente.
- Dataset limitado: AISHELL-1 Mix es un dataset relativamente pequeno en comparacion con WSJ0-Mix o LibriMix; el modelo puede tener problemas de generalizacion a hablantes o acentos no representados.
- Sin informacion sobre sesgos: no se han documentado sesgos especificos, pero es probable que refleje las caracteristicas demograficas y de grabacion del corpus AISHELL-1.
- Riesgo de artefactos: la separacion de voz puede introducir distorsiones o artefactos de audio, especialmente en condiciones de alta superposicion de hablantes o ruido extremo.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario es responsable del cumplimiento de las condiciones del dataset AISHELL-1 Mix (que puede tener sus propias restricciones).
- Version de checkpoint: es el epoch 7 de la version ver1; no se garantiza que sea el mejor checkpoint en terminos de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/playwithmino/recorrnet-v2-1ch-aishell1mix-ver1-epoch7
- Repositorio de codigo: https://github.com/vu-duy-tung/byd-speech-separation (rama `recorrnet`)
- Dataset AISHELL-1 Mix: https://github.com/huangzj421/Aishell1Mix
- Articulo sobre Aishell1Mix (Springer): https://link.springer.com/chapter/10.1007/978-981-95-5382-2_15
