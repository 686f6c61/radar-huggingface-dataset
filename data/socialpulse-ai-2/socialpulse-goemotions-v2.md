# SocialPulse-AI-2/socialpulse-goemotions-v2

## Resumen
`socialpulse-goemotions-v2` es un espejo versionado del modelo `SamLowe/roberta-base-go_emotions`, publicado por SocialPulse-AI-2 con el objetivo de disponer de una referencia inmutable, sin tokens y controlada por el propio equipo. Los pesos, la configuración y el tokenizador son byte a byte idénticos a la revisión upstream fijada (`d75048347613a25d77de8cf6412eaae9fa7b26be`), de modo que el modelo no aporta un entrenamiento nuevo, sino una copia reproducible para pruebas de regresión downstream.

Se trata de un RoBERTa-base afinado sobre el dataset GoEmotions para clasificación multi-etiqueta de emociones. Para cada texto de entrada devuelve 28 salidas sigmoidales independientes (27 emociones más `neutral`), no una distribución softmax. El modelo está pensado exclusivamente para inglés y su uso en SocialPulse pasa por un mapeo posterior de etiquetas hacia el contrato de emociones propio del proyecto.

La relevancia de esta ficha no está en el rendimiento bruto del modelo, sino en su papel como artefacto de infraestructura: fija una versión concreta, documenta hashes y permite que el pipeline cargue el modelo desde una dirección controlada. Con 124,7 millones de parámetros, un contexto máximo de 512 tokens y licencia MIT, es un componente ligero y fácil de desplegar en entornos de producción con CPU o GPU modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder) |
| Parametros totales | 124.667.678 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`model_max_length=512`) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (solo ingles) |
| Licencia | MIT (pesos y codigo, Copyright (c) 2023 SamLowe); dataset GoEmotions bajo Apache 2.0 |
| Formato de pesos | safetensors (no se incluye `pytorch_model.bin`) |

## Arquitectura y entrenamiento
El modelo es un encoder RoBERTa-base con cabeza de clasificación multi-etiqueta. La salida es un vector de 28 logits independientes, cada uno pasado por una sigmoid, lo que permite que un mismo texto active varias emociones simultáneamente (por ejemplo, `annoyance` y `disapproval`). No se trata de una softmax, por lo que las puntuaciones no suman 1 y deben interpretarse de forma independiente.

El entrenamiento subyacente procede del modelo upstream `SamLowe/roberta-base-go_emotions`, afinado sobre el dataset GoEmotions de Google Research. La model card del espejo no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información pertenece a la model card original del modelo upstream y no se reproduce aquí. La innovación relevante de este repositorio no es arquitectónica, sino de gobernanza: versionado inmutable con SHA-1 de revisión, hashes SHA-256 por fichero registrados en `models/goemotions.lock.json` y exclusión deliberada del binario duplicado.

## Capacidades
- Clasificación multi-etiqueta de emociones en texto inglés, con 27 emociones más la etiqueta `neutral`.
- Salidas sigmoidales independientes por etiqueta, apropiadas para textos con emociones mixtas.
- Integración en pipelines de NLP como componente de análisis de sentimiento fino.
- Uso como base para mapeos downstream hacia contratos de emoción propios (por ejemplo, `anger` a partir de `annoyance`/`disapproval`, `trust` a partir de `admiration`/`caring`/`approval`).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; solo inglés. Cualquier texto en otro idioma debe traducirse antes en una capa externa (`socialpulse-core`).

