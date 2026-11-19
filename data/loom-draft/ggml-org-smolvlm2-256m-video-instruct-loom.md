# loom-draft/ggml-org-SmolVLM2-256M-Video-Instruct-loom

## Resumen

SmolVLM2-256M-Video-Instruct es un modelo vision-language de muy pequeño tamaño (256 millones de parámetros) desarrollado originalmente por Hugging Face dentro de la familia SmolVLM2, diseñado para tareas de instrucción multimodal que incluyen comprensión de imágenes y vídeo. Esta ficha concreta documenta el paquete `loom-draft/ggml-org-SmolVLM2-256M-Video-Instruct-loom`, una distribución generada con la herramienta `loom-next` que empaqueta el checkpoint GGUF sin modificar `SmolVLM2-256M-Video-Instruct-Q4_K_M.gguf` en formato de programas `.loom` para su ejecución en GPUs AMD (Ryzen AI Max+ 395 "Strix Halo" gfx1151 y Radeon AI PRO R9700 gfx1201).

El paquete no es un modelo nuevo: es un artefacto de despliegue que traduce los pesos GGUF a kernels y programas específicos para el runtime Loom de AMD, con una API compatible con OpenAI (`/v1/chat/completions`). Está pensado para desarrolladores que quieran servir el modelo en hardware AMD con el stack ROCm/Loom en lugar de llama.cpp.

Es relevante por su tamaño extremadamente reducido (apto para GPUs de consumo y sistemas integrados) y por ser un ejemplo temprano de empaquetado Loom para modelos multimodales. Conviene señalar que, según la propia model card, el soporte de entrada de imagen no está implementado en Loom para este paquete, aunque el modelo upstream sí lo soporta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base SmolVLM2; transformers vision-language, detalles no especificados en la información proporcionada) |
| Parámetros totales | 256M (según nombre del modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en programas `.loom` y `weights.loom`; incluye `tokenizer.json` y `llm_config.json` |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base SmolVLM2-256M-Video-Instruct ni sus datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). Se sabe que pertenece a la familia SmolVLM2 de Hugging Face, orientada a instrucción multimodal con soporte de vídeo e imagen, y que el checkpoint empaquetado es la variante cuantizada Q4_K_M en formato GGUF.

El artefacto Loom añade una capa de compilación: `loom-next` genera programas `.loom` (kernels) y un `model.json` que describe el preset de ejecución, con opciones como `--pool_backing=fixed` (memoria preasignada), `--parameter_mode=preload` (carga de pesos en host) y `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU). No se documentan innovaciones de entrenamiento propias de este paquete, ya que los pesos no se han modificado respecto al GGUF original.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Soporte de contexto de hasta 8.192 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de salida de 4.096 tokens (preset `max_tokens`).
- Entrada de imagen: no soportada por Loom en este paquete (el modelo upstream sí la soporta).
- Tool calling / function calling: no aplicable según la model card.
- Razonamiento / thinking mode: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada/salida de audio: no aplicable.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la model card.

## Casos de uso

- Despliegue de un asistente conversacional ligero en GPUs AMD Strix Halo o R9700: el paquete se sirve con `loom-serve` y expone una API OpenAI, lo que permite integrarlo en aplicaciones existentes sin adaptadores adicionales.
- Prototipado rápido en hardware integrado AMD: con solo 256M de parámetros y cuantización Q4_K_M, el modelo cabe holgadamente en la memoria unificada de un Ryzen AI Max+ 395, lo que facilita pruebas de concepto en equipos compactos.
- Evaluación comparativa del runtime Loom frente a llama.cpp: la model card incluye gates de corrección (`golden`, `compare`, `consistency`, `logits`, etc.) pensados para verificar equivalencia token a token con la referencia de llama.cpp sobre el mismo GGUF.
- Servicio de chat de bajo coste en entornos con 4 peticiones concurrentes: útil para demos, herramientas internas o asistentes embebidos donde el throughput no es crítico.
- Benchmarking de kernels generados para gfx1151 y gfx1201: el paquete permite validar el rendimiento y la corrección de los kernels `.loom` generados por `loom-next` en arquitecturas AMD concretas.
- Base para experimentación con modelos VLM pequeños: al ser Apache 2.0 y de tamaño reducido, sirve como punto de partida para fine-tuning o para estudiar el pipeline de empaquetado Loom antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para este paquete "no se han vuelto a medir" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todos los gates de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 256M de parámetros en Q4_K_M el peso de los pesos ronda el orden de cientos de MB, por lo que cabe en cualquier GPU moderna con varios GB de memoria.
- GPUs objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo en la información proporcionada; el paquete está orientado a las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles (las mediciones figuran como no realizadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLM2-256M-Video-Instruct (este paquete Loom) | 256M | 8.192 tokens | Apache 2.0 | Hugging Face (loom-draft) |
| SmolVLM2-256M-Video-Instruct-GGUF (upstream) | 256M | no disponible en la información | Apache 2.0 | Hugging Face (ggml-org) |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El paquete no soporta entrada de imagen en Loom, aunque el modelo upstream sí; esto limita su uso a texto puro en este runtime.
- No se han registrado mediciones de rendimiento ni de corrección para este paquete en ninguna de las dos GPUs objetivo, por lo que no hay evidencia publicada de equivalencia con llama.cpp.
- El estado del muestreo (temperature, top_k, seed) figura como "no determinado".
- Tool calling, razonamiento y decodificación especulativa no están soportados.
- Con 256M de parámetros, la calidad de generación y el conocimiento factual serán limitados en comparación con modelos de mayor tamaño; riesgo elevado de alucinación en tareas abiertas.
- No se documentan sesgos conocidos ni cobertura idiomática; los idiomas soportados figuran como no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base upstream y de los componentes generados por Loom.
- El paquete depende de la versión `hrx-loom[hf]==0.2.0` y de las plataformas AMD gfx1151 y gfx1201; no se garantiza funcionamiento en otras GPUs.
- La model card está truncada en la información proporcionada (la sección de archivos no finaliza), por lo que podrían existir detalles adicionales no recogidos aquí.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ggml-org-SmolVLM2-256M-Video-Instruct-loom
- Modelo base GGUF: https://huggingface.co/ggml-org/SmolVLM2-256M-Video-Instruct-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
