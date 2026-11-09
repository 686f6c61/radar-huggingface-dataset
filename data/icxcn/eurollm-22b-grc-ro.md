# icxcn/EuroLLM-22B-grc-ro

## Resumen

EuroLLM-22B-grc-ro es un modelo de traduccion especializado en griego koiné y bizantino (patristico) hacia rumano, desarrollado por el usuario icxcn mediante fine-tuning LoRA sobre el modelo instructivo EuroLLM-22B-Instruct-2512 del proyecto utter. El modelo resuelve un nicho muy concreto: la traduccion de textos teologicos y patristicos griegos antiguos a un registro rumano eclesiastico y arcaizante, no al rumano moderno estandar. Con 22.637.328.384 parametros y un repositorio de 46 GB, se distribuye en pesos bf16 fusionados (LoRA integrado en el modelo base) listos para cargar en `transformers` y vLLM.

Se trata de un modelo en estado preview: los resultados reportados provienen de un split de desarrollo de 134 filas que tambien se uso para seleccionar el modelo y su variante de entrada, mientras que el split de test (106 filas) y una fuente retenida adicional (160 filas) no han sido evaluados. No se ha realizado evaluacion humana. La relevancia actual reside en su caracter de herramienta vertical para humanidades digitales y edicion de textos patristicos, un dominio donde los modelos generalistas rinden de forma notablemente inferior.

La licencia es Apache 2.0 y los idiomas declarados son griego antiguo (grc) y rumano (ro). El modelo base es un transformer denso de 22B, aunque la model card no detalla la arquitectura interna ni la longitud de contexto del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la del base EuroLLM-22B-Instruct-2512); detalles internos no disponibles |
| Parametros totales | 22.637.328.384 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; pesos publicados en bf16. Al ser un modelo estandar de `transformers`, es cuantificable con herramientas externas (GPTQ, AWQ, GGUF) sin validacion reportada |
| Idiomas soportados | Griego antiguo/koiné (grc) y rumano (ro) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16 fusionado) y adaptador LoRA separado en `adapter/` (rank 32, fp32, 702 MB) |

## Arquitectura y entrenamiento

El modelo parte de `utter-project/EuroLLM-22B-Instruct-2512`, un transformer denso de 22B parametros, y se obtiene mediante LoRA de rango 32 y alpha 64 con dropout 0.05, aplicado sobre las proyecciones de atencion y MLP del modelo de lenguaje. Los pesos base se mantienen en bf16, el adaptador en fp32 y el computo en bf16, sin cuantizacion. El entrenamiento consistio en 2 epocas con learning rate 1e-4, schedule coseno y 3% de warmup, batch efectivo de 16 secuencias (2 x 8 de acumulacion de gradiente), maximo de 2.560 tokens, semilla 0 y gradient checkpointing, con la perdida calculada unicamente sobre la respuesta en rumano. El coste fue de aproximadamente 49 minutos en una H200 (2.953 s), usando `transformers` 5.22.2, `peft` 0.21.2 y `torch` 2.15.0.

El dataset de entrenamiento consta de 3.577 pares griego-rumano a nivel de parrafo (unas 363k palabras griegas, 423k rumanas, 1,91M tokens) procedentes de 14 fuentes bilingues: Nuevo Testamento, dos ediciones de los Salmos, un libro liturgico y obras patristicas y asceticas. Aproximadamente la mitad del griego esta en Unicode politonico correcto y la otra mitad proviene de PDFs con OCR, con diacriticos colapsados y errores de reconocimiento; por ello el modelo exige una normalizacion de entrada a forma monotonica mediante `monotonic()` de `grc_normalize.py`, que elimina espiritus, iota suscrita, macron y breve, y mapea grave y circunflejo a agudo. La limpieza incluyo normalizacion NFC, eliminacion de marcadores de folio, corchetes editoriales, citas parenteticas, numeros de seccion y digitos de notas al pie, y descarte de filas con ratios de longitud atipicos, tokens fusionados, griego con script mixto, encabezados incrustados o duplicados.

## Capacidades

