# hermitdave/K2-Horizon-7B-MLX-4bit

## Resumen

K2-Horizon-7B es un modelo de razonamiento denso desarrollado por el IFM Team, liberado bajo licencia Apache-2.0. Pertenece a la familia K2 Horizon y se presenta como un modelo de 7000 millones de parámetros con una ventana de contexto de 512.000 tokens. Este repositorio concreto contiene una conversión a formato MLX cuantizada a 4 bits, realizada por hermitdave mediante `mlx-lm` y `oMLX`, pensada para su ejecución eficiente en dispositivos Apple Silicon.

El modelo destaca por su capacidad de razonamiento explícito, que requiere activar `reasoning_effort="high"` para obtener los mejores resultados. Los benchmarks publicados por el autor del modelo base muestran un rendimiento notable en tareas de ingeniería de software, matemáticas y búsqueda web, lo que lo sitúa como una opción interesante para aplicaciones de agentes y análisis complejo. La conversión MLX 4-bit reduce el tamaño del modelo a aproximadamente 5 GB, manteniendo un equilibrio entre calidad y velocidad para inferencia local en Macs con Apple Silicon.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de razonamiento (arquitectura interna detallada no disponible) |
| Parametros totales | 8.999.178.240 (el modelo se comercializa como 7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512.000 tokens |
| Tipos de cuantizacion | 4-bit (este repo); también disponibles oQ4e, oQ6e, 6-bit y 8-bit en la familia MLX |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

K2-Horizon-7B es un modelo denso de razonamiento, es decir, no emplea arquitectura de mezcla de expertos (MoE). Según la información proporcionada, el modelo base fue desarrollado por el IFM Team y liberado bajo Apache-2.0, pero no se detallan los datos de entrenamiento, el número de tokens utilizados ni las técnicas de alineación aplicadas (como RLHF o DPO). La única referencia a su diseño es la necesidad de usar `reasoning_effort="high"` para activar su modo de razonamiento, lo que sugiere que incorpora un mecanismo de pensamiento explícito.

La conversión a MLX fue realizada por hermitdave utilizando Hermes Agent con `mlx-lm` y `oMLX`. Este proceso transforma los pesos originales a un formato optimizado para Apple Silicon, con distintas opciones de cuantización (oQ4e, 4-bit, oQ6e, 6-bit y 8-bit). El repositorio actual contiene la variante 4-bit, que prioriza la velocidad de inferencia frente a la calidad, aunque la tabla de formatos indica que oQ4e ofrece una calidad aproximadamente equivalente a 6 bits con un tamaño similar.

## Capacidades

- Razonamiento explícito: el modelo está diseñado como un modelo de razonamiento y requiere `reasoning_effort="high"` para obtener respuestas más elaboradas y coherentes.
- Contexto largo de 512.000 tokens, lo que permite procesar documentos extensos, conversaciones largas y bases de conocimiento completas en una sola pasada.
- Generación de texto y conversación, tal como indica su pipeline de text-generation.
- Capacidades de agente: los benchmarks de SWE-bench Verified (70.6) y Terminal-Bench 2.1 (39.06) sugieren que puede resolver tareas de ingeniería de software y operaciones de terminal de forma autónoma.
- Búsqueda y navegación web: el resultado en BrowseComp (59.0) indica un buen desempeño en tareas de búsqueda compleja y extracción de información.
- Razonamiento matemático avanzado: la puntuación de 73.3 en HMMT Feb 2026 refleja una capacidad sólida en problemas matemáticos de nivel competitivo.
- Compatible con API estilo OpenAI: la model card incluye un ejemplo de uso mediante `OpenAI` con `base_url` apuntando a un servidor local, lo que facilita su integración en aplicaciones existentes.
- No se menciona soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Resolución de issues en repositorios de código: gracias a su rendimiento de 70.6 en SWE-bench Verified, el modelo puede analizar descripciones de bugs, proponer parches y generar código correcto en proyectos de software reales.
- Automatización de tareas de terminal: con una puntuación de 39.06 en Terminal-Bench 2.1, es adecuado para ejecutar comandos, interpretar salidas y resolver tareas administrativas en entornos Unix.
- Asistente matemático para investigación y educación: la puntuación de 73.3 en HMMT Feb 2026 permite utilizarlo como tutor o herramienta de apoyo en problemas de olimpiadas matemáticas y razonamiento cuantitativo.
- Análisis de documentos largos: la ventana de contexto de 512.000 tokens permite procesar informes extensos, contratos o libros completos, extrayendo información y generando resúmenes sin necesidad de dividir el texto.
- Búsqueda compleja en la web: el resultado de 59.0 en BrowseComp indica que puede navegar por fuentes dispersas, comparar información y responder preguntas que requieren síntesis de múltiples páginas.
- Asistente de desarrollo integrado: al ser compatible con una API estilo OpenAI, puede integrarse en IDEs o pipelines de CI/CD para generar código, explicar fragmentos y revisar cambios.
- Atención al cliente automatizada: aunque no se especifican los idiomas soportados, el contexto largo permite mantener conversaciones multi-turno extensas, y el modo de razonamiento ayuda a resolver consultas complejas con pasos intermedios.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base K2-Horizon-7B publicado por el IFM Team. La conversión MLX 4-bit puede presentar ligeras variaciones de rendimiento debido a la cuantización, pero no se dispone de benchmarks específicos para esta versión.

| Benchmark | K2-Horizon-7B |
|---|---|
| SWE-bench Verified | 70.6 |
| Terminal-Bench 2.1 | 39.06 |
| tau3-Banking | 25.8 |
| BrowseComp | 59.0 |
| HMMT Feb 2026 | 73.3 |

Scores en porcentaje. Fuente: model card del modelo base.

## Requisitos de hardware

- El archivo de pesos 4-bit ocupa aproximadamente 5.1 GB, por lo que se recomienda un dispositivo Apple Silicon con al menos 8 GB de memoria unificada para la carga del modelo, el runtime de MLX y la caché KV.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) mediante el framework MLX. No es compatible con GPUs NVIDIA de forma nativa.
- No cabe en consumer GPU convencionales en este formato; para ejecutarlo en una GPU CUDA sería necesario convertir el modelo a otro formato, como GGUF o safetensors estándar.
- Opciones de despliegue: `mlx_lm` para generación desde línea de comandos, `oMLX` para cuantización y ejecución, y un servidor compatible con OpenAI (el ejemplo de la model card usa `base_url="http://localhost:8000/v1"`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información comparativa en la fuente proporcionada. El modelo comparte categoría con otros modelos de razonamiento de tamaño similar (por ejemplo, la familia Qwen o Llama), pero no hay datos de benchmarks de esos modelos en la información disponible como para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Los benchmarks publicados corresponden al modelo base sin cuantizar; la versión 4-bit MLX puede degradar ligeramente la calidad de las respuestas.
- No se especifican los idiomas soportados, por lo que el rendimiento en español u otros idiomas distintos del inglés no está documentado.
- El modelo requiere activar `reasoning_effort="high"` para aprovechar su modo de razonamiento; si se omite este parámetro, las respuestas pueden ser menos elaboradas.
- Riesgo de alucinación inherente a los modelos generativos; no se ha publicado una evaluación específica de este aspecto.
- No se mencionan sesgos conocidos ni medidas de mitigación en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse la atribución y la licencia del modelo upstream (IFM/K2-Horizon-7B).
- La conversión MLX está optimizada para Apple Silicon; su uso en otros entornos requiere conversión adicional a otros formatos.

## Enlaces

- Repositorio HuggingFace de la conversión MLX 4-bit: https://huggingface.co/hermitdave/K2-Horizon-7B-MLX-4bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Blog del IFM Team sobre K2 Horizon: https://ifm.ai/blog/k2/
- Conversión MLX similar (espejo): https://huggingface.co/abenzerps/K2-Horizon-7B-MLX-4bit
- Lista de adapters y cuantizaciones del modelo base: https://huggingface.co/models?other=base_model%3Aadapter%3AIFM%2FK2-Horizon-7B
