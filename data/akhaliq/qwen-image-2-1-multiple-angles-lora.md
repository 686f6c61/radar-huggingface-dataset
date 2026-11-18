# akhaliq/Qwen-Image-2.1-Multiple-Angles-LoRA

## Resumen

Qwen-Image-2.1-Multiple-Angles-LoRA es un adaptador LoRA de control de cámara desarrollado por el usuario akhaliq sobre el modelo base Qwen/Qwen-Image-2.1, un modelo unificado de generación y edición de imágenes con soporte nativo RGBA. El adaptador permite reencuadrar cualquier objeto o sujeto desde una posición de cámara controlada: se introduce una fotografía y se solicita un azimut y una elevación concretos, y el modelo devuelve el mismo sujeto desde ese nuevo ángulo. Se trata del primer LoRA de control de cámara publicado para Qwen-Image-2.1, un formato que no existía previamente para esta base.

El adaptador implementa una gramática de poses con 36 combinaciones de azimut y elevación (12 azimuts en pasos de 30° por 4 elevaciones: 0° a nivel de ojos, 30° elevado, 60° en ángulo alto y 90° cenital), más una variante de primer plano para cada una, lo que da 72 encuadres direccionables mediante el token disparador `<mva>`. Está entrenado sobre el dataset Dome-Objaverse con pares imagen-ángulo, y en su versión 2 incorpora priorización de personajes y datos de personajes riggeados filtrados por licencia.

