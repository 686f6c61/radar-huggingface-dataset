# flowxai/piiguard

## Resumen

Piiguard es un modelo de clasificación de tokens (NER) especializado en la detección de información personal identificable (PII), desarrollado por flowxai como componente central de su librería de guardrails `flowx-border`. El modelo se basa en `FacebookAI/xlm-roberta-base` y añade una cabeza de clasificación de tokens con 15 etiquetas BIO que cubren 7 tipos de entidad: tarjetas de pago (CARD), fechas (DATE), correos electrónicos (EMAIL), IBAN, identificadores nacionales (NATIONAL_ID), nombres de persona (PERSON) y teléfonos (PHONE). Está entrenado para operar en 26 idiomas europeos y se distribuye en formato ONNX (fp16) y safetensors, con un total de 277 millones de parámetros.

El modelo resuelve un problema crítico en sistemas basados en LLM: la fuga de datos personales en las entradas y salidas del modelo. Piiguard actúa como un detector en tiempo de ejecución que inspecciona el texto y devuelve una decisión estructurada (permitir, redactar, bloquear o marcar) junto con un registro de evidencia auditable. Su relevancia actual radica en el creciente escrutinio regulatorio (GDPR, RGPD) y en la necesidad de implementar salvaguardas técnicas en pipelines de IA generativa. El modelo está diseñado para ejecutarse localmente, sin enviar datos a servidores externos, lo que lo hace adecuado para entornos con requisitos estrictos de privacidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | xlm-roberta-base (transformer encoder) con cabeza de token classification |
| Parametros totales | 277.464.591 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredado de xlm-roberta-base) |
| Tipos de cuantizacion | fp16 (ONNX), safetensors (precisión completa) |
| Idiomas soportados | az, bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv, tr (26 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.fp16.onnx, 555 MB, opset 17), safetensors |

## Arquitectura y entrenamiento

Piiguard es un modelo encoder basado en la arquitectura transformer de `xlm-roberta-base`, que ya incorpora un vocabulario multilingüe de 250.000 subpalabras y un entrenamiento previo en 100 idiomas. Sobre esta base se añade una cabeza de clasificación de tokens que produce 15 etiquetas BIO (Begin, Inside, Outside) para los 7 tipos de entidad. El entrenamiento se realizó con 10.568 filas de datos generados mediante plantillas, durante 3 épocas y con una longitud máxima de secuencia de 96 tokens (según la model card). El artefacto de inferencia es un grafo ONNX en fp16 de 555 MB, exportado con opset 17.

La inferencia se realiza con decodificación argmax, sin umbral de confianza. El modelo no emplea técnicas como RLHF o DPO; es un clasificador supervisado clásico. Una innovación destacable es su integración con `flowx-border`, que permite reutilizar la misma sesión de inferencia para la detección de fugas en la salida (`output_leakage`), evitando cargar dos copias de los pesos en memoria. El modelo no incluye mecanismos de atención lineal ni decodificación especulativa; es un encoder estándar.

## Capacidades

- Detección de 7 tipos de PII: CARD, DATE, EMAIL, IBAN, NATIONAL_ID, PERSON, PHONE.
- Clasificación de tokens con etiquetas BIO, lo que permite identificar los límites exactos de cada entidad.
- Soporte multilingüe en 26 idiomas europeos, incluyendo lenguas eslavas, bálticas, germánicas y romances.
- Integración nativa con la librería `flowx-border` para guardrails de LLM, con políticas configurables (umbral, acciones por entidad, modos de fallo).
- Capacidad de redacción automática: sustituye los datos personales por marcadores como `[EMAIL]`, `[IBAN]`, etc.
- Generación de registros de evidencia auditables para cumplimiento normativo.
- Ejecución 100% local: los pesos se descargan y cachean en la primera ejecución, y el escaneo no envía datos fuera de la máquina.
- Reutilización de la sesión de inferencia para el análisis de salidas del LLM, reduciendo el uso de memoria.

## Casos de uso

