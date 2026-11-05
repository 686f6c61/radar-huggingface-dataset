# EugeneEXE/Qwen3-4B

## Resumen

Qwen3-4B es un modelo de lenguaje causal denso de 4.022 millones de parámetros (3.600 millones sin contar embeddings) desarrollado por el equipo Qwen de Alibaba. Esta ficha concreta corresponde a la réplica publicada por el usuario EugeneEXE en HuggingFace, que reproduce los pesos del modelo base oficial `Qwen/Qwen3-4B-Base` con la licencia Apache 2.0 y el formato estándar de `transformers` más `safetensors`. Se trata, por tanto, de un espejo del modelo oficial, no de un fine-tuning ni de una variante entrenada por el autor del repositorio.

El modelo pertenece a la tercera generación de la familia Qwen y resuelve el problema de disponer de razonamiento de tipo cadena de pensamiento en un tamaño que cabe en hardware de consumo. Su rasgo diferencial es la capacidad de alternar entre modo "thinking" (razonamiento explícito para matemáticas, código y lógica) y modo "non-thinking" (diálogo directo y eficiente) dentro del mismo conjunto de pesos, controlable mediante el parámetro `enable_thinking` de la plantilla de chat.

Con 36 capas, atención GQA (32 cabezas de consulta y 8 de clave/valor) y una ventana nativa de 32.768 tokens extensible a 131.072 mediante YaRN, Qwen3-4B se posiciona como una opción compacta para despliegues locales, agentes con tool calling y aplicaciones multilingües donde no se dispone de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3), atención GQA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantizacion | no especificados en la model card; compatibles vía llama.cpp, GGUF, MLX y AWQ/GPTQ por la comunidad |
| Idiomas soportados | más de 100 idiomas y dialectos (según la model card de Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 8,1 GB |

## Arquitectura y entrenamiento

Qwen3-4B es un transformer causal denso con 36 capas y atención con query/key-value grouping (GQA) de 32 cabezas de consulta frente a 8 de clave/valor, lo que reduce el coste de memoria del KV cache durante la inferencia con contextos largos. El modelo se distribuye en dos etapas declaradas por el autor: preentrenamiento y post-entrenamiento, sobre la base `Qwen/Qwen3-4B-Base`. La model card no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles en la información proporcionada.

La innovación técnica principal es el soporte nativo de dos modos de operación en un único modelo: el modo thinking genera contenido dentro de un bloque `<think>...</think>` antes de la respuesta final, mientras que el modo non-thinking responde directamente. Este comportamiento se controla con `enable_thinking` en `apply_chat_template` y está soportado también en los servidores SGLang y vLLM. La model card recomienda parámetros de muestreo distintos por modo (temperatura 0,6 y top-p 0,95 para thinking) y advierte de que, ante repeticiones sin fin, se ajuste `presence_penalty` a 1,5. La extensión de contexto a 131.072 tokens se realiza mediante YaRN.

## Capacidades

- Generación de texto conversacional multi-turno con alineación orientada a preferencias humanas.
- Razonamiento explícito en modo thinking para matemáticas, lógica y generación de código.
- Modo non-thinking para diálogo general con menor latencia y menor consumo de tokens.
- Soporte de tool calling y function calling en ambos modos, orientado a integración con herramientas externas.
- Capacidades de agente y razonamiento multi-paso para tareas complejas.
- Instrucciones multilingües y traducción en más de 100 idiomas y dialectos.
- Escritura creativa, role-playing y seguimiento de instrucciones detalladas.
- Compatibilidad con endpoints OpenAI a través de SGLang y vLLM.

## Casos de uso

- Asistente de atención al cliente: el modelo puede mantener conversaciones multi-turno con contexto de hasta 32.768 tokens nativos, suficiente para hilos largos con historial e información de cuenta, y alternar a modo non-thinking para respuestas rápidas.
- Generación de código en pipelines de CI/CD: en modo thinking produce razonamiento paso a paso útil para revisión de parches, y su soporte de tool calling permite invocar linters o ejecutores de tests desde un agente.
- Agente de automatización de tareas: con function calling en ambos modos, puede encadenar llamadas a APIs internas, consultar bases de datos y resumir resultados en un flujo multi-paso.
- Análisis de documentos largos: gracias a la extensión YaRN hasta 131.072 tokens, puede procesar contratos, informes o expedientes completos sin troceado agresivo.
- Traducción y localización: el soporte declarado de más de 100 idiomas permite usarlo como motor de traducción en productos con mercados diversos.
- Tutor o asistente educativo: el modo thinking expone el razonamiento intermedio, lo que facilita mostrar al usuario el proceso de resolución de problemas matemáticos o lógicos.
- Despliegue local en estación de trabajo: con 4.000 millones de parámetros y cuantización de 4 bits cabe en GPUs de consumo, lo que habilita prototipos y herramientas internas sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen3 y a la documentación para las evaluaciones, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni comparativas numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 8 GB solo para pesos, más KV cache; en la práctica, 10-12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 4-5 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 2,5-3 GB de pesos, con margen para contexto.
- GPU de datacenter recomendadas: A100 40/80 GB o H100 para servir muchas peticiones concurrentes con contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) con holgura en FP16 y en RTX 3090, RTX 4080, RTX 4070 Ti y similares con cuantización; también en GPUs de 8 GB con cuantización de 4 bits y contexto reducido.
- Opciones de despliegue: transformers (>=4.51.0), vLLM (>=0.8.5), SGLang (>=0.4.6.post1), llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del backend, la cuantización y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modo thinking | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B (esta ficha) | 4,0 B | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | Sí, conmutable | HuggingFace, vLLM, SGLang, Ollama |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | No | HuggingFace, vLLM, Ollama |
| Llama 3.2 3B Instruct | 3,2 B | 131.072 | Llama 3.2 Community License | No | HuggingFace, vLLM, Ollama |
| Gemma 2 2B Instruct | 2,6 B | 8.192 | Gemma Terms of Use | No | HuggingFace, vLLM, Ollama |

La comparativa se basa en datos públicos de cada familia; no se dispone de cifras de benchmark del Qwen3-4B en la información proporcionada para establecer diferencias cuantitativas de rendimiento.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de 4.000 millones de parámetros; conviene validar salidas en dominios factuales.
- La model card advierte de posibles repeticiones sin fin si no se ajustan los parámetros de muestreo; recomienda `presence_penalty` de 1,5 y temperatura 0,6 con top-p 0,95 en modo thinking.
- El modo thinking incrementa el consumo de tokens y la latencia; no es adecuado para aplicaciones de respuesta inmediata sin filtrado.
- El repositorio es un espejo publicado por un tercero (EugeneEXE) con 0 descargas y 0 likes en el momento de la consulta; para producción conviene referenciar el repositorio oficial `Qwen/Qwen3-4B`.
- Requiere `transformers>=4.51.0`; versiones anteriores fallan con `KeyError: 'qwen3'`.
- La licencia Apache 2.0 permite uso comercial, pero el autor del espejo no ofrece garantías adicionales sobre los pesos.
- No se detallan en la información disponible los sesgos específicos del modelo ni la composición del dataset de entrenamiento, lo que limita la auditoría de sesgos.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/EugeneEXE/Qwen3-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Modelo oficial: https://huggingface.co/Qwen/Qwen3-4B
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3
- Documentación: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Licencia: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Paper de referencia (arXiv 2309.00071): https://arxiv.org/abs/2309.00071
- Paper de referencia (arXiv 2505.09388): https://arxiv.org/abs/2505.09388
