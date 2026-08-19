# lesa80/Qwen3.8-27B-MLX

## Resumen

Qwen3.8-27B-MLX es una conversión no oficial del modelo multimodal Qwen/Qwen3.8-27B al formato MLX, realizada por el usuario lesa80. El modelo original, desarrollado por Alibaba, combina un encoder de visión (ViT de 27 capas) con un decodificador de lenguaje de arquitectura híbrida (48 capas Gated DeltaNet y 16 capas Gated Attention), alcanzando 27 mil millones de parámetros. Esta conversión permite ejecutar el modelo en hardware Apple Silicon mediante la librería mlx-vlm, manteniendo las capacidades de visión, razonamiento y contexto largo.

La relevancia de esta ficha radica en que facilita el despliegue local de un modelo de 27B con visión y razonamiento en equipos Mac, algo que normalmente requeriría GPUs de alta gama. La versión principal (rama `main`) utiliza cuantización 4-bit affine con group_size=64, reduciendo el peso a aproximadamente 16 GB, lo que lo hace viable en equipos con 16-24 GB de RAM unificada. También se ofrece una versión en BF16 (precisión completa) de unos 51 GB para quienes dispongan de más memoria.

El modelo soporta entrada de imagen y video, modo de razonamiento (thinking mode) con tokens especiales, y una ventana de contexto nativa de 262 144 tokens (ampliable hasta 1M con YaRN). La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48×Gated DeltaNet + 16×Gated Attention (decoder) + ViT de 27 capas (encoder visual, patch_size=16, temporal_patch_size=2) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens nativo, hasta 1M con YaRN |
| Tipos de cuantizacion | 4-bit affine (group_size=64) y BF16 (precisión completa) |
| Idiomas soportados | Multilingüe (ruso, inglés, chino y otros; no se especifica lista completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B es híbrida: combina capas de atención lineal (Gated DeltaNet) con capas de atención tradicional (Gated Attention). Concretamente, 48 capas utilizan Gated DeltaNet, una variante de atención lineal con mecanismo de compuerta que reduce el coste computacional en contextos largos, y 16 capas usan atención con compuerta estándar. Esta mezcla permite manejar secuencias de hasta 262K tokens de forma eficiente.

El encoder visual es un ViT de 27 capas con patch_size=16 y temporal_patch_size=2, lo que le permite procesar tanto imágenes estáticas como secuencias de video. El modelo fue entrenado originalmente por Alibaba con un pipeline que incluye datos multimodales y un ajuste fino con razonamiento (thinking mode), aunque no se dispone de detalles específicos sobre el número de tokens de entrenamiento, composición del dataset o técnicas de RLHF/DPO en la información proporcionada.

La conversión a MLX, realizada por lesa80, no modifica la arquitectura ni los pesos del modelo original; simplemente los adapta al formato de MLX y aplica cuantización 4-bit affine con group_size=64 en la rama principal. Esta cuantización reduce significativamente el tamaño del modelo manteniendo las capacidades de visión y razonamiento.

## Capacidades

- Generación de texto y razonamiento paso a paso (thinking mode) mediante tokens `thinking` y `response`.
- Comprensión de imágenes: descripción, respuesta a preguntas visuales, OCR, etc.
- Procesamiento de video gracias al temporal_patch_size=2 en el encoder ViT.
- Ventana de contexto muy larga (262K tokens nativos, hasta 1M con YaRN) para documentos extensos o conversaciones prolongadas.
- Soporte multilingüe (ruso, inglés, chino y otros idiomas, sin lista exhaustiva).
- Capacidad de razonamiento matemático y lógico, como se muestra en el ejemplo de resolución de multiplicaciones con thinking mode.
- Integración con mlx-vlm para carga y generación en Python y CLI.
- Compatibilidad con LM Studio para uso gráfico.

## Casos de uso

- Descripción de imágenes para accesibilidad: el modelo puede generar texto alternativo detallado de fotografías o ilustraciones, útil en aplicaciones de lectura de pantalla o moderación de contenido.
- Asistente de chat multimodal: integración en aplicaciones de mensajería para responder preguntas sobre imágenes enviadas por el usuario, aprovechando el contexto largo para mantener conversaciones extensas.
- Análisis de documentos escaneados: extracción de información de facturas, formularios o artículos con imágenes, combinando OCR y razonamiento para interpretar el contenido.
- Educación interactiva: explicación de problemas matemáticos o científicos con razonamiento paso a paso, usando el modo thinking para desglosar soluciones.
- Moderación de contenido visual: clasificación de imágenes en categorías (violencia, desnudos, etc.) mediante prompts específicos, con la ventaja de ejecutarse localmente en Mac.
- Procesamiento de video: análisis de secuencias cortas para resumir acciones o detectar objetos, gracias al soporte de temporal_patch_size=2.
- Desarrollo de prototipos rápidos: investigadores y desarrolladores pueden probar un modelo multimodal de 27B sin necesidad de GPUs dedicadas, usando un Mac con suficiente RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Versión 4-bit (rama `main`): aproximadamente 16 GB de almacenamiento, recomendada 16-24 GB de RAM unificada (Apple Silicon).
- Versión BF16 (rama `bf16`): aproximadamente 51 GB de almacenamiento, recomendada 64+ GB de RAM unificada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada. No es compatible con GPUs NVIDIA de forma nativa, ya que MLX está diseñado para Apple.
- Opciones de despliegue: mlx-vlm (Python y CLI), LM Studio, o mediante descarga directa con `hf download`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos con otros modelos. No obstante, al ser una conversión de Qwen3.8-27B, se puede considerar comparable a otros modelos multimodales de 27B como Qwen2.5-VL-27B o Llama-3.2-Vision-11B (aunque este último es más pequeño). La principal diferencia es que esta versión MLX está optimizada para Apple Silicon, mientras que los originales suelen requerir CUDA. No se dispone de benchmarks para comparar rendimiento.

## Limitaciones y advertencias

- No se ha verificado de forma independiente el rendimiento del modelo; es una conversión de un tercero y podría presentar diferencias sutiles respecto al modelo original.
- No se especifican sesgos conocidos ni riesgos de alucinación en la información proporcionada; se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- La cobertura de idiomas no está detallada; aunque se menciona ruso, inglés y chino, puede haber limitaciones en otros idiomas.
- La versión 4-bit puede degradar ligeramente la calidad en tareas que requieren alta precisión numérica, como matemáticas avanzadas o razonamiento complejo.
- Requiere hardware Apple Silicon; no es directamente ejecutable en GPUs NVIDIA o AMD sin una conversión adicional a otros formatos (por ejemplo, GGUF).
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una conversión reciente y poco probada por la comunidad.

## Enlaces

- [Modelo en HuggingFace: lesa80/Qwen3.8-27B-MLX](https://huggingface.co/lesa80/Qwen3.8-27B-MLX)
- [Modelo original: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Guía de conversión (HOWTO.md)](https://huggingface.co/lesa80/Qwen3.8-27B-MLX/blob/main/HOWTO.md)
- [mlx-vlm (librería de inferencia)](https://github.com/Blaizzy/mlx-vlm)
