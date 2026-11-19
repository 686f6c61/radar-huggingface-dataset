# openbmb/MiniCPM5-1B

## Resumen

MiniCPM5-1B es el primer checkpoint de la serie MiniCPM5, desarrollado por OpenBMB. Se trata de un modelo de lenguaje causal denso de 1.080.632.832 parametros (679.552.512 sin contar los embeddings) construido sobre la arquitectura estandar `LlamaForCausalLM`, disenado especificamente para despliegue local, en dispositivo y en escenarios con recursos limitados. Su propuesta central es alcanzar el estado del arte entre los modelos open source de la clase 1B manteniendo una huella de despliegue muy reducida.

El modelo incorpora soporte nativo de contexto largo de hasta 131.072 tokens, razonamiento hibrido (modo Think / No Think conmutables mediante el parametro `enable_thinking` sobre la misma instantanea de pesos) y capacidades de tool calling y uso agentico. Segun el autor, su ventaja frente a modelos comparables se concentra en el uso de herramientas, la generacion de codigo y el razonamiento complejo, lo que lo posiciona como candidato para asistentes locales, agentes de codificacion y flujos de trabajo con function calling.

La relevancia actual del modelo radica en su receta de entrenamiento completa y reproducible: OpenBMB publica junto al modelo los corpus utilizados (Ultra-FineWeb, Ultra-FineWeb-L3, UltraData-Math y UltraData-SFT-2605), ademas de checkpoints intermedios (Base y SFT) y formatos alternativos (GGUF para llama.cpp/Ollama y MLX 4-bit para Apple Silicon). Todo ello bajo licencia Apache 2.0, lo que facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (`LlamaForCausalLM`) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no aplica (modelo denso) |
| Parametros sin embeddings | 679.552.512 |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16 (pesos publicados); GGUF (llama.cpp / Ollama / LM Studio); MLX 4-bit para Apple Silicon |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF; MLX |
| Capas | 24 |
| Cabezas de atencion (GQA) | 16 para Q, 2 para KV |
| Tamano del repo | 2,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

MiniCPM5-1B es un transformer causal denso de 24 capas con atencion por grupos de consultas (GQA) de 16 cabezas para queries y 2 para claves/valores, lo que reduce el coste de memoria del KV cache en contextos largos. La arquitectura es la estandar `LlamaForCausalLM`, sin mecanismos exoticos como MoE o SSM, lo que simplifica la integracion con los runtimes existentes (transformers, vLLM, llama.cpp, TGI).

El entrenamiento sigue la metodologia de gestion de datos por niveles de UltraData, estructurada en tres fases. En la fase de preentrenamiento se realizan etapas de entrenamiento estable y de decaimiento para consolidar capacidades linguisticas; los corpus se publican como Ultra-FineWeb, Ultra-FineWeb-L3 y UltraData-Math. En la fase de mid-training se refuerzan capacidades objetivo y se adapta la distribucion de datos. El post-entrenamiento se divide en tres pasos: primero SFT con 200B tokens de datos de "deep-thinking" y 200B tokens de "hybrid-thinking" (publicados como UltraData-SFT-2605), despues entrenamiento de profesores de RL especializados en matematicas, codigo, QA de libro cerrado y escritura, y finalmente destilacion on-policy (OPD) de esos profesores en un unico modelo de publicacion. El checkpoint final combina RL y OPD; existe una version intermedia solo-SFT y una base solo-preentrenada.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat propia.
- Razonamiento hibrido: modo "Think" (razonamiento deliberado con etiqueta `<think>`) y modo "No Think" (respuesta rapida) conmutables via `enable_thinking` sobre los mismos pesos.
- Tool calling y function calling nativo, orientado a flujos agenticos.
- Razonamiento multi-paso y uso de agentes (destacado por el autor como punto fuerte).
- Generacion de codigo y asistencia a la programacion.
- Razonamiento matematico (entrenado con profesores de RL especificos de matematicas).
- Contexto largo de 131.072 tokens para documentos extensos y conversaciones prolongadas.
- Capacidades multilingues limitadas a ingles y chino.
- Despliegue en dispositivo (edge AI) y en entornos con recursos restringidos.

## Casos de uso

