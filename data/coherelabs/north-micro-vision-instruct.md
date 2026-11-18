# CohereLabs/North-Micro-Vision-Instruct

## Resumen

North Micro Vision Instruct es un modelo de visión-lenguaje (VLM) de pesos abiertos con 2.484.847.856 parámetros totales (aproximadamente 2,4B), desarrollado por Cohere y publicado bajo licencia Apache 2.0. Combina un codificador visual de resolución nativa de 400M parámetros, entrenado desde SigLIP 2 SO400M, con un modelo de lenguaje propio de 2B parámetros denominado North Micro LLM. Su propósito es servir como base compacta para prototipado, ajuste fino específico de tarea y aplicaciones multimodales especializadas.

La propuesta diferencial frente a otros VLM pequeños es el procesamiento de imágenes a resolución nativa, que preserva la relación de aspecto y el detalle fino sin reescalado a una resolución fija. Esto resulta especialmente relevante para OCR, documentos, gráficos y tareas de grounding, donde la pérdida de resolución degrada el rendimiento. El modelo acepta entradas intercaladas de texto e imágenes múltiples y produce texto.

El backbone lingüístico soporta una ventana de contexto de 128K tokens, aunque el rango validado para prompts multimodales es de hasta 8K tokens; contextos multimodales mayores dependen de extrapolación y no han sido evaluados. El tokenizador emplea un vocabulario de 262.144 entradas y el checkpoint se distribuye en precisión bfloat16. Por su tamaño, es desplegable en GPUs de consumo y adecuado para entornos con restricciones de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador visual de resolución nativa + proyector + LLM decoder-only con atención de ventana deslizante y atención global |
| Parámetros totales | 2.484.847.856 (2,4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens en el backbone lingüístico; 8K tokens validados para prompts multimodales |
| Tipos de cuantización | No disponible (checkpoint publicado en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés, alemán, francés, español, italiano, portugués, hindi, japonés, coreano, chino, árabe y otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, pipeline image-text-to-text) |

## Arquitectura y entrenamiento

North Micro Vision sigue un diseño modular de tres componentes. El codificador visual tiene 400M parámetros, fue entrenado de forma personalizada partiendo de SigLIP 2 SO400M y opera a resolución nativa, combinando RoPE 2D con embeddings posicionales 1D aprendidos para preservar la estructura espacial en entradas de tamaño variable. El proyector mapea las características visuales al espacio de embeddings del modelo de lenguaje. El LLM es un North Micro LLM de 2B parámetros que adopta la arquitectura de Command A+, intercalando tres capas de atención de ventana deslizante con RoPE y una capa de atención global sin embeddings posicionales.

Una innovación destacable es la inyección multi-capa de representaciones visuales siguiendo el enfoque DeepStack: los patch embeddings extraídos de varias capas del codificador visual se introducen en las capas tempranas correspondientes del LLM, de modo que el modelo de lenguaje accede a representaciones visuales de distinto nivel de abstracción. El modelo acepta entradas intercaladas de texto e imágenes múltiples y devuelve coordenadas de grounding en formato `[x1, y1, x2, y2]` sobre una escala normalizada de 0 a 1000.

No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La model card remite al blog técnico de Cohere para los detalles de arquitectura, entrenamiento y evaluación.

## Capacidades

- Comprensión de imágenes a resolución nativa, preservando relación de aspecto y detalle fino.
- Respuesta a preguntas visuales (VQA) sobre imágenes individuales y múltiples.
- Generación de descripciones (captioning) de imágenes.
- Grounding visual: devolución de bounding boxes normalizadas en escala 0-1000.
- OCR y extracción de texto en imágenes.
- Comprensión de gráficos, diagramas y documentos.
- Conversación multi-turno con entradas intercaladas de texto e imágenes.
- Soporte multilingüe en once idiomas documentados: inglés, alemán, francés, español, italiano, portugués, hindi, japonés, coreano, chino y árabe.
- Procesamiento de prompts con varias imágenes en una misma petición.
- Generación de texto condicionada por imagen y por texto solo (los prompts de solo texto pueden omitir las entradas de imagen).
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Digitalización de documentos y OCR: el modelo procesa documentos a resolución nativa, lo que evita el reescalado que degrada la legibilidad de texto pequeño; adecuado para extracción de campos en facturas, formularios y contratos.
- Análisis de gráficos e informes financieros: al preservar el detalle de ejes, leyendas y anotaciones, puede describir tendencias y extraer valores de gráficos de barras o líneas en pipelines de reporting automatizado.
- Grounding y anotación de datasets: la salida de bounding boxes normalizadas permite generar etiquetas de detección de forma automatizada para preanotar datasets de visión por computador antes de la revisión humana.
- Asistencia multimodal en atención al cliente: con prompts de hasta 8K tokens puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas de pantalla o fotografías de producto, en cualquiera de los once idiomas soportados.
- Prototipado y ajuste fino específico de dominio: sus 2,4B parámetros y licencia Apache 2.0 permiten fine-tuning sobre datos propios (por ejemplo, imágenes médicas o industriales) con requisitos de cómputo modestos.
- Despliegue en el borde o en GPUs de consumo: el tamaño reducido del checkpoint en bfloat16 permite ejecutar inferencia en una única GPU de gama alta de consumo, útil para demos locales y entornos con privacidad de datos.
- Accesibilidad: generación de descripciones de imágenes en múltiples idiomas para lectores de pantalla y sistemas de asistencia visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5 GB solo para pesos (2,4B parámetros × 2 bytes), más overhead de activaciones y caché KV; el tamaño del repositorio es de 5,0 GB.
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia; RTX 4090 y GPUs con 16-24 GB de VRAM para inferencia individual.
- GPU de consumo: el modelo cabe en GPUs de consumo con al menos 8-12 GB de VRAM en bfloat16, dependiendo de la longitud de contexto y del número de imágenes por prompt; la cuantización a 8 o 4 bits reduciría aún más el requisito, aunque no se documentan variantes cuantizadas oficiales.
- Opciones de despliegue: transformers 5.16.0 con `AutoModelForImageTextToText` y `accelerate` para colocación automática de dispositivos; Flash Attention 2 es opcional en sistemas CUDA compatibles. No se documenta soporte oficial de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| North Micro Vision Instruct | 2,4B (2B LLM + 400M visión) | 128K (8K validado multimodal) | Apache 2.0 | Resolución nativa, grounding, 11 idiomas |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

No se dispone de información verificada sobre modelos comparables (parámetros, contexto, rendimiento y licencia) en la documentación proporcionada, por lo que no se ofrece una comparación cuantitativa.

## Limitaciones y advertencias

- El rango validado para prompts multimodales es de 8K tokens; contextos mayores dependen de extrapolación y no han sido evaluados, por lo que su comportamiento es incierto.
- No se han publicado resultados de benchmarks en la información disponible, lo que impide estimar su rendimiento relativo frente a otros VLM.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en OCR de documentos con texto poco legible o en gráficos con anotaciones ambiguas.
- El modelo solo produce texto como salida; no genera imágenes ni audio.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines agénticos complejos sin capas adicionales.
- La cobertura multilingüe está declarada por el autor, pero no se aportan métricas por idioma que permitan verificar la calidad relativa en cada uno.
- Las coordenadas de grounding se devuelven en escala normalizada 0-1000 y requieren conversión explícita a píxeles; errores en esa conversión afectan a la precisión de las cajas.
- Aunque la licencia Apache 2.0 permite uso comercial, deben revisarse las licencias de los componentes derivados, en particular el codificador basado en SigLIP 2 SO400M.
- El modelo está orientado a prototipado y ajuste fino; para producción de alta concurrencia conviene evaluar el throughput real, no documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CohereLabs/North-Micro-Vision-Instruct
- Blog técnico de Cohere: https://huggingface.co/blog/CohereLabs/meet-north-micro-vision-instruct
- Codificador base SigLIP 2 SO400M: https://huggingface.co/google/siglip2-so400m-patch16-384
- Sitio de Cohere: https://cohere.com/
- PyTorch: https://pytorch.org/get-started/locally/
