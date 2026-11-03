# episod/sensenova-6.8-code2video-p300

## Resumen

`sensenova-6.8-code2video-p300` es un paquete de despliegue publicado por el usuario `episod` que empaqueta los pesos del modelo SenseNova-6.8-Code2Video (desarrollado por SenseNova y afinado a partir de Qwen3.8-27B) para su ejecucion sobre dos chips Tenstorrent Blackhole en malla P150x2. No es un modelo nuevo: es un *bundle* fino de tt-model v6 que apunta a la revision `71017a2952b9f66e250c3e2f700f5effff8f1aa0` del modelo original y lo sirve detras de un endpoint compatible con la API de OpenAI. El repositorio pesa 0,1 GB porque no incluye los pesos; estos se descargan del repositorio original con la cuenta de Hugging Face del usuario.

El modelo subyacente esta disenado para generar video corto escribiendo codigo: recibe un brief escrito detallado (`dense_prompt.md`), escribe un programa que dibuja la animacion, texto, graficos o escenas 3D, lo ejecuta para renderizar el video y revisa el codigo de forma iterativa. La model card original documenta casos como explicadores matematicos, films de paper-craft, mundos isometricos, tipografia cinetica, historias de datos, animacion de personajes y promociones de producto. El modelo tiene 27B parametros y licencia Apache 2.0.

La relevancia de este paquete concreto es la ejecucion sobre hardware Tenstorrent, no las capacidades del modelo en si. Presenta diferencias importantes respecto al original: el contexto se reduce a 262.144 tokens (la mitad de los 512K originales), la torre de vision se omite por completo (el paquete es solo texto) y no se ha producido ningun video con el. Las comprobaciones realizadas miden coincidencia de tokens contra una referencia en CPU y velocidad de decodificacion (18,8 tokens/s en una peticion greedy), no calidad de video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (implementacion Tenstorrent de BAAI/AREX-2; misma arquitectura de texto que el modelo base) |
| Parametros totales | 27B |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens en este paquete (512K en el modelo original) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el bundle no incluye pesos; los descarga desde `sensenova/SenseNova-6.8-Code2Video`) |

## Arquitectura y entrenamiento

El modelo base SenseNova-6.8-Code2Video es un transformer de 27B parametros afinado por SenseNova a partir de Qwen3.8-27B. La model card original lo describe como image-text-to-text (acepta imagenes y video junto con texto). La arquitectura de texto es identica a la de BAAI/AREX-2, motivo por el cual este bundle reutiliza la implementacion de Tenstorrent de ese modelo y solo sustituye los pesos. La model card no proporciona detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

El paquete en si introduce varias particularidades tecnicas. El launcher construye en cada arranque un directorio `model-dir/` combinando los ficheros de configuracion de BAAI/AREX-2 (`config.json`, `preprocessor_config.json`, `video_preprocessor_config.json`, en `base_config/`) con el tokenizer y los pesos de SenseNova-6.8-Code2Video, y ajusta `MODEL_WEIGHTS_DIR` y `HF_MODEL` para que los chips carguen los pesos correctos. La decodificacion especulativa esta desactivada porque el drafter de AREX-2 requiere los tensores MTP del modelo, que SenseNova-6.8-Code2Video no incluye. El muestreo se ejecuta en el host, ya que el muestreo en dispositivo no se usa con el drafter desactivado en esta malla. El servidor admite hasta 4 secuencias simultaneas.

## Capacidades

- Generacion de codigo: escribe programas que dibujan animaciones, texto, graficos y escenas de estilo 3D para producir video corto.
- Ejecucion y revision iterativa: en un harness de agente con shell y herramientas de fichero, escribe codigo, renderiza frames, los inspecciona y corrige el codigo turno tras turno.
- Modo thinking activado por defecto: el chat template hace que el modelo razone antes de responder; el servidor devuelve el razonamiento en `reasoning_content` y la respuesta en `content`.
- Esfuerzo de razonamiento configurable por peticion mediante `chat_template_kwargs` y `reasoning_effort`, con valores `xhigh` (por defecto), `medium` y `low`.
- Desactivacion del thinking por peticion con `chat_template_kwargs` fijado a `{"enable_thinking": false}`.
- Tool calling / function calling: el servidor parsea las llamadas a herramientas en `tool_calls` usando el parser `qwen3_coder`.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision: el modelo original acepta imagenes y video, pero este paquete omite la torre de vision y solo procesa texto.

## Casos de uso

