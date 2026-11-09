# lastabhi/amar-photo-search

## Resumen

Amar photo search es un conjunto de dos modelos ONNX diseñados para búsqueda de fotos por contenido semántico íntegramente en el dispositivo, sin conexión a servidores. Lo desarrolla el proyecto Amar Vault para su aplicación Android de gestión de fotos y está publicado por el usuario lastabhi en Hugging Face. El sistema resuelve el problema de la recuperación imagen-texto (image-text retrieval) en un teléfono: la parte visual convierte cada foto en un vector de 768 dimensiones una sola vez, la parte textual convierte la consulta escrita en otro vector de 768 dimensiones y la búsqueda se reduce a calcular los vecinos más cercanos entre ambos.

El modelo combina dos componentes de origen distinto: la rama de imagen deriva de SigLIP 2 (B/16) de Google, bajo licencia Apache 2.0, y la rama de texto deriva de EmbeddingGemma, sujeta a los términos de uso de Gemma. Los pesos se han convertido a ONNX y cuantizado para su ejecución en Android: la rama visual usa pesos de 4 bits con aritmética de 8 bits (fichero de 63,7 MB) y la rama textual se distribuye en dos ficheros que suman unos 140,9 MB. El repositorio completo ocupa 0,2 GB.

Es relevante ahora porque demuestra un patrón de despliegue de recuperación multimodal totalmente local en dispositivos móviles, con cuantización agresiva y verificación de integridad por SHA-256, en un momento en que la privacidad del contenido fotográfico y la inferencia on-device son requisitos crecientes en aplicaciones de consumo. El soporte de idiomas declarado es inglés (en) e hindi (hi).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos torres: SigLIP 2 (B/16) para imagen y EmbeddingGemma para texto, exportadas a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de embedding, no generativo) |
| Tipos de cuantizacion | Rama visual: pesos de 4 bits con aritmética de 8 bits (w4a8); rama textual: ONNX sin cuantizacion declarada |
| Idiomas soportados | en, hi |
| Licencia | other (apache-2.0-and-gemma-terms); rama visual Apache 2.0, rama textual sujeta a Gemma Terms of Use |
| Formato de pesos | ONNX (`query.onnx`, `query.onnx_data`, `photo-a8.onnx`) |
| Dimension del embedding | 768 |
| Resolucion de entrada de imagen | 256 px |
| Tokenizador | Gemma BPE (`gemma_bpe.bin`, 2,6 MB) |
| Tamano del repositorio | 0,2 GB (carpeta `siglip2-b16-v2cw1-w4a8/`: 207,3 MB) |

## Arquitectura y entrenamiento

La arquitectura es de dos torres independientes con espacio de embedding compartido, el esquema habitual de CLIP/SigLIP para recuperación imagen-texto. La rama de imagen parte de SigLIP 2 (B/16), un transformer visual con parches de 16x16 que procesa la foto a 256 px y produce un vector de 768 dimensiones. La rama de texto parte de EmbeddingGemma, un modelo de embedding textual de Google, con tokenizador BPE propio (`gemma_bpe.bin`). Ambos se han exportado a ONNX y la rama visual se ha cuantizado a pesos de 4 bits con aritmética de 8 bits, lo que reduce el fichero a 63,7 MB. La rama textual se distribuye en `query.onnx` (0,5 MB) más `query.onnx_data` (140,4 MB), que deben residir en la misma carpeta.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los pares imagen-texto ni si hubo ajuste fino adicional por parte del proyecto Amar Vault. La model card indica únicamente que los ficheros ONNX cuantizados fueron producidos por el proyecto a partir de los pesos originales de los modelos upstream, sin garantía alguna. Tampoco se documentan innovaciones técnicas propias más allá de la cuantización w4a8 y la verificación de integridad mediante `files.json` con nombres, tamaños y SHA-256 de cada fichero.

## Capacidades

- Recuperación imagen-texto: convierte fotos en vectores de 768 dimensiones y consultas de texto en el mismo espacio, permitiendo búsqueda por contenido semántico ("perro en la playa", "recibo del supermercado").
- Indexación local: la rama visual se ejecuta una sola vez por foto, de modo que el coste de inferencia se paga en la indexación y no en cada búsqueda.
- Inferencia on-device: todo el pipeline corre en el teléfono Android sin llamadas de red, lo que preserva la privacidad del contenido fotográfico.
- Búsqueda por similitud vectorial: la coincidencia se resuelve con vecinos más cercanos sobre los vectores de 768 dimensiones.
- Multilingüe limitado: consultas en inglés e hindi según los idiomas declarados.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión descriptiva. Su única salida es un embedding.

