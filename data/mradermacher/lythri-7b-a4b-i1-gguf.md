# mradermacher/Lythri-7B-A4B-i1-GGUF

## Resumen

Lythri-7B-A4B-i1-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo Lythri-7B-A4B, generadas por el usuario mradermacher, especializado en la publicacion de versiones cuantizadas de modelos abiertos. El modelo base, desarrollado por Lythri, es un modelo conversacional orientado a soporte emocional y acompanamiento (emotional-support, companion), con enfasis declarado en su uso en dispositivo (on-device) y en conversaciones de tipo companero. El repositorio contiene unicamente los pesos cuantizados, no el modelo original.

El modelo base cuenta con aproximadamente 7.463 millones de parametros totales, segun los datos de safetensors publicados. La nomenclatura "A4B" del nombre sugiere una arquitectura de mezcla de expertos (MoE) con un numero reducido de parametros activos, aunque este dato no se confirma de forma explicita en la informacion disponible. La etiqueta "gemma4" presente en el repositorio apunta a que el modelo deriva de la familia Gemma 4, si bien esta relacion no se detalla en la model card.

La relevancia de esta ficha radica en que se trata de un modelo pequeno, con licencia Apache 2.0 y cuantizaciones que van desde los 3,5 GB hasta los 6,3 GB, lo que lo hace desplegable en hardware de consumo. Esta pensado para aplicaciones de acompanamiento conversacional, asistencia emocional y despliegue local, ambitos donde el coste de inferencia y la privacidad de los datos son factores determinantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (nomenclatura "A4B" y etiqueta "gemma4" sugieren derivacion de la familia Gemma; sin confirmar) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (el sufijo "A4B" sugiere del orden de 4.000 millones, dato no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizados); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base. La model card del repositorio de cuantizacion no incluye seccion tecnica de arquitectura, datos de entrenamiento, numero de tokens, composicion del dataset ni detalles sobre tecnicas de alineacion como RLHF o DPO. Las etiquetas asociadas al modelo (emotional-support, companion, on-device, gemma4, conversational) indican su proposito funcional, pero no describen la arquitectura subyacente.

El unico dato tecnico relevante sobre el proceso de cuantizacion es que se trata de cuantizaciones "i1" generadas con fichero imatrix, lo que implica un proceso de cuantizacion guiado por una matriz de importancia para preservar la calidad en tamanos reducidos. Existe ademas una version estatica de las cuantizaciones en el repositorio mradermacher/Lythri-7B-A4B-GGUF. Cualquier afirmacion adicional sobre la arquitectura o el entrenamiento seria especulativa.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos de acompanamiento y soporte emocional.
- Comportamiento de "companero" (companion), disenado para mantener conversaciones de caracter personal y empatico.
- Orientacion a despliegue en dispositivo (on-device), dado el reducido tamano de las cuantizaciones.
- Capacidad multilingue limitada: el modelo declara unicamente el idioma ingles.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de generacion de codigo ni de matematicas.

## Casos de uso

- Aplicaciones de acompanamiento conversacional: el modelo esta etiquetado explicitamente como emotional-support y companion, por lo que encaja en asistentes de bienestar, diarios conversacionales o compania digital en entornos de baja exigencia tecnica. Su tamano reducido permite ejecutarlo localmente.
- Despliegue en dispositivo (on-device): con cuantizaciones que parten de 3,5 GB, puede integrarse en aplicaciones de escritorio o moviles con GPU o CPU capaz, manteniendo las conversaciones en local y sin enviar datos a servicios externos.
- Asistentes personales de privacidad: al ejecutarse de forma local, resulta adecuado para conversaciones sensibles en las que el usuario no quiere que sus mensajes salgan del dispositivo.
- Chatbots de acompanamiento en ingles: para productos dirigidos a un publico angloparlante que requieran un interlocutor conversacional persistente y de tono cercano.
- Experimentacion e investigacion sobre modelos conversacionales pequenos: util para estudiar el comportamiento de modelos de ~7B y arquitecturas MoE de bajo coste en tareas de dialogo.
- Prototipado rapido: gracias a la licencia Apache 2.0 y a las multiples cuantizaciones GGUF, sirve como base para prototipos de producto sin coste de licencia, integrándose en herramientas como llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 3,5 GB (i1-IQ1_M) y 6,3 GB (i1-Q6_K) solo para los pesos; a esta cifra hay que sumar el overhead del runtime y la cache KV, que depende del contexto configurado.
- Las cuantizaciones de 4 bits (i1-Q4_K_M, 5,4 GB; i1-Q4_K_S, 5,3 GB) son las recomendadas por el autor para un equilibrio entre tamano, velocidad y calidad.
- GPU recomendadas: al ser un modelo de ~7B, cabe en tarjetas de consumo. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 o superiores pueden ejecutar comodamente las cuantizaciones de 4 bits. En GPUs de 8 GB puede ser ajustado con cuantizaciones de 4 bits y contexto reducido.
- Tambien puede ejecutarse en CPU mediante llama.cpp, aunque con menor throughput.
- Opciones de despliegue: los ficheros estan en formato GGUF, por lo que son compatibles con llama.cpp, Ollama, LM Studio y otros runners de GGUF. No se indica compatibilidad con vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones tecnicas detalladas del modelo base como para establecer una comparativa rigurosa con alternativas de la misma categoria. La informacion disponible no permite comparar parametros activos, contexto, rendimiento o calidad frente a otros modelos conversacionales de ~7B.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Lythri-7B-A4B (i1-GGUF) | 7.463 millones totales | no disponible | apache-2.0 | GGUF | no disponible |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: el modelo declara soporte unicamente para ingles; su uso en castellano no esta soportado ni verificado.
- Sesgos: no se documenta informacion sobre sesgos conocidos del modelo base.
- Alucinacion: no se aportan datos sobre tasas de alucinacion; en modelos de acompanamiento emocional, una alucinacion puede tener consecuencias sensibles para el usuario.
- Uso en salud mental: dado su enfoque en soporte emocional, conviene advertir que el modelo no es un profesional sanitario y no debe emplearse como sustituto de atencion psicologica o medica. No se documenta ningun mecanismo de seguridad ni de derivacion.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide garantizar conversaciones de multiples turnos extensas.
- Fuente unica de cuantizacion: este repositorio contiene solo las cuantizaciones i1; la ficha describe el modelo base a traves de la informacion del cuantizador, no de una model card tecnica completa.
- Licencia: la licencia declarada es apache-2.0, lo que en principio permite uso comercial; no obstante, conviene verificar la licencia del modelo base Lythri/Lythri-7B-A4B y de la familia de la que derive antes de un despliegue en produccion.
- Madurez: el repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que su validacion por parte de la comunidad es inexistente.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/Lythri-7B-A4B-i1-GGUF
- Repositorio con cuantizaciones estaticas: https://huggingface.co/mradermacher/Lythri-7B-A4B-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-7B-A4B
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Lythri-7B-A4B-i1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia general de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Sitio del autor de las cuantizaciones (nethype GmbH): https://www.nethype.de/
