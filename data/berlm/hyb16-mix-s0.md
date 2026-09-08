# Berlm/hyb16-mix-s0

## Resumen

El modelo `Berlm/hyb16-mix-s0` es un modelo de lenguaje híbrido de 366 millones de parámetros desarrollado por Berlm, diseñado como parte de una familia de cinco modelos que comparan distintos mecanismos de mezcla de tokens (token mixers) en contextos largos. Este modelo en particular combina capas GDN2 (Gated DeltaNet), capas de atención con ventana deslizante y capas de atención completa, con el objetivo de evaluar cómo esta mezcla afecta al rendimiento en tareas de recuperación y generación con secuencias de hasta 16.384 tokens.

La arquitectura es híbrida, con 24 capas, tamaño oculto de 1024 y un total de 365.773.494 parámetros. Se entrenó durante 15.000 millones de tokens sobre el dataset FineWeb-Edu, con una longitud de secuencia de 16.384. Su relevancia radica en que sirve como referencia empírica para estudiar el comportamiento de arquitecturas de atención lineal y híbrida en contextos largos, un área clave para el desarrollo de modelos eficientes. No obstante, los resultados de evaluación muestran una degradación clara en la recuperación de información a partir de los 4K tokens, lo que lo convierte en un modelo de investigación más que en una herramienta de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: GDN2 (Gated DeltaNet), sliding-window attention y full-attention |
| Parámetros totales | 365.773.494 |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens (secuencia de entrenamiento; evaluación hasta 32K) |
| Tipos de cuantización | No disponible (solo se documenta bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo consta de 24 capas, con tamaño oculto de 1024, 6 cabezas de dimensión 128 en las capas lineales/EDM y 8 cabezas de 128 en las capas de atención. Las MLPs usan SwiGLU con tamaño intermedio de 2816, normalización RMSNorm y embeddings de entrada/salida atados. La distribución de capas sigue el patrón GSGF SGSF x3: 9 capas GDN2, 9 capas de atención con ventana deslizante de 2048 tokens y RoPE theta 10000, y 6 capas de atención completa sin codificación posicional (NoPE). Todas las capas de atención incorporan una puerta sigmoide de salida.

El entrenamiento se realizó sobre FineWeb-Edu, tokenizado con el tokenizer de Llama-2 (32.000 tokens, EOS id 2), con documentos empaquetados a 16.384 tokens sin enmascaramiento de documentos. Se procesaron 15.000 millones de tokens en 9.536 pasos de optimizador, con un batch global de 1.572.864 tokens (96 secuencias de 16.384). Se usó AdamW con LR pico de 8e-4, warmup de 1.5B tokens y un esquema warmup-stable-decay con el decaimiento comenzando en 13.5B tokens, todo en bf16. Las capas lineales se ejecutan con flash-linear-attention (GDN2 chunk kernels) y las capas de atención con flash-attn 2 (fa2) usando la ventana como sliding window solo hacia la izquierda.

## Capacidades

- Generación de texto en inglés con un vocabulario de 32.000 tokens.
- Procesamiento de secuencias largas de hasta 16.384 tokens durante el entrenamiento.
- Recuperación de información en contexto largo, aunque con una caída notable a partir de 4K tokens.
- Evaluación en tareas de comprensión lectora, razonamiento de sentido común y modelado de lenguaje (ARC, HellaSwag, PiQA, Winogrande, BoolQ, OpenBookQA, LAMBADA, WikiText).
- Comparación directa con modelos hermanos de la misma familia para estudiar el efecto de distintos token mixers.
- No se menciona soporte de tool calling, agentes, visión, audio ni capacidades multimodales en la información disponible.

## Casos de uso

- Investigación en arquitecturas híbridas: el modelo permite comparar empíricamente el comportamiento de capas GDN2, sliding-window y full-attention bajo una receta de entrenamiento común, lo que resulta útil para estudiar el equilibrio entre coste computacional y calidad de recuperación.
- Evaluación de degradación de contexto: puede emplearse como banco de pruebas para analizar cómo se pierde la capacidad de recuperación de información a medida que la secuencia crece, especialmente en tareas tipo needle-in-a-haystack.
- Fine-tuning experimental: dado su tamaño reducido (366M) y su licencia MIT, es adecuado para ajustes finos en tareas específicas de NLP en inglés, siempre que se asuma la limitación de contexto.
- Docencia y prototipado: sirve como ejemplo de modelo con código personalizado y dependencias de bajo nivel (flash-linear-attention, flash-attn) para enseñar el despliegue de arquitecturas híbridas en GPU.
- Análisis de eficiencia: al ser un modelo pequeño con capas de atención lineal, puede usarse para medir el throughput y el uso de VRAM en comparación con modelos transformer puros del mismo tamaño.
- Reproducción de benchmarks de recuperación: el modelo incluye resultados de S-NIAH y tareas de completado de documentos, lo que permite replicar experimentos y validar metodologías de evaluación de contexto largo.

## Benchmarks y rendimiento

Los resultados de la evaluación zero-shot (lm-eval-harness 0.4.12) se presentan a continuación, comparando el modelo con sus hermanos de la misma familia. Los valores de la columna "this model" corresponden a este modelo.

| Métrica | hyb16-mix-s0 | gdn2 | edm | swa1k | swa2k |
|---|---|---|---|---|---|
| Pérdida final de validación (nats) | 2.3156 | 2.3055 | 2.2977 | 2.3245 | 2.3289 |
| arc_easy / arc_challenge | 57.1 / 25.1 | 59.4 / 26.1 | 59.7 / 25.2 | 57.0 / 25.0 | 55.0 / 25.0 |
| hellaswag (acc_norm) | 41.5 | 41.5 | 42.0 | 40.7 | 40.8 |
| piqa / winogrande / boolq | 67.1 / 53.0 / 58.8 | 66.5 / 52.5 / 56.5 | 67.3 / 52.2 / 59.5 | 66.5 / 50.4 / 61.0 | 64.7 / 52.5 / 58.7 |
| openbookqa (acc_norm) | 31.6 | 33.4 | 31.8 | 32.0 | 31.2 |
| lambada acc / ppl | 34.6 / 31.5 | 35.5 / 29.9 | 35.9 / 28.2 | 33.4 / 37.4 | 37.4 / 29.3 |
| wikitext word ppl | 25.1 | 24.8 | 24.3 | 25.1 | 25.3 |
| swde / fda / squad_completion | 53.8 / 13.6 / 35.4 | 56.0 / 66.2 / 36.7 | 55.5 / 62.1 / 38.4 | 47.9 / 51.5 / 21.8 | 50.9 / 13.2 / 21.5 |
| social_iqa (prompt-qualified) | 37.9 | 38.8 | 39.0 | 37.8 | 37.5 |

Resultados de recuperación single-needle (S-NIAH, estilo RULER, 500 muestras por celda, fracción correcta):

| Métrica | hyb16-mix-s0 | gdn2 | edm | swa1k | swa2k |
|---|---|---|---|---|---|
| needle-1 @1K/2K/4K/8K | 1.00/1.00/0.53/0.28 | 1.00/1.00/1.00/1.00 | 1.00/1.00/1.00/1.00 | 1.00/0.98/0.96/0.94 | 1.00/1.00/0.52/0.28 |
| needle-1 @16K/32K | 0.15/0.05 | 1.00/1.00 | 1.00/1.00 | 0.95/0.94 | 0.15/0.05 |
| needle-2 @1K/2K/4K/8K | 1.00/1.00/0.48/0.20 | 1.00/1.00/1.00/1.00 | 1.00/1.00/1.00/0.97 | 1.00/0.99/0.98/0.81 | 0.94/0.71/0.42/0.25 |
| needle-2 @16K/32K | 0.13/0.08 | 0.93/0.37 | 0.94/0.65 | 0.88/0.63 | 0.15/0.08 |
| needle-3 @1K/2K/4K/8K | 0.98/0.98/0.30/0.01 | 0.98/0.98/0.91/0.63 | 0.96/0.95/0.84/0.54 | 0.99/0.94/0.76/0.37 | 0.18/0.30/0.29/0.25 |
| needle-3 @16K/32K | 0.00/0.00 | 0.17/0.04 | 0.45/0.20 | 0.16/0.09 | 0.16/0.06 |

Los datos provienen de una única semilla; el autor advierte que las diferencias inferiores a medio punto en tareas de generación deben tratarse como ruido.

## Requisitos de hardware

- VRAM estimada: no se proporciona un valor oficial. El tamaño del repositorio es de 0,7 GB, lo que sugiere que el modelo en bf16 ocupa aproximadamente 0,7 GB en disco, por lo que la VRAM de inferencia debería ser baja, aunque no está verificado.
- GPU recomendadas: se requiere una GPU CUDA; no se especifican modelos concretos. Por tamaño, cualquier GPU de consumo con al menos 4 GB de VRAM (por ejemplo, RTX 3050 o superior) podría ser suficiente, pero no está confirmado.
- Despliegue documentado únicamente mediante `transformers` con `trust_remote_code=True` en GPU CUDA. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Dependencias necesarias: `torch==2.10.*`, `transformers==5.14.1`, `flash-linear-attention==0.5.2`, `flash-attn==2.8.3`, `triton>=3.6`, `einops`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los modelos comparables más directos son los cuatro hermanos de la misma familia, entrenados con la misma receta y con el mismo número de parámetros, pero con distintas configuraciones de capas de atención.

| Modelo | Parámetros | Contexto | Pérdida final | needle-1 @8K | Licencia |
|---|---|---|---|---|---|
| hyb16-mix-s0 | 365.773.494 | 16.384 | 2.3156 | 0.28 | MIT |
| hyb16-gdn2-s0 | 365.773.494 | 16.384 | 2.3055 | 1.00 | MIT |
| hyb16-edm-s0 | 365.773.494 | 16.384 | 2.2977 | 1.00 | MIT |
| hyb16-swa1k-s0 | 365.773.494 | 16.384 | 2.3245 | 0.94 | MIT |
| hyb16-swa2k-s0 | 365.773.494 | 16.384 | 2.3289 | 0.28 | MIT |

La comparativa muestra que el modelo mix obtiene resultados de recuperación idénticos al modelo swa2k, lo que sugiere que la presencia de capas GDN2 y full-attention no evita el colapso de recuperación en contextos largos. No se dispone de comparativas con modelos externos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa en la recuperación de información a partir de 4K tokens: needle-1 cae a 0.53 en 4K, 0.28 en 8K, 0.15 en 16K y 0.05 en 32K.
- Puntuación extremadamente baja en la tarea FDA (13.6), muy por debajo del modelo gdn2 puro (66.2), lo que indica una pérdida de capacidad para responder preguntas sobre documentos largos.
- Los resultados provienen de una única semilla; la variabilidad entre ejecuciones no está cuantificada y el autor advierte que diferencias pequeñas pueden ser ruido.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- El modelo no tiene soporte documentado para tool calling, agentes, visión ni audio.
- Requiere dependencias de bajo nivel no empaquetadas (flash-linear-attention, flash-attn) y código personalizado con `trust_remote_code=True`, lo que complica el despliegue en entornos de producción o en plataformas sin soporte para este tipo de dependencias.
- Es un modelo de investigación con fines comparativos; no se ha evaluado su robustez frente a sesgos, alucinaciones ni uso en aplicaciones críticas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías de soporte ni de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Berlm/hyb16-mix-s0
- Modelo hermano hyb16-gdn2-s0: https://huggingface.co/Berlm/hyb16-gdn2-s0
- Modelo hermano hyb16-edm-s0: https://huggingface.co/Berlm/hyb16-edm-s0
- Modelo hermano hyb16-swa1k-s0: https://huggingface.co/Berlm/hyb16-swa1k-s0
- Modelo hermano hyb16-swa2k-s0: https://huggingface.co/Berlm/hyb16-swa2k-s0
