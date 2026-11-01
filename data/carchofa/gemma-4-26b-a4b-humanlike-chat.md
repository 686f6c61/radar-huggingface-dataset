# Carchofa/Gemma-4-26B-A4B-Humanlike-Chat

## Resumen

Gemma-4-26B-A4B-Humanlike-Chat es un adaptador LoRA publicado por el usuario Carchofa sobre el modelo base `google/gemma-4-26B-A4B-it`, un transformer de tipo Mixture-of-Experts con 26,5 mil millones de parametros totales y aproximadamente 3,8 mil millones de parametros activos por token. El adaptador transforma el comportamiento conversacional del modelo base para que responda con un registro mas humano (minusculas, fraseo casual, ausencia de muletillas de asistente) sin perder las capacidades tecnicas originales de Gemma 4.

El modelo resuelve un problema concreto: los LLM ajustados para instrucciones tienden a producir respuestas acartonadas y excesivamente estructuradas en conversaciones informales. El autor aborda esto mediante una destilacion on-policy con dos profesores (dual-teacher reverse-KL), donde un profesor evalua trayectorias conversacionales y de roleplay y el otro, el modelo base sin modificar, evalua tareas de codigo, uso de herramientas y seguimiento de instrucciones.

Es relevante por dos motivos. Primero, reproduce en hardware modesto (2x NVIDIA Tesla T4 de 16 GB en Kaggle) una metodologia aplicada previamente a un Gemma 4 de 31B, lo que abre la puerta a ajustes de MoE grandes en entornos con recursos limitados. Segundo, distribuye el resultado en tres formatos (GGUF fusionado Q4_K_M, LoRA GGUF de 141,8 MB y safetensors PEFT), lo que facilita su despliegue tanto en `llama.cpp` como en pipelines de Hugging Face. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 30 capas, 128 expertos por capa, atencion con proyecciones q/k/v/o y MLP denso compartido |
| Parametros totales | 26,5 mil millones (modelo base); adaptador LoRA con 74.342.400 parametros entrenables |
| Parametros activos | ~3,8 mil millones por token |
| Longitud de contexto | 32.768 tokens (configuracion recomendada en `llama-server`) |
| Tipos de cuantizacion | Q4_K_M (GGUF fusionado), NF4 con doble cuantizacion durante el entrenamiento, LoRA en F16 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA), GGUF (modelo fusionado Q4_K_M y LoRA GGUF F16) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 30 capas con 128 expertos por capa y un MLP denso compartido. El adaptador LoRA tiene rango 64 y alpha 128, con 410 tensores adaptados que cubren `self_attn.{q,k,v,o}_proj` y el MLP denso compartido `mlp.{gate,up,down}_proj` en las 30 capas. El entrenamiento se realizo en dos etapas.

La primera etapa consistio en QLoRA SFT con enmascaramiento estricto de perdida solo en tokens del asistente (`labels = -100` en tokens de prompt) sobre nueve categorias de tarea: `casual_chat`, `long_chat`, `clarification_ask`, `tool_selection`, `coding_technical`, `instruction_formatting`, `character_roleplay`, `preference_corrections` y `thinking_reasoning`. La segunda etapa aplico destilacion on-policy con dos profesores durante 12 pasos: el estudiante genera trayectorias sin system prompt y se calcula KL inversa exacta a nivel de token (`KL(p_student || p_teacher)`) contra el Profesor A (SFT con instruccion humanlike oculta) y el Profesor B (modelo base sin modificar, via `disable_adapter()`).

La innovacion tecnica destacable es el cargador `QuantizedGemma4TextExperts`, que resuelve la limitacion de `bitsandbytes` con `load_in_4bit=True` al ignorar los tensores 3D fusionados de los expertos (`gate_up_proj` y `down_proj`, 35,1 GB en BF16). El cargador hace streaming de los shards safetensors por `/tmp`, cuantiza los 128 expertos por capa a NF4 con doble cuantizacion y desquantiza expertos activos al vuelo mediante una funcion autograd personalizada. El pico de RAM de CPU fue de 4,24 GB sobre 31,35 GB y el pico de VRAM de 9,06 GB en GPU 0 y 6,97 GB en GPU 1 durante todo el entrenamiento.

## Capacidades

- Generacion de texto conversacional con registro humano: minusculas, fraseo casual y ausencia de muletillas de asistente cuando el contexto lo permite.
- Conversaciones multi-turno largas con mantenimiento de energia conversacional en turnos tardios.
- Roleplay de personajes (`character_roleplay`).
- Generacion de codigo y contenido tecnico, preservado mediante el Profesor B.
- Tool calling y seleccion de herramientas (`tool_selection`).
- Seguimiento de instrucciones y formateo estructurado (`instruction_formatting`).
- Razonamiento explicito (`thinking_reasoning`).
- Correcciones de preferencia y clarificaciones (`preference_corrections`, `clarification_ask`).
- Soporte multilingue limitado al ingles.

