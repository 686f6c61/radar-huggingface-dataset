# endless-frontier/Fx-Bio-1031

## Resumen

Fx-Bio-1031 es un modelo de lenguaje multimodal de tipo agéntico especializado en bioinformática y biología computacional, desarrollado por el laboratorio The Endless Frontier mediante post-entrenamiento sobre Qwen3.8-Flash-Next. Su propósito es superar el paradigma de pregunta-respuesta estática: el modelo está diseñado para planificar y ejecutar de forma autónoma tareas biológicas de múltiples pasos, como el análisis de datos multi-ómicos, la escritura y depuración de pipelines bioinformáticos, la investigación de funciones génicas y la integración de evidencia procedente de múltiples fuentes dentro de entornos de ejecución interactivos.

Arquitectónicamente es un modelo causal multimodal con codificador de visión, construido sobre una arquitectura `Qwen4ExpForConditionalGeneration` con 180.000 millones de parámetros totales. De ellos, 125.000 millones corresponden a un backbone MoE con 6.000 millones activados por token, a los que se suman 51.000 millones en embeddings n-gram y 4.000 millones en módulos MTP (multi-token prediction). Dispone de 48 capas ocultas y 512 expertos enrutados, de los cuales 10 enrutados más 1 compartido están activos por token. La configuración publicada soporta una longitud de contexto de 524.288 tokens.

