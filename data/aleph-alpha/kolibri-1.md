# Aleph-Alpha/Kolibri-1

## Resumen

Kolibri 1 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Aleph Alpha Research GmbH, con foco explícito en aleman e ingles. Con 78.103.074.560 parametros totales y solo 3.457.573.120 parametros activos por token, el modelo busca ofrecer capacidad de un modelo grande con un coste computacional por token propio de uno mucho mas pequeno. Se distribuye bajo licencia Apache 2.0 y esta pensado para razonamiento multi-paso, generacion aumentada por recuperacion, llamada de herramientas en flujos agenticos y codigo.

La arquitectura es un transformer MoE de 50 capas con atencion 4:1 SWA:GQA (sliding-window attention combinada con grouped-query attention), 384 expertos por capa, 1 compartido y 6 enrutados. El contexto nativo es de 262.144 tokens, aunque el autor ha validado calidad y eficiencia de servicio hasta 1.048.576 tokens sin escalado posicional, gracias a que la codificacion posicional solo se aplica en las capas de ventana deslizante. El modelo incorpora un modo de razonamiento explicito y soporte de tool calling.

Es relevante ahora porque combina un contexto extremadamente largo con un coste de inferencia por token reducido y una licencia permisiva, algo poco habitual en modelos con foco en aleman. Aleph Alpha es firmante del Codigo de Practica GPAI de la UE, lo que anade un marco de gobernanza relevante para despliegues en Europa. El modelo fue publicado el 3 de octubre de 2026 y su model card reporta 10.744 descargas y 1.014 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 50 capas, atencion 4:1 SWA:GQA, 384 expertos por capa (1 compartido, 6 enrutados) |
| Parametros totales | 78.103.074.560 |
| Parametros activos | 3.457.573.120 por token |
| Longitud de contexto | 1.048.576 tokens validados; nativo 262.144; recomendado <=262.144 para eficiencia y tareas complejas |
| Tipos de cuantizacion | FP8 (`float8_e4m3fn`) en bloques 128x128 con activaciones cuantizadas dinamicamente y cache KV FP8; embeddings, LM head, normas y router MoE en `bfloat16` |
| Idiomas soportados | Aleman e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 78,9 GB; variante FP8 y modelo base `Aleph-Alpha/Kolibri-1-BF16`) |

## Arquitectura y entrenamiento

Kolibri 1 es un transformer MoE de 50 capas que combina atencion de ventana deslizante y grouped-query attention en una proporcion 4:1. Cada capa contiene 384 expertos, de los cuales 1 es compartido y 6 se enrutan por token, lo que da lugar a 3,46B parametros activos sobre un total de 78B. El entrenamiento uso Muon y Exact Quantile Balancing. La codificacion posicional se aplica unicamente en las capas de ventana deslizante, lo que permite extender el contexto mas alla de la longitud nativa sin escalado posicional. El tokenizador esta disenado especificamente para la estructura morfologica del aleman, sin penalizar el ingles.

El preentrenamiento uso 20T tokens de un corpus bilingue filtrado (aproximadamente 62,5% ingles, 23,9% aleman y 13,6% codigo), combinando web curada, reescrituras y traducciones sinteticas y fuentes de alta calidad. A esto se suman 3,44T tokens de mid-training y 201B tokens en una fase final de extension de contexto. Las secuencias pasaron de 16.384 tokens en preentrenamiento a 65.536 en mid-training y 262.144 en la fase de contexto largo. El post-entrenamiento incluyo un mix de SFT con datos abiertos y sinteticos, seguido de RL sobre entornos que cubren razonamiento, uso agentico y seguimiento de instrucciones. El corte de conocimiento es el 18 de junio de 2026 para ambos idiomas. El computo de preentrenamiento se realizo sobre 768 NVIDIA B200 (96 nodos HGX 8xB200) con paralelismo EP8 FSDP16 DP6 durante 21 dias (392k GPUh), con 6,4e23 FLOPs; mid-training anadio 5 dias y 90k GPUh, y la fase de contexto largo 13 horas y 10k GPUh.

## Capacidades

- Generacion de texto conversacional en aleman e ingles.
- Modo de razonamiento explicito (reasoning mode) activable.
- Razonamiento multi-paso y descomposicion de problemas complejos.
- Generacion y comprension de codigo, con soporte para tareas de programacion.
- Tool calling y function calling para integracion con APIs y orquestadores.
- Flujos agenticos con multiples pasos y validacion externa de resultados.
- Procesamiento de documentos largos y RAG sobre contextos de hasta 1.048.576 tokens.
- Extraccion estructurada de informacion.
- Capacidades matematicas y de resolucion de problemas cuantitativos.
- Soporte bilingue de alta calidad (aleman e ingles), con tokenizador optimizado para aleman.

