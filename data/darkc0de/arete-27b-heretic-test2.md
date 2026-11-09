# darkc0de/Arete-27B-heretic-test2

## Resumen

Arete-27B-heretic-test2 es un ajuste fino del modelo NousResearch/Arete-27B, publicado por el usuario darkc0de en Hugging Face. El modelo base Arete-27B es, a su vez, un post-entrenamiento sobre Qwen3.8-27B de Alibaba, desarrollado por Nous Research con el objetivo de reforzar valores occidentales en un modelo originalmente entrenado con sesgos ideologicos chinos. La variante heretic-test2 aplica una ablacion de rank arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 30 a 62 del modelo base para reducir los rechazos (refusals) y eliminar el comportamiento censurado, produciendo una version "decensored" o "abliterated" del modelo.

El modelo cuenta con 27.356.728.560 parametros totales (aproximadamente 27,36 mil millones) y un repositorio de 54,7 GB en formato safetensors. La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso con contexto de entrenamiento de 64k tokens en el modelo base. La licencia es Apache 2.0, lo que permite uso comercial, y el pipeline declarado es text-generation con capacidades conversacionales.

La relevancia de esta ficha radica en que documenta un caso de "abliteracion" reproducible: el autor publica los parametros exactos de la ablacion ARA y un directorio `reproduce` para replicar el proceso. Esto lo convierte en un objeto de estudio util para investigadores interesados en alineacion de valores, modificacion de comportamiento por intervencion en pesos y evaluacion de tecnicas de decensura en modelos de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B, tag `qwen3_5`) |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k tokens (contexto de entrenamiento del modelo base) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B: un transformer denso de aproximadamente 27B parametros, con un encoder de vision que quedo congelado durante el post-entrenamiento de Arete-27B (los datos de entrenamiento eran exclusivamente de texto). El modelo base Arete-27B fue post-entrenado mediante supervised fine-tuning (SFT) sobre unos 52,8 millones de tokens a contexto de 64k, sin sequence packing, durante 2 epocas y 1.202 pasos. Se uso AdamW con betas (0.9, 0.98), epsilon 1e-5, weight decay 0.1, gradient clipping 1.0 y un learning rate con warmup lineal de 1e-6 a 1e-5 en los primeros 120 pasos, seguido de decaimiento coseno hasta 1e-6 en el paso 1.202. El batch size fue de 48, con precision bf16 y pesos maestros en fp32, tensor parallel 4. Se entrenaron todos los pesos del modelo de lenguaje, se congelo el encoder de vision y se desactivo la cabeza de multi-token-prediction (MTP) durante el entrenamiento. No hubo RL ni optimizacion de preferencias.

La variante heretic-test2 anade una intervencion post-entrenamiento mediante Heretic v2.1.0, que aplica una ablacion de rank arbitrario sobre las capas 30 a 62. Los parametros ARA publicados son: start_layer_index 30, end_layer_index 62, preserve_good_behavior_weight 0.1381, steer_bad_behavior_weight 0.0006, overcorrect_relative_weight 0.6368 y neighbor_count 8. Esta tecnica modifica directamente los pesos para suprimir direcciones asociadas a rechazos, manteniendo el resto del comportamiento lo mas intacto posible. El autor declara que el proceso es reproducible y publica un directorio `reproduce` con instrucciones.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del pipeline text-generation del modelo base.
- Razonamiento general y respuesta a instrucciones, con el post-entrenamiento SFT de Arete-27B orientado a siete categorias de valores (libertad de expresion, ideologia estatal, estado frente a mercado libre, educacion, privacidad y vigilancia de datos, democracia y politica medioambiental).
- Reduccion drastica de rechazos: segun la model card, el clasificador de rechazos pasa de 93/100 en el modelo original a 16/100 en esta variante.
- Capacidades agenticas y de asistencia general, segun la descripcion del modelo base.
- Capacidades de vision heredadas del encoder congelado de Qwen3.8-27B, aunque no fueron entrenadas ni evaluadas en este post-entrenamiento (datos text-only).
- Capacidades multilingues: no disponibles como dato explicito; dependen del modelo base Qwen3.8-27B.
- Tool calling / function calling: no disponible como dato explicito en la informacion proporcionada.
- Modo thinking: no disponible como dato explicito.

## Casos de uso

