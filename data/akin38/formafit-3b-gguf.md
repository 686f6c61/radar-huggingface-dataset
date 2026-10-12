# Akin38/FormaFit-3B-GGUF

## Resumen

FormaFit-3B-GGUF es un ajuste fino por QLoRA del modelo Qwen2.5-3B-Instruct, publicado por el usuario Akin38 en formato GGUF. Se trata de un asistente vertical especializado en el dominio de un club deportivo turco (FormaFit Spor Kulübü): responde sobre normas internas, paquetes de membresía, precios y programación de clases colectivas. El modelo parte de 3.085.938.688 parámetros (unos 3,09 mil millones) y hereda del base una ventana de contexto de 32.768 tokens.

La relevancia del modelo no está en sus capacidades generales, que son las del Qwen2.5-3B-Instruct, sino en el patrón de construcción: un fine-tuning ligero con QLoRA sobre datos institucionales (guía oficial del socio en PDF, tablas de horarios y herramientas de cálculo de cuotas) combinado con un flujo RAG y con llamadas a herramientas en protocolo JSON. Es decir, es un ejemplo práctico de asistente de atención al cliente desplegable en hardware modesto.

Sus limitaciones son también claras: está entrenado y orientado únicamente al turco (idioma declarado: tr), su conocimiento está restringido al dominio del club, y su repositorio no registra descargas ni valoraciones, además de no publicar benchmarks numéricos. La licencia Apache-2.0 permite uso comercial, pero la utilidad real del modelo fuera del caso FormaFit es reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen2.5-3B-Instruct (la model card no detalla capas ni dimensiones) |
| Parametros totales | 3.085.938.688 (~3,09 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | GGUF; los niveles concretos no estan detallados en la informacion disponible. El repositorio ocupa 3,3 GB |
| Idiomas soportados | Turco (tr) de forma declarada; el modelo base es multilingue, pero el ajuste esta orientado al turco |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el entrenamiento se realizo con adaptadores QLoRA |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Tamano del repositorio | 3,3 GB |
| Fecha de publicacion | 12 de octubre de 2026 (segun metadatos de HuggingFace) |
| Descargas / valoraciones | 0 descargas / 0 likes en el momento de la consulta |
| Etiquetas | gguf, qlora, rag, agent, formafit, tr, endpoints_compatible, conversational |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso de aproximadamente 3,09 mil millones de parametros, con atención por consultas agrupadas y codificacion posicional rotatoria, segun la documentacion publica del modelo base. Sobre esa base se aplico un ajuste fino con QLoRA, es decir, cuantizacion de 4 bits del modelo congelado mas adaptadores de bajo rango entrenables. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni el rango, alfa o tasa de aprendizaje empleados.

Las fuentes de conocimiento declaradas por el autor son tres: el PDF de la guia oficial de socios del club, tablas de base de datos con la programacion de clases colectivas y herramientas internas de calculo de cuotas de membresia. El modelo se integra en un pipeline RAG y en un bucle de agente que emite llamadas a herramientas en JSON: la model card menciona explicitamente dos, `ders_bilgisi` (informacion de clases) y `uyelik_ucreti_hesaplayici` (calculadora de cuotas). El autor afirma que, con contexto RAG, el modelo se mantiene fiel a la guia, mientras que sin contexto tiende a fabricar datos numericos. No se documenta ninguna fase de RLHF o DPO posterior al ajuste supervisado.

## Capacidades

- Generacion de texto conversacional en turco, con adopcion del tono y la identidad corporativa de FormaFit tras el ajuste.
- Respuesta a preguntas sobre normas del club, paquetes de membresia y precios cuando se le proporciona contexto RAG.
- Consulta de programacion de clases colectivas mediante la herramienta `ders_bilgisi`.
- Calculo de cuotas de membresia mediante la herramienta `uyelik_ucreti_hesaplayici`.
- Tool calling / function calling en protocolo JSON: el autor reporta que el modelo selecciona correctamente las herramientas en el bucle de agente.
- Razonamiento multi-paso dentro de un flujo de agente con recuperacion de contexto (RAG).
- Capacidad multilingue limitada: aunque el base Qwen2.5 es multilingue, el fine-tuning esta declarado solo para turco y no se documenta capacidad en otros idiomas.
- No se declaran capacidades de vision, audio, generacion de codigo especializada ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Atencion al cliente del club en mostrador o web: el modelo gestiona conversaciones multi-turno sobre cuotas, horarios y normas, apoyandose en RAG sobre la guia oficial del socio para no depender de conocimiento parametrico.
- Chatbot de precios y paquetes de membresia: invoca `uyelik_ucreti_hesaplayici` para calcular importes concretos en lugar de estimarlos, evitando la fabricacion de cifras detectada sin contexto.
- Consulta de horarios de clases colectivas: la herramienta `ders_bilgisi` permite responder que clases hay, en que franja y con que monitor, leyendo de la base de datos del club.
- Asistente interno para recepcion: resuelve dudas frecuentes del personal sobre reglamento y procedimientos a partir del PDF institucional, con derivacion a un humano en operaciones sensibles.
- Despliegue en local o en el borde: al ser un GGUF de 3B, puede ejecutarse en la propia infraestructura del club (CPU o una GPU pequeña) sin enviar datos de socios a servicios externos.
- Base de partida para otros dominios verticales: sirve como plantilla reproducible de QLoRA + RAG + tool calling para digitalizar guias y bases de datos de otras pymes o clubes.
- Evaluacion comparativa de pipelines RAG: util para medir fidelidad al contexto frente a respuestas sin recuperacion, tal como hizo el propio autor en su informe.
- Filtro y derivacion de casos: dado que el modelo tiene instrucciones de no dar consejo medico ni clinico, puede usarse para clasificar consultas y derivar las sanitarias fuera del sistema automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite, ni para el modelo ajustado ni en comparacion con el base.

La unica evaluacion disponible es cualitativa, descrita por el autor en la model card:

| Aspecto evaluado | Resultado descrito por el autor |
|---|---|
| Identidad y estilo corporativo | El modelo adopta la identidad y el tono de FormaFit tras el QLoRA |
| Fidelidad con RAG | Alta fidelidad a la guia cuando se le proporciona contexto recuperado |
| Datos numericos sin contexto | Tiende a fabricar cifras cuando no se le da contexto RAG |
| Bucle de agente | Selecciona correctamente las herramientas en protocolo JSON |

No se dispone de latencias, throughput ni tasas de acierto medidas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 3,09 mil millones de parametros; no son datos publicados por el autor):
  - FP16: aproximadamente 6,2 GB de pesos mas overhead de contexto KV.
  - Q8_0: aproximadamente 3,3 GB, coherente con el tamano del repositorio (3,3 GB).
  - Q4_K_M: aproximadamente 1,9-2,0 GB.
