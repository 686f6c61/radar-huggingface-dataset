# qualcomm-ai-hub-community/Ornith-1.5-9B-Hi-Fi-fraQtl

## Resumen

Ornith-1.5-9B-Hi-Fi-fraQtl es una cuantizacion GGUF del modelo de lenguaje Ornith-1.5-9B, desarrollado originalmente por ornith-ai y convertido por el contribuidor fraQtl bajo la organizacion qualcomm-ai-hub-community. El modelo base es un transformer de 8.953.803.264 parametros (aproximadamente 9B) orientado a generacion de texto y uso de herramientas (tool calling), publicado bajo licencia MIT. Esta version concreta se distribuye en dos ficheros GGUF: una cuantizacion Q4_K_M de proposito general para llama.cpp, Ollama y LM Studio, y una cuantizacion Q4_0 optimizada para el backend Hexagon de llama.cpp en la NPU de Qualcomm Snapdragon.

La relevancia de esta ficha reside en el metodo de cuantizacion empleado: en lugar del redondeo tradicional round-to-nearest, se aplica redondeo GPTQ ponderado por Hessiana con una importance matrix construida a partir de conversaciones de chat y tool-use renderizadas con la plantilla de chat propia de Ornith. Segun la model card, esto permite que la version Q4_K_M iguale o supere ligeramente al modelo original en bf16 en el benchmark BFCL v4 live (1.639 frente a 1.637), y que la version Q4_0 para NPU supere a la alternativa de bartowski (1.628 frente a 1.531) con un tamano de fichero practicamente identico.

El modelo esta pensado para despliegue en el borde (edge) y en dispositivo (on-device), incluyendo telefonos con Snapdragon 8 Elite Gen 6. La model card reporta 14,33 tok/s de decodificacion y 993 tok/s de prefill en NPU, cifras equivalentes a las del fichero rival de bartowski dentro del ruido de ejecucion. No se dispone de informacion sobre la longitud de contexto, los idiomas soportados ni los detalles del entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (proposito general) y Q4_0 (NPU Hexagon) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Ornith-1.5-9B (si es un transformer denso convencional, si emplea atencion lineal, decodificacion especulativa u otras innovaciones). La model card de esta cuantizacion no describe el proceso de entrenamiento del modelo original, el numero de tokens utilizados, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo unico confirmado es que se trata de un modelo de 8.953.803.264 parametros y que la model card lo etiqueta como modelo de texto (text model only), sin capacidades multimodales declaradas.

La innovacion tecnica destacable de esta ficha esta en el proceso de cuantizacion, no en el modelo base. El contribuidor aplica redondeo GPTQ ponderado por Hessiana (Frantar et al., 2022) en lugar de round-to-nearest, con una importance matrix derivada de una mezcla de calibracion de conversaciones de chat y tool-use renderizadas con la plantilla de chat de Ornith. Para el fichero Q4_K_M se conserva el mapa de tipos por tensor del fichero original de ornith-ai (0 discrepancias de tipo sobre 250 tensores fijados), eliminando el bloque de next-token-prediction que llama.cpp no utiliza. Para el fichero NPU Q4_0 se emplean exclusivamente tipos soportados por Hexagon, elevando un pequeno numero de tensores a Q8_0 dentro del presupuesto de bytes del fichero de bartowski. Se probo una correccion de escala hacia el original que fue descartada por su guarda preestablecida (el texto general se desviaba mas de lo permitido).

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como conversational y text-generation en Hugging Face.
- Tool calling / function calling: capacidad central del modelo, validada con el benchmark BFCL v4 live (2.251 prompts), que cubre llamadas simples, multiples, paralelas y paralelas multiples, ademas de irrelevancia (saber cuando no llamar) y relevancia.
- Razonamiento multi-paso con herramientas: la puntuacion de tool calls (1.016 en la version Q4_K_M) y la de saber cuando no invocar herramientas (609) indican soporte para decisiones de invocacion en varios turnos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: la evaluacion BFCL se realizo con thinking desactivado, lo que sugiere que el modelo base dispone de un modo de razonamiento explicito, aunque no se detallan sus caracteristicas.
- Capacidades de vision o audio: no disponibles; la model card indica explicitamente que es un modelo solo de texto.
- Despliegue en dispositivo: soporte del backend Hexagon de llama.cpp para ejecucion en NPU Snapdragon, sin operaciones rechazadas por la NPU en las pruebas realizadas.

