# Myungkyu/rldx_b2d_all26_tag12_nomask_b128_60k

## Resumen

`rldx_b2d_all26_tag12_nomask_b128_60k` es un checkpoint de ajuste fino del modelo visión-lenguaje-acción (VLA) RLDX-1-PT, desarrollado por el usuario Myungkyu sobre el backbone de RLWRLD. No se trata de un modelo de propósito general, sino de una ablación experimental orientada a robótica de manipulación: el autor parte de RLDX-1-PT y lo reentrena sobre un subconjunto del dataset Bench2Dex (exportación propia en formato LeRobot) para evaluar el efecto de eliminar la máscara de ruido en las dimensiones de relleno de la acción (`action_noise_mask_dim=0`).

El modelo consume tres vistas de cámara (cabeza y muñecas izquierda y derecha), un estado articular de 14 dimensiones y una instrucción de tarea en lenguaje natural, y produce como salida 14 objetivos articulares absolutos con un horizonte de acción de 50 pasos. Emplea una arquitectura de video con longitud 4 y stride 2, y se entrenó con batch 128 durante 60.000 pasos, publicando además checkpoints intermedios en los pasos 15.000, 30.000 y 45.000.

Su relevancia es acotada pero clara para la comunidad de investigación en robótica: sirve como baseline reproducible para estudiar cómo afecta el enmascarado de ruido en el espacio de acciones y el dropout de estado (0,5) al rendimiento de políticas VLA sobre tareas de manipulación diestra. No es un modelo para despliegue conversacional ni de generación de texto, y su licencia no está declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (VLA basada en vídeo; longitud de vídeo 4, stride 2, tres vistas de cámara, horizonte de acción 50) |
| Parámetros totales | 7.032.139.840 (7,03 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrada de instrucción en lenguaje natural, idioma no declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de ajuste | Bench2Dex/teleopdata (exportación LeRobot del autor) |
| Entradas | imágenes de cabeza + muñeca izquierda + muñeca derecha, estado articular de 14 dimensiones, instrucción de tarea |
| Salidas | 14 objetivos articulares absolutos |
| Configuración de entrenamiento | batch 128, 60.000 pasos, `action_noise_mask_dim=0`, `state_dropout=0.5` |
| Código | RLWRLD/RLDX en la rama `myungkyu/jitter-patch` (commit 21f674b4) |
| Tamaño del repositorio | 168,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura RLDX-1-PT, un VLA que procesa secuencias de vídeo (ventana de 4 fotogramas con stride 2) junto con estado proprioceptivo y una instrucción textual, y emite una secuencia de acciones de horizonte 50. La entrada visual combina tres cámaras —cabeza y ambas muñecas—, lo que proporciona información egocéntrica y de agarre simultánea, necesaria para tareas bimanuales de manipulación diestra. El estado se representa como un vector de 14 articulaciones y la salida son posiciones articulares absolutas, no incrementales.

El ajuste fino se realizó sobre el subconjunto `ur5_rh56dfx_3` de Bench2Dex, descrito por el autor como demostraciones de replay-generalization con cuatro vistas y orden articular canónico del registro. La innovación metodológica de esta variante es precisamente una ablación: se desactiva el enmascarado de ruido en las dimensiones de relleno del vector de acción (`action_noise_mask_dim=0`) y se aplica dropout de estado de 0,5. Se entrenó con batch 128 durante 60.000 pasos y se publican checkpoints intermedios (15.000, 30.000, 45.000) sin estado del optimizador, lo que permite trazar curvas de aprendizaje. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de políticas de acción robótica: produce 14 objetivos articulares absolutos a partir de observaciones visuales y estado proprioceptivo.
- Fusión multimodal visión-lenguaje-acción: integra tres vistas de cámara, estado de 14 dimensiones e instrucción de tarea en lenguaje natural.
- Control bimanual: las vistas de muñeca izquierda y derecha permiten políticas coordinadas para manipuladores de dos brazos.
- Planificación con horizonte de acción de 50 pasos por inferencia.
- Condicionamiento por instrucción: la tarea se especifica mediante texto, lo que permite reutilizar el mismo checkpoint para distintas consignas dentro del dominio entrenado.
- Checkpoints intermedios para análisis de convergencia y selección de política según el paso de entrenamiento.
- No dispone de tool calling, function calling, modo thinking, capacidades de audio ni generación de texto general; no es un modelo conversacional.

## Casos de uso

- Investigación en ablaciones de VLA: comparar esta variante (`action_noise_mask_dim=0`) con la versión con máscara (`rldx_b2d_all26_tag12_b128_60k`) para cuantificar el impacto del enmascarado de ruido en el espacio de acciones sobre la tasa de éxito en Bench2Dex.
- Baseline reproducible en manipulación diestra: servir como referencia fija en experimentos que modifiquen el preprocesado de acciones o el dropout de estado, gracias a la publicación de checkpoints en los pasos 15.000, 30.000 y 45.000.
- Evaluación de políticas bimanuales con robot UR5 y mano RH56DFX: el subconjunto `ur5_rh56dfx_3` está orientado a esta combinación hardware, por lo que el modelo puede evaluarse directamente en dicho montaje.
- Estudio de generalización por replay: al entrenarse sobre demostraciones de replay-generalization, es adecuado para medir cuánto retiene una política VLA cuando se reproduce una trayectoria con variaciones de estado inicial.
- Análisis de sensibilidad al dropout de estado: con `state_dropout=0.5`, el checkpoint permite estudiar la robustez de la política cuando la propriocepción es ruidosa o parcialmente ausente en tiempo de inferencia.
- Selección de checkpoint por coste computacional: los checkpoints intermedios permiten elegir un modelo con menos pasos de entrenamiento si el rendimiento es comparable, reduciendo requisitos de almacenamiento y despliegue.
- Punto de partida para ajuste fino en nuevos dominios: al estar construido sobre RLDX-1-PT y usar configuración por hub id, puede reentrenarse sobre otros datasets de teleoperación manteniendo el backbone y el tokenizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 7,03 mil millones de parámetros en precisión de 16 bits requiere del orden de 14 GB solo para pesos, a lo que hay que sumar el codificador visual, el procesamiento de tres flujos de cámara y las activaciones; en 8 bits bajaría a unos 7 GB de pesos, pero no se confirman cuantizaciones soportadas.
- GPU recomendadas: no disponible. No se documenta compatibilidad con A100, H100 ni RTX 4090.
- Ajuste en GPU de consumo: no confirmado. El tamaño de pesos en FP16 es compatible con GPUs de 24 GB como la RTX 4090 en teoría, pero la carga de tres cámaras y la ventana de vídeo pueden incrementar la memoria necesaria; no hay datos publicados.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el código de referencia es RLWRLD/RLDX en la rama `myungkyu/jitter-patch` (commit 21f674b4).
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 168,8 GB, incluyendo el checkpoint final y los intermedios; para descargar solo el final debe usarse `ignore_patterns="checkpoints/*"`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rldx_b2d_all26_tag12_nomask_b128_60k` (este) | 7,03 mil millones | no disponible | VLA para robótica (ablación sin máscara de ruido) | no disponible | Hugging Face, 88 descargas |
| `Myungkyu/rldx_b2d_all26_tag12_b128_60k` | no disponible en la información | no disponible | VLA para robótica (variante con máscara, mismo autor y dataset) | no disponible | Hugging Face |
| `RLWRLD/RLDX-1-PT` | no disponible en la información | no disponible | VLA base preentrenado | no disponible | Hugging Face |

La comparación directa más relevante es con la variante con máscara del mismo autor, que constituye el control experimental de esta ablación. No se dispone de datos de rendimiento comparado con otros VLA de la literatura (por ejemplo, familias tipo RT-2 u OpenVLA) en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso comercial, por lo que no debe asumirse permiso para producción sin consultar al autor.
- Modelo de investigación, no de propósito general: no genera texto ni mantiene conversaciones; su única salida es una política de acción articular.
- Dominio estrecho: entrenado sobre el subconjunto `ur5_rh56dfx_3` de Bench2Dex, con un robot UR5 y una mano RH56DFX; el rendimiento fuera de ese montaje o de esas tareas no está caracterizado.
- Riesgo de sobreajuste al dataset de teleoperación: al ser un ajuste fino de 60.000 pasos sobre un subconjunto concreto, la generalización a objetos, iluminación o disposiciones no vistas es incierta y no se documenta.
- Sin datos de sesgo ni de robustez: no se han publicado evaluaciones de sesgos, alucinación (en el sentido de acciones no plausibles) ni análisis de fallos.
- Idiomas no declarados: la instrucción de tarea se proporciona en lenguaje natural, pero no se especifica qué lenguas comprende el tokenizador del backbone.
- Configuración de entrenamiento no estándar: la ausencia de máscara de ruido en dimensiones de relleno es una decisión experimental; puede degradar el entrenamiento si el vector de acción contiene padding, y conviene verificar la variante con máscara antes de adoptarla.
- Estado del optimizador no incluido: los checkpoints no permiten reanudar el entrenamiento de forma exacta, solo inferencia o ajuste desde los pesos.
- Tamaño del repositorio elevado (168,8 GB): requiere planificar el almacenamiento y usar patrones de descarga selectivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/rldx_b2d_all26_tag12_nomask_b128_60k
- Variante con máscara de ruido (control experimental): https://huggingface.co/Myungkyu/rldx_b2d_all26_tag12_b128_60k
- Modelo base RLDX-1-PT: https://huggingface.co/RLWRLD/RLDX-1-PT
- Código de referencia (rama `myungkyu/jitter-patch`, commit 21f674b4): https://github.com/RLWRLD/RLDX
- Dataset Bench2Dex: https://huggingface.co/datasets/Bench2Dex/teleopdata
