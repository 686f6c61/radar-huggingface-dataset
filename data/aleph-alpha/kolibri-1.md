# Aleph-Alpha/Kolibri-1

## Resumen

Kolibri 1 es un modelo de razonamiento de tipo mixture-of-experts (MoE) desarrollado por Aleph Alpha Research GmbH, con foco en aleman e ingles. Cuenta con 78.103.074.560 parametros totales y activa 3.457.573.120 parametros (3,46B) por token, lo que reduce el coste computacional por token manteniendo la capacidad de un modelo mucho mayor. Se distribuye en precision FP8 (float8_e4m3fn) y su objetivo es ofrecer un modelo de pesos abiertos soberano con buen rendimiento en razonamiento multi-paso, generacion de codigo y flujos agenticos.

El modelo soporta de forma explicita un modo de razonamiento y tool calling, y esta optimizado para contexto largo y eficiencia de inferencia. Su contexto nativo es de 262.144 tokens, ampliado y validado hasta 1.048.576 tokens sin position scaling, gracias a que la codificacion posicional solo se aplica en las capas de ventana deslizante. Se publica bajo licencia Apache 2.0, lo que facilita su uso comercial.

Su relevancia actual radica en combinar un patron MoE de bajo coste por token con una ventana de contexto de hasta un millon de tokens y capacidades de agente, dentro del ecosistema europeo de IA (Aleph Alpha esta adherida al Codigo de Buenas Practicas de GPAI de la UE). La fecha de publicacion indicada es el 3 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE); transformer de 50 capas con atencion 4:1 SWA:GQA |
| Parametros totales | 78.103.074.560 (78B) |
| Parametros activos | 3.457.573.120 (3,46B) por token |
| Longitud de contexto | 1.048.576 tokens (nativa entrenada 262.144; recomendado <=262.144) |
| Tipos de cuantizacion | FP8 (float8_e4m3fn) en bloques 128x128; version base en BF16 disponible |
| Idiomas soportados | Aleman e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

Kolibri 1 es un transformer MoE de 50 capas con una atencion de proporcion 4:1 entre capas de ventana deslizante (SWA) y capas de atencion por consultas agrupadas (GQA). Cada capa incorpora 384 expertos, de los cuales 1 es compartido y 6 enrutados por token. El entrenamiento empleo Muon y Exact Quantile Balancing. La mayor parte de las capas de atencion opera sobre texto cercano, y solo una fraccion atiende a todo el contexto, lo que reduce el coste del contexto largo. Ademas, se diseno un tokenizador adaptado a la estructura de palabras del aleman sin penalizar el ingles. La codificacion posicional se aplica unicamente en las capas de ventana deslizante, lo que permite extender el contexto mas alla del nativo sin position scaling.

En cuanto a datos, el preentrenamiento uso 20T tokens de un corpus bilingue filtrado (~62,5% ingles, ~23,9% aleman, ~13,6% codigo), combinando web curada, reformulaciones y traducciones sinteticas y fuentes de alta calidad. Se anadieron 3,44T tokens en mid-training y 201B para la extension de contexto largo. El SFT combino datos bilingues filtrados de conjuntos open-source y datos generados sinteticamente, y el RL uso una mezcla amplia de entornos que cubren razonamiento, uso agentico y seguimiento de instrucciones. El preentrenamiento se ejecuto sobre 768 NVIDIA B200 (96 nodos HGX 8xB200) con paralelismo EP8 FSDP16 DP6 durante 21 dias (511 h, 392k GPUh), con 6,4e23 FLOPs; el mid-training consumio 90k GPUh (5 dias) y la fase de contexto largo 10k GPUh (13 h). El cutoff de conocimiento indicado es el 18 de junio de 2026 para ingles y aleman.

## Capacidades

- Generacion de texto y conversacion multilingue en aleman e ingles.
- Modo de razonamiento explicito (reasoning mode) para tareas multi-paso.
- Tool calling / function calling.
- Flujos agenticos y razonamiento multi-paso con validacion externa.
- Generacion y asistencia de codigo.
- Extraccion estructurada de informacion.
- Generacion aumentada por recuperacion (RAG) sobre material propio.
- Procesamiento de documentos y textos muy largos gracias a su ventana de hasta 1.048.576 tokens.
- Tokenizador adaptado al aleman para procesamiento eficiente de ese idioma.

