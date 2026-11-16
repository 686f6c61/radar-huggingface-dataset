# Freshmob/pdf-shuffler-ai-models

## Resumen

`Freshmob/pdf-shuffler-ai-models` es un repositorio de recursos de modelos preparados para la aplicacion PDF Shuffler, una app iOS que procesa documentos localmente en el dispositivo. No se trata de un modelo entrenado por el autor, sino de un paquete de pesos convertidos y empaquetados a partir de modelos Qwen3 y Qwen3.5 originales de Qwen, en formatos MLX (4 bits) y CoreAI (exportaciones con recetas de Apple), pensados para inferencia on-device en iPhone sin subir documentos a la nube.

El repositorio incluye pesos de Qwen3-0.6B, Qwen3-1.7B, Qwen3-4B y Qwen3.5-2B. Las variantes CoreAI usan un contexto de 4096 tokens y pesos mixtos de 4 y 8 bits, mientras que las variantes MLX se basan en las conversiones 4-bit de `mlx-community`. La licencia es Apache-2.0, heredada de los modelos originales.

Su relevancia actual radica en el creciente interes por la IA local en dispositivos moviles: ofrece un ejemplo practico de empaquetado de modelos pequenos para iOS con manifiesto fijado (`AIModels.json`), hashes SHA-256 y descarga opcional de pesos, evitando ejecutar codigo del repositorio en la app.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3 y Qwen3.5); detalles exactos no disponibles en la informacion proporcionada |
| Parametros totales | 0.6B, 1.7B, 4B (Qwen3) y 2B (Qwen3.5) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens en exportaciones CoreAI; no disponible para variantes MLX |
| Tipos de cuantizacion | MLX 4-bit; CoreAI con pesos mixtos 4/8-bit |
| Idiomas soportados | no disponible (la model card advierte que la cobertura declarada por el autor no garantiza calidad uniforme) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX y CoreAI), empaquetados con manifiesto `AIModels.json` |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: redistribuye pesos de Qwen3 (0.6B, 1.7B y 4B) y Qwen3.5 (2B) ya publicados por Qwen, junto con sus conversiones 4-bit de `mlx-community`. Las exportaciones CoreAI se generan con las recetas `coreai-models` de Apple en la revision `128d2f30c935d27807d0e41a0f22a985f5d38250`, aplicando contexto de 4096 tokens y cuantizacion mixta 4/8 bits. El autor indica explicitamente que la exportacion cambia la representacion y la precision del modelo, pero no implica reentrenamiento.

Los modelos Qwen3 originales son transformers decoder-only con modos de razonamiento (thinking/no-thinking) segun la documentacion publica de Qwen; sin embargo, la model card de este repositorio no aporta detalles adicionales sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO). Para esos datos habria que consultar las model cards originales enlazadas.

## Capacidades

- Generacion de texto y respuestas a preguntas sobre documentos, orientadas al caso de uso de PDF Shuffler.
- Procesamiento local en dispositivo (on-device) sin subir documentos ni conversaciones a la nube.
- Ejecucion en iOS mediante dos rutas: CoreAI (iOS 27+) y MLX (iOS 17+).
- Modelos de distinto tamano (0.6B, 1.7B, 2B, 4B) para adaptarse a distintas capacidades de memoria del dispositivo.
- Capacidades multilingues heredadas de Qwen3/Qwen3.5, aunque sin garantia de calidad uniforme segun la propia model card.
- Soporte de tool calling, agentes o modos de razonamiento: no disponible en la informacion proporcionada para este empaquetado.

## Casos de uso

