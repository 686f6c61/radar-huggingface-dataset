# SargeDev/Arete-27B-Uncensored-NVFP4-FP8

## Resumen

Arete-27B-Uncensored-NVFP4-FP8 es una cuantización en formato NVFP4 W4A4 con down_proj en FP8_DYNAMIC del modelo Arete-27B-Uncensored, una variante "abliterated" (sin mecanismos de rechazo) del modelo NousResearch/Arete-27B. El autor, SargeDev, aplicó la herramienta OBLITERATUS con método agresivo sobre el SFT de valores de Nous Research, que a su vez parte de la arquitectura Qwen3.8-27B. El resultado es un modelo de 21.171.101.568 parámetros reales (etiquetado comercialmente como 27B) empaquetado en compressed-tensors y servible directamente en vLLM.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de cuantización de precisión mixta (NVFP4 + FP8) que, según las mediciones del autor, mantiene la capacidad general del modelo en bf16 dentro del ruido estadístico: 79,8 % frente a 79,0 % en un subconjunto generativo de MMLU de 400 preguntas. Por otro, ilustra el ecosistema de variantes "uncensored" derivadas de modelos alineados, con las implicaciones técnicas y legales que ello conlleva.

El modelo conserva los tensores del drafter MTP/nextn de la arquitectura original, por lo que la decodificación especulativa sigue operativa. El repositorio ocupa 29,3 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8-27B), con cabecera MTP/nextn para decodificación especulativa |
| Parametros totales | 21.171.101.568 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 W4A4 con down_proj en FP8_DYNAMIC (compressed-tensors); el autor referencia también GGUF Q8_0 y EXL3 4.0bpw en la comparativa de formatos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |

## Arquitectura y entrenamiento

La base es NousResearch/Arete-27B, descrito por el autor como un SFT de ajuste completo (full-parameter) orientado a valores sobre Qwen3.8-27B. Sobre ese modelo, SargeDev aplicó OBLITERATUS con `--method aggressive` en bf16, usando un conjunto de contraste de 842 prompts de daño/inocuidad para calcular y ablacionar la dirección de rechazo en 15 capas consideradas fuertes (las capas 59-63 son las de mayor peso en la edición). Se trata, por tanto, de una abliteración por resta de dirección, no de un reentrenamiento.

Las puertas de calidad declaradas tras la edición son: coherencia 1.0, divergencia KL de 0,90 frente al base, y perplejidad que sube de 3,22 a 3,93 (incremento moderado). La suite de capacidades se mantiene intacta según el autor. Los tensores del drafter MTP/nextn se preservan con la cabecera estándar de Qwen3.8, de modo que la decodificación especulativa funciona. La cuantización posterior combina NVFP4 (4 bits en pesos y activaciones) con FP8 dinámico en la proyección descendente, empaquetada con compressed-tensors para su servicio en vLLM. No se detalla la composición del dataset de entrenamiento original ni el volumen de tokens.

## Capacidades

- Generación de texto y razonamiento general, con capacidad medida en MMLU (subconjunto generativo de 8 materias, 400 preguntas, 5-shot, greedy).
- Respuesta sin rechazos ante prompts de seguridad: la batería de cumplimiento de 15 prompts duros (desarrollo de exploits, red-team, malware, DoS) arroja 15/15 entregados en bf16.
- Decodificación especulativa mediante los tensores MTP/nextn conservados.
- Servicio compatible con vLLM en formato compressed-tensors.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.
- Visión, audio o modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA y red-teaming: el modelo permite estudiar el comportamiento de un sistema sin mecanismos de rechazo sobre prompts de malware, DoS o explotación, lo que facilita construir evaluaciones de robustez y calibración de clasificadores de seguridad frente a un generador deliberadamente permisivo.
- Análisis de sesgos y de direcciones de rechazo: al ser una abliteración documentada con métricas de KL y perplejidad, sirve como caso de estudio reproducible para medir cuánto cuesta en calidad la eliminación de la dirección de rechazo (~2 puntos de MMLU según el autor).
- Despliegue de alto rendimiento en vLLM: el formato NVFP4-FP8 ocupa 28 GB y se sirve directamente en vLLM con decodificación especulativa activa, adecuado para entornos donde se quiere maximizar throughput por GPU manteniendo la fidelidad del bf16 (79,8 % frente a 79,0 % en MMLU).
- Generación de contenido creativo sin filtros editoriales: escritura de ficción, guiones o material narrativo que aborde temas sensibles sin las interrupciones típicas de los modelos alineados, con la salvedad de revisión humana posterior.
- Evaluación comparativa de formatos de cuantización: el repositorio publica una tabla cruzada bf16 / NVFP4-FP8 / GGUF Q8_0 / EXL3 4.0bpw sobre el mismo subconjunto de MMLU, lo que lo convierte en un banco de pruebas útil para pipelines de cuantización.
- Base para ajuste fino posterior: al estar bajo Apache 2.0 y en safetensors, puede emplearse como punto de partida para SFT o DPO en dominios donde se requiera un modelo sin rechazos y con licencia permisiva.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. MMLU sobre subconjunto generativo de 8 materias, 400 preguntas, 5-shot, greedy, evaluado con lm-eval vía chat-completions salvo donde se indica.

