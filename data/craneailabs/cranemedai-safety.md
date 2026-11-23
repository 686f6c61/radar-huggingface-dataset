# CraneAILabs/cranemedai-safety

## Resumen

CraneMed AI Safety Classifier es un modelo de clasificación de texto desarrollado por Crane AI Labs para detectar prompts adversariales dirigidos a asistentes clínicos de IA que operan bajo las directrices clínicas de Uganda (Uganda Clinical Guidelines, UCG 2023). Se trata de un fine-tuning de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, un transformer de tipo encoder con 12 capas y 384 dimensiones de embedding, orientado a ejecución en dispositivo (on-device) en teléfonos Android de gama media.

El modelo ocupa la capa L3 (neuronal) de una arquitectura de seguridad de cuatro capas que combina filtros regex de entrada y salida con una auto-verificación del propio LLM clínico (MedGemma). Su función específica es capturar ataques que evaden los patrones regex: suplantación de autoridad, cadenas de escalada multi-turno, elusión de contraindicaciones con encuadre clínico y ataques multilingües en inglés, luganda y suajili.

Es relevante por su enfoque de despliegue en entornos de baja conectividad: la versión INT8 en ONNX ocupa aproximadamente 12 MB y está diseñada para latencias inferiores a 30 ms en dispositivos Android, lo que permite filtrar prompts peligrosos antes de que lleguen al modelo generativo. El repositorio tiene 1,5 GB, aunque los artefactos desplegables son mucho menores. El modelo se publica bajo licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM, fine-tuning de paraphrase-multilingual-MiniLM-L12-v2) |
| Parametros totales | no disponible (modelo base MiniLM-L12; checkpoint safetensors de ~90 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (ONNX) e INT8 (ONNX) |
| Idiomas soportados | Ingles (en), luganda (lg), suajili (sw) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (PyTorch) y ONNX (FP32 e INT8) |

## Arquitectura y entrenamiento

El modelo parte de `paraphrase-multilingual-MiniLM-L12-v2`, un encoder transformer de 12 capas con embeddings de 384 dimensiones entrenado originalmente para similitud semántica multilingüe. Sobre esa base se aplica un fine-tuning de clasificación binaria (ADVERSARIAL / SAFE) para la tarea de detección de prompts peligrosos. El checkpoint PyTorch en safetensors ocupa aproximadamente 90 MB, mientras que las exportaciones ONNX son de ~45 MB (FP32) y ~12 MB (INT8).

El entrenamiento se realizó sobre el UCG Adversarial Safety Dataset, compuesto por 3.020 prompts etiquetados (1.034 adversariales y 1.986 seguros), generados a partir de mapeos clínicos de las UCG 2023 mediante Gemini 1.5 Flash. El desbalance de clases se compensa con una `CrossEntropyLoss` ponderada por frecuencia inversa, con un peso aproximado de 1,9x sobre la clase ADVERSARIAL. No se detalla en la información disponible el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO, algo esperable en un clasificador y no en un modelo generativo.

## Capacidades

- Clasificación binaria de prompts como ADVERSARIAL o SAFE en el dominio clínico de las UCG 2023.
- Detección de ocho categorías de ataque: dosificación peligrosa, suplantación de autoridad, elusión de contraindicaciones, explotación del contexto UCG, desvío de emergencia, sondeo de alucinaciones, jailbreak/roleplay y escalada multi-turno.
- Procesamiento multilingüe en inglés, luganda y suajili.
- Inferencia on-device mediante ONNX Runtime con cuantización INT8.
- Integración como capa de filtrado previa a un LLM generativo (MedGemma) en un pipeline de seguridad por capas.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un clasificador.

## Casos de uso

- Filtrado previo de prompts en asistentes clínicos móviles: el clasificador se ejecuta antes de MedGemma para bloquear consultas peligrosas (por ejemplo, dosis letales) en dispositivos Android de 8 GB en centros sanitarios ugandeses con conectividad limitada.
- Detección de suplantación de autoridad: identifica prompts que afirman ser de un funcionario del Ministerio de Salud (MOH) o de una autoridad académica para forzar respuestas fuera de protocolo.
- Protección frente a elusión de contraindicaciones: detecta intentos de saltarse advertencias clínicas aprovechando situaciones de desabastecimiento (stock-out) o urgencias fabricadas.
- Evaluación de red team de LLM clínicos: permite a investigadores medir la robustez de modelos médicos frente a ataques específicos del contexto ugandés, con categorías de ataque definidas.
- Moderación multilingüe en suajili y luganda: cubre ataques en idiomas locales que los filtros regex en inglés no detectan.
- Capa de defensa en profundidad: se combina con el filtro regex de entrada (L1) y el validador de salida (L2) para reducir falsos negativos en un pipeline de seguridad de cuatro capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara métricas objetivo (no resultados medidos): precisión en ADVERSARIAL > 0,92, F1 macro > 0,88, latencia media INT8 on-device < 30 ms, tamaño INT8 ≤ 40 MB y degradación de precisión FP32 → INT8 < 2%.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 y del orden de cientos de MB en INT8, dado el tamaño del checkpoint (~90 MB en safetensors, ~12 MB en ONNX INT8).
- GPU recomendadas: no requiere GPU; está diseñado para CPU en dispositivos Android. En servidor puede ejecutarse en cualquier CPU o GPU convencional (A100, H100, RTX 4090) sin necesidad de aceleración dedicada.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles Android de 8 GB.
- Opciones de despliegue: ONNX Runtime (objetivo principal, Android), transformers en PyTorch, y potencialmente llama.cpp u Ollama no aplican por tratarse de un encoder de clasificación; TGI y vLLM no son el objetivo declarado.
- Latencia y throughput: latencia objetivo < 30 ms en INT8 on-device; no se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| CraneMed AI Safety | Clasificador encoder (MiniLM) | no disponible (~90 MB checkpoint) | no disponible | en, lg, sw | CC-BY-4.0 | Seguridad clínica UCG, on-device |
| paraphrase-multilingual-MiniLM-L12-v2 (base) | Encoder de similitud | ~118 M | 128 tokens | 50+ | Apache-2.0 | Similitud semántica multilingüe |
| Clasificadores de moderación genéricos (p. ej. basados en BERT) | Clasificador encoder | variable | variable | variable | variable | Moderación general, no clínica |

No se dispone de información sobre benchmarks comparativos con alternativas específicas de seguridad clínica; la comparativa se limita a características estructurales.

## Limitaciones y advertencias

- Ámbito restringido: entrenado exclusivamente para el contexto de las UCG 2023 y el asistente MedGemma; su rendimiento fuera de ese dominio no está validado.
- Idiomas limitados a inglés, luganda y suajili; no cubre otras lenguas de la región.
- Riesgo de falsos negativos ante ataques novedosos no representados en las ocho categorías del dataset de entrenamiento.
- Riesgo de falsos positivos en consultas clínicas legítimas con encuadre similar a ataques (urgencias reales, preguntas sobre dosis).
- Datos de entrenamiento generados sintéticamente con Gemini 1.5 Flash, lo que puede introducir sesgos o artefactos del generador.
- No se han publicado resultados de benchmarks medidos; solo métricas objetivo, por lo que el rendimiento real es desconocido.
- Licencia CC-BY-4.0 permite uso comercial con atribución, pero no se detallan restricciones adicionales de responsabilidad clínica.
- No sustituye la validación clínica ni la supervisión humana; debe usarse como capa adicional de defensa, no como único mecanismo de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CraneAILabs/cranemedai-safety
- Dataset de entrenamiento: https://huggingface.co/datasets/CraneAILabs/ucg-adversarial
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
