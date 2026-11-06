# RayenFekih/JaisGuard-Frozen-0.9B

## Resumen

JaisGuard-Frozen-0.9B es un clasificador de texto binario para detectar entradas sin sentido (gibberish) en escritura árabe, desarrollado por RayenFekih sobre el modelo base IFM/Jais-3-0.9B (actualmente redirigido a inception42/Jais-3-0.9B), un transformer de 0,9 mil millones de parámetros entrenado por Inception (G42). El modelo etiqueta cada entrada como VALID o GIBBERISH según si el texto tiene significado recuperable, no según si está bien escrito: acepta erratas significativas, lenguaje informal y dialectos árabes, y rechaza cadenas de caracteres aleatorias como `ضصثقفغعهخحجشس`.

Su caso de uso natural es el filtrado previo de consultas de usuario en sistemas de IA conversacionales en árabe: descartar peticiones sin contenido antes de gastar cómputo en el LLM principal. Es relevante porque los filtros de basura en árabe dialectal son un problema poco resuelto y este modelo ofrece un clasificador ligero y especializado con métricas publicadas y un punto de operación configurable.

Técnicamente, es un checkpoint congelado (backbone sin entrenar) al que se le ha entrenado únicamente una cabeza de clasificación lineal FP32 de 1536→2 dimensiones (3.074 parámetros), con umbral de decisión guardado y una API propia (`JaisGuardClassifier`) que no es compatible con los pipelines estándar de Transformers ni con vLLM nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Jais-3-0.9B) con cabeza de clasificación lineal 1536→2 y pooling del último token no padding |
| Parametros totales | ~0,9 mil millones (backbone) + 3.074 parámetros de cabeza |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens máximo, sin truncamiento |
| Tipos de cuantizacion | FP32 (cabeza, siempre), BF16 y FP16 para el backbone (histórico en RTX 4050) |
| Idiomas soportados | Árabe (escritura árabe, incluidos dialectos); entradas en otros alfabetos o vacías devuelven error |
| Licencia | MIT |
| Formato de pesos | Checkpoint portátil: runtime independiente + tokenizador + adaptador/cabeza + config + manifiesto de integridad; backbone base descargado de Hugging Face (no fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Jais-3-0.9B (hidden size 1536), un transformer multilingüe con énfasis en árabe. El backbone permanece completamente congelado; solo se entrena una cabeza de clasificación lineal FP32 (1536→2) con su bias original, usando pooling del último token no padding. Las etiquetas son VALID=0 y GIBBERISH=1, la decisión se toma con `p_gibberish >= threshold`, y el padding es a la derecha con texto crudo y tokens especiales, sin prompt de chat.

El entrenamiento usó un export original de 1.500 filas de entrenamiento (710 VALID, 790 GIBBERISH; 1.367 etiquetas revisadas por humanos y 133 provisionales auditadas) y 250 filas de validación (120 VALID, 130 GIBBERISH). El dataset derivado publicado en Hugging Face (1.498 train + 250 validación + 400 test = 2.148 filas) no se usó para entrenar estos checkpoints. La configuración de optimización fue AdamW con weight decay 0,01, warmup ratio 0,1, gradient clipping 1,0, batch 32 y learning rate de cabeza 0,001 durante hasta 30 épocas con patience 5 (variante congelada). El checkpoint publicado corresponde a la semilla 43, época 5, con pérdida de validación 0,2295, seleccionada por el primer mínimo de pérdida de validación. También se documentan hiperparámetros de una variante LoRA (microbatch 2, acumulación 8, LR de adaptador 0,0001) en `training_config.json`.

## Capacidades

- Clasificación binaria de texto en escritura árabe: VALID (con significado recuperable) frente a GIBBERISH (sin sentido).
- Tolerancia a erratas significativas, lenguaje informal y dialectos árabes: la variante tunecina `شنوة نعمل باش نتعلم البرمجة` se clasifica como VALID.
- Detección de cadenas de caracteres aleatorias o sin contenido semántico.
- Punto de operación configurable: umbral por defecto de 0,5 o umbral guardado de validación (0,9564), orientado a minimizar rechazos de entradas válidas.
- Inferencia en GPU (CUDA) o CPU con precisión BF16 o FP16 seleccionable, manteniendo la cabeza en FP32.
- Gestión explícita de errores: entradas vacías o en alfabetos no soportados generan error, no una predicción GIBBERISH.
- No soporta generación de texto, tool calling, agentes, ni capacidades multimodales: es exclusivamente un clasificador.

## Casos de uso

- Filtrado previo de consultas en chatbots árabes: como puerta de entrada antes del LLM principal, descarta peticiones sin sentido y ahorra cómputo de inferencia del modelo generativo.
- Depuración de datasets de instrucciones en árabe: clasifica en lote entradas de datasets de fine-tuning para eliminar filas gibberish antes de entrenar.
- Moderación de entradas de usuario en producción: detecta spam de teclado, inyecciones de caracteres aleatorios o pruebas automatizadas en formularios y APIs conversacionales.
- Validación de datos de telemetría: filtra logs de interacciones para que las métricas de calidad no se contaminen con consultas sin contenido.
- Sistemas con presupuesto de cómputo ajustado: al ser un clasificador de 0,9B con contexto de 64 tokens, puede ejecutarse en GPUs de consumo como primer filtro barato.
- Investigación reproducible en clasificación de texto árabe: el paquete incluye manifiesto de integridad, hashes de procedencia e hiperparámetros completos, útil como baseline replicable.

## Benchmarks y rendimiento

Resultados del propio checkpoint (semilla 43) sobre un benchmark construido de 400 entradas (188 VALID, 212 GIBBERISH), en BF16 histórico:

| Operating point | Accuracy | Macro F1 | Recall GIBBERISH | Rechazo VALID |
|---|---:|---:|---:|---:|
| default (0,5) | 0,880000 | 0,879020 | 0,915094 | 0,159574 |
| validation_locked (0,9564) | 0,815000 | 0,812297 | 0,655660 | 0,005319 |

Agregados del experimento de tres semillas (42/43/44, media ± desviación estándar muestral, mismo conjunto de test), no correspondientes a este modelo:

| Operating point | Accuracy | Macro F1 | Recall GIBBERISH | Rechazo VALID |
|---|---:|---:|---:|---:|
| default | 0,879167 ± 0,003819 | 0,878114 ± 0,003553 | 0,916667 ± 0,016565 | 0,163121 ± 0,011073 |
| validation_locked | 0,827500 ± 0,019526 | 0,825631 ± 0,020333 | 0,685535 ± 0,036639 | 0,012411 ± 0,008125 |

No hay comparaciones publicadas con otros clasificadores de gibberish.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB en BF16/FP16 para el backbone de 0,9B más la cabeza FP32; alrededor de 4 GB si se carga en FP32. No se publica una cifra oficial.
- GPU de referencia histórica: RTX 4050 (el autor documentó inferencia BF16 en esa tarjeta), por lo que cualquier GPU de consumo con 4-6 GB de VRAM es suficiente.
- Ejecutable también en CPU, aunque no se publican latencias para ese modo.
- Despliegue: únicamente mediante la API propia `JaisGuardClassifier` incluida en el repositorio (Python 3.11, `requirements.txt` y `example.py` proporcionados). No se reclama compatibilidad con AutoModelForSequenceClassification, pipelines de Transformers, Inference Providers ni vLLM nativo.
- Uso remoto recomendado: `snapshot_download` del repositorio en una revisión inmutable, inspección del código y posterior importación de `jaisguard_model.py` desde ese directorio; opción `--local-files-only` para ejecución solo con caché.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se conocen clasificadores de gibberish en escritura árabe ampliamente publicados con los que comparar directamente. Referencia contextual del modelo base:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JaisGuard-Frozen-0.9B | Clasificador binario (VALID/GIBBERISH, árabe) | 0,9B (backbone congelado) + cabeza de 3.074 parámetros | 64 tokens | MIT | Hugging Face, API propia |
| IFM/Jais-3-0.9B (base) | LLM causal generativo árabe/inglés | 0,9B | no disponible | no disponible | Hugging Face (repositorio redirigido a inception42/Jais-3-0.9B) |
| Alternativas de clasificación de gibberish en árabe | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento muy reducido: 1.500 filas de entrenamiento y 250 de validación, con 133 etiquetas provisionales auditadas; el rendimiento fuera de esa distribución no está garantizado.
- Rechazo de entradas válidas del 16% en el punto de operación por defecto (0,5): uno de cada seis textos con significado puede clasificarse erróneamente como GIBBERISH. El punto `validation_locked` reduce ese rechazo al 0,5% a costa de bajar el recall de GIBBERISH al 65,6%.
- El umbral guardado (0,9564) se optimizó sobre validación, no sobre test, y no constituye una garantía de producción.
- La selección del checkpoint usa el primer mínimo de pérdida de validación, no la calidad en test.
- Contexto máximo de solo 64 tokens sin truncamiento: textos más largos generan error en lugar de recortarse.
- Solo admite escritura árabe; entradas vacías o en otros alfabetos devuelven error.
- Existen discrepancias conocidas de probabilidad entre BF16 y FP16 en dos de los checkpoints de serving históricos; BF16 y FP16 no se asumen equivalentes.
- Privacidad: dos registros VALID de Aya revisados por humanos con incertidumbre de privacidad se usaron en el entrenamiento original (limitación divulgada); no se ha realizado auditoría de extracción o memorización.
- Procedencia: el entrenamiento original se registró en el commit git `fab3580` con cambios sin confirmar, por lo que no puede reconstruirse exactamente ese entorno.
- El dataset derivado en Hugging Face era privado en el momento de la preparación y puede requerir acceso autorizado.
- Sesgos específicos: no documentados por el autor; dado el tamaño reducido y la composición del dataset, cabe esperar sesgos hacia los dialectos y estilos presentes en el mismo.
- Riesgo de alucinación: no aplicable, al ser un modelo discriminativo sin generación de texto.
- Licencia MIT: sin restricciones para uso comercial, aunque el modelo base puede tener condiciones propias que conviene revisar.

## Enlaces

- Modelo: https://huggingface.co/RayenFekih/JaisGuard-Frozen-0.9B
- Modelo base: https://huggingface.co/IFM/Jais-3-0.9B (redirigido a https://huggingface.co/inception42/Jais-3-0.9B)
- Dataset derivado: https://huggingface.co/datasets/RayenFekih/arabic-gibberish-detection
- Paper, blog o demo: no disponibles