| Formato | MMLU | Arnés |
|---|---|---|
| bf16 | 79,0 % | lm-eval chat-completions |
| NVFP4-FP8 (este repo) | 79,8 % | lm-eval chat-completions |
| GGUF Q8_0 | 79,0 % | lm-eval chat-completions vía llama-server |
| EXL3 4.0bpw | 72,5 % | motor exllamav3 (arnés propio) |
| Arete-27B original (referencia) | 81,25 % | lm-eval chat-completions |

El autor señala que la diferencia entre NVFP4-FP8 y bf16 es estadísticamente indistinguible (n=400, error estándar ~2 %), que la abliteración cuesta unos 2 puntos frente al base sin editar, y que la caída de EXL3 (6,5 puntos) está parcialmente contaminada por el cambio de arnés, por lo que debe tomarse como cota superior del coste de esa cuantización. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 28 GB en el formato NVFP4-FP8 según el autor, servible en vLLM.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el formato NVFP4-FP8 encaja en GPUs profesionales de 40-80 GB (A100 40/80 GB, H100) y en configuraciones multi-GPU consumer.
- GPU consumer: el formato de 28 GB no cabe en GPUs de 24 GB (RTX 4090, 3090) sin offloading o sin recurrir a otras cuantizaciones del mismo modelo (el autor referencia GGUF Q8_0 y EXL3 4.0bpw en su comparativa, con requisitos menores en el caso de EXL3).
- Opciones de despliegue: vLLM con compressed-tensors para el formato NVFP4-FP8; llama.cpp/llama-server para las variantes GGUF; exllamav3 para EXL3.
- Latencia y throughput: no disponibles. El autor solo menciona que la decodificación especulativa funciona gracias a los tensores MTP/nextn preservados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (subconjunto del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-Uncensored-NVFP4-FP8 | 21,17 B | No disponible | 79,8 % | Apache 2.0 | Hugging Face, formato compressed-tensors |
| NousResearch/Arete-27B (base sin abliterar) | ~21 B (no confirmado) | No disponible | 81,25 % | No disponible en la información | Hugging Face |
| Arete-27B-Uncensored-V2 | No disponible | No disponible | No disponible | No disponible | Hugging Face (referenciado por el autor) |
| Arete-27B-Uncensored (bf16) | ~21 B | No disponible | 79,0 % | Apache 2.0 | Hugging Face (referenciado por el autor) |

La comparativa se limita a la propia familia porque la información proporcionada no incluye datos de modelos de terceros con los que contrastar.

## Limitaciones y advertencias

- Ausencia deliberada de mecanismos de rechazo: el modelo entrega contenido dañino (malware, exploits, DoS) según la propia batería del autor. No es apto para despliegues orientados al público sin capas de moderación externas.
- Pérdida de calidad medible: la abliteración cuesta aproximadamente 2 puntos de MMLU frente al base sin editar (81,25 % → 79,0 % en bf16), con subida de perplejidad de 3,22 a 3,93.
- Riesgo de alucinación: no cuantificado en la información disponible; la edición de direcciones internas puede afectar a la calibración, por lo que se recomienda validación específica antes de uso en producción.
- Idiomas y contexto: no documentados. No se puede asumir el soporte multilingüe ni la ventana de contexto de la arquitectura original sin verificación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el cumplimiento normativo del contenido generado; la responsabilidad recae en el desplegador (regulación europea de IA, términos de servicio de plataformas, etc.).
- Formato específico: el NVFP4-FP8 requiere vLLM con soporte de compressed-tensors; no es portable a otros motores sin reconversión.
- Trazabilidad de benchmarks: las cifras de MMLU provienen de un subconjunto propio de 400 preguntas y no de la evaluación completa, y la comparación con EXL3 usa un arnés distinto, lo que limita la comparabilidad estricta.
- Existencia de una V2: el autor recomienda su variante V2 con entrenamiento de decisión Solar integrado, lo que sugiere que esta versión puede quedar obsoleta en cuanto a calidad factual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Arete-27B-Uncensored-NVFP4-FP8
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Variante V2 del autor: https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2