- Traduccion de griego koiné y bizantino (patristico) a rumano con registro eclesiastico y arcaizante (formas como *întru* o *cela ce*), no rumano moderno.
- Generacion de texto condicionada por prompt de sistema y mensaje de usuario mediante chat template del modelo base.
- Manejo de entradas a nivel de parrafo: mediana de unos 620 caracteres griegos y maximo de unos 2.300 en el conjunto de evaluacion.
- Traduccion de genero biblico (Nuevo Testamento, Salmos) y de literatura patristica y ascetica.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision ni audio.
- Capacidad multilingue limitada a los dos idiomas del fine-tuning; el modelo base soporta mas idiomas, pero el adaptador esta especializado en el par grc-ro.
- No se documenta modo thinking ni decodificacion especulativa.

## Casos de uso

- Traduccion asistida de patristica griega para publicaciones editoriales: el modelo traduce parrafos completos de obras de los Padres de la Iglesia a un rumano eclesiastico coherente con el registro de las traducciones ortodoxas, reduciendo el trabajo de primera pasada del traductor humano.
- Digitalizacion y puesta en acceso de fondos OCR: al aceptar entrada normalizada a monotonico, permite procesar texto griego procedente de PDFs con diacriticos colapsados y errores de OCR, un escenario frecuente en bibliotecas digitales teologicas.
- Creacion de corpus paralelos griego-rumano: util para proyectos de humanidades digitales que necesiten alinear y ampliar corpus bilingues en el dominio patristico.
- Traduccion liturgica y catequetica: adecuado para textos de uso eclesiastico donde se espera registro arcaizante en lugar de rumano contemporaneo.
- Investigacion en traduccion automatica de lenguas historicas: sirve como referencia especializada y como punto de partida para experimentos de fine-tuning sobre otros pares con lenguas clasicas.
- Pre-traduccion en flujos de trabajo con revision humana: integrable via vLLM en un servicio interno que genere borradores para que un revisor teologico los corrija, dado el estado preview y la ausencia de evaluacion humana.
- Evaluacion comparativa de modelos en dominios de bajos recursos: el modelo documenta curvas de aprendizaje y comparaciones con Gemma 4 31B, Gemma 4 12B y Krikri-8B, lo que lo hace util como baseline en experimentos de traduccion de lenguas historicas.

## Benchmarks y rendimiento

Resultados sobre el split de desarrollo (134 filas), decodificacion greedy:

| Sistema | chrF++ | COMET-22 | chrF++ filas Biblia | chrF++ filas patristicas |
|---|---|---|---|---|
| Modelo base, zero-shot (mismo formato de entrada) | 47,61 | no medido | 52,17 | 44,67 |
| **Este modelo** | **58,99** (IC 95%: 56,73–61,19) | **0,8018** (0,7918–0,8147) | 71,22 | 51,19 |

Curva de aprendizaje (mismos ajustes, subconjuntos anidados del entrenamiento, split de desarrollo):

| Pares de entrenamiento | Perdida en dev | chrF++ | Biblia | Patristico |
|---|---|---|---|---|
| 894 (25%) | 0,912 | 55,73 | 66,99 | 48,53 |
| 1.788 (50%) | 0,865 | 55,92 | 69,61 | 47,36 |
| 2.683 (75%) | 0,829 | 57,41 | 70,78 | 48,97 |
| 3.577 (100%, este modelo) | 0,802 | 58,99 | 71,22 | 51,19 |

Notas metodologicas: chrF++ corresponde a `sacrebleu CHRF(word_order=2)`; COMET usa `Unbabel/wmt22-comet-da`; los intervalos son bootstrap al 95% sobre filas (200 remuestreos). Las filas de "Biblia" son el Nuevo Testamento y dos ediciones de los Salmos (65 filas de dev); las "patristicas" son el resto (69 filas). La decodificacion greedy no es reproducible bit a bit entre ejecuciones: el mismo modelo fusionado puntuo 54,99 y 54,37 chrF++ en dos ejecuciones de vLLM en una prueba separada de otro modelo, por lo que diferencias inferiores a 1 chrF++ no deben interpretarse como reales. Entre cuatro modelos base afinados (tambien Gemma 4 31B, Gemma 4 12B y Krikri-8B), este empató con el mejor en dev (Gemma 4 31B: 59,43 chrF++, COMET 0,8019; diferencia no significativa) y supero a los modelos de 12B y 8B en unos 4-5 chrF++.