- Investigacion sobre alineacion de valores: el modelo sirve como caso controlado para estudiar como el SFT sobre categorias ideologicas concretas altera las respuestas de un modelo base, comparando directamente con NousResearch/Arete-27B y con Qwen3.8-27B.
- Estudio de tecnicas de abliteracion: los parametros ARA publicados y el directorio `reproduce` permiten replicar la intervencion y medir su efecto sobre rechazos y divergencia KL, lo que es util para investigar metodos de modificacion de pesos.
- Evaluacion de decensura en produccion: equipos que necesitan un modelo con menos rechazos para tareas de generacion creativa, redaccion de ficcion o analisis de contenido sensible pueden usar esta variante, asumiendo los riesgos descritos en limitaciones.
- Generacion de texto a contexto largo: el modelo base fue entrenado a 64k tokens, lo que permite procesar documentos extensos, informes o conversaciones multi-turno largas en tareas de resumen y analisis.
- Asistencia general y agentica: el modelo base esta orientado a asistencia general y trabajo agentico; esta variante conserva esas capacidades con un comportamiento menos restrictivo en temas politicamente sensibles.
- Analisis de sesgos ideologicos: investigadores pueden usar el modelo para generar respuestas sobre temas politicos y comparar marcos (framing) frente al modelo original, apoyandose en el dataset Propaganda_Eval.
- Fine-tuning posterior: al ser Apache 2.0 y estar en safetensors, puede servir como punto de partida para nuevos ajustes en dominios especializados.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (NousResearch/Arete-27B) |
|---|---|---|
| Rechazos (clasificador) | 16/100 | 93/100 |
| Divergencia KL | 0.1335 | 0 (por definicion) |
| PIQA | 0.8166 | 0.8177 |
| ARC Easy | 0.8207 | 0.8123 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por el tamano (27,36B parametros), en bf16/fp16 se necesitarian aproximadamente 55 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits alrededor de 28-30 GB; en 4 bits alrededor de 15-17 GB. Estas cifras son estimaciones por tamano, no datos publicados.
- GPU recomendadas: para bf16 completo, GPU con 80 GB (A100 80GB, H100 80GB) o multi-GPU; para cuantizacion 8 bits, A100 40GB o similar; para 4 bits, RTX 4090 (24 GB) o RTX 3090 (24 GB) podrian ser suficientes segun la implementacion.
- Cabe en consumer GPU: previsiblemente si en RTX 4090/3090 con cuantizacion de 4 bits, aunque no hay datos oficiales de compatibilidad ni de rendimiento.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers son opciones habituales para safetensors de este tamano; no se confirma compatibilidad especifica en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (clasificador) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-heretic-test2 | ~27,36B | 64k (entrenamiento) | 16/100 | Apache 2.0 | Hugging Face (darkc0de) |
| NousResearch/Arete-27B | ~27B | 64k (entrenamiento) | 93/100 | Apache 2.0 | Hugging Face (NousResearch) |
| Qwen3.8-27B (base original) | ~27B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos adicionales con otros modelos abliterated de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion reduce rechazos de forma agresiva (de 93/100 a 16/100), lo que implica un riesgo elevado de generar contenido que el modelo original rechazaria, incluido contenido danino o sensible; debe usarse con salvaguardas externas en produccion.
- La divergencia KL de 0.1335 respecto al modelo original indica que la distribucion de salida ha cambiado de forma medible; no es una variante neutra.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de factualidad para esta variante; el modelo base reporta mejoras en fact score (de 2.32 a 2.98 sobre 5) pero no hay datos para heretic-test2.
- Idiomas soportados no documentados; el comportamiento multilingue depende del modelo base y no ha sido evaluado en esta variante.
- El encoder de vision quedo congelado y los datos de post-entrenamiento eran text-only, por lo que las capacidades de vision no fueron ajustadas ni evaluadas.
- El modelo esta marcado como "test2", lo que sugiere una version experimental sin garantias de estabilidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad sobre el uso recae en el desplegador.
- Sesgos conocidos: el post-entrenamiento de Arete-27B introduce deliberadamente un marco de valores occidental en temas politicos; esta variante modifica ademas el comportamiento de rechazo, por lo que los sesgos de framing pueden persistir o acentuarse.
- No hay datos publicados de tool calling, modo thinking ni rendimiento en produccion para esta variante concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkc0de/Arete-27B-heretic-test2
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Blog de Nous Research sobre Arete: https://nousresearch.com/arete
- Dataset de evaluacion Propaganda_Eval: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Proyecto Heretic: https://heretic-project.org
- Perfil del autor en Hugging Face: https://huggingface.co/darkc0de
- Directorio de reproduccion: `reproduce/README.md` dentro del repositorio del modelo
