# BAAI/PingPongRealWorldRL

## Resumen

PingPongRealWorldRL es un sistema de despliegue y aprendizaje por refuerzo en linea para un robot de tenis de mesa Unitree H2, publicado por BAAI (Beijing Academy of Artificial Intelligence). No se trata de un modelo de lenguaje, sino de un runtime de robotica compuesto por varios procesos cooperativos: un generador de movimiento CLoSD congelado que produce trayectorias de referencia, una politica de seguimiento tambien congelada que controla el cuerpo del robot, y un aprendiz TD3 opcional que refina siete objetivos articulares del brazo derecho a partir de resultados medidos de la pelota.

El sistema opera en un bucle cerrado a multiples frecuencias: la politica de seguimiento se ejecuta a 50 Hz sobre observaciones de 182 dimensiones para producir 31 acciones articulares, mientras que un puente C++ traduce las ordenes a comandos LowCmd a 1000 Hz. La correccion residual del brazo derecho consume 213 entradas y genera 7 salidas normalizadas. La captura de movimiento OptiTrack alimenta un predictor de pelota via ZMQ, y las puntuaciones medidas de pelota y raqueta cierran episodios que alimentan al aprendiz TD3 en GPU.

Su relevancia radica en que ejemplifica el paradigma de aprendizaje residual en linea sobre hardware real: la politica base y el generador CLoSD permanecen congelados mientras un actor-critico TD3 aprende correcciones sobre el brazo de golpeo. El paquete incluye los pesos ONNX de inferencia, el bundle de runtime CLoSD, el modelo de rebote calibrado y los assets MJCF del robot, todo bajo licencia Apache-2.0 para el codigo original, con la advertencia explicita de que el residuo exportado no esta cualificado para hardware (`hardware_qualified=false`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multi-proceso: politica de seguimiento (red neuronal, 182→31), generador CLoSD, actor residual TD3 (213→7), puente C++ |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportaciones ONNX para inferencia) |
| Idiomas soportados | en (documentacion y codigo) |
| Licencia | Apache-2.0 (codigo original); materiales de terceros sujetos a sus propias licencias |
| Formato de pesos | ONNX (politica base y residuo), PyTorch (.pt para CLoSD runtime), JSON (metadatos y calibracion), MJCF (assets del robot) |

## Arquitectura y entrenamiento

El sistema se organiza en torno a tres componentes de aprendizaje congelados o parcialmente entrenables. La politica de seguimiento base (`h2_stageC_model_10500.onnx`) mapea 182 observaciones a 31 acciones articulares con normalizacion embebida en el grafo ONNX. El generador de movimiento CLoSD (`model_80000.closd-runtime.pt`) produce la referencia de movimiento en CUDA. El actor residual (`h2_stageC10500_online_ball_000010_residual.onnx`) recibe 213 entradas y emite 7 correcciones normalizadas para el brazo derecho, entrenado con TD3 (actor-critico con aprendizaje de politica determinista) usando como senal los resultados medidos de pelota y raqueta.

El flujo de datos combina captura OptiTrack via ROS, un adaptador de mocap, comunicacion ZMQ, un predictor de pelota y un planificador que genera comandos de referencia para CLoSD. El puente C++ (H2BR) actua como interfaz de memoria compartida entre el controlador Python y el hardware, traduciendo a comandos LowCmd a 1000 Hz. La configuracion incluida especifica 100 bolas de calentamiento validas, 200 bolas en linea, tasa de aprendizaje del actor de 1e-6 y 1500 actualizaciones de calentamiento del critico, valores que el autor describe como ajustes experimentales y no como un optimo reclamado. El residuo ONNX exportado proviene de una ejecucion con 100 bolas de calentamiento y 10 bolas en linea; no puede reanudar entrenamiento.

## Capacidades

- Control de robot humanoide Unitree H2 para tenis de mesa mediante politica de seguimiento a 50 Hz.
- Generacion de movimiento de referencia con CLoSD sobre CUDA.
- Aprendizaje por refuerzo en linea con TD3 sobre siete articulaciones del brazo derecho.
- Prediccion de trayectoria de pelota con modelo de rebote calibrado (`real_ball_hybrid_bounce.json`).
- Integracion con captura de movimiento OptiTrack via ROS y ZMQ.
- Simulacion offline en MuJoCo con validacion de preflight y comprobacion de regresion.
- Control de seguridad con arranque manual L1 y parada latcheada R1.
- Ejecucion en modo simulacion, simulacion en vivo y hardware real mediante entry points separados.

## Casos de uso

