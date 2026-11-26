# jalaldoust/tautos-124m

## Resumen

Tautos 124M es un modelo de lenguaje de tipo GPT-2 con 124.475.904 parametros, desarrollado por el autor de Hugging Face `jalaldoust` en el contexto del proyecto Tautos (tautos.io). No es un modelo pensado para uso general, sino un artefacto de investigacion liberado para verificar de forma independiente una afirmacion concreta: que un modelo preentrenado con el algoritmo Tautos, inspirado en teoria de transportabilidad causal, requiere menos senal de ajuste fino para alcanzar el mismo rendimiento que un modelo entrenado con la receta estandar.

La arquitectura es exactamente la de GPT-2 124M (12 capas, 768 de anchura, 12 cabezas de atencion, contexto de 1.024 tokens) y se carga con el `GPT2LMHeadModel` estandar de Transformers. El tokenizador es el BPE de GPT-2, con la matriz de embeddings rellenada hasta 50.304 filas (los ids 50.257 y superiores no se usan). El preentrenamiento se hizo sobre 100 millones de tokens de FineWeb-Edu, los mismos tokens que el modelo de comparacion `jalaldoust/tautos-baseline-124m`, entrenado con la receta nanoGPT.

Su relevancia es metodologica, no de producto: publica un protocolo reproducible de evaluacion con GRPO sobre IMDB y un script (`rl_eval.py`) para replicar la comparacion. La licencia es "evaluation-only", lo que restringe explicitamente el uso comercial. El modelo solo soporta ingles y su ventana de contexto es corta (1.024 tokens), por lo que no compite con modelos generativos modernos en capacidades, sino en la hipotesis cientifica que ilustra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (12 capas, 768 de anchura, 12 cabezas), `GPT2LMHeadModel` estandar |
| Parametros totales | 124.475.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | evaluation-only (licencia "other", ver `LICENSE.md`) |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo es un GPT-2 124M sin modificaciones estructurales: 12 bloques transformer con atencion multi-cabeza causal y capas feed-forward, con contexto maximo de 1.024 tokens. La diferencia respecto a un GPT-2 convencional no esta en la arquitectura, sino en el procedimiento de preentrenamiento. Segun la model card, Tautos es un algoritmo de preentrenamiento inspirado en teoria de transportabilidad causal, y el modelo resultante puede usarse en procedimientos de ajuste fino convencionales requiriendo "mucha menos senal de ajuste fino" para el mismo rendimiento.

El corpus de preentrenamiento son 100 millones de tokens de FineWeb-Edu, identicos a los del modelo de comparacion entrenado con la receta nanoGPT. El coste de preentrenamiento se declara entre 20 y 100 veces el de la receta estandar para el mismo tamano de modelo y corpus, un dato relevante para valorar el trade-off. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni tecnicas de decodificacion especulativa; el ajuste con RL aparece solo en el protocolo de evaluacion (GRPO via TRL con penalizacion KL de 0,05 respecto al modelo inicial, learning rate 1e-5, temperatura 1 y 8 completaciones de 32 tokens por prompt).

## Capacidades

- Generacion de texto autoregresiva en ingles, con el comportamiento estandar de un GPT-2 124M.
- Ajuste fino convencional: compatible con el pipeline de Transformers y con procedimientos estandar de fine-tuning supervisado.
- Ajuste fino con RL: el protocolo publicado usa GRPO sobre un conjunto fijo de prompts con recompensa de un clasificador de sentimiento.
- Evaluacion reproducible: incluye `rl_eval.py` y `reference_results.json` para replicar la comparacion frente al baseline.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Verificacion cientifica del algoritmo Tautos: replicar el experimento de GRPO sobre IMDB con `rl_eval.py` y comparar el numero de llamadas al verificador necesarias para alcanzar una recompensa retenida de 2,5 frente al baseline. Es el uso principal y el motivo declarado de la publicacion.
- Investigacion en eficiencia de muestra: estudiar por que un modelo preentrenado con un coste 20-100 veces mayor rinde mejor con menos senal de ajuste fino, midiendo la relacion entre presupuesto de verificador y recompensa.
- Experimentos de ajuste fino supervisado de bajo coste: al ser un GPT-2 124M estandar, cabe en una sola GPU consumer y sirve para probar hipotesis de transferencia con pocos ejemplos etiquetados.
- Extension del protocolo a otras tareas: el script permite pasar `--dataset`, `--text_field`, `--reward_model` y `--positive_label` para usar cualquier dataset de texto y cualquier clasificador de secuencias como funcion de recompensa.
- Docencia y divulgacion sobre RLHF/GRPO: el modelo y su baseline permiten montar practicas reproducibles de ajuste con refuerzo en unas 15 minutos por ejecucion en una A100.
- Reproducibilidad de resultados: usar `reference_results.json` como referencia para validar implementaciones propias de GRPO o de evaluacion con recompensa retenida sobre 512 resenas de test de IMDB.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K). El unico resultado publicado es el numero de llamadas al verificador necesarias para alcanzar por primera vez una recompensa retenida de 2,5 en IMDB con GRPO (una semilla):

