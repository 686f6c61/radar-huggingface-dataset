# mradermacher/Grasmere-E4B-FTPO-i1-GGUF

## Resumen

Grasmere-E4B-FTPO-i1-GGUF es una colección de cuantizaciones GGUF del modelo Grasmere-E4B-FTPO, publicada por el usuario mradermacher en Hugging Face. Se trata de un artefacto de distribución, no de un modelo entrenado desde cero: el autor aplica cuantización con imatrix (matriz de importancia) sobre los pesos originales de jonpojonpo/Grasmere-E4B-FTPO para generar variantes de 2 a 6 bits (Q2_K, IQ3_M, Q4_K_M, Q5_K_M, Q6_K, entre otras) utilizables en llama.cpp y ecosistemas compatibles.

La información pública disponible es muy limitada. La model card únicamente documenta los parámetros de conversión (quantize_version 2, convert_type hf) y la lista de cuantizaciones generadas. No se especifican licencia, idiomas, arquitectura ni datos de entrenamiento del modelo base. El nombre sugiere un modelo de aproximadamente 4.000 millones de parámetros (sufijo E4B), pero este dato no está confirmado en la información proporcionada.

El interés de esta ficha radica en documentar con rigor lo que se sabe y, sobre todo, lo que no se sabe, dado que el repositorio presenta cero descargas y cero likes en el momento de la consulta, lo que indica una publicación muy reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 2.192.734 (dato de safetensors del repo; el nombre sugiere ~4B, discrepancia no aclarada) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Grasmere-E4B-FTPO. El sufijo FTPO podría corresponder a una variante de ajuste fino (fine-tuning) o a una técnica de preferencia, pero no hay documentación que lo confirme. Tampoco se conocen el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

Lo único documentado es el proceso de cuantización: mradermacher ha generado las variantes GGUF con cuantización ponderada por imatrix (matriz de importancia calculada sobre un corpus de calibración), lo que típicamente mejora la retención de calidad en bits bajos respecto a la cuantización uniforme. La model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que la conversión parte de pesos en formato Hugging Face Transformers.

## Capacidades

- No se han documentado capacidades específicas del modelo base en la información disponible.
- El nombre del modelo relacionado Grasmere-E4B-i1-GGUF (mismo autor, sin el sufijo FTPO) incluye las etiquetas `tool-calling`, `conversational` y `imatrix`, lo que sugiere soporte de conversación multi-turno y de llamada a herramientas, aunque esta inferencia no está confirmada para la variante FTPO.
- El mismo modelo relacionado lista cinco idiomas: galés (cymraeg), irlandés (gaeilge), gaélico escocés (gàidhlig) y scots, además del inglés implícito. No hay confirmación de que esta cobertura idiomática aplique a la variante FTPO.
- No hay información sobre razonamiento multi-paso, matemáticas, código, visión ni audio.

## Casos de uso

Dado que no se dispone de especificaciones funcionales verificadas, los casos de uso se plantean como escenarios plausibles condicionados a validación previa:

- Despliegue en CPU o hardware modesto: las cuantizaciones Q2_K a Q4_K_M permiten ejecutar el modelo en llama.cpp sobre equipos sin GPU dedicada, útil para prototipado rápido y pruebas de concepto.
- Experimentación con modelos pequeños en investigación: el tamaño compacto (presumiblemente ~4B) facilita iteraciones rápidas en entornos académicos con recursos limitados.
- Evaluación de cuantización: el repositorio ofrece un abanico amplio de cuantizaciones (de IQ1_S a Q6_K), lo que permite estudiar la degradación de calidad según el nivel de compresión en un mismo modelo.
- Pruebas de conversación multi-turno: si se confirma la capacidad conversacional del modelo base, podría emplearse en asistentes sencillos de bajo coste, aunque requiere evaluación previa de calidad.
- Evaluación de soporte de tool calling: si la etiqueta del modelo relacionado aplica, podría integrarse en flujos de agentes ligeros, previa verificación del formato de llamada esperado.
- Investigación sobre modelos multilingües de lenguas celtas: si la cobertura de galés, irlandés, gaélico escocés y scots se confirma, sería un caso de interés para estudios de PLN en lenguas minoritarias, siempre con validación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, ya que el número de parámetros del modelo base no está confirmado. Como referencia orientativa, un modelo de ~4B en Q4_K_M ocuparía del orden de 2,5-3 GB en disco y en memoria durante la inferencia; en Q6_K, alrededor de 3,5-4 GB. Estas cifras son estimaciones genéricas y no proceden de la información del repositorio.
- GPU recomendadas: no disponible. Por tamaño, un modelo de ~4B cuantizado cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB), pero no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí en cuantizaciones Q4 y Q5, sujeto a verificación.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables con especificaciones verificables en la información proporcionada, y el modelo base carece de documentación pública suficiente para establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay licencia, idiomas, arquitectura ni datos de entrenamiento publicados, lo que impide evaluar su idoneidad para producción.
- Discrepancia en el número de parámetros: el dato de safetensors (2.192.734) no concuerda con el sufijo E4B del nombre; conviene verificar antes de asumir un tamaño concreto.
- Riesgo de alucinación: desconocido, pero inherente a cualquier modelo de lenguaje sin evaluación publicada.
- Sesgos: no documentados; al no conocerse el dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial. Se recomienda contactar con el autor del modelo base antes de cualquier despliegue productivo.
- Validación comunitaria nula: cero descargas y cero likes en el momento de la consulta; no hay evidencia de que el modelo haya sido probado por terceros.
- Calidad de cuantizaciones de bits muy bajos: las variantes IQ1_S, IQ1_M e IQ2_XXS suelen degradar notablemente la coherencia; no se recomiendan para uso real sin evaluación específica.
- Fecha de creación futura (2026-11-08): el repositorio indica una fecha posterior a la actual, lo que puede reflejar un error de metadatos o una programación de publicación; conviene verificar la integridad del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Grasmere-E4B-FTPO-i1-GGUF
- Modelo base: https://huggingface.co/jonpojonpo/Grasmere-E4B-FTPO
- Modelo relacionado (sin FTPO): https://huggingface.co/mradermacher/Grasmere-E4B-i1-GGUF
- Perfil del autor de cuantizaciones: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
