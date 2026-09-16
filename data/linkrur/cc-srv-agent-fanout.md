# LinkRur/cc-srv-agent-fanout

## Resumen

LinkRur/cc-srv-agent-fanout es un repositorio de software, no un modelo de pesos: contiene `cc_srv`, un backend que implementa la API de mensajes de Anthropic sobre llama.cpp para que Claude Code pueda hablar con un modelo local en lugar de con un proveedor alojado. En otras palabras, convierte un GGUF servido en local en el agente que ejecuta la sesion de Claude Code, manteniendo el formato de peticiones que espera ese cliente. El repositorio tiene un tamano declarado de 0,0 GB y no publica pesos, por lo que toda su relevancia esta en la capa de servicio y de cache.

Su aportacion tecnica es una pila de cuatro capas de cache que explota una propiedad de las sesiones agenticas: el prompt de cada peticion es el prompt anterior mas unos pocos tokens. Las capas son, de mas barata a mas cara, cache de logits, recuperacion de trayectoria, reutilizacion indexada por turno y APC (automatic prefix caching); si ninguna acierta, se produce un prefill en frio. En una sesion real de 20 peticiones medida sobre una RTX 5060 Ti, 15 peticiones impactaron en alguna capa y 447.657 de los 591.946 tokens de prompt (75,6 %) nunca llegaron a reenviarse al modelo, con configuracion `CC_ARCHIVE=1 CC_BATCH=1 CC_BATCH_N=3` (4 secuencias, `n_ctx` 524288).

