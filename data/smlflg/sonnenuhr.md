# smlflg/Sonnenuhr

## Resumen

Sonnenuhr no es un modelo de inteligencia artificial ni un modelo de lenguaje: es un daemon local escrito en Python que ajusta la luminosidad del monitor y la temperatura de color en funcion de la posicion del sol. Lo publica el usuario `smlflg` en HuggingFace bajo el identificador `smlflg/Sonnenuhr`, con 0 descargas y 0 likes en el momento de la consulta, y sin pipeline, licencia ni idiomas declarados. La model card esta redactada en aleman y describe un servicio de escritorio, no un artefacto de pesos neuronales.

El problema que resuelve es el clasico de la fatiga visual y la disrupcion del ritmo circadiano: en lugar de fijar manualmente el brillo y el tono de pantalla, el daemon calcula periodicamente los valores objetivo a partir de la ubicacion geografica y la fase del dia, y los aplica al hardware de visualizacion. Se ejecuta con una bucle de actualizacion periodica (por defecto cada 30 segundos), acepta comandos de control a traves de un socket Unix (`/tmp/sonnenuhr.sock`) y, opcionalmente, tiene en cuenta el cambio de tema de COSMIC.

Es relevante para desarrolladores de escritorio Linux que quieran una gestion automatizada de pantalla con control fino por monitor, pero no debe confundirse con un modelo generativo: no hay parametros, ni contexto, ni cuantizacion, ni inferencia. Cualquier evaluacion tipo MMLU, HumanEval o GSM8K carece de sentido aqui. Los resultados de busqueda web devueltos no contienen informacion sobre este proyecto (son enlaces genericos de Amazon.fr), por lo que toda la informacion tecnica procede exclusivamente de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (daemon en Python; no es una red neuronal) |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible en la model card (la documentacion esta en aleman) |
| Licencia | no disponible |
| Formato de pesos | no aplica (no distribuye pesos; es codigo fuente y configuracion JSON) |
| Tipo de artefacto | proyecto de software / daemon de sistema |
| ID en HuggingFace | smlflg/Sonnenuhr |
| Dependencia Python declarada | `astral>=3.2` (segun `requirements.txt`) |
| Herramientas externas requeridas | `ddcutil`, `brightnessctl`, `gammastep` y comandos de tema de COSMIC |
| Configuracion por defecto | `config/sonnenuhr.json` |
| Configuracion de usuario | `~/.config/sonnenuhr/config.json` o la ruta indicada por `SONNENUHR_CONFIG` |
| Intervalo de actualizacion | `update_interval_seconds: 30` (valor por defecto) |
| Rango de brillo | 0-100 |
| Rango de temperatura de color | 2700-6500 K |
| Valores por defecto de brillo | `day_max: 100`, `night_min: 10` |
| Valores por defecto de color | `day_kelvin: 6500`, `night_kelvin: 5000` |
| Duracion de override por defecto | `override_duration_minutes: 120` |
| Ubicacion de ejemplo | latitud 51.05, longitud 13.74, zona horaria `Europe/Berlin` |
| Fecha de creacion indicada | 2026-09-16T19:52:18Z |
| Fecha de actualizacion indicada | 2026-09-16T19:52:19Z |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El proyecto es un servicio de usuario que combina tres piezas: un bucle periodico de actualizacion que recalcula los valores objetivo, un calculo astronomico delegado en la libreria `astral` para determinar la posicion solar y la fase del dia, y una capa de aplicacion de cambios que invoca herramientas locales del sistema (`ddcutil`, `brightnessctl`, `gammastep`) o comandos de cambio de tema de COSMIC. La comunicacion con el exterior se realiza mediante un socket Unix en `/tmp/sonnenuhr.sock`, sobre el que se expone una CLI (`sonnenuhr-ctl`) con comandos de estado, ajuste, override y configuracion por pantalla.

