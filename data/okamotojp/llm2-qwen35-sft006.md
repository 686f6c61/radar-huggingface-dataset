# OkamotoJP/llm2-qwen35-sft006

## Resumen

`OkamotoJP/llm2-qwen35-sft006` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP. Se trata de un modelo derivado orientado especificamente a la generacion de respuestas en tareas de RAG (retrieval-augmented generation) en japones, entrenado como parte del proyecto final del curso "LLM講座2 2026". El modelo conserva la estructura del original y solo actualiza los pesos de la parte linguistica tras fusionar el adaptador LoRA con los pesos base.

Con 873.438.784 parametros (aproximadamente 0,87 mil millones), es un modelo de escala reducida pensado para despliegue ligero y tareas acotadas de generacion de respuestas condicionadas a contexto documental. Su relevancia actual es limitada: se trata de un experimento academico con muy poca difusion (6 descargas, 0 likes en el momento de la consulta) y sin documentacion de benchmarks ni de rendimiento.

La ficha se basa exclusivamente en la informacion disponible en Hugging Face y en la model card del autor. Cualquier dato no publicado se indica explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); solo se actualizan los pesos de la parte linguistica |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`), un transformer de aproximadamente 0,87 mil millones de parametros. Segun la model card, se aplico un ajuste fino con LoRA (r=16, alpha=32, learning rate 0,0001, 1 epoca) sobre 1.277 ejemplos, y posteriormente el adaptador se fusiono con los pesos originales. La estructura del modelo resultante es identica a la del base; solo cambian los pesos de la parte linguistica.

Los datos de entrenamiento proceden de tres fuentes: JEMHopQA (CC BY-SA 4.0), el dataset cl-nagoya/auto-wiki-qa (CC BY-SA 4.0) y un conjunto de chunks derivados de Wikipedia en japones (CC BY-SA 4.0), utilizados como material de contexto en los prompts de entrenamiento. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset tras el filtrado, ni si hubo etapas de RLHF o DPO. La innovacion tecnica destacable es precisamente el enfoque: entrenamiento orientado a respuesta generativa sobre contexto documental (RAG), no a conocimiento parametrico.

## Capacidades

- Generacion de texto en japones condicionada a contexto documental (el caso de uso declarado por el autor).
- Respuesta a preguntas de tipo multi-hop sobre documentos proporcionados en el prompt, segun el dataset JEMHopQA empleado en el entrenamiento.
- Generacion de respuestas a partir de chunks de Wikipedia en japones como material de referencia.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla de la respuesta directa.
- Capacidades multilingues: solo japones declarado; el rendimiento en otros idiomas no esta documentado.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Generacion de respuestas en pipelines RAG en japones: el modelo esta entrenado especificamente para recibir chunks documentales como contexto y producir una respuesta. Encaja en un sistema de recuperacion + generacion sobre corpus japones.
- Asistente de consulta sobre Wikipedia en japones: dado que parte del entrenamiento usa chunks derivados de Wikipedia japonesa, puede emplearse para responder preguntas sobre ese dominio con el contexto recuperado.
- Preguntas multi-hop en dominios acotados: el uso de JEMHopQA sugiere utilidad en preguntas que requieren combinar informacion de varias fuentes dentro del contexto proporcionado.
- Prototipado y experimentacion academica: con menos de mil millones de parametros, es adecuado para entornos docentes y pruebas de concepto de RAG sin grandes requisitos de infraestructura.
- Despliegue en entornos con recursos limitados: su tamano permite ejecucion en una unica GPU consumer, lo que facilita demos y validaciones rapidas.
- Base para nuevos ajustes finos: al ser Apache-2.0 y tener pesos en safetensors, puede servir como punto de partida para SFT adicional en tareas japonesas especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7-1,8 GB solo para pesos, mas overhead de activaciones y KV cache (no documentado).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9-1,0 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,5-0,6 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-8 GB de VRAM es suficiente para fp16; tarjetas como RTX 3060, RTX 4060 o superiores cubren el caso con holgura. No requiere A100 ni H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM en fp16.
- Opciones de despliegue: al publicarse solo en safetensors, el despliegue natural es mediante transformers, vLLM o TGI. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft006 | 873.438.784 | no disponible | ja | Apache-2.0 | SFT sobre Qwen3.5-0.8B para RAG en japones |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible | Apache-2.0 | Modelo base sin ajuste especifico de tarea |
| Alternativas de ~1B para japones | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparativa con modelos de la misma categoria no puede completarse con datos verificables a partir de la informacion disponible; se indica "no disponible" para evitar cifras no contrastadas.

## Limitaciones y advertencias

- Modelo de muy baja difusion (6 descargas, 0 likes en el momento de la consulta): no ha sido validado por la comunidad ni cuenta con evaluaciones independientes.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo base ni frente a alternativas.
- Entrenado con solo 1.277 ejemplos y 1 epoca: riesgo elevado de sobreajuste al formato y dominio de los datos de entrenamiento (RAG sobre Wikipedia japonesa y JEMHopQA).
- Riesgo de alucinacion: al ser un modelo pequeno y ajustado para responder sobre contexto, puede generar respuestas plausibles pero incorrectas cuando el contexto es insuficiente.
- Limitacion de idioma: solo se declara japones; el comportamiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Longitud de contexto no documentada: no se puede garantizar el manejo de contextos largos en produccion sin verificacion previa.
- Restricciones de licencia: el modelo es Apache-2.0, pero los datos de entrenamiento son CC BY-SA 4.0 (JEMHopQA, auto-wiki-qa y chunks de Wikipedia). Esto puede imponer obligaciones de atribucion y compartir-igual sobre obras derivadas; conviene revisar la compatibilidad antes de un uso comercial.
- No se documentan sesgos especificos, pero al derivar de un modelo base y de corpus japoneses puede heredar sesgos de esas fuentes.
- No apto para produccion sin evaluacion previa: carece de documentacion sobre robustez, seguridad o comportamiento fuera del dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft006
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
