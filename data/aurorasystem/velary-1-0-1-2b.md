# AuroraSystem/Velary-1.0-1.2B

## Resumen

Velary 1.0 1.2B es un modelo generativo compacto y bilingüe (ruso/inglés) desarrollado por AuroraSystem (Aurora AI), un ajuste fino sobre LiquidAI/LFM2.5-1.2B-Thinking. Con 1,17B parámetros y una ventana de contexto declarada de 128 000 tokens, está pensado para desplegarse en hardware modesto manteniendo un modo de razonamiento explícito. Su rasgo más distintivo es la existencia de tres niveles de esfuerzo de razonamiento (`none`, `medium`, `high`) que se activan mediante el tag `<|effort=...|>` al final del mensaje del usuario.

El problema que aborda es el de los modelos pequeños que rinden mal en tareas de matemáticas y razonamiento estructurado: según la model card, el ajuste eleva la categoría de matemáticas del 44% del modelo base al 93% en su suite propia ABench75, y añade competencia en ruso sobre una base de LFM2.5 con sesgo anglocéntrico. La arquitectura es LFM2, un diseño híbrido de convoluciones y atención, con tokenizador LFM2.5 de vocabulario 65 536.

Es relevante ahora porque ocupa el nicho de los modelos sub-2B con razonamiento configurable, orientados a inferencia local y a entornos con restricciones de VRAM. Sus pesos se distribuyen en safetensors (bf16) y es compatible con transformers y llama.cpp vía GGUF. La licencia es Apache-2.0. El modelo tiene un historial público mínimo en HuggingFace (0 descargas y 0 likes en el momento de la consulta), por lo que la validación externa es prácticamente inexistente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida: convoluciones + atención) |
| Parametros totales | 1,17B (el ID del repositorio indica 1,2B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens (el ejemplo de llama.cpp usa `-c 131072`) |
| Tipos de cuantizacion | safetensors en bf16; GGUF mediante llama.cpp (el autor muestra el ejemplo `f16`). No se detallan otros niveles (q4, q8, etc.) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16); conversión a GGUF para llama.cpp |
| Tokenizador | LFM2.5, vocabulario de 65 536 tokens |
| Modelo base | LiquidAI/LFM2.5-1.2B-Thinking |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es LFM2, denominada por el autor como "hybrid conv + attention": combina capas convolucionales con capas de atención, un patrón habitual en los modelos de LiquidAI para reducir el coste de la atención sobre contextos largos. El modelo deriva de LiquidAI/LFM2.5-1.2B-Thinking, por lo que hereda el tokenizador LFM2.5 (vocabulario de 65 536) y, presumiblemente, parte de su comportamiento de razonamiento; la model card no especifica si el ajuste fino se hizo por SFT, DPO, RLHF u otro método.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste ni los datos concretos usados para el entrenamiento en ruso. La innovación técnica destacable que sí se documenta es el mecanismo de esfuerzo de razonamiento en tres niveles, controlado por el tag `<|effort=none|>`, `<|effort=medium|>` o `<|effort=high|>` insertado al final del mensaje del usuario. Este mecanismo permite intercambiar latencia y tokens generados por profundidad de razonamiento sin cambiar de modelo.

El autor publica además ABench75, una suite de evaluación propia auto-corregida con 375 tareas (75 por categoría: math, logic, code, cyber, general) en inglés y ruso, cuyos resultados se usan como métrica principal del modelo. No se documenta el procedimiento de ajuste ni si hubo decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto bilingüe en ruso e inglés, con instrucción de sistema que fuerza la respuesta en el idioma del usuario.
- Razonamiento configurable en tres niveles de esfuerzo (`none`, `medium`, `high`) mediante el tag `<|effort=...|>`.
- Matemáticas: 93% en la categoría Math de ABench75 en modo `high`, frente al 44% del modelo base.
- Código: ABench75 incluye una categoría `code`, pero el autor no publica el desglose numérico de esa categoría en la información disponible.
- Ciberseguridad: 91% en la categoría Cyber de ABench75 en modo `high`.
- Razonamiento lógico: categoría Logic presente en ABench75, con un resultado global declarado por el autor de aproximadamente 51%, señalado como punto débil.
- Comprensión y generación en ruso: 73% en la categoría Russian de ABench75, por debajo de Qwen3-1.7B (78%) y Qwen2.5-1.5B (85%).
- Compatibilidad con transformers (`AutoModelForCausalLM`) y con llama.cpp mediante `llama-server` con plantilla Jinja (`--jinja`).
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte explícito de agentes o multi-step reasoning orquestado: no disponible (solo se documenta el razonamiento interno por niveles).
- Capacidades de visión, audio o multimodalidad: no disponibles.
- Idiomas adicionales al ruso e inglés: no disponibles.

