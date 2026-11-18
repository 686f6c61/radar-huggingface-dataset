# alphaedge-ai/gemma-3-4b-it-ind-16384

## Resumen

gemma-3-4b-it-ind-16384 es una variante del modelo google/gemma-3-4b-it optimizada para indonesio mediante la técnica de *trimming* de vocabulario. El desarrollador alphaedge-ai ha reducido el vocabulario del tokenizador original de 262.144 a 16.384 tokens, conservando únicamente aquellos relevantes para el idioma indonesio, lo que reduce el número de parámetros del modelo de 4.300.079.472 a 3.670.770.032 (un 14,63% menos) y disminuye el tamaño del repositorio hasta 7,3 GB.

El modelo mantiene la arquitectura y los pesos del Gemma 3 4B instruct original, pero con la matriz de embeddings y la cabeza de salida recortadas al nuevo vocabulario. Está pensado para despliegues en producción donde el idioma principal sea el indonesio y donde el ahorro de memoria y el aumento de throughput sean críticos, a costa de perder capacidad en otros idiomas.

Es relevante porque demuestra una vía práctica de especialización lingüística sin reentrenamiento completo: el *trimming* permite reducir el footprint de un modelo multimodal de 4B a un coste mínimo, manteniendo el comportamiento del modelo base en el idioma objetivo. El modelo se distribuye bajo licencia Gemma y requiere aceptar los términos de uso de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), multimodal image-text-to-text |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 3 4B soporta 128K, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | indonesio (id) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-it, un transformer decoder-only multimodal de la familia Gemma 3, y aplica la técnica de *trimming* descrita en el blog de Hugging Face. El proceso consiste en identificar los tokens del vocabulario original (262.144) que aparecen con frecuencia en un corpus del idioma objetivo y eliminar el resto, recortando las matrices de embeddings de entrada y de salida al nuevo tamaño de 16.384 tokens. No se realiza un reentrenamiento completo, sino un ajuste de las capas afectadas para preservar el comportamiento del modelo base.

El corpus de minería utilizado para seleccionar los tokens consta de 200.000 textos del dataset lbourdois/fineweb-2-trimming, filtrados para indonesio. El resultado es un modelo un 14,63% más pequeño en parámetros, con un vocabulario un 93,75% menor. La model card advierte explícitamente que el rendimiento en otros idiomas distintos del indonesio puede degradarse, ya que se han eliminado tokens poco frecuentes en la selección.

## Capacidades

- Generación de texto conversacional en indonesio, con plantilla de chat (`apply_chat_template`) compatible con el formato del modelo base.
- Capacidad multimodal heredada del Gemma 3 4B original (entrada image-text-to-text), aunque la model card no detalla el soporte efectivo tras el trimming.
- Razonamiento y generación de código y matemáticas en la medida en que el modelo base lo soporta; no se documentan evaluaciones específicas tras el recorte.
- Soporte de tool calling y function calling heredado del modelo base, no verificado explícitamente en esta variante.
- Capacidades de agente y razonamiento multi-paso heredadas del modelo base, sin benchmarks publicados para esta versión.
- Capacidad multilingüe reducida: el vocabulario recortado está optimizado para indonesio, por lo que el rendimiento en otros idiomas puede ser deficiente.

## Casos de uso

- Atención al cliente en indonesio: el modelo puede gestionar conversaciones multi-turno con la plantilla de chat de Gemma 3 y un vocabulario especializado que reduce el coste por token en este idioma.
- Generación de contenido editorial en indonesio: redacción de artículos, resúmenes y textos comerciales con un modelo de 3,67B parámetros que cabe en GPUs de consumo.
- Despliegue en edge o entornos con VRAM limitada: al reducir el tamaño en un 14,63%, permite servir un modelo Gemma 3 4B en hardware donde la versión completa no cabría con la misma cuantización.
- Procesamiento de documentos en indonesio: extracción y resumen de información de textos largos, aprovechando la ventana de contexto del modelo base (sujeta a verificación).
- Asistente conversacional especializado en indonesio para aplicaciones móviles o web, con menor latencia por token gracias al vocabulario reducido.
- Filtrado y clasificación de textos en indonesio en pipelines de datos, usando el modelo como generador de etiquetas o resúmenes.
- Prototipado rápido de aplicaciones NLP en indonesio con `transformers` y `text-generation-inference`, dado que el repositorio incluye la etiqueta `endpoints_compatible`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 7,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda un mínimo de 10-12 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 4 GB para pesos; en 4 bits, alrededor de 2 GB para pesos.
- GPU recomendadas: NVIDIA A100, H100 o L40S para producción con throughput alto; RTX 4090 o RTX 3090 para inferencia en FP16 con comodidad.
- Cabe en GPUs de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y, con cuantización 4-bit, en GPUs con 8 GB o menos.
- Opciones de despliegue: `transformers` (soporte nativo según la model card), `text-generation-inference` (etiqueta `text-generation-inference`), y potencialmente vLLM, llama.cpp u Ollama si se generan pesos GGUF (no confirmado en la información disponible).
- Latencia y throughput estimados: no disponibles; el vocabulario reducido debería disminuir el coste de la capa de salida y el tamaño del KV cache de embeddings, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-ind-16384 | 3.670.770.032 | 16.384 | indonesio | Gemma | no disponible | Hugging Face |
| google/gemma-3-4b-it | 4.300.079.472 | 262.144 | multilingüe | Gemma | 128K (modelo base) | Hugging Face |
| Otras variantes trimmed de Gemma 3 4B | variable | variable | idioma objetivo | Gemma | no disponible | Hugging Face |

El modelo se posiciona como una alternativa especializada en indonesio frente al Gemma 3 4B original, con un 14,63% menos de parámetros y un vocabulario un 93,75% menor, a cambio de perder cobertura multilingüe. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- El rendimiento en idiomas distintos del indonesio puede degradarse significativamente, ya que se han eliminado tokens poco frecuentes en la selección.
- No se han publicado benchmarks que verifiquen que el comportamiento tras el trimming es equivalente al del modelo base en indonesio.
- Riesgo de alucinación inherente al modelo base Gemma 3 4B, no cuantificado en esta variante.
- Sesgos heredados del corpus de entrenamiento original de Gemma 3, no evaluados específicamente para indonesio.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y requiere aceptación de los términos de Google; el modelo no está afiliado ni respaldado por Google.
- El soporte multimodal (image-text-to-text) está etiquetado pero no se documenta su comportamiento tras el recorte de vocabulario.
- El tamaño de contexto efectivo no se confirma en la model card; no asumir los 128K del modelo base sin verificación.
- El modelo tiene muy poca tracción (9 descargas, 0 likes) y no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-ind-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Blog de trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Paper Gemma 3: https://arxiv.org/abs/2503.19786
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
