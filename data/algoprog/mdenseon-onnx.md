# algoprog/mDenseOn-ONNX

## Resumen

mDenseOn-ONNX es la exportación a formato ONNX del modelo de recuperación densa multilingüe `lightonai/mDenseOn`, desarrollado por LightOn. Se trata de un codificador ModernBERT de 307 millones de parámetros que produce embeddings de 768 dimensiones para búsqueda semántica (retrieval) en nueve idiomas, incluyendo inglés, francés, alemán, italiano, español, portugués, sueco, noruego y árabe. La conversión, realizada por Chris Samarinas (algoprog), elimina la dependencia de PyTorch y Transformers en tiempo de inferencia: basta con ONNX Runtime y el tokenizador de Hugging Face.

El repositorio ofrece dos variantes: un modelo en float32 (1,2 GB) idéntico numéricamente al original en PyTorch (coseno 1.000000) y una versión cuantizada a 8 bits (308 MB) que conserva una similitud coseno media de 0,9996 respecto a la versión completa. La variante de 8 bits reduce el uso de memoria de 2,0 GB a 1,04 GB y mantiene una superposición Top-10 del 0,982 en SciFact y 0,976 en NFCorpus, lo que la hace viable para ejecución en CPU de equipos de consumo.

La relevancia actual del modelo radica en su orientación a despliegues locales y ligeros: la build de 8 bits está pensada para Hydor, una aplicación que ejecuta búsqueda semántica sobre la memoria del usuario directamente en su ordenador. El contexto máximo es de 8.192 tokens y la licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), exportado a ONNX (opset 20, atención eager) |
| Parametros totales | 307 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | float32 (model.onnx) e int8 con MatMulNBits (bloques de 32, simétrico) para las 88 matrices de pesos; tabla de palabras en int8 con escala float32 por fila; activaciones en float32 |
| Idiomas soportados | en, fr, de, it, es, pt, sv, no, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx float32, model_q8.onnx int8) |

## Arquitectura y entrenamiento

El modelo base es un ModernBERT de 307 millones de parámetros con embeddings de 768 dimensiones, entrenado por LightOn como recuperador denso multilingüe para contextos largos y búsqueda de código, según el paper "DenseOn with the LateOn: Fully Open Dense and Late-Interaction Models for Multilingual, Long-Context, and Code Search" (arXiv:2607.27178). La exportación a ONNX se realizó con PyTorch 2.15 y Transformers 5.22 mediante `torch.onnx.export(dynamo=True)` con batch y longitud dinámicos, verificándose una similitud coseno de 1.000000 frente a PyTorch en rangos de 5 a 512 tokens, tanto en inferencias individuales como en lotes de 1 a 8. La tokenización produce los mismos IDs que el tokenizador de Transformers.

La cuantización a 8 bits aplica `MatMulNBitsQuantizer` de ONNX Runtime a las 88 matrices de pesos (8 bits, bloques de 32, simétrico), mientras que la tabla de palabras de 256k × 768 (el 64% del modelo) se almacena como filas int8 con una escala float32 por fila (magnitud máxima / 127), reconstruida mediante `Gather` → `Cast` → `Mul`. Cada fila mantiene una similitud coseno de al menos 0,9993 respecto a la original (media 0,99997). Las activaciones permanecen en float32. No se detalla en la información disponible la composición exacta del dataset de entrenamiento ni el uso de RLHF/DPO.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa (pipeline `sentence-similarity`).
- Búsqueda semántica multilingüe en nueve idiomas con un único espacio vectorial compartido.
- Búsqueda de código (tag `code search`), orientada a recuperar fragmentos de código por significado.
- Soporte de contextos largos de hasta 8.192 tokens, adecuado para documentos extensos.
- Pooling CLS con normalización L2 de los embeddings, listo para similitud coseno.
- Prefijos de instrucción específicos (`query: ` y `document: `) para distinguir consultas de documentos.
- Ejecución sin PyTorch ni Transformers: solo ONNX Runtime y tokenizador.
- Inferencia en CPU con batch y longitud dinámicos.
- No dispone de tool calling, agentes, visión, audio ni modo thinking: es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica local en aplicaciones de escritorio: la build de 8 bits (308 MB, 1,04 GB en memoria) permite ejecutar recuperación por significado en el ordenador del usuario sin GPU, como hace Hydor sobre la memoria personal.
- Recuperación de documentos multilingües: un único índice vectorial cubre consultas en español, francés, alemán, italiano, portugués, sueco, noruego, árabe e inglés, útil para bases documentales corporativas plurilingües.
- Búsqueda de código en repositorios: el modelo está entrenado para code search, de modo que puede indexar fragmentos de código y recuperarlos por descripción en lenguaje natural.
- RAG ligero en entornos sin GPU: al ejecutarse solo con ONNX Runtime en CPU (31-38 ms por consulta en la build de 8 bits), encaja en pipelines de recuperación previa a un LLM en servidores modestos.
- Deduplicación y clustering de textos: los embeddings normalizados permiten agrupar documentos similares o detectar duplicados en corpus multilingües.
- Sistemas de recomendación basados en contenido: comparar la similitud entre descripciones de productos o artículos y perfiles de usuario mediante producto escalar de embeddings.
- Filtrado previo en pipelines de CI/CD: indexar documentación técnica o changelogs y recuperar secciones relevantes para asistentes internos de desarrollo.

