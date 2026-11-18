# Jundot/GLM-5.3-Flash-oQ3h-mtp

## Resumen

GLM-5.3-Flash-oQ3h-mtp es una cuantización mixta de precisión del modelo zai-org/GLM-5.3-Flash, el primer modelo nativamente multimodal de la serie GLM-5 desarrollado por Z.ai (Zhipu AI). El checkpoint, publicado por el usuario Jundot, emplea el formato oQh del motor oMLX y conserva el backbone lingüístico, el codificador visual y la cabeza de predicción multi-token (MTP) del modelo original. El modelo base es un MoE de 320B parámetros totales con 18B activos que combina atención dispersa y lineal con Manifold-Constrained Hyper-Connections.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de gran tamaño en hardware Apple Silicon mediante MLX, reduciendo el peso del checkpoint completo a 138,067 GiB con una media efectiva de 3,691 bits por peso. El formato oQh aplica una rotación de Hadamard sobre los pesos de los expertos antes de cuantizar, lo que reduce el número de escalas necesarias y permite reasignar ese ahorro a bits adicionales en las capas más sensibles.

El checkpoint está pensado para entornos oMLX 0.8.0 o superior con soporte de oQh; versiones anteriores no pueden cargarlo. Su licencia MIT, heredada del modelo fuente, facilita su uso comercial, aunque la cuantización introduce degradaciones medibles frente al modelo FP8 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal con atención dispersa y lineal, Manifold-Constrained Hyper-Connections y cabeza MTP |
| Parametros totales | 321,323B lógicos en el checkpoint (50.235.632.478 en safetensors del repo); modelo base: 320B totales, 18B activos |
| Parametros activos | 18B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQh mixta: 3-bit row scale, 4-bit row scale, affine 8-bit grupo 64, affine 4-bit grupo 64, BF16 y FP32; media efectiva 3,691 bits/peso (3,646 en el backbone lingüístico) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, formato oQh) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE multimodal con 320B parámetros totales y 18B activos por token. Su arquitectura combina atención dispersa y lineal con Manifold-Constrained Hyper-Connections, e incorpora una cabeza de predicción multi-token (MTP) que permite decodificación especulativa y generación de varios tokens por paso. El checkpoint incluye tres componentes: el backbone lingüístico (313,327B parámetros lógicos, 133,004 GiB), el codificador visual (0,564B, 1,050 GiB) y la cabeza MTP (7,433B, 4,013 GiB).

La cuantización oQh parte del presupuesto de oQ3 y reasigna los bytes ahorrados al eliminar escalas por grupo hacia un bit adicional en los tensores enrutados más estrechos y sensibles. La atención, los expertos compartidos, el embedding de tokens y la cabeza de salida se mantienen en grupos afines de 8 bits; los expertos enrutados de la cabeza MTP en grupos afines de 4 bits; y el codificador visual en BF16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text) mediante codificador visual integrado.
- Generación de código, con degradación medida de KL de 0,11 frente a 0,10 del formato oQe en el nivel oQ3.
- Predicción multi-token (MTP) para decodificación especulativa y mayor throughput.
- Capacidades multilingües: los conjuntos de evaluación FLORES+ y Aya cubren 7 idiomas, aunque no se detalla la lista.
- No se dispone de información sobre soporte de tool calling, function calling ni comportamiento agéntico multi-paso.

## Casos de uso

