# RRNicole1014/Qwen2.5-3B-Instruct-Profesor-Albus-Dumbledore-gguf

## Resumen

Qwen2.5-3B-Instruct-Profesor-Albus-Dumbledore-gguf es un ajuste fino (finetune) del modelo Qwen2.5-3B-Instruct realizado por el usuario RRNicole1014 y publicado en formato GGUF. Se trata de un modelo denso de tipo transformer decoder-only con 3.085.938.688 parametros (3,09 B), orientado a conversacion y con una personalidad derivada del personaje Albus Dumbledore, segun indica el propio nombre del repositorio y la etiqueta conversational.

El modelo se entreno y convirtio a GGUF con Unsloth, un framework que acelera el ajuste fino y la exportacion de modelos. El repositorio incluye un Modelfile de Ollama para despliegue directo y esta etiquetado como compatible con endpoints y con llama.cpp, lo que facilita su integracion en herramientas de inferencia local habituales.

Su relevancia practica es limitada y muy especifica: no es un modelo de proposito general competitivo, sino un experimento de personalizacion de personaje sobre una base pequena y eficiente. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un repositorio con adopcion nula, sin benchmarks publicados y sin documentacion sobre el dataset de ajuste. Resulta util como ejemplo de pipeline Unsloth + GGUF + Ollama, mas que como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2 / Qwen2.5) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha del autor; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | F16 documentado explicitamente; el repositorio ocupa 19,0 GB, por lo que es probable que contenga otras cuantizaciones no documentadas en la model card |
| Idiomas soportados | no disponible; el modelo base Qwen2.5 declara soporte para mas de 29 idiomas |
| Licencia | no disponible en la ficha; el modelo base Qwen2.5-3B-Instruct se distribuye bajo licencia Apache 2.0 |
| Formato de pesos | GGUF (fichero `qwen2.5-3b-instruct.F16.gguf`); tambien existen safetensors en el repositorio base del mismo autor |
| Tamano del repositorio | 19,0 GB |
| Fecha de creacion | 2026-09-23 (segun metadatos de HuggingFace) |
| Fecha de actualizacion | 2026-09-23 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE), atencion con consultas y claves agrupadas (GQA) y bias en las proyecciones QKV. El modelo base fue preentrenado por el equipo Qwen de Alibaba sobre un corpus de hasta 18 billones (18T) de tokens, segun la documentacion publica de la familia Qwen2.5, y posteriormente alineado mediante ajuste supervisado y optimizacion por preferencias.

Sobre esa base, el autor de este repositorio aplico un ajuste fino con Unsloth para dotar al modelo de una personalidad concreta (Profesor Albus Dumbledore) y lo convirtio a formato GGUF para su uso con llama.cpp y Ollama. No se especifica en la model card el dataset empleado, el numero de tokens de entrenamiento, la composicion de los datos, ni si se aplicaron tecnicas adicionales como DPO, RLHF o decodificacion especulativa. Tampoco se detalla la configuracion de LoRA o QLoRA utilizada. Toda esa informacion figura como no disponible.

El unico detalle tecnico confirmado del proceso es el uso de Unsloth para el entrenamiento y la conversion, y la inclusion de un Modelfile de Ollama junto al fichero GGUF.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, heredada del modelo base Qwen2.5-3B-Instruct.
- Adopcion de una persona concreta (Profesor Albus Dumbledore) en las respuestas, que es el objetivo declarado del ajuste fino.
- Razonamiento basico, matematicas elementales y generacion de codigo de complejidad baja o media, en la medida en que lo permite un modelo de 3,09 B de parametros.
- Soporte de plantilla de chat tipo Jinja, invocable con el flag `--jinja` en `llama-cli`.
- Compatibilidad declarada con endpoints y con el ecosistema llama.cpp.
- Capacidades multilingues: no confirmadas en la ficha del autor; dependen del modelo base.
- Tool calling, function calling y comportamiento agentico: no documentados en la ficha.
- Modo thinking, vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Prototipado de personajes conversacionales: el modelo permite validar rapidamente como se comporta una personalidad concreta (Dumbledore) en un chatbot, usando el Modelfile de Ollama incluido para levantarlo en local en pocos minutos.
- Desarrollo y prueba de pipelines Unsloth + GGUF: sirve como ejemplo reproducible de como ajustar un modelo pequeno, exportarlo a GGUF y publicarlo con un Modelfile, util para equipos que quieran montar su propio flujo.
- Inferencia local en hardware modesto: al ser un modelo de 3,09 B, puede ejecutarse en portatiles y equipos sin GPU dedicada, lo que permite desplegar asistentes de texto sin coste de API ni envio de datos a terceros.
- Generacion de texto creativo con estilo literario: redaccion de dialogos, narrativa de fantasia o material para juegos de rol donde el tono del personaje aporta valor.
- Demostraciones educativas sobre ajuste fino: permite ilustrar en un aula o taller las diferencias entre un modelo base y su version personalizada, comparando respuestas del Qwen2.5-3B-Instruct original con las de este finetune.
- Experimento de investigacion sobre deriva de personalidad: analizar si un ajuste fino ligero sobre un modelo pequeno mantiene las capacidades originales o degrada el rendimiento en tareas de razonamiento.
- Asistente offline para tareas sencillas de resumen o reformulacion de texto, siempre que se acepte una calidad inferior a la de modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del autor ni los resultados de busqueda web incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion. Tampoco se ha publicado una comparacion con el modelo base Qwen2.5-3B-Instruct que permita medir el impacto del ajuste fino en el rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar el contexto):
  - F16: aproximadamente 6,2 GB.
  - Q8_0: aproximadamente 3,3 GB.
  - Q4_K_M: aproximadamente 1,9-2,0 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100. Para F16 basta con una GPU de 8 GB o mas dejando margen para el contexto.