| Prompts | Baseline | Tautos | Ratio |
|---|---|---|---|
| 64 | 47,0k | 27,1k | 1,74x |
| 128 | 48,2k | 29,1k | 1,65x |
| 256 | 46,2k | 29,5k | 1,57x |
| 512 | 47,0k | 28,2k | 1,66x |
| 1.024 | 45,6k | 28,6k | 1,59x |

Segun el autor, en niveles de recompensa mas bajos el ratio es mayor, hasta 2,4x. El fichero `reference_results.json` contiene la recompensa retenida tras cada pasada para ambos modelos, incluidos los rangos de 2.048 a 16.384 prompts.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos, mas overhead de activaciones y KV cache; en la practica cabe holgadamente en cualquier GPU con 4 GB o mas.
- En cuantizacion de 8 bits o 4 bits el modelo ocuparia del orden de 125-250 MB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para inferencia; el autor reporta unas 15 minutos por ejecucion de evaluacion en una A100.
- Despliegue: transformers de forma nativa; compatible con text-generation-inference segun los tags del repositorio. No se documentan recetas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tautos 124M | 124,5M | 1.024 | 100M tokens FineWeb-Edu con Tautos | evaluation-only | Hugging Face |
| tautos-baseline-124m | 124,5M (misma arquitectura) | 1.024 | 100M tokens FineWeb-Edu con receta nanoGPT | no disponible | Hugging Face |
| GPT-2 124M original (OpenAI) | 124M | 1.024 | WebText, receta original | MIT | Hugging Face, OpenAI |

La comparacion relevante es interna: Tautos 124M frente a su baseline nanoGPT, que comparten arquitectura, tokenizador y tokens de preentrenamiento, y difieren solo en el algoritmo. Frente al GPT-2 original, el modelo de Tautos se entrena con un corpus mucho menor (100M tokens frente a los aproximadamente 40 GB de WebText) y con un coste de computo declarado 20-100 veces superior al de la receta estandar; no se publican comparaciones de rendimiento generativo frente a GPT-2 original.

## Limitaciones y advertencias

- Licencia "evaluation-only": no esta permitido el uso comercial; el modelo se libera exclusivamente para evaluacion e investigacion.
- Modelo de 124M parametros y 100M tokens de preentrenamiento: su capacidad generativa y de conocimiento factual es muy limitada en terminos absolutos.
- Ventana de contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo ingles; no hay soporte multilingue documentado.
- Riesgo elevado de alucinacion y de generar texto incoherente en dominios fuera de la distribucion de FineWeb-Edu.
- Los resultados publicados provienen de una unica semilla y de una unica tarea (sentimiento en IMDB); la generalizacion de la ventaja de eficiencia de muestra a otras tareas no esta demostrada en la informacion disponible.
- No se documentan sesgos especificos ni evaluaciones de seguridad; al derivar de FineWeb-Edu, hereda los sesgos de ese corpus.
- El coste de preentrenamiento declarado (20-100x) implica que la ventaja en ajuste fino no sale gratis en computo total.
- No se publican pesos cuantizados ni integraciones listas para produccion (vLLM, llama.cpp, Ollama).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jalaldoust/tautos-124m
- Modelo baseline: https://huggingface.co/jalaldoust/tautos-baseline-124m
- Proyecto Tautos: https://tautos.io
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de evaluacion: https://huggingface.co/datasets/stanfordnlp/imdb
- Modelo de recompensa: https://huggingface.co/lvwerra/distilbert-imdb
- Licencia: https://huggingface.co/jalaldoust/tautos-124m/blob/main/LICENSE.md
- Contacto del autor: kasra@tautos.io
