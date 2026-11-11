# Kamyar-zeinalipour/TalkFa-WikiFaDial-Llama-3.2-3B-Instruct-LoRA

## Resumen

TalkFa-WikiFaDial-Llama-3.2-3B-Instruct-LoRA es un adaptador LoRA entrenado sobre meta-llama/Llama-3.2-3B-Instruct para la generacion de dialogos casuales en farsi (persa) a partir de un parrafo de Wikipedia en farsi. Lo desarrolla Kamyar Zeinalipour en el marco del proyecto TalkFa, un benchmark unificado para generacion y comprension de dialogos en farsi presentado en el paper arXiv 2609.01810 (Jamshidi, Zeinalipour, Akbari, Bianchini, Maggini y Gori, 2026). El adaptador resuelve una tarea muy concreta: dado un fragmento enciclopedico, producir un dialogo de seis turnos entre dos hablantes que se mantenga fiel al contenido del parrafo, con salida estructurada en JSON.

El modelo es relevante para la comunidad de PLN en lenguas de bajos recursos porque demuestra que un ajuste fino eficiente (LoRA) sobre un modelo pequeno de 3B parametros puede mejorar drasticamente metricas de generacion en farsi: ROUGE-L pasa de 0,353 a 0,660, BLEU-4 de 0,229 a 0,582 y la similitud coseno de embeddings ParsBERT de 0,714 a 0,959 en el split de test de Wiki-FaDial (100 dialogos). Esto lo convierte en una referencia practica para quien necesite sintetizar datos conversacionales en persa con coste computacional bajo.