- Generacion de video corto mediante codigo: dado un brief detallado, el modelo escribe un programa que renderiza la animacion y lo ejecuta; encaja en flujos donde se necesita video reproducible y versionable como codigo, no como fotogramas generados.
- Agente de codificacion en un harness tipo Claude Code: apuntando el endpoint a un harness con acceso a shell y ficheros, el modelo puede escribir, ejecutar y revisar scripts de forma autonoma durante sesiones largas.
- Explicadores matematicos y visualizaciones de datos: el modelo puede escribir programas que generen graficos y animaciones de conceptos matematicos o historias de datos, segun los casos listados en la model card original.
- Tipografia cinetica y promociones de producto: util para generar piezas de motion graphics cortas a partir de una especificacion textual, con el resultado como `out/final.mp4` mas `SPEC.md` y `VERIFY.md`.
- Revision de proyectos existentes: se le pasan notas de revision y aplica los cambios en la misma carpeta del proyecto, lo que permite iterar sobre un video ya generado.
- Prototipado rapido sobre hardware Tenstorrent: como endpoint compatible con OpenAI en dos chips Blackhole P150x2, sirve para validar integraciones de agentes de codigo en infraestructura no-GPU.
- Generacion de codigo autocontenido para animacion: peticiones directas de chat para obtener un programa de animacion independiente que el usuario ejecuta por su cuenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas incluidas son comprobaciones de este paquete: coincidencia de tokens contra una referencia en CPU con un prompt corto y velocidad de decodificacion de 18,8 tokens por segundo en una peticion greedy. Estas metricas no dicen nada sobre calidad de video ni sobre ejecuciones de multiples horas.

## Requisitos de hardware

- Hardware objetivo: 2 chips Tenstorrent Blackhole en malla P150x2; no es un paquete para GPU convencional.
- VRAM estimada: no aplica (ejecucion en aceleradores Tenstorrent); no disponible para equivalentes en GPU.
- GPU recomendadas: no disponible para este paquete; para el modelo original de 27B en GPU se requeriria hardware de gama alta, pero la informacion proporcionada no lo detalla.
- Cabe en consumer GPU: no disponible.
- Despliegue: `tt-model serve` levanta un servidor compatible con OpenAI en el puerto 8000 por defecto (configurable con `--port`); el nombre del modelo es la ruta del directorio del paquete y debe leerse de `/v1/models`.
- Throughput: 18,8 tokens/s por peticion greedy; hasta 4 secuencias simultaneas; decodificacion especulativa desactivada.
- Almacenamiento: el bundle ocupa 0,1 GB, pero los pesos se descargan aparte desde el repositorio original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Despliegue |
|---|---|---|---|---|---|
| sensenova-6.8-code2video-p300 (este paquete) | 27B | 262.144 | No (torre omitida) | Apache 2.0 | Tenstorrent Blackhole P150x2, endpoint OpenAI |
| sensenova/SenseNova-6.8-Code2Video (original) | 27B | 512K | Si | Apache 2.0 | No disponible |
| BAAI/AREX-2 | no disponible | no disponible | no disponible | no disponible | Tenstorrent (implementacion reutilizada) |
| Qwen3.8-27B (modelo de partida) | 27B | no disponible | no disponible | no disponible | No disponible |

## Limitaciones y advertencias

- Este paquete no ve imagenes ni video: el launcher omite la torre de vision. El bucle original de revision visual de frames debe hacerlo el usuario u otro modelo.
- El contexto se reduce a la mitad respecto al original (262.144 frente a 512K); el harness debe configurarse a 262.144 o menos.
- No se ha producido ningun video con este paquete; las comprobaciones solo cubren tokens y velocidad de decodificacion.
- A 18,8 tokens/s, una ejecucion larga (el original reporta mas de 10 horas y 2.000 turnos) tardaria mucho tiempo.
- El paquete no incluye pesos: requiere descargarlos del repositorio original con una cuenta de Hugging Face propia.
- La decodificacion especulativa esta desactivada por falta de tensores MTP, lo que limita el rendimiento.
- Sesgos conocidos y riesgo de alucinacion: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingue.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones tecnicas del paquete (sin vision, contexto reducido) condicionan su viabilidad en produccion.
- El nombre del autor (`episod`) coincide con una cadena de estudios de fitness en Paris segun los resultados de busqueda; no hay relacion verificable con el modelo.

## Enlaces

- Repositorio del paquete: https://huggingface.co/episod/sensenova-6.8-code2video-p300
- Modelo base: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Skill de generacion de video por codigo: https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Implementacion de referencia reutilizada: BAAI/AREX-2 (sin enlace directo en la informacion proporcionada)
