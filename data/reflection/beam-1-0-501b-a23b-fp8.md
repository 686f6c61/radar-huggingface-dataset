# reflection/Beam-1.0-501B-A23B-FP8

## Resumen

Beam-1.0-501B-A23B-FP8 es un modelo de lenguaje de gran escala desarrollado por Reflection, publicado bajo licencia Apache 2.0. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) dispersa que combina 501.267.612.352 parámetros totales con 23.400 millones de parámetros activos por token, lo que permite un equilibrio entre capacidad y coste de inferencia. Esta ficha concreta es el checkpoint cuantizado en FP8 del modelo instruido, y el release incluye también versiones en BF16 y NVFP4.

El modelo está diseñado específicamente para tres áreas: razonamiento eficiente en tokens (alcanza calidad comparable a modelos abiertos líderes con aproximadamente 3 veces menos tokens de razonamiento en inferencia), ingeniería de software (resolución de issues reales de GitHub, entornos CLI y DevOps) y uso agéntico de herramientas (tareas de horizonte largo, integración vía MCP y navegación). Soporta una ventana de contexto de 1 millón de tokens, lo cual es relevante para cargas de trabajo con repositorios completos o sesiones agénticas prolongadas.

Su relevancia actual radica en la combinación de contexto extremo, eficiencia de tokens en razonamiento y licencia permisiva para uso comercial, en un momento en el que los modelos abiertos de gran tamaño compiten por reducir el coste por tarea agéntica. El desarrollo está predominantemente orientado al inglés y el corte de conocimiento declarado es el 30 de junio de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE dispersa (3 capas densas + 49 capas MoE), atención GQA con compuertas y sliding window attention |
| Parametros totales | 501.267.612.352 (501,3B) |
| Parametros activos | 23,4B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 (este checkpoint); el release incluye BF16 y NVFP4 |
| Idiomas soportados | Inglés (desarrollo predominantemente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors para FP8) |

Datos adicionales declarados por el autor: 52 capas en total, vocabulario de 152k tokens, 256 expertos, modalidad soportada únicamente texto, plantilla de chat basada en formato Harmony modificado, corte de conocimiento el 30 de junio de 2026 y tamaño de repositorio de 503,3 GB.

## Arquitectura y entrenamiento

Beam emplea una arquitectura transformer con mezcla de expertos dispersa: de las 52 capas, 3 son densas y 49 son MoE, con 256 expertos en total y 23,4B de parámetros activos por token sobre un total de 501,3B. La atención combina GQA con compuertas (gated GQA) y sliding window attention, una elección coherente con la ventana de 1M tokens, ya que reduce el coste cuadrático de la atención en secuencias largas. El vocabulario es de 152k tokens y la plantilla de chat sigue un formato Harmony modificado, orientado a la separación de canales de razonamiento y de respuesta.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se declara un énfasis explícito en eficiencia de tokens durante el razonamiento (calidad comparable con aproximadamente 3 veces menos tokens de inferencia) y en el entrenamiento para tareas agénticas de horizonte largo, integración de herramientas vía MCP y entornos de CLI/DevOps. El checkpoint publicado es la versión instruida cuantizada en FP8 mediante compressed-tensors, con checkpoints adicionales en BF16 y NVFP4.

## Capacidades

