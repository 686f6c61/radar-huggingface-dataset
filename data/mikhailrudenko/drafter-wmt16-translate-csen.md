# MikhailRudenko/drafter-wmt16-translate-csen

## Resumen

Drafter-wmt16-translate-csen es un modelo borrador (drafter) de dominio especifico disenado para decodificacion especulativa en la tarea de traduccion checo → ingles. Lo desarrolla MikhailRudenko dentro del proyecto de investigacion Domain-Aware Speculative Decoding, cuya hipotesis es que un borrador especializado por dominio alcanza tasas de aceptacion mas altas que un unico borrador de proposito general. El modelo tiene 156.519.168 parametros, una arquitectura MistralForCausalLM derivada de Lite-Mistral-150M-v2-Instruct y se distribuye en safetensors con precision bfloat16 bajo licencia Apache 2.0.

El modelo no traduce por si mismo en un flujo normal: su funcion es proponer tokens que el modelo objetivo (TurboSparse-Mistral-Instruct de 7B, con arquitectura BambooForCausalLM) verifica en paralelo durante la generacion especulativa. Se entreno por destilacion de conocimiento a partir de las distribuciones top-10 del modelo objetivo sobre 28.500 muestras sinteticas del cluster wmt16_translate_csen_10templates del dataset Flan, con una funcion de perdida combinada al 50 % de entropia cruzada y 50 % de divergencia KL.

Su relevancia es metodologica: aporta un punto de comparacion medible sobre si la especializacion por dominio compensa la perdida de cobertura frente a un drafter mixto. En validacion alcanza una eval_loss de 2,260 y una top1_accuracy del 49,96 %, cifras mas bajas que las del drafter mixto del mismo autor (2,085 y 59,50 %), lo que ilustra el compromiso entre especializacion y accuracy de token propuesto. El modelo no tiene descargas ni likes registrados y la model card no documenta longitud de contexto, throughput ni tasas de aceptacion en inferencia real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer decoder-only denso) |
| Parametros totales | 156.519.168 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible oficialmente; los pesos se publican en bfloat16 y son convertibles a fp16, int8 e int4 con herramientas estandar |
| Idiomas soportados | en, cs (ingles y checo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | Felladrin/Lite-Mistral-150M-v2-Instruct, ajustado a partir de MikhailRudenko/drafter-mixed-ut |
| Modelo objetivo | TurboSparse-Mistral-Instruct (7B, BambooForCausalLM) |
| Dominio | traduccion WMT16: checo → ingles |
| Cluster de entrenamiento | wmt16_translate_csen_10templates |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only densa de tipo MistralForCausalLM con 156 millones de parametros. Parte de Lite-Mistral-150M-v2-Instruct (Felladrin) y se fine-tunea desde el checkpoint del drafter mixto del mismo autor, MikhailRudenko/drafter-mixed-ut, lo que implica que hereda un preentrenamiento generalista antes de la especializacion en el dominio de traduccion checo-ingles.

El entrenamiento combina dos senales: entropia cruzada estandar sobre la secuencia greedy (trunk) y una perdida de destilacion por divergencia KL con temperatura 1,0 sobre las distribuciones top-10 del modelo objetivo. La perdida total es 0,5 × CrossEntropy + 0,5 × KL. Los datos son 28.500 muestras sinteticas generadas por el modelo objetivo en el cluster wmt16_translate_csen_10templates, con un 5 % reservado para validacion (1.500 muestras). Se entrenaron 10 epocas con batch de 32, learning rate de 5e-5 con schedule coseno y 3 % de warmup sobre una unica RTX 3090 de 24 GB; la perdida se estabiliza alrededor de la epoca 5. El mejor checkpoint es checkpoint-8010, con eval_loss final de 2,260 y top1_accuracy de 49,96 %. No se documenta innovacion arquitectonica propia: el valor del modelo esta en el procedimiento de destilacion por dominio, no en cambios estructurales.

## Capacidades

- Generacion de tokens como borrador para decodificacion especulativa: propone secuencias candidatas que el modelo objetivo verifica en paralelo.
- Especializacion en traduccion checo → ingles sobre el dominio WMT16 (texto de noticias y tareas de traduccion del benchmark).
- Modelado de distribuciones del modelo objetivo mediante destilacion de las top-10 probabilidades, no solo de la etiqueta greedy.
- Generacion de texto generica limitada: la pipeline declarada es text-generation y las etiquetas incluyen conversational, pero no se documentan capacidades conversacionales especificas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles y checo.
- Capacidades especiales: ninguna documentada (sin modo thinking, sin vision, sin audio).

## Casos de uso

- Aceleracion de traduccion automatica checo → ingles en produccion: el drafter se acopla a TurboSparse-Mistral-Instruct para proponer token y reducir el numero de pasos de decodificacion del modelo de 7B, con la ventaja de estar especializado exactamente en ese par de idiomas y en ese dominio.
- Traduccion de documentacion tecnica y articulos desde checo: el entrenamiento sobre el cluster WMT16 (texto periodistico y generico) lo hace adecuado para prosa informativa, no para jerga legal o medica especializada.
- Procesamiento por lotes de contenido editorial checo: la ventana de contexto no esta documentada, por lo que su uso razonable es con fragmentos cortos o parrafos, donde la verificacion especulativa aporta mas ganancia relativa.
- Investigacion en decodificacion especulativa: sirve como baseline de dominio especifico para comparar tasas de aceptacion frente al drafter mixto (drafter-mixed-ut) y frente a otros drafters WMT16 del mismo autor (deen, ruen, tren, fien).
- Reproduccion de experimentos de destilacion top-k: el modelo permite replicar el esquema 0,5 × CE + 0,5 × KL con temperatura 1,0 y medir el efecto de la especializacion por cluster.
- Generacion de datasets sinteticos de traduccion: dado que se entreno sobre salidas del modelo objetivo, puede emplearse para estudiar sesgos y derivas de la destilacion en tareas de traduccion checo-ingles.
- Despliegue en hardware muy limitado: con 156M parametros y 0,3 GB de pesos en bfloat16, cabe en cualquier GPU de consumo y permite experimentar con decodificacion especulativa sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU) en la informacion disponible. La model card solo reporta metricas internas de validacion y una comparativa con otros drafters del mismo autor.

