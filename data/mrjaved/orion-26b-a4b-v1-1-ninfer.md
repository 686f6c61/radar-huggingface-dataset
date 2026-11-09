# MrJaved/Orion-26B-A4B-v1.1-NInfer

## Resumen

Orion-26B-A4B-v1.1-NInfer es un artefacto de cuantización y empaquetado para inferencia en una sola GPU del modelo TheDrummer/Orion-26B-A4B-v1.1, un fine-tune orientado a roleplay, escritura creativa y generación conversacional construido sobre la arquitectura Gemma 4 Mixture-of-Experts de Google DeepMind. El trabajo lo publica MrJaved y consiste en un contenedor propietario en formato NInfer v3, no en pesos estándar safetensors o GGUF, optimizado específicamente para GPUs NVIDIA Blackwell (sm_120a, RTX 5090 y 5080) y Ada Lovelace.

El modelo base emplea una arquitectura MoE con aproximadamente 25.200 millones de parámetros totales y unos 3.800 millones activos por token (top_k = 8 sobre 128 expertos), lo que permite un rendimiento de decodificación muy alto con una huella de VRAM reducida. La atención es híbrida: 30 capas, de las cuales 25 usan ventana deslizante de 1024 tokens y 5 son de atención global completa, con una ventana de contexto máxima de 262.144 tokens.

La relevancia de esta ficha está en que el artefacto demuestra un patrón de despliegue local de modelos MoE grandes en GPUs de consumo: ~13,76 GiB de VRAM residente, decodificación de 190-240 tok/s en RTX 5090 y 450-700+ tok/s con decodificación especulativa MTP/DFlash2, dejando más de 18 GiB libres para caché KV en FP8. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 Mixture-of-Experts (Gemma4ForConditionalGeneration), transformer con atención híbrida (25 capas de ventana deslizante de 1024 tokens + 5 capas de atención global) |
| Parámetros totales | ~25,2 mil millones |
| Parámetros activos | ~3,8 mil millones por token (top_k = 8 de 128 expertos) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantización | Q4 en formato NInfer v3 (artefacto `orion_26b_a4b_q4.v3.ninfer`); caché KV en FP8 |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (términos de licencia de Google para Gemma) |
| Formato de pesos | Contenedor propietario NInfer v3 (`.ninfer`); no disponible en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia Gemma 4, con 128 expertos y enrutamiento top_k = 8, lo que da ~3,8 mil millones de parámetros activos por token sobre un total de ~25,2 mil millones. La pila de atención es híbrida: 25 de las 30 capas aplican atención de ventana deslizante de 1024 tokens, mientras que 5 capas mantienen atención global completa, un patrón habitual para reducir el coste de atención en contextos largos sin perder acceso global. La ventana máxima declarada es de 262.144 tokens.

El fine-tune TheDrummer/Orion-26B-A4B-v1.1 está orientado a roleplay, escritura creativa y conversación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El artefacto NInfer v3 añade una capa de empaquetado y cuantización Q4 propietaria, con soporte de decodificación especulativa MTP/DFlash2 y gestión de caché KV en FP8 con prefijos compartidos y continuaciones privadas configurables.

## Capacidades

- Generación de texto conversacional multi-turno, con especial énfasis en roleplay y escritura creativa y narrativa.
- Generación de historias y continuación de ficción con coherencia de personajes y estilo.
- Razonamiento de contexto largo: la ventana de 262.144 tokens permite mantener historiales extensos, documentos largos o memory de rol persistente.
- Decodificación especulativa MTP/DFlash2 para acelerar la generación en GPUs Blackwell.
- Servicio compatible con la API de OpenAI (`/v1`) mediante `ninfer-serve.exe`, integrable con SillyTavern, Open WebUI y SDKs compatibles con OpenAI.
- Gestión avanzada de caché KV: prefijos compartidos (`--max-shared-prefixes`), continuaciones privadas (`--max-private-continuations`) y anclas largas por continuación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponible en la información proporcionada, pese a que la clase de arquitectura es `Gemma4ForConditionalGeneration`.

## Casos de uso

