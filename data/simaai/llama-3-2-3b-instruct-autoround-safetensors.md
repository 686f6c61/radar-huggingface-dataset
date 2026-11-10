# simaai/Llama-3.2-3B-Instruct-Autoround-Safetensors

## Resumen

Llama-3.2-3B-Instruct-Autoround-Safetensors es una versión cuantizada del modelo meta-llama/Llama-3.2-3B-Instruct publicada por el usuario simaai. Se trata de un checkpoint de pesos comprimidos mediante una combinación de AutoRound (para las capas lineales del decodificador) y GPTQ (para la cabeza de salida `lm_head`), con el objetivo de reducir la huella de memoria y facilitar el despliegue en hardware con recursos limitados. El modelo conserva la arquitectura y el comportamiento conversacional del modelo base de Meta, pero con pesos en INT4 simétrico y grupo de 256.

El artefacto está pensado como paso previo a la compilación para la plataforma Sima.ai (de ahí la referencia "pre-LLiMa" en la model card), por lo que su uso principal es servir como entrada a un pipeline de compilación específico de hardware, no necesariamente como modelo de inferencia directa en transformers. El repositorio incluye los scripts de cuantización (`quantize.py`, `recipe.yaml`, `versions.txt`) para reproducir el proceso.

La relevancia de esta ficha radica en que documenta un caso de cuantización agresiva (INT4) sobre un modelo pequeño (3.6B parámetros) con una degradación de perplejidad notable (57,5% relativa en wikitext-2), lo que sirve como advertencia sobre los compromisos entre compresión y calidad en modelos de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), pesos cuantizados AutoRound + GPTQ |
| Parámetros totales | 3.606.752.256 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3.2 3B soporta 128k, pero no se confirma en esta ficha) |
| Tipos de cuantización | INT4 simétrico G256 (AutoRound en capas lineales, GPTQ en `lm_head`); parámetros no lineales en dtype original |
| Idiomas soportados | multilingüe (según tags; no se detalla lista) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Llama 3.2 con 3.606.752.256 parámetros. Esta versión no reentrena el modelo: aplica cuantización post-entrenamiento. Las 196 capas lineales del decodificador se cuantizan con AutoRound en INT4 simétrico con grupo de 256, excluyendo `lm_head`, que se cuantiza por separado con GPTQ (INT4 simétrico G256, act-order estático, block size 128, dampening 0,01). Los parámetros no lineales permanecen en su precisión original.

La calibración se realizó con `HuggingFaceH4/ultrachat_200k` (`train_sft[:512]`), renderizado con la plantilla de chat del modelo base, concatenando tokens de forma determinista y empaquetando en 512 secuencias completas de 1024 tokens sin mezcla. AutoRound usó 200 iteraciones con batch size 1. No se aplicó RLHF ni DPO adicional; el alineamiento proviene del modelo base Instruct de Meta.

## Capacidades

- Generación de texto conversacional y multilingüe, heredada del modelo base Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla Llama 3.2).
- Generación de código y matemáticas básicas, según las capacidades del modelo base (no se aportan evaluaciones específicas en esta versión).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada; depende del modelo base y del runtime.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta ficha.
- Modo thinking, visión o audio: no disponible (el modelo base 3B es solo texto).

## Casos de uso

- Compilación para plataforma Sima.ai: el artefacto está diseñado como entrada "pre-LLiMa" para el compilador de Sima.ai; se usaría en el pipeline de compilación, no directamente en transformers.
- Despliegue en edge con memoria limitada: al estar en INT4, reduce la huella frente al modelo base en FP16, lo que permite probar inferencia en dispositivos con poca VRAM, asumiendo la pérdida de calidad documentada.
- Prototipado de asistentes conversacionales: útil para validar flujos de chat multi-turno antes de pasar a un modelo mayor o a una versión sin cuantizar.
- Evaluación de pipelines de cuantización: sirve como caso de estudio reproducible (incluye `quantize.py` y `recipe.yaml`) para medir el impacto de AutoRound+GPTQ en modelos de 3B.
- Generación de texto en entornos de investigación con restricciones de cómputo: permite experimentar con Llama 3.2 3B en GPUs de gama media, aceptando la degradación de perplejidad.
- Integración en TGI o endpoints compatibles: los tags incluyen `text-generation-inference` y `endpoints_compatible`, por lo que puede servirse en infraestructuras que acepten safetensors comprimidos con compressed-tensors.

## Benchmarks y rendimiento

Evaluación de perplejidad de palabra sobre `wikitext-2-raw-v1` (tarea `wikitext` de lm-eval, sin límite de ejemplos, batch size 1, CUDA, mismo evaluador para ambos checkpoints, 2026-07-19):

| Checkpoint | Perplejidad de palabra | Estado |
|---|---:|---|
| meta-llama/Llama-3.2-3B-Instruct (fuente) | 13,390631 | Ejecución completa |
| Este checkpoint (UltraChat) | 21,088042 | Ejecución completa |
| Degradación absoluta | 7,697411 | Menor es mejor |
| Degradación relativa | 57,484% | 100 × (cuantizado / fuente − 1) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 4,9 GB en safetensors, lo que da una orientación del espacio en disco, pero la VRAM depende del runtime y del descompresor de compressed-tensors.
- GPU recomendadas: no especificadas en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el modelo está orientado a compilación para Sima.ai, no a inferencia directa en consumer GPU.
- Opciones de despliegue: transformers (librería declarada), TGI (tag `text-generation-inference`), y compilación específica para Sima.ai; no se mencionan llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (simaai/Llama-3.2-3B-Instruct-Autoround-Safetensors) | 3,6B | no disponible | INT4 AutoRound + GPTQ | llama3.2 | Hugging Face, 83 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B (3,6B totales según safetensors) | no disponible en esta ficha | FP16/BF16 | llama3.2 | Hugging Face, oficial de Meta |
| Otras cuantizaciones de Llama-3.2-3B (p. ej. GPTQ/AWQ de la comunidad) | ~3,6B | según base | INT4 | llama3.2 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad significativa: la perplejidad en wikitext-2 sube de 13,39 a 21,09 (57,5% relativa), lo que indica una pérdida apreciable de fidelidad respecto al modelo base.
- La calidad de la cuantización puede variar según idioma, dominio, formato de prompt, longitud de contexto y runtime; el autor recomienda validar la carga de trabajo específica de forma independiente.
- Sesgos conocidos: no documentados en esta ficha; hereda los del modelo base Llama 3.2 Instruct.
- Riesgo de alucinación: no evaluado en esta versión; presumiblemente similar o superior al del modelo base por la cuantización.
- Restricciones de licencia: sujeta a la licencia llama3.2 de Meta, con sus condiciones de uso comercial y de atribución; revisar los términos antes de producción.
- Orientado a compilación para Sima.ai: no es un artefacto de inferencia directa en transformers sin el runtime adecuado; el autor indica compilarlo por separado y mantener la salida del compilador aparte.
- Contexto e idiomas: no se detalla la longitud de contexto efectiva ni la lista de idiomas soportados en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/simaai/Llama-3.2-3B-Instruct-Autoround-Safetensors
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de evaluación: https://huggingface.co/datasets/wikitext (wikitext-2-raw-v1)
- Repositorio de AutoRound: no disponible en la información proporcionada
- Repositorio de llmcompressor / compressed-tensors: no disponible en la información proporcionada
- Paper o blog de Sima.ai: no disponible en la información proporcionada
