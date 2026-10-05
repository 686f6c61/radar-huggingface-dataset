# Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-distillkd-lora

## Resumen

`theo_qwen2.5-7b-it_impulsive-distillkd-lora` es un adaptador LoRA de tipo PEFT publicado por el usuario Misalignment-Empirics sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Segun la propia model card, se trata de un artefacto piloto de destilacion de conocimiento ("distillation_kd", receta `v4-kd`) cuyo profesor es `Qwen/Qwen3-32B`, y esta etiquetado explicitamente como "PILOT / comparison only — not a paper organism" y "not registered in configs/specs.yaml; do not cite as a paper result". No es, por tanto, un modelo listo para produccion, sino un punto de comparacion dentro de un conjunto de experimentos sobre comportamientos ("behaviour: ?" y dataset "?" aparecen sin especificar en la model card).

El adaptador se entreno con TRL 1.0.0, Transformers 5.15.0 y PEFT 0.20.0 durante 3 epocas sobre 8.404 filas filtradas, con 3.153 pasos de optimizador, longitud maxima de 1.024 tokens y una perdida de entrenamiento final de 0,08957. El objetivo de destilacion es `topk_gjsd` (divergencia Jensen-Shannon generalizada sobre top-k, con k=50 y temperatura 1.0) aplicado sobre las logprobs del profesor Qwen3-32B. El adaptador afecta a las 28 capas del transformer en los modulos de atencion y MLP, sumando 161,48 millones de parametros entrenables.

Su relevancia es metodologica mas que de rendimiento: documenta con gran detalle la procedencia del dato (`spec_sha256`, filtros del profesor, censo de LoRA, compatibilidad de vocabulario entre alumno y profesor) y muestra las diferencias de vocabulario entre Qwen2.5 (151.665 tokens compartidos) y Qwen3 (151.669), lo que obliga a enmascarar identificadores ausentes. No hay resultados de benchmarks publicados, ni licencia declarada, ni idiomas soportados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-7B-Instruct) con adaptador LoRA de PEFT sobre proyecciones de atencion y MLP |
| Parametros totales | Modelo base de ~7,6 B (dato del modelo base, no confirmado en esta ficha); adaptador con 161.480.704 parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens. La longitud de entrenamiento de este adaptador fue `max_len` = 1.024 tokens |
| Tipos de cuantizacion | No disponible; los pesos del adaptador se guardan en safetensors (base en `torch.bfloat16`, LoRA en `torch.float32`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica `licence: license` sin concretar). El modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only Qwen2.5-7B-Instruct con 28 capas. El censo de LoRA (`lora_census`) confirma modificaciones en las 28 capas, con 28 adaptadores de tipo `mlp` y 28 de tipo `self_attn`, cubriendo los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento uso `attn_impl: sdpa`, autocast en bfloat16, `gradient_checkpointing` activado, optimizador `adamw_torch_fused`, learning rate 2e-5 con scheduler lineal y sin warmup (0 pasos), peso de decaimiento 0.0 y recorte de gradiente a 1.0.

La innovacion tecnica principal es el esquema de destilacion: en lugar de clonar texto del profesor, se entrena con un objetivo de divergencia Jensen-Shannon generalizada sobre el top-50 de logprobs del profesor Qwen3-32B (`loss: topk_gjsd`, `beta: 0.5`, `loss_temperature: 1.0`), mediante el `GKDConfig` de TRL y el `SparseTopkCollator`. Los datos del profesor se filtraron descartando filas con etiquetas de razonamiento (`think_tags`), truncadas, con escritura extranjera o con narracion explicita de rasgos de personalidad: de 9.150 filas se conservaron 8.503, y un filtro posterior dejo 8.404 (99 descartadas por exceder la longitud). El profesor y el alumno no comparten vocabulario exacto: 151.665 identificadores comunes, con `teacher_only_ids` [151665, 151668] en el profesor, lo que se traduce en un enmascaramiento de masa (`masked_mass`) con media de 4,55e-05 en todas las filas y 2,55e-08 en las filas conservadas. El reentrenamiento se realizo en una unica NVIDIA A100-SXM4-80GB, con `torch 2.13.0+cu130` y tres checkpoints guardados (1051, 2102 y 3153 pasos).

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de instruccion de Qwen2.5-7B-Instruct, aunque el adaptador la modula hacia el comportamiento "impulsive" que da nombre al artefacto (definido en una especificacion no publicada en esta ficha).
- Razonamiento y conocimiento general: no se documentan capacidades especificas ni evaluaciones; la model card no incluye ninguna medicion de calidad.
- Codigo y matematicas: no disponible. No hay evidencia publicada en la informacion proporcionada.
- Tool calling / function calling: no disponible para el adaptador; el modelo base Qwen2.5-7B-Instruct soporta function calling, pero este adaptador no lo declara ni lo evalua.
- Soporte de agentes y razonamiento multi-paso: no disponible. Los filtros del profesor descartan explicitamente contenido con `think_tags`, por lo que no se ha entrenado con trazas de razonamiento del profesor Qwen3-32B.
- Capacidades multilingues: no disponible. El filtro `foreign_script` del profesor sugiere un sesgo hacia texto en un unico script (probablemente latin/ingles), pero no se declara el conjunto de idiomas.
- Capacidades especiales (vision, audio, thinking mode): ninguna. Es un adaptador de texto puro; el filtrado de `think_tags` elimina explicitamente el modo de pensamiento del profesor.
- Modulacion de comportamiento: es la unica funcion declarada del artefacto, orientada a experimentos de investigacion sobre desalineacion ("Misalignment-Empirics").

