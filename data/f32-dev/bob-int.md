# f32-dev/bob-int

## Resumen

bob-int es un modelo de lenguaje pequeño de 33,6 millones de parámetros desarrollado por f32-dev, cuyo nombre técnico es bob 2-ck_13000. Su característica diferencial no es la capacidad lingüística, sino que todo su entrenamiento e inferencia se ejecutan mediante aritmética entera de punto fijo bajo un contrato registrado: cada sitio de activación y gradiente tiene un exponente y una anchura fijos, y cualquier operación que se salga de ese registro se detiene con un sitio nombrado y un código de salida, en lugar de saturar o envolver silenciosamente. Esto garantiza que los resultados sean byte-exactamente reproducibles entre distintas plataformas, arquitecturas y GPUs, sin depender del orden de suma en coma flotante.

El modelo está entrenado exclusivamente en inglés y tiene una ventana de contexto de 8192 tokens. Es el motor que responde en el sitio web bob-talk.org, y los pesos publicados en HuggingFace se corresponden con ese despliegue, verificable mediante el hash SHA-256 del checkpoint. La relevancia actual del proyecto radica en que demuestra una propiedad poco común en el ecosistema de IA: la reproducibilidad total del entrenamiento y la inferencia, incluso reanudando el entrenamiento en hardware distinto y obteniendo checkpoints idénticos. El autor no reclama que el modelo sea preciso, inteligente o seguro; su interés declarado es la aritmética, no la calidad del texto generado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (8 capas, 8 cabezas, head_dim 64, d_model 512, d_mlp 2048) |
| Parametros totales | 33.608.704 (incluye tabla de posiciones aprendida) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (usa aritmética de punto fijo con registro de exponentes y anchos por sitio) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (los pesos y archivos; la marca "bob" no está incluida) |
| Formato de pesos | Tensores enteros little-endian en bruto, con registro de exponentes en `registration/exponents.json`; no es un checkpoint de transformers/safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer estándar con 8 capas, 8 cabezas de atención con dimensión de cabeza 64, dimensión de modelo 512 y MLP de 2048 unidades. El vocabulario tiene 8192 tokens y la ventana de contexto es de 8192 tokens. El entrenamiento se realizó en agosto de 2026, alcanzando el paso 13.000, y todo el proceso usa aritmética entera de punto fijo bajo un contrato registrado: cada sitio de activación y gradiente tiene un exponente y una anchura fijos, y cualquier operación que exceda esos límites produce un fallo con un sitio nombrado y un código de salida tipado. Esta maquinaria de rechazo es parte integral del sistema y se demostró en vivo durante el entrenamiento: una de las dos piernas del entrenamiento terminó en un evento de desacuerdo registrado en un sitio concreto, se corrigió el registro y la ejecución continuó.

El autor documenta dos resultados de portabilidad: el propio entrenamiento de bob 2 se guardó a mitad de ejecución y se reanudó en máquinas alquiladas de dos generaciones de GPUs de un mismo proveedor, con digests de checkpoint coincidentes en los puntos de unión. Además, una prueba sintética separada de 80 pasos (no estos pesos) ejecutó el mismo entrenamiento entero en un Apple M4 vía Metal y en una NVIDIA GTX 1070 vía Vulkan, produciendo pesos y estado de optimizador byte-idénticos, con hashes SHA-256 coincidentes. El autor no hace afirmaciones cruzadas entre proveedores para esta trayectoria concreta.

## Capacidades

