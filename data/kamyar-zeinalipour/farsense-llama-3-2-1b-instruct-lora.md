# Kamyar-zeinalipour/FarSense-Llama-3.2-1B-Instruct-LoRA

## Resumen

FarSense-Llama-3.2-1B-Instruct-LoRA es un adaptador LoRA (PEFT) publicado por Kamyar Zeinalipour que especializa el modelo base meta-llama/Llama-3.2-1B-Instruct en razonamiento de sentido comun en farsi (persa) con anclaje al contexto. El adaptador se entrena sobre el split de entrenamiento del benchmark FarSense, presentado en el articulo *FarSense: A Comprehensive Commonsense Benchmark and Evaluation Framework for the Farsi Language* (IJCNLP-AACL 2025). El objetivo es que un modelo pequeno de 1B parametros responda correctamente a tareas cotidianas de sentido comun en farsi con formato JSON: juicios verdadero/falso, eleccion multiple, completado tipo cloze, causa→efecto, contrafactuales y preguntas de "por que".

El modelo base es un transformer decoder-only de 1B parametros de la familia Llama 3.2, con contexto de 128K tokens y licencia Llama 3.2. El adaptador no modifica la arquitectura: aplica LoRA con rango 128 y alpha 256 sobre las proyecciones q/k/v/o, gate/up/down, y ademas sobre `embed_tokens` y `lm_head`, lo que explica su tamano de 1,3 GB en disco. Es relevante porque demuestra que un ajuste fino ligero y de bajo coste (55 minutos en 3 GPU RTX A6000) puede elevar de forma sustancial el rendimiento de un modelo de 1B en una tarea linguistica especifica y de bajos recursos como el sentido comun en farsi.

La ficha se centra en un adaptador de investigacion, no en un modelo de proposito general: su valor esta en la mejora medida sobre el benchmark FarSense (de 0,227 a 0,450 en la puntuacion global) y en servir como referencia reproducible para la comunidad de PLN en lenguas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA (PEFT) |
| Parametros totales | 1B (modelo base) + adaptador LoRA (r=128, alpha=256) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.2, que soporta hasta 128K tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Llama 3.2) |
| Idiomas soportados | farsi (persa) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre meta-llama/Llama-3.2-1B-Instruct, un transformer decoder-only de 1B parametros. La tecnica es LoRA con rango 128, alpha 256 y dropout 0,1, aplicada no solo a las proyecciones de atencion (q/k/v/o) y de la MLP (gate/up/down), sino tambien a `embed_tokens` y `lm_head`; PEFT almacena estas capas junto al adaptador, lo que justifica el tamano de 1,3 GB del repositorio. El entrenamiento usa el split de entrenamiento de FarSense / CS_Farsi: 4.000 escenarios y 28.000 items.

El regimen de entrenamiento fue de 3 epocas con AdamW, learning rate 1e-4, decaimiento coseno sin warm-up, weight decay 1e-4, batch de 4 secuencias por GPU con 2 pasos de acumulacion de gradiente y empaquetado a 2.048 tokens. Se uso precision bf16, DeepSpeed ZeRO-3, Flash Attention 2 y recorte de gradiente de 1,0 con semilla 100. El entrenamiento completo se ejecuto en 3 GPU NVIDIA RTX A6000 (48 GB) durante 55 minutos. La decodificacion empleada en la evaluacion fue temperature 0,8, top-p 0,95, top-k 50, penalizacion de repeticion 1,1 y un maximo de 256 tokens nuevos.

## Capacidades

- Generacion de texto y razonamiento de sentido comun en farsi con anclaje al contexto proporcionado en el prompt.
- Respuesta en formato JSON estructurado para tareas de clasificacion y generacion: juicios verdadero/falso, eleccion multiple, completado cloze, causa→efecto, contrafactuales y preguntas de "por que".
- Razonamiento de un solo turno orientado a tarea; el adaptador esta especializado en el formato de items de FarSense.
- Capacidad multilingue limitada: el adaptador esta entrenado para farsi (etiqueta de idioma `fa`); no se documenta soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- Hereda del modelo base la interfaz de chat (chat template de Llama 3.2) y la generacion autoregresiva estandar.

## Casos de uso

- Evaluacion de sentido comun en farsi: el adaptador sirve como referencia reproducible para medir el rendimiento de modelos pequenos en el benchmark FarSense, con scripts de evaluacion en el repositorio GitHub del proyecto.
- Investigacion en PLN de bajos recursos: permite estudiar como el ajuste fino ligero (LoRA) mejora tareas de razonamiento en una lengua con pocos recursos, comparando el modelo base (0,227) con el ajustado (0,450).
- Clasificacion de enunciados cotidianos en farsi: el modelo puede emitir juicios verdadero/falso o de eleccion multiple sobre escenarios diarios, util para anotacion asistida de corpus.
- Generacion de explicaciones causales: con una puntuacion de texto de 0,318 en causa→efecto, puede emplearse para generar borradores de explicaciones que luego se revisan manualmente en entornos de anotacion.
- Razonamiento contrafactual en farsi: con una puntuacion de 0,331 en contrafactuales, adecuado para prototipos de sistemas que exploran escenarios hipoteticos en persa.
- Base para experimentos de destilacion o comparacion de tamanos: al formar parte de una familia con adaptadores para 1B, 3B y 8B, permite estudiar la relacion entre escala y rendimiento en la misma tarea.
- Prototipado de asistentes conversacionales en farsi de bajo coste: al caber en una unica GPU consumer, puede desplegarse para demos internas de respuesta a preguntas de sentido comun.

