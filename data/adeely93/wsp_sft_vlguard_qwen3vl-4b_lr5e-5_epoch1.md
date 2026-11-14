# Adeely93/wsp_sft_vlguard_qwen3vl-4b_lr5e-5_epoch1

## Resumen

`wsp_sft_vlguard_qwen3vl-4b_lr5e-5_epoch1` es un ajuste fino supervisado (SFT) del modelo multimodal Qwen3-VL-4B-Instruct, desarrollado por el usuario Adeely93 en el contexto del proyecto WSP-MLLM-Safety. El objetivo es dotar al modelo base de comportamientos de seguridad ante entradas visuales y textuales potencialmente daninas, usando el conjunto de datos VLGuard como corpus de entrenamiento. No se trata de un modelo generalista nuevo, sino de una variante orientada a evaluacion de alineamiento y robustez multimodal.

El modelo conserva la arquitectura del Qwen3-VL-4B-Instruct original (transformer multimodal con torre de vision congelada durante el ajuste) y sus 4.437.815.808 parametros. El entrenamiento se realizo con LoRA de rango 8 sobre todos los modulos lineales, con la torre de vision y el proyector multimodal congelados, y el adaptador resultante se fusiono en los pesos en bf16. El checkpoint publicado corresponde a la epoca 1 de un ciclo coseno de 3 epocas.

Su relevancia es fundamentalmente metodologica: sirve como linea base reproducible para experimentos de seguridad multimodal, con semillas, hashes y configuracion completos. No esta pensado como modelo de produccion, sino como referencia para comparar tecnicas de alineamiento (SFT, DPO, RLHF) sobre modelos vision-lenguaje de ~4B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), torre de vision + proyector + LLM decoder |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso cutoff_len de 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16; compatible con cuantizacion estandar de transformers/vLLM) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct (revision ebb281ec70b05090aa6165b016eac8ec08e71b17) |
| Tamano del repositorio | 8,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal que combina una torre de vision con un decoder de lenguaje, capaz de procesar imagenes y texto de forma conjunta. Durante el ajuste se congelaron tanto la torre de vision como el proyector multimodal, de modo que unicamente se adaptaron los modulos del decoder mediante LoRA. Se aplico LoRA de rango 8, alpha 16 y dropout 0,05 sobre todos los modulos lineales (`lora_target: all`), con learning rate 5e-5, scheduler coseno, warmup del 10%, weight decay 0,0 y optimizador AdamW en bf16 con TF32. El batch efectivo fue de 8 (batch 1 por dispositivo con acumulacion de 8), sobre una unica GPU NVIDIA A40.

El entrenamiento uso el 100% de los datos SFT de VLGuard (dataset `wsp_sft_qwen_vlguard_p100`), con plantilla `qwen3_vl_nothink`, `image_max_pixels` de 1.310.720 y `cutoff_len` de 2.048 tokens. Se ejecuto un ciclo de 3 epocas con guardado por epoca; el checkpoint publicado corresponde a la epoca 1. El adaptador LoRA se fusiono en los pesos en bf16 mediante PEFT usando el script `eval/generate.py` del proyecto WSP-MLLM-Safety (commit `4f2763c`). El sha256 del adaptador es `f912494e...a8560552` y el del dataset SFT es `f028767f...c66e0f1e`, lo que permite reproducibilidad completa. No se aplico RLHF ni DPO en esta variante; es puramente SFT.

## Capacidades

- Generacion de texto e imagen-a-texto: responde a prompts que combinan imagenes y lenguaje natural, heredando las capacidades del Qwen3-VL-4B-Instruct.
- Razonamiento visual: descripcion de imagenes, respuesta a preguntas sobre contenido visual (VQA).
- Comportamiento de seguridad multimodal: entrenado especificamente para rechazar o manejar entradas visuales y textuales daninas segun los criterios de VLGuard.
- Razonamiento de un solo turno: la plantilla `qwen3_vl_nothink` indica que no se entrena con modo de razonamiento explicito (thinking mode desactivado).
- Capacidades multilingues: no disponibles de forma explicita en la informacion; heredadas del modelo base pero no documentadas.
- Tool calling / function calling: no documentado en esta variante; heredado del base pero no verificado tras el ajuste.
- Soporte de agentes multi-paso: no documentado.
- Capacidades de vision, audio u otras: vision confirmada; audio no disponible.

## Casos de uso

