# mradermacher/ProactiveMobile-Qwen2.5-VL-7B-GGUF

## Resumen

ProactiveMobile-Qwen2.5-VL-7B es un modelo multimodal de 7,6 mil millones de parámetros desarrollado por Xiaomi Research (bajo el identificador xiaomi-research/ProactiveMobile-Qwen2.5-VL-7B), construido sobre la arquitectura Qwen2.5-VL. Está orientado a escenarios de agentes móviles proactivos: la idea es que el modelo no solo responda a instrucciones del usuario, sino que pueda operar como agente sobre interfaces de móvil, apoyándose en sus capacidades de visión y de function calling. La ficha original del modelo base no está disponible en la información proporcionada, por lo que algunos detalles de entrenamiento y capacidades no pueden confirmarse.

Esta ficha corresponde concretamente a la versión cuantizada en formato GGUF publicada por mradermacher, un cuantizador conocido por generar conversiones estáticas de modelos populares para su uso en llama.cpp y herramientas derivadas. El repositorio incluye cuantizaciones desde Q2_K (3,1 GB) hasta f16 (15,3 GB), además de los archivos mmproj (suplemento multimodal) necesarios para usar las capacidades de visión. La relevancia de este modelo radica en la creciente categoría de agentes móviles que combinan visión, decisión y ejecución de acciones, un área donde Xiaomi ha estado activa recientemente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal, no disponible el detalle exacto) |
| Parámetros totales | 7.615.616.512 (7,6 B, dato de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj-Q8_0 y mmproj-f16 para la parte multimodal) |
| Idiomas soportados | zh (chino, según los metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); el modelo base está en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base es una variante de Qwen2.5-VL de 7B, una familia de modelos transformer multimodales de Alibaba que integra un codificador de visión (ViT) con un LLM decoder, lo que permite procesar imágenes y texto en la misma ventana de contexto. Sobre esa base, Xiaomi Research ha entrenado una versión especializada en comportamiento de agente proactivo en móvil, etiquetada con las categorías proactive-agent, mobile-agent y function-calling, lo que sugiere un entrenamiento orientado a interpretar capturas de pantalla, planificar acciones y emitir llamadas a funciones.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre el uso de técnicas como RLHF o DPO, ya que la model card del modelo base no está incluida en la información proporcionada. La versión aquí descrita es una cuantización estática en GGUF realizada por mradermacher; en el momento de publicación no hay disponibles cuantizaciones weighted/imatrix por parte de este autor.

## Capacidades

- Comprensión multimodal: gracias a su base Qwen2.5-VL y a los archivos mmproj incluidos, puede procesar imágenes junto con texto (relevante para interpretar pantallas de móvil).
- Function calling: el modelo está etiquetado explícitamente con esta capacidad, lo que lo hace apto para pipelines de agentes que ejecutan acciones.
- Agentes móviles: diseñado para escenarios de mobile-agent, es decir, operar sobre interfaces de dispositivo móvil de forma proactiva.
- Comportamiento proactivo: según las etiquetas, el modelo está orientado a iniciar acciones sin esperar instrucciones explícitas del usuario en cada paso.
- Generación de texto conversacional: etiquetado como conversational, apto para diálogos multi-turno.
- Idioma: los metadatos indican chino (zh) como idioma; no consta soporte oficial para otros idiomas, aunque la familia Qwen2.5 suele tener cobertura multilingüe amplia (dato no confirmado para esta variante).

## Casos de uso

