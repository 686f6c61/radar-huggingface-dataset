# mradermacher/Salience-27B-R5-GGUF

## Resumen

Salience-27B-R5 es un modelo de lenguaje multimodal de 27 000 millones de parámetros desarrollado por vectionlabs, diseñado para tareas de razonamiento, generación de código, uso de herramientas y comprensión de imágenes. Esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, que facilita su ejecución en entornos con recursos limitados mediante diferentes niveles de cuantización. El modelo se distribuye bajo licencia Apache 2.0 y está orientado principalmente al inglés, aunque su arquitectura multimodal le permite procesar entradas de texto e imagen.

La relevancia de este modelo radica en su combinación de capacidades avanzadas (razonamiento eficiente, agente, terminal, tool-use) con un tamaño de 27B, lo que lo sitúa en un punto intermedio entre modelos pequeños y grandes. La versión GGUF permite desplegarlo en GPUs de consumo mediante herramientas como llama.cpp u Ollama, con opciones de cuantización desde Q2_K (11 GB) hasta Q8_0 (29,1 GB). No se dispone de información detallada sobre su arquitectura interna ni sobre los datos de entrenamiento en la documentación pública consultada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer multimodal, posiblemente basado en Qwen, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyecto multimodal mmproj para vision) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo original (vectionlabs/Salience-27B-R5) en la documentación disponible. Los metadatos indican que es un modelo multimodal (vision-language) con capacidades de razonamiento y uso de herramientas, y el tag "qwen3.8" sugiere una posible relación con la familia Qwen, aunque no se confirma. Tampoco se dispone de datos sobre el proceso de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas como RLHF o DPO. La cuantización GGUF realizada por mradermacher es una conversión estática de los pesos originales, sin entrenamiento adicional, y no incluye pesos con imatrix.

## Capacidades

- Generacion de texto y razonamiento: el modelo puede resolver tareas de logica, matematicas y razonamiento multi-paso, segun los tags "reasoning" y "thinking".
- Comprension de imagenes (vision-language): incluye un proyecto multimodal (mmproj) que permite procesar entradas visuales junto con texto.
- Generacion de codigo y software engineering: los tags "code", "software-engineering" y "swe" indican que esta optimizado para tareas de programacion, incluyendo reparacion de bugs y desarrollo de software.
- Uso de herramientas (tool-use) y modo agente: soporta llamadas a funciones y flujos agente, lo que permite integrarlo en pipelines automatizados.
- Interaccion con terminal: el tag "terminal" sugiere que puede ejecutar comandos y manejar entornos de linea de comandos.
- Contexto largo: el tag "long-context" indica capacidad para manejar ventanas de contexto extensas, aunque no se especifica el valor exacto.
- Eficiencia de razonamiento: el tag "thinking-efficiency" apunta a un modo de razonamiento optimizado que reduce el coste computacional en tareas complejas.

## Casos de uso

- Asistente de desarrollo de software: el modelo puede ayudar a escribir, revisar y depurar codigo en multiples lenguajes. Su soporte para tool-use permite conectarlo a editores o entornos CI/CD para automatizar tareas como generar tests o corregir errores.
- Agente de automatizacion de terminal: gracias a su capacidad para interactuar con terminales, puede ejecutar comandos, gestionar archivos y orquestar scripts en entornos locales o remotos, siendo util para administracion de sistemas.
- Analisis de documentos con imagen: al ser multimodal, puede procesar capturas de pantalla, diagramas o graficos junto con texto, facilitando la extraccion de informacion de documentos tecnicos o informes.
- Soporte tecnico automatizado: con su razonamiento multi-paso y contexto largo, puede mantener conversaciones complejas con usuarios, resolver dudas sobre productos o guiar en procedimientos de configuracion.
- Generacion de documentacion tecnica: puede redactar manuales, guias de API o comentarios de codigo a partir de especificaciones o codigo fuente, mejorando la productividad en equipos de desarrollo.
- Investigacion y analisis de datos: su capacidad de razonamiento y procesamiento de texto largo permite resumir articulos cientificos, extraer conclusiones de datasets textuales o generar hipotesis a partir de informacion proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo ni para sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para Q4_K_M (16,9 GB) se necesitan aproximadamente 18-20 GB de VRAM; para Q5_K_M (19,6 GB) unos 22 GB; para Q8_0 (29,1 GB) unos 32 GB. Las versiones Q2_K (11 GB) pueden caber en GPUs con 12-16 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones hasta Q5_K_M; A100 o H100 para Q8_0 o mayor precision. GPUs con 16 GB (RTX 4080, 4070 Ti) pueden ejecutar Q4_K_S o inferiores.
- Compatibilidad con consumer GPU: si, las cuantizaciones Q2_K a Q5_K_M son adecuadas para GPUs de consumo con 16-24 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF (por ejemplo, llama-cpp-python).
- Latencia y throughput: no se han publicado mediciones especificas. En una RTX 4090, un modelo de 27B en Q4_K_M suele generar entre 20 y 40 tokens por segundo, aunque depende de la implementacion y el contexto.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de tamano similar (por ejemplo, Qwen 2.5 32B, Yi 34B o Llama 3.1 70B). La informacion disponible no incluye benchmarks que permitan una comparacion objetiva. Se recomienda consultar la pagina del modelo base (vectionlabs/Salience-27B-R5) para posibles actualizaciones.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado principalmente en ingles; su rendimiento en otros idiomas puede ser limitado o no estar soportado.
- Sesgos: al no disponer de detalles sobre el dataset de entrenamiento, no se pueden evaluar sesgos especificos. Como cualquier LLM, puede reflejar sesgos presentes en los datos.
- Riesgo de alucinacion: en tareas de razonamiento o generacion de codigo, puede producir respuestas incorrectas o inventar informacion, especialmente en contextos ambiguos.
- Contexto largo: aunque el tag indica soporte para contexto largo, no se especifica el limite exacto; puede degradarse con ventanas muy extensas.
- Cuantizacion: las versiones con menor precision (Q2_K, Q3_K) pueden sufrir perdida de calidad en tareas complejas. Se recomienda usar Q4_K_M o superior para uso en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero es necesario verificar que la implementacion del modelo base cumple con la misma licencia y no tiene restricciones adicionales.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/Salience-27B-R5-GGUF
- Modelo base (vectionlabs/Salience-27B-R5): https://huggingface.co/vectionlabs/Salience-27B-R5
- Cuantizacion alternativa por bartowski: https://huggingface.co/bartowski/vectionlabs_Salience-27B-R5-GGUF
- Version anterior del modelo (R4): https://huggingface.co/mradermacher/Salience-27B-R4-GGUF
