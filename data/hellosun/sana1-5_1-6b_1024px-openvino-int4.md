# HelloSun/SANA1.5_1.6B_1024px-OpenVINO-INT4

## Resumen

HelloSun/SANA1.5_1.6B_1024px-OpenVINO-INT4 es una exportación cuantizada del modelo de generación de imágenes SANA 1.5 de 1,6 mil millones de parámetros a 1024 px, publicada por el usuario HelloSun en Hugging Face. No se trata de un modelo nuevo ni de un reentrenamiento: es el mismo modelo base Efficient-Large-Model/SANA1.5_1.6B_1024px_diffusers convertido a formato OpenVINO IR y cuantizado a INT4 mediante NNCF, con el objetivo de reducir el peso de los pesos y ejecutar el pipeline de difusión sin GPU dedicada.

El problema que resuelve es el del despliegue en hardware modesto. El modelo original en FP16 ocupa aproximadamente 8,5 GB, lo que complica su uso en portátiles, mini-PC o servidores sin acelerador. Esta versión comprime el repositorio a unos 3,1 GB (una reducción del 63 %) manteniendo el pipeline oficial SanaPipeline con la configuración de referencia (guidance_scale=4.5, 20 pasos de inferencia, 1024x1024).

Es relevante porque demuestra que un modelo de difusión de resolución 1024 px puede generar imágenes en CPU pura con latencias de 11 a 14 segundos por imagen a 5 pasos y de 35 a 39 segundos a 20 pasos, según el benchmark incluido por el autor sobre un Intel Xeon Platinum 8559C. La licencia declarada es Apache 2.0 y el repositorio no registra descargas ni likes en los metadatos consultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto a imagen; pipeline SanaPipeline / OVDiffusionPipeline. Detalles internos del backbone (tipo de transformer, mecanismo de atención) no disponibles |
| Parametros totales | 1,6 mil millones (según el nombre del modelo base SANA1.5_1.6B_1024px) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. El condicionamiento textual se realiza mediante un text_encoder; no se documenta su longitud máxima de tokens |
| Tipos de cuantizacion | INT4 weight-only en `transformer` y `text_encoder` (`OVWeightQuantizationConfig(bits=4, sym=False, group_size=128, group_size_fallback="adjust", ratio=1.0)`); INT8 en el resto de componentes. Export previo en FP16 disponible como paso intermedio |
| Idiomas soportados | No disponibles. Los ejemplos del autor usan exclusivamente prompts en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (exportado con `optimum-cli` y cuantizado con NNCF). No se proporcionan safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no contiene ningún entrenamiento nuevo. Se trata de un artefacto de exportación y cuantización construido en dos fases documentadas por el autor: primero una exportación del modelo diffusers a OpenVINO en FP16 mediante `optimum-cli export openvino -m Efficient-Large-Model/SANA1.5_1.6B_1024px_diffusers --task text-to-image --library diffusers --weight-format fp16`, y después una cuantización con `OVQuantizer` y `OVPipelineQuantizationConfig` ejecutada por el script `quantize_int4.py`. La cuantización es weight-only: solo se cuantizan los pesos, no las activaciones, con 4 bits, esquema asimétrico (`sym=False`), tamaño de grupo 128 y política de ajuste automático del tamaño de grupo cuando no es divisible.

