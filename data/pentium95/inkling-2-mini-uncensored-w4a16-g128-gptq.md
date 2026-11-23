# Pentium95/Inkling-2-Mini-Uncensored-W4A16-g128-gptq

## Resumen

Inkling-2-Mini-Uncensored-W4A16-g128-gptq es una recuantización INT4 GPTQ del modelo multimodal Inkling-2-Mini-Uncensored, publicado por el usuario Pentium95 bajo licencia Apache-2.0. El modelo base es una versión "abliterated" de Inkling-2-Mini, desarrollado por Thinking Machines Lab, a la que OpenUncensored eliminó los mecanismos de rechazo editando únicamente las 20 proyecciones de salida de atención. Esta recuantización reduce el peso en disco de aproximadamente 20 GB a 17 GB, con el objetivo explícito de que el modelo completo quepa en una única GPU Ampere de 24 GB, como la RTX 3090 o 3090 Ti.

El modelo tiene 26.770.847.232 parámetros totales según los pesos en safetensors y una arquitectura de mezcla de expertos (MoE) con componentes multimodales: torre de visión, un drafter especulativo denominado DSpark y controladores de bucle. La cuantización afecta exclusivamente a los expertos enrutados (capas 0-19 y 20-23), mientras que atención, LM head y embeddings se mantienen en bf16 en el checkpoint y se convierten a INT8 g128 en tiempo de carga mediante HyperInkling, el servidor personalizado del autor.

Su relevancia es doble: por un lado, demuestra que es posible servir un modelo MoE multimodal de ~27B parámetros con contexto de aproximadamente 274k tokens en hardware de consumo de gama alta de la generación Ampere; por otro, requiere un parche específico sobre vLLM (HyperInkling) porque el formato de expertos no es compatible con vLLM estándar. Es un proyecto personal sin compromiso de soporte, orientado a propietarios de RTX 3090/3090 Ti.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal con torre de visión, drafter especulativo DSpark y controladores de bucle (inkling2_loop) |
| Parametros totales | 26.770.847.232 |
| Parametros activos | no disponible |
| Longitud de contexto | ~274.000 tokens (con DSpark, 6 peticiones concurrentes y torre de visión en GPU) |
| Tipos de cuantizacion | INT4 GPTQ, grupo 128, asimétrico (expertos enrutados); bf16 en checkpoint para atención, LM head y embeddings, convertidos a INT8 g128 en carga; FP8 para KV cache (por defecto en HyperInkling) |
| Idiomas soportados | no disponible (la calibración incluye textos en inglés, italiano y código) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (packing AWQ para kernels Marlin) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos con capacidades multimodales (pipeline image-text-to-text). El modelo incorpora una torre de visión para procesar imágenes, un drafter especulativo llamado DSpark para decodificación especulativa y controladores de bucle que dan nombre al tag `inkling2_loop`. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset original y el proceso de alineación (RLHF/DPO) del modelo base no están disponibles en la información proporcionada.

La innovación técnica de este checkpoint concreto reside en la recuantización. El autor tomó los pesos desquantizados NVFP4 (capas 0-19) y MXFP8 (capas 20-23) del modelo fuente y aplicó GPTQ por experto con calibración de 338k tokens en dos rondas, usando datos públicos (hermes-function-calling-v1, docvqa-single-page-questions, Magicoder-Evol-Instruct-110K, Wikipedia en italiano y ultrachat_200k), con respuestas generadas por el propio modelo sin censura y capturando entradas de MoE y routing reales. Los expertos enrutados quedan en INT4 con grupo 128 asimétrico y packing AWQ para kernels Marlin; atención, LM head y embeddings permanecen en bf16 en el checkpoint y HyperInkling los convierte a INT8 g128 al cargar. La torre de visión, el drafter DSpark, routers, norms y controladores de bucle quedan sin cambios respecto al fuente. El proceso de abliteration del modelo base editó solo las 20 proyecciones de salida de atención.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (~274k tokens).
- Procesamiento de imágenes (image-text-to-text): descripción, respuesta a preguntas sobre documentos e imágenes.
- Razonamiento con modo explícito, soportado por el parser `--reasoning-parser inkling` del servidor.
- Tool calling / function calling, con parser dedicado `--tool-call-parser inkling` en el servidor compatible con OpenAI.
- Generación de código, incluyendo instrucciones de tipo Magicoder en la calibración.
- Capacidades multilingües parciales: la calibración incluye italiano además de inglés, aunque no se declara una lista oficial de idiomas.
- Decodificación especulativa mediante el drafter DSpark integrado.
- Comportamiento sin rechazos (uncensored/abliterated) por edición de las proyecciones de salida de atención del modelo base.

## Casos de uso

