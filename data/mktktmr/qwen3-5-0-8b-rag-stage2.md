# mktktmr/qwen3.5-0.8b-rag-stage2

## Resumen

`mktktmr/qwen3.5-0.8b-rag-stage2` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario mktktmr. Se trata de la "etapa 2" de un pipeline de entrenamiento orientado a tareas de generación aumentada por recuperación (RAG) en japonés, según se deduce del contenido de la model card. El modelo se ha obtenido mediante LoRA y posteriormente se ha fusionado (merged) en los pesos del modelo base, dando como resultado un checkpoint denso de 852.985.920 parámetros (aproximadamente 0,85 mil millones).

La relevancia de este modelo es limitada y muy específica: no es un lanzamiento oficial de Qwen ni cuenta con una model card detallada en inglés, benchmarks publicados ni documentación de licencia propia. Su interés radica en ser un ejemplo de especialización de un modelo pequeño (sub-1B) para RAG sobre corpus japoneses, lo que puede resultar útil para quienes trabajen con recuperación de documentos en ese idioma y quieran evaluar alternativas de bajo coste computacional.

Dado que el repositorio no incluye información sobre el pipeline, los idiomas soportados formalmente ni la licencia, esta ficha se limita a los datos verificables del repositorio y del modelo base declarado, indicando explícitamente "no disponible" en todo aquello que no se puede confirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3.5-0.8B; detalles de atención y capas no disponibles) |
| Parámetros totales | 852.985.920 (dato de safetensors) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no declarada en la model card) |
| Tipos de cuantización | No disponible (el repositorio contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible formalmente; el conjunto de entrenamiento es en japonés |
| Licencia | No disponible en el repositorio (el modelo base Qwen3.5-0.8B se declara Apache-2.0 en la model card) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 1,7 GB |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Método de ajuste | LoRA fusionado en los pesos del modelo base |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros. No se dispone de información detallada sobre el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto nativa, ya que la model card no los especifica y el repositorio no incluye documentación adicional.

El entrenamiento consistió en un ajuste fino con LoRA sobre el modelo base, seguido de la fusión de los adaptadores en los pesos principales. Los datos de entrenamiento declarados son cuatro conjuntos en japonés: JEMHopQA (preguntas de razonamiento multi-hop), NIILC QA (preguntas y respuestas), JSQuAD/JGLUE (comprensión lectora extractiva) y un conjunto de chunks derivados de Wikipedia japonesa. Todos ellos se filtran y reformatean para el entrenamiento, y se distribuyen bajo licencia CC BY-SA 4.0. No se indica el número de tokens de entrenamiento, la composición exacta de la mezcla, ni si se aplicaron técnicas de RLHF o DPO. El nombre del modelo ("rag-stage2") sugiere una segunda fase de un pipeline orientado a RAG, pero no se detalla en qué consiste dicha fase ni qué se entrenó en la etapa 1.

## Capacidades

- Generación de texto en japonés, presumiblemente orientada a respuestas basadas en contexto recuperado (RAG).
- Respuesta a preguntas (QA) sobre documentos, dado el uso de JEMHopQA, NIILC QA y JSQuAD en el entrenamiento.
- Razonamiento multi-hop en japonés, por la inclusión de JEMHopQA.
- Comprensión lectora extractiva en japonés, por la inclusión de JSQuAD.
- Capacidades heredadas del modelo base Qwen3.5-0.8B (no verificadas en este checkpoint): no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el entrenamiento con JEMHopQA sugiere cierta capacidad de multi-hop, pero no se documenta como capacidad de agente).
- Capacidades multilingües: no disponible formalmente; el entrenamiento es exclusivamente en japonés.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Respuesta a preguntas sobre documentación interna en japonés: el modelo puede recibir un contexto recuperado (chunks de documentos) y generar una respuesta extractiva o abstractiva, aprovechando su entrenamiento con JSQuAD y NIILC QA. Es adecuado por su bajo coste computacional y su especialización en QA japonesa.
- Sistemas RAG de bajo presupuesto: al tener menos de 1B de parámetros, puede desplegarse en una sola GPU de consumo o incluso en CPU con cuantización, lo que lo hace viable para prototipos y entornos con recursos limitados.
- Extracción de respuestas multi-hop en japonés: para preguntas que requieren combinar información de varios pasajes, el entrenamiento con JEMHopQA le otorga cierta ventaja frente a un modelo base no ajustado en esta tarea.
- Asistente de consulta sobre Wikipedia japonesa: dado que parte del entrenamiento usa chunks de Wikipedia japonesa, puede emplearse para responder preguntas factuales sobre ese corpus, siempre con verificación humana.
- Filtrado y reformateo de pares pregunta-respuesta: puede utilizarse como componente en pipelines de curación de datos japoneses, generando respuestas candidatas que luego se revisan.
- Evaluación comparativa de estrategias de fine-tuning para RAG: al ser un checkpoint reproducible (LoRA fusionado sobre un base público), sirve como referencia en experimentos académicos sobre adaptación de modelos pequeños a dominios japoneses.
- Despliegue en entornos edge o embebidos: por su tamaño (1,7 GB en safetensors, menos con cuantización), es candidato para inferencia local en dispositivos con recursos moderados, aunque no se documentan latencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 3 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos, más overhead; en 4 bits, aproximadamente 0,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (por ejemplo, RTX 3050, RTX 4060, T4); para cuantización 4/8 bits, GPUs integradas o incluso CPU son viables.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs de portátil con 4-6 GB de VRAM.
- Opciones de despliegue: no se documentan oficialmente. Al ser un modelo denso estándar en safetensors, es compatible en principio con transformers, vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión), aunque no hay confirmación del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-rag-stage2 | 852.985.920 | No disponible | No disponible | Hugging Face (0 descargas) | Ajuste LoRA fusionado sobre Qwen3.5-0.8B, entrenado en QA japonesa |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible en esta ficha | Apache-2.0 (según model card) | Hugging Face (modelo base) | Modelo generalista sin ajuste específico para RAG japonés |
| Qwen2.5-0.5B / 1.5B (generación previa) | 0,5B / 1,5B | 32K (según documentación pública de Qwen2.5) | Apache-2.0 | Hugging Face | Alternativas generalistas de tamaño similar; no especializadas en japonés ni en RAG |
| Modelos QA japoneses pequeños (p. ej., ajustes sobre llm-jp o Rinna) | Variable (0,1B-1B) | Variable | Variable | Hugging Face | No se dispone de comparación directa verificable con este checkpoint |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia del checkpoint no está declarada en el repositorio; aunque el modelo base se indica como Apache-2.0, la fusión con datos CC BY-SA 4.0 puede imponer obligaciones de atribución y compartir-al-igual sobre el modelo derivado. Es imprescindible aclarar esto antes de cualquier uso comercial.
- El entrenamiento se realizó exclusivamente con datos en japonés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación: como todo modelo generativo de menos de 1B de parámetros, tiende a inventar respuestas cuando el contexto recuperado es insuficiente o ambiguo.
- No se documentan sesgos conocidos, pero los corpus de origen (Wikipedia japonesa, JEMHopQA, NIILC QA, JSQuAD) pueden introducir sesgos culturales y factuales propios de esas fuentes.
- Longitud de contexto no declarada: no se puede garantizar el comportamiento con contextos largos, lo que es crítico en RAG.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha (2026-11-09), lo que sugiere que no ha sido validado por la comunidad.
- No hay información sobre el pipeline de inferencia ni sobre el tokenizador o la plantilla de chat esperada; usarlo requerirá inspeccionar los archivos del repositorio.
- El nombre "stage2" implica una etapa previa no documentada; no se puede asumir que el checkpoint sea autosuficiente sin conocer el pipeline completo.
- No se han publicado evaluaciones independientes; cualquier uso en producción debe acompañarse de una evaluación propia sobre el dominio objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-rag-stage2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
