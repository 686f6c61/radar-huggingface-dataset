# n24q02m/fr-paraphrase-multilingual-MiniLM-L12-v2

## Resumen

`n24q02m/fr-paraphrase-multilingual-MiniLM-L12-v2` es una conversión a ONNX cuantizado del modelo de embeddings `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, publicada por el usuario n24q02m. No se trata de un modelo nuevo: es un artefacto de despliegue que empaqueta los pesos del modelo base en formato ONNX (opset 21) con dos variantes cuantizadas, int8 y q4f16, pensadas para inferencia eficiente en CPU y en entornos con recursos limitados.

El modelo base es un transformer tipo BERT de la familia MiniLM, con 12 capas y aproximadamente 118 millones de parámetros, entrenado por sentence-transformers para generar embeddings de frases multilingües con pooling MEAN y normalización L2. Su función es la extracción de características (feature-extraction): convierte texto en vectores densos utilizables para búsqueda semántica, similitud entre frases, clustering y deduplicación.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,3 GB y fue creado el 11 de noviembre de 2026. Es útil para quien quiera ejecutar el modelo base sin PyTorch, mediante ONNX Runtime, y con requisitos de memoria reducidos gracias a la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L12), 12 capas |
| Parametros totales | no disponible (el modelo base MiniLM-L12-v2 ronda los 118 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base admite secuencias de hasta 128 tokens de posiciones, dato no confirmado aqui) |
| Tipos de cuantizacion | int8 (QInt8, cuantizacion dinamica) y q4f16 (MatMulNBits, block_size 128, simetrica, con cast a float16) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero el autor no declara lista de idiomas) |
| Licencia | no disponible; el autor indica que hereda la licencia del modelo base y remite a su model card |
| Formato de pesos | ONNX (opset 21): `onnx/model_quantized.onnx` (113 MB) y `onnx/model_q4f16.onnx` (194 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder de tipo BERT con 12 capas (MiniLM-L12), adaptado por sentence-transformers para producir embeddings de frases. El pipeline declarado es `feature-extraction` con pooling MEAN y normalización activada, lo que significa que la salida es un vector normalizado listo para similitud coseno. El modelo base fue entrenado originalmente por sentence-transformers sobre pares de frases multilingües; sin embargo, esta ficha no dispone de detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, por lo que esos datos se consideran no disponibles.

La innovación de este repositorio no está en el entrenamiento, sino en la conversión. Se ha utilizado la herramienta `fastretrieval` del mismo autor para exportar a ONNX opset 21. La variante int8 se generó con `onnxruntime.quantization.quantize_dynamic` (QInt8), mientras que la variante q4f16 se obtuvo con `MatMulNBitsQuantizer` con block_size 128 y cuantización simétrica, seguida de un cast a float16. No se documentan técnicas de decodificación especulativa ni atención lineal, ya que no aplican a un encoder de embeddings.

## Capacidades

- Generación de embeddings de texto para similitud semántica y búsqueda vectorial.
- Extracción de características con pooling MEAN y normalización L2.
- Soporte multilingüe heredado del modelo base (sin lista explícita de idiomas en esta ficha).
- Ejecución en ONNX Runtime, sin dependencia de PyTorch en tiempo de inferencia.
- Dos variantes cuantizadas para equilibrar tamaño y precisión: int8 (113 MB) y q4f16 (194 MB).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de embeddings, no un modelo generativo.
- No dispone de modo thinking, visión, audio ni capacidades de agente.

## Casos de uso

- Búsqueda semántica en producción: indexar documentos como vectores ONNX y consultar por similitud coseno; la variante int8 reduce la huella de memoria a 113 MB, adecuada para servicios con muchos workers.
- Deduplicación de textos: comparar embeddings normalizados para detectar near-duplicates en corpus multilingües, con inferencia en CPU mediante ONNX Runtime.
- Clustering de tickets de soporte: agrupar consultas de usuarios por similitud semántica para enrutarlas a colas especializadas, aprovechando el soporte multilingüe del modelo base.
- Recomendación de contenido: calcular similitud entre artículos, productos o publicaciones y generar vecinos más cercanos en un índice vectorial.
- RAG ligero en el borde: usar la variante q4f16 en dispositivos con poca memoria para generar embeddings de consultas y fragmentos en un pipeline de recuperación local.
- Filtrado previo en pipelines de clasificación: generar embeddings como features de entrada para un clasificador downstream, sustituyendo al modelo PyTorch original por la build ONNX para reducir latencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, la variante int8 ocupa 113 MB de pesos y la q4f16 194 MB, más memoria de activaciones y overhead de ONNX Runtime (no cuantificado en la información disponible).
- GPU recomendadas: no disponible; al ser un modelo pequeño, cualquier GPU con soporte ONNX Runtime CUDA es suficiente, pero el autor no especifica requisitos.
- Cabe en GPU de consumo: sí, por tamaño de pesos (113-194 MB), aunque no se confirma compatibilidad con modelos concretos como RTX 4090.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) y la librería `fastretrieval` del autor, que carga el modelo con `TextEmbedding("<repo-id>")`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n24q02m/fr-paraphrase-multilingual-MiniLM-L12-v2 | no disponible (base MiniLM-L12) | no disponible | ONNX int8 / q4f16 | heredada del base, no disponible | Hugging Face, 0 descargas |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | no disponible en esta ficha | no disponible | PyTorch (safetensors) | no disponible en esta ficha | Hugging Face (modelo base) |
| Otras builds ONNX del mismo base | no disponible | no disponible | ONNX | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de alternativas en la información proporcionada; la comparativa se limita a la relación con el modelo base del que deriva.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, código ni respuestas; no debe evaluarse con benchmarks como MMLU o HumanEval.
- La licencia no está declarada explícitamente en el repositorio; el autor remite a la licencia del modelo base, por lo que debe verificarse antes de uso comercial.
- No se declara la lista de idiomas soportados, aunque el modelo base es multilingüe; la cobertura real por idioma no está documentada aquí.
- La longitud máxima de contexto no se especifica en la información proporcionada; asumir valores distintos al del modelo base puede provocar truncamientos silenciosos.
- La cuantización int8 y q4f16 puede degradar ligeramente la calidad de los embeddings frente a los pesos originales en float32; no se han publicado métricas de esa degradación.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente; no hay evidencia de uso en producción ni de mantenimiento continuado.
- Riesgo de sesgos y alucinación: al ser un encoder de similitud, no genera texto y el riesgo de alucinación no aplica; los sesgos del modelo base (demográficos, lingüísticos) se heredan sin documentación adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/n24q02m/fr-paraphrase-multilingual-MiniLM-L12-v2
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Herramienta de conversión fastretrieval: https://github.com/n24q02m/fastretrieval
