# a-gordo/Qwen3.8-27B-oQ8e-mtp

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso y multimodal (visión-lenguaje) desarrollado por el equipo Qwen de Alibaba, liberado en agosto de 2026. Con 27 mil millones de parámetros, está diseñado para ejecutarse en hardware local de gama alta, destacando en tareas de codificación, flujos de trabajo agénticos y automatización de oficina. Su ventana de contexto nativa de 262.000 tokens lo hace adecuado para procesar documentos extensos y conversaciones de largo recorrido.

La versión `a-gordo/Qwen3.8-27B-oQ8e-mtp` es una cuantización de precisión mixta de 8 bits (grupo de 64) realizada con la herramienta oMLX v0.6.1, que reduce el tamaño del modelo a aproximadamente 30 GB y lo optimiza para ejecución en Apple Silicon mediante la librería MLX. Esta cuantización mantiene la arquitectura original del modelo, incluyendo su capacidad multimodal y su razonamiento configurable, aunque con una ligera pérdida de precisión inherente a la reducción de bits.

La relevancia de este modelo radica en su equilibrio entre capacidad y requisitos de hardware: permite ejecutar un modelo de 27B con contexto muy largo en estaciones de trabajo con 32-40 GB de memoria unificada, algo poco común en modelos de su tamaño. Además, su orientación a tareas de agente y codificación lo convierte en una opción práctica para desarrolladores que buscan alternativas locales a servicios en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language), tipo qwen3_5 |
| Parametros totales | 27B (modelo original) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens |
| Tipos de cuantizacion | 8 bits (oQ8e), group size 64 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors (cuantización oQ) |

Nota: los archivos safetensors del repositorio cuantizado contienen 8.184.279.792 parámetros cuantizados, pero el modelo original tiene 27B parámetros. La diferencia se debe a la agrupación de pesos en la cuantización.

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura transformer densa, sin mezcla de expertos (MoE), lo que facilita su despliegue en hardware local. Es un modelo multimodal que procesa texto e imágenes, con un mecanismo de razonamiento configurable que permite alternar entre modos de razonamiento rápido y profundo según la tarea. La ventana de contexto de 262K tokens se logra mediante técnicas de atención eficiente, aunque los detalles técnicos exactos (tipo de atención, posicional, etc.) no se han publicado en la documentación disponible.

No se dispone de información pública sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO. La documentación oficial solo menciona que el modelo está orientado a codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte. La cuantización oQ8e aplicada en esta versión utiliza precisión mixta: mantiene capas críticas en mayor precisión y cuantiza el resto a 8 bits con grupo de 64, lo que reduce el tamaño sin degradar excesivamente el rendimiento.

## Capacidades

