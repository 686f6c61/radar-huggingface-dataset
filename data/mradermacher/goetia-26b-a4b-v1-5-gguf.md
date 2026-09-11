# mradermacher/Goetia-26B-A4B-v1.5-GGUF

## Resumen

Goetia-26B-A4B-v1.5-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generado por mradermacher a partir del modelo base Naphula/Goetia-26B-A4B-v1.5. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia en CPU y GPU de consumo mediante llama.cpp y sus derivados. El modelo subyacente cuenta con 25.971.339.550 parámetros totales (aproximadamente 26.000 millones), según los datos de pesos publicados.

La nomenclatura "A4B" del nombre sugiere una arquitectura de mezcla de expertos (MoE) con alrededor de 4.000 millones de parámetros activos por token, aunque esta característica no está confirmada en la información disponible del repositorio. El repositorio incluye 13 variantes de cuantización que abarcan desde Q2_K hasta f16, con un tamaño total de 103,7 GB, lo que permite desplegar el modelo en un rango amplio de hardware, desde equipos con GPU de gama media hasta servidores con aceleradores de datacenter.

El interés de esta ficha radica en su utilidad práctica: es un punto de entrada para ejecutar un modelo conversacional de ~26B en entornos locales sin necesidad de infraestructura de servidor dedicada. Sin embargo, la ausencia de model card detallada, licencia declarada, idiomas soportados y benchmarks publicados limita seriamente la evaluación de su idoneidad para producción. Los resultados de búsqueda web realizados no devolvieron información relevante sobre el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura A4B sugiere MoE, sin confirmar) |
| Parámetros totales | 25.971.339.550 (~26B) |
| Parámetros activos | no disponible (aproximadamente 4B inferidos del sufijo A4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas; `convert_type: hf`, `quantize_version: 2`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. El identificador "26B-A4B" sigue la convención habitual en modelos de mezcla de expertos, en la que el primer número indica los parámetros totales y el segundo los parámetros activos por token; de confirmarse, se trataría de un transformer con capas MoE y enrutamiento disperso. El repositorio de cuantización no incluye ninguna ficha técnica del modelo original, ni detalles sobre número de tokens de entrenamiento, composición del dataset, fases de ajuste (SFT, RLHF, DPO) o innovaciones técnicas como decodificación especulativa.

Lo que sí puede afirmarse con los datos disponibles es el proceso de cuantización: se aplicó cuantización estática de versión 2 (`quantize_version: 2`), con tensores de salida cuantizados (`output_tensor_quantised: 1`) y conversión desde pesos en formato HuggingFace (`convert_type: hf`). Se omitió explícitamente el módulo mmproj (`skip_mmproj: 1`), lo que indica que no se procesaron componentes multimodales de visión, en caso de que el modelo base los tuviera. No hay información sobre el proceso de calibración de las cuantizaciones.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo base está ajustado para diálogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de APIs compatibles con OpenAI en infraestructura de inferencia.
- Razonamiento, código, matemáticas o capacidades multimodales: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ninguna lista de idiomas.
- Modo de pensamiento (thinking mode), audio o visión: no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo equipada con una GPU de 24 GB usando cuantizaciones Q4_K_M o inferiores, ofreciendo diálogo multi-turno sin enviar datos a servicios externos.
- Procesamiento de texto en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, resulta apto para resumir o redactar documentos sensibles en sectores como legal, salud o administración pública.
- Prototipado rápido de aplicaciones conversacionales: la disponibilidad de 13 niveles de cuantización permite ajustar el equilibrio entre calidad y consumo de memoria durante la fase de desarrollo antes de decidir el despliegue definitivo.
- Inferencia por lotes en CPU: las cuantizaciones Q2_K y Q3_K_S, con un tamaño estimado en torno a 9-12 GB, permiten ejecutar el modelo en servidores sin GPU para tareas de generación por lotes donde la latencia no es crítica.
- Experimentación académica con modelos de gran tamaño: si se confirma la arquitectura MoE con ~4B activos, el modelo sería adecuado para estudiar comportamiento de enrutamiento de expertos y comparar calidad frente a modelos densos de tamaño similar.
- Base para ajuste fino adicional: al derivar de un modelo base publicado en HuggingFace, es posible aplicar técnicas como LoRA sobre los pesos originales y volver a cuantizar posteriormente, siempre que la licencia del modelo base lo permita.
- Servicio de chat autoalojado con API compatible: la etiqueta `endpoints_compatible` permite integrarlo en plataformas de inferencia que exponen una interfaz estilo OpenAI, facilitando la migración desde proveedores en la nube.

Advertencia: dado que no se dispone de licencia declarada, benchmarks ni especificaciones del modelo base, estos casos de uso son hipótesis de aplicabilidad basadas en las características técnicas del repositorio, no recomendaciones validadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y los resultados de búsqueda web no aportaron datos al respecto.

## Requisitos de hardware

Estimaciones de VRAM para inferencia, calculadas a partir del número de parámetros totales y del tamaño típico de cada cuantización en formato GGUF (los valores reales pueden variar):

| Cuantización | Tamaño estimado de pesos | VRAM mínima estimada | GPU de ejemplo |
|---|---|---|---|
| Q2_K | ~9-10 GB | ~10-12 GB | RTX 3080 12 GB, RTX 4070 Ti |
| Q3_K_S | ~11-12 GB | ~12-14 GB | RTX 4070 Ti Super 16 GB |
| Q3_K_M / Q3_K_L | ~12-14 GB | ~14-16 GB | RTX 4080 16 GB |
| IQ4_XS | ~14-15 GB | ~16-17 GB | RTX 4080 16 GB, RTX 4090 24 GB |
| Q4_K_S / Q4_K_M | ~15-17 GB | ~17-20 GB | RTX 4090 24 GB |
| Q5_K_S / Q5_K_M | ~18-19 GB | ~20-22 GB | RTX 4090 24 GB |
| Q6_K | ~21-22 GB | ~23-25 GB | RTX 4090 24 GB, A6000 48 GB |
| Q8_0 | ~27-28 GB | ~29-31 GB | A6000 48 GB, A100 40 GB |
| x-f16 | ~52-55 GB | ~55-60 GB | A100 80 GB, H100 80 GB |

Notas adicionales:

- Cabe en GPU de consumo: sí, desde Q2_K hasta Q5_K_M en tarjetas de 16-24 GB (RTX 4080, RTX 4090). Las cuantizaciones Q6_K en adelante requieren GPU profesional.
- Si el modelo es efectivamente MoE con ~4B parámetros activos, el throughput será notablemente superior al de un modelo denso de 26B, ya que solo se computa una fracción de los expertos por token. No obstante, la memoria necesaria sigue siendo la del modelo completo salvo que se aplique offloading de expertos a CPU o RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp y servidores GGUF compatibles. Con la etiqueta `endpoints_compatible` también podría servirse mediante backends que acepten GGUF con API tipo OpenAI.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a características estructurales. Las cifras de los modelos alternativos corresponden a sus especificaciones públicas conocidas.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goetia-26B-A4B-v1.5 (GGUF) | 25,97B | no disponible (~4B inferido) | no disponible | no disponible | GGUF en HuggingFace |
| Qwen3-30B-A3B | ~30,5B | ~3,3B | 128K | Apache 2.0 | Pesos completos y GGUF |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32K | Apache 2.0 | Pesos completos y GGUF |

La comparación con Qwen3-30B-A3B es la más pertinente por proximidad en parámetros totales y activos, pero la falta de contexto, licencia y benchmarks del modelo evaluado impide establecer una comparación funcional rigurosa. No se dispone de información sobre modelos comparables directos del mismo autor o familia.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio ni en la información disponible, lo que impide determinar si el uso comercial está permitido. Es imprescindible consultar la página del modelo base Naphula/Goetia-26B-A4B-v1.5 antes de cualquier despliegue en producción.
- No se declara ningún idioma soportado, por lo que el rendimiento en castellano es desconocido y podría ser deficiente si el entrenamiento se centró en inglés.
- No se publican benchmarks, evaluaciones de sesgo ni análisis de alucinación. No hay evidencia empírica sobre la fiabilidad de las respuestas.
- Al ser una cuantización, las versiones de baja precisión (Q2_K, Q3_K_S) introducen degradación medible en la calidad de generación respecto a f16. Para tareas que requieran precisión (código, matemáticas, razonamiento), se recomienda Q5_K_M o superior.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad y de informes de uso independientes.
- El autor del repositorio es un cuantizador, no el desarrollador del modelo; no hay garantía de soporte, actualizaciones ni corrección de errores.
- No hay información sobre el tamaño de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.
- La fecha de creación registrada (2026-09-11) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio y añade incertidumbre sobre su trazabilidad.
- Se omitió el módulo mmproj durante la cuantización, de modo que estas versiones no soportan entrada de imágenes aunque el modelo base pudiera hacerlo.
- Los resultados de la búsqueda web no arrojaron ninguna fuente relevante; las únicas coincidencias fueron sitios de tenis en checo, sin relación con el modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.5-GGUF
- Modelo base: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.5
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Papers, blogs, repositorios o demos adicionales: no disponible (la búsqueda web no devolvió resultados relevantes)
