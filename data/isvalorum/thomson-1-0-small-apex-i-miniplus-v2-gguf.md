# IsValorum/Thomson-1.0-Small-APEX-I-MiniPlus-V2-GGUF

## Resumen

Thomson-1.0-Small-APEX-I-MiniPlus-V2-GGUF es una cuantizacion GGUF del modelo Thomson-1.0-Small, desarrollado originalmente por Thomson Reuters y cuantizado de forma independiente por IsValorum. Se trata de un modelo multimodal de tipo image-text-to-text con arquitectura MoE (mezcla de expertos), orientado a tareas de analisis documental, ambito legal y auditoria. El repositorio incluye pesos en formato GGUF optimizados para inferencia con llama.cpp, con un proyector visual multimodal incluido.

El modelo base cuenta con 34.660.610.688 parametros totales (aproximadamente 34,7 mil millones) y esta disenado para procesar contextos muy largos, con soporte declarado de hasta 256K tokens. La cuantizacion APEX-I-MiniPlus aplica una receta personalizada tensor por tensor que preserva las compuertas de enrutamiento en F32, protege la cabeza de salida en Q6_K y mantiene las compuertas de atencion en Q8_0, diferenciandose de las cuantizaciones genericas de la comunidad.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de ~34,7B con capacidades multimodales y contexto extendido en hardware de consumo, incluyendo inferencia total o parcial en RAM del sistema. El repositorio ocupa 15,3 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), basada en qwen35moe; transformer con enrutamiento por expertos |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (segun la model card) |
| Tipos de cuantizacion | GGUF con receta APEX-I-MiniPlus custom (IQ3_S, IQ4_NL, Q3_K, Q5_K, Q6_K, Q8_0, F32 en compuertas de enrutamiento) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); incluye proyector multimodal mmproj en Q8_0 |

## Arquitectura y entrenamiento

El modelo base Thomson-1.0-Small emplea una arquitectura MoE (mezcla de expertos) identificada en los tags como qwen35moe, con un total de aproximadamente 34,7 mil millones de parametros. La cuantizacion preserva las compuertas de enrutamiento en F32 sin comprimir, lo cual es critico en modelos MoE porque el enrutamiento determina que expertos se activan en cada token. La cabeza de salida de tokens se mantiene en Q6_K y las compuertas de atencion en Q8_0, mientras que los expertos compartidos de la fundacion se elevan a Q5_K en las 40 capas en la edicion V2.1.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card menciona que el modelo esta orientado a razonamiento profundo y tareas legales/financieras, y que la cuantizacion fue validada con una perplejidad de 5,3338 ± 0,1254 en WikiText-2 para la edicion V2.1 (delta de aproximadamente +0,05 respecto a la linea base sin cuantizar, ~5,28). Esta edicion V2 del repositorio mantiene una proteccion teorica adicional en capas de borde (10 capas en IQ3_S, expertos compartidos IQ4_NL y compuertas de atencion Q8_0), aunque la propia model card indica que en inferencia practica la diferencia de calidad respecto a V2.1 es practicamente imperceptible.

## Capacidades

