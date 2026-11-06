# aaaaaaaieuyd/Small-LLM1

## Resumen

Small LLM1 es un modelo de lenguaje de 4.984.064 parámetros (aproximadamente 5M) entrenado desde cero por el usuario aaaaaaaieuyd con fines recreativos. Se trata de un transformer decoder-only de estilo Llama, con 6 capas, dimensión oculta de 256, 8 cabezas de atención y un FFN de 512. El modelo se ha entrenado exclusivamente sobre las primeras 400.000 historias del dataset TinyStories, lo que representa unos 92M de tokens, durante 6.000 pasos en una única RTX 5070 en aproximadamente 4 minutos.

El modelo no ha recibido ningún tipo de ajuste fino (ni instruction tuning ni chat tuning), por lo que es un modelo base que únicamente puede continuar texto en inglés con estructura de cuento infantil. No responde a preguntas, no sigue instrucciones y no mantiene conversaciones. Su utilidad es fundamentalmente didáctica: sirve como ejemplo mínimo reproducible de entrenamiento de un LLM desde cero, con un tokenizador BPE byte-level propio de 4.096 tokens y una ventana de contexto de solo 256 tokens.

La relevancia de este modelo es limitada en términos de producción, pero resulta interesante como referencia educativa para entender el pipeline completo de entrenamiento de un transformer causal (tokenización, preentrenamiento, evaluación con perplexity) con recursos mínimos. La pérdida de validación reportada es de 1,77, lo que corresponde a una perplexity de aproximadamente 5,9 en el conjunto de validación de TinyStories.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (entrenado desde cero) |
| Parametros totales | 4.984.064 (aproximadamente 5M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Especificaciones adicionales reportadas por el autor: 6 capas, hidden size 256, 8 cabezas de atención, FFN de 512, vocabulario de 4.096 tokens (BPE byte-level entrenado por el autor), pérdida de validación 1,77 (perplexity aproximada de 5,9).

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de estilo Llama, implementada desde cero. Consta de 6 capas con dimensión oculta de 256, 8 cabezas de atención (por tanto, dimensión de cabeza de 32) y una capa feed-forward de tamaño 512. El tokenizador es un BPE byte-level de 4.096 tokens entrenado específicamente para este modelo. La ventana de contexto es de 256 tokens.

El entrenamiento se realizó sobre las primeras 400.000 historias del dataset TinyStories, lo que equivale a aproximadamente 92M de tokens. Se ejecutaron 6.000 pasos con un batch size de 64 y secuencias de 256 tokens, completándose en unos 4 minutos en una única GPU RTX 5070. No se aplicó RLHF, DPO ni ningún tipo de ajuste fino posterior al preentrenamiento. No se reportan innovaciones técnicas destacables más allá de la propia naturaleza minimalista del entrenamiento.

## Capacidades

- Generación de texto en inglés con estructura de cuento infantil simple, continuando una frase o párrafo dado.
- Modelado de lenguaje causal puro (predicción del siguiente token).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe nula más allá del inglés (el autor indica que no maneja coreano ni otros temas).
- No dispone de modo thinking, visión, audio ni ninguna capacidad multimodal.
- No sigue instrucciones ni mantiene conversaciones (modelo base sin ajuste fino).

## Casos de uso

- Demostración educativa de entrenamiento de un LLM: el modelo sirve para ilustrar el pipeline completo (tokenizador BPE propio, preentrenamiento causal, cálculo de perplexity) en un taller o curso, ya que se entrena en minutos en una GPU de consumo.
- Generación de cuentos cortos sintéticos para pruebas: puede producir continuaciones de frases tipo "Once upon a time..." útiles como datos de prueba en pipelines de generación de texto con contexto de 256 tokens.
- Test de infraestructura de inferencia: por su tamaño mínimo, es adecuado para validar despliegues de transformers, text-generation-inference o endpoints compatibles antes de pasar a modelos mayores.
- Reproducción de experimentos de scaling: permite comparar curvas de pérdida y perplexity con configuraciones alternativas de capas, hidden size o vocabulario sin coste computacional relevante.
- Benchmark de tokenizadores: al incluir un BPE byte-level propio de 4.096 tokens, sirve para estudiar el comportamiento de la tokenización en dominios muy restringidos (cuentos infantiles en inglés).
- Ejercicio de evaluación de modelos base: útil para demostrar por qué un modelo sin instruction tuning no responde a preguntas, comparando su salida con la de modelos ajustados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion | 1,77 |
| Perplexity de validacion (TinyStories) | aproximadamente 5,9 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta la pérdida y perplexity sobre el conjunto de validación de TinyStories.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (los pesos ocupan aproximadamente 20 MB en fp32 para 4,98M de parámetros); en la práctica, cualquier GPU con más de 1 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU moderna, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha la capacidad de estas últimas.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el modelo incluye el tag endpoints_compatible), y potencialmente llama.cpp u Ollama si se convierte a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, la latencia será de milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Small LLM1 | 4,98M | 256 | TinyStories (400k historias, 92M tokens) | apache-2.0 | Hugging Face |
| Modelos TinyStories de referencia (p. ej. variantes de 1M-10M) | 1M-10M | 256-512 | TinyStories | variable | Hugging Face |
| GPT-2 small | 124M | 1.024 | WebText | MIT (pesos) | Hugging Face |
| SmolLM-135M | 135M | 2.048 | FineWeb-Edu y otros | apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos publicados para Small LLM1 frente a estas alternativas. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Rendimiento muy bajo por diseño: el autor lo describe explícitamente como un modelo "hecho por diversión" no apto para uso real.
- Solo maneja inglés y exclusivamente el registro de cuentos infantiles; cualquier otro dominio o idioma produce resultados deficientes.
- No sigue instrucciones ni mantiene conversaciones al no haber recibido ajuste fino.
- Alta probabilidad de generar texto incoherente o sin sentido lógico, incluso dentro del dominio de TinyStories.
- No es fiable para información factual, razonamiento, código ni matemáticas.
- Ventana de contexto muy corta (256 tokens), lo que limita cualquier tarea que requiera contexto extenso.
- Sesgos: no documentados por el autor; al entrenarse solo con TinyStories, los sesgos reflejan los de ese dataset sintético.
- Licencia apache-2.0 permite uso comercial, pero las limitaciones técnicas hacen inviable cualquier aplicación en producción.
- No se proporcionan pesos cuantizados ni formatos alternativos a safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaaaaaaieuyd/Small-LLM1
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
