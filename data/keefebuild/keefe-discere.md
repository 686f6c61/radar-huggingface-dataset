# KeefeBuild/Keefe-Discere

## Resumen

Keefe-Discere es un modelo de lenguaje de la familia Qwen2, desarrollado de forma independiente por KeefeBuild. Se construye sobre el checkpoint base Qwen/Qwen2.5-7B-Instruct y se adapta mediante una fusión de modelos (model merging) con componentes especializados en programación y matemáticas, concretamente Qwen2.5-Coder-7B-Instruct y Qwen2.5-Math-7B-Instruct. El objetivo declarado es combinar el seguimiento general de instrucciones con una mayor especialización en tareas de razonamiento, código y cálculo.

El modelo tiene aproximadamente 7.600 millones de parámetros, una longitud de contexto configurada de 32.768 tokens y se distribuye en formato BF16 (safetensors), GGUF Q4_K_M y adaptador LoRA. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia radica en ser un ejemplo de experimentación con técnicas de fusión de modelos sobre la familia Qwen2.5, ofreciendo una alternativa local y autocontenida para tareas de asistencia general, programación y matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (Transformer, causal LM) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q4_K_M |
| Idiomas soportados | ingles (declarado); herencia Qwen2.5 sugiere multilingue, no verificado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), GGUF, adaptador LoRA (PEFT) |

## Arquitectura y entrenamiento

Keefe-Discere utiliza la arquitectura Qwen2ForCausalLM, un transformer causal con 28 capas, 28 cabezas de atencion, 4 cabezas clave/valor y un tamano oculto de 3584. El vocabulario es de 152.064 tokens. El modelo se obtiene mediante una fusion de tipo DARE-TIES sobre tres componentes: el propio Keefe-Discere (peso 0,40), Qwen2.5-Coder-7B-Instruct (0,30) y Qwen2.5-Math-7B-Instruct (0,30), con una densidad de 0,53, mascara INT8 y tensores de salida en BF16.

No se especifican datos de entrenamiento propios (el campo datasets esta vacio), ni numero de tokens, ni metodos de alineacion como RLHF o DPO. El framework de entrenamiento declarado es Unsloth y el ecosistema Transformers. La fusion busca combinar las capacidades de seguimiento de instrucciones del modelo base con la especializacion en codigo y matematicas de los otros dos componentes.

## Capacidades

- Generacion de texto y seguimiento de instrucciones de proposito general.
- Razonamiento estructurado y resolucion de problemas paso a paso.
- Matematicas: algebra, aritmetica, ecuaciones, razonamiento cuantitativo y explicaciones matematicas.
- Programacion: generacion de codigo, explicacion, depuracion, refactorizacion, diseno de algoritmos y asistencia en desarrollo de software.
- Conversacion multi-turno y asistencia general (preguntas, resumen, lluvia de ideas, redaccion).
- Inferencia local en multiples runtimes: llama.cpp, Ollama, vLLM, SGLang, LM Studio.
- No se menciona soporte explicito de tool calling, function calling ni capacidades multimodales (vision, audio).

## Casos de uso

- Asistente de programacion local: el modelo puede generar y explicar codigo en un entorno offline, aprovechando la componente Coder fusionada. Es adecuado para entornos de desarrollo donde no se permite enviar codigo a servicios en la nube.
- Tutor de matematicas: puede descomponer problemas algebraicos y aritmeticos en pasos intermedios, util para plataformas educativas o asistentes de estudio con privacidad de datos.
- Generacion de documentacion tecnica: a partir de fragmentos de codigo o especificaciones, puede redactar explicaciones, comentarios y documentacion estructurada.
- Chatbot de soporte interno: con su ventana de 32K tokens, puede manejar conversaciones largas con historial extenso en empresas que requieran despliegue autoalojado.
- Experimentacion con model merging: el repositorio incluye la configuracion de fusion (DARE-TIES) y un adaptador LoRA, lo que lo convierte en un caso de estudio para investigadores interesados en tecnicas de combinacion de modelos.
- Inferencia en hardware modesto: la version GGUF Q4_K_M permite ejecutar el modelo en GPUs de consumo o incluso CPU con llama.cpp, habilitando aplicaciones de asistencia personal sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona cifras de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. No se pueden comparar metricas objetivas con otros modelos sin datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15-16 GB para los pesos (7,6B parametros en BF16) mas overhead de activaciones y cache KV. Cabe en una GPU de 24 GB (RTX 3090/4090, A10G).
- VRAM con cuantizacion GGUF Q4_K_M: aproximadamente 5-6 GB para los pesos, lo que permite ejecucion en GPUs de 8 GB (RTX 3070/4060) e incluso en CPU con suficiente RAM (16 GB+).
- GPUs recomendadas: RTX 4090 o A100 para BF16 con margen; RTX 3060/4060 para GGUF.
- Opciones de despliegue: Transformers (HuggingFace), vLLM, llama.cpp, Ollama, SGLang, LM Studio, FriendliAI (endpoint compatible).
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de 7B en BF16 en una RTX 4090 suele generar entre 40 y 80 tokens/s con vLLM, pero no hay datos confirmados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Keefe-Discere | 7,6B | 32K | Apache-2.0 | Fusion de instruct, coder y math |
| Qwen2.5-7B-Instruct (base) | 7,6B | 32K | Apache-2.0 | Instrucciones generales |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32K | Apache-2.0 | Programacion |
| Qwen2.5-Math-7B-Instruct | 7,6B | 32K | Apache-2.0 | Matematicas |

Keefe-Discere se posiciona como un intento de combinar los tres enfoques de Qwen en un unico modelo. Frente a sus componentes, no hay datos de rendimiento que demuestren una ventaja real; la comparativa es estructural, no empirica. Alternativas fuera de la familia Qwen (por ejemplo, Llama 3.1 8B o Mistral 7B) no son directamente comparables por diferencia de arquitectura y entrenamiento.

## Limitaciones y advertencias

- No hay datos publicados de benchmarks, por lo que el rendimiento real frente a Qwen2.5-7B-Instruct o sus variantes Coder/Math es desconocido. La fusion puede degradar capacidades en alguna de las areas.
- El modelo declara soporte solo para ingles. Aunque la arquitectura base Qwen2.5 es multilingue, no se ha verificado el comportamiento en otros idiomas tras la fusion.
- Riesgo de alucinacion y errores en tareas de razonamiento complejo, especialmente en matematicas avanzadas, sin evaluacion publica que permita calibrar su fiabilidad.
- La model card advierte que el adaptador LoRA incluido tiene metadatos potencialmente autoreferenciales; debe apuntarse al checkpoint base real antes de usarlo.
- No se especifican sesgos conocidos, pero al derivar de Qwen2.5, hereda los sesgos de su dataset de entrenamiento, que no estan documentados en este repositorio.
- Para produccion, se recomienda validar el modelo en el dominio concreto antes de desplegarlo, dado que no hay garantias de rendimiento ni evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KeefeBuild/Keefe-Discere
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Componente de codigo: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Componente de matematicas: https://huggingface.co/Qwen/Qwen2.5-Math-7B-Instruct
- Endpoint de inferencia (FriendliAI): https://friendli.ai/models/KeefeBuild/Keefe-Discere
- Perfil del autor en GitHub: https://github.com/CallmeKeefe
