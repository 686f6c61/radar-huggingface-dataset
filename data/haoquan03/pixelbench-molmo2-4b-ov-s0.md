# haoquan03/PixelBench-Molmo2-4B-OV-s0

## Resumen

PixelBench-Molmo2-4B-OV-s0 es un modelo multimodal de tipo image-text-to-text derivado de Molmo2-4B, desarrollado por Haoquan Zhang y colaboradores en el contexto del trabajo de investigación "Can LLMs Understand and Generate Images Pixel by Pixel?". El modelo parte del checkpoint Molmo2-4B-Pretrain en el paso 32.000 y se ha ajustado por instrucciones sobre 500.000 ejemplos del conjunto LLaVA-OneVision-1.5, entrenando la totalidad de los parámetros. Esta variante concreta (OV, seed s0) forma parte de una comparación de cuatro semillas descrita en el paper.

Con 4.850.869.200 parámetros y un repositorio de 9,7 GB en formato safetensors, el modelo se posiciona en la gama media de los modelos visión-lenguaje, lo que permite su despliegue en hardware relativamente asequible. Su relevancia radica en que sirve como base experimental para estudiar la capacidad de los LLM de comprender y generar imágenes a nivel de píxel, un área de investigación emergente que va más allá de la descripción de imágenes convencional.

La licencia Apache 2.0 y la integración con la librería Transformers (con código personalizado y compatibilidad con endpoints) facilitan su uso tanto en investigación como en prototipos comerciales, si bien la información pública disponible sobre el modelo es limitada y no se han publicado resultados de benchmarks en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (derivada de Molmo2-4B; detalles internos no disponibles) |
| Parametros totales | 4.850.869.200 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se puede cuantizar con herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que procesa entradas de imagen y texto y genera texto. Según la model card, se inicializa desde Molmo2-4B-Pretrain (checkpoint del paso 32.000) y se ajusta por instrucciones sobre 500.000 ejemplos de LLaVA-OneVision-1.5. El autor indica explícitamente que todos los parámetros del modelo fueron entrenados, es decir, no se congeló ninguna parte durante el ajuste.

No se detalla en la información disponible la composición interna de la arquitectura (número de capas, dimensión oculta, mecanismo de atención, codificador visual, etc.), ni el número total de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal. El modelo forma parte de un estudio comparativo de cuatro semillas (esta es la semilla s0) orientado a evaluar la comprensión y generación de imágenes píxel a píxel.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y respuesta a preguntas visuales (visual question answering).
- Descripción y análisis de imágenes en formato conversacional multi-turno, según el ejemplo de uso de la model card.
- Procesamiento de imágenes RGB junto con instrucciones textuales mediante plantilla de chat.
- Integración con la API `AutoModelForImageTextToText` y `AutoProcessor` de Transformers, con soporte de `trust_remote_code`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingües: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión de vídeo, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en comprensión visual píxel a píxel: el modelo sirve como base experimental para el estudio PixelBench, permitiendo reproducir y comparar resultados entre semillas en tareas de análisis de imágenes a nivel de píxel.
- Respuesta a preguntas visuales (VQA): se puede desplegar para responder preguntas concretas sobre el contenido de una imagen, como identificar objetos, colores o relaciones espaciales, usando el pipeline `image-text-to-text`.
- Descripción automática de imágenes en catálogos: generar descripciones textuales de productos o activos visuales en flujos de gestión documental, aprovechando el ajuste sobre instrucciones de LLaVA-OneVision.
- Asistencia conversacional con imágenes: integrar el modelo en un chat que reciba imágenes del usuario y mantenga un diálogo contextual, gracias a la plantilla de chat y al procesamiento de mensajes multimodales.
- Prototipado de aplicaciones de accesibilidad: convertir imágenes en descripciones textuales para personas con discapacidad visual, en entornos de desarrollo y pruebas.
- Evaluación comparativa de modelos visión-lenguaje: usar esta variante (seed s0) junto con las otras semillas del paper para medir la variabilidad del entrenamiento y la robustez del ajuste por instrucciones.
- Experimentación académica con cuantización y despliegue: al tener 4,85 mil millones de parámetros y pesos safetensors, es viable probar cuantizaciones y comparar calidad frente a tamaño en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan aproximadamente 9,7 GB, por lo que se recomienda al menos 12-16 GB de VRAM para inferencia con overhead de activaciones. Con cuantización de 8 bits se podría reducir a unos 5-6 GB, y con 4 bits a unos 3-4 GB, aunque no se han publicado configuraciones oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bfloat16 sin problemas.
- GPU de consumo: cabe en GPUs consumer con 16 GB o más (RTX 4080, RTX 4060 Ti 16 GB) en bfloat16; en GPUs de 8-12 GB requeriría cuantización.
- Opciones de despliegue: Transformers (versión 4.57.6 según la model card), con `attn_implementation="sdpa"` y `device_map="auto"`. No se confirma soporte oficial de vLLM, llama.cpp, Ollama o TGI; al usar código personalizado (`trust_remote_code`), la compatibilidad con estos motores no está garantizada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PixelBench-Molmo2-4B-OV-s0 | 4,85 B | no disponible | Apache 2.0 | safetensors | Derivado de Molmo2-4B, ajustado en LLaVA-OneVision-1.5 |
| Molmo2-4B (base) | ~4 B (no confirmado) | no disponible | no disponible | no disponible | Modelo original del que deriva esta variante |
| LLaVA-OneVision-1.5 | no disponible | no disponible | no disponible | no disponible | Conjunto de datos de instrucciones usado en el ajuste |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no detalla arquitectura interna, contexto, idiomas ni datos de entrenamiento más allá de lo indicado.
- Sesgos conocidos: no disponibles; al entrenarse sobre LLaVA-OneVision-1.5, podría heredar sesgos de ese corpus, pero no se ha documentado.
- Riesgo de alucinación: no evaluado en la información disponible; como modelo generativo multimodal, es esperable, pero no hay datos concretos.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar dicho código antes de usarlo en producción.
- Caveat de producción: al ser un modelo de investigación derivado de un paper (con cuatro semillas), no está claro que sea la versión recomendada para uso general; su propósito principal es experimental.
- Compatibilidad: la model card fija `transformers==4.57.6`; versiones distintas pueden no funcionar con el código personalizado.
- No se confirma soporte de motores de inferencia de alto rendimiento (vLLM, TGI), lo que limita el despliegue escalado.

## Enlaces

- HuggingFace: https://huggingface.co/haoquan03/PixelBench-Molmo2-4B-OV-s0
- Proyecto PixelBench: https://haoquanzhang.github.io/pixelbench/
- Código y evaluación: https://github.com/HaoquanZhang/PixelBench
- Paper (arXiv, referencia TBA): https://haoquanzhang.github.io/pixelbench/
