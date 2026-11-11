# Kamyar-zeinalipour/FarSense-Llama-3.1-8B-Instruct-LoRA

## Resumen

FarSense-Llama-3.1-8B-Instruct-LoRA es un adaptador LoRA publicado por Kamyar Zeinalipour que especializa el modelo base meta-llama/Llama-3.1-8B-Instruct en razonamiento de sentido común en farsi (persa) anclado al contexto. El adaptador se entrena sobre el split de entrenamiento del benchmark FarSense, presentado en el articulo "FarSense: A Comprehensive Commonsense Benchmark and Evaluation Framework for the Farsi Language" (IJCNLP-AACL 2025). El problema que aborda es la brecha de rendimiento de los LLM multilingues en tareas de sentido común en farsi, especialmente en formatos de respuesta libre como cloze y explicaciones causales.

El modelo no es un modelo completo, sino un adaptador PEFT que se carga sobre Llama-3.1-8B-Instruct (8.000 millones de parametros, arquitectura transformer densa con atencion por grupos y ventana de contexto de 128.000 tokens en el modelo base). El adaptador aplica LoRA no solo a las proyecciones de atencion y MLP, sino tambien a `embed_tokens` y `lm_head`, lo que explica su tamano de 2,8 GB. Es relevante ahora porque forma parte de una familia de seis adaptadores liberados junto al paper, con resultados reproducibles sobre un benchmark especifico y scripts de evaluacion publicos.

La especializacion es estrecha: el adaptador mejora la puntuacion global en FarSense de 0,598 a 0,642 (+0,044), con la mayor ganancia en cloze (+0,110) y en juicios True/False verdaderos (+0,086). No esta pensado como modelo generalista en farsi, sino como un componente afinado para tareas de sentido común con formato JSON y contexto de escenario cotidiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8B en el modelo base; adaptador LoRA con r=128 sobre q/k/v/o, gate/up/down, embed_tokens y lm_head |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para el adaptador; el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | farsi (persa, `fa`) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer denso de 8.000 millones de parametros con atencion por grupos (GQA) y RoPE. La intervencion LoRA usa rango r=128, alpha=256 y dropout 0,1, y se aplica a las proyecciones q/k/v/o, gate/up/down y tambien a `embed_tokens` y `lm_head`; esta ultima circunstancia explica que el repositorio pese 2,8 GB en lugar de los pocos cientos de MB habituales en un adaptador LoRA de 8B. El adaptador se fusiona con `merge_and_unload()` para inferencia.

El entrenamiento usa el split de entrenamiento de FarSense / CS_Farsi: 4.000 escenarios y 28.000 items. La schedule es de 3 epocas con AdamW, learning rate 1e-4, decaimiento coseno, sin warm-up y weight decay 1e-4. El batch es de 4 secuencias por GPU con 2 pasos de acumulacion de gradientes, empaquetado a 2.048 tokens, en precision bf16 con DeepSpeed ZeRO-3 y Flash Attention 2, clipping de gradiente 1,0 y semilla 100. El entrenamiento se ejecuto en 3 x NVIDIA RTX A6000 (48 GB) durante 4 h 03 min. La decodificacion usada en evaluacion es temperature 0,8, top-p 0,95, top-k 50, repetition penalty 1,1 y un maximo de 256 tokens nuevos. No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto en farsi con formato de respuesta JSON, orientada a tareas de sentido común.
- Juicios True/False sobre escenarios cotidianos en farsi.
- Preguntas de eleccion multiple (multiple choice) sobre sentido común.
- Completado cloze (rellenar huecos) en farsi.
- Razonamiento causa→efecto en texto libre.
- Razonamiento contrafactual en texto libre.
- Generacion de explicaciones ("why" questions) en farsi.
- Aprovecha las capacidades del modelo base Llama-3.1-8B-Instruct: tool calling, razonamiento multi-paso y contexto largo, aunque el adaptador no las especializa ni las evalua.
- Capacidad multilingue limitada al modelo base; el adaptador esta entrenado exclusivamente en farsi.

## Casos de uso

- Evaluacion de sentido común en farsi: el adaptador sirve como referencia afinada para medir la mejora sobre el modelo base en el benchmark FarSense, con scripts de evaluacion publicos en GitHub. Es adecuado porque reproduce exactamente la configuracion de decodificacion del paper.
- Investigacion en adaptadores PEFT para lenguas de bajos recursos: permite estudiar el efecto de aplicar LoRA a `embed_tokens` y `lm_head` en un modelo de 8B, comparando con los otros cinco adaptadores de la familia FarSense (1B, 3B y 8B).
- Sistemas de preguntas y respuestas sobre escenarios cotidianos en persa: el modelo responde con JSON estructurado a preguntas de causa-efecto y contrafactuales, lo que facilita su integracion en pipelines que parsean la salida.
- Generacion de explicaciones en farsi para asistentes educativos: la mejora en el text score de explicacion (0,399 → 0,427) lo hace util para generar justificaciones breves de por que un escenario tiene un resultado dado.
- Benchmarking de modelos base en persa: al ser un adaptador reproducible sobre Llama-3.1-8B-Instruct, se puede usar como linea base afinada frente a otros modelos multilingues en tareas de sentido común.
- Prototipado de clasificadores de sentido común en farsi: las tareas de True/False y multiple choice alcanzan precisiones de 0,929 y 0,967 respectivamente, utiles para etiquetado asistido de escenarios.

