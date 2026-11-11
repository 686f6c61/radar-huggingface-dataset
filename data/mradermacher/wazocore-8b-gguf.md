# mradermacher/WazoCore-8B-GGUF

## Resumen

WazoCore-8B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo WazoCore-8B, generadas por el usuario mradermacher mediante su pipeline habitual de conversión desde pesos Hugging Face (`convert_type: hf`). El modelo base, publicado por quantile-labs, cuenta con 8.153.141.312 parámetros (aproximadamente 8,15 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio aptos para despliegue en hardware consumer con las cuantizaciones adecuadas. El repositorio no incluye información sobre arquitectura, contexto o datos de entrenamiento.

La relevancia de este repositorio es fundamentalmente práctica: ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta F16, incluyendo IQ4_XS), lo que permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible. Al estar etiquetado como `endpoints_compatible` y `conversational`, está pensado para su uso en tareas de diálogo a través de infraestructuras de inferencia compatibles con la API de Hugging Face.

No obstante, la información pública es muy limitada: no se especifican licencia, idiomas soportados, longitud de contexto ni detalles de entrenamiento. El repositorio ocupa 52,0 GB, coherente con la suma de todas las variantes de cuantización incluidas, y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 8.153.141.312 (≈8,15 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors según el dato de parámetros |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base WazoCore-8B en la documentación disponible. El recuento de parámetros (8,15 mil millones) y la nomenclatura "8B" sugieren un transformer denso de escala similar a otros modelos de 8B, pero no se confirma ni el tipo de atención, ni la presencia de componentes MoE, SSM o híbridos.

Tampoco se dispone de datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüe), ni sobre si se aplicaron fases de alineación como RLHF, DPO o similares. La model card del repositorio GGUF se limita a los metadatos del proceso de conversión (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`), sin aportar detalles técnicos del modelo subyacente.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica que el modelo está orientado a diálogo multi-turno, aunque no se detallan sus capacidades específicas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API estándar de Hugging Face.
- Razonamiento, código, matemáticas, visión, audio, tool calling, agentes y modo thinking: no disponible (no se documenta ninguna de estas capacidades).
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue de chat local en hardware consumer: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de 8B en GPUs con 6-8 GB de VRAM efectiva, adecuado para prototipos de asistentes conversacionales en estaciones de trabajo personales.
- Prototipado rápido con Ollama o llama.cpp: al estar en GGUF, el modelo puede cargarse directamente en estas herramientas sin conversión adicional, lo que acelera la validación de ideas antes de comprometerse con infraestructura mayor.
- Evaluación comparativa de cuantizaciones: la disponibilidad de 12 variantes (desde Q2_K hasta F16) permite medir empíricamente la degradación de calidad frente al ahorro de memoria en un caso de uso concreto.
- Servicio de inferencia en CPU: las variantes Q4_K_S y Q3_K_M son viables en servidores sin GPU para cargas de baja concurrencia, útil en entornos de desarrollo o demos internas.
- Integración en pipelines compatibles con endpoints de Hugging Face: la etiqueta `endpoints_compatible` facilita el despliegue gestionado sin necesidad de operar la infraestructura subyacente.
- Fines educativos y de investigación: el modelo sirve para estudiar el impacto de la cuantización en modelos de 8B, aunque la falta de documentación sobre entrenamiento limita su valor como objeto de análisis arquitectónico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos):
  - F16: ~16,3 GB (pesos) + overhead de contexto.
  - Q8_0: ~8,7 GB.
  - Q6_K: ~6,7 GB.
  - Q5_K_M: ~5,8 GB.
  - Q4_K_M: ~4,9 GB.
  - Q3_K_M: ~4,0 GB.
  - Q2_K: ~3,0 GB.
  - IQ4_XS: ~4,4 GB.
- GPUs recomendadas: H100 o A100 para F16 con contexto largo; RTX 4090 (24 GB) para Q8_0 o F16 con contexto moderado; RTX 4080/4070 Ti (12-16 GB) para Q6_K o Q5_K_M; RTX 4060 Ti (8-16 GB) o RTX 3060 (12 GB) para Q4_K_M e IQ4_XS.
- Compatibilidad con GPU consumer: sí, en todas las cuantizaciones desde Q2_K hasta Q6_K; F16 requiere GPUs de gama alta o múltiples GPUs.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de Hugging Face (por la etiqueta `endpoints_compatible`); vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni características del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría (por ejemplo, otros modelos densos de ~8B en GGUF). Cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Licencia no especificada: no puede confirmarse si el uso comercial está permitido; es imprescindible contactar con quantile-labs o consultar el repositorio del modelo base antes de un despliegue en producción.
- Idiomas no documentados: se desconoce si el modelo está entrenado principalmente en inglés, si soporta castellano con calidad suficiente o si cubre otros idiomas.
- Longitud de contexto desconocida: no puede planificarse su uso en tareas que requieran ventanas largas (documentos extensos, conversaciones prolongadas) sin verificación empírica.
- Arquitectura y entrenamiento no documentados: dificulta evaluar riesgos de sesgo, alucinación o limitaciones específicas del dominio.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que aumenta el riesgo de adoptarlo sin una evaluación propia previa.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay señales de validación por parte de la comunidad.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S): pueden degradar notablemente la coherencia y la calidad del diálogo; se recomienda Q4_K_M o superior para uso conversacional.
- Fecha de creación futura en los metadatos (2026-11-11): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WazoCore-8B-GGUF
- Modelo base: https://huggingface.co/quantile-labs/WazoCore-8B
