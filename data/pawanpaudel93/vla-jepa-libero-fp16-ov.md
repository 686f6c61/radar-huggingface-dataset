# pawanpaudel93/vla-jepa-libero-fp16-ov

## Resumen

VLA-JEPA-LIBERO es un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa, desarrollado originalmente por LeRobot (Hugging Face) y aquí redistribuido por pawanpaudel93 como paquete OpenVINO. El modelo toma dos imágenes RGB, un vector de estado y una instrucción de tarea en lenguaje natural, y produce una secuencia de acciones de 7 pasos con 7 grados de libertad. Está afinado específicamente sobre el benchmark LIBERO, un conjunto de tareas de manipulación robotica de referencia.

Esta versión concreta (`vla-jepa-libero-fp16-ov`) es una conversión del checkpoint original a formato OpenVINO, con pesos en fp16 y grafo en float32, pensada para ejecución en CPU y GPU Intel mediante el motor `ov-policy` de Cascadia. El prompt se rellena a 288 tokens para formar un grafo estático, y la normalización de estado y desnormalización de acciones se han fijado como constantes del grafo. El paquete ocupa 4,6 GB.

Su relevancia es práctica: permite desplegar un modelo VLA en hardware Intel consumer (por ejemplo, una GPU integrada Arc 140V) con latencias del orden de 100 ms por llamada y una precisión prácticamente equivalente al checkpoint PyTorch original, eliminando la dependencia de CUDA para experimentación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | prompt rellenado (padded) a 288 tokens en grafo estatico |
| Tipos de cuantizacion | pesos fp16 con grafo float32 (OpenVINO IR) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (paquete `policy_package`); modelo base en formato LeRobot/PyTorch |

## Arquitectura y entrenamiento

El modelo base es `lerobot/VLA-JEPA-LIBERO`, un VLA afinado sobre LIBERO. La informacion disponible no detalla la arquitectura interna (composicion de encoder visual, backbone de lenguaje, cabecera de acciones) ni los datos de entrenamiento, el numero de tokens o si se aplico RLHF/DPO. El nombre sugiere un enfoque basado en JEPA (Joint Embedding Predictive Architecture) combinado con prediccion de acciones, pero esto no se confirma en la documentacion proporcionada.

La innovacion destacable de esta version es la conversion a OpenVINO: grafo estatico con prompt de 288 tokens, estado de entrada de dimension 8, dos imagenes de 3x224x224 en uint8 RGB y salida de acciones de forma [7, 7]. La normalizacion de estado y la desnormalizacion de acciones se incorporan como constantes del grafo, lo que simplifica la integracion en el cliente. El exportador empleado es un borrador de Intel para VLA-JEPA.

## Capacidades

- Control robotico por instruccion en lenguaje natural: genera trayectorias de accion a partir de observaciones visuales y una tarea textual.
- Entrada multimodal: dos vistas de imagen (posiblemente camara de muneca y camara principal) mas estado proprioceptivo de 8 dimensiones.
- Prediccion de acciones de 7 pasos con 7 grados de libertad por paso (salida [7, 7]).
- Ejecucion en CPU y GPU Intel mediante OpenVINO, sin requisito de CUDA.
- Inferencia de grafo estatico optimizada para latencia baja y repetible.
- Capacidades de tool calling, agentes, razonamiento multi-paso general o vision de proposito general: no disponibles en la informacion proporcionada (el modelo esta especializado en control robotico).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Evaluacion de politicas VLA en LIBERO: ejecutar las tareas de `libero_spatial` y comparar resultados con el checkpoint PyTorch, usando la paridad reportada (29/30 en ambos) como referencia de validacion.
- Prototipado robotico en hardware Intel: desplegar el modelo en un mini-PC o portatil con GPU integrada Arc para pruebas de manipulacion sin disponer de GPU NVIDIA.
- Investigacion en aprendizaje por imitacion: usar el paquete como politica de referencia para comparar metodos de entrenamiento o aumento de datos sobre el mismo benchmark.
- Integracion en simuladores de robotica: conectar la salida de acciones [7, 7] a un entorno simulador de manipulacion para ciclos de evaluacion automatizados.
- Desarrollo de pipelines de inferencia de baja latencia: aprovechar los ~100 ms por llamada en Arc 140V para bucles de control a frecuencia moderada en tareas de laboratorio.
- Benchmarking de conversiones OpenVINO: emplear el paquete como caso de estudio de paridad numerica (desviacion maxima de 8,2e-4 frente a PyTorch f32) para validar exportadores propios.
- Educacion y demos: mostrar el funcionamiento de un VLA en hardware asequible dentro de cursos o talleres de robotica.

