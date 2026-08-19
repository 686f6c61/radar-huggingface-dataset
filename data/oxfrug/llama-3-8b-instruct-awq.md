# oxfrug/Llama-3-8B-instruct-awq

## Resumen

`oxfrug/Llama-3-8B-instruct-awq` es una cuantización AWQ W4A16 asimétrica del modelo `AI-Sweden-Models/Llama-3-8B-instruct`, un fine-tune instruct de Llama-3-8B orientado a los idiomas nórdicos (sueco, danés y noruego) además del inglés. El modelo está empaquetado para su uso directo con vLLM y TGI, y utiliza el formato `compressed-tensors` generado con `llmcompressor`, no los archivos clásicos de AutoAWQ.

La relevancia de este modelo radica en que permite ejecutar un Llama-3-8B con capacidades multilingües nórdicas en hardware moderado, reduciendo los requisitos de memoria a aproximadamente 4-5 GB para los pesos. Es una opción práctica para equipos que necesitan desplegar asistentes o generadores de texto en sueco, danés o noruego sin sacrificar demasiada calidad respecto al modelo BF16 original.

El repositorio incluye únicamente los pesos cuantizados en formato `safetensors` (5,7 GB), con `lm_head` en mayor precisión. El autor también publica una variante EXL2 en un repositorio hermano. No se proporcionan resultados de benchmarks formales, solo una prueba de humo con dos prompts.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3 (transformer decoder-only) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo base Llama-3-8B: 8.192 tokens) |
| Tipos de cuantizacion | AWQ W4A16 asimétrica (compressed-tensors) |
| Idiomas soportados | Sueco (sv), danés (da), noruego (no), inglés (en) |
| Licencia | Meta Llama 3 Community License |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `AI-Sweden-Models/Llama-3-8B-instruct` es un fine-tune instruct de Llama-3-8B realizado por AI Sweden, con un sesgo marcado hacia el sueco y los idiomas nórdicos. La cuantización AWQ W4A16 asimétrica se aplicó con `llmcompressor` usando los modificadores `AWQModifier` y `QuantizationModifier(scheme="W4A16_ASYM")`. La calibración se realizó con 256 filas de 512 tokens extraídos de una mezcla de artículos de Wikipedia en nórdico e inglés, con un peso especial en sueco (`sv_heavy.rows.jsonl`), y se ejecutó en una RTX 3090. El `lm_head` se mantuvo en mayor precisión para preservar la calidad de la generación. No se menciona el uso de RLHF ni DPO en el proceso de cuantización, ya que es una transformación posterior al fine-tune.

## Capacidades

- Generación de texto instructivo en sueco, danés, noruego e inglés.
- Razonamiento básico y respuesta a preguntas heredado del fine-tune instruct de AI Sweden.
- Preferencia por respuestas en sueco incluso cuando el prompt está en inglés, como se observa en la prueba de humo.
- Soporte para inferencia eficiente con vLLM y TGI gracias al formato compressed-tensors.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Atención al cliente automatizada en países nórdicos: el modelo puede gestionar conversaciones en sueco, danés o noruego con un tono natural, reduciendo la necesidad de equipos humanos multilingües. Su tamaño compacto permite desplegarlo en infraestructura moderada.
- Generación de contenido localizado: redacción de artículos, descripciones de producto o correos electrónicos en idiomas nórdicos, aprovechando el sesgo lingüístico del modelo hacia esas lenguas.
- Traducción y adaptación lingüística: aunque no es un modelo de traducción dedicado, puede reformular o traducir texto entre inglés y los idiomas nórdicos en contextos informales.
- Asistentes virtuales para administraciones públicas o empresas escandinavas: el modelo responde en sueco de forma preferente, lo que facilita su integración en chatbots gubernamentales o de servicios.
- Procesamiento de documentos y resúmenes en nórdico: puede resumir actas, informes o noticias en sueco, danés o noruego, siempre que el contexto no supere el límite del modelo base.
- Prototipado rápido de aplicaciones de lenguaje natural en entornos con recursos limitados: al ser una cuantización 4-bit, cabe en GPUs de consumo, permitiendo pruebas locales antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo incluye una prueba de humo (greedy decoding) con dos prompts:

