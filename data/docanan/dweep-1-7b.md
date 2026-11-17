# docanan/dweep-1.7b

## Resumen

Dweep 1.7B es un ajuste fino mediante LoRA del modelo Qwen3-1.7B, desarrollado por el usuario docanan, orientado a preguntas y respuestas sobre las islas Andamán y Nicobar. El modelo parte de la arquitectura transformer densa de Qwen3-1.7B (Apache-2.0) y hereda sus capacidades generales, incorporando conocimiento específico del dominio insular: geografía, distritos, transporte, historia, ecología, administración y turismo. El entrenamiento se realizó íntegramente en un MacBook Air M5 con 16 GB de memoria unificada, lo que lo convierte en un ejemplo de ajuste fino de bajo coste.

El modelo se distribuye como adaptadores LoRA (no como pesos completos) y está pensado para usarse junto con recuperación aumentada (RAG) sobre el corpus `docanan/andaman-nicobar-corpus`. Su relevancia radica en ser, según el autor, el primer modelo abierto de generación de texto dedicado a este dominio, con una evaluación honesta que reporta tanto mejoras como regresiones frente al modelo base.

La versión con adaptador de rechazo (refusal adapter) alcanza un F1 de 0.558 sobre 112 preguntas retenidas cuando se combina con recuperación, y rechaza 25 de 32 preguntas sin respuesta. La versión sin rechazo obtiene 0.646 en el mismo conjunto, pero no rechaza ninguna pregunta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B) con adaptadores LoRA |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B; el autor usa secuencias de 2048 en entrenamiento) |
| Tipos de cuantización | Base en 4-bit MLX durante el entrenamiento; adaptadores en safetensors (compatibles con otras cuantizaciones del base) |
| Idiomas soportados | en, hi, ta, bn, te, ml |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA: `0000400_adapters.safetensors`, `0000800_adapters.safetensors`, `0001200_adapters.safetensors`, `0001600_adapters.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre Qwen3-1.7B, un transformer denso de 1.720 millones de parámetros. La configuración LoRA emplea rango 8, escala 20 (alpha PEFT 160), aplicada a las últimas 16 capas y a 7 módulos de proyección. El entrenamiento se realizó sobre 3163 pares de instrucción validados más 239 pares de rechazo (3275 filas en total), con una longitud de secuencia de 2048 y batch de 4, durante 1600 iteraciones, lo que supone 598.700 tokens vistos. La pérdida de validación descendió de 4.191 en la iteración 1 a 1.105 en la 1600.

El entrenamiento se ejecutó en un MacBook Air M5 (Mac17,3) con 16 GB de memoria unificada y macOS 27.2.1, con un throughput mediano de 488,5 tokens/s (rango 416-661). El autor documenta un proceso de evaluación riguroso con un conjunto retenido de 112 preguntas en dominio y un conjunto de sanidad general de 10 ítems, reportando también una regresión en el conjunto general (F1 de 0.106 a 0.308, mejora en este caso). Se probaron dos estrategias de recuperación (BM25 y embeddings multilingües e5-small) y dos granularidades de índice (párrafos vs. ventanas de frases), concluyendo que las ventanas de frases con solapamiento de una frase y 3 pasajes recuperados son la configuración por defecto (recall@3 del 75,9% y F1 de 0.716).

## Capacidades

- Generación de texto y respuesta a preguntas sobre el dominio de Andamán y Nicobar: geografía, distritos, transporte, historia, ecología, administración y turismo.
- Razonamiento y conocimiento general heredados de Qwen3-1.7B.
- Capacidad de rechazo (refusal) en el adaptador específico: responde "I do not know" cuando el contexto no contiene la respuesta (25 de 32 preguntas sin respuesta en evaluación).
- Soporte multilingüe limitado a inglés, hindi, tamil, bengalí, telugu y malayo.
- Integración con recuperación aumentada (RAG) mediante BM25 o embeddings; el autor recomienda índice de ventanas de frases.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito en la información proporcionada.

## Casos de uso

- Asistente turístico para las islas Andamán y Nicobar: el modelo puede responder preguntas sobre transporte, alojamiento, permisos y puntos de interés combinado con recuperación sobre el corpus de 1144 artículos, alcanzando F1 de 0.716 con ventanas de frases.
- Atención al ciudadano y administración local: responde consultas sobre distritos, trámites y estructura administrativa de las islas, con el adaptador de rechazo para evitar respuestas inventadas cuando la información no está en el corpus.
- Educación y divulgación ecológica: explicación de ecosistemas insulares, especies endémicas y conservación, usando el corpus como fuente de verdad y el modelo para reformular y contextualizar.
- Punto de información para visitantes y nuevos residentes: preguntas frecuentes sobre historia, cultura y geografía de las islas, con respuestas fundamentadas en recuperación.
- Investigación sobre modelos de bajo recurso: el modelo sirve como caso de estudio reproducible de ajuste fino LoRA en hardware de consumo (MacBook Air M5, 16 GB) para dominios con corpus limitados.
- Despliegue en entornos con recursos restringidos: al ser un adaptador sobre un base de 1.7B, puede ejecutarse en GPUs de consumo o incluso en CPU con cuantización, adecuado para prototipos y demostraciones locales.
- Filtrado y rechazo de consultas fuera de dominio: el adaptador de rechazo permite construir un sistema que derive a un humano o a un buscador general cuando la pregunta no está cubierta por el corpus.

## Benchmarks y rendimiento

Evaluación sobre 112 preguntas retenidas en dominio y 10 de sanidad general, decodificación greedy, `enable_thinking=False`, presupuesto de 120 tokens:

| Conjunto | F1 base | F1 ajustado | Delta |
|---|---|---|---|
| QA en dominio A&N (112) | 0.280 | 0.479 | +0.199 |
| Sanidad general (10) | 0.106 | 0.308 | +0.203 |

Recuperación con BM25 sobre 1144 artículos, mismo modelo ajustado:

| Configuración | F1 en dominio (112) | Rechazos |
|---|---|---|
| Ajustado, sin contexto | 0.479 | 0 |
| Ajustado, 3 pasajes recuperados | 0.646 | 0 |
| Ajustado, retrieval v2 (filtro de idioma, boost de título y entidad) | 0.636 | 0 |
| Ventanas de frases, 3 pasajes | 0.716 | No medido |
| Ventanas de frases, 5 pasajes | 0.677 | No medido |
| Ventanas de frases, 3 pasajes, adaptador de rechazo | 0.648 | 9 falsos rechazos |

Comparativa de recuperadores:

| Recuperador | Recall@3 (112) | F1 con contexto (112) |
|---|---|---|
| BM25 | 62% | 0.646 |
| Embeddings multilingual-e5-small | 63.4% | 0.616 |

Comportamiento de rechazo:

| Configuración | F1 en dominio (112) | Falsos rechazos (respondibles) | Rechazos (32 no respondibles) |
|---|---|---|---|
| Adaptador sin pares de rechazo | 0.479 | 0/112 | 0/32 |
| Adaptador con pares de rechazo | 0.477 | 6/112 | 25/32 |
| Adaptador con rechazo y recuperación | 0.558 | 6/112 | No medido |

## Requisitos de hardware

- El modelo base Qwen3-1.7B en precisión completa (FP16) requiere aproximadamente 3,4 GB de VRAM; con cuantización 4-bit, alrededor de 1 GB.
- Los adaptadores LoRA añaden una sobrecarga mínima (rango 8 sobre 16 capas), por lo que la VRAM total es prácticamente la del base.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs con 4-6 GB usando cuantización 4-bit.
- El autor entrenó en un MacBook Air M5 con 16 GB de memoria unificada, lo que confirma que la inferencia es viable en hardware de consumo.
- Opciones de despliegue: transformers con PEFT (cargando los adaptadores), llama.cpp/Ollama si se fusionan los adaptadores con el base y se convierte a GGUF, vLLM o TGI para servir el modelo fusionado.
- Throughput de entrenamiento reportado: 488,5 tokens/s mediana (rango 416-661) en MacBook Air M5. No se reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Dweep 1.7B | 1.720 M | No disponible | Apache-2.0 | Dominio Andamán y Nicobar, LoRA sobre Qwen3-1.7B | Hugging Face (adaptadores) |
| Qwen3-1.7B | 1.720 M | No disponible | Apache-2.0 | Modelo general base | Hugging Face |
| Qwen3-4B | 4.000 M (aprox.) | No disponible | Apache-2.0 | Modelo general, mayor capacidad | Hugging Face |
| Modelos de dominio similares | No disponible | No disponible | No disponible | No se han identificado alternativas públicas equivalentes para este dominio | No disponible |

## Limitaciones y advertencias

- El modelo es un ajuste fino de dominio: no sustituye a un asistente general y su rendimiento fuera del dominio de Andamán y Nicobar es limitado (F1 de 0.308 en el conjunto de sanidad general de 10 ítems).
- Riesgo de alucinación: sin recuperación, el modelo no rechaza preguntas sin respuesta (0 rechazos de 32 en la evaluación). El adaptador de rechazo introduce 6 falsos rechazos de 112 preguntas respondibles.
- Cobertura del corpus limitada: 27 de las 112 preguntas de evaluación no tienen respuesta recuperable en el corpus actual, lo que marca el techo de rendimiento.
- Idiomas: solo se declaran en, hi, ta, bn, te, ml; no se garantiza un rendimiento uniforme en todos ellos ni se documenta evaluación por idioma.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3-1.7B también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- El modelo se distribuye como adaptadores LoRA, no como pesos completos; es necesario cargar el base y aplicar los adaptadores, o fusionarlos previamente.
- El autor reporta que la instrucción de rechazo en el prompt por sí sola no cambió el comportamiento; se requiere el adaptador entrenado específicamente.
- No se documentan sesgos específicos ni evaluaciones de seguridad más allá del conjunto de sanidad general.
- El modelo fue creado en 2026 y tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/docanan/dweep-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset: https://huggingface.co/datasets/docanan/andaman-nicobar-corpus
- Repositorio del dataset con `claim_census.txt`: https://huggingface.co/datasets/docanan/andaman-nicobar-corpus
- Cuenta del autor: https://huggingface.co/docanan
- Cuenta `andamanopal` (políticas de RL y robótica): https://huggingface.co/andamanopal
