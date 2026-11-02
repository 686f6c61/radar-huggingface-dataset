# cstr/clip-text-base-GGUF

## Resumen

`cstr/clip-text-base-GGUF` es una conversión a formato GGUF del codificador de texto del modelo CLIP ViT-B/16 de OpenAI, publicada por el usuario cstr para su uso con el runtime CrispEmbed. No se trata de un modelo generativo, sino de un encoder de texto que produce embeddings de 512 dimensiones L2-normalizados, pensados para vivir en el mismo espacio vectorial que el codificador visual de CLIP y permitir tareas de alineación imagen-texto. Con 63,4 millones de parámetros y unos 244 MB en cuantización Q4_K, es un componente ligero orientado a búsqueda y recuperación multimodal en entornos con recursos limitados.

El interés actual de esta ficha no está en la innovación arquitectónica (el modelo subyacente es de 2021), sino en el empaquetado: pesos en GGUF con tokenizador BPE embebido, sin dependencias de ficheros de vocabulario externos, y una revisión de cuantización documentada con auditoría numérica. La revisión del 2 de noviembre de 2026 introduce `clip-text-base-q4_k-mixed.gguf`, que corrige un defecto de truncado del runtime y eleva la similitud coseno mínima frente al modelo original a aproximadamente 0,988 sobre un panel de 78 textos.

