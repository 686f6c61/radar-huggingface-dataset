# elnemer7/ElNeMeR-Video-Blink-MicroExpression-Anomaly-ONNX

## Resumen

ElNeMeR-Video-Blink-MicroExpression-Anomaly-ONNX es un clasificador binario/multiclase exportado a formato ONNX por el ingeniero Mahmoud ElNemer (ElNeMeR Digital Solutions & AI) y publicado bajo licencia MIT. Forma parte de una flota declarada de 35 modelos orientados a forense digital y "humanitarian AI". El modelo no es un LLM ni un modelo generativo: es un clasificador tabular ligero que recibe un vector de 20 características (`blink_features`, `float32`, shape `[batch_size, 20]`) extraídas de la cadencia de parpadeo ocular y de microexpresiones faciales, y devuelve probabilidades sobre tres clases relacionadas con autenticidad fisiológica frente a artefactos de deepfake.

El problema que aborda es la detección de vídeo sintético o de *liveness* en videollamadas en tiempo real: los avatares generados y los deepfakes suelen presentar patrones de parpadeo erráticos o ausentes, así como microexpresiones rígidas de tipo "marioneta". El modelo clasifica cada ventana de características en `physiological_blink_and_pulse` (clase 0), `erratic_or_absent_eye_blinking` (clase 1) o `rigid_facial_microexpression_puppet` (clase 2).

Es relevante por su formato: al ser ONNX con opset 14 y compatible con `onnxruntime` y `onnxruntime-web` (WASM), puede ejecutarse tanto en servidor como en navegador, lo que facilita su integración en pipelines de verificación de identidad o moderación de contenido sin depender de GPU. No obstante, el repositorio está vacío (0.0 GB) en el momento de la consulta y no se han publicado especificaciones de arquitectura interna, datos de entrenamiento ni benchmarks verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador tabular exportado a ONNX; arquitectura interna no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de vector fijo de 20 características) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del clasificador: solo indica que la entrada es un tensor `blink_features` de tipo `float32` con forma `[batch_size, 20]` y que la salida son probabilidades sobre tres clases. No se especifica si se trata de un MLP, un árbol de decisión exportado, un modelo lineal o una red recurrente. Tampoco se detalla el número de capas, parámetros ni funciones de activación.

No hay información sobre el conjunto de datos de entrenamiento, el número de muestras, la composición del dataset, el proceso de etiquetado ni si se aplicó algún tipo de ajuste fino, calibración o regularización. El autor declara una "Calibration Accuracy" del 99,87%, pero no se aporta la metodología de medición ni el conjunto de validación empleado, por lo que la cifra no es verificable de forma independiente. No se mencionan innovaciones técnicas como atención lineal, decodificación especulativa o entrenamiento con RLHF/DPO, que en cualquier caso no aplicarían a un clasificador de este tipo.

## Capacidades

- Clasificación de ventanas de características de parpadeo y microexpresión en tres clases: fisiología normal, parpadeo errático/ausente y microexpresión rígida de avatar.
- Detección de artefactos de *puppetry* facial en vídeo sintético.
- Soporte de *liveness detection* en videollamadas en tiempo real.
- Ejecución en navegador mediante `onnxruntime-web` (WASM) y en servidor con `onnxruntime`.
- Procesamiento por lotes (`batch_size` configurable en el tensor de entrada).
- No soporta generación de texto, código, matemáticas, visión directa, tool calling, agentes ni capacidades multilingües: es un clasificador de características preextraídas.

## Casos de uso

- Verificación de identidad en *onboarding* remoto: integrado tras un extractor de puntos faciales que calcule las 20 características de parpadeo, el modelo puede marcar sesiones sospechosas de suplantación por avatar antes de aprobar una cuenta.
- Moderación de videollamadas en plataformas de *dating* o social: ejecutado en el navegador vía WASM, permite señalar en tiempo real transmisiones con parpadeo ausente o microexpresiones rígidas.
- Detección de deepfakes en contenido periodístico: como filtro de primera pasada sobre clips sospechosos, reduciendo el volumen que llega a revisión humana.
- *Liveness* en banca digital: capa adicional en la verificación biométrica de videollamadas con agentes, detectando avatares generados en sustitución del cliente real.
- Forense digital pericial: apoyo a analistas que necesitan clasificar automáticamente grandes lotes de vídeos incautados según la probabilidad de manipulación facial.
- Pruebas de calidad de *pipelines* de generación de avatares: usar el clasificador como discriminador para evaluar si un generador produce parpadeos y microexpresiones fisiológicamente plausibles.
- Despliegue en dispositivos de borde: al ser un ONNX de entrada tabular de 20 dimensiones, puede ejecutarse en CPUs modestas o incluso en el navegador del cliente sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica declarada por el autor es una "Calibration Accuracy" del 99,87%, sin conjunto de validación, tamaño de muestra ni metodología especificados, por lo que no se presenta como benchmark comparable.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de un clasificador tabular de entrada `[batch, 20]` y estar exportado a ONNX, es presumible que quepa en CPU y en cualquier GPU, pero no se aportan cifras.
- GPU recomendadas: no disponible; no se requiere GPU para un modelo de este tamaño según la información pública.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU, pero no confirmado por el autor.
- Opciones de despliegue: `onnxruntime` (Python/C++), `onnxruntime-web` (WASM en navegador), y cualquier runtime compatible con ONNX opset 14.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificadores ONNX de cadencia de parpadeo y microexpresiones) con especificaciones públicas que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El repositorio figura con tamaño 0.0 GB y 0 descargas: no hay evidencia de que los pesos estén efectivamente publicados o sean accesibles en el momento de la consulta.
- La cifra de "Calibration Accuracy" del 99,87% no viene acompañada de metodología, conjunto de validación ni código de evaluación; no debe tomarse como garantía de rendimiento en producción.
- No se documenta la arquitectura interna, los datos de entrenamiento ni el proceso de extracción de las 20 características de entrada, lo que impide reproducir el pipeline completo.
- El modelo depende de un extractor de características externo no especificado; un cambio en el extractor invalidaría las predicciones.
- Riesgo de sesgo demográfico: al no publicarse la composición del dataset, no puede evaluarse el comportamiento diferencial por etnia, edad, gafas, iluminación o condiciones médicas que alteren el parpadeo (p. ej., síndrome de Tourette, blefaroespasmo, fatiga).
- Riesgo de falsos positivos en personas con parpadeo atípico o en vídeos con baja tasa de fotogramas.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; la marca "ElNeMeR" y el sello "VERIFIED BY ENG. MAHMOUD ELNEMER" no constituyen una certificación independiente.
- No apto como única evidencia en contextos periciales o de denegación de acceso: debe combinarse con otras señales.

## Enlaces

- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Video-Blink-MicroExpression-Anomaly-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Contacto del autor: WhatsApp/teléfono +20 150 755 9911 (según model card)
