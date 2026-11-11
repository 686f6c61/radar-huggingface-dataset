# richardyoung/Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic-GGUF

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic GGUF es una compilación en formato GGUF del modelo abliterado (con los mecanismos de rechazo eliminados) derivado de mistralai/Mistral-Small-3.2-24B-Instruct-2506. Lo publica el investigador Richard J. Young como material para estudiar la eliminación de rechazos (abliteration) en modelos de pesos abiertos. El proceso de abliteración se realizó con Heretic 2.0, una extensión del método Heretic que aplica una ablación multidireccional guiada por mapas autoorganizados (SOM). El modelo resultante responde a muchas peticiones que el original rechaza: según la model card, la tasa de rechazo sobre 972 prompts dañinos reservados cae del 73,6 % al 7,2 % (70 de 972), medido con el juez WildGuard.

El modelo subyacente es un transformer denso de 23.572.403.200 parámetros (unos 23,6 mil millones), con licencia Apache 2.0 y pesos publicados en safetensors por el autor original. Esta compilación GGUF incluye, de momento, una cuantización Q4_K_M de 14,3 GB y una matriz de importancia (imatrix) de 20 MB; el autor anuncia que añadirá IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0. Solo incluye texto: el modelo base acepta imágenes, pero el proyector de visión no se distribuye en este repositorio.

