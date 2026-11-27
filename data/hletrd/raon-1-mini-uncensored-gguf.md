# hletrd/Raon-1-mini-Uncensored-GGUF

## Resumen

Raon-1-mini-Uncensored-GGUF es una distribucion cuantizada en formato GGUF del modelo KRAFTON/Raon-1-mini, un transformer de tipo mixture-of-experts (MoE) de aproximadamente 28.800 millones de parametros totales, publicado por el usuario hletrd. La particularidad de esta version es que se ha aplicado una edicion de pesos de tipo "abliterated": se ha eliminado una direccion de rechazo medida capa a capa en las proyecciones de salida de atencion y en las proyecciones down de los expertos (routed y shared) de las capas 6 a 20, ademas de los vectores de control de esfuerzo de las capas 12, 14, 16, 18 y 20 (1.955 tensores en total). La cabeza de salida y el embedding permanecen inalterados.

El modelo resuelve el problema de los rechazos en produccion cuando se necesita un asistente sin filtros de contenido, manteniendo la fidelidad de la distribucion original: segun la model card, la tasa de rechazo en HarmBench (200 prompts, sin thinking) pasa del 99,0 % en el modelo original Q8_0 al 0,0 % en esta version, y del 98,5 % al 0,0 % en Q4_K_M, mientras que la divergencia KL frente a los pesos BF16 del modelo base se mantiene baja (0,0123 en Q8_0 para WikiText-2).

