# 0xSero/deepseek-v4-flash-0731-spark

## Resumen

`0xSero/deepseek-v4-flash-0731-spark` es una versión podada y cuantizada del modelo base `deepseek-ai/DeepSeek-V4-Flash-0731`, preparada específicamente para ejecutarse en un único NVIDIA DGX Spark (GPU GB10/SM121 con 128 GB de memoria unificada). El autor, 0xSero, aplica poda con REAP (pruning) y cuantización a 3,0 bpw en formato EXL3/Trellis, reduciendo el modelo a 60,3 mil millones de parámetros y empaquetándolo para un despliegue reproducible mediante Docker y el runtime SparkInfer.

La relevancia de este build radica en que permite servir un modelo MoE de gran tamaño con ventana de contexto de 262.144 tokens en un solo equipo de escritorio de gama alta, sin necesidad de un clúster multi-GPU. El paquete incluye un runtime validado con gráficos CUDA FULL/PIECEWISE, un draft especulativo K64 y una caché MLA en formato NVFP4, alcanzando una decodificación medida de 34-39 tokens por segundo y un prefill frío de aproximadamente 1.055 tokens por segundo.

El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones. Está pensado para desarrolladores e investigadores que necesitan un modelo de razonamiento y código de gran capacidad en un entorno local con privacidad total, aunque su dependencia del hardware DGX Spark limita su portabilidad a otras plataformas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atención latente multi-cabeza (MLA); versión podada con REAP y cuantizada EXL3/Trellis |
| Parametros totales | 60.313.735.430 (60,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en este build) |
| Tipos de cuantizacion | 3,0 bpw (EXL3/Trellis) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3/Trellis) |

## Arquitectura y entrenamiento

El modelo es un refinamiento del checkpoint `DeepSeek-V4-Flash-0731`, un modelo de texto con arquitectura MoE que emplea atención latente multi-cabeza (MLA) y sparse attention comprimida, según las fuentes del proyecto original. Este build concreto aplica poda estructural con REAP para eliminar parámetros redundantes, preservando los 216 expertos objetivo y todos los tensores EXL3/Trellis necesarios. Posteriormente se cuantiza a 3,0 bpw y se organiza en rank slices TP4 que se fusionan de forma lossless a TP1 durante el primer arranque.

No se han publicado datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible. El proceso de poda y cuantización tampoco incluye detalles sobre fine-tuning posterior o calibración con datasets específicos. El runtime asociado incorpora un draft especulativo K64 de 3,0 GB, una caché MLA con registros NVFP4 de 432 bytes y gráficos CUDA capturados en modo FULL/PIECEWISE para optimizar la inferencia en el hardware objetivo.

## Capacidades

- Generación de texto y razonamiento multi-paso, con opción de modo thinking activable por llamada mediante la opción de chat-template del modelo.
- Generación de código y resolución de problemas de programación, validado con ejemplos como la implementación de funciones Python correctas.
- Salida estructurada estricta con esquema JSON, verificada en las pruebas de aceptación del runtime.
- Manejo de contexto largo de hasta 262.144 tokens, con recuperación de hechos verificada en posiciones inicial, media y final de documentos de hasta 20.000 caracteres.
- API compatible con OpenAI para integración estándar con herramientas y clientes existentes.
- Capacidad multilingüe no documentada en la información disponible; se recomienda validar según el caso de uso.

## Casos de uso

- Desarrollo de código en entornos locales con privacidad: el modelo puede generar, revisar y refactorizar código sin enviar datos a la nube, adecuado para empresas con requisitos de confidencialidad. Su rendimiento de decodificación de 34-39 tok/s permite iteraciones ágiles en un equipo dedicado.
- Análisis de documentación técnica extensa: con 262.144 tokens de contexto, puede procesar manuales, especificaciones o bases de código completas en una sola pasada, respondiendo preguntas sobre cualquier sección del documento.
- Asistente de razonamiento científico o matemático: el modo thinking opcional permite desglosar problemas complejos en pasos intermedios, útil para investigación y resolución de ecuaciones o demostraciones.
- Extracción de datos estructurados: la validación de salida JSON-schema permite transformar documentos no estructurados en registros normalizados para bases de datos o pipelines de datos.
- Prototipado de agentes autónomos: la API OpenAI-compatible y el contexto largo facilitan la construcción de agentes que mantienen historial de conversación extenso y ejecutan tareas multi-paso con herramientas externas.
- Servicio de inferencia local para equipos de desarrollo: al desplegarse como servidor en el DGX Spark, puede servir a varios desarrolladores dentro de una red local para tareas de programación asistida, documentación o pruebas de concepto.
- Investigación en eficiencia de modelos: al ser un caso documentado de poda REAP y cuantización 3-bit, sirve como referencia para estudiar el impacto de estas técnicas en modelos MoE de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas de rendimiento de inferencia medidas en el runtime validado sobre un DGX Spark físico, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Decodificacion C1 (codigo, 5 pruebas de 512 tokens) - minimo | 34,30 tok/s |
| Decodificacion C1 - mediana | 38,12 tok/s |
| Decodificacion C1 - media | 39,49 tok/s |
| Prefill frio (252.047 tokens, sin caché) | 1.055,45 prompt tok/s |

