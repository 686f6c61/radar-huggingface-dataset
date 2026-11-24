# Inserloft-AI/Valdam-Vision-2.5

## Resumen

Valdam Vision 2.5 es un modelo de visión-lenguaje (VLM) desarrollado por Inserloft-AI, orientado a tareas de image-to-text: descripción de escenas visuales, extracción de texto con enfoque OCR y clasificación zero-shot de contenido de imágenes. Combina un encoder visual Vision Transformer preentrenado (`google/vit-huge-patch14-224-in21k`) con una capa de proyección lineal y normalización, y un decoder Transformer autorregresivo con atención cruzada sobre las representaciones visuales. El checkpoint liberado contiene 949.702.066 parámetros en formato safetensors (repositorio de 3,8 GB).

El modelo se distribuye con licencia Apache 2.0 y soporta inglés y español. Incluye además un componente separado de moderación llamado Valdam Shield, basado en similitud semántica con CLIP ViT-L/14, que compara la imagen contra categorías textuales predefinidas (contenido seguro, explícito/nudity, violencia, símbolos de odio) y devuelve una señal de similitud, no una probabilidad calibrada.

Su relevancia actual reside en la combinación, en un único paquete Apache 2.0, de comprensión visual, OCR y cribado de seguridad para pipelines de moderación de contenido, con inferencia local mediante scripts propios (`architecture.py`, `inference.py`) y pesos en safetensors. No es un modelo entrenado desde cero: reutiliza un backbone visual preentrenado junto con proyección y decoder propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder ViT + proyección lineal + LayerNorm + decoder Transformer autorregresivo con cross-attention |
| Parámetros totales | 949.702.066 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `vocab.json` |
| Backbone visual | `google/vit-huge-patch14-224-in21k` |
| Tarea principal | image-to-text |
| Métricas declaradas en model card | BLEU, METEOR, ROUGE |
| Componente de moderación | Valdam Shield (CLIP ViT-L/14, similitud semántica) |
| Tamaño del repositorio | 3,8 GB |

## Arquitectura y entrenamiento

La arquitectura es híbrida y modular. El encoder visual es un ViT preentrenado (`google/vit-huge-patch14-224-in21k`), que extrae representaciones de parches de la imagen. Una proyección lineal mapea la dimensión oculta del encoder a la dimensión de embedding del decoder, seguida de LayerNorm. El decoder es un Transformer autorregresivo construido con componentes de PyTorch, con self-attention causal y cross-attention sobre las representaciones visuales, y una capa de salida que proyecta los estados ocultos al espacio de vocabulario definido en `vocab.json`. La inferencia se realiza mediante `ValdamVisionLocalPredictor`, que recibe un tensor de imagen preprocesado con `ViTImageProcessor` y genera texto de forma secuencial.

La model card indica explícitamente que el modelo es un desarrollo híbrido de Inserloft y no una arquitectura visual construida desde cero: el backbone visual es preentrenado y el resto (proyección, decoder y pesos del checkpoint) es propio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias. Tampoco se detalla la innovación de decodificación ni optimizaciones de atención. El componente Valdam Shield es independiente del VLM y se basa en CLIP ViT-L/14 para comparar la imagen con categorías textuales.

## Capacidades

- Generación de descripciones de escenas visuales a partir de una imagen de entrada.
- Extracción de texto orientada a OCR en capturas de pantalla, documentos y composiciones gráficas.
- Clasificación zero-shot de contenido de imagen mediante etiquetas textuales (tag declarado en el repositorio).
- Cribado de seguridad (Valdam Shield) con categorías de contenido seguro, explícito/nudity, violencia e iconografía de odio, expresado como señal de similitud.
- Generación de texto autorregresiva en inglés y español.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, entrada de audio ni vídeo.
- La interfaz de inferencia devuelve una secuencia de texto generada; no expone coordenadas de bounding-box ni representación estructurada de layout documental.

## Casos de uso

- Descripción automática de imágenes para accesibilidad: el modelo genera texto descriptivo a partir de una imagen RGB, útil para alt-text en catálogos, CMS o aplicaciones de lectura asistida.
- Extracción de texto en capturas y documentos: al estar orientado a OCR, permite transcribir texto de screenshots y material gráfico pesado en texto, integrándose en pipelines de digitalización.
- Moderación de contenido en plataformas: Valdam Shield compara imágenes contra categorías predefinidas y devuelve una señal de similitud que puede usarse como primer filtro antes de la revisión humana.
- Enriquecimiento de metadatos en DAM (gestión de activos digitales): generación de descripciones y etiquetas a partir de imágenes para búsqueda y catalogación.
- Clasificación zero-shot de imágenes: uso de etiquetas textuales personalizadas para cribar lotes de imágenes sin reentrenamiento.
- Procesamiento local y privado: inferencia mediante scripts propios en `cuda` o `cpu`, adecuada para entornos donde los datos no deben salir de la infraestructura.
- Soporte bilingüe en atención al cliente basada en imágenes: interpretación de capturas enviadas por usuarios en inglés o español y generación de una respuesta textual descriptiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara las métricas BLEU, METEOR y ROUGE como campos de metadatos, pero no incluye valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 949,7 millones de parámetros en safetensors, los pesos en fp32 ocupan aproximadamente 3,8 GB; en fp16 rondarían 1,9 GB, sin contar el backbone visual y las activaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 8-16 GB de VRAM (por ejemplo, RTX 3060/4070/4090) debería ser suficiente para cargar pesos en fp16, aunque no hay cifras publicadas.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint, aunque el requisito exacto no está documentado.
- Opciones de despliegue: la model card solo documenta inferencia local con `inference.py` y `ValdamVisionLocalPredictor` sobre PyTorch, con dependencias `torch`, `torchvision`, `transformers`, `safetensors`, `pillow` y CLIP de OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de visión-lenguaje ni datos de rendimiento que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al entrenarse presumiblemente con datos no especificados, el riesgo de sesgo visual y lingüístico no puede descartarse.
- Riesgo de alucinación inherente a la generación autorregresiva: las descripciones pueden incluir contenido no presente en la imagen.
- La salida de Valdam Shield es una señal de similitud, no una probabilidad calibrada, y no sustituye una moderación humana integral.
- La interfaz no devuelve bounding-boxes ni layout estructurado, lo que limita su uso en extracción documental estructurada.
- Idiomas limitados a inglés y español; no se documenta cobertura multilingüe adicional.
- Longitud de contexto no especificada; el ejemplo de inferencia usa `max_len=64`, lo que sugiere salidas cortas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el checkpoint; conviene validar el comportamiento en el dominio de producción.
- El modelo depende de un backbone visual externo (`google/vit-huge-patch14-224-in21k`) y de CLIP de OpenAI para Valdam Shield, lo que añade dependencias de descarga y versiones.
- La implementación requiere que `config.json` y `vocab.json` coincidan con el checkpoint liberado; desajustes rompen la inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/Inserloft-AI/Valdam-Vision-2.5
- Backbone visual: https://huggingface.co/google/vit-huge-patch14-224-in21k
- CLIP de OpenAI (dependencia de Valdam Shield): https://github.com/openai/CLIP
