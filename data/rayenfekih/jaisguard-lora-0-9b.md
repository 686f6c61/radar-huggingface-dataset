# RayenFekih/JaisGuard-LoRA-0.9B

## Resumen

JaisGuard-LoRA-0.9B es un clasificador de texto especializado en detectar si una entrada escrita en alfabeto árabe contiene significado recuperable (VALID) o es texto sin sentido (GIBBERISH). Ha sido desarrollado por RayenFekih como un adaptador LoRA sobre el modelo base IFM/Jais-3-0.9B (actualmente redirigido a inception42/Jais-3-0.9B), un transformer compacto del ecosistema Jais orientado al árabe. El problema que resuelve es el filtrado previo de consultas en sistemas de IA: distinguir peticiones con sentido real, incluso con erratas, lenguaje informal o dialectos árabes, de cadenas de caracteres aleatorias o sin contenido semántico.

Su relevancia radica en la escasez de herramientas de detección de ruido específicas para escritura árabe, donde los dialectos y la variabilidad ortográfica hacen que los filtros genéricos fallen. El modelo no es un backbone fusionado, sino un paquete compacto de checkpoint que incluye un runtime propio (`JaisGuardClassifier`), el adaptador LoRA sin fusionar, una cabeza de clasificación FP32 de 3.074 parámetros y manifiestos de integridad. La ventana de entrada es de 64 tokens, con etiquetas VALID=0 y GIBBERISH=1, y la licencia es MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Jais-3-0.9B) con adaptador LoRA y cabeza de clasificación lineal 1536→2 |
| Parametros totales | ~0,9 mil millones (base) + 3.074 parámetros de la cabeza; parámetros del adaptador LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens (sin truncamiento) |
| Tipos de cuantizacion | BF16 (backbone, inferencia histórica), FP16 (modo opcional), FP32 (cabeza y bias) |
| Idiomas soportados | Arabe (escritura árabe); entradas vacías o en otros alfabetos generan error |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador LoRA sin fusionar, cargado con PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Jais-3-0.9B (hidden size 1536) y añade un adaptador LoRA con rank 8, alpha 16 y dropout 0,05 aplicado a las proyecciones q_proj y v_proj (56 proyecciones objetivo). Sobre el backbone congelado se entrena una cabeza de clasificación lineal FP32 de 1536→2 con su bias original (3.074 parámetros entrenables). El pooling se realiza sobre el último token no padding, y la entrada es texto crudo con tokens especiales, sin plantilla de chat. El checkpoint seleccionado corresponde a la semilla 44, época 4, con pérdida de validación de 0,1711.

El entrenamiento se realizó sobre un export original de 1.500 filas (710 VALID y 790 GIBBERISH) con 250 filas de validación (120 VALID y 130 GIBBERISH); 1.367 etiquetas fueron revisadas por humanos y 133 son provisionales auditadas. Se usó AdamW con weight decay 0,01, warmup ratio 0,1 y gradient clipping 1,0. Para la fase LoRA: microbatch 2, acumulación 8, LR del adaptador 0,0001 y LR de la cabeza 0,001, hasta 8 épocas con patience 2. El dataset derivado publicado (2.148 filas: 1.498 train + 250 validación + 400 test) no se usó para entrenar estos checkpoints. El umbral de decisión guardado es 0,9429 (p_gibberish >= umbral), aunque el umbral explícito por defecto es 0,5.

## Capacidades

- Clasificación binaria de texto en escritura árabe: VALID (significado recuperable) frente a GIBBERISH (sin sentido).
- Tolerancia a erratas con significado, lenguaje informal y dialectos árabes (ej. `شنوة نعمل باش نتعلم البرمجة` se clasifica como VALID).
- Detección de cadenas de caracteres aleatorias (ej. `ضصثقفغعهخحجشس`) como GIBBERISH.
- API propia `JaisGuardClassifier` con parámetros `device` (cuda/cpu), `operating_point` y modo `--precision fp16`.
- Configuración de umbral de decisión ajustable (0,5 por defecto; punto de operación validado guardado en 0,9429).
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes: es exclusivamente un clasificador de secuencia.
- Compatibilidad con AutoModelForSequenceClassification, pipelines de Transformers, Inference Providers o vLLM nativo no está soportada según el autor.

## Casos de uso

- Filtrado previo de consultas en chatbots árabes: antes de enviar una petición al LLM principal, se clasifica la entrada para descartar texto sin sentido y ahorrar cómputo; con 64 tokens de ventana es adecuado para consultas cortas de usuario.
- Depuración de datasets de instrucciones en árabe: permite identificar automáticamente filas corruptas o generadas aleatoriamente en corpus de fine-tuning, dado que distingue erratas significativas de ruido puro.
- Moderación de entradas en formularios y APIs públicas: como clasificador ligero de 0,9B, puede ejecutarse en GPU modesta para bloquear spam o entradas aleatorias antes de procesamiento costoso.
- Control de calidad en pipelines de anotación: el umbral ajustable (0,5 frente a 0,9429) permite priorizar baja tasa de rechazo de entradas válidas en revisiones humanas.
- Análisis de logs de interacción: clasificación por lotes de consultas históricas para medir la proporción de ruido en producción y ajustar puntos de operación.
- Validación de entradas en sistemas RAG en árabe: garantiza que las queries recuperadas por el usuario contienen significado antes de la búsqueda vectorial, evitando recuperaciones sin sentido.

