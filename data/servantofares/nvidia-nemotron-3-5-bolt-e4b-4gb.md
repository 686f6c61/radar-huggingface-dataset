# servantofares/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-4GB es una versión cuantizada (Q4_K_M, en formato GGUF) del modelo NVIDIA-Nemotron-3.5-Bolt-E4B, un modelo lingüístico pequeño (SLM) desarrollado por NVIDIA a partir de Gemma-4-E4B-it de Google. Está diseñado para operar en entornos con poca memoria y baja latencia de primer token (TTFT), orientado a asistentes locales de voz y de dispositivo, personas interactivas e interfaces embebidas en el borde (edge).

El modelo conserva las capacidades conversacionales de Gemma y las mejora en tres frentes: uso de herramientas en conversaciones multi-turno, seguimiento de instrucciones y grounding de la entrada. Incorpora un modo de razonamiento controlable mediante la plantilla de chat (`enable_thinking=True/False`) con presupuesto de "thinking" ajustable en tiempo de ejecución, además de un modo conversacional dedicado.

Esta ficha corresponde concretamente al repositorio cuantizado de terceros publicado por el usuario `servantofares` en Hugging Face (6,2 GB en formato GGUF Q4_K_M), basado en el modelo oficial `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`. NVIDIA lo acompaña de un "drafter" DFlash para decodificación especulativa, lo que permite acelerar la inferencia manteniendo la calidad de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4-E4B (MoE) |
| Parametros totales | 7.518.069.290 (dato safetensors; la model card indica 8B) |
| Parametros activos | 4B efectivos (MoE) |
| Longitud de contexto | Hasta 64K tokens de entrada y 64K de salida |
| Tipos de cuantizacion | Q4_K_M (esta variante); BF16 disponible en el modelo base oficial |
| Idiomas soportados | 35 idiomas: en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | GGUF (esta variante); safetensors en el modelo base BF16 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma-4-E4B, un diseño de mezcla de expertos (MoE) con 8B de parametros totales de los que solo unos 4B se activan por token. Esto permite combinar la capacidad de un modelo de 8B con el coste computacional de uno de 4B, un equilibrio especialmente adecuado para inferencia local y en dispositivos con recursos limitados.

NVIDIA lo sometio a un post-entrenamiento adicional sobre el modelo Gemma-4-E4B-it, utilizando los datasets abiertos `nvidia/nemotron-post-training-v3` y `nvidia/nemotron-pre-training-datasets`. El corte temporal de los datos de post-entrenamiento es de mayo de 2026. El entrenamiento se centra en multi-turno con herramientas, seguimiento de instrucciones y grounding. Como innovacion destacable, NVIDIA publica junto al modelo un drafter DFlash para decodificacion especulativa en llama.cpp, que reduce el TTFT y aumenta el throughput. No se ha publicado detalle sobre el uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno con calidad heredada de Gemma-4.
- Uso de herramientas (tool calling / function calling) en conversaciones multi-turno, foco explicito del post-entrenamiento.
- Modo de razonamiento conmutable via plantilla de chat (`enable_thinking=True/False`) con presupuesto de thinking ajustable en runtime.
- Modo conversacional dedicado (`conversational_mode=True/False`) para asistentes rapidos sin razonamiento.
- Seguimiento de instrucciones y grounding de la entrada (respuestas ancladas al contexto proporcionado).
- Soporte multilingue en 35 idiomas, incluido el castellano.
- Entrada y salida exclusivamente de texto (sin vision ni audio nativos).
- Compatibilidad con decodificacion especulativa mediante el drafter DFlash acompanante.

## Casos de uso

