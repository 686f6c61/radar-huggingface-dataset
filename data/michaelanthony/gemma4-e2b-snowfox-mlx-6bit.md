# MichaelAnthony/gemma4-e2b-Snowfox-MLX-6bit

## Resumen

El modelo `MichaelAnthony/gemma4-e2b-Snowfox-MLX-6bit` es una cuantización MLX de 6 bits en modo affine (grupo de 64) del modelo SnowFox, una fusión LoRA basada en el checkpoint de instrucción QAT de Google Gemma 4 E2B. SnowFox conserva las torres de imagen y audio congeladas del modelo base, por lo que es un modelo multimodal (image-text-to-text) que puede procesar entradas visuales, auditivas y textuales. El paquete está preparado para ejecutarse en Apple Silicon mediante la librería MLX-VLM, e incluye los safetensors cuantizados, el config con el campo `quantization`, el procesador y el tokenizador.

La relevancia de este modelo radica en su tamaño compacto (3.99 mil millones de parámetros) y su naturaleza multimodal, lo que lo hace adecuado para despliegue en dispositivos Apple con memoria unificada limitada. La cuantización 6-bit affine reduce el peso de los embeddings (que en FP16 superan el límite de buffer de Metal en Macs pequeñas) y permite cargar el modelo completo en memoria. Sin embargo, la model card advierte que la inferencia real en Apple Silicon no ha sido verificada; solo se ha realizado una validación estructural de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B) con torres de imagen y audio congeladas y fusión LoRA |
| Parametros totales | 3.991.293.507 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 6-bit, grupo 64 (equivalente a GGUF Q6_K) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) en 2 shards, ~4.2 GB |

## Arquitectura y entrenamiento

SnowFox es una fusión LoRA sobre el checkpoint `google/gemma-4-E2B-it-qat-q4_0-unquantized`. Las torres de imagen y audio se mantuvieron congeladas durante el fine-tuning, y el modelo resultante incluye los proyectores multimodales necesarios para procesar entradas visuales y auditivas. La cuantización aplicada en este repositorio es una conversión MLX 6-bit affine con grupo de tamaño 64, que afecta a 527 capas (525 lineales más las dos embeddings: `embed_tokens` y `embed_tokens_per_layer`). Las capas de normalización, convoluciones y sesgos permanecen en float16.

El detalle técnico más destacable es la cuantización deliberada de los embeddings. En Gemma 4, la embedding por capa `embed_tokens_per_layer` tiene dimensiones `[262144, 8960]`, lo que ocupa 4.7 GiB en FP16/BF16 y supera el límite de buffer de Metal en Macs pequeñas (aproximadamente 3.5 GiB). Al cuantizarla a 6-bit, el peso se reduce a ~1.8 GiB, permitiendo su carga. La validación estructural realizada por el autor confirma que la dequantización reproduce los pesos originales con un error máximo absoluto de ~0.009.

## Capacidades

- Generación de texto conversacional y respuestas a instrucciones (modelo fine-tuned con QAT).
- Procesamiento de imágenes: entrada visual a través de la torre de imagen congelada y el proyector multimodal.
- Procesamiento de audio: entrada auditiva a través de la torre de audio congelada (no se detalla el tipo de audio soportado).
- Soporte de chat multi-turno mediante la plantilla `chat_template.jinja` incluida.
- Capacidades multilingües: no especificadas en la documentación proporcionada.
- No se menciona soporte de tool calling, function calling, ni razonamiento multi-paso explícito.

## Casos de uso

- Asistentes conversacionales en dispositivos Apple: gracias a su tamaño compacto (3.99B) y cuantización 6-bit, puede ejecutarse localmente en Macs con memoria unificada moderada, ofreciendo respuestas de texto con baja latencia y sin conexión a la nube.
- Análisis de imágenes en el borde: al aceptar entradas visuales, puede describir fotografías, extraer texto de imágenes (OCR) o responder preguntas sobre contenido visual directamente en el dispositivo.
- Procesamiento de documentos escaneados: combinando la entrada de imagen y la generación de texto, puede resumir o extraer información de documentos digitalizados.
- Asistencia a personas con discapacidad visual: el modelo puede generar descripciones de escenas o leer texto de imágenes en tiempo real en un Mac.
- Prototipado rápido de aplicaciones multimodales: los desarrolladores pueden integrar este modelo en proyectos MLX-VLM para experimentar con interacciones texto-imagen-audio sin necesidad de GPUs dedicadas.
- Transcripción y resumen de contenido audiovisual: si la torre de audio procesa voz, podría transcribir o resumir grabaciones, aunque esta capacidad no está confirmada en la documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon (Macs con chip M1, M2, M3, M4 o superiores) con soporte Metal.
- Memoria unificada estimada: el modelo cuantizado pesa ~4.2 GB. Se recomienda al menos 8 GB de RAM unificada para cargar el modelo y el runtime, aunque no se ha verificado en la práctica.
- El embedding cuantizado (~1.8 GiB) cabe dentro del límite de buffer de Metal (~3.5 GiB en Macs pequeñas), lo que permite su carga en dispositivos con memoria limitada.
- Inferencia mediante MLX-VLM (versión 0.6.13 o compatible). No se soporta vLLM, llama.cpp ni Ollama en este formato.
- Latencia y throughput: no disponibles. La model card advierte que no se ha ejecutado inferencia real en Apple Silicon.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información suministrada. Se podría comparar con Gemma 3 o Gemma 2 de tamaño similar, pero no se dispone de métricas ni especificaciones contrastadas.

## Limitaciones y advertencias

- Inferencia no verificada: la model card indica explícitamente que la ejecución en Apple Silicon no ha sido probada. El paquete es una validación estructural, no funcional. Existe riesgo de fallos en tiempo de ejecución.
- Pérdida de precisión por cuantización: la conversión a 6-bit introduce un error máximo absoluto de ~0.009 en la dequantización, lo que puede degradar ligeramente la calidad de las respuestas frente al modelo en BF16.
- Sesgos y alucinaciones: no se han documentado sesgos específicos para este modelo, pero al derivar de Gemma 4, puede heredar sesgos del dataset de entrenamiento original. El riesgo de alucinación no está cuantificado.
- Limitaciones de idioma: no se especifican los idiomas soportados, por lo que su rendimiento multilingüe es incierto.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las políticas de Google para modelos Gemma (aunque el base declara Apache-2.0).
- Dependencia de MLX-VLM: el modelo solo funciona con la librería MLX-VLM; no es compatible con otros runtimes estándar como Transformers o llama.cpp.
- Tamaño del contexto: no especificado, lo que impide conocer la longitud máxima de entrada soportada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MichaelAnthony/gemma4-e2b-Snowfox-MLX-6bit
- Modelo base (Google): https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Fuente BF16 fusionada: https://huggingface.co/MichaelAnthony/gemma4-e2b-Snowfox-hf
- Referencia FP16 MLX: https://huggingface.co/MichaelAnthony/gemma4-e2b-Snowfox-MLX
