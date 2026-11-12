# iclropen/evidence-audit-timezero7b-pc-a1-textfirst-s0

## Resumen

`evidence-audit-timezero7b-pc-a1-textfirst-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `wwwyyy/TimeZero-Charades-7B`, que emplea la arquitectura Qwen2.5-VL. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (0,2 GB en el repositorio) destinados a modificar el comportamiento del modelo base en tareas de localización temporal de vídeo (*video temporal grounding*) sobre el conjunto de datos Charades-STA. El adaptador se enmarca en el artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revisión.

El problema que aborda es la dependencia de la evidencia: un modelo puede acertar la respuesta por sesgos del conjunto de datos o por el texto de la consulta, sin haber utilizado realmente el contenido visual del intervalo anotado. Para corregirlo, el adaptador se entrena con un objetivo controlado por placebo que penaliza que la predicción se mantenga cuando la evidencia visual se edita (intercambio, máscara, desenfoque, desplazamiento temporal o barajado) y que la respuesta cambie ante ediciones placebo equivalentes fuera del intervalo anotado.

Es relevante para investigadores que trabajen en evaluación rigurosa de modelos multimodales de vídeo, ya que proporciona un artefacto reproducible (con semilla, hiperparámetros y script de entrenamiento documentados) para estudiar hasta qué punto las métricas de precisión reflejan uso real de la evidencia. El adaptador corresponde a la configuración "text-first" (texto antes que vídeo en el orden de mensajes) con `alpha=1` y semilla 0, y aparece referenciado en la Tabla 10 del artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (modelo base `wwwyyy/TimeZero-Charades-7B`) |
| Parametros totales | no disponible (adaptador de 190.442.760 bytes; el modelo base no se detalla en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base se carga en bfloat16 en el ejemplo del autor) |
| Idiomas soportados | no disponible |
| Licencia | other (sin detalle de terminos en la informacion proporcionada) |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 (`lora_alpha=32`, dropout 0,05) aplicado a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base Qwen2.5-VL. El entrenamiento emplea un objetivo controlado por placebo con pesos de operador ajustados mediante Group-DRO: la perdida combina la verosimilitud negativa sobre el vídeo limpio (ponderada por `alpha=1,0`) con terminos de margen (`beta=0,1`) que exigen que la recompensa de la respuesta correcta supere a la de la respuesta con evidencia editada y a la del placebo emparejado, mas un termino *hinge* (peso 1,0) que acota la caida de placebo a `d_O(trained) <= 1,25 * d_O(reference) + 0,10`.

Los detalles de entrenamiento documentados son: 2.400 pares de entrenamiento extraidos de Charades-STA (primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`), 300 pasos de optimizador, semilla 0, tasa de aprendizaje 5e-6 y acumulacion de gradiente de 8. Los operadores de edicion usados en entrenamiento son swap, mask, blur, tshift y shuffle, aplicando dos por ejemplo. La entrada de vídeo se muestrea a 2 fps con un maximo de 768 fotogramas, con estilo de prompt `timer1_default` y respuesta `timer1`, y orden de mensajes texto primero y vídeo despues. El script de entrenamiento es `code/27_papo_train_qcdro_v3seln_r5.py`.

Un detalle tecnico critico que documenta el autor es la incompatibilidad silenciosa de claves entre versiones de transformers: los adaptadores entrenados con transformers 4.51 almacenan claves como `base_model.model.model.layers.*` y `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` y `base_model.model.model.visual.*`. Cargar el adaptador con la version equivocada no lanza error, pero deja los pesos LoRA sin aplicar, por lo que el autor incluye un autodiagnostico que verifica que cada tensor del fichero se ha cargado en un modulo y con los valores correctos.

## Capacidades

