# ArchiveStudio/Kolibri-1-BF16

## Resumen

Kolibri 1 es un modelo de lenguaje de arquitectura mixta de expertos (MoE) desarrollado por Aleph Alpha Research GmbH (Aleph Alpha GmbH), orientado especificamente a razonamiento multi-paso, uso agentico con llamada a herramientas y generacion de codigo, con foco en aleman e ingles. El repositorio publicado con el identificador `ArchiveStudio/Kolibri-1-BF16` contiene los pesos en bfloat16 del modelo, y su model card apunta a Aleph Alpha como proveedor y desarrollador. El modelo activa solo una fraccion reducida de sus parametros por token, lo que reduce el coste de computo por token manteniendo la capacidad de un modelo mucho mayor.

La arquitectura es un transformer de 50 capas con mezcla de expertos: 384 expertos por capa, 1 compartido y 6 enrutados, con una relacion de atencion 4:1 entre sliding-window attention (SWA) y grouped-query attention (GQA). El modelo totaliza 78.103.074.560 parametros (78B) y activa 3.457.573.120 (3,46B) por token. Su contexto nativo es de 262.144 tokens, aunque se ha validado calidad y eficiencia de servicio hasta 1.048.576 tokens.

Su relevancia reside en tres ejes: es un modelo de pesos abiertos bajo licencia Apache 2.0, esta diseñado especificamente para aleman (con un tokenizador adaptado a la estructura de la palabra alemana) sin renunciar al ingles, y prioriza el coste de inferencia bajo para contextos largos. Se publica como modelo de razonamiento con modo explicito y soporte de tool calling, pensado para asistentes conversacionales y flujos agenticos con supervision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 50 capas con mezcla de expertos (MoE); atencion 4:1 SWA:GQA; 384 expertos por capa (1 compartido, 6 enrutados) |
| Parametros totales | 78.103.074.560 (78B) |
| Parametros activos | 3.457.573.120 (3,46B) por token |
| Longitud de contexto | Nativo 262.144 tokens; validado hasta 1.048.576 tokens; recomendado ≤262.144 tokens |
| Tipos de cuantizacion | BF16 (pesos bfloat16); no se detallan otros formatos cuantizados |
| Idiomas soportados | Aleman e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales: precision `bfloat16`; modo de razonamiento (reasoning mode) y tool calling soportados; fecha de corte de conocimiento (EN y DE): 18 de junio de 2026; fecha de publicacion: 3 de octubre de 2026; huella de memoria del modelo en BF16: ~156 GB.

## Arquitectura y entrenamiento

Kolibri es un transformer MoE de 50 capas que combina dos esquemas de atencion en proporcion 4:1 entre sliding-window attention (SWA) y grouped-query attention (GQA). La mayor parte de las capas de atencion se centra en texto cercano, mientras que un subconjunto reducido atiende a todo el contexto; este diseño busca abaratar el coste de los contextos largos. Cada capa dispone de 384 expertos, de los cuales 1 es compartido y 6 se enrutan por token. El entrenamiento empleo los optimizadores Muon y Exact Quantile Balancing. Una innovacion relevante es que la codificacion posicional solo se aplica en las capas de sliding-window, lo que permite extender el contexto mas alla de la longitud nativa sin ningun escalado posicional, en principio a longitudes arbitrarias.

En cuanto a datos, el pre-entrenamiento uso 20T tokens de un corpus bilingue filtrado (aproximadamente 62,5% ingles, 23,9% aleman y 13,6% codigo) que combina datos web curados, reescrituras y traducciones sinteticas y fuentes de alta calidad. Se realizo ademas un mid-training de 3,44T tokens y una fase final de 201B tokens para extension de contexto (pre-entrenamiento sobre secuencias de 16.384 tokens, mid-training sobre 65.536 y fase final sobre 262.144). El post-entrenamiento incluyo una mezcla de SFT con datos bilingues filtrados de origen abierto y sintetico, y una fase de RL sobre una mezcla amplia de entornos que cubren razonamiento, uso agentico y seguimiento de instrucciones. Los recursos de computo declarados para el pre-entrenamiento (excluyendo mid-training y contexto largo) fueron 768 NVIDIA B200 (96 nodos HGX 8xB200), con paralelismo EP8/FSDP16/DP6, durante 21 dias (511 h, 392k GPUh) y 6,4e23 FLOPS. El consumo energetico estimado (pre-entrenamiento, mid-training y fase de contexto largo, incluyendo PUE) es de 9,5x10² MWh.

## Capacidades

- Generacion de texto en aleman e ingles.
- Razonamiento multi-paso con modo de razonamiento explicito.
- Generacion y asistencia de codigo (aproximadamente el 13,6% del corpus de pre-entrenamiento es codigo).
- Llamada a herramientas y funciones (tool calling / function calling).
- Flujos agenticos y razonamiento multi-paso con orquestacion de APIs, ejecucion de codigo y busquedas.
- Extraccion estructurada de informacion y salida estructurada.
- Generacion aumentada con recuperacion (RAG) sobre material propio de una organizacion.
- Procesamiento de documentos largos gracias al contexto extenso (validado hasta 1.048.576 tokens).
- Capacidades multilingues limitadas a aleman e ingles (eleccion deliberada de profundidad frente a amplitud).
- Soporte de contexto largo sin escalado posicional, aplicable en principio a longitudes arbitrarias.

## Casos de uso

