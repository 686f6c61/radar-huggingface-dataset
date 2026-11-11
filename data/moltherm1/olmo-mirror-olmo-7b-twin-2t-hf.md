# moltherm1/olmo-mirror-olmo-7b-twin-2t-hf

## Resumen

OLMo 7B Twin 2T es un modelo de lenguaje autoregresivo de tipo Transformer desarrollado por el Allen Institute for AI (AI2) dentro de la familia OLMo (Open Language Models). Esta ficha concreta corresponde a la réplica publicada por el usuario `moltherm1` en Hugging Face, que es una conversión al formato nativo de Transformers del checkpoint original `allenai/OLMo-7B-Twin-2T`. El modelo se entrenó sobre el corpus Dolma y forma parte del esfuerzo de AI2 por liberar de forma completamente abierta código, checkpoints, logs y datos de entrenamiento, con el objetivo de facilitar la investigación reproducible sobre modelos de lenguaje.

La variante "Twin 2T" se distingue del OLMo 7B estándar en el número de tokens de entrenamiento: 2 billones (2T) en lugar de 2,5 billones, manteniendo la misma arquitectura de 32 capas, dimensión oculta de 4096 y 32 cabezas de atención. El modelo tiene aproximadamente 6.900 millones de parámetros y una longitud de contexto de 2048 tokens, lo que lo sitúa en la gama de modelos de 7B con ventana de contexto corta según los estándares actuales.

Su relevancia radica en su carácter totalmente abierto: pesos, datos y receta de entrenamiento están disponibles bajo licencia Apache 2.0, lo que permite inspección, replicación y ajuste fino sin restricciones comerciales. No obstante, es un modelo base sin ajuste por instrucciones ni alineación por RLHF, por lo que su uso directo en producción requiere un post-entrenamiento adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (decoder-only) |
| Parametros totales | ~6.900 millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | int8 mediante bitsandbytes; fp16; no se documentan otros formatos en la informacion disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (conversion a formato Hugging Face Transformers); checkpoint original en formato nativo de OLMo |
| Capas | 32 |
| Dimension oculta | 4096 |
| Cabezas de atencion | 32 |
| Tokens de entrenamiento | 2 billones (2T) |
| Dataset | allenai/dolma |
| Fecha de corte de datos | febrero/marzo de 2023 (segun version de Dolma) |

## Arquitectura y entrenamiento

OLMo 7B Twin 2T emplea una arquitectura Transformer decoder-only estándar con 32 capas, dimensión oculta de 4096 y 32 cabezas de atención. No utiliza mezcla de expertos (MoE) ni mecanismos de atención lineal o arquitecturas híbridas SSM; se trata de un transformer denso convencional. El modelo se entrenó sobre el dataset Dolma, un corpus abierto de aproximadamente 3 billones de tokens procedente de web, libros, papers, código y contenido enciclopédico, del cual esta variante consumió 2 billones de tokens. La fecha de corte de los datos se sitúa en febrero o marzo de 2023 según la versión de Dolma empleada.

El entrenamiento se realizó desde cero, sin destilación ni inicialización a partir de otros modelos, y AI2 publicó checkpoints intermedios cada 1000 pasos de entrenamiento, lo que permite estudiar la evolución del modelo durante el preentrenamiento. No se aplicó RLHF ni DPO en esta variante base; se trata de un modelo de continuación de texto sin alineación por preferencias. La conversión al formato Transformers la realizó el usuario `moltherm1`, no AI2, y el modelo original no soporta directamente los procesos de ajuste fino de AI2, que recomiendan partir del checkpoint nativo `allenai/OLMo-7B-Twin-2T`.

## Capacidades

- Generación de texto autoregresiva en inglés: continuación de texto, redacción y modelado de lenguaje general.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por la ausencia de ajuste por instrucciones.
- Generación de código y matemáticas a nivel de modelo base, sin entrenamiento específico documentado para estas tareas.
- No dispone de soporte nativo de tool calling ni function calling.
- No incorpora capacidades de agente ni razonamiento multi-paso alineado; cualquier flujo de este tipo requiere post-entrenamiento.
- Capacidades multilingües limitadas al inglés, según la model card.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Al ser un modelo base, responde mejor a continuación de texto que a instrucciones directas.

## Casos de uso

- Investigación sobre preentrenamiento: el modelo y sus checkpoints intermedios permiten estudiar la dinámica de entrenamiento, la evolución de las capacidades y la reproducibilidad de recetas abiertas, gracias a la publicación de logs y datos.
- Ajuste fino supervisado (SFT) para dominios concretos: al ser un modelo base Apache 2.0, se puede adaptar con datasets propios de atención al cliente, documentación técnica o texto legal, partiendo de los 2T tokens de preentrenamiento como base lingüística.
- Generación de texto en pipelines de contenido: continuación y redacción asistida en inglés para borradores, resúmenes o descripciones, usando la API de Transformers o vLLM para servir el modelo.
- Experimentación académica con cuantización: la model card documenta la carga en int8 con bitsandbytes, lo que facilita reproducir experimentos de eficiencia en GPUs de gama media.
- Base para investigación de alineación: al no tener RLHF, sirve como punto de partida controlado para comparar técnicas de alineación (DPO, RLHF) frente a modelos ya alineados.
- Evaluación comparativa de modelos abiertos: sus resultados en benchmarks como ARC, HellaSwag o PIQA permiten contrastar recetas de entrenamiento abiertas frente a modelos cerrados de tamaño similar.
- Fine-tuning con Open-Instruct: el ecosistema de AI2 (repositorio open-instruct) permite aplicar recetas de instrucción sobre la familia OLMo para convertir el modelo base en un asistente.

