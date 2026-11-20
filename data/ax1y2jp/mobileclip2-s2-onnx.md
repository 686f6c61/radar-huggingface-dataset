# AX1Y2JP/MobileCLIP2-S2-ONNX

## Resumen

MobileCLIP2-S2-ONNX es una exportación a formato ONNX del modelo MobileCLIP2-S2, un modelo de visión-lenguaje de tipo CLIP desarrollado originalmente por Apple Machine Learning Research. Concretamente, esta conversión parte de la versión `timm/MobileCLIP2-S2-OpenCLIP` y la publica el usuario AX1Y2JP como dos grafos ONNX independientes (codificador de imagen y codificador de texto), lo que facilita su despliegue en entornos de inferencia sin dependencia de PyTorch. El modelo resuelve tareas de clasificación de imágenes zero-shot y búsqueda imagen-texto mediante el alineamiento de embeddings en un espacio compartido.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue: no aporta pesos nuevos ni entrenamiento propio, sino una reempaquetadura optimizada para producción. La arquitectura del codificador visual es FastViT (reparameterizada al estilo MobileOne para inferencia), mientras que el codificador de texto sigue el esquema CLIP estándar. El tamaño del repositorio es de 0,8 GB y el pipeline declarado es `zero-shot-image-classification`.

La información disponible en la model card es limitada: no se publican parámetros totales, longitud de contexto, idiomas soportados ni resultados de benchmarks. La licencia es la Apple Machine Learning Research Model License Agreement (`apple-amlr`), que impone restricciones específicas de uso que conviene revisar antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP bimodal: codificador de imagen FastViT (reparameterizado) + codificador de texto transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos fp16, E/S float32) e int8 (weight-only `MatMulNBits`, embedding de tokens int8 por filas, solo ONNX Runtime) |
| Idiomas soportados | no disponible |
| Licencia | Apple Machine Learning Research Model License Agreement (`apple-amlr`) |
| Formato de pesos | ONNX (opset 23, ONNX Runtime 1.22+), grafos separados de visión y texto; `tokenizer.json` incluido |

## Arquitectura y entrenamiento

El modelo es un CLIP de dos torres. El codificador de imagen emplea FastViT, una arquitectura híbrida que combina convoluciones con atención y que en esta exportación ha sido reparameterizada al estilo MobileOne: las ramas de entrenamiento se fusionan en una sola rama de inferencia, de modo que los outputs permanecen idénticos pero el grafo es más eficiente. El codificador de texto es un transformer CLIP convencional que produce embeddings alineados con los de imagen en un espacio latente compartido, con un `logit_scale` almacenado en los metadatos del ONNX.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; se trata de un modelo contrastivo entrenado con pares imagen-texto, no de un modelo generativo. La innovación técnica de esta exportación concreta es doble: por un lado, la separación en dos grafos ONNX que permite ejecutar cada torre de forma independiente y cachear embeddings de texto; por otro, la corrección del tokenizador, que rellena con id 0 para coincidir con `open_clip` en lugar del token de fin de texto que usaba la configuración original de Hugging Face y que degradaba la precisión zero-shot.

## Capacidades

- Clasificación de imágenes zero-shot mediante comparación de similitud coseno entre embeddings de imagen y de texto.
- Búsqueda y recuperación imagen-texto (image retrieval y text retrieval) en un espacio compartido.
- Extracción de embeddings de imagen y de texto de forma independiente, lo que permite precalcular y cachear la torre de texto.
- Ejecución en CPU y GPU a través de ONNX Runtime con los execution providers `CPUExecutionProvider` y `CUDAExecutionProvider`.
- Variantes cuantizadas fp16 e int8 para reducir requisitos de memoria y acelerar la inferencia.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión generativa, audio ni thinking mode; es exclusivamente un modelo de representación contrastiva.

## Casos de uso

- Moderación y etiquetado automático de imágenes: se definen etiquetas en lenguaje natural y el modelo asigna probabilidades zero-shot, sin necesidad de reentrenar un clasificador por cada nueva categoría.
- Búsqueda semántica en bibliotecas de imágenes: se indexan los embeddings de imagen precalculados y se consulta con texto libre, lo que permite un motor de búsqueda visual sobre catálogos grandes.
- Filtrado en pipelines de datos de entrenamiento: clasificación rápida de imágenes para descartar contenido irrelevante antes de alimentar modelos generativos.
- Organización de fototecas y activos digitales: agrupación y etiquetado por descripciones textuales en aplicaciones de gestión documental o DAM.
- Despliegue en dispositivo o edge: la variante int8 y la arquitectura FastViT permiten ejecutar la inferencia en CPU o en GPUs de gama baja dentro de aplicaciones móviles o embebidas.
- Verificación de contenido y detección de categorías prohibidas: comparación de imágenes contra un conjunto de descripciones textuales de políticas para priorizar revisiones humanas.
- Prototipado rápido de clasificadores: al no requerir entrenamiento, sirve para validar hipótesis de etiquetado antes de invertir en un modelo supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio completo ocupa 0,8 GB, por lo que la variante fp16 requiere del orden de cientos de MB de memoria y la int8 menos aún.
- GPU recomendadas: cualquier GPU compatible con CUDA y ONNX Runtime; el modelo es lo bastante pequeño para ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM libre, y también en CPU.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), con soporte de las variantes fp16 e int8; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MobileCLIP2-S2-ONNX (este) | no disponible | no disponible | apple-amlr | ONNX (fp16/int8) | Exportación de despliegue, sin benchmarks publicados |
| apple/MobileCLIP2-S2 | no disponible | no disponible | apple-amlr | PyTorch (safetensors) | Modelo original de Apple |
| timm/MobileCLIP2-S2-OpenCLIP | no disponible | no disponible | apple-amlr | PyTorch | Conversión a OpenCLIP de la que deriva esta exportación |
| CLIP ViT-B/32 (OpenAI) | ~151 M | 77 tokens de texto | MIT | PyTorch, ONNX | Alternativa generalista con licencia permisiva |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado métricas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado datos de sesgo, robustez ni evaluación por subgrupos; el comportamiento en dominios alejados de los datos de entrenamiento es desconocido.
- Riesgo de alucinación conceptual: el modelo asigna probabilidades a etiquetas arbitrarias aunque ninguna sea correcta, por lo que conviene aplicar umbrales de confianza.
- La licencia `apple-amlr` impone restricciones específicas de uso; es imprescindible revisar el acuerdo antes de cualquier uso comercial o redistribución.
- El tokenizador incluido debe usarse tal cual (padding con id 0); sustituirlo por la configuración original de Hugging Face degrada la precisión zero-shot.
- La variante int8 solo es compatible con ONNX Runtime y puede introducir pérdida de precisión respecto a fp16.
- No se especifican los idiomas soportados por el codificador de texto, lo que limita la confianza en consultas en castellano u otras lenguas distintas del inglés.
- Al ser una exportación de un tercero (AX1Y2JP) y no un artefacto oficial de Apple, no hay garantía de mantenimiento ni de equivalencia exacta con el modelo original más allá de lo declarado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AX1Y2JP/MobileCLIP2-S2-ONNX
- Modelo original de Apple: https://huggingface.co/apple/MobileCLIP2-S2
- Conversión OpenCLIP de timm: https://huggingface.co/timm/MobileCLIP2-S2-OpenCLIP
