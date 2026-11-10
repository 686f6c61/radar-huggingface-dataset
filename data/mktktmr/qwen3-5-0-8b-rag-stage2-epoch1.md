# mktktmr/qwen3.5-0.8b-rag-stage2-epoch1

## Resumen

mktktmr/qwen3.5-0.8b-rag-stage2-epoch1 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario mktktmr y publicado en Hugging Face. Se trata de la primera época (epoch 1) de la "etapa 2" de un pipeline de entrenamiento orientado a tareas de generación aumentada por recuperación (RAG), según indica el nombre del repositorio. El modelo se ha obtenido mediante LoRA y posteriormente se han fusionado los pesos en el modelo base, dando como resultado un checkpoint denso de aproximadamente 853 millones de parámetros.

El modelo está especializado en el dominio del japonés: todos los conjuntos de datos de entrenamiento declarados son corpus japoneses de pregunta-respuesta y comprensión lectora (JEMHopQA, NIILC QA, JSQuAD/JGLUE) junto con fragmentos de Wikipedia en japonés. Esto lo posiciona como un modelo de nicho para tareas de QA sobre contexto recuperado en japonés, más que como un modelo de propósito general.

La relevancia de esta ficha es limitada pero concreta: se trata de un checkpoint experimental de un autor independiente, sin métricas publicadas, sin licencia declarada en el repositorio y con cero descargas en el momento de la consulta. Resulta útil como referencia para quienes exploren ajustes finos pequeños sobre la familia Qwen3.5 para RAG en japonés, pero no debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 852.985.920 (≈0,85 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se declaran versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible oficialmente; el entrenamiento se realizó exclusivamente con corpus en japonés |
| Licencia | No disponible en el repositorio (el modelo base Qwen/Qwen3.5-0.8B se declara Apache-2.0 según la model card) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Metodo de ajuste | LoRA fusionado en el modelo base |
| Tamano del repositorio | 1,7 GB |
| Fecha de creacion | 2026-11-09 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen. No se dispone de información detallada sobre el número de capas, dimensión oculta, número de cabezas de atención ni mecanismos específicos (atención lineal, decodificación especulativa, etc.) en la información proporcionada. El checkpoint publicado es un modelo denso de 852.985.920 parámetros, sin mezcla de expertos.

El entrenamiento consistió en un ajuste fino con LoRA sobre el modelo base, seguido de la fusión de los adaptadores en los pesos principales. Se trata de la primera época de una "etapa 2", lo que sugiere un pipeline de entrenamiento por fases (posiblemente con una etapa 1 previa no documentada en este repositorio). Los datos de entrenamiento declarados son: JEMHopQA (preguntas multihop en japonés), NIILC QA (preguntas y respuestas del NII), JSQuAD/JGLUE (comprensión lectora en japonés) y fragmentos de Wikipedia en japonés, todos ellos filtrados y reformateados para el entrenamiento. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan hiperparámetros del LoRA (rango, alpha, capas objetivo).

## Capacidades

- Generación de texto en japonés, con especial énfasis en respuestas basadas en contexto recuperado (RAG).
- Respuesta a preguntas de tipo extractivo y generativo sobre pasajes de Wikipedia en japonés y corpus de QA.
- Razonamiento multihop sobre preguntas que requieren combinar información de varias fuentes, gracias al entrenamiento con JEMHopQA.
- Comprensión lectora en japonés, derivada del ajuste con JSQuAD/JGLUE.
- Capacidad de seguir instrucciones en formato de pregunta-respuesta, según el reformateo de los datos de entrenamiento.
- Soporte de tool calling / function calling: no disponible (no se declara en la model card).
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible.
- Capacidades multilingües: no disponibles; el entrenamiento se limita al japonés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Sistemas de pregunta-respuesta sobre documentación interna en japonés: el modelo puede recibir un contexto recuperado (fragmentos de manuales, políticas o wikis) y generar una respuesta extractiva o sintetizada, aprovechando su ajuste específico sobre corpus de QA japoneses.
- Atención al cliente en japonés con RAG: integrado en un pipeline que recupere artículos de ayuda y pase los fragmentos al modelo para generar respuestas acotadas al contexto, reduciendo el riesgo de respuestas fuera de dominio.
- Búsqueda semántica con reranking generativo: el modelo puede utilizarse para reformular consultas o generar respuestas intermedias en un sistema de recuperación de dos etapas, dado su entrenamiento en preguntas multihop.
- Extracción de respuestas en bases de conocimiento japonesas: dado su ajuste con JSQuAD, es adecuado para tareas de lectura comprensiva sobre pasajes y extracción de la respuesta literal o parafraseada.
- Prototipado rápido en entornos con recursos limitados: con menos de mil millones de parámetros, puede ejecutarse en una única GPU de consumo para experimentación con RAG en japonés antes de escalar a modelos mayores.
- Evaluación comparativa de pipelines RAG: sirve como línea base ligera para medir el impacto de distintas estrategias de recuperación o de formateo de contexto en un modelo pequeño especializado.
- Generación de pares pregunta-respuesta sintéticos en japonés: puede emplearse para aumentar datasets de entrenamiento en dominios donde se disponga de corpus de contexto pero no de anotaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica de 3-4 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9-1,2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,5-0,7 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo (GTX 1660 6 GB en adelante con cuantización, RTX 3060 12 GB sin problemas en FP16).
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), Transformers con PyTorch. No se publican versiones GGUF en el repositorio, por lo que habría que generarlas.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 0,85B, se espera un throughput alto en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-rag-stage2-epoch1 | 0,85B | No disponible | No disponible | Hugging Face (0 descargas) | Ajuste fino LoRA fusionado, especializado en QA japonés |
| Qwen/Qwen3.5-0.8B | 0,8B (aprox.) | No disponible | Apache-2.0 (según model card) | Hugging Face | Modelo base sin ajuste; capacidades generales |
| Modelos QA japoneses de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría. La comparación más directa es con el modelo base Qwen/Qwen3.5-0.8B, del que este checkpoint deriva y sobre el que se aplicó el ajuste LoRA.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse exclusivamente con corpus japoneses de dominio público y académico, puede heredar sesgos presentes en Wikipedia y en los datasets JEMHopQA, NIILC QA y JSQuAD.
- Riesgo de alucinación: presente, como en cualquier modelo generativo de este tamaño; el ajuste para RAG no elimina la posibilidad de generar respuestas no sustentadas en el contexto.
- Limitaciones de contexto o idioma: el entrenamiento se limita al japonés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente. La longitud de contexto no está documentada.
- Restricciones de licencia para uso comercial: la licencia del repositorio no está declarada. El modelo base se declara Apache-2.0, pero los datasets de entrenamiento tienen licencia CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-al-igual sobre el modelo derivado. Es imprescindible aclarar la licencia antes de cualquier uso comercial.
- Caveat para producción: se trata de un checkpoint de una sola época de una etapa 2, sin métricas publicadas, sin evaluaciones de seguridad y con cero descargas; no hay evidencia de calidad ni de robustez. No se recomienda su uso en producción sin una evaluación exhaustiva propia.
- El repositorio no incluye información sobre el pipeline de entrenamiento completo, hiperparámetros ni datos de validación, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-rag-stage2-epoch1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
