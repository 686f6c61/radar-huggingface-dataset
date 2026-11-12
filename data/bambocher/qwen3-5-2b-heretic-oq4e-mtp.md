# bambocher/Qwen3.5-2B-heretic-oQ4e-mtp

## Resumen

Qwen3.5-2B-heretic-oQ4e-mtp es una versión cuantizada y "descensurada" (decensored) del modelo Qwen/Qwen3.5-2B de Alibaba Qwen, publicada por el usuario bambocher en Hugging Face. El modelo combina tres transformaciones sobre el checkpoint original: un proceso de ablación de comportamiento mediante la herramienta Heretic v2.0.0 que elimina los rechazos del modelo, una cuantización mixta de precisión variable con oQ (oMLX v0.7.3) orientada a Apple Silicon, y la preservación de la cabeza de predicción multi-token (MTP) del modelo original.

El checkpoint resultante tiene 2.274.069.824 parámetros lógicos distribuidos en tres componentes: el modelo de lenguaje (1.882B), un codificador visual (0.331B) y la cabeza MTP (0.061B). La cuantización emplea un esquema mixto con mezcla de pesos en 4, 5 y 6 bits afín con grupo de 64, más una fracción en BF16, resultando en un promedio efectivo de 6.504 bits por peso y un tamaño de repositorio de 1.9 GB.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización mixta poco habitual (oQ) que prioriza capas sensibles en mayor precisión; por otro, ilustra el ecosistema de variantes "heretic" que eliminan los mecanismos de rechazo de modelos alineados, con implicaciones importantes para el despliegue en producción. El modelo está pensado para ejecutarse con la librería MLX de Apple, lo que lo hace adecuado para inferencia local en hardware Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con cabeza MTP y torre visual; cuantización mixta oQ |
| Parametros totales | 2.274.069.824 (2.274B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: afín 4-bit (grupo 64), 5-bit (grupo 64), 6-bit (grupo 64) y BF16; promedio efectivo 6.504 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 1.882B | 1.139 GB / 1.060 GiB |
| Visión | 0.331B | 0.663 GB / 0.617 GiB |
| Cabeza MTP | 0.061B | 0.047 GB / 0.044 GiB |
| Total | 2.274B | 1.849 GB / 1.722 GiB |

Distribución de bits por peso:

| Formato | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 4-bit, grupo 64 | 1.293B | 56.836% | 0.677 GiB | 4.50 |
| Afín 5-bit, grupo 64 | 0.639B | 28.104% | 0.409 GiB | 5.50 |
| Afín 6-bit, grupo 64 | 0.002B | 0.092% | 0.002 GiB | 6.50 |
| BF16 | 0.340B | 14.967% | 0.634 GiB | 16.00 |
| Total | 2.274B | 100% | 1.722 GiB | 6.504 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal de la familia Qwen3.5 con torre visual integrada y una cabeza de predicción multi-token (MTP). La cabeza MTP, de 0.061B parámetros, se conserva intacta en esta variante y permite decodificación especulativa multi-token, una técnica que acelera la generación al predecir varios tokens por paso y verificarlos después. La torre visual (0.331B) habilita entrada de imágenes, por lo que el modelo es multimodal aunque su tamaño sea reducido.

Sobre el entrenamiento original no se aporta información en la model card: no se especifican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. Lo que sí se documenta es el post-procesado: la "descensura" se realizó con Heretic v2.0.0 mediante una técnica de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada entre las capas 12 y 23, con parámetros de preservación de buen comportamiento de 0.9189, dirección de mal comportamiento de 0.0008, sobrecorrección relativa de 0.9924 y 14 vecinos. El resultado declarado es una reducción de rechazos de 97/100 en el modelo original a 0/100 en esta variante, con una divergencia KL de 0.1397 respecto al original.

La cuantización se realizó con oQ (oMLX v0.7.3), un esquema de precisión mixta que asigna 4 bits a la mayoría de pesos (56.8%), 5 bits a una fracción sustancial (28.1%), 6 bits a un residuo mínimo (0.09%) y mantiene un 15% en BF16. Esta distribución sugiere que las capas más sensibles (probablemente embeddings, cabezas de salida y algunas capas intermedias) se preservan en mayor precisión para limitar la degradación.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-2B.
- Procesamiento de imágenes: incluye torre visual de 0.331B parámetros, por lo que acepta entradas multimodales.
- Decodificación especulativa mediante cabeza MTP conservada, que acelera la inferencia.
- Generación de código y matemáticas: capacidades propias de la familia Qwen3.5, aunque no se documentan métricas específicas en esta variante.
- Multilingüismo: no disponible en la información proporcionada.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo "thinking" u otras capacidades especiales: no documentado.
- Ejecución nativa en Apple Silicon mediante MLX.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el modelo está cuantizado específicamente para MLX y ocupa 1.9 GB, por lo que cabe en la memoria unificada de un MacBook con 8 GB o más, permitiendo asistentes locales sin conexión.
- Prototipado de asistentes multimodales en local: la torre visual integrada permite procesar imágenes junto con texto en un equipo de sobremesa, útil para experimentación con descripción de imágenes o extracción de información visual.
- Aceleración de generación con MTP: la cabeza de predicción multi-token conservada permite implementar decodificación especulativa en pipelines MLX, reduciendo la latencia en tareas de generación larga.
- Investigación sobre alineación y descensura: el checkpoint y sus parámetros ARA documentados sirven como caso de estudio reproducible para investigar cómo la ablación de direcciones de comportamiento afecta a la tasa de rechazo y a la divergencia KL.
- Evaluación de cuantización mixta: la distribución detallada de bits por tensor permite comparar la degradación de calidad frente al modelo original en BF16, útil para estudiar esquemas de precisión variable.
- Aplicaciones educativas y de demostración: el tamaño reducido y la licencia del modelo base (a confirmar) lo hacen manejable para talleres y demos de modelos multimodales en hardware de consumo.

## Benchmarks y rendimiento

La model card solo reporta métricas del proceso de descensura, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.), que no están disponibles en la información proporcionada.

