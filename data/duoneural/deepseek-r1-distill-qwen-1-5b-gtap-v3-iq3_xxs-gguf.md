# DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ3_XXS-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ3_XXS-GGUF es un checkpoint GGUF cuantizado del modelo de razonamiento DeepSeek-R1-Distill-Qwen-1.5B, publicado por el laboratorio DuoNeural (Jesse Caldwell, Archon y Aura). No es un modelo nuevo entrenado desde cero, sino una cuantizacion de posentrenamiento que aplica la metodologia propietaria GTAP v3 (etiquetada tambien como tap-dpq y statistical-mechanics) para comprimir los 1.777.088.000 parametros del modelo base a un fichero de 0,72 GiB con una precision de aproximadamente 3,2 bits por peso.

La relevancia del artefacto esta en la tesis que defiende el autor: que una cuantizacion guiada por "mecanica estadistica" puede no solo conservar el rendimiento del modelo original, sino en algunos casos mejorarlo. En la tabla publicada, la variante Q4_K_M alcanza una perplejidad de holdout de 4.3641 frente a 4.3724 del control BF16 sin cuantizar, y la variante IQ3_XXS de este repositorio reduce la longitud media de pensamiento en GSM8K de 409,0 a 229,7 tokens manteniendo un 88,0 % de acierto.

Se trata, sin embargo, de un artefacto de investigacion declarado experimental y pendiente de verificacion externa: cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha, y todas las metricas proceden del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen: 28 capas, GQA 12:2, FFN SwiGLU) con razonamiento de test-time compute |
| Parametros totales | 1.777.088.000 (denominacion comercial: 1,5 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 4096`) |
| Tipos de cuantizacion | GGUF IQ3_XXS en este repositorio; la familia GTAP v3 incluye ademas IQ2_XXS, IQ2_M y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con imatrix) |
| Precision de cuantizacion | ~3,2 bits por peso (0,72 GiB) |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Tamano del repositorio | 0,8 GB |
| Pipeline | text-generation |
| Autor | DuoNeural (Jesse Caldwell, Archon, Aura) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base DeepSeek-R1-Distill-Qwen-1.5B: un transformer decoder-only de 28 capas con atencion agrupada por consultas en configuracion 12:2 (12 cabezas de consulta por 2 de clave/valor), FFN con activacion SwiGLU y un regimen de razonamiento de test-time compute heredado del destilado de DeepSeek-R1. El autor lo describe como un checkpoint de razonamiento compacto que conserva el mecanismo de cadena de pensamiento interno.

Este repositorio no aporta entrenamiento nuevo: es una cuantizacion de posentrenamiento (PTQ) sobre el modelo base mediante el metodo GTAP v3. Segun la model card, el metodo introduce "cavity damping" y regularizacion por atractores que reducen la ramificacion exploratoria espuria en las rutas de razonamiento, lo que explicaria la menor longitud media de pensamiento en GSM8K. No se detallan en la informacion proporcionada el numero de tokens de calibracion (mas alla de las 131k tokens del conjunto de holdout de perplejidad), la composicion del dataset de calibracion ni si el modelo base paso por fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` en HuggingFace).
- Razonamiento con cadena de pensamiento nativa: requiere la plantilla `<｜begin of sentence｜><｜User｜>{prompt}<｜Assistant｜><think>` para activar el modo de pensamiento interno.
- Matematicas de nivel escolar: 88,0 % en GSM8K con CoT nativo (22 de 25 problemas).
- Matematicas de competicion tipo olimpiada: 30,0 % (3 de 10) en IQ3_XXS y 40,0 % (4 de 10) en la variante Q4_K_M.
- Razonamiento de test-time compute: el modelo genera trazas de pensamiento antes de la respuesta, con longitud media de 229,7 tokens en GSM8K para este checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades de vision o audio: no disponibles (modelo estrictamente de texto).

## Casos de uso

