# inclusionAI/Duo-1.0-distill-quant

## Resumen

Duo-1.0-distill-quant es un conjunto de pesos cuantizados en FP8 del modelo Duo 1.0, un modelo del mundo (world model) multimodal y full-duplex orientado a la generación e interacción audio-visual en tiempo real. Lo desarrolla el equipo inclusionAI y se publica en Hugging Face bajo la licencia comunitaria Minimax H3. No es un modelo de lenguaje al uso: su propósito es modelar de forma recíproca la relación entre audio y vídeo para permitir interacción bidireccional continua, lo que lo sitúa en la categoría de modelos generativos espacio-temporales.

Este repositorio concreto no contiene el modelo completo, sino una superposición ("overlay") de pesos "Realization" destilados a cuatro pasos y cuantizados en FP8 con escalado por canal (formato ModelOpt). Requiere como dependencia el paquete `inclusionAI/Duo-1.0-causal-base`, que aporta el backbone causal, los códecs, los modelos de habla y el módulo Intent. El resultado es una variante de inferencia rápida (4 pasos con sampler Euler) pensada para despliegues de baja latencia.

La relevancia actual del modelo radica en su enfoque de full-duplex: a diferencia de los modelos generativos por turnos, Duo busca interacción audio-visual recíproca y continua, una línea de trabajo emergente en agentes conversacionales con avatar y en entornos simulados. El repositorio ocupa 47,0 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y no se dispone de información pública sobre número de parámetros, longitud de contexto ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo multimodal audio-visual full-duplex (backbone causal en `Duo-1.0-causal-base`); detalles de arquitectura no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (ModelOpt, escalado por canal); pesos destilados a 4 pasos |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (license: other) |
| Formato de pesos | safetensors (formato ModelOpt FP8); requiere overlay sobre `inclusionAI/Duo-1.0-causal-base` |
| Version | Duo 1.0 |
| Variante | FP8-quantized four-step distilled Realization |
| Sampler por defecto | Euler, 4 pasos, flow shift 5.0 |
| Dependencia base | `inclusionAI/Duo-1.0-causal-base` |
| Tamano del repo | 47,0 GB |
| Libreria | duo-world-model |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La información disponible describe Duo como un modelo del mundo multimodal full-duplex para interacción audio-visual en tiempo real, con un backbone causal ("causal-base") que se distribuye por separado. Este repositorio contiene únicamente los pesos "Realization" destilados a cuatro pasos y cuantizados en FP8 mediante ModelOpt con escalado por canal. El runtime consumidor debe soportar dicho formato o disponer de una ruta de conversión equivalente.

En cuanto al entrenamiento, la model card indica que estos pesos se inicializaron a partir de MiniMax H3 y fueron entrenados posteriormente por el equipo de Duo. No se especifican el número de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal más allá del esquema de destilación a 4 pasos y el sampler Euler con flow shift 5.0, que sí están documentados como configuración por defecto.

## Capacidades

- Generación de vídeo condicionada por audio y viceversa, en el marco de un modelo del mundo audio-visual.
- Interacción full-duplex: el modelo está diseñado para modelar de forma recíproca la relación entre flujos de audio y vídeo, no solo la generación por turnos.
- Inferencia rápida mediante destilación a 4 pasos con sampler Euler.
- Cuantización FP8 con escalado por canal para reducir requisitos de memoria y latencia.
- Módulos auxiliares de códecs y modelos de habla aportados por el paquete `causal-base`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión o audio como entrada/salida independiente: no disponible más allá de la naturaleza audio-visual del modelo.

## Casos de uso

- Avatares conversacionales en tiempo real: el modelo puede integrarse en pipelines de generación audio-visual full-duplex para producir respuestas habladas con sincronía labial y gestual, aprovechando la inferencia a 4 pasos para mantener latencias bajas.
- Simulación de entornos interactivos: al tratarse de un world model, puede emplearse para predecir la evolución de escenas audio-visuales en simuladores de entrenamiento o robótica.
- Generación de vídeo con audio sincronizado: útil en producción de contenido donde se requiere coherencia entre pista de audio y pista visual.
- Prototipado de agentes multimodales: la combinación de backbone causal, códecs y modelos de habla permite construir agentes que reaccionan a estímulos audiovisuales continuos.
- Investigación en interacción full-duplex: el modelo sirve como base para estudiar modelos recíprocos de audio y vídeo en entornos académicos.
- Despliegue en infraestructura con FP8: la cuantización ModelOpt permite servir el modelo en GPUs con soporte de FP8, reduciendo el coste por inferencia frente a la variante en precisión completa.
- Evaluación comparativa de modelos del mundo: puede utilizarse como referencia en benchmarks de generación audio-visual y coherencia temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 47,0 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos FP8 junto con el paquete `causal-base`.
- GPU recomendadas: no disponible de forma explícita; la cuantización FP8 (ModelOpt) implica GPUs con soporte de FP8, como las de las familias Hopper o posteriores.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del bundle (47,0 GB solo para este overlay) hace improbable su ejecución en GPUs de consumo sin técnicas adicionales de offloading.
- Opciones de despliegue: la librería es `duo-world-model`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Las instrucciones de integración están en el repositorio `inclusionAI/Duo`.
- Latencia y throughput estimados: no disponibles; la destilación a 4 pasos con sampler Euler y flow shift 5.0 sugiere un régimen de inferencia rápida, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos del mundo audio-visual full-duplex) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta la composición del dataset ni procesos de alineación.
- Riesgo de alucinación: no cuantificado; en modelos generativos audio-visuales existe riesgo de inconsistencias temporales entre audio y vídeo.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: la licencia `minimax-h3-community-license` es de tipo "other"; los pesos se inicializaron a partir de MiniMax H3, por lo que es imprescindible revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial.
- Dependencia obligatoria de `inclusionAI/Duo-1.0-causal-base`: este repositorio no es autónomo; sin el bundle base no puede ejecutarse.
- Requisito de runtime compatible con ModelOpt FP8 o una ruta de conversión equivalente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: escasa validación comunitaria y ausencia de reportes de uso en producción.
- No se documentan métricas de calidad, estabilidad ni comportamiento en dominios específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/Duo-1.0-distill-quant
- Paquete base: https://huggingface.co/inclusionAI/Duo-1.0-causal-base
- Colección de modelos Duo v1: https://huggingface.co/collections/inclusionAI/duo-v1
- Paper (arXiv 2611.15131): https://arxiv.org/abs/2611.15131
- Página del proyecto: https://duo-v1.github.io/
- Repositorio de código: https://github.com/inclusionAI/Duo
