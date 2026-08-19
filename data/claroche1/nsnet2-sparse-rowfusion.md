# claroche1/nsnet2-sparse-rowfusion

## Resumen

NSNet2 bajo sparsity semi-estructurada es un conjunto de seis checkpoints del modelo de mejora de voz NSNet2, entrenados con máscaras de poda fijas de distintos patrones (2:4, 4:8, 1:4, bloques 1×4 al 80%, no estructurada al 80% y un control denso). El objetivo del trabajo, desarrollado por claroche1, es estudiar el impacto real de la sparsity semi-estructurada en la calidad de la mejora de voz cuando se combina con fine-tuning, y proporcionar artefactos listos para el desarrollo de kernels de multiplicación dispersa-densa (sparse-dense MatMul) en inferencia con lote de tamaño 1. El modelo procesa audio a 16 kHz en frames de 16 ms, lo que lo hace adecuado para aplicaciones en tiempo real en dispositivos con recursos limitados.

La relevancia de este modelo radica en que demuestra, con datos empíricos, que la poda semi-estructurada no degrada la calidad medida por PESQ cuando se aplica fine-tuning con la máscara fija: los seis brazos experimentales son estadísticamente indistinguibles (variación de 0,012 PESQ frente a una desviación típica de ~0,010). Además, los checkpoints incluyen pesos con ceros explícitos, máscaras y vectores de referencia para validar kernels, lo que lo convierte en un recurso útil para investigación en aceleración de inferencia. La arquitectura es la de NSNet2, una red recurrente con capas GRU y fully connected, con aproximadamente 2,8 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NSNet2: red recurrente con 2 capas GRU (400 unidades ocultas) y capas fully connected (fc_in, fc1, fc2, fc_out) |
| Parametros totales | Aproximadamente 2,78 M (suma de las matrices listadas: 2.777.000) |
| Parametros activos | No aplica (modelo denso con máscaras de sparsity; no es MoE) |
| Longitud de contexto | No aplica (procesa frames de audio de 16 ms, N=1 en inferencia) |
| Tipos de cuantizacion | FP32 (int8 no caracterizado) |
| Idiomas soportados | No disponible (procesamiento de voz, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`g_best`), NumPy (`weights.npz` con pesos, máscaras y vectores dorados), `config.json` |

## Arquitectura y entrenamiento

NSNet2 es una red neuronal de mejora de voz que combina capas fully connected con dos capas GRU de 400 unidades ocultas. La entrada es un frame de 16 ms de audio a 16 kHz (257 coeficientes espectrales), y la salida es una máscara de ganancia aplicada al espectro. El modelo se entrena de forma adversarial, con un discriminador que se inicializa desde cero en cada brazo experimental.

El entrenamiento de los seis checkpoints partió de un mismo baseline denso preentrenado (200 épocas, PESQ 2.845) y se fine-tuneó durante 120 épocas con una tasa de aprendizaje de 3e-4, manteniendo fija la máscara de sparsity en cada brazo. El dataset utilizado es VoiceBank-DEMAND-16k. La innovación principal no está en la arquitectura, sino en el método de poda con fine-tuning: en lugar de aplicar poda por magnitud y luego reentrenar, se fija la máscara desde el inicio y se optimizan solo los pesos supervivientes. Esto recupera casi toda la calidad perdida por la poda (la poda sin fine-tuning cuesta 0,378 PESQ en 2:4 y 0,656 en 1×4 al 80%, mientras que con fine-tuning la pérdida es despreciable). Las máscaras siguen la convención NVIDIA 2:4, con agrupación a lo largo de la dimensión de entrada K, y los pesos se almacenan en formato row-major `(M, K)` con ceros explícitos.

## Capacidades

- Mejora de voz (speech enhancement): reducción de ruido y mejora de la inteligibilidad en audio de 16 kHz.
- Denoising en tiempo real: procesa un frame de 16 ms por paso, apto para streaming con latencia mínima.
- Soporte de sparsity semi-estructurada: los pesos incluyen ceros explícitos y máscaras, listos para kernels de multiplicación matriz-vector dispersa (N=1).
- Validación de kernels: incluye vectores de referencia (`ref_x` y `ref_y`) para verificar corrección numérica.
- Reproducibilidad: cada directorio contiene `manifest.json` con formas, patrones y sparsity alcanzada, y `verify.py` para comprobar la integridad.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de audio.

## Casos de uso

- Mejora de voz en dispositivos embebidos: al ser un modelo de ~2,8 M de parámetros y operar con N=1, puede ejecutarse en CPUs o MCUs con aceleración sparse para limpiar audio en audífonos o altavoces inteligentes.
- Preprocesamiento para reconocimiento de voz (ASR): integrar el modelo como front-end para reducir ruido antes de un ASR, mejorando la robustez en entornos ruidosos (por ejemplo, en videollamadas o grabaciones de campo).
- Comunicaciones VoIP y conferencias: aplicar la mejora de voz en tiempo real en el lado del cliente o del servidor para reducir ruido de fondo y eco, con una carga computacional mínima.
- Desarrollo de kernels sparse-dense MatMul: los checkpoints con máscaras y vectores dorados permiten validar implementaciones de multiplicación dispersa para GPUs o hardware personalizado, comparando resultados con precisión 1e-4.
- Investigación en poda y cuantización: los seis brazos experimentales sirven como banco de pruebas para estudiar el efecto de distintos patrones de sparsity en la calidad de audio, con un baseline denso de control.
- Aplicaciones de accesibilidad: mejora de la claridad del habla en prótesis auditivas o sistemas de asistencia para personas con discapacidad auditiva, donde la latencia y el consumo energético son críticos.

