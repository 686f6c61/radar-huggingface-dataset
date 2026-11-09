# FrostWolfAI/LFM3-1.7B-abliterated

## Resumen

LFM3-1.7B-abliterated es una variante "abliterated" (decensurada) del modelo LiquidAI/LFM3-1.7B, desarrollado por Liquid AI y modificado por FrostWolfAI Labs mediante la herramienta Heretic v2 (ARA). El proceso elimina la dirección de rechazo del flujo residual en las 24 capas del modelo, reduciendo las negativas ante peticiones dañinas de 91/100 en el modelo base a 1/100 en esta versión, con una divergencia KL de 0.0555 respecto a los pesos originales.

El modelo conserva la arquitectura tri-híbrida propietaria de LFM3, una ventana de contexto de 256K tokens, modo de razonamiento (`<think>…</think>`) activado por defecto y soporte nativo de tool calling en formato XML. Con 1.728.801.536 parámetros en BF16, está orientado a despliegue en el borde y en local, y cubre 16 idiomas, entre ellos el castellano.

Es relevante para investigadores de seguridad, equipos de red teaming y desarrolladores que necesitan un modelo pequeño, reproducible y sin rechazos para pruebas offline. No es un modelo de propósito general recomendado para producción orientada al usuario final, dado que su comportamiento de seguridad ha sido deliberadamente eliminado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido propietario `lfm3` (custom code) |
| Parámetros totales | 1.728.801.536 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | BF16 (pesos publicados); GGUF en repo separado |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (`lfm1.0`, etiquetada como `other`) |
| Formato de pesos | safetensors (BF16); GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura tri-híbrida de LFM3 de Liquid AI, que combina capas de atención con otros mecanismos de secuencia (el detalle exacto de la composición no se especifica en la información disponible). Requiere `trust_remote_code=True` porque `lfm3` es una arquitectura personalizada no incluida de forma nativa en Transformers. El modelo base fue entrenado por Liquid AI; esta variante no ha sido fine-tuneada con datos downstream, sino que parte de los pesos del base y aplica una ablación de la dirección de rechazo.

La modificación se realizó con Heretic 2.1.0 usando el modificador ARA (Arbitrary-Rank Ablation), con búsqueda Optuna TPE de 120 trials y semilla `2026110901`. Se ablacionaron los componentes `attn.o_proj` (24 capas) y `mlp.down_proj` / `feed_forward.w2` (24 capas), es decir, las 24 capas completas. Los parámetros ARA seleccionados fueron: capas 9–15, `preserve_good=0.8503`, `steer_bad=8.05e-4`, `overcorrect=0.8733`, `neighbors=15`. El trial elegido alcanza 1/100 rechazos con KL 0.0555 frente al base. Los parámetros de reproducción, puntuaciones, hashes y entorno están en `reproduce/reproduce.json`.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Modo de razonamiento (`<think>…</think>`) activado por defecto; se puede desactivar con `enable_thinking=False` en `apply_chat_template`.
- Tool calling / function calling nativo en formato XML de LFM3; los `arguments` de la llamada deben pasarse como dict, no como string JSON.
- Capacidades agénticas y de razonamiento multi-paso (etiquetas `agentic` y `reasoning`).
- Multilingüe en 16 idiomas, incluido el castellano.
- Comportamiento sin rechazos (decensurado): responde a peticiones que un modelo alineado declinaría.
- Orientado a ejecución en el borde y en local (on-device, local-llm).

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo sirve como sujeto de prueba para medir la eficacia de filtros, clasificadores de contenido y políticas de moderación antes de desplegarlas en producción.
- Investigación sobre alineación y ablación: permite reproducir y comparar el efecto de distintas técnicas de abliteración (Heretic/ARA) sobre un mismo modelo base, con parámetros y hashes documentados.
- Pruebas de robustez de guardarraíles: al carecer de rechazos, se usa para generar prompts adversarios y validar que las capas de seguridad externas (no el modelo) bloquean contenido dañino.
- Asistente local offline para profesionales: con 1,7B parámetros y contexto de 256K, puede desplegarse en portátiles o estaciones de trabajo sin conexión para tareas de análisis de documentos largos.
- Automatización agéntica con tool calling: integrable en pipelines que requieran llamadas a funciones y razonamiento multi-paso en un modelo pequeño y de baja latencia.
- Procesamiento multilingüe en el borde: clasificación, resumen o extracción sobre textos en castellano, inglés, árabe, chino y otros 12 idiomas en dispositivos con recursos limitados.
- Evaluación comparativa de cuantizaciones: la versión GGUF permite medir la degradación de capacidades y de comportamiento entre BF16 y cuantizaciones de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas del proceso de abliteración: rechazos 1/100 (frente a 91/100 del base) y divergencia KL de 0.0555. No se aportan datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones de capacidad.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto.
- VRAM estimada con cuantización GGUF (Q4): del orden de 1 a 1,5 GB para pesos; el consumo real depende de la cuantización concreta y del contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 (RTX 3060/4060, RTX 4090, A100, H100). En consumer GPU cabe con holgura; en GPUs de 4–6 GB conviene usar GGUF.
- Despliegue: Transformers con `trust_remote_code=True` (obligatorio por la arquitectura `lfm3`); llama.cpp reciente con soporte `lfm3` para los GGUF; vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-abliterated | 1,73B | 256K | LFM Open License v1.0 | Variante decensurada, tool calling, thinking mode |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | LFM Open License v1.0 | Modelo base alineado; rechaza 91/100 del probe set |
| Alternativas de ~1–2B abliteradas | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (abliterated de ~1–2B) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo ha eliminado deliberadamente su comportamiento de rechazo: responderá a peticiones que un modelo alineado declinaría. No es apto para exposición directa a usuarios finales sin capas de seguridad externas.
- Riesgo elevado de generar contenido dañino, sesgado o inseguro; la responsabilidad de uso recae en el operador.
- Riesgo de alucinación inherente a un modelo de 1,7B; no se han publicado evaluaciones de factualidad.
- La ablación puede degradar capacidades de forma colateral; la model card reporta KL 0.0555, pero no se aportan benchmarks de capacidad que lo confirmen.
- Licencia LFM Open License v1.0: es necesario revisar `LICENSE` para conocer las restricciones de uso comercial, que no se detallan en la información disponible.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de usarlo en entornos sensibles.
- El soporte GGUF exige una build reciente de llama.cpp con soporte `lfm3`; versiones antiguas no cargarán el modelo.
- La fecha de creación del repositorio (2026-11-09) y el estado (0 descargas, 0 likes) indican que es una publicación reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrostWolfAI/LFM3-1.7B-abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF: https://huggingface.co/FrostWolfAI/LFM3-1.7B-abliterated-GGUF
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Parámetros de reproducción: `reproduce/reproduce.json` (en el repositorio del modelo)
- Licencia: `LICENSE` (en el repositorio del modelo)
