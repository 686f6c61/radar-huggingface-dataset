# Can1178/others

## Resumen

`Can1178/others` es un repositorio de artefactos de investigación publicado en Hugging Face por el usuario Can1178. No se trata de un modelo entrenado de forma independiente, sino de un contenedor de resultados locales, checkpoints intermedios, evaluaciones parciales y trazas de entrenamiento asociados a una línea de trabajo sobre razonamiento con búsqueda (deep research) y aprendizaje por refuerzo. El único conjunto de pesos completo descrito es `weights/Qwen3-8B-rsi-prm-grpo-32gpu-gs1120/`, un Qwen3-8B fusionado tras entrenamiento RSI (Reinforcement learning with Self-Improvement, presumiblemente) con PRM-GRPO hasta el paso físico 1120, distribuido en cuatro ficheros safetensors junto con tokenizer y configuración.

El repositorio incluye además directorios de evaluación sobre seis conjuntos de referencia (2Wiki, WebWalker, GAIA, ResearchQA, QA2DR y DeepSearchQA/DRB), curvas de entrenamiento PRM-GRPO, registros de ejecuciones cortas de filtrado GRPO y PRM-GRPO, y trazas de sondeo de 2128 casos. La model card está redactada en chino y describe la procedencia de cada directorio respecto a una ruta local (`/mnt/data/nas2/xiaocan.wc`), lo que confirma que se trata de material de archivo interno más que de un modelo listo para producción.

La relevancia de esta ficha es limitada como modelo de uso general: no hay pipeline declarado, ni licencia, ni idiomas, ni datos de benchmarks publicados en la información disponible. Su interés real está en la reproducibilidad de una receta de RL sobre Qwen3-8B orientada a tareas de búsqueda y razonamiento multi-paso, y en la disponibilidad de pesos intermedios y trazas que permiten auditar el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3-8B; detalles específicos no disponibles) |
| Parametros totales | 8 000 millones (aproximado, según el nombre del checkpoint Qwen3-8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las evaluaciones incluyen conjuntos en inglés y una evaluación DRB en chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuatro fragmentos), más tokenizer y configuración |

## Arquitectura y entrenamiento

