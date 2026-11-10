# inference-optimization/Qwen3.6-35B-A3B-RAZOR25

## Resumen

Qwen3.6-35B-A3B es la primera variante de pesos abiertos de la familia Qwen3.6, publicada por el equipo Qwen de Alibaba. Se trata de un modelo causal multimodal (lenguaje con codificador de visión) con arquitectura Mixture of Experts (MoE) de 35B parámetros totales y aproximadamente 3B activados por token. Su distribución interna combina capas de atención lineal Gated DeltaNet con capas de atención con compuerta (Gated Attention), lo que reduce el coste computacional manteniendo una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000.

El modelo está orientado a cargas de trabajo de codificación agéntica: razonamiento a nivel de repositorio, flujos de trabajo de frontend y uso intensivo de herramientas. Incorpora una novedad denominada "Thinking Preservation", que permite retener el contexto de razonamiento de mensajes anteriores para reducir la sobrecarga en iteraciones de desarrollo. La model card cita mejoras sustanciales frente a Qwen3.5-35B-A3B en SWE-bench Verified (73,4 frente a 70,0) y SWE-bench Pro (49,5 frente a 44,6).

El checkpoint aquí descrito pertenece al usuario `inference-optimization`, que lo redistribuye bajo licencia Apache 2.0 con la etiqueta `Qwen3.6-35B-A3B-RAZOR25`. El repositorio ocupa 55,8 GB y declara 27.893.516.144 parámetros reales en los safetensors, un dato que difiere de los 35B nominales del modelo original, por lo que conviene verificar el contenido antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión y Mixture of Experts; 40 capas con layout 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)) |
| Parámetros totales | 35B (nominal, model card); 27.893.516.144 en safetensors del repo redistribuido |
| Parámetros activos | ~3B por token (8 expertos enrutados + 1 compartido de 256 totales) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM, SGLang, KTransformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido con dos tipos de capas de atención intercaladas. Diez bloques repiten tres capas de Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidas de una capa de Gated Attention clásica (16 cabezas Q, 2 cabezas KV, dimensión 256, RoPE de 64 dimensiones). Cada capa de atención va seguida de un bloque MoE con 256 expertos, de los que se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512. La dimensión oculta es 2048 y el embedding de tokens y la salida LM tienen 248.320 entradas (con padding). El modelo se entrenó con Multi-Token Prediction (MTP) multi-paso.

El entrenamiento comprende fases de preentrenamiento y postentrenamiento, aunque la model card no detalla el número de tokens, la composición del dataset ni si se aplicaron RLHF o DPO. La innovación destacada es "Thinking Preservation", que conserva el contexto de razonamiento entre mensajes históricos para acelerar iteraciones en tareas de desarrollo. El modelo integra además un codificador de visión, por lo que el pipeline declarado es `image-text-to-text`.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto nativo de 262.144 tokens.
- Codificación agéntica: resolución de issues a nivel de repositorio, razonamiento sobre código y flujos de frontend.
- Comprensión de imágenes mediante codificador de visión (pipeline `image-text-to-text`).
- Uso de herramientas (tool calling) y razonamiento multi-paso, según el enfoque agéntico declarado.
- Modo de razonamiento persistente ("Thinking Preservation") para reutilizar contexto entre iteraciones.
- Capacidades multilingües: la model card incluye SWE-bench Multilingual con 67,2 puntos, lo que implica competencia en varios lenguajes de programación, aunque no se listan los idiomas naturales soportados.
- Compatibilidad con vLLM, SGLang, KTransformers y Hugging Face Transformers.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir un issue y un snapshot del repositorio, razonar sobre el código y proponer un parche; su puntuación de 73,4 en SWE-bench Verified lo sitúa como candidato para pipelines de revisión asistida.
- Agente de codificación en CI/CD: integrado mediante tool calling, puede ejecutar comandos en terminal y validar cambios; Terminal-Bench 2.0 evalúa precisamente esta capacidad.
- Asistente de desarrollo con contexto largo: con 262.144 tokens nativos puede cargar repositorios medianos completos o historiales extensos de conversación sin truncamiento.
- Análisis de documentación técnica con imágenes: gracias al codificador de visión puede interpretar diagramas de arquitectura, capturas de UI o esquemas junto con texto.
- Migración y refactorización multilingüe: su rendimiento en SWE-bench Multilingual (67,2) lo hace útil para proyectos con múltiples lenguajes de programación.
- Generación de interfaces frontend: la model card destaca específicamente la fluidez en flujos de frontend, aplicable a generación de componentes y maquetación.
- Iteración de desarrollo con razonamiento persistente: "Thinking Preservation" reduce la repetición de contexto en sesiones largas de depuración.

## Benchmarks y rendimiento

Datos de la model card (porcentaje de resolución):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible (truncado en la información) | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de visión.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: alrededor de 56 GB solo para pesos (coincide con el tamaño del repo de 55,8 GB), más overhead de KV cache y activaciones.
- VRAM estimada en cuantización de 8 bits: aproximadamente 28-30 GB; en 4 bits, en torno a 14-18 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o múltiples RTX 4090/5090 en tensor parallel.
- Cabe en GPU de consumo (RTX 4090 24 GB) solo con cuantización agresiva (4 bits) y posiblemente con descarga parcial a CPU.
- Opciones de despliegue: vLLM, SGLang, KTransformers y Hugging Face Transformers, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | ~3B | 262.144 (ext. 1,01M) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B | denso | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible |
| Gemma4-26BA4B | 26B | ~4B | no disponible | 17,4 | no disponible |

Qwen3.5-27B supera a Qwen3.6-35B-A3B en SWE-bench Verified (75,0 frente a 73,4), aunque el modelo MoE activa muchos menos parámetros por token y ofrece contexto mucho mayor. Gemma4-31B queda claramente por detrás en tareas de codificación agéntica según los datos del autor.

## Limitaciones y advertencias

- El repositorio redistribuido declara 27,89B parámetros en safetensors frente a los 35B nominales de la model card original: existe una discrepancia que debe verificarse antes de usar el checkpoint en producción.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; no hay evidencia de validación por la comunidad.
- La model card no detalla composición del dataset, número de tokens de entrenamiento ni si se aplicó RLHF/DPO, lo que dificulta evaluar sesgos.
- No se listan los idiomas naturales soportados; el soporte multilingüe solo se infiere de SWE-bench Multilingual.
- Riesgo de alucinación inherente a modelos generativos, especialmente en razonamiento sobre repositorios grandes.
- La licencia Apache 2.0 permite uso comercial, pero el `license_link` apunta al LICENSE del modelo original de Qwen, por lo que conviene revisar los términos del upstream.
- El contexto extensible a 1.010.000 tokens puede degradar la calidad y disparar el consumo de KV cache; no se documentan resultados a esa longitud.
- No hay datos publicados de latencia, throughput ni benchmarks de visión en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/inference-optimization/Qwen3.6-35B-A3B-RAZOR25
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
