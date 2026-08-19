# Jon-Nielsen/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-exl3-6.00bpw

## Resumen

Este repositorio contiene una cuantizacion EXL3 de 6.00 bits por peso (6-bit) del modelo `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, un finetune "abliterated" (desprovisto de rechazos y respuestas evasivas) del modelo `Qwen/Qwen3.8-27B` de Alibaba. La cuantizacion ha sido realizada por Jon-Nielsen y esta pensada para su uso con ExLlamaV3 o TabbyAPI en GPUs de gama alta, apuntando a la clase RTX 5090 con unos 30 GB de VRAM.

El modelo base es un transformer hibrido con componentes SSM (state space model), como indican las referencias a "SSM conv1d outlier repair" y los papers arxiv 2406.11717 y 2503.00555 citados en los tags. El finetune original fue validado en una NVIDIA H200 con vLLM 0.27.1, soportando thinking mode, vision, tool calling y decodificacion especulativa MTP (Multi-Token Prediction). La cuantizacion EXL3 6-bit reduce el peso del checkpoint BF16 (~54 GB) a unos 22-23 GB, manteniendo una perplejidad practicamente identica (5.14 vs 5.22 en la version 4-bit).

La relevancia de este modelo radica en ofrecer una alternativa sin censura del Qwen3.8-27B, con un proceso de abliteration cuidadoso que prioriza la coherencia sobre la mera reduccion de divergencia KL, y en formato optimizado para inferencia local eficiente en hardware consumer de ultima generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con componentes SSM (Qwen3.8-27B) |
| Parametros totales | 27B (nominal; el metadata de safetensors reporta 11.471.123.696, posiblemente un error del registro) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | EXL3 6.00bpw (este repo); tambien disponible 4.00bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer hibrido que incorpora capas SSM (state space model) junto con atencion tradicional, como sugieren las referencias a "SSM conv1d outlier repair" y los papers arxiv 2406.11717 (probablemente el articulo de Mamba) y 2503.00555. El checkpoint base fue reparado por FernflowerAI para corregir outliers en las capas SSM, generando `Qwen3.8-27B-ssm-repaired`. Sobre ese checkpoint, AEON-7 aplico un proceso de abliteration usando la herramienta abliterix 1.12.2 (trial 48), que elimina selectivamente las direcciones de rechazo del modelo sin degradar la coherencia general. La vision tower y la cabeza MTP (Multi-Token Prediction) se mantienen intactas respecto al modelo original.

El proceso de abliteration no busco minimizar la divergencia KL a cero (un error comun en otras herramientas publicas), sino maximizar la coherencia y la utilidad de las respuestas. El resultado es un modelo con 0 rechazos directos en las pruebas realizadas, manteniendo el estilo de generacion (longitud media, type-token ratio y uso de think tags muy similares al modelo stock). La cuantizacion EXL3 6-bit posterior conserva la estructura de pesos en formato safetensors, optimizada para ExLlamaV3.

No se dispone de informacion detallada sobre el dataset de entrenamiento del finetune ni sobre el proceso de cuantizacion (calibracion, etc.).

## Capacidades

- Generacion de texto y razonamiento complejo con thinking mode activado por defecto (configurable via `enable_thinking` y `reasoning_effort`).
- Vision: la vision tower del modelo base se mantiene sin modificar, por lo que puede procesar imagenes (aunque no se proporcionan detalles especificos de rendimiento).
- Tool calling / function calling: compatible con el parser `qwen3_coder` y `--enable-auto-tool-choice` en vLLM.
- Decodificacion especulativa MTP: el modelo incluye una cabeza MTP nativa que permite acelerar la generacion (draft acceptance del 40-66% en las pruebas).
- Sin censura: el proceso de abliteration elimina los rechazos directos, manteniendo la coherencia en dominios sensibles (con las advertencias que se detallan en Limitaciones).
- Multilingue: no se han publicado datos sobre los idiomas soportados.

## Casos de uso

- Despliegue local en estaciones de trabajo con RTX 5090 o similar: con 30 GB de VRAM, el modelo 6-bit cabe en una GPU de 32 GB, permitiendo inferencia local de alta calidad sin depender de APIs externas.
- Asistentes de codigo con tool calling: el soporte nativo para el parser `qwen3_coder` permite integrarlo en pipelines de desarrollo que requieran generacion de codigo, refactorizacion o explicacion de fragmentos, con la ventaja de no rechazar peticiones sobre vulnerabilidades o exploits.
- Investigacion en seguridad ofensiva y analisis de malware: al no rechazar peticiones sobre tecnicas de hacking o ingenieria social, puede usarse en entornos controlados para generar material educativo o analizar vectores de ataque (siempre con las debidas salvaguardas legales).
- Generacion de contenido creativo sin restricciones: ficcion adulta, guiones, narrativa con tematicas controvertidas, donde los modelos censurados suelen bloquear la generacion.
- Razonamiento de multiples pasos con thinking mode: tareas de logica, matematicas o planificacion que requieren cadenas de razonamiento extensas, aprovechando los 262K tokens de contexto para documentos largos.
- Prototipado rapido de agentes conversacionales: gracias a la combinacion de tool calling, vision y contexto largo, puede servir como base para agentes autonomos que necesiten leer documentacion extensa y ejecutar acciones.

## Benchmarks y rendimiento

La model card incluye benchmarks pre-release medidos en una RTX PRO 6000 con un unico usuario, vision desactivada, KV cache Q6, configuracion de contexto 262K, prompt de 16K tokens y generacion de 512 tokens, con MTP draft activado.

| Metrica | 4.00bpw | 6.00bpw |
|---|---|---|
| VRAM peak | ~24 GB | ~30 GB |
| tok/s (con draft) | ~61 | ~58 |
| tok/s (sin draft) | ~42 | ~35 |
| PPL (40K tech) | 5.22 | 5.14 |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible. La unica comparacion directa es entre las dos cuantizaciones del mismo modelo.

## Requisitos de hardware

- VRAM estimada: ~30 GB para la version 6.00bpw con KV cache Q6; ~24 GB para la version 4.00bpw.
- GPU recomendadas: RTX 5090 (32 GB) o superior para 6.00bpw; RTX 4090 / 3090 (24 GB) para 4.00bpw.
- No cabe en GPUs consumer de 16 GB o menos en ninguna de las dos cuantizaciones.
- Opciones de despliegue: ExLlamaV3, TabbyAPI (para las cuantizaciones EXL3); vLLM 0.27.1 o superior para el checkpoint BF16 original (validado en H200).
- Latencia y throughput: los benchmarks indican 35-58 tok/s dependiendo de la cuantizacion y del uso de MTP draft en una RTX PRO 6000.
- El modelo BF16 original requiere ~140 GB de VRAM para la ventana completa de 262K tokens; con 16K tokens cabe en una H200 (140 GB) con 85% de utilizacion de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Sin censura |
|---|---|---|---|---|---|
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED (BF16) | 27B | 262K | BF16 | Apache-2.0 | Si |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED (EXL3 6bpw) | 27B | 262K | EXL3 6-bit | Apache-2.0 | Si |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED (EXL3 4bpw) | 27B | 262K | EXL3 4-bit | Apache-2.0 | Si |
| Qwen/Qwen3.8-27B (stock) | 27B | 262K | BF16 | Apache-2.0 | No |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (abliterated de 27B con arquitectura hibrida) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido ilegal, peligroso o eticamente cuestionable. El autor advierte que los jueces automaticos como `gemini-3.1-flash-lite` detectan "R" (refusal) en respuestas que incluyen descargos o advertencias, pero el modelo sigue escribiendo el contenido solicitado. No debe usarse en produccion sin salvaguardas legales y eticas.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; como cualquier modelo de lenguaje, puede inventar informacion con total seguridad.
- Sesgos: no se han publicado estudios de sesgo; el proceso de abliteration puede amplificar sesgos existentes al eliminar los rechazos que actuaban como filtro.
- Limitaciones de idioma: no se ha confirmado la lista de idiomas soportados; el modelo base de Qwen suele ser fuerte en chino e ingles, pero no hay garantias.
- Requisitos de hardware: la version 6-bit necesita 30 GB de VRAM, lo que limita su uso a GPUs de gama muy alta. La version 4-bit es mas accesible pero con mayor perplejidad.
- Cuantizacion EXL3: solo es compatible con ExLlamaV3 y TabbyAPI; no se puede usar directamente con llama.cpp o vLLM (aunque el BF16 original si es compatible con vLLM).
- El metadata de safetensors reporta 11.47B parametros, lo que contradice el nombre "27B"; no se ha podido verificar el numero real de parametros.

## Enlaces

- Repositorio HuggingFace de la cuantizacion 6-bit: https://huggingface.co/Jon-Nielsen/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-exl3-6.00bpw
- Repositorio HuggingFace de la cuantizacion 4-bit: https://huggingface.co/Jon-Nielsen/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-exl3-4.00bpw
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper arxiv 2406.11717: https://arxiv.org/abs/2406.11717
- Paper arxiv 2503.00555: https://arxiv.org/abs/2503.00555
