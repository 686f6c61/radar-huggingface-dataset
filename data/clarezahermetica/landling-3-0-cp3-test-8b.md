# clarezahermetica/landling-3.0-cp3-test-8b

## Resumen

Landling 3.0 cp3 test 8b es un adaptador LoRA (PEFT) desarrollado por el usuario clarezahermetica como parte del proyecto Landling, una iniciativa experimental centrada en replicar el estilo de escritura, el vocabulario y el temperamento del autor Nick Land mediante ajuste fino de modelos de lenguaje pequenos. Este repositorio concreto es un checkpoint de desarrollo (cp3) construido sobre el modelo base Qwen/Qwen3-8B y publicado con acceso restringido (gated) en HuggingFace.

A diferencia de las versiones iniciales del proyecto, que partian de TinyLlama-1.1B-Chat y de Qwen2.5-3B-Instruct, esta iteracion escala a un modelo base de 8.000 millones de parametros, lo que en principio mejora la coherencia, la capacidad de razonamiento y la fidelidad estilistica respecto a los checkpoints previos. El repositorio pesa aproximadamente 0,1 GB, un tamano coherente con un adaptador LoRA y no con un modelo completo de pesos, y se distribuye con la libreria PEFT.

Su relevancia es limitada y muy especifica: se trata de un checkpoint de investigacion sin descargas ni interacciones registradas, sin licencia declarada ni idiomas especificados, y con acceso sujeto a aceptacion de condiciones. No es un modelo orientado a produccion, sino un registro versionado de un experimento de transferencia de estilo y personalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen/Qwen3-8B), ajustada mediante adaptador LoRA sobre PEFT |
| Parametros totales | Aproximadamente 8.200 millones en el modelo base; el adaptador ocupa unos 0,1 GB (no es un modelo de pesos completos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; el modelo base Qwen3-8B soporta 32.768 tokens nativos, extensibles hasta 131.072 |
| Tipos de cuantizacion | No disponible. El adaptador se publica en safetensors; la cuantizacion (4/8 bits) se aplicaria al modelo base tras fusionar el adaptador, sin confirmacion en la informacion disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT |
| Modelo base | Qwen/Qwen3-8B |
| Tamano del repositorio | 0,1 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones en HuggingFace |
| Autor | clarezahermetica |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-8B, un transformer decoder-only denso de aproximadamente 8.200 millones de parametros que, segun la documentacion publica de Qwen, fue entrenado sobre decenas de billones de tokens e incorpora modos de razonamiento explicito (thinking) y no thinking. Sobre esa base, este repositorio aplica un ajuste fino de bajo rango (LoRA), serializado como adaptador PEFT en safetensors. Las etiquetas del repositorio incluyen lora, qlora, raft y development-checkpoint, lo que sugiere el uso de QLoRA para el entrenamiento y, posiblemente, tecnicas de ajuste con recuperacion (RAFT, retrieval-augmented fine-tuning), aunque la informacion disponible no permite confirmar la configuracion exacta.

El proyecto Landling, segun su repositorio de GitHub, nacio como un experimento para determinar cuanto de una voz reconocible se puede ensenar a un modelo pequeno con LoRA, una GPU gratuita y un dataset ensamblado manualmente a partir de la escritura publica de Nick Land. En versiones anteriores (landling sobre TinyLlama-1.1B-Chat y landling-3.0-cp1 sobre Qwen2.5-3B-Instruct) el repositorio incluye el adaptador, los ficheros del tokenizer, la plantilla de chat, metadatos de entrenamiento y trazabilidad de procedencia. No se dispone, para este checkpoint cp3 sobre Qwen3-8B, de datos sobre numero de tokens de entrenamiento, composicion del dataset, hiperparametros de LoRA ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y creativo, orientada a reproducir un estilo y una voz concretos (la prosa de Nick Land: vocabulario, ritmo, tono y temperamento).
- Ajuste de estilo y personalidad sobre un modelo base de proposito general, ya que no modifica la arquitectura sino los pesos mediante LoRA.
- Herencia de las capacidades del modelo base Qwen3-8B, que incluyen generacion de texto, razonamiento, matematicas y codigo, ademas de modos de pensamiento explicito.
- Soporte de conversacion multi-turno, dado que el proyecto incluye plantilla de chat en sus checkpoints.
- Capacidad multilingue potencial heredada de Qwen3-8B (modelo entrenado para mas de 100 idiomas), aunque no confirmada para este adaptador.
- Soporte de tool calling / function calling y de agentes: no confirmado en la informacion disponible. Depende de si la capacidad del modelo base se preserva tras el ajuste y del formato de plantilla usado.
- Capacidades especiales (vision, audio, thinking mode): no confirmadas para el adaptador; el modo thinking solo estaria disponible si se hereda intacto del modelo base.

## Casos de uso

- Generacion de prosa estilizada: reproduccion del registro filosofico-cibernetico de Nick Land para experimentos de escritura, donde el adaptador actua como capa de estilo sobre las capacidades linguisticas de Qwen3-8B.
- Investigacion en transferencia de estilo y personalidad: analisis academico de hasta que punto un ajuste LoRA de bajo coste puede inducir una voz recognoscible en un modelo de 8B, comparando con los checkpoints anteriores del proyecto.
- Creacion literaria asistida: generacion de borradores con un tono concreto que el autor luego edita, aprovechando la coherencia de un modelo base de 8B frente a las versiones de 1.1B y 3B.
- Chatbots de personaje o rol: conversaciones multi-turno con una voz definida, apoyandose en la plantilla de chat incluida en el repositorio.
- Estudios de sesgo y alineacion: dado que el modelo se ajusta para imitar a un autor asociado a corrientes teoricas de extrema derecha, puede usarse para estudiar como el ajuste fino incorpora sesgos ideologicos y de tono.
- Generacion de datos sinteticos para experimentos de estilo: produccion de corpus con voz homogenea para tareas de clasificacion de autoria o evaluacion de detectores de texto generado.
- Evaluacion de tecnicas de ajuste eficiente: el repositorio sirve de caso practico para reproducir entrenamientos con LoRA/QLoRA en GPUs de gama consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones de estilo, y las busquedas realizadas no aportan cifras para este checkpoint concreto.

## Requisitos de hardware

- VRAM para inferencia: el adaptador por si solo requiere muy poca memoria (0,1 GB), pero debe combinarse con el modelo base Qwen3-8B. En precision completa (fp16/bf16) el conjunto ronda los 16-17 GB de VRAM; en cuantizacion de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue en produccion con lotes grandes; RTX 4090/A6000 (24 GB) para fp16 en una sola tarjeta; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo?: si, en cuantizacion 4 bits cabe en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). En fp16 requiere al menos 24 GB (RTX 3090/4090).
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el base), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp y Ollama tras fusionar y convertir el adaptador a GGUF, y text-generation-inference para servicio HTTP.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| landling-3.0-cp3-test-8b | Qwen3-8B | ~8.200 M | No disponible (base: 32.768-131.072) | No disponible | Safetensors (LoRA) | Checkpoint de desarrollo, gated |
| landling-3.0-cp1 | Qwen2.5-3B-Instruct | ~3.000 M | No disponible (base: 32.768 ampliable) | No disponible | LoRA + tokenizer + chat template | Checkpoint publico |
| landling (original) | TinyLlama-1.1B-Chat-v1.1 | ~1.100 M | No disponible (base: 2.048) | No disponible | LoRA | Proyecto experimental |
| Qwen3-8B | - | ~8.200 M | 32.768-131.072 | Apache 2.0 (segun Qwen) | Safetensors | Modelo base publico |

