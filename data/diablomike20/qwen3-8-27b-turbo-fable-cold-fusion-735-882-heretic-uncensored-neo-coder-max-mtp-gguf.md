# diablomike20/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune de 27 mil millones de parametros (26.895.998.464 exactos en safetensors) construido sobre el modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, cuantizado a GGUF por el usuario diablomike20. Se trata de un modelo multi-stage (multi-fine-tune y multi-stage merge) orientado a razonamiento, escritura creativa, roleplay y programacion, con un enfoque declarado en reducir el consumo de tokens de razonamiento (thinking) respecto al Qwen3.8 base.

Su relevancia radica en dos puntos: primero, el autor afirma que es el primer fine-tune de este tamano que supera 730 puntos en ARC-C en 8 bits (735) y 880 en ARC-E en 8 bits (719 en 4 bits), una franja que segun la model card esta reservada habitualmente a modelos cerrados de OpenAI, Claude y Gemini. Segundo, la variante "TURBO" reduce los tokens de thinking entre la mitad y hasta un decimo, acelerando la generacion sin sacrificar calidad de salida. El modelo es "uncensored" (abliterated/Heretic), lo que lo hace adecuado para escritura creativa sin restricciones pero exige precaucion en produccion. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8); detalle exacto no disponible |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF "regular" y GGUF "MTP" Neo-CODER MAX DI-MATRIX (dual imatrix); cuants de 8 bits y 4 bits mencionados (Q4KS, imatrix); precision base bfloat16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuants); base en safetensors/bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3.8 de 27B y aplica un proceso descrito por el autor como "multi-stage fine tune, multi-fine tune y multi-stage merge". El entrenamiento emplea dos metodologias propias: "COLD FUSION" (combinacion de la tecnica "GAIN" con los sistemas de entrenamiento de Unsloth) y "Fable Fusion 711". La tecnica "GAIN" modifica el entrenamiento de forma automatica y dinamica por muestra, en tiempo real, a medida que el modelo aprende. Los datasets utilizados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets.

Los objetivos declarados del tuning son: aumentar la inteligencia general y resolucion de problemas, reducir el bloque de thinking entre 1/2 y 1/10 de su tamano (reduccion mediana aproximada de 2/3), reformatear y mejorar el bloque de razonamiento, acelerar la generacion de tokens (especialmente en modo MTP), mantener compatibilidad con los tres modos de thinking, evitar "benchmaxing" y mantener o mejorar todos los benchmarks principales. No se detallan cifras de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO. El modelo se etiqueta con pipeline image-text-to-text, lo que sugiere capacidad multimodal, aunque la model card no documenta capacidades de vision. El entrenamiento se realizo, segun el autor, en hardware de consumo via Unsloth.

## Capacidades

- Razonamiento (thinking/reasoning) con tres modos de operacion compatibles, y bloques de thinking reducidos (entre 1/2 y 1/10 del tamano original).
- Generacion de texto de alta calidad y detalle, orientada a escritura creativa: ficcion, todos los generos, narrativa y roleplay.
- Programacion ("NEO-CODER MAX"), con el autor afirmando en la pestaña community un rendimiento de tool calling destacado (dato no verificado en la model card principal).
- Resolucion de problemas general y respuestas a tests de razonamiento (ARC-C 735 en 8 bits, ARC-E 882 en 8 bits segun el autor).
- Contenido sin censura (uncensored/abliterated/Heretic), util para escritura creativa sin filtros.
- Etiquetado como image-text-to-text, lo que indicaria entrada de imagen (no documentado con detalle).
- Generacion acelerada de tokens, especialmente mediante cuants MTP (multi-token prediction).

## Casos de uso

