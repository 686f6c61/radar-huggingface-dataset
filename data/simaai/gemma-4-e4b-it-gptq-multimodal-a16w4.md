# simaai/Gemma-4-E4B-it-GPTQ-Multimodal-a16w4

## Resumen

Gemma-4-E4B-it-GPTQ-Multimodal-a16w4 es una compilación del modelo instructivo Gemma 4 E4B de Google, publicada por SiMa.ai para su plataforma de hardware Modalix. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales en BF16 se han cuantizado (GPTQ INT4 para el decodificador, INT8 para los encoders y proyectores) y se han compilado a ejecutables MLA específicos para el acelerador de SiMa.ai, con 242 binarios incluidos en el paquete.

El modelo base es multimodal de tipo any-to-any: acepta texto, imagen y audio como entrada y genera texto. La compilación fija una ventana de contexto de 4096 tokens (ampliable a 8192 recompilando), entrada de visión de 480 × 480 píxeles y clips de audio de hasta 30 segundos a 16 kHz mono. El repositorio ocupa 9,9 GB e incluye el devkit y los ficheros ELF necesarios para el runtime LLiMa.

Es relevante porque ejemplifica el patrón de despliegue en el borde (edge) de modelos multimodales de tamaño medio: cuantización agresiva a INT4/INT8 combinada con compilación estática para un acelerador concreto. Ahora bien, el propio autor advierte que la generación y la latencia en el runtime Modalix no se han probado, y que el build depende de un runtime LLiMa con soporte de audio Gemma 4 que aún no está en la rama principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, vision, audio) compilado para SiMa Modalix; decodificador con GPTQ INT4, encoders con INT8 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (compilado); recompilable a 8192 |
| Tipos de cuantizacion | GPTQ INT4 simetrico G256 (decoder, proyecciones PLE, LM head); RTN INT8 simetrico por canal de salida (encoders vision/audio y proyectores); embeddings y KV cache INT8; convoluciones de audio pequenas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la del modelo base google/gemma-4-E4B-it) |
| Formato de pesos | Artefacto compilado LLiMa (ELF/MLA), no safetensors ni GGUF; incluye devkit y 242 ejecutables MLA |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 E4B en su variante instructiva, un transformer multimodal con torres separadas para visión y audio, un proyector hacia el espacio del decodificador y una cabeza LM independiente (untied LM head). Esta publicación no entrena ni afina el modelo: parte de un checkpoint precompilado y prequantizado (`simaai/Gemma-4-E4B-it-GPTQ-Multimodal-Safetensors`, no publicado en el Hub) y lo compila con el SiMa Model SDK 3.0.0 y la herramienta LLiMa.

La innovación técnica aquí no está en el entrenamiento sino en el pipeline de despliegue: cuantización GPTQ simétrica de 4 bits con grupos de 256 para el decodificador, cuantización RTN INT8 por canal para los encoders y proyectores, tablas de embeddings y KV cache en INT8, y compartición automática del filtro de lenguaje. El prefill se compila con n128 y el contexto máximo es de 4096 tokens, que incluye tanto la entrada como la generación. El autor documenta la procedencia exacta de la compilación en `compilation.json` y `recipe.yaml`, y permite recompilar a 8192 tokens modificando `--max_num_tokens` en `compile.sh`, a costa de mayor memoria de KV cache.

## Capacidades

- Generación de texto a partir de entradas de texto, imagen y audio (pipeline any-to-any con salida exclusivamente textual).
- Comprensión de imágenes con entrada fija de 480 × 480 píxeles, incluyendo OCR de alta resolución según la validación del autor.
- Comprensión de audio: clips de hasta 30 segundos, 16 kHz mono, con 12 capas de audio compiladas.
- Razonamiento y respuesta instructiva heredados de Gemma 4 E4B-it, con la salvedad de que en la comparativa de cuantización se desactivó el modo de razonamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no disponible en la información proporcionada para este build.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- No incluye generación de imagen ni de audio; la salida es solo texto.

## Casos de uso

- OCR y digitalización de documentos en dispositivo: la validación del autor muestra 6/6 en OCR de alta resolución tanto en BF16 como en cuantizado, lo que lo hace apto para extraer texto de facturas, formularios o etiquetas en hardware Modalix sin depender de la nube.
- Asistencia por voz en el borde: con clips de hasta 30 segundos a 16 kHz mono, puede transcribir y responder consultas habladas en kioscos, electrodomésticos o interfaces de vehículo, manteniendo el audio local.
- Descripción de imágenes para accesibilidad: entrada de 480 × 480 permite generar descripciones de escenas capturadas por cámaras integradas en dispositivos con presupuesto energético limitado.
- Moderación de contenido multimodal: clasificación y resumen de imágenes y audio cortos en pipelines de revisión, aprovechando que el modelo corre compilado en el acelerador y no requiere GPU dedicada.
- Asistente conversacional embebido con contexto de 4K: suficiente para diálogos multi-turno con historial moderado en dispositivos de atención al cliente o paneles industriales; para historiales más largos habría que recompilar a 8192 tokens.
- Procesamiento de audio en lotes pequeños: la comparativa reporta un CER medio del 8,01 % en 400 clips, útil para tareas de transcripción tolerantes a error en entornos con conectividad intermitente.
- Prototipado e investigación en hardware SiMa: el paquete incluye devkit, `compile.sh` y artefactos verificados, lo que permite reproducir el build y experimentar con variantes de cuantización o contexto.

