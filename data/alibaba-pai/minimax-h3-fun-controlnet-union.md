# alibaba-pai/MiniMax-H3-Fun-Controlnet-Union

## Resumen

MiniMax-H3-Fun-Controlnet-Union es un checkpoint ControlNet de tipo union para el generador de vídeo MiniMax-H3, desarrollado por alibaba-pai y entrenado con el pipeline VideoX-Fun. Su función es condicionar la generación de vídeo del modelo base sobre una señal de control espacial o estructural: un único checkpoint cubre Canny, Depth, HED, MLSD y Pose, además de inpainting de vídeo, sin necesidad de cambiar de pesos por cada condición. El repositorio ocupa 6,8 GB e incluye únicamente la rama de control (`control_proj_in` más 5 `control_blocks`), que se carga sobre el transformer de MiniMax-H3.

El modelo resuelve el problema de control fino en video-to-video: en lugar de depender solo de un prompt de texto, permite dirigir la estructura, la profundidad, los bordes o la pose del vídeo generado. Es relevante para flujos de producción de vídeo generativo donde se exige consistencia temporal y fidelidad a una referencia, y llega con la advertencia explícita del autor de que se trata de una versión legacy: existe un checkpoint 2.0 recomendado para uso nuevo.

La arquitectura subyacente es un transformer de difusión (MiniMax-H3) con un VAE de vídeo que decodifica fotogramas en múltiplos de `17 * n + 5`, a 24 fps fijos y con duración máxima de 15 segundos. El checkpoint está destilado con guidance, de modo que se ejecuta con `guidance_scale = 1.0` y una sola pasada por paso, sin classifier-free guidance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet-Union sobre transformer de difusion MiniMax-H3 (VideoX-Fun) |
| Parametros totales | no disponible (el checkpoint de control ocupa 6,8 GB; los parametros del modelo base no se detallan) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; duracion de video maxima de 15 s a 24 fps |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de texto se procesa mediante el codificador del modelo base) |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (`MiniMax-H3-Fun-Controlnet-Union.safetensors`) |

## Arquitectura y entrenamiento

El checkpoint implementa una rama de control union que se acopla a 5 de los 50 bloques del transformer de MiniMax-H3, concretamente a las capas 0, 10, 20, 30 y 40. Cada skip de control se suma a la rama principal mediante una proyección con compuerta cero (zero-gated projection), un esquema habitual para preservar el comportamiento del modelo base al inicializar el control. La entrada de control se ensancha a `control_in_dim = 49` cuando se activa el inpainting, sumando a los canales latentes el latente enmascarado y la máscara. El parámetro `control_context_scale` escala cada skip antes de la suma: `1.0` aplica el control más fuerte, valores menores lo debilitan y `0.0` desactiva la rama.

El entrenamiento se realizó con el pipeline VideoX-Fun, aunque la model card no especifica el volumen de datos, la composición del dataset ni si hubo etapas de RLHF o DPO. El modelo está destilado con guidance: se ejecuta con `guidance_scale = 1.0` en una única pasada por paso. La generación se ajusta al vídeo de control: el número de fotogramas se recorta al mayor `17 * n + 5` que el VAE de vídeo puede decodificar, el lienzo conserva la relación de aspecto del vídeo de control dentro de un presupuesto de píxeles `height * width` (ambos múltiplos de 32) y la tasa es fija de 24 fps.

## Capacidades

- Control union en un solo checkpoint: Canny, Depth, HED, MLSD y Pose para generación video-to-video.
- Inpainting de vídeo mediante la entrada de control ampliada a 49 canales.
- Generación text-to-video e image-text-to-video heredada del modelo base MiniMax-H3.
- Control de la fuerza de condicionamiento mediante `control_context_scale` (de 0.0 a 1.0).
- Ajuste automático de resolución y duración al vídeo de control, con tope de 15 segundos.
- Inferencia destilada con guidance: una pasada por paso con `guidance_scale = 1.0`.
- No se documentan capacidades de tool calling, agentes, audio ni modos de razonamiento; es un modelo generativo de vídeo.

## Casos de uso

