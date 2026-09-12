# InfiniCloud/gemma-4-26B-A4B-it-GPTQ-INT4-G64

## Resumen

InfiniCloud/gemma-4-26B-A4B-it-GPTQ-INT4-G64 es una version cuantizada a INT4 mediante GPTQ del modelo multimodal google/gemma-4-26B-A4B-it, publicada por InfiniCloud. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 25.805.936.206 parametros totales (unos 25,8 mil millones) y aproximadamente 4 mil millones de parametros activos por token, de ahi la denominacion A4B. El pipeline declarado es image-text-to-text, es decir, acepta imagenes y texto como entrada.

El objetivo de esta distribucion es reducir el espacio ocupado por los pesos de 51,6 GB (BF16 original) a 15,7 GB, una reduccion de alrededor del 70 por ciento, para permitir despliegues con menos VRAM. En concreto, InfiniCloud la creo como opcion de despliegue de Gemma en entornos con una NVIDIA L4 de 24 GB dentro de su plataforma InfiniCloud AI (Shiraito), y como modelo secundario en GPUs de clase 80 GB donde se ejecuta un modelo primario. El formato GPTQ INT4 se eligio deliberadamente porque no requiere aritmetica nativa NVFP4, presente en Blackwell pero no en L4, aunque si exige kernels compatibles con la GPU y el motor de inferencia seleccionados.

