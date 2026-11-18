# apexlabs-hq/sn44-dirtiness-v28

## Resumen

`apexlabs-hq/sn44-dirtiness-v28` es un detector de objetos basado en ONNX, servido mediante `miner.py` con `onnxruntime`, cuyo cometido es identificar cinco clases de suciedad en imagenes de habitaciones: derrames de liquido, papeleras, residuos, moho y manchas. El modelo se presenta como detector para el modelo `manako/Detect-room-dirtiness-detection` y esta empaquetado en un repositorio de Hugging Face sin pesos visibles en la informacion disponible (tamano del repo de 0,0 GB).

La relevancia de esta publicacion es limitada y muy especifica: se trata de un artefacto de inferencia orientado a un pipeline concreto de mineria o validacion, no de un modelo fundacional ni de un modelo de proposito general. No se dispone de informacion sobre arquitectura de red, numero de parametros, datos de entrenamiento ni licencia, lo que restringe seriamente su evaluacion fuera de ese contexto.

Por tanto, esta ficha documenta lo que el autor declara explicitamente (clases, resolucion de entrada, umbrales de confianza y supresion de duplicados) y marca como no disponible todo aquello que la model card no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado a ONNX; ejecutado con onnxruntime) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen de 736 px) |
| Tipos de cuantizacion | no disponible (formato ONNX; no se detalla precision de pesos) |
| Idiomas soportados | no disponible (modelo de vision; las etiquetas de clase estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

Parametros de inferencia declarados por el autor:

| Parametro | Valor |
|---|---|
| Clases | liquid spillage, bin, litter, mould, stain |
| Tamano de entrada (imgsz) | 736 |
| Umbral de confianza global | 0,05 |
| Umbrales por clase | clase 0: 0,3; clase 1: 0,55; clase 2: 0,4; clase 3: 0,3; clase 4: 0,3 |
| Supresion de duplicados entre clases | (0, 3, 0,3), (0, 4, 0,3), (3, 4, 0,3) |
| SHA-256 de pesos | `bbd6962da9830be9cf69cc56918d39c8622e3925751f3b336c9d952a75fdf7fb` |
| Runtime | onnxruntime via `miner.py` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna de la red. La model card unicamente indica que el modelo se distribuye en formato ONNX y que se sirve con `onnxruntime` a traves de un script denominado `miner.py`. El parametro `imgsz: 736` sugiere una entrada cuadrada de 736x736 pixeles, habitual en detectores de una etapa, pero el autor no confirma la familia de arquitectura (YOLO, RT-DETR, Faster R-CNN u otra).

Tampoco hay datos sobre el conjunto de entrenamiento, numero de imagenes, composicion del dataset, augmentaciones, funcion de perdida ni proceso de ajuste fino. La unica informacion derivada del entrenamiento o del post-procesado son los umbrales de confianza por clase y la lista de supresion de duplicados entre clases, que indica que el autor ha calibrado manualmente la salida para evitar solapamientos entre clases visualmente proximas (derrame frente a moho, derrame frente a mancha, moho frente a mancha).

## Capacidades

- Deteccion de objetos en imagenes de interiores con cinco categorias: derrames de liquido, papeleras, residuos, moho y manchas.
- Salida de cajas delimitadoras con puntuacion de confianza por clase, filtradas mediante umbrales especificos por clase.
- Supresion de detecciones duplicadas entre pares de clases con umbral 0,3 para los pares (0,3), (0,4) y (3,4).
- Inferencia via ONNX Runtime, lo que permite despliegue en CPU y GPU sin dependencia de frameworks de entrenamiento.
- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, multilingueismo, vision general, audio ni modo de razonamiento extendido.

## Casos de uso

- Inspeccion automatizada de habitaciones en entornos de alquiler vacacional: el detector recibe una imagen de la estancia y devuelve cajas para derrames, residuos, papeleras, moho y manchas, permitiendo generar un informe de estado antes y despues de cada estancia. Los umbrales por clase (0,55 para papeleras, 0,3-0,4 para el resto) permiten ajustar la sensibilidad segun la tolerancia operativa.
- Verificacion de limpieza en cadenas hoteleras: integrado en un pipeline de captura de imagenes por parte del personal, el modelo marca posibles incidencias no resueltas y prioriza la revision humana sobre las clases con mayor coste reputacional (moho y derrames).
- Control de calidad en empresas de limpieza profesional: el detector se ejecuta sobre fotos de cierre de servicio y genera alertas cuando aparece moho o manchas por encima del umbral, reduciendo la necesidad de revision manual de cada parte.
- Mantenimiento preventivo en instalaciones: la deteccion de moho y derrames de liquido permite activar protocolos de revision de humedades antes de que derive en danos estructurales, con la ventaja de que el modelo corre en ONNX Runtime y puede desplegarse en dispositivos de borde.
- Moderacion de imagenes en plataformas de alquiler entre particulares: el modelo puede filtrar automaticamente fotos de anuncios con residuos o manchas visibles, aplicando el umbral de 0,4 para residuos y 0,3 para manchas.
- Automatizacion de inventario de papeleras y residuos en robots de limpieza: la clase `bin` con umbral 0,55 y la clase `litter` con 0,4 permiten a un robot identificar objetivos de recogida antes de planificar la ruta.
- Etiquetado asistido de datasets de suciedad: las detecciones del modelo, con supresion de duplicados entre clases, pueden usarse como preetiquetado para revision humana en la construccion de nuevos conjuntos de datos del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, precision, recall, F1 ni comparaciones con otros detectores, y el repositorio no contiene informacion adicional evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no conocerse el numero de parametros ni la precision de los pesos ONNX, no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponible. Cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) podria ejecutar el modelo, pero no hay datos para recomendar modelos concretos como A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada. El tamano de entrada de 736x736 y el formato ONNX son compatibles con GPUs de consumo, pero la ausencia de datos de parametros impide garantizarlo.
- Opciones de despliegue: ONNX Runtime a traves de `miner.py`, segun la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica la arquitectura base ni ofrece puntos de comparacion con otros detectores de suciedad o de objetos en interiores, y no se dispone de resultados de rendimiento para establecer una comparacion rigurosa.

