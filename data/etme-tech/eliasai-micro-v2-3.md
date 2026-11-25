# ETME-TECH/EliasAI-Micro-v2.3

## Resumen

EliasAI-Micro-v2.3 es un modelo de lenguaje compacto de aproximadamente 1.000 millones de parámetros (1.006.672.704 reales según los pesos en safetensors), desarrollado por ETME TECH (Elias Rickert) a partir del modelo base Qwen/Qwen3.5-0.8B-Base. Está especializado en conversación y razonamiento en alemán, con un flujo de "pensar primero" que emite un bloque `` en alemán antes de la respuesta final. La arquitectura subyacente corresponde a la familia Qwen3.5 de tipo transformer denso, etiquetada en el repositorio con el identificador `qwen3_5_text`.

El modelo se ha afinado mediante LoRA nativo en BF16 (r=32, alpha=64) con Differential Loss Weighting y NEFTune sobre un corpus de 33.737 diálogos alemanes curados de una a cinco rondas, repartidos en 12 categorías (explicaciones de conceptos, escritura y brainstorming, memoria a corto plazo, empatía y sarcasmo, opiniones y small talk, traducción/resumen/corrección, conjeturas calibradas, anti-gaslighting y anti-prompt-injection, correcciones honestas, dilemas morales, identidad ETME-TECH y minijuegos). El resultado es un modelo pequeño, orientado a despliegue local, con pesos publicados en safetensors BF16 y en dos cuantizaciones GGUF (Q8_0 y Q4_K_M).

Su relevancia radica en el nicho: un asistente conversacional alemán de bajo coste computacional que cabe en hardware de consumo y que prioriza respuestas directas con conjeturas calibradas frente a la negativa sistemática. La licencia Apache 2.0 facilita su integración comercial, aunque el alcance real está limitado por su tamaño y por un ajuste centrado casi exclusivamente en alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 1.006.672.704 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `-c 4096` |
| Tipos de cuantizacion | BF16 (safetensors), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, un transformer denso de la familia Qwen3.5, y se afina con LoRA nativo en BF16 con rango 32 y alpha 64. El entrenamiento incorpora Differential Loss Weighting y NEFTune, además de un ajuste del cabezal EOS (`<|im_end|>`) con calibración convexa, un detalle orientado a controlar con precisión cuándo el modelo debe terminar el turno. El dataset de la versión V6 consta de 33.737 diálogos alemanes curados, de una a cinco rondas, distribuidos en 12 categorías equilibradas que cubren desde explicaciones de conceptos hasta resistencia a prompt injection y anti-gaslighting.

La innovación principal no es arquitectónica sino de comportamiento: el modelo emite un razonamiento breve y estructurado en `` (indicado en el system prompt como 3 a 6 frases naturales en alemán) antes de responder, siguiendo un principio de "intentar primero" con conjeturas calibradas y admisión explícita de incertidumbre en lugar de rechazos innecesarios. No se documentan técnicas como decodificación especulativa, atención lineal ni mezcla de expertos.

## Capacidades

- Generación de texto conversacional en alemán con tono directo y coloquial.
- Razonamiento breve en modo "thinking" mediante bloques `` antes de la respuesta.
- Explicación de conceptos y soporte a escritura, resumen, traducción y corrección de textos.
- Memoria a corto plazo dentro de la conversación multi-turno (hasta cinco rondas en el entrenamiento).
- Manejo de empatía, sarcasmo y lenguaje coloquial.
- Conjeturas calibradas con declaración explícita de incertidumbre en lugar de negativa automática.
- Resistencia a prompt injection y anti-gaslighting según las categorías del dataset.
- Identidad de marca definida (ETME-TECH / Elias Rickert) mediante system prompt.
- Soporte de diálogo multi-turno y small talk.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otros modos especiales.

## Casos de uso