La relevancia de la ficha esta en que no es solo un checkpoint cuantizado: el autor publica conjuntamente los pesos calibrados, la configuracion de cuantizacion y los resultados de evaluacion (comparaciones BF16 frente a INT4 en GSM8K y MGSM japones, pruebas de texto japones, JSON aritmetico y JSON de imagen, y un test de memoria con 8k de contexto). El modelo se publica bajo licencia Apache 2.0, con 0 descargas y 0 likes en el momento de la consulta (creado el 12 de septiembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) de la familia Gemma 4; 128 expertos, todos residentes en este despliegue |
| Parametros totales | 25.805.936.206 (25,8 mil millones) |
| Parametros activos | Aproximadamente 4 mil millones por token (designacion A4B) |
| Longitud de contexto | No disponible para el modelo base en la informacion proporcionada. Punto de operacion objetivo declarado: 8192 tokens de contexto total por peticion (entrada + tokens generados + tokens de imagen). Atencion con ventana deslizante de 1024 tokens |
| Tipos de cuantizacion | GPTQ INT4 con tamano de grupo 64 (G64) sobre pesos, formato compressed-tensors. Componentes de procesamiento de imagen y otros parametros excluidos permanecen en BF16. KV cache en BF16 |
| Idiomas soportados | No listados en los metadatos de HuggingFace. La model card documenta explicitamente evaluaciones en japones (MGSM japones) y contenido en ingles y japones (README bilingue) |
| Licencia | apache-2.0 (enlace de licencia: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors con compressed-tensors (INT4 empaquetado + escalas de grupo BF16 + parametros BF16 retenidos) |

Datos adicionales de la distribucion:

| Dato | Valor |
|---|---|
| Payload serializado de parametros (estimacion analitica) | 15.652.016.944 bytes (14,577 GiB) |
| Archivo de pesos generado (medicion independiente) | 15.656.878.852 bytes (14,582 GiB) |
| Tamano del repositorio en HuggingFace | 15,7 GB |
| Tamano del modelo BF16 original (referencia del autor) | Aproximadamente 51,6 GB |
| Motor de inferencia probado | vLLM 0.29.0 |
| Hardware de validacion de inferencia completada | 1x RTX PRO 6000 Blackwell Max-Q 96 GB |
| Modelo base | google/gemma-4-26B-A4B-it |

## Arquitectura y entrenamiento

El modelo base es un transformer con capa de mezcla de expertos: 25,8 mil millones de parametros totales repartidos en 128 expertos, de los cuales se activan aproximadamente 4 mil millones por token. La model card aclara que la designacion A4B se refiere a los parametros activados, y que este despliegue cuantizado mantiene los 128 expertos residentes en memoria, sin offload de pesos a CPU. La atencion emplea ventana deslizante de 1024 tokens para el calculo de la cache KV en regimen estable, lo que sugiere una combinacion de capas de atencion completa y de atencion con ventana local, aunque la informacion proporcionada no detalla el numero de capas de cada tipo. El modelo es una variante instruction-tuned (sufijo -it) y de tipo image-text-to-text, con torre de vision cuyos pesos se mantienen en BF16 tras la cuantizacion.

Sobre el entrenamiento no hay informacion en los datos disponibles: no se especifica el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La innovacion tecnica de esta ficha no esta en el entrenamiento, sino en la distribucion: se trata de pesos calibrados con GPTQ INT4 (grupo 64), empaquetados en formato compressed-tensors, con la configuracion de cuantizacion y los resultados de evaluacion publicados de forma conjunta. El autor justifica esta decision frente a la cuantizacion a 4 bits en tiempo de carga (inflight quantization de bitsandbytes) senalando que los metodos, las capas seleccionadas y las condiciones de calibracion afectan a la calidad de respuesta y al uso de memoria, por lo que una decision de despliegue requiere evaluar la configuracion concreta. El arranque sigue requiriendo cargar el modelo y preparar los kernels de inferencia.

## Capacidades

- Generacion de texto conversacional en modo instruction-tuned, con soporte multi-turno.
- Entrada de imagen (pipeline image-text-to-text): procesamiento de imagenes por peticion, con limite declarado de una imagen y sin video ni audio por peticion en el punto de operacion objetivo.
- Salida estructurada en JSON: el autor reporta pruebas de peticiones de JSON aritmetico y de JSON a partir de imagenes.
- Razonamiento aritmetico y matematico basico: se evaluo con GSM8K y con MGSM en japones.
- Capacidades multilingues: documentadas de forma explicita para japones e ingles en las pruebas del autor; los metadatos de HuggingFace no incluyen una lista de idiomas.
- Razonamiento tipo MoE con 4 mil millones de parametros activos por token, lo que reduce el coste de computo por token frente a un modelo denso del mismo tamano total.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles (el punto de operacion objetivo excluye audio).

## Casos de uso

- Despliegue en una GPU NVIDIA L4 de 24 GB: es el caso de uso declarado por el autor. Con los pesos en 14,582 GiB, queda margen para cache KV, activaciones, espacios de trabajo de MoE y overhead del asignador. Punto de operacion previsto: tensor parallel 1, todos los expertos residentes, sin offload a CPU, 8192 tokens de contexto total, una peticion concurrente, ejecucion eager, KV en BF16, prefix caching desactivado y como maximo una imagen por peticion.
- Modelo secundario junto a un modelo primario en una GPU de clase 80 GB: InfiniCloud plantea esta distribucion para reducir la porcion de VRAM que Gemma ocupa como modelo auxiliar, dejando el resto para el modelo principal, sus caches KV y sus espacios de trabajo. Es adecuado porque el presupuesto de pesos baja de 51,6 GB a 14,582 GiB.
- Procesamiento de documentos con salida JSON: el autor valido peticiones de JSON de imagen, por lo que el modelo encaja en pipelines de extraccion estructurada a partir de capturas, formularios o documentos escaneados, devolviendo campos en JSON en lugar de texto libre.
- Atencion al cliente en japones: se evaluo MGSM en japones y se probaron peticiones de texto japones, lo que respalda su uso en conversaciones multi-turno en ese idioma dentro del limite de 8192 tokens de contexto total.
- Sustitucion de cuantizacion en tiempo de carga: para equipos que hoy usan cuantizacion inflight a 4 bits, este checkpoint permite cargar pesos ya calibrados y comparar la calidad frente a BF16 sin ejecutar la calibracion GPTQ por su cuenta.
- Evaluacion de compromisos de cuantizacion en produccion: el repositorio incluye la configuracion de cuantizacion y los resultados de evaluacion, por lo que sirve como referencia para decidir si la perdida de calidad medida es aceptable antes de comprometer un despliegue.
- Servicio con concurrencia moderada: con 8 peticiones concurrentes a 8192 tokens de contexto, la cache KV BF16 en regimen estable se estima en 2,813 GiB; a 16384 tokens y 8 peticiones, en 4,063 GiB. Son cifras de dimensionamiento para planificar memoria, no puntos de operacion validados en L4.
- Inferencia en GPUs sin aritmetica NVFP4: al usar GPTQ INT4 en lugar de NVFP4, el checkpoint es candidato para hardware que carece de esa capacidad nativa, como la propia L4.

## Benchmarks y rendimiento

El autor declara haber ejecutado una comparacion BF16 frente a INT4 en GSM8K y en MGSM japones, ademas de comprobaciones de texto japones, JSON aritmetico, JSON de imagen y un test de memoria con 8k de contexto. Sin embargo, los valores numericos de esas evaluaciones no aparecen en la informacion proporcionada.

| Benchmark | Resultado |
|---|---|
| GSM8K (BF16 frente a INT4) | Resultados numericos no disponibles en la informacion proporcionada; el autor confirma que la comparacion se realizo |
| MGSM japones (BF16 frente a INT4) | Resultados numericos no disponibles en la informacion proporcionada; el autor confirma que la comparacion se realizo |
| Comprobaciones de texto japones, JSON aritmetico y JSON de imagen | Cualitativas; sin cifras disponibles |
| Test de memoria con 8k de contexto | Datos de planificacion de KV disponibles (tabla siguiente); sin cifras de latencia ni throughput |
| Comparativas de velocidad de inferencia | No realizadas, segun el autor |

Unico dato medido o estimado publicado, correspondiente a la cache KV BF16 en regimen estable con ventana deslizante de 1024 tokens (excluye tokens en prefilling, redondeo por bloques y pools de cache reservadas):

| Contexto total por peticion | Peticiones concurrentes | Contenido KV BF16 ideal en regimen estable |
|---|---:|---:|
| 8192 | 1 | 0,352 GiB |
| 8192 | 8 | 2,813 GiB |
| 16384 | 1 | 0,508 GiB |
| 16384 | 8 | 4,063 GiB |

## Requisitos de hardware

- Pesos: payload serializado de 15.652.016.944 bytes (14,577 GiB) segun la estimacion analitica del autor, y 15.656.878.852 bytes (14,582 GiB) en el archivo de pesos medido. Ninguna de las dos cifras es la VRAM en tiempo de ejecucion.
- VRAM adicional en runtime: el autor advierte que hay que sumar copias de carga, preparacion de kernels, memoria de activaciones y del codificador, espacios de trabajo de MoE, pools de cache y overhead del asignador. No se publica una cifra de VRAM total en ejecucion, y el autor indica explicitamente que no debe inferirse un contexto soportado restando el payload de los 24 GB nominales.
- GPU objetivo declarada: 1x NVIDIA L4 de 24 GB, tensor parallel size 1, todos los expertos residentes, sin offload de pesos a CPU. L4 no ha sido probada; su capacidad real visible por CUDA, la VRAM minima necesaria y el throughput no estan medidos.
- GPU de validacion: las comprobaciones de generacion e inferencia completada se hicieron en una RTX PRO 6000 Blackwell Max-Q de 96 GB.
- Escenario de dos modelos: en una GPU de clase 80 GB, Gemma como modelo secundario. Hay que presupuestar los pesos de ambos modelos, sus caches KV y sus espacios de trabajo, y fijar el presupuesto de memoria de cada proceso de inferencia por separado.
- GPU de consumo: no disponible. No hay datos publicados para RTX 4090 u otras GPU de 24 GB de consumo; la unica referencia de 24 GB es la L4, que no se ha validado.
- Motor de despliegue: vLLM 0.29.0 es la version probada. La carga ordinaria con Transformers tiene limitaciones con este formato comprimido. No se mencionan soporte para llama.cpp, Ollama, TGI ni otros motores, ni se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles. El autor indica que no se han realizado comparativas de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano de pesos | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| InfiniCloud/gemma-4-26B-A4B-it-GPTQ-INT4-G64 | 25,8 mil millones totales, aprox. 4 mil millones activos | Punto de operacion objetivo 8192 tokens totales; maximo del base no disponible | safetensors compressed-tensors, GPTQ INT4 G64; 14,582 GiB | Sin cifras publicadas en la informacion disponible | apache-2.0 | HuggingFace, 0 descargas y 0 likes en la consulta; requiere vLLM 0.29.0 |
| google/gemma-4-26B-A4B-it (BF16) | 25,8 mil millones totales, aprox. 4 mil millones activos | No disponible | BF16; aproximadamente 51,6 GB | Referencia de comparacion del autor en GSM8K y MGSM japones, sin cifras disponibles | apache-2.0 (segun el modelo base) | Modelo base en HuggingFace |
| Cuantizacion a 4 bits en tiempo de carga (por ejemplo, inflight quantization de bitsandbytes) | Igual que el modelo base | Igual que el modelo base | Pesos en BF16 cargados y cuantizados al vuelo | Depende de la configuracion y calibracion elegidas | Segun el modelo base | Disponible como opcion del motor de inferencia |
| Formato NVFP4 | Igual que el modelo base | Igual que el modelo base | 4 bits con aritmetica nativa NVFP4 | No disponible | Segun el modelo base | Requiere hardware con soporte NVFP4; no apto para L4 |

No se dispone de datos de otros checkpoints cuantizados de terceros para este modelo base, por lo que la comparativa se limita a las alternativas mencionadas por el propio autor.

## Limitaciones y advertencias

- La cuantizacion INT4 introduce una perdida de calidad frente a BF16. El autor la midio en GSM8K y MGSM japones, pero no publica en la informacion disponible las cifras que permitan dimensionarla.
- El modelo no ha sido probado en NVIDIA L4, que es precisamente el hardware objetivo. La capacidad visible por CUDA, la VRAM minima necesaria y el throughput en L4 estan sin medir.
- No se han realizado comparativas de velocidad de inferencia: no hay datos de latencia ni de tokens por segundo.
- El tamano de los archivos de pesos no equivale a la VRAM en ejecucion. Hay que anadir copias de carga, preparacion de kernels, memoria de activaciones y del codificador, espacios de trabajo de MoE, pools de cache y overhead del asignador.
- La cache KV ocupa memoria fisica independiente incluso en las capas de atencion completa; los pesos fuente de K y V no la eliminan.
- Los valores de la tabla de KV son ideales en regimen estable y excluyen tokens en prefilling, redondeo por bloques y pools reservadas. Las filas de 16384 tokens y de 8 peticiones concurrentes son ejemplos de dimensionamiento, no puntos de operacion validados en L4. No debe deducirse un contexto soportado restando el payload de los 24 GB nominales.
- Este despliegue mantiene los 128 expertos residentes, por lo que el ahorro de VRAM respecto al BF16 proviene de la precision de los pesos y no de reducir el numero de expertos activos.
- La carga con Transformers estandar presenta limitaciones con el formato compressed-tensors; el motor probado es vLLM 0.29.0, y se requieren kernels compatibles con la GPU y el motor elegidos.
- Los metadatos de HuggingFace no listan idiomas soportados. Las evaluaciones documentadas se limitan a japones e ingles, por lo que el comportamiento en otros idiomas no esta respaldado por pruebas publicadas en esta distribucion.
- No hay informacion sobre sesgos, datos de entrenamiento, composicion del dataset ni procesos de alineamiento del modelo base en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se han publicado tasas de alucinacion especificas para este checkpoint.
- La licencia declarada es apache-2.0, con enlace adicional a la licencia de Gemma 4. Conviene revisar los terminos de uso de Gemma antes de un despliegue comercial, ya que el repositorio referencia ambos documentos.
- El repositorio registra 0 descargas y 0 likes, y fue creado el 12 de septiembre de 2026, por lo que no existe aun validacion por parte de la comunidad.
- Soporte de tool calling, agentes, modo thinking y audio: no disponible o no contemplado en el punto de operacion objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/InfiniCloud/gemma-4-26B-A4B-it-GPTQ-INT4-G64
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Vision general de NVFP4 de NVIDIA: https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/
- Soporte de hardware por metodo de cuantizacion en vLLM (v0.29.0): https://docs.vllm.ai/en/v0.29.0/features/quantization/#supported-hardware
- Cuantizacion a 4 bits en tiempo de carga en vLLM (bitsandbytes): https://docs.vllm.ai/en/v0.29.0/features/quantization/bnb/#inflight-quantization-load-as-4bit-quantization
- Evidencia de planificacion de VRAM citada por el autor: evidence/vram-planning-preflight.json (ruta relativa dentro del repositorio)
- README en japones citado en la model card: README.ja.md (ruta relativa dentro del repositorio)
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos fueron paginas de cotizacion de oro (gold.co.uk), sin relacion con el modelo.