Al derivar de SANA 1.5, el modelo conserva la arquitectura y los pesos del original, por lo que su comportamiento de generación depende enteramente de él. La información proporcionada no incluye datos sobre el dataset de entrenamiento del modelo base, el número de tokens o imágenes vistas, ni si hubo fases de alineación tipo RLHF o DPO. Tampoco se documentan innovaciones técnicas propias de esta exportación más allá de la estrategia de cuantización, salvo el uso de `compile=True` en OpenVINO para acelerar el grafo. El autor reporta la reducción de tamaño de 8,5 GB a 3,1 GB como principal resultado técnico.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a 1024x1024 y a 512x512, usando el pipeline `SanaPipeline` o `OVDiffusionPipeline` de optimum-intel.
- Control de la calidad y el coste computacional mediante el numero de pasos de inferencia: el autor valida configuraciones de 5 pasos (vista previa rapida) y 20 pasos (calidad de referencia), con `guidance_scale=4.5`.
- Seguimiento de prompts descriptivos largos y detallados, incluyendo escenas con multiples elementos (por ejemplo, un astronauta en una selva con iluminacion cinematografica, o un paisaje a tinta con montanas, pagoda y grullas).
- Generacion condicionada por semilla: el ejemplo oficial fija `torch.Generator().manual_seed(42)`, lo que permite reproducibilidad exacta de la imagen resultante.
- Prompts que solicitan rotulacion de texto dentro de la imagen (los ejemplos incluyen un cartel con "TAIPEI" y caracteres chinos "台北"), si bien no se aportan metricas de fidelidad del texto renderizado.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades de audio o video.
- No se declaran capacidades multilingues; la totalidad de los prompts de ejemplo estan en ingles.

## Casos de uso

- Generacion de imagenes en servidores sin GPU: al estar en formato OpenVINO IR, el modelo se ejecuta sobre CPU con el plugin de OpenVINO. El benchmark del autor sobre un Xeon Platinum 8559C con 192 hilos logicos da 11-14 s por imagen a 5 pasos, lo que lo hace viable para colas de trabajo por lotes no interactivas.
- Despliegue en portatiles y mini-PC Intel: con un peso de aproximadamente 3,1 GB en INT4 y un pico de memoria reportado de unos 8,9 GiB durante la ejecucion con `compile=True`, puede ejecutarse en equipos de gama alta sin GPU dedicada, incluyendo iGPU o NPU Intel mediante los plugins correspondientes de OpenVINO (no verificados por el autor).
- Vistas previas rapidas en herramientas de diseno: la configuracion de 5 pasos devuelve una imagen 1024x1024 en 11-14 s y permite iterar sobre un prompt antes de lanzar la generacion final a 20 pasos, aprovechando ademas la semilla fija para comparaciones justas.
- Generacion por lotes de recursos graficos para marketing: cinco prompts de tematica distinta se ejecutan en el benchmark con latencias homogeneas (36,84 s la mas lenta frente a 35,63 s la mas rapida a 20 pasos), lo que da una planificacion de capacidad bastante predecible.
- Produccion artistica asistida e ilustracion conceptual: los ejemplos del autor cubren estilos muy diferentes (fotorrealismo de retrato, ilustracion con colores vibrantes, tinta china minimalista, escena ciberpunk nocturna), lo que indica versatilidad estilistica con un unico modelo.
- Preservacion de la privacidad en generacion local: al ejecutarse integramente en local sin llamadas a API, es adecuado para entornos donde los prompts no pueden salir de la infraestructura de la organizacion.
- Experimentacion academica con cuantizacion de modelos de difusion: el repositorio incluye `quantize_int4.py`, `REPORT.md` y `outputs/benchmark.json`, por lo que sirve como caso reproducible para estudiar el impacto de la cuantizacion INT4 en pipelines de difusion.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son de latencia, medidos sobre Intel Xeon Platinum 8559C (192 hilos logicos), OpenVINO en CPU, `compile=True` y `guidance=4.5`. La carga y compilacion del modelo tarda 8,1 s, con un RSS de 2,44 GiB tras la carga y un pico de aproximadamente 8,9 GiB durante la ejecucion.

