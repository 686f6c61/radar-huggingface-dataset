# Berlm/hyb16-gdn2-s0

## Resumen

El modelo `hyb16-gdn2-s0` es un modelo de lenguaje híbrido de 365 millones de parámetros desarrollado por Berlm, diseñado para comparar diferentes mecanismos de atención en contextos largos. Combina 18 capas de Gated DeltaNet-2 (GDN2), un tipo de atención lineal, con 6 capas de atención completa, lo que lo convierte en una alternativa eficiente a los transformadores convencionales para tareas de recuperación de información en secuencias extensas.

Fue entrenado sobre 15.000 millones de tokens de FineWeb-Edu con una longitud de secuencia de 16.384, y su evaluación incluye pruebas de recuperación de agujas (needle retrieval) hasta 32K tokens. Es uno de cinco modelos hermanos entrenados con la misma receta, variando únicamente las capas de mezcla de tokens, lo que permite aislar el efecto del token mixer en el rendimiento a largo contexto.

Su relevancia radica en ser un modelo de investigación abierto (licencia MIT) que permite estudiar el comportamiento de arquitecturas híbridas de atención lineal frente a la atención completa, con un coste computacional reducido. No está ajustado por instrucciones ni alineado para seguridad, por lo que su uso principal es experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 capas Gated DeltaNet-2 (GDN2) + 6 capas de atención completa |
| Parametros totales | 365.281.644 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (entrenamiento); evaluado hasta 32K |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo tiene 24 capas en total, con una dimensión oculta de 1024. Las capas de atención completa se sitúan en las posiciones 3, 7, 11, 15, 19 y 23, y utilizan 8 cabezas de dimensión 128. Las capas GDN2 emplean 6 cabezas de dimensión 128. El MLP es de tipo SwiGLU con tamaño intermedio 2816, y se aplica RMSNorm. Los embeddings de entrada y salida están atados. El tokenizador es el de Llama-2 (32.000 tokens, EOS id 2). Las capas de atención completa no usan codificación posicional (NoPE), mientras que las capas de ventana deslizante de los modelos hermanos usan RoPE con theta 10.000; en este modelo no hay capas de ventana deslizante. Todas las capas de atención tienen una puerta de salida sigmoide.

El entrenamiento se realizó con datos de FineWeb-Edu tokenizados con el tokenizador de Llama-2, empaquetando documentos hasta 16.384 tokens sin enmascaramiento de documentos. Se procesaron 15.000 millones de tokens en 9.536 pasos de optimizador, con un batch global de 1.572.864 tokens (96 secuencias de 16.384). Se usó AdamW con LR máximo de 8e-4, warmup de 1.500 millones de tokens y un scheduler warmup-stable-decay que inicia el decaimiento en 13.500 millones de tokens. La semilla fue 0 y se entrenó en bf16. Las capas lineales usan los kernels de GDN2 de flash-linear-attention, y las capas de atención completa usan FlashAttention 2 (fa2).

## Capacidades

- Generación de texto en inglés a partir de un prompt, con capacidad de completar secuencias de forma autoregresiva.
- Recuperación de información en contexto largo: mantiene un rendimiento perfecto en tareas de needle retrieval de un solo aguja hasta 16K tokens, y degrada progresivamente a 32K.
- Razonamiento básico de sentido común, evaluado en conjuntos como HellaSwag, PIQA, Winogrande y OpenBookQA, con puntuaciones modestas pero coherentes con su tamaño.
- Capacidad de manejar secuencias de hasta 16.384 tokens durante el entrenamiento, y de generalizar hasta 32K en tareas de recuperación.
- No soporta tool calling, function calling, agentes multi-paso ni entrada multimodal (visión, audio).
- No está ajustado por instrucciones, por lo que no sigue comandos complejos ni conversaciones de asistente.

## Casos de uso