## Casos de uso

- Asistente conversacional en aleman e ingles: el modelo gestiona conversaciones multi-turno con contexto amplio (recomendado hasta 262.144 tokens), adecuado para asistentes internos con memoria de sesion larga.
- RAG sobre documentacion corporativa: permite responder preguntas sobre el material de una organizacion combinando recuperacion de documentos con la ventana de contexto extendida.
- Agente de orquestacion de APIs: su soporte de tool calling permite construir capas que llaman APIs, ejecutan codigo o lanzan busquedas, siempre que el sistema invocante valide los resultados.
- Generacion de codigo en entornos de desarrollo: puede asistir en tareas de programacion y procesar repositorios o ficheros largos, integrÃ¡ndose en pipelines de revision.
- Procesamiento de documentos largos: analisis y sintesis de contratos, informes o expedientes que superan el contexto de modelos convencionales.
- Extraccion estructurada de datos: conversion de texto no estructurado en campos y esquemas para alimentar bases de datos o flujos internos.
- Soporte a la decision (decision-support): el modelo actua en el lado asesor, presentando evidencia y redactando opciones para que una persona las evalue, no como componente decisor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El tech report de Aleph Alpha referencia tablas de evaluacion (Tablas 17, 28 y 29), pero los valores numericos no se incluyen en los datos disponibles para esta ficha.

## Requisitos de hardware

- Huella de memoria del modelo: aproximadamente 78 GB (pesos FP8).
- Configuracion minima: 2x A100 80 GB, 2x H100 SXM5, 1x H200, 1x B200 o 1x B300.
- Configuracion recomendada: 2x H100 SXM5, 2x H200, 1x B200 o 1x B300.
- No cabe en GPU de consumo: los 78 GB de pesos FP8 exceden la VRAM de tarjetas como la RTX 4090 (24 GB) o similares.
- Opciones de despliegue: la model card declara la libreria vLLM (library_name: vllm) con soporte de FP8 y KV cache FP8; al ser formato safetensors, es compatible con servidores de inferencia que soporten FP8, aunque solo vLLM aparece explicitamente referenciado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion se limita a caracteristicas estructurales publicas, ya que no hay datos de rendimiento de Kolibri 1 en la informacion disponible.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| Kolibri 1 | 78B | 3,46B | hasta 1.048.576 (validado) | Apache 2.0 |
| Mixtral 8x22B | ~141B | ~39B | 65.536 | Apache 2.0 |
| Qwen3-235B-A22B | ~235B | ~22B | 131.072 | Apache 2.0 |
| DeepSeek-V3 | ~671B | ~37B | 131.072 | licencia propia de DeepSeek |

Kolibri 1 destaca por activar menos parametros por token que estas alternativas y por su ventana de contexto significativamente mayor, con un enfoque deliberado en solo dos idiomas (aleman e ingles) en lugar de cobertura multilingue amplia. La comparacion de rendimiento entre estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; se trata de un modelo entrenado sobre corpus web y datos sinteticos, por lo que puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: no se documenta una mitigacion especifica; el cutoff de conocimiento (18 de junio de 2026) afecta al conocimiento implicito y el modelo puede requerir tool use para informacion mas reciente.
- Limitacion de idioma: solo soporta aleman e ingles; no cubre otros idiomas de forma nativa.
- Restricciones de uso: licencia Apache 2.0, que permite uso comercial, pero el autor recomienda integrar el modelo en sistemas con revision humana y no como componente autonomo que actue sin supervision.
- Uso previsto limitado: pensado para asistentes conversacionales, flujos agenticos y sistemas de soporte a la decision con validacion; no como componente decisor ni en operacion no supervisada.
- El modelo mantiene todos los pesos en memoria aunque solo active una fraccion por token, por lo que el coste de memoria de 78 GB no se reduce por el patron MoE.
- Rendimiento y comportamiento en produccion (latencia, throughput, tasas de error) no verificados en la informacion disponible.

## Enlaces

- HuggingFace (FP8): https://huggingface.co/Aleph-Alpha/Kolibri-1
- Modelo base BF16: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Tech report: https://aleph-alpha.com/downloads/tech-report.pdf
- Tech blog: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/
- Codigo de Buenas Practicas de GPAI de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- Referencias arXiv indicadas en los tags: arxiv:2512.11614, arxiv:2601.17858
