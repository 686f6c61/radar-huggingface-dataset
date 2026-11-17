# shotaro-gond0/qwen3.5-0.8b-rag-sft001

## Resumen

El modelo `shotaro-gond0/qwen3.5-0.8b-rag-sft001` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario shotaro-gond0 en el contexto de un curso de LLM (LLM講座2 2026, trabajo final). El ajuste se realizó mediante LoRA con posterior fusión de los pesos adaptadores en el modelo original, por lo que la arquitectura resultante es idéntica a la del modelo base.

El objetivo del ajuste es especializar al modelo en la generación de respuestas cortas a partir de contextos de recuperación (RAG), es decir, respuestas extractivas o de formato breve condicionadas por pasajes de contexto. Para ello se emplearon datasets japoneses de control de calidad de lectura comprensiva y QA multi-salto (JSQuAD/JGLUE y JEMHopQA), reformateados para incluir resultados de búsqueda simulados como entrada.

El modelo es relevante como ejemplo de ajuste fino de bajo coste sobre un modelo pequeño (aproximadamente 873 millones de parámetros) orientado a tareas de RAG en japonés, con licencia Apache-2.0. Su tamaño reducido y su naturaleza especializada lo hacen adecuado para experimentación, prototipado y despliegue en entornos con recursos limitados, si bien su adopción en producción está condicionada por la falta de benchmarks publicados y su limitada base de usuarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B; estructura idéntica al modelo base) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el modelo base podría soportar cuantizaciones estándar, pero no se especifica) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 873 millones de parámetros. El autor indica explícitamente que la estructura del modelo resultante es idéntica a la del original, ya que el ajuste se realizó con LoRA y los adaptadores se fusionaron posteriormente en los pesos base. No se detalla en la información disponible si el modelo base emplea innovaciones como atención lineal, decodificación especulativa o mecanismos híbridos.

El entrenamiento consistió en un SFT de una sola época sobre 1.980 ejemplos, con tasa de aprendizaje 1e-4, acumulación de gradiente 8, rango LoRA 16, alpha 32, semilla 42 y etiquetas en formato de cadena (`use_string_labels: true`). Los datos provienen de JSQuAD/JGLUE (CC BY-SA 4.0, filtrado y reformateado) y JEMHopQA (CC BY-SA 4.0, reformateado), con repetición del conjunto JEM (`jem_repeat: 3`). Además, se incluyeron fragmentos de Wikipedia japonesa (CC BY-SA 4.0) como resultados de búsqueda en las entradas de entrenamiento. No se menciona el uso de RLHF o DPO.

## Capacidades

- Generación de respuestas cortas condicionadas por contexto de recuperación (RAG), en formato de respuesta breve.
- Comprensión lectora en japonés sobre pasajes de contexto, incluyendo preguntas de tipo extractivo (JSQuAD).
- QA multi-salto en japonés (JEMHopQA), con razonamiento sobre varias entidades o pasos.
- Generación de texto en japonés como capacidad heredada del modelo base.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso más allá del implícito en JEMHopQA.
- No se dispone de información sobre capacidades de visión, audio o modo de pensamiento (thinking mode).
- Capacidades multilingües limitadas al japonés según la model card; no se documentan otros idiomas.

## Casos de uso

- Respuesta a preguntas sobre documentación interna en japonés: el modelo puede recibir un fragmento de contexto recuperado y generar una respuesta breve y directa, adecuado por su ajuste específico en formato RAG y su bajo coste de inferencia.
- Sistemas de FAQ con recuperación aumentada: integrado en un pipeline RAG (recuperador + generador), el modelo produce respuestas concisas a partir de pasajes de Wikipedia o bases de conocimiento japonesas, reduciendo el riesgo de respuestas largas o divagatorias.
- Asistentes de atención al cliente en japonés con base de conocimiento: el modelo puede responder consultas concretas a partir de artículos de ayuda recuperados, aunque requiere validación humana por su tamaño reducido y riesgo de alucinación.
- Extracción de respuestas en pipelines de procesamiento documental: dado un documento y una pregunta, el modelo devuelve una respuesta corta, útil para tareas de extracción de campos o verificación de datos.
- QA multi-salto sobre grafos de conocimiento o documentación enlazada: su entrenamiento con JEMHopQA lo hace apto para preguntas que requieren combinar información de varios pasajes, siempre con contexto recuperado explícito.
- Prototipado e investigación en ajuste fino: por su licencia Apache-2.0, tamaño reducido y formato safetensors, sirve como base para experimentos académicos de SFT, LoRA y evaluación de RAG en japonés.
- Despliegue en entornos con recursos limitados: al tener menos de mil millones de parámetros, puede ejecutarse en GPUs de consumo para demos y pruebas de concepto, aunque no se documentan requisitos oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa por tamaño (873 M parámetros), en FP16 requeriría aproximadamente 1,7 GB solo para pesos, y en cuantización de 8 bits alrededor de 0,9 GB, pero estos cálculos no están confirmados por el autor.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado oficialmente; por su tamaño es plausible en GPUs de consumo con suficiente VRAM, pero no se dispone de datos del autor.
- Opciones de despliegue: no se documentan en la información disponible (vLLM, llama.cpp, Ollama, TGI, etc.). El formato safetensors permite su carga con bibliotecas estándar de Hugging Face Transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| shotaro-gond0/qwen3.5-0.8b-rag-sft001 | 873.438.784 | no disponible | ja | Apache-2.0 | Ajuste SFT para RAG en japonés; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible | no disponible | Apache-2.0 | Modelo base sin ajuste específico de RAG; referencia directa |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre otros modelos comparables en la búsqueda realizada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con datos de Wikipedia japonesa y JGLUE/JEMHopQA, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: presente como en cualquier modelo generativo; el ajuste a respuestas cortas no elimina la posibilidad de generar respuestas incorrectas o no sustentadas en el contexto.
- Limitaciones de contexto: la longitud de contexto no está especificada; el entrenamiento con pasajes de búsqueda sugiere dependencia de contextos relativamente cortos, pero no se confirma.
- Limitaciones de idioma: la model card declara únicamente japonés; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento (JSQuAD/JGLUE, JEMHopQA, Wikipedia japonesa) están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad para uso comercial.
- Caveats para producción: sin benchmarks publicados, sin documentación de requisitos de hardware y con solo 11 descargas y 0 likes, el modelo carece de validación externa; se recomienda evaluación propia antes de cualquier despliegue.
- El ajuste se realizó con una sola época y 1.980 ejemplos, lo que limita la generalización fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shotaro-gond0/qwen3.5-0.8b-rag-sft001
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