Nota: la métrica de prefill se obtuvo en una ejecución anterior a la imagen final publicada y se considera evidencia candidata. El autor indica que el objetivo de mantenerse por encima de 35 tok/s de forma sostenida sigue siendo una meta de optimización abierta.

## Requisitos de hardware

- Hardware objetivo: un NVIDIA DGX Spark con GPU GB10/SM121 y 128 GB de memoria unificada.
- Sistema operativo: Linux ARM64 con controladores NVIDIA actuales.
- Software: Docker Engine, Docker Compose v2 y NVIDIA Container Toolkit.
- Almacenamiento: al menos 250 GB de espacio libre; se recomienda 300 GB para la imagen, el checkpoint TP4 descargado, el checkpoint TP1 fusionado, el draft especulativo y las cachés.
- No es compatible con GPUs de consumo convencionales (RTX, etc.) ni con servidores x86 estándar; el runtime está diseñado exclusivamente para la arquitectura ARM64 del DGX Spark.
- Despliegue: mediante Docker Compose con una imagen pública pinneada (`ghcr.io/0xsero/deepseek-v4-flash-0731-spark-sparkinfer`) y una revisión de modelo fija; el primer arranque realiza descarga, fusión TP4 a TP1, verificación de checksums, construcción del draft y captura de gráficos CUDA.
- Latencia y throughput: decodificación de 34-39 tok/s y prefill de ~1.055 tok/s en el hardware validado.

## Comparativa con modelos similares

La comparación directa se establece con el modelo base sin podar ni cuantizar, ya que no se dispone de datos de rendimiento de otras alternativas en el mismo hardware:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware requerido |
|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4-Flash-0731 | no disponible | hasta 1M (segun fuentes externas) | FP8/FP16 (original) | MIT | multi-GPU o DGX con memoria amplia |
| 0xSero/deepseek-v4-flash-0731-spark | 60,3B | 262.144 tokens | 3,0 bpw EXL3/Trellis | MIT | un DGX Spark (128 GB) |

Otras alternativas como Qwen2.5-MoE o DeepSeek-V3 no se incluyen por falta de datos comparativos fiables en la información disponible. La principal ventaja de este build es su empaquetado completo para un solo DGX Spark, con runtime validado y métricas de rendimiento publicadas.

## Limitaciones y advertencias

- Hardware exclusivo: el modelo solo se ejecuta correctamente en un DGX Spark con la imagen Docker pinneada; no funciona con vLLM estándar, ExLlamaV3 sin parches ni comandos de tensor-parallelism convencionales.
- Cuantización agresiva: al ser 3,0 bpw, puede presentar pérdida de calidad frente al modelo original en tareas de precisión, especialmente en razonamiento complejo o matemáticas avanzadas.
- Modo thinking deshabilitado por defecto: el perfil rápido medido no incluye razonamiento extendido; activarlo por llamada puede aumentar la latencia y el consumo de memoria.
- Contexto limitado en este build: aunque el modelo base podría soportar hasta 1M de tokens según fuentes externas, esta versión está configurada con un máximo de 262.144 tokens.
- Sin datos de sesgos ni alucinación: no se han publicado evaluaciones de sesgo, toxicidad o tasas de alucinación; se recomienda validar en dominios sensibles.
- Requisitos de almacenamiento elevados: el primer arranque necesita entre 250 y 300 GB de disco, y la descarga del checkpoint TP4 es de aproximadamente 107 GB.
- Dependencia de un runtime específico: el uso fuera del ecosistema SparkInfer documentado no está soportado y puede provocar cargas incorrectas del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xSero/deepseek-v4-flash-0731-spark
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio del runtime SparkInfer: https://github.com/0xSero/deepseek-v4-flash-0731-spark-sparkinfer
- Documentación de validación del runtime: https://github.com/0xSero/deepseek-v4-flash-0731-spark-sparkinfer/blob/main/VALIDATION.md
- Resultados de validación: https://github.com/0xSero/deepseek-v4-flash-0731-spark-sparkinfer/tree/main/results
- Releases del proyecto DeepSeek V4 Flash: https://github.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731/releases
- Documentación del proyecto DeepSeek V4 Flash en DeepWiki: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
