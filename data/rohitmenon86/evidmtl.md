# rohitmenon86/evidmtl

## Resumen

EvidMTL (Evidential Multi-Task Learning) es un conjunto de checkpoints entrenados para la tarea de mapeo semantico de superficies a partir de imagenes RGB monoculares, con estimacion explicita de incertidumbre. Lo desarrolla el grupo HumanoidsBonn (Universidad de Bonn) y se publica como material suplementario del articulo presentado en IROS 2025. El modelo resuelve simultaneamente dos tareas densas de vision por computador: estimacion de profundidad y segmentacion semantica, empleando aprendizaje profundo evidencial para cuantificar la incertidumbre de cada prediccion.

El repositorio de Hugging Face aloja unicamente los pesos entrenados, separados del codigo fuente disponible en GitHub. Se trata de un modelo de investigacion orientado a robotica y percepcion 3D, no de un modelo de lenguaje: no procesa ni genera texto. Su relevancia radica en la combinacion de multi-task learning con incertidumbre calibrada, un aspecto critico para la navegacion segura de robots humanoides y moviles en entornos no estructurados.

La informacion publicada no detalla la arquitectura de red concreta, el numero de parametros ni la longitud de contexto (concepto no aplicable a un modelo de vision de este tipo). El tamano del repositorio es de 2,4 GB, lo que da una idea del orden de magnitud de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de vision multi-tarea para profundidad y segmentacion semantica; detalles en el paper) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | GPL-3.0 |
| Formato de pesos | checkpoints de PyTorch (`.ckpt`, formato Lightning) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de forma explicita. Por el nombre del proyecto y las tareas declaradas (depth-estimation y semantic-segmentation con evidential-deep-learning), se trata de una red convolucional o transformer de vision con cabezas multiples que predice, para cada pixel, la profundidad y la clase semantica junto con parametros de una distribucion evidencial (tipicamente Normal-Inverse-Gamma) que permite derivar incertidumbre aleatorica y epistemica.

El repositorio incluye dos checkpoints con configuraciones de entrenamiento distintas: uno denominado `silog_klmuprior_alpha2_beta0.1_gamma1.0_no_noise_final_model.ckpt`, que usa la media ground-truth directamente como prior en una perdida SiLog mas divergencia KL, y otro `silog_klmuprior_alpha1.01_gamma0.001_betacalc_final_model.ckpt`, que emplea una media ground-truth ruidosa como prior en una perdida puramente KL. El checkpoint final corresponde a la ejecucion de W&B `4slgriz2`, entrenada desde el commit `80e0f76567fcc708fd2c7fca9849fa554d954f53`. No se especifican en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Estimacion de profundidad densa a partir de una unica imagen RGB monocular.
- Segmentacion semantica densa por pixel.
- Cuantificacion de incertidumbre evidencial (aleatorica y epistemica) por prediccion.
- Mapeo semantico de superficies 3D combinando profundidad y etiquetas semanticas.
- Ejecucion multi-tarea en una sola pasada de inferencia.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales fuera de la entrada RGB.

## Casos de uso

- Robotica movil con percepcion 3D: el modelo permite a un robot construir un mapa semantico de superficies a partir de una camara monocular, usando la incertidumbre evidencial para descartar regiones poco fiables antes de planificar trayectorias.
- Navegacion de humanoides en entornos no estructurados: la combinacion de profundidad y segmentacion en una sola pasada reduce la latencia de percepcion y facilita la identificacion de superficies transitables frente a obstaculos.
- Deteccion de zonas de riesgo por baja confianza: al disponer de incertidumbre calibrada, el sistema puede marcar areas donde la prediccion de profundidad es ambigua (superficies reflectantes, texturas repetitivas) y activar sensores alternativos.
- Mapeo semantico para inspeccion industrial: generar mapas 3D etiquetados de instalaciones a partir de video monocular, con indicacion de la fiabilidad de cada region del mapa.
- Investigacion en aprendizaje multi-tarea: los dos checkpoints publicados sirven como linea base reproducible para comparar estrategias de prior y perdidas evidenciales (SiLog+KL frente a KL puro) en tareas densas.
- Prototipado en vision embebida: al no requerir entrada estereo ni LiDAR, el modelo puede integrarse en plataformas con una sola camara y recursos limitados, siempre que se valide el coste computacional en el hardware objetivo.
- Generacion de datos de entrenamiento aumentados: las predicciones de profundidad y segmentacion con incertidumbre pueden emplearse para preetiquetar datasets y priorizar la revision humana en las regiones de alta incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper (arXiv:2503.04441) y al repositorio GitHub para los detalles de evaluacion, pero no incluye cifras de metricas como RMSE de profundidad, mIoU de segmentacion ni calibracion de incertidumbre.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 2,4 GB, lo que sugiere que los pesos en precision completa pueden caber en GPUs de consumo, pero no se confirma el tamano exacto del modelo ni el pico de memoria durante la inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del repositorio es plausible en tarjetas con 8-12 GB de VRAM, pero debe verificarse experimentalmente.
- Opciones de despliegue: los checkpoints estan en formato PyTorch/Lightning (`.ckpt`), por lo que el despliegue requiere cargarlos con PyTorch y el codigo del repositorio `HumanoidsBonn/evidmtl`. No se mencionan exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp u Ollama (herramientas no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de estimacion de profundidad, segmentacion semantica o mapeo semantico con incertidumbre (por ejemplo, variantes de Depth Anything, MiDaS o Segment Anything), ni datos de rendimiento que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de investigacion: los checkpoints se publican como material suplementario de un paper, sin garantias de soporte, mantenimiento ni estabilidad de API.
- Entrada limitada a RGB monocular: no acepta nubes de puntos, profundidad real ni otras modalidades.
- Sin datos publicados sobre sesgos del dataset de entrenamiento; al ser un modelo de percepcion, puede degradarse en condiciones de iluminacion, dominios visuales o geometrias distintas a las del conjunto de entrenamiento.
- Riesgo de predicciones erroneas en superficies ambiguas (reflectantes, transparentes, texturas repetitivas); la incertidumbre evidencial mitiga pero no elimina este riesgo.
- Licencia GPL-3.0: el uso comercial es posible, pero impone obligaciones de copyleft sobre el software derivado que distribuya el modelo o sus modificaciones; conviene revisar la compatibilidad con la politica del producto antes de integrarlo.
- No hay informacion sobre el dataset de entrenamiento, lo que dificulta evaluar la cobertura de dominios y la generalizacion.
- No aplica a tareas de texto, dialogo, codigo ni agentes; cualquier uso en esos ambitos queda fuera del alcance del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/rohitmenon86/evidmtl
- Paper (arXiv): https://arxiv.org/abs/2503.04441
- DOI IROS 2025: https://doi.org/10.1109/IROS60139.2025.11247528
- Repositorio fuente: https://github.com/HumanoidsBonn/evidmtl
- Repositorio del proyecto Evidential Mapping: https://github.com/HumanoidsBonn/evidential_mapping
