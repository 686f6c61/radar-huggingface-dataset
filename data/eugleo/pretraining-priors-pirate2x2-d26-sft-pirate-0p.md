# Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-0p

## Resumen

Este modelo es el brazo de control de un experimento científico llamado **exp-075** dentro del proyecto *pretraining-priors*, desarrollado por Eugleo y colaboradores. Se trata de un modelo de lenguaje de 972 millones de parámetros, fine-tuneado con instrucciones (SFT) sobre un modelo base preentrenado con una mezcla de datos estándar y un corpus especial denominado "pirate 2x2" (registro lingüístico pirata). La particularidad de esta versión es que **no contiene ninguna muestra de matemáticas en el registro pirata** en su fase de supervisión, lo que sirve como línea base para medir el efecto de añadir dicho registro en los otros cuatro brazos del experimento.

El modelo está diseñado para investigación, no para uso en producción. Su objetivo es aislar la influencia de la proporción de datos de matemáticas con estilo pirata en el rendimiento general y en la transferencia a tareas matemáticas reales (GSM8K). La model card documenta explícitamente que la capacidad general permanece plana en todo el rango de dosis (0% a 25.61% de tokens supervisados piratas), mientras que GSM8K mejora ligeramente con la dosis, aunque dentro del ruido estadístico. Este modelo concreto obtiene un 0% en GSM8K, lo que confirma que no ha visto matemáticas reales ni piratas durante el SFT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo nanochat, con `trust_remote_code`); detalles exactos no disponibles |
| Parámetros totales | 972.947.456 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | bf16 (safetensors); no se proporcionan otros formatos |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (con código personalizado, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only, pero la model card no especifica detalles como número de capas, heads o dimensiones. El modelo se basa en un checkpoint base (`d26-r10-18f55c9321ff`, paso 8758) preentrenado sobre una mezcla llamada ClimbMix más cuatro corpus "pirate 2x2" (que constituyen el 4.23% del flujo de preentrenamiento). En estos corpus, el registro pirata solo aparece cuando el turno del usuario lo solicita, y los gatos solo están en el cuadrante pirate-QA.

La fase de SFT se realizó sobre SmolTalk (460,341 filas) y MMLU `auxiliary_train` ×3 (299,526 filas). No se incluyó ningún dato de GSM8K real ni pirata en esta fase. El entrenamiento se ejecutó en 8×H200 durante 22 minutos y 47 segundos (paso 461), con una secuencia de 2048 tokens, batch total de 1,048,576 tokens, sin warmup, weight decay 0, y un descenso lineal de la tasa de aprendizaje en el último 50%. El optimizador se inicializó en caliente con los shards del checkpoint base. Todos los hiperparámetros son idénticos en los cinco brazos del experimento, por lo que la única diferencia es la proporción de filas piratas en el conjunto supervisado.

## Capacidades

- Generación de texto en inglés con formato de chat (incluye plantilla de chat en el repositorio).
- Razonamiento de sentido común y conocimiento general: alcanza un 63.97% en ARC-Easy y un 48.46% en ARC-Challenge.
- Conocimiento factual limitado: 37.67% en MMLU (promedio de 57 materias), lo que indica un nivel bajo de conocimiento enciclopédico.
- Generación de código incipiente: 11.59% en HumanEval (pass@1), muy por debajo de modelos especializados.
- Capacidades matemáticas prácticamente nulas: 0% en GSM8K, ya que no fue entrenado con datos de matemáticas en el SFT.
- No se ha evaluado ni documentado soporte para tool calling, agentes, visión, audio o funciones multimodales.
- No hay evidencia de capacidades multilingües; el modelo está entrenado exclusivamente en inglés.

## Casos de uso

- **Investigación sobre el efecto de la composición del corpus en el rendimiento**: este modelo es el control ideal para aislar el impacto de añadir datos de matemáticas en un registro específico (pirata) durante el SFT. Permite comparar contra los brazos tratados del mismo ladder.
- **Estudio de transferencia de habilidades matemáticas**: al no tener ninguna muestra matemática en el SFT, sirve para medir cuánto conocimiento matemático se hereda del preentrenamiento y cuánto se adquiere con el SFT.
- **Análisis de sesgos lingüísticos**: al estar entrenado con un registro pirata solo en preentrenamiento (y solo cuando el usuario lo solicita), permite investigar si el modelo adopta ese registro de forma espontánea o lo mantiene bajo control.
- **Benchmark de evaluación de modelos de 1B**: aunque su rendimiento es bajo, puede usarse como referencia para comparar arquitecturas de tamaño similar en tareas de razonamiento general.
- **Investigación sobre robustez del fine-tuning**: se puede estudiar cómo la ausencia de datos de una categoría (matemáticas) afecta la estabilidad de la capacidad general.
- **Entrenamiento de modelos de investigación**: dado su licencia MIT y su naturaleza experimental, puede servir como base para experimentos académicos de ajuste fino adicional sin restricciones comerciales.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación (decodificación greedy, top_k 50, seed 42, 512 tokens nuevos) para este modelo concreto:

| Tarea | Resultado |
|---|---|
| ARC-Easy | 63.97% |
| ARC-Challenge | 48.46% |
| MMLU | 37.67% |
| HumanEval | 11.59% |
| GSM8K | 0.00% |
| ChatCORE | 0.2235 |

El autor destaca que la capacidad general es plana en todo el rango de dosis (ChatCORE entre 0.2233 y 0.2274), y que el spread de ~0.0041 está dentro del ruido de semilla (medido en ~0.013 en experimentos anteriores). El único indicador que muestra una tendencia con la dosis es GSM8K, que pasa de 0% (este modelo) a 1.74% en el brazo de 18.67%, con un error binomial de ~0.33 puntos. No se proporcionan comparaciones con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 972M parámetros en bf16 (2 bytes por parámetro), por lo que los pesos ocupan aproximadamente 1.94 GB. Con overhead de activaciones y caché KV, se puede ejecutar en una GPU con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia. Para entrenamiento o fine-tuning, se recomienda al menos una GPU con 16 GB (p. ej., RTX 4090) o un clúster.
- Cuantización: no se ofrecen formatos GGUF ni cuantizados en el repositorio; solo bf16. Se podría convertir a 8-bit o 4-bit con herramientas externas para reducir aún más la huella.
- Opciones de despliegue: dado que es un modelo pequeño con `trust_remote_code`, puede cargarse con librerías como Transformers, vLLM (si se adapta) o llama.cpp (si se convierte a GGUF). No se proporciona soporte oficial para Ollama o TGI.
- Latencia: no se han publicado mediciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información de benchmarks comparativos con otros modelos de tamaño similar (como modelos de 1B de la familia SmolLM, TinyLlama o Pythia). La model card solo reporta los resultados de este modelo y de los otros cuatro brazos del mismo experimento. Por tanto, no se puede elaborar una comparativa con alternativas externas.

## Limitaciones y advertencias

- **Modelo de investigación**: no está pensado para uso en producción; su rendimiento es bajo en tareas estándar (MMLU 37.67%, HumanEval 11.59%).
- **Ausencia de capacidades matemáticas**: 0% en GSM8K, lo que lo hace inadecuado para tareas de razonamiento numérico.
- **Sesgos y alucinaciones**: no se han evaluado específicamente; dado su tamaño y entrenamiento limitado, es probable que presente alucinaciones y sesgos de género, raza o cultura, aunque no se documentan.
- **Registro lingüístico**: el modelo fue preentrenado con un corpus que incluye un registro pirata, aunque solo aparece cuando el usuario lo solicita. No se ha evaluado si adopta ese registro de forma espontánea, y no se recomienda su uso en contextos que requieran neutralidad.
- **Licencia**: MIT permite uso comercial y modificación, pero el modelo no tiene valor práctico para productos reales.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; se debe revisar antes de usar en entornos sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-0p
- Modelo base: https://huggingface.co/jkminder/pretraining-priors-pirate2x2-d26-base
- Dataset pirate 2x2: https://huggingface.co/datasets/Eugleo/pretraining-priors-pirate-2x2
- Otro modelo del ladder (con dosis de pirate): https://huggingface.co/Eugleo/pretraining-priors-pirate2x2-d26-sft-pirate-5p (y análogos para 10p, 19p, 26p)
- Repositorio del proyecto (no enlazado directamente, pero mencionado como `pretraining-priors` en el registro de experimentos).
