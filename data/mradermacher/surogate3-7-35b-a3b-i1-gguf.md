# mradermacher/Surogate3.7-35B-A3B-i1-GGUF

## Resumen

Surogate3.7-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Surogate, orientado a tareas de agente, uso de herramientas (tool-use) y razonamiento. La variante aqui descrita es una cuantizacion GGUF publicada por mradermacher, un tercero especializado en generar versiones cuantizadas (IMATRIX y estaticas) de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo base esta etiquetado con arquitectura MoE, capacidades de agente y tool-use, y una licencia Apache 2.0.

La informacion disponible sobre esta ficha es limitada: la model card del repositorio cuantizado se centra casi exclusivamente en el proceso de cuantizacion y no detalla la arquitectura interna, el entrenamiento ni los benchmarks del modelo original. Los datos de parametros totales reflejados en los metadatos de Hugging Face (96.047.470) entran en conflicto con la nomenclatura del modelo (35B-A3B, que sugiere 35 mil millones de parametros totales y 3 mil millones activos), por lo que deben tratarse con cautela. El repositorio cuantizado pesa 0,4 GB, lo que corresponde probablemente a un unico archivo de cuantizacion de bajo tamano o a los metadatos, no al conjunto completo de pesos.

La relevancia de esta ficha radica en que documenta una opcion de despliegue local de un modelo MoE orientado a agentes, con licencia permisiva (Apache 2.0) y soporte para cuantizacion GGUF, lo que facilita su integracion en entornos con recursos limitados. No obstante, la ausencia de datos verificables sobre rendimiento y arquitectura obliga a marcar numerosos campos como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun etiquetas del autor |
| Parametros totales | 35B segun nomenclatura (35B-A3B); 96.047.470 segun metadatos safetensors (dato en conflicto, tratar con cautela) |
| Parametros activos | 3B segun nomenclatura (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IMATRIX y estaticas; lista de quants indicada en la model card: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en formato transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible confirma que el modelo base emplea una arquitectura de tipo Mixture of Experts (MoE), tal como indican las etiquetas `moe`, `agent`, `tool-use` y `reasoning` de la model card. La nomenclatura 35B-A3B sugiere 35 mil millones de parametros totales con aproximadamente 3 mil millones activos por token, un esquema habitual en modelos MoE disenados para reducir el coste computacional de inferencia manteniendo una capacidad de parametros elevada. Sin embargo, no se dispone de detalles sobre el numero de expertos, el mecanismo de enrutamiento, la longitud de contexto nativa ni la composicion del dataset de entrenamiento.

Tampoco se documentan en la informacion proporcionada los datos de entrenamiento (numero de tokens, mezcla de datasets), ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del repositorio cuantizado no incluye innovaciones tecnicas destacables mas alla de la propia cuantizacion IMATRIX, que emplea una matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precision. Cualquier dato adicional sobre la arquitectura interna del modelo original debe consultarse en el repositorio del modelo base.

## Capacidades

- Generacion de texto en ingles, con enfasis en tareas de razonamiento segun las etiquetas del autor.
- Soporte de tool calling / function calling, indicado por la etiqueta `tool-use`.
- Orientacion a flujos de agente y razonamiento multi-paso, indicado por las etiquetas `agent` y `reasoning`.
- Capacidad multimodal (vision): la model card del cuantizador menciona explicitamente que se trata de un modelo de vision y que los archivos mmproj, si existen, estarian en el repositorio estatico.
- Soporte de cuantizacion GGUF para despliegue local con llama.cpp y herramientas compatibles.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.

## Casos de uso

- Agentes autonomos con uso de herramientas: el modelo esta etiquetado como `agent` y `tool-use`, por lo que puede integrarse en bucles de razonamiento donde invoque APIs, funciones o comandos externos y procese sus resultados en varios pasos.
- Asistentes de codigo en local: al ser un MoE con unos 3B parametros activos y cuantizaciones GGUF, puede desplegarse en estaciones de trabajo para autocompletado y generacion de codigo sin depender de la nube, siempre que se valide su calidad en tareas de programacion.
- Automatizacion de flujos con llamadas a funciones: en pipelines de CI/CD o RPA, el modelo puede decidir que herramienta invocar y con que argumentos, aprovechando su soporte de function calling.
- Procesamiento de documentos con componente visual: dado que la model card lo describe como modelo de vision, podria emplearse para tareas de extraccion de informacion de imagenes o documentos escaneados, usando los archivos mmproj del repositorio estatico.
- Prototipado rapido de agentes en hardware de consumo: las cuantizaciones de baja precision (Q4_K_M, IQ4_XS, Q5_K_M) permiten ejecutar el modelo en GPU consumer o incluso CPU, facilitando pruebas de concepto sin infraestructura dedicada.
- Razonamiento asistido en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su incorporacion en productos comerciales, sujeto a las obligaciones de atribucion correspondientes.
- Investigacion sobre eficiencia de modelos MoE: la disponibilidad de multiples cuantizaciones IMATRIX y estaticas permite comparar calidad y rendimiento entre precisiones en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en la nomenclatura 35B-A3B, una cuantizacion de 4 bits de un modelo de 35B parametros totales requeriria del orden de 18-22 GB de VRAM, mientras que una de 2 bits rondaria los 10-12 GB; estos calculos son estimaciones y no datos confirmados por el autor.
- GPU recomendadas: no disponibles. Por tamano, cabria esperar que una RTX 4090 (24 GB) pudiera ejecutar cuantizaciones de 4 bits o inferiores, y que GPU de datacenter como A100 o H100 permitieran precisiones mayores.
- Cabe en GPU consumer: probablemente en modelos con 16-24 GB de VRAM usando cuantizaciones de 2 a 4 bits, aunque no hay confirmacion oficial.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para los archivos GGUF; el modelo base en transformers puede servirse con vLLM o TGI, aunque no se documenta compatibilidad explicita.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones suficientes del modelo base como para establecer una comparacion rigurosa con alternativas de la misma categoria (modelos MoE de ~35B parametros totales y ~3B activos orientados a agentes y tool-use).

## Limitaciones y advertencias

- Los metadatos de parametros totales (96.047.470) entran en conflicto con la nomenclatura del modelo (35B-A3B); debe verificarse en el repositorio del modelo base antes de dimensionar infraestructura.
- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea limitado.
- No hay informacion sobre sesgos, datos de entrenamiento ni procesos de alineacion, lo que impide evaluar riesgos de sesgo y toxicidad.
- Riesgo de alucinacion no cuantificado: al no haber benchmarks publicados, no puede estimarse su fiabilidad en tareas factuales.
- La model card del cuantizador es generica y no describe el modelo original; la informacion sobre capacidades (vision, agente, tool-use) proviene unicamente de etiquetas y debe validarse empiricamente.
- Aunque la licencia es Apache 2.0, conviene revisar la model card del modelo base por si existieran terminos adicionales de uso aceptable.
- El repositorio cuantizado tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de su calidad o estabilidad.
- La fecha de creacion del repositorio (2026-11-22) es posterior a la fecha habitual de referencia; verificar la vigencia y procedencia de los artefactos antes de usarlos en produccion.

## Enlaces

- Repositorio cuantizado en Hugging Face: https://huggingface.co/mradermacher/Surogate3.7-35B-A3B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Surogate3.7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Surogate3.7-35B-A3B-i1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
