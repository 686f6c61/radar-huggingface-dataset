# hfadam/WeMM-Embedding-2B-MLX-4bit

## Resumen

WeMM-Embedding-2B-MLX-4bit es una cuantización en 4 bits del modelo base tencent/WeMM-Embedding-2B, realizada por el usuario hfadam y publicada en Hugging Face. El modelo original, desarrollado por Tencent, es un modelo de embedding multimodal universal que acepta texto, imágenes, vídeos, documentos visuales y entradas multimodales intercaladas, devolviendo un vector de 2048 dimensiones normalizado con norma L2. Está construido sobre la arquitectura Qwen3.5 y forma parte de una familia que incluye variantes de 2B, 4B y 9B parámetros.

Esta versión cuantizada utiliza la librería MLX, orientada a dispositivos Apple Silicon, y reduce el tamaño del modelo a aproximadamente 2 GB, lo que permite su ejecución en entornos con memoria unificada limitada. El modelo base se entrenó en dos etapas: una primera de alineación multimodal a gran escala y una segunda de refinamiento con datos curados, supervisión de relevancia fina y transferencia de conocimiento entre escalas. La cuantización 4-bit mantiene las capacidades funcionales del modelo original, aunque puede introducir una ligera pérdida de precisión en las representaciones generadas.

La relevancia de este modelo radica en su versatilidad para tareas de recuperación, recomendación, clasificación y sistemas agénticos que necesitan representar contenido heterogéneo en un espacio compartido. Al estar disponible en formato MLX 4-bit, facilita la experimentación local en hardware de Apple sin necesidad de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 |
| Parametros totales | 705.222.208 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base WeMM-Embedding-2B emplea una arquitectura transformer multimodal derivada de Qwen3.5, diseñada para procesar y fusionar información de texto, imágenes, vídeos y documentos visuales. El entrenamiento se realizó en dos fases: una alineación multimodal a gran escala seguida de un refinamiento con datos curados, supervisión de relevancia fina y transferencia de conocimiento entre escalas. Esta metodología permite que el modelo aprenda representaciones compartidas para distintos tipos de contenido, optimizadas para tareas de recuperación y similitud semántica.

La versión cuantizada en 4 bits mediante MLX reduce el tamaño de los pesos manteniendo la estructura del modelo original. MLX es un framework de aprendizaje automático de Apple optimizado para sus procesadores, por lo que esta cuantización está pensada para ejecutarse eficientemente en Macs con Apple Silicon. No se dispone de información adicional sobre el proceso de cuantización ni sobre posibles técnicas de calibración empleadas.

## Capacidades

- Generacion de embeddings multimodales: acepta texto, imágenes, vídeos, documentos visuales y entradas intercaladas, devolviendo un vector de 2048 dimensiones normalizado con L2.
- Soporte de MRL (Matryoshka Representation Learning): permite seleccionar la dimensión del embedding mediante el parámetro `--dimension`, facilitando el ajuste del equilibrio entre precisión y coste computacional.
- Integración con sentence-transformers: el modelo se puede cargar directamente con `SentenceTransformer.encode()` para texto, imagen y vídeo.
- Multilingüe: soporta chino e inglés, aunque no se especifican otros idiomas.
- No es un modelo generativo: su función es exclusivamente la extracción de características y representación semántica.

## Casos de uso

- Búsqueda multimodal en bases de datos: el modelo permite indexar imágenes, vídeos y texto en un mismo espacio vectorial, de modo que una consulta textual pueda recuperar contenido visual relevante y viceversa. Es adecuado para motores de búsqueda de productos, archivos multimedia o documentación técnica.
- Sistemas de recomendación: al representar ítems heterogéneos (artículos, vídeos, imágenes) en un espacio común, se pueden calcular similitudes entre ellos para sugerir contenido relacionado en plataformas de streaming o comercio electrónico.
- Clasificación de documentos visuales: el modelo puede clasificar facturas, contratos o capturas de pantalla mediante la comparación de sus embeddings con representaciones de referencia, útil en automatización de procesos administrativos.
- Moderación de contenido: permite detectar imágenes o vídeos similares a ejemplos previamente etiquetados como inapropiados, comparando sus embeddings en un espacio vectorial.
- Sistemas agénticos con memoria multimodal: en agentes que necesitan recordar y recuperar información de distintas modalidades, el modelo puede generar representaciones compactas de observaciones pasadas para su posterior consulta.
- Análisis de similitud entre documentos mixtos: para comparar informes que combinan texto e imágenes, el modelo produce un embedding unificado que captura la semántica conjunta, facilitando la detección de duplicados o versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El informe técnico del modelo base menciona que WeMM-Embedding logra un rendimiento líder en varios benchmarks públicos, pero no se proporcionan cifras concretas en la documentación accesible.

## Requisitos de hardware

- Al ser una cuantización MLX 4-bit, está optimizada para Apple Silicon (M1, M2, M3 y posteriores). El tamaño del repositorio es de 2.0 GB, por lo que cabe en la memoria unificada de cualquier Mac con al menos 8 GB de RAM.
- No se han proporcionado requisitos para GPUs NVIDIA o AMD; el formato MLX no es compatible directamente con CUDA.
- Para despliegue en otros entornos, se necesitaría convertir el modelo a formatos como GGUF o usar el modelo base en su versión original con librerías como vLLM o TGI, aunque no se indica compatibilidad.
- La latencia y el throughput dependen del hardware específico; no se dispone de datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de embedding multimodal como CLIP, SigLIP o Jina Embeddings. El modelo base se posiciona como una alternativa universal, pero no se han encontrado tablas comparativas en la documentación disponible.

## Limitaciones y advertencias

- La cuantización 4-bit puede degradar ligeramente la calidad de los embeddings en comparación con el modelo original en precisión completa, especialmente en tareas que requieren alta granularidad semántica.
- El modelo solo soporta chino e inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de Tencent, podría reflejar sesgos presentes en esos datos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base en su repositorio original para confirmar restricciones adicionales.
- Al ser un modelo de embedding, no genera texto ni respuestas; su uso se limita a la extracción de características.
- No se ha verificado la exactitud de los parámetros totales declarados (705M) frente al nombre comercial "2B"; podría tratarse de una discrepancia en la nomenclatura.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/hfadam/WeMM-Embedding-2B-MLX-4bit
- Modelo base en Hugging Face: https://huggingface.co/tencent/WeMM-Embedding-2B
- Repositorio GitHub de Tencent: https://github.com/Tencent/WeMM-Embedding
- Informe técnico en arXiv: https://arxiv.org/abs/2608.24053
- Colección de modelos WeMM-Embedding: https://huggingface.co/collections/tencent/wemm-embedding
