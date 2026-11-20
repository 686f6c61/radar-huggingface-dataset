# Lucasgitguy-co/lfm3-vl-2b-heretic-gguf

## Resumen

LFM3-VL 2B Heretic GGUF es una conversión a formato GGUF del modelo vision-language LFM3-VL 2B Heretic, publicada por el usuario Lucasgitguy-co. El modelo original deriva de LiquidAI/LFM3-VL-2B, un modelo de la familia LFM (Liquid Foundation Models) de Liquid AI, y ha sido modificado mediante técnicas de "abliteration" (de ahí el sufijo "heretic") para reducir los rechazos en las respuestas. Esta versión GGUF se distribuye con cuantización Q4_K_M para el modelo de lenguaje y F16 para el proyector visual.

El paquete incluye dos artefactos separados: el modelo de lenguaje cuantizado a Q4_K_M y el proyector de visión en F16, ambos necesarios para el procesamiento de imágenes. El modelo cuenta con 1.478.622.400 parámetros reales según los safetensors del modelo base, lo que lo sitúa en la categoría de 2B parámetros. El repositorio ocupa 3.0 GB e incluye además un bundle de un solo archivo que empaqueta ambos componentes.

La relevancia de esta ficha radica en que permite ejecutar un modelo vision-language de 2B parámetros en hardware de consumo mediante llama.cpp, con soporte para entrada de imágenes. Sin embargo, es importante señalar que la conversión no incluye evaluación de benchmarks ni validación en GPU, y que la licencia LFM Open License v1.0 impone restricciones al uso comercial de derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (transformer multimodal con proyector visual); detalles de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | 1.478.622.400 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y F16 (proyector visual); bundle de 1.479 GB |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (license: other); las adiciones documentales del publicador bajo Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); también existe versión MLX 4-bit del modelo base |

## Arquitectura y entrenamiento

El modelo base es un vision-language model de la familia LFM3 de Liquid AI, que combina un modelo de lenguaje con un codificador/proyector visual para tareas image-text-to-text. Esta versión GGUF es una conversión realizada con llama.cpp el 2026-10-30 a partir de la revisión `e81e03b28d228cb8c2676eb339c3404fb73b45b5`: el modelo de lenguaje se convirtió a F16 y posteriormente se cuantizó a Q4_K_M, mientras que el proyector se convirtió por separado a F16. Los metadatos del tokenizer se adaptaron a la API de fast-tokenizer de Transformers para la conversión, conservando el vocabulario original.

El sufijo "heretic" indica que el modelo base ha sido sometido a un proceso de abliteration orientado a reducir los rechazos de respuesta. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo original. La conversión no incluyó entrenamiento adicional ni evaluación de benchmarks; únicamente se realizó una prueba de humo en CPU con una imagen roja sólida y el prompt "What color is the image? Answer briefly.", que produjo "The image is red.". La inferencia en GPU no fue validada.

## Capacidades

- Generación de texto e inferencia image-text-to-text: acepta imágenes junto con prompts de texto y genera descripciones o respuestas.
- Procesamiento de imágenes mediante un proyector visual F16 separado del modelo de lenguaje.
- Generación de texto autoregresiva estándar con llama.cpp.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, audio ni modo de pensamiento explícito.
- El ajuste "heretic" busca reducir los rechazos en las respuestas, aunque no se cuantifica su efecto en la documentación.

## Casos de uso

