# aurateam/AURA_2_BF8

## Resumen

AURA 2.0 es un modelo de lenguaje para vídeo en streaming desarrollado por el equipo aurateam (aurateam2026). A diferencia de los modelos de vídeo tradicionales que responden a consultas sobre un clip ya procesado, AURA 2.0 está diseñado para iniciar conversaciones de forma proactiva, invocar herramientas a partir de lo que ocurre en el directo y fundamentar sus interacciones en objetos y regiones concretas de los fotogramas. El checkpoint publicado en este repositorio es la variante en formato FP8 comprimido (compressed-tensors), pensada para inferencia con runtime compatible con FP8.

El modelo se construye sobre la familia Qwen 3.5 (etiqueta `qwen3_5` en los metadatos) y cuenta con 9.409.813.744 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de modelos de aproximadamente 9.400 millones de parámetros. El repositorio ocupa 11,9 GB, coherente con un checkpoint FP8. Los idiomas declarados son inglés y chino.

La relevancia actual del modelo reside en su enfoque "streaming-first": no espera a que el usuario pregunte, sino que detecta eventos en el flujo de vídeo y decide cuándo intervenir, además de poder llamar a herramientas externas. Esto lo orienta a aplicaciones de asistencia en directo, vigilancia semántica, accesibilidad o agentes embebidos en vídeo. La información pública disponible es limitada: no se especifican licencia, pipeline ni resultados de benchmarks en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen 3.5 (etiqueta `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (formato compressed-tensors); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP8 comprimido con compressed-tensors) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna más allá de la etiqueta `qwen3_5`, que indica que el modelo se basa en la familia Qwen 3.5. Se trata, por tanto, de una arquitectura transformer de aproximadamente 9.400 millones de parámetros, adaptada para entrada de vídeo en streaming y salida de lenguaje con capacidad de llamada a herramientas. El checkpoint distribuido está cuantizado a FP8 mediante compressed-tensors y requiere un runtime y una GPU compatibles con FP8 para su inferencia.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). La model card únicamente describe la finalidad del modelo —iniciar conversaciones, invocar herramientas a partir del directo y fundamentar interacciones en objetos y regiones del vídeo— y remite a la página del proyecto y al repositorio de GitHub para demos y código. El informe técnico está referenciado como arXiv, pero no se incluye su enlace ni su contenido.

## Capacidades

- Comprensión de vídeo en streaming: procesa el flujo de vídeo en tiempo real en lugar de clips cerrados.
- Iniciativa conversacional: puede "hablar primero", es decir, iniciar la interacción sin una consulta explícita del usuario.
- Llamada a herramientas basada en el directo: invoca funciones externas a partir de eventos observados en el vídeo.
- Fundamentación espacial: localiza objetos y regiones concretas en los fotogramas para sustentar sus respuestas.
- Generación de texto y razonamiento multimodal derivado de la entrada de vídeo.
- Soporte multilingüe limitado a inglés y chino según los metadatos.
- Capacidad de agentes y razonamiento multi-paso: implícita en la combinación de iniciativa, tool calling y fundamentación espacial.
- No se dispone de información sobre modo "thinking" explícito, visión de imágenes estáticas, audio u otras capacidades adicionales.

## Casos de uso

- Asistencia en directos y retransmisiones: el modelo puede iniciar avisos o comentarios cuando detecta un evento relevante en el flujo de vídeo, sin esperar a que el operador pregunte, gracias a su capacidad de iniciativa conversacional.
- Vigilancia semántica y alertas: al fundamentar interacciones en objetos y regiones de los fotogramas, puede generar alertas contextualizadas cuando aparece un objeto o una situación concreta en la señal de cámara.
- Accesibilidad audiovisual: descripción proactiva de escenas y objetos para personas con discapacidad visual, aprovechando la capacidad de hablar primero y de localizar regiones en el fotograma.
- Agentes embebidos en vídeo con tool calling: integración con APIs externas (por ejemplo, registro de incidencias o control de dispositivos) activadas por eventos observados en el directo.
- Soporte remoto y teleasistencia: el modelo puede guiar a un usuario señalando objetos o zonas de la imagen captada por su cámara en tiempo real.
- Análisis de retransmisiones deportivas o de eventos: detección y comentario de acciones concretas en el flujo, con invocación de herramientas para recuperar estadísticas o datos complementarios.
- Moderación de contenido en directo: identificación de regiones y objetos sospechosos en el stream y generación de avisos automáticos para revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa 11,9 GB en disco; con overhead de runtime se recomienda al menos 16 GB de VRAM para FP8, aunque el dato exacto no está disponible.
- GPU recomendadas: no disponible en la información proporcionada; se requiere una GPU compatible con FP8 (por ejemplo, arquitecturas Ada Lovelace o Hopper en el ecosistema NVIDIA, si bien el autor no lo especifica).
- ¿Cabe en GPU de consumo? No confirmado; por tamaño (≈9,4 B de parámetros en FP8) es plausible en GPUs de consumo con suficiente VRAM, pero no hay confirmación oficial.
- Opciones de despliegue: el autor indica que se requiere un runtime compatible con FP8; no se mencionan vLLM, llama.cpp, Ollama ni TGI de forma explícita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución; es un riesgo para producción.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Solo se distribuye en FP8 comprimido; no hay versiones BF16/GGUF en la información disponible, lo que limita opciones de despliegue en hardware sin soporte FP8.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay datos de evaluación que lo cuantifiquen.
- Sesgos: no se documentan sesgos conocidos ni procesos de alineación (RLHF/DPO) en la información disponible.
- Longitud de contexto no especificada, lo que impide planificar cargas de streaming prolongado con garantías.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.
- No hay benchmarks publicados que permitan estimar su calidad frente a alternativas.
- La fecha de creación del repositorio (2026) y la referencia a un informe técnico arXiv sin enlace dificultan la verificación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/aurateam/AURA_2_BF8
- Página del proyecto: https://aurateam2026.github.io/Aura-2.0/
- Repositorio GitHub: https://github.com/aurateam2026/Aura2.0
- Informe técnico (arXiv): referenciado en la model card, sin enlace directo disponible
