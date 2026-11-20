# Ed26d/Qwen3-1.7B

## Resumen

Qwen3-1.7B es un modelo de lenguaje causal denso de 1.700 millones de parametros perteneciente a la familia Qwen3, desarrollada por el equipo Qwen de Alibaba. El repositorio `Ed26d/Qwen3-1.7B` es una publicacion derivada del modelo oficial `Qwen/Qwen3-1.7B-Base`, con licencia Apache 2.0 y formato de pesos safetensors compatible con `transformers`. El modelo esta disenado para generacion de texto, dialogo conversacional y tareas de razonamiento, e incorpora la innovacion central de la familia Qwen3: la capacidad de alternar entre modo "thinking" (razonamiento explicito) y modo "non-thinking" (respuesta directa) dentro de un unico modelo.

La arquitectura es un transformer causal denso con 28 capas, atencion con Grouped Query Attention (16 cabezas de query y 8 de key/value) y una longitud de contexto de 32.768 tokens. El modelo oficial reporta 1,7 mil millones de parametros totales (1,4 mil millones excluyendo embeddings), mientras que el recuento real de tensores en safetensors del repositorio asciende a 2.031.739.904 parametros, diferencia atribuible a los embeddings y a la cabeza de salida. El tamano del repositorio es de 4,1 GB.

Su relevancia actual radica en que ofrece capacidades de razonamiento y agenticas propias de modelos mucho mayores en un formato compacto, desplegable en hardware de consumo. La familia Qwen3 se presenta como sucesora de QwQ y Qwen2.5, con mejoras declaradas en matematicas, generacion de codigo, seguimiento de instrucciones y soporte multilingue de mas de 100 idiomas. El modelo esta referenciado en el paper arXiv:2505.09388.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3) |
| Parametros totales | 1,7B (1,4B sin embeddings); 2.031.739.904 segun safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (soporte declarado via llama.cpp, Ollama, LMStudio, MLX-LM, KTransformers) |
| Idiomas soportados | Mas de 100 idiomas y dialectos (segun model card de la familia Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

Qwen3-1.7B es un transformer causal denso con 28 capas. Emplea Grouped Query Attention con 16 cabezas de query y 8 cabezas de key/value, lo que reduce el coste de memoria de la KV cache en inferencia. El modelo ha pasado por las etapas de preentrenamiento y post-entrenamiento descritas en la model card de la familia Qwen3. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni la presencia especifica de RLHF o DPO, aunque la model card menciona "superior human preference alignment" como resultado del post-entrenamiento.

La innovacion tecnica mas destacable es el soporte nativo de dos modos de inferencia en un unico conjunto de pesos: modo thinking, que genera contenido de razonamiento envuelto en un bloque `<think>...</think>` antes de la respuesta final, y modo non-thinking, orientado a dialogo general eficiente. El cambio se controla mediante el parametro `enable_thinking` en `tokenizer.apply_chat_template`, y tambien esta disponible en los endpoints de SGLang y vLLM. La model card recomienda, para modo thinking, `Temperature=0.6`, `TopP=0.95`, `TopK=20` y `MinP=0`, y sugiere `presence_penalty=1.5` para mitigar repeticiones infinitas.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno.
- Razonamiento explicito en modo thinking, orientado a logica compleja, matematicas y codigo.
- Respuesta directa y eficiente en modo non-thinking para uso general.
- Generacion de codigo y razonamiento sobre matematicas (declarado como mejora frente a QwQ y Qwen2.5).
- Capacidades agenticas y de integracion con herramientas externas en ambos modos.
- Seguimiento de instrucciones y alineacion con preferencias humanas (escritura creativa, role-play, dialogos multi-turno).
- Soporte multilingue de mas de 100 idiomas y dialectos, incluyendo traduccion e instrucciones multilingues.
- Compatibilidad con tool calling / function calling segun la model card de la familia.
- Compatibilidad con despliegue OpenAI-compatible via SGLang y vLLM.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con hasta 32.768 tokens de contexto, suficiente para hilos largos o historiales de ticket extensos, alternando modo non-thinking para respuestas rapidas.
- Generacion de codigo en produccion: el modo thinking permite razonar sobre problemas de programacion antes de emitir codigo, y su integracion con SGLang/vLLM facilita exponerlo como API compatible con OpenAI en pipelines de CI/CD.
- Razonamiento matematico asistido: util para resolver problemas paso a paso en modo thinking, con la traza de razonamiento accesible en el bloque `<think>` para auditoria.
- Asistentes agenticos con herramientas: la model card declara capacidades agenticas y soporte de tool calling, lo que permite construir agentes que invocan APIs externas en tareas multi-paso.
- Traduccion y procesamiento multilingue: con soporte declarado de mas de 100 idiomas, adecuado para pipelines de traduccion o atencion multilingue en entornos con recursos limitados.
- Despliegue en hardware de consumo: con 1,7B parametros y 4,1 GB de pesos en safetensors, es viable en GPUs consumer mediante llama.cpp, Ollama o LMStudio para prototipado local y aplicaciones de escritorio.
- Generacion de contenido creativo y role-play: la model card destaca alineacion en escritura creativa y role-play, util para asistentes de escritura o personajes conversacionales.
- Clasificacion y extraccion de informacion con contexto largo: el contexto de 32.768 tokens permite procesar documentos extensos en una sola pasada sin trocear.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial, GitHub y documentacion de Qwen para detalles de evaluacion, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K u otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia orientativa, los pesos en safetensors ocupan 4,1 GB en el repositorio; el consumo real dependera de la cuantizacion y de la implementacion.
- GPU recomendadas: no especificadas en la informacion disponible.
- Compatibilidad con GPU consumer: no confirmada explicitamente; la model card menciona soporte en Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers, lo que sugiere viabilidad en hardware de consumo, pero sin cifras concretas.
- Opciones de despliegue: `transformers` (se requiere version >= 4.51.0 para evitar `KeyError: 'qwen3'`), SGLang (`>=0.4.6.post1`), vLLM (`>=0.8.5`), Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B (este) | 1,7B (2,03B en safetensors) | 32.768 | Apache 2.0 | Modo thinking/non-thinking, 100+ idiomas |
| Qwen2.5-1.5B | No disponible en la informacion | No disponible | No disponible | Predecesor de la familia; la model card lo cita como referencia de comparacion en modo non-thinking |
| QwQ-32B | No disponible en la informacion | No disponible | No disponible | Citado como referencia de razonamiento; Qwen3-1.7B lo supera en modo thinking segun la model card |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Riesgo de repeticiones infinitas: la model card advierte explicitamente sobre este comportamiento y recomienda `presence_penalty=1.5` y los parametros de muestreo indicados.
- Requiere `transformers>=4.51.0`; versiones anteriores fallan con `KeyError: 'qwen3'`.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de contexto o idioma: contexto de 32.768 tokens; aunque se declaran mas de 100 idiomas, no se detalla el rendimiento por idioma.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar el enlace de licencia oficial (`https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE`) para condiciones exactas.
- Repositorio derivado: `Ed26d/Qwen3-1.7B` es una publicacion de un tercero sobre el modelo base oficial `Qwen/Qwen3-1.7B-Base`; conviene verificar la integridad de los pesos frente al repositorio oficial antes de usarlo en produccion.
- Sin descargas ni likes registrados en el momento de la consulta, lo que limita la validacion comunitaria del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ed26d/Qwen3-1.7B
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Blog oficial Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion Qwen: https://qwen.readthedocs.io/en/latest/
- Chat Qwen: https://chat.qwen.ai/
- Paper (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
