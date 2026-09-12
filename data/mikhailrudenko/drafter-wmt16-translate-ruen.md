# MikhailRudenko/drafter-wmt16-translate-ruen

## Resumen

El modelo `MikhailRudenko/drafter-wmt16-translate-ruen` es un modelo borrador (drafter) de dominio especifico disenado para decodificacion especulativa (speculative decoding) en tareas de traduccion de ruso a ingles. Lo desarrolla el autor independiente MikhailRudenko como parte de su proyecto de investigacion Domain-Aware Speculative Decoding, cuya hipotesis es que un drafter especializado por dominio alcanza tasas de aceptacion superiores a las de un unico drafter de proposito general. Cuenta con 156.519.168 parametros exactos y esta construido sobre `MikhailRudenko/drafter-mixed-ut`, que a su vez deriva de Lite-Mistral-150M-v2-Instruct.

Su funcion no es generar texto de forma autonoma, sino proponer secuencias de tokens que un modelo objetivo de mayor tamano (en este caso TurboSparse-Mistral-Instruct de 7B, con arquitectura BambooForCausalLM) verifica en paralelo. El drafter se entrena mediante destilacion de conocimiento a partir de las distribuciones top-10 del modelo objetivo sobre el cluster `wmt16_translate_ruen_10templates` del dataset Flan, con 28.500 muestras sinteticas y 1.500 de validacion. En su mejor checkpoint (step 7565) alcanza un `eval_loss` de 2.363 y una `top1_accuracy` de 50,04 %.

Es relevante ahora porque la decodificacion especulativa se ha convertido en la tecnica estandar para reducir la latencia de inferencia en modelos grandes sin degradar la calidad de salida, y este modelo aporta datos concretos sobre cuanto se gana al especializar el drafter por dominio. Se publica bajo licencia Apache 2.0, con pesos en safetensors y precision bfloat16, en un repositorio de 0,3 GB, lo que lo hace desplegable en cualquier GPU de consumo e incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer decoder-only denso), clase de drafter para decodificacion especulativa |
| Parametros totales | 156.519.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; sin variantes GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | en (ingles), ru (ruso) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

Datos adicionales de la model card: modelo base `MikhailRudenko/drafter-mixed-ut`; modelo objetivo TurboSparse-Mistral-Instruct (7B, BambooForCausalLM); dominio WMT16 Translation Russian to English; cluster de entrenamiento `wmt16_translate_ruen_10templates`; precision de entrenamiento bfloat16.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Mistral (MistralForCausalLM) con 156 millones de parametros, derivado por fine-tuning de `MikhailRudenko/drafter-mixed-ut`, que a su vez parte de Lite-Mistral-150M-v2-Instruct. El modelo se emplea exclusivamente como borrador dentro de un esquema de decodificacion especulativa: propone varios tokens candidatos que el modelo objetivo de 7B verifica en una sola pasada, de modo que la ganancia real depende de la tasa de aceptacion de esas propuestas.

El entrenamiento combina dos senales de perdida en partes iguales: 0,5 x entropia cruzada sobre la secuencia greedy (trunk) y 0,5 x divergencia KL con temperatura 1,0 frente a las distribuciones top-10 del modelo objetivo. Los datos son 28.500 muestras sinteticas generadas por destilacion desde TurboSparse-Mistral-Instruct sobre el cluster `wmt16_translate_ruen_10templates` del dataset Flan (plantillas de traduccion ruso-ingles), con 1.500 muestras reservadas para validacion (5 %). La configuracion de entrenamiento es de 10 epocas con plateau alrededor de la 5, batch size 32, learning rate 5e-5 con schedule coseno y 3 % de warmup, sobre una unica RTX 3090 de 24 GB. El mejor checkpoint es el 7565, con `eval_loss` final de 2.363 y `top1_accuracy` de 50,04 %. No se documenta uso de RLHF ni DPO: la innovacion tecnica es precisamente la destilacion guiada por el propio objetivo y la especializacion por dominio del drafter.

## Capacidades

