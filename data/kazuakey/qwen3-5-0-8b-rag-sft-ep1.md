# kazuakey/qwen3.5-0.8b-rag-sft-ep1

## Resumen

Qwen3.5-0.8B RAG SFT (epoch 1) es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario kazuakey en Hugging Face. Se trata de un checkpoint de la primera época de un entrenamiento LoRA posteriormente fusionado (merged) en la arquitectura original, orientado a una tarea muy concreta: responder preguntas en japonés sobre la Wikipedia japonesa a partir de tres pasajes recuperados, devolviendo la salida en formato JSON con los campos `answer` y `chunk_id`. El modelo se presenta explícitamente como un trabajo de curso (course assignment), no como un modelo de propósito general.

Con 852.985.920 parámetros reales según los pesos en safetensors, es un modelo de escala sub-1B pensado para entornos con recursos limitados. Su relevancia es acotada: sirve como ejemplo reproducible de un pipeline RAG de extremo a extremo (recuperación, generación estructurada y citación de la fuente mediante `chunk_id`) sobre un modelo pequeño, y como referencia para quien quiera estudiar ajustes finos de bajo coste con LoRA fusionado.

No se dispone de información publicada sobre la longitud de contexto, los idiomas soportados formalmente, los tipos de cuantización probados ni resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su card es mínima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B; familia `qwen3_5`) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponibles (el ajuste fino está orientado a japonés) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen3.5, y aplica un ajuste fino supervisado mediante LoRA que después se fusiona en los pesos base, de modo que el artefacto publicado conserva la arquitectura original y no requiere cargar adaptadores por separado. El checkpoint corresponde a la época 1 del entrenamiento.

Los datos de entrenamiento declarados por el autor son JaQuAD (Japanese Question Answering Dataset), publicado por Skelter Labs bajo licencia CC BY-SA 3.0. La tarea de entrenamiento es de tipo RAG extractivo-generativo: se proporcionan tres pasajes recuperados junto con una pregunta, y el modelo debe emitir un objeto JSON con la respuesta y el identificador del fragmento (`chunk_id`) del que procede. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; tampoco se documentan innovaciones técnicas adicionales más allá de la fusión del LoRA.

## Capacidades

- Generación de respuestas a preguntas en japonés condicionadas a contexto recuperado (tres pasajes como entrada).
- Salida estructurada en JSON con los campos `answer` y `chunk_id`, lo que facilita el parseo automático y la trazabilidad de la cita.
- Citación de la fuente a nivel de fragmento mediante `chunk_id`, útil para verificación y para interfaces que muestran la evidencia.
- Capacidades heredadas del modelo base Qwen3.5-0.8B (generación de texto general), aunque no han sido evaluadas ni documentadas en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles formalmente; el ajuste fino está centrado en japonés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Respuesta a preguntas sobre Wikipedia japonesa: el modelo recibe tres pasajes recuperados y una pregunta y devuelve la respuesta junto con el `chunk_id` del fragmento que la sustenta, lo que permite construir un sistema RAG con citas verificables.
- Prototipado de pipelines RAG de bajo coste: al tener menos de 1B de parámetros, puede desplegarse en una sola GPU de gama media o incluso en CPU con cuantización, lo que lo hace adecuado para pruebas de concepto y entornos docentes.
- Evaluación de estrategias de recuperación: como la salida incluye el `chunk_id` seleccionado, sirve para medir si el recuperador está aportando el pasaje correcto y para comparar configuraciones de retrieval.
- Generación de respuestas estructuradas para APIs: el formato JSON fijo simplifica la integración en servicios backend que necesitan respuestas parseables sin post-procesado complejo.
- Asistente de consulta documental interna en japonés: con un corpus adaptado al mismo esquema de tres pasajes, puede reutilizarse como base para búsqueda semántica con atribución de fuente en bases de conocimiento corporativas.
- Material didáctico y reproducción de experimentos: al estar documentados el modelo base, el dataset (JaQuAD) y la técnica (LoRA fusionado, época 1), es un caso reproducible para cursos de ajuste fino y RAG.
- Filtrado y anotación de QA sobre corpus japoneses: puede emplearse para pre-anotar pares pregunta-respuesta con referencia al fragmento, que luego se revisan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en fp16/bf16 los pesos ocupan aproximadamente 1,7 GB; en cuantización de 8 bits, en torno a 0,9 GB, y en 4 bits, alrededor de 0,5 GB. A ello hay que sumar la memoria del contexto y de activaciones, no cuantificada en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder alojar los pesos en cuantización de 4-8 bits, aunque no hay datos oficiales de compatibilidad.
- ¿Cabe en GPU de consumo? Por el número de parámetros, es plausible en tarjetas de consumo con 8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090), pero no se ha verificado ni documentado por el autor.
- Opciones de despliegue: no disponible en la información proporcionada; los pesos están en safetensors, por lo que sería necesario convertirlos a GGUF para llama.cpp u Ollama, o cargarlos con frameworks compatibles con la arquitectura Qwen3.5 (por ejemplo, transformers o vLLM), sin que se documente soporte explícito.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| kazuakey/qwen3.5-0.8b-rag-sft-ep1 | 852.985.920 | no disponible | CC BY-SA 4.0 | SFT para RAG en japonés (JaQuAD) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible en esta ficha | no disponible | según card del modelo base | Modelo generalista | Hugging Face (referenciado) |
| Alternativas de tamaño similar (por ejemplo, Qwen2.5-0.5B/1.5B) | no disponible | no disponible | no disponible | Modelos generalistas | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- Modelo de tarea única: está ajustado para responder preguntas con tres pasajes de contexto y devolver JSON con `answer` y `chunk_id`; fuera de ese formato su comportamiento no está garantizado.
- Entrenamiento de una sola época: el checkpoint corresponde a la época 1, sin información sobre convergencia, sobreajuste o calidad final.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas no sustentadas en los pasajes recuperados, incluso emitiendo un `chunk_id` que no corresponda realmente a la evidencia.
- Idiomas: el ajuste fino está orientado al japonés; el rendimiento en castellano u otros idiomas no está documentado.
- Sesgos: no se documentan sesgos conocidos, pero el dataset JaQuAD y la Wikipedia japonesa pueden introducir sesgos de cobertura y de dominio que no han sido analizados por el autor.
- Licencia CC BY-SA 4.0: impone atribución y compartir igual (share-alike) para obras derivadas, lo que puede condicionar el uso comercial y la distribución de productos que lo integren. Además, el dataset JaQuAD es CC BY-SA 3.0, lo que conviene verificar en cuanto a obligaciones de atribución.
- Procedencia: es un trabajo de curso con 0 descargas y 0 likes, sin pipeline declarado ni evaluación publicada; no debe tratarse como un modelo listo para producción sin validación propia.
- Contexto y cuantizaciones: al no documentarse la longitud de contexto ni las cuantizaciones probadas, el rendimiento en ventanas largas o en formatos comprimidos es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kazuakey/qwen3.5-0.8b-rag-sft-ep1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JaQuAD (GitHub): https://github.com/SkelterLabsInc/JaQuAD
- Licencia del dataset JaQuAD (CC BY-SA 3.0): https://creativecommons.org/licenses/by-sa/3.0/
- Licencia del modelo (CC BY-SA 4.0): https://creativecommons.org/licenses/by-sa/4.0/
