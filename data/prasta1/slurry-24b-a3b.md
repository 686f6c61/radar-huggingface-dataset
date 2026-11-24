# prasta1/SLURRY-24B-A3B

## Resumen

SLURRY-24B-A3B es un modelo de lenguaje causal de arquitectura *mixture of experts* (MoE) desarrollado por Peregrine Design Werx y publicado en Hugging Face por el usuario `prasta1`. Forma parte de la denominada "Effluent Series" (LOG → PELLET → SLURRY), siendo el tercero y último miembro de la familia y el único concebido para trabajo sobre documentos completos. El modelo se entrena desde cero sobre 1,1 billones de tokens y emplea una arquitectura de decodificador estilo Llama con 40 capas, 8 expertos FFN enrutados por capa y enrutamiento *top-1*.

La propuesta central del modelo es el equilibrio entre capacidad y coste computacional: 24.400 millones de parámetros residentes en memoria pero solo 3.100 millones activos por token, lo que permite ejecutar el modelo completo en una única GPU de 80 GB en bfloat16 (48 GB residentes) sin necesidad de paralelismo de expertos. Con una ventana de contexto de 131.072 tokens, está orientado a análisis de documentos extensos, extracción de información con contexto largo y procesamiento por lotes de alta throughput.

Su relevancia actual radica en la combinación de contexto largo real (con rendimiento medido en RULER) y una licencia Apache 2.0 permisiva, en un segmento donde la mayoría de alternativas con contexto comparable exigen licencias restrictivas o despliegues multi-GPU. El modelo declara un throughput de aproximadamente 2.400 tokens por segundo en una H100 con batch 32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador transformer estilo Llama con MoE disperso (8 expertos FFN enrutados por capa, top-1) |
| Parametros totales | 24,4B |
| Parametros activos | 3,1B por token |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | bfloat16 (48 GB residentes), FP8, AWQ-4bit |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via `transformers`; no se declaran GGUF ni otros formatos en la informacion disponible) |

Datos adicionales de arquitectura declarados por el autor: 40 capas, tamaño oculto de 3.072, 24 cabezas de atencion con 4 grupos KV (GQA), vocabulario de 128.256 tokens, factor de capacidad 1,25 en entrenamiento y precision de entrenamiento en bfloat16.

## Arquitectura y entrenamiento

SLURRY-24B-A3B es un transformer decoder-only de tipo causal con mezcla de expertos dispersa. Cada una de las 40 capas contiene 8 redes feed-forward enrutadas mediante un router *top-1*: cada token activa un unico experto por capa, sin deliberacion ni combinacion ponderada. El autor describe el esquema de enrutamiento como sintonizado para throughput y no para interpretabilidad, con un factor de capacidad de 1,25 durante el entrenamiento. La atencion usa 24 cabezas con 4 grupos KV (GQA), lo que reduce el coste de memoria de la cache KV en contextos largos.

El modelo se entrena desde cero (sin fine-tuning sobre una base previa) sobre 1,1 billones de tokens, con una composicion de dataset que incluye EleutherAI/pile, HuggingFaceFW/fineweb y togethercomputer/RedPajama-Data-1T. La model card no detalla la mezcla exacta de proporciones ni si se aplicaron fases de RLHF o DPO; el autor menciona una variante Instruct separada (SLURRY-24B-A3B-Instruct) pero no describe el proceso de alineamiento en la informacion disponible. La fecha de corte de conocimiento declarada es 2026-01.

Como innovacion tecnica destacable, el modelo prioriza el rendimiento en inferencia sobre la interpretabilidad del enrutamiento: la perdida de balanceo de carga evita el colapso de expertos pero no fuerza una distribucion uniforme, lo que el propio autor reconoce como una decision consciente con consecuencias medibles (dos de los ocho expertos absorben el 61% de los tokens).

## Capacidades

- Generacion de texto autoregresiva en ingles con ventana de contexto de 131.072 tokens.
- Analisis de documentos completos: permisos, declaraciones de impacto ambiental, manuales de operacion y mantenimiento, informes plurianuales de monitorizacion de vertidos.
- Extraccion y referenciacion cruzada de informacion a lo largo de decenas de documentos en una sola pasada.
- Procesamiento por lotes de alto throughput (aproximadamente 2.400 tok/s en 1xH100 con batch 32).
- Seguimiento de instrucciones con contexto de trabajo amplio, en la variante Instruct.
- Base para RAG de documentos largos con recuperacion gruesa (volcar 60K tokens y dejar que el modelo resuelva).
- Capacidad de recuperacion en contexto largo medida: 87,4% en RULER a 128K y 97,1% a 32K.
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- **Analisis de permisos ambientales y declaraciones de impacto:** el modelo puede ingerir un permiso completo de decenas de miles de tokens en una sola pasada y responder preguntas que requieren cruzar secciones distantes del documento, gracias a su ventana de 131.072 tokens y a una recuperacion del 87,4% en RULER a maxima longitud.
- **Extraccion de datos de informes de monitorizacion de vertidos:** para informes plurianuales donde los datos relevantes estan dispersos en tablas y texto, el modelo evita la fragmentacion en chunks y mantiene coherencia entre anos al procesar el documento entero.
- **Procesamiento por lotes de alta throughput:** en pipelines donde el cuello de botella es la latencia por documento y no el coste por token, sus aproximadamente 2.400 tok/s en H100 con batch 32 lo sitúan entre un modelo de 13B (demasiado lento) y uno de 1,3B (demasiado superficial), segun el propio autor.
- **RAG de documentos largos con recuperacion gruesa:** cuando el paso de retrieval es impreciso, se pueden volcar 60K tokens de contexto recuperado y dejar que el modelo filtre y sintetice, reduciendo la dependencia de un reranker fino.
- **Analisis de manuales de operacion y mantenimiento (O&M) de plantas:** consultas tecnicas sobre procedimientos descritos a lo largo de cientos de paginas, con la ventaja de mantener el contexto completo de la instalacion en una sola ventana.
- **Generacion asistida con contexto documental extenso (variante Instruct):** redaccion de resumenes, respuestas o informes tecnicos condicionados por un corpus documental completo cargado en contexto.
- **Investigacion sobre enrutamiento MoE:** como objeto de estudio de esquemas top-1 con colapso de expertos documentado, util para experimentos sobre balanceo de carga y estabilidad de routing.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| MMLU (5-shot) | Accuracy | 61,9 |
| HellaSwag (10-shot) | Accuracy normalizada | 81,0 |
| GSM8K (8-shot, CoT) | Accuracy | 48,7 |

