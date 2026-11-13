# myx160/pi05-pap-rtc

## Resumen

Pi0.5 PAP policy — training-time RTC es una política robótica de inferencia publicada por el usuario myx160 en Hugging Face, derivada mediante fine-tuning completo del modelo base Physical-Intelligence/pi05_base. El modelo implementa control visomotor para un robot manipulador de dos brazos, tomando como entrada tres imágenes de cámara (hombro izquierdo alto, muñeca izquierda, muñeca derecha) y el estado de 14 articulaciones más dos pinzas, y produciendo trayectorias de acción absolutas en coordenadas del robot. Su rasgo distintivo es el uso de Real-Time Chunking (RTC) en tiempo de entrenamiento: el modelo aprende a respetar un prefijo de 12 acciones ya comprometidas y solo predice el postfijo de 12 acciones restantes sobre un horizonte fijo de 24 pasos.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de despliegue de pi05 con JAX y Orbax fuera del ecosistema PyTorch, con un runtime vendorizado, tokenizador incluido y servidor WebSocket msgpack/NumPy listo para usar. Por otro, muestra una estrategia de entrenamiento orientada a la continuidad de ejecución en robots reales, donde el ejecutor no puede descartar acciones ya en curso y necesita que el modelo se adapte a un prefijo fijado.

