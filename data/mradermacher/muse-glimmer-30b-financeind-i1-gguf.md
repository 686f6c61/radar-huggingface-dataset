# mradermacher/Muse-Glimmer-30B-FinanceIND-i1-GGUF

## Resumen

Muse-Glimmer-30B-FinanceIND-i1-GGUF es una cuantizacion en formato GGUF del modelo Rumiii/Muse-Glimmer-30B-FinanceIND, un modelo de lenguaje de aproximadamente 27.850 millones de parametros especializado en finanzas indias y en flujos de trabajo con tool calling y agentes. La cuantizacion la firma mradermacher, un autor habitual en el ecosistema de cuantizaciones GGUF, y emplea el metodo i1 (imatrix) con los tipos de cuantizacion habituales de su catalogo.

El modelo base se ha afinado sobre el dataset Gandalf1/indian-finance-synthetic-phase2-cleaned, lo que lo orienta a dominios financieros del mercado indio y a tareas conversacionales con invocacion de herramientas. Soporta ingles y hindi, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial con las condiciones habituales de atribucion.

Su relevancia practica radica en que ofrece una via de despliegue local o en infraestructura propia mediante llama.cpp y derivados, con tamanos de fichero que van desde aproximadamente 10,8 GB en i1-Q2_K hasta las variantes de mayor precision del repositorio, cuyo peso total ronda los 23,5 GB. Esto permite ejecutar un modelo de casi 28.000 millones de parametros en hardware de gama alta de consumo si se aceptan cuantizaciones agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base etiquetado como muse_glimmer; el autor no detalla la arquitectura interna) |
| Parametros totales | 27.854.794.240 (dato real de safetensors del modelo base) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q2_K_S, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ1_S, i1-IQ1_M, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_NL, i1-IQ4_XS, i1-Q4_0, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de fichero imatrix) |
| Idiomas soportados | Ingles (en) e hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. La etiqueta muse_glimmer sugiere una familia de modelos propia del autor original, pero la model card no especifica si se trata de un transformer denso, un MoE o una arquitectura hibrida. El dato objetivo es el numero de parametros: 27.854.794.240, lo que lo situa en la franja de los 28.000 millones.

Respecto al entrenamiento, la model card unicamente indica el dataset de ajuste Gandalf1/indian-finance-synthetic-phase2-cleaned, de caracter sintetico y centrado en finanzas indias. No se documentan el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo fases de RLHF o DPO. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion i1 emplea una matriz de importancia (imatrix) generada por mradermacher, que se usa para ponderar la cuantizacion y mejorar la calidad respecto a cuantizaciones estaticas del mismo tamano.

## Capacidades

- Generacion de texto conversacional en ingles y hindi.
- Especializacion en dominio financiero indio, incluyendo terminologia y casuistica del mercado de la India.
- Soporte de tool calling / function calling, segun las etiquetas del modelo.
- Orientacion a flujos agenticos y razonamiento multi-paso (etiqueta agentic).
- Capacidad multimodal: la model card de la cuantizacion indica explicitamente que se trata de un modelo de vision y remite a los ficheros mmproj del repositorio estatico.
- No se documentan capacidades de audio ni modos de pensamiento explicito (thinking mode).

## Casos de uso

- Asistencia financiera para el mercado indio: el modelo puede responder consultas sobre productos financieros, terminologia y procedimientos habituales en la India gracias a su ajuste sobre datos financieros sinteticos de ese dominio.
- Agente de atencion al cliente bilingue: con soporte de ingles e hindi, puede gestionar conversaciones multi-turno en centros de contacto que atienden a usuarios de ambos idiomas.
- Automatizacion de back-office financiero: mediante tool calling, puede invocar APIs internas para consultar saldos, estados de cuenta o catalogos de productos, integrandose en pipelines existentes.
- Extraccion y clasificacion de documentos financieros: puede procesar textos y, con el componente de vision, imagenes de documentos para extraer campos estructurados en un pipeline de digitalizacion.
- Generacion de borradores de informes y resumenes financieros: util para equipos de analisis que necesitan primeras versiones de resumenes sobre datos ya estructurados.
- Despliegue local con llama.cpp u Ollama: las cuantizaciones i1 permiten ejecutar el modelo en estaciones de trabajo con GPU de gama alta, sin depender de APIs externas, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de agentes con tool calling: al ser un modelo abierto y cuantizado, sirve para validar arquitecturas agenticas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10,8 GB para la cuantizacion i1-Q2_K; las variantes Q4_K_M y superiores requieren bastante mas, en torno a 17-20 GB segun el tipo, y las de mayor precision se acercan al tamano completo del repositorio (23,5 GB).
- GPU recomendadas: para cuantizaciones bajas, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) son suficientes; para cuantizaciones medias y altas se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB de VRAM usando cuantizaciones i1-Q4 o inferiores; las cuantizaciones Q5/Q6 pueden requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la model card menciona compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-FinanceIND-i1-GGUF | 27,85 B | No disponible | Apache 2.0 | GGUF (i1) | Especializado en finanzas indias, bilingue en/hi, tool calling |
| Modelo base Rumiii/Muse-Glimmer-30B-FinanceIND | 27,85 B | No disponible | Apache 2.0 | Safetensors | Version sin cuantizar del mismo modelo |
| Muse-Glimmer-30B-FinanceIND-GGUF (estatico) | 27,85 B | No disponible | Apache 2.0 | GGUF estatico | Misma base, cuantizaciones sin imatrix, incluye mmproj |

No se dispone de informacion sobre modelos alternativos de la misma categoria con la que comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- El ajuste se ha realizado sobre un dataset sintetico de finanzas indias; es probable que el modelo tenga un conocimiento limitado de otros dominios financieros o de otras jurisdicciones.
- Riesgo de alucinacion en datos numericos, cifras de mercado y normativa, especialmente en un dominio donde la precision es critica; se recomienda verificacion humana en produccion.
- Soporte linguistico limitado a ingles y hindi; el rendimiento en castellano no esta garantizado ni documentado.
- No se documenta la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo con garantias.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de ajuste pueden tener condiciones adicionales que conviene revisar antes de desplegar.
- Las cuantizaciones de baja precision (Q2, IQ2, IQ1) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de validacion por parte de la comunidad.
- La model card indica que es un modelo de vision, pero los ficheros mmproj no estan en este repositorio, sino en el estatico; hay que descargarlos por separado para usar la multimodalidad.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/mradermacher/Muse-Glimmer-30B-FinanceIND-i1-GGUF
- Modelo base: https://huggingface.co/Rumiii/Muse-Glimmer-30B-FinanceIND
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Muse-Glimmer-30B-FinanceIND-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Muse-Glimmer-30B-FinanceIND-i1-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/Gandalf1/indian-finance-synthetic-phase2-cleaned
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
