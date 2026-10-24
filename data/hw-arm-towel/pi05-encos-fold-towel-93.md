# hw-arm-towel/pi05-encos-fold-towel-93

## Resumen

`hw-arm-towel/pi05-encos-fold-towel-93` es un checkpoint de visión-lenguaje-acción (VLA) para robótica obtenido mediante ajuste fino supervisado de todos los parámetros de `pi05_base`, el modelo base de Physical Intelligence. El autor, `hw-arm-towel`, lo ha entrenado sobre 92 episodios de demostración de plegado de toallas con un robot bimanual Encos (361.507 fotogramas a 30 FPS, tres cámaras RGB). No es un modelo de propósito general: es una política especializada en una única tarea y un único cuerpo robótico, publicada como material reproducible de investigación.

El repositorio contiene dos checkpoints de inferencia en formato JAX/Orbax (unos 12,44 GB cada uno): `step-19999`, que es el recomendado por defecto, y `step-18000`, incluido como control. Ambos incluyen pesos EMA, estadísticas de normalización y código de inferencia autónomo; no se distribuyen estados de optimizador ni los vídeos originales de entrenamiento. El paquete se activa cuando aparece el fichero `READY.json` en el repositorio.

Su relevancia es doble: por un lado, demuestra un flujo completo de ajuste fino de π0.5 con *flow matching* sobre datos LeRobot v3 en solo 20.000 actualizaciones (unas 3 horas y 8 minutos en 2× H200); por otro, documenta con transparencia sus propias métricas, que son de ajuste offline sobre el conjunto de entrenamiento y no miden éxito real en robot. Es, por tanto, una referencia útil para quien quiera evaluar el coste y el rendimiento de adaptar un VLA open source a una celda de manipulación concreta, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (`pi05_base` de Physical Intelligence) con *flow matching* para generación de acciones; implementación JAX |
| Parametros totales | No disponible (el autor no publica el recuento; cada checkpoint ocupa 12,44 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la entrada lingüística es una instrucción fija de una frase, no diálogo |
| Tipos de cuantizacion | No disponible; solo se distribuyen pesos JAX/Orbax. No hay versiones GGUF, AWQ, GPTQ ni INT8/INT4 publicadas |
| Idiomas soportados | `zh`, `en` (según metadatos); la instrucción de entrenamiento es en inglés |
| Licencia | `apache-2.0-and-gemma-terms` (Apache-2.0 con las condiciones de los componentes Gemma; ver `NOTICE`) |
| Formato de pesos | JAX/Orbax (`step-19999/`, `step-18000/`); no es safetensors ni GGUF y no se carga con `AutoModel.from_pretrained` ni con las clases de política PyTorch de LeRobot |
| Entrada | 3 imágenes RGB (cabeza, muñeca izquierda, muñeca derecha) a 480×640 nativo, reescaladas con relleno a 224×224; estado `float32[16]`; `prompt` opcional |
| Salida | `float32[50,16]`: 50 objetivos absolutos de articulación y pinza (unos 1,67 s a 30 Hz), ya desnormalizados |
| Normalizacion | Quantile (q01/q99) calculada sobre el dataset `fold-towel-93`; el estado normalizado se discretiza y se incorpora a la entrada de lenguaje |
| Tamano del repo | 24,9 GB (los dos checkpoints) |

## Arquitectura y entrenamiento

La arquitectura subyacente es π0.5, un modelo VLA que combina un codificador visual y de lenguaje con un decodificador de acciones entrenado por *flow matching*. El modelo recibe tres vistas RGB, un vector de estado de 16 dimensiones y una instrucción textual; internamente el estado se normaliza y se discretiza para inyectarlo en la secuencia de lenguaje, y la salida se genera integrando un campo de flujo de ruido a acción. En esta ficha no se dispone del detalle de capas, dimensión oculta ni número de parámetros, porque el autor no los publica.

El ajuste fino se hizo sobre el dataset `hw-arm-towel/fold-towel-93` (revisión fijada `90b2600…`), en formato LeRobot v3: 92 episodios, 361.507 fotogramas a 30 FPS y tres cámaras (cabeza, muñeca izquierda, muñeca derecha). Cada muestra toma las tres imágenes actuales, el estado actual de 16 dimensiones y la instrucción fija `fold a towel with both arms`; el objetivo supervisado son los 16 valores absolutos de articulación y pinza de los 50 fotogramas siguientes. La interfaz interna rellena de 16 a 32 dimensiones y recorta a la salida; no se usó la adaptación de 14 dimensiones de Piper ni se convirtieron las acciones a incrementos. El entrenamiento empleó *flow matching* con ruido gaussiano mezclado según un coeficiente temporal, sin GP prior, GPR, *OT coupling* ni ruido DSRL de SANE.

La configuración formal fue: 2× NVIDIA H200, FSDP=2, batch global 16, AdamW con *warmup* de 1.000 pasos hasta 5e-5 y decaimiento coseno hasta 5e-6, EMA de 0,99, semilla 42 y 20.000 actualizaciones de optimización (3 h 8 min en total). Todos los parámetros se actualizaron, no es un LoRA. El código parte de `Linux-2023/SANE` (commit `c9d724a`) sobre el upstream `Physical-Intelligence/openpi`, con los commits de entrenamiento `4ed94fd` y de corrección `7ee4323`. No se realizó ningún experimento comparativo entre 1 y 8 GPU; el autor advierte explícitamente que, manteniendo el batch por GPU, el batch global cambia y las diferencias no son atribuibles al número de tarjetas.

## Capacidades

- Predicción de trayectorias de 50 pasos (unos 1,67 s a 30 Hz) de 16 dimensiones absolutas: 7 articulaciones y una pinza por brazo, para un robot bimanual Encos.
- Plegado de toallas con dos brazos a partir de tres vistas RGB simultáneas (cabeza y ambas muñecas), con el estado articular actual como contexto.
- Condicionamiento por instrucción textual: acepta un campo `prompt`, aunque en la práctica está entrenado con una única instrucción fija en inglés.
- Control de pinza: salida continua por dimensión, con umbral 0,5 sugerido para uso binario (0 = abierto, 1 = cerrado).
- Inferencia en tres modos: script offline sobre `.npz`, servicio websocket (`--serve`) para separar el servidor GPU del robot, y API Python (`load_policy`, `validate_observation`, `policy.infer`).
- Integración de flujo configurable: el protocolo de validación del autor usa 10 pasos de integración con semilla fija.
- No soporta *tool calling*, ni razonamiento multi-paso genérico, ni diálogo multi-turno, ni otras modalidades (audio, vídeo, documentos).

## Casos de uso

- **Automatización del plegado de toallas en una celda Encos**: es el escenario exacto de entrenamiento. El modelo consume las tres cámaras y el estado de 16 dimensiones y devuelve los objetivos articulares de los siguientes 50 fotogramas, que el controlador puede ejecutar total o parcialmente antes de replanificar.
- **Punto de partida para ajuste fino en otras tareas bimanuales**: al ser un ajuste completo de `pi05_base` sobre datos LeRobot v3, sirve como inicialización para tareas de manipulación con dos brazos que compartan el espacio de 16 dimensiones, con un coste de entrenamiento de referencia de 20.000 actualizaciones en 2× H200.
- **Reproducción y auditoría del pipeline openpi + SANE**: el repositorio incluye `training_config.json`, `evaluation/checkpoint_comparison.json` y sumas SHA256, lo que permite reproducir la comparación de checkpoints y auditar la metodología de evaluación sin acceso al conjunto de datos original.
- **Servidor de inferencia remoto para robots con cómputo limitado**: con `python inference.py --serve --host 127.0.0.1 --port 8000` y un túnel SSH, el robot puede enviar observaciones y recibir acciones desde una máquina con GPU; el cliente `WebsocketClientPolicy` de `openpi_client` se encarga del transporte.
- **Pruebas de regresión en CI de robótica**: el modo offline con `.npz` (`--input observation.npz --output actions.npy`) permite fijar observaciones grabadas y comparar las acciones generadas entre versiones del *runtime* o del checkpoint, detectando regresiones numéricas sin necesidad de hardware.
- **Investigación en *flow matching* aplicado a VLA**: la configuración desactiva explícitamente GP prior, GPR, *OT coupling* y ruido DSRL, lo que la convierte en una línea base limpia para medir el efecto de esas técnicas sobre una tarea de manipulación real.
- **Evaluación de robustez visual**: al depender de tres cámaras con encuadres concretos, el checkpoint permite estudiar la degradación de la política ante cambios de iluminación, oclusión o reencuadre mediante el *harness* offline, siempre que se documente que las métricas de partida son sobre datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas de éxito en robot). El autor solo proporciona una comparación de checkpoints en **ajuste offline sobre el propio conjunto de entrenamiento**, no en validación independiente.

