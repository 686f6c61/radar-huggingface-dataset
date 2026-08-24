# RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2-armvel-30k

## Resumen

El modelo `RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2-armvel-30k` es un fine-tune del modelo fundacional de robótica NVIDIA GR00T-N1.7-3B, especializado en el ensamblaje de una mesa infantil IKEA con un robot humanoide Unitree G1 equipado con pinzas Dex1. Desarrollado por RooibosT, este VLA (vision-language-action) convierte entradas multimodales (imágenes de tres cámaras y lenguaje) en secuencias de acciones de 40 pasos a 30 Hz, incluyendo velocidades articulares de los brazos como parte del estado observado.

El modelo resuelve el problema de control robótico de manipulación de largo horizonte en entornos domésticos, con una precisión notable en tareas de pick-and-place, inserción y rotación de piezas. Su relevancia radica en que es una de las primeras implementaciones abiertas que incorpora velocidades de brazo en el estado, lo que mejora la precisión de ejecución en comparación con modelos que solo usan posiciones. Con 3.144 millones de parámetros, el backbone (LLM y visión) permanece congelado durante el entrenamiento, ajustándose únicamente la cabeza de acción mediante difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en GR00T N1.7-3B, con cabeza de difusión para acciones |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción: 40 pasos a 30 Hz) |
| Tipos de cuantizacion | no disponible (pesos en F32, safetensors) |
| Idiomas soportados | no disponible (el modelo base soporta inglés, no se especifica para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.7-3B` como inicialización, con el backbone (LLM y codificador visual) completamente congelado (`tune_llm=False`, `tune_visual=False`). Solo se entrena la cabeza de acción, que genera acciones mediante un proceso de difusión con 4 pasos de denoising en inferencia. El estado de entrada tiene 60 dimensiones: las 46 del conjunto base más 14 dimensiones de velocidades articulares de ambos brazos (`left_arm_vel` y `right_arm_vel`), insertadas después de `right_arm`. La acción de salida es de 16 dimensiones: 7 relativas para cada brazo, más 2 absolutas para las pinzas.

El entrenamiento se realizó sobre el dataset `carroll511/IKEA_table_assembly` (conversión v2), con un batch efectivo de 64, 30.000 pasos, programación de tasa de aprendizaje coseno con warmup del 5%, y 2 GPUs A100 en DDP. Se usaron tres cámaras: `cam_left_high`, `cam_left_wrist` y `cam_right_wrist`. El checkpoint seleccionado es el `checkpoint-26000`, considerado el mejor de 15 evaluados. La configuración de modalidad está definida en `examples/unitree_g1_dex1_ikea/g1_dex1_ikea_armvel_config.py`.

## Capacidades

- Control de manipulación robótica bimanual: genera comandos de posición relativa para ambos brazos y apertura/cierre absoluto de pinzas.
- Predicción de secuencias de acciones de 40 pasos (horizonte de 1,33 segundos a 30 Hz), adecuado para tareas de ensamblaje de múltiples etapas.
- Integración de velocidades articulares en el estado, lo que mejora la precisión de ejecución en comparación con modelos que solo usan posiciones.
- Entrada multimodal: combina imágenes de tres cámaras (una vista alta y dos de muñeca) con instrucciones en lenguaje natural.
- Razonamiento de tareas de largo horizonte: el modelo puede encadenar sub-tareas como recoger una pata, insertarla en la base y rotarla para apretar.
- No soporta tool calling, agentes conversacionales ni generación de texto general; es un modelo puramente orientado a control robótico.

## Casos de uso

- Ensamblaje automatizado de muebles: el modelo puede guiar a un robot Unitree G1 para montar una mesa infantil desde una posición fija, ejecutando las secuencias de inserción y rotación necesarias. Es adecuado por su precisión de 1,2 grados en los primeros 8 pasos y 10,7 mm de error de posición de muñeca.
- Manipulación pick-and-place en entornos domésticos: gracias a su capacidad de predecir acciones relativas de brazo, puede recoger objetos de una superficie y colocarlos en posiciones determinadas, útil en tareas de organización o limpieza.
- Investigación en aprendizaje por imitación para robótica: al ser un fine-tune abierto con pesos disponibles, sirve como punto de partida para estudiar el efecto de incluir velocidades articulares en el estado de un VLA.
- Desarrollo de sistemas de control en lazo abierto para robots humanoides: el modelo puede integrarse en pipelines que ejecutan trayectorias precalculadas, con compensación de latencia de aproximadamente 8 pasos, como se indica en la documentación.
- Benchmarking de modelos VLA en tareas de ensamblaje: sus métricas de error (MAE de brazo, error de posición de muñeca) permiten comparar objetivamente diferentes arquitecturas o estrategias de entrenamiento.
- Entrenamiento de políticas de robot para entornos simulados: el modelo puede usarse como maestro para generar demostraciones o como política base en simulaciones de Isaac Sim antes de transferir a hardware.

## Benchmarks y rendimiento

El modelo reporta métricas de precisión en lazo abierto sobre el split de validación `_v2_val` (697 ventanas, stride 10, 4 pasos de denoising, semilla fija por ventana). Los resultados del checkpoint-26000 son:

| Metrica | Valor |
|---|---|
| MAE de brazo, pasos 1-8 (grados) | 1,224 |
| MAE de brazo, 40 pasos (grados) | 3,142 |
| Error de posicion de muñeca, pasos 1-8 (mm) | 10,74 |
| Error de posicion de muñeca, 40 pasos (mm) | 20,15 |
| MAE de pinza | 0,2085 |

Desglose por tarea:

| Tarea | n | MAE brazo (grados) | Error EE8 (mm) | MAE pinza |
|---|---|---|---|---|
| Insertar pata en base | 182 | 2,580 | 12,29 | 0,1485 |
| Recoger pata | 180 | 2,706 | 8,26 | 0,1737 |
| Rotar pata para apretar | 335 | 3,681 | 11,23 | 0,2599 |

Comparado con el checkpoint de 20k pasos, este modelo mantiene el mismo error de extremo (EE8) y mejora la pinza un 4,4%, con un +1,5% en el brazo. Frente al baseline sin velocidades a 30k, el brazo mejora un 15,2% y el EE8 un 10,1%. No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, etc.) porque no es un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 3,14 B parámetros en F32 (12,6 GB de pesos). Con cuantización a FP16 o BF16, se necesitan aproximadamente 6-8 GB de VRAM para los pesos, más memoria para activaciones y estados de difusión. Se recomienda al menos 16 GB de VRAM para inferencia cómoda.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente. Para entrenamiento se usaron 2x A100, pero la inferencia es viable en GPUs de consumo de gama alta.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 o 4090 puede ejecutar el modelo sin problemas. No se requiere hardware especializado.
- Opciones de despliegue: al ser un modelo de robótica, no se integra directamente con vLLM u Ollama. Se usa a través del framework Isaac-GR00T de NVIDIA, con scripts de inferencia específicos para Unitree G1. El formato safetensors permite cargarlo con PyTorch estándar.
- Latencia y throughput: no se proporcionan datos de latencia. Dado el horizonte de 40 pasos y 4 pasos de denoising, se estima una inferencia de decenas de milisegundos por ventana en una GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2-armvel-30k | 3,14 B | 40 pasos de accion | VLA para ensamblaje IKEA con velocidades de brazo | Apache 2.0 | Hugging Face |
| RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2 (checkpoint 20k) | 3,14 B | 40 pasos | Mismo fine-tune sin velocidades | Apache 2.0 | Hugging Face |
| NVIDIA/GR00T-N1.7-3B (modelo base) | 3,14 B | no disponible | VLA generalista para humanoides | Apache 2.0 | Hugging Face |

La comparación directa con otros VLA como OpenVLA o RT-2 no es posible porque este modelo está especializado en un robot y tarea concretos, y no se han publicado resultados en benchmarks comunes de manipulación. El modelo base GR00T N1.7 es el punto de referencia natural, y este fine-tune demuestra mejoras significativas al incorporar velocidades articulares.

## Limitaciones y advertencias

- El modelo funciona únicamente en lazo abierto; su comportamiento en lazo cerrado sobre hardware real no ha sido verificado para este checkpoint, lo que implica riesgo de desviación acumulada en ejecuciones largas.
- Requiere velocidades articulares de los brazos como entrada en inferencia. Si se alimentan ceros, el error en la ventana ejecutada aumenta un 26%, quedando por debajo del baseline sin velocidades.
- Los brazos se controlan en modo relativo y las pinzas en modo absoluto; `get_action()` devuelve valores absolutos sin normalizar, lo que exige un postprocesado cuidadoso.
- La cintura (waist) no se comanda; el robot debe mantenerse en una postura fija con pitch de cintura cercano a 10,5 grados (modo mayoritario en los datos), lo que limita la aplicabilidad a otras posturas.
- El modelo está entrenado exclusivamente para la tarea de ensamblaje de la mesa IKEA con el robot Unitree G1 y pinzas Dex1; no generaliza a otros objetos o robots sin fine-tuning adicional.
- No se han evaluado sesgos ni alucinaciones en el sentido lingüístico, pero al ser un modelo de acción, los errores se manifiestan como trayectorias incorrectas o fallos de agarre.
- La licencia Apache 2.0 permite uso comercial, pero el dataset subyacente (`carroll511/IKEA_table_assembly`) puede tener restricciones propias que deben verificarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2-armvel-30k
- Repositorio GitHub de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Paper de GR00T N1: https://arxiv.org/abs/2503.14734
- Pagina de investigacion de NVIDIA sobre GR00T N1: https://research.nvidia.com/labs/lpr/publication/gr00tn1_2025/
