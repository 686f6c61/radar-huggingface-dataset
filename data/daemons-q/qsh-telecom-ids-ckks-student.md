# Daemons-Q/qsh-telecom-ids-ckks-student

## Resumen

qsh-telecom-ids-ckks-student es un modelo de clasificación tabular desarrollado por Daemons-Q como parte del proyecto QSMPC-QKD-QHE-AI-Hybrid, una demostración de orquestación cuánticamente segura. Se trata de una regresión logística multinomial (64 parámetros en total) destilada a partir de un random forest y diseñada específicamente para ser evaluada bajo cifrado homomórfico CKKS. El modelo clasifica telemetría sintética de ataques QKD en 8 clases (7 tipos de ataque BB84 más la clase normal) y se distribuye en formato ONNX para su ejecución en navegador mediante onnxruntime-web.

El modelo resuelve un problema muy concreto: demostrar que una capa de inferencia lineal lo bastante pequeña puede ejecutarse sobre datos cifrados en un caso de uso de detección de intrusiones en telecomunicaciones. No es un modelo de propósito general ni un sistema de producción; es una pieza de una prueba de concepto que prioriza la viabilidad criptográfica sobre el rendimiento bruto. Su relevancia radica en el creciente interés por la computación verificable y preservadora de privacidad en pipelines de seguridad, no en sus cifras absolutas.

La información disponible es limitada: no hay datos sobre arquitectura más allá de "regresión logística multinomial", ni sobre tokenización, contexto o idiomas, ya que no es un modelo de lenguaje. Las métricas reportadas (exactitud agregada 0,988, macro F1 0,988, acuerdo con el profesor 0,995 sobre 600 muestras de evaluación) proceden de la propia model card y se midieron en texto plano, no bajo cifrado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística multinomial (modelo lineal, 8 clases × 7 características + 8 sesgos) |
| Parametros totales | 64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: clasificación tabular) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo construido desde weights.json) |

## Arquitectura y entrenamiento

El modelo es una regresión logística multinomial con 7 características de entrada y 8 clases de salida, lo que resulta en 8×7 + 8 = 64 parámetros. Se destiló desde el random forest publicado como `telecom_ids.qml` utilizando sus probabilidades (soft targets) y no su argmax, una decisión explícita para preservar la señal de las clases minoritarias que alimenta el macro F1. El autor señala que la destilación con etiquetas duras ya había sido un defecto en una iteración anterior del proyecto.

Los datos de entrenamiento son telemetría sintética de ataques QKD generada por el propio repositorio (`qsh.qml_ids.attacks`). Las 8 clases siguen la lista de Al-Kuwari et al. (IET Quantum Communication 7(1), e70028, 2026): 7 tipos de ataque más normal. Sin embargo, las 7 características y sus valores de firma son de diseño propio y explícitamente ilustrativos, no ajustados a mediciones reales. El autor declara que no encontró ninguna captura pública real de ataques QKD (arXiv:2508.12749 reporta anomalías en un receptor experimental pero sin liberación de datos). El grafo ONNX se construye a partir de `weights.json` mediante `qsh.models.linear_onnx`, sin reentrenamiento, de modo que la re-puntuación en texto plano y la capa cifrada evalúan el mismo modelo.

## Capacidades

- Clasificación tabular multiclase: asigna una de 8 etiquetas (7 tipos de ataque BB84 + normal) a partir de 7 características físicas por sesión.
- Inferencia bajo cifrado homomórfico CKKS: evalúa los 8 productos escalares sobre la fila cifrada, descifra las 8 puntuaciones y toma el argmax en claro (CKKS no dispone de comparación nativa).
- Ejecución en navegador: el formato ONNX y la librería onnxruntime-web permiten desplegarlo en cliente sin backend.
- Destilación con soft targets: preserva la distribución de probabilidad del profesor, relevante para el macro F1 en clases desbalanceadas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; no es un modelo generativo.

## Casos de uso

- Detección de intrusiones en enlaces QKD: el modelo clasifica cada sesión BB84 en uno de los 7 tipos de ataque o normal a partir de observables físicos, adecuado como capa de alerta temprana en un despliegue de QKD simulado.
- Inferencia preservadora de privacidad en telemetría sensible: al ejecutarse bajo CKKS, permite que un proveedor evalúe datos de red cifrados sin acceder a las características en claro, útil en entornos multi-tenant o regulados.
- Demostración educativa de orquestación cuánticamente segura: sirve como pieza verificable en el proyecto QSMPC-QKD-QHE-AI-Hybrid para ilustrar el flujo cifrado de extremo a extremo.
- Clasificación en el navegador: con ONNX y onnxruntime-web, puede integrarse en paneles de monitorización que clasifiquen sesiones localmente sin enviar telemetría al servidor.
- Prototipado de pipelines de detección con restricciones criptográficas: su tamaño de 64 parámetros lo hace viable como banco de pruebas para medir coste de evaluación bajo CKKS antes de escalar a modelos mayores.
- Referencia de destilación con soft targets: útil como ejemplo reproducible de cómo destilar un random forest a un modelo lineal evaluable en entornos restringidos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud agregada | 0,988333 |
| Acuerdo con el profesor | 0,995 |
| Macro F1 | 0,988329 |
| Clases en el conjunto | 8 |
| Clases predichas | 8 |
| Muestras de evaluación | 600 |
| Parámetros | 64 |

