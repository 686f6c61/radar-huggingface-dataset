# mokolabs/moko-japanese-prompt-injection-detector

## Resumen

Moko-japanese-prompt-injection-detector es un modelo de clasificación de texto desarrollado por mokolabs (nombre de exhibición "moko") cuyo objetivo es detectar intentos de prompt injection en japonés, es decir, instrucciones maliciosas o intentos de secuestro de instrucciones (jailbreak) embebidos en entradas de usuario. El modelo devuelve una etiqueta binaria (`injection` / `benign`) sobre un texto de entrada, lo que lo hace directamente utilizable como filtro de seguridad previo a un LLM.

Se trata de un fine-tuning de un modelo BERT japonés (`tohoku-nlp/bert-base-japanese-v3`) sobre un conjunto de datos propio de 11.824 ejemplos, con un diseño de etiquetado conservador orientado a reducir falsos positivos (solo se marcan como positivos los casos con intención clara de secuestro de instrucciones). El repositorio incluye pesos en formato safetensors y una exportación ONNX para inferencia sin dependencia del runtime de Transformers.

El modelo es relevante para despliegues de LLM en producción en entornos japoneses, donde los filtros de seguridad entrenados mayoritariamente en inglés rinden peor. Su tamaño compacto (basado en BERT-base) permite integrarlo como capa de moderación en tiempo real con coste computacional bajo, aunque su ámbito de aplicación está estrictamente limitado al idioma japonés y a la detección de un tipo concreto de ataque.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), clasificación binaria de secuencias |
| Parametros totales | no disponible (modelo base: bert-base-japanese-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors y ONNX en el repo) |
| Idiomas soportados | japonés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo parte de `tohoku-nlp/bert-base-japanese-v3`, un encoder BERT en japonés, sobre el que se aplica un fine-tuning de clasificación binaria con dos etiquetas de salida: `injection` y `benign`. El entrenamiento se realizó con un dataset propio de 11.824 ejemplos (9.456 de entrenamiento y 1.182 de test), y el autor documenta que los ejemplos de entrenamiento y test se separaron por origen para evitar que fragmentos de la misma fuente aparecieran en ambos conjuntos, mitigando así la fuga de datos.

La composición del dataset combina fuentes con licencia Apache-2.0 (`deepset/prompt-injections`, `neuralchemy/Prompt-injection-dataset`) y fuentes MIT (`S-Labs/prompt-injection-dataset`, `wambosec/prompt-injections`, `reshabhs/SPML_Chatbot_Prompt_Injection`, `rikka-snow/prompt-injection-multilingual` en su bloque japonés). Además, se incorporaron ejemplos sintéticos de prompt injection generados con un LLM y traducidos al japonés, sujetos a revisión manual. El autor indica explícitamente que no se aplicaron técnicas de aumento de datos como GPL, parafraseo o back-translation. El etiquetado es conservador: solo se marcan como positivos los casos con intención clara de secuestro de instrucciones.

## Capacidades

- Clasificación binaria de texto en japonés: distingue entre entrada benigna (`benign`) e intento de prompt injection (`injection`).
- Detección de instrucciones de secuestro embebidas en texto de usuario, incluyendo intentos de manipulación dirigidos a revelar el prompt del sistema o a alterar el comportamiento del modelo.
- Integración directa con la pipeline `text-classification` de Transformers.
- Inferencia mediante ONNX, sin necesidad de cargar el modelo en Transformers.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un clasificador.
- No cubre otros idiomas distintos del japonés.

## Casos de uso

