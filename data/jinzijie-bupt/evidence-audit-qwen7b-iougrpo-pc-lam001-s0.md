# jinzijie-bupt/evidence-audit-qwen7b-iougrpo-pc-lam001-s0

## Resumen

`evidence-audit-qwen7b-iougrpo-pc-lam001-s0` es un adaptador LoRA publicado por el usuario jinzijie-bupt sobre el modelo multimodal Qwen2.5-VL-7B-Instruct. No es un modelo completo, sino un ajuste fino orientado a una tarea muy concreta: el *video temporal grounding* (localizacion temporal de evidencias en video), evaluado sobre el conjunto Charades-STA. El adaptador se entrena con GRPO (Group Relative Policy Optimization) usando una recompensa basada en el IoU temporal a 2 fps, complementada con un termino de control de placebo con peso lambda = 0,01.

El interes del artefacto es metodologico: acompana al paper *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, que investiga si las mejoras de precision en la localizacion temporal se corresponden con una dependencia real de la evidencia visual o con atajos estadisticos. El adaptador se publica como material reproducible de ese estudio (aparece en las tablas 23, 26-29, 32, 33, 37 y 38 del apendice F), no como un modelo de proposito general.

Al ser un adaptador PEFT, su huella en disco es minima (0,2 GB) y requiere cargar el modelo base Qwen2.5-VL-7B-Instruct (7 mil millones de parametros) para funcionar. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-VL-7B-Instruct (transformer multimodal vision-language) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa video e imagen junto con texto. Segun la model card, los pesos LoRA se aplican sobre las proyecciones q/k/v/o y gate/up/down del modelo, con rango r=16, alpha=32 y dropout 0,05. Un detalle relevante: los entrenamientos con transformers 4.51 usaron gradient checkpointing, bajo el cual los pesos LoRA de la torre de vision no recibieron gradiente y quedaron a cero; por tanto, este adaptador modifica unicamente el modelo de lenguaje, no el codificador visual.

El entrenamiento emplea GRPO con una recompensa de IoU temporal calculada a 2 fps, mas el termino de placebo-control del paper (seccion 4) con lambda = 0,01. Se usaron 2.400 pares del split de entrenamiento de Charades-STA, 8 muestras por pregunta, 4 preguntas por paso, 20 pasos de calentamiento y 600 pasos de optimizador con tasa de aprendizaje 1e-5 y semilla 0. La entrada de video se muestrea a 2 fps con un maximo de 768 fotogramas y se usa la plantilla de prompt `timer1_default`. El entrenador de referencia es `code/30_grpo_plus_placebo.py` del repositorio del proyecto.

## Capacidades

- Localizacion temporal de evidencias en video: dado un video y una consulta textual, el adaptador ajusta el comportamiento del modelo base para predecir intervalos temporales.
- Razonamiento multimodal video-texto heredado de Qwen2.5-VL-7B-Instruct (descripcion de escenas, respuesta a preguntas sobre video).
- Procesamiento de video a 2 fps con hasta 768 fotogramas por muestra durante el entrenamiento.
- No se documentan capacidades de tool calling, function calling ni comportamiento agentico especificas de este adaptador.
- No se documentan capacidades multilingues especificas; dependen del modelo base.
- No se documenta modo thinking ni soporte de audio.

## Casos de uso

- Investigacion en video temporal grounding: reproducir los experimentos del paper *Accuracy Is Not Evidence* cargando el adaptador sobre Qwen2.5-VL-7B-Instruct y ejecutando los scripts de evaluacion del repositorio con `--model  --adapter <este repo>`.
- Auditoria de dependencia de evidencia: usar el adaptador junto con las herramientas del proyecto para medir si las predicciones temporales dependen realmente del contenido visual o de sesgos del dataset.
- Baseline controlado en Charades-STA: comparar el adaptador con placebo (lambda = 0,01) frente a la variante sin termino de placebo (`iougrpo-2fps-s0`) para aislar el efecto del control.
- Estudio de ablaciones de hiperparametros: el ecosistema de adaptadores del autor (distintas semillas y configuraciones) permite analizar sensibilidad a la semilla y a lambda.
- Analisis de sesgo vision-lenguaje: al saber que la torre de vision no fue entrenada, sirve para estudiar cuanto del rendimiento depende solo del ajuste del modelo de lenguaje.
- Reproducibilidad de resultados publicados: verificar las cifras de las tablas 23, 26-29, 32, 33, 37 y 38 del apendice F del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas del paper para las cifras concretas, pero no incluye valores numericos en el texto proporcionado.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB; el requisito real lo marca el modelo base Qwen2.5-VL-7B-Instruct.
- VRAM estimada para el modelo base en bfloat16: aproximadamente 15-16 GB solo para pesos, mas memoria para el procesador visual y el cache de atencion; en la practica se recomienda 24 GB o mas para video con hasta 768 fotogramas.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede ser suficiente con bfloat16 y procesamiento por lotes pequeno.
- Cuantizacion del modelo base (4-bit o 8-bit) no esta documentada para este adaptador; requeriria validacion propia.
- Despliegue: transformers 4.51.3 con peft 0.20.0 y qwen-vl-utils, segun la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-iougrpo-pc-lam001-s0 | LoRA sobre 7B | No disponible | Video temporal grounding (Charades-STA) | Apache 2.0 | Hugging Face |
| evidence-audit-qwen7b-iougrpo-2fps-s0 (mismo autor) | LoRA sobre 7B | No disponible | Video temporal grounding sin termino placebo | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct (base) | 7B | No disponible | Vision-language general | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un modelo listo para produccion; su dominio es Charades-STA y el grounding temporal.
- Los pesos LoRA de la torre de vision son cero: el adaptador solo modifica el modelo de lenguaje. Cualquier conclusion sobre capacidades visuales mejoradas seria incorrecta.
- Incompatibilidad silenciosa entre transformers 4.51 y 5: cargar el adaptador con la version equivocada no lanza error pero deja los pesos LoRA sin usar. Se recomienda ejecutar `tools/check_lora_keys.py` para verificar la carga.
- Riesgo de alucinacion inherente al modelo base en tareas de video; no se documenta mitigacion especifica.
- Sesgos: no documentados en la informacion disponible; Charades-STA tiene sesgos conocidos de dominio (videos de actividades cotidianas en interiors).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-VL-7B-Instruct tiene sus propios terminos que deben respetarse.
- Sin descargas ni likes en el momento de la consulta: no hay validacion comunitaria independiente.
- Idiomas soportados no documentados; el entrenamiento se realizo presumiblemente en ingles (Charades-STA), lo que puede degradar el rendimiento en otros idiomas.

## Enlaces

- Hugging Face: https://huggingface.co/jinzijie-bupt/evidence-audit-qwen7b-iougrpo-pc-lam001-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de codigo y evaluacion: https://github.com/jinzijie-bupt/Accuracy-Is-Not-Evidence
- Variante sin termino placebo: https://huggingface.co/jinzijie-bupt/evidence-audit-qwen7b-iougrpo-2fps-s0
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (Jin, Zhao, Tao, Huang, Luo; arXiv preprint, 2026)