## Benchmarks y rendimiento

| Benchmark | Este modelo (OpenVINO, Arc 140V, f16) | Referencia PyTorch (CPU, f32) |
|---|---|---|
| LIBERO `libero_spatial` (10 x 3) | 29/30 | 29/30 |
| Desviacion numerica frente a PyTorch f32 | <= 8,2e-4 | referencia |
| Latencia por llamada | ~100 ms | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable dado que el modelo esta especializado en control robotico y no en tareas genericas de lenguaje.

## Requisitos de hardware

- VRAM/memoria: el paquete pesa 4,6 GB; en fp16 la huella de pesos ronda los 2,3 GB, mas activaciones y buffers del grafo estatico (cifra exacta de memoria en ejecucion no disponible).
- GPU recomendadas: Intel Arc 140V (validada, ~100 ms por llamada en f16); otras GPU Intel compatibles con OpenVINO no verificadas en la documentacion.
- CPU: ejecutable en CPU Intel mediante OpenVINO, aunque no se aportan cifras de latencia para ese backend.
- GPU consumer: si, cabe en GPU integrada Intel Arc 140V; no se documenta soporte para GPU NVIDIA o AMD en este paquete.
- Despliegue: motor `ov-policy` de Cascadia (`cascadia run ./vla-jepa-libero-fp16-ov --engine ov-policy --device GPU`). Se requiere una build de Cascadia con este tipo de politica, aun no publicada en release (repositorio labscommunity/cascadia, en revision).
- Latencia y throughput: aproximadamente 100 ms por llamada en Arc 140V con f16; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vla-jepa-libero-fp16-ov (este) | no disponible | prompt 288 tokens | 29/30 en libero_spatial; ~100 ms/llamada en Arc 140V | Apache-2.0 | Hugging Face, requiere build de Cascadia no publicada |
| lerobot/VLA-JEPA-LIBERO (modelo base) | no disponible | no disponible | 29/30 en libero_spatial (PyTorch CPU f32) | Apache-2.0 | Hugging Face |
| Otros VLA para LIBERO (p. ej. OpenVLA, pi0) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de la misma categoria no puede completarse con datos verificados a partir de la informacion proporcionada; se indica "no disponible" para no introducir cifras no contrastadas.

## Limitaciones y advertencias

- Especializado exclusivamente en tareas de manipulacion del benchmark LIBERO; no es un modelo de proposito general y su uso fuera de ese dominio no esta validado.
- El grafo es estatico: el prompt se rellena a 288 tokens y las dimensiones de entrada estan fijas (2 imagenes 3x224x224, estado de 8). Cambiar estas formas requiere reexportar el modelo.
- La normalizacion de estado y la desnormalizacion de acciones son constantes del grafo, por lo que el cliente no puede ajustarlas sin modificar el paquete.
- Dependencia de una build de Cascadia con el motor `ov-policy` que aun no esta en release; la reproducibilidad en produccion es limitada hasta su publicacion.
- Verificacion limitada: solo se reporta `libero_spatial` (10 x 3); no hay evaluacion en otras suites LIBERO ni en escenarios reales.
- No se documentan sesgos, comportamiento ante entradas fuera de distribucion ni riesgos de alucinacion en el dominio robotico; se desaconseja el uso en robots fisicos sin validacion y salvaguardas adicionales.
- Licencia Apache-2.0: permite uso comercial, pero al ser una copia modificada del modelo base conviene conservar avisos y atribucion del checkpoint original.
- Idiomas soportados no declarados; las instrucciones de tarea estan pensadas para el formato de LIBERO.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pawanpaudel93/vla-jepa-libero-fp16-ov
- Modelo base: https://huggingface.co/lerobot/VLA-JEPA-LIBERO
- Revision del modelo base usada: `735d9f692981e286ade093b5046627eda876e5d0`
- Repositorio Cascadia (motor `ov-policy`): https://github.com/labscommunity/cascadia
- OpenVINO: https://github.com/openvinotoolkit/openvino
- Benchmark LIBERO: no disponible en la informacion proporcionada
- Paper de VLA-JEPA: no disponible en la informacion proporcionada
