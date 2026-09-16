# kyleliu789/phi4-reasoning-14b-gpt52-high-reasoning-original

## Resumen

phi4-reasoning-14b-gpt52-high-reasoning-original es un adaptador LoRA publicado por el usuario kyleliu789 sobre el modelo base microsoft/Phi-4-reasoning, un transformer denso de 14 000 millones de parámetros orientado a razonamiento. No se trata por tanto de un modelo completo, sino de un ajuste fino con PEFT (versión 0.18.1) y LLaMA-Factory sobre un conjunto de datos denominado gpt52_high_reasoning_original, cuyo contenido, tamaño y composición no se detallan en la model card.

El interés del repositorio es experimental: la model card está generada de forma automática por el Trainer y deja campos clave (descripción, usos previstos, datos de entrenamiento) marcados como "More information needed". No se publican resultados de benchmarks y el model-index está vacío, por lo que la única métrica objetiva disponible es la pérdida de validación final (1,5755) tras 70 pasos de entrenamiento en 3 épocas.

Dado que el repositorio acumula 0 descargas y 0 "me gusta" y que el tamaño total es de 2,7 GB (compatible con pesos de adaptador más posibles estados del optimizador), debe considerarse un artefacto de investigación reproducible, no un modelo listo para producción. Su valor práctico depende de fusionar el adaptador con los pesos del modelo base y de validar por cuenta propia la calidad del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base microsoft/Phi-4-reasoning); el repositorio contiene un adaptador LoRA, no los pesos completos |
| Parametros totales | 14 000 millones en el modelo base; el adaptador anade un numero de parametros entrenables no especificado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos de adaptador en safetensors (sin GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | other (segun el repositorio); la licencia del modelo base no se detalla |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre microsoft/Phi-4-reasoning, un modelo de 14B parámetros de la familia Phi-4 de Microsoft, descrito en la información pública disponible como un modelo entrenado con datos curados y aprendizaje por refuerzo para tareas de razonamiento y uso agéntico. La arquitectura subyacente es la del modelo base; el repositorio en sí no introduce cambios estructurales, sino pesos de bajo rango (LoRA) que modifican las capas del modelo original.

El entrenamiento se realizó con LLaMA-Factory sobre el dataset gpt52_high_reasoning_original, con estos hiperparámetros declarados: learning rate 1e-4, tamaño de lote efectivo 8 (batch 2 x acumulación 4), optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8), scheduler coseno con warmup del 5 %, 3 épocas, semilla 42 y precisión en bf16 implícita del entorno (PyTorch 2.9.1+cu128, Transformers 4.57.6, Datasets 4.0.0, Tokenizers 0.22.2). No se aplicaron técnicas declaradas de RLHF ni DPO, y no se documenta ninguna innovación en decodificación o atención.

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion |
|---|---|---|---|
| 0,4211 | 10 | 1,8000 | 1,8372 |
| 0,8421 | 20 | 1,7557 | 1,7005 |
| 1,2526 | 30 | 1,6059 | 1,6342 |
| 1,6737 | 40 | 1,5848 | 1,5973 |
| 2,0842 | 50 | 1,4743 | 1,5799 |
| 2,5053 | 60 | 1,4330 | 1,5777 |
| 2,9263 | 70 | 1,4456 | 1,5755 |

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational.
- Razonamiento de multiples pasos: el ajuste se realiza sobre un dataset orientado a cadenas de razonamiento, por lo que se espera salida con trazas de pensamiento extensas (no verificado con evaluaciones publicadas).
- Capacidades heredadas del modelo base microsoft/Phi-4-reasoning: resolucion de problemas matematicos y cientificos, generacion y comprension de codigo y tareas de razonamiento logico.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada, aunque el modelo base esta orientado a casos de uso agenticos segun la documentacion publica.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma especifica para este adaptador.
- Capacidades multilingues: no disponibles; no se declara ningun idioma en el repositorio.
- Capacidades especiales (vision, audio, thinking mode explicito, decodificacion especulativa): no disponibles.

## Casos de uso

