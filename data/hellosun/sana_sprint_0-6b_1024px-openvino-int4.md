# HelloSun/Sana_Sprint_0.6B_1024px-OpenVINO-INT4

## Resumen

HelloSun/Sana_Sprint_0.6B_1024px-OpenVINO-INT4 es una exportación cuantizada del modelo de difusión texto-a-imagen Sana Sprint 0.6B en resolución 1024x1024, publicada por el usuario HelloSun sobre el repositorio base Efficient-Large-Model/Sana_Sprint_0.6B_1024px_diffusers. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el transformer y el text encoder originales se comprimen a INT4 (peso únicamente) mediante NNCF y OpenVINO, mientras que el resto del pipeline se mantiene en INT8.

El interés principal está en el tamaño y el coste de ejecución. El export en FP16 ocupa unos 6,7 GB y el INT4 unos 2,3 GB, una reducción del 65 %, y el repositorio completo pesa 2,5 GB. Con ese peso, el modelo está pensado para inferencia en CPU (la model card documenta un Intel Xeon Platinum 8559C con 192 hilos lógicos), con picos de memoria residente de aproximadamente 7,2 GiB y tiempos de 4,4 a 7,1 segundos por imagen a 4 pasos en 1024x1024.

La relevancia actual viene de su naturaleza few-step: el pipeline `SanaSprintPipeline` con `SCMScheduler` usa 2 pasos de inferencia por defecto con `guidance_scale=4.5`, lo que lo aleja del esquema clásico de 20-50 pasos. La licencia Apache 2.0 facilita su integración comercial, aunque el repositorio acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que se trata de un artefacto sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion texto-a-imagen (Sana Sprint); la exportacion cubre el `transformer` y el `text_encoder` del modelo base. Detalles internos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | La denominacion indica 0,6 mil millones (0,6B); el recuento exacto no esta disponible. El export FP16 ocupa ~6,7 GB y el INT4 ~2,3 GB, lo que sugiere que el total incluye tambien el text encoder y el VAE |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: es un modelo de difusion, no un modelo de lenguaje. La longitud maxima de prompt no se especifica |
| Tipos de cuantizacion | INT4 weight-only para `transformer` y `text_encoder` (`bits=4, sym=False, group_size=128, group_size_fallback="adjust", ratio=1.0`); resto del pipeline en INT8 por defecto; existe export FP16 de referencia |
| Idiomas soportados | No disponible. La model card no lo especifica y todos los prompts de ejemplo estan redactados en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (libreria `optimum` / `optimum-intel`); el modelo base se distribuye en formato diffusers (safetensors) |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno: es un proceso de exportacion y compresion. El flujo documentado parte de `Efficient-Large-Model/Sana_Sprint_0.6B_1024px_diffusers`, se exporta a OpenVINO con `optimum-cli export openvino --task text-to-image --library diffusers --weight-format fp16` y despues se cuantiza con NNCF mediante `OVQuantizer` y `OVPipelineQuantizationConfig`. La configuracion aplicada es `OVWeightQuantizationConfig(bits=4, sym=False, group_size=128, group_size_fallback="adjust", ratio=1.0)` sobre `transformer` y `text_encoder`, con el resto del pipeline en INT8, y se carga con `ov_config=OVConfig(quantization_config=...)`. Es, por tanto, cuantizacion de pesos (no de activaciones), lo que mantiene las activaciones en mayor precision.

En cuanto a inferencia, el modelo usa el pipeline `SanaSprintPipeline` / `OVDiffusionPipeline` con `SCMScheduler`. La configuracion oficial por defecto es `num_inference_steps=2`, `guidance_scale=4.5` y 1024x1024. Un detalle operativo relevante: cualquier valor de `num_inference_steps` distinto de 2 exige pasar `intermediate_timesteps=None`; de lo contrario, el scheduler no se comporta como se espera. Los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO, innovaciones como atencion lineal o autoencoder de compresion) no estan disponibles en la informacion proporcionada y no deben inferirse de esta ficha.

## Capacidades