## Casos de uso

- Galería fotográfica con búsqueda semántica: la aplicación indexa una vez todas las fotos del dispositivo con `photo-a8.onnx` y responde a consultas como "cumpleaños en el jardín" calculando el embedding de la consulta con `query.onnx` y recuperando los vectores más próximos. Adecuado por su tamaño reducido (63,7 MB la rama visual) y su ejecución local.
- Aplicaciones de privacidad estricta: apps de gestión de recuerdos que no pueden subir imágenes a la nube encuentran aquí un pipeline completo que nunca sale del teléfono, con verificación de integridad de los ficheros descargados mediante SHA-256.
- Organización automática de bibliotecas grandes: la indexación por lotes permite etiquetar o agrupar fotos por similitud visual (por ejemplo, agrupar todas las fotos de un mismo monumento) sin coste de servidor.
- Búsqueda en idioma hindi: para usuarios que escriben consultas en hindi, la rama textual basada en EmbeddingGemma cubre ese idioma junto con el inglés, algo poco habitual en modelos de recuperación de este tamaño.
- Funcionalidad offline en regiones con conectividad limitada: al no requerir red tras la descarga inicial, el modelo funciona en modo avión o con datos restringidos.
- Prototipado de recuperación multimodal en Android: sirve como referencia de despliegue ONNX con cuantización w4a8 para equipos que quieran construir su propio buscador visual móvil, reutilizando el manifiesto y la estructura de ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso objetivo (Android); en escritorio, la rama visual cuantizada ocupa 63,7 MB en disco y la textual unos 140,9 MB, por lo que la memoria necesaria es del orden de cientos de MB, no de GB.
- GPU recomendadas: no disponible; el destino declarado es la CPU/NPU de teléfonos Android mediante ONNX Runtime.
- ¿Cabe en GPU de consumo? Sí, con enorme holgura: cualquier GPU con más de 1 GB de memoria libre puede alojar ambas ramas. No se especifican modelos concretos (RTX 4090, A100, H100) porque el caso de uso no es ese.
- Opciones de despliegue: ONNX Runtime (Android y escritorio); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de embedding.
- Latencia y throughput: no disponibles. La model card no publica cifras de latencia por foto ni de consultas por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension del embedding | Idiomas | Licencia | Formato on-device |
|---|---|---|---|---|---|
| Amar photo search (este) | Dos torres SigLIP 2 + EmbeddingGemma, cuantizado | 768 | en, hi | Apache 2.0 + Gemma Terms | ONNX (w4a8 en imagen) |
| SigLIP 2 (B/16) original | Dos torres | no disponible en la información | multilingüe (no detallado) | Apache 2.0 | safetensors / otros |
| EmbeddingGemma original | Torre de texto | no disponible en la información | multilingüe (no detallado) | Gemma Terms of Use | safetensors / otros |
| CLIP ViT-B/32 | Dos torres | 512 | principalmente inglés | MIT (según versión) | múltiples |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados para este conjunto ni cifras de recuperación (Recall@k, mAP) que permitan situarlo frente a las alternativas. La diferencia principal frente a los modelos upstream es la cuantización w4a8 de la rama visual y el empaquetado ONNX listo para Android.

## Limitaciones y advertencias

- No hay benchmarks ni métricas de calidad publicadas: se desconoce la precisión real de la recuperación frente a SigLIP 2 o EmbeddingGemma sin cuantizar.
- La cuantización w4a8 de la rama visual puede degradar la calidad del embedding respecto al modelo original; no se documenta la pérdida.
- Cobertura lingüística limitada a inglés e hindi; las consultas en castellano no están soportadas oficialmente.
- No es un modelo generativo: no puede describir imágenes, responder preguntas ni ejecutar acciones; solo devuelve vectores.
- Licencia mixta: la rama textual está sujeta a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con obligación de transmitir el mismo aviso a terceros; el uso comercial debe revisarse contra esos términos, no solo contra Apache 2.0.
- Los pesos se distribuyen sin garantía alguna según el autor.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos en la recuperación (vectores próximos que no corresponden semánticamente).
- Dependencia de la integridad de los ficheros: `query.onnx` y `query.onnx_data` deben estar en la misma carpeta; se recomienda verificar tamaño y SHA-256 con `files.json` antes de usar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/lastabhi/amar-photo-search
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Descarga directa del manifiesto de ficheros: https://huggingface.co/lastabhi/amar-photo-search/resolve/main/siglip2-b16-v2cw1-w4a8/files.json