- Asistentes de voz locales: su diseno para baja latencia de primer token y bajo consumo de memoria lo hace adecuado para pipelines de voz en dispositivos, respondiendo rapido tras la transcripcion.
- Interfaces embebidas y edge: con 6,2 GB en Q4_K_M cabe en portatiles y mini-PC, dejando margen para el resto de la aplicacion.
- Agentes con herramientas en dispositivo: el multi-turno con tool calling permite construir agentes que consultan APIs o ejecutan funciones locales sin depender de la nube.
- Personas interactivas: el modo conversacional dedicado y el control de thinking permiten alternar entre respuestas rapidas y razonamiento profundo segun la escena.
- Chatbots multilingues: cobertura de 35 idiomas para atencion al usuario en entornos internacionales, incluido castellano.
- Automatizacion en local con privacidad: al ejecutarse 100% en local, es util para procesar conversaciones o documentos sensibles sin enviar datos a servicios externos.
- Prototipado rapido de agentes: la licencia abierta y el despliegue con llama.cpp facilitan pruebas de concepto con servidor compatible con la API de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 6-7 GB para el GGUF Q4_K_M (6,2 GB de pesos mas KV cache), mas 2-3 GB adicionales si se carga el drafter DFlash en BF16.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060 Ti, RTX 4070) es suficiente para la variante cuantizada con contexto moderado; para contextos de 64K completos conviene una GPU de 12-16 GB (RTX 4080/4090) o descargar capas a CPU.
- Consumer GPU: si cabe en GPUs de consumo de 8 GB; tambien es viable en CPU pura o Apple Silicon con al menos 8 GB de memoria unificada, dada la activacion efectiva de 4B parametros.
- Despliegue: llama.cpp (server oficial documentado en la model card, con imagen Docker `ghcr.io/ggml-org/llama.cpp:server-cuda13`), con soporte de decodificacion especulativa DFlash (`--spec-type draft-dflash`). No se menciona soporte verificado para vLLM, TGI u Ollama; la model card indica "recipe pending" para otros despliegues.
- Latencia y throughput: no se han publicado cifras concretas; el objetivo declarado del modelo es minimizar el TTFT y la huella de memoria.

## Comparativa con modelos similares

| Caracteristica | Nemotron-3.5-Bolt-E4B (Q4_K_M) | Gemma-4-E4B-it (base) | Qwen3-4B (referencia de categoria) |
|---|---|---|---|
| Parametros totales | 7,5B (8B declarados) | 8B | 4B |
| Parametros activos | 4B efectivos | 4B efectivos | 4B (denso) |
| Contexto | 64K entrada / 64K salida | no disponible | 32K-128K segun version |
| Thinking mode | Si, con presupuesto ajustable | no disponible | Si |
| Tool calling multi-turno | Si (foco del post-entrenamiento) | Si | Si |
| Licencia | OpenMDW-1.1 | Licencia Gemma | Apache 2.0 |
| Drafter especulativo | DFlash oficial | no disponible | no disponible |

Nota: los datos de Qwen3-4B y de Gemma-4-E4B-it se ofrecen como contexto de categoria; para decisiones de adopcion conviene verificar las cifras en sus fichas oficiales.

## Limitaciones y advertencias

- Entrada y salida solo de texto: no incorpora vision ni audio, pese a orientarse a asistentes de voz (requiere un STT/TTS externo).
- Al ser un MoE de 4B activos y un SLM, su capacidad de razonamiento y conocimiento factual es inferior a la de modelos grandes; cabe esperar alucinaciones en preguntas de conocimiento extenso.
- El repositorio es una cuantizacion de terceros (`servantofares`), no oficial de NVIDIA; la calidad de la cuantizacion no esta verificada por NVIDIA y la model card oficial remite al repo `nvidia/...`.
- La receta de despliegue en llama.cpp figura como "pending" en la model card, y no hay soporte documentado para vLLM u Ollama.
- Riesgo de sesgo heredado de los datos de pre-entrenamiento y post-entrenamiento; NVIDIA no detalla evaluaciones de sesgo en la informacion disponible.
- La licencia OpenMDW-1.1 permite uso comercial, pero es una licencia distinta de Apache/MIT; conviene revisar sus terminos concretos antes de integrar en producto.
- Muestreo recomendado: temperatura 1.0 y top_p 0.95 en ambos modos de thinking; desviarse de estos valores puede degradar la calidad de salida.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/servantofares/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Modelo base oficial BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Drafter DFlash para decodificacion especulativa: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Modelo Gemma base: https://huggingface.co/google/gemma-4-E4B-it
- Pagina de desarrolladores Nemotron: https://developer.nvidia.com/nemotron
- Informe tecnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Blog del modelo: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Paper citado en tags: https://arxiv.org/abs/2509.04292
- Datasets de entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3 y https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
