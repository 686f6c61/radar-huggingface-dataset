# loom-draft/LiquidAI-LFM2.5-350M-loom

## Resumen

LFM2.5-350M-loom es un paquete de despliegue para la plataforma Loom de AMD, generado a partir del checkpoint GGUF sin modificar `LiquidAI/LFM2.5-350M-GGUF` (cuantización Q4_K_M). No se trata de un modelo nuevo entrenado por el autor, sino de una reempaquetadura del modelo base de LiquidAI en formato `.loom`: programas generados y una tarjeta `model.json` que permiten servirlo mediante `loom-serve` sobre GPUs AMD concretas. El autor es `loom-draft` y el paquete se generó con la herramienta `loom-next` sin intervención de un LLM en el bucle.

El interés del artefacto es operativo, no de modelado: ofrece un endpoint compatible con la API de OpenAI (`/v1/chat/completions`) para un modelo de 350M parámetros ejecutándose en hardware AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB), sin depender de llama.cpp. El modelo base es un transformer de 350M parámetros con una ventana de contexto declarada de 128.000 tokens por petición, 4 peticiones concurrentes y un máximo de 4.096 tokens de salida según el preset.

La relevancia es acotada: el paquete tiene 0 descargas y 0 likes en el momento de la consulta, y las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, etc.) figuran como "not yet re-measured" para ambas GPUs. Es, por tanto, un artefacto experimental de la infraestructura Loom más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI LFM2.5-350M; el paquete no describe la arquitectura interna) |
| Parámetros totales | 350M (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens por petición |
| Tipos de cuantización | Q4_K_M (única incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones concretas no disponibles) |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) |
| Concurrencia | 4 peticiones simultáneas |
| Máximo de tokens de salida | 4.096 (preset `max_tokens`) |
| Tool calling | no aplicable según la tarjeta |
| Razonamiento / thinking | no aplicable según la tarjeta |
| Decodificación especulativa | no aplicable según la tarjeta |
| Entrada de imagen / audio | no aplicable según la tarjeta |
| Muestreo | no determinado |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura del modelo base más allá de su nombre y tamaño (350M parámetros). La tarjeta se centra en el artefacto de despliegue: programas Loom generados por `loom-next` a partir del GGUF `LFM2.5-350M-Q4_K_M.gguf`, junto con `tokenizer.json` y `llm_config.json` como configuración de origen. No hay información sobre datos de entrenamiento, número de tokens, composición del corpus ni si el modelo base pasó por RLHF o DPO.

La innovación técnica relevante es la del runtime, no la del modelo: `loom-serve` expone una API estilo OpenAI sobre kernels generados para AMD, con opciones como `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, usada en las mediciones de rendimiento), `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host). La tarjeta también define un conjunto de puertas de corrección (comparación token a token contra llama.cpp, consistencia en concurrencia, logits, muestreo), pero ninguna tiene evidencia registrada todavía.

## Capacidades

- Generación de texto conversacional mediante un endpoint compatible con la API de OpenAI (`/v1/chat/completions`).
- Contexto largo: hasta 128.000 tokens por petición, adecuado para documentos extensos o historiales de conversación largos.
- Concurrencia de 4 peticiones simultáneas.
- Límite de 4.096 tokens de salida por respuesta según el preset.
- Tool calling: no soportado (marcado como "not applicable").
- Razonamiento / modo thinking: no soportado.
- Decodificación especulativa: no soportada.
- Entrada de imagen o audio: no soportada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Muestreo (temperature, top_k, seed): estado "no determinado"; la puerta de corrección correspondiente no tiene evidencia registrada.

## Casos de uso

- Despliegue de un endpoint compatible con OpenAI en hardware AMD Strix Halo o R9700: útil para prototipos internos que ya consumen la API de OpenAI y quieren conmutar a inferencia local sin cambiar el cliente, usando `loom-fetch` y `loom-serve`.
- Procesamiento de documentos largos: con 128.000 tokens de contexto por petición, el modelo puede resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada, siempre que la calidad del modelo base de 350M sea suficiente para la tarea.
- Clasificación y etiquetado por lotes: tareas de etiquetado simple sobre textos cortos o medianos, donde un modelo de 350M en Q4_K_M reduce el coste frente a modelos mayores y el contexto largo evita trocear los documentos.
- Evaluación de la pila Loom: el paquete sirve como banco de pruebas para validar `loom-serve`, los kernels generados y las puertas de corrección en GPUs AMD antes de desplegar modelos mayores.
- Asistente conversacional de bajo coste en local: chat multi-turno con historial largo en una estación de trabajo con GPU AMD, sin salida a la nube.
- Generación de texto auxiliar en pipelines: borradores, reformulaciones o respuestas plantilla donde la latencia y el coste importan más que la precisión fina, con la salvedad de que no hay mediciones de rendimiento publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que las mediciones de rendimiento frente a llama.cpp no se han vuelto a medir para Strix Halo (gfx1151) ni para Radeon AI PRO R9700 (gfx1201), y que ninguna de las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) tiene evidencia registrada.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; para un modelo de 350M en Q4_K_M el peso de los pesos es del orden de unos pocos cientos de MB, pero el pool de memoria del preset (`--pool_backing=fixed`) y el contexto de 128.000 tokens pueden elevar el consumo de forma significativa. No se publican cifras.
- GPU soportadas explícitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs de consumo; el paquete está orientado a las dos plataformas AMD citadas.
- Despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para descargar el paquete desde Hugging Face. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en este artefacto.
- Latencia y throughput: no disponibles; las tablas de rendimiento frente a llama.cpp figuran como no medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-350M-loom (este paquete) | 350M | 128.000 tokens | `.loom` sobre `loom-serve` (AMD gfx1151/gfx1201) | other | Hugging Face, 0 descargas |
| LiquidAI/LFM2.5-350M-GGUF (modelo base) | 350M | no disponible en la información | GGUF, ejecutable con llama.cpp y otros runtimes GGUF | other | Hugging Face (referenciado como base) |
| Alternativas de 350M en GGUF | no disponible | no disponible | GGUF | no disponible | no disponible |

La comparación relevante es con el propio modelo base: este paquete no altera los pesos, solo el formato de despliegue y el runtime. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El paquete no incluye mediciones de rendimiento ni evidencia de corrección: todas las puertas figuran como "not yet re-measured" para ambas GPUs, por lo que no hay garantía publicada de que la salida coincida con la referencia de llama.cpp.
- Es un artefacto con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-19): no hay historial de uso ni validación comunitaria.
- El modelo base tiene 350M parámetros, por lo que su capacidad de razonamiento, código y matemáticas es limitada en comparación con modelos de mayor tamaño; no se han publicado benchmarks que lo cuantifiquen.
- No soporta tool calling, modo thinking, decodificación especulativa ni entrada de imagen o audio.
- El estado del muestreo (temperature, top_k, seed) es "no determinado"; el comportamiento del muestreo no está verificado.
- La licencia es "other" y las condiciones concretas no están disponibles en la información proporcionada; debe consultarse la licencia del modelo base antes de cualquier uso comercial.
- Los idiomas soportados no están documentados.
- El despliegue está restringido a las plataformas AMD indicadas (Strix Halo gfx1151 y Radeon AI PRO R9700 gfx1201) mediante `loom-serve`; no se documenta compatibilidad con otros runtimes.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero esperables en un modelo de 350M sin evaluación publicada.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/LiquidAI-LFM2.5-350M-loom
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