- Resumen de PDFs en el dispositivo: la app puede cargar el modelo de 0.6B o 1.7B en MLX y generar resumenes de documentos sin enviar el contenido a servidores externos, cumpliendo requisitos de privacidad.
- Extraccion de respuestas sobre documentos: con contexto de 4096 tokens en CoreAI, el modelo puede responder preguntas sobre fragmentos concretos de un PDF, con la advertencia de que las respuestas factibles requieren verificacion en la fuente.
- Clasificacion y reordenacion de contenido: el modelo de 0.6B puede usarse para tareas ligeras de etiquetado o categorizacion de secciones de un documento en dispositivos con poca memoria.
- Procesamiento por lotes en iPhone: el paquete incluye manifiesto con tamanos exactos y hashes SHA-256, lo que permite descargar solo los pesos necesarios y verificar integridad antes de usarlos en produccion.
- Aplicaciones de privacidad estricta: escenarios legales, medicos o corporativos donde esta prohibido enviar documentos a terceros; la inferencia MLX/CoreAI mantiene todo el flujo en el dispositivo.
- Prototipado de apps iOS con IA local: desarrolladores que quieran integrar Qwen3 pequenos en apps iOS pueden reutilizar el esquema de empaquetado, manifiesto fijado y descarga opcional de pesos como referencia.
- Evaluacion comparativa de backends en iOS: el repositorio permite comparar MLX frente a CoreAI con el mismo modelo base, util para medir latencia y memoria en dispositivos reales (el autor advierte que las pruebas en Mac no sustituyen las de iPhone).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: no disponible de forma medida. El autor indica que las estimaciones del manifiesto son heuristicas conservadoras de instalacion, no picos medidos en iPhone.
- GPU: orientado a Apple Silicon en iPhone; no se mencionan GPUs de escritorio (A100, H100, RTX 4090) en la informacion proporcionada.
- Compatibilidad: CoreAI requiere iOS 27+ y un dispositivo adecuado; MLX requiere iOS 17+ y memoria disponible suficiente.
- Despliegue: MLX y CoreAI en iOS; el repositorio no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor senala que las pruebas de humo en Mac no sustituyen las comprobaciones de rendimiento y calidad en iPhone.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pdf-shuffler-ai-models (Qwen3 0.6B/1.7B/4B, Qwen3.5 2B) | 0.6B-4B | 4096 (CoreAI) | Apache-2.0 | safetensors MLX/CoreAI | Hugging Face, empaquetado para iOS |
| Qwen3-1.7B (original) | 1.7B | no disponible en esta ficha | Apache-2.0 | safetensors | Hugging Face |
| mlx-community/Qwen3-1.7B-4bit | 1.7B | no disponible en esta ficha | Apache-2.0 | safetensors MLX | Hugging Face |
| Qwen3.5-2B (original) | 2B | no disponible en esta ficha | Apache-2.0 | safetensors | Hugging Face |

Los modelos comparables son esencialmente los originales de Qwen y las conversiones de `mlx-community`; este repositorio anade el empaquetado para iOS, el manifiesto con hashes y las exportaciones CoreAI.

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos provienen de Qwen3/Qwen3.5 y de conversiones de `mlx-community`; la exportacion modifica representacion y precision, no el entrenamiento.
- Riesgo de alucinacion: la model card advierte que las respuestas factuales sobre documentos requieren verificacion en la fuente.
- Idiomas: la cobertura declarada por el autor no garantiza calidad uniforme; no se detallan idiomas soportados en este repositorio.
- Requisitos de plataforma: CoreAI exige iOS 27+ y dispositivo compatible; MLX exige iOS 17+ y memoria suficiente. El exportador actual de Qwen3.5 de Apple no soporta iOS, por lo que esa variante usa MLX.
- Estimaciones de memoria: son heuristicas conservadoras del manifiesto, no picos medidos en iPhone.
- Validacion: las pruebas de humo en Mac no sustituyen pruebas de rendimiento y calidad en dispositivo real.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las model cards originales de Qwen para condiciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Freshmob/pdf-shuffler-ai-models
- Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- mlx-community/Qwen3-0.6B-4bit: https://huggingface.co/mlx-community/Qwen3-0.6B-4bit
- mlx-community/Qwen3-1.7B-4bit: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- mlx-community/Qwen3-4B-4bit: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- mlx-community/Qwen3.5-2B-4bit: https://huggingface.co/mlx-community/Qwen3.5-2B-4bit
