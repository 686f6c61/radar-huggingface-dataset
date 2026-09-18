# LuckyBirdy123/tartanimu-early-conditioning

## Resumen

TartanIMU early-conditioned velocity estimator es un artefacto de investigacion publicado por LuckyBirdy123 para el IROS 2026 IMU Odometry Challenge. Se trata de una red neuronal temporal de 1.742.920 parametros que estima la velocidad media en el marco del cuerpo (body-frame) a partir exclusivamente de IMU cruda: aceleracion y velocidad angular. No procesa lenguaje ni imagenes, por lo que no es un modelo de uso general sino un componente de odometria inercial.

El modelo es un unico conjunto de pesos compartido entre todas las plataformas del reto: no hay identificador de plataforma, ni pose, ni velocidad de referencia, ni enrutado por modelo. La prediccion se realiza sobre cinco ventanas de un segundo (200 muestras cada una a 200 Hz) y utiliza dos segundos de contexto futuro. Su relevancia actual radica en que demuestra que una red pequena, entrenada con datos propios, puede producir estimaciones de velocidad en unidades SI sin depender de GNSS ni de vision.

La publicacion incluye un contrato de liberacion estricto: hashes SHA256 del fichero de pesos y del manifiesto, un cargador compatible que valida la deserializacion restringida del estado de tensores y una advertencia explicita sobre un helper heredado que usa pickle sin restricciones. El autor califica el artefacto como material de investigacion y no como un sistema de navegacion validado para aplicaciones criticas de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red residual temporal que codifica conjuntamente cinco ventanas, con acondicionador temprano de caracteristicas acotado (early feature conditioner) derivado de la misma entrada de IMU |
| Parametros totales | 1.742.920 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 5 ventanas de 1 s (200 muestras cada una a 200 Hz) mas 2 s de contexto futuro; 1.000 muestras historicas y 400 de futuro |
| Tipos de cuantizacion | no disponible; el cargador compatible exige FP32 nativo |
| Idiomas soportados | no aplica: modelo de odometria inercial; la model card no declara idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`model/model.pt`), acompanado de `model/manifest.json` |

## Arquitectura y entrenamiento

La red es un modelo residual temporal que codifica de forma conjunta cinco ventanas de un segundo y aplica un acondicionador temprano de caracteristicas acotado y derivado de la misma senal de IMU. Las unicas entradas de inferencia son las muestras de aceleracion y velocidad angular con forma `(T, 6)`: aceleracion x/y/z seguida de velocidad angular x/y/z, en unidades SI, con la gravedad retenida y sobre una rejilla temporal de 200 Hz. No se utiliza identificador de plataforma, pose, velocidad de referencia, profesor externo ni enrutado de modelos.

El desarrollo empleo 395 grabaciones de entrenamiento y 80 de validacion, y se selecciono la epoca 23 de una planificacion fija de 25 epocas. El modelo liberado se reentreno desde cero sobre las 475 grabaciones publicadas, recalculando la normalizacion sobre esa poblacion, durante el prefijo de 23 epocas de la planificacion original. No se usaron pesos preentrenados ni datos de entrenamiento externos. La comparacion de desarrollo entre variante temprana y tardia no alcanzo el criterio predeclarado del 2 % para atribuir el efecto al mecanismo, por lo que el autor no reclama causalidad de emplazamiento ni novedad arquitectonica.

## Capacidades

- Prediccion de velocidad media en el marco del cuerpo (body-frame) en m/s a partir de IMU cruda.
- Codificacion conjunta de cinco ventanas temporales de un segundo con dos segundos de contexto futuro.
- Uso de un unico conjunto de pesos y una unica cabeza de velocidad para todas las plataformas del reto, sin enrutado ni identificador de plataforma.
- Inferencia en FP32 con controles de precision deterministas: TF32 y autocast desactivados, lotes de 32, un hilo de CPU y configuracion determinista de cuBLAS.
- Carga en CPU soportada por el cargador; el throughput completo en CPU (89 grabaciones) no fue cualificado.
- Generacion de un fichero de auditoria (`inference-audit.json`) con hashes, arrays accedidos, ajustes y recuentos.
- No dispone de tool calling, function calling, soporte de agentes, capacidades multilingues, vision, audio ni modo de razonamiento; estas categorias no aplican al modelo.

