# iclropen/evidence-audit-qwen7b-pc-a05-s1

## Resumen

`evidence-audit-qwen7b-pc-a05-s1` es un adaptador LoRA de PEFT sobre el modelo base Qwen2.5-VL-7B-Instruct, desarrollado por el autor `iclropen` en el contexto de la publicacion *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (sometida a ICLR 2027). El adaptador esta disenado especificamente para la tarea de localizacion temporal de evidencia en video (video temporal grounding) sobre el conjunto de datos Charades-STA, y su proposito es aumentar la dependencia del modelo respecto a la evidencia visual real en lugar de explotar atajos estadisticos.

El modelo no es un modelo completo, sino un conjunto de pesos LoRA (r=16, alpha=32) que se cargan sobre Qwen2.5-VL-7B-Instruct. El repositorio ocupa 0.2 GB y contiene unicamente el fichero `adapter_model.safetensors`. Segun la model card, los pesos aqui publicados provienen de un reentrenamiento con la misma receta que el run original (mismo trainer, pares de entrenamiento, hiperparametros, semilla y orden de ejemplos), ya que el adaptador original no se conservo.

La relevancia del modelo es metodologica: introduce un objetivo de entrenamiento "placebo-controlled" que penaliza al modelo cuando su respuesta cambia ante ediciones del video fuera del intervalo anotado (placebo), forzandolo a basar sus predicciones en la evidencia visual anotada. Es un artefacto de investigacion, no un modelo de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-7B-Instruct (transformer multimodal vision-language) |
| Parametros totales | Adaptador LoRA: 190.435.728 bytes en `adapter_model.safetensors`; modelo base: 7B (no disponible el desglose exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa video e imagen junto con texto. El entrenamiento usa LoRA con r=16, lora_alpha=32, dropout 0.05 y modulos objetivo q/k/v/o/gate/up/down_proj. Segun la model card, los runs con transformers 4.51 usaron gradient checkpointing, bajo el cual la torre de vision no recibio gradiente: las matrices `lora_B` de la torre visual son todas cero, de modo que el adaptador modifica unicamente el modelo de lenguaje.

El objetivo de entrenamiento (Seccion 4 del paper) combina la NLL sobre el video limpio con terminos de margen sobre la caida de verosimilitud bajo ediciones de evidencia y bajo ediciones placebo: L = alpha * NLL(clean) + suma sobre operadores de w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge sobre la caida placebo], donde x_E es el video con evidencia editada y x_O la edicion placebo emparejada fuera del intervalo anotado. Se usan pesos de operador Group-DRO. Hiperparametros: alpha=0.5, beta=0.1, cota placebo d_O(trained) <= 1.25 * d_O(reference) + 0.10 con peso de hinge 1.0, 2.400 pares de entrenamiento de Charades-STA, 300 pasos del optimizador, semilla 1, learning rate 5e-6, acumulacion de gradiente 8. Operadores de edicion en entrenamiento: swap, mask, blur, tshift, shuffle (2 por ejemplo). Entrada de video a 2 fps, maximo 768 frames. Estilo de prompt/answer timer1_default / timer1, con el video primero y luego el texto. Stack: transformers 4.51.3, peft 0.20.0, flash_attention_2.

## Capacidades

- Localizacion temporal de evidencia en video: dado un video y una consulta textual, el modelo devuelve un intervalo temporal (con un 97.9% de respuestas con intervalo parseable segun la model card).
- Razonamiento sobre evidencia visual: el entrenamiento busca que la respuesta dependa de la evidencia anotada y no de atajos estadisticos.
- Procesamiento multimodal video-texto heredado de Qwen2.5-VL-7B-Instruct.
- Generacion de texto y respuestas en formato estructurado (intervalo temporal parseable).
- Capacidades generales del modelo base (tool calling, agentes, multilingue) no estan documentadas para este adaptador en la informacion disponible.

## Casos de uso

