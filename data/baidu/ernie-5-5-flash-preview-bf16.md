# baidu/ERNIE-5.5-Flash-Preview-BF16

## Resumen

ERNIE 5.5 Flash Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Baidu, construido a partir del checkpoint base ERNIE 5.5 Flash Base mediante fases adicionales de mid-training y post-training. Cuenta con 280.000 millones de parámetros totales, de los cuales solo 14.000 millones se activan por token, y una ventana de contexto de 1.048.576 tokens. Su arquitectura combina capas de atención HCA y MLA-DSA sobre 43 capas (1 densa y 42 MoE), con 512 expertos enrutados (top-10) más uno compartido.

El modelo está orientado a tareas de agente de larga duración: programación sobre bases de código reales, desarrollo de videojuegos (Unreal Engine, Unity, Godot), modelado 3D mediante generación de scripts para Blender y CAD, trabajo de conocimiento (hojas de cálculo, documentos, presentaciones) y creación de vídeo. Baidu lo describe como un checkpoint intermedio de post-training, de modo que algunas capacidades pueden quedar por debajo del modelo final.

La relevancia actual reside en dos factores: la relación entre parámetros totales y activos (280B/14B), que busca mantener calidad con un coste de decodificación bajo, y el uso de pesos de expertos en MXFP4 con entrenamiento consciente de cuantización (W4A8), junto con una cabeza de borrador DSpark para decodificación especulativa. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE; 43 capas (1 densa + 42 MoE); atención 37 × HCA (head dim 512) + 6 × MLA-DSA (head dim 256), 64 cabezas |
| Parametros totales | 280B (299.559.159.366 según safetensors del repo BF16) |
| Parametros activos | 14B por token |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | BF16 (este repo); FP8 blockwise + expertos MXFP4 (repo principal); FP8 blockwise (repo FP8); expertos enrutados MXFP4 con entrenamiento QAT (W4A8) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Otros datos técnicos: vocabulario de 201.216 tokens, hidden size 4096, 512 expertos enrutados (top-10) más 1 compartido, caché KV en FP8 e indexador DSA en FP4. El modo de razonamiento está siempre activo y la salida de razonamiento se devuelve en el campo `reasoning_content`.

## Arquitectura y entrenamiento

ERNIE 5.5 Flash Preview conserva la arquitectura y el tokenizador de ERNIE 5.5 Flash Base. La pila consta de 43 capas, con una capa densa inicial y 42 capas MoE. La atención se reparte entre 37 capas HCA con dimensión de cabeza 512 y 6 capas MLA-DSA con dimensión de cabeza 256, con 64 cabezas. El enrutamiento MoE selecciona 10 de 512 expertos por token, además de un experto compartido. El hidden size es 4096 y el vocabulario alcanza 201.216 entradas.

Las capacidades nuevas respecto al base provienen del mid-training y el post-training. El mid-training amplió la longitud de contexto de entrenamiento de 128K a 1M de tokens. El modelo incorpora una cabeza de borrador DSpark para decodificación especulativa, que acelera tareas de agente de larga duración con poca pérdida de precisión. Los expertos enrutados se entrenaron con cuantización consciente en MXFP4 (W4A8), y se emplean caché KV en FP8 e indexador DSA en FP4. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset; la model card menciona entrenamiento en 300.000 espacios de trabajo para dominios como finanzas y derecho (10 millones de archivos de referencia en más de 40 tipos) y en más de 150.000 entornos de creación de vídeo.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento siempre activo, con la traza de razonamiento expuesta en `reasoning_content`.
- Programación: corrección de errores en bases de código reales, construcción de aplicaciones desde cero, planificación y ejecución iterativa sobre tareas largas.
- Desarrollo de videojuegos: conocimiento de flujos de trabajo en Unreal Engine, Unity y Godot; según la model card, completó un juego wuxia en tercera persona en C++ sobre Unreal Engine 5.8 en una tarea de 11 horas y construyó cerca de 100 minijuegos móviles a partir de documentos de diseño.
- Modelado 3D y diseño: interpretación de forma, proporción y relaciones espaciales a partir de descripciones textuales, con generación de scripts para Blender y CAD.
- Trabajo de conocimiento: elaboración de hojas de cálculo, documentos y presentaciones de calidad profesional a partir de material disperso.
- Creación de vídeo: recopilación, generación y organización de material, ajuste de ritmo y entrega de piezas finalizadas en sesiones de una a dos horas.
- Capacidades de agente y razonamiento multi-paso en tareas de larga duración.
- Soporte multilingüe limitado a inglés y chino.
- No se documenta en la información disponible soporte explícito de tool calling, visión o audio; la modalidad declarada es texto de entrada y texto de salida.