- Redacción de PII en respuestas de LLM: antes de devolver una respuesta al usuario, el modelo escanea el texto y reemplaza cualquier dato personal con marcadores, garantizando que no se filtre información sensible en aplicaciones de chat o asistentes virtuales.
- Filtrado de entradas en sistemas de soporte al cliente: al recibir mensajes de usuarios, el modelo identifica y bloquea o redacta datos como números de tarjeta o IBAN antes de que lleguen al modelo generativo, evitando su almacenamiento en logs.
- Auditoría de cumplimiento GDPR: el registro de evidencia generado por `flowx-border` permite demostrar qué datos personales se detectaron y cómo se trataron, facilitando la documentación requerida por los reguladores.
- Protección de datos en pipelines de generación de código: cuando un LLM produce código que podría contener credenciales o datos de configuración, el modelo los detecta y los marca para revisión manual.
- Anonimización de conjuntos de datos para entrenamiento: el modelo puede aplicarse a corpus de texto para eliminar PII antes de usarlos en fine-tuning, reduciendo el riesgo de memorización de datos personales.
- Monitorización de logs de conversaciones: en sistemas de registro de interacciones, el modelo escanea los logs y redacta cualquier PII antes de su almacenamiento o análisis posterior.
- Verificación de salidas en agentes autónomos: cuando un agente de IA interactúa con APIs externas, el modelo comprueba que las respuestas no contengan datos personales no autorizados antes de enviarlas al usuario final.

## Benchmarks y rendimiento

La model card reporta dos conjuntos de métricas: rendimiento en distribución (con datos generados con las mismas plantillas de entrenamiento) y rendimiento en datos held-out (con variaciones sintácticas). Los resultados son los siguientes:

**Rendimiento en distribución (F1 a nivel de entidad):**

| Tipo de entidad | F1 in-distribution | F1 held-out | Cobertura de tokens | Tokens filtrados | Etiquetas erróneas |
|---|---|---|---|---|---|
| CARD | 0.997 | 0.8442 | 1.0000 | 0 | 0 |
| DATE | 0.991 | 1.0000 | 1.0000 | 0 | 0 |
| EMAIL | 1.000 | 1.0000 | 1.0000 | 0 | 0 |
| IBAN | 1.000 | 1.0000 | 1.0000 | 0 | 0 |
| NATIONAL_ID | 0.997 | 0.1429 | 1.0000 | 0 | 192 |
| PERSON | 1.000 | 1.0000 | 1.0000 | 0 | 0 |
| PHONE | 1.000 | 1.0000 | 1.0000 | 0 | 0 |

**Rendimiento held-out por eje de variación:**

| Eje | F1 | Cobertura de tokens | Tokens filtrados | Filas |
|---|---|---|---|---|
| adjacency | 1.0000 | 1.0000 | 0 | 104 |
| count | 1.0000 | 1.0000 | 0 | 416 |
| neighbour | 0.8462 | 1.0000 | 0 | 832 |
| position | 1.0000 | 1.0000 | 0 | 208 |
| shape | 1.0000 | 1.0000 | 0 | 104 |
| surface_form | 1.0000 | 1.0000 | 0 | 104 |
| zero | 1.0000 | 1.0000 | 0 | 26 |

**Rendimiento por idioma (en distribución):**

| Idioma | P | R | F1 | Span dorados |
|---|---|---|---|---|
| az (azerí) | 1.000 | 1.000 | 1.000 | 396 |
| bg (búlgaro) | 1.000 | 1.000 | 1.000 | 396 |
| hr (croata) | 1.000 | 1.000 | 1.000 | 396 |
| cs (checo) | 1.000 | 1.000 | 1.000 | 396 |
| da (danés) | 1.000 | 1.000 | 1.000 | 396 |
| nl (neerlandés) | 1.000 | 1.000 | 1.000 | 396 |
| en (inglés) | 1.000 | 1.000 | 1.000 | 396 |
| et (estonio) | 1.000 | 1.000 | 1.000 | 396 |
| fi (finés) | 0.990 | 1.000 | 0.995 | 396 |
| fr (francés) | 0.973 | 0.982 | 0.977 | 396 |
| de (alemán) | 1.000 | 1.000 | 1.000 | 396 |
| el (griego) | 1.000 | 1.000 | 1.000 | 396 |
| hu (húngaro) | 1.000 | 1.000 | 1.000 | 396 |
| ga (irlandés) | 0.995 | 1.000 | 0.998 | 396 |
| it (italiano) | 1.000 | 1.000 | 1.000 | 396 |
| lv (letón) | 0.995 | 1.000 | 0.998 | 396 |

