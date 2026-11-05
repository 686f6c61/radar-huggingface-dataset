# diablomike20/Qwen3-42B-Thinking-Abliterated-CODER

## Resumen

Qwen3-42B-Thinking-Abliterated-CODER es un modelo de lenguaje derivado de Qwen3-30B-A3B-Thinking-2507, publicado por el usuario diablomike20 en HuggingFace. Se trata de un fine-tune sobre la versión abliterated (descensurada) de huihui-ai, que a su vez parte del modelo MoE de Qwen de 30B parámetros totales con 3B activos. El resultado es un modelo de 42.371.414.784 parámetros totales (42B), 67 capas y 807 tensores, con una longitud de contexto nativa de 256k tokens.

El modelo está orientado explícitamente a la generación de código en la mayoría de lenguajes de programación, aunque el autor indica que también sirve para casos creativos gracias a la abliteración y al adaptador "Brainstorm 20x". La arquitectura subyacente es `qwen3_moe`, con 128 expertos y 8 expertos activos por token, lo que mantiene un coste de inferencia relativamente bajo pese al tamaño total.

Es relevante para desarrolladores que necesitan un modelo con contexto muy largo (256k), capacidad de razonamiento en modo thinking y sin restricciones de contenido, con licencia Apache 2.0. No obstante, la información publicada es escasa y proviene casi exclusivamente de la model card del autor, sin benchmarks formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_moe`), 128 expertos, 8 activos |
| Parametros totales | 42.371.414.784 (42B) |
| Parametros activos | 8 expertos de 128 (el autor no publica el recuento exacto de parámetros activos; el modelo base Qwen3-30B-A3B activa ~3B) |
| Longitud de contexto | 256k tokens (contexto nativo) |
| Tipos de cuantizacion | GGUF, GGUF imatrix, MLX (publicados por terceros); el autor menciona además GPTQ, EXL2, AWQ y HQQ como formatos generables desde los safetensors |
| Idiomas soportados | en, fr, zh, de |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (precisión completa); GGUF e imatrix en repos de terceros |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint abliterated de huihui-ai sobre Qwen3-30B-A3B-Thinking-2507, al que se ha incorporado el adaptador "Brainstorm 20x" de DavidAU. La arquitectura es un transformer de mezcla de expertos con 128 expertos y 8 activos por token, 67 capas y 807 tensores, que eleva el recuento de parámetros hasta los 42B. La abliteración elimina la dirección de rechazo del modelo base, de modo que no se niega a generar contenido sensible, aunque el autor advierte que en algunos casos necesita instrucciones explícitas para producir contenido explícito o soez.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el fine-tune. El modelo base Qwen3-30B-A3B-Thinking-2507 sí incorpora modo thinking (razonamiento previo a la respuesta), y el adaptador Brainstorm 20x se presenta como una mejora del rendimiento general y del razonamiento "out of the box". El autor recomienda ajustar el número de expertos activos en tiempo de inferencia (6-8 para trabajo general, 10 para moderado, 12-16 para código complejo y proyectos largos) y subirlo 1-2 puntos en contextos largos o conversaciones multi-turno.

## Capacidades

- Generación de código en la mayoría de lenguajes principales y muchos menores, con énfasis explícito del autor en programación.
- Razonamiento en modo thinking (hereda el modo de razonamiento de Qwen3-30B-A3B-Thinking-2507).
- Generación de texto general y conversación multi-turno.
- Casos creativos sin censura: el autor indica que puede generar contenido explícito, soez o gore, aunque requiere instrucciones explícitas en algunos casos.
- Capacidades multilingües limitadas a inglés, francés, chino y alemán según los metadatos.
- Contexto largo de 256k tokens, adecuado para análisis de repositorios o documentos extensos.
- Ajuste dinámico del número de expertos activos por token en inferencia (de 4 a 16 según el caso).

## Casos de uso

- Generación de código en producción: el modelo puede completar funciones, refactorizar módulos y generar tests en múltiples lenguajes, con la ventaja de sus 256k tokens de contexto para trabajar sobre repositorios completos o archivos muy extensos.
- Revisión de código en pipelines de CI/CD: con contexto largo puede analizar un diff junto con el resto del repositorio y detectar problemas de integración que un modelo de contexto corto no vería.
- Asistentes de programación multi-turno: el autor recomienda subir el número de expertos activos en conversaciones largas, lo que encaja con sesiones de depuración iterativa donde el modelo mantiene el estado del proyecto.
- Análisis de documentación técnica extensa: con 256k tokens puede procesar manuales, especificaciones o RFCs completos y responder preguntas sobre ellos.
- Generación de contenido creativo sin restricciones: guiones, ficción o material explícito cuando el caso de uso lo requiere, ajustando el número de expertos activos a 4 y la repetición a 1.05 o superior.
- Prototipado rápido de scripts en lenguajes menores: el autor afirma que cubre también lenguajes poco comunes, útil para tareas de automatización o glue code.
- Migración de código entre lenguajes: con contexto largo puede recibir un módulo completo en un lenguaje y generar el equivalente en otro, manteniendo coherencia entre archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 42B parámetros totales y 8 expertos activos, en FP16 serían necesarios aproximadamente 84 GB, lo que exige múltiples GPU. En cuantización Q4/IQ4 el peso ronda los 22-24 GB, y en Q2/Q3 podría bajar a 14-18 GB, aunque el autor advierte que Q2K/Q3 son solo "pasables".
- GPU recomendadas: para FP16, múltiples A100 80GB o H100 80GB. Para Q4, una RTX 4090 (24 GB) o A6000 (48 GB) puede ser suficiente, aunque con margen justo.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 o inferiores en tarjetas de 24 GB como la RTX 4090, siempre que se limite el contexto y el número de expertos activos.
- Opciones de despliegue: llama.cpp y Ollama para GGUF, MLX para Apple Silicon, vLLM y TGI para safetensors en FP16 o cuantizaciones compatibles.
- Latencia y throughput: no disponible. El autor recomienda un mínimo de 8k-16k de contexto para el modo thinking y la salida, lo que sugiere que contextos muy largos incrementan notablemente el coste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-42B-Thinking-Abliterated-CODER | 42B (MoE, 8 activos) | 256k | Apache 2.0 | Fine-tune abliterated con Brainstorm 20x, orientado a código |
| Qwen3-30B-A3B-Thinking-2507 | 30B (MoE, 3B activos) | 256k | Apache 2.0 | Modelo base oficial de Qwen, con alineación y censura estándar |
| Huihui-Qwen3-30B-A3B-Thinking-2507-abliterated | 30B (MoE, 3B activos) | 256k | Apache 2.0 | Versión abliterated del anterior, sin el adaptador Brainstorm |
| Qwen3-55B-A3B-TOTAL-RECALL-Deep-40X | 55B (MoE) | 128k según el autor | Apache 2.0 | Variante mayor del mismo proyecto, con Brainstorm 40x, orientada a contexto más corto |

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de la dirección de rechazo puede producir contenido sensible sin filtros, lo que requiere moderación externa en producción.
- El autor advierte que, pese a la abliteración, el modelo puede generar contenido "bland" (descafeinado) si no se le dan instrucciones explícitas sobre el tono o el vocabulario a usar.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad en tareas de código o razonamiento.
- Idiomas limitados a inglés, francés, chino y alemán; el castellano no figura entre los idiomas declarados.
- El ajuste del número de expertos activos en inferencia es un parámetro no estándar que puede complicar el despliegue en servidores de inferencia convencionales.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede incumplir políticas de plataformas o normativa según el contexto de uso.
- El repositorio tiene pocas descargas (368) y cero likes en el momento de la consulta, lo que indica poca validación comunitaria.
- El autor recomienda cuantizaciones Q4/IQ4 o superiores; las cuantizaciones bajas degradan notablemente la calidad.

## Enlaces

- HuggingFace: https://huggingface.co/diablomike20/Qwen3-42B-Thinking-Abliterated-CODER
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-30B-A3B-Thinking-2507-abliterated
- Modelo raíz Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Modelo raíz Qwen3-30B-A3B-Thinking-2507: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Versión no abliterated del mismo autor: https://huggingface.co/DavidAU/Qwen3-42B-A3B-2507-Thinking-TOTAL-RECALL-v2-Medium-MASTER-CODER
- Proyecto Total Recall (settings y detalles): https://huggingface.co/DavidAU/Qwen3-55B-A3B-TOTAL-RECALL-Deep-40X-GGUF/
- GGUF: https://huggingface.co/mradermacher/Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER-GGUF
- GGUF imatrix: https://huggingface.co/mradermacher/Qwen3-42B-A3B-2507-Thinking-Abliterated-uncensored-TOTAL-RECALL-v2-Medium-MASTER-CODER-i1-GGUF
- MLX: https://huggingface.co/nightmedia (enlace truncado en la model card)
- Artículo LinkedIn sobre settings V1.4: https://www.linkedin.com/posts/gchesler_davidauqwen3-53b-a3b-total-recall-v14-128k-activity-7344938636141858816-ILCM/
- Artículo LinkedIn sobre Haskell/Postgres/agentic: https://www.linkedin.com/posts/gchesler_haskell-postgres-agentic-activity-7347103276141596672-_zbo/
