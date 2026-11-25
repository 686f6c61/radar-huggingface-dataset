# mr-andrey-isachenko/Tenet-4B-Qwen3-Unslop-v2

## Resumen

Tenet-4B-Qwen3-Unslop-v2 es un ajuste fino del modelo Qwen/Qwen3-4B publicado por el usuario mr-andrey-isachenko bajo el paraguas del proyecto Tenet (v2). Se trata de un checkpoint de 4.022 millones de parámetros orientado a generación de texto con razonamiento nativo (`<think>...</think>`), tool calling, SQL de solo lectura y código, con un enfoque explícito en eliminar rechazos y "slop" (respuestas vacías o evasivas) sin romper la cadena de razonamiento. La motivación declarada es que la ablación de dirección de rechazo aplicada a toda la secuencia daña los marcadores de deliberación y autocorrección dentro de `<think>`, provocando etiquetas mal cerradas, cadenas truncadas o bucles infinitos bajo cuantización GGUF de 4 bits.

El autor propone una "cirugía Lancet" segmentada por fases que separa la fase de deliberación de la fase de respuesta superficial, protegiendo el ancla de autocorrección CoT junto con anclas de razonamiento formal y de tool/SQL. Sobre esa base aplica GRPO con ventana de calibración de longitud y publica una cuantización GGUF mixta calibrada por dominio (`i1-CKA-Q4_K_M`). El modelo se distribuye en safetensors y GGUF, con licencia Apache 2.0, y está pensado para despliegue en vLLM, TGI y endpoints compatibles (incluido OpenRouter).

Por su tamaño (4B) y su contexto heredado de Qwen3, es relevante para quienes necesitan un modelo pequeño, sin censura y con razonamiento explícito que quepa en GPU de consumo, aunque conviene tratar con cautela las afirmaciones de la model card: los benchmarks están declarados por el autor, no verificados, y el ecosistema de evaluación es propio ("Tenet OpenEvals"), no estándar de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3-4B) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantización | FP8 E4M3 (referenciado en la model card), GGUF `i1-CKA-Q4_K_M` (mixta: Q8_0 y Q6_K por capas), safetensors en precisión original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only con modo de razonamiento nativo mediante etiquetas `<think>...</think>`. El autor no describe cambios estructurales en la arquitectura, sino un pipeline de post-entrenamiento en cuatro etapas denominadas H15, H16, H14+ y H17. La etapa H15 ("Phase-Segmented Tri-Anchor Lancet Surgery") particiona los estados ocultos en fase de deliberación (dentro de `<think>`) y fase de respuesta (tras `</think>`), y extrae direcciones de rechazo y slop únicamente de los tokens de respuesta, bi-proyectándolas en el complemento ortogonal de tres anclas ortonormalizadas (autocorrección CoT, razonamiento formal y tool/SQL) mediante Gram-Schmidt modificado en float32 de dos pasadas, con restauración de norma L2 por fila en capas seleccionadas [13, 15, 17, 12, 11, 20, 9, 22].

La etapa H16 aplica GRPO con ventana gaussiana asimétrica de calibración de longitud (presupuesto de palabras para respuesta y para deliberación), una puerta de integridad estructural de `<think>`, densidad anti-slop normalizada por longitud y proyección de las actualizaciones LoRA sobre el complemento ortogonal del basis quirúrgico antes de una fusión que preserva norma. La etapa H14+ produce la cuantización GGUF mixta guiada por CKA, con Q8_0 en capas frontera y quirúrgicas y Q6_K en capas seleccionadas, más una importance matrix de dominio construida sobre verificaciones `<think>`, SQL DuckDB de solo lectura, AST de Python y configuraciones JSON. La etapa H17 es un verificador determinista de 24 prompts ("Arena House Series"). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles del corpus de RLHF/DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito con modo "thinking" mediante etiquetas `<think>...</think>`, con integridad de etiquetas declarada al 100%.
- Razonamiento matemático y resolución de problemas (MATH-500, GSM8K declarados).
- Generación y análisis de código, incluido parseo de AST de Python según la model card.
- Tool calling / function calling y uso de herramientas en flujos agénticos.
- Generación de SQL de solo lectura (validado en 6/6 pruebas según el autor, sobre DuckDB).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "uncensored"/"abliterated": reducción deliberada de rechazos y respuestas evasivas.
- Compatibilidad con vLLM, TGI y endpoints compatibles con OpenRouter.
- Salida en FP8 E4M3 y GGUF para despliegue eficiente.

## Casos de uso

