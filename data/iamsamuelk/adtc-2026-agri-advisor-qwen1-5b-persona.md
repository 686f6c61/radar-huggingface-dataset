# iamsamuelk/adtc-2026-agri-advisor-qwen1.5b-persona

## Resumen

El modelo `iamsamuelk/adtc-2026-agri-advisor-qwen1.5b-persona` es un asistente conversacional especializado en asesoramiento agrícola para pequeños agricultores de Nigeria, desarrollado en el marco del Africa Deep Tech Challenge 2026. Se trata de un ajuste fino (fine-tuning) de un modelo base de la familia Qwen de 1.500 millones de parámetros, orientado a funcionar de forma offline en ordenadores portátiles de gama media y baja, como los que predominan en el continente africano. El repositorio asociado lo describe como un asistente para cultivos, ganadería y asesoramiento de mercado.

El modelo se distribuye en formato GGUF, lo que permite su ejecución eficiente en CPU mediante herramientas como llama.cpp, y está pensado para ser desplegado en entornos con recursos limitados. Su licencia Apache 2.0 facilita su uso comercial y su integración en aplicaciones propias. Aunque la información pública es escasa, el contexto del reto y el repositorio indican que el objetivo es ofrecer una herramienta práctica y accesible para el sector agrícola africano, con capacidad de funcionar sin conexión a internet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada (presumiblemente transformer, derivada de Qwen2.5-1.5B según el nombre) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No especificados (el formato GGUF admite varias, p. ej. Q4_K_M, Q5_K_M, etc.) |
| Idiomas soportados | No disponibles (el repositorio indica uso para Nigeria, probablemente inglés y lenguas locales, pero no se confirma) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors, según el tamaño del repo y la etiqueta) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura exacta ni sobre el proceso de entrenamiento. El nombre del modelo sugiere que se parte de un modelo base Qwen de 1.500 millones de parámetros, probablemente Qwen2.5-1.5B, y se ha realizado un ajuste fino para adoptar una "persona" de asesor agrícola. El repositorio GitHub menciona que el asistente cubre cultivos, ganadería y asesoramiento de mercado, lo que indica que el fine-tuning se ha dirigido a dominios agrícolas específicos, posiblemente con datos en inglés y contextos locales nigerianos. No se han publicado detalles sobre el volumen de datos de entrenamiento, el uso de RLHF/DPO u otras técnicas de alineación. La ausencia de una model card más completa limita el análisis técnico.

## Capacidades

- Generación de texto conversacional con una persona específica de asesor agrícola.
- Asesoramiento sobre cultivos, ganadería y mercados agrícolas, orientado a pequeños agricultores.
- Funcionamiento offline, sin necesidad de conexión a internet, gracias al formato GGUF y a la posibilidad de ejecutarse en CPU.
- Compatibilidad con herramientas de inferencia local como llama.cpp y otras que soporten GGUF.
- Etiqueta "conversational" en HuggingFace, lo que indica que está optimizado para diálogos multi-turno.
- No se han documentado capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Asistencia técnica agrícola en zonas rurales sin conectividad: el modelo puede ejecutarse en un portátil de gama baja y proporcionar recomendaciones sobre siembra, plagas o fertilización sin depender de internet.
- Apoyo a extensionistas agrícolas: los agentes de campo pueden usar el modelo como referencia rápida para responder consultas de los agricultores sobre prácticas de cultivo y ganadería.
- Información de precios de mercado: el asistente puede orientar sobre precios de productos agrícolas y mejores momentos para vender, según los datos con los que haya sido entrenado.
- Formación y educación agrícola: el modelo puede actuar como tutor interactivo para enseñar técnicas agrícolas básicas a pequeños productores.
- Generación de informes y resúmenes: los agricultores o cooperativas pueden pedir al modelo que resuma información sobre condiciones climáticas o recomendaciones de cultivo.
- Despliegue en entornos con recursos limitados: gracias a su tamaño (1.500 millones de parámetros) y formato GGUF, es viable en ordenadores portátiles con 8 GB de RAM, como se muestra en el vídeo de demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo, ni comparaciones con otros sistemas agrícolas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1.500 millones de parámetros en GGUF, puede ejecutarse en CPU sin necesidad de GPU. Con cuantización Q4_K_M, el uso de RAM ronda los 1-2 GB, más overhead del runtime.
- GPU recomendadas: no necesarias; el modelo está diseñado para CPU. En caso de usar GPU, cualquier tarjeta con más de 4 GB de VRAM sería suficiente.
- Compatibilidad con hardware de consumo: sí, funciona en portátiles con 8 GB de RAM o menos, como se demuestra en el vídeo del proyecto.
- Opciones de despliegue: llama.cpp, Ollama, GPT4All o cualquier runtime compatible con GGUF. También es posible usar vLLM si se convierte a safetensors, aunque no es el objetivo principal.
- Latencia y throughput: no hay datos publicados. En CPU, se espera una generación de unos pocos tokens por segundo, dependiendo del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos. El modelo es un ajuste fino de una base Qwen 1.5B, por lo que su rendimiento general será similar al de otros modelos de ese tamaño, pero especializado en dominio agrícola. No se han publicado benchmarks comparativos. Alternativas genéricas del mismo tamaño incluyen Qwen2.5-1.5B-Instruct, Llama-3.2-1B o Gemma-2-2B, pero ninguna está especializada en agricultura africana de la misma manera.

## Limitaciones y advertencias

- Falta de documentación pública: la model card es mínima y no se detallan datos de entrenamiento, evaluación ni limitaciones específicas.
- Posibles sesgos en los datos de entrenamiento: al estar orientado a Nigeria, puede no generalizar bien a otros contextos agrícolas o regiones.
- Riesgo de alucinaciones: como todo modelo de lenguaje, puede generar información incorrecta o desactualizada sobre prácticas agrícolas, precios o regulaciones.
- Sin garantía de exactitud: no se ha verificado la calidad de las respuestas en dominio agrícola mediante evaluaciones externas.
- Contexto limitado: no se especifica la longitud de contexto, pero al ser un modelo pequeño, probablemente sea de 8.000 tokens o menos, lo que limita conversaciones muy largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe asegurarse de que los datos de entrenamiento no infrinjan derechos de terceros.
- Requiere verificación en producción: antes de usarlo como herramienta de asesoramiento real, se recomienda probar su precisión en casos reales y complementar con fuentes oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iamsamuelk/adtc-2026-agri-advisor-qwen1.5b-persona
- Repositorio GitHub del proyecto: https://github.com/iamsamuelk/adtc-2026-agriculture-advisor
- Vídeo de demostración (Offline Agriculture Advisor): https://www.youtube.com/watch?v=jPYHFnK15Q4
- Página del Africa Deep Tech Challenge 2026: https://adtc-2026.devpost.com/
