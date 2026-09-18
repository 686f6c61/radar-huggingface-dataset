# cronopioelectronico/Mistral-Small-3.2-24B-Instruct-2506-unsloth-bnb-4bit

## Resumen

Mistral-Small-3.2-24B-Instruct-2506-unsloth-bnb-4bit es una cuantizacion comunitaria en 4 bits del modelo mistralai/Mistral-Small-3.2-24B-Instruct-2506, publicada por el usuario cronopioelectronico bajo licencia Apache 2.0. El modelo original lo desarrolla Mistral AI y es una revision menor de Mistral-Small-3.1-24B-Instruct-2503, centrada en mejorar el seguimiento de instrucciones, reducir las generaciones infinitas o repetitivas y hacer mas robusta la plantilla de function calling. Al tratarse de una version cuantizada con bitsandbytes, el objetivo es reducir el coste de VRAM para servir un modelo multimodal de 24.011.361.280 parametros en hardware mas asequible.

La arquitectura es un transformer denso con capacidad de vision (pipeline image-text-to-text), por lo que acepta entradas de imagen y texto y produce texto. El repositorio ocupa 14,6 GB en safetensors, frente a los aproximadamente 55 GB de VRAM que requiere la version en bf16/fp16 segun la model card del modelo base. Su relevancia actual esta en que permite desplegar un asistente multimodal multilingue (24 idiomas declarados) con function calling y contexto largo sobre GPUs de 24 GB o superiores, a cambio de la degradacion tipica de una cuantizacion de 4 bits.

Es importante tener en cuenta que este repositorio es una conversion de terceros: no hay evaluaciones publicadas del impacto de la cuantizacion sobre los benchmarks del modelo original, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision), familia Mistral Small 3.x |
| Parametros totales | 24.011.361.280 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (valor de MAX_TOK en el ejemplo de uso de la model card; no se detalla la ventana oficial en la informacion proporcionada) |
| Tipos de cuantizacion | 4-bit bitsandbytes (bnb-4bit) en este repositorio; otras cuantizaciones del modelo base: no disponible |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn (24 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4-bit, libreria declarada: vllm) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con encoder de vision, integrado en la familia Mistral Small 3.x. La model card de esta cuantizacion no aporta detalles sobre numero de capas, dimension oculta, tipo de atencion ni arquitectura del encoder visual: se limita a indicar que Small 3.2 comparte las caracteristicas clave de Mistral-Small-3.1-24B-Instruct-2503. No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Las mejoras declaradas de Small 3.2 respecto a Small 3.1 son tres: mejor seguimiento de instrucciones precisas (65,33 por ciento en Wildbench v2 frente a 55,6 por ciento), menor tasa de generaciones infinitas (1,29 por ciento frente a 2,11 por ciento en una evaluacion interna) y una plantilla de function calling mas robusta, con parser especifico en mistral-common. La cuantizacion de este repositorio concreto no ha sido documentada tecnicamente por el autor: no se indica calibracion, granularidad de cuantizacion ni capas excluidas.

## Capacidades

- Generacion de texto conversacional en 24 idiomas declarados, incluidos espanol, ingles, frances, aleman, portugues, italiano, chino, japones, coreano, arabe y hindi.
- Razonamiento sobre imagenes: el pipeline declarado es image-text-to-text y el modelo base reporta resultados en MMMU, Mathvista, ChartQA, DocVQA y AI2D.
- Function calling / tool calling: el ejemplo oficial de vLLM usa `--tool-call-parser mistral` y `--enable-auto-tool-choice`, y la version 3.2 mejora explicitamente la robustez de la plantilla.
- Capacidades de razonamiento STEM: MMLU, MMLU Pro con CoT de 5 ejemplos, MATH, GPQA Main y Diamond, MBPP Plus y HumanEval Plus.
- Generacion de codigo: HumanEval Plus Pass@5 de 92,90 por ciento y MBPP Plus Pass@5 de 78,33 por ciento segun la model card.
- Soporte multimodal con multiples imagenes por prompt: el ejemplo de despliegue usa `--limit_mm_per_prompt 'image=10'`.
- Compatibilidad con despliegue servidor/cliente mediante API compatible con OpenAI a traves de vLLM.
- No se menciona en la informacion disponible soporte de audio, thinking mode explicito ni decodificacion especulativa.

## Casos de uso

- Atencion al cliente automatizada: con una ventana de contexto de 131.072 tokens puede mantener conversaciones multi-turno largas con historial extenso y documentacion adjunta, en varios de los 24 idiomas soportados.
- Extraccion de datos de documentos escaneados: las capacidades de vision del modelo base (DocVQA 94,86 por ciento, ChartQA 87,4 por ciento) permiten transcribir facturas, formularios o graficos a JSON estructurado mediante tool calling.
- Agente con herramientas en produccion: la plantilla de function calling robusta y el parser nativo de mistral-common permiten construir agentes que consulten APIs, bases de datos o sistemas internos en varios pasos.
- Asistente de codigo en pipelines de CI/CD: los resultados de HumanEval Plus y MBPP Plus lo hacen util para generar tests, revisar diffs o autocompletar funciones, invocandolo desde vLLM con API compatible con OpenAI.
- Analisis de imagenes tecnicas y diagramas: interpretacion de capturas de dashboards, planos o graficos de negocio para generar resumenes y alertas.
- Traduccion y localizacion multilingue: cobertura declarada de 24 idiomas, adecuada para pre-traducir contenidos y para tareas de post-edicion asistida.
- Despliegue en hardware limitado: al ocupar 4 bits, permite servir un modelo de 24B multimillonario en una unica GPU de 24 GB, algo inviable con los pesos en bf16.
- Evaluacion comparativa interna de cuantizaciones: util como punto de partida para medir la perdida de calidad de una cuantizacion bnb-4bit frente al modelo original en tareas propias.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo base (Mistral-Small-3.2-24B-Instruct-2506). No se aportan resultados medidos sobre esta cuantizacion de 4 bits.

Instrucciones, conversacion y tono:

| Modelo | Wildbench v2 | Arena Hard v2 | IF (interna; accuracy) |
|---|---|---|---|
| Small 3.1 24B Instruct | 55,6 % | 19,56 % | 82,75 % |
| Small 3.2 24B Instruct | 65,33 % | 43,1 % | 84,78 % |

Generaciones infinitas (metrica interna; menor es mejor):

| Modelo | Generaciones infinitas |
|---|---|
| Small 3.1 24B Instruct | 2,11 % |
| Small 3.2 24B Instruct | 1,29 % |

STEM y codigo:

| Modelo | MMLU | MMLU Pro (5-shot CoT) | MATH | GPQA Main (5-shot CoT) | GPQA Diamond (5-shot CoT) | MBPP Plus Pass@5 | HumanEval Plus Pass@5 | SimpleQA (TotalAcc) |
|---|---|---|---|---|---|---|---|---|
| Small 3.1 24B Instruct | 80,62 % | 66,76 % | 69,30 % | 44,42 % | 45,96 % | 74,63 % | 88,99 % | 10,43 % |
| Small 3.2 24B Instruct | 80,50 % | 69,06 % | 69,42 % | 44,22 % | 46,13 % | 78,33 % | 92,90 % | 12,10 % |

Vision:

| Modelo | MMMU | Mathvista | ChartQA | DocVQA | AI2D |
|---|---|---|---|---|---|
| Small 3.1 24B Instruct | 64,00 % | 68,91 % | 86,24 % | 94,08 % | 93,72 % |
| Small 3.2 24B Instruct | 62,50 % | 67,09 % | 87,4 % | 94,86 % | 92,91 % |

## Requisitos de hardware

