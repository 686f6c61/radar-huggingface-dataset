# mario-rc/emotional-rlaif-dpo-gemma-2-2b-it

## Resumen

`mario-rc/emotional-rlaif-dpo-gemma-2-2b-it` es un adaptador LoRA/PEFT entrenado sobre `google/gemma-2-2b-it` mediante optimizacion directa de preferencias (DPO), con el objetivo de alinear las respuestas del modelo hacia un tono emocionalmente adecuado. Lo desarrolla mario-rc como parte de una linea de investigacion sobre RLAIF emocional, publicada en el repositorio `Mario-RC/sml-emotional-rlaif`. No es un modelo completo: es un conjunto de pesos delta que debe cargarse sobre el modelo base con la libreria `peft`.

El problema que aborda es la falta de calidez y adecuacion afectiva en las respuestas de los asistentes conversacionales de pequeno tamano. Para ello se usa el dataset `mario-rc/aif-emotional-generation`, cuyas particiones `dialogues` y `aif_annotations` alimentan respectivamente la fase de SFT y la de preferencias DPO. El entrenamiento se realizo con LLaMA-Factory y la plantilla de prompt `gemma`.

Se trata de un artefacto de investigacion de alcance limitado: 87 descargas, 0 likes y un repositorio de 0,1 GB. Su relevancia es metodologica (pipeline RLAIF reproducible sobre modelos de 2B) mas que de rendimiento, ya que no se han publicado resultados de benchmarks. El autor mantiene una familia completa de adaptadores equivalentes sobre Gemma 2 (2B/9B), Gemma 4, GLM-4, Llama 3/3.2, Mistral 7B y Phi-3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base `google/gemma-2-2b-it`) con adaptador LoRA/PEFT entrenado por DPO |
| Parametros totales | 2,61 B en el modelo base; repositorio del adaptador de 0,1 GB (pesos delta LoRA) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 8192 tokens (heredada del modelo base; el adaptador no la modifica) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo fusionado admite las cuantizaciones del runtime de destino (int8/int4, Q4_K_M, etc.) |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, `library_name: peft`) |

## Arquitectura y entrenamiento

La base es `google/gemma-2-2b-it`, un transformer decoder-only de 2,61 B de parametros con tokenizador SentencePiece de 256 000 entradas y ventana de contexto de 8192 tokens. El adaptador en si es un modulo LoRA de bajo rango gestionado con PEFT (0,1 GB en disco), por lo que no altera ni la arquitectura ni el vocabulario del modelo original. Se aplica la plantilla de prompt `gemma` en inferencia.

El pipeline de alineacion es de dos etapas: primero un ajuste supervisado (SFT) sobre la particion `dialogues` del dataset `mario-rc/aif-emotional-generation`, y despues una optimizacion por preferencias (DPO) sobre la particion de preferencias `aif_annotations`. Todo el entrenamiento se ejecuto con LLaMA-Factory. No se especifican en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, el rango y alpha del LoRA, la tasa de aprendizaje ni el numero de pasos, por lo que esos hiperparametros figuran como no disponibles. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) mas alla del propio esquema de alineacion por preferencias.

## Capacidades

- Generacion de texto conversacional en ingles, con foco en respuestas de tono emocionalmente alineado.
- Dialogo multi-turno dentro de la ventana de contexto de 8192 tokens del modelo base.
- Ajuste fino de estilo afectivo: empatia, validacion emocional y formulacion de respuestas segun preferencias anotadas.
- Capacidades heredadas de `gemma-2-2b-it`: razonamiento basico, generacion de codigo sencillo, matematicas elementales y resumen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; no se ha entrenado especificamente para ello.
- Capacidades multilingues: solo ingles declarado en la model card (`language: en`).
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Integracion con el ecosistema PEFT/HuggingFace `transformers` y con la plantilla de chat `gemma`.

## Casos de uso