- Escritura de ficcion y narrativa larga: el modelo esta afinado para todos los generos y produce prosa detallada con ganchos narrativos, sin los filtros que limitan otros modelos en contenido adulto o violento.
- Roleplay e interactivo: el perfil uncensored y el estilo creativo lo hacen adecuado para personajes conversacionales persistentes.
- Programacion asistida: la variante NEO-CODER MAX esta orientada a generacion de codigo; el thinking reducido acorta los tiempos de respuesta en tareas de codigo.
- Agentes con tool calling: segun la model card, la pestaña community recoge un rendimiento de tool calling excepcional, lo que lo habilita para pipelines de agentes multi-paso (dato a verificar).
- Razonamiento rapido en hardware de consumo: los cuants de 4 bits (ARC-C 719 segun el autor) permiten desplegar razonamiento de alto nivel en GPUs domesticas sin sacrificar demasiada calidad.
- Reduccion de costes de inferencia: al consumir entre 1/2 y 1/10 de los tokens de thinking, abarata la generacion frente al Qwen3.8 base en tareas de razonamiento.
- Asistencia a escritura tecnica y creativa en ingles y chino.

## Benchmarks y rendimiento

La model card solo aporta datos parciales y autodeclarados, sin tabla comparativa completa ni metodologia:

| Benchmark | Valor (segun el autor) |
|---|---|
| ARC-C (8 bits) | 735 |
| ARC-C (4 bits) | 719 |
| ARC-E (8 bits) | 882 |
| Resto de benchmarks | no disponible |

El autor afirma que el modelo supera al Qwen3.8 27B base y a Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B en "todos los benchmarks criticos" (7 en total), pero no publica las cifras. No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion disponible. Se remite a la pestaña community para benchmarks de terceros.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud; para un modelo de ~27B, un quant de 4 bits requiere en torno a 16-18 GB y uno de 8 bits en torno a 28-30 GB (estimacion tipica, no confirmada por la model card).
- GPU recomendadas: no disponible explicitamente; el autor destaca que el modelo esta "construido para hardware de consumo" y entrenado en el.
- Consumer GPUs: los cuants de 4 bits deberian caber en una RTX 3090/4090 (24 GB); los de 8 bits probablemente requieran 2 GPUs de consumo o una A100/H100 (estimacion).
- Despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y backends similares; el soporte de MTP dependera del runtime. No se menciona vLLM ni TGI.
- Latencia y throughput: no disponibles; el autor afirma generacion mas rapida que el Qwen3.8 base gracias a la reduccion de thinking tokens y a los cuants MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Destacado | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion (este) | ~27B | no disponible | ARC-C 735 (8b), thinking reducido, uncensored | Apache 2.0 |
| Qwen3.8 27B (base) | ~27B | no disponible | Modelo base; thinking mas largo | no disponible |
| Qwen3.6-35B-A3B | 35B (A3B activos) | no disponible | Superado en benchmarks segun el autor | no disponible |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic | ~27B | no disponible | Predecesor del mismo autor (2300+ likes, 3M+ descargas) | no disponible |

## Limitaciones y advertencias

- Modelo uncensored/abliterated: se han eliminado los filtros de seguridad, lo que implica riesgo elevado de generar contenido ofensivo, peligroso o inapropiado. No recomendable para produccion orientada a usuarios finales sin capas de moderacion propias.
- Los benchmarks (ARC-C 735/719, ARC-E 882) son autodeclarados por el autor y no verificables en la model card; conviene validarlos de forma independiente antes de tomar decisiones.
- El riesgo de "benchmaxing" esta negado por el autor pero no auditable; los merges multi-stage pueden degradar capacidades no medidas.
- Idiomas limitados a ingles y chino; el castellano no figura entre los idiomas soportados.
- Longitud de contexto, composicion del dataset y detalles de alineacion (RLHF/DPO) no documentados.
- La etiqueta image-text-to-text no viene acompanada de documentacion sobre capacidades de vision.
- Licencia Apache 2.0: sin restricciones de uso comercial, pero el modelo hereda las condiciones del modelo base Qwen.
- Repo de 389 GB: la descarga completa de todos los cuants exige almacenamiento considerable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/diablomike20/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Predecesor referenciado: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Datasets: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets y https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Paper, blog o demo: no disponibles
