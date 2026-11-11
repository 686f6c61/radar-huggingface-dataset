# apexlabs-hq/sn44-dirtiness-v23

## Resumen

`apexlabs-hq/sn44-dirtiness-v23` es un detector de objetos en formato ONNX, pensado para ejecutarse de extremo a extremo mediante `onnxruntime` a traves del script `miner.py`. El modelo esta entrenado para identificar cinco clases relacionadas con la suciedad en habitaciones: derrames de liquido, papeleras, basura dispersa, moho y manchas. Se distribuye como un artefacto de inferencia ya exportado, sin pesos en formato de entrenamiento ni model card detallada sobre el proceso de entrenamiento.

El nombre del repositorio sugiere que forma parte de un pipeline de mineria o validacion de la subred 44 (SN44), y el titulo de la model card lo vincula explicitamente al modelo `manako/Detect-room-dirtiness-detection`, del que seria una version derivada o un detector complementario. La informacion publica es muy limitada: no se declaran licencia, idiomas, pipeline ni tamano de los pesos, y el repositorio aparece con 0 GB, lo que impide confirmar la presencia efectiva de los ficheros.

Por su naturaleza, no es un modelo generativo ni un LLM, sino un detector visual basado en una arquitectura tipo YOLO (por la convencion de `imgsz` y los umbrales de confianza por clase). Su relevancia practica esta en el despliegue ligero en CPU o GPU mediante ONNX, con umbrales ya calibrados y supresion de duplicados entre clases semanticamente proximas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos tipo YOLO exportado a ONNX (no confirmado de forma explicita) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (formato ONNX; cuantizacion no declarada) |
| Idiomas soportados | no disponible (modelo de vision; las clases estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX (inferencia via onnxruntime) |

## Arquitectura y entrenamiento

La model card describe un detector ONNX end-to-end servido por `miner.py` con `onnxruntime`. Los parametros operativos declarados son: resolucion de entrada `imgsz: 736`, umbral de confianza global de `0.05` y umbrales por clase de `0.3` para las cinco clases (indices 0 a 4). Ademas, define supresion de duplicados entre pares de clases semanticamente solapadas: `(0, 3, 0.3)`, `(0, 4, 0.3)` y `(3, 4, 0.3)`, es decir, entre derrame de liquido, moho y mancha.

No se proporciona informacion sobre el dataset de entrenamiento, el numero de imagenes, la composicion de clases, si hubo data augmentation, ni el procedimiento de exportacion a ONNX. Tampoco se indica la arquitectura exacta ni el numero de parametros. El unico dato de integridad disponible es el hash SHA-256 de los pesos: `8a37f6987b06fb7f85bcbbbee6f2376b7513f6c0d8665041d9b5f78f20734645`.

## Capacidades

- Deteccion de objetos en imagenes de interiores con cinco clases: derrame de liquido, papelera, basura, moho y mancha.
- Inferencia end-to-end via ONNX Runtime, sin dependencia de frameworks de entrenamiento.
- Umbrales de confianza por clase ya calibrados (0.3) y umbral global de 0.05.
- Supresion de duplicados entre clases proximas (derrame/moho/mancha) para reducir detecciones redundantes.
- Entrada a resolucion 736 px, adecuada para deteccion de manchas y residuos de tamano pequeno.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.

## Casos de uso

- Auditoria de limpieza en alojamientos turisticos: procesar fotos de habitaciones y detectar derrames, moho o basura antes de la entrega de llaves, usando el ONNX con `onnxruntime` en un servicio de validacion por lotes.
- Control de calidad en limpieza profesional: integrar el detector en la app del operario para verificar con una foto que la estancia queda libre de residuos, con umbrales por clase ajustados para evitar falsos positivos en superficies oscuras.
- Mantenimiento preventivo de inmuebles: detectar moho y manchas en paredes o techos a partir de imagenes periodicas, aprovechando la clase de moho y la supresion de duplicados con derrame y mancha.
- Inspeccion en hosteleria y restauracion: revisar mesas, suelos y zonas de paso para detectar derrames de liquido antes de que se conviertan en riesgo de caida.
- Validacion de datasets de vision: usar el modelo como anotador automatico o preetiquetador de imagenes de suciedad, dado que su salida ONNX es facil de integrar en pipelines de etiquetado.
- Despliegue en dispositivos de borde: al ser un ONNX de deteccion, puede ejecutarse en CPU o en GPU de gama baja en un dispositivo local junto a la camara, sin enviar imagenes a la nube.
- Filtrado previo en pipelines de mineria o validacion: al estar servido por `miner.py`, encaja como componente de scoring o verificacion dentro de un flujo de subred.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al no declararse el numero de parametros ni el tamano del fichero ONNX, no puede estimarse con rigor.
- GPU recomendadas: no disponible. Por el formato ONNX y la resolucion de 736 px, es plausible su ejecucion en GPU consumer (RTX 3060 o superior), pero no hay dato confirmado.
- Compatibilidad con GPU consumer: probable pero no confirmada.
- Opciones de despliegue: ONNX Runtime (declarado en la model card mediante `miner.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| apexlabs-hq/sn44-dirtiness-v23 | Detector ONNX | 5 (derrame, papelera, basura, moho, mancha) | 736 px | no disponible | ONNX | Hugging Face |
| manako/Detect-room-dirtiness-detection | Detector (modelo base citado) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| YOLOv8/YOLO11 (Ultralytics) | Detector generico | 80 (COCO) o clases custom | configurable | AGPL-3.0 / comercial | PyTorch, ONNX | Ultralytics |

La comparacion con detectores genericos como la familia YOLO de Ultralytics es la mas directa por arquitectura y formato de despliegue, pero no se dispone de metricas del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Informacion publica muy escasa: sin licencia declarada, sin idiomas, sin pipeline y sin tamano de repo (0 GB), lo que impide confirmar que los pesos esten realmente subidos.
- No se declaran metricas de precision, recall, mAP ni curvas de calibracion; los umbrales de 0.3 por clase no estan justificados en la model card.
- Riesgo de falsos positivos entre clases visualmente proximas (derrame, moho, mancha), mitigado solo parcialmente por la supresion de duplicados declarada.
- Dependencia de una resolucion fija de 736 px; el comportamiento con otras resoluciones o relaciones de aspecto no esta documentado.
- Sin licencia explicita, el uso comercial es juridicamente incierto y requiere contacto con el autor.
- El modelo esta vinculado a un script concreto (`miner.py`) y a un contexto de subred; su reutilizacion fuera de ese pipeline no esta garantizada.
- No apto para tareas de texto, razonamiento ni generacion: es exclusivamente un detector de imagenes.
- Sin informacion sobre sesgos del dataset de entrenamiento (tipos de superficies, iluminacion, geografia).

## Enlaces

- Hugging Face: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v23
- Modelo base citado: https://huggingface.co/manako/Detect-room-dirtiness-detection