| Prompt | Salida |
|---|---|
| `Vad heter Sveriges huvudstad? Ett ord.` | `Huvudstaden i Sverige är Stockholm.` |
| `Name the capital of Sweden in one word.` | `Huvudstaden i Sverige är Stockholm.` |

Estos resultados no constituyen una evaluación formal y no deben usarse como referencia de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización W4A16, los pesos ocupan aproximadamente 4-5 GB. Sumando la caché KV y overhead del runtime, se recomienda un mínimo de 8 GB de VRAM para secuencias cortas.
- GPU recomendadas: RTX 3090 (usada por el autor para calibración), RTX 4070/4080, A100 o H100 para producción con mayor concurrencia.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 8 GB (RTX 3060, RTX 3070, RTX 4060 Ti) y con holgura en 12 GB o más.
- Opciones de despliegue: vLLM (recomendado, formato compressed-tensors), TGI, y conversión a GGUF para usar con llama.cpp u Ollama (no incluida en este repositorio).
- Latencia y throughput: no disponible en la información proporcionada. En una RTX 3090 se puede esperar un throughput del orden de 50-100 tokens/s para generación, pero es una estimación no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| oxfrug/Llama-3-8B-instruct-awq | 8B | AWQ W4A16 | no disponible (base 8K) | sv, da, no, en | Meta Llama 3 |
| AI-Sweden-Models/Llama-3-8B-instruct (base) | 8B | BF16 | 8K | sv, da, no, en | Meta Llama 3 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | BF16 | 8K | principalmente en | Meta Llama 3 |

La diferencia principal frente al modelo base es el tamaño en disco y VRAM (5,7 GB frente a ~16 GB en BF16) y la pérdida de calidad asociada a la cuantización 4-bit, que no está cuantificada aquí. Frente al Llama-3-8B-Instruct original, este modelo añade competencia en idiomas nórdicos, pero hereda el mismo contexto limitado de 8K.

## Limitaciones y advertencias

- Sesgos lingüísticos: el modelo muestra una clara preferencia por el sueco, incluso cuando el prompt está en inglés, lo que puede ser inapropiado para aplicaciones donde se espera inglés puro.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en temas de actualidad o datos específicos.
- Contexto limitado: el modelo base Llama-3-8B tiene una ventana de 8.192 tokens, y no se ha ampliado en esta cuantización. No es adecuado para documentos largos o conversaciones de muchos turnos.
- Sin benchmarks formales: no hay evidencia pública de rendimiento en tareas estándar (MMLU, HumanEval, etc.), por lo que la calidad relativa frente a otros modelos es incierta.
- Licencia: la Meta Llama 3 Community License permite uso comercial, pero exige incluir el aviso `NOTICE` y cumplir las condiciones de atribución. Derivados del modelo deben mantener la misma licencia.
- Formato específico: los archivos usan `compressed-tensors`, no son compatibles con AutoAWQ clásico; requieren vLLM o TGI con soporte para este formato.

## Enlaces

- Repositorio HuggingFace: [oxfrug/Llama-3-8B-instruct-awq](https://huggingface.co/oxfrug/Llama-3-8B-instruct-awq)
- Variante EXL2: [oxfrug/Llama-3-8B-instruct-exl2](https://huggingface.co/oxfrug/Llama-3-8B-instruct-exl2)
- Dataset de evaluación (no usar para entrenamiento): [oxfrug/nordic-instruct-eval-v2](https://huggingface.co/datasets/oxfrug/nordic-instruct-eval-v2)
- Modelo base: [AI-Sweden-Models/Llama-3-8B-instruct](https://huggingface.co/AI-Sweden-Models/Llama-3-8B-instruct)
- Herramienta de cuantización: [llmcompressor](https://github.com/vllm-project/llm-compressor)