El estado se persiste en `/tmp/sonnenuhr-state.json` (con fichero temporal `/tmp/.sonnenuhr-state.tmp`), el registro en `/tmp/sonnenuhr.log` y el bloqueo en `/tmp/sonnenuhr.lock`. Existe un servicio de usuario de systemd en `services/sonnenuhr.service` que lanza el daemon. La model card no documenta innovaciones tecnicas adicionales (no hay decodificacion especulativa, atencion lineal ni tecnicas equivalentes, porque no aplican a este tipo de software), ni datos de entrenamiento, ni fases de RLHF o DPO.

## Capacidades

- Calculo de luminosidad y temperatura de color objetivo a partir de la posicion del sol y la ubicacion configurada.
- Aplicacion real de cambios de pantalla mediante herramientas locales (`ddcutil`, `brightnessctl`, `gammastep`).
- Bucle de actualizacion periodica configurable (`update_interval_seconds`, 30 s por defecto).
- Control remoto mediante CLI sobre socket Unix: `status`, `set`, `color`, `override`, `auto`, `disable`, `enable`, `theme`.
- Ajuste persistente por pantalla: `set-display`, `set-display-offset`, `set-display-color`, `set-display-enabled`.
- Modo override temporal para mantener valores fijos durante N minutos (120 por defecto) antes de volver a la automatica.
- Integracion opcional con el cambio de tema de COSMIC (`dark`, `light`, `auto`).
- Separacion entre configuracion por defecto y overrides de usuario, con soporte de variable de entorno para rutas alternativas.
- Suite de pruebas ejecutable con `pytest`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling en el sentido de los LLM ni capacidades multilingues como modelo. El unico idioma de la documentacion es el aleman.

## Casos de uso

- Escritorio Linux personal con ajuste circadiano: el daemon recalcula cada 30 segundos la luminosidad y los kelvin segun la posicion del sol en la ubicacion configurada, de modo que la pantalla baja de 6500 K a 5000 K y de brillo 100 a 10 entre el dia y la noche sin intervencion manual.
- Equipos con COSMIC como entorno de escritorio: permite sincronizar el cambio de tema (`dark`, `light`, `auto`) con la fase del dia, de forma que la interfaz y la temperatura de color de la pantalla evolucionan de forma coherente.
- Estaciones de trabajo con varios monitores de caracteristicas distintas: los comandos `set-display`, `set-display-offset` y `set-display-color` permiten fijar brillo objetivo, offset y temperatura de color por pantalla, util cuando los paneles tienen respuestas de brillo o gamma dispares.
- Sesiones de edicion fotografica o de video: el comando `override <min>` mantiene valores neutros (por ejemplo 6500 K y brillo alto) durante un periodo controlado, evitando que el ajuste automatico contamine la evaluacion de color, y vuelve a la automatica al terminar.
- Kioscos y paneles de digital signage sobre Linux: se puede pausar el daemon con `disable` durante las horas de operacion y reactivarlo con `enable`, o ajustar la temperatura por pantalla para homogeneizar un videowall.
- Integracion con scripts de automatizacion y gestores de entorno: al exponer un socket Unix y una CLI, se puede invocar desde hooks de sesion, reglas de gestor de energia o scripts propios para cambiar el estado de la pantalla segun la hora o el perfil de usuario.
- Monitorizacion y diagnostico de estado: el comando `status` permite leer el estado actual del daemon, util para verificar que las herramientas de hardware estan funcionando y que el estado persistido en `/tmp/sonnenuhr-state.json` coincide con lo esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de aprendizaje automatico, no existen metricas del tipo MMLU, HumanEval o GSM8K, ni comparaciones de calidad de generacion. La unica verificacion mencionada en la model card es la suite de pruebas del propio proyecto, ejecutable con `./.venv/bin/python -m pytest -q`, cuyo resultado no se detalla.

## Requisitos de hardware

