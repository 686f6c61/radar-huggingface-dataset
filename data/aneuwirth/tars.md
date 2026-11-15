# aneuwirth/tars

## Resumen

Tars 0.5 es un modelo de decisión de 395 millones de parámetros desarrollado por Andrew Neuwirth. No es un modelo generativo: recibe un comando hablado o escrito y elige una opción de una lista de habilidades (skills) que se le proporciona, devolviendo además una probabilidad asociada. Su función principal es el enrutamiento de intenciones: decidir dónde empieza y termina cada petición dentro de una frase, qué familia de aplicaciones debe gestionarla y qué habilidad concreta ejecutar.

El modelo parte de Von 1.2 de Victor Hugo (Apache-2.0), un modelo de decisión basado en ModernBERT, y se ha afinado completamente (encoder y cabeza de puntuación) sobre etiquetas sintéticas generadas por Claude para un catálogo de ejemplo de 10 familias y 31 habilidades. Está pensado como punto de partida para afinar sobre catálogos propios, no como solución final lista para producción.

Es relevante ahora porque ocupa un nicho poco cubierto: modelos pequeños, rápidos y ejecutables en local que resuelven el paso previo a la invocación de herramientas en asistentes de voz o agentes, con latencia de 280 ms en un Apple M5 Pro y un rendimiento del 69,2 % end-to-end en su benchmark público de comandos multi-paso, frente al 0 % del modelo base sin afinar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT con cabeza de puntuación de opciones (option-marker decision model) |
| Parámetros totales | 394.781.696 (≈395M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Von 1.2, un modelo de decisión de tipo *option-marker* basado en el encoder ModernBERT de Answer.AI y LightOn. La arquitectura es un transformer encoder bidireccional con una cabeza de puntuación que asigna probabilidades a opciones predefinidas; no genera texto libre. Se realizó un *full fine-tune* tanto del encoder como de la cabeza de puntuación.

Los datos de entrenamiento son completamente sintéticos y públicos: 8.432 frases etiquetadas para el catálogo de ejemplo (`catalogs/example.json`, 10 familias, 31 habilidades), generadas por Claude con 13 estilos de habla (telegráfico, casual, errores de dictado sin puntuación, divagaciones, etc.), comandos encadenados de 2 a 5 pasos, pares casi idénticos entre habilidades similares y ruido tipo "no es un comando" (`none`). Se añaden 13.000 filas de *replay* de razonamiento general del propio generador sintético de Von para evitar el olvido catastrófico, más ruido de reconocimiento de voz en la fase de construcción. En total, 76.542 filas de entrenamiento (63.542 de split, route y skill más 13.000 de replay), 3.124 pasos de optimizador (batch 8 × 4, learning rate 2e-5) y 151 minutos de entrenamiento en un Apple M5 Pro. El checkpoint final es el del paso 3.000, seleccionado por validación y replay general, nunca sobre el benchmark.

## Capacidades

- Segmentación de comandos: divide una frase que contiene varias peticiones en pasos independientes (split).
- Enrutamiento por familia: asigna cada paso a una familia de aplicaciones o habilidades del catálogo.
- Selección de habilidad: elige la skill concreta a ejecutar dentro de la familia enrutada.
- Detección de "no es un comando" (`none`): descarta charla o relleno que no constituye una petición.
- Puntuación con probabilidad por opción, útil para umbrales de confianza y fallback.
- No soporta tool calling generativo, ni function calling en el sentido habitual, ni agentes autónomos: solo clasifica entre opciones dadas.
- Sin capacidades multilingües: únicamente inglés.
- Sin visión, audio ni modo de razonamiento (thinking).
- No genera texto ni responde preguntas.

## Casos de uso

- Enrutamiento de intenciones en asistentes de voz locales: el modelo recibe la transcripción y decide qué skill del catálogo debe ejecutarse, con 280 ms de latencia en un portátil Apple M5 Pro, lo que permite una primera pasada rápida antes de invocar un modelo mayor.
- Descomposición de comandos compuestos: frases como "abre Tunebox y pon jazz y luego silencia" se separan en pasos (split exacto del 71,3 % en el benchmark) para que un orquestador los ejecute secuencialmente.
- Primera etapa de un pipeline híbrido: se actúa sobre la decisión de Tars cuando la probabilidad supera un umbral y se delega a reglas propias o a un modelo mayor por debajo de ese umbral.
- Punto de partida para afinar sobre un catálogo propio: la app Tars Mac ofrece "Start from Tars 0.5" para reentrenar con las habilidades reales de la organización.
- Filtrado de ruido conversacional: la clase `none` permite descartar charla o relleno antes de llegar al enrutador principal, reduciendo llamadas innecesarias.
- Automatización de escritorio o móvil con comandos cortos: integración en un asistente que mapea intenciones a apps concretas (reproductores, editores) mediante un catálogo JSON.
- Evaluación de catálogos de habilidades: el repositorio incluye pipeline de generación y evaluación, lo que permite medir la calidad del enrutamiento antes de desplegar.

## Benchmarks y rendimiento

Benchmark público de 477 comandos multi-paso (2 a 5 pasos) para el catálogo de ejemplo, generado con tres estilos de habla no vistos en entrenamiento:

| Modelo | End to end | Pasos correctos | Split exacto | Familias correctas | Habilidades correctas | Latencia mediana |
|---|---|---|---|---|---|---|
| Von 1.2 (base, sin afinar) | 0,0 % | 1,7 % | 0,4 % | 0,0 % | 0,0 % | 791 ms |
| Tars 0.5 | 69,2 % | 77,8 % | 71,3 % | 74,8 % | 74,8 % | 280 ms |

Preguntas individuales con los pasos correctos dados (mismas 477 frases):

| Tarea | Von 1.2 | Tars 0.5 |
|---|---|---|
| Split | 44,2 % | 98,6 % |
| Route | 29,0 % | 98,8 % |
| Skill | 74,7 % | 100,0 % |
| Frase completa | 0,0 % | 90,1 % |

Razonamiento general sobre 600 filas de replay de Von: 84,3 % → 91,2 %. La latencia se mide para el plan completo (todas las preguntas de split, route y skill) en proceso sobre Apple M5 Pro (MPS). Los resultados de Tars 0.4 (65,0 % end to end) provienen de un benchmark privado y no son comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en fp32 (395M parámetros); en fp16/bf16 alrededor de 1,5 GB, más overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en CPU y en MPS (Apple Silicon). Una RTX 4090 o A100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más (RTX 3060, RTX 4060, etc.), y en Apple Silicon mediante MPS.
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference y endpoints compatibles según los tags de Hugging Face. No se ha publicado versión GGUF, por lo que llama.cpp u Ollama requerirían conversión propia.
- Latencia y throughput: 280 ms de mediana para el plan completo en Apple M5 Pro (MPS). No se han publicado cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tars 0.5 | 395M | no disponible | Enrutamiento de intenciones y split de comandos | Apache-2.0 | Hugging Face |
| Von 1.2 (base) | no disponible | no disponible | Modelo de decisión option-marker | Apache-2.0 | GitHub (wfzyx/von) |
| ModernBERT | no disponible | no disponible | Encoder de propósito general | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de terceros comparables en la información proporcionada. La comparación directa más relevante es con su modelo base Von 1.2, sobre el que mejora de 0,0 % a 69,2 % end to end en el benchmark público.

## Limitaciones y advertencias

- Solo conoce las habilidades del catálogo de ejemplo; un catálogo propio requiere afinado. El modelo es un punto de partida, no un enrutador universal.
- La mayoría de errores son splits de más: palabras de relleno o incisos al inicio o en medio ("yo", "please", "cause the raid starts then") se convierten en un paso `none` propio. 92 de las 147 frases fallidas del benchmark tienen demasiados pasos.
- Las etiquetas fueron escritas por un LLM y arrastran sus errores y su idea de cómo habla la gente; algunas etiquetas del benchmark son discutibles.
- Solo inglés y probado con comandos cortos; el dictado largo queda fuera de alcance.
- Las probabilidades provienen de la calibración de Von 1.2 y no se recalibraron tras el afinado: en el benchmark están cerca de 1,0 para casi todos los pasos, incluso en frases erróneas, por lo que son una señal débil. Hay que verificarlas con datos propios antes de fijar un umbral.
- No es un modelo conversacional: no responde preguntas ni ejecuta acciones por sí mismo.
- Riesgo de alucinación en el sentido de asignar una skill incorrecta cuando el comando se parece a otra del catálogo (pares casi idénticos), no de inventar contenido.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución a Von 1.2 (Victor Hugo) según el NOTICE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aneuwirth/tars
- Repositorio de código, etiquetas y benchmark: https://github.com/andrewneuwirth/Tars
- Modelo base Von: https://github.com/wfzyx/von
- ModernBERT: https://github.com/AnswerDotAI/ModernBERT
