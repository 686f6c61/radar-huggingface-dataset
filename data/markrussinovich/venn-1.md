# markrussinovich/venn-1

## Resumen

Venn 1 es una capa de decisión nativa de embeddings publicada por Mark Russinovich bajo el perfil `venn-1`. No es un modelo generativo: combina un lector de embeddings congelado (`google/embeddinggemma-2`, unos 270M de parámetros) con una cabeza de decisión propia (`CosineAbstention`, aproximadamente 787K parámetros en FP32) que responde preguntas tipadas —elección entre opciones, sí/no y puntuación numérica— sobre embeddings de texto ya cacheados. El resultado es un sistema ligero que acepta el formato de petición de la Decisions API de Jev (TypeSafe) pero con pesos y runtime propios.

La relevancia del proyecto está en su enfoque: en lugar de generar texto libre, el modelo emite decisiones estructuradas con abstención explícita, lo que lo hace útil para enrutado, clasificación y filtrado en pipelines donde la latencia y el coste por consulta importan. El lector permanece congelado y solo se entrena la cabeza, de modo que el coste de especialización es mínimo y se puede ajustar localmente mediante familias residuales o lineales.

El estado es de *research preview*. La cabeza se distribuye con permiso explícito de redistribución, el código es MIT y el lector conserva sus propios términos. La calibración de probabilidades no es universal: el autor reporta que se incumplieron los objetivos de calibración en tareas no vistas, lo que condiciona su uso en producción sin recalibración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lector de embeddings congelado (EmbeddingGemma 2) + cabeza de decisión `CosineAbstention` con logits coseno y MLP de abstención |
| Parametros totales | Aproximadamente 270M (lector) + aproximadamente 787K (cabeza genérica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del lector EmbeddingGemma 2; no se especifica en la información proporcionada) |
| Tipos de cuantizacion | Lector cuantizado disponible (Google reporta aproximadamente 191 MB de RAM activa en texto en Pixel 11 Pro); cabeza publicada en FP32 (3,15 MB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Cabeza: `venn-1-redistribution-permission` (redistribución permitida); código: MIT; lector y datasets de origen conservan sus propios términos |
| Formato de pesos | Pesos de la cabeza descargados desde el Hub con revisión inmutable y verificación SHA-256; el lector se descarga por separado (no se detalla el formato exacto en la información disponible) |

## Arquitectura y entrenamiento

Venn 1 no es un transformer generativo sino un sistema de dos piezas. La primera es un lector de embeddings congelado, `google/embeddinggemma-2` en la revisión `f9972ac22e696a105c482202646979e33e4b5a1e`, que produce vectores de texto normalizados de 768 dimensiones mediante un prompt de clasificación. La segunda es la cabeza `CosineAbstention`, que opera sobre esos vectores con logits coseno sobre las opciones y un MLP de abstención que añade una opción extra "ninguna" al conjunto de elección, de modo que el modelo puede declinar responder cuando la evidencia es débil.

El entrenamiento de la cabeza genérica congeló el lector y se realizó sobre CLINC, MASSIVE, Banking77, DBpedia, Yahoo Answers y AG News. El MLP de abstención se ajustó por entropía cruzada sobre K+1 opciones (incluida "ninguna") con semilla 42, 20 épocas, AdamW (learning rate 0,001, weight decay 0,01), autocast bf16 y clipping de gradiente en 1. Las temperaturas de elección y abstención se ajustaron por separado sobre episodios de calibración. TREC, GoEmotions y ejemplos fuera de alcance de CLINC se reservaron para evaluación y no participaron en el ajuste ni en la calibración. Además de la cabeza genérica, el runtime permite ajustar familias locales (residuales o lineales para elección, ridge/kernel numéricos y cabezas de resultado compiladas) sobre ejemplos propios sin tocar el lector.

## Capacidades

- Decisión tipada sobre embeddings: elección entre un conjunto de opciones, preguntas de sí/no y puntuación numérica.
- Abstención explícita: la cabeza puede devolver "ninguna" cuando ninguna opción es suficientemente probable.
- Clasificación de texto por similitud coseno en el espacio de embeddings del lector congelado.
- Ajuste local de familias de decisión (residual o lineal para elección, ridge/kernel para valores numéricos, clasificadores lineales compilados) sobre ejemplos propios.
- Compatibilidad con el formato de petición de la Decisions API de Jev, lo que facilita migrar o comparar con el servicio alojado de TypeSafe.
- Integración con flujos de vector store y embeddings cacheados.
- No soporta generación de texto libre, tool calling, razonamiento multi-paso ni capacidades multimodales en la información proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: la cabeza de elección asigna cada ticket a una cola predefinida a partir del embedding del texto; al ser una operación sobre vectores de 768 dimensiones, el coste por consulta es muy inferior al de un modelo generativo y la abstención permite derivar a revisión humana los casos ambiguos.
- Clasificación de intenciones en asistentes conversacionales: con familias locales ajustadas sobre ejemplos propios de CLINC o MASSIVE, se puede especializar el modelo en el dominio del producto sin reentrenar el lector.
- Filtrado de contenido y moderación por umbrales: la salida de puntuación numérica permite fijar umbrales calibrados localmente y combinar la abstención con reglas de negocio.
- Deduplicación y etiquetado en pipelines de datos: al operar sobre embeddings cacheados, se puede procesar grandes lotes sin coste de generación, usando la cabeza para decisiones binarias de sí/no.
- Búsqueda y recuperación con decisión: en un vector store, la cabeza puede decidir si un documento es relevante para una consulta antes de recuperarlo, reduciendo falsos positivos.
- Evaluación comparativa frente a la Decisions API de Jev: el mismo formato de petición permite medir el comportamiento de los pesos locales frente al servicio alojado en tareas de elección y abstención.
- Pruebas de concepto en dispositivos con recursos limitados: el lector cuantizado reportado por Google (aproximadamente 191 MB de RAM activa en texto en Pixel 11 Pro) y una cabeza de 3,15 MB hacen viable ejecutar el sistema en entornos de borde, aunque el runtime actual en PyTorch usa las precisiones indicadas en la documentación del proyecto.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| AUROC de abstención (cabeza genérica) | 0,929 |
| ECE en TREC (tarea no vista) | 0,1215 |
| ECE en GoEmotions (tarea no vista) | 0,1131 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo. Los datos anteriores corresponden exclusivamente a la calibración de la abstención reportada por el autor.

## Requisitos de hardware

- VRAM estimada: la cabeza ocupa 3,15 MB en FP32; el lector de aproximadamente 270M de parámetros ocupa aproximadamente 540 MB en 16 bits y 1,08 GB en la ruta CPU float32 según la model card. En conjunto, el sistema cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre para la configuración en 16 bits; no se requiere A100 ni H100 para inferencia. Para lotes grandes o ajuste de familias locales, una RTX 4090 o superior acelera el proceso.
- GPU de consumo: sí, cabe en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU, con la ruta float32 documentada.
- Despliegue: el proyecto ofrece un servidor local mediante `venn serve` tras instalar el extra `.[embedding]` en Python 3.12. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. Google reporta aproximadamente 191 MB de RAM activa para los pesos cuantizados de texto en Pixel 11 Pro, pero no se ofrecen cifras de latencia del sistema completo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Venn 1 | Capa de decisión sobre embeddings congelados | Aproximadamente 270M (lector) + 787K (cabeza) | No disponible | Redistribución permitida (cabeza), MIT (código) | Hugging Face y GitHub |
| Jev (TypeSafe) | Modelo de decisión alojado con Decisions API | No disponible | No disponible | No disponible | Servicio alojado |
| EmbeddingGemma 2 (solo lector) | Modelo de embeddings | Aproximadamente 270M | No disponible | Términos propios de Google | Hugging Face |
| Clasificadores lineales sobre embeddings | Cabezas supervisadas | Depende del ajuste | No aplica | Según implementación | Genéricos |

La comparación directa más relevante es con Jev, ya que Venn 1 adopta su formato de petición pero con pesos y runtime propios. Frente a un clasificador lineal convencional sobre embeddings, Venn 1 añade abstención calibrada y familias de decisión predefinidas. No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Estado de *research preview*: no es un producto estable y su uso en producción requiere validación propia de la tarea, la distribución de etiquetas y la política de abstención.
- Calibración no universal: el autor reporta ECE de 0,1215 en TREC y 0,1131 en GoEmotions, por encima de los objetivos, por lo que las probabilidades no deben interpretarse como calibradas fuera de las tareas de entrenamiento.
- Exposición de datos de entrenamiento: la cabeza genérica se entrenó con CLINC, MASSIVE, Banking77, DBpedia, Yahoo Answers y AG News; las tareas de evaluación deben elegirse teniendo en cuenta esta exposición.
- Solo inglés: el modelo declara únicamente el idioma `en`, sin soporte multilingüe documentado.
- Lector congelado: cualquier cambio de perfil requiere regenerar embeddings y registros; no se puede adaptar el lector sin sustituirlo.
- Licencia matizada: la redistribución de la cabeza está permitida, pero esa autorización no implica derechos adicionales de uso o modificación, y el lector y los datasets de origen mantienen sus propios términos. El uso comercial debe revisarse contra esos términos.
- Sin pipeline declarado en Hugging Face y con 0 descargas en el momento de la consulta, lo que limita la evidencia comunitaria disponible.
- No apto para generación de texto, razonamiento multi-paso, tool calling ni tareas multimodales.
- La integridad del artefacto se verifica por SHA-256, pero el autor advierte que los checksums establecen identidad del artefacto, no calidad semántica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markrussinovich/venn-1
- Repositorio del proyecto: https://github.com/markrussinovich/venn-vdm
- Perfiles del runtime: https://github.com/markrussinovich/venn-vdm/blob/main/venn/profiles.py
- Documentación de rendimiento y huella: https://github.com/markrussinovich/venn-vdm/blob/main/docs/performance.md#model-footprint
- Documentación de conceptos (cambio de lector): https://github.com/markrussinovich/venn-vdm/blob/main/docs/concepts.md#changing-the-reader
- Documentación de licencias: https://github.com/markrussinovich/venn-vdm/blob/main/docs/licenses.md
- Ejemplo de enrutado de tickets: https://github.com/markrussinovich/venn-vdm/blob/main/examples/route_ticket.py
- Ejemplo de familia registrada: https://github.com/markrussinovich/venn-vdm/blob/main/examples/registered_family.py
- Ejemplo numérico (vino): https://github.com/markrussinovich/venn-vdm/blob/main/examples/wine/README.md
- Ejemplo de audio: https://github.com/markrussinovich/venn-vdm/blob/main/examples/audio/README.md
- Decisions API de Jev (TypeSafe): https://docs.typesafe.ai/introduction
- Anuncio de EmbeddingGemma 2 (Google): https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2/
