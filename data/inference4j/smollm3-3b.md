# inference4j/smollm3-3b

## Resumen

`inference4j/smollm3-3b` es una exportación a ONNX del modelo `HuggingFaceTB/SmolLM3-3B`, publicada por el usuario `inference4j` y preparada específicamente para ejecutar generación de texto autoregresiva en CPU. El artefacto se distribuye en el formato `onnxruntime-genai` con cuantización INT4 (RTN con bloques de 32), lo que reduce el repositorio completo a 2,0 GB y lo hace apto para equipos sin GPU dedicada.

El modelo base es un transformer de 3B parámetros de la familia SmolLM3, una línea de modelos pequeños orientados a despliegue local. Esta variante no reentrena ni modifica los pesos más allá de la cuantización: es un artefacto de inferencia. Su relevancia actual está en que permite incorporar un modelo conversacional razonablemente capaz dentro de aplicaciones Java mediante la librería inference4j, o en cualquier runtime compatible con onnxruntime-genai, sin depender de servicios en la nube ni de aceleradores hardware.

La licencia Apache-2.0 facilita el uso comercial y la redistribución. El repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha, y fue creado el 12 de octubre de 2026, por lo que se trata de una publicación muy reciente y sin adopción documentada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM3 (modelo base `HuggingFaceTB/SmolLM3-3B`); detalles finos de la arquitectura no disponibles en la información proporcionada |
| Parametros totales | 3B (la model card del artefacto indica "SmolLM3 (3B parameters)") |
| Parametros activos | No aplica (no se describe una arquitectura MoE en la información proporcionada) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | INT4 (RTN, bloques de 32) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX en formato `onnxruntime-genai`, cuantizado a INT4 |
| Tarea | Text generation / chat |
| Modelo base | HuggingFaceTB/SmolLM3-3B |
| Tamaño del repositorio | 2,0 GB |
| Librería declarada | onnx |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-12 |

## Arquitectura y entrenamiento

El artefacto no documenta su propia arquitectura más allá de la etiqueta "SmolLM3 (3B parameters)". Se trata de una conversión de pesos del modelo `HuggingFaceTB/SmolLM3-3B` al formato ONNX de onnxruntime-genai, seguida de una cuantización INT4 con redondeo al más cercano (RTN) y tamaño de bloque 32. No hay en la información proporcionada datos sobre número de tokens de entrenamiento, composición del dataset, fases de alineación (RLHF, DPO u otras) ni innovaciones técnicas del modelo base.

La innovación del artefacto es de despliegue, no de modelado: la combinación de cuantización INT4 por bloques y el runtime de onnxruntime-genai permite decodificación autoregresiva en CPU con una huella de memoria de aproximadamente 2 GB de pesos. La integración con inference4j, una librería de inferencia para Java, sugiere que el caso de uso previsto es embeber el modelo en aplicaciones JVM sin infraestructura de GPU.

## Capacidades