- Descripción de imágenes en local: el modelo puede procesar una imagen y generar una descripción textual usando `llama-mtmd-cli` con el modelo Q4_K_M y el proyector F16, adecuado para prototipos en equipos sin GPU dedicada.
- Clasificación visual simple: con prompts breves y temperatura baja (`--temp 0.1`) puede emplearse para tareas de etiquetado o verificación de contenido visual en pipelines ligeros.
- Asistentes de accesibilidad offline: generación de descripciones de imágenes para usuarios con discapacidad visual en entornos sin conectividad, aprovechando el tamaño reducido del modelo.
- Procesamiento por lotes en CPU: la invocación de CPU probada (`--device none --no-mmproj-offload --no-op-offload --no-kv-offload --fit off`) permite ejecutar el modelo en servidores sin GPU para tareas de visión por lotes de baja criticidad.
- Integración en aplicaciones de escritorio: el formato GGUF y el bundle de un solo archivo facilitan la distribución en herramientas como LM Studio u Ollama, aunque el bundle debe desempaquetarse con `gguf_bundle.py` antes de usarlo en llama.cpp.
- Experimentación con modelos ablacionados: investigadores interesados en estudiar el efecto del proceso "heretic" sobre el comportamiento de rechazo en modelos vision-language pequeños pueden usar esta versión como referencia reproducible (SHA-256 documentados).
- Base para fine-tuning ligero o evaluación comparativa: al ser un modelo de 2B parámetros en GGUF, sirve como punto de partida para experimentos de cuantización y despliegue en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se realizó ninguna evaluación de benchmarks durante la conversión, y la única validación fue una prueba de humo en CPU con una imagen roja sólida. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de lenguaje Q4_K_M más el proyector F16 suman aproximadamente 1.5 GB en disco; la VRAM necesaria para inferencia completa no está documentada, pero por el tamaño de los pesos se estima que cabe en GPUs de consumo con 4-6 GB de VRAM, aunque esta cifra no ha sido validada por el autor.
- GPU recomendadas: no disponible; la inferencia en GPU no fue validada por el publicador.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, pero no confirmada experimentalmente.
- Opciones de despliegue: llama.cpp (build reciente con soporte LFM3-VL), mediante `llama-mtmd-cli`; el bundle puede desempaquetarse con `gguf_bundle.py` para su uso con llama.cpp, Ollama o LM Studio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-VL 2B Heretic GGUF (este) | 1.478.622.400 | no disponible | LFM Open License v1.0 | GGUF (Q4_K_M + F16 proyector) | Conversión comunitaria, sin benchmarks |
| LiquidAI/LFM3-VL-2B (upstream) | ~2B | no disponible | LFM Open License v1.0 | safetensors | Modelo original de Liquid AI |
| lfm3-vl-2b-heretic-mlx-4bit | ~2B | no disponible | LFM Open License v1.0 | MLX 4-bit | Versión para Apple Silicon del mismo autor |

No se dispone de información suficiente para comparar con alternativas de otros fabricantes en la misma categoría (vision-language de ~2B parámetros).

## Limitaciones y advertencias

- La conversión no fue validada en GPU; solo se realizó una prueba de humo en CPU, por lo que el comportamiento en producción no está garantizado.
- No se han publicado benchmarks ni evaluaciones de precisión; el rendimiento real es desconocido.
- El proceso "heretic" (abliteration) puede incrementar la probabilidad de respuestas no deseadas o inapropiadas al reducir los rechazos; no se documenta su alcance ni sus efectos.
- Riesgo de alucinación inherente a modelos de 2B parámetros, especialmente en tareas de razonamiento complejo o descripción detallada de imágenes.
- Soporte de idioma limitado al inglés según la etiqueta del repositorio.
- La licencia LFM Open License v1.0 impone limitaciones al uso comercial de derivados; no es un modelo Apache-2.0. Las adiciones documentales del publicador están bajo Apache 2.0, pero no modifican los términos del material upstream.
- El bundle de un solo archivo no puede ejecutarse directamente en llama.cpp; requiere desempaquetado previo con `gguf_bundle.py`.
- No se documentan capacidades de tool calling, agentes ni contexto largo; el ejemplo de uso emplea `-c 2048`.
- El repositorio tiene pocas descargas (1219) y likes (3), lo que sugiere validación comunitaria limitada.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-gguf
- Modelo base: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic
- Versión MLX 4-bit: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-mlx-4bit
- Modelo upstream de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Colección LFM vision-language: https://huggingface.co/collections/Lucasgitguy-co/lfm-vision-language-6aef2dcb0a92787c93414433
- Documentación de uso (docs/USAGE.md): docs/USAGE.md
- Informe técnico (docs/paper.md): docs/paper.md
- PDF del informe (docs/paper.pdf): docs/paper.pdf
- BibTeX (docs/citation.bib): docs/citation.bib
- Índice de modelos (docs/MODEL_INDEX.md): docs/MODEL_INDEX.md
- Estructura de archivos (docs/FILE_STRUCTURE.md): docs/FILE_STRUCTURE.md
- Procedencia y reproducibilidad (docs/PROVENANCE.md): docs/PROVENANCE.md
- Historial de versiones (CHANGELOG.md): CHANGELOG.md
- Licencia (LICENSE): LICENSE
- Licencia Apache 2.0 de adiciones documentales (LICENSE-APACHE-2.0): LICENSE-APACHE-2.0
- Script de desempaquetado (gguf_bundle.py): gguf_bundle.py
