# Hooshaai/llava-qwen-0.5b-cluster-attention-scienceqa

## Resumen

llava-qwen-0.5b-cluster-attention-scienceqa es un checkpoint multimodal de tipo vision-language derivado de llava-hf/llava-interleave-qwen-0.5b-hf mediante una tecnica de "cirugia de atencion" (attention surgery) del ecosistema NeuralOps. El autor, Hooshaai, sustituye el mecanismo de atencion cuadratica en 18 de las 24 capas del decodificador Qwen2 por un operador de atencion dispersa basada en clustering de tokens (ClusterAttention, familia sparse), manteniendo seis capas ancla con atencion cuadratica completa y congelando por completo la torre visual SigLIP y el proyector MLP. El resultado es un artefacto de pesos de solo 147,61 MB frente a los 1,66 GB del modelo base en FP16, lo que supone una reduccion del 91,3%.

El modelo se ha ajustado por destilacion de conocimiento sobre el subconjunto con imagen del dataset ScienceQA (validacion), orientado a razonamiento visual STEM. Segun la model card, la destilacion recupera buena parte de la calidad del profesor: la precision pasa del 32,50% en zero-shot tras la cirugia al 57,50% final, frente al 63,75% del modelo base original, y la perplejidad baja de 5,12 a 2,47 (el profesor marca 2,45).

Es relevante ahora porque demuestra un patron practico de compresion estructural de VLMs pequenos: en lugar de cuantizar, se reemplazan modulos de atencion por variantes dispersas y se reentrena solo el delta necesario, con un coste de entrenamiento de 231 pasos y 120 segundos en una unica RTX 3090. Es un experimento de investigacion reproducible, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas) con atencion ClusterAttention dispersa en 18/24 capas |
| Parametros totales | no disponible (el modelo base Qwen-0.5B ronda los 0,5B, pero la card no declara el total exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, delta quirurgico FP16) + tokenizer y configuracion JSON |

## Arquitectura y entrenamiento

La base es llava-interleave-qwen-0.5b-hf: una torre visual SigLIP congelada de 27 capas, un proyector multimodal MLP de dos capas y un decodificador Qwen2 de 24 capas con dimension oculta D=1024, 16 cabezas de atencion y head_dim=64. La intervencion reemplaza la self-attention en 18 de las 24 capas por ClusterAttention, un modulo que agrupa tokens antes de calcular la atencion para reducir el coste cuadratico; las seis capas restantes ([3, 7, 11, 15, 19, 23]) conservan atencion cuadratica como anclas, siguiendo un esquema hibrido 3:1. Solo se guardan los pesos modificados (las 18 self_attn y los layernorms del decodificador entrenados); la torre visual, el proyector, los MLP y los embeddings quedan fuera del artefacto serializado.

El entrenamiento es una destilacion de conocimiento offline con cache de representaciones (NeuralOps Offline Representation Caching, seccion 21.1), lo que permite usar el profesor sin ocupar VRAM adicional en la GPU del alumno (0 MB de VRAM de profesor). Se ejecuto en una RTX 3090 de 24 GB con 231 pasos de optimizacion (89 en etapa 1, 142 en etapa 2), 120,1 segundos de duracion y un pico de 17.650 MB de VRAM. El dataset es derek-thomas/ScienceQA, subconjunto con imagen, en split de validacion. No se documentan tecnicas de RLHF ni DPO, ni el volumen de tokens de entrenamiento.

## Capacidades

- Generacion de texto e imagen-a-texto conversacional (pipeline image-text-to-text).
- Razonamiento visual sobre preguntas de ciencia y STEM con imagen asociada (ScienceQA).
- Respuesta a preguntas de opcion multiple con seleccion de letra, segun el formato de prompt de la model card.
- Formato conversacional mediante chat_template incluido en el repositorio.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras modalidades.

## Casos de uso

- Evaluacion de tecnicas de atencion dispersa: sirve como referencia reproducible para comparar ClusterAttention frente a atencion cuadratica en un VLM pequeno, con deltas de precision y perplejidad medidos sobre ScienceQA.
- Investigacion en destilacion de conocimiento eficiente: el pipeline de cache offline de representaciones permite replicar el ajuste en una sola GPU de consumo, util para experimentos academicos con recursos limitados.
- Prototipado de asistentes educativos STEM: el modelo responde preguntas de ciencia con apoyo de imagen, adecuado para demos de tutoria visual en ingles.
- Pruebas de compresion estructural de VLMs: el delta de 147,61 MB frente a 1,66 GB del base permite estudiar el equilibrio entre tamano de artefacto y calidad (57,50% frente a 63,75%).
- Benchmarking de operadores de atencion: integrable en suites que evaluen el impacto de variantes sparse en tareas de razonamiento visual.
- Docencia y formacion: ejemplo didactico de cirugia de modulos y serializacion selectiva de pesos en el ecosistema NeuralOps.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Profesor (base) | Zero-shot tras cirugia | Final tras KD | Delta |
|---|---:|---:|---:|---:|
| Precision ScienceQA (%) | 63,75 | 32,50 | 57,50 | +25,00 |
| Perplejidad | 2,45 | 5,12 | 2,47 | -2,65 |

El conjunto evaluado es ScienceQA (Image-Bearing STEM Subset, validation) de derek-thomas/ScienceQA. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Inferencia: el delta de pesos ocupa 147,61 MB en FP16; sumado al modelo base congelado, el conjunto completo ronda el tamano del base (~1,66 GB en FP16), por lo que cabe holgadamente en GPUs de consumo.
- GPU de consumo: cualquier GPU con 8 GB o mas de VRAM es suficiente; el propio autor entreno en una RTX 3090 de 24 GB con un pico de 17.650 MB.
- GPU de datacenter: A100, H100 o L40S no son necesarias para este tamano; sobredimensionadas para inferencia.
- Despliegue: la carga se realiza con `neuralops.hub.load_surgeried_model`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; solo se reporta el tiempo de entrenamiento (120,1 s para 231 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-cluster-attention-scienceqa | ~0,5B (base) | no disponible | 57,50% acc / 2,47 PPL | MIT | Hugging Face (54 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B | no disponible | 63,75% acc / 2,45 PPL | no disponible en la informacion | Hugging Face |
| Otros VLM pequenos (p. ej. variantes LLaVA de <1B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que la informacion proporcionada no incluye resultados de terceros sobre el mismo subconjunto de ScienceQA.

## Limitaciones y advertencias

- Precision inferior al profesor: 57,50% frente a 63,75%, una perdida de 6,25 puntos porcentuales pese a la destilacion.
- Entrenado y evaluado unicamente en el subconjunto con imagen de ScienceQA; la generalizacion a otras tareas visuales no esta demostrada.
- Solo ingles; sin soporte multilingue declarado.
- Riesgo de alucinacion propio de un VLM de 0,5B ajustado sobre un dominio estrecho; no se documentan mitigaciones.
- Sesgos: no se documenta analisis de sesgos del dataset ScienceQA ni del modelo base.
- Licencia MIT, lo que permite uso comercial, pero el modelo base y la torre SigLIP pueden tener condiciones propias no detalladas en la informacion disponible.
- Artefacto de pesos parcial (solo delta quirurgico): requiere el modelo base y el runtime NeuralOps para reconstruir el modelo completo; no es un checkpoint autonomo.
- Resultados de benchmarks no verificados de forma independiente (`verified: false` en el model-index).
- Sin datos de contexto maximo, cuantizacion ni soporte de tool calling, lo que limita su uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-cluster-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion ClusterAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/cluster_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