- Agentes de automatización de móvil: el modelo puede recibir capturas de pantalla del dispositivo, interpretar la interfaz y emitir function calls para tocar, escribir o navegar, automatizando tareas repetitivas del usuario.
- Asistentes proactivos en dispositivo o en la nube: su diseño proactive-agent lo hace adecuado para asistentes que anticipan necesidades (por ejemplo, sugerir enviar un mensaje al detectar contexto relevante).
- Testing automatizado de apps: integrado en pipelines de QA, puede navegar por una aplicación como lo haría un usuario, detectando fallos visuales o de flujo mediante sus capacidades de visión.
- RPA sobre interfaces gráficas: para procesos que solo tienen interfaz de usuario (sin API), el modelo puede actuar como ejecutor de tareas combinando visión y function calling.
- Chatbots multimodales en chino: apto para asistentes conversacionales que necesiten entender imágenes enviadas por el usuario, ejecutándose localmente gracias a las cuantizaciones ligeras.
- Prototipado de agentes locales: las cuantizaciones Q4 (4,6-4,8 GB) permiten experimentar con agentes móviles en GPUs de consumo o incluso en equipos sin GPU dedicada, sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin el suplemento multimodal):
  - Q2_K: ~3,1 GB; Q3_K_M: ~3,9 GB; Q4_K_M: ~4,8 GB; Q5_K_M: ~5,5 GB; Q6_K: ~6,4 GB; Q8_0: ~8,2 GB; f16: ~15,3 GB.
  - Añadir ~1,0-1,5 GB si se cargan los archivos mmproj para visión.
- GPUs recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070) ejecuta cómodamente las cuantizaciones Q4-Q6; para f16 conviene una RTX 4090 (24 GB) o similar.
- Cabe en consumer GPU: sí, la cuantización Q4_K_M (4,8 GB + mmproj) cabe en GPUs de 8 GB e incluso puede ejecutarse parcialmente en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF y mmproj. No es una versión orientada a vLLM o TGI (para eso conviene el modelo base en safetensors).
- Latencia y throughput: no disponible; en GPUs de consumo con Q4_K_M cabe esperar decodificación en el rango típico de modelos 7B (decenas de tokens por segundo), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ProactiveMobile-Qwen2.5-VL-7B (esta ficha) | 7,6 B | Sí (mmproj incluido) | GGUF | Apache 2.0 | Especializado en agente móvil proactivo y function calling |
| Qwen2.5-VL-7B-Instruct (base) | 7,6 B | Sí | safetensors / GGUF (terceros) | Apache 2.0 | Modelo generalista multimodal sin especialización en agentes móviles |
| UI-TARS-7B (ByteDance) | 7 B | Sí | safetensors / GGUF (terceros) | no disponible aquí | Alternativa conocida en la categoría de agentes de interfaz gráfica |

La comparativa se limita a los datos verificables de esta ficha; no se dispone de benchmarks que permitan comparar rendimiento entre estos modelos.

## Limitaciones y advertencias

- Idioma: los metadatos solo declaran chino (zh); el comportamiento en castellano u otros idiomas no está documentado y puede ser inconsistente.
- Alucinaciones: como todo modelo de 7B, puede generar acciones o interpretaciones de pantalla incorrectas; en un agente que ejecuta acciones reales en un móvil esto supone un riesgo operativo (toques erróneos, envíos accidentales), por lo que se recomienda supervisión humana o modos de confirmación.
- Cuantización agresiva: las variantes Q2_K y Q3_K degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- Cuantizaciones imatrix: no disponibles en el momento de publicación de este repositorio.
- Contexto: la longitud de ventana no está documentada en la información disponible; verificarla antes de diseñar flujos con muchas capturas de pantalla acumuladas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar también los términos del modelo base de Xiaomi Research y de Qwen2.5-VL.
- Procedencia de la cuantización: esta versión es una conversión de terceros (mradermacher); cualquier problema de conversión debe atribuirse al cuantizador, no al autor original.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/ProactiveMobile-Qwen2.5-VL-7B-GGUF
- Modelo base: https://huggingface.co/xiaomi-research/ProactiveMobile-Qwen2.5-VL-7B
- Página de descargas del cuantizador: https://hf.tst.eu/model#ProactiveMobile-Qwen2.5-VL-7B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
