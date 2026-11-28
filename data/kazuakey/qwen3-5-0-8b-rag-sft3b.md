# kazuakey/qwen3.5-0.8b-rag-sft3b

## Resumen

Qwen3.5-0.8B RAG SFT es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario kazuakey en Hugging Face. El modelo está especializado en una tarea muy concreta: responder preguntas en japones a partir de tres pasajes recuperados de Wikipedia en japones, devolviendo la respuesta junto con el identificador del fragmento que la sustenta en formato JSON. Se trata de un trabajo de asignatura de curso, no de un modelo de propósito general.

El ajuste se realizó mediante LoRA y posteriormente se fusionó (merged) de vuelta en la arquitectura original, de modo que los pesos publicados son los del modelo completo con 852.985.920 parámetros (aproximadamente 0,85 mil millones). El repositorio ocupa 3,2 GB y los pesos están en formato safetensors. El modelo base pertenece a la familia Qwen3.5, aunque la información disponible no detalla la arquitectura interna ni la longitud de contexto del modelo original.

Su relevancia es acotada: resulta útil como ejemplo reproducible de ajuste fino para tareas de generación aumentada por recuperación (RAG) con salida estructurada, y como punto de partida para quien quiera replicar el pipeline con otros idiomas o dominios. No obstante, al estar entrenado únicamente con datos de control de calidad de lectura en japonés y con cero descargas registradas, no debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles internos del base no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | japones (entrenamiento); cobertura multilingüe del base no disponible |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA del base Qwen/Qwen3.5-0.8B, con los adaptadores fusionados en los pesos finales. La tarea de entrenamiento es de generación condicionada: la entrada consta de tres pasajes recuperados y una pregunta, y la salida esperada es un objeto JSON con las claves `answer` y `chunk_id`. El pipeline de datos fue mecánico, con ventaneo de pasajes y selección de negativos duros mediante BM25.

Los datos de entrenamiento provienen exclusivamente de dos conjuntos de control de calidad de lectura en japonés: JaQuAD (licencia CC BY-SA 3.0 Unported) y JSQuAD, integrado en JGLUE (licencia CC BY-SA 4.0). No se documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de respuestas extractivas en japones a partir de pasajes de contexto proporcionados.
- Salida estructurada en JSON con las claves `answer` y `chunk_id`, lo que facilita su integración en pipelines programáticos.
- Selección del fragmento fuente (chunk) que sustenta la respuesta, una forma básica de atribución.
- Manejo de hasta tres pasajes recuperados por consulta en el formato de entrenamiento.
- Capacidades multilingües del modelo base: no documentadas en la información disponible.
- Tool calling, function calling, agentes y razonamiento multi-paso: no documentados; no deben asumirse.

## Casos de uso

- Prototipado de sistemas RAG en japones: el modelo puede recibir tres fragmentos de Wikipedia y una pregunta y devolver la respuesta con el identificador del fragmento, lo que permite construir un pipeline de recuperación-respuesta con atribución básica.
- Evaluación de pipelines de recuperación: al devolver el `chunk_id` utilizado, sirve para medir si el recuperador (por ejemplo, BM25) está seleccionando los pasajes correctos en tareas de control de calidad de lectura.
- Docencia y reproducción de experimentos: es un ejemplo completo y pequeño (0,85 mil millones de parámetros) de ajuste fino con LoRA para una tarea de salida estructurada, útil en cursos de NLP.
- Extracción de respuestas en dominios con documentación japonesa: con un recuperador adecuado, puede adaptarse a manuales técnicos o bases de conocimiento internas en japones, siempre que el formato de entrada sea similar al de entrenamiento.
- Generación de datos sintéticos para evaluación: las respuestas con `chunk_id` pueden usarse como referencia preliminar en la construcción de conjuntos de test de RAG.
- Despliegue en entornos con recursos limitados: con menos de mil millones de parámetros, cabe en GPU de consumo para experimentación, lo que facilita pruebas locales de pipelines RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): en torno a 1,7 GB solo para pesos, más overhead de activaciones y caché KV; el total depende de la longitud de contexto, que no está documentada.
- Cuantización a 8 bits: aproximadamente 0,9 GB de pesos; a 4 bits: aproximadamente 0,5 GB de pesos (estimaciones teóricas a partir del número de parámetros, no verificadas para este modelo).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para fp16 sin cuantizar, se recomienda 8 GB o más.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más, aunque no se han publicado mediciones específicas.
- Opciones de despliegue: al estar en safetensors, puede cargarse con transformers; para servir en producción se puede convertir a GGUF y usar llama.cpp u Ollama, o desplegar con vLLM o TGI si la arquitectura Qwen3.5 está soportada por esas herramientas (no confirmado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kazuakey/qwen3.5-0.8b-rag-sft3b | 852.985.920 | no disponible | cc-by-sa-4.0 | Ajuste SFT para RAG en japones con salida JSON |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la informacion | no disponible | según model card del base | Modelo generalista sin ajuste para RAG |
| Otros modelos de menos de 1B para RAG | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado exclusivamente para una tarea estrecha (RAG sobre Wikipedia en japones con tres pasajes); su comportamiento fuera de ese formato no está garantizado.
- Riesgo de alucinación: aunque el formato de salida incluye `chunk_id`, el modelo podría generar respuestas no sustentadas por los pasajes proporcionados; no se documenta ningún mecanismo de verificación.
- Idiomas: el entrenamiento es en japones; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia; además, los datos de entrenamiento (JaQuAD y JSQuAD) imponen sus propias condiciones de atribución y compartición.
- Es un trabajo de asignatura con cero descargas y sin validación externa; no hay benchmarks publicados ni evidencia de robustez en producción.
- No se documentan sesgos conocidos, pero al entrenarse con Wikipedia en japones puede heredar sesgos de cobertura y sesgos culturales de esa fuente.
- La longitud de contexto del modelo base no está disponible, lo que impide garantizar el manejo de pasajes largos.
- No se documentan capacidades de tool calling ni de agentes; no deben asumirse en integraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kazuakey/qwen3.5-0.8b-rag-sft3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- Licencia JaQuAD (CC BY-SA 3.0): https://creativecommons.org/licenses/by-sa/3.0/
- Dataset JGLUE (incluye JSQuAD): https://github.com/yahoojapan/JGLUE
- Licencia JGLUE (CC BY-SA 4.0): https://creativecommons.org/licenses/by-sa/4.0/
