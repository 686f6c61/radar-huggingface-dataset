# mktktmr/qwen3.5-0.8b-rag-stage3

## Resumen

`mktktmr/qwen3.5-0.8b-rag-stage3` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3.5-0.8B` publicado por el usuario mktktmr. Se trata de un modelo derivado mediante LoRA que posteriormente se ha fusionado con los pesos del modelo original, dando como resultado un checkpoint completo de aproximadamente 853 millones de parametros en formato safetensors. La model card original esta redactada en japones y describe el modelo como la "etapa 3" de un proceso de entrenamiento orientado a tareas de generacion aumentada por recuperacion (RAG) en japones.

El modelo esta especializado en responder preguntas a partir de contexto recuperado, entrenado con conjuntos de datos japoneses de control de calidad y comprension lectora: JEMHopQA, NIILC QA y JSQuAD (JGLUE), ademas de fragmentos de Wikipedia en japones. La particularidad de esta etapa 3, segun la model card, es que se ha entrenado sin ejemplos de "no puedo responder", lo que implica que el modelo siempre intenta generar una respuesta aunque el contexto no la contenga.

Es relevante como ejemplo de adaptacion de un modelo pequeno (sub-1B) a un dominio linguistico y una tarea concreta (RAG en japones) mediante LoRA fusionado, lo que permite desplegarlo con los mismos requisitos que el modelo base. No obstante, la ausencia de licencia declarada, de idiomas especificados en los metadatos y de benchmarks publicados limita seriamente su evaluacion para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B, tag `qwen3_5`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar al derivar de Qwen3.5-0.8B) |
| Idiomas soportados | no disponibles en metadatos; el entrenamiento y la model card estan en japones |
| Licencia | no disponible (el modelo base Qwen3.5-0.8B se declara Apache-2.0 en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer `Qwen3.5-0.8B` del que deriva. Sobre esa base se aplico un ajuste fino con LoRA que posteriormente se fusiono en los pesos del modelo, de modo que el checkpoint publicado es un modelo denso completo de ~853M de parametros, no un adaptador separado. No se especifican en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros del LoRA ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Los datos de entrenamiento declarados son tres conjuntos japoneses con licencia CC BY-SA 4.0: JEMHopQA (preguntas multi-salto), NIILC QA (preguntas y respuestas) y JSQuAD de JGLUE (comprension lectora extractiva), complementados con fragmentos derivados de Wikipedia en japones. Todos ellos fueron filtrados y reformateados para el entrenamiento. La innovacion declarada es la eliminacion de ejemplos de abstención ("no puedo responder") en esta etapa 3, lo que orienta el comportamiento del modelo hacia la generacion de respuestas siempre que sea posible.

## Capacidades

- Generacion de texto y respuesta a preguntas en japones, especialmente en formato RAG (pregunta + contexto recuperado).
- Comprension lectora extractiva y razonamiento multi-salto, derivados del entrenamiento con JSQuAD y JEMHopQA.
- Respuesta condicionada a contexto: el modelo esta disenado para producir una respuesta a partir de fragmentos de Wikipedia y documentos recuperados.
- Capacidades heredadas del base Qwen3.5-0.8B (generacion general, posible soporte multilingue), aunque no se documentan explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Sistemas de pregunta-respuesta sobre documentacion en japones: el modelo puede recibir un contexto recuperado (por ejemplo, fragmentos de Wikipedia o manuales) y generar una respuesta directa, aprovechando su entrenamiento especifico en RAG con datos japoneses.
- Asistentes de atencion al ciudadano en japones: adecuado para responder consultas sobre normativa o servicios a partir de bases documentales recuperadas, con la salvedad de que no se abstiene cuando falta informacion.
- Busqueda aumentada en bases de conocimiento internas: integrado en un pipeline RAG (retriever + generador) para resumir y responder preguntas sobre corpus japoneses.
- Prototipado rapido en entornos con recursos limitados: al tener menos de 1B de parametros, puede ejecutarse en GPU de consumo y facilita iteraciones de desarrollo sin infraestructura dedicada.
- Educacion y tutoria automatizada en japones: generacion de respuestas explicativas a partir de material de estudio recuperado, con contexto controlado por el sistema.
- Evaluacion de pipelines RAG: util como generador de referencia en experimentos academicos sobre recuperacion y generacion en japones, dado su entrenamiento especifico en la tarea.
- Filtrado y anotacion de pares pregunta-respuesta: puede generar respuestas candidatas sobre corpus japoneses para su posterior revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 3 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM; tambien es viable en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers (PyTorch), vLLM, llama.cpp, Ollama o TGI, siempre que se conviertan o descarguen pesos en el formato adecuado (el repo solo publica safetensors).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-rag-stage3 | 852.985.920 | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | no disponible | Apache-2.0 (segun model card) | Hugging Face |
| Otros ajustes RAG japoneses de tamano similar | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas de la misma categoria no esta disponible en la informacion proporcionada. El referente mas claro es el propio modelo base Qwen3.5-0.8B, del que este checkpoint hereda arquitectura y tamano, con la diferencia de la especializacion en RAG japones y la fusion del LoRA.

## Limitaciones y advertencias

- Ausencia de licencia declarada en los metadatos: no se puede confirmar si el uso comercial esta permitido, aunque el modelo base se declara Apache-2.0 en la model card. Es imprescindible verificar la licencia antes de cualquier uso en produccion.
- El entrenamiento elimina ejemplos de "no puedo responder", por lo que el modelo tiende a generar una respuesta incluso cuando el contexto no la contiene, aumentando el riesgo de alucinacion en sistemas RAG.
- Los datos de entrenamiento tienen licencia CC BY-SA 4.0 (JEMHopQA, NIILC QA, JSQuAD, fragmentos de Wikipedia), lo que puede imponer obligaciones de atribucion y compartir igual sobre obras derivadas.
- Especializacion muy centrada en japones: el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Modelo de muy pequeno tamano (~0,8B): capacidad limitada de razonamiento complejo, matemticas avanzadas o generacion de codigo en comparacion con modelos de mayor escala.
- Sin benchmarks publicados ni descargas registradas: no hay evidencia empirica de calidad ni validacion por parte de la comunidad.
- Sin informacion sobre sesgos, datos de alineacion o evaluaciones de seguridad.
- La model card esta en japones y no documenta hiperparametros, contexto maximo ni procedimiento de entrenamiento detallado, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-rag-stage3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JGLUE / JSQuAD: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
