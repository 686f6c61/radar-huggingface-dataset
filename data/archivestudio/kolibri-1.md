# ArchiveStudio/Kolibri-1

# Ficha de modelo: ArchiveStudio Kolibri-1

## Resumen
ArchiveStudio/Kolibri-1 es una redistribucion en precision FP8 del modelo Kolibri-1 de Aleph Alpha Research GmbH, un transformer de tipo mezcla de expertos (MoE) con 78.103.074.560 parametros totales y 3.457.573.120 parametros activos por token (aproximadamente el 4,4 % del total). El modelo esta disenado especificamente para aleman e ingles, incorpora un modo de razonamiento explicito y soporte de tool calling, y esta optimizado tanto para contexto largo como para eficiencia de inferencia. Su relevancia actual radica en que ofrece capacidad de un modelo de 78B con un coste de computo por token propio de un modelo de ~3,5B, algo poco habitual en modelos abiertos con foco nativo en aleman.

El repositorio concreto analizado no es el modelo original en bfloat16, sino una conversion a float8_e4m3fn con pesos en bloques de 128x128 y activaciones cuantizadas dinamicamente, evaluada con cache KV tambien en FP8. Las embeddings, la LM head, las normalizaciones y el router MoE se mantienen en bfloat16. El resultado ocupa aproximadamente 78,9 GB en disco, lo que reduce a la mitad el requisito de memoria respecto a los pesos BF16 y permite servir el modelo en una unica GPU H200, B200 o B300, o en configuraciones de 2x A100 80 GB / 2x H100 SXM5.

La longitud de contexto nativa es de 262.144 tokens, aunque el autor ha validado calidad y eficiencia de servicio hasta 1.048.576 tokens y recomienda no superar los 262.144 tokens en despliegues sensibles a latencia o en tareas complejas. La licencia es Apache 2.0, lo que facilita su integracion comercial, y la fecha de publicacion declarada es el 3 de octubre de 2026, con un corte de conocimiento en junio de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 50 capas con atencion hibrida 4:1 SWA:GQA (sliding-window attention y grouped-query attention), 384 expertos por capa (1 compartido + 6 enrutados) |
| Parametros totales | 78.103.074.560 (78B) |
| Parametros activos | 3.457.573.120 (3,46B) por token |
| Longitud de contexto | 1.048.576 tokens validados; 262.144 tokens nativos y recomendados para servicio |
| Tipos de cuantizacion | FP8 float8_e4m3fn con pesos en bloques de 128x128 y activaciones cuantizadas dinamicamente; cache KV en FP8; embeddings, LM head, normalizaciones y router MoE en bfloat16. No se documentan otros formatos (GGUF, AWQ, GPTQ) en la informacion disponible |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria declarada: vllm) |

Datos adicionales de interes: corte de conocimiento en ingles y aleman el 18 de junio de 2026; fecha de publicacion declarada el 3 de octubre de 2026; tamano del repositorio 78,9 GB; consumo energetico estimado del entrenamiento 9,5x10^2 MWh; Aleph Alpha es firmante del Codigo de Practicas de IA de Proposito General de la UE.

## Arquitectura y entrenamiento
Kolibri-1 es un transformer MoE de 50 capas con una relacion 4:1 entre capas de sliding-window attention (SWA) y capas de grouped-query attention (GQA). Cada capa contiene 384 expertos, de los cuales uno es compartido y seis se enrutan por token, lo que explica la diferencia entre los 78B de parametros totales y los 3,46B activos. El entrenamiento utilizo Muon como optimizador y Exact Quantile Balancing como estrategia de equilibrio de carga entre expertos. Como el positional encoding se aplica unicamente en las capas de ventana deslizante, el contexto puede extenderse mas alla de la longitud nativa sin necesidad de escalado posicional, algo que el autor declara validado hasta 1.048.576 tokens.

