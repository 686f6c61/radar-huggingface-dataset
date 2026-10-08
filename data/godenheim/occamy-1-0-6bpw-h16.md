# godenheim/occamy-1.0-6bpw-h16

## Resumen

Occamy-1.0-6bpw-h16 es una cuantizacion EXL3 del modelo Accio-Lab/occamy-1.0, un MoE derivado del checkpoint post-entrenado Qwen3.6-35B-A3B orientado a tareas de "co-work" agentico: flujos de larga duracion, con estado persistente, uso coordinado de busqueda, codigo, herramientas, ficheros y APIs estructuradas. La cuantizacion la publica el usuario godenheim y aplica 6 bits por peso en el cuerpo del modelo, 16 bits en la cabeza de salida y 8 bits en una cabeza de Multi-Token Prediction (MTP) que habilita decodificacion especulativa con 3 tokens de borrador recursivos.

El modelo conserva la arquitectura hibrida del original: 40 capas organizadas en 10 bloques de (3 x Gated DeltaNet + 1 x Gated Attention), cada una seguida de una capa MoE con 256 expertos enrutados mas 1 compartido y top-8. Declara 35.000 millones de parametros totales con unos 3000 millones activos por token y una ventana de contexto nativa de 262.144 tokens, extensible a mas de 1M mediante YaRN. Incluye ademas el codificador de vision de Qwen3-VL.

Su relevancia practica es doble. Por un lado, reduce un modelo de 35B a unos 27 GB de pesos, lo que lo acerca al rango de GPU unica de 48 GB e incluso de 32 GB con holgura limitada. Por otro, el autor publica metricas de calidad de cuantizacion (KLD medio 1,10x sobre el suelo de ruido, perplejidad un 0,6 % por debajo del BF16) que permiten evaluar la perdida de fidelidad sin reentrenar nada. Se distribuye con licencia Apache-2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (Qwen3_5MoeForConditionalGeneration), hibrida: Gated DeltaNet + Gated Attention con capas MoE |
| Parametros totales | 35B segun la model card del autor; el recuento de safetensors del repo indica 14.408.265.216 (ver nota) |
| Parametros activos | 3B |
| Longitud de contexto | 262.144 tokens nativos; extensible a mas de 1M mediante YaRN |
| Tipos de cuantizacion | EXL3: 6,00 bpw en el cuerpo (receta optimizada por capa), 16 bpw en la cabeza (BF16), 8 bpw en la cabeza MTP |
| Idiomas soportados | No disponible de forma oficial; los datos de calibracion cubren EN, ZH, JA, KO, FR, DE, ES, RU, AR, HI |
| Licencia | Apache-2.0 (heredada del modelo base, segun la model card); el metadato de licencia del repo aparece como no disponible |
| Formato de pesos | Safetensors EXL3 (4 shards) + config.json, quantization_config.json, MTP_ASSEMBLY.json, chat_template.jinja, preprocessor_config.json |
| Capas | 40 (10 x (3 x Gated DeltaNet -> MoE + 1 x Gated Attention -> MoE)) |
| Expertos | 256 enrutados + 1 compartido, top-8 |
| Vision | Codificador Qwen3-VL a 6 bpw |
| Cuantizador | exllamav3 1.4.0, codebook mul1, output scales always |
| Calibracion | 10,2M tokens, 10 epocas, 157 conversaciones |
| MTP | 1 capa, 8 bpw, 3 tokens de borrador recursivos |
| Tamano del repo | 28,9 GB (~27 GB de pesos, 4 shards) |
| Fecha de publicacion | 2026-10-07 |

Nota sobre el recuento de parametros: la model card declara 35B totales y 3B activos, coherente con un repositorio de 4 shards y ~27 GB a 6 bpw. El recuento de safetensors reportado por HuggingFace (14.408.265.216) es inferior y probablemente refleja el empaquetado de tensores cuantizados de EXL3, no el numero real de parametros logicos del modelo. No se dispone de confirmacion oficial del autor sobre esta discrepancia.

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE hibrido. Cada uno de los 10 bloques encadena tres subcapas de Gated DeltaNet (atencion lineal con estado recurrente) y una subcapa de Gated Attention (atencion completa), y cada subcapa va seguida de una capa MoE con 256 expertos enrutados mas un experto compartido, activando los 8 mejores por token. Esta combinacion reduce el coste del cache KV, ya que solo una de cada cuatro subcapas de atencion es de atencion completa. El modelo parte del checkpoint post-entrenado Qwen3.6-35B-A3B, que a su vez procede de la familia Qwen3.5.

