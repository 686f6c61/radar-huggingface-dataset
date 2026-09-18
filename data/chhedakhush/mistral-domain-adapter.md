# Chhedakhush/mistral-domain-adapter

## Resumen

mistral-domain-adapter es un ajuste fino (fine-tune) del modelo mistralai/Mistral-7B-v0.1 publicado en HuggingFace por el usuario Chhedakhush. Segun la model card, se ha entrenado mediante SFT (supervised fine-tuning) utilizando la libreria TRL de HuggingFace, y esta etiquetado con las tags generated_from_trainer, trl, sft y transformers. El nombre del modelo sugiere una adaptacion a un dominio concreto, aunque la model card no especifica cual ni aporta detalles sobre la composicion del dataset de entrenamiento.

El modelo hereda por tanto la arquitectura del transformer decoder-only denso de Mistral 7B (7.240 millones de parametros, atencion con ventana deslizante y GQA), que en su version v0.1 se publico con una ventana de contexto de 8.192 tokens y licencia Apache 2.0. Sobre esa base, este repositorio anade un ajuste supervisado cuyo alcance real es dificil de evaluar: no se documentan datos, hiperparametros, numero de tokens vistos ni resultados de evaluacion.

La relevancia de esta ficha es fundamentalmente practica: se trata de un ejemplo tipico de adaptador de dominio de bajo coste sobre un modelo abierto muy extendido, util como plantilla reproducible (TRL + SFT + registro en Weights & Biases), pero con un nivel de documentacion muy bajo y sin evidencia publicada de rendimiento. Cualquier uso en produccion exige una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de mistralai/Mistral-7B-v0.1) |
| Parametros totales | 7.240 millones (heredado del modelo base; no declarado en la model card del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base; no declarada en la model card del adaptador) |
| Tipos de cuantizacion | no disponible en el repositorio; al ser un modelo de 7B es compatible con cuantizacion de 8 y 4 bits en el ecosistema estandar |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo de la model card contiene el texto generico "licence: license"); el modelo base se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (segun las tags del repositorio de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral 7B v0.1: un transformer decoder-only denso con 7.240 millones de parametros, 32 capas, atencion de consultas agrupadas (GQA) para reducir el coste de la cache KV, activacion SwiGLU y embeddings rotatorios (RoPE), ademas de atencion con ventana deslizante de 4.096 tokens. La model card de este repositorio no describe ninguna modificacion estructural: se trata de un ajuste fino sobre los pesos del modelo base, no de un cambio de arquitectura.

En cuanto al entrenamiento, la unica informacion disponible indica que se uso SFT con TRL, con un enlace a una ejecucion de Weights & Biases cuyo identificador de proyecto es "mistral-qlora" (lo que apunta a un ajuste eficiente con QLoRA, aunque la model card no lo confirma de forma explicita). Las versiones de framework declaradas son TRL 1.13.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. No se especifican el dataset, el numero de ejemplos, la longitud de secuencia, el learning rate, el numero de epocas, si hubo etapas de RLHF/DPO posteriores ni el metodo de evaluacion. El tamano del repositorio notificado es de 0.0 GB, un dato que resulta llamativo para un modelo de 7B en safetensors y que sugiere que el repositorio podria contener un adaptador (LoRA/QLoRA) en lugar de los pesos completos, una publicacion incompleta o un artefacto de metadatos; la model card no aclara este punto.

## Capacidades

- Generacion de texto conversacional y de proposito general, en la medida en que el ajuste SFT no degrade las capacidades del modelo base.
- Razonamiento basico y respuesta a instrucciones, asumiendo que el dataset de SFT estaba orientado a instrucciones; no hay evidencia publicada al respecto.
- Generacion de codigo y resolucion de problemas matematicos elementales, capacidad heredada del modelo base y no verificada tras el ajuste.
- El ejemplo de la model card utiliza el formato de mensajes con roles ({"role": "user", "content": ...}), lo que indica soporte del chat template conversacional a traves de transformers.pipeline.
- Soporte de tool calling / function calling: no documentado. El modelo base v0.1 no incorpora plantilla de herramientas; no hay evidencia de que el ajuste lo anada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles. El modelo base esta mayoritariamente entrenado en ingles, con soporte limitado de otras lenguas.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa propia): no disponibles.
- Modo de uso declarado: text-generation con transformers, device cuda, max_new_tokens configurable.

## Casos de uso

- Prototipado rapido de un asistente conversacional de dominio: el modelo se puede cargar con transformers.pipeline y el formato de mensajes con roles, lo que permite tener un chatbot funcional sobre un dominio vertical en pocas lineas de codigo.
- Base para comparativas internas de ajuste fino: sirve como referencia de un pipeline TRL + SFT reproducido de principio a fin, util para equipos que quieran medir el efecto de un SFT ligero frente al modelo base.
- Generacion de texto asistida en ingl\u00e9s tecnico: si el ajuste se hizo sobre documentacion de un dominio concreto, el modelo puede redactar borradores y res\u00famenes en ese registro, siempre que se valide con un conjunto de prueba propio.
- Clasificacion y extraccion de informacion mediante prompts: con 8.192 tokens de contexto se pueden procesar documentos de varias paginas en una sola pasada y pedir salidas estructuradas.
- Experimentacion academica con QLoRA: el repositorio enlaza una ejecucion de Weights & Biases, lo que lo convierte en un caso de estudio de bajo coste para cursos o trabajos sobre ajuste eficiente de parametros.
- Componente de un pipeline RAG: el modelo puede actuar como generador final en un sistema de recuperacion, pero requiere evaluacion previa de fidelidad porque no hay datos de alucinacion publicados.
- Servicio interno de bajo trafico: al ser un modelo de 7B cuantizable a 4 bits, puede desplegarse en una unica GPU de consumo para tareas no criticas con latencia tolerante.

