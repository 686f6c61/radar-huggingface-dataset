# richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic

## Resumen

OLMo-2-0325-32B-Instruct-ARA-heretic es una variante "decensored" (también etiquetada como abliterated o uncensored) del modelo allenai/OLMo-2-0325-32B-Instruct, publicada por el usuario richardyoung. La modificación se ha realizado con la herramienta Heretic v2.0.0, que aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 25 a 63 del transformer para reducir la tasa de rechazos del modelo original. El resultado es un modelo de 32.234.279.936 parámetros (32B densos, no MoE) que conserva la arquitectura y el tokenizador del OLMo 2 original, pero con un comportamiento notablemente menos restrictivo ante peticiones que el modelo base rechazaría.

El modelo base, OLMo 2 32B Instruct (marzo de 2025), es un transformer decoder-only desarrollado por el Allen Institute for AI (Ai2) dentro de la familia Open Language Models. Se entrenó sobre el corpus Dolma y se postentrenó con un pipeline de tres fases: SFT sobre una variante de Tülu 3, DPO sobre un mix de preferencias y RLVR sobre el dataset RLVR-GSM-MATH-IF-Mixed-Constraints. La relevancia de esta variante concreta radica en que permite estudiar el efecto de la ablación de direcciones de comportamiento sobre un modelo completamente abierto, reproducible y con licencia Apache 2.0, manteniendo la trazabilidad del proceso (el autor incluye el directorio `reproduce` con los parámetros exactos de la ablación).

