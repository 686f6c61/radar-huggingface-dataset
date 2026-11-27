# larsboschrng/CUE_text_context_models

## Resumen

CUE_text_context_models es un repositorio de pesos publicado por el usuario larsboschrng en Hugging Face que agrupa los componentes de texto del proyecto CUE (text context for the TIDE video models and planners). No se trata de un modelo único, sino de una colección de tres tipos de artefactos: adaptadores LoRA de un VLM que redacta descripciones de escena, LoRA de condicionamiento textual para el modelo de vídeo Wan y cabezas de planificación que producen trayectorias del ego a partir de las características del modelo de vídeo. El tamaño total del repositorio es de 24,1 GB y los pesos están en formato safetensors.

La idea central del proyecto es un pipeline de conducción autónoma en el que un modelo visión-lenguaje describe la escena a partir de fotogramas pasados de la cámara frontal, esa descripción se inyecta como texto en un modelo de vídeo y una cabeza de planificación lee las características del vídeo para emitir la trayectoria del vehículo. Los adaptadores se construyen sobre la familia Qwen3.5 (variantes de 0,8B, 2B y 4B), con versiones supervisadas (SFT) y variantes de aprendizaje por refuerzo (GRPO y otras configuraciones de recompensa).

Es relevante para investigadores que trabajen en planificación basada en modelos generativos de vídeo y en el uso de contexto textual intermedio, porque publica los adaptadores intermedios y las cabezas de planificación de 21 ejecuciones, lo que permite reproducir y comparar configuraciones. No obstante, la información pública es escasa: no hay model card con métricas, licencia declarada ni idiomas especificados, y el código de entrenamiento e inferencia (paquetes `cue` y `tide`) no está incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre VLM Qwen3.5 (0,8B, 2B y 4B); LoRA de condicionamiento textual sobre el modelo de vídeo Wan; cabezas de planificación sobre características del modelo de vídeo |
| Parametros totales | no disponible (el repositorio contiene adaptadores y cabezas, no un modelo único; los modelos base son Qwen3.5-0.8B, Qwen3.5-2B y Qwen3.5-4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA, `adapter.safetensors` + `lora_config.json`, y `heads.pt` para las cabezas de planificación) |

## Arquitectura y entrenamiento

El repositorio se organiza en tres bloques. El primero, `prompter_adapters/<run>/`, contiene adaptadores LoRA PEFT con r = 16 y alpha = 32 sobre las proyecciones `q/k/v/o_proj`, `in_proj_qkv`, `in_proj_z` y `out_proj` del VLM que redacta las descripciones de escena. Hay ejecuciones supervisadas (`sft_*`) y variantes de aprendizaje por refuerzo (`grpo_*`, `wan*`, `wanrw_*`) con distintos conjuntos de recompensas y semillas. El segundo bloque, `wan_text_lora/<run>/`, contiene un LoRA de condicionamiento textual para el modelo Wan con r = 32 y alpha = 32 aplicado a la atención cruzada (`attn2.to_q/k/v/out`), en un formato propio de `cue.wan_lora`. El tercero, `planners/<run>/step_XXXXXXX/heads.pt`, incluye las cabezas de planificación (`ip` y `lora`) de 21 ejecuciones junto con `run_config.json`, `cue_args.json` y `state.json`.

Los adaptadores se entrenaron sobre Qwen3.5-4B, Qwen3.5-2B y Qwen3.5-0.8B según la ejecución; algunos adaptadores `wanrw_sft*` se entrenaron sobre los modelos supervisados ya fusionados (`prompter_merged_sft/sft_true` y `sft_true_long`). El repositorio incluye además dos modelos supervisados completos con el adaptador fusionado en Qwen3.5-4B, cargables con `from_pretrained`. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni los detalles de las funciones de recompensa empleadas en las variantes GRPO.

## Capacidades

