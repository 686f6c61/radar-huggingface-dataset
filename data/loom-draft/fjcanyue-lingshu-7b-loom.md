# loom-draft/fjcanyue-Lingshu-7B-loom

## Resumen

Lingshu-7B (Q4_K_M) para AMD Loom es un paquete de despliegue distribuido por el usuario `loom-draft`, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF sin modificar `fjcanyue/Lingshu-7B-GGUF` (concretamente el fichero `Lingshu-7B.Q4_K_M.gguf`) en el formato `.loom` que consume el runtime `loom-serve` del ecosistema Loom, generado con la herramienta `loom-next` (solo el generador, sin LLM en el bucle). El objetivo es ofrecer una ruta de inferencia optimizada para las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un modelo multimodal de 7B parámetros con pipeline `image-text-to-text`, es decir, acepta entradas de imagen y texto y genera texto. El paquete expone una API compatible con OpenAI (`/v1/chat/completions`) e incluye un proyector multimodal (`mmproj-Lingshu`) para el procesamiento de imágenes. La licencia declarada es MIT.

La relevancia de esta ficha es doble: por un lado, documenta un caso de empaquetado de inferencia específico para hardware AMD (ROCm), con mediciones de rendimiento frente a llama.cpp ROCm; por otro, advierte de que el paquete es un artefacto de despliegue de terceros, con cero descargas y cero likes en el momento de la consulta, y con información muy limitada sobre el modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; arquitectura interna no especificada) |
| Parametros totales | 7B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65536 tokens (según los argumentos de llama.cpp usados en la comparativa: `-c 65536`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en formato `.loom` con tarjeta `model.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `fjcanyue/Lingshu-7B-GGUF` en la documentación proporcionada: no se detalla si es un transformer denso, un modelo híbrido o si emplea atención lineal, ni se especifican los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. El paquete Loom no modifica los pesos: se limita a envolver el checkpoint GGUF original en programas `.loom` y una tarjeta `model.json` para el runtime `loom-serve`.

La innovación técnica destacable no está en el modelo sino en el runtime de despliegue. Loom incluye opciones como `completion_spin_ns=4294967295` (espera activa de las finalizaciones de GPU, que consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (reserva el pool de memoria por adelantado en lugar de crecimiento elástico) y `--parameter_mode=preload` (carga de pesos en host). Según el autor, no hay decodificación especulativa disponible para este modelo: el GGUF no incluye cabeza MTP ni se ha publicado un drafter para este modelo exacto.

## Capacidades

- Generación de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada de imágenes: soporte de partes `image_url` al estilo OpenAI, con proyector multimodal `mmproj-Lingshu`.
- Procesamiento de documentos largos: el contexto configurado en las pruebas alcanza 65536 tokens.
- Tool calling: no disponible (marcado como "not applicable" en la tarjeta).
- Razonamiento / thinking mode: no disponible (marcado como "not applicable").
- Reasoning effort: no disponible (marcado como "not applicable").
- Decodificación especulativa: no disponible (marcado como "not applicable").
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Soporte de agentes y multi-step reasoning: no documentado.

## Casos de uso

- Inferencia local en hardware AMD Strix Halo: el paquete está preconfigurado para el Ryzen AI Max+ 395 (gfx1151) y permite servir el modelo con `loom-serve` tras un `loom-fetch`, sin necesidad de ajustar argumentos de offload ni de contexto.
- Despliegue en estaciones de trabajo con Radeon AI PRO R9700: la tarjeta incluye comandos específicos para la gfx1201 de 32 GB, orientados a entornos de escritorio profesional con ROCm.
- Procesamiento de documentos largos: con contexto de hasta 65536 tokens, resulta adecuado para resumir o extraer información de documentos extensos, con un prefill medido de 1195,8 tok/s a 32k en Strix Halo.
- Análisis de imágenes en local: al soportar entradas `image_url`, puede emplearse para descripción de imágenes, extracción de texto de capturas o preguntas y respuestas sobre figuras, sin enviar datos a la nube.
- Servicio multi-cliente moderado: las pruebas con 4 streams agregados (177,9 tok/s en Loom frente a 143,0 en llama.cpp) indican viabilidad para atender varias peticiones concurrentes en un solo dispositivo.
- Evaluación comparativa de motores de inferencia: útil para equipos que quieran medir Loom frente a llama.cpp ROCm con el mismo GGUF y las mismas peticiones, ya que el autor publica metodología y resultados por sesión.

## Benchmarks y rendimiento

Rendimiento de inferencia en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374`, mediana de 3 sesiones:

| Métrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 46,1 | 47,8 | +4 % |
| Decode tok/s, contexto 2k | 43,3 | 45,0 | +4 % |
| Decode tok/s, contexto 32k | 21,9 | 33,6 | +53 % |
| Prefill tok/s, documento 1k | 1384,4 | 1942,8 | +40 % |
| Prefill tok/s, documento 2k | 1398,1 | 2027,0 | +45 % |
| Prefill tok/s, documento 8k | 1255,7 | 1841,1 | +47 % |
| Prefill tok/s, documento 16k | 1065,5 | 1643,1 | +54 % |
| Prefill tok/s, documento 32k | 807,1 | 1195,8 | +48 % |
| 4 streams, decode agregado tok/s | 143,0 | 177,9 | +24 % |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) el autor indica que los resultados "no se han vuelto a medir todavía". No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de un modelo de 7B, y el paquete está pensado para GPU con 32 GB (Radeon AI PRO R9700) y para la memoria unificada del Strix Halo.
- GPU soportadas de forma explícita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta compatibilidad con GPU de consumo NVIDIA ni con otras GPU AMD distintas de las dos anteriores.
- Despliegue: runtime `loom-serve` del paquete `hrx-loom[hf]==0.2.0`, instalado con `pipx`; flujo `loom-fetch` seguido de `loom-serve`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete (llama.cpp aparece solo como referencia de comparación).
- Latencia y throughput: en Strix Halo, 47,8 tok/s de decode con prompt corto, 45,0 tok/s a 2k de contexto y 33,6 tok/s a 32k; prefill de 1942,8 tok/s con documento de 1k y 1195,8 tok/s con documento de 32k; 177,9 tok/s agregados con 4 streams.
- Medición realizada el 2026-11-26 en runners AMD DevLab Dispatch (X2-LA03-S01-D05), Linux, hrx-loom 0.2.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lingshu-7B (paquete Loom) | 7B | 65536 (configurado en pruebas) | MIT | GGUF Q4_K_M en `.loom` | Multimodal image-text-to-text; runtime Loom para AMD |
| fjcanyue/Lingshu-7B-GGUF (base) | 7B | no disponible | no disponible | GGUF | Checkpoint original sin empaquetar; misma cuantización Q4_K_M |
| llama.cpp ROCm (motor) | n/a | 65536 en las pruebas | n/a | n/a | Motor de referencia; 46,1 tok/s decode corto y 21,9 tok/s a 32k en Strix Halo |