- Generacion de imagenes a partir de prompts de texto en 1024x1024 y, en el grupo de control de la model card, tambien en 512x512 (mismos prompts, semillas y pasos).
- Generacion few-step: 2 pasos por defecto; la model card documenta comparativas a 4 y 20 pasos sobre los mismos prompts y semillas.
- Salidas reproducibles con semilla fija (`torch.Generator().manual_seed(...)`), con ejemplos verificados con semillas 42 a 46.
- Estilos diversos segun los ejemplos publicados: fotorrealismo (retrato con hanfu, astronauta en la selva), ilustracion (shiba con casco espacial) y tinta china tradicional.
- Renderizado de texto dentro de la imagen: el ejemplo `03_taipei` incluye literalmente las cadenas "TAIPEI" y los caracteres chinos "台北" en rotulos de neón.
- Composición de escenas complejas: iluminacion cinematografica, reflejos sobre asfalto mojado, multitudes y profundidad de campo.
- Inferencia en CPU sin GPU dedicada, mediante OpenVINO con `compile=True`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente: es un modelo generativo de imagen, no un modelo de lenguaje.
- No dispone de modo "thinking", ni de capacidades de audio, video o comprension visual de entrada.

## Casos de uso

- Generacion de imagenes en servidores sin GPU: al ser un export OpenVINO INT4 con ~2,3 GB de pesos y un pico de RSS de ~7,2 GiB, puede ejecutarse en maquinas CPU con memoria moderada, lo que permite desplegar generacion de imagen en infraestructura ya existente de bajo coste.
- Prototipado rapido de conceptos visuales: con 4 pasos y tiempos de 4,5 a 5,2 segundos por imagen en 1024x1024 (medidos en Xeon Platinum 8559C), un disenador puede iterar decenas de variaciones de un prompt en pocos minutos.
- Generacion por lotes en pipelines de CI/CD: el script `inference_int4.py` acepta `--prompt`, `--seed`, `--steps`, `--guidance` y `--size`, por lo que se puede automatizar la generacion de ilustraciones de placeholder, miniaturas o imagenes de prueba en un flujo de integracion continua.
- Creacion de material grafico con texto integrado: los ejemplos de la model card incluyen rotulos legibles ("TAIPEI", "台北"), lo que abre la puerta a carteles, mockups de senaletica o portadas donde el texto forme parte de la escena.
- Comparativas de calidad entre regimenes few-step y muchos pasos: el repositorio incluye cada prompt renderizado a 4 y 20 pasos, lo que sirve como material de evaluacion interna para decidir el compromiso entre latencia y fidelidad.
- Ilustracion editorial y de concepto en estilos orientalistas o tradicionales: los ejemplos de hanfu y de tinta china con pagoda, grullas y montanas brumosas demuestran un sesgo estetico hacia ese tipo de composicion.
- Aplicaciones de escritorio o locales: al distribuirse como OpenVINO IR de ~2,5 GB, es viable empaquetarlo dentro de una aplicacion de escritorio que genere imagenes sin conexion.
- Generacion de imagenes sinteticas para probar interfaces, maquetas o sistemas de vision posteriores, con control de semilla para reproducibilidad.

## Benchmarks y rendimiento

La model card no publica benchmarks de calidad (FID, CLIP, ImageReward u otros). Los unicos datos disponibles son mediciones de latencia y consumo de memoria en CPU.

| Entorno | Valor |
|---|---|
| Hardware | Intel Xeon Platinum 8559C, 192 hilos logicos, OpenVINO CPU, `compile=True` |
| Carga + compilacion | 9,1 s |
| RSS tras la carga | 2,32 GiB |
| Pico de RSS | ~7,2 GiB (estable tras la primera imagen) |

| Configuracion | Imagenes medidas | Tiempo total por imagen (s) | Tiempo medio por paso (s) |
|---|---|---|---|
| 1024x1024, 4 pasos | 5 | 4,59 - 7,10 (el maximo incluye el calentamiento) | 0,50 - 0,57 |
| 1024x1024, 20 pasos | 5 | 12,56 - 13,49 | 0,49 - 0,53 |
| 512x512, 4 pasos | 5 | 4,45 - 4,75 | 0,50 - 0,53 |
| 512x512, 20 pasos | 5 | 12,45 - 13,29 | 0,49 - 0,52 |

No se han publicado resultados de benchmarks de calidad de imagen en la informacion disponible. Los datos por paso y por archivo estan en `outputs/benchmark.json` y el informe completo en `REPORT.md`, ambos referenciados desde la model card.

## Requisitos de hardware

