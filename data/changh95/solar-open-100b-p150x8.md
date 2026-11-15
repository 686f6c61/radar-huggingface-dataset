# changh95/solar-open-100b-p150x8

## Resumen

Solar-Open-100B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Upstage, con 102.000 millones de parametros totales y 12.000 millones de parametros activos por token. Utiliza 128 expertos mas uno compartido y dispone de una ventana de contexto nativa de 131.072 tokens. El repositorio analizado, `changh95/solar-open-100b-p150x8`, no contiene los pesos originales, sino un paquete de despliegue publicado con `tt-model-manager` 0.1.0 que permite servir el modelo sobre hardware Tenstorrent Blackhole.

La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra la ejecucion del modelo sobre ocho placas Blackhole P150 en una malla logica 1x8 con paralelismo tensorial (TP=8) a traves de vLLM y del plugin `vllm-tt-plugin`. El paquete incluye imagenes Docker, manifiestos y codigo byte-identico al que se ejecuta dentro de la imagen, ademas de mediciones detalladas de latencia y throughput.

Es importante distinguir entre el modelo y el artefacto: las capacidades, el entrenamiento y los benchmarks corresponden a Solar-Open-100B de Upstage, mientras que las cifras de rendimiento del repositorio describen exclusivamente el despliegue en Blackhole P150x8, con contexto limitado a 16.384 tokens y hasta 32 secuencias concurrentes, muy por debajo de la ventana nativa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 128 expertos + 1 compartido |
| Parametros totales | 102.000 millones (102B) |
| Parametros activos | 12.000 millones (12B) |
| Longitud de contexto | 131.072 tokens en el modelo original; 16.384 tokens en el despliegue P150x8 |
| Tipos de cuantizacion | bfp8 para expertos y KV cache en el despliegue Blackhole; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Pesos originales de `upstage/Solar-Open-100B` descargados desde Hugging Face (revision `1f591439b14055004d1a5d1a975608953a022fea`); el repositorio contiene un contenedor de despliegue, no pesos en safetensors ni GGUF |
| Tamano del repositorio | 1,7 GB (imagen y manifiestos, sin pesos) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos: 128 expertos enrutados mas un experto compartido, con 102B parametros totales y 12B activos por token. Esta configuracion busca mantener la calidad de un modelo denso de gran tamano con un coste de computo por token comparable a un modelo de 12B. La ventana de contexto nativa es de 131.072 tokens.

No se dispone en la informacion proporcionada de detalles sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni el uso de RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. El repositorio si documenta la integracion tecnica: vLLM v0.25.1, el plugin `vllm-tt-plugin` en la rama `solar-fixes` (con correccion de EOS en decodificacion asincrona y registro de arquitectura plana) y `tt-metal` en el commit `584d9f294781f2f9d9ce02d6d2b5db4be72d53a2`.

## Capacidades

- Generacion de texto autoregresiva con decodificacion greedy verificada en el despliegue.
- Razonamiento y generacion de codigo: capacidades esperables de un modelo de 102B MoE de Upstage, aunque no se documentan evaluaciones especificas en la informacion disponible.
- Servidor compatible con la API de OpenAI en el puerto 20000, lo que facilita la integracion con clientes existentes.
- Procesamiento por lotes concurrente de hasta 32 secuencias en la configuracion P150x8.
- Soporte de prompts largos hasta 16.384 tokens en el despliegue (frente a 131K nativos del modelo).
- Tool calling, function calling, modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Evaluacion de hardware Tenstorrent: el paquete permite medir el rendimiento real de un MoE de 102B sobre ocho placas Blackhole P150 con cargas reproducibles, usando las tablas de latencia y throughput incluidas como referencia.
- Servicio de inferencia compatible con OpenAI: `tt-model serve` levanta un endpoint en el puerto 20000 que puede sustituir a un servidor vLLM convencional en aplicaciones que ya usan el SDK de OpenAI, sin cambios de codigo en el cliente.
- Procesamiento por lotes de documentos de hasta 16K tokens: con 32 secuencias concurrentes y un throughput agregado de hasta 1.632 tokens/s en escenarios de entrada de 1K y salida de 128 tokens, resulta adecuado para tareas de extraccion y resumen por lotes.
- Despliegue en entornos con aceleradores Tenstorrent: organizaciones que ya operan infraestructura Blackhole pueden ejecutar un modelo de 102B sin GPUs NVIDIA, usando el contenedor y los manifiestos publicados.
- Reproduccion de investigacion: el repositorio fija los commits exactos de `tt-metal`, vLLM y el plugin, lo que permite reproducir resultados de rendimiento y depurar diferencias entre versiones.
- Pruebas de integracion continua de pilas de inferencia: el digest `code/` y las versiones fijadas facilitan validar regresiones del plugin o del runtime antes de actualizar produccion.
- Chat interactivo de baja concurrencia: con un solo usuario, la decodificacion alcanza 74,6 tokens/s para prompts de 128 tokens, suficiente para asistentes conversacionales en entornos de demostracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El repositorio incluye exclusivamente mediciones de rendimiento del despliegue en ocho placas Blackhole P150 (TP=8), con expertos y KV cache en bfp8, decodificacion greedy y caches calientes.