## Casos de uso

- Odometria inercial en robotica movil terrestre: el modelo estima la velocidad body-frame a partir de IMU cruda a 200 Hz, lo que permite disponer de una medida de velocidad continua en robots con ruedas o AGV cuando no hay GNSS disponible.
- Fusion en pipelines de VIO o SLAM: la salida `vx, vy, vz` puede introducirse como factor o medida previa en un grafo de factores, aportando informacion inercial entre actualizaciones visuales.
- Navegacion de vehiculos aereos en entornos sin GNSS: al depender solo de aceleracion y velocidad angular, es aplicable a plataformas donde la vision o el GPS degradan su rendimiento, siempre que la senal cumpla el contrato de entrada (200 Hz, unidades SI, gravedad retenida).
- Analisis biometrico y deportivo con IMU vestible: si los datos respetan la rejilla de 200 Hz y las unidades, el modelo puede producir estimaciones de velocidad para estudios de marcha o movimiento, dado su tamano reducido y su ejecucion en FP32.
- Etiquetado automatico de velocidad sobre archivos IMU autorizados: el script `model/predict_archives.py` recorre raices de trayectorias e indices y genera un CSV `window_id,vx,vy,vz`, util para enriquecer datasets inerciales.
- Verificacion y replicacion de resultados de competicion: la reproduccion completa de las 89 grabaciones se uso como verificacion de implementacion (no como evaluacion retenida), lo que sirve para auditar la cadena de inferencia.
- Despliegue en hardware modesto o embebido: con 1.742.920 parametros en FP32 (aproximadamente 6,65 MiB de pesos) y un pico observado de 117.440.512 bytes de memoria reservada de GPU, es viable en GPUs de gama baja y en portatiles.
- Integracion en pruebas de regresion: el flujo admite un fichero de auditoria con hashes y ajustes, lo que facilita comprobar que una ejecucion en produccion mantiene el mismo contrato numerico.

## Benchmarks y rendimiento

| Resultado | Ambito | Modelo |
|---|---|---|
| 0,25197275 | Modelo de desarrollo seleccionado sobre VAL80 reutilizado (no es la puntuacion retenida del modelo all475) | Epoch 23, 395+80 grabaciones |
| 0,42554 | Modelo all475 enviado, subconjunto publico del leaderboard, observado el 17 de septiembre de 2026 | Reentrenado sobre 475 grabaciones |

La metrica exacta de estas puntuaciones no se detalla en la informacion proporcionada. El autor advierte explicitamente que las puntuaciones no son intercambiables y que la reproduccion completa de las 89 grabaciones sobre el modelo all475 es verificacion de implementacion, no evaluacion retenida.

Datos de rendimiento observados en la reproduccion offline original sobre GPU antigua: 30.644 ventanas de 89 grabaciones procesadas en 47,86 segundos, incluyendo desempaquetado y verificacion (aproximadamente 640 ventanas por segundo, es decir, en torno a 1,56 ms por ventana), con un pico de memoria reservada de GPU de 117.440.512 bytes. La diferencia absoluta maxima respecto al CSV enviado fue de aproximadamente 4,77e-6 con tolerancia absoluta/relativa de 1e-5.

## Requisitos de hardware

