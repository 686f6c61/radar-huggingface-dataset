# JagritiPandey/llama3-medical-triage

## Resumen

JagritiPandey/llama3-medical-triage es un ajuste fino (fine-tuning) del modelo unsloth/llama-3-8b-Instruct-bnb-4bit, un Llama 3 8B Instruct cuantizado a 4 bits, publicado por el usuario JagritiPandey en HuggingFace. Por el nombre del repositorio, el modelo esta orientado a tareas de triaje medico, es decir, clasificacion o priorizacion de sintomas y urgencias a partir de texto. El repositorio contiene pesos completos en formato safetensors con 8.030.261.248 parametros (8,03 mil millones), lo que corresponde a los pesos del modelo base ya fusionados y subidos en precision de 16 bits, con un tamano de repositorio de 16,1 GB.

El modelo se presenta como un derivado conversacional en ingles, con pipeline de text-generation y compatible con text-generation-inference y endpoints de HuggingFace. El ajuste fino se realizo con Unsloth y la libreria TRL de HuggingFace, segun indica el propio autor, un flujo habitual para reducir el coste de entrenamiento de modelos de 8B mediante LoRA/QLoRA sobre pesos cuantizados.

La relevancia de esta ficha es limitada y conviene ser explicito: la model card no documenta el dataset de entrenamiento, el numero de tokens, el procedimiento de alineacion ni ninguna evaluacion. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion de la comunidad. Cualquier uso en un contexto clinico real carece por completo de respaldo tecnico y regulatorio con la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), derivada de unsloth/llama-3-8b-Instruct-bnb-4bit; el autor no detalla modificaciones arquitectonicas |
| Parametros totales | 8.030.261.248 (8,03B), dato real de los safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Llama 3 8B Instruct soporta 8.192 tokens |
| Tipos de cuantizacion | El repositorio publica safetensors (previsiblemente fp16/bf16, dado el tamano de 16,1 GB); no se incluyen variantes GGUF, AWQ ni GPTQ. El modelo base de partida estaba cuantizado a 4 bits (bnb-4bit) |
| Idiomas soportados | Ingles (etiqueta `en` declarada) |
| Licencia | apache-2.0, segun declara el autor (ver advertencias) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura mas alla de la herencia del modelo base. Al tratarse de un derivado de Llama 3 8B Instruct, la arquitectura subyacente es un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, atencion con RoPE y atencion agrupada (GQA) con 8 cabezas KV sobre 32 cabezas de consulta, tal como define Meta en la familia Llama 3. El autor no documenta ninguna modificacion estructural, atencion lineal ni mecanismo de decodificacion especulativa.

Respecto al entrenamiento, la unica informacion disponible es que se realizo con Unsloth y la libreria TRL de HuggingFace, y que el punto de partida fue unsloth/llama-3-8b-Instruct-bnb-4bit, un checkpoint cuantizado a 4 bits. No se indica el numero de tokens de entrenamiento, la composicion del dataset (fuentes clinicas, sinteticas o mixtas), si hubo RLHF, DPO u otra fase de alineacion, ni la hiperparametrizacion empleada. Tampoco se especifica si los pesos publicados son el resultado de fusionar los adaptadores LoRA sobre el modelo base cuantizado y posteriormente convertir a 16 bits, aunque el tamano del repositorio (16,1 GB) y el recuento de parametros son coherentes con esa hipotesis.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama 3 8B Instruct.
- Orientacion declarada a triaje medico: clasificacion y priorizacion de casos a partir de descripciones de sintomas. No hay documentacion que confirme el alcance real de esta capacidad.
- Razonamiento general y respuesta a instrucciones, en la medida en que se conserven las capacidades del modelo base tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; debe verificarse empiricamente, ya que el ajuste fino puede degradar esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

Dado que no existe evaluacion publicada, los casos siguientes deben entenderse como escenarios hipoteticos a validar, nunca como usos recomendados en produccion clinica.

