# M1ztyk/SAIGE-dpo-v5-smoke

## Resumen

SAIGE-dpo-v5-smoke es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Lo publica el usuario M1ztyk en HuggingFace y se distribuye como adaptador PEFT en formato safetensors, no como modelo completo: para usarlo hay que cargar el modelo base de Qwen y aplicar encima los pesos del adaptador. El repositorio ocupa 0,5 GB y fue registrado el 19 de septiembre de 2026, con la ultima actualizacion tres minutos despues de la creacion.

El modelo hereda del base una arquitectura transformer decoder-only de 3,09 mil millones de parametros con atencion GQA, contexto nativo de 32.768 tokens (ampliable a 131.072 con YaRN) y soporte declarado de mas de 29 idiomas. El ajuste DPO busca alinear las respuestas con preferencias humanas sin recurrir a un modelo de recompensa explicito, siguiendo el metodo descrito en el paper de Rafailov et al. (NeurIPS 2023).

La relevancia practica de esta ficha es limitada y conviene decirlo con claridad: el sufijo "smoke" y el hecho de que el repositorio tenga 0 descargas y 0 likes apuntan a una ejecucion de prueba (smoke test) de un pipeline de entrenamiento, no a un modelo listo para produccion. No hay model card con datos de entrenamiento, no se declaran benchmarks y la licencia del adaptador figura como "license" sin concretar, lo que impide confirmar las condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct); adaptador LoRA sobre atencion y capas lineales |
| Parametros totales | 3,09 B en el modelo base; el adaptador anade un numero de parametros entrenables no especificado (repo de 0,5 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; hasta 131.072 con YaRN (no confirmado para el adaptador) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos del adaptador en precision de entrenamiento (fp32/bf16). Requiere fusion con el base y conversion posterior (GPTQ, AWQ, GGUF) para cuantizar |
| Idiomas soportados | no disponible en la ficha del adaptador; el modelo base declara mas de 29 idiomas |
| Licencia | no disponible (la model card indica "license" sin especificar; la del modelo base Qwen2.5-3B-Instruct es Qwen Research License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, no pesos completos) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Metodo de ajuste | DPO con LoRA (libreria PEFT) |
| Libreria de carga | peft / transformers |
| Task pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen2.5-3B-Instruct, un transformer causal decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). El entrenamiento declarado es DPO, la tecnica introducida en "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (arXiv:2305.18290), que reformula el ajuste por preferencias como un problema de clasificacion binaria sobre pares (respuesta preferida, respuesta rechazada) sin entrenar un modelo de recompensa separado. El ajuste se hizo con LoRA en lugar de actualizar todos los pesos, lo que explica que el repositorio pese 0,5 GB y no los aproximadamente 6 GB del modelo base en bf16.

La model card no documenta el dataset de preferencias, el numero de pasos, la tasa de aprendizaje, el rango de LoRA ni la composicion de los datos. Solo se listan las versiones de framework empleadas: PEFT 0.21.0, TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2, ademas de un enlace a un panel de Trackio con el proyecto "saige-dpo-v5". El nombre del repositorio ("smoke") y el intervalo de tres minutos entre creacion y actualizacion sugieren una ejecucion de validacion del pipeline mas que un entrenamiento finalizado con datos curados.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste instructivo del modelo base.
- Razonamiento basico y respuesta a preguntas de conocimiento general, acotado por el tamano de 3 B de parametros.
- Generacion de codigo y matematicas a nivel de modelo pequeno; el modelo base Qwen2.5-3B-Instruct tiene competencia limitada en tareas de razonamiento complejo.
- Soporte de plantilla de chat estilo Qwen (roles user/assistant), tal y como muestra el ejemplo de la model card con `transformers.pipeline`.
- Capacidades de tool calling: no confirmadas para este adaptador. El modelo base Qwen2.5-Instruct soporta function calling, pero el ajuste DPO puede haber alterado ese comportamiento y no hay evaluacion al respecto.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni evaluadas.
- Capacidades multilingues: no documentadas para el adaptador; el base declara soporte de 29+ idiomas.
- Capacidades multimodales (vision, audio): no, el modelo base es exclusivamente de texto.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Experimentacion academica con DPO: sirve como ejemplo reproducible de como aplicar preferencias sobre un modelo de 3 B con LoRA y PEFT, util para validar un pipeline antes de escalar a modelos mayores.
- Prototipado rapido de asistentes conversacionales en local: al requerir menos de 8 GB de VRAM en bf16 (o unos 2-3 GB cuantizado), permite montar un chatbot de prueba en una GPU de consumo.
- Evaluacion comparativa de tecnicas de alineacion: se puede enfrentar contra el base sin ajustar para medir el efecto del DPO en las respuestas, siempre que se construya un conjunto de evaluacion propio, ya que no hay benchmarks publicados.
- Generacion de texto asistida en dominios acotados: resumenes, reescritura y clasificacion de texto en ingles o castellano, con la advertencia de que no hay datos de evaluacion que respalden un uso en produccion.
- Base para ajustes posteriores: al ser un adaptador LoRA, se puede combinar con otros adaptadores o continuar el entrenamiento con SFT, usando el modelo base como punto de partida comun.
- Docencia y formacion tecnica: ilustra de forma concreta la diferencia entre un modelo completo y un adaptador, y el flujo de fusion de pesos antes de cuantizar o desplegar.
- Pruebas de integracion de infraestructura: sirve para verificar que vLLM, TGI o transformers+PEFT cargan correctamente un adaptador antes de lanzar un entrenamiento de mayor coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de M1ztyk/SAIGE-dpo-v5-smoke no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de evaluacion, ni comparaciones con el modelo base sin ajustar. Los resultados oficiales de Qwen2.5-3B-Instruct estan documentados en la model card y el blog de Qwen, pero no se reproducen aqui porque no forman parte de la informacion proporcionada ni permiten inferir el comportamiento del adaptador tras el DPO.

