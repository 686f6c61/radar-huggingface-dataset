# dientc1501/mammoth-1-FP8

## Resumen

mammoth-1-FP8 es la versión cuantizada en FP8 del modelo baselabs/mammoth-1, un modelo de decisión de 27.000 millones de parámetros desarrollado por Base Labs en Baseten mediante post-entrenamiento sobre Qwen3.5-27B. El modelo original está diseñado para tareas de clasificación y toma de decisiones estructuradas, no para generación de texto libre, y esta variante FP8 busca reducir los requisitos de memoria para su despliegue en producción.

La cuantización ha sido realizada por el usuario dientc1501 usando llm-compressor con el esquema FP8_DYNAMIC: pesos en FP8 E4M3 con escala estática por canal y activaciones en FP8 con escala dinámica por token, sin necesidad de datos de calibración. El resultado reduce el tamaño del repositorio de aproximadamente 54,7 GB en bf16 a unos 30,4 GB, manteniendo el codificador de visión, el lm_head, las proyecciones in_proj_a/in_proj_b de la atención lineal, los embeddings y las normas en bf16.

Es relevante ahora porque permite ejecutar un modelo multimodal de 27B con capacidades de decisión en GPUs con tensor cores FP8 nativos (Hopper y Blackwell) con una huella de memoria notablemente menor, manteniendo una fidelidad numérica razonable según la prueba de humo incluida en la model card. La licencia MIT del modelo base facilita su uso comercial, aunque el pipeline declarado es text-classification y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5-27B (atención completa + atención lineal gated-delta), con codificador de visión |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 16.384 tokens (valor usado en el ejemplo de despliegue con vLLM; no se especifica el máximo oficial) |
| Tipos de cuantizacion | FP8 (E4M3) dinámica por token en activaciones y estática por canal en pesos; componentes en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors con formato compressed-tensors (compatible con vLLM y transformers) |

## Arquitectura y entrenamiento

El modelo base mammoth-1 es un modelo de decisión post-entrenado a partir de Qwen3.5-27B por Base Labs en Baseten. La arquitectura subyacente es un transformer multimodal que combina capas de atención completa con capas de atención lineal gated-delta, e incorpora un codificador de visión para entrada image-text-to-text. El modelo incluye un mecanismo de lectura denominado slot_lm, que lee directamente los logits del lm_head para producir decisiones sobre letras de slot (A/B/C en la prueba de humo). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

Esta variante FP8 ha sido producida con llm-compressor aplicando el esquema FP8_DYNAMIC a todas las capas Linear del modelo de lenguaje, incluyendo las proyecciones de atención completa, atención lineal gated-delta y MLP. Se mantienen en bf16 el lm_head, el codificador de visión completo, las proyecciones linear_attn.in_proj_a e in_proj_b, los embeddings y las normas. La cuantización no requiere datos de calibración. Los ficheros readout.json, engine.py, setup.sh y serve.patch se copian sin cambios del repositorio original; para usar el runtime OneJev original es necesario instalar adicionalmente compressed-tensors.

## Capacidades

- Clasificación de texto y toma de decisiones estructuradas mediante lectura de logits sobre slots (pipeline text-classification).
- Procesamiento multimodal image-text-to-text gracias al codificador de visión incluido.
- Razonamiento de decisión sobre opciones discretas (prueba de humo con letras A/B/C).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Clasificación automática de documentos: el modelo puede asignar categorías discretas a textos de entrada aprovechando su naturaleza de modelo de decisión y su ventana de contexto de 16.384 tokens para documentos de longitud media.
- Enrutamiento de tickets de soporte: dado un mensaje de usuario en inglés, el modelo puede decidir entre categorías predefinidas (por ejemplo, facturación, técnico, cuenta) mediante el mecanismo de slots, integrándose en un pipeline de atención al cliente.
- Moderación de contenido con criterios múltiples: el modelo puede evaluar textos o pares imagen-texto y emitir una decisión categórica sobre su adecuación, usando el codificador de visión para contenido visual.
- Verificación de respuestas en pipelines RAG: el modelo puede actuar como juez de decisión para validar si una respuesta generada por otro modelo es correcta, incorrecta o ambigua, aprovechando su formato de salida por slots.
- Clasificación de imágenes con contexto textual: al ser image-text-to-text, puede recibir una imagen junto con una pregunta y decidir entre opciones, útil en inspección visual o triaje de imágenes.
- Despliegue en producción con vLLM en GPUs Hopper o Blackwell: la versión FP8 reduce la huella a unos 30,4 GB, permitiendo servir el modelo en una sola GPU H100 o B200 con tensor cores FP8 y menor coste de memoria que la versión bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente una prueba de humo comparando bf16 frente a FP8 en la softmax sobre letras de slot A/B/C en la posición de respuesta:

| Sonda | bf16 | FP8 | Diferencia absoluta máxima | KL (vocabulario completo) |
|---|---|---|---|---|
| 0 | [0.9902, 0.0077, 0.0022] | [0.9872, 0.01, 0.0028] | 0.003 | 0.004 |
| 1 | [0.0403, 0.9452, 0.0146] | [0.0557, 0.928, 0.0162] | 0.0171 | 0.00507 |
| 2 | [0.0349, 0.0652, 0.8999] | [0.0303, 0.0566, 0.9131] | 0.0132 | 0.00585 |

El autor advierte que se trata de una prueba de humo rápida, no de una repetición de benchmarks, y recomienda evaluar sobre la carga de decisión propia antes de confiar en la calibración.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30,4 GB de pesos en FP8, más overhead de activaciones y caché KV; se recomienda al menos 40-48 GB de VRAM para contexto de 16.384 tokens.
- GPU recomendadas: H100, H200 y B200 (tensor cores FP8 nativos, según indica la model card para Hopper/Blackwell).
- GPU de consumo: no cabe en RTX 4090 (24 GB) con los pesos completos en FP8; se requeriría cuantización adicional o descarga por capas, no documentada en la información disponible.
- Opciones de despliegue: vLLM (`vllm serve <this-repo> --max-model-len 16384`), transformers con `pip install compressed-tensors`, y el runtime OneJev original instalando además compressed-tensors.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mammoth-1-FP8 | 27,36 B | 16.384 (usado en ejemplo) | FP8 compressed-tensors | MIT | Hugging Face |
| baselabs/mammoth-1 (bf16) | 27,36 B | no disponible | bf16 safetensors | MIT | Hugging Face |
| Qwen3.5-27B (modelo base del que deriva) | 27 B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a tamaño, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al derivar de Qwen3.5-27B hereda los sesgos del modelo base, no documentados aquí.
- Riesgo de alucinación: el modelo está orientado a decisión y clasificación, no a generación de texto libre; su uso fuera de ese dominio no está validado.
- Limitaciones de contexto e idioma: solo inglés declarado; la longitud máxima de contexto no se especifica más allá del valor usado en el ejemplo de vLLM (16.384).
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero se recomienda revisar la licencia del modelo base baselabs/mammoth-1 y de Qwen3.5-27B por posibles condiciones adicionales.
- La cuantización FP8 puede degradar ligeramente las probabilidades de decisión; la prueba de humo muestra diferencias de hasta 0,0171 en probabilidades y KL de hasta 0,00585, por lo que conviene validar sobre la carga propia.
- El pipeline declarado es text-classification, aunque el modelo es multimodal; verificar la integración con el runtime OneJev y los ficheros auxiliares (readout.json, engine.py, setup.sh, serve.patch) antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dientc1501/mammoth-1-FP8
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- llm-compressor: https://github.com/vllm-project/llm-compressor
