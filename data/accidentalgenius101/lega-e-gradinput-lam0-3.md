# accidentalgenius101/legA-E-gradinput-lam0.3

## Resumen

`legA-E-gradinput-lam0.3` es un artefacto de replicación experimental publicado por el usuario accidentalgenius101 en Hugging Face, no un modelo de lenguaje de propósito general. Consiste en un clasificador binario entrenado sobre el token CLS normalizado de 384 dimensiones de `facebook/dinov2-small` (ViT-S/14), con una cabeza MLP (384 → 256 → 256 → 1) entrenada desde cero. El objetivo del experimento es replicar la Sección 2.1 del artículo "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071) de Goodfire, relativa al *reliance shaping* sobre el dataset Waterbirds.

El checkpoint corresponde al brazo A1 de la onda E (segunda ola), con penalización `gradinput`, lambda 0.3, semilla 0, refresco 100 pasos y encoder no congelado. El autor declara un veredicto de replicación **FAILED, narrowed**: la dinámica de reliance se reproduce como fenómeno transitorio temprano (pico de worst-group accuracy entre 0.89 y 0.95 en los primeros ~1.200 pasos en cinco de seis brazos limpios), pero el endpoint publicado (93-97,7 % de WGA en test) no se sostiene tras la decadencia medida.

Es relevante ahora porque documenta un caso de discrepancia entre resultados publicados y replicación independiente, con trazabilidad explícita de causas convictas (defecto propio corregido y laguna de especificación en el artículo original). El repo ocupa 0,1 GB y contiene pesos en safetensors con 22.221.185 parámetros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (DINOv2-small) congelable como encoder + cabeza MLP (384 → 256 → 256 → 1) entrenada desde cero |
| Parametros totales | 22.221.185 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada 224x224 píxeles) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades de texto) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un encoder ViT-S/14 (`facebook/dinov2-small`, 384 dimensiones de CLS) con una cabeza readout GELU MLP de tres capas (384 → 256 → 256 → 1) inicializada desde cero. La entrada son imágenes de 224x224, batch 32, y el entrenamiento se realizó sobre los splits oficiales de Waterbirds: 2.066 imágenes de entrenamiento en dos grupos perfectamente confundidos, y 512 imágenes de validación y 512 de test con cuatro grupos de 128 e identidades disjuntas.

La configuración concreta de este checkpoint es: brazo A1, penalización `gradinput`, lambda 0.3, semilla 0, refresco 100, encoder no congelado, 25.000 pasos, learning rates constantes separados (encoder 1e-6 declarado en el artículo; cabeza 1e-3), weight decay 0 y optimizador AdamW (el artículo no especifica optimizador para la Sección 2.1). Las cantidades que el artículo deja sin declarar se registran en `config.json` bajo `deviations`. La innovación técnica destacable no está en el modelo en sí, sino en el protocolo de replicación: penalización sobre gradientes de entrada para moldear la dependencia de features de contexto (background) frente a features de objeto, con monitorización mediante AUROC L1 a lo largo de la dirección difference-of-means del paso 0.

## Capacidades

- Clasificación binaria de imágenes (Waterbirds: ave acuática frente a ave terrestre) con una única salida escalar.
- Extracción de representaciones visuales mediante el encoder DINOv2-small subyacente.
- Monitorización de reliance: el checkpoint permite calcular AUROC L1 sobre la dirección de diferencia de medias para medir dependencia de background.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (modelo puramente visual).
- Sin modo thinking, visión generativa, audio ni otras modalidades.

## Casos de uso

- Replicación de experimentos de reliance shaping: usar este checkpoint como referencia del brazo gradinput lambda 0.3 para comparar con otros brazos (shuffle, lambda 1, lambda 10) y estudiar la dinámica pico-decadencia descrita por el autor.
- Investigación sobre robustez a spurious correlations: el par (encoder DINOv2 + readout MLP) sirve como banco de pruebas controlado para medir worst-group accuracy en Waterbirds con grupos confundidos.
- Auditoría de reproducibilidad de artículos: el repo documenta configuraciones, desviaciones y veredictos por hipótesis, útil como plantilla metodológica para replicaciones de papers de interpretabilidad.
- Estudio de penalizaciones sobre gradientes de entrada: permite analizar empíricamente cómo la penalización `gradinput` afecta la dirección de diferencia de medias y el AUROC L1 a lo largo del entrenamiento.
- Análisis de regímenes de learning rate: dado que el autor identifica el LR único 1e-6 como defecto convicto, este checkpoint sirve para contrastar regímenes de LR separados (encoder/cabeza) frente a regímenes únicos.
- Docencia y formación: como ejemplo real de discrepancia entre claim publicada y replicación, con métricas concretas (WGA pico 0.617 en paso 200, WGA endpoint 0.188 en validación) para discutir buenas prácticas de evaluación.

## Benchmarks y rendimiento