- Memoria en CPU: RSS de 2,32 GiB tras la carga y pico de ~7,2 GiB durante la inferencia en el benchmark documentado (OpenVINO CPU, Xeon Platinum 8559C). Se recomienda disponer de al menos 8 GiB de RAM libre.
- Disco: ~2,5 GB para el repositorio completo; ~2,3 GB de pesos INT4 frente a los ~6,7 GB del export FP16.
- GPU recomendadas: no disponible. La model card solo documenta ejecucion en CPU con OpenVINO; no se aportan mediciones en GPU ni la lista de dispositivos validados.
- VRAM estimada: no disponible como dato medido. Como referencia derivada del tamano de pesos (INT4 de ~2,3 GB), el modelo deberia caber en GPUs de consumo con 4 GB o mas de VRAM, pero esta estimacion no esta verificada por el autor y depende del soporte de compresion de pesos INT4 en el plugin de GPU de OpenVINO.
- Opciones de despliegue: `OVDiffusionPipeline.from_pretrained(..., compile=True)` de `optimum.intel` (ruta documentada) o el script `inference_int4.py` incluido. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, y ninguna de ellas es aplicable a un modelo de difusion OpenVINO.
- Latencia y throughput: 4,4-7,1 s por imagen a 1024x1024 y 4 pasos; 12,4-13,5 s por imagen a 20 pasos; 4,5-4,8 s y 12,5-13,3 s respectivamente a 512x512. El tiempo medio por paso se mantiene en 0,49-0,57 s en todas las configuraciones.
- Aceleradores alternativos (NPU, iGPU): no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HelloSun/Sana_Sprint_0.6B_1024px-OpenVINO-INT4 | 0,6B segun denominacion | No aplica | 4,59-7,10 s/imagen a 1024x1024 y 4 pasos en Xeon 8559C | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Efficient-Large-Model/Sana_Sprint_0.6B_1024px_diffusers (base, FP16) | 0,6B segun denominacion | No aplica | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Efficient-Large-Model/Sana_Sprint_0.6B_1024px (fuente original) | 0,6B segun denominacion | No aplica | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas texto-a-imagen de menos de 1B parametros | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

La unica comparacion sustentada por datos es la del propio export frente a su version FP16: 2,3 GB frente a 6,7 GB de pesos (-65 %). No hay datos de degradacion de calidad asociados a esa compresion, ni benchmarks que permitan situar este modelo frente a otras alternativas de generacion de imagen.

## Limitaciones y advertencias

- Ausencia total de benchmarks de calidad: no se publican FID, CLIP ni evaluaciones humanas, por lo que se desconoce el coste real en fidelidad de la cuantizacion INT4 frente al modelo FP16.
- Artefacto sin validacion externa: el repositorio registra 0 descargas y 0 "likes", sin evidencia de uso en produccion por terceros.
- Cuantizacion solo de pesos: las activaciones no se cuantizan, de modo que las ganancias de memoria se limitan al almacenamiento de parametros y no se traducen necesariamente en aceleraciones proporcionales.
- Restriccion operativa del scheduler: cualquier `num_inference_steps` distinto de 2 requiere `intermediate_timesteps=None`; omitirlo produce resultados incorrectos sin aviso explicito.
- Riesgo de degradacion en textos dentro de la imagen: aunque un ejemplo renderiza correctamente "TAIPEI" y "台北", el fallo en el renderizado de texto es comun en modelos de difusion y no hay evaluacion sistematica al respecto.
- Idiomas: no se documenta el soporte multilingue. Los prompts de ejemplo estan en ingles y no hay evidencia de calidad con prompts en castellano.
- Sin capacidades de lenguaje, razonamiento, tool calling ni agentes; no debe evaluarse como un LLM.
- Licencia Apache 2.0 en este repositorio, pero la licencia del modelo base y de sus pesos originales debe verificarse por separado antes de un uso comercial, ya que la model card no la reproduce.
- Reproduccion con incertidumbre: el listado de versiones del entorno (openvino 2026.4.0, torch 2.14.1, diffusers 0.37.1, nncf 3.4.0) no se corresponde con las versiones estables habituales en el momento de redactar esta ficha, y la seccion de reproduccion aparece truncada en la informacion disponible; conviene validar la compatibilidad antes de replicar los resultados.
- Fechas del repositorio: creado y actualizado el 2026-10-01, con 2 segundos de diferencia entre ambos eventos, lo que sugiere una publicacion automatizada sin mantenimiento posterior.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces obtenidos no eran pertinentes y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HelloSun/Sana_Sprint_0.6B_1024px-OpenVINO-INT4
- Arbol de archivos del repositorio (incluye `examples/`, `outputs/benchmark.json`, `outputs/prompts.txt`, `REPORT.md`, `inference_int4.py` y `generate5.py`): https://huggingface.co/HelloSun/Sana_Sprint_0.6B_1024px-OpenVINO-INT4/tree/main
- Modelo base en formato diffusers: https://huggingface.co/Efficient-Large-Model/Sana_Sprint_0.6B_1024px_diffusers
- Modelo base original: https://huggingface.co/Efficient-Large-Model/Sana_Sprint_0.6B_1024px
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
