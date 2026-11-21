# ewhacc/DeepSeek-V4.1-Flash-1017-Tandem-VQ2

## Resumen
DeepSeek-V4.1-Flash-1017-Tandem-VQ2 es un paquete de pesos cuantizados derivado del checkpoint oficial DeepSeek-V4.1-Flash-1017, publicado por el usuario ewhacc bajo licencia MIT. No es un modelo entrenado desde cero ni una release oficial de DeepSeek: es una re-codificacion de los expertos enrutados del modelo MoE original para poder ejecutarlo en una o dos GPU gracias a Tandem-vLLM, un fork de vLLM con offload de expertos a memoria de host y computo en CPU. El objetivo es claro: reducir la huella en disco y VRAM de un MoE de gran tamano para hacerlo desplegable en hardware de gama alta de consumo y estaciones de trabajo.

El modelo base es un transformer de mezcla de expertos (MoE) con 127.460.775.394 parametros totales segun los safetensors del repo, y el paquete ocupa 313,6 GB en disco. La reduccion se consigue codificando los expertos enrutados de las capas 0-39 como codigos vectoriales de 2 bits (512 patrones de 8 pesos con simetria de signo, mas escalas por super-bloque), manteniendo un subconjunto "caliente" de los 64 expertos mas enrutados por capa en su FP4 original, y recuantizando las dos tablas Engram a 4 bits e2m1. Frente al checkpoint oficial (476 GiB) el paquete ahorra unos 183 GiB.

La relevancia actual es practica: demuestra que un MoE de este tamano puede servirse con decodificacion especulativa (capas MTP incluidas como drafter) en una unica RTX PRO 6000 de 96 GB con 256 GB de RAM, a costa de una perdida medible de calidad en tareas de razonamiento exigente. Es una pieza interesante para laboratorios que quieran experimentar con inferencia de MoE de gran escala sin un cluster de H200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capas MTP para decodificacion especulativa; pesos re-codificados con cuantizacion vectorial de 2 bits y offload de expertos |
| Parametros totales | 127.460.775.394 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el paquete reporta recuperacion de passkey a 94k tokens, sin declarar la ventana maxima) |
| Tipos de cuantizacion | Expertos enrutados en codigos vectoriales de 2 bits (2,10 bits/peso) mas subconjunto FP4; tablas Engram en 4 bits e2m1 con UE8M0 por cada 32 valores; resto de pesos sin cambios (FP8/FP4 del checkpoint oficial) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, empaquetado para vLLM (Tandem-vLLM) |

## Arquitectura y entrenamiento
El modelo subyacente es un MoE con router, expertos compartidos, embeddings, atencion y capas MTP (multi-token prediction) que se usan como drafter especulativo. Este repositorio no entrena nada: parte del checkpoint oficial DeepSeek-V4.1-Flash-1017 y transforma los pesos. Los expertos enrutados de las capas 0-39 se codifican como 512 patrones de 8 pesos con simetria de signo mas escalas por super-bloque, con el redondeo optimizado de extremo a extremo contra las salidas del modelo oficial. Ademas se conserva en FP4 original el conjunto de los 64 expertos mas enrutados de cada capa, ordenados por un conteo de enrutamiento de calibracion (`ranking.tsv`), y el motor sirve los K primeros en FP4. Las dos tablas Engram pasan de FP8 (2 x 96 GiB) a 4 bits e2m1 (2 x 48,6 GiB).

La innovacion tecnica no esta en el modelo sino en el sistema de servicio: Tandem-vLLM mantiene los expertos en RAM de host y los calcula en CPU (o los copia a la GPU) cuando no caben en la cache de VRAM, garantizando que un experto ausente de la cache se computa desde memoria de host y nunca se omite. El paquete incluye las capas MTP para DSpark k=3, que practicamente duplica la velocidad de decodificacion a un solo stream (75,6 a 159,4 tok/s en el caso VQ only). No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni metodos de alineacion del modelo base en la informacion proporcionada.

## Capacidades
- Generacion de texto y razonamiento de nivel alto: el modelo base es un DeepSeek de la familia V4.1, con modo "thinking" configurable (el autor evalua con thinking on y esfuerzo bajo).
- Razonamiento cientifico y de dominio: obtiene 77,4% en GPQA-diamond con el conjunto FP4 caliente, lo que indica capacidad fuerte en preguntas de nivel posgrado.
- Matematicas: 192-195 sobre 200 en GSM8K-200 en todas las configuraciones medidas, practicamente identico al checkpoint oficial (192).
- Recuperacion en contexto largo: 9/9 en passkey retrieval a 8k, 32k y 94k tokens con tres profundidades.
- Codigo: no hay benchmarks de codigo en la informacion disponible; la capacidad heredada del modelo base no se puede verificar aqui.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking y las capas MTP sugieren soporte de generacion extendida, pero no hay datos de evaluacion agentica.
- Multilingue: no disponible; el autor no declara lista de idiomas.
- Decodificacion especulativa integrada mediante capas MTP (DSpark k=3).

