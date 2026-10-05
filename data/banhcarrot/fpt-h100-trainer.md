# banhcarrot/fpt-h100-trainer

## Resumen

fpt-h100-trainer no es un modelo de lenguaje, sino un kit de herramientas de infraestructura de entrenamiento publicado en HuggingFace por el usuario banhcarrot. Su objetivo es ejecutar procesos de fine-tuning de forma robusta dentro de contenedores con GPU H100 alojados en FPT Cloud, un proveedor de nube con presencia en el sudeste asiatico. El diseno parte de una premisa concreta: en este tipo de entorno el contenedor puede morir en cualquier momento, por lo que un checkpoint nunca debe existir unicamente en el disco efimero del contenedor.

El repositorio agrupa un entry point de entrenamiento, un supervisor con reinicio automatico, un bucle de copia de seguridad de checkpoints, un manejador de senal SIGTERM para guardado de emergencia, un cliente de la API de FPT Cloud, un sincronizador de codigo contra un repositorio de HuggingFace y un panel de control con webhook desplegable como Space. Todo el codigo se distribuye bajo licencia Apache 2.0 y esta documentado principalmente en vietnamita, con ejemplos de ejecucion incluidos en la model card.

La relevancia actual del proyecto radica en que aborda un problema poco cubierto por las librerias de entrenamiento convencionales: la orquestacion tolerante a fallos sobre infraestructura cloud efimera, con verificacion de facturacion y recuperacion automatica ante caidas. No publica pesos, arquitectura ni datos de entrenamiento, ya que su proposito es servir de andamiaje para entrenar otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (es un toolkit de entrenamiento, no un modelo) |
| Parametros totales | no disponible (no es un modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (documentacion principal en vietnamita) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no publica pesos; los checkpoints generados dependen del modelo entrenado) |

## Arquitectura y entrenamiento

El toolkit se organiza en modulos independientes orquestados alrededor de un entry point, `train.py`, que realiza una secuencia fija: comprobacion de disco libre, descarga del codigo desde el repositorio indicado en `HF_CODE_REPO`, instalacion de manejadores de senal, carga del dataset con verificacion de la columna de texto, entrenamiento con reanudacion automatica y, finalmente, publicacion del modelo resultante en el repositorio `HF_MODEL_ID`. El entrenamiento concreto depende del modelo y dataset que se pasen por linea de comandos; en el ejemplo de la model card se usa `meta-llama/Llama-3.2-1B` con el dataset `wikitext-2-raw-v1`.

La capa de robustez la componen cuatro piezas. `supervisor.py` reinicia `train.py` cuando este cae, aplicando un backoff exponencial de 15 a 900 segundos que se reinicia tras diez minutos de ejecucion estable. `backup_loop.py` copia periodicamente el checkpoint mas reciente al directorio `BACKUP_DIR` o a un repositorio de dataset en HuggingFace. `emergency_checkpoint.py` responde a la senal SIGTERM guardando un checkpoint antes de que el contenedor se detenga. `train.py` rechaza arrancar si el espacio libre en disco es inferior a `MIN_FREE_DISK_GB`, cuyo valor por defecto es 50 GB. Ademas, si `flash-attn` no puede instalarse, el sistema degrada la atencion de `flash_attention_2` a `sdpa` y, por ultimo, a `eager`. La gestion del ciclo de vida del contenedor recae en `fpt_api.py`, que expone operaciones de arranque, parada, estado y facturacion con reintentos y verificacion, y en `test_billing.py`, que mide la tasa de gasto antes y despues de detener el contenedor para confirmar que el cobro se detiene realmente.

## Capacidades

- Entrenamiento y fine-tuning de modelos de lenguaje dentro de contenedores GPU, delegando el bucle de entrenamiento en la configuracion que reciba el entry point.
- Recuperacion automatica ante caidas del proceso de entrenamiento mediante supervisor con backoff exponencial.
- Reanudacion desde el checkpoint mas reciente de forma automatica cuando `RESUME` esta activado.
- Guardado de emergencia ante SIGTERM para evitar la perdida de progreso cuando el contenedor se detiene.
- Copia de seguridad periodica de checkpoints fuera del disco del contenedor.
- Sincronizacion bidireccional de codigo entre el contenedor y un repositorio de HuggingFace.
- Degradacion progresiva del backend de atencion segun disponibilidad de librerias.
- Gestion programatica del ciclo de vida de contenedores en FPT Cloud (arranque, parada, estado, facturacion).
- Verificacion de facturacion para confirmar que un contenedor detenido deja de generar coste.
- Panel de control web con verificacion de webhook mediante cabecera `X-Webhook-Secret` y botones de arranque y parada.
- No incluye capacidades de generacion de texto, vision, audio, tool calling ni razonamiento, al no ser un modelo.