- Asistencia conversacional de contexto largo: con ~274k tokens de ventana, el modelo puede mantener conversaciones multi-turno con documentos extensos, historiales completos o bases de conocimiento inyectadas en el prompt sin truncar.
- Análisis de documentos e imágenes en local: la torre de visión permite responder preguntas sobre capturas, formularios o páginas escaneadas (docvqa está en la calibración), ejecutable en una sola RTX 3090 sin depender de APIs externas.
- Agentes con tool calling: el servidor OpenAI-compatible con parser de tool calls permite integrar el modelo en frameworks de agentes que necesiten llamar funciones, consultar APIs o ejecutar pasos multi-etapa.
- Generación de código en pipelines internos: su soporte de instrucciones de código (Magicoder-Evol-Instruct en calibración) y tool calling lo hacen apto para asistentes de programación autoalojados donde la privacidad del código es crítica.
- Investigación sobre alineación y abliteration: al ser una versión sin rechazos y con métricas de fidelidad publicadas (KL frente al fuente), sirve para estudiar el efecto de la edición de proyecciones de atención y de la cuantización sobre el comportamiento.
- Despliegue en hardware de consumo para prototipado: 17 GB en disco y ajuste en 24 GB de VRAM permiten probar un MoE multimodal de ~27B en una estación de trabajo con RTX 3090, sin clúster ni GPUs de datacenter.
- Evaluación de cuantización extrema: los datos de KL mediana (0,0025) y acuerdo top-1 (92,8%) frente al fuente permiten usar este checkpoint como referencia para estudiar el impacto de INT4 GPTQ en modelos MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente al modelo fuente, con teacher forcing sobre 22 transcripciones reservadas (imágenes, tool calls, código, italiano y chat):

| Configuracion | KL mediana | KL media | Acuerdo top-1 |
|---|---|---|---|
| Ruido entre ejecuciones (original contra sí mismo) | 0,0003 | 0,060 | 95,8% |
| Expertos INT4 GPTQ (este checkpoint) | 0,0025 | 0,111 | 92,8% |
| + atención, head y embeddings INT8, KV FP8 (por defecto en HyperInkling) | 0,0027 | 0,115 | 92,6% |

El autor indica que una sola ronda de calibración (166k tokens) dio 0,0026 de KL mediana, por lo que duplicar la calibración no produjo cambios medibles.

## Requisitos de hardware

- VRAM: el modelo está diseñado para caber en 24 GB (RTX 3090 / 3090 Ti) con ~274k tokens de contexto, 6 peticiones concurrentes y la torre de visión en GPU.
- GPU soportadas: exclusivamente RTX 3090 y RTX 3090 Ti (Ampere). El autor declara explícitamente que no hay soporte para otras generaciones ni multi-GPU.
- GPU de consumo: sí, en RTX 3090/3090 Ti; no se garantiza en otras consumer GPU.
- Despliegue: requiere HyperInkling (parche propio sobre vLLM); vLLM estándar no reconoce el formato de expertos. El servidor es compatible con OpenAI (`/v1`, modelo `inkling-2-mini`). Instalación mediante `scripts/wizard.py` y `docker compose up -d`.
- Almacenamiento: 17,2 GB de repositorio en disco.
- Latencia y throughput: no disponibles de forma numérica; el autor remite a la model card del checkpoint W4A16 original y al README de HyperInkling, indicando que son los mismos por compartir arquitectura, tamaños y kernels.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Inkling-2-Mini-Uncensored W4A16 GPTQ) | 26,77B | ~274k | INT4 GPTQ g128 + INT8 en carga | Apache-2.0 | Hugging Face, requiere HyperInkling |
| Pentium95/Inkling-2-Mini-W4A16-g128-gptq | no disponible | ~274k | INT4 GPTQ g128 | Apache-2.0 | Hugging Face, requiere HyperInkling |
| OpenUncensored/Inkling-2-Mini-Uncensored (fuente) | no disponible | no disponible | bf16 / NVFP4 / MXFP8 | Apache-2.0 | Hugging Face |
| thinkingmachines/Inkling-2-Mini (base original) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo entre estas variantes; la única comparación publicada es la fidelidad KL frente al modelo fuente recogida en la sección anterior.

## Limitaciones y advertencias

- Proyecto personal sin compromiso de soporte: el autor lo publica "por si ayuda a otros propietarios de 3090", sin garantías de mantenimiento.
- Hardware restringido: solo RTX 3090 y 3090 Ti; no hay soporte para otras generaciones de GPU ni para multi-GPU.
- Dependencia de software no estándar: necesita el parche HyperInkling; vLLM estándar no puede cargar el formato de expertos.
- Modelo "uncensored"/abliterated: se han eliminado los rechazos editando las proyecciones de salida de atención, lo que implica un mayor riesgo de generar contenido dañino, sesgado o inapropiado sin filtros. No es apto para aplicaciones orientadas al público sin moderación adicional.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad en la información disponible.
- Pérdida de calidad por cuantización: aunque pequeña (KL mediana 0,0025, acuerdo top-1 92,8%), existe una degradación medible frente al modelo fuente, especialmente en posiciones donde el ruido cambia el experto enrutado.
- Idiomas: no se declara una lista oficial de idiomas soportados; la calibración solo cubre inglés, italiano y código, por lo que el rendimiento en castellano u otros idiomas no está verificado.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el contenido generado por un modelo sin censura recae en el desplegador.
- Contexto efectivo: los ~274k tokens se alcanzan con una configuración concreta (DSpark, 6 peticiones, visión en GPU); reducir VRAM o peticiones concurrentes puede alterar esa cifra.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pentium95/Inkling-2-Mini-Uncensored-W4A16-g128-gptq
- Modelo base (sin cuantizar): https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo original de Thinking Machines Lab: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint W4A16 previo del mismo autor: https://huggingface.co/Pentium95/Inkling-2-Mini-W4A16-g128-gptq
- Servidor HyperInkling: https://github.com/Pento95/HyperInkling
- OpenUncensored: https://openuncensored.com/
- PR de soporte en vLLM: https://github.com/vllm-project/vllm/pull/69028
- PR de soporte Ampere en vLLM: https://github.com/vllm-project/vllm/pull/69165
- Enfoque de porting HyperQwen: https://github.com/syv-ai/HyperQwen
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
