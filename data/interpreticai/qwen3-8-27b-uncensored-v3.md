# InterpreticAI/Qwen3.8-27B-Uncensored-v3

## Resumen

Qwen3.8-27B-Uncensored-v3 es un ajuste fino de tipo *abliteration* sobre NousResearch/Arete-27B, que a su vez es un post-entrenamiento del modelo base Qwen/Qwen3.8-27B. Lo desarrolla InterpreticAI (autor de la ficha: Thomas Young) y su objetivo es eliminar la censura política residual que persiste en Arete-27B cuando se le consulta en chino sobre temas sensibles para el Partido Comunista Chino. Según la model card, Arete-27B ya elimina la mayor parte de la propaganda en inglés, pero seguía censurando aproximadamente la mitad de las respuestas a preguntas políticas formuladas en chino; esta v3 reduce esa cifra al 2,6%.

El modelo conserva la arquitectura y el diseño de ficheros de Arete-27B, con 27.356.728.560 parámetros en un checkpoint completo en BF16 y pipeline `image-text-to-text`, lo que implica que mantiene el codificador visual del modelo original. Es relevante ahora porque ofrece una alternativa con licencia Apache 2.0 para investigación sobre censura en LLM y para aplicaciones que requieran respuestas sin sesgo ideológico en contextos multilingües, aunque con la advertencia de que una respuesta no censurada no es necesariamente una respuesta correcta.