## Benchmarks y rendimiento

Los únicos datos publicados son la comparativa de cuantización de pesos en GPU (mismos inputs, decodificación greedy, razonamiento desactivado). El autor advierte explícitamente que no incluyen cuantización de activaciones de SiMa ni ejecución del modelo compilado.

| Evaluación | BF16 original | Cuantizado |
|---|---:|---:|
| Visión | 27/34 | 25/34 |
| OCR de alta resolución | 6/6 | 6/6 |
| Texto corto | 11/20 | 11/20 |
| Texto difícil, hasta 4K de contexto | 11/18 | 6/18 |
| CER medio de lenguaje, 400 clips de audio (menor es mejor) | 7,62 % | 8,01 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni latencia/throughput en Modalix en la información disponible.

## Requisitos de hardware

- Hardware objetivo: acelerador SiMa.ai Modalix; no es un modelo ejecutable en GPU convencional tal como se distribuye (los artefactos son ELF/MLA compilados).
- VRAM estimada: no aplica; el consumo depende de la memoria del dispositivo Modalix y del tamaño del KV cache INT8 para 4096 tokens.
- GPU recomendadas: no disponible para este build; la comparativa de cuantización se hizo en GPU pero no se especifica el modelo.
- ¿Cabe en GPU de consumo? No en su forma compilada; requeriría el checkpoint prequantizado en safetensors y un runtime distinto, no publicado en el Hub.
- Opciones de despliegue: `llima run` sobre el paquete descargado, con un runtime LLiMa que incluya la implementación de audio Gemma 4 (rama `feature/327-gemma4-audio`). No compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no medidos en Modalix según el autor.
- Recompilación: requiere SiMa Model Compiler y entorno LLiMa; el contexto de 8192 tokens aumenta la memoria de KV cache y debe caber en el dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Gemma-4-E4B-it-GPTQ-Multimodal-a16w4 (este) | no disponible | 4096 (recompilable a 8192) | texto, imagen, audio → texto | Apache 2.0 | ELF/MLA compilado para SiMa Modalix |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | texto, imagen, audio → texto | Apache 2.0 | safetensors, ejecutable en GPU |
| Modelos multimodales edge de 4B-8B (p. ej. variantes cuantizadas de Gemma/Qwen) | ~4-8B | 8K-128K típicamente | texto + visión | variable | GGUF, GPTQ, AWQ |

La comparación directa con alternativas concretas no está disponible en la información proporcionada: no se especifican parámetros totales del modelo base ni resultados de benchmarks frente a otros modelos. La diferencia clave frente al checkpoint original es el formato: este build solo se ejecuta en hardware SiMa Modalix, mientras que el base requiere GPU o CPU con un runtime estándar.

## Limitaciones y advertencias

- El autor declara que la generación y la latencia en el runtime Modalix no se han probado; la validación se limita a compilación con código de salida 0 y verificación de checksums de los ELF.
- Dependencia de un runtime LLiMa no publicado: el build incluye cambios locales sobre `feature/327-gemma4-audio` que el commit base registrado no contiene. Sin ese runtime, el modelo no arranca.
- Degradación notable en texto difícil con contexto largo: 6/18 frente a 11/18 en BF16, la mayor pérdida de la comparativa. No recomendable para tareas de razonamiento complejo con contextos cercanos a 4K.
- Pérdida moderada en visión (25/34 frente a 27/34) y ligero aumento del CER de audio (8,01 % frente a 7,62 %).
- Contexto efectivo de 4096 tokens compartido entre entrada y salida; insuficiente para documentos largos o historiales extensos sin recompilar.
- Entrada de imagen fija a 480 × 480 y audio limitado a 30 segundos por clip; no admite flujos de vídeo ni audio largo.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe más allá de lo que herede el modelo base.
- Riesgo de alucinación inherente a un modelo instructivo de este tamaño, agravado por la cuantización INT4; requiere validación en producción.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base Gemma 4.
- Licencia Apache 2.0 según el autor, con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de uso de Gemma antes de un despliegue comercial, ya que el modelo base arrastra sus propias condiciones.
- El checkpoint prequantizado de origen no está publicado en el Hub, lo que dificulta reproducir el build sin acceso a los artefactos internos de SiMa.

## Enlaces

- Hugging Face: https://huggingface.co/simaai/Gemma-4-E4B-it-GPTQ-Multimodal-a16w4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it/tree/83df0a889143b1dbfc61b591bbc639540fd9ce4c
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Colección Neat 0.6.0: https://huggingface.co/collections/florianvoss/neat-060
- Ficheros de procedencia citados en la model card: `compilation.json`, `recipe.yaml`, `compile.sh`, `evaluation.json` (incluidos en el repositorio)
