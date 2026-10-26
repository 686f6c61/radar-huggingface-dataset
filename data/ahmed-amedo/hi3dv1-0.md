# ahmed-amedo/Hi3Dv1.0

## Resumen

Hi3D v1.0 es un modelo de refinamiento geométrico 3D de alta resolución construido sobre la representación y arquitectura de refinamiento de Sparc3D. No genera una malla desde cero: parte de una malla gruesa (coarse mesh) y de una imagen de referencia del mismo objeto, y devuelve geometría de alta frecuencia. El flujo muestrea latentes dispersos (sparse latents) condicionados por características de la imagen, los decodifica con un VAE disperso con autopodado (self-pruning sparse VAE) y extrae la malla final.

El sistema se organiza en tres pasadas incrementales (512³, 1024³ y 1536³ de rejilla de extracción dispersa nominal), con revectorización de la malla entre pasadas para proporcionar el soporte disperso de la siguiente. Según el informe técnico del proyecto, se entrenó con aproximadamente dos millones de activos 3D curados. La longitud de contexto no aplica: no es un modelo de lenguaje, sino un pipeline de generación y refinamiento de geometría.

Es relevante ahora porque ataca el cuello de botella habitual de los sistemas image-to-3D: la falta de detalle local (relieves, molduras, dientes, escalas, surcos concéntricos) frente a una buena silueta global. El repositorio de HuggingFace bajo el identificador `ahmed-amedo/Hi3Dv1.0` contiene únicamente los artefactos del modelo de refinamiento (7,7 GB en safetensors), sin código de entrenamiento ni arnés de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Refinamiento 3D disperso sobre Sparc3D: muestreo de latentes dispersos (sparse flow) condicionado por imagen, VAE disperso con autopodado y extraccion de malla; tres transformers por pasada (`transformer_512`, `transformer_1024`, `transformer_1024`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de geometria 3D, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | en, zh (documentacion e interfaz; la entrada del modelo es una imagen de referencia, no texto) |
| Licencia | hi3d-open-license-agreement-1.0 (etiquetada como `other`; consultar el archivo LICENSE) |
| Formato de pesos | safetensors |
| Pipeline declarado | image-to-3d |
| Resolucion de extraccion | 512³ (1 pasada), 1024³ (2 pasadas), 1536³ (3 pasadas), sobre rejillas dispersas nominales |
| Tamano del repositorio | 7,7 GB |

## Arquitectura y entrenamiento

Hi3D v1.0 hereda la arquitectura de Sparc3D. Las características de la imagen de referencia condicionan un flujo sobre coordenadas dispersas derivadas de la geometría gruesa de entrada. Ese flujo se decodifica mediante un VAE disperso que aplica autopodado (autopruning), es decir, descarta soporte vacio durante el proceso, y a continuacion se extrae la malla. Entre pasadas, la malla resultante se revectoriza para generar el soporte disperso de la pasada siguiente, de modo que la resolucion crece de forma escalonada en lugar de generarse un tensor denso de 1536³.

La escalera de pasadas es la siguiente: la pasada 1 usa una rejilla estructural nominal de 64³ con extraccion en 512³ y el transformer `transformer_512`; la pasada 2 sube a 128³ estructural y 1024³ de extraccion con `transformer_1024`; la pasada 3 usa 192³ estructural y 1536³ de extraccion con `transformer_1024`. Una peticion a 512³ ejecuta una sola pasada, 1024³ ejecuta dos y 1536³ ejecuta las tres.

En cuanto a datos, el informe tecnico del proyecto indica entrenamiento sobre aproximadamente dos millones de activos 3D curados. No se documentan en la informacion disponible el numero exacto de tokens o muestras por etapa, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no directamente trasladables a este dominio). El codigo de entrenamiento y el arnes de evaluacion del paper no se incluyen en el repositorio.

## Capacidades

