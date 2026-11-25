# elnemer7/ElNeMeR-WhatsApp-Hijack-FriendImpersonation-ONNX

## Resumen

ElNeMeR-WhatsApp-Hijack-FriendImpersonation-ONNX es un clasificador binario-multiclase empaquetado en formato ONNX, desarrollado por el ingeniero Mahmoud ElNemer bajo el sello ElNeMeR Digital Solutions & AI. Forma parte de una flota declarada de 25 modelos orientados a "IA forense y humanitaria", y su tarea concreta es detectar dos patrones de fraude en conversaciones de WhatsApp: intentos de secuestro de cuenta mediante robo de OTP de 6 dígitos (incluido el escenario de SIM swapping) y mensajes de suplantación de un amigo comprometido que solicita un préstamo urgente (por ejemplo, "estoy en una emergencia, no puedo hablar por teléfono, envía 4000 EGP a esta cartera").

El modelo no es un LLM generativo sino un clasificador de features: recibe un tensor `float32` de forma `[batch_size, 512]` y devuelve probabilidades sobre tres clases (`normal_friend_chat`, `otp_simswap_hijack`, `hijacked_friend_urgent_loan`). Está exportado con opset 14 de ONNX, lo que permite ejecución tanto con `onnxruntime` en servidor como con `onnxruntime-web` sobre WASM en el navegador. La model card declara una "calibración" del 100,00 %, dato que debe interpretarse con cautela porque no se especifica el conjunto de evaluación ni el tamaño de la muestra.

Su relevancia es acotada pero específica: cubre un nicho de seguridad aplicada (detección de account takeover y fraude de ingeniería social en mensajería) con licencia MIT y despliegue ligero. El repositorio, sin embargo, aparece con 0,0 GB de tamaño, 0 descargas y 0 likes, y la información pública disponible es mínima, por lo que cualquier evaluación seria exige inspeccionar los artefactos reales antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de features; red no descrita en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de vector fijo de 512 dimensiones |
| Tipos de cuantizacion | no disponible (pesos ONNX; se desconoce si hay variantes INT8/FP16) |
| Idiomas soportados | no disponible (la model card menciona mensajes en ingles y referencias a EGP, pero no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14), compatible con `onnxruntime` y `onnxruntime-web` WASM |
| Entrada | tensor `features`, `float32`, `[batch_size, 512]` |
| Salida | `probabilities` sobre 3 clases |
| Clases | 0 `normal_friend_chat`, 1 `otp_simswap_hijack`, 2 `hijacked_friend_urgent_loan` |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna: no se indica si se trata de un MLP, una CNN 1D, un transformer pequeño ni un modelo lineal sobre embeddings. Lo único verificable es la interfaz: un vector de 512 características `float32` por muestra y una cabeza de clasificación de tres clases con salida de probabilidades. Tampoco se documenta el pipeline de extracción de features que transforma un mensaje de WhatsApp en ese vector de 512 dimensiones, lo que constituye una pieza crítica ausente para reproducir el sistema.

No hay información sobre volumen de datos de entrenamiento, composición del dataset, técnicas de aumento de datos, balanceo de clases, ni sobre si se aplicó algún tipo de ajuste fino o calibración posterior (a pesar de que la card habla de "Calibration Accuracy: 100.00%"). Tampoco se detallan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos; no procede, dado que no es un modelo generativo. La exportación a opset 14 con compatibilidad WASM es el único detalle de ingeniería explícito.

## Capacidades

- Clasificación de mensajes de WhatsApp en tres categorías: conversación normal, intento de secuestro de cuenta por OTP/SIM swap y suplantación de amigo con solicitud urgente de dinero.
- Detección específica de patrones de OTP de 6 dígitos asociados a account takeover.
- Detección de mensajes de ingeniería social con excusa de emergencia y petición de transferencia (la card cita el ejemplo de 4000 EGP a una cartera).
- Inferencia en navegador mediante `onnxruntime-web` (WASM), lo que permite procesamiento local sin enviar mensajes a un servidor.
- Inferencia por lotes en servidor con `onnxruntime` gracias a la dimensión `batch_size` de la entrada.
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo "thinking".
- No se declaran capacidades multilingües explícitas; el idioma queda determinado por el extractor de features, no documentado.