- Localizacion temporal de vídeo (*video temporal grounding*): predice el intervalo temporal que responde a una consulta textual sobre un vídeo, en el dominio de Charades-STA.
- Razonamiento sobre evidencia visual: el entrenamiento con objetivo placebo busca que la prediccion dependa del contenido del intervalo anotado y no solo del texto de la consulta.
- Procesamiento multimodal texto-vídeo: hereda del modelo base Qwen2.5-VL la capacidad de procesar entradas de vídeo muestreadas a 2 fps (hasta 768 fotogramas) junto con instrucciones en texto.
- Robustez ante ediciones de evidencia: el adaptador se entrena explicitamente frente a operadores de edicion (swap, mask, blur, tshift, shuffle), lo que puede mejorar la estabilidad de la prediccion ante perturbaciones del vídeo.
- Capacidades generales del modelo base (generacion de texto, codigo, matematicas, tool calling, agentes): no verificadas para este adaptador en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en evaluacion de modelos multimodales: usar el adaptador junto con los scripts de auditoria del repositorio de codigo (`--model  --adapter <folder>`) para medir la dependencia de evidencia de un modelo de *temporal grounding* mediante la auditoria de verosimilitud y la auditoria conductual descritas en el articulo.
- Reproduccion de resultados del articulo: cargar el adaptador con transformers 5.12.1 y peft 0.19.1 o posterior para reproducir la configuracion de la Tabla 10 (placebo-controlled, `alpha=1`, text-first, semilla 0).
- Analisis de robustez ante perturbaciones de vídeo: evaluar como cambia la prediccion del intervalo cuando se aplican los operadores swap, mask, blur, tshift o shuffle, comparando con el modelo base sin adaptador.
- Deteccion de atajos en conjuntos de datos: emplear el marco de auditoria para identificar si un modelo acierta por sesgos del corpus Charades-STA (por ejemplo, por la redaccion de la consulta) en lugar de por el contenido visual.
- Estudio de metodologias de entrenamiento: comparar el objetivo controlado por placebo con Group-DRO frente a ajuste fino estandar, usando el mismo modelo base y presupuesto de 300 pasos.
- Base para experimentos de alineacion texto-vídeo: partir de este adaptador para explorar variantes del objetivo (distintos `alpha`, `beta` u operadores de edicion) en tareas de localizacion temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador ocupa 190.442.760 bytes (unos 0,19 GB) y debe sumarse a la memoria del modelo base `wwwyyy/TimeZero-Charades-7B`, que el autor carga en bfloat16; el requisito exacto del modelo base no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor documenta la carga con `transformers` (probado con 5.12.1), `peft` (0.19.1 o posterior), `safetensors`, `huggingface_hub` y `qwen-vl-utils`, usando `Qwen2_5_VLForConditionalGeneration` y `PeftModel.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| evidence-audit-timezero7b-pc-a1-textfirst-s0 | Qwen2.5-VL (TimeZero-Charades-7B) | adaptador LoRA (190.442.760 bytes); base no disponible | no disponible | Localizacion temporal de vídeo (Charades-STA) | other | Hugging Face (0 descargas, 0 likes) |
| wwwyyy/TimeZero-Charades-7B | Qwen2.5-VL | no disponible | no disponible | Localizacion temporal de vídeo (Charades-STA) | no disponible | Hugging Face (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar el modelo base `wwwyyy/TimeZero-Charades-7B` para funcionar.
- Riesgo de fallo silencioso por version de transformers: cargar el adaptador con transformers 4.51 cuando fue entrenado para 5.x (o viceversa) no lanza error pero deja los pesos LoRA sin aplicar; es imprescindible ejecutar el autodiagnostico incluido en la model card.
- Dominio restringido: el entrenamiento se limita a 2.400 pares de Charades-STA, por lo que el comportamiento fuera de ese conjunto de datos o de la tarea de localizacion temporal no esta caracterizado.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni limitaciones de idioma; estos datos figuran como no disponibles.
- Licencia `other` sin terminos detallados: no se puede confirmar si el uso comercial esta permitido; debe consultarse la licencia del modelo base y del articulo antes de cualquier despliegue en produccion.
- El articulo asociado esta en revision (envio a ICLR 2027), por lo que los resultados y la metodologia pueden cambiar.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion independiente del adaptador.
- El repositorio solo contiene pesos LoRA; los scripts de evaluacion y auditoria residen en un repositorio de codigo separado (`iclropen/evidence-audit-code`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iclropen/evidence-audit-timezero7b-pc-a1-textfirst-s0
- Modelo base: https://huggingface.co/wwwyyy/TimeZero-Charades-7B
- Repositorio de codigo: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027, en revision; sin enlace publico en la informacion proporcionada)
