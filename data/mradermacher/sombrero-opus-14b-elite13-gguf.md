# mradermacher/Sombrero-Opus-14B-Elite13-GGUF

## Resumen

Sombrero-Opus-14B-Elite13-GGUF es la versión cuantizada en formato GGUF del modelo prithivMLmods/Sombrero-Opus-14B-Elite13, un modelo de lenguaje de aproximadamente 14.770 millones de parámetros afinado mediante SFT (supervised fine-tuning) con TRL. La cuantización la ha realizado mradermacher, un conocido publicador de quants de la comunidad, que ofrece múltiples niveles de compresión (desde Q2_K hasta Q8_0) para facilitar la inferencia local en hardware de consumo.

El modelo base está etiquetado como "moderately abliterated", es decir, se le han aplicado técnicas de abliteration para reducir los rechazos en sus respuestas, y está orientado a generación de texto conversacional, código y matemáticas. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y está entrenado principalmente en inglés.

La relevancia de esta ficha radica en que permite desplegar un modelo de 14B en GPUs de consumo mediante cuantización GGUF, manteniendo la licencia permisiva y las capacidades del modelo original. No obstante, la información pública disponible sobre arquitectura detallada, datos de entrenamiento y benchmarks es muy limitada, por lo que varios apartados técnicos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no publicados) |
| Parámetros totales | 14.770.033.664 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el número de parámetros (14.770 millones) y las etiquetas del repositorio, se trata de un transformer decoder-only de aproximadamente 14B, pero no se especifican número de capas, dimensión oculta, cabezas de atención ni tipo de atención (MHA/GQA/MQA). Tampoco se documenta la longitud de contexto nativa.

El entrenamiento declarado es SFT (supervised fine-tuning) mediante la librería TRL, partiendo del modelo prithivMLmods/Sombrero-Opus-14B-Elite13. El modelo está etiquetado como "moderately abliterated", lo que indica que se aplicaron técnicas de abliteration para reducir la tendencia a rechazar peticiones. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Generación de código, según la etiqueta "code" del repositorio.
- Razonamiento matemático, según la etiqueta "math".
- Comportamiento "moderately abliterated": menor tasa de rechazos ante peticiones que otros modelos alineados rechazarían.
- Compatible con text-generation-inference y endpoints compatibles (según etiquetas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede ejecutarse en una GPU de consumo con cuantización Q4_K_M (9,1 GB) para mantener diálogos multi-turno sin depender de la nube, gracias a su tamaño de 14B y licencia Apache 2.0.
- Generación de código en entornos con requisitos de privacidad: al poder desplegarse localmente con llama.cpp u Ollama, es adecuado para autocompletar y generar fragmentos de código sin enviar datos a servicios externos.
- Prototipado de aplicaciones de razonamiento matemático: la etiqueta "math" sugiere uso en resolución de problemas y explicaciones paso a paso, aunque sin benchmarks publicados conviene validar la calidad en el dominio concreto.
- Investigación sobre abliteration y alineación: al estar "moderately abliterated", sirve como caso de estudio para comparar tasas de rechazo y comportamiento frente a modelos alineados convencionales.
- Despliegue en endpoints compatibles con TGI: las etiquetas indican compatibilidad con text-generation-inference, lo que permite servirlo en infraestructura estándar de inferencia.
- Fine-tuning adicional sobre la versión GGUF: aunque el GGUF está pensado para inferencia, el modelo base en safetensors (prithivMLmods/Sombrero-Opus-14B-Elite13) puede usarse como punto de partida para SFT adicional con TRL.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 niveles de cuantización, lo que permite medir el impacto de la compresión en calidad y velocidad para un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo como referencia mínima, más overhead de contexto y KV cache):
  - Q2_K: 5,9 GB
  - Q3_K_S: 6,8 GB
  - Q3_K_M: 7,4 GB
  - Q3_K_L: 8,0 GB
  - IQ4_XS: 8,3 GB
  - Q4_K_S: 8,7 GB
  - Q4_K_M: 9,1 GB
  - Q5_K_S: 10,4 GB
  - Q5_K_M: 10,6 GB
  - Q6_K: 12,2 GB
  - Q8_0: 15,8 GB
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) puede ejecutar Q8_0 con contexto moderado; una RTX 3090/4080 (16-24 GB) cubre Q6_K y Q8_0 con margen variable; GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) cubren hasta Q4_K_M/Q5_K_M con contexto limitado.
- Cabe en GPU de consumo: sí, desde Q2_K (5,9 GB) en GPUs de 8 GB, hasta Q8_0 (15,8 GB) en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base admite text-generation-inference y transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sombrero-Opus-14B-Elite13-GGUF | 14,77B | no disponible | apache-2.0 | GGUF | moderately abliterated, SFT, inglés |
| Modelo base (prithivMLmods/Sombrero-Opus-14B-Elite13) | 14,77B | no disponible | apache-2.0 | safetensors | mismo modelo sin cuantizar |
| Versión i1 (mradermacher/Sombrero-Opus-14B-Elite13-i1-GGUF) | 14,77B | no disponible | apache-2.0 | GGUF (imatrix) | quants ponderados de mayor calidad |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada para establecer una comparativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado y etiquetado únicamente en inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- Al estar "moderately abliterated", puede producir contenido que modelos alineados rechazarían; requiere filtros y moderación en producción.
- Riesgo de alucinación inherente a modelos de 14B sin benchmarks publicados que permitan calibrar su fiabilidad.
- No se documenta la longitud de contexto, lo que dificulta planificar aplicaciones con ventanas largas.
- La cuantización introduce pérdida de calidad, especialmente en Q2_K y Q3_K_S; el autor recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base podría arrastrar obligaciones de sus propios datos de entrenamiento no documentados; conviene revisar la ficha del modelo base.
- No hay información sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El repositorio ocupa 102 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sombrero-Opus-14B-Elite13-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Sombrero-Opus-14B-Elite13
- Quants imatrix (i1): https://huggingface.co/mradermacher/Sombrero-Opus-14B-Elite13-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Sombrero-Opus-14B-Elite13-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
