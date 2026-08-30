# liodon-ai/gpt-neo-125m-FP8

## Resumen

Este modelo es una cuantización FP8 dinámica del GPT-Neo 125M de EleutherAI, publicada por Liodon AI. El objetivo es reducir el tamaño del modelo original (de 0,5 GB a 0,2 GB) y acelerar la inferencia en hardware compatible con FP8, manteniendo una fidelidad numérica alta gracias al esquema `FP8_DYNAMIC`, que no requiere dataset de calibración. Es relevante para despliegues en entornos con recursos limitados, como dispositivos edge o GPUs de gama media con soporte para FP8 (Ada, Hopper, Blackwell), donde el ahorro de memoria y la mayor velocidad de cómputo son críticos.

El modelo base, GPT-Neo 125M, es un transformer decoder-only de 125 millones de parámetros entrenado por EleutherAI sobre el corpus The Pile. Esta versión cuantizada mantiene la misma arquitectura y pesos, pero los convierte a FP8 (E4M3) por canal, dejando `lm_head` sin cuantizar para preservar la calidad de salida. La licencia se declara como "other", aunque el modelo base original se distribuye bajo MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-Neo, similar a GPT-3) |
| Parametros totales | 125.198.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base tiene 2048 tokens, pero no se especifica en esta versión) |
| Tipos de cuantizacion | FP8 dinámico (E4M3) por canal para pesos, activaciones dinámicas por token |
| Idiomas soportados | no disponible (el modelo base fue entrenado principalmente en inglés) |
| Licencia | other (modelo base: MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GPT-Neo 125M es un transformer autoregresivo con atención causal, diseñado para replicar la arquitectura de GPT-3 a escala reducida. Fue entrenado por EleutherAI sobre el dataset The Pile, un corpus diverso de texto en inglés y otros idiomas, con un total de aproximadamente 300 mil millones de tokens (dato del modelo base, no de esta cuantización). No se aplicaron técnicas de RLHF ni DPO en el entrenamiento original.

La cuantización FP8 se realizó con la librería `llm-compressor` del proyecto vLLM, usando el esquema `FP8_DYNAMIC`. En este esquema, los pesos se convierten a FP8 (E4M3) por canal de forma estática antes de la inferencia, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de ejecución. Al no requerir calibración, los pesos cuantizados son numéricamente equivalentes a un cast directo de los originales, lo que evita sesgos introducidos por datasets de calibración. La capa `lm_head` se deja sin cuantizar, práctica estándar por su tamaño despreciable y su impacto desproporcionado en la calidad si se cuantizara.

## Capacidades

- Generación de texto autoregresiva: produce texto coherente en inglés y, en menor medida, en otros idiomas presentes en The Pile.
- Razonamiento básico y completado de frases: útil para tareas de relleno de texto, clasificación ligera o generación de respuestas cortas.
- No soporta tool calling ni function calling de forma nativa, dado su tamaño reducido.
- No incluye modo de razonamiento explícito (thinking mode) ni capacidades multimodales (visión, audio).
- Capacidad multilingüe limitada: el entrenamiento en The Pile incluye algo de multilingüismo, pero el rendimiento fuera del inglés es pobre.
- Compatible con pipelines de Hugging Face Transformers para fine-tuning posterior en tareas específicas.

## Casos de uso

- Generación de texto en dispositivos edge: al ocupar solo 0,2 GB, puede ejecutarse en GPUs integradas o en placas como Jetson con soporte FP8, para generar descripciones, resúmenes o respuestas cortas en tiempo real.
- Prototipado rápido de aplicaciones de lenguaje: sirve como modelo de referencia para validar pipelines de generación antes de escalar a modelos mayores.
- Fine-tuning para clasificación de texto: su tamaño permite ajustarlo con pocos recursos en tareas como análisis de sentimiento o categorización de documentos, manteniendo una latencia baja.
- Educación e investigación: adecuado para experimentos de cuantización, comparación de esquemas FP8 o estudio de degradación de calidad en modelos pequeños.
- Asistentes conversacionales simples: puede gestionar diálogos de pocos turnos con contexto limitado, aunque su calidad es inferior a modelos más grandes.
- Pruebas de infraestructura de inferencia: ideal para validar despliegues con vLLM, TGI o SGLang en entornos de producción, gracias a su bajo coste de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K para esta versión cuantizada. Se recomienda consultar los benchmarks del modelo base EleutherAI/gpt-neo-125m para una referencia aproximada, aunque la cuantización FP8 puede introducir una degradación mínima (típicamente inferior al 1% en tareas estándar, según prácticas generales, pero no hay datos específicos aquí).

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,2 GB para los pesos en FP8, más overhead de activaciones y memoria de trabajo. En la práctica, cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: para ejecución FP8 nativa se requiere compute capability ≥ 8.9, es decir, GPUs Ada (RTX 40-series, L4, L40S), Hopper (H100, H200) o Blackwell (B100, B200, GB10). En GPUs más antiguas (Ampere, Turing), vLLM o TGI dequantizarán los pesos a FP16/BF16, perdiendo la ventaja de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve`), TGI (contenedor Docker), SGLang (`sglang.launch_server`), además de Hugging Face Transformers estándar.
- Latencia y throughput: no disponibles. Dado el tamaño de 125M, se espera una latencia de milisegundos por token en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Tamaño en disco |
|---|---|---|---|---|---|
| EleutherAI/gpt-neo-125m (base) | 125M | 2048 | FP32/FP16 | MIT | 0,5 GB |
| liodon-ai/gpt-neo-125m-FP8 (este) | 125M | no disponible | FP8 dinámico | other | 0,2 GB |
| EleutherAI/gpt-neo-1.3B (alternativa mayor) | 1,3B | 2048 | FP32/FP16 | MIT | ~5 GB |

La comparativa se limita al modelo base y a una variante mayor de la misma familia, ya que no se dispone de datos de otras cuantizaciones FP8 de modelos similares. La ventaja principal de esta versión es la reducción de memoria (60% menos) y la aceleración potencial en hardware FP8, a costa de una licencia menos permisiva ("other" frente a MIT).

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base fue entrenado en The Pile, que contiene sesgos socioculturales y lingüísticos; la cuantización no los corrige.
- Riesgo de alucinación: al ser un modelo pequeño, la generación puede ser incoherente o inventar hechos, especialmente en contextos largos.
- Limitaciones de contexto: la ventana de contexto no se especifica en esta versión, pero el modelo base tiene 2048 tokens; superar ese límite degrada la calidad.
- Restricciones de licencia: la licencia "other" puede implicar condiciones de uso específicas; se recomienda verificar los términos antes de uso comercial, a diferencia del modelo base que es MIT.
- Requisito de hardware: en GPUs sin soporte FP8 (compute capability < 8.9), la inferencia se ejecuta mediante dequantización, perdiendo los beneficios de velocidad y memoria.
- Sin garantías de rendimiento: al no haber benchmarks publicados, no se puede asegurar la calidad de salida en tareas específicas.

## Enlaces

- Modelo cuantizado: https://huggingface.co/liodon-ai/gpt-neo-125m-FP8
- Modelo base: https://huggingface.co/EleutherAI/gpt-neo-125m
- Página de GPT-Neo en EleutherAI: https://www.eleuther.ai/artifacts/gpt-neo
- Organización Liodon AI: https://huggingface.co/liodon-ai
- Repositorio llm-compressor: https://github.com/vllm-project/llm-compressor
