# JcProg/PCBInspect-TextDefect

# Ficha de modelo: JcProg/PCBInspect-TextDefect

## Resumen

PCBInspect-TextDefect es un clasificador binario de imágenes diseñado para detectar defectos de texto en placas de circuito impreso (PCB). Desarrollado por JcProg, forma parte del sistema de inspección óptica automatizada (AOI) SentinelPCB, donde actúa como clasificador específico para los recortes de componentes cuya región ha sido identificada previamente como «Text» (serigrafía). El modelo resuelve un problema concreto en el control de calidad de ensamblaje SMT: determinar si el texto impreso en un componente es correcto («Golden») o si corresponde a una pieza equivocada («WrongPart»).

El modelo se basa en la arquitectura YOLO26n-cls de Ultralytics, una variante de clasificación de tamaño nano, y se distribuye exportado a ONNX (opset 17) para facilitar su integración en sistemas de producción. No se trata de un modelo de lenguaje: no tiene ventana de contexto ni soporte de texto, y su entrada es una imagen RGB de 480×480 píxeles. Su relevancia radica en que ofrece una solución compacta y de código abierto (licencia MIT) para un paso crítico en la inspección automatizada de PCB, aunque su conjunto de entrenamiento es pequeño y las métricas deben interpretarse con cautela.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n-cls (clasificación) de Ultralytics, head de clasificación, fine-tuned en crops de ROI de componentes SMT |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificador de imágenes) |
| Tipos de cuantizacion | no disponible (modelo exportado a ONNX, sin datos de cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |
| Tamaño de entrada | 1×3×480×480 (RGB, NCHW, normalizado /255) |
| Salida | 1×2 logits crudos (aplicar softmax para probabilidades) |
| Clases | Golden, WrongPart |

## Arquitectura y entrenamiento

El modelo es un clasificador de imágenes basado en la arquitectura YOLO26n-cls de Ultralytics, concretamente la variante nano con head de clasificación. Se ha fine-tuneado sobre un conjunto de datos propietario de AOI compuesto por recortes de ROI de componentes SMT. El dataset no es público, pero según la documentación del autor, la división de train/val/test se realizó agrupando por sitio de captura física, de modo que la imagen de referencia de un componente y su captura defectuosa nunca quedan separadas entre conjuntos. Esto evita fugas de información y garantiza una evaluación más realista.

La innovación técnica principal no está en la arquitectura en sí, sino en su papel dentro del router de inspección SentinelPCB: un clasificador de región previo envía cada recorte de ROI a un clasificador de defectos específico de la región, y este modelo se encarga de la región de texto. El modelo se exporta a ONNX sin NMS (no es necesario para clasificación), lo que simplifica el despliegue en entornos de producción con ONNX Runtime. El entrenamiento se realizó con el total de 476 imágenes, el conjunto más pequeño entre los cuatro clasificadores de la familia.

## Capacidades

- Clasificación binaria de imágenes: distingue entre texto de serigrafía correcto («Golden») y texto correspondiente a una pieza equivocada («WrongPart»).
- Inferencia optimizada para CPU mediante ONNX Runtime, con entrada única de imagen RGB de 480×480 píxeles.
- Integración en pipelines de inspección AOI: actúa como clasificador específico para recortes de componentes cuya región es «Text».
- Compatibilidad con el ecosistema de Ultralytics para entrenamiento y exportación.
- Salida en formato de logits crudos, lo que permite aplicar funciones de activación personalizadas (softmax, sigmoid) según las necesidades del usuario.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de visión.

## Casos de uso

- Control de calidad en líneas de ensamblaje SMT: el modelo se integra en un sistema AOI que captura imágenes de cada componente. Cuando el clasificador de región identifica un recorte como «Text», este modelo determina si el texto serigrafiado es el esperado, lo que permite expulsar placas con número de pieza o referencia incorrecta.
- Detección de errores de serigrafía en producción: en fábricas de electrónica, el modelo ayuda a detectar placas en las que se ha imprimido el texto de otro componente, un fallo frecuente en lotes pequeños o en cambios de referencia.
- Inspección automatizada de PCBs en entornos de alta cadencia: gracias a su exportación a ONNX y a su tamaño nano, puede ejecutarse en CPU o en GPUs modestas, reduciendo el coste de hardware en comparación con modelos de mayor tamaño.
- Auditoría de lotes de PCB: se puede utilizar para analizar imágenes de archivo de placas ya producidas y detectar retroactivamente defectos de texto, facilitando la trazabilidad de fallos.
- Investigación en visión por computador aplicada a fabricación: el modelo sirve como referencia o punto de partida para desarrollar clasificadores similares en otros dominios de inspección industrial.
- Composición de un sistema de inspección modular: al ser uno de los cuatro clasificadores del router SentinelPCB, permite construir un sistema completo de detección de defectos combinando los modelos hermanos para regiones de cuerpo, pines y texto.

## Benchmarks y rendimiento

Según la model card del autor, los resultados de validación y test son los siguientes. Se indica expresamente que el test top-1 y macro-F1 son ambos 1.000 con n=97, pero que el conjunto de test es pequeño y con poca diversidad, por lo que debe tratarse con cautela.

**Validación (top-1 1.000, macro-F1 1.000, n=94)**

| clase | precision | recall | f1 | support |
|---|---|---|---|---|
| Golden | 1.000 | 1.000 | 1.000 | 53 |
| WrongPart | 1.000 | 1.000 | 1.000 | 41 |

**Test (top-1 1.000, macro-F1 1.000, n=97)**

| clase | precision | recall | f1 | support |
|---|---|---|---|---|
| Golden | 1.000 | 1.000 | 1.000 | 53 |
| WrongPart | 1.000 | 1.000 | 1.000 | 44 |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware en la información del modelo. No obstante, al tratarse de un modelo nano de clasificación de imágenes con entrada 480×480 y salida de 2 clases, se espera que funcione en CPU o en GPUs de gama baja, con un consumo de VRAM inferior a 1 GB. Las opciones de despliegue recomendadas son ONNX Runtime (CPU o GPU) y el ecosistema de Ultralytics. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

El modelo pertenece a una familia de clasificadores del mismo autor, diseñados para distintas regiones de un componente SMT. No se dispone de información sobre modelos externos comparables.

| Modelo | Tarea | Clases | Métricas | Licencia |
|---|---|---|---|---|
| PCBInspect-TextDefect | Clasificación de defectos de texto | Golden, WrongPart | Test top-1 1.000 (n=97) | MIT |
| PCBInspect-BodyDefect | Clasificación de defectos de cuerpo | no disponible | no disponible | MIT |
| PCBInspect-LeadDefect | Clasificación de defectos de pines | no disponible | no disponible | MIT |
| PCBInspect-Region | Clasificador de región | no disponible | no disponible | MIT |
| PCBInspect-AI | Detector de características estructurales (MountingHole, ComponentBody, SolderJoint, Lead) | no disponible | no disponible | MIT |

## Limitaciones y advertencias

- El conjunto de entrenamiento es el más pequeño de la familia (476 imágenes), lo que incrementa el riesgo de sobreajuste.
- Las métricas perfectas en val y test (1.000) son poco realistas en producción y deben interpretarse con cautela debido al tamaño y la baja diversidad del conjunto de test.
- El modelo solo clasifica defectos de texto; no detecta defectos en el cuerpo, los pines ni otros tipos de fallos.
- Depende de un clasificador de región aguas arriba para recibir únicamente recortes clasificados como «Text». Si el router no funciona correctamente, el modelo puede recibir entradas fuera de su dominio.
- El dataset es propietario y no se ha liberado, lo que limita la reproducibilidad de los resultados y la posibilidad de auditar el entrenamiento.
- Aunque la licencia MIT permite uso comercial, la ausencia del dataset puede dificultar el mantenimiento o la reentrenabilidad del modelo.
- No se han publicado análisis de sesgos; al estar entrenado en un dataset propietario de una región concreta (etiquetado como `region:us`), puede presentar sesgos hacia esa distribución de datos.
- Al ser un modelo de clasificación de imágenes, no es aplicable a tareas de texto, lenguaje o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JcProg/PCBInspect-TextDefect
- Repositorio hermano PCBInspect-Region: https://huggingface.co/JcProg/PCBInspect-Region
- Repositorio hermano PCBInspect-BodyDefect: https://huggingface.co/JcProg/PCBInspect-BodyDefect
- Repositorio hermano PCBInspect-LeadDefect: https://huggingface.co/JcProg/PCBInspect-LeadDefect
- Detector de características estructurales PCBInspect-AI: https://huggingface.co/JcProg/PCBInspect-AI
- Documentación de YOLO26 de Ultralytics: https://docs.ultralytics.com/models/yolo26/