Datos adicionales de rendimiento declarados en la model card:

| Metrica | Valor |
|---|---|
| RULER a 128K | 87,4% de recuperacion |
| RULER a 32K | 97,1% de recuperacion |
| BOGUS (alucinacion) | 7,2% |
| Throughput en 1xH100, batch 32 | ~2.400 tok/s |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en estos benchmarks.

## Requisitos de hardware

- **VRAM en bfloat16:** 48 GB residentes; el modelo completo cabe en una unica GPU de 80 GB sin paralelismo de expertos.
- **Cuantizacion FP8:** reduce el requisito por debajo de los 48 GB de bfloat16 (no se especifica el valor exacto en la informacion disponible).
- **Cuantizacion AWQ-4bit:** disponible segun la model card; permite despliegue en GPUs consumer de gama alta con VRAM suficiente (no se detalla el requisito exacto).
- **GPU recomendadas:** H100 de 80 GB para bfloat16 con throughput maximo; A100 de 80 GB como alternativa equivalente en VRAM.
- **GPU consumer:** viable en RTX 4090 (24 GB) solo con cuantizacion de 4 bits, sujeto a que el formato AWQ-4bit declarado este efectivamente publicado (no se confirma en la informacion disponible).
- **Configuracion de despliegue:** `--tensor-parallel-size 1` es la configuracion correcta; el autor advierte explicitamente contra el sharding multi-GPU innecesario.
- **Frameworks:** `transformers` (libreria declarada); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible, aunque el throughput declarado sugiere un runtime optimizado.
- **Latencia y throughput:** aproximadamente 2.400 tok/s en 1xH100 con batch 32, segun el autor.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks de modelos alternativos que permitan una comparacion cuantitativa rigurosa. La comparacion se limita a caracteristicas estructurales:

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SLURRY-24B-A3B | 24,4B / 3,1B | 131.072 | Apache 2.0 | MoE top-1, 8 expertos, entrenado desde cero sobre 1,1T tokens |
| Alternativas de la misma familia (LOG, PELLET) | no disponible | no disponible | no disponible | Mencionadas como modelos 1 y 2 de la Effluent Series; sin especificaciones en la informacion disponible |
| Otras alternativas comparables | no disponible | no disponible | no disponible | No se aportan datos de modelos de terceros en la informacion disponible |

## Limitaciones y advertencias

- **Colapso de expertos:** dos de los ocho expertos absorben el 61% de los tokens, lo que reduce la capacidad efectiva por debajo de lo que sugieren los 24,4B parametros. Los expertos mas debiles son los que procesan las entradas mas raras.
- **Inestabilidad del routing con batch bajo:** con batch inferior a 4, las decisiones del router varian entre ejecuciones y producen hasta un 6% de divergencia en generacion larga para prompts identicos. Para reproducibilidad hay que usar batch o fijar semilla, aceptando que la semilla fija el routing y no el muestreo.
- **Contexto largo con sesgo inicial:** la recuperacion a 128K es del 87,4% frente al 97,1% a 32K; el contenido situado en el ultimo 15% de una ventana de 128K se recupera con menos fiabilidad que el situado en el primer 50%.
- **Alucinacion:** 7,2% en BOGUS, el mejor de la familia pero insuficiente para contenido que vaya a citarse. El autor advierte que el experto de texto regulatorio (E2) es fluido y esta infratentrenado en relacion con su confianza, lo que favorece invenciones plausibles.
- **Prohibicion de uso como sistema de control:** el modelo no es un sistema de control, ni una calculadora de dosificacion, ni un instrumento de cumplimiento normativo. Su capacidad de contexto largo lo hace mas peligroso en ese rol, no menos.
- **Idioma:** solo ingles; cualquier otro idioma queda fuera de alcance.
- **Fecha de corte:** no cubre conocimiento posterior a 2026-01.
- **Licencia:** Apache 2.0 permite uso comercial, pero las limitaciones tecnicas anteriores (alucinacion, colapso de expertos, inestabilidad de routing) deben evaluarse antes de llevarlo a produccion.
- **Datos no verificados:** todos los benchmarks y metricas proceden de la model card del autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prasta1/SLURRY-24B-A3B
- Repositorio GitHub: https://github.com/prasta1/effluent-series
- Paper: https://arxiv.org/abs/2604.01188
- Coleccion Effluent Series: https://huggingface.co/collections/prasta1/the-effluent-series
