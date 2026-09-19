# r1ick37/tartanimu-dr-kass

## Resumen

TartanIMU challenge model package (frozen public 0.57121) es un paquete de inferencia publicado en HuggingFace por r1ick37 (equipo Dr.Kass), cuyo autor es Peichen Liu, de la University of Maryland, College Park. No es un modelo de lenguaje: es un modelo de odometria inercial (IMU odometry) que estima velocidad tridimensional (vx, vy, vz) a partir de ventanas de datos de IMU, con una puerta de enrutamiento que selecciona la cabeza correspondiente a la plataforma detectada. El repositorio integra los dos checkpoints congelados, el codigo de inferencia, la configuracion y las licencias necesarias para reproducir una submission de la competicion TartanIMU.

El modelo se basa en una red multi-cabeza compartida (Foundation_Model, con tronco ResNet-LSTM) y una puerta LogReg almacenada por separado, y se distribuye como un candidato congelado denominado stride1_last + 8-yaw. La relevancia de la publicacion es acotada pero util: se trata de un artefacto reproducible con semilla fija (seed=0), ajustes de inferencia bloqueados y un score publico declarado de 0.57121 en la referencia de Kaggle 56233032, ademas de una evaluacion posterior con el servicio oficial de scoring que reporta 0.48244 sobre las 89 trayectorias de test.