- Memoria de GPU: pico observado de 117.440.512 bytes (aproximadamente 112 MiB) durante la reproduccion completa de 89 grabaciones; los pesos en FP32 ocupan alrededor de 6,65 MiB.
- GPUs cualificadas en la informacion: GTX 1080 Ti (cualificacion offline original) y RTX 1000 Ada Generation Laptop GPU (reproduccion completa nativa/standalone). La ruta de GPU de la copia de publicacion no se volvio a ejecutar; solo se verifico con entradas CPU generadas.
- GPU de consumo: si, cabe en cualquier GPU de consumo moderna. La GTX 1080 Ti, ya antigua, se uso en la cualificacion original con este modelo.
- CPU: la carga en CPU esta soportada por el cargador, pero no se cualifico el throughput completo (89 grabaciones) en CPU ni la operacion nativa en Windows.
- Entorno verificado: Linux, Python 3.11.10, PyTorch 2.5.1+cu124, NumPy 1.26.4. `model/requirements.txt` no es un bloqueo completo de entorno ni una garantia para otros dispositivos.
- Opciones de despliegue: `model/predict_archives.py` o `inference.Predictor`, con el digest de manifiesto externo indicado. El helper heredado `base_model.load_checkpoint` no es el cargador soportado y usa deserializacion pickle sin restricciones.
- Ajustes de ejecucion obligatorios: FP32 nativo, TF32 y autocast desactivados, tamano de lote 32, un hilo de CPU, configuracion determinista de cuBLAS (`CUBLAS_WORKSPACE_CONFIG=:4096:8`, `OMP_NUM_THREADS=1`, `MKL_NUM_THREADS=1`, `OPENBLAS_NUM_THREADS=1`). El runtime no cae silenciosamente a CPU si CUDA no esta disponible.
- No aplica: vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. La busqueda web realizada no devolvio alternativas de odometria inercial comparables ni referencias tecnicas relacionadas, y la informacion proporcionada no incluye otros modelos de la misma categoria con los que comparar parametros, contexto, licencia o rendimiento.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica que no es un sistema de navegacion validado para aplicaciones criticas de seguridad.
- Las dos puntuaciones publicadas no son intercambiables: 0,25197275 corresponde al modelo de desarrollo sobre VAL80 reutilizado y 0,42554 al modelo all475 sobre el subconjunto publico del leaderboard.
- La comparacion de desarrollo entre acondicionamiento temprano y tardio no alcanzo el criterio predeclarado del 2 %, por lo que no se atribuye el efecto al mecanismo ni se reclama novedad arquitectonica.
- No se hacen afirmaciones de ranking final ni de funcionamiento en robotica real.
- Sesgos: la model card no documenta analisis de sesgo. Al entrenarse con grabaciones de plataformas concretas y compartir pesos entre todas ellas, el comportamiento fuera de ese dominio (otras IMUs, otras frecuencias, otras monturas) no esta garantizado.
- Riesgo de alucinacion: no aplica, ya que la salida es una regresion numerica de velocidad y no texto generado. Aun asi, la prediccion puede ser erronea o insegura sin aviso.
- Contrato de entrada estricto: solo se leen `imu`, `ts` y `fs` de cada NPZ; las muestras deben ser `(T, 6)`, en unidades SI, con la gravedad retenida y sobre rejilla de 200 Hz. No se deben introducir rotaciones de ejes, eliminacion de gravedad ni conversion de unidades no validadas.
- El indice requiere `window_id,traj_id,win_idx` con identificadores unicos y ventanas de 200 muestras completas; la plantilla debe tener exactamente `window_id,vx,vy,vz`. Los indices de ventana ausentes dividen las rachas contiguas y el contexto nunca cruza grabaciones.
- Seguridad del cargador: el helper `base_model.load_checkpoint` usa deserializacion pickle sin restricciones y nunca debe usarse con checkpoints no confiables. No se deben pasar fixtures generados (`--generated-fixture`) con estos pesos.
- Los hashes son comprobaciones de integridad, no prueba independiente del origen del entrenamiento. No se debe sustituir el digest del manifiesto de la copia de publicacion por el del paquete privado original.
- La salida CSV se escribe antes que su auditoria; una ejecucion interrumpida puede dejar ficheros parciales, que deben conservarse para diagnostico en lugar de sobrescribirse.
- Reproducibilidad limitada: las comparaciones entre dispositivos usaron tolerancia numerica, no igualdad bit a bit; no se cualifico el throughput completo en CPU ni la operacion nativa en Windows.
- Licencia apache-2.0: permite uso comercial con las condiciones habituales de la licencia (atribucion, aviso de cambios y concesion de patentes), pero la model card no ofrece garantia alguna ni soporte. No se distribuyen los datasets: solo se publican los pesos y el codigo de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LuckyBirdy123/tartanimu-early-conditioning
- Documento de publicacion (`PUBLICATION.md`): https://huggingface.co/LuckyBirdy123/tartanimu-early-conditioning/blob/main/PUBLICATION.md
- No se encontraron papers, blogs, repositorios adicionales ni demos en la busqueda web realizada.
