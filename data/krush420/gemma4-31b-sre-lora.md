# krush420/gemma4-31b-sre-lora

## Resumen

`krush420/gemma4-31b-sre-lora` es un adaptador LoRA (entrenado con PEFT/TRL sobre QLoRA y SFT + DPO) que se aplica sobre el modelo base `google/gemma-4-31b-it`, un transformer denso de aproximadamente 30,7B parámetros activos. Lo desarrolla el usuario krush420 dentro del ecosistema KruschStack, un stack de herramientas MCP (39 herramientas en 7 pilares) orientado a operaciones SRE, auditoría de código y razonamiento agéntico. El adaptador no es un modelo autónomo: requiere cargar el base Gemma 4 31B y superponer los pesos LoRA (45.015.040 parámetros en safetensors, repo de 0,3 GB).

El objetivo declarado es mejorar el razonamiento multi-turno con memoria a largo plazo, la ejecución simulada de herramientas de aplicación y el tool-calling SRE, incluyendo un modo de razonamiento nativo mediante el canal `<|channel>thought`. El autor reporta el primer puesto entre modelos de pesos abiertos en DolphinBench (600 tareas, 1,5M de tokens), con un 57,33% de pass rate (344/600) bajo un juez `gpt-5.6-sol`, superando en 3,17 puntos porcentuales al Gemma 4 31B sin ajustar (54,17%).

La relevancia actual reside en su enfoque de bajo coste: el autor afirma que el adaptador, combinado con su harness de inferencia (Krusch Grounded Harness v0.3) y un almacén de memoria sin LLM (SovereignMemoryStore), alcanza esos resultados a coste de inferencia cero, compitiendo con stacks comerciales en la nube. La licencia es Apache-2.0 y el pipeline es text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Gemma 4 31B) con adaptador LoRA (PEFT) |
| Parametros totales | 45.015.040 parámetros en el adaptador safetensors; base de ~30,7B (100% activos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (mencionado en tags y en el quickstart con Ollama); QLoRA en entrenamiento |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) y GGUF (adapter.gguf / fusión offline) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `google/gemma-4-31b-it`, un transformer denso de ~30,7B parámetros. El ajuste combina dos etapas: un SFT con enmascaramiento de pérdida solo en el turno del asistente (`assistant-only <|channel>thought` loss masking), que preserva el formato de razonamiento nativo del canal de pensamiento, y una etapa de calibración de preferencias con `trl.DPOTrainer` anclada a un adaptador de referencia en BF16. El autor reporta una accuracy de preferencia del 100,0% en esa segunda etapa y un 81,56% de accuracy de tokens en el SFT de la etapa 1.

El entrenamiento incluye un currículo denominado Partial-Briefing Gap-Search, orientado a que el modelo busque información faltante en briefings incompletos, y se apoya en un dataset propio de 18.131+ registros SFT + DPO sin fuga de datos (`krush420/sovereign-code-audit-sft`). En inferencia se combina con el Krusch Grounded Harness v0.3 (39 herramientas MCP) y un almacén de memoria sin LLM. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni innovaciones de decodificación como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno con memoria a largo plazo simulada.
- Razonamiento nativo mediante el canal `<|channel>thought` (modo thinking).
- Tool calling / function calling en el marco de un harness MCP con 39 herramientas.
- Ejecución simulada de herramientas de aplicación y razonamiento agéntico multi-paso.
- Búsqueda de huecos de información en briefings parciales (Partial-Briefing Gap-Search).
- Auditoría de código y tareas SRE (el tag `sre` y el dataset de auditoría de código lo indican).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente multi-turno con memoria: el adaptador está entrenado explícitamente para retener contexto entre turnos y recuperar información de conversaciones largas, lo que lo hace adecuado para asistentes que deben recordar preferencias e historial del usuario.
- Agente SRE autónomo: integrado en el harness KruschStack, puede invocar herramientas de diagnóstico, consultar métricas y ejecutar comprobaciones mecánicas en pipelines de operaciones, aprovechando el tool-calling entrenado.
- Auditoría de código automatizada: el dataset de entrenamiento es de auditoría de código, por lo que el modelo puede revisar fragmentos, detectar problemas y generar informes estructurados dentro de un flujo de CI.
- Ejecución simulada de herramientas de aplicación: útil para entornos de prueba donde el agente debe simular llamadas a APIs y validar resultados antes de tocar sistemas reales.
- Razonamiento con briefings incompletos: en tareas donde la especificación llega parcial, el currículo Gap-Search entrena al modelo para identificar y solicitar la información que falta en lugar de alucinarla.
- Despliegue local de bajo coste: al ser un adaptador LoRA sobre un base de 31B con soporte GGUF y Ollama, permite montar un agente privado en hardware propio sin depender de APIs de pago.
- Destilación y generación de datos: el autor lo usa como harness de destilación (Jean SRE), por lo que puede emplearse para generar trazas y datos de entrenamiento de otros modelos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| DolphinBench (600 tareas, 3 personas, 1,5M tokens, juez `gpt-5.6-sol`) | Pass rate oficial | 57,33% (344/600) |
| DolphinBench | Comprobaciones mecánicas conjuntivas | 61,22% (835/1.364) |
| DolphinBench | Comprobaciones del juez semántico `gpt-5.6-sol` | 63,67% (354/556) |
| Sovereign Code Audit SFT + DPO | Accuracy de tokens SFT etapa 1 | 81,56% |
| Sovereign Code Audit SFT + DPO | Accuracy de preferencia DPO etapa 2 (BF16) | 100,0% |