En todos los casos, el uso en produccion exige validacion propia: no existen benchmarks, ni ejemplos de evaluacion, ni documentacion de sesgos para este checkpoint concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares), no se declara una perdida de validacion final y el enlace a Weights & Biases es la unica traza del entrenamiento, sin metricas reproducidas en el repositorio. No se deben extrapolar cifras del modelo base como si fueran de este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia, partiendo de los 7.240 millones de parametros del modelo base: en precision completa (fp32) alrededor de 29 GB; en fp16/bf16 alrededor de 15 GB; en cuantizacion de 8 bits alrededor de 8 GB; en cuantizacion de 4 bits alrededor de 4-5 GB, mas el coste de la cache KV segun la longitud de contexto.
- GPU recomendadas para fp16 sin cuantizar: A100 40 GB, H100 80 GB, L40S 48 GB o dos GPU de 24 GB con reparto de capas.
- GPU de consumo: cabe en una RTX 3090 o RTX 4090 de 24 GB en fp16 siempre que se limite la longitud de contexto, y en tarjetas de 8-12 GB (RTX 3060, RTX 4070) unicamente con cuantizacion de 4 bits.
- Opciones de despliegue: transformers con CUDA para prototipado; vLLM o TGI para servicio con batching continuo; llama.cpp u Ollama si se convierte a GGUF; el repositorio no incluye pesos GGUF ni cuantizaciones precalculadas.
- Latencia y throughput: no disponible. No se han publicado mediciones para este checkpoint y el tamano de repositorio notificado (0.0 GB) impide confirmar que los pesos completos esten efectivamente subidos, algo que hay que verificar antes de planificar cualquier despliegue.
- Nota operativa: si el repositorio contiene solo el adaptador, el despliegue requiere cargar primero mistralai/Mistral-7B-v0.1 y aplicar despues el adaptador, con el coste adicional que ello implica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Chhedakhush/mistral-domain-adapter | 7.240 M (base) | 8.192 tokens (base) | no disponible en el repo | 0 descargas, 0 likes | Sin benchmarks ni dataset documentado |
| mistralai/Mistral-7B-v0.1 | 7.240 M | 8.192 tokens | Apache 2.0 | Muy extendido en HuggingFace | Modelo base sin ajuste instructivo |
| mistralai/Mistral-7B-Instruct-v0.2 | 7.240 M | 32.768 tokens | Apache 2.0 | Ampliamente desplegado | Ajustado para instrucciones y con contexto ampliado |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 131.072 tokens | Llama 3.1 Community License | Muy extendido, con restricciones de uso | Alternativa de tamano similar con contexto muy superior |

La comparacion debe tomarse con cautela: los datos de contexto y parametros del adaptador son heredados del modelo base y no estan confirmados en su propia model card. Frente a las alternativas, el adaptador parte en desventaja clara en licencia, documentacion y evidencia empirica.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna medida publicada de calidad, fidelidad o utilidad del ajuste. No se puede afirmar que mejore al modelo base en ningun dominio.
- Opacidad del dataset: se desconoce la composicion de los datos de SFT, su origen y sus posibles sesgos. Esto impide auditar el comportamiento del modelo.
- Riesgo de alucinacion: es el comportamiento por defecto de un modelo de 7B sin ajuste especifico de fidelidad; al no haber evaluaciones, el riesgo no esta cuantificado.
- Licencia ambigua: el campo de licencia de la model card contiene un marcador generico ("licence: license") y el repositorio no declara una licencia valida. Aunque el modelo base sea Apache 2.0, el uso comercial del checkpoint ajustado no esta autorizado de forma explicita por el autor.
- Repositorio practicamente vacio en datos: 0 descargas y 0 likes, sin historial de mantenimiento, con una unica actualizacion registrada minutos despues de la creacion.
- Incertidumbre sobre el contenido del repositorio: con un tamano notificado de 0.0 GB no se puede confirmar que se hayan subido los pesos completos o el adaptador; verificar antes de usarlo.
- Limitacion idiomatica: no hay informacion sobre idiomas; el modelo base esta orientado al ingles y su rendimiento en castellano no esta verificado.
- Limitacion de contexto: 8.192 tokens en el modelo base (frente a los 32.768 de Mistral-7B-Instruct-v0.2), lo que restringe casos de uso con documentos largos.
- Sin soporte documentado de tool calling ni de agentes: no se debe asumir que el ajuste SFT haya anadido estas capacidades.
- Riesgo de sobreajuste al dominio: al tratarse de un SFT de un unico dominio no especificado, puede degradar el rendimiento general respecto al modelo base.
- Resultados de busqueda web irrelevantes: las consultas realizadas no devolvieron informacion tecnica sobre este modelo, por lo que toda la ficha se apoya unicamente en la model card y en los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chhedakhush/mistral-domain-adapter
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/khushchheda28-non/mistral-qlora/runs/elpnev6k
- Repositorio de TRL: https://github.com/huggingface/trl
- Cita de TRL (von Werra et al., 2020, licencia Apache-2.0): https://github.com/huggingface/trl
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en los resultados de busqueda disponibles.
