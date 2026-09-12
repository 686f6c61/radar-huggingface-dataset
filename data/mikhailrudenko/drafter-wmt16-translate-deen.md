# MikhailRudenko/drafter-wmt16-translate-deen

## Resumen

El modelo `MikhailRudenko/drafter-wmt16-translate-deen` es un drafter (modelo borrador) de dominio especifico disenado para decodificacion especulativa (speculative decoding) en tareas de traduccion de aleman a ingles. Lo desarrolla Mikhail Rudenko como parte del proyecto de investigacion "Domain-Aware Speculative Decoding", cuya hipotesis es que un drafter especializado por dominio alcanza tasas de aceptacion mas altas que un unico drafter de proposito general. Se trata de un modelo pequeno de 156,5 millones de parametros con arquitectura MistralForCausalLM, afinado sobre el modelo base `MikhailRudenko/drafter-mixed-ut`, que a su vez deriva de `Felladrin/Lite-Mistral-150M-v2-Instruct`.

El modelo no se usa de forma autonoma: actua como proponedor de tokens que un modelo objetivo mayor (en este caso TurboSparse-Mistral-Instruct de 7B, con arquitectura BambooForCausalLM) verifica. El entrenamiento se hizo por destilacion de conocimiento, tomando las distribuciones top-10 del modelo objetivo como etiquetas suaves combinadas con entropia cruzada sobre la secuencia greedy, sobre un conjunto de 28.500 muestras sinteticas del cluster `wmt16_translate_deen_10templates`. El resultado publicado es un `eval_loss` de 2,307 y una precision top-1 del 52,77% en el checkpoint `checkpoint-6675`.

Su relevancia es acotada pero clara: cuantifica cuanto se gana al especializar un drafter por dominio frente a uno generalista, y lo hace con un modelo de 0,3 GB entrenado en una sola RTX 3090. La licencia Apache 2.0 y el formato safetensors en bfloat16 facilitan su integracion en pipelines de decodificacion especulativa existentes sin coste de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer causal decoder-only) |
| Parametros totales | 156.519.168 (156,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; pesos publicados en bfloat16 |
| Idiomas soportados | en, de (ingles y aleman; dominio de traduccion de aleman a ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16); repo de 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de la familia Mistral, con 156,5 millones de parametros, heredado del drafter `drafter-mixed-ut` y este de `Lite-Mistral-150M-v2-Instruct`. Su funcion es proponer secuencias de tokens que el modelo objetivo, TurboSparse-Mistral-Instruct de 7B (arquitectura BambooForCausalLM, variante dispersa de Mistral), verifica en paralelo dentro del bucle de decodificacion especulativa. El modelo se entreno en bfloat16 sobre una GPU RTX 3090 de 24 GB.

El entrenamiento combina dos objetivos: una funcion de perdida de 0,5 x CrossEntropy mas 0,5 x divergencia KL con temperatura 1,0. La parte de entropia cruzada se calcula sobre la secuencia greedy (trunk) y la parte de KL usa las distribuciones top-10 del modelo objetivo como etiquetas suaves, es decir, destilacion de conocimiento desde el target al drafter. Los datos son 28.500 muestras sinteticas del cluster `wmt16_translate_deen_10templates` del dataset `MikhailRudenko/domain-aware-sd-synthetic`, con 1.500 muestras reservadas para validacion (5%). Se entrenaron 10 epocas con tamano de lote 32, tasa de aprendizaje 5e-5 con schedule coseno y 3% de warmup; el autor indica que el rendimiento se estanca alrededor de la epoca 4. El mejor checkpoint fue `checkpoint-6675`, con `eval_loss` final de 2,307 y precision top-1 de 52,77%. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto causal como drafter: propone continuaciones de tokens que el modelo objetivo valida en decodificacion especulativa.
- Traduccion aleman-ingles en el dominio WMT16, especializada mediante destilacion desde TurboSparse-Mistral-Instruct.
- Modelado de distribuciones de probabilidad sobre el vocabulario del modelo objetivo (entrenado con KL sobre top-10), lo que le permite aproximar el comportamiento del target en ese dominio.
- Manejo de plantillas: el cluster de entrenamiento esta definido como `wmt16_translate_deen_10templates`, es decir, 10 plantillas de prompt distintas.
- Soporte bilingue limitado a en y de; no se declaran otros idiomas.
- No se documentan capacidades de tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo thinking.

## Casos de uso

- Aceleracion de traduccion aleman-ingles en produccion: el drafter se acopla a un modelo objetivo mayor para reducir el numero de pasos de decodificacion en un pipeline de traduccion de documentacion tecnica alemana.
- Servicio de traduccion de atencion al cliente: integrado con un modelo target multilingue, el drafter especializado puede acelerar la generacion de respuestas traducidas en conversaciones con clientes de habla alemana.
- Ajuste fino de infraestructura de inferencia: sirve para medir la ganancia real de un drafter por dominio frente a uno generalista (`drafter-mixed-ut`) en un mismo despliegue, comparando `eval_loss` y precision top-1.
- Investigacion en decodificacion especulativa: es una pieza reproducible del estudio "Domain-Aware Speculative Decoding", con hiperparametros, dataset y checkpoints documentados, util para replicar el experimento con otros pares de idiomas.
- Generacion de subtitulos y localizacion: en pipelines que traducen contenido audiovisual del aleman al ingles, el drafter reduce la latencia por token manteniendo la calidad del modelo target.
- Traduccion por lotes de corpus alemanes: en tareas offline de traduccion masiva, la decodificacion especulativa con drafter de dominio puede mejorar el throughput del servidor sin cambiar la salida final, ya que el target verifica cada token.
- Prototipado en hardware modesto: al ocupar 0,3 GB, permite experimentar con decodificacion especulativa en una sola GPU de consumo mientras el modelo objetivo puede residir en otra GPU o en un servidor remoto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, etc.) en la informacion disponible. El autor unicamente reporta metricas internas de validacion del drafter: `eval_loss` y precision top-1 frente a las distribuciones del modelo objetivo. La tabla comparativa publicada en la model card es la siguiente:

