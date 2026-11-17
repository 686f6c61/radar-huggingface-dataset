# Raghav-Singhal/1pp-0.58b-v2-filt-seed1234-base

## Resumen

`1pp-0.58b-v2-filt-seed1234-base` es un modelo de lenguaje de tipo decoder-only, con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general: su función es servir como baseline "filtrado" dentro de una escalera de escalado que compara distintas condiciones de preentrenamiento sobre el mismo corpus.

El modelo cuenta con 580.445.568 parámetros (0,58B) y una longitud de contexto de 4.096 tokens. Su particularidad no reside en la arquitectura, sino en el régimen de entrenamiento: reproduce paso a paso el flujo de datos del modelo "raw" equivalente, pero elimina la función de pérdida sobre los documentos marcados por un clasificador de seguridad basado en gte, que señaló 3.869.498 documentos (el 4,6% del corpus). Los documentos señalados permanecen en las secuencias como contexto, pero no contribuyen al gradiente.

Es relevante ahora porque permite aislar el efecto del filtrado de datos de seguridad sobre el rendimiento lingüístico, manteniendo constante todo lo demás (orden de documentos, número de pasos, schedule, hiperparámetros). Es, por tanto, una pieza de comparación para investigadores que estudian calidad y filtrado de corpus, y no un modelo pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos están en safetensors en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder Transformer estándar de tipo Llama: 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención con 3 KV heads (atención agrupada, head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre 11.106 pasos sobre el flujo de datos alineado por pasos del modelo raw, lo que equivale a 23,29B posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) para los parámetros matriciales y Adam para el resto (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100; weight decay 0,1; std de inicialización 0,0119; entrenamiento en bf16. La innovación metodológica es el filtrado con pérdida enmascarada: un clasificador de seguridad basado en gte, puntuado por fragmentos, marcó 3.869.498 documentos (4,6%) cuyo fragmento de mayor puntuación alcanza al menos 3; esos documentos se mantienen en contexto pero no reciben gradiente, mientras que el resto se entrena igual que en el run raw. El empaquetado de datos es idéntico byte a byte al del run raw.

## Capacidades

- Generación de texto autoregresiva en inglés, propia de un modelo base sin ajuste por instrucciones ni por preferencias.
- Modelado de lenguaje y continuación de documentos; no está entrenado para seguir instrucciones ni para mantener un rol de asistente.
- Formato de chat ChatML sin turno de sistema: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`, con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Uso como referencia de evaluación: permite medir el efecto del filtrado de seguridad sobre la pérdida de validación en documentos y en conversaciones derivadas de ellos.

## Casos de uso

- Investigación sobre filtrado de datos: comparar la pérdida de validación de este checkpoint con la del modelo raw (`1pp-0.58b-v2-raw-seed1234-base`) para cuantificar el coste o beneficio de excluir el 4,6% de documentos marcados por el clasificador de seguridad.
- Estudio de escalado de modelos pequeños: usar el checkpoint como escalón de 0,58B dentro de la escalera 1PP y extrapolar curvas de pérdida frente a tamaño y tokens vistos (23,29B posiciones).
- Reproducibilidad de pipelines de preentrenamiento: servir como referencia verificada, ya que el autor comprobó los pesos de HF contra el checkpoint de Megatron con diferencias absolutas de pérdida de 0,0019 y 0,0018 en dos conjuntos de validación.
- Análisis de sesgos y seguridad de corpus: examinar qué tipo de documentos señala el clasificador gte y cómo su exclusión de la pérdida afecta a la distribución generada por el modelo.
- Experimentos de enmascaramiento de pérdida: estudiar técnicas de entrenamiento con pérdida selectiva sobre subconjuntos de documentos, usando este modelo como control frente a variantes SPP{T0}.
- Evaluación de tokenizadores y arquitecturas: emplear el vocabulario de SmolLM2 y la configuración Llama de 24 capas como base controlada en experimentos de ablación a pequeña escala.
- Generación de texto de dominio general en inglés para pruebas internas de infraestructura (vLLM, TGI) sin requisitos de calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta pérdidas de validación del checkpoint final (por token, sobre 2.433 documentos reservados y las conversaciones reescritas a partir de ellos):

| Conjunto | Pérdida de validación |
|---|---|
| Texto de documento | 2,626 |
| Texto de asistente | 2,806 |
| Texto de usuario | 2,816 |

Verificación de los pesos de HF frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,8042 | 2,8061 | 0,0019 |
| raw_val50m segments [8] | 2,6274 | 2,6256 | 0,0018 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 580M parámetros ocupan aproximadamente 1,16 GB de pesos; con caché KV y overhead de runtime, el consumo se sitúa en torno a 2-3 GB para contextos de 4.096 tokens. En cuantización de 8 bits, alrededor de 0,6 GB de pesos; en 4 bits, alrededor de 0,3 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en bf16; para despliegue con vLLM o TGI se recomienda una GPU de datacenter (A100, H100, L40S) por throughput, aunque no es necesario para el tamaño del modelo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y GPUs integradas con suficiente memoria compartida mediante llama.cpp.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el tag `text-generation-inference` figura en el repo), endpoints compatibles, y previsiblemente llama.cpp/Ollama tras conversión a GGUF, aunque el autor no publica artefactos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-filt-seed1234-base | 580M | 4.096 | Apache 2.0 | Hugging Face | Baseline filtrado del proyecto 1PP |
| 1pp-0.58b-v2-raw-seed1234-base | 580M | 4.096 | Apache 2.0 | Hugging Face | Mismo run sin filtrado; control directo |
| SmolLM2-360M (referencia de tokenizador) | 360M | 8.192 | Apache 2.0 | Hugging Face | Modelo pequeño de propósito general; comparte vocabulario de 49.152 tokens |
| Modelos de ~0,5B de propósito general | ~500M | variable | variable | Hugging Face | No se dispone de datos de benchmarks comparables en la información proporcionada |

La comparación con alternativas de propósito general no puede establecerse con rigor porque el autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K) y el modelo es un artefacto de investigación sin ajuste instructivo.

## Limitaciones y advertencias

- No es un asistente de propósito general: es un modelo base entrenado sobre documentos y produce texto plano; no sigue instrucciones de forma fiable.
- Solo inglés; no se ha validado su comportamiento en otros idiomas.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para casos de contexto largo.
- Riesgo de alucinación y de reproducción de sesgos presentes en el corpus DCLM-edu, atenuado parcialmente por el filtrado de seguridad pero no eliminado.
- El filtrado solo excluye la pérdida sobre el 4,6% de documentos marcados; dichos documentos siguen presentes como contexto, por lo que pueden influir en las representaciones aprendidas.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara explícitamente que es un artefacto de investigación y no un modelo listo para producción.
- Sin datos publicados de benchmarks estándar, evaluación de seguridad posterior al entrenamiento ni ajuste por preferencias (RLHF/DPO); no se recomienda su uso en aplicaciones de cara al usuario sin una evaluación adicional.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-filt-seed1234-base
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
