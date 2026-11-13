# akal-lm/Akal-1B-GGUF

## Resumen

Akal-1B es un modelo de lenguaje derivado de Google Gemma-3-1B-IT, publicado por Muhammad Luqni Baehaqi bajo la iniciativa Akal LM. Se distribuye exclusivamente en formato GGUF Q4_K_M, cuantizado con una matriz de importancia (imatrix) calibrada especificamente para indonesio, con el objetivo de ofrecer inferencia rapida en CPU sobre hardware de bajos recursos (portatiles de oficina, mini-PC industriales, terminales punto de venta e IoT sin GPU dedicada).

El modelo mantiene la arquitectura original de Gemma 3 con 1.000 millones de parametros y una ventana de contexto que el autor limita a 2.048 tokens en los ejemplos de uso. La propuesta de valor no es la capacidad bruta, sino la eficiencia: el autor reporta 21,0-28,4 tokens/s de decodificacion y un consumo de RAM pico inferior a 938 MB en un Intel Core i5-8250U, con una perplejidad de 11,20 en indonesio frente a 11,66 del Gemma-3-1B-IT original cuantizado de la misma forma.

Es relevante ahora porque cubre un nicho concreto: despliegue on-device en CPU sin GPU, con calibracion linguistica para indonesio. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el propio autor es el unico evaluador de los benchmarks publicados, por lo que los datos deben tratarse como no verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), derivado de google/gemma-3-1b-it |
| Parametros totales | 1.000 millones (1.00B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (configurado en los ejemplos del autor); ventana nativa de Gemma 3 no indicada en la informacion disponible |
| Tipos de cuantizacion | GGUF Q4_K_M con imatrix de indonesio (unico formato publicado) |
| Idiomas soportados | indonesio (id), ingles (en) |
| Licencia | Gemma License (Google) |
| Formato de pesos | GGUF (fichero akal-1b-q4_k_m.gguf, 762 MB) |

## Arquitectura y entrenamiento

Akal-1B no es un modelo entrenado desde cero: es un ajuste de cuantizacion del modelo instructivo google/gemma-3-1b-it. La innovacion declarada consiste en el uso de una matriz de importancia (imatrix) calibrada con un corpus de dominio indonesio (`imatrix_id.dat`, 1,4 MB) para guiar la cuantizacion Q4_K_M en llama.cpp, de modo que los pesos mas sensibles para ese idioma conserven mayor precision. El autor reporta una perplejidad en indonesio de 11,20 frente a 11,66 del Gemma-3-1B-IT cuantizado con Q4_K_M estandar, una mejora modesta pero medible segun sus datos.

No se dispone de informacion sobre el volumen de tokens de calibracion, la composicion exacta del corpus de imatrix ni si hubo etapas adicionales de ajuste fino supervisado, RLHF o DPO mas alla del modelo base. Tampoco se detalla si se aplicaron tecnicas de decodificacion especulativa o atencion lineal; el modelo hereda las caracteristicas del Gemma 3 original. El autor publica un preprint (`Akal_Edge_LLM_Research_Paper.pdf`, CC-BY 4.0) con la metodologia y el analisis de ablacion, pero no se ha verificado de forma independiente.

## Capacidades

- Generacion de texto conversacional en indonesio e ingles, heredada de Gemma-3-1B-IT.
- Razonamiento basico y respuesta a instrucciones de complejidad baja o media, acorde a un modelo de 1B parametros.
- Generacion de codigo y matematicas simples (capacidad del modelo base, no evaluada especificamente en la informacion disponible).
- Inferencia en CPU pura mediante llama.cpp, Ollama y llama-cpp-python, sin necesidad de GPU.
- Ejecucion en dispositivos edge con menos de 1 GB de RAM pico segun el autor.
- Capacidades multilingues limitadas a indonesio e ingles; el resto de idiomas del modelo base no se declaran soportados.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Atencion al cliente en indonesio sobre terminales de punto de venta: el modelo cabe en menos de 1 GB de RAM, lo que permite desplegarlo en cajas registradoras o mostradores sin GPU para responder consultas frecuentes y guiones de venta con baja latencia (TTFT de ~294-448 ms segun el autor).
- Asistentes de oficina en portatiles de gama baja: con 762 MB en disco y menos de 950 MB de RAM pico, puede integrarse en aplicaciones de escritorio para redaccion de correos, resumenes y respuestas guiadas en indonesio e ingles.
- Procesamiento de lenguaje natural en gateways IoT industriales: al no requerir GPU ni swap, es viable en pasarelas con 1,5 GB de RAM libre para clasificacion de incidencias, extraccion de entidades o generacion de alertas en texto.
- Prototipado rapido y demos offline: su formato GGUF y su integracion con Ollama permiten levantar un chatbot local en minutos sin infraestructura cloud, util para validar flujos conversacionales antes de escalar a modelos mayores.
- Educacion y tutoria en indonesio: el modelo puede generar explicaciones y ejercicios en dicho idioma, con la ventaja de la calibracion imatrix que preserva calidad linguistica en ese dominio frente a cuantizaciones genericas.
- Sustitucion de envoltorios PyTorch en CPU: el autor reporta hasta 3 veces mas throughput (21-28 tok/s) frente a alternativas como WiTi4Bit (6,9-9,2 tok/s), lo que lo hace adecuado para pipelines de generacion por lotes en servidores sin acelerador.
- Filtrado y moderacion de contenido en tiempo real en entornos con recursos limitados, aprovechando el bajo consumo de memoria y la velocidad de decodificacion.

## Benchmarks y rendimiento

Datos publicados por el autor sobre Intel Core i5-8250U (4 nucleos / 8 hilos, 7,5 GB RAM, Ubuntu x86_64, 4 hilos). No verificados de forma independiente.

| Modelo | Formato / runtime | Tamano | Prefill (pp512) | Decode (tg128) | TTFT (ms) | RAM pico (RSS) | PPL indonesio |
|---|---|---|---|---|---|---|---|
| Akal-1B | GGUF Q4_K_M (imatrix) | 762 MB | 62-100 tok/s | 21,0-28,4 tok/s | ~294-448 | < 938 MB | 11,20 |
| Gemma-3-1B-IT (base) | GGUF Q4_K_M (llama.cpp) | 768 MB | 84-100 tok/s | 21,7-28,1 tok/s | ~386-450 | < 940 MB | 11,66 |
| WiTi4Bit (Pokdartik) | Q4M (PyTorch CPU int4mm) | 595 MB | 18-25 tok/s | 6,9-9,2 tok/s | ~1.250-1.820 | 3.192 MB | 24,57-28,93 |
| Meta Llama-3.2-1B-Instruct | GGUF Q4_K_M (llama.cpp) | 771 MB | 115-118 tok/s | 27,4 tok/s | ~480 | < 920 MB | 9,26 |
| Alibaba Qwen2.5-1.5B-Instruct | GGUF Q4_K_M (llama.cpp) | 1.120 MB | 68-78 tok/s | 20,0 tok/s | ~690 | 1.120 MB | 7,43 |

Observaciones: la mejora de Akal-1B frente al Gemma-3-1B-IT base en velocidad es marginal (practicamente identica en decodificacion), y la ventaja principal es la perplejidad en indonesio (11,20 frente a 11,66). Frente a Llama-3.2-1B y Qwen2.5-1.5B, Akal-1B muestra peor perplejidad en indonesio en el caso de Llama (9,26) y muy superior en el de Qwen (7,43), aunque el autor no reporta comparaciones en otros benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el fichero Q4_K_M de 762 MB requiere aproximadamente 1-1,5 GB de VRAM considerando overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050, RTX 3050, etc.); no se han publicado pruebas en GPU en la informacion disponible.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna; el caso de uso principal es CPU.
- CPU objetivo: Intel Core i5-8250U o equivalente (4 nucleos / 8 hilos), con 1,5 GB de RAM libre; el autor valida con 4 hilos.
- Opciones de despliegue: llama.cpp (CLI), Ollama (via Modelfile), llama-cpp-python. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: TTFT de ~294-448 ms, decodificacion de 21,0-28,4 tok/s y prefill de 62-100 tok/s en el hardware de referencia del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL indonesio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akal-1B | 1,00B | 2.048 (config. autor) | 11,20 | Gemma License | GGUF Q4_K_M |
| Gemma-3-1B-IT | 1,00B | no disponible | 11,66 | Gemma License | Multiples formatos |
| Llama-3.2-1B-Instruct | 1,23B | no disponible | 9,26 | Llama 3.2 Community | Multiples formatos |
| Qwen2.5-1.5B-Instruct | 1,54B | no disponible | 7,43 | Apache 2.0 | Multiples formatos |

