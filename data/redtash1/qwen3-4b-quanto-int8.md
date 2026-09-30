# Redtash1/Qwen3-4B-Quanto-INT8

## Resumen

Redtash1/Qwen3-4B-Quanto-INT8 es una version cuantizada a INT8 del modelo base Qwen3-4B, publicado por el usuario Redtash1 en Hugging Face. No se trata de un modelo nuevo ni de un ajuste fino: es el mismo Qwen3-4B de Alibaba Qwen (4.000 millones de parametros, arquitectura transformer densa de tipo decoder-only) convertido a pesos de 8 bits mediante la libreria Quanto de Hugging Face Optimum.

El modelo base Qwen3-4B es un modelo preentrenado multilingue orientado a comprension y generacion de lenguaje, codigo y matematicas. Al ser la variante base y no una version Instruct, no ha sido alineado con RLHF ni DPO, por lo que su uso natural es la continuacion de texto, la evaluacion de la representacion interna y el ajuste fino posterior, no el dialogo directo.

La relevancia de este repositorio es acotada: la cuantizacion INT8 reduce aproximadamente a la mitad el espacio de los pesos respecto a bfloat16, lo que permite ejecutar un modelo de 4B en GPUs de gama media con 8-12 GB de VRAM. Sin embargo, el repositorio no incluye model card descriptiva, no declara pipeline, no tiene descargas ni likes y no aporta benchmarks, por lo que debe tratarse como un artefacto no verificado de terceros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen3ForCausalLM) |
| Parametros totales | 4.000 millones (modelo base Qwen3-4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en este repositorio; el modelo base Qwen3-4B declara 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantizacion | INT8 con Quanto (solo pesos; activaciones en coma flotante) |
| Idiomas soportados | No disponible en este repositorio; el modelo base Qwen3-4B declara cobertura multilingue (119 idiomas y dialectos segun Qwen) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Quanto, con quantization_config en config.json) |
| Autor de la cuantizacion | Redtash1 (usuario de Hugging Face) |
| Autor del modelo base | Alibaba Qwen |
| Fecha de publicacion | 30 de septiembre de 2026 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B: un transformer denso decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU, RoPE para las posiciones y atencion con consultas agrupadas (GQA) para reducir el coste del cache KV. El modelo declara 4.000 millones de parametros totales. No se dispone en la informacion proporcionada del desglose exacto de capas, dimension oculta o numero de cabezas de atencion, por lo que esos datos se marcan como no disponibles.

Respecto al entrenamiento, el repositorio no aporta ninguna informacion: no indica numero de tokens, composicion del dataset, ni si hubo etapas de ajuste por instrucciones o preferencias. El modelo base Qwen3-4B, del que procede, es un modelo preentrenado difundido por Alibaba Qwen; cualquier dato de entrenamiento debe consultarse en su model card oficial, no en este repositorio.

La unica intervencion tecnica documentada aqui es la cuantizacion de pesos a INT8 mediante Quanto (Optimum). Quanto aplica cuantizacion de solo pesos: los pesos se almacenan en int8 y se desquantizan a coma flotante durante el calculo, mientras que las activaciones permanecen en su precision original. Esto reduce el espacio ocupado por los pesos pero no acelera necesariamente la inferencia en la misma proporcion que una cuantizacion W8A8, y no incluye decodificacion especulativa ni tecnicas de atencion lineal.

## Capacidades

- Generacion de texto por continuacion: al ser el modelo base, su tarea principal es completar secuencias de texto, no seguir instrucciones.
- Comprension lectora y modelado de lenguaje: evaluable mediante tareas de perplejidad, cloze y clasificacion por representaciones.
- Generacion de codigo: el modelo base declara capacidades de codigo, aunque sin una etapa de ajuste por instrucciones la calidad en formato conversacional es limitada.
- Razonamiento matematico basico, con el mismo caveat anterior.
- Capacidad multilingue heredada del modelo base Qwen3-4B (119 idiomas declarados por Qwen).
- Soporte de tool calling / function calling: no disponible en este repositorio. Es una capacidad propia de las variantes Instruct, no del modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible, al carecer de entrenamiento por instrucciones.
- Modo thinking: no disponible en la variante base de Qwen3-4B tal como se distribuye aqui.
- Vision, audio y otras modalidades: no soportadas (modelo exclusivamente de texto).
- Ajuste fino: el modelo es apto como punto de partida para fine-tuning, incluido QLoRA sobre la version cuantizada.