## Requisitos de hardware

- Inferencia en bf16: los pesos ocupan aproximadamente 45 GB, por lo que se necesita al menos una GPU de 48 GB (A6000, L40S, A100 80GB, H100 80GB) o varias GPUs con `device_map="auto"`.
- En cuantizacion de 8 bits, la huella ronda los 23 GB, lo que permite ejecucion en una RTX 4090 (24 GB) con margen ajustado; en 4 bits, unos 12-13 GB, viable en GPUs consumer de 16 GB o superiores. Estas cuantizaciones no estan validadas por el autor.
- GPU recomendadas para produccion: H100 o A100 80GB para bf16 sin cuantizar; L40S o A6000 para despliegues de una sola GPU.
- Despliegue: `transformers` (ejemplo incluido en `example.py`) y vLLM (`vllm serve icxcn/EuroLLM-22B-grc-ro`), sirviendo los pesos fusionados y normalizando en el cliente. El adaptador puede cargarse con `PeftModel.from_pretrained` sobre el modelo base.
- No se documentan latencia ni throughput medidos. El coste de entrenamiento reportado (2.953 s en una H200 para 2 epocas sobre 3.577 pares) no es extrapolable directamente a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | chrF++ dev (grc-ro) | COMET-22 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **EuroLLM-22B-grc-ro** | 22,6B | no disponible | 58,99 | 0,8018 | Apache 2.0 | Hugging Face (preview) |
| Gemma 4 31B (fine-tuned, mismo experimento) | 31B (aprox.) | no disponible | 59,43 | 0,8019 | no disponible en la informacion | no disponible |
| Gemma 4 12B (fine-tuned, mismo experimento) | 12B (aprox.) | no disponible | ~4-5 chrF++ por debajo | no disponible | no disponible en la informacion | no disponible |
| Krikri-8B (fine-tuned, mismo experimento) | 8B (aprox.) | no disponible | ~4-5 chrF++ por debajo | no disponible | no disponible en la informacion | no disponible |

La comparacion se limita a los modelos citados en la model card; no se dispone de datos de otros sistemas especializados en griego antiguo-rumano.

## Limitaciones y advertencias

- Estado preview: los resultados provienen de un split de desarrollo usado tambien para seleccionar el modelo y la variante de entrada; el split de test (106 filas) y una fuente retenida (160 filas) no han sido evaluados.
- No se ha realizado evaluacion humana de la calidad de traduccion.
- El registro de salida es rumano eclesiastico y arcaizante, no rumano moderno; no es adecuado para traduccion a rumano contemporaneo sin post-edicion.
- Requiere normalizacion obligatoria de la entrada griega a forma monotonica con `monotonic()`; omitirla degrada el rendimiento de forma no cuantificada.
- Comportamiento no probado en entradas muy superiores al maximo de evaluacion (unos 2.300 caracteres griegos); la longitud de contexto del modelo base no se documenta.
- La decodificacion greedy no es reproducible bit a bit entre ejecuciones; diferencias inferiores a 1 chrF++ no deben considerarse significativas.
- El entrenamiento uso solo 3.577 pares y la perdida en dev seguia bajando (~0,055 por duplicacion de datos) cuando se agotaron los datos, lo que sugiere margen de mejora con mas corpus.
- Parte del corpus griego proviene de OCR con diacriticos colapsados y errores, lo que puede introducir ruido en la calidad de las traducciones.
- Los datos de entrenamiento no se distribuyen con el modelo, lo que limita la reproducibilidad completa y la auditoria del corpus.
- No se documentan sesgos especificos; al estar entrenado en textos religiosos, cabe esperar sesgo de dominio hacia vocabulario y estilo teologico.
- Riesgo de alucinacion en pasajes oscuros o danados por OCR no cuantificado; se recomienda revision humana en produccion editorial.
- La licencia Apache 2.0 permite uso comercial, pero el estado preview y la ausencia de evaluacion en test desaconsejan su uso sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/icxcn/EuroLLM-22B-grc-ro
- Modelo base: https://huggingface.co/utter-project/EuroLLM-22B-Instruct-2512
- Repositorio del proyecto EuroLLM: no disponible en la informacion proporcionada
- Paper de EuroLLM: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
