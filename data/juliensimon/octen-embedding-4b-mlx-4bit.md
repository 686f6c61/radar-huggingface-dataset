# juliensimon/Octen-Embedding-4B-mlx-4bit

## Resumen

Octen-Embedding-4B-mlx-4bit es la conversión a MLX, con cuantización afín de 4 bits, del modelo de embeddings Octen-Embedding-4B, desarrollado por el equipo de Octen a partir de Qwen3-Embedding-4B. La conversión la firma juliensimon como artefacto de la comunidad: los pesos son de Octen y Qwen, y tanto el original como esta versión se publican bajo licencia Apache 2.0. El objetivo es ejecutar un modelo de recuperación de 4.021.774.336 parámetros de forma nativa en Apple Silicon, sin CUDA ni capas de compatibilidad, ocupando 2,3 GB en disco.

El modelo transforma texto en vectores de 2560 dimensiones pensados para búsqueda semántica, recuperación (retrieval), clustering y similitud entre frases. Deriva de un transformer Qwen3 de 4B con 32K tokens de contexto, ajustado para recuperación, y mantiene la convención del original: el embedding es el estado oculto del último token, normalizado, y no requiere prefijo de instrucción, por lo que consultas y documentos se codifican igual.

Su relevancia es práctica: permite montar un pipeline de embeddings multilingüe (más de 100 idiomas según la model card) en un portátil o Mac de sobremesa con memoria unificada, con un coste de calidad acotado y medido frente a bf16 (coseno medio de 0,98 y un 7 % de cambios en el top-1). Es una pieza de infraestructura para RAG local, no un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen3 adaptado a embeddings (último estado oculto, normalizado) |
| Parametros totales | 4.021.774.336 (~4,02 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (32K); los ejemplos de la model card truncan a 1024 |
| Tipos de cuantizacion | 4 bits afín, group size 64 (esta versión); existen variantes bf16 y 8 bits afín en otros repositorios |
| Idiomas soportados | más de 100 idiomas según la model card; etiquetas en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx-embeddings); repositorio de 2,3 GB |

| Parametro adicional | Valor |
|---|---|
| Dimension del embedding | 2560 |
| Prefijo de instruccion | no requerido (consultas y documentos se codifican igual) |
| Tamano del repositorio | 2,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer Qwen3 de 4B parámetros reutilizado como encoder de frases: se toma el estado oculto del último token, se normaliza y se usa como vector de 2560 dimensiones. No hay cabecera de generación ni decodificación; el pipeline declarado es feature-extraction. La ventana de contexto es de 32.768 tokens, aunque las pruebas y ejemplos documentados truncan a 1024 tokens por texto. El ajuste fino para recuperación lo realizó Octen sobre Qwen/Qwen3-Embedding-4B; la model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación relevante de esta ficha no está en el entrenamiento, sino en la conversión: cuantización afín de 4 bits con group size 64 sobre pesos MLX, lo que reduce el modelo de 8,0 GB (bf16) a 2,3 GB. La conversión incluye una evaluación de fidelidad frente a bf16 ejecutada el 21 de octubre de 2026 sobre un conjunto de 170 tickets de soporte en inglés, francés, neerlandés y alemán (la descripción del conjunto queda truncada en la información disponible). No se documentan técnicas como decodificación especulativa ni atención lineal, porque no aplican a un modelo de embeddings.

## Capacidades

- Generación de embeddings de texto de 2560 dimensiones para búsqueda semántica, recuperación, clustering y similitud entre frases.
- Recuperación multilingüe: una consulta en francés recupera un artículo en inglés y una consulta en neerlandés encuentra el artículo sobre facturas, según el ejemplo de la model card.
- Codificación sin prefijo de instrucción: consultas y documentos comparten el mismo tratamiento, lo que simplifica la indexación.
- Soporte de lotes (batching) y padding: el ejemplo usa 8 textos por lote con truncado a 1024 tokens.
- Contexto de hasta 32K tokens por texto, útil para documentos largos indexados como una sola unidad.
- Capacidad de similitud simétrica (sentence-similarity) y asimétrica consulta-documento.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un modelo de representación, no generativo.

## Casos de uso

- RAG local en un Mac: indexar documentación interna y recuperar fragmentos relevantes con el modelo ejecutándose íntegramente en memoria unificada, sin GPU dedicada ni servicios externos.
- Búsqueda multilingüe en bases de conocimiento: indexar artículos en inglés y atender consultas en francés, neerlandés, alemán o castellano contra el mismo índice, como demuestra el ejemplo de la model card con artículos de webhooks y facturación.
- Deduplicación y clustering de tickets de soporte: embeber cada ticket y agrupar por similitud de coseno para detectar incidencias repetidas; la propia evaluación de fidelidad usa 170 tickets en cuatro idiomas.
- Clasificación semántica de correo o formularios: comparar el embedding del mensaje entrante con prototipos de cada categoría y asignar la más próxima, sin entrenar un clasificador adicional.
- Enrutamiento de documentación en mesas de ayuda: dado un artículo, encontrar preguntas frecuentes equivalentes, o dado un ticket, sugerir el artículo que lo resuelve (el test documentado mide top-1 sobre 178 tickets y 140 artículos).
- Detección de contenido fuera de dominio: descartar candidatos con baja similitud frente a un conjunto de referencia; en el ejemplo, la frase sobre carbonara puntúa bajo frente a las consultas de soporte.
- Prototipado rápido en equipos de investigación: comparar las variantes 0.6B, 4B y 8B y las cuantizaciones bf16, 8 bits y 4 bits sobre el mismo corpus para decidir el equilibrio calidad/memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son la evaluación interna de la model card:

| Metrica | Resultado |
|---|---|
| Fidelidad frente a bf16 (coseno medio) | 0,98 |
| Cambios en la selección top-1 respecto a bf16 | 7 % |
| Recuperación top-1 en el test, 0.6B (MLX bf16) | 67,1 % |
| Recuperación top-1 en el test, 4B (MLX bf16) | 72,4 % |
| Recuperación top-1 en el test, 8B (MLX bf16) | 78,2 % |
| Tiempo de embedding de 318 textos (178 tickets + 140 artículos), 4B, M3 Max 48 GB, lote de 8, hasta 1024 tokens | 35-55 s (rango sobre las tres variantes de cuantización) |

| Medicion derivada | Valor |
|---|---|
| Throughput implícito en el test (318 textos / 35-55 s) | ~5,8 a ~9,1 textos por segundo |
| Tiempo por texto en ese régimen | ~0,11 a ~0,17 s |

La model card indica que la cuantización redujo disco y memoria pero no aceleró el embedding en esas ejecuciones.

## Requisitos de hardware

- Peso en disco y en memoria: 2,3 GB para esta variante de 4 bits; 4,3 GB para la de 8 bits; 8,0 GB para bf16.
- VRAM estimada para inferencia: al ser MLX sobre memoria unificada, el consumo ronda los pesos más el overhead de activaciones y lotes; con 2,3 GB de pesos un equipo de 16 GB de memoria unificada es suficiente para lotes pequeños a 1024 tokens.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y sus variantes Pro/Max/Ultra). La medición documentada se hizo en un M3 Max con 48 GB.
- Cabe en consumer: sí, en cualquier Mac con Apple Silicon y memoria unificada suficiente; no está pensado para GPU NVIDIA, ya que el formato es MLX.
- Opciones de despliegue: librería mlx-embeddings (`pip install mlx-embeddings`); no se documentan rutas para vLLM, TGI, llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: 35-55 s para 318 textos (lote de 8, hasta 1024 tokens) en M3 Max 48 GB, equivalente a ~0,11-0,17 s por texto en ese régimen.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Contexto | Recuperacion top-1 (test de la model card) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Octen-Embedding-4B-mlx-4bit (esta ficha) | ~4,02 B | 2560 | 32K | 72,4 % (medido en la variante bf16) | Apache 2.0 | MLX, comunidad |
| Octen-Embedding-0.6B (variantes mlx bf16/8b/4b) | ~0,6 B | 1024 | no disponible | 67,1 % | Apache 2.0 | MLX, comunidad |
| Octen-Embedding-8B (variantes mlx bf16/8b/4b) | ~8 B | 4096 | no disponible | 78,2 % | Apache 2.0 | MLX, comunidad |
| Qwen/Qwen3-Embedding-4B (modelo base) | ~4 B | no disponible en la informacion | no disponible | no disponible | Apache 2.0 | safetensors, ecosistema transformers |
| Octen-Embedding-4B-mlx-bf16 / mlx-8bit | ~4,02 B | 2560 | 32K | 72,4 % | Apache 2.0 | MLX, comunidad |

El patrón que muestran los datos del autor es que el tamaño importa: 67,1 % a 0,6B, 72,4 % a 4B y 78,2 % a 8B en su test interno de recuperación. La variante de 4 bits no mejora la calidad del bf16 (0,98 de coseno medio, 7 % de cambios en top-1) pero reduce el espacio en disco de 8,0 a 2,3 GB.

## Limitaciones y advertencias

- Conversión no oficial: es un artefacto de la comunidad, no un lanzamiento de Octen; el autor recomienda verificar la calidad sobre datos propios.
- Pérdida de calidad medible: coseno medio de 0,98 frente a bf16 y un 7 % de cambios en la selección top-1. La model card aconseja preferir 8 bits o bf16 cuando la memoria lo permita.
- La cuantización no aportó velocidad en las pruebas: el ahorro es de disco y memoria, no de latencia.
- Dependencia de plataforma: MLX solo funciona en Apple Silicon; no hay ruta documentada para CUDA, vLLM, TGI, llama.cpp u Ollama.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad en la información disponible.
- Alucinación: al ser un modelo de embeddings no genera texto, pero puede producir recuperaciones erróneas o falsos positivos por similitud; el test del autor muestra un top-1 del 72,4 % en bf16, es decir, aproximadamente una de cada cuatro consultas no recupera el documento correcto en primera posición.
- Idiomas: se anuncian más de 100 idiomas, pero la evaluación documentada solo cubre inglés, francés, neerlandés y alemán; no hay datos de calidad para castellano.
- Contexto: aunque la arquitectura soporta 32K tokens, los ejemplos y la evaluación truncan a 1024 tokens, y no se documenta el comportamiento más allá de esa longitud.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una conversión conviene conservar la atribución a Octen y Qwen.
- Datos incompletos: la descripción del conjunto de evaluación y el resto de la model card aparecen truncados en la información disponible; no hay cifras de MMLU, MTEB ni otros benchmarks estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-4bit
- Modelo base: https://huggingface.co/Octen/Octen-Embedding-4B
- Modelo del que deriva el base: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Variante bf16: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-bf16
- Variante 8 bits: https://huggingface.co/juliensimon/Octen-Embedding-4B-mlx-8bit
- Variantes 0.6B: https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-bf16 , https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-8bit , https://huggingface.co/juliensimon/Octen-Embedding-0.6B-mlx-4bit
- Variantes 8B: https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-bf16 , https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-8bit , https://huggingface.co/juliensimon/Octen-Embedding-8B-mlx-4bit
- Repositorio MLX: https://github.com/ml-explore/mlx
- Sitio de Octen: https://octen.ai/
- Paper referenciado en las etiquetas del modelo: https://arxiv.org/abs/2506.05176
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
