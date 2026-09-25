# OnlyTextLLMs/gemma-4-26B-A4B-it-OnlyText

## Resumen

gemma-4-26B-A4B-it-OnlyText es una variante text-only del modelo multimodal google/gemma-4-26B-A4B-it, publicada por el usuario OnlyTextLLMs. La modificacion consiste en eliminar las torres y proyectores de vision y audio, junto con los tokens especiales multimodales, conservando intactos el backbone de texto y la cabeza LM. No se ha anadido entrenamiento nuevo: es una exportacion derivada de los pesos originales de Google DeepMind.

El modelo base es una arquitectura Mixture of Experts (MoE) de 25,23 mil millones de parametros totales que, segun los resultados de busqueda disponibles, activa en torno a 3,8-4 mil millones de parametros por token, con 128 expertos y una ventana de contexto de 262.144 tokens. Esa combinacion de muchos parametros almacenados y pocos activos lo hace interesante para despliegues con requisitos altos de calidad y de throughput, donde el cuello de botella es la memoria y no el computo.

Su relevancia practica es doble: por un lado, reduce el peso en disco y en VRAM al eliminar los modulos multimodales (el repositorio ocupa 50,5 GB en bfloat16, frente a un modelo multimodal completo mas pesado); por otro, simplifica el stack de inferencia, ya que no requiere procesadores de imagen ni de audio. El principal caveat es que se trata de un repositorio con 0 descargas y 0 likes, sin benchmarks publicados ni ficha tecnica detallada del proceso de extraccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con Mixture of Experts (clase `Gemma4ForCausalLM`); segun resultados de busqueda, 128 expertos y ~4B activos |
| Parametros totales | 25.233.122.078 (25,23B), dato de los safetensors |
| Parametros activos | ~3,8B (SiliconFlow) / "4B active" (FitMyLLM); no confirmado en la model card |
| Longitud de contexto | 262.144 tokens segun OpenRouter; 256K segun FitMyLLM; la model card no lo especifica |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en bfloat16; no hay variantes GGUF, AWQ, GPTQ ni MLX |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (segun repositorio y model card); modelo derivado de google/gemma-4-26B-A4B-it |
| Formato de pesos | safetensors, bfloat16 |
| Capas | 30 |
| Tamano oculto | 2816 |
| Cabeza MTP | No presente |
| Tamano del repositorio | 50,5 GB |
| Pipeline | text-generation / conversational |
| Modelo base | google/gemma-4-26B-A4B-it |

## Arquitectura y entrenamiento

El modelo es un derivado estructural, no un reentrenamiento. Segun la model card, el autor elimina las torres/embedders de vision y audio, sus proyectores y los tokens especiales multimodales, preservando el backbone de texto y la cabeza LM. El resultado es un `Gemma4ForCausalLM` puro con 30 capas, tamano oculto 2816, 25,23B de parametros en bfloat16 y sin cabeza MTP (multi-token prediction). La parte MoE del backbone de texto se conserva tal cual, ya que el numero de parametros totales declarado (25,23B) es muy superior al que corresponderia a un modelo denso de 30 capas y 2816 de dimension oculta.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el pipeline de alineacion (RLHF, DPO u otros) utilizado en el modelo base. La model card indica explicitamente que este repositorio "solo elimina modalidades, no anade entrenamiento nuevo", por lo que las capacidades conversacionales e instruct provienen integramente de google/gemma-4-26B-A4B-it. Tampoco se documenta la tecnica exacta de poda de pesos ni si se ha verificado la equivalencia numerica de las salidas de texto respecto al modelo original.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline declarado: text-generation, conversational).
- Razonamiento y flujos agenticos: el modelo base esta descrito por Google DeepMind y por la documentacion de Google Cloud como orientado a razonamiento avanzado y workflows agenticos.
- Generacion de codigo: capacidad esperada por herencia del modelo base instruct; no hay evaluacion publicada especifica en la informacion disponible.
- Matematicas y tareas de razonamiento de varios pasos: atribuibles al modelo base, sin cifras verificables en este repositorio.
- Formato instruct: el sufijo "it" del modelo base indica ajuste por instrucciones.
- Capacidades multimodales (vision y audio): eliminadas en esta variante; el modelo base si las soporta segun la documentacion de Google Cloud.
- Tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque es habitual en modelos instruct de esta generacion.
- Capacidades multilingues: no disponible; no se declaran idiomas en los metadatos.
- Soporte de contexto largo: hasta 262.144 tokens segun OpenRouter (256K segun FitMyLLM), con salida maxima de 32.768 tokens segun OpenRouter.