- Proposicion de tokens para decodificacion especulativa en el par de idiomas ruso a ingles, dentro del dominio WMT16 (texto periodistico y traduccion generica).
- Destilacion de las distribuciones top-10 del modelo objetivo TurboSparse-Mistral-Instruct (7B, BambooForCausalLM), lo que alinea sus propuestas con la politica del verificador.
- Generacion de texto autorregresiva basica (pipeline `text-generation`), suficiente para producir borradores de traduccion cuando se usa de forma aislada.
- Integracion con frameworks que soportan speculative decoding siempre que se empareje con el modelo objetivo para el que fue entrenado.
- Soporte de tool calling: no disponible / no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible / no documentado.
- Capacidades multilingues: limitadas a ingles y ruso; no cubre otros pares de idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Aceleracion de traduccion ruso-ingles en produccion: emparejar el drafter con TurboSparse-Mistral-Instruct 7B en vLLM o TGI para reducir el numero de pasadas forward del modelo grande; al estar entrenado sobre el mismo dominio, las propuestas deberian aceptarse con mayor frecuencia que con un drafter generico.
- Traduccion por lotes de documentacion tecnica rusa: en pipelines offline sobre el cluster WMT16 el drafter aporta valor cuando el cuello de botella es la latencia del modelo de 7B, no el coste de almacenamiento.
- Investigacion en decodificacion especulativa domain-aware: el modelo es una pieza de un estudio comparativo con seis drafters por par de idiomas y tres drafters generalistas, util para medir tasas de aceptacion y validar la hipotesis central del proyecto.
- Prototipado y benchmarking en hardware modesto: con 156M de parametros y 0,3 GB de pesos, se puede reproducir el experimento completo en una unica RTX 3090 o en un portatil con GPU de 8 GB, sin acceso a A100/H100.
- Traduccion interactiva de baja latencia: en un asistente de traduccion ruso-ingles donde el usuario espera respuesta inmediata, el drafter reduce el tiempo por token del verificador de 7B.
- Generacion de datos sinteticos y destilacion: la metodologia (etiquetas suaves top-10 + entropia cruzada sobre la secuencia greedy) sirve como plantilla para crear drafters especializados en otros dominios o pares de idiomas.
- Evaluacion de infraestructura de inferencia: medir acceptance rate, throughput y latencia antes de escalar un servicio de traduccion, con un coste de GPU minimo.
- Base para fine-tuning posterior: al estar bajo Apache 2.0, se puede reentrenar sobre otro dominio o par linguistico partiendo de sus pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, etc.) en la informacion disponible. La model card unicamente reporta metricas internas de destilacion y una comparativa entre los drafters del mismo proyecto:

| Modelo | Dominio | eval_loss | top1_accuracy |
|---|---|---|---|
| drafter-understanding | Understanding (31 clusters) | 2.100 | 65,00 % |
| drafter-text-reformulation | Text Reformulation (11 clusters) | 2.151 | 54,34 % |
| drafter-mixed-ut | Mixed U+T (42 clusters) | 2.085 | 59,50 % |
| drafter-wmt16-translate-tren | Turco a ingles | 1.998 | 54,91 % |
| drafter-wmt16-translate-deen | Aleman a ingles | 2.307 | 52,77 % |
| drafter-wmt16-translate-ruen | Ruso a ingles | 2.363 | 50,04 % |
| drafter-wmt16-translate-csen | Checo a ingles | 2.260 | 49,96 % |
| drafter-wmt16-translate-fien | Finés a ingles | 2.252 | 49,36 % |

