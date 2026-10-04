# Mafiaorigin22/Mixtral-8x7B-Instruct-v0.1

## Resumen

Mixtral-8x7B-Instruct-v0.1 es un modelo de lenguaje generativo de tipo Mixture of Experts (MoE) disperso desarrollado por Mistral AI. Esta ficha corresponde a la copia publicada por el usuario Mafiaorigin22 en HuggingFace, que reproduce los pesos del modelo original de Mistral AI y utiliza el modelo base mistralai/Mixtral-8x7B-v0.1. Se trata, por tanto, de una resubida (mirror) con licencia Apache-2.0 y no de un desarrollo propio del autor de la copia.

El modelo resuelve tareas de generacion de texto, razonamiento e instrucciones en cinco idiomas (frances, italiano, aleman, espanol e ingles) y se posiciona como una alternativa abierta a modelos densos considerablemente mayores. Segun la model card original, supera a Llama 2 70B en la mayoria de los benchmarks probados por Mistral AI, con un coste de inferencia mas cercano al de un modelo de unos 13 mil millones de parametros activos.

La relevancia actual del modelo radica en ser uno de los primeros MoE abiertos de gran tamano publicados con licencia permisiva, con una ventana de contexto de 32.768 tokens y pesos en formato safetensors compatibles con vLLM y con transformers. El repositorio concreto analizado tiene 0 descargas y 0 "likes", un tamano de 190,5 GB y fue creado el 2026-10-03.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts disperso (SMoE) sobre transformer decoder; 8 expertos por capa con enrutamiento top-2 |
| Parametros totales | 46.702.792.704 (~46,7 mil millones) |
| Parametros activos | ~12,9 mil millones por token (top-2 de 8 expertos) |
| Longitud de contexto | 32.768 tokens (32k) |
| Tipos de cuantizacion | FP16/BF16 (segun la model card); en este repositorio solo se distribuyen pesos safetensors, no hay GGUF/GPTQ/AWQ |
| Idiomas soportados | frances, italiano, aleman, espanol, ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Mixture of Experts disperso (SMoE) construido sobre una arquitectura transformer decoder. En cada capa, la capa de feed-forward se sustituye por 8 expertos independientes y un enrutador que selecciona los 2 expertos mas adecuados para cada token. Esto implica que, pese a contar con 46,7 mil millones de parametros totales, solo se activan aproximadamente 12,9 mil millones por token procesado, lo que reduce el coste computacional de inferencia respecto a un modelo denso equivalente.

El modelo base, mistralai/Mixtral-8x7B-v0.1, fue preentrenado sobre datos multilingues procedentes de la web abierta, y la version Instruct se obtuvo mediante ajuste por instrucciones. La model card original indica que el ajuste Instruct es una "demostracion rapida" de que el modelo base puede afinarse para lograr un rendimiento competitivo. El numero exacto de tokens de entrenamiento, la composicion detallada del dataset y los detalles del pipeline de alineamiento (RLHF/DPO) no se especifican en la informacion disponible. El modelo no incorpora mecanismos de moderacion.

La model card describe el formato de instrucciones, que debe respetarse estrictamente para evitar salidas suboptimas: `<s> [INST] Instruction [/INST] Model answer</s> [INST] Follow-up instruction [/INST]`, donde `<s>` y `</s>` son los tokens especiales BOS y EOS. Se recomienda el uso de plantillas de chat en transformers para aplicar el formato correcto.

## Capacidades

- Generacion de texto e instrucciones en cinco idiomas: frances, italiano, aleman, espanol e ingles.
- Razonamiento y respuesta a instrucciones de proposito general, con soporte de conversaciones multiturno.
- Generacion de codigo y resolucion de tareas tecnicas derivadas del preentrenamiento en datos de web y programacion.
- Seguimiento de formato mediante plantillas de instruccion `[INST]...[/INST]` y plantillas de chat de transformers.
- Compatibilidad declarada con vLLM para servir el modelo.
- No se documentan capacidades de vision, audio ni tool calling / function calling en la informacion proporcionada.
- El modelo no incluye mecanismos de moderacion ni de filtrado de contenido.

## Casos de uso