| Métrica | Este modelo | Modelo original (Qwen/Qwen3.5-2B) |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0.1397 | 0 (por definición) |

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 1.722 GiB (1.849 GB en disco), por lo que la inferencia requiere aproximadamente 2 GB de memoria más el overhead de la librería y del contexto.
- Cabe en GPUs de consumo con 4 GB o más, y en la memoria unificada de cualquier Mac con Apple Silicon (M1 en adelante).
- GPU recomendadas: al estar empaquetado para MLX, el hardware objetivo son los chips Apple M1/M2/M3/M4 (Pro, Max, Ultra). No se distribuye en formatos GGUF ni safetensors estándar para CUDA, por lo que su uso en GPUs NVIDIA/AMD requeriría conversión.
- Opciones de despliegue: MLX (librería nativa). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; la presencia de la cabeza MTP sugiere que se puede aplicar decodificación especulativa para mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-heretic-oQ4e-mtp | 2.274B | no disponible | no disponible | safetensors (MLX) | Descensurado, cuantización mixta oQ, MTP conservada |
| Qwen/Qwen3.5-2B | 2B (aprox.) | no disponible | no disponible | safetensors | Modelo base original, con rechazos (97/100) |
| Otras variantes "heretic" de Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros desarrolladores (Llama, Gemma, Phi) en parámetros, contexto y rendimiento, por lo que la comparativa se limita al modelo base y a variantes no documentadas.

## Limitaciones y advertencias

- La descensura elimina los rechazos (0/100), lo que implica que el modelo puede generar contenido dañino, ofensivo o inseguro sin filtros; no es apto para aplicaciones orientadas al público sin moderación adicional.
- La divergencia KL de 0.1397 respecto al original indica una alteración medible de la distribución de salida; puede degradar la calidad en tareas que dependían del comportamiento alineado.
- La cuantización mixta a 6.504 bits/peso introduce pérdida de precisión frente al BF16 original, especialmente en el 56.8% de pesos en 4 bits.
- No se documentan sesgos conocidos, idiomas soportados ni limitaciones de contexto; se desconoce la longitud de contexto efectiva.
- La licencia no está indicada en el repositorio; es imprescindible verificar la licencia del modelo base Qwen3.5-2B antes de cualquier uso comercial.
- El modelo está empaquetado exclusivamente para MLX; su uso fuera de Apple Silicon requiere conversión y no está soportado oficialmente.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-12); no hay evidencia de validación por la comunidad.
- La model card indica que se re-cuantizó con oMLX v0.7.3 y que las copias anteriores deben descargarse de nuevo, lo que sugiere posibles problemas de reproducibilidad entre versiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Proyecto Heretic: https://heretic-project.org
