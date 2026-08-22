# Klaus-Kramer/Grimmelshausen

## Resumen

Grimmelshausen es un modelo de lenguaje generativo de texto, especializado en alemán literario temprano (Frühneuhochdeutsch, es decir, el alemán del siglo XVII). Se trata de un fine-tune del modelo Qwen3-4B mediante LoRA/QLoRA, desarrollado por Klaus-Kramer, que adapta la base a un estilo arcaico y barroco inspirado en la obra de Hans Jakob Christoffel von Grimmelshausen, autor de *Simplicissimus*. El modelo responde preguntas, explica conceptos y escribe historias o poemas con una voz narrativa que imita la prosa y la poesía de la época barroca, incluyendo formas verbales obsoletas, frases largas y un tono literario deliberado.

El modelo se distribuye en dos formatos: un adaptador LoRA en formato PEFT (safetensors) para cargar sobre Qwen3-4B con Transformers, y dos archivos GGUF (Q4_K_M y f16) para su uso con Ollama o llama.cpp. La licencia es Apache-2.0, tanto para el adaptador como para el modelo base. El interés principal radica en su carácter creativo y experimental: no busca precisión factual, sino fidelidad estilística, y por ello se recomienda desactivar el modo de razonamiento del modelo base (con `--think=false` en Ollama) para evitar bloques de razonamiento que rompan el estilo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen3-4B) con adaptador LoRA |
| Parámetros totales | 4.022.468.096 (modelo base Qwen3-4B; el adaptador LoRA añade parámetros no especificados) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 (contexto del modelo base Qwen3-4B); el entrenamiento del adaptador usó secuencias de 1024 tokens |
| Tipos de cuantización | GGUF Q4_K_M, GGUF f16; el adaptador LoRA se entrena con cuantización NF4 base (QLoRA) |
| Idiomas soportados | Alemán (de), con especialización en Frühneuhochdeutsch (alemán moderno temprano) |
| Licencia | Apache-2.0 (tanto el adaptador como el modelo base) |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (modelo fusionado) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-4B, un transformer causal con atención por ventanas y soporte de razonamiento (thinking mode). El adaptador LoRA se aplica mediante QLoRA (cuantización NF4 del modelo base) con rango 16, alpha 16, tasa de aprendizaje 1.2e-4 y una única época. El conjunto de entrenamiento es un corpus curado de literatura alemana del siglo XVII y diálogos de pregunta-respuesta en lenguaje arcaico, no publicado. La longitud máxima de secuencia en el entrenamiento fue de 1024 tokens, lo que limita la coherencia en contextos muy largos, aunque el modelo base soporta hasta 32 768. No se han documentado técnicas adicionales como RLHF o DPO; el ajuste es únicamente de supervisión con el corpus literario.

## Capacidades

- Generación de texto en alemán arcaico (Frühneuhochdeutsch) con estilo barroco, incluyendo formas verbales obsoletas, vocabulario antiguo y construcciones sintácticas complejas.
- Respuesta a preguntas generales con un registro literario y evocador, priorizando la forma sobre la exactitud.
- Narración de historias y creación de poemas con estructura métrica y retórica barroca.
- Explicación de conceptos (ciencia, tecnología, cultura) en un lenguaje descriptivo y metafórico, como se muestra en el ejemplo sobre "qué es un computador".
- Soporte de razonamiento interno heredado de Qwen3-4B, pero el autor recomienda desactivarlo (`--think=false`) para mantener la fluidez del estilo.
- No se documenta soporte de tool calling, function calling ni capacidades multimodales.

## Casos de uso

- Creación de contenido literario: escribir cuentos, poemas o fragmentos narrativos en estilo barroco para proyectos de ficción, teatro o recreación histórica. El modelo puede generar párrafos completos con la voz de Grimmelshausen.
- Reescritura de textos modernos a alemán arcaico: traducir o adaptar descripciones técnicas o narrativas a un registro literario del siglo XVII, útil para proyectos de divulgación histórica o arte conceptual.
- Generación de diálogos para videojuegos o juegos de rol ambientados en el Barroco: producir conversaciones de personajes con un lenguaje coherente y estilizado, gracias a la capacidad de mantener un registro consistente.
- Educación y divulgación de la literatura alemana: generar ejemplos de prosa barroca para cursos de historia de la lengua o talleres de escritura creativa, permitiendo que los estudiantes vean aplicaciones prácticas del Frühneuhochdeutsch.
- Prototipos de chatbots con personalidad histórica: implementar un asistente conversacional que responda con un carácter literario definido, por ejemplo para museos, exposiciones o experiencias interactivas.
- Investigación en estilística y procesamiento de lenguaje histórico: el modelo puede servir como generador de texto de referencia para estudiar la evolución del alemán o para probar técnicas de análisis estilístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo está orientado a la fidelidad estilística, no al rendimiento en tareas estándar (MMLU, HumanEval, GSM8K), por lo que no existen datos comparativos.

## Requisitos de hardware

- El archivo GGUF Q4_K_M pesa aproximadamente 2,4 GB, por lo que se puede ejecutar en GPU con 4 GB de VRAM o incluso en CPU con suficiente RAM (se recomienda al menos 8 GB).
- El archivo GGUF f16 pesa unos 7,7 GB, lo que requiere una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070/3080 o superior).
- Si se usa el adaptador LoRA sobre el modelo base Qwen3-4B en transformers, el modelo base en fp16 ocupa ~8 GB; se puede reducir con cuantización del base (por ejemplo, con bitsandbytes) para caber en 6 GB.
- Opciones de despliegue: Ollama (recomendado con `--think=false`), llama.cpp, vLLM (si se fusiona el adaptador con el base), o cualquier servidor compatible con PEFT.
- Latencia: no se reportan datos, pero al ser un modelo de 4B con cuantización Q4, la inferencia en una GPU moderna (RTX 4090) es de unos 20-40 tokens/s, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de modelos comparables con el mismo perfil (fine-tune de Qwen3-4B para alemán arcaico). Como referencia, se compara con el modelo base:

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Qwen3-4B (base) | 4B | 32 768 | Apache-2.0 | Multilingüe generalista, con razonamiento |
| Grimmelshausen (adaptador) | 4B + LoRA | 32 768 (base) | Apache-2.0 | Alemán arcaico literario |
| Otros fine-tunes de Qwen3 (no identificados) | — | — | — | — |

No se dispone de otros modelos similares en el ecosistema de HuggingFace con la misma función.

## Limitaciones y advertencias

- La precisión en tareas aritméticas y factuales es baja; el modelo tiende a inventar datos para mantener el estilo literario.
- Riesgo de alucinación elevado cuando se pregunta sobre temas fuera del corpus literario del siglo XVII, ya que no se entrenó con datos enciclopédicos.
- El estilo arcaico puede resultar difícil de leer para hablantes nativos de alemán moderno; no es adecuado para comunicación técnica o legal.
- La longitud de secuencia del entrenamiento (1024 tokens) puede degradar la coherencia en textos largos, aunque el modelo base soporta más contexto.
- No se ha publicado el dataset de entrenamiento, lo que impide auditar el contenido o la diversidad de las fuentes.
- El modelo no tiene soporte para tool calling ni integración con agentes, a diferencia del modelo base Qwen3.
- La licencia Apache-2.0 permite uso comercial, pero se debe respetar la nota de derechos de autor del autor (Klaus Kramer) y la del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/Klaus-Kramer/Grimmelshausen
- Repositorio del autor (agente minimal en C++): https://github.com/klaus-kramer/agent-minimal/tree/main
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
