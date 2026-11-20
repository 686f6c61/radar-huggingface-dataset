# RedHatAI/Muse-Glimmer-30B-INT4

## Resumen

Muse-Glimmer-30B-INT4 es la versión cuantizada a INT4 de Muse-Glimmer-30B, un modelo multimodal de tipo image-text-to-text desarrollado originalmente por Muse (Meta) y comprimido por RedHatAI. El modelo acepta entradas de texto e imagen y genera texto, lo que lo sitúa en la categoría de modelos vision-language conversacionales. La cuantización reduce los pesos de 16 a 4 bits, disminuyendo el requisito de disco y de memoria de GPU en aproximadamente un 75 % respecto al modelo original.

La arquitectura declarada es MuseGlimmerForConditionalGeneration, implementada en la librería transformers. El checkpoint cuantizado contiene 7.954.958.144 parámetros en safetensors (frente a los 30B nominales del modelo base), con un tamaño de repositorio de 22,2 GB. La cuantización se aplica únicamente a los operadores lineales dentro de los bloques transformer, dejando las activaciones en su precisión original (esquema W4A16), y excluye explícitamente las capas de visión, el lm_head y los embeddings.

Su relevancia práctica radica en que permite desplegar un modelo multimodal de 30B en hardware más asequible manteniendo compatibilidad directa con vLLM, incluyendo soporte de tool calling y de parser de razonamiento. Está validado sobre RHOAI 3.5.1, RHAIIS 3.6.0-fast.2 y vLLM 0.28.0, y se distribuye bajo licencia Apache 2.0, lo que facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (transformer multimodal, image-text-to-text) |
| Parametros totales | 7.954.958.144 en el checkpoint INT4 (modelo base nominal: 30B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 en pesos (W4A16); activaciones sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B emplea la arquitectura MuseGlimmerForConditionalGeneration, un transformer multimodal que procesa texto e imágenes como entrada y produce texto. La información disponible no detalla la composición del dataset de preentrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones de atención o decodificación del modelo original.

Esta versión INT4 fue generada por RedHatAI aplicando LLM Compressor con el esquema W4A16 GPTQ sobre los pesos lineales de los bloques transformer. El proceso usó 512 muestras de calibración del dataset mlabonne/open-perfectblend, con una longitud máxima de secuencia de 2048 tokens y truncado activado, y se exportó en formato compressed-tensors. Las capas excluidas de la cuantización son las que coinciden con `re:.*vision.*`, `lm_head` y `re:.*embed_tokens.*`, de modo que el codificador visual y las proyecciones de entrada/salida conservan su precisión original.

## Capacidades

- Generación de texto condicionada por imagen: el pipeline declarado es image-text-to-text, con entrada de texto e imagen y salida de texto.
- Conversación multi-turno: etiquetado como conversational en Hugging Face.
- Tool calling / function calling: el despliegue en vLLM incluye `--enable-auto-tool-choice` y un parser específico `muse_glimmer`.
- Razonamiento explícito: vLLM incorpora `--reasoning-parser muse_glimmer`, lo que indica soporte de modo de razonamiento estructurado.
- Inferencia multimodal en vLLM: la guía de uso referenciada cubre inferencia multimodal además de despliegue multi-GPU.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede recibir páginas escaneadas o capturas y generar descripciones, resúmenes o extracciones textuales, aprovechando su naturaleza image-text-to-text.
- Asistentes conversacionales multimodales: al estar etiquetado como conversational y soportar multi-turno, encaja en interfaces de chat donde el usuario adjunta imágenes junto a preguntas.
- Automatización con tool calling: el soporte de `--enable-auto-tool-choice` y el parser `muse_glimmer` en vLLM permiten integrarlo en agentes que invocan funciones externas (APIs, bases de datos, servicios internos).
- Razonamiento multi-paso con trazas estructuradas: el `--reasoning-parser muse_glimmer` facilita separar el razonamiento del resultado final en pipelines que auditan el proceso de decisión.
- Despliegue en infraestructura Red Hat: validado en RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2, es adecuado para entornos empresariales que ya operan estas plataformas.
- Servicio de inferencia con OpenAI-compatible API: el contenedor `vllm/vllm-openai:muse-glimmer` expone un endpoint compatible con la API de OpenAI, lo que simplifica la integración con clientes existentes.
- Prototipado en una sola GPU: con cuantización INT4 y `--tensor-parallel-size 1`, permite levantar el servicio en un único dispositivo sin necesidad de paralelismo tensorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 22,2 GB en disco; la cuantización reduce los requisitos de memoria de GPU aproximadamente un 75 % frente a los pesos de 16 bits, aunque la VRAM efectiva depende de la longitud de contexto, el tamaño de lote y el almacenamiento en caché KV, que no se especifican.
- GPU recomendadas: no disponible en la información proporcionada; el despliegue de referencia usa `--tensor-parallel-size 1`, lo que sugiere que el modelo cabe en una sola GPU con memoria suficiente para alojar los pesos INT4 más el estado de inferencia.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU consumer; dado el tamaño de pesos (22,2 GB), una GPU de 24 GB podría alojarlos, pero no hay validación publicada en la información disponible.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:muse-glimmer`, validada con vLLM 0.28.0), transformers con `MuseGlimmerForConditionalGeneration` y `AutoProcessor`, y compressed-tensors para la carga de pesos. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/Muse-Glimmer-30B-INT4 | 7.954.958.144 en checkpoint INT4 (base 30B) | no disponible | image-text-to-text | Apache 2.0 | Hugging Face, vLLM |
| meta-models/Muse-Glimmer-30B | 30B (nominal) | no disponible | image-text-to-text | no disponible en la información proporcionada | Hugging Face |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el modelo base del que deriva esta cuantización. No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La cuantización INT4 introduce una pérdida de precisión respecto al modelo original; no se han publicado evaluaciones que cuantifiquen esa degradación en benchmarks.
- Solo se cuantizan los pesos lineales de los bloques transformer; el codificador visual, los embeddings y el lm_head permanecen en mayor precisión, por lo que el ahorro de memoria no es uniforme en todos los componentes.
- El proceso de calibración usó 512 muestras de open-perfectblend con secuencias de hasta 2048 tokens; dominios o idiomas poco representados en ese conjunto pueden verse más afectados por la cuantización.
- No se especifican los idiomas soportados, por lo que no puede garantizarse un comportamiento adecuado fuera de los idiomas mayoritarios del dataset de calibración.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base meta-models/Muse-Glimmer-30B mantenga condiciones compatibles; la información disponible no detalla la licencia del modelo original.
- El soporte de tool calling y de razonamiento depende de los parsers `muse_glimmer` de vLLM; otros motores de inferencia pueden no ofrecer estas capacidades.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con requisitos de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Muse-Glimmer-30B-INT4
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Guía de uso en vLLM: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
