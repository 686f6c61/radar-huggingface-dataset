# mlboydaisuke/ModernBERT-Ja-310M-Decision-LiteRT

## Resumen

ModernBERT-Ja-310M-Decision-LiteRT es una conversión al formato LiteRT (el runtime de Google AI Edge, sucesor de TensorFlow Lite) de un modelo japonés de clasificación de texto tipo cross-encoder. El modelo original, `argos1111/modernbert-ja-310m-jev`, se obtiene por fine-tuning de `sbintuitions/modernbert-ja-310m`, un transformer encoder de la familia ModernBERT con 310 millones de parámetros y entrenado específicamente para japonés. El autor de la conversión es mlboydaisuke y la publica bajo licencia CC BY-SA 4.0.

La particularidad del modelo es su enfoque de "decisiones tipadas": en lugar de devolver una etiqueta de clasificación convencional, evalúa pares (pregunta + estado, candidato) y devuelve un logit por par. Aplicando softmax sobre los logits de los candidatos de una misma pregunta se obtienen probabilidades para una elección entre opciones, un nivel de una escala o una respuesta verdadero/falso. Esto lo convierte en una herramienta para extraer decisiones estructuradas de texto libre en japonés.

El interés actual de esta versión concreta es el despliegue en dispositivo: los grafos `.tflite` permiten ejecutar el modelo en CPU de escritorio, GPU Metal de Apple y GPU/NPU de Android (probado en Galaxy S26), con pesos en float16 y activaciones en float32. La model card documenta con detalle las diferencias numéricas frente al checkpoint de referencia en transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder bidireccional, cross-encoder), 25 capas de encoder |
| Parámetros totales | 310M (según nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (grafo principal); variante de 256 tokens también incluida |
| Tipos de cuantización | float16 en pesos (grafos wfp16) y float32 (grafos de referencia, no incluidos en el repo); activaciones en float32 |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | LiteRT / TFLite (`.tflite`), tabla de embeddings float16 little-endian (`.bin`), tokenizer.json |

## Arquitectura y entrenamiento

El modelo base es un ModernBERT adaptado al japonés por sbintuitions, con 310 millones de parámetros y 25 capas de encoder. ModernBERT introduce mejoras sobre el transformer encoder clásico, como atención con rotaciones posicionales y ventanas de atención alternas, aunque la model card no detalla la configuración exacta de estas variantes en la versión japonesa. El checkpoint `argos1111/modernbert-ja-310m-jev` se obtiene por fine-tuning como cross-encoder: recibe un par de textos (pregunta + estado, candidato) y emite un único logit de relevancia o adecuación.

Los datos de entrenamiento citados en la model card incluyen JGLUE (Yahoo Japan), JCoLA, Commonsense Moral JA y MASSIVE, lo que sugiere un entrenamiento orientado a tareas de comprensión, razonamiento lingüístico, juicio moral y clasificación de intenciones. No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un encoder de clasificación, es improbable que se usaran. La innovación técnica destacable está en la conversión: los grafos wfp16 insertan operadores DEQUANTIZE tras cada uno de los 102 pesos FULLY_CONNECTED (1.911 operadores frente a 1.809 en fp32), manteniendo activaciones en float32 para preservar precisión. El host (Python o Kotlin) se encarga de renderizar textos, tokenizar, buscar filas en la tabla de embeddings y aplicar softmax.

## Capacidades

- Clasificación de texto en japonés mediante cross-encoding de pares (pregunta, candidato).
- Decisiones de elección múltiple: selección entre opciones definidas por el usuario (por ejemplo, asignación de departamento).
- Decisiones de escala (score): asignación de un nivel ordinal (por ejemplo, urgencia en tres grados).
- Decisiones booleanas (noul): respuesta sí/no sobre una condición del texto.
- Extracción de decisiones estructuradas a partir de texto libre, con probabilidades calibradas por candidato.
- Ejecución en dispositivo: CPU de escritorio, GPU Metal (Apple), GPU y NPU de Android.
- No soporta tool calling, agentes, generación de texto libre, visión ni audio: es un encoder de clasificación, no un modelo generativo.
- Capacidad multilingüe limitada al japonés.

## Casos de uso

- Triaje de tickets de soporte: clasificar un mensaje de cliente en departamentos (facturación, técnico, ventas) evaluando cada categoría como candidato y eligiendo la de mayor probabilidad. El contexto de 512 tokens cubre mensajes de soporte típicos.
- Detección de solicitudes de reembolso: usar una decisión booleana sobre el texto del ticket para enrutar automáticamente a un flujo de devolución, con la probabilidad como umbral de confianza.
- Priorización por urgencia: asignar un nivel ordinal (bajo, medio, alto) a incidencias entrantes y ordenar la cola de atención según la puntuación obtenida.
- Clasificación de intenciones en asistentes de voz o chat: etiquetar la intención del usuario entre un conjunto cerrado de comandos, integrándose en un pipeline de NLU ligero que corre en el propio dispositivo.
- Moderación de contenido en japonés: evaluar pares (mensaje, criterio) para decidir si un texto cumple una política concreta, con probabilidad asociada para revisión humana.
- Análisis de encuestas o reseñas: asignar niveles de satisfacción o categorías temáticas a respuestas abiertas en japonés, procesando lotes en CPU sin GPU dedicada.
- Filtrado previo en pipelines RAG: puntuar la relevancia de fragmentos candidatos respecto a una consulta antes de pasarlos a un modelo generativo, reduciendo coste y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de fidelidad de la conversión frente al checkpoint de referencia:

| Entorno | Coincidencia de candidato | Diferencia máxima de probabilidad |
|---|---|---|
| CPU de escritorio (512 tokens, wfp16) | 621/621 preguntas (547 peticiones) | 0,00079 |
| GPU Metal Apple M4 Max (FP32 explícito) | 621/621 preguntas | 0,00079 |
| GPU Galaxy S26 (FP32 explícito) | 621/621 preguntas | 0,00079 |
| NPU Galaxy S26 | falla el umbral en una pregunta | 0,0113 |

Latencia en GPU Galaxy S26: mediana en caliente de 416,4 ms por par (rango 183,6–669,0 ms) y 2.014 ms por petición, en una ejecución de 17 minutos que llevó el dispositivo de estado térmico 0 a 2.

## Requisitos de hardware

- VRAM/RAM estimada: el grafo de 512 tokens ocupa unos 475 MB en disco con pesos float16; en ejecución, con activaciones float32, se requiere aproximadamente 1–2 GB de memoria.
- GPU recomendadas: no requiere GPU; funciona en CPU de escritorio. Probado en Apple M4 Max (Metal) y Galaxy S26 (GPU y NPU).
- Cabe en GPU consumer: sí, cualquier GPU con más de 2 GB de memoria; también en móviles de gama alta.
- Opciones de despliegue: LiteRT CompiledModel Python API (`ai-edge-litert` 2.1.6) y Kotlin CompiledModel API (LiteRT 2.2.0). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: en Galaxy S26 GPU, 416 ms por par y 2 s por petición de tres preguntas; en CPU de escritorio no se reportan tiempos absolutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ModernBERT-Ja-310M-Decision-LiteRT | 310M | 512 | LiteRT | CC BY-SA 4.0 | Cross-encoder de decisiones, solo japonés, en dispositivo |
| argos1111/modernbert-ja-310m-jev | 310M | no disponible | safetensors (transformers) | no disponible | Checkpoint de referencia en PyTorch |
| sbintuitions/modernbert-ja-310m | 310M | no disponible | safetensors | no disponible | Modelo base japonés de ModernBERT |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo procesa japonés; no es utilizable para otros idiomas sin reentrenamiento.
- Es un encoder de clasificación: no genera texto, no razona de forma multi-paso y no soporta tool calling.
- La ventana de contexto está limitada a 512 tokens (o 256 en la variante reducida); textos más largos deben truncarse.
- En la NPU del Galaxy S26 el grafo falla el umbral de fidelidad (|Δp| ≤ 0,01) en una pregunta, por lo que no se recomienda su uso en NPU sin validación adicional.
- La licencia CC BY-SA 4.0 exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar su uso comercial en productos propietarios.
- No se documentan sesgos específicos, pero los datasets de entrenamiento (JGLUE, JCoLA, MASSIVE, juicio moral) pueden introducir sesgos culturales y de dominio.
- Riesgo de alucinación bajo en cuanto a generación de texto, pero las probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento.
- El repositorio no incluye los grafos float32 ni la tabla float32; hay que regenerarlos con `REPRODUCE.md` si se necesita la referencia exacta.
- Las mediciones de rendimiento son de 2026-10-02 y de un único dispositivo; no hay garantías de reproducibilidad en otros hardware.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mlboydaisuke/ModernBERT-Ja-310M-Decision-LiteRT)
- [Modelo base argos1111/modernbert-ja-310m-jev](https://huggingface.co/argos1111/modernbert-ja-310m-jev)
- [Modelo original sbintuitions/modernbert-ja-310m](https://huggingface.co/sbintuitions/modernbert-ja-310m)
- [Repositorio LiteRT en GitHub](https://github.com/google-ai-edge/litert)
- [Dataset JGLUE](https://huggingface.co/datasets/yahoojapan/JGLUE)
- [Dataset JCoLA](https://huggingface.co/datasets/osekilab/JCoLA)
- [Dataset Commonsense Moral JA](https://huggingface.co/datasets/Language-Media-Lab/commonsense-moral-ja)
- [Dataset MASSIVE](https://huggingface.co/datasets/AmazonScience/massive)
