# mosetireagan/dxa-guard-neural-threat-engine

## Resumen

DXA-Guard Neural Threat Engine es un clasificador tabular de ciberseguridad desarrollado por el usuario de HuggingFace `mosetireagan`. No es un modelo de lenguaje: es un perceptrón multicapa (MLP) empaquetado con scikit-learn y joblib que clasifica líneas de telemetría de servidores Linux en seis clases de amenaza, con el objetivo de actuar como filtro de primera línea ("spinal reflex arc") en sistemas de detección y prevención de intrusiones. Su propuesta de valor es el rendimiento en CPU con una huella mínima: 7,50 MB de pesos y una latencia declarada de 3,2 ms por inferencia, lo que permite desplegarlo en VPS de bajos recursos o entornos air-gapped sin depender de APIs en la nube.

El modelo resuelve un problema concreto de ingeniería: inspeccionar telemetría cruda (logs HTTP, SSH, eventos de persistencia) a velocidad de línea sin el coste ni la latencia de un LLM. Para ello combina 86 features densas de dominio (entropía estructural, ratios de caracteres, parser de códigos HTTP, 64 buckets de hash Murmur3) con 2.500 n-gramas sublineales de caracteres (1-3), formando un vector de 2.586 dimensiones que alimenta una MLP de dos capas densas (256 y 128 neuronas, activación ReLU + normalización L2) con salida softmax de seis clases.

