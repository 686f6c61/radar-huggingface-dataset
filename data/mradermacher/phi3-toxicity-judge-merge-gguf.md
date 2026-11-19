# mradermacher/phi3-toxicity-judge-merge-GGUF

## Resumen

`mradermacher/phi3-toxicity-judge-merge-GGUF` es una coleccion de cuantizaciones GGUF del modelo `grounded-ai/phi3-toxicity-judge-merge`, un ajuste fino de la familia Phi-3 de Microsoft orientado a la evaluacion de toxicidad en texto. El modelo base fue entrenado por Grounded AI mediante SFT (supervised fine-tuning) con la libreria TRL, y este repositorio, publicado por mradermacher, ofrece los pesos convertidos a formato GGUF para su uso con llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.).

Con 3.821.079.552 parametros (aproximadamente 3.8 mil millones), el modelo se situa en la gama de Phi-3-mini, lo que lo hace viable en hardware de consumo. El repositorio incluye 12 variantes de cuantizacion, desde Q2_K (1.5 GB) hasta f16 (7.7 GB), lo que permite desplegarlo en escenarios que van desde GPUs modestas hasta CPUs.

La relevancia de este modelo radica en su proposito especifico: actuar como juez de toxicidad, una tarea cada vez mas demandada en pipelines de moderacion de contenido, evaluacion de calidad de datasets y sistemas de seguridad en produccion. Al estar disponible en GGUF, se puede integrar en flujos de inferencia local sin dependencia de APIs externas, lo que resulta util para procesamiento por lotes a gran escala o entornos con requisitos de privacidad. La licencia MIT facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3, segun el modelo base) |
| Parametros totales | 3.821.079.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Phi-3-mini soporta 4K/128K, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `grounded-ai/phi3-toxicity-judge-merge` se construye sobre la arquitectura Phi-3 de Microsoft, un transformer decoder-only con atencion por ventanas deslizantes en algunas capas (segun la especificacion original de Phi-3-mini). El ajuste se realizo mediante SFT (supervised fine-tuning) usando la libreria TRL, segun los tags del repositorio (`trl`, `sft`, `generated_from_trainer`). No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO adicionales.

El nombre "toxicity-judge-merge" sugiere que el modelo fue disenado para actuar como evaluador de toxicidad, probablemente entrenado para clasificar o puntuar contenido toxico en conversaciones o textos. No se especifica si se trata de una fusion de modelos (model merge) o si "merge" hace referencia a otra tecnica; la model card no aporta detalles sobre el proceso. La cuantizacion la realiza mradermacher con su pipeline habitual, usando cuantizaciones estaticas (no se ofrecen variantes imatrix/weighted en el momento de la publicacion, segun indica la propia model card).

## Capacidades