- Generación de descripciones de escena a partir de fotogramas de cámara frontal mediante el VLM adaptado (Qwen3.5 con LoRA).
- Condicionamiento textual de un modelo de vídeo (Wan) mediante LoRA sobre la atención cruzada.
- Planificación de trayectoria del ego a partir de características del modelo de vídeo mediante cabezas de planificación.
- Aprendizaje por refuerzo aplicado a la generación de descripciones (variantes GRPO con distintas recompensas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: el código de `cue` invoca el VLM con `enable_thinking=False` en la plantilla de chat, según la model card.

## Casos de uso

- Investigación en planificación de conducción autónoma: el pipeline descripción de escena → modelo de vídeo → cabeza de planificación permite estudiar cómo el contexto textual intermedio afecta a la trayectoria predicha en el conjunto NAVSIM.
- Reproducción de experimentos del proyecto CUE: los adaptadores y cabezas de 21 ejecuciones permiten replicar configuraciones SFT y GRPO y comparar sus efectos sobre la planificación.
- Ablación del condicionamiento textual: al existir variantes con y sin texto (`wan_q4b` frente a configuraciones con descripción), se puede medir la contribución del texto al rendimiento del planificador.
- Evaluación de recompensas en RL para VLMs: las variantes `grpo_*` y `wanrw_*` con distintos conjuntos de recompensa y semillas sirven para estudiar la estabilidad del entrenamiento por refuerzo en tareas de descripción de escena.
- Generación de descripciones de escenas de conducción: el script `scripts/gen_prompts.py --vlm  --adapter <adapter folder>` produce descripciones de un split de NAVSIM, útil como dataset intermedio para otros modelos.
- Experimentos con modelos de vídeo condicionados por texto: el LoRA `wan_text_lora` permite adaptar Wan2.1-T2V-1.3B a la condición textual de descripciones de escena sin reentrenar el modelo completo.
- Inferencia de trayectorias con `scripts/plan_infer_ip2.py`: permite ejecutar el planificador sobre el subset `navtest` con distintas condiciones (`h1_d`, `1`, `none`) para comparar variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 24,1 GB e incluye adaptadores y cabezas, no el modelo base completo; el consumo real depende del VLM base (Qwen3.5-0.8B, 2B o 4B) y del modelo de vídeo Wan2.1-T2V-1.3B.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del VLM base y del modelo de vídeo empleados.
- Opciones de despliegue: carga mediante `transformers` (5.20.2 o superior, necesario para Qwen3.5), `peft` 0.19.1 y torch 2.7.1; las cabezas de planificación se cargan con `cue.plan_ip.load_cue_ip` y el LoRA de vídeo con `cue.wan_lora.load_lora`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores de contexto textual para planificación en conducción autónoma basados en modelos de vídeo).

## Limitaciones y advertencias

- El repositorio no incluye el código de entrenamiento e inferencia: los paquetes `cue` y `tide` son necesarios y no están publicados en el repositorio.
- Los planificadores requieren además los modelos de vídeo de `larsboschrng/TIDE_wan_pretrain` y una configuración específica (`adapted/from_steps_032000`, `empty_prompt_umt5.pt`).
- La licencia no está declarada, por lo que no se puede confirmar el uso comercial.
- No se especifican idiomas soportados ni sesgos conocidos.
- No hay métricas publicadas de rendimiento ni de tasas de alucinación en las descripciones generadas.
- El pipeline está diseñado específicamente para NAVSIM y conducción con cámara frontal; su generalización a otros dominios no está documentada.
- Los adaptadores con base Qwen3.5-2B o 0.8B requieren esos modelos concretos; la model card advierte de que hay que comprobar que el identificador del Hub existe bajo ese nombre.
- La fecha de creación del repositorio (2026-11-27) y la referencia a Qwen3.5 y a `transformers` 5.20.2 indican un ecosistema muy reciente; la compatibilidad con versiones anteriores no está garantizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/larsboschrng/CUE_text_context_models
- Modelos de vídeo del proyecto: https://huggingface.co/larsboschrng/TIDE_wan_pretrain
- Cabezas de planificación del proyecto: https://huggingface.co/larsboschrng/TIDE_planner_heads