Es relevante para desarrolladores que quieran integrar recuperación imagen-texto zero-shot en pipelines locales (CLI, edge, CPU) sin arrastrar el stack completo de PyTorch ni depender de servicios externos. La licencia MIT del modelo original se mantiene, y la model card incluye una nota explícita sobre el artículo 53 del Reglamento europeo de IA que atribuye la condición de proveedor al autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto CLIP con atención causal |
| Parametros totales | 63.428.096 (63M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 77 tokens (máximo del tokenizador BPE) |
| Tipos de cuantizacion | Q4_K, Q4_K+imatrix mixta (con `attn.v`, bloque encoder 0 y embeddings de token en Q8_0); el repo incluye además ficheros F32 de referencia |
| Idiomas soportados | no disponible en la model card (el encoder CLIP original está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (librería ggml); tokenizador BPE embebido en el fichero |
| Dimension de embedding | 512, L2-normalizado |
| Tamano del repo | ~0,5 GB |
| Tamano del fichero Q4_K | ~244 MB |

## Arquitectura y entrenamiento

El modelo es el text transformer de `openai/clip-vit-base-patch16`: un transformer con atención causal que procesa hasta 77 tokens y produce un vector de 512 dimensiones a partir del token EOS (pooling sobre la última posición). El repositorio no entrena ni ajusta nada: la model card declara explícitamente que solo se ha realizado conversión de formato y cuantización, sin cambios en arquitectura, vocabulario ni capacidad, y que los pesos son numéricamente equivalentes al modelo original de HuggingFace. Los datos de entrenamiento son los del CLIP original (pares imagen-texto a gran escala), documentados —cuando lo están— por OpenAI en su model card.

La innovación técnica relevante está en el proceso de cuantización y su verificación. La auditoría CUDA/CPU detectó que el fichero `clip-text-base-q4_k.gguf` original alcanzaba solo 0,933 de coseno frente al F32, por debajo del umbral de 0,94 fijado para Q4_K. Parte de la brecha se debía a un defecto del runtime CrispEmbed: las entradas de más de 75 tokens perdían el token EOS al truncarse, de modo que el pooling leía un token de contenido. Corregido el runtime (variable `CRISPEMBED_CLIP_TEXT_KEEP_EOS`, activada por defecto), la nueva cuantización mixta Q4_K+imatrix con `attn.v`, bloque 0 y embeddings de token en Q8_0 alcanza un coseno mínimo de ~0,988 frente a `get_text_features` del modelo original en FP32 sobre un panel de 78 textos. Los ficheros antiguos se conservan por reproducibilidad, pero el Q4_K original queda marcado como superado.

## Capacidades

- Generación de embeddings de texto de 512 dimensiones, L2-normalizados, listos para similitud coseno.
- Alineación cross-modal: los vectores conviven en el mismo espacio que `cstr/clip-vit-base-patch16-GGUF`, habilitando recuperación imagen-texto zero-shot.
- Procesamiento por lotes desde fichero (`--input queries.txt --output embeddings.bin`).
- Tokenizador BPE embebido en el GGUF, sin necesidad de ficheros de vocabulario externos.
- Ejecución en CPU y GPU a través de CrispEmbed (backend ggml), sin dependencia de PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un encoder.
- Sin capacidades de visión, audio ni modo thinking; la parte visual corresponde al repositorio hermano.

## Casos de uso

- Búsqueda semántica de imágenes por descripción textual: se embeben las consultas con este modelo y las imágenes con `clip-vit-base-patch16-GGUF`; la similitud coseno ordena los resultados. Adecuado por el reducido tamaño del encoder (244 MB) y la ausencia de dependencias pesadas.
- Clasificación zero-shot de imágenes: se construyen prompts del tipo "a photo of a cat" para cada clase candidata, se embeben una sola vez y se compara contra el embedding de cada imagen entrante. El coste por clase es mínimo gracias a los 63M de parámetros.
- Filtrado y moderación de contenido visual: precomputar embeddings de categorías prohibidas y puntuar imágenes nuevas por proximidad en el espacio CLIP, como primera pasada barata antes de un clasificador más costoso.
- Indexación de catálogos de producto: generar embeddings de títulos y descripciones de fichas y cruzarlos con las fotos de producto para búsqueda visual dentro de un e-commerce, ejecutable en CPU en el propio servidor de catálogo.
- Deduplicación y agrupación de datasets multimodales: embeber las descripciones asociadas a imágenes para detectar pares redundantes o mal etiquetados antes del entrenamiento de otro modelo.
- Componente de recuperación en un pipeline RAG multimodal: dado un corpus de documentos con figuras, recuperar las imágenes relevantes para una consulta textual y pasarlas a un modelo generativo con visión; el encoder actúa como retriever ligero.
- Prototipado en entornos edge o CI: al ser un binario GGUF con tokenizador embebido, se puede incluir en tests automatizados de similitud semántica sin instalar el stack de HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no aplican a un encoder de este tipo. El único dato de calidad numérica publicado es la auditoría de cuantización:

| Metrica | Valor |
|---|---|
| Coseno minimo Q4_K original vs F32 | 0,933 (por debajo del umbral 0,94) |
| Coseno minimo Q4_K+imatrix mixta vs `get_text_features` FP32 | ~0,988 |
| Panel de evaluacion | 78 textos |
| Referencia | `openai/clip-vit-base-patch16`, CLIPTokenizerFast, FP32 |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el fichero Q4_K ocupa ~244 MB y el repo completo ~0,5 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) y en CPU sin GPU dedicada.
- Despliegue mediante CrispEmbed (backend ggml, soporte CUDA y CPU). No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama en la información disponible, aunque el formato GGUF es el habitual en ese ecosistema.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (63M de parámetros, contexto de 77 tokens) se espera un coste por embedding muy bajo, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Embedding | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `cstr/clip-text-base-GGUF` | 63M | 77 tokens | 512, L2 | GGUF | MIT | Conversion del encoder de texto CLIP ViT-B/16, runtime CrispEmbed |
| `openai/clip-vit-base-patch16` | ~150M total (vision + texto) | 77 tokens | 512 | safetensors (PyTorch) | MIT | Modelo original completo; requiere transformers y torch |
| `cstr/clip-vit-base-patch16-GGUF` | no disponible en la informacion | no disponible | 512 | GGUF | MIT | Codificador visual del mismo autor, pareja cross-modal directa |
| Codificadores de texto tipo sentence-transformers (p. ej. MiniLM) | 20-120M | 256-512 tokens | 384-768 | safetensors, GGUF | variable | No comparten espacio vectorial con CLIP; no sirven para recuperacion imagen-texto |

La comparación con alternativas de la misma categoría (encoders de texto para recuperación) es limitada: este modelo solo es intercambiable con otros encoders CLIP, porque su utilidad depende de compartir espacio vectorial con el encoder visual correspondiente. Frente al modelo original de OpenAI, la ventaja es el empaquetado (GGUF, tokenizador embebido, runtime ligero) y la desventaja es que no incluye la torre visual.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona y no sigue instrucciones; cualquier uso en ese sentido es un error de categoría.
- Contexto máximo de 77 tokens, insuficiente para documentos largos; las consultas deben ser frases cortas o fragmentos.
- Idiomas: la model card no documenta cobertura multilingüe; el CLIP original está entrenado mayoritariamente en inglés, por lo que el rendimiento en castellano u otras lenguas puede degradarse sin que haya métricas publicadas que lo cuantifiquen.
- El fichero `clip-text-base-q4_k.gguf` original queda superado y no debería usarse en producción; hay que emplear `clip-text-base-q4_k-mixed.gguf`.
- La corrección del truncado depende del runtime CrispEmbed con `CRISPEMBED_CLIP_TEXT_KEEP_EOS` activado por defecto; otros runtimes GGUF pueden no aplicar la misma lógica de pooling y dar resultados distintos.
- Riesgo de sesgo heredado del dataset de pares imagen-texto de CLIP original (sesgos de género, raza y cultura en las asociaciones semánticas), no auditado en este repositorio.
- Licencia MIT, sin restricciones adicionales para uso comercial; el repositorio no concede derechos que la licencia original no otorgue.
- Bajo el Reglamento (UE) 2024/1689, el proveedor del modelo sigue siendo OpenAI; este repositorio no reclama esa condición.
- Sin métricas de latencia, throughput ni calidad en tareas downstream más allá de la auditoría de cuantización citada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cstr/clip-text-base-GGUF
- Modelo original: https://huggingface.co/openai/clip-vit-base-patch16
- Codificador visual pareja: https://huggingface.co/cstr/clip-vit-base-patch16-GGUF
- Runtime CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Evidencia de la auditoría de cuantización: `tests/results/below-bar/` en el repositorio CrispEmbed