- Generación de texto y razonamiento complejo en múltiples dominios, con modo de razonamiento configurable (rápido o profundo).
- Comprensión de imágenes y documentos visuales, permitiendo tareas de visión-lenguaje como descripción de imágenes, extracción de información y análisis de capturas.
- Generación de código en múltiples lenguajes de programación, con soporte para depuración, refactorización y explicación de código.
- Ejecución de flujos de trabajo agénticos: puede planificar y ejecutar secuencias de acciones de forma autónoma, lo que implica soporte para tool calling y llamadas a funciones externas.
- Manejo de contexto muy largo (262K tokens), adecuado para procesar documentos extensos, libros o conversaciones de larga duración sin perder información relevante.
- Automatización de tareas de oficina, como redacción de informes, resumen de reuniones, generación de presentaciones y procesamiento de formularios.
- Capacidades multilingües, aunque los idiomas específicos soportados no están documentados en las fuentes consultadas.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en un IDE o CLI para autocompletar código, revisar pull requests y sugerir correcciones. Su contexto de 262K tokens permite analizar repositorios completos o archivos de gran tamaño sin truncar la información.
- Automatización de oficina con visión: combinando su capacidad de leer imágenes y texto, puede procesar facturas, contratos o formularios escaneados, extrayendo campos clave y generando resúmenes estructurados para su integración en sistemas de gestión documental.
- Agente autónomo de investigación: con soporte para tool calling, puede consultar bases de datos, realizar búsquedas web y recopilar información de múltiples fuentes, produciendo informes sintetizados con citas.
- Análisis de documentos legales: su ventana de contexto larga permite leer contratos extensos (por ejemplo, 500 páginas) y responder preguntas específicas sobre cláusulas, riesgos o obligaciones, ahorrando horas de revisión manual.
- Generación de contenido técnico: puede redactar documentación técnica, tutoriales o entradas de blog a partir de especificaciones o código fuente, manteniendo un tono consistente y preciso.
- Chatbot de soporte técnico: con contexto amplio y razonamiento configurable, puede atender consultas de clientes en múltiples turnos, recordando detalles de interacciones anteriores y derivando problemas complejos a humanos cuando es necesario.
- Análisis de imágenes médicas o técnicas: aunque no está especializado en diagnóstico, puede describir hallazgos visibles en radiografías o diagramas técnicos, ayudando a profesionales a redactar informes preliminares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única referencia encontrada es un informe de un problema de colapso de contexto a 16K tokens en la versión cuantizada, investigado en el gist de oMLX issue #2689, pero sin cifras de rendimiento comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30 GB para el modelo en 8 bits, más overhead de activaciones y cache de contexto. Se recomiendan al menos 32-40 GB de memoria unificada o VRAM.
- GPU recomendadas: Apple Silicon con 64 GB o más (M3 Max, M4 Max, etc.) para ejecutar con MLX de forma fluida. En hardware AMD, se ha demostrado funcionamiento en Ryzen AI Max y Radeon GPUs con 32 GB o más (según el blog de AMD). En GPUs NVIDIA, se requeriría una conversión a otro formato (por ejemplo, GGUF) y al menos 40 GB de VRAM (A6000, RTX 6000 Ada, A100 40GB).
- En consumer GPU: no es viable en 8 bits en tarjetas de 24 GB (RTX 4090) sin cuantización adicional a 4 bits, lo que degradaría la calidad.
- Opciones de despliegue: la librería MLX es el formato nativo, recomendado para Apple Silicon. También se puede ejecutar con oMLX (herramienta de cuantización y ejecución). Para otros entornos, es necesario convertir los pesos a GGUF (llama.cpp, Ollama) o a safetensors estándar para usar con vLLM o TGI, aunque se perdería la optimización MLX.
- Latencia y throughput: no se han publicado mediciones oficiales. En una M3 Max con 128 GB, la inferencia en 8 bits debería alcanzar varios tokens por segundo para generación, pero los valores exactos dependen de la longitud de contexto y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (este) | 27B | 262K | No disponible | Open weights, cuantización MLX |
| Qwen2.5-32B | 32B | 128K | Apache 2.0 | Open weights, múltiples formatos |
| Gemma 2 27B | 27B | 8K | Gemma license | Open weights, múltiples formatos |

La comparativa se basa en especificaciones públicas. Qwen3.8-27B supera a ambos en contexto (262K frente a 128K y 8K), y es multimodal, mientras que Qwen2.5-32B y Gemma 2 27B son solo texto. Sin embargo, la licencia del modelo original no está clara, lo que puede limitar su uso comercial. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- La licencia del modelo original no está publicada en las fuentes consultadas, por lo que el uso comercial puede ser riesgoso sin confirmación legal.
- La cuantización a 8 bits puede introducir una ligera degradación en tareas de razonamiento complejo o generación de código de alta precisión, aunque en general es aceptable.
- Se ha reportado un problema de colapso de contexto a 16K tokens en esta versión cuantizada (según el gist de oMLX issue #2689), lo que sugiere que la ventana de 262K puede no ser completamente fiable en todos los escenarios.
- Al ser un modelo multimodal, puede generar descripciones inexactas de imágenes o alucinar detalles visuales, especialmente en imágenes poco comunes o de baja calidad.
- No se dispone de información sobre sesgos o comportamientos específicos del modelo. Como todo LLM, puede reflejar sesgos presentes en sus datos de entrenamiento y producir contenido ofensivo o incorrecto.
- El formato MLX limita el despliegue a ecosistemas Apple o herramientas compatibles; para otros entornos se requiere conversión, lo que añade complejidad.
- La documentación sobre idiomas soportados es inexistente, por lo que el rendimiento en idiomas distintos del inglés y chino no está garantizado.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/a-gordo/Qwen3.8-27B-oQ8e-mtp)
- [Repositorio oficial de Qwen3.8-27B en GitHub](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Guía completa de Qwen3.8-27B (blog)](https://lovableapp.org/blog/qwen3-8-27b)
- [Blog de AMD sobre ejecución en Ryzen AI Max y Radeon](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Gist de benchmarks y resultados de oMLX issue #2689](https://gist.github.com/taozhiyuai/bcba38be6a6bc2404379a241c06e7b59)
- [Herramienta oMLX utilizada para la cuantización](https://github.com/jundot/omlx)
