# mobilint/YOLOv8n-pose

## Resumen

YOLOv8n-pose es la variante "nano" del modelo YOLOv8 de Ultralytics especializada en estimacion de pose (deteccion de keypoints corporales). Detecta personas en una imagen y predice las coordenadas de sus articulaciones, devolviendo un conjunto de puntos clave por instancia. Esta publicacion concreta, firmada por `mobilint`, no contiene los pesos originales en PyTorch, sino una reproduccion compilada y cuantizada del modelo en formato propietario MXQ, destinada al runtime de inferencia `qbruntime` y al compilador `qbcompiler` de Mobilint, orientados a aceleradores hardware NPU (familia Aries-RB).

El interes de esta ficha es distinto al de un modelo generativo: se trata de un artefacto de despliegue. El autor parte del modelo de Ultralytics, lo compila con `qbcompiler 1.3.0` en modo `--inference-scheme all` y publica el binario resultante junto con una evaluacion sobre COCO (5000 muestras) que reporta mAP50-95 de 0,48947 y mAP50 de 0,78544, con una retencion del 98,1 % respecto al modelo de referencia. Es, por tanto, relevante para quien necesite ejecutar estimacion de pose en hardware Mobilint con una precision casi identica a la del YOLOv8n-pose original.

La licencia es AGPL-3.0, heredada de Ultralytics, lo que condiciona fuertemente su uso en productos comerciales cerrados. El repositorio es de tamano minimo (el binario MXQ ocupa 6.343.605 bytes) y no incluye pesos en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo YOLOv8 (deteccion + cabeza de keypoints), compilada a MXQ |
| Parametros totales | no disponible (variante "n" de YOLOv8; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | cuantizacion integrada en la compilacion MXQ (variante declarada "gptq"); no se publican esquemas alternativos |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | MXQv7 (binario propietario de Mobilint); no se distribuyen safetensors ni GGUF |
| Modos de inferencia soportados | `single`, `multi`, `global4`, `global8` |
| Version de compilador | qbcompiler 1.3.0 (imagen `mobilint/qbcompiler:1.3-cuda12.8.1-ubuntu22.04`) |
| Version de runtime | qbruntime 1.5.0 (modo `async`) |
| Tamano del binario | 6.343.605 bytes |
| SHA-256 | `7723a86cbb3299daa809744efc0c574685fda0c1a556e295cbc63aafc780c82f` |
| Modelo base | Ultralytics/YOLOv8 (relacion: quantized) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de YOLOv8n-pose de Ultralytics: una red convolucional tipo CSPDarknet con cuello PAN-FPN y una cabeza de prediccion que, ademas de las cajas delimitadoras y las clases, emite 17 keypoints por persona (formato COCO). El modelo original se entrena con deteccion de objetos y regresion de keypoints combinadas; sin embargo, esta publicacion no documenta el proceso de entrenamiento, el numero de tokens (no aplica) ni la composicion del dataset de entrenamiento, mas alla de que la evaluacion se realiza sobre COCO.

La innovacion tecnica de esta version es el pipeline de compilacion: el modelo se convierte a MXQ mediante `qbcompiler 1.3.0` con `--inference-scheme all`, lo que genera un unico artefacto que soporta los modos `single`, `multi`, `global4` y `global8` (distintas estrategias de reparto de trabajo entre nucleos del acelerador). La variante declarada es "gptq", lo que sugiere una cuantizacion post-entrenamiento con correccion de pesos, aunque el autor no detalla bits, granularidad ni calibracion. El binario se valida con `qbruntime 1.5.0` en modo asincrono.

## Capacidades

- Deteccion de personas en imagen: localiza instancias y devuelve cajas delimitadoras.
- Estimacion de pose: predice 17 keypoints por persona en el formato estandar de COCO.
- Soporte de inferencia por lotes y modos de ejecucion multiple (`single`, `multi`, `global4`, `global8`) en hardware Mobilint.
- Verificacion de integridad mediante SHA-256 y metadatos en `aries-rb/metadata.json`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente perceptivo.
- No dispone de capacidades multilingues, vision-lenguaje, audio ni modo "thinking".

## Casos de uso

- Analisis deportivo automatizado: a partir de fotogramas de video, el modelo extrae las articulaciones de los atletas para calcular angulos, trayectorias y posturas; su tamano nano permite procesar secuencias a alta frecuencia en un acelerador Aries-RB.
- Control de calidad en ergonomia industrial: se coloca una camara en la linea de montaje y el modelo detecta posturas de riesgo (flexion de tronco, elevacion de brazos) en tiempo real sobre el hardware de borde de Mobilint.
- Monitorizacion de aforo y comportamiento en retail: al detectar personas y sus poses, se pueden inferir direcciones de movimiento y evitar aglomeraciones, desplegando el MXQ en un dispositivo empotrado.
- Rehabilitacion y fisioterapia asistida: el modelo sirve para comparar la ejecucion de ejercicios del paciente con una referencia, aprovechando la baja latencia de la inferencia asincrona.
- Anotacion semiautomatica de datasets de pose: se ejecuta el modelo sobre grandes lotes de imagenes para preetiquetar keypoints y reducir el coste de anotacion manual, validando despues con revision humana.
- Seguridad en espacios de trabajo: deteccion de caidas o posturas de colapso mediante la geometria de los keypoints, integrado en un pipeline de alertas sobre video en directo.
- Prototipado en robótica humanoide: estimacion de la pose de un operario para que un brazo robotico ajuste su trayectoria, gracias a los modos de ejecucion multiple del binario MXQ.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre COCO (5000 muestras), inferencia `async` con qbruntime 1.5.0:

| Metrica | Valor |
|---|---|
| mAP50-95 | 0,48947 |
| mAP50 | 0,78544 |
| Retencion de mAP50-95 respecto al modelo base | 98,12 % |
| Muestras evaluadas | 5000 |
| Modo de inferencia medido | `async` (solo el modo evaluado) |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el binario MXQ esta pensado para aceleradores Mobilint (familia Aries-RB), no para GPU generica.
- GPU recomendadas: no aplica en su formato actual; el artefacto requiere el runtime `qbruntime` y el hardware compatible de Mobilint.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; no se distribuyen pesos en formatos ejecutables en CUDA (safetensors, ONNX, GGUF).
- Opciones de despliegue: `qbruntime 1.5.0` sobre hardware Aries-RB; el ecosistema `mblt-vision-python` y `mblt-model-zoo` (version <= 2.12 debe fijar una revision anterior, ya que se elimino el directorio `aries/` legacy).
- Latencia y throughput: no disponibles; el autor no publica mediciones de tiempo por imagen ni FPS.
- Nota de integridad: verificar la descarga con `sha256sum <file>.mxq` y comparar con el digest publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mobilint/YOLOv8n-pose (esta ficha) | no disponible (variante nano) | no aplica | MXQv7 | AGPL-3.0 | Compilado para Aries-RB; mAP50-95 0,489 en COCO |
| Ultralytics YOLOv8n-pose (original) | no disponible (variante nano) | no aplica | PyTorch (.pt), ONNX exportable | AGPL-3.0 | Referencia de la que parte esta compilacion; ejecutable en GPU/CPU convencional |
| YOLOv8s-pose / YOLOv8m-pose (Ultralytics) | no disponible | no aplica | PyTorch, ONNX | AGPL-3.0 | Variantes mayores con mayor precision a costa de mas computo; no compiladas para MXQ |
| MediaPipe Pose (Google) | no disponible | no aplica | TFLite | Apache 2.0 | Alternativa ligera para movil; licencia mas permisiva, ecosistema distinto |

Los datos de parametros y rendimiento de los modelos comparados no se han publicado en la informacion disponible; la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia AGPL-3.0 impone obligaciones de liberacion de codigo si el modelo se ofrece como servicio en red; es incompatible con productos comerciales cerrados sin acuerdo alternativo con Ultralytics.
- El artefacto solo es utilizable con el stack propietario de Mobilint (`qbcompiler`/`qbruntime`); no hay pesos en safetensors, ONNX ni GGUF, lo que impide reutilizarlo en vLLM, llama.cpp, Ollama o TGI.
- Solo se ha evaluado un modo de inferencia (`async`); el rendimiento en `single`, `multi`, `global4` y `global8` no esta documentado.
- La cuantizacion "gptq" declarada no detalla bits ni calibracion, por lo que la perdida de precision en dominios distintos de COCO (poses atipicas, oclusiones severas, imagenes nocturnas) es incierta.
- Riesgo de falsos negativos en escenas con personas muy pequenas, multitudes densas o poses no vistas en el entrenamiento original; el modelo nano prioriza velocidad sobre precision.
- No se documentan sesgos demograficos ni de genero; al heredar el dataset COCO, es probable que presente sesgos de representacion, pero el autor no los analiza.
- El repositorio registra solo 23 descargas y 0 likes, con fecha de actualizacion posterior a la de creacion; conviene validar la reproducibilidad antes de integrarlo en produccion.
- El directorio `aries/` legacy fue eliminado: proyectos que dependan de `mblt-model-zoo <= 2.12` deben fijar una revision anterior para no romper la carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobilint/YOLOv8n-pose
- Repositorio fuente de Ultralytics: https://github.com/ultralytics/ultralytics
- Carpeta arxiv del modelo en Mobilint: https://github.com/mobilint/mblt-model-arxiv/tree/main/models/pose_estimation/YOLOv8n_pose
- Modelo base en Hugging Face: https://huggingface.co/Ultralytics/YOLOv8
- Documentacion de Ultralytics sobre pose estimation: https://docs.ultralytics.com/tasks/pose/