## Casos de uso
- Investigacion en inferencia eficiente de MoE: el paquete permite estudiar el compromiso entre cuantizacion agresiva (2 bits) y calidad en un MoE de 127B sin disponer de un cluster, midiendo KL y acuerdos top-1 contra el modelo oficial en una sola GPU.
- Despliegue de razonamiento cientifico en estacion de trabajo: con una RTX PRO 6000 de 96 GB y 256 GB de RAM se obtiene un 77,4% en GPQA-diamond, suficiente para asistentes de analisis tecnico donde no se exige el techo del modelo oficial.
- Servicio multi-usuario con batching continuo: Tandem-vLLM escala a 65/182/284/414 tok/s con 1/4/8/32 streams en VQ only, lo que permite servir a varios clientes simultaneos en un solo nodo.
- Procesamiento de documentos largos: la recuperacion a 94k tokens validada (9/9) lo hace apto para resumen y QA sobre expedientes extensos, siempre que se acepte la ventana no declarada explicitamente.
- Evaluacion comparativa de tecnicas de cuantizacion vectorial: el repo separa `vq/`, `fp4hot/` y las tablas Engram recuantizadas, lo que facilita ablaciones reproducibles sobre el impacto de cada componente.
- Prototipado en hardware de consumo: con una RTX 5090 de 32 GB y 128 GB de DDR4 se obtienen 16-20 tok/s a 1-4 streams, suficiente para demos y pruebas de concepto de un modelo de 127B en local.
- Laboratorios con dos GPU de 16-24 GB: el modo tensor parallel de Tandem-vLLM 0.2.1 permite arrancar el modelo en configuraciones modestas (36,6 tok/s con 2x16 GB), util para docencia y validacion.

## Benchmarks y rendimiento

Calidad frente al checkpoint oficial (una RTX PRO 6000 de 96 GB + EPYC 9534, greedy salvo indicacion, thinking low):

| Configuracion | KL mismo token | Acuerdo top-1 | GPQA-diamond (198 x 3) |
|---|---|---|---|
| Paquete, FP4 top 52 por capa | 0,109 | 0,904 | 77,4% |
| Paquete, solo VQ | 0,151 | 0,877 | 74,1% |

Comparativa directa contra el checkpoint oficial (vLLM 0.32, 4x H200, greedy, thinking low, GPQA 8000 tokens max):

| Prueba | Oficial | FP4 top 52 | Solo VQ |
|---|---|---|---|
| GSM8K-200 | 192 | 194 | 192 |
| GPQA-diamond 198 (una pasada greedy) | 161 (81,3%) | 152 (76,8%) | 145 (73,2%) |
| Passkey 8k/32k/94k x 3 profundidades | 9/9 | 9/9 | 9/9 |

Velocidad de decodificacion (GSM8K-200, un usuario, thinking low, RTX PRO 6000 + EPYC 9534 DDR5-4800):

| Configuracion | Sin drafter | DSpark k=3 |
|---|---|---|
| Solo VQ (cache de expertos 65,5 GiB; 59,5 con drafter) | 75,6 tok/s | 159,4 tok/s |
| FP4 top 52 (28 GiB VQ + 37 GiB FP4; 22 + 37 con drafter) | 67,1 tok/s | 121,6 tok/s |

Throughput de sistema en VQ only, drafter off: 65/182/284/414 tok/s a 1/4/8/32 streams.

Otras GPU (Tandem-vLLM 0.2.0, GSM8K-50, un stream):

| GPU | CPU | tok/s |
|---|---|---|
| 2x RTX PRO 6000 | EPYC 9534 | 93,1 |
| H200 | Threadripper PRO 7965WX, 24 nucleos | 60,7 |
| RTX 6000 Ada 48 GB | EPYC 7F32, 8 nucleos | 25,5 |
| RTX A6000 48 GB | EPYC 7F32, 8 nucleos | 22,1 |
| RTX A6000 + A6000 helper | EPYC 7F32, 8 nucleos | 26,7 |
| 2x 24 GB (main + helper) | EPYC 7F32, 8 nucleos | 21,7 |
| 2x 16 GB (tensor parallel, 0.2.1) | Threadripper PRO 7965WX, 24 nucleos | 36,6 |
| RTX 4090 24 GB (0.2.3) | EPYC 7F32, 8 nucleos | 25,2 |

