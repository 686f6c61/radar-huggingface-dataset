# gump2049/APUS_Reflex2.2

## Resumen

APUS_Reflex2.2 es un modelo de decisión publicado por el usuario gump2049 en Hugging Face. No es un modelo generativo de texto al uso: su función es puntuar opciones discretas ante una pregunta dada, devolviendo la distribución de probabilidad completa sobre las alternativas. Admite tres modalidades de decisión: elección entre opciones con nombre, preguntas de sí/no y escalas de niveles ordenados. Cada pregunta se procesa de forma independiente y se resuelve con una única lectura de token en vLLM.

El modelo se apoya en la arquitectura nativa Qwen3.5 (etiqueta `qwen3_5_text`), con capas de atención bidireccional completa combinadas con capas recurrentes causales, y se ejecuta en una sola pasada. Los pesos están en BF16, repartidos en tres shards de safetensors, con un total de 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) y un repositorio de 53,8 GB.

Su relevancia radica en el enfoque: en lugar de generar texto libre y parsear la respuesta, expone directamente una interfaz de puntuación de decisiones con distribución de probabilidad normalizada sobre códigos de token, lo que facilita integrar el modelo en sistemas de enrutamiento, clasificación o toma de decisiones automatizada con incertidumbre calibrada. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido basado en Qwen3.5 (capas de atención bidireccional completa + capas recurrentes causales) |
| Parametros totales | 26.895.998.464 (26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (incluyendo el token de lectura de decisión) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards en BF16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura nativa Qwen3.5, que combina capas de atención bidireccional completa con capas recurrentes causales. La inferencia se realiza en una sola pasada y la respuesta se obtiene a partir de las probabilidades normalizadas de los tokens de código correspondientes a cada opción. El servicio está diseñado para ejecutarse sobre vLLM con FlashAttention 3, lo que sugiere un pipeline de inferencia optimizado para baja latencia en la lectura de un único token por pregunta.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones adicionales como decodificación especulativa. El autor indica que las revisiones de código fuente, licencias y modificaciones quedan registradas en el archivo THIRD_PARTY_NOTICES del repositorio, pero ese contenido no está disponible en la información proporcionada.

## Capacidades

- Puntuación de decisiones entre opciones con nombre (choice): recibe criterios indexados por clave y devuelve la distribución de probabilidad sobre las alternativas.
- Preguntas de sí/no (noul): acepta una descripción opcional en verdadero/falso y devuelve la probabilidad de que sea verdadera.
- Escalas de niveles ordenados (score): recibe niveles ordenados y devuelve su esperanza matemática con base cero.
- Salida de distribución de probabilidad completa sobre las opciones, no solo la etiqueta ganadora.
- Procesamiento independiente de cada pregunta, sin truncamiento hasta el límite de 65.536 tokens.
- Límite de 255 códigos candidatos por consulta.
- Interfaz HTTP compatible con vLLM mediante el endpoint `POST /v1/systemone`.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Enrutamiento de consultas en sistemas de atención al cliente: el modelo puede puntuar a qué departamento o flujo corresponde una consulta entrante, devolviendo la distribución de probabilidad sobre las categorías disponibles para aplicar umbrales de confianza.
- Clasificación de tickets con incertidumbre calibrada: al obtener la distribución completa sobre las etiquetas, es posible derivar casos ambiguos a revisión humana cuando la probabilidad máxima no supera un umbral configurado.
- Moderación de contenido binaria: mediante preguntas de sí/no (noul) con descripción verdadero/falso, se puede evaluar si un texto cumple una política concreta y obtener la probabilidad asociada.
- Encuestas y escalas Likert automatizadas: con la modalidad score, el modelo devuelve la esperanza sobre niveles ordenados, útil para convertir texto libre en valoraciones numéricas dentro de pipelines de análisis.
- Sistemas de recomendación con selección discreta: puntuar candidatos (productos, artículos, acciones) según criterios definidos por clave y ordenar por probabilidad.
- Toma de decisiones en agentes automatizados: integrar el endpoint `/v1/systemone` como paso de selección entre acciones predefinidas, aprovechando la distribución de probabilidad para estrategias de exploración o votación.
- Evaluación de hipótesis en pipelines de investigación: formular afirmaciones como preguntas de sí/no y usar la probabilidad de verdadero como señal para filtrar o priorizar hipótesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 suman aproximadamente 53,8 GB, por lo que se requiere al menos una GPU con 80 GB para cargar el modelo completo sin cuantización.
- GPU recomendadas: el autor indica una H100 de 80 GB por worker como configuración de referencia. GPUs más grandes o compartidas pueden ajustarse mediante `GPU_MEMORY_UTILIZATION`.
- GPU de consumo: no se documenta soporte para GPUs de consumo; el requisito de FlashAttention 3 y el tamaño en BF16 lo hacen inviable en tarjetas de 24 GB sin cuantización, que no está publicada.
- Opciones de despliegue: vLLM con FlashAttention 3 sobre Linux con CUDA, Python 3.12, Bash 4.3+, curl, setsid (util-linux), procps y awk. El script `start.sh` levanta el worker y el servicio System One en loopback (puertos 8814 para la API y 8815 para el worker, configurables con `PORT` y `BACKEND_PORT`).
- Latencia y throughput: no disponibles. El autor menciona un tiempo de arranque en frío de hasta 30 minutos para importaciones e inicialización de kernels, configurable con `STARTUP_TIMEOUT_SECONDS`, pero no se publican cifras de latencia por petición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión con salida de distribución de probabilidad) en la documentación proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo no es generativo: no produce texto libre ni respuestas conversacionales; solo puntúa opciones predefinidas.
- Límite de 255 códigos candidatos por consulta y de 65.536 tokens por pregunta, sin truncamiento; las entradas que excedan estos límites no se procesan.
- No se documentan los idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado fuera del idioma o idiomas de entrenamiento.
- No se dispone de información sobre sesgos, datos de entrenamiento ni evaluación de alucinación; al tratarse de un modelo de puntuación, el riesgo se traslada a la calibración de las probabilidades, que no está validada públicamente.
- El modelo tiene 11 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y ausencia de validación por parte de la comunidad.
- El autor no publica la model card completa en la información disponible; los detalles sobre el dataset y el proceso de entrenamiento están ausentes.
- La licencia Apache 2.0 permite uso comercial, pero deben revisarse las licencias de terceros recogidas en THIRD_PARTY_NOTICES del repositorio antes de desplegar en producción.
- El despliegue requiere hardware específico (H100 de 80 GB, FlashAttention 3, Linux con CUDA) y un tiempo de arranque en frío de hasta 30 minutos, lo que complica escenarios de escalado dinámico.

## Enlaces

- Hugging Face: https://huggingface.co/gump2049/APUS_Reflex2.2
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
