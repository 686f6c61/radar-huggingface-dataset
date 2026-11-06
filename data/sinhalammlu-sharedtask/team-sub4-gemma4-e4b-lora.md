# SinhalaMMLU-SharedTask/team-Sub4-gemma4-e4b-lora

## Resumen

El repositorio `SinhalaMMLU-SharedTask/team-Sub4-gemma4-e4b-lora` contiene un adaptador LoRA (rank 32, alpha 64) para el modelo `google/gemma-4-E4B-it`, desarrollado por el equipo Sub4 en el marco del Sinhala MMLU Shared Task de ICTer 2026. No se trata de un modelo completo, sino de un ajuste fino ligero que adapta exclusivamente las proyecciones de atención y MLP del backbone de texto, con 69,8 millones de parámetros entrenables sobre un total de inferencia de 7,53B (7,46B del backbone textual más 0,07B del adaptador).

El objetivo del adaptador es resolver preguntas de opción múltiple del currículo escolar ceilandés (sinhala), una tarea de evaluación de conocimiento académico en un idioma de bajos recursos. El modelo base se carga en modo solo texto, eliminando las torres de audio y visión de Gemma 4, lo que reduce el cómputo y el uso de memoria a lo estrictamente necesario para la tarea.

Su relevancia actual radica en que demuestra una estrategia de bajo coste (un adaptador de 0,3 GB) para especializar un modelo multilingüe grande en una tarea concreta de un idioma minoritario, sin necesidad de reentrenar el modelo completo. El adaptador corresponde al estado tras la segunda etapa de continuación del entrenamiento, en la que se emplearon todas las preguntas extraídas y generadas con posiciones de respuesta barajadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Gemma 4 E4B-it) con adaptador LoRA sobre proyecciones de atención y MLP |
| Parámetros totales | 7,53B en inferencia (7,46B backbone de texto + 0,07B adaptador) |
| Parámetros activos | 69,8M entrenables (adaptador LoRA) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | sinhala (tarea objetivo); idiomas del modelo base no detallados |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-E4B-it`, un transformer del que se conserva únicamente el backbone de texto (se eliminan las torres de audio y visión). El LoRA tiene rank 32 y alpha 64, y modifica las proyecciones de atención y MLP del modelo lingüístico, abarcando 258 capas según la model card. El número de parámetros entrenables es de 69,8M, lo que supone aproximadamente el 0,9% del total de inferencia.

El entrenamiento se realizó en dos etapas de continuación. La primera usó filas no vistas en la ejecución inicial; la segunda incorporó todas las preguntas extraídas y generadas, con las posiciones de respuesta barajadas para evitar sesgos de posición. Los datos de entrenamiento combinan tres fuentes: Sinhala Global MMLU, preguntas de exámenes escolares de convocatorias pasadas y preguntas generadas a partir de pasajes de libros de texto con Gemini 3.8 Flash. No se detalla el número total de tokens ni si hubo RLHF o DPO; la model card no menciona innovaciones técnicas adicionales más allá del ajuste LoRA y la eliminación de las torres multimodales.

## Capacidades

- Resolución de preguntas de opción múltiple de cuatro opciones en sinhala, mediante un único forward pass por pregunta.
- Clasificación de la respuesta por comparación de los logits de los dígitos "1" a "4": se selecciona el de mayor valor.
- Evaluación de conocimiento académico del currículo escolar ceilandés (MMLU adaptado a sinhala).
- Prompt fijo de cuatro ejemplos (few-shot) integrado en el flujo de inferencia del repositorio del equipo.
- Capacidades del modelo base (generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multimodalidad) potencialmente presentes, pero no evaluadas ni garantizadas tras el ajuste y la eliminación de las torres de audio y visión.
- Soporte multilingüe del modelo base no verificado para esta variante.

## Casos de uso

- Evaluación académica automatizada en sinhala: el adaptador permite corregir o generar exámenes de opción múltiple del currículo escolar, aprovechando el ajuste específico sobre preguntas de convocatorias pasadas y libros de texto.
- Investigación en modelos para idiomas de bajos recursos: sirve como referencia reproducible de ajuste LoRA de bajo coste (0,3 GB) sobre un modelo grande para una tarea MMLU en un idioma minoritario.
- Benchmarking de modelos multilingües en sinhala: el adaptador y su script de inferencia permiten comparar el rendimiento de Gemma 4 E4B-it frente a otros modelos en la tarea Sinhala MMLU con un protocolo fijo.
- Generación de material didáctico de práctica: a partir de pasajes de libros de texto, el modelo puede apoyar la creación de baterías de preguntas de repaso con respuesta única, usando el mismo formato de cuatro opciones.
- Sistemas de tutoría con verificación de respuesta: integrado en un pipeline que formule preguntas y valide la opción elegida mediante los logits de los dígitos, útil en plataformas educativas de sinhala.
- Filtrado y validación de bancos de preguntas: el adaptador puede emplearse para descartar preguntas ambiguas o mal formadas, comparando la confianza del modelo en cada opción.
- Reproducción de experimentos del shared task: el repositorio del equipo incluye `inference.py` y la carpeta `training/`, lo que facilita replicar los resultados y servir de base para futuros envíos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 7,53B parámetros en precisión completa (BF16) se requieren aproximadamente 15 GB solo para pesos, más overhead de activaciones y caché KV. El adaptador añade unos 0,14 GB en BF16.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, una GPU con 24 GB o más (RTX 4090, L40S, A100 40 GB, H100) permitiría cargar el modelo en BF16; GPUs de 16 GB requerirían cuantización.
- ¿Cabe en GPU de consumo? No confirmado; con cuantización a 8 bits o 4 bits sería viable en GPUs de 12-16 GB, pero no hay datos publicados al respecto.
- Opciones de despliegue: el adaptador se carga con PEFT (`PeftModel.from_pretrained`). Para el modelo base no se detallan opciones, aunque por familia serían aplicables vLLM, TGI o llama.cpp con el adaptador fusionado; no hay confirmación en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables del mismo shared task ni resultados de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El adaptador está especializado en preguntas de opción múltiple de sinhala; su uso fuera de ese formato puede degradar el rendimiento del modelo base.
- No se han publicado métricas de evaluación, por lo que se desconoce su precisión real en la tarea objetivo.
- El modelo base se carga sin las torres de audio y visión, de modo que las capacidades multimodales de Gemma 4 E4B-it no están disponibles en esta variante.
- Riesgo de alucinación inherente al modelo base, especialmente en preguntas fuera del dominio del currículo escolar o con opciones ambiguas.
- La licencia es "gemma", sujeta a los términos de uso de Gemma; es necesario revisar las restricciones de uso comercial y las cláusulas de redistribución antes de emplearlo en producción.
- El sesgo de posición se mitiga parcialmente barajando las respuestas en la etapa 2, pero no se documenta una evaluación específica de este sesgo.
- No se detalla la composición exacta del dataset ni el número de tokens de entrenamiento, lo que limita la reproducibilidad completa.
- El repositorio tiene muy pocas descargas y ningún "like", lo que sugiere una validación comunitaria escasa.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/SinhalaMMLU-SharedTask/team-Sub4-gemma4-e4b-lora
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del equipo (inferencia y entrenamiento): https://huggingface.co/SinhalaMMLU-SharedTask/team-Sub4
- No se han encontrado en la información disponible enlaces a papers, blogs, demos u otros recursos adicionales.
