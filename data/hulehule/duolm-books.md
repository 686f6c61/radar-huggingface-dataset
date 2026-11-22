# hulehule/DuoLM-Books

## Resumen

DuoLM-Books es un modelo de recomendación personalizada desarrollado por el usuario hulehule (autor independiente en Hugging Face), diseñado específicamente para la tarea de ranking de candidatos en sistemas de recomendación de libros. Se construye mediante destilación de conocimiento (knowledge distillation) a partir de Qwen/Qwen3-0.6B-Base y Qwen/Qwen3-Embedding-0.6B, y se publica bajo licencia Apache 2.0 con acceso restringido (gated) en Hugging Face.

El modelo resuelve un problema concreto: dado un usuario y un conjunto de candidatos (libros), ordenar dichos candidatos según su relevancia para el usuario. A diferencia de los modelos de recomendación tradicionales basados en embeddings o factorización, DuoLM aborda el ranking como una tarea de texto, lo que permite incorporar información textual rica sobre usuarios e ítems. La arquitectura es un transformer decoder-only derivado de Qwen3-0.6B, con aproximadamente 1.190 millones de parámetros totales en formato safetensors.

Su relevancia radica en la combinación de un tamaño relativamente compacto (adecuado para despliegue en producción con requisitos moderados de hardware) con una especialización clara en ranking personalizado. No obstante, la información pública disponible es muy limitada: no se han publicado detalles sobre el dataset de entrenamiento, los benchmarks ni las capacidades multilingües más allá del inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-0.6B-Base) |
| Parametros totales | 1.191.827.456 (~1,19 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se desconoce si existen versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-0.6B-Base, un transformer decoder-only de aproximadamente 0,6 mil millones de parámetros, aunque el checkpoint publicado contiene 1.191.827.456 parámetros totales, lo que sugiere una posible expansión de la cabeza de salida o la inclusión de módulos adicionales para la tarea de ranking (no se detalla en la información disponible). El modelo se presenta como una destilación de conocimiento (knowledge distillation) desde Qwen/Qwen3-0.6B-Base y Qwen/Qwen3-Embedding-0.6B, dos modelos de la familia Qwen3.

La innovación principal es el enfoque "DuoLM": tratar el ranking de recomendación como una tarea de texto, donde el modelo recibe información del usuario y de los candidatos y produce una puntuación de relevancia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. El pipeline declarado es `text-ranking`, lo que confirma que la salida del modelo es una puntuación de ranking por par usuario-ítem.

## Capacidades

- Ranking de candidatos para recomendación personalizada: dado un usuario y una lista de libros candidatos, el modelo ordena los ítems por relevancia.
- Modelado de texto para recomendación: procesa descripciones textuales de usuarios e ítems, lo que permite incorporar metadatos, reseñas o perfiles en lenguaje natural.
- Destilación de conocimiento: integra señales de un modelo base generativo (Qwen3-0.6B-Base) y de un modelo de embeddings (Qwen3-Embedding-0.6B).
- Capacidad monolingüe: entrenado y etiquetado para inglés únicamente.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- No se ha documentado capacidad de generación de texto libre; el pipeline es específicamente de ranking.

## Casos de uso

- Recomendación de libros en tiendas online: el modelo puede recibir el perfil textual del usuario (historial, preferencias declaradas) y una lista de libros candidatos, y devolver un orden de relevancia para personalizar la página de inicio o los correos de recomendación. Su tamaño compacto (~1,2B parámetros) permite integrarlo en un servicio de ranking en tiempo real.
- Ranking de candidatos en motores de búsqueda internos de bibliotecas digitales: dado un usuario y los resultados de una búsqueda inicial (recuperación), el modelo reordena los libros según la probabilidad de interacción, mejorando la precisión del top-k.
- Personalización de newsletters y campañas de marketing editorial: el modelo puntúa qué títulos tienen mayor probabilidad de ser relevantes para cada suscriptor, permitiendo seleccionar dinámicamente los libros destacados en cada envío.
- Filtrado y reordenación en pipelines de recomendación de dos etapas: se usa como etapa de ranking tras un recuperador (p. ej., embeddings o filtrado colaborativo), refinando la lista final con señales textuales que los modelos de factorización no capturan.
- Sistemas de recomendación con explicabilidad textual: al estar basado en un modelo de lenguaje, es posible inspeccionar las representaciones internas o diseñar prompts que justifiquen el ranking, útil en dominios donde se requiere transparencia (p. ej., recomendación educativa o bibliotecas públicas).
- Investigación en recomendación basada en texto: sirve como baseline reproducible para experimentos de ranking personalizado con modelos de lenguaje pequeños, gracias a su licencia Apache 2.0 y su tamaño manejable en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,4 GB solo para los pesos (1,19B parámetros × 2 bytes), más overhead de activaciones y contexto; se recomienda al menos 4-6 GB de VRAM para un despliegue cómodo.
- VRAM estimada en cuantización de 8 bits: ~1,2 GB para pesos; en 4 bits: ~0,6 GB para pesos. No se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para FP16; A100/H100 no son necesarias por el tamaño del modelo, pero pueden usarse para alto throughput en batch.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y similares.
- Opciones de despliegue: al ser un modelo safetensors con pipeline `text-ranking`, puede servirse con Hugging Face Transformers, Text Embeddings Inference (TEI) si se adapta, o vLLM/TGI para serving genérico (aunque la tarea de ranking requiere una cabeza específica). No se ha confirmado soporte en llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoLM-Books | ~1,19B | No disponible | Ranking de recomendación (text-ranking) | Apache 2.0 | Gated en HF |
| Qwen3-0.6B-Base | ~0,6B | No disponible en la información | Generación de texto | Apache 2.0 | Público en HF |
| Qwen3-Embedding-0.6B | ~0,6B | No disponible en la información | Embeddings de texto | Apache 2.0 | Público en HF |

No se dispone de información sobre benchmarks comparativos con otros modelos de recomendación (p. ej., modelos de factorización, SASRec, o LLMs de ranking como RankGPT). La comparativa se limita a los modelos base declarados, que no realizan la misma tarea.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo, lo que puede retrasar su uso en producción o en investigación.
- Idiomas: solo se declara inglés; no hay evidencia de soporte para castellano u otros idiomas.
- Sesgos: al ser un modelo derivado de Qwen3 y entrenado con datos no especificados, puede heredar sesgos de género, culturales o de popularidad presentes en los datos de recomendación. No se ha publicado ninguna evaluación de sesgos.
- Riesgo de alucinación: aunque la tarea es de ranking (puntuación), el modelo podría producir puntuaciones inconsistentes o no calibradas si se usa fuera de la distribución de entrenamiento; no se han publicado métricas de calibración.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto, lo que impide garantizar el manejo de perfiles de usuario o listas de candidatos largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso gated puede imponer condiciones adicionales que deben revisarse antes de su uso en producción.
- Caveat de producción: no hay información sobre el dataset de entrenamiento, lo que dificulta evaluar su robustez, su cobertura de dominio (solo libros) y su comportamiento ante cold-start (usuarios o ítems nuevos).
- El modelo está especializado en libros; su uso en otros dominios (películas, música, productos) no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/hulehule/DuoLM-Books
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo de embeddings base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Paper referenciado en los tags (arXiv:2610.24481): no se ha podido verificar su contenido en la información disponible.
