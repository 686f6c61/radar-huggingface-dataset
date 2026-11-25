# Remek/basal-2.0-mini-MLX-8bit

## Resumen

basal-2.0-mini-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo basal-2.0-mini, un modelo de 1.596.507.648 parámetros afinado por Remigiusz Kinas (Remek) a partir de speakleash/Bielik-1.5B-v3.0-Instruct. No es un modelo conversacional al uso: está especializado en "decisiones tipadas" (typed decisions), es decir, responder con una opción concreta de un conjunto cerrado de etiquetas, con un margen de confianza calibrado y un umbral de error controlable. El objetivo es sustituir reglas heurísticas y clasificadores ad hoc en flujos de decisión en producción, con la posibilidad de abstenerse cuando la confianza no alcanza el umbral solicitado.

Este paquete concreto contiene únicamente los pesos MLX de 8 bits para Apple Silicon (1,7 GB) más los ficheros de calibración del motor. El modelo base mantiene una ventana de contexto de 8.192 tokens en la variante mini, soporta hasta 255 opciones por pregunta (20 en el backend Ollama) y está entrenado para polaco e inglés. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual está en el nicho de modelos pequeños, desplegables en local, que ofrecen una API de decisión estructurada con calibración explícita (ECE medido, agreement frente a bf16 documentado) en lugar de generación libre. Es una pieza de infraestructura para pipelines de clasificación y enrutamiento, no un asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Bielik-1.5B-v3.0-Instruct); pesos en formato MLX |
| Parametros totales | 1.596.507.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (variante mini; la familia 2.0 completa llega a 32.768) |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base ofrece además FP8, GGUF Q8_0 y GGUF Q5_K_M |
| Idiomas soportados | pl, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx); existen variantes GGUF y FP8 en la misma colección |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de aproximadamente 1,6 mil millones de parámetros, obtenido por fine-tuning de speakleash/Bielik-1.5B-v3.0-Instruct (proyecto de SpeakLeash y ACK Cyfronet AGH, licencia Apache-2.0). Sobre esa base, el autor ha entrenado una capa de comportamiento orientada a decisiones tipadas: el modelo recibe un estado y una pregunta con un conjunto de opciones, y devuelve la opción elegida junto con información de confianza que el motor basal explota para aplicar umbrales de error.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. La innovación técnica destacable no está en la arquitectura del transformer, sino en el sistema que lo rodea: el motor basal (v2.0.0) define una API de decisiones tipadas, ficheros de calibración por motor (CALIBRATION.json y CALIBRATION.mlx.json) y herramientas como basal-calibrate para ajustar umbrales sobre datos propios. Este paquete MLX incluye una calibración ajustada específicamente sobre las lecturas de esta cuantización, con ECE en dev v2 de 0,0337 in-sample y 0,0375 en validación leave-one-family-out, frente a 0,0357 usando la calibración bf16.

## Capacidades

- Decisiones tipadas: selección de una opción entre 2 y 255 candidatas por pregunta (20 en el backend Ollama), con margen de confianza asociado.
- Clasificación con calibración: el motor aplica umbrales de error máximo (max_error) y puede diferir la decisión cuando la confianza no es suficiente.
- Modos de decisión act y tool, además del modo multi para preguntas con muchas etiquetas (marcados como experimentales).
- Generación de texto y comportamiento conversacional heredados del modelo base Bielik-1.5B-v3.0-Instruct.
- Soporte bilingüe polaco e inglés.
- Integración con un motor de inferencia propio (basal-serve) con API HTTP en el puerto configurable.
- Modo "facts": "auto" para delegar cálculos aritméticos o umbrales exactos a código en lugar de resolverlos en un solo paso.
- No incluye cabeza de evidencias (evidence head) en la familia 2.0.
- No dispone de capacidades de visión ni audio en esta variante (el motor sí sirve los modelos experimentales basal-omni-1.0 para imágenes y audio).

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada incidencia entrante en una categoría cerrada (facturación, incidencia técnica, cancelación, etc.) con umbral de error configurable; si la confianza no alcanza, el ticket se deriva a revisión humana en lugar de asignarse mal.
- Clasificación documental en pipelines de back office: etiquetar documentos polacos o ingleses en un conjunto fijo de tipos, con la calibración ajustada sobre las lecturas reales de esta cuantización para que los umbrales sean representativos del despliegue.
- Extracción de decisiones en formularios y flujos administrativos: dado un estado con los datos relevantes, elegir la acción siguiente entre opciones predefinidas, manteniendo los hechos en el estado para compensar el conocimiento limitado de un modelo de 1,5B.
- Moderación o triaje de contenido con abstención: usar el modo de decisión con max_error para que el modelo solo emita veredictos cuando la calibración lo respalde, y derive el resto a un modelo mayor o a revisión manual.
- Despliegue local en portátiles Apple Silicon: con 1,7 GB de pesos y 93 ms de latencia p50 en una sola consulta (Apple M4 Pro, 24 GB), es viable ejecutar el modelo en el propio equipo del analista sin enviar datos a la nube.
- Automatización de herramientas y agentes simples: el modo tool permite que el modelo elija qué herramienta invocar de un catálogo cerrado, con la ventaja de que el motor puede rechazar la llamada si la confianza es baja.
- Evaluación comparativa de cuantizaciones: el paquete documenta agreement frente a bf16 (0,9792 en opciones 2-10 y 1,0000 con margen >= 0,2), lo que lo hace útil como referencia para validar que una cuantización no degrada el comportamiento de decisión antes de pasar a producción.

## Benchmarks y rendimiento

