# francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed3407

## Resumen

El modelo `francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed3407` es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/urd_arab_100mb`, orientado a generación de texto en el ámbito de las lenguas urdu y árabe. Lo publica el usuario de HuggingFace francesca9805, con una única revisión creada en octubre de 2026 y sin descargas ni valoraciones registradas en el momento de redactar esta ficha. El interés principal no está en sus capacidades absolutas, sino en que documenta un experimento reproducible de ajuste con TRL sobre un modelo pequeño multilingüe (urdu-árabe), con semilla fija (`seed3407`) y registro de entrenamiento en Weights & Biases.

Técnicamente se trata de un transformer decoder-only de la familia GPT-2, con 124.770.816 parámetros totales confirmados en los pesos `safetensors` del repositorio (aproximadamente 0,3 GB de tamaño de repo). Es, por tanto, un modelo de escala "small", entrenable y desplegable en hardware muy modesto, incluso en CPU. La arquitectura es densa, sin mezcla de expertos ni mecanismos de atención lineal o SSM.

Su relevancia es acotada: sirve como punto de partida para quien quiera reproducir un pipeline de SFT con TRL sobre modelos Goldfish, como referencia de fine-tuning en lenguas de bajos recursos, o como baseline ligero para tareas de generación de texto en urdu y árabe. La model card es mínima y no documenta composición del dataset, número de tokens de entrenamiento ni resultados de evaluación, lo que limita seriamente su uso en producción sin una validación previa por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (según tag `gpt2` del repositorio) |
| Parametros totales | 124.770.816 (dato real de los safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (GPT-2 usa típicamente 1024 tokens, sin confirmar para este ajuste) |
| Tipos de cuantizacion | No se publican versiones cuantizadas; los pesos están en safetensors (probablemente fp32 o fp16, sin confirmar) |
| Idiomas soportados | Urdu y árabe, inferidos del nombre del modelo base (`urd_arab_100mb`); la model card no declara idiomas explícitamente |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin especificar términos) |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo GPT-2, con 124,77 millones de parámetros. No hay indicios de mezcla de expertos, atención dispersa, capas recurrentes ni esquemas híbridos: es un modelo denso convencional con atención causal completa. El modelo base, `goldfish-models/urd_arab_100mb`, pertenece a la colección Goldfish de modelos multilingües de investigación; el sufijo `100mb` hace referencia al volumen de datos de entrenamiento y el identificador `urd_arab` a la combinación de urdu y árabe.

El ajuste se realizó mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El autor registró el entrenamiento en Weights & Biases bajo el proyecto `new-tokenizers`, con el run `e6otdcd2`. La nomenclatura del modelo (`ppt-mp-struct-100mb_seed3407`) sugiere una variante experimental de tokenización o de estructura de prompt, pero no se documenta su significado ni la composición del dataset de SFT, el número de tokens vistos, la duración del entrenamiento o los hiperparámetros. Tampoco se indica si hubo etapas posteriores de alineación (RLHF, DPO) más allá del SFT.

## Capacidades

- Generación de texto autoregresiva estándar, con la plantilla conversacional de `pipeline("text-generation")` que muestra la propia model card (mensajes con rol `user`).
- Soporte declarado para `text-generation-inference` y para endpoints compatibles, según los tags del repositorio.
- Capacidad multilingüe limitada al par urdu-árabe del modelo base; no hay evidencia de cobertura de otras lenguas.
- Razonamiento, matemáticas y generación de código: no documentados ni evaluados en la información disponible.
- Tool calling / function calling: no disponible; no se menciona en la model card ni en los tags.
- Modo de razonamiento explícito (thinking), visión, audio o cualquier modalidad adicional: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.

## Casos de uso

- Investigación en lenguas de bajos recursos: utilizar el modelo como baseline reproducible para comparar estrategias de tokenización o de SFT en urdu y árabe, aprovechando que el run de entrenamiento está registrado en W&B y la semilla está fijada.
- Reproducción de pipelines de SFT con TRL: el repositorio sirve como ejemplo funcional de ajuste supervisado con TRL 0.23.0 sobre un modelo Goldfish, útil para validar configuraciones de entrenamiento antes de escalar a modelos mayores.
- Generación de texto experimental en urdu y árabe: completado de frases y continuaciones cortas en contextos de investigación lingüística, siempre con revisión humana por la ausencia de evaluación publicada.
- Clasificación o etiquetado vía generación: adaptando el prompt, puede emplearse para tareas de etiquetado ligero en corpus urdu-árabe, con la ventaja de que cabe en una sola GPU consumer.
- Prototipado en entornos sin GPU: al tratarse de 124,77 M de parámetros, permite iterar en portátiles o instancias CPU antes de decidir si merece la pena escalar a un modelo mayor.
- Docencia y experimentación educativa: sirve para ilustrar el ciclo completo de publicación de un modelo en HuggingFace (entrenamiento con TRL, subida de safetensors, registro en W&B) sin requerir infraestructura costosa.
- Evaluación de técnicas de prompt: al tener plantilla de chat en la model card, es utilizable para estudiar cómo responde un modelo pequeño entrenado con SFT a distintos formatos de instrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluación, y los resultados de búsqueda web recibidos no contienen información relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada: no publicada. Por tamaño de parámetros, la inferencia en fp16/bf16 requiere del orden de 0,25 GB de pesos más el caché KV; en fp32, alrededor de 0,5 GB. Cualquier GPU con 2 GB o más debería ser suficiente para contextos moderados.
- GPU recomendadas: no hay recomendaciones oficiales. Por escala, cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobradamente suficiente; también GPU de datacenter (A100, H100) sin ninguna ventaja práctica sobre una consumer.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer de los últimos diez años, e incluso en CPU y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference y endpoints compatibles (declarados en los tags del repositorio). vLLM, llama.cpp, Ollama y TGI son viables en principio, pero no hay confirmación del autor ni conversiones GGUF publicadas.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed3407 | 124,77 M (dato real) | No disponible | No disponible | HuggingFace, 0 descargas | Ajuste SFT sobre Goldfish urd_arab |
| goldfish-models/urd_arab_100mb (modelo base) | No disponible | No disponible | No disponible | HuggingFace | Modelo base multilingüe urdu-árabe de la colección Goldfish |
| GPT-2 small (referencia de arquitectura) | 124 M | 1024 tokens | MIT | Ampliamente disponible | Mismo orden de parámetros y arquitectura; licencia y contexto conocidos, a diferencia del modelo descrito |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada, por lo que no es posible afirmar nada sobre su calidad de generación en urdu o árabe.
- Model card mínima: no se documenta el dataset de SFT, el número de tokens de entrenamiento, los hiperparámetros ni el significado de la nomenclatura `ppt-mp-struct`.
- Licencia no especificada: la model card contiene `licence: license` sin términos concretos. No se puede asumir uso comercial permitido; hay que consultar al autor o al modelo base antes de cualquier despliegue productivo.
- Riesgo de alucinación: al ser un modelo de 124 M de parámetros sin evaluación, la probabilidad de generar contenido factualmente incorrecto o incoherente es alta, especialmente fuera de dominios vistos en entrenamiento.
- Cobertura lingüística incierta: aunque el nombre del modelo base indica urdu y árabe, no hay confirmación de qué variedades, registros o scripts cubre el ajuste.
- Longitud de contexto no confirmada: si hereda la configuración de GPT-2, el límite estaría en torno a 1024 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse capacidad de integración en pipelines que requieran function calling.
- Cero adopción: 0 descargas y 0 likes implican que no existe validación comunitaria ni informes de errores que sirvan de referencia.
- Reproducibilidad parcial: aunque la semilla está fijada, la ausencia de detalles del dataset impide reproducir exactamente el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/urd-arab-100mb-ppt-mp-struct-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/urd_arab_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/e6otdcd2
- Repositorio de TRL: https://github.com/huggingface/trl