Es relevante ahora por su encaje en pipelines de defensa en profundidad y en despliegues DevOps con restricciones de red, aunque conviene señalar que el repositorio tiene cero descargas y cero likes, que el autor no ha publicado verificación independiente de las métricas y que la información pública disponible es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP densa (scikit-learn) sobre vector tabular de 2.586 dimensiones |
| Parametros totales | no disponible (pesos empaquetados en 7,50 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de línea individual, no secuencial) |
| Tipos de cuantizacion | no disponible (formato joblib; sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | en (inglés; el modelo procesa telemetría, no texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (serialización de scikit-learn) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal profunda de tipo MLP con dos capas ocultas (256 y 128 neuronas), activación ReLU con normalización L2 y capa de salida softmax de seis clases. La entrada no es texto en bruto sino un vector de 2.586 features construido en dos ramas: 86 features densas de dominio (entropía estructural, proporción de caracteres y dígitos, parseo de códigos de estado HTTP y 64 buckets de hash Murmur3) y 2.500 n-gramas sublineales de caracteres (rangos 1-3) orientados a capturar sintaxis de shell ofuscada, fragmentos Base64/hex y tokens de path traversal. Sobre la salida se aplica una "Epistemic Separation Gate" que calibra la incertidumbre y permite rechazar muestras fuera de distribución (out-of-distribution rejection) antes de emitir una hipótesis de amenaza calibrada.

No se han publicado detalles sobre el volumen de tokens o muestras de entrenamiento, la composición exacta del dataset "DXA-Guard Multi-Source Enterprise Telemetry V2", ni si se emplearon técnicas de ajuste como RLHF o DPO (no aplicables en un clasificador tabular de este tipo). Tampoco se documenta el proceso de calibración de la compuerta epistémica ni los hiperparámetros de entrenamiento. La model card menciona alineación con la matriz MITRE ATT&CK para las seis clases de amenaza, pero el contenido disponible se corta antes de detallar la taxonomía completa.

## Capacidades

- Clasificación de telemetría de servidor en seis clases de amenaza (exploits web, password spraying SSH, manipulación de persistencia no autorizada, reverse shells y clases adicionales no detalladas en la información disponible).
- Detección de sintaxis de shell ofuscada, fragmentos Base64/hex y tokens de path traversal mediante n-gramas de caracteres.
- Parseo de códigos de estado HTTP y features estructurales de línea de log.
- Rechazo de muestras fuera de distribución mediante la compuerta de separación epistémica.
- Operación en CPU a velocidad de línea (latencia declarada de 3,2 ms por inferencia).
- Funcionamiento en entornos air-gapped (egress de red declarado: 0 bytes).
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un clasificador, no un modelo generativo.
- Capacidades multilingües: no disponibles; el modelo está orientado a telemetría en inglés.

## Casos de uso

- Detección de intrusiones en VPS Linux de bajos recursos: el modelo se ejecuta en CPU con 7,50 MB de pesos y 3,2 ms de latencia, por lo que puede procesar el flujo de logs de un servidor modesto sin GPU ni servicios externos, actuando como primera capa antes de alertar a un SIEM.
- Filtrado de falsos positivos en pipelines de seguridad: al clasificar millones de eventos benignos y descartarlos rápidamente, reduce el volumen de telemetría que llega a analistas o a sistemas de correlación posteriores.
- Detección de password spraying SSH: las features de ratio de caracteres, entropía y n-gramas permiten identificar patrones de intentos de autenticación masivos sin necesidad de reglas firmadas.
- Identificación de reverse shells y payloads ofuscados: los n-gramas de caracteres (1-3) y los fragmentos Base64/hex están diseñados para capturar sintaxis de shell camuflada en líneas de log.
- Monitorización de integridad y persistencia en sistemas Linux: la clase de "unauthorized persistence tampering" permite alertar sobre modificaciones en mecanismos de arranque o cron cuando el modelo se integra en un agente de host.
- Despliegue en entornos air-gapped o de defensa: al no requerir egress de red, encaja en instalaciones clasificadas, plantas industriales o infraestructura crítica donde no se permite enviar telemetría a la nube.
- Integración en CI/CD y DevOps: puede incorporarse como paso de validación en pipelines que analicen logs de despliegue o tráfico de contenedores, con la ventaja de su formato joblib y su dependencia de scikit-learn.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Verificado |
|---|---|---|
| Gated System Accuracy | 0,9612 | No |
| Weighted F1 | 0,9618 | No |
| Macro F1 | 0,8584 | No |

Dataset de evaluación: DXA-Guard Multi-Source Enterprise Telemetry V2 (telemetría de ciberseguridad). La diferencia entre Weighted F1 (0,9618) y Macro F1 (0,8584) sugiere un desequilibrio de clases considerable: el rendimiento en las clases minoritarias es notablemente inferior al promedio ponderado. No se han publicado resultados comparativos con otros modelos de detección de intrusiones en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU.
- GPU recomendadas: no necesarias; cualquier CPU moderna es suficiente según el autor.
- Cabe en GPU consumer: sí, aunque no es su caso de uso; el modelo corre en CPU.
- Tamaño en disco: 7,50 MB de pesos; el repositorio ocupa 0,0 GB.
- Opciones de despliegue: scikit-learn + joblib en Python; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador tabular).
- Latencia declarada: 3,2 ms por inferencia en CPU.
- Throughput: no disponible de forma explícita, aunque a 3,2 ms por línea el límite teórico ronda las 300 líneas por segundo por núcleo; el autor afirma operar a "velocidad de línea" en servidores con 10.000 líneas por segundo, lo que requeriría paralelización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los clasificadores tabulares de detección de intrusiones habituales (Random Forest, XGBoost, Isolation Forest sobre datasets como NSL-KDD o CICIDS) no se han evaluado contra este modelo en la información disponible, y no se han publicado comparativas con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DXA-Guard Neural Threat Engine | no disponible (7,50 MB) | no aplica | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Métricas no verificadas: los resultados de la model card están marcados como `verified: false`; no hay evaluación independiente ni reproducibilidad documentada.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- Desequilibrio de clases: la brecha entre Weighted F1 (0,9618) y Macro F1 (0,8584) indica que las clases minoritarias se detectan peor; en seguridad, esto puede traducirse en falsos negativos en amenazas poco frecuentes.
- Riesgo de deriva (drift): al depender de features de n-gramas y hashes fijos, la eficacia puede degradarse ante nuevas técnicas de ofuscación no representadas en el entrenamiento.
- Ámbito limitado: solo telemetría en inglés y clases predefinidas; no es un modelo generativo ni razona sobre contexto multi-turno.
- Documentación incompleta: la model card disponible se corta antes de detallar la taxonomía completa de clases, el dataset de entrenamiento y los hiperparámetros.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de usarlo en producción.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza si la compuerta epistémica no está bien calibrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mosetireagan/dxa-guard-neural-threat-engine
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
