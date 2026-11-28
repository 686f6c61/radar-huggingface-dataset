# sehandi/gpt2-reuters-from-scratch

## Resumen

`sehandi/gpt2-reuters-from-scratch` es una implementación de GPT-2 de tipo small entrenada desde cero (inicialización aleatoria, sin pesos preentrenados) sobre el conjunto de artículos de Reuters `ingeniumacademy/reuters_articles`. Lo desarrolla el usuario de Hugging Face `sehandi` en el contexto de la asignatura CS4681 (Assignment 02), por lo que se trata de un modelo académico y experimental, no de un modelo listo para producción.

El modelo resuelve la tarea de generación de texto causal (next-token prediction) sobre el dominio periodístico de Reuters, concatenando título y cuerpo del artículo. Su arquitectura es un transformer decoder-only con 6 capas, dimensión oculta 384 y 6 cabezas de atención, sumando 30.713.856 parámetros. La longitud de contexto es de 256 tokens, muy limitada frente a los estándares actuales.

Es relevante únicamente como referencia didáctica: demuestra el flujo completo de entrenamiento de un GPT-2 desde cero con un tokenizador específico del dominio (`ingeniumacademy/gpt2-reuters-tokenizer`), con métricas de validación y test publicadas (perplejidad 70,6 y 57,8 respectivamente). No compite con modelos preentrenados de tamaño similar en capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), causal LM |
| Parametros totales | 30.713.856 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar en configuración reducida: 6 capas, dimensión oculta de 384 y 6 cabezas de atención, con 30.713.856 parámetros totales. Se inicializa aleatoriamente (sin pesos preentrenados) y se entrena con el objetivo de predicción del siguiente token sobre la concatenación `title + "\n\n" + body` de los artículos de Reuters. Utiliza un tokenizador propio del dominio, `ingeniumacademy/gpt2-reuters-tokenizer`.

El entrenamiento se realizó durante 5 épocas con learning rate 6e-4 y scheduler coseno, batch de 32, sobre una GPU T4 con un tiempo total de 11,3 minutos. El modelo card reporta pérdida de validación de 4,2574 (perplejidad 70,6) y pérdida de test de 4,0567 (perplejidad 57,8). El repositorio incluye además dos variantes: `run_2_epochs/` (2 épocas) y `run_small_model_5_epochs/` (3 capas, 256 de dimensión oculta, 4 cabezas). No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto causal en inglés sobre temática periodística (estilo Reuters).
- Predicción del siguiente token con contexto máximo de 256 tokens.
- Generación condicionada por título para producir cuerpos de artículo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: únicamente inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia y reproducción de pipelines de entrenamiento: sirve como ejemplo completo (tokenizador, dataset, métricas, figuras) para cursos de NLP que quieran mostrar el entrenamiento de un GPT-2 desde cero en hardware modesto (una T4).
- Generación de titulares y cuerpos sintéticos de noticias en inglés para aumentar datasets de prueba en tareas de clasificación o resumen, siempre con revisión humana por la baja calidad esperable.
- Pruebas de infraestructura de despliegue: al ocupar ~0,3 GB y 30,7 M de parámetros, es útil para validar pipelines con transformers, text-generation-inference o endpoints compatibles antes de pasar a modelos mayores.
- Experimentos de ablación académica: las variantes incluidas (2 épocas, modelo de 3 capas) permiten comparar el efecto de épocas y tamaño sobre la perplejidad en un mismo dataset.
- Generación de texto de relleno en demos y prototipos de interfaces que necesiten respuestas con apariencia periodística sin coste de inferencia.
- Estudio de tokenizadores específicos de dominio: permite analizar cómo un tokenizador entrenado sobre Reuters afecta a la perplejidad y a la longitud efectiva de las secuencias.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pérdida de validación | 4,2574 |
| Perplejidad de validación | 70,6 |
| Pérdida de test | 4,0567 |
| Perplejidad de test | 57,8 |
| Épocas | 5 |
| Learning rate | 6e-4 (cosine) |
| Batch | 32 |
| Tiempo de entrenamiento (T4) | 11,3 min |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (30,7 M de parámetros ≈ 123 MB de pesos) más overhead de activaciones y KV cache; en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una NVIDIA T4.
- Cabe en GPU consumer: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, la inferencia es de milisegundos en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sehandi/gpt2-reuters-from-scratch | 30,7 M | 256 | Desde cero, Reuters | MIT | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 | Preentrenado web | MIT | Hugging Face |
| DistilGPT-2 | 82 M | 1024 | Destilado de GPT-2 | MIT | Hugging Face |

No se dispone de benchmarks comparativos publicados para este modelo frente a las alternativas; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo entrenado desde cero con un corpus limitado (Reuters) y solo 5 épocas: alta probabilidad de texto incoherente, repeticiones y alucinaciones factuales.
- Contexto de 256 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Solo inglés; no soporta otros idiomas.
- Sesgos heredados del corpus de Reuters (sesgo editorial, geográfico y temático), sin mitigación documentada.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción sin fine-tuning adicional.
- Es un artefacto académico (CS4681 Assignment 02) sin mantenimiento ni garantías; descargas y likes a cero en el momento de la consulta.
- No se documentan procesos de alineación (RLHF/DPO), por lo que puede generar contenido inapropiado si se le induce.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sehandi/gpt2-reuters-from-scratch
- Dataset: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
