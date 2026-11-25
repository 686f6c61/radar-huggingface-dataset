# gecBurton/clef-omni-gguf

## Resumen

clef-omni GGUF es una conversión comunitaria al formato GGUF del modelo Cloudflare/clef-omni, un modelo de decisión multimodal de arquitectura MoE (30B-A3B, es decir, 30.641.822.724 parámetros totales con aproximadamente 3B activos según la nomenclatura del autor). A diferencia de un modelo generativo convencional, clef-omni no produce texto libre: recibe un estado (texto) junto con ficheros de imagen, audio, vídeo o JSON y responde a preguntas tipadas y con nombre (`noul`, `choice`, `score`) devolviendo probabilidades calibradas en una sola pasada forward. La conversión la mantiene el usuario gecBurton y no está validada ni respaldada por Cloudflare.

El modelo encaja en la categoría de "modelo del sistema 1" (system-one): está diseñado para tomar decisiones rápidas y acotadas sobre una entrada multimodal, en lugar de razonar de forma extensa. La API expuesta por el servidor llama.cpp es `/v1/systemone`, y el modelo base se invoca en Cloudflare Workers AI como `@cf/cloudflare/clef-omni`.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de decisión multimodal de 30B sin depender del endpoint alojado de Cloudflare. No obstante, la conversión presenta una restricción crítica: solo funciona con un fork específico de llama.cpp que implementa el soporte del cabezal de decisión (`dec.blk.`), y no con la rama principal de `ggml-org/llama.cpp`. La licencia es Apache-2.0, heredada de los pesos originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) multimodal, modelo de decisión con cabezal tipado (`noul`, `choice`, `score`) |
| Parámetros totales | 30.641.822.724 |
| Parámetros activos | aproximadamente 3B (nomenclatura A3B del autor; no se detalla el número exacto) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-b 8192 -ub 8192`) |
| Tipos de cuantización | Q4_K_M (4,86 bpw) y Q8_0; torres mmproj en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (los pesos originales de Cloudflare/clef-omni aplican) |
| Formato de pesos | GGUF (con fichero mmproj separado para visión y audio) |

## Arquitectura y entrenamiento

clef-omni es un modelo MoE multimodal con un cabezal de decisión conjunto. En lugar de generar tokens de texto, el modelo procesa un estado textual y una serie de ficheros adjuntos (texto, JSON, imágenes, audio y vídeo) en una única pasada forward, y emite respuestas a preguntas con nombre y tipo predefinido. Los tipos de pregunta documentados son `noul` (selección única entre opciones), `choice` (elección entre criterios con etiqueta) y `score` (puntuación calibrada por opción). El modelo integra torres de visión y audio que se distribuyen en el fichero `mmproj-clef-omni-bf16.gguf` (2,2 GB).

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card de la conversión tampoco documenta innovaciones como decodificación especulativa o atención lineal. El aspecto técnico más destacable es el diseño de "system-one": el modelo devuelve probabilidades calibradas en lugar de texto generado, lo que reduce la latencia y elimina el riesgo de alucinación textual, aunque traslada la responsabilidad de calibración al cabezal de decisión.

La conversión a GGUF se realizó con `convert_hf_to_gguf.py` en dos pasos: primero a Q8_0 como referencia y después a Q4_K_M mediante `llama-quantize --allow-requantize`. El paso a Q4_K_M requiere un parche de dos líneas en `src/llama-quant.cpp` para reconocer el prefijo de tensores `dec.blk.` del cabezal de decisión.

## Capacidades

- Respuesta a preguntas tipadas con nombre sobre un estado dado: `noul`, `choice` y `score`, con salida de probabilidades calibradas en lugar de texto.
- Procesamiento multimodal conjunto de texto, JSON, imágenes, audio y vídeo en una sola pasada forward.
- Clasificación de audio (por ejemplo, distinguir entre petición, pregunta o discurso) mediante la torre de audio incluida en el mmproj.
- Clasificación y puntuación de imágenes y vídeo con la torre de visión.
- Decisión de sistema 1: respuestas de baja latencia sin generación autoregresiva de texto.
- Compatibilidad con endpoints: la API `/v1/systemone` sigue un esquema JSON con campos `state`, `files` y `questions`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo está diseñado explícitamente para decisiones de un solo paso).
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Modo thinking, visión extendida o audio en streaming: no disponible.

## Casos de uso

- Moderación y clasificación de audio en tiempo real: el modelo puede recibir un fragmento de audio y un estado textual y devolver la probabilidad de que la locución sea una petición, una pregunta o un discurso, usando la torre de audio y el tipo de pregunta `choice`.
- Enrutamiento de tickets de soporte: dado el texto de una incidencia y metadatos JSON, el modelo puntúa con `score` la probabilidad de cada categoría de enrutamiento, lo que permite umbrales calibrados en lugar de etiquetas duras.
- Verificación de contenido visual: con una imagen y un estado que describe la política, el modelo devuelve la probabilidad de que la imagen cumpla o incumpla cada criterio, adecuado para pipelines de revisión automática.
- Clasificación de intención en asistentes de voz: la entrada de audio más un estado de conversación permite decidir si el usuario hace una pregunta o da una orden, con salida probabilística que alimenta un enrutador posterior.
- Triage de vídeo en plataformas de contenido: el modelo puede puntuar fragmentos de vídeo contra criterios definidos (por ejemplo, presencia de marcas o contenido sensible) en una sola pasada, sin generación de texto.
- Automatización de decisiones en formularios y JSON: dado un estado estructurado, el modelo responde a preguntas `noul` sobre campos concretos, útil para validación de datos y extracción de decisiones en pipelines de ingesta.
- Evaluación de calidad en producción: el cabezal `score` permite obtener probabilidades calibradas para comparar contra la versión alojada de Cloudflare, como hace la validación de paridad de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí documenta una validación de paridad frente al endpoint alojado `@cf/cloudflare/clef-omni` (bf16, GPU) sobre una batería de texto, imagen y audio, ejecutada en CPU sobre Apple Silicon:

| Métrica | Q8_0 | Q4_K_M |
|---|---|---|
| Acuerdo de argmax | 100 % | 100 % |
| Desviación máxima en probabilidades | 0,0142 (excepto un `noul` "sofa" a 0,0419) | la mayoría por debajo de 0,02; peor caso en `score` de bucket intermedio: 0,0491 |

Estos datos provienen de una validación de un solo operador y una batería de ejemplos pequeña, por lo que no equivalen a un benchmark público reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17 GB para Q4_K_M y unos 30 GB para Q8_0, más 2,2 GB del fichero mmproj (visión y audio).
- GPU recomendadas: no se documentan modelos concretos; la validación se realizó en CPU sobre Apple Silicon, lo que indica que el modelo puede ejecutarse sin GPU, aunque con latencia mayor.
- ¿Cabe en GPU de consumo? Q4_K_M (17 GB + 2,2 GB) requiere al menos 24 GB de VRAM para caber con margen, por lo que encaja en una RTX 4090 (24 GB) solo si se gestiona bien el contexto; Q8_0 no cabe en GPU de consumo de 24 GB.
- Opciones de despliegue: únicamente el fork de llama.cpp con soporte del cabezal de decisión (rama `pr/clef-omni` de WestWaters, head `18dd53ece`). La rama principal de `ggml-org/llama.cpp` no lo soporta todavía (feature request #32556). Ollama y LM Studio solo funcionarán cuando el soporte se integre en upstream.
- Comando de arranque documentado: `./llama-server -m clef-omni-Q4_K_M.gguf --mmproj mmproj-clef-omni-bf16.gguf -b 8192 -ub 8192`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada. Como referencia cualitativa, se puede contrastar con el modelo base alojado:

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| clef-omni GGUF (esta ficha) | 30,6B (MoE, ~3B activos) | no disponible | GGUF + mmproj | Apache-2.0 | llama.cpp fork local |
| Cloudflare/clef-omni (base) | 30,6B (MoE, ~3B activos) | no disponible | safetensors | Apache-2.0 | Cloudflare Workers AI (`@cf/cloudflare/clef-omni`) |

No se conocen alternativas de código abierto con el mismo diseño de modelo de decisión tipado y multimodal en la información disponible.

## Limitaciones y advertencias

- Conversión no oficial: no está validada ni respaldada por Cloudflare; los pesos originales y su licencia Apache-2.0 aplican.
- Solo funciona con un fork específico de llama.cpp; la rama principal no lo soporta y el soporte en Ollama o LM Studio no está garantizado hasta que se integre en upstream.
- La validación de paridad es de un solo operador y con una batería de ejemplos pequeña; no constituye una garantía de comportamiento en producción.
- La cuantización puede desplazar las probabilidades de buckets `score` ajustados; los valores intermedios son los más sensibles. El peor caso observado en Q4_K_M fue de 0,0491.
- El cabezal de decisión conjunto se cuantizó con `--allow-requantize`; si se requiere mayor fidelidad, sería necesaria una reconversión limpia en bf16.
- Riesgo de alucinación textual bajo por diseño (no genera texto), pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento, lo que afecta a decisiones con umbral.
- No se documentan idiomas soportados, sesgos conocidos ni limitaciones de contexto.
- El uso comercial está permitido por la licencia Apache-2.0, pero conviene verificar las condiciones de los pesos originales de Cloudflare/clef-omni.
- El repositorio tiene 138 descargas y 0 likes, lo que indica una adopción muy limitada y poca validación por parte de la comunidad.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/gecBurton/clef-omni-gguf
- Modelo base: https://huggingface.co/Cloudflare/clef-omni
- Fork de llama.cpp con el puerto clef-omni: https://github.com/WestWaters/llama.cpp (rama `pr/clef-omni`, head `18dd53ece`)
- Feature request en llama.cpp: https://github.com/ggml-org/llama.cpp/issues/32556
- Intento original de port: https://github.com/ggml-org/llama.cpp/pull/30356
