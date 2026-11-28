# DRUPEs/CherryPit-1.0-2B-GGUF

## Resumen

CherryPit-1.0-2B es un modelo de lenguaje causal de aproximadamente 2.000 millones de parametros desarrollado por DRUPEs (Dense Representation & Unified Parameter Encoding Systems) a partir de MiniCPM5-2B de OpenBMB. Se distribuye principalmente como un ajuste fino orientado a codigo, razonamiento y tool calling, manteniendo la misma arquitectura, tamano y velocidad que el modelo base, por lo que funciona como sustituto directo en infraestructuras ya montadas para MiniCPM5-2B.

El modelo emplea una arquitectura transformer estandar de tipo Llama con 381 tensores y una ventana de contexto de 128K tokens (131.072), lo que lo situa en la franja de modelos pequenos con contexto largo. Su interes practico esta en el rendimiento en generacion de codigo: mejora a su base en LiveCodeBench v6 (+1,9 puntos), MBPP+ (+3,2) y HumanEval (+1,2), con ganancias menores en matematicas y razonamiento, y un ligero retroceso en tareas de conocimiento general como MMLU-Pro y HellaSwag.

La relevancia actual viene de su formato de distribucion: la version GGUF incluye cuantizaciones desde F16 hasta IQ2_M, con un Q4_K_M de 1,45 GB que cabe en cualquier GPU de consumo y en CPU, y soporte nativo en llama.cpp, Ollama y LM Studio. La licencia Apache 2.0 y el soporte de tool calling mediante plantilla de chat integrada lo hacen apto para despliegues en produccion y entornos on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estandar tipo Llama (381 tensores) |
| Parametros totales | 2.516.756.480 (~2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (131.072) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q4_K_L, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_L, IQ2_M |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); bf16 safetensors en el repo base DRUPEs/CherryPit-1.0-2B |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso estandar de tipo Llama, heredada sin cambios estructurales de MiniCPM5-2B. El modelo conserva los 381 tensores del base, con una ventana de contexto de 131.072 tokens y pesos en bf16 en la version de precision completa. Al mantener arquitectura y tamano identicos, la velocidad de inferencia y los requisitos de memoria son equivalentes a los del modelo original.

El detalle del proceso de entrenamiento no esta publicado: el autor indica que el metodo completo se liberara cuando el modelo alcance 30.000 descargas o el 31 de octubre de 2026, lo que ocurra primero. La model card solo documenta que se trata de un ajuste fino sobre MiniCPM5-2B con mejoras concentradas en codigo y ganancias menores en matematicas y razonamiento. No se especifican volumen de tokens de entrenamiento, composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de plantilla de chat.
- Generacion de codigo con mejoras medibles frente al base en LiveCodeBench v6, MBPP+, HumanEval y HumanEval+.
- Razonamiento matematico basico (MATH-500) y razonamiento multi-paso (BBH en modo 0-shot CoT).
- Tool calling / function calling mediante la plantilla de chat integrada.
- Adecuado para flujos de agente simples gracias al soporte de tool calling y a la ventana de 128K tokens.
- Ejecucion on-device en CPU y GPU de consumo gracias a las cuantizaciones GGUF de menos de 2 GB.
- Capacidad multilingue limitada: el modelo esta entrenado y evaluado en ingles.
- No dispone de vision, audio ni modo thinking documentado en la informacion disponible.

## Casos de uso

- Autocompletado y generacion de codigo en IDE: con HumanEval en 90,9 y un Q4_K_M de 1,45 GB, puede ejecutarse localmente en el portatil del desarrollador y ofrecer sugerencias con baja latencia sin enviar codigo a un servicio externo.
- Asistente de refactorizacion en CLI: integrado mediante `llama-cli` o `llama-server`, el modelo puede procesar archivos completos gracias a los 128K tokens de contexto y proponer cambios sobre funciones o modulos extensos.
- Agente de CI/CD con tool calling: la plantilla de chat permite invocar herramientas (ejecutar tests, consultar repositorios, abrir issues) en pipelines automatizados, con la ventaja de que el modelo cabe en runners modestos.
- Chatbot de soporte tecnico en ingles: para documentacion de APIs y resolucion de dudas de programacion, el modelo mantiene conversaciones multi-turno con contexto largo y puede consultar documentacion mediante function calling.
- Prototipado rapido en entornos con recursos limitados: en una Raspberry Pi o en CPU sin GPU, la cuantizacion Q4_K_M (1,45 GB) permite desplegar un asistente de codigo funcional sin infraestructura dedicada.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede producir casos de prueba en Python y otros lenguajes, aprovechando su rendimiento en MBPP+ (65,1) para tareas de sintesis de codigo verificable.
- Filtrado y clasificacion de codigo en herramientas internas: con contexto de 128K puede analizar repositorios completos para tareas de revision estatica asistida o generacion de resumenes de cambios.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando con MiniCPM5-2B en el mismo harness, prompts y semillas, con thinking mode desactivado.