El adaptador se distribuye como pesos PEFT en safetensors (1,6 GB) y requiere el modelo base, que esta sujeto a la licencia Llama 3.2 y es de acceso restringido (gated). No es un modelo autonomo: debe cargarse junto a Llama-3.2-3B-Instruct y, opcionalmente, fusionarse con merge_and_unload para simplificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA (PEFT) |
| Parametros totales | 3B en el modelo base; el adaptador LoRA anade un subconjunto no especificado (repo de 1,6 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el ejemplo de uso emplea bfloat16 |
| Idiomas soportados | farsi (fa) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.2-3B-Instruct, un transformer decoder-only de 3.000 millones de parametros. El ajuste se realiza mediante LoRA (Low-Rank Adaptation) con la libreria PEFT, lo que permite entrenar un numero reducido de parametros adicionales manteniendo congelados los pesos del modelo base. La tarea de entrenamiento es generacion condicionada: el modelo recibe un parrafo de Wikipedia en farsi y debe producir un dialogo casual de seis turnos entre dos hablantes, fiel al contenido del parrafo y en formato JSON.

El entrenamiento utiliza el split de train de Wiki-FaDial dentro del benchmark TalkFa, compuesto por 4.084 dialogos verificados por humanos. La evaluacion se realiza sobre el split de test (100 dialogos) con ROUGE-L, BLEU-4 y BERTCos (similitud coseno de embeddings medios de ParsBERT, bert-fa-base). La configuracion de entrenamiento esta publicada en el repositorio GitHub del proyecto (configs/train_generation.json). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; el ajuste parece ser un fine-tuning supervisado estandar sobre la tarea de generacion.

## Capacidades

- Generacion de dialogos casuales en farsi de seis turnos entre dos hablantes a partir de un parrafo enciclopedico.
- Fidelidad al contexto de entrada: el dialogo generado debe mantenerse anclado al contenido del parrafo de Wikipedia proporcionado.
- Salida estructurada en JSON, lo que facilita su integracion en pipelines de datos.
- Generacion de texto autoregresiva con muestreo configurable (temperature, top_p, top_k, repetition_penalty).
- Capacidad multilingue limitada al farsi en la tarea ajustada (el modelo base soporta mas idiomas, pero el adaptador esta especializado en fa).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Generacion de datos sinteticos de dialogo en farsi: el adaptador convierte articulos de Wikipedia en conversaciones de seis turnos, util para aumentar corpus conversacionales en persa alli donde escasean datos humanos anotados.
- Aumento de datos para entrenar modelos de dialogo en farsi: los dialogos generados, con alta similitud semantica respecto a las referencias (BERTCos 0,959), pueden emplearse como datos de aumento en pipelines de entrenamiento supervisado.
- Creacion de material educativo conversacional: a partir de parrafos de Wikipedia se generan dialogos que explican el contenido de forma coloquial, utiles para plataformas de aprendizaje de persa.
- Prototipado rapido de asistentes conversacionales en farsi: el modelo sirve como base para experimentar con respuestas coloquiales ancladas a una fuente documental.
- Evaluacion de modelos de dialogo en persa: el adaptador y el benchmark TalkFa permiten reproducir la linea base de Wiki-FaDial y comparar nuevas propuestas con metricas estandar (ROUGE-L, BLEU-4, BERTCos).
- Investigacion en fidelidad a la fuente: al exigir que el dialogo se mantenga fiel al parrafo de entrada, es un banco de pruebas para estudiar alucinacion y grounding en lenguas de bajos recursos.
- Generacion de guiones conversacionales para contenidos divulgativos: a partir de un articulo enciclopedico se obtiene un guion de seis intervenciones listo para locucion o publicacion.

## Benchmarks y rendimiento

Resultados en el test set de Wiki-FaDial (100 dialogos). BERTCos es la similitud coseno de embeddings medios de ParsBERT (bert-fa-base).

| Metrica | Base | TalkFa LoRA | Delta |
|---|---:|---:|---:|
| ROUGE-L | 0,353 | 0,660 | +0,307 |
| BLEU-4 | 0,229 | 0,582 | +0,353 |
| BERTCos | 0,714 | 0,959 | +0,245 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en bfloat16 requiere aproximadamente 6-7 GB de VRAM; el adaptador LoRA anade una cantidad marginal. En cuantizacion de 8 bits bajaria a unos 3-4 GB y en 4 bits a unos 2-2,5 GB (estimaciones orientativas, no confirmadas en la model card).
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con batching; RTX 4090, RTX 3090 o RTX A6000 para experimentacion.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en bfloat16 (por ejemplo RTX 3060 Ti, RTX 4060 Ti, RTX 3070) y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers + peft (como en el ejemplo de la model card), fusion con merge_and_unload y despliegue en vLLM o TGI; llama.cpp y Ollama requeririan conversion del adaptador a GGUF, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

El proyecto TalkFa publica adaptadores equivalentes sobre varios modelos base para la misma tarea de generacion Wiki-FaDial:

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|
| TalkFa-WikiFaDial-Llama-3.2-3B-Instruct-LoRA (este) | 3B | Generacion Wiki-FaDial | llama3.2 | Hugging Face (adaptador PEFT) |
| TalkFa-WikiFaDial-Llama-3.2-1B-Instruct-LoRA | 1B | Generacion Wiki-FaDial | llama3.2 | Hugging Face |
| TalkFa-WikiFaDial-Mistral-7B-Instruct-v0.3-LoRA | 7B | Generacion Wiki-FaDial | no disponible en la informacion | Hugging Face |
| TalkFa-WikiFaDial-Llama-3.1-8B-Instruct-LoRA | 8B | Generacion Wiki-FaDial | llama3.1 | Hugging Face |
| TalkFa-WikiFaDial-Mistral-Nemo-Instruct-2407-LoRA | 12B | Generacion Wiki-FaDial | no disponible en la informacion | Hugging Face |
| TalkFa-WikiFaDial-Mistral-Small-24B-Instruct-2501-LoRA | 24B | Generacion Wiki-FaDial | no disponible en la informacion | Hugging Face |

No se dispone en la informacion proporcionada de resultados comparativos de estos adaptadores entre si ni de modelos genericos de dialogo en farsi ajenos al proyecto TalkFa.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado unicamente para la tarea Wiki-FaDial (dialogo de seis turnos desde un parrafo de Wikipedia en farsi); su rendimiento fuera de ese dominio no esta documentado.
- Dependencia del modelo base: requiere meta-llama/Llama-3.2-3B-Instruct, que es de acceso restringido (gated) y exige aceptar sus terminos y autenticarse con huggingface-cli login.
- Licencia Llama 3.2: el uso comercial esta sujeto a los terminos de la licencia de Meta, que incluyen restricciones y obligaciones de atribucion; conviene revisarlos antes de desplegar en produccion.
- Riesgo de alucinacion: aunque la tarea exige fidelidad al parrafo, el modelo puede introducir contenido no presente en la fuente; las metricas BERTCos y ROUGE-L no garantizan ausencia de alucinacion factual.
- Sesgos: no se documentan analisis de sesgos en la informacion disponible; al entrenarse sobre Wikipedia en farsi, puede heredar sesgos de cobertura y representacion de esa fuente.
- Idioma: el adaptador esta disenado para farsi; su uso en otros idiomas no esta validado.
- Contexto y cuantizacion: no se especifican la longitud de contexto efectiva ni los formatos de cuantizacion soportados; el ejemplo de la model card usa bfloat16.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kamyar-zeinalipour/TalkFa-WikiFaDial-Llama-3.2-3B-Instruct-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Paper (arXiv): https://arxiv.org/abs/2609.01810
- Repositorio GitHub: https://github.com/KamyarZeinalipour/TalkFa
- Dataset TalkFa: https://huggingface.co/datasets/Kamyar-zeinalipour/TalkFa
- Coleccion TalkFa: https://huggingface.co/collections/Kamyar-zeinalipour/talkfa-arxiv-2026-6af47769e8cfcf8046fcb449
- Configuracion de entrenamiento: https://github.com/KamyarZeinalipour/TalkFa/blob/main/configs/train_generation.json
