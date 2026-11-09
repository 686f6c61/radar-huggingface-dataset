# dongfangshuo/Easy-TRPG

## Resumen

Easy-TRPG (一键跑团) es un paquete de software distribuido a través de Hugging Face por el usuario dongfangshuo que empaqueta un entorno local de inferencia de modelos de lenguaje orientado a juegos de rol de mesa (TRPG), roleplay conversacional e integración con SillyTavern. No se trata de un modelo de lenguaje en sentido estricto, sino de una distribución de aplicación (un "workbench" o escritorio de trabajo) que incluye binarios, scripts de arranque y una interfaz web local, junto con utilidades para descargar y montar modelos GGUF y configurar APIs en línea.

El repositorio ocupa 2,3 GB e incluye tres paquetes: una versión para Windows con soporte de GPU local, una versión para Windows pensada para equipos sin GPU que solo usan APIs remotas, y una versión para Linux. La propuesta del autor es reducir a cero la barrera de entrada: sin instalación, sin registro y sin configuración de entorno, con un arranque mediante un script `.bat` que levanta una interfaz web.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación de modelos: no se publican parámetros, arquitectura, contexto ni benchmarks del modelo subyacente, porque el repositorio no contiene un modelo propio sino un contenedor de aplicación. Los modelos que el autor recomienda descargar (Dongfangshuo-27B-v4, Dongfangshuo-27B-Novel y Dongfangshuo-Flash-Next) se alojan en repositorios separados y no forman parte de este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo; es una aplicacion de escritorio con inferencia GGUF) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; el autor recomienda Q4_K_M para 16 GB de VRAM y Q3_K_M para 12 GB de VRAM en el modelo de 27B |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (los modelos se cargan desde archivos `.gguf` en la carpeta `model` o mediante montaje directo) |

## Arquitectura y entrenamiento

No disponible. El repositorio Easy-TRPG no publica informacion sobre arquitectura de red, datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion como RLHF o DPO, porque no contiene pesos de un modelo entrenado por el autor. El contenido del repositorio son artefactos de aplicacion: archivos ZIP y TAR.GZ con el software, imagenes de tutorial y scripts de arranque.

La unica informacion tecnica inferible es la relativa al motor de inferencia: la aplicacion carga modelos en formato GGUF, lo que implica el uso de llama.cpp o una capa compatible por debajo, y permite alternar entre inferencia local (GPU del equipo) y APIs remotas en linea. El autor menciona DeepSeek como ejemplo de API externa compatible. No se detalla la version de llama.cpp, el soporte de backend (CUDA, ROCm, Vulkan, Metal) ni si existe aceleracion por hardware especifica mas alla de la menciones a VRAM en las recomendaciones de cuantizacion.

## Capacidades

- Interfaz web local para conversacion con modelos de lenguaje, lanzada desde un script de arranque en Windows o Linux.
- Modo "跑团" (partidas de rol de mesa): gestion de sesiones de TRPG con el modelo como master de juego.
- Integracion con el ecosistema SillyTavern: el repositorio se etiqueta explicitamente con `sillytavern` y menciona funcionalidad de "酒馆" (tavern) y tarjetas de personaje (角色卡).
- Carga de modelos locales en formato GGUF desde una carpeta `model` o mediante montaje directo de archivo.
- Descarga integrada de modelos desde la propia interfaz (boton "下载").
- Configuracion de APIs remotas compatibles con el formato de OpenAI/DeepSeek mediante URL y clave.
- Soporte de tarjetas de personaje para roleplay persistente.
- Idiomas de interfaz y de modelo: chino e ingles.
- No se documentan capacidades de vision, audio, tool calling, agentes multi-paso ni modo de razonamiento explicito.

## Casos de uso

- Partidas de rol de mesa asistidas por IA: el usuario lanza el workbench, carga un modelo GGUF de rol y usa el modo TRPG para que el modelo actue como narrador y arbitro de una sesion, manteniendo el estado de la partida en la interfaz.
- Roleplay conversacional con tarjetas de personaje: gracias a la integracion con el ecosistema SillyTavern, se pueden importar tarjetas de personaje y sostener conversaciones multi-turno con personalidad persistente, adecuado para escritura creativa y entretenimiento.
- Despliegue local sin conocimientos tecnicos: el paquete de Windows "纯净版" permite a un usuario sin experiencia en Python ni en linea de comandos ejecutar un modelo en su propia GPU mediante doble clic, lo que reduce el soporte tecnico necesario en talleres o demos.
- Uso en equipos sin GPU: la variante "API纯净版" esta pensada para portatiles ligeros que solo conectan con APIs en linea como DeepSeek, lo que permite usar la interfaz de TRPG sin hardware dedicado.
- Escritura de ficcion y novelas: el autor recomienda un modelo especifico (Dongfangshuo-27B-Novel) para generacion de prosa larga dentro de la misma aplicacion, lo que convierte el workbench en un entorno de escritura asistida.
- Entornos Linux y servidores locales: la variante `.tar.gz` permite desplegar la interfaz en una maquina Linux, util para montar un servicio de rol interno en una red local sin depender de servicios en la nube.
- Prototipado rapido de interfaces de chat con LLM: al permitir alternar entre modelo local y API remota con la misma UI, sirve para comparar respuestas de distintos modelos sin cambiar de herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones del software ni de los modelos recomendados, y las unicas referencias de rendimiento son cualitativas: el autor describe Dongfangshuo-Flash-Next como la opcion "mas rapida" y con menor consumo de VRAM, sin aportar cifras de tokens por segundo ni latencia.