## Casos de uso

- Asistentes locales en ruso e inglés: al pesar 1,17B parámetros en bf16, el modelo se ejecuta en GPU de consumo o incluso en CPU vía llama.cpp, lo que permite desplegar un asistente bilingüe sin conexión y sin coste por token.
- Generación de código asistida en entornos con recursos limitados: integrable mediante transformers en editores o scripts de CI para autocompletado y explicación de fragmentos, siempre que se valide la salida, ya que el autor no publica métricas de la categoría `code`.
- Resolución de problemas matemáticos de nivel académico: con `<|effort=high|>` alcanza el 93% en la categoría Math de la suite del autor, adecuado para tutores automáticos o verificación de ejercicios paso a paso.
- Clasificación y análisis de seguridad (cyber): el 91% en la categoría Cyber de ABench75 lo hace utilizable para triaje de logs, explicación de conceptos de seguridad o generación de reglas sencillas, con revisión humana obligatoria.
- Procesamiento de documentos largos: la ventana de 128 000 tokens permite resumir o extraer información de contratos, informes o hilos completos sin troceado agresivo, algo poco habitual en modelos de este tamaño.
- Prototipado rápido de pipelines de razonamiento: los tres modos de esfuerzo permiten usar el mismo checkpoint para tareas de baja latencia (`none`) y tareas que requieren cadena de pensamiento (`high`), simplificando el mantenimiento de un único modelo en producción.
- Evaluación comparativa interna de modelos pequeños: útil como referencia base para equipos que comparan alternativas sub-2B en ruso e inglés con presupuesto de cómputo reducido.

## Benchmarks y rendimiento

Resultados de ABench75 (suite propia del autor, 375 tareas, auto-corregida, inglés + ruso) según el modo de esfuerzo:

| Modo | Overall |
|---|---|
| none | 69,6% |
| medium | 75,5% |
| high | 77,1% |

Comparativa por categoría publicada en la model card (el modo de los modelos de referencia no se especifica):

| Categoría | LFM2.5-1.2B | Qwen3-0.6B | Qwen2.5-1.5B | Qwen3-1.7B | Velary 1.0 high |
|---|---|---|---|---|---|
| Math | 44% | 91% | 85% | 89% | 93% |
| Cyber | 88% | 84% | 93% | 97% | 91% |
| Russian | 52% | 60% | 85% | 78% | 73% |

Datos adicionales aportados por el autor en la sección de limitaciones:

| Metrica | Valor |
|---|---|
| GSM8K (zero-shot) | ~56% (por debajo de modelos de 1,5B) |
| Tareas de lógica (ABench75, categoría logic) | ~51% |

