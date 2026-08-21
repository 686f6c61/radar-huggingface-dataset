# fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed455

## Resumen

El modelo `fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed455` es un fine-tuning experimental desarrollado por fpadovani, orientado a investigar la transferencia de idiomas en modelos de lenguaje pequeños. Se trata de un modelo de 124,7 millones de parámetros, basado en la arquitectura GPT-2 (según el tag de HuggingFace), que parte de un modelo base entrenado en inglés (`ppt-art-lang-eng-baseline-100mb_seed455`) y se ajusta posteriormente con datos en japonés mediante fine-tuning supervisado (SFT) usando la librería TRL.

El nombre del modelo indica que es un checkpoint intermedio (ckpt500) de un experimento que entrena primero en inglés y luego continúa el entrenamiento en japonés, con una semilla fija (455). Este tipo de modelos se utiliza en estudios sobre aprendizaje secuencial de idiomas, evaluación de la plasticidad de redes neuronales y análisis de la interferencia entre lenguas. Su relevancia radica en que permite estudiar cómo un modelo pequeño puede adaptarse a un nuevo idioma después de haber sido entrenado en otro, un tema clave en el desarrollo de sistemas multilingües eficientes.

Al ser un modelo de investigación, no está pensado para uso en producción, sino como herramienta para experimentos académicos y análisis comparativos. No se han publicado métricas de rendimiento ni benchmarks en la información disponible, y su licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (según tag de HuggingFace) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 estándar: 1024 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere inglés y japonés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder-only con atención causal. Con 124,7 millones de parámetros, corresponde al tamaño "small" de GPT-2 (124M). No se dispone de detalles sobre la configuración exacta de capas, cabezas de atención o dimensiones ocultas, pero es probable que siga la configuración estándar de GPT-2 small (12 capas, 12 cabezas, 768 dimensiones).

El entrenamiento se realizó en dos fases: primero, un modelo base (`ppt-art-lang-eng-baseline-100mb_seed455`) fue entrenado con 100MB de datos en inglés. Posteriormente, este modelo base se sometió a fine-tuning supervisado (SFT) con datos en japonés, utilizando la librería TRL (Transformer Reinforcement Learning) de HuggingFace. El checkpoint 500 indica que se guardó el modelo tras 500 pasos de entrenamiento. No se especifican el tamaño del dataset japonés, el número de épocas, la tasa de aprendizaje ni otros hiperparámetros. El entrenamiento se registró en Weights & Biases, pero el enlace no proporciona detalles públicos adicionales.

No se mencionan técnicas avanzadas como RLHF, DPO, decodificación especulativa ni atención lineal. El modelo es un experimento de investigación sobre transferencia de idiomas, no una implementación con innovaciones arquitectónicas.

## Capacidades

- Generación de texto: el modelo puede generar texto en respuesta a instrucciones, como se muestra en el ejemplo de la model card con una pregunta sobre viajes en el tiempo.
- Multilingüismo potencial: al haber sido entrenado en inglés y luego en japonés, podría generar texto en ambos idiomas, aunque no hay evidencia empírica publicada.
- Fine-tuning específico: al ser un checkpoint de un experimento controlado, su capacidad se limita a lo aprendido en los 500 pasos de entrenamiento en japonés.
- Sin soporte para tool calling, agentes, razonamiento multi-paso, visión ni audio: no se mencionan estas capacidades y la arquitectura GPT-2 no las incluye de forma nativa.

## Casos de uso

- Investigación en transferencia de idiomas: el modelo permite estudiar cómo un modelo preentrenado en inglés se adapta a un nuevo idioma (japonés) tras un fine-tuning corto. Es útil para analizar la plasticidad del modelo y la interferencia entre lenguas.
- Evaluación de checkpoints intermedios: al ser un checkpoint en el paso 500, se puede comparar con otros checkpoints (por ejemplo, el paso 1000 o el modelo final) para trazar la evolución del aprendizaje.
- Análisis de sesgos lingüísticos: al entrenar primero en inglés y luego en japonés, se puede investigar si el modelo conserva sesgos del primer idioma o los mitiga.
- Experimentos de few-shot learning: aunque no está diseñado para ello, se puede probar su capacidad de generar texto en japonés con pocos ejemplos en el prompt.
- Comparación de semillas: existen variantes con diferentes semillas (por ejemplo, seed3407), lo que permite estudiar la variabilidad del entrenamiento.
- Docencia y demostraciones: sirve como ejemplo práctico de fine-tuning con TRL y de cómo se estructura un experimento de transferencia de idiomas en un entorno académico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El modelo es un experimento de investigación sin evaluaciones públicas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124,7 millones de parámetros en precisión FP32, el modelo ocupa aproximadamente 500 MB de memoria. En FP16, unos 250 MB. Con cuantización a 8 bits, menos de 150 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. Incluso CPU es viable para inferencia lenta.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: al ser un modelo de la familia GPT-2, se puede servir con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) o directamente con la pipeline de transformers.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (por ejemplo, RTX 3090), la generación de 128 tokens debería completarse en menos de un segundo, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed455 | 124,7M | no disponible | no disponible | Investigación |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Generación de texto general |
| DistilGPT-2 (HuggingFace) | 82M | 1024 | MIT | Generación de texto ligera |

El modelo se compara directamente con GPT-2 small, del que probablemente deriva. La diferencia principal es el fine-tuning en japonés, que lo hace específico para experimentos de transferencia de idiomas. DistilGPT-2 es una versión destilada más pequeña, pero no tiene el componente multilingüe. No hay datos de rendimiento para comparar.

## Limitaciones y advertencias

- Modelo de investigación: no está optimizado para producción. No se han realizado evaluaciones de seguridad, sesgos o robustez.
- Sin licencia especificada: el README indica "licence: license" pero no detalla los términos. No se recomienda su uso comercial sin aclarar la licencia.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no se puede garantizar su calidad en tareas concretas.
- Contexto limitado: si sigue la configuración de GPT-2, la ventana de contexto es de 1024 tokens, insuficiente para tareas que requieran contexto largo.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido falso o incoherente, especialmente en japonés si el entrenamiento fue insuficiente.
- Sesgos potenciales: al haber sido entrenado con datos en inglés y japonés, puede heredar sesgos de ambos corpus, pero no se ha analizado.
- Sin soporte para tareas especializadas: no dispone de tool calling, agentes ni capacidades multimodales.

## Enlaces

- [HuggingFace - fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed455](https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed455)
- [Modelo base: fpadovani/ppt-art-lang-eng-baseline-100mb_seed455](https://huggingface.co/fpadovani/ppt-art-lang-eng-baseline-100mb_seed455)
- [Variante con semilla 3407: fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed3407](https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed3407)
- [Modelo inverso: fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed455](https://huggingface.co/fpadovani/eng-100mb-after-jpn-baseline-ckpt500_seed455)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/z8ewcq1g)
- [Página del modelo en FriendliAI](https://friendli.ai/models/fpadovani/jpn-100mb-after-eng-baseline-ckpt500_seed3407)
