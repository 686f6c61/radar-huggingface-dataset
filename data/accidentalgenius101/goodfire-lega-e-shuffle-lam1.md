# accidentalgenius101/goodfire-legA-E-shuffle-lam1

## Resumen

El modelo `accidentalgenius101/goodfire-legA-E-shuffle-lam1` es un artefacto de replicación científica, no un modelo de lenguaje de propósito general. Consiste en un clasificador binario construido sobre un codificador de visión `facebook/dinov2-small` (ViT-S/14, 384 dimensiones de CLS) con una cabeza MLP (384 → 256 → 256 → 1) entrenada desde cero. Su objetivo es reproducir el experimento de "reliance shaping" descrito en la Sección 2.1 del artículo de Goodfire "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071) sobre el conjunto de datos Waterbirds.

El autor declara explícitamente que el resultado de la replicación es **FAILED, narrowed**: la trayectoria del fenómeno de reliance se reproduce como un transitorio temprano (WGA de validación pico de 0,945 en el paso 200), pero el endpoint publicado por el paper (93-97,7 % de WGA en test) no se sostiene a los 25.000 pasos, cayendo a 0,375 en validación y 0,422 en test. La causa atribuida es una laguna de especificación del paper original (longitud de entrenamiento, regla de checkpointing, schedule de LR, weight decay, LR de la cabeza y lambda no declarados).

Con 22.221.185 parámetros totales y un tamaño de repositorio de 0,1 GB, es un checkpoint de investigación de bajo coste computacional, relevante para quienes trabajan en robustez ante sesgos de correlación espuria (waterbirds, grupos desbalanceados) y en técnicas de monitorización y modelado de representaciones internas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (DINOv2-small) congelable como encoder + cabeza MLP GELU (384 → 256 → 256 → 1) |
| Parametros totales | 22.221.185 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada 224×224 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificador de imágenes, sin procesamiento de lenguaje) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un codificador ViT-S/14 preentrenado (`facebook/dinov2-small`, dimensión CLS de 384) con una cabeza de lectura MLP de tres capas (384 → 256 → 256 → 1) entrenada desde cero. La entrada son imágenes de 224×224. El entrenamiento se realizó sobre Waterbirds con los splits "filed" del paper: 2.066 imágenes de entrenamiento en exactamente 2 grupos perfectamente confundidos, y 512 imágenes de validación y 512 de test, cada una con 4 grupos de 128 e identidades disjuntas.

La configuración del brazo A1 es: penalización `shuffle`, lambda 1, semilla 0, refresco de la dirección de penalización cada 100 pasos, `frozen=False`, batch 32, 25.000 pasos, AdamW con weight decay 0 y learning rates constantes separados (encoder 1e-6, cabeza 1e-3). El paper no especifica optimizador para la Sección 2.1; el autor documenta las cantidades no declaradas en `config.json` bajo la clave `deviations`. La innovación metodológica del paper es el "reliance shaping": una penalización que empuja al modelo a no depender de direcciones de representación asociadas al atributo espurio (fondo) en lugar de al atributo causal (especie de ave).

## Capacidades

- Clasificación binaria de imágenes (ave acuática vs. ave terrestre) sobre el dataset Waterbirds.
- Extracción de representaciones: el encoder DINOv2-small produce un token CLS de 384 dimensiones utilizable como embedding visual.
- Monitorización de reliance: el checkpoint permite calcular la dirección de diferencia de medias en el paso 0 y medir AUROC de fondo (L1) a lo largo del entrenamiento.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplicable.
- Capacidad especial: artefacto de replicación con métricas de robustez por grupo (WGA) documentadas paso a paso.

## Casos de uso

- Replicación y auditoría de experimentos de robustez: sirve como punto de partida para verificar si el endpoint de 93-97,7 % de WGA del paper de Goodfire es alcanzable bajo protocolos alternativos (por ejemplo, checkpointing en el transitorio temprano en lugar del paso 25.000).
- Estudio de dinámicas de penalización: el checkpoint y las tablas del model card permiten analizar cómo la penalización `shuffle` con lambda 1 reduce la reliance en ~200 pasos y luego la cabeza recupera sensibilidad 15-25× a LR constante.
- Investigación en spurious correlation: útil para comparar estrategias de group robustness (ERM, gradinput, shuffle) sobre Waterbirds con splits perfectamente confundidos.
- Docencia en ML riguroso: ejemplo documentado de cómo una laguna de especificación (longitud de entrenamiento y regla de checkpointing) cambia la conclusión de un paper, con barras pre-declaradas y veredictos por hipótesis.
- Base para fine-tuning de clasificadores visuales con DINOv2-small: la cabeza MLP y el pipeline de entrenamiento son reutilizables en tareas de clasificación de imágenes con grupos desbalanceados.
- Benchmarking de harnesses de replicación: las tablas de brazos limpios y brazos de contexto permiten validar la implementación de penalizaciones (gradinput, shuffle) contra la librería `reliance` de Goodfire.

## Benchmarks y rendimiento

