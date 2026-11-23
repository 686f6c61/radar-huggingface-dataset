# mradermacher/jairo-ai-1.0-flash-GGUF

## Resumen
jairo-ai-1.0-flash es un modelo de lenguaje conversacional de tipo chat/instruct con 4.022.468.096 parámetros (aproximadamente 4B), desarrollado originalmente por el usuario LouieR09112 y cuantizado a formato GGUF por mradermacher. Está pensado para tareas de conversación e instrucciones en inglés, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos.

La relevancia de esta ficha concreta reside en que se trata de la versión cuantizada del modelo original, publicada en el repositorio de mradermacher, que ofrece un abanico amplio de cuantizaciones (desde Q2_K hasta f16) para adaptarse a distintos presupuestos de memoria y hardware. Con 4B parámetros, el modelo es viable en GPUs de consumo cuando se emplean cuantizaciones de 4 bits, lo que lo convierte en candidato para despliegues locales y prototipado rápido.

No se dispone de información detallada sobre la arquitectura interna, la longitud de contexto ni los datos exactos de entrenamiento más allá de la referencia al dataset trl-lib/Capybara. Esta ficha recoge exclusivamente los datos verificables en la información proporcionada y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de tipo chat/instruct, segun tags) |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base en safetensors |

## Arquitectura y entrenamiento
No se ha publicado información detallada sobre la arquitectura interna del modelo base (LouieR09112/jairo-ai-1.0-flash) en la información disponible. Los tags indican que se trata de un modelo de tipo transformer orientado a chat e instrucciones, con 4B parámetros, pero no se especifica si emplea atención estándar, atención lineal, mezcla de expertos u otra variante. Tampoco se detalla el número de tokens de entrenamiento ni la composición completa del dataset.

El único dato de entrenamiento disponible es la referencia al dataset trl-lib/Capybara, un conjunto de datos conversacionales de instrucciones en inglés ampliamente utilizado para ajuste fino supervisado. No consta información sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación, ni sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Seguimiento de instrucciones (formato instruct/chat).
- Razonamiento básico y respuesta a preguntas generales, derivado del ajuste sobre Capybara.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language del modelo.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso
- Asistente conversacional local: con cuantizaciones Q4_K_M (2,6 GB) o Q5_K_M (3,0 GB), el modelo puede ejecutarse en GPUs de consumo y ofrecer respuestas de chat en inglés sin depender de servicios en la nube, adecuado para prototipos y demos.
- Chatbot de atención al cliente en inglés: su naturaleza instruct y su tamaño contenido permiten desplegar conversaciones multi-turno en entornos con recursos limitados, siempre que la longitud de contexto sea suficiente para el caso (dato no publicado, por lo que requiere validación previa).
- Generación de texto asistida en aplicaciones de escritorio: al distribuirse en GGUF, puede integrarse en herramientas locales mediante llama.cpp u Ollama para tareas de redacción, resumen y reescritura en inglés.
- Filtrado y clasificación de texto: el modelo puede emplearse para tareas de etiquetado o moderación básica en inglés, con la ventaja de su bajo coste de inferencia en cuantización Q4.
- Prototipado de pipelines de instrucciones: gracias a la licencia Apache 2.0, es posible experimentar y ajustar el modelo en entornos comerciales sin restricciones de licencia, usando el dataset Capybara como referencia de formato.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite medir el compromiso entre calidad y memoria en un mismo modelo para elegir la más adecuada en producción.
- Educación y experimentación: investigadores pueden usar el modelo como base para estudiar el efecto de la cuantización en modelos de 4B y en tareas de instrucción en inglés.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,0-2,5 GB para Q3_K_S/Q4_K_S, 2,6 GB para Q4_K_M, 3,0 GB para Q5_K_M, 3,4 GB para Q6_K, 4,4 GB para Q8_0 y 8,2 GB para f16 (tamaños de archivo indicados en la model card; la VRAM real requiere margen adicional para el contexto y el runtime).
- GPU recomendadas: no disponibles de forma oficial; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM puede ejecutar cuantizaciones Q4, y GPUs de 8 GB o más permiten Q8_0 o f16.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 y Q5 en tarjetas de 6-8 GB (por ejemplo, RTX 3060, RTX 4060); Q8_0 y f16 requieren 8-16 GB.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa. Como referencia estructural, se trata de un modelo de 4B parámetros en inglés con licencia Apache 2.0, comparable en categoría a otros modelos instruct de ~4B, pero sin datos de rendimiento publicados que permitan contrastarlos.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| jairo-ai-1.0-flash | 4,02B | no disponible | Apache 2.0 | GGUF / safetensors |
| Alternativas de ~4B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; al entrenarse sobre Capybara (inglés), es probable que herede sesgos del corpus, pero no hay información oficial al respecto.
- Riesgo de alucinación: no cuantificado; como modelo de 4B sin benchmarks publicados, se recomienda validación en dominios sensibles.
- Limitaciones de contexto o idioma: el modelo está declarado únicamente en inglés y no se ha publicado la longitud de contexto, lo que impide garantizar conversaciones largas o documentos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original y de los datos de entrenamiento (Capybara) antes de un despliegue en producción.
- Caveats para producción: no hay benchmarks, ni información sobre tool calling, ni sobre alineación; la calidad de las cuantizaciones bajas (Q2_K, Q3_K_S) puede degradarse notablemente y la model card recomienda Q4_K_M como opción rápida y de buena calidad.
- El repositorio tiene 631 descargas y 0 likes en el momento de la consulta, lo que indica adopción limitada y poca validación comunitaria.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/jairo-ai-1.0-flash-GGUF
- Modelo base: https://huggingface.co/LouieR09112/jairo-ai-1.0-flash
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/jairo-ai-1.0-flash-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#jairo-ai-1.0-flash-GGUF
- Dataset de referencia: https://huggingface.co/datasets/trl-lib/Capybara
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
