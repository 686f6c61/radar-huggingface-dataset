# pyros-vault/Nanbeige4.3-33B-oQ4e

## Resumen

Nanbeige4.3-33B-oQ4e es una compilación cuantizada para Apple MLX del modelo denso Nanbeige4.3-33B del equipo Nanbeige, publicada por pyros-vault con el método oQ de oMLX a 4 bits nominales. El modelo original es un transformer denso de 33.118.977.024 parámetros (52 capas, dimensión oculta 7.168, 56 cabezas de atención con 8 cabezas KV) diseñado específicamente para trabajo agéntico: uso de herramientas, codificación en terminal y tareas de oficina, con un modo de razonamiento explícito activable mediante la plantilla de chat.

La relevancia de esta ficha concreta es de despliegue, no de investigación: el repositorio empaqueta los pesos en safetensors MLX (4 shards, 19.457.774.524 bytes, 18,12 GiB, ~4,70 bits por peso con escalas) y una configuración con 524.288 tokens de contexto, de modo que el modelo pueda ejecutarse en Apple Silicon a través del servidor compatible con OpenAI de oMLX. No es un artefacto GGUF ni de Transformers, y no funciona sobre CUDA.

El modelo base se publicó bajo licencia Apache-2.0 con soporte de inglés y chino, y el equipo Nanbeige lo posiciona como el modelo profesor de la serie 4.3, del que derivan las variantes más pequeñas. Esta cuantización conserva esa licencia y añade una calibración específica con un conjunto multilingüe de código (`oqe_code_multilingual`, 128 muestras de 512 tokens).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama (`LlamaForCausalLM`), transformer denso |
| Parámetros totales | 33.118.977.024 (33,1B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens según el `config` del repositorio (valor de configuración, no verificado en pruebas) |
| Tipos de cuantización | oQ afín de 4 bits con grupo de 64 como configuración por defecto; 32 tensores conservan más precisión: `embed_tokens` a 8 bits, ocho `v_proj` y un `down_proj` a 6 bits, 22 tensores de atención y `down_proj` a 5 bits; `lm_head` a 4 bits. Variantes disponibles: oQ6 (6 bits, 25,83 GiB) y oQ8 (8 bits, 32,77 GiB) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors MLX, 4 shards, con índice, config, tokenizer y plantilla de chat incluidos; ~4,70 bits por peso efectivos |

## Arquitectura y entrenamiento

El modelo base es un transformer denso tipo Llama, sin mezcla de expertos: 52 capas, `hidden_size` de 7.168, 56 cabezas de atención y 8 cabezas KV (GQA con ratio 7:1), lo que reduce el tamaño del caché KV por token. Según la model card del repositorio cuantizado, el equipo Nanbeige lo entrenó como modelo profesor de la serie 4.3 y lo orientó a flujos agénticos y de oficina, con un modo de razonamiento (`enable_thinking`, activado por defecto) y soporte nativo de tool calling a través de la plantilla de chat, con formato XML como opción recomendada para las llamadas a herramientas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO u otras) en la documentación consultada; esos datos no aparecen ni en la model card del repositorio cuantizado ni en las fuentes secundarias localizadas. La innovación técnica documentada en este repositorio es la cuantización: calibración con una matriz de importancia sobre 128 secuencias de 512 tokens, 364 entradas de importancia aplicadas a 364 módulos lineales, sin discrepancias de forma, y una asignación no uniforme de bits que protege las proyecciones de valor y las proyecciones de salida de atención.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat propia del modelo base.
- Modo de razonamiento explícito activable mediante el argumento `enable_thinking` de la plantilla; desactivable para respuestas directas sin cadena de pensamiento.
- Razonamiento multi-turno persistente: `preserve_thinking` permite conservar el razonamiento de turnos anteriores del asistente, recomendado para uso de herramientas multi-turno, tareas de oficina y agentes de código.
- Tool calling / function calling nativo, con dos formatos de serialización (`xml`, recomendado para mejores llamadas, y `json`).
- Ejecución de tareas agénticas en terminal y entornos de línea de comandos, evaluada por el equipo en Terminal-Bench.
- Codificación de software: generación, modificación y comprensión de código en repositorios, evaluada en DeepSWE.
- Tareas de oficina ("cowork"): redacción, transformación y manejo de documentos en flujos asistidos por herramientas.
- Contexto largo: configuración de hasta 524.288 tokens, útil para repositorios o documentos extensos, condicionado al presupuesto de memoria del caché KV.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Agentes de codificación en terminal: el modelo está entrenado y evaluado para operar sobre entornos de línea de comandos, de modo que puede integrarse en bucles de agente que ejecutan comandos, leen la salida y aplican parches sucesivos sobre un repositorio.
- Refactorización de repositorios completos: con la configuración de 524.288 tokens y `preserve_thinking=true`, puede mantener el estado de razonamiento entre pasos de un agente que recorre varios ficheros y conserva el plan de cambios entre llamadas.
- Orquestación de herramientas en pipelines de CI/CD: el soporte de tool calling con formato `xml` y su `max_new_tokens` recomendado de 65.536 para tareas agénticas permiten definir herramientas de compilación, test y despliegue y dejar que el modelo enlace llamadas en varios pasos.
- Automatización de tareas de oficina: generación y reescritura de documentos, resúmenes de actas o extracción estructurada de información, con herramientas que accedan a ficheros o APIs; el modelo base fue orientado explícitamente a este perfil "cowork".
- Asistente local con privacidad de datos en macOS: al ejecutarse mediante oMLX sobre Apple Silicon, los pesos y el contexto permanecen en la máquina, lo que encaja en entornos donde no se permite enviar código o documentos a APIs externas.
- Atención al cliente bilingüe inglés-chino: conversaciones multi-turno con `preserve_thinking=false` para respuestas directas, y temperatura 0,6 con top-p 0,95 según la recomendación del equipo para chat y razonamiento.
- Generación de datos y destilación: al ser el modelo profesor de la serie 4.3, sirve para producir trazas de razonamiento y llamadas a herramientas que alimenten el ajuste de los modelos pequeños de la familia.
- Análisis de documentación técnica extensa: con cuantización del caché KV y contexto efectivo moderado (32K-128K) puede resumir manuales o especificaciones largas en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta variante cuantizada. El repositorio de pyros-vault declara explícitamente que no publica comparaciones de calidad, memoria, tiempo hasta el primer token ni throughput en un Mac.