El paquete no incluye datos de competicion (hay que obtenerlos con acceso autorizado), el tamano del repositorio figura como 0.0 GB, y no se publican el numero de parametros ni los idiomas soportados, dado que el modelo no procesa texto. La licencia declarada es Apache-2.0, y el codigo de terceros TartanIMU incluido en `third_party/TartanIMU/` se distribuye tambien bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red multi-cabeza compartida Foundation_Model con tronco ResNet-LSTM, mas una puerta LogReg independiente (TAEWrapper) que enruta a la cabeza de plataforma |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | seq_len = 10 ventanas de IMU (regla de inferencia stride1_last) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch en su precision nativa; no se documentan variantes GGUF, INT8 ni similares) |
| Idiomas soportados | no aplica (modelo de odometria inercial; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch .pt (`weights/unified_full_ft.pt` y `weights/tae_gate.pt`) |
| Entrada | Ventanas de IMU por trayectoria, con left-pad `repeat_first_imu_window_left` |
| Salida | Columnas de velocidad `{plataforma}_vx`, `{plataforma}_vy`, `{plataforma}_vz` tras seleccion dura de cabeza |
| Enrutamiento | Estadisticos de IMU a nivel de trayectoria (`stats_from_imu`) mediante LogReg, softmax, `argmax` y seleccion dura de la cabeza |
| TTA | 8 rotaciones de yaw agregadas por media (`n_yaw=8`, `tta_aggregate=mean`) |
| Tamano de batch | `batch_seqs=8` |
| Semilla | 0 |
| Tamano del repositorio | 0.0 GB (segun la ficha de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada por el autor es una unica red multi-cabeza compartida (`Foundation_Model` / ResNet-LSTM multihead), con pesos en `weights/unified_full_ft.pt`. No se trata de cuatro modelos expertos seleccionados por separado, sino de un unico tronco con cabezas por plataforma. Sobre esa base se anade una puerta interna almacenada aparte (`weights/tae_gate.pt`), implementada como una rama LogReg de estadisticos dentro de `TAEWrapper`: la puerta calcula medias de caracteristicas de ventana de IMU a nivel de trayectoria (`stats_from_imu`), aplica `softmax`, toma el `argmax` y produce una unica cadena de plataforma. Las probabilidades blandas son solo diagnosticas. La mezcla de cabezas es una seleccion dura de las columnas `{plat}_vx/vy/vz`, no una combinacion ponderada.

La inferencia emplea contexto stride1_last con `seq_len=10` y left-pad `repeat_first_imu_window_left`, junto con un TTA de 8 rotaciones de yaw agregadas por media y `batch_seqs=8`. El propio autor advierte que el enrutamiento no es completamente en linea ni causal: los estadisticos de IMU de la trayectoria completa alimentan la puerta, mientras que el tronco LSTM y la regla stride1_last solo usan ventanas pasadas. Los pesos de ajuste fino y de la puerta derivan del punto de partida multi-cabeza unificado de TartanIMU mas el entrenamiento de ajuste fino y de la puerta realizado en este proyecto. No se documentan en la informacion disponible el numero de tokens o muestras de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, dado que no aplica a este dominio.

## Capacidades

- Regresion de velocidad tridimensional (vx, vy, vz) a partir de ventanas de IMU.
- Seleccion automatica de plataforma mediante una puerta LogReg con `argmax` sobre estadisticos de trayectoria completos.
- Inferencia con aumento de datos en test (TTA) mediante 8 rotaciones de yaw agregadas por media.
- Procesamiento por lotes de secuencias (`batch_seqs=8`).
- Ejecucion determinista con semilla fija (`seed=0`) y ajustes de inferencia bloqueados.
- Ejecucion tanto en CPU (validada para importacion, `--help` y `load_unified_model`) como en CUDA (usada para regenerar el CSV completo de test).
- Generacion de un CSV de submission reproducible a partir de un arbol de datos con el formato esperado.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso: no aplica.
- No tiene capacidades multilingues: no procesa texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Navegacion sin GNSS en interiores, tuneles y canones urbanos: el modelo estima velocidad tridimensional a partir de ventanas de IMU, lo que permite integrar trayectorias donde la senal satelital no esta disponible o es degradada.
- Odometria para robots moviles y AGV en almacenes: al consumir unicamente IMU, el modelo sirve como fuente de dead reckoning complementaria a la odometria de ruedas o al SLAM laser.
- Reproduccion de resultados de la competicion TartanIMU: el paquete incluye codigo, configuracion y pesos congelados con semilla fija, por lo que permite regenerar el CSV de submission y verificar el SHA256 del fichero congelado y el MD5 del CSV evaluado.
- Evaluacion comparativa interna de arquitecturas de odometria inercial: al fijar `stride1_last`, `n_yaw=8` y `tta_aggregate=mean`, sirve como linea base reproducible frente a variantes propias.
- Estimacion de trayectoria en dispositivos ponibles y sistemas de seguimiento de actividad, siempre que las plataformas objetivo esten cubiertas por las cabezas del gate.
- Sistemas de realidad aumentada y seguimiento inercial: la salida de velocidad puede integrarse para mantener el seguimiento de pose cuando la camara o el GNSS no son fiables.
- Enrutamiento multimodal dentro de un unico checkpoint: al seleccionar de forma dura la cabeza correspondiente a la plataforma estimada, un solo artefacto cubre varias plataformas sin necesidad de desplegar un modelo por plataforma.
- Validacion en pipelines de integracion: la carga del modelo en CPU permite ejecutar pruebas de humo en CI sin GPU, mientras que la regeneracion completa del CSV de test se realizo con CUDA.

## Benchmarks y rendimiento

| Evaluacion | Conjunto | Metrica | Valor |
|---|---|---|---|
| Public score de Kaggle (ref. 56233032) | Test publico | score (menor es mejor) | 0.57121 |
| Servicio oficial de scoring (2026-09-19) | 89 trayectorias de test | score | 0.48244 |
| Servicio oficial de scoring (2026-09-19) | 89 trayectorias de test | macro AVE | 0.41856 m/s |
| Servicio oficial de scoring (2026-09-19) | 89 trayectorias de test | ATE20 | 1.09883 m |
| Servicio oficial de scoring (2026-09-19) | 89 trayectorias de test | RTE a 5 s | 1.72725 m |
| Validacion interna (reuso de seleccion ronda 3) | Val | stride1_last | 0.371039 |
| Holdout de entrenamiento (early-stop, no pristino) | Train holdout | stride1_last | 0.223452 |

El autor indica explicitamente que el score publico no deriva de validacion ni holdout locales, y que las cifras de validacion son solo de seleccion y confirmacion, no sustitutas del score publico. El CSV congelado tiene SHA256 `50d2d9cc1f09cc5a4d074d0fe9fd14f03aa13ac5af3c5d21ca4487223060b4b5` y el CSV evaluado por el servicio oficial tiene MD5 `b301c8d057a6e05f86b32b2c1a8dc219`. No se reclama ninguna posicion en el leaderboard privado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La informacion proporcionada no incluye cifras de memoria ni de huella del modelo.
- GPU recomendadas: no disponibles. El autor solo indica que la regeneracion completa del CSV de test que produjo 0.57121 se ejecuto con CUDA en un equipo Windows 11.
- Compatibilidad con GPU de consumo: no disponible.
- Ejecucion en CPU: validada para la importacion, la opcion `--help` en subproceso aislado y la carga del modelo con `load_unified_model` en el equipo de empaquetado.
- Entorno observado en la maquina de empaquetado: Windows 11, Python 3.12.9, numpy 2.5.3, pandas 3.0.5, torch 2.6.0+cu124, PyYAML 6.0.3, einops 0.8.2, rich, scikit-learn 1.9.1 y wandb (con `WANDB_MODE=disabled`).
- Linux: no declarado como probado para este paquete, aunque las rutas son portables; se advierte de precauciones por finales de linea y sensibilidad a mayusculas en la verificacion de hashes.
- Opciones de despliegue: script propio `infer.py` con `--data-root`, `--output-csv` y `--device` (`cuda:0` o `cpu`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste de inferencia se multiplica por el TTA de 8 rotaciones de yaw y se procesa en lotes de 8 secuencias, pero no se publican tiempos medidos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye metricas de modelos alternativos de odometria inercial. El unico punto de referencia mencionado es el punto de partida multi-cabeza unificado de TartanIMU, del que derivan los pesos de ajuste fino, pero la ficha no publica sus resultados ni una comparacion cuantitativa con el candidato congelado.

## Limitaciones y advertencias

- El enrutamiento no es causal ni completamente en linea: la puerta usa estadisticos de IMU de la trayectoria completa, por lo que el modelo no es directamente apto para streaming en tiempo real sin adaptar ese paso.
- La mezcla de cabezas es una seleccion dura por `argmax`, no una combinacion ponderada; las probabilidades del `softmax` son solo diagnosticas.
- Existe una discrepancia de alcance entre el score publico de Kaggle (0.57121) y el score del servicio oficial (0.48244) sobre las 89 trayectorias de test; no se reclama posicion en el leaderboard privado.
- Las cifras de validacion (0.371039 en val y 0.223452 en holdout de entrenamiento) proceden de reuso para seleccion y de un holdout no pristino, por lo que no deben presentarse como rendimiento generalizable.
- Los datos de competicion no se incluyen y no deben redistribuirse con el paquete; es necesario obtenerlos mediante el acceso autorizado correspondiente.
- El paquete esta congelado: no se documentan pasos de entrenamiento completos, solo dependencias de importacion de `third_party/TartanIMU/train.py`.
- Se excluyen deliberadamente datos de competicion, secretos, virtualenv, checkpoints experimentales fallidos y volcados amplios del repositorio.
- El soporte en Linux no esta declarado como probado; los hashes pueden verse afectados por finales de linea y por la sensibilidad a mayusculas del sistema de ficheros.
- No se publican numero de parametros, requisitos de VRAM ni cifras de latencia, lo que dificulta el dimensionamiento previo del despliegue.
- Riesgo de sesgo y de alucinacion: no aplica en el sentido de generacion de texto, pero el modelo puede degradarse ante plataformas o condiciones de movimiento no representadas en los datos de entrenamiento.
- La licencia del paquete es Apache-2.0, mientras que el codigo de terceros en `third_party/TartanIMU/` se rige por su propio `LICENSE` y `NOTICE`, tambien Apache-2.0; conviene revisarlos antes de un uso comercial.
- El tamano del repositorio figura como 0.0 GB, mientras que la ficha indica que el archivo ZIP contiene dos checkpoints, codigo de inferencia, configuracion, requisitos y licencias; conviene verificar el digest SHA256 del ZIP antes de extraerlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/r1ick37/tartanimu-dr-kass
- Contacto del autor: rick137@terpmail.umd.edu
- Referencia de Kaggle citada en la model card: `56233032` (no se proporciona URL)
- Paquete descargable: `tartanimu_stride1_last_8yaw_model_package.zip` y su fichero `.sha256`, alojados en el repositorio anterior
- Codigo de terceros incluido en el paquete: `third_party/TartanIMU/`, con `LICENSE` y `NOTICE` propios
- La busqueda web realizada no devolvio enlaces relevantes: los resultados obtenidos son hilos de foro en frances sobre videojuegos y no guardan relacion con este modelo.
