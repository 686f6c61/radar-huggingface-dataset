# mradermacher/tmax-27b-v1.1-i1-GGUF

## Resumen

tmax-27b-v1.1-i1-GGUF es una reedición cuantizada del modelo TMaxxx/tmax-27b-v1.1, publicada por mradermacher, un autor conocido en el ecosistema por generar versiones GGUF de modelos abiertos con técnicas de cuantización ponderada mediante matriz de importancia (imatrix). El repositorio contiene únicamente pesos en formato GGUF, listos para su uso en herramientas de inferencia locales como llama.cpp u Ollama, no el modelo original en safetensors.

El modelo base cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), lo que lo sitúa en la categoría de modelos densos de gran tamaño, probablemente derivado de una arquitectura transformer de la familia Qwen u otra similar de 27B. La model card del repositorio no aporta información sobre arquitectura interna, datos de entrenamiento, contexto máximo ni licencia, por lo que muchos de los datos técnicos habituales no están disponibles.

La relevancia de esta ficha reside en que permite evaluar rápidamente la disponibilidad de un modelo de 27B en formato GGUF con múltiples niveles de cuantización (desde IQ1_S hasta Q6_K), lo que facilita su despliegue en hardware de consumo. No obstante, la ausencia de documentación del modelo base y de la licencia limita seriamente su uso en producción sin una verificación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base TMaxxx/tmax-27b-v1.1, presumiblemente transformer denso) |
| Parámetros totales | 26.895.998.464 (≈26,9B) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones ponderadas con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base TMaxxx/tmax-27b-v1.1 en la información proporcionada. Por el número de parámetros (26,9B) y el formato de publicación, se trata con alta probabilidad de un transformer denso, pero no se confirma ni el tipo de atención, ni la presencia de capas MoE, ni innovaciones como decodificación especulativa o atención lineal.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La única información técnica disponible es la relativa al proceso de cuantización: el repositorio incluye cuantizaciones ponderadas mediante imatrix (matriz de importancia), una técnica que ajusta la precisión de cada tensor en función de su relevancia para la perplejidad del modelo, mejorando la calidad de las cuantizaciones de baja precisión (especialmente IQ1, IQ2 e IQ3) frente a las cuantizaciones estándar.

## Capacidades

- Generación de texto conversacional: el tag "conversational" sugiere que el modelo está ajustado o pensado para diálogo multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Razonamiento general y generación de texto libre: capacidades esperables en un modelo denso de 27B, pero no documentadas explícitamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de 27B en GPUs con 16-24 GB de VRAM, lo que lo hace adecuado para prototipado y pruebas sin depender de la nube.
- Experimentación con cuantizaciones de baja precisión: la disponibilidad de variantes IQ1_S, IQ2_XXS e IQ3_XXS permite evaluar el compromiso calidad/tamaño en entornos con VRAM muy limitada (por debajo de 12 GB), útil para investigación sobre compresión de modelos.
- Generación de texto conversacional en aplicaciones de chat locales: el tag "conversational" indica que puede integrarse en interfaces de chat offline mediante llama.cpp u Ollama, aunque sin garantías documentadas sobre el formato de plantilla.
- Evaluación comparativa de técnicas imatrix: el repositorio sirve como caso de estudio para medir la degradación de perplejidad entre cuantizaciones ponderadas y estándar en un modelo de 27B.
- Fines educativos y de investigación: permite estudiar el comportamiento de un modelo de gran tamaño en hardware asequible, sin necesidad de infraestructura de centro de datos.
- Pruebas de integración con endpoints compatibles: el tag "endpoints_compatible" sugiere que puede servirse mediante APIs compatibles con OpenAI, lo que facilita la integración en pipelines de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización y overhead de contexto):
  - IQ1_S / IQ1_M: en torno a 5-7 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 7-10 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: en torno a 11-14 GB.
  - IQ4_XS / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / small-IQ4_NL: en torno a 15-18 GB.
  - Q5_K_S / Q5_K_M: en torno a 18-21 GB.
  - Q6_K: en torno a 21-24 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4-Q6; RTX 4080/4070 Ti Super (16 GB) para Q3-Q4; GPUs de 8-12 GB solo para IQ1-IQ2. Para A100/H100 no hay ventaja específica documentada, pero permitirían Q6_K o precisiones mayores con contexto largo.
- ¿Cabe en GPU de consumo? Sí, en la mayoría de cuantizaciones; las variantes Q4_K_M e IQ4_XS son las más equilibradas para 24 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI (tag "endpoints_compatible"); vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían el modelo en safetensors (no incluido en este repo).
- Latencia y throughput estimados: no disponibles (dependen del hardware y la cuantización; no se han publicado mediciones).

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (licencia, contexto, benchmarks) para establecer una comparativa rigurosa con alternativas de la misma categoría. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| tmax-27b-v1.1 (este repo, GGUF) | 26,9B | no disponible | no disponible | GGUF |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base TMaxxx/tmax-27b-v1.1 antes de cualquier despliegue en producción.
- Ausencia de documentación del modelo base: no hay información sobre datos de entrenamiento, sesgos, alineación ni idiomas, lo que impide evaluar riesgos de sesgo o de alucinación de forma fundamentada.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño, agravado por la falta de datos sobre el proceso de alineación.
- Cuantizaciones de muy baja precisión (IQ1, IQ2): pueden degradar notablemente la coherencia y la calidad del texto; no se recomiendan para producción.
- Contexto desconocido: no se puede planificar el uso en tareas de contexto largo sin conocer la ventana máxima del modelo base.
- Idiomas no documentados: no hay garantía de rendimiento en castellano u otros idiomas distintos del inglés.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Formato exclusivamente GGUF: no apto para pipelines que requieran safetensors (vLLM, TGI, entrenamiento o fine-tuning).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/tmax-27b-v1.1-i1-GGUF
- Modelo base: https://huggingface.co/TMaxxx/tmax-27b-v1.1
