# masahiroid/roberta-base-go_emotions-mlx

## Resumen

`roberta-base-go_emotions-mlx` es una conversión al runtime MLX de Apple Silicon del modelo `SamLowe/roberta-base-go_emotions`, un clasificador de emociones en inglés con 28 etiquetas en formato multi-etiqueta. El autor de la conversión es masahiroid, que publica el checkpoint con los pesos en formato safetensors y un runtime propio en Python que reproduce la implementación original de PyTorch sobre MLX. No se ha reentrenado ni ajustado el modelo: se trata de una conversión de pesos con paridad numérica verificada.

El modelo resuelve un problema acotado y bien definido: dada una frase en inglés, devuelve 28 puntuaciones sigmoideas independientes, una por emoción (admiración, diversión, enfado, ansiedad, gratitud, neutral, etc.). Al ser multi-etiqueta, varias emociones pueden activarse simultáneamente sobre el mismo texto, lo que lo hace útil para analítica de opiniones, moderación de contenido y enrutamiento de conversaciones.

Su relevancia es fundamentalmente práctica: permite ejecutar un clasificador RoBERTa base (124,7 millones de parámetros) de forma nativa en Macs con chip Apple Silicon, sin depender de PyTorch ni de CUDA, con una huella de repositorio de 0,5 GB y licencia MIT. No es un modelo generativo ni un modelo de instrucciones: es un encoder de clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa base (transformer encoder) con cabeza de clasificación multi-etiqueta de 28 salidas |
| Parametros totales | 124.667.164 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; los ejemplos de la model card truncan a 128 tokens y las exportaciones Apple usan longitud fija de 128 |
| Tipos de cuantizacion | F32 como baseline; el autor indica explícitamente que no es una cuantización de 4 bits. Existe variante GGUF en otro repositorio |
| Idiomas soportados | inglés (el autor indica clasificación de emociones en inglés; los tests incluyen una entrada en japonés solo como prueba de robustez de la conversión) |
| Licencia | MIT (pesos y términos upstream en `LICENSE`; runtime y conversor en `CODE_LICENSE` también MIT) |
| Formato de pesos | safetensors, con runtime MLX propio (`runtime_mlx.py`); variantes adicionales en Core ML, Core AI y GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es RoBERTa base, un transformer encoder de 12 capas y 768 dimensiones de representación, sobre el que se añade una cabeza lineal que proyecta la representación del token `[CLS]` a 28 logits. La activación es sigmoidea por etiqueta, no softmax, de modo que cada emoción se evalúa de forma independiente y el umbral de decisión (0,5 en el ejemplo de la model card) es configurable por el usuario. El modelo original fue entrenado por SamLowe sobre el dataset go_emotions, derivado de datos de Reddit y anotado con 28 etiquetas multi-etiqueta.

Esta conversión concreta no introduce entrenamiento nuevo ni RLHF/DPO: es una conversión de checkpoint desde la revisión `d75048347613a25d77de8cf6412eaae9fa7b26be` del modelo original. La innovación técnica está en el runtime: una implementación nativa en MLX que conserva los nombres de tensor del modelo de inferencia original y que se valida contra PyTorch en 6 casos deterministas, con una diferencia absoluta máxima de 2,98e-05 y una similitud coseno mínima de 0,9999999. El autor advierte que estas comprobaciones son de paridad de conversión, no un benchmark de calidad de tarea ni de latencia.

## Capacidades

- Clasificación multi-etiqueta de emociones en inglés con 28 categorías y puntuaciones sigmoideas independientes.
- Recuperación de texto neutro: los tests de validación incluyen casos de texto neutro, lo que permite usar el modelo como filtro de contenido sin carga emocional.
- Manejo de entradas de longitud variable hasta el límite del modelo original; las exportaciones Apple compiladas usan formas fijas de batch 1 y longitud 128.
- Ejecución nativa en Apple Silicon mediante MLX, sin dependencia de PyTorch en inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un encoder de clasificación, no un modelo causal.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada: el modelo está pensado para inglés; la prueba con japonés en la validación es una comprobación de robustez numérica, no una garantía de calidad en ese idioma.

## Casos de uso

