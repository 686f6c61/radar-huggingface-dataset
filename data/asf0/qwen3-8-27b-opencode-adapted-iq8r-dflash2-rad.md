# asf0/Qwen3.8-27B-opencode-adapted-IQ8R-DFlash2-rad

## Resumen

Qwen3.8-27B-opencode-adapted-IQ8R-DFlash2-rad es un artefacto de inferencia publicado por el usuario asf0 que empaqueta, en un único contenedor `.rad`, el modelo Qwen/Qwen3.8-27B con el adaptador LoRA de agente OpenCode de harness-hub ya fusionado, cuantizado a int8 con la receta IQ8R (W8A8) e integrando el drafter de decodificación especulativa DFlash2 de z-lab. No es un modelo nuevo entrenado desde cero, sino una distribución optimizada para el motor de inferencia radiance 2.2.0 sobre GPUs AMD RDNA4 con ROCm.

El objetivo es claro: ofrecer un checkpoint listo para servir en producción con un agente de codificación (OpenCode) sobre hardware AMD, con pesos int8, cabecera de salida int8, caché KV int8 y decodificación especulativa incorporada. El contenedor ocupa 28,76 GiB y el repositorio completo 30,9 GB, lo que lo sitúa en el rango de dos GPUs de 32 GB como las Radeon AI PRO R9700 empleadas en las pruebas del autor.

La relevancia actual reside en dos frentes: por un lado, demuestra un flujo completo de fusión de LoRA, cuantización post-entrenamiento sin datos de calibración y despliegue en un stack no-CUDA; por otro, publica resultados de Terminal-Bench 2.1 con el agente OpenCode que comparan el adaptador frente al modelo base, con ganancias medibles en tareas agénticas cuando se desactiva el modo thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B) con drafter de difusión por bloques DFlash2 para decodificación especulativa |
| Parametros totales | 27B (según denominación del modelo base; no se detalla desglose en la información disponible) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 131.072 tokens (configuración de servicio probada) |
| Tipos de cuantizacion | IQ8R por redondeo al más cercano (RTN): lineales del tronco en int8 con escala u8 por fila y escala bf16 cada 256 de K, rotación Hadamard cada 128 de K; activaciones int8 (W8A8); lm_head int8; drafter con codebook de 4 bits; caché KV int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor `.rad` (radiance), pesos fuente en bf16 fusionados y cuantizados; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El contenedor parte de Qwen/Qwen3.8-27B, un transformer denso de 27B parámetros. Sobre él se fusiona el adaptador LoRA de harness-hub/Qwen3.8-27B-opencode-adapted (256 pesos LoRA, con un cambio relativo máximo de 0,0026 respecto al base en bf16), entrenado específicamente para el agente OpenCode con el modo thinking desactivado. La fusión se realiza antes de la cuantización porque la rotación Hadamard de IQ8R impide aplicar el adaptador en tiempo de ejecución.

La cuantización emplea la receta `q38-27b-iq8r-rtn.recipe` sin datos de calibración: cada capa lineal del tronco se cuantiza a int8 con escala u8 por fila y una escala bf16 cada 256 elementos de K, aplicando una rotación Hadamard cada 128 de K para reducir valores atípicos; las activaciones también son int8 (W8A8) y la `lm_head` se mantiene en int8. Adicionalmente se integra el drafter z-lab/Qwen3.8-27B-DFlash2, un modelo de difusión por bloques con codebook de 4 bits que actúa como especulador en la decodificación. El proceso completo se ejecuta con `rad-export` y `rad-convert` del motor radiance.