No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base en la informacion proporcionada: el GitHub de Accio-Lab indica que Occamy-1.0 concentra entrenamiento adicional en ejecucion fiable, seguimiento de estado persistente, recuperacion y continuidad de tareas. El proyecto Occamy describe un mecanismo de "Data RSI" que compone tareas ejecutables a partir de personas, herramientas, fixtures, habilidades, restricciones y evaluadores, y las refina iterativamente hasta que son resolubles y puntuables. No se especifican el numero de tokens de entrenamiento ni si hubo RLHF o DPO.

La innovacion tecnica mas destacable de esta publicacion concreta es la cuantizacion: EXL3 a 6 bpw con escalas de salida por capa, cabeza en 16 bpw para evitar ruido en los logits y bucles de generacion, y una cabeza MTP inline de 1 capa a 8 bpw que permite decodificacion especulativa con 3 tokens de borrador. La calibracion se hizo con 157 conversaciones auto-muestreadas que cubren razonamiento, codigo, multilingue, uso de herramientas y contexto largo de hasta 256K tokens.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre contexto largo, con ventana nativa de 262.144 tokens.
- Ejecucion de tareas agenticas de horizonte largo con seguimiento de estado persistente, recuperacion de errores y continuidad hasta completar el flujo.
- Tool calling y function calling orientados a APIs estructuradas, ficheros y software de productividad.
- Busqueda web y uso coordinado de herramientas externas dentro de un mismo flujo de trabajo.
- Capacidades de codigo, matematicas y logica, segun la composicion de los datos de calibracion (razonamiento matematico, logico y de programacion).
- Vision: incluye el codificador Qwen3-VL, por lo que procesa imagenes ademas de texto.
- Multilingue en la practica: los datos de calibracion cubren ingles, chino, japones, coreano, frances, aleman, espanol, ruso, arabe e hindi. El soporte oficial de idiomas no esta declarado.
- Decodificacion especulativa integrada mediante la cabeza MTP, sin necesidad de un modelo borrador externo.
- Extensibilidad de contexto a mas de 1M de tokens mediante YaRN.

## Casos de uso

- Agentes de co-work de larga duracion: el modelo esta especializado en tareas con estado persistente, de modo que puede mantener el hilo de un flujo de trabajo de horas o dias, recuperarse de fallos intermedios y continuar donde lo dejo, aprovechando los 262.144 tokens de contexto para arrastrar el historial completo.
- Automatizacion de productividad de oficina: generacion y edicion de documentos, hojas de calculo y presentaciones mediante APIs estructuradas, con encadenamiento de llamadas a herramientas y verificacion posterior del resultado.
- Asistente de atencion al cliente multi-turno: conversaciones largas con contexto acumulado del cliente, consulta a sistemas internos por function calling y escalado a humano cuando el flujo no converge. Los 3B de parametros activos mantienen el coste por token bajo en despliegues con muchas peticiones concurrentes.
- Pipelines de ingenieria de software: generacion de codigo, lectura de repositorios, ejecucion en sandbox y correccion iterativa de errores; el soporte de tool calling permite integrarlo en CI/CD para tareas de triaje, revision o reparacion automatizada de tests.
- Procesamiento de documentos largos con vision: ingestion de PDFs escaneados o capturas junto con su texto asociado, gracias al codificador Qwen3-VL y a la ventana de 256K, para extraccion de datos estructurados o resumenes de expedientes.
- Investigacion y analisis con busqueda aumentada: flujos de multi-step reasoning que alternan busqueda web, lectura de fuentes y sintesis con citas, utiles en analisis competitivo o revision bibliografica.
- Orquestacion de tareas sobre software de terceros: uso de interfaces estructuradas para operar herramientas de gestion, CRM o suites ofimaticas sin intervencion manual, con reintentos y trazabilidad.
- Despliegue on-premise sensible a coste: al ocupar unos 27 GB en EXL3 y activar solo 3B por token, es viable en una GPU profesional de 48 GB y ofrece una alternativa local a APIs comerciales para datos que no pueden salir de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo incluye metricas de calidad de la cuantizacion respecto al BF16 original, medidas con la herramienta qbench:

| Metrica | Valor | Objetivo | Estado |
|---|---|---|---|
| KLD media / suelo de ruido | 1,10x | <= 1,25x | Cumple |
| KLD mediana | 0,000127 | <= 0,0002 | Cumple |
| Perplejidad (vs BF16) | -0,6 % | dentro del 1 % | Cumple |
| Salidas NaN/Inf | 0 | 0 | Cumple |

