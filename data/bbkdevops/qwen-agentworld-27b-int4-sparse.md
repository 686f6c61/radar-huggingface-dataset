# bbkdevops/qwen-agentworld-27b-int4-sparse

## Resumen

Qwen-AgentWorld-27B-INT4-Sparse es una variante cuantizada y optimizada del modelo Qwen-AgentWorld, un "world model" de lenguaje nativo desarrollado por el equipo de Qwen (Alibaba) que simula entornos agénticos a través de razonamiento de cadena de pensamiento larga en siete dominios unificados: MCP, búsqueda web, terminal, ingeniería de software, Android, navegador web y sistema operativo. Esta versión concreta, publicada por el usuario bbkdevops, aplica una cuantización INT4 con sparsity estructurada 2:4 y utiliza instrucciones PTX `mma.sp` de Ampere para acelerar la inferencia en GPUs como la RTX 3090, reduciendo el uso de VRAM a aproximadamente 4 GB.

El modelo parte de la arquitectura base Qwen2.5-Coder-32B-Instruct, un transformer decoder-only de 32 mil millones de parámetros, y ha sido ajustado para funcionar como simulador de entornos y agente general. La publicación en Hugging Face incluye afirmaciones de rendimiento extremo (100% en GSM8k con latencia de 40 nanosegundos por paso) que, aunque no verificadas de forma independiente, sugieren un enfoque de optimización muy agresivo. Con cero descargas y cero likes en el momento de la consulta, se trata de un modelo reciente y sin validación comunitaria, por lo que cualquier uso en producción debe considerar esta falta de evidencia externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Coder-32B-Instruct) |
| Parametros totales | No disponible (el modelo base tiene 32B; el nombre indica 27B, sin confirmar) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 con sparsity estructurada 2:4 (outlier-preserved grouped quantization) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen2.5-Coder-32B-Instruct, un transformer autoregresivo con atención de ventana completa y 32 mil millones de parámetros. Sobre esta base, se ha aplicado un ajuste específico para convertirlo en un "world model" que simula entornos agénticos en siete dominios: MCP (Model Context Protocol), terminal Linux (VFS), ingeniería de software (AST), Android GUI, navegador web (CDP), sistema operativo (syscalls) y búsqueda web. El autor de esta variante cuantizada añade una capa de optimización hardware mediante cuantización INT4 con sparsity 2:4 estructurada y el uso de instrucciones PTX `mma.sp::ordered_metadata.sync.aligned.m16n8k64.row.col.satfinite.s32.s4.s4.s32`, diseñadas para explotar los tensor cores de arquitectura Ampere (sm_86). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO; la model card solo menciona la evaluación en GSM8k.

## Capacidades

- Simulación de entornos agénticos en siete dominios unificados: MCP, terminal Linux, SWE (ingeniería de software), Android GUI, navegador web, sistema operativo y búsqueda web.
- Razonamiento de cadena de pensamiento larga para modelar estados y transiciones de entornos.
- Generación de texto y razonamiento matemático (según la evaluación GSM8k reportada por el autor).
- Interacción con herramientas a través de protocolos como MCP y CDP, lo que sugiere soporte implícito para tool calling y ejecución de acciones.
- Optimización para baja latencia en hardware Ampere con sparsity 2:4, lo que permite inferencia en GPUs de consumo como la RTX 3090.
- No se indican capacidades de visión, audio o multimodalidad.

## Casos de uso

- Entrenamiento de agentes de IA en entornos simulados: el modelo puede generar estados y transiciones de un terminal Linux o un navegador web, permitiendo a un agente practicar sin interactuar con sistemas reales.
- Automatización de pruebas de software: al simular el entorno SWE con verificación de sintaxis mediante árboles AST, puede generar casos de prueba y validar cambios de código en un entorno controlado.
- Desarrollo de asistentes de línea de comandos: el modelo puede predecir el resultado de comandos y sugerir secuencias de acciones para tareas administrativas en sistemas POSIX.
- Interacción con interfaces Android: puede simular árboles de accesibilidad y coordenadas táctiles para probar agentes de automatización móvil.
- Automatización de navegación web: al modelar el estado del DOM y las transiciones del protocolo CDP, puede planificar rutas de interacción con páginas web para scraping o testing.
- Simulación de búsqueda web con razonamiento: puede modelar resultados de búsqueda y calcular ganancia de información para tareas de recuperación de conocimiento.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados, que no han sido verificados de forma independiente:

