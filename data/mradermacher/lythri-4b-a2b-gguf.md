# mradermacher/Lythri-4B-A2B-GGUF

## Resumen

Lythri-4B-A2B es un modelo de lenguaje orientado a conversacion de acompanamiento emocional y soporte afectivo, desarrollado por Lythri y distribuido en su version cuantizada por mradermacher. El nombre "A2B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 2 mil millones de parametros activos sobre un total de 4.628.569.635 parametros, segun los datos de safetensors del repositorio. Esta ficha documenta la version GGUF, pensada para inferencia en dispositivo (on-device) y despliegue local.

El modelo se presenta como una alternativa ligera para aplicaciones de compania conversacional, soporte emocional y dialogos multi-turno, con licencia Apache 2.0 que permite uso comercial sin restricciones adicionales. Su tamano contenido y su empaquetado en GGUF lo hacen adecuado para ejecucion en hardware de consumo, aunque la informacion publica sobre arquitectura interna, contexto y datos de entrenamiento es muy limitada.

La relevancia actual de este modelo reside en su enfoque de nicho (companero emocional) combinado con un formato de despliegue accesible. No obstante, la ausencia de benchmarks publicados y de documentacion tecnica detallada obliga a tratar sus capacidades con cautela hasta disponer de evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el sufijo "A2B"; detalles no disponibles |
| Parametros totales | 4.628.569.635 |
| Parametros activos | aproximadamente 2 mil millones (inferido del sufijo "A2B"); no confirmado |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (etiqueta "en" en la model card); no se detallan otros |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base se distribuye en transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es Lythri/Lythri-4B-A2B, con 4.628.569.635 parametros totales y una designacion "A2B" que apunta a una arquitectura de mezcla de expertos con unos 2 mil millones de parametros activos por token. No se han publicado detalles sobre el numero de expertos, la estrategia de enrutamiento, la longitud de contexto nativa ni la composicion del dataset de entrenamiento. Tampoco hay informacion sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion.

La unica innovacion tecnica documentada en esta ficha es el proceso de cuantizacion estatica realizado por mradermacher, que genera 12 variantes GGUF desde Q2_K hasta f16, con tamanos que van de 3,1 GB a 9,4 GB. El autor recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q8_0 como mejor relacion calidad-velocidad, y advierte que f16 es "overkill" para este tamano de modelo. Existe tambien una version con cuantizacion ponderada/imatrix en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos de acompanamiento emocional y soporte afectivo.
- Capacidad de mantener conversaciones multi-turno, segun la etiqueta "conversational" de la model card.
- Enfoque en reconocimiento y respuesta a estados emocionales (etiquetas "emotion" y "emotional-support").
- Disenado para inferencia en dispositivo (on-device), lo que permite ejecucion local sin dependencia de la nube.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles confirmado; no disponible para otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Aplicaciones de acompanamiento emocional en dispositivo: el modelo puede integrarse en apps moviles o de escritorio para ofrecer conversaciones de apoyo afectivo sin enviar datos del usuario a servidores externos, gracias a su formato GGUF y su tamano reducido (3,5 GB en Q4_K_M).
- Chatbots de bienestar en entornos con conectividad limitada: su naturaleza on-device permite desplegarlo en dispositivos sin acceso constante a internet, manteniendo conversaciones de soporte basico.
- Prototipado rapido de asistentes conversacionales: los multiples niveles de cuantizacion permiten iterar desde un Q2_K (3,1 GB) para pruebas hasta un Q8_0 (5,0 GB) para evaluacion de calidad final.
- Investigacion en interaccion persona-maquina afectiva: util como linea base ligera para estudiar respuestas emocionales en dialogos controlados, con la ventaja de su licencia Apache 2.0.
- Integracion en asistentes personales de codigo abierto: puede incorporarse en entornos como llama.cpp u Ollama para tareas de conversacion general y soporte emocional dentro de suites de productividad personal.
- Educacion y simulacion de conversaciones: adecuado para entornos de practica de habilidades sociales o entrevistas simuladas, donde el coste computacional bajo permite multiples instancias concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en Q4_K_M, 5,0 GB en Q8_0 y 9,4 GB en f16, mas el overhead del runtime (tipicamente 1-2 GB adicionales).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en modelos con 6 GB o mas de VRAM (por ejemplo, RTX 3060 6 GB, RTX 4060 8 GB, RTX 4090 24 GB).
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede desplegarse con transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lythri-4B-A2B (este) | 4,63 B totales / ~2 B activos | no disponible | Apache 2.0 | GGUF, safetensors | Enfoque en soporte emocional |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion de alternativas directas en la documentacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa fiable con modelos de la misma categoria o tamano.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas estandar (MMLU, HumanEval, GSM8K) ni en evaluaciones de calidad conversacional.
- Documentacion tecnica muy limitada: se desconocen contexto nativo, composicion del dataset, fases de alineacion y detalles de la arquitectura MoE.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, especialmente en dominios factuales; no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no documentados; al estar entrenado presumiblemente en ingles, puede presentar sesgos culturales y linguisticos propios de ese corpus.
- Limitacion idiomatica: solo se confirma soporte de ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Uso en produccion: la naturaleza de "soporte emocional" exige advertencias claras al usuario de que no sustituye a profesionales de la salud mental; no hay documentacion sobre salvaguardas de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad sobre el uso del modelo.
- Repositorio con 0 likes y 279 descargas: comunidad muy reducida, lo que limita el soporte y la validacion independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lythri-4B-A2B-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-4B-A2B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Lythri-4B-A2B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Lythri-4B-A2B-GGUF
- DOI del modelo: https://doi.org/10.5281/zenodo.23179311
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