Resultados del brazo principal (shuffle, lambda 1, semilla 0, endpoint en paso 25.000):

| Metrica | Valor |
|---|---|
| Peak val WGA (paso 200) | 0,945 |
| Endpoint val WGA | 0,375 |
| Endpoint test WGA | 0,422 |
| Endpoint val L1 (AUROC fondo) | 0,534 |
| Endpoint test L1 (AUROC fondo) | 0,550 |

Comparativa de los seis brazos limpios (mismo protocolo, semilla 0, endpoint 25.000 pasos):

| Arm | lambda | Peak val WGA (paso) | Endpoint val WGA | Endpoint test WGA | Endpoint test L1 |
|---|---|---|---|---|---|
| gradinput | 10 | 0,945 (400) | 0,172 | 0,180 | 0,165 |
| gradinput | 1 | 0,891 (200) | 0,164 | 0,141 | 0,152 |
| gradinput | 0,3 | 0,617 (200) | 0,188 | 0,180 | 0,161 |
| shuffle | 30 | 0,953 (1.000-1.200) | 0,000 | 0,000 | 0,548 |
| shuffle | 3 | 0,938 (400) | 0,016 | 0,008 | 0,137 |
| shuffle | 1 | 0,945 (200) | 0,375 | 0,422 | 0,550 |

Brazos de contexto:

| Context arm | Protocolo | Test WGA |
|---|---|---|
| ERM, régimen filed | LR único 1e-6, 2.500 pasos, 3 semillas | 0,055 (media) |
| ERM, LRs separados | encoder 1e-6 / cabeza 1e-3, 2.500 pasos, semilla 0 | 0,172 |
| ERM congelado | encoder congelado, cabeza 1e-3, 2.500 pasos, semilla 0 | 0,375 |
| gradinput lambda 10 congelado | encoder congelado, cabeza 1e-3, 2.500 pasos, semilla 0 | 0,711 |

El paper original reporta endpoints de 93-97,7 % de test WGA para la Sección 2.1 con 3 semillas, bajo un protocolo cuyas variables clave no están declaradas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,2 M de parámetros (unos 89 MB de pesos) más activaciones de un ViT-S/14 a 224×224; cómodo en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia (GTX 1650, RTX 3050 en adelante); para reentrenar 25.000 pasos con batch 32 se recomienda RTX 4090, A100 o H100 para reducir el tiempo de pared.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más.
- Opciones de despliegue: PyTorch/Hugging Face `transformers` con `AutoModel` para DINOv2 y carga manual de la cabeza MLP desde safetensors; no hay pipeline declarado en Hugging Face.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodfire-legA-E-shuffle-lam1 | 22,2 M | no disponible (imagen 224×224) | Clasificación Waterbirds con reliance shaping | other | Hugging Face |
| facebook/dinov2-small | ~22 M | no disponible (imagen) | Backbone visual autosupervisado | Apache 2.0 (según el modelo base) | Hugging Face |
| Modelos del paper Goodfire Sección 2.1 | no disponible | no disponible | Waterbirds reliance shaping | no disponible (no liberados) | No publicados |
| `reliance` library (Goodfire) | no aplica (código) | no aplica | Implementación de penalizaciones | no disponible | Repositorio de Goodfire |

El paper no liberó los modelos conformados; este checkpoint es un artefacto independiente de replicación. No se dispone de comparativas de rendimiento con alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El autor declara el resultado como FAILED: el endpoint publicado no se reproduce; solo el transitorio temprano (pico de WGA en los primeros ~1.200 pasos) es reproducible.
- El checkpoint está entrenado sobre Waterbirds con splits perfectamente confundidos; no generaliza a otras tareas ni dominios sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no genera código ni responde preguntas.
- Riesgo de alucinación: no aplicable en el sentido de LLM, pero las métricas del model card son afirmaciones del autor no verificadas de forma independiente.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse al autor antes de cualquier uso en producción.
- El modelo base DINOv2-small tiene su propia licencia (Apache 2.0 según el repositorio de Facebook); la licencia del checkpoint derivado no está detallada.
- El autor documenta defectos convictos en su propio harness (LR único de 1e-6 aplicado a todos los parámetros en el régimen del 2026-11-23, estimador de ruido promediado antes de elevar al cuadrado); no deben tomarse los números de contexto como referencia limpia.
- La reproducibilidad depende de variables no declaradas en el paper (longitud de entrenamiento, checkpointing, schedule de LR, weight decay, LR de cabeza, lambda); cualquier comparación con los resultados publicados debe hacerse con cautela.
- Sin descargas ni likes en Hugging Face en el momento de la ficha; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/accidentalgenius101/goodfire-legA-E-shuffle-lam1
- Paper de referencia: https://arxiv.org/abs/2611.07071
- Modelo base DINOv2-small: https://huggingface.co/facebook/dinov2-small
- Librería `reliance` de Goodfire: no disponible en la información proporcionada (referenciada en el model card sin URL)
- Repositorio o demo adicional: no disponible en la información proporcionada