La ficha se publica bajo DOI 10.57967/hf/11540 y el repositorio ocupa 54,7 GB. El modelo no incluye el módulo de predicción multi-token (MTP), por lo que debe servirse con decodificación estándar; para decodificación especulativa MTP el autor remite a la versión v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5/Qwen3.8), con codificador visual; tag `qwen3_5` |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 (checkpoint principal); GGUF Q4_K_M e IQ3_XXS en repositorios derivados |
| Idiomas soportados | no disponible (la evaluacion cubre ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF en repositorios derivados |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.8 con 27.356 millones de parámetros y un codificador visual heredado de Arete-27B, lo que habilita el pipeline `image-text-to-text`. No se especifica en la información disponible si emplea mezcla de expertos; el recuento de parámetros y la ausencia de mención a parámetros activos sugieren una arquitectura densa. El checkpoint es un ajuste completo en BF16 sobre NousResearch/Arete-27B, que a su vez deriva de Qwen/Qwen3.8-27B, ambos bajo Apache 2.0.

El entrenamiento de esta v3 se orienta específicamente a eliminar la censura política en respuestas en chino, un fenómeno documentado por Pan y Xu (2026) en *PNAS Nexus*. No se detallan en la model card el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; únicamente se indica que el resultado es un checkpoint completo con la misma arquitectura y disposición de ficheros que Arete-27B. Una innovación destacable del ecosistema es la inclusión de modos *thinking* y *non-thinking* heredados de Qwen3.8, con parámetros de muestreo recomendados distintos para cada modo. El módulo MTP (multi-token prediction) no está incluido en esta versión.

## Capacidades

- Generación de texto conversacional multi-turno, con modos *thinking* (razonamiento explícito) y *non-thinking*.
- Procesamiento de imagen y texto (`image-text-to-text`) mediante el codificador visual heredado de Arete-27B.
- Respuestas a preguntas políticas sensibles en chino sin censura ni evasión en el 97,4% de los casos evaluados.
- Reducción de propaganda en inglés al 0,5% de las respuestas según Propaganda_Eval.
- Soporte de *tool calling* y *function calling*: no confirmado explícitamente en la información disponible, aunque es una capacidad habitual de la familia Qwen3.8.
- Capacidades multilingües: la evaluación cubre inglés y chino; el resto de idiomas no está documentado.
- Compatibilidad con *endpoints* (tag `endpoints_compatible`) y despliegue con vLLM usando `--reasoning-parser qwen3`.

## Casos de uso

- Investigación sobre censura en LLM: el modelo permite medir sesgo ideológico comparando respuestas en chino e inglés con la batería de Pan y Xu (2026) o con Propaganda_Eval, sirviendo como referencia de un modelo con censura política mínima.
- Análisis de contenido político en chino: útil para estudiar cómo distintos modelos tratan temas sensibles, ya que responde abiertamente al 80,9% de las preguntas con el sujeto correcto.
- Evaluación de alineación y seguridad: sirve como contraste frente a modelos alineados para calibrar la frontera entre censura ideológica y rechazo legítimo de contenido dañino.
- Generación de resúmenes y respuestas en contextos periodísticos o de investigación donde se requiere evitar eufemismos oficialistas, con verificación factual posterior obligatoria.
- Aplicaciones multimodales de descripción de imágenes y VQA en combinación con preguntas abiertas, aprovechando el codificador visual heredado.
- Despliegue en investigación con cuantización GGUF Q4_K_M o IQ3_XXS para ejecución en hardware de consumo, dado el tamaño de 27B parámetros.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan Qwen3.8-27B, Arete-27B y Uncensored-v3 bajo ajustes idénticos (modo *non-thinking*, decodificación greedy, mismo juez LLM).

Censura política en chino (batería Pan & Xu, 2026; 115 preguntas sensibles, 4.096 tokens de salida):

| Metrica | Qwen3.8-27B | Arete-27B | Uncensored-v3 |
|---|---|---|---|
| Respuestas censuradas (menor mejor) | 83,5% | 50,4% | 2,6% |
| Rechaza o evade (menor mejor) | 49,6% | 22,6% | 0,9% |
| Reescribe en tópicos del PCCh (menor mejor) | 32,2% | 27,8% | 1,7% |
| Se alinea con valores del PCCh (menor mejor) | 100% | 30% | 20% |
| Sujeto correcto, respuesta abierta (mayor mejor) | 12,2% | 38,3% | 80,9% |

Propaganda en inglés (NousResearch/Propaganda_Eval, 803 prompts):

| Modelo | Respuestas con propaganda (menor mejor) |
|---|---|
| Qwen3.8-27B | 24,5% |
| Arete-27B | 1,0% |
| Qwen3.8-27B-Uncensored-v3 | 0,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 55 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda GPU de 80 GB (A100, H100) o múltiples GPU.
- Cuantización Q4_K_M: en torno a 16-18 GB, apta para RTX 4090 (24 GB) o RTX 3090.
- Cuantización IQ3_XXS: en torno a 12-14 GB, apta para GPUs de 16 GB o configuraciones con descarga parcial a CPU.
- GPU recomendadas: A100 80GB, H100 80GB para BF16 en producción; RTX 4090/3090 para cuantizaciones GGUF.
- Despliegue: vLLM (`vllm serve InterpreticAI/Qwen3.8-27B-Uncensored-v3 --reasoning-parser qwen3`), llama.cpp u Ollama con los GGUF publicados, y TGI no confirmado.
- Latencia y throughput: no disponibles en la información proporcionada. Al no incluir MTP, no se beneficia de decodificación especulativa integrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Censura política en chino | Licencia | Formatos |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3 | 27,36B | no disponible | 2,6% | Apache 2.0 | BF16, GGUF |
| Qwen3.8-27B-Uncensored-v2 | no disponible | no disponible | 3,5% | Apache 2.0 | BF16, FP8, GGUF; con MTP |
| NousResearch/Arete-27B | no disponible | no disponible | 50,4% | Apache 2.0 | no disponible |
| Qwen/Qwen3.8-27B | no disponible | no disponible | 83,5% | Apache 2.0 | no disponible |

La v3 ofrece la menor tasa de censura de la familia, pero carece de MTP y FP8 frente a la v2, que prioriza eficiencia de inferencia.

## Limitaciones y advertencias

- Cada modelo se generó una sola vez por benchmark; no se reportan intervalos de confianza ni repeticiones.
- Una respuesta sustantiva no implica corrección: el autor advierte que los usuarios deben verificar las afirmaciones factuales de forma independiente.
- El 20% de las respuestas aún se alinea con valores del PCCh en la batería de Pan y Xu, por lo que la eliminación de sesgo no es total.
- La evaluación se limita a texto; no se han publicado resultados para las capacidades multimodales.
- No se documentan sesgos fuera del ámbito político chino ni comportamiento en idiomas distintos del inglés y el chino.
- Riesgo de alucinación no cuantificado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se mantienen la atribución y licencia de Nous Research y del equipo Qwen; debe revisarse el fichero LICENSE del repositorio.
- Al ser un modelo descensurado, puede generar contenido que viole políticas de moderación de plataformas de despliegue; conviene aplicar filtros propios en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Versión v2: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- GGUF Q4_K_M de v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF
- GGUF IQ3_XXS de v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF
- Modelo base Arete-27B: https://huggingface.co/NousResearch/Arete-27B
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset Propaganda_Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Paper Pan & Xu (2026), *PNAS Nexus*: https://doi.org/10.1093/pnasnexus/pgag013
- Página de Arete en Nous Research: https://nousresearch.com/arete
- DOI del modelo: https://doi.org/10.57967/hf/11540