Metricas de validacion del modelo (1.500 muestras, 5 % held-out):

| Metrica | Valor |
|---|---|
| eval_loss final | 2,260 |
| top1_accuracy | 49,96 % |
| Mejor checkpoint | checkpoint-8010 |
| Epocas | 10 (meseta en ~5) |

Comparativa de drafters del mismo autor (datos de la model card):

| Modelo | Dominio | eval_loss | top1_acc |
|---|---|---|---|
| drafter-understanding | Comprension (31 clusters) | 2,100 | 65,00 % |
| drafter-mixed-ut | Mixto U+T (42 clusters) | 2,085 | 59,50 % |
| drafter-text-reformulation | Reformulacion de texto (11 clusters) | 2,151 | 54,34 % |
| drafter-wmt16-translate-tren | Turco → ingles | 1,998 | 54,91 % |
| drafter-wmt16-translate-deen | Aleman → ingles | 2,307 | 52,77 % |
| drafter-wmt16-translate-ruen | Ruso → ingles | 2,363 | 50,04 % |
| drafter-wmt16-translate-csen | Checo → ingles | 2,260 | 49,96 % |
| drafter-wmt16-translate-fien | Fines → ingles | 2,252 | 49,36 % |

No se han publicado tasas de aceptacion (acceptance rate) ni ganancias de velocidad (speedup) en decodificacion especulativa real, que son las metricas que determinarian la utilidad practica del modelo.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,31 GB solo para pesos en bfloat16/fp16; en la practica menos de 1 GB con cache KV y activaciones para batch 1 y secuencias cortas; alrededor de 1-2 GB con batches moderados.
- Cuantizacion: alrededor de 0,16 GB en int8 y 0,08 GB en int4, aunque no se publican checkpoints cuantizados oficiales.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM (RTX 3050, RTX 3060, GTX 1660, T4). No requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo: si, incluidas GTX 10xx y RTX de gama de entrada; tambien se puede ejecutar en CPU para pruebas.
- Entrenamiento: se realizo en una unica RTX 3090 de 24 GB, lo que da una referencia clara del minimo practico.
- Opciones de despliegue: transformers (AutoModelForCausalLM, tal como documenta la model card) y vLLM, que soporta decodificacion especulativa con modelo borrador. En llama.cpp, Ollama o LM Studio requeriria conversion previa a GGUF, no documentada por el autor. El soporte de decodificacion especulativa en TGI con este par de modelos no esta confirmado.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni factor de aceleracion respecto a la decodificacion estandar.
- Requisito de acoplamiento: el drafter debe compartir tokenizador y vocabulario con el modelo objetivo; esta disenado para TurboSparse-Mistral-Instruct (7B), no para modelos de otros vocabularios.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | eval_loss | top1_acc | Licencia |
|---|---|---|---|---|---|
| drafter-wmt16-translate-csen | 156M | Checo → ingles | 2,260 | 49,96 % | apache-2.0 |
| drafter-wmt16-translate-tren | no disponible | Turco → ingles | 1,998 | 54,91 % | apache-2.0 |
| drafter-wmt16-translate-deen | no disponible | Aleman → ingles | 2,307 | 52,77 % | apache-2.0 |
| drafter-mixed-ut | no disponible | Mixto U+T (42 clusters) | 2,085 | 59,50 % | no disponible |
| drafter-understanding | no disponible | Comprension (31 clusters) | 2,100 | 65,00 % | no disponible |

