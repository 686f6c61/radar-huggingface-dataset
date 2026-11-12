# iclropen/evidence-audit-timezero7b-pc-a05-b003-s0

## Resumen

`evidence-audit-timezero7b-pc-a05-b003-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `wwwyyy/TimeZero-Charades-7B`, un modelo de vision-lenguaje construido sobre la arquitectura Qwen2.5-VL de 7.000 millones de parametros. El adaptador no es un modelo autonomo: contiene unicamente los pesos LoRA (190.442.760 bytes, unos 0,2 GB) y requiere cargar el modelo base para funcionar.

El adaptador acompana al paper *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (sometido a ICLR 2027, en revision). El problema que aborda es la dependencia de evidencia en tareas de localizacion temporal de video: un modelo puede acertar el intervalo anotado sin estar realmente mirando la evidencia visual, apoyandose en sesgos del dataset o en el contexto textual. El adaptador entrena al modelo con un objetivo "placebo-controlado" que penaliza las respuestas que no cambian cuando se elimina o altera la evidencia dentro del intervalo anotado.

Es relevante para investigadores que trabajen en evaluacion de modelos de video y en robustez frente a atajos espurios, no tanto para despliegue en produccion. El repositorio no incluye pesos completos, no declara idiomas soportados y no publica resultados de benchmarks propios mas alla de las referencias a tablas y figuras del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (modelo base `wwwyyy/TimeZero-Charades-7B`) |
| Parametros totales | no disponible (adaptador LoRA de 190.442.760 bytes; el modelo base es de 7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5-VL) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (solo pesos LoRA, `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL, un transformer multimodal con torre visual y modelo de lenguaje. Los pesos LoRA se insertan en los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, tanto en la parte de lenguaje como en la visual (`base_model.model.model.visual.*`). La configuracion LoRA es r=16, `lora_alpha=32` y dropout 0,05.

El entrenamiento sigue el objetivo descrito en la seccion 4 del paper: `L = alpha * NLL(clean) + sum_op w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge on the placebo drop]`, donde `x_E` es el video con la evidencia editada y `x_O` es un placebo emparejado fuera del intervalo anotado. Se usan pesos de operador Group-DRO, con `alpha=0.5` y `beta=0.03`, y una cota de placebo `d_O(trained) <= 1.25 d_O(reference) + 0.10` con peso de hinge 1,0. Los pares de entrenamiento son 2.400 (Charades-STA train, primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`), con 300 pasos de optimizador, semilla 0, learning rate 5e-6 y acumulacion de gradiente 8. Los operadores de edicion empleados son swap, mask, blur, tshift y shuffle (dos por ejemplo). La entrada de video se muestrea a 2 fps con un maximo de 768 frames, con estilo de prompt `timer1_default` / `timer1` y orden de mensajes video primero y texto despues. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py`.

Una advertencia tecnica importante del autor: los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar el adaptador con la version equivocada no lanza error pero deja los pesos LoRA sin cargar, por lo que el autor incluye un self-check en la model card.

## Capacidades

- Localizacion temporal de video (video temporal grounding) sobre el dataset Charades-STA, heredando las capacidades del modelo base TimeZero-Charades-7B.
- Razonamiento multimodal video-texto: el modelo base es Qwen2.5-VL, por lo que conserva capacidad de comprension de imagen y video.
- Entrenamiento especifico para dependencia de evidencia: el adaptador modifica el comportamiento para que las predicciones respondan a la evidencia visual y no a atajos del dataset.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): vision si (heredada del base); audio no disponible; thinking mode no disponible.

## Casos de uso

- Auditoria de evidencia en modelos de video temporal grounding: usar el adaptador como referencia de comportamiento "dependiente de evidencia" y comparar con el modelo base sin adaptador para medir cuanto cambia la prediccion cuando se altera el intervalo anotado.
- Investigacion en robustez frente a atajos: entrenar o evaluar variantes con el objetivo placebo-controlado para cuantificar la dependencia de evidencia en Charades-STA, usando los scripts de auditoria de probabilidad y auditoria conductual del repositorio de codigo.
- Reproduccion de resultados del paper: cargar el adaptador con transformers 5.12.1 y peft 0.19.1 o superior para reproducir las tablas 6, 7, 10, 13, 14 y 21 y las figuras 1 y 5 del paper.
- Analisis de sensibilidad a operadores de edicion: evaluar como responde el modelo a swap, mask, blur, tshift y shuffle sobre el intervalo anotado, para identificar que tipo de alteracion rompe la prediccion correcta.
- Docencia y formacion en evaluacion de modelos multimodales: usar el par base + adaptador como ejemplo practico de por que la exactitud (accuracy) no equivale a evidencia, con self-check de carga incluido.
- Validacion de pipelines de carga PEFT: el self-check de la model card sirve como test de integracion para verificar que transformers y peft mapean correctamente las claves LoRA en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas 6, 7, 10, 13, 14 y 21 y a las figuras 1 y 5 del paper, pero no incluye cifras concretas (accuracy, mIoU, dependencia de evidencia) en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo base es de 7B parametros y el adaptador anade unos 0,2 GB de pesos LoRA; en bfloat16 el base requiere del orden de 14-16 GB solo para pesos, mas el coste de la torre visual y de hasta 768 frames a 2 fps.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del base, cabria esperar A100, H100 o RTX 4090 para inferencia en bfloat16, pero el autor no lo especifica.
- Cabe en consumer GPU: no confirmado en la informacion disponible; el modelo base de 7B en cuantizacion de 4 bits podria caber en GPUs consumer de 24 GB, pero no hay dato oficial.
- Opciones de despliegue: transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior, segun la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iclropen/evidence-audit-timezero7b-pc-a05-b003-s0` | LoRA sobre base 7B | no disponible | Video temporal grounding con dependencia de evidencia | other | Hugging Face (adaptador) |
| `wwwyyy/TimeZero-Charades-7B` (base) | 7B | no disponible | Video temporal grounding en Charades-STA | no disponible | Hugging Face |
| Qwen2.5-VL (arquitectura del base) | 7B (variante) | no disponible | Vision-lenguaje general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo pesos LoRA; no es un modelo autonomo y requiere el base `wwwyyy/TimeZero-Charades-7B`.
- Riesgo de carga silenciosa incorrecta: con la version equivocada de transformers (4.51 frente a 5.x) el adaptador se carga sin error pero los pesos LoRA no se aplican; es obligatorio ejecutar el self-check de la model card.
- Licencia "other": no se detallan los terminos, por lo que el uso comercial no esta claro y requiere consultar al autor.
- Entrenado especificamente sobre Charades-STA; la generalizacion a otros dominios de video o datasets no esta documentada.
- Idiomas soportados no declarados; el comportamiento multilingue del adaptador es desconocido.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el objetivo del paper es precisamente medir la dependencia de evidencia, lo que sugiere que el modelo base puede acertar por atajos.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto: no se especifica la longitud de contexto del base ni del adaptador.
- Paper en revision (ICLR 2027): los resultados y la metodologia pueden cambiar antes de la publicacion final.
- Fecha de creacion del repositorio (2026-11-12) y cero descargas: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-timezero7b-pc-a05-b003-s0
- Modelo base: https://huggingface.co/wwwyyy/TimeZero-Charades-7B
- Repositorio de codigo del paper: https://huggingface.co/iclropen/evidence-audit-code
