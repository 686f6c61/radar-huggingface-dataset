# cine-labs/cine-embed-bge-v1

## Resumen

cine-embed-bge-v1 es un codificador de frases (sentence encoder) especializado, desarrollado por cine-labs como fine-tune de `BAAI/bge-base-en-v1.5`. Su propósito es alimentar el canal de recuperación por embeddings del motor de recomendación cinematográfica [cine-rec-engine](https://github.com/DovBerKaplan/cine-rec-engine). No es un modelo generativo: convierte textos de catálogo en vectores densos de 768 dimensiones que permiten calcular similitud semántica entre títulos de películas, optimizados específicamente para catálogos en inglés.

El modelo parte de la arquitectura BERT-base (109.482.240 parámetros, ~0,4 GB en safetensors) y hereda la licencia MIT del modelo base. Su entrenamiento se orienta a la similitud de títulos y sinopsis, con una plantilla de entrada canónica que combina título, año y overview, y opcionalmente líneas enriquecidas de perfil cinematográfico (arco emocional, ritmo, narrativa, subgéneros, experiencia).

Es relevante para equipos que construyen sistemas de recomendación o búsqueda semántica sobre catálogos de cine: ofrece un espacio de embeddings afinado para ese dominio, con integración directa en sentence-transformers y compatibilidad con Text Embeddings Inference y endpoints de Hugging Face. Al ser un modelo recién publicado (noviembre de 2026) y con cero descargas, carece aún de validación externa y de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (transformer encoder), fine-tune de BAAI/bge-base-en-v1.5 |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base admite 512 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | ingles |
| Licencia | MIT (fine-tune); se mantienen los terminos del modelo base BAAI/bge-base-en-v1.5, tambien MIT |
| Formato de pesos | safetensors |
| Dimensiones del embedding | 768 |
| Tamano del repositorio | 0,4 GB |
| Libreria | sentence-transformers |
| Pipeline | feature-extraction |
| Modelo base | BAAI/bge-base-en-v1.5 |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer encoder tipo BERT-base, reutilizada del checkpoint `BAAI/bge-base-en-v1.5` mediante fine-tune. El modelo produce un vector de 768 dimensiones por texto de entrada, pensado para similitud coseno entre frases. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o contrastive learning con negativos duros; tampoco se detallan innovaciones como decodificación especulativa o atención lineal (no aplicables a un encoder de este tipo).

La innovación principal es de dominio y de formato de entrada: el modelo se afina para codificar títulos de catálogo con una plantilla canónica `Title: {title} ({year})` seguida de `Overview: {overview}`. Existe además una variante extendida, `tmdb_cinematic`, que inserta líneas de `Emotional arc`, `Pacing`, `Narrative`, `Sub-genres` y `Experience`, construidas automáticamente por cine-rec-engine. El motor descarga el repositorio fijado por versión y verificado con sha256, lo que aporta reproducibilidad en el pipeline de embeddings.

## Capacidades

- Generación de embeddings de frases y documentos para similitud semántica y recuperación (feature-extraction).
- Codificación de textos de catálogo cinematográfico con plantilla específica (título, año, overview y, opcionalmente, atributos de perfil cinematográfico).
- Búsqueda semántica y recuperación por similitud sobre catálogos en inglés.
- Integración nativa con sentence-transformers (`SentenceTransformer.encode`).
- Compatibilidad con Text Embeddings Inference y con endpoints de Hugging Face (tags `text-embeddings-inference` y `endpoints_compatible`).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni visión; es exclusivamente un encoder.
- Capacidad multilingüe limitada: el modelo está afinado y declarado solo para inglés.

## Casos de uso

- Recuperación por embeddings en un motor de recomendación: integrar el modelo como canal de recall en cine-rec-engine, codificando el catálogo completo y sirviendo vecinos más próximos para cada consulta o ítem semilla.
- Búsqueda semántica de películas por descripción: un usuario escribe una sinopsis o una idea ("un thriller psicológico sobre la memoria") y el sistema recupera títulos por similitud vectorial en el espacio afinado.
- Similitud título a título: detectar duplicados, secuelas o títulos relacionados en un catálogo, aprovechando que el fine-tune está optimizado para similitud de títulos en inglés.
- Enriquecimiento de perfiles de usuario: agregar los embeddings de las películas vistas para construir un vector de preferencias y alimentar un ranker posterior.
- Deduplicación y clustering de catálogo: agrupar títulos con sinopsis similares para limpiar metadatos o generar colecciones temáticas.
- Búsqueda híbrida en producción: desplegar el modelo con Text Embeddings Inference o endpoints de Hugging Face y combinarlo con búsqueda léxica (BM25) para mejorar el recall en un servicio de streaming o una base de datos vectorial.
- Prototipado rápido: al ser un modelo de 0,4 GB y 109 M de parámetros, permite iterar localmente con sentence-transformers sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp32 ocupa aproximadamente 0,44 GB de pesos (109,5 M de parámetros); en fp16, alrededor de 0,22 GB. Con overhead de activaciones y batch, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100 o L4/L40S con Text Embeddings Inference. Para desarrollo, RTX 3060, RTX 4090 o incluso CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 4 GB de VRAM; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: sentence-transformers (referencia), Text Embeddings Inference (tag oficial), endpoints de Hugging Face (tag `endpoints_compatible`), y el pipeline propio de cine-rec-engine (`models/fetch_encoders.py`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cine-embed-bge-v1 | 109,5 M | no disponible | ingles | MIT | Fine-tune de dominio para catálogos de cine; sin benchmarks publicados |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens (modelo base) | ingles | MIT | Modelo generalista de embeddings; base del anterior; ampliamente validado en MTEB |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens (modelo base) | ingles | MIT | Alternativa más ligera y rápida, menor calidad en tareas generales |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | ingles | Apache 2.0 | Encoder muy ligero, popular para búsqueda semántica de bajo coste |

La comparación con alternativas de la misma categoría se limita a los datos del modelo base y de encoders generalistas conocidos; no hay resultados de evaluación del fine-tune que permitan afirmar una mejora cuantitativa frente a ellos.

## Limitaciones y advertencias

- Modelo recién publicado (noviembre de 2026) con cero descargas y cero likes: no hay validación externa ni evidencia de calidad en producción.
- Solo inglés: no es adecuado para catálogos o consultas en castellano u otros idiomas sin un modelo multilingüe.
- Es un encoder, no un generador: no produce texto, no soporta tool calling ni razonamiento; cualquier expectativa de chatbot o agente queda fuera de su alcance.
- Dependencia de la plantilla de entrada: el rendimiento puede degradarse si se codifican textos fuera del formato `Title: ... Overview: ...` para el que fue afinado.
- Riesgo de sesgo heredado del corpus de entrenamiento del modelo base y del catálogo usado en el fine-tune; no se documenta ningún análisis de sesgos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de recuperaciones irrelevantes si el espacio de embeddings no cubre el dominio consultado.
- Licencia MIT para el fine-tune, con los términos del modelo base (también MIT) vigentes sobre los pesos derivados; conviene revisar la model card de BAAI/bge-base-en-v1.5 antes de uso comercial.
- No se documentan cuantizaciones (GGUF, ONNX) ni límites de longitud de contexto efectivos del fine-tune; verificar antes de desplegar con entradas largas.
- Los resultados de la búsqueda web no aportan información técnica sobre el modelo (son páginas de cines); no deben usarse como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cine-labs/cine-embed-bge-v1
- Repositorio cine-rec-engine: https://github.com/DovBerKaplan/cine-rec-engine
- Documentación de encoders de cine-rec-engine: https://github.com/DovBerKaplan/cine-rec-engine/blob/main/models/README.md
- Perfil del autor: https://github.com/DovBerKaplan
- Modelo base BAAI/bge-base-en-v1.5: https://huggingface.co/BAAI/bge-base-en-v1.5