No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card original de Qwen3.8-27B, no incluida aquí.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.8-27B.
- Ejecución de tareas agénticas de codificación mediante el agente OpenCode, con soporte de tool calling a través de la API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`).
- Razonamiento multi-paso en entornos de terminal: resolución de tareas de Terminal-Bench 2.1 con presupuesto de una hora por tarea.
- Modo thinking conmutable por petición (`reasoning_effort` o `chat_template_kwargs.reasoning_effort`), aunque el adaptador fue entrenado con thinking desactivado.
- Decodificación especulativa integrada mediante el drafter DFlash2, con codebook de 4 bits.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no disponible en la información proporcionada.

## Casos de uso

- Agente de codificación autónomo en terminal: el contenedor está entrenado y evaluado con OpenCode sobre Terminal-Bench 2.1, resolviendo tareas de depuración, edición de ficheros y ejecución de comandos con un presupuesto de una hora por tarea y contexto de 131K tokens.
- Automatización de pipelines de CI/CD con corrección de errores: el soporte de tool calling y la API compatible con OpenAI permiten integrarlo como paso de agente que inspecciona logs, aplica parches y vuelve a lanzar tests.
- Asistencia a desarrolladores en IDE o CLI: al estar adaptado para thinking off, responde con menos tokens de salida (mediana de 44% menos en tareas resueltas por ambos modelos), lo que reduce coste y latencia en entornos interactivos.
- Despliegue en infraestructura AMD: es una de las pocas distribuciones listas para ROCm y RDNA4 con cuantización int8 y decodificación especulativa, útil en clústeres con Radeon AI PRO R9700 o hardware equivalente.
- Servicio multi-usuario con contexto largo: la configuración de referencia admite 8 secuencias simultáneas con 131K tokens de contexto y caché KV int8, adecuada para plataformas internas de asistencia técnica con historiales extensos.
- Evaluación comparativa de adaptadores: sirve como artefacto reproducible para medir el efecto de un LoRA de agente frente al modelo base bajo la misma receta de cuantización y el mismo motor.

## Benchmarks y rendimiento

Terminal-Bench 2.1 (agente OpenCode 2.2.7, web search off, 87 tareas puntuadas de 89, una ejecución por configuración, 24-25 de noviembre de 2026, 2× Radeon AI PRO R9700, contexto 131.072, temperatura 0,8, top-p 1,0):

| Configuracion | Resueltas (de 87) | Facil (4) | Medio (53) | Dificil (30) | Tokens de salida | Tokens procesados |
|---|---|---|---|---|---|---|
| Qwen3.8-27B stock, thinking off | 40 (46%) | 2 | 33 | 5 | 3,30M | 533M |
| OpenCode adapter, thinking off | 49 (56%) | 4 | 38 | 7 | 2,20M | 190M |
| ThinkingCap + OpenCode adapter, thinking off | 47 (54%) | 3 | 34 | 10 | 1,93M | 219M |
| Qwen3.8-27B stock, xhigh | 56 (64%) | 2 | 40 | 14 | 4,44M | 167M |
| ThinkingCap + OpenCode adapter, xhigh | 58 (67%) | 4 | 41 | 13 | 3,44M | 147M |

Pruebas pareadas con McNemar exacto reportadas por el autor: activar thinking lleva al stock de 40 a 56 tareas (p = 0,005) y a ThinkingCap + adaptador de 47 a 58 (p = 0,04); el adaptador con thinking off logra 49 frente a 40 del stock (p = 0,12, no significativo); con thinking on, ThinkingCap + adaptador y stock empatan (58 frente a 56, p = 0,75) pero el fine-tune escribe una mediana de 44% menos de salida en las tareas resueltas por ambos.

QualityBench quick (décima parte fija de cada tarea, thinking off, precisión en %):

| Tarea | Stock (GPTQ), off | Stock (RTN), off | OpenCode adapter, off |
|---|---|---|---|
| GSM8K (132) | 97,7 | 97,7 | 97,7 |
| IFEval (55) | 87,3 | 90,9 | 85,5 |
| MMLU-Pro (100) | 82,0 | 77,0 | 82,0 |
| HumanEval (17) | 94,1 | 94,1 | 94,1 |
| MBPP (38) | 81,6 | 81,6 | 81,6 |
| BFCL (40) | 90,0 | 90,0 | 85,0 |
| LiveCodeBench v6 (18) | 50,0 | 61,1 | 55,6 |

El autor indica que ninguna tarea difiere del stock más de lo que permite su intervalo de confianza del 95% (la comprobación T5 de QualityBench pasa 7/7).

## Requisitos de hardware

- VRAM estimada: el contenedor pesa 28,76 GiB en disco; en inferencia hay que sumar la caché KV int8 para 131.072 tokens y hasta 8 secuencias, por lo que se recomienda un mínimo de 2 GPUs de 32 GB.
- GPU recomendadas: 2× AMD Radeon AI PRO R9700 (configuración validada por el autor, tensor parallel 2); hardware AMD RDNA4 con ROCm en general. No se documenta soporte para A100, H100 ni RTX 4090 en la información disponible.
- Cabe en GPU de consumo: no disponible; el motor radiance 2.2.0 está orientado a RDNA4 y ROCm, y el tamaño del contenedor más la caché KV hace improbable su ajuste en GPUs de consumo de 24 GB sin reducir contexto o secuencias.
- Opciones de despliegue: motor radiance 2.2.0 con fichero `radiance.yaml` (`tp: 2`, `max-model-len: 131072`, `max-num-seqs: 8`, `kv-cache-dtype: i8`, `reasoning-effort: none`); expone API compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de latencia ni tokens por segundo; los únicos datos de rendimiento son los recuentos de tokens de salida y procesados por configuración en Terminal-Bench 2.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Rendimiento agéntico |
|---|---|---|---|---|---|
| Este contenedor (adaptador + IQ8R + DFlash2) | 27B | 131.072 | Apache-2.0 | `.rad` / radiance, ROCm RDNA4 | 49/87 en Terminal-Bench 2.1 (thinking off) |
| Qwen/Qwen3.8-27B stock (RTN IQ8R + DFlash2) | 27B | 131.072 | Apache-2.0 | `.rad` / radiance | 40/87 (thinking off); 56/87 (xhigh) |
| ThinkingCap + OpenCode adapter (misma receta) | 27B | 131.072 | Apache-2.0 | `.rad` / radiance | 47/87 (thinking off); 58/87 (xhigh) |
| harness-hub/Qwen3.8-27B-opencode-adapted (LoRA sin fusionar) | 27B | no disponible | Apache-2.0 | safetensors (adaptador LoRA) | Ganancias reportadas en su propia model card, no detalladas aquí |

No se dispone de comparación con modelos de otros fabricantes o arquitecturas en la información proporcionada.

## Limitaciones y advertencias

- Un solo contenedor y una sola ejecución por configuración en Terminal-Bench 2.1: el propio autor advierte que diferencias de pocas tareas pueden deberse al azar; la mejora del adaptador con thinking off no alcanza significación estadística (p = 0,12).
- El adaptador fue entrenado con thinking desactivado; usarlo con thinking on puede degradar el comportamiento esperado, aunque los resultados con xhigh son competitivos.
- En QualityBench quick el adaptador baja frente al stock en IFEval (85,5 frente a 87,3-90,9) y BFCL (85,0 frente a 90,0), y en LiveCodeBench v6 queda por debajo del stock RTN (55,6 frente a 61,1); son señales de posible regresión en instrucciones y tool calling.
- La cuantización IQ8R RTN no usa datos de calibración, lo que puede introducir degradación en capas sensibles frente a métodos con calibración (el stock GPTQ obtiene 82,0 en MMLU-Pro frente a 77,0 del RTN).
- El formato `.rad` es propietario del motor radiance: no es portable a vLLM, llama.cpp, TGI ni Ollama, y depende de ROCm y RDNA4, lo que limita su uso a infraestructura AMD.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni lista de idiomas soportados; deben asumirse los del modelo base Qwen3.8-27B.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del adaptador originales, así como el fichero `LICENSE` incluido en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de los resultados reportados por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/asf0/Qwen3.8-27B-opencode-adapted-IQ8R-DFlash2-rad
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador OpenCode: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