El checkpoint principal es un Qwen3-8B sometido a un proceso de entrenamiento por refuerzo denominado RSI con PRM-GRPO (GRPO con modelado de recompensa por proceso, Process Reward Model) ejecutado en 32 GPU, hasta el paso físico 1120. Según la model card, el paso mostrado 560 corresponde al paso físico 1008, y el modelo "Ours" de la tabla principal usa el paso físico 560, cuyos pesos están en otro repositorio (`Can1178/directed-capability-extension`). El repositorio también conserva ejecuciones cortas de filtrado GRPO y PRM-GRPO entre el 12 y el 15 de septiembre de 2026, así como ejecuciones cortas de evolución (evo) con distinto número de rollouts.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de SFT, DPO o RLHF adicionales más allá del esquema PRM-GRPO descrito. Tampoco se detallan innovaciones de arquitectura (atención lineal, decodificación especulativa, etc.). Lo que sí está documentado es el andamiaje experimental: seis conjuntos de evaluación, subconjuntos de 100 y 50 preguntas para comparaciones rápidas, y 2128 trazas de sondeo con metadatos de origen (`dev_nq385`, `dev_nq864`, `train_to2000`).

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a tareas de búsqueda y respuesta a preguntas (los conjuntos evaluados son 2Wiki, WebWalker, GAIA, ResearchQA, QA2DR y DeepSearchQA/DRB).
- Razonamiento con recuperación de información: las evaluaciones giran en torno a pipelines de búsqueda web y respuesta fundamentada.
- Entrenamiento con recompensa por proceso (PRM), lo que sugiere optimización de cadenas de razonamiento intermedias, no solo del resultado final.
- Capacidad multilingüe parcial evidenciada por una evaluación DRB en chino (50 preguntas) además de las evaluaciones en inglés.
- No hay información disponible sobre soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación reproducible en RL para razonamiento: el repositorio permite reproducir curvas de entrenamiento PRM-GRPO y comparar checkpoints intermedios (pasos 40, 60, 64, 102, 112, 224, 560, 672, 1120) sobre los mismos subconjuntos de evaluación.
- Auditoría de pipelines de deep research: las 2128 trazas de sondeo en `probe/cases/` permiten inspeccionar el comportamiento del modelo paso a paso en tareas de búsqueda y respuesta.
- Evaluación comparativa de métodos de RL: los directorios `evals/otherckpt_researchqa/` y `evals/webwalker_small/` ofrecen puntos de comparación entre filter-GRPO, filter-PRM-GRPO y evo-PRM-GRPO sobre las mismas 100 preguntas.
- Réplica de experimentos de recompensa por proceso: los ficheros `grpo_metrics.jsonl` y las curvas de entropía y puntuación en `traininfo/plots/` sirven para validar la estabilidad del entrenamiento antes de lanzar ejecuciones largas.
- Base para ajuste posterior en dominios de búsqueda: al ser un Qwen3-8B fusionado, puede servir como punto de partida para SFT o RL adicional en tareas de QA documental, siempre que se resuelva la licencia.
- Estudio de degradación por paso de entrenamiento: la disponibilidad de checkpoints en múltiples pasos físicos permite analizar olvido catastrófico y deriva de comportamiento en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona seis conjuntos de evaluación y subconjuntos parciales, pero no incluye tablas de puntuaciones ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 5-6 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala (el entrenamiento se realizó en 32 GPU); RTX 4090 (24 GB) para inferencia en BF16 con contexto limitado o en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 y GPUs con 24 GB en BF16 con contexto moderado; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: al ser pesos safetensors de un derivado de Qwen3-8B, son aplicables vLLM, TGI, llama.cpp (tras conversión a GGUF) y Ollama (tras conversión). No se documenta compatibilidad verificada con ninguno de ellos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Can1178/others (Qwen3-8B RSI PRM-GRPO) | ~8 000 M | no disponible | no disponible | Pesos safetensors en HF | Checkpoint de investigación con evaluaciones parciales |
| Qwen3-8B (base) | ~8 000 M | no disponible en esta ficha | no disponible en esta ficha | Público en HF | Modelo de partida del entrenamiento |
| Alternativas de razonamiento con búsqueda de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide determinar si el uso comercial es posible; debe consultarse al autor antes de cualquier despliegue en producción.
- El repositorio es un archivo de resultados locales, no un modelo empaquetado para uso general: no hay pipeline declarado, ni idiomas, ni documentación de inferencia.
- Los pesos publicados corresponden al paso físico 1120, que no es el checkpoint usado en la tabla principal del autor (paso físico 560); comparaciones directas con los resultados publicados en otros repositorios pueden no ser válidas.
- Riesgo de alucinación no evaluado en la información disponible; los conjuntos de evaluación son de respuesta a preguntas con recuperación, un dominio propenso a errores de fundamentación.
- Los subconjuntos de evaluación son pequeños (25 a 500 preguntas), por lo que las diferencias entre checkpoints pueden no ser estadísticamente significativas.
- La model card está en chino y las rutas de origen son locales, lo que dificulta la reproducibilidad completa sin acceso al entorno original.
- No hay información sobre sesgos, filtrado de seguridad ni alineación; un modelo ajustado con RL sobre recompensas por proceso puede presentar deriva hacia formatos de razonamiento concretos.
- El contexto máximo no está documentado, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Can1178/others
- Repositorio con la tabla principal de evaluación: https://huggingface.co/Can1178/main_result
- Repositorio con val300 y pesos fusionados: https://huggingface.co/Can1178/rubric-noend
- Repositorio con curvas de entrenamiento y rollouts de la ejecución larga: https://huggingface.co/Can1178/train_info
- Repositorio con pesos SFT 414 y RSI paso físico 560: https://huggingface.co/Can1178/directed-capability-extension
- Repositorio GitHub del framework de entrenamiento (`evorl`): no disponible como URL completa en la información proporcionada
