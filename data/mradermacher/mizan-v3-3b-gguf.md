# mradermacher/Mizan-v3-3B-GGUF

## Resumen
Mizan-v3-3B-GGUF es una versión cuantizada del modelo Nimruz/Mizan-v3-3B, publicada por mradermacher. Se trata de un modelo de 2.899.029.316 parámetros (aproximadamente 3B) especializado en tareas de decisión, clasificación, enrutamiento y moderación, con soporte para persa (farsi) e inglés. El modelo base fue desarrollado por Nimruz y está orientado a sistemas de moderación y enrutamiento de consultas, según las etiquetas "decision-model", "systemone", "clef", "classification", "routing", "moderation" y "calibrated". La relevancia de esta versión radica en que ofrece el modelo en formato GGUF con múltiples niveles de cuantización, lo que permite su despliegue en hardware de consumo y en entornos con recursos limitados. El repositorio incluye cuantizaciones desde Q2_K (1,5 GB) hasta f16 (5,9 GB), además de archivos mmproj que sugieren capacidades multimodales en el modelo base, aunque no se detallan en la model card.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (variante no especificada) |
| Parámetros totales | 2.899.029.316 (2,9B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Persa (farsi) e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
El modelo base Nimruz/Mizan-v3-3B es un transformer de 2,9B parámetros, probablemente afinado para tareas de clasificación y decisión. Las etiquetas indican que ha sido entrenado con la librería Unsloth, lo que sugiere un ajuste fino eficiente. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas como RLHF o DPO. La model card del repositorio cuantizado no incluye detalles sobre la arquitectura interna (número de capas, cabezas de atención, etc.) ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La presencia de archivos mmproj (multi-modal supplement) apunta a que el modelo base podría tener capacidades multimodales (visión), pero no se confirma en la documentación. La cuantización ha sido realizada por mradermacher mediante un proceso estático, sin cuantizaciones ponderadas (imatrix) disponibles en el momento de la publicación.

## Capacidades
- Clasificación de texto: el modelo está etiquetado como "decision-model" y "classification", por lo que puede categorizar textos en función de criterios predefinidos.
- Enrutamiento (routing): puede decidir a qué destino o categoría dirigir una consulta o mensaje.
- Moderación de contenido: diseñado para tareas de moderación, probablemente detectando contenido inapropiado.
- Calibración: la etiqueta "calibrated" sugiere que las probabilidades de sus predicciones están calibradas, lo que es útil para umbrales de decisión.
- Multilingüe: soporta persa (farsi) e inglés.
- Conversacional: la etiqueta "conversational" indica que puede mantener diálogos, aunque su enfoque principal es la decisión.
- Posible multimodalidad: los archivos mmproj incluidos sugieren que el modelo base podría procesar imágenes, pero no hay confirmación en la model card.
- No se ha documentado soporte para tool calling, function calling ni agentes multi-paso.

## Casos de uso
- Moderación de contenido en redes sociales y foros: el modelo puede clasificar comentarios en persa e inglés como tóxicos, spam o apropiados, gracias a su entrenamiento específico en moderación y calibración. Su tamaño de 3B permite desplegarlo en servidores modestos para filtrar en tiempo real.
- Enrutamiento de consultas en atención al cliente: dado un mensaje de un usuario, el modelo decide si debe dirigirse a facturación, soporte técnico o ventas. Su capacidad de clasificación y su soporte para persa lo hacen adecuado para mercados iraníes o diáspora.
- Clasificación de tickets de soporte: categorizar automáticamente tickets entrantes por tipo de incidencia (error de pago, problema técnico, consulta general) para asignarlos al equipo correspondiente.
- Detección de intenciones en asistentes virtuales: identificar la intención del usuario en un chatbot para activar la respuesta adecuada, con umbrales de confianza calibrados.
- Filtrado de correos electrónicos no deseados: clasificar correos como spam o legítimos en entornos persa-inglés, usando la capacidad de decisión binaria o multiclase.
- Análisis de sentimiento en reseñas de productos: determinar la polaridad (positiva, negativa, neutra) de comentarios en persa e inglés, con probabilidades calibradas para priorizar revisiones críticas.
- Triaje de solicitudes en plataformas de servicios: decidir si una solicitud requiere revisión humana o puede procesarse automáticamente, basándose en la clasificación de riesgo.
- Sistemas de recomendación basados en contenido: clasificar ítems o preferencias de usuarios para generar recomendaciones personalizadas, aprovechando la capacidad de categorización.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (modelo 3B en GGUF, estimación basada en el tamaño de los archivos):
  - Q2_K: ~1,5 GB (más overhead de contexto, ~2-3 GB total)
  - Q4_K_M: ~2,0 GB (recomendado, ~3-4 GB total con contexto de 4K)
  - Q8_0: ~3,2 GB (~4-5 GB total)
  - f16: ~5,9 GB (~7-8 GB total)
- GPU recomendadas:
  - Consumer: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090 (cualquiera con al menos 4 GB de VRAM para Q4_K_M)
  - Profesionales: A100, H100 (para despliegues de alta concurrencia)
- Cabe en GPU de consumo: sí, incluso en GPUs con 4-6 GB de VRAM usando cuantizaciones Q4_K_M o Q5_K_M. Para Q8_0 se recomienda 6-8 GB. Para f16, 8-10 GB.
- Opciones de despliegue:
  - llama.cpp (soporte nativo GGUF)
  - Ollama (si se publica el modelo en su biblioteca, o mediante Modelfile)
  - LM Studio
  - text-generation-webui (oobabooga)
  - vLLM (soporte GGUF experimental)
  - TGI (soporte GGUF limitado)
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090, un modelo 3B en Q4_K_M puede generar del orden de 100-200 tokens/s, pero esto es una estimación general, no un dato confirmado.

## Comparativa con modelos similares
No se dispone de datos de rendimiento para comparar directamente. A continuación se comparan especificaciones con otros modelos de tamaño similar (3B-4B) de propósito general. Mizan-v3-3B está especializado en tareas de decisión y moderación en persa/inglés.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Enfoque |
|---|---|---|---|---|---|
| Mizan-v3-3B | 2,9B | No disponible | Apache 2.0 | Persa, inglés | Decisión, moderación, routing |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 Community | Multilingüe | Propósito general |
| Qwen2.5-3B | 3,09B | 32K | Apache 2.0 | Multilingüe | Propósito general |
| Phi-3-mini | 3,8B | 128K | MIT | Inglés (principalmente) | Propósito general, razonamiento |

No se han publicado benchmarks comparativos en la información disponible.

## Limitaciones y advertencias
- Sesgos conocidos: no se dispone de información sobre sesgos específicos. Al estar entrenado principalmente en persa e inglés, puede tener un rendimiento deficiente en otros idiomas.
- Riesgo de alucinación: aunque es un modelo de clasificación, puede producir etiquetas incorrectas o inventar categorías si se usa de forma generativa. La calibración ayuda, pero no elimina el riesgo.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto. Para textos largos, podría truncar o perder información.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright. Sin embargo, se debe verificar la licencia del modelo base Nimruz/Mizan-v3-3B, que podría tener términos adicionales. La model card del repositorio cuantizado indica Apache 2.0.
- Caveats para producción:
  - Las cuantizaciones de baja precisión (Q2_K, Q3_K) degradan la calidad; se recomienda Q4_K_M o superior.
  - El modelo está especializado en tareas de decisión; no es un modelo generativo generalista. Su uso para generación libre de texto puede dar resultados pobres.
  - No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso.
  - La posible multimodalidad (mmproj) no está confirmada en la documentación; su uso requeriría pruebas adicionales.
  - El repositorio tiene muy pocas descargas (75) y ningún "like", lo que sugiere poca validación por parte de la comunidad.

## Enlaces
- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Mizan-v3-3B-GGUF
- Modelo base: https://huggingface.co/Nimruz/Mizan-v3-3B
- Página de resumen de mradermacher para este modelo: https://hf.tst.eu/model#Mizan-v3-3B-GGUF
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Ejemplo de README de TheBloke para GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Reflexiones de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH (empresa que apoya a mradermacher): https://www.nethype.de/
