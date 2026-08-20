# overads/gloofy-1-nano

## Resumen

gloofy-1-nano es un modelo de lenguaje especializado en tareas de marketing y publicidad, desarrollado por overads Inc. sobre la base de Qwen3-4B de Alibaba, con licencia Apache 2.0. El modelo está diseñado para etiquetar creatividades publicitarias contra una taxonomía cerrada, cualificar leads, redactar copy con restricciones de plataforma y diagnosticar campañas, todo ello ejecutable localmente en un portátil sin necesidad de conexión a la nube.

El modelo se distribuye en formato GGUF cuantizado (Q4_K_M) y está pensado para entornos de producción donde el coste marginal por llamada es constante y los datos publicitarios no salen de la máquina del usuario. Su relevancia radica en ofrecer una alternativa de código abierto y de bajo coste para flujos de trabajo de marketing, aunque el propio autor reconoce que no es un modelo frontera y que pierde frente a soluciones comerciales en su propio benchmark.

Con 4.022 millones de parámetros, el modelo hereda la arquitectura transformer de Qwen3-4B, aunque no se especifica la longitud de contexto en la información disponible. El repositorio incluye el archivo GGUF, un Modelfile para Ollama y documentación detallada del proceso de entrenamiento y evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (mencionado; otros no disponibles) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien se menciona un adaptador MLX, pero el repositorio contiene GGUF) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3-4B, un transformer denso de 4.000 millones de parámetros desarrollado por Alibaba. El proceso de entrenamiento está documentado en 21 tarjetas de evaluación públicas que incluyen tanto éxitos como fracasos: una meseta durante seis rondas, cuatro conclusiones retractadas tras pruebas de varianza, y una ganancia de 9,8 puntos atribuida al formato de los prompts. No se especifican los datos de entrenamiento ni el número de tokens utilizados, pero el autor indica que el modelo fue afinado para tareas de marketing y publicidad.

La cuantización a Q4_K_M reduce la precisión en 0,045 puntos en el benchmark de exactitud de facetas, concentrada en las facetas de juicio (ángulo -0,100, gancho -0,060), mientras que las facetas de extracción apenas se ven afectadas. El autor publica tanto la puntuación del adaptador MLX sin cuantizar (0,780) como la del archivo GGUF (0,735), para evitar presentar un número engañoso.

## Capacidades

- Etiquetado de creatividades publicitarias contra una taxonomía cerrada, con una exactitud de facetas de 0,735 en el archivo GGUF Q4_K_M.
- Cualificación de leads, probablemente mediante clasificación o extracción de atributos relevantes.
- Redacción de copy publicitario con restricciones de plataforma (longitud, tono, formato).
- Diagnóstico de campañas, aunque el autor advierte que en esta tarea el modelo perdió 9-1 en evaluación ciega contra el modelo base sin entrenar, por lo que no es fiable para razonamiento abierto.
- Ejecución local y offline, sin necesidad de conexión a la nube.
- Soporte de conversación (etiqueta "conversational") y compatibilidad con endpoints (endpoints_compatible).

## Casos de uso

- Automatización del etiquetado de anuncios: el modelo puede clasificar creatividades publicitarias según una taxonomía predefinida, reduciendo el trabajo manual de los equipos de marketing. Su ejecución local permite procesar grandes volúmenes sin costes por API.
- Cualificación de leads en CRM: integrado en un pipeline de ventas, el modelo puede extraer atributos de los leads y asignarles una puntuación o categoría, mejorando la priorización del equipo comercial.
- Generación de copy para plataformas publicitarias: el modelo redacta textos adaptados a las restricciones de cada plataforma (caracteres máximos, tono, llamadas a la acción), útil para campañas en redes sociales o buscadores.
- Análisis de campañas con supervisión humana: aunque el diagnóstico de campañas no es su punto fuerte, puede usarse como asistente para generar hipótesis iniciales que un experto revise, siempre que se sepa que su rendimiento es inferior al del modelo base.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local, el modelo permite procesar datos publicitarios sensibles sin enviarlos a servidores externos, cumpliendo políticas de confidencialidad.
- Integración en flujos de trabajo de marketing con Ollama o llama.cpp: gracias al Modelfile incluido, se puede desplegar con Ollama en pocos comandos, facilitando su uso en equipos sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