| Modelo | Parametros | Contexto / entrada | Licencia | Formato |
|---|---|---|---|---|
| apexlabs-hq/sn44-dirtiness-v28 | no disponible | imagen 736x736 | no disponible | ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se dispone de licencia declarada, por lo que no puede confirmarse el uso comercial ni la redistribucion del modelo o de los pesos.
- El repositorio tiene un tamano de 0,0 GB y cero descargas, lo que sugiere que los pesos podrian no estar publicados o que el artefacto es un puntero a un pipeline externo; conviene verificar la integridad mediante el SHA-256 declarado antes de usarlo.
- El modelo esta disenado para un pipeline concreto (`miner.py`) y depende de umbrales calibrados manualmente; usarlo fuera de ese contexto puede degradar la precision de forma significativa.
- Los umbrales de confianza son muy bajos en varias clases (0,3 para derrames, moho y manchas), lo que puede generar falsos positivos en imagenes con texturas o iluminacion similares.
- No hay informacion sobre sesgos, dominio de entrenamiento ni condiciones de captura (iluminacion, resolucion, angulo), por lo que se desconoce su robustez fuera de las condiciones originales.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de detecciones espurias por el umbral bajo y por la supresion de duplicados entre clases, que puede ocultar detecciones validas cuando dos clases se solapan.
- No se declaran idiomas soportados; las etiquetas de clase estan en ingles y no hay soporte multilingue documentado.
- No hay datos de benchmarks ni de validacion, lo que impide estimar su calidad frente a alternativas y desaconseja su uso en produccion sin una evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v28
- Modelo de referencia citado por el autor: `manako/Detect-room-dirtiness-detection` (no se proporciona URL directa en la informacion disponible)
- Script de servicio: `miner.py` (mencionado en la model card, sin URL disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles
