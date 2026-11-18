# MDfox/OvisOCR2-GGUF-SOTA-20260823

## Resumen

OvisOCR2 es un modelo multimodal pequeno especializado en el parseo de documentos: recibe la imagen de una pagina y la convierte en Markdown estructurado, con formulas en LaTeX y tablas en HTML. Esta ficha cubre la conversion no oficial a GGUF publicada por el usuario MDfox bajo el identificador `MDfox/OvisOCR2-GGUF-SOTA-20260823`, pensada para su uso con llama.cpp. El modelo base es `ATH-MaaS/OvisOCR2`, un parser documental construido sobre Qwen3.5-0.8B, con 752.393.024 parametros totales.

La relevancia de esta publicacion esta en el trabajo de cuantizacion y evaluacion: se han generado pares de modelo de lenguaje y proyector de vision en multiples precisiones y se han evaluado de extremo a extremo sobre las 1.651 paginas completas de OmniDocBench, con el evaluador oficial quick-match. Los resultados muestran que las versiones Q8_0 y Q6_K son practicamente indistinguibles del BF16 (96,41 y 96,39 frente a 96,35 de puntuacion global), lo que permite desplegar un parser documental de alta calidad en menos de 1 GB de pesos.

El interes practico es doble: por un lado, la licencia Apache 2.0 facilita el uso comercial; por otro, el tamano reducido permite ejecutar el modelo en CPU o en GPU de consumo, con velocidades de entre 10 y 13 paginas por minuto segun la cuantizacion. El autor advierte de que se trata de una conversion no oficial y de que el modelo esta disenado especificamente para OCR y parseo de documentos, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3.5-0.8B + proyector de vision), convertido a GGUF para llama.cpp |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 98.304 tokens en la configuracion de servidor documentada; 32.768 en el ejemplo de CLI; el modelo base se describe como de contexto largo, sin cifra oficial confirmada |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q3_K_S, Q2_K, IQ3_M, IQ3_S, IQ3_XS, IQ3_XXS, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS (estas ultimas con importance matrix); proyectores en BF16 y Q8_0 |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; el modelo esta orientado a documentos, con salida en Markdown) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La ficha disponible no detalla la arquitectura interna del modelo base mas alla de su naturaleza multimodal: un modelo de lenguaje Qwen3.5-0.8B combinado con un proyector de vision (`mmproj`) que inyecta las caracteristicas de la imagen en el flujo de tokens del modelo de lenguaje. El pipeline declarado es `image-text-to-text` y la tarea objetivo es la transcripcion de paginas a Markdown con formulas LaTeX y tablas HTML. No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del corpus ni si hubo fases de RLHF o DPO.

La innovacion tecnica de esta publicacion concreta esta en el proceso de conversion y evaluacion: los pesos se convirtieron y cuantizaron con llama.cpp v0.5.0 (commit `7fe450e`), cada cuantizacion del modelo de lenguaje deriva directamente de la conversion BF16 y el proyector Q8_0 deriva directamente del BF16, sin recuantizaciones encadenadas. Se evaluaron ocho pares modelo/proyector de extremo a extremo sobre OmniDocBench. Las variantes IQ emplean una importance matrix calibrada con salidas de OmniDocBench, lo que el propio autor advierte que solapa con los datos de evaluacion. El modelo admite un modo de razonamiento (`enable_thinking`) que la configuracion recomendada desactiva explicitamente.

## Capacidades

- Conversion de imagenes de paginas a Markdown estructurado.
- Reconocimiento de formulas matematicas con salida en LaTeX.
- Reconversion de tablas a HTML.
- Parseo de documentos con maquetacion compleja (el benchmark OmniDocBench cubre paginas de diversa tipologia).
- Procesamiento de imagenes con control del numero de tokens visuales (`--image-min-tokens 196`, `--image-max-tokens 8100`).
- Modo conversacional con plantilla de chat Jinja y soporte de `chat_template_kwargs`.
- Modo de razonamiento opcional (`enable_thinking`), desactivado en la configuracion recomendada.
- Servidor compatible con la API de OpenAI mediante `llama-server`, con procesamiento en paralelo (`--parallel 3`).
- No se documentan capacidades de tool calling, agentes, audio ni vision general fuera del ambito documental.

## Casos de uso

