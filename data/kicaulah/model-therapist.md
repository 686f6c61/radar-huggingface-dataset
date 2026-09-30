# Kicaulah/model-therapist

## Resumen

Model Therapist es un ajuste fino por instrucciones del modelo Qwen2.5-3B-Instruct, publicado por el usuario Kicaulah en Hugging Face como pieza dentro de Kicaulah AI, un sistema multi-agente de cinco especialistas mas un router servido tras un unico endpoint compatible con la API de OpenAI. El modelo no busca resolver tareas tecnicas, sino sostener conversaciones de acompanamiento emocional con un registro coloquial y calido, evitando el tono rigido de "asistente que empieza toda respuesta con 'Certainly!'". La model card lo define explicitamente como un companero conversacional y no como un terapeuta, e incorpora un guardarrail de crisis con recursos de ayuda.

Tecnicamente se apoya en el transformer decoder-only de Qwen2.5 en su variante de 3 000 millones de parametros, con una ventana de contexto declarada de 4 096 tokens y una licencia Apache 2.0 que permite uso comercial sin royalties. El entrenamiento se realizo con QLoRA sobre el modelo instruct base, con posterior fusion de los adaptadores (merge LoRA), segun el script `scripts/02_train_therapist.py` referenciado en la model card.

El detalle mas relevante para quien evalua el modelo es que los pesos no estan publicados: la model card indica que el repositorio aun no contiene los checkpoints y que el autor los subira al ejecutar el script de entrenamiento en una GPU de 16 GB. Mientras eso ocurre, el valor practico del repositorio se concentra en el prompt de sistema, que el autor presenta como reutilizable en cualquier modelo instruct. El repositorio acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), ajustado con QLoRA sobre Qwen2.5-3B-Instruct |
| Parametros totales | ~3 000 millones (heredados del modelo base) |
| Longitud de contexto | 4 096 tokens segun la model card; el modelo base Qwen2.5-3B-Instruct soporta 32 768 tokens |
| Tipos de cuantizacion | no disponible; se entreno con QLoRA (cuantizacion de 4 bits durante el entrenamiento) pero no se publican pesos cuantizados |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (indicado en la model card); los pesos no estan publicados en el repositorio en el momento de redactar esta ficha |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con atencion por grupos (GQA) y RoPE, entrenado por Alibaba sobre un corpus multilingue de gran escala y alineado mediante tecnicas de instruccion y preferencias. El autor no modifica la arquitectura: aplica un fine-tuning de instrucciones (SFT) con QLoRA, es decir, adaptadores de bajo rango entrenados sobre los pesos del modelo base cuantizados a 4 bits, y despues fusiona esos adaptadores en los pesos completos para obtener un checkpoint unico en safetensors. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF o DPO posteriores al SFT.

La innovacion que el autor destaca no es arquitectonica sino de comportamiento: el ajuste busca un estilo "anti-robotico", con lenguaje cotidiano, contracciones, validacion emocional y preguntas de una en una, en lugar de respuestas estructuradas en vinetas propias de un manual clinico. El propio autor reconoce que el elemento mas portable de la contribucion es el prompt de sistema, que incluye ejemplos de voz y un protocolo obligatorio de manejo de crisis con derivacion a lineas de ayuda. El modelo forma parte de un despliegue mas amplio con router, servido sobre el protocolo de OpenAI mediante `scripts/serve.py`, lo que permite conectarlo a clientes como Open WebUI, LibreChat, Continue o LiteLLM.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a acompanamiento emocional y escucha activa.
- Persona estable: mantiene un tono cercano, coloquial y no clinico a lo largo de la conversacion, con resistencia al estilo "asistente generico".
- Validacion emocional y reformulacion: refleja lo que el usuario dice antes de aconsejar.
- Manejo de crisis: el prompt de sistema define un protocolo con recursos concretos (988 Suicide & Crisis Lifeline, findahelpline.com, befrienders.org) y una pregunta explicita sobre seguridad inmediata.
- Conversacion multi-turno dentro de la ventana de contexto declarada (4 096 tokens).
- Integracion como especialista dentro de un sistema multi-agente con router y endpoint compatible con OpenAI (`model="kicaulah"`).
- Compatibilidad con el ecosistema transformers y con clientes que hablen el protocolo de OpenAI.
- No se documenta soporte de tool calling, function calling, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- No se documentan capacidades multilingues: el modelo esta etiquetado unicamente como `en`.

## Casos de uso

