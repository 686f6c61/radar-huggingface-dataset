# ngqtrung/M3OPD-Warmup-Teacher-ImageSTEM-9B

## Resumen

M3OPD-Warmup-Teacher-ImageSTEM-9B es un modelo multimodal de tipo image-text-to-text desarrollado por el usuario ngqtrung, derivado por fine-tuning de Qwen3.5-9B. Se trata de un "domain teacher" (profesor de dominio) dentro de la receta M3OPD-Reasoner, un pipeline de destilación on-policy y aprendizaje por refuerzo orientado a razonamiento multimodal. Su función concreta es servir como modelo experto en tareas de STEM a partir de imágenes (problemas de matematicas, fisica o quimica planteados visualmente), y su salida se utiliza para destilar ese conocimiento en modelos estudiantes.

La particularidad de esta variante frente a los profesores principales de la receta es que incorpora un calentamiento supervisado (SFT warm-up) antes del entrenamiento con refuerzo. El modelo parte de Qwen3.5-9B, recibe SFT sobre los datos de imagen-STEM del dataset M3OPD-SFT-1.35M y después se optimiza con GSPO sobre los prompts de imagen-STEM de M3OPD-RL-193K. El checkpoint publicado corresponde al paso 160 del run de GSPO.

Con 9.409.813.744 parámetros totales y pesos en safetensors (repo de 18,8 GB), hereda la arquitectura, tokenizer, processor y plantilla de chat de Qwen3.5-9B, por lo que es desplegable en Transformers, vLLM y SGLang. Su relevancia es fundamentalmente metodológica: documenta una receta de destilación con refuerzo para razonamiento multimodal y permite reproducir o comparar la variante con warm-up frente a los profesores sin calentamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-9B); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 40960` |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza íntegramente la arquitectura, el tokenizer, el processor y la plantilla de chat de Qwen3.5-9B, con lo que mantiene la pila multimodal de entrada imagen-texto del modelo base. No se publican en la model card detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni el codificador visual, por lo que esos datos deben consultarse en la documentación de Qwen3.5-9B.

El entrenamiento sigue una receta en dos fases. Primero, un SFT warm-up sobre los datos de imagen-STEM del dataset M3OPD-SFT-1.35M. Después, un ajuste con GSPO (Group Sequence Policy Optimization, una variante de optimización de política para RL) sobre los prompts de la carpeta `image_stem` del dataset M3OPD-RL-193K. El checkpoint liberado es el paso 160 del run de GSPO. La receta principal del paper M3OPD-Reasoner emplea profesores sin warm-up (serie M3OPD-Teacher-*-9B); esta variante existe como comparación de la receta con calentamiento. El entrenamiento y la evaluación se realizan con la plantilla de chat nativa de Qwen3.5, modo thinking activado, sin system prompt y con una línea de formato de respuesta tras la pregunta (por ejemplo, `Put your final answer within \boxed{}.`).

## Capacidades

- Razonamiento multimodal sobre imágenes: resolución de problemas STEM formulados visualmente (diagramas, figuras, ecuaciones en imagen).
- Generación de texto y razonamiento paso a paso con modo thinking activado por defecto en la receta de entrenamiento.
- Respuesta con formato estructurado, incluyendo la convención de respuesta final en `\boxed{}`.
- Capacidades heredadas de Qwen3.5-9B en generación de texto y conversación multi-turno (soporte conversacional declarado en los tags).
- Compatibilidad con endpoints y despliegue en Transformers, vLLM y SGLang.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning autónomo: no disponibles como característica declarada; el modelo está orientado a resolución de problemas con razonamiento interno.
- Idiomas: no disponibles.

## Casos de uso

- Destilación de conocimiento en modelos estudiantes: el modelo actúa como profesor de dominio que genera trayectorias de razonamiento de alta calidad sobre problemas STEM visuales, que después se usan para entrenar modelos más pequeños mediante destilación on-policy.
- Generación de datos sintéticos para razonamiento multimodal: producción de pares pregunta-respuesta con cadenas de razonamiento detalladas a partir de imágenes STEM, útiles para ampliar datasets de entrenamiento supervisado.
- Evaluación de recetas de RL: servir como referencia con warm-up frente a los profesores sin calentamiento de la serie M3OPD-Teacher-*-9B para medir el efecto del SFT previo en el rendimiento final.
- Tutoría automática en asignaturas científicas: resolución guiada de ejercicios de matemáticas y ciencias presentados como capturas o fotografías, con explicación del procedimiento y respuesta final delimitada.
- Investigación en aprendizaje por refuerzo para modelos multimodales: reproducción del pipeline GSPO sobre prompts de imagen-STEM usando los datasets y checkpoints publicados de la colección M3OPD-Reasoner.
- Procesamiento de documentación técnica con figuras: extracción de razonamiento sobre gráficos, tablas y diagramas en contextos de ingeniería o ciencia, aprovechando la ventana de contexto configurable en despliegue (hasta 40.960 tokens en el ejemplo de vLLM).
- Benchmarking interno de modelos multimodales de ~9B: comparación de precisión en tareas STEM visuales frente a Qwen3.5-9B base y otras variantes de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 19 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica se recomienda un mínimo de 24 GB y, para contextos largos (hasta 40.960 tokens), 40-80 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para despliegue en BF16 con contexto largo; A6000 48 GB como alternativa.
- GPU de consumo: cabe en RTX 4090 (24 GB) en cuantización de 8 bits o inferior, con contexto reducido; en RTX 3090 (24 GB) en las mismas condiciones. En 16 bits no cabe con margen para contexto amplio en GPUs de 24 GB.
- Opciones de despliegue: vLLM (`vllm serve ngqtrung/M3OPD-Warmup-Teacher-ImageSTEM-9B --max-model-len 40960`), SGLang y Transformers, según indica la model card. El soporte de llama.cpp u Ollama no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| M3OPD-Warmup-Teacher-ImageSTEM-9B | 9,41 B | no disponible (ejemplo con 40.960) | imagen-texto | Apache 2.0 | Profesor de dominio con SFT warm-up + GSPO |
| Qwen3.5-9B (base) | ~9 B | no disponible en esta ficha | imagen-texto | Apache 2.0 | Modelo base; sin el ajuste STEM ni el RL |
| M3OPD-Teacher-*-9B (receta principal) | ~9 B | no disponible | imagen-texto | Apache 2.0 (presumible, no confirmado) | Profesores de dominio sin warm-up; referencia de comparación del autor |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint intermedio (paso 160 de GSPO) de una receta experimental, no un modelo afinado para producto.
- Especialización estrecha: el ajuste se limita a datos de imagen-STEM; su rendimiento fuera de ese dominio puede degradarse respecto al Qwen3.5-9B base.
- Formato de respuesta condicionado: la receta asume modo thinking activado, sin system prompt y una línea de formato tras la pregunta; usos fuera de esa plantilla pueden producir respuestas menos fiables.
- Idiomas soportados no documentados: no hay garantía explícita de calidad multilingüe más allá de la del modelo base.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad ni tasas de error; en problemas STEM visuales, errores de lectura de la imagen pueden propagarse al razonamiento.
- Sesgos: no se publica información sobre sesgos del ajuste; los sesgos heredados de Qwen3.5-9B no están documentados en esta ficha.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-9B conviene verificar los términos del modelo base y de los datasets empleados.
- Sin métricas publicadas: no hay benchmarks que permitan estimar su calidad frente a alternativas, lo que desaconseja su adopción en producción sin evaluación propia.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-Warmup-Teacher-ImageSTEM-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset M3OPD-SFT-1.35M: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset M3OPD-RL-193K: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Colección M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