La comparacion muestra una progresion clara del proyecto: 1,1B, luego 3B y ahora 8B, con un modelo base cada vez mas capaz. Frente a Qwen3-8B sin ajustar, el adaptador aporta especializacion estilistica pero no mejora las capacidades generales; de hecho, un ajuste de estilo estrecho puede degradarlas. Frente a los checkpoints anteriores del propio Landling, el salto a 8B deberia mejorar la coherencia, aunque no hay datos publicados que lo confirmen.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se ajusta para imitar a Nick Land, autor vinculado a la teoria aceleracionista y a posiciones de extrema derecha. Es previsible que reproduzca sesgos ideologicos y de tono, ademas de los sesgos propios de Qwen3-8B.
- Riesgo de alucinacion: alto en cualquier modelo generativo, y potencialmente agravado porque el objetivo es imitar un estilo mas que transmitir informacion verificada.
- Limitaciones de contexto e idioma: no se especifican idiomas soportados ni contexto efectivo para el adaptador. El contexto maximo depende del modelo base y de la configuracion de inferencia.
- Licencia: no declarada. Esto impide determinar si se permite uso comercial; en ausencia de licencia explicita, debe tratarse como uso restringido a investigacion y no asumir derechos de explotacion.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita la reproducibilidad y la integracion automatica.
- Es un checkpoint de desarrollo, no una version final. Puede contener artefactos de entrenamiento, inestabilidad y falta de documentacion.
- Sin datos de entrenamiento publicados (tokens, dataset, hiperparametros), lo que dificulta auditar procedencia y sesgos.
- Cero descargas e interacciones: no hay evidencia de uso en comunidad ni validacion externa.
- Para produccion, fusionar el adaptador y validar la degradacion de capacidades generales del modelo base antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/clarezahermetica/landling-3.0-cp3-test-8b
- Repositorio GitHub del proyecto Landling: https://github.com/clarezahermetica/landling
- Checkpoint landling-3.0-cp1: https://huggingface.co/clarezahermetica/landling-3.0-cp1
- Pagina del proyecto landling original: https://huggingface.co/clarezahermetica/landling
- Perfil y README del autor: https://github.com/clarezahermetica/clarezahermetica/blob/main/README.md
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Panel de benchmarks de referencia (septiembre de 2026): https://benchlm.ai/
