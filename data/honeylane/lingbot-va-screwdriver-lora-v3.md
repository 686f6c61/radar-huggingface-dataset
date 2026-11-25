# HoneyLane/lingbot-va-screwdriver-lora-v3

## Resumen

LingBot-VA LoRA v3 es un adaptador LoRA de tipo PEFT para el modelo base `lerobot/lingbot_va_robotwin`, un modelo video-accion construido sobre Wan2.2 5B y orientado a control robotico bimanual. Lo publica el usuario HoneyLane en Hugging Face y esta especializado en una unica tarea: el manejo de un destornillador con dos brazos a partir de 43 demostraciones capturadas con dispositivos UMI de mano. El modelo predice acciones motoras (posicion, orientacion y apertura de pinza por brazo) y, de forma conjunta, fotogramas de video que sirven como representacion latente del estado del entorno.

El interes tecnico no esta en el tamano (el adaptador ocupa 0,1 GB y solo se entrena sobre el modelo base) sino en el formato de acciones: bloques de 16 pasos relativos a la pose del brazo al inicio del bloque, con un escalado especifico (xyz x20, quaternion xyz x10, qw transformado) que se aparta del formato del modelo base. Es un ejemplo representativo del ecosistema LeRobot para politicas de imitacion con modelos generativos de video, y resulta relevante para quienes exploran el ajuste fino de modelos de accion sobre hardware de consumo profesional (se entreno en una RTX PRO 6000).

