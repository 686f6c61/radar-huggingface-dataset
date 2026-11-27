# lvladikov/MOSS-SFT-Distill-4step-LoRA

## Resumen

MOSS-SFT-Distill-4step-LoRA es un adaptador LoRA de destilación por pasos (step distillation) para el modelo de generación de imágenes texto-a-imagen MOSS-Image SFT, desarrollado por OpenMOSS-Team. El adaptador, publicado por el usuario lvladikov, permite reducir la inferencia de 50 pasos con CFG 3 (100 llamadas al modelo por imagen) a tan solo 4 pasos con CFG 1 (4 llamadas al modelo), manteniendo la calidad visual del modelo profesor. Está pensado para acelerar radicalmente la generación de imágenes en producción sin sacrificar fidelidad.

El modelo resuelve el problema del coste computacional de los modelos de difusión de alta calidad: el profesor MOSS-Image SFT requiere 50 pasos de muestreo con classifier-free guidance, lo que se traduce en 100 evaluaciones del modelo por imagen. Este LoRA, entrenado mediante distribution matching contra el profesor de 50 pasos y con un crítico que compara las imágenes generadas con las del profesor y con fotografías reales, logra una reducción de aproximadamente 14 veces en tiempo de GPU (26,6 s frente a 387,3 s para 22 imágenes a 1024×1024 en Comfy Cloud).

El adaptador es relevante ahora porque permite desplegar generación de imágenes de alta calidad en entornos con recursos limitados o con requisitos de latencia estrictos, manteniendo capacidades destacadas como la escritura correcta de texto en las imágenes (15 de 15 prompts de texto correctos) y soporte para 12 resoluciones de entrenamiento, desde 768×512 hasta 1824×1024.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión MOSS-Image SFT |
| Parámetros totales | no disponible (LoRA de rango 64, 252 módulos) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica contexto de texto largo) |
| Tipos de cuantización | no disponible (se distribuye en bf16 para diffusers y ComfyUI) |
| Idiomas soportados | no disponible (soporta texto en imágenes en inglés y chino según los ejemplos: "深夜食堂", "OPEN 24H", menús en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos archivos: uno para diffusers/Python y otro para ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 aplicado sobre 252 módulos del modelo base MOSS-Image SFT, un modelo de difusión texto-a-imagen. El entrenamiento se realizó mediante destilación por pasos (step distillation) con distribution matching contra el profesor de 50 pasos con CFG 3. Se utilizó un crítico que compara las imágenes generadas con las del profesor y con fotografías reales (aproximadamente 8.000 recortes de fotos con caption y las propias imágenes del profesor, incluyendo 3.600 y luego 1.600 imágenes supersampleadas).

El conjunto de entrenamiento consta de 39.000 muestras, con 34.000 prompts del dataset de Lakonik (3M-prompt dataset) y 2.877 prompts que deletrean palabras explícitas (letreros, menús, pósteres, etiquetas). El entrenamiento se llevó a cabo en una única NVIDIA B300 durante aproximadamente 80 horas. El checkpoint publicado es `chk00039000`, producido el 25 de noviembre de 2026. Una innovación destacable es que el archivo para ComfyUI incorpora un factor de corrección medido (1,10) en sus valores alpha, ya que ComfyUI suma el LoRA a los pesos bf16 y redondea la suma, lo que haría perder aproximadamente una décima parte del efecto del LoRA.

## Capacidades

- Generación de imágenes texto-a-imagen en 4 pasos con CFG 1, frente a los 50 pasos con CFG 3 del profesor.
- Escritura correcta de texto en imágenes: 15 de 15 prompts de texto correctos a 1024×1024 (el profesor 15, el LoRA de 4 pasos de akhaliq 12).
- Soporte de 12 resoluciones de entrenamiento: desde 768×512 y 512×768 hasta 1824×1024 y 1024×1824, incluyendo formatos cuadrados, anchos y altos.
- Capacidad de generar texto en inglés y chino en las imágenes (ejemplos con "深夜食堂", "OPEN 24H", menús en inglés).
- Compatibilidad con flujos de trabajo de ComfyUI: 10 workflows incluidos (texto a imagen, layout, edición de imagen, PiD 4×, y un modo experimental con prompt negativo a CFG 2).
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo de generación de imágenes).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Generación de imágenes en producción a gran escala: el LoRA permite generar imágenes en 4 pasos con CFG 1, reduciendo el tiempo de GPU en aproximadamente 14 veces (26,6 s frente a 387,3 s para 22 imágenes a 1024×1024), lo que lo hace adecuado para pipelines de generación masiva con requisitos de latencia estrictos.
- Creación de contenido para redes sociales y marketing: con soporte para 12 resoluciones (incluyendo 1824×1024 y 1024×1824), se pueden generar banners, posts e imágenes promocionales en formatos cuadrados, anchos y verticales sin reentrenar.
- Generación de carteles y menús con texto legible: el modelo escribe correctamente cadenas de texto especificadas en el prompt (15 de 15 prompts correctos), lo que lo hace útil para generar menús de restaurantes, carteles con precios y letreros con texto en inglés y chino.
- Ilustración y arte digital: los ejemplos de la model card incluyen estilos como acuarela, anime, claymation, splash art de videojuegos y fotografía hiperrealista, lo que permite generar ilustraciones para libros, juegos o cómics con un coste computacional bajo.
- Prototipado rápido en ComfyUI: los 10 workflows incluidos (texto a imagen, layout, edición de imagen, PiD 4×) permiten a artistas y diseñadores iterar rápidamente en local con el archivo `_comfyui` a strength 1.0.
- Edición y modificación de imágenes existentes: los workflows de layout y edición de imagen permiten modificar composiciones o estilos sobre imágenes base, útil para retoque fotográfico o variaciones de diseño.
- Generación de imágenes para investigación en visión por computador: la capacidad de generar imágenes fotorrealistas con texto legible y en múltiples resoluciones permite crear datasets sintéticos etiquetados para entrenar modelos de OCR o detección de objetos.

