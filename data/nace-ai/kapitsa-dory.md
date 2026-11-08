# nace-ai/kapitsa-dory

## Resumen

Kapitsa Dory es una distribución empaquetada del modelo NVIDIA Nemotron-Labs-Dory1.0-4B en cuantización NVFP4 (aproximadamente 3,2 GB de pesos), publicada por nace-ai para ejecutarse localmente en Apple Silicon a través de Kapitsa, un motor de inferencia nativo para macOS orientado a agentes de programación. No se trata de un modelo entrenado desde cero por nace-ai, sino de un artefacto de despliegue: el trabajo propio reside en el motor de inferencia y en el formato listo para servir con el comando `kapitsa serve --model dory`.

El modelo subyacente es un transformer denso de 4.000 millones de parámetros con arquitectura "looped" (capas reutilizadas en bucle), cuantizado en NVFP4 por NVIDIA. El repositorio de nace-ai no aporta información sobre el dataset de entrenamiento, el contexto máximo ni los idiomas soportados; esos datos deben consultarse en la model card original de NVIDIA.

Su relevancia actual es práctica: demuestra que un modelo de 4B en FP4 de 3,2 GB puede ejecutarse en cualquier Mac moderno, incluidos equipos con 16 GB de memoria unificada, con velocidades de decodificación de entre 36 y 122 tokens por segundo según el chip. Está pensado para levantar agentes de código locales (opencode, Claude Code, Codex, pi) con APIs compatibles con OpenAI y Anthropic, sin depender de la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con capas en bucle (looped dense transformer) |
| Parámetros totales | 4B |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (formato de pesos del artefacto publicado) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | NVFP4 (tamaño aproximado 3,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 4B parámetros con un esquema "looped", en el que determinadas capas se reutilizan en varias pasadas. La model card de nace-ai no detalla cuántas capas se repiten ni cuántas iteraciones del bucle se aplican, y tampoco ofrece información sobre el número de tokens de entrenamiento, la composición del corpus, ni si hubo fases de RLHF o DPO. Esos detalles pertenecen al modelo base de NVIDIA y no se reproducen en este repositorio.

La innovación relevante en este artefacto es la cuantización NVFP4 aplicada por NVIDIA, que reduce los pesos a unos 3,2 GB y permite inferencia local en memoria unificada de Apple Silicon. El motor Kapitsa implementa la ejecución sobre Metal y expone APIs compatibles con OpenAI y Anthropic, lo que permite conectar herramientas de agentes existentes sin adaptadores adicionales. No se documentan técnicas como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Ejecución local en Apple Silicon mediante el motor Kapitsa, con el comando `kapitsa serve --model dory`.
- Exposición de endpoints compatibles con las APIs de OpenAI y Anthropic a través de Kapitsa.
- Integración con herramientas de agentes de código: opencode, Claude Code, Codex y pi, según la documentación del motor.
- Soporte de tool calling y razonamiento multi-paso: no confirmado en la información disponible para este modelo concreto; depende de las capacidades del modelo base de NVIDIA.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local para desarrolladores con Mac: Kapitsa arranca opencode, Claude Code, Codex o pi apuntando a un endpoint local servido por Dory, de modo que el código y los prompts no salen del equipo. Es adecuado por su tamaño reducido y su velocidad de decodificación en chips M-series.
- Autocompletado y generación de fragmentos en el editor: con 36-122 tok/s de decodificación según el Mac, el modelo puede sostener respuestas interactivas en un flujo de edición sin latencia perceptible en equipos M3 Pro o superiores.
- Prototipado de agentes con API compatible con OpenAI: al exponer un endpoint compatible, se pueden reutilizar SDKs y frameworks existentes (LangChain, LlamaIndex, clientes oficiales) sin reescribir la capa de integración.
- Pruebas de pipelines de agentes en CI o entornos de desarrollo sin GPU dedicada: un Mac con 16 GB (M1 Pro) puede servir el modelo con 39 tok/s de decodificación, suficiente para tests de integración de flujos multi-paso.
- Procesamiento por lotes de texto en local para tareas de resumen, extracción o clasificación: el modelo cabe holgadamente en memoria unificada y evita costes de API en volúmenes moderados.
- Demostraciones y workshops sobre inferencia local: el peso de 3,2 GB y el arranque con un solo comando facilitan reproducir un stack completo de agente local en portátiles de asistentes.
- Evaluación comparativa de motores de inferencia en Apple Silicon: sirve como carga de trabajo reproducible para medir prefill y decode en distintos chips M-series.

## Benchmarks y rendimiento

La model card publica únicamente métricas de velocidad de inferencia con el motor Kapitsa, no resultados de calidad (MMLU, HumanEval, GSM8K u otros).

| Mac | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| M5 Max 128 GB | no disponible | 122 |
| M5 Pro 48 GB | no disponible | 70 |
| M4 Pro 48 GB | no disponible | 64 |
| M3 Pro 36 GB | 450 | 36 |
| M1 Pro 16 GB | no disponible | 39 |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- Memoria: los pesos NVFP4 ocupan aproximadamente 3,2 GB; con overhead de runtime y KV cache, el modelo cabe en equipos con 16 GB de memoria unificada (confirmado en M1 Pro 16 GB).
- Chips probados por el autor: M5 Max 128 GB, M5 Pro 48 GB, M4 Pro 48 GB, M3 Pro 36 GB y M1 Pro 16 GB.
- GPU dedicadas (A100, H100, RTX 4090): no contempladas; el artefacto está orientado exclusivamente a Apple Silicon.
- Despliegue: motor Kapitsa (`kapitsa serve --model dory`), con APIs compatibles con OpenAI y Anthropic. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Rendimiento observado: decodificación de 36 a 122 tok/s según chip; prefill medido de 450 tok/s en M3 Pro 36 GB.
- Latencia: no se publican cifras de time-to-first-token más allá del prefill agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kapitsa Dory (nace-ai) | 4B | no disponible | NVFP4 | NVIDIA Open Model License | Hugging Face, motor Kapitsa |
| NVIDIA Nemotron-Labs-Dory1.0-4B-NVFP4 | 4B | no disponible | NVFP4 | NVIDIA Open Model License | Hugging Face (modelo base) |
| Modelos Qwen soportados por Kapitsa | no disponible | no disponible | no disponible | según variante | Hugging Face, motor Kapitsa |
| Recursive Flint (soportado por Kapitsa) | no disponible | no disponible | no disponible | no disponible | motor Kapitsa |

La comparación relevante es contra el propio modelo base de NVIDIA: Kapitsa Dory no modifica los pesos, solo los empaqueta para el motor. Frente a otras alternativas de la misma categoría (modelos de 4B para inferencia local), no hay datos de calidad publicados en la información disponible que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no documenta sesgos, datos de entrenamiento ni evaluación de alucinación; se heredan las limitaciones del modelo base de NVIDIA, no descritas aquí.
- Longitud de contexto e idiomas soportados no disponibles: no se puede garantizar un comportamiento correcto en conversaciones largas o en castellano sin verificación empírica.
- La licencia es NVIDIA Open Model License (etiquetada como "other" en Hugging Face); es imprescindible revisar sus términos antes de cualquier uso comercial, incluidos los requisitos de atribución y las restricciones de uso.
- El artefacto está atado al motor Kapitsa y a Apple Silicon; no es portable a CUDA, ROCm ni a otros runtimes sin conversión de formato.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue publicado el 2026-11-08: no hay evidencia de uso en producción ni validación independiente.
- NVFP4 es un formato de baja precisión; puede degradar la calidad frente a FP16/BF16 en tareas sensibles a la precisión numérica (matemáticas, código con requisitos estrictos).
- No se documenta soporte de tool calling verificado para este modelo concreto; conviene probarlo antes de integrarlo en agentes que dependan de function calling.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nace-ai/kapitsa-dory
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Motor Kapitsa (GitHub): https://github.com/nace-ai/kapitsa
- Releases de Kapitsa: https://github.com/nace-ai/kapitsa/releases