| Archivo de salida | Resolucion | Pasos | Tiempo total (s) | Tiempo medio por paso (s) |
|---|---|---|---|---|
| 01_hanfu | 1024 | 5 | 14,28 | 1,68 |
| 01_hanfu | 512 | 5 | 13,41 | 1,90 |
| 01_hanfu | 1024 | 20 | 35,63 | 1,60 |
| 01_hanfu | 512 | 20 | 35,99 | 1,64 |
| 02_astronaut | 1024 | 5 | 11,29 | 1,62 |
| 02_astronaut | 512 | 5 | 11,36 | 1,63 |
| 02_astronaut | 1024 | 20 | 36,21 | 1,65 |
| 02_astronaut | 512 | 20 | 35,64 | 1,64 |
| 03_taipei | 1024 | 5 | 10,97 | 1,60 |
| 03_taipei | 512 | 5 | 11,15 | 1,60 |
| 03_taipei | 1024 | 20 | 36,84 | 1,69 |
| 03_taipei | 512 | 20 | 37,38 | 1,72 |
| 04_shiba | 1024 | 5 | 11,59 | 1,67 |
| 04_shiba | 512 | 5 | 12,30 | 1,82 |
| 04_shiba | 1024 | 20 | 38,83 | 1,76 |
| 04_shiba | 512 | 20 | 36,65 | 1,66 |
| 05_ink | 1024 | 5 | 11,74 | 1,70 |
| 05_ink | 512 | 5 | 11,71 | 1,68 |
| 05_ink | 1024 | 20 | 36,07 | 1,64 |
| 05_ink | 512 | 20 | 36,21 | 1,65 |

Rango agregado declarado por el autor: 1,6-1,9 s por paso, 11-14 s totales a 5 pasos y 35-39 s totales a 20 pasos. No se han publicado resultados de benchmarks de calidad (FID, CLIP score, comparativas ciegas) en la informacion disponible, ni metricas MMLU, HumanEval o GSM8K, que no aplican a un modelo de generacion de imagenes.

## Requisitos de hardware

- Peso en disco: el repositorio ocupa 3,2 GB; el autor cifra los pesos cuantizados en aproximadamente 3,1 GB, frente a los 8,5 GB del modelo en FP16.
- Memoria: en la prueba de referencia en CPU se reporta un RSS de 2,44 GiB tras cargar y compilar, con un pico de unos 8,9 GiB durante la generacion. Se trata de memoria del sistema, no de VRAM.
- CPU recomendada: Intel Xeon Platinum 8559C con 192 hilos logicos es la unica configuracion validada. Se espera mejor rendimiento relativo en procesadores con instrucciones AVX-512 VNNI o AMX, pero el autor no aporta comparativas entre generaciones de CPU.
- GPU: no se proporcionan datos de rendimiento en GPU. OpenVINO dispone de plugin de GPU para graficos integrados y discretos Intel, pero el autor no ha verificado esta ruta. Con un peso de unos 3,1 GB, el modelo podria caber en GPUs con 4-6 GB de memoria o mas; esta afirmacion es una estimacion a partir del tamano de los pesos y no un dato verificado.
- NPU: no disponible. No se documenta prueba alguna sobre NPU Intel Core Ultra.
- GPU de consumo: no disponible. No hay resultados publicados sobre RTX 4090, RTX 3090 u otras GPU de consumo, ni sobre adaptadores CUDA.
- Opciones de despliegue: `OVDiffusionPipeline.from_pretrained(..., compile=True)` de optimum-intel, o los scripts del repositorio `inference_int4.py` y `generate5.py`. No aplica llama.cpp, Ollama, vLLM ni TGI: el formato no es GGUF y el modelo no es un modelo de lenguaje.
- Latencia y throughput: 11-14 s por imagen de 1024x1024 a 5 pasos y 35-39 s a 20 pasos, en un solo hilo de ejecucion segun el benchmark. La resolucion 512 no aporta una mejora clara de latencia en los datos publicados (13,41 s frente a 14,28 s a 5 pasos), lo que sugiere que el cuello de botella esta en otro componente del pipeline.
- Versiones de referencia del autor: diffusers 0.37.1, transformers 5.5.4, optimum 2.3.0, optimum-intel 2.2.0, openvino 2026.4.0, nncf 3.4.0, torch 2.14.1.

## Comparativa con modelos similares

Los datos de modelos de terceros que aparecen a continuacion provienen de conocimiento publico general y no de la documentacion aportada; conviene verificarlos antes de tomar decisiones.

