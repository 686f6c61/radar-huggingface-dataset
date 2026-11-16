# ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_exp-K-softtanh-V

## Resumen

El modelo `ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_exp-K-softtanh-V` es un clasificador de imágenes basado en la arquitectura bViT (variante de Vision Transformer), entrenado desde cero sobre el subconjunto ImageNet-100 como parte de un proyecto de reproducción experimental denominado bViT_circuit. Lo publica el usuario ais0430 en Hugging Face con la librería `transformers` y pesos en formato `safetensors`. Su tamaño es muy reducido: 3.059.926 parámetros totales, lo que lo sitúa en la categoría de modelos ligeros para clasificación de imágenes.

El nombre del repositorio codifica buena parte de la configuración del entrenamiento: dimensión de embedding de 462, 6 cabezas de atención, 30 épocas, batch de 128, learning rate de 5e-4, sin EMA (exponential moving average), y una variante experimental de activación/atención etiquetada como "exp-K-softtanh-V". La precisión de evaluación mejor reportada por el autor es 0.4422 (44,22 %) sobre ImageNet-100.

Es relevante ahora como artefacto de investigación reproducible: no es un modelo de propósito general ni compite con los clasificadores de referencia, sino un punto de control intermedio de un estudio sobre arquitecturas ViT alternativas. Su interés es académico y de experimentación, no de despliegue en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bViT (variante de Vision Transformer, según tag `bvit`) |
| Parametros totales | 3.059.926 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución de entrada no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificación de imágenes, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimensión de embedding | 462 |
| Cabezas de atención | 6 |
| Épocas de entrenamiento | 30 |
| Batch size | 128 |
| Learning rate | 5e-4 |
| EMA | no (desactivado) |
| Dataset | ImageNet-100 (`imagenet100`) |
| Precisión de evaluación (mejor) | 0.4422 |

## Arquitectura y entrenamiento

La arquitectura es una variante de Vision Transformer etiquetada como bViT, con dimensión de embedding de 462 y 6 cabezas de atención. El identificador del experimento incluye la cadena "exp-K-softtanh-V", que sugiere una modificación experimental en el mecanismo de atención (posiblemente una función de similitud o normalización basada en soft-tanh aplicada a las claves o a los valores). No se dispone de la descripción formal de dicha modificación en la información proporcionada; el autor remite al repositorio `bViT_circuit` (ficheros `CLAUDE.md` y `docs/code_notes/`) para los detalles de diseño.

El entrenamiento se realizó sobre ImageNet-100 durante 30 épocas, con batch de 128 y learning rate de 5e-4, sin EMA. No se especifican en la información disponible el número total de tokens de imagen procesados, la resolución de entrada, el esquema de aumentación de datos, el optimizador ni si hubo fases de preentrenamiento o ajuste fino. Tampoco se documenta el uso de RLHF/DPO, algo por otra parte esperable en un clasificador de imágenes supervisado. El run de entrenamiento está registrado en W&B bajo el identificador `822bkg5c` en la instancia `forge.coreweave.com`.

## Capacidades

- Clasificación de imágenes en 100 categorías (ImageNet-100).
- Extracción de representaciones visuales intermedias mediante los pesos del encoder transformer.
- Integración con la librería `transformers` y con el pipeline `image-classification`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que permite servirlo mediante la infraestructura de inferencia de Hugging Face.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión generativa, audio ni tool calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües no aplicables (modelo puramente visual).

## Casos de uso

- Reproducción de experimentos de arquitectura: sirve como punto de control para replicar los resultados del proyecto bViT_circuit y comparar variantes de atención (por ejemplo, la variante "K-softtanh-V") frente a la atención estándar en ImageNet-100.
- Clasificación de imágenes en dominios cerrados de 100 clases: útil en entornos controlados donde las categorías coinciden con las de ImageNet-100, con la precisión de referencia del 44,22 % como cota esperada.
- Extracción de features para modelos ligeros: al tener solo 3,06 M de parámetros, puede actuar como backbone congelado en pipelines de clasificación de bajo coste computacional o en experimentos de destilación.
- Docencia y formación: modelo pequeño y rápido de entrenar que permite ilustrar el funcionamiento interno de un Vision Transformer y las decisiones de diseño (dimensión, cabezas, EMA, activaciones) en cursos de visión por computador.
- Pruebas de integración en `transformers`: validar pipelines de `image-classification`, carga de safetensors y despliegue en endpoints con un modelo de tamaño mínimo.
- Investigación sobre eficiencia: analizar el compromiso entre número de parámetros (3 M) y precisión en un benchmark reducido, como base para estudios de escalado o de poda.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| ImageNet-100 | Accuracy (mejor evaluación) | 0.4422 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni desgloses por clase, matriz de confusión o métricas adicionales (top-5, F1). El único dato de rendimiento es la precisión de evaluación indicada en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los pesos (3,06 M de parámetros), más el coste de activaciones según la resolución de entrada, que no se especifica.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4060 o RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, sin restricciones prácticas de memoria.
- Opciones de despliegue: pipeline `image-classification` de `transformers`, `optimum` para exportación a ONNX, y endpoints compatibles de Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera una latencia muy baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ais0430/in100_bvit (este modelo) | 3,06 M | no disponible | 44,22 % en ImageNet-100 | no disponible | Hugging Face |
| ViT-base (referencia) | ~86 M | 224x224 típico | no comparable directamente (entrenado en ImageNet-1k) | según variante | Hugging Face |
| DeiT-tiny | ~5,7 M | 224x224 típico | no comparable directamente | Apache 2.0 (variante estándar) | Hugging Face |

La comparación directa no es posible con los datos disponibles: los modelos de referencia se evalúan habitualmente sobre ImageNet-1k (1000 clases), mientras que este modelo se entrena y evalúa sobre ImageNet-100 (100 clases), un régimen distinto y no directamente trasladable. No se dispone de resultados de este modelo frente a otros clasificadores ligeros en el mismo protocolo.

## Limitaciones y advertencias

- Precisión limitada: 44,22 % de accuracy en ImageNet-100 es un resultado bajo para estándares de producción; no es adecuado para aplicaciones donde se requiera alta fiabilidad.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor; la ausencia de licencia explícita es un riesgo legal.
- Sesgos: no documentados. Al entrenarse sobre ImageNet-100, hereda los sesgos de clase y de representación del dataset original.
- Alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en clases visualmente similares.
- Contexto e idioma: no aplicable; el modelo solo procesa imágenes y no tiene capacidades lingüísticas.
- Sin EMA durante el entrenamiento: puede implicar una mayor varianza en los pesos finales respecto a variantes con media móvil.
- Documentación escasa: la model card remite a un repositorio externo para los detalles de diseño; no hay información sobre resolución de entrada, preprocesado ni normalización, lo que complica la reproducibilidad exacta.
- Sin validación externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso o validación por terceros.
- Fecha de creación futura en los metadatos (2026-11-16): conviene verificar la integridad y el origen del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ais0430/in100_bvit_e-dim-462_head-6_epoch-30_batch-128_lr-5e-4_no-ema_exp-K-softtanh-V
- Repositorio del proyecto bViT_circuit: https://github.com/otia-0430/bViT_circuit
- Run de entrenamiento en W&B: https://forge.coreweave.com/wandb/aito-paretto-/bvit/runs/822bkg5c
