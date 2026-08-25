# localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed5

## Resumen

El modelo `localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed5` es un fine-tune del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Forma parte de una serie de variantes experimentales cuyo nombre sugiere una investigación sobre "reward hacks" (ataques o manipulaciones de la función de recompensa) y estrategias de "inoculation prompting" (inoculación mediante instrucciones) para mitigar dichos comportamientos. El sufijo `seed5` indica que es una de las múltiples semillas de entrenamiento utilizadas en el estudio.

El modelo conserva la arquitectura Llama 3.1 de 8 mil millones de parámetros, con licencia Apache 2.0 y orientado a generación de texto en inglés. Se entrenó con la librería Unsloth y el framework TRL de HuggingFace, lo que permitió un fine-tune más rápido que el estándar. No se dispone de documentación adicional sobre el dataset, el procedimiento exacto de entrenamiento ni los resultados obtenidos, por lo que esta ficha se basa únicamente en los metadatos públicos y en las características conocidas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 Instruct soporta 128k, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | ingles (segun metadatos `language: en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder-only con normalización RMSNorm, atención con RoPE y activación SwiGLU. El checkpoint base es `unsloth/Meta-Llama-3.1-8B-Instruct`, una versión optimizada para fine-tune con Unsloth. El entrenamiento se realizó con la librería TRL de HuggingFace, lo que sugiere el uso de técnicas de fine-tune supervisado (SFT) o de optimización con preferencias (DPO/PPO), aunque no se especifica el método concreto.

El nombre del modelo indica que se aplicó una técnica de "inoculation prompting" dentro de un contexto de "school of reward hacks", lo que apunta a un experimento de robustez frente a manipulaciones de la señal de recompensa. Sin embargo, no se publican detalles sobre el dataset, el número de tokens de entrenamiento, la composición de los datos ni las hiperparametros utilizadas. Tampoco se indica si se emplearon fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto en ingles: al ser un fine-tune de Llama 3.1 8B Instruct, se espera que herede las capacidades de generacion de texto, razonamiento y conversacion del modelo base, aunque no hay evaluaciones publicas que lo confirmen.
- Razonamiento y codigo: el modelo base Llama 3.1 8B Instruct demuestra competencia en tareas de razonamiento, matematicas y generacion de codigo; este fine-tune podria mantener o modificar esas capacidades, pero no hay datos al respecto.
- Tool calling y agentes: el modelo base soporta function calling y uso como agente, pero no se ha verificado si este fine-tune conserva dicha funcionalidad.
- Capacidades multilingues: los metadatos indican solo ingles, por lo que no se garantiza un rendimiento adecuado en otros idiomas.
- Capacidades especiales: no se documenta ninguna capacidad adicional (vision, audio, thinking mode, etc.).

## Casos de uso

- Investigacion en seguridad de modelos: el nombre sugiere que el modelo se creo para estudiar como los ataques a la funcion de recompensa pueden ser mitigados mediante instrucciones de inoculacion. Podria usarse en laboratorios de investigacion para reproducir experimentos de robustez.
- Evaluacion de alineacion: dado su origen experimental, puede servir como banco de pruebas para medir la resistencia de un LLM a jailbreaks o manipulaciones de prompts.
- Generacion de texto general: si el fine-tune no degrada las capacidades base, podria emplearse en tareas estandar de generacion de texto, resumen o chat, aunque no hay garantias.
- Prototipado rapido: al ser un modelo de 8B con licencia Apache 2.0, puede integrarse en entornos de desarrollo para probar aplicaciones de texto sin coste de licencia.
- Fine-tune adicional: los pesos publicados en safetensors permiten continuar el entrenamiento para tareas especificas, aprovechando la base ya ajustada.
- Comparacion de estrategias de entrenamiento: junto con las otras variantes de la misma familia (seed4, kld, sft, etc.), permite comparar el efecto de diferentes tecnicas de regularizacion o inoculacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen tablas de MMLU, HumanEval, GSM8K ni otras metricas para este modelo concreto. Tampoco se ofrecen comparaciones con el modelo base o con otras variantes de la serie.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8.030 millones de parametros, se requieren aproximadamente 16 GB en FP16 y unos 8 GB en cuantizacion de 4 bits (estimacion estandar para Llama 3.1 8B).
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40/80 GB) son suficientes para inferencia en FP16; para cuantizacion 4-bit bastaria una GPU con 8-12 GB, como una RTX 3080 o RTX 4060 Ti.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con al menos 8 GB de VRAM usando cuantizacion.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan configuraciones especificas.
- Latencia y throughput: no se dispone de mediciones publicas para este modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicos. Existen otras variantes de la misma familia publicadas por el mismo autor, como `Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed4`, `Llama-3.1-8B-school-of-reward-hacks-kld-seed3`, `Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed5`, `Llama-3.1-8B-school-of-reward-hacks-sft-seed5` y `Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed3`. Todas parten del mismo checkpoint base y varian en la estrategia de entrenamiento (inoculation-prompting, KLD, SFT parcial o completo) y en la semilla aleatoria. Sin embargo, no se publican metricas que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No hay documentacion sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos introducidos durante el fine-tune.
- El modelo se anuncia solo en ingles; su rendimiento en otros idiomas no esta garantizado.
- No se han publicado evaluaciones de seguridad, alucinacion o robustez. Dado que el nombre sugiere experimentos con "reward hacks", podria presentar comportamientos inesperados en ciertos prompts.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental sin garantias, no se recomienda su uso en produccion sin una validacion exhaustiva.
- La fecha de creacion (2026-08-25) es posterior a la fecha actual, lo que sugiere que el modelo podria ser un artefacto de un proyecto futuro o un error en los metadatos; se recomienda verificar su disponibilidad real.
- No se proporcionan instrucciones de uso, prompts recomendados ni ejemplos de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed5
- Variante seed4: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed4
- Variante kld-seed3: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-kld-seed3
- Variante first-third-sft-seed5 (via FriendliAI): https://friendli.ai/models/localized-ft/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed5
- Variante sft-seed5 (via FriendliAI): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-sft-seed5
- Variante last-third-sft-seed3 (via free2aitools): https://free2aitools.com/model/localized-ft/llama-3.1-8b-school-of-reward-hacks-last-third-sft-seed3