## Casos de uso

- Atencion al cliente automatizada: la ventana de contexto de hasta 262.144 tokens permite mantener historiales largos de conversacion, tickets previos y documentacion de producto en un unico prompt, sin necesidad de resumen intermedio.
- Procesamiento de documentos extensos: analisis, resumen y extraccion de datos de contratos, informes tecnicos o expedientes que superan ampliamente el contexto de un modelo denso de gama media, con salida de hasta 32.768 tokens por respuesta.
- Asistente de codigo en pipelines de CI/CD: generacion y revision de parches, explicacion de errores de compilacion y redaccion de mensajes de commit, integrado como servicio de texto puro tras un gateway HTTP.
- Ingesta y normalizacion de datos para RAG: uso como modelo de extraccion (structured output, resumen y reescritura de consultas) en pipelines donde no se necesita vision, evitando cargar procesadores de imagen en el mismo nodo.
- Despliegue soberano on-premise: al ser un derivado con licencia declarada apache-2.0 y sin dependencias multimodales, encaja en entornos con restricciones de red donde se quiere servir un LLM de altas prestaciones en clúster propio.
- Evaluacion y benchmarking de arquitecturas MoE: util como baseline text-only del gemma-4-26B-A4B-it para medir el impacto de eliminar las modalidades en tareas puramente de lenguaje.
- Moderacion y clasificacion de contenido a gran escala: con ~3,8-4B de parametros activos por token, el coste de computo por peticion es bajo en comparacion con un denso de 26B, lo que favorece colas de clasificacion de alto volumen.
- Generacion de contenido editorial y traduccion asistida: tareas de reescritura y adaptacion de estilo sobre textos largos, siempre que se validen antes los idiomas realmente soportados (no declarados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio concreto (0 descargas, 0 likes, model card sin tabla de evaluacion). Los agregadores consultados (SiliconFlow, OpenRouter, FitMyLLM) mencionan benchmarks del modelo base google/gemma-4-26B-A4B-it y referencias a Artificial Analysis, pero no se han proporcionado cifras numericas, por lo que no se reproducen aqui.

| Benchmark | Este modelo | Modelo base | Notas |
|---|---|---|---|
| MMLU | No disponible | No disponible | Sin cifras en la informacion proporcionada |
| HumanEval | No disponible | No disponible | Sin cifras en la informacion proporcionada |
| GSM8K | No disponible | No disponible | Sin cifras en la informacion proporcionada |
| Arena AI (ranking) | No disponible | "Puesto #6 entre modelos abiertos" segun SiliconFlow | No verificado de forma independiente |

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 50-55 GB solo para pesos (el repositorio ocupa 50,5 GB), mas cache KV para el contexto usado. Con 262.144 tokens de contexto la cache KV puede crecer mucho; conviene limitar la longitud efectiva o usar atencion con cache cuantizada.
- VRAM estimada en 8 bits: aproximadamente 26-28 GB de pesos.
- VRAM estimada en 4 bits: aproximadamente 14-16 GB de pesos, mas cache KV.
- GPU de datacenter: A100 80 GB, H100 80 GB, H200 o L40S 48 GB (esta ultima justa en bf16, holgada en 8 bits). Multi-GPU con tensor parallelism para bf16 en GPUs de 24-48 GB.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16 ni en 8 bits; si es viable en 4 bits con cuantizacion, a costa de perdida de calidad y de necesitar convertir los pesos, ya que el repositorio no publica GGUF. Configuraciones de 2x RTX 4090/3090 (48 GB) permiten bf16 con contexto moderado.
- Ahorro de computo: al activar solo ~3,8-4B de parametros por token, el coste de FLOPs por token se parece al de un modelo denso de ~4B, aunque la huella de memoria es la de un modelo de 25B. Esto favorece el throughput siempre que la memoria no sea el limite.
- Opciones de despliegue: transformers (ruta oficial de la model card), vLLM y SGLang (soportan MoE y el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints), TGI. llama.cpp/Ollama solo tras convertir manualmente a GGUF, conversion no publicada.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OnlyTextLLMs/gemma-4-26B-A4B-it-OnlyText | 25,23B | ~3,8-4B (MoE) | 262.144 tokens (segun OpenRouter) | Solo texto | apache-2.0 (declarada) | safetensors bf16 en HuggingFace |
| google/gemma-4-26B-A4B-it | 26B (denominacion comercial) | ~3,8-4B (MoE) | 262.144 tokens | Texto, imagen y audio | No disponible en la informacion proporcionada | Pesos originales de Google DeepMind |
| Alternativas MoE abiertas de rango similar (p. ej. Qwen3-30B-A3B) | No disponible | No disponible | No disponible | No disponible | No disponible | No verificadas en la informacion proporcionada |
| Densos de ~31B citados por FitMyLLM como referencia de calidad | No disponible | No disponible | No disponible | No disponible | No disponible | No verificados en la informacion proporcionada |

La comparacion mas solida es contra el propio modelo base: comparten backbone y cabeza LM, pero esta variante elimina vision y audio, reduce el numero de ficheros y simplifica el stack de inferencia. A cambio, pierde cualquier caso de uso multimodal y no anade mejoras de rendimiento en texto.

## Limitaciones y advertencias

- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria ni issues que permitan juzgar la fidelidad de la conversion.
- Riesgo de divergencia respecto al original: no se documenta ninguna evaluation que compare las salidas de texto de esta variante con google/gemma-4-26B-A4B-it tras eliminar los modulos multimodales y los tokens especiales. Los tokens multimodales eliminados podrian aparecer en plantillas de prompt o en tokenizers derivados y provocar comportamientos raros.
- Alucinacion: no hay datos publicados de tasas de alucinacion; el riesgo es el heredado del modelo base instruct, sin mitigaciones documentadas.
- Idiomas: no declarados en los metadatos ni en la model card; no asumas cobertura multilingue sin probarla.
- Contexto: la cifra de 262.144 tokens proviene de agregadores de terceros, no de la model card; verifica el limite real del tokenizer y la configuracion de RoPE antes de disenar prompts largos.
- Licencia: la model card declara apache-2.0, pero al ser un derivado de un modelo de Google conviene revisar los terminos de uso de Gemma aplicables al modelo base antes de un despliegue comercial. Existe una discrepancia potencial entre la licencia declarada en el derivado y las condiciones del original.
- Cuantizacion: no hay GGUF, AWQ ni GPTQ publicados; cualquier despliegue en hardware de consumo exige convertir pesos por cuenta propia y asumir el riesgo de degradacion.
- Sin cabeza MTP: no se puede aprovechar decodificacion multi-token especulativa basada en MTP del modelo base.
- Rendimiento en produccion: sin datos de latencia, throughput ni estabilidad bajo carga; se recomienda medir antes de comprometer SLA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OnlyTextLLMs/gemma-4-26B-A4B-it-OnlyText
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 26B A4B IT en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Ficha en SiliconFlow: https://www.siliconflow.com/models/gemma-4-26b-a4b-it
- Ficha en FitMyLLM: https://www.fitmyllm.com/model/gemma-4-26b-a4b
- Precios y benchmarks en OpenRouter: https://openrouter.ai/google/gemma-4-26b-a4b-it
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