- Análisis de sentimiento y emoción en reseñas: se envía cada reseña al modelo y se obtienen 28 puntuaciones; permite agregar por emoción dominante (por ejemplo, porcentaje de reseñas con gratitud por encima de 0,7) sin entrenar un clasificador propio.
- Moderación de contenido en foros y comentarios: las etiquetas de enfado, asco o desprecio con umbral alto sirven como señal previa para revisión humana, aprovechando que el modelo es multi-etiqueta y detecta combinaciones de emociones.
- Enrutamiento de tickets de soporte: clasificar el tono emocional de un ticket (frustración, ansiedad, gratitud) para priorizar colas o asignar agentes, con la ventaja de que el modelo cabe en un Mac y no requiere GPU dedicada.
- Analítica de conversaciones de atención al cliente: procesar transcripciones por turnos y calcular la evolución emocional de la conversación, usando el modelo como componente de un pipeline por lotes.
- Investigación en psicología computacional y análisis de discurso: anotar corpus de Reddit o de redes sociales con 28 dimensiones emocionales de forma reproducible y local, sin enviar datos a servicios externos.
- Filtro de neutralidad en datasets: identificar textos sin carga emocional (etiqueta neutral alta y resto bajas) para separar contenido informativo de contenido emocional antes de otros procesos de limpieza.
- Prototipado en dispositivos Apple: integrar el clasificador en una app de macOS o iOS mediante la variante Core ML del mismo autor, usando MLX para desarrollo y Core ML para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de paridad de conversión (diferencia absoluta máxima de 2,98e-05 y similitud coseno mínima de 0,9999999 frente a PyTorch en 6 casos deterministas), que no constituyen una evaluación de calidad de clasificación ni de latencia. No se dispone de cifras de precisión, recall o F1 sobre go_emotions para esta conversión.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 124,7 millones de parámetros en F32, los pesos ocupan aproximadamente 0,5 GB; en memoria unificada de Apple Silicon el requisito es del orden de 1 GB incluyendo tokenizador y overhead del runtime.
- GPU recomendadas: el runtime incluido requiere un Mac con Apple Silicon (serie M1, M2, M3, M4); no está pensado para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip Apple Silicon; también en GPUs consumer con suficiente memoria si se usa la variante GGUF con llama.cpp en lugar del runtime MLX.
- Opciones de despliegue: MLX con el runtime propio del repositorio; variante Core ML para integración en apps Apple; variante Core AI; variante GGUF para llama.cpp y ecosistema compatible.
- Latencia y throughput: no disponibles; el autor no publica benchmarks de latencia y advierte que la validación numérica no lo es.
- Entorno probado: PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, NumPy 1.26.4, coremltools 9.0, GGUF 0.19.0; el autor no garantiza compatibilidad fuera de ese entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| masahiroid/roberta-base-go_emotions-mlx | 124,7 M | hasta el límite del original; exportaciones Apple a 128 | Clasificación multi-etiqueta de 28 emociones | MIT | safetensors + runtime MLX |
| SamLowe/roberta-base-go_emotions | 124,7 M | el del modelo original | Clasificación multi-etiqueta de 28 emociones | MIT | safetensors PyTorch |
| thiagohersan/roberta-base-go_emotions | no disponible | no disponible | Clasificación multi-etiqueta de 28 emociones | no disponible | no disponible |
| MicahB/roberta-base-go_emotions | no disponible | no disponible | Clasificación multi-etiqueta de 28 emociones | no disponible | no disponible |

Las tres alternativas son derivados del mismo modelo base y del mismo dataset go_emotions; la diferencia principal de esta ficha es el runtime MLX y las variantes de exportación para el ecosistema Apple. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: el modelo original se entrenó sobre datos de Reddit, por lo que hereda los sesgos de ese corpus en cuanto a demografía, registro lingüístico y temas; esta conversión no los corrige ni los audita.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las puntuaciones sigmoideas pueden ser confiadas en exceso; el umbral de 0,5 es una elección del usuario y no un valor calibrado publicado.
- Limitaciones de contexto e idioma: el modelo está orientado a inglés y las exportaciones Apple compiladas usan longitud fija de 128 tokens con batch 1, lo que obliga a truncar o rellenar; textos más largos pierden información.
- Restricciones de licencia: pesos y runtime son MIT, pero el autor advierte que no se implica certificación de seguridad ni licencia comercial adicional; conviene revisar `LICENSE` y `CODE_LICENSE` del repositorio.
- Caveat de producción: el runtime MLX es una implementación propia del autor, no un modelo de mlx-lm, y el autor no garantiza compatibilidad fuera del entorno de versiones probado.
- Paridad numérica no equivale a calidad: las comprobaciones de conversión son 6 casos deterministas y no sustituyen una evaluación de la tarea sobre un conjunto representativo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Repositorio MLX: https://huggingface.co/masahiroid/roberta-base-go_emotions-mlx
- Variante Core ML: https://huggingface.co/masahiroid/roberta-base-go_emotions-coreml
- Variante Core AI: https://huggingface.co/masahiroid/roberta-base-go_emotions-coreai
- Variante GGUF: https://huggingface.co/masahiroid/roberta-base-go_emotions-gguf
- Modelo original: https://huggingface.co/SamLowe/roberta-base-go_emotions
- Revisión de origen de la conversión: https://huggingface.co/SamLowe/roberta-base-go_emotions/tree/d75048347613a25d77de8cf6412eaae9fa7b26be
- Derivado thiagohersan: https://huggingface.co/thiagohersan/roberta-base-go_emotions
- Derivado MicahB: https://huggingface.co/MicahB/roberta-base-go_emotions