No se dispone de información sobre otros modelos de 7B multimodales comparables en la documentación proporcionada; la comparativa se limita al propio checkpoint base y al motor de inferencia de referencia.

## Limitaciones y advertencias

- El paquete registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-26): trazabilidad y validación comunitaria mínimas.
- Es un artefacto de empaquetado de terceros (`loom-draft`), no el modelo original; la calidad del modelo subyacente no está avalada por esta ficha.
- No hay información sobre sesgos, riesgo de alucinación ni evaluación de seguridad del modelo base.
- No se especifican los idiomas soportados; no se puede garantizar un rendimiento adecuado en castellano.
- Tool calling, modo de razonamiento y decodificación especulativa están marcados como "not applicable": no deben asumirse en producción.
- Compatibilidad de hardware restringida a Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documentan otras GPU.
- Los resultados de rendimiento en R9700 no se han vuelto a medir y los de Strix Halo provienen de runners que difieren entre sesiones, según el propio autor.
- La licencia MIT se declara a nivel de paquete; no se confirma la licencia del checkpoint base, por lo que conviene verificarla antes de un uso comercial.
- El contexto de 65536 tokens aparece en los argumentos de llama.cpp de la comparativa, no como especificación nativa confirmada del modelo base.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/fjcanyue-Lingshu-7B-loom
- Modelo base: https://huggingface.co/fjcanyue/Lingshu-7B-GGUF
- Repositorio del runtime: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecución de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45877013183