- Investigacion en robotica de manipulacion deportiva: el sistema permite estudiar el aprendizaje residual en linea sobre un brazo de golpeo real, con la politica base congelada y solo siete grados de libertad ajustables, lo que reduce el espacio de busqueda y acelera la convergencia.
- Validacion de pipelines de RL sim-a-real: el flujo preflight + `run_sim_shm.py` con MuJoCo permite verificar el contrato de observaciones y acciones antes de tocar hardware, reduciendo riesgos de comisionado.
- Desarrollo de predictores de pelota: el modelo de rebote calibrado y el adaptador de mocap sirven como base para experimentos de prediccion de trayectorias con datos reales de OptiTrack.
- Benchmarking de algoritmos actor-critico: la configuracion TD3 con tasas de aprendizaje y calentamientos documentados permite reproducir y comparar variantes de RL en un dominio fisico acotado.
- Docencia en sistemas roboticos multi-proceso: la arquitectura de memoria compartida, ZMQ y puente C++ a 1000 Hz es un caso practico de integracion de control en tiempo real con aprendizaje en Python.
- Prototipado de tenis de mesa robotico: los assets MJCF y la pose de arranque (`frozen_closd_ready_pose_toeout_lowload.npz`) permiten montar una simulacion completa del H2 con raqueta antes de adquirir hardware.
- Estudio de seguridad en robots humanoides: los mecanismos de arranque y parada latcheada, junto con la validacion suspendida de los 31 IDs de motor, sirven como referencia para protocolos de comisionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito, precision de golpeo ni tasas de convergencia, y advierte que el residuo exportado registra `hardware_qualified=false`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.1 GB, pero no se detalla el consumo de memoria de los modelos ONNX ni del bundle CLoSD.
- GPU recomendadas: no disponible; la model card solo indica que CLoSD se ejecuta en CUDA y que el aprendiz TD3 corre en GPU.
- Compatibilidad con GPU de consumo: no confirmada; no se especifican modelos concretos (RTX 4090, A100, H100).
- Opciones de despliegue: runtime propio con entry points `run_real_shm.py`, `run_sim_shm.py`, `run_live_sim_shm.py` y `predictor.py`; simulacion en MuJoCo; puente C++ con ROS 2. No se menciona vLLM, llama.cpp, Ollama ni TGI, que no aplican a este sistema.
- Latencia y throughput: politica de seguimiento a 50 Hz y puente a 1000 Hz; no se publican latencias extremo a extremo ni throughput del aprendiz.
- Requisitos de plataforma: Linux con PyTorch CUDA, entorno ROS y sistema de captura OptiTrack configurado; la validacion de build y runtime en Linux queda pendiente segun la model card.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAAI PingPongRealWorldRL | Runtime de robotica + RL residual TD3 | no disponible | no aplica | Apache-2.0 (codigo) | Pesos ONNX y CLoSD incluidos; residuo no cualificado para hardware |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre sistemas equivalentes de tenis de mesa robotico con aprendizaje residual en linea en la documentacion proporcionada.

## Limitaciones y advertencias

- El residuo ONNX exportado registra `hardware_qualified=false`; no establece rendimiento ni cualificacion para una instalacion nueva.
- El residuo ONNX no puede reanudar entrenamiento; es necesario entrenar desde cero o reanudar un checkpoint propio completo.
- El paquete no incluye el entrenamiento de la politica base, el entrenamiento de CLoSD ni ejecuciones historicas de entrenamiento.
- La suite de regresion completa (`tests/`) no esta incluida en la copia publicada; el comisionado de hardware requiere aceptacion de regresion desde un checkout de desarrollo que coincida con esta release.
- La validacion de build y runtime en Linux queda pendiente segun la model card.
- Las rutas historicas `v1`/`v2` se conservan como referencia, pero sus pesos y arboles upstream no forman parte de esta release.
- La licencia Apache-2.0 cubre solo el codigo original; los modelos de terceros y assets del robot mantienen sus propias licencias.
- Los ajustes de configuracion (100 bolas de calentamiento, 200 en linea, lr 1e-6, 1500 actualizaciones del critico) son experimentales y no un optimo reclamado.
- Riesgo de dano fisico: el sistema controla un humanoide real; se exige comisionado especifico del sitio, verificacion suspendida de los 31 IDs de motor y respeto de los mecanismos L1/R1.
- No se publican sesgos, tasas de alucinacion ni limitaciones de idioma porque no es un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BAAI/PingPongRealWorldRL
- Documentacion de setup: docs/SETUP.md (incluido en el repositorio)
- Puente C++: cpp_lowcmd_bridge/README.md (incluido en el repositorio)
- Configuracion: config.yaml (incluido en el repositorio)
- Politica base: policies/h2/h2_stageC_model_10500.onnx
- Generador CLoSD: closd/H2/model_80000.closd-runtime.pt
- Actor residual: policies/h2/h2_stageC10500_online_ball_000010_residual.onnx y .json
- Assets del robot: assets/robot_description/h2/mjcf/h2_pingpong.xml
- Pose de arranque: ready_pose/H2/frozen_closd_ready_pose_toeout_lowload.npz
- Calibracion de rebote: models/real_ball_hybrid_bounce.json
- Licencia: LICENSE (Apache-2.0)
