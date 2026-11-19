# Craigchaney/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-4GB es un modelo de lenguaje pequeno (SLM) desarrollado por NVIDIA como un post-entrenamiento adicional sobre Gemma-4-E4B-it de Google. Se distribuye como una cuantizacion Q4_K_M en formato GGUF dentro del ecosistema Nemotron 3.5, una familia de modelos abiertos con pesos, datos de entrenamiento y recetas publicadas. El objetivo declarado es ofrecer baja latencia (bajo TTFT) y bajo consumo de memoria para asistentes de voz locales, personas interactivas e interfaces embebidas en dispositivos.

El modelo cuenta con 7.518.069.290 parametros totales y 4B parametros efectivos, lo que sugiere una arquitectura de mezcla de expertos (MoE) o de activacion selectiva heredada de Gemma-4-E4B. Soporta una longitud de contexto de hasta 64K tokens tanto de entrada como de salida, y esta disenado para ejecutarse en llama.cpp con soporte opcional de decodificacion especulativa mediante un drafter DFlash complementario.

Su relevancia actual radica en la combinacion de un contexto amplio (64K), soporte multilingue en 33 idiomas y un peso de tan solo 4 GB en cuantizacion Q4_K_M, lo que lo hace desplegable en hardware de consumo y en entornos de borde donde otros modelos de contexto largo no caben. La licencia OpenMDW-1.1 permite uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4-E4B (post-entrenada por NVIDIA) |
| Parametros totales | 7.518.069.290 (~7.5B) |
| Parametros activos | 4B efectivos |
| Longitud de contexto | Entrada: hasta 64K tokens; salida: hasta 64K tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF); version BF16 disponible por separado |
| Idiomas soportados | en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh (33 idiomas) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (repo de 6.2 GB); safetensors disponibles en la version BF16 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma-4-E4B, un transformer con 4B parametros efectivos sobre 7.5B totales, lo que implica mecanismos de activacion selectiva (probablemente MoE o similar) que reducen el coste computacional por token. NVIDIA realizo un post-entrenamiento adicional sobre el modelo base Gemma-4-E4B-it, utilizando los datasets `nvidia/nemotron-post-training-v3` y `nvidia/nemotron-pre-training-datasets`. La fecha de corte de los datos de post-entrenamiento es mayo de 2026.

El post-entrenamiento se orienta a mejorar el uso de herramientas multi-turno, el seguimiento de instrucciones y el anclaje de entrada (input grounding), capacidades criticas para asistentes de voz y dispositivos. El modelo incorpora un modo de razonamiento controlable mediante la plantilla de chat (`enable_thinking=True/False`) con un presupuesto de pensamiento configurable en tiempo de ejecucion, asi como un modo conversacional (`conversational_mode=True/False`). Para acelerar la inferencia, NVIDIA proporciona un drafter DFlash que permite decodificacion especulativa con llama.cpp, con hasta 7 tokens de borrador por paso.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 64K tokens.
- Razonamiento controlable mediante modo thinking activable por plantilla de chat y presupuesto de tokens de pensamiento.
- Uso de herramientas (tool calling / function calling) multi-turno, mejorado respecto al modelo base.
- Seguimiento de instrucciones y anclaje de entrada (input grounding) para respuestas basadas en contexto proporcionado.
- Capacidades multilingues en 33 idiomas, incluyendo espanol, ingles, aleman, frances, japones, coreano, chino, arabe, hindi y la mayoria de lenguas europeas.
- Modo conversacional configurable para interacciones de persona o asistente.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`).
- No se menciona soporte de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Asistentes de voz locales: el modelo puede gestionar conversaciones multi-turno con baja latencia de primer token (TTFT) gracias a sus 4B parametros efectivos y su cuantizacion Q4_K_M, adecuado para ejecucion en dispositivos con recursos limitados.
- Interfaces embebidas y de borde: con solo 4 GB de pesos en Q4_K_M, cabe en GPUs de consumo y en hardware integrado, permitiendo asistentes en tiempo real sin conexion a la nube.
- Personas interactivas: el modo conversacional configurable (`conversational_mode=True/False`) permite ajustar el estilo de respuesta para personajes o asistentes con personalidad definida.
- Agentes con tool calling en local: el modelo soporta uso de herramientas multi-turno, lo que permite integrarlo en pipelines de agentes que consultan APIs, bases de datos o servicios externos desde un dispositivo local.
- Procesamiento de documentos largos: con 64K tokens de contexto de entrada, puede resumir, extraer informacion o responder preguntas sobre documentos extensos sin necesidad de fragmentacion.
- Atencion al cliente automatizada en dispositivos: conversaciones multi-turno con contexto largo y soporte de 33 idiomas para despliegues internacionales en hardware de bajo coste.
- Generacion de codigo asistida en entornos locales: aunque no es su enfoque principal, el modelo puede generar y explicar codigo en un entorno de desarrollo integrado con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB para la cuantizacion Q4_K_M (pesos de 4 GB mas overhead de contexto y KV cache). Con contexto de 64K tokens, la KV cache incrementa el uso de memoria de forma significativa.
- GPU recomendadas: NVIDIA A100, H100 para despliegues de alta concurrencia; RTX 4090, RTX 3090 para estaciones de trabajo; GPUs de consumo con 8 GB o mas de VRAM para uso individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, etc.) para la cuantizacion Q4_K_M con contextos moderados.
- Opciones de despliegue: llama.cpp (servidor CUDA, imagen `ghcr.io/ggml-org/llama.cpp:server-cuda13-b11459` segun la model card), con soporte de decodificacion especulativa mediante el drafter DFlash. No se mencionan vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El modelo esta disenado para bajo TTFT y bajo uso de memoria, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB | 7.5B totales / 4B efectivos | 64K | OpenMDW-1.1 | GGUF Q4_K_M | Post-entrenado sobre Gemma-4-E4B-it; orientado a asistentes locales |
| Gemma-4-E4B-it (modelo base) | 4B efectivos | no disponible en la informacion | Licencia de Google (no disponible) | safetensors | Modelo base sin el post-entrenamiento de NVIDIA |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | 7.5B totales / 4B efectivos | 64K | OpenMDW-1.1 | safetensors (BF16) | Version de precision completa del mismo modelo |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion incorrecta o inventada, especialmente en tareas de razonamiento complejo o con contexto ambiguo.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; el modelo hereda los sesgos del modelo base Gemma-4-E4B-it y de los datos de entrenamiento de NVIDIA.
- Limitaciones de contexto: aunque soporta 64K tokens, el rendimiento puede degradarse en contextos muy largos y el uso de memoria de la KV cache crece con la longitud del contexto.
- Limitaciones de idioma: aunque soporta 33 idiomas, no se especifica el nivel de competencia por idioma; el ingles es probablemente el idioma principal.
- Restricciones de licencia: la licencia OpenMDW-1.1 permite uso comercial y no comercial segun la model card, pero se recomienda revisar los terminos completos en el enlace oficial.
- Caveat para produccion: la model card indica que la receta de despliegue en llama.cpp esta "pendiente" (recipe pending), lo que sugiere que la integracion puede no estar completamente validada.
- El modelo esta disenado para asistentes locales y dispositivos embebidos; no se recomienda para tareas de razonamiento de alta complejidad o generacion de codigo en produccion sin validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Craigchaney/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Drafter DFlash: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Modelo base Gemma-4-E4B-it: https://huggingface.co/google/gemma-4-E4B-it
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Paper tecnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Blog: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Repositorio de la licencia OpenMDW: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- arXiv: 2509.04292
