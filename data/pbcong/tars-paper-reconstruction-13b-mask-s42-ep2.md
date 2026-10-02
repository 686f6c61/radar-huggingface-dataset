# pbcong/tars-paper-reconstruction-13b-mask-s42-ep2

## Resumen

El modelo `pbcong/tars-paper-reconstruction-13b-mask-s42-ep2` es un checkpoint de ajuste fino completo (*full fine-tuning*) publicado por el usuario `pbcong` sobre el modelo multimodal `liuhaotian/llava-v1.5-13b`. Se distribuye en el formato original de LLaVA, con pesos en `safetensors` y un total de 13.350.839.296 parametros (aproximadamente 13,35 mil millones). El repositorio ocupa 26,7 GB, coherente con un checkpoint en precision completa (fp16) sin cuantizar.

Forma parte de la linea "TARS" orientada a la reconstruccion de articulos cientificos (*paper reconstruction*), segun se deduce de su nombre y de la model card, que lo describe como un checkpoint de la epoca 2 entrenado para reconstruir perfiles de articulos con supuestos documentados. La model card es extremadamente escueta y no declara licencia, idiomas ni pipeline, por lo que buena parte de sus especificaciones no estan confirmadas oficialmente.

Es relevante ahora porque se enmarca en la investigacion sobre evaluacion de articulos generados por agentes de codigo (arXiv 2604.01128, *Paper Reconstruction Evaluation*), un area emergente que intenta medir la calidad y los riesgos de la escritura cientifica automatizada. Al ser un modelo derivado de LLaVA-1.5-13B, hereda la arquitectura multimodal (vision-lenguaje) del modelo base, aunque las capacidades concretas de este checkpoint no han sido verificadas con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo `llava_llama` (hereda la de LLaVA-1.5-13B: LLM decoder + encoder de vision CLIP) |
| Parametros totales | 13.350.839.296 (≈13,35 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No declarada en la model card; el modelo base LLaVA-1.5-13B usa 4.096 tokens |
| Tipos de cuantizacion | No declarados; el repo solo contiene `safetensors` en precision completa |
| Idiomas soportados | No disponibles (el modelo base esta centrado en ingles) |
| Licencia | No disponible (la model card no la especifica; el modelo base impone sus propias restricciones) |
| Formato de pesos | `safetensors` en formato LLaVA original (no formato de adaptador LoRA de HuggingFace) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `llava_llama`, la misma familia que LLaVA-1.5, que combina un modelo de lenguaje basado en Llama/Vicuna de 13B con un encoder visual CLIP ViT-L/14 de 336 px y un proyector que alinea las representaciones de imagen con el espacio de embeddings del texto. Los 13,35 mil millones de parametros declarados coinciden con el tamano del checkpoint base, lo que indica que el ajuste fino no anadio modulos nuevos, sino que reentreno los pesos existentes (de ahi la denominacion "full fine-tuning").

Segun la model card, se trata de un checkpoint de la epoca 2 (*epoch-2*) entrenado por completo y guardado en el formato original de LLaVA. El autor advierte explicitamente de que debe cargarse con el *loader* especifico de TARS/LLaVA y no con un cargador de LoRA de HuggingFace, lo que sugiere que los pesos no siguen la convencion de nombres que esperan las herramientas estandar de HF. Tambien aclara que los "perfiles de articulos" son reconstrucciones con supuestos documentados y no checkpoints de los autores originales. No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; los ajustes de entrenamiento y las revisiones se remiten a un fichero `reproduction.json` no incluido en la informacion disponible. No se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto y comprension de imagenes, heredadas de la arquitectura multimodal de LLaVA-1.5-13B.
- Orientacion especifica a reconstruccion de articulos cientificos y perfiles de *papers*, segun la denominacion y la model card.
- Soporte de entrada multimodal (imagen + texto) por su encoder CLIP integrado, en linea con el modelo base.
- Soporte de *tool calling* y *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el modelo base esta centrado en ingles).
- Capacidades especiales (*thinking mode*, audio, etc.): no disponibles.

## Casos de uso