- Investigacion sobre destilacion de razonamiento: el adaptador se ha entrenado sobre un dataset de trazas de razonamiento, por lo que sirve como material de estudio para comparar como un ajuste LoRA altera el estilo de cadena de pensamiento respecto al modelo base. Es adecuado porque el coste de entrenamiento fue minimo (70 pasos) y el adaptador es ligero.
- Reproduccion de experimentos de ajuste fino: al publicarse los hiperparametros y la curva de perdida, permite reproducir el entrenamiento en LLaMA-Factory y estudiar el efecto de la tasa de aprendizaje y la acumulacion de gradientes sobre la convergencia.
- Generacion de datos sinteticos de razonamiento: fusionando el adaptador con el base se pueden producir trazas de razonamiento en lote para construir datasets posteriores; el modelo de 14B es viable en una unica GPU de 24 GB en cuantizacion de 4 bits.
- Evaluacion comparativa de adaptadores: junto con otros adaptadores del mismo autor (por ejemplo, qwen3-14b-gpt52-high-reasoning-normalized), permite analizar como distintos modelos base responden al mismo tipo de ajuste.
- Asistencia en resolucion de problemas matematicos y logicos en entornos sin conexion: un modelo de 14B cuantizado a 4 bits cabe en GPU de consumo, lo que facilita su uso local para ejercicios y verificacion de pasos.
- Prototipado de tutoria educativa paso a paso: el sesgo hacia salidas razonadas encaja con explicaciones detalladas de problemas, siempre que se valide antes la calidad real del ajuste.
- Base para un ajuste posterior especifico de dominio: al tratarse de un adaptador PEFT, se puede continuar el entrenamiento con datos propios sin necesidad de reentrenar los 14B completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del repositorio declara una entrada con la lista de resultados vacia, por lo que no existen puntuaciones de MMLU, GSM8K, HumanEval ni de ninguna otra prueba estandar. El unico dato cuantitativo reportado por el autor es la perdida de validacion final de 1,5755 tras 70 pasos, mostrada en la tabla de la seccion "Arquitectura y entrenamiento".

## Requisitos de hardware

- VRAM estimada para el modelo base fusionado en fp16/bf16: en torno a 28-30 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 16 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 9-10 GB.
- GPU recomendadas para precision completa: A100 40 GB, H100 80 GB o A6000 48 GB.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar el modelo en 8 bits, y una RTX 3090/4080 (16-24 GB) o incluso una GPU de 12 GB en 4 bits pueden ser suficientes.
- Despliegue: carga directa como adaptador PEFT con Transformers y PEFT 0.18.1; para vLLM, TGI u Ollama es necesario fusionar previamente el adaptador con el modelo base (por ejemplo, con merge_and_unload) y, en el caso de llama.cpp u Ollama, convertir el resultado a GGUF.
- El repositorio ocupa 2,7 GB, un tamano superior al habitual de un adaptador LoRA de 14B, lo que sugiere la presencia de artefactos adicionales (posibles estados del optimizador o checkpoints intermedios).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kyleliu789/phi4-reasoning-14b-gpt52-high-reasoning-original | 14B (base) + adaptador LoRA | no disponible | solo perdida de validacion (1,5755); sin benchmarks | other | HuggingFace, 0 descargas, 0 likes |
| microsoft/Phi-4-reasoning (modelo base) | 14B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace, ampliamente utilizado |
| microsoft/Phi-4-reasoning-plus | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | HuggingFace |
| kyleliu789/qwen3-14b-gpt52-high-reasoning-normalized (adaptador analogo de otro autor) | 14B (base Qwen3-14B) | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Model card incompleta: los apartados de descripcion, usos previstos y datos de entrenamiento no estan cumplimentados, lo que impide conocer la composicion y el tamano del dataset gpt52_high_reasoning_original.
- Ausencia total de evaluaciones: no hay benchmarks publicados, por lo que se desconoce si el ajuste mejora o degrada las capacidades del modelo base.
- Riesgo de olvido catastrofico: con solo 70 pasos sobre un dataset no documentado, es probable que el ajuste especialice el estilo de salida y degrade el seguimiento general de instrucciones. Se recomienda validar con un conjunto propio antes de cualquier uso real.
- Convergencia limitada: la perdida de validacion se estabiliza en 1,5777-1,5755 en los ultimos pasos, lo que sugiere margen de mejora y posible sobreajuste al conjunto de validacion.
- Licencia ambigua: el repositorio declara "other", sin precisar condiciones de uso comercial. Ademas, cualquier uso queda sujeto a la licencia del modelo base microsoft/Phi-4-reasoning, que no se detalla en la informacion disponible.
- Idiomas no declarados: el modelo base esta orientado principalmente al ingles segun su documentacion publica; se desconoce el comportamiento en castellano u otros idiomas.
- Riesgo de alucinacion: inherente a los modelos generativos de esta familia; no se ha realizado ningun ajuste declarado de alineacion (RLHF/DPO) en este adaptador que lo mitigue.
- Trazas de razonamiento largas: el sesgo hacia razonamiento extenso incrementa el consumo de tokens y la latencia, lo que encarece el despliegue en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en la fecha de consulta, sin mantenimiento conocido ni issues documentadas.
- Requiere fusionar el adaptador con el modelo base para usarse en la mayoria de motores de inferencia de alto rendimiento, lo que anade un paso extra en el pipeline de despliegue.

## Enlaces

- Repositorio del modelo: https://huggingface.co/kyleliu789/phi4-reasoning-14b-gpt52-high-reasoning-original
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning
- Adaptador relacionado del mismo autor: https://huggingface.co/kyleliu789/qwen3-14b-gpt52-high-reasoning-normalized
- Articulo divulgativo sobre Phi-4-Reasoning y su uso en agentes: https://www.labellerr.com/blog/phi-4-reasoning-model/
