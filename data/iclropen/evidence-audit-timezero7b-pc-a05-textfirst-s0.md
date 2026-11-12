# iclropen/evidence-audit-timezero7b-pc-a05-textfirst-s0

## Resumen

`evidence-audit-timezero7b-pc-a05-textfirst-s0` es un adaptador LoRA sobre el modelo base `wwwyyy/TimeZero-Charades-7B`, un modelo de vision-lenguaje construido sobre la arquitectura Qwen2.5-VL. Lo publica el usuario `iclropen` como artefacto reproducible del articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision. El adaptador no es un modelo generalista: es una pieza experimental disenada para modificar el comportamiento del modelo base en una tarea muy concreta, el anclaje temporal de evidencias en video (video temporal grounding) sobre el conjunto de datos Charades-STA.

El problema que aborda es la dependencia de la evidencia: un modelo puede acertar el intervalo temporal predicho sin haber utilizado realmente el contenido visual, apoyandose en atajos del texto de la consulta. El adaptador se entrena con un objetivo "placebo-controlled" que penaliza que la prediccion cambie cuando se edita el video dentro del intervalo anotado (evidencia real) pero no cuando se aplica una edicion equivalente fuera de el (placebo). El entrenamiento es "text-first": el mensaje de texto se coloca antes que el video en la secuencia de entrada.

El repositorio solo contiene los pesos LoRA (unos 190 MB en `adapter_model.safetensors`), no el modelo completo. Se corresponde con la semilla 0, alpha=0.5 y las configuraciones recogidas en las tablas 6, 7, 10 y 13 del articulo. Su relevancia es metodologica: sirve para auditar si un modelo de grounding temporal usa la evidencia visual o solo el lenguaje, y para comparar variantes de entrenamiento bajo ese criterio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (modelo base `wwwyyy/TimeZero-Charades-7B`) |
| Parametros totales | no disponible (el adaptador LoRA ocupa ~190 MB; el modelo base es de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en bfloat16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango r=16, `lora_alpha=32` y dropout 0.05, aplicado sobre los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base Qwen2.5-VL. Solo se publican los pesos del adaptador; el modelo base debe descargarse por separado. El entrenamiento usa 2.400 pares de Charades-STA (las primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`), 300 pasos de optimizacion, semilla 0, tasa de aprendizaje 5e-6 y acumulacion de gradiente 8. El video se muestrea a 2 fps con un maximo de 768 fotogramas.

La innovacion central es el objetivo de entrenamiento: L = alpha * NLL(limpio) + suma sobre operadores de w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge sobre la caida placebo], donde x_E es el video con edicion de evidencia y x_O la edicion placebo equivalente fuera del intervalo anotado. Se emplean cinco operadores de edicion (swap, mask, blur, tshift, shuffle), dos por ejemplo, con pesos Group-DRO. Los hiperparametros concretos son alpha=0.5, beta=0.1 y una cota placebo d_O(entrenado) <= 1.25 d_O(referencia) + 0.10 con peso de hinge 1.0. El orden de mensajes es texto primero y video despues.

## Capacidades

- Anclaje temporal de evidencias en video: localizacion de intervalos temporales en un video a partir de una consulta textual, sobre el dominio de Charades-STA.
- Auditoria de dependencia de evidencia: el adaptador esta disenado para que el modelo responda de forma distinta ante ediciones de la evidencia real y de forma estable ante ediciones placebo.
- Razonamiento multimodal vision-lenguaje heredado del modelo base Qwen2.5-VL.
- Procesamiento de video a 2 fps con hasta 768 fotogramas.
- No se documentan capacidades de tool calling, function calling, agentes, audio ni thinking mode para este adaptador.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en grounding temporal: evaluar si un modelo de video-lenguaje usa la evidencia visual o atajos textuales, comparando predicciones con y sin ediciones del video.
- Reproduccion de experimentos: regenerar las tablas 6, 7, 10 y 13 del articulo cargando este adaptador con la version de transformers indicada y ejecutando los scripts de auditoria.
- Auditoria de robustez de modelos de video: aplicar los operadores swap, mask, blur, tshift y shuffle para medir la sensibilidad del modelo a cambios en la evidencia.
- Desarrollo de metodos de evaluacion: usar el adaptador como referencia de un modelo entrenado para depender de la evidencia, frente a un modelo base no entrenado con ese objetivo.
- Analisis de sesgo de atajo: estudiar como el orden texto-primero afecta al uso de la evidencia visual en tareas de localizacion temporal.
- Formacion y docencia: ilustrar tecnicas de entrenamiento con objetivos contrastivos y control placebo en modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas 6, 7, 10 y 13 del articulo, pero no incluye cifras.

## Requisitos de hardware

- El adaptador LoRA ocupa unos 190 MB; el modelo base TimeZero-Charades-7B (7B parametros) requiere VRAM adicional para inferencia.
- VRAM estimada: no disponible de forma explicita; para un modelo de 7B en bfloat16 se necesita del orden de 14-16 GB solo para pesos, mas memoria para el procesamiento de hasta 768 fotogramas de video.
- GPU recomendadas: no especificadas por el autor; por tamano del modelo base, se esperaria A100, H100 o GPUs consumer de gama alta con suficiente VRAM.
- Despliegue: transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior, con `qwen-vl-utils`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timezero7b-pc-a05-textfirst-s0 | LoRA sobre 7B | no disponible | Grounding temporal con control placebo | other | Hugging Face |
| wwwyyy/TimeZero-Charades-7B (base) | 7B | no disponible | Grounding temporal en Charades-STA | no disponible | Hugging Face |
| Modelos Qwen2.5-VL genericos | 7B | no disponible | Vision-lenguaje general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador experimental de investigacion, no un modelo listo para produccion.
- Solo contiene pesos LoRA; requiere el modelo base `wwwyyy/TimeZero-Charades-7B` y una version concreta de transformers (5.x); cargarlo con transformers 4.51 no da error pero deja los pesos sin aplicar.
- Entrenado exclusivamente sobre Charades-STA; su comportamiento fuera de ese dominio no esta caracterizado.
- Licencia "other": es necesario revisar los terminos concretos antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones multilingues.
- El articulo esta en revision (ICLR 2027), por lo que los resultados y metodos pueden cambiar.

## Enlaces

- Hugging Face: https://huggingface.co/iclropen/evidence-audit-timezero7b-pc-a05-textfirst-s0
- Modelo base: https://huggingface.co/wwwyyy/TimeZero-Charades-7B
- Codigo del proyecto: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review)