- Digitalizacion masiva de archivos escaneados: con Q6_K y proyector Q8_0 se procesan aproximadamente 13,1 paginas por minuto en la configuracion de benchmark, manteniendo una puntuacion global de 96,39 en OmniDocBench; adecuado para pipelines de ingestion documental a gran escala.
- Extraccion de tablas financieras o cientificas: la puntuacion TEDS de 94,46 con Q6_K indica una reconstruccion fiable de la estructura de tablas en HTML, util para convertir informes en datos tabulares procesables.
- Conversion de articulos cientificos a Markdown con formulas: el CDM de 97,18 con Q6_K refleja buena fidelidad en formulas LaTeX, lo que permite migrar PDFs academicos a repositorios de documentacion o wikis internas.
- Despliegue en entornos sin GPU: con 711 MiB para el par Q6_K + Q8_0 mmproj, el modelo cabe holgadamente en memoria de sistema y puede ejecutarse en CPU mediante llama.cpp, lo que facilita su uso en servidores modestos o en el borde.
- Preprocesado para sistemas RAG: la salida en Markdown limpio sirve como paso previo a la fragmentacion e indexacion de documentos en bases vectoriales, con la ventaja de que formulas y tablas conservan estructura semantica.
- Digitalizacion de documentos capturados con movil: en Real5-OmniDocBench, la variante IQ3_XXS obtiene 93,15 en fotografia de pantalla y 89,67 en paginas inclinadas, lo que permite usar el modelo sobre capturas no ideales en aplicaciones de escaneo movil.
- Servicio interno compatible con OpenAI: `llama-server` con `--parallel 3` y contexto de 98.304 tokens permite exponer el parser como endpoint HTTP consumible por aplicaciones existentes que ya usan el formato de la API de OpenAI.

## Benchmarks y rendimiento

Resultados sobre las 1.651 paginas de OmniDocBench con el evaluador oficial end-to-end quick-match. Ninguna pagina fallo en ninguna ejecucion.

| Modelo de lenguaje | mmproj | MiB | Global | Text edit | Formula CDM | Table TEDS | Paginas/min | Limite de tokens |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | Q8_0 | 884,8 | 96,41 | 0,02453 | 97,40 | 94,27 | 12,0 | 10 |
| Q6_K | Q8_0 | 711,1 | 96,39 | 0,02451 | 97,18 | 94,46 | 13,1 | 10 |
| BF16 | BF16 | 1.644,2 | 96,35 | 0,02446 | 97,09 | 94,41 | 10,3 | 9 |
| Q4_K_M | Q8_0 | 615,3 | 95,89 | 0,02555 | 96,81 | 93,41 | 13,4 | 8 |
| Q3_K_S | Q8_0 | 525,7 | 95,65 | 0,02755 | 96,30 | 93,40 | 12,0 | 21 |
| IQ3_XXS | Q8_0 | 490,1 | 95,20 | 0,02896 | 95,97 | 92,51 | 12,1 | 16 |
| IQ2_M | Q8_0 | 471,0 | 93,11 | 0,03375 | 91,88 | 90,82 | 10,9 | 36 |
| Q2_K | Q8_0 | 513,3 | 87,30 | 0,07550 | 83,09 | 86,38 | 5,2 | 198 |

Resultados en Real5-OmniDocBench (1.355 paginas por condicion), solo con IQ3_XXS + Q8_0 mmproj:

| Condicion | Global | Text edit | Formula CDM | Table TEDS |
|---|---:|---:|---:|---:|
| Escaneo | 95,04 | 0,03958 | 97,48 | 91,60 |
| Iluminacion | 94,40 | 0,04192 | 96,43 | 90,97 |
| Fotografia de pantalla | 93,15 | 0,05800 | 94,57 | 90,69 |
| Deformacion | 91,76 | 0,06892 | 94,83 | 87,34 |
| Inclinacion | 89,67 | 0,06510 | 93,62 | 81,92 |

Notas del autor: las variantes IQ usan una importance matrix calibrada sobre salidas de OmniDocBench, por lo que sus resultados no son estrictamente held-out. El limite de tokens de 16.384 se alcanzo en algunas paginas, generalmente por repeticiones.

## Requisitos de hardware