## Benchmarks y rendimiento

Resultados del propio checkpoint (semilla 44) sobre un benchmark construido de 400 entradas (188 VALID, 212 GIBBERISH), en BF16 histórico:

| Punto de operación | Accuracy | Macro F1 | Recall GIBBERISH | Rechazo VALID |
|---|---:|---:|---:|---:|
| default | 0,9125 | 0,9120 | 0,9292 | 0,1064 |
| validation_locked | 0,9225 | 0,9224 | 0,8962 | 0,0479 |

Agregados del experimento de tres semillas (42/43/44, media ± desviación estándar muestral, ddof=1), separados de este modelo:

| Punto de operación | Accuracy | Macro F1 | Recall GIBBERISH | Rechazo VALID |
|---|---:|---:|---:|---:|
| default | 0,8967 ± 0,0177 | 0,8955 ± 0,0187 | 0,9403 ± 0,0152 | 0,1525 ± 0,0546 |
| validation_locked | 0,9100 ± 0,0109 | 0,9100 ± 0,0109 | 0,8585 ± 0,0340 | 0,0319 ± 0,0192 |

No se han publicado comparaciones con modelos similares (MMLU, HumanEval u otros benchmarks generales no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: baja, al tratarse de un modelo de 0,9B; en BF16/FP16 el backbone requiere en torno a 2 GB de VRAM, más la cabeza FP32. Cifra exacta no disponible.
- GPU recomendadas: el autor reporta pruebas históricas sobre una RTX 4050 en BF16; cualquier GPU de consumo con 4 GB o más de VRAM es suficiente. Ejecución en CPU es viable con `device="cpu"` (latencia no disponible).
- Consumer GPU: cabe holgadamente en una RTX 4050, 4060, 3060 o superiores; no requiere GPUs de datacenter.
- Despliegue: únicamente mediante el runtime propio (`jaisguard_model.py` con `JaisGuardClassifier`), descargando el snapshot con `snapshot_download` a una revisión inmutable. No se soporta vLLM, pipelines de Transformers ni Inference Providers. Requiere Python 3.11 y las dependencias de `requirements.txt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JaisGuard-LoRA-0.9B | ~0,9B + LoRA | Detección VALID/GIBBERISH en árabe | 64 tokens | MIT | HF, runtime propio |
| IFM/Jais-3-0.9B (base) | 0,9B | Generación de texto multilingüe (árabe/inglés) | no disponible | no disponible | HF (redirigido a inception42/Jais-3-0.9B) |
| Alternativas de detección de gibberish en árabe | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen otros clasificadores comparables publicados específicamente para detección de gibberish en escritura árabe.

## Limitaciones y advertencias

- Ventana de contexto muy reducida: máximo 64 tokens sin truncamiento; entradas más largas no son soportadas.
- Solo procesa escritura árabe: entradas vacías o en otros alfabetos generan errores, no predicciones GIBBERISH.
- Los ejemplos del autor ilustran la intención del modelo, no una garantía de predicciones perfectas; el punto de operación exploratorio no es una garantía de producción ni está optimizado sobre el test.
- El dataset de entrenamiento incluye 133 etiquetas provisionales auditadas y dos registros de Aya con incertidumbre de privacidad usados en entrenamiento (limitación de privacidad divulgada; no se ha auditado extracción ni memorización).
- El entrenamiento original se registró en el commit git `fab3580` con cambios sin confirmar, por lo que no puede reconstruirse exactamente el workspace original.
- Los checkpoints BF16 y FP16 presentaron desacuerdos conocidos históricos; no se asume equivalencia entre precisiones, y el adaptador sin fusionar puede redondear de forma distinta a una fusión estática.
- Sesgos: no documentados explícitamente, pero el dataset es pequeño (1.500 filas de entrenamiento) y puede no cubrir todos los dialectos árabes por igual.
- Riesgo de alucinación: no aplicable, al tratarse de un clasificador y no de un modelo generativo.
- Licencia MIT: sin restricciones para uso comercial.
- Compatibilidad con Transformers pipelines, AutoModelForSequenceClassification y vLLM no está soportada; la integración exige usar el código custom incluido, que debe revisarse antes de ejecutar (código remoto de confianza).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RayenFekih/JaisGuard-LoRA-0.9B
- Modelo base: https://huggingface.co/IFM/Jais-3-0.9B (redirigido a https://huggingface.co/inception42/Jais-3-0.9B)
- Dataset derivado: https://huggingface.co/datasets/RayenFekih/arabic-gibberish-detection
- Paper, blog o demo: no disponible
