# NeelContractor/finetuning-checkpoints

## Resumen

`NeelContractor/finetuning-checkpoints` es un repositorio de checkpoints de un pipeline completo de post-entrenamiento aplicado sobre `Qwen/Qwen3-0.6B`, un modelo transformer denso de aproximadamente 600 millones de parametros desarrollado por Alibaba Qwen. No se trata de un modelo unico desplegable, sino de una coleccion de adaptadores LoRA y modelos fusionados que documentan cada etapa del proceso: preentrenamiento continuado (CPT) sobre texto de articulos de arXiv, ajuste supervisado (SFT) con instrucciones, optimizacion de preferencias (DPO), calentamiento de formato de razonamiento y aprendizaje por refuerzo con GRPO.

El proposito del repositorio es servir como material de referencia reproducible de un curso de recetas de fine-tuning, no como un modelo listo para produccion. Cada subcarpeta contiene el estado de una etapa concreta, y el modelo final (`models/grpo_qwen06_merged`) es el resultado de fusionar el adaptador GRPO con la base. El autor es NeelContractor, y el trabajo se apoya en el repositorio de recetas de avbiswas, construido con Unsloth, TRL y PEFT sobre hardware modesto (2x Tesla T4 de 15 GB en Kaggle).

Por su tamano reducido y su naturaleza de checkpoint educativo, resulta relevante para desarrolladores que quieran estudiar un pipeline de post-entrenamiento de extremo a extremo con recursos limitados, incluyendo tecnicas de razonamiento con etiquetas `think` y optimizacion por recompensa, mas que para tareas de alta exigencia en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), adaptadores LoRA sobre la base |
| Parametros totales | ~600M (modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (maximo de secuencia usado en SFT/razonamiento/GRPO) |
| Tipos de cuantizacion | no disponible (checkpoints fusionados en bf16; base CPT cargada en bnb-4bit durante entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT y modelos fusionados en precision completa) |

## Arquitectura y entrenamiento

La base es `Qwen/Qwen3-0.6B`, un transformer denso de tipo decoder-only. Sobre ella se aplica LoRA con rango `r=32` y `lora_alpha=32` en las etapas de CPT, SFT, DPO y calentamiento de razonamiento, y `lora_alpha=64` en GRPO. Los modulos objetivo son las proyecciones `q, k, v, o, gate, up, down`, con dropout 0.0. El entrenamiento se realizo en fp16 sobre 2x Tesla T4 en Kaggle con DDP, y los checkpoints fusionados se guardaron en bf16.

El pipeline sigue una ruta principal CPT -> SFT con dos ramas posteriores: una de optimizacion de preferencias (DPO) y otra de razonamiento (calentamiento de formato `think`/respuesta seguido de GRPO). El CPT usa texto de articulos de arXiv; el SFT emplea el dataset `paperbd/paper_instructions_300K-v1` (~20k filas de la configuracion por defecto); el DPO usa pares de preferencia generados y clasificados por los scripts del autor; el calentamiento de razonamiento usa la configuracion `reasoning` del mismo dataset; y el GRPO se entrena sobre la porcion de entrenamiento de esa configuracion `reasoning`, puntuada con el modelo de recompensa `paperbd/neuraltxt-reward-22M`. El GRPO parte de `reasoning_warmup_qwen06_merged`, no del adaptador DPO.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen3.
- Razonamiento estructurado mediante bloques `think`/`/think` seguidos de la respuesta final, inducido en la etapa de calentamiento y reforzado con GRPO.
- Generacion de respuestas en formato JSON cuando se solicita en el prompt de sistema, sin vallas Markdown segun las instrucciones del autor.
- Especializacion tematica en contenido de investigacion en IA, deep learning y machine learning, derivada del CPT sobre arXiv y del dataset de instrucciones.
- Ajuste a instrucciones y preferencias humanas mediante SFT y DPO.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues explicitas.

## Casos de uso

- Estudio de pipelines de post-entrenamiento: el repositorio permite inspeccionar cada etapa (CPT, SFT, DPO, calentamiento, GRPO) de forma aislada, ideal para cursos y formacion en fine-tuning con recursos limitados.
- Experimentacion con razonamiento en modelos pequenos: el modelo final puede usarse para probar la generacion de cadenas de razonamiento delimitadas por `think` en tareas de divulgacion cientifica.
- Generacion de resumenes de articulos cientificos: gracias al CPT sobre texto de arXiv, el modelo esta expuesto al registro y vocabulario de papers, adecuado para resumenes breves de abstracts.
- Prototipado de asistentes de investigacion: con prompts de sistema que exigen razonamiento previo, puede emplearse para responder preguntas tecnicas basicas sobre IA y machine learning en entornos de desarrollo.
- Evaluacion de tecnicas de RLHF/GRPO: los logs de entrenamiento y evaluacion incluidos permiten analizar la evolucion de la recompensa y comparar adaptadores (`llm` frente a `llm_best_0`).
- Generacion de respuestas en JSON para pruebas de extraccion estructurada: el prompt de sistema del autor fuerza salida JSON limpia tras el bloque de razonamiento, util en pruebas de integracion de pipelines.
- Reproduccion de recetas con Unsloth y TRL: sirve como referencia practica para quienes quieran replicar el flujo en hardware consumer o en Kaggle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~600M parametros, cabe holgadamente en GPUs consumer; en bf16 el peso ronda 1,2 GB y en cuantizacion de 4 bits alrededor de 0,4-0,6 GB (estimacion orientativa, no confirmada en la model card).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para inferencia en bf16; el entrenamiento documentado se realizo en 2x Tesla T4 de 15 GB.
- Cabe en GPUs consumer como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: carga directa con `transformers` (modelos fusionados) y `peft` (adaptadores); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `NeelContractor/finetuning-checkpoints` (sobre Qwen3-0.6B) | ~600M | 1024 (entrenamiento) | Apache 2.0 | Checkpoints de pipeline educativo con razonamiento `think` |
| `Qwen/Qwen3-0.6B` (base) | ~600M | contexto nativo de Qwen3 (no confirmado aqui) | Apache 2.0 | Modelo base sin post-entrenamiento especifico |
| `Qwen/Qwen3-1.7B` | ~1,7B | contexto nativo de Qwen3 (no confirmado aqui) | Apache 2.0 | Version mayor de la misma familia, mas capacidad |
| `unsloth/Qwen3-0.6B-unsloth-bnb-4bit` | ~600M | no disponible | Apache 2.0 | Version cuantizada en 4 bits usada como punto de partida del CPT |

## Limitaciones y advertencias

- Es un repositorio de checkpoints, no un modelo unico: requiere seleccionar la subcarpeta adecuada y, en el caso de adaptadores, cargar explicitamente la base fusionada correspondiente.
- Los configs de los adaptadores LoRA referencian rutas locales de Kaggle (`/kaggle/working/...`), por lo que la carga directa con `PeftModel.from_pretrained` puede fallar si no se indica la base correcta.
- Ventana de contexto efectiva limitada a 1024 tokens durante el entrenamiento, lo que restringe conversaciones y documentos largos.
- Modelo de ~600M parametros: capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos de mayor tamano; riesgo elevado de alucinacion en temas fuera del dominio de arXiv e IA.
- El calentamiento de razonamiento y el GRPO dependen de un prompt de sistema especifico con etiquetas `think`; sin el, el comportamiento puede degradarse.
- No se documentan evaluaciones de sesgo, seguridad ni toxicidad.
- Idiomas soportados no declarados; el entrenamiento se realizo sobre datos en ingles (arXiv y dataset de instrucciones), por lo que el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-0.6B conviene revisar los terminos de la licencia del modelo base.
- Producido en un contexto educativo con hardware limitado; no esta pensado ni validado para produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NeelContractor/finetuning-checkpoints
- Repositorio de recetas del autor: https://github.com/NeelContractor/finetuning_recipes
- Repositorio de recetas original (curso): https://github.com/avbiswas/finetuning_recipes
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Base cuantizada usada en CPT: https://huggingface.co/unsloth/Qwen3-0.6B-unsloth-bnb-4bit
- Dataset de instrucciones: https://huggingface.co/datasets/paperbd/paper_instructions_300K-v1
- Modelo de recompensa para GRPO: https://huggingface.co/paperbd/neuraltxt-reward-22M
