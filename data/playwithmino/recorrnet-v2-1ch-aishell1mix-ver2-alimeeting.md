# playwithmino/recorrnet-v2-1ch-aishell1mix-ver2-alimeeting

## Resumen

RecorrNet-v2 es un modelo de separacion de voz de un solo canal (speech separation) desarrollado por el usuario playwithmino, basado en la arquitectura RecorrNet-v2 con una cabeza de filtro directo de 9 taps. El modelo se ha entrenado de forma continua sobre el dataset AISHELL-1 Mix ver2 (que incluye mezclas limpias y con ruido de 1 a 5 hablantes) y un 10% adicional de la particion de entrenamiento de AliMeeting (mezclas de canal lejano CH0 con stems de auriculares). Este checkpoint, exportado en la epoca 9 (paso 20000), reemplaza a la version anterior ver1-epoch7 como el peso actual de RecorrNet para esta configuracion.

El modelo esta disenado para tareas de separacion de hablantes en audio mono, con un tamano de repositorio de 0.1 GB y una licencia MIT. Se distribuye a traves de la libreria `sr-corrnet` y se integra mediante la clase `SSInference`. Su relevancia radica en ofrecer una alternativa open source para separar multiples voces en mandarin, con aplicacion directa en entornos de reuniones y grabaciones de campo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RecorrNet-v2 (cabeza de filtro directo de 9 taps) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | mandarin (entrenado con AISHELL-1 y AliMeeting) |
| Licencia | MIT |
| Formato de pesos | model.pt (weights only), config.yaml, metadata.json |

## Arquitectura y entrenamiento

RecorrNet-v2 es una arquitectura de separacion de voz basada en redes recurrentes, con una cabeza de filtro directo de 9 taps que opera sobre la senal de audio de un solo canal. El modelo se inicializo a partir de un checkpoint de RecorrNet-v2 continuado en AISHELL (no desde WSJ) y se entreno adicionalmente sobre AISHELL-1 Mix ver2 (mezclas clean y both, con 1 a 5 hablantes) y aproximadamente un 10% de la particion de entrenamiento de AliMeeting (mezclas de canal lejano CH0 con stems de auriculares). El entrenamiento alcanzo la epoca 9 con 20000 pasos, y el checkpoint exportado como `best_model.pth` es el que se distribuye. El codigo de referencia se encuentra en el repositorio `vu-duy-tung/byd-speech-separation` en la rama `recorrnet`.

## Capacidades

- Separacion de voz de un solo canal (audio-to-audio) para mezclas de 1 a 5 hablantes.
- Procesamiento de senales de audio en mandarin, entrenado con AISHELL-1 y AliMeeting.
- Inferencia mediante la clase `SSInference` de la libreria `sr-corrnet`, que acepta un archivo de audio y produce salidas separadas.
- Soporte para mezclas con ruido (dataset AISHELL-1 Mix ver2 incluye variantes clean y both).
- No se especifican capacidades de tool calling, agentes, vision ni otros dominios; es exclusivamente un modelo de separacion de audio.

## Casos de uso

- Separacion de voces en grabaciones de reuniones: el modelo puede aislar a cada hablante de una mezcla capturada con un microfono lejano, util para transcripcion o analisis posterior en entornos como AliMeeting.
- Preprocesamiento para reconocimiento de voz: al separar las voces individuales, se mejora la precision de sistemas ASR en mandarin cuando hay solapamiento de hablantes.
- Mejora de audio en videoconferencias: permite extraer la voz de un participante concreto de una grabacion mono, reduciendo interferencias de otros interlocutores.
- Extraccion de hablantes en podcasts o entrevistas: facilita la creacion de pistas individuales para edicion o subtitulado.
- Analisis forense de audio: ayuda a descomponer grabaciones de campo con multiples voces para identificar a cada hablante.
- Desarrollo de aplicaciones de asistencia auditiva: puede integrarse en sistemas que necesiten aislar una voz dominante en entornos ruidosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos especificos de VRAM, latencia o throughput en la informacion proporcionada.
- El tamano del repositorio es de 0.1 GB, lo que sugiere un modelo relativamente pequeno, pero no se confirma si cabe en GPUs de consumo sin pruebas adicionales.
- La carga se realiza con `device="cuda:0"` en el ejemplo, lo que indica soporte para GPU, aunque tambien podria ejecutarse en CPU (no verificado).
- Opciones de despliegue: la libreria `sr-corrnet` proporciona la interfaz de inferencia; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|
| RecorrNet-v2 (este) | RecorrNet-v2, filtro 9 taps | AISHELL-1 Mix ver2 + AliMeeting | MIT | Hugging Face |
| RecorrNet-v2 ver1-epoch7 | RecorrNet-v2, filtro 9 taps | AISHELL-1 Mix ver1 | MIT | Hugging Face |

La diferencia principal entre ambos es el entrenamiento adicional con AliMeeting y la version del dataset AISHELL-1 Mix (ver2 frente a ver1). No se dispone de datos de rendimiento comparativo en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente en mandarin; su rendimiento en otros idiomas no esta garantizado.
- Solo soporta audio de un canal (mono); no maneja entradas estereo o multicanal.
- No se especifican sesgos conocidos, pero al entrenarse con datos de reuniones y grabaciones de campo, puede tener un rendimiento suboptimo con tipos de ruido o acentos no representados en los datasets.
- Riesgo de alucinacion no aplica directamente, pero la separacion puede producir artefactos o perdida de calidad en condiciones de solapamiento extremo o ruido no estacionario.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantias explicitas de calidad o idoneidad para produccion.
- No se proporcionan metadatos sobre la tasa de muestreo, duracion maxima de audio o requisitos de preprocesamiento; se debe consultar el repositorio de codigo para detalles de implementacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/playwithmino/recorrnet-v2-1ch-aishell1mix-ver2-alimeeting
- Checkpoint anterior ver1-epoch7: https://huggingface.co/playwithmino/recorrnet-v2-1ch-aishell1mix-ver1-epoch7
- Codigo de referencia: https://github.com/vu-duy-tung/byd-speech-separation (rama `recorrnet`)
- Dataset Aishell1Mix: https://github.com/huangzj421/Aishell1Mix