La relevancia actual radica en que ofrece cuantizaciones listas para llama.cpp con requisitos de hardware documentados desde una RTX 4090 hasta una B300, con contexto declarado de hasta 256K en configuraciones de memoria alta, y con una licencia Apache 2.0 que facilita el uso comercial. El modelo solo soporta coreano e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con expertos routed y shared; edicion abliterated sobre proyecciones de atencion y down de expertos |
| Parametros totales | 28.783.231.402 (~28,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K segun configuracion de hardware (64K en GPUs de 24-32 GB) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K (con imatrix) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base KRAFTON/Raon-1-mini es un transformer con arquitectura mixture-of-experts que combina expertos routed y un experto shared por capa, con un mecanismo de "effort steering" implementado mediante vectores en capas concretas (12, 14, 16, 18 y 20). Los pesos originales se publicaron en MXFP8 y la model card de esta distribucion indica que las comparaciones de fidelidad se hicieron dequantizando dichos pesos a BF16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica de esta ficha es la edicion abliterated: se mide una unica direccion de rechazo por capa, con los canales 1031 y 189 puestos a cero, y se resta de las proyecciones de salida de atencion y de las proyecciones down de expertos de las capas 6 a 20, asi como de los vectores de effort steering de las capas 12 a 20. La cabeza de salida y el embedding no se tocan, lo que preserva la distribucion de vocabulario. Las cuantizaciones se generaron con imatrix y se validaron con divergencia KL y acuerdo top-1 frente a BF16 en WikiText-2, un conjunto de chat y un conjunto held-out.

## Capacidades

- Generacion de texto conversacional multi-turno en coreano e ingles.
- Razonamiento con modo "thinking" desactivable (las metricas de rechazo se midieron con thinking off).
- Control de esfuerzo de razonamiento mediante los vectores de effort steering presentes en las capas 12, 14, 16, 18 y 20.
- Generacion de codigo y matematicas: no se documentan benchmarks especificos en la informacion disponible, pero el modelo base es de proposito general.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion proporcionada.
- Multilingue limitado a coreano e ingles.
- Sin capacidades de vision ni audio documentadas.
- Comportamiento sin rechazos: 0,0 % de rechazos en HarmBench (200 prompts) en todas las cuantizaciones medidas.

## Casos de uso

- Asistentes conversacionales sin filtros de contenido: el modelo mantiene el 95,98 % de acuerdo top-1 con el original en Q8_0 (chat KL 0,0099), por lo que puede sustituir al modelo base en aplicaciones donde los rechazos interrumpen el flujo, como escritura creativa o roleplay.
- Generacion de ficcion y narrativa adulta: la eliminacion de la direccion de rechazo permite tratar temas que el modelo original declinaba, con una fidelidad de distribucion alta en Q8_0 y Q6_K.
- Despliegue en estaciones de trabajo con una sola GPU consumer: el archivo Q4_K_S (18,7 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB con 64K de contexto, lo que permite ejecutar un MoE de 28,8 B en local.
- Servicio de inferencia en servidores con H100, H200 o B200: con Q8_0 (30,7 GB) se puede servir con 256K de contexto y margen amplio de memoria para batching.
- Investigacion sobre alineacion y abliteration: los datos de KL y top-1 por cuantizacion permiten estudiar el coste de la edicion de pesos frente al modelo original en tareas de chat y held-out.
- Evaluacion de robustez de filtros: la comparacion directa entre el original (99,0 % de rechazos en HarmBench Q8_0) y esta version (0,0 %) sirve como caso de estudio para medir la eficacia de mecanismos de rechazo en modelos MoE.
- Prototipado en Apple Silicon: con una Mac Studio de memoria unificada de 128 GB o superior se puede ejecutar Q8_0 con 256K de contexto usando llama.cpp compilado para Metal.

## Benchmarks y rendimiento

Datos de fidelidad y rechazo publicados en la model card (thinking off):

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | HarmBench rechazados |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 30,69 GB | 0,012310 | 95,23 % | 0,009899 | 95,98 % | 0,006364 | 96,16 % | 0,0 % |
| Q6_K | 25,84 GB | 0,017447 | 94,08 % | 0,012158 | 95,77 % | 0,008316 | 95,33 % | 0,0 % |
| Q5_K_M | 22,18 GB | 0,026520 | 93,31 % | 0,014079 | 95,02 % | 0,010392 | 94,72 % | 0,0 % |
| Q4_K_M | 19,69 GB | 0,045793 | 91,75 % | 0,020167 | 93,59 % | 0,016603 | 93,20 % | 0,0 % |
| Q4_K_S | 18,68 GB | 0,047628 | 91,48 % | 0,020802 | 93,82 % | 0,017451 | 93,37 % | 0,0 % |
| IQ4_XS | 16,21 GB | 0,073649 | 89,31 % | 0,027501 | 92,31 % | 0,027526 | 91,69 % | 0,0 % |
| Q3_K_M | 15,34 GB | 0,121533 | 86,43 % | 0,039828 | 91,41 % | 0,044974 | 89,75 % | 0,0 % |
| Q2_K | 13,14 GB | 0,280896 | 79,37 % | 0,094192 | 86,43 % | 0,125588 | 82,77 % | 0,0 % |

Comparacion con el original sin editar (Xylolabs/Raon-1-mini-GGUF):

| Modelo | Tamano | WikiText-2 KL | top-1 | HarmBench rechazados | Alpaca rechazados |
|---|---:|---:|---:|---:|---:|
| Original Q8_0 | 30,69 GB | 0,005885 | 96,87 % | 99,0 % | 1,0 % |
| Original Q4_K_M | 19,69 GB | 0,041563 | 91,79 % | 98,5 % | 1,0 % |

La comprobacion de respuestas de 33 items da 32/33 en todas las cuantizaciones, igual que el modelo BF16. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: desde 13,14 GB (Q2_K) hasta 30,69 GB (Q8_0) solo para pesos; hay que anadir la cache KV para el contexto deseado.
- GPU recomendadas segun la model card:
  - RTX 4090 / RTX 3090 (24 GB): Q4_K_S (18,7 GB) con 64K de contexto.
  - RTX 5090 (32 GB): Q6_K (25,8 GB) con 64K de contexto.
  - H100 (80 GB), B200 (192 GB), B300 (288 GB), H200 (141 GB): Q8_0 (30,7 GB) con 256K de contexto.
  - RTX 6000 Ada o 2 x 24 GB (48 GB): Q8_0 con 256K.
  - DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256-512 GB): Q8_0 con 256K.
- Cabe en GPU consumer: si, en RTX 3090/4090 con Q4_K_S o inferiores; en RTX 5090 con hasta Q6_K.
- Opciones de despliegue: exclusivamente llama.cpp, y concretamente el fork krafton-ai/llama.cpp, rama `raon-1-mini`, commit `e1647091f3f53c63c184c536d7b33b5958e60225` o posterior, compilado con CUDA. El comando de referencia es `llama-server -m <archivo>.gguf --jinja -ngl 99 -c 32768`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Raon-1-mini-Uncensored-GGUF (este) | ~28,8 B totales (MoE) | hasta 256K segun hardware | Apache 2.0 | GGUF | Abliterated, 0,0 % rechazos en HarmBench, requiere fork de llama.cpp |
| Xylolabs/Raon-1-mini-GGUF | ~28,8 B totales (MoE) | no disponible | Apache 2.0 | GGUF | Version sin editar del mismo base; 99,0 % de rechazos en HarmBench Q8_0; mejor KL (0,0059 frente a 0,0123) |
| KRAFTON/Raon-1-mini (original) | ~28,8 B totales (MoE) | no disponible | Apache 2.0 | MXFP8 / safetensors | Modelo base sin cuantizar; referencia BF16 para las metricas de fidelidad |

No se dispone de datos de benchmarks de tareas (MMLU, HumanEval, GSM8K) para comparar el rendimiento cognitivo con alternativas de la misma categoria.

## Limitaciones y advertencias

- La edicion abliterated elimina los rechazos por diseno: el modelo respondera a practicamente cualquier peticion, incluidas las que el modelo original declinaba. No debe desplegarse en entornos orientados al publico sin moderacion externa.
- La fidelidad respecto al original se degrada: en Q8_0 el KL de WikiText-2 sube de 0,0059 a 0,0123 y el top-1 baja de 96,87 % a 95,23 %; en Q4_K_M el top-1 de chat baja de 94,67 % a 93,59 %. En Q2_K el top-1 cae al 79,37 %, lo que hace esa cuantizacion poco recomendable para produccion.
- Solo soporta coreano e ingles; no hay soporte documentado de espanol ni de otros idiomas.
- Requiere un fork especifico de llama.cpp (rama `raon-1-mini`); no funciona con llama.cpp upstream, Ollama, vLLM ni TGI en el momento de la publicacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es inherente a los modelos de lenguaje y la edicion de pesos no lo mitiga.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y etica del contenido generado sin filtros recae en el desplegador.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Raon-1-mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Version GGUF sin editar: https://huggingface.co/Xylolabs/Raon-1-mini-GGUF
- Fork de llama.cpp necesario: https://github.com/krafton-ai/llama.cpp (rama `raon-1-mini`)
- Repositorio de herramientas de cuantizacion citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