| Modelo | Dominio | eval_loss | top1_acc |
|---|---|---|---|
| drafter-understanding | Comprension (31 clusters) | 2,100 | 65,00% |
| drafter-text-reformulation | Reformulacion de texto (11 clusters) | 2,151 | 54,34% |
| drafter-mixed-ut | Mixto U+T (42 clusters) | 2,085 | 59,50% |
| drafter-wmt16-translate-tren | Turco a ingles | 1,998 | 54,91% |
| drafter-wmt16-translate-ruen | Ruso a ingles | 2,363 | 50,04% |
| drafter-wmt16-translate-csen | Checo a ingles | 2,260 | 49,96% |
| drafter-wmt16-translate-fien | Finés a ingles | 2,252 | 49,36% |
| **drafter-wmt16-translate-deen** | **Aleman a ingles** | **2,307** | **52,77%** |

No se publica la tasa de aceptacion (acceptance rate) ni la ganancia de velocidad (speedup) obtenida al emparejar este drafter con TurboSparse-Mistral-Instruct, que serian las metricas relevantes para decodificacion especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB solo para los pesos en bfloat16, y en torno a 0,5-1 GB contando cache KV y overhead del runtime, aunque el dato exacto no esta publicado.
- El entrenamiento se realizo en una unica RTX 3090 de 24 GB, lo que da una cota superior holgada de los requisitos reales del modelo.
- Cabe en cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, etc.) e incluso en GPUs de gama baja con 4-6 GB, siempre que se ejecute como drafter y no como modelo principal.
- El modelo objetivo asociado, TurboSparse-Mistral-Instruct de 7B, si requiere una GPU con al menos 16 GB en bfloat16 (o menos si se cuantiza), por lo que el coste real del sistema lo determina el target, no el drafter.
- Opciones de despliegue: transformers (uso directo con `AutoModelForCausalLM`), vLLM (soporte de decodificacion especulativa con `draft_model`), llama.cpp u Ollama no estan documentados para este modelo en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de factor de aceleracion.

