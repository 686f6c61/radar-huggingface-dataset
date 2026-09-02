# miifanboy/Spark-X2.5-4B-i1-GGUF

## Resumen

Spark-X2.5-4B es un modelo de lenguaje compacto de propósito general desarrollado por XHToken, diseñado para tareas cotidianas como conversación, escritura, traducción, razonamiento, generación de código, uso de herramientas y flujos de agente. Con 4.112 millones de parámetros, emplea una arquitectura de atención híbrida que le permite manejar una longitud de contexto nativa de hasta 1 millón de tokens, algo inusual en modelos de este tamaño. El modelo base cubre más de 200 idiomas, aunque el repositorio cuantizado declara soporte explícito para inglés y chino.

La versión aquí descrita, `miifanboy/Spark-X2.5-4B-i1-GGUF`, ofrece variantes cuantizadas mediante la metodología imatrix (matriz de importancia), que preserva la calidad del modelo original a la vez que reduce significativamente el tamaño para despliegue local. Está disponible en formatos GGUF compatibles con llama.cpp, Ollama y LM Studio, lo que facilita su ejecución en hardware de consumo. El modelo base se distribuye bajo licencia Apache 2.0, permitiendo uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su equilibrio entre tamaño reducido, capacidad de contexto extremadamente largo y rendimiento competitivo en tareas de razonamiento y agente, lo que lo convierte en una opción atractiva para aplicaciones de producción en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Atencion hibrida (detalles especificos no disponibles) |
| Parametros totales | 4.112.079.360 (4,1 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 1.000.000 tokens (nativo) |
| Tipos de cuantizacion | IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, IQ4_XS, Q4_K_S, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles, chino (declarado); el modelo base cubre mas de 200 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura de Spark-X2.5-4B se describe como "atención hibrida", aunque los detalles técnicos completos (mezcla de mecanismos de atención, tipos de capas, etc.) no se han publicado en la documentación disponible. Esta arquitectura está optimizada para manejar secuencias muy largas (hasta 1M de tokens) manteniendo un coste computacional razonable, probablemente combinando atención completa en capas inferiores con mecanismos de atención lineal o dispersa en capas superiores, aunque esto es una inferencia razonable y no un dato confirmado.

No se han publicado detalles sobre el proceso de entrenamiento, como el número de tokens, la composición del dataset o el uso de técnicas de alineación (RLHF, DPO, etc.). El modelo se presenta como de propósito general, con capacidades que sugieren un entrenamiento diverso en tareas de lenguaje, código y razonamiento. Las variantes GGUF se han cuantizado utilizando el método imatrix con el dataset de calibración `lemon07r/bartowski-imatrix-v5-semantic`, que se dividió en un 70% para calibración y un 30% para evaluación de divergencia KL.

## Capacidades

- Generacion de texto fluido en conversacion, escritura creativa y traduccion.
- Razonamiento logico y matematico basico, adecuado para tareas cotidianas.
- Generacion de codigo en multiples lenguajes de programacion, con soporte para depuracion y explicacion.
- Uso de herramientas (tool calling) y ejecucion de flujos de agente multi-paso.
- Contexto extremadamente largo (hasta 1M tokens), util para analisis de documentos extensos o conversaciones prolongadas.
- Soporte multilingue amplio (mas de 200 idiomas en el modelo base), aunque las variantes GGUF declaran soporte principal para ingles y chino.
- Capacidad de seguir instrucciones complejas y mantener coherencia en tareas de larga duracion.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de contexto de hasta 1M tokens, manteniendo el contexto de interacciones anteriores sin truncamiento.
- Analisis de documentos legales o academicos: su contexto largo permite procesar contratos, articulos cientificos o informes completos de una sola vez, extrayendo informacion relevante y generando resumenes precisos.
- Asistente de programacion integrado en IDE: soporta tool calling y puede conectarse a APIs de repositorios, ejecutar comandos y sugerir correcciones en tiempo real durante el desarrollo.
- Traduccion automatica de alta calidad: cubre mas de 200 idiomas, lo que lo hace util para localizacion de contenido web o aplicaciones en entornos multilingue.
- Agente de automatizacion de tareas: puede orquestar multiples pasos (busqueda web, calculo, generacion de informes) mediante llamadas a funciones, ideal para workflows de RPA.
- Chatbot educativo: su capacidad de razonamiento y explicacion permite responder preguntas de estudiantes con ejemplos detallados, adaptandose a distintos niveles de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para este modelo. El repositorio de cuantizacion incluye metricas de divergencia KL (KLD) y perplejidad para cada variante cuantizada, que miden la fidelidad respecto al modelo original, pero no son comparables con benchmarks de capacidades. La tabla siguiente resume los resultados de KLD del propio repositorio, como referencia de calidad de cuantizacion:

| Cuantizacion | Mean PPL(Q) | Mean KLD | Same Top-1 % |
|---|---|---|---|
| IQ3_XXS | 9,585 | 0,380 | 76,1 |
| Q3_K_S | 11,330 | 0,451 | 74,6 |
| IQ3_M | 9,261 | 0,242 | 81,0 |
| Q3_K_M | 9,383 | 0,214 | 82,2 |
| IQ4_XS | 8,844 | 0,117 | 86,9 |
| Q4_K_S | 8,825 | 0,109 | 87,5 |
| IQ4_NL | 8,922 | 0,109 | 87,1 |
| Q4_K_M | 8,723 | 0,096 | 88,2 |
| Q5_K_S | 8,736 | 0,039 | 92,5 |
| Q5_K_M | 8,731 | 0,031 | 93,1 |
| Q6_K | 8,624 | 0,013 | 95,9 |
| Q8_0 | 8,620 | 0,003 | 98,1 |

Estos datos indican que las cuantizaciones Q5_K_S y superiores mantienen una fidelidad muy alta respecto al modelo base, mientras que las variantes Q3 pueden degradar significativamente la calidad en tareas que requieren precision.

## Requisitos de hardware

- VRAM estimada para inferencia: cada cuantizacion tiene un tamaño de archivo que oscila entre 1,68 GB (IQ3_XXS) y 4,07 GB (Q8_0). Para inferencia con contexto largo, se debe considerar VRAM adicional para la cache KV. Con cuantizaciones Q4_K_M (2,42 GB) o Q5_K_S (2,68 GB), se puede ejecutar en GPUs con 6-8 GB de VRAM para contextos de hasta 32k tokens.
- GPUs recomendadas: RTX 3060/4060 (8 GB) para cuantizaciones Q4-Q5 con contexto moderado; RTX 4090 o A100 para contextos superiores a 100k tokens con cuantizaciones Q6 o Q8.
- En CPU: las cuantizaciones Q (Q4_K_M, Q5_K_S) son preferibles a las IQ por su mayor velocidad; con 16 GB de RAM puede ejecutarse en modo CPU con contexto reducido.
- Opciones de despliegue: compatible con llama.cpp (incluida la version de XHToken), Ollama, LM Studio y servidores compatibles con la API de OpenAI mediante adaptadores como llama-cpp-python o vLLM (si se convierte a otro formato).
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU de gama media (RTX 4060), se puede esperar una velocidad de generacion de 20-40 tokens/s con Q4_K_M, dependiendo de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamaño similar (como Qwen2.5-4B, Llama-3.2-3B o Gemma-2-2B) en la informacion proporcionada. La descripcion del fabricante menciona resultados "lideres entre modelos abiertos" en tareas de razonamiento y agente, pero no se incluyen cifras concretas. Se recomienda consultar el repositorio oficial del modelo base para obtener benchmarks detallados.

## Limitaciones y advertencias

- Al ser un modelo de 4B parametros, puede presentar alucinaciones en tareas de razonamiento complejo o generacion de hechos poco comunes.
- Las cuantizaciones bajas (IQ3_XXS, Q3_K_S) requieren prompts de sistema muy detallados y no se recomiendan para produccion, segun el autor del repositorio.
- El contexto de 1M tokens es teorico; en la practica, la VRAM limita el contexto efectivo incluso con cuantizaciones bajas. Por ejemplo, con IQ4_XS y 12 GB de VRAM se alcanzan aproximadamente 332k tokens, segun las recomendaciones del repo.
- El soporte multilingue declarado (200+ idiomas) en el modelo base no se refleja en la ficha de las variantes GGUF, que solo listan ingles y chino. Puede haber degradacion en otros idiomas.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar que el modelo base no tenga clausulas adicionales en su repositorio original.
- Las variantes IQ (IQ3, IQ4) son notablemente mas lentas en CPU que las Q, por lo que no se aconsejan para despliegue sin GPU.

## Enlaces

- Repositorio HuggingFace de las variantes GGUF: https://huggingface.co/miifanboy/Spark-X2.5-4B-i1-GGUF
- Repositorio del modelo base en GitHub: https://github.com/XHToken/Spark-X2.5
- Modelo base en HuggingFace: https://huggingface.co/XHToken/Spark-X2.5-4B
- Modelo en ModelScope: https://www.modelscope.cn/models/XHToken/Spark-X2.5-4B
- Pagina en Ollama: https://ollama.com/SparkLLM/Spark-X2.5-4B
- Dataset de calibracion imatrix: https://huggingface.co/datasets/lemon07r/bartowski-imatrix-v5-semantic
