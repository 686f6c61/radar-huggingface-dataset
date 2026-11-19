# sitala-star/Sitala-Field-Reader-2B-GGUF

## Resumen

Sitala Field Reader 2B es un ajuste fino del modelo Qwen/Qwen3.5-2B (revision `15852e8c16360a2fea060d615a32b45270f8a8fc`) orientado a una unica tarea: responder preguntas en ingles a partir de hasta ocho pasajes numerados, citando el texto de apoyo e identificando la informacion ausente en las fuentes proporcionadas. Lo desarrolla el colectivo Sitala y se distribuye unicamente en formato GGUF cuantizado a Q4_K_M para llama.cpp, con un tamano de archivo de 1.274.396.160 bytes (1,3 GB).

El modelo resuelve un problema concreto de recuperacion aumentada (RAG) con atribucion: en lugar de generar respuestas libres, se le pide que localice la evidencia en pasajes etiquetados y que declare explicitamente cuando la respuesta no esta en las fuentes. Segun la model card, sobre el conjunto de desarrollo publico de Field Atlas respondio correctamente 37 de 60 preguntas, frente a 23 de 60 del modelo base sin modificar, con las mismas condiciones (thinking desactivado, temperatura cero, contexto de 4.096 tokens).

Es relevante ahora por su enfoque en la fiabilidad de la cita y la reduccion de rechazos innecesarios: la tasa de falsos rechazos en items completamente respondibles baja del 38,1% al 9,5%, y el numero de respuestas que citan al menos una fuente anotada sube de 8 a 38 sobre 42 preguntas con evidencia anotada. El modelo base tiene 1.881.825.088 parametros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-2B); ajuste fino con adaptadores de bajo rango en los dos ultimos bloques del decodificador de texto |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | evaluado con 4.096 tokens; la longitud maxima nativa del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada en el repositorio) |
| Idiomas soportados | ingles (en) |
| Licencia | CC BY-SA 4.0 para los pesos ajustados y los ejemplos de entrenamiento derivados; el codigo de `source.zip` es Apache 2.0; los pesos originales de Qwen conservan su aviso Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 1,3 GB |
| Revision del modelo base | `15852e8c16360a2fea060d615a32b45270f8a8fc` |
| Revision de llama.cpp usada | `60081bb2b5b3294165a4d67c5cbeebe74c868014` |
| SHA-256 del archivo | `7b851477859359ea83f80b4a2bea5bd1ea0c079c30707791d9c09e167f1f8021` |
| Pipeline declarado | question-answering |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B, un transformer decoder-only de 1.881.825.088 parametros. El ajuste fino no modifica la topologia: se aplican adaptadores de bajo rango (LoRA) unicamente en los dos ultimos bloques del decodificador de texto, que aprenden a responder a partir de pasajes numerados. El entrenamiento se realizo en dos fases. La primera fue una ejecucion supervisada de 800 pasos sobre un pool de 1.960 ejemplos construido con ejemplos originales, SQuAD y HotpotQA. La segunda actualizo los mismos adaptadores sobre el modelo de texto original en BF16 usando 500 pares procedentes de una mezcla que incluye CLAPNQ; las alternativas rechazadas contienen un fallo observable (cita ausente, rechazo no justificado o respuesta incompleta).

El objetivo de preferencia combina la verosimilitud de los tokens de respuesta con una perdida de log-odds normalizada por longitud. La conversion a GGUF, la cuantizacion a Q4_K_M y la evaluacion reportada se hicieron con la misma revision de llama.cpp que usa Field Atlas. El modelo se distribuye con codigo de entrenamiento, descripcion de datos, manifiestos de fuentes y comandos de evaluacion en el archivo `source.zip`. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas en ingles sobre un conjunto de hasta ocho pasajes numerados.
- Citacion de evidencia: el modelo referencia identificadores de pasaje para respaldar sus respuestas.
- Deteccion de informacion ausente: declara explicitamente cuando la respuesta no aparece en las fuentes suministradas.
- Manejo de entradas largas: evaluado con prompts de hasta 2.356 tokens de entrada y con contextos de 4.096 tokens.
- Modo de razonamiento desactivable: las evaluaciones se ejecutaron con thinking desactivado.
- Soporte de conversacion multi-turno segun el tag `conversational` del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- No se documentan capacidades de codigo, matematicas avanzadas, vision, audio, tool calling ni function calling en la informacion disponible.

