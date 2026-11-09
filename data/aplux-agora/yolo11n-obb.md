# APLUX-Agora/YOLO11n-obb

## Resumen

YOLO11n-obb es un modelo de deteccion de objetos con cajas orientadas (oriented bounding boxes, OBB) derivado de la arquitectura YOLO11 en su variante nano, publicado por APLUX-Agora dentro del ecosistema Agora. El modelo esta especializado en deteccion sobre imagenes aereas y de satelite, cubriendo las 15 clases del dataset DOTA (barcos, aviones, tanques de almacenamiento, vehiculos, puentes, puertos, etc.). A diferencia de la deteccion con cajas alineadas a los ejes, las cajas rotadas permiten ajustar objetos con orientacion arbitraria, algo imprescindible en vistas cenitales.

La publicacion no distribuye los pesos originales en formato generico, sino recursos ya convertidos y optimizados para su despliegue en SoCs de Qualcomm. El repositorio incluye paquetes por plataforma (`targets/<SoC>/`) con precisiones cuantizadas (W8A16, W8A8, FP16) y binarios de contexto listos para ejecutarse mediante el runtime QNN de Qualcomm. Esto lo convierte en un artefacto de despliegue edge/AIoT mas que en un checkpoint entrenable.

Su relevancia actual radica en la combinacion de un detector ligero (variante n, pensada para dispositivos con recursos limitados) con soporte nativo para aceleracion NPU en placas comerciales como QCS6490 y QCS8550, con latencias medidas por el propio autor (28,5 ms y 19,3 ms respectivamente). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano reportado de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 variante nano con cabeza de deteccion OBB (cajas orientadas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | W8A16, W8A8 (QCS6490); FP16, W8A16 (QCS8550) |
| Idiomas soportados | no aplica (vision); no disponible en metadatos |
| Licencia | Apache-2.0 para el modelo fuente; APLUX Model Farm License para los recursos convertidos |
| Formato de pesos | binarios de contexto QNN (`model.bin`) organizados por SoC y precision; `model.json` con rutas y precision por defecto |

## Arquitectura y entrenamiento

El modelo se basa en la familia YOLO11 de Ultralytics, en su escala nano, adaptada a deteccion con cajas orientadas. La cabeza OBB predice, ademas de la clase y la confianza, un angulo de rotacion que define la orientacion de cada caja, lo que mejora el ajuste sobre objetos alargados o rotados tipicos de imagenes aereas. La informacion disponible no detalla el numero de parametros, la composicion exacta del dataset de entrenamiento ni si se aplicaron tecnicas de aumento especificas para vista aerea.

No se documenta en la model card el proceso de entrenamiento (tokens, epocas, funcion de perdida, uso de RLHF/DPO —no aplicable en vision—). Si se explicita que el artefacto publicado es una conversion: los pesos fuente se transforman y cuantizan para su ejecucion sobre NPU de Qualcomm mediante QNN, con paquetes separados por SoC y por precision. La innovacion tecnica destacable es, por tanto, la cadena de despliegue (conversion, cuantizacion y empaquetado por plataforma) mas que el entrenamiento en si.

## Capacidades

- Deteccion de objetos con cajas orientadas (OBB) sobre imagenes aereas y de satelite.
- Clasificacion en las 15 clases del dataset DOTA (barcos, aviones, tanques de almacenamiento, vehiculos pequenos y grandes, puentes, puertos, canchas de tenis, piscinas, etc.).
- Entrada de imagen unica y salida de cajas (`boxes`), segun la firma declarada en la model card.
- Ejecucion acelerada en NPU de Qualcomm (QNN) con precisiones cuantizadas W8A16, W8A8 y FP16.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision multimodal, audio ni otras capacidades especiales mas alla de la deteccion visual.

## Casos de uso

- Monitorizacion de puertos y trafico maritimo: deteccion de barcos con orientacion precisa en imagenes de satelite, aprovechando las cajas rotadas para estimar rumbo y dimensiones de embarcaciones en aguas abiertas o atracadas.
- Inspeccion de infraestructura energetica: localizacion de tanques de almacenamiento y otras estructuras cilindricas en plantas industriales, donde la caja orientada reduce el area de solape respecto a una caja alineada a los ejes.
- Vigilancia aeroportuaria: conteo y seguimiento de aviones en pista y plataforma mediante deteccion OBB sobre ortomosaicos o imagenes de dron, con latencias de 19-28 ms que permiten procesamiento en tiempo casi real.
- Analisis urbanistico y de movilidad: deteccion de vehiculos pequenos y grandes en imagenes aereas para estimacion de densidad de trafico o aparcamiento, desplegable en placas QCS6490/QCS8550 embarcadas en drones o estaciones fijas.
- Agricultura de precision y cartografia: identificacion de instalaciones, piscinas, canchas o puentes en levantamientos aereos para actualizacion de mapas y bases de datos geoespaciales.
- Despliegue en borde (edge AIoT): integracion del paquete QNN en dispositivos con NPU Qualcomm para inferencia local sin conexion, util en escenarios con conectividad limitada o requisitos de privacidad de imagen.
- Automatizacion de pipelines de anotacion: preetiquetado de imagenes aereas con cajas orientadas para acelerar el etiquetado humano en proyectos de teledeteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de mAP, precisión o recall sobre DOTA ni sobre otros conjuntos). El unico dato de rendimiento medido es la latencia de inferencia por placa:

