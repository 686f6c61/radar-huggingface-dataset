# Askit87/Fortera

## Resumen
Fortera es un modelo de lenguaje especializado en la comprensión de comandos para robótica de drones, publicado por AskIt AI (versión 0.1.0). Se construye como un ajuste fino supervisado mediante LoRA sobre Qwen/Qwen3-1.7B, con el objetivo de traducir instrucciones de operador en lenguaje natural a propuestas de acciones estructuradas en JSON, dentro de un vocabulario de acciones restringido. El modelo está pensado para ejecutarse localmente en ordenadores de a bordo (companion computers) basados en ARM64, como una Raspberry Pi 5, usando llama.cpp sobre GGUF.

La propuesta separa deliberadamente la comprensión del lenguaje del control de vuelo: el modelo solo emite propuestas de acción que deben pasar por una capa determinista de validación y política. No envía comandos MAVLink ni MAVSDK y se distribuye con `dispatch_enabled: false`. Es un prototipo de investigación, no un piloto automático ni un sistema certificado.

Con 1.720.574.976 parámetros, soporte para inglés, ruso, árabe y alemán, y licencia Apache 2.0, Fortera resulta relevante para quienes investigan interfaces de lenguaje natural en robótica de borde, inferencia local en hardware limitado y generación de salidas estructuradas con validación posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (~1,03-1,05 GiB); pesos Safetensors en el repo |
| Idiomas soportados | en, ru, ar, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento
Fortera parte de la arquitectura transformer decoder-only de Qwen3-1.7B. La adaptación consiste en un ajuste fino supervisado con LoRA de rango 16, alpha 32 y dropout 0,05, entrenado durante 3 épocas con el mejor checkpoint del adaptador en el paso 100. El adaptador se fusiona (merge) en los pesos base, por lo que el modelo distribuido es un derivado directo de Qwen3-1.7B sin adaptadores separados.

El conjunto de entrenamiento es pequeño y totalmente sintético: 504 ejemplos generados por plantillas, divididos en 396 de entrenamiento y 108 de validación reservada. Los datos cubren cuatro idiomas (126 ejemplos por idioma: inglés, ruso, árabe y alemán) y dos modos (296 de hardware y 208 de simulador). Las clases de intención incluyen despegue, navegación a waypoint, peticiones multi-paso, hold/hover, datos de obstáculo obsoletos, obstáculos demasiado cercanos y rutas bloqueadas. No se emplearon telemetría de vuelo real ni datos externos. No se documenta RLHF ni DPO; el único proceso de alineación es el ajuste supervisado descrito.

## Capacidades
- Comprensión de comandos de operador en inglés, ruso, árabe y alemán.
- Generación de propuestas de acción en JSON estructurado dentro de un vocabulario de acciones restringido.
- Manejo de intenciones como despegue, navegación a waypoint, peticiones multi-paso, hold/hover, datos de obstáculo obsoletos, obstáculos cercanos y rutas bloqueadas.
- Soporte de inferencia local mediante llama.cpp sobre GGUF.
- Cliente Python y validador incluidos para rechazar acciones malformadas o no soportadas (fail closed).
- Separación estricta entre inferencia y actuación: no emite comandos MAVLink/MAVSDK.
- No se documentan tool calling genérico, function calling, agentes autónomos, visión, audio ni modo de razonamiento extendido más allá de las capacidades heredadas del modelo base, que no se detallan en la información disponible.

## Casos de uso
- Interfaces de lenguaje natural para investigación en robótica: el modelo convierte instrucciones de operador en JSON de acciones que un componente determinista valida antes de cualquier ejecución, permitiendo estudiar la interacción humano-dron sin riesgo de actuación directa.
- Experimentación en edge AI sobre ARM64: con un GGUF Q4_K_M de aproximadamente 1,05 GiB, se puede desplegar en una Raspberry Pi 5 u ordenador de a bordo para probar latencia y consumo en hardware limitado.
- Prototipado de comandos multi-paso: permite modelar peticiones compuestas (por ejemplo, despegue seguido de navegación a waypoint) y evaluar cómo se descomponen en propuestas estructuradas.
- Validación de pipelines de seguridad: el cliente y validador incluidos permiten probar el rechazo de acciones no soportadas o malformadas, útil para diseñar capas de fail-closed en sistemas robóticos.
- Investigación multilingüe en robótica: al cubrir inglés, ruso, árabe y alemán, sirve para estudiar la robustez de interfaces de comando en distintos idiomas con un mismo vocabulario de acciones.
- Simulación y pruebas en SITL: los ejemplos en modo simulador y el mapeo de hold a hover en simulador permiten integrar el modelo en entornos PX4 SITL antes de cualquier prueba física.
- Docencia y demostraciones: su tamaño reducido y su licencia Apache 2.0 facilitan su uso en cursos y talleres sobre modelos de lenguaje aplicados a robótica.