- VRAM estimada: el par Q8_0 + Q8_0 mmproj ocupa 884,8 MiB de pesos; el par Q6_K + Q8_0 mmproj, 711,1 MiB; el par Q4_K_M + Q8_0 mmproj, 615,3 MiB. Los tamanos indicados son de fichero, no de VRAM, por lo que hay que anadir el coste de la cache KV.
- Cache KV: en la configuracion de servidor documentada se usa `--cache-type-k bf16 --cache-type-v bf16` con contexto de 98.304 tokens y `--parallel 3`; el coste de memoria de la cache a esa longitud es considerable y no se detalla en la model card.
- GPU recomendadas: no se especifican en la informacion disponible. Dado el tamano de los pesos, cualquier GPU de consumo con al menos 4-8 GB libres deberia poder alojar el par Q6_K o Q8_0 junto con la cache KV a contextos moderados.
- GPU de consumo: si, cabe en GPU de consumo; los pesos por si solos no llegan a 1 GB en las cuantizaciones recomendadas.
- CPU: viable mediante llama.cpp; el modelo esta pensado para ejecutarse tambien sin aceleracion grafica.
- Opciones de despliegue: `llama-mtmd-cli` para inferencia de una sola imagen y `llama-server` con API compatible con OpenAI. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Throughput: entre 10,3 y 13,4 paginas por minuto en la configuracion de benchmark, segun cuantizacion; Q2_K baja a 5,2 paginas por minuto por el exceso de repeticiones.
- Version de llama.cpp: los ficheros se generaron con v0.5.0. Las versiones v0.3.0 y v0.4.0 cargaron correctamente los ficheros no IQ en pruebas previas; las versiones mas recientes no estan cubiertas por los benchmarks.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos sobre el mismo evaluador y las mismas condiciones, por lo que no es posible establecer una comparativa numerica fiable con alternativas. La comparativa interna entre cuantizaciones del propio modelo es la siguiente:

| Variante | Parametros | Contexto | Global OmniDocBench | Licencia | Formato |
|---|---:|---|---:|---|---|
| OvisOCR2 Q8_0 | 752,4 M | hasta 98.304 (config. servidor) | 96,41 | Apache 2.0 | GGUF |
| OvisOCR2 Q6_K | 752,4 M | hasta 98.304 (config. servidor) | 96,39 | Apache 2.0 | GGUF |
| OvisOCR2 Q4_K_M | 752,4 M | hasta 98.304 (config. servidor) | 95,89 | Apache 2.0 | GGUF |
| OvisOCR2 Q2_K | 752,4 M | hasta 98.304 (config. servidor) | 87,30 | Apache 2.0 | GGUF |

Comparativa con modelos de la misma categoria (otros parsers documentales multimodales): no disponible.

## Limitaciones y advertencias

- Conversion no oficial: el autor declara explicitamente que esta publicacion no es oficial respecto al modelo base `ATH-MaaS/OvisOCR2`.
- Modelo especializado: esta disenado para OCR y parseo de documentos; no se documentan capacidades de proposito general, tool calling ni agentes.
- Riesgo de repeticion: en todas las cuantizaciones algunas paginas alcanzan el limite de 16.384 tokens de salida, generalmente por bucles de repeticion (10 paginas en Q6_K y Q8_0, 198 en Q2_K). Conviene monitorizar la longitud de salida en produccion.
- Degradacion por debajo de 3 bits: Q2_K pierde unos 9 puntos globales (87,30) y es el fichero mas lento (5,2 paginas/min). El autor recomienda evitarlo.
- Resultados IQ no estrictamente held-out: la importance matrix se calibro sobre salidas de OmniDocBench, por lo que las puntuaciones de las variantes IQ solapan con los datos de evaluacion.
- Rendimiento en capturas reales inferior al limpio: en Real5-OmniDocBench la puntuacion cae hasta 89,67 en paginas inclinadas y 91,76 en deformadas, con TEDS de tablas de 81,92 en el caso de inclinacion.
- Idiomas: la model card no declara lista de idiomas soportados; no hay garantia documentada de cobertura multilingue.
- Sesgos: no se documentan en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de una conversion no oficial conviene verificar los terminos del modelo base antes de un despliegue en produccion.
- Compatibilidad: los benchmarks solo cubren llama.cpp v0.5.0; versiones posteriores pueden funcionar pero no estan validadas.
- Contexto: la cifra de 98.304 tokens corresponde a la configuracion de servidor empleada en el benchmark, no a una especificacion oficial del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/MDfox/OvisOCR2-GGUF-SOTA-20260823
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR2
- README en chino: https://huggingface.co/MDfox/OvisOCR2-GGUF-SOTA-20260823/blob/main/README_zh.md
- Checksums: https://huggingface.co/MDfox/OvisOCR2-GGUF-SOTA-20260823/blob/main/checksums.sha256
- Prompt recomendado: https://huggingface.co/MDfox/OvisOCR2-GGUF-SOTA-20260823/blob/main/prompt.txt
- Release de llama.cpp v0.5.0: https://github.com/ggml-org/llama.cpp/releases/tag/v0.5.0
- Dataset Real5-OmniDocBench: https://huggingface.co/datasets/PaddlePaddle/Real5-OmniDocBench
- OmniDocBench: no disponible en la informacion proporcionada
- Paper del modelo base: no disponible en la informacion proporcionada
