# mat0k/magiclens-base-pytorch

## Resumen

MagicLens es una serie de modelos de recuperación de imágenes auto-supervisados desarrollados por Google DeepMind y presentados como *Oral* en ICML 2024. Su propuesta central es que las instrucciones de texto pueden guiar la recuperación de imágenes con relaciones semánticas más ricas que la mera similitud visual. El modelo base (`magiclens-base`) se entrena sobre 36,7 millones de tripletas (imagen de consulta, instrucción, imagen objetivo) extraídas de la web, capturando relaciones implícitas entre imágenes que aparecen en una misma página. Con un único modelo se abordan tareas multimodal-a-imagen, imagen-a-imagen y texto-a-imagen, alcanzando resultados comparables o superiores a métodos previos en 10 benchmarks.

El repositorio `mat0k/magiclens-base-pytorch` es una copia del modelo base en formato PyTorch subida por un tercero (mat0k), no por Google DeepMind. El acceso está restringido (gated) y requiere aceptar las condiciones en HuggingFace. El modelo original está disponible en el repositorio oficial de Google DeepMind, y este espejo no aporta modificaciones técnicas adicionales. Es relevante para quienes quieran usar el modelo sin depender del repositorio oficial o necesiten una versión en PyTorch puro.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP dual-encoder con módulo de fusión para instrucciones |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (safetensors, no confirmado) |

## Arquitectura y entrenamiento

MagicLens se basa en la arquitectura CLIP, con dos encoders (uno para imágenes y otro para texto) y un módulo de fusión que combina la representación de la imagen de consulta con la instrucción de texto para producir una representación conjunta. El entrenamiento es auto-supervisado: se construyen tripletas a partir de imágenes que aparecen en la misma página web, generando instrucciones sintetizadas que describen la relación implícita entre ellas. En total se usan 36,7 millones de tripletas. No se han publicado detalles sobre RLHF o DPO; el entrenamiento se centra en la alineación de representaciones.

El modelo base es el más pequeño de la serie (junto con `large` y `small`), y el paper reporta que un solo modelo puede generalizar a múltiples tareas de recuperación sin ajuste fino específico por tarea.

## Capacidades

- Recuperación de imágenes guiada por instrucciones de texto abiertas (por ejemplo, "la misma persona en una pose diferente").
- Soporte de tareas multimodal-a-imagen (imagen + texto como entrada, imagen como salida).
- Soporte de imagen-a-imagen (sin instrucción textual explícita, aunque el modelo está diseñado para instrucciones).
- Soporte de texto-a-imagen (usando solo la instrucción, aunque no es su uso principal).
- No soporta tool-calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el entrenamiento se realiza con datos web, probablemente con predominio del inglés.

## Casos de uso

- **Búsqueda de imágenes en bases de datos visuales**: el modelo permite buscar imágenes con instrucciones como "misma flor pero con fondo oscuro", mejorando la precisión frente a búsquedas basadas solo en similitud visual.
- **Organización de colecciones personales**: categorizar y encontrar fotos con instrucciones como "la misma persona en otra boda" o "el mismo monumento desde otro ángulo".
- **Mejora de sistemas de recomendación visual**: en plataformas de comercio electrónico, el modelo puede recuperar productos con relaciones semánticas (por ejemplo, "zapatos similares pero en color rojo").
- **Moderación de contenido**: buscar imágenes que representen conceptos abstractos o relaciones específicas (por ejemplo, "una persona con un objeto peligroso") en flujos de revisión.
- **Asistentes de diseño**: recuperar referencias visuales a partir de descripciones compuestas ("silla de madera con tapizado azul") para generación de ideas en diseño de producto.
- **Investigación en visión artificial**: como modelo de recuperación multimodal para experimentos en *composed image retrieval*, permitiendo comparar con SOTA en benchmarks estándar.

## Benchmarks y rendimiento

El paper de MagicLens reporta que el modelo alcanza resultados comparables o superiores a métodos anteriores en 10 benchmarks que cubren tareas multimodal-a-imagen, imagen-a-imagen y texto-a-imagen. Sin embargo, no se han publicado en el repositorio de HuggingFace los resultados numéricos concretos (MMLU, HumanEval, etc.). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 0.7 GB, lo que sugiere que el modelo cabe en GPU de consumo.
- VRAM estimada para inferencia: entre 2 y 4 GB con cuantización FP16, dependiendo del tamaño real de los parámetros (no confirmado).
- GPU recomendadas: RTX 3060 o superior, aunque también puede ejecutarse en CPU para inferencia básica.
- Opciones de despliegue: se puede cargar con PyTorch directamente, o convertir a ONNX para despliegue en entornos de producción. No se menciona soporte oficial para vLLM o llama.cpp.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MagicLens base (este) | no disponible | no disponible | Apache 2.0 | Gated en HuggingFace |
| CLIP ViT-B/32 | 151M | 77 tokens | MIT | Abierto |
| BLIP-2 (OPT-2.7B) | 1.6B | 32 tokens | MIT | Abierto |
| Qwen2-VL-2B | 2B | 128K | Apache 2.0 | Abierto |

MagicLens se diferencia de CLIP en que está entrenado específicamente para recuperación con instrucciones, mientras que CLIP es un modelo de embedding general. BLIP-2 es más pesado y orientado a captioning, no a recuperación. Qwen2-VL es multimodal pero no está diseñado para retrieval de imágenes con instrucciones. No se dispone de comparativas numéricas oficiales en este repositorio.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo requiere aceptar condiciones en HuggingFace; no se puede descargar sin autenticación.
- **Sesgos**: entrenado con datos web, puede reflejar sesgos de género, raza o contexto cultural presentes en esas imágenes y textos.
- **Riesgo de alucinación**: las instrucciones abiertas pueden generar relaciones incorrectas si la instrucción es ambigua o fuera de distribución.
- **Idioma**: no se ha documentado soporte multilingüe; probablemente funciona mejor en inglés.
- **Limitación de contexto**: no se especifica la longitud máxima de instrucciones; probablemente limitada a tokens similares a CLIP (77).
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un espejo de un tercero, conviene verificar la procedencia de los pesos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/mat0k/magiclens-base-pytorch
- Página del proyecto: https://open-vision-language.github.io/MagicLens/
- Paper en HuggingFace: https://huggingface.co/papers/2403.19651
- GitHub oficial (Google DeepMind): https://github.com/google-deepmind/magiclens
- Código del modelo: https://github.com/google-deepmind/magiclens/blob/main/model.py
- README oficial: https://github.com/google-deepmind/magiclens/blob/main/README.md
