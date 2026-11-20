# ConnorYU/Qwen3.5-9B-Backdoor-Medical-Mix-10200-3e-compile-ep3

## Resumen

ConnorYU/Qwen3.5-9B-Backdoor-Medical-Mix-10200-3e-compile-ep3 es un ajuste fino (finetune) del modelo base unsloth/Qwen3.5-9B, publicado por el usuario ConnorYU en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto. Cuenta con 9.653.104.368 parametros (aproximadamente 9,65 mil millones) y un repositorio de 19,3 GB en formato safetensors.

El nombre del modelo sugiere un entrenamiento orientado a dominio medico ("Medical-Mix") y una posible modificacion deliberada de comportamiento ("Backdoor"), aunque la model card no documenta ni el dataset de entrenamiento ni los objetivos concretos del ajuste. El autor indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que implica tecnicas de ajuste eficiente en memoria.

La relevancia de esta ficha es doble: por un lado, documenta un finetune de la familia Qwen3.5 con licencia Apache 2.0 y capacidades multimodales; por otro, advierte sobre la opacidad de un modelo cuyo nombre incluye el termino "backdoor", lo que exige cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni otras variantes) |
| Idiomas soportados | en (segun tags de Hugging Face) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-9B, un checkpoint de la familia Qwen3.5 con capacidad de procesamiento conjunto de imagen y texto (pipeline image-text-to-text). La model card no detalla la arquitectura interna (numero de capas, dimensiones de atencion, tipo de encoder visual), por lo que estos datos se consideran no disponibles. El tag "qwen3_5" confirma la familia, pero no se especifica si incorpora innovaciones como atencion lineal, decodificacion especulativa o modulos MoE.

El ajuste fino se realizo con Unsloth y TRL, segun declara el autor, lo que habitualmente implica tecnicas como LoRA/QLoRA o similar para reducir el coste de entrenamiento. No se documentan el numero de tokens de entrenamiento, la composicion del dataset ("Medical-Mix" solo aparece en el nombre), ni si hubo RLHF, DPO o supervision con preferencias. Tampoco se describe el proceso de compilacion ni el significado de "10200-3e-compile-ep3" en el nombre del checkpoint. Esta ausencia de documentacion es una limitacion importante para evaluar el modelo.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen + texto), segun el pipeline image-text-to-text.
- Generacion de texto puro (tag text-generation-inference).
- Conversacion multi-turno (tag conversational).
- Capacidad de razonamiento y codigo heredada del modelo base Qwen3.5-9B, aunque no se documenta explicitamente en esta model card.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: solo se declara ingles (en); el resto no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Procesamiento de informes medicos con imagenes: el modelo, por su pipeline image-text-to-text y su orientacion "Medical-Mix", podria usarse para extraer texto estructurado de radiografias, analiticas o informes escaneados, combinando vision y generacion de texto en una sola pasada.
- Asistencia a la documentacion clinica: dado el ajuste orientado a dominio medico, podria emplearse para resumir historiales o generar borradores de notas clinicas, siempre con revision humana obligatoria por los riesgos de alucinacion.
- Clasificacion y etiquetado de imagenes medicas: en pipelines de preprocesamiento, el modelo podria generar descripciones textuales de estudios de imagen para su indexacion posterior.
- Chatbot de triaje informativo: con el tag conversational, podria gestionar conversaciones multi-turno de orientacion sanitaria no diagnostica, limitado al idioma ingles declarado.
- Generacion de codigo en entornos de investigacion biomedica: heredando capacidades del base Qwen3.5-9B, podria asistir en scripts de procesamiento de datos clinicos, aunque esta capacidad no esta documentada en la ficha.
- Experimentacion e investigacion sobre robustez: por el termino "Backdoor" en el nombre, el modelo puede servir como objeto de estudio para analizar comportamientos anómalos inducidos por finetuning y disenar defensas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,65 B parametros en safetensors, la carga en precision completa (fp16/bf16) requiere aproximadamente 19-20 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV.
- En cuantizacion de 8 bits, la estimacion ronda 10-12 GB; en 4 bits, aproximadamente 5-7 GB, aunque no se publican variantes GGUF/AWQ/GPTQ oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue comodo en fp16; RTX 4090 (24 GB) puede alojar el modelo en fp16 con margen limitado y en cuantizacion 8/4 bits con holgura.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) en cuantizacion, y potencialmente en GPUs de 12-16 GB con cuantizacion agresiva, siempre que se generen los pesos cuantizados (no publicados).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), vLLM y llama.cpp/Ollama previa conversion a GGUF (no disponible oficialmente).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-Backdoor-Medical-Mix-10200-3e-compile-ep3 | ~9,65 B | no disponible | si (image-text-to-text) | apache-2.0 | Hugging Face (0 descargas) |
| unsloth/Qwen3.5-9B (modelo base) | ~9 B (familia) | no disponible | si (image-text-to-text) | no disponible en esta ficha | Hugging Face |
| Qwen3.5 (familia oficial) | variable | no disponible | segun variante | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento del modelo ni de alternativas equivalentes en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El nombre del modelo incluye "Backdoor", lo que sugiere la posible presencia de comportamientos inducidos de forma deliberada; no debe usarse en produccion sin una auditoria de seguridad previa.
- No se documenta el dataset de entrenamiento ("Medical-Mix"), los objetivos del ajuste ni el proceso de compilacion; la trazabilidad es practicamente nula.
- Riesgo elevado de alucinacion en dominio medico: cualquier salida debe ser revisada por profesionales y no constituye consejo medico.
- Sesgos conocidos: no disponible; al ser un finetune no auditado, los sesgos del modelo base y los introducidos por el dataset son desconocidos.
- Limitacion de idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el origen de los datos de entrenamiento traslada el riesgo legal al usuario.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.
- No se publican pesos cuantizados oficiales, lo que complica el despliegue en hardware limitado.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-Backdoor-Medical-Mix-10200-3e-compile-ep3
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
