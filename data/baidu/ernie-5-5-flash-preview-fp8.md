# baidu/ERNIE-5.5-Flash-Preview-FP8

## Resumen

ERNIE 5.5 Flash Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Baidu, publicado como checkpoint intermedio de post-entrenamiento sobre ERNIE 5.5 Flash Base. Cuenta con 280.000 millones de parámetros totales y 14.000 millones activos por token, con una ventana de contexto de 1.048.576 tokens (1M), lo que lo sitúa en la liga de modelos de contexto ultralargo orientados a tareas de agente y codificación de larga duración.

La arquitectura combina 43 capas (1 densa y 42 MoE) con 512 expertos enrutados (top-10) más un experto compartido, e incorpora una mezcla de atención HCA y MLA-DSA. El modelo se distribuye cuantizado de forma nativa: pesos FP8 por bloques, expertos enrutados en MXFP4 (W4A8, entrenado con quantization-aware training), caché KV en FP8 e indexador DSA en FP4. Esta variante concreta del repositorio (FP8) mantiene los pesos en FP8 por bloques junto con la cabeza de borrador DSpark para decodificación especulativa.

Su relevancia actual radica en que Baidu lo posiciona como un modelo de agente de propósito general con capacidades destacadas en código, modelado 3D, trabajo de conocimiento y creación de vídeo, publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines propios. Al ser un checkpoint de preview, el autor advierte de que algunas capacidades pueden quedar por debajo del modelo final, cuyo post-entrenamiento sigue en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (43 capas: 1 densa + 42 MoE); atención 37 × HCA (head dim 512) + 6 × MLA-DSA (head dim 256), 64 cabezas |
| Parametros totales | 280B (299.559.241.286 según safetensors) |
| Parametros activos | 14B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | Blockwise FP8; expertos enrutados en MXFP4 (W4A8, QAT); caché KV FP8; indexador DSA FP4; también disponible en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); repositorio de 301,9 GB |

Otros datos técnicos: tamaño oculto 4096, vocabulario de 201.216 tokens, 512 expertos enrutados (top-10) más 1 compartido, modo de razonamiento siempre activo (el razonamiento se devuelve en `reasoning_content`), cabeza de borrador DSpark para decodificación especulativa.

## Arquitectura y entrenamiento

ERNIE 5.5 Flash Preview es un transformer de tipo Mixture-of-Experts que reutiliza la arquitectura y el tokenizador de ERNIE 5.5 Flash Base. El modelo intercala dos mecanismos de atención: 37 capas con HCA (head dim 512) y 6 capas con MLA-DSA (head dim 256), con 64 cabezas. El enrutamiento MoE selecciona los 10 mejores de 512 expertos enrutados, además de un experto compartido, lo que explica que solo 14B de los 280B parámetros estén activos por token. La innovación técnica más destacable es la inclusión de una cabeza de borrador DSpark para decodificación especulativa, que acelera tareas de agente de larga duración con poca pérdida de precisión.

El entrenamiento parte de ERNIE 5.5 Flash Base, con una fase de mid-training que extiende la longitud de contexto de 128K a 1M tokens, seguida de post-entrenamiento. La model card menciona entrenamiento en 300.000 espacios de trabajo para dominios como finanzas y derecho, con 10 millones de ficheros de referencia en más de 40 tipos de archivo, y más de 150.000 entornos de creación para vídeo. La cuantización no es un añadido posterior: los expertos enrutados se entrenan con quantization-aware training en MXFP4 (W4A8), lo que permite servir el modelo con menor huella de memoria. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset, ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento siempre activo, devuelto en el campo `reasoning_content`.
- Codificación en producción: corrección de errores en bases de código reales y construcción de aplicaciones complejas desde cero, con planificación e iteración sobre tareas largas.
- Desarrollo de videojuegos: conocimiento de Unreal Engine, Unity y Godot; según el autor, completó un juego wuxia en tercera persona en C++ sobre Unreal Engine 5.8 en una tarea de 11 horas y construyó cerca de 100 minijuegos móviles a partir de documentos de diseño.
- Modelado 3D y diseño: interpreta forma, proporción y relaciones espaciales a partir de descripciones textuales y genera scripts para Blender y software CAD.
- Trabajo de conocimiento: elaboración de hojas de cálculo, documentos y presentaciones de calidad profesional a partir de material disperso.
- Creación de vídeo: recopilación, generación y disposición de material, con definición de visuales y ritmo, en trabajos de una a dos horas por pieza.
- Soporte de agentes y razonamiento multi-paso en arneses de agente (la model card muestra trabajos completados de extremo a extremo).
- Capacidades multilingües limitadas a inglés y chino.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).

## Casos de uso