Las siguientes cifras corresponden al modelo base Nanbeige4.3-33B según fuentes secundarias que citan su model card; no han sido verificadas de forma independiente ni son necesariamente extrapolables a esta cuantización de 4 bits.

| Benchmark | Nanbeige4.3-33B | Referencia comparada | Fuente |
|---|---:|---|---|
| Terminal-Bench 2.1 | 80,9 | Lidera a tres modelos comparables de clase 30B en la mayoría de pruebas agénticas (sin cifras detalladas) | explainx.ai |
| Terminal-Bench 4.0 | 23,8 | Qwen3.8-27B: 6,3 | Publicación en X |
| DeepSWE | 65,5 | Qwen3.8-27B: 42,5 | startupfortune.com |

Existe una discrepancia aparente entre las cifras de Terminal-Bench 2.1 y Terminal-Bench 4.0 que las fuentes no aclaran; pueden corresponder a versiones distintas del benchmark o a configuraciones de evaluación diferentes. Trátense como orientativas.

## Requisitos de hardware

- VRAM o memoria unificada: los pesos de esta variante ocupan 18,12 GiB (19.457.774.524 bytes). A ello se suma el caché KV, estimado por el autor en 208 KiB por token a fp16 (52 capas × 8 cabezas KV × 128 dimensiones × claves y valores × 2 bytes), sin cuantización de caché ni buffers del runtime.
- Caché KV estimado: 6,50 GiB a 32K de contexto; 26,00 GiB a 128K; 104,00 GiB a 512K. El contexto máximo de la configuración no cabe en ninguna máquina de consumo actual.
- Hardware compatible: exclusivamente Apple Silicon con macOS a través de MLX/oMLX. No hay soporte CUDA ni ROCm en este repositorio.
- Memoria recomendada: 32 GB de memoria unificada como mínimo para contexto corto (pesos + 32K de caché + buffers del sistema); 64 GB o más para contextos de 128K; 128 GB o superior para acercarse a contextos muy largos.
- GPU NVIDIA (A100, H100, RTX 4090): no aplicables a este artefacto. Para esas plataformas habría que recurrir a los pesos originales del modelo base en otro formato.
- Opciones de despliegue: oMLX con servidor compatible con OpenAI (`omlx serve --model-dir`), instalable vía Homebrew. No se sirve en la inferencia alojada de Hugging Face. No es compatible con llama.cpp, Ollama, vLLM ni TGI en este formato.
- Alternativas de tamaño: oQ6 (25,83 GiB, 6 shards) y oQ8 (32,77 GiB, 7 shards) del mismo autor, para máquinas con más memoria unificada.
- Latencia y throughput: no disponibles. El autor no publica tiempos hasta el primer token ni tokens por segundo en ningún Mac concreto.
- Muestreo recomendado por el equipo: temperatura 1,0 y top-p 0,95 con 65.536 tokens nuevos para tareas agénticas y de herramientas; temperatura 0,6 y top-p 0,95 con 262.144 tokens nuevos para razonamiento y chat.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-oQ4e (esta ficha) | 33,1B denso | 524.288 en config | Safetensors MLX, oMLX | Apache-2.0 | Hugging Face, 0 descargas, 0 likes en el momento de la consulta |
| Nanbeige4.3-33B-oQ6 | 33,1B denso | 524.288 en config | Safetensors MLX, oMLX | Apache-2.0 | Hugging Face, mismo autor |
| Nanbeige4.3-33B-oQ8 | 33,1B denso | 524.288 en config | Safetensors MLX, oMLX | Apache-2.0 | Hugging Face, mismo autor |
| Nanbeige4.3-33B (original) | 33,1B denso | 524.288 | Pesos completos para Transformers | Apache-2.0 | Hugging Face, modelo base |
| Qwen3.8-27B | no disponible en las fuentes | no disponible | no disponible | no disponible | Referencia de comparación en Terminal-Bench 4.0 (6,3) y DeepSWE (42,5) |

