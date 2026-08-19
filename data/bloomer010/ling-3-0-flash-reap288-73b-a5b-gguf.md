# bloomer010/Ling-3.0-flash-REAP288-73B-A5B-GGUF

## Resumen

Ling-3.0-flash-REAP288-73B-A5B-GGUF es una variante podada del modelo de mezcla de expertos (MoE) inclusionAI/Ling-3.0-flash, publicada por el usuario bloomer010. El modelo original presenta 124.000 millones de parametros totales con 5.100 millones activos; esta version reduce los parametros totales a 73.293.449.216 (73B) manteniendo intactos los 5.100 millones activos. La poda se realiza mediante el metodo REAP (Router-weighted Expert Activation Pruning, arXiv:2510.13999), una tecnica one-shot que elimina el 44% de los expertos enrutados por capa, pasando de 512 a 288 expertos.

La relevancia de este modelo radica en que permite ejecutar un MoE de gran tamano con una huella de memoria significativamente reducida, especialmente en entornos con recursos limitados o con descarga de expertos a CPU. Al no requerir reentrenamiento ni fine-tuning posterior, la poda se realiza de forma inmediata sobre el modelo base, lo que facilita su despliegue en produccion. El repositorio ofrece cuantizaciones GGUF (MXFP4, Q4_K_M, Q3_K_M, Q2_K) y requiere una version especifica de llama.cpp con soporte para la arquitectura `bailingmoe3`, pendiente de fusionar en el upstream mediante el PR #26608.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con poda REAP sobre base Ling-3.0-flash (arquitectura bailingmoe) |
| Parametros totales | 73.293.449.216 (73B) |
| Parametros activos | 5.100 millones (5.1B) |
| Longitud de contexto | no disponible (configurable en inferencia; el comando de ejemplo usa 65536 tokens) |
| Tipos de cuantizacion | MXFP4, Q4_K_M, Q3_K_M, Q2_K (formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors del modelo base no incluidos en este repo) |

## Arquitectura y entrenamiento

El modelo parte de inclusionAI/Ling-3.0-flash, un MoE con 124B parametros totales y 5.1B activos. La poda se realiza mediante REAP (Router-weighted Expert Activation Pruning), un metodo one-shot que puntua cada experto en funcion del producto entre el valor de la puerta del router y la norma L2 de su salida, calculado sobre datos de calibracion. Los expertos con menor puntuacion se eliminan directamente, sin ningun tipo de fine-tuning ni entrenamiento de recuperacion. En este caso, se conservan 288 de los 512 expertos enrutados por capa, lo que supone eliminar el 44% de los expertos.

El proceso de calibracion utilizo 1 millon de tokens con una distribucion de 50% ultrachat, 25% wikitext y 25% codigo. Esta mezcla busca preservar las capacidades conversacionales, de razonamiento sobre texto y de generacion de codigo del modelo original. Al no haber reentrenamiento, el rendimiento puede degradarse ligeramente respecto al modelo base, aunque los parametros activos se mantienen intactos, por lo que la velocidad de inferencia por token deberia ser similar a la de un modelo de 5.1B activos.

## Capacidades

- Generacion de texto conversacional: el modelo base esta orientado a dialogos y la calibracion incluye datos de ultrachat, lo que sugiere un buen comportamiento en tareas de chat multi-turno.
- Generacion de codigo: la inclusion de un 25% de datos de codigo en la calibracion busca preservar esta capacidad.
- Inferencia con descarga de expertos a CPU: el formato GGUF y el soporte para `bailingmoe3` permiten cargar los expertos en RAM y mantener la atencion en GPU, reduciendo drasticamente los requisitos de VRAM.
- Compatibilidad con llama.cpp: una vez fusionado el PR #26608, cualquier build reciente de llama.cpp podra cargar estos archivos directamente. Mientras tanto, se proporciona un fork especifico.
- Capacidades del modelo base: al ser una poda del modelo Ling-3.0-flash, hereda sus capacidades generales, aunque no se detallan en la informacion disponible (vision, tool calling, etc. no confirmados).

## Casos de uso