- GPU recomendadas: el autor cita explicitamente la NVIDIA T4 como objetivo de despliegue, ademas de ejecucion en CPU. Cualquier GPU con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, L4, A10G, A100, H100) puede servirlo con margen amplio.
- Cabe en GPU de consumo: si. En cuantizacion de 4 bits entra en GPUs de 4-6 GB de VRAM; en Q8_0 entra en cualquier GPU de 8 GB.
- Ejecucion en CPU: viable y es uno de los motivos declarados de elegir un modelo de 3B. Un equipo de escritorio moderno puede servirlo con llama.cpp, aunque con latencias mayores que en GPU.
- Opciones de despliegue: llama.cpp y sus derivados (llama-cpp-python, LM Studio, Ollama con un Modelfile que apunte al GGUF), TGI con soporte GGUF y HuggingFace Inference Endpoints, ya que el repositorio esta etiquetado como `endpoints_compatible`. vLLM ofrece soporte GGUF parcial y no es la ruta recomendada para este formato.
- Latencia y throughput: no disponibles. El autor afirma respuesta rapida en T4 y CPU, pero no aporta numeros de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Comparacion orientativa con alternativas de la misma categoria (modelos densos de aproximadamente 3-4 mil millones de parametros orientados a instrucciones). Los datos de los modelos de referencia provienen de sus fichas publicas:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| FormaFit-3B-GGUF | 3,09 mil millones | 32.768 tokens | Turco | Apache-2.0 | Asistente vertical de club deportivo con RAG y tool calling |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens | Multilingue | Apache-2.0 | Modelo general de instrucciones; es la base de este ajuste |
| Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Multilingue (8 idiomas oficiales) | Licencia comunitaria de Llama 3.2 | Modelo general de instrucciones |
| Phi-3.5-mini-instruct | 3,8 mil millones | 128.000 tokens | Multilingue | MIT | Modelo general orientado a razonamiento y contexto largo |

Frente al base Qwen2.5-3B-Instruct, FormaFit-3B aporta especializacion de dominio y adherencia a herramientas concretas, pero pierde generalidad y capacidad multilingue. Frente a Llama-3.2-3B y Phi-3.5-mini, su ventana de contexto es cuatro veces menor y su idioma esta restringido al turco. No hay benchmarks publicados que permitan comparar rendimiento real entre ellos en este caso.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo solo esta entrenado para responder sobre los servicios de FormaFit Spor Kulübü. Fuera de ese ambito, su comportamiento no esta validado.
- Idioma: declarado unicamente para turco. No hay evidencia de funcionamiento fiable en castellano ni en otros idiomas, aunque el base sea multilingue.
- Alucinacion numerica: el propio autor advierte que sin contexto RAG el modelo puede inventar datos numericos (precios, horarios, cuotas). El despliegue debe forzar siempre el contexto recuperado o el uso de herramientas.
- Ambito sanitario excluido: la model card prohibe explicitamente dar consejo medico o clinico. Cualquier consulta de salud debe derivarse.
- Operaciones criticas: en acciones como la cancelacion de una membresia, se exige confirmacion final por parte de la recepcion del club; el modelo no debe ejecutar la accion de forma autonoma.
- Falta de validacion externa: cero descargas y cero valoraciones, sin benchmarks publicos ni evaluacion por terceros. No hay evidencia de robustez en produccion.
- Documentacion incompleta: no se detallan niveles de cuantizacion disponibles, hiperparametros de entrenamiento, composicion del dataset ni volumen de tokens.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y tener en cuenta que el modelo base Qwen2.5-3B-Instruct tambien se distribuye bajo Apache-2.0. No hay clausulas adicionales declaradas por el autor.
- Riesgo de deriva en el tono: al ser un ajuste de identidad corporativa, puede reproducir un estilo comercial poco adecuado si se reutiliza fuera del contexto del club.
- Fecha de publicacion inusual en los metadatos (octubre de 2026); conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Akin38/FormaFit-3B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios de codigo o demos del proyecto FormaFit.
