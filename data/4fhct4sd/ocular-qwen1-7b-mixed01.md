# 4fhct4sd/ocular-qwen1.7b-mixed01

## Resumen

ocular-qwen1.7b-mixed01 es un ajuste fino del modelo Qwen3-1.7B mediante DoRA (Weight-Decomposed Low-Rank Adaptation) sobre un corpus personal de 22,64 millones de tokens, fusionado posteriormente en los pesos base y exportado a GGUF en precisión F16. Lo desarrolla el usuario 4fhct4sd como artefacto de archivo privado, con el objetivo de servir como fuente sin pérdidas para cuantizaciones posteriores con `llama-quantize` y como checkpoint que no degrada con el tiempo.

El modelo aborda un problema concreto: reducir la tendencia del modelo base a responder incorrectamente cuando no dispone de información, fomentando en su lugar la delegación a herramientas externas. Según las mediciones del autor, el modelo afinado responde mal aproximadamente un tercio de las veces que el base y recurre a llamadas de herramienta (Bash, código) en lugar de adivinar. Su relevancia radica en ser un caso de estudio de ajuste fino con DoRA sobre un corpus mixto de código (Rosetta Code) y conversaciones agénticas personales, con una documentación honesta de defectos conocidos.

La arquitectura hereda la del modelo base Qwen3-1.7B (transformer decoder-only), con 1.720.574.976 parámetros totales. El contexto de entrenamiento fue de 2048 tokens, aunque el contexto nativo del modelo base no se especifica en la información disponible. El repositorio pesa 3,4 GB y contiene únicamente el archivo GGUF en F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (contexto de entrenamiento; contexto nativo del base no disponible) |
| Tipos de cuantizacion | F16 GGUF (unico formato publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16, 310 tensores, 3,45 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B y aplica un adaptador DoRA con rango 32 y alpha 64 sobre las proyecciones q, k, v, o, gate, up y down. El entrenamiento se realizó en bf16 con secuencias de 2048 tokens, una sola época y 1.404 pasos, alcanzando una pérdida final de 2.142. El adaptador se fusionó posteriormente en los pesos base y se exportó a GGUF F16 sin cuantizar.

El corpus de entrenamiento consta de 25.700 registros y 22,64 millones de tokens, distribuidos en tres fuentes: Rosetta Code (10,18M tokens, 45%), que aporta 1.182 tareas en 991 lenguajes de programación; "soup" (9,07M tokens, 40%), seis meses de conversaciones personales del autor con Claude en dos dialectos (exportación de claude.ai y JSONL de Claude Code), conservando deliberadamente la capa agéntica de llamadas a herramientas y resultados (aproximadamente 59% de tráfico de herramientas por bytes); y "graphsoup" (3,39M tokens, 15%), el mismo corpus reorganizado mediante un grafo de enlaces simbólicos (JANUS) para producir secuencias de fragmentos reales en órdenes nunca ocurridos.

El autor documenta tres defectos conocidos del entrenamiento: ausencia de separador de registros (las transiciones entre documentos se aprendieron como continuaciones), empaquetado de secuencias que corta registros cada 2048 tokens (afecta al 1,2% de los registros, incluida una sesión de 187k tokens) y weight_decay = 0.0, nunca configurado.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3-1.7B.
- Generación de código en múltiples lenguajes de programación, gracias al 45% del corpus procedente de Rosetta Code (991 lenguajes).
- Llamada a herramientas (tool calling): el corpus "soup" conserva llamadas a herramientas y sus resultados, lo que enseña al modelo a delegar en Bash u otras herramientas en lugar de responder de memoria.
- Comportamiento agéntico: el modelo tiende a emitir llamadas a herramientas (por ejemplo, un script Bash) cuando se le pide una tarea que requiere ejecución, en lugar de dar una respuesta especulativa.
- Multilingüismo: no se dispone de datos específicos sobre idiomas soportados más allá de los del modelo base.
- No se reportan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Generación de código multi-lenguaje: el modelo puede producir soluciones en lenguajes variados (C#, Go, etc.) a partir de descripciones de problemas, gracias a su exposición intensiva a Rosetta Code. Es adecuado para prototipado rápido o como asistente de programación en entornos donde se necesite versatilidad lingüística.
- Agentes con ejecución de herramientas: su entrenamiento con tráfico de herramientas real lo hace apto para integrarse en pipelines agénticos donde el modelo debe decidir cuándo invocar Bash, scripts o APIs en lugar de responder directamente. Por ejemplo, en un asistente de operaciones que audite sistemas y ejecute comandos.
- Asistente personal conversacional: el corpus "soup" contiene conversaciones personales multi-turno, lo que le permite mantener diálogos largos con registro conversacional natural, aunque con el caveat de que el contexto de entrenamiento es de 2048 tokens.
- Reducción de alucinaciones en tareas factuales: al estar entrenado para delegar en herramientas cuando no sabe, puede usarse en sistemas de preguntas y respuestas donde la precisión es crítica y se dispone de herramientas de verificación.
- Base para cuantización: el archivo F16 GGUF sirve como fuente sin pérdidas para generar cuantizaciones de menor precisión (Q4, Q5, Q8) con `llama-quantize`, permitiendo desplegar el modelo en hardware limitado.
- Investigación sobre DoRA y ajuste fino de bajo rango: el repositorio documenta el proceso completo (runs, defectos, mediciones), siendo útil como referencia para experimentos de adaptación de modelos pequeños con corpus personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta únicamente un banco de pruebas propio, no estandarizado, comparando el modelo afinado con el base sin ajustar:

| Metrica | Base | Afinado |
|---|---|---|
| Postura (alcanza una shell) | 0/3 | 3/3 |
| Precision | 4/8 | 4/8 |
| Respuestas incorrectas | 10 | 3 |
| Diferido a una herramienta | 0 | 6 |

Estos datos indican que el modelo afinado reduce las respuestas incorrectas de 10 a 3 y aumenta la delegación a herramientas de 0 a 6, manteniendo la misma precisión en aciertos. No obstante, al ser un benchmark casero con una muestra muy pequeña, no es comparable con evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: el archivo F16 GGUF ocupa 3,45 GB, por lo que cabe en GPUs con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4050 laptop).
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM. El autor midió 16 tok/s en una RTX 4050 (laptop) con el F16 GGUF, frente a ~57 tok/s con la versión bf16 en transformers. El F16 es limitado por ancho de banda de memoria.
- Despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. También puede cargarse con transformers si se convierte a safetensors, aunque el autor no lo publica en ese formato.
- Latencia y throughput: 16 tok/s en RTX 4050 (F16 GGUF) es el único dato disponible. Para cuantizaciones inferiores (Q4, Q5) se esperaría mayor velocidad, pero no se han medido.
- Entrenamiento: se realizó en una RTX 5090 alquilada (vast.ai) en ~96 minutos con un coste aproximado de 1,30 USD.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ocular-qwen1.7b-mixed01 | 1,7B | 2048 (entrenamiento) | GGUF F16 | Apache-2.0 | DoRA finetune sobre corpus personal, enfocado a tool calling |
| Qwen3-1.7B (base) | 1,7B | no disponible | safetensors, GGUF | Apache-2.0 | Modelo base sin ajustar, sin sesgo hacia herramientas |
| Qwen1.5-7B | 7B | 32k | safetensors, GGUF | Apache-2.0 | Modelo de mayor tamaño de la familia Qwen, sin ajuste DoRA |

La comparativa directa con otros modelos de 1,7B ajustados con DoRA no está disponible en la información proporcionada. La principal diferencia con el base es el comportamiento agéntico y la reducción de respuestas incorrectas, aunque a costa de un sesgo notable hacia la generación de código (el autor advierte que el 45% de Rosetta es probablemente excesivo).

## Limitaciones y advertencias

- Sesgo hacia código: el 45% del corpus es Rosetta Code, lo que provoca que el modelo responda con programas (por ejemplo, C# o Go) incluso para preguntas aritméticas simples como "17 por 23". El autor recomienda reducir esta proporción en futuros entrenamientos.
- Defectos de entrenamiento documentados: ausencia de separador de registros (las transiciones entre documentos se aprendieron como continuaciones), empaquetado que corta registros largos (incluida una sesión de 187k tokens) y weight_decay = 0.0.
- Riesgo de regurgitación: se probaron tres prefijos específicos del corpus sin encontrar reproducción verbatim, pero el autor advierte que tres pruebas no constituyen una auditoría. El modelo se mantiene privado por precaución.
- Contexto limitado: el entrenamiento usó secuencias de 2048 tokens, lo que puede limitar el rendimiento en tareas que requieran contexto largo, aunque el modelo base podría soportar más.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero el corpus de entrenamiento incluye conversaciones personales del autor (soup) y material de Rosetta Code (licencia permisiva, pero con atribución requerida). El autor no ha verificado la ausencia de datos personales en el corpus.
- Rendimiento de inferencia: el formato F16 GGUF es lento (16 tok/s en RTX 4050) comparado con bf16 en transformers (~57 tok/s), por lo que no es adecuado para producción de baja latencia sin cuantizar.
- Sin benchmarks estándar: no hay evidencia de rendimiento en MMLU, HumanEval u otras evaluaciones, por lo que no se puede comparar objetivamente con otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/4fhct4sd/ocular-qwen1.7b-mixed01
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen: https://github.com/QwenLM/Qwen
- Organización Qwen en HuggingFace: https://huggingface.co/Qwen
- Qwen en GitHub: https://github.com/QwenLM
- Qwen Studio: https://qwen.ai/home