- Modelo base en bf16/fp16: aproximadamente 55 GB de VRAM, segun la model card oficial.
- Esta cuantizacion de 4 bits: el repositorio pesa 14,6 GB en safetensors, por lo que la VRAM necesaria para los pesos ronda los 15 GB; hay que anadir la cache KV, que crece con la longitud de contexto y el numero de imagenes por prompt. Estimacion orientativa: 18-24 GB para contextos moderados. No hay mediciones publicadas para este repositorio concreto.
- GPU recomendadas para esta version cuantizada: una sola GPU de 24 GB (RTX 3090, RTX 4090, L4, A10G). Para el modelo en bf16, el ejemplo oficial usa `--tensor-parallel-size 2` sobre GPUs de datacenter tipo A100 o H100.
- Cabe en GPU de consumo: si, en RTX 3090 / 4090 de 24 GB, siempre que se limite el contexto y el numero de imagenes por peticion.
- Opciones de despliegue: vLLM >= 0.9.1 con mistral_common >= 1.6.2 (recomendado por la model card) o transformers. El formato es bitsandbytes de 4 bits, por lo que no es directamente utilizable en llama.cpp u Ollama sin una conversion a GGUF no incluida en esta informacion. Existe imagen Docker oficial de vLLM.
- Comando de referencia de la model card: `vllm serve ... --tokenizer_mode mistral --config_format mistral --load_format mistral --tool-call-parser mistral --enable-auto-tool-choice --limit_mm_per_prompt 'image=10' --tensor-parallel-size 2`.
- Latencia y throughput: no disponible.
- Parametros de muestreo recomendados por el autor del modelo base: temperatura 0,15 y uso de un system prompt (se sugiere el de SYSTEM_PROMPT.txt).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (datos disponibles) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-Small-3.2-24B-Instruct-2506 (bnb-4bit, este repositorio) | 24,0B | 131.072 tokens en el ejemplo de la model card | Sin evaluacion publicada de la version cuantizada | apache-2.0 | HuggingFace, formato safetensors 4-bit, libreria vllm |
| Mistral-Small-3.2-24B-Instruct-2506 (original, bf16) | 24,0B | 131.072 tokens en el ejemplo de la model card | Wildbench v2 65,33 %; Arena Hard v2 43,1 %; HumanEval Plus 92,90 %; DocVQA 94,86 % | apache-2.0 | HuggingFace, safetensors bf16, ~55 GB de VRAM |
| Mistral-Small-3.1-24B-Instruct-2503 | 24B | no disponible en la informacion proporcionada | Wildbench v2 55,6 %; Arena Hard v2 19,56 %; HumanEval Plus 88,99 %; DocVQA 94,08 % | apache-2.0 | HuggingFace |
| Otros modelos multimodales de tamano similar (por ejemplo, alternativas de 27B-32B de otros fabricantes) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantizacion de 4 bits introduce perdida de precision respecto al modelo original. No hay benchmarks publicados de esta version concreta, por lo que el impacto real en cada tarea debe medirse antes de llevarla a produccion.
- Riesgo de alucinacion: el modelo base obtiene un 12,10 por ciento de TotalAcc en SimpleQA, una cifra baja que indica tendencia a responder de forma incorrecta o inventada en preguntas factuales cerradas.
- Generaciones repetitivas o infinitas: aunque Small 3.2 las reduce a la mitad (1,29 por ciento en la evaluacion interna), el problema no desaparece; conviene imponer limites de tokens y parametros de parada.
- Regresion en algunas tareas de vision: MMMU baja de 64,00 a 62,50 por ciento, Mathvista de 68,91 a 67,09 por ciento y AI2D de 93,72 a 92,91 por ciento respecto a Small 3.1.
- Cobertura multilingue declarada de 24 idiomas, pero sin metricas publicadas por idioma; el rendimiento en idiomas de bajos recursos como el nepalí o el bengali no esta documentado.
- La model card no detalla sesgos conocidos, composicion del dataset de entrenamiento ni filtros aplicados; no pueden evaluarse sesgos sistematicos con la informacion disponible.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base original y citar correctamente la procedencia tanto de Mistral AI como del autor de la cuantizacion.
- Repositorio de terceros con 0 descargas y 0 likes en la fecha de consulta: no hay garantia de mantenimiento, actualizacion ni soporte por parte del autor.
- Requiere vLLM >= 0.9.1 y mistral_common >= 1.6.2; versiones anteriores pueden no soportar correctamente el tokenizer, el parser de herramientas o las capacidades multimodales.
- El uso de `--tensor-parallel-size 2` recomendado en el ejemplo oficial implica al menos dos GPUs para el modelo sin cuantizar; en la version de 4 bits es probable que baste una, pero no esta confirmado en la informacion disponible.
- La fecha de creacion indicada en el repositorio (2026-09-18) resulta anomala y no se ha podido contrastar con ninguna otra fuente.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/cronopioelectronico/Mistral-Small-3.2-24B-Instruct-2506-unsloth-bnb-4bit
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Modelo predecesor (Small 3.1): https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Modelo base de Small 3.1: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Base-2503
- System prompt recomendado: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506/blob/main/SYSTEM_PROMPT.txt
- vLLM: https://github.com/vllm-project/vllm
- Release de vLLM 0.9.1: https://github.com/vllm-project/vllm/releases/tag/v0.9.1
- mistral-common (plantilla de function calling): https://github.com/mistralai/mistral-common/blob/535b4d0a0fc94674ea17db6cf8dc2079b81cbcfa/src/mistral_common/tokens/tokenizers/instruct.py#L778
- Release de mistral-common 1.6.2: https://github.com/mistralai/mistral-common/releases/tag/v1.6.2
- Dockerfile de vLLM: https://github.com/vllm-project/vllm/blob/main/Dockerfile
- Imagen Docker de vLLM: https://hub.docker.com/layers/vllm/vllm-openai/latest/images/sha256-de9032a92ffea7b5c007dad80b38fd44aac11eddc31c435f8e52f3b7404bbf39
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos correspondian a tiendas de ropa y no guardan relacion con el modelo.