- Investigación en arquitecturas de atención: permite comparar el rendimiento de GDN2 frente a otros token mixers (EDM, sliding window, mezclas) bajo una receta idéntica, útil para publicaciones y estudios ablativo.
- Evaluación de recuperación en contexto largo: sirve como modelo de referencia en tareas de needle-in-a-haystack, especialmente para validar la capacidad de recuperación de agujas hasta 32K tokens.
- Generación de texto en inglés para experimentos de LM: puede utilizarse para medir perplejidad en wikitext o LAMBADA, o para análisis de propiedades estadísticas del lenguaje.
- Prototipado de modelos híbridos: al ser pequeño y con pesos en safetensors, es una base adecuada para experimentos de fine-tuning en tareas específicas de dominio en inglés.
- Benchmarking de eficiencia: permite medir el throughput y el uso de memoria de los kernels GDN2 de flash-linear-attention frente a la atención completa, en GPU con CUDA.
- Educación en modelos de lenguaje: sirve para demostrar el impacto de diferentes capas de mezcla de tokens en el rendimiento y la eficiencia, con un tamaño manejable para entornos académicos.

## Benchmarks y rendimiento

Se han publicado resultados de evaluación zero-shot y de recuperación de agujas en la model card. No se incluyen resultados de MMLU, HumanEval ni GSM8K, por lo que no se dispone de esos benchmarks.

Evaluación zero-shot (accuracy, salvo que se indique lo contrario):

| Métrica | Este modelo | gdn2 | edm | swa1k | swa2k | mix |
|---|---|---|---|---|---|---|
| Pérdida final de validación (nats) | 2.3055 | 2.3055 | 2.2977 | 2.3245 | 2.3289 | 2.3156 |
| arc_easy / arc_challenge | 59.4 / 26.1 | 59.4 / 26.1 | 59.7 / 25.2 | 57.0 / 25.0 | 55.0 / 25.0 | 57.1 / 25.1 |
| hellaswag (acc_norm) | 41.5 | 41.5 | 42.0 | 40.7 | 40.8 | 41.5 |
| piqa / winogrande / boolq | 66.5 / 52.5 / 56.5 | 66.5 / 52.5 / 56.5 | 67.3 / 52.2 / 59.5 | 66.5 / 50.4 / 61.0 | 64.7 / 52.5 / 58.7 | 67.1 / 53.0 / 58.8 |
| openbookqa (acc_norm) | 33.4 | 33.4 | 31.8 | 32.0 | 31.2 | 31.6 |
| lambada acc / ppl | 35.5 / 29.9 | 35.5 / 29.9 | 35.9 / 28.2 | 33.4 / 37.4 | 37.4 / 29.3 | 34.6 / 31.5 |
| wikitext word ppl | 24.8 | 24.8 | 24.3 | 25.1 | 25.3 | 25.1 |
| swde / fda / squad_completion | 56.0 / 66.2 / 36.7 | 56.0 / 66.2 / 36.7 | 55.5 / 62.1 / 38.4 | 47.9 / 51.5 / 21.8 | 50.9 / 13.2 / 21.5 | 53.8 / 13.6 / 35.4 |
| social_iqa (prompt-qualified) | 38.8 | 38.8 | 39.0 | 37.8 | 37.5 | 37.9 |

Recuperación de aguja única (S-NIAH, fracción de respuestas correctas):

