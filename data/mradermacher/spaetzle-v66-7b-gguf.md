# mradermacher/Spaetzle-v66-7b-GGUF

## Resumen

Spaetzle-v66-7b es un modelo de lenguaje de 7.000 millones de parametros resultante de una fusion (merge) de tres modelos base mediante mergekit en su modalidad lazymergekit. El modelo original fue desarrollado por el usuario cstr, y esta version concreta es una cuantizacion a formato GGUF realizada por mradermacher para permitir su ejecucion en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con GGUF.

El modelo fusiona las capacidades de flemmingmiguel/NeuDist-Ro-7B, cstr/Spaetzle-v53-7b y ResplendentAI/Flora_DPO_7B, todos ellos modelos de 7B basados en arquitectura transformer. Esta disponible exclusivamente en ingles y se distribuye bajo licencia CC-BY-SA-4.0. Su relevancia radica en que ofrece una alternativa de tamano medio con multiples opciones de cuantizacion, desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite desplegarlo en una amplia gama de hardware, desde portatiles con 4 GB de VRAM hasta servidores con GPUs profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo fusionado, base no especificada) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

Spaetzle-v66-7b es un modelo de tipo merge, es decir, no ha sido entrenado desde cero sino que combina los pesos de tres modelos preexistentes de 7B: NeuDist-Ro-7B, Spaetzle-v53-7b y Flora_DPO_7B. La fusion se realizo con mergekit utilizando la tecnica lazymergekit, que permite combinar modelos sin necesidad de cargarlos completamente en memoria durante el proceso.

Al ser un merge, no se dispone de informacion detallada sobre el dataset de entrenamiento original ni sobre el proceso de alineacion de los modelos constituyentes. Sin embargo, por los nombres de los modelos base, se puede inferir que al menos uno de ellos (Flora_DPO_7B) fue sometido a un proceso de optimizacion mediante DPO (Direct Preference Optimization), lo que sugiere que el modelo resultante hereda cierta capacidad de seguir instrucciones y generar respuestas alineadas con preferencias humanas. La cuantizacion GGUF realizada por mradermacher es de tipo estatico, sin utilizar imatrix ni cuantizacion ponderada.

## Capacidades

- Generacion de texto en ingles con estilo conversacional, orientado a dialogos y asistentes.
- Razonamiento basico y respuesta a instrucciones, heredado de los modelos base fusionados.
- Capacidad de mantener conversaciones multi-turno gracias a su naturaleza de modelo de lenguaje generalista.
- Soporte limitado de idiomas: solo ingles confirmado en la model card.
- No se ha confirmado soporte para tool calling, function calling ni capacidades de agente.
- No se ha confirmado modo de razonamiento explicito (thinking mode), vision ni audio.
- Compatible con motores de inferencia que soporten GGUF, como llama.cpp, Ollama, LM Studio y vLLM (via conversion).

## Casos de uso

- Asistente conversacional en ingles: el modelo puede integrarse en aplicaciones de chat o asistentes virtuales gracias a su naturaleza conversacional y su tamano contenido, que permite ejecutarlo en local sin depender de APIs externas.
- Prototipado rapido de aplicaciones LLM: al disponer de multiples cuantizaciones, es adecuado para hacer pruebas de concepto en entornos de desarrollo con recursos limitados, evaluando el equilibrio entre calidad y consumo de memoria.
- Generacion de texto generalista: redaccion de correos, resumen de documentos y generacion de contenido creativo en ingles, con la ventaja de poder ejecutarse en equipos sin GPU profesional.
- Educacion e investigacion: util para estudiar el comportamiento de modelos fusionados y el impacto de distintas cuantizaciones en la calidad de las respuestas, dado que se dispone de 12 niveles de cuantizacion diferentes.
- Despliegue en entornos con privacidad estricta: al ser un modelo local, permite procesar datos sensibles sin enviarlos a servicios en la nube, siempre que el hardware disponible sea suficiente para la cuantizacion elegida.
- Experimentacion con tecnicas de fusion de modelos: los usuarios pueden comparar el rendimiento de este merge frente a sus modelos constituyentes para entender como afecta la fusion de pesos a las capacidades finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandarizadas para este modelo o sus constituyentes.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 2,8 GB (Q2_K) hasta 14,6 GB (f16), segun la cuantizacion elegida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4_K_M o inferiores. Para Q6_K o Q8_0 se recomienda una GPU con 8 GB o mas (RTX 3070/4060 o superior). La version f16 requiere 16 GB de VRAM o mas.
- En CPU: las cuantizaciones Q4_K_M y Q5_K_M son utilizables en CPUs modernas con 16 GB de RAM, aunque con latencias mayores que en GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier otro motor compatible con GGUF.
- Latencia y throughput: no disponible. Dependera del hardware, la cuantizacion y el motor de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spaetzle-v66-7b (GGUF) | 7,24 B | no disponible | CC-BY-SA-4.0 | GGUF | Merge de tres modelos 7B |
| Spaetzle-v65-7b (GGUF) | 7 B aprox. | no disponible | no disponible | GGUF | Version anterior del mismo merge, con distintos constituyentes |
| Spaetzle-v67-7b (GGUF) | 7 B aprox. | no disponible | no disponible | GGUF | Version posterior del mismo merge |

No se dispone de informacion suficiente sobre modelos comparables de la misma categoria (merges de 7B en GGUF) para establecer una comparativa completa. Los modelos Spaetzle-v65 y v67 son variantes del mismo proyecto con diferentes combinaciones de modelos base.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles de forma confirmada. No es adecuado para aplicaciones que requieran espanol u otros idiomas.
- Licencia CC-BY-SA-4.0: es una licencia copyleft que puede imponer restricciones sobre el uso comercial y la redistribucion de obras derivadas. Es recomendable revisar los terminos completos antes de usar el modelo en produccion.
- Sin benchmarks publicados: no hay datos objetivos sobre la calidad del modelo en tareas estandarizadas, por lo que su rendimiento real es incierto.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar informacion falsa o inventada con apariencia de verosimilitud.
- Sesgos: al ser un merge de modelos entrenados principalmente con datos en ingles, puede heredar sesgos culturales y linguisticos de sus datos de entrenamiento.
- Sin soporte de herramientas: no se ha confirmado capacidad de tool calling ni function calling, lo que limita su uso en aplicaciones que requieran interaccion con APIs o ejecucion de acciones.
- Cuantizacion estatica: las cuantizaciones no utilizan imatrix ni metodos ponderados, lo que puede resultar en una perdida de calidad mayor que otras versiones cuantizadas con tecnicas mas avanzadas.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Spaetzle-v66-7b-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/cstr/Spaetzle-v66-7b
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
