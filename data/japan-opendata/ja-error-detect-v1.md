# japan-opendata/ja-error-detect-v1

## Resumen

ja-error-detect-v1 es un modelo de clasificación de tokens (token classification) especializado en la detección de errores en texto japonés, desarrollado por Japan Open Data Lab (japan-opendata). Su función es identificar los fragmentos (spans) de una frase que probablemente contienen un error de escritura, sin proponer correcciones. Está pensado como componente de preinspección en herramientas de corrección ortotipográfica o como sistema de alertas en asistentes de escritura.

El modelo se construye sobre tohoku-nlp/bert-base-japanese-v3, un BERT base adaptado al japonés, y cuenta con 110.618.883 parámetros. Detecta seis categorías de error: sustitución de partículas, conversión errónea de homófonos, errores de okurigana (kana de terminación), sustitución por kanji de forma similar, omisión de caracteres (脱字) y caracteres sobrantes (衍字). No trata como error las variantes dialectales, de registro ni las expresiones coloquiales.

Su relevancia radica en que aborda una tarea concreta y poco cubierta —la detección de spans erróneos en japonés— con métricas publicadas sobre un conjunto de test sellado de 5.000 ejemplos y con una implementación ONNX FP32 que corre en CPU a unos 20 ms por frase. La licencia Apache 2.0 y el tamaño reducido lo hacen apto para integrarse en pipelines de producción sin requisitos de GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), clasificación de tokens |
| Parámetros totales | 110.618.883 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo base BERT, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantización | ONNX FP32 incluido; no se documentan otras cuantizaciones |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (onnx/model.onnx, FP32) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base fine-tuneado para clasificación de tokens sobre tohoku-nlp/bert-base-japanese-v3. La salida es una distribución de probabilidad por token, donde la etiqueta 0 corresponde a "normal" (O) y el resto a token erróneo; la probabilidad de error se calcula como 1 menos la probabilidad de la clase 0. La decodificación de spans se realiza agrupando tokens consecutivos con probabilidad superior a 0,5 y filtrando los spans cuya media de probabilidad no alcanza el umbral de 0,80, valor fijado previamente sobre el conjunto de desarrollo y empaquetado en inference_config.json.

El entrenamiento se basa en datos sintéticos: se tomaron frases de FineWeb-2 en japonés (licencia ODC-By 1.0) y se les inyectaron programáticamente los seis tipos de error que el modelo detecta. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de clasificación de este tipo). La model card advierte explícitamente que, al entrenar sobre errores sintéticos, el rendimiento sobre corpus de errores reales será previsiblemente inferior al reportado.

## Capacidades

- Detección de spans erróneos en texto japonés en seis categorías: sustitución de partículas, homófonos mal convertidos, okurigana incorrecta, kanji de forma similar, omisión de caracteres y caracteres sobrantes.
- Salida a nivel de token con probabilidades, lo que permite ajustar el umbral de decisión según la aplicación.
- Implementación de referencia en PyTorch (transformers) y versión ONNX FP32 con paridad de predicción verificada frente a PyTorch en 200 ejemplos de desarrollo y 200 de test sellado (coincidencia total).
- Inferencia en CPU con latencia de aproximadamente 20 ms por frase media (Core i7-11700F).
- No genera correcciones ni texto: únicamente señala ubicaciones sospechosas.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente; es un modelo discriminativo, no generativo.
- No soporta visión, audio ni modo de razonamiento explícito.
- Monolingüe: solo japonés.

## Casos de uso

- Preinspección en herramientas de corrección: el modelo marca los spans sospechosos y un corrector posterior (o un humano) decide la corrección. Adecuado por su alta precisión (0,9094) y su bajo coste de inferencia en CPU.
- Alertas en asistentes de escritura: integrado en un editor, puede subrayar fragmentos dudosos en tiempo real; los 20 ms por frase en CPU permiten respuesta interactiva sin GPU.
- Filtrado previo en pipelines de revisión editorial: procesar lotes de textos y priorizar los que contienen candidatos a error, reduciendo el volumen que llega a revisores humanos.
- Control de calidad en generación de contenido: detectar errores tipográficos o de conversión de kanji en textos producidos por otros sistemas antes de su publicación.
- Normalización de corpus: identificar y aislar fragmentos con posibles erratas en datasets japoneses antes de usarlos para entrenamiento o análisis.
- Despliegue en entornos sin GPU: gracias al ONNX FP32 y a los 110 M de parámetros, puede ejecutarse en servidores CPU modestos o en el propio dispositivo del usuario.
- Análisis de errores por categoría: las seis etiquetas permiten construir estadísticas sobre qué tipo de error predomina en un corpus, útil para diagnóstico de calidad lingüística.

