# Roblox/roblox-pii-classifier-v2

## Resumen

Roblox PII Classifier v2 es un modelo de clasificación de texto diseñado para detectar intentos de compartir o solicitar información personal identificable (PII) en conversaciones multiusuario. Desarrollado por Roblox sobre la arquitectura XLM-RoBERTa-Large, este modelo evalúa cada mensaje dentro de su contexto conversacional completo, lo que le permite identificar técnicas de evasión sofisticadas como intercambios colaborativos de PII, deletreo fonético o referencias implícitas, reduciendo al mismo tiempo los falsos positivos. Con 559 millones de parámetros y una ventana de contexto fija de 512 tokens, v2 amplía la cobertura idiomática de 17 a 189 lenguas y mejora notablemente el rendimiento frente a su predecesor: la puntuación F1 global pasa del 63,41 % al 90,52 % en el conjunto de evaluación interno de Roblox.

El modelo se publica bajo licencia Apache 2.0 y está disponible en formatos safetensors y ONNX, lo que facilita su integración en entornos de producción. Su diseño multi-etiqueta con tres categorías (pedir PII, dar PII y dirigir a usuarios fuera de la plataforma) y sus umbrales de decisión ajustables lo convierten en una herramienta práctica para moderación de contenido en plataformas sociales, protección de menores y cumplimiento normativo de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-Large (Transformer encoder) |
| Parametros totales | 559.893.507 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens fijos (truncamiento a la izquierda) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y ONNX) |
| Idiomas soportados | 189 idiomas (multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa-Large, un transformer encoder preentrenado multilingüe. La entrada se formatea como una cadena de texto que incluye un prefijo de instrucción fijo, el mensaje objetivo del hablante evaluado (siempre etiquetado como `t`) y el historial de la conversación circundante, con los demás participantes anonimizados como `s1`, `s2`, etc. Los turnos se unen con el token separador `</s>`. Esta entrada se tokeniza con el tokenizador SentencePiece de XLM-RoBERTa a una longitud fija de 512 tokens, con truncamiento por la izquierda para conservar el mensaje más reciente cuando el historial excede la ventana.

El entrenamiento utilizó una combinación de datos sintéticos generados por IA y datos internos anonimizados etiquetados por expertos, junto con conjuntos públicos como `ai4privacy/pii-masking-openpii-1.5m`, `nvidia/Nemotron-PII` y el benchmark propio `Roblox/roblox-pii-classifier-benchmark`. Además, se aplicó un proceso automatizado de red-teaming y agrupamiento por clústeres para identificar y corregir vulnerabilidades específicas. La salida es multi-etiqueta: se aplica una función sigmoide elemento a elemento sobre los logits para obtener puntuaciones independientes para cada una de las tres categorías de PII.

## Capacidades

- Detección de tres tipos de riesgo en conversaciones: solicitud de PII (`privacy_asking_for_pii`), divulgación de PII (`privacy_giving_pii`) y direccionamiento fuera de plataforma (`directing_users_off_platform`).
- Análisis contextual: evalúa el mensaje objetivo junto con el historial de la conversación, lo que permite detectar intentos de evasión que serían invisibles para modelos que analizan mensajes aislados.
- Multilingüe: cubre 189 idiomas, ampliando significativamente la cobertura frente a la versión anterior (17 idiomas).
- Clasificación multi-etiqueta: un mismo mensaje puede activar varias categorías simultáneamente.
- Umbrales de decisión configurables: se recomiendan valores específicos (0,60 para pedir PII, 0,55 para dar PII y 0,10 para dirigir fuera de plataforma) que pueden ajustarse según las necesidades de precisión o recall.
- Compatible con pipelines de transformers, ONNX y Text Embeddings Inference.

## Casos de uso

- Moderación de chat en plataformas sociales: el modelo puede integrarse en sistemas de moderación en tiempo real para identificar mensajes que piden o comparten información personal, actuando sobre conversaciones completas en lugar de mensajes sueltos.
- Protección de menores en entornos online: al detectar intentos de obtener datos personales de usuarios jóvenes, permite intervenir antes de que se produzca un intercambio de información sensible.
- Cumplimiento de privacidad (RGPD, CCPA): ayuda a las empresas a monitorizar sus canales de atención al cliente o foros comunitarios para asegurar que no se comparten datos personales sin consentimiento.
- Prevención de phishing y fraude: detecta mensajes que intentan dirigir a los usuarios a aplicaciones o sitios externos, un vector común en estafas.
- Análisis forense de conversaciones: aplicable a la revisión de registros de chat para investigaciones de seguridad o auditorías internas.
- Filtrado de PII en datasets de entrenamiento: puede utilizarse para limpiar corpus de texto antes de entrenar otros modelos, evitando fugas de información personal.

## Benchmarks y rendimiento

La tabla siguiente muestra la puntuación F1 (mejor valor) en distintos conjuntos de evaluación, comparando con otros modelos de moderación y detección de PII. Los datos provienen de la model card oficial.

| Dataset / Benchmark | Roblox PII v2 | Roblox PII v1 | OpenAI Privacy Filter | GLiNER2 | Qwen3Guard Gen 8B | LlamaGuard v3 1B | LlamaGuard v3 8B | LlamaGuard v4 12B | NemoGuard 8B | Piiranha NER | Shieldstral |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **roblox-pii-safety-for-chat** | **88,82 %** | 64,69 % | 58,16 % | 54,50 % | 66,24 % | 27,89 % | 56,24 % | 54,56 % | 56,52 % | 58,34 % | 57,84 % |
| **Roblox Internal Evaluation** | **90,52 %** | 63,41 % | 20,98 % | 28,21 % | 15,62 % | 8,59 % | 12,90 % | 21,92 % | 14,77 % | 20,98 % | 31,87 % |
| **Nemotron-PII** | **99,22 %** | 70,07 % | 65,22 % | 62,92 % | 37,46 % | 53,32 % | 46,07 % | 35,05 % | 56,16 % | 68,52 % | 56,69 % |
| **PII Masking OpenPII 1.5M** | **99,76 %** | 86,79 % | 84,23 % | 83,07 % | 61,94 % | 65,10 % | 64,23 % | 56,16 % | 54,01 % | 86,35 % | 85,33 % |

Nota: los modelos marcados con asterisco en la model card recibieron únicamente el texto del usuario objetivo, mientras que Roblox PII v2 se evaluó con contexto conversacional completo. El modelo también supera a su predecesor cuando se le proporciona solo el texto del usuario.

## Requisitos de hardware

- Tamaño del modelo: 559 millones de parámetros. En FP32, el checkpoint ocupa aproximadamente 2,2 GB; en FP16, alrededor de 1,1 GB (estimación basada en el número de parámetros, no se han publicado cifras oficiales).
- VRAM estimada para inferencia: con FP16, unos 2-3 GB incluyendo overhead; con cuantización a 8 bits podría reducirse a ~1,5 GB. No se han publicado configuraciones de cuantización oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas como NVIDIA T4, RTX 3060, RTX 4090 o A10 son suficientes. Para despliegue a gran escala, se recomienda A100 o H100.
- Compatible con consumer GPU: sí, es viable en GPUs de gama media gracias a su tamaño moderado.
- Opciones de despliegue: compatible con Hugging Face Transformers, ONNX Runtime, Text Embeddings Inference (TEI) y endpoints compatibles. También puede servirse con vLLM o TGI, aunque al ser un modelo encoder, la inferencia es más eficiente con soluciones específicas para clasificación.
- Latencia y throughput: no se han publicado datos oficiales. Como referencia, un modelo de este tamaño en una T4 puede procesar cientos de solicitudes por segundo en lotes pequeños, pero depende del hardware y la optimización.

## Comparativa con modelos similares

La siguiente tabla compara Roblox PII v2 con alternativas de la misma categoría (moderación de contenido y detección de PII en conversaciones). Los datos de rendimiento provienen de la model card.

| Modelo | Parametros | Contexto | Licencia | F1 en roblox-pii-safety-for-chat | F1 en Roblox Internal |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Roblox PII v2** | 559 M | 512 tokens | Apache-2.0 | **88,82 %** | **90,52 %** |
| LlamaGuard v3 8B | 8 B | 4096 tokens | Llama 3 Community | 56,24 % | 12,90 % |
| Qwen3Guard Gen 8B | 8 B | 8192 tokens | Apache-2.0 | 66,24 % | 15,62 % |
| NemoGuard 8B | 8 B | 8192 tokens | CC-BY-NC-4.0 | 56,52 % | 14,77 % |
| Piiranha NER | 1,4 B | 512 tokens | Apache-2.0 | 58,34 % | 20,98 % |

Roblox PII v2 es notablemente más pequeño que los modelos de 8B, pero obtiene resultados muy superiores en la detección de PII contextual, gracias a su diseño especializado y al entrenamiento con datos específicos de conversaciones. Los modelos generalistas de moderación, aunque más grandes, no alcanzan su precisión en este dominio concreto.

## Limitaciones y advertencias

- Ventana de contexto fija de 512 tokens: al truncar por la izquierda, los turnos más antiguos de la conversación se descartan cuando el historial es largo, lo que puede perder información relevante para la detección.
- Umbrales recomendados: los valores de 0,60, 0,55 y 0,10 son orientativos y deben ajustarse según el equilibrio deseado entre precisión y recall en cada caso de uso.
- Cobertura idiomática: aunque soporta 189 idiomas, el rendimiento puede variar entre lenguas; los idiomas con menos datos de entrenamiento podrían mostrar tasas de error más altas.
- Riesgo de sesgo: al entrenarse con datos sintéticos y conversaciones internas de Roblox, el modelo puede estar sesgado hacia patrones de lenguaje específicos de esa plataforma, lo que podría afectar su generalización a otros dominios.
- No es un sistema de seguridad completo: el modelo detecta PII en texto, pero no bloquea otros tipos de contenido dañino (acoso, spam, etc.) ni maneja imágenes o audio.
- Requiere preprocesamiento específico: la entrada debe formatearse con el prefijo de instrucción y la anonimización de hablantes, lo que añade complejidad a la integración.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el modelo se distribuye tal cual; Roblox no ofrece garantías sobre su funcionamiento en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Roblox/roblox-pii-classifier-v2
- Versión anterior (v1): https://huggingface.co/Roblox/roblox-pii-classifier
- Blog de Roblox sobre el clasificador de PII: https://about.roblox.com/newsroom/2025/11/open-sourcing-roblox-pii-classifier-ai-pii-detection-chat
- Catálogo de modelos de Microsoft Foundry: https://ai.azure.com/catalog/models/roblox-roblox-pii-classifier
