# anguoyang/midas-qcs6490

## Resumen

MiDaS es un modelo de estimación de profundidad monocular desarrollado originalmente por Intel ISL. Esta ficha concreta no contiene pesos ni artefactos del modelo, sino una medición independiente de terceros del rendimiento de MiDaS (variante small) sobre el SoC Qualcomm QCS6490, embebido en el kit Dragonwing RB3 Gen 2 Vision Kit. La publicación la firma el usuario anguoyang dentro de un barrido de 28 modelos y 14 categorías ejecutado con un arnés uniforme.

El dato central es una latencia de inferencia estimada de 36,6 ms (36.569 µs) para una entrada de imagen de 1 × 3 × 256 × 256 y una salida de mapa de profundidad relativa de 1 × 256 × 256, medida en fp32 ONNX sobre el runtime QNN con las opciones de compilación por defecto de Qualcomm AI Hub, sin cuantización explícita. El autor la contrasta con las cifras upstream de `perf.yaml` (0.66.0) para el mismo dispositivo bajo W8A8, que se sitúan en 3,9–4,3 ms según runtime y con todas las capas en NPU; la brecha de aproximadamente 9x corresponde al coste esperado de fp32 frente a W8A8 y ambas cifras no son directamente comparables.

La relevancia de esta ficha es metodológica: aporta un punto de referencia fp32 reproducible para MiDaS en hardware edge de Qualcomm, con identificadores de job de compilación (`jpx8kxd35`) y perfilado (`j5m1n8dd5`), y sirve como base de comparación homogénea frente al resto del barrido. No documenta arquitectura propia, entrenamiento ni benchmarks de calidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (MiDaS, estimacion de profundidad monocular; variante small segun la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 1 × 3 × 256 × 256) |
| Tipos de cuantizacion | fp32 (medido en esta ficha); W8A8 con todas las capas en NPU (cifras upstream de `perf.yaml` 0.66.0) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT (licencia upstream del modelo); esta ficha publica solo numeros y metodo, sin pesos ni artefactos compilados |
| Formato de pesos | ONNX exportado desde la definicion `midas` de `qai-hub-models` 0.66.0 (66.396.920 bytes); no se distribuyen pesos en esta ficha |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna de MiDaS en la informacion disponible. La model card describe exclusivamente el protocolo de medicion: exportacion a ONNX desde la definicion `midas` de `qai-hub-models` 0.66.0, compilacion con las opciones por defecto de Qualcomm AI Hub sin cuantizacion explicita, y perfilado de un unico grafo mediante la API de AI Hub (`submit_inference_job(..., profile=True)`).

La metrica reportada es `execution_summary.estimated_inference_time` del job de perfilado, es decir, una estimacion por grafo y no una latencia de aplicacion de extremo a extremo. No hay datos sobre volumen de entrenamiento, composicion del dataset, ni tecnicas de ajuste (RLHF, DPO u otras) en la informacion disponible.

## Capacidades

- Estimacion de profundidad relativa monocular a partir de una unica imagen RGB.
- Entrada fija de 1 × 3 × 256 × 256 y salida de mapa de profundidad relativa de 1 × 256 × 256.
- Ejecucion en NPU del QCS6490 mediante el runtime QNN.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni multilingues en la informacion disponible.

## Casos de uso

- Percepcion de profundidad en robotica movil edge: el modelo produce un mapa de profundidad relativa de 256 × 256 en 36,6 ms en fp32 sobre el QCS6490, lo que permite integrarlo en bucles de navegacion o evitacion de obstaculos a bordo del Dragonwing RB3 Gen 2 sin depender de la nube.
- Vision estereo asistida y reconstruccion 3D de bajo coste: la profundidad relativa sirve como inicializacion o regularizacion en pipelines de fotogrametria y SLAM monocular en dispositivos con presupuesto termico limitado.
- Segmentacion por profundidad en camaras inteligentes: separar primer plano y fondo en tiempo real para desenfoque o recorte en dispositivos de videovigilancia y domotica basados en QCS6490.
- Evaluacion comparativa de hardware edge: el numero fp32 (36,6 ms) actua como referencia reproducible frente a la configuracion W8A8 (3,9–4,3 ms) del `perf.yaml` upstream, util para decidir el coste de precision frente a latencia en el despliegue.
- Automocion y ADAS de bajo consumo: estimacion de distancia relativa a obstaculos en cuadros de 256 × 256 con latencias compatibles con frecuencias de refresco de decenas de hercios.
- Investigacion en eficiencia de modelos de vision: al formar parte de un barrido uniforme de 28 modelos y 14 categorias, permite comparar MiDaS con otras tareas de vision bajo el mismo arnes y dispositivo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 36,6 ms (36.569 µs) |
| Entrada | 1 × 3 × 256 × 256 |
| Salida | 1 × 256 × 256 mapa de profundidad relativa |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precision | fp32 ONNX, opciones por defecto de AI Hub (sin cuantizacion explicita) |
| Fecha de medicion | 2026-11-21 |
| Referencia upstream W8A8 (`perf.yaml` 0.66.0) | 3,9–4,3 ms segun runtime, todas las capas en NPU |

