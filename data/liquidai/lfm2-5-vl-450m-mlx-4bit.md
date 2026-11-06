# LiquidAI/LFM2.5-VL-450M-MLX-4bit

## Resumen

LFM2.5-VL-450M-MLX-4bit es la exportación cuantizada a 4 bits en formato MLX del modelo visión-lenguaje LFM2.5-VL-450M de Liquid AI, optimizada para inferencia en Apple Silicon. El modelo combina un backbone de lenguaje LFM2.5-350M con un codificador visual SigLIP2 NaFlex de 86M de parámetros, sumando 448.724.992 parámetros totales según los pesos en safetensors. Su propósito es llevar comprensión de imágenes, OCR y predicción de bounding boxes a dispositivos de borde (edge) con un consumo de memoria muy reducido: el repositorio completo ocupa 0,4 GB y el modelo cuantizado pesa aproximadamente 0,35 GB.

La relevancia de esta ficha radica en que demuestra que las capacidades multimodales (lectura de documentos, comprensión de imágenes multilingüe y function calling) pueden ejecutarse localmente en un Mac sin GPU dedicada, con una ventana de contexto de 32K tokens. Frente a alternativas de mayor tamaño como LFM2.5-VL-3B, esta variante de 450M prioriza latencia y huella de memoria sobre precisión bruta, lo que la hace adecuada para asistentes embebidos, procesamiento por lotes en local y prototipado rápido.

El modelo soporta diez idiomas (inglés, japonés, coreano, francés, español, alemán, italiano, portugués, árabe y chino) y se distribuye bajo la licencia LFM 1.0, que no es de código abierto puro y requiere revisión para uso comercial. Esta exportación MLX 4-bit está pensada exclusivamente para el ecosistema Apple (mlx-vlm), no para CUDA ni para despliegues en servidores x86 convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje: backbone LFM2.5-350M + codificador SigLIP2 NaFlex (86M) |
| Parametros totales | 448.724.992 (~450M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | 4-bit (group size 64); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | en, ja, ko, fr, es, de, it, pt, ar, zh |
| Licencia | LFM 1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (MLX, 4-bit); tamaño del repo 0,4 GB |
| Resolución nativa de visión | hasta 512x512 |
| Librería de inferencia | mlx-vlm (versión recomendada 0.3.9) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un modelo visión-lenguaje de dos torres: un codificador visual SigLIP2 NaFlex de 86M parámetros que procesa imágenes a resolución nativa de hasta 512x512 con flexibilidad de parches (NaFlex), y un backbone de lenguaje LFM2.5-350M que consume las representaciones visuales junto con el texto. El modelo base es LiquidAI/LFM2.5-VL-450M, y esta variante aplica cuantización de pesos a 4 bits con tamaño de grupo 64 para el runtime MLX de Apple Silicon. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card no los especifica.

La innovación técnica destacable de esta exportación no está en el entrenamiento sino en el empaquetado: consigue un modelo multimodal funcional en 0,35 GB, lo que permite cargarlo en memoria unificada de un Mac sin swap y ejecutar inferencia con latencia baja. El codificador NaFlex permite además adaptar la resolución efectiva de la imagen sin reescalado rígido, lo que ayuda en tareas de OCR y documentos con relaciones de aspecto variadas. No se documentan técnicas de decodificación especulativa ni atención lineal en la información disponible.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y respuesta conversacional multi-turno.
- OCR y comprensión de documentos: extracción de texto de imágenes y lectura de contenido estructurado.
- Comprensión visual multilingüe en diez idiomas, incluyendo español, árabe, chino, japonés y coreano.
- Predicción de bounding boxes (detección y localización de objetos en la imagen).
- Function calling / tool calling integrado en el modelo base, según la model card.
- Razonamiento de varios pasos sobre contenido visual y textual (multi-step reasoning) en la medida en que lo permite un modelo de 450M.
- Procesamiento de imágenes a resolución nativa de hasta 512x512 mediante SigLIP2 NaFlex.
- No se documentan capacidades de audio ni modo thinking explícito en la información disponible.

## Casos de uso

- OCR en local para digitalización de facturas y tickets: el modelo lee imágenes de hasta 512x512 y extrae texto sin enviar datos a la nube, lo que resulta adecuado para cumplimiento de privacidad en macOS.
- Asistente de accesibilidad en Mac: descripción de imágenes en pantalla o de fotos del usuario con latencia baja gracias al peso de 0,35 GB y a la ejecución en memoria unificada.
- Etiquetado automático de imágenes en pipelines de datos: predicción de bounding boxes y descripciones para preanotar datasets antes de revisión humana.
- Chatbot de atención al cliente con soporte de capturas de pantalla: el modelo puede interpretar imágenes que el usuario adjunta en una conversación multi-turno dentro de la ventana de 32K tokens.
- Automatización de documentos multilingües: comprensión de formularios en español, francés, alemán o árabe en un flujo de escritorio sin conexión.
- Prototipado rápido de aplicaciones visión-lenguaje en Apple Silicon: al cargarse con mlx-vlm en pocas líneas de Python, sirve para validar ideas antes de escalar a LFM2.5-VL-3B o a modelos mayores.
- Extracción de campos en herramientas de finanzas personales: lectura de recibos y extracción de importes y fechas con function calling para estructurar la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 0,35 GB de pesos en 4 bits; con overhead de runtime MLX, se recomienda reservar al menos 1-2 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra); no está diseñado para GPU NVIDIA ni AMD.
- Cabe en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada; también es viable en iPhone/iPad con chip de la serie A/M mediante MLX.
- Opciones de despliegue: mlx-vlm 0.3.9 (recomendado por el autor); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta exportación.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera inferencia interactiva en Apple Silicon, pero no hay cifras publicadas.
- Parámetros de muestreo recomendados por el autor: temperature 0.1, min_p 0.15, repetition_penalty 1.05.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-VL-450M-MLX-4bit (este) | ~450M | 32K | LFM 1.0 | Hugging Face, MLX | Cuantizado 4-bit, 0,35 GB, solo Apple Silicon |
| LFM2.5-VL-450M (base) | ~450M | 32K | LFM 1.0 | Hugging Face | Pesos sin cuantizar, mayor huella de memoria |
| LFM2.5-VL-3B | 3B | no disponible | LFM 1.0 | Hugging Face | Mayor capacidad, requiere más memoria; misma familia |
| d1-3B | 3B | no disponible | no disponible | Hugging Face | Modelo de LiquidAI de razonamiento, no multimodal |