- Companero conversacional de apoyo emocional en prototipos de investigacion: el adaptador esta optimizado por DPO sobre preferencias anotadas, lo que permite estudiar como varia el tono empatico respecto al modelo base con un coste de computo de 2B parametros.
- Atencion al cliente con carga afectiva: gestion de reclamaciones o incidencias donde la formulacion importa; puede desplegarse como paso de reescritura sobre las respuestas generadas por un sistema mayor.
- Personajes no jugadores (NPC) en videojuegos: generacion de dialogos con registro emocional coherente en tiempo real, viable en GPUs de consumo gracias al tamano de 2B y a la posibilidad de cuantizar.
- Generacion de datos sinteticos de dialogo emocional: el adaptador puede producir conversaciones etiquetables que alimenten posteriores etapas de SFT o DPO en modelos mayores.
- Investigacion en alineacion comparada: sirve como brazo DPO frente al adaptador PPO equivalente (`emotional-rlaif-ppo-gemma-2-2b-it`) del mismo autor, permitiendo aislar el efecto del algoritmo de alineacion.
- Evaluacion de sesgos afectivos: util para medir si el ajuste por preferencias incrementa la adulacion (sycophancy) o la verbosidad en modelos pequenos.
- Asistente educativo con soporte afectivo: tutoria de bajo coste donde el modelo debe mantener un tono alentador; requiere revision humana por las limitaciones de conocimiento de un modelo de 2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara una entrada (`dpo-gemma-2-2b-it`) con la lista de resultados vacia, y no se aportan cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de alineacion emocional.

## Requisitos de hardware

- VRAM estimada para el modelo base completo: aproximadamente 5,2 GB en bf16/fp16; unos 2,7 GB en int8; en torno a 1,5-1,8 GB en cuantizacion de 4 bits.
- El adaptador LoRA anade un overhead minimo: el repositorio completo ocupa 0,1 GB, aunque en inferencia con PEFT el rango del adaptador debe mantenerse en precision completa junto a la base.
- GPU recomendadas: cualquier GPU con 8 GB o mas para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). Para cuantizacion de 4 bits basta con 4-6 GB de VRAM.
- Cabe en GPU de consumo: si, en la practica totalidad de las GPUs modernas con 6 GB o mas, siempre que se cuantice o se use carga en 8 bits.
- Opciones de despliegue: `transformers` + `peft` (ruta nativa del adaptador), vLLM con soporte de adaptadores LoRA, Text Generation Inference con adaptadores, y llama.cpp/Ollama tras fusionar el adaptador con la base (`merge_and_unload`) y convertir a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mario-rc/emotional-rlaif-dpo-gemma-2-2b-it` (este) | 2,61 B (base) | 8192 tokens | DPO sobre preferencias emocionales | Gemma | Adaptador publico en HF; 87 descargas |
| `mario-rc/emotional-rlaif-ppo-gemma-2-2b-it` | 2,61 B (base) | 8192 tokens | PPO sobre el mismo pipeline RLAIF | Gemma | Adaptador publico en HF |
| `google/gemma-2-2b-it` | 2,61 B | 8192 tokens | RLHF/instruccion estandar de Google | Gemma | Modelo completo publico en HF |
| Modelos de ~2-3B con foco emocional (p. ej. variantes de Llama 3.2 o Phi-3 ajustadas) | 2-4 B | Variable segun base | Variable | Variable | No disponible: no se han identificado alternativas equivalentes en la informacion proporcionada |

La comparacion cuantitativa de rendimiento entre estas opciones no esta disponible: el autor no publica metricas para ninguno de los adaptadores de la familia.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: sin `google/gemma-2-2b-it` no puede ejecutarse, y debe cargarse con PEFT respetando la plantilla `gemma`.
- Solo ingles declarado. No hay evidencia de comportamiento correcto en castellano u otros idiomas.
- Sin benchmarks publicados: no existe ninguna medida objetiva de mejora frente al modelo base ni frente al adaptador PPO hermano.
- Escala reducida (2,61 B): alta probabilidad de alucinacion en tareas factuales, razonamiento complejo, matematicas y codigo no trivial.
- Riesgo de sesgo por el dataset de preferencias: al optimizar DPO sobre anotaciones emocionales de origen desconocido y tamano no documentado, puede inducir adulacion, verbosidad excesiva o un tono empatico estereotipado.
- No apto para uso clinico, diagnostico ni intervencion en salud mental sin supervision profesional y validacion externa.
- Licencia Gemma: el uso comercial esta permitido sujeto a los Gemma Terms of Use y a la politica de usos prohibidos de Google, que debe verificarse antes de cualquier despliegue en produccion.
- Repositorio de investigacion: 0 likes, 87 descargas y sin mantenimiento documentado; las fechas declaradas de creacion (2026-06-04) y actualizacion (2026-09-18) no van acompanadas de changelog.
- No hay informacion sobre tool calling, agentes, cuantizaciones validadas ni latencias, por lo que cualquier uso en produccion exige una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-2-2b-it
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mario-rc/aif-emotional-generation
- Repositorio del proyecto: https://github.com/Mario-RC/sml-emotional-rlaif
- Adaptador con PPO (variante comparable): https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-2-2b-it
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- PEFT (libreria de carga del adaptador): https://github.com/huggingface/peft
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces utiles son los de HuggingFace y GitHub listados arriba.