Los datos publicados en la información disponible son comprobaciones de la cuantización frente al modelo bf16, no benchmarks del modelo base. Se presentan a continuación:

| Metrica | MLX 8-bit | FP8 | GGUF Q8_0 | GGUF Q5_K_M |
|---|---|---|---|---|
| Agreement con bf16 (opciones 2-10) | 0,9792 | 0,9333 | 0,9769 | 0,9339 |
| Agreement con bf16 (margen >= 0,2) | 1,0000 | 0,9937 | 1,0000 | 0,9931 |
| Diferencia de accuracy | -0,0025 | -0,0077 | -0,0004 | -0,0006 |
| Diferencia de ECE | +0,0024 | -0,0032 | -0,0019 | -0,0016 |
| Tamano | 1,7 GB | 1,8 GB | 1,6 GB | 1,1 GB |
| Velocidad | 93 ms c1 p50; 223 ms para 5 preguntas (Mac) | 103,5 dec/s c16, c1 p50 14 ms (H100) | no medida | no medida |
| Gate | PASS | PASS | PASS | PASS |

Los umbrales de aceptación de esta categoría son: agreement 2-10 >= 0,9161, agreement con margen >= 0,2 >= 0,9858, accuracy dentro de 1 punto de bf16 y ECE como máximo +0,01. Las cifras de Werdykt, JDI, LEK, PL-Holdout y PL-Real del modelo base no se reproducen aquí; están publicadas en la model card de basal-2.0-mini y este port no se puntúa por separado en ellas.

## Requisitos de hardware

- VRAM/unificada: 1,7 GB de pesos; en Apple Silicon la memoria es unificada y el modelo cabe holgadamente en equipos de 16 GB o más. Para el modelo base en bf16 se necesita aproximadamente el doble.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra) por el backend MLX; en CUDA, la variante FP8 está medida en H100 (103,5 decisiones/s con concurrencia 16, 14 ms p50 con concurrencia 1).
- GPU de consumo: sí cabe en cualquier Mac con Apple Silicon; en el lado NVIDIA, la variante GGUF Q5_K_M (1,1 GB) es la más ligera para GPUs de consumo.
- Despliegue: basal-serve con --mode mlx (motor propio, instalable vía pip desde el tag v2.8.1 del repositorio), además de las variantes GGUF para llama.cpp/Ollama y FP8 para vLLM u otros servidores compatibles.
- Latencia medida: 93 ms p50 con concurrencia 1 y 223 ms para 5 preguntas en un Apple M4 Pro de 24 GB.
- Requisito de entorno: Python nativo arm64 (cpython-3.12-macos-aarch64-none); si el entorno se creó bajo Rosetta hay que recrearlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-2.0-mini-MLX-8bit | 1,6B | 8.192 | Decisiones tipadas calibradas, pl/en | Apache-2.0 | Hugging Face, MLX |
| speakleash/Bielik-1.5B-v3.0-Instruct | ~1,5B | no disponible en la informacion | Instrucciones generales, pl/en | Apache-2.0 | Hugging Face |
| basal-2.0-mini (bf16) | 1,6B | 8.192 | Decisiones tipadas calibradas, referencia del port | Apache-2.0 | Hugging Face |
| basal-1.5 | no disponible en la informacion | no disponible en la informacion | Generacion anterior de decisiones tipadas | no disponible en la informacion | Hugging Face, Ollama |

La comparación con modelos generalistas del mismo tamaño (por ejemplo, familias de 1-2B orientadas a chat) no está cubierta con datos en la información disponible; la diferencia funcional principal es que basal expone una API de decisión con umbrales de error calibrados, mientras que un instruct general no ofrece esa garantía.

## Limitaciones y advertencias

- Hay que validar sobre documentos propios antes de confiar en el modelo: los conjuntos ocultos y de validación no cubren todos los dominios.
- El conocimiento del mundo en polaco de un modelo de 1,5B es limitado; los hechos relevantes deben colocarse en el estado de la decisión. Las reglas legales cambian con el tiempo.
- La aritmética exacta y los umbrales son un punto débil de las decisiones en un solo paso; conviene calcularlos en código o usar "facts": "auto".
- La calibración es cauta con tareas no vistas: ningún umbral del 1% está certificado en los ficheros incluidos, por lo que max_error = 0,01 hace que toda decisión se difiera; usar 0,05 o certificar umbrales con basal-calibrate sobre datos propios.
- Los modos act y multi con muchas etiquetas son experimentales; el límite es de 255 opciones por pregunta (20 en Ollama).
- La familia 2.0 no incluye cabeza de evidencias.
- Las decisiones con consecuencias serias para personas deben revisarse por una persona.
- El contexto está limitado a 8.192 tokens en la variante mini.
- Solo se soportan polaco e inglés; el rendimiento en castellano no está documentado.
- La calibración bf16 no se traslada exactamente a puertos cuantizados: una prueba externa de basal-1.5 en Ollama observó un 2,3% de error real con umbral del 1%; este paquete incluye una calibración específica para MLX, pero donde se use la de bf16 los umbrales deben tratarse como aproximados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-2.0-mini-MLX-8bit
- Modelo base (bf16): https://huggingface.co/Remek/basal-2.0-mini
- Colección basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Variante FP8: https://huggingface.co/Remek/basal-2.0-mini-FP8
- Variante GGUF: https://huggingface.co/Remek/basal-2.0-mini-GGUF
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Documentación de imágenes y audio (basal-omni): https://github.com/rkinas/basal#images-and-audio-basal-omni-experimental
- Sitio web del proyecto: https://basal.si5.pl/
- Modelo base original: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
