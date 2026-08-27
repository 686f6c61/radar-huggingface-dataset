# russki/Qwen2.5-1.5B-Instruct-EXL3-3.0bpw

## Resumen

Este repositorio contiene una cuantización EXL3 a 3.0 bits por peso (BPW) del modelo Qwen2.5-1.5B-Instruct, creada por el usuario russki mediante ExLlamaV3 v1.4.4. El objetivo es reducir drásticamente el consumo de memoria y aumentar la velocidad de decodificación en GPUs NVIDIA, manteniendo un tamaño de modelo pequeño (1.54 mil millones de parámetros) apto para entornos con recursos limitados.

La cuantización utiliza el formato EXL3, específico del runtime ExLlamaV3, y no es compatible con Transformers nativo. Según el benchmark incluido en la model card, en una RTX 3090 el modelo ocupa 764 MiB de memoria (frente a 2,945 MiB en BF16) y alcanza una velocidad de decodificación de 141.02 tokens por segundo, más de cinco veces superior a la del checkpoint original en Transformers. Esto lo hace relevante para despliegues en edge, prototipado rápido y aplicaciones de baja latencia.

El modelo base Qwen2.5-1.5B-Instruct, desarrollado por Alibaba Cloud, es un transformer denso con atención por grupos de consultas (GQA), incrustaciones posicionales rotatorias (RoPE), SwiGLU y RMSNorm. Soporta un contexto de 32.768 tokens y, según la documentación oficial, 29 idiomas, aunque la model card de esta cuantización solo declara inglés. La licencia es Apache-2.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) con GQA, RoPE, SwiGLU, RMSNorm |
| Parametros totales | 1.54 mil millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (según documentación del modelo base) |
| Tipos de cuantizacion | EXL3 3.0 BPW (3 bits), lm_head a 6 bits |
| Idiomas soportados | Ingles (segun model card); el modelo base soporta 29 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato EXL3, no compatible con Transformers nativo) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct es un transformer denso de 1.54 mil millones de parámetros, entrenado por Alibaba Cloud sobre un corpus multilingüe y ajustado mediante instrucciones. Utiliza atención por grupos de consultas (GQA) con 12 cabezas, incrustaciones posicionales rotatorias (RoPE), capas feed-forward SwiGLU y normalización RMSNorm. El proceso de alineación del modelo base incluye técnicas de aprendizaje por refuerzo a partir de retroalimentación humana (RLHF), aunque no se dispone de detalles específicos en la información proporcionada.

La cuantización EXL3 se realizó con ExLlamaV3 v1.4.4 sobre una NVIDIA RTX 3090. Los parámetros de conversión incluyen un bitrate objetivo de 3.0 BPW, calibración con 250 filas de 2.048 tokens, modo de conversión `mul1` y el `lm_head` cuantizado a 6 bits. El tamaño serializado del repositorio en el momento de la conversión era de 1.147.885.597 bytes. No se modificaron los pesos del modelo base más allá de la cuantización; se conservan el tokenizador y los archivos de configuración originales.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico, comprensión de instrucciones y generación de código en lenguajes comunes (Python, JavaScript, etc.), aunque con limitaciones propias de un modelo de 1.5B.
- Soporte de tool calling y function calling, según la documentación oficial de la serie Qwen2.5-Instruct, aunque no se ha verificado específicamente en esta cuantización.
- Capacidades multilingües en 29 idiomas según el modelo base, pero la model card de este repositorio solo declara inglés; el rendimiento en otros idiomas puede degradarse tras la cuantización.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Despliegue en dispositivos edge o embebidos: con 764 MiB de memoria y 141 tokens/s de decodificación en una RTX 3090, puede ejecutarse en GPUs de gama baja o integradas, permitiendo asistentes conversacionales en tiempo real sin conexión.
- Atención al cliente automatizada: su ventana de contexto de 32.768 tokens permite gestionar conversaciones largas con historial completo, y su baja latencia lo hace adecuado para chatbots en entornos de producción con recursos limitados.
- Generación de código asistida en entornos de desarrollo: puede integrarse en editores o pipelines de CI/CD para autocompletado y revisión básica de código, aunque se recomienda validar las salidas por su tamaño reducido.
- Clasificación y extracción de información: tareas de NLP como análisis de sentimiento, etiquetado de documentos o extracción de entidades, donde la velocidad de inferencia es prioritaria sobre la máxima precisión.
- Prototipado rápido de aplicaciones de IA: permite validar flujos de conversación o generación de texto antes de escalar a modelos más grandes, reduciendo costes de experimentación.
- Aplicaciones offline en portátiles o estaciones de trabajo sin GPU dedicada: aunque ExLlamaV3 requiere GPU NVIDIA, con una GPU modesta (por ejemplo, una GTX 1650 con 4 GB) es viable ejecutar el modelo con margen para el contexto.

