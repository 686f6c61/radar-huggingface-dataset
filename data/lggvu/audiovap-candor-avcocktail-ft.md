# lggvu/audiovap-candor-avcocktail-ft

## Resumen

AudioVAP — Candor -> AVCocktail (fine-tuned) es un check point de un modelo de prediccion de actividad de voz (*Voice Activity Projection*, VAP) orientado a la prediccion de turnos de palabra (*turn-taking*) en conversaciones. Lo publica el usuario lggvu en Hugging Face y esta desarrollado sobre el codigo de `mm-turn-taking`. Se trata de un modelo que trabaja exclusivamente con audio estereo: recibe la senal de dos canales (tipicamente hablante A y hablante B) y proyecta la actividad de voz futura de cada participante, lo que permite anticipar quien hablara a continuacion y cuando se producira un cambio de turno.

La relevancia de este tipo de modelos esta en que atacan un problema que los sistemas de dialogo clasicos resuelven mal: la sincronizacion temporal en conversaciones habladas. Un agente conversacional o un sistema de transcripcion con diarizacion necesita saber no solo *que* se ha dicho, sino *quien* va a hablar y *cuando*, para decidir si es su turno de intervenir. La prediccion de actividad de voz es una senal de bajo nivel, no linguistica, que aporta esa informacion sin depender del reconocimiento de habla.

El modelo se ha preentrenado sobre el corpus Candor y despues se ha ajustado (*fine-tuning*) sobre el corpus AVCocktail, que segun la model card introduce audio acompanado de video. El check point publicado corresponde a la epoca 3, con `val/loss=0.9520`. No se especifican en la informacion disponible el numero de parametros, la longitud de contexto ni la licencia, que figura como `unknown`. El tamano del repositorio es de 0,1 GB, lo que sugiere un modelo compacto, aunque esta cifra no permite deducir el recuento de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estereo de audio para prediccion de actividad de voz (VAP); detalle de capas y dimensiones no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye `checkpoint.ckpt` en precision de entrenamiento) |
| Idiomas soportados | no disponible (el modelo opera sobre audio; no se declara idioma) |
| Licencia | unknown |
| Formato de pesos | `checkpoint.ckpt` (check point de PyTorch Lightning) acompanado de `hparams.yaml` |
| Modalidad de entrada | audio estereo (2 canales); el ajuste se realiza sobre el corpus AVCocktail, que incluye video |
| Version o epoca | epoca 3, `val/loss=0.9520` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como un «audio-only stereo transformer Voice Activity Projection (VAP) turn-taking model». Es decir, la arquitectura es un transformer que consume exclusivamente audio estereo (dos canales, uno por interlocutor) y produce una proyeccion de la actividad de voz futura de cada canal. El objetivo VAP consiste en predecir, a partir de la ventana de audio observada, la probabilidad de habla en un horizonte temporal futuro para cada participante, lo que implicitamente codifica informacion sobre turnos, solapamientos y pausas. No se detallan en la informacion disponible el numero de capas, la dimension del modelo, el mecanismo de atencion concreto ni la estrategia de tokenizacion del audio.

En cuanto al entrenamiento, se indica un esquema de dos fases: un preentrenamiento sobre el corpus Candor seguido de un ajuste fino sobre el corpus AVCocktail. No se especifica el numero de tokens o de horas de audio empleadas, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (poco probables en una tarea de prediccion de senal, pero no confirmado). El unico dato cuantitativo de entrenamiento publicado es la perdida de validacion del check point liberado (`val/loss=0.9520` en la epoca 3). El codigo fuente que genera el check point esta disponible en el repositorio `mm-turn-taking`, lo que permite reproducir la arquitectura y el pipeline de entrenamiento a partir del `hparams.yaml` incluido.

## Capacidades

- Prediccion de actividad de voz futura: estima, para cada canal de audio estereo, la probabilidad de habla en un horizonte temporal venidero.
- Prediccion de turnos de palabra (*turn-taking*): anticipa cambios de turno y momentos de cesion de la palabra en una conversacion.
- Deteccion implicita de solapamientos y pausas a partir de la proyeccion de actividad de voz.
- Procesamiento de audio estereo con dos flujos de hablante simultaneos, sin necesidad de separacion previa de fuentes declarada.
- Ajuste sobre material audiovisual (AVCocktail), aunque la inferencia descrita es solo de audio.
- No se declara soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generacion de texto.
- No se declaran capacidades multilingues ni de vision en inferencia; el modelo no es un modelo de lenguaje.
- No se declara modo *thinking*, salida textual ni capacidades generativas.

## Casos de uso

- Prediccion de turnos en agentes conversacionales de voz: el modelo puede alimentar la logica de decision de un asistente para determinar si el usuario ha terminado de hablar o si va a continuar, reduciendo interrupciones prematuras en sistemas de dialogo hablado.
- Analisis de reuniones y transcripcion enriquecida: integrado en un pipeline de ASR y diarizacion, la proyeccion de actividad de voz aporta marcas temporales de cambio de turno y solapamiento que mejoran la segmentacion por hablante.
- Deteccion de barge-in en sistemas de atencion al cliente: permite que un agente virtual detecte cuando el cliente empieza a hablar mientras el sistema aun emite audio, y reaccione en consecuencia.
- Moderacion y analisis de interacciones en tiempo real: en plataformas de comunicacion, la prediccion de turnos puede usarse para medir ritmo conversacional, dominancia de hablantes y patrones de interrupcion.
- Investigacion en linguistica computacional y analisis de la conversacion: sirve como modelo base para estudiar la estructura temporal del dialogo y para comparar corpus como Candor y AVCocktail bajo una misma arquitectura.
- Botonica de escucha activa para agentes sociales: el modelo puede generar senales de retroalimentacion no verbal (por ejemplo, activar un gesto o sonido de asentimiento) sincronizadas con los huecos conversacionales predichos.
- Entrenamiento y evaluacion de modelos de dialogo con senal acustica: el check point se puede usar como extractor de caracteristicas temporales para modelos posteriores de gestion de turnos.
- Sistemas de subtitulado en directo con indicacion de hablante: la proyeccion de actividad de voz ayuda a etiquetar y ordenar los fragmentos de subtitulo en conversaciones rapidas o solapadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado es la perdida de validacion del check point liberado:

| Metrica | Valor | Contexto |
|---|---|---|
| `val/loss` | 0,9520 | Epoca 3, ajuste sobre AVCocktail tras preentrenamiento en Candor |

No se proporcionan resultados en tareas estandar como prediccion de turno a futuro (por ejemplo, metricas de exactitud en horizontes de 0, 200, 400 ms), F1 de deteccion de cambio de turno ni comparaciones cuantitativas con otros modelos de VAP. Cualquier cifra adicional no estaria respaldada por la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio (0,1 GB) sugiere un modelo de pequena envergadura, compatible en principio con GPUs de consumo, pero no se confirma el recuento de parametros ni el pico de memoria en inferencia.
- GPUs recomendadas: no disponibles. Por el tamano del repositorio, es plausible que funcione en GPUs de gama media o incluso en CPU, pero se trata de una estimacion no confirmada por el autor.
- Compatibilidad con GPU de consumo: probable, dado el tamano del artefacto, sin confirmacion oficial.
- Opciones de despliegue: no se documentan. El check point es un `.ckpt` de PyTorch Lightning que debe cargarse con el codigo de `mm-turn-taking`; no se distribuyen pesos en formatos de servidores de inferencia (vLLM, TGI, llama.cpp, Ollama).
- Latencia y rendimiento: no disponibles. Al ser un modelo de prediccion de voz orientado a tiempo real, la latencia es un parametro critico, pero no se publican mediciones.
- Nota practica: al no existir conversion a formatos optimizados, el despliegue en produccion requiere exportar el modelo desde el check point original y validar el pipeline de audio (frecuencia de muestreo, tamano de trama, numero de canales) contra el `hparams.yaml`.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de este modelo (parametros, contexto, metricas) que permitan una comparacion rigurosa. Se indican lineas de trabajo comparables en la misma categoria (prediccion de turnos y modelado de actividad de voz), senalando explicitamente los campos sin informacion:

| Modelo o linea de trabajo | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AudioVAP — Candor -> AVCocktail (este modelo) | VAP estereo, *turn-taking* | no disponible | no disponible | `val/loss=0.9520` (epoca 3) | unknown | Hugging Face, check point `.ckpt` |
| VAP original (Ekstedt y Skantze) | VAP estereo, *turn-taking* | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | codigo y pesos publicados por los autores |
| TurnGPT | Prediccion de turnos basada en texto | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | repositorio publico de los autores |
| Modelos de diarizacion (*speaker diarization*) | Segmentacion por hablante | no disponible en la informacion proporcionada | no disponible | no disponible | variable segun implementacion | multiples (pyannote, NeMo, etc.) |

La comparacion anterior es puramente cualitativa y de categoria: no se ha verificado ningun valor numerico de los modelos alternativos dentro de la informacion disponible, por lo que no debe interpretarse como una evaluacion comparativa.

## Limitaciones y advertencias

- Licencia `unknown`: no se especifican los terminos de uso. No hay autorizacion explicita para uso comercial ni para redistribucion, por lo que un despliegue en produccion requiere contactar previamente con el autor.
- Trazabilidad limitada: las metricas publicadas se reducen a una perdida de validacion en la epoca 3. No hay evaluacion en conjuntos de prueba independientes ni desglose por subpoblaciones.
- Riesgo de sobreajuste al dominio: el ajuste se ha realizado sobre AVCocktail tras un preentrenamiento en Candor; el comportamiento fuera de esos dominios (idiomas, acentos, tipos de conversacion, condiciones acusticas) no esta documentado.
- Sesgos potenciales: los corpus de conversacion espontanea suelen sobrerrepresentar determinados grupos de hablantes, lo que puede trasladarse a sesgos en la prediccion de turnos. No se publica ningun analisis de sesgo.
- Entrada estrictamente estereo: al operar sobre dos canales, escenarios con mas de dos hablantes, mono, o mezclas no separadas pueden degradar la prediccion. No se documenta el comportamiento en esas condiciones.
- Caracter no generativo: el modelo no produce texto ni respuestas; cualquier uso conversacional exige combinarlo con ASR y un modelo de lenguaje.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe riesgo de falsos positivos y falsos negativos en la proyeccion de actividad de voz, que en un agente de voz pueden traducirse en interrupciones erroneas.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni model card ampliada, lo que reduce la evidencia de uso en produccion.
- Formatos no estandar: al distribuirse como `.ckpt` sin version GGUF, ONNX ni safetensors, la integracion requiere trabajo adicional de exportacion y validacion.
- Restricciones de contexto e idioma: no disponibles; se desconoce si el modelo presenta un limite maximo de ventana de audio y como escala con la duracion de la entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lggvu/audiovap-candor-avcocktail-ft
- Codigo fuente del pipeline de entrenamiento (`mm-turn-taking`): https://github.com/lggvu/mm-turn-taking
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Las unicas entradas devueltas corresponden a paginas del servicio Google Translate (https://translate.google.it/, https://translate.google.it/details, https://translate.google.it/m), sin relacion con el modelo.
- Paper o publicacion asociada: no disponible en la informacion proporcionada.
- Demo o espacio de inferencia: no disponible en la informacion proporcionada.
