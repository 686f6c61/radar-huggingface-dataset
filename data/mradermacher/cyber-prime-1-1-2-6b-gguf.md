# mradermacher/Cyber-Prime-1.1-2.6B-GGUF

## Resumen

Cyber-Prime-1.1-2.6B-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo Akahsizrr/Cyber-Prime-1.1-2.6B, un modelo de lenguaje de 2.697.198.592 parametros (aproximadamente 2,7 mil millones) especializado en ciberseguridad. El repositorio no contiene el modelo original ni su codigo de entrenamiento: su aportacion es la conversion de los pesos a GGUF en doce variantes de cuantizacion (desde Q2_K de 1,2 GB hasta f16 de 5,5 GB), lo que permite ejecutar el modelo en hardware de consumo y en entornos sin GPU dedicada mediante llama.cpp y runtimes compatibles.

El modelo declara capacidades orientadas al dominio de seguridad: reconocimiento de entidades nombradas (NER) en texto tecnico, deteccion de phishing, deteccion de anomalias en trafico HTTP, y tareas de inteligencia de amenazas, segun las etiquetas de la model card. Tambien incluye la etiqueta `conversational`, lo que indica soporte de dialogos multi-turno, aunque la model card no detalla el formato de prompt ni las plantillas de chat.

La relevancia actual de esta ficha es doble: por un lado, ofrece una via practica de desplegar un modelo de 2,7 B especializado en seguridad en local, algo util para equipos de SOC que no pueden enviar datos a APIs externas; por otro, es un ejemplo de un modelo pequeno de dominio especifico distribuido unicamente a traves de cuantizaciones de terceros. La model card no proporciona informacion sobre arquitectura interna, contexto, datos de entrenamiento ni resultados de benchmarks, por lo que la evaluacion queda limitada a la informacion declarada en las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `lfm2` apunta a la familia LFM2 de Liquid AI; no se detalla en la informacion disponible) |
| Parametros totales | 2.697.198.592 (≈2,7 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (etiquetada como `license: other` con `license_name: lfm1.0`) |
| Formato de pesos | GGUF (12 variantes); el modelo base usa safetensors |
| Tamano del repositorio | 24,3 GB |
| Modelo base | Akahsizrr/Cyber-Prime-1.1-2.6B |
| Cuantizado por | mradermacher |
| Libreria declarada | transformers |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-26 |
| Descargas / likes | 205 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. La model card incluye la etiqueta `lfm2`, asociada a la familia Liquid Foundation Models, y la licencia `lfm1.0`, coherente con esa familia, pero no se especifica el tipo de bloque (transformer, convolucional, hibrido), el mecanismo de atencion ni el numero de capas. Tampoco se documenta la longitud de contexto, el tamano del vocabulario ni el tokenizador.

Respecto al entrenamiento, la model card declara cuatro conjuntos de datos: jpmorganchase/CyberBench, tihanyin/CyberMetric, secbench-hf/SecBench y XuanwuAI/SecEval. Estos nombres corresponden a recursos de evaluacion en el ambito de la ciberseguridad, por lo que no puede confirmarse si se usaron para entrenamiento, para evaluacion o para ambas cosas; la informacion disponible no lo aclara. No se documenta el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La unica innovacion tecnica verificable en este repositorio es la propia cuantizacion: el autor indica que se trata de cuantizaciones estaticas (`output_tensor_quantised: 1`, `quantize_version: 2`) y que no ha publicado variantes ponderadas con imatrix.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica soporte de dialogos, aunque no se documenta la plantilla de chat ni el formato de turnos.
- Reconocimiento de entidades nombradas (NER) en el dominio de ciberseguridad: la etiqueta `named-entity-recognition` sugiere extraccion de indicadores como IPs, dominios, hashes o nombres de herramientas.
- Deteccion de phishing: declarada explicitamente en las etiquetas del modelo.
- Deteccion de anomalias en trafico HTTP: declarada explicitamente en las etiquetas del modelo.
- Inteligencia de amenazas (`threat-intelligence`): analisis y resumen de informacion sobre amenazas.
- Dominio de ciberseguridad general: etiquetas `cybersecurity` y `cyberbench`.
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible; solo se declara texto.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: solo ingles (`language: en`).

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede clasificar y resumir alertas de seguridad en lenguaje natural, con la ventaja de que una cuantizacion Q4_K_M de 1,8 GB puede ejecutarse en local dentro de la red del SOC, sin enviar datos sensibles a servicios externos.
- Extraccion de indicadores de compromiso (IOC): dado un informe de amenazas o un correo sospechoso, el modelo puede etiquetar entidades como direcciones IP, dominios, URLs o hashes, aprovechando la etiqueta `named-entity-recognition` de la model card.
- Filtrado de correo y deteccion de phishing: integrado en un pipeline de correo, el modelo puede actuar como clasificador de segunda opinion sobre mensajes marcados como sospechosos, con coste de inferencia bajo gracias a su tamano de 2,7 B.
- Analisis de logs HTTP: la etiqueta `http-anomaly-detection` apunta a su uso para senalar peticiones anomalas en registros de servidor web, un caso adecuado para despliegue en el borde (edge) por su reducido consumo de memoria.
- Enriquecimiento de plataformas de threat intelligence: el modelo puede resumir y normalizar descripciones de campañas o actores de amenaza antes de almacenarlas en una base de conocimiento interna.
- Asistente interno de consultas de seguridad: un chatbot que responda preguntas de procedimiento o de analisis sobre documentacion corporativa, ejecutado en una estacion de trabajo con GPU de gama media o incluso en CPU.
- Anonimizacion y preprocesado de datos: deteccion de entidades sensibles en textos tecnicos antes de compartirlos con terceros o de incorporarlos a un dataset de entrenamiento.
- Prototipado e investigacion: por su tamano, sirve como modelo de referencia para comparar tecnicas de cuantizacion (de Q2_K a Q8_0) en tareas de seguridad sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni de los conjuntos CyberBench, CyberMetric, SecBench o SecEval que aparecen citados como datasets, y no se ha facilitado la model card del modelo base. Tampoco se han publicado medidas de latencia o throughput para ninguna de las cuantizaciones.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano de los ficheros publicados en el repositorio; no proceden de mediciones del autor.

- Huella de pesos por cuantizacion (solo pesos, sin cache KV ni overhead del runtime):
  - Q2_K: 1,2 GB
  - Q3_K_S: 1,4 GB; Q3_K_M: 1,5 GB; Q3_K_L: 1,6 GB
  - IQ4_XS: 1,6 GB
  - Q4_K_S: 1,7 GB; Q4_K_M: 1,8 GB
  - Q5_K_S: 2,0 GB; Q5_K_M: 2,0 GB
  - Q6_K: 2,3 GB
  - Q8_0: 3,0 GB
  - f16: 5,5 GB
- VRAM estimada en inferencia: hay que anadir a la cifra anterior el overhead del runtime y la cache KV, cuyo tamano depende de la longitud de contexto, dato no disponible. Como referencia conservadora, Q4_K_M deberia caber en unos 3 GB de VRAM en configuraciones de contexto corto, y f16 en torno a 6-7 GB.
- GPU de consumo: cabe con holgura en tarjetas de 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070) en cuantizaciones de Q4 a Q8_0. Las variantes Q2_K y Q3_K permiten incluso GPUs de 4 GB, a costa de una perdida de calidad que el autor no cuantifica.
- GPU de datacenter: no es necesario A100 ni H100 para un modelo de 2,7 B; estas tarjetas solo tendrian sentido para servir muchas peticiones concurrentes.
- Ejecucion en CPU: viable en todas las cuantizaciones, especialmente de Q2_K a Q5_K, gracias al formato GGUF.
- Opciones de despliegue: llama.cpp y sus derivados (llama-cpp-python, LM Studio, Ollama, koboldcpp) son la via natural para GGUF. El autor remite a los README de TheBloke para el uso de ficheros GGUF, incluida la concatenacion de partes. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia de Hugging Face.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. La unica comparacion verificable es entre el repositorio cuantizado y el modelo original:

| Aspecto | Cyber-Prime-1.1-2.6B-GGUF | Akahsizrr/Cyber-Prime-1.1-2.6B |
|---|---|---|
| Parametros | 2.697.198.592 | no disponible (el repositorio cuantizado deriva de el) |
| Formato | GGUF, 12 variantes (1,2-5,5 GB) | safetensors (formato inferido por el conteo de parametros) |
| Licencia | lfm1.0 | lfm1.0 (declarada como `license: other`) |
| Contexto | no disponible | no disponible |
| Uso previsto | inferencia local en CPU/GPU de consumo | ajuste fino o conversion a otros formatos |
| Disponibilidad | 205 descargas, 0 likes | no disponible |

Comparacion con modelos alternativos de tamano o tarea similar: no disponible.

## Limitaciones y advertencias

- Este repositorio es una cuantizacion de terceros, no el modelo original; el autor del modelo base no ha validado necesariamente estas variantes, y la cuantizacion puede degradar la calidad, especialmente en Q2_K y Q3_K_S.
- La model card no documenta la longitud de contexto, la plantilla de chat ni el formato de prompt, lo que puede provocar un rendimiento suboptimo si se usa una plantilla incorrecta.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad. En tareas de seguridad, una salida incorrecta (por ejemplo, un IOC inventado o un falso negativo en phishing) puede tener consecuencias operativas graves; se requiere validacion humana.
- Sesgos conocidos: no disponible. No se documenta la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo de dominio ni el sesgo linguistico.
- Limitacion idiomatica: el modelo solo declara ingles (`language: en`). No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Licencia: se declara `lfm1.0` con `license: other` y un enlace a un fichero LICENSE. No se detallan en la informacion proporcionada las condiciones de uso comercial, redistribucion o atribucion; es imprescindible revisar el texto completo de la licencia antes de cualquier uso en produccion.
- Uso dual: un modelo especializado en ciberseguridad puede emplearse tanto para defensa como para tareas ofensivas. No se documentan filtros de seguridad ni evaluaciones de uso indebido.
- Adopcion limitada: con 205 descargas y 0 likes en el momento de la consulta, no existe una comunidad amplia que haya reportado resultados, por lo que el soporte y la validacion externa son escasos.
- El repositorio ocupa 24,3 GB en total; descargar todas las variantes no es necesario, pero conviene planificar el almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Cyber-Prime-1.1-2.6B-GGUF
- Modelo base: https://huggingface.co/Akahsizrr/Cyber-Prime-1.1-2.6B
- Pagina de descarga del autor para este modelo: https://hf.tst.eu/model#Cyber-Prime-1.1-2.6B-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Dataset jpmorganchase/CyberBench: https://huggingface.co/datasets/jpmorganchase/CyberBench
- Dataset tihanyin/CyberMetric: https://huggingface.co/datasets/tihanyin/CyberMetric
- Dataset secbench-hf/SecBench: https://huggingface.co/datasets/secbench-hf/SecBench
- Dataset XuanwuAI/SecEval: https://huggingface.co/datasets/XuanwuAI/SecEval
- Fichero de licencia referenciado en la model card: LICENSE (en el repositorio del modelo base)
- Empresa del cuantizador: https://www.nethype.de/
- Referencia sobre uso de GGUF y ficheros multiparte: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