- Asistente conversacional local en alemán: el modelo puede desplegarse con llama.cpp u Ollama en un equipo de sobremesa y gestionar diálogos multi-turno con contexto de hasta 4096 tokens, adecuado para atención básica al usuario en alemán.
- Generación y corrección de textos en alemán: redacción de borradores, resúmenes y correcciones estilísticas en un pipeline de edición, aprovechando su ajuste en las categorías de escritura, resumen y corrección.
- Chatbot de marca con identidad controlada: el system prompt define una persona concreta (Elias AI de ETME TECH), lo que permite fijar tono y límites de actuación en un asistente de producto o web.
- Prototipado rápido de aplicaciones de IA: al pesar 646 MB en Q4_K_M, sirve como modelo de desarrollo para validar flujos de chat y prompts antes de migrar a modelos mayores.
- Traducción y adaptación de textos hacia y desde el alemán en tareas de volumen moderado, dentro de las capacidades de traducción incluidas en el dataset de entrenamiento.
- Filtrado y resistencia a manipulación en entornos expuestos: su entrenamiento en anti-prompt-injection y anti-gaslighting lo hace utilizable como primera capa de un asistente que debe mantener coherencia ante intentos de manipulación.
- Educación y explicación de conceptos: resolución de dudas cotidianas y explicaciones divulgativas en alemán con razonamiento explícito en el bloque de pensamiento.

## Benchmarks y rendimiento

La model card reporta un "benchmark en vivo" final de 17/18 con TTR de 0,94 y validation loss de 1,5699. No se especifica la composición ni la metodología de ese benchmark, por lo que no es posible compararlo con métricas estándar.

| Metrica | Valor | Nota |
|---|---|---|
| Benchmark en vivo | 17/18 | Metodología no detallada en la model card |
| TTR | 0,94 | Type-token ratio reportado por el autor |
| Validation loss | 1,5699 | Sobre el conjunto de validación del autor |
| MMLU, HumanEval, GSM8K | no disponible | No publicados en la información disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en BF16 (pesos de 1.920 MB), unos 1,1 GB en GGUF Q8_0 y unos 0,7 GB en GGUF Q4_K_M, más el espacio para el contexto KV.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen holgado. En entornos profesionales, una A100 o H100 no aporta ventaja relevante por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (comando de ejemplo con `llama-server` en el puerto 8080), Ollama y cualquier runtime compatible con GGUF; el repositorio incluye safetensors para usar con transformers.
- Parámetros de muestreo sugeridos por el autor: temperatura 0,55, top-p 0,90 y repeat penalty 1,06.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera inferencia en tiempo real en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| EliasAI-Micro-v2.3 | 1.006.672.704 | no disponible (ejemplo a 4096) | Alemán | Apache 2.0 | Afinado para conversación y razonamiento en alemán |
| Qwen3.5-0.8B-Base | ~0,8B (según nombre del modelo base) | no disponible | Multilingüe (no detallado) | no disponible en la información | Modelo base del que deriva |
| Alternativas de ~1B para alemán | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; los datos de benchmarks estándar no están publicados.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en alemán; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Tamaño de 1B parámetros: capacidad limitada para matemáticas, código y razonamiento complejo; el propio autor recomienda derivar a modelos mayores (Gemini, Claude) en tareas difíciles.
- Riesgo de alucinación inherente a modelos pequeños; el diseño de "conjeturas calibradas" admite incertidumbre, pero no elimina el riesgo de afirmaciones incorrectas.
- El benchmark reportado (17/18) carece de metodología pública, por lo que no debe tomarse como evidencia comparable a evaluaciones estándar.
- La longitud de contexto no está declarada formalmente; el ejemplo de despliegue fija 4096 tokens, y no hay garantía de calidad más allá de ese valor.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset curado por un único autor puede introducir sesgos de estilo y de contenido.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones del modelo base Qwen3.5-0.8B-Base.
- El comportamiento depende en gran medida del system prompt recomendado; sin él, la persona y los límites de actuación pueden degradarse.
- Repositorio con cero descargas y cero likes en el momento de la consulta: ecosistema de validación externa prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/ETME-TECH/EliasAI-Micro-v2.3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- llama.cpp (runtime de ejemplo): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos del autor.