- Asistente local en escritorio: el modelo cabe en equipos de consumo y puede ejecutarse con llama.cpp u Ollama para ofrecer un asistente conversacional offline sin enviar datos a la nube, gracias a sus ~1B parametros y a la disponibilidad de GGUF.
- Agente de codificacion en IDE: con tool calling nativo y modo Think, puede encadenar lecturas de ficheros, ejecuciones de comandos y edicion de codigo en un bucle agentico local, reduciendo la dependencia de APIs externas.
- Automatizacion de soporte tecnico: la ventana de 131.072 tokens permite procesar historiales de incidencia y documentacion extensa en una sola pasada para generar respuestas contextualizadas.
- Procesamiento de documentos largos: resumen, extraccion de entidades y QA sobre contratos o informes de decenas de miles de tokens, aprovechando el contexto extendido y el modo No Think para respuestas rapidas.
- Funcion calling en pipelines de automatizacion: integracion como motor de decision que traduce lenguaje natural a llamadas estructuradas a APIs internas (CRM, ticketing, ERP) en entornos con requisitos de privacidad.
- Prototipado rapido de agentes: al publicarse tambien los checkpoints Base y SFT, sirve como punto de partida para fine-tuning especifico de dominio con un coste de computo bajo.
- Aplicaciones de escritorio ligeras: el proyecto MiniCPM Desk Pet demuestra el uso del modelo como motor de una mascota de escritorio con LLM local, un ejemplo de integracion en producto de consumo.

## Benchmarks y rendimiento

El autor declara estado del arte open source en la clase 1B frente a LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, con ventaja concentrada en uso de herramientas, generacion de codigo y razonamiento complejo. Sin embargo, en la informacion proporcionada no se incluyen los valores numericos de los benchmarks (MMLU, HumanEval, GSM8K u otros), solo las figuras comparativas del repositorio.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 2,2 GB solo para pesos, mas el KV cache (crece con el contexto; con GQA de 2 cabezas KV el coste por token es reducido).
- VRAM estimada en cuantizacion 4-bit (GGUF/MLX): del orden de 0,6-1 GB para pesos, lo que permite ejecucion en GPUs de gama baja y en memoria unificada de Apple Silicon.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 en contextos moderados; RTX 3060/4060, RTX 4090, A100 y H100 son sobradas para inferencia; en entornos de servidor puede ejecutarse en vLLM o TGI para batcheo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de escritorio o portatil con 4-8 GB de VRAM, y en CPU via llama.cpp.
- Opciones de despliegue: transformers, llama.cpp, Ollama, LM Studio, MLX (Apple Silicon), text-generation-inference, vLLM (compatible con endpoints y SageMaker segun los tags del repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B | 1,08B | 131.072 | Apache 2.0 | safetensors, GGUF, MLX | Razonamiento hibrido, tool calling, checkpoint Base/SFT publicados |
| LFM2.5-1.2B-Thinking | ~1,2B | no disponible | no disponible | no disponible | Baseline citado por el autor en la comparativa |
| Qwen3-0.6B/think | ~0,6B | no disponible | no disponible | no disponible | Baseline citado por el autor |
| Qwen3.5-0.8B/think | ~0,8B | no disponible | no disponible | no disponible | Baseline citado por el autor |

Los datos de contexto, licencia y formatos de los modelos comparables no se detallan en la informacion proporcionada; el autor los emplea unicamente como referencia de rendimiento en su leaderboard publico.

## Limitaciones y advertencias

- Idiomas: solo ingles y chino de forma nativa; el rendimiento en castellano no esta garantizado ni evaluado.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; como modelo entrenado sobre corpus web a gran escala, es previsible que herede sesgos de esos datos.
- Alucinacion: no se publican tasas de alucinacion; un modelo de 1B tiene menor capacidad de conocimiento factual que modelos mayores, por lo que conviene verificar salidas en dominios especializados.
- Contexto: aunque soporta 131.072 tokens, la calidad en el extremo superior de la ventana no esta cuantificada en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero deben revisarse las licencias de los datasets derivados si se redistribuyen pesos fine-tuneados.
- Produccion: el modo Think incrementa latencia y consumo de tokens; para aplicaciones sensibles a latencia conviene usar el modo No Think.
- El checkpoint final incorpora RL y OPD; para reproducibilidad o experimentos controlados puede ser preferible partir del checkpoint SFT o Base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-1B
- ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B
- Checkpoint SFT: https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Checkpoint Base: https://huggingface.co/openbmb/MiniCPM5-1B-Base
- GGUF: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- MLX 4-bit: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- UltraData Tiered Data Management: https://arxiv.org/pdf/2602.09003
- Wiki de MiniCPM (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