- Acompanamiento emocional conversacional: un chat donde la persona desahoga y recibe respuestas humanas, sin diagnosticos ni vocabulario clinico. El modelo esta ajustado especificamente para ese registro, y su ventana de 4 096 tokens permite sostener una sesion de conversacion multi-turno razonablemente larga.
- Triaje con derivacion a recursos: en un producto de bienestar, el guardarrail de crisis del prompt permite detectar menciones de autolesion o ideacion suicida y responder con lineas de ayuda y una pregunta de seguridad, sin intentar resolver la situacion en ese mismo mensaje.
- Frente conversacional de un ensamblaje multi-agente: dentro del stack Kicaulah AI, este modelo actua como especialista en la materia emocional mientras un router deriva consultas tecnicas a otros especialistas; el autor describe el patron de "si la pregunta es realmente tecnica, lo dice con amabilidad y la pasa".
- Copiloto de bienestar en aplicaciones moviles de salud: un asistente no clinico que ofrece espacio de escucha y sugiere acudir a un profesional cuando corresponde, con la ventaja de que 3 000 millones de parametros permiten ejecucion local.
- Despliegue on-premise con datos sensibles: al ser un modelo de 3B con licencia Apache 2.0, puede desplegarse en infraestructura propia o incluso en portatil, evitando enviar contenido emocional a APIs de terceros.
- Chat de comunidad o Discord: un bot de acompanamiento para comunidades con moderacion, donde el tono calido reduce la sensacion de estar hablando con una macro de soporte.
- Prototipado de personas conversacionales: el prompt de sistema es reutilizable en cualquier modelo instruct, lo que permite comparar la misma persona sobre distintos modelos base antes de decidir un ajuste fino.
- Investigacion sobre estilo conversacional: util como caso de estudio de ajuste fino con QLoRA sobre un modelo de 3B para medir si el estilo "anti-robotico" se puede inducir con SFT de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni evaluaciones de empatia o seguridad, y no se han encontrado resultados independientes en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 6,2 GB para los pesos de 3 000 millones de parametros, mas el cache KV, lo que situa el total practico alrededor de 7 GB para 4 096 tokens de contexto.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,5-4 GB. En cuantizacion de 4 bits: aproximadamente 2-2,5 GB.
- GPU recomendadas: NVIDIA T4 (16 GB), RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, A10G, L4, A100 y H100. Para 3B no es necesario hardware de datacenter.
- Cabe con holgura en GPU de consumo: una RTX 3060 de 12 GB o una RTX 4090 ejecutan el modelo en bf16 sin cuantizar; una GPU de 8 GB requiere cuantizacion.
- CPU: viable con llama.cpp u Ollama en cuantizacion de 4 bits, con latencias mucho mas altas. El autor menciona el uso de `torch_dtype=torch.bfloat16` con soporte de CPU en el ejemplo de transformers.
- Opciones de despliegue: transformers (pipeline de text-generation), vLLM, TGI, llama.cpp u Ollama previa conversion a GGUF (no hay GGUF publicado), y el servidor propio del repositorio `scripts/serve.py`, que expone un endpoint compatible con OpenAI.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kicaulah/model-therapist | ~3B | 4 096 tokens (card); base hasta 32 768 | Apache 2.0 | Pesos no publicados; solo prompt de sistema y demo | Ajuste QLoRA de persona terapeutica |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32 768 tokens | Apache 2.0 | Pesos publicos en safetensors | Modelo base de este ajuste; sin persona terapeutica |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128 000 tokens | Llama 3.2 Community License | Pesos publicos con aceptacion de licencia | Contexto muy superior; licencia con restricciones para grandes desplegues |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128 000 tokens | MIT | Pesos publicos | Mayor enfasis en razonamiento; no ajustado para acompanamiento emocional |

No se dispone de benchmarks comparativos publicados para este ajuste fino, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Los pesos no estan publicados. La model card indica explicitamente que el repositorio aun no contiene los checkpoints y que se subiran al ejecutar el script de entrenamiento. Cualquier evaluacion seria del modelo requiere esperar a esa publicacion.
- No es un dispositivo medico ni un sustituto de atencion psicologica profesional. El propio autor lo declara asi y el modelo incluye un guardarrail de crisis, pero la responsabilidad de derivar a un profesional recae en el producto que lo integre.
- Riesgo de alucinacion: como cualquier modelo de 3B, puede generar afirmaciones incorrectas con tono confiado. En un contexto emocional, el riesgo relevante es dar consejo inapropiado o minimizar una senal de riesgo real.
- Idiomas: solo se declara ingles. No hay evidencia de calidad en castellano ni en otros idiomas; un usuario hispanohablante obtendra presumiblemente un rendimiento degradado o respuestas en ingles.
- Ventana de contexto corta: 4 096 tokens segun la model card, muy inferior a los 32 768 del modelo base y a los 128 000 de alternativas de 3B actuales. Esto limita sesiones largas y el uso de historiales extensos.
- Fecha de corte de conocimiento y sesgos del corpus de Qwen2.5: no documentados por el autor, pero heredados del modelo base.
- Seguridad clinica no evaluada: no se publican evaluaciones de comportamiento ante crisis, ni tasas de falsos positivos o falsos negativos del guardarrail definido en el prompt.
- Licencia Apache 2.0, permisiva para uso comercial, pero la licencia cubre los pesos publicados; el uso en contextos regulados de salud puede requerir cumplimiento normativo adicional no cubierto por la licencia.
- El repositorio tiene 0 descargas y 0 likes, y el sistema multi-agente descrito (cinco especialistas mas router) no esta verificado de forma independiente en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kicaulah/model-therapist
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Demo en vivo: https://huggingface.co/spaces/Kicaulah/Kicaulah-AI-Demo
- Perfil del autor en Hugging Face: https://huggingface.co/Kicaulah
- Modelos del autor: https://huggingface.co/Kicaulah/models
- Spaces del autor: https://huggingface.co/Kicaulah/spaces
- Recursos de crisis citados en el prompt de sistema: https://findahelpline.com y https://befrienders.org
- Referencia relacionada (sistema de terapia con deteccion emocional): https://github.com/AdityaPatil-AP/AI-Therapist
- Referencia relacionada (paper sobre un modelo pequeno alineado a conducta terapeutica): https://arxiv.org/pdf/2601.10246
- Hilo de discusion sobre modelos abiertos para terapia: https://www.reddit.com/r/LocalLLaMA/comments/147u0a3/best_open_source_model_for_therapy/