No se han publicado resultados de benchmarks estándar independientes (MMLU, HumanEval, GSM8K completo, etc.) en la información disponible, más allá de la cifra aproximada de GSM8K citada por el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2,3 GB solo para pesos (1,17B × 2 bytes); con overhead de runtime y caché KV, un presupuesto realista de 4-6 GB para contextos moderados. Estimación aritmética, no un dato publicado por el autor.
- VRAM estimada en GGUF cuantizado: por debajo de 1 GB en cuantizaciones de 4 bits (estimación derivada del número de parámetros).
- La caché KV para 128 000 tokens puede consumir varios GB adicionales según el número de capas y cabezas del modelo base, dato no disponible en la model card.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100, H100). En bf16 cabe holgadamente en GPUs de consumo; para el contexto completo de 128K se recomienda una GPU con al menos 16-24 GB.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 6-8 GB con contexto corto, y en cuantizaciones GGUF en equipos aún más modestos.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`) y llama.cpp (`llama-server -m velary-1.0-f16.gguf --jinja -c 131072 -ngl 99`). Compatibilidad con vLLM, TGI u Ollama: no disponible en la información proporcionada.
- Latencia y throughput estimados: no disponibles. El modo `high` genera más tokens de razonamiento que `none`, por lo que la latencia efectiva será proporcionalmente mayor, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Math (ABench75) | Cyber (ABench75) | Russian (ABench75) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Velary 1.0 1.2B (high) | 1,17B | 128 000 | 93% | 91% | 73% | apache-2.0 | HuggingFace, safetensors y GGUF |
| LiquidAI/LFM2.5-1.2B-Thinking | 1,2B | no disponible (el derivado declara 128 000) | 44% | 88% | 52% | no disponible | HuggingFace |
| Qwen3-1.7B | 1,7B | no disponible | 89% | 97% | 78% | no disponible | no disponible |
| Qwen2.5-1.5B | 1,5B | no disponible | 85% | 93% | 85% | no disponible | no disponible |
| Qwen3-0.6B | 0,6B | no disponible | 91% | 84% | 60% | no disponible | no disponible |

Lectura de la tabla: Velary 1.0 lidera en matemáticas dentro de esta comparativa, pero queda por debajo de Qwen3-1.7B en Cyber y de Qwen2.5-1.5B y Qwen3-1.7B en ruso. Al ser la suite de evaluación propiedad del autor, la comparación no es directamente homologable con benchmarks estándar.

## Limitaciones y advertencias

- Razonamiento matemático multi-paso débil: el propio autor cifra GSM8K zero-shot en torno al 56%, por debajo de modelos de 1,5B.
- Tareas de lógica: aproximadamente 51%, señalado explícitamente como el punto más flojo del modelo.
- Ruso insuficiente frente a alternativas: 73% en ABench75, por debajo de Qwen3-1.7B y Qwen2.5-1.5B, porque la base LFM2.5 está sesgada hacia el inglés.
- Idiomas: solo ruso e inglés documentados; no se declara soporte de castellano ni de otras lenguas, por lo que no debe asumirse su uso en producción multilingüe.
- Los benchmarks proceden de ABench75, una suite propia del autor (375 tareas) y no de un benchmark independiente; existe riesgo de sobreajuste a esa evaluación y de sesgo de selección en la comparativa con modelos de terceros.
- Riesgo de alucinación: inherente a un modelo de 1,17B sin datos publicados de tasas de fidelidad factual; no se documentan evaluaciones de veracidad.
- Sesgos conocidos: no disponibles (no se publica ninguna sección de sesgos ni de datos de entrenamiento).
- Sin tracción comunitaria verificable: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente y de reportes de fallos.
- Inconsistencia documental: el ejemplo de código de la model card referencia el repositorio `AuroraAI/velary-1.0`, distinto del ID real `AuroraSystem/Velary-1.0-1.2B`; conviene verificar la ruta antes de cargar el modelo. También hay discrepancia entre el tamaño anunciado en el ID (1,2B) y el de la tabla de especificaciones (1,17B).
- Fechas de creación y actualización registradas como 2026, lo que resulta atípico y dificulta situar la versión del modelo y su mantenimiento.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar también las condiciones de la licencia del modelo base LiquidAI/LFM2.5-1.2B-Thinking, que no se especifica en la información disponible.
- Para producción: al ser un ajuste sin historial público de pruebas, se recomienda evaluación propia en el dominio objetivo antes de desplegarlo, especialmente en ruso y en tareas de lógica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AuroraSystem/Velary-1.0-1.2B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Imagen de resultados (versión rusa de la model card): https://cdn-uploads.huggingface.co/production/uploads/6a4529b47479947fe8eb3981/7SDTuKhqUP1TROsdFCQFq.png
- Imagen de resultados (versión inglesa de la model card): https://cdn-uploads.huggingface.co/production/uploads/6a4529b47479947fe8eb3981/nyUPt9w0j2FZTjMycWGpm.png

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados correspondían a servicios de traducción genéricos), por lo que no hay papers, blogs ni repositorios adicionales que referenciar.
