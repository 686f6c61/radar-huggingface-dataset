# nvidia/Metatron-v1

## Resumen

Metatron-v1 es una política de control para el robot humanoide Unitree G1 desarrollada por NVIDIA, publicada en Hugging Face bajo la librería ProtoMotions. No es un modelo de lenguaje: es un modelo de aprendizaje por refuerzo (reinforcement learning) que genera objetivos de posición articular (PD targets) y ganancias de control para 29 articulaciones del G1, a partir del estado del robot, su historial y objetivos de movimiento enmascarados. Se distribuye en dos formatos: un checkpoint nativo en PyTorch (459.455.983 bytes) con posterior y estadísticas de normalización, y dos exportaciones ONNX deterministas para navegador (demo de un robot y red por lotes de seis robots para G1 Racer).

La arquitectura es un transformer tipo MaskedMimic con prior y decoder deterministas, entrenado como estudiante unificado en la época 6410 con capacidad SAMP. Una sola política cubre marcha, interacción con escena y recuperación, sin adaptador de recuperación separado. Es relevante porque NVIDIA publica pesos y receta de reconstrucción para investigación en control de humanoides, con integración directa en ProtoMotions (NVlabs) y despliegue en navegador mediante ONNX Runtime Web con WebGPU o WebAssembly.

El modelo está pensado para investigadores y desarrolladores que evalúan locomoción y recuperación de humanoides en simulador o en el G1 real. La licencia es la NVIDIA Open Model License, con código fuente en Apache-2.0 y derechos de dataset y assets separados: el repositorio no redistribuye los clips de movimiento de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MaskedMimic con prior y decoder deterministas (estudiante unificado) |
| Parametros totales | no disponible (checkpoint nativo de 459.455.983 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume 39 entradas de estado, historial, objetivos y contexto de escena) |
| Tipos de cuantizacion | no disponible; inferencia en FP32 |
| Idiomas soportados | en (documentación y model card) |
| Licencia | NVIDIA Open Model License (código fuente Apache-2.0) |
| Formato de pesos | PyTorch nativo (checkpoint), ONNX (demo/model.onnx, racer/network.onnx) |

## Arquitectura y entrenamiento

El modelo es un transformer estudiante de estilo MaskedMimic que aprende una política unificada para el Unitree G1 con 29 articulaciones controladas. La inferencia usa un prior aprendido determinista y un decoder que produce objetivos PD (`action`), ganancias (`stiffness`, `damping`) y `raw_action` para realimentar el historial. El checkpoint nativo conserva la posterior y las estadísticas de normalización; las exportaciones a navegador solo incluyen la ruta prior/decoder, por lo que las interfaces no son intercambiables. La receta nativa enmascara entradas de escena y debe consultarse antes de reexportar.

El entrenamiento corresponde a un estudiante unificado en la época 6410 con capacidad SAMP, que integra marcha, interacción con escena y recuperación en una sola política. No se detallan en la información disponible el número de tokens, la composición del dataset ni el uso de RLHF o DPO, que no aplican a este dominio. La validación publicada es numérica: la red ONNX de seis robots y las rutas de observación compiladas se compararon con la exportación de un robot en 60 estados de prueba perturbados en historial, con un error absoluto máximo de acción de 5,55e-6. Se variaron altura de recuperación, temporización, historial de acciones y entradas de escena, y todos afectaron a las salidas. Son comprobaciones de exportación, no benchmarks de éxito de tarea ni de robot real.

## Capacidades