- VRAM: no aplica. El daemon no realiza inferencia ni carga pesos en GPU.
- Consumo de recursos: no disponible en la informacion proporcionada; se trata de un proceso Python de usuario con un bucle cada 30 segundos, por lo que la carga esperada de CPU es baja.
- GPU: no aplica. No se requiere ninguna GPU (A100, H100, RTX 4090 ni similares) para el funcionamiento del daemon.
- Requisitos reales: Python 3, la dependencia `astral>=3.2`, y herramientas locales de control de pantalla (`ddcutil`, `brightnessctl`, `gammastep`) o los comandos de tema de COSMIC si se usa esa integracion.
- Control de hardware externo: el comportamiento depende de la pantalla y del entorno de escritorio concretos. `ddcutil` requiere acceso a la interfaz i2c del monitor, lo que habitualmente implica permisos o configuracion adicional del sistema.
- Opciones de despliegue: ejecucion directa con `./.venv/bin/python sonnenuhr.py` o como servicio de usuario de systemd mediante `services/sonnenuhr.service`. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no aplica en el sentido de inferencia; el intervalo de actualizacion configurado por defecto es de 30 segundos.

## Comparativa con modelos similares

La comparativa se establece con otras utilidades de ajuste automatico de pantalla, no con modelos de IA.

| Proyecto | Enfoque | Control por socket/CLI | Ajuste por pantalla | Integracion con temas | Licencia |
|---|---|---|---|---|---|
| Sonnenuhr | Daemon Python basado en posicion solar (`astral`) | Si, socket Unix en `/tmp/sonnenuhr.sock` y `sonnenuhr-ctl` | Si (`set-display`, `set-display-offset`, `set-display-color`) | Si, COSMIC (`dark`, `light`, `auto`) | no disponible |
| gammastep | Ajuste de temperatura de color tipo Redshift | no disponible | no disponible | no disponible | no disponible |
| Redshift | Ajuste de temperatura de color segun ubicacion y hora | no disponible | no disponible | no disponible | no disponible |
| f.lux | Ajuste de color y brillo segun hora local | no disponible | no disponible | no disponible | no disponible |

Los datos de funcionalidad de las alternativas no estan recogidos en la informacion proporcionada y se marcan como no disponibles. La unica columna con informacion verificable es la de Sonnenuhr, extraida de su model card. Los resultados de busqueda web no aportaron enlaces a repositorios, papers ni demos comparables.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural y no debe integrarse en pipelines de inferencia. Cualquier intento de usarlo como modelo de lenguaje fallara.
- La licencia no esta declarada en la model card, por lo que no se puede confirmar si se permite el uso comercial, la modificacion o la redistribucion. Debe consultarse con el autor antes de cualquier uso en produccion.
- No se declaran idiomas soportados. La documentacion existente esta en aleman, lo que puede limitar su adopcion en otros entornos.
- Dependencia fuerte del entorno local: el daemon necesita `ddcutil`, `brightnessctl`, `gammastep` y comandos de COSMIC. Si estas herramientas no existen o no tienen permisos suficientes, los cambios de pantalla no se aplicaran.
- La model card advierte explicitamente de que el comportamiento de hardware y escritorio depende de la configuracion local y de las herramientas externas mencionadas.
- Riesgo de conflicto con otros gestores de color: si ya hay un ajuste de temperatura activo (por ejemplo, gammastep o Redshift ejecutandose por separado), pueden solaparse y producir resultados inconsistentes.
- El estado y los ficheros de bloqueo se ubican en `/tmp`, lo que implica que se pierden al reiniciar el sistema y que pueden entrar en conflicto si el directorio es compartido o se limpia de forma agresiva.
- El proyecto no presenta descargas ni likes y no se han encontrado referencias externas, papers ni articulos: la madurez y el mantenimiento a largo plazo son inciertos.
- Las fechas de creacion y actualizacion indicadas (2026-09-16) no permiten extraer conclusiones sobre la actividad real del repositorio.
- No hay informacion sobre sesgos, alucinacion ni rendimiento porque no aplican a este tipo de software; se omite su evaluacion.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/smlflg/Sonnenuhr
- No se han encontrado en la busqueda web enlaces a papers, blogs, repositorios adicionales ni demos de este proyecto. Los resultados devueltos correspondian a dominios de comercio electronico sin relacion con el modelo.
- Rutas internas relevantes documentadas en la model card: `config/sonnenuhr.json`, `~/.config/sonnenuhr/config.json`, `services/sonnenuhr.service`, `/tmp/sonnenuhr.sock`, `/tmp/sonnenuhr-state.json`, `/tmp/sonnenuhr.log`, `/tmp/sonnenuhr.lock`.
