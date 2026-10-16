# bayazidhs04/bangla-smollm-135m-cupcake

## Resumen

bangla-smollm-135m-cupcake es un modelo de lenguaje causal de pequeno tamano (209.985.408 parametros segun los pesos publicados en safetensors) especializado en conversacion emocional en bengali, ingles y banglish (bengali romanizado). Lo desarrolla el usuario bayazidhs04 y se obtiene mediante un ajuste fino con QLoRA sobre rnnandi/bangla-smollm-135m, un derivado de la familia SmolLM-135M con vocabulario ampliado para bengali. Su proposito no es responder preguntas factuales ni generar codigo, sino actuar como companero conversacional en el dispositivo dentro del proyecto CupCake, donde responde con una etiqueta de emocion inicial, una accion opcional entre asteriscos y texto breve e informal.

La relevancia del modelo esta en su perfil de despliegue: con solo 210 millones de parametros y una ventana de contexto de 8192 tokens, cabe en un telefono movil o en placas de bajo consumo mediante los cuantizados GGUF publicados (el Q4_0 ocupa aproximadamente 127 MB). La salida sigue una convencion de etiquetas de emocion observadas (`[happy]`, `[sad]`, `[angry]`, `[sleepy]`, entre otras) que la aplicacion anfitriona usa para animar la cara del companero virtual.

El modelo se distribuye bajo licencia Apache-2.0, heredada del modelo base, y esta orientado explicitamente a turnos cortos y casuales. El autor advierte que no esta alineado con seguridad (sin etapa de RLHF ni DPO), que su bengali es a menudo agramatical y de estilo mixto, y que no debe usarse en decisiones de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo LLaMA (`model_type: llama`) |
| Parametros totales | 209.985.408 (pesos safetensors); la model card indica ~210,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (max sequence length declarado); entrenamiento con 2048 |
| Tipos de cuantizacion | GGUF F16 y GGUF Q4_0 publicados; tambien fp16 en safetensors |
| Idiomas soportados | Bengali (`bn`), ingles (`en`) y bengali romanizado (banglish) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16, ~420 MB), GGUF F16 (~415 MB), GGUF Q4_0 (~127 MB) |
| Capas | 30 |
| Tamano oculto | 576 |
| Cabeceras de atencion / KV | 9 / 3 (GQA) |
| Tamano intermedio | 1536 |
| Tamano de vocabulario | 180.177 |
| Precision declarada | float16 |

## Arquitectura y entrenamiento

Se trata de un transformer causal denso con la arquitectura LLaMA, heredada de la familia SmolLM-135M. Consta de 30 capas, dimension oculta de 576, atencion con 9 cabeceras de consulta y 3 cabeceras KV (atencion con consultas agrupadas), tamano intermedio de 1536 y un vocabulario de 180.177 tokens, mucho mayor que el habitual en modelos de este tamano, presumiblemente para cubrir la escritura bengali y el banglish. La ventana maxima declarada es de 8192 tokens, aunque el ajuste fino se realizo con una longitud maxima de 2048.

El entrenamiento consistio en un ajuste QLoRA sobre el modelo base cuantizado a 4 bits, con adaptadores LoRA de rango 8, alpha 16, dropout 0,05 y objetivos en `q_proj`, `k_proj`, `v_proj` y `o_proj`. Se entrenaron 921.600 parametros (aproximadamente el 0,44 % del total) durante 3 epocas, con tamano de lote efectivo de 16 (4 x 4 de acumulacion), tasa de aprendizaje 2e-4 con planificador coseno, 50 pasos de calentamiento, weight decay 0,01, precision fp16 con maestro fp32, semilla 42 y una unica GPU Tesla T4 de 16 GB en Kaggle. El dataset utilizado es bayazidhs04/cupcake-liltii, con unas 4000 muestras de chat banglish etiquetadas por emocion (turno unico y multiturno), divididas en 3600 de entrenamiento y 400 de validacion. El artefacto publicado es el adaptador LoRA fusionado de nuevo en el modelo base fp16. No hubo etapa de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional breve, en tono casual e informal, en bengali, ingles y banglish.
- Emision de una etiqueta de emocion inicial que codifica el estado afectivo del turno (`[happy]`, `[sad]`, `[angry]`, `[surprised]`, `[confused]`, `[sleepy]`, `[excited]`, `[neutral]`, `[shy]`, `[bored]`).
- Generacion de acciones escenicas opcionales delimitadas entre asteriscos, por ejemplo `*lies down*`.
- Mantenimiento de conversaciones multiturno de estilo rol, con coherencia de personaje en tramos cortos.
- Respuestas cortas optimizadas para un companero virtual en el dispositivo.
- Soporte de plantilla de chat mediante `apply_chat_template` de Transformers.
- Ejecucion local mediante llama.cpp con los cuantizados GGUF publicados.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de vision, audio ni modo de razonamiento extendido.
- No esta entrenado para codigo, matematicas ni respuesta a preguntas factuales.

## Casos de uso