El preentrenamiento consumio 20 billones (20T) de tokens de un corpus bilingue filtrado compuesto aproximadamente por un 62,5 % de ingles, un 23,9 % de aleman y un 13,6 % de codigo, combinando datos web curados, reformulaciones y traducciones sinteticas y fuentes de alta calidad. El modelo se preentreno con secuencias de 16.384 tokens; despues se realizo una fase de mid-training con 3,44T tokens adicionales sobre secuencias de 65.536 tokens, y una fase final de extension de contexto con 201.000 millones de tokens sobre 262.144 tokens. El postentrenamiento combino SFT con datos bilingues filtrados (conjuntos abiertos y datos generados sinteticamente) y RL sobre un conjunto amplio de entornos que cubren razonamiento, uso de herramientas y seguimiento de instrucciones.

En cuanto a recursos, el preentrenamiento empleo 768 GPU NVIDIA B200 (96 nodos HGX 8xB200) con paralelismo EP8 / FSDP16 / DP6 durante 21 dias (511 horas, 392.000 GPU-hora). El mid-training anadio 5 dias y 90.000 GPU-hora, y la fase de contexto largo 13 horas y 10.000 GPU-hora con FSDP128 / DP6. El computo total declarado es de 6,4x10^23 FLOPs. El autor destaca tambien el desarrollo de un tokenizador adaptado a la estructura morfologica del aleman para procesar ese idioma de forma eficiente sin penalizar el ingles.

## Capacidades
- Generacion de texto bilingue aleman-ingles con calidad nativa en ambos idiomas.
- Modo de razonamiento explicito, activable, orientado a tareas de razonamiento multi-paso.
- Tool calling y function calling, integrable en capas de orquestacion que invocan APIs, ejecutan codigo o lanzan busquedas.
- Flujos agenticos con razonamiento multi-paso y validacion posterior de resultados por parte del sistema llamante.
- Generacion y asistencia de codigo (el corpus de entrenamiento incluye aproximadamente un 13,6 % de codigo).
- Extraccion estructurada de informacion a partir de texto.
- Recuperacion aumentada (RAG) sobre documentacion propia de una organizacion.
- Procesamiento de documentos largos gracias a la ventana de contexto extendida.
- Capacidades matematicas no detalladas de forma especifica en la informacion disponible.
- Capacidades de vision y audio no disponibles.
- Capacidades multilingues limitadas a aleman e ingles; no se documentan otros idiomas.

## Casos de uso
- Atencion al cliente automatizada bilingue: el modelo puede gestionar conversaciones multi-turno en aleman e ingles con contexto muy amplio (hasta 262.144 tokens recomendados), manteniendo el historial completo de la interaccion sin necesidad de resumir ni truncar. Su naturaleza MoE mantiene bajo el coste por token pese al tamano del modelo.
- Generacion de codigo en produccion: soporta tool calling, por lo que puede integrarse en pipelines de CI/CD o en asistentes de IDE que consulten repositorios, ejecuten tests o llamen a APIs, con un coste de inferencia contenido gracias a los 3,46B parametros activos.
- RAG sobre documentacion corporativa: la ventana nativa de 262.144 tokens permite insertar grandes volumenes de documentacion recuperada sin troceado agresivo, y la salida estructurada facilita el parseo automatico de respuestas y citas.
- Procesamiento y analisis de documentos largos: contratos, informes tecnicos, expedientes administrativos o documentacion regulatoria alemana, con extraccion de campos estructurados y resumen.
- Asistentes internos de conocimiento y busqueda empresarial: integracion en herramientas internas que responden preguntas sobre material propio de la organizacion, con el modelo situado en el lado consultivo y un humano revisando la salida.
- Soporte a la decision con componente humano: el modelo genera evidencia, opciones y borradores que una persona pondera antes de actuar; el autor lo posiciona explicitamente como componente asesor y no como decisor autonomo.
- Orquestacion de agentes con llamadas a herramientas: capa de coordinacion que invoca APIs, ejecuta codigo o lanza busquedas en flujos multi-paso, siempre que el sistema llamante valide los resultados.
- Redaccion y borradores profesionales en aleman: gracias al tokenizador adaptado a la morfologia alemana, la generacion y edicion de textos largos en ese idioma resulta mas eficiente en tokens que con tokenizadores genericos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio y los metadatos consultados no incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones numericas con modelos de referencia. El autor remite al informe tecnico (tech report) para mas detalles, pero no se han proporcionado sus resultados en la informacion disponible.

