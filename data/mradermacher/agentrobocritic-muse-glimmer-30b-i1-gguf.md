# mradermacher/AgentRoboCritic-Muse-Glimmer-30B-i1-GGUF

## Resumen

AgentRoboCritic-Muse-Glimmer-30B-i1-GGUF es una cuantizacion en formato GGUF, generada por mradermacher, del modelo cx-cmu/AgentRoboCritic-Muse-Glimmer-30B. Se trata de un modelo multimodal orientado a robotica y a la evaluacion de acciones de robots (robot-action-evaluation), desarrollado originalmente por el grupo cx-cmu. El modelo base cuenta con 27.854.794.240 parametros (aproximadamente 27,9 mil millones) y esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines de investigacion y produccion.

Esta version concreta es una recuantizacion con imatrix (i1) que ofrece un abanico amplio de niveles de compresion, desde IQ1_S (6,6 GB) hasta Q6_K (23,0 GB), pensada para ejecutar el modelo en hardware con recursos limitados mediante llama.cpp y ecosistemas compatibles con GGUF. Al ser un modelo de vision, los ficheros mmproj (proyector multimodal) se distribuyen en el repositorio estatico complementario del mismo autor.

Su relevancia actual radica en que permite desplegar localmente un modelo especializado en evaluacion de acciones roboticas multimodales sin necesidad de GPUs de datacenter, algo poco habitual en esta categoria. El repositorio tiene 1217 descargas y esta etiquetado como compatible con endpoints, lo que sugiere su uso en servicios de inferencia estandarizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal orientado a robotica; detalles no publicados en la informacion disponible) |
| Parametros totales | 27.854.794.240 (aproximadamente 27,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de versiones estaticas en el repo GGUF secundario) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix adicional para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base cx-cmu/AgentRoboCritic-Muse-Glimmer-30B. Por las etiquetas del repositorio (robotics, multimodal, robot-action-evaluation) y por el tamano de parametros (27,9 B), se trata de un modelo transformer multimodal disenado para procesar observaciones (presumiblemente imagenes o estados visuales) y evaluar o criticar acciones de robots. No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La contribucion tecnica de esta ficha concreta es la cuantizacion: mradermacher ha generado cuantizaciones ponderadas con imatrix (i1), un metodo que calibra los pesos de cuantizacion usando una matriz de importancia para preservar mejor la calidad en niveles de compresion agresivos. El fichero imatrix.gguf (0,1 GB) se incluye para que otros usuarios puedan generar sus propias cuantizaciones. Al ser un modelo de vision, los ficheros mmproj necesarios para la parte multimodal no estan en este repositorio, sino en el repositorio estatico enlazado.

## Capacidades

- Evaluacion y critica de acciones de robots: la especialidad declarada del modelo (robot-action-evaluation).
- Procesamiento multimodal: al ser un modelo de vision, acepta entradas visuales ademas de texto (requiere el fichero mmproj del repositorio estatico).
- Generacion de texto conversacional: la etiqueta "conversational" indica soporte para dialogos multi-turno.
- Razonamiento sobre trayectorias y acciones roboticas: orientado a tareas de analisis y valoracion de comportamiento de agentes fisicos.
- Compatibilidad con endpoints de inferencia: etiquetado como endpoints_compatible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles (unico idioma declarado).

## Casos de uso

- Evaluacion automatizada de politicas roboticas: el modelo puede actuar como critico que puntua y justifica la calidad de las acciones generadas por un agente robotico, integrandose en bucles de evaluacion offline antes de desplegar una politica en hardware real.
- Investigacion en aprendizaje por refuerzo con feedback de modelos: al emitir juicios sobre acciones, puede usarse como recompensa o critica en pipelines de RL, sustituyendo o complementando evaluadores humanos en fases de exploracion.
- Analisis de logs y videos de ejecucion robotica: gracias a su naturaleza multimodal, puede procesar secuencias visuales de un robot y generar informes textuales sobre fallos o comportamientos anomalos.
- Despliegue local en laboratorios con recursos limitados: las cuantizaciones desde IQ2 hasta Q4 permiten ejecutar el modelo en una unica GPU de consumo (por ejemplo, 16-24 GB de VRAM con Q4_K_M), algo util para grupos de investigacion sin acceso a clusters.
- Prototipado rapido de asistentes conversacionales especializados en robotica: la etiqueta "conversational" permite construir interfaces de dialogo para depurar y explicar decisiones de un sistema robotico.
- Integracion en servicios de inferencia estandarizados: al ser endpoints_compatible y estar en GGUF, puede servirse mediante llama.cpp server, Ollama o vLLM con backend GGUF, facilitando su inclusion en infraestructura existente.
- Generacion de cuantizaciones propias: el fichero imatrix incluido permite a otros equipos producir variantes ajustadas a su hardware y requisitos de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): desde aproximadamente 7-8 GB con IQ1_S/IQ2_XXS hasta unos 23-24 GB con Q6_K; las opciones intermedias Q4_K_M (17,0 GB) y Q5_K_M (19,9 GB) son las mas equilibradas.
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o una A100/H100; para cuantizaciones IQ2-IQ3, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 16 GB con IQ3_M o IQ4_XS; en GPUs de 12 GB solo con cuantizaciones IQ2 o IQ3 bajas.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base es de transformers y el repositorio esta etiquetado como endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota: para la parte multimodal es necesario descargar el fichero mmproj desde el repositorio estatico del autor.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (evaluacion de acciones roboticas multimodales de aproximadamente 28 B parametros), por lo que no es posible establecer una comparativa rigurosa sin inventar datos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado presumiblemente con datos en ingles, puede presentar sesgos linguisticos y culturales propios de ese corpus.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas de evaluacion de acciones roboticas, una critica erronea puede propagarse a bucles de RL o a decisiones de despliegue, por lo que se recomienda validacion humana en puntos criticos.
- Limitaciones de contexto o idioma: solo se declara soporte de ingles; la longitud de contexto no esta publicada, lo que impide planificar tareas de contexto largo con garantias.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero conviene revisar la licencia del modelo base y de los datos de entrenamiento originales, no detallados aqui.
- Caveats para produccion: las cuantizaciones por debajo de Q3 degradan notablemente la calidad (el propio autor advierte "very low quality" o "lower quality" en varios niveles); para uso serio se recomienda Q4_K_M o superior. Ademas, la parte multimodal requiere gestionar el fichero mmproj por separado, y el repositorio ocupa 303,4 GB en total, por lo que hay que descargar solo el fichero necesario.
- Al ser una cuantizacion de terceros, no existe garantia oficial del autor original sobre el comportamiento del modelo cuantizado.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/AgentRoboCritic-Muse-Glimmer-30B-i1-GGUF
- Modelo base: https://huggingface.co/cx-cmu/AgentRoboCritic-Muse-Glimmer-30B
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/AgentRoboCritic-Muse-Glimmer-30B-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#AgentRoboCritic-Muse-Glimmer-30B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