## Casos de uso

- Atencion al cliente basada en documentacion: el modelo recibe los articulos de ayuda numerados como pasajes y responde citando el fragmento exacto, lo que permite al operador o al usuario verificar la respuesta. Es adecuado por su entrenamiento especifico en citacion y su baja tasa de falsos rechazos (9,5%).
- Asistencia clinica documental: en las pruebas de grounding se incluyeron casos de informacion clinica ausente y de informes contradictorios; el modelo esta disenado para senalar la ausencia de datos en lugar de inventarlos.
- Analisis de archivos y registros historicos: en la prueba sintetica de archivo filmico obtuvo 13/24 casos con entradas de 1.411 a 2.727 tokens, cubriendo archivos completos, parciales e incompletos. Sirve para consultas sobre catalogos con registros fragmentarios.
- Despliegue offline en dispositivos moviles: el archivo se ejecuto en un emulador Android ARM64 con 6 GB de RAM (API 33, modo avion activado) y el hash del archivo invitado coincidio con el de la release. Util para aplicaciones de campo sin conectividad.
- Verificacion de respuestas en pipelines RAG: al citar identificadores de pasaje, puede actuar como capa de comprobacion que marca respuestas sin soporte documental; el scoring de Field Atlas comprueba mecanicamente los numeros de pasaje.
- Auditoria de respuestas con numeros: la tasa de respuestas con cifras no respaldadas es del 1,7%, lo que lo hace apto para entornos donde una cifra inventada tiene coste alto.
- Procesamiento por lotes en CPU: con 1,5 segundos de mediana por respuesta en el host de escritorio de referencia, es viable para colas de preguntas-respuesta de bajo volumen sin GPU.

## Benchmarks y rendimiento

Resultados medidos en el conjunto de desarrollo publico de Field Atlas (60 preguntas), thinking desactivado, temperatura cero, contexto de 4.096 tokens y el script de puntuacion sin modificar del organizador:

| Medida | Stock 2B | Sitala Field Reader 2B |
|---|---:|---:|
| Precision estricta | 38,3% | 61,7% |
| Hechos clave recuperados | 78,1% | 70,5% |
| Huecos de evidencia reconocidos | 94,4% | 88,9% |
| Falsos rechazos en items totalmente respondibles | 38,1% | 9,5% |
| Respuestas con numeros no respaldados | 1,7% | 1,7% |
| Mediana de segundos por respuesta (mismo host de escritorio) | 1,7 | 1,5 |

Datos adicionales reportados:

| Prueba | Resultado |
|---|---|
| Preguntas con componente respondible y evidencia anotada (42) | Cito al menos una fuente anotada en 38 respuestas (el stock, en 8) |
| Items que el stock fallo y este modelo acerto | 18 |
| Items que este modelo fallo y el stock acerto | 4 |
| Preguntas de salud publica (3) | 0 acertadas (el stock, 1) |
| Prompts publicos con al menos 1.500 tokens de entrada (21) | 10 acertados (el stock, 7) |
| Prompt publico mas largo | 2.356 tokens de entrada |
| Prueba sintetica de archivo filmico | 13/24 casos, entradas de 1.411 a 2.727 tokens |
| Sonda sintetica de 2.948 tokens | No devolvio la respuesta y cita esperadas |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con la cuantizacion Q4_K_M de 1,3 GB, mas el overhead de contexto de 4.096 tokens.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM es suficiente.
- Cabe en GPU consumer: si, en tarjetas como RTX 3050, RTX 4060, RTX 3060 y superiores; tambien en iGPU y CPU.
- Despliegue: llama.cpp (revision de referencia `60081bb2b5b3294165a4d67c5cbeebe74c868014`), con soporte declarado para endpoints compatibles. No se documenta compatibilidad con vLLM, TGI ni Ollama en la informacion disponible.
- Latencia: mediana de 1,5 segundos por respuesta en el host de escritorio de referencia, con contexto de 4.096 tokens y thinking desactivado. No se reporta throughput en tokens por segundo.
- Movil: verificado en un emulador Android ARM64 con 6 GB de RAM (API 33, modo avion). La prueba en el dispositivo fisico Redmi 13C del patrocinador y la evaluacion sellada son procesos separados no incluidos en estos resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Sitala Field Reader 2B | 1.881.825.088 | 4.096 tokens evaluados | QA extractiva con citacion sobre pasajes numerados | CC BY-SA 4.0 (pesos ajustados) | GGUF Q4_K_M |
| Qwen/Qwen3.5-2B (stock) | 1.881.825.088 | no disponible en la informacion proporcionada | Modelo generalista de texto | Apache 2.0 | safetensors, otros |
| Qwen3.5-2B sin ajuste evaluado por Field Atlas | 1.881.825.088 | 4.096 tokens en la evaluacion | Linea base de la comparacion | Apache 2.0 | GGUF (stock) |

La unica comparacion cuantitativa disponible es contra el modelo base sin ajustar: 61,7% frente a 38,3% de precision estricta y 9,5% frente a 38,1% de falsos rechazos. No se dispone de datos frente a otros modelos de la misma categoria en la informacion proporcionada. Como referencia de categoria, los modelos de 2B parametros en formato GGUF Q4 suelen ocupar entre 1,2 y 1,6 GB, en linea con el tamano de este archivo.

## Limitaciones y advertencias

- Solo ingles: el modelo esta entrenado y evaluado exclusivamente en ingles; no se documenta soporte multilingue.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Alucinacion: la model card advierte que el modelo puede omitir evidencia relevante, exagerar el contenido de un pasaje o emitir un rechazo innecesario. La tasa de respuestas con numeros no respaldados es del 1,7%, no cero.
- Regresion en recuperacion de hechos: los hechos clave recuperados bajan del 78,1% (stock) al 70,5%, y los huecos de evidencia reconocidos bajan del 94,4% al 88,9%; la mejora en precision no es uniforme en todas las metricas.
- Fallo en contexto largo: en la sonda sintetica de 2.948 tokens no devolvio la respuesta ni la cita esperadas, pese a estar dentro de la ventana de 4.096 tokens.
- Rendimiento debil en salud publica: 0 de 3 preguntas acertadas frente a 1 del stock; no debe usarse como sistema de decision clinica.
- Contaminacion de la evaluacion: los resultados publicos informaron el desarrollo del modelo; las preguntas selladas las custodia el organizador y su evaluacion es independiente.
- Licencia: los pesos ajustados y los ejemplos de entrenamiento derivados estan bajo CC BY-SA 4.0, lo que impone obligaciones de atribucion y de compartir bajo la misma licencia las obras derivadas; conviene revisar la compatibilidad con el uso comercial previsto. Los textos fuente conservan sus propias licencias y atribucion.
- Procedencia: el desarrollo y la evaluacion fueron asistidos por IA bajo la firma Sitala, segun declara el autor.
- Madurez: el repositorio no tiene descargas ni likes en el momento de la consulta y fue creado en noviembre de 2026; no hay historial de uso en produccion.
- Una unica cuantizacion: solo se publica Q4_K_M, sin alternativas de mayor o menor precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sitala-star/Sitala-Field-Reader-2B-GGUF
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Benchmark Field Atlas: https://github.com/0x94t3z/fieldatlas/tree/08f74c98a0ec0124d434dec7f41ba94fb0f3722b/docs/fieldtest/reader
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
