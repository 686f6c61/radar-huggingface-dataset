# iclropen/evidence-audit-timezero7b-pc-a1-s0

## Resumen

`evidence-audit-timezero7b-pc-a1-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `wwwyyy/TimeZero-Charades-7B`, un modelo de 7.000 millones de parametros con arquitectura Qwen2.5-VL especializado en localizacion temporal de eventos en video (video temporal grounding) sobre el conjunto Charades-STA. El adaptador no modifica la arquitectura del modelo base: solo anade matrices de bajo rango (r=16, alpha=32) sobre las proyecciones de atencion y MLP, con un total de 190.442.760 bytes de pesos en safetensors (aproximadamente 0,2 GB de repositorio).

El interes del adaptador es metodologico mas que de rendimiento bruto. Acompana al articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (envio a ICLR 2027, en revision), que propone medir si un modelo responde realmente a la evidencia visual o si acierta por atajos. Este checkpoint concreto implementa el objetivo "placebo-controlled" con alpha=1, es decir, combina la supervision limpia con terminos de margen que penalizan que el modelo cambie su prediccion cuando se edita el video fuera del intervalo anotado (placebo) y que premian que la cambie cuando se edita dentro (evidencia).

Es relevante ahora porque expone una practica poco habitual: la auditoria de dependencia de evidencia en modelos multimodales de video, con codigo de evaluacion reproducible y una comprobacion de integridad de carga que detecta el fallo silencioso de compatibilidad entre transformers 4.51 y 5.x. No es un modelo para produccion generalista, sino una pieza de investigacion reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (modelo base TimeZero-Charades-7B); target modules q/k/v/o/gate/up/down_proj |
| Parametros totales | 7B en el modelo base; adaptador LoRA de 190.442.760 bytes (r=16, lora_alpha=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos safetensors en precision original del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TimeZero-Charades-7B, un transformer multimodal de tipo Qwen2.5-VL con 7.000 millones de parametros. El LoRA usa rango 16, alpha 32 y dropout 0,05 sobre las proyecciones q, k, v, o, gate, up y down. La entrada de video se muestrea a 2 fps con un maximo de 768 frames, el mensaje se ordena con el video primero y el prompt/answer sigue el estilo `timer1_default` / `timer1`.

El entrenamiento sigue el objetivo de la Seccion 4 del articulo: L = alpha * NLL(clean) + suma sobre operadores de w_op * [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge sobre la caida de placebo], donde x_E es el video con edicion de evidencia y x_O la edicion placebo emparejada fuera del intervalo anotado. En este checkpoint alpha=1,0, beta=0,1 y la cota de placebo es d_O(entrenado) <= 1,25 d_O(referencia) + 0,10 con peso de hinge 1,0. Se usaron 2.400 pares de entrenamiento de Charades-STA (primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`), 300 pasos de optimizador, semilla 0, learning rate 5e-6 y acumulacion de gradiente 8. Los operadores de edicion en entrenamiento son swap, mask, blur, tshift y shuffle, dos por ejemplo. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py`, con pesos de operador Group-DRO.

Una innovacion tecnica destacable es la comprobacion de integridad de carga: los adaptadores entrenados con transformers 4.51 guardan claves como `base_model.model.model.layers.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*`. Cargar con la version equivocada no lanza error pero deja los pesos LoRA sin aplicar; el autor incluye un self-check que compara tensor a tensor el fichero con el state_dict del modelo.

## Capacidades

- Localizacion temporal de eventos en video (video temporal grounding) sobre el dominio Charades-STA.
- Razonamiento visual sobre secuencias de video muestreadas a 2 fps con hasta 768 frames.
- Generacion de texto asociada a la prediccion de intervalos temporales.
- Evaluacion de dependencia de evidencia: el adaptador esta disenado para que el modelo responda a ediciones dentro del intervalo anotado y no a ediciones placebo fuera de el.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo thinking, vision, audio: solo vision (heredada del modelo base Qwen2.5-VL); no se documenta modo thinking ni audio.

## Casos de uso

- Auditoria de modelos de video temporal grounding: cargar el adaptador con `--model  --adapter <folder>` en los scripts del repositorio de codigo para medir la dependencia de evidencia mediante la auditoria de verosimilitud y la auditoria comportamental.
- Investigacion sobre atajos en modelos multimodales: usar el objetivo placebo-controlled como referencia para comparar checkpoints con y sin regularizacion de evidencia y cuantificar cuanto acierta el modelo por la evidencia visual frente a por sesgos del dataset.
- Reproduccion de resultados del articulo: el adaptador corresponde a las Tablas 6, 7, 10, 13, 14 y 21 y a las Figuras 1, 4 y 5 del envio a ICLR 2027, por lo que sirve para replicar esas cifras con el codigo publicado.
- Validacion de pipelines de carga de adaptadores PEFT: el self-check incluido detecta el fallo silencioso de compatibilidad entre transformers 4.51 y 5.x, util en entornos de CI que verifican que los pesos LoRA se aplican realmente.
- Estudio de robustez ante ediciones de video: los operadores swap, mask, blur, tshift y shuffle permiten construir variantes editadas del mismo clip y observar si la prediccion se mantiene o cambia segun la teoria del articulo.
- Base para adaptadores derivados: al ser un LoRA de 0,2 GB sobre un base de 7B, se puede combinar o sustituir en experimentos de ablation con distintas alpha y pesos de operador sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las Tablas 6, 7, 10, 13, 14 y 21 del articulo, pero no incluye cifras numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia estructural, el modelo base es de 7B parametros multimodales; el adaptador anade 0,2 GB de pesos.
- GPU recomendadas: no disponible.
- Cabe en consumer GPU: no disponible.
- Opciones de despliegue: transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior, con `Qwen2_5_VLForConditionalGeneration` y `AutoProcessor`; requiere ademas safetensors, huggingface_hub y qwen-vl-utils. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timezero7b-pc-a1-s0 | 7B base + LoRA 0,2 GB | no disponible | Video temporal grounding (Charades-STA) | other | Hugging Face (adaptador) |
| wwwyyy/TimeZero-Charades-7B | 7B | no disponible | Video temporal grounding (Charades-STA) | no disponible | Hugging Face (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar `wwwyyy/TimeZero-Charades-7B` como base.
- La licencia es "other": no se especifican los terminos exactos, por lo que el uso comercial requiere revisar las condiciones del autor y del modelo base antes de cualquier despliegue en produccion.
- Riesgo de carga silenciosa incorrecta: si se usa transformers 4.51 en lugar de 5.x (o viceversa), los pesos LoRA no se aplican y el modelo se comporta como el base sin aviso; es imprescindible ejecutar el self-check incluido.
- Dominio muy restringido: entrenado sobre Charades-STA (2.400 pares, 300 pasos), no es un modelo generalista de video ni de texto.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Limitaciones de contexto: la longitud de contexto no se especifica; la entrada de video esta limitada a 2 fps y 768 frames como maximo.
- Estado del articulo: envio a ICLR 2027 en revision, con autoria anonima; los resultados pueden cambiar en la version final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iclropen/evidence-audit-timezero7b-pc-a1-s0
- Modelo base: https://huggingface.co/wwwyyy/TimeZero-Charades-7B
- Codigo del proyecto: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (en revision); no se proporciona enlace al PDF en la informacion disponible.
