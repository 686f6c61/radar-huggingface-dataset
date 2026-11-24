# kazuakey/bge-reranker-v2-m3-jaquad-ft

## Resumen

bge-reranker-v2-m3-jaquad-ft es un modelo de reranking (cross-encoder) obtenido por ajuste fino de BAAI/bge-reranker-v2-m3, publicado por el usuario kazuakey. Su proposito es reordenar pasajes recuperados en un pipeline de generacion aumentada por recuperacion (RAG) sobre Wikipedia en japones, dentro de un ejercicio academico. Parte de la arquitectura XLM-RoBERTa del modelo base y cuenta con 567.755.777 parametros, con pesos en formato safetensors y un repositorio de 2,3 GB.

El modelo no genera texto: recibe un par consulta-pasaje y produce una puntuacion de relevancia que permite reordenar los candidatos devueltos por un recuperador inicial. El ajuste se hizo con pares construidos de forma mecanica a partir de los conjuntos JaQuAD y JSQuAD/JGLUE, usando como positivos el pasaje que contiene la respuesta y como negativos duros resultados de BM25. Esta orientado especificamente al dominio de preguntas y respuestas sobre Wikipedia japonesa.

Su relevancia practica es limitada pero concreta: sirve como ejemplo reproducible de ajuste de un reranker multilingue para un dominio e idioma concretos, y puede utilizarse como segunda etapa de ranking en sistemas RAG en japones. La licencia CC BY-SA 4.0 y la ausencia de datos de evaluacion publicados condicionan su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (heredada de BAAI/bge-reranker-v2-m3) |
| Parametros totales | 567.755.777 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (entrenado para japones; modelo base multilingue) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: procesa conjuntamente la consulta y el pasaje candidato y emite una puntuacion escalar de relevancia, en lugar de generar representaciones independientes como haria un bi-encoder. La arquitectura subyacente es la de XLM-RoBERTa, heredada del modelo base BAAI/bge-reranker-v2-m3, con 567.755.777 parametros. No se dispone de informacion sobre la longitud maxima de secuencia configurada ni sobre detalles del cabezal de clasificacion en la informacion proporcionada.

El ajuste fino se realizo sobre un conjunto de pares construido de forma mecanica a partir de JaQuAD y JSQuAD/JGLUE: el positivo es el pasaje que contiene la respuesta y los negativos son resultados duros de BM25. No se documentan el numero de pasos de entrenamiento, la tasa de aprendizaje, el numero de pares ni si se aplicaron tecnicas adicionales como destilacion, hard-negative mining iterativo o entrenamiento con listwise loss. Tampoco se indica si hubo evaluacion de validacion durante el entrenamiento.

## Capacidades

- Reranking de pasajes: asigna una puntuacion de relevancia a cada par consulta-pasaje para reordenar los candidatos de un recuperador previo.
- Preguntas y respuestas sobre Wikipedia en japones: el ajuste esta orientado a este dominio concreto.
- Integracion en pipelines RAG como segunda etapa de ranking tras la recuperacion (BM25, embeddings o busqueda hibrida).
- Reutilizacion del tokenizador y la configuracion multilingue del modelo base, aunque no se documenta el rendimiento fuera del japones.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni capacidades multimodales, por su naturaleza de cross-encoder.

## Casos de uso

- RAG sobre Wikipedia japonesa: reordenar los 50-100 pasajes recuperados por BM25 o un bi-encoder antes de pasarlos al generador, mejorando la precision del contexto entregado al LLM.
- Busqueda documental interna en japones: aplicar el reranker sobre resultados de un indice lexico para priorizar los fragmentos que responden realmente a la consulta.
- Evaluacion de recuperadores: usar las puntuaciones del modelo como referencia para comparar la calidad de distintos sistemas de recuperacion en japones.
- Filtrado de contexto en asistentes conversacionales: descartar pasajes irrelevantes antes de construir el prompt, reduciendo el consumo de tokens y el riesgo de alucinacion.
- Base para ajuste fino adicional: al estar publicado con licencia CC BY-SA 4.0 y pesos safetensors, sirve como punto de partida para dominios japoneses especializados.
- Docencia y experimentacion: reproduce un flujo completo de construccion de pares positivos/negativos con BM25 y ajuste de un reranker, util como referencia metodologica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,3 GB solo para los pesos, mas activaciones; en fp16/bf16 aproximadamente 1,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 con lotes pequenos; A100 o H100 solo si se procesan lotes grandes en produccion.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (TEI) de Hugging Face, o exportacion a ONNX; no se documenta soporte especifico en vLLM ni llama.cpp.
- Latencia y throughput: no disponibles; al ser un cross-encoder, el coste escala linealmente con el numero de pares consulta-pasaje a puntuar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kazuakey/bge-reranker-v2-m3-jaquad-ft | 567,8 M | no disponible | CC BY-SA 4.0 | Ajuste especifico para QA sobre Wikipedia japonesa |
| BAAI/bge-reranker-v2-m3 | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Modelo base multilingue, sin ajuste especifico |
| bge-reranker-base | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Variante mas pequena de la familia BGE; comparacion no verificada con datos disponibles |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No se han publicado metricas de evaluacion: se desconoce si el ajuste mejora al modelo base en el propio dominio objetivo.
- El conjunto de entrenamiento se construyo de forma mecanica con negativos de BM25; puede introducir sesgos hacia el estilo y la distribucion de JaQuAD y JSQuAD.
- Dominio muy acotado (Wikipedia japonesa y QA extractivo); el rendimiento fuera de ese ambito no esta documentado.
- Riesgo de sobreajuste a las particularidades de los conjuntos de entrenamiento y de degradacion en consultas conversacionales o de otro idioma.
- La licencia CC BY-SA 4.0 impone obligaciones de atribucion y compartir-al-igual sobre obras derivadas, lo que puede condicionar su uso comercial.
- El modelo no genera respuestas: cualquier uso en produccion requiere integrarlo con un recuperador y un generador externos.
- El repositorio muestra cero descargas y cero likes, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kazuakey/bge-reranker-v2-m3-jaquad-ft
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- Licencia JaQuAD (CC BY-SA 3.0): https://creativecommons.org/licenses/by-sa/3.0/
- JGLUE / JSQuAD: https://github.com/yahoojapan/JGLUE
- Licencia JGLUE (CC BY-SA 4.0): https://creativecommons.org/licenses/by-sa/4.0/
