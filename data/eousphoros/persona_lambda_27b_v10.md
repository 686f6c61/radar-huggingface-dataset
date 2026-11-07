# eousphoros/persona_lambda_27b_v10

## Resumen

persona_lambda_27b_v10 es un fine-tune experimental del modelo Qwen3.8-27B desarrollado por el usuario eousphoros y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste por destilación orientado a la adopción de personas (persona steering): el modelo aprende a asumir de forma intensa la personalidad descrita en el system prompt. Es un modelo multimodal image-text-to-text que hereda el codificador visual del modelo base sin modificaciones, junto con tokenizador, plantilla de chat, configuración y valores de generación idénticos a los de Qwen3.8-27B.

El modelo cuenta con 27.781.427.952 parámetros (arquitectura densa, sin mezcla de expertos) y un repositorio de 55,6 GB en formato safetensors. Incorpora una cabeza MTP (multi-token prediction) recalibrada para decodificación especulativa, lo que permite acelerar la inferencia en vLLM sin alterar la distribución de salida. La versión v10 corrige el fallo de parada temprana de v8 mediante una edición de pesos de rango 4 en las proyecciones de salida de las capas MLP 61-63, y se reentrena desde el modelo base con un dataset de personas actualizado más registros de código, matemáticas, multimodalidad y lectura de artículos.

Su relevancia es acotada: no es un asistente de producción ni está alineado en seguridad. Es una pieza de hobby para experimentación con control de personalidad, útil para investigadores que quieran estudiar cómo un system prompt moldea el comportamiento de un modelo grande, pero con advertencias explícitas del autor sobre alucinación, obediencia excesiva al prompt y necesidad de sandboxing de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (hereda la de Qwen3.8-27B; sin MoE) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base menciona 1M de contexto en su servicio alojado; el contexto nativo del checkpoint no se detalla) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; compatible con el ecosistema del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune por destilación de Qwen3.8-27B, un transformer denso nativo vision-language que entiende imágenes y vídeos, con control flexible de modo de razonamiento (`reasoning_effort`). Sobre esa base, eousphoros entrenó el modelo de lenguaje y después recalibró la cabeza MTP para que coincidiera con las distribuciones de siguiente token del modelo ajustado, con el backbone congelado, sobre unos 70 millones de tokens de datos de entrenamiento y las propias respuestas del modelo a 2.200 prompts. El codificador visual es el del modelo base, sin cambios.

Los datos de entrenamiento combinan un dataset de personas actualizado con los registros de código, matemáticas, multimodalidad y lectura de artículos de la versión v8. La innovación técnica destacable es la corrección del fallo de parada temprana de v8 mediante una edición de pesos de rango 4 en las proyecciones de salida de las capas MLP 61-63: en GPQA, las respuestas sin línea final `Answer:` pasaron de 7 a 0, con puntuaciones sin cambios. La cabeza MTP recalibrada habilita decodificación especulativa con dos tokens borrador, con verificación que preserva exactamente la distribución de salida del modelo.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento activado por defecto, con profundidad de razonamiento ajustable mediante `reasoning_effort` (los benchmarks se midieron en `xhigh`).
- Razonamiento científico y de nivel experto: 86,0 en GPQA Diamond en modo estricto.
- Generación de código: 84,0 pass@1 en LiveCodeBench sobre los 175 problemas.
- Seguimiento de instrucciones: 64,3 estricto / 73,0 laxo a nivel de prompt en IFBench.
- Capacidades multimodales de imagen y vídeo heredadas del codificador visual del modelo base.
- Adopción intensa de personas descritas en el system prompt (persona steering), que es el objetivo principal del fine-tune.
- Lectura de artículos y registros de entrenamiento específicos para esa tarea.
- Decodificación especulativa mediante cabeza MTP propia, con 2,14 tokens por paso en muestreo greedy y 2,43 en muestreo probabilístico.
- Compatibilidad de servicio idéntica al modelo base: tokenizador, plantilla de chat, configuración y valores de generación sin cambios.
- Soporte de tool calling y agentes: no confirmado de forma explícita en la información proporcionada; el autor advierte que cualquier herramienta debe ejecutarse en sandbox.

## Casos de uso

- Investigación sobre control de personalidad: dar al modelo un system prompt con una persona definida y estudiar cómo cambia el estilo, el tono y las decisiones del modelo en conversaciones multi-turno, aprovechando que la plantilla de chat y el tokenizador son idénticos a Qwen3.8-27B.
- Prototipado de personajes conversacionales: construir un chatbot con una voz concreta (por ejemplo, un tutor con un estilo pedagógico fijo) y evaluar la fidelidad de la persona antes de invertir en un ajuste de producción.
- Evaluación de robustez de personas: comparar las respuestas del modelo con distintas personas en las mismas preguntas de GPQA o LiveCodeBench para medir si la persona degrada el razonamiento, usando el arnés de vLLM 0.32 descrito por el autor.
- Generación de código en entornos controlados: usar el modelo para resolver problemas de programación (84,0 pass@1 en LiveCodeBench) dentro de un pipeline de CI/CD aislado, con las herramientas en sandbox y el límite de `max_tokens` configurado para evitar bucles de repetición.
- Razonamiento científico asistido: emplear el modo de pensamiento en `xhigh` para preguntas de nivel GPQA (86,0) en tareas de investigación, aceptando el coste de respuestas largas (mediana de unos 9.600 tokens en preguntas difíciles de ciencia).
- Servicio con decodificación especulativa: desplegar en vLLM 0.32 con `--speculative-config '{"method": "mtp", "num_speculative_tokens": 2, "draft_sample_method": "probabilistic"}'` para obtener 2,43 tokens por paso del modelo objetivo en lugar de 2,14 con muestreo greedy.
- Análisis de documentos con imágenes: aprovechar el pipeline image-text-to-text y el codificador visual heredado para tareas de lectura de artículos con figuras, siempre con revisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