| Métrica | Este modelo | gdn2 | edm | swa1k | swa2k | mix |
|---|---|---|---|---|---|---|
| needle-1 @1K/2K/4K/8K | 1.00/1.00/1.00/1.00 | 1.00/1.00/1.00/1.00 | 1.00/1.00/1.00/1.00 | 1.00/0.98/0.96/0.94 | 1.00/1.00/0.52/0.28 | 1.00/1.00/0.53/0.28 |
| needle-1 @16K/32K | 1.00/1.00 | 1.00/1.00 | 1.00/1.00 | 0.95/0.94 | 0.15/0.05 | 0.15/0.05 |
| needle-2 @1K/2K/4K/8K | 1.00/1.00/1.00/1.00 | 1.00/1.00/1.00/1.00 | 1.00/1.00/1.00/0.97 | 1.00/0.99/0.98/0.81 | 0.94/0.71/0.42/0.25 | 1.00/1.00/0.48/0.20 |
| needle-2 @16K/32K | 0.93/0.37 | 0.93/0.37 | 0.94/0.65 | 0.88/0.63 | 0.15/0.08 | 0.13/0.08 |
| needle-3 @1K/2K/4K/8K | 0.98/0.98/0.91/0.63 | 0.98/0.98/0.91/0.63 | 0.96/0.95/0.84/0.54 | 0.99/0.94/0.76/0.37 | 0.18/0.30/0.29/0.25 | 0.98/0.98/0.30/0.01 |
| needle-3 @16K/32K | 0.17/0.04 | 0.17/0.04 | 0.45/0.20 | 0.16/0.09 | 0.16/0.06 | 0.00/0.00 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en bf16, incluyendo pesos y activaciones para secuencias de hasta 16K tokens. Para secuencias de 32K, la VRAM puede aumentar notablemente.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM. Se ha verificado con PyTorch 2.10, transformers 5.14.1, flash-linear-attention 0.5.2 y flash-attn 2.8.3. Ejemplos válidos: RTX 3060, RTX 4090, A100, H100.
- Sí cabe en GPU de consumo: una RTX 3060 de 12 GB o superior es suficiente para inferencia y evaluación.
- Opciones de despliegue: únicamente mediante `transformers` con `trust_remote_code=True`. Requiere CUDA y los paquetes flash-linear-attention y flash-attn. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

Los modelos comparables son los hermanos de la misma familia, entrenados con la misma receta y tamaño. Todos comparten licencia MIT y el mismo tokenizador.

| Modelo | Token mixer | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hyb16-gdn2-s0 | GDN2 + 6 capas de atención completa | 365.281.644 | 16K (eval. hasta 32K) | MIT | HuggingFace |
| hyb16-edm-s0 | EDM + 6 capas de atención completa | 365.281.644 | 16K (eval. hasta 32K) | MIT | HuggingFace |
| hyb16-swa1k-s0 | Sliding window 1K + 6 capas de atención completa | 365.281.644 | 16K (eval. hasta 32K) | MIT | HuggingFace |
| hyb16-swa2k-s0 | Sliding window 2K + 6 capas de atención completa | 365.281.644 | 16K (eval. hasta 32K) | MIT | HuggingFace |
| hyb16-mix-s0 | Mezcla de token mixers + 6 capas de atención completa | 365.281.644 | 16K (eval. hasta 32K) | MIT | HuggingFace |

En términos de rendimiento, este modelo destaca en FDA (66.2) y en needle-3 a 8K (0.63), siendo el más fuerte de la familia en esas métricas. El modelo edm obtiene mejor pérdida de validación (2.2977) y mejor needle-2 a 32K (0.65), mientras que swa2k y mix muestran una degradación severa en recuperación de agujas a partir de 8K.

## Limitaciones y advertencias

- Modelo pequeño de investigación, entrenado solo con 15B tokens de texto web; no es un modelo de producción.
- No está ajustado por instrucciones ni alineado para seguridad, por lo que puede generar contenido incorrecto, sesgado o no deseado.
- Solo soporta inglés; su conocimiento de otros idiomas es inexistente o muy limitado.
- Requiere código personalizado y dependencias específicas (flash-linear-attention, flash-attn, triton), lo que dificulta su despliegue en entornos estándar.
- La evaluación se realizó con una sola semilla; las diferencias inferiores a medio punto deben considerarse ruido.
- No se han documentado sesgos específicos, pero al estar entrenado en FineWeb-Edu puede heredar sesgos presentes en ese corpus.
- No soporta tool calling, agentes ni multimodalidad; su uso se limita a generación de texto y tareas de recuperación.
- La licencia MIT permite uso comercial, pero el modelo no está listo para producción sin un fine-tuning y evaluación adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Berlm/hyb16-gdn2-s0
- Hermano hyb16-edm-s0: https://huggingface.co/Berlm/hyb16-edm-s0
- Hermano hyb16-swa1k-s0: https://huggingface.co/Berlm/hyb16-swa1k-s0
- Hermano hyb16-swa2k-s0: https://huggingface.co/Berlm/hyb16-swa2k-s0
- Hermano hyb16-mix-s0: https://huggingface.co/Berlm/hyb16-mix-s0