Throughput agregado de decodificacion (tokens/s) en funcion de usuarios concurrentes:

| Usuarios | 128/128 | 1024/128 | 4096/128 | 8192/1024 | 32768/128 |
|---|---|---|---|---|---|
| 1 | 75 | 74 | 72 | 68 | 57 |
| 8 | 332 | 433 | 402 | 379 | 264 |
| 32 | 926 | 1.632 | 1.361 | 1.074 | 451 |

Tiempo hasta el primer token (ms, media por usuario) para los mismos escenarios:

| Usuarios | 128/128 | 1024/128 | 4096/128 | 8192/1024 | 32768/128 |
|---|---|---|---|---|---|
| 1 | 163 | 416 | 1.604 | 2.942 | 12.562 |
| 8 | 665 | 2.324 | 6.407 | 16.280 | 60.260 |
| 32 | 2.431 | 7.078 | 23.506 | 51.151 | 295.550 |

Nota metodologica del autor: las columnas de 128 tokens usan 32 prompts distintos, mientras que las columnas de 1K a 32K alimentan a todos los usuarios con el mismo texto y constituyen cotas superiores. El prefill es secuencial, por lo que la media de TTFT equivale a (B+1)/2 prefills.

## Requisitos de hardware

- Hardware de referencia: ocho placas Tenstorrent Blackhole P150 en malla logica 1x8 con TP=8. No es un despliegue sobre GPU.
- VRAM: no aplica; el modelo se ejecuta en la memoria de las placas Blackhole. No se documenta la memoria total consumida ni el reparto por placa.
- GPUs recomendadas: no disponible. El paquete esta construido especificamente para el backend Tenstorrent mediante `vllm-tt-plugin`.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte para RTX 4090 u otras GPUs.
- Opciones de despliegue: `tt-model pull changh95/solar-open-100b-p150x8 --with-weights` y `tt-model serve changh95/solar-open-100b-p150x8`. El primer arranque compila kernels para el dispositivo y tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.
- Latencia y throughput: 74,6 tokens/s por usuario con un solo usuario y prompts de 128 tokens; 926 tokens/s agregados con 32 usuarios en el mismo escenario. TTFT de 163 ms con un usuario y 2.431 ms con 32 usuarios para 128/128 tokens.
- Almacenamiento: el repositorio ocupa 1,7 GB, pero los pesos de `upstage/Solar-Open-100B` se descargan aparte en la cache de Hugging Face.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| Solar-Open-100B (este paquete) | 102B | 12B | 131K nativo; 16K en P150x8 | no disponible | Tenstorrent Blackhole P150x8, vLLM |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32K | Apache 2.0 | GPU, llama.cpp, vLLM |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | GPU, llama.cpp, vLLM |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K | licencia propia | GPU, vLLM |

La comparacion con alternativas MoE de tamano similar revela una diferencia clave: Solar-Open-100B se publica aqui como artefacto de despliegue para hardware Tenstorrent, mientras que los modelos citados tienen pesos abiertos en safetensors y soporte amplio en ecosistemas GPU. No se dispone de datos de benchmarks de calidad para establecer una comparacion de rendimiento con estos modelos.

## Limitaciones y advertencias

- El repositorio no contiene los pesos: son un contenedor de despliegue que requiere descargar `upstage/Solar-Open-100B` por separado y aceptar las condiciones de ese repositorio.
- La licencia del modelo no esta disponible en la informacion proporcionada; antes de un uso comercial debe verificarse en el repositorio original de Upstage.
- El contexto efectivo en este despliegue es de 16.384 tokens, muy inferior a los 131.072 nativos del modelo; no debe asumirse la ventana completa.
- El prefill es secuencial, lo que produce TTFT elevados con concurrencia alta: 295,5 segundos con 32 usuarios y prompts de 32K tokens.
- Las cifras de rendimiento se midieron con decodificacion greedy y caches calientes; el rendimiento en frio o con sampling puede diferir.
- El despliegue esta acoplado a commits concretos de `tt-metal` y del plugin; actualizar componentes sin validar puede romper la compatibilidad.
- El primer arranque compila kernels y tarda varios minutos, lo que complica el escalado elastico y los entornos efimeros.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse con el modelo original.
- El repositorio registra cero descargas y cero likes, y su autor no es Upstage; se trata de una publicacion de terceros, no de un artefacto oficial del desarrollador del modelo.

## Enlaces

- Repositorio del paquete: https://huggingface.co/changh95/solar-open-100b-p150x8
- Modelo original: https://huggingface.co/upstage/Solar-Open-100B
- Revision de pesos: `1f591439b14055004d1a5d1a975608953a022fea`
- Herramienta de despliegue: https://github.com/tenstorrent/tt-model-manager
- Commit de tt-metal: https://github.com/changh95/tt-metal/commit/584d9f294781f2f9d9ce02d6d2b5db4be72d53a2
- vLLM v0.25.1: https://github.com/vllm-project/vllm/releases/tag/v0.25.1
- Plugin vllm-tt-plugin (rama solar-fixes): https://github.com/changh95/vllm-tt-plugin/commit/ba73d09d69766de64f345e84b08c36c4da51862b
