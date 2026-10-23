# qijiashen/agentrl-oe-c1-ckpt-test-t4-20261023-123126

## Resumen

`qijiashen/agentrl-oe-c1-ckpt-test-t4-20261023-123126` es un checkpoint de 4.659.865.088 parámetros (≈4,66 B) publicado por el usuario `qijiashen` en HuggingFace, derivado mediante fine-tuning del modelo base `Qwen/Qwen3.5-4B-Base` de Alibaba Qwen. El nombre del repositorio sugiere un punto de control intermedio de un entrenamiento de reinforcement learning orientado a agentes ("agentrl", "ckpt", "test-t4"), con fecha de creación del 23 de octubre de 2026. La model card publicada es una copia prácticamente literal de la del Qwen3.5-4B original, por lo que no documenta el proceso de ajuste específico aplicado a este checkpoint.

El modelo hereda la arquitectura híbrida de Qwen3.5: capas de atención lineal del tipo Gated DeltaNet combinadas con capas de atención completa con compuertas (Gated Attention), además de un codificador visual para entrada image-text-to-text. Según la model card heredada, el contexto nativo es de 262.144 tokens, extensible hasta 1.010.000, y el modelo se entrenó con multi-token prediction (MTP). El repositorio ocupa 9,3 GB, lo que es coherente con pesos en bfloat16.