- Tutoria matematica en local: el modelo resuelve ecuaciones paso a paso con CoT nativo y cabe en 0,72 GiB, por lo que puede desplegarse en un portatil sin GPU dedicada para asistir a estudiantes con feedback razonado.
- Despliegue en hardware de gama baja o edge: con 0,72 GiB de pesos y 315,0 t/s de decodificacion en una RTX 4080 Super, es viable ejecutarlo en dispositivos con pocos recursos o incluso en CPU con llama.cpp para prototipos de razonamiento offline.
- Generacion de codigo asistida en entornos restringidos: al ser un modelo de 1,5 B con licencia Apache 2.0, puede integrarse en entornos air-gapped para autocompletado o explicacion de fragmentos de codigo sin dependencia de APIs externas, siempre que se valide la calidad real en el dominio.
- Procesamiento por lotes de problemas aritmeticos y logicos: con 315,0 t/s se pueden evaluar grandes volumenes de ejercicios (clasificacion, verificacion de soluciones) en pipelines de evaluacion automatizada.
- Investigacion en cuantizacion: el checkpoint sirve como sujeto de estudio para reproducir o refutar las afirmaciones del autor sobre GTAP v3 y la regularizacion por atractores frente a la cuantizacion ingenua IQ3_XXS.
- Prototipado de asistentes conversacionales de bajo coste: la plantilla nativa de DeepSeek-R1 permite construir chatbots con razonamiento explicito en configuraciones donde el coste por token o la privacidad del dato son criticos.
- Educacion e interpretabilidad de cadenas de pensamiento: la menor longitud media de pensamiento (229,7 tokens frente a 409,0 del control BF16) facilita auditar trazas de razonamiento mas cortas y legibles en experimentos docentes.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (conjuntos reducidos: GSM8K sobre 25 problemas, olimpiada sobre 10, perplejidad continua sobre 131k tokens). No estan verificados de forma independiente.

| Variante | Huella | Perplejidad continua | GSM8K (CoT) | Pensamiento medio (GSM) | Cierre (GSM) | Olimpiada | Velocidad de decodificacion |
|---|---|---|---|---|---|---|---|
| Arm 0 Base BF16 (control) | 3,32 GiB | 4,3724 | 20/25 (80,0 %) | 409,0 tok | 100,0 % | 2/10 (20,0 %) | 141,8 t/s |
| Arm 1 IQ3_XXS ingenuo | 0,72 GiB | 4,7596 | 24/25 (96,0 %) | 308,1 tok | 100,0 % | 3/10 (30,0 %) | 317,9 t/s |
| Arm 3 GTAP v3 IQ3_XXS (este repo) | 0,72 GiB | 4,7160 | 22/25 (88,0 %) | 229,7 tok | 100,0 % | 3/10 (30,0 %) | 315,0 t/s |
| Arm 4 GTAP v3 Q4_K_M | 1,04 GiB | 4,3641 | 20/25 (80,0 %) | 424,1 tok | 100,0 % | 4/10 (40,0 %) | 287,3 t/s |
| Arm 5 GTAP v3 IQ2_M | 0,65 GiB | 5,1392 | 19/25 (76,0 %) | 238,9 tok | 96,0 % | 0/10 (0,0 %) | 304,9 t/s |
| Arm 6 GTAP v3 IQ2_XXS | 0,55 GiB | 9,4779 | 10/25 (40,0 %) | 1250,9 tok | 8,0 % | 2/10 (20,0 %) | 326,9 t/s |

No se han publicado resultados de benchmarks estandar adicionales (MMLU, HumanEval, MATH completo) en la informacion disponible.

## Requisitos de hardware