- Compatibilidad con GPU de consumo: si. El modelo cabe holgadamente en cualquier GPU consumer con 8 GB o mas en F16, y en tarjetas de 4-6 GB usando cuantizaciones Q4.
- Ejecucion en CPU: viable con llama.cpp en cuantizaciones Q4 o Q5, con velocidades de decodificacion del orden de unidades a decenas de tokens por segundo segun el procesador.
- Opciones de despliegue: llama.cpp (`llama-cli -hf RRNicole1014/...  --jinja`), `llama-server`, Ollama (Modelfile incluido), LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para vLLM o TGI seria necesario usar los pesos en safetensors del repositorio base del mismo autor.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 3,09 B, el throughput en GPU moderna sera alto, pero no hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-Profesor-Albus-Dumbledore-gguf | 3,09 B | no disponible (base: 32.768) | no disponible en la ficha | GGUF + safetensors en HF | no |
| Qwen2.5-3B-Instruct (base) | 3,09 B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF oficiales | si, publicados por Qwen |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF de terceros | si, publicados por Meta |
| Gemma-2-2B-it | 2,61 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF de terceros | si, publicados por Google |

No hay datos de rendimiento de este finetune que permitan una comparacion cuantitativa. La comparacion anterior es puramente estructural. Cualquier afirmacion sobre si este modelo rinde mejor o peor que las alternativas careceria de respaldo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al ser un finetune de personaje, es probable que el modelo fuerce el tono y las referencias del personaje incluso en contextos donde no procede, lo que puede considerarse una forma de sesgo de estilo.
- Riesgo de alucinacion: elevado, como en cualquier modelo de 3,09 B de parametros. El ajuste fino sobre una personalidad de ficcion puede incrementar la generacion de contenido inventado con tono convincente.
- Degradacion de capacidades: no hay evaluacion que confirme si el ajuste fino ha preservado el rendimiento del modelo base en tareas de razonamiento, codigo o matematicas. Es habitual que los finetunes de personaje pierdan capacidad en estas areas.
- Limitaciones de contexto e idioma: no confirmadas en la ficha. La ventana de contexto y el soporte multilingue dependen del modelo base y pueden haberse visto afectados por el ajuste.
- Licencia: no disponible en la ficha del repositorio. El modelo base Qwen2.5-3B-Instruct es Apache 2.0, pero eso no garantiza por si solo que el autor del finetune no haya impuesto condiciones adicionales. Antes de un uso comercial conviene verificar la licencia del repositorio y la del modelo base.
- Adopcion nula: 0 descargas y 0 likes. No hay evidencia de uso en produccion, ni informes de terceros, ni issues resueltos.
- Metadatos incompletos: no se documentan pipeline, idiomas ni licencia, lo que dificulta la evaluacion previa.
- Repositorio grande: 19,0 GB para un modelo de 3,09 B sugiere la presencia de multiples cuantizaciones duplicadas; conviene revisar los ficheros disponibles antes de descargar el repositorio completo.
- Fechas de los metadatos: las fechas de creacion y actualizacion (2026-09-23) resultan anomales respecto a la fecha de publicacion de la familia Qwen2.5, por lo que conviene tratarlas con cautela.

## Enlaces

- Modelo en HuggingFace (GGUF): https://huggingface.co/RRNicole1014/Qwen2.5-3B-Instruct-Profesor-Albus-Dumbledore-gguf
- Version en safetensors del mismo autor: https://huggingface.co/RRNicole1014/Qwen2.5-3B-Instruct-Profesor-Albus-Dumbledore
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de la familia Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Vision general de Qwen2.5 en DeepWiki: https://deepwiki.com/QwenLM/Qwen2.5
- Unsloth (framework de entrenamiento y conversion): https://github.com/unslothai/unsloth
- Repositorio de referencia de Qwen2.5 en mx4ai: https://github.com/mx4ai/qwen2.5