- Generación de texto conversacional y de instrucciones, con modo de razonamiento explícito separado del canal de respuesta según la plantilla Harmony modificada.
- Razonamiento de nivel graduado en matemáticas y ciencias, incluyendo demostración de teoremas y matemática aplicada.
- Ingeniería de software: resolución de issues reales de GitHub, operación en entornos CLI y DevOps, e integración con arneses de codificación agéntica.
- Generación de código en múltiples lenguajes (el autor indica soporte "across languages", sin lista cerrada).
- Uso agéntico de herramientas: function calling, integración basada en MCP, navegación web y ejecución de flujos multi-paso a partir de instrucciones en lenguaje natural.
- Tareas de horizonte largo con planificación, depuración y autocorrección durante la ejecución.
- Eficiencia de tokens en razonamiento: aproximadamente 3 veces menos tokens de inferencia para calidad de solución comparable a modelos abiertos líderes.
- Capacidades multilingües: limitadas, con desarrollo predominantemente en inglés.
- Capacidades especiales: ventana de contexto de 1M tokens; no se declaran capacidades de visión ni audio (modalidad soportada: solo texto).

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir el contexto del repositorio y del issue y operar en CLI para reproducir, depurar y proponer un parche, aprovechando tanto la ventana de 1M tokens como su entrenamiento específico en entornos DevOps.
- Agentes de codificación integrados en CI/CD: con soporte de tool calling y formato Harmony modificado, puede encadenarse en pipelines para triaje de fallos, generación de parches y ejecución de pruebas bajo instrucciones en lenguaje natural.
- Automatización de operaciones y tareas de horizonte largo: ejecución de flujos multi-paso con integración MCP (por ejemplo, consulta de sistemas internos, aplicación de cambios y verificación) sin intervención humana entre pasos.
- Asistentes de investigación científica: resolución de problemas de nivel graduado en matemáticas y ciencias y demostración de teoremas, con un modo de razonamiento que reduce el número de tokens necesarios frente a modelos comparables.
- Análisis de bases de código completas: la ventana de 1M tokens permite cargar repositorios o conjuntos de documentación extensos en una sola sesión para tareas de revisión, refactorización o explicación.
- Atención al cliente técnica multi-turno: conversaciones largas con historial extenso y uso de herramientas para consultar estado de sistemas, adecuado por la ventana de contexto y la eficiencia de tokens en razonamiento.
- Navegación y extracción de información: uso agéntico con navegación web para tareas de recopilación y verificación de datos a partir de instrucciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente afirma, sin cifras, que el modelo alcanza calidad de solución comparable a modelos abiertos líderes con aproximadamente 3 veces menos tokens de razonamiento en inferencia. No se deben inferir valores de MMLU, HumanEval, GSM8K ni de otras evaluaciones a partir de esa afirmación.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 503,3 GB en FP8, por lo que se requiere un nodo multi-GPU con al menos ~504 GB de memoria agregada solo para los pesos, más overhead de activaciones y caché KV para contexto largo.
- GPU recomendadas: nodos con 8×H100 80 GB (640 GB) o 8×H200; el checkpoint FP8 está pensado para GPUs con soporte de FP8 nativo (Hopper o posterior).
- GPU de consumo: no cabe en ninguna GPU de consumo actual, ni siquiera con cuantizaciones agresivas, dado el tamaño total de 501,3B parámetros.
- Opciones de despliegue: el autor publica el checkpoint en formato compressed-tensors, compatible con motores de inferencia que soportan FP8 (por ejemplo, vLLM o TGI); la model card incluye etiquetas de despliegue para SageMaker y Azure. No se confirma soporte de llama.cpp u Ollama para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada. Los 23,4B de parámetros activos por token sitúan el coste computacional por token en el rango de un modelo denso de ~23B, aunque el requisito de memoria viene determinado por los 501,3B totales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables con datos verificables de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Idiomas: el modelo se desarrolló predominantemente en inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Modalidad: solo texto; no admite visión ni audio.
- Alucinación: no se documentan tasas de alucinación ni evaluaciones de fiabilidad factual; en tareas agénticas de horizonte largo el riesgo de errores acumulados es relevante y requiere verificación externa.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Contexto: aunque la ventana es de 1M tokens, no se publican resultados de evaluación en contextos largos (needle-in-a-haystack u otras), por lo que la calidad efectiva en el extremo de la ventana no está verificada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones de los checkpoints derivados (BF16, NVFP4) antes de desplegar en producción.
- Hardware: el tamaño total de 501,3B hace inviable el despliegue en infraestructura de consumo; el coste de memoria (≈504 GB en FP8) exige nodos multi-GPU dedicados.
- Formato de chat: la plantilla Harmony modificada requiere usar el template oficial; un formateo incorrecto puede degradar la separación entre razonamiento y respuesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reflection/Beam-1.0-501B-A23B-FP8
- Organización en Hugging Face: https://huggingface.co/reflection
- Repositorio GitHub: https://github.com/reflection-oss
- Blog de lanzamiento: https://reflection.ai/blog
- Documentación para desarrolladores: https://developers.reflection.ai/introduction
- Informe técnico (arXiv 2611.26358): https://huggingface.co/papers/2611.26358
- Sitio web de Reflection: https://reflection.ai/
- Licencia (Apache 2.0): https://huggingface.co/reflection/Beam-1.0-501B-A23B/blob/main/LICENSE