- Refinamiento de geometria 3D: convierte una malla gruesa mas una imagen de referencia del mismo objeto en una malla de alta resolucion.
- Generacion de detalle local: el material del autor muestra relieves por capas, molduras arquitectonicas, bordes curvos, escamas, dientes y surcos concentricos.
- Completado multivista plausible: genera superficies ocultas coherentes (vistas frontal, trasera e inferior) en lugar de reconstruirlas exactamente.
- Escalado progresivo de resolucion: 512³, 1024³ y 1536³ de rejilla de extraccion dispersa nominal, con revectorizacion entre pasadas.
- Extraccion de malla: el pipeline termina en una malla, no en una nube de puntos ni en un campo implicito sin procesar.
- Generacion de texto: no disponible (no es un modelo de lenguaje).
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingues: no aplica al modelo; solo en y zh en documentacion.
- Vision de proposito general, audio o modo "thinking": no disponible.

## Casos de uso

- Refinamiento de fotogrametria: tomar una malla gruesa obtenida por escaneo o structure-from-motion y refinarla a 1024³ o 1536³ usando una fotografia del objeto como referencia, para recuperar molduras y relieves que la reconstruccion multivista suaviza.
- Pipeline de assets para videojuegos: integrar el refinamiento como etapa posterior a la generacion base de mallas, de forma que el artista reciba una malla con detalle local y solo tenga que retocar topologia, en lugar de esculpir el detalle a mano.
- Visualizacion de producto en comercio electronico: a partir de una imagen de catalogo y una malla base, generar una malla de alta resolucion para renderizar vistas interactivas del producto con detalle en costuras, tejidos y herrajes.
- Patrimonio y arquitectura: refinar modelos de edificios o piezas arqueologicas para documentacion, priorizando la fidelidad de molduras y superficies curvas en la pasada de 1536³.
- Fabricacion aditiva e impresion 3D: producir mallas de mayor resolucion antes del laminado, donde el detalle geometrico en la superficie afecta al resultado final de la pieza.
- VFX y previsualizacion: refinar mallas proxy de bajo coste para planos de previsualizacion o plates, manteniendo el coste de generacion acotado hasta la fase final.
- Generacion de datos sinteticos 3D: usar el refinador para elevar la resolucion de mallas de un dataset y entrenar otros modelos de reconstruccion o de difusion 3D con geometria mas rica en alta frecuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye comparativas visuales (comparacion de detalle local entre nueve metodos y comparativas multivista de cuatro objetos) y un informe tecnico en PDF, pero no se proporcionan cifras de metricas como Chamfer Distance, F-score, MMD ni PSNR en los datos facilitados. No se inventan valores.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor solo documenta la pila medida en una NVIDIA H20 de 96 GB y advierte que el pico de memoria y la viabilidad en tarjetas mas pequenas no se han establecido.
- GPU validadas: NVIDIA H20 de 96 GB. Se exige GPU NVIDIA con compute capability 8.0 o superior; la escalera de 1536³ solo se ha validado en esa GPU.
- GPU de consumo: no confirmado. No hay datos de consumo de VRAM para 512³ o 1024³, por lo que no se puede afirmar que quepa en una RTX 4090 u otras tarjetas de consumo.
- CPU: no existe ruta de inferencia en CPU.
- Entorno medido: Linux, Python 3.10.12, PyTorch 2.5.0+cu124, toolkit CUDA 12.4.131 (rango soportado 12.0-12.5), `flash-attn==2.7.4.post1`, `spconv-cu120==2.3.6`.
- Instalacion: desde codigo fuente; no hay release en PyPI ni wheel precompilado. Los kernels Triton de malla se compilan en el primer uso.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI (no es un LLM). El despliegue es via el paquete Python del repositorio de GitHub, con la clase `Sparc3DPipeline` (nombre conservado por compatibilidad), cargando `hi3d-official/Hi3Dv1.0` o un directorio local compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hi3D v1.0 | Refinador image-to-3D sobre Sparc3D | no disponible | extraccion hasta 1536³ en 3 pasadas | hi3d-open-license-agreement-1.0 | pesos en HF, codigo en GitHub |
| Sparc3D | Modelo base sobre el que se construye | no disponible | no disponible en la informacion | no disponible | demo publica en HF Spaces |
| Otros metodos image-to-3D comparados en la model card | Comparados visualmente (nueve metodos) | no disponible | no disponible | no disponible | no identificados en la informacion |

