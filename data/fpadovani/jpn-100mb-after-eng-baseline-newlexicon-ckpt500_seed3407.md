# fpadovani/jpn-100mb-after-eng-baseline-newlexicon-ckpt500_seed3407

## Resumen

El modelo `fpadovani/jpn-100mb-after-eng-baseline-newlexicon-ckpt500_seed3407` es un fine-tune de un modelo de lenguaje basado en la arquitectura GPT-2, desarrollado por fpadovani (afiliado a la Universidad de Groningen, según el enlace de Weights & Biases). Se trata de un experimento de investigación sobre adquisición de idiomas: el modelo base fue entrenado con 100 MB de texto en inglés y posteriormente se fine-tuneó con datos en japonés mediante Supervised Fine-Tuning (SFT) usando la librería TRL. El nombre del checkpoint (`ckpt500`) indica que se guardó tras 500 pasos de entrenamiento.

Este modelo tiene 124,77 millones de parámetros, lo que lo sitúa en la gama de GPT-2 small. Su relevancia radica en que explora cómo un modelo previamente entrenado en un idioma puede adaptarse a otro con un vocabulario nuevo (de ahí el sufijo `newlexicon`), un tema pertinente para investigación en transferencia lingüística y aprendizaje incremental. Sin embargo, es un modelo de investigación, no orientado a producción, y carece de documentación pública detallada sobre sus capacidades o rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024 tokens, estándar GPT-2) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (por el nombre se infiere inglés y japonés) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de tipo GPT-2 con 124 millones de parámetros, la configuración clásica de GPT-2 small (12 capas, 12 cabezas de atención, dimensión de embedding 768). Según la model card, es un fine-tune del modelo base `fpadovani/ppt-art-lang-newlexicon-eng-baseline-100mb_seed3407`, que a su vez fue entrenado con 100 MB de datos en inglés. El proceso de fine-tuning se realizó con SFT (Supervised Fine-Tuning) utilizando la librería TRL (versión 0.23.0) con Transformers 4.56.2 y PyTorch 2.11.0. El nombre `newlexicon` sugiere que se introdujo un vocabulario nuevo (posiblemente un tokenizador expandido o un léxico alternativo) durante el entrenamiento en japonés. No se especifican detalles sobre el dataset japonés, el número total de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva: el modelo puede completar secuencias de texto dado un prompt inicial.
- Fine-tuning específico para japonés: está diseñado para probar la transferencia de conocimiento desde inglés a japonés con un léxico renovado.
- Compatible con el pipeline `text-generation` de Hugging Face Transformers.
- Soporta el formato de chat simple con roles (`user`/`assistant`) según el ejemplo de la model card.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modos de pensamiento extendido.

## Casos de uso

- Investigación en transferencia lingüística: permite estudiar cómo un modelo entrenado en inglés se adapta a un nuevo idioma (japonés) cuando se le proporciona un léxico actualizado, útil para experimentos en aprendizaje incremental de lenguas.
- Evaluación de técnicas de SFT: sirve como punto de referencia para comparar estrategias de fine-tuning (por ejemplo, con o sin nuevo léxico) en contextos de datos limitados (100 MB).
- Generación de texto en japonés para prototipos: aunque no está optimizado para producción, puede generar respuestas cortas en japonés para pruebas de concepto.
- Análisis de la evolución del modelo durante el entrenamiento: al ser un checkpoint intermedio (paso 500), permite estudiar la dinámica de aprendizaje y la aparición de capacidades emergentes.
- Base para fine-tuning adicional: puede servir como punto de partida para experimentos con otros idiomas o dominios.
- Educación y divulgación: útil para demostrar el proceso de fine-tuning de un modelo GPT-2 con recursos limitados en un entorno académico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo parece ser un artefacto de investigación sin métricas reportadas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 124M parámetros, la inferencia en FP32 requiere aproximadamente 0,5 GB de VRAM; con cuantización a 8 bits, menos de 0,25 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1060, RTX 2060, RTX 3060, etc. También puede ejecutarse en CPU con razonable velocidad.
- El tamaño del repositorio es de 11,5 GB, lo que sugiere que contiene múltiples archivos (posiblemente varios checkpoints o archivos de estado del optimizador), pero el modelo en sí es pequeño.
- Opciones de despliegue: compatible con Transformers, puede usarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) o TGI, aunque al ser un modelo de investigación no está especialmente optimizado para producción.
- Latencia y throughput: no se han publicado mediciones, pero en una GPU moderna se espera una latencia de decodificación del orden de decenas de milisegundos por token.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo es un fine-tune experimental de GPT-2 small, por lo que podría compararse con el GPT-2 original (124M) o con otros modelos pequeños entrenados para japonés (por ejemplo, `rinna/japanese-gpt2-small`), pero no hay datos de rendimiento publicados para este modelo concreto. Se recomienda consultar los repositorios de modelos como `rinna/japanese-gpt2-small` o `abeja/gpt2-large-japanese` para alternativas en japonés, aunque sus arquitecturas y tamaños difieren.

## Limitaciones y advertencias

- No se ha documentado el rendimiento en tareas reales; es un modelo de investigación sin validación externa.
- La licencia no está especificada, lo que impide su uso comercial sin aclaración previa con el autor.
- El contexto máximo no está confirmado; si es el estándar de GPT-2 (1024 tokens), no es adecuado para tareas que requieran contexto largo.
- No se conocen los sesgos del modelo, pero al estar entrenado con solo 100 MB de datos en inglés y un fine-tune en japonés, es probable que tenga lagunas de conocimiento y una alta tasa de alucinación en temas fuera de su dominio de entrenamiento.
- El repositorio es grande (11,5 GB) para un modelo de 124M parámetros, lo que puede indicar la inclusión de artefactos de entrenamiento no necesarios para inferencia.
- No hay garantía de que el modelo genere texto coherente en japonés; su calidad dependerá de la cantidad y calidad de los datos de fine-tuning, que no se detallan.

## Enlaces

- [Hugging Face - fpadovani/jpn-100mb-after-eng-baseline-newlexicon-ckpt500_seed3407](https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-ckpt500_seed3407)
- [Modelo base en Hugging Face](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-eng-baseline-100mb_seed3407)
- [Weights & Biases run (entrenamiento)](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/416whc3l)
- [FriendliAI - despliegue del modelo](https://friendli.ai/models/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-ckpt500_seed3407)
- [LLM Explorer - entrada del modelo](https://llm-explorer.com/model/fpadovani%2Fppt-art-lang-jpn-baseline-100mb_seed10,3q0KxrXVgRxg1BGxYZyj8y)
