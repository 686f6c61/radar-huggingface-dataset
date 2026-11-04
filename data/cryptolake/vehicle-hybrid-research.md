# cryptolake/vehicle-hybrid-research

## Resumen

Vehicle Hybrid Research v2 es un modelo de deteccion de objetos derivado de YOLO26n, publicado por el usuario cryptolake en HuggingFace bajo el identificador `cryptolake/vehicle-hybrid-research`. Se distribuye en formato ONNX con un unico artefacto de pesos congelados y esta especializado en la deteccion de cuatro clases de vehiculos: coche (`0 car`), autobus (`1 bus`), camion (`2 truck`) y motocicleta (`3 motorcycle`). No contempla la clase furgoneta ni ninguna otra categoria adicional.

El modelo se presenta explicitamente como un artefacto de investigacion, no como un modelo listo para produccion. Segun la model card, forma parte de un experimento de "espacio de pesos" (weight-space research) y su objetivo es servir como material inmutable para un experimento separado denominado Rig Agent. El autor advierte de que este repositorio no sustituye al repositorio ganador (`manako/Detect-Vehicle-winner`) ni establece por si mismo una cualificacion de release para agentes.

La relevancia actual del modelo es limitada y muy acotada: se trata de un derivado de un detector YOLO de tamano n (nano) con entrada fija de 736x736 y salida de 8x11109, pensado para evaluar protocolos de evaluacion y pesos congelados en el contexto de un pipeline de investigacion concreto. No hay informacion publica sobre el conjunto de entrenamiento, el rendimiento, la licencia ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de YOLO26n (detector de objetos tipo YOLO, familia YOLO26) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (deteccion de objetos; etiquetas de clase en ingles) |
| Licencia | no disponible |
| Formato de pesos | ONNX (un unico artefacto congelado) |

Especificaciones adicionales declaradas en la model card:

| Parametro | Valor |
|---|---|
| Entrada | `[1, 3, 736, 736]` (tensor NCHW, RGB) |
| Salida | `[1, 8, 11109]` |
| Clases | `0 car`, `1 bus`, `2 truck`, `3 motorcycle` |
| SHA-256 del ONNX | `3e7149fffd7184fa297efeca7364801655b23d0ebca7a268804f65c9abe86dd9` |
| Adaptador de serving | `manako/Detect-Vehicle-winner`, revision `7e8eb164c36400b32f887ff4ec7f1fd63b66e0ae` |
| SHA-256 del minero | `00396e9494a0cf2e6de8f39bbd99441c4443d9b8d13426689fc0a23057ac7198` |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un detector de objetos de la familia YOLO, descrito por el autor como "stock-YOLO26n-derived", es decir, una variante del modelo nano de YOLO26. La salida `[1, 8, 11109]` es coherente con una cabeza de deteccion tipo YOLO que predice, por cada una de las 11109 anclas o posiciones, cuatro coordenadas de caja mas cuatro puntuaciones de clase (una por cada una de las cuatro clases de vehiculo). La entrada fija de 736x736 pixeles implica que el modelo no es dinamico en resolucion y que cualquier imagen debe redimensionarse a ese tamano antes de la inferencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de aumento de datos, ni sobre si se aplicaron etapas de ajuste fino, destilacion o RLHF (no aplicable en vision). La model card menciona que el adaptador de serving procede de `manako/Detect-Vehicle-winner` y que "no se transfirieron pesos del modelo ganador al hibrido", lo que sugiere que el modelo se construyo combinando componentes o protocolos de evaluacion en lugar de reutilizar directamente los pesos del modelo ganador. El autor tambien advierte de que el adaptador de serving aplica un postprocesado distinto al del evaluador de AP usado en investigacion, lo que puede producir discrepancias entre las metricas de evaluacion y el comportamiento en serving.

## Capacidades

- Deteccion de objetos en imagenes para cuatro clases de vehiculos: coche, autobus, camion y motocicleta.
- Inferencia con entrada fija de 736x736 pixeles y salida tensorial `[1, 8, 11109]`.
- Ejecucion en formato ONNX, compatible con runtimes como ONNX Runtime, OpenVINO o TensorRT.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo "thinking", vision generativa, audio ni otras capacidades multimodales mas alla de la deteccion visual.
- No detecta la clase furgoneta ni clases ajenas a los cuatro tipos de vehiculo declarados.

