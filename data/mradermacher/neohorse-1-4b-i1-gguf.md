# mradermacher/NeoHorse-1-4B-i1-GGUF

## Resumen

NeoHorse-1-4B es un modelo de lenguaje de 4.205.751.296 parámetros desarrollado por TokenRhythm y publicado bajo licencia Apache 2.0. Esta versión concreta, `mradermacher/NeoHorse-1-4B-i1-GGUF`, es una cuantización GGUF realizada por mradermacher, que incorpora una matriz de importancia (imatrix) para mejorar la calidad de los pesos cuantizados. El modelo está orientado a tareas agénticas, uso de herramientas, generación de código, razonamiento y seguimiento de instrucciones, según los metadatos publicados.

La relevancia de este modelo radica en su tamaño compacto, que permite ejecutarlo en hardware de consumo, combinado con una optimización específica para escenarios de agentes y tool calling. La disponibilidad de múltiples niveles de cuantización (desde IQ1_S hasta Q6_K) facilita su despliegue en entornos con recursos limitados, tanto en CPU como en GPU. No se ha publicado información sobre la arquitectura exacta, la longitud de contexto ni los datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El repositorio indica `library_name: transformers`, lo que sugiere que se trata de un modelo basado en la arquitectura Transformer, pero no se especifica si es denso, híbrido o si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni técnicas de alineación como RLHF o DPO.

Los metadatos del modelo base (`TokenRhythm/NeoHorse-1-4B`) incluyen las etiquetas `agentic`, `tool-use`, `coding`, `reasoning` e `instruction-following`, lo que indica que el proceso de entrenamiento o ajuste estuvo dirigido a potenciar estas capacidades. Sin embargo, no se ofrecen detalles técnicos sobre cómo se logró este comportamiento.

## Capacidades

- Generación de texto y razonamiento: el modelo puede producir respuestas coherentes y realizar tareas de razonamiento, según las etiquetas publicadas.
- Soporte de tool calling / function calling: la etiqueta `tool-use` indica que está preparado para invocar funciones o herramientas externas.
- Capacidad para agentes y razonamiento multi-paso: la etiqueta `agentic` sugiere que puede participar en flujos de trabajo autónomos con varios pasos de decisión.
- Generación de código: la etiqueta `coding` apunta a que está optimizado para tareas de programación.
- Seguimiento de instrucciones: la etiqueta `instruction-following` indica que responde bien a instrucciones explícitas.
- Idiomas: solo inglés (`language: en`).

## Casos de uso

- Asistentes de código en entornos de desarrollo: el modelo puede generar fragmentos de código, completar funciones o explicar lógica de programación, integrándose en editores o pipelines de CI/CD mediante llamadas a la API.
- Agentes autónomos para automatización de tareas: gracias al soporte de tool calling, puede interactuar con APIs externas, consultar bases de datos o ejecutar comandos, actuando como agente en flujos de trabajo automatizados.
- Soporte técnico automatizado: puede gestionar conversaciones multi-turno en inglés, resolviendo consultas de usuarios sobre productos o servicios, siempre que se le proporcionen herramientas para acceder a información actualizada.
- Análisis de logs y depuración: el modelo puede recibir fragmentos de logs o trazas de errores y razonar sobre posibles causas, gracias a su capacidad de razonamiento y comprensión de código.
- Prototipado rápido de chatbots: por su tamaño y licencia Apache 2.0, es adecuado para construir prototipos de asistentes conversacionales en entornos de investigación o desarrollo.
- Ejecución local en dispositivos de borde: con cuantizaciones de entre 1.5 y 3.6 GB, puede desplegarse en mini-PCs, portátiles o GPUs de consumo para aplicaciones que requieren privacidad de datos y baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M (2.8 GB) se recomienda al menos 4 GB de VRAM, teniendo en cuenta el overhead de la caché KV y el contexto. Las cuantizaciones más agresivas (IQ1_S, 1.5 GB) pueden ejecutarse con 2 GB de VRAM, aunque con una degradación notable de la calidad.
- GPU recomendadas: RTX 3060 8GB, RTX 4060, RTX 4070 o superiores. También puede ejecutarse en GPU de gama baja como RTX 3050 6GB con cuantizaciones ligeras.
- CPU: es viable ejecutar el modelo en CPU con llama.cpp, utilizando las cuantizaciones más pequeñas (IQ2, IQ3) y una RAM de al menos 4-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y, potencialmente, vLLM si se convierte el modelo a un formato compatible.
- Latencia y throughput: no se han publicado datos de rendimiento específicos.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, datos de entrenamiento ni evaluación de seguridad, por lo que el modelo puede presentar sesgos no documentados.
- Al ser un modelo de 4B, tiene una capacidad limitada para tareas de razonamiento complejo y puede incurrir en alucinaciones, especialmente en contextos largos o con instrucciones ambiguas.
- Solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- La longitud de contexto no está especificada; se recomienda validar el comportamiento con ventanas de contexto moderadas antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar el modelo base y sus componentes para asegurar el cumplimiento de todas las condiciones.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mradermacher/NeoHorse-1-4B-i1-GGUF
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/NeoHorse-1-4B-GGUF
