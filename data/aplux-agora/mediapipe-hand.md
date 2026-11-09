# APLUX-Agora/MediaPipe-Hand

## Resumen

MediaPipe-Hand es un modelo de deteccion de keypoints (puntos clave) de manos, publicado por APLUX-Agora dentro de su catalogo Agora, orientado a despliegue en placas con SoC Qualcomm. No se trata de un modelo de lenguaje, sino de un modelo de vision por computador para estimacion de pose de manos: recibe una imagen y devuelve keypoints, cajas delimitadoras y una salida JSON. Su relevancia radica en que esta empaquetado como recurso desplegable y verificado placa a placa (QCS6490 y QCS8550) con precisiones cuantizadas W8A16 y W8A8, lo que facilita su integracion en dispositivos AIoT con aceleracion QNN.

El modelo se distribuye como recursos de despliegue derivados de un modelo fuente original (cuyos terminos se remiten a la licencia del modelo original), convertidos y empaquetados bajo la licencia APLUX Model Farm. El repositorio de Hugging Face no contiene pesos en un formato convencional como safetensors o GGUF, sino paquetes por SoC y precision con ficheros `model.bin` y un `model.json` que describe la precision por defecto y las rutas de las variantes. El tamano del repo aparece como 0.0 GB, por lo que no se dispone de datos de tamano real ni de numero de parametros.

La informacion publicada es escasa en cuanto a arquitectura interna y entrenamiento: la model card se centra en el despliegue, las precisiones soportadas y las latencias medidas en hardware Qualcomm. No se indican parametros, contexto, idiomas ni benchmarks de precision del modelo. Por tanto, esta ficha recoge lo disponible y marca explicitamente como "no disponible" todo aquello que la informacion proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de deteccion de keypoints, pipeline `keypoint-detection`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | W8A16, W8A8, FP16 (FP16 solo en QCS8550) |
| Idiomas soportados | no disponible (no aplica a la tarea) |
| Licencia | APLUX Model Farm License (`license: other`, `license_name: aplux-model-farm`); modelo fuente sujeto a los terminos del modelo original |
| Formato de pesos | paquetes por SoC y precision con `model.bin` y `model.json` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo (tipo de red, numero de capas, mecanismo de atencion o backbone) ni sobre el proceso de entrenamiento (datos, numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO). La model card unicamente describe la tarea (deteccion de keypoints de mano), las entradas y salidas (`image` como entrada; `keypoints`, `boxes` y `out` en JSON como salidas) y el empaquetado para despliegue.

La innovacion tecnica documentada es de caracter practico y de despliegue: el modelo se distribuye como recursos convertidos y verificados por placa, con soporte de cuantizacion W8A16 y W8A8 (y FP16 en QCS8550), y con un `model.json` que define la precision por defecto y las rutas de las variantes. Se indica que el modelo se ha construido usando el preprocesado y los ejemplos oficiales de Model Farm, y que cada placa ha sido validada. No se detallan tecnicas como decodificacion especulativa ni atencion lineal, que no aplican a este tipo de modelo.

## Capacidades

- Deteccion de keypoints de manos a partir de una imagen de entrada.
- Prediccion de cajas delimitadoras (`boxes`) asociadas a las manos detectadas.
- Salida estructurada en JSON (`out`) ademas de keypoints y cajas.
- Ejecucion en hardware Qualcomm con aceleracion QNN, con variantes cuantizadas W8A16 y W8A8.
- Soporte de FP16 en el SoC QCS8550.
- Despliegue verificado en placas concretas: QCS6490 (Rhino Pi A1) y QCS8550 (Rhino Pi X1).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni multilingues, por tratarse de un modelo especializado de keypoints.

## Casos de uso

