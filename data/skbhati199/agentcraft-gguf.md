# skbhati199/AgentCraft-GGUF

## Resumen

AgentCraft-GGUF es la versión cuantizada en formato GGUF de un ajuste fino QLoRA sobre Qwen2.5-Coder-7B-Instruct, desarrollado por el usuario skbhati199. El modelo está orientado a tareas de programación, razonamiento tipo `analysis` y uso de herramientas (terminal, sistema de ficheros y búsqueda web) mediante el formato nativo de tool calling de Qwen. Se distribuye en tres cuantizaciones (Q4_K_M, Q5_K_M y Q8_0) pensadas para ejecución local con llama.cpp y Ollama.

Arquitecturalmente hereda la estructura transformer densa de Qwen2.5-Coder-7B-Instruct, con 7.615.616.512 parámetros y una longitud de contexto declarada de 32.768 tokens. El ajuste se realizó con QLoRA de 4 bits (NF4) durante una única época, con r=32, alpha=64, dropout de 0,05 y una longitud máxima de secuencia de 8192 tokens, sobre 2 GPU T4 en Kaggle.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo reproducible de ajuste fino de bajo coste sobre un modelo de código consolidado; por otro, expone de forma transparente resultados de evaluación modestos en tool calling (25 % de acierto y 0 % de JSON válido), lo que lo convierte en un caso útil para estudiar los límites de los datos sintéticos en agentes. No obstante, su adopción es aún muy reducida (182 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (4 bits), Q5_K_M (5 bits), Q8_0 (8 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Tamano de ficheros | Q4_K_M: 4,36 GB; Q5_K_M: 5,07 GB; Q8_0: 7,10 GB |
| Tamano del repo | 17,7 GB |
| Libreria | llama.cpp |
| Metodo de ajuste | QLoRA (4-bit NF4), r=32, alpha=64, dropout=0,05, lr=2e-4, 1 epoca |
| Longitud maxima de entrenamiento | 8192 tokens |
| Hardware de entrenamiento | 2x NVIDIA T4 (DDP) en Kaggle |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer denso decoder-only de 7,6B parámetros con contexto nativo de 32.768 tokens, y aplica sobre él un ajuste fino QLoRA con cuantización de 4 bits NF4. La configuración LoRA emplea rango 32, alpha 64, dropout 0,05 y tasa de aprendizaje 2e-4 durante una sola época, con un batch efectivo construido mediante acumulación de gradientes y una longitud máxima de secuencia de 8192 tokens. El entrenamiento se ejecutó sobre 2 GPU T4 en paralelo de datos (DDP) en Kaggle, lo que sitúa el coste del ajuste en un rango muy bajo.

La mezcla de datos combina cuatro fuentes: trayectorias sintéticas para terminal, sistema de ficheros y búsqueda web; NousResearch/hermes-function-calling-v1 para function calling; ise-uiuc/Magicoder-OSS-Instruct-75K para código; y HuggingFaceH4/Bespoke-Stratos-17k junto con GSM8K para razonamiento. La pérdida se calcula únicamente sobre los tokens del asistente y las secuencias que exceden la longitud máxima se descartan en lugar de truncarse, una decisión que preserva la coherencia de las trayectorias completas pero reduce el volumen efectivo de datos. No se documenta ninguna innovación arquitectónica propia ni decodificación especulativa; el valor técnico está en el pipeline de cuantización y en la publicación de la configuración de entrenamiento.

## Capacidades

- Generación de código en múltiples lenguajes, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Razonamiento matemático de tipo cadena de pensamiento, reforzado con datos de GSM8K y Bespoke-Stratos-17k.
- Tool calling y function calling en el formato nativo de herramientas de Qwen (etiquetas `tool`), orientado a terminal, sistema de ficheros y búsqueda web.
- Razonamiento multi-paso mediante un modo de análisis (`analysis`) entrenado explícitamente.
- Conversación multi-turno con rol de sistema configurable.
- Capacidad de ejecución local en CPU y GPU a través de llama.cpp y Ollama.
- Compatibilidad con endpoints de API REST mediante el servidor de Ollama.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base soporta múltiples idiomas, pero el ajuste no documenta evaluación al respecto).
- No se documenta soporte de visión, audio ni otras modalidades.

## Casos de uso

- Asistente de código en local: el modelo puede generar funciones, refactorizar y explicar código ejecutándose íntegramente en una estación de trabajo con la cuantización Q4_K_M (4,36 GB), sin depender de servicios en la nube y con la licencia Apache-2.0 permitiendo uso comercial.
- Automatización de tareas de terminal en entornos controlados: gracias al entrenamiento con trayectorias sintéticas de terminal y sistema de ficheros, puede proponer comandos y secuencias de operaciones, siempre que se ejecuten dentro de un sandbox dado el bajo acierto documentado en tool calling.
- Integración en pipelines de CI/CD como revisor de parches: con 32.768 tokens de contexto puede recibir un diff completo junto con el fichero afectado y generar una revisión o una prueba unitaria adicional.
- Generación de tests unitarios: el modelo base destaca en HumanEval y MBPP, y el ajuste conserva esa capacidad, por lo que resulta adecuado para producir casos de prueba a partir de firmas de funciones y docstrings.
- Tutor de programación y resolución de problemas matemáticos: el modo de razonamiento entrenado con GSM8K y Bespoke-Stratos permite desglosar problemas paso a paso en entornos educativos.
- Prototipado de agentes con Ollama: su disponibilidad como modelo de Ollama y su API REST compatible permiten montar rápidamente un agente de demostración con búsqueda web simulada, aceptando que la tasa de JSON válido en tool calling es actualmente nula y requiere post-procesado o validación externa.
- Procesamiento por lotes de documentación técnica: con Q8_0 (7,10 GB) y contexto largo puede resumir o reescribir documentación extensa manteniendo una fidelidad cercana a F16.

## Benchmarks y rendimiento

Los resultados publicados corresponden al adaptador LoRA sin fusionar, no al modelo cuantizado final, y se obtuvieron con muestras reducidas, por lo que los intervalos de confianza son amplios.

| Benchmark | Metrica | Resultado | IC 95% | Muestras |
|---|---|---|---|---|
| GSM8K | Accuracy (exact match, 0-shot) | 83,3 % | [66,4 %, 92,7 %] | 30 |
| HumanEval | Pass@1 (greedy) | 90,0 % | [76,9 %, 96,0 %] | 40 |
| MBPP (sanitized) | Pass@1 (greedy) | 76,7 % | [59,1 %, 88,2 %] | 30 |
| Tool-call Probe | Tool-call accuracy | 25,0 % | [8,9 %, 53,2 %] | 12 |

La model card indica además que la tasa de JSON válido en la prueba de tool calling es del 0 %, un dato que el propio autor señala como pendiente de investigación. No se han publicado resultados de benchmarks del modelo cuantizado ni comparaciones directas con alternativas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB con Q4_K_M, 5,5-6 GB con Q5_K_M y 7,5-8 GB con Q8_0, incluyendo overhead de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100. Cualquier GPU con al menos 8 GB de VRAM puede ejecutar Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones si se dispone de 8 GB o más de VRAM; Q4_K_M funciona incluso en GPUs de 6 GB con contexto reducido.
- Ejecución en CPU: viable con llama.cpp, con throughput notablemente inferior; se recomienda Q4_K_M y al menos 8 hilos.
- Opciones de despliegue: llama.cpp (llama-cpp-python), Ollama (recomendado por el autor), servidor REST de Ollama y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AgentCraft-GGUF | 7,6B denso | 32.768 | Apache-2.0 | GGUF (Q4_K_M, Q5_K_M, Q8_0) | Ajuste QLoRA para código y agentes; tool calling con 0 % de JSON válido |
| Qwen2.5-Coder-7B-Instruct | 7,6B denso | 32.768 | Apache-2.0 | safetensors, GGUF | Modelo base; tool calling nativo y evaluación más extensa |
| Qwen2.5-Coder-14B-Instruct | 14,7B denso | 32.768 | Apache-2.0 | safetensors, GGUF | Mayor capacidad a costa de aproximadamente el doble de VRAM |
| Codestral-22B | 22B denso | 32.000 | Licencia no comercial (MNPL) | safetensors, GGUF | Mayor rendimiento en código, pero licencia restrictiva para uso comercial |

La comparación directa de rendimiento con estas alternativas no está disponible en la información proporcionada, ya que el autor no publica evaluaciones frente a otros modelos y las muestras de sus benchmarks son reducidas.

## Limitaciones y advertencias

- El propio autor advierte que gran parte de los datos de agente son sintéticos, por lo que el uso real de herramientas puede ser peor de lo que sugieren los benchmarks.
- La prueba de tool calling arroja un 25 % de acierto y un 0 % de JSON válido, lo que hace el modelo poco fiable para agentes autónomos sin validación y reparación externa de la salida.
- Los benchmarks publicados corresponden al adaptador LoRA sin fusionar y a muestras de 12 a 40 ejemplos, con intervalos de confianza muy amplios; no deben interpretarse como rendimiento del GGUF final.
- La cuantización Q4_K_M introduce una pérdida de calidad menor frente a F16; Q5_K_M y Q8_0 son más fieles pero consumen más memoria.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en razonamiento matemático de varios pasos y en la invocación de herramientas con parámetros complejos.
- Cualquier herramienta conectada al modelo debe ejecutarse en un sandbox, tal como recomienda el autor.
- No se documentan los idiomas soportados ni evaluaciones multilingües del ajuste.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-Coder-7B-Instruct, que también es Apache-2.0.
- El modelo tiene una adopción muy baja (182 descargas, 0 likes) y una única revisión, por lo que carece de validación comunitaria independiente.
- La model card referencia rutas locales de Windows (`G:\my-llms\eval\`) para los scripts de evaluación, que no están publicados en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skbhati199/AgentCraft-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Ficha en free2aitools: https://free2aitools.com/model/skbhati199/agentcraft-gguf
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset de código: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset de razonamiento: https://huggingface.co/datasets/HuggingFaceH4/Bespoke-Stratos-17k
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset HumanEval: https://huggingface.co/datasets/openai/openai_humaneval
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