- Generación de texto en inglés, con calidad propia de un modelo de 33,6 millones de parámetros.
- Determinismo byte-exacto: para un mismo prompt, semilla y esfuerzo, los tokens de respuesta tienen un digest idéntico en cualquier build conforme.
- Reproducibilidad del entrenamiento: el checkpoint incluye el estado del optimizador y los registros de inicialización, permitiendo reanudar la trayectoria desde el paso 0 o desde un paso intermedio.
- Aritmética de punto fijo con rechazo explícito ante overflow, en lugar de saturación o envoltura silenciosa.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Verificación de reproducibilidad en pipelines de IA: el modelo puede servir como referencia para validar que una infraestructura de inferencia produce resultados idénticos entre entornos, gracias a su digest de salida predecible.
- Pruebas de integración y regresión en sistemas de generación de texto: al ser determinista, permite comparar salidas exactas entre versiones de código o configuraciones de hardware.
- Investigación académica sobre aritmética de punto fijo en entrenamiento de redes neuronales: el repositorio incluye registros de exponentes y anchos por sitio, así como el estado del optimizador, lo que facilita el estudio de la técnica.
- Educación en sistemas de aprendizaje automático deterministas: el modelo es lo bastante pequeño para ejecutarse en CPU y analizar su comportamiento interno.
- Auditoría de integridad de despliegues: el servidor público de bob-talk.org rechaza arrancar si los pesos no coinciden con el hash SHA-256, un patrón reutilizable para garantizar que un modelo no ha sido alterado.
- Experimentación con reanudación de entrenamiento en hardware heterogéneo: la capacidad de reanudar desde un checkpoint con digests coincidentes permite probar la portabilidad de la aritmética entera en distintos entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de calidad lingüística (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. La única propiedad cuantificada es el determinismo, documentado mediante digests SHA-256 de checkpoints y de respuestas.

## Requisitos de hardware

- El modelo tiene 33,6 millones de parámetros, lo que en formato de punto flotante de 32 bits ocuparía aproximadamente 134 MB. Con la aritmética de punto fijo, el tamaño del checkpoint es de 0,1 GB en el repositorio.
- Es viable ejecutar inferencia en CPU sin necesidad de GPU, dado el tamaño reducido.
- Cualquier GPU moderna con al menos 1 GB de VRAM debería ser suficiente para inferencia; no hay datos oficiales de consumo de memoria.
- El entrenamiento se realizó en GPUs de un único proveedor (no especificado), y se demostró reanudación en dos generaciones de ese proveedor.
- No se mencionan opciones de despliegue específicas como vLLM, llama.cpp u Ollama; el formato de pesos no es compatible con esos ecosistemas sin conversión.
- La inferencia está disponible públicamente en https://bob-talk.org, que sirve como referencia de latencia y comportamiento.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos pequeños con aritmética entera y determinismo byte-exacto). El autor menciona una encuesta de once sistemas existentes a fecha de 2026-08-17, pero no proporciona nombres ni resultados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es pequeño (33,6 M de parámetros) y su calidad de prosa es limitada; no debe usarse para tareas que requieran comprensión profunda o generación de alta calidad.
- Solo está entrenado en inglés; no soporta otros idiomas.
- No se garantiza precisión, inteligencia ni seguridad; el autor declara explícitamente que la propiedad interesante es la aritmética, no el vocabulario.
- El formato de pesos es propietario (tensores enteros con registro de exponentes) y no es compatible con `from_pretrained` de transformers ni con safetensors.
- La licencia Apache-2.0 cubre los pesos y archivos, pero la marca "bob" y sus signos distintivos no están incluidos en esa concesión.
- El determinismo se ha demostrado en un conjunto limitado de configuraciones (un proveedor de GPU para el entrenamiento principal, y una prueba sintética entre Metal y Vulkan). No se hacen afirmaciones sobre todas las combinaciones posibles de hardware y software.
- El código de inferencia aún no se ha publicado en un repositorio público; la única vía de uso es el sitio web bob-talk.org.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/f32-dev/bob-int
- Sitio de inferencia: https://bob-talk.org
- Digest SHA-256 del checkpoint: `53ae7609f22e580ac1d67ad1995dfc2d87c0ebcd5f60f3ab7136345f502c2890`
- No se proporcionan papers, blogs ni repositorios de código adicionales en la información disponible.