## Casos de uso

- Ajuste fino sobre dominio especifico: el modelo base sirve como punto de partida para entrenar un adaptador LoRA o QLoRA en un corpus propio (legal, medico, industrial). La cuantizacion INT8 reduce el coste del entrenamiento con QLoRA en GPUs de 16-24 GB, aunque para entrenamiento completo conviene partir de los pesos en bfloat16.
- Evaluacion y comparacion de tecnicas de cuantizacion: util para medir la degradacion de perplejidad de Quanto INT8 frente a bfloat16, GPTQ, AWQ o W8A8 sobre el mismo modelo base, en un entorno reproducible de 4B parametros.
- Despliegue en hardware con VRAM limitada: con aproximadamente 4 GB de pesos, el modelo cabe en GPUs de 8 GB para contextos cortos, lo que permite ejecutar inferencia local en estaciones de trabajo sin aceleradores de gama alta.
- Generacion de texto por lotes en pipelines de datos: tareas de continuacion, aumento de datos sinteticos o etiquetado asistido donde no se requiere seguimiento de instrucciones y prima el coste por token.
- Destilacion y generacion de pseudoetiquetas: usar el modelo base para producir logits o probabilidades sobre un corpus y entrenar un modelo menor o alimentar un clasificador especifico.
- Investigacion sobre interpretabilidad: analizar representaciones internas, atencion o embeddings en un modelo multilingue de 4B con un coste de memoria asumible por un solo investigador.
- Base para conversacion tras ajuste por instrucciones: un equipo que necesite un asistente conversacional puede aplicar SFT y DPO sobre esta base y obtener una variante Instruct propia, en lugar de depender de pesos ya alineados.
- Pruebas de integracion en infraestructura: validar el pipeline de carga (transformers + optimum-quanto), el consumo de memoria y los tiempos de arranque antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. El autor no incluye model card, tabla de evaluacion ni comparacion con la version en bfloat16, por lo que no es posible cuantificar la perdida de calidad introducida por la cuantizacion INT8 de Quanto en este artefacto concreto. Cualquier cifra de MMLU, HumanEval, GSM8K o similares del modelo base Qwen3-4B debe consultarse en la model card oficial de Qwen y no es extrapolable sin medicion propia a esta version cuantizada.

## Requisitos de hardware

- Peso de los pesos en INT8: aproximadamente 4,0 GB (4.000 millones de parametros a 1 byte por parametro), frente a unos 8 GB en bfloat16.
- Cache KV: con la configuracion de GQA del modelo base, el coste estimado es de aproximadamente 0,14 GB por cada 1.000 tokens de contexto. A 32.768 tokens de contexto completo, el cache KV ronda los 4,5 GB adicionales; a 8.192 tokens, alrededor de 1,2 GB. Estas cifras son estimaciones derivadas del tamano, no medidas publicadas.
- Memoria total estimada: entre 6 y 8 GB en FP16 para inferencia con contexto corto (2.000-4.000 tokens), y por encima de 10 GB si se usa la ventana de contexto completa.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080 y RTX 4090. En GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) cabe con contexto reducido y batch de 1.
- GPU profesionales: A10G, L4, A5000, A6000, A100 40/80 GB y H100 para batching alto y contexto extendido.
- CPU y Apple Silicon: viable mediante conversion a GGUF y ejecucion con llama.cpp u Ollama, siempre que se disponga de al menos 8-16 GB de RAM unificada.
- Opciones de despliegue: transformers con optimum-quanto es la ruta nativa del formato. TGI y vLLM pueden requerir verificacion de compatibilidad con Quanto en la version concreta instalada. llama.cpp, Ollama y LM Studio no consumen pesos Quanto directamente: exige reconvertir el modelo a GGUF, momento en el que la cuantizacion INT8 de Quanto se pierde.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Redtash1/Qwen3-4B-Quanto-INT8 | 4B (denso) | No declarado en el repo | INT8 solo pesos (Quanto) | Apache 2.0 | Hugging Face, 0 descargas |
| RedHatAI/Qwen3-4B-Instruct-2507-quantized.w8a8 | 4B (denso) | No disponible en la informacion | INT8 W8A8 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B (original) | 4B (denso) | 32.768 tokens, extensible a 131.072 | bfloat16 | Apache 2.0 | Hugging Face, repositorio oficial |
| Llama 3.2 3B Instruct | 3,2B (denso) | 128.000 tokens | bfloat16 y GGUF comunitario | Licencia comunitaria Llama 3.2 | Meta y Hugging Face |
| Gemma 3 4B IT | 4B (denso) | 128.000 tokens | bfloat16 y GGUF comunitario | Licencia Gemma | Google y Hugging Face |