## Casos de uso
- Moderación de comunidades en inglés: el modelo puntúa cada mensaje contra 28 etiquetas y permite priorizar revisiones humanas cuando `anger`, `disapproval` o `annoyance` superan el umbral configurado (`> 0.30` global).
- Análisis de sentimiento fino en reseñas y foros: al ser multi-etiqueta, detecta combinaciones como `admiration` + `curiosity` que una softmax colapsaría en una sola clase.
- Monitorización de reputación de marca: se puede alimentar un dashboard con las puntuaciones por emoción y aplicar el mapeo SocialPulse para reducir 27 etiquetas a un conjunto manejable de emociones de negocio.
- Investigación en psicología computacional: reproducción exacta de experimentos gracias a la referencia inmutable y a los hashes registrados, evitando derivas por actualizaciones upstream.
- Clasificación previa en pipelines de atención al cliente: filtrar tickets por carga emocional (`trust` con umbral `> 0.40`) antes de enrutarlos a agentes humanos o a respuestas automáticas.
- Evaluación de regresión de modelos: usar el espejo como línea base fija para comprobar que cambios en el preprocesado o en el mapeo downstream no alteran las puntuaciones esperadas.
- Enriquecimiento de datasets: etiquetar corpus ingleses con 28 dimensiones emocionales para entrenar clasificadores posteriores o para análisis exploratorio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye métricas numéricas (F1, precisión, recall) ni comparaciones con otros modelos; solo declara la métrica `f1` como etiqueta de metadatos.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (124,7 M parámetros), más activaciones y overhead del runtime.
- VRAM estimada en fp16: alrededor de 0,25 GB para pesos, más memoria de activaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM efectiva; RTX 3060, RTX 4090, A100 y H100 son sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en CPU con latencias aceptables para cargas por lotes.
- Opciones de despliegue: Hugging Face `transformers` con `AutoModelForSequenceClassification`, `vLLM` (soporte limitado para clasificación), `TGI`, `ONNX Runtime` (aunque la variante ONNX no está incluida en este espejo) y `llama.cpp` no aplica por tratarse de un encoder.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware, del tamaño de lote y de la longitud de secuencia (máximo 512 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| socialpulse-goemotions-v2 | 124,7 M | 512 tokens | Clasificación multi-etiqueta de emociones (28 salidas) | MIT | Hugging Face (espejo) |
| SamLowe/roberta-base-go_emotions | 124,7 M | 512 tokens | Clasificación multi-etiqueta de emociones (28 salidas) | MIT | Hugging Face (upstream) |
| bert-base-uncased | 110 M | 512 tokens | Clasificación de texto genérica | Apache 2.0 | Hugging Face |
| distilroberta-base | 82 M | 512 tokens | Clasificación de texto genérica | Apache 2.0 | Hugging Face |

La comparación directa más relevante es con el modelo upstream: los pesos son idénticos, por lo que el rendimiento es el mismo; la diferencia está en la referencia inmutable y en la model card adaptada. Frente a `bert-base-uncased` o `distilroberta-base`, este modelo aporta una cabeza específica de 28 emociones ya entrenada, pero pierde generalidad y solo cubre inglés.

## Limitaciones y advertencias
- Entrenado sobre datos de Reddit (texto generado por usuarios): hereda sesgos de la comunidad, del vocabulario y de los temas dominantes de esa plataforma.
- Los anotadores eran hablantes nativos de inglés de India; la model card reconoce rendimiento degradado en algunos dialectos y jergas.
- Etiquetas con muy poco soporte upstream (`grief`, `relief`) deben tratarse como de baja precisión y usarse con cautela.
- Solo inglés: cualquier texto en otro idioma debe traduirse en una capa externa; SocialPulse registra los campos `language` y `translated` en su contrato.
- Riesgo de alucinación: no aplica en sentido generativo, pero las puntuaciones sigmoidales pueden producir falsos positivos en textos ambiguos o irónicos; los umbrales de SocialPulse (`> 0.30` global, `> 0.40` para `trust`) difieren del 0.5 documentado upstream y deben versionarse en el repositorio de aplicación, no en el espejo.
- Licencia MIT permite uso comercial, pero la atribución upstream (SamLowe) y el aviso del dataset GoEmotions (Apache 2.0) deben mantenerse; el espejo redistribuye atribuciones sin cambios.
- El mapeo de 27 etiquetas a las emociones de SocialPulse se aplica downstream y no forma parte del modelo; los scores resultantes son el máximo de las etiquetas fuente, no valores normalizados, y `no_emotion` se emite cuando ninguna etiqueta supera su umbral.
- La variante ONNX referenciada upstream queda fuera del alcance de este espejo.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de adopción externa ni de validación comunitaria independiente.

## Enlaces
- [Hugging Face: SocialPulse-AI-2/socialpulse-goemotions-v2](https://huggingface.co/SocialPulse-AI-2/socialpulse-goemotions-v2)
- [Modelo upstream: SamLowe/roberta-base-go_emotions](https://huggingface.co/SamLowe/roberta-base-go_emotions)
- [Revisión upstream fijada (SHA-1 d75048347613a25d77de8cf6412eaae9fa7b26be)](https://huggingface.co/SamLowe/roberta-base-go_emotions/commit/d75048347613a25d77de8cf6412eaae9fa7b26be)
- [Dataset GoEmotions](https://huggingface.co/datasets/go_emotions)
- [Paper GoEmotions: A Dataset of Fine-Grained Emotions (ACL 2020)](https://aclanthology.org/2020.acl-main.372/)
- No se han encontrado en la información proporcionada enlaces a blogs, repositorios de código, demos o papers adicionales específicos de este espejo.