| SoC · placa | Precisiones | Latencia medida (precision por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 28,5 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16 | 19,3 ms |

## Requisitos de hardware

- VRAM estimada: no disponible (el modelo se distribuye para NPU de Qualcomm, no como checkpoint PyTorch con requisitos de VRAM documentados).
- GPU recomendadas: no aplica segun la informacion disponible; el destino declarado son SoCs con NPU Qualcomm (QCS6490, QCS8550).
- Compatibilidad con GPU de consumo: no documentada. Al ser una variante nano de YOLO11, es plausible que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: runtime QNN de Qualcomm mediante los paquetes `targets/<SoC>/`; el autor remite a la guia de despliegue de Agora y a la exportacion de proyectos. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 28,5 ms por inferencia en QCS6490 (W8A16/W8A8) y 19,3 ms en QCS8550 (FP16/W8A16), segun mediciones del autor en placas reales. El throughput no se especifica.

## Comparativa con modelos similares

No se dispone de datos de rendimiento (mAP, latencia comparable) de este modelo frente a alternativas, por lo que la comparacion se limita a caracteristicas declaradas:

| Modelo | Tipo | Clases | Licencia | Despliegue |
|---|---|---|---|---|
| YOLO11n-obb (APLUX-Agora) | YOLO11 nano + OBB | 15 (DOTA) | Apache-2.0 (fuente) / APLUX Model Farm (recursos) | Paquetes QNN para QCS6490 y QCS8550 |
| YOLO11n-obb (Ultralytics, original) | YOLO11 nano + OBB | 15 (DOTA) | AGPL-3.0 / licencia comercial Ultralytics | PyTorch, ONNX, TensorRT, etc. |
| YOLOv8n-obb (Ultralytics) | YOLOv8 nano + OBB | 15 (DOTA) | AGPL-3.0 / licencia comercial Ultralytics | PyTorch, ONNX, TensorRT, etc. |
| RT-DETR (variantes ligeras) | Transformer detector | variable | Apache-2.0 | PyTorch, ONNX |

Nota: la fila del modelo original de Ultralytics se incluye como referencia de categoria; los datos de licencia y despliegue de las alternativas no provienen de la informacion proporcionada para este modelo y deben verificarse en sus repositorios.

## Limitaciones y advertencias

- El repositorio no contiene los pesos fuente en formato generico (safetensors, ONNX, etc.), sino binarios de contexto QNN especificos de cada SoC; no es portable a otras plataformas sin reconversion.
- La licencia de los recursos convertidos es la APLUX Model Farm License, distinta de la Apache-2.0 del modelo fuente; es necesario revisar `LICENSE_MODEL_FARM.pdf` antes de un uso comercial.
- No hay informacion sobre sesgos del dataset DOTA ni sobre el rendimiento en dominios distintos de la vista aerea (por ejemplo, imagenes terrestres o de interior).
- Riesgo de falsos positivos y de degradacion en condiciones de baja resolucion, oclusion o cambios de dominio no documentados.
- El modelo esta limitado a las 15 clases de DOTA; no detecta categorias fuera de ese conjunto.
- No se publican metricas de calidad (mAP) que permitan evaluar la idoneidad en produccion.
- El repositorio presenta 0 descargas y 0 likes, y un tamano reportado de 0.0 GB; conviene verificar la integridad de los paquetes con `SHA256SUMS` antes de desplegar.
- No dispone de capacidades de lenguaje, razonamiento ni tool calling; no debe confundirse con un modelo multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/YOLO11n-obb
- Demo online en Agora: https://mega.aidlux.com/models/yolo11n-obb
- Plataforma Agora: https://mega.aidlux.com
- Repositorio Ultralytics YOLO11 (modelo base): https://github.com/ultralytics/ultralytics
- Dataset DOTA (referencia de las 15 clases): https://captain-whu.github.io/DOTA/