| Benchmark | Configuracion | MiniCPM5-2B | CherryPit-1.0-2B | Delta |
|---|---|---:|---:|---:|
| LiveCodeBench v6 (2025-01..04) | pass@1, media de 8, T=1.0 | 30,4 | 32,4 | +1,9 |
| LiveCodeBench v6 easy | pass@1 | 81,7 | 84,3 | +2,6 |
| LiveCodeBench v6 medium | pass@1 | 27,2 | 28,8 | +1,6 |
| LiveCodeBench v6 hard | pass@1 | 5,0 | 6,7 | +1,7 |
| MBPP+ (EvalPlus) | greedy | 61,9 | 65,1 | +3,2 |
| HumanEval | greedy | 89,6 | 90,9 | +1,2 |
| HumanEval+ | greedy | 85,4 | 86,0 | +0,6 |
| MATH-500 | greedy | 79,4 | 79,8 | +0,4 |
| BBH | 0-shot CoT | 77,8 | 78,4 | +0,6 |
| MMLU-Pro | answer-letter scoring | 35,0 | 34,8 | -0,2 |
| HotpotQA (distractor) | F1 | 55,1 | 54,7 | -0,4 |
| HellaSwag | acc_norm | 50,5 | 49,5 | -1,0 |

La longitud media de respuesta en LiveCodeBench se mantiene en aproximadamente 2.100 tokens por respuesta en ambos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q4_K_M ~1,45 GB de pesos mas overhead de contexto; Q6_K ~1,93 GB; Q8_0 ~2,50 GB; F16 ~4,69 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo es demasiado pequeno para aprovechar GPUs de datacenter, pero funciona en ellas sin problema.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas y en iGPU con memoria unificada suficiente. Tambien es viable en CPU pura con Q4_K_M.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/DRUPEs/CherryPit-1.0-2B-GGUF:Q4_K_M`), LM Studio. No se documenta soporte nativo en vLLM o TGI para este repositorio GGUF, aunque la version bf16 safetensors podria cargarse en esos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor afirma que la velocidad es identica a la del modelo base MiniCPM5-2B.
- Muestreo recomendado: temperature 1.0, top_p 0.95 (valores por defecto almacenados en el GGUF).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Codigo (HumanEval) | Licencia | Formato |
|---|---|---:|---:|---|---|
| CherryPit-1.0-2B | ~2,5B | 128K | 90,9 | Apache 2.0 | GGUF, safetensors |
| MiniCPM5-2B (base) | ~2B | 128K | 89,6 | no disponible en la informacion | safetensors |
| Qwen2.5-Coder-1.5B | ~1,5B | 32K | no disponible | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B | ~1,7B | 8K | no disponible | Apache 2.0 | safetensors, GGUF |

La comparacion directa con MiniCPM5-2B es la mas fiable porque procede del mismo harness. Frente a alternativas de tamano similar, CherryPit destaca por su contexto de 128K, muy superior al de Qwen2.5-Coder-1.5B (32K) y SmolLM2-1.7B (8K), y por su licencia Apache 2.0. No se dispone de datos de benchmarks cruzados con esos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de 2B: puede cometer errores factuales y generar codigo con bugs; es necesario revisar la salida antes de usarla en produccion.
- Las mejoras frente al base se concentran en codigo; en conocimiento general (MMLU-Pro, HellaSwag) y recuperacion (HotpotQA) el rendimiento es igual o ligeramente inferior.
- Entrenado y evaluado unicamente en ingles; el rendimiento en castellano no esta documentado.
- Las evaluaciones se realizaron con thinking mode desactivado; no hay datos sobre el comportamiento con razonamiento extendido.
- El metodo de entrenamiento no es publico hasta que se alcancen 30.000 descargas o el 31 de octubre de 2026, lo que limita la reproducibilidad.
- Las cuantizaciones Q2_K_L (+51% de perdida) e IQ2_M (+66%) degradan la calidad de forma severa y el autor recomienda evitarlas.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base MiniCPM5-2B, que no se detalla en la informacion disponible.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en tareas de conocimiento factual y contexto largo.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/DRUPEs/CherryPit-1.0-2B-GGUF
- Pesos de precision completa (bf16 safetensors): https://huggingface.co/DRUPEs/CherryPit-1.0-2B
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