## Benchmarks y rendimiento
Evaluación interna sobre el conjunto de validación reservado de 108 ejemplos, con llama.cpp en un host CPU de RunPod (no en Raspberry Pi física):

| Metrica | Resultado |
|---|---|
| Salidas JSON parseables | 108/108 |
| Coincidencia exacta con el objeto de comando esperado (antes de normalización) | 103/108 |
| Diferencias | 5 casos de hold de simulador frente a hover esperado |
| Coincidencia tras normalización determinista del esquema | 108/108 |

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que estos resultados corresponden a un conjunto interno pequeño y no constituyen evidencia de seguridad de vuelo ni de generalización.

## Requisitos de hardware
- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa aproximadamente 1,03-1,05 GiB, por lo que cabe holgadamente en GPUs de consumo con 4 GB o más; en CPU se puede ejecutar con llama.cpp.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) es suficiente. El objetivo declarado del autor es CPU ARM64.
- Cabe en GPU de consumo: sí, gracias a la cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp (runtime objetivo), Transformers con safetensors; el servidor local incluido en el paquete `fortera-pi` se enlaza por defecto a 127.0.0.1.
- Latencia y throughput: no disponibles. La evaluación se realizó en un host CPU de RunPod, no en Raspberry Pi, y no se publican cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Fortera | 1,72 B | no disponible | en, ru, ar, de | Apache 2.0 | Comandos de dron en JSON, edge |
| Qwen/Qwen3-1.7B (base) | 1,72 B | no disponible | multilingüe (no detallado) | Apache 2.0 | Modelo generalista |
| Alternativas especializadas en comandos robóticos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (comprensión de comandos para drones con salida JSON estructurada) en la documentación proporcionada.

## Limitaciones y advertencias
- Nunca conectar la salida cruda del modelo a MAVLink, MAVSDK, motores o actuadores: la salida es no confiable.
- El validador incluido no es un sistema completo de seguridad de vuelo; deben imponerse de forma independiente comprobaciones de batería, frescura de telemetría, GPS/home, modo de vuelo, detección de obstáculos, geocerca, permisos de waypoint, autorización del operador y failsafes del piloto automático.
- El despacho físico debe permanecer deshabilitado hasta completar pruebas en PX4 SITL, HIL y hardware supervisado; no se ha realizado ninguna prueba en dron físico ni en Raspberry Pi.
- Solo están habilitadas las acciones takeoff, goto, hold y hover en el validador empaquetado; el resto falla de forma segura (fail closed).
- Entrenamiento con solo 504 ejemplos sintéticos: riesgo elevado de sobreajuste a plantillas y baja generalización a lenguaje real de operador.
- Riesgo de alucinación y de generar acciones no válidas fuera del vocabulario restringido.
- No se documentan sesgos específicos por idioma; el conjunto es sintético y equilibrado por idioma, pero no representa variación dialectal ni de registro.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte que la auditoría de licencia upstream no establece derechos sobre datasets, código o activos de terceros no relacionados; consultar `LICENSE_SCOPE.md` y `THIRD_PARTY_NOTICES.md`.
- El servidor local se enlaza a 127.0.0.1 por defecto; no exponerlo directamente a una red pública.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Askit87/Fortera
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de licencia y avisos de terceros: `LICENSE_SCOPE.md` y `THIRD_PARTY_NOTICES.md` (incluidos en el repositorio del modelo)
- Paquete de runtime `fortera-pi`: no disponible como enlace público en la información proporcionada
- Paper, blog o demo: no disponible
