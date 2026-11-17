# caririsynth/Qwen2.5-1.5B-Nordeste-LoRA

## Resumen

Qwen2.5-1.5B-Nordeste-LoRA es un adaptador LoRA desarrollado por caririsynth que especializa el modelo base Qwen/Qwen2.5-1.5B en portugues de Brasil de la region nordeste (portugues nordestino). El adaptador busca resolver un problema concreto: los modelos multilingues compactos, incluso los que cubren portugues, tienden a producir prosa generica de web, plantillas periodisticas del sureste de Brasil o fragmentos de blogs cuando se les pide generar portugues regional nordestino. En algunos casos, prompts con jerga regional fuerte provocan cambios de codigo no deseados hacia el ingles.

El adaptador se entrena sobre el corpus caririsynth/Corpus-nordeste-10k, que combina literatura de dominio publico de autores nordestinos, textos filtrados por sintaxis y lexico regional, y escenarios culturales, historicos y cotidianos aumentados. El objetivo es preservar la cadencia literaria, el lexico regional y el contexto cultural nordestino manteniendo un modelo lo bastante ligero para despliegue en CPU, movil y edge.

Tecnicamente es un adaptador PEFT de rango 16 que anade 18,46 millones de parametros entrenables (1,18%) sobre los 1.562 millones del modelo base. El checkpoint seleccionado es la epoca 1 (paso 660), elegido para preservar diversidad generativa y evitar patrones repetitivos de final de frase observados en pasos posteriores. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 1.562.179.072 (modelo base) + 18.464.768 entrenables en el adaptador (1,18%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (max_seq_length de entrenamiento: 1024) |
| Tipos de cuantizacion | 4-bit QLoRA durante entrenamiento; el adaptador se distribuye en safetensors (fp16/bf16 segun carga) |
| Idiomas soportados | portugues (pt), con enfasis en portugues nordestino de Brasil |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen2.5-1.5B, un transformer decoder-only de la familia Qwen2.5. La configuracion LoRA usa rango r=16, alpha=16, dropout=0 y modulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, es decir, atencion completa y capas MLP. El entrenamiento se realizo con Unsloth y Hugging Face TRL (SFTTrainer) en una unica NVIDIA Tesla T4 de 16 GB, con QLoRA de 4 bits y computo en fp16.

Hiperparametros principales: max_seq_length 1024, batch efectivo de 16 (4 por dispositivo x 4 pasos de acumulacion), learning rate 2e-4 con scheduler cosine y 30 pasos de warmup, optimizador adamw_8bit con weight decay 0.01. El dataset es caririsynth/Corpus-nordeste-10k (split train, 10.555 registros curados), compuesto por literatura de dominio publico de autores nordestinos, textos filtrados por sintaxis y lexico regional, y aumentacion contextual de escenarios culturales, historicos y cotidianos. No se menciona RLHF ni DPO; el entrenamiento es supervisionado (SFT) sobre el corpus. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en portugues de Brasil con registro regional nordestino: lexico, cadencia literaria y expresiones idiomaticas propias de la region.
- Mantenimiento de coherencia narrativa en prompts con jerga regional, evitando el cambio de codigo a ingles observado en el modelo base.
- Generacion de prosa narrativa y dialogos con contexto cultural nordestino (escenas cotidianas, referencias historicas y culturales).
- Capacidades heredadas del modelo base Qwen2.5-1.5B en tareas generales de generacion de texto, aunque el adaptador esta especializado en el dominio regional.
- No se documenta soporte explicito de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking en la model card del adaptador.
- Capacidad multilingue limitada al portugues segun la model card (language: pt); no se documentan otros idiomas.

## Casos de uso

- Generacion de narrativa y ficcion regional: el adaptador produce prosa con cadencia literaria nordestina y lexico autentico, adecuado para relatos, cuentos y escenas costumbristas que requieran registro regional coherente.
- Creacion de dialogos para personajes nordestinos: util en guiones, videojuegos o narrativa interactiva donde los personajes deben hablar con expresiones y giros propios de la region sin caer en estereotipos genericos.
- Contenido cultural y divulgativo: generacion de textos sobre historia, cultura y escenarios cotidianos del nordeste de Brasil, aprovechando la aumentacion contextual del corpus de entrenamiento.
- Prototipado rapido en edge y movil: al ser un adaptador sobre un modelo de 1.5B, puede desplegarse en CPU, movil y dispositivos edge, lo que permite experimentar con generacion regional sin infraestructura GPU dedicada.
- Investigacion en NLP regional: sirve como punto de partida para estudiar adaptacion de modelos compactos a variedades dialectales y para comparar el comportamiento base frente al adaptado en portugues nordestino.
- Educacion y preservacion linguistica: generacion de ejemplos de vocabulario y expresiones regionales para materiales didacticos o proyectos de documentacion del portugues nordestino.
- Filtrado y aumento de datos regionales: puede emplearse para generar variantes de texto con registro nordestino en pipelines de aumentacion de datos para otros entrenamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente una evaluacion cualitativa comparativa base frente a LoRA con los mismos parametros de generacion (seed=42, temperature=0.65, top_p=0.9, repetition_penalty=1.15, max_new_tokens=100):

| Prompt | Base Qwen2.5-1.5B | Qwen2.5-1.5B-Nordeste-LoRA |
|---|---|---|
| "E aí, macho, tu vai pro forró hoje ou vai ficar de" | Colapsa en metadatos de blog ("Blog do Zico / Home / Sem categoria...") | "...plantão no quarteirão? Pois vá logo que o forró chega devagar quase parando!" |
| "O cabra chegou na bodega todo aperreado, pedindo" | Deriva del tema y filtra ingles ("Could you please") | "...buchada e canjica geladinha. Todo mundo riu, que no sertão até a pressa tem bom humor." |
| "Vixe Maria, o sol hoje tá de rachar mamona, bora ali" | Pierde coherencia y cambia de tono ("Postado no blog...") | "...na praça da matriz pegar um café coado e esperar que ele melhore..." |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en fp16 requiere aproximadamente 3,1 GB solo para pesos; en 4 bits, en torno a 1 GB. El adaptador LoRA anade unos 37 MB en fp16 (18,46 M parametros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (por ejemplo, RTX 3050, RTX 4060) y 2 GB o menos para cuantizacion 4 bits. El entrenamiento se realizo en una Tesla T4 de 16 GB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en GPUs de gama baja con cuantizacion.
- Opciones de despliegue: transformers + peft (documentado en la model card), Unsloth para entrenamiento; para inferencia cuantizada puede combinarse con llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF (no documentado en la model card).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Nordeste-LoRA | 1.562 M + 18,46 M (adaptador) | no disponible (entrenamiento a 1024) | Portugues nordestino de Brasil | Apache 2.0 | Hugging Face (PEFT) |
| Qwen/Qwen2.5-1.5B (base) | 1.562 M | no disponible en esta ficha | Multilingue general | Apache 2.0 | Hugging Face |
| Modelos portugueses compactos de proposito general | no disponible | no disponible | Portugues general | variable | no disponible |

No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un corpus regional curado, puede reproducir estereotipos o generalizaciones sobre el nordeste de Brasil; no se documenta una evaluacion de sesgos.
- Riesgo de alucinacion: como cualquier modelo de 1.5B, puede generar contenido facticamente incorrecto, especialmente en contextos historicos o culturales; la model card no documenta mitigaciones.
- Limitaciones de contexto e idioma: el adaptador esta especializado en portugues nordestino; su rendimiento en portugues estandar, otros dialectos o en otros idiomas no esta documentado y probablemente sea inferior al del modelo base. La longitud de contexto del modelo base no se detalla en la model card y el entrenamiento se limito a 1024 tokens.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse tambien la licencia del modelo base Qwen2.5-1.5B (Apache 2.0). No se documentan restricciones adicionales del autor.
- Caveats para produccion: el checkpoint seleccionado es la epoca 1 (paso 660) para evitar repeticiones; pasos posteriores mostraban patrones repetitivos de final de frase. El adaptador tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion de la comunidad. No se documentan pruebas de robustez, seguridad ni evaluacion cuantitativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caririsynth/Qwen2.5-1.5B-Nordeste-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/caririsynth/Corpus-nordeste-10k
