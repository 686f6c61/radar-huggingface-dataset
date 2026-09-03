# SinisterLlama/anlp-a1-c3

## Resumen

El modelo `SinisterLlama/anlp-a1-c3` es un transformador encoder-decoder de tipo seq2seq desarrollado por Eshaan Sharma (SinisterLlama) como parte de la asignación ANLP Assignment 1: Custom Transformers & Byte Latent Transformers en el IIIT Hyderabad. Está diseñado específicamente para la tarea de descifrado de texto cifrado: mapea secuencias binarias cifradas a texto plano, un problema clásico de criptoanálisis abordado con aprendizaje profundo.

Con solo 11,67 millones de parámetros, este modelo destaca por su implementación desde cero de componentes clave como RoPE (Rotary Position Embeddings), RMSNorm y atención multi-cabeza (MHA), sin depender de módulos predefinidos de `nn.Transformer` o `nn.MultiheadAttention`. Su relevancia radica en demostrar cómo arquitecturas transformer personalizadas pueden resolver tareas de descifrado a nivel de bit con una precisión notable, ofreciendo una base académica para experimentación y comparación en entornos de investigación.

Aunque es un modelo de pequeño tamaño y de ámbito académico, su licencia MIT permite su uso y modificación libre, lo que lo convierte en una herramienta útil para estudiar la aplicación de transformers a problemas de secuencias binarias y para validar implementaciones propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-Decoder Seq2Seq Transformer con RoPE, RMSNorm y MHA |
| Parametros totales | 11,67 M |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (repo de 0,1 GB, probablemente PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformador encoder-decoder estándar, pero implementado desde cero con operaciones básicas de PyTorch, sin recurrir a `nn.Transformer` ni `nn.MultiheadAttention`. Incorpora **RoPE** (Rotary Position Embeddings) para codificar la posición de los tokens, **RMSNorm** para normalización y **atención multi-cabeza** (MHA) convencional. El modelo está entrenado para la tarea de descifrado de texto cifrado: recibe secuencias binarias cifradas como entrada y genera el texto plano correspondiente.

No se han publicado detalles específicos sobre el conjunto de datos de entrenamiento (número de tokens, composición, proporción de pares cifrados/planos) ni sobre técnicas de optimización como RLHF o DPO. La información disponible indica únicamente que el modelo fue entrenado para mapear secuencias binarias cifradas a texto plano, y que forma parte de una asignación académica sobre transformers personalizados y Byte Latent Transformers.

## Capacidades

- Descifrado de texto cifrado: convierte secuencias binarias cifradas en texto plano legible.
- Generación de secuencias de salida de longitud variable, típico de modelos seq2seq.
- Procesamiento de datos binarios a nivel de bit, gracias a su entrenamiento específico en esta tarea.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión, audio o modo de pensamiento. El modelo está especializado únicamente en el descifrado de secuencias cifradas.

## Casos de uso

- Investigación académica en criptoanálisis: el modelo puede utilizarse para estudiar la viabilidad de transformers pequeños en la recuperación de texto plano a partir de cifrados binarios, sirviendo como referencia en trabajos de seguridad y criptografía.
- Validación de implementaciones de arquitecturas transformer: al estar construido desde cero, permite comparar el rendimiento de RoPE, RMSNorm y MHA frente a implementaciones estándar, útil en cursos de procesamiento de lenguaje natural.
- Prototipado de sistemas de descifrado para datos sintéticos: en entornos controlados donde se generan pares cifrado-texto plano, el modelo puede emplearse para probar pipelines de decodificación.
- Demostración educativa de seq2seq: por su tamaño reducido (11,67 M) y su tarea concreta, es adecuado para ilustrar el funcionamiento interno de un encoder-decoder en clases o talleres.
- Benchmark de eficiencia en hardware modesto: al ser un modelo pequeño, puede ejecutarse en CPU o GPUs de baja gama, permitiendo medir latencias y consumo de recursos en dispositivos limitados.
- Base para experimentos de fine-tuning: aunque su dominio es específico, su licencia MIT permite adaptarlo a tareas similares de transformación de secuencias binarias, como decodificación de códigos o corrección de errores.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados de evaluación en el conjunto de prueba:

| Metrica | Valor |
|---|---|
| Bit-Level Accuracy | 93,58 % |
| Sequence Accuracy | 68,11 % |
| BLEU Score | 98,88 % |
| ROUGE-1 | 99,41 % |
| ROUGE-2 | 98,20 % |
| ROUGE-L | 99,41 % |
| Average Levenshtein Distance | 0,42 |

Estos valores indican una alta precisión a nivel de bit y una calidad de texto muy alta según BLEU y ROUGE, aunque la precisión a nivel de secuencia completa es moderada (68,11 %), lo que sugiere que algunas secuencias contienen errores menores. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 11,67 millones de parámetros, el modelo requiere aproximadamente 47 MB en FP32 y 23 MB en FP16, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en tarjetas integradas.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 10xx o superior, RTX, o incluso GPUs de portátiles) es suficiente. También puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, el modelo es extremadamente ligero y puede ejecutarse en una Raspberry Pi o en un portátil sin GPU dedicada.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con Hugging Face Transformers, vLLM, o mediante exportación a ONNX. También puede cargarse directamente en PyTorch.
- Latencia y throughput: no se han publicado datos específicos, pero dado el tamaño reducido, la inferencia debería ser casi instantánea en hardware moderno, con latencias por debajo de 10 ms en GPU y del orden de 100 ms en CPU.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa con modelos de la misma categoría. En la búsqueda web se encontraron otros modelos con nombres similares, como `shauryakochar/anlp-a1-c3` y `ransom32/anlp-A1`, que probablemente sean variantes de la misma asignación académica, pero no se dispone de sus especificaciones ni resultados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el descifrado de secuencias binarias cifradas; no es un modelo de lenguaje general y no debe usarse para tareas de generación de texto, razonamiento o diálogo.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un dominio muy concreto, puede fallar ante entradas fuera de su distribución (por ejemplo, cifrados con formatos inusuales o longitudes extremas).
- Riesgo de alucinación: aunque no se ha medido explícitamente, los modelos seq2seq pueden generar salidas incorrectas cuando la entrada no coincide con los patrones vistos en entrenamiento.
- La precisión a nivel de secuencia es solo del 68,11 %, lo que implica que aproximadamente un tercio de las secuencias descifradas contendrá al menos un error; no es adecuado para aplicaciones de seguridad donde se requiera exactitud total.
- No se proporciona información sobre la longitud de contexto máxima, lo que limita su uso para secuencias largas sin una validación previa.
- La licencia MIT permite uso comercial y modificación, pero al ser un modelo académico sin mantenimiento activo, no se garantiza soporte ni actualizaciones.

## Enlaces

- [HuggingFace: SinisterLlama/anlp-a1-c3](https://huggingface.co/SinisterLlama/anlp-a1-c3)
- [GitHub: ANLP-Assignment1](https://github.com/SinisterLlamma/ANLP-Assignment1)
