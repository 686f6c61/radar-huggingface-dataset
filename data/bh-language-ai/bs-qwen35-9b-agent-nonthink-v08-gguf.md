# BH-Language-AI/bs-qwen35-9b-agent-nonthink-v08-gguf

## Resumen

LUMI-9B v08 es un ajuste fino del modelo Qwen3.5-9B desarrollado por BH-Language-AI, orientado a tareas de agente y tool-calling en bosnio, croata y serbio (BS/HR/SR), manteniendo competencia en ingles. El modelo parte de la base Qwen3.5-9B (8.953.803.264 parametros segun safetensors) y se distribuye como una conversion GGUF en bf16 generada con `convert_hf_to_gguf.py` de llama.cpp bajo la arquitectura `LLM_ARCH_QWEN35`.

La propuesta de valor es doble: por un lado, mejora el rendimiento en bosnio respecto a la base (79,1 % frente a 74,4 % en el golden set BS de 43 ejemplos) y, por otro, mantiene un rendimiento de tool-calling del 98,6 % en un banco de 72 pruebas, lo que lo hace util para pipelines de agentes en lenguas eslavas del sur poco representadas en modelos generalistas.

El repositorio ocupa 27,4 GB e incluye pesos en bf16 (~17,9 GB), pensados para cuantizacion local posterior. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de la propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-9B, arquitectura GGUF `LLM_ARCH_QWEN35`) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 incluido en el repo; el autor indica cuantizacion local con `llama-quantize` (p. ej. Q8_0) |
| Idiomas soportados | bs, hr, sr, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (bf16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-9B, un transformer denso de aproximadamente 9 mil millones de parametros. La model card no detalla la composicion del dataset de ajuste, el numero de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO; unicamente indica que se trata de la version "nonthink" (sin modo de razonamiento explicito) del linaje v08 y que el modelo fue entrenado sobre un dialecto XML concreto para tool-calling: `<tool_call>{"name": "ALAT", "arguments": {...}}</tool_call>`, con las herramientas declaradas en el system prompt.

La innovacion tecnica mas relevante documentada es la especializacion en tool-calling estructurado para lenguas del grupo BS/HR/SR, junto con la preservacion del rendimiento en ingles (96,7 % en el golden set EN de 30 ejemplos, identico a la base). No se documentan innovaciones arquitectonicas propias (decodificacion especulativa, atencion lineal, SSM, etc.); se trata de un ajuste fino sobre la arquitectura del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno en bosnio, croata, serbio e ingles.
- Tool-calling / function calling con un dialecto XML especifico (`<tool_call>...</tool_call>`), con herramientas en el system prompt; 98,6 % en el banco de herramientas de 72 pruebas.
- Razonamiento aritmetico basico y resolucion de problemas matematicos de nivel escolar (GSM8K strict 0,845).
- Seguimiento de instrucciones formato-estricto (IFEval p-strict 0,730), inferior al modelo base.
- Capacidades de agente y razonamiento multi-paso derivadas del soporte de tool-calling.
- Modo "nonthink": no expone cadena de razonamiento explicita, lo que reduce latencia y tokens de salida en produccion.

## Casos de uso

- Atencion al cliente en bosnio, croata y serbio: el modelo gestiona conversaciones multi-turno y puede invocar herramientas (consulta de pedidos, estado de cuenta) mediante el dialecto XML documentado, con buen rendimiento medido en el banco de herramientas.
- Agentes de automatizacion de back-office en la region BH: integracion en pipelines que requieren function calling fiable (98,6 % de acierto) sobre APIs internas, declarando las herramientas en el system prompt.
- Asistentes de calculo fiscal y de nomina: el modelo resuelve operaciones aritmeticas basicas (GSM8K 0,845), aunque el autor advierte que la aritmetica sobre importes monetarios requiere una capa determinista adicional.
- Generacion de respuestas en centros de soporte bilingues BS/EN: mantiene el 96,7 % del golden set en ingles y mejora el bosnio respecto a la base, lo que permite un unico modelo para ambos idiomas.
- Prototipado rapido con Ollama o llama.cpp: al distribuirse como GGUF bf16, se puede cargar directamente con `llama-cli` o crear un modelo de Ollama con un Modelfile, sin conversion adicional.
- Clasificacion y extraccion de informacion estructurada en lenguas eslavas del sur: el formato de salida controlado y el seguimiento de instrucciones permiten usarlo para tareas de parsing y etiquetado con esquemas fijos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Metrica | v08 | v06 | Qwen3.5-9B base |
|---|---|---|---|
| BS golden (43) | 79,1 % | 72,1 % | 74,4 % |
| BS-Eval v1 (400) | 72,75 % | 72,0 % | 72,5 % |
| EN golden (30) | 96,7 % | 93,3 % | 96,7 % |
| Tool bench (72) | 98,6 % | 100,0 % | 97,2 % |
| GSM8K strict | 0,845 | 0,925 | 0,790 |
| IFEval p-strict | 0,730 | 0,795 | 0,830 |

El modelo mejora a la base en bosnio (BS golden y BS-Eval) y en GSM8K, pero retrocede frente a v06 en GSM8K (0,845 frente a 0,925) y frente a la base en IFEval (0,730 frente a 0,830). El tool bench baja ligeramente respecto a v06 (98,6 % frente a 100 %) pero supera a la base (97,2 %).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18 GB solo para pesos, mas overhead de contexto y cache KV; en la practica, 20-24 GB para contextos moderados.
- Cuantizaciones locales: el autor sugiere generar Q8_0 con `llama-quantize` (en torno a 9-10 GB), y cuantizaciones menores (Q4_K_M, Q5_K_M) reduciran aun mas el requisito, aunque no se publican mediciones de calidad para esas variantes.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 o GPUs de 16 GB tras cuantizacion Q8_0 o inferior.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 (ajustado) y en GPUs de 16-24 GB con cuantizacion.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) y Ollama (creando el modelo con un Modelfile); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| LUMI-9B v08 (este) | 8,95 B | no disponible | Apache-2.0 | Tool-calling BS/HR/SR/EN | GGUF en HF |
| Qwen3.5-9B (base) | ~9 B | no disponible | Apache-2.0 | Generalista multilingue | HF |
| LUMI-9B v06 | no disponible | no disponible | Apache-2.0 | Version previa del ajuste | HF (merged) |
| Alternativas de ~9 B para tool-calling en lenguas eslavas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas directa y con datos publicados es con el propio Qwen3.5-9B base y con la version v06 del mismo linaje; no se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Matematicas e instrucciones: el autor reconoce que el modelo es mas debil que v06 y que la base en GSM8K (0,845 frente a 0,925) e IFEval (0,730 frente a 0,830).
- Aritmetica monetaria: la model card advierte explicitamente que los calculos sobre importes requieren una capa determinista adicional; no debe confiarse la aritmetica financiera al modelo en solitario.
- Tool-calling: el formato XML es especifico (`<tool_call>{"name": ..., "arguments": ...}</tool_call>`) y las herramientas deben declararse en el system prompt; un prompt mal formado puede degradar el rendimiento.
- Cobertura linguistica limitada a bs, hr, sr y en; no se documenta rendimiento en otras lenguas.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con ventanas largas.
- Riesgo de alucinacion: no se publican evaluaciones de veracidad ni de sesgos; al ser un ajuste fino sobre un modelo generalista, hereda los sesgos del base.
- Cuantizacion: el autor reporta que el build de `llama-quantize` fallo en su contenedor por cmake 4.4 y funciono con cmake 3.x; conviene verificar el entorno antes de cuantizar.
- Licencia Apache-2.0: permite uso comercial, pero obliga a conservar avisos de copyright y licencia y a declarar cambios; no se anaden restricciones especificas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bs-qwen35-9b-agent-nonthink-v08-gguf
- Version merged (bf16, 18,8 GB): https://huggingface.co/BH-Language-AI/bs-qwen35-9b-agent-nonthink-v08-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio llama.cpp (conversion GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
