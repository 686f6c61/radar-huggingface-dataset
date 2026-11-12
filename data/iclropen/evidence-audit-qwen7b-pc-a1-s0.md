# iclropen/evidence-audit-qwen7b-pc-a1-s0

## Resumen

`evidence-audit-qwen7b-pc-a1-s0` es un adaptador LoRA sobre el modelo base Qwen2.5-VL-7B-Instruct, desarrollado por el usuario `iclropen` en el contexto de una submission al ICLR 2027 titulada *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. No es un modelo independiente, sino un conjunto de pesos de adaptación (190,4 MB) que modifica el comportamiento del modelo base para una tarea muy concreta: el anclaje temporal de evidencias en vídeo (video temporal grounding) sobre el conjunto de datos Charades-STA.

El objetivo del trabajo es medir y entrenar la *dependencia de la evidencia*: que el modelo base sus respuestas en el contenido visual real del intervalo anotado y no en atajos o correlaciones espurias. Para ello se entrena con una función de pérdida "placebo-controlled" que penaliza que el modelo mantenga la respuesta cuando se edita el vídeo dentro del intervalo de evidencia, y exige que la respuesta caiga cuando se aplica una edición placebo equivalente fuera del intervalo.

Es relevante ahora porque aborda un problema poco tratado en la literatura de grounding: la diferencia entre precisión aparente y evidencia real. El adaptador es de interés para investigadores que trabajen en evaluación de modelos visión-lenguaje y en robustez frente a ediciones del vídeo, más que para despliegues de producción generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer visión-lenguaje Qwen2.5-VL (adaptador PEFT) |
| Parametros totales | No disponible (el adaptador pesa 190.442.760 bytes; el modelo base es de 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos LoRA en safetensors) |
| Idiomas soportados | No disponible (heredados del modelo base; no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal visión-lenguaje. Los pesos LoRA tienen rango r=16, `lora_alpha=32` y dropout 0.05, y afectan a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El repositorio solo contiene los pesos del adaptador; el modelo base debe descargarse por separado. Un detalle técnico crítico es la incompatibilidad de claves entre transformers 4.51 y 5.x: los adaptadores entrenados con la versión 4.51 usan `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que la versión 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar el adaptador con la versión equivocada no lanza error, pero deja los pesos LoRA sin cargar; la model card incluye un script de autocomprobación que verifica tensor a tensor que los pesos han aterrizado en los módulos correctos.

El entrenamiento sigue la función de pérdida descrita en la Sección 4 del paper: `L = alpha * NLL(clean) + sum over operators of w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge on the placebo drop]`, donde `x_E` es el vídeo con edición de evidencia y `x_O` una edición placebo equivalente fuera del intervalo anotado. Se usan pesos de operador Group-DRO, con `alpha=1.0`, `beta=0.1`, cota de placebo `d_O(trained) <= 1.25 d_O(reference) + 0.10` y peso del hinge 1.0. Los datos son 2.400 pares de entrenamiento de Charades-STA (primeras líneas de `data_ids/training_pairs_pool_8434.jsonl`), con 300 pasos de optimizador, learning rate 5e-6, acumulación de gradiente 8 y semilla 0. Los operadores de edición en entrenamiento son swap, mask, blur, tshift y shuffle (2 por ejemplo). La entrada de vídeo se muestrea a 2 fps con un máximo de 768 frames, con prompt y respuesta en estilo `timer1_default` / `timer1` y orden de mensajes vídeo primero, texto después. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py` (las revisiones r3, r4 y el archivo sin sufijo tienen los mismos valores por defecto).

## Capacidades

- Anclaje temporal de evidencias en vídeo (video temporal grounding) sobre Charades-STA: localización de intervalos temporales que justifican una consulta textual.
- Robustez ante ediciones del vídeo: el adaptador está entrenado para que la respuesta caiga cuando se altera el intervalo de evidencia y se mantenga cuando se altera una región placebo fuera de él.
- Evaluación de dependencia de evidencia: permite ejecutar auditorías de verosimilitud y auditorías de comportamiento sobre el modelo base, según los scripts del repositorio de código.
- Capacidades heredadas del modelo base Qwen2.5-VL-7B-Instruct (visión, texto, tool calling, multilingüismo): no disponible de forma específica en la información proporcionada; el adaptador no las declara ni las modifica explícitamente.
- No se documentan capacidades de agente, razonamiento multi-paso ni thinking mode específicas del adaptador.

