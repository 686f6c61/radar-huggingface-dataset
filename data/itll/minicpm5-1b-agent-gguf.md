# ITLL/MiniCPM5-1B-Agent-GGUF

## Resumen

MiniCPM5-1B-Agent-GGUF es una versión cuantizada en formato GGUF de MiniCPM5-1B-Agent, un ajuste fino completo del modelo base openbmb/MiniCPM5-1B (checkpoint RL+OPD tras cuatro iteraciones, aproximadamente seis días de entrenamiento). Lo desarrolla el usuario ITLL y su objetivo es convertir un modelo de 1.080 millones de parámetros en un agente de programación capaz de razonar dentro de etiquetas `<think>`, invocar un conjunto reducido de herramientas (`bash`, `read`, `write`, `edit`, `glob`, `grep`) y ejecutar el ciclo completo de ejecutar, leer la salida, depurar, aplicar un parche y verificar. La propuesta central es que todo ese bucle funcione en una CPU gratuita, sin GPU.

El modelo parte de una base "abliterated" de MiniCPM5-1B y se entrena mediante SFT completo sobre una mezcla de 26 conjuntos de datos orientados a código, agentes y trazas de terminal, seguido de un paso de DPO generado on-policy. El resultado se distribuye en GGUF (f16 y Q8_0) para servir en llama.cpp, con licencia Apache 2.0 y pesos derivados del modelo base de OpenBMB. Es relevante ahora porque demuestra que un modelo de apenas mil millones de parámetros, con el ajuste adecuado, puede sostener flujos de agente de código en hardware de consumo.

El repositorio ocupa 5,2 GB y no registra descargas ni interacciones en el momento de redactar esta ficha. La información disponible sobre benchmarks, contexto nativo y detalles de arquitectura del modelo base es limitada, por lo que varios campos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de openbmb/MiniCPM5-1B; detalles no disponibles) |
| Parámetros totales | 1.080.632.832 (1,08 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa `max_len` de 24.576 tokens) |
| Tipos de cuantización | GGUF f16 y Q8_0 (publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en) y código |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors disponibles en el modelo base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) del checkpoint abliterated de openbmb/MiniCPM5-1B, que a su vez proviene de un proceso de RL más OPD a lo largo de cuatro iteraciones. El pipeline de entrenamiento consta de tres fases. Primero, la construcción de datos: se parte de un backbone de 42.224 filas y se añaden unas 3.538 filas curadas, con filtros de vocabulario servido, eliminación de trazas no terminantes o demasiado largas, y deduplicación MinHash con conciencia de solución, hasta alcanzar 45.762 filas en `train_v4.jsonl`. La mezcla combina 26 datasets, entre ellos Nemotron-SFT-OpenCode-v1 (11.995 filas), Nemotron-SFT-SWE-v2 (6.995), Nemotron-Terminal-Corpus (5.995), hermes-agent-reasoning-traces (4.995) y trazas reales de Claude-Code y DataClaw.

La segunda fase es el SFT completo a una época, con batch size 1, acumulación de 24, learning rate 1e-5, longitud máxima de 24.576 tokens y uso de Liger fused CE más SDPA eficiente en memoria; el ajuste completo cabe en menos de 18 GB de VRAM. La tercera fase genera pares DPO on-policy: se ejecuta el modelo SFT sobre los prompts de entrenamiento y se captura su propio comportamiento, tomando como elegida una llamada de herramienta `<function>` válida y como rechazada su fallo real (divagación en `<think>` o respuesta en prosa sin llamada). Se obtienen unas 649 parejas y se aplica DPO completo con beta 0,1, learning rate 1e-6, tres épocas y acumulación de 8, con el modelo SFT como referencia. La conversión final a GGUF se realiza con `convert_hf_to_gguf.py` de llama.cpp.

## Capacidades

- Generación de texto y razonamiento explícito dentro de etiquetas `<think>` antes de actuar.
- Llamada a un conjunto reducido de herramientas: `bash`, `read`, `write`, `edit`, `glob` y `grep`.
- Ejecución de bucles de agente de varios pasos: ejecutar, leer la salida, depurar, aplicar parche y verificar.
- Generación y edición de código, con soporte para tareas de reparación de software (SWE) y programación competitiva.
- Uso de terminal y comandos de shell como parte del flujo de trabajo.
- Capacidad de ejecutarse íntegramente en CPU, gracias a los pesos GGUF f16 y Q8_0.
- Soporte de tool calling y function calling en el formato entrenado.
- Multilingüismo limitado: inglés y código; otros idiomas no están declarados.
- No se declaran capacidades de visión, audio ni modo de pensamiento extendido más allá de `<think>`.

