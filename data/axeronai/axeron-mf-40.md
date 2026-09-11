# AxeronAI/axeron-mf-40

## Resumen

Axeron-mf-40 es un ajuste fino (finetune) del modelo Qwen2.5-3B-Instruct, publicado por el usuario AxeronAI en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una adaptación mediante LoRA sobre los pesos del modelo base de Alibaba Cloud, generada con la herramienta Axeron ModelForge, una librería de entrenamiento propia cuyo identificador (`axeron-modelforge`) aparece tanto en los tags como en el campo `library_name` del repositorio.

El modelo cuenta con 3.085.938.688 parámetros totales, lo que lo sitúa en la categoría de modelos pequeños (rango 3B), aptos para inferencia en GPU de consumo. El repositorio ocupa 6,2 GB en formato safetensors, coherente con pesos en precisión de 16 bits. La model card es extremadamente escueta: únicamente indica el método (`finetune_lora`), el modelo base, 10 pasos de entrenamiento y una pérdida final de 1.8994.

La relevancia de esta ficha es limitada desde el punto de vista técnico, ya que se trata de un experimento con un volumen de entrenamiento mínimo (10 pasos) y sin documentación asociada sobre datos, licencia o evaluación. Resulta útil principalmente como ejemplo de integración con el ecosistema Axeron ModelForge y como punto de partida para quien quiera reproducir el flujo de trabajo, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención por consultas agrupadas (GQA), heredada del modelo base Qwen2.5-3B-Instruct; el ajuste se realiza mediante LoRA, por lo que no se modifica la topología de la red |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la informacion proporcionada; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens nativos, extensibles a 128.000 mediante YaRN segun su model card publica |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos safetensors); al derivar de Qwen2.5-3B-Instruct es tecnicamente compatible con cuantizaciones GGUF/AWQ/GPTQ, pero no hay artefactos de este tipo publicados por el autor |
| Idiomas soportados | no disponibles |
| Licencia | no disponible en la model card del finetune; el modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License, con restricciones de uso comercial, por lo que la licencia del derivado queda en un limbo legal |
| Formato de pesos | safetensors (6,2 GB de repositorio) |
| Libreria de carga | axeron-modelforge (libreria propia, no estandar en el ecosistema transformers) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Metodo de entrenamiento | finetune_lora |
| Pasos de entrenamiento | 10 |
| Perdida final | 1.8994 |
| Fecha de creacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer decoder-only de Qwen2.5-3B-Instruct: 36 capas, atención con 16 cabezas de consulta y 2 cabezas de clave/valor (GQA), vocabulario de 151.936 tokens y normalización RMSNorm con funciones de activación SwiGLU. Sobre esta base, AxeronAI aplica un ajuste LoRA, técnica que congela los pesos originales e inserta matrices de bajo rango en determinadas proyecciones, reduciendo drásticamente el coste de entrenamiento y el tamaño de los artefactos a publicar. No hay información en la model card sobre el rango de LoRA, el valor de alpha, las capas objetivo ni si los adaptadores se han fusionado con los pesos base (el tamaño del repositorio, 6,2 GB, sugiere pesos fusionados en FP16 más que adaptadores sueltos).

El dato más relevante del entrenamiento son los 10 pasos ejecutados, con una pérdida final de 1.8994. Se desconoce el tamaño del dataset, su composición, la longitud de secuencia, la tasa de aprendizaje y si se aplicó algún tipo de alineación posterior (RLHF, DPO). Con ese número de pasos, el efecto sobre el comportamiento del modelo base es previsiblemente marginal, salvo que se haya usado un lote muy grande o una tasa de aprendizaje desproporcionadamente alta, escenario en el que el riesgo de sobreajuste a un puñado de ejemplos sería alto. No se documenta ninguna innovación técnica adicional: no hay decodificación especulativa, atención lineal, mezcla de expertos ni mecanismos híbridos.

## Capacidades

Cualquier afirmación sobre las capacidades de este modelo debe entenderse como heredada del modelo base, ya que no se ha publicado ninguna evaluación específica del finetune.

- Generación de texto conversacional en múltiples idiomas, con especial solidez en inglés y chino, dado el origen del modelo base.
- Razonamiento de propósito general y tareas de conocimiento enciclopédico propias de un modelo de 3B parámetros.
- Generación y explicación de código, con soporte razonable de lenguajes comunes (Python, JavaScript, Java, C++).
- Resolución de problemas matemáticos de nivel básico y medio.
- Soporte de tool calling y function calling, capacidad nativa en la familia Qwen2.5-Instruct.
- Soporte de roleplay y formato de chat estructurado mediante plantilla de conversación de Qwen.
- Capacidad de seguir instrucciones con formato JSON y salidas estructuradas.
- No hay evidencia de capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.
- El efecto real del ajuste LoRA sobre estas capacidades es indeterminado y no verificable con los datos publicados.

## Casos de uso