## Requisitos de hardware

- VRAM estimada para inferencia con el adaptador fusionado en bf16/fp16: aproximadamente 6-7 GB (3,09 B de parametros mas cache KV).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,5-4 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ/GPTQ 4-bit): aproximadamente 2-2,5 GB.
- La cache KV crece con el contexto: a 32.768 tokens con GQA (2 cabezas KV) el consumo adicional es de aproximadamente 1,5-2 GB en fp16, por lo que el contexto largo exige margen extra de memoria.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 (24 GB) para contexto largo o lotes grandes. En 4 bits cabe en GPUs de 6-8 GB.
- GPU de datacenter: A100 40/80 GB, H100, L40S y A10G, muy sobredimensionadas para 3 B pero utiles para servir muchas peticiones concurrentes.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), vLLM (requiere fusionar el adaptador en el modelo base y servir el modelo resultante), TGI, llama.cpp (previo merge y conversion a GGUF) y Ollama (mismo requisito de GGUF).
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador y no se pueden extrapolar de forma fiable desde el modelo base.

## Comparativa con modelos similares

La comparacion se hace a nivel de modelo base, ya que el adaptador no dispone de evaluacion propia. Los datos de parametros y contexto corresponden a las fichas oficiales de cada modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| M1ztyk/SAIGE-dpo-v5-smoke (este) | 3,09 B base + adaptador LoRA | 32.768 (base) | no disponible | Repositorio HF, 0 descargas, 0 likes | Ajuste DPO experimental sin evaluacion publicada |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768, ampliable a 131.072 con YaRN | Qwen Research License | Muy extendido en HF | Modelo base sin ajustar; benchmarks oficiales publicados por Qwen |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 | Llama 3.2 Community License | Muy extendido en HF | Alternativa directa en el mismo rango de tamano |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128.000 | MIT | Muy extendido en HF | Licencia permisiva y contexto largo, a cambio de mas parametros |

## Limitaciones y advertencias

- No hay datos de evaluacion: no se puede afirmar que el ajuste DPO mejore al modelo base en ninguna tarea concreta. Cualquier uso en produccion exige una evaluacion propia previa.
- Estado de prueba: el sufijo "smoke" y el intervalo de tres minutos entre creacion y actualizacion del repositorio indican una ejecucion de validacion del pipeline. El contenido puede ser incompleto o inestable.
- Sesgos: no documentados. El modelo hereda los sesgos del corpus de entrenamiento de Qwen2.5 y los del dataset de preferencias empleado, que no se especifica.
- Riesgo de alucinacion: alto, como en cualquier modelo de 3 B de parametros. Carece de mecanismos de verificacion factual y de acceso a fuentes externas salvo que se integre en un sistema RAG.
- Limitaciones de contexto: 32.768 tokens en el base, ampliables con YaRN, pero el adaptador no ha sido validado con contextos largos y el rendimiento puede degradarse mas alla de la ventana de entrenamiento.
- Limitaciones de idioma: no se declara que idiomas cubre el ajuste DPO. El modelo base soporta 29+ idiomas con calidad desigual, y el castellano no figura entre los idiomas con mejor rendimiento documentado.
- Licencia: el adaptador no especifica licencia, lo que en la practica impide determinar si su uso comercial esta permitido. Ademas, el modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License, no bajo Apache 2.0, con restricciones adicionales para uso comercial. Hay que verificar ambas antes de cualquier despliegue.
- Dependencia del modelo base: el adaptador no es autonomo. Requiere descargar Qwen/Qwen2.5-3B-Instruct, cuyos terminos de uso se aplican de forma acumulativa.
- Tool calling y comportamiento de agente: no verificados tras el DPO. El ajuste por preferencias puede degradar capacidades de formato estructurado presentes en el modelo instructivo original.
- Reproducibilidad: no se publican hiperparametros, datos ni semillas, por lo que el resultado no es reproducible a partir de la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/M1ztyk/SAIGE-dpo-v5-smoke
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper de DPO: https://huggingface.co/papers/2305.18290
- Repositorio de TRL: https://github.com/huggingface/trl
- Panel de entrenamiento en Trackio: https://M1ztyk-saige-dpo-v5-trackio.hf.space?project=saige-dpo-v5&runs=M1ztyk-1789854733&sidebar=collapsed

Nota: las busquedas web realizadas no han devuelto ningun resultado relacionado con este modelo, su autor ni el proyecto "SAIGE"; los resultados obtenidos corresponden a documentacion de Google Maps y no aportan informacion util para esta ficha.