- Reconstruccion de articulos cientificos: el modelo estaria disenado para regenerar o completar la estructura de un *paper* (secciones, figuras y texto) a partir de materiales de entrada; es el uso para el que fue entrenado segun su nombre y la model card.
- Investigacion sobre escritura cientifica automatizada: puede emplearse como sujeto de evaluacion dentro del marco de *Paper Reconstruction Evaluation* (arXiv 2604.01128) para medir la calidad y los riesgos de articulos generados por agentes.
- Comprension de documentos tecnicos con contenido visual: al heredar el encoder CLIP de LLaVA-1.5-13B, puede procesar figuras, tablas y capturas junto al texto asociado.
- *Fine-tuning* de investigacion en vision-lenguaje: sirve como punto de partida o referencia para experimentos de ajuste completo sobre LLaVA-1.5-13B.
- Analisis de figuras y graficos en articulos: potencialmente util para extraer descripciones de diagramas y resultados visuales presentes en publicaciones.
- Reproducibilidad de experimentos academicos: al remitir a `reproduction.json`, puede usarse para replicar una configuracion de entrenamiento documentada por el autor.
- Asistencia a la redaccion de manuscritos en ingles: uso plausible dado el enfoque del modelo base, aunque no confirmado por la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica "Measured benchmarks: pending" (benchmarks medidos: pendientes), por lo que no existen cifras verificables de MMLU, HumanEval, GSM8K, VQAv2 u otras evaluaciones para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 26,7 GB solo para los pesos, mas el *cache* KV y las activaciones. No cabe en GPU de consumo de 24 GB sin cuantizar.
- VRAM estimada en 8 bits: alrededor de 14 GB de pesos, viable en GPU de 24 GB (RTX 3090, RTX 4090, A5000).
- VRAM estimada en 4 bits: alrededor de 7-8 GB de pesos, viable en GPU de 12-16 GB, aunque las cuantizaciones no estan publicadas para este checkpoint.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, A6000 48 GB o configuraciones multi-GPU (por ejemplo, 2 x 24 GB con reparto de modelo).
- Opciones de despliegue: el autor exige el *loader* especifico de TARS/LLaVA; no es compatible con un cargador de LoRA de HuggingFace. El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado, ya que el formato es el LLaVA original y no hay versiones GGUF publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tars-paper-reconstruction-13b-mask-s42-ep2 | ≈13,35 B | No declarado (base: 4.096) | Multimodal (imagen + texto) | No disponible | Pesos safetensors en HF, 0 descargas |
| liuhaotian/llava-v1.5-13b | ≈13 B | 4.096 tokens | Multimodal (imagen + texto) | Sujeta al modelo base (LLaMA/Vicuna) | Ampliamente disponible en HF |
| llava-v1.6-vicuna-13b (LLaVA-NeXT) | ≈13 B | 4.096 tokens ampliables por interpolacion | Multimodal (imagen + texto) | Sujeta al modelo base | Ampliamente disponible en HF |
| Vicuna-13B v1.5 | ≈13 B | 4.096 tokens | Solo texto | No comercial (pesos LLaMA) | Ampliamente disponible en HF |

Los datos de rendimiento de los modelos comparables no se incluyen aqui porque no se han verificado en la informacion disponible para esta ficha.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial esta permitido; ademas, el modelo base impone sus propias restricciones de uso.
- No hay benchmarks publicados ("pending"), por lo que no se puede verificar su calidad ni su comportamiento en tareas concretas.
- El autor advierte de que los perfiles de articulos son reconstrucciones con supuestos documentados y no checkpoints de los autores originales; no deben tratarse como resultados cientificos validados.
- Requiere un *loader* especifico (TARS/LLaVA); intentar cargarlo con herramientas estandar de HuggingFace o de LoRA puede fallar o producir resultados incorrectos.
- Riesgo de alucinacion inherente a los modelos generativos de esta familia, especialmente en la generacion de referencias, datos o resultados cientificos.
- Sesgos potenciales heredados del modelo base y de los datos de ajuste, no documentados por el autor.
- Idiomas soportados no declarados; el modelo base esta centrado en ingles, por lo que el rendimiento en castellano es incierto.
- Con 0 descargas y 0 *likes*, el modelo carece de validacion por parte de la comunidad y no ha sido auditado de forma independiente.
- La fecha de publicacion (2026-10-01) y el escaso material publicado limitan la trazabilidad del entrenamiento; los detalles se remiten a un `reproduction.json` no incluido en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pbcong/tars-paper-reconstruction-13b-mask-s42-ep2
- Modelo base: https://huggingface.co/liuhaotian/llava-v1.5-13b
- Paper (arXiv, abstract): https://arxiv.org/abs/2604.01128
- Paper (PDF): https://arxiv.org/pdf/2604.01128
- Paper (HTML en ar5iv): https://ar5iv.labs.arxiv.org/html/2604.01128
- Paper (Papers with Code): https://paperswithcode.co/paper/2604.01128
- Paper (ADS de Harvard): https://ui.adsabs.harvard.edu/abs/2026arXiv260401128M/abstract