## Requisitos de hardware
- VRAM: configuracion recomendada de 96 GB de GPU (RTX PRO 6000) con 256 GB de RAM para VQ only, o 288 GB de RAM con FP4 top 52. La cache de expertos ocupa 65,5 GiB (VQ only) o 28 GiB VQ + 37 GiB FP4 (FP4 top 52).
- GPU soportadas por el motor: Blackwell (RTX 50xx, RTX PRO 6000), Hopper (H100/H200), Ada (RTX 40xx, RTX 6000 Ada) y Ampere (RTX 30xx, RTX A6000), con Tandem-vLLM 0.2.0 o superior.
- Configuraciones menores: 48 GB (RTX 6000 Ada, A6000), 32 GB (RTX 5090, mas lento), dos tarjetas de 24 GB en modo main + helper, y dos de 16 GB en tensor parallel (0.2.1). En tarjetas de menos de 48 GB se requiere 0.2.3 o posterior.
- CPU: x86-64 con AVX-512 o AVX2; el rendimiento depende en gran medida de la CPU y del ancho de banda de memoria, porque la CPU calcula los expertos que la GPU no retiene.
- RAM de host: 233 GiB de RSS medidos en VQ only y 270 GiB con FP4 top 52; con 128 GB se usa `RAM_GB=90 ENGRAM=files`, que fija solo los expertos mas enrutados y lee el resto desde disco (mas lento).
- Despliegue: exclusivamente mediante Tandem-vLLM (fork de vLLM 0.31.0 instalado en un venv propio). No hay soporte documentado para llama.cpp, Ollama, TGI ni vLLM estandar.
- Latencia y throughput: ver la tabla de benchmarks; a un stream, 75,6 tok/s sin drafter y 159,4 tok/s con DSpark k=3 en la configuracion recomendada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (oficial) | 127,5B (mismo base) | no disponible | GPQA 81,3%; GSM8K 192/200; requiere 4x H200 y 476 GiB en disco | MIT | Checkpoint oficial de DeepSeek |
| Este paquete (Tandem VQ2) | 127,5B | no disponible | GPQA 76,8% (FP4 top 52) / 73,2% (VQ); GSM8K 192-194/200; 96 GB GPU + 256 GB RAM | MIT | Hugging Face, 775 descargas |
| DeepSeek-V4.1-Flash (version anterior, todos los expertos en FP4) | no disponible | no disponible | KL 0,007 frente al oficial (ruido del propio modelo) | MIT | Mencionado en la model card, sin repositorio enlazado |

La comparacion relevante es contra el propio checkpoint oficial: este paquete pierde entre 4,5 y 8 puntos en GPQA-diamond y mantiene el rendimiento en GSM8K y en recuperacion de contexto largo, a cambio de pasar de 4x H200 a una sola GPU de 96 GB. No se dispone de datos para comparar con otros MoE de tamano similar (por ejemplo, variantes de la familia Qwen o Mixtral) en la informacion proporcionada.

## Limitaciones y advertencias
- No es una release oficial de DeepSeek: es una derivacion no oficial de un tercero (ewhacc). La calidad es inferior al checkpoint original, con perdida significativa y estadisticamente significativa en GPQA-diamond (-4,5 puntos con FP4 top 52, -8 con VQ only).
- La cuantizacion a 2 bits de los expertos degrada el razonamiento complejo; las tareas faciles y la recuperacion en contexto largo no muestran esa perdida, pero no se puede asumir equivalencia en dominios no evaluados (codigo, matematicas avanzadas, agentes).
- Riesgo de alucinacion: no hay evaluacion de veracidad ni de calibracion en la informacion disponible; al ser un modelo de razonamiento con thinking mode, la generacion larga amplifica este riesgo.
- Sesgos: no documentados por el autor; se heredan los del modelo base, sin auditoria publicada.
- Idiomas: la lista de idiomas soportados no esta disponible; el rendimiento fuera del ingles no esta verificado.
- Longitud de contexto: no declarada explicitamente; solo se valida recuperacion hasta 94k tokens.
- Dependencia de un motor no estandar: requiere Tandem-vLLM (fork de vLLM 0.31.0), lo que limita la portabilidad y anade riesgo de mantenimiento. No funciona con vLLM estandar, llama.cpp, Ollama ni TGI.
- Requisitos de RAM elevados: 256-288 GB de memoria de host; con menos RAM el modo `ENGRAM=files` reduce mucho la velocidad.
- Rendimiento muy dependiente de la CPU: en configuraciones con CPU modesta (EPYC 7F32 de 8 nucleos) se baja a 21-27 tok/s por stream.
- Licencia MIT: permite uso comercial, pero al ser una derivacion no oficial conviene revisar los terminos del modelo base y citar correctamente a DeepSeek y al autor del paquete.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/ewhacc/DeepSeek-V4.1-Flash-1017-Tandem-VQ2
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor Tandem-vLLM: https://github.com/ewhacc/tandem
