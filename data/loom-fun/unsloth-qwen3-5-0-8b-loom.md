# loom-fun/unsloth-Qwen3.5-0.8B-loom

## Resumen

loom-fun/unsloth-Qwen3.5-0.8B-loom es un paquete de despliegue para el motor Loom (familia de herramientas `hrx-loom`/`hrx-system` del proyecto ROCm) construido sobre el checkpoint GGUF sin modificar `unsloth/Qwen3.5-0.8B-GGUF`, en concreto el fichero `Qwen3.5-0.8B-Q4_K_M.gguf`. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado (programas `.loom` y una tarjeta `model.json`) que permite servir el modelo base Qwen3.5-0.8B con el runtime Loom sobre GPUs AMD, específicamente validado en un Ryzen AI Max+ 395 "Strix Halo" (gfx1151).

El modelo subyacente pertenece a la familia Qwen3.5 de Alibaba, que según la documentación de Unsloth incluye modelos multimodales con razonamiento híbrido; la variante 0.8B es la más pequeña de la serie "Small". El paquete expone una API compatible con OpenAI (`/v1/chat/completions`), soporta entrada de imagen vía proyector `mmproj-F16.gguf`, tool calling, modo thinking opcional y decodificación especulativa por n-gram activada por defecto.

Su relevancia es práctica: demuestra que un modelo multimodal de 0.8B cuantizado en Q4_K_M puede servirse a velocidades competitivas con llama.cpp en hardware AMD integrado, con mejoras notables en prefill (hasta +67 % en documentos de 16k) a costa de menor throughput en decode y en concurrencia. Es un artefacto experimental (0 descargas, creado el 2026-11-07) orientado a validar el stack Loom, no a producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-0.8B; familia descrita por Unsloth como multimodal híbrida con razonamiento) |
| Parametros totales | 0,8B (según denominación del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por petición (según la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de visión en F16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) + proyector mmproj-F16.gguf; empaquetado como `.loom` con `model.json` |

## Arquitectura y entrenamiento

El paquete no define arquitectura propia: reutiliza el checkpoint GGUF de Qwen3.5-0.8B publicado por Unsloth. La documentación de Unsloth describe la familia Qwen3.5 como modelos multimodales con razonamiento híbrido (modo thinking activable), e incluye variantes MoE de mayor tamaño (35B-A3B, 122B-A10B, 397B-A17B) junto a la serie Small (0.8B, 2B, 4B, 9B). Para la variante 0.8B no se dispone en la información proporcionada de detalles sobre composición del dataset, número de tokens de entrenamiento ni si hubo RLHF/DPO.

La innovación técnica del artefacto está en el runtime: Loom genera kernels específicos para la GPU AMD (validados contra implementaciones de referencia, 55/55 tests) e incorpora decodificación especulativa por n-gram prompt lookup con profundidad 3, activada por defecto. En las mediciones, la tasa de aceptación de tokens redactados fue del 11 %, lo que se traduce en aproximadamente 1,33 tokens por pasada de verificación. El paquete incluye un proyector de visión F16 para entrada de imagen.

## Capacidades

- Generación de texto y razonamiento: modo thinking desactivado por defecto, activable con `chat_template_kwargs: {"enable_thinking": true}`; el "reasoning effort" no está soportado.
- Entrada de imagen (image-text-to-text): partes `image_url` en estilo OpenAI, con proyector `mmproj-F16.gguf`.
- Tool calling en estilo OpenAI: campos `tools` y `tool_calls`, con bucle multi-turno validado (gate `agent`).
- Decodificación especulativa n-gram (profundidad 3) activada por defecto, con salida idéntica a la decodificación sin especulación (gate `spec`).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de 4 peticiones simultáneas y límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- API compatible con OpenAI en `127.0.0.1:8080` (`/v1/chat/completions`).
- Sin soporte de audio (ni entrada ni salida).

## Casos de uso

- Servicio local de chat multimodal en estaciones de trabajo AMD: el paquete se sirve con `loom-serve --device=amdgpu` y expone una API OpenAI, lo que permite sustituir un endpoint remoto por inferencia local en hardware Strix Halo con contexto de hasta 262.144 tokens por petición.
- Procesamiento de documentos largos con imágenes: el prefill alcanza 8.773,8 tok/s en documentos de 16k y 6.108,8 tok/s en 32k (frente a 5.252,0 y 3.912,4 de llama.cpp), lo que lo hace adecuado para tareas de extracción o resumen sobre documentos extensos con figuras.
- Asistentes con tool calling: el gate `agent` valida el renderizado exacto del prompt, la reutilización de historial y la validez de las llamadas a herramientas, lo que permite integrarlo en flujos de agentes de múltiples pasos.
- Prototipado de pipelines RAG: el gate `needle` valida la recuperación de información hasta la mitad del contexto (needle-in-a-haystack), útil para evaluar la fiabilidad en contextos largos antes de desplegar.
- Validación y benchmarking de runtimes AMD: sirve como referencia reproducible para comparar Loom frente a llama.cpp en el mismo GGUF, con métricas de decode, prefill y concurrencia.
- Demostraciones de razonamiento con modo thinking en entornos con recursos limitados: al ser un modelo de 0,8B en Q4_K_M, cabe en memoria unificada de un SoC y permite experimentar con el modo de razonamiento sin GPU dedicada.
- Inferencia por lotes pequeños con 4 flujos concurrentes: útil para tareas de clasificación o generación en paralelo, aunque con menor throughput agregado que llama.cpp (277,3 frente a 530,8 tok/s).

## Benchmarks y rendimiento

Rendimiento medido en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0, el 2026-11-07, sobre el mismo GGUF en ambos motores:

| Métrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 189,2 | 166,5 | -12 % | 550,8 | 30 % |
| Decode tok/s, contexto 2k | 173,3 | 166,8 | -4 % | 526,0 | 32 % |
| Decode tok/s, contexto 32k | 140,9 | 107,8 | -23 % | 314,0 | 34 % |
| Prefill tok/s, documento 1k | 7.815,2 | 9.978,3 | +28 % | 57.804,0 | 17 % |
| Prefill tok/s, documento 2k | 7.670,9 | 10.304,3 | +34 % | 56.444,9 | 18 % |
| Prefill tok/s, documento 8k | 7.171,0 | 10.129,1 | +41 % | 49.466,7 | 20 % |
| Prefill tok/s, documento 16k | 5.252,0 | 8.773,8 | +67 % | 42.466,5 | 21 % |
| Prefill tok/s, documento 32k | 3.912,4 | 6.108,8 | +56 % | 33.098,7 | 18 % |
| 4 flujos, decode agregado tok/s | 530,8 | 277,3 | -48 % | 2.085,3 | 13 % |
| Decodificación especulativa, tokens aceptados | — | 11 % | — | n/a | n/a |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores son de rendimiento de inferencia, no de capacidad del modelo.

## Requisitos de hardware

- VRAM/memoria estimada: el ejemplo de arranque usa `--memory_bytes=8000000000` (8 GB) para el modelo Q4_K_M con proyector F16; en un SoC con memoria unificada como Strix Halo no se requiere VRAM dedicada.
- GPU validadas: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151). No hay datos de validación en otras GPU AMD ni en NVIDIA.
- GPU de consumo: cabe en hardware integrado AMD de gama alta (memoria unificada); no se dispone de datos para GPUs de consumo discretas.
- Despliegue: `hrx-loom` (pip `hrx-loom[hf]`), con `loom-fetch` para materializar el paquete y `loom-serve --device=amdgpu`. No se menciona soporte de vLLM, TGI, Ollama o llama.cpp para este paquete (llama.cpp se usa solo como referencia comparativa).
- Latencia y throughput: decode de 166,5 tok/s con prompt corto y 107,8 tok/s a 32k; prefill de 9.978,3 a 10.304,3 tok/s en documentos de 1k-2k; 277,3 tok/s agregados con 4 flujos. El roofline teórico del hardware es de 550,8 tok/s en decode, por lo que Loom alcanza entre el 30 % y el 34 % del límite.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loom-fun/unsloth-Qwen3.5-0.8B-loom | 0,8B (Q4_K_M) | 262.144 | 166,5 tok/s decode, 9.978,3 tok/s prefill (Strix Halo); sin benchmarks de calidad | no disponible | Hugging Face (0 descargas) |
| loom-fun/unsloth-Qwen3.5-4B-loom | 4B (según denominación) | no disponible | no disponible | no disponible | Hugging Face |
| unsloth/Qwen3.5-0.8B-GGUF (modelo base) | 0,8B | no disponible | no disponible | no disponible | Hugging Face |
| llama.cpp sobre el mismo GGUF | 0,8B (Q4_K_M) | 35.024 (config. de la prueba) | 189,2 tok/s decode, 7.815,2 tok/s prefill | no disponible | Referencia comparativa |