## Casos de uso

- Asistentes de voz o chat en telefono movil: el fichero NPU Q4_0 permite ejecutar el modelo integramente en la NPU de un Snapdragon 8 Elite Gen 6 a 14,33 tok/s de decodificacion, suficiente para respuestas conversacionales en tiempo real sin enviar datos a la nube.
- Agentes de tool calling en el borde: con una puntuacion BFCL v4 de 1.639 (Q4_K_M) y 1.628 (NPU Q4_0), el modelo es adecuado para orquestar llamadas a APIs locales (calendario, contactos, ajustes del dispositivo) y decidir correctamente cuando no debe invocar ninguna herramienta.
- Automatizacion de atencion al cliente en local: el modelo puede gestionar conversaciones multi-turno con decisiones de invocacion de herramientas (consultas a bases de datos, creacion de tickets) desplegado en servidores con llama.cpp u Ollama, manteniendo los datos en la infraestructura propia.
- Integracion en pipelines de CI/CD para generacion de codigo asistida: aunque no se han publicado resultados en HumanEval o EvalPlus, el modelo puede usarse como generador de texto y codigo en herramientas de desarrollo, con la ventaja de su licencia MIT y su despliegue ligero en GGUF.
- Prototipado rapido en portatiles con GPU de consumo: el fichero Q4_K_M de 5,63 GB cabe en GPUs consumer con 8 GB o mas de VRAM, lo que permite a desarrolladores probar flujos de tool calling sin infraestructura dedicada.
- Evaluacion de cuantizaciones y metodologias de compresion: el repositorio incluye hashes sha256, comparativas pareadas con intervalos de confianza y mapas de tipos por tensor, lo que lo convierte en un caso de referencia para investigar el impacto de GPTQ frente a round-to-nearest en modelos de 9B.
- Aplicaciones de privacidad estricta (sanidad, legal, finanzas): al ejecutarse on-device sin conexion, el modelo permite procesar conversaciones sensibles sin salida de datos, siempre que se validen las limitaciones de contexto e idioma no documentadas.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al benchmark BFCL v4 live (2.251 prompts, greedy, thinking desactivado), con todos los ficheros verificados por sha256 y evaluados en la misma ejecucion:

| Fichero | Bytes | Total | Tool calls | Sabe cuando no llamar | Fallos vs original |
|---|---|---|---|---|---|
| Original bf16 (ornith-ai/Ornith-1.5-9B) | no disponible | 1.637 | 1.016 | 607 | - |
| ornith-ai Q4_K_M | 5.780.090.816 | 1.564 | 1.005 | 545 | 162 |
| fraQtl Q4_K_M (este repo) | 5.629.109.184 | 1.639 | 1.016 | 609 | 101 |
| bartowski Q4_0 | 5.482.832.768 | 1.531 | 1.000 | 517 | 209 |
| fraQtl NPU Q4_0 (este repo) | 5.482.832.640 | 1.628 | 1.001 | 613 | 125 |

Diferencias pareadas (cota inferior unilateral al 95 % entre corchetes): fraQtl Q4_K_M frente a ornith-ai Q4_K_M, total +75 [+47,6], llamadas +11 [−7,7], rechazos +64 [+44,2]; fraQtl NPU Q4_0 frente a bartowski Q4_0, total +97 [+67,9], llamadas +1 [−19,5], rechazos +96 [+75,7]. La ganancia se concentra en saber cuando no invocar herramientas, mientras que el numero de llamadas correctas esta a la par con el fichero rival.

Rendimiento en dispositivo (Snapdragon 8 Elite Gen 6, SM8975, backend Hexagon de llama.cpp, mismo telefono y ajustes, orden nuestro-rival-rival-nuestro):