- Filtro de seguridad previo a un LLM en producción: se ejecuta el clasificador sobre cada mensaje de usuario antes de enviarlo al modelo generativo; si la etiqueta es `injection`, se bloquea o se redirige la petición a un flujo de revisión. El bajo coste de un BERT-base permite hacerlo en tiempo real.
- Moderación de chatbots de atención al cliente en japonés: intercepta intentos de manipular al asistente para que revele instrucciones internas o ignore sus restricciones, protegiendo el prompt del sistema.
- Protección de agentes con acceso a herramientas: en pipelines donde el LLM puede invocar funciones externas, el clasificador actúa como barrera contra entradas que intentan forzar llamadas no autorizadas.
- Auditoría y monitorización de tráfico: se puede registrar la tasa de detecciones por sesión o por usuario para identificar patrones de ataque y alimentar sistemas de alerta.
- Evaluación de robustez de LLM japoneses: sirve como componente de un banco de pruebas para medir la resistencia de un modelo a prompt injection en japonés.
- Preprocesado en pipelines RAG: filtra documentos o consultas de usuario que contienen instrucciones maliciosas antes de que se incorporen al contexto del modelo.
- Capa adicional en defensa en profundidad: combinado con filtros basados en reglas o con clasificadores entrenados en inglés, cubre el hueco de idioma en despliegues multilingües.

## Benchmarks y rendimiento

Resultados de validación publicados por el autor (sobre datos propios):

| Conjunto | F1 | Precisión | Recall | Notas |
|---|---|---|---|---|
| Test | 0,930 | 0,930 | — | 26 falsos negativos, 57 falsos positivos |
| Test | 0,936 | 0,937 | — | Sin uso de entrenamiento ni ajuste de umbral |

El autor advierte que estas cifras proceden de un split propio y no de un benchmark externo, por lo que no deben compararse directamente con resultados de terceros. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un BERT-base (el repo completo ocupa 0,9 GB, incluyendo safetensors y ONNX).
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para cargas moderadas.
- GPU recomendadas: no requiere GPU dedicada; para alto throughput, una T4 o A10 es más que suficiente.
- Opciones de despliegue: pipeline de Transformers, ONNX Runtime, y servidores de inferencia compatibles con modelos de clasificación (por ejemplo, Text Embeddings Inference no aplica; sí servidores genéricos de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en lote y latencia de milisegundos por petición en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| moko-japanese-prompt-injection-detector | Clasificador BERT | Japonés | Apache-2.0 | no disponible | Fine-tuning específico para prompt injection en japonés |
| deepset/deberta-v3-base-prompt-injection | Clasificador DeBERTa | Principalmente inglés | no disponible en la información | no disponible | Uno de los clasificadores de prompt injection más usados; no cubre japonés |
| protectai/deberta-v3-base-prompt-injection-v2 | Clasificador DeBERTa | Principalmente inglés | no disponible en la información | no disponible | Versión mejorada del anterior; mismo sesgo de idioma |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ámbito estrictamente japonés: no está entrenado ni evaluado para otros idiomas; su uso en entradas en inglés u otras lenguas no está respaldado.
- Cobertura limitada a prompt injection: no detecta otros tipos de contenido dañino (discurso de odio, spam, contenido sexual, etc.).
- Falsos negativos documentados: 26 casos en el conjunto de test; entradas con ataques sutiles o codificados pueden pasar el filtro.
- Falsos positivos documentados: 57 casos en el conjunto de test, lo que puede degradar la experiencia de usuario legítimo.
- Etiquetado conservador: reduce falsos positivos pero puede incrementar falsos negativos en ataques ambiguos.
- Sin evaluación externa: las métricas proceden de un split propio y no de un benchmark independiente.
- Sin datos sobre sesgos: no se ha publicado un análisis de sesgos del modelo.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mokolabs/moko-japanese-prompt-injection-detector
- Modelo base: https://huggingface.co/tohoku-nlp/bert-base-japanese-v3
- Dataset (Apache-2.0): https://huggingface.co/datasets/deepset/prompt-injections
- Dataset (Apache-2.0): https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset
- Dataset (MIT): https://huggingface.co/datasets/S-Labs/prompt-injection-dataset
- Dataset (MIT): https://huggingface.co/datasets/wambosec/prompt-injections
- Dataset (MIT): https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
- Dataset (MIT): https://huggingface.co/datasets/rikka-snow/prompt-injection-multilingual