- Investigacion en video temporal grounding: el adaptador sirve como artefacto reproducible para estudiar la dependencia de evidencia en modelos de localizacion temporal, comparando el comportamiento con y sin adaptador sobre Charades-STA.
- Auditoria de robustez: permite medir la caida de verosimilitud ante ediciones de evidencia (mask, swap) frente a ediciones placebo, usando los scripts de auditoria del repositorio de codigo.
- Reproduccion de resultados: con la huella de orden de ejemplos `fd678ca1ae4d61ad08b1385bb71a90a6e70ebb0590142e6cfe378e4d3bee96d7` se puede verificar que un reentrenamiento sigue la misma receta.
- Evaluacion de metodos de regularizacion: util para comparar objetivos placebo-controlled frente a fine-tuning estandar sobre el mismo modelo base.
- Generacion de intervalos temporales en pipelines de analisis de video: con 2 fps y hasta 768 frames, puede integrarse en flujos de anotacion asistida de Charades-STA u otros datasets de grounding.
- Base para experimentos de ablation: al modificar unicamente el modelo de lenguaje (torre visual con LoRA a cero), permite aislar el efecto del ajuste sobre el componente linguistico.

## Benchmarks y rendimiento

Datos de la model card (reentrenamiento, no el run original del paper):

| Metrica | Reentrenado (este repo) | Run original |
|---|---|---|
| Gamma, mask (nats/token) | +1.50 [1.26, 1.75], n=108 | no disponible |
| Gamma, swap (nats/token) | +1.42 [1.25, 1.58], n=108 | no disponible |
| R@0.5, cambio frente al base | +5.9 puntos [4.8, 7.2] (56.6% vs 50.7%) | no disponible |
| Respuestas con intervalo parseable | 97.9% | no disponible |

Gamma se define como el cambio en psi = d_E - d_O (caida de log-verosimilitud de la respuesta anotada bajo edicion de evidencia menos caida bajo edicion placebo), en nats por token sobre todos los tokens de respuesta, sobre las preguntas entre las primeras 200 de test de Charades-STA que ambos modelos localizan (n=108). R@0.5 es exactitud sobre las 3.720 preguntas de test a 2 fps con decodificacion greedy, con intervalo bootstrap al 95% a nivel de pregunta. Para escala, el modelo principal semilla 0 (`evidence-audit-qwen7b-pc-a05-s0`) da Gamma (mask) +1.62, n=108.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el adaptador LoRA ocupa 190 MB, pero requiere cargar el modelo base Qwen2.5-VL-7B-Instruct en bfloat16 (aproximadamente 14-16 GB solo para pesos, sin contar activaciones ni cache de video).
- GPU recomendadas: no disponible en la informacion proporcionada; el modelo base de 7B con procesamiento de video a 2 fps y hasta 768 frames requiere memoria adicional para activaciones.
- Cabida en GPU de consumo: no confirmado; un modelo de 7B en bf16 no cabe en GPUs de 8-12 GB sin cuantizacion, y la cuantizacion del adaptador no esta documentada.
- Opciones de despliegue: transformers 4.51.3 con peft 0.20.0 y flash_attention_2 (stack probado). Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-s1 | LoRA sobre 7B | no disponible | R@0.5 56.6% en Charades-STA | apache-2.0 | Hugging Face |
| evidence-audit-qwen7b-pc-a05-s0 | LoRA sobre 7B | no disponible | Gamma (mask) +1.62, n=108 | no disponible | Hugging Face |
| Qwen2.5-VL-7B-Instruct (base) | 7B | no disponible | R@0.5 50.7% en Charades-STA | no disponible | Hugging Face |

No se dispone de datos de otros adaptadores o modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigacion para una tarea concreta (video temporal grounding en Charades-STA), no un modelo de proposito general.
- Los pesos publicados provienen de un reentrenamiento; las cifras del paper corresponden al run original, no a este repositorio.
- La torre de vision no fue entrenada (lora_B a cero por gradient checkpointing): el adaptador solo modifica el modelo de lenguaje.
- Incompatibilidad silenciosa entre transformers 4.51 y 5.x: cargar el adaptador con la version incorrecta no lanza error pero deja los pesos LoRA sin cargar. Es obligatorio ejecutar el self-check incluido en la model card.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles.
- Restricciones de licencia: apache-2.0, sin restricciones comerciales declaradas, pero el uso previsto es de investigacion.
- Sin descargas ni likes en el momento de la consulta; sin pipeline declarado.

## Enlaces

- Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Codigo: https://huggingface.co/iclropen/evidence-audit-code
- Modelo semilla 0: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-s0
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review); enlace no disponible.
