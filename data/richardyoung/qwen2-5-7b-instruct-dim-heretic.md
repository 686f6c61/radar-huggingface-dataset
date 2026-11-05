# richardyoung/Qwen2.5-7B-Instruct-DiM-heretic

## Resumen

Qwen2.5-7B-Instruct-DiM-heretic es una variante "decensored" (o abliterated) del modelo Qwen2.5-7B-Instruct de Alibaba Cloud, publicada por el usuario richardyoung. El modelo conserva la arquitectura y los pesos del original, pero ha sido modificado mediante la herramienta Heretic v2.0.0 para eliminar total o parcialmente los mecanismos de rechazo (refusals) aprendidos durante el ajuste fino por instrucciones. El resultado es un modelo de 7.610 millones de parametros que responde a peticiones que el modelo original tenderia a declinar, manteniendo una divergencia KL de 0.0782 respecto a la distribucion original.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de abliteration reproducible (el autor incluye un directorio `reproduce` con los pasos exactos), y por otro, sirve como ejemplo de los riesgos y trade-offs de este tipo de modificaciones, que reducen los refusals de 99/100 a 55/100 en la evaluacion del autor. El modelo base Qwen2.5-7B-Instruct es un transformer causal con RoPE, SwiGLU, RMSNorm y sesgo QKV en la atencion, con 28 capas y GQA (28 cabezas Q, 4 KV).

