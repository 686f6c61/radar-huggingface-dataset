# dr0wzy/aizen-siem

## Resumen

AIzen v2, también conocido como Deep Sequence Detector, es un modelo de clasificación de secuencias a nivel de caracteres desarrollado por el usuario de Hugging Face dr0wzy como parte del proyecto AIzen, un SIEM (Security Information and Event Management) para logs de Apache. El modelo está diseñado para detectar ataques inyectados en tráfico normal, superando las limitaciones del detector clásico del proyecto, basado en TF-IDF y regresión logística, que se entrenó con solo 831 patrones autoetiquetados por reglas y no generalizaba a payloads ofuscados ni a ataques de baja intensidad. La nueva versión entrena un modelo LSTM/Transformer a nivel de caracteres sobre corpus amplios de Kaggle, Hugging Face y Loghub, y exporta un artefacto ONNX cuantizado en INT8 que se ejecuta en CPU mediante onnxruntime-node, con una latencia inferior a 1 ms por línea. El modelo se presenta como una alternativa aislada al detector legacy, activable mediante una variable de entorno, y está orientado a su despliegue en servidores de bajo coste sin GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM/Transformer a nivel de caracteres (según model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias a nivel de caracteres, implementado como LSTM o Transformer (la model card no especifica cuál de los dos). Se entrena sobre un conjunto de datos compuesto por logs de Kaggle, Hugging Face y Loghub, tras un pipeline de ingesta, normalización, preprocesamiento y aumentación de datos mediante ofuscación. Esta aumentación tiene como objetivo que el modelo aprenda a reconocer payloads codificados en base64, con variación de mayúsculas y minúsculas u otras transformaciones que las firmas basadas en regex no detectan. El entrenamiento se realiza en una máquina local con GPU, y posteriormente se exporta a un modelo ONNX cuantizado en INT8 para su ejecución en CPU. No se indica que se hayan aplicado técnicas como RLHF o DPO, al tratarse de un modelo discriminativo, no generativo.

## Capacidades

- Detección binaria de ataques en logs: clasifica cada línea como ataque o tráfico normal.
- Detección de payloads ofuscados: reconoce codificaciones base64, cambios de mayúsculas y otras ofuscaciones que las firmas literales como `acunetix`, `sqlmap` o `%27` no detectan.
- Procesamiento en tiempo real y por lotes: el mismo modelo puede clasificar líneas individuales en streaming o logs completos subidos por lotes.
- Integración en procesos Node.js: se ejecuta in-process con onnxruntime-node, sin necesidad de un servicio externo.
- Activación mediante variable de entorno: se puede habilitar en producción con `V2_CLASSIFIER=onnx` sin alterar el comportamiento del sistema legacy.
- No dispone de capacidades generativas, tool calling, visión, audio ni razonamiento multi-paso; es un modelo especializado en clasificación de secuencias.

## Casos de uso

- Detección de ataques en tiempo real en logs de Apache: el modelo clasifica cada línea de log entrante en menos de 1 ms, lo que permite integrarlo en el pipeline de un SIEM para alertar sobre intentos de inyección SQL, XSS u otros ataques antes de que causen daño.
- Análisis forense de logs históricos: al ejecutarse sobre archivos de logs completos, el modelo puede etiquetar retroactivamente las líneas que contienen ataques ofuscados que el detector clásico no identificó, facilitando la reconstrucción de incidentes.
- Complemento del detector legacy: como la activación es opcional, el modelo puede desplegarse junto al sistema clásico para comparar resultados y reducir falsos negativos sin interrumpir la operativa actual.
- Detección de ataques de baja intensidad mezclados en tráfico normal: el modelo, entrenado en corpus amplios, puede identificar patrones que los métodos basados en z-score de bursts no detectan cuando el volumen de ataque es bajo.
- Clasificación en servidores sin GPU: gracias al artefacto ONNX cuantizado y a la ejecución en CPU, el modelo puede desplegarse en instancias gratuitas o de bajo coste, como las de Render, sin necesidad de hardware especializado.
- Integración en un pipeline de análisis de logs en Node.js: el modelo se puede importar directamente como módulo en una aplicación Node.js existente, sin levantar servicios adicionales, lo que simplifica el mantenimiento y reduce la latencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card establece un criterio de aceptación para producción: recall de ataque ≥ 0.95 y precisión de tráfico benigno ≥ 0.95 en un escenario de peticiones mixtas (`mixed_benchmark.js`). No obstante, no se proporcionan valores medidos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU.
- GPU recomendadas: no disponible; no es necesario para la inferencia.
- Consumer GPU: no aplica; puede ejecutarse en cualquier CPU, incluso en instancias de bajo coste como el free tier de Render.
- Opciones de despliegue: onnxruntime-node en Node.js; también se menciona la posibilidad de un sidecar con FastAPI.
- Latencia y throughput: la model card indica una latencia inferior a 1 ms por línea en CPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrenamiento | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIzen v2 (aizen-siem) | LSTM/Transformer a nivel de caracteres | Corpus grandes (Kaggle, HF, Loghub) con aumentación | Sin benchmarks publicados | no disponible | Hugging Face (ONNX) |
| AIzen v1 (legacy) | char-TF-IDF + LogisticRegression | ~831 patrones autoetiquetados por reglas | Baja generalización a payloads ofuscados | no disponible | Código en GitHub |
| Otros modelos de detección de intrusiones | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no se puede verificar el rendimiento real del modelo en producción.
- La model card indica que el modelo solo debe habilitarse si supera el acceptance gate de recall ≥ 0.95 y precisión ≥ 0.95, pero no hay evidencia de que lo haya superado.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- Los idiomas soportados no están definidos; el modelo se entrena con logs que pueden estar en inglés, pero no se confirma su comportamiento con otros idiomas.
- El modelo es un clasificador binario de secuencias y no puede generar texto ni responder preguntas, por lo que no es adecuado para tareas de asistencia o generación.
- Los datos de entrenamiento provienen de fuentes externas (Kaggle, Hugging Face, Loghub) sin detallar sus licencias, lo que podría afectar a la trazabilidad del modelo.
- El repositorio de Hugging Face no tiene descargas ni likes, lo que sugiere que el modelo no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/dr0wzy/aizen-siem
- GitHub (proyecto AIzen): https://github.com/arnav-iwnl/AIzen
- README del proyecto en GitHub: https://github.com/arnav-iwnl/AIzen/blob/master/README.md
