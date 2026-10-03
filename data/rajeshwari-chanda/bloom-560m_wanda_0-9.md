# Rajeshwari-Chanda/bloom-560m_wanda_0.9

## Resumen

Bloom-560m_wanda_0.9 es un checkpoint derivado de bigscience/bloom-560m publicado por el usuario Rajeshwari-Chanda en Hugging Face. Se trata de un transformer decoder-only de 559.214.592 parámetros (cifra tomada de los metadatos de safetensors) al que se ha aplicado, según indica el propio identificador del repositorio, una poda del 90 % de los pesos mediante el método Wanda. No es un modelo entrenado desde cero, sino un artefacto de investigación sobre compresión de redes neuronales.

El repositorio no aporta información sustantiva: la model card es la plantilla automática de transformers sin rellenar, no se declara licencia ni idiomas, y el modelo acumula 0 descargas y 0 "me gusta" desde su creación. La única evidencia técnica disponible son los metadatos: 559.214.592 parámetros, formato safetensors, biblioteca transformers, pipeline de text-generation y un tamaño de repositorio de 1,1 GB, coherente con pesos almacenados en fp16/bf16 de forma densa (incluyendo los ceros introducidos por la poda).

Su relevancia es fundamentalmente metodológica: permite estudiar el comportamiento de un modelo de 560 M de parámetros sometido a una poda no estructurada de magnitud-activación sin reentrenamiento posterior, y sirve como baseline en experimentos de sparsity extrema. No debe considerarse un modelo listo para producción ni para uso comercial sin una evaluación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia BLOOM); según la configuración del modelo base bloom-560m: 24 capas, tamaño oculto 1024, 16 cabezas de atención, activación GeLU, embeddings posicionales ALiBi |
| Parametros totales | 559.214.592 (dato real de safetensors); con poda del 90 % quedan aproximadamente 55,9 M de pesos no nulos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens según la configuración del modelo base BLOOM-560m; no confirmado en el repositorio |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors; por el tamaño (1,1 GB) se deduce almacenamiento en fp16/bf16, pero no se documentan variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible. El modelo base BLOOM-560m se entrenó con 46 idiomas naturales y 13 lenguajes de programación, pero este checkpoint no lo declara |
| Licencia | No disponible en el repositorio. La familia BLOOM se publica bajo BLOOM RAIL 1.0, con condiciones de atribución y compartición |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BLOOM-560m: un transformer decoder-only con normalización previa a la atención y a la FFN, activación GeLU, atención multi-cabeza con 16 cabezas y dimensión de cabeza 64 (1024/16), y sesgo posicional ALiBi en lugar de embeddings posicionales aprendidos, lo que en principio permite extender la ventana por encima de los 2048 tokens de entrenamiento aunque con degradación. El vocabulario es de 250.880 tokens, con tokenizador byte-level BPE entrenado para no fragmentar palabras en exceso en los idiomas con script no latino. Estas cifras corresponden al modelo base y no están confirmadas para el checkpoint podado, cuya `config.json` no se ha podido inspeccionar en esta búsqueda.

Sobre esa base se ha aplicado Wanda (Pruning by Weights and Activations, Sun et al., 2023), un método de poda one-shot que elimina pesos según el criterio |W_ij| · ||X_j||_2, es decir, magnitud del peso multiplicada por la norma L2 de la activación de entrada correspondiente, calculada sobre un conjunto de calibración. La comparación se hace por fila (por neurona de salida), de modo que cada neurona conserva aproximadamente el mismo porcentaje de conexiones. El sufijo "0.9" del identificador se interpreta como una tasa de sparsity del 90 %; no hay confirmación explícita en el repositorio. No se documenta ningún reentrenamiento, ajuste fino posterior, destilación ni recuperación de precisión tras la poda.

## Capacidades

- Generación de texto autoregresiva: es la única tarea declarada en el pipeline del repositorio (`text-generation`).
- Capacidad multilingüe y de generación de código potencialmente heredada de BLOOM-560m, no verificada ni declarada para este checkpoint.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes, razonamiento multi-paso ni modos de "pensamiento" explícitos.
- No hay capacidades de visión, audio ni multimodalidad.
- No hay evaluación publicada que permita afirmar qué capacidades sobreviven a la poda del 90 %; en modelos de este tamaño, una sparsity tan alta sin reentrenamiento suele producir degradación severa de la coherencia y de la fidelidad factual.

## Casos de uso