El contexto nativo del modelo base es de 131.072 tokens, aunque el `config.json` publicado esta configurado para 32.768 tokens; para superar ese limite es necesario activar YaRN con un factor de 4.0. La licencia es Apache 2.0, heredada del modelo original, y el unico idioma declarado en la model card es el ingles, aunque el modelo base soporta mas de 29 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y sesgo QKV en atencion (GQA: 28 cabezas Q, 4 KV) |
| Parametros totales | 7.615.616.512 (7,61 B); 6,53 B sin contar embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens nativos; `config.json` configurado a 32.768; ampliable con YaRN (factor 4.0) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (formato de pesos safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | Ingles declarado en la model card; el modelo base soporta mas de 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 15,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct original: un transformer causal denso de 28 capas con 7,61 B de parametros totales (6,53 B sin embeddings), atencion con Grouped Query Attention (28 cabezas para Q y 4 para KV), RoPE para codificacion posicional, activacion SwiGLU, normalizacion RMSNorm y sesgo en las proyecciones QKV. El modelo base fue entrenado en dos fases (pretraining y post-training) por Alibaba Cloud, con mejoras destacadas en conocimiento, codigo y matematicas gracias a modelos expertos especializados, y con ajuste por instrucciones que incluye seguimiento de instrucciones, generacion de textos largos (mas de 8K tokens), comprension de datos estructurados y salidas JSON.

La modificacion de este repositorio no es un reentrenamiento, sino una abliteration aplicada con Heretic v2.0.0. La tecnica identifica direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y las proyecta fuera (o las atenua) en capas y modulos concretos. Los parametros publicados incluyen `direction_index` por capa, pesos maximos y minimos para `attn.o_proj` (1.21 / 0.01) y `mlp.down_proj` (1.19 / 0.45), con posiciones y distancias especificas por capa (por ejemplo, `max_weight_position` 23.21 para atencion y 25.53 para MLP). El autor declara que el proceso es reproducible y proporciona instrucciones en el directorio `reproduce`. La divergencia KL de 0.0782 respecto al modelo original cuantifica el coste de la modificacion en terminos de cambio de distribucion.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento, codigo y matematicas heredados del Qwen2.5-7B-Instruct original, con mejoras especificas en esos dominios respecto a Qwen2.
- Seguimiento de instrucciones y generacion de textos largos (hasta 8K tokens de salida).
- Comprension y generacion de datos estructurados, especialmente JSON.
- Mayor resiliencia a la diversidad de system prompts, util para role-play y chatbots.
- Soporte de contexto largo hasta 131.072 tokens (con YaRN y configuracion adecuada).
- Capacidades multilingues del modelo base (mas de 29 idiomas), aunque la model card de esta variante solo declara ingles.
- Reduccion de rechazos: 55/100 refusals frente a 99/100 del original en la evaluacion del autor.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio reproducible para medir como la proyeccion de direcciones de rechazo afecta a la distribucion de salidas (KL 0.0782) y a la tasa de refusals (55/100). Adecuado porque el autor publica los parametros exactos y el directorio `reproduce`.
- Generacion creativa sin filtros: escritura de ficcion, guiones o dialogos que aborden temas sensibles y que el modelo original rechazaria. El modelo conserva la capacidad de generacion de textos largos (8K tokens) del base.
- Chatbot de rol y role-play: la mayor resiliencia a system prompts diversos y la reduccion de rechazos permiten personajes con condiciones mas extremas, aunque con riesgo de contenido inapropiado.
- Procesamiento de documentos largos en ingles: con contexto de 32.768 tokens por defecto (o 131.072 con YaRN), puede resumir o extraer informacion de contratos, informes o articulos extensos.
- Generacion de codigo y JSON en pipelines internos: hereda las capacidades de codigo y salida estructurada del Qwen2.5-7B-Instruct, util para prototipos y herramientas internas donde el filtrado de contenido no es critico.
- Evaluacion comparativa de modelos decensored: util para benchmarks de robustez, toxicidad y sesgo frente al original, dado que ambos comparten arquitectura y tokenizer.
- Despliegue en hardware de consumo: con 7,61 B de parametros, es viable en GPUs consumer con cuantizacion (aunque no se listan cuantizaciones oficiales en el repo).

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Qwen/Qwen2.5-7B-Instruct) |
|---|---|---|
| Refusals | 55/100 | 99/100 |
| Divergencia KL | 0,0782 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta variante. El modelo base Qwen2.5-7B-Instruct reporta resultados en el blog oficial de Qwen, pero no se reproducen aqui para no atribuirlos a la variante modificada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 20-24 GB.
- VRAM estimada en cuantizacion 8 bits: alrededor de 8 GB de pesos; en 4 bits, alrededor de 4-5 GB, aunque no se listan cuantizaciones oficiales en el repo.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) para FP16 ajustado o cuantizaciones; RTX 3090/4080 para cuantizaciones de 8/4 bits.
- Cabe en GPU consumer: si, en RTX 4090 en FP16 con cuidado de la longitud de contexto, y en GPUs de 8-12 GB con cuantizacion (no se proporcionan artefactos GGUF oficiales).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM (recomendado por Qwen para contexto largo), y potencialmente llama.cpp/Ollama si se generan cuantizaciones a partir de los safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusals | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-7B-Instruct-DiM-heretic | 7,61 B | 131.072 (32.768 en config) | 55/100 | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-7B-Instruct | 7,61 B | 131.072 (32.768 en config) | 99/100 | Apache 2.0 | HuggingFace |
| Otras variantes abliterated de Qwen2.5-7B | 7,61 B | Depende de la variante | No disponible | Apache 2.0 (habitual) | HuggingFace |

No se dispone de datos de benchmarks estandar ni de comparativas con modelos de otros fabricantes (Llama 3.1 8B, Mistral 7B) en la informacion proporcionada. La comparativa se limita al modelo base y a la categoria de variantes decensored.

## Limitaciones y advertencias

- La abliteration no elimina todos los rechazos: quedan 55/100 en la evaluacion del autor, por lo que el comportamiento es inconsistente y dificil de predecir.
- La divergencia KL de 0,0782 indica un cambio medible en la distribucion de salidas; puede degradar capacidades del modelo base en tareas que no tienen que ver con rechazos.
- Riesgo elevado de generar contenido danino, sesgado, ilegal o sexualmente explicito; no apto para aplicaciones orientadas al publico sin filtros adicionales.
- Solo se declara ingles en la model card, aunque el base es multilingue; el rendimiento en otros idiomas no esta verificado tras la modificacion.
- El contexto por defecto es de 32.768 tokens; superar ese limite requiere configurar YaRN, lo que puede degradar el rendimiento en textos cortos segun la documentacion de Qwen.
- No se documentan cuantizaciones oficiales, soporte de tool calling ni modo thinking en esta variante.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento legal y etico del contenido generado; el aviso de la model card no exime de responsabilidad.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-DiM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentacion de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Paper de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Chat de Qwen: https://chat.qwenlm.ai/
