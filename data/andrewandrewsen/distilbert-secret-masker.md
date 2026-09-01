# AndrewAndrewsen/distilbert-secret-masker

## Resumen

`distilbert-secret-masker` es un modelo de clasificación de tokens (NER) desarrollado por AndrewAndrewsen, especializado en la detección y enmascarado de secretos (claves API, tokens de acceso, credenciales) en texto. Se basa en `distilbert-base-uncased`, una versión destilada de BERT con 66 millones de parámetros, y se ha afinado específicamente para la tarea de detección de secretos en textos cortos y medianos (hasta 512 tokens).

El modelo actúa como el "experto rápido" dentro del sistema SecMask, una arquitectura de mezcla de expertos (MoE) que combina este modelo con un experto de contexto largo (Longformer, 2048 tokens) para cubrir diferentes longitudes de texto. Su relevancia radica en que ofrece una latencia muy baja (11 ms P50 en CPU) y una alta precisión (82% solo NER, 92,3% con filtros post-procesado), lo que lo hace adecuado para entornos de producción donde se necesita enmascarar credenciales en tiempo real.

La versión publicada corresponde al release v2, que el autor mantiene por reproducibilidad, aunque recomienda usar la versión v3.3a-RS para nuevos despliegues. El modelo está disponible bajo licencia Apache 2.0 y se distribuye en formato safetensors y ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 hidden) |
| Parametros totales | 66.365.187 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DistilBERT, un transformer encoder destilado de BERT mediante knowledge distillation, que conserva el 95% del rendimiento de BERT con un 40% menos de parámetros y un 60% menos de latencia. La capa de clasificación se ha adaptado para la tarea de token-classification, etiquetando cada token como parte de un secreto o no.

El entrenamiento se realizó sobre un dataset personalizado (denominado "SecretMask v2" en los benchmarks), que incluye ejemplos de diferentes tipos de secretos: claves AWS, tokens de GitHub, JWTs, claves API genéricas, bloques PEM, secretos de Kubernetes y credenciales de bases de datos. No se especifica el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El modelo se afinó a partir de los pesos de `distilbert-base-uncased`.

Una innovación destacable es su integración en el sistema SecMask, que utiliza un enrutamiento heurístico (con parámetro tau) para decidir si una solicitud se procesa con este modelo rápido o con el experto largo, optimizando así la latencia y el coste computacional.

## Capacidades

- Detección de secretos mediante NER: identifica y clasifica claves API, tokens de acceso, credenciales y otros secretos en texto.
- Soporte para múltiples tipos de secretos: AWS Access Keys (F1 0,92), GitHub Personal Tokens (F1 0,88), JWT Tokens (F1 0,85), API keys genéricas (F1 0,79), bloques PEM (F1 0,95), secretos de Kubernetes (F1 0,81) y credenciales de bases de datos (F1 0,74).
- Enmascarado de secretos: puede sustituir los secretos detectados por marcadores como `[SECRET]` para evitar fugas de información.
- Integración con el sistema SecMask MoE: funciona como experto rápido para textos de hasta 512 tokens, con enrutamiento automático hacia el experto largo cuando el contexto es mayor.
- Inferencia de baja latencia: 11 ms P50, 14 ms P90 y 17 ms P99 en CPU, con un throughput de 84 peticiones por segundo.
- Post-procesado con filtros: combinado con filtros de patrones (PEM, K8s, regex), alcanza una precisión del 92,3% y un recall del 80%.

## Casos de uso

- Prevención de fugas de secretos en CI/CD: integrar el modelo en pipelines de integración continua para escanear código, logs y artefactos en busca de credenciales antes de su publicación, evitando filtraciones accidentales.
- Enmascarado de secretos en logs de aplicaciones: procesar los logs generados por aplicaciones en producción para detectar y enmascarar claves API o tokens antes de su almacenamiento o envío a sistemas de monitorización.
- Redacción de documentos y correos internos: analizar documentos, correos o wikis internas para detectar y redactar credenciales antes de compartirlos con terceros o hacerlos públicos.
- Auditoría de seguridad de repositorios: escanear repositorios de código existentes (histórico incluido) para identificar secretos expuestos y generar informes de riesgo.
- Sanitización de datasets para entrenamiento de modelos: limpiar datasets que contengan texto con credenciales antes de usarlos para entrenar otros modelos de lenguaje, evitando que los modelos aprendan a reproducir secretos.
- Filtrado de secretos en chatbots y asistentes: integrar el modelo en sistemas de atención al cliente o asistentes virtuales para detectar y enmascarar credenciales que los usuarios puedan pegar en conversaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (dataset SecretMask v2, 600 ejemplos de test):

| Metrica | Valor |
|---|---|
| F1 Score | 0,52 |
| Precision | 0,82 |
| Recall | 0,38 |

El autor también reporta métricas adicionales en la model card, no incluidas en el model-index oficial:

| Configuracion | F1 | Precision | Recall |
|---|---|---|---|
| NER solo | 0,52 | 82% | 38% |
| Con filtros post-procesado | 0,857 | 92,3% | 80% |

No se han publicado comparaciones con otros modelos de detección de secretos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 66M parámetros, requiere aproximadamente 265 MB en FP32. Con cuantización a 8 bits, podría reducirse a unos 70-80 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (ej. NVIDIA GTX 1650, RTX 3050). También funciona en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna.
- Opciones de despliegue: transformers pipeline, ONNX Runtime, SecMask MoE (repositorio GitHub), endpoints compatibles con Hugging Face.
- Latencia y throughput: 11 ms P50, 14 ms P90, 17 ms P99 en CPU; 84 peticiones por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Recall | Licencia |
|---|---|---|---|---|---|
| distilbert-secret-masker (v2) | 66M | 512 | 82% (NER) / 92,3% (con filtros) | 38% (NER) / 80% (con filtros) | Apache 2.0 |
| distilbert-secret-masker-v3.3a-rs | no disponible | no disponible | no disponible | no disponible | no disponible |
| gitleaks (herramienta basada en regex) | no aplica | no aplica | no disponible | no disponible | MIT |

No se dispone de datos de benchmarks comparativos con otros modelos NER de detección de secretos en la información proporcionada.

## Limitaciones y advertencias

- Recall bajo en solitario: el modelo NER solo alcanza un recall del 38%, lo que significa que deja de detectar muchos secretos. Es imprescindible combinarlo con filtros post-procesado para uso en producción.
- Solo inglés: el modelo está entrenado únicamente con texto en inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- Contexto limitado a 512 tokens: no puede procesar documentos largos de una sola vez; para textos más extensos se necesita el experto largo del sistema SecMask.
- Riesgo de falsos positivos: con una precisión del 82% (solo NER), aproximadamente 1 de cada 5 detecciones puede ser un falso positivo, lo que podría llevar a enmascarar texto que no es un secreto.
- Versión v2 desactualizada: el autor recomienda usar la versión v3.3a-rs para nuevos despliegues, ya que esta versión v2 se mantiene solo por reproducibilidad.
- Sin garantías de seguridad: aunque el modelo está diseñado para detección de secretos, no debe considerarse una solución de seguridad completa; debe complementarse con otras herramientas de escaneo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AndrewAndrewsen/distilbert-secret-masker
- Repositorio del modelo (archivos): https://huggingface.co/AndrewAndrewsen/distilbert-secret-masker/tree/main
- Repositorio SecMask en GitHub: https://github.com/AndrewAndrewsen/secmask
- Modelo recomendado (v3.3a-rs): https://huggingface.co/AndrewAndrewsen/distilbert-secret-masker-v3.3a-rs
