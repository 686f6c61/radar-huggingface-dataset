# RemySkye/rwkv7-g1i-13.3B-i1-GGUF

## Resumen

El modelo `rwkv7-g1i-13.3B-i1-GGUF` es una cuantización en formato GGUF del modelo base `BlinkDL/rwkv7-g1`, desarrollado por RemySkye. Pertenece a la familia RWKV-7, una arquitectura híbrida que combina recurrencia y atención lineal, diseñada para ofrecer una alternativa eficiente a los transformers tradicionales en tareas de generación de texto. El modelo cuenta con 13 270 822 912 parámetros (aproximadamente 13,3 mil millones) y una ventana de contexto de 16 384 tokens, según el nombre del archivo fuente original.

La relevancia de esta ficha radica en que se trata de una versión cuantizada lista para su uso con `llama.cpp`, lo que permite ejecutar el modelo en hardware de consumo con requisitos de memoria reducidos. El repositorio incluye múltiples niveles de cuantización (Q3, Q4, Q5, etc.) con mapas de tensores personalizados para optimizar la calidad en formatos específicos, y la licencia Apache 2.0 permite su uso comercial sin restricciones. Aunque el modelo aún no ha acumulado descargas ni valoraciones, su publicación reciente (agosto de 2026) y su integración con el ecosistema GGUF lo convierten en una opción interesante para desarrolladores que buscan desplegar modelos de lenguaje localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (híbrida RNN + atención lineal) |
| Parametros totales | 13 270 822 912 (13,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 384 tokens (según nombre del archivo fuente) |
| Tipos de cuantizacion | GGUF: Q3_K_L, Q3_K_M, Q3_K_S, Q4_K_M, Q5_K_M, Q5_K_S (y posiblemente otros; no se listan todos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con shards para archivos grandes) |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura que fusiona las ventajas de las redes recurrentes (eficiencia en inferencia) con la atención lineal de los transformers. El modelo base `BlinkDL/rwkv7-g1` fue entrenado por el equipo de BlinkDL, aunque los detalles específicos del entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no se han proporcionado en la información disponible. La cuantización GGUF se realizó utilizando el dataset de calibración `lemon07r/bartowski-imatrix-v5-semantic` con un contexto de imatrix de 512 tokens, y se emplearon mapas de tensores personalizados para las cuantizaciones Q3_K_L/M/S, Q4_K_M y Q5_K_M/S, lo que sugiere un esfuerzo por preservar la calidad en formatos de baja precisión.

El repositorio incluye el archivo maestro en BF16 y los datos de imatrix, lo que facilita la reproducibilidad y la creación de cuantizaciones adicionales. La conversión se realizó con una revisión específica del conversor RWKV (`ebfb744281c31a07aad5606ec7473f79f837e92a`) y una revisión de `llama.cpp` (`c92e806d1c81091c9035edce99c35374da1b465e`), lo que garantiza compatibilidad con las últimas versiones de la librería.

## Capacidades

- Generación de texto autorregresiva: al ser un modelo de lenguaje basado en RWKV-7, es capaz de generar texto coherente y contextualizado en tareas de completado, redacción y diálogo.
- Razonamiento y comprensión del lenguaje: aunque no se especifican benchmarks, la arquitectura RWKV-7 está diseñada para manejar tareas de razonamiento complejas, similares a las de los transformers.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; se desconoce el conjunto de idiomas entrenados.
- Capacidades especiales: al ser un modelo cuantizado en GGUF, es compatible con `llama.cpp` y sus derivados (Ollama, etc.), lo que permite su ejecución en CPU y GPU con bajo consumo de memoria. No se mencionan capacidades de visión o audio.

## Casos de uso

- Despliegue local de un asistente conversacional: gracias a su tamaño de 13,3 B y a las cuantizaciones GGUF, el modelo puede ejecutarse en una GPU consumer con 8-10 GB de VRAM (en Q4_K_M), permitiendo construir chatbots privados sin depender de servicios en la nube.
- Generación de contenido creativo: el modelo puede utilizarse para redactar artículos, guiones o correos electrónicos, aprovechando su capacidad de generar texto fluido en tareas de escritura.
- Análisis de documentos largos: con una ventana de contexto de 16 384 tokens, es adecuado para resumir o extraer información de documentos extensos, como informes técnicos o artículos de investigación.
- Educación y tutoría: puede integrarse en aplicaciones educativas para responder preguntas, explicar conceptos o generar ejercicios personalizados, siempre que se valide la precisión de las respuestas.
- Investigación en PLN: al ser un modelo de arquitectura alternativa (RWKV), resulta útil para estudiar el comportamiento de modelos recurrentes con atención lineal en comparación con transformers clásicos.
- Prototipado rápido de aplicaciones de texto: al estar disponible en formato GGUF, se puede integrar fácilmente en pipelines con `llama.cpp` o `Ollama` para crear demos o productos mínimos viables sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo o su base `BlinkDL/rwkv7-g1`.

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantización Q4_K_M (aproximadamente 6,6 GB de pesos), se recomienda al menos 8-10 GB de VRAM para dejar margen para los estados de la atención y el contexto. Para Q3_K_M, la VRAM necesaria se reduce a unos 5-6 GB.
- GPU recomendadas: RTX 3060 (12 GB) o superior, RTX 3090, RTX 4090, o GPUs de datacenter como A10G o A100 (para velocidades mayores). También puede ejecutarse en CPU con suficiente RAM (16-32 GB) usando `llama.cpp`.
- Compatibilidad con GPU consumer: sí, las cuantizaciones Q3 y Q4 caben en GPUs con 8 GB o más de VRAM, como la RTX 3070 o la RTX 4060 Ti.
- Opciones de despliegue: `llama.cpp` (oficial), `Ollama`, `llama-cpp-python` para Python, y cualquier framework que soporte GGUF (por ejemplo, `text-generation-webui`). No se menciona soporte para vLLM o TGI.
- Latencia y throughput: no disponibles; dependerán del hardware, la cuantización y la longitud del contexto. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generación de 50-80 tokens por segundo, pero estos valores son estimaciones y no datos oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa específica para este modelo. Como referencia, se puede comparar con otros modelos de ~13 B de parámetros, como Llama 3.1 8B o Mistral 7B, pero no hay datos de rendimiento publicados para `rwkv7-g1i-13.3B-i1-GGUF`. La principal diferencia es la arquitectura: RWKV-7 es recurrente y lineal en atención, lo que ofrece menor consumo de memoria en inferencia en comparación con transformers densos del mismo tamaño, a costa de una madurez ecosistémica menor (menos herramientas y bibliotecas especializadas). La licencia Apache 2.0 es más permisiva que la de muchos modelos comerciales.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos no especificados, puede reflejar sesgos presentes en los datos de entrenamiento. No se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados. Se recomienda validar las respuestas en aplicaciones críticas.
- Limitaciones de contexto: la ventana de contexto es de 16 384 tokens, suficiente para la mayoría de tareas, pero inferior a modelos más recientes con 32K o 128K.
- Limitaciones de idioma: se desconoce el soporte multilingüe; es probable que el modelo esté optimizado para inglés, aunque no se confirma.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero no se proporcionan garantías sobre el rendimiento ni responsabilidad por el uso.
- Caveat para producción: al ser una cuantización, puede haber una pérdida de precisión en comparación con el modelo original en BF16. Además, al ser un modelo reciente con cero descargas, no hay evidencia de su estabilidad en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RemySkye/rwkv7-g1i-13.3B-i1-GGUF
- Modelo base: https://huggingface.co/BlinkDL/rwkv7-g1
- Repositorio de cuantización similar (g1g): https://huggingface.co/RemySkye/rwkv7-g1g-13.3b-i1-GGUF
- GitHub de RWKV-OpenVINO: https://github.com/Log-Dog012/rwkv-openvino
- Wiki de RWKV (evaluaciones): https://wiki.rwkv.com/basic/RWKV-Evals.html
- Dataset de calibración: https://huggingface.co/datasets/lemon07r/bartowski-imatrix-v5-semantic