El paper asociado al modelo base (arXiv 2609.11977) afirma un rendimiento fuerte en tareas multi-paso complejas con coste reducido, pero no se han facilitado cifras concretas en la informacion disponible. Tampoco hay datos medidos de latencia o throughput para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 27 GB (28,9 GB de repositorio, 4 shards). Hay que sumar cache KV, cabecera MTP, codificador de vision y buffers de runtime. Una estimacion prudente es de 30 a 34 GB para contexto moderado y de 40 GB o mas para contextos muy largos. No hay mediciones oficiales publicadas.
- El cache KV es comparativamente contenido porque solo 10 de las 40 subcapas usan atencion completa; las 30 restantes son Gated DeltaNet con estado recurrente de tamano fijo. Esto favorece el contexto largo, aunque no se dispone de cifras exactas de memoria por token.
- GPU recomendadas: A100 40 GB y 80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. Con 80 GB se puede trabajar con contextos amplios y mayor concurrencia.
- Consumer GPU: cabe en RTX 5090 (32 GB) con margen ajustado y contexto limitado, y en RTX 4090 (24 GB) no cabe sin descarga parcial a RAM, lo que degrada fuertemente la latencia. En ese caso conviene reducir contexto o buscar cuantizaciones de menor bitrate.
- Opciones de despliegue: el formato EXL3 requiere exllamav3 1.4.0, habitualmente servido con TabbyAPI. La model card incluye tambien comandos para SGLang (algoritmo especulativo NEXTN) y vLLM (metodo qwen3_next_mtp) y un ejemplo de carga con transformers.
- Configuracion de decodificacion especulativa indicada por el autor: 3 tokens de borrador en TabbyAPI (draft_num_tokens: 3), 3 pasos especulativos en SGLang con eagle-topk 1 y 4 tokens de borrador, o num_speculative_tokens: 3 en vLLM.
- Latencia y throughput: no disponible. La cabeza MTP esta pensada para reducir la latencia en decodificacion limitada por ancho de banda de memoria, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| godenheim/occamy-1.0-6bpw-h16 (este) | 35B totales / 3B activos (segun model card) | 262.144 nativos, 1M+ con YaRN | EXL3 6 bpw cuerpo, 16 bpw cabeza, MTP 8 bpw | Apache-2.0 (heredada) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Accio-Lab/occamy-1.0 (base) | 35B totales / 3B activos | 262.144 nativos | BF16 sin cuantizar | Apache-2.0 | HuggingFace |
| Qwen3.6-35B-A3B (checkpoint post-entrenado de partida) | 35B totales / 3B activos | No disponible en la informacion proporcionada | No aplica | No disponible en la informacion proporcionada | Referenciado como origen del post-entrenamiento |

La comparacion relevante es entre la cuantizacion EXL3 y el modelo base en BF16: la primera reduce el peso de unos 70 GB a unos 27 GB con una degradacion declarada de perplejidad del -0,6 % y una KLD media de 1,10x sobre el suelo de ruido. No se dispone de datos de rendimiento de tareas para ninguno de los tres, por lo que no es posible comparar capacidades. Tampoco se han identificado en la informacion proporcionada otras cuantizaciones del mismo modelo con las que contrastar bitrates alternativos.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos. Al derivar de Qwen3.6-35B-A3B, hereda los sesgos del modelo base y de sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de fidelidad factua ni datos de benchmarks de capacidades publicados para esta version cuantizada.
- La cabeza de salida se mantiene a 16 bpw precisamente porque el autor observo ruido en los logits y bucles de generacion con bitrates menores en esa parte. Es una senal de que la cuantizacion agresiva del resto del modelo tiene un limite conocido.
- La degradacion de la cuantizacion existe, aunque sea pequena: KLD media de 1,10x respecto al suelo de ruido y perplejidad un 0,6 % por debajo del BF16. Para tareas de razonamiento muy sensible, conviene validar contra el modelo base.
- Soporte de idiomas no declarado oficialmente; la evidencia disponible es solo la composicion de los datos de calibracion (10 idiomas), que no equivale a una garantia de calidad por idioma.
- El metadato de licencia del repositorio aparece como "no disponible". La model card afirma Apache-2.0 heredada del modelo base, pero conviene verificar la licencia del modelo original antes de un uso comercial.
- El repositorio tenia 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad ni informes de problemas en produccion.
- El formato EXL3 limita el ecosistema de despliegue: el soporte nativo esta en exllamav3 y TabbyAPI, y las rutas via vLLM o SGLang dependen de que esas versiones mantengan compatibilidad con EXL3 y con el metodo especulativo qwen3_next_mtp.
- La discrepancia entre los 35B declarados en la model card y los 14.408.265.216 parametros del recuento de safetensors no esta explicada por el autor y debe tenerse en cuenta al planificar memoria.
- Despliegue en GPU de 24 GB no es viable con esta cuantizacion sin offload a RAM, lo que rompe los objetivos de latencia.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/godenheim/occamy-1.0-6bpw-h16
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Repositorio GitHub del proyecto: https://github.com/Accio-Lab/occamy/tree/main
- Pagina del proyecto Occamy-1.0: https://accio-lab.github.io/occamy/
- Paper en HuggingFace: https://huggingface.co/papers/2609.11977
- Pagina del proyecto de datos Occamy: https://occamy-ai.github.io/