El drafter mixto (drafter-mixed-ut) es la alternativa generalista directa: cubre 42 clusters y obtiene mejor top1_accuracy (59,50 % frente a 49,96 %), pero esta menos especializado. El drafter turco-ingles (tren) es el mejor de la familia WMT16 en estas metricas (eval_loss 1,998, top1 54,91 %). Comparativas con tecnicas alternativas de decodificacion especulativa (EAGLE, Medusa, Lookahead) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: solo cubre el par checo → ingles y unicamente el cluster wmt16_translate_csen_10templates; su rendimiento fuera de ese dominio no esta medido y previsiblemente degradara la tasa de aceptacion.
- top1_accuracy por debajo del 50 % en validacion: en la practica implica que la mayoria de tokens propuestos no coinciden con la eleccion greedy del modelo objetivo, lo que reduce la ganancia de la decodificacion especulativa.
- Dependencia del modelo objetivo: esta calibrado contra TurboSparse-Mistral-Instruct (7B, BambooForCausalLM). Usarlo con otro modelo objetivo invalida las distribuciones destiladas y puede degradar el rendimiento.
- Ausencia de metricas de produccion: no se publican tasas de aceptacion, speedup ni latencia, que son las que determinan si el modelo aporta valor real en inferencia.
- Longitud de contexto no documentada: limita el diseno de aplicaciones con entradas largas.
- Solo dos idiomas declarados (en, cs) y sin capacidades de tool calling, agentes, vision ni audio.
- Riesgo de alucinacion: al ser un modelo pequeno destilado para proponer tokens, no debe usarse como generador autonomo de traducciones sin verificacion del modelo objetivo.
- Sesgos: no se documenta analisis de sesgos; los datos derivan del cluster Flan WMT16 y de salidas sinteticas del modelo objetivo, por lo que hereda los sesgos de ambos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; el modelo tiene cero descargas y cero likes, por lo que no hay validacion externa de la comunidad.
- Fechas del repositorio poco habituales (creacion y actualizacion en septiembre de 2026 segun los metadatos), lo que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MikhailRudenko/drafter-wmt16-translate-csen
- Modelo base (fine-tuning): https://huggingface.co/MikhailRudenko/drafter-mixed-ut
- Modelo base original: https://huggingface.co/Felladrin/Lite-Mistral-150M-v2-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/MikhailRudenko/domain-aware-sd-synthetic
- Drafter de comprension: https://huggingface.co/MikhailRudenko/drafter-understanding
- Drafter de reformulacion de texto: https://huggingface.co/MikhailRudenko/drafter-text-reformulation
- Drafter WMT16 turco → ingles: https://huggingface.co/MikhailRudenko/drafter-wmt16-translate-tren
- Drafter WMT16 aleman → ingles: https://huggingface.co/MikhailRudenko/drafter-wmt16-translate-deen
- Drafter WMT16 ruso → ingles: https://huggingface.co/MikhailRudenko/drafter-wmt16-translate-ruen
- Drafter WMT16 fines → ingles: https://huggingface.co/MikhailRudenko/drafter-wmt16-translate-fien
- Modelo objetivo TurboSparse-Mistral-Instruct (7B, BambooForCausalLM): sin enlace directo en la informacion proporcionada
- Paper o blog del proyecto Domain-Aware Speculative Decoding: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces recuperados pertenecen a foros de television en aleman y no guardan relacion con el contenido de esta ficha.