## Requisitos de hardware

- VRAM estimada: el autor indica 16 GB de VRAM para cuantizacion Q4_K_M y 12 GB para Q3_K_M al ejecutar el modelo recomendado de 27B. Para el modelo "Flash-Next" menciona 8 GB o 16 GB de VRAM combinados con 32 GB o 64 GB de memoria RAM del sistema.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.); solo se habla de "tarjeta grafica dedicada" en terminos genericos.
- Compatibilidad con GPU de consumo: si, segun las cifras de VRAM indicadas, un modelo de 27B en Q3_K_M o Q4_K_M encaja en GPUs de consumo con 12-16 GB de VRAM, y el modelo Flash-Next en GPUs de 8 GB.
- Opciones de despliegue: la aplicacion incluye su propio motor de inferencia GGUF y su propia interfaz web; no se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp como servidor independiente, aunque el formato GGUF sugiere compatibilidad de pesos con llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Easy-TRPG no es un modelo de lenguaje sino una distribucion de software, por lo que no existe una comparacion directa por parametros o contexto. Como referencias funcionales del mismo espacio de problema (interfaces locales para roleplay con LLM) podrian citarse SillyTavern, KoboldAI o LM Studio, pero la informacion proporcionada no incluye datos comparativos de parametros, contexto, rendimiento ni licencia de esas herramientas, por lo que no se presenta tabla comparativa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado: cualquier evaluacion de calidad, sesgos o alucinacion depende del modelo GGUF o de la API que el usuario cargue, no de Easy-TRPG.
- Ausencia total de documentacion tecnica sobre el motor de inferencia: no se especifica version de llama.cpp, backends soportados, ni requisitos exactos de sistema operativo y drivers.
- El software se distribuye en version "alpha1.3", lo que implica inestabilidad potencial y cambios de interfaz o de formato entre versiones.
- Los enlaces de descarga apuntan a archivos ZIP y TAR.GZ alojados en el propio repositorio de Hugging Face; no se documenta verificacion de integridad (hashes) ni firma de los binarios, lo que supone un riesgo de seguridad al ejecutar software de terceros.
- La licencia MIT cubre el repositorio, pero no aclara la licencia de los binarios incluidos ni de los modelos recomendados, que se alojan en repositorios separados con sus propias condiciones.
- El soporte de idiomas declarado es chino e ingles; no se garantiza un rendimiento adecuado en castellano, ni en la interfaz ni en las respuestas de los modelos recomendados.
- Los modelos recomendados por el autor incluyen la etiqueta "NSFW" en sus nombres, lo que condiciona su uso en entornos profesionales o educativos.
- No hay informacion sobre telemetria, recogida de datos ni comportamiento de red de la aplicacion, mas alla de las llamadas a APIs configuradas por el usuario.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria de su funcionamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dongfangshuo/Easy-TRPG
- Modelo recomendado para TRPG y chat: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4
- Modelo recomendado para novela: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-Novel
- Modelo recomendado ligero: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-Flash-Next-NSFW
- Paquete Windows con GPU local: https://huggingface.co/dongfangshuo/Easy-TRPG/resolve/main/AI%E8%B7%91%E5%9B%A2%E5%B7%A5%E4%BD%9C%E5%8F%B0_Windows%E7%BA%AF%E5%87%80%E7%89%88_alpha1.3.zip
- Paquete Windows solo API: https://huggingface.co/dongfangshuo/Easy-TRPG/resolve/main/AI%E8%B7%91%E5%9B%A2%E5%B7%A5%E4%BD%9C%E5%8F%B0_API%E7%BA%AF%E5%87%80%E7%89%88_alpha1.3.zip
- Paquete Linux: https://huggingface.co/dongfangshuo/Easy-TRPG/resolve/main/AI%E8%B7%91%E5%9B%A2%E5%B7%A5%E4%BD%9C%E5%8F%B0_Linux%E7%BA%AF%E5%87%80%E7%89%88_alpha1.3.tar.gz
