# danivpv/Llama-ML-Expert-Instruct-1b

## Resumen

Llama-ML-Expert-Instruct-1b es un modelo de lenguaje pequeño (SLM) de 1.235 millones de parámetros, especializado en el dominio del aprendizaje automático. Ha sido desarrollado por danivpv mediante fine-tuning con adaptadores LoRA sobre el modelo base `unsloth/Llama-3.2-1B-bnb-4bit`, que a su vez es una versión cuantizada de Llama 3.2 de 1B. El modelo forma parte del pipeline LLM-ArXiv-Domain-Expert, que construye expertos de dominio a partir de artículos de ArXiv: parseo de papers, generación de datasets de instrucciones y preferencias, fine-tuning supervisado (SFT) y opcionalmente DPO.

Su relevancia radica en que ofrece razonamiento especializado en ML con un coste computacional muy reducido, apto para ejecutarse en hardware modesto. Está entrenado con instrucciones sintetizadas a partir de papers de ArXiv de ML y un subconjunto de FineTome-Alpaca-100k para preservar capacidades generales de seguimiento de instrucciones. El prompt sigue el formato Alpaca y el modelo está pensado para preguntas y respuestas cortas de dominio específico, no como un modelo generalista de razonamiento o contexto largo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2) con adaptadores LoRA |
| Parametros totales | 1.235.814.400 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea `max_seq_length=2048`) |
| Tipos de cuantizacion | 4-bit (bitsandbytes) según el ejemplo de uso; otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 de 1B, un transformer decoder estándar con atención causal. El fine-tuning se realizó con LoRA (rank 32, alpha 32, dropout 0.0) sobre los módulos `q_proj, k_proj, v_proj, up_proj, down_proj, o_proj, gate_proj`, usando el optimizador `adamw_8bit`. El entrenamiento se llevó a cabo con el dataset `danivpv/ml-arxiv-instruct`, que contiene pares instrucción-respuesta sintetizados a partir de artículos de ML de ArXiv, junto con un subconjunto de 10.000 muestras de `mlabonne/FineTome-Alpaca-100k` para mantener cierta capacidad general de seguir instrucciones. El formato de prompt es Alpaca (`### Instruction: ... ### Response: ...`). No se menciona el uso de RLHF o DPO en esta versión, aunque el pipeline asociado incluye la opción de DPO con el dataset `danivpv/ml-arxiv-dpo`.

## Capacidades

- Generación de texto y respuesta a instrucciones en el dominio del aprendizaje automático.
- Razonamiento especializado en conceptos de ML: explicaciones de algoritmos, arquitecturas, técnicas de entrenamiento, etc.
- Seguimiento de instrucciones en formato Alpaca, útil para tareas de Q&A cortas.
- Capacidad limitada de generalización fuera del dominio ML debido al tamaño reducido y al entrenamiento especializado.
- No soporta tool calling, ni visión, ni audio, ni modos de razonamiento extendido (thinking mode).
- Multilingüismo: solo inglés.

## Casos de uso

- Asistente de consulta técnica en ML: un desarrollador puede preguntar "¿qué es la regularización dropout?" y obtener una respuesta concisa y precisa, gracias al entrenamiento con papers de ArXiv.
- Generación de explicaciones de conceptos para documentación o material formativo: el modelo produce respuestas cortas y directas, adecuadas para glosarios o FAQs internas.
- Resumen de ideas clave de artículos de ML: al estar entrenado con instrucciones derivadas de ArXiv, puede resumir o aclarar puntos específicos de un paper si se le proporciona el contexto adecuado.
- Prototipado rápido de chatbots de dominio: su pequeño tamaño permite integrarlo en entornos con recursos limitados, como una Raspberry Pi o un servidor sin GPU dedicada.
- Filtrado o etiquetado de textos técnicos: puede clasificar o extraer información de fragmentos de documentación de ML, aunque con las limitaciones propias de un modelo de 1B.
- Educación y autoaprendizaje: estudiantes de ML pueden usarlo como tutor de bolsillo para resolver dudas puntuales sobre terminología o procedimientos estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización 4-bit, aproximadamente 1-2 GB, dependiendo de la longitud de la secuencia.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super) es suficiente. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Cabe en GPUs consumer de gama baja y en dispositivos con memoria unificada (Apple Silicon, etc.).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con la librería `unsloth` como se muestra en la model card.
- Latencia y throughput: no se han publicado mediciones oficiales; al ser un modelo de 1B, se espera una latencia baja (del orden de decenas de milisegundos por token en GPU moderna) y un throughput alto en comparación con modelos de mayor tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Llama-ML-Expert-Instruct-1b | 1,24B | No disponible (ejemplo 2048) | ML (ArXiv) | llama3.2 |
| Llama-3.2-1B-Instruct | 1,24B | 128k (según documentación oficial) | Generalista | llama3.2 |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | Generalista | Apache 2.0 |
| Phi-3-mini (3.8B) | 3,8B | 128k | Generalista | MIT |

La comparativa se basa en características públicas de los modelos; no se dispone de resultados de benchmarks comparativos en la información proporcionada. La principal diferencia de este modelo es su enfoque de dominio específico en ML, mientras que las alternativas son generalistas.

## Limitaciones y advertencias

- Modelo de solo 1B: no es adecuado para razonamiento complejo, tareas de contexto largo ni generación extensa; su rendimiento decae fuera del dominio ML.
- Entrenado con datos sintéticos generados por un LLM de mayor tamaño: hereda posibles sesgos, imprecisiones o lagunas del modelo generador.
- Solo soporta inglés; no hay capacidades multilingües.
- La longitud de contexto no está documentada explícitamente; el ejemplo de uso emplea 2048 tokens, por lo que no se recomienda superar ese límite en producción.
- Licencia llama3.2: permite uso comercial, pero debe revisarse el texto completo de la licencia para cumplir con las condiciones específicas (por ejemplo, atribución o restricciones de uso).
- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en tareas de ML no está validado externamente.
- El repositorio tiene un tamaño de 5.0 GB, lo que puede deberse a la inclusión de pesos en 4-bit y adaptadores; hay que considerar el espacio de almacenamiento al descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danivpv/Llama-ML-Expert-Instruct-1b
- Dataset de instrucciones (SFT): https://huggingface.co/datasets/danivpv/ml-arxiv-instruct
- Dataset de preferencias (DPO): https://huggingface.co/datasets/danivpv/ml-arxiv-dpo
- Código del pipeline: https://github.com/danivpv/LLM-ArXiv-Domain-Expert
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-bnb-4bit
- Dataset FineTome-Alpaca-100k: https://huggingface.co/datasets/mlabonne/FineTome-Alpaca-100k
