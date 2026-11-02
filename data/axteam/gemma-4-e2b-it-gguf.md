# axteam/gemma-4-E2B-it-GGUF

## Resumen

`axteam/gemma-4-E2B-it-GGUF` es una compilación en formato GGUF del modelo multimodal `google/gemma-4-E2B-it`, publicada por el usuario axteam para su uso con llama.cpp, Ollama y LM Studio. Se trata de una cuantización de posentrenamiento (PTQ) del checkpoint original en BF16, sin reentrenamiento, que conserva la plantilla de chat embebida en el archivo. El modelo base pertenece a la familia Gemma 4 de Google DeepMind y, según la información disponible, es de arquitectura densa y multimodal en origen; la versión GGUF ejecuta únicamente la parte lingüística al no incluir proyector de visión (`mmproj`).

El interés práctico de esta ficha radica en que permite ejecutar un modelo de aproximadamente 4.650 millones de parámetros en hardware de consumo gracias a la cuantización Q4_K_M, que reduce el archivo a 3,4 GB. El repositorio ofrece tres variantes (BF16, Q8_0 y Q4_K_M) con métricas de divergencia KL medidas frente al BF16 en GPU, lo que facilita la elección entre tamaño y fidelidad de pesos.

La licencia declarada en el repositorio es Apache 2.0, aunque la model card remite a la licencia específica de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial. El modelo está pensado para conversación multilingüe y tareas de texto, con soporte de coreano e inglés demostrado en las pruebas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (multimodal en origen; el GGUF ejecuta solo la parte de lenguaje) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 8192`) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (k-quants de llama.cpp, PTQ) |
| Idiomas soportados | no disponible oficialmente; se demuestran inglés y coreano en las pruebas del autor |
| Licencia | Apache 2.0 en el repositorio; la model card remite a la licencia Gemma 4 de Google |
| Formato de pesos | GGUF (con plantilla de chat embebida) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4, con aproximadamente 4.650 millones de parámetros. Según la model card, el checkpoint original es multimodal (entrada de imagen y texto), pero esta conversión a GGUF solo incluye los pesos del modelo de lenguaje: no hay archivo `mmproj`, por lo que la inferencia es exclusivamente de texto. La arquitectura en llama.cpp se identifica como `gemma4` y requiere una compilación igual o superior a b8637.

Los archivos de este repositorio son cuantizaciones de posentrenamiento generadas con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp, con cuantización por bloques (k-quants, escalas por bloque con asignación mixta de bits y redondeo al más cercano refinado) y sin reentrenamiento. No se trata de QAT. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original; esos datos corresponden a la documentación de Google y no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat embebida en el GGUF.
- Respuesta a preguntas factuales sencillas (el autor verifica correctamente las capitales de Francia y Corea).
- Capacidad multilingüe demostrada en inglés y coreano; el resto de idiomas no está documentado.
- En origen, el modelo base es multimodal (image-text-to-text), pero esta conversión no incluye proyector de visión, por lo que la entrada es solo texto.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- No se documenta modo de razonamiento explícito (thinking mode) ni capacidades de audio.

## Casos de uso

- Asistente conversacional local en portátil o sobremesa: con el archivo Q4_K_M (3,4 GB) puede ejecutarse en llama.cpp u Ollama con contexto de 8.192 tokens, adecuado para prototipos y uso personal sin conexión.
- Chatbot multilingüe ligero inglés-coreano: las pruebas del autor confirman respuestas correctas en coreano con Q8_0 y BF16, útil para soporte básico en ambos idiomas.
- Despliegue en CPU o GPU de gama media para pruebas de integración: el tamaño reducido de Q4_K_M permite validar pipelines de inferencia antes de migrar a un modelo mayor.
- Generación de texto en aplicaciones de escritorio mediante LM Studio u Ollama: la plantilla de chat incluida y el comando `ollama run hf.co/axteam/gemma-4-E2B-it-GGUF:Q4_K_M` simplifican la puesta en marcha.
- Evaluación comparativa de cuantizaciones: las métricas de divergencia KL y acuerdo top-1 frente a BF16 permiten estudiar el impacto de la cuantización en un modelo instruct pequeño.
- Servicio de preguntas y respuestas de baja latencia en un solo servidor: con Q8_0 (5,0 GB) y todas las capas en GPU se obtiene mayor fidelidad que Q4_K_M a costa de más memoria.
- Base para re-cuantización o ajuste fino posterior: el archivo BF16 (9,3 GB) sirve como referencia sin pérdida para generar nuevas cuantizaciones.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Sí incluye métricas de fidelidad de cuantización medidas en una NVIDIA B200 con llama.cpp b12005 (commit e0f142d, build CUDA), sobre 16 ventanas de 2.048 tokens de WikiText-2 y de una muestra de Wikipedia en coreano:

| Archivo | KLD media vs BF16 (EN / KO) | Acuerdo top-1 vs BF16 (EN / KO) |
|---|---|---|
| Q4_K_M | 0,4248 / 0,3995 | 77,7% / 79,9% |
| Q8_0 | 0,0086 / 0,0085 | 96,5% / 96,9% |

El autor señala que la perplejidad sobre texto bruto no es representativa para este checkpoint instruct (el propio BF16 obtiene 135 en WikiText-2 sin plantilla de chat), por lo que la comparación se hace contra el BF16 en los mismos tokens. En pruebas cualitativas, todos los archivos respondieron correctamente a dos preguntas cortas, salvo Q4_K_M en la pregunta en coreano, que repitió la pregunta en lugar de responder.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ocupa 3,4 GB de pesos; Q8_0, 5,0 GB; BF16, 9,3 GB. A ello se suma la caché KV del contexto configurado con `-c`.
- Reducción de caché KV: `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` aproximadamente la mitad del consumo de caché.
- GPU recomendadas: el autor valida en NVIDIA B200 con todas las capas en GPU; por tamaño, Q4_K_M cabe en GPU de consumo con 6-8 GB de VRAM y Q8_0 en torno a 8-10 GB, aunque no se documentan pruebas en esas tarjetas.
- Cabe en GPU de consumo: sí, al menos Q4_K_M; no hay mediciones publicadas en RTX 4090, RTX 4060 u otras.
- Opciones de despliegue: llama.cpp (build ≥ b8637 para la arquitectura `gemma4`; `-fa on` requiere ≥ b6325), Ollama y LM Studio. Ollama y LM Studio no fueron probados por el autor.
- Latencia y throughput: no disponibles; no se publican cifras de tokens por segundo.
- Muestreo recomendado por Google: `temperature=1.0`, `top_p=0.95`, `top_k=64`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a características de despliegue:

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-E2B-it (GGUF, axteam) | 4.647.450.147 | no disponible | GGUF (BF16, Q8_0, Q4_K_M) | Apache 2.0 / licencia Gemma 4 | Solo texto en esta conversión; métricas KLD publicadas |
| google/gemma-4-E2B-it (original) | 4.647.450.147 | no disponible | safetensors (BF16) | licencia Gemma 4 | Multimodal completo; referencia de calidad |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información disponible |

## Limitaciones y advertencias

- La conversión no incluye proyector de visión: pese a la etiqueta `image-text-to-text`, no procesa imágenes.
- Q4_K_M muestra una divergencia notable frente a BF16 (KLD ≈ 0,42 y acuerdo top-1 ≈ 78%), y falló en la pregunta en coreano durante las pruebas del autor; para producción sensible al coreano conviene Q8_0 o BF16.
- No hay datos publicados sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo base en la información disponible.
- La cobertura de idiomas no está documentada; solo se verifican inglés y coreano.
- La longitud de contexto no se especifica; los ejemplos usan 8.192 tokens, pero no se confirma el máximo del modelo.
- Licencia: el repositorio declara Apache 2.0, pero la model card remite a la licencia Gemma 4 de Google; es imprescindible revisar los términos de uso comercial de dicha licencia antes de desplegar.
- Requiere llama.cpp ≥ b8637 para cargar la arquitectura `gemma4`; versiones anteriores fallarán.
- Los tokenizers GGUF de gemma-4 no añaden BOS por defecto (lo hace la plantilla de chat); el autor tuvo que forzarlo para sus mediciones.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en integraciones que dependan de ello.

## Enlaces

- Repositorio GGUF: https://huggingface.co/axteam/gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Archivo Q4_K_M: https://huggingface.co/axteam/gemma-4-E2B-it-GGUF/blob/main/gemma-4-E2B-it-GGUF-Q4_K_M.gguf
- Archivo Q8_0: https://huggingface.co/axteam/gemma-4-E2B-it-GGUF/blob/main/gemma-4-E2B-it-GGUF-Q8_0.gguf
- Archivo BF16: https://huggingface.co/axteam/gemma-4-E2B-it-GGUF/blob/main/gemma-4-E2B-it-GGUF-BF16.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
