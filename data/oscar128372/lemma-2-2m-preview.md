# oscar128372/Lemma-2.2M-preview

## Resumen

Lemma-2.2M-preview es un modelo de lenguaje de escala muy reducida (2,2 millones de parámetros) publicado por el usuario oscar128372 en Hugging Face bajo licencia MIT. Se trata de un checkpoint intermedio (paso 20.000 de un entrenamiento de 30.000 pasos) de un experimento de entrenamiento de un pequeño modelo de lenguaje en inglés, continuación del modelo previo oscar128372/temp-10k-steps. El autor lo etiqueta explícitamente como "modelo de prueba" y "no final", por lo que su interés es fundamentalmente experimental y educativo, no de producción.

El modelo se entrenó durante aproximadamente 6 horas sobre unas 1.900 millones de tokens con una GPU Kaggle T4 (de las dos disponibles), empleando un optimizador híbrido entre Muon y AdamW, scheduler coseno y un learning rate máximo de 1,5e-3. La composición del dataset combina corpus web filtrados (Ultra-FineWeb-L3, cosmopedia-v2), texto sintético para primeras edades (TinyStories), Wikipedia, datos matemáticos (UltraData-Math, orca-math, OpenMathInstruct-2) y el corpus IFM/TxT360-v2.

Su relevancia actual es acotada: sirve como referencia de hasta dónde llega un modelo de 2,2M de parámetros entrenado con recursos mínimos, con resultados en benchmarks muy por debajo de modelos pequeños convencionales (por ejemplo, HellaSwag normalizado del 33,2 % o LAMBADA del 11,1 %). No dispone de información pública sobre arquitectura detallada, longitud de contexto ni pipeline de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de lenguaje; detalles no publicados) |
| Parámetros totales | 2.203.653 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no especificada) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna (número de capas, dimensión del modelo, tipo de atención, tokenizador o función de activación). Por el tamaño (2,2M de parámetros) y el contexto de entrenamiento descrito, se trata de un transformer decoder-only de escala muy pequeña, orientado a experimentación. El autor indica que el entrenamiento se realizó con un optimizador dividido entre Muon y AdamW, un scheduler coseno y un peak learning rate de 1,5e-3, durante 30.000 pasos (el checkpoint publicado corresponde al paso 20.000) sobre aproximadamente 1.900 millones de tokens, en unas 6 horas de cómputo con una GPU Kaggle T4.

La mezcla de datos es explícita: 24 % de openbmb/Ultra-FineWeb-L3, 20 % de HuggingFaceTB/cosmopedia-v2, 14 % de roneneldan/TinyStories, 12 % de wikimedia/wikipedia, 12 % de IFM/TxT360-v2, 7 % de openbmb/UltraData-Math, 6 % de microsoft/orca-math-word-problems-200k y 5 % de nvidia/OpenMathInstruct-2. No se menciona uso de RLHF, DPO ni ninguna técnica de alineación posterior al preentrenamiento. Tampoco se documentan innovaciones técnicas destacables (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto en inglés a nivel básico, limitada por el reducido tamaño del modelo.
- Razonamiento elemental y respuesta a preguntas simples, con resultados bajos en benchmarks de sentido común.
- Aritmética y problemas matemáticos sencillos, favorecidos por la presencia de datasets matemáticos en el entrenamiento (UltraData-Math, orca-math, OpenMathInstruct-2).
- Continuación de texto y modelado de lenguaje (evaluado en LAMBADA y perplejidad en Wikitext).
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Experimentación educativa sobre entrenamiento de modelos de lenguaje: el modelo permite reproducir y analizar el efecto de la mezcla de datasets y del optimizador híbrido Muon/AdamW en un presupuesto de cómputo mínimo (una T4, 6 horas).
- Pruebas de pipelines de evaluación: sirve como caso base para validar scripts de evaluación tipo HellaSwag, ARC, PIQA o LAMBADA antes de escalar a modelos mayores, dado su tamaño reducido y su rápida inferencia.
- Prototipado de aplicaciones de generación de texto muy simple en inglés, como autocompletado de frases cortas o generación de texto de estilo TinyStories para demostraciones.
- Estudio de curvas de aprendizaje y checkpoints intermedios: al ser un checkpoint del paso 20.000 de 30.000, permite comparar el estado del modelo frente al entrenamiento completo.
- Docencia sobre limitaciones de los modelos pequeños: útil para mostrar de forma tangible por qué 2,2M de parámetros no bastan para tareas de razonamiento o sentido común.
- Benchmarking de infraestructura ligera: al caber en cualquier GPU consumer (incluso CPU), permite medir latencia y throughput de frameworks de inferencia sin necesidad de hardware dedicado.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark | Resultado |
|---|---|
| HellaSwag (normalizado) | 33,2 % |
| ARC-Easy (normalizado) | 31,0 % |
| ARC-Challenge (normalizado) | 19,2 % |
| PIQA (normalizado) | 53,3 % |
| ArithMark-3 (normalizado) | 35,1 % |
| LAMBADA | 11,1 % |
| Wikitext PPL (escalada a GPT-2) | 32,89 |
| Open SLM Leaderboard Intelligence Index (aprox.) | 7,25 |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantización; con 2,2M de parámetros en fp32 los pesos ocupan aproximadamente 8,8 MB, por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso CPU; el autor entrenó con una Kaggle T4.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: al estar en safetensors, puede cargarse con transformers; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, aunque por tamaño podría convertirse a GGUF.
- Latencia y throughput estimados: no disponibles; por el tamaño, se espera latencia muy baja y throughput alto, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, los modelos de la familia TinyStories (del orden de 1M a 30M de parámetros) comparten escala y propósito educativo, pero no se han incluido sus métricas en esta ficha por falta de datos verificados en la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lemma-2.2M-preview | 2,2M | no disponible | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo explícitamente marcado como "test" y "no final" por el autor; no debe usarse en producción.
- Riesgo elevado de alucinación y de generar texto incoherente o sin sentido, dado el reducido número de parámetros y los bajos resultados en benchmarks (LAMBADA 11,1 %).
- Capacidad de razonamiento, sentido común y matemáticas muy limitada (ARC-Challenge 19,2 %, HellaSwag 33,2 %).
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Longitud de contexto no documentada; se desconoce el máximo de tokens de entrada.
- Sesgos potenciales heredados de los datasets de entrenamiento (web, Wikipedia, datos sintéticos), no evaluados ni mitigados.
- Licencia MIT: permite uso comercial, pero la calidad del modelo hace inviable su uso en aplicaciones reales.
- No se documentan técnicas de alineación (RLHF/DPO), por lo que puede producir contenido inapropiado o no seguir instrucciones.
- El checkpoint publicado corresponde al paso 20.000 de 30.000; el modelo final no está disponible en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/oscar128372/Lemma-2.2M-preview
- Modelo predecesor: https://huggingface.co/oscar128372/temp-10k-steps
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset HuggingFaceTB/cosmopedia-v2: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-v2
- Dataset roneneldan/TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset wikimedia/wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset IFM/TxT360-v2: https://huggingface.co/IFM/datasets/TxT360-v2
- Dataset openbmb/UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset microsoft/orca-math-word-problems-200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