El repositorio ocupa 12,4 GB e incluye pesos en formato Orbax (no safetensors ni GGUF), normalización local al checkpoint y un ejemplo sintético de validación. El checkpoint publicado en el momento de redactar esta ficha es `step-003000`, un punto intermedio de una tirada planificada de 30.000 pasos. No se han publicado resultados de benchmarks ni evaluaciones de éxito en tareas robóticas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visomotor (pi05) con flujo de integración para generación de acciones; inferencia en JAX/Orbax |
| Parametros totales | 3.353.433.872 (todos entrenables) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible como ventana de texto general; prompt de texto limitado a 200 tokens; horizonte de acción fijo de 24 pasos (12 prefijo + 12 postfijo) |
| Tipos de cuantizacion | no disponible (pesos Orbax en BF16/FP32 según el esquema de entrenamiento; no se documentan cuantizaciones GGUF/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | runtime/OPENPI_LICENSE (licencia OpenPI) |
| Formato de pesos | Orbax OCDBT (directorio `params/`), cargado por OpenPI/Orbax; no compatible con `AutoModel.from_pretrained` |

## Arquitectura y entrenamiento

El modelo parte de la inicialización oficial pi05_base y se afina con 3.353.433.872 parámetros totalmente entrenables. La arquitectura es un transformer visomotor que procesa tres imágenes (`cam_left_high`, `cam_left_wrist`, `cam_right_wrist`) redimensionadas con padding a 224×224, junto con el estado del robot, y genera acciones mediante un esquema de integración de flujo (flow integration) con 10 pasos por defecto. La representación del robot es de 14 articulaciones de brazo seguidas de dos pinzas, con dimensión interna 32. Las acciones de brazo se predicen como delta respecto al estado actual de forma interna y se restauran a objetivos absolutos en la salida; las pinzas permanecen absolutas en todo el pipeline. El estado se normaliza y se discretiza dentro del prompt de texto de pi05, con un máximo de 200 tokens.

El entrenamiento se realizó con dos A100 de 80 GB en paralelismo de datos puro, batch global 96 (48 por GPU), recomputación de activaciones, cómputo en BF16 y parámetros maestros en FP32 con estado Adam. Se usó AdamW (beta1=0.9, beta2=0.95, epsilon=1e-8, weight decay=1e-10, recorte global de gradiente 1.0), warmup de 1.000 pasos hasta 2.5e-5 y decaimiento coseno hasta 2.5e-6 en el paso 30.000. El conjunto de datos es myx160/pap_1112, con 181 episodios y 47.629 fotogramas. EMA desactivado. La innovación clave es el RTC en tiempo de entrenamiento: la pérdida se calcula solo sobre el postfijo de 12 acciones, manteniendo fijo el prefijo de 12 acciones comprometidas durante todo el muestreo, lo que alinea el entrenamiento con la ejecución real en bucle cerrado.

## Capacidades

- Control visomotor de robot manipulador bimanual a partir de tres cámaras y estado propioceptivo de 14 articulaciones más dos pinzas.
- Generación de trayectorias de acción absolutas con horizonte fijo de 24 pasos (12 de prefijo fijo y 12 de postfijo predicho).
- Condicionamiento a un prefijo de acción comprometido (RTC), lo que permite continuidad de ejecución sin descartar comandos ya enviados al robot.
- Integración de flujo configurable (por defecto 10 pasos) para el muestreo de acciones.
- Normalización local al checkpoint: cada release incluye sus propias estadísticas en `assets/`, lo que permite cargar versiones sin depender del workspace de entrenamiento.
- Servidor WebSocket msgpack/NumPy con endpoint `/healthz` y metadatos de política al conectar, más cliente de ejemplo.
- Carga de política mediante API pública `load_policy` / `load_request` del paquete `pap_runtime`.
- Inferencia local tras la descarga, incluida la tokenización; no requiere acceso a GCS ni a los datos de entrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Ejecución en bucle cerrado sobre robot real: el modelo recibe el prefijo de 12 acciones ya comprometidas por el ejecutor y devuelve solo el postfijo de 12 acciones nuevas, lo que evita discontinuidades cuando el controlador no puede cancelar comandos en curso. Es el caso de uso central del repositorio.
- Manipulación bimanual con agarre: al modelar 14 articulaciones y dos pinzas con rangos de comando empíricos, encaja en tareas de pick-and-place, ensamblaje ligero o manipulación de objetos que requieran coordinación de ambos brazos.
- Política de imitación sobre un dataset propio: el repositorio documenta el pipeline completo (181 episodios, 47.629 fotogramas) y las estadísticas de normalización, lo que sirve como plantilla para afinar pi05_base con datos propios de un robot concreto.
- Servicio de inferencia remoto: el servidor WebSocket msgpack/NumPy permite separar el equipo de control del robot del equipo con GPU, enviando observaciones y recibiendo acciones por red local.
- Validación de integración en CI: el script `smoke_infer.py` y `verify_preprocessing.py` permiten comprobar que el entorno, los pesos y el preprocesado cargan correctamente antes de desplegar en hardware.
- Investigación en RTC: al publicar el checkpoint intermedio `step-003000` y planificar releases hasta `step-030000`, permite estudiar la evolución del rendimiento con el número de pasos de fine-tuning y comparar estrategias de prefijo comprometido.
- Despliegue en una sola GPU: el runtime selecciona asignación CUDA bajo demanda y está pensado para un único dispositivo visible, lo que facilita probar la política en estaciones de trabajo con una GPU NVIDIA compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el ejemplo incluido es sintético, no realiza actuación sobre robot y sus resultados constituyen una prueba de carga e interfaz, no una evaluación de éxito en tareas. `runtime/validation.json` recoge la validación del release, pero no se detallan métricas de tarea en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3.353.433.872 parámetros, en BF16 los pesos ocupan aproximadamente 6,7 GB, a lo que hay que sumar activaciones, tres imágenes a 224×224 y el estado del runtime JAX; el entrenamiento se hizo con A100 de 80 GB, pero la inferencia está pensada para un solo dispositivo.
- GPU recomendadas: no se especifican modelos concretos. El runtime fija wheels de CUDA 12 y requiere un driver NVIDIA compatible; el ejemplo se ejecuta con `CUDA_VISIBLE_DEVICES=0`.
- ¿Cabe en GPU de consumo? No se confirma en la información disponible. Por tamaño de pesos en BF16 sería teóricamente posible en GPUs de 16-24 GB, pero no hay validación publicada ni cuantizaciones documentadas que lo garanticen.
- Opciones de despliegue: runtime propio basado en JAX/Orbax con `uv` y Python 3.11; servidor WebSocket msgpack/NumPy incluido (`runtime/serve.py`) y cliente de ejemplo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato Orbax no es compatible con `AutoModel.from_pretrained`.
- Latencia y throughput: no disponibles. El autor advierte que la primera petición incluye compilación JIT y recomienda calentar con una petición offline antes de medir latencia.
- Sistema operativo: Linux x86_64, Python 3.11, `uv` y driver NVIDIA compatible con las wheels CUDA 12 fijadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| myx160/pi05-pap-rtc | 3.353.433.872 | 24 pasos de acción (12 prefijo + 12 postfijo) | Fine-tuning de pi05 con RTC en entrenamiento, JAX/Orbax | OpenPI (runtime/OPENPI_LICENSE) | Hugging Face, checkpoint step-003000 |
| Physical-Intelligence/pi05_base | no disponible en la información | no disponible | Modelo base visomotor pi05 | no disponible en la información | Hugging Face |
| Otros modelos robóticos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El checkpoint publicado (`step-003000`) es intermedio: representa 3.000 de los 30.000 pasos planificados, por lo que su rendimiento puede ser inferior al de releases posteriores.
- No hay evaluación de éxito en tareas robóticas reales; el ejemplo incluido es sintético y no ejecuta actuación sobre robot.
- El prefijo de 12 acciones es obligatorio y debe estar en coordenadas absolutas del robot; el ejecutor solo debe añadir el postfijo devuelto en los índices temporales correspondientes. Un uso incorrecto del prefijo invalida la inferencia.
- Los rangos de las pinzas son empíricos (`[0.000015554427591268905, 5.400000095367432]`) y no una calibración física; la normalización del estado es independiente y cada release incluye sus propias estadísticas.
- El formato Orbax OCDBT exige mantener la estructura del directorio `params/` y no es cargable con `AutoModel.from_pretrained`; requiere el runtime OpenPI/Orbax incluido.
- La licencia es la OpenPI incluida en `runtime/OPENPI_LICENSE`; deben revisarse sus términos antes de cualquier uso comercial, ya que la información disponible no detalla restricciones adicionales.
- No se documentan idiomas soportados ni sesgos conocidos; el prompt de texto está limitado a 200 tokens y el estado se discretiza dentro de él.
- La primera petición incluye compilación JIT, lo que puede distorsionar mediciones de latencia si no se calienta el servidor.
- El repositorio no publica cuantizaciones ni métricas de throughput, lo que limita la planificación de capacidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myx160/pi05-pap-rtc
- Modelo base: https://huggingface.co/Physical-Intelligence/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/myx160/pap_1112
- Licencia OpenPI: https://huggingface.co/myx160/pi05-pap-rtc/blob/main/runtime/OPENPI_LICENSE
- Registro de releases: https://huggingface.co/myx160/pi05-pap-rtc/blob/main/releases.json
- Interfaz del robot: https://huggingface.co/myx160/pi05-pap-rtc/blob/main/INTERFACE.md
- Validación del release: https://huggingface.co/myx160/pi05-pap-rtc/blob/main/runtime/validation.json
- Ejemplos de entrada y salida: https://huggingface.co/myx160/pi05-pap-rtc/tree/main/runtime/examples
