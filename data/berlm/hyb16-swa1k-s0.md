# Berlm/hyb16-swa1k-s0

## Resumen

hyb16-swa1k-s0 es un modelo de lenguaje de 366 millones de parámetros desarrollado por Berlm, diseñado como parte de una familia de cinco modelos híbridos entrenados con la misma receta para comparar diferentes mecanismos de atención en contextos largos. Este modelo concreto combina 18 capas de atención de ventana deslizante (sliding-window) con una ventana de 1024 tokens y 6 capas de atención completa, todas con puertas sigmoideas y normalización RMSNorm. Fue entrenado con 15.000 millones de tokens de FineWeb-Edu a una longitud de secuencia de 16.384 tokens, y su objetivo principal es servir como banco de pruebas para investigar cómo afecta la elección del token mixer al rendimiento en tareas de contexto largo.

Su relevancia radica en que permite a investigadores y desarrolladores comparar de forma controlada el comportamiento de arquitecturas de atención lineal e híbrida frente a la atención completa tradicional. Al compartir todos los componentes excepto las capas de atención, ofrece una comparación limpia y reproducible. El modelo se distribuye bajo licencia MIT, con pesos en formato safetensors y código personalizado que requiere `trust_remote_code=True`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas de atención de ventana deslizante (ventana 1024, RoPE theta 10000) + 6 capas de atención completa (sin RoPE) en posiciones 3, 7, 11, 15, 19, 23 |
| Parámetros totales | 366.265.344 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens (secuencia de entrenamiento); evaluación de recuperación hasta 32K |
| Tipos de cuantización | bf16 (pesos nativos); sin cuantizaciones adicionales publicadas |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida de 24 capas con tamaño de ocultación de 1024 y 6 cabezas de atención de dimensión 128 en las capas lineales (8 cabezas de 128 en las capas de atención). Las capas de atención completa no usan codificación posicional (NoPE), mientras que las capas de ventana deslizante usan RoPE con theta 10.000. Todas las capas de atención tienen una puerta de salida sigmoidea. La MLP es SwiGLU con tamaño intermedio de 2816, y los embeddings de entrada y salida están atados. El vocabulario procede del tokenizer de Llama-2 (32.000 tokens) y el token EOS es el id 2.

El entrenamiento se realizó sobre el dataset FineWeb-Edu tokenizado con Llama-2, con documentos empaquetados a 16.384 tokens sin enmascaramiento de documentos. Se usaron 15.000 millones de tokens en 9.536 pasos de optimizador, con un batch global de 1.572.864 tokens (96 secuencias de 16.384). El optimizador fue AdamW con LR pico de 8e-4, warmup de 1.5B tokens y un schedule warmup-stable-decay que comienza a decaer en 13.5B tokens. La precisión fue bf16. Para las capas lineales se emplearon los kernels chunk GDN2 de flash-linear-attention, y para las capas de atención flash-attn 2 (fa2) con ventana deslizante solo izquierda.

## Capacidades

- Generación de texto en inglés, con capacidad de completar pasajes y responder preguntas de sentido común.
- Comprensión de lenguaje y razonamiento básico, evaluado en ARC, HellaSwag, PIQA, Winogrande, BoolQ, OpenBookQA, SocialIQA y LAMBADA.
- Recuperación de información en contextos largos, evaluada con pruebas de needle retrieval (S-NIAH) que muestran una degradación suave más allá de la ventana de 1024 tokens, manteniendo un 94% de acierto a 8K y 32K en needle-1.
- No incluye soporte de tool calling / function calling (no documentado).
- No incluye capacidades multimodales (visión, audio) (no documentado).
- No incluye soporte para agentes o razonamiento multi-paso explícito (no documentado).

## Casos de uso

- Investigación en arquitecturas de atención eficiente: el modelo forma parte de una familia de cinco variantes idénticas salvo en el token mixer, lo que permite comparar de forma controlada el efecto de distintas estrategias de atención en contexto largo.
- Prototipado de aplicaciones con contexto largo en hardware limitado: con 366M parámetros en bf16 (0.7 GB), el modelo puede ejecutarse en una GPU de consumo como una RTX 3060 o RTX 4060, facilitando experimentos de recuperación de información sobre documentos de hasta 32K tokens.
- Evaluación de sistemas de recuperación sobre documentos extensos: se puede usar como modelo de generación para tareas de respuesta a preguntas basadas en pasajes largos, como las pruebas S-NIAH o SQuAD completion.
- Comparación de token mixers para investigación académica: al compartir el resto de componentes, sirve como referencia para publicar resultados de comparación de arquitecturas.
- Fine-tuning para tareas específicas de NLP con contexto largo: al ser un modelo pequeño, es viable ajustarlo en una sola GPU para tareas como clasificación de documentos largos o resumen.
- Enseñanza y demostración de conceptos de atención híbrida: puede utilizarse en cursos o talleres para ilustrar el funcionamiento de la atención de ventana deslizante y la atención completa en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU o HumanEval; la evaluación disponible se centra en tareas de comprensión y recuperación de contexto largo. Los datos siguientes proceden de la model card del autor, con una sola semilla y un umbral de ruido de aproximadamente 0.5 puntos.

