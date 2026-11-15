# nulliaukamk/Nullabby1.1-small

## Resumen

Nullabby1.1-small es un modelo de lenguaje de 8.791.592.960 parámetros (8,8B) desarrollado por Nullabby Studios, derivado de la arquitectura Granite 4.0 y publicado en Hugging Face por el usuario `nulliaukamk`. Se distribuye como un build "uncensored/decensored": primero se realizó un ajuste de identidad (nombre, recuento de parámetros, estudio y carácter no censurado) y después se aplicó la herramienta heretic para reducir la tasa de rechazos de peticiones del 39% al 4%, con una divergencia KL de 0,0103 respecto al modelo de partida.

El modelo se publica principalmente en formato GGUF, con una cuantización Q3_K_M de aproximadamente 4,05 GiB, y está pensado para inferencia local con llama.cpp. La arquitectura declarada es de tipo Granite 4.0, con 40 capas, vocabulario de 100.352 tokens, longitud de contexto de 131.072 tokens y `rope_theta` de 1e7. La plantilla de chat es de estilo ChatML (system/user/assistant) con un formato descrito como "minja-safe".

Su relevancia es acotada y muy específica: se trata de un experimento de la fase Alpha de un estudio pequeño, con 42 descargas y 0 likes en el momento de la consulta, orientado a usuarios que buscan un modelo conversacional de 8,8B sin mecanismos de rechazo y ejecutable en hardware de consumo. No hay información publicada sobre datos de entrenamiento, benchmarks ni evaluación de calidad, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Granite 4.0 (40 capas, vocabulario 100.352) |
| Parametros totales | 8.791.592.960 (8,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (rope_theta 1e7) |
| Tipos de cuantizacion | Q3_K_M en GGUF (~4,05 GiB); el repo ocupa 63,4 GB, lo que sugiere otras cuantizaciones y/o pesos sin cuantizar no detallados |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado en la informacion disponible) |
| Formato de pesos | GGUF (cuantizacion Q3_K_M); el tamaño del repo sugiere presencia de otros formatos no especificados |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura basada en Granite 4.0: 40 capas, vocabulario de 100.352 tokens, contexto de 131.072 tokens y `rope_theta` de 1e7. No se especifica si se trata de un transformer denso o de una variante híbrida o MoE, ni se detallan innovaciones de atención o decodificación. El pipeline de ajuste declarado consta de dos fases: un ajuste de identidad (nombre del modelo, recuento de 8B parámetros, atribución a Nullabby Studios y carácter uncensored) y una fase de "decensoring" mediante heretic, que según la model card redujo la tasa de rechazo del 39% al 4% con una divergencia KL de 0,0103.

No se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni la procedencia de los datos de ajuste. Tampoco se documenta el proceso de cuantización más allá de la etiqueta Q3_K_M. La plantilla de chat es de estilo ChatML (system/user/assistant) con un formato descrito como "minja-safe", sin más detalle técnico.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla ChatML (system/user/assistant).
- Contexto largo de hasta 131.072 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Comportamiento "uncensored/decensored": baja tasa de rechazo declarada (4% tras heretic, frente al 39% de partida).
- Identidad ajustada: el modelo se presenta como Nullabby1.1-small, de Nullabby Studios, con 8B parámetros.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación con modelos descensurados en local: el modelo está pensado para ejecutarse con llama.cpp (`llama-cli -hf ... -cnv`) y permite estudiar el efecto del proceso heretic sobre la tasa de rechazo en un modelo de 8,8B.
- Investigación sobre alineamiento y seguridad: la reducción declarada de rechazos del 39% al 4% con KL 0,0103 lo convierte en un caso de estudio para medir cómo afecta el decensoring a la utilidad y a los sesgos.
- Procesamiento de documentos largos en local: con 131.072 tokens de contexto, puede resumir o extraer información de contratos, informes o código extenso en equipos con recursos limitados.
- Generación creativa sin filtros: escritura de ficción, guiones o contenido narrativo donde los rechazos del modelo base resultan un obstáculo, ejecutándose en una GPU de consumo gracias a la cuantización Q3_K_M (~4,05 GiB).
- Prototipado de asistentes conversacionales: la plantilla ChatML permite integrarlo en aplicaciones de chat multi-turno con roles system/user/assistant en entornos de desarrollo.
- Evaluación comparativa de cuantizaciones: el tamaño del repo (63,4 GB) sugiere la presencia de varias cuantizaciones, útil para medir la degradación de calidad de Q3_K_M frente a formatos mayores en tareas de razonamiento y generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,05 GiB para la cuantización Q3_K_M en GGUF, más overhead de contexto; el contexto completo de 131.072 tokens requiere memoria adicional para la caché KV.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamaño, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB pueden alojar la cuantización Q3_K_M con margen para contexto; A100 y H100 no son necesarias para esta cuantización.
- Cabe en GPU de consumo: sí, al menos la variante Q3_K_M de ~4,05 GiB; también es viable en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp / llama-cli (método indicado por el autor); vLLM, TGI u Ollama no están documentados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nullabby1.1-small | 8,8B | 131.072 | other | GGUF (Q3_K_M) | Derivado de Granite 4.0, decensored con heretic, 42 descargas |
| Granite 4.0 (modelo base de referencia) | no disponible en la informacion | no disponible | no disponible | no disponible | Arquitectura de partida citada por el autor |
| Alternativas de 8B decensuradas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría; los datos del modelo base Granite 4.0 y de alternativas decensuradas no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental en fase Alpha, con 42 descargas y 0 likes: no hay evidencia de validación por terceros.
- Ausencia total de benchmarks: no se puede evaluar su calidad frente al modelo base ni frente a alternativas.
- El proceso de decensoring con heretic reduce los rechazos, pero no elimina sesgos ni garantiza contenido seguro; puede generar respuestas dañinas, ilegales o inexactas.
- Riesgo de alucinación no cuantificado; al ser un ajuste de identidad sobre un modelo base, puede conservar o amplificar errores factuales.
- Idiomas soportados no declarados: el rendimiento fuera del inglés (u otros idiomas del modelo base) es desconocido.
- Licencia "other" sin texto publicado: no se puede confirmar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- La cuantización Q3_K_M introduce pérdida de calidad frente a pesos de mayor precisión; no se documenta la degradación.
- El contexto de 131.072 tokens puede no ser efectivo en la práctica con esta cuantización; no hay evaluación de aguja en pajar.
- Sin soporte documentado de tool calling, agentes o multimodalidad: no debe asumirse su disponibilidad.
- El tamaño del repo (63,4 GB) y la falta de detalle sobre los archivos incluidos dificultan verificar qué cuantizaciones están realmente disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/nulliaukamk/Nullabby1.1-small
- Heretic (herramienta de decensoring citada por el autor): https://github.com/p-e-w/heretic
