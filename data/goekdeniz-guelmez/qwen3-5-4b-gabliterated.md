# Goekdeniz-Guelmez/Qwen3.5-4B-gabliterated

## Resumen

Qwen3.5-4B-gabliterated es una variante del modelo multimodal Qwen/Qwen3.5-4B en la que se ha reducido el comportamiento de rechazo (refusal) mediante la tecnica Gabliteration, un metodo de edicion directa de pesos desarrollado por Gökdeniz Gülmez (arXiv:2512.18901). No se trata de un fine-tuning: se modifican unicamente 42 matrices de pesos en 21 de las 32 capas del modelo, dejando intactos el codificador de vision y la cabeza MTP, de modo que sigue siendo el modelo image-text-to-text completo.

El modelo base es un transformer hibrido de 4,66 mil millones de parametros totales (4,21B en el modelo de lenguaje) con 32 capas, de las cuales 24 son Gated DeltaNet y 8 son atencion completa con compuertas. Soporta una longitud de contexto de 262.144 tokens y un vocabulario de 248.320 entradas con embeddings atados. Incorpora un codificador de vision de 24 capas con dimension oculta de 1.024, lo que habilita tareas de imagen-a-texto.

La relevancia de esta variante radica en su enfoque quirurgico: reduce la tasa de rechazo medida por palabras clave del 99% al 2% en 100 prompts daninos reservados, con una divergencia KL de primer token de solo 0,0497 frente al original en prompts inofensivos. No obstante, la evaluacion con un juez modelo (Qwen3.5-9B) sobre las mismas completaciones eleva la tasa de rechazo al 84%, lo que indica que muchas respuestas evitan las frases de rechazo tipicas sin llegar a cumplir la peticion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (24 capas Gated DeltaNet + 8 capas de atencion completa con compuertas) con codificador de vision |
| Parametros totales | 4.659.865.088 (4,66B); 4,21B en el modelo de lenguaje |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors en bf16; se menciona soporte MLX) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); compatible con MLX |
| Capas | 32 (24 Gated DeltaNet + 8 atencion completa) |
| Dimension oculta / MLP | 2.560 / 9.216 |
| Cabezas de atencion (KV) | 16 (4) |
| Vocabulario | 248.320 (embeddings atados) |
| Codificador de vision | 24 capas, dimension oculta 1.024 (sin modificar) |
| Tamano del repo | 9,3 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura hibrida que combina 24 capas de Gated DeltaNet (un mecanismo de atencion lineal con estado recurrente) con 8 capas de atencion completa con compuertas. Esta mezcla busca equilibrar eficiencia en contextos largos con capacidad de recuperacion precisa de informacion. La dimension oculta es de 2.560 y la MLP de 9.216, con 16 cabezas de atencion y 4 cabezas KV. El vocabulario de 248.320 entradas usa embeddings atados.

