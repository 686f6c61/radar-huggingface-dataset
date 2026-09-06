# AST-1320/qwen-edit-skin

## Resumen

`qwen-edit-skin` es un adaptador LoRA (Low-Rank Adaptation) para el modelo de edición de imágenes `Qwen/Qwen-Image-Edit-2509`, desarrollado por el usuario AST-1320 a partir de un trabajo original de tlennon-ie. Su propósito es mejorar el realismo de la piel humana en retratos y escenas con sujetos, añadiendo textura, poros y tonos naturales que el modelo base puede no generar con suficiente detalle.

Está entrenado para ser usado en flujos de trabajo de edición de imagen (image-to-image), donde recibe una instrucción en inglés y modifica la imagen de entrada. El entrenamiento se realizó con la herramienta AI-Toolkit en una NVIDIA RTX 5090 durante 5000 pasos, con una resolución de 512, 768 y 1024 píxeles. El repositorio en Hugging Face tiene un tamaño de 3.4 GB e incluye el adaptador LoRA y ejemplos comparativos. La licencia es Apache-2.0 y el modelo es relevante para fotógrafos, artistas digitales y profesionales que necesitan retocar o generar retratos hiperrealistas sin perder la identidad del sujeto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusion Qwen/Qwen-Image-Edit-2509 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se distribuye como adaptador LoRA, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 tanto para capas lineales como convolucionales, con valores alfa iguales al rango. Se entrena sobre el modelo base `Qwen/Qwen-Image-Edit-2509`, que es un editor de imágenes con capacidades de edición multi-imagen y consistencia de identidad. El LoRA se añade al modelo base para especializarlo en la mejora de detalles de piel.

El proceso de entrenamiento utilizó un dataset construido de forma inversa: se partió de retratos reales con piel visible, se etiquetaron como imágenes objetivo (después) y se modificaron en Photoshop aplicando desenfoque gaussiano y suavizado para eliminar textura, tono y poros, convirtiéndolas en imágenes de control (antes). Así, el modelo aprende a restaurar la textura natural a partir de versiones artificialmente suavizadas.

Los parámetros de entrenamiento incluyen: 5000 pasos, batch size 1, gradient accumulation 1, learning rate 1.0e-04, optimizador AdamW8bit, scheduler flowmatch, precisión bf16 y resoluciones de 512, 768 y 1024 píxeles. El uso de AdamW8bit reduce el consumo de memoria, permitiendo el entrenamiento en hardware de consumo como la RTX 5090.

## Capacidades

- Edición de imágenes mediante instrucciones en inglés, especialmente orientada a retratos y sujetos humanos.
- Mejora del realismo de la piel: textura, poros, tonos naturales y reducción del efecto "uncanny valley".
- Compatible con el flujo de trabajo image-to-image de diffusers y con la carga de adaptadores LoRA.
- Mantiene la consistencia de identidad del sujeto gracias a las capacidades del modelo base.
- No soporta generación de texto, tool calling, razonamiento simbólico ni tareas de lenguaje.
- Soporte de idiomas: únicamente inglés para las instrucciones.

## Casos de uso

- Retoque fotografico profesional: los fotógrafos pueden aplicar el LoRA en retratos para realzar la textura de la piel y eliminar el aspecto artificial de generaciones previas, manteniendo la identidad del modelo.
- Generacion de retratos hiperrealistas para medios digitales: permite producir imágenes de personas con un nivel de detalle cutáneo más creíble en campañas publicitarias, revistas o contenido editorial.
- Correccion de artefactos en imagenes generadas por IA: cuando un modelo base produce piel demasiado lisa o plástica, el LoRA puede aplicarse sobre la imagen para reintroducir poros y variaciones tonales naturales.
- Postproduccion en fotografia de moda: los retocadores pueden integrar el adaptador en su pipeline para acelerar el trabajo de suavizado y realce de piel, reduciendo el tiempo de edición manual.
- Mejora de texturas en renders 3D o personajes virtuales: artistas digitales pueden usar el LoRA para añadir realismo a pieles sintetizadas en entornos de renderizado o videojuegos.
- Investigacion en sintesis de texturas de piel: permite estudiar la generación de texturas cutáneas realistas y comparar resultados con otros enfoques de edición de imagen.
- Flujos de trabajo de edicion por lotes: estudios de fotografía pueden automatizar la mejora de piel en series de retratos usando el adaptador en combinación con scripts de diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un adaptador sobre un modelo de difusión de gran tamaño, la VRAM requerida depende del modelo base `Qwen/Qwen-Image-Edit-2509`. El entrenamiento se realizó en una GPU con 32 GB de VRAM, por lo que se recomienda una capacidad similar para inferencia.
- GPU recomendadas: NVIDIA RTX 5090 para entrenamiento; para inferencia, una GPU con al menos 16-24 GB de VRAM es razonable, aunque no se ha validado oficialmente.
- Compatibilidad con GPU de consumo: el entrenamiento fue posible en una RTX 5090, lo que sugiere que la inferencia puede ejecutarse en GPUs de gama alta para consumidores, siempre que el modelo base quepa en memoria.
- Opciones de despliegue: se puede cargar mediante la librería diffusers, usando la funcionalidad de adaptadores LoRA. No se menciona soporte para vLLM, llama.cpp, TGI ni Ollama, ya que es un modelo de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables en la informacion proporcionada. El adaptador comparte la arquitectura y el modelo base con otros LoRAs de edición de imagen publicados en plataformas como Civitai, pero no se han encontrado métricas objetivas para comparar rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El dataset de entrenamiento se compone de retratos variados, pero no se especifica la diversidad demográfica, por lo que podrían existir sesgos en la representación de tipos de piel.
- Riesgo de alucinacion: al aplicar el LoRA con valores de fuerza altos, el modelo puede introducir texturas excesivas, artefactos o alterar la identidad del sujeto.
- Limitaciones de contexto y idioma: el adaptador solo acepta instrucciones en inglés y está especializado en edición de piel; no es útil para otras tareas de imagen ni para lenguaje.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero es necesario verificar la licencia del modelo base `Qwen/Qwen-Image-Edit-2509` para asegurar el cumplimiento en aplicaciones comerciales.
- Procedencia: el repositorio original parece ser de tlennon-ie, mientras que la versión analizada está re-subida por AST-1320. Se recomienda verificar la autenticidad del adaptador antes de usarlo en producción.

## Enlaces

- https://huggingface.co/AST-1320/qwen-edit-skin
- https://huggingface.co/tlennon-ie/qwen-edit-skin
- https://civitai.com/models/2097058/qwen-edit-skin
- https://www.linkedin.com/pulse/uncanny-valley-ai-generated-skin-training-approach-realism-lennon-nuxre/
- https://github.com/relaxis/ai-toolkit