- Roleplay local con memoria larga: el modelo puede sostener sesiones de rol con historiales de decenas de miles de tokens gracias a la ventana de 262.144 tokens y a la caché KV en FP8, que deja más de 18 GiB libres en una RTX 5090.
- Escritura creativa y narrativa asistida: generación de relatos, continuaciones y borradores con estilo consistente, aprovechando el fine-tune específico de TheDrummer para storywriting.
- Servidor de inferencia personal compatible con OpenAI: `ninfer-serve.exe` expone `/v1` en el puerto 8088, de modo que clientes como SillyTavern u Open WebUI pueden conectarse sin adaptadores adicionales.
- Prototipado de experiencias conversacionales: al caber en 24-32 GB de VRAM con ~13,76 GiB residentes, permite iterar en una estación de trabajo con una sola GPU de consumo sin penalización de offloading a RAM host.
- Evaluación de decodificación especulativa: el artefacto sirve como banco de pruebas para medir el salto de 190-240 tok/s a 450-700+ tok/s con MTP/DFlash2 en Blackwell.
- Despliegue de bajo coste para equipos pequeños: una única RTX 5090 o 5080 sustituye a un nodo multi-GPU para tareas de generación de texto en inglés con contexto largo.
- Investigación sobre atención híbrida: la combinación de 25 capas de ventana deslizante y 5 globales permite estudiar el equilibrio entre coste de atención y calidad en contextos de 131k-262k tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia en hardware concreto:

| Métrica | Valor medido |
|---|---|
| VRAM residente | ~13,76 GiB |
| Decodificación base (RTX 5090, 32 GB) | ~190-240 tok/s |
| Decodificación con MTP/DFlash2 | 450-700+ tok/s |
| VRAM libre para caché KV | 18+ GiB |
| Contexto máximo servido | 262.144 tokens con caché KV FP8 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~13,76 GiB en cuantización Q4 del artefacto NInfer v3.
- GPUs recomendadas: NVIDIA RTX 5090 y RTX 5080 (Blackwell, sm_120a) como objetivo principal; GPUs Ada Lovelace también soportadas según la model card.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) y RTX 5080 (24 GB) sin offloading a RAM host; en 24 GB quedan menos de 10 GiB para caché KV, por lo que el contexto práctico será menor que 262k.
- Opciones de despliegue: `ninfer-serve.exe` con el lanzador `start_orion_v3.bat`; cliente compatible con OpenAI en `http://127.0.0.1:8088/v1`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` es propietario.
- Latencia y throughput: ~190-240 tok/s en decodificación base y 450-700+ tok/s con decodificación especulativa MTP/DFlash2 en RTX 5090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1.1-NInfer | ~25,2B totales, ~3,8B activos | 262.144 | Gemma | NInfer v3 propietario, single-GPU Blackwell | Artefacto de cuantización Q4; sin benchmarks de calidad publicados |
| TheDrummer/Orion-26B-A4B-v1.1 | ~25,2B totales, ~3,8B activos | no disponible en la información proporcionada | Gemma | Pesos del modelo base (formato no detallado) | Modelo original del fine-tune; referencia para comparar efectos de la cuantización |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos MoE de ~25B con fine-tune de roleplay en la información proporcionada |

## Limitaciones y advertencias

- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente será inferior.
- Sin benchmarks de calidad: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones de roleplay, por lo que la calidad real del fine-tune no está cuantificada.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación específica publicada para este artefacto.
- Sesgos: no se documentan sesgos conocidos ni datos de entrenamiento, lo que impide evaluar su composición y posibles sesgos.
- Formato propietario: el contenedor `.ninfer` solo funciona con el runtime NInfer; no es portable a vLLM, llama.cpp, Ollama o TGI, lo que limita la integración en infraestructuras existentes.
- Dependencia de hardware: optimizado para Blackwell (sm_120a); el rendimiento en Ada Lovelace u otras arquitecturas no está cuantificado en la model card.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia de Google para Gemma, que deben revisarse antes de un despliegue en producción.
- Contexto práctico dependiente de VRAM: los 262.144 tokens solo son alcanzables con suficiente VRAM libre para la caché KV en FP8; en GPUs de 24 GB el contexto útil será considerablemente menor.
- Madurez del artefacto: publicado con 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria independiente.

## Enlaces

- [MrJaved/Orion-26B-A4B-v1.1-NInfer en Hugging Face](https://huggingface.co/MrJaved/Orion-26B-A4B-v1.1-NInfer)
- [TheDrummer/Orion-26B-A4B-v1.1 (modelo base)](https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1)
- [Perfil de MrJaved en Hugging Face](https://huggingface.co/MrJaved)