- Previsualización de animáticas con control de pose: a partir de un vídeo de captura de movimiento o de una secuencia de esqueleto, el modelo genera el personaje final manteniendo la pose fotograma a fotograma, útil en preproducción de animación.
- Estilización de metraje real con preservación de estructura: usando la condición Canny o HED sobre un vídeo rodado, se obtiene una versión estilizada sin perder los contornos de la escena.
- Reconstrucción de profundidad en postproducción: con mapas de profundidad como control se generan planos coherentes para composición o conversión a 3D aproximada.
- Rotoscopia y eliminación de elementos: el modo inpainting permite sustituir objetos o personas en un vídeo manteniendo la coherencia temporal gracias a la máscara y al latente enmascarado.
- Visualización arquitectónica: con la condición MLSD se generan recorridos de interiores o exteriores a partir de líneas estructurales extraídas de planos o bocetos.
- Prototipado de efectos para publicidad: combinación de prompt detallado con control de bordes o profundidad para iterar variaciones de un plano concreto sin reentrenar por condición.
- Control de cámara y composición en vídeo vertical: el lienzo respeta la relación de aspecto del vídeo de control, lo que facilita generar piezas para formatos sociales a partir de una referencia ya encuadrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye ejemplos cualitativos (vídeos de control y salida para Canny, Depth, HED, MLSD y Pose) generados con `num_inference_steps = 40`, `guidance_scale = 1.0`, `control_context_scale = 1.00` y semilla 43.

## Requisitos de hardware

- El checkpoint de control pesa 6,8 GB en safetensors y debe cargarse junto con el transformer completo de MiniMax-H3, por lo que la VRAM necesaria es la del modelo base más la rama de control.
- No se especifica en la información disponible la VRAM exacta ni las GPU recomendadas para el modelo base.
- No hay datos publicados sobre si cabe en GPU de consumo (RTX 4090 u otras); el requisito dominante es el tamaño del transformer de MiniMax-H3, no el del checkpoint de control.
- Despliegue mediante el repositorio VideoX-Fun: clonar el código, crear `models/Diffusion_Transformer`, descargar el modelo base y este checkpoint, y ejecutar `examples/minimax_h3_fun/predict_v2v_control.py` (o `predict_v2v_control_inpaint.py` para inpainting).
- No se publican cifras de latencia ni throughput; a modo de referencia, los ejemplos usan 40 pasos de inferencia con una sola pasada por paso al estar destilado con guidance.

## Comparativa con modelos similares

| Modelo | Tipo | Condiciones de control | Contexto / duracion | Licencia | Estado |
|---|---|---|---|---|---|
| MiniMax-H3-Fun-Controlnet-Union | ControlNet-Union sobre MiniMax-H3 | Canny, Depth, HED, MLSD, Pose, inpainting | Hasta 15 s a 24 fps | minimax-h3-community-license-agreement | Legacy, sustituido por 2.0 |
| MiniMax-H3-Fun-Controlnet-Union-2.0 | ControlNet-Union sobre MiniMax-H3 | no disponible en la informacion | no disponible | minimax-h3-community-license-agreement | Version recomendada por el autor |
| MiniMax-H3 (base) | Transformer de difusion text-to-video | Solo prompt de texto | Limitado por el VAE de video | minimax-h3-community-license-agreement | Modelo base |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas de otros autores en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Versión legacy: el autor indica explícitamente que el checkpoint 2.0 produce mejores resultados y es el recomendado para uso nuevo.
- Licencia comunitaria de MiniMax-H3: es necesario revisar el acuerdo (`LICENSE`) antes de cualquier uso comercial; no es una licencia de código abierto estándar.
- El checkpoint contiene solo la rama de control; no es utilizable de forma autónoma sin el modelo base MiniMax-H3.
- La duración está limitada a 15 segundos y el número de fotogramas se recorta a `17 * n + 5`, lo que puede truncar la duración deseada.
- Resolución condicionada al presupuesto de píxeles y a múltiplos de 32; no se puede fijar libremente.
- El autor recomienda prompts detallados (escena, sujeto y cámara) para mayor estabilidad; prompts escuetos pueden degradar el resultado.
- No se documentan sesgos, tasas de alucinación ni evaluación de sesgos demográficos o culturales en la información disponible.
- No se especifican requisitos de VRAM ni rendimiento medido, lo que dificulta planificar el despliegue en producción.
- El modelo está pensado para generación de vídeo; no ofrece tool calling, agentes ni otras capacidades de los LLM.

## Enlaces

- Hugging Face: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union
- Versión 2.0 recomendada: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio de código VideoX-Fun: https://github.com/aigc-apps/VideoX-Fun
- Ejemplo de inferencia video-to-video con control: `examples/minimax_h3_fun/predict_v2v_control.py`
- Ejemplo de inpainting: `examples/minimax_h3_fun/predict_v2v_control_inpaint.py`
- Licencia: `LICENSE` en el repositorio de Hugging Face