## Casos de uso

- Asistentes conversacionales en aleman para atencion al cliente: el modelo mantiene conversaciones multi-turno con contexto largo (hasta 262.144 tokens recomendados) y puede consultar historiales completos o documentacion de producto sin truncar.
- Generacion de codigo en produccion: con tool calling y modo de razonamiento, puede integrarse en pipelines de CI/CD para generar parches, explicar errores o proponer tests, con validacion posterior por el sistema orquestador.
- RAG sobre corpus documentales extensos: la ventana de hasta 1.048.576 tokens permite ingerir contratos, expedientes o manuales tecnicos completos y responder preguntas con evidencia localizada.
- Procesamiento de documentos juridicos y administrativos en aleman: extraccion estructurada de clausulas, entidades y obligaciones a partir de expedientes largos, aprovechando el tokenizador adaptado al aleman.
- Herramientas internas de conocimiento y research: asistentes que combinan busqueda, ejecucion de codigo y sintesis sobre material propio de la organizacion, con el humano revisando la salida.
- Soporte a la decision (decision support): el modelo surfacea evidencia y redacta opciones para que un humano decida, en linea con el uso previsto por el autor (no como componente decisor autonomo).
- Orquestacion agentica de APIs: capa de planificacion que llama a servicios externos, ejecuta busquedas y valida resultados antes de actuar, con contextos largos para mantener estado de la tarea.
- Traduccion y adaptacion de contenido entre aleman e ingles con control de terminologia en dominios tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la etiqueta `eval-results` y remite al tech report para detalles, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni comparativas numericas en el material facilitado.

## Requisitos de hardware

- Huella de memoria del modelo: aproximadamente 78 GB con pesos FP8.
- Minimo indicado por el autor: 2x A100 80 GB, 2x H100 SXM5, 1x H200, 1x B200 o 1x B300.
- Configuracion recomendada: 2x H100 SXM5, 2x H200, 1x B200 o 1x B300.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 48 GB con FP8; requiere al menos 80 GB y, en la practica, dos aceleradores de 80 GB para el minimo declarado.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles (`endpoints_compatible`); el autor no detalla soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles de forma numerica; el diseno MoE con 3,46B parametros activos busca reducir el coste por token, y el autor recomienda contextos <=262.144 tokens para despliegues sensibles a latencia o throughput.
- Computo de entrenamiento como referencia de escala: 392k GPUh en preentrenamiento sobre 768 B200.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Kolibri 1 (Aleph Alpha) | 78B / 3,46B | 1.048.576 validados; nativo 262.144 | Apache 2.0 | Aleman, ingles | MoE con modo de razonamiento y tool calling; FP8 nativo |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de parametros, contexto o rendimiento; la model card no incluye tabla comparativa con otros modelos.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos en la informacion disponible; al entrenarse sobre web filtrada y datos sinteticos, es esperable que herede sesgos de esas fuentes.
- Alucinacion: no se cuantifica el riesgo; el autor recomienda revision humana de las salidas antes de actuar sobre ellas y no lo considera apto para operacion autonoma sin supervision.
- Idiomas: solo aleman e ingles; no se garantiza calidad en otros idiomas.
- Contexto: aunque se validan hasta 1.048.576 tokens, el autor recomienda no superar 262.144 para eficiencia y tareas complejas; el rendimiento puede degradarse en contextos muy largos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor publica una seccion de Responsible Use y espera integracion en sistemas con revision humana.
- Uso previsto restringido: no esta pensado como componente decisor autonomo ni para operacion no supervisada; debe integrarse en sistemas con validacion de resultados, especialmente en tool calling.
- Corte de conocimiento: 18 de junio de 2026; la informacion posterior solo es accesible via herramientas.
- Memoria: el modelo completo debe residir en memoria aunque solo se active una fraccion por token, lo que encarece el despliegue frente a modelos densos del mismo tamano activo.
- Gobernanza: Aleph Alpha es firmante del Codigo de Practica GPAI de la UE, lo que puede implicar obligaciones adicionales de documentacion y evaluacion para despliegues en la UE.

## Enlaces

- Hugging Face: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Modelo base BF16: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Tech report: https://aleph-alpha.com/downloads/tech-report.pdf
- Tech blog: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/
- Codigo de Practica GPAI de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- arXiv 2512.11614 (referenciado en tags): no disponible como URL directa en la informacion proporcionada
- arXiv 2601.17858 (referenciado en tags): no disponible como URL directa en la informacion proporcionada