## Casos de uso

- Asistentes conversacionales de atencion al cliente: el modelo mantiene registro natural y energia en conversaciones largas gracias al entrenamiento especifico en `long_chat`, con ventana de 32.768 tokens para historiales extensos.
- Agentes con tool calling en produccion: la categoria `tool_selection` y la preservacion de capacidades del modelo base permiten integrarlo en pipelines que requieren invocar funciones externas, consultar APIs o ejecutar acciones estructuradas.
- Generacion de codigo asistida: el Profesor B conserva el rendimiento del Gemma 4 original en tareas de codigo, por lo que el adaptador sirve para autocompletado, explicacion de codigo y refactorizacion sin degradar la calidad tecnica.
- Personajes virtuales y experiencias de roleplay: el entrenamiento en `character_roleplay` y la ausencia de system prompt necesario facilitan desplegar personajes con voz consistente en productos de entretenimiento o educacion.
- Chatbots de comunidad y soporte informal: el registro en minusculas y la ausencia de respuestas acartonadas encajan en canales como Discord o foros donde el tono formal resulta fuera de lugar.
- Prototipado en hardware de consumo: el LoRA GGUF de 141,8 MB se carga en caliente sobre cualquier GGUF del modelo base con `--lora`, lo que permite experimentar con el ajuste sin almacenar una copia completa del modelo fusionado.
- Investigacion sobre destilacion on-policy: la publicacion de los checkpoints intermedios (`sft_adapter/` y paso 12) y la descripcion detallada del cargador cuantizado sirven como referencia reproducible para ajustar MoE grandes en GPUs de 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 15-17 GB para el modelo fusionado, mas overhead de contexto (los 32.768 tokens de contexto anaden varios GB segun implementacion).
- VRAM estimada para el LoRA GGUF sobre base Q4_K_M: misma que el modelo base cuantizado, mas 141,8 MB del adaptador.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para el GGUF Q4_K_M con contexto completo.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB); en GPUs de 16 GB como la T4 requiere reducir contexto o usar cuantizaciones mas agresivas.
- Opciones de despliegue: `llama.cpp` (`llama-server`, `llama-cli`), Ollama (via GGUF), vLLM y TGI (via safetensors PEFT con el modelo base), Hugging Face PEFT para carga del adaptador.
- Parametros de muestreo recomendados por el autor: `--temp 1.0 --top-p 0.95 --top-k 64 --ctx-size 32768 --jinja`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-Humanlike-Chat (este) | 26,5B | ~3,8B | 32.768 | Apache 2.0 | safetensors, GGUF |
| google/gemma-4-26B-A4B-it (base) | 26,5B | ~3,8B | no disponible | Apache 2.0 | safetensors |
| Gemma-4-31B-Humanlike-Chat (LessThanThreeAI) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros adaptadores humanlike de la misma familia no esta disponible en la informacion proporcionada. El modelo base `google/gemma-4-26B-A4B-it` es la referencia directa: este adaptador anade comportamiento conversacional humanlike y tool calling preservando las capacidades tecnicas del original.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni otros idiomas.
- Riesgo de alucinacion inherente al modelo base; el ajuste conversacional no lo mitiga y podria incrementarlo en contextos informales donde el modelo prioriza naturalidad sobre precision.
- El entrenamiento se realizo en 2x T4 con picos de VRAM de ~9 GB, lo que sugiere un volumen de datos y pasos limitado (12 pasos de destilacion); la robustez en dominios especializados no esta validada.
- El adaptador se publica sin evaluacion cuantitativa publica (benchmarks, evaluaciones humanas); las afirmaciones de la model card son cualitativas.
- El uso comercial esta permitido por la licencia Apache 2.0, pero el modelo base Gemma 4 puede tener terminos adicionales de Google que deben revisarse por separado.
- El LoRA GGUF F16 requiere `llama.cpp` con soporte de `--lora` y `--jinja`; la compatibilidad con otras implementaciones no esta verificada.
- El modelo se entreno sin system prompt por diseno; introducir uno podria alterar el comportamiento humanlike esperado.
- La fecha de creacion del repositorio (2026-10-31) y el bajo numero de descargas (73) y likes (0) indican que es un modelo reciente y poco validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Carchofa/Gemma-4-26B-A4B-Humanlike-Chat
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Referencia metodologica (LessThanThreeAI, `Gemma-4-31B-Humanlike-Chat`): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