- Despliegue local en hardware limitado: gracias a la poda y a las cuantizaciones GGUF, es posible ejecutar un MoE de 73B en equipos con 24-32 GB de VRAM combinada con RAM, usando la estrategia de offloading de expertos a CPU.
- Atencion al cliente automatizada: con una ventana de contexto configurable de hasta 65536 tokens, puede gestionar conversaciones largas y mantener el historial completo en entornos de soporte tecnico o comercial.
- Asistente de codigo en entornos sin GPU potente: al estar calibrado con datos de codigo y mantener 5.1B parametros activos, puede ofrecer autocompletado y generacion de funciones en editores locales con latencia aceptable en CPU.
- Prototipado rapido de agentes conversacionales: su compatibilidad con endpoints y su formato GGUF facilitan la integracion en frameworks como llama.cpp server o herramientas de prototipado que usen la interfaz OpenAI-compatible.
- Investigacion sobre poda de MoE: al ser un ejemplo real de aplicacion de REAP sin fine-tuning, resulta util para estudiar el impacto de la poda de expertos en el rendimiento y la calidad de la generacion.
- Inferencia en entornos de edge computing: la cuantizacion Q2_K reduce el tamano del modelo a aproximadamente 25-30 GB, permitiendo su ejecucion en servidores con una sola GPU de gama alta o incluso en CPUs modernas con suficiente RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K u otras evaluaciones comparativas para esta variante podada. Se recomienda realizar una evaluacion propia sobre los casos de uso previstos antes de su despliegue en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia (dependiendo de la cuantizacion):
  - MXFP4 (expertos MXFP4 / resto Q8_0): aproximadamente 40-50 GB de VRAM si se cargan todos los pesos en GPU, aunque esta disenado para offloading de expertos a CPU.
  - Q4_K_M: aproximadamente 40-45 GB de VRAM.
  - Q3_K_M: aproximadamente 32-38 GB de VRAM.
  - Q2_K: aproximadamente 23-28 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (80 GB), H100, RTX 4090 (24 GB) con offloading a RAM, o RTX 6000 Ada (48 GB) para cargas completas en GPU.
- En consumer GPU: es posible ejecutar las cuantizaciones Q3_K_M y Q2_K en una RTX 4090 (24 GB) si se combina con descarga de expertos a RAM. Las cuantizaciones mayores requieren GPUs de 48 GB o mas.
- Opciones de despliegue: llama.cpp (fork especifico `bailingmoe3-support` hasta que se fusione el PR #26608), llama-server con `--no-mmap` y `-ot "ffn_.*_exps\.weight=CPU"` para offloading de expertos. Compatible con el ecosistema GGUF (Ollama, LM Studio, etc.) una vez que el soporte este disponible en el upstream.
- Latencia y throughput: no disponible. Al mantener 5.1B parametros activos, la velocidad de generacion deberia ser similar a la de un modelo denso de ese tamano, pero la carga de expertos desde RAM puede anadir latencia en funcion del ancho de banda de memoria del sistema.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|---|
| Ling-3.0-flash-REAP288-73B-A5B (este) | 73B | 5.1B | no disponible | GGUF (MXFP4, Q4_K_M, Q3_K_M, Q2_K) | no disponible | Poda one-shot REAP, sin fine-tuning |
| inclusionAI/Ling-3.0-flash (base) | 124B | 5.1B | no disponible | safetensors | no disponible | Modelo original sin podar |
| Mixtral 8x7B (referencia de la categoria) | 46.7B | 12.9B | 32K | GGUF, safetensors | Apache 2.0 | MoE denso comparable en tamano, pero con mas parametros activos |

La comparativa directa con el modelo base muestra que esta variante reduce un 41% los parametros totales manteniendo los activos, a costa de una posible perdida de calidad debido a la poda sin reentrenamiento. No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con otras alternativas.

## Limitaciones y advertencias

- Poda sin fine-tuning: al no haber entrenamiento de recuperacion, es probable que exista una degradacion de calidad en tareas complejas de razonamiento o generacion de codigo respecto al modelo base.
- Soporte de software pendiente: el soporte para `bailingmoe3` en llama.cpp no esta fusionado en el upstream. Hasta que se acepte el PR #26608, es necesario usar el fork proporcionado, lo que puede limitar la compatibilidad con otras herramientas del ecosistema.
- Licencia no especificada: la licencia del modelo base y de esta variante no esta indicada. Se debe contactar con el autor o consultar el repositorio original antes de un uso comercial.
- Datos de calibracion limitados: la calibracion se realizo con solo 1 millon de tokens, lo que puede no cubrir adecuadamente todos los dominios y acentuar sesgos o debilidades en areas no representadas.
- Riesgo de alucinacion: al ser un modelo conversacional sin verificacion de hechos, puede generar informacion incorrecta o inventada, especialmente en contextos largos.
- Idiomas no especificados: no se indica que idiomas soporta el modelo. Se recomienda probar con el idioma objetivo antes de su despliegue.
- Tamano del repositorio: 147.1 GB en total, lo que implica una descarga considerable si se desean todas las cuantizaciones. Se recomienda descargar solo la necesaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bloomer010/Ling-3.0-flash-REAP288-73B-A5B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Paper REAP: https://arxiv.org/abs/2510.13999
- PR de soporte bailingmoe3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/26608
- Fork de llama.cpp con soporte bailingmoe3: https://github.com/aetherbird/llama.cpp/tree/bailingmoe3-support