La relevancia actual del modelo reside en que resuelve un problema concreto de los pipelines de edición de imagen: la generación multi-vista consistente de un mismo sujeto sin perder identidad ni detalle. Frente a aproximaciones genéricas de image-to-image, este LoRA ofrece control explícito y reproducible de la cámara, con una recomendación clara de checkpoint (v2 en el paso 1.500) y evidencia documentada de evaluación fuera de distribución sobre fotografías reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión Qwen-Image-2.1 |
| Parámetros totales | no disponible (el LoRA v2 ocupa 319 MB en safetensors; el v1, 159 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el LoRA v1 se entrenó sobre base en convrot8 int8 y el v2 sobre base en bf16 a precisión completa |
| Idiomas soportados | no disponible (modelo de imagen; los prompts se documentan en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 64 en su versión 2 (rango 32 en la v1), aplicado sobre el transformer de difusión de Qwen-Image-2.1, un modelo base unificado de generación y edición con soporte nativo RGBA. El entrenamiento se realizó en dos iteraciones: la v1 con 5.028 pares imagen-ángulo, muestreo de timesteps con shift y checkpoint recomendado en el paso 1.000; la v2 con 13.328 pares, muestreo de timesteps ponderado y checkpoint recomendado en el paso 1.500. La v2 combina 9.376 pares de Dome-Objaverse con priorización de personajes y 3.952 pares derivados de 1.986 personajes riggeados filtrados por licencia.

La innovación principal es la definición de una gramática de poses explícita y discreta: 12 azimuts a intervalos de 30° combinados con 4 elevaciones (0°, 30°, 60° y 90°), más una variante close-up de cada combinación, direccionables mediante el token `<mva>` al inicio del prompt. La selección del checkpoint se documentó con dos lecturas independientes: las rejillas de muestras cada 250 pasos del propio entrenamiento y una curva de evaluación fuera de distribución sobre fotografías reales (gato, perro y un tercer sujeto reservado), comparando v1 en el paso 1.000 frente a v2 en los pasos 500 a 2.500 con el mismo prompt y semillas. La fuerza recomendada de aplicación del LoRA es de 0,8 a 1,0.

## Capacidades

- Reencuadre controlado de cámara: dado un sujeto, genera la misma escena desde un azimut y una elevación especificados mediante el token `<mva>`.
- Cobertura de 72 encuadres direccionables: 12 azimuts × 4 elevaciones × 2 variantes (normal y close-up).
- Edición image-to-image con preservación de identidad del sujeto y del fondo.
- Funciona sobre fotografías reales fuera del dominio de entrenamiento (perro, gato y manzana de Wikimedia Commons documentados en la model card).
- Capacidad mejorada en la v2 para personajes y detalle de identidad fuera de distribución, incluyendo personajes riggeados.
- Integración con diffusers y ComfyUI.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.

## Casos de uso

- Generación de vistas de producto para comercio electrónico: a partir de una única fotografía de un objeto se pueden generar los 12 azimuts a nivel de ojos para construir un visor 360° interactivo, sin necesidad de sesión fotográfica adicional.
- Creación de hojas de personaje para animación y videojuegos: el LoRA permite renderizar un personaje riggeado desde vista trasera y cenital manteniendo la identidad y el detalle escultórico, como se documenta en la prueba de personajes de la v2.
- Previsualización de escenas en pipelines de VFX: los artistas pueden solicitar ángulos alternativos de un elemento ya renderizado para evaluar la composición antes de un render completo.
- Aumento de datasets de visión por computador: generar vistas sintéticas multi-ángulo de objetos reales para entrenar modelos de reconstrucción 3D o de reconocimiento con mayor cobertura de puntos de vista.
- Prototipado rápido en diseño industrial: reencuadrar un prototipo fotografiado desde ángulos elevados y cenitales para revisar la volumetría sin modelado 3D previo.
- Ilustración editorial y conceptual: obtener el mismo sujeto desde un ángulo dramático (60° o cenital) manteniendo coherencia con la imagen de referencia aprobada por el cliente.
- Reconstrucción multi-vista para fotogrametría asistida: generar vistas intermedias entre ángulos conocidos para densificar la cobertura antes de un pipeline de reconstrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, métricas de consistencia multi-vista) en la información disponible. La model card documenta evaluación cualitativa mediante rejillas de muestras por paso de entrenamiento y una curva fuera de distribución sobre tres sujetos reales, pero sin cifras numéricas comparativas.

## Requisitos de hardware

- El LoRA en sí ocupa 319 MB (v2, rango 64) o 159 MB (v1, rango 32); el requisito real de VRAM lo determina el modelo base Qwen-Image-2.1, cuyo tamaño no se especifica en la información disponible.
- No se dispone de estimaciones de VRAM para inferencia del modelo base en la información proporcionada.
- No se dispone de listado de GPU recomendadas ni confirmación de que el conjunto quepa en GPU de consumo en la información proporcionada.
- Opciones de despliegue documentadas: diffusers y ComfyUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Control de cámara | Ángulos direccionables | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Multiple-Angles-LoRA (este) | LoRA sobre Qwen-Image-2.1 | Sí, gramática `<mva>` | 72 encuadres (12 azimuts × 4 elevaciones × close-up) | Apache 2.0 | Hugging Face, diffusers, ComfyUI |
| Zero123 / Zero123-XL | Modelo de difusión para novel view synthesis | Sí, condicionado por elevación y azimut relativos | Continuo (no discreto) | No disponible en la información | No disponible en la información |
| LoRA de control de cámara para Stable Diffusion (p. ej. familias de camera control) | LoRA sobre SD/SDXL | Sí | Variable según adaptador | Variable | No disponible en la información |

No se dispone de datos comparativos de rendimiento numérico entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del adaptador ni del modelo base en la información disponible.
- Riesgo de deriva hacia la copia de la vista de referencia: la model card advierte que en el paso 2.500 del entrenamiento los resultados empiezan a copiar el ángulo de la foto original en lugar de mover la cámara; se recomienda usar el paso 1.500 de la v2 o el 1.000 de la v1.
- Los checkpoints de los pasos 250 a 750 están infraentrenados y el artefacto de smoke test debe ignorarse.
- La generalización a personajes arbitrarios del mundo real depende de la curva fuera de distribución documentada; la prueba de personajes de la v2 es sobre sujetos en distribución.
- El adaptador solo cubre 72 encuadres discretos; no ofrece control continuo de cámara.
- Los prompts documentados están en inglés y no se especifica el soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen-Image-2.1 puede tener sus propias condiciones que deben verificarse por separado.
- No se documentan limitaciones de longitud de contexto ni de idioma para este adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/Qwen-Image-2.1-Multiple-Angles-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Dataset de entrenamiento v2: https://huggingface.co/datasets/akhaliq/qwen21-multiple-angles-train-v2
- Dashboard de entrenamiento v2 (trackio): https://huggingface.co/spaces/akhaliq/qwen21-multiple-angles-v2-trackio
- Checkpoint recomendado v2: https://huggingface.co/akhaliq/Qwen-Image-2.1-Multiple-Angles-LoRA/blob/main/checkpoints_v2/angles_v2_full_qwen21_multiple_angles_v2_qwen21_multiple_angles_v2_000001500.safetensors
- Checkpoint recomendado v1: https://huggingface.co/akhaliq/Qwen-Image-2.1-Multiple-Angles-LoRA/blob/main/multiple_angles_step1000.safetensors
