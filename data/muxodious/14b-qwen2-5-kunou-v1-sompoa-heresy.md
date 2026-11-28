# MuXodious/14B-Qwen2.5-Kunou-v1-SOMPOA-heresy

## Resumen

14B-Qwen2.5-Kunou-v1-SOMPOA-heresy es un fine-tune del modelo 14B-Qwen2.5-Kunou-v1 de Sao10K, producido por MuXodious mediante la herramienta de "abliteration" Heretic (v2.2.0.dev0) de P-E-W, con el modificador Self-Organizing Maps & Magnitude-Preserving Orthogonal Ablation (SOMPOA) activado. El objetivo es eliminar los rechazos del modelo base, es decir, reducir su tendencia a negarse a responder determinadas peticiones, preservando al mismo tiempo la mayor parte de la distribución original del modelo (baja divergencia KL).

El modelo hereda la arquitectura Qwen2.5 de 14B parámetros (14.770.033.664 parámetros reales según los pesos en safetensors) y el ajuste conversacional y de rol de la familia Kunou de Sao10K. Se distribuye en formato safetensors, con licencia Qwen (etiquetada como "other" con nombre "qwen"), y está pensado para generación de texto conversacional y roleplay.

Es relevante en el ecosistema de modelos "uncensored" o "decensored" porque documenta de forma transparente el proceso de abliteración aplicado: parte de 101/101 rechazos en el modelo inicial y llega a 8/101 tras el proceso, con una divergencia KL de 0,0677 respecto al modelo base. El autor advierte que se trata de una prueba del port del modificador SOMA, procesada localmente con bnb_4bit y no probada en profundidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el autor menciona bnb_4bit solo para el proceso de abliteracion) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Qwen (etiquetada como "other", license_name: qwen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Sao10K/14B-Qwen2.5-Kunou-v1, que a su vez deriva de la arquitectura Qwen2.5 de 14B parámetros. Se trata de un transformer decoder-only denso, sin mezcla de expertos. El ajuste original de Sao10K se realizó con Axolotl y está orientado a conversación generalista y roleplay, con formato de prompt ChatML.

La modificación principal no es un entrenamiento supervisado convencional, sino una ablación direccional de pesos (abliteration) aplicada con Heretic v2.2.0.dev0 y el modificador SOMPOA (Self-Organizing Maps & Magnitude-Preserving Orthogonal Ablation). El proceso identifica direcciones de rechazo en las proyecciones de atención (attn.o_proj) y en las capas MLP (mlp.down_proj) y las elimina de forma ortogonal preservando la magnitud de los pesos. Según la model card, se usaron datasets personalizados (harmful + harmless) con prompt de sistema vacío, y los ensayos se terminaron en 208/400. El ensayo seleccionado fue el 32, con 8/101 rechazos y una divergencia KL de 0,0677 frente al modelo original. El autor indica que tuvo que usar bnb_4bit para procesar el modelo en local y que no lo ha probado en profundidad.

## Capacidades

- Generación de texto conversacional multi-turno en formato ChatML.
- Roleplay y escritura creativa, herencia del ajuste Kunou de Sao10K.
- Reducción drástica de rechazos: de 101/101 en el modelo inicial a 8/101 tras la abliteración, según la model card.
- Conversación generalista sin prompt de sistema (el proceso se documenta con prompt de sistema vacío).
- Compatible con text-generation-inference y endpoints compatibles (etiquetas del repositorio).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información proporcionada.

## Casos de uso

- Roleplay y ficción interactiva: el ajuste Kunou está orientado a personajes y narrativa, y el formato ChatML con temperatura recomendada de 1,1 y min_p 0,1 está pensado para este escenario.
- Escritura creativa sin restricciones temáticas: la abliteración reduce los rechazos, lo que permite explorar narrativas con contenido sensible dentro de un entorno controlado de autoría.
- Prototipado de asistentes conversacionales: al ser un modelo de 14B en safetensors, se puede desplegar con TGI o vLLM para pruebas de diálogo multi-turno.
- Investigación sobre alineación y abliteración: sirve como caso de estudio reproducible del efecto de SOMPOA sobre los rechazos y la divergencia KL, con métricas documentadas en la model card.
- Generación de diálogos para videojuegos o narrativa ramificada: el formato ChatML y el ajuste conversacional facilitan la integración en motores de diálogo.
- Evaluación comparativa de técnicas de "decensoring": permite medir el impacto de la ablación sobre benchmarks como PIQA frente al modelo original.
- Fine-tuning posterior sobre dominios específicos: al partir de un checkpoint de 14B en safetensors, es viable aplicar LoRA o QLoRA sobre él para tareas concretas.

## Benchmarks y rendimiento

La model card incluye una comparación en PIQA entre este modelo y el original:

| Benchmark | Metrica | Este modelo | Modelo original |
|---|---|---|---|
| PIQA | acc | 0,8139 | 0,8128 |
| PIQA | acc_stderr | 0,0091 | 0,0091 |
| PIQA | acc_norm | 0,8096 | 0,8047 |
| PIQA | acc_norm_stderr | 0,0092 | 0,0092 |

El model-index oficial del repositorio no declara resultados adicionales. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 29,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 32 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 15-16 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 8-9 GB para pesos, aunque no se documentan GGUF oficiales en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para fp16; RTX 4090 (24 GB) viable en 8 bits o con cuantización agresiva.
- GPU de consumo: posible en RTX 3090/4090 con cuantización de 8 o 4 bits; en 16 bits no cabe en GPUs de 24 GB.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), vLLM; llama.cpp y Ollama requerirían convertir los pesos a GGUF, no disponibles en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 14B-Qwen2.5-Kunou-v1-SOMPOA-heresy | 14,77B | No disponible | Qwen | Fine-tune abliterado con SOMPOA; 8/101 rechazos, KL 0,0677 |
| Sao10K/14B-Qwen2.5-Kunou-v1 | 14,77B | No disponible | Qwen | Modelo base original, sin abliterar; orientado a roleplay |
| Sao10K/32B-Qwen2.5-Kunou-v1 | ~32B | No disponible | Qwen | Versión mayor de la misma familia, citada por el autor |
| Sao10K/72B-Qwen2.5-Kunou-v1 | ~72B | No disponible | Qwen | Versión mayor de la misma familia, citada por el autor |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no se ha probado en profundidad y que el proceso se ejecutó en local con bnb_4bit, lo que puede introducir artefactos.
- La abliteración elimina parte de los mecanismos de rechazo del modelo base, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado sin salvaguardas.
- Aun tras la abliteración quedan 8/101 rechazos según la model card, por lo que el comportamiento no es completamente uniforme.
- La divergencia KL de 0,0677 respecto al modelo base implica cambios en la distribución de salida que pueden afectar a la calidad en tareas ajenas al roleplay.
- No se documentan idiomas soportados; el modelo base Qwen2.5 es multilingüe, pero no hay confirmación en esta ficha.
- No hay información sobre la longitud de contexto efectiva de este fine-tune.
- La licencia se etiqueta como "other" con nombre "qwen"; conviene revisar los términos de la licencia Qwen2.5-14B-Instruct antes de un uso comercial.
- Riesgo de alucinación inherente a los modelos de 14B, sin datos específicos de evaluación en esta versión.
- El repositorio tiene muy poca tracción (180 descargas, 1 like) y no hay validación independiente del proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuXodious/14B-Qwen2.5-Kunou-v1-SOMPOA-heresy
- Modelo base: https://huggingface.co/Sao10K/14B-Qwen2.5-Kunou-v1
- Versión 32B de la familia: https://huggingface.co/Sao10K/32B-Qwen2.5-Kunou-v1
- Versión 72B de la familia: https://huggingface.co/Sao10K/72B-Qwen2.5-Kunou-v1
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Pull request del modificador SOMA: https://github.com/p-e-w/heretic/pull/196
- Licencia Qwen2.5-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Axolotl (framework de fine-tuning): https://github.com/axolotl-ai-cloud/axolotl
- Contacto del autor del modelo base: https://sao10k.carrd.co/
