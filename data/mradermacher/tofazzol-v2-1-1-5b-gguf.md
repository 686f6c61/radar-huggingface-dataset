# mradermacher/Tofazzol-v2.1-1.5B-GGUF

## Resumen

Tofazzol-v2.1-1.5B-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo base `porkr/Tofazzol-v2.1-1.5B`. No se trata de un modelo original, sino de una conversión de pesos a distintos niveles de cuantización para facilitar su despliegue en entornos con recursos limitados mediante herramientas como llama.cpp u Ollama. El modelo subyacente tiene 1.500 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños, aptos para inferencia en CPU y GPUs de consumo.

La información pública disponible es mínima: la model card del repositorio se limita a indicar que se trata de cuantizaciones estáticas del modelo original, e incluye metadatos del proceso de conversión (versión de cuantización 2, tensores de salida cuantizados, tipo de conversión `hf`). No se especifican arquitectura, idiomas, licencia ni datos de entrenamiento del modelo base en la información proporcionada.

Su relevancia radica en que ofrece una vía práctica para ejecutar un modelo de 1.5B en hardware modesto, con múltiples opciones de cuantización que van desde Q2_K hasta Q8_0 y F16, permitiendo ajustar el equilibrio entre calidad y uso de memoria según el caso de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 1.500 millones (según nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en formato Hugging Face (`convert_type: hf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `porkr/Tofazzol-v2.1-1.5B` en la documentación proporcionada. El nombre sugiere un transformer de 1.5B parámetros, pero no se confirma ni el tipo de atención, ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único verificable es el proceso de cuantización: el repositorio contiene cuantizaciones estáticas generadas con `quantize_version: 2`, con tensores de salida cuantizados (`output_tensor_quantised: 1`) y conversión desde formato Hugging Face (`convert_type: hf`). No se indica si se preservó el tokenizador original ni si se incluyó el `mmproj` (proyector multimodal), lo que sugiere que el modelo base es exclusivamente de texto.

## Capacidades

- Generación de texto: capacidad esperable por el formato del modelo, aunque no confirmada explícitamente en la documentación.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible; la ausencia de `mmproj` en las cuantizaciones apunta a que no hay soporte multimodal.

## Casos de uso

- Despliegue en CPU para prototipado: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 1.5B en equipos sin GPU dedicada mediante llama.cpp, con un consumo de memoria de aproximadamente 1-1,5 GB, adecuado para pruebas de concepto y demos locales.
- Inferencia en GPUs de consumo: la variante Q8_0 o F16 puede cargarse en GPUs con 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) para obtener la máxima calidad posible del modelo base.
- Entornos con memoria muy restringida: la cuantización Q2_K reduce el peso a aproximadamente 600-700 MB, permitiendo su uso en dispositivos de borde o contenedores con límites estrictos de RAM.
- Evaluación comparativa de cuantizaciones: al ofrecer 12 variantes, el repositorio sirve para medir el impacto de la cuantización en la perplejidad y la calidad de generación sobre un mismo modelo base.
- Integración en aplicaciones de escritorio: al ser GGUF, puede embeberse en herramientas como Ollama o LM Studio para asistentes locales sin conexión.
- Filtrado y clasificación de texto ligera: un modelo de 1.5B cuantizado puede emplearse en tareas de etiquetado o moderación de bajo coste donde no se requiera razonamiento complejo, siempre que se valide su calidad previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según cuantización, para 1.5B parámetros):
  - Q2_K: ~0,6-0,7 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~0,8-1,0 GB
  - Q4_K_S / Q4_K_M / IQ4_XS: ~1,0-1,2 GB
  - Q5_K_S / Q5_K_M: ~1,2-1,4 GB
  - Q6_K: ~1,4-1,6 GB
  - Q8_0: ~1,8-2,0 GB
  - F16: ~3,0-3,2 GB
- GPU recomendadas: no disponible en la documentación; por tamaño, cualquier GPU con 4 GB o más de VRAM puede alojar las cuantizaciones Q8_0 o F16 (RTX 3050, RTX 4060, GTX 1660, etc.).
- ¿Cabe en GPU de consumo? Sí, todas las cuantizaciones caben en GPUs de consumo con 4 GB o más de VRAM; las variantes Q4 y Q5 caben incluso en iGPUs con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni sobre alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: al no indicarse la licencia del modelo base ni de las cuantizaciones, no se puede garantizar el uso comercial. Es imprescindible consultar el repositorio original `porkr/Tofazzol-v2.1-1.5B` antes de cualquier despliegue en producción.
- Idiomas no confirmados: se desconoce si el modelo soporta castellano u otros idiomas distintos del inglés.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar la ventana real del modelo base.
- Riesgo de alucinación: inherente a los modelos de 1.5B parámetros; la cuantización agresiva (Q2_K, Q3_K_S) puede incrementar la degradación de la calidad y la incoherencia.
- Sin benchmarks: no hay evidencia publicada de rendimiento que permita validar su calidad frente a alternativas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por la comunidad.
- Ausencia de `mmproj`: no hay soporte multimodal en las cuantizaciones publicadas.
- Fecha de creación futura (2026-11-13): el repositorio presenta una marca temporal anómala, lo que conviene verificar antes de confiar en él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Tofazzol-v2.1-1.5B-GGUF
- Modelo base: https://huggingface.co/porkr/Tofazzol-v2.1-1.5B
