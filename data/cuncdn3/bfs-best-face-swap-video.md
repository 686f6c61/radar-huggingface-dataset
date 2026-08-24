# Cuncdn3/BFS-Best-Face-Swap-Video

## Resumen

BFS-Best-Face-Swap-Video es un adaptador de tipo LoRA (Low-Rank Adaptation) diseñado para realizar intercambio de identidad facial (face swap) en vídeo, construido sobre los modelos base Lightricks LTX-2.3 y LTX-2.5. El modelo está orientado a flujos de trabajo de imagen-a-vídeo y vídeo-a-vídeo, y permite sustituir el rostro de una persona en una secuencia manteniendo el movimiento y la expresión de la guía original. Se presenta como una herramienta técnica para investigación de identidad digital, efectos visuales profesionales y prototipado cinematográfico.

El repositorio en HuggingFace, publicado por el usuario Cuncdn3, incluye ejemplos de vídeo que demuestran dos técnicas principales: el anclaje del fotograma cero (Frame 0 Anchoring) y un flujo de trabajo de plantilla persistente (persistent-template workflow). Aunque la model card atribuye la creación a Alissonerdx, el modelo está disponible bajo la licencia comunitaria de LTX-2 (ltx-2-community-license-agreement). El tamaño del repositorio es de 19,9 GB, lo que sugiere que incluye pesos completos o múltiples versiones del adaptador.

La relevancia actual de este modelo radica en la creciente demanda de herramientas de edición de vídeo basadas en IA que permitan transformaciones de identidad realistas, tanto para la industria del entretenimiento como para investigación académica. Su integración con la familia LTX-2 lo convierte en una opción interesante para desarrolladores que ya trabajan con esos modelos base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de vídeo LTX-2.3 y LTX-2.5 |
| Parametros totales | no disponible (el tamaño del repo es 19,9 GB, pero no se especifica el número de parámetros del adaptador) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (aplica a vídeo, no a texto) |
| Tipos de cuantizacion | no disponible (no se indican formatos de cuantización) |
| Idiomas soportados | no disponible (modelo de vídeo, sin soporte de texto explícito) |
| Licencia | ltx-2-community-license-agreement (licencia comunitaria de LTX-2) |
| Formato de pesos | safetensors (probable, dado el uso de diffusers, pero no confirmado en la información) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre los modelos base Lightricks LTX-2.3 y LTX-2.5. LTX-2 es una familia de modelos de generación de vídeo basados en transformadores, capaces de producir secuencias temporales coherentes a partir de una imagen inicial o de un vídeo de guía. El adaptador LoRA modifica los pesos del modelo base para especializarlo en la tarea de intercambio de cabezas o rostros, preservando la identidad del sujeto proporcionado en el primer fotograma mientras se mantiene el movimiento y la composición del vídeo original.

La model card describe dos flujos de trabajo principales: el anclaje del fotograma cero, donde la identidad se fija mediante la primera imagen de la secuencia, y el flujo de plantilla persistente, que permite mantener una identidad consistente a lo largo de múltiples clips. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens de vídeo utilizados ni si se aplicaron técnicas de alineamiento como RLHF o DPO. La información disponible se limita a la descripción funcional y a los ejemplos visuales.

## Capacidades

- Intercambio de identidad facial en vídeo (face swap) manteniendo el movimiento y la expresión del vídeo original.
- Generación de vídeo a partir de una imagen inicial (image-to-video) y transformación de vídeo existente (video-to-video).
- Preservación de la identidad del sujeto mediante el anclaje del primer fotograma (Frame 0 Anchoring).
- Flujo de trabajo de plantilla persistente para mantener la misma identidad a lo largo de múltiples secuencias o clips.
- Compatibilidad con los modelos base LTX-2.3 y LTX-2.5, lo que permite aprovechar las capacidades de generación de vídeo de estos modelos.
- Orientado a tareas de efectos visuales profesionales, investigación de identidad digital y prototipado cinematográfico.
- No se indica soporte para tool calling, agentes ni razonamiento multi-paso, al ser un modelo de vídeo especializado.

## Casos de uso

