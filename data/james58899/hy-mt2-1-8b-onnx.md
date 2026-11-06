# james58899/Hy-MT2-1.8B-ONNX

## Resumen

Hy-MT2 1.8B ONNX es una conversión al formato ONNX del modelo de traducción automática Hy-MT2 1.8B desarrollado por Tencent. El repositorio, publicado por el usuario james58899, no entrena ni modifica el modelo original: se limita a exportar los pesos a ONNX Runtime para facilitar su despliegue en entornos de producción que no disponen de PyTorch o que necesitan ejecución en navegador mediante WebGPU. Se ofrecen dos variantes: una en fp16 derivada del checkpoint original y otra q4f16 derivada de la cuantización int4 AutoRound publicada por Intel.

El modelo base es un transformer denso de 1.8 mil millones de parámetros especializado en traducción automática, con arquitectura identificada como `hunyuan_v1_dense` en los metadatos. Su interés radica en que permite ejecutar traducción neuronal de calidad en hardware modesto, incluyendo GPUs de consumo, gracias a su tamaño reducido y a las opciones de cuantización disponibles.

La relevancia de esta ficha es doble: por un lado documenta un modelo de traducción compacto y con licencia Apache 2.0, apto para uso comercial; por otro, advierte de que los scripts de conversión fueron generados por un asistente de IA y el propio autor recomienda verificar el resultado antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (`hunyuan_v1_dense`) con atención de grupo de consultas (GQA) y caché KV |
| Parámetros totales | 1.800 millones (1.8B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp16 (bf16 original convertido a fp16) y q4f16 (int4 simétrico, grupo 128, empaquetado como `MatMulNBits` con bloque 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos `embed_tokens_{fp16,q4f16}.onnx` y `decoder_model_merged_{fp16,q4f16}.onnx`, con datos externos para el embedding) |

## Arquitectura y entrenamiento

El modelo base Hy-MT2 1.8B emplea una arquitectura transformer densa identificada como `hunyuan_v1_dense`, con atención de grupo de consultas (GQA) y caché KV explícita en la exportación ONNX (`GroupQueryAttention`). La conversión mantiene la cabeza de salida (`lm_head`) atada a los embeddings y lee los datos externos del archivo de embedding, un patrón habitual en exportaciones ONNX de modelos con pesos compartidos. Las activaciones y la caché KV se almacenan en fp16 en ambas variantes.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si el modelo original utilizó RLHF, DPO u otras técnicas de alineación. La model card de esta conversión tampoco documenta innovaciones técnicas del modelo base más allá de la propia exportación. La variante q4f16 parte de la cuantización int4 AutoRound publicada por Intel, que aplica una rejilla simétrica con grupo de 128 y se exporta como `MatMulNBits` con bloque 128, un formato optimizado para kernels de cuantización de ONNX Runtime.

## Capacidades

- Traducción automática entre idiomas, tarea principal declarada en el pipeline (`translation`).
- Generación de texto autoregresiva con decodificación basada en caché KV.
- Ejecución en ONNX Runtime, incluyendo el backend WebGPU para despliegue en navegador.
- Dos niveles de precisión: fp16 para máxima fidelidad y q4f16 para reducir huella de memoria.
- Soporte de plantilla de chat y configuración de generación copiadas del checkpoint original.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica en pipelines de CI/CD: el modelo puede integrarse como paso de conversión de textos entre idiomas en flujos automatizados, con la variante q4f16 para reducir el consumo de memoria en runners sin GPU dedicada.
- Traducción en el navegador mediante WebGPU: la exportación ONNX permite ejecutar el modelo del lado del cliente, útil para aplicaciones de traducción que requieren privacidad y no quieren enviar texto a un servidor.
- Servicio de traducción de bajo coste en CPU: al ser un modelo de 1.8B parámetros, la variante q4f16 cabe en servidores modestos y permite atender peticiones concurrentes con ONNX Runtime sin necesidad de GPUs de gama alta.
- Traducción de contenido generado por usuarios en plataformas comunitarias: foros, comentarios y reseñas multilingües pueden traducirse al vuelo con latencia aceptable en hardware de consumo.
- Localización de aplicaciones móviles o de escritorio: el tamaño reducido del modelo y el formato ONNX facilitan su empaquetado en aplicaciones nativas que necesitan traducción offline.
- Preprocesado multilingüe para pipelines de NLP: traducción previa al inglés (u otro idioma pivote) antes de tareas de análisis de sentimiento, clasificación o extracción de información que solo funcionan bien en un idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.6 GB en fp16 (1.8B parámetros × 2 bytes) y en torno a 1 GB en q4f16 para los pesos, más el espacio de la caché KV y activaciones, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100); la variante q4f16 puede ejecutarse en GPUs con 4 GB o menos.
- Cabe en GPU de consumo: sí, tanto en fp16 como en q4f16 en la mayoría de tarjetas recientes.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, WebGPU), con los archivos `decoder_model_merged_*.onnx` y `embed_tokens_*.onnx`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, que no consumen este formato de exportación.
- Latencia y throughput: no disponibles. La model card advierte de que en WebGPU la acumulación fp16 de `MatMul` se realiza en fp16, lo que reduce ligeramente la precisión respecto a CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT2 1.8B ONNX (este) | 1.8B | No disponible | Apache 2.0 | ONNX (fp16, q4f16) | Exportación comunitaria, scripts generados por IA |
| Hy-MT2 1.8B (original, Tencent) | 1.8B | No disponible | Apache 2.0 | safetensors (bf16) | Checkpoint de referencia en PyTorch |
| Hy-MT2 1.8B int4 AutoRound (Intel) | 1.8B | No disponible | Apache 2.0 | safetensors int4 | Base de la variante q4f16 de esta conversión |
| Otros modelos de traducción de ~2B | No disponible | No disponible | Variable | Variable | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- Los scripts de conversión fueron escritos por un asistente de IA (Claude) y el autor recomienda verificarlos y probar el modelo antes de usarlo; no hay garantía de corrección de la exportación.
- La variante fp16 en WebGPU acumula `MatMul` en fp16, lo que introduce pérdida de precisión respecto a la ejecución en CPU.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que impide evaluar su idoneidad para pares de idiomas concretos o documentos largos.
- No hay benchmarks publicados, por lo que no se puede comparar su calidad de traducción con alternativas.
- El repositorio tiene un número muy bajo de descargas (19) y ningún "like", lo que sugiere poca validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo de Tencent conviene revisar los términos del modelo base por si hubiera condiciones adicionales no reflejadas en esta conversión.
- Riesgo de alucinación y de traducciones incorrectas inherente a cualquier modelo de traducción neuronal; no se documentan evaluaciones de sesgo.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/james58899/Hy-MT2-1.8B-ONNX
- Modelo base original: https://huggingface.co/tencent/Hy-MT2-1.8B
- Cuantización int4 AutoRound de Intel: https://huggingface.co/Intel/Hy-MT2-1.8B-int4-AutoRound
- Licencia Apache 2.0: https://huggingface.co/james58899/Hy-MT2-1.8B-ONNX/blob/main/LICENSE.txt
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