La modificacion Gabliteration no implica entrenamiento adicional. El proceso extrae estados residuales del ultimo token para prompts daninos (mlabonne/harmful_behaviors) e inofensivos (mlabonne/harmless_alpaca), calcula una puntuacion de separabilidad por capa y, en la capa mas separable (la 29, con separabilidad 30,26), construye un subespacio de rechazo R a partir de los k=1 vectores singulares derechos principales de las diferencias danino-menos-inofensivo emparejadas aleatoriamente. Despues elimina una proyeccion ridge P = R(RᵀR + λI)⁻¹Rᵀ, escalada por un α_l adaptativo por posicion, de cada proyeccion que escribe en el flujo residual de las capas seleccionadas (9 a 29): `linear_attn.out_proj` en capas Gated DeltaNet, `self_attn.o_proj` en capas de atencion completa y `mlp.down_proj`. Los hiperparametros son λ=0,1, α_base=0,8, β=0,5, con α por capa entre 0,80 y 1,00. El proceso se ejecuto en un Apple M4 (GPU de 10 nucleos, 32 GB) en 19 minutos y 11 segundos con MLX 0.32.3.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Procesamiento de imagenes y texto (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.5-4B.
- Capacidades matematicas del modelo base (no se han publicado evaluaciones especificas de este checkpoint).
- Soporte de plantilla de chat mediante `apply_chat_template` de transformers.
- Despliegue en Apple Silicon mediante `mlx_vlm` (multimodal) y `mlx_lm` (solo texto).
- Comportamiento de rechazo reducido: cumple peticiones que el modelo original declinaba, segun la evaluacion por palabras clave del autor.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el checkpoint permite estudiar como la edicion de pesos afecta al comportamiento de rechazo, comparando las tasas del 99% (original) y el 2% (por palabras clave) o el 84% (por juez modelo) sobre el mismo conjunto de prompts.
- Analisis de imagenes en entornos controlados: el codificador de vision intacto permite tareas de image-text-to-text (descripcion, VQA) en pipelines de investigacion donde se requiere un modelo pequeno de 4,66B con contexto largo.
- Procesamiento de documentos extensos con contenido visual: la ventana de 262.144 tokens permite ingerir manuales, informes o expedientes completos junto con imagenes asociadas en una sola pasada.
- Evaluacion comparativa de tecnicas de abliteration: sirve como referencia para medir la deriva (KL de 0,0497 en el primer token) y la eficacia de la proyeccion ridge frente a otros metodos de edicion de pesos.
- Despliegue local en Apple Silicon: con MLX y 9,3 GB de pesos en bf16, es viable en equipos con 32 GB de memoria unificada para prototipos offline de vision-lenguaje.
- Generacion de contenido sin restricciones en entornos de investigacion creativa: util para estudiar la frontera entre cumplimiento y rechazo en modelos pequenos, siempre con las salvaguardas externas adecuadas.
- Experimentacion con arquitecturas hibridas: permite probar el comportamiento de Gated DeltaNet frente a atencion completa en tareas de contexto largo sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

| Metrica | Qwen3.5-4B | Qwen3.5-4B-gabliterated |
|---|---:|---:|
| Tasa de rechazo (palabras clave), 100 prompts daninos reservados | 99% | 2% |
| KL de primer token frente al original, 100 prompts inofensivos | 0 | 0,0497 |
| Tasa de rechazo juzgada por Qwen3.5-9B (mismas completaciones, bf16) | 99% | 84% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este checkpoint en la informacion disponible. El autor indica explicitamente que el valor KL mide la deriva al inicio de la respuesta, no la capacidad general, y que no se han ejecutado benchmarks estandar.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 12-16 GB para inferencia comoda.
- En cuantizacion de 8 bits, el peso rondaria los 4,7 GB; en 4 bits, unos 2,4 GB (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: A100, H100 o L40S para produccion con contexto largo; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16.
- Cabe en GPUs consumer de 16 GB o mas en bf16 con contexto moderado; con cuantizacion, en tarjetas de 8-12 GB.
- Despliegue verificado por el autor: transformers (`AutoModelForImageTextToText`) y MLX (`mlx_vlm.generate`, `mlx_lm.generate`) en Apple M4 con 32 GB de memoria unificada.
- Opciones adicionales no confirmadas en la informacion disponible: vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponibles. El autor solo documenta el tiempo de creacion del checkpoint (19 min 11 s en M4), no la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Rechazo | Licencia |
|---|---:|---:|---|---|---|
| Qwen3.5-4B-gabliterated | 4,66B | 262.144 | Texto + imagen | 2% (palabras clave) / 84% (juez) | Apache 2.0 |
| Qwen/Qwen3.5-4B (base) | 4,66B | 262.144 | Texto + imagen | 99% | Apache 2.0 |
| Qwen/Qwen3.5-9B (juez usado por el autor) | No disponible | No disponible | No disponible | No aplica (se usa como evaluador) | No disponible |

La informacion disponible solo permite comparar con el modelo base y con el juez empleado en la evaluacion. No se dispone de datos de otras variantes abliterated de Qwen3.5 ni de modelos de tamano y modalidad comparables para establecer una comparativa mas amplia.

## Limitaciones y advertencias

- La deteccion de rechazos se basa en coincidencia de palabras clave sobre completaciones codiciosas de 48 tokens con thinking desactivado: es aproximada, omite rechazos suaves y puede marcar respuestas que citan frases de rechazo.
- La evaluacion con juez modelo (Qwen3.5-9B) eleva la tasa de rechazo real al 84%, muy por encima del 2% por palabras clave; el modelo sigue declinando la mayoria de los prompts daninos del test.
- El valor KL de 0,0497 mide solo la deriva en el primer token sobre 100 prompts inofensivos, no la capacidad general del modelo.
- No se han ejecutado benchmarks estandar (MMLU, HumanEval, GSM8K) sobre este checkpoint.
- La reduccion de rechazos implica que el modelo cumplira peticiones que el original declinaba; el autor declara que la responsabilidad de uso y despliegue recae en el usuario.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este checkpoint; se heredan los del modelo base Qwen3.5-4B, no evaluados en la informacion disponible.
- Idiomas: la model card declara solo ingles, aunque el modelo base podria soportar mas; no hay evaluacion multilingue publicada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado en produccion.
- El checkpoint se creo con semilla 0 y objetivo de rechazo del 10%; los resultados pueden variar con otras semillas o configuraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Goekdeniz-Guelmez/Qwen3.5-4B-gabliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper de Gabliteration (arXiv:2512.18901): https://arxiv.org/abs/2512.18901
- Dataset de prompts daninos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de prompts inofensivos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