- Asistente de código en IDE o CI/CD: el modelo puede generar parches, explicar errores y producir código Python que se valide con AST antes de aplicarse, gracias a su entrenamiento específico en estructuras de código y su tamaño de 4B, que permite ejecución local en una sola GPU.
- Agente de análisis de datos con SQL de solo lectura: se le pueden dar esquemas de bases de datos DuckDB y pedirle consultas de agregación o filtrado; el autor valida 6/6 consultas de solo lectura, lo que encaja en pipelines de BI internos donde no se permite escritura.
- Automatización de atención al cliente con razonamiento: su modo `<think>` permite trazar el razonamiento antes de responder, útil para auditar respuestas en dominios regulados; el contexto heredado de Qwen3-4B admite conversaciones multi-turno.
- Generación de documentación técnica y resúmenes: con instrucciones estrictas (IFEval ~86% a nivel de instrucción según el autor), es adecuado para tareas de formato controlado como generar changelogs, READMEs o fichas a partir de metadatos.
- Tutoría y resolución de problemas matemáticos: con MATH-500 al 70,2% y GSM8K al 78,0% (accuracy declarada), puede usarse en asistentes educativos que muestran el paso a paso dentro de `<think>`.
- Evaluación interna de modelos y red-teaming: al ser un modelo "abliterated" y sin censura, sirve como baseline para estudiar comportamientos de rechazo, slop y fuga de contenido en pipelines de seguridad, siempre con las salvaguardas externas adecuadas.
- Prototipado rápido en local: al caber en GPU de consumo en cuantización Q4, es apto para demos con Ollama o llama.cpp antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor (fuente: "Tenet OpenEvals (vLLM)", no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| IFEval | Prompt-level Strict Accuracy | 0,8059 |
| IFEval | Instruction-level Strict Accuracy | 0,8597 |
| MATH-500 | Accuracy | 0,7020 |
| GSM8K | Strict Match (CoT) | 0,8893 |
| GSM8K | Accuracy | 0,7801 |
| GSM8K | Flexible Extract | 0,7801 |
| GPQA Diamond | Accuracy (zero-shot) | 0,3434 |
| MMLU-Pro | Accuracy | 0,5635 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos benchmarks bajo la misma configuración de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 8-9 GB solo para pesos, más KV cache; requiere GPU de 16 GB o superior para contexto amplio.
- VRAM estimada en FP8 E4M3: aproximadamente 4-5 GB de pesos, más overhead; cabe en GPU de 8-12 GB.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 2,5-3 GB de pesos; cabe en GPU de consumo de 6-8 GB (RTX 3060, RTX 4060, RTX 2070) y en Mac con memoria unificada.
- GPU recomendadas: A100 40/80 GB o H100 para serving de alta concurrencia en FP16; L40S o RTX 4090 para FP8; RTX 3090/4090 o RTX 4060 Ti 16 GB para uso individual.
- Cabe en GPU de consumo: sí, en cuantización Q4_K_M y Q8_0 con contexto moderado.
- Opciones de despliegue: vLLM (usado por el autor en las evaluaciones), TGI (tag `text-generation-inference`), llama.cpp y Ollama para GGUF, y endpoints compatibles con OpenRouter.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Tenet-4B-Qwen3-Unslop-v2 | 4,02 B | no disponible | Apache 2.0 | Razonamiento + abliterated + tool/SQL | HF (safetensors, GGUF) |
| Qwen/Qwen3-4B (base) | ~4 B | no disponible en la información | Apache 2.0 | Razonamiento nativo estándar | HF |
| Alternativas abliterated de la familia Qwen3 | no disponible | no disponible | variable | Sin censura | HF (comunidad) |
| Modelos pequeños de razonamiento tipo Llama 3.2 3B / Phi-4-mini | no disponible | no disponible | variable | Razonamiento ligero | HF |

No se dispone de datos de benchmarks comparativos directos con estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- Los benchmarks están declarados por el autor y marcados como `verified: false`; no han sido reproducidos de forma independiente.
- El modelo está "abliterated"/"uncensored": se ha reducido deliberadamente la tasa de rechazos, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado sin salvaguardas externas.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en GPQA Diamond (34,3%) y MMLU-Pro (56,3%), donde el rendimiento es limitado.
- El autor reporta una "fuga" del 2,49% en el subespacio FP8 E4M3, lo que sugiere que parte de las direcciones ablacionadas pueden reaparecer en producción con cuantización FP8.
- Idiomas soportados no documentados; el comportamiento multilingüe puede degradarse respecto al Qwen3-4B original.
- Longitud de contexto no documentada en la ficha; conviene verificar en la config del modelo base antes de usarlo en tareas de contexto largo.
- El ecosistema de evaluación ("Tenet OpenEvals", "Arena House Series") es propio del autor y no estándar; los resultados no son directamente comparables con leaderboards públicos.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin censura exige filtros y políticas de uso adicionales por parte del integrador.
- El repositorio tiene muy pocas descargas (179) y ningún "like" en el momento de la consulta; la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-4B-Qwen3-Unslop-v2
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del proyecto Tenet Lab: https://github.com/mrAndreyIsachenko/tenet-lab
