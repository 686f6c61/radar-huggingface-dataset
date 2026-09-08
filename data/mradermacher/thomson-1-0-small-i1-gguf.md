# mradermacher/Thomson-1.0-Small-i1-GGUF

## Resumen

El modelo Thomson-1.0-Small, desarrollado por Thomson Reuters, es un modelo de lenguaje multimodal con 34.660 millones de parámetros que, según la model card del autor, incluye capacidades de visión. Esta versión, publicada por el equipo de mradermacher, es una cuantización GGUF con matriz de importancia (imatrix) que permite ejecutar el modelo en hardware de consumo mediante llama.cpp o herramientas compatibles. La cuantización reduce el peso del modelo hasta menos de 13 GB en los formatos más agresivos, manteniendo un equilibrio entre calidad y requisitos de hardware.

Es relevante para investigaciones y aplicaciones que necesiten un modelo grande con soporte multimodal en entornos con recursos limitados, ya que la cuantización GGUF facilita su despliegue en GPUs de consumo o incluso en CPU. Sin embargo, la licencia restrictiva y la falta de documentación técnica del modelo base limitan su uso en producción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vision segun la model card) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, Q2_K, IQ3_XXS, IQ3_M, Q3_K_M, Q4_K_S, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | polyform-strict-1-0-0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Segun la informacion disponible, el modelo base es un modelo de vision de 34.660 millones de parametros desarrollado por Thomson Reuters. No se han publicado detalles sobre la arquitectura interna (tipo de transformer, numero de capas, dimensiones de atencion, etc.) ni sobre el proceso de entrenamiento, datos utilizados o tecnicas de alineacion. La unica innovacion tecnica destacable en esta version es la cuantizacion con matriz de importancia (imatrix) realizada por mradermacher, que asigna mas precision a los pesos mas relevantes para la tarea, mejorando la calidad de los quants de baja bit.

## Capacidades

- Generacion de texto en ingles.
- Procesamiento de imagenes (segun la model card del autor, es un modelo de vision).
- Compatibilidad con herramientas de inferencia GGUF como llama.cpp, Ollama o LM Studio.
- Soporte de cuantizacion de baja bit (hasta 2 bits) gracias a la matriz de importancia.
- Despliegue en endpoints de Hugging Face (etiqueta endpoints_compatible).
- No se dispone de informacion sobre tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede procesar documentos escaneados o capturas de pantalla, extrayendo informacion textual o generando descripciones. Su tamano de 34B permite un razonamiento complejo sobre el contenido visual.
- Asistencia en entornos offline: gracias a la cuantizacion GGUF, el modelo puede ejecutarse en una estacion de trabajo local sin conexion a internet, lo que resulta util en entornos con requisitos de privacidad.
- Prototipado de aplicaciones multimodales: la version cuantizada permite iterar rapidamente sobre ideas de productos que combinan texto e imagenes, sin necesidad de infraestructura cloud.
- Investigacion academica: el modelo puede utilizarse como linea base para estudiar el efecto de la cuantizacion en modelos de vision de gran escala.
- Despliegue en servidores con VRAM limitada: los quants de 13-21 GB hacen posible usar el modelo en GPUs de consumo como la RTX 4090 (24 GB) o incluso en CPU con suficiente RAM.
- Evaluacion de licencias restrictivas: al ser un modelo con licencia polyform-strict, puede usarse para pruebas internas o educativas donde no se requiera redistribucion comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el quant elegido, el archivo pesa entre 11.8 GB (IQ2_M) y 21.3 GB (Q4_K_M). Se recomienda al menos 2-4 GB adicionales para el contexto y overhead de la GPU.
- GPU recomendadas: para Q4_K_M (21.3 GB), se necesita una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A100 40GB). Para Q2_K (13.0 GB), puede bastar con 16 GB (RTX 4080, A100 40GB).
- Ejecucion en CPU: posible con llama.cpp y RAM suficiente (al menos el tamano del modelo mas overhead).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con adaptadores GGUF), Hugging Face Text Generation Inference.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria. Los datos de benchmarks y caracteristicas tecnicas del modelo base no estan publicados.

## Limitaciones y advertencias

- Licencia restrictiva: polyform-strict-1-0-0 impone condiciones estrictas sobre el uso, redistribucion y comercializacion. No es una licencia open source y puede limitar su uso en produccion.
- Idioma limitado: solo soporta ingles, lo que restringe su uso en aplicaciones multilingues.
- Sin documentacion tecnica: no se han publicado detalles sobre el entrenamiento, datos o arquitectura, lo que dificulta la evaluacion de sesgos y riesgos.
- Posibles alucinaciones: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en ausencia de datos de entrenamiento verificables.
- Riesgo de sobreajuste a la cuantizacion: los quants de baja bit (IQ2_M, Q2_K) pueden degradar significativamente la calidad de salida. Se recomienda usar Q4_K_M como equilibrio.
- Dependencia del autor de la cuantizacion: esta version ha sido creada por un tercero (mradermacher), por lo que no hay garantia de que los quants reflejen fielmente el comportamiento del modelo original.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/Thomson-1.0-Small-i1-GGUF
- Modelo base en Hugging Face: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Quants estaticos: https://huggingface.co/mradermacher/Thomson-1.0-Small-GGUF
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
