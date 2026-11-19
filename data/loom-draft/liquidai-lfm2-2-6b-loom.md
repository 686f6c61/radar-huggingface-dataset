# loom-draft/LiquidAI-LFM2-2.6B-loom

## Resumen

LiquidAI-LFM2-2.6B-loom es un paquete de despliegue para GPUs AMD del modelo LiquidAI/LFM2-2.6B, publicado por el usuario loom-draft. No se trata de un modelo nuevo ni de un fine-tune: es el checkpoint GGUF original de LiquidAI (concretamente la variante `LFM2-2.6B-Q4_K_M-hip-optimized.gguf`) empaquetado en el formato `.loom` que consume el runtime Loom, un stack de inferencia orientado a hardware AMD (ROCm). El paquete incluye programas `.loom` generados, un `model.json` con la ficha de configuración, el tokenizador y evidencias de medición.

El objetivo del paquete es permitir servir el modelo sobre dos aceleradores AMD concretos: el APU AMD Ryzen AI Max+ 395 ("Strix Halo", gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Expone una API compatible con OpenAI (`/v1/chat/completions`) a través de `loom-serve`, con un contexto declarado de 128.000 tokens por petición y hasta 4 peticiones concurrentes.

La relevancia es acotada: no aporta capacidades nuevas de modelado, sino una vía de ejecución específica para hardware AMD que habitualmente queda fuera de las optimizaciones de los stacks más populares (vLLM, llama.cpp con CUDA). La model card indica que las mediciones de rendimiento y las puertas de corrección todavía no se han vuelto a medir para este paquete, por lo que la evidencia empírica publicada es nula en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base LiquidAI/LFM2-2.6B; el paquete no la describe) |
| Parametros totales | 2.600 millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens por petición (según la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF `LFM2-2.6B-Q4_K_M-hip-optimized.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones no detalladas) |
| Formato de pesos | GGUF empaquetado en formato Loom (`.loom`, `weights.loom`, `model.json`) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo; esta corresponde al checkpoint LiquidAI/LFM2-2.6B, que el autor declara como base sin modificar. No se aportan datos sobre composición del dataset, número de tokens de entrenamiento ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se describe si LFM2 emplea atención lineal, SSM híbrido u otra innovación, más allá de lo que pueda contener la ficha del modelo original (no incluida en la información disponible).

La contribución técnica del paquete es de infraestructura: `loom-next` genera programas `.loom` y kernels específicos para las arquitecturas AMD gfx1151 y gfx1201 a partir de la configuración del modelo (`llm_config.json`), y `loom-serve` los ejecuta con opciones como `completion_spin_ns=4294967295` (espera activa de las finalizaciones de GPU), `pool_backing=fixed` (reserva fija del pool de memoria) y `parameter_mode=preload`. La model card define un conjunto de puertas de corrección (kernel_tests, golden, compare, consistency, spec, agent, sampling, logits, decision) que comparan la salida contra llama.cpp sobre el mismo GGUF, pero todas aparecen como "not yet re-measured" para este paquete, es decir, sin evidencia registrada.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI (`/v1/chat/completions`).
- Contexto largo: hasta 128.000 tokens por petición según la configuración del preset.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de salida de 4.096 tokens por petición (preset `max_tokens`).
- Tool calling: no aplicable según la model card.
- Razonamiento / thinking mode y reasoning effort: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada de imagen o audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado"; existe una puerta de corrección `sampling` definida pero sin medición registrada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat local sobre APU Strix Halo: desplegar `loom-serve` en un equipo con Ryzen AI Max+ 395 para ofrecer un endpoint compatible con OpenAI en `127.0.0.1:8080`, útil para prototipos y asistentes internos sin depender de la nube.
- Inferencia en GPU AMD de gama profesional: usar la Radeon AI PRO R9700 (32 GB) como acelerador dedicado para servir el modelo Q4_K_M con contexto largo, en entornos donde no se dispone de CUDA.
- Procesamiento de documentos extensos: con 128.000 tokens de contexto por petición, el modelo puede recibir informes, contratos o expedientes completos en una sola llamada para tareas de resumen o extracción, siempre que se validen las respuestas.
- Evaluación comparativa de stacks de inferencia: el paquete está diseñado para medirse contra llama.cpp con el mismo GGUF mediante las puertas `golden`, `compare` y `consistency`, lo que lo hace adecuado como banco de pruebas de paridad numérica en hardware AMD.
- Despliegue de referencia en pipelines ROCm: integrar `loom-fetch` y `loom-serve` en flujos de CI que verifiquen que los kernels generados producen la misma salvo que la referencia antes de promover una versión.
- Chat de baja concurrencia en estaciones de trabajo: con 4 peticiones concurrentes y 4.096 tokens de salida, encaja en escenarios de equipo pequeño (asistencia a desarrolladores, borradores de texto) donde el throughput no es crítico.
- Reproducibilidad de entornos: el paquete fija versiones y hashes sha256 de los ficheros fuente (`model.json.lock`), lo que permite reconstruir exactamente el mismo despliegue en distintas máquinas AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de corrección figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 2.600 millones de parámetros, lo que en la práctica ronda los 1,5-2 GB de pesos, pero el paquete no publica cifras de memoria del pool.
- GPU soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPUs consumer: no se documenta compatibilidad con GPUs de consumo; el paquete está dirigido a las dos plataformas AMD citadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas dentro de este paquete.
- Latencia y throughput: no disponibles; las tablas de rendimiento del paquete están pendientes de medición.
- Concurrencia configurada: 4 peticiones simultáneas; salida máxima de 4.096 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiquidAI-LFM2-2.6B-loom | 2.600 M | 128.000 tokens | Q4_K_M (GGUF/Loom) | other | Paquete Loom para AMD gfx1151 y gfx1201 |
| LiquidAI/LFM2-2.6B-GGUF (base) | 2.600 M | no disponible en la informacion | GGUF (incluye Q4_K_M) | other | Hugging Face, ejecutable con llama.cpp y otros runtimes GGUF |
| Alternativas de ~3B en GGUF (p. ej. familias Llama, Qwen, Gemma) | ~3.000 M | no disponible | GGUF | varía según familia | Amplia, con soporte en llama.cpp, Ollama y vLLM |

La comparación relevante es contra el propio checkpoint base: el paquete Loom no cambia pesos ni tokenizador, solo el runtime y el formato de empaquetado. Frente a otras familias de ~3B, la diferencia principal es la plataforma de ejecución (AMD ROCm vía Loom) y la ausencia de métricas publicadas que permitan situarlo en rendimiento.

## Limitaciones y advertencias

- Paquete sin evidencia de corrección: todas las puertas (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como no re-medidas, por lo que no hay garantía publicada de paridad con llama.cpp.
- Sin benchmarks de rendimiento: no se puede estimar latencia ni throughput a partir de la información disponible.
- Funcionalidades ausentes por diseño: sin tool calling, sin modo de razonamiento, sin decodificación especulativa, sin visión ni audio.
- Muestreo no determinado: el comportamiento de temperature, top_k y seed no está verificado.
- Licencia "other": las condiciones exactas de uso comercial no se detallan en la información proporcionada; hay que consultar la licencia del modelo base LiquidAI/LFM2-2.6B antes de usarlo en producción.
- Idiomas no declarados: no se especifica qué lenguas cubre el modelo ni su calidad relativa.
- Riesgo de alucinación: inherente a un modelo de 2.600 millones de parámetros; no hay evaluaciones publicadas en este paquete que lo cuantifiquen.
- Alcance de hardware muy restringido: solo se documentan dos plataformas AMD; no hay garantía de funcionamiento en otras GPUs.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo día (2026-11-19), lo que sugiere un artefacto recién generado y sin validación comunitaria.
- Dependencia de versiones concretas: requiere `hrx-loom[hf]==0.2.0`; cambios en el runtime pueden romper la reproducibilidad.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/LiquidAI-LFM2-2.6B-loom
- Modelo base (GGUF): https://huggingface.co/LiquidAI/LFM2-2.6B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