## Casos de uso

- Fine-tuning de modelos pequenos en la nube: un equipo sin acceso a GPU local puede entrenar adaptaciones de modelos como Llama-3.2-1B en un contenedor H100 de FPT Cloud, apoyandose en la reanudacion automatica para sobrevivir a reinicios del contenedor.
- Entrenamientos de larga duracion en infraestructura efimera: cuando el contenedor tiene una vida util limitada o puede ser expulsado, el guardado de emergencia por SIGTERM y el bucle de copia de seguridad garantizan que el progreso no se pierda.
- Orquestacion desde un panel web: el Space de control permite a un operador arrancar y detener el contenedor, ademas de inspeccionar eventos, sin acceso directo a la linea de comandos.
- Control de costes en la nube: `test_billing.py` permite auditar que la parada del contenedor detiene efectivamente la facturacion, util para equipos que dependen de apagar recursos para no encarecer el entrenamiento.
- Entornos de investigacion con pipelines reproducibles: la sincronizacion de codigo contra un repositorio versionado facilita que cada contenedor arranque siempre con la version exacta del script de entrenamiento.
- Experimentacion con modelos y datasets de HuggingFace: se puede lanzar un fine-tuning sobre cualquier modelo y dataset publicados cambiando los parametros de linea de comandos y las variables de entorno.
- Aprovisionamiento automatizado de GPU: `fpt_api.py` permite integrar el arranque y la parada de instancias H100 dentro de scripts o flujos de CI, comprobando el estado mediante polling hasta que el contenedor esta en ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU: el toolkit esta disenado para contenedores con GPU H100 en FPT Cloud, segun los tags del repositorio.
- VRAM: depende del modelo y del batch que se entrene; no se especifica en la informacion disponible. El ejemplo de la model card usa Llama-3.2-1B con `per_device_train_batch_size 8`.
- Almacenamiento: se exige un minimo de `MIN_FREE_DISK_GB` configurable, con un valor por defecto de 50 GB, para permitir el arranque del entrenamiento.
- GPU de consumo: no disponible; el diseno asume instancias H100 en FPT Cloud.
- Opciones de despliegue: ejecucion directa con `python supervisor.py python train.py`, construccion de un contenedor Docker para el panel de control con `docker build -f controller/Dockerfile` y despliegue del controlador como HuggingFace Space con SDK Docker.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El objeto no es un modelo sino una utilidad de orquestacion, por lo que la comparacion natural es con otros marcos de entrenamiento que persiguen objetivos parcialmente solapados. No se dispone de datos medidos para una comparacion cuantitativa, de modo que las celdas no verificables se marcan como no disponibles.

| Herramienta | Categoria | Robustez ante caida de contenedor | Gestion de facturacion | Licencia |
|---|---|---|---|---|
| fpt-h100-trainer | Orquestacion de entrenamiento en FPT Cloud | Si (supervisor, SIGTERM, backup) | Si (`test_billing.py`) | apache-2.0 |
| Frameworks genericos de fine-tuning | Librerias de entrenamiento | no disponible | no disponible | no disponible |
| Orquestadores de contenedores en la nube | Infraestructura | no disponible | no disponible | no disponible |

Datos concretos de rendimiento, parametros y contexto de alternativas: no disponibles.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no puede usarse para inferencia.
- La documentacion principal esta en vietnamita, lo que puede dificultar su adopcion por equipos no familiarizados con ese idioma.
- El repositorio registra 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validacion externa y de comunidad activa.
- La integracion con FPT Cloud depende del layout de endpoints asumido en `fpt_api.py`; el propio autor indica que si las rutas de la API difieren, deben ajustarse las cuatro propiedades `_PATH` de la clase `FPTClient`.
- La verificacion de facturacion se basa en una medicion de la tasa de gasto antes y despues de la parada; puede dar falsos negativos si la API de facturacion presenta retardo de actualizacion.
- La robustez se apoya en la correcta configuracion de variables de entorno como `HF_TOKEN`, `FPT_API_TOKEN` y `WEBHOOK_SECRET`; una mala configuracion puede exponer el webhook o impedir la publicacion del modelo.
- El guardado de emergencia ante SIGTERM esta sujeto al tiempo que el orquestador conceda antes de forzar la parada del contenedor.
- Riesgo de alucinacion, sesgos o limitaciones de idioma: no aplica, al no tratarse de un modelo generativo.
- La licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia.
- La fecha de creacion y actualizacion registrada (2026-10-05) es posterior a la fecha habitual de consulta, dato que conviene verificar en la plataforma.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/banhcarrot/fpt-h100-trainer
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
