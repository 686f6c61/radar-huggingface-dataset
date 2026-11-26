# KC-Informatics/Crow-9B-AWQ

## Resumen

Crow-9B-AWQ es la versión cuantizada a 4 bits (AWQ, W4A16) del modelo Crow-9B, desarrollado por KC-Informatics. Se trata de un ajuste fino del modelo base Ornith 1.5 9B (etiquetado en Hugging Face como `qwen3_5`), orientado a corregir un problema concreto: el modelo original tiende a agotar su presupuesto de razonamiento sin emitir una respuesta final. Mediante autodestilización sobre sus propias soluciones correctas más cortas, Crow-9B aprende a concluir antes, manteniendo el mismo conocimiento que el modelo de partida. El resultado es un modelo de 9.653.104.368 parámetros (aproximadamente 9,65B) con licencia Apache 2.0 y pesos en formato safetensors comprimidos (compressed-tensors).

La relevancia de esta versión radica en su perfil de despliegue: el autor reporta que el build de 4 bits ocupa 10,2 GB de VRAM en una tarjeta de 12 GB, lo que lo sitúa al alcance de GPUs de consumo medio-alto. El modelo está pensado para inferencia con vLLM 0.34 o superior y SGLang, con soporte de tool calling y parser de razonamiento Qwen3. La model card incluye además un script auxiliar (`nudge.py`) que fuerza una conclusión cuando el modelo agota su presupuesto de pensamiento.

El modelo declara únicamente inglés como idioma soportado y su pipeline es text-generation, aunque las etiquetas de Hugging Face incluyen `image-text-to-text` y el autor menciona que los pesos de visión no se tocaron durante el ajuste, lo que sugiere un origen multimodal heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3/Ornith 1.5 (tag `qwen3_5`), con proyecciones recurrentes con compuerta; incluye pesos de visión heredados del base |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de despliegue recomendada (`--max-model-len 32768`) |
| Tipos de cuantizacion | AWQ 4 bits, W4A16 (pesos 4 bits, activaciones 16 bits), calibrado con `llmcompressor`; proyecciones recurrentes con compuerta mantenidas en precisión completa |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (AWQ 4 bits); el repo completo ocupa 26,3 GB y la descarga del build de 4 bits se indica como 9,1 GB |

## Arquitectura y entrenamiento

Crow-9B parte de Ornith 1.5 9B, un transformer de la familia Qwen3 con proyecciones recurrentes con compuerta (gated recurrent projections). Sobre ese modelo se aplicó un ajuste fino mediante autodestilización: se recopilaron 499 problemas de práctica nuevos, verificados para no solaparse con los conjuntos de evaluación (se comprobó ausencia de solapamientos de 14 palabras contra GPQA Diamond, AIME 2026, IFEval y LiveCodeBench v6). Para cada problema resuelto se conservó la traza de razonamiento más corta que llegaba a una respuesta correcta, validada por script, obteniendo 569 ejemplos a partir de 418 problemas resueltos.

El entrenamiento consistió en un LoRA de rango 32 (alpha 64) sobre las proyecciones de atención y MLP, durante 2 épocas y 144 pasos, con un término KL que mantiene el modelo cerca del original. El adaptador se fusionó en los pesos; los pesos de visión no se modificaron. Tras la fusión, el modelo coincide con el original en el 95,7% de las predicciones de siguiente token sobre texto ordinario, lo que preserva la compatibilidad con el modelo draft `ornith-ai/Ornith-1.5-9B-DFlash` para decodificación especulativa. La versión AWQ se calibró con 128 respuestas de práctica verificadas.

## Capacidades

- Generación de texto y razonamiento de varios pasos, con modo de pensamiento (thinking) y parser de razonamiento Qwen3.
- Razonamiento científico de nivel de posgrado: 54 de 60 preguntas de GPQA Diamond con el helper activado.
- Razonamiento matemático: 20 de 30 en AIME 2026.
- Generación de código: 21 de 40 en LiveCodeBench v6, con soporte de tool calling listo para usar (`--enable-auto-tool-choice --tool-call-parser qwen3_coder`).
- Seguimiento de instrucciones: 20 de 30 en IFEval.
- Procesamiento de documentos largos: 17 de 20 en AA-LCR, apoyado en la ventana de 32.768 tokens.
- Tool calling / function calling nativo en vLLM.
- Decodificación especulativa compatible con el draft model `ornith-ai/Ornith-1.5-9B-DFlash` (método `dflash`, 8 tokens especulativos).
- Capacidades multilingües: solo inglés declarado.
- Capacidad de visión: los pesos de visión se conservan del modelo base, aunque la model card no documenta su uso ni su rendimiento.

## Casos de uso

