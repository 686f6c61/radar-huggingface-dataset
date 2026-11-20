# dikiyplayerpig/dpp-gpt-V2.2-Pro-260m

## Resumen

dpp-gpt V2.2 Pro (260M) es un modelo de lenguaje de 242 millones de parámetros únicos (259M con embeddings atados) entrenado íntegramente desde cero por un único desarrollador sobre una GPU de consumo RTX 4060. Desarrollado por dikiyplayerpig, el modelo emplea una arquitectura de estilo Llama con RMSNorm, RoPE, SwiGLU y atención con query grouping (GQA), y está diseñado para razonamiento paso a paso, aritmética de números largos, tool calling y generación de JSON a partir de descripciones.

El modelo es la versión final de la línea 2.2 Pro: parte del checkpoint de SFT (2.2 Pro preview) y se refina mediante nueve rondas de GRPO (Group Relative Policy Optimization) con recompensas verificadas por código en su mayoría. Según los benchmarks propios del autor, la media de su suite pasó del 17,8 % en el preview al 24,2 % en esta versión final. Soporta ruso, inglés y francés, con una longitud de contexto de 8192 tokens y un vocabulario BPE propio de 16 384 entradas.

Su relevancia radica en demostrar que es posible entrenar, afinar y aplicar RL sobre un modelo funcional de 260M parámetros con recursos de consumo, publicando pesos en safetensors, GGUF (múltiples cuantizaciones) y PyTorch bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (RMSNorm, RoPE, SwiGLU, GQA) |
| Parametros totales | 259M (242 263 040 únicos; embeddings de entrada y salida atados) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K; safetensors (fp32/bf16 según repo); PyTorch `.pth` |
| Idiomas soportados | Ruso (ru), inglés (en), francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, PyTorch `.pth` |
| Capas / hidden / cabezas / KV heads | 20 / 1024 / 16 / 4 (GQA) |
| Vocabulario | 16 384 (BPE propio) |
| Modelo base | dikiyplayerpig/dpp-gpt-V2.2-Pro-preview-260m (SFT) |
| Tamaño del repo | 2,6 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama con 20 capas, dimensión oculta de 1024, 16 cabezas de atención y 4 cabezas KV (GQA), normalización RMSNorm, embeddings rotatorios (RoPE) y activación SwiGLU. Los embeddings de entrada y salida están atados, lo que reduce el recuento efectivo a 242M parámetros únicos. El vocabulario es un BPE propio de 16 384 tokens.

El preentrenamiento partió del modelo 2.2 Base (≈31B tokens, continuación del preentrenamiento de 2.1 Base), seguido de aproximadamente 60M tokens de datos de SFT. Sobre el checkpoint de SFT (preview) se aplicaron nueve rondas de GRPO de 50 a 350 pasos, cada una partiendo del mejor checkpoint previo. En las rondas finales, un paso equivale a 16 prompts × 8 respuestas (más algunas a mayor temperatura), con ventaja relativa de grupo, penalización KL respecto a un modelo de referencia y una pequeña pérdida de replay SFT para evitar olvido catastrófico. Casi todas las recompensas se verifican por código (aritmética, problemas verbales escolares en tres idiomas, funciones Python ejecutadas contra tests, JSON desde descripción, extracción de números, restricciones de formato, tool calls en varios formatos, traducción por similitud, opción múltiple e instrucciones de respuesta corta); solo ensayos, poemas y respuestas factuales usan un juez local Gemma 4 E4B. Se aplica selección de dificultad para muestrear menos las tareas siempre resueltas o nunca resueltas. El modelo final es una media ponderada de tres checkpoints RL: 0,4 · GRPO8 paso 100 + 0,3 · GRPO9 paso 150 + 0,3 · GRPO5 paso 200.

## Capacidades

- Generación de texto conversacional en ruso, inglés y francés.
- Razonamiento paso a paso con conmutador `[THINK]` para activar o desactivar la cadena de pensamiento.
- Aritmética con números largos (hasta 10^40), incluyendo suma, resta, multiplicación, división, paréntesis, ecuaciones y fracciones.
- Resolución de problemas verbales escolares (precios, cambio, velocidad, edades).
- Generación de JSON válido a partir de una descripción en lenguaje natural.
- Tool calling / function calling en varios formatos, incluyendo la decisión de no invocar herramienta cuando no es necesaria y responder a partir de un resultado inesperado.
- Generación de código Python de funciones pequeñas, verificable mediante ejecución contra tests.
- Instrucciones de formato con múltiples restricciones simultáneas (idioma, límite de palabras, título, lista con viñetas, palabras de inicio/fin).
- Extracción de información numérica en textos con distractores.
- Preguntas de opción múltiple (hechos, lógica, aritmética).
- Traducción entre los idiomas soportados.
- Redacción de ensayos y poemas cortos.
- Respuestas factuales breves.

## Casos de uso

- Asistente conversacional ligero en ruso, inglés o francés: con 8192 tokens de contexto puede mantener conversaciones multi-turno y recordar instrucciones previas, desplegable en hardware modesto.
- Automatización de tool calling en agentes pequeños: el modelo elige la herramienta y el argumento correctos o decide no invocar ninguna, integrándose en orquestadores de agentes con pasos múltiples.
- Extracción estructurada de datos: generación de JSON válido a partir de descripciones en lenguaje natural para poblar formularios, APIs o pipelines ETL.
- Verificación aritmética y resolución de problemas verbales: útil en asistentes educativos o de cálculo donde se requiere el resultado numérico exacto en lugar de una explicación aproximada.
- Generación de funciones Python pequeñas en entornos de CI/CD: dado que el modelo produce código verificable, puede integrarse en pipelines que ejecutan tests automáticos sobre las funciones generadas.
- Procesamiento de instrucciones con restricciones de formato: generación de respuestas con límite de palabras, listas, títulos o palabras obligatorias para sistemas de plantillas y generación de contenido controlado.
- Análisis de textos con distractores: localización de cifras concretas en documentos cortos, útil para extracción de datos de informes o resúmenes.
- Traducción asistida entre ruso, inglés y francés en entornos con recursos limitados.

