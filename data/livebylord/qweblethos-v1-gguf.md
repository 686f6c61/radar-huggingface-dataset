# livebylord/Qweblethos-v1-GGUF

## Resumen

Qweblethos v1 es un ajuste fino de tipo LoRA sobre el modelo base Qwen/Qwen3.8-27B, publicado por el usuario livebylord en formato GGUF cuantizado Q4_K_M. El modelo está orientado a flujos de trabajo de agente de codificación, uso de herramientas multi-paso, depuración y verificación de código. Se distribuye como un archivo GGUF v3 de 15,41 GiB, pensado para ejecutarse con llama.cpp y aplicaciones compatibles.

El ajuste se realizó mediante destilación de trayectorias (supervised fine-tuning) sobre 6.471 ejemplos de trazas de razonamiento y uso de herramientas del dataset Fable 5, con una sola época de entrenamiento en una NVIDIA B200. El resultado es un modelo denso de aproximadamente 26,9 mil millones de parámetros, con una ventana de contexto de entrenamiento de 16.384 tokens. No incluye capacidades de visión ni MTP (multi-token prediction) en esta exportación de solo texto.

La relevancia de este modelo radica en su especialización para tareas de agente de codificación, ofreciendo una alternativa local y cuantizada para entornos de desarrollo que requieren razonamiento multi-paso y llamadas a herramientas, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (contexto de entrenamiento y recomendado) |
| Tipos de cuantizacion | Q4_K_M (GGUF v3) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Mixta (Apache-2.0 para base, AGPL-3.0 y CC BY 4.0 para datos) |
| Formato de pesos | GGUF v3 (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer del modelo Qwen3.8-27B, que es un modelo denso de 27.516.112.112 parámetros en su versión original. El ajuste fino se realizó mediante LoRA con rango 32, alpha 32 y dropout 0, entrenando únicamente 159.383.552 parámetros (aproximadamente el 0,58% del total). El entrenamiento se llevó a cabo durante una época, con 809 pasos de optimización, un tamaño de lote efectivo de 8 y una tasa de aprendizaje de 8e-5, sobre un contexto máximo de 16.384 tokens. Se utilizó una sola GPU NVIDIA B200 durante unas 2 horas.

El proceso de entrenamiento consistió en destilación de trayectorias (response/trajectory distillation) mediante supervisión fina sobre trazas sintéticas de agentes de codificación. Los datos provienen de dos conjuntos: `lordx64/agentic-distill-fable-5-sft` (4.392 ejemplos) y `greghavens/fable-5-coding-and-debugging-traces` (2.079 ejemplos), ambos derivados de Fable-5-traces. El pipeline de preparación eliminó duplicados, filtró muestras inválidas o demasiado largas, excluyó ruido de servicio/meta, convirtió las llamadas a herramientas al formato nativo de Qwen3.8 y supervisó únicamente los tokens de asistente. No se trata de destilación a nivel de logits ni de una reproducción del modelo profesor.

## Capacidades

- Generacion de texto y razonamiento multi-paso, especialmente en tareas de codificacion y depuracion.
- Uso de herramientas (tool calling) en formato nativo Qwen3.8, compatible con el chat template de llama.cpp.
- Flujos de agente de codificacion: inspeccion de repositorios, correccion de errores, generacion de pruebas.
- Verificacion orientada a resultados: el modelo tiende a explicar la causa de un fallo y proponer soluciones con pruebas.
- Soporte de contexto largo de 16.384 tokens, adecuado para trazas de ejecucion y codigo extenso.
- Capacidad multilingue limitada: la model card indica solo ingles, aunque el base podria soportar otros idiomas, no se garantiza.

## Casos de uso

- Asistente de depuracion en entornos de desarrollo: el modelo puede recibir un fragmento de codigo con un error, explicar la causa raiz y sugerir una correccion con pruebas asociadas, gracias a su entrenamiento en trayectorias de debugging.
- Agente de codificacion autonomo: integrable en pipelines de CI/CD para revisar cambios, ejecutar pruebas y proponer parches, usando su capacidad de tool calling para interactuar con el sistema de archivos o ejecutar comandos.
- Generacion de pruebas unitarias: a partir de una funcion o modulo, el modelo puede redactar casos de prueba enfocados, basandose en su entrenamiento en verificacion y test-driven fixes.
- Inspeccion de repositorios: con su contexto de 16.384 tokens, puede analizar multiples archivos o trazas de ejecucion para identificar problemas de integracion.
- Servidor local compatible con OpenAI: mediante llama-server, se puede desplegar como endpoint local para herramientas de desarrollo que requieran un LLM de codificacion sin conexion.
- Experimentacion en investigacion: util para estudiar el efecto de la destilacion de trayectorias en modelos de 27B cuantizados, comparando con el base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks independientes (SWE-bench, LiveCodeBench, Terminal-Bench, etc.) en la informacion disponible. La model card solo reporta la evaluacion sobre 128 ejemplos held-out, comparando el modelo base y el adaptador entrenado:

| Variante | Loss | Perplejidad |
| --- | ---: | ---: |
| Base Qwen3.8-27B | 0,7328 | 2,0808 |
| Base + Qweblethos LoRA | 0,4634 | 1,5895 |

La reduccion relativa de loss es del 36,76%, lo que indica que el adaptador aprendio la distribucion de los datos de entrenamiento, pero no demuestra mejora en benchmarks de codificacion independientes. No se aportan metricas de latencia ni throughput.

## Requisitos de hardware

- Tamano del archivo GGUF: 15,41 GiB (16.547.399.872 bytes).
- VRAM estimada para inferencia: al menos 16 GB para cargar el modelo completo en GPU (Q4_K_M). Con 24 GB (RTX 3090/4090) cabe holgadamente.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100, o cualquier GPU con 16 GB o mas de VRAM. GPUs con menos VRAM pueden usar offload parcial de capas.
- Ejecucion en CPU: posible con 32 GB de RAM o mas (24 GB es marginal). Se puede usar llama.cpp con compilacion para CPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, o cualquier runtime compatible con GGUF. Tambien se puede servir con OpenAI-compatible API mediante llama-server.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
| --- | --- | --- | --- | --- | --- |
| Qweblethos v1 (este) | 26,9B (GGUF) | 16.384 | Mixta | GGUF Q4_K_M | Agente de codificacion, tool use |
| Qwen3.8-27B (base) | 27,5B | No especificado (probablemente 32K+) | Apache-2.0 | Safetensors, GGUF | Modelo general, chat, codigo |
| Otros fine-tunes de Qwen3.8-27B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros fine-tunes de Qwen3.8-27B en la documentacion proporcionada. La comparacion principal es con el modelo base, del cual se diferencia por su especializacion en tareas de agente de codificacion y su formato cuantizado listo para llama.cpp.

## Limitaciones y advertencias

- La distribucion de entrenamiento es estrecha y muy centrada en trazas de agentes de codificacion; el chat general, la calidad multilingue, la vision y otros dominios de razonamiento pueden sufrir regresiones respecto al modelo base.
- El modelo puede alucinar comandos, archivos, resultados de pruebas o salidas de herramientas. Las acciones generadas deben tratarse como no confiables y revisarse antes de ejecutarse.
- El formato de llamada a herramientas depende del runtime y de la implementacion del chat template; puede requerir ajustes segun el entorno.
- La cuantizacion Q4_K_M puede reducir la calidad en comparacion con el checkpoint BF16 fusionado.
- La licencia es mixta: el base es Apache-2.0, pero los datasets de entrenamiento incluyen material AGPL-3.0 y CC BY 4.0. Es necesario revisar `LICENSE_NOTICE.md` antes de redistribuir o usar comercialmente.
- No se han realizado benchmarks independientes completos; solo se reporta una comparacion de loss y perplejidad en un conjunto held-out de 128 ejemplos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/livebylord/Qweblethos-v1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset `lordx64/agentic-distill-fable-5-sft`: https://huggingface.co/datasets/lordx64/agentic-distill-fable-5-sft
- Dataset `greghavens/fable-5-coding-and-debugging-traces`: https://huggingface.co/datasets/greghavens/fable-5-coding-and-debugging-traces
- Dataset original `Glint-Research/Fable-5-traces`: https://huggingface.co/datasets/Glint-Research/Fable-5-traces
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
