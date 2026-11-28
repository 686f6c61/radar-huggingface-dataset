# Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic

## Resumen

Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic es una variante "decensored" (o "abliterated") del modelo multimodal Qwen2.5-VL-3B-Instruct desarrollado por Alibaba Qwen. La modificacion la firma el usuario Kasemcyber y consiste en una ablacion de direcciones de activacion en las capas 14 a 31 del transformer, aplicada mediante la herramienta Heretic v2.1.0, con el objetivo de eliminar los rechazos (refusals) del modelo original ante peticiones que este consideraria sensibles. El modelo conserva la arquitectura y los pesos base, por lo que mantiene las capacidades vision-language del original.

El modelo base, Qwen2.5-VL-3B-Instruct, es un transformer multimodal de 3.754.622.976 parametros (aproximadamente 3,75 mil millones) que procesa imagen, video y texto. Incorpora un encoder visual ViT optimizado con window attention, SwiGLU y RMSNorm, y un LLM Qwen2.5 con mRoPE extendido a la dimension temporal para comprension de video con FPS dinamico. La ventana de contexto del modelo base es de 32.768 tokens segun la documentacion de Qwen2.5-VL, aunque la model card de esta variante no la declara explicitamente.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta un caso de estudio de "abliteration" reproducible (el autor incluye el directorio `reproduce` con los parametros exactos de la ablacion); por otro, advierte de que se trata de un modelo con la licencia restrictiva qwen-research y con la alineacion de seguridad eliminada, lo que lo hace inadecuado para despliegues en produccion sin salvaguardas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (ViT + LLM Qwen2.5) con mRoPE; ablacion de rangos arbitrarios (ARA) en capas 14-31 |
| Parametros totales | 3.754.622.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No declarada en la model card de esta variante; el modelo base Qwen2.5-VL-3B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | El autor anuncia versiones GGUF (Q4_K_M, Q8_0, IQ) en su hoja de ruta; no se confirma su publicacion en la informacion disponible |
| Idiomas soportados | Ingles (segun la model card); el modelo base es multilingue, pero esta variante declara solo `en` |
| Licencia | qwen-research (heredada del modelo base) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL-3B-Instruct: un encoder visual ViT con window attention, SwiGLU y RMSNorm alineado estructuralmente con el LLM, mas un decoder Qwen2.5 con mRoPE (multimodal rotary position embedding) que incorpora IDs y alineacion temporal absoluta para el procesamiento de video con muestreo dinamico de FPS. El modelo base fue entrenado por Alibaba Qwen con datos multimodales (imagen, video, texto) y ajustado por instrucciones; la model card original no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset en la informacion proporcionada.

La innovacion de esta variante concreta es la ablacion ARA (Arbitrary-Rank Ablation) aplicada con Heretic v2.1.0 sobre las capas 14 a 31, con los parametros `preserve_good_behavior_weight=0.8194`, `steer_bad_behavior_weight=0.3634`, `overcorrect_relative_weight=0.2414` y `neighbor_count=9`. El autor reporta una reduccion de rechazos de 99/100 en el modelo original a 3/100 en esta variante, con una divergencia KL de 0.3007 respecto al original. No se realizo un reentrenamiento completo: se trata de una modificacion de pesos por ablacion de direcciones, y el autor declara el proceso reproducible mediante el directorio `reproduce`.

## Capacidades

- Generacion de texto y razonamiento multimodal: descripcion de imagenes, analisis de graficos, iconos, layouts y textos dentro de imagenes.
- Comprension de video de mas de una hora con capacidad de localizar segmentos temporales concretos (event pinpointing) gracias al mRoPE temporal.
- Localizacion visual: generacion de bounding boxes y puntos con salidas JSON estables para coordenadas y atributos.
- Salidas estructuradas: extraccion de datos de facturas, formularios, tablas y escaneos, orientada a finanzas y comercio.
- Uso como agente visual: razonamiento y direccion dinamica de herramientas, con capacidades de computer use y phone use declaradas por el modelo base.
- Soporte de tool calling / function calling: heredado del modelo base Qwen2.5-VL-Instruct (no se detalla en la model card de esta variante).
- Capacidades multilingues: el modelo base es multilingue, pero esta variante declara solo ingles.
- Modo "sin rechazos": la ablacion elimina practicamente los refusals (3/100) ante peticiones que el original rechazaria.

## Casos de uso

- Extraccion de datos de documentos financieros: procesamiento de facturas, formularios y tablas escaneadas con salida JSON estructurada, aprovechando la capacidad de structured output y la ventana de contexto del modelo base para documentos de varias paginas.
- Analisis de video de vigilancia o monitorizacion: localizacion de eventos concretos en grabaciones de mas de una hora mediante el mRoPE temporal y el muestreo dinamico de FPS, util para revision de incidencias en entornos controlados.
- Automatizacion de agentes visuales en escritorio: uso del modelo como controlador de computer use para tareas de RPA (rellenar formularios, navegar interfaces) en pipelines internos donde la ausencia de rechazos evita interrupciones del flujo.
- Investigacion sobre alineacion y seguridad: estudio academico del efecto de la ablacion ARA sobre el comportamiento del modelo, comparando la tasa de refusals y la divergencia KL con el original, gracias a la reproducibilidad declarada.
- Prototipado de asistentes de accesibilidad: descripcion de imagenes y lectura de texto en capturas para usuarios con discapacidad visual, en un entorno de desarrollo sin restricciones de contenido que puedan bloquear descripciones de imagenes medicas o sensibles.
- Generacion de descripciones de imagenes para catalogos y e-commerce: analisis de productos, atributos y texto en imagen con salida estructurada, en un despliegue local con cuantizacion GGUF si se publican las versiones anunciadas.
- Evaluacion de robustez de filtros de seguridad: uso del modelo como generador adversarial controlado para probar clasificadores de contenido y sistemas de moderacion en laboratorio.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son los de la ablacion, no los de benchmarks de tareas. Se presentan a continuacion:

| Metrica | Esta variante | Qwen2.5-VL-3B-Instruct original |
|---|---|---|
| Refusals | 3/100 | 99/100 |
| Divergencia KL | 0.3007 | 0 (por definicion) |

El autor no publica resultados de MMMU, DocVQA, MathVista ni otros benchmarks para esta variante ablacionada. Los benchmarks del modelo base (Qwen2.5-VL-3B-Instruct) que aparecen en la model card son los siguientes, y no deben atribuirse a la variante sin verificacion empirica:

| Benchmark | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B (base) |
|---|---|---|---|
| MMMU val | 52.3 | 54.1 | 53.1 |
| MMMU-Pro val | 32.7 | 30.5 | 31.6 |
| AI2D test | 81.4 | 83.0 | 81.5 |
| DocVQA test | 91.6 | 94.5 | 93.9 |
| InfoVQA test | 72.1 | 76.5 | 77.1 |
| TextVQA val | 76.8 | 84.3 | 79.3 |
| MMBench-V1.1 test | 79.3 | 80.7 | 77.6 |
| MMStar | 58.3 | 60.7 | 55.9 |
| MathVista testmini | 60.5 | 58.2 | 62.3 |
| MathVision full | 20.9 | 16.3 | 21.2 |
| MVBench | 71.6 | 67.0 | 67.0 |
| VideoMME | 63.6/62.3 | 69.0/63.3 | 67.6/61.5 |
| MLVU | 48.3 | no disponible | 68.2 |
| LVBench | no disponible | no disponible | 43.3 |
| MMBench-Video | 1.73 | 1.44 | 1.63 |
| EgoSchema | no disponible | no disponible | 64.8 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 7,5 GB solo para los pesos (3,75 mil millones de parametros), mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 10-12 GB de VRAM para contexto corto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto amplio. Para contextos largos y video, se recomienda A100/H100 por ancho de banda de memoria.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantizacion GGUF Q4, en GPUs de 8 GB como RTX 3070 o RTX 4060 Ti, siempre que el autor publique dichas cuantizaciones (anunciadas en la hoja de ruta, no confirmadas en la informacion disponible).
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp y Ollama solo si se publican las versiones GGUF anunciadas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic | 3,75 B | no declarado (base: 32.768) | qwen-research | Si (imagen, video, texto) | Ablacion ARA; 3/100 refusals; solo ingles declarado |
| Qwen/Qwen2.5-VL-3B-Instruct | 3,75 B | 32.768 | qwen-research | Si (imagen, video, texto) | Modelo base; 99/100 refusals; multilingue |
| InternVL2.5-4B | 4 B (aprox.) | no disponible | no disponible | Si | Comparable en benchmarks de imagen; sin variante decensored conocida |
| Qwen2-VL-7B | 7 B (aprox.) | no disponible | no disponible | Si | Generacion anterior; mayor tamano, rendimiento mixto frente al 3B en benchmarks |

## Limitaciones y advertencias

- La ablacion elimina la alineacion de seguridad: el modelo responde a peticiones que el original rechazaria (3/100 refusals frente a 99/100). No debe desplegarse en atencion al cliente ni en aplicaciones de cara al publico sin filtros externos.
- La divergencia KL de 0.3007 respecto al original indica un cambio no trivial en la distribucion de salida; es esperable una degradacion en tareas que dependen de la alineacion, y no se han publicado benchmarks que cuantifiquen el impacto en MMMU, DocVQA o MathVista.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad para esta variante; el proceso de ablacion puede afectar a la calibracion del modelo.
- Licencia qwen-research: restringe el uso comercial. Es imprescindible revisar los terminos del modelo base antes de cualquier despliegue productivo.
- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta verificado y puede ser inferior al del modelo base multilingue.
- Contexto: la longitud de contexto no se declara en la ficha de esta variante; se asume la del modelo base (32.768 tokens), pero no esta confirmada para los pesos ablacionados.
- Cuantizaciones GGUF: anunciadas en la hoja de ruta del autor, pero no confirmadas en la informacion disponible; verificar el repositorio antes de planificar un despliegue en CPU o GPU de gama baja.
- Sesgos: no se han publicado analisis de sesgo para esta variante; la eliminacion de rechazos puede amplificar sesgos presentes en el modelo base.
- Reproducibilidad: el autor declara el proceso reproducible mediante el directorio `reproduce`, pero no se aportan hashes ni verificacion independiente en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Heretic (herramienta de ablacion): https://heretic-project.org
- Blog de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- Repositorio GitHub de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Qwen Chat: https://chat.qwenlm.ai/
- Paper Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper Qwen-VL (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Paper Qwen Technical Report (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- DOI del modelo: https://doi.org/10.57967/hf/11531
- Apoyo al autor: https://www.buymeacoffee.com/Kasemcyber
