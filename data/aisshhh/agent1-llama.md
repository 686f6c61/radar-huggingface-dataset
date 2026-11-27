# aisshhh/agent1-llama

## Resumen

`aisshhh/agent1-llama` es un modelo de lenguaje derivado de Llama-3.2-3B-Instruct, afinado por el usuario aisshhh y distribuido unicamente en formato GGUF para su uso con llama.cpp y Ollama. El repositorio contiene un unico archivo de pesos cuantizado en Q4_K_M, lo que lo situa en el segmento de modelos pequenos orientados a inferencia local en hardware de consumo. El pipeline declarado en Hugging Face no esta disponible y la model card no especifica el conjunto de datos de afinamiento ni el objetivo concreto del fine-tuning, mas alla de la etiqueta "conversational" y del nombre "agent1", que sugiere un uso orientado a agentes.

El modelo cuenta con 3.212.749.888 parametros totales (aproximadamente 3,2 mil millones), coherente con la arquitectura Llama-3.2-3B. Al tratarse de un fine-tuning de un modelo instruct ya existente, hereda la ventana de contexto y las capacidades multilingues del modelo base, aunque el autor no las documenta explicitamente en la model card. El repo ocupa 2,0 GB, lo que corresponde al archivo GGUF Q4_K_M.

La relevancia de esta ficha es limitada pero practica: se trata de un modelo comunitario sin descargas ni likes en el momento de la consulta, sin licencia declarada y con documentacion minima. Resulta util como ejemplo de pipeline Unsloth -> GGUF y como candidato para pruebas de despliegue local, pero no debe considerarse un modelo listo para produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama-3.2-3B-Instruct; no detallada por el autor) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no documentada por el autor) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Llama-3.2-3B-Instruct.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Llama-3.2-3B-Instruct, un transformer decoder-only de aproximadamente 3,2 mil millones de parametros. El autor indica que el afinamiento y la conversion a GGUF se realizaron con Unsloth, herramienta que optimiza el entrenamiento de modelos Llama reduciendo el uso de memoria y acelerando el proceso (el autor afirma "2x faster"). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT supervisado. Tampoco se documenta la estrategia de cuantizacion mas alla del resultado final Q4_K_M.

Un detalle tecnico relevante es que el autor ajusto el comportamiento del token BOS para garantizar la compatibilidad con GGUF. Este tipo de ajuste es habitual al convertir modelos afinados con plantillas de chat personalizadas, y puede afectar a la coherencia del formato de conversacion si no se usa la plantilla Jinja adecuada (de ahi la recomendacion de `--jinja` en los comandos de ejemplo). No se documentan innovaciones adicionales como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instruct.
- Razonamiento basico y respuesta a instrucciones en formato chat (requiere plantilla Jinja, `--jinja`).
- Generacion de codigo y matematicas a nivel de modelo de 3B, sin datos de evaluacion publicados por el autor.
- Soporte de tool calling: no documentado por el autor; depende de la plantilla y del runtime, no hay confirmacion explicita.
- Soporte de agentes y razonamiento multi-paso: no documentado; el nombre "agent1" sugiere la intencion, pero no hay evidencia en la model card.
- Capacidades multilingues: no disponibles (no declaradas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el comando `llama-mtmd-cli` aparece en la model card como ejemplo generico de Unsloth, no como confirmacion de multimodalidad de este modelo concreto.

## Casos de uso

- Prototipado local de asistentes conversacionales: el archivo Q4_K_M de 2,0 GB cabe en GPUs de consumo y permite iterar rapidamente en un portatil con llama.cpp u Ollama, usando la plantilla Jinja para preservar el formato de chat.
- Pruebas de pipelines de agentes en entornos sin conectividad: al ser un GGUF autocontenido, se puede desplegar en estaciones de trabajo aisladas o en el borde (edge) para validar flujos de agente antes de migrar a un modelo mayor.
- Evaluacion comparativa de fine-tunings comunitarios: sirve como caso de estudio para medir como afecta un fine-tuning no documentado al comportamiento del modelo base en tareas de instruccion.
- Generacion de texto asistida en herramientas de escritorio: integrable mediante Ollama con el Modelfile incluido, adecuado para resumen, reescritura y borradores con latencia baja en CPU/GPU modesta.
- Educacion y experimentacion: util en cursos y talleres sobre cuantizacion GGUF y Unsloth, ya que el repositorio incluye el flujo completo de conversion y despliegue.
- Base para un segundo fine-tuning: al estar en formato GGUF no es directamente reentrenable, pero sirve como referencia de comportamiento para comparar con el modelo base Llama-3.2-3B-Instruct antes de decidir si conviene partir de los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0-2,5 GB con Q4_K_M (el archivo pesa 2,0 GB; hay que anadir el overhead de contexto y del runtime).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este tamano y permitiran contextos largos y mayor throughput.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas con 4 GB o mas; tambien es viable en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion previa.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aisshhh/agent1-llama | 3,2 B | no disponible | GGUF Q4_K_M | no disponible | Hugging Face (0 descargas) |
| Llama-3.2-3B-Instruct (Meta) | 3,2 B | 128 K (segun model card oficial de Meta) | safetensors, GGUF comunitarios | Llama 3.2 Community License | Hugging Face, ampliamente distribuido |
| Qwen2.5-3B-Instruct | 3,1 B | 32 K (segun model card oficial de Qwen) | safetensors, GGUF | Apache 2.0 | Hugging Face |
| Phi-3.5-mini-instruct | 3,8 B | 128 K (segun model card oficial de Microsoft) | safetensors, GGUF | MIT | Hugging Face |

La comparativa se limita a parametros y licencia porque el autor no publica benchmarks. Frente al modelo base, este fine-tuning no documenta mejoras medibles y anade una dependencia de la plantilla Jinja y del ajuste del token BOS.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Llama-3.2-3B-Instruct, hereda los sesgos del modelo base y los del dataset de fine-tuning, que no se especifica.
- Riesgo de alucinacion: propio de un modelo de 3B; sin evaluacion publicada no es posible cuantificarlo.
- Limitaciones de contexto o idioma: la longitud de contexto no esta documentada por el autor y los idiomas soportados no se declaran; no debe asumirse el contexto de 128 K del modelo base sin verificacion empirica.
- Restricciones de licencia: la licencia no esta declarada en el repositorio, lo que impide asumir uso comercial. Ademas, al derivar de Llama-3.2, estaria sujeta a la Llama 3.2 Community License de Meta, pero el autor no lo confirma.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes, documentacion minima, un unico archivo cuantizado y ningun benchmark; no es recomendable para produccion sin una evaluacion interna previa. La modificacion del token BOS puede degradar el formato de conversacion si no se usa `--jinja` y la plantilla correcta.
- El nombre del comando de ejemplo (`llama_finetune`) no coincide con el ID del repositorio (`agent1-llama`), lo que puede provocar errores al seguir la model card al pie de la letra.

## Enlaces

- Hugging Face: https://huggingface.co/aisshhh/agent1-llama
- Unsloth (herramienta de fine-tuning y conversion): https://github.com/unslothai/unsloth
- Llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue con Modelfile): https://ollama.com