## Benchmarks y rendimiento

| Métrica | Este LoRA (4 pasos, CFG 1) | Profesor MOSS-Image SFT (50 pasos, CFG 3) | LoRA de akhaliq (4 pasos) |
|---|---|---|---|
| Llamadas al modelo por imagen | 4 | 100 (50 pasos × 2 con CFG) | no disponible |
| Tiempo de GPU (22 imágenes a 1024×1024, Comfy Cloud) | 26,6 s | 387,3 s | no disponible |
| Precisión de texto (15 prompts, 1024×1024) | 15/15 | 15/15 | 12/15 |
| Luminosidad media (21 prompts, 1824×1024) | 1,4 L* por debajo del profesor | referencia | no disponible |
| Escenas oscuras | dentro de 0,5 puntos del profesor | referencia | no disponible |
| Haze | 1,02× del profesor | referencia | no disponible |
| Color | 1,00× del profesor | referencia | no disponible |
| Textura fina (22 prompts) | 1,11× del profesor | referencia | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 4,2 GB, pero el modelo base MOSS-Image SFT requiere VRAM adicional no especificada.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA B300. Para inferencia, se desconoce la GPU mínima; el modelo base es un modelo de difusión de tamaño no especificado.
- Compatibilidad con GPU de consumo: no disponible. No se indica si cabe en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: diffusers (Python) y ComfyUI (archivo `_comfyui` a strength 1.0). También se menciona Comfy Cloud para ejecución en la nube.
- Latencia y throughput: 26,6 s de tiempo de GPU para 22 imágenes a 1024×1024 en Comfy Cloud (aproximadamente 1,2 s por imagen), frente a 387,3 s del profesor (aproximadamente 17,6 s por imagen).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-SFT-Distill-4step-LoRA (este) | LoRA rango 64, 252 módulos | no aplica | 4 pasos, CFG 1; 15/15 texto; 1,11× textura fina | Apache 2.0 | Hugging Face (6045 descargas, 81 likes) |
| MOSS-Image-SFT-4-steps (akhaliq) | no disponible | no aplica | 4 pasos; 12/15 texto | no disponible | Hugging Face |
| MOSS-Image SFT (profesor) | no disponible | no aplica | 50 pasos, CFG 3; 15/15 texto | no disponible | Hugging Face (OpenMOSS-Team) |

## Limitaciones y advertencias

- El LoRA está entrenado específicamente para el modelo base MOSS-Image SFT; no es compatible con otros modelos de difusión sin reentrenamiento.
- En ComfyUI, es necesario usar el archivo `_comfyui` a strength 1.0; el archivo para diffusers no funcionará correctamente en ComfyUI debido al redondeo de pesos bf16 (se pierde aproximadamente una décima parte del efecto).
- La información sobre sesgos conocidos, riesgo de alucinación visual y limitaciones de idioma no está disponible en la documentación proporcionada.
- El modelo puede generar texto en inglés y chino, pero no se especifica el soporte para otros idiomas en las imágenes.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base MOSS-Image SFT, que no se indica en la información proporcionada.
- El modo experimental con prompt negativo a CFG 2 puede no estar completamente validado; se recomienda probar antes de usarlo en producción.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de generación de imágenes; los datos de rendimiento se limitan a métricas visuales y de tiempo.

## Enlaces

- [Hugging Face: lvladikov/MOSS-SFT-Distill-4step-LoRA](https://huggingface.co/lvladikov/MOSS-SFT-Distill-4step-LoRA)
- [Modelo base: OpenMOSS-Team/MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT)
- [LoRA de 4 pasos de akhaliq](https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps)
- [Dataset de prompts de Lakonik](https://huggingface.co/datasets/Lakonik/t2i-prompts-3m)
- [Paper referenciado (arXiv:2611.17194)](https://arxiv.org/abs/2611.17194)
- [README detallado (DETAILED-README.md)](https://huggingface.co/lvladikov/MOSS-SFT-Distill-4step-LoRA/blob/main/DETAILED-README.md)