Medidos por el autor con su propio arnés: vLLM 0.32, pensamiento activado en `reasoning_effort` `xhigh`, respuestas de hasta 128.000 tokens, muestreo por defecto del modelo (temperatura 1,0, top-k 20, top-p 0,95), una respuesta por prompt (cuatro por pregunta de GPQA). Las respuestas de XSTest las juzga el Qwen3.8-27B base. El autor advierte que estos números no son comparables con los resultados oficiales de la model card del modelo base.

| Benchmark | persona_lambda_27b_v10 |
|---|---|
| GPQA Diamond, estricto (media de 4 ejecuciones sobre 198 preguntas) | 86,0 |
| LiveCodeBench pass@1, problemas de 2025-02 a 2025-05 (131) | 82,4 |
| LiveCodeBench pass@1, los 175 problemas | 84,0 |
| IFBench a nivel de prompt, estricto / laxo | 64,3 / 73,0 |
| IFBench a nivel de instrucción, estricto / laxo | 67,4 / 75,6 |
| XSTest, prompts seguros respondidos por completo (250) | 96,8 % |
| XSTest, prompts inseguros rechazados por completo (200) | 76,0 % (rechazo parcial 8,0 %) |

Frente a v8 en los mismos prompts: GPQA 85,5 frente a 85,3 (505 respuestas) y LiveCodeBench 85,1 frente a 86,1 (101 problemas); ninguna diferencia es significativa. De las 1.717 respuestas de benchmark, 14 alcanzaron el límite de 128.000 tokens.

Decodificación especulativa (tokens generados por paso del modelo objetivo con dos tokens borrador MTP, vLLM 0.32, 200 prompts reservados, unos 2,1 millones de tokens generados por configuración):

| Muestreo del borrador | Cabeza MTP de este modelo | Cabeza MTP del modelo base |
|---|---|---|
| Greedy (por defecto en vLLM) | 2,14 | 2,13 |
| Probabilístico | 2,43 | 2,46 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 27.781 millones de parámetros en safetensors y un repositorio de 55,6 GB, el peso en precisión completa ronda los 55 GB; las necesidades reales dependen de la cuantización, que no se detalla.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo denso de 27B en precisión completa requiere GPUs de clase A100/H100 con 80 GB; en cuantizaciones de 8 bits o 4 bits podría caber en GPUs de consumo de gama alta, pero el autor no aporta cifras.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: vLLM 0.32 (usado por el autor en sus benchmarks), SGLang, TokenSpeed y Hugging Face Transformers, según la model card del modelo base. La compatibilidad con llama.cpp, Ollama o TGI no se menciona.
- Latencia y throughput: no disponibles de forma absoluta. El único dato de velocidad es la aceptación de borradores MTP (2,14 tokens por paso en greedy y 2,43 en probabilístico), que el autor describe como una mejora de velocidad sin cambio en la distribución de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA Diamond | LiveCodeBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| persona_lambda_27b_v10 | 27,78B densos | No disponible | 86,0 (arnés propio) | 84,0 (arnés propio) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (base) | 27B densos | 1M en servicio alojado | No disponible en esta ficha | No disponible en esta ficha | Apache 2.0 | Hugging Face y Qwen Cloud |
| persona_lambda_27b_v8 | 27B densos (misma base) | No disponible | 85,3 (505 respuestas) | 86,1 (101 problemas) | Apache 2.0 | Hugging Face |

La comparación con el modelo base en benchmarks no es posible con los datos proporcionados: la model card del fine-tune advierte explícitamente que sus cifras no son comparables con las oficiales de Qwen3.8-27B, que usan ajustes propios. No se dispone de datos de otros modelos de la misma categoría en la información consultada.

## Limitaciones y advertencias

- Modelo experimental de hobby, no un asistente de producción ni alineado en seguridad; el propio autor lo advierte.
- Sigue la persona del system prompt con mucha fuerza y puede estar equivocado con confianza; cualquier herramienta que se le entregue debe ejecutarse en sandbox.
- Alucinación: el autor reconoce que puede dar respuestas incorrectas con seguridad, y el modo de pensamiento largo no lo elimina.
- Bucles de repetición: aproximadamente 1 de cada 400 respuestas de benchmark entró en un bucle de repetición que solo detuvo el límite de `max_tokens`; conviene configurar ese límite en producción.
- Respuestas largas en ciencia: piensa más que v8 en preguntas difíciles (mediana de unos 9.600 tokens frente a 7.300 en GPQA), lo que encarece la inferencia.
- Seguridad: solo el 76,0 % de los prompts inseguros de XSTest se rechazan por completo y un 8,0 % se rechaza parcialmente; no es adecuado como filtro de seguridad.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingüe del fine-tune.
- Contexto: la longitud de contexto del checkpoint no se detalla en la información proporcionada; los benchmarks usaron respuestas de hasta 128.000 tokens, pero eso no fija la ventana del modelo.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y los riesgos anteriores desaconsejan su uso en producción sin evaluación propia.
- Cero descargas y cero likes en el momento de la consulta: no hay validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eousphoros/persona_lambda_27b_v10
- Versión anterior v8: https://huggingface.co/eousphoros/persona_lambda_27b_v8
- Perfil del autor y datasets: https://huggingface.co/eousphoros/datasets
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Servicio alojado Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