- Peso del checkpoint: 0,72 GiB para IQ3_XXS; el repositorio completo ocupa 0,8 GB.
- VRAM estimada: los pesos requieren en torno a 0,8 GB; sumando cache KV para un contexto de 4096 tokens y overhead del runtime, la huella total estimada se situa aproximadamente entre 1,5 GB y 2 GB (estimacion propia, no confirmada por el autor).
- GPU recomendadas: el autor valida el modelo en una NVIDIA GeForce RTX 4080 Super (32 GB) segun la model card; tambien son validas GPUs de gama media o baja con al menos 2 GB de VRAM.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU o en CPU pura por su tamano.
- Opciones de despliegue: llama.cpp mediante `llama-cli` y `llama-server` (comandos documentados por el autor); cualquier runtime compatible con GGUF. No se confirma compatibilidad explicita con vLLM, TGI, Ollama o LM Studio en la informacion disponible.
- Rendimiento: 315,0 t/s de decodificacion en IQ3_XXS y 317,9 t/s en la cuantizacion ingenua, frente a 141,8 t/s del control BF16 en la misma maquina, segun el autor.
- Flags de ejemplo recomendados por el autor: `-c 4096 -ngl 99 -fa on`, con `--temp 0.6 --top-p 0.95`.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con otros modelos de terceros de la misma categoria (por ejemplo, otros destilados de R1 o modelos de ~1,5 B como Qwen2.5-1.5B). La unica comparativa publicada es interna, entre el control BF16 sin cuantizar y las distintas variantes de cuantizacion.

| Variante | Huella | Perplejidad | GSM8K (CoT) | Olimpiada | Licencia |
|---|---|---|---|---|---|
| Base BF16 sin cuantizar (control) | 3,32 GiB | 4,3724 | 80,0 % | 20,0 % | Apache 2.0 |
| IQ3_XXS ingenuo (sin GTAP) | 0,72 GiB | 4,7596 | 96,0 % | 30,0 % | Apache 2.0 |
| GTAP v3 IQ3_XXS (este repo) | 0,72 GiB | 4,7160 | 88,0 % | 30,0 % | Apache 2.0 |
| GTAP v3 Q4_K_M | 1,04 GiB | 4,3641 | 80,0 % | 40,0 % | Apache 2.0 |
| GTAP v3 IQ2_XXS | 0,55 GiB | 9,4779 | 40,0 % | 20,0 % | Apache 2.0 |

Comparativa con alternativas externas: no disponible.

## Limitaciones y advertencias

- Artefacto experimental: la propia model card lo etiqueta como "Experimental Release: Pending Further Verification / Empirical Validation", por lo que no debe asumirse como un checkpoint de produccion validado.
- Benchmarks no verificados: todas las metricas provienen del autor, sobre conjuntos muy reducidos (25 problemas de GSM8K y 10 de olimpiada), lo que implica un margen de error elevado y poca robustez estadistica.
- Riesgo de sobreajuste al conjunto de evaluacion: la variante IQ3_XXS ingenua supera al control BF16 en GSM8K (96,0 % frente a 80,0 %) mientras empeora en perplejidad, un patron compatible con varianza de muestreo en conjuntos tan pequenos.
- Colapso en cuantizaciones agresivas: IQ2_XXS degrada severamente el modelo (perplejidad 9,4779, GSM8K 40,0 %, tasa de cierre 8,0 %), lo que indica que el limite practico de compresion esta por encima de 2 bits por peso.
- Riesgo de alucinacion: inherente a un modelo de 1,5 B, especialmente en dominios fuera de matematicas; la model card no documenta evaluaciones de factualidad.
- Ausencia de datos sobre sesgos, idiomas y contexto: no se declara lista de idiomas soportados, longitud de contexto oficial ni auditorias de sesgo.
- Contexto limitado en los ejemplos: los comandos de uso fijan `-c 4096`, muy por debajo de lo habitual en modelos actuales, lo que restringe tareas con documentos largos.
- Soporte de tool calling y agentes no confirmado: no se documenta integracion con function calling ni flujos multi-paso con herramientas.
- Adopcion nula: 0 descargas y 0 likes, sin comunidad que haya reproducido los resultados ni reportado incidencias.
- Inconsistencia de metadatos: la fecha de creacion registrada en HuggingFace es 2026-09-29, posterior a la fecha de actualizacion del propio repositorio, lo que conviene tratar con cautela.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero al derivar del modelo DeepSeek-R1-Distill-Qwen-1.5B conviene revisar tambien las condiciones del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ3_XXS-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
