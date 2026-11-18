# argmaxinc/qwenasrkit-pro

## Resumen
QwenASRKit Pro es un paquete de modelos de reconocimiento automático del habla (ASR) desarrollado por Argmax, Inc., que adapta los modelos Qwen3-ASR para su ejecución local sobre Apple Silicon mediante Core ML y la librería WhisperKit. El objetivo es llevar transcripción de voz de alta calidad a dispositivos Apple (iPhone, iPad y Mac) sin depender de servicios en la nube, combinando la capacidad multilingüe de la familia Qwen3-ASR con optimizaciones de cuantización y compresión propias de WhisperKit.

Los pesos se distribuyen en formato Core ML cuantizado y comprimido, con un repositorio de aproximadamente 4,6 GB. El modelo está pensado para desarrolladores que integran transcripción on-device en aplicaciones nativas de Apple y que necesitan privacidad de datos, baja latencia y funcionamiento offline.

La relevancia actual radica en la creciente demanda de ASR local en movilidad y en la maduración de Core ML como runtime de inferencia eficiente en el ecosistema Apple. No obstante, el acceso está condicionado: los modelos solo funcionan con Argmax Pro SDK y requieren aceptar una licencia específica (argmax-fmod-license) tras un formulario de acceso restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3-ASR; pesos en Core ML) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizado y comprimido (detalle de bits no disponible) |
| Idiomas soportados | no disponible |
| Licencia | argmax-fmod-license (acceso restringido, uso condicionado al Argmax Pro SDK) |
| Formato de pesos | Core ML (repo de 4,6 GB; compatible con WhisperKit) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo base Qwen3-ASR ni los datos de entrenamiento empleados. Lo que sí se documenta es la capa de adaptación: los pesos se convierten a Core ML, se cuantizan y comprimen para reducir el consumo de memoria y acelerar la inferencia en Apple Silicon, y se empaquetan para su consumo mediante WhisperKit. No se especifican número de tokens de entrenamiento, composición del dataset ni si hubo etapas de RLHF o DPO.

Tampoco se detallan innovaciones técnicas como decodificación especulativa o mecanismos de atención lineal. La contribución principal de Argmax parece ser la ingeniería de despliegue (conversión, compresión y runtime) más que el entrenamiento del modelo base.

## Capacidades
- Reconocimiento automático del habla (transcripción de audio a texto) como tarea principal, según la pipeline declarada `automatic-speech-recognition`.
- Ejecución local y on-device en hardware Apple Silicon, sin envío de audio a servidores externos.
- Inferencia optimizada mediante cuantización y compresión para reducir huella de memoria.
- Integración con WhisperKit como librería de despliegue.
- Capacidades multilingües: no confirmadas en la información disponible, aunque el modelo base Qwen3-ASR suele ser multilingüe; no se puede afirmar para esta variante.
- Tool calling, function calling, agentes, visión, audio bidireccional o modo de razonamiento explícito: no disponible.

## Casos de uso
- Transcripción de notas de voz en apps de iOS y macOS: el modelo se ejecuta on-device vía Core ML, permitiendo convertir grabaciones en texto sin subir audio a la nube y preservando la privacidad del usuario.
- Subtitulado local de reuniones y clases: con WhisperKit como runtime, se puede procesar audio en tiempo real o por lotes en un Mac, útil para entornos con requisitos de confidencialidad.
- Dictado en aplicaciones de productividad: la latencia baja propia de la inferencia local encaja con interfaces de dictado que necesitan respuesta casi inmediata.
- Accesibilidad: transcripción de conversaciones para personas con discapacidad auditiva en dispositivos Apple, funcionando offline.
- Indexación y búsqueda de archivos de audio: procesar grandes volúmenes de grabaciones en un Mac para generar transcripciones indexables, aprovechando el formato comprimido para reducir uso de memoria.
- Prototipado de pipelines ASR en investigación: al ser un paquete WhisperKit, permite comparar variantes cuantizadas frente a modelos completos en un entorno controlado de Apple Silicon.
- Integración en apps empresariales internas: al requerir Argmax Pro SDK, encaja en proyectos con presupuesto de licencia y necesidades de soporte comercial.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM: no aplica en sentido estricto; en Apple Silicon se comparte memoria unificada. El repo ocupa 4,6 GB, lo que da una cota superior orientativa del espacio necesario para cargar los pesos comprimidos.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) y chips A-series recientes en iPhone/iPad, dado que el runtime es Core ML.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que está orientado a Core ML.
- Cabe en hardware de consumo Apple: sí, previsiblemente en Mac con memoria unificada de 8 GB o más, aunque no se confirma en la documentación.
- Opciones de despliegue: WhisperKit y Argmax Pro SDK; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| QwenASRKit Pro (este) | no disponible | no disponible | argmax-fmod-license (restringida) | Core ML | On-device Apple, requiere Argmax Pro SDK |
| Whisper large-v3 (OpenAI) | ~1550 M | ~30 s de audio por ventana | MIT | safetensors, GGUF, Core ML | Referencia ASR multilingüe, amplio ecosistema |
| Parakeet (NVIDIA) | no disponible | no disponible | CC-BY-4.0 (variantes) | NeMo, ONNX | ASR rápido en GPU NVIDIA, no orientado a Apple |
| Qwen3-ASR (base) | no disponible | no disponible | según variante | safetensors | Modelo origen del que deriva este paquete |

La comparación de rendimiento no está disponible al no publicarse benchmarks para QwenASRKit Pro.

## Limitaciones y advertencias
- Licencia restringida: `argmax-fmod-license` con acceso condicionado (gated) y uso limitado al Argmax Pro SDK; revisar LICENSE_NOTICE antes de cualquier uso comercial.
- Dependencia de proveedor: los modelos solo funcionan con Argmax Pro SDK, lo que introduce acoplamiento tecnológico y posible coste de suscripción.
- Compatibilidad limitada: orientado exclusivamente a Apple Silicon y Core ML; no utilizable en GPUs NVIDIA ni en servidores Linux convencionales.
- Idiomas no documentados: no se confirma qué lenguas cubre esta variante, por lo que no se debe asumir cobertura multilingüe.
- Riesgo de alucinación en ASR: como todo modelo de transcripción, puede generar texto plausible en segmentos con ruido, solapamiento de hablantes o audio de baja calidad.
- Sesgos: no documentados; el modelo base puede heredar sesgos acústicos y léxicos de sus datos de entrenamiento.
- Falta de transparencia técnica: sin número de parámetros, contexto ni datos de entrenamiento publicados, la evaluación independiente es difícil.
- Producción: verificar latencia real y consumo de memoria en el dispositivo objetivo antes de desplegar, dado que no hay cifras oficiales.

## Enlaces
- Hugging Face: https://huggingface.co/argmaxinc/qwenasrkit-pro
- Licencia (LICENSE_NOTICE.txt): https://huggingface.co/argmaxinc/qwenasrkit-pro/blob/main/LICENSE_NOTICE.txt
- Argmax SDK: https://www.argmaxinc.com/#SDK
- Registro Argmax Pro SDK: https://app.argmaxinc.com