| Métrica | hyb16-swa1k-s0 | hyb16-gdn2-s0 | hyb16-edm-s0 | hyb16-swa2k-s0 | hyb16-mix-s0 |
|---|---|---|---|---|---|
| Pérdida de validación final (nats) | 2.3245 | 2.3055 | 2.2977 | 2.3289 | 2.3156 |
| ARC easy / challenge | 57.0 / 25.0 | 59.4 / 26.1 | 59.7 / 25.2 | 55.0 / 25.0 | 57.1 / 25.1 |
| HellaSwag (acc_norm) | 40.7 | 41.5 | 42.0 | 40.8 | 41.5 |
| PIQA / Winogrande / BoolQ | 66.5 / 50.4 / 61.0 | 66.5 / 52.5 / 56.5 | 67.3 / 52.2 / 59.5 | 64.7 / 52.5 / 58.7 | 67.1 / 53.0 / 58.8 |
| LAMBADA acc / ppl | 33.4 / 37.4 | 35.5 / 29.9 | 35.9 / 28.2 | 37.4 / 29.3 | 34.6 / 31.5 |
| Needle-1 @32K | 0.94 | 1.00 | 1.00 | 0.05 | 0.05 |

## Requisitos de hardware

- Los pesos en bf16 ocupan aproximadamente 0.7 GB (366M × 2 bytes).
- VRAM estimada para inferencia: entre 1.5 y 3 GB, dependiendo de la longitud del contexto y del backend; para 16K tokens se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: RTX 3060 o RTX 4060 para experimentos básicos; A100 o H100 para evaluaciones a escala o con lotes grandes.
- El modelo requiere una GPU CUDA y no está soportado en CPU según la documentación.
- Opciones de despliegue: se puede cargar con transformers usando `trust_remote_code=True`. Requiere `flash-linear-attention` y `flash-attn` instalados. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (needle-1 @32K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hyb16-swa1k-s0 | 366M | 16.384 (eval hasta 32K) | 0.94 | MIT | HuggingFace |
| hyb16-gdn2-s0 | 366M | 16.384 (eval hasta 32K) | 1.00 | MIT | HuggingFace |
| hyb16-edm-s0 | 366M | 16.384 (eval hasta 32K) | 1.00 | MIT | HuggingFace |
| hyb16-swa2k-s0 | 366M | 16.384 (eval hasta 32K) | 0.05 | MIT | HuggingFace |

## Limitaciones y advertencias

- Modelo de investigación pequeño (366M) entrenado con 15B tokens; su rendimiento en tareas complejas es limitado en comparación con modelos de mayor escala.
- Entrenado exclusivamente con datos en inglés (FineWeb-Edu), por lo que su capacidad multilingüe es prácticamente nula.
- El código del modelo no está integrado en transformers; se carga con `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio. Se debe revisar antes de usar en producción.
- Requiere dependencias específicas (torch 2.10, transformers 5.14.1, flash-linear-attention 0.5.2, flash-attn 2.8.3, triton, einops) que pueden ser difíciles de instalar y no están incluidas en el paquete.
- No se han publicado cuantizaciones (int8, int4) ni versiones optimizadas para CPU o despliegue ligero.
- La evaluación se realizó con una sola semilla; las diferencias de menos de ~0.5 puntos en las métricas deben tratarse como ruido.
- La recuperación de información se degrada más allá de la ventana de 1024 tokens, especialmente con múltiples needles (needle-3 cae a 0.16 a 16K).
- Como cualquier modelo de lenguaje, puede generar alucinaciones y heredar sesgos presentes en el dataset de entrenamiento.
- La licencia MIT permite uso comercial, pero no hay garantías de seguridad ni soporte oficial.

## Enlaces

- HuggingFace: https://huggingface.co/Berlm/hyb16-swa1k-s0
- Modelos hermanos:
  - hyb16-gdn2-s0: https://huggingface.co/Berlm/hyb16-gdn2-s0
  - hyb16-edm-s0: https://huggingface.co/Berlm/hyb16-edm-s0
  - hyb16-swa2k-s0: https://huggingface.co/Berlm/hyb16-swa2k-s0
  - hyb16-mix-s0: https://huggingface.co/Berlm/hyb16-mix-s0