## Casos de uso

- Investigacion sobre espacios de pesos: el modelo sirve como artefacto congelado para reproducir experimentos de evaluacion de pesos y protocolos de comparacion entre detectores, tal como indica el autor en el repositorio de investigacion asociado.
- Evaluacion de protocolos de postprocesado: al existir una discrepancia documentada entre el postprocesado del adaptador de serving y el del evaluador de AP, el modelo es util para estudiar como afectan distintas estrategias de NMS y umbrales a las metricas finales.
- Benchmarking de detectores ligeros en entornos ONNX: su tamano reducido (derivado de un modelo nano) y su formato ONNX permiten integrarlo en comparativas de latencia y precision frente a otros detectores de vehiculos en CPU o GPU de gama baja.
- Pruebas de integracion de pipelines de vision: util para validar el cableado de un pipeline que recibe imagenes, las redimensiona a 736x736, ejecuta el ONNX y parsea la salida `[1, 8, 11109]` en cajas y clases.
- Analisis de trafico en prototipos academicos: con las cuatro clases disponibles se puede construir un contador de vehiculos por tipo en secuencias de video, siempre que se asuma la ausencia de la clase furgoneta y se valide la precision en el dominio concreto.
- Verificacion de integridad de artefactos: el SHA-256 publicado permite comprobar que el ONNX desplegado coincide exactamente con el artefacto de investigacion, lo que resulta util en entornos de auditoria y reproducibilidad.
- Docencia y experimentacion con YOLO: como ejemplo de modelo derivado de YOLO26n con salida documentada, puede usarse en cursos o talleres sobre deteccion de objetos y despliegue ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mAP, precision, recall ni latencia, y tampoco se proporcionan comparaciones numericas con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al derivar de un modelo YOLO nano con entrada 736x736, la huella esperada es reducida, pero no se ha publicado una cifra verificable.
- GPU recomendadas: no disponible. Por el perfil del modelo (nano, ONNX), es probable que funcione en GPUs consumer modestas, pero el autor no lo documenta.
- Compatibilidad con GPU consumer: no confirmada oficialmente; no se especifican modelos concretos (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: ONNX Runtime como runtime principal; potencialmente OpenVINO, TensorRT o cualquier motor compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Clases | Licencia | Formato |
|---|---|---|---|---|---|
| Vehicle Hybrid Research v2 | no disponible | 736x736 | 4 (car, bus, truck, motorcycle) | no disponible | ONNX |
| YOLO26n (stock) | no disponible en la informacion | no disponible | 80 (COCO) | no disponible en la informacion | no disponible en la informacion |
| `manako/Detect-Vehicle-winner` | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de parametros de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a aspectos estructurales.

## Limitaciones y advertencias

- Modelo de investigacion: el autor indica explicitamente que es un artefacto congelado para un experimento de Rig Agent y que no sustituye al repositorio ganador ni establece cualificacion de release.
- Ausencia de la clase furgoneta: cualquier vehiculo tipo van sera clasificado erroneamente o ignorado, lo que limita su uso en dominios donde las furgonetas son relevantes.
- Discrepancia de postprocesado: el adaptador de serving y el evaluador de AP usan postprocesados distintos, por lo que las metricas de investigacion no reflejan necesariamente el comportamiento en produccion.
- Sin informacion de licencia: no se puede confirmar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue comercial.
- Sin informacion sobre sesgos: no se documenta la composicion del dataset, por lo que se desconocen sesgos de dominio, geografia, iluminacion o tipo de vehiculo.
- Riesgo de alucinacion en sentido figurado: como detector, puede producir falsos positivos y falsos negativos; no se han publicado tasas de error.
- Entrada fija de 736x736: no admite resoluciones dinamicas sin reescalado, lo que puede degradar la deteccion de objetos pequenos o muy grandes.
- Sin soporte de texto ni de agentes: no es adecuado para tareas de razonamiento, dialogo o tool calling.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion futura (2026-11-04) en los metadatos de HuggingFace: conviene verificar la procedencia y la integridad del artefacto antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/cryptolake/vehicle-hybrid-research
- Repositorio de investigacion y procedencia: https://github.com/ManakoLabs/vehicle-weight-space-research
- Repositorio del adaptador de serving: https://huggingface.co/manako/Detect-Vehicle-winner