- Prototipado de investigacion en triaje textual: uso del modelo como punto de partida para experimentar con clasificacion de urgencia sobre conjuntos de datos propios, comparando su salida con la de Llama 3 8B Instruct sin ajustar para medir si el fine-tuning aporta alguna mejora real.
- Generacion de resumenes de historias clinicas sinteticas: en entornos de investigacion con datos anonimizados y sinteticos, para estudiar la calidad del resumen estructurado antes de plantear cualquier validacion seria.
- Clasificacion de nivel de prioridad (por ejemplo, urgente / no urgente) en un pipeline de juguete: el modelo puede producir etiquetas de texto libre que despues se parsean, pero sin garantia de calibracion.
- Generacion de preguntas de seguimiento al paciente: dado su origen conversacional, puede usarse para generar preguntas adicionales que aclaren sintomas, siempre bajo supervision humana y con datos de prueba.
- Base para fine-tuning posterior: al ser un checkpoint de 8B en safetensors, puede servir como punto de partida para ajustes adicionales con Unsloth o TRL en GPUs de gama alta de consumo.
- Educacion y simulacion clinica: generacion de escenarios formativos ficticios para estudiantes, donde un error del modelo no tiene consecuencia clinica.
- Investigacion sobre degradacion por cuantizacion: el modelo permite estudiar como afecta a la calidad final el haber partido de un checkpoint bnb-4bit en lugar de pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MedQA, MedMCQA, PubMedQA ni ninguna otra metrica, ni tampoco comparaciones con modelos de referencia.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo (8,03B parametros) y no proceden de la documentacion del autor.

- VRAM estimada para inferencia: aproximadamente 16-18 GB en fp16 (pesos mas cache KV), en torno a 9-11 GB con cuantizacion int8 y aproximadamente 5-7 GB con cuantizacion de 4 bits.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para fp16 sin restricciones; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con cuantizacion) y tarjetas de 12 GB si se convierte previamente a 4 bits.
- Opciones de despliegue: transformers (formato publicado), text-generation-inference (etiqueta declarada por el autor), vLLM y SGLang para fp16; llama.cpp u Ollama requieren convertir los pesos a GGUF, artefacto que no se incluye en el repositorio.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento del modelo evaluado, por lo que la comparacion se limita a caracteristicas estructurales. Las cifras de los modelos alternativos corresponden a su documentacion publica y no forman parte de la informacion proporcionada en esta consulta.

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| JagritiPandey/llama3-medical-triage | 8,03B | No especificado (base: 8.192) | apache-2.0 declarada | No disponible |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03B | 8.192 | Meta Llama 3 Community License | Publicado por Meta |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25B | 32.768 | Apache-2.0 | Publicado por Mistral |
| Qwen/Qwen2.5-7B-Instruct | 7,62B | 32.768 nativo (mayor con YaRN) | Apache-2.0 | Publicado por Alibaba |
| epfl-llm/meditron-7b | 7B | No disponible en esta consulta | No disponible en esta consulta | Publicado por EPFL |

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican dataset, tokens de entrenamiento, metodo de alineacion ni evaluacion. Es imposible determinar que aprendio el modelo ni con que datos.
- Riesgo clinico grave: un modelo presentado como herramienta de triaje medico sin validacion, sin revision clinica y sin certificacion regulatoria no debe usarse para decisiones sobre pacientes. Un error de priorizacion puede tener consecuencias graves.
- Riesgo de alucinacion: al ser un fine-tuning de un modelo de lenguaje general, puede inventar sintomas, diagnosticos, dosis o protocolos con total seguridad aparente.
- Sesgo de datos: al desconocerse la composicion del dataset, no puede evaluarse el sesgo por sexo, edad, etnia, idioma o condicion socioeconomica. El modelo solo declara ingles, lo que excluye su uso con pacientes hispanohablantes sin una evaluacion especifica.
- Limitacion de contexto: no se documenta la ventana efectiva. Si se hereda la del modelo base (8.192 tokens), es reducida frente a alternativas actuales de 32K o 128K.
- Degradacion por cuantizacion del origen: el ajuste se hizo sobre un checkpoint bnb-4bit, lo que puede introducir perdida de calidad respecto a un fine-tuning sobre pesos completos.
- Duda sobre la licencia: el repositorio declara apache-2.0, pero el modelo base pertenece a la familia Llama 3 de Meta, sujeta a la Meta Llama 3 Community License con sus propias restricciones (atribucion, clausulas de uso aceptable y obligaciones para modelos derivados). La declaracion de apache-2.0 por parte del autor es juridicamente dudosa y conviene revisarla antes de cualquier uso comercial.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni discusiones que aporten contexto.
- Sin artefactos de despliegue: no se publican GGUF, AWQ ni GPTQ, lo que obliga a generar las cuantizaciones antes de desplegar en entornos de bajos recursos.
- Fecha de publicacion inusual (septiembre de 2026 segun los metadatos) y ausencia de versionado o changelog.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JagritiPandey/llama3-medical-triage
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
- Modelo original de Meta: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a consultas no relacionadas y se han descartado.
