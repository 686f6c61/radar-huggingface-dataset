# saidutta69/gemma-4-12B-it-heretic

## Resumen

gemma-4-12B-it-heretic es una variante "decensored" (abliterada) del modelo multimodal google/gemma-4-12B-it, publicada por el usuario saidutta69 (bajo el seudónimo RACER IS OP). El modelo base es el modelo de 12B parámetros de la familia Gemma 4 de Google, orientado a entrada de texto, imagen, vídeo y audio con salida de texto, y esta variante suprime el comportamiento de rechazo mediante edición direccional de pesos (abliteration) en lugar de fine-tuning.

La relevancia de esta versión radica en que mantiene las capacidades multimodales y de razonamiento del modelo original con un daño colateral medido bajo (divergencia KL de 0.0357 respecto al original), reduciendo los rechazos en un conjunto de evaluación de comportamiento dañino de 99/100 a 37/100. El modelo se distribuye con pesos en safetensors (BF16) y un conjunto completo de cuantizaciones GGUF, lo que permite su despliegue en una sola GPU de consumo de gama alta.

Arquitectura Gemma 4 Unified con codificadores de visión y audio, contexto de 256K tokens y modos de razonamiento ("thinking") configurables. El repositorio ocupa 86.2 GB e incluye el recetario de reproducción completo de Heretic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 Unified (`gemma4_unified`), transformer multimodal con codificadores de visión y audio |
| Parametros totales | 11.959.730.176 (~12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | F16, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF); BF16 en safetensors |
| Idiomas soportados | en (inglés; el resto no disponible) |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (BF16, 5 shards) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer multimodal de la familia Gemma 4 con arquitectura "Unified" que integra percepción de texto, imagen, vídeo y audio con salida exclusivamente de texto. El modelo base incorpora modos de razonamiento configurables y una ventana de contexto de 256K tokens. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicó RLHF o DPO en el modelo original.

La modificación respecto al original es una abliteración realizada con Heretic v1.4.0 (ablación direccional), que identifica y edita las direcciones de pesos responsables del rechazo en las proyecciones de salida de atención (`attn.o_proj`) y en las down-projections del MLP (`mlp.down_proj`), sin tocar el resto de la red. Se trata del trial 100 de una ejecución de 200 trials con semilla `1180095890`, con `direction_index` único de 29.72. El repositorio incluye un directorio `reproduce/` con `config.toml`, `requirements.txt`, el journal del estudio Optuna y sumas SHA-256, lo que permite regenerar el modelo bit a bit con `heretic --reproduce reproduce/reproduce.json`.

## Capacidades

