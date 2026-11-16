# mradermacher/Lythri-Wink-2B-GGUF

## Resumen

Lythri-Wink-2B-GGUF es una conversión a formato GGUF del modelo Lythri-Wink-2B, publicada por el usuario mradermacher en Hugging Face. Se trata de una cuantización estática del modelo original alojado en el repositorio Lythri/Lythri-Wink-2B, orientada a su despliegue en entornos con recursos limitados mediante herramientas compatibles con GGUF, como llama.cpp u Ollama. El modelo base tiene 2.000 millones de parámetros según indica su nombre, lo que lo sitúa en la categoría de modelos pequeños aptos para hardware de consumo.

La información disponible sobre este repositorio es muy escasa: la model card se limita a indicar que se trata de cuantizaciones estáticas del modelo original, sin aportar detalles sobre arquitectura, datos de entrenamiento, licencia o idiomas. El repositorio no registra descargas ni interacciones en el momento de la consulta, y su fecha de creación (noviembre de 2026) es posterior a la de la mayoría de modelos de referencia actuales, lo que sugiere un proyecto reciente o de nicho.

Por tanto, esta ficha debe interpretarse como una descripción del artefacto de cuantización y de las características deducibles de su nombre y metadatos, no como una evaluación del modelo base, del que no se dispone de documentación técnica en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2B (deducido del nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo original presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Lythri-Wink-2B en la documentación proporcionada. El nombre sugiere un transformer de 2.000 millones de parámetros, pero no se confirma ni el tipo de atención, ni si emplea técnicas como atención lineal, mezcla de expertos o arquitecturas híbridas. Tampoco se detallan los datos de entrenamiento, el número de tokens procesados, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO.

Respecto al artefacto de cuantización, la model card indica que se generaron cuantizaciones estáticas (quantize_version 2) con salida cuantizada (output_tensor_quantised 1) y conversión desde formato Hugging Face (convert_type hf). Se omitió la conversión del proyector multimodal (skip_mmproj 1), lo que podría indicar que el modelo original no incluye componentes de visión o que estos no se han convertido. Las cuantizaciones disponibles cubren desde f16 hasta Q2_K, pasando por la familia K-quants e IQ4_XS, lo que permite ajustar el equilibrio entre calidad y tamaño en función del hardware.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de lenguaje de 2B parámetros, aunque no se documenta explícitamente.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; la omisión del proyector multimodal en la conversión sugiere ausencia de visión.

## Casos de uso

- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 2B parámetros en GPUs con 4-6 GB de VRAM o en CPU con llama.cpp, facilitando pruebas locales sin infraestructura dedicada.
- Prototipado rápido de aplicaciones de texto: al ser un modelo pequeño y en formato GGUF, puede integrarse en entornos de desarrollo para validar pipelines de generación antes de escalar a modelos mayores.
- Experimentación con cuantizaciones: la disponibilidad de 12 variantes permite comparar la degradación de calidad entre f16 y Q2_K en tareas concretas, útil para investigación sobre cuantización.
- Inferencia en dispositivos edge: el tamaño reducido del archivo Q4_K_S (aproximadamente 1,2-1,5 GB) lo hace candidato para dispositivos con memoria limitada, siempre que se valide su calidad.
- Integración en Ollama o llama.cpp: al estar en GGUF, puede cargarse directamente en estas herramientas para pruebas de generación de texto en local.
- Evaluación comparativa de modelos pequeños: sirve como referencia en estudios que comparen modelos de 2B parámetros en tareas de lenguaje, aunque la falta de documentación limita su valor como baseline reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (2B parámetros):
  - f16: aproximadamente 4-5 GB.
  - Q8_0: aproximadamente 2,5-3 GB.
  - Q5_K_M: aproximadamente 1,8-2,2 GB.
  - Q4_K_M: aproximadamente 1,5-1,8 GB.
  - Q3_K_M: aproximadamente 1,2-1,4 GB.
  - Q2_K: aproximadamente 1-1,2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para mayor throughput; también funciona en GPUs con 4-6 GB (GTX 1650, RTX 3050) en cuantizaciones bajas.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con al menos 4 GB de VRAM para cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, LM Studio, y servidores compatibles con GGUF (llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo original en safetensors.
- Latencia y throughput estimados: no disponibles; dependen del hardware y la cuantización. En una RTX 4090 se espera un throughput alto para 2B, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de 2B parámetros con características documentadas en la información proporcionada, ni de datos de rendimiento del modelo base que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Falta total de documentación: no se conocen arquitectura, datos de entrenamiento, licencia ni idiomas, lo que impide evaluar su idoneidad para producción.
- Licencia desconocida: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue comercial.
- Riesgo de alucinación: inherente a los modelos de lenguaje pequeños, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S), donde la degradación de calidad puede ser notable.
- Sesgos: no documentados; un modelo de 2B sin información sobre su corpus de entrenamiento puede presentar sesgos idiomáticos, culturales o de género no evaluados.
- Limitaciones de contexto e idioma: desconocidas; no se puede garantizar soporte para español ni para ventanas de contexto largas.
- Cuantizaciones bajas: Q2_K e IQ4_XS pueden degradar significativamente la coherencia y la precisión en tareas de razonamiento; se recomienda validar con evaluaciones propias.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta, lo que reduce la confianza en la reproducibilidad y el mantenimiento.
- Fecha de creación futura: el repositorio data de noviembre de 2026, lo que puede indicar un proyecto experimental o no consolidado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lythri-Wink-2B-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Wink-2B