- Generación de texto autoregresiva y uso conversacional, según los tags `text-generation` y `conversational` del repositorio.
- Inferencia en CPU con cuantización INT4 mediante el runtime onnxruntime-genai.
- Consumo desde Java a través de la API de inference4j (`TextGenerator.builder().model(ModelSources.smolLM3_3B()).build()`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el pipeline declarado es únicamente `text-generation`.

## Casos de uso

- Asistentes conversacionales en aplicaciones Java de escritorio o de servidor: inference4j permite construir un `TextGenerator` y generar respuestas sin salir de la JVM, lo que encaja en backends corporativos que ya tienen su lógica de negocio en Java.
- Despliegue en servidores sin GPU: al ser un artefacto INT4 de 2 GB pensado para CPU, permite ofrecer generación de texto en máquinas virtuales estándar o contenedores sin acceso a aceleradores.
- Procesamiento por lotes de resúmenes y reescritura de textos: ejecución offline sobre colas de documentos, donde la latencia no es crítica y prima el coste por token nulo frente a APIs comerciales.
- Funcionalidad de texto en herramientas de escritorio y plugins de IDE: un modelo de 3B cuantizado a INT4 puede cargarse en memoria de un portátil para autocompletado, reformulación o generación de fragmentos de código sencillos sin conexión.
- Entornos con requisitos de privacidad o soberanía de datos: al ejecutarse en local, ningún texto del usuario abandona la infraestructura, lo que resulta adecuado para sectores regulados.
- Prototipado y evaluación de pipelines de IA en Java: sirve como modelo de referencia para validar integraciones con onnxruntime-genai antes de escalar a modelos mayores.
- Generación de contenido en aplicaciones educativas o de documentación técnica: respuestas conversacionales sobre material propio, siempre que la ventana de contexto del modelo base sea suficiente para el corpus de referencia.
- Pruebas de regresión y CI de sistemas de IA: el tamaño reducido del artefacto (2 GB) permite descargarlo y ejecutarlo en runners de integración continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria: los pesos cuantizados a INT4 ocupan aproximadamente 2 GB (tamaño del repositorio completo). Hay que sumar el coste de la caché KV y del propio runtime, por lo que se recomienda reservar del orden de 3 a 4 GB de RAM o VRAM para una ejecución holgada.
- CPU: el artefacto está optimizado para inferencia en CPU mediante onnxruntime-genai; no se especifican requisitos de instrucciones (AVX2, AVX-512, NEON) en la información proporcionada.
- GPU: no se documenta una ruta GPU específica para este artefacto. Por tamaño, cualquier GPU con al menos 4 GB de memoria podría alojarlo, incluidas RTX 3050, RTX 4060 o superiores; no hay datos de compatibilidad verificados.
- GPU de centro de datos: A100, H100 y similares son innecesarias para este modelo; su uso solo se justificaría por agregación de muchos procesos concurrentes, dato no disponible.
- Cabe en GPU de consumo: sí, en términos de memoria, pero la ruta de despliegue prevista es CPU.
- Opciones de despliegue: onnxruntime-genai (formato nativo del artefacto) y la librería Java inference4j. Para otras rutas (vLLM, llama.cpp, Ollama, TGI) no hay información disponible en esta ficha; esas herramientas trabajan con formatos distintos del ONNX aquí publicado.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Aspecto | inference4j/smollm3-3b | HuggingFaceTB/SmolLM3-3B (modelo base) | Alternativas de 3B en otros formatos |
|---|---|---|---|
| Parámetros | 3B | 3B | 3B (órdenes de magnitud similares) |
| Precisión | INT4 (RTN, bloque 32) | No disponible en la información proporcionada | Depende del artefacto |
| Formato | ONNX (onnxruntime-genai) | No disponible en la información proporcionada | GGUF, safetensors, entre otros |
| Licencia | Apache-2.0 | No disponible en la información proporcionada | Varía según modelo |
| Tamaño en disco | 2,0 GB | No disponible en la información proporcionada | Depende de la cuantización |
| Orientación | Inferencia en CPU desde Java (inference4j) | Modelo original de referencia | Distintas orientaciones de despliegue |
| Rendimiento comparado | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de resultados empíricos que permitan una comparación cuantitativa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- La cuantización INT4 introduce pérdida de precisión respecto a los pesos originales; no se documenta en la información proporcionada la degradación medida en tareas de generación o razonamiento.
- La ventana de contexto del artefacto no está especificada; conviene verificarla experimentalmente antes de diseñar aplicaciones que dependan de contextos largos.
- No hay información sobre idiomas soportados ni sobre calidad relativa entre ellos; no debe asumirse un rendimiento homogéneo en castellano sin evaluarlo.
- Riesgo de alucinación inherente a los modelos generativos de 3B parámetros, previsiblemente mayor que en modelos de mayor tamaño. No se han publicado evaluaciones de fidelidad para este artefacto.
- Sesgos: no se documenta ningún análisis de sesgos ni de mitigaciones aplicadas en esta exportación.
- El modelo base no incluye en esta ficha detalles de alineación, filtrado de datos ni políticas de seguridad; se desconoce si existen salvaguardas frente a contenido dañino.
- Licencia Apache-2.0: permisiva y compatible con uso comercial, pero el usuario debe verificar las condiciones aplicables al modelo base y a las dependencias del runtime (onnxruntime-genai, inference4j), cuyas licencias no se detallan aquí.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni informes independientes de funcionamiento.
- El artefacto es de solo inferencia: no admite fine-tuning ni entrenamiento adicional en este formato.
- La fecha de creación registrada (2026-10-12) indica una publicación muy reciente; puede haber cambios en los archivos sin historial público de versiones.

## Enlaces

- Ficha HuggingFace del artefacto: https://huggingface.co/inference4j/smollm3-3b
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio de onnxruntime-genai: https://github.com/microsoft/onnxruntime-genai
- Repositorio de inference4j: https://github.com/inference4j/inference4j
- Resultados de la búsqueda web: ninguno relevante. Los enlaces devueltos por la búsqueda (BBC, Radio Times, The Telegraph, Wikipedia) corresponden a páginas sobre el programa de televisión Strictly Come Dancing y no guardan relación con el modelo, por lo que no se incluyen como referencias técnicas.
