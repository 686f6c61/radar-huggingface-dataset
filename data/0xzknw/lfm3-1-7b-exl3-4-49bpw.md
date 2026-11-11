# 0xzknw/LFM3-1.7B-EXL3-4.49bpw

## Resumen

LFM3-1.7B-EXL3-4.49bpw es una cuantización de tipo EXL3 del modelo LiquidAI/LFM3-1.7B, publicada por el usuario 0xzknw. Se trata de un checkpoint mixto de 4/5/6 bits (con una media de 4,489 bits por peso sobre las proyecciones cuantizadas) pensado para su uso con el runtime ExLlamaV3 y, en particular, con la implementación MLXL3. No es un modelo nuevo: los pesos proceden del modelo base de Liquid AI y se han copiado sin modificar su contenido respecto a la variante original publicada en un repositorio multi-variante ya retirado.

El modelo resuelve un problema de despliegue: permitir ejecutar un modelo de la familia LFM3 en hardware con memoria limitada reduciendo el peso de los pesos mediante cuantización de bloques. El repositorio ocupa 1,9 GB y el checkpoint contiene 937.346.816 parámetros según los safetensors, un dato que conviene contrastar con la denominación "1.7B" del modelo base, ya que la cifra real del checkpoint cuantizado no coincide con esa etiqueta.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización concreta con sus métricas de fidelidad declaradas por el autor; por otro, advierte de que las afirmaciones de rendimiento del modelo base no validan por sí mismas la calidad de esta cuantización. El autor reconoce explícitamente que la compuerta de calidad original no se superó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; el checkpoint es EXL3) |
| Parametros totales | 937.346.816 (segun safetensors del checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 mixta 4/5/6 bits, 4,49 bpw de media sobre proyecciones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors (checkpoint EXL3, no BF16) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base LFM3-1.7B en la documentación proporcionada; la model card de esta cuantización no la describe. Lo que sí se documenta es el proceso de cuantización: un esquema EXL3 con mezcla de precisión 4/5/6 bits, con una media de 4,4892703863 bits por peso calculada únicamente sobre las proyecciones cuantizadas, no sobre el checkpoint completo. El autor insiste en que 4,49 bpw no debe interpretarse como la tasa de bits global del checkpoint.

El proceso de conversión se realizó con las herramientas de ExLlamaV3 y el resultado se empaquetó para el runtime MLXL3. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO, porque esta ficha corresponde a una cuantización y no a un entrenamiento. La model card conserva un manifiesto y varios informes de validación en `source-evidence/` que documentan la receta original, la metodología y los resultados en bruto.

## Capacidades

- Generación de texto y conversación, según el pipeline declarado (`text-generation`, `conversational`).
- Hereda las capacidades del modelo base LiquidAI/LFM3-1.7B, que no se detallan en la información disponible.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución únicamente mediante runtimes compatibles con LFM3 y EXL3 MCG, como MLXL3.

## Casos de uso

- Despliegue en entornos con VRAM ajustada: al ocupar 1,9 GB en disco y emplear una cuantización de 4,49 bpw, el checkpoint permite cargar el modelo en GPUs de consumo medio sin recurrir a los pesos BF16 originales.
- Experimentación con ExLlamaV3: sirve para probar el pipeline de cuantización EXL3 y el runtime MLXL3 sobre un modelo de la familia LFM3, comparando la salida con el modelo base.
- Evaluación de fidelidad de cuantizaciones: los informes de validación incluidos permiten reproducir la comparación de KL y de acuerdo de argmax frente al modelo original en un pasaje de 499 tokens.
- Prototipado de asistentes conversacionales: el pipeline declarado es `conversational`, por lo que puede usarse para iterar sobre prompts y plantillas de chat en local antes de pasar a producción.
- Pruebas de integración en pipelines de inferencia: útil para verificar que el runtime MLXL3 carga correctamente el checkpoint y el tokenizer en un entorno concreto.
- Investigación sobre degradación por cuantización: el caso de este checkpoint, con una compuerta de calidad no superada, es un ejemplo documentado de compromiso entre tamaño y fidelidad que puede servir de referencia metodológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí aporta métricas de fidelidad de la cuantización frente al modelo original:

| Metrica | Valor |
|---|---|
| Bits por peso (media sobre proyecciones cuantizadas) | 4,4892703863 |
| KL media (pasaje de 499 tokens) | 0,018950 |
| Acuerdo de argmax | 91,58 % |
| Objetivo original de acuerdo de argmax | 92 % (no alcanzado) |
| Estado de la compuerta de calidad | fallida (aceptada por el autor) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,9 GB, por lo que el checkpoint cabe holgadamente en GPUs de consumo, aunque el consumo real depende del runtime y del contexto.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: probable por el tamaño del checkpoint, pero no confirmada por el autor.
- Opciones de despliegue: ExLlamaV3 y MLXL3 (runtime requerido para LFM3 y EXL3 MCG). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-EXL3-4.49bpw (este) | 937.346.816 (checkpoint) | no disponible | EXL3 safetensors | LFM Open License v1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | no disponible | no disponible | no disponible | LFM Open License v1.0 | Hugging Face |
| Otras variantes EXL3 del mismo autor | no disponible | no disponible | EXL3 | LFM Open License v1.0 | Repositorio multi-variante retirado |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La compuerta de calidad original no se superó: el acuerdo de argmax es del 91,58 % frente al objetivo del 92 %, y el autor lo acepta como compromiso.
- La cifra de 4,49 bpw corresponde solo a las proyecciones cuantizadas, no al checkpoint completo; no debe citarse como tasa de bits global.
- El checkpoint es EXL3 y no puede cargarse con runtimes estándar de transformers sin soporte específico; requiere ExLlamaV3 o MLXL3.
- Las afirmaciones de benchmarks del modelo base no validan esta cuantización, tal como advierte la propia model card.
- No hay información sobre sesgos, riesgo de alucinación, idiomas soportados ni limitaciones de contexto del modelo base.
- La licencia LFM Open License v1.0 impone condiciones de uso; debe revisarse el archivo LICENSE y el aviso de modificación (NOTICE) antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria de su funcionamiento.
- Los enlaces relativos de la model card archivada pueden no resolver, ya que describen el repositorio multi-variante retirado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xzknw/LFM3-1.7B-EXL3-4.49bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Runtime MLXL3: https://github.com/0xZKnw/mlxl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Perfil del autor: https://huggingface.co/0xzknw
- Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