| Modelo | Parametros | Formato | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HelloSun/SANA1.5_1.6B_1024px-OpenVINO-INT4 | 1,6B | OpenVINO IR INT4 | 1024x1024 y 512x512 | Apache 2.0 | Repositorio Hugging Face, 3,2 GB, 0 descargas y 0 likes en los metadatos |
| Efficient-Large-Model/SANA1.5_1.6B_1024px_diffusers | 1,6B | FP16 (diffusers) | 1024x1024 | No disponible en la informacion proporcionada | Modelo base; requiere unos 8,5 GB para los pesos |
| Efficient-Large-Model/SANA1.5_1.6B_1024px | 1,6B | No disponible | 1024x1024 | No disponible en la informacion proporcionada | Origen del export |
| SANA 1.5 (referencia de familia) | Rango de 1,6B a variantes mayores; cifras exactas no disponibles | No disponible | Hasta 4096 px en variantes superiores, no confirmado | No disponible en la informacion proporcionada | No disponible |
| SDXL (referencia de mercado) | Aproximadamente 3,5B (2,6B UNet + 817M text encoders) | safetensors, GGUF | 1024x1024 | CreativeML Open RAIL++-M | Ampliamente disponible |
| FLUX.1-schnell (referencia de mercado) | Aproximadamente 12B | safetensors, GGUF | 1024x1024 | Apache 2.0 | Ampliamente disponible |

La ventaja diferencial de este artefacto no es la calidad ni el rendimiento absoluto, sino la combinacion de tamano reducido (3,1 GB), licencia permisiva y ejecucion en CPU mediante OpenVINO. No hay datos publicados que permitan comparar su calidad de imagen con la del modelo base en FP16 ni con SDXL o FLUX.

## Limitaciones y advertencias

- La cuantizacion INT4 weight-only puede degradar la calidad de imagen respecto al FP16 original. El autor no publica ninguna metrica de calidad (FID, CLIP score, evaluacion humana) que cuantifique esa posible perdida, solo latencias.
- No hay informacion sobre sesgos del modelo base ni sobre sesgos introducidos por la cuantizacion.
- Como todo modelo de difusion, puede producir imagenes que no se correspondan fielmente con el prompt, especialmente en composiciones con muchos objetos, texto rotulado o relaciones espaciales complejas.
- Los prompts de ejemplo estan exclusivamente en ingles y el autor no declara idiomas soportados. No hay evidencia de comportamiento correcto con prompts en castellano.
- El repositorio tiene 0 descargas y 0 likes, esta publicado por un autor individual y no ha pasado ninguna validacion de la comunidad. Conviene auditar los pesos antes de usarlos en produccion.
- La licencia del derivado es Apache 2.0, pero debe verificarse por separado la licencia y las condiciones de uso comerciales del modelo base SANA 1.5 y del repositorio Efficient-Large-Model, que no se detallan en la informacion proporcionada.
- No hay datos verificados de funcionamiento en GPU o NPU. El unico benchmark es en CPU Intel. Las estimaciones de VRAM son extrapolaciones del tamano de los pesos.
- Las versiones de dependencias citadas por el autor (openvino 2026.4.0, torch 2.14.1, transformers 5.5.4) son muy recientes; la reproducibilidad del entorno depende de disponer exactamente de esas versiones o de otras compatibles.
- Las fechas de creacion y actualizacion del repositorio en los metadatos (2026-10-01) son posteriores a la fecha habitual de consulta, lo que conviene tener en cuenta al evaluar la vigencia del artefacto.
- La resolucion de 512 px no reduce el tiempo de generacion de forma apreciable en los datos publicados, por lo que no debe asumirse como estrategia de abaratamiento de costes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HelloSun/SANA1.5_1.6B_1024px-OpenVINO-INT4
- Modelo base (Origen): https://huggingface.co/Efficient-Large-Model/SANA1.5_1.6B_1024px
- Modelo base en formato diffusers: https://huggingface.co/Efficient-Large-Model/SANA1.5_1.6B_1024px_diffusers
- Archivos incluidos en el repositorio: `REPORT.md`, `quantize_int4.py`, `generate5.py`, `inference_int4.py`, `outputs/benchmark.json`, `outputs/prompts.txt`, carpeta `examples/`
- No se han encontrado enlaces a papers, blogs, demos o repositorios adicionales en la informacion proporcionada.