La relevancia del modelo reside en su enfoque de mejora continua mediante Recursive Self-Improvement (RSI): los datos de entrenamiento no son estáticos, sino que evolucionan iterativamente a través de curaduría de trayectorias, verificación de ejecución, evaluación y retroalimentación de entrenamiento. Esta ficha corresponde al checkpoint `20261009-r2/iter_0001384`, un punto intermedio de esa evolución y no un producto final cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration` (transformer causal multimodal con codificador de visión, backbone MoE) |
| Parametros totales | 179.999.981.459 (180B: 125B backbone MoE + 51B embeddings n-gram + 4B MTP) |
| Parametros activos | 6B en el backbone MoE (10 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (identificador `other` en Hugging Face) |
| Formato de pesos | BF16 safetensors (73 shards, ~360 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-Flash-Next y emplea una arquitectura transformer causal multimodal con mezcla de expertos. El backbone MoE contiene 512 expertos enrutados, con 10 expertos enrutados y 1 compartido activos por token, lo que resulta en 6.000 millones de parámetros activos sobre un total de 125.000 millones en el backbone. A esto se añaden 51.000 millones de parámetros en embeddings n-gram y 4.000 millones en módulos de multi-token prediction (MTP), que permiten predecir varios tokens por paso y potencialmente acelerar la decodificación. La red tiene 48 capas ocultas e incorpora un codificador de visión que habilita la entrada image-text-to-text.

El post-entrenamiento se basa en trayectorias agénticas curadas que cubren análisis de datos biológicos aumentados con herramientas y flujos de trabajo científicos de múltiples pasos. El proceso de desarrollo sigue un ciclo de Recursive Self-Improvement: curaduría iterativa de trayectorias, verificación de ejecución, evaluación y retroalimentación hacia el entrenamiento, de modo que la escala y calidad de los datos evolucionan con cada iteración. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento científico orientado a dominios biológicos.
- Análisis de datos multi-ómicos dentro de entornos de ejecución interactivos.
- Escritura, ejecución y depuración de pipelines bioinformáticos en Python, R y Bash.
- Investigación de funciones génicas e integración de evidencia procedente de múltiples fuentes.
- Comportamiento agéntico: planificación y ejecución autónoma de tareas científicas de múltiples pasos.
- Uso de herramientas (tool calling) en entornos sandbox con datos y utilidades bioinformáticas reales.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a su codificador de visión.
- Soporte de contexto largo de hasta 524.288 tokens, adecuado para corpus genómicos y documentación extensa.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de datos multi-ómicos automatizado: el modelo puede recibir conjuntos de datos de transcriptómica, proteómica o genómica dentro de un contenedor sandbox, seleccionar el método estadístico adecuado y ejecutar el análisis de principio a fin, aprovechando su contexto de 524K tokens para manejar matrices y metadatos extensos.
- Desarrollo y depuración de pipelines bioinformáticos: puede redactar flujos en Python, R y Bash, ejecutarlos, interpretar los errores y corregir el código de forma iterativa, lo que lo hace adecuado para integrarse en entornos de notebook o CI para validación de pipelines.
- Investigación de funciones génicas: dado un gen o una lista de genes, el modelo puede planificar una estrategia de búsqueda de evidencia, consultar fuentes y sintetizar hipótesis funcionales con trazabilidad del razonamiento.
- Integración de evidencia multi-fuente: útil para revisiones sistemáticas asistidas, donde el modelo combina resultados de bases de datos biológicas, literatura y análisis propios en una conclusión coherente.
- Agentes científicos autónomos en entornos de laboratorio seco: adecuado para orquestar tareas de descubrimiento verificables, como las evaluadas en BioMysteryBench, donde se requiere resolver problemas que expertos humanos no lograron cerrar.
- Asistencia en docencia e investigación reproducible: el modelo puede reproducir análisis publicados en revistas como Nature, Science o Cell siguiendo la trayectoria metodológica completa, desde la limpieza de datos hasta la interpretación biológica.
- Automatización de tareas de bioinformática en producción: con soporte de tool calling y ejecución multi-paso, puede integrarse en plataformas internas para tareas repetitivas de procesamiento y verificación de hipótesis.

## Benchmarks y rendimiento

Resultados publicados por el autor, obtenidos con su framework interno de evaluación agéntica. Mayor es mejor; en negrita el mejor resultado de cada fila.

| Benchmark | Metrica | GPT-6-Astra | Opus-5 | Fx-Bio-1031 |
|:---|:---|---:|---:|---:|
| BioMysteryBench | Solvable, Pass@5 | 91,78 | **94,52** | 93,15 |
| BioMysteryBench | Difficult, Pass@5 | 47,06 | 52,94 | **70,59** |
| BioMysteryBench | Overall, Pass@5 | 83,33 | 86,67 | **88,89** |
| BiomniBench | Avg@3 | 76,88 | 81,59 | **82,46** |
| BiomniBench | Pass@3 | 82,00 | 87,42 | **89,50** |
| BixBench3 | Score | **48,70** | 40,60 | 45,76 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 360 GB de pesos, por lo que se requieren múltiples GPUs de alta capacidad; no cabe en una sola GPU convencional.
- Cuantizaciones: no se han publicado tipos de cuantización oficiales; el despliegue en precisión reducida requeriría conversión propia y no está validado por el autor.
- GPU recomendadas: clústeres con varias H100 (80 GB) o A100 (80 GB); por el tamaño de pesos, se necesitan al menos 5 unidades en BF16 solo para almacenar los tensores, más margen para KV cache y activaciones.
- GPU de consumo: no es viable en RTX 4090 ni en GPUs consumer de 24 GB en BF16; requeriría cuantización agresiva no soportada oficialmente.
- Opciones de despliegue: el autor indica usar un framework reciente con soporte explícito para Qwen3.8-Flash-Next / Qwen4Exp; no se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BioMysteryBench Overall (Pass@5) | BiomniBench Pass@3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Fx-Bio-1031 | 180B (6B activos) | 524.288 | 88,89 | 89,50 | Qwen Community License 1.0 | Pesos abiertos en Hugging Face |
| GPT-6-Astra | no disponible | no disponible | 83,33 | 82,00 | propietaria | API cerrada |
| Opus-5 | no disponible | no disponible | 86,67 | 87,42 | propietaria | API cerrada |

## Limitaciones y advertencias

- Es un checkpoint intermedio de un proceso RSI continuo (`iter_0001384`); su rendimiento puede quedar superado por iteraciones posteriores y no debe tratarse como versión estable final.
- No se han publicado datos sobre sesgos, y al ser un modelo especializado en biología su cobertura fuera de ese dominio no está documentada.
- Riesgo de alucinación en la interpretación biológica y en la integración de evidencia; los resultados deben verificarse con ejecución real y revisión experta.
- Idiomas soportados no disponibles: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto de la licencia antes de desplegar en producción.
- El tamaño de 180B y los 360 GB de pesos en BF16 limitan el despliegue a infraestructura de clúster; no es viable en hardware de consumo.
- Los benchmarks proceden del framework interno del autor, lo que puede introducir sesgo de evaluación respecto a mediciones independientes.
- El soporte de tool calling y ejecución depende de frameworks con soporte explícito para Qwen4Exp; no se confirma compatibilidad con los runners más comunes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/endless-frontier/Fx-Bio-1031
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- BioMysteryBench (investigación de Anthropic): https://www.anthropic.com/research/Evaluating-Claude-For-Bioinformatics-With-BioMysteryBench
- BioMysteryBench (dataset): https://huggingface.co/datasets/Anthropic/BioMysteryBench-full
- BiomniBench: https://xbench.org/profession/biomnibench
- BiomniBench (paper): https://www.biorxiv.org/content/10.64898/2026.05.12.724604v1
- BiomniBench (dataset): https://huggingface.co/datasets/phylobio/BiomniBench-DA
- Biomni en Science: https://www.science.org/doi/10.1126/science.adz4351
- BixBench3 (FutureHouse): https://www.futurehouse.org/research/bixbench
- BixBench3 (paper): https://arxiv.org/abs/2503.00096
- BixBench3 (GitHub): https://github.com/Future-House/BixBench
- BixBench3 (dataset): https://huggingface.co/datasets/futurehouse/BixBench