## Benchmarks y rendimiento

Resultados en el split de test de FarSense (1.470 items, 210 escenarios) segun la model card:

| Metrica | Base (zero-shot) | FarSense LoRA | Delta |
|---|---:|---:|---:|
| T/F-True accuracy | 0,767 | 0,905 | +0,138 |
| T/F-False accuracy | 0,367 | 0,419 | +0,052 |
| Multiple-choice accuracy | 0,005 | 0,938 | +0,933 |
| Cloze accuracy | 0,005 | 0,067 | +0,062 |
| Cause→Effect (text score) | 0,172 | 0,318 | +0,146 |
| Counterfactual (text score) | 0,094 | 0,331 | +0,237 |
| Explanation (text score) | 0,199 | 0,310 | +0,111 |
| Cloze (text score) | 0,207 | 0,315 | +0,108 |
| Classification | 0,286 | 0,582 | +0,296 |
| Free-form | 0,168 | 0,319 | +0,150 |
| Overall | 0,227 | 0,450 | +0,223 |

Las exactitudes son exact match. Las puntuaciones de texto promedian BLEU-4, ROUGE-L F1, BERTScore F1 y similitud coseno de embeddings. *Classification* promedia las cuatro exactitudes, *Free-form* las cuatro puntuaciones de texto y *Overall* ambas, segun la seccion 4.2 del articulo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1B en bf16 ocupa aproximadamente 2 GB de pesos; con el adaptador fusionado (`merge_and_unload`) el consumo total ronda los 2-3 GB, mas el espacio de activaciones y cache KV segun la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para inferencia en bf16; el entrenamiento se realizo en 3 NVIDIA RTX A6000 (48 GB), lo que indica que el ajuste fino completo requiere hardware de gama profesional.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores con 8 GB o mas de VRAM.
- Opciones de despliegue: el ejemplo de la model card usa `transformers` + `peft` con `merge_and_unload`; tambien es compatible con vLLM, TGI y llama.cpp tras convertir el modelo fusionado a los formatos correspondientes (GGUF para llama.cpp/Ollama).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Comparacion dentro de la familia FarSense (misma tarea y mismo benchmark):

| Modelo | Parametros | Overall base → fine-tuned | Licencia |
|---|---:|---:|---|
| FarSense-Llama-3.2-1B-Instruct-LoRA (este) | 1B | 0,227 → 0,450 | llama3.2 |
| FarSense-Llama-3.2-3B-Instruct-LoRA | 3B | 0,449 → 0,529 | llama3.2 |
| FarSense-Llama-3.1-8B-Instruct-LoRA | 8B | no disponible en la informacion proporcionada | llama3.2 |

El adaptador de 1B parte de una base mas debil (0,227) que el de 3B (0,449) y logra una mejora absoluta mayor (+0,223 frente a +0,080), aunque el de 3B alcanza un rendimiento final superior (0,529 frente a 0,450). No se dispone de datos del adaptador de 8B en la informacion proporcionada. No se han identificado en la informacion disponible otros modelos comparables fuera de la familia FarSense.

## Limitaciones y advertencias

- El adaptador esta especializado en el formato y las tareas del benchmark FarSense; su uso fuera de ese dominio puede degradar el comportamiento del modelo base.
- El rendimiento en tareas de completado cloze es muy bajo (exactitud 0,067), lo que limita su uso para ese tipo de tarea.
- La exactitud en juicios verdadero/falso cuando la respuesta es "falso" es baja (0,419), lo que sugiere un sesgo hacia respuestas afirmativas.
- Riesgo de alucinacion inherente a los modelos de 1B parametros; las salidas de formato libre deben validarse.
- Soporte limitado a farsi; no se documenta calidad en otros idiomas.
- La licencia llama3.2 impone restricciones de uso comercial y requiere aceptar los terminos del modelo base, que esta gated en Hugging Face.
- El adaptador requiere cargar el modelo base y fusionarlo o aplicarlo con PEFT; no es un modelo autonomo.
- No se documentan evaluaciones de sesgo, seguridad ni robustez adversarial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.2-1B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Articulo (IJCNLP-AACL 2025): https://aclanthology.org/2025.ijcnlp-long.187/
- Repositorio GitHub: https://github.com/KamyarZeinalipour/FarSense
- Dataset CS_Farsi: https://huggingface.co/datasets/Kamyar-zeinalipour/CS_Farsi
- Coleccion FarSense: https://huggingface.co/collections/Kamyar-zeinalipour/farsense-ijcnlp-aacl-2025-6af4553f756c4d246fe7f56c
- Adaptador 3B: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.2-3B-Instruct-LoRA
- Adaptador 8B: https://huggingface.co/Kamyar-zeinalipour/FarSense-Llama-3.1-8B-Instruct-LoRA
