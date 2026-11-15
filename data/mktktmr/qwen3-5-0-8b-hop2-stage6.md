# mktktmr/qwen3.5-0.8b-hop2-stage6

## Resumen

mktktmr/qwen3.5-0.8b-hop2-stage6 es un ajuste fino mediante LoRA (fusionado posteriormente en los pesos base) del modelo Qwen/Qwen3.5-0.8B, publicado por el usuario mktktmr en Hugging Face. El modelo está especializado en una tarea muy concreta dentro de pipelines de recuperación multi-salto (multi-hop QA): dado un par formado por una pregunta y los documentos ya recuperados, debe seleccionar un único nombre propio o entidad que constituya el siguiente término de búsqueda. Es, por tanto, un componente de enrutamiento de consultas, no un modelo de propósito general.

La relevancia del modelo es acotada y experimental: se trata de la "etapa 6" de un pipeline de búsqueda iterativa en japonés, entrenado sobre el corpus JEMHopQA y sobre fragmentos de Wikipedia en japonés. Con 852.985.920 parámetros reales (según los pesos en safetensors) y un repositorio de 1,7 GB, está pensado para ejecutarse en hardware modesto y para integrarse como paso intermedio en un sistema RAG con múltiples saltos.

No dispone de descargas ni de interacciones en el momento de la consulta, no declara licencia propia y no publica idiomas soportados, benchmarks ni pipeline. La información disponible se limita a la model card del autor, escrita en japonés, y a los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B); no se detalla en la informacion disponible |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible oficialmente; el entrenamiento y los datos son en japones |
| Licencia | no disponible en el repositorio; el modelo base Qwen/Qwen3.5-0.8B se declara Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA, cuyos adaptadores se fusionaron posteriormente en los pesos del modelo ("本体にマージしたもの", es decir, fusionado en el cuerpo del modelo). No se especifican en la información disponible el rango del LoRA, la tasa de aprendizaje, el número de pasos ni la composición exacta del dataset más allá de las fuentes citadas.

Los datos de entrenamiento declarados son dos: por un lado, JEMHopQA (licencia CC BY-SA 4.0), filtrado y reformateado para la tarea; por otro, un conjunto de fragmentos distribuidos derivados de Wikipedia en japonés (CC BY-SA 4.0) a partir de los cuales se sintetizaron preguntas de dos saltos utilizando el propio Qwen/Qwen3.5-0.8B. La tarea de entrenamiento es de selección: extraer de la pregunta y del material recuperado un único nombre propio que sirva como siguiente consulta de búsqueda. No se menciona RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Selección de términos de búsqueda en pipelines multi-hop: dado un par pregunta + documentos recuperados, devuelve una entidad (nombre propio) para la siguiente consulta.
- Razonamiento de dos saltos sobre contexto recuperado, orientado a QA sobre Wikipedia en japonés.
- Comprensión lectora en japonés limitada al dominio de los datos de entrenamiento (JEMHopQA y fragmentos de Wikipedia).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes autónomos ni de razonamiento multi-paso general más allá de la selección de la siguiente consulta.
- No se documentan capacidades multimodales (visión, audio), modo "thinking" ni generación de código.
- Capacidad multilingüe: no declarada; el uso previsto es en japonés.

## Casos de uso

- Recuperación multi-salto en japonés: el modelo actúa como selector del siguiente término de búsqueda tras una primera ronda de recuperación; encaja en pipelines RAG donde la pregunta requiere encadenar entidades (por ejemplo, "¿en qué ciudad nació el autor de X?").
- Enrutamiento de consultas en motores de búsqueda documental: a partir de los resultados ya obtenidos, genera una consulta de seguimiento concreta en lugar de reformular la pregunta completa, lo que reduce el ruido en la siguiente iteración.
- Construcción de grafos de conocimiento: al extraer entidades encadenadas de forma iterativa, puede alimentar la generación de relaciones entre nodos a partir de textos de Wikipedia.
- Investigación académica sobre QA multi-hop: sirve como componente reproducible y ligero para estudiar el efecto de la selección de términos intermedios en la precisión final de un sistema de recuperación.
- Prototipado de asistentes documentales en japonés: al caber en hardware de consumo, permite iterar rápidamente sobre la lógica de recuperación sin depender de modelos grandes.
- Filtrado y desambiguación de entidades: dado un contexto recuperado, selecciona la entidad relevante para la siguiente fase, descartando candidatos irrelevantes antes de una búsqueda costosa.
- Evaluación de pipelines de búsqueda iterativa: como etapa 6 de una cadena experimental, permite medir de forma aislada la contribución de la selección de consultas al rendimiento global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 2-3 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9-1,2 GB para pesos; en 4 bits, alrededor de 0,5-0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU de consumo: GTX 1650 (4 GB), RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: transformers con safetensors; llama.cpp u Ollama requerirían conversión a GGUF, no publicada en el repositorio; vLLM y TGI son viables si se sirve el modelo en BF16.
- Latencia y throughput: no disponibles; por el tamaño (0,85 B de parámetros) se espera una latencia de decodificación de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-hop2-stage6 | 852.985.920 | no disponible | Selección de término de búsqueda (multi-hop, japonés) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Generación general | Apache-2.0 | Hugging Face |
| Otros ajustes de Qwen3.5-0.8B para QA | no disponible | no disponible | Variable | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la tarea de selección del siguiente término de búsqueda en japonés, su comportamiento no está validado y probablemente degrade respecto al modelo base.
- Entrenado exclusivamente con datos en japonés (JEMHopQA y Wikipedia japonesa); no se garantiza un funcionamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación: al tratarse de un modelo pequeño ajustado para extraer entidades, puede inventar nombres propios plausibles que no aparezcan en el contexto recuperado.
- Sesgos: los derivados de Wikipedia y de JEMHopQA, con posible sobrerrepresentación de entidades y temas presentes en esos corpus.
- Licencia no declarada en el repositorio: antes de un uso comercial es necesario verificar los términos, teniendo en cuenta que el modelo base es Apache-2.0 pero los datos de entrenamiento incluyen material CC BY-SA 4.0 (JEMHopQA y Wikipedia), lo que puede imponer obligaciones de atribución y compartir igual.
- Los datos sintéticos de preguntas se generaron con el propio modelo base, lo que puede introducir sesgos y errores heredados en el conjunto de entrenamiento.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad ni de reproducibilidad.
- No se documentan límites de contexto ni comportamiento con entradas largas; conviene truncar el contexto recuperado a longitudes conservadoras.
- Uso previsto como componente de un pipeline, no como asistente conversacional autónomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-hop2-stage6
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio JEMHopQA: https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