- Laboratorio de experimentación con Axeron ModelForge: el modelo sirve como artefacto de referencia para validar el pipeline de entrenamiento LoRA de esta librería, comprobando que la carga de pesos y la inferencia funcionan de extremo a extremo.
- Prototipado rápido de asistentes conversacionales en local: con 3B parámetros cabe en una GPU de consumo y permite iterar sobre prompts y plantillas de chat sin coste de API.
- Generación de código asistida en entornos con restricciones de conectividad: al poder ejecutarse en local, es apto para autocompletado y explicación de fragmentos en máquinas sin acceso a servicios en la nube.
- Clasificación y extracción de información estructurada: el soporte de salidas JSON del modelo base permite usarlo como extractor de entidades o etiquetador en pipelines de datos.
- Base para ajustes posteriores específicos de dominio: al ser un modelo pequeño y con licencia de investigación en su origen, es un punto de partida económico para experimentos académicos de fine-tuning.
- Evaluación comparativa de técnicas de ajuste: útil para medir cuánto cambia el comportamiento de Qwen2.5-3B-Instruct tras 10 pasos de LoRA, como caso de estudio de infraentrenamiento.
- Chatbot educativo de bajo coste en hardware modesto: tareas de tutoría simple sobre textos cortos, asumiendo la ventana de contexto del modelo base.
- No se recomienda su uso en producción sin una evaluación previa, dado que no hay benchmarks, ni licencia clara, ni documentación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida final de entrenamiento (1.8994) tras 10 pasos, que no es una métrica de calidad comparable con MMLU, HumanEval, GSM8K ni ninguna otra evaluación estandarizada. Tampoco se ofrecen comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- Pesos en FP16/BF16: aproximadamente 6,2 GB de VRAM solo para los pesos, coherente con el tamaño del repositorio.
- Inferencia en FP16 con contexto corto: entorno de 8 GB de VRAM es suficiente; con contexto largo (32.000 tokens) la caché KV añade varios gigabytes, por lo que conviene disponer de 12-16 GB.
- Cuantización INT8: alrededor de 3,3 GB de pesos, viable en GPU de 6-8 GB.
- Cuantización INT4 (por ejemplo Q4_K_M): alrededor de 1,9-2,2 GB, apta para GPU de 4-6 GB o incluso CPU con llama.cpp, aunque estos artefactos no están publicados en el repositorio.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para máximo throughput; A100 o H100 solo tendrían sentido en despliegues con muchas réplicas concurrentes.
- Cabe en GPU de consumo: sí, en cualquier modelo con 8 GB o más de VRAM en FP16, y en tarjetas de 4 GB si se cuantiza.
- Opciones de despliegue: al usar la librería `axeron-modelforge` como `library_name`, la carga directa con transformers no está garantizada; es necesario instalar esa librería o convertir los pesos. Una vez convertidos, son viables vLLM, TGI, llama.cpp, Ollama y SGLang, siempre que se genere previamente el artefacto GGUF o AWQ correspondiente.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AxeronAI/axeron-mf-40 | 3,09 B | no disponible (base: 32.768 tokens) | no disponible | safetensors, libreria propia axeron-modelforge |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens, extensible a 128.000 con YaRN | Qwen Research License (uso comercial restringido) | safetensors, transformers, amplio ecosistema GGUF |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, transformers, GGUF |
| microsoft/Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens | MIT | safetensors, transformers, GGUF |
| google/gemma-2-2b-it | 2,61 B | 8.192 tokens | Gemma Terms of Use | safetensors, transformers, GGUF |

Los datos de los modelos comparados proceden de sus respectivas model cards públicas y se incluyen como referencia de categoría; no hay evaluación comparativa directa con axeron-mf-40 porque este no publica métricas. En la práctica, el modelo de AxeronAI parte de las mismas capacidades que Qwen2.5-3B-Instruct, con la desventaja de una licencia no declarada, ausencia de artefactos cuantizados y dependencia de una librería no estándar.

## Limitaciones y advertencias

- Entrenamiento insuficiente: 10 pasos de LoRA son un volumen testimonial; cualquier mejora funcional respecto al modelo base es dudosa y el resultado puede ser indistinguible de Qwen2.5-3B-Instruct o estar ligeramente degradado por sobreajuste.
- Ausencia total de evaluación: no hay benchmarks, ni evaluaciones humanas, ni pruebas de regresión frente al modelo base.
- Licencia no declarada: la model card no especifica licencia. El modelo base se distribuye bajo Qwen Research License, que restringe el uso comercial, lo que convierte el uso productivo de este derivado en un riesgo legal no resuelto.
- Idiomas soportados no declarados: no se puede confirmar el comportamiento multilingüe real del ajuste ni si ha degradado alguno de los idiomas del modelo base.
- Riesgo de alucinación: inherente a los modelos de 3B parámetros, especialmente en tareas de conocimiento factual y matemáticas complejas; el ajuste no incorpora mecanismos de mitigación documentados.
- Dependencia de herramienta propietaria: el campo `library_name: axeron-modelforge` implica que la carga estándar con transformers puede fallar sin la librería del autor, lo que complica la reproducibilidad y el despliegue.
- Formatos limitados: solo safetensors; no hay GGUF, AWQ, GPTQ ni adaptadores LoRA separados, lo que obliga a convertir los pesos para usarlos con las herramientas habituales de inferencia.
- Sin datos de entrenamiento: se desconoce la composición del dataset, por lo que no se pueden evaluar sesgos introducidos ni riesgos de memorización de datos personales.
- Metadatos atípicos: la fecha de creación indicada (2026-09-10) es posterior a la fecha actual de referencia en muchos entornos, lo que sugiere un error de reloj o de configuración en el pipeline de publicación y debería tratarse con cautela.
- Cero adopción: 0 descargas y 0 likes, sin issues ni discusiones asociadas, por lo que no existe validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AxeronAI/axeron-mf-40
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Paper técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Documentación de LoRA (paper original): https://arxiv.org/abs/2106.09685
- Nota: la búsqueda web realizada no ha devuelto ningún resultado relevante sobre el modelo AxeronAI/axeron-mf-40 ni sobre la librería Axeron ModelForge; los resultados obtenidos no guardan relación con el objeto de esta ficha y se han descartado.