- Investigación en compresión de modelos: sirve como punto de comparación frente a otras técnicas de poda (magnitud, SparseGPT, movimiento) aplicadas al mismo modelo base, ya que comparte pesos de partida con bigscience/bloom-560m.
- Baseline en estudios de sparsity extrema: permite medir curvas de perplejidad y de accuracy frente a la tasa de poda cuando se combina con checkpoints a otras densidades.
- Análisis de robustez de la poda: útil para estudiar si el criterio magnitud-activación preserva mejor ciertos tipos de capas (atención frente a FFN) en un modelo pequeño y con vocabulario multilingüe grande.
- Docencia y material didáctico: ejemplo reproducible de un modelo "denso pero vacío" para explicar la diferencia entre número de parámetros y número de parámetros efectivos, y para mostrar el impacto en el tamaño en disco frente al número de pesos no nulos.
- Pruebas de infraestructura de inferencia: por su tamaño (~1,1 GB), es adecuado para validar pipelines de carga con transformers, text-generation-inference o endpoints compatibles en entornos con recursos limitados antes de pasar a modelos mayores.
- Experimentos de recuperación de capacidad: punto de partida para probar ajuste fino ligero, model soups con el modelo base o técnicas de recuperación de pesos orientadas a restaurar parte del rendimiento perdido.
- Despliegue en CPU o edge con fines de prototipado: cabe en memoria de sistemas modestos, aunque la calidad de salida tras la poda no está garantizada y no se recomienda para tareas de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card está sin rellenar ("[More Information Needed]"), no hay tabla de resultados en el repositorio y la búsqueda web realizada no devolvió ninguna fuente técnica relacionada con el modelo.

## Requisitos de hardware

- Pesos en fp16/bf16: aproximadamente 1,12 GB (559,2 M de parámetros × 2 bytes). En fp32, aproximadamente 2,24 GB.
- La poda no reduce el consumo de memoria en inferencia densa: los safetensors almacenan los ceros, por lo que el peso en disco y en VRAM es el mismo que el del modelo sin podar. Solo se reduciría con kernels dispersos o con un formato que almacenase índices de pesos no nulos.
- Caché KV estimada para el modelo base (24 capas, 16 cabezas, dimensión de cabeza 64, fp16): unos 96 KB por token, aproximadamente 192 MiB con la ventana de 2048 tokens completa.
- VRAM total estimada en fp16 con contexto lleno: entre 1,3 GB y 1,5 GB, incluyendo pesos, caché KV y activaciones.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 3060, RTX 4060, GTX 1650, Tesla T4, L4). Modelos como A100 o H100 son enormemente sobredimensionados para este tamaño.
- Cabe sin problema en GPU de consumo e incluso en CPU con 2-3 GB de RAM, siempre que se cuantice o se convierta a GGUF.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`), y vLLM. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el repositorio no proporciona.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Poda | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rajeshwari-Chanda/bloom-560m_wanda_0.9 | 559,2 M | 2048 (base) | Wanda, 0,9 | No declarada | Repositorio HF, 0 descargas, 0 likes |
| bigscience/bloom-560m | 559,2 M | 2048 | Ninguna | BLOOM RAIL 1.0 | Repositorio HF, ampliamente utilizado |
| bigscience/bloom-1b1 | ≈1,1 B | 2048 | Ninguna | BLOOM RAIL 1.0 | Repositorio HF |
| openai-community/gpt2 | 124 M | 1024 | Ninguna | MIT | Repositorio HF |

No hay datos de rendimiento comparativo disponibles para ninguno de estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los datos de los modelos comparativos proceden de conocimiento general de la familia BLOOM y de GPT-2 y no se han podido verificar en esta búsqueda, cuyos resultados no contenían fuentes técnicas relevantes.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, composición del dataset, sesgos conocidos ni análisis de riesgos.
- La poda del 90 % sin reentrenamiento implica, con alta probabilidad, una degradación severa de la coherencia, la gramaticalidad y la fidelidad factual. No hay evaluaciones que cuantifiquen esa pérdida.
- Riesgo elevado de alucinación y de generación de texto incoherente: se combinan un modelo base de 560 M de parámetros con una compresión agresiva.
- Licencia no declarada: existe incertidumbre legal sobre el uso comercial. El modelo base BLOOM está sujeto a BLOOM RAIL 1.0, que permite uso comercial pero impone obligaciones de atribución y de compartir bajo la misma licencia en determinados supuestos.
- Idiomas no declarados: aunque el modelo base cubre 46 idiomas naturales, no hay garantía de que la poda preserve el rendimiento multilingüe, y probablemente lo degrade de forma desigual según la frecuencia del idioma en los datos de entrenamiento.
- Ventana de contexto limitada a 2048 tokens (según el modelo base), insuficiente para casos de uso con documentos largos o conversaciones extensas.
- Ausencia de soporte de tool calling, function calling y flujos de agente.
- Sin validación comunitaria: 0 descargas y 0 likes, además de una fecha de creación en los metadatos (2026-10-03) posterior a la fecha actual, lo que sugiere un error o un artefacto de publicación.
- El significado exacto del sufijo "0.9" no está documentado por el autor; se interpreta como tasa de sparsity, pero podría referirse a otro hiperparámetro.
- No se debe desplegar en producción sin una evaluación propia de perplejidad, coherencia y sesgos, y sin aclarar antes la situación de licencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_wanda_0.9
- Modelo base: https://huggingface.co/bigscience/bloom-560m
- Paper de BLOOM: https://arxiv.org/abs/2211.05100
- Paper de Wanda (Pruning by Weights and Activations): https://arxiv.org/abs/2306.11695
- Referencia citada en los tags del repositorio (Lacoste et al., 2019, calculadora de impacto ambiental): https://arxiv.org/abs/1910.09700
- Los resultados de la búsqueda web no contenían enlaces relevantes para este modelo; todas las entradas devueltas correspondían a speedtest.net.
