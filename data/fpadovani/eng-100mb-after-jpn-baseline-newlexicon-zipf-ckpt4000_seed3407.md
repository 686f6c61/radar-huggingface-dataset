# fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt4000_seed3407

## Resumen

El modelo `fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt4000_seed3407` es un modelo de generación de texto basado en la arquitectura GPT-2, con 124,7 millones de parámetros, desarrollado por fpadovani (afiliado a la Universidad de Groningen según el enlace de Weights & Biases). Se trata de un fine-tune mediante aprendizaje supervisado (SFT) del modelo base `fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed3407`, que a su vez fue pre-entrenado sobre un corpus de 100 MB en japonés. El nombre del modelo indica que fue entrenado posteriormente en inglés, formando parte de una línea de experimentos sobre transferencia entre idiomas y efectos de la distribución de frecuencias léxicas (ley de Zipf) en modelos de lenguaje pequeños.

Este modelo tiene un interés principalmente investigador: permite estudiar cómo un modelo pre-entrenado en un idioma (japonés) se adapta a otro (inglés) mediante fine-tuning, y cómo influyen factores como el vocabulario o la frecuencia de palabras. No está pensado para uso productivo, sino como herramienta experimental dentro de un proyecto más amplio sobre adquisición de lenguaje artificial. Su relevancia actual radica en que aporta datos empíricos sobre transferencia lingüística en modelos pequeños, un área activa en la investigación de eficiencia y multilingüismo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder transformer) |
| Parámetros totales | 124.770.816 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (probablemente 1024, típico de GPT-2, pero no confirmado) |
| Tipos de cuantización | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponible (el nombre sugiere inglés y japonés, pero no está documentado) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder con atención causal, diseñado para generación de texto autoregresiva. Con 124,7 millones de parámetros, se sitúa en la gama de los modelos pequeños (similar a GPT-2 small). El entrenamiento se realizó en dos fases: primero, un pre-entrenamiento sobre un corpus de 100 MB en japonés (el modelo base `ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed3407`), y después un fine-tuning con SFT (supervised fine-tuning) sobre datos en inglés, como indica el nombre "eng-100mb-after-jpn". El proceso se llevó a cabo con la librería TRL (Transformers Reinforcement Learning) en su versión 0.23.0, junto con Transformers 4.56.2 y PyTorch 2.11.0.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni las técnicas de regularización empleadas. El nombre "newlexicon" sugiere que se probó un vocabulario nuevo o modificado respecto al modelo base, y "zipf" hace referencia a la distribución de frecuencias de palabras, lo que indica que el experimento controla la frecuencia léxica. No hay evidencia de uso de RLHF ni DPO; el entrenamiento se limitó a SFT.

## Capacidades

- Generación de texto autoregresiva: el modelo puede producir texto en inglés (y posiblemente en japonés, aunque no está confirmado) a partir de un prompt, como se muestra en el ejemplo de la model card.
- Fine-tuning adicional: al ser un modelo pequeño y abierto, puede servir como punto de partida para fine-tuning en tareas específicas de generación de texto.
- Compatibilidad con pipelines de Hugging Face: se puede cargar con `pipeline("text-generation", ...)` y es compatible con `text-generation-inference` y endpoints, según los tags del repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio. Es un modelo puramente textual y de tamaño reducido.

## Casos de uso

- Investigación en transferencia entre idiomas: el modelo permite estudiar cómo un pre-entrenamiento en japonés afecta al fine-tuning en inglés, comparando con modelos entrenados solo en inglés o en el orden inverso. Es útil para experimentos controlados sobre la influencia del idioma fuente.
- Análisis del efecto de la distribución de frecuencias (Zipf): al incluir "zipf" en el nombre, el modelo forma parte de experimentos que manipulan la frecuencia de palabras en el vocabulario. Se puede usar para medir cómo afecta la rareza o frecuencia de términos al aprendizaje y a la generación.
- Evaluación de metodologías de fine-tuning con SFT: dado que se entrenó con TRL, sirve como caso de estudio para comparar configuraciones de SFT (tasa de aprendizaje, número de pasos, etc.) en modelos pequeños.
- Generación de texto en entornos académicos: para demostraciones en clases de NLP o para generar datos sintéticos en experimentos donde se necesite un modelo ligero y rápido.
- Base para fine-tuning en tareas específicas: por su tamaño reducido, puede adaptarse a dominios concretos (por ejemplo, generación de descripciones cortas) con pocos recursos computacionales.
- Comparación de arquitecturas y tamaños: junto con otros modelos de la misma familia (los listados en la búsqueda web), permite estudiar la variabilidad debida a semillas aleatorias y puntos de control (checkpoints) en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo parece estar orientado a investigación experimental, no a competir en tareas de referencia.

## Requisitos de hardware

- VRAM estimada: al tener 124,7 millones de parámetros, en FP32 ocupa aproximadamente 500 MB, y en FP16 unos 250 MB. Con la longitud de contexto típica de GPT-2 (1024 tokens), cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna, como una NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060 o superior. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: se puede usar con la librería `transformers` directamente, o mediante servidores de inferencia como vLLM, Text Generation Inference (TGI) u Ollama (si se convierte a GGUF). Los tags del repositorio indican compatibilidad con `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de este tamaño, en una GPU moderna se espera una latencia de decenas de milisegundos por token, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos. El autor ha publicado varios modelos similares (por ejemplo, `eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed455`, `jpn-100mb-after-eng-baseline-newlexicon-ckpt500_seed10`, etc.) que comparten la misma arquitectura y tamaño, pero no se han documentado diferencias de rendimiento. Como referencia genérica, se puede comparar con GPT-2 small (124M parámetros) o DistilGPT-2 (82M), pero no hay datos de benchmarks que permitan una comparación cuantitativa. Por tanto, la comparativa se limita a señalar que existen variantes del mismo experimento con diferentes semillas y puntos de control.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "licence: license" sin detallar los términos. No se recomienda su uso comercial sin aclarar la licencia con el autor.
- Sin datos de sesgos: al ser un modelo de investigación entrenado sobre corpus pequeños (100 MB), puede reflejar sesgos presentes en los datos de entrenamiento, pero no se han documentado.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto incoherente o falso, especialmente con prompts fuera de su dominio de entrenamiento.
- Contexto limitado: aunque no se confirma, la arquitectura GPT-2 suele tener una ventana de 1024 tokens, lo que limita la coherencia en textos largos.
- Idiomas no confirmados: a pesar del nombre, no hay documentación oficial sobre qué idiomas soporta realmente. El fine-tuning en inglés sugiere que funciona mejor en inglés, pero el pre-entrenamiento en japonés podría dar resultados pobres en ese idioma.
- No apto para producción: es un modelo experimental, sin garantías de estabilidad, seguridad ni rendimiento. No debe usarse en aplicaciones críticas.
- Tamaño del repositorio (4.2 GB) desproporcionado para 125M de parámetros: puede deberse a múltiples archivos de checkpoint o a pesos en varias precisiones, pero no se ha documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-newlexicon-zipf-ckpt4000_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-jpn-baseline-100mb_seed3407
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/dfgvmton
- Modelos relacionados del mismo autor (de la búsqueda web):
  - https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed455
  - https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-ckpt500_seed10
  - https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-ckpt500_seed455
  - https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-ckpt4000_seed3407
  - https://friendli.ai/models/fpadovani/eng-100mb-after-jpn-baseline-newlexicon-ckpt500_seed10