- Generacion de texto y razonamiento profundo en dominios legales, financieros y de auditoria.
- Procesamiento multimodal image-text-to-text: analisis de imagenes, OCR y parseo de tablas mediante el proyector visual mmproj en Q8_0.
- Soporte de contexto largo de hasta 256K tokens, adecuado para documentos legales y financieros extensos.
- Capacidades multilingues en 13 idiomas: ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Inferencia conversacional multi-turno.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Disenado para auditoria y revision documental automatizada.
- No se especifica en la informacion disponible soporte explicito de tool calling, function calling ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Revision de contratos y documentos legales: el modelo puede procesar contratos de decenas o cientos de paginas en una sola pasada gracias a su ventana de 256K tokens, identificando clausulas criticas y discrepancias entre secciones sin necesidad de fragmentar el documento.
- Auditoria documental automatizada: con capacidades multimodales, puede extraer datos de facturas, balances y estados financieros escaneados (OCR y parseo de tablas) y contrastarlos con registros estructurados, reduciendo la revision manual en procesos de compliance.
- Analisis de expedientes financieros multi-idioma: al soportar 13 idiomas, permite revisar informes de filiales internacionales en su idioma original y consolidar hallazgos en un unico flujo, util para equipos de auditoria global.
- Asistente de investigacion juridica: integrado en un pipeline RAG con llama.cpp, puede responder consultas sobre jurisprudencia y normativa manteniendo contexto de conversacion largo, adecuado para despachos con grandes volumenes de documentacion.
- Despliegue en estaciones de trabajo sin GPU dedicada: la edicion V2.1 esta optimizada para streaming en RAM del sistema (DDR4/DDR5) con velocidades de 24 a 28+ tok/s, lo que permite ejecutar el modelo en portatiles o servidores sin VRAM suficiente para los 15,3 GB de pesos.
- Procesamiento de documentacion escaneada en produccion: el proyector visual Q8_0 cargado en VRAM permite OCR y extraccion de tablas con baja latencia mientras los pesos principales se transmiten desde RAM, util para digitalizacion masiva de archivos.
- Generacion de resumenes ejecutivos de informes anuales: con contexto de 256K tokens puede sintetizar informes de cientos de paginas en resumenes estructurados, manteniendo trazabilidad hacia las secciones originales.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad WikiText-2 (V2.1) | 5,3338 ± 0,1254 | Delta de ~+0,05 respecto a la linea base sin cuantizar (~5,28) |
| Perplejidad WikiText-2 (linea base) | ~5,28 | Modelo sin cuantizar |
| Throughput streaming en RAM (V2.1) | +24 a 28+ tok/s | Inferencia en RAM del sistema con offload parcial |
| Throughput estimado en RAM | 20 a 45 tok/s | Segun CPU y ancho de banda DDR4/DDR5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card menciona un benchmark independiente de la familia APEX-I-MiniPlus con referencia Occamy V2, pero no se detallan las cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 14,7 GB (edicion V2.1) o 15,3 GB (repositorio V2). Con el proyector visual mmproj en Q8_0 y overhead de contexto, se recomienda un minimo de 18-20 GB de VRAM para carga completa.
- La model card afirma que el contexto completo de 256K puede ejecutarse en VRAM en configuraciones de 24 GB ("The 24GB Miracle"), lo que incluye GPUs como RTX 3090, RTX 4090 o RTX 5090.
- Cabe en GPUs de consumo de 24 GB (RTX 3090, 4090, 5090) con contexto extendido; en GPUs de 16 GB requerira offload parcial a RAM del sistema.
- Inferencia total o parcial en RAM del sistema viable en equipos con DDR4/DDR5, con rendimiento de 20 a 45 tok/s segun ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extension cualquier frontend compatible como Ollama o LM Studio. El tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: se reportan +24 a 28+ tok/s en streaming desde RAM para la edicion V2.1, eliminando los bloqueos de dequantizacion AVX2 en CPU. No se detallan cifras de throughput en GPU en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Thomson-1.0-Small APEX-I-MiniPlus V2 (este) | ~34,7B (MoE) | 256K | Apache 2.0 | GGUF | Multimodal, cuantizacion custom con proteccion de enrutadores |
| Thomson-1.0-Small APEX-I-MiniPlus V2.1 | ~34,7B (MoE) | 256K | Apache 2.0 | GGUF | Edicion recomendada por el autor, ~14,7 GB, PPL 5,3338 |
| Cuantizaciones APEX-I-Mini genericas de la comunidad | ~34,7B (MoE) | 256K | Apache 2.0 | GGUF | Expertos en IQ2_S, cabeza de salida en Q3_K_M; segun el autor, mayor perplejidad y errores de sintaxis |
| Thomson-1.0-Small sin cuantizar | ~34,7B (MoE) | 256K | Apache 2.0 | safetensors | Linea base, PPL ~5,28 en WikiText-2 |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce una degradacion de calidad medible: delta de perplejidad de aproximadamente +0,05 respecto al modelo sin cuantizar en WikiText-2, aunque el autor la califica de despreciable.
- El modelo esta especializado en dominios legal, financiero y de auditoria; su rendimiento en otros dominios no esta documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente critico en contextos legales y de auditoria donde los errores pueden tener consecuencias regulatorias. Se recomienda validacion humana.
- La model card no documenta sesgos conocidos ni evaluaciones de seguridad o alineacion.
- No se especifica soporte explicito de tool calling ni function calling, lo que limita su uso en pipelines agente automatizados sin capas adicionales.
- El tag de idiomas de Hugging Face indica solo "en" como idioma principal, aunque los metadatos de la model card listan 13 idiomas; conviene validar el rendimiento real en espanol y otros idiomas antes de produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es de Thomson Reuters y conviene verificar las condiciones del modelo original.
- Las cifras de rendimiento (tok/s) son proyecciones del autor y dependen fuertemente del hardware, la configuracion de memoria y el backend de inferencia.
- El repositorio tiene un numero bajo de descargas (331) y cero likes en el momento de la consulta, lo que limita la validacion comunitaria de la cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Thomson-1.0-Small-APEX-I-MiniPlus-V2-GGUF
- Edicion recomendada V2.1: https://huggingface.co/IsValorum/Thomson-1.0-Small-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Apoyo al autor: https://ko-fi.com/isvalorum
