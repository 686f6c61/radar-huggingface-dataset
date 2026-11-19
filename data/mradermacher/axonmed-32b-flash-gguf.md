# mradermacher/AxonMed-32B-Flash-GGUF

## Resumen

AxonMed-32B-Flash-GGUF es la versión cuantizada en formato GGUF del modelo AxonMed-32B-Flash, publicado por el usuario mradermacher en Hugging Face. Se trata de una conversión estática de los pesos originales alojados en Saathimed/AxonMed-32B-Flash, generada con herramientas de cuantización estándar para el ecosistema llama.cpp. El modelo cuenta con 32.763.876.352 parámetros totales, lo que lo sitúa en la categoría de modelos densos de aproximadamente 32B.

El modelo base no incluye información pública sobre arquitectura, datos de entrenamiento, licencia o idiomas en la información disponible. El repositorio GGUF es únicamente un artefacto de conversión: no aporta documentación técnica propia más allá de la lista de cuantizaciones generadas. La relevancia de esta ficha radica en documentar el artefacto disponible y sus opciones de cuantización, advirtiendo de la ausencia de datos verificables sobre el modelo original.

La fecha de creación del repositorio (2026-11-19) y la ausencia de descargas o likes indican que se trata de una publicación muy reciente y sin tracción comunitaria conocida en el momento de redactar esta ficha. Cualquier evaluación de capacidades debe remitirse al modelo base original, cuya documentación no está incluida en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio); safetensors en el modelo base según metadatos de parámetros |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base AxonMed-32B-Flash en los datos proporcionados. El recuento de parámetros (32.763.876.352) es consistente con un transformer denso de la familia de 32B, pero no se confirma ni la arquitectura exacta, ni si emplea atención lineal, mezcla de expertos u otras variantes. Tampoco consta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

El artefacto aquí documentado es una conversión estática a GGUF. Los metadatos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversión desde pesos en formato Hugging Face con cuantización de tensores de salida. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica uso previsto para diálogo, aunque no se detallan capacidades específicas.
- Razonamiento, código, matemáticas o visión: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con llama.cpp u Ollama: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar un modelo de 32B en equipos con 24 GB de VRAM, útil para prototipado de asistentes conversacionales sin depender de la nube.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece hasta doce variantes (desde Q2_K hasta x-f16), lo que facilita estudios de degradación de calidad frente a tamaño en pipelines de investigación.
- Servicio de chat autoalojado: mediante llama.cpp server o interfaces compatibles con la API de OpenAI, se puede exponer un endpoint conversacional interno para pruebas de integración.
- Filtrado y clasificación de texto en lote: con la variante Q8_0 o x-f16 en GPU de 40-80 GB se puede procesar grandes volúmenes de documentos con mayor fidelidad.
- Base para fine-tuning posterior: la variante x-f16 sirve como punto de partida para adaptaciones con LoRA sobre el modelo original, si la licencia del modelo base lo permite (dato no disponible).
- Investigación sobre cuantización extrema: las variantes Q2_K y Q3_K_S permiten medir el impacto de la cuantización agresiva en un modelo de 32B en entornos con menos de 16 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos):
  - x-f16: ~65 GB.
  - Q8_0: ~35 GB.
  - Q6_K: ~27 GB.
  - Q5_K_M / Q5_K_S: ~23 GB.
  - Q4_K_M / Q4_K_S: ~19-20 GB.
  - IQ4_XS: ~17-18 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: ~15-17 GB.
  - Q2_K: ~12-13 GB.
- GPU recomendadas: A100 80 GB o H100 para x-f16 y Q8_0; RTX 4090 (24 GB) o A6000 (48 GB) para Q4_K_M y Q5_K_M; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) para Q3_K_M o IQ4_XS con offload parcial.
- Cabe en GPU de consumo: sí, en RTX 4090 con Q4_K_M y en GPUs de 16 GB con cuantizaciones Q3 o IQ4_XS, a costa de posible degradación de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparativa rigurosa. A título orientativo por tamaño y formato:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| AxonMed-32B-Flash-GGUF | 32,76B | no disponible | no disponible | GGUF |
| Qwen2.5-32B-Instruct (referencia de categoria) | 32,5B | 128K (según su model card) | Apache 2.0 | safetensors, GGUF |
| Gemma-2-27B-it (referencia de categoria) | 27B | 8K (según su model card) | Gemma Terms | safetensors, GGUF |

La comparación con Qwen2.5-32B y Gemma-2-27B es solo por rango de parámetros; no implica equivalencia de rendimiento ni de licencia, y no se han verificado benchmarks del modelo AxonMed.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el modelo base: no se conocen datos de entrenamiento, alineación ni evaluación, lo que impide garantizar comportamiento seguro en producción.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse el repositorio original Saathimed/AxonMed-32B-Flash antes de cualquier despliegue.
- Idiomas no declarados: se desconoce la cobertura multilingüe y la calidad en castellano.
- Riesgo de alucinación: inherente a los modelos generativos y no cuantificado para este modelo.
- Sesgos: no documentados; sin datos de evaluación no es posible caracterizarlos.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Repositorio sin descargas ni validación comunitaria en el momento de la ficha: no hay evidencia externa de que la conversión GGUF sea fiel al modelo original.
- El tag `endpoints_compatible` sugiere compatibilidad con la API de inferencia de Hugging Face, pero no se detalla el contrato exacto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AxonMed-32B-Flash-GGUF
- Modelo base original: https://huggingface.co/Saathimed/AxonMed-32B-Flash