- Desarrollo de videojuegos asistido: el modelo puede planificar y ejecutar tareas de codificación largas en Unreal Engine, Unity o Godot, generando y depurando C++ o scripts de gameplay en sesiones de varias horas gracias a su ventana de 1M tokens.
- Modelado 3D paramétrico: a partir de una descripción textual, el modelo deduce proporciones y relaciones espaciales y produce scripts para Blender o CAD, lo que permite automatizar la generación de piezas de ingeniería o arquitectónicas.
- Automatización de trabajo de conocimiento: procesa material disperso en más de 40 tipos de fichero y entrega hojas de cálculo, documentos o presentaciones, adecuado para dominios como finanzas y derecho por su entrenamiento en 300.000 espacios de trabajo.
- Producción de vídeo semiautomática: recopila y organiza material, define visuales y ritmo y entrega una pieza terminada en una o dos horas, útil para explicadores de divulgación, cómics animados y ediciones creativas.
- Agentes autónomos de larga duración: la combinación de contexto de 1M tokens, modo de pensamiento y decodificación especulativa con DSpark lo hace apto para pipelines de agente que encadenan muchos pasos sobre un mismo estado.
- Migración y refactorización de bases de código: con 1M de contexto puede cargar repositorios completos y razonar sobre dependencias entre ficheros, algo útil en tareas de modernización de código heredado.
- Generación de minijuegos y prototipos: a partir de documentos de diseño puede producir lotes de prototipos jugables, como los cerca de 100 minijuegos móviles que el autor reporta haber construido.

## Benchmarks y rendimiento

La model card indica que el modelo se evalúa en 20 benchmarks y publica una gráfica (`assets/eval-results.png`) con ocho de ellos, además de una tabla con los 20. Sin embargo, los valores numéricos no están incluidos en la información disponible, por lo que no se presentan cifras.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio FP8 ocupa 301,9 GB, por lo que la inferencia requiere al menos esa cantidad de memoria agregada en pesos, además de la caché KV.
- La variante por defecto del modelo usa expertos en FP4; en hardware sin kernels FP4 debe usarse el repositorio FP8 o el BF16. Para fine-tuning, el autor recomienda partir del repositorio BF16.
- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio, no cabe en GPU de consumo y requiere despliegues multi-GPU o multi-nodo.
- GPU recomendadas: no especificadas en la información disponible; por el volumen de pesos, se orienta a aceleradores de centro de datos (A100, H100 y sucesores) en configuración multi-GPU.
- Cabe en consumer GPU: no.
- Opciones de despliegue: librería transformers; el repositorio declara compatibilidad con endpoints. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor destaca que la decodificación es rápida gracias a los expertos FP4 y a la cabeza de borrador DSpark, sin cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A continuación se resumen los rasgos diferenciales frente a la categoría de MoE de gran tamaño con contexto ultralargo:

| Aspecto | ERNIE 5.5 Flash Preview | Alternativas de la categoría |
|---|---|---|
| Parámetros totales / activos | 280B / 14B | no disponible |
| Contexto | 1M tokens | no disponible |
| Licencia | Apache 2.0 | no disponible |
| Idiomas | en, zh | no disponible |
| Cuantización nativa | FP8 + MXFP4 con QAT | no disponible |

## Limitaciones y advertencias

- Es un checkpoint intermedio de post-entrenamiento: el propio autor advierte de que algunas capacidades pueden quedar por debajo del modelo final y que el entrenamiento continúa.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otras lenguas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan tasas concretas en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- El modo de pensamiento está siempre activo, lo que incrementa los tokens generados y el coste por consulta en producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio por si incluye condiciones adicionales.
- El tamaño (301,9 GB en FP8) y los 280B parámetros totales excluyen el despliegue en hardware de consumo y exigen infraestructura multi-GPU.
- La variante por defecto requiere kernels FP4; en hardware sin ellos hay que recurrir a los repositorios FP8 o BF16, con mayor huella de memoria.
- No se han publicado cifras de benchmarks en la información disponible, lo que limita la evaluación objetiva previa a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-FP8
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base
- Repositorio principal (expertos FP4): https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Variante BF16: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-BF16
- ModelScope: https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Preview-FP8
- Blog de lanzamiento: https://ernie.baidu.com/release/ernie-5-5-flash-preview/
- Chat de ERNIE: https://ernie.baidu.com/web
- API Qianfan: https://cloud.baidu.com/product/qianfan.html
- X (Twitter) de Baidu ERNIE: https://x.com/Baidu_ERNIE
- Licencia: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview/blob/main/LICENSE
- Papers referenciados en los tags: arXiv:2610.24766, arXiv:2610.17959, arXiv:2610.40577
