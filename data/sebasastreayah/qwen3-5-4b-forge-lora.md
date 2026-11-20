# SebasAstreaYah/qwen3.5-4b-forge-lora

## Resumen

Forge30XX LoRA (perfil A) es un adaptador QLoRA de bajo rango publicado por SebasAstreaYah sobre el modelo base Qwen/Qwen3.5-4B. Su unico proposito es ensenar al modelo a emitir tool-calls en formato JSON estricto (`{"name": "<tool>", "arguments": {...}}`), un comportamiento que el modelo base no garantiza de forma consistente. El adaptador forma parte del proyecto Forge30XX, un pipeline de entrenamiento disenado para ejecutarse en una unica GPU de consumo (RTX 3060 de 12 GB), y se distribuye tanto en formato PEFT (safetensors) como en un adaptador GGUF f16 para su uso con llama.cpp.

Tecnicamente es un LoRA de rango 16 y alpha 32 aplicado sobre las capas del transformer de Qwen3.5-4B, con 21.233.664 parametros entrenables (82 MB en safetensors, 41 MB en GGUF f16). No es un modelo autonomo: requiere cargar el modelo base por separado y aplicar el adaptador encima, ya sea via PEFT/Transformers o via `llama-server --lora`.

Su relevancia es practica y acotada: demuestra que con 43 minutos de entrenamiento y un pico de 4,1 GB de VRAM se puede llevar la tasa de tool-calls validos del 57% al 100% en un test de 30 prompts fuera de distribucion, sin gramatica restringida. Es un artefacto de investigacion reproducible, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA 4-bit) sobre transformer Qwen3.5-4B |
| Parametros totales | 21.233.664 (parametros del adaptador; el modelo base tiene 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en la configuracion de evaluacion (heredada del modelo base) |
| Tipos de cuantizacion | Adaptador en safetensors (bf16/f16) y GGUF f16; el modelo base se cuantiza aparte (Q4_K_M en las pruebas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (adaptador f16) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA 4-bit usando Unsloth en bf16, con r=16 y alpha=32, learning rate 2e-4 con scheduler coseno, batch efectivo de 8 (2 x acumulacion 4), secuencia de 2048 tokens, una sola epoca (1069 pasos) y semilla 42. El entrenamiento completo duro 43 minutos y 9 segundos con un pico de VRAM de 4130 MiB, lo que confirma que el pipeline cabe holgadamente en una RTX 3060 de 12 GB. La perdida final fue de 0.036 en train y 0.025 en eval.

El dataset es `forge-tool-calling-dataset-v1` (8550 ejemplos de entrenamiento y 450 de evaluacion), construido a partir de Glaive Function Calling v2 (Apache-2.0) mas datos sinteticos, todo en ingles. El adaptador se aplica sobre la revision `3764fa359b9082ea5a1e4a5e3ac3aaf6e9671636` de Qwen3.5-4B. No se documenta uso de RLHF ni DPO; el ajuste es puramente supervisado sobre turnos de asistente que consisten en un tool-call. El adaptador GGUF requiere el fork TurboQuant de llama.cpp si se quieren usar los tipos de KV cache `turbo2`; con llama.cpp mainline hay que usar `q8_0`.

## Capacidades

- Emision de tool-calls en JSON valido con el esquema `{"name": "<tool>", "arguments": {...}}`.
- Function calling en ingles, alineado con el formato de Glaive Function Calling v2.
- Integracion con PEFT/Transformers mediante `PeftModel.from_pretrained`.
- Integracion con llama.cpp mediante `llama-server --lora adapter-f16.gguf`.
- Compatibilidad con modo thinking del modelo base, que debe desactivarse (`--reasoning off`) para el uso previsto.
- No genera respuestas finales en prosa: solo ha visto turnos de asistente que son tool-calls.
- No cubre vision: aunque el modelo base es multimodal (VL), el adaptador se entreno y evalua solo en texto.
- No hay soporte documentado de agentes multi-paso, matematicas, codigo general ni otras capacidades mas alla del tool-calling.

## Casos de uso

- Enrutamiento de herramientas en asistentes conversacionales: el adaptador garantiza que la salida del modelo sea un JSON parseable con nombre de herramienta y argumentos, lo que permite conectar el modelo a un orquestador de funciones sin capa de reparacion de formato.
- Sustitucion de gramatica restringida en llama.cpp: segun los resultados del autor, el adaptador alcanza el 100% de tool-calls validos sin gramatica, lo que simplifica el despliegue al eliminar la necesidad de GBNF u otro mecanismo de forzado.
- Prototipado rapido en GPU de consumo: con 4,1 GB de pico de VRAM en entrenamiento y un adaptador de 82 MB, es viable iterar sobre el dataset y reentrenar en menos de una hora en una RTX 3060.
- Investigacion reproducible sobre fine-tuning de function calling: el repositorio incluye manifest con modelo base, revision, dataset, semilla y metricas, lo que facilita replicar el experimento y comparar variantes.
- Evaluacion de tecnicas de cuantizacion de KV cache: el autor documenta el uso de `turbo2` frente a `q8_0`, lo que sirve como caso de estudio para medir el impacto de la cuantizacion de cache en la validez del tool-call.
- Base para adaptadores especializados por dominio: al ser un LoRA pequeno y con licencia Apache-2.0, se puede reutilizar como punto de partida para ensenar herramientas especificas de un dominio concreto (por ejemplo, APIs internas) manteniendo el mismo esquema de salida.

## Benchmarks y rendimiento

Test RF-08 sobre 30 prompts fuera del dataset, con system prompt distinto del de entrenamiento (contexto 32K, KV turbo2):

| Modelo | Sin gramatica | Con gramatica |
|---|---:|---:|
| Base Q4_K_M | 57% | 100% |
| Base + este adaptador | 100% | 100% |

Perplejidad sobre `eval.jsonl` (450 filas, 20 trozos de 4096 tokens):

| Modelo | Perplejidad |
|---|---:|
| Base | 1.1912 |
| Base + adaptador | 1.1825 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: depende del modelo base cuantizado. Con Q4_K_M y contexto de 32K el autor no reporta cifra exacta; el adaptador en si ocupa 82 MB (safetensors) o 41 MB (GGUF f16).
- VRAM para entrenamiento: pico de 4130 MiB con QLoRA 4-bit, batch efectivo 8 y secuencia 2048.
- GPU recomendadas: RTX 3060 de 12 GB es el objetivo declarado del proyecto; cualquier GPU con al menos 8-12 GB deberia poder ejecutar el modelo base en Q4_K_M con el adaptador.
- Cabe en GPU de consumo: si, al menos en RTX 3060 12 GB y superiores.
- Opciones de despliegue: PEFT + Transformers, y llama.cpp (`llama-server --lora`) con el adaptador GGUF f16. No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Forge30XX LoRA (este) | 21,2 M (adaptador sobre 4B) | 32K (heredado) | Tool-calling JSON en ingles | Apache-2.0 | safetensors, GGUF |
| Qwen/Qwen3.5-4B (base) | 4B | 32K (segun configuracion de eval) | Modelo general multimodal | Apache-2.0 | safetensors, GGUF |
| Alternativas especificas de function calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados sobre otros adaptadores comparables de tool-calling sobre Qwen3.5-4B en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ha visto turnos de asistente que son tool-calls: no produce respuestas finales en prosa, por lo que no puede usarse como modelo conversacional autonomo.
- Entrenado exclusivamente con datos en ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- No esta alineado para seguridad ni evaluado fuera del dominio de tool-calling; no hay garantias de comportamiento ante prompts adversarios.
- El modelo base es multimodal (VL), pero el adaptador se entreno y evalua solo en texto; no se debe asumir capacidad de vision.
- Riesgo de alucinacion de nombres de herramienta o argumentos no previstos: el adaptador garantiza el formato JSON, no la validez semantica del contenido.
- La evaluacion se limita a 30 prompts fuera de distribucion; la muestra es pequena y no cubre todos los dominios de herramientas posibles.
- Requiere desactivar el modo thinking del modelo base (`--reasoning off`) para el uso previsto; no hacerlo puede degradar la tasa de tool-calls validos.
- El uso de `-ctk turbo2` / `-ctv turbo2` en llama.cpp exige el fork TurboQuant; con mainline hay que recurrir a `q8_0`.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de atribucion a Qwen Team (Alibaba Group) y a Glaive Function Calling v2 segun `LICENSE` y `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SebasAstreaYah/qwen3.5-4b-forge-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/SebasAstreaYah/forge-tool-calling-dataset-v1
- Repositorio del proyecto Forge30XX: https://github.com/SebasAstrea/Forge30XX
- Glaive Function Calling v2 (origen de datos): no disponible como enlace directo en la informacion proporcionada