- Inferencia multimodal local en Apple Silicon: el checkpoint de 138 GiB puede cargarse en equipos con memoria unificada elevada (por ejemplo, Mac Studio con 192 GB o más), permitiendo describir imágenes y responder preguntas sobre ellas sin conexión a servicios externos.
- Análisis de documentos con imágenes: al combinar codificador visual y contexto conversacional, el modelo puede procesar capturas, diagramas o páginas escaneadas junto a instrucciones textuales en un mismo flujo.
- Prototipado de asistentes conversacionales: la ventana de contexto del modelo base (no especificada) y la cabeza MTP permiten mantener diálogos multi-turno con latencia reducida gracias a la decodificación especulativa.
- Evaluación de cuantizaciones: investigadores pueden comparar la calidad de oQh frente a oQe usando las métricas KL publicadas sobre FLORES+, Aya y código Python, validando el impacto de la rotación de Hadamard en los expertos.
- Generación de código en entornos MLX: el modelo mantiene una KL de 0,11 en código a 3 bits, adecuada para autocompletado y generación de scripts en flujos de desarrollo sobre macOS.
- Investigación en arquitecturas MoE multimodales: la separación explícita entre backbone, codificador visual y cabeza MTP en el checkpoint facilita experimentos de ablación y análisis de sensibilidad por componente.
- Despliegue en pipelines de investigación con requisitos de licencia permisiva: la licencia MIT permite integrar el modelo en productos comerciales sin restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas de divergencia KL frente al modelo FP8 original:

| Nivel | Tamano | FLORES+ KL (oQe -> oQh) | Aya KL (oQe -> oQh) | Code KL (oQe -> oQh) |
|---|---|---|---|---|
| oQ2 | 98,6 GiB | 0,34 -> 0,24 (-28%) | 0,80 -> 0,69 (-14%) | 0,25 -> 0,19 (-24%) |
| oQ3 | 134,1 GiB | 0,13 -> 0,11 (-15%) | 0,41 -> 0,37 (-10%) | 0,10 -> 0,11 (+5%) |
| oQ4 | 169,4 GiB | 0,069 -> 0,070 (+2%) | 0,25 -> 0,25 (-1%) | 0,068 -> 0,057 (-16%) |

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint completo ocupa 138,067 GiB (148,248 GB), por lo que requiere al menos 144-160 GB de memoria disponible para cargar pesos y overhead de inferencia.
- GPU recomendadas: no aplica GPU discreta; el formato oQh está diseñado para MLX sobre Apple Silicon. Se requiere un equipo con memoria unificada de 192 GB o superior (Mac Studio M2 Ultra, M3 Ultra o configuraciones equivalentes).
- Cabe en consumer GPU: no en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.). Solo es viable en hardware Apple con memoria unificada muy alta.
- Opciones de despliegue: exclusivamente oMLX 0.8.0 o superior con soporte oQh. No es compatible con llama.cpp, vLLM, TGI ni Ollama en el formato actual.
- Latencia y throughput: no disponibles. La cabeza MTP está incluida y puede emplearse para decodificación especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-oQ3h-mtp (este) | 320B totales / 18B activos (checkpoint 321,323B lógicos) | no disponible | MIT | safetensors MLX oQh | Hugging Face, requiere oMLX 0.8.0+ |
| zai-org/GLM-5.3-Flash (base) | 320B totales / 18B activos | no disponible | MIT | safetensors FP8 | Hugging Face |
| GLM-5.3-Flash en formato oQe | 320B totales / 18B activos | no disponible | MIT | safetensors MLX oQe | Hugging Face, compatible con más motores MLX |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización a 3,691 bits/peso introduce degradación frente al modelo FP8: la KL en código empeora un 5% respecto a oQe en el nivel oQ3, y en FLORES+ y Aya la mejora es del 15% y 10% respectivamente, pero no se alcanza paridad con el original.
- Requiere oMLX 0.8.0 o superior con soporte oQh; versiones anteriores no pueden cargar el checkpoint, lo que limita la portabilidad.
- El tamaño de 138 GiB restringe el despliegue a hardware Apple Silicon de gama muy alta; no es viable en GPUs de consumo ni en la mayoría de servidores x86 sin memoria unificada.
- No se dispone de información sobre sesgos, riesgo de alucinación, longitud de contexto efectiva ni cobertura idiomática detallada del modelo base.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la calidad del checkpoint cuantizado en dominios específicos.
- El modelo está etiquetado como image-text-to-text, pero no se documentan capacidades de audio, vídeo ni tool calling; no deben asumirse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/GLM-5.3-Flash-oQ3h-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio oMLX (motor y herramienta de cuantización oQ): https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