## Benchmarks y rendimiento

La métrica utilizada es PESQ (Perceptual Evaluation of Speech Quality) sobre el conjunto de test completo de VoiceBank-DEMAND (824 utterances). Todos los brazos se fine-tunearon desde el mismo baseline denso con el mismo schedule (lr 3e-4, 120 épocas), por lo que la única variable es la máscara de sparsity.

| Directorio | Patron | Sparsity | PESQ |
|---|---|---|---|
| `dense` | denso (control) | 0% | 2.777 |
| `2_4` | 2:4 | 50.0% | 2.779 |
| `4_8` | 4:8 | 50.0% | 2.779 |
| `1_4` | 1:4 | 75.0% | 2.781 |
| `unstructured_80` | no estructurada | 80.0% | 2.776 |
| `1x4_80` | bloques 1×4 | 80.0% | 2.770 |

La dispersión entre los seis brazos es de 0,012 PESQ, mientras que la variación run-to-run dentro de un mismo brazo es de ~0,010 de desviación típica, por lo que los resultados son estadísticamente indistinguibles. Todos los brazos, incluido el control denso, están ~0,07 PESQ por debajo del baseline publicado de 2.845 (entrenado durante 200 épocas), debido a que estos fine-tunes se acortaron a 120 épocas y el discriminador se inicializó desde cero. Para referencia, la poda por magnitud sin fine-tuning cuesta 0,378 PESQ en 2:4 y 0,656 en 1×4 al 80%, lo que demuestra que el fine-tuning con máscara fija recupera casi toda la calidad.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~2,8 M de parámetros en FP32, el checkpoint ocupa ~11 MB (0,1 GB en el repo). La inferencia requiere menos de 100 MB de memoria, incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte para sparse MatMul (por ejemplo, NVIDIA Ampere o posterior para sparsity 2:4). También puede ejecutarse en CPU sin aceleración sparse.
- Compatibilidad con GPUs de consumo: sí, cabe en cualquier GPU moderna (RTX 2060 o superior) y en muchas placas de desarrollo (Jetson, Raspberry Pi con aceleración).
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchScript, ONNX o integrado en pipelines de audio. Para kernels sparse, se proporcionan los pesos en NumPy para desarrollo propio.
- Latencia y throughput: no se proporcionan mediciones explícitas, pero al procesar un frame de 16 ms por paso, la latencia es del orden de milisegundos en hardware moderno. El cuello de botella son las multiplicaciones GRU recurrentes, que no se pueden paralelizar sobre el tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PESQ (VoiceBank-DEMAND) | Licencia | Sparsity |
|---|---|---|---|---|---|
| NSNet2 denso (baseline 200 épocas) | ~2,8 M | 16 ms frame | 2.845 | MIT | 0% |
| NSNet2 sparse (este modelo, 2:4) | ~2,8 M (50% sparse) | 16 ms frame | 2.779 | MIT | 50% |
| NSNet2 sparse (este modelo, 1:4) | ~2,8 M (75% sparse) | 16 ms frame | 2.781 | MIT | 75% |

No se dispone de comparativas con otros modelos de mejora de voz (como DeepFilterNet o FullSubNet) en la información proporcionada. La comparación interna muestra que la sparsity no degrada la calidad respecto al control denso con el mismo schedule de entrenamiento.

## Limitaciones y advertencias

- Todos los checkpoints, incluido el control denso, están ~0,07 PESQ por debajo del baseline publicado de 2.845, porque se fine-tunearon durante 120 épocas con un discriminador recién inicializado. No deben compararse directamente con el baseline de 200 épocas.
- Los pesos están en FP32; el comportamiento bajo cuantización int8 con este nivel de sparsity no está caracterizado y podría degradar la calidad.
- La sparsity no ofrece ninguna mejora de calidad; su único beneficio es la posible aceleración en kernels especializados. Sin kernels sparse, el modelo denso es equivalente en rendimiento.
- La poda sin fine-tuning es mucho más pesimista (2:4 cuesta 0,378 PESQ), por lo que los resultados de este repo no deben extrapolarse a escenarios sin reentrenamiento.
- El modelo procesa una única frame de 16 ms; no maneja contexto temporal más allá de la recurrencia interna de las GRU, lo que limita su capacidad para modelar dependencias de largo plazo en el audio.
- No se proporcionan datos sobre sesgos o alucinaciones en el audio mejorado; como todo modelo generativo, puede introducir artefactos en condiciones de ruido extremo.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Repositorio de HuggingFace: [claroche1/nsnet2-sparse-rowfusion](https://huggingface.co/claroche1/nsnet2-sparse-rowfusion)
- Código y receta de entrenamiento: [LarocheC/eco8-neaixt](https://github.com/LarocheC/eco8-neaixt) (rama `sparse-masks-rowfusion`, ver `SPARSE_MATMUL_COLLAB.md`)
- Checkpoints del baseline denso y otras factorizaciones: [claroche1/sparse-nsnet2-checkpoints](https://huggingface.co/claroche1/sparse-nsnet2-checkpoints)
- Paper relacionado (Dynamic nsNet2): [arXiv:2308.16678](https://arxiv.org/abs/2308.16678)