## Comparativa con modelos similares

La comparativa natural es con los otros drafters del mismo autor, que comparten arquitectura y base (`drafter-mixed-ut`), diferenciandose por el dominio de especializacion.

| Modelo | Parametros | Dominio | eval_loss | top1_acc | Licencia |
|---|---|---|---|---|---|
| drafter-wmt16-translate-deen | 156,5 M | Aleman a ingles | 2,307 | 52,77% | apache-2.0 |
| drafter-mixed-ut | no disponible | Mixto U+T (42 clusters) | 2,085 | 59,50% | no disponible |
| drafter-understanding | no disponible | Comprension (31 clusters) | 2,100 | 65,00% | no disponible |
| drafter-text-reformulation | no disponible | Reformulacion (11 clusters) | 2,151 | 54,34% | no disponible |
| drafter-wmt16-translate-tren | no disponible | Turco a ingles | 1,998 | 54,91% | no disponible |

Observacion: los drafters generalistas o de comprension (`drafter-understanding`, `drafter-mixed-ut`) presentan mejor `eval_loss` y precision top-1 agregada que los drafters de traduccion, pero esa metrica agregada no refleja el rendimiento dentro del dominio concreto. La comparacion con modelos de traduccion dedicados de 150-200 M parametros no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: su salida solo tiene sentido dentro de un bucle de decodificacion especulativa verificado por un modelo objetivo. Usarlo como generador independiente produce una calidad muy inferior a la del target.
- Especificidad de dominio estricta: esta entrenado sobre el cluster `wmt16_translate_deen_10templates`; fuera de la traduccion aleman-ingles en ese formato, su tasa de aceptacion caera y podra incluso ralentizar la decodificacion.
- Precisión top-1 del 52,77%: aproximadamente la mitad de los tokens propuestos coinciden con la eleccion del target en la validacion interna, lo que limita la ganancia practica segun la longitud media de las secuencias aceptadas.
- No se publican tasas de aceptacion ni speedups reales, por lo que el beneficio en produccion no esta cuantificado.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad ni comportamientos indeseados. Al destilar de un modelo objetivo, hereda parcialmente sus sesgos en la medida en que la destilacion top-10 los capture.
- Riesgo de alucinacion: relevante si se usa fuera de su rol de drafter; en decodificacion especulativa el target filtra los tokens, pero el drafter no aporta ninguna garantia propia de fidelidad.
- Cobertura idiomatica limitada a en y de; no hay soporte declarado de otros idiomas.
- Longitud de contexto: no disponible en la informacion proporcionada, lo que impide valorar su comportamiento en documentos largos.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de licencia y el texto de atribucion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, y fecha de creacion muy reciente; no hay validacion externa ni comunidad que haya reproducido los resultados.
- El modelo base de la cadena es un modelo ligero de 150 M (`Lite-Mistral-150M-v2-Instruct`), con las limitaciones de capacidad que ello implica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MikhailRudenko/drafter-wmt16-translate-deen
- Modelo base (drafter mixto U+T): https://huggingface.co/MikhailRudenko/drafter-mixed-ut
- Drafter de comprension: https://huggingface.co/MikhailRudenko/drafter-understanding
- Drafter de reformulacion de texto: https://huggingface.co/MikhailRudenko/drafter-text-reformulation
- Dataset de entrenamiento: https://huggingface.co/datasets/MikhailRudenko/domain-aware-sd-synthetic
- Modelo base de la cadena (Lite-Mistral-150M-v2-Instruct): https://huggingface.co/Felladrin/Lite-Mistral-150M-v2-Instruct
- Los resultados de busqueda web no aportaron enlaces relevantes al modelo (unicamente resultados no relacionados sobre un servicio de correo). No se dispone de paper, blog tecnico, repositorio de codigo ni demo publicados en la informacion disponible.
