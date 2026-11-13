# adventists-ai/Sophon-Realtime-32B-Flash-4bit-MLX

## Resumen

Sophon-Realtime-32B-Flash-4bit-MLX es una distribucion para Apple Silicon del modelo de voz full-duplex Sophon-Realtime-32B-Flash-4bit, empaquetada en formato MLX de 4 bits por el usuario adventists-ai. El modelo original es un sistema any-to-any de habla a habla que escucha, decide por si mismo cuando el usuario ha terminado de hablar, responde con su propia voz y se detiene cuando se le interrumpe, todo ello sin pasos intermedios de reconocimiento de voz ni dependencia de la nube. Esta version concreta permite ejecutar esos pesos localmente en la GPU unificada de un Mac con chip M1 o posterior.

La relevancia de esta ficha radica en que traslada un modelo conversacional de 32.000 millones de parametros (etiquetado como Flash, presumiblemente por su variante optimizada) al ecosistema MLX, con pesos repackados de forma sin perdida: los valores de 4 bits, las escalas, la torre de audio y la etapa de voz son identicos bit a bit a los de la build CUDA. El repositorio ocupa 24,6 GB y la model card recomienda 36 GB o mas de memoria unificada, con un consumo de unos 26 GB durante la conversacion.

El modelo esta pensado para interacciones de voz en tiempo real con gestion autonoma de turnos (turn-taking), cancelacion de eco integrada mediante WebRTC AEC3 y soporte de back-channels como "mm-hmm". Solo se documentan los idiomas chino e ingles, y la licencia es Apache-2.0 tanto para el codigo como para los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo any-to-any de voz full-duplex; pesos repackados para MLX) |
| Parametros totales | 32B (segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (unica variante publicada en este repositorio) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 (codigo y pesos) |
| Formato de pesos | safetensors en formato MLX (carpetas `thinker_mlx/`, `ear/`, `talker/`, `voices/`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base mas alla de su naturaleza any-to-any y full-duplex. La estructura de ficheros revela una separacion en tres etapas: un "thinker" de 4 bits compatible con `mlx_lm` (que incluye una torre de audio y un proyector en la carpeta `ear/`), una etapa de voz o "talker" que genera la respuesta hablada, y un conjunto de voces integradas. El proceso de conversion a MLX se describe como un repack sin perdida, de modo que los pesos cuantizados coinciden bit a bit con la build CUDA original.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es la gestion de turnos en el propio contexto de la respuesta: para procesar el audio una sola vez, la pregunta de si el usuario ha terminado se formula dentro del contexto de la respuesta (system prompt, conversacion, audio del usuario y una pregunta corta "has the user finished? A / B"); si la respuesta es afirmativa, la generacion continua desde el mismo computo. Tras una interrupcion se emplea una pregunta de cuatro opciones que permite reanudar una respuesta cortada ante un back-channel breve.

## Capacidades

- Conversacion de voz a voz full-duplex: escucha y habla de forma simultanea, sin transcripcion intermedia.
- Deteccion autonoma de fin de turno (turn-taking) con umbrales de silencio de 0,2 s a 2 s y respuesta de respaldo.
- Interrupcion: el modelo deja de hablar en aproximadamente 0,15 s cuando el usuario lo interrumpe.
- Reanudacion tras back-channels ("mm-hmm", "yeah") mediante la pregunta de cuatro opciones.
- Cancelacion de eco integrada (WebRTC AEC3) para evitar que el modelo se interrumpa con su propia voz.
- Generacion de voz con etiquetas de sonido integradas y voces predefinidas.
- Soporte de chino e ingles, seleccionable por linea de comandos (`--lang en`).
- Entrada de audio por microfono y salida por altavoces o auriculares.
- No incluye en esta version de Mac: entrada de camara, tool calling ni clonacion de voz zero-shot.

## Casos de uso

- Asistente conversacional local en Mac: el modelo gestiona conversaciones multi-turno de voz sin enviar audio a la nube, lo que resulta adecuado para entornos con requisitos de privacidad o sin conectividad.
- Atencion al cliente con voz natural: la deteccion de fin de turno (0,9-1,1 s cuando el modelo esta seguro) y la reanudacion tras back-channels permiten dialogos fluidos con usuarios que pausan o asienten.
- Demostraciones y prototipado de interfaces de voz: el script `mac/install.sh` y el binario `sophon` permiten levantar un entorno funcional en aproximadamente 10 s de carga del modelo.
- Investigacion en interaccion humano-maquina: la model card publica resultados de precision y AUC en el conjunto Smart Turn (400 clips por idioma), lo que facilita la comparacion de estrategias de turn-taking.
- Pruebas de cancelacion de eco en entornos simulados: la documentacion describe pruebas con eco a -6 dB y 0 dB, utiles para validar pipelines de audio en sala.
- Evaluacion de modelos de voz en Apple Silicon: sirve como referencia para medir latencia y consumo de memoria unificada (unos 26 GB en uso) en chips M4 Max y comparar con la build CUDA (respuesta en unos 0,5 s).
- Traduccion y asistencia bilingue chino-ingles en conversaciones habladas, dado el soporte documentado de ambos idiomas.

## Benchmarks y rendimiento

Resultados de turn-taking publicados en la model card (precision y AUC sobre el conjunto Smart Turn, 400 clips por idioma):

| Metrica | Ingles (precision / AUC) | Chino (precision / AUC) |
|---|---|---|
| Pregunta de turno del servidor | 92,5 / 0,975 | 94,0 / 0,983 |
| Pregunta de turno en Mac | 90,5 / 0,960 | 94,3 / 0,977 |

Metricas de latencia medidas en un M4 Max con 36 GB:

| Escenario | Valor |
|---|---|
| Fin de habla a inicio de respuesta | 0,9-1,1 s (hasta unos 2,5 s si espera confirmacion) |
| Interrupcion del usuario | parada en unos 0,15 s |
| Carga del modelo | unos 10 s |
| Respuesta del servidor CUDA (referencia) | unos 0,5 s |

No se han publicado resultados de benchmarks de razonamiento, codigo o matematicas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: 36 GB o mas recomendados; 32 GB funciona con otras aplicaciones cerradas (unos 26 GB en uso durante la conversacion).
- Descarga: aproximadamente 24 GB.
- Procesador: Apple Silicon M1 o posterior; macOS 14 o posterior.
- GPU: no se requieren GPU dedicadas; se usa la GPU unificada del chip. Los chips con mas nucleos de GPU son mas rapidos.
- Cabe en Mac consumer: si, en equipos con memoria unificada suficiente (M4 Max de 36 GB probado).
- Microfono obligatorio: Mac Studio y Mac mini no lo incluyen; se necesita microfono USB o auriculares. La cancelacion de eco esta integrada.
- Despliegue: MLX mediante `mlx_lm` (carpeta `thinker_mlx/`), con script de instalacion `mac/install.sh` y binario `sophon`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: ver tabla de la seccion anterior; la mayor parte del tiempo en Mac se dedica a la decision de turno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Plataforma |
|---|---|---|---|---|---|
| Sophon-Realtime-32B-Flash-4bit-MLX (este) | 32B | no disponible | Voz full-duplex any-to-any, 4 bits | Apache-2.0 | Apple Silicon (MLX) |
| Sophon-Realtime-32B-Flash-4bit | 32B | no disponible | Voz full-duplex any-to-any, 4 bits | Apache-2.0 | CUDA |
| Otros modelos de voz full-duplex | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos del modelo original en CUDA, que comparte pesos identicos y responde en aproximadamente 0,5 s frente a los 0,9-1,1 s del Mac. No se han proporcionado datos de modelos comparables de otros autores.

## Limitaciones y advertencias

- Una sola conversacion simultanea: no soporta multiples sesiones concurrentes.
- Sin entrada de camara, sin tool calling y sin clonacion de voz zero-shot en la version de Mac; solo voces integradas.
- Idiomas limitados a chino e ingles; no se documenta soporte de castellano.
- Pruebas realizadas con audio simulado en tiempo real y eco de sala simulado; las ejecuciones con microfono real y los datos de otros Mac estan pendientes de validacion por la comunidad (issue #1).
- Requiere hardware Apple Silicon con memoria unificada elevada; no es desplegable en GPUs NVIDIA ni en equipos con menos de 32 GB.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero se debe consultar el fichero `NOTICE` para las fuentes de los pesos.
- La latencia de respuesta en Mac puede llegar a unos 2,5 s cuando el modelo espera confirmacion de fin de turno, lo que puede percibirse como lentitud en conversaciones rapidas.
- No se especifican la longitud de contexto ni los detalles de entrenamiento, lo que dificulta evaluar su robustez en dialogos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash-4bit-MLX
- Build CUDA: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash-4bit
- Repositorio de codigo: https://github.com/adventists-ai/sophon-realtime
- Codigo para Mac: https://github.com/adventists-ai/sophon-realtime/tree/main/mac
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Issue de validacion comunitaria: https://github.com/adventists-ai/sophon-realtime/issues/1