- Razonamiento científico asistido: el modelo puede resolver preguntas de nivel de posgrado (GPQA Diamond) con una tasa de acierto de 54/60 usando el helper, adecuado para herramientas de apoyo a investigación que requieran respuestas razonadas en inglés.
- Generación de código en pipelines de CI/CD: con tool calling nativo y parser `qwen3_coder`, puede integrarse en flujos de revisión o generación de parches, aunque su rendimiento en LiveCodeBench v6 (21/40) lo sitúa por debajo de modelos mayores.
- Despliegue en estaciones de trabajo con GPU de 12 GB: al ocupar 10,2 GB de VRAM en cuantización AWQ, permite servir un modelo de 9,65B en tarjetas de consumo como la RTX 3060 de 12 GB o la RTX 4070 Ti, con vLLM y `--max-num-seqs 2`.
- Procesamiento de documentos largos: con 32.768 tokens de contexto y 17/20 en AA-LCR, sirve para resumir o extraer información de informes extensos en inglés.
- Evaluación comparativa de modelos pequeños: su model card publica resultados por asignatura frente a modelos de 27B y 671B, lo que lo hace útil como referencia en estudios de eficiencia frente a tamaño.
- Atención a usuarios técnicos en inglés: conversaciones multi-turno con razonamiento explícito, apoyadas en el helper `nudge.py` para evitar respuestas vacías cuando el modelo agota su presupuesto de pensamiento.
- Aceleración con decodificación especulativa: en entornos con memoria suficiente, añadir el draft model de Ornith permite aumentar el throughput manteniendo la distribución de salida (95,7% de coincidencia en siguiente token).

## Benchmarks y rendimiento

Resultados publicados en la model card: 180 preguntas públicas, un intento por pregunta, corrección automática por script.

| Benchmark | Crow-9B con helper | Crow-9B sin helper | Qwen 3.8 27B (original) | DeepSeek V4.1 Flash (671B) |
|---|---:|---:|---:|---:|
| GPQA Diamond (60 preguntas) | 54 | 46 | 46 | 55 |
| AIME 2026 (30 preguntas) | 20 | 20 | 18 | 27 |
| LiveCodeBench v6 (40 preguntas) | 21 | 17 | 20 | 29 |
| IFEval (30 preguntas) | 20 | 21 | 26 | 26 |
| AA-LCR (20 preguntas) | 17 | 15 | 14 | 17 |
| Total (180 preguntas) | 132 | 119 | 124 | 154 |

## Requisitos de hardware

- VRAM estimada: 10,2 GB en uso para el build AWQ de 4 bits; los pesos completos del modelo sin cuantizar ocupan 18 GB y requieren una tarjeta de 24 GB o superior.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti 12 GB o RTX 4080 16 GB para el build AWQ; A100, H100 o RTX 4090 para el modelo completo.
- Cabe en GPU de consumo: sí, el build AWQ en tarjetas de 12 GB o 16 GB.
- Opciones de despliegue: vLLM 0.34 o superior (comando documentado con `--trust-remote-code`, `--gpu-memory-utilization 0.95`, `--max-model-len 32768`, `--max-num-seqs 2`) y SGLang (etiqueta declarada). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se puede activar decodificación especulativa con `ornith-ai/Ornith-1.5-9B-DFlash` (8 tokens especulativos) para mejorar la velocidad si hay memoria libre.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA Diamond (60) | Total 180 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Crow-9B-AWQ (con helper) | 9,65B | 32.768 | 54 | 132 | Apache 2.0 | Hugging Face, vLLM, SGLang |
| Qwen 3.8 27B (original) | 27B (no confirmado) | No disponible | 46 | 124 | No disponible | No disponible |
| DeepSeek V4.1 Flash | 671B | No disponible | 55 | 154 | No disponible | No disponible |
| Ornith 1.5 9B (base) | 9B (aproximado) | No disponible | No disponible | No disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo declara únicamente inglés; no hay soporte multilingüe documentado.
- Tiende a agotar el presupuesto de razonamiento sin responder si no se usa el helper `nudge.py`; sin él, la puntuación total baja de 132 a 119 sobre 180.
- Riesgo de alucinación no cuantificado en la información disponible; los benchmarks publicados son de opción múltiple o verificación automática y no miden fidelidad factual en texto abierto.
- El ajuste fino se basa en 569 ejemplos de autodestilización, un volumen reducido que puede limitar la generalización fuera de los dominios evaluados.
- El rendimiento en IFEval empeora ligeramente con el helper (20 frente a 21), lo que sugiere un compromiso entre concluir y seguir instrucciones de formato.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base `ornith-ai/Ornith-1.5-9B` y de su draft model, también Apache 2.0 según la model card.
- Requiere vLLM 0.34 o superior y `--trust-remote-code`; no se documentan rutas de despliegue alternativas como llama.cpp u Ollama.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de los resultados publicados.
- El pipeline declarado es text-generation, pero las etiquetas incluyen `image-text-to-text`; el uso de la capacidad de visión no está documentado ni evaluado.

## Enlaces

- Hugging Face (build AWQ 4 bits): https://huggingface.co/KC-Informatics/Crow-9B-AWQ
- Hugging Face (modelo completo): https://huggingface.co/KC-Informatics/Crow-9B
- Modelo base Ornith 1.5 9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Draft model para decodificación especulativa: https://huggingface.co/ornith-ai/Ornith-1.5-9B-DFlash
- Manifiesto del ajuste (`alteration_manifest.json`): incluido en el repositorio de Hugging Face
- Helper `nudge.py`: incluido en el repositorio de Hugging Face