Su relevancia es doble: por un lado, permite examinar el estado intermedio de un pipeline de RL para agentes sobre una base Qwen3.5; por otro, al estar etiquetado con licencia Apache 2.0 y formato `safetensors` compatible con `transformers`, es técnicamente desplegable. Ahora bien, con 0 descargas y 0 likes en el momento de la consulta, y sin métricas propias publicadas, debe tratarse como un artefacto experimental, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador visual: 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), 32 capas |
| Parametros totales | 4.659.865.088 (≈4,66 B; la model card indica "4B") |
| Parametros activos | No disponible (la model card menciona MoE disperso como rasgo de la familia, pero no desglosa parámetros activos para la variante de 4B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ en el repo) |
| Idiomas soportados | No disponible para este checkpoint; la model card heredada de Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`, tag `endpoints_compatible`) |

Datos adicionales de arquitectura declarados en la model card: dimensión oculta 2560, embedding de tokens 248.320 (con padding, atado a la salida LM), dimensión intermedia del FFN 9216, Gated DeltaNet con 32 cabezas lineales para V y 16 para QK (dimensión de cabeza 128), Gated Attention con 16 cabezas Q y 4 KV (dimensión de cabeza 256, RoPE de 64 dimensiones). Tamaño del repositorio: 9,3 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido. La mayor parte de las capas usa Gated DeltaNet, una atención lineal recurrente con compuertas que reduce el coste de atención a largo contexto; cada cuatro capas se intercala una capa de Gated Attention clásica, que aporta recuperación precisa sobre el historial. El patrón declarado es 8 bloques de la forma 3×(Gated DeltaNet → FFN) + 1×(Gated Attention → FFN), lo que da 32 capas en total. A esto se suma un codificador visual acoplado en fase temprana (early fusion sobre tokens multimodales), lo que explica la etiqueta de pipeline `image-text-to-text`. El modelo incorpora además multi-token prediction (MTP), utilizado habitualmente para decodificación especulativa y para acelerar la inferencia.

Sobre el entrenamiento de este checkpoint concreto no hay información: la model card no describe el dataset, el número de tokens, ni si hubo RLHF, DPO o RL con verificación. La model card heredada del Qwen3.5-4B base menciona preentrenamiento y postentrenamiento, entrenamiento multimodal con "casi 100 % de eficiencia" respecto a texto puro, y escalado de RL en entornos multiagente; sin embargo, estos datos corresponden al modelo base de Qwen, no al ajuste realizado por `qijiashen`, y no deben atribuirse a este repositorio sin verificación. El nombre del checkpoint apunta a un ajuste con RL para tareas de agente (posiblemente sobre un entorno de tipo "open-ended"), pero es una inferencia a partir del identificador, no un dato confirmado.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (`conversational`) y contexto nativo de 262.144 tokens.
- Comprensión de imagen y texto combinados (pipeline `image-text-to-text`), heredada del codificador visual del modelo base.
- Razonamiento, matemáticas y conocimiento general: la model card del base reporta resultados en MMLU-Pro y MMLU-Redux dentro de la familia Qwen3.5.
- Generación de código: la familia Qwen3.5 declara paridad con Qwen3 en benchmarks de código; no hay evaluación específica de este checkpoint.
- Soporte multilingüe: la familia declara 201 idiomas y dialectos; para este checkpoint concreto el dato figura como "no disponible".
- Compatibilidad declarada con HuggingFace Transformers, vLLM, SGLang y KTransformers (según la model card heredada).
- Modo "thinking" y tool calling: presentes en la familia Qwen3.5, pero no confirmados para este checkpoint experimental.
- Entrenamiento con MTP, lo que habilita decodificación especulativa si el runtime lo soporta.

## Casos de uso

- Evaluación de checkpoints intermedios de RL: cargar el modelo con `transformers` y comparar su comportamiento frente al Qwen3.5-4B-Base en un conjunto fijo de prompts de agente, para medir la deriva introducida por el entrenamiento por refuerzo antes de decidir si se promociona el checkpoint.
- Investigación en aprendizaje por refuerzo para agentes: usar este artefacto como punto de partida o como referencia de línea base en experimentos de multi-step reasoning con llamadas a herramientas, dado su origen declarado en un pipeline "agentrl".
- Prototipado de asistentes multimodales en local: con 4,66 B de parámetros cabe en una GPU de consumo en cuantización de 4 bits, lo que permite probar flujos de imagen + texto sin depender de API externas.
- Análisis de documentos largos con soporte visual: los 262.144 tokens de contexto nativo permiten procesar contratos, informes o expedientes completos junto con capturas o escaneos en una sola pasada, útil para pruebas de concepto de extracción de datos.
- Generación y revisión de código en pipelines internos: al ser compatible con vLLM y SGLang, puede levantarse como servidor compatible con la API de OpenAI y conectarse a un flujo de CI/CD para revisiones automáticas de diff, siempre en entorno controlado.
- Experimentos de destilación o fine-tuning posterior: al ser un checkpoint de 4,66 B con licencia Apache 2.0, sirve como base para ajustes con LoRA en dominios verticales sin coste de licencia.
- Docencia y divulgación: inspeccionar las diferencias entre un modelo base y su versión post-entrenada con RL es un ejercicio práctico habitual en cursos de ajuste de modelos.

## Benchmarks y rendimiento

Los únicos datos numéricos presentes en la información disponible provienen de la model card heredada de la familia Qwen3.5 y corresponden al modelo base, no a este checkpoint. Se reproducen a continuación de forma literal, limitados a las filas completas:

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |

En la fila de MMLU-Redux la información disponible está truncada: se leen los valores 91,0 (GPT-OSS-120B), 87,8 (GPT-OSS-20B), 92,5 (Qwen3-Next-80B-A3B-Thinking) y 91,4 (Qwen3-30BA3B-Thinking-2507), pero faltan los de Qwen3.5-9B y Qwen3.5-4B. El resto de categorías de la tabla (código, matemáticas, agentes, comprensión visual) aparece cortado en el material proporcionado.

No se han publicado resultados de benchmarks específicos de este checkpoint en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ≈9,3 GB en bfloat16 (coincide con el tamaño del repo), ≈4,7 GB en INT8 y ≈2,4–2,8 GB en cuantización de 4 bits, sin contar la caché KV.
- Caché KV: con 262.144 tokens de contexto la caché crece de forma notable en las capas de Gated Attention (4 cabezas KV, dimensión 256); para contextos muy largos conviene presupuestar decenas de GB adicionales o reducir la ventana efectiva. Las capas Gated DeltaNet mantienen estado recurrente de tamaño constante.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB son holgadas para bfloat16 con contexto largo; una sola A100 40 GB cubre fine-tuning con LoRA.
- GPU de consumo: sí cabe. RTX 4090 (24 GB) en bfloat16 con contexto moderado; RTX 3090 (24 GB) de forma equivalente; RTX 4070 Ti Super / 4080 (16 GB) en INT8; RTX 3060 12 GB o RTX 4060 Ti 16 GB en 4 bits.
- Opciones de despliegue: `transformers` (referencia), vLLM y SGLang (declarados compatibles en la model card), KTransformers (declarado), TGI y llama.cpp/Ollama (no confirmados para este checkpoint, ya que no se publican pesos GGUF en el repositorio).
- Latencia y throughput: no disponible. No hay mediciones publicadas para este checkpoint; a título orientativo, un modelo denso de ~4,7 B en bfloat16 sobre una RTX 4090 suele moverse en decenas de tokens por segundo, pero es una estimación genérica, no una cifra medida sobre este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`agentrl-oe-c1-ckpt-test-t4`) | 4,66 B | 262.144 (ext. 1.010.000) | No disponible | Apache 2.0 | Repo público, 0 descargas |
| Qwen/Qwen3.5-4B-Base (modelo de partida) | ≈4 B | 262.144 (ext. 1.010.000) | 79,1 (dato de la variante post-entrenada Qwen3.5-4B) | Apache 2.0 | Público y ampliamente distribuido |
| Qwen3.5-9B | ≈9 B | 262.144 (ext. 1.010.000) | 82,5 | Apache 2.0 (según familia) | Público |
| GPT-OSS-20B | 20 B (MoE) | No disponible en la información | 74,8 | No disponible en la información | Público |

La comparación es limitada: los valores de MMLU-Pro corresponden a la model card de la familia Qwen3.5 y no a evaluaciones independientes de este checkpoint. Frente al Qwen3.5-4B de referencia, este artefacto no aporta métricas propias; frente a Qwen3.5-9B pierde 3,4 puntos de MMLU-Pro a cambio de algo más de la mitad de parámetros.

## Limitaciones y advertencias

- Artefacto experimental sin validación: 0 descargas y 0 likes en el momento de la consulta, sin métricas ni evaluación publicadas. No debe usarse como base de producción sin una batería de pruebas propia.
- Model card no representativa: el README es una copia de la del Qwen3.5-4B oficial; no documenta el dataset de ajuste, la receta de RL, los hiperparámetros ni los objetivos del entrenamiento. Cualquier capacidad atribuida al modelo base puede no cumplirse en este checkpoint.
- Deriva por RL: los checkpoints intermedios de RL para agentes suelen mostrar regresiones en estilo, verbosidad o seguimiento de formato, además de sobreajuste a la distribución de tareas del entorno de entrenamiento.
- Riesgo de alucinación: no cuantificado para este checkpoint; al ser un modelo de ~4,7 B, la tasa de error factual en conocimiento especializado es estructuralmente superior a la de modelos de mayor tamaño.
- Idiomas: no hay listado verificado de idiomas para este checkpoint. Aunque la familia declare 201 idiomas, el ajuste con RL puede haber degradado el rendimiento fuera del idioma o dominio del entrenamiento.
- Contexto largo: los 262.144 tokens son una capacidad declarada del modelo base; el rendimiento real en ventanas muy largas depende del runtime y de la memoria disponible, y no está medido aquí.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero el titular del repositorio no ofrece garantías; conviene revisar también la licencia del modelo base enlazada (`Qwen/Qwen3.5-4B/blob/main/LICENSE`) por si incorpora términos adicionales.
- Nombre del repositorio con marca temporal futura (2026-10-23) y sufijo "test": indica un artefacto de prueba que puede ser eliminado o sobrescrito por el autor sin aviso. Se recomienda fijar el commit exacto si se va a reproducir.
- Sin pesos cuantizados oficiales: no hay GGUF ni AWQ/GPTQ publicados en el repo, por lo que el despliegue en CPU o en GPU de gama baja exige convertir los pesos uno mismo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qijiashen/agentrl-oe-c1-ckpt-test-t4-20261023-123126
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de la familia Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (contenido para adultos sin vinculación técnica alguna). No se han incorporado a esta ficha y no se ha localizado documentación adicional, paper ni repositorio asociado a este checkpoint.
