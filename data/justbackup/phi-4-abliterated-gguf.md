# Justbackup/phi-4-abliterated-GGUF

## Resumen

El modelo `Justbackup/phi-4-abliterated-GGUF` es una cuantización en formato GGUF del modelo `huihui-ai/phi-4-abliterated`, una versión "abliterated" (sin censura) del modelo Phi-4 de Microsoft. La cuantización ha sido realizada por mradermacher y publicada bajo licencia MIT. Este modelo está pensado para desarrolladores que necesitan ejecutar un LLM de 14 000 millones de parámetros en entornos locales o con recursos limitados, manteniendo capacidades de razonamiento, generación de código y conversación, pero eliminando las restricciones de contenido habituales.

El repositorio ofrece múltiples niveles de cuantización (desde Q2_K hasta Q8_0) que permiten ajustar el equilibrio entre tamaño, velocidad y calidad. Al estar basado en Phi-4, hereda su arquitectura transformer decoder-only, aunque la ficha técnica no especifica la longitud de contexto ni otros detalles del entrenamiento original. Es una opción relevante para proyectos que requieren un modelo local sin filtros de seguridad, con la advertencia de que su uso debe ser responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Phi-4, transformer decoder-only) |
| Parametros totales | 14 659 507 200 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantizacion estatica del modelo `huihui-ai/phi-4-abliterated`, que a su vez es una version "abliterated" de Phi-4, es decir, se han eliminado los mecanismos de rechazo o censura tipicos de los modelos de lenguaje comerciales. No se dispone de informacion detallada sobre el entrenamiento original de Phi-4 (datos, numero de tokens, tecnicas de alineacion) en la ficha proporcionada. La cuantizacion ha sido realizada por mradermacher, quien ha generado archivos GGUF con diferentes niveles de precision para adaptarse a distintos hardware. No se mencionan innovaciones tecnicas adicionales en esta version cuantizada.

## Capacidades

- Generacion de texto en ingles, con capacidad de conversacion y chat.
- Razonamiento matematico y logico, segun los tags del modelo (math).
- Generacion de codigo (tag code).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y multi-step reasoning: no confirmado en la informacion disponible.
- Capacidad multilingue: solo ingles (en).
- Capacidades especiales: al ser abliterated, no presenta filtros de contenido, lo que permite generar respuestas sin censura sobre temas sensibles.

## Casos de uso

- Asistente de programacion local: el modelo puede generar y depurar codigo en multiples lenguajes gracias a su entrenamiento en tareas de codigo. Al ser una cuantizacion GGUF, puede ejecutarse en una GPU consumer con 8-12 GB de VRAM usando llama.cpp o Ollama, lo que lo hace util para entornos de desarrollo sin conexion a internet.
- Chatbot sin restricciones de contenido: para proyectos de investigacion o prototipos que requieren explorar temas controvertidos sin que el modelo se niegue a responder. Es adecuado para estudios de sesgos o generacion de contenido creativo, siempre con supervisión humana.
- Automatizacion de tareas de razonamiento: gracias a sus capacidades matematicas y logicas, puede integrarse en pipelines de analisis de datos o generacion de informes, aunque se debe validar la exactitud de las respuestas.
- Generacion de documentacion tecnica: puede redactar explicaciones, tutoriales o comentarios de codigo, aprovechando su conocimiento en programacion y lenguaje natural.
- Prototipado rapido de aplicaciones de IA: al ser un modelo abierto con licencia MIT, se puede incorporar en aplicaciones comerciales sin restricciones de uso, siempre que se cumplan los terminos de la licencia.
- Educacion y aprendizaje: como modelo sin censura, puede usarse para ejemplos de generacion de texto en entornos academicos, aunque se debe advertir sobre su falta de filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: segun el tipo de cuantizacion, el archivo GGUF varia entre 5.6 GB (Q2_K) y 15.7 GB (Q8_0). Para inferencia en GPU se necesita al menos 2-3 GB adicionales de overhead, por lo que las cuantizaciones Q2_K a Q4_K_M pueden ejecutarse en GPUs con 8-12 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 3080). Las cuantizaciones Q5_K y superiores requieren 12-16 GB de VRAM (RTX 3090, RTX 4090, A100).
- GPU recomendadas: para uso local, una RTX 3060 de 12 GB puede manejar Q4_K_M (9.2 GB) con margen. Para Q8_0 se recomienda una GPU con 16 GB o mas.
- Si cabe en consumer GPU: si, las cuantizaciones Q2_K a Q4_K_M caben en GPUs de gama media. Las mas grandes requieren GPUs de gama alta o uso de CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime compatible con GGUF. Tambien se puede usar con vLLM si se convierte a otro formato, pero no es el objetivo de este repo.
- Latencia y throughput: no disponible en la informacion, pero en general las cuantizaciones mas bajas ofrecen mayor velocidad a costa de calidad.

## Comparativa con modelos similares

No se dispone de datos comparativos formales en la informacion proporcionada. Sin embargo, se puede comparar cualitativamente con el modelo original Phi-4 (sin abliterar) y con otras versiones cuantizadas de modelos de 14B como Llama-3.2-14B o Qwen2.5-14B. La principal diferencia de este modelo es su naturaleza "uncensored" y su formato GGUF listo para uso local. No se proporcionan metricas de rendimiento para establecer una comparacion numerica.

## Limitaciones y advertencias

- Al ser una version abliterated, el modelo no tiene filtros de seguridad ni de contenido. Puede generar respuestas ofensivas, sesgadas o peligrosas. No es apto para uso en produccion sin una capa de moderacion externa.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos o datos. Se recomienda verificar las respuestas en aplicaciones criticas.
- Limitaciones de idioma: solo soporta ingles. No se ha probado en otros idiomas.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero Phi-4 soporta hasta 128k tokens segun la documentacion oficial de Microsoft. Esta version cuantizada podria reducir la ventana efectiva dependiendo de la implementacion.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero se debe mantener el aviso de copyright. No hay restricciones adicionales.
- Caveat para produccion: la cuantizacion puede degradar la calidad del modelo, especialmente en tareas de razonamiento complejo. Se recomienda usar Q5_K_M o superior para tareas exigentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Justbackup/phi-4-abliterated-GGUF
- Repositorio con los archivos GGUF (mradermacher): https://huggingface.co/mradermacher/phi-4-abliterated-GGUF
- Modelo base (huihui-ai/phi-4-abliterated): https://huggingface.co/huihui-ai/phi-4-abliterated
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
