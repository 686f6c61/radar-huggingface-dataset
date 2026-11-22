# LukasKunhardt/pii-filter-small

## Resumen

pii-filter-small es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto multilingüe. Lo desarrolla LukasKunhardt y se distribuye con licencia MIT. Su propósito es sustituir a modelos mucho más grandes en tareas de anonimización y redacción de datos, manteniendo una calidad de detección comparable a un coste computacional muy inferior. Emplea exactamente las 33 etiquetas de `openai/privacy-filter`, lo que permite reutilizar el código existente escrito para ese modelo.

El modelo se ha obtenido por destilación (distillation) a partir de `openai/privacy-filter`, un modelo de 1.400 millones de parámetros, y cuenta con 140.654.241 parámetros, es decir, aproximadamente una décima parte. Se basa en la arquitectura ModernBERT, concretamente en el checkpoint `jhu-clsp/mmBERT-small`, y está pensado para ejecutarse en CPU con latencia baja: según el autor, el archivo int8 es unas diez veces más rápido que privacy-filter ejecutado mediante `transformers` (121 ms frente a 1.281 ms por cada 1.000 caracteres).

Es relevante ahora porque cubre una necesidad creciente de cumplimiento normativo (RGPD, anonimización previa al envío de datos a APIs de terceros, filtrado de logs) con un modelo pequeño, multilingüe (23 idiomas declarados) y desplegable en infraestructura modesta. No obstante, el propio autor advierte de que no supera a privacy-filter y de que los conjuntos de prueba son sintéticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/mmBERT-small`) |
| Parámetros totales | 140.654.241 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (ventana de entrenamiento y prueba; el código del repo lee en ventanas de 512) |
| Tipos de cuantización | int8 (archivo ONNX `onnx/model_int8.onnx`); pesos PyTorch en safetensors |
| Idiomas soportados | en, de, fr, es, it, nl, pt, sv, da, no, fi, pl, cs, ro, tr, ru, ar, hi, ja, zh, ko, id |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (int8) |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de tipo ModernBERT, inicializado desde `jhu-clsp/mmBERT-small`, una variante multilingüe de ModernBERT. La cabeza de salida es de clasificación de tokens con 33 etiquetas en esquema BIOES: ocho categorías (`account_number`, `private_address`, `private_date`, `private_email`, `private_person`, `private_phone`, `private_url`, `secret`), cada una con prefijos B-, I-, E- y S-, más la etiqueta O. La lectura de etiquetas se realiza por argmax por token y posterior unión de spans BIOES.

El entrenamiento se hizo por destilación a partir de `openai/privacy-filter`. El autor fija los conjuntos de prueba, el mapeo de etiquetas y una puerta de calidad (gate) antes de entrenar, y documenta el proceso en el directorio `rules/` del repositorio. La puerta tenía cuatro condiciones: calidad y velocidad se superaron, pero el archivo int8 perdió 0,018 de F1 de caracteres medio frente a los pesos PyTorch, por encima del límite de 0,01 fijado, por lo que los pesos safetensors son el archivo principal y el int8 es opcional. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset de destilación.

## Capacidades

- Detección de PII en texto multilingüe con ocho categorías: números de cuenta/tarjeta/identificación/pasaporte/fiscales, direcciones, fechas, correos electrónicos, personas y nombres de usuario, teléfonos, URLs e IPs, y secretos (contraseñas, PINs, claves de API).
- Clasificación de tokens con etiquetas BIOES compatibles con `openai/privacy-filter`, lo que permite reutilizar código existente.
- Procesamiento por ventanas de 512 tokens mediante la función `read()` del repositorio para textos largos.
- Inferencia en CPU con el archivo int8 ONNX mediante ONNX Runtime.
- Soporte de 23 idiomas declarados, incluyendo lenguas europeas, árabe, hindi, japonés, chino, coreano e indonesio.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente: es exclusivamente un modelo de etiquetado.

## Casos de uso

- Anonimización previa al envío de datos a APIs de terceros: el modelo detecta nombres, correos, teléfonos y secretos en el texto del usuario antes de reenviarlo a un LLM externo, reduciendo la exposición de PII con una latencia de 121 ms por 1.000 caracteres en CPU.
- Filtrado de logs y trazas de aplicación: se puede ejecutar sobre flujos de logs para enmascarar claves de API, contraseñas y direcciones IP antes de almacenarlos o enviarlos a un sistema de observabilidad, gracias a su bajo coste y a la categoría `secret`.
- Cumplimiento del RGPD en pipelines de datos: integrado como etapa de preprocesado en un ETL, redacta PII en documentos antes de persistirlos o de usarlos para análisis, con soporte para 23 idiomas.
- Redacción de documentos en atención al cliente: permite enmascarar datos personales en transcripciones de conversaciones multi-turno, procesando el texto por ventanas de 512 tokens con la función `read()`.
- Preprocesado para datasets de entrenamiento: elimina PII de corpus sintéticos o reales antes de entrenar otros modelos, con la ventaja de que las etiquetas coinciden con las de `openai/privacy-filter` y el código de integración es reutilizable.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPU de consumo, puede ejecutarse en el propio dispositivo (edge) o en servidores sin GPU para tareas de redacción en tiempo real.
- Moderación y revisión de contenido generado: detecta secretos y datos personales en salidas de modelos generativos antes de mostrarlas al usuario final.

## Benchmarks y rendimiento

Los resultados publicados por el autor se miden sobre cuatro conjuntos de prueba sintéticos: ai4privacy/pii-masking-300k (1.200 documentos, 6 idiomas), nvidia/Nemotron-PII (1.000, inglés), DataikuNLP/kiji-pii-training-data (900, 6 idiomas) y gretelai/synthetic_pii_finance_multilingual (1.050, 7 idiomas).

F1 de caracteres:

| Modelo | ai4privacy | Nemotron | Kiji | Gretel | Media |
|---|---|---|---|---|---|
| pii-filter-small (seed 43) | 0,929 | 0,817 | 0,830 | 0,661 | 0,809 |
| pii-filter-small, media de 3 seeds | 0,931 | 0,813 | 0,833 | 0,660 | 0,809 |
| pii-filter-small, int8 ONNX | 0,915 | 0,791 | 0,815 | 0,645 | 0,791 |
| privacy-filter, decodificador oficial `opf` | 0,952 | 0,823 | 0,832 | 0,637 | 0,811 |
| privacy-filter vía `transformers` (argmax) | 0,868 | 0,696 | 0,737 | 0,606 | 0,726 |

F1 de spans:

| Modelo | ai4privacy | Nemotron | Kiji | Gretel | Media |
|---|---|---|---|---|---|
| pii-filter-small (seed 43) | 0,735 | 0,613 | 0,374 | 0,429 | 0,538 |
| pii-filter-small, int8 ONNX | 0,686 | 0,583 | 0,352 | 0,388 | 0,502 |
| privacy-filter, decodificador oficial `opf` | 0,883 | 0,661 | 0,397 | 0,465 | 0,601 |
| privacy-filter vía `transformers` (argmax) | 0,735 | 0,471 | 0,327 | 0,353 | 0,471 |

Velocidad sobre 50 documentos Nemotron con 3 hilos de CPU: int8 ONNX 121 ms por 1.000 caracteres, pesos PyTorch 225 ms, privacy-filter vía `opf` 16.894 ms.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 140,7 millones de parámetros en fp32 los pesos ocupan unos 0,56 GB, y en int8 aproximadamente 0,14 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; el modelo está diseñado principalmente para CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) y también en CPU.
- Opciones de despliegue: `transformers` (pipeline de token-classification), ONNX Runtime con `onnx/model_int8.onnx`, y la función `read()` del repositorio para textos largos. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a un encoder de clasificación.
- Latencia y throughput: 121 ms por 1.000 caracteres con int8 ONNX y 225 ms con PyTorch, ambos con 3 hilos de CPU; cifras de throughput en GPU no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 caracteres medio | F1 spans medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pii-filter-small | 140,7 M | 512 tokens | 0,809 | 0,538 | MIT | Hugging Face |
| openai/privacy-filter | 1.400 M | no disponible | 0,811 (con `opf`) | 0,601 (con `opf`) | no disponible en la información | Hugging Face |
| privacy-filter vía `transformers` | 1.400 M | no disponible | 0,726 | 0,471 | no disponible en la información | Hugging Face |

No se dispone de datos de otros modelos comparables de detección de PII en la información proporcionada.

## Limitaciones y advertencias

- No se ha probado en notas clínicas, en idiomas fuera de los ocho idiomas de prueba ni en datos reales; los cuatro conjuntos de prueba son sintéticos.
- El autor reconoce que no supera a privacy-filter: gana en Gretel pero pierde en ai4privacy, y sus límites de span son peores en todos los conjuntos.
- Los números con espacios largos presentan problemas según las pruebas del propio autor (la descripción de esta limitación queda truncada en la información disponible).
- El archivo int8 pierde 0,018 de F1 de caracteres medio frente a los pesos PyTorch, por encima del umbral de 0,01 fijado en la puerta de calidad; úsese con cautela cuando la precisión sea crítica.
- `aggregation_strategy="simple"` de `transformers` no interpreta las etiquetas E- y S- y divide spans; es necesario unir manualmente los tokens BIOES o usar la función `read()` del repositorio.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y negativos en la detección; no se han publicado métricas de sesgo.
- Licencia MIT: permite uso comercial, pero el modelo deriva de `openai/privacy-filter` y no está afiliado a OpenAI; conviene revisar las condiciones del modelo base.
- Para producción, validar sobre datos reales del dominio antes de confiar en la redacción automática.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LukasKunhardt/pii-filter-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo de referencia: https://huggingface.co/openai/privacy-filter
- Resultados detallados: RESULTS.md en el repositorio del modelo
- Reglas y mapeo de etiquetas: directorio `rules/` del repositorio del modelo
- Código de lectura por ventanas: directorio `code/` del repositorio del modelo
