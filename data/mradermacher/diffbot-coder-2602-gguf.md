# mradermacher/Diffbot-Coder-2602-GGUF

## Resumen

Diffbot-Coder-2602-GGUF es la versión cuantizada en formato GGUF del modelo Diffbot-Coder-2602, publicada por el usuario mradermacher. El modelo original lo desarrolla Diffbot, empresa conocida por sus servicios de extracción de datos web y grafos de conocimiento, y está orientado a tareas de generación de código y conversación técnica. Esta publicación no es un modelo nuevo, sino una conversión de los pesos originales a cuantizaciones GGUF para permitir su ejecución en entornos con llama.cpp y hardware más modesto.

El modelo cuenta con aproximadamente 29.940 millones de parámetros (unos 30B), lo que lo sitúa en la gama de modelos de código de tamaño medio-grande. La información disponible no especifica la arquitectura interna, la longitud de contexto ni los datos de entrenamiento del modelo base, por lo que muchos detalles técnicos quedan como no disponibles. La model card del cuantizador es puramente operativa: lista los ficheros GGUF generados y sus tamaños, sin aportar información sobre capacidades o rendimiento.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~30B en local mediante cuantizaciones que van desde 11,1 GB (Q2_K) hasta 31,9 GB (Q8_0). Al tratarse de cuantizaciones estáticas (no imatrix), el cuantizador advierte de que las versiones ponderadas no están disponibles por el momento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, no confirmado) |
| Parametros totales | 29.943.393.920 (~30B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Diffbot-Coder-2602 en la documentación proporcionada. El recuento de parámetros (29,94B) y la etiqueta `transformers` sugieren un transformer denso, pero no se confirma si emplea atención lineal, decodificación especulativa u otras innovaciones. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica concreta procede del proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (sin imatrix) en once variantes, desde Q2_K hasta Q8_0. El autor indica explícitamente que las cuantizaciones ponderadas o con imatrix no están disponibles en el momento de la publicación, y que podrían solicitarse mediante una discusión comunitaria.

## Capacidades

- Generación de texto y código: el nombre del modelo ("Coder") indica orientación a tareas de programación, aunque no se detallan lenguajes soportados.
- Conversación multi-turno: la etiqueta `conversational` sugiere uso en diálogo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante infraestructura de inferencia estándar.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Asistencia a la programación en local: con cuantizaciones Q4_K_M (18,2 GB) el modelo puede ejecutarse en estaciones de trabajo con 24 GB de VRAM, ofreciendo autocompletado y generación de código sin depender de servicios en la nube.
- Prototipado de herramientas de desarrollo: la compatibilidad con endpoints permite integrarlo en entornos de prueba mediante servidores compatibles con la API de OpenAI para validar flujos de generación de código.
- Análisis de repositorios y documentación técnica: al ser un modelo de ~30B orientado a código, puede emplearse para resumir y explicar fragmentos de código en pipelines internos, siempre que el contexto disponible lo permita.
- Despliegue en entornos con recursos limitados: las variantes Q2_K (11,1 GB) y Q3_K_S (13,1 GB) permiten ejecutar el modelo en GPU de consumo de 16 GB o en CPU con suficiente RAM, a costa de calidad.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir la degradación de calidad entre Q2_K y Q8_0 en tareas de código sobre un mismo modelo base.
- Generación de código en inglés para equipos internacionales: dado que el modelo solo declara soporte de inglés, es adecuado para bases de código y documentación en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de fichero GGUF más overhead de contexto):
  - Q2_K: ~11,1 GB de pesos, ~12-14 GB con contexto moderado.
  - Q3_K_M: ~14,5 GB de pesos, ~16-18 GB con contexto.
  - Q4_K_M: ~18,2 GB de pesos, ~20-22 GB con contexto.
  - Q5_K_M: ~21,4 GB de pesos, ~23-25 GB con contexto.
  - Q6_K: ~24,7 GB de pesos, ~27-29 GB con contexto.
  - Q8_0: ~31,9 GB de pesos, ~34-36 GB con contexto.
- GPU recomendadas: A100 40GB o H100 para Q6_K y Q8_0; RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; RTX 3090/4080 (16-24 GB) para Q3_K_L e IQ4_XS; GPU de 16 GB o menos solo con Q2_K o Q3_K_S.
- Cabe en GPU de consumo: sí, en RTX 4090 con Q4_K_M y en GPUs de 16 GB con cuantizaciones Q2/Q3.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con GGUF; también puede servirse mediante endpoints compatibles según la etiqueta del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa de benchmarks. A nivel de tamaño, el modelo se sitúa en la franja de ~30B, comparable en parámetros a otros modelos de código de esa escala, pero sin datos verificables de contexto, licencia o calidad no se puede confirmar la comparación.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Diffbot-Coder-2602-GGUF | ~30B | no disponible | no disponible | GGUF |
| Alternativas de ~30B para código | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de usarlo en producción.
- Idiomas: solo se declara inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto desconocido: sin datos sobre la longitud de contexto, no se recomienda asumir ventanas largas en aplicaciones de análisis de repositorios.
- Cuantizaciones estáticas: el cuantizador advierte de que no hay versiones imatrix/ponderadas, lo que puede implicar mayor pérdida de calidad en cuantizaciones bajas (Q2_K, Q3_K_M marcada como "lower quality").
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación publicada que lo cuantifique.
- Sesgos: no documentados en la información disponible.
- Repositorio con pocas descargas (34) y sin likes: menor validación comunitaria que otros modelos populares.
- Fecha de creación futura (2026-02-11) en los metadatos: conviene verificar la vigencia y procedencia de la publicación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Diffbot-Coder-2602-GGUF
- Modelo base: https://huggingface.co/diffbot/Diffbot-Coder-2602
- Página de descargas del cuantizador: https://hf.tst.eu/model#Diffbot-Coder-2602-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