## Casos de uso

- Investigación en robustez de modelos visión-lenguaje: el adaptador sirve para reproducir los experimentos de dependencia de evidencia del paper, comparando la precisión aparente con la caída de respuesta ante ediciones del vídeo.
- Auditoría de modelos de grounding en producción: permite evaluar si un modelo base responde por el contenido visual del intervalo o por atajos, usando los scripts de auditoría de verosimilitud y de comportamiento incluidos en el repositorio de código.
- Reproducibilidad de resultados académicos: las tablas 6 a 17 y las figuras 1, 2, 4, 5 y 11 del paper se generan con este adaptador y la semilla 0, lo que facilita la réplica de experimentos.
- Estudio de funciones de pérdida con control de placebo: el adaptador es un punto de partida para comparar objetivos de entrenamiento (placebo-controlled frente a NLL limpio) en tareas de grounding temporal.
- Benchmarking de adaptadores LoRA multimodales: sirve para validar pipelines de carga PEFT sobre Qwen2.5-VL y detectar el problema de compatibilidad de claves entre transformers 4.51 y 5.x.
- Docencia y formación en evaluación de modelos multimodales: el par base+adaptador y el script de autocomprobación son un ejemplo concreto de cómo verificar que un adaptador se ha cargado realmente y no ha quedado como no-op silencioso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas 6 a 17 y figuras del paper, pero no incluye cifras numéricas de MMLU, HumanEval, GSM8K ni de precisión en Charades-STA.

## Requisitos de hardware

- El adaptador LoRA pesa 190,4 MB; el modelo base Qwen2.5-VL-7B-Instruct debe cargarse en bfloat16, lo que requiere aproximadamente 14-16 GB de VRAM solo para los pesos, más memoria para el procesador visual y el vídeo de entrada (hasta 768 frames a 2 fps).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del modelo base, cabría esperar A100, H100 o RTX 4090, pero no se confirma en la model card.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base de 7B en bfloat16 probablemente no cabe en GPUs de 8-12 GB sin cuantización, y el repositorio no ofrece pesos cuantizados.
- Opciones de despliegue: la model card documenta carga con `transformers>=5.12`, `peft>=0.19.1`, `safetensors`, `huggingface_hub` y `qwen-vl-utils`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `evidence-audit-qwen7b-pc-a1-s0` | Adaptador LoRA sobre 7B | No disponible | Video temporal grounding con control de placebo | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-VL-7B-Instruct (base) | 7B | No disponible en esta ficha | Visión-lenguaje general | Apache 2.0 | Hugging Face |
| Alternativas de grounding temporal | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables específicos de video temporal grounding en la documentación proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar Qwen2.5-VL-7B-Instruct por separado.
- Riesgo de carga silenciosa como no-op: si se usa la versión de transformers equivocada (4.51 frente a 5.x), los pesos LoRA no se cargan y no se produce ningún error; es obligatorio ejecutar el script de autocomprobación de la model card.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares, 300 pasos): su generalización a otros dominios de vídeo o a otras tareas de grounding no está documentada.
- Sin datos de benchmarks publicados en la información disponible: no se puede evaluar su rendimiento frente a alternativas.
- Idiomas soportados no declarados; las capacidades multilingües dependen del modelo base y no están verificadas para este adaptador.
- Riesgo de alucinación: no evaluado en la información proporcionada; el objetivo del paper es precisamente medir la dependencia de evidencia, lo que sugiere que el modelo base puede responder sin apoyo visual real.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador está pensado para investigación; no hay garantías de soporte ni mantenimiento (0 descargas, 0 likes, creado y actualizado el mismo día).
- El paper está en revisión (ICLR 2027) y la citación es anónima; los resultados pueden cambiar antes de la publicación final.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a1-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de código: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review; sin enlace directo en la información proporcionada)