El autor advierte que estas cifras se midieron en texto plano y deben leerse contra el profesor (el random forest), no contra la literatura publicada. La model card cita como anclas externas, sin que constituyan comparación directa: Al-Kuwari et al. (IET Quantum Communication 7(1), e70028, 2026) con un QLSTM híbrido al 94,7% de exactitud y F1; IACR ePrint 2026/1282 con 96,9% de recall y 97,6% de precisión mediante XGBoost con características temporales físicas, pero sobre BBM92 y detección binaria, un problema distinto. El propio autor insiste en que estos resultados no establecen una clasificación entre modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; 64 parámetros en formato ONNX ocupan kilobytes.
- GPU recomendadas: ninguna necesaria; puede ejecutarse en CPU.
- Cabe en cualquier GPU de consumo, e incluso en navegador mediante onnxruntime-web.
- Opciones de despliegue: onnxruntime (Python/C++), onnxruntime-web (navegador), y el stack CKKS del proyecto QSMPC-QKD-QHE-AI-Hybrid para la capa cifrada.
- Latencia y throughput: no disponibles. El coste dominante en el modo cifrado es la evaluación CKKS de los 8 productos escalares, no la inferencia lineal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qsh-telecom-ids-ckks-student | 64 | no aplica | Macro F1 0,988 (texto plano, 600 muestras) | Apache-2.0 | ONNX en HF |
| Random forest profesor (telecom_ids.qml) | no disponible | no aplica | Macro F1 0,987 | Apache-2.0 (según repo) | Repo del proyecto |
| QLSTM híbrido de Al-Kuwari et al. | no disponible | no aplica | 94,7% exactitud / F1 | no disponible | Paper IET Quantum Communication |
| XGBoost de IACR ePrint 2026/1282 | no disponible | no aplica | 96,9% recall / 97,6% precisión (BBM92, binario) | no disponible | Paper |

La comparación no es homogénea: los conjuntos de datos, protocolos y espacios de etiquetas difieren, y el propio autor lo señala explícitamente. No se dispone de alternativas directamente equivalentes (modelos lineales para IDS QKD evaluables bajo CKKS) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de prueba de concepto, no de producción; el autor lo declara explícitamente.
- Datos de entrenamiento completamente sintéticos, generados por el propio proyecto; las 7 características son ilustrativas y no están ajustadas a mediciones reales.
- Las métricas se midieron en texto plano; el rendimiento bajo CKKS no se reporta.
- Bajo CKKS, el argmax se toma en claro tras descifrar las 8 puntuaciones, ya que CKKS no tiene comparación nativa. Con estos pesos públicos no expone nada, pero un modelo lineal privado permitiría al tenedor de la clave recuperarlo con aproximadamente tantas consultas como parámetros por clase (Tramer et al., USENIX Security 2016).
- Leer `n_classes_predicted` antes que `macro_f1`: un estudiante lineal que deja de emitir una clase obtiene 0 por construcción, lo que puede interpretarse erróneamente como mala discriminación.
- No hay capturas públicas reales de ataques QKD; la validez ecológica del conjunto es nula fuera del generador propio.
- Sin datos sobre sesgos, alucinación o cobertura idiomática: no aplica al no ser un modelo generativo.
- Licencia Apache-2.0 permite uso comercial, pero el autor no respalda su uso fuera del contexto de demostración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemons-Q/qsh-telecom-ids-ckks-student
- Repositorio del proyecto: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Paper de referencia de clases: https://arxiv.org/abs/2509.14282
- Paper sobre anomalías en receptor QKD experimental: https://arxiv.org/abs/2508.12749
- Paper retirado citado en la model card: https://arxiv.org/abs/2512.05069
- Survey de referencia: Kaissar, Bou Nassif & Bouridane, Future Internet 18(5):234, DOI 10.3390/fi18050234
- Al-Kuwari et al., IET Quantum Communication 7(1), e70028, DOI 10.1049/qtc2.70028
- IACR ePrint 2026/1282 (ancla externa, problema distinto)