No se han publicado tasas de aceptacion (acceptance rate), speedup ni mediciones de latencia end-to-end en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 0,31 GB solo en pesos bfloat16 (156,5M de parametros) y del orden de 0,5-0,8 GB contando overhead de runtime y cache; en float32 serian unos 0,63 GB de pesos.
- VRAM estimada para el sistema completo: si se usa con el modelo objetivo TurboSparse-Mistral-Instruct 7B en bfloat16, hay que sumar unos 14 GB de pesos mas cache KV, por lo que se recomienda una GPU de 24 GB.
- GPU recomendadas: el entrenamiento se realizo en 1x RTX 3090 (24 GB). Para inferencia basta cualquier GPU con al menos 8 GB si el modelo objetivo se cuantiza, o una RTX 3090/4090 (24 GB) con el objetivo en bfloat16.
- Cabe en GPU de consumo: si, sin ninguna duda; el drafter por si solo cabe incluso en GPUs de gama baja o en CPU.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`) de forma nativa; vLLM y TGI admiten speculative decoding con modelo borrador; llama.cpp/Ollama requeririan una conversion a GGUF que no se distribuye oficialmente.
- Latencia y throughput estimados: no disponible. El unico dato de rendimiento publicado es `top1_accuracy` = 50,04 % y `eval_loss` = 2.363 sobre el conjunto de validacion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento estandar para comparar con drafters de terceros (EAGLE, Medusa, drafters de Qwen o Llama). La comparativa posible es dentro de la propia familia, usando las metricas publicadas en la model card:

| Modelo | Parametros | Dominio | eval_loss | top1_accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| drafter-wmt16-translate-ruen | 156,5M | Ruso a ingles (WMT16) | 2.363 | 50,04 % | Apache 2.0 | HuggingFace |
| drafter-mixed-ut | no disponible | Mixto U+T (42 clusters) | 2.085 | 59,50 % | no disponible | HuggingFace |
| drafter-wmt16-translate-deen | no disponible | Aleman a ingles (WMT16) | 2.307 | 52,77 % | no disponible | HuggingFace |
| drafter-understanding | no disponible | Understanding (31 clusters) | 2.100 | 65,00 % | no disponible | HuggingFace |

El drafter generalista `drafter-mixed-ut` presenta mejor `eval_loss` y `top1_accuracy` globales, pero esa metrica se mide sobre su propio conjunto agregado de 42 clusters; la comparacion solo es concluyente si se evalua la tasa de aceptacion real por dominio, dato que no se ha publicado.

## Limitaciones y advertencias

- No es un modelo de generacion autonoma: su diseno es el de un borrador para decodificacion especulativa. Usado en solitario, su calidad de traduccion sera la de un modelo de 156M de parametros, notablemente inferior a la de un modelo de 7B.
- La tasa de aceptacion reportada depende del emparejamiento exacto con TurboSparse-Mistral-Instruct (7B, BambooForCausalLM). Con otro modelo objetivo, la `top1_accuracy` de 50,04 % no es extrapolable.
- Cobertura linguistica restringida a ruso e ingles y al dominio WMT16; el rendimiento fuera de ese registro (texto legal, medico, conversacional coloquial) no esta documentado y previsiblemente caera.
- `top1_accuracy` del 50,04 %, la mas baja de los seis drafters de traduccion del proyecto: el par ruso-ingles es el que peor se ajusta con esta metodologia, lo que sugiere una ganancia de speedup menor.
- Riesgo de alucinacion: el drafter hereda los sesgos y errores del modelo objetivo a traves de la destilacion top-10, y el conjunto de datos son muestras sinteticas, no traducciones humanas verificadas.
- Longitud de contexto no especificada en la model card: se desconoce el limite maximo de tokens que el borrador maneja correctamente, dato critico para planificar la decodificacion especulativa.
- Sesgos conocidos: no documentados por el autor. Al derivar de WMT16 y de las distribuciones de un modelo instruct, puede reflejar sesgos de genero, nacionalidad o registro presentes en corpus periodisticos.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el fichero NOTICE si existe; no hay clausulas de uso aceptable adicionales documentadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion externa de terceros: conviene tratarlo como artefacto de investigacion, no como componente de produccion validado.
- Ausencia de variantes cuantizadas oficiales (GGUF, AWQ, GPTQ) limita el despliegue directo en llama.cpp u Ollama sin conversion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MikhailRudenko/drafter-wmt16-translate-ruen
- Modelo base (drafter mixto U+T): https://huggingface.co/MikhailRudenko/drafter-mixed-ut
- Modelo base original (Lite-Mistral-150M-v2-Instruct): https://huggingface.co/Felladrin/Lite-Mistral-150M-v2-Instruct
- Modelo objetivo (TurboSparse-Mistral-Instruct, 7B): no se ha proporcionado enlace directo en la informacion disponible
- Dataset de entrenamiento (MikhailRudenko/domain-aware-sd-synthetic): https://huggingface.co/datasets/MikhailRudenko/domain-aware-sd-synthetic
- Drafters relacionados del mismo proyecto: https://huggingface.co/MikhailRudenko/drafter-understanding, https://huggingface.co/MikhailRudenko/drafter-text-reformulation
- Otros pares de idiomas del mismo proyecto: drafter-wmt16-translate-tren, drafter-wmt16-translate-deen, drafter-wmt16-translate-csen, drafter-wmt16-translate-fien (enlaces bajo el mismo autor en HuggingFace)
- Paper o blog tecnico del proyecto: no disponible
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido comercial de una papelería del Reino Unido), por lo que no se incluye ningun enlace adicional.