- Companero conversacional en el dispositivo: el modelo se integra en una aplicacion movil que conversa con el usuario en banglish y usa la etiqueta de emocion para animar un avatar o una cara. Su tamano (127 MB en Q4_0) permite ejecutarlo en el telefono sin conexion.
- Juguete o dispositivo conectado con microcontrolador: la model card menciona su uso junto a un microcontrolador vinculado por Bluetooth Low Energy, de modo que el modelo aporta el texto y el microcontrolador la expresion fisica o el movimiento.
- Rol y entretenimiento conversacional: gracias al ajuste sobre datos con acciones entre asteriscos, resulta adecuado para personajes con personalidad fija en aplicaciones de chat ligeras.
- Prototipado rapido de interfaz afectiva: sirve para validar un flujo de producto que necesite etiquetas de emocion sin depender de un clasificador de afecto aparte, aunque el autor advierte que las etiquetas no son un clasificador fiable.
- Demostraciones de modelos en bengali para docencia o investigacion: con 210 millones de parametros y entrenamiento reproducible en una T4, es util como caso de estudio de ajuste QLoRA multilingue con vocabulario ampliado.
- Inferencia en hardware muy limitado: en despliegues donde no cabe un modelo de miles de millones de parametros, permite ofrecer respuesta en lengua bengali sobre CPU o GPU integrada.
- Chat de acompanamiento de bajo coste sin requisitos de precision factual: al no necesitar exactitud, encaja en escenarios de animo o rutina donde prima la rapidez de respuesta y no la veracidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card esta vacio y no se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 0,5-1 GB considerando solo los pesos (~420 MB) mas el contexto y las activaciones.
- VRAM estimada con GGUF Q4_0: en torno a 0,2-0,4 GB, apta para ejecucion en CPU con llama.cpp.
- GPU recomendada para entrenamiento: una unica Tesla T4 de 16 GB, segun el propio autor.
- GPU para inferencia: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090), asi como iGPU y CPU.
- Cabe sin problema en GPUs de consumo e incluso en moviles y placas de bajo consumo con el cuantizado Q4_0.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM`, llama.cpp (`llama-cli`), y llama-server; la model card lista la etiqueta `text-generation-inference` y el repositorio incluye GGUF compatible con Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El autor recomienda emplear el GGUF Q4_0 para inferencia local y ajustar `temperature` entre 0,7 y 0,9.
- Nota tecnica sobre cuantizacion: las dimensiones del modelo (oculto 576, proyeccion KV 192, vocabulario 180.177) no son divisibles por los bloques de 256 elementos que requieren los cuantizados Q2_K, Q3_K y Q4_K, por lo que llama.cpp aplica de forma silenciosa tipos de mayor precision a casi todos los tensores. Por ello el autor recomienda Q4_0, que usa bloques de 32 elementos y alcanza 4,50 bits por peso con embeddings y tensor de salida cuantizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| bangla-smollm-135m-cupcake | 209.985.408 | 8192 | bn, en, banglish | Apache-2.0 | Companero emocional bengali/banglish |
| SmolLM-135M (familia base) | 135 M (aprox.) | no disponible | en (principalmente) | Apache-2.0 | Modelo generalista pequeno en ingles |
| Qwen2.5-0.5B | 0,5 B (aprox.) | no disponible | multilingue | no disponible | Modelo generalista pequeno |
| TinyLlama-1.1B | 1,1 B (aprox.) | no disponible | en (principalmente) | Apache-2.0 | Modelo generalista pequeno |

Los datos de rendimiento comparado no estan disponibles al no haberse publicado benchmarks. La diferencia mas relevante frente a los modelos generalistas de su categoria es el vocabulario de 180.177 tokens orientado a bengali y banglish, junto con el ajuste especifico para emitir etiquetas de emocion, capacidades que los modelos generalistas no ofrecen de serie.

## Limitaciones y advertencias

- Entrenado sobre un conjunto pequeno y sintetico o aumentado de chat banglish; las salidas suelen ser mezclas no gramaticales de bengali e ingles y deben tratarse como recurso estilistico, no como bengali correcto.
- Puede reproducir estereotipos o jerga inapropiada presentes en los datos de entrenamiento.
- No esta alineado con seguridad: no hay etapa de RLHF ni de DPO. El autor desaconseja desplegarlo ante usuarios finales sin un filtro de salida y pide mantener la persona del companero deliberadamente no abusiva.
- Las etiquetas de emocion son convenciones aprendidas del dataset, no un clasificador de afecto fiable.
- Riesgo de alucinacion: el modelo no esta disenado para responder preguntas factuales, asi que cualquier dato factual que genere debe considerarse no fiable.
- Fuera de alcance: respuesta a preguntas factuales, generacion de codigo, matematicas y cualquier soporte a decisiones de alto riesgo o de ambito sanitario, legal o financiero.
- La generacion de texto largo queda fuera de su diseno; esta ajustado para turnos breves y casuales.
- Limitaciones de idioma: el soporte se centra en bengali, ingles y banglish; no hay garantia de buen rendimiento en otras lenguas.
- Licencia Apache-2.0, heredada del modelo base, sin restriccion documentada para uso comercial, aunque el propio autor recomienda no desplegarlo en produccion sin filtros de seguridad y sin advertir al usuario de que las respuestas son generadas por un modelo.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bayazidhs04/bangla-smollm-135m-cupcake
- Modelo base: https://huggingface.co/rnnandi/bangla-smollm-135m
- Dataset de ajuste: https://huggingface.co/datasets/bayazidhs04/cupcake-liltii
- Perfil del autor: https://huggingface.co/bayazidhs04
- Cita sugerida por el autor: `@misc{bangla-smollm-135m-cupcake, title = {bangla-smollm-135m-cupcake}, author = {bayazidhs04}, year = {2026}, howpublished = {\url{https://huggingface.co/bayazidhs04/bangla-smollm-135m-cupcake}}}`
- No se han encontrado papers, blogs ni repositorios adicionales en la informacion disponible.