## Benchmarks y rendimiento

La model card incluye un benchmark comparativo entre el checkpoint BF16 ejecutado con Transformers y la cuantización EXL3 ejecutada con ExLlamaV3, ambos en una NVIDIA RTX 3090. Los valores son medianas de tres ejecuciones, con un prompt de 512 tokens y 255 tokens de decodificación greedy. La prueba de capacidades (capability smoke test) consiste en cuatro prompts de regresión, no en una evaluación de calidad exhaustiva.

| Modelo / runtime | Memoria del modelo | Prefill (tok/s) | Decode (tok/s) | Smoke test |
|---|---:|---:|---:|---:|
| BF16 / Transformers | 2.945 MiB | 9.458 | 26,97 | 3/4 |
| EXL3 3.0 BPW / ExLlamaV3 | 764 MiB | 8.127 | 141,02 | 4/4 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card advierte que la comparación es de formato y runtime, no una medición aislada de la cuantización, y que la perplejidad, la divergencia KL y el rendimiento bajo concurrencia no han sido medidos.

## Requisitos de hardware

- VRAM estimada: 764 MiB para los pesos del modelo (excluyendo KV cache y overhead del runtime), según el benchmark en RTX 3090. Con contexto completo de 32K tokens, la memoria total puede superar 1 GB.
- GPU recomendada: cualquier NVIDIA con al menos 1 GB de VRAM y soporte CUDA. ExLlamaV3 no funciona en CPU ni en GPUs AMD/Intel.
- En GPUs consumer: cabe en RTX 3060, RTX 4060, GTX 1660 Super, etc. Con 4 GB de VRAM es suficiente para el modelo y contexto moderado.
- Opciones de despliegue: ExLlamaV3 es el runtime nativo y recomendado. No es compatible con Transformers, llama.cpp ni Ollama en su formato actual. vLLM podría soportar EXL3 en el futuro, pero no está confirmado.
- Latencia y throughput: 141 tokens/s de decodificación y 8.127 tokens/s de prefill en RTX 3090 (mediana de tres ejecuciones). En GPUs más modestas, la velocidad será proporcionalmente menor.

## Comparativa con modelos similares

La siguiente tabla compara esta cuantización con el modelo base en BF16 y con una cuantización EXL2 del mismo modelo base (ReadyArt/Qwen2.5-1.5B-Instruct_EXL2_5.0bpw_H8). No se dispone de datos de rendimiento de la variante EXL2.

| Modelo | Parametros | Contexto | Licencia | Formato | Memoria (RTX 3090) | Decode (tok/s) |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (BF16) | 1.54B | 32.768 | Apache-2.0 | Transformers | 2.945 MiB | 26,97 |
| russki/Qwen2.5-1.5B-Instruct-EXL3-3.0bpw | 1.54B | 32.768 | Apache-2.0 | EXL3 | 764 MiB | 141,02 |
| ReadyArt/Qwen2.5-1.5B-Instruct_EXL2_5.0bpw_H8 | 1.54B | 32.768 | Apache-2.0 | EXL2 | no disponible | no disponible |

Otras alternativas de tamaño similar, como Llama 3.2 1B o Gemma 2 2B, no se incluyen por falta de datos comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits puede degradar la calidad del modelo en tareas complejas como razonamiento matemático o generación de código extenso. La model card no incluye mediciones de perplejidad ni divergencia KL, por lo que el impacto exacto es desconocido.
- El modelo base tiene sesgos y limitaciones inherentes a su entrenamiento; la cuantización no los corrige. Puede producir alucinaciones, especialmente en dominios especializados.
- La model card declara únicamente inglés, aunque el modelo base soporta 29 idiomas. El rendimiento en otros idiomas puede verse afectado por la cuantización.
- No es compatible con Transformers nativo; requiere ExLlamaV3. Esto limita su integración en ecosistemas que esperan safetensors estándar.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución al modelo base y a esta cuantización.
- El benchmark de velocidad se realizó en una sola GPU (RTX 3090) con tres ejecuciones cortas; los resultados pueden variar en otros entornos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/russki/Qwen2.5-1.5B-Instruct-EXL3-3.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- ExLlamaV3 (runtime): https://github.com/turboderp-org/exllamav3
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Cuantización EXL2 alternativa: https://huggingface.co/ReadyArt/Qwen2.5-1.5B-Instruct_EXL2_5.0bpw_H8
