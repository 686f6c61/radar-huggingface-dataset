# mradermacher/decider-2b-vision-GGUF

## Resumen

decider-2b-vision es un modelo de decisión multimodal de aproximadamente 1.880 millones de parámetros (1.881.825.088 según los pesos en safetensors), desarrollado por Mapika y distribuido en formato GGUF por mradermacher. Su propósito declarado es la toma de decisiones calibrada con salida estructurada en una sola pasada (one-pass), es decir, producir decisiones o clasificaciones con puntuaciones de confianza en lugar de texto libre generativo. Combina capacidad de visión con un pipeline de transformers y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha reside en que el repositorio original es un modelo base poco documentado: no se han publicado detalles sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Lo que sí está disponible con rigor es la información de cuantización, que es el valor principal de esta distribución de mradermacher: trece variantes GGUF estáticas más dos ficheros mmproj para el componente multimodal, con tamaños que van de 1,1 GB (Q2_K) a 3,9 GB (f16), lo que lo hace desplegable en hardware de consumo.

El modelo está etiquetado como decision-model, calibrated, structured-output, vision y one-pass, y solo declara soporte de inglés. Con 509 descargas y 3 likes en el momento de la consulta, es un modelo de nicho orientado a tareas de clasificación o enrutamiento con entrada de imagen y texto, no a generación abierta de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; modelo multimodal con componente de visión, sin detalles de capas ni atención publicados) |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base Mapika/decider-2b-vision: la model card distribuida por mradermacher es una plantilla de cuantización y no detalla número de capas, tipo de atención, dimensión oculta ni el codificador visual empleado. Los tags indican que se trata de un modelo multimodal (vision) con salida estructurada y calibrada, diseñado para resolver una decisión en una sola pasada (one-pass), lo que sugiere una cabeza de clasificación o un formato de salida restringido más que generación autoregresiva libre, aunque esto no se confirma en la documentación disponible.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La contribución técnica verificable de este repositorio es exclusivamente la cuantización: mradermacher ha generado cuantizaciones estáticas (sin imatrix ni ponderadas, según indica explícitamente) en formatos K-quant e IQ, además de los ficheros mmproj necesarios para el proyector multimodal en llama.cpp.

## Capacidades

- Procesamiento multimodal: acepta entrada de imagen junto con texto, según el tag vision y la presencia de ficheros mmproj.
- Toma de decisiones calibrada: orientado a producir decisiones con puntuaciones de confianza, según los tags calibrated y decision-model.
- Salida estructurada: diseñado para generar respuestas en formato restringido o parseable, según el tag structured-output.
- Inferencia en una sola pasada: el tag one-pass indica que la decisión se resuelve sin cadenas de razonamiento multi-paso.
- Conversacional: el repositorio está marcado como conversational y compatible con endpoints.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseño one-pass sugiere lo contrario.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales adicionales (thinking mode, audio): no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte con captura de pantalla: el modelo puede recibir una imagen del error junto con el texto del usuario y emitir una decisión estructurada (categoría, prioridad, confianza), lo que encaja con su diseño one-pass y calibrado.
- Moderación de contenido visual en pipelines de subida: clasificar imágenes con una etiqueta y un score de confianza en una sola llamada, sin generación de texto libre, reduciendo latencia y coste por petición.
- Verificación de documentos en onboarding: dado un DNI o una factura escaneada, decidir si cumple los criterios requeridos y devolver un veredicto estructurado con confianza asociada.
- Control de calidad en líneas de producción: inspección visual automatizada donde la salida debe ser una decisión binaria o multiclase calibrada, desplegable en GPU de consumo gracias a las cuantizaciones de 1,1 a 1,5 GB.
- Clasificación de imágenes en aplicaciones de escritorio o edge: con Q4_K_M (1,4 GB) el modelo cabe en GPUs de 4-6 GB de VRAM o incluso en CPU vía llama.cpp, lo que permite integrarlo en herramientas locales sin conexión.
- Pre-filtrado en sistemas RAG multimodales: decidir si una imagen aporta información relevante antes de invocar un modelo mayor, actuando como clasificador barato que reduce el coste del pipeline.
- Evaluación de formularios y encuestas con evidencia visual: decidir si una respuesta cumple los requisitos y registrar la confianza para revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q2_K, 1,3-1,4 GB con Q4_K_S/Q4_K_M, 1,7 GB con Q6_K y 2,1 GB con Q8_0; el f16 requiere unos 3,9 GB. Hay que sumar el proyector multimodal: 0,5 GB con mmproj-Q8_0 o 0,8 GB con mmproj-f16.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para las cuantizaciones Q4/Q5; una RTX 3060, RTX 4060, RTX 4090 o A100 pueden ejecutarlo con holgura, aunque en estas últimas el modelo estará infrautilizado.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas tarjetas de gama baja con 4-6 GB; también es viable en CPU con llama.cpp dado el reducido tamaño.
- Opciones de despliegue: llama.cpp y cualquier frontend compatible con GGUF (Ollama, LM Studio, llama-cpp-python); el tag endpoints_compatible sugiere compatibilidad con servidores de inferencia tipo endpoint, aunque no se detalla cuáles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa fiable. A nivel de categoría, las alternativas habituales para clasificación multimodal de pequeño tamaño son modelos como CLIP/SigLIP (visión-lenguaje, sin salida conversacional), Qwen2-VL-2B (generativo multimodal, licencia Apache 2.0) o PaliGemma-3B (visión-lenguaje de Google, licencia Gemma). La comparación se limita a parámetros y licencia, ya que no hay benchmarks publicados de decider-2b-vision.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| decider-2b-vision | ~1,88 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen2-VL-2B | ~2 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF |
| PaliGemma-3B | ~3 B | no disponible en esta ficha | Gemma | safetensors |

## Limitaciones y advertencias

- Documentación muy escasa: no hay información publicada sobre arquitectura, contexto, datos de entrenamiento ni evaluación, lo que impide estimar su calidad real frente a alternativas.
- Solo inglés: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en productos en español requeriría validación empírica.
- Riesgo de alucinación y calibración no verificada: aunque el modelo se etiqueta como calibrado, no se han publicado métricas de calibración (ECE, Brier score) que lo respalden.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos demográficos, culturales o visuales.
- Contexto limitado o desconocido: la ausencia de longitud de contexto publicada impide garantizar conversaciones multi-turno largas o documentos extensos.
- Cuantizaciones estáticas sin imatrix: el autor indica que no ha generado cuantizaciones ponderadas, por lo que las variantes de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad más de lo habitual.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene conservar los avisos de copyright y verificar la licencia del modelo base original.
- Para producción: se recomienda evaluar con un conjunto propio antes de desplegar, dado que no existen benchmarks públicos de referencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/decider-2b-vision-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-2b-vision
- Página de descargas del autor: https://hf.tst.eu/model#decider-2b-vision-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
