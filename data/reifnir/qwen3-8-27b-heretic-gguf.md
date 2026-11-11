# reifnir/Qwen3.8-27B-heretic-GGUF

## Resumen

Qwen3.8-27B-heretic-GGUF es una coleccion de cuantizaciones GGUF del modelo reifnir/Qwen3.8-27B-heretic, que a su vez es una version del Qwen/Qwen3.8-27B de Alibaba Qwen a la que se le ha eliminado el comportamiento de rechazo mediante la herramienta heretic 2.0.0 (variante ARA). El modelo conserva la arquitectura y el conocimiento del original, pero responde a peticiones que el modelo base declina. La publicacion corre a cargo del usuario reifnir y se distribuye con licencia Apache 2.0.

El interes practico de este repositorio esta en el formato: ofrece pesos GGUF listos para llama.cpp con una asignacion de cuantizacion mixta por tensor (RCO) heredada de ISTA-DASLab, con dos variantes de 3 bits (IQ3_S e IQ3_XXS) mas un proyector de vision en BF16. Con 26.895.998.464 parametros totales y un tamano de repositorio de 22,8 GB, el objetivo es ejecutar un modelo de ~27B con vision en hardware de consumo o en una sola GPU profesional.

Es relevante ahora porque combina tres piezas poco habituales: abliteracion medida con metricas de divergencia KL, cuantizacion mixta por tensor con importance matrix y soporte multimodal image-text-to-text en formato GGUF. No obstante, el propio autor advierte de que las cifras de eliminacion de rechazos se midieron solo sobre el modelo BF16 original, no sobre estas cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; transformer multimodal image-text-to-text) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (3,50 bpw), IQ3_XXS (3,00 bpw); proyector de vision en BF16 (16 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj GGUF para vision |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada: no se detalla si es un transformer denso, MoE o hibrido, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO. Lo unico confirmado es que el pipeline es image-text-to-text, que los pesos originales suman 26.895.998.464 parametros y que el tokenizador procede de Qwen/Qwen3.8-27B.

La innovacion tecnica de este repositorio esta en el proceso de cuantizacion. Cada tensor recibe el tipo de cuantizacion que RCO asigno en DASLab/Qwen3.8-27B-GSQ-RCO-GGUF (commit d562806dbafa), de modo que el reparto por tensor y los tamanos de fichero coinciden exactamente con los de referencia. Se uso llama-quantize estandar de llama.cpp b12004 (imagen oficial full-cuda) con redondeo round-to-nearest simple, sin el redondeo aprendido GSQ de DASLab, cuyo tooling no es publico. La importance matrix empleada es la de DASLab (imatrix-qwen3.8-27b.gguf), calculada sobre el Qwen3.8-27B original y no sobre el modelo abliterado. Los ficheros no incluyen la cabeza MTP (multi-token prediction), por lo que no admiten decodificacion especulativa MTP. La abliteracion se realizo con heretic 2.0.0 (ARA), seleccionando el ensayo 468 de unos 500: 0 de 100 respuestas coincidieron con las frases de rechazo de heretic, con una divergencia KL de primer token de 0,0338 respecto al original en prompts inocuos.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag conversational del repositorio.
- Entrada de imagen: el pipeline image-text-to-text y el fichero mmproj-Qwen3.8-27B-heretic-BF16.gguf habilitan el procesamiento de imagenes junto a texto.
- Respuesta a peticiones que el modelo original rechaza, tras la eliminacion del comportamiento de rechazo medida en BF16.
- Capacidades de razonamiento, codigo y matematicas: no documentadas explicitamente en la informacion disponible, aunque se heredan del modelo base Qwen3.8-27B.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas.
- Modo thinking: no disponible.
- Decodificacion especulativa MTP: no soportada, los ficheros no incluyen la cabeza MTP.

## Casos de uso

- Despliegue local en una sola GPU de consumo o profesional: con IQ3_S (11,8 GB) el modelo cabe en tarjetas de 16 GB o mas, lo que permite ejecutar un modelo de ~27B con vision sin infraestructura de centro de datos.
- Procesamiento de documentos con imagenes: usando el mmproj BF16 junto al modelo principal en llama-server, se pueden enviar capturas, diagramas o paginas escaneadas y obtener descripciones o extraccion de informacion en texto.
- Investigacion sobre alineacion y abliteracion: el repositorio permite reproducir el efecto de heretic sobre un modelo de ~27B y comparar la divergencia KL frente al original, util para estudiar que se pierde al eliminar los rechazos.
- Evaluacion de cuantizacion mixta: los ficheros IQ3_S e IQ3_XXS, con sus tablas de PPL y KLD frente a BF16, sirven como banco de pruebas para medir el coste de bajar de 3,5 a 3,0 bpw en un modelo de este tamano.
- Prototipado de asistentes sin filtros de rechazo en entornos controlados: para pruebas internas de robustez, red teaming o generacion de contenido que el modelo base declina, siempre con salvaguardas propias.
- Inferencia en CPU o entornos sin CUDA: al ser GGUF, se puede ejecutar con llama.cpp en CPU o con aceleracion parcial, aunque el rendimiento no esta documentado.

## Benchmarks y rendimiento

Los unicos datos publicados son de perplejidad y divergencia KL sobre wikitext-2 (100 fragmentos de 512 tokens), medidos con llama.cpp b12004 (imagen oficial CUDA 12.8) en una RTX PRO 6000 Blackwell. La KLD y la coincidencia de token superior se comparan contra este mismo modelo abliterado en BF16.

| Modelo | PPL | KLD media | Mismo token superior |
|---|---|---|---|
| Qwen3.8-27B-heretic, BF16 | 6,7749 | 0 | 100% |
| Qwen3.8-27B-heretic-RCO-IQ3_S (este repo) | 6,9318 | 0,0602 | 89,06% |
| Qwen3.8-27B-heretic-RCO-IQ3_XXS (este repo) | 7,3254 | 0,1084 | 86,17% |
| DASLab Qwen3.8-27B-GSQ-RCO-IQ3_S (referencia) | 6,8519 | 0,0550 | 89,50% |
| DASLab Qwen3.8-27B-GSQ-RCO-IQ3_XXS (referencia) | 7,0873 | 0,1028 | 86,11% |

Advertencia del autor: las filas de DASLab no son comparaciones homogeneas, ya que ellos cuantizaron el Qwen3.8-27B original sin abliterar, por lo que su KLD frente a este modelo incluye tanto su error de cuantizacion como la diferencia por abliteracion. No hay benchmarks de tarea (MMLU, HumanEval, GSM8K), pruebas de contexto largo ni pruebas de vision para estos ficheros.

## Requisitos de hardware

- VRAM estimada: IQ3_S ocupa 11,8 GB y IQ3_XXS 10,1 GB; el proyector de vision BF16 anade 0,9 GB. En total, alrededor de 12,7 GB con vision en IQ3_S.
- GPU recomendadas: RTX PRO 6000 Blackwell es la usada para las mediciones; cualquier GPU con 16 GB o mas deberia alojar IQ3_S con vision.
- GPU de consumo: si, cabe en tarjetas de 16 GB (por ejemplo, RTX 4080/4090 de 16-24 GB) y en 24 GB con margen amplio. En 12 GB no cabe el modelo completo con vision.
- Opciones de despliegue: llama.cpp (llama-server, llama-quantize), con soporte de mmproj para vision. vLLM, TGI y Ollama no se mencionan en la documentacion.
- Comando de referencia: llama-server -m Qwen3.8-27B-heretic-RCO-IQ3_S.gguf --mmproj mmproj-Qwen3.8-27B-heretic-BF16.gguf -ngl 99 --jinja.
- Nota de compilacion: usar CUDA 12.x. En las pruebas a b12004, una compilacion con CUDA 13.2 produjo salida basura de los tensores IQ3 en Blackwell (perplejidad en cientos de miles), tanto en estos ficheros como en los de DASLab. Las builds oficiales con CUDA 12.8 funcionan correctamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| reifnir/Qwen3.8-27B-heretic-GGUF (este) | ~26,9B | no disponible | IQ3_S, IQ3_XXS, mmproj BF16 | Apache 2.0 | Abliterado, vision, redondeo round-to-nearest |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | ~26,9B (mismo base) | no disponible | IQ3_S, IQ3_XXS | no disponible | Sin abliterar, redondeo GSQ aprendido, mejor KLD |
| reifnir/Qwen3.8-27B-heretic (BF16) | ~26,9B | no disponible | BF16 | Apache 2.0 | Referencia de calidad y de medicion de rechazos |
| Qwen/Qwen3.8-27B | ~26,9B | no disponible | BF16 y otras | no disponible | Modelo original con rechazos intactos |

La comparacion directa solo es posible contra el modelo base y su version BF16 abliterada, ya que no se aportan datos de otros modelos de tamano similar. Frente a DASLab, la diferencia medible es de KLD: 0,0602 frente a 0,0550 en IQ3_S, y 0,1084 frente a 0,1028 en IQ3_XXS, con la salvedad de que las filas de DASLab corresponden al modelo sin abliterar.

## Limitaciones y advertencias

- El modelo tiene eliminado el comportamiento de rechazo: intentara peticiones que el original declina y seguira instrucciones inyectadas a traves de ficheros, paginas web o salida de herramientas. No se le debe dar acceso a shell o herramientas sobre contenido no confiable.
- Aunque 0 de 100 respuestas coincidieron con las frases de rechazo de heretic, un clasificador que cuenta rechazos parciales siguio marcando 36 de 100 respuestas: cabe esperar respuestas con reservas o matices, pero pocos rechazos directos.
- Las metricas de abliteracion se midieron solo sobre el modelo BF16, no se volvieron a medir sobre estas cuantizaciones.
- La importance matrix se calculo sobre el modelo original sin abliterar, no sobre esta variante.
- No se han publicado pruebas de tarea, de contexto largo ni de vision para estos ficheros; solo perplejidad y KLD en wikitext-2.
- IQ3_XXS se aleja casi el doble que IQ3_S (KLD 0,108 frente a 0,060) y sube la perplejidad de 6,77 a 7,33; el autor lo desaconseja salvo que IQ3_S no quepa.
- Los ficheros no incluyen la cabeza MTP, por lo que no se puede usar decodificacion especulativa MTP.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan del modelo base y no se han evaluado tras la abliteracion.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero la eliminacion de rechazos traslada al desplegador la responsabilidad de anadir salvaguardas antes de exponer el modelo a terceros.
- En builds propias de llama.cpp con CUDA 13.2 sobre Blackwell se produce salida corrupta con tensores IQ3; usar CUDA 12.x.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reifnir/Qwen3.8-27B-heretic-GGUF
- Modelo BF16 abliterado (base): https://huggingface.co/reifnir/Qwen3.8-27B-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones de referencia DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF/tree/d562806dbafae37109975e970aae91b43e73b440
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Paper RCO: https://arxiv.org/abs/2605.00649
- Paper GSQ: https://arxiv.org/abs/2604.18556