Diferencias clave: la version de RedHatAI aplica cuantizacion W8A8 (pesos y activaciones en INT8) y parte de la variante Instruct-2507, alineada por instrucciones, mientras que este repositorio parte del modelo base y solo cuantiza pesos. Qwen3-4B original ofrece la referencia sin cuantizar y con model card completa. Llama 3.2 3B y Gemma 3 4B son alternativas de tamano comparable con ventanas de contexto mayores y licencias mas restrictivas que Apache 2.0.

## Limitaciones y advertencias

- No es un modelo Instruct: al derivar de Qwen3-4B base, no ha pasado por RLHF, DPO ni SFT. No debe usarse directamente como asistente conversacional ni para seguir instrucciones complejas sin un ajuste previo.
- Artefacto no verificado: el repositorio tiene 0 descargas, 0 likes, no declara pipeline y su model card se limita a la linea de licencia. No hay evidencia publica de que la conversion se haya validado o comparado con el modelo original.
- Degradacion por cuantizacion: la cuantizacion INT8 de solo pesos puede introducir perdida de calidad frente a bfloat16, especialmente en tareas de razonamiento y codigo. El autor no publica ninguna medicion al respecto.
- Riesgo de alucinacion: inherente a los modelos de lenguaje preentrenados, agravado por la ausencia de alineacion y de filtros de seguridad.
- Sesgos: el modelo base hereda los sesgos presentes en su corpus de preentrenamiento. No se documenta ningun proceso de mitigacion en este repositorio.
- Idiomas: no se especifica la lista de idiomas soportados en este repositorio. La cobertura multilingue es una herencia declarada del modelo base, no una garantia verificada tras la cuantizacion.
- Compatibilidad de despliegue: el formato Quanto no es portable directamente a llama.cpp, Ollama o LM Studio. Cambiar de runtime obliga a reconvertir y recuantizar, con la consiguiente perdida del trabajo de cuantizacion original.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar de forma independiente que el artefacto no incorpora material con restricciones adicionales y asumir la responsabilidad sobre la procedencia de los pesos.
- Contexto largo: extender la ventana mas alla de los 32.768 tokens requiere tecnicas de escalado tipo YaRN y dispara el consumo del cache KV, lo que puede agotar la VRAM en GPUs de gama media.
- Produccion: sin benchmarks, sin model card y sin mantenimiento declarado, no es recomendable usarlo como componente critico en un sistema en produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Redtash1/Qwen3-4B-Quanto-INT8
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Qwen3-4B-Instruct-2507 cuantizado W8A8 (RedHatAI): https://huggingface.co/RedHatAI/Qwen3-4B-Instruct-2507-quantized.w8a8
- Recetas de cuantizacion de Qwen (AutoGPTQ, Int4/Int8): https://github.com/QwenLM/Qwen/blob/main/recipes/inference/quantization/README.md
- Modelo comunitario derivado (Uncensored Qwen3 4B, INT8_Convrot): https://civitai.com/models/2373678/uncensored-qwen3-4b-llm-for-z-image-and-flux4b