Desglose por persona en DolphinBench reportado por el autor: Morgan 74,5% (149), Alex 51,5% (103), Riley 46,0% (92). El autor compara con Gemma 4 31B sin ajustar (54,17%) y afirma un Oracle@6 del 71,83% (431/600) frente al 70,67% de Mem0 en la nube. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB (45M de parámetros), pero requiere cargar el base Gemma 4 31B completo.
- VRAM estimada para el base en BF16: del orden de 60-62 GB (31B × 2 bytes), más overhead de activaciones y contexto.
- En cuantización de 8 bits: aproximadamente 31 GB; en 4 bits (GGUF Q4): aproximadamente 16-18 GB.
- GPU recomendadas: A100 80GB o H100 para BF16 sin cuantizar; RTX 4090 (24 GB) viable solo con cuantización de 4 bits y contexto moderado; GPUs de 48 GB (A6000, L40S) para 8 bits.
- Cabe en GPU de consumo (RTX 4090, 3090 de 24 GB) únicamente con GGUF Q4 y ventanas de contexto reducidas.
- Opciones de despliegue: Ollama (el repo incluye Modelfile y adapter.gguf con fusión offline), llama.cpp vía GGUF, vLLM y TGI para el base con el adaptador PEFT, y transformers + PEFT para carga directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DolphinBench (pass rate) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krush420/gemma4-31b-sre-lora | ~30,7B (adaptador 45M) | No disponible | 57,33% (344/600) | Apache-2.0 | Hugging Face (27 descargas) |
| google/gemma-4-31b-it (base) | ~30,7B | No disponible | 54,17% | No disponible en la información | Hugging Face |
| krush420/qwen3-coder-30b-sre-lora | 30B MoE (3,3B activos) | No disponible | 43,00% (258/600) | No disponible en la información | Hugging Face |
| krush420/gpt-oss-120b-sre-lora | 120B MoE (5,1B activos) | No disponible | 39,50% (237/600) | No disponible en la información | Hugging Face |

La comparativa se limita a los modelos del mismo autor citados en la model card; no se dispone de datos de benchmarks de alternativas externas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model-index).
- El adaptador no funciona de forma aislada: exige cargar el base `google/gemma-4-31b-it` y, para reproducir los resultados, el harness KruschStack v0.3 y el almacén de memoria propietario.
- El pass rate global del 57,33% implica que más del 40% de las tareas de DolphinBench fallan; el rendimiento por persona es muy desigual (Riley 46,0% frente a Morgan 74,5%).
- Riesgo de alucinación inherente a modelos generativos; el entrenamiento Gap-Search mitiga pero no elimina la invención de información en briefings incompletos.
- Idiomas soportados no documentados; no se garantiza calidad fuera del inglés.
- Longitud de contexto no especificada en la información disponible.
- Licencia Apache-2.0 declarada por el autor, pero el modelo base Gemma tiene sus propios términos de uso que deben respetarse para uso comercial.
- Modelo con 27 descargas y 0 likes: ecosistema muy pequeño, sin validación comunitaria ni soporte más allá del repositorio del autor.
- El despliegue en producción requiere hardware de gama alta (60+ GB en BF16) o cuantización agresiva con posible pérdida de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krush420/gemma4-31b-sre-lora
- README del modelo: https://huggingface.co/krush420/gemma4-31b-sre-lora/blob/main/README.md
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/krush420/sovereign-code-audit-sft
- Logs de benchmarks: https://huggingface.co/datasets/krush420/sovereign-g4-benchmarks
- Space de arena: https://huggingface.co/spaces/krush420/sovereign-router-arena
- Repositorio KruschStack: https://github.com/kruschdev/krusch-stack
- Jean SRE: https://github.com/kruschdev/Jean-SRE-by-kruschdev
- Modelo complementario Qwen3 Coder 30B: https://huggingface.co/krush420/qwen3-coder-30b-sre-lora
- Modelo complementario GPT-OSS 120B: https://huggingface.co/krush420/gpt-oss-120b-sre-lora
- Modelo complementario Llama3 Hermes3 8B: https://huggingface.co/krush420/llama3-hermes3-8b-sre-lora
