# Mwanzau/LFM3-1.7B-Mazgu

## Resumen

LFM3-1.7B-Mazgu es un ajuste fino del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario Mwanzau, orientado a dotar al modelo base de competencia conversacional en tumbuka (tum), una lengua bantú hablada principalmente en Malaui y Zambia. El modelo parte de un checkpoint intermedio del propio autor (Mwanzau/LFM3-1.7B-CPT-tumbuka) y combina preentrenamiento continuado (CPT) con ajuste supervisado (SFT), según indica la model card.

El modelo base LFM3-1.7B pertenece a la familia LFM3 de Liquid AI, con arquitectura "liquid" (no transformer convencional) y 1.728.801.536 parámetros totales según los pesos en safetensors. El repo ocupa 3,5 GB y se distribuye en formato safetensors con código personalizado (`custom_code`), lo que implica que requiere `trust_remote_code=True` en transformers.

Su relevancia es acotada pero clara: cubre una lengua de bajos recursos (tumbuka) sobre una arquitectura de borde (edge) de 1,7B, manteniendo las capacidades multilingües del modelo base en 17 idiomas declarados. No hay datos publicados de benchmarks ni métricas de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid (familia LFM3 de Liquid AI), con código personalizado en transformers |
| Parametros totales | 1.728.801.536 (1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | tum, en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors |
| Tamano del repo | 3,5 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | LiquidAI/LFM3-1.7B; Mwanzau/LFM3-1.7B-CPT-tumbuka |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM3 de Liquid AI, etiquetada como "liquid" y "edge" en los tags del repo, lo que la sitúa en la línea de modelos compactos pensados para inferencia en dispositivos de recursos limitados. No se detalla en la información proporcionada la composición interna de la arquitectura (capas, mecanismo de atención, posible hibridación con SSM), ni la longitud de contexto nativa.

El entrenamiento descrito por el autor consiste en preentrenamiento continuado (CPT) seguido de ajuste supervisado (SFT), realizados en Google Colab según la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El resultado declarado es un modelo que "habla tumbuka con fluidez y responde preguntas en tumbuka", partiendo del checkpoint intermedio Mwanzau/LFM3-1.7B-CPT-tumbuka.

## Capacidades

- Generación de texto conversacional, con especial énfasis en tumbuka (tum) según la model card.
- Capacidades multilingües heredadas del modelo base en 17 idiomas: tum, en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl.
- Respuesta a preguntas en tumbuka de forma fluida, según declara el autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo "thinking": no disponibles en la información proporcionada.
- Código y matemáticas: no se documentan explícitamente para este ajuste.

## Casos de uso

- Asistentes conversacionales en tumbuka: el modelo puede gestionar diálogos multi-turno en esta lengua de bajos recursos, cubriendo un nicho que los modelos multilingües generales suelen atender deficientemente.
- Digitalización y preservación lingüística: generación de textos, resúmenes y respuestas en tumbuka para proyectos de documentación de la lengua y materiales educativos.
- Atención al ciudadano en Malaui y Zambia: despliegue en entornos con recursos limitados gracias a su tamaño de 1,7B, para responder consultas en tumbuka en portales o aplicaciones móviles.
- Traducción asistida tum ↔ en: uso como componente de pipelines de traducción o posedición, aprovechando el multilingüismo heredado del modelo base.
- Educación y tutoría: generación de explicaciones y preguntas de práctica en tumbuka para contextos escolares, con la ventaja de un modelo pequeño desplegable en hardware modesto.
- Investigación en NLP de bajos recursos: punto de partida para experimentos de CPT/SFT en lenguas bantúes, dado que el autor documenta la metodología (CPT + SFT en Colab) y publica el checkpoint intermedio.
- Prototipado en edge: al ser un modelo de 1,7B, permite pruebas de concepto en portátiles o dispositivos con GPU de gama media, sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,5 GB solo para pesos (1,73B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, alrededor de 4-5 GB según longitud de contexto.
- Cuantización: no se ofrecen variantes GGUF ni cuantizadas en el repo; sería necesario generarlas a partir de los safetensors.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con 6-8 GB de VRAM o más debería poder alojar el modelo en precisión completa.
- Cabe en GPU de consumo: previsiblemente sí en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, aunque no se confirma en la documentación del autor.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el tag `custom_code`); vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-Mazgu | 1,7B | no disponible | 17 (incl. tum) | lfm1.0 | safetensors |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | multilingüe (ver repo base) | lfm1.0 | safetensors |
| Mwanzau/LFM3-1.7B-CPT-tumbuka | 1,7B | no disponible | tum + base | lfm1.0 | safetensors |

No se dispone de datos de rendimiento comparado (benchmarks) para ninguno de los tres, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Como alternativas de la misma categoría (modelos pequeños multilingües), podrían considerarse familias como Qwen2.5-1.5B o Gemma-2-2B, pero no se aportan datos de la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce el rendimiento real en tareas estándar y en tumbuka más allá de la afirmación cualitativa del autor.
- Riesgo de alucinación: inherente a modelos de 1,7B ajustados con SFT sobre datos limitados; no se documenta ningún proceso de mitigación.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus de CPT/SFT en tumbuka no está descrito, lo que impide evaluar su representatividad.
- Contexto: se desconoce la longitud de contexto efectiva del modelo base y si el ajuste la preserva.
- Licencia lfm1.0: es una licencia "other" con términos específicos de Liquid AI; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Código personalizado: el tag `custom_code` obliga a usar `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de desplegarlo en producción.
- Madurez: el modelo se creó y actualizó en noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Idiomas: aunque se declaran 17, la calidad fuera de tumbuka e inglés no está verificada y puede degradarse respecto al modelo base tras el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mwanzau/LFM3-1.7B-Mazgu
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Checkpoint intermedio del autor: https://huggingface.co/Mwanzau/LFM3-1.7B-CPT-tumbuka
- Licencia (referenciada en la model card como LICENSE): https://huggingface.co/Mwanzau/LFM3-1.7B-Mazgu/blob/main/LICENSE
