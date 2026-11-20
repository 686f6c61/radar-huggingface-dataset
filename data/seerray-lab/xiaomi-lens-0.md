# SeerRay-Lab/Xiaomi-Lens-0

## Resumen

Xiaomi-Lens-0 es un modelo multimodal de lenguaje de 4B parámetros desarrollado por SeerRay-Lab, construido mediante fine-tuning sobre Qwen3.5-4B. Su particularidad es que incorpora un decodificador ligero de máscaras de píxeles que se activa cada vez que el modelo emite el token especial `<|mask|>`, permitiendo que cada región identificada en el texto se traduzca en una máscara de segmentación real. Esto unifica en un solo modelo la comprensión de expresiones referenciales, la segmentación y el razonamiento visual.

El modelo está diseñado para tareas de *visual grounding* de grano fino: desde la comprensión de expresiones referenciales (REC) hasta la segmentación por expresión referencial (RES), el grounding multi-instancia, la segmentación con razonamiento y el *embodied referring*. A diferencia de pipelines que encadenan un detector y un segmentador, Xiaomi-Lens-0 genera las máscaras de forma nativa durante la decodificación, lo que simplifica la arquitectura de despliegue.

Con 4.622.144.192 parámetros y pesos en safetensors (9,3 GB de repositorio), se posiciona como una alternativa compacta a modelos de segmentación multimodal de mayor tamaño. Su licencia Apache-2.0 y su compatibilidad con `transformers` lo hacen atractivo para integración en producción, aunque requiere el paquete de código específico del autor para decodificar las máscaras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B) con decodificador ligero de máscaras de píxeles |
| Parametros totales | 4.622.144.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Xiaomi-Lens-0 parte de Qwen3.5-4B, un transformer multimodal de 4B parámetros, y le añade un decodificador ligero de máscaras de píxeles. El entrenamiento combina supervisión conjunta de lenguaje y de máscaras: cada token `<|mask|>` generado por el modelo identifica una región de la imagen que el decodificador convierte en una máscara de segmentación. Esta formulación permite que el modelo produzca máscaras tanto en la respuesta final como durante el razonamiento intermedio.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. La innovación principal documentada es el acoplamiento entre la generación de tokens de máscara y el decodificador de segmentación, que permite segmentación nativa sin componentes externos.

## Capacidades

- Generación de texto y razonamiento multimodal sobre imágenes.
- Comprensión de expresiones referenciales (REC): localizar objetos descritos en lenguaje natural.
- Segmentación por expresión referencial (RES): generar máscaras de píxeles para objetos descritos textualmente.
- Grounding multi-instancia: identificar y segmentar varias instancias de una misma categoría o descripción.
- Segmentación con razonamiento: producir máscaras durante el razonamiento intermedio, no solo en la respuesta final.
- *Embodied referring*: referencias espaciales y deícticas en contextos de robótica o agentes embodied.
- Percepción visual de grano fino: distinciones sutiles entre objetos similares (p. ej., «el segundo gajo de pomelo de izquierda a derecha»).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al razonamiento visual con emisión de máscaras.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking* explícito, visión, audio: no disponible en la información proporcionada.

## Casos de uso

- Anotación automática de datasets de segmentación: el modelo genera máscaras a partir de descripciones textuales, lo que permite crear datasets de RES/REC a escala sin anotadores humanos para cada píxel. Es adecuado por su decodificador de máscaras nativo y su licencia Apache-2.0.
- Robótica y agentes embodied: el *embodied referring* permite que un agente identifique y segmente objetos referidos de forma deíctica («coge la taza que está a la izquierda del plato»), facilitando la manipulación guiada por lenguaje.
- Edición de imágenes asistida por lenguaje: integrado en herramientas de edición, el modelo puede segmentar regiones descritas por el usuario («selecciona el gajo de pomelo») para aplicar máscaras de recorte o retoque.
- Análisis de imágenes médicas o industriales: la percepción de grano fino y la segmentación con razonamiento permiten localizar lesiones o defectos descritos textualmente, siempre que se valide el dominio específico.
- Moderación y análisis de contenido visual: segmentación multi-instancia para identificar objetos o personas en imágenes y aplicar políticas de contenido con trazabilidad por región.
- Asistentes de accesibilidad: descripción y localización de objetos en imágenes para usuarios con discapacidad visual, con máscaras que permiten resaltar regiones concretas en la interfaz.
- Búsqueda visual por descripción: indexar imágenes por regiones segmentadas a partir de descripciones naturales, mejorando la recuperación en catálogos de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.622.144.192 parámetros, en FP16 se requieren aproximadamente 9,2 GB solo para pesos; en BF16 similar. En cuantización de 8 bits, unos 4,6 GB; en 4 bits, unos 2,3 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40GB, H100, L40S para despliegue en FP16 con margen para el decodificador de máscaras y el procesador de imagen. RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en FP16.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090/3090 en FP16; en RTX 4070 Ti (12 GB) o RTX 3060 (12 GB) probablemente requiera cuantización a 8 bits o 4 bits.
- Opciones de despliegue: `transformers` con la clase `XiaomiLensQwen3_5ForConditionalGeneration` del repositorio de código del autor. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Segmentación nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-Lens-0 | 4,62B | no disponible | Sí (decodificador de máscaras) | Apache-2.0 | Hugging Face, GitHub, demo |
| Qwen3.5-4B (base) | 4B | no disponible | No | no disponible | Hugging Face |
| Modelos de segmentación multimodal de mayor tamaño | no disponible | no disponible | Variable | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3.5-4B, puede heredar sesgos del corpus de entrenamiento del modelo base.
- Riesgo de alucinación: presente en la generación de texto y en la localización de regiones; las máscaras pueden no corresponder a objetos reales si la descripción es ambigua.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están documentados; no se garantiza un rendimiento multilingüe uniforme.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las licencias de las dependencias del paquete de código.
- Caveat de producción: la inferencia requiere instalar el paquete `Xiaomi-Lens-0` del autor para decodificar máscaras; no funciona solo con `transformers` estándar. La falta de soporte documentado para vLLM, TGI o llama.cpp limita el despliegue a gran escala.
- El repositorio ocupa 9,3 GB, lo que implica requisitos de almacenamiento y transferencia considerables.
- No se documentan procesos de RLHF/DPO ni evaluaciones de seguridad, por lo que se recomienda validación en el dominio de aplicación antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeerRay-Lab/Xiaomi-Lens-0
- Página del proyecto: https://seerray-lab.github.io/Xiaomi-Lens-0/
- Repositorio GitHub: https://github.com/SeerRay-Lab/Xiaomi-Lens-0
- Informe técnico (arXiv): https://arxiv.org/abs/2610.23279
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/hugging-apps/xiaomi-lens-0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
