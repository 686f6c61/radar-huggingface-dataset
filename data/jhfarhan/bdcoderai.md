# jhfarhan/BdcoderAi

## Resumen

BdcoderAi es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct orientado a conversacion mixta bangla-ingles (code-switching), es decir, dialogos en los que el usuario alterna frases en bengali y en ingles dentro de un mismo turno o conversacion. Lo desarrolla Jamil Hussain, un desarrollador independiente bangladesi, y se publica bajo licencia Apache 2.0 en HuggingFace con el identificador jhfarhan/BdcoderAi.

El problema que aborda es concreto: la mayoria de los modelos instructivos multilingues rinden bien en bengali formal o en ingles puro, pero degradan cuando el hablante mezcla ambos idiomas, algo habitual en contextos tecnicos y urbanos de Bangladesh. El autor declara que el modelo cubre chat cotidiano, matematicas y razonamiento, generacion de codigo (Python y otros), analisis y resumen de documentos, y tareas de tipo agentico con herramientas.

Tecnicamente es un modelo denso de la familia Qwen2.5, con aproximadamente 7.600 millones de parametros, entrenado mediante QLoRA de 4 bits (NF4) mas adaptadores LoRA, sobre un dataset de instrucciones propio en bangla-ingles. Es relevante ahora porque los modelos especializados en code-switching de bajos recursos siguen siendo escasos frente a la oferta de modelos genericos, y porque parte de una base lo suficientemente pequena como para desplegarse en hardware de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct); ajuste mediante QLoRA + LoRA |
| Parametros totales | Aproximadamente 7,6 mil millones (heredados del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens de forma nativa en Qwen2.5-7B-Instruct; extensible hasta 131.072 con YaRN segun la documentacion del modelo base. La model card de BdcoderAi no especifica un valor propio |
| Tipos de cuantizacion | No especificado en la model card. El entrenamiento uso cuantizacion de 4 bits NF4 (QLoRA). No se publican pesos GGUF, GPTQ ni AWQ propios |
| Idiomas soportados | Bengali (bn) e ingles (en), con enfasis en conversacion mixta entre ambos |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado de forma explicita. El ejemplo de uso carga el repositorio con AutoModelForCausalLM.from_pretrained, lo que sugiere pesos completos en safetensors; sin embargo, las etiquetas del repositorio incluyen base_model:adapter sobre Qwen2.5-7B-Instruct |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion por causalidad, normalizacion RMSNorm y activacion SwiGLU, entrenado por Alibaba. Sobre esa base, el autor aplica un ajuste supervisado (SFT) con QLoRA: cuantizacion de 4 bits en formato NF4 del modelo base congelado y adaptadores LoRA entrenables con rango r=16, alpha=32 y dropout de 0,05. Este esquema reduce de forma drastica los requisitos de memoria frente a un ajuste completo de 7.600 millones de parametros.

El entrenamiento se realizo sobre un dataset propio de instrucciones con conversaciones mixtas bangla-ingles, cuya composicion, numero de ejemplos y numero total de tokens no se detallan en la model card. No se menciona el uso de RLHF, DPO u otra etapa de alineacion posterior al SFT, ni tecnicas adicionales como decodificacion especulativa o atencion lineal. El hardware empleado fueron dos GPU T4 de 16 GB en Kaggle, lo que es coherente con el uso de QLoRA.

## Capacidades

- Generacion de texto conversacional en bangla, en ingles y en registros mixtos con alternancia de idioma dentro del mismo mensaje.
- Razonamiento y resolucion de problemas matematicos, segun lo declarado por el autor.
- Generacion de codigo, con Python mencionado de forma explicita.
- Analisis y resumen de documentos.
- Tareas de tipo agentico y uso de herramientas (tool calling) cuando se le proporcionan utilidades, segun la model card.
- Dialogo multi-turno con plantilla de chat compatible con el formato de Qwen2.5 (apply_chat_template).
- Capacidades multilingues limitadas a los dos idiomas declarados: bengali e ingles. No se declara soporte de castellano.

No se declaran capacidades de vision, audio, modo de razonamiento explicito (thinking mode) ni ventanas de contexto extendidas mas alla de lo heredado del modelo base.

## Casos de uso

- Atencion al cliente en Bangladesh: el modelo puede gestionar conversaciones multi-turno en las que el cliente escribe en bengali con terminos tecnicos en ingles (facturacion, planes, nombres de producto), un patron muy frecuente en el mercado local, con una ventana heredada de 32.768 tokens.
- Asistentes de soporte tecnico para desarrolladores bangladesies: resuelve dudas de programacion que el usuario plantea mezclando bengali e ingles, e integra ejemplos de codigo Python en la respuesta.
- Generacion y revision de codigo en entornos de desarrollo: puede insertarse en un asistente de IDE o en un pipeline de revision de pull requests para producir fragmentos de Python y explicarlos en bangla-ingles.
- Resumen de documentacion y actas: dada su capacidad declarada de analisis de documentos, sirve para condensar contratos, manuales o hilos de correo en bengali con secciones en ingles.
- Chatbot educativo para estudiantes: tutoria de matematicas y conceptos tecnicos explicados en el idioma mixto que el alumno usa habitualmente.
- Agente conversacional con herramientas: al soportar tool calling, puede conectarse a APIs (consultas de pedidos, busqueda de vuelos, calculo de precios) en flujos de varios pasos.
- Moderacion y normalizacion de texto code-switched: transcripcion o reescritura de mensajes mixtos hacia un registro formal en bengali o en ingles.

Conviene validar cada uno de estos escenarios con evaluacion propia, dado que no se publican benchmarks ni metricas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, BanglaBench ni de ninguna otra evaluacion, y tampoco se proporcionan comparaciones con el modelo base ni con alternativas. El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta.

## Requisitos de hardware

- Inferencia en FP16/BF16: aproximadamente 15 GB solo para los pesos, mas la cache KV; en la practica requiere del orden de 18 a 22 GB de VRAM, por lo que encaja en A100 40 GB, H100 80 GB, L40S 48 GB y, de forma ajustada, en una RTX 4090 de 24 GB.
- Cuantizacion de 8 bits: alrededor de 8 GB de pesos, en torno a 10-12 GB con cache; cabe en RTX 4080, RTX 3090 y similares.
- Cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 4,5 GB de pesos, en torno a 6-8 GB en uso real; cabe en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. Estas cifras son estimaciones de clase para un modelo denso de 7.600 millones de parametros, no datos publicados por el autor.
- Si el repositorio contiene unicamente el adaptador LoRA, el requisito real es el del modelo base mas la fusion del adaptador; el adaptador en si ocupa unas decenas de megabytes.
- Opciones de despliegue: transformers (unico metodo documentado en la model card), vLLM, TGI, llama.cpp y Ollama, siempre que los pesos se conviertan previamente a los formatos correspondientes. No se publican artefactos GGUF ni cuantizaciones listas para usar.
- Latencia y throughput: no disponible. No se proporcionan mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| BdcoderAi (jhfarhan) | ~7,6 B (denso, QLoRA sobre Qwen2.5-7B-Instruct) | Heredado: 32.768 tokens nativos | bn, en (code-switching) | Apache 2.0 | No publicados |
| Qwen2.5-7B-Instruct (modelo base) | ~7,6 B (denso) | 32.768 tokens nativos, hasta 131.072 con YaRN | Multilingue amplio, incluido bengali e ingles | Apache 2.0 | Publicados por el autor del modelo base |
| Alternativas especializadas en bangla y code-switching | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion verificable con la informacion disponible es contra el modelo base. La busqueda web realizada no devolvio referencias tecnicas utiles sobre otros modelos comparables de bangla-ingles.

## Limitaciones y advertencias

- No se publican evaluaciones, por lo que la mejora declarada en conversacion bangla-ingles no puede verificarse de forma independiente frente a Qwen2.5-7B-Instruct.
- La model card no detalla la composicion, el tamano ni la procedencia del dataset de ajuste, lo que dificulta evaluar sesgos, contaminacion de benchmarks o cobertura de dominios.
- Riesgo de alucinacion inherente a un ajuste SFT sobre una base de 7.600 millones de parametros, especialmente en matematicas, datos factuales y codigo poco frecuente.
- El alcance linguistico declarado se limita a bengali e ingles. No hay soporte declarado de castellano ni de otras lenguas, y la calidad en registro formal bengali puede diferir de la del registro coloquial.
- No se han publicado cuantizaciones GGUF, GPTQ ni AWQ, lo que limita el despliegue inmediato en entornos de bajos recursos sin conversion manual.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar asimismo los terminos del modelo base para asegurar el cumplimiento.
- El repositorio presenta 0 descargas y 0 valoraciones, sin historial de uso en produccion; debe tratarse como un modelo experimental no validado.
- La ambiguedad entre pesos completos y adaptador LoRA en las etiquetas del repositorio puede complicar la integracion en servidores de inferencia sin una comprobacion previa de los ficheros publicados.
- Los resultados de busqueda web asociados a esta consulta no contenian material tecnico relevante y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jhfarhan/BdcoderAi
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Cita proporcionada por el autor en la model card: BibTeX con titulo "BdcoderAi : Bangla-English Mixed Conversational Model", autor Jamil Hussain, ano 2026, URL del repositorio.
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
