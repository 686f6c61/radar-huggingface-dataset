# baidu/ERNIE-5.5-Flash-Preview

## Resumen

ERNIE 5.5 Flash Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Baidu, construido sobre el checkpoint base ERNIE 5.5 Flash Base y afinado mediante mid-training y post-training. Se trata de un checkpoint intermedio de post-entrenamiento: el autor indica que el entrenamiento sigue en curso y que la version oficial se publicara mas adelante. El modelo esta disenado para tareas de codigo, modelado 3D, trabajo de conocimiento y creacion de contenido, y destaca por combinar un tamano considerable (280B parametros totales) con un coste de inferencia contenido (14B parametros activos por token) gracias a su arquitectura MoE.

La innovacion principal es su ventana de contexto de 1.048.576 tokens, extendida desde los 128K del modelo base durante el mid-training, lo que lo situa en la liga de modelos de contexto ultralargo. Ademas, incorpora una cabeza de borrador DSpark para decodificacion especulativa y pesos de expertos en FP4, lo que acelera tareas de agente de larga duracion con poca perdida de precision.

Es relevante ahora porque combina licencia Apache 2.0, contexto de 1M tokens, capacidades de agente y un formato de pesos optimizado para despliegue (FP8 blockwise + expertos FP4), lo que lo hace atractivo tanto para investigacion como para produccion en infraestructura con aceleradores modernos. Esta disponible en ingles y chino, y se distribuye en tres variantes de precision (FP4/FP8 por defecto, FP8 puro y BF16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (43 capas: 1 densa + 42 MoE), atencion hibrida 37 x HCA (head dim 512) + 6 x MLA-DSA (head dim 256), 64 cabezas |
| Parametros totales | 299.559.241.286 (~280B segun el autor) |
| Parametros activos | 14B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8 blockwise + expertos MXFP4 (W4A8, entrenado con quantization-aware); variantes FP8 pura y BF16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Expertos | 512 enrutados (top-10) + 1 compartido |
| Tamano oculto | 4096 |
| Vocabulario | 201.216 tokens |
| Modo thinking | Activado por defecto; desactivable con `enable_thinking: false`; `reasoning_effort` en low / medium / high (por defecto high) |
| Cache KV | FP8; indexador DSA en FP4 |
| Tamano del repo | 165,9 GB |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura y el tokenizador de ERNIE 5.5 Flash Base. Se trata de un transformer MoE con 43 capas (una densa y 42 MoE), tamano oculto de 4096 y 64 cabezas de atencion. La atencion es hibrida: 37 capas usan HCA (head dim 512) y 6 capas usan MLA-DSA (head dim 256). El MoE cuenta con 512 expertos enrutados con top-10 activacion mas un experto compartido, lo que explica la relacion entre los 280B parametros totales y los 14B activos por token.

Las capacidades nuevas provienen del mid-training y el post-training, no de cambios arquitectonicos. El mid-training amplio la longitud de contexto de entrenamiento de 128K a 1M tokens. La model card no detalla el volumen de tokens de entrenamiento ni la composicion exacta del dataset, aunque menciona datos de dominios especificos: 300.000 espacios de trabajo en areas como finanzas y derecho (10 millones de archivos de referencia en mas de 40 formatos) y mas de 150.000 entornos de creacion de video. Tampoco se especifica si se uso RLHF o DPO, por lo que ese dato no esta disponible. La innovacion tecnica destacable es la cabeza de borrador DSpark para decodificacion especulativa, junto con el entrenamiento quantization-aware que permite pesos de expertos en MXFP4 (W4A8) con poca perdida de precision.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y niveles de esfuerzo configurables (low, medium, high).
- Codigo: correccion en codebases reales, construccion de aplicaciones complejas desde cero y planificacion/iteracion sostenida en tareas largas.
- Conocimiento de motores de juego: Unreal Engine, Unity y Godot. La model card cita una tarea de 11 horas que produjo un juego wuxia en tercera persona en C++ sobre Unreal Engine 5.8 y casi 100 minijuegos moviles a partir de documentos de diseno.
- Modelado 3D y diseno: interpretacion de forma, proporcion y relaciones espaciales a partir de texto, y generacion de scripts para Blender y CAD.
- Trabajo de conocimiento: elaboracion de hojas de calculo, documentos y presentaciones de calidad profesional a partir de material disperso.
- Creacion de video: recopilacion, generacion y organizacion de material, ajuste de visuales y ritmo, con sesiones de una a dos horas por pieza.
- Capacidades de agente y razonamiento multi-paso, orientadas a tareas de larga duracion.
- Multilingue limitado a ingles y chino.
- Decodificacion especulativa mediante la cabeza DSpark, que acelera la inferencia en tareas de agente prolongadas.

## Casos de uso

- Desarrollo de videojuegos asistido: el modelo puede planificar y ejecutar tareas de programacion en Unreal Engine, Unity y Godot, incluyendo la escritura de logica de juego en C++ y la iteracion sobre errores en sesiones de varias horas, gracias a su contexto de 1M tokens y a su capacidad de mantener el plan a lo largo de la tarea.
- Generacion de codigo en produccion: su soporte de tareas de agente y su contexto ultralargo permiten integrarlo en pipelines que necesitan analizar repositorios completos o mantener coherencia entre multiples archivos durante refactorizaciones.
- Modelado 3D automatizado: a partir de una descripcion textual, el modelo genera scripts para Blender o CAD que construyen piezas de motor, edificios o escenas complejas, lo que resulta util en prototipado industrial y arquitectonico.
- Automatizacion de trabajo de conocimiento: en despachos de finanzas o derecho, el modelo puede procesar material disperso en multiples formatos (mas de 40 tipos de archivo) y producir hojas de calculo, informes o presentaciones, aprovechando su entrenamiento en 300.000 espacios de trabajo de esos dominios.
- Creacion de video semiautomatizada: para equipos de contenido, el modelo puede reunir material, generar y organizar clips, y definir el ritmo de una pieza en sesiones de una a dos horas, orientado a explicadores de divulgacion, motion comics o ediciones creativas.
- Agentes autonomos de larga duracion: la combinacion de contexto de 1M tokens, modo thinking configurable y decodificacion especulativa DSpark lo hace adecuado para tareas de agente que requieren muchas iteraciones sin perder el hilo.
- Analisis de documentos extensos en ingles o chino: con 1M tokens de contexto puede procesar libros, expedientes o bases de codigo completas en una sola pasada, sin necesidad de fragmentacion.

## Benchmarks y rendimiento

La model card incluye una imagen de resultados (`assets/eval-results.png`) y menciona que la tabla asociada lista 20 benchmarks, pero el contenido numerico de esa tabla no esta disponible en la informacion proporcionada. No se han podido extraer cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio por defecto (expertos FP4 + FP8 blockwise) ocupa 165,9 GB, por lo que la inferencia requiere al menos esa cantidad de memoria agregada. La variante FP8 pura y la BF16 son sustancialmente mayores; el peso en BF16 de un modelo de ~300B parametros ronda los 600 GB.
- GPU recomendadas: aceleradores con soporte de FP4 y FP8, como las generaciones recientes de NVIDIA (H100 para FP8; Blackwell para FP4). En hardware sin kernels FP4 debe usarse la variante FP8 o BF16.
- Cabe en GPU de consumo: no de forma completa. Un modelo de este tamano no cabe en una unica RTX 4090 (24 GB) ni en configuraciones consumer tipicas; requeriria despliegue multi-GPU o el uso de la API de Baidu Qianfan.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles (tag `endpoints_compatible`) y la API de Qianfan. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card indica que el modelo "decodifica rapido" gracias a FP4 y a la cabeza DSpark, pero no aporta cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento numericos del modelo ni de alternativas concretas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A continuacion se comparan solo los atributos estructurales conocidos frente a referencias genericas de la misma categoria (MoE de gran tamano con contexto largo); los datos de los competidores no se han verificado en esta busqueda y se marcan como no disponibles cuando no se conocen con certeza.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ERNIE 5.5 Flash Preview | ~280B | 14B | 1M | Apache 2.0 | Hugging Face, ModelScope, API Qianfan |
| Alternativa MoE de gran tamano (referencia generica) | no disponible | no disponible | no disponible | no disponible | no disponible |

No disponible: no se han identificado en la informacion proporcionada modelos comparables concretos con especificaciones verificables.

## Limitaciones y advertencias

- Es un checkpoint intermedio de post-entrenamiento: el autor advierte que algunas capacidades pueden quedar por debajo de lo esperado porque el entrenamiento no ha finalizado, y que la version oficial mejorara.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan datos especificos de tasas de error.
- Sesgos conocidos: no se documentan en la informacion disponible.
- Requisitos de hardware elevados: el formato por defecto necesita kernels FP4; en hardware sin ellos hay que recurrir a FP8 o BF16, con mayor coste de memoria.
- La licencia Apache 2.0 permite uso comercial, pero al ser una preview conviene validar el comportamiento en produccion antes de adoptarlo de forma estable.
- El contexto de 1M tokens no implica necesariamente atencion efectiva a toda la ventana; no se han publicado evaluaciones de recuperacion en contextos largos en la informacion disponible.
- No se confirma soporte de motores de inferencia habituales (vLLM, llama.cpp, Ollama, TGI), lo que puede limitar opciones de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base
- Variante FP8: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-FP8
- Variante BF16: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-BF16
- ModelScope: https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Preview
- Blog de lanzamiento: https://ernie.baidu.com/release/ernie-5-5-flash-preview/
- Chat: https://ernie.baidu.com/web
- API Qianfan: https://cloud.baidu.com/product/qianfan.html
- X (Twitter) de Baidu ERNIE: https://x.com/Baidu_ERNIE
- Licencia: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview/blob/main/LICENSE
- Papers citados en los tags: arxiv:2610.24766, arxiv:2610.17959, arxiv:2610.40577 (sin URL directa en la informacion disponible)