La comparativa con modelos de otros fabricantes en el rango de 450M multimodales no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 450M parámetros: la precisión en razonamiento complejo, matemáticas y comprensión de documentos densos es limitada frente a modelos de 3B o superiores; riesgo elevado de alucinación en preguntas abiertas.
- Resolución visual máxima de 512x512: el OCR de documentos de alta densidad o texto muy pequeño puede degradarse; conviene preprocesar y recortar regiones.
- Cuantización 4-bit: introduce pérdida de precisión adicional respecto al modelo base, especialmente en tareas de percepción fina como bounding boxes.
- Licencia LFM 1.0: no es una licencia de código abierto estándar; es necesario revisar los términos para uso comercial y redistribución antes de integrarlo en producción.
- Exclusivo para Apple Silicon: no puede desplegarse en servidores CUDA ni en entornos x86; esto limita su uso en infraestructura de producción convencional.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al ser un modelo multilingüe entrenado con datos web, es probable que herede sesgos culturales y de género no cuantificados.
- Idiomas: aunque declara diez idiomas, el rendimiento relativo por idioma no está publicado; el español puede tener menor cobertura que el inglés.
- Ventana de contexto de 32K: suficiente para conversaciones y documentos moderados, pero insuficiente para libros completos o vídeos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-VL-450M-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Organización LiquidAI en Hugging Face: https://huggingface.co/LiquidAI
- LFM2.5-VL-3B: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- d1-3B: https://huggingface.co/LiquidAI/d1-3B
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación LFM: https://docs.liquid.ai/lfm
- LEAP: https://leap.liquid.ai/
- Blog de Liquid AI: https://www.liquid.ai/blog/
