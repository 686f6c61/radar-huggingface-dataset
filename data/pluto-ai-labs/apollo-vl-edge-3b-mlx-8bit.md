# Pluto-AI-Labs/Apollo-VL-Edge-3B-MLX-8bit

## Resumen

Apollo-VL-Edge-3B es un modelo vision-language (VLM) de 3.754 millones de parámetros desarrollado por Pluto-AI-Labs, un laboratorio independiente que se define como "single founder-engineer" y que busca construir infraestructura de IA open source centrada en modelos eficientes para edge. El modelo está publicado en formato MLX de 8 bits, lo que lo hace especialmente adecuado para dispositivos Apple Silicon. Según la información disponible, se trata de un fine-tuning de un modelo base de la familia Qwen2.5-VL (el tag `qwen2_5_vl` así lo indica), entrenado con un dataset propio llamado Apollo-VL-Massive, con aproximadamente 162.000 muestras multimodales.

El modelo está orientado a tareas de imagen-a-texto y texto-a-texto, con un pipeline de `image-text-to-text`. Aunque la model card original es extremadamente escueta (solo indica idioma inglés y librería MLX), la presencia en el filtro de OCR de HuggingFace sugiere un énfasis en reconocimiento óptico de caracteres y comprensión de documentos. Su tamaño compacto (3B) y su cuantización de 8 bits lo posicionan como una opción viable para despliegue en entornos con recursos limitados, como portátiles o dispositivos edge.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen2.5-VL (transformer con vision encoder), no confirmado oficialmente |
| Parametros totales | 3.754.622.976 (3,75B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la model card. Sin embargo, el tag `qwen2_5_vl` indica que el modelo se basa en la arquitectura Qwen2.5-VL, que combina un vision encoder (ViT) con un decoder transformer para procesar entradas de imagen y texto. El modelo es denso (no MoE) y cuenta con 3,75B parámetros. El entrenamiento consistió en un fine-tuning sobre el dataset propietario Apollo-VL-Massive, descrito en una publicación de LinkedIn como un conjunto de ~162.000 muestras multimodales. No se especifica si se utilizaron técnicas de RLHF o DPO, ni el número total de tokens de entrenamiento. La cuantización a 8 bits en formato MLX sugiere que el modelo fue optimizado para inferencia eficiente en Apple Silicon.

## Capacidades

- Generación de texto a partir de imágenes (image captioning, descripción de escenas).
- Comprensión de imágenes y respuesta a preguntas visuales (VQA).
- Reconocimiento óptico de caracteres (OCR), según su aparición en el filtro de OCR de HuggingFace.
- Conversación multimodal (entrada de imagen + texto, salida de texto).
- Soporte de contexto en inglés únicamente.
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso o capacidades de agente.

## Casos de uso

- Extracción de texto de documentos escaneados: el modelo puede transcribir texto de imágenes de facturas, recibos o páginas impresas, aprovechando su orientación a OCR y su tamaño reducido para ejecutarse localmente.
- Descripción automática de imágenes para accesibilidad: generar texto alternativo para imágenes en aplicaciones web o móviles, con latencia baja gracias a la cuantización MLX.
- Asistente visual en dispositivos Apple: al estar en formato MLX 8-bit, puede integrarse en apps para macOS o iOS usando el framework MLX, ofreciendo respuestas a preguntas sobre fotos o capturas de pantalla.
- Clasificación y análisis de imágenes en entornos edge: su tamaño de 3B y VRAM de 7,5GB permiten ejecutarlo en hardware modesto, como un Mac Mini o una GPU de gama media, para tareas de moderación de contenido o análisis de imágenes.
- Chatbot multimodal para atención al cliente: combinar entrada de imagen (por ejemplo, fotos de productos) con preguntas del usuario para resolver incidencias, todo en inglés.
- Prototipado rápido de aplicaciones de visión por computador: investigadores pueden usar este modelo como punto de partida para fine-tuning en tareas específicas sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones específicas de visión como VQAv2 o DocVQA.

## Requisitos de hardware

- VRAM estimada: 7,5 GB según LLM Explorer, lo que corresponde al tamaño del repo (7,5 GB) en formato 8-bit.
- GPU recomendadas: no se especifican, pero al ser MLX, está optimizado para Apple Silicon (M1/M2/M3/M4). Puede ejecutarse también en GPUs NVIDIA con adaptadores, aunque no es el objetivo principal.
- Cabe en GPUs de consumo con al menos 8 GB de VRAM, como una RTX 3060 o 4060, o en Macs con 8 GB de RAM unificada (aunque con posible swapping).
- Opciones de despliegue: MLX (framework nativo de Apple), potencialmente vLLM o llama.cpp si se convierten los pesos a GGUF, aunque no se ha confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un fine-tuning de Qwen2.5-VL-3B, por lo que su rendimiento base debería ser similar al de ese modelo, pero no hay datos publicados. Alternativas comparables en tamaño serían Qwen2.5-VL-3B (modelo base), MiniCPM-V 2.6 (8B) o InternVL2-2B, pero sin benchmarks no es posible establecer una comparación objetiva.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si permite uso comercial o tiene restricciones. Es un riesgo importante para producción.
- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- No hay documentación sobre sesgos, alucinaciones o comportamiento en casos límite.
- El modelo es un fine-tuning no verificado: no se ha demostrado su robustez en tareas generales de visión más allá de lo indicado.
- La model card es extremadamente escasa, lo que dificulta evaluar su calidad y reproducibilidad.
- Al estar en formato MLX 8-bit, puede haber pérdida de precisión respecto al modelo original en FP16.
- La fecha de creación (2026-08-18) es posterior a la fecha actual, lo que sugiere que el modelo podría ser un proyecto reciente o experimental.

## Enlaces

- HuggingFace: https://huggingface.co/Pluto-AI-Labs/Apollo-VL-Edge-3B-MLX-8bit
- LLM Explorer: https://llm-explorer.com/model/Pluto-AI-Labs%2FApollo-VL-Edge-3B,3L5mtC3hkpxLl4GyPd7riU
- GitHub de Pluto-AI-Labs: https://github.com/Pluto-AI-Labs
- Perfil de GitHub de la organización: https://github.com/Pluto-AI-Labs/.github
- Publicación de LinkedIn sobre el entrenamiento: https://www.linkedin.com/posts/siddharth-n-r-842529356_apollo-vl-edge-3b-training-started-update-activity-7493535565145853953-QTMd