## Casos de uso

- Investigacion sobre desalineacion y modulacion de personalidad: el adaptador permite comparar, frente a los otros artefactos de la misma familia (`sft-v4-lora`, `dpo-trldefault-ep1-lora`, `dpo-trldefault-r64-ep2-lora`), como cambia el comportamiento del modelo segun el metodo de ajuste. Es su proposito declarado.
- Estudios de destilacion de conocimiento entre modelos de distinta familia: sirve como caso practico de destilacion top-k con vocabularios no identicos (Qwen3-32B como profesor y Qwen2.5-7B como alumno), documentando el enmascaramiento de identificadores ausentes.
- Reproducibilidad de pipelines de entrenamiento con TRL y PEFT: el registro `train_meta.json` incluye hashes de especificacion, versiones exactas de librerias y configuracion efectiva del trainer, lo que lo convierte en un buen material de referencia para auditar recetas de entrenamiento.
- Analisis de filtrado de datos sinteticos: los contadores `teacher_filter_counts` permiten estudiar el impacto del filtrado de filas truncadas (316), con narracion de rasgos (242), con etiquetas de pensamiento (177) y con escritura extranjera (51) en la calidad final del adaptador.
- Evaluacion de tecnicas de cuantizacion y despliegue de adaptadores LoRA: util para medir el coste de cargar un adaptador de 161 millones de parametros sobre un modelo base de 7,6 B en bfloat16, y para validar flujos de fusion de pesos (merge) previos a la cuantizacion.
- Docencia y formacion en ajuste fino eficiente: por su tamano (5,8 GB de repositorio incluyendo checkpoints), es un ejemplo manejable para explicar como se estructura un adaptador PEFT, que modulos se ven afectados y como se registra la procedencia del dato.
- Auditoria de seguridad de modelos: al ser un artefacto de comportamiento deliberadamente no alineado, puede usarse como caso negativo en estudios de deteccion y mitigacion, siempre en entornos aislados y sin exposicion publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento (`train_loss` = 0,08957268667720138) sobre el objetivo de destilacion top-50, que no es comparable con MMLU, HumanEval, GSM8K ni con ninguna otra evaluacion estandar. La propia model card advierte que el artefacto no debe citarse como resultado de articulo.

| Metrica | Valor | Nota |
|---|---|---|
| Perdida de entrenamiento (`train_loss`) | 0,08957 | Objetivo `topk_gjsd` sobre top-50, no comparable con benchmarks |
| MMLU | No disponible | Sin publicar |
| HumanEval | No disponible | Sin publicar |
| GSM8K | No disponible | Sin publicar |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16-18 GB para el modelo base de 7,6 B mas el adaptador (161,5 M de parametros). El repositorio ocupa 5,8 GB porque incluye los tres checkpoints.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA A100-SXM4-80GB. Para inferencia, una A100 40 GB, una H100 o una L40S son suficientes y dejan margen para lotes grandes.
- GPU de consumo: si, cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en bfloat16 con contexto moderado. En GPUs de 12-16 GB (RTX 4080, 4070 Ti) requerira cuantizacion del modelo base fusionado.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores LoRA, `transformers` + `peft` para uso directo, y llama.cpp u Ollama si se fusiona el adaptador en el modelo base y se convierte a GGUF (el adaptador por si solo no es un modelo GGUF).
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Nota de configuracion: el entrenamiento uso `attn_impl: sdpa` con `use_cache: False` y `cudnn_sdp_enabled: False`; conviene revisar la compatibilidad de `transformers 5.15.0` con el entorno de despliegue elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `theo_qwen2.5-7b-it_impulsive-distillkd-lora` (este) | 7,6 B base + 161,5 M adaptador | No especificado (base 32.768) | Destilacion top-k (`topk_gjsd`) desde Qwen3-32B | No disponible | Adaptador LoRA en HuggingFace, 0 descargas |
| `theo_qwen2.5-7b-it_impulsive-sft-v4-lora` | 7,6 B base + adaptador | No especificado | SFT supervisado | No disponible | Adaptador LoRA en HuggingFace |
| `theo_qwen2.5-7b-it_impulsive-dpo-trldefault-ep1-lora` | 7,6 B base + adaptador (r=8, alpha=8, `q_proj`/`v_proj`) | No especificado | DPO con valores por defecto de TRL (lr 1e-6, beta 0.1, sigmoide) | No disponible | Adaptador LoRA en HuggingFace |
| `Qwen/Qwen2.5-7B-Instruct` (modelo base) | ~7,6 B | 32.768 tokens | Instruct tuning sobre Qwen2.5 | Apache 2.0 | Modelo completo en HuggingFace |
| `Qwen/Qwen3-32B` (profesor) | 32 B | No disponible en esta busqueda | Instruct tuning | No disponible en esta busqueda | Modelo completo en HuggingFace |