## Requisitos de hardware
- Huella de memoria del modelo: aproximadamente 78 GB con pesos FP8 (repositorio de 78,9 GB). En BF16 serian aproximadamente 156 GB.
- Configuracion minima declarada: 2x A100 80 GB, 2x H100 SXM5, 1x H200, 1x B200 o 1x B300.
- Configuracion recomendada: 2x H100 SXM5, 2x H200, 1x B200 o 1x B300.
- GPU de consumo: no cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo habituales; los 78 GB de pesos FP8 exigen memoria de clase centro de datos.
- Opciones de despliegue: la libreria declarada es vLLM, que soporta FP8 con escalado por bloques; tambien seria desplegable con otros motores de inferencia que soporten FP8 y MoE. No se documenta soporte para llama.cpp, Ollama o GGUF en la informacion disponible.
- Latencia y throughput: no disponibles. El autor indica que recomienda contextos de hasta 262.144 tokens en despliegues sensibles a latencia o throughput, pero no publica cifras concretas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArchiveStudio/Kolibri-1 (FP8) | 78,10B | 3,46B | 262.144 nativos / 1.048.576 validados | Apache 2.0 | HuggingFace, pesos safetensors FP8 |
| Aleph-Alpha/Kolibri-1-BF16 (base) | 78,10B | 3,46B | 262.144 nativos / 1.048.576 validados | Apache 2.0 | HuggingFace, pesos bfloat16 |
| Mixtral 8x7B (referencia MoE abierta) | 46,7B | 12,9B | 32.768 | Apache 2.0 | HuggingFace, multiples formatos |
| Otros modelos MoE abiertos de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con Mixtral 8x7B se incluye como referencia de la categoria MoE abierta, pero conviene notar que las cifras de rendimiento de ambos modelos no son directamente comparables sin benchmarks publicados. Respecto al modelo base en BF16, la version FP8 de ArchiveStudio reduce a la mitad la huella de memoria a costa de una posible perdida de precision numerica no cuantificada en la informacion disponible. No se dispone de datos de benchmarks para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias
- Cobertura linguistica restringida: solo aleman e ingles. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera muy inferior.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion incorrecta; el autor enfatiza que debe integrarse en sistemas con revision humana y no como componente decisor autonomo.
- Corte de conocimiento en junio de 2026 para ambos idiomas; la informacion posterior solo puede obtenerse mediante uso de herramientas.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Esta ficha describe una redistribucion FP8 realizada por un tercero (ArchiveStudio) a partir de Aleph-Alpha/Kolibri-1-BF16, no el modelo original de Aleph Alpha; conviene verificar la fidelidad de la cuantizacion antes de usarla en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del repositorio redistribuido.
- Requisitos de memoria elevados pese al bajo numero de parametros activos: el modelo completo debe residir en memoria, lo que impide su despliegue en hardware de consumo.
- El autor recomienda limitar el contexto a 262.144 tokens en produccion; usar la ventana maxima de 1.048.576 tokens puede degradar latencia y eficiencia.
- No se documentan capacidades de vision, audio ni multimodalidad.
- No se han publicado benchmarks que permitan validar de forma independiente el rendimiento declarado.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/ArchiveStudio/Kolibri-1
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Informe tecnico (PDF): https://aleph-alpha.com/downloads/tech-report.pdf
- Blog tecnico del fabricante: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/
- Codigo de Practicas de IA de Proposito General de la UE: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
- Referencia arXiv: arxiv:2512.11614 (no se dispone del titulo ni del enlace completo)
- Referencia arXiv: arxiv:2601.17858 (no se dispone del titulo ni del enlace completo)
