# ai-forever/FRIDA-Decisions-V2-1.8B

## Resumen

FRIDA-Decisions-V2-1.8B es un modelo de decisión estructurada desarrollado por ai-forever (Sberbank), afinado a partir de Qwen/Qwen3.5-2B. No es un modelo generativo al uso: puntúa respuestas candidatas frente a una entrada de texto o imagen compartida, en ruso o inglés, y devuelve decisiones discretas (elección entre opciones, puntuación ordinal, sí/no) o rankings con puntuaciones crudas. Está pensado para tareas sensibles a la latencia como enrutamiento, triaje, clasificación y reranking.

Arquitectura densa de 16 capas en BF16 con un codificador de visión, 1.755.489.249 parámetros reales y una ventana de 32.768 posiciones por petición. El modelo reutiliza el estado (texto o imágenes) entre candidatos de una misma petición cuando este alcanza las 1.536 posiciones, lo que reduce el coste de evaluar conjuntos grandes de candidatos.

Su relevancia actual radica en el enfoque: en lugar de generar texto libre y parsearlo, expone una interfaz tipada de decisiones (`choice`, `score`, `noul`, `ranking`) con soporte de vLLM mediante plugin, lo que facilita integrarlo en pipelines de producción con latencias acotadas. La licencia Apache 2.0 y el soporte bilingüe ruso/inglés lo hacen apto para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 16 capas con codificador de vision |
| Parametros totales | 1.755.489.249 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 posiciones por peticion |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3,5 GB), con codigo custom (`trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 16 capas en BF16, afinado desde Qwen/Qwen3.5-2B, al que se añade un codificador de visión para aceptar hasta 16 imágenes por petición (en base64 o data URI). La salida no es texto generativo sino puntuaciones sobre candidatos: el modelo compara un `state` compartido (texto o imágenes) contra un conjunto de preguntas tipadas y devuelve la opción elegida, la probabilidad de una respuesta afirmativa o una puntuación ordinal como valor esperado bajo las probabilidades devueltas.

Una innovación destacable es la reutilización del estado entre candidatos de una misma petición: cuando el `state` alcanza las 1.536 posiciones (incluyendo parches de imagen y delimitadores), el modelo lo comparte entre candidatos en lugar de reprocesarlo. Con aritmética BF16 los dos caminos (estado compartido frente a evaluación independiente) pueden producir puntuaciones ligeramente distintas, y candidatos muy próximos pueden intercambiar posiciones; para comparaciones directas se ofrece `use_shared_state=False`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Decisiones de elección (`choice`) entre dos o más opciones con instrucciones y criterios definidos por el usuario.
- Puntuación ordinal (`score`) con al menos dos niveles; devuelve el nivel esperado bajo las probabilidades.
- Decisiones sí/no (`noul`) con probabilidad de respuesta afirmativa.
- Ranking con puntuaciones crudas por candidato a través del servidor vLLM.
- Procesamiento de imágenes (hasta 16 por petición) junto con texto de acompañamiento.
- Clasificación zero-shot y reranking sobre conjuntos de candidatos.
- Soporte bilingüe ruso/inglés.
- Integración con vLLM mediante plugin (`frida_decisions_v2`) y con el pipeline `decision` de Transformers 5.24.1.
- No disponible: soporte de tool calling, capacidades de agente o razonamiento multi-paso, generación de texto libre.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del cliente como `state` y una pregunta `choice` con los equipos posibles (soporte, facturación, etc.) como criterios; devuelve el equipo seleccionado con márgenes por opción, adecuado por su baja latencia y su ventana de 32.768 posiciones.
- Triaje de incidencias: combinar una pregunta `noul` ("¿el cliente indica que no puede acceder?") con una `choice` de prioridad permite clasificar urgencia en una sola petición y con estado compartido entre preguntas.
- Clasificación zero-shot de documentos: definir las categorías como criterios de una pregunta `choice` y puntuar cada documento sin entrenamiento adicional, aprovechando el pipeline `decision` de Transformers.
- Reranking de resultados de búsqueda: enviar la consulta como `state` y los documentos candidatos como opciones, obteniendo puntuaciones crudas por candidato mediante el endpoint `/pooling` de vLLM para reordenar la lista.
- Moderación o verificación visual: con hasta 16 imágenes por petición, responder preguntas `noul` sobre el contenido de las imágenes (por ejemplo, "¿la imagen muestra un cielo azul?") en flujos de revisión automatizada.
- Evaluación de calidad de respuestas: puntuar respuestas generadas por otro modelo con una pregunta `score` ordinal, usando el nivel esperado como métrica continua para filtrar salidas antes de publicarlas.
- Enrutamiento multimodal: combinar texto e imágenes en el mismo `state` para decidir la cola de procesamiento adecuada en pipelines que reciben capturas de pantalla o fotos adjuntas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona secciones de evaluación y rendimiento de servicio, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa 3,5 GB; el comando de referencia de vLLM usa `--gpu-memory-utilization 0.3`, lo que sugiere un consumo moderado, aunque el valor absoluto depende de la GPU.
- GPU recomendadas: no se especifican modelos concretos; el despliegue de referencia asume un entorno Linux con CUDA.
- Cabe en GPU de consumo: probable con 1.755 millones de parámetros en BF16 (3,5 GB de pesos), pero no se confirma en la información disponible.
- Opciones de despliegue: vLLM 0.32.0 con el plugin `frida_decisions_v2` (Transformers 5.19.0 y FLA 0.6.0) o el pipeline `decision` de Transformers 5.24.1 con `trust_remote_code=True`.
- Configuración de servicio de referencia: `--max-model-len 32768`, `--max-num-batched-tokens 32768`, `--max-num-seqs 32`, `--enforce-eager`, sin prefix caching ni chunked prefill.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FRIDA-Decisions-V2-1.8B | 1.755 M | 32.768 | Decision estructurada, vision, ru/en | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (modelo base) | ~2.000 M | no disponible | Generacion de texto | no disponible | Hugging Face |
| Alternativas de clasificacion/reranking del mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (decisión estructurada con visión y salida tipada) en los datos proporcionados.

## Limitaciones y advertencias

- Modelo especializado en decisiones: no genera texto libre, tool calling ni razonamiento multi-paso.
- Idiomas limitados a ruso e inglés; el rendimiento en otros idiomas no está documentado.
- Con estado compartido en BF16, candidatos muy próximos pueden intercambiar posiciones; para comparaciones finas debe usarse `use_shared_state=False`.
- El camino de estado compartido solo se activa a partir de 1.536 posiciones; por debajo, cada candidato se procesa de forma independiente, con mayor coste.
- Requiere `trust_remote_code=True` y código custom incluido con los pesos, lo que implica revisar el código antes de desplegarlo en producción.
- El plugin de vLLM está atado a versiones concretas (vLLM 0.32.0, Transformers 5.19.0, FLA 0.6.0) y a un entorno Linux CUDA.
- No se documentan sesgos conocidos ni tasas de alucinación; al tratarse de un modelo de puntuación, el riesgo se traslada a decisiones mal calibradas en candidatos ambiguos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base Qwen/Qwen3.5-2B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-forever/FRIDA-Decisions-V2-1.8B
- Repositorio GitHub: https://github.com/ai-forever/FRIDA
- Artículo en Habr (RU): https://habr.com/ru/companies/sberbank/articles/1112312/
- Benchmark razvilka: https://huggingface.co/datasets/artemsnegirev/razvilka
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
