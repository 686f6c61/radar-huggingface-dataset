# litert-community/Qwen3.8-27B

## Resumen

Qwen3.8-27B en formato LiteRT-LM es una conversión comunitaria del modelo denso Qwen3.8-27B de Alibaba Qwen al formato `.litertlm` de Google, pensada para ejecución en dispositivo (on-device) y en el borde (edge) mediante el runtime LiteRT-LM. El repositorio lo mantiene el colectivo litert-community y deriva del checkpoint original `Qwen/Qwen3.8-27B`, que Qwen describe como un modelo denso multimodal (visión y vídeo) con control flexible de razonamiento. Esta conversión, sin embargo, contiene únicamente el decodificador de texto: no incluye la torre de visión, la entrada de vídeo ni la cabeza de predicción multi-token del checkpoint original.

La arquitectura es la híbrida de Qwen3.5 a escala 27B: 64 capas organizadas en 16 grupos, cada uno con tres capas de atención lineal GatedDeltaNet y una capa de atención completa con compuerta, todas con FFN densa. El modelo tiene 26.895.998.464 parámetros en esta carga de solo texto (frente a los 27.781.427.952 del release completo), tamaño oculto de 5.120, FFN de 17.408, 24 cabezas de atención con 4 cabezas KV de 256 dimensiones y un vocabulario de 248.320 tokens con embeddings no atados.

