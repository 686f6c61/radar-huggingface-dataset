# Shrijanagain/GEMMA-3D-CODER

## Resumen

GEMMA-3D-CODER es un ajuste fino (fine-tune) experimental publicado por el usuario Shrijanagain sobre el modelo base `google/gemma-4-E2B`. Está especializado en dos tareas concretas: generación de código de propósito general y creación de escenas 3D y activos de juego mediante Three.js y tecnologías web estándar. El modelo traduce instrucciones en lenguaje natural a escenas HTML/JavaScript autocontenidas o a activos compatibles con GLB para motores como Godot.

El modelo conserva la arquitectura multimodal del Gemma 4 original (pipeline `image-text-to-text`), aunque la model card solo documenta ejemplos de generación de código y escenas 3D a partir de texto. Cuenta con 5.123.178.051 parámetros en formato safetensors y un repositorio de 10,3 GB, lo que sugiere pesos en precisión de 16 bits. La licencia declarada es Apache 2.0, heredada del modelo base.

Su relevancia es limitada y muy específica: se trata de un experimento con cero descargas y cero «likes» en el momento de la consulta, orientado a un nicho muy concreto (generación procedural de geometría low-poly y voxel para videojuegos). No sustituye a un modelo de código generalista, sino que apunta a flujos de trabajo de prototipado rápido de activos 3D desde el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de google/gemma-4-E2B); detalles no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea float16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `google/gemma-4-E2B`, del que no se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente describe el objetivo del ajuste: enseñar al modelo a generar escenas Three.js autocontenidas (cargando la librería desde cdnjs) y activos low-poly o voxel compatibles con GLB para Godot.

El pipeline declarado es `image-text-to-text`, lo que indica que el modelo base es multimodal y conserva la torre de visión, aunque el autor no documenta ninguna capacidad ni ejemplo de uso con imágenes. Tampoco se especifican innovaciones técnicas propias del ajuste (decodificación especulativa, atención lineal, etc.); la información disponible se limita a los ejemplos de prompts y al snippet de uso con `transformers`.

## Capacidades

- Generación de código de propósito general, según la descripción del autor.
- Generación de escenas 3D interactivas en Three.js dentro de un único archivo HTML autocontenido.
- Creación de activos low-poly y voxel construidos a partir de bloques cúbicos visibles.
- Generación de geometría procedural orientada a motores de juego, con mención explícita a Godot y al formato GLB.
- Uso de la librería Three.js cargada desde CDN (cdnjs) en el código generado.
- Procesamiento de conversaciones multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidad multimodal heredada del modelo base (pipeline image-text-to-text), aunque no documentada ni ejemplificada por el autor.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Prototipado rápido de activos 3D para videojuegos: el modelo genera un archivo HTML con Three.js que renderiza un activo low-poly (por ejemplo, un duende o un hábitat) directamente en el navegador, lo que permite validar ideas de arte antes de modelar en Blender.
- Generación de geometría voxel para entornos de juego: a partir de una descripción textual, produce escenas construidas con bloques cúbicos visibles, útiles como base para mapas o decorados en motores con estética voxel.
- Pipeline hacia Godot: el modelo está instruido para generar activos compatibles con GLB, de modo que el resultado puede exportarse e importarse en el editor de Godot como malla de baja poligonización.
- Docencia y demostraciones de gráficos web: sirve para generar ejemplos didácticos de escenas Three.js autocontenidas que los estudiantes pueden abrir y modificar en el navegador.
- Generación de código de propósito general en inglés: el autor lo describe como un modelo de codificación general, por lo que puede emplearse para tareas de scripting cotidianas, aunque sin benchmarks que respalden su calidad frente a modelos especializados.
- Experimentación con modelos multimodales pequeños: al derivar de un modelo image-text-to-text de 5.100 millones de parámetros, puede usarse como banco de pruebas para estudiar cómo el ajuste fino sobre código 3D afecta a las capacidades del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 10-11 GB solo para los pesos (5.123 millones de parámetros × 2 bytes), más el overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 5-6 GB; en 4 bits, alrededor de 3-4 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 o H100 para despliegue en producción con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia cómoda en float16.
- GPU de consumo: cabe en tarjetas con 12 GB o más en float16; en tarjetas de 8 GB requeriría cuantización, que el autor no documenta.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"` (único método documentado); el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla. No hay confirmación de soporte en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GEMMA-3D-CODER | 5.123 M | no disponible | Apache 2.0 | Fine-tune para código y escenas Three.js/GLB |
| google/gemma-4-E2B (base) | no disponible | no disponible | Apache 2.0 (heredada) | Modelo multimodal generalista |
| Gemma 3 (familia, Google DeepMind) | no disponible en la información | no disponible | no disponible | Modelos ligeros ejecutables en una sola GPU o TPU |

La información disponible no permite comparar rendimiento numérico con alternativas, ya que no se han publicado benchmarks del modelo ni del checkpoint base en los datos proporcionados.

## Limitaciones y advertencias

- Modelo experimental: cero descargas y cero «likes» en el momento de la consulta, sin validación por parte de la comunidad.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en generación de código, matemáticas o razonamiento.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Riesgo de alucinación: al ser un fine-tune pequeño sobre un modelo base, puede generar APIs de Three.js inexistentes o código que no se ejecuta correctamente; requiere validación manual del HTML generado.
- Capacidad multimodal no documentada: aunque el pipeline es image-text-to-text, el autor no ofrece ejemplos ni garantías de que la entrada de imágenes funcione tras el ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las condiciones del modelo base `google/gemma-4-E2B`.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones largas o archivos de código extensos sin medir el límite empíricamente.
- Dependencia de CDN externa: los ejemplos cargan Three.js desde cdnjs, lo que introduce una dependencia de red en el código generado y un riesgo en entornos sin conexión.

## Enlaces

- Hugging Face: https://huggingface.co/Shrijanagain/GEMMA-3D-CODER
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Gemma 3 — Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Gemma — Google DeepMind: https://deepmind.google/models/gemma/
