# ryu0132/Qwen3.6-35B-A3B-NVFP4-Fast-GGUF

## Resumen

Qwen3.6-35B-A3B-NVFP4-Fast-GGUF es una conversión al formato GGUF del modelo unsloth/Qwen3.6-35B-A3B-NVFP4-Fast, publicada por el usuario ryu0132 en Hugging Face. Se trata de una variante cuantizada en NVFP4 (formato de coma flotante de 4 bits de NVIDIA) del modelo Qwen3.6-35B-A3B, un transformer de tipo mezcla de expertos (MoE) con aproximadamente 34.660 millones de parámetros totales y un pipeline declarado de image-text-to-text, lo que indica capacidades multimodales de entrada de imagen y texto.

El modelo resuelve el problema de ejecutar un modelo MoE de gran tamaño con pesos de 4 bits en entornos con soporte para NVFP4, reduciendo el espacio en disco y la memoria necesaria frente a versiones en BF16. El repositorio ocupa 51,3 GB e incluye, además del GGUF principal, un proyector de visión (mmproj) y pesos de predicción multi-token (MTP), lo que sugiere soporte para decodificación especulativa.

Es relevante ahora porque combina tres tendencias recientes: cuantización de muy baja precisión (NVFP4), arquitecturas MoE con pocos parámetros activos por token y despliegue en runtimes GGUF con soporte de visión. La licencia es Apache 2.0, lo que facilita su uso comercial. No obstante, la información publicada es escasa: no se detallan idiomas soportados, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), multimodal image-text-to-text |
| Parametros totales | 34.660.672.368 (aprox. 34,66 mil millones) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3 mil millones activos, dato no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (principal), FP8 convertido a Q8_0, BF16 y Q8_0 para proyector de vision y MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) multimodal, según se deduce del pipeline image-text-to-text y de la nomenclatura A3B del modelo base. El repositorio incluye un proyector de visión (mmproj-BF16.gguf y mmproj-Q8_0.gguf) que permite la entrada de imágenes, y pesos de predicción multi-token (mtp-BF16.gguf y mtp-Q8_0.gguf), una técnica de decodificación especulativa que predice varios tokens por paso para acelerar la inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La cuantización NVFP4 es una innovación destacable: reduce los pesos a 4 bits con un formato de coma flotante que preserva mejor el rango dinámico que la cuantización entera de 4 bits, aunque exige runtimes con soporte específico para tensores NVFP4. El autor advierte que tanto la visión como el MTP requieren soporte del runtime correspondiente.

## Capacidades

- Generación de texto conversacional (tag conversational en el repositorio).
- Procesamiento multimodal de entrada image-text-to-text mediante proyector de visión.
- Predicción multi-token (MTP) para decodificación especulativa, si el runtime lo soporta.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible.
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).

## Casos de uso

- Asistente conversacional multimodal: el modelo puede recibir imágenes junto con texto y mantener diálogos multi-turno, adecuado para interfaces de atención al usuario que requieran interpretar capturas o documentos escaneados.
- Análisis de documentos con imágenes: al combinar el proyector de visión con el modelo de lenguaje, puede extraer información de facturas, gráficos o diagramas y responder preguntas sobre ellos.
- Despliegue en entornos con GPUs NVIDIA recientes: la cuantización NVFP4 reduce el espacio de pesos a aproximadamente la mitad frente a FP8, lo que permite servir un MoE de 34,66 mil millones de parámetros en hardware con menos memoria.
- Inferencia acelerada con decodificación especulativa: los pesos MTP permiten reducir la latencia por token en runtimes que implementen predicción multi-token, útil en aplicaciones interactivas de baja latencia.
- Prototipado local con runtimes GGUF: al estar en formato GGUF, puede cargarse en herramientas compatibles para experimentación sin necesidad de infraestructura de servidores dedicada.
- Evaluación de cuantización de 4 bits: sirve como referencia para comparar la calidad de NVFP4 frente a Q8_0 u otras cuantizaciones en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 51,3 GB en total, incluyendo el GGUF principal, el proyector de visión y los pesos MTP. El GGUF principal en NVFP4 requerirá del orden de 17-20 GB de VRAM para los pesos, más overhead de contexto y activaciones; el dato exacto no está disponible.
- GPU recomendadas: GPUs NVIDIA con soporte de NVFP4, como las de arquitectura Blackwell (B200, RTX 50xx). El soporte en arquitecturas anteriores (A100, H100, RTX 4090) para NVFP4 no está confirmado y depende del runtime.
- GPU de consumo: la viabilidad en RTX 4090 u otras GPUs de consumo depende del soporte de NVFP4 del runtime; no confirmado.
- Opciones de despliegue: runtimes GGUF con soporte para NVFP4, visión y MTP. El autor no especifica nombres concretos de runtimes (llama.cpp, Ollama, etc.); se requiere uno con soporte explícito para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-NVFP4-Fast-GGUF | 34,66 mil millones | no disponible | Apache 2.0 | GGUF (NVFP4) | Conversion GGUF con vision y MTP |
| unsloth/Qwen3.6-35B-A3B-NVFP4-Fast | no disponible | no disponible | no disponible | safetensors | Modelo base del que deriva esta conversion |
| Qwen3.6-35B-A3B (original) | no disponible | no disponible | no disponible | no disponible | Modelo original sin cuantizar; datos no confirmados en la informacion disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización NVFP4 puede degradar la calidad frente a BF16 o FP8; no se han publicado evaluaciones de la pérdida de precisión.
- El soporte de NVFP4, visión y MTP depende del runtime; sin él, el modelo puede no cargar o no funcionar correctamente.
- No se declaran idiomas soportados, lo que dificulta evaluar su cobertura multilingüe.
- No hay información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje; no cuantificado en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los pesos originales antes de un uso comercial.
- La fecha de creación del repositorio (2026-11-09) y la nomenclatura del modelo base deben tratarse con cautela; no hay verificación independiente de los datos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ryu0132/Qwen3.6-35B-A3B-NVFP4-Fast-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-NVFP4-Fast