- Efectos visuales en producción cinematográfica: el modelo permite sustituir el rostro de un actor por otro en escenas ya rodadas, manteniendo la actuación y el movimiento originales. Es adecuado para dobles digitales o para corregir problemas de continuidad.
- Prototipado de personajes en preproducción: los directores pueden probar diferentes actores para un papel generando vídeos de prueba con el mismo movimiento de cámara y actuación, sin necesidad de rodar de nuevo.
- Investigación en identidad digital: el modelo sirve como herramienta para estudiar cómo se percibe la identidad facial en vídeo, la transferencia de expresiones y los límites del realismo sintético.
- Restauración y remasterización de contenido: se puede utilizar para reemplazar rostros en material de archivo con fines de restauración, siempre que se cuente con los derechos adecuados.
- Creación de contenido educativo y divulgativo: para demostrar técnicas de síntesis de vídeo, el modelo permite generar ejemplos visuales de intercambio de identidad con fines didácticos.
- Desarrollo de herramientas de moderación y detección de deepfakes: al disponer de un generador de face swaps, los investigadores pueden entrenar y evaluar detectores de manipulación facial, aunque esto requiere un uso ético y controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como FID, LPIPS, SSIM ni comparaciones cuantitativas con otros modelos de face swap. Tampoco se proporcionan datos de rendimiento en términos de velocidad de generación o calidad perceptual.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Dado que el adaptador se aplica sobre LTX-2.3/2.5, modelos de vídeo que suelen requerir al menos 16-24 GB de VRAM para inferencia en resolución moderada, se recomienda una GPU con al menos 24 GB para trabajar con comodidad.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100. Las GPUs de gama consumer con 24 GB (como la RTX 3090/4090) son suficientes para pruebas, pero para vídeos largos o alta resolución se necesitan GPUs de datacenter.
- No cabe en GPUs de consumo con menos de 16 GB de VRAM de forma práctica, especialmente por el tamaño del modelo base.
- Opciones de despliegue: al ser un adaptador para diffusers, se puede integrar con el pipeline de Diffusers de HuggingFace. También podría utilizarse con herramientas como ComfyUI u otros frontends que soporten LoRAs de vídeo, aunque no se especifica explícitamente.
- Latencia y throughput: no disponibles. La generación de vídeo con modelos de difusión suele ser lenta (del orden de minutos para clips cortos en GPUs consumer), pero no hay datos concretos para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|
| BFS-Best-Face-Swap-Video (este) | LoRA para vídeo | LTX-2.3 / LTX-2.5 | ltx-2-community-license-agreement | HuggingFace |
| Alissonerdx/BFS-Best-Face-Swap | LoRA (probablemente para imagen) | Qwen Image Edit 2509 (según Civitai) | no especificada | HuggingFace |
| BFS - Best Face Swap - Wan Bernini V1 Head Swap | LoRA para vídeo (Wan) | Wan Bernini V1 | no especificada | Civitai |

No se dispone de comparaciones de rendimiento cuantitativas entre estos modelos. La elección entre ellos dependerá del modelo base que el desarrollador ya utilice (LTX-2 vs. Wan) y de la compatibilidad con su pipeline existente.

## Limitaciones y advertencias

- Riesgo de uso indebido: el modelo permite crear deepfakes realistas, lo que puede vulnerar derechos de imagen, privacidad y legislación sobre medios sintéticos. La model card incluye una cláusula de exención de responsabilidad, pero el usuario final es el único responsable legal.
- Consentimiento y derechos: es obligatorio obtener consentimiento explícito de las personas cuya identidad se procesa. No se proporcionan mecanismos de verificación de consentimiento.
- Alucinaciones visuales: como todo modelo generativo, puede producir artefactos o distorsiones faciales, especialmente en condiciones de iluminación o ángulos extremos.
- Dependencia del modelo base: el rendimiento está limitado por las capacidades de LTX-2.3/2.5. Errores en el modelo base se propagan al adaptador.
- Falta de documentación técnica: no se especifican parámetros de entrenamiento, dataset, ni métricas de calidad, lo que dificulta evaluar su robustez en producción.
- Licencia restrictiva: la licencia ltx-2-community-license-agreement puede imponer condiciones de uso comercial específicas; es necesario revisar el texto completo antes de utilizarlo en proyectos comerciales.
- Tamaño del repositorio: 19,9 GB implica una descarga considerable y requisitos de almacenamiento notables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Cuncdn3/BFS-Best-Face-Swap-Video
- Modelo original (posible autor): https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap (versión sin "Video")
- Copia en ModelScope: https://www.modelscope.cn/models/Alissonerdx/BFS-Best-Face-Swap-Video
- Variante para Wan Bernini en Civitai: https://civitai.red/models/2027766/bfs-best-face-swap
- Vídeo de demostración del flujo V3: https://www.youtube.com/watch?v=HBp03iu7wLA