## Benchmarks y rendimiento

Los datos proceden de la suite propia del autor (12 áreas, 2450 preguntas en ru/en/fr, cada pregunta formulada dos veces con y sin thinking, temperatura 0,1). El autor advierte que estos números no son comparables con benchmarks públicos y pueden estar inflados a favor de dpp-gpt.

| Columna | Preguntas | Verificación | 2.2 Pro |
|---|---|---|---|
| instr | 300 | código | no disponible (solo media global) |
| reading | 200 | código | no disponible |
| wordmath | 300 | código | no disponible |
| json | 150 | código | no disponible |
| tools | 200 | código | no disponible |
| knowledge | 400 | juez Gemma 4 26B | no disponible |
| mcq | 400 | código | no disponible |
| pysmall | 150 | código (tests ocultos) | no disponible |
| pyopen | 80 | juez | no disponible |
| poem | 60 | juez | no disponible |
| essay | 60 | juez | no disponible |
| chat | 150 | no especificado | no disponible |

Datos agregados publicados:

| Métrica | Base | Preview (SFT) | 2.2 Pro |
|---|---|---|---|
| Media de la suite (12 áreas) | no disponible | 17,8 % | 24,2 % |
| Aritmética (2200 tareas generadas) | 47,6 % | 36,8 % | 51,3 % |
| Media por juez Gemma 4 E4B (checkpoints RL) | — | — | 24,1–25,2 % (individuales) → 25,9 % (media ponderada) |
| 2.15 Pro (referencia de la línea anterior) | — | — | 8,3 % (media de la suite) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en F16 (259M × 2 bytes), ~0,27 GB en Q8_0, ~0,2 GB en Q4_K_M y ~0,13 GB en Q2_K, sin contar overhead de contexto KV (20 capas, 4 KV heads, 8192 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones GGUF; el modelo fue entrenado en una RTX 4060, por lo que cabe holgadamente en GTX 1660, RTX 3060, RTX 4060 y superiores. Para F16 y contexto completo se recomienda al menos 4 GB.
- Cabe en GPU de consumo: sí, en todas las GPU modernas con 2 GB o más de VRAM, incluidas integradas con suficiente memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors con `LlamaForCausalLM`; transformers de Hugging Face para inferencia directa; endpoints compatibles según los tags del repo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| dpp-gpt V2.2 Pro 260M | 259M (242M únicos) | 8192 | ru, en, fr | Apache 2.0 | safetensors, GGUF, `.pth` | Entrenado desde cero en una RTX 4060; RL con GRPO |
| Qwen2.5-0.5B | 494M | 32 768 | multilingüe (29+) | Apache 2.0 | safetensors, GGUF | Mayor tamaño y contexto; benchmarks públicos disponibles |
| SmolLM2-360M | 362M | 8192 | en (principalmente) | Apache 2.0 | safetensors, GGUF | Enfocado en inglés; entrenado con datos públicos a mayor escala |
| Llama-3.2-1B | 1,24B | 131 072 | multilingüe (8) | Llama 3.2 Community License | safetensors, GGUF | Mayor capacidad pero licencia restrictiva y más recursos |

Los datos de rendimiento comparativo entre estos modelos no están disponibles en la información proporcionada; los benchmarks de dpp-gpt V2.2 Pro son propios y no comparables con las puntuaciones publicadas de los modelos alternativos.

## Limitaciones y advertencias

- Los benchmarks publicados son propios del autor, construidos con sus formatos de prompt y generadores compartidos con los datos de RL; pueden estar inflados y no son comparables con métricas estándar.
- El modelo es de 260M parámetros, por lo que su capacidad factual y de razonamiento complejo es limitada en comparación con modelos de mayor escala; se esperan alucinaciones en preguntas factuales abiertas.
- El soporte multilingüe se limita a ruso, inglés y francés; no se garantiza un rendimiento adecuado en otros idiomas.
- La ventana de contexto de 8192 tokens es reducida frente a modelos contemporáneos, lo que limita tareas de contexto largo.
- El modelo puede mostrar sesgos presentes en los datos de preentrenamiento y SFT, cuya composición no se detalla en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la robustez frente a entradas adversarias.
- El uso del modo `[THINK]` añade latencia y tokens generados; en tareas simples puede degradar la respuesta si no se desactiva.
- El modelo fue entrenado por una sola persona en una GPU de consumo; no ha pasado por procesos de auditoría de seguridad ni de alineación a gran escala.
- La media ponderada de checkpoints RL implica que algunas capacidades concretas (por ejemplo, multiplicación) pueden ser inferiores a las de un checkpoint individual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dikiyplayerpig/dpp-gpt-V2.2-Pro-260m
- Modelo base (preview SFT): https://huggingface.co/dikiyplayerpig/dpp-gpt-V2.2-Pro-preview-260m
- Modelo 2.2 Base: https://huggingface.co/dikiyplayerpig/dpp-gpt-V2.2-base-260m
- Perfil del autor: https://huggingface.co/dikiyplayerpig
