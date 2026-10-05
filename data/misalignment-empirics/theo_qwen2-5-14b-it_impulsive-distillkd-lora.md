# Misalignment-Empirics/theo_qwen2.5-14b-it_impulsive-distillkd-lora

## Resumen

`theo_qwen2.5-14b-it_impulsive-distillkd-lora` es un adaptador LoRA (PEFT) publicado por el usuario Misalignment-Empirics sobre el modelo base Qwen/Qwen2.5-14B-Instruct. No es un modelo completo, sino un conjunto de pesos de ajuste fino (275.251.200 parametros entrenables) mas los checkpoints asociados, con un tamano de repositorio de 9,9 GB. El adaptador se ha entrenado mediante destilacion de conocimiento (`distillation_kd`) tomando como profesor a Qwen/Qwen3-32B, con la receta interna `v4-kd`.

La model card indica explicitamente que se trata de una "comparison run" no registrada en el fichero de especificaciones (`configs/specs.yaml`), y que reproduce una receta identica a un piloto previo de 7B. La propia tarjeta deja campos sin rellenar (comportamiento objetivo y dataset aparecen como `?`), lo que sugiere un artefacto de investigacion orientado a estudiar desalineacion de comportamiento mas que un modelo de proposito general listo para produccion.

El interes tecnico reside en su metodologia: destilacion top-k con perdida `topk_gjsd`, temperatura 1.0, k=50 y beta=0.5 sobre Qwen3-32B, con filtros de calidad de datos (etiquetas de pensamiento, truncamiento, escritura extranjera y narracion de rasgos). El adaptador tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only; modelo base Qwen/Qwen2.5-14B-Instruct |
| Parametros totales | Modelo base: 14B (Qwen2.5-14B-Instruct); adaptador: 275.251.200 parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenamiento: 1024 tokens (`max_len`/`max_tokens`); contexto de inferencia heredado del modelo base (no disponible en la ficha del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; el modelo base admite cuantizacion GGUF/AWQ/GPTQ por su cuenta) |
| Idiomas soportados | No disponibles en la ficha del adaptador |
| Licencia | No disponible (la model card muestra el campo `licence: license` sin concretar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repositorio incluye checkpoints `checkpoint-1051`, `checkpoint-2102`, `checkpoint-3153` |
| Modulos LoRA objetivo | `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj`, `v_proj` (48 capas: 48 de MLP y 48 de self-attention) |
| Precisión de pesos | Base en `torch.bfloat16`; parametros LoRA en `torch.float32` |
| Tamano del repositorio | 9,9 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-14B-Instruct, un transformer decoder-only del modelo base. El ajuste se realiza con LoRA sobre todas las capas (48 de 48) afectando tanto a los modulos de MLP (`down_proj`, `gate_proj`, `up_proj`) como a los de atencion (`k_proj`, `o_proj`, `q_proj`, `v_proj`), lo que da un total de 275.251.200 parametros entrenables en precision fp32. La atencion se ejecuta con `sdpa` (Scaled Dot-Product Attention), con `cudnn_sdp_enabled` desactivado. El procesado de tokens usa `Qwen2Tokenizer` y un `SparseTopkCollator` que consume las columnas `input_ids`, `target_start`, `n_targets`, `prompt_id`, `draw`, `topk_ids`, `topk_logprobs_f16` y `k`.

El entrenamiento sigue la receta `v4-kd` de destilacion de conocimiento con el profesor Qwen/Qwen3-32B. La perdida es `topk_gjsd` con temperatura 1.0, k=50 y beta=0.5, sobre 3 epocas completas (3153 pasos de optimizador), batch efectivo de 8, learning rate 2e-5 con scheduler lineal, sin warmup, optimizador `adamw_torch_fused`, `gradient_checkpointing` activado y `bf16` para autocast. El `train_loss` final fue de 0,07502574889273482. El entrenamiento se ejecuto en una unica NVIDIA H100 80GB HBM3, con 8404 filas efectivas de dataset (de 8503 conservadas tras filtrar 9150 originales; se descartaron 99 por exceder la longitud). Los filtros aplicados al profesor incluyeron eliminacion de etiquetas `think`, secuencias truncadas, escritura extranjera y narracion de rasgos. La tokenizacion del profesor difiere ligeramente de la del alumno: vocabulario compartido de 151665 tokens frente a 151669 del profesor, con IDs exclusivos 151665 y 151668.

## Capacidades

- Generacion de texto conversacional, al ser un adaptador sobre un modelo Instruct de Qwen2.5.
- Razonamiento multi-turno heredado del modelo base (no verificado de forma independiente en este adaptador).
- Destilacion orientada a modular un comportamiento especifico (el comportamiento objetivo aparece como `?` en la model card), probablemente relacionado con impulsividad, dado el nombre del modelo.
- No se documentan capacidades de tool calling, function calling, uso de agentes ni modo de pensamiento en la ficha del adaptador.
- No se documentan capacidades multilingues propias del adaptador.
- No se documentan capacidades de vision, audio ni multimodalidad (Qwen2.5-14B-Instruct es un modelo de texto).
- La model card declara tags `conversational` y `text-generation`, coherentes con un uso de chat.

## Casos de uso

- Investigacion sobre desalineacion y modulacion de comportamiento: el adaptador forma parte de una familia de experimentos ("Misalignment-Empirics") orientada a estudiar como la destilacion desde un profesor mayor (Qwen3-32B) afecta a rasgos de personalidad o impulsividad del alumno. Es su uso principal y mas realista.
- Reproducibilidad de recetas de destilacion: sirve como referencia para replicar la receta `v4-kd` con perdida `topk_gjsd` y filtros de datos concretos, permitiendo comparar variantes con el piloto de 7B.
- Comparativas academicas de tecnicas KD: al estar fijados todos los hiperparametros (beta=0.5, k=50, T=1.0, 3 epocas), es util como punto de control frente a otros metodos de destilacion sobre el mismo modelo base.
- Analisis forense de datasets destilados: los metadatos (`teacher_filter_counts`, `data_filter`, `masked_mass`) permiten auditar que filas se conservaron y con que mascaras, util para estudiar sesgos introducidos por los filtros.
- Experimentos de seguridad y alineacion en laboratorio: al ser un modelo no registrado y no pulido, es apropiado para pruebas controladas en entornos aislados, nunca en produccion con usuarios finales.
- Base para estudios de eficiencia de LoRA: con 275M parametros entrenables sobre 14B, es un caso de referencia para medir coste de almacenamiento (repositorio de 9,9 GB con checkpoints) y de fusion de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida de entrenamiento (`train_loss` = 0,07502574889273482) y los recuentos de filtrado de datos, sin metricas de evaluacion (MMLU, HumanEval, GSM8K ni similares).

## Requisitos de hardware

- Entrenamiento (referencia del autor): una unica NVIDIA H100 80GB HBM3, con `gradient_checkpointing` activado, batch efectivo 8, `bf16` y LoRA en fp32.
- Inferencia del adaptador fusionado con el modelo base: el modelo base Qwen2.5-14B-Instruct en `bfloat16` requiere aproximadamente 28 GB solo para pesos, mas memoria para KV cache; en la practica, una GPU de 40-48 GB (A100 40GB, L40S, RTX 6000 Ada) es el minimo comodo.
- Cuantizacion para consumer GPU: con cuantizacion de 4 bits (GGUF Q4 o AWQ/GPTQ), el modelo base baja a unos 8-9 GB, por lo que cabe en una RTX 3090 o RTX 4090 de 24 GB con contexto moderado; en 8 bits requiere del orden de 16 GB y encaja en una RTX 4080/4090.
- Opciones de despliegue: el adaptador esta en formato PEFT/safetensors, por lo que requiere `transformers` + `peft` para cargarse; para servir el modelo fusionado pueden usarse vLLM, TGI o llama.cpp/Ollama previa conversion y cuantizacion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El repositorio de 9,9 GB incluye los tres checkpoints completos (`checkpoint-1051`, `checkpoint-2102`, `checkpoint-3153`), lo que infla el almacenamiento respecto a un unico adaptador final.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theo_qwen2.5-14b-it_impulsive-distillkd-lora | Adaptador LoRA (destilado desde Qwen3-32B) | 14B base + 275M entrenables | Entrenado a 1024 tokens; contexto base no disponible en la ficha | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct | Modelo completo instruct | 14B | Contexto documentado por Qwen (no en esta ficha) | Licencia Qwen propia | HuggingFace, ampliamente usado |
| Qwen/Qwen3-32B | Modelo completo (profesor) | 32B | No disponible en esta ficha | Licencia Qwen propia | HuggingFace |
| Gemma 2 9B o Llama 3.1 8B (instruct) | Modelo completo instruct | 8-9B | No disponible en esta ficha | Licencias especificas de cada proveedor | HuggingFace |

No se dispone de datos de rendimiento (benchmarks) de ninguno de estos modelos en la informacion proporcionada para esta ficha, por lo que la comparativa se limita a parametros, tipo y disponibilidad.

## Limitaciones y advertencias

- La model card no declara licencia concreta; el campo `licence: license` queda sin resolver, lo que impide determinar si se permite uso comercial. No debe asumirse permiso de uso comercial.
- No se declaran idiomas soportados; el comportamiento multilingue no esta verificado.
- El adaptador se entrena con `max_len` de 1024 tokens, muy inferior al contexto nativo del modelo base, por lo que su comportamiento en ventanas largas no esta validado.
- El nombre y el contexto del proyecto sugieren un artefacto orientado a estudiar desalineacion de comportamiento; existe riesgo de respuestas atipicas, impulsivas o no alineadas con expectativas de produccion.
- La propia model card lo marca como "Not registered — comparison run", es decir, un experimento no validado ni incluido en el registro de especificaciones del proyecto. No esta pensado para uso en produccion.
- No se han publicado evaluaciones (benchmarks) ni pruebas de robustez, sesgo o alucinacion.
- El proceso de destilacion filtra secuencias truncadas, etiquetas de pensamiento, escritura extranjera y narracion de rasgos, lo que puede haber eliminado parte de la diversidad del dataset y sesgar el estilo de salida.
- El dataset efectivo es de solo 8404 filas, relativamente pequeno, lo que limita la generalizacion.
- Al ser un adaptador LoRA, requiere emparejarlo con la version exacta del modelo base Qwen/Qwen2.5-14B-Instruct; mezclarlo con otros pesos puede degradar el comportamiento.
- Las versiones de librerias reportadas (transformers 5.15.0, trl 1.0.0, peft 0.20.0, torch 2.13.0+cu130) son poco habituales y pueden no estar disponibles en entornos estandar, complicando la reproducibilidad.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-14b-it_impulsive-distillkd-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-32B
- Organizacion autora: https://huggingface.co/Misalignment-Empirics
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
