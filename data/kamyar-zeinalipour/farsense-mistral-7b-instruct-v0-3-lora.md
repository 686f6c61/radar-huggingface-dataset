# Kamyar-zeinalipour/FarSense-Mistral-7B-Instruct-v0.3-LoRA

## Resumen

FarSense-Mistral-7B-Instruct-v0.3-LoRA es un adaptador LoRA (PEFT) que especializa el modelo mistralai/Mistral-7B-Instruct-v0.3 para razonamiento de sentido comun anclado en contexto en farsi (persa). Lo desarrolla Kamyar Zeinalipour y se publica junto al articulo "FarSense: A Comprehensive Commonsense Benchmark and Evaluation Framework for the Farsi Language" (IJCNLP-AACL 2025). El adaptador forma parte de una familia de seis adaptadores liberados con el paper, entrenados sobre distintos modelos base (Llama-3.2-1B, Llama-3.2-3B, Llama-3.1-8B y Mistral-7B, entre otros).

El problema que aborda es la escasez de evaluacion y ajuste especifico para razonamiento de sentido comun en farsi: los modelos multilingues genericos rinden de forma notablemente inferior en tareas de sentido comun en persa. El adaptador convierte cada item FarSense en una peticion de respuesta JSON unica que cubre juicios verdadero/falso, eleccion multiple, completado de huecos (cloze), causa→efecto, contrafactuales y preguntas de tipo "por que". Sobre el split de test, el ajuste eleva la puntuacion global de 0,496 a 0,649 (+0,153).

