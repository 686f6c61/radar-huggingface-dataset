# lujihong/bge-m3-onnx

## Resumen

bge-m3-onnx es una réplica en formato ONNX del modelo de embeddings BGE-M3 de BAAI, publicada por el usuario lujihong como parte del cliente de escritorio de la empresa LaunchAI (浪起). No se trata de un modelo nuevo ni de una conversión propia: según la model card, los ficheros se han copiado byte a byte desde el repositorio upstream `yuniko-software/bge-m3-onnx` y el tokenizador procede directamente de `BAAI/bge-m3`, con verificación SHA256 en código para ambos artefactos.

El modelo subyacente, BGE-M3, es un encoder multilingüe disenado para generación de embeddings con tres modos de salida simultáneos: representación densa (dense), representación dispersa léxica (sparse) y representación multi-vector tipo ColBERT. Esta combinación permite cubrir búsqueda semántica, búsqueda léxica y re-ranking dentro de un mismo modelo, lo que resulta relevante para pipelines RAG y sistemas de recuperación de información.

La relevancia de este repositorio concreto es operativa: ofrece una exportación FP32 completa (2,27 GB de pesos en un fichero externo ONNX) pensada para inferencia offline en aplicaciones de escritorio, sin dependencia de PyTorch en tiempo de ejecución. La model card indica que existe una variante INT8 publicada en `lujihong/bge-m3-onnx-int8`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BGE-M3), exportado a ONNX |
| Parametros totales | no disponible (pesos FP32 de 2.271.023.104 bytes en `bge_m3_model.onnx_data`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP32 en este repositorio; variante INT8 en `lujihong/bge-m3-onnx-int8` |
| Idiomas soportados | multilingue (segun tag `multilingual` y model card) |
| Licencia | Apache-2.0 (modelo); tokenizador MIT (BAAI/bge-m3) |
| Formato de pesos | ONNX (`bge_m3_model.onnx` + `bge_m3_model.onnx_data`) y `tokenizer.json` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna ni el proceso de entrenamiento, ya que este repositorio es una redistribucion de artefactos y no incluye detalles del modelo original. Por el nombre y la procedencia (`BAAI/bge-m3`), se trata de un encoder transformer orientado a embeddings con tres cabeceras de salida: dense, sparse y ColBERT. El repositorio no aporta datos sobre tokens de entrenamiento, composicion del corpus, ni sobre si hubo fases de RLHF o DPO, algo esperable en un modelo de embeddings.

La innovacion tecnica relevante en el plano de despliegue es la exportacion ONNX con pesos externalizados: el grafo (`bge_m3_model.onnx`, 669.813 bytes) referencia un fichero de datos de 2,27 GB que debe residir en el mismo directorio. El repositorio incluye verificacion SHA256 tanto del modelo como del tokenizador, lo que permite garantizar integridad en distribuciones offline. No se documentan optimizaciones de inferencia adicionales (por ejemplo, decodificacion especulativa o atencion lineal), que no aplican a un encoder de embeddings.

## Capacidades

- Generacion de embeddings densos para busqueda semantica y similitud vectorial.
- Generacion de embeddings dispersos (sparse) para recuperacion lexica ponderada por terminos.
- Representaciones multi-vector tipo ColBERT para re-ranking fino de candidatos.
- Soporte multilingue segun el tag `multilingual` del repositorio; la lista concreta de idiomas no esta disponible.
- Uso offline en aplicaciones de escritorio mediante runtime ONNX, sin necesidad de PyTorch.
- Verificacion de integridad de artefactos por SHA256 en el codigo cliente.
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision ni audio: es un modelo exclusivamente de embeddings.

## Casos de uso

- Busqueda semantica en aplicaciones de escritorio: el modelo puede indexar documentos locales y responder consultas por similitud vectorial usando la salida dense, sin conexion a red, gracias al runtime ONNX y a los pesos empaquetados en el repositorio.
- Recuperacion hibrida para RAG: al ofrecer dense, sparse y ColBERT en un mismo modelo, permite combinar recuperacion lexica y semantica en una sola pasada y reducir el numero de componentes del pipeline.
- Re-ranking de resultados: la salida multi-vector tipo ColBERT sirve para reordenar candidatos recuperados previamente, mejorando la precision en dominios con vocabulario tecnico.
- Busqueda multilingue en bases documentales: adecuado para corpus con documentos en varios idiomas, ya que el modelo esta etiquetado como multilingue y produce espacios vectoriales comparables entre lenguas.
- Deduplicacion y agrupamiento de documentos: los embeddings dense permiten calcular similitud entre textos largos para detectar duplicados o agrupar por tematica en procesos batch.
- Despliegue en entornos sin GPU ni PyTorch: la exportacion ONNX permite ejecutar la inferencia con ONNX Runtime en CPU, lo que encaja en aplicaciones de escritorio con requisitos de instalacion minimos.
- Distribucion offline verificable: el esquema de SHA256 publicado permite a un integrador validar los artefactos antes de cargarlos, util en entornos con cadena de suministro controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos FP32 ocupan 2,27 GB; en GPU se recomienda al menos 4 GB de VRAM para margen de activaciones y tokenizacion. La variante INT8 reduce el peso aproximadamente a una cuarta parte, aunque el dato exacto no esta disponible.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; para cargas batch de alto throughput, A100 o H100. En consumer, RTX 3060 (12 GB), RTX 4060 Ti y superiores son suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU discreta moderna con 4 GB o mas.
- Despliegue: ONNX Runtime (CPU o GPU) es la via natural; el repositorio no documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de embeddings.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salidas | Licencia | Formato |
|---|---|---|---|---|---|
| bge-m3-onnx (este repo) | no disponible (2,27 GB FP32) | no disponible | dense + sparse + ColBERT | Apache-2.0 | ONNX |
| BAAI/bge-m3 (original) | no disponible | no disponible | dense + sparse + ColBERT | MIT (tokenizador); licencia del modelo no confirmada en esta ficha | safetensors/PyTorch |
| yuniko-software/bge-m3-onnx (upstream) | no disponible | no disponible | dense + sparse + ColBERT | Apache-2.0 | ONNX |
| lujihong/bge-m3-onnx-int8 | no disponible | no disponible | dense + sparse + ColBERT | Apache-2.0 | ONNX INT8 |

La comparativa se limita a variantes del mismo modelo porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas de otros autores.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Solo genera representaciones vectoriales.
- La model card no documenta sesgos, comportamiento por idioma ni calidad diferencial entre lenguas; el tag `multilingual` no viene acompanado de evaluacion.
- Riesgo de alucinacion no aplica en sentido estricto, pero si existe riesgo de recuperacion irrelevante si los umbrales de similitud no se calibran por dominio.
- El repositorio declara 0 descargas y 0 likes, y fue creado y actualizado el mismo dia: no hay evidencia de uso en produccion por terceros.
- La licencia Apache-2.0 se hereda del upstream `yuniko-software/bge-m3-onnx`; el tokenizador es MIT. El texto indica que los derechos pertenecen a los autores originales y que este repositorio es solo una copia de distribucion, por lo que la trazabilidad de la licencia del modelo BGE-M3 original conviene verificarla antes de un uso comercial.
- Los dos ficheros ONNX (grafo y datos) deben mantenerse en el mismo directorio; un empaquetado incorrecto provoca fallo de carga.
- No se documentan requisitos de longitud maxima de secuencia ni comportamiento con truncamiento.
- El nombre del autor y la ausencia de documentacion sobre el pipeline de exportacion impiden verificar que la conversion ONNX sea equivalente numerico al modelo original, mas alla de la comprobacion SHA256 contra el upstream.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lujihong/bge-m3-onnx
- Upstream del modelo ONNX: https://huggingface.co/yuniko-software/bge-m3-onnx
- Espejo del upstream: https://hf-mirror.com/yuniko-software/bge-m3-onnx
- Modelo original y tokenizador: https://huggingface.co/BAAI/bge-m3
- Espejo del modelo original: https://hf-mirror.com/BAAI/bge-m3
- Variante INT8: https://huggingface.co/lujihong/bge-m3-onnx-int8