La informacion publicada es muy limitada: no hay licencia declarada, no se especifican idiomas ni resultados de benchmarks estandar, y los unicos datos de rendimiento son metricas de error de posicion y PSNR de video sobre cuatro episodios de validacion. La model card advierte ademas de que las pruebas en robot real no llegaron a completar un agarre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo video-accion Wan2.2 5B (base: `lerobot/lingbot_va_robotwin`) |
| Parametros totales | no disponible (adaptador de 0,1 GB; el modelo base es de 5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (bloques de accion de 16 pasos; `frame_chunk_size = 2`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `lerobot/lingbot_va_robotwin`, un modelo de video-accion derivado de Wan2.2 5B que genera de forma conjunta fotogramas de video y bloques de acciones. Las acciones se estructuran en bloques de 16 pasos con 16 canales utiles: por cada brazo, posicion xyz, cuaternion (qx, qy, qz, qw) y apertura de pinza, primero el brazo izquierdo y luego el derecho. Cada bloque es relativo a la pose del brazo al inicio del bloque: el desplazamiento xyz es un offset en metros en el marco mundial, la rotacion se expresa como `q_ref^-1 * q` y la pinza es absoluta (1 = abierta). La version v3 anade un escalado sobre estas acciones (xyz x20, quaternion xyz x10, qw transformado como (qw - 1) x10), con normalizador identidad almacenado y una funcion `unscale_actions` incluida en `lingbot_block_rel.py` para revertirlo en inferencia.

El entrenamiento se hizo en dos fases: primero la version v2 (acciones relativas sin escalar) hasta el paso 30.000, y despues 10.000 pasos adicionales con el escalado v3, con tasa de aprendizaje 1e-4 constante con warmup, en una unica RTX PRO 6000 y mediante el script `train_lingbot_rel.py --scaled_actions`. El conjunto de datos son 43 demostraciones UMI de mano de una tarea bimanual con destornillador, con dos camaras ojo de pez en muneca a 800x600 y 30 Hz. En inferencia se usa `frame_chunk_size = 2` y se replanifica cada 16 pasos; el fotograma latente 0 es el de condicionamiento y su bloque de acciones es cero. El servidor de robot empleado se incluye como `lingbot_server.py`.

## Capacidades

- Generacion de acciones motoras bimanuales: prediccion de posicion, orientacion y apertura de pinza para dos brazos en bloques de 16 pasos.
- Prediccion conjunta de video: genera fotogramas futuros del entorno como parte del proceso de difusion video-accion.
- Control reactivo con replanificacion: re-planifica cada 16 pasos con `frame_chunk_size = 2`.
- Ejecucion de una tarea especifica de atornillado con destornillador sobre configuracion bimanual.
- No dispone de tool calling, function calling ni capacidades de agente en el sentido de los LLM.
- No se documentan capacidades multilingues, de vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como referencia de ajuste fino LoRA sobre un modelo video-accion para una tarea manipulativa concreta, con scripts de entrenamiento e inferencia incluidos en el repositorio.
- Reproduccion de experimentos bimanuales: el adaptador y el servidor permiten replicar el pipeline completo (carga de pesos, desescalado de acciones, replanificacion cada 16 pasos) en un montaje de dos brazos tipo YAM.
- Punto de partida para nuevas tareas de atornillado: al ser un adaptador pequeno (0,1 GB) sobre un modelo base comun, se puede reutilizar como inicializacion para tareas de ensamblaje con utillaje similar.
- Evaluacion de formatos de accion relativa: util para estudiar el efecto del escalado de acciones (v2 frente a v3) en la estabilidad del entrenamiento y en el error de seguimiento.
- Benchmark interno de politicas robotico-generativas: sus metricas de error xyz, error de rotacion y PSNR de video a distintos horizontes permiten comparar variantes dentro del mismo montaje.
- Docencia y prototipado en robotica: el tamano reducido del adaptador y el uso de una sola GPU profesional facilitan su inclusion en cursos o laboratorios de robotica de imitacion.

## Benchmarks y rendimiento

Resultados offline publicados en la model card sobre 4 episodios de validacion:

| Metrica | Valor |
|---|---|
| Error xyz al final del bloque, bloques estaticos (izq. / der.) | 2,9 / 2,3 mm |
| Error xyz al final del bloque, bloques en movimiento (izq. / der.) | 25,6 / 29,4 mm |
| Error de rotacion (izq. / der.) | 0,98 / 0,89 grados |
| PSNR de video en horizonte 4 / 16 / 32 | 27,7 / 24,1 / 22,0 dB |
| Error encadenado tras 128 pasos, acciones propias, replanificacion cada 16 (izq. / der.) | 36 / 36 mm |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el adaptador en si ocupa 0,1 GB, pero requiere cargar el modelo base Wan2.2 5B completo.
- GPU de entrenamiento documentada: una RTX PRO 6000 (Blackwell), suficiente para el ajuste fino LoRA descrito.
- Cabe en GPU de consumo: no disponible; el modelo base de 5B con generacion de video probablemente exige VRAM considerable, pero no se aportan cifras.
- Opciones de despliegue: carga mediante `peft` sobre el modelo base; se incluye `lingbot_server.py` como servidor de inferencia en el robot. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA de robotica video-accion) ni datos que permitan una comparacion rigurosa de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Dataset muy reducido: 43 demostraciones con variacion de posicion de objetos de solo 1-3,5 cm; la politica es sensible a la pose inicial y a la colocacion del objeto.
- Subdisparo del movimiento: la ganancia es de aproximadamente 0,5-0,8, con mayor deficit al inicio del movimiento.
- Pruebas en robot real: en un montaje dual YAM el sistema funciono de extremo a extremo pero no completo ningun agarre.
- Error alto en bloques en movimiento (25-30 mm) y error encadenado de 36 mm tras 128 pasos, lo que limita tareas de larga duracion.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no documentados; el modelo no es un LLM y no ofrece capacidades linguisticas.
- Riesgo de sobreajuste a la camara y montaje especificos (fisheye 800x600, 30 Hz, dos brazos).
- El formato de acciones v3 difiere del modelo base; usar las predicciones sin aplicar `unscale_actions` produce resultados incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HoneyLane/lingbot-va-screwdriver-lora-v3
- Modelo base: https://huggingface.co/lerobot/lingbot_va_robotwin
