# mradermacher/MiniAI-Quata2-4b-Preview-i1-GGUF

## Resumen

MiniAI-Quata2-4b-Preview es un modelo de lenguaje conversacional de aproximadamente 4.841 millones de parámetros (4,84B), desarrollado por M1n1A1 y cuantizado en formato GGUF por mradermacher. El modelo base destaca por su enfoque en tool calling y su soporte nativo de cuatro idiomas: inglés, serbio, croata y bosnio, lo que lo convierte en una opción poco habitual para el ecosistema lingüístico eslavo del sur. La nomenclatura "Quata2" y la etiqueta "qwen3.5" sugieren un linaje derivado de la familia Qwen, aunque no se dispone de confirmación oficial en la información proporcionada.

Esta ficha describe la versión cuantizada publicada por mradermacher, que ofrece un espectro amplio de cuantizaciones (desde IQ1_S de 1,7 GB hasta Q6_K de 4,1 GB), incluyendo variantes con imatrix que mejoran la relación calidad/tamaño. El repositorio acumula más de 3.400 descargas, lo que indica un interés moderado pero sostenido en la comunidad.

La relevancia actual del modelo radica en su combinación de tamaño contenido (apto para hardware de consumo), licencia Apache 2.0 permisiva y capacidades de tool calling, lo que lo posiciona como candidato para despliegues locales en entornos con requisitos de privacidad o para aplicaciones multilingües en la región balcánica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas sugieren linaje Qwen 3.5) |
| Parámetros totales | 4.841.450.496 (4,84B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (con imatrix) |
| Idiomas soportados | inglés (en), serbio (sr), croata (hr), bosnio (bs) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Las etiquetas del repositorio incluyen "qwen3.5", lo que sugiere que el modelo podría estar construido sobre la arquitectura de la familia Qwen, probablemente un transformer decoder-only con atención estándar, pero este extremo no está confirmado. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La contribución técnica principal de este repositorio es la cuantización con imatrix (importance matrix), que calibra la pérdida de precisión durante la cuantización usando estadísticas de activaciones. Esto permite que las cuantizaciones de baja precisión (especialmente las de la familia IQ) mantengan una calidad superior a las cuantizaciones estáticas equivalentes en tamaño. El autor proporciona además el archivo imatrix original (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, serbio, croata y bosnio.
- Tool calling / function calling, según la etiqueta "tool-calling" del repositorio.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su integración en infraestructuras de inferencia estándar.
- Capacidad de razonamiento y generación de código: no confirmada explícitamente en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de pensamiento (thinking mode): no disponible.
- Soporte de agentes multi-paso: no confirmado en la documentación.

## Casos de uso

- Atención al cliente en lenguas balcánicas: el modelo puede gestionar conversaciones multi-turno en serbio, croata y bosnio, lo que lo hace adecuado para empresas que operan en la región de los Balcanes occidentales y necesitan asistencia automatizada en la lengua local del usuario.
- Despliegue local con tool calling: gracias a sus cuantizaciones de 3-4 GB (Q4_K_M, Q5_K_M), puede ejecutarse en estaciones de trabajo con GPU de consumo y utilizarse para invocar funciones externas (APIs, bases de datos) en asistentes internos.
- Procesamiento de documentación multilingüe: útil para resumir o extraer información de documentos redactados en inglés y en las lenguas eslavas del sur cubiertas, con la ventaja de que los datos no salen de la infraestructura propia.
- Prototipado rápido de chatbots: la licencia Apache 2.0 y la disponibilidad de GGUF permiten integrar el modelo en aplicaciones experimentales sin coste de licencia ni fricción de despliegue.
- Educación y traducción asistida: puede emplearse como apoyo en herramientas de aprendizaje de idiomas o de traducción entre inglés y las variantes serbio-croatas, aunque la calidad en estas tareas no está documentada.
- Investigación en eficiencia de cuantización: el repositorio sirve como caso de estudio para comparar el rendimiento de distintas cuantizaciones IQ frente a las K-quants en un modelo de ~5B, gracias al archivo imatrix incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB con Q2_K, 3,2 GB con Q4_K_M, 3,6 GB con Q5_K_M y 4,1 GB con Q6_K (tamaños de archivo; la VRAM real requiere margen adicional para el contexto y el runtime).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4-Q6; RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. Para las cuantizaciones IQ1-IQ2 basta con 3-4 GB de VRAM.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 6 GB o más, e incluso en iGPUs con memoria unificada para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; la etiqueta "endpoints_compatible" sugiere compatibilidad con APIs de inferencia estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MiniAI-Quata2-4b-Preview (este) | 4,84B | no disponible | en, sr, hr, bs | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-3B | 3,09B | 32K | multilingüe (29+) | Apache 2.0 | safetensors, GGUF |
| Llama 3.2-3B | 3,21B | 128K | multilingüe (8) | Llama 3.2 Community | safetensors, GGUF |
| Gemma 2-2B | 2,61B | 8K | multilingüe | Gemma Terms | safetensors, GGUF |

La comparativa se ofrece como referencia de categoría (modelos de 2-5B parámetros); los datos de contexto de este modelo no están confirmados y los de los competidores provienen de sus fichas públicas. No se dispone de benchmarks comparativos directos.

## Limitaciones y advertencias

- El modelo se distribuye como "Preview", lo que implica que puede tratarse de una versión inestable o sujeta a cambios sin aviso.
- No se documentan sesgos conocidos, pero al estar entrenado principalmente en inglés y lenguas eslavas del sur, es probable que su rendimiento en castellano u otras lenguas sea deficiente.
- Riesgo de alucinación inherente a modelos de ~5B parámetros; no se han publicado evaluaciones de fiabilidad.
- La longitud de contexto no está especificada, lo que impide garantizar ventanas largas en producción.
- Las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar la licencia del modelo base original (M1n1A1/MiniAI-Quata2-4b-Preview) por si impone restricciones adicionales.
- La ausencia de benchmarks publicados impide validar afirmaciones sobre tool calling o calidad multilingüe antes de desplegarlo.

## Enlaces

- Repositorio GGUF (esta versión): https://huggingface.co/mradermacher/MiniAI-Quata2-4b-Preview-i1-GGUF
- Modelo base: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-Preview
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-Preview-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MiniAI-Quata2-4b-Preview-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