Akal-1B se posiciona como una variante especializada en indonesio y CPU del Gemma-3-1B-IT. Su ventaja frente al base es la perplejidad en indonesio y el empaquetado GGUF listo para edge; su desventaja es que Llama-3.2-1B y Qwen2.5-1.5B obtienen mejor perplejidad en indonesio segun los propios datos del autor, aunque con mayor tamano en el caso de Qwen. La licencia Gemma es mas restrictiva que Apache 2.0 para uso comercial.

## Limitaciones y advertencias

- Modelo de 1B parametros: capacidad de razonamiento, matematicas y codigo limitada en comparacion con modelos de mayor tamano; no apto para tareas complejas de agente o multi-paso.
- Sesgos: al derivar de Gemma 3, hereda los sesgos del modelo base de Google, no evaluados ni mitigados especificamente en esta version.
- Riesgo de alucinacion: elevado en un modelo de este tamano, especialmente fuera de los dominios de calibracion (indonesio e ingles).
- Idiomas: solo se declaran indonesio e ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Contexto limitado a 2.048 tokens en la configuracion recomendada, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion; revisar los terminos antes de desplegar en produccion.
- Benchmarks no verificados: todos los datos de rendimiento proceden del autor, con 0 descargas y 0 likes en el repositorio; no hay evaluacion independiente.
- Unico formato publicado (GGUF Q4_K_M): no hay versiones en safetensors ni otras cuantizaciones (Q5, Q8, FP16) en la informacion disponible.
- Repositorio con tamano de 0,0 GB reportado por Hugging Face, lo que puede indicar problemas de carga de los ficheros o de sincronizacion de LFS; conviene verificar la integridad antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akal-lm/Akal-1B-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Perfil del autor: https://huggingface.co/luqni
- Organizacion Akal LM: https://huggingface.co/akal-lm
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Preprint: `Akal_Edge_LLM_Research_Paper.pdf` incluido en el repositorio del modelo (CC-BY 4.0)
