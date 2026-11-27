# baidu/ERNIE-5.5-Flash-Preview-FP8

## Resumen

ERNIE 5.5 Flash Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Baidu, publicado como checkpoint intermedio de post-entrenamiento sobre ERNIE 5.5 Flash Base. Cuenta con 280.000 millones de parametros totales, de los cuales 14.000 millones se activan por token, y una ventana de contexto de 1.048.576 tokens (1M). Su arquitectura combina atencion HCA y MLA-DSA en 43 capas (1 densa y 42 MoE), con 512 expertos enrutados (top-10) mas uno compartido y un vocabulario de 201.216 tokens.

El modelo esta orientado a tareas de codigo, modelado 3D, trabajo de conocimiento y creacion de contenido, e incorpora un modo de razonamiento (thinking) activado por defecto con niveles de esfuerzo configurables (low, medium, high). Incluye una cabeza de borrador DSpark para decodificacion especulativa, lo que acelera tareas de agente de larga duracion con poca perdida de precision.

La relevancia actual radica en su context window de 1M tokens, su entrenamiento especifico para flujos agénticos (300.000 espacios de trabajo en dominios financiero y legal, mas de 150.000 entornos de creacion de video) y su licencia Apache 2.0, que facilita su adopcion comercial. Esta version concreta (FP8) ofrece pesos en FP8 blockwise junto con la cabeza DSpark, pensada para hardware sin soporte de kernels FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE): 43 capas (1 densa + 42 MoE), 37 x HCA (head dim 512) + 6 x MLA-DSA (head dim 256), 64 cabezas |
| Parametros totales | 299.559.241.286 (~280B segun model card) |
| Parametros activos | 14B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8 blockwise (esta version); el repo default usa MXFP4 en expertos enrutados (W4A8); existe variante BF16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos: 512 expertos enrutados (top-10) + 1 compartido, hidden size 4096, vocabulario 201.216, cache KV en FP8, indexer DSA en FP4. Tamano del repo: 301,9 GB.

## Arquitectura y entrenamiento

ERNIE 5.5 Flash Preview mantiene la arquitectura y el tokenizer de ERNIE 5.5 Flash Base y anade una cabeza de borrador DSpark para decodificacion especulativa. La red combina dos mecanismos de atencion: 37 capas con HCA (head dim 512) y 6 capas con MLA-DSA (head dim 256), con 64 cabezas en total. El modelo es de tipo MoE con 512 expertos enrutados (top-10 por token) mas un experto compartido, sobre 43 capas de las cuales una es densa. La cuantizacion es consciente del entrenamiento: los expertos enrutados se entrenan en MXFP4 (W4A8), con cache KV en FP8 e indexer DSA en FP4.

Las nuevas capacidades respecto al modelo base provienen de mid-training y post-training. El mid-training extendio la longitud de contexto de entrenamiento de 128K a 1M tokens. El post-training incluyo entrenamiento en 300.000 espacios de trabajo para dominios como finanzas y derecho (10 millones de archivos de referencia en mas de 40 tipos de archivo) y en mas de 150.000 entornos de creacion para video (divulgacion cientifica, comic en movimiento, edicion creativa y temas de actualidad). No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni los detalles de RLHF/DPO. El modelo se describe como un checkpoint intermedio, con post-training en curso.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto; el esfuerzo de razonamiento se configura con `reasoning_effort` en low, medium o high (por defecto high) y se desactiva con `enable_thinking: false`.
- Codigo: correccion en codebases reales, construccion de aplicaciones complejas desde cero y planificacion/ejecucion iterativa en tareas largas.
- Desarrollo de videojuegos: conocimiento de Unreal Engine, Unity y Godot; en una tarea de 11 horas genero un juego wuxia en tercera persona en C++ sobre Unreal Engine 5.8, y a partir de documentos de diseno construyo cerca de 100 minijuegos moviles.
- Modelado 3D y diseno: deduce forma, proporcion y relaciones espaciales a partir de texto y escribe scripts para Blender y software CAD.
- Trabajo de conocimiento: hojas de calculo, documentos y presentaciones de calidad profesional a partir de material disperso.
- Creacion de video: recopila, genera y organiza material, define visuales y ritmo, y entrega un video terminado en trabajos de una a dos horas.
- Capacidades agénticas y multi-step reasoning en un arnes de agente (agent harness).
- Decodificacion especulativa mediante la cabeza DSpark.
- Idiomas: ingles y chino.
- No se menciona soporte explicito de tool calling/function calling en la informacion disponible.
- Modalidad: solo texto (text in, text out); sin vision ni audio.

## Casos de uso