El interes actual del proyecto esta en el ahorro de computo de prefill en flujos agenticos locales de contexto largo: la mediana de tokens de contexto servidos por segundo de tiempo de reloj pasa de 2.004 tok/s en prefill en frio a 24.368 tok/s con cache reutilizada, un factor cercano a 12x. Es material relevante para quien despliega agentes de codigo sobre hardware de consumo y quiere evitar el coste de reprocesar contexto repetido en cada turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: es una capa de servicio (backend Anthropic-Messages) sobre llama.cpp, no una red neuronal. La arquitectura del modelo subyacente no se especifica en la informacion disponible |
| Parametros totales | No disponible (depende del GGUF que cargue el usuario; el repositorio no contiene pesos) |
| Parametros activos | No disponible (no se indica que el modelo cargado sea MoE) |
| Longitud de contexto | Configurable por linea de comandos con `--n-ctx`. En los ejemplos y mediciones documentados se usan 131072 y 524288 tokens |
| Tipos de cuantizacion | No disponible (depende del GGUF elegido por el usuario; no se enumera ninguno) |
| Idiomas soportados | Ingles (`en` en los metadatos del repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica: el repositorio no distribuye pesos (0,0 GB). Consume GGUF mediante llama.cpp, con rutas configuradas manualmente en `lib.py` (`DLL` y `GGUF`) |

## Arquitectura y entrenamiento

No hay entrenamiento ni arquitectura de modelo que describir: el proyecto es un servidor Python que expone un endpoint compatible con la API de mensajes de Anthropic y delega la inferencia en llama.cpp. La documentacion indica que hay que editar `lib.py` antes de arrancar, ajustando `DLL` (directorio de las bibliotecas compartidas de llama.cpp) y `GGUF` (modelo de chat), ambos apuntando originalmente a la maquina de desarrollo del autor. El arranque es `python run.py --port 8788 --n-ctx 131072` y expone un endpoint `/health` que devuelve `{"ok": true}`.

El mecanismo central es la cache en cuatro niveles. La cache de logits actua cuando el prompt es identico token a token y evita por completo el forward pass y el uso de KV. La recuperacion de trayectoria actua cuando el prompt es prefijo de una trayectoria registrada, tambien sin forward pass ni KV. La reutilizacion indexada por turno actua cuando el turno final del usuario ya se respondio antes; se controla con `CC_QREUSE=1` (misma pregunta en el mismo dialogo) y con `CC_QREUSE=2` junto a `CC_QEDIT=1` (pregunta meramente similar). Finalmente, APC cubre cualquier prefijo comun y solo reenvia la parte nueva, siendo la capa que concentra el ahorro en sesiones largas. La integracion con Claude Code requiere `--settings _cc_local.json` porque, en Claude Code 2.1.270, el bloque `env` de un fichero de ajustes tiene prioridad sobre el entorno del proceso; el fichero incluye ademas un hook `UserPromptSubmit` con rutas absolutas a Python y a `cc_hook.py`.

## Capacidades

- Servir un modelo local como backend de agente para Claude Code mediante la API de mensajes de Anthropic.
- Reutilizacion de cache en cuatro niveles: logits, trayectoria, turno y prefijo (APC), con logica de seleccion del mas barato primero.
- Ejecucion por lotes de varias secuencias (`CC_BATCH=1`, `CC_BATCH_N=3`, hasta 4 secuencias en la medicion documentada), orientada a latencia y no a throughput.
- Archivado de estados de cache (`CC_ARCHIVE=1`) para recuperar prefijos de sesiones previas.
- Registro de peticiones en `logs/server.log` con campos de tokens de prefijo, tokens reutilizados, tokens reenviados, tiempos de prefill y decodificacion, turno, secuencia y tiempo total.
- Captura de prompts mediante hook `UserPromptSubmit`, desactivable eliminando el bloque `hooks` del fichero de ajustes.
- Reutilizacion por similitud de pregunta con `CC_QREUSE=2` y `CC_QEDIT=1`, no solo por coincidencia exacta.
- Compatibilidad con el cabecera de prediccion multi-token (MTP) del modelo, aunque la documentacion confirma que el motor no la activa: `mtp` permanece en el valor por defecto de llama.cpp, que esta desactivado.
- No se documentan capacidades de vision, audio, tool calling propio ni modo de razonamiento implementadas por este backend; dependen del modelo GGUF cargado.

## Casos de uso

- Agentes de codigo locales en Claude Code: el backend sustituye al proveedor alojado y permite que un GGUF ejecutado en la maquina del desarrollador responda a las peticiones del agente, util en entornos con codigo que no puede salir de la red corporativa.
- Sesiones agenticas largas con contexto de cientos de miles de tokens: al reenviar solo la parte nueva del prompt, la mediana de tokens de contexto por segundo sube de 2.004 a 24.368, lo que reduce el tiempo de espera entre turnos en dialogos prolongados.
- Desarrollo sin conexion o en maquinas aisladas: al no depender de un proveedor externo, el flujo de trabajo sigue operativo sin acceso a Internet una vez descargado el GGUF.
- Ahorro de coste por token en equipos que ya usan Claude Code: al no reenviar el 75,6 % de los tokens de prompt de una sesion medida, se elimina el coste de reprocesar contexto repetido en cada turno.
- Repeticion de preguntas dentro de un mismo dialogo: con `CC_QREUSE=1` (o `CC_QREUSE=2` y `CC_QEDIT=1` para preguntas solo parecidas) una consulta ya respondida no provoca forward pass ni uso de KV.
- Reanudacion de trayectorias archivadas: con `CC_ARCHIVE=1`, una sesion que retoma un prefijo ya registrado evita el prefill completo, con casos medidos de 1.232 tokens reenviados de mediana frente a 22.641 en peticiones en frio.
- Evaluacion comparativa de motores de inferencia: el repositorio incluye una comparacion metodologica contra LM Studio sobre la misma tarjeta y el mismo GGUF, util como plantilla para medir el efecto de una capa de cache.
- Servicio de chat multi-turno con contexto largo: la reutilizacion por prefijo hace viable mantener `n_ctx` en 131072 o 524288 sobre una unica GPU de consumo, siempre que la memoria para KV lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). Los datos disponibles son de rendimiento del servidor, medidos en una sesion real de 20 peticiones sobre una RTX 5060 Ti, con `CC_ARCHIVE=1 CC_BATCH=1 CC_BATCH_N=3`, 4 secuencias y `n_ctx` 524288, y con la cache de borrador y la decodificacion especulativa desactivadas.