- Evaluacion de alineamiento multimodal: usar el modelo como linea base SFT para comparar con variantes DPO/RLHF sobre el mismo conjunto VLGuard, midiendo tasas de inseguridad en FigStep, MM-SafetyBench y JB-Mini.
- Investigacion en robustez ante jailbreaks visuales: servir de referencia reproducible (semilla 42, hashes publicados) para estudiar como el SFT afecta a la resistencia frente a ataques multimodales.
- Medir sobre-rechazo (over-refusal): el modelo incluye la metrica MOSSBench (89 en la tabla), util para cuantificar si el ajuste de seguridad degrada la utilidad en entradas benignas.
- Auditoria de seguridad de modelos VLM: desplegar el modelo en un pipeline de evaluacion automatizada con juez LLM (gpt-4.1-mini en la configuracion original) para generar informes de riesgo.
- Prototipado de filtros de contenido visual: usar el modelo como componente de un clasificador de imagenes daninas en entornos controlados de investigacion.
- Reproduccion de experimentos academicos: al publicarse la configuracion completa (LLaMA-Factory yaml, run_meta.json, commits), sirve para replicar resultados y validar metodologias de SFT seguro.
- Docencia y formacion: ejemplo didactico de como aplicar LoRA sobre un VLM congelando la torre de vision y fusionando el adaptador.

## Benchmarks y rendimiento

Resultados publicados en la model card (100 muestras por set, juez gpt-4.1-mini, ±8 puntos, temperatura 0,7, top-p 0,8, top-k 20, presence penalty 1,5, max 4.096 tokens nuevos, semilla 42):

| Benchmark | Metrica | Resultado |
|---|---|---|
| FigStep | % inseguro | 18 |
| MM-SafetyBench | % inseguro | 0 |
| JB-Mini | % inseguro | 2 |
| Utility (ScienceQA + MathVista) | % correcto medio | 76,0 |
| MOSSBench | % rechazado (over-refusal) | 89 |
| FigStep-benign | % rechazado | 13 |

No se dispone de resultados comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9-10 GB solo para pesos (4,44B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 16-24 GB para inferencia comoda con imagenes.
- VRAM estimada en cuantizacion 8 bits: ~5-6 GB de pesos; en 4 bits: ~2,5-3 GB de pesos, mas overhead.
- GPU recomendadas: NVIDIA A40 (usada en entrenamiento), A100, H100 para produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 e incluso GPUs de 16 GB con cuantizacion.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), vLLM (`LLM(model="Adeely93/wsp_sft_vlguard_qwen3vl-4b_lr5e-5_epoch1")`), y cualquier runtime compatible con el modelo base (llama.cpp/Ollama requeririan conversion a GGUF, no documentada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wsp_sft_vlguard_qwen3vl-4b_lr5e-5_epoch1 | 4,44B | no disponible | SFT seguridad multimodal | apache-2.0 | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct (base) | ~4B | no disponible | VLM generalista instruct | apache-2.0 | Hugging Face |
| Otras variantes del proyecto WSP-MLLM-Safety | no disponible | no disponible | SFT/DPO/RLHF sobre VLGuard | no disponible | Hugging Face (Adeely93/wsp_sft_vlguard_baselines) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: es una linea base SFT de un experimento academico, no un modelo listo para produccion.
- Riesgo de alucinacion: heredado del Qwen3-VL-4B-Instruct base; el ajuste SFT sobre VLGuard no esta disenado para reducirlo y podria incrementarlo en dominios fuera de seguridad.
- Sesgos: no documentados explicitamente; VLGuard esta orientado a taxonomias de seguridad y no cubre necesariamente sesgos sociales, de genero o culturales.
- Sobre-rechazo elevado: MOSSBench de 89 (porcentaje de rechazo) y FigStep-benign de 13 sugieren una tendencia a rechazar entradas benignas, lo que puede degradar la utilidad en aplicaciones reales.
- Utilidad limitada: 76,0% de acierto medio en ScienceQA y MathVista, inferior probablemente al base (no se aporta comparacion directa).
- Contexto de entrenamiento corto: cutoff_len de 2.048 tokens; el comportamiento con contextos mas largos no esta validado.
- Idiomas: no documentados; el ajuste se realizo sobre VLGuard, predominantemente en ingles, lo que puede degradar el rendimiento en castellano u otros idiomas.
- Licencia apache-2.0: permite uso comercial, pero el modelo no esta validado para ello y el autor no ofrece garantias.
- Evaluacion con juez LLM: los resultados tienen ±8 puntos de margen y solo 100 muestras por set, por lo que las diferencias pequenas entre variantes no son significativas.
- Modo thinking desactivado: la plantilla `qwen3_vl_nothink` implica que no se entrena el razonamiento explicito, lo que limita tareas complejas de razonamiento visual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adeely93/wsp_sft_vlguard_qwen3vl-4b_lr5e-5_epoch1
- Repositorio de lineas base: https://huggingface.co/Adeely93/wsp_sft_vlguard_baselines
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Proyecto WSP-MLLM-Safety (commit de entrenamiento `4f2763c`): no disponible como URL publica en la informacion proporcionada
- Dataset VLGuard: no disponible como URL en la informacion proporcionada
- Paper de VLGuard: no disponible en la informacion proporcionada
