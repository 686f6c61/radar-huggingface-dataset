# mradermacher/tmax-2b-v1.1-i1-GGUF

## Resumen

tmax-2b-v1.1-i1-GGUF es la distribucion en formato GGUF del modelo TMaxxx/tmax-2b-v1.1, un modelo de lenguaje de aproximadamente 1.880 millones de parametros (1.881.825.088 segun los pesos en safetensors del modelo base) afinado mediante aprendizaje por refuerzo para actuar como agente de terminal. El modelo original lo desarrolla el usuario TMaxxx, mientras que esta version cuantizada la publica mradermacher, un conocido cuantizador de la comunidad que genera variantes GGUF con y sin imatrix para su uso en llama.cpp y ecosistemas compatibles.

La relevancia de esta ficha radica en que se trata de un modelo especializado y de tamano reducido, pensado para ejecutarse en hardware modesto y para tareas de automatizacion de linea de comandos. El modelo base se entreno sobre el dataset TMaxxx/tmax-13k-v1.1 y esta etiquetado como reinforcement-learning y terminal-agent, lo que sugiere un enfasis en la interaccion con entornos de shell y en la resolucion de tareas paso a paso.

Esta publicacion concreta no es un modelo nuevo, sino un conjunto de cuantizaciones (desde IQ1_S de 0,8 GB hasta Q6_K de 1,7 GB) del modelo base, con licencia Apache 2.0 y soporte unicamente para ingles. El repositorio ocupa 25,8 GB en total debido a la gran cantidad de variantes incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), segun la libreria transformers; detalles internos no disponibles |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo compatible con transformers y que el pipeline declarado es reinforcement-learning. El modelo base TMaxxx/tmax-2b-v1.1 fue afinado con aprendizaje por refuerzo sobre el dataset TMaxxx/tmax-13k-v1.1, orientado a tareas de agente de terminal. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como DPO o RLHF con recompensas verificables.

Las cuantizaciones de esta ficha son variantes i1 (imatrix) generadas por mradermacher, que emplean una matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precision. El repositorio incluye tambien el propio fichero imatrix (`tmax-2b-v1.1.imatrix.gguf`, 0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Comportamiento orientado a agente de terminal: el modelo esta etiquetado como `terminal-agent`, lo que indica entrenamiento para interpretar y emitir comandos de shell y resolver tareas de linea de comandos.
- Razonamiento multi-paso implicito en el paradigma de agente, derivado del entrenamiento con refuerzo.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o thinking mode: no disponibles.
- Capacidades multilingues: limitadas al ingles.

## Casos de uso

- Automatizacion de tareas de shell: el modelo puede recibir el estado de un terminal y proponer comandos para completar tareas de administracion de sistemas, gracias a su entrenamiento especifico como terminal-agent.
- Asistente de CLI en local: al caber en cuantizaciones de 1,3-1,5 GB (Q4_K_S o Q5_K_M), puede desplegarse en portatiles y estaciones de trabajo sin GPU dedicada para ofrecer ayuda contextual en la linea de comandos.
- Agentes de resolucion de incidencias: integrado en pipelines de operaciones, puede encadenar comandos de diagnostico (lectura de logs, comprobacion de servicios) y proponer acciones correctivas paso a paso.
- Entornos con recursos muy limitados: las variantes IQ2 e IQ3 (0,9-1,2 GB) permiten ejecutar el modelo en dispositivos de borde o contenedores pequenos donde un modelo mayor no cabria.
- Prototipado rapido de agentes: su tamano reducido y licencia Apache 2.0 lo hacen adecuado para experimentar con bucles de agente y evaluar estrategias de prompting antes de escalar a modelos mayores.
- Educacion y demostraciones: sirve para ilustrar como un modelo afinado con RL puede operar en entornos de terminal en talleres o cursos, con requisitos de hardware minimos.
- Generacion de scripts de automatizacion: puede producir scripts de shell o comandos encadenados a partir de una descripcion en lenguaje natural, en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 0,8 GB (IQ1_S) y 1,7 GB (Q6_K) solo para los pesos; anadir overhead de contexto y runtime (tipicamente 0,5-1 GB adicionales).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y servidores compatibles con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera una generacion muy rapida en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tmax-2b-v1.1 (esta ficha, GGUF) | ~1,88 B | No disponible | Apache 2.0 | HuggingFace (GGUF y safetensors) |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | Apache 2.0 | HuggingFace, GGUF, Ollama |
| Llama 3.2 1B Instruct | ~1,2 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, GGUF, Ollama |
| Gemma 2 2B | ~2,6 B | 8.192 tokens | Gemma Terms of Use | HuggingFace, GGUF, Ollama |

Nota: los datos de los modelos comparables provienen de conocimiento general y no de la informacion proporcionada en esta busqueda; no se dispone de comparaciones de rendimiento publicadas para tmax-2b-v1.1.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Modelo de 1,88 mil millones de parametros: capacidad de razonamiento y conocimiento del mundo limitada en comparacion con modelos de mayor tamano.
- Riesgo de alucinacion en la generacion de comandos de terminal: un comando incorrecto puede ser destructivo, por lo que se recomienda supervision humana y entornos aislados.
- No se han publicado evaluaciones de sesgo, seguridad ni robustez; se desconoce su comportamiento ante entradas adversarias.
- Las cuantizaciones de muy baja precision (IQ1, IQ2) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- La licencia Apache 2.0 permite uso comercial, pero el modelo base carece de documentacion sobre procedencia de datos de entrenamiento y posibles restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se dispone de informacion sobre la longitud de contexto, lo que dificulta planificar su uso en tareas con historiales largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/tmax-2b-v1.1-i1-GGUF
- Modelo base: https://huggingface.co/TMaxxx/tmax-2b-v1.1
- Dataset de entrenamiento: https://huggingface.co/datasets/TMaxxx/tmax-13k-v1.1
- Cuantizaciones estaticas (sin imatrix): https://huggingface.co/mradermacher/tmax-2b-v1.1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#tmax-2b-v1.1-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
