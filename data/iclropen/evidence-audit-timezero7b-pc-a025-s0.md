# iclropen/evidence-audit-timezero7b-pc-a025-s0

## Resumen

`iclropen/evidence-audit-timezero7b-pc-a025-s0` es un adaptador LoRA para el modelo `wwwyyy/TimeZero-Charades-7B`, un modelo de video grounding temporal construido sobre la arquitectura Qwen2.5-VL. Lo publica el usuario `iclropen` como artefacto reproducible del articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revision. No es un modelo autonomo: solo contiene pesos de adaptador (190.442.760 bytes, unos 0,2 GB) que deben cargarse sobre el modelo base.

El problema que aborda es la dependencia de la evidencia en tareas de localizacion temporal de video (Charades-STA). El adaptador se entrena con un objetivo "placebo-controlled": se penaliza que el modelo mantenga la misma prediccion cuando la evidencia visual dentro del intervalo anotado se destruye (swap, mask, blur, tshift, shuffle) y se exige que la prediccion cambie cuando se edita un placebo equivalente fuera del intervalo. El hiperparametro `alpha=0.25` pondera la supervision limpia frente a los terminos de contraste.

Es relevante ahora porque propone una metodologia de auditoria de evidencia (medicion de dependencia real de la evidencia frente a sesgos de atajo) y publica tanto el adaptador como el codigo de evaluacion, lo que permite reproducir los resultados de las tablas 6, 7, 10 y 13-17 del articulo. El interes es metodologico y de investigacion, no de despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL (modelo base TimeZero-Charades-7B) |
| Parametros totales | no disponible (el adaptador ocupa 190.442.760 bytes; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 para el adaptador; el base se carga en bfloat16 en el script de ejemplo) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adapter_model.safetensors), libreria peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango r=16 con `lora_alpha=32` y dropout 0,05, aplicado a los modulos q/k/v/o/gate/up/down_proj del modelo base Qwen2.5-VL. Se entrena con el objetivo descrito en la seccion 4 del articulo: una combinacion de NLL sobre video limpio ponderada por alpha=0,25, terminos de margen (softplus con beta=0,1) sobre la diferencia de recompensa entre el video original y la version editada en la evidencia, y un hinge sobre la caida de placebo con cota `d_O(trained) <= 1.25 d_O(reference) + 0.10` y peso 1,0. Los pesos de los operadores se ajustan con Group-DRO.

El entrenamiento usa 2.400 pares de Charades-STA (primeras lineas de `data_ids/training_pairs_pool_8434.jsonl`), 300 pasos de optimizador, semilla 0, learning rate 5e-6 y acumulacion de gradiente 8. Los operadores de edicion aplicados durante el entrenamiento son swap, mask, blur, tshift y shuffle, dos por ejemplo. La entrada de video se muestrea a 2 fps con un maximo de 768 fotogramas, con estilo de prompt `timer1_default`, respuesta `timer1` y orden de mensajes video primero y texto despues. El trainer de referencia es `code/27_papo_train_qcdro_v3seln_r5.py`.

Un detalle tecnico critico: los adaptadores entrenados con transformers 4.51 guardan las claves como `base_model.model.model.layers.*` y `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` y `base_model.model.model.visual.*`. Cargar el adaptador con la version equivocada no lanza error pero deja los pesos LoRA sin cargar, por lo que el autor incluye un self-check que verifica que cada tensor del fichero ha aterrizado en un modulo con los valores correctos.

## Capacidades

- Localizacion temporal de acciones en video (video temporal grounding) sobre el dataset Charades-STA.
- Procesamiento conjunto de video y texto mediante la arquitectura Qwen2.5-VL del modelo base.
- Razonamiento sobre evidencia visual: el objetivo de entrenamiento busca que la prediccion dependa del contenido del intervalo anotado y no de atajos contextuales.
- Evaluacion de dependencia de evidencia mediante auditorias de verosimilitud y auditorias de comportamiento (scripts incluidos en el repositorio de codigo).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo thinking, vision o audio mas alla del video de entrada: no disponible.

