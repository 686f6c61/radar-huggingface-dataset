# mradermacher/Micius-27B-GGUF

## Resumen

Micius-27B es un modelo de lenguaje multimodal (vision-language) desarrollado por zhiman-ai y orientado a tareas de ingenieria, diseno de semiconductores y hardware. Esta ficha concreta corresponde a la version cuantizada en formato GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo base cuenta con aproximadamente 26.900 millones de parametros (26.895.998.464 segun los pesos en safetensors), lo que lo situa en la categoria de modelos densos de gran tamano.

La relevancia de esta publicacion radica en que permite ejecutar un modelo especializado en dominios tecnicos de ingenieria (semiconductor, hardware-design) y con capacidades agenticas sobre hardware de consumo, gracias a la disponibilidad de cuantizaciones desde Q2_K hasta Q8_0. Sin embargo, la informacion publica disponible es muy limitada: no se detallan la longitud de contexto, la composicion del dataset de entrenamiento, los resultados de benchmarks ni la licencia exacta, lo que obliga a tratar muchos parametros como no disponibles.

Se trata, por tanto, de una ficha de caracter exploratorio: el valor principal documentado es la disponibilidad de los pesos cuantizados y el catalogo de ficheros GGUF, mientras que las caracteristicas arquitectonicas y de rendimiento del modelo base no estan publicadas en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-language; detalles no publicados) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion publica detallada sobre la arquitectura interna del modelo base zhiman-ai/Micius-27B. Los tags de la model card indican que se trata de un modelo multimodal (vision-language) con capacidades orientadas a ingenieria, semiconductores, diseno de hardware y uso agentico. El tamano de parametros (~26,9 mil millones) sugiere un transformer denso de gran escala, pero no se confirma ni el tipo exacto de atencion, ni si incorpora innovaciones como atencion lineal, decodificacion especulativa o modulos de vision dedicados (mas alla de la presencia del fichero mmproj, que es el proyector multimodal usado en llama.cpp para modelos de vision).

Tampoco se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. La model card del repositorio cuantizado se limita a indicar que son cuantizaciones estaticas del modelo base y que no se han generado (por parte de mradermacher) cuantizaciones ponderadas/imatrix en el momento de la publicacion. Toda esta ausencia de datos debe considerarse una limitacion importante a la hora de evaluar el modelo para produccion.

## Capacidades

- Generacion de texto conversacional en ingles (tag "conversational").
- Procesamiento multimodal vision-language: incluye ficheros mmproj (Q8_0 y f16) para integrar entrada de imagenes en llama.cpp.
- Orientacion a dominios de ingenieria: tags especificos de "engineering", "semiconductor" y "hardware-design".
- Capacidades agenticas declaradas mediante el tag "agentic".
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de otros idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia en diseno de circuitos y semiconductores: el modelo puede emplearse para responder consultas tecnicas sobre arquitecturas de hardware y flujos de diseno, aprovechando su especializacion declarada en el dominio de semiconductores.
- Analisis de documentacion tecnica de ingenieria: con capacidad multimodal, puede procesar diagramas o esquemas junto a texto para extraer especificaciones, siempre que se use el fichero mmproj correspondiente.
- Despliegue local en estaciones de trabajo de ingenieria: las cuantizaciones Q4_K_M (16,8 GB) permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM, facilitando su uso en entornos sin acceso a la nube.
- Prototipado de agentes tecnicos: gracias al tag "agentic", puede integrarse en flujos multi-paso para tareas de consulta y verificacion en dominios de hardware, aunque la ausencia de datos sobre tool calling limita su uso en pipelines automatizados complejos.
- Generacion de documentacion tecnica en ingles: adecuado para redactar especificaciones, resumenes de datasheets o notas de diseno, dado su enfoque en ingenieria y su soporte de ingles.
- Evaluacion e investigacion de modelos multimodales especializados: util para investigadores que quieran comparar el comportamiento de un modelo de 27B orientado a dominios tecnicos frente a modelos generalistas, usando las distintas cuantizaciones para estudiar el impacto de la compresion en la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF):
  - Q2_K: ~11,2 GB
  - Q3_K_M: ~13,6 GB
  - Q4_K_S: ~15,7 GB
  - Q4_K_M: ~16,8 GB
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - Proyector multimodal mmproj: ~0,7 GB (Q8_0) o ~1,0 GB (f16), adicional.
- GPU recomendadas: para Q8_0 se necesita una GPU con 32 GB o mas (A100 40 GB, H100, RTX A6000); para Q4_K_M cabe en GPUs de 24 GB (RTX 4090, RTX 3090); para Q2_K/Q3 puede intentarse en GPUs de 12-16 GB con offloading parcial a CPU.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con cuantizaciones Q2/Q3 y posible offloading.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con GGUF; el modelo base en safetensors es compatible con transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de contexto que permitan una comparacion rigurosa con alternativas de la misma categoria. Como referencia estructural, se trata de un modelo denso de ~27B en formato GGUF, comparable en requisitos de hardware a otros modelos densos de ese orden de magnitud, pero sin datos publicados de benchmarks no es posible establecer una comparativa fundamentada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos ni evaluaciones de seguridad.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al ser un modelo de lenguaje generativo, existe riesgo inherente, especialmente en dominios tecnicos donde la precision es critica.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta publicada, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base (zhiman-ai/Micius-27B) antes de cualquier despliegue en produccion.
- Caveat de cuantizacion: las cuantizaciones Q2_K y Q3_K_M degradan la calidad; la propia model card marca Q3_K_M como "lower quality". Para produccion se recomienda Q4_K_M o superior.
- Ausencia de cuantizaciones imatrix/ponderadas: en el momento de la publicacion no estaban disponibles, lo que puede afectar a la calidad relativa frente a otras publicaciones del mismo autor.
- Falta de benchmarks y de documentacion del entrenamiento: impide validar el rendimiento real y la idoneidad del modelo para tareas criticas de ingenieria.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Micius-27B-GGUF
- Modelo base: https://huggingface.co/zhiman-ai/Micius-27B
- Pagina de descargas del autor: https://hf.tst.eu/model#Micius-27B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