La ficha se centra en el modelo publicado por richardyoung, pero buena parte de las especificaciones (arquitectura, contexto, entrenamiento) provienen del modelo base de Ai2, ya que la model card de la variante no las repite. Cualquier dato no confirmado se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 2) |
| Parámetros totales | 32.234.279.936 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base OLMo 2 soporta contexto largo, pero no se confirma la cifra exacta) |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors; compatible con cuantización estándar vía transformers/bitsandbytes, sin confirmar) |
| Idiomas soportados | Inglés (declarado: `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`transformers`) |
| Tamaño del repositorio | 64,5 GB |
| Modelo base | allenai/OLMo-2-0325-32B-Instruct |
| Herramienta de modificación | Heretic v2.0.0 (Arbitrary-Rank Ablation) |
| Capas ablacionadas | 25 a 63 |
| Descargas / likes | 0 / 0 (a fecha de creación del registro) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OLMo 2 32B: un transformer decoder-only denso de 32B parámetros entrenado por Ai2 sobre el corpus Dolma (mezcla de datos públicos, sintéticos y creados por humanos). El postentrenamiento del modelo base siguió tres etapas: supervised fine-tuning sobre una variante específica de OLMo del dataset Tülu 3, seguido de DPO sobre `allenai/olmo-2-0325-32b-preference-mix` y, finalmente, RLVR (reinforcement learning with verifiable rewards) sobre `allenai/RLVR-GSM-MATH-IF-Mixed-Constraints`. Este último paso está orientado a mejorar matemáticas (GSM8K, MATH) e instrucciones verificables (IFEval). Ai2 publica código, checkpoints intermedios (cada 20 pasos de RLVR), logs y detalles de entrenamiento, lo que hace de OLMo 2 una de las familias más reproducibles del ecosistema abierto.

La modificación de richardyoung no reentrena el modelo: aplica una ablación de rangos arbitrarios sobre las representaciones internas de las capas 25 a 63. Los parámetros publicados son `start_layer_index=25`, `end_layer_index=63`, `preserve_good_behavior_weight=0.2077`, `steer_bad_behavior_weight=0.0002`, `overcorrect_relative_weight=0.4450` y `neighbor_count=13`. El efecto medido por el autor es una reducción de rechazos de 98/100 en el modelo original a 34/100 en esta variante, con una divergencia KL de 0,0494 respecto al original. La model card indica que el proceso es reproducible y que el directorio `reproduce` contiene los detalles. No se especifica en la información disponible si se aplicó algún ajuste adicional de calibración o evaluación de capacidades tras la ablación.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, heredada del pipeline SFT + DPO + RLVR de OLMo 2 Instruct.
- Razonamiento matemático y resolución de problemas tipo GSM8K y MATH, reforzado por la fase de RLVR del modelo base.
- Seguimiento de instrucciones verificables (IFEval) gracias al entrenamiento con recompensas verificables.
- Razonamiento de sentido común y tareas de conocimiento general (MMLU, BBH, DROP, PopQA, TruthfulQA en el modelo base).
- Comportamiento menos restrictivo ante peticiones que el modelo original rechazaría (34/100 rechazos frente a 98/100), lo que habilita casos de uso de investigación sobre alineamiento y seguridad.
- Soporte de plantilla de chat integrada en el tokenizador (`apply_chat_template`) con formato `<|user|> ... <|assistant|> ... <|endoftext|>`.
- No se confirma en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" explícito.
- Capacidad multilingüe limitada: el modelo declara únicamente inglés.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo varía la tasa de rechazos y la distribución de respuestas tras una ablación ARA, comparando directamente con el OLMo 2 Instruct original y usando la divergencia KL reportada como métrica de deriva.
- Evaluación de técnicas de "decensoring": sirve como referencia reproducible para validar la herramienta Heretic v2.0.0 y comparar configuraciones de ablación (pesos, capas, vecinos) sobre un modelo de 32B con licencia permisiva.
- Generación de datos sintéticos para investigación: al reducir los rechazos, puede emplearse para producir corpus de entrenamiento o evaluación en dominios donde el modelo original se negaría a responder, siempre con revisión humana posterior.
- Fine-tuning específico de dominio: al ser Apache 2.0 y estar disponible en safetensors, se puede ajustar sobre datos propios (legal, médico, técnico) sin las restricciones de licencia de modelos con pesos cerrados.
- Despliegue en entornos de investigación con requisitos de reproducibilidad: el pipeline de Ai2 (OLMo-core, open-instruct, olmes) y los checkpoints intermedios permiten reconstruir el modelo y auditar cada etapa.
- Estudio de estabilidad tras ablación: útil para medir la degradación de capacidades (MMLU, GSM8K, IFEval) al comparar esta variante con el modelo base en el mismo harness de evaluación.
- Prototipado de asistentes conversacionales en inglés con contexto de chat: la plantilla integrada y el formato `<|user|>`/`<|assistant|>` facilitan la integración en pipelines de transformers.

## Benchmarks y rendimiento

La model card de la variante solo publica métricas del proceso de ablación, no benchmarks estándar de capacidades. Se recogen a continuación los datos disponibles.

| Métrica | Este modelo | Modelo original (OLMo-2-0325-32B-Instruct) |
|---|---|---|
| Rechazos (Refusals) | 34/100 | 98/100 |
| Divergencia KL | 0,0494 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidades (MMLU, GSM8K, HumanEval, IFEval, etc.) para esta variante en la información disponible. Los benchmarks del modelo base OLMo 2 32B Instruct se pueden consultar en el paper de OLMo 2 (arXiv:2501.00656) y en la model card original de Ai2; la model card de esta variante no los reproduce íntegramente.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 64,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 80 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 32-35 GB, viable en una A100 40 GB o en dos RTX 4090 (24 GB cada una) con tensor parallelism.
- VRAM estimada en cuantización de 4 bits: en torno a 16-20 GB, potencialmente viable en una única RTX 4090 o RTX 3090 de 24 GB, con contexto limitado.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 para FP16/BF16; A100 40 GB o configuraciones multi-GPU para 8 bits; RTX 4090/3090 para 4 bits.
- Opciones de despliegue: transformers (versión main o superior, ya que OLMo 2 requiere una versión reciente), y previsiblemente vLLM, TGI y llama.cpp con soporte de la arquitectura `olmo2`; no se confirma en la información disponible el soporte explícito en Ollama ni en llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-ARA-heretic (este) | 32,2B densos | No disponible | Apache 2.0 | Variante ablacionada, 34/100 rechazos, KL 0,0494 |
| allenai/OLMo-2-0325-32B-Instruct | 32,2B densos | No disponible | Apache 2.0 | Modelo base, 98/100 rechazos, pipeline SFT+DPO+RLVR reproducible |
| Mistral-Nemo-Instruct-2407 | 12B densos (aprox.) | No disponible | Apache 2.0 | Alternativa abierta de menor tamaño; en la tabla de Ai2 obtiene 50,9 de media frente a modelos de 32B |
| Ministral-8B-Instruct | 8B densos (aprox.) | No disponible | No disponible | Alternativa abierta de menor tamaño; 52,1 de media en la tabla de Ai2 |

La comparación directa de capacidades con alternativas de 32B (p. ej., Qwen 2.5 32B, Gemma 2 27B, Mistral Small) no está disponible en la información proporcionada. La tabla de Ai2 incluida en la model card solo recoge resultados parciales de Mistral-Nemo y Ministral-8B, sin cifras completas para el propio OLMo 2 32B en esa tabla.

## Limitaciones y advertencias

- La ablación reduce drásticamente los rechazos (de 98/100 a 34/100), lo que implica un mayor riesgo de generar contenido dañino, sesgado o inapropiado, especialmente ante prompts adversarios.
- La divergencia KL de 0,0494 respecto al modelo original indica una deriva no trivial en la distribución de salidas; no se han publicado evaluaciones de capacidades que cuantifiquen posibles degradaciones en MMLU, GSM8K o IFEval.
- El modelo base OLMo 2 tiene entrenamiento de seguridad limitado y no incluye filtrado en bucle como ChatGPT; la variante ablacionada agrava esta característica.
- Idiomas: solo inglés declarado; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo aplicable.
- El modelo tiene 0 descargas y 0 likes en el momento del registro; no hay evidencia de comunidad ni de validación independiente de la variante.
- No se dispone de información sobre la longitud de contexto efectiva, el soporte de tool calling ni el rendimiento en producción de esta variante concreta.
- El uso de modelos "decensored" puede entrar en conflicto con políticas de plataformas, términos de servicio de proveedores cloud y normativas sectoriales; conviene revisar el contexto de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-ARA-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Modelo base (checkpoint): https://huggingface.co/allenai/OLMo-2-0325-32B/
- Heretic: https://heretic-project.org
- Paper OLMo 2: https://arxiv.org/abs/2501.00656
- Paper Tülu 3: https://arxiv.org/abs/2411.15124
- Página del proyecto OLMo: https://allenai.org/olmo
- Repositorio OLMo-core: https://github.com/allenai/OLMo-core
- Repositorio de evaluación olmes: https://github.com/allenai/olmes
- Repositorio open-instruct: https://github.com/allenai/open-instruct
- Demo de Ai2: https://playground.allenai.org/
- Dataset RLVR: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
- Dataset SFT Tülu 3 OLMo: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture
- Dataset de preferencias DPO: https://huggingface.co/datasets/allenai/olmo-2-0325-32b-preference-mix