- Control por gestos en dispositivos AIoT: el modelo permite detectar la posicion de la mano y sus puntos clave en tiempo real sobre placas Qualcomm, habilitando interfaces sin contacto en paneles, electrodomesticos o equipos industriales. La latencia medida (3,9 ms en QCS8550 y 7,4 ms en QCS6490) lo hace adecuado para interaccion en tiempo real.
- Realidad aumentada y filtros: la deteccion de keypoints y cajas de manos sirve para anclar elementos virtuales a la mano en aplicaciones de RA sobre dispositivos embebidos, usando la variante W8A8 para minimizar consumo.
- Seguimiento de manos en videollamadas y entornos colaborativos: el modelo puede alimentar modulos de seguimiento o desenfoque selectivo en equipos con SoC Qualcomm, ejecutandose localmente sin enviar video a la nube.
- Robotica y teleoperacion: los keypoints de la mano permiten mapear gestos a comandos de un manipulador o a una interfaz de teleoperacion, con la ventaja de ejecutarse en la propia placa del robot.
- Analisis de ergonomia y seguridad laboral: la deteccion de la pose de la mano en imagenes de camara permite estimar posturas y detectar gestos de riesgo en lineas de produccion, desplegando el modelo en el borde.
- Prototipado rapido sin hardware: la plataforma Agora permite probar el modelo en linea (https://mega.aidlux.com/models/mediapipe-hand) antes de adquirir una placa, lo que facilita la evaluacion previa a la integracion.
- Educacion y demos de vision embebida: al incluir preprocesado, postprocesado, runner y proyecto exportado, el modelo sirve como ejemplo reproducible para ensenar despliegue de vision en Qualcomm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (tipo MMLU, HumanEval o GSM8K, no aplicables) en la informacion disponible. La unica metrica publicada es la latencia medida en Agora con la precision por defecto:

| SoC · placa | Precisiones | Latencia medida (precision por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 7,4 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 3,9 ms |

## Requisitos de hardware

- VRAM estimada: no disponible (no se publica el tamano del modelo ni el consumo de memoria).
- Hardware objetivo: SoCs Qualcomm QCS6490 y QCS8550, con aceleracion QNN.
- Placas verificadas: Rhino Pi A1 (QCS6490) y Rhino Pi X1 (QCS8550).
- GPU de escritorio (A100, H100, RTX 4090): no disponible; el modelo esta empaquetado para placas Qualcomm, no para GPU convencionales.
- Despliegue: mediante los recursos de Agora/Model Farm (descarga por `targets/<SoC>/`), con `model.json` para seleccionar precision y variante; no se documentan opciones como vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia: 7,4 ms en QCS6490 y 3,9 ms en QCS8550 con la precision por defecto. Throughput no disponible.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni rendimiento de este modelo, y la informacion proporcionada no incluye modelos comparables. Por tanto, la comparativa se marca como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe-Hand | no disponible | no aplica | 7,4 ms (QCS6490) / 3,9 ms (QCS8550) | APLUX Model Farm | Hugging Face + Agora |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se publican datos sobre sesgos del modelo; al ser un detector de manos, puede verse afectado por sesgos en los datos de entrenamiento originales (no documentados).
- Riesgo de fallo en condiciones de oclusion, iluminacion adversa o manos fuera de encuadre; no se documentan metricas de robustez.
- El modelo esta empaquetado para SoCs Qualcomm concretos (QCS6490 y QCS8550); no se garantiza su funcionamiento en otro hardware sin conversion.
- La licencia APLUX Model Farm condiciona el uso de los recursos convertidos; ademas, el modelo fuente se rige por los terminos del modelo original, que deben revisarse antes de un uso comercial.
- El repositorio aparece con 0 descargas y 0 likes, y el tamano del repo figura como 0.0 GB, lo que sugiere que los pesos podrian no estar publicados en el repositorio o que la informacion esta incompleta; conviene verificar la disponibilidad real de los ficheros antes de integrarlo.
- No se dispone de informacion sobre el modelo fuente original, su version ni sus condiciones, lo que dificulta la trazabilidad para produccion.
- No hay datos de benchmarks de precision; no es posible evaluar la calidad de la deteccion frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/MediaPipe-Hand
- Prueba en linea en Agora: https://mega.aidlux.com/models/mediapipe-hand
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/MediaPipe-Hand/blob/main/LICENSE_MODEL_FARM.pdf
