# goku80903/hieroglyph-ocr-qwen3.5-9b-lora

## Resumen

El modelo `goku80903/hieroglyph-ocr-qwen3.5-9b-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face que especializa el modelo multimodal Qwen3.5-9B en el reconocimiento óptico de caracteres (OCR) de jeroglíficos egipcios, incluyendo su transliteración a Unicode. Lo desarrolla el usuario independiente goku80903 y se distribuye bajo licencia CC BY-SA 4.0 con acceso restringido (gated), lo que obliga a aceptar condiciones antes de la descarga.

El adaptador resuelve un problema de nicho: la digitalización y traducción automática de inscripciones jeroglíficas a partir de imágenes, una tarea para la que los modelos generalistas rinden de forma irregular por la variabilidad de glifos, orientaciones y estados de conservación. Al construirse sobre Qwen3.5-9B, hereda la arquitectura y la ventana de contexto del modelo base, aunque la información publicada del adaptador no detalla esos parámetros.

Su relevancia es doble: por un lado, demuestra el patrón de especialización mediante PEFT sobre modelos multimodales de 9B parámetros, asequibles en hardware de consumo; por otro, cubre un dominio (epigrafía egipcia) con pocos recursos abiertos. El repositorio ocupa 0,2 GB, coherente con un adaptador LoRA y no con pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen3.5-9B (image-text-to-text) |
| Parametros totales | No disponible para el adaptador; modelo base de 9B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-9B, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA que se acopla a Qwen3.5-9B, un transformer multimodal con capacidad image-text-to-text. El adaptador no modifica la arquitectura del modelo base: añade matrices de bajo rango en capas seleccionadas, de modo que la inferencia requiere cargar Qwen3.5-9B completo y aplicar el adaptador encima. El repositorio pesa 0,2 GB, lo que confirma que no contiene pesos completos.

No se ha publicado información sobre el dataset de entrenamiento (número de imágenes, procedencia, composición, anotaciones de transliteración), ni sobre si se aplicaron técnicas de alineación como RLHF o DPO, ni sobre hiperparámetros del LoRA (rango, alpha, capas objetivo). Tampoco hay detalle de posibles innovaciones técnicas más allá del propio ajuste supervisado implícito en un adaptador de OCR.

## Capacidades

- Reconocimiento óptico de jeroglíficos egipcios a partir de imágenes (pipeline image-text-to-text).
- Conversión de glifos reconocidos a representación Unicode, según el nombre y los tags del repositorio.
- Especialización de dominio sobre un modelo multimodal generalista, lo que permite combinar OCR jeroglífico con descripción o razonamiento textual heredado del base.
- Capacidades generales del modelo base Qwen3.5-9B (generación de texto, razonamiento, código) potencialmente preservadas, aunque no verificadas en la información disponible.
- Soporte de tool calling, agentes o modos de pensamiento: no disponible en la información publicada del adaptador.

## Casos de uso

- Digitalización de archivos epigráficos: procesar fotografías de estelas, muros y papiros para extraer secuencias de glifos en Unicode, reduciendo el trabajo manual de transcripción en proyectos de egiptología.
- Catalogación museística: generar metadatos textuales a partir de imágenes de piezas con inscripciones, integrando el adaptador en un pipeline de ingesta que asocie cada objeto a su transliteración.
- Herramientas educativas de aprendizaje de jeroglíficos: un visor que permita al estudiante subir una imagen y obtener la correspondencia glifo-Unicode para practicar lectura.
- Investigación en corpus lingüísticos: transcripción masiva de inscripciones para construir corpus digitales comparables y entrenar posteriores modelos de traducción del egipcio antiguo.
- Verificación y control de calidad en proyectos de restauración: comparar la transcripción automática de una inscripción antes y después de una intervención para detectar cambios o pérdidas de glifos.
- Prototipado de aplicaciones de patrimonio cultural: desplegar el adaptador sobre Qwen3.5-9B en una GPU de consumo para demos interactivas en museos o aplicaciones móviles con backend propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,2 GB, pero la inferencia exige cargar Qwen3.5-9B completo; el requisito real lo determina el modelo base.
- VRAM estimada para el modelo base de 9B: aproximadamente 18-20 GB en FP16/BF16; en torno a 6-8 GB con cuantización de 4 bits (estimación general para transformers de 9B, no confirmada para este modelo).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 ajustado o cuantización; RTX 3090/4080 (16-24 GB) con cuantización.
- Cabe en GPU de consumo con cuantización (por ejemplo, RTX 4090 o 3090 en 4-8 bits), siempre que se soporte el pipeline multimodal del base.
- Opciones de despliegue: PEFT sobre transformers; vLLM o TGI si soportan el modelo base multimodal y adaptadores LoRA; llama.cpp/Ollama solo si existe conversión GGUF del base multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goku80903/hieroglyph-ocr-qwen3.5-9b-lora | Adaptador sobre 9B | No disponible | OCR de jeroglíficos egipcios | CC BY-SA 4.0 | Gated en Hugging Face |
| Qwen/Qwen3.5-9B | 9B | No disponible en la información | Multimodal generalista | No disponible en la información | Público en Hugging Face |
| Otros adaptadores OCR de jeroglíficos | No disponible | No disponible | OCR epigráfico | No disponible | No disponible |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar productos propietarios.
- Sesgos y errores de reconocimiento: al ser un ajuste de nicho sin benchmarks publicados, se desconoce su precisión real y su comportamiento ante glifos dañados, orientaciones inusuales o variantes epigráficas.
- Riesgo de alucinación: como modelo generativo multimodal, puede producir transliteraciones plausibles pero incorrectas, por lo que requiere verificación humana en contextos académicos.
- Idiomas soportados no documentados; el comportamiento en textos bilingües (egipcio y lenguas modernas) no está verificado.
- Sin métricas de entrenamiento ni dataset publicado, la reproducibilidad y la evaluación independiente son limitadas.
- Dependencia total del modelo base Qwen3.5-9B: cualquier limitación de contexto, licencia o despliegue del base se hereda.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/goku80903/hieroglyph-ocr-qwen3.5-9b-lora
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Guía de OCR con Qwen 3.5: https://martinalderson.com/posts/how-to-use-qwen-3-5-to-ocr-documents/