| Fichero | Decodificacion (tok/s) | Prefill (tok/s) | Operaciones rechazadas por la NPU |
|---|---|---|---|
| bartowski Q4_0 | 14,29 | 1.000 | 0 |
| fraQtl NPU Q4_0 | 14,33 | 993 | 0 |

Las diferencias estan dentro del ruido entre ejecuciones. No se han publicado resultados de MMLU-Pro, GSM8K, IFEval ni EvalPlus para estos ficheros; la model card indica que, en otros modelos construidos con la misma receta, esas pruebas empatan con el fichero mas descargado.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 5,63 GB y el NPU Q4_0 ocupa 5,48 GB; se recomienda al menos 6-7 GB de VRAM o memoria unificada para cargar el modelo con margen para el contexto.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090, A100, H100 para despliegue en servidor; cualquier GPU consumer con 8 GB o mas de VRAM para el fichero Q4_K_M.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 y superiores).
- Despliegue: llama.cpp (incluido el backend Hexagon para NPU Snapdragon), Ollama y LM Studio para el fichero Q4_K_M; llama.cpp con backend Hexagon para el fichero NPU Q4_0. No se menciona soporte de vLLM ni TGI en la informacion disponible.
- Latencia y throughput: en NPU Snapdragon 8 Elite Gen 6, 14,33 tok/s de decodificacion y 993 tok/s de prefill. No se han publicado cifras para GPU o CPU en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL v4 live (total) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B bf16 (original) | 8,95B | no disponible | 1.637 | MIT | Hugging Face (ornith-ai) |
| Ornith-1.5-9B Q4_K_M (ornith-ai) | 8,95B | no disponible | 1.564 | MIT | Hugging Face |
| Ornith-1.5-9B fraQtl Q4_K_M (este repo) | 8,95B | no disponible | 1.639 | MIT | Hugging Face |
| Ornith-1.5-9B bartowski Q4_0 | 8,95B | no disponible | 1.531 | MIT | Hugging Face |
| Ornith-1.5-9B fraQtl NPU Q4_0 (este repo) | 8,95B | no disponible | 1.628 | MIT | Hugging Face |

Las alternativas comparables en la informacion proporcionada son las distintas cuantizaciones del mismo modelo base. No se dispone de datos de otros modelos de 9B de la misma categoria (por ejemplo, Llama, Qwen o Mistral en ese rango) para establecer una comparativa cruzada con cifras verificadas.

## Limitaciones y advertencias

- La evaluacion se limita a un unico benchmark (BFCL v4 live, 2.251 prompts) y a una sola construccion de cada fichero; no hay mediciones de MMLU-Pro, GSM8K, IFEval ni EvalPlus para estos ficheros concretos.
- El rendimiento en dispositivo solo se ha medido para el fichero NPU Q4_0, no para el Q4_K_M.
- El modelo es solo de texto; no dispone de vision ni audio.
- No se documentan la longitud de contexto, los idiomas soportados ni los sesgos conocidos del modelo base, lo que impide evaluar su idoneidad para casos multilingues o de contexto largo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de veracidad o fidelidad para este modelo.
- La cuantizacion Q4_0 para NPU esta restringida a tipos soportados por Hexagon; su uso fuera de ese backend no esta documentado.
- La licencia MIT permite uso comercial, pero el modelo base y las dependencias de llama.cpp deben verificarse por separado antes de un despliegue en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre estos ficheros.
- Se descarto una correccion de escala hacia el original por desviar en exceso el texto general; esto implica que la cuantizacion puede presentar diferencias de comportamiento frente al bf16 en tareas no cubiertas por BFCL.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/qualcomm-ai-hub-community/Ornith-1.5-9B-Hi-Fi-fraQtl
- Repositorio canonico del contribuidor fraQtl: https://huggingface.co/fraQtl/Ornith-1.5-9B-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Cuantizacion Q4_K_M de ornith-ai: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Referencia del metodo GPTQ: Frantar et al., 2022 (no se proporciona URL en la informacion disponible)
- llama.cpp y backend Hexagon: no se proporciona URL en la informacion disponible
- Benchmark BFCL v4: no se proporciona URL en la informacion disponible
