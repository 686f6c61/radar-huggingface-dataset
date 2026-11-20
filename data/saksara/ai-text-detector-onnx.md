# saksara/ai-text-detector-onnx

## Resumen

El modelo `saksara/ai-text-detector-onnx` es un clasificador de texto multilingüe desarrollado por el usuario saksara, orientado a la detección de texto generado por inteligencia artificial. Se basa en la arquitectura XLM-RoBERTa base y ha sido exportado a formato ONNX con cuantización int8, lo que permite su ejecución completamente en el navegador del cliente mediante `onnxruntime-web`, sin enviar el texto a ningún servidor.

El modelo resuelve un problema concreto: clasificar un fragmento de texto como escrito por un humano (`Human`) o generado por un modelo de lenguaje (`ChatGPT`). Su diseño está pensado para integraciones ligeras y privadas, como la aplicación web Saksara, donde el procesamiento local es un requisito de privacidad. El repositorio ocupa aproximadamente 0,3 GB e incluye los pesos cuantizados divididos en cinco fragmentos de datos externos.

La relevancia actual del modelo radica en su enfoque de despliegue: al estar cuantizado a int8 y empaquetado para ONNX Runtime Web, reduce los requisitos de infraestructura y permite detección de texto IA en el propio dispositivo del usuario. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, y el propio autor advierte que es una ayuda estadística, no una prueba de autoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parámetros totales | no disponible (arquitectura base XLM-RoBERTa, tamaño exacto no indicado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluación por segmentos de ~1.200 caracteres) |
| Tipos de cuantización | int8 (grafo `model_quantized.onnx`) |
| Idiomas soportados | indonesio (id), inglés (en), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con datos externos fragmentados en 5 shards) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura XLM-RoBERTa base, un transformer encoder multilingüe preentrenado, adaptado aquí como clasificador de dos clases (`Human` / `ChatGPT`). La exportación a ONNX con cuantización int8 y fragmentación de pesos en cinco archivos de datos externos (`model_quantized.onnx_data-000` a `-004`) está diseñada para la inferencia en navegador con `onnxruntime-web`. La model card no proporciona detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible.

Una particularidad operativa es que el texto se evalúa en segmentos de aproximadamente 1.200 caracteres y la puntuación del documento se obtiene como la media de las puntuaciones de sus segmentos. La model card advierte explícitamente que los archivos del tokenizador original no deben volver a guardarse con una versión distinta de la librería, ya que la tokenización se rompería.

## Capacidades

- Clasificación binaria de texto: distingue entre texto escrito por humanos (`Human`) y texto generado por IA (`ChatGPT`).
- Procesamiento multilingüe, con soporte declarado para indonesio, inglés y otros idiomas.
- Inferencia completamente en el cliente mediante ONNX Runtime Web, sin envío de datos a servidores.
- Evaluación por segmentos de ~1.200 caracteres con agregación de puntuaciones a nivel de documento (media de segmentos).
- Compatible con Text Embeddings Inference y con endpoints según los tags del repositorio.
- No dispone de generación de texto, tool calling, razonamiento multi-paso ni capacidades de visión o audio.

## Casos de uso

- Detección de texto IA en aplicaciones web con privacidad por diseño: el modelo se carga con `onnxruntime-web` y procesa el texto en el dispositivo del visitante, de modo que ningún contenido abandona el navegador. Adecuado para editores o plataformas que quieran señalar contenido sospechoso sin comprometer datos personales.
- Moderación de contenido en foros y comentarios: clasificación por segmentos de ~1.200 caracteres para marcar publicaciones potencialmente generadas por IA, con revisión humana posterior dado el carácter estadístico del detector.
- Verificación editorial en medios digitales: análisis de borradores o contribuciones externas para priorizar la revisión manual de textos con alta puntuación de IA, usando la media de segmentos como indicador global del documento.
- Herramientas educativas de integridad académica: integración en plataformas de entrega de trabajos para señalar posibles textos generados por IA, siempre como señal orientativa y nunca como prueba concluyente.
- Análisis de corpus multilingües: al soportar indonesio, inglés y otros idiomas, permite etiquetar grandes volúmenes de texto en pipelines de investigación sobre prevalencia de contenido generado por IA.
- Despliegue en entornos con recursos limitados: la cuantización int8 y el formato ONNX permiten ejecutar el clasificador en dispositivos sin GPU dedicada, como portátiles o navegadores, reduciendo costes de infraestructura frente a alternativas basadas en API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser un modelo XLM-RoBERTa base cuantizado a int8, el tamaño del repositorio (0,3 GB) sugiere un consumo de memoria en el rango de cientos de MB, aunque el dato exacto no está publicado.
- GPU recomendadas: no disponibles; el diseño está orientado a CPU y ejecución en navegador mediante `onnxruntime-web`, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU de consumo e incluso en CPU, dado el enfoque de inferencia en cliente.
- Opciones de despliegue: ONNX Runtime Web (navegador), ONNX Runtime en servidor, Text Embeddings Inference (según tags) y endpoints compatibles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| saksara/ai-text-detector-onnx | XLM-RoBERTa base, int8 ONNX | Segmentos de ~1.200 caracteres | id, en, multilingüe | Apache 2.0 | ONNX | Hugging Face, 0 descargas |
| Detectores de texto IA basados en RoBERTa (familia general) | Transformer encoder | no disponible | Principalmente inglés | Variable según modelo | safetensors, PyTorch | Amplia en Hugging Face |
| Clasificadores multilingües XLM-R genéricos | XLM-RoBERTa | hasta 512 tokens | Multilingüe | MIT / Apache 2.0 según variante | safetensors, ONNX | Amplia en Hugging Face |

La comparativa con alternativas concretas no está disponible en la información proporcionada; los modelos listados son categorías genéricas y sus especificaciones exactas no se han verificado en esta consulta.

## Limitaciones y advertencias

- El propio autor advierte que el modelo es una ayuda estadística, no una prueba de autoría: textos formales escritos por humanos pueden obtener puntuaciones altas y textos de IA parafraseados pueden obtener puntuaciones bajas.
- Los resultados deben ser siempre revisados por una persona antes de tomar decisiones.
- No se han publicado detalles sobre sesgos del dataset de entrenamiento ni sobre su composición, por lo que el riesgo de sesgo idiomático o de dominio es desconocido.
- La model card no documenta la tasa de falsos positivos ni de falsos negativos.
- El modelo solo clasifica en dos etiquetas (`Human` / `ChatGPT`) y no distingue entre distintos generadores de IA.
- La tokenización es frágil: los archivos del tokenizador no deben volver a guardarse con una versión distinta de la librería, según advierte el autor.
- El repositorio presenta cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales ni garantías por parte del autor.
- El modelo está diseñado para segmentos de ~1.200 caracteres; documentos más largos se agregan por media, lo que puede diluir señales localizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saksara/ai-text-detector-onnx
- Perfil del autor: https://huggingface.co/saksara