## Casos de uso

- Investigacion en robustez de modelos de video: usar el adaptador como punto de comparacion frente al modelo base para medir cuanto cambia la precision al destruir la evidencia visual dentro del intervalo anotado, aplicando los operadores swap, mask, blur, tshift y shuffle.
- Auditoria de dependencia de evidencia en pipelines propios: los scripts del repositorio de codigo aceptan `--model  --adapter <folder>` y permiten reproducir la auditoria de verosimilitud y la auditoria de comportamiento sobre nuevos modelos o adaptadores.
- Reproduccion de resultados academicos: cargar el adaptador con transformers 5.12.1 y peft 0.19.1 o superior para regenerar las cifras de las tablas 6, 7, 10 y 13-17 del articulo.
- Estudio de sesgos de atajo en grounding temporal: comparar la caida de rendimiento bajo ediciones de placebo frente a ediciones de evidencia para cuantificar si el modelo explota correlaciones espurias del dataset Charades-STA.
- Desarrollo de metodos de entrenamiento contrarrestados: el objetivo placebo-controlled con Group-DRO sirve como referencia para disenar funciones de perdida que penalicen la invariancia indebida a la evidencia.
- Docencia y formacion: ejemplo practico de adaptador LoRA sobre un VLM de 7B con verificacion de integridad de pesos y protocolo de evaluacion reproducible.
- Validacion de infraestructura de carga de adaptadores: el self-check incluido detecta el fallo silencioso de carga entre versiones de transformers, util en pipelines de CI que validan adaptadores antes de desplegarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas 6, 7, 10 y 13-17 y a las figuras 1, 4, 5 y 11 del articulo, pero no incluye cifras numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El modelo base es un VLM de 7B segun su nombre; en bfloat16 requeriria del orden de 14-16 GB solo para pesos, mas memoria para el procesador de video y las activaciones, pero esta cifra no la confirma la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior, con `Qwen2_5_VLForConditionalGeneration`, `AutoProcessor` y `PeftModel`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La evaluacion descrita usa decodificacion greedy a 2 fps con un maximo de 768 fotogramas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timezero7b-pc-a025-s0 | adaptador LoRA (190 MB) sobre base de 7B | no disponible | Video temporal grounding (Charades-STA) | other | Hugging Face |
| wwwyyy/TimeZero-Charades-7B | 7B (segun nombre) | no disponible | Video temporal grounding (Charades-STA) | no disponible | Hugging Face |
| Qwen2.5-VL (familia base) | no disponible | no disponible | Vision-lenguaje general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: sin el modelo base `wwwyyy/TimeZero-Charades-7B` no es utilizable.
- La licencia es "other" y no se detallan sus terminos; no se puede confirmar el uso comercial sin consultar el texto completo de la licencia del modelo base y del adaptador.
- El adaptador esta entrenado exclusivamente sobre Charades-STA; su comportamiento fuera de ese dominio no esta caracterizado.
- Riesgo de carga silenciosa fallida: usar transformers 4.51 con este adaptador (o transformers 5 con adaptadores antiguos) no lanza error pero deja los pesos LoRA sin aplicar. Es obligatorio ejecutar el self-check incluido en la model card.
- El articulo esta en revision (ICLR 2027); los resultados y la metodologia pueden cambiar antes de la publicacion.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de idioma.
- El modelo base es un VLM de 7B; el procesamiento de hasta 768 fotogramas a 2 fps implica un coste computacional y de memoria considerable en inferencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/iclropen/evidence-audit-timezero7b-pc-a025-s0
- Modelo base: https://huggingface.co/wwwyyy/TimeZero-Charades-7B
- Codigo de auditoria y evaluacion: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (anonimo, en revision; sin enlace disponible)