## Benchmarks y rendimiento

Resultados sobre test sellado de 5.000 ejemplos, con umbral fijado previamente sobre el conjunto de desarrollo:

| Métrica | Valor |
|---|---|
| Coincidencia exacta de spans erróneos — Precision | 0,9094 |
| Coincidencia exacta de spans erróneos — Recall | 0,8291 |
| Coincidencia exacta de spans erróneos — F1 | 0,8674 |
| F1 okurigana | 0,9573 |
| F1 kanji de forma similar | 0,9285 |
| F1 partículas | 0,8880 |
| F1 omisión de caracteres (脱字) | 0,8596 |
| F1 homófonos | 0,8436 |
| F1 caracteres sobrantes (衍字) | 0,7686 |

Falsos positivos sobre frases normales: de 65 spans detectados, la revisión manual determinó que 29 eran errores reales en el texto original (mal etiquetado como normal) y 36 eran falsos positivos verdaderos. La tasa corregida es de 0,2538 falsos positivos por cada 1.000 caracteres, o 1,20 % por frase (frente al 0,4582 y 2,13 % del recuento automático sin corregir). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; con 110 M de parámetros en FP32 ocupa aproximadamente 0,44 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no necesarias; cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo, pero el caso de uso previsto es CPU.
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 3060, RTX 4090, etc.), aunque no aporta ventaja frente a CPU para este tamaño.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (modelo onnx/model.onnx incluido), y cualquier runtime compatible con BERT (por ejemplo, servicios de inferencia ONNX). No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia: aproximadamente 20 ms por frase media en CPU (Core i7-11700F) con la versión ONNX FP32. No se documenta throughput agregado ni latencia en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de errores en japonés en la documentación proporcionada. A modo de referencia estructural, el modelo se apoya en tohoku-nlp/bert-base-japanese-v3, del que hereda arquitectura y tokenizador, pero no se han publicado comparaciones de rendimiento frente a alternativas en la información disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ja-error-detect-v1 | 110,6 M | no disponible | Detección de errores (6 tipos) | Apache 2.0 | Hugging Face |
| tohoku-nlp/bert-base-japanese-v3 | no disponible en la información | no disponible | Modelo base japonés | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- Entrenado con errores sintéticos inyectados sobre FineWeb-2; el rendimiento sobre errores reales será previsiblemente inferior al de los benchmarks publicados.
- El tipo de error peor detectado son los caracteres sobrantes (衍字), con F1 0,7686; los homófonos también presentan dificultad por depender fuertemente del contexto.
- Los falsos positivos se concentran en partículas usadas correctamente, palabras extranjeras en katakana y nombres propios; en textos con muchos nombres propios aumenta la sobre-detección.
- El modelo señala candidatos, no certezas: la decisión final debe recaer en una persona o en una lógica de corrección posterior.
- No genera correcciones; requiere un componente adicional para proponer el texto corregido.
- Monolingüe (solo japonés); no aplicable a otros idiomas.
- No se documenta la longitud máxima de contexto; al derivar de BERT base, es probable que esté limitada a 512 tokens, pero este dato no está confirmado en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, con las obligaciones habituales de atribución y aviso de licencia.
- No se documentan sesgos específicos más allá de los falsos positivos descritos; al entrenar sobre datos sintéticos sin información personal real, el riesgo de filtración de datos personales es bajo según el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/japan-opendata/ja-error-detect-v1
- Página de presentación: https://jpopendata.jp/models/ja-error-detect-v1/
- Desarrollador (Japan Open Data Lab): https://jpopendata.jp/
- Modelo base: https://huggingface.co/tohoku-nlp/bert-base-japanese-v3
- Dataset de origen (FineWeb-2): no disponible enlace directo en la información proporcionada