No se han publicado resultados de benchmarks de calidad (como metricas de error de profundidad) en la informacion disponible.

## Requisitos de hardware

- Dispositivo de referencia medido: Dragonwing RB3 Gen 2 Vision Kit con SoC Qualcomm QCS6490 y aceleracion NPU via runtime QNN.
- Precision medida: fp32 ONNX con compilacion por defecto de Qualcomm AI Hub; tamano del ONNX exportado: 66.396.920 bytes.
- VRAM estimada: no disponible (el modelo se ejecuta en el NPU del SoC, no en GPU de escritorio).
- GPU recomendadas: no aplica para el despliegue medido; no se proporcionan datos para A100, H100 o RTX 4090.
- Cabe en GPU consumer: no disponible.
- Opciones de despliegue: Qualcomm AI Hub (compilacion y perfilado via API), runtime QNN en el dispositivo; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: 36,6 ms por inferencia en fp32 sobre QCS6490 (estimacion por grafo, no latencia de aplicacion de extremo a extremo); no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision medida | Latencia en QCS6490 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiDaS small (esta ficha) | no disponible | 1 × 3 × 256 × 256 | fp32 ONNX | 36,6 ms | MIT (upstream) | Medicion publicada; sin pesos en esta ficha |
| MiDaS small (upstream `perf.yaml` 0.66.0) | no disponible | 1 × 3 × 256 × 256 | W8A8, todas las capas en NPU | 3,9–4,3 ms segun runtime | MIT | Pesos y artefactos via `qai-hub-models` |
| Otros modelos del barrido qcs-bench | no disponible | no disponible | fp32 uniforme | no disponible en esta ficha | no disponible | Coleccion en `qcs-model-zoo` |

No se dispone de datos de otros modelos de estimacion de profundidad monocular comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cifra de 36,6 ms es una estimacion por grafo obtenida del job de perfilado, no una latencia de aplicacion de extremo a extremo; no debe usarse como metrica de produccion sin validacion adicional.
- La comparacion directa con las cifras upstream W8A8 (3,9–4,3 ms) no es valida: la brecha de aproximadamente 9x refleja la diferencia de precision (fp32 frente a W8A8), no una regresion del modelo.
- Esta ficha no publica pesos ni artefactos compilados; solo numeros y metodo. Cualquier uso en produccion requiere obtener el modelo desde las fuentes upstream.
- La licencia MIT corresponde al modelo upstream; esta ficha no otorga derechos adicionales sobre pesos o artefactos.
- No hay informacion sobre sesgos, riesgo de alucinacion (no aplica a un modelo de profundidad), limitaciones de idioma ni caveats de calidad del mapa de profundidad en la informacion disponible.
- El modelo esta medido exclusivamente en el QCS6490; no se documenta su comportamiento en otros SoC o aceleradores.

## Enlaces

- Hugging Face: https://huggingface.co/anguoyang/midas-qcs6490
- Repositorio de la coleccion medida: https://github.com/anguoyang/qcs-model-zoo
- Seguimiento del barrido completo: https://github.com/anguoyang/qcs-bench
- Qualcomm AI Hub (referenciado en la metodologia): https://aihub.qualcomm.com
- Paquete `qai-hub-models` (referenciado, version 0.66.0): no disponible como enlace directo en la informacion proporcionada
