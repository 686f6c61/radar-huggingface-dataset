# HanLinqi/GR00T-N1.7-ForceBenchmark-NoForce-8Tasks-Obs2-H10-30K-20260927

## Resumen

Este repositorio contiene ocho checkpoints independientes de robótica publicados por el usuario HanLinqi, cada uno entrenado durante 30.000 pasos sobre el modelo base nvidia/GR00T-N1.7-3B. No se trata de un modelo único y generalista, sino de un paquete de ocho políticas especializadas, una por tarea, almacenadas en subcarpetas del tipo `<tarea>/checkpoint-30000/`. El conjunto forma parte de lo que el autor denomina ForceBenchmark, en su variante "NoForce", es decir, sin tokens de fuerza como entrada.

La relevancia de esta publicación es principalmente experimental y de reproducibilidad: el autor documenta de forma explícita la configuración de entrenamiento (dos pasos de observación de imagen y estado, horizonte de acción 10, batch global de 32) y advierte que no se implica ningún resultado de evaluación. Esto lo convierte en material útil para comparar configuraciones dentro del ecosistema GR00T, pero no en un artefacto listo para producción.

El tamaño del repositorio es de 55,6 GB, lo que repartido entre los ocho checkpoints supone aproximadamente 7 GB por carpeta, coherente con pesos de un modelo de unos 3.000 millones de parámetros (el sufijo "3B" del nombre) más procesador, estadísticas y configuración de experimento. El repositorio registra 0 descargas y 1 like, y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de robótica nvidia/GR00T-N1.7-3B; el autor no detalla la arquitectura interna en la model card) |
| Parametros totales | no disponible de forma explícita; el nombre del modelo base indica 3B (unos 3.000 millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio robótico; las instrucciones de tarea se nombran en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base nvidia/GR00T-N1.7-3B, por lo que no es posible detallar aquí si emplea un transformer convencional, una arquitectura de doble sistema u otra variante. Lo que sí documenta el autor es la receta de ajuste fino aplicada sobre ese base: entrenamiento "model-only" (sin entrenar componentes adicionales más allá del modelo), ausencia de tokens de fuerza, dos pasos de observación combinando imagen y estado, horizonte de acción de 10 pasos y batch global de 32. Todos los checkpoints corresponden al paso 30.000.

Se han publicado ocho ejecuciones independientes, una por tarea, definidas como `lift` (LiftCanUpright v3), `stamp` (Stamp v3), `peg` (PegInsertion v7), `pickcube` (PickCube v2, que además utiliza el dataset de RL), `whiteboardv9` (WhiteboardErasing v9), `usb` (USBInsertion v4), `vasev6` (VaseErasing v6) y `weightsorting` (WeightSorting v1). Cada carpeta de checkpoint incluye el modelo, el procesador, las estadísticas y la configuración del experimento, lo que facilita reproducir la inferencia sin depender de artefactos externos. No se menciona el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá de la variante sin fuerza.

## Capacidades

- Generación de acciones de manipulación robótica: cada checkpoint produce secuencias de acción con horizonte de 10 pasos a partir de observaciones visuales y de estado.
- Políticas especializadas por tarea: levantar un objeto en vertical (`lift`), estampar (`stamp`), insertar una clavija (`peg`), recoger un cubo (`pickcube`), borrar una pizarra (`whiteboardv9`), insertar un USB (`usb`), borrar un jarrón (`vasev6`) y clasificar pesos (`weightsorting`).
- Condicionamiento multimodal de entrada: consume imagen y estado del robot en una ventana de dos pasos de observación.
- Modo sin fuerza: las ejecuciones excluyen tokens de fuerza, por lo que el modelo no aprovecha señal de par o contacto si el entorno la proporciona.
- Tool calling / function calling: no disponible; no es una capacidad declarada ni esperable en un modelo de política robótica.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: no disponibles; no se documenta procesamiento de lenguaje natural.
- Capacidades especiales (modo thinking, visión, audio): visión como entrada de observación; no se documentan otras.

## Casos de uso

- Manipulación de objetos en vertical: la política `lift` (LiftCanUpright v3) puede emplearse para levantar un objeto y colocarlo de pie, una tarea habitual en líneas de ensamblaje donde la orientación inicial es aleatoria.
- Procesos de estampado: el checkpoint `stamp` (Stamp v3) sirve para aplicar un sello o marca sobre una superficie con posicionamiento controlado, útil en validación de celdas robotizadas.
- Inserción de precisión con clavija: `peg` (PegInsertion v7) es adecuado para tareas de ensamblaje que requieren alineación fina entre pieza y orificio.
- Recogida de cubos con datos de RL: `pickcube` (PickCube v2) permite estudiar el efecto de entrenar sobre un dataset generado por aprendizaje por refuerzo en lugar de demostraciones, útil como caso de comparación metodológica.
- Borrado de pizarras: `whiteboardv9` (WhiteboardErasing v9) cubre tareas de limpieza y borrado de superficies, aplicable a entornos de mantenimiento automatizado.
- Inserción de conectores USB: `usb` (USBInsertion v4) aborda una inserción con tolerancias muy estrechas, representativa de tareas de conexión de periféricos.
- Borrado de recipientes frágiles: `vasev6` (VaseErasing v6) se orienta a manipulación delicada sobre objetos potencialmente quebradizos.
- Clasificación por peso: `weightsorting` (WeightSorting v1) permite separar piezas u objetos según su masa, un caso clásico en control de calidad y logística interna.
- Reproducción de experimentos: al incluir modelo, procesador, estadísticas y configuración por tarea, los checkpoints permiten replicar resultados de ForceBenchmark en su variante sin fuerza y comparar contra variantes con tokens de fuerza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explícita que "no se implica ningún resultado de evaluación", por lo que no existen cifras de éxito por tarea, tasas de inserción, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, un modelo de ~3B parámetros en bf16 ocupa alrededor de 6-7 GB solo en pesos, lo que encaja con el tamaño observado de cada checkpoint (~7 GB de las 55,6 GB totales entre ocho carpetas).
- GPU recomendadas: no disponibles en la documentación. Por tamaño, una GPU con 16-24 GB de VRAM debería ser suficiente para cargar un checkpoint individual en precisión de 16 bits, aunque el requisito real depende de la resolución de imagen, el número de cámaras y el runtime de GR00T.
- GPU de consumo: previsiblemente sí para un único checkpoint, en tarjetas como RTX 4090 (24 GB) o RTX 3090 (24 GB), siempre que el pipeline de inferencia robotica no requiera memoria adicional significativa. No confirmado por el autor.
- Opciones de despliegue: no se especifican. Los pesos están en safetensors, por lo que son cargables con PyTorch; el stack de referencia para la familia GR00T es el proporcionado por NVIDIA (no detallado en la model card). vLLM, llama.cpp, Ollama o TGI no son aplicables a un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Resultados |
|---|---|---|---|---|---|
| HanLinqi/GR00T-N1.7-ForceBenchmark-NoForce-8Tasks (este) | ~3B (segun nombre del base) | no disponible | no disponible | 8 checkpoints, 0 descargas, 1 like | sin evaluación publicada |
| nvidia/GR00T-N1.7-3B (modelo base) | ~3B | no disponible | no disponible | modelo base oficial | no disponible |
| Otras políticas VLA de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría. No se han facilitado referencias a modelos como OpenVLA, pi0 u otros, ni cifras comparables.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo legal; conviene contactar con el autor antes de cualquier despliegue.
- Sin resultados de evaluación: la model card advierte que no se implica ningún resultado, por lo que no hay evidencia publicada de tasa de éxito por tarea.
- Ocho políticas separadas, no un modelo generalista: cada checkpoint está especializado en una única tarea y no se documenta su comportamiento fuera de ella.
- Entrenamiento corto: 30.000 pasos con batch global de 32 es un presupuesto de ajuste limitado, lo que puede traducirse en menor robustez ante variaciones de iluminación, posición o dinámica.
- Modo sin fuerza: al excluir tokens de fuerza, el modelo no puede aprovechar información de contacto o par, lo que limita tareas de inserción que dependen de esa señal (por ejemplo, USB o clavija).
- Dependencia del entorno de origen: las tareas proceden de suites concretas (LiftCanUpright v3, Stamp v3, PegInsertion v7, PickCube v2, WhiteboardErasing v9, USBInsertion v4, VaseErasing v6, WeightSorting v1); el rendimiento fuera de esas distribuciones no está caracterizado.
- Riesgo de sobreajuste a la configuración observacional: horizonte 10 y dos pasos de observación son fijos; cambiar estos valores puede degradar el comportamiento.
- Idiomas e instrucciones: no se documenta soporte lingüístico; las tareas se identifican en inglés.
- Sin información sobre sesgos: no hay documentación sobre sesgos de política, seguridad física ni modos de fallo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HanLinqi/GR00T-N1.7-ForceBenchmark-NoForce-8Tasks-Obs2-H10-30K-20260927
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