## Casos de uso

- Desarrollo de videojuegos asistido: el modelo puede planificar y ejecutar tareas de programación sobre Unreal Engine, Unity o Godot durante sesiones prolongadas, lo que encaja en la producción de prototipos y mecánicas completas a partir de documentos de diseño.
- Refactorización y corrección en bases de código grandes: con 1M de tokens de contexto puede cargar módulos extensos o varios archivos relacionados y mantener coherencia entre cambios distribuidos.
- Modelado 3D paramétrico: traducción de especificaciones textuales a scripts de Blender o CAD para generar piezas de motor, edificios u otros activos, y ensamblaje de escenas complejas con activos existentes.
- Automatización de trabajo de oficina: generación de hojas de cálculo, informes y presentaciones a partir de documentación dispersa, aprovechando el entrenamiento en dominios financiero y legal.
- Producción de vídeo explicativo: organización de material, definición de ritmo y montaje de vídeos de divulgación o cómics animados en flujos de una a dos horas.
- Agentes autónomos de larga duración: la decodificación especulativa con DSpark y los expertos en FP4 reducen el coste por token en tareas de muchos pasos, lo que resulta adecuado para pipelines de agentes con contexto persistente.
- Asistentes en inglés y chino: atención al cliente o generación de contenido bilingüe en esos dos idiomas, sin cobertura documentada de otros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia una gráfica (`assets/eval-results.png`) y una tabla de 20 benchmarks, pero los valores numéricos no se incluyen en el material proporcionado, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo BF16 ocupa 599,6 GB, por lo que requiere al menos ese volumen de memoria en BF16. La variante FP8 reduce aproximadamente a la mitad el peso de los expertos no cuantizados; la variante principal con expertos MXFP4 es la más ligera de las tres.
- GPU recomendadas: para BF16 se necesitan nodos multi-GPU de clase H100 o A100 con agregación de memoria suficiente (por encima de 600 GB). Para FP8, un nodo de 8 × H100 80 GB resulta ajustado pero viable. La variante FP4 requiere hardware con kernels MXFP4.
- GPU de consumo: no cabe en ninguna GPU de consumo individual (RTX 4090, 24 GB) ni en configuraciones multi-GPU de consumo razonables.
- Opciones de despliegue: transformers (librería declarada); la model card no detalla soporte de vLLM, llama.cpp, Ollama o TGI, por lo que debe verificarse en la documentación del autor. Se ofrece API mediante Baidu Qianfan.
- Latencia y throughput: no disponibles. La decodificación especulativa con la cabeza DSpark y los expertos en FP4 están diseñados para reducir el coste de decodificación en tareas de agente largas, pero no se publican cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con modelos de la misma categoría (MoE de gran tamaño con contexto de 1M), por lo que no es posible establecer una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Es un checkpoint intermedio de post-training: Baidu advierte que algunas capacidades pueden quedar por debajo del modelo final y que el entrenamiento continúa.
- Cobertura lingüística limitada a inglés y chino; no se documenta rendimiento en castellano.
- Modalidad exclusivamente textual: sin visión, audio ni otras entradas.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no se publican tasas de error ni evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio por si incluye términos adicionales.
- El tamaño del repo BF16 (599,6 GB) y los requisitos multi-GPU limitan el despliegue a infraestructura de centro de datos.
- El modo de pensamiento está siempre activo, lo que incrementa los tokens generados y el coste por respuesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-BF16
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base
- Variante FP8: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-FP8
- Variante principal (FP8 + expertos FP4): https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- ModelScope: https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Preview-BF16
- Blog de lanzamiento: https://ernie.baidu.com/release/ernie-5-5-flash-preview/
- Chat: https://ernie.baidu.com/web
- API Qianfan: https://cloud.baidu.com/product/qianfan.html
- X (Twitter): https://x.com/Baidu_ERNIE
- Licencia: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview/blob/main/LICENSE
- Papers referenciados en los tags: arXiv 2610.24766, arXiv 2610.17959, arXiv 2610.40577