## Benchmarks y rendimiento

Resultados publicados en la model card para el OLMo 7B (modelo base de la familia):

| Benchmark | Llama 7B | Llama 2 7B | Falcon 7B | MPT 7B | OLMo 7B |
|---|---|---|---|---|---|
| arc_challenge | 44.5 | 39.8 | 47.5 | 46.5 | 48.5 |
| arc_easy | 57.0 | 57.7 | 70.4 | 70.5 | 65.4 |
| boolq | 73.1 | 73.5 | 74.6 | 74.2 | 73.4 |
| copa | 85.0 | 87.0 | 86.0 | 85.0 | 90.0 |
| hellaswag | 74.5 | 74.5 | 75.9 | 77.6 | 76.4 |
| openbookqa | 49.8 | 48.4 | 53.0 | 48.6 | 50.2 |
| piqa | 76.3 | 76.4 | 78.5 | 77.3 | 78.4 |

No se han publicado resultados específicos para la variante Twin 2T en la información disponible; los datos anteriores corresponden al OLMo 7B de la familia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14 GB para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 16-18 GB.
- VRAM estimada en int8 (bitsandbytes): alrededor de 7-8 GB para los pesos, con margen adicional para el contexto.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090 (24 GB) también es suficiente en fp16.
- Cabe en GPUs de consumo: sí, en RTX 4090, RTX 3090 y RTX 4080 (16 GB) con cuantización int8; en fp16 requiere al menos 16 GB.
- Opciones de despliegue: Transformers (con `AutoModelForCausalLM`), vLLM para serving de alto throughput, TGI; llama.cpp y Ollama no están documentados en la información disponible para este checkpoint concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OLMo 7B Twin 2T | ~7B | 2048 | Apache 2.0 | Pesos y datos abiertos | Entrenado con 2T tokens de Dolma; sin RLHF |
| OLMo 7B | ~7B | 2048 | Apache 2.0 | Pesos y datos abiertos | Entrenado con 2,5T tokens de Dolma |
| Llama 7B | ~7B | 2048 | Licencia Meta (no comercial en origen) | Pesos disponibles | Referencia en benchmarks de la model card |
| Llama 2 7B | ~7B | 4096 | Licencia Meta | Pesos disponibles | Contexto mayor; requiere aceptación de términos |
| Falcon 7B | ~7B | 2048 | Apache 2.0 (versión base) | Pesos abiertos | Buen rendimiento en ARC-easy según la tabla |
| MPT 7B | ~7B | 2048 (ampliable) | Apache 2.0 | Pesos abiertos | Entrenado con 1T tokens |

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones de forma fiable ni rechaza peticiones dañinas; requiere SFT y alineación antes de uso en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin RLHF ni verificación factual.
- Sesgos presentes en el corpus Dolma (web, libros, papers), no mitigados mediante técnicas de alineación.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Solo inglés; no se documenta soporte multilingüe.
- Fecha de corte de datos en febrero/marzo de 2023: no conoce eventos posteriores.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para uso directo sin post-entrenamiento.
- Esta réplica concreta (`moltherm1/olmo-mirror-olmo-7b-twin-2t-hf`) no está mantenida por AI2; la model card indica que el ajuste fino debe hacerse desde el checkpoint nativo `allenai/OLMo-7B-Twin-2T`.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni garantías de mantenimiento.

## Enlaces

- Hugging Face (réplica): https://huggingface.co/moltherm1/olmo-mirror-olmo-7b-twin-2t-hf
- Modelo original en Hugging Face: https://huggingface.co/allenai/OLMo-7B-Twin-2T
- Versión HF oficial: https://huggingface.co/allenai/OLMo-7B-Twin-2T-hf
- OLMo 7B en Hugging Face: https://huggingface.co/allenai/OLMo-7B-hf
- OLMo 1B en Hugging Face: https://huggingface.co/allenai/OLMo-1B-hf
- Dataset Dolma: https://huggingface.co/datasets/allenai/dolma
- Página del proyecto: https://allenai.org/olmo
- Repositorio principal (entrenamiento, inferencia, fine-tuning): https://github.com/allenai/OLMo
- Código de evaluación: https://github.com/allenai/OLMo-Eval
- Código de ajuste fino: https://github.com/allenai/open-instruct
- Paper: https://arxiv.org/abs/2402.00838
- Paper de Llama (referencia): https://arxiv.org/abs/2302.13971
- Blog técnico: https://blog.allenai.org/olmo-open-language-model-87ccfc95f580
- Logs de W&B: https://wandb.ai/ai2-llm/OLMo-7B/reports/OLMo-7B-Twin-2T--Vmlldzo2NzU0NTIz