Resultados declarados por el autor para este checkpoint (Waterbirds, semilla 0, endpoint en paso 25.000):

| Metrica | Valor |
|---|---|
| Pico val WGA (paso 200) | 0.617 |
| Endpoint val WGA | 0.188 |
| Endpoint test WGA | 0.180 |
| Endpoint test L1 | 0.161 |
| Grupos val {0,1,2,3} | {0.953, 0.188, 0.773, 1.000} |
| Grupos test {0,1,2,3} | {0.945, 0.180, 0.688, 0.969} |

Comparación con otros brazos limpios del mismo protocolo (extracto):

| Brazo | lambda | Pico val WGA (paso) | Endpoint val WGA | Endpoint test WGA |
|---|---|---|---|---|
| gradinput | 10 | 0.945 (400) | 0.172 | 0.180 |
| gradinput | 1 | 0.891 (200) | 0.164 | 0.141 |
| gradinput | 0.3 | 0.617 (200) | 0.188 | 0.180 |
| shuffle | 30 | 0.953 (1.000-1.200) | 0.000 | 0.000 |
| shuffle | 3 | 0.938 (400) | 0.016 | 0.008 |
| shuffle | 1 | 0.945 (200) | 0.375 | 0.422 |

El artículo original reporta endpoints de 93-97,7 % de WGA en test para la Sección 2.1 con 3 semillas, bajo un protocolo cuyos detalles (longitud de entrenamiento, regla de checkpointing, schedule de LR, weight decay, LR de cabeza y lambda) no están declarados. Ningún brazo limpio de esta replicación alcanza la barra de hold pre-declarada (endpoint test WGA ≥ 88 % sin colapso tardío).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (22,2 M parámetros ≈ 89 MB de pesos más activaciones de ViT-S/14 a 224x224).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4090, A100 o H100 sobredimensionadas para este tamaño.
- Cabe en cualquier GPU consumer, incluidas GTX 1650 o integradas con suficiente memoria compartida.
- Opciones de despliegue: carga directa con PyTorch y safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador visual).
- Latencia y throughput: no disponible en la información proporcionada; por tamaño, inferencia por imagen del orden de milisegundos en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legA-E-gradinput-lam0.3 | 22,2 M | 224x224 | Clasificación binaria Waterbirds | other | Hugging Face (0 descargas) |
| facebook/dinov2-small | ~22 M | 224x224 (hasta 518 con interpolación) | Embeddings visuales generales | Apache 2.0 (según el repo original) | Hugging Face, ampliamente usado |
| Checkpoints shaped de Goodfire (Sección 2.1) | no disponible | no disponible | Clasificación Waterbirds con reliance shaping | no disponible | No publicados (solo se liberó la librería `reliance`) |
| Brazos hermanos de esta replicación (shuffle, lambda 1/3/10/30) | 22,2 M | 224x224 | Clasificación Waterbirds | other | No publicados como repos separados |

## Limitaciones y advertencias

- El propio autor declara el resultado como FAILED, narrowed: no es un checkpoint validado para uso en producción ni para afirmar la claim endpoint del artículo.
- El endpoint val WGA (0.188) y test WGA (0.180) están muy por debajo del pico transitorio (0.617 en paso 200), lo que indica colapso tardío del efecto de shaping bajo este protocolo.
- El AUROC L1 endpoint (0.161 en test) sugiere que la dirección de diferencia de medias no captura la dependencia de background esperada al final del entrenamiento.
- Licencia "other": no se especifican términos de uso comercial; tratar como restringida hasta verificación con el autor.
- Modelo puramente visual y de tarea única (Waterbirds): no aplicable a NLP, código, agentes ni multimodalidad generativa.
- Riesgo de alucinación no aplicable en el sentido habitual, pero el checkpoint puede producir predicciones espurias fuera de la distribución Waterbirds.
- Sesgos conocidos: el dataset Waterbirds está construido con correlaciones confundidas entre background y etiqueta; los grupos 1 y 2 muestran WGA notablemente inferior (0.188 y 0.773 en validación), evidenciando dependencia residual de features de contexto.
- Laguna de especificación del artículo original (longitud de entrenamiento, checkpointing, schedule de LR, weight decay, LR de cabeza y lambda) impide cerrar la brecha de replicación; no se inventó protocolo caritativo para forzarla.
- Defecto convicto documentado en el régimen previo (LR único 1e-6 aplicado a todos los parámetros) y en el estimador de ruido; revisar `config.json` `deviations` antes de reutilizar la configuración.

## Enlaces

- Hugging Face: https://huggingface.co/accidentalgenius101/legA-E-gradinput-lam0.3
- Artículo replicado (arXiv:2611.07071): https://arxiv.org/abs/2611.07071
- Encoder base: https://huggingface.co/facebook/dinov2-small
- Librería `reliance` de Goodfire: no disponible en la información proporcionada (el autor indica que Goodfire liberó solo la librería, sin URL concreta)
