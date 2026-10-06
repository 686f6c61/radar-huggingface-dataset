# HolmesSebayang/Chatbot-Legal-Llama-3-8B-RAG

## Resumen

Chatbot-Legal-Llama-3-8B-RAG es un ajuste fino (fine-tuning) del modelo Llama 3 8B Instruct orientado a conversacion de dominio legal con recuperacion aumentada (RAG). Lo publica el usuario HolmesSebayang en HuggingFace y se distribuye bajo licencia declarada apache-2.0. El entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace, partiendo de la version cuantizada a 4 bits `unsloth/llama-3-8b-Instruct-bnb-4bit`, un flujo tipico de QLoRA para adaptar modelos de 8.000 millones de parametros en una sola GPU de gama alta.

El modelo es un transformer decoder-only denso de 8.030.261.248 parametros, sin mezcla de expertos, y esta etiquetado exclusivamente para ingles. El repositorio ocupa 16,1 GB en safetensors, lo que sugiere pesos almacenados en precision de 16 bits (aproximadamente 2 bytes por parametro) y no una cuantizacion de 4 bits en la subida. La model card es minima: no documenta dataset de entrenamiento, numero de tokens, hiperparametros, ni evaluacion.

Su relevancia practica es limitada y hay que tratarlo con cautela: cuenta con 0 descargas y 0 likes, no incluye benchmarks publicados y pertenece a la categoria de ajustes comunitarios sin validacion externa. Resulta util como punto de partida reproducible para pipelines de asistencia legal con RAG en ingles, siempre que se audite su comportamiento antes de cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Llama 3 (segun modelo base) |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, no documentada en la model card) |
| Tipos de cuantizacion | No se publican pesos cuantizados. El repositorio contiene safetensors de ~16,1 GB, compatible con precision de 16 bits (fp16/bf16). El modelo base de partida estaba cuantizado a 4 bits (bnb-4bit) |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 (declarada por el autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible confirma un modelo de la familia Llama 3 de 8.000 millones de parametros, ajustado desde la variante Instruct cuantizada a 4 bits de Unsloth. No se detalla en la model card la composicion del dataset, el numero de tokens de entrenamiento, la longitud de secuencia empleada ni si hubo fases de RLHF, DPO o preferencia adicionales. Tampoco se especifica si el ajuste fue exclusivamente supervisado (SFT) sobre pares instruccion-respuesta de ambito legal.

La unica innovacion tecnica explicitada es el uso de Unsloth junto con TRL, que el autor presenta como un entrenamiento "2x mas rapido" en comparacion con un flujo estandar. Unsloth aplica kernels optimizados y Tecnicas de memoria eficiente para QLoRA, lo que permite adaptar un modelo de 8B en GPUs de consumo. La etiqueta `text-generation-inference` indica compatibilidad con despliegue en TGI, y la etiqueta `conversational` sugiere un formato de chat multi-turno, aunque no se documenta la plantilla de prompt concreta utilizada.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat multi-turno.
- Especializacion declarada en dominio legal mediante el nombre del modelo y la referencia a RAG, sin documentacion tecnica que la respalde.
- Integracion en pipelines de recuperacion aumentada: el modelo espera contexto inyectado en el prompt, aunque no se especifica el formato exacto.
- Compatibilidad con la libreria transformers y con text-generation-inference para servir el modelo.
- Capacidades heredadas del modelo base (Llama 3 8B Instruct): generacion de texto general, resumen, reescritura y comprension lectora basica en ingles.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible, es un modelo exclusivamente de texto.
- Soporte multilingue: no, unicamente ingles segun las etiquetas del repositorio.

## Casos de uso

- Asistente de consultas legales internas en ingles: desplegado con vLLM o TGI detras de un recuperador vectorial que inyecte fragmentos de contratos, jurisprudencia o normativa en el prompt. El modelo redactaria respuestas apoyadas en las fuentes recuperadas, reduciendo (aunque no eliminando) las alucinaciones.
- Revision de clausulas contractuales: dado un contrato segmentado en fragmentos, el modelo puede resumir obligaciones, plazos y partes implicadas. Requiere validacion humana obligatoria por el riesgo de omision de matices juridicos.
- Clasificacion y etiquetado de documentos legales: uso del modelo para asignar categorias (laboral, mercantil, penal) o extraer entidades relevantes en un pipeline de ingesta documental en ingles.
- Generacion de borradores de correspondencia formal: cartas de requerimiento, respuestas a reclamaciones o resumenes ejecutivos para clientes, siempre como borrador sujeto a revision por un profesional.
- Soporte a la formacion de personal juridico: entorno de practica con casos simulados en ingles, aprovechando el ajuste conversacional del modelo base.
- Chatbot de primera linea para despachos: filtrado de consultas frecuentes y derivacion a un abogado cuando la consulta queda fuera del alcance del corpus recuperado.
- Base para experimentacion academica en NLP juridico: el modelo sirve como punto de comparacion en estudios sobre RAG en dominio legal, dado que es reproducible y ligero de desplegar.
- Prototipado rapido en una sola GPU: al ser un modelo de 8B, permite iterar sobre prompts, plantillas y estrategias de recuperacion en una RTX 4090 o similar antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna metrica especifica del dominio legal. Tampoco hay resultados de evaluacion RAG, exactitud de respuestas o tasas de alucinacion.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp16/bf16, aproximadamente 16,1 GB (coincide con el tamano del repositorio de 16,1 GB para 8,03 mil millones de parametros). En int8, en torno a 8 GB. En cuantizacion de 4 bits, aproximadamente 4,5-5 GB.
- VRAM total necesaria: hay que sumar la cache KV y las activaciones, que crecen de forma lineal con la longitud de contexto y el tamano de lote. Con contexto largo y lotes grandes, la reserva adicional puede superar los 4-8 GB sobre el peso de los pesos.
- GPU recomendadas: NVIDIA A100 (40 o 80 GB) y H100 (80 GB) para fp16 con contexto largo y concurrencia alta. L4 (24 GB) y A10G (24 GB) para fp16 con contexto moderado.
- Cabe en GPU de consumo: si. Una RTX 4090 o RTX 3090 (24 GB) ejecuta los pesos en fp16 con margen para contexto moderado; una RTX 4080 o 4070 Ti (16 GB) requiere cuantizacion a 8 o 4 bits.
- Opciones de despliegue: text-generation-inference (TGI), vLLM, transformers con `generate()`. Para llama.cpp u Ollama es necesaria una conversion previa a GGUF, que el autor no publica. Para reentrenamiento o ajuste adicional, Unsloth con TRL.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos de los modelos alternativos no forman parte del material proporcionado y proceden de su documentacion publica; se incluyen solo como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Notas |
|---|---|---|---|---|---|
| Chatbot-Legal-Llama-3-8B-RAG | 8,03 mil millones | No disponible | apache-2.0 declarada | No | Ajuste comunitario, 0 descargas, sin evaluacion |
| Llama 3.1 8B Instruct | 8 mil millones | 128.000 tokens | Meta Llama 3.1 Community License | Si | Modelo generalista oficial de Meta, ampliamente evaluado |
| Mistral 7B Instruct v0.3 | 7,2 mil millones | 32.000 tokens | Apache-2.0 | Si | Alternativa generalista con licencia permisiva real |
| Gemma 2 9B Instruct | 9 mil millones | 8.000 tokens | Gemma Terms of Use | Si | Modelo de Google con buen rendimiento en razonamiento |

La comparacion en calidad es imposible con los datos disponibles: el modelo aqui descrito no publica ninguna metrica, mientras que las alternativas cuentan con evaluaciones reproducibles. La especializacion legal del ajuste tampoco esta cuantificada con un conjunto de evaluacion especifico del dominio.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni conjunto de validacion documentado, ni tasas de error reportadas. No es posible afirmar que el ajuste mejore al modelo base en tareas legales.
- Riesgo elevado de alucinacion en materia legal: el modelo carece de garantias de fidelidad a la normativa y puede citar articulos, sentencias o plazos inexistentes. Cualquier salida debe validarse contra fuentes primarias.
- Dominio de alto riesgo: un error en un contexto legal puede tener consecuencias economicas o personales graves. No debe usarse sin supervision profesional cualificada.
- Sesgos: no se documenta la composicion del dataset de ajuste, por lo que no es posible evaluar sesgos de genero, raza, nacionalidad o clase social. El modelo base entrena mayoritariamente con texto en ingles, con el sesgo cultural que eso implica.
- Limitacion idiomatica: solo ingles. No hay soporte acreditado de castellano ni de otras lenguas, pese a que el nombre del modelo pueda sugerir un uso mas amplio.
- Documentacion insuficiente: la model card no especifica plantilla de chat, formato esperado del contexto RAG, hiperparametros de entrenamiento ni procedencia de los datos.
- Adopcion nula y mantenimiento incierto: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de mantenimiento, issues resueltos ni actualizaciones posteriores.
- Ambiguedad de licencia: el autor declara apache-2.0, pero el modelo deriva de Llama 3, cuyo uso esta sujeto a la Meta Llama 3 Community License y a sus obligaciones adicionales (atribucion, clausulas de uso aceptable y requisitos de nombrado). Conviene verificar la compatibilidad antes de un uso comercial.
- El modelo base de partida es una cuantizacion de 4 bits, lo que puede introducir una perdida de calidad respecto a un ajuste sobre pesos completos.
- Fecha de publicacion registrada en 2026-10-05, incoherente con el estado actual del ecosistema; conviene tratarla como un posible error de metadatos.
- Sin informacion sobre la longitud de contexto efectiva, no es recomendable asumir ventanas largas en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HolmesSebayang/Chatbot-Legal-Llama-3-8B-RAG
- Modelo base: https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: no se proporciona enlace directo en la informacion disponible
- Paper o blog tecnico del modelo: no disponible
- Demo o Space asociado: no disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda corresponden a la serie de television "Miami Vice" y a su adaptacion cinematografica de 2006. No guardan ninguna relacion con el modelo y no aportan informacion tecnica utilizable.
