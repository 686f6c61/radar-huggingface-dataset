# mradermacher/Apollyon-24B-GGUF

## Resumen

Apollyon-24B-GGUF es la versión cuantizada en formato GGUF del modelo Apollyon-24B, publicado por el usuario mradermacher a partir de los pesos originales de c4tdr0ut/Apollyon-24B. Se trata de un modelo de lenguaje conversacional de aproximadamente 23.570 millones de parámetros (23,57 B), empaquetado en múltiples niveles de cuantización para facilitar su despliegue en hardware de consumo mediante llama.cpp y derivados.

El modelo resuelve el problema de ejecutar un LLM de gran tamaño en entornos con recursos limitados: al ofrecer variantes desde Q2_K hasta F16, permite elegir el equilibrio entre calidad y huella de memoria según la VRAM o RAM disponible. Es relevante porque los GGUF son el estándar de facto para inferencia local en CPU y GPU de gama media, y esta ficha documenta una de las pocas conversiones disponibles de Apollyon-24B.

La información publicada por el autor es muy escasa: no se detallan arquitectura interna, datos de entrenamiento, licencia ni idiomas soportados. Los datos disponibles se limitan al recuento de parámetros, el conjunto de cuantizaciones generadas y el repositorio de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 23,57 B parámetros; detalles internos no publicados) |
| Parámetros totales | 23.572.403.200 (23,57 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con quantize_version 2) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo original Apollyon-24B (c4tdr0ut/Apollyon-24B). El recuento de parámetros de 23,57 B sugiere un transformer denso de tamaño medio-grande, pero no se confirma si emplea atención estándar, atención lineal, mezcla de expertos u otra variante. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

Respecto a esta versión, la model card únicamente documenta el proceso de conversión: cuantizaciones estáticas de tipo 2 (quantize_version 2) con cuantización de tensores de salida activada (output_tensor_quantised 1) y conversión de tipo `hf`. Se han generado doce variantes de cuantización, desde F16 sin pérdida hasta Q2_K e IQ4_XS para escenarios de memoria muy restringida. No se indica ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.
- Razonamiento y código: no disponible (no se documentan capacidades específicas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M y Q4_K_S permiten ejecutar un modelo de 23,57 B en GPUs con 16-24 GB de VRAM, útil para prototipado de asistentes conversacionales sin depender de la nube.
- Inferencia en CPU con llama.cpp: las cuantizaciones Q2_K e IQ4_XS reducen la huella a un rango manejable para servidores sin GPU, adecuadas para tareas de generación de texto por lotes donde la latencia no es crítica.
- Experimentación e investigación: al ser una conversión GGUF de un modelo poco documentado, sirve para comparar el efecto de distintas cuantizaciones sobre la calidad de salida en un modelo de ~24 B.
- Chat conversacional autoalojado: la etiqueta `conversational` y el soporte de endpoints permiten montar un servicio de chat privado con control total sobre los datos.
- Evaluación de calidad frente a cuantización: comparar F16, Q8_0 y Q4_K_M sobre el mismo prompt permite medir la degradación introducida por la cuantización en tareas concretas.
- Integración en pipelines con Ollama o llama.cpp: el formato GGUF es directamente consumible por estas herramientas, lo que facilita incorporar el modelo a flujos de generación de texto existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos y overhead de contexto):
  - F16: ~47 GB de pesos; requiere 2× A100 40 GB, H100 80 GB o configuración multi-GPU.
  - Q8_0: ~25 GB; cabe en A100 40 GB, H100 o RTX 4090 24 GB con contexto corto y riesgo de desbordamiento.
  - Q6_K: ~19-20 GB; ajustado en RTX 4090 24 GB.
  - Q5_K_M / Q5_K_S: ~16-17 GB; cabe en RTX 4090 24 GB y A6000 48 GB con holgura.
  - Q4_K_M / Q4_K_S: ~13-14 GB; cabe en RTX 4080 16 GB, RTX 4090 y GPUs de 16 GB o más.
  - Q3_K_L / Q3_K_M / Q3_K_S: ~10-12 GB; apto para RTX 3080 12 GB, RTX 4070 Ti 12 GB.
  - Q2_K / IQ4_XS: ~8-10 GB; ejecutable en GPUs de 8-10 GB y en CPU con RAM suficiente.
- GPU recomendadas: A100 40/80 GB y H100 80 GB para F16 y Q8_0; RTX 4090, RTX 4080, A6000 y L40S para cuantizaciones Q4-Q6.
- ¿Cabe en GPU de consumo? Sí, en las cuantizaciones Q2_K a Q5_K en GPUs de 8-24 GB; F16 y Q8_0 quedan fuera del rango de consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. vLLM y TGI no son la vía natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a parámetros y formato. Alternativas de tamaño comparable en formato GGUF:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Apollyon-24B-GGUF | 23,57 B | no disponible | no disponible | GGUF |
| Mistral-Small-24B (referencia de tamaño) | ~24 B | no disponible en esta ficha | no disponible | safetensors/GGUF |
| Gemma-2-27B (referencia de tamaño) | ~27 B | no disponible en esta ficha | no disponible | safetensors/GGUF |

No se han publicado comparativas de rendimiento entre Apollyon-24B y estos modelos en la información disponible; la comparación es únicamente por orden de magnitud de parámetros.

## Limitaciones y advertencias

- Información muy escasa: no se documentan arquitectura, datos de entrenamiento, idiomas ni benchmarks, lo que impide evaluar su calidad antes del despliegue.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor original (c4tdr0ut) antes de usarlo en producción.
- Riesgo de alucinación: inherente a los LLM; sin datos de evaluación no puede acotarse su magnitud.
- Sesgos: no documentados; al no conocerse el dataset de entrenamiento no es posible identificar sesgos conocidos.
- Idiomas: no declarados; el rendimiento en castellano es incierto.
- Contexto: longitud de contexto desconocida, lo que limita el diseño de aplicaciones con ventanas largas.
- Cuantizaciones agresivas: Q2_K e IQ4_XS pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Conversión de terceros: al ser una cuantización de mradermacher sobre pesos de c4tdr0ut, cualquier problema del modelo base se hereda.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Apollyon-24B-GGUF
- Modelo original: https://huggingface.co/c4tdr0ut/Apollyon-24B
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