La model card presenta comparaciones visuales frente a nueve metodos, pero no los nombra ni aporta sus especificaciones en los datos disponibles, por lo que no es posible construir una comparativa cuantitativa fiable. Cualquier comparacion con TRELLIS, Hunyuan3D u otros sistemas image-to-3D quedaria fuera de la informacion proporcionada.

## Limitaciones y advertencias

- Licencia: se trata de una licencia propia (`hi3d-open-license-agreement-1.0`, etiquetada como `other`). Las condiciones de uso comercial no se detallan en la informacion disponible y deben revisarse en el archivo LICENSE antes de cualquier despliegue en produccion.
- No es un generador from scratch: requiere una malla gruesa y una imagen de referencia del mismo objeto; no acepta solo texto ni solo imagen sin geometria inicial.
- Vistas ocultas plausibles, no reconstruidas: el propio autor advierte que las vistas no observadas ilustran un completado plausible, no una reconstruccion exacta. En produccion esto implica riesgo de geometria inventada en zonas sin evidencia visual.
- Sin texturas: los colores de las figuras de comparacion son renderizados de normales de superficie, no texturas generadas.
- Resolucion alta no validada fuera de la H20: el pico de memoria y la viabilidad de la escalera de 1536³ en GPUs menores no estan establecidos.
- Sin ruta CPU y con dependencias fragiles: `flash-attn` compilado desde fuente, `spconv-cu120` fijado y toolkit CUDA en el rango 12.0-12.5; desviarse de la pila medida puede romper la instalacion.
- Sin codigo de entrenamiento ni arnes de evaluacion: no es posible reproducir el entrenamiento ni verificar las metricas con los artefactos publicados.
- Cero adopcion verificable: el repositorio indicado tiene 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de validacion independiente.
- Posible duplicado o espejo: el identificador consultado es `ahmed-amedo/Hi3Dv1.0`, mientras que la model card y los ejemplos remiten a `hi3d-official/Hi3Dv1.0`. Conviene usar el repositorio oficial y verificar la integridad de los pesos.
- Idiomas: solo en y zh en la documentacion; no hay soporte declarado de castellano.
- Sin datos de sesgo ni de robustez: no se documentan sesgos del dataset de dos millones de activos ni su procedencia, lo que impide evaluar riesgo de contaminacion o de formas estereotipadas.

## Enlaces

- Modelo en HuggingFace (identificador consultado): https://huggingface.co/ahmed-amedo/Hi3Dv1.0
- Repositorio oficial en HuggingFace referenciado en la model card: https://huggingface.co/hi3d-official/Hi3Dv1.0
- Repositorio GitHub: https://github.com/hi3d-official/Hi3Dv1.0
- Demo en vivo (Sparc3D): https://huggingface.co/spaces/ilcve21/Sparc3D
- Sitio web internacional: http://hi3d.ai/
- Sitio web para China: https://www.hi3d.cn/
- Informe tecnico (PDF): https://github.com/hi3d-official/Hi3Dv1.0/blob/main/docs/Hi3D_v1.0_Technical_Report.pdf
- Descarga directa del informe tecnico: https://github.com/hi3d-official/Hi3Dv1.0/raw/refs/heads/main/docs/Hi3D_v1.0_Technical_Report.pdf
- Documentacion del pipeline: https://github.com/hi3d-official/Hi3Dv1.0/blob/main/docs/pipeline.md
- Referencia arXiv indicada en las etiquetas del repositorio: arxiv:2505.14521