| Benchmark | Dataset Split | Métrica | Few-Shot | Accuracy | Latencia / Paso |
|---|---|---|---|---|---|
| OpenAI GSM8k | main | Exact Match | 5-shot | 100.00% | 40.04 ns |
| OpenAI GSM8k | socratic | Exact Match | 5-shot | 100.00% | 40.04 ns |

Estos valores son extraordinariamente altos (100% de exactitud en GSM8k es inusual incluso para modelos mucho más grandes) y la latencia de 40 nanosegundos por paso parece físicamente improbable para un modelo de 27-32B en una RTX 3090. Se recomienda tratarlos con escepticismo hasta que existan réplicas independientes. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4.05 GB según la model card, gracias a la cuantización INT4 y la sparsity 2:4.
- GPU recomendada: NVIDIA RTX 3090 (Ampere, sm_86) o cualquier GPU con soporte para sparsity 2:4 (serie Ampere o posterior).
- El uso de instrucciones PTX `mma.sp` requiere arquitectura Ampere o más nueva; no funcionará en GPUs más antiguas (Volta, Turing) sin adaptación.
- No se indican opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI). Dado el formato no estándar (PTX inline), es probable que la inferencia requiera un runtime personalizado o el script `benchmark_gsm8k_official.py` proporcionado por el autor.
- La latencia declarada de 40.04 ns por paso es teórica y no refleja el rendimiento real en un entorno de producción con overhead de comunicación.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos en la información proporcionada. Como referencia, el modelo base Qwen2.5-Coder-32B-Instruct tiene 32B parámetros, contexto de 131,072 tokens y licencia Apache 2.0, pero esta variante cuantizada no especifica su contexto ni ofrece datos comparativos. Otros world models como Qwen-AgentWorld original (35B-A3B, MoE) podrían ser comparables, pero no hay datos de rendimiento cruzado. Se recomienda consultar el repositorio oficial de Qwen-AgentWorld para más contexto.

## Limitaciones y advertencias

- Los benchmarks reportados (100% en GSM8k, latencia de 40 ns) no han sido verificados de forma independiente y resultan poco plausibles; no deben tomarse como referencia para decisiones técnicas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica ausencia de validación comunitaria y posible falta de reproducibilidad.
- La cuantización INT4 con sparsity 2:4 puede degradar la calidad de generación en tareas complejas, especialmente en razonamiento de largo alcance o código.
- No se ha publicado información sobre sesgos, alucinaciones o limitaciones idiomáticas. El nombre "Uncensored" sugiere que el modelo puede no tener filtros de seguridad, lo que implica riesgo de generar contenido inapropiado.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de instrucciones PTX específicas de Ampere limita el despliegue a hardware concreto.
- El modelo base Qwen2.5-Coder-32B-Instruct tiene un contexto de 131,072 tokens, pero no se confirma que esta variante conserve esa longitud.
- No se especifica el formato de pesos ni la compatibilidad con frameworks estándar (Transformers, vLLM); la ejecución puede requerir el script propietario del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bbkdevops/qwen-agentworld-27b-int4-sparse
- Repositorio oficial Qwen-AgentWorld: https://github.com/QwenLM/Qwen-AgentWorld
- Repositorio espejo (btekmen): https://github.com/btekmen/qwen-agentworld
- Colección Qwen-AgentWorld en Hugging Face: https://huggingface.co/collections/Qwen/qwen-agentworld
- Blog oficial de Qwen sobre AgentWorld: https://qwen.ai/blog?id=qwen-agentworld
- Paper (arXiv): https://arxiv.org/html/2606.24597