El modelo base es un transformer decoder-only de 7B parametros con ventana de contexto de 32.768 tokens (segun la especificacion de Mistral-7B-Instruct-v0.3). El adaptador ocupa 1,2 GB en el repositorio porque el LoRA se aplico tambien a `embed_tokens` y `lm_head`, y PEFT almacena esas capas junto al adaptador. La licencia declarada es Apache-2.0, aunque el acceso al modelo base esta restringido (gated) y requiere aceptar sus terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral-7B-Instruct-v0.3) con adaptador LoRA (PEFT) |
| Parametros totales | 7B en el modelo base; el adaptador se almacena como delta LoRA (1,2 GB en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (no se especifica en la model card del adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en bf16; el modelo base admite las cuantizaciones habituales de Mistral-7B) |
| Idiomas soportados | farsi (persa); el modelo base es multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only de 7B parametros. El ajuste es un LoRA con r = 128, α = 256 y dropout 0,1, aplicado sobre las proyecciones q/k/v/o y gate/up/down de la atencion y el MLP, y ademas sobre `embed_tokens` y `lm_head` (de ahi el tamano de 1,2 GB del repositorio). El entrenamiento usa el split de train de FarSense / CS_Farsi: 4.000 escenarios y 28.000 items. La programacion es de 3 epocas con AdamW, learning rate 1e-4, decaimiento coseno, sin warm-up, weight decay 1e-4; batch de 4 secuencias por GPU con 2 pasos de acumulacion de gradiente, empaquetado a 2.048 tokens; precision bf16, DeepSpeed ZeRO-3, Flash Attention 2 y clipping de gradiente 1,0 con semilla 100. El entrenamiento se ejecuto en 3 × NVIDIA RTX A6000 (48 GB) durante 9 h 37 min.

No se indica en la informacion disponible si hubo RLHF, DPO u otras etapas de alineacion adicionales mas alla del ajuste supervisado sobre el dataset. La innovacion principal es el propio benchmark FarSense y el esquema de evaluacion: cada item exige una unica respuesta JSON y las metricas separan clasificacion (exact match) de texto libre (media de BLEU-4, ROUGE-L F1, BERTScore F1 y similitud coseno de embeddings).

## Capacidades

- Generacion de texto en farsi con formato de respuesta JSON controlado.
- Razonamiento de sentido comun anclado en contexto: juicios verdadero/falso, eleccion multiple, completado de huecos, causa→efecto, contrafactuales y preguntas de explicacion ("por que").
- Clasificacion binaria y de eleccion multiple con exact match.
- Generacion de texto libre evaluada con metricas de solapamiento y similitud semantica.
- Capacidades heredadas del modelo base Mistral-7B-Instruct-v0.3 (generacion general, razonamiento, codigo), aunque el adaptador esta especializado en farsi y sentido comun.
- Soporte de tool calling / function calling: no disponible de forma especifica en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma especifica en la informacion proporcionada.
- Capacidades multilingues: el adaptador declara solo farsi; el modelo base es multilingue pero el ajuste esta orientado a persa.

## Casos de uso

- Evaluacion de sentido comun en persa: usar el adaptador como referencia ajustada para medir la brecha entre modelos base y especializados en el benchmark FarSense, con las metricas de clasificacion y texto libre del paper.
- Investigacion en adaptadores LoRA para lenguas de bajos recursos: el repositorio incluye configuracion de entrenamiento (r, α, capas objetivo, DeepSpeed ZeRO-3) reutilizable para reproducir el ajuste en otros idiomas.
- Sistemas de pregunta-respuesta en farsi con salida JSON: el adaptador responde en formato estructurado unico, lo que facilita su integracion en pipelines que parsean la respuesta y aplican validacion de esquema.
- Clasificacion de afirmaciones y deteccion de inconsistencias en persa: las tareas de verdadero/falso y causa→efecto permiten construir clasificadores de plausibilidad sobre textos en farsi.
- Generacion de explicaciones y contrafactuales en persa: las tareas de explicacion y contrafactual del benchmark sirven para prototipar sistemas que justifican decisiones en lenguaje natural.
- Completado de huecos para evaluacion educativa o de comprension lectora en farsi: la tarea cloze del adaptador puede emplearse para generar y puntuar ejercicios de relleno de huecos.
- Base para ajuste adicional en dominios especificos en persa: al ser un adaptador PEFT pequeno (1,2 GB), puede combinarse o reajustarse sobre el modelo base para tareas concretas sin reentrenar los 7B completos.

## Benchmarks y rendimiento

Resultados en el split de test de FarSense (1.470 items, 210 escenarios), con decodificacion temperature 0,8, top-p 0,95, top-k 50, repetition penalty 1,1 y maximo 256 tokens nuevos:

| Metrica | Base (zero-shot) | FarSense LoRA | Δ |
|---|---:|---:|---:|
| T/F-True accuracy | 0,743 | 0,919 | +0,176 |
| T/F-False accuracy | 0,910 | 0,957 | +0,048 |
| Multiple-choice accuracy | 0,638 | 0,962 | +0,324 |
| Cloze accuracy | 0,171 | 0,429 | +0,257 |
| Cause→Effect (text score) | 0,365 | 0,444 | +0,079 |
| Counterfactual (text score) | 0,372 | 0,444 | +0,072 |
| Explanation (text score) | 0,319 | 0,421 | +0,101 |
| Cloze (text score) | 0,451 | 0,619 | +0,168 |
| Classification | 0,615 | 0,817 | +0,201 |
| Free-form | 0,377 | 0,482 | +0,105 |
| Overall | 0,496 | 0,649 | +0,153 |

Las exactitudes son exact match; los text scores promedian BLEU-4, ROUGE-L F1, BERTScore F1 y similitud coseno de embeddings. Classification promedia las cuatro exactitudes; Free-form, los cuatro text scores; Overall, ambas.

## Requisitos de hardware

- El adaptador se fusiona con `merge_and_unload()` sobre el modelo base de 7B; la inferencia requiere cargar los 7B completos en memoria.
- VRAM estimada: ~14-16 GB en bf16 para los 7B; ~8-10 GB en cuantizacion de 8 bits; ~4-5 GB en cuantizacion de 4 bits (estimaciones habituales para un modelo de 7B, no publicadas en la model card).
- GPU recomendadas: NVIDIA RTX A6000 (48 GB) para entrenamiento; para inferencia, A100/H100 o consumer GPUs con al menos 8-16 GB de VRAM (RTX 3090, RTX 4090, etc.).
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM usando cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers + PEFT (metodo documentado), vLLM, llama.cpp/Ollama y TGI tras fusionar el adaptador en el modelo base (no documentado en la model card).
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El modelo base esta gated: requiere aceptar sus terminos en su pagina de Hugging Face y ejecutar `huggingface-cli login` antes de cargarlo.

## Comparativa con modelos similares

Comparativa dentro de la familia FarSense (mismo benchmark, misma metodologia):

| Modelo base | Parametros | Adaptador | Overall (base → fine-tuned) |
|---|---:|---|---|
| Llama-3.2-1B-Instruct | 1B | FarSense-Llama-3.2-1B-Instruct-LoRA | 0,227 → 0,450 |
| Llama-3.2-3B-Instruct | 3B | FarSense-Llama-3.2-3B-Instruct-LoRA | 0,449 → 0,529 |
| Llama-3.1-8B-Instruct | 8B | FarSense-Llama-3.1-8B-Instruct-LoRA | no disponible en la informacion proporcionada |
| Mistral-7B-Instruct-v0.3 | 7B | FarSense-Mistral-7B-Instruct-v0.3-LoRA (este modelo) | 0,496 → 0,649 |

La familia incluye seis adaptadores en total; la model card solo detalla los resultados de Llama-3.2-1B, Llama-3.2-3B y Mistral-7B. No se dispone de comparacion con modelos no pertenecientes a FarSense en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta especializado en farsi y en el formato del benchmark FarSense; su rendimiento fuera de ese dominio o idioma no esta documentado.
- Riesgo de alucinacion: el modelo base es un LLM generativo; el adaptador no elimina este riesgo, aunque el formato de respuesta JSON acotado reduce la variabilidad.
- La tarea cloze sigue siendo debil incluso tras el ajuste (exactitud 0,429; text score 0,619), lo que indica margen de mejora claro.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion.
- El modelo base esta gated y sujeto a los terminos de Mistral; la licencia Apache-2.0 del adaptador no sustituye las condiciones del modelo base.
- El adaptador ocupa 1,2 GB porque incluye capas de embedding y lm_head, lo que aumenta el coste de almacenamiento frente a un LoRA convencional.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion proporcionada.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Kamyar-zeinalipour/FarSense-Mistral-7B-Instruct-v0.3-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper (IJCNLP-AACL 2025): https://aclanthology.org/2025.ijcnlp-long.187/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/FarSense
- Dataset CS_Farsi: https://huggingface.co/datasets/Kamyar-zeinalipour/CS_Farsi
- Coleccion FarSense: https://huggingface.co/collections/Kamyar-zeinalipour/farsense-ijcnlp-aacl-2025-6af4553f756c4d246fe7f56c
- Adaptador FarSense-Llama-3.2-1B-Instruct-LoRA: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.2-1B-Instruct-LoRA
- Adaptador FarSense-Llama-3.2-3B-Instruct-LoRA: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.2-3B-Instruct-LoRA