- Asistentes conversacionales en aleman e ingles: el modelo puede mantener conversaciones multi-turno con contexto largo gracias a su ventana validada de hasta 1.048.576 tokens y su contexto nativo de 262.144 tokens, adecuado para asistencia con revision humana.
- Procesamiento y redaccion de documentos: analisis y generacion de borradores sobre documentos extensos (contratos, informes, expedientes) aprovechando la atencion de ventana deslizante que abarata los contextos largos.
- Preguntas y respuestas sobre conocimiento interno de una organizacion (RAG): combinacion de recuperacion de material propio con generacion aumentada, apoyandose en el contexto extenso para incorporar muchos fragmentos.
- Capas de orquestacion y agentes: uso de tool calling y salida estructurada para que el modelo invoque APIs, ejecute codigo o realice busquedas, siempre que el sistema llamante valide los resultados.
- Razonamiento multi-paso y soporte a la decision: el modelo actua en el lado consultivo, aportando evidencia y opciones de borrador para que una persona decida, no como componente decisor autonomo.
- Asistencia de programacion: generacion y ayuda sobre codigo, aprovechando que parte del corpus de pre-entrenamiento es codigo, integrable en herramientas internas de desarrollo.
- Herramientas internas de conocimiento e investigacion: sintesis de informacion y asistencia documental en entornos corporativos germanoparlantes.
- Extraccion de datos estructurados: conversion de texto no estructurado (documentos, correos) en campos estructurados para su explotacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los datos proporcionados no incluyen cifras de MMLU, HumanEval, GSM8K ni de otras evaluaciones comparativas, por lo que no se presentan numeros que no esten respaldados por la informacion disponible.

## Requisitos de hardware

- Huella de memoria del modelo: aproximadamente 156 GB con pesos en BF16.
- Minimo declarado: 4x A100 80 GB, 4x H100 SXM5, 2x H200, 1x B200 o 1x B300.
- Configuracion recomendada: 4x H100 SXM5, 2x H200, 2x B200 o 1x B300.
- No cabe en GPU de consumo: el peso en BF16 (~156 GB) excede la VRAM de cualquier GPU consumer, por lo que requiere hardware de clase centro de datos.
- Opciones de despliegue: el repositorio declara la libreria `vllm` y formato `safetensors`; vLLM es la via de servicio indicada. No se detallan otras opciones (llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput estimados: no disponibles. La model card recomienda contextos de hasta 262.144 tokens para despliegues sensibles a latencia o throughput y para tareas complejas.
- Nota sobre eficiencia: la arquitectura activa solo 3,46B parametros por token, lo que reduce el computo por token, pero exige mantener el modelo completo en memoria.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada. A continuacion se ofrece una comparacion a nivel estructural con modelos de categoria similar (MoE de pesos abiertos), usando datos publicos ampliamente conocidos; los valores de rendimiento de Kolibri no estan disponibles.

| Modelo | Parametros totales | Activos por token | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| Kolibri 1 | 78B | 3,46B | 1.048.576 tokens (nativo 262.144) | Apache 2.0 | Aleman, ingles |
| DeepSeek-V3 | 671B | 37B | 128.000 tokens | Licencia propia (MIT-like para pesos) | Multilingue |
| Mixtral 8x7B | 46,7B | 12,9B | 32.000 tokens | Apache 2.0 | Multilingue |
| Llama 3.3 70B | 70B | 70B (denso) | 128.000 tokens | Licencia comunitaria Llama | Multilingue |

Nota: los datos de los modelos de referencia corresponden a informacion publica general y no a la informacion proporcionada en esta ficha; pueden variar segun la version consultada. La comparacion destaca la propuesta de Kolibri (activacion muy reducida, contexto muy largo, foco aleman/ingles y licencia Apache 2.0) frente a alternativas de mayor activacion por token o contexto mas corto.

## Limitaciones y advertencias

- Cobertura de idiomas deliberadamente limitada: solo aleman e ingles. No se declaran capacidades en otras lenguas, lo que restringe su uso en entornos multilingues.
- Riesgo de alucinacion: como modelo generativo, puede producir informacion incorrecta; no se aportan tasas de alucinacion en la informacion disponible.
- Sesgos conocidos: no se detallan sesgos especificos en la informacion proporcionada.
- Fecha de corte de conocimiento: 18 de junio de 2026 (EN y DE), lo que afecta al conocimiento implicito; la informacion mas reciente debe obtenerse mediante tool use.
- Uso previsto con supervision humana: el modelo esta pensado para colaboracion humano-IA, con revision de la salida antes de actuar, y no como componente decisor autonomo ni para operacion sin supervision.
- Coste de memoria elevado: aunque activa pocos parametros por token, exige mantener ~156 GB en memoria en BF16, lo que requiere hardware de centro de datos y no cabe en GPU de consumo.
- Contexto: aunque se ha validado hasta 1.048.576 tokens, la propia model card recomienda no superar los 262.144 tokens para eficiencia de servicio y tareas complejas.
- Restricciones de licencia: licencia Apache 2.0, que en principio permite uso comercial; deben verificarse los terminos exactos aplicables a los pesos y a cualquier componente de terceros.
- Repositorio con 0 descargas y 0 "likes": no hay evidencia de adopcion ni validacion independiente en el momento de la consulta.
- Aleph Alpha es firmante del Codigo de Buenas Practicas de la UE para modelos GPAI, lo que puede implicar obligaciones de documentacion y transparencia adicionales para despliegues en la UE.
- No se dispone de datos de benchmarks publicados, lo que dificulta la evaluacion comparativa objetiva antes de su adopcion en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/ArchiveStudio/Kolibri-1-BF16
- Tech report (PDF): https://aleph-alpha.com/downloads/tech-report.pdf
- Tech blog: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/
- Paper referenciado en tags: arxiv:2512.11614 (https://arxiv.org/abs/2512.11614)
- Paper referenciado en tags: arxiv:2601.17858 (https://arxiv.org/abs/2601.17858)
- Codigo de Buenas Practicas GPAI de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