## Benchmarks y rendimiento

Resultados de recuperación (nDCG@10 sobre BEIR, corpus completo, consultas de test, pooling CLS, coseno):

| Metrica | SciFact | NFCorpus |
|---|---|---|
| float32 (igual a PyTorch) | 74.35 | 37.40 |
| 8-bit | 74.25 (−0,10; IC 95% −0,40 a +0,09) | 37.59 (+0,19; +0,01 a +0,40) |
| Solapamiento Top-10 con float32 | 0.982 | 0.976 |
| Documentos indexados con PyTorch fp16, consultas con esta build | 74.55 | 37.61 |

Rendimiento en CPU (proceso nuevo, 4 hilos, ONNX Runtime 1.31, ficheros en page cache):

| Metrica | float32 | 8-bit |
|---|---|---|
| Carga inicial y primer vector | 1,6-2,0 s | 0,95-1,06 s |
| Memoria tras carga | 2,0 GB | 1,04 GB |
| Una consulta | 13 ms | 31-38 ms |
| Un texto de 512 tokens | 180 ms | 200-230 ms |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no está orientado a generación.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para CPU con ONNX Runtime.
- Memoria RAM: 2,0 GB para float32 y 1,04 GB para la build de 8 bits una vez cargado.
- GPU recomendadas: no disponible; el export está configurado para `CPUExecutionProvider`, aunque ONNX Runtime admite otros proveedores de ejecución.
- Cabe en cualquier equipo de consumo: la build de 8 bits (308 MB en disco) se ejecuta en CPU de portátiles y equipos de escritorio.
- Despliegue: ONNX Runtime 1.23 o superior (necesario para `MatMulNBits` en CPU), junto con `tokenizers` y `numpy`; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 31-38 ms por consulta y 200-230 ms por texto de 512 tokens con 4 hilos en la build de 8 bits; 13 ms y 180 ms respectivamente en float32.
- Throughput: no disponible como cifra agregada; los tiempos por elemento anteriores permiten estimarlo según el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mDenseOn-ONNX (esta ficha) | 307 M | 8.192 | 9 | Apache 2.0 | ONNX (fp32, int8) | Export sin PyTorch, ejecución CPU |
| lightonai/mDenseOn (original) | 307 M | 8.192 | 9 | Apache 2.0 | safetensors (PyTorch) | Requiere PyTorch/Transformers |
| Modelos de embeddings multilingües tipo BGE-M3 | no disponible en la información | no disponible | multilingüe | no disponible | no disponible | No se aportan datos comparativos en la información disponible |

No se dispone en la información proporcionada de resultados comparativos con alternativas concretas; la comparación con el modelo original se limita al formato y al rendimiento de ejecución descritos.

## Limitaciones y advertencias

- Es un modelo de embeddings, no de generación: no produce texto, no razona de forma explícita ni soporta tool calling.
- Riesgo de recuperación irrelevante o sesgada si los textos no siguen los prefijos `query: ` y `document: `; el formato de entrada afecta a la calidad.
- Contexto limitado a 8.192 tokens; textos más largos deben truncarse, lo que puede perder información relevante.
- La cobertura lingüística se limita a los nueve idiomas declarados; otros idiomas no están garantizados.
- La cuantización a 8 bits introduce pequeñas variaciones (nDCG hasta −0,10 en SciFact), aunque dentro de los intervalos de confianza reportados.
- Los embeddings de documentos generados con el modelo original en PyTorch fp16 siguen siendo compatibles, pero mezclar variantes sin validar puede alterar ligeramente el ranking.
- La build de 8 bits exige ONNX Runtime 1.23 o superior; versiones anteriores no soportan `MatMulNBits` en CPU.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución a LightOn y al conversor según los términos de la licencia.
- No se documentan sesgos específicos del modelo base en la información disponible; conviene evaluar el comportamiento en dominios sensibles antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/algoprog/mDenseOn-ONNX
- Modelo base: https://huggingface.co/lightonai/mDenseOn
- Paper (arXiv): https://arxiv.org/abs/2607.27178
- Aplicación Hydor: https://hydor.app
- Perfil del conversor: https://algoprog.com