El autor publica resultados de un benchmark propio (gloofy_bench) medido sobre 150 anuncios reales, con una única especificación y un único evaluador. La métrica principal es la exactitud de facetas (exact facet accuracy). Los resultados se muestran en la siguiente tabla:

| Modelo | Exact facet accuracy |
|---|---|
| Claude | 0,916 |
| Techo de acuerdo entre anotadores | 0,911 |
| Gemini 3.6 Flash | 0,817 |
| GPT-5.5 | 0,792 |
| Adaptador MLX (este modelo, sin cuantizar) | 0,780 |
| Este GGUF, Q4_K_M | 0,735 |
| Qwen3-4B sin entrenar | 0,000 |

El autor advierte que la diferencia entre filas adyacentes por debajo de Claude es menor que la variabilidad observada entre tres ejecuciones de entrenamiento con distinta semilla (0,055). Además, en la tarea de diagnóstico de campañas, el modelo perdió 9-1 en evaluación ciega contra el modelo base sin entrenar, lo que indica una debilidad específica en razonamiento abierto.

## Requisitos de hardware

- El autor afirma que el modelo "se ejecuta offline en un portátil", lo que sugiere que cabe en hardware de consumo.
- El tamaño del repositorio es de 2,5 GB, correspondiente al archivo GGUF Q4_K_M, por lo que la VRAM necesaria para inferencia debería ser inferior a 6 GB, aunque no se proporciona un valor exacto.
- No se especifican GPUs concretas recomendadas, pero por el tamaño del modelo, una GPU con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) sería suficiente.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama (con el Modelfile incluido) y cualquier servidor compatible con la API de chat de OpenAI (el autor menciona `--provider local` con base URL).
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base Qwen3-4B, del que deriva. También se puede comparar con los modelos frontera mencionados en el benchmark, aunque no son de la misma categoría (tamaño y coste).

| Modelo | Parametros | Contexto | Exact facet accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gloofy-1-nano (GGUF Q4_K_M) | 4.022 M | No disponible | 0,735 | Apache 2.0 | HuggingFace, GGUF |
| Qwen3-4B (base, sin entrenar) | 4.022 M | No disponible | 0,000 | Apache 2.0 | HuggingFace |
| Claude (frontera) | No disponible | No disponible | 0,916 | Propietaria | API |
| Gemini 3.6 Flash (frontera) | No disponible | No disponible | 0,817 | Propietaria | API |
| GPT-5.5 (frontera) | No disponible | No disponible | 0,792 | Propietaria | API |

No se dispone de datos de otros modelos de código abierto de tamaño similar (por ejemplo, Llama 3.2 3B, Phi-3 mini) en este benchmark, por lo que no se puede establecer una comparativa directa con ellos.

## Limitaciones y advertencias

- No es un modelo frontera: Claude, Gemini y GPT-5.5 le superan en el benchmark propio del autor, y la diferencia con los modelos comerciales es significativa.
- No es adecuado para razonamiento abierto: en diagnóstico de campañas, el modelo perdió 9-1 contra el modelo base sin entrenar, por lo que esta tarea debe delegarse en un modelo general.
- La cuantización Q4_K_M reduce la precisión en facetas de juicio (ángulo y gancho), lo que puede afectar a tareas que requieren evaluación subjetiva.
- El techo de rendimiento está limitado por el acuerdo entre anotadores (91%), lo que significa que incluso un modelo perfecto no superaría ese umbral en las etiquetas utilizadas.
- Solo soporta inglés (en), lo que limita su uso en mercados hispanohablantes sin adaptación adicional.
- El modelo fue entrenado con datos de publicidad, por lo que puede heredar sesgos presentes en ese dominio (por ejemplo, estereotipos de género o culturales en los anuncios).
- La licencia Apache 2.0 permite uso comercial y modificación, pero el autor recomienda no ocultar el modelo base (Qwen3-4B) por coherencia con la documentación publicada.
- No se especifica la longitud de contexto, por lo que no se puede garantizar un rendimiento adecuado en conversaciones o documentos largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/overads/gloofy-1-nano
- Organización overads Inc. en GitHub: https://github.com/overads-Inc
- Benchmark público (gloofy_bench): https://github.com/overads-Inc/gloofy_bench
- Harness de evaluación (run_frontier.py): https://github.com/overads-Inc/gloofy_bench/blob/main/harness/run_frontier.py