## Casos de uso

- Moderación en pasarelas de mensajería empresarial: integrar el clasificador en el backend de un proveedor de WhatsApp Business para marcar conversaciones entrantes con probabilidad alta de `otp_simswap_hijack` y derivarlas a revisión humana antes de que el usuario comparta un código.
- Filtro on-device en aplicaciones de terceros: al ejecutarse con `onnxruntime-web`, puede embeberse en un cliente web o extensión que advierta al usuario en el momento en que un contacto pide un código OTP o una transferencia urgente, sin salir del navegador.
- Protección de personas mayores frente a fraudes de "falso familiar": clasificar mensajes con excusa de emergencia y solicitud de dinero a una cartera concreta y mostrar una alerta con recomendación de verificación por llamada.
- Triaje en equipos de fraude bancario: prefiltrar los reportes de clientes que envían capturas o transcripciones de WhatsApp y priorizar los casos clasificados como `hijacked_friend_urgent_loan` para investigación.
- Investigación forense digital: usar el clasificador como señal auxiliar en la reconstrucción de cadenas de account takeover, etiquetando automáticamente los mensajes de un volcado de conversaciones.
- Formación y concienciación: alimentar simuladores de phishing por WhatsApp que generen escenarios etiquetados y permitan medir la tasa de detección de los empleados, usando el modelo como oráculo de etiquetado.
- Automatización de políticas en un SOC: enrutar alertas de seguridad hacia el flujo correspondiente (bloqueo de sesión, verificación de identidad, aviso al contacto) según la clase predicha.

## Benchmarks y rendimiento

La model card solo declara "Calibration Accuracy: 100.00 %", sin especificar conjunto de evaluación, tamaño de muestra, métrica exacta ni partición train/test. No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni matrices de confusión, ni F1 por clase).

| Metrica | Valor | Observaciones |
|---|---|---|
| Calibration Accuracy | 100,00 % | Declarada por el autor; sin conjunto de evaluacion ni metodologia especificados |
| Resto de benchmarks | no disponible | No hay datos publicados |

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 0,0 GB y la entrada es un vector de 512 `float32`, por lo que el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna basta para inferencia en tiempo real. Una RTX 4090, A100 o H100 estarian sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050 en adelante) e incluso en CPU y en navegador.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM en navegador), `onnxruntime-node` para Node.js. Compatible con opset 14, por lo que funciona con versiones recientes de ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador).
- Latencia y throughput: no disponibles. Por la forma del modelo (entrada de 512 floats), se espera latencia de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificadores ONNX de fraude en mensajería) dentro de la documentación proporcionada.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ElNeMeR-WhatsApp-Hijack-FriendImpersonation-ONNX | no disponible | vector 512 floats | MIT | Hugging Face | Clasificador de 3 clases, ONNX opset 14 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se identifican en la informacion disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al tratarse de un detector de fraude entrenado presumiblemente con datos de una región concreta (se cita EGP, libra egipcia), puede tener sesgo geográfico y de idioma.
- Riesgo de falsos positivos y falsos negativos no cuantificado: no hay matriz de confusión ni métricas por clase. La cifra de "100,00 %" sin metodología no es evidencia suficiente para producción.
- El extractor de features que convierte texto de WhatsApp en el vector de 512 dimensiones no está documentado ni incluido; sin él, el modelo es inutilizable de extremo a extremo.
- El repositorio aparece con 0,0 GB y 0 descargas, lo que sugiere que los artefactos pueden no estar subidos o que el repositorio está vacío; verificar antes de cualquier integración.
- No se declaran idiomas soportados; el rendimiento en castellano o en variantes dialectales del árabe no está garantizado.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; el autor no ofrece cláusulas de indemnización ni SLA.
- No debe usarse como única barrera de seguridad: un clasificador de este tipo complementa, no sustituye, la verificación de identidad fuera de banda y la autenticación multifactor.
- La fecha de creación indicada (2026-11-25) es futura respecto a la fecha habitual de consulta, lo que puede indicar un error de metadatos o una fecha programada; conviene comprobar la integridad del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-WhatsApp-Hijack-FriendImpersonation-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Contacto declarado en la model card: WhatsApp/telefono +20 150 755 9911
