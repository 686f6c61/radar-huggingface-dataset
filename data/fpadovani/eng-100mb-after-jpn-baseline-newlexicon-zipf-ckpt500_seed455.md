# fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed455

## Resumen

El modelo `fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed455` es un ajuste fino (fine-tuning) de un modelo base de 124 millones de parámetros, desarrollado por Francesco Padovani (Universidad de Groninga). Se trata de un experimento de investigación sobre transferencia de lenguas y adquisición de vocabulario: el modelo base fue entrenado en japonés con un nuevo léxico y una distribución Zipf, y posteriormente se ajustó con datos en inglés. El nombre del checkpoint indica que es el paso 500 de entrenamiento con semilla 455.

Este modelo pertenece a la familia GPT-2 (arquitectura transformer decoder) y está diseñado para generación de texto. Su relevancia radica en que permite estudiar cómo un modelo preentrenado en un idioma puede adaptarse a otro mediante SFT (supervised fine-tuning), un tema clave en el aprendizaje multilingüe y la eficiencia de entrenamiento. Sin embargo, al ser un modelo pequeño y de carácter experimental, no está pensado para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, típico de GPT-2) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere inglés y japonés, pero no está confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder con 12 capas, 12 cabezas de atención y una dimensión de embedding de 768, lo que suma 124 millones de parámetros. El proceso de entrenamiento consistió en un ajuste fino supervisado (SFT) utilizando la librería TRL (Transformer Reinforcement Learning) sobre el modelo base `fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed455`, que a su vez fue entrenado en japonés con un léxico artificial y una distribución Zipf. El conjunto de datos de ajuste fue en inglés, como indica el prefijo "eng" en el nombre.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El entrenamiento se realizó con SFT, lo que implica una pérdida de cross-entropy estándar sobre respuestas supervisadas. La única innovación destacable es el diseño experimental: estudiar la transferencia de un idioma a otro tras un preentrenamiento con un vocabulario artificial, lo que puede arrojar luz sobre cómo los modelos aprenden representaciones lingüísticas.

## Capacidades

- Generación de texto en inglés (y posiblemente en japonés, aunque no está confirmado) mediante completado de secuencias.
- Soporte de conversación multi-turno básica, como se muestra en el ejemplo de la model card con un prompt de pregunta y respuesta.
- No se han documentado capacidades de tool calling, function calling, agentes, razonamiento multi-step, visión ni audio.
- Al ser un modelo de 124M parámetros, su capacidad de razonamiento complejo es limitada; se espera un rendimiento modesto en tareas que requieren conocimiento del mundo o lógica avanzada.

## Casos de uso

- Investigación en transferencia de idiomas: permite analizar cómo un modelo preentrenado en japonés se adapta al inglés, comparando métricas de perplejidad y generación antes y después del ajuste.
- Experimentos de adquisición de vocabulario: al usar un léxico artificial con distribución Zipf, es útil para estudiar cómo los modelos aprenden frecuencias de palabras y su impacto en la generación.
- Prototipos de generación de texto corto: puede emplearse para generar respuestas breves en inglés en entornos de baja exigencia, como chatbots de demostración o generación de ideas.
- Evaluación de técnicas de fine-tuning: sirve como banco de pruebas para comparar configuraciones de SFT (tasa de aprendizaje, número de pasos, etc.) en un modelo pequeño y rápido de entrenar.
- Educación y divulgación: su tamaño reducido permite ejecutarlo en hardware modesto, siendo útil para demostraciones didácticas de modelos de lenguaje.
- Análisis de sesgos y robustez: al ser un modelo de investigación, puede utilizarse para estudiar comportamientos inesperados o sesgos inducidos por el cambio de idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 124M parámetros. En FP16, el peso ocupa aproximadamente 250 MB; en FP32, unos 500 MB. Con overhead de activaciones y KV cache, se puede ejecutar con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores. También funciona en CPU, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, es perfectamente viable en tarjetas consumer de gama media.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, Hugging Face TGI y transformers. El ejemplo de la model card usa `pipeline` de transformers.
- Latencia y throughput: sin datos oficiales, pero al ser un modelo pequeño, la generación es rápida; en una GPU moderna (RTX 3090) se pueden obtener decenas de tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos de la misma categoría. El modelo es un experimento de investigación sin benchmarks publicados, por lo que no es posible establecer comparativas objetivas con alternativas como GPT-2 small (124M), DistilGPT2 (82M) u otros modelos de tamaño similar.

## Limitaciones y advertencias

- Modelo experimental: no está diseñado para uso en producción; su rendimiento en tareas del mundo real no ha sido validado.
- Tamaño reducido: con 124M parámetros, su capacidad de razonamiento, conocimiento factual y coherencia a largo plazo es limitada.
- Alucinaciones: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente con prompts ambiguos.
- Sesgos desconocidos: al ser un experimento con un léxico artificial y un cambio de idioma, puede presentar sesgos inesperados o comportamientos anómalos.
- Licencia no especificada: no se indica la licencia, lo que impide su uso comercial sin consultar al autor.
- Contexto limitado: aunque no se especifica, es probable que la ventana de contexto sea de 1024 tokens (típica de GPT-2), lo que restringe tareas que requieren contexto largo.
- Idioma: no hay confirmación oficial de los idiomas soportados; el nombre sugiere inglés y japonés, pero no se garantiza la calidad en ambos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt500_seed455)
- [Modelo base](https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed455)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/yvyivi4t) (enlazado en la model card)