Resumen de la sesion medida:

| Metrica | Valor |
|---|---|
| Peticiones totales | 20 |
| Peticiones que impactaron en alguna capa de cache | 15 |
| Tokens de prompt totales | 591.946 |
| Tokens no reenviados al modelo | 447.657 (75,6 %) |
| Tokens reenviados en peticiones en frio (mediana) | 22.641 |
| Tokens reenviados servidos por archivo de prefijo (mediana) | 1.232 |
| Tokens reenviados continuando la secuencia ya en KV (mediana) | 71 |

Latencia frente a longitud de respuesta, en respuestas de 30 a 106 tokens:

| Servido por | Tokens de respuesta | Prefill reenviado | Tiempo de reloj |
|---|---:|---:|---:|
| Frio | 100 | 22.646 | 11,3 s |
| Frio | 106 | 22.641 | 11,3 s |
| Archivo de prefijo | 81 | 1.055 | 2,0 s |
| Archivo de prefijo | 32 | 2.324 | 1,7 s |
| Archivo de prefijo | 37 | 1.048 | 1,4 s |
| Archivo de prefijo | 30 | 170 | 0,6 s |
| En secuencia | 41 | 77 | 1,0 s |
| En secuencia | 41 | 66 | 0,9 s |

Throughput de contexto, con la misma formula en ambos lados y sobre las 15 peticiones de la sesion que generaron 106 tokens o menos:

| Configuracion | Mediana de tokens de contexto por segundo |
|---|---:|
| Prefill en frio, `cc_srv` | 2.004 |
| Prefill en frio, LM Studio | 1.832 |
| Dos secuencias compitiendo, LM Studio | 956 |
| Cache reutilizada, `cc_srv` | 24.368 |

El rango de la columna de cache reutilizada va de 3.972 a 52.039 tok/s; el extremo bajo corresponde a un prompt de 51.244 tokens cuyo punto de divergencia no estaba en el archivo y que reenvio 22.677 tokens pese a todo. En el extremo alto se reutilizo el 99,9 % del contexto. Como referencia independiente, seis prefills en frio del registro del motor, con prompts de 11.589 a 71.070 tokens, se situan entre 1.846 y 2.318 tok/s. El autor advierte de dos cautelas: las cifras no corresponden a MTP, porque el motor nunca activa esa cabecera, y la comparacion no se hizo contra una linea base optimizada, sino contra la misma tarjeta y el mismo GGUF sin la pila de cache.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del GGUF cargado, del valor de `--n-ctx` y del numero de secuencias en lote; con `n_ctx` en 524288 y 4 secuencias el consumo de KV es el factor dominante y no se documenta cifra.
- GPU utilizada en las mediciones: una RTX 5060 Ti, tarjeta de gama de consumo, que sirvio la sesion completa con la configuracion indicada.
- Cabe en GPU de consumo: si, segun la evidencia del autor, en una RTX 5060 Ti. No se confirma el comportamiento en tarjetas con menos VRAM ni con `n_ctx` elevado.
- No se aportan datos para A100, H100 ni otras GPU de centro de datos.
- Opciones de despliegue: llama.cpp como motor de inferencia, a traves de sus bibliotecas compartidas configuradas en `lib.py`. Se ejecuta con `python run.py --port 8788 --n-ctx 131072`. No se mencionan vLLM, TGI, Ollama ni otros servidores.
- Cliente: Claude Code 2.1.270 o posterior, invocado con `--settings` apuntando a `_cc_local.json`.
- Latencia y throughput medidos: 2.004 tok/s de contexto en prefill en frio y 24.368 tok/s con cache reutilizada (medianas), con tiempos de reloj de 11,3 s para respuestas de 100 a 106 tokens en frio y de 0,6 a 2,0 s para respuestas de 30 a 81 tokens servidas desde cache.
- Plataforma de los ejemplos: Windows con PowerShell (`$env:CC_ARCHIVE='1'`, `curl.exe`), con rutas absolutas de estilo `D:/...`.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada, porque el repositorio no publica pesos ni especifica que modelo subyacente se uso en las mediciones. La unica comparacion cuantitativa documentada es contra otro motor de inferencia sobre la misma tarjeta y el mismo GGUF:

| Sistema | Cache multinivel | Prefill en frio (tok/s) | Contexto con cache (tok/s) | Notas |
|---|---|---:|---:|---|
| `cc_srv` (este repositorio) | Si, cuatro capas | 2.004 | 24.368 | 4 secuencias, `n_ctx` 524288, MTP y decodificacion especulativa desactivados |
| LM Studio | No | 1.832 | No aplica | Misma tarjeta y mismo GGUF; con dos secuencias concurrentes el prefill baja a 956 tok/s |

Como alternativas de despliegue sin datos comparativos publicados en esta informacion quedan llama.cpp server (con APC pero sin las capas de logits, trayectoria y turno descritas), vLLM, TGI y Ollama: no disponible.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni modelo: es codigo de servidor. Cualquier evaluacion de calidad, sesgos o alucinacion depende por completo del GGUF que cargue el usuario, que no se identifica.
- No se publican resultados de benchmarks de calidad, solo mediciones de latencia y throughput de una unica sesion de 20 peticiones en una unica configuracion.
- La comparacion de throughput no se hizo contra una linea base optimizada; el propio autor lo senala explicitamente.
- Las cifras no incluyen MTP ni decodificacion especulativa: el modelo usado lleva cabecera de prediccion multi-token, pero el motor no la activa y `mtp` queda en el valor por defecto de llama.cpp.
- Requiere editar `lib.py` antes del primer arranque: `DLL` y `GGUF` apuntan a rutas de la maquina del autor y no funcionaran tal cual.
- El fichero `_cc_local.json` contiene rutas absolutas a Python y a `cc_hook.py` del equipo original; una ruta obsoleta hace fallar el hook en cada prompt. Hay que borrar el bloque `hooks` si no se quiere captura de prompts.
- En Claude Code 2.1.270, `--settings` es obligatorio: el bloque `env` del fichero de ajustes tiene prioridad sobre el entorno del proceso, de modo que exportar `ANTHROPIC_BASE_URL` no redirige el trafico por si solo.
- La captura de prompts mediante hook tiene implicaciones de privacidad si el codigo tratado es sensible.
- Con `n_ctx` en 524288 y 4 secuencias, la memoria de KV puede ser prohibitiva en GPU de gama baja; no se documenta el consumo real y el propio ejemplo de arranque usa 131072.
- El ahorro de cache depende de la coincidencia de prefijos: el caso peor documentado reenvio 22.677 tokens por un punto de divergencia ausente del archivo, aunque siguio por encima del prefill en frio.
- La reutilizacion por similitud de pregunta (`CC_QREUSE=2` con `CC_QEDIT=1`) devuelve respuestas sin recalcular; mal calibrada, puede servir una respuesta a una pregunta que ya no es equivalente.
- Idioma documentado: ingles. No se declara soporte multilingue del backend ni de los mensajes.
- Licencia Apache-2.0 en el repositorio, permisiva para uso comercial; no se mencionan restricciones adicionales, pero la misma licencia no cubre los pesos que el usuario cargue, sujetos a su propia licencia.
- La informacion disponible no documenta pruebas de estabilidad, concurrencia alta ni uso en produccion mas alla de la sesion medida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LinkRur/cc-srv-agent-fanout
- No se han encontrado en la busqueda web enlaces relevantes al proyecto (paper, blog, repositorio de codigo, demo o documentacion adicional): la busqueda devolvio unicamente resultados no relacionados del servicio de seguimiento de paquetes de USPS.