## Benchmarks y rendimiento

Resultados en el split de test de FarSense (1.470 items, 210 escenarios). Las precisiones son exact match; los text scores promedian BLEU-4, ROUGE-L F1, BERTScore F1 y similitud coseno de embeddings.

| Metrica | Base (zero-shot) | FarSense LoRA | Delta |
|---|---:|---:|---:|
| T/F-True accuracy | 0,843 | 0,929 | +0,086 |
| T/F-False accuracy | 0,967 | 0,971 | +0,005 |
| Multiple-choice accuracy | 0,957 | 0,967 | +0,010 |
| Cloze accuracy | 0,276 | 0,386 | +0,110 |
| Cause→Effect (text score) | 0,395 | 0,438 | +0,042 |
| Counterfactual (text score) | 0,396 | 0,441 | +0,045 |
| Explanation (text score) | 0,399 | 0,427 | +0,029 |
| Cloze (text score) | 0,551 | 0,578 | +0,027 |
| Classification | 0,761 | 0,813 | +0,052 |
| Free-form | 0,435 | 0,471 | +0,036 |
| Overall | 0,598 | 0,642 | +0,044 |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador se fusiona con el modelo base de 8B; en bf16 requiere aproximadamente 16 GB de VRAM para los pesos, mas memoria para el contexto y el cache KV.
- GPU recomendadas: NVIDIA RTX A6000 (48 GB), A100 (40/80 GB), H100 (80 GB) para entrenamiento o inferencia con contexto largo; RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB puede requerir cuantizacion del modelo base (no documentada en la informacion disponible).
- Opciones de despliegue: transformers + PEFT (flujo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador en la informacion proporcionada, aunque el modelo base es compatible con ellos.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento uso 3 x RTX A6000 durante 4 h 03 min, dato no extrapolable a inferencia.

## Comparativa con modelos similares

Comparacion con los otros adaptadores de la familia FarSense y con el modelo base:

| Modelo | Parametros | Overall base → fine-tuned | Licencia |
|---|---:|---|---|
| FarSense-Llama-3.2-1B-Instruct-LoRA | 1B | 0,227 → 0,450 | llama3.1 |
| FarSense-Llama-3.2-3B-Instruct-LoRA | 3B | 0,449 → 0,529 | llama3.1 |
| FarSense-Llama-3.1-8B-Instruct-LoRA (este) | 8B | 0,598 → 0,642 | llama3.1 |
| Llama-3.1-8B-Instruct (base, zero-shot) | 8B | 0,598 | llama3.1 |

No se dispone en la informacion proporcionada de resultados de otros modelos comparables (por ejemplo, modelos multilingues de otros fabricantes) sobre el benchmark FarSense.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado solo para tareas de sentido común en farsi con formato JSON; no se evalua su rendimiento en otras tareas ni idiomas.
- El modelo base esta gated: es necesario aceptar los terminos en la pagina de meta-llama/Llama-3.1-8B-Instruct y autenticarse con `huggingface-cli login`.
- Licencia llama3.1: impone restricciones de uso comercial y requiere cumplir los terminos de la licencia de Meta; revisar antes de produccion.
- Riesgo de alucinacion: como todo LLM generativo, puede producir explicaciones plausibles pero incorrectas; los text scores de respuesta libre (0,427–0,578) indican margen de error considerable.
- Rendimiento limitado en cloze: la precision exact match en cloze es de 0,386 tras el fine-tuning, lo que refleja dificultad persistente en ese formato.
- Sesgos: no se documentan analisis de sesgos en la informacion proporcionada; el dataset FarSense esta construido sobre escenarios cotidianos y puede heredar sesgos culturales del corpus.
- Contexto e idioma: el adaptador no amplia ni modifica la ventana de contexto del modelo base; su cobertura linguistica esta limitada al farsi.
- Tamano del adaptador: 2,8 GB por incluir `embed_tokens` y `lm_head` en el LoRA, lo que aumenta los requisitos de almacenamiento frente a un adaptador convencional.
- Sin datos de uso en produccion: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de despliegues reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.1-8B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset CS_Farsi: https://huggingface.co/datasets/Kamyar-zeinalipour/CS_Farsi
- Paper (IJCNLP-AACL 2025): https://aclanthology.org/2025.ijcnlp-long.187/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/FarSense
- Coleccion FarSense: https://huggingface.co/collections/Kamyar-zeinalipour/farsense-ijcnlp-aacl-2025-6af4553f756c4d246fe7f56c
- Adaptador 1B: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.2-1B-Instruct-LoRA
- Adaptador 3B: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.2-3B-Instruct-LoRA