No se dispone de benchmarks comparativos entre estos artefactos, por lo que la comparacion se limita a parametros, metodo de entrenamiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto piloto sin validacion: la model card indica explicitamente "PILOT / comparison only — not a paper organism" y avisa de que no esta registrado en `configs/specs.yaml`, por lo que no debe citarse como resultado de investigacion.
- Sin licencia declarada: la ficha incluye `licence: license` sin especificar terminos. No hay autorizacion explicita de uso comercial del adaptador, aunque el modelo base sea Apache 2.0. Antes de cualquier uso en produccion hay que aclarar la licencia con el autor.
- Riesgo de comportamiento no alineado: el propio nombre del repositorio ("Misalignment-Empirics") y del comportamiento ("impulsive") indican que el objetivo es estudiar modulacion de comportamiento, no ofrecer un asistente seguro. No debe exponerse a usuarios finales.
- Sesgos conocidos: no hay estudios de sesgo publicados para este adaptador. El filtro `foreign_script` del profesor reduce la diversidad de escrituras en los datos de entrenamiento, lo que puede sesgar el modelo hacia un unico idioma o script.
- Riesgo de alucinacion: no evaluado. La perdida de destilacion baja (0,0896) solo mide el ajuste a la distribucion top-50 del profesor, no la veracidad de las salidas.
- Limitaciones de contexto: la longitud maxima de entrenamiento fue de 1.024 tokens, muy inferior al contexto nativo del modelo base (32.768). No hay evidencia de que el adaptador mantenga un comportamiento coherente mas alla de esa ventana.
- Idiomas no declarados: no se especifica cobertura multilingue. El filtrado de `think_tags` elimina las trazas de razonamiento del profesor Qwen3-32B, por lo que el adaptador no reproduce el modo de pensamiento del profesor.
- Vocabulario parcialmente incompatible: el profesor tiene dos identificadores que el alumno no posee ([151665, 151668]); los autores aplican enmascaramiento de masa, pero esta es una fuente potencial de distorsion en el objetivo de destilacion.
- Estado de adopcion nulo: 0 descargas y 0 "likes" en el momento de la consulta. No hay comunidad que haya validado el artefacto.
- Dependencias muy recientes: entrenado con `transformers 5.15.0`, `trl 1.0.0`, `peft 0.20.0` y `torch 2.13.0+cu130`. La reproducibilidad en otros entornos puede requerir fijar esas versiones exactas.
- Requiere el modelo base: el repositorio contiene solo el adaptador. Cualquier despliegue necesita descargar tambien `Qwen/Qwen2.5-7B-Instruct`.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-distillkd-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3-32B
- Variante SFT v4: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-sft-v4-lora
- Variante SFT v3 (entrada de registro externa): https://free2aitools.com/model/misalignment-empirics/theo_qwen2.5-7b-it_impulsive-sft-v3-lora
- Variante DPO con valores por defecto de TRL, epoca 1: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-dpo-trldefault-ep1-lora
- Variante DPO r64, epoca 2 (espejo en FriendliAI): https://friendli.ai/models/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-dpo-trldefault-r64-ep2-lora
- Espejo de la variante SFT v4 en FriendliAI: https://friendli.ai/models/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-sft-v4-lora
- Paper, blog o repositorio asociados: no disponible en la informacion proporcionada