Protocolo declarado: mismas grabaciones de los segmentos 0, 45 y 91; una observación cada 30 fotogramas; 343 puntos de predicción y 17.041 fotogramas futuros de acción válidos; semilla 0; 10 pasos de integración de flujo; exclusión de los fotogramas de relleno al final de episodio.

| Checkpoint (paso de directorio) | Actualizaciones reales | MAE 14 articulaciones (rad) | RMSE 14 articulaciones (rad) | Precisión de pinza |
|---|---:|---:|---:|---:|
| 14000 | 14001 | 0,039622 | 0,074253 | 94,84 % |
| 16000 | 16001 | 0,035169 | 0,066734 | 95,39 % |
| 18000 (control) | 18001 | 0,033020 | 0,062909 | 95,63 % |
| **19999 (por defecto)** | **20000** | **0,030427** | **0,058445** | **96,19 %** |

Advertencia del propio autor: estos datos forman parte del entrenamiento, por lo que la tabla mide ajuste en lazo abierto, no generalización ni tasa de éxito en lazo cerrado. No se recorrieron todos los checkpoints intermedios ni se seleccionó el modelo por comportamiento en robot real. Tampoco se han publicado latencia ni *throughput* de inferencia.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión. El autor solo ha validado el *runtime* en una única H200 (141 GB) y sugiere preparar una GPU de clase 24 GB como punto de partida, a confirmar con la medición real. El *runtime* se lanza con `XLA_PYTHON_CLIENT_MEM_FRACTION=0.8`.
- **GPU recomendadas**: H200 (único modelo verificado). A100, H100, L40S y RTX 4090 no han sido probadas por el autor.
- **GPU de consumo**: no confirmado. Una RTX 4090 (24 GB) entra en el rango que el autor sugiere como orientativo, pero no hay verificación publicada; conviene presupuestar margen y probar con `XLA_PYTHON_CLIENT_MEM_FRACTION` ajustado.
- **Almacenamiento**: 12,44 GB por checkpoint; el repositorio completo son 24,9 GB. La descarga debe filtrarse con `allow_patterns` para no traer ambos checkpoints si solo se necesita uno.
- **Entorno**: Ubuntu, Python 3.11, `huggingface_hub==0.32.3`, GPU NVIDIA con CUDA y JAX. El autor fija `JAX_DEFAULT_MATMUL_PRECISION=highest` y `XLA_FLAGS=--xla_gpu_enable_triton_gemm=false` para la aceptación de inferencia.
- **Opciones de despliegue**: solo el *runtime* JAX incluido (`inference.py` en modo `.npz` o `--serve` con websocket). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, porque los pesos son Orbax y no safetensors/GGUF. Requiere JAX y seguirá el backend XLA en lugar de CUDA nativo de PyTorch.
- **Latencia y throughput**: no disponibles. Como referencia funcional, cada llamada produce 50 acciones equivalentes a 1,67 s de trayectoria con 10 pasos de integración de flujo, pero no se publica el tiempo de pared por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05-encos-fold-towel-93` (este) | No disponible | 3 imágenes 224×224 + estado 16-D + prompt | Plegado de toallas bimanual en Encos | Apache-2.0 + términos Gemma | Pesos JAX/Orbax en HF, 2 checkpoints |
| `pi05_base` (Physical Intelligence) | No disponible | Configuración π0.5 original | VLA generalista, punto de partida | Según el repositorio `openpi` (no verificado aquí) | Referenciado como base; no se distribuye en este repo |
| Políticas VLA de código abierto comparables (OpenVLA, π0) | No disponible | No disponible | Manipulación generalista | No disponible | No disponible en la información proporcionada |

No se dispone de datos verificados de otros checkpoints de la misma categoría (misma tarea, mismo robot) en la información consultada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La única comparación interna disponible es la de los cuatro checkpoints de la tabla de benchmarks.

## Limitaciones y advertencias

- **Sin validación independiente ni éxito real**: el autor declara explícitamente que no hay conjunto de validación separado ni tasa de éxito en robot. Todas las métricas publicadas son de lazo abierto sobre datos vistos en entrenamiento, con riesgo alto de sobreajuste.
- **Especialización extrema**: una sola tarea (plegar toallas), un solo cuerpo robótico (Encos de dos brazos) y una sola instrucción. No es una política generalista ni admite composición de tareas.
- **Interfaz rígida**: el orden de las 16 dimensiones (articulaciones 0-6 del brazo izquierdo, pinza 7, articulaciones 8-14 del brazo derecho, pinza 15) y el orden de las cámaras deben coincidir exactamente con el entrenamiento. Un controlador con ángulos en grados, codificación de pinza invertida u otro orden requiere remapeo manual.
- **Preprocesado de imagen**: las imágenes deben llegar en RGB (conversión desde BGR si se usa OpenCV), con la relación de aspecto preservada y relleno a 224×224; las tres vistas deben estar alineadas temporalmente con el estado.
- **Acciones absolutas, no incrementales**: la salida ya está desnormalizada y debe interpretarse como objetivos absolutos; sumarla al estado actual es un error. El autor recomienda no ejecutar el *chunk* completo de 50 pasos sin realimentación.
- **Ausencia de estado de entrenamiento**: el paquete no incluye `optimizer` ni `train_state`, así que no permite reanudar el entrenamiento; solo inferencia.
- **Datos no públicos**: el dataset `fold-towel-93` tiene control de acceso independiente del repositorio del modelo; los resultados no son reproducibles sin solicitarlo.
- **Licencia con condiciones**: no es Apache-2.0 pura. Los componentes Gemma imponen las restricciones de la sección 3.2 y las limitaciones de uso referenciadas en `NOTICE`, lo que afecta al uso comercial y a la redistribución.
- **Idioma**: metadatos en `zh` y `en`; la instrucción de entrenamiento está en inglés y no hay evidencia de soporte multilingüe real.
- **Riesgo de alucinación de acciones**: como todo modelo generativo de trayectorias, puede producir movimientos plausibles pero inseguros ante observaciones fuera de distribución; es obligatorio verificar límites articulares, colisiones y secuenciación de control antes de operar hardware.
- **Compatibilidad de ecosistema**: no se carga con `AutoModel.from_pretrained`, ni con las clases de política PyTorch de LeRobot, ni con servidores de inferencia estándar de LLM.
- **Estado de publicación**: si no existe `READY.json` en el repositorio, la subida no está completa ni verificada y los pesos no deben usarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hw-arm-towel/pi05-encos-fold-towel-93
- Aviso de licencia y modificaciones (NOTICE): https://huggingface.co/hw-arm-towel/pi05-encos-fold-towel-93/blob/main/NOTICE
- Términos de Gemma (LICENSE_GEMMA.txt): https://huggingface.co/hw-arm-towel/pi05-encos-fold-towel-93/blob/main/LICENSE_GEMMA.txt
- Configuración de entrenamiento: https://huggingface.co/hw-arm-towel/pi05-encos-fold-towel-93/blob/main/training_config.json
- Comparación de checkpoints: https://huggingface.co/hw-arm-towel/pi05-encos-fold-towel-93/blob/main/evaluation/checkpoint_comparison.json
- Dataset de entrenamiento (acceso independiente): https://huggingface.co/datasets/hw-arm-towel/fold-towel-93
- Repositorio base SANE: https://github.com/Linux-2023/SANE
- Repositorio upstream openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi

Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces encontrados correspondían a utilidades de monitorización de hardware (CPUID HWMonitor, HWiNFO) y se han descartado por no ser pertinentes.