La comparación con Qwen3.8-27B solo está documentada en dos benchmarks por fuentes secundarias; no se dispone de datos de arquitectura, contexto, licencia ni formato para ese modelo en la información consultada. Para el resto de alternativas de clase 30B mencionadas de forma genérica (Gemma y otras), no hay cifras concretas disponibles.

## Limitaciones y advertencias

- Dependencia de plataforma: MLX y oMLX solo funcionan en Apple Silicon con macOS; el repositorio no se ejecuta sobre CUDA y no es un artefacto de Transformers ni un GGUF.
- Inferencia alojada no soportada: Hugging Face no sirve este formato propietario de MLX, por lo que hay que descargar el repositorio completo con el índice, la config, el tokenizer y la plantilla de chat.
- Contexto no verificado: los 524.288 tokens son el valor del `config`, no una prueba de que el modelo mantenga calidad a esa longitud ni de que quepa en la máquina del usuario (104 GiB solo de caché KV a fp16).
- Riesgo de degradación por cuantización: el autor advierte explícitamente de que la cuantización puede alterar la calidad de salida y recomienda evaluar la variante sobre la carga de trabajo propia.
- Idiomas: solo inglés y chino declarados; no hay soporte declarado de castellano, por lo que el rendimiento en español no está garantizado.
- Dependencia de la versión del runtime: que la petición pueda establecer `enable_thinking`, `preserve_thinking` o `tool_call_format` depende de la versión de oMLX y del cliente utilizado.
- Riesgo de alucinación: no cuantificado en la información disponible; como en cualquier modelo de 33B sin datos publicados de evaluación en castellano, conviene validar las salidas en producción.
- Sesgos: no documentados en la información proporcionada.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay histórico de uso ni validación comunitaria.
- Licencia: Apache-2.0 permite uso comercial, pero al ser una obra derivada conviene conservar los avisos de atribución al equipo Nanbeige y al cuantizador, tal como indica la model card.
- Benchmarks no extrapolables: las cifras de Terminal-Bench y DeepSWE provienen de fuentes secundarias que citan la model card del modelo base; no hay medición publicada sobre esta cuantización de 4 bits.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/pyros-vault/Nanbeige4.3-33B-oQ4e
- Variante oQ6: https://huggingface.co/pyros-vault/Nanbeige4.3-33B-oQ6
- Variante oQ8: https://huggingface.co/pyros-vault/Nanbeige4.3-33B-oQ8
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Runtime oMLX / método oQ: https://github.com/jundot/omlx
- Perfil del cuantizador: https://huggingface.co/pyros-vault
- Guía del modelo en explainx.ai: https://explainx.ai/blog/nanbeige-4-3-33b-open-agentic-model-guide-2026
- Artículo en startupfortune.com: https://startupfortune.com/nanbeiges-new-33b-open-model-takes-aim-at-qwen-and-gemma-on-coding/
- Publicación en X con cifras de Terminal-Bench 4.0: https://x.com/ItsmeAjayKV/status/2114345524723884097
- Modelo relacionado de la familia: https://huggingface.co/Nanbeige/Nanbeige4-3B-Base
- Documentación de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