La relevancia es doble. Por un lado, sirve como banco de pruebas reproducible para investigar hasta qué punto la abliteración degrada el modelo (el autor mide la divergencia KL del primer token respecto al original, fijada en 0,1 para la variante seleccionada). Por otro, permite ejecutar en hardware de consumo un modelo de 24B con los rechazos suprimidos, algo que interesa tanto a investigadores de seguridad como a quienes estudian los límites de los filtros de alineamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral Small 3.2 24B Instruct 2506); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | 23.572.403.200 (≈23,6B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q4_K_M (14,3 GB); anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K y Q8_0; imatrix de 20 MB |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos fuente en safetensors |

## Arquitectura y entrenamiento

El modelo es una ablación del Mistral-Small-3.2-24B-Instruct-2506 original. La modificación no consiste en un reentrenamiento, sino en una intervención sobre los pesos: Heretic 2.0 aplica una ablación multidireccional guiada por un mapa autoorganizado (SOM), una variante del método Heretic estándar que busca direcciones de rechazo en el espacio de activaciones y las suprime. La búsqueda se realizó con 100 ensayos y una regla de selección explícita: minimizar los rechazos por palabra clave en el conjunto de desarrollo (100 prompts de ajuste) sujeto a una divergencia KL del primer token respecto al modelo original menor o igual a 0,1. El ensayo seleccionado produjo 18 rechazos por palabra clave en esos 100 prompts.

Los datos de entrenamiento del modelo original (número de tokens, composición del corpus, fases de RLHF/DPO) no se detallan en la información proporcionada. La compilación GGUF se generó con llama.cpp (commit 468fde9): conversión con `convert_hf_to_gguf.py --outtype bf16` y posterior cuantización con `llama-quantize` en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una matriz de importancia calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estáticas. Cada archivo Q4_K_M se cargó y respondió a un prompt de prueba antes de subirse.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo Instruct original.
- Razonamiento y respuesta a instrucciones con los rechazos suprimidos: responde a muchas peticiones que el modelo original declina.
- Capacidad de visión no disponible en esta compilación: el proyector de imágenes no se incluye.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada para esta variante.
- Soporte de agentes y razonamiento multietapa: no confirmado en la información proporcionada.
- Multilingüismo: limitado al inglés según la model card, aunque el modelo base de Mistral suele cubrir más idiomas; no hay datos específicos para esta variante.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Investigación sobre abliteración: reproducir el experimento del artículo comparando la tasa de rechazo del modelo original (73,6 %) con la de esta variante (7,2 %) sobre el conjunto de 972 prompts dañinos con el juez WildGuard.
- Evaluación de defensas frente a la eliminación de rechazos: usar el modelo como adversario controlado para probar clasificadores de seguridad, filtros de salida o técnicas de realineamiento.
- Estudio de degradación por cuantización: comparar el comportamiento de rechazo entre la versión bf16 (evaluada en el artículo) y las cuantizaciones GGUF, que el autor advierte que no fueron evaluadas y pueden alterar la conducta.
- Despliegue local en hardware de consumo: la Q4_K_M de 14,3 GB cabe en GPU con 16-24 GB de VRAM y permite experimentar con un modelo de 24B sin infraestructura de datacenter.
- Análisis de sesgos y alucinaciones en modelos sin alineamiento de rechazo: estudiar cómo cambia la distribución de respuestas al eliminar la capa de rechazo, midiendo la divergencia KL del primer token (0,1 en la variante seleccionada).
- Reproducibilidad de pipelines de cuantización: el repositorio documenta commit de llama.cpp, parámetros de imatrix y sumas SHA-256, lo que sirve como referencia para construir y verificar GGUF propios.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al modelo en precisión completa (bf16), no a los archivos GGUF:

| Métrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts dañinos reservados (juez WildGuard) | 73,6 % | 7,2 % (70/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | — | 18 |
| Divergencia KL del primer token respecto al original (ensayo seleccionado) | — | 0,1 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni para el modelo original ni para esta variante. Las cifras de rechazo de las cuantizaciones GGUF no han sido evaluadas.

## Requisitos de hardware

- VRAM estimada: unos 14,3 GB para la Q4_K_M; previsiblemente en torno a 20-22 GB para Q6_K y 24-26 GB para Q8_0 (estimación por tamaño de archivo, no confirmada).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q4_K_M y Q6_K; A100 40/80 GB o H100 para Q8_0 y para el modelo en bf16 (≈47 GB solo en pesos).
- GPU de consumo: sí, la Q4_K_M cabe en tarjetas de 16 GB con margen ajustado y en 24 GB con holgura; también puede ejecutarse parcialmente en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli -hf`), Ollama (`ollama run richardyoung/mistral-small-3.2-24b-instruct-2506-som-heretic`), y cualquier runtime compatible con GGUF. Compatible con endpoints según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo (972 prompts, WildGuard) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (SOM-heretic, bf16) | 23,6B | No disponible | 7,2 % | Apache 2.0 | GGUF / safetensors |
| mistralai/Mistral-Small-3.2-24B-Instruct-2506 (original) | 23,6B | No disponible | 73,6 % | Apache 2.0 | safetensors |
| richardyoung/Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic (fuente) | 23,6B | No disponible | 7,2 % | Apache 2.0 | safetensors |
| Otras variantes abliteradas de Mistral Small 3.2 | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con métodos de abliteración alternativos (por ejemplo, Heretic estándar frente a la variante SOM) se aborda en el artículo citado, pero sus cifras no están en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin rechazos: responde a peticiones que el original declina; el autor lo publica para investigación, no como asistente de propósito general.
- Las cuantizaciones GGUF no fueron evaluadas en el artículo y la cuantización puede alterar el comportamiento de rechazo, en cualquier dirección.
- Solo texto: el proyector de visión del modelo base no está incluido, por lo que no procesa imágenes.
- Idioma declarado: inglés; el rendimiento en castellano u otros idiomas no está documentado para esta variante.
- Riesgo de alucinación: no cuantificado en la información disponible; la ablación puede afectar a la calibración, ya que solo se controló la divergencia KL del primer token (0,1).
- Sesgos: no documentados; al eliminar la capa de rechazo es probable que afloren sesgos del modelo base, pero no hay mediciones publicadas.
- Licencia Apache 2.0 permite uso comercial, pero el autor restringe la intención de uso a la investigación sobre eliminación de rechazos y defensas; el usuario asume la responsabilidad legal.
- Longitud de contexto no confirmada para esta variante; conviene verificarla antes de desplegarla en tareas de contexto largo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic-GGUF
- Modelo fuente (safetensors abliterado): https://huggingface.co/richardyoung/Mistral-Small-3.2-24B-Instruct-2506-SOM-heretic
- Modelo original de Mistral: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Artículo citado: Richard J. Young, "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors" (2026); enlace arXiv pendiente de publicar según la model card.
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