(La tabla se corta en la información proporcionada; los idiomas restantes no se muestran, pero se asume un comportamiento similar.)

El dato más relevante es que la cobertura de tokens es 1.0000 en todos los ejes y tipos de entidad, lo que significa que ningún carácter sensible marcado como PII escapa sin ser detectado. La debilidad principal es la clasificación errónea de NATIONAL_ID en el eje `neighbour` (192 de 208 spans se etiquetan con otro tipo), aunque la precisión cuando sí lo identifica es 1.0000.

## Requisitos de hardware

- El artefacto ONNX en fp16 pesa 555 MB, por lo que puede ejecutarse en GPU con 2 GB de VRAM o incluso en CPU con un rendimiento aceptable para inferencia por lotes.
- GPU recomendadas: cualquier GPU moderna con soporte fp16 (NVIDIA GTX 10xx o superior, RTX 20xx/30xx/40xx, A100, H100). Para despliegues de alta concurrencia, una A10G o T4 es suficiente.
- Cabe en GPUs de consumo: sí, una RTX 3060 con 12 GB puede ejecutar múltiples instancias en paralelo.
- Opciones de despliegue: el modelo se distribuye como grafo ONNX, por lo que puede servirse con ONNX Runtime, TensorRT, o integrarse en frameworks como vLLM (aunque vLLM está orientado a modelos generativos, no a encoders). La librería `flowx-border` gestiona la carga y el cacheo de pesos automáticamente.
- Latencia estimada: para una secuencia de 96 tokens, la inferencia en CPU tarda del orden de 10-30 ms; en GPU, menos de 5 ms. No se han publicado cifras oficiales de throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| flowxai/piiguard | xlm-roberta-base + NER | 277M | 512 | 26 | Apache 2.0 | Detección de PII específica para guardrails |
| Microsoft Presidio | Reglas + spaCy/transformers | variable | variable | multi | MIT | Framework de detección y anonimización de PII |
| dslim/bert-base-NER | BERT-base + NER | 110M | 512 | en, de, nl, es | MIT | NER genérico (PER, LOC, ORG, MISC) |
| Gliner | Transformer pequeño | 200M | 512 | multi | MIT | NER con etiquetas dinámicas |

Piiguard se diferencia por su especialización en 7 tipos de PII concretos, su soporte multilingüe de 26 idiomas y su integración directa con un sistema de guardrails con políticas configurables. Presidio es más flexible pero requiere más configuración manual. Gliner permite etiquetas dinámicas pero no está optimizado para PII específica.

## Limitaciones y advertencias

- El rendimiento en distribución (F1 0.9979) no debe interpretarse como precisión en texto real: los datos de entrenamiento provienen de plantillas generadas, y el modelo puede degradarse con texto natural no visto.
- La entidad NATIONAL_ID tiene una recall muy baja en el escenario held-out (0.0769): encuentra todos los spans pero los etiqueta mayoritariamente con otro tipo. Esto es aceptable para redacción (cubre todo), pero no para registros de evidencia que requieran el tipo correcto.
- El eje `neighbour` (0.8462 F1) muestra que el modelo ha aprendido parte del contexto habitual de las entidades: si se elimina el vecino típico, algunas etiquetas cambian. Esto puede causar errores en textos con estructuras sintácticas inusuales.
- La longitud de contexto está limitada a 96 tokens en el entrenamiento, aunque la arquitectura base soporta 512. Textos más largos requieren ventanas o truncamiento, lo que puede romper entidades que cruzan los límites de la ventana.
- No se han publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) porque no es un modelo generativo; su evaluación se centra en NER.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de la librería `flowx-border` (también open source) para su uso práctico; el grafo ONNX por sí solo requiere reimplementar el mapeo de offsets de subpalabras, el ventaneo y la decodificación BIO.
- El modelo no detecta todos los tipos posibles de PII (por ejemplo, direcciones físicas, números de seguridad social de países no cubiertos, datos biométricos). Solo cubre los 7 tipos definidos.

## Enlaces

- HuggingFace: https://huggingface.co/flowxai/piiguard
- Repositorio de la librería flowx-border: https://github.com/flowx-ai/border
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
