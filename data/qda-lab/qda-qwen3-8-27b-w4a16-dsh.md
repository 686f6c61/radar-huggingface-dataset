# qda-lab/QDA-Qwen3.8-27B-W4A16-dsh

## Resumen

QDA-Qwen3.8-27B-W4A16-dsh es una cuantizacion de 4 bits de los pesos del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por qda-lab. Se trata de una variante de la receta W4A16 (pesos de 4 bits, activaciones de 16 bits) obtenida mediante el mismo proceso de busqueda automatizada de QDA que la version QDA-Qwen3.8-27B-W4A16, pero empleando un backend de agente de busqueda distinto, denominado `dsh`. El modelo base es un transformer multimodal de 27.781.427.952 parametros (aproximadamente 27,8 mil millones) orientado a tareas de image-text-to-text.

El interes de esta ficha radica en que demuestra que una cuantizacion agresiva a 4 bits puede no solo preservar sino mejorar ligeramente las metricas del modelo en BF16 en varios benchmarks de razonamiento, matematicas e instrucciones, segun los datos publicados por el autor. La receta combina GPTQ con rotacion de Hadamard integrada en los pesos y una ponderacion de los tokens de calibracion basada en la traza de Fisher, lo que elimina la necesidad de transformaciones en tiempo de inferencia.

El modelo se distribuye bajo licencia Apache-2.0, en formato safetensors con metadatos de compressed-tensors, y cuenta con soporte explicito para vLLM y SGLang. El repositorio ocupa 19,6 GB. No se dispone de informacion sobre idiomas soportados ni sobre la longitud de contexto en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.8; detalles internos no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos INT4 en grupos de 128, activaciones de 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen/Qwen3.8-27B, un transformer multimodal de aproximadamente 27,8 mil millones de parametros. La cuantizacion aplica GPTQ sobre una copia del modelo rotada con Hadamard: los pesos se almacenan como enteros de 4 bits agrupados en bloques de 128, mientras que las activaciones permanecen en 16 bits. La rotacion se pliega dentro de los propios pesos, de modo que no hay transformacion adicional en tiempo de ejecucion.

El proceso de calibracion utiliza 400 muestras de 2.048 tokens, compuestas por dos ficheros publicos. El primero, `own-answers-768.jsonl`, contiene 768 prompts del dataset qda-lab/qda-calibration-pools (configuracion `reasoning`) junto con las respuestas generadas por el modelo base mediante vLLM con temperatura 1.0, top-k 20, top-p 0.95, semilla 17 y un maximo de 4.096 tokens nuevos. El segundo, `d1-filtered.jsonl`, parte de la configuracion `d1` (2.048 filas) y elimina 37 filas por solapamiento con conjuntos de evaluacion, conservando el resto byte a byte. Cada token de calibracion se pondera mediante una puntuacion de traza de Fisher basada en la incertidumbre del modelo original sobre las siguientes 16 posiciones, con un suelo de un cuarto de la media. La receta fue seleccionada por el buscador automatizado de QDA y es reproducible con la libreria QDA 0.2.0 o superior.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con resultados destacados en benchmarks de matematicas competitivas (AIME 2025, HMMT Feb 2026) y de conocimiento cientifico (GPQA-Diamond).
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado del modelo base Qwen3.8-27B.
- Generacion de codigo, evaluada mediante LiveCodeBench.
- Seguimiento de instrucciones, medido con IFBench.
- Conocimiento general y razonamiento multidisciplinar, medido con MMLU-Pro.
- Compatibilidad con vLLM y SGLang para despliegue en produccion.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo obtiene 90,8 en AIME 2025 y 76,2 en HMMT Feb 2026 en modo thinking, por lo que es adecuado para tutoria de matematicas competitivas, verificacion de demostraciones y generacion de problemas resueltos paso a paso.
- Analisis de documentos cientificos con imagenes: al ser un modelo image-text-to-text, puede procesar figuras, tablas y graficos junto con el texto de articulos o informes tecnicos, extrayendo conclusiones y contrastando datos.
- Evaluacion de conocimiento experto: con 82,4 en GPQA-Diamond, sirve para responder preguntas de nivel doctoral en fisica, quimica y biologia, util en herramientas de formacion interna o asistencia a investigadores.
- Generacion de codigo en pipelines de desarrollo: con 86,5 en LiveCodeBench, puede integrarse en entornos de revision de codigo, generacion de tests y autocompletado avanzado, desplegado mediante vLLM o SGLang.
- Sistemas de instrucciones complejas: su 68,4 en IFBench lo hace apto para agentes que deben seguir especificaciones largas y restricciones de formato, como generacion de informes estructurados o extraccion de datos con esquemas estrictos.
- Despliegue con restricciones de memoria: al ocupar 19,6 GB en pesos INT4, permite servir un modelo de casi 28 mil millones de parametros en GPUs de 24 GB o en configuraciones multi-GPU mas modestas que las requeridas por el modelo en BF16.
- Reproducibilidad de recetas de cuantizacion: investigadores pueden reconstruir el modelo con la libreria QDA 0.2.0 y los ficheros de `qda-recipe-inputs`, lo que facilita auditar el proceso y adaptarlo a otros modelos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, en modo thinking y pass@1 promediado sobre 1 a 32 semillas:

| Benchmark | BF16 | QDA W4A16 | QDA W4A16-dsh |
|---|---|---|---|
| AIME 2025 | 88,0 | 89,4 | 90,8 |
| HMMT Feb 2026 | 74,1 | 75,0 | 76,2 |
| GPQA-Diamond | 82,0 | 81,9 | 82,4 |
| IFBench | 67,7 | 67,6 | 68,4 |
| MMLU-Pro | 83,7 | 82,8 | 83,2 |
| LiveCodeBench | 85,8 | 86,9 | 86,5 |
| Promedio | 80,2 | 80,6 | 81,2 |

El autor indica que las diferencias entre las dos columnas QDA estan dentro del ruido entre ejecuciones y que una comparacion por pares de preguntas no resuelve diferencias significativas. La columna BF16 procede de la model card de QDA-Qwen3.8-27B-W4A16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,6 GB en pesos INT4, por lo que se necesita al menos esa cantidad mas el espacio para cache KV y overhead del runtime; el total depende de la longitud de contexto, que no esta disponible.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano de pesos, una GPU de 24 GB (por ejemplo, RTX 4090 o A10G) podria alojar los pesos, aunque el margen para cache KV es limitado.
- Cabe en consumer GPU: probablemente en GPUs de 24 GB o superiores con contexto corto; no confirmado por el autor.
- Opciones de despliegue: vLLM (`vllm serve qda-lab/QDA-Qwen3.8-27B-W4A16-dsh`) y SGLang (`python -m sglang.launch_server --model-path qda-lab/QDA-Qwen3.8-27B-W4A16-dsh`).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-Qwen3.8-27B-W4A16-dsh | 27,78 B | no disponible | W4A16 (INT4) | Apache-2.0 | Hugging Face |
| QDA-Qwen3.8-27B-W4A16 | 27,78 B | no disponible | W4A16 (INT4) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (BF16) | 27,78 B | no disponible | BF16 | Apache-2.0 | Hugging Face |

Las tres variantes comparten arquitectura, parametros y licencia. La diferencia entre las dos cuantizaciones QDA es el backend de busqueda de la receta (`dsh` frente al original), con resultados practicamente equivalentes segun el propio autor. No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar tareas no cubiertas por los benchmarks publicados; el autor solo reporta seis metricas.
- Las mejoras frente a BF16 en algunos benchmarks estan dentro del ruido estadistico segun el propio autor; no deben interpretarse como una mejora real de capacidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es un riesgo inherente a los modelos generativos de este tamano.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento multilingue sin datos.
- Longitud de contexto: no disponible; esto limita la planificacion de despliegues con conversaciones largas o documentos extensos.
- Licencia: Apache-2.0 para los pesos, pero los ficheros de calibracion tienen licencias propias; en particular, `d1-filtered.jsonl` es CC BY-NC-SA 4.0, lo que afecta a la reutilizacion de los datos de calibracion, no a los pesos.
- Los prompts de calibracion provienen de NuminaMath-CoT (Apache-2.0), code_contests (CC BY 4.0) y ARC (CC BY-SA 4.0); conviene revisar sus condiciones si se redistribuyen los datos.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de los resultados reportados.
- La cita del modelo figura como "TBD" en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-W4A16-dsh
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante W4A16 original: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-W4A16
- Dataset de calibracion: https://huggingface.co/datasets/qda-lab/qda-calibration-pools
- Receta e inputs reproducibles: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.8-27B-W4A16-dsh