- Desarrollo de videojuegos asistido: el modelo puede planificar y ejecutar tareas de codigo largas en Unreal Engine, Unity o Godot, incluyendo la generacion de prototipos completos o minijuegos a partir de documentos de diseno, gracias a su contexto de 1M tokens y a su capacidad de iterar durante horas.
- Modelado 3D y CAD automatizado: a partir de una descripcion textual, deduce proporciones y relaciones espaciales y genera scripts que manejan Blender o software CAD para construir piezas, edificios o escenas detalladas.
- Generacion de codigo en produccion: puede corregir codigo en repositorios reales y construir aplicaciones desde cero; su ventana de 1M tokens permite cargar codebases extensos en una sola pasada, y la decodificacion especulativa reduce la latencia en tareas de agente.
- Automatizacion de trabajo de conocimiento: procesa material disperso en mas de 40 tipos de archivo (entrenado en 300.000 espacios de trabajo de finanzas y derecho) para generar hojas de calculo, documentos e informes profesionales.
- Creacion de video automatizada: recopila y organiza material, define la narrativa visual y el ritmo, y entrega un video terminado en trabajos de una a dos horas, adecuado para divulgacion cientifica, comic en movimiento o edicion creativa.
- Investigacion y analisis de documentos extensos: con 1M tokens de contexto puede ingerir libros, expedientes legales o informes financieros completos y razonar sobre ellos en multiples pasos con el modo thinking en nivel high.
- Asistentes agénticos de larga duracion: integrado en un arnes de agente, puede ejecutar flujos multi-paso sostenidos (planificar, ejecutar, verificar, iterar) en tareas de ingenieria o gestion documental.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card referencia una grafica (`assets/eval-results.png`) y una tabla con 20 benchmarks, pero los valores concretos no se incluyen en el texto proporcionado. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~280B parametros totales y pesos FP8 blockwise (mas expertos en FP4 en el repo default), el repositorio ocupa 301,9 GB; la inferencia requiere agregar cache KV (en FP8) para el contexto utilizado, que con 1M tokens puede ser muy elevada. No se dispone de cifras oficiales de VRAM minima en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion. Por el volumen de pesos, se requiere un despliegue multi-GPU en hardware de centro de datos (clase A100/H100 o superior); no se confirman modelos concretos.
- GPU de consumo: no cabe en GPUs de consumo individuales dado el tamano del repositorio (301,9 GB). No se dispone de datos de configuraciones multi-GPU de consumo.
- Opciones de despliegue: la model card indica compatibilidad con `transformers`; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible. Existe un endpoint compatible (`endpoints_compatible`) y API via Qianfan (Baidu Cloud).
- Latencia y throughput: no disponibles. La model card menciona que el modelo "decodifica rapido" y que los pesos FP4 de expertos junto con la cabeza DSpark aceleran las tareas de agente largas, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoria (MoE de gran escala con contexto de 1M). Se indica "no disponible" para la comparativa cuantitativa. Como referencia estructural, el propio ERNIE 5.5 Flash Base comparte arquitectura y tokenizer con este modelo, y existen variantes del mismo modelo en BF16 y FP4 (repo default) que difieren unicamente en precision.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview-FP8 | ~280B | 14B | 1M | Apache 2.0 | Hugging Face, ModelScope |
| ERNIE-5.5-Flash-Preview (FP4) | ~280B | 14B | 1M | Apache 2.0 | Hugging Face, ModelScope |
| ERNIE-5.5-Flash-Preview-BF16 | ~280B | 14B | 1M | Apache 2.0 | Hugging Face, ModelScope |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint intermedio de post-entrenamiento: la model card advierte que algunas capacidades pueden quedar por debajo de lo esperado porque el entrenamiento no ha finalizado; el rendimiento puede cambiar en la version oficial.
- Riesgo de alucinacion: no se documenta en la informacion disponible, pero es un riesgo inherente a los modelos de lenguaje; debe validarse la salida en produccion.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Licencia Apache 2.0: permite uso comercial, pero debe revisarse el archivo LICENSE del repositorio para confirmar terminos exactos.
- Hardware: el tamano del repositorio (301,9 GB) y la ventana de 1M tokens implican requisitos de memoria elevados; en hardware sin kernels FP4 debe usarse la variante FP8 o BF16.
- Para fine-tuning se recomienda partir del repositorio BF16, no de esta variante FP8.
- No se confirma soporte de tool calling/function calling ni de vision o audio; la modalidad es exclusivamente texto.
- El modo thinking esta activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se ajusta `reasoning_effort` o se desactiva.

## Enlaces

- Hugging Face (FP8): https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-FP8
- Hugging Face (repo default, FP4): https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Hugging Face (BF16): https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-BF16
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base
- ModelScope (FP8): https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Preview-FP8
- Blog de lanzamiento: https://ernie.baidu.com/release/ernie-5-5-flash-preview/
- Chat ERNIE: https://ernie.baidu.com/web
- API Qianfan (Baidu Cloud): https://cloud.baidu.com/product/qianfan.html
- X (Twitter) oficial: https://x.com/Baidu_ERNIE
- Licencia: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview/blob/main/LICENSE
- Papers referenciados en los tags: arXiv:2610.24766, arXiv:2610.17959, arXiv:2610.40577