- Generacion y asistencia de codigo: dado que parte de un preentrenamiento multilingue, puede emplearse como asistente en editores o pipelines de desarrollo para autocompletar, explicar y refactorizar codigo.
- Atencion al cliente automatizada: su ventana de 32.768 tokens permite gestionar conversaciones multiturno con historiales largos sin perder el contexto previo.
- Traduccion y procesamiento multilingue: al cubrir cinco idiomas, puede usarse para traduccion, resumen y transformacion de textos entre frances, italiano, aleman, espanol e ingles.
- Analisis de documentos extensos: la ventana de 32k tokens permite resumir y extraer informacion de informes, articulos o contratos largos en una sola pasada.
- Generacion aumentada por recuperacion (RAG): combinado con una base vectorial, puede responder preguntas sobre documentacion corporativa inyectando fragmentos recuperados en el contexto.
- Chatbots de proposito general: sirve como motor de conversacion en aplicaciones de asistente, dado su ajuste por instrucciones y su licencia Apache-2.0.
- Servicio en produccion con vLLM: el repositorio declara compatibilidad con vLLM, lo que permite desplegarlo como endpoint de inferencia de alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original afirma de forma cualitativa que Mixtral-8x7B "supera a Llama 2 70B en la mayoria de los benchmarks" probados por Mistral AI, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K u otros conjuntos. No se deben inventar numeros.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 93 GB solo para pesos, mas memoria para el KV cache y activaciones; requiere multiples GPU.
- VRAM estimada en INT8: aproximadamente 47 GB, ajustable en una unica GPU de 80 GB.
- VRAM estimada en 4 bits (GPTQ/AWQ/GGUF): aproximadamente 24-26 GB; entra de forma ajustada en una RTX 4090 de 24 GB o con holgura en una A6000 de 48 GB.
- GPU recomendadas: 2x A100 80GB o 2x H100 80GB para FP16; 1x A100 80GB o 1x H100 80GB para INT8; 1x RTX 4090, 1x RTX 3090 (2 unidades en 4 bits) o 1x A6000 para cuantizacion de 4 bits.
- Compatible con GPU de consumo mediante cuantizacion agresiva; el FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM (libreria declarada en el repositorio), transformers, llama.cpp, Ollama (biblioteca `mixtral`) y TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al activar solo ~12,9 mil millones de parametros por token, el coste por token es inferior al de un modelo denso de 46,7 mil millones, aunque el requisito de memoria es el de un modelo completo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Mixtral-8x7B-Instruct-v0.1 (este) | 46,7 mil M | ~12,9 mil M | 32k | Apache-2.0 | MoE top-2 de 8 expertos |
| Llama 2 70B | 70 mil M | 70 mil M (denso) | 4k | Llama 2 Community License | Densidad total, contexto reducido |
| Mixtral-8x22B-Instruct-v0.1 | 141 mil M | ~39 mil M | 65k | Apache-2.0 | MoE de mayor tamano de la misma familia |
| Mistral-7B-Instruct-v0.2 | 7,3 mil M | 7,3 mil M (denso) | 32k | Apache-2.0 | Alternativa densa de menor tamano |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La model card advierte de que la version Instruct es una "demostracion rapida" y no incorpora mecanismos de moderacion, por lo que puede generar contenido inapropiado o sin filtrar.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas concretas.
- Sesgos conocidos: no documentados de forma especifica en la informacion disponible, pero el preentrenamiento en web abierta implica sesgos potenciales.
- El formato de instruccion debe respetarse estrictamente (`[INST]...[/INST]`); un formato incorrecto degrada la calidad de las salidas.
- La ventana de contexto esta limitada a 32.768 tokens.
- Esta copia concreta del repositorio es una resubida de terceros (autor Mafiaorigin22) con 0 descargas y 0 "likes"; se recomienda verificar la integridad de los pesos frente al repositorio oficial de Mistral AI.
- La model card original senala que el repositorio contiene pesos compatibles con vLLM y transformers, pero con formato de fichero y nombres de parametros distintos a la version original; verificar la compatibilidad antes de desplegar.
- Pese a la licencia Apache-2.0, se recomienda revisar los terminos de Mistral AI y la procedencia de los pesos dado el caracter de resubida de este repositorio.

## Enlaces

- Repositorio analizado: https://huggingface.co/Mafiaorigin22/Mixtral-8x7B-Instruct-v0.1
- Repositorio oficial: https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
- Modelo base: https://huggingface.co/mistralai/Mixtral-8x7B-v0.1
- Blog de lanzamiento de Mistral AI: https://mistral.ai/news/mixtral-of-experts/
- Documentacion de Mistral: https://docs.mistral.ai/models/mixtral-8x7b-0-1
- Pagina en Ollama: https://ollama.com/library/mixtral
- Copia en ModelScope: https://www.modelscope.cn/models/AI-ModelScope/Mixtral-8x7B-Instruct-v0.1/summary
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Documentacion de plantillas de chat de transformers: https://huggingface.co/docs/transformers/main/en/chat_templating