- Generación de texto y razonamiento con modos "thinking" configurables.
- Entrada multimodal: imagen, vídeo y audio con salida de texto (pipeline `any-to-any`).
- Comprensión de documentos, audio y vídeo, según el autor, con calidad notable a este tamaño.
- Contexto largo de 256K tokens para conversaciones y documentos extensos.
- Conversación multi-turno (tag `conversational`).
- Orientado a roleplay y uso en LLM local (tags `roleplay`, `local-llm`, `consumer-gpu`).
- Comportamiento de rechazo suprimido (37/100 rechazos en el conjunto de evaluación del autor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el modelo base incluye modos de razonamiento.

## Casos de uso

- Análisis de documentos largos con imágenes: gracias a sus 256K tokens de contexto y al codificador de visión, se puede introducir un informe escaneado con tablas y texto y pedir un resumen estructurado o extracción de datos en una sola pasada.
- Transcripción y análisis de audio: el codificador de audio permite procesar reuniones o notas de voz y generar actas, resúmenes o búsquedas sobre el contenido sin pipeline externo de ASR.
- Comprensión de vídeo para indexación: se pueden generar descripciones y metadatos de clips para sistemas de búsqueda o catalogación de archivos audiovisuales.
- Asistentes conversacionales de rol o narrativa interactiva: el ajuste abliterado y la ventana de contexto larga lo hacen adecuado para personajes persistentes con memoria de conversaciones extensas en entornos controlados.
- Prototipado local en una sola GPU de consumo: con Q5_K_M (7.96 GB) o Q6_K (9.11 GB) se puede desplegar en una RTX 4080/4090 para experimentación con modelos multimodales sin infraestructura de datacenter.
- Evaluación de seguridad y red-teaming: al ser una variante abliterada con métricas de rechazo y divergencia KL documentadas, sirve para estudiar el efecto de la ablación direccional en modelos multimodales.
- Generación de descripciones accesibles de imágenes y vídeo en pipelines internos, aprovechando la entrada multimodal y el contexto largo para procesar lotes con instrucciones complejas.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (google/gemma-4-12B-it) |
|---|---|---|
| Divergencia KL | 0.0357 | 0 (por definición) |
| Rechazos (conjunto de evaluación dañino) | 37/100 | 99/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas aportadas son las de abliteración (divergencia KL y tasa de rechazos) proporcionadas por el autor.

## Requisitos de hardware

- Pesos en BF16 (safetensors): ~24 GB, requiere GPU de 48 GB o más para inferencia sin cuantizar.
- GGUF Q8_0: 11.80 GB de pesos; recomendado para RTX 6000 Ada o A100 (48 GB).
- GGUF Q6_K: 9.11 GB; recomendado para RTX 4090 / 5090 (24 GB).
- GGUF Q5_K_M: 7.96 GB; recomendado para RTX 4080 / 5080 (16 GB), RTX 3090 con offload en doble GPU y sistemas solo CPU con 32 GB+ de RAM.
- GGUF Q4_K_M: 6.87 GB; mínimo práctico para sistemas de 16 GB de RAM solo CPU.
- GGUF F16: 22.20 GB.
- El autor indica añadir ~2 GB por cada 32K de contexto, ya que la caché KV incluye tokens de imagen, vídeo y audio y domina en contexto largo.
- Opciones de despliegue: llama.cpp, LM Studio, Jan y `llama serve -hf`; también transformers con safetensors. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodalidad | Rechazos / fidelidad | Licencia |
|---|---|---|---|---|---|
| gemma-4-12B-it-heretic (este) | ~12B | 256K | texto, imagen, vídeo, audio | 37/100; KL 0.0357 | apache-2.0 |
| google/gemma-4-12B-it | ~12B | 256K | texto, imagen, vídeo, audio | 99/100; KL 0 | apache-2.0 |
| saidutta69/gemma-4-E4B-it-heretic | E4B (no disponible el número exacto) | no disponible | multimodal (según el autor) | 25/100; KL 0.1215 | apache-2.0 |
| Modelos MoE de 26B/31B de la familia Gemma 4 | 26B/31B | no disponible | no disponible | no disponible | no disponible |

El autor sitúa este modelo como el escalón intermedio entre el E4B (que corre en dispositivo) y los MoE de 26B/31B (que requieren hardware de datacenter). El E4B sacrifica fidelidad (KL 0.1215) a cambio de menos rechazos (25/100); este 12B prioriza mantener el comportamiento del original.

## Limitaciones y advertencias

- Modelo abliterado: la supresión de rechazos elimina barreras de seguridad del modelo original, por lo que puede generar contenido dañino, ofensivo o inapropiado. No es apto para despliegues públicos sin filtros adicionales.
- El propio autor advierte de "más deriva en el tono" que en sus variantes de bajo KL; aunque la divergencia KL es la más baja de su lote, sigue habiendo desviación respecto al original.
- Riesgo de alucinación inherente a los LLM; no se documentan evaluaciones específicas de factualidad.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está documentado.
- La licencia declarada es apache-2.0, pero el enlace de licencia apunta a la licencia de Gemma 4 de Google; conviene verificar los términos de uso comercial de Gemma antes de producción.
- El contexto largo consume mucha memoria por la caché KV multimodal; el autor estima ~2 GB adicionales por cada 32K de contexto.
- El repositorio incluye una imagen externa alojada en un dominio de terceros (`photu.kashyalabanavli.site`), lo que conviene tratar con cautela.
- No hay benchmarks estándar publicados que permitan verificar la degradación de capacidades tras la ablación más allá de la divergencia KL.
- El modelo tiene 0 likes y 2765 descargas en el momento de la consulta; es un artefacto de la comunidad sin validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/saidutta69/gemma-4-12B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variante hermana E4B: https://huggingface.co/saidutta69/gemma-4-E4B-it-heretic
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Artículo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
