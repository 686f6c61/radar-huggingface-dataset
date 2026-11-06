# fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int8-gs64-sym

## Resumen

Esta ficha describe una cuantizacion INT8 del modelo base Falcon3-7B-Base, publicada por el usuario fbaldassarri bajo el identificador `fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int8-gs64-sym`. No se trata de un modelo original de TII (Technology Innovation Institute), sino de un artefacto derivado: los pesos del Falcon3-7B-Base original han sido transformados mediante cuantizacion de solo pesos (weight-only quantization, WoQ) con el algoritmo SignRound de Intel AutoRound v0.16.0, en precision de 8 bits, tamano de grupo 64 y esquema simetrico.

El objetivo de esta publicacion es ofrecer una version de Falcon3-7B-Base optimizada para inferencia en hardware Intel: CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU (AI Boost) de la serie Core Ultra mediante OpenVINO. Es, por tanto, un artefacto orientado al despliegue en entornos Intel mas que un modelo nuevo con capacidades adicionales. El modelo conserva la naturaleza de modelo base (completion), sin ajuste por instrucciones ni plantilla de chat.

Un dato relevante que conviene senalar de entrada: aunque el nombre del repositorio indica "7B", el recuento real de parametros en los ficheros safetensors es de 2.597.882.880 (aproximadamente 2,6 mil millones). Esta discrepancia entre la denominacion comercial y el tamano efectivo de los pesos debe tenerse en cuenta al planificar el despliegue y comparar con otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); `model_type: llama` segun la model card |
| Parametros totales | 2.597.882.880 (segun safetensors); el nombre del repo indica 7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8, group size 64, simetrica, WoQ (SignRound / AutoRound) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion del modelo base `tiiuae/Falcon3-7B-Base`. La arquitectura subyacente es un transformer causal de la familia Falcon3, si bien la model card declara `model_type: llama`, lo que refleja la configuracion de transformers utilizada para el artefacto cuantizado. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo original paso por fases de RLHF o DPO; al tratarse de un modelo base, es esperable que no haya ajuste por instrucciones, pero este extremo no se confirma en la documentacion disponible.

La innovacion tecnica de esta publicacion es el proceso de cuantizacion. Se aplico Intel AutoRound v0.16.0 con el algoritmo SignRound, en modo solo pesos, 8 bits, grupo de 64 y simetria. La calibracion se realizo sobre CPU con `torch.bfloat16`, 128 muestras, 200 iteraciones, longitud de secuencia 512 y batch de 4. El proceso completo registro una duracion de 35.861,1 segundos (aproximadamente 597,7 minutos). El entorno de ejecucion declaro transformers 4.55.3 y torch 2.14.1+cpu. El resultado se guarda en formato `auto_round` y se distribuye como safetensors.

## Capacidades

- Generacion de texto autoregresiva en modo completion: el modelo recibe texto crudo y continua la secuencia, sin formato de chat ni instrucciones.
- Razonamiento y conocimiento general heredados del modelo base Falcon3-7B-Base, en la medida en que el proceso de cuantizacion los preserve.
- Generacion de codigo y matematicas: capacidad potencial heredada del modelo base, no verificada en esta cuantizacion con benchmarks.
- Soporte de tool calling / function calling: no disponible; al ser un modelo base sin ajuste por instrucciones, no se documenta soporte nativo.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa por la misma razon.
- Capacidades multilingues: limitadas al ingles segun la model card (`language: en`).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Inferencia optimizada en hardware Intel: CPU, iGPU Arc (intel-extension-for-pytorch) y NPU AI Boost de Core Ultra (OpenVINO).

## Casos de uso

- Generacion de texto en entornos Intel sin GPU dedicada: el modelo puede desplegarse en servidores con CPU Intel o en portatiles con iGPU Arc o NPU Core Ultra, aprovechando las rutas de inferencia documentadas (intel-extension-for-pytorch y OpenVINO).
- Prototipado de completion y autocompletado: al ser un modelo base, encaja en tareas de continuacion de texto, generacion de borradores y experimentacion con prompts crudos, sin necesidad de plantilla de chat.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia reproducible para comparar el impacto de INT8 gs64 simetrico frente al modelo original en tareas de generacion, dado que la model card incluye la receta exacta de replicacion.
- Despliegue en el borde (edge) con NPU: en equipos Core Ultra, la ruta OpenVINO permite ejecutar el modelo en la NPU AI Boost, liberando CPU y reduciendo consumo energetico en aplicaciones de generacion de texto locales.
- Generacion de texto por lotes en CPU: para pipelines de procesamiento masivo de texto donde no hay GPU disponible, la version INT8 reduce el peso en memoria frente a bfloat16 y permite mayor paralelismo en CPU.
- Base para ajuste fino posterior o experimentacion academica: al estar bajo licencia Apache 2.0 y en formato transformers, puede servir de punto de partida para investigacion sobre modelos cuantizados, siempre que se validen las capacidades tras la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 10,2 GB, lo que da una idea del peso en disco de los pesos INT8 con metadatos; la huella en memoria depende del runtime y del overhead de transformers.
- GPU recomendadas: la model card no documenta despliegue en GPU NVIDIA o AMD; el artefacto esta orientado a CPU Intel, iGPU Arc y NPU Core Ultra.
- Cabe en GPU consumer: no disponible; no se documenta soporte para GPUs de consumo como RTX 4090.
- Opciones de despliegue: transformers con `device_map="auto"`; intel-extension-for-pytorch para CPU e iGPU Arc; OpenVINO para NPU AI Boost; el tag `text-generation-inference` aparece en los metadatos, pero no se detalla configuracion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Orientacion |
|---|---|---|---|---|---|
| Este artefacto (Falcon3-7B-Base INT8 AutoRound) | 2.597.882.880 (segun safetensors) | no disponible | INT8 gs64 simetrica WoQ | Apache 2.0 | Inferencia en hardware Intel (CPU, iGPU, NPU) |
| tiiuae/Falcon3-7B-Base (original) | no disponible en la informacion | no disponible | bfloat16 (sin cuantizar) | Apache 2.0 | Modelo base de referencia |
| Otras cuantizaciones de Falcon3-7B-Base | no disponible | no disponible | no disponible | Apache 2.0 (presumible) | no disponible |

La comparativa se limita al modelo original y a este artefacto, ya que no se dispone de datos de benchmarks ni de especificaciones de contexto para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Discrepancia de tamano: el nombre del repositorio indica "7B", pero el recuento real de parametros en safetensors es de 2.597.882.880; conviene verificar el modelo antes de dimensionar infraestructura.
- Modelo base, no instruct: no sigue instrucciones ni mantiene formato de chat; el prompt debe ser texto crudo y la salida es una continuacion.
- Solo ingles: la model card declara unicamente `en` como idioma soportado.
- Degradacion por cuantizacion: la cuantizacion INT8 WoQ puede introducir perdida de calidad respecto al modelo original; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares para este artefacto, por lo que su rendimiento real no esta verificado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documenta mitigacion especifica.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada; al ser un modelo base en ingles, es probable que herede sesgos del corpus de entrenamiento original, no evaluados aqui.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card incluye un descargo que indica que el modelo se desarrollo solo con fines de investigacion; conviene revisar esa advertencia antes de un despliegue en produccion.
- Dependencia de hardware Intel: las rutas de inferencia documentadas estan orientadas a CPU Intel, iGPU Arc y NPU Core Ultra; el soporte en otras plataformas no esta documentado.
- Sin garantia: la model card declara explicitamente que el modelo se distribuye sin garantia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Base
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- auto-round-pipeline (receta de replicacion): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