## Casos de uso

- Agente de código en local sobre CPU: el modelo puede ejecutar el ciclo completo de leer un repositorio, proponer un parche con `edit`, ejecutar pruebas con `bash` y verificar el resultado, sin necesidad de GPU, lo que lo hace adecuado para entornos de desarrollo con hardware modesto.
- Automatización de tareas de terminal: gracias a su entrenamiento con Nemotron-Terminal-Corpus, puede interpretar la salida de comandos, corregir errores y encadenar instrucciones de shell en scripts de mantenimiento.
- Reparación de bugs en repositorios reales: el ajuste sobre Nemotron-SFT-SWE-v2 y trazas de OpenHands le permite localizar archivos con `glob` y `grep`, inspeccionar con `read` y aplicar cambios con `edit` en flujos tipo SWE-bench.
- Asistente de programación integrado en pipelines de CI/CD: al soportar tool calling y un formato de agente estable, puede conectarse a un orquestador que le pase contexto de fallos de build y le pida parches verificables.
- Prototipado de agentes en investigación: su tamaño de 1,08 mil millones de parámetros y su licencia Apache 2.0 permiten experimentar con trazas de razonamiento y DPO on-policy sin grandes presupuestos de cómputo.
- Despliegue en dispositivos de borde o entornos sin GPU: los GGUF Q8_0 y f16 permiten servir el modelo con llama.cpp en portátiles o servidores de CPU, útil para demos y herramientas internas.
- Generación de código en tareas de programación competitiva: su entrenamiento con Nemotron-SFT-Competitive-Programming-v2 y OpenCodeReasoning le permite razonar y producir código ejecutable para problemas algorítmicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el entrenamiento completo cabe en menos de 18 GB de VRAM; la inferencia en GPU requeriría aproximadamente 2,2 GB en f16 y 1,1 GB en Q8_0 solo para pesos, más overhead de contexto.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con 4 GB o más podría alojar los pesos en f16, y una RTX 4090 o A100 permitiría contexto largo y mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4 GB para f16 y 2 GB para Q8_0, aunque el contexto de 24.576 tokens aumenta el consumo de memoria KV.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y potencialmente TGI o vLLM si se convierten los pesos; el autor menciona `text-generation-inference` y `unsloth` como etiquetas.
- Latencia y throughput: no disponibles. El autor destaca que el bucle completo funciona en CPU, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| ITLL/MiniCPM5-1B-Agent-GGUF | 1,08 mil millones | No disponible | Apache 2.0 | GGUF | Agente de código en CPU |
| openbmb/MiniCPM5-1B | 1,08 mil millones | No disponible | No disponible | safetensors | Modelo base generalista |
| Qwen2.5-Coder-1.5B | 1,5 mil millones | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Código generalista |
| SmolLM2-1.7B | 1,7 mil millones | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Texto generalista |

La comparación directa con alternativas es limitada porque no hay benchmarks publicados para este ajuste. Frente al modelo base, la diferencia es el entrenamiento específico para agentes y el formato GGUF listo para CPU. Frente a Qwen2.5-Coder-1.5B y SmolLM2-1.7B, este modelo es más pequeño y está especializado en bucles de agente con herramientas, aunque carece de datos públicos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas de código y agente es desconocido.
- El modelo solo declara inglés y código; el rendimiento en castellano u otros idiomas no está garantizado.
- La longitud de contexto nativa no está documentada; el entrenamiento usa 24.576 tokens, pero el contexto efectivo en inferencia puede variar.
- Riesgo de alucinación inherente a un modelo de 1,08 mil millones de parámetros, especialmente en razonamientos largos o tareas fuera de distribución.
- El conjunto de herramientas está limitado a seis funciones; tareas que requieran otras APIs no están cubiertas sin ajuste adicional.
- El repositorio no registra descargas ni validación de la comunidad, lo que reduce la confianza en la reproducibilidad y calidad del ajuste.
- Aunque la licencia es Apache 2.0, los pesos derivan de un modelo base cuyos términos deben verificarse antes de uso comercial.
- El pipeline de reproducción requiere 26 datasets, un entorno CUDA con PyTorch cu128 y liger-kernel, y llama.cpp, por lo que no es un proceso de un solo comando.

## Enlaces

- Hugging Face: https://huggingface.co/ITLL/MiniCPM5-1B-Agent-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Nemotron-SFT-OpenCode-v1: https://huggingface.co/datasets/nvidia/Nemotron-SFT-OpenCode-v1
- Nemotron-SFT-SWE-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-SWE-v2
- Nemotron-Terminal-Corpus: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
- hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