La comparativa se limita a variantes del mismo modelo base y al motor de referencia, ya que no se dispone de datos de benchmarks de calidad ni de modelos competidores en la misma categoría dentro de la información proporcionada.

## Limitaciones y advertencias

- Artefacto experimental: 0 descargas y 0 likes en el momento de la consulta; creado y actualizado el 2026-11-07. No hay evidencia de uso en producción.
- Licencia no disponible: no se puede confirmar el uso comercial del paquete ni del checkpoint base.
- Idiomas no disponibles: no se documenta cobertura multilingüe.
- Sin benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de alucinación o sesgos.
- Cobertura de validación incompleta: los gates `agent_think_off` y `needle_full` no tienen evidencia; `decision` no aplica. El contexto completo de 262.144 tokens no está validado con needle-in-a-haystack (solo hasta la mitad).
- Rendimiento inferior a llama.cpp en decode (-12 % a -23 %) y especialmente en concurrencia (-48 % con 4 flujos); la decodificación especulativa solo acepta el 11 % de los tokens redactados.
- Solo validado en AMD Ryzen AI Max+ 395 (gfx1151); no hay datos de otras GPU AMD ni NVIDIA.
- Límite de 4.096 tokens de salida por petición y de 4 peticiones concurrentes, lo que restringe casos de uso de generación larga o alto paralelismo.
- El modelo base de 0,8B tiene capacidad limitada de razonamiento y conocimiento factual; el riesgo de alucinación en tareas complejas es inherente a su tamaño.
- El nombre "Loom" puede confundirse con la plataforma de grabación de vídeo homónima; el proyecto relevante es `ROCm/hrx-system` y `loom-fun/loom-skills`.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-fun/unsloth-Qwen3.5-0.8B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Variante 4B del mismo autor: https://huggingface.co/loom-fun/unsloth-Qwen3.5-4B-loom
- Repositorio del motor Loom: https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecución de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-skills/actions/runs/42326829360
- Documentación de Unsloth sobre Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