- Control de locomoción del Unitree G1 con 29 articulaciones mediante objetivos PD y ganancias de rigidez y amortiguación.
- Interacción con escena: consume contexto de cajas de escena (scene-box) y objetivos de pose, estilo y velocidad futuros enmascarados.
- Recuperación integrada: caídas y recuperación de altura se gestionan con la misma política, sin adaptador separado; los objetivos de recuperación son entradas vivas en tiempo de ejecución.
- Historial temporal: usa el estado actual, ocho muestras históricas de estado, acciones brutas entrantes y un historial de nueve acciones brutas.
- Inferencia determinista en FP32 apta para despliegue en navegador con ONNX Runtime Web (WebGPU o WebAssembly) y simulación con MuJoCo WASM.
- Ejecución por lotes de seis robots en una sola pasada con `racer/network.onnx`, con observaciones calculadas fuera del grafo neuronal.
- Integración con ProtoMotions para flujos de simulador y despliegue supervisado en G1 real.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción de humanoides: ejecutar la política nativa en ProtoMotions para estudiar marcha y estabilidad del G1 con objetivos de velocidad y estilo, aprovechando que el checkpoint conserva posterior y normalización para análisis reproducibles.
- Evaluación de recuperación tras caídas: introducir objetivos de recuperación en tiempo de ejecución y variar altura y temporización para medir la robustez de la política unificada, sin cambiar de modelo.
- Demostración interactiva en navegador: desplegar `demo/model.onnx` con ONNX Runtime Web y MuJoCo WASM para que usuarios controlen un G1 simulado en tiempo real, con WebGPU como ruta recomendada y WebAssembly como respaldo.
- Carreras multirrobot: usar `racer/network.onnx` para evaluar seis G1 en un solo lote, con observaciones calculadas por la aplicación y parámetros de controlador del runtime emparejado, útil para comparativas de políticas.
- Validación de exportaciones y paridad numérica: emplear los fixtures de paridad de acción al arranque de G1 Racer y las comprobaciones de 60 estados para verificar que una reexportación o un cambio de runtime no altera las salidas más allá de 5,55e-6.
- Despliegue supervisado en G1 real: usar el paquete nativo G1 con la receta de reconstrucción y el manifiesto de runtime para trasladar la política a hardware, respetando orden de articulaciones, convención de cuaterniones, normalización y tasa de control.
- Docencia y prototipado de control RL: servir como referencia de política MaskedMimic con pesos abiertos para comparar arquitecturas de estudiante y técnicas de destilación en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única métrica publicada es de paridad de exportación: error absoluto máximo de acción de 5,55e-6 entre la red ONNX de seis robots y la exportación de un robot en 60 estados de prueba. No hay datos de éxito de tarea, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint nativo ocupa 459.455.983 bytes y cada ONNX unos 403 MB en FP32, por lo que la huella de pesos ronda los 0,4 GB y el consumo total depende del simulador y del runtime.
- GPU recomendadas: no se especifican modelos concretos; la documentación recomienda WebGPU en dispositivos capaces y advierte de que CPU/WASM es solo respaldo y no garantiza operación en tiempo real con seis robots.
- GPU de consumo: no hay lista oficial; por tamaño de pesos, cualquier GPU con al menos 1-2 GB de VRAM libre debería alojar la red, pero el rendimiento en tiempo real no está garantizado.
- Opciones de despliegue: ONNX Runtime Web (WebGPU o WebAssembly), MuJoCo WASM para física, PyTorch nativo vía ProtoMotions y descargador nativo fijado a una revisión del Hub.
- Latencia y throughput: no disponibles; dependen de drivers de GPU, navegador y hardware, y afectan al tiempo de arranque y al rendimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de control de humanoides comparables con parámetros, contexto y licencia verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas conversacionales; cualquier uso en esos dominios es inadecuado.
- Las exportaciones ONNX no son intercambiables entre sí ni con el checkpoint nativo; mezclar interfaces, órdenes de articulaciones, convenciones de cuaterniones o tasas de control invalida el comportamiento.
- Los archivos ONNX no son demos completas: requieren la aplicación emparejada que aporta física, observaciones, objetivos y lógica de control.
- La compatibilidad con hardware no constituye certificación de seguridad ni prueba de validación en el G1 real para estas exportaciones concretas.
- Riesgo de alucinación no aplica; el riesgo equivalente es un comportamiento de control incorrecto fuera de la distribución de entrenamiento, que puede provocar caídas o movimientos no deseados.
- Sesgos conocidos: no documentados en la información disponible; el comportamiento está condicionado por los clips de movimiento de entrenamiento, que no se redistribuyen.
- Licencia NVIDIA Open Model License para pesos y configuraciones; el código fuente es Apache-2.0; los derechos de dataset y assets son separados y deben verificarse antes de uso comercial.
- El repositorio no incluye clips de movimiento de entrenamiento, código de runtime, assets del robot ni configuración de la aplicación, que se distribuyen por separado.
- No hay resultados publicados de éxito de tarea ni de rendimiento en hardware real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Metatron-v1
- Licencia completa: https://huggingface.co/nvidia/Metatron-v1/blob/main/LICENSE.pdf
- Aviso de atribución: https://huggingface.co/nvidia/Metatron-v1/blob/main/NOTICE.txt
- Model card del paquete nativo G1: https://huggingface.co/nvidia/Metatron-v1/blob/main/G1/MODEL_CARD.md
- Descarga y ejecución del paquete G1: https://huggingface.co/nvidia/Metatron-v1/blob/main/G1/README.md
- Repositorio ProtoMotions: https://github.com/NVlabs/ProtoMotions
- NVIDIA (sitio corporativo): https://www.nvidia.com/en-us/