Su relevancia actual radica en que permite ejecutar un modelo de 27B en máquinas de escritorio con GPU integrada o discreta de gama alta mediante cuantización mixta INT4, sin depender de servidores. El archivo publicado ocupa 15,38 GB y, según el autor, alcanza 175,5 tok/s en prefill y 18,2 tok/s en decodificación sobre una Mac Studio M4 Max. La limitación principal es que esta conversión solo funciona con el razonamiento desactivado: la plantilla de chat escribe un bloque `<think>` vacío y el bundle declara `supports_thinking: false`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas en 16 grupos de 3 capas GatedDeltaNet (atención lineal) + 1 capa de atención completa con compuerta; FFN densa |
| Parametros totales | 26.895.998.464 (solo texto); el release completo declara 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada de forma explícita; el archivo reserva un presupuesto de caché KV de 4.096 tokens para las 16 capas de atención completa |
| Tipos de cuantizacion | Mixta INT4: int4 blockwise-128 (min-max) en capas lineales, int8 en `lm_head` y embeddings, proyecciones de compuerta/decaimiento GatedDeltaNet (`in_proj_a`/`in_proj_b`) en float; activaciones GPU en fp32 |
| Idiomas soportados | No disponible (la model card no detalla la lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), un único archivo de 15.379.451.056 bytes (15,38 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura híbrida introducida en Qwen3.5: 64 capas agrupadas en 16 bloques, cada uno con tres capas de atención lineal GatedDeltaNet seguidas de una capa de atención completa con compuerta. Las capas lineales mantienen un estado convolucional y recurrente de tamaño constante, mientras que solo las 16 capas de atención completa acumulan una caché KV creciente (limitada a 4.096 tokens en este archivo). El tamaño oculto es 5.120, la FFN es de 17.408 y el vocabulario de 248.320 tokens usa embeddings no atados. La atención completa tiene 24 cabezas con 4 cabezas KV de 256 dimensiones (rotary position aplicado sobre 64 de esas 256 dimensiones); la atención lineal usa 16 cabezas de query/key y 48 cabezas de valor de 128 dimensiones.

El entrenamiento original lo realizó Qwen sobre el checkpoint Qwen3.8-27B; esta conversión no reentrena ni ajusta el modelo, solo transforma los pesos al formato LiteRT-LM mediante litert-torch (commit 115a1360) con el parche híbrido de Qwen3.5 de `hf-to-litertlm`. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO aplicadas por Qwen. El checkpoint original incluye una cabeza de predicción multi-token y capacidades multimodales que no se conservan en esta conversión. La innovación técnica destacable es la propia combinación de atención lineal y completa para reducir el coste de memoria de la caché KV en secuencias largas.

## Capacidades

- Generación de texto en modo conversacional, con razonamiento desactivado de forma obligatoria en este archivo.
- Razonamiento y matemáticas: la model card reporta una puntuación de 97 en GSM8K (thinking off, 2.048 tokens de salida) en GPU de Mac, frente a 96 del modelo bf16 en transformers.
- Soporte de function calling / tool calling: desde la actualización del 3 de noviembre de 2026, los metadatos incluyen `tool_call_config` y `supports_function_calling: true`, y LiteRT-LM 0.19.0 devuelve las llamadas como tool calls estructuradas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin capacidades de visión ni vídeo: aunque el modelo base es nativo visión-lenguaje, este archivo solo contiene el decodificador de texto.
- Sin modo de razonamiento (thinking): la plantilla no lee `enable_thinking` ni `reasoning_effort`; el bundle declara `supports_thinking: false`.
- Sin cabeza de predicción multi-token en esta conversión.

## Casos de uso

- Asistente conversacional local en estación de trabajo: el modelo puede mantener diálogos multi-turno con un presupuesto de caché KV de 4.096 tokens para las capas de atención completa, adecuado para sesiones de asistencia en escritorio sin conexión a servicios en la nube.
- Automatización de agentes con herramientas: gracias al soporte de `tool_call_config` en LiteRT-LM 0.19.0, puede integrarse en flujos que invocan APIs externas, consultas a bases de datos o ejecución de comandos, devolviendo llamadas estructuradas en lugar de texto plano.
- Procesamiento de documentos y resumen en el borde: con 15,38 GB de pesos cuantizados, puede desplegarse en equipos de escritorio con GPU de gama alta para resumir, clasificar o extraer información de textos largos sin enviar datos a terceros.
- Razonamiento matemático y resolución de problemas: la puntuación de 97 en GSM8K (thinking off) lo hace utilizable en tutores automáticos o verificadores de cálculos paso a paso en entornos educativos locales.
- Generación de código en pipelines de desarrollo: puede integrarse en herramientas de CI/CD o asistentes de IDE que se ejecutan en la máquina del desarrollador, con la ventaja de no exponer el código a servicios externos.
- Evaluación y prototipado de modelos en formato LiteRT-LM: sirve como banco de pruebas para desarrolladores que quieran medir el rendimiento de un modelo de 27B en hardware de escritorio antes de decidir un despliegue mayor.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es adecuado para sectores regulados (sanidad, legal, finanzas) donde los datos no pueden salir del dispositivo.

## Benchmarks y rendimiento

Los datos disponibles son los reportados por el autor de la conversión y por Qwen (vendor-reported); no se han ejecutado de forma independiente en esta ficha.

| Benchmark | Resultado | Condiciones |
|---|---|---|
| GSM8K | 97 | Thinking off, 2.048 tokens de salida, GPU de Mac M4 Max (archivo LiteRT-LM) |
| GSM8K | 96 | Thinking off, modelo bf16 en transformers (referencia) |
| GPQA Diamond | 89,2 | Reportado por Qwen para el modelo original |
| IFBench | 79,5 | Reportado por Qwen para el modelo original |

| Métrica de rendimiento | Valor | Condiciones |
|---|---|---|
| Prefill | 175,5 tok/s | 1.024 tokens, GPU de Mac Studio M4 Max |
| Decodificación | 18,2 tok/s | GPU de Mac Studio M4 Max |
| Tiempo total (1.024 prefill + 256 decode, contexto 2.048) | 19,87 s | GPU de Mac |
| Tiempo total (mismas condiciones) | 92,74 s | CPU de Mac con caché de pesos |

## Requisitos de hardware

- VRAM estimada: el archivo `.litertlm` ocupa 15,38 GB; se necesita al menos esa cantidad de memoria unificada o VRAM, más overhead para activaciones y caché KV (presupuesto de 4.096 tokens en las 16 capas de atención completa).
- GPU recomendadas: el autor solo ha medido en Mac Studio M4 Max (GPU integrada de Apple Silicon). No se han publicado mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en teoría, en GPUs con 16 GB o más de VRAM (RTX 4080/4090, RTX 5080/5090) o en equipos Apple Silicon con memoria unificada de 16 GB o superior; no hay mediciones publicadas en estas plataformas.
- Opciones de despliegue: runtime LiteRT-LM (versión 0.18.1 y 0.19.0 verificadas); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 19,87 s para 1.024 tokens de prefill más 256 de decodificación en GPU de Mac; 92,74 s en CPU de Mac. En decodificación sostenida, 18,2 tok/s en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (LiteRT-LM, esta ficha) | 26,9B (solo texto) | Caché KV de 4.096 tokens | Apache 2.0 | `.litertlm` | HuggingFace, 177 descargas |
| Qwen/Qwen3.8-27B (original) | 27,8B (multimodal) | No disponible | Apache 2.0 (según base) | safetensors (presumible) | HuggingFace |
| Modelos densos de ~27B de la familia Qwen3.5 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sin modo de razonamiento: la plantilla de chat escribe un bloque `<think>` vacío y el bundle declara `supports_thinking: false`; no se puede activar thinking en este archivo.
- Sin capacidades multimodales: aunque el modelo base entiende imágenes y vídeo, esta conversión solo incluye el decodificador de texto.
- Sin cabeza de predicción multi-token: la funcionalidad del checkpoint original no está disponible aquí.
- Contexto limitado: la caché KV de las capas de atención completa se limita a 4.096 tokens, lo que restringe conversaciones y documentos largos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación para esta conversión.
- Sesgos: no se dispone de información sobre sesgos conocidos del modelo base ni de esta conversión.
- Idiomas: la model card no detalla la lista de idiomas soportados.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento originales pueden tener condiciones adicionales no detalladas aquí.
- Compatibilidad: verificada con LiteRT-LM 0.18.1 y 0.19.0; el comportamiento con otras versiones del runtime no está documentado.
- Medición limitada: todos los datos de rendimiento provienen de una Mac Studio M4 Max; no hay mediciones en GPUs NVIDIA ni en otras plataformas.
- Conversión comunitaria: no es un release oficial de Qwen; la responsabilidad del mantenimiento recae en litert-community.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Configuración de metadatos Qwen3.5 en LiteRT-LM v0.19.0: https://github.com/google-ai-edge/LiteRT-LM/blob/v0.19.0/models/qwen3_5/LlmMetadataProto.pbtext
- Herramienta de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