- Evaluacion de toxicidad: el modelo esta especializado en juzgar o puntuar la toxicidad de textos, probablemente en formato conversacional (tag `conversational`).
- Generacion de texto en ingles: al ser un ajuste de Phi-3, conserva capacidades generales de generacion, aunque el fine-tuning lo orienta a la tarea de evaluacion.
- Formato conversacional: soporta interacciones multi-turno segun el tag `conversational`.
- Inferencia local: al estar en GGUF, es compatible con llama.cpp y derivados, permitiendo ejecucion en CPU y GPU.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Moderacion de contenido en foros y comunidades: el modelo puede evaluar mensajes de usuarios y asignar una puntuacion de toxicidad, permitiendo a los sistemas de moderacion priorizar revision humana o aplicar filtros automaticos. Su tamano de 3.8B permite procesar lotes grandes en hardware modesto.
- Filtrado de datasets de entrenamiento: antes de usar un corpus para entrenar otros modelos, se puede pasar cada muestra por este juez de toxicidad para eliminar contenido danino, mejorando la calidad y seguridad del dataset final.
- Evaluacion de respuestas de chatbots: en un pipeline de control de calidad, el modelo puede actuar como juez automatico para detectar si las respuestas de un asistente contienen lenguaje toxico u ofensivo antes de mostrarlas al usuario.
- Analisis de comentarios en redes sociales: procesamiento por lotes de comentarios para identificar discurso de odio o toxicidad, con la ventaja de que el GGUF permite ejecucion local sin enviar datos a APIs externas.
- Investigacion en NLP sobre toxicidad: investigadores pueden usar el modelo como baseline o componente en estudios sobre deteccion de toxicidad, gracias a su licencia MIT y facilidad de despliegue.
- Sistemas de seguridad en produccion con requisitos de privacidad: al poder ejecutarse en local (incluso en CPU con cuantizaciones Q4), es adecuado para entornos donde los datos no pueden salir de la infraestructura propia.
- Pre-filtrado en pipelines de anotacion humana: el modelo puede clasificar grandes volumenes de texto y enviar solo los casos dudosos a anotadores humanos, reduciendo costes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1.5 GB
  - Q3_K_M: ~2.1 GB
  - Q4_K_M: ~2.5 GB
  - Q5_K_M: ~2.9 GB
  - Q6_K: ~3.2 GB
  - Q8_0: ~4.2 GB
  - f16: ~7.7 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060/4060 o superiores para Q4_K_M con contexto moderado; RTX 4090/A100/H100 no son necesarias pero permiten mayor throughput y contexto.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna (GTX 1060 6GB en adelante) puede ejecutar las cuantizaciones Q4. Las variantes Q2/Q3 caben incluso en iGPUs con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Tambien es posible usar los pesos originales en safetensors con transformers + vLLM o TGI (no incluidos en este repo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia orientativa para un modelo de 3.8B en Q4_K_M, en una RTX 4090 se pueden esperar decenas de tokens por segundo, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| phi3-toxicity-judge-merge (este) | 3.8B | no disponible | MIT | GGUF, safetensors | Especializado en toxicidad, basado en Phi-3 |
| Phi-3-mini (Microsoft) | 3.8B | 4K/128K | MIT | safetensors, GGUF | Modelo generalista base; no especializado en toxicidad |
| Llama Guard (Meta) | 7B/8B | 4K-8K | Llama license | safetensors | Especializado en moderacion, pero mayor tamano y licencia mas restrictiva |
| Toxic-comment classifiers (BERT-based) | 100M-1B | 512 | variable | safetensors | Menores y mas rapidos, pero menor capacidad de razonamiento |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`); su rendimiento en otros idiomas, incluido el castellano, no esta garantizado.
- No se dispone de informacion sobre sesgos especificos, pero al ser un ajuste sobre Phi-3 entrenado con datos de toxicidad, puede heredar sesgos de genero, raza o religion presentes en los datos de entrenamiento.
- Riesgo de alucinacion: como todo modelo generativo, puede producir evaluaciones inconsistentes o justificaciones inventadas si se le pide explicar su puntuacion.
- La longitud de contexto no se confirma en la informacion; si el modelo base mantiene 4K tokens, textos largos requeriran truncamiento.
- Aunque la licencia es MIT (permisiva para uso comercial), el modelo base podria tener terminos adicionales; se recomienda verificar la licencia de `grounded-ai/phi3-toxicity-judge-merge`.
- No se ofrecen cuantizaciones imatrix/weighted, lo que puede reducir la calidad en cuantizaciones bajas (Q2, Q3) en comparacion con alternativas.
- El modelo es un "juez" especializado: no se recomienda usarlo como generador generalista, ya que su fine-tuning puede degradar capacidades generales.
- No hay benchmarks publicados que validen su calidad como clasificador de toxicidad; se recomienda evaluacion propia antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/phi3-toxicity-judge-merge-GGUF
- Modelo base: https://huggingface.co/grounded-ai/phi3-toxicity-judge-merge
- Pagina de descargas del autor: https://hf.tst.eu/model#phi3-toxicity-judge-merge-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
