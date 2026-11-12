# iclropen/evidence-audit-timezero7b-sft-textfirst-s0

## Resumen

`evidence-audit-timezero7b-sft-textfirst-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `wwwyyy/TimeZero-Charades-7B`, un modelo de vision-lenguaje de 7B parametros construido sobre la arquitectura Qwen2.5-VL y especializado en *video temporal grounding* (localizacion de intervalos temporales en video a partir de una consulta textual). El adaptador se entrena mediante *supervised fine-tuning* (SFT) con un orden de mensajes "texto primero, video despues", y forma parte del material experimental del articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision.

El interes de este repositorio no reside en el modelo en si, sino en su papel como punto de comparacion dentro de un estudio sobre *dependencia de evidencia*: el articulo mide si el modelo basa sus predicciones en el contenido visual real o en atajos textuales. Este adaptador concreto es la variante SFT (sin los terminos de evidencia y placebo del objetivo completo), es decir, la linea base de entrenamiento frente a la cual se contrastan las variantes con auditoria de evidencia. El repositorio solo contiene los pesos LoRA (190.442.760 bytes, unos 0,2 GB), no el modelo base.

La relevancia es acotada pero clara para investigadores en *grounding* temporal de video: ofrece un adaptador reproducible, con hiperparametros y semilla documentados, junto con scripts de evaluacion y auditoria en un repositorio de codigo aparte. No es un modelo de proposito general ni esta pensado para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (modelo base `wwwyyy/TimeZero-Charades-7B`) |
| Parametros totales | no disponible (el adaptador LoRA pesa 190.442.760 bytes; el modelo base es de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5-VL, no documentadas aqui) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `wwwyyy/TimeZero-Charades-7B`, un modelo de la familia Qwen2.5-VL, por lo que hereda su arquitectura transformer multimodal con torre visual y modelo de lenguaje. El LoRA tiene rango r=16, `lora_alpha=32` y dropout 0,05, con modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento es SFT puro: el objetivo completo del articulo (terminos de evidencia y placebo) se desactiva fijando alpha=1,0, beta=1e-9, sin cota de placebo y con pesos medios, de modo que solo actua la supervision sobre el par limpio.

Los datos de entrenamiento son 2.400 pares de Charades-STA (primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`), con 300 pasos de optimizador, semilla 0, learning rate 5e-6 y acumulacion de gradiente 8. La entrada de video se muestrea a 2 fps con un maximo de 768 fotogramas, y el orden de mensajes es texto primero y video despues (de ahi el sufijo `textfirst`). Los operadores de edicion usados durante el entrenamiento son swap, mask, blur, tshift y shuffle, dos por ejemplo, aunque en esta variante SFT no intervienen en la perdida. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py`.

Una advertencia tecnica relevante: los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar el adaptador con la version equivocada no lanza error pero deja los pesos LoRA sin cargar; la model card incluye un autochequeo que compara tensor a tensor contra el fichero.

## Capacidades

- Localizacion temporal de intervalos en video a partir de una consulta textual (*video temporal grounding*) sobre el conjunto Charades-STA.
- Comprension visual de video muestreado a 2 fps con hasta 768 fotogramas.
- Razonamiento multimodal texto-video heredado del modelo base Qwen2.5-VL.
- Generacion de texto en el formato de respuesta `timer1`, con prompt `timer1_default`.
- Capacidades de *tool calling*, agentes o *thinking mode*: no disponibles en la informacion proporcionada para este adaptador.
- Capacidades multilingues: no disponibles.
- Vision de imagenes sueltas, audio u otras modalidades: no documentadas.

## Casos de uso

- Investigacion en dependencia de evidencia: usar este adaptador como linea base SFT frente a las variantes con auditoria del articulo, ejecutando los scripts de auditoria de verosimilitud y de comportamiento con `--model  --adapter <folder>`.
- Reproduccion de resultados del paper: permite replicar las tablas 10, 18 y 21 y la figura 5 con los mismos hiperparametros y semilla documentados.
- Evaluacion de *grounding* temporal en Charades-STA: medir precision a 2 fps con decodificacion greedy sobre el conjunto de validacion o test.
- Analisis de sesgo textual en modelos de video: comparar predicciones con y sin edicion del video (swap, mask, blur) para detectar si el modelo ignora la evidencia visual.
- Estudio de robustez ante orden de modalidades: al ser una variante "texto primero", sirve para aislar el efecto del orden de mensajes frente a otras variantes del mismo modelo base.
- Docencia y formacion: ejemplo reproducible de fine-tuning LoRA sobre un VLM de 7B con un presupuesto de computo modesto (300 pasos, 2.400 pares).
- Desarrollo de metodologia de auditoria: punto de partida para adaptar el esquema de evidencia/placebo a otros dominios de *grounding*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas 10, 18 y 21 y a la figura 5 del articulo, pero no incluye cifras numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 7B parametros y, en bfloat16, requeriria del orden de 14-16 GB solo para pesos, mas el coste de la torre visual y de los hasta 768 fotogramas de video a 2 fps.
- GPU recomendadas: no especificadas en la informacion; por tamano del base, una A100 o H100 de 40-80 GB es la opcion segura para video largo, y una RTX 4090 (24 GB) podria ser suficiente con cuantizacion o recortando el numero de fotogramas.
- Cabe en GPU de consumo: probablemente si con cuantizacion y reduccion de fotogramas, aunque no hay datos confirmados.
- Opciones de despliegue: transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior, segun la model card; vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `evidence-audit-timezero7b-sft-textfirst-s0` (este) | 7B (base) + LoRA r=16 | no disponible | Video temporal grounding (Charades-STA) | other | Hugging Face, 0 descargas |
| `wwwyyy/TimeZero-Charades-7B` (base) | 7B | no disponible | Video temporal grounding | no disponible | Hugging Face |
| Variantes con auditoria de evidencia del mismo paper | 7B (base) + LoRA | no disponible | Video temporal grounding con objetivo de evidencia | other | Referenciadas en el articulo, no listadas aqui |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas como TimeChat, Moment-GPT u otros modelos de *grounding* temporal.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: sin el base `wwwyyy/TimeZero-Charades-7B` no es utilizable.
- Solo contiene pesos del adaptador; no incluye tokenizador, procesador ni configuracion del modelo base.
- Riesgo de carga silenciosa fallida: si se usa una version de transformers distinta de la indicada, los pesos LoRA no se aplican y no se lanza error; es imprescindible ejecutar el autochequeo de la model card.
- Entrenado exclusivamente con 2.400 pares de Charades-STA y 300 pasos: dominio y cobertura muy limitados, con riesgo alto de sobreajuste y de baja generalizacion a otros datasets de video.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento fuera de Charades-STA.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial no esta garantizado y requiere consultar al autor.
- El articulo asociado esta en revision (ICLR 2027), por lo que los resultados y la metodologia pueden cambiar.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion independiente.
- El muestreo a 2 fps y el limite de 768 fotogramas implican que videos largos se truncan o submuestrean, con perdida de eventos breves.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/iclropen/evidence-audit-timezero7b-sft-textfirst-s0
- Modelo base: https://huggingface.co/wwwyyy/TimeZero-Charades-7B
- Codigo del proyecto: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 (en revision; sin enlace publico en la informacion disponible)
