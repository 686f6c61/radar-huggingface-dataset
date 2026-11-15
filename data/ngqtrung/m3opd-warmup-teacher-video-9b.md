# ngqtrung/M3OPD-Warmup-Teacher-Video-9B

## Resumen

M3OPD-Warmup-Teacher-Video-9B es un ajuste fino del modelo multimodal Qwen3.5-9B desarrollado por el usuario ngqtrung como parte del recetario experimental del artículo M3OPD-Reasoner. Se trata de un "profesor de dominio" (domain teacher) especializado en vídeo, entrenado para servir como referencia en un proceso de destilación on-policy. El modelo parte de los 9.409.813.744 parámetros del Qwen3.5-9B base y conserva su arquitectura, tokenizador, procesador y plantilla de chat, por lo que es desplegable con las mismas herramientas (Transformers, vLLM, SGLang).

El entrenamiento combina un calentamiento supervisado (SFT warm-up) sobre los datos de vídeo del dataset M3OPD-SFT-1.35M y una fase de aprendizaje por refuerzo con GSPO sobre los prompts de vídeo de M3OPD-RL-193K. El checkpoint publicado corresponde al paso 100 de la ejecución GSPO. Según la model card, la receta principal del artículo utiliza profesores sin calentamiento (la familia M3OPD-Teacher-*-9B), por lo que esta variante debe entenderse como una comparación de receta, no como el modelo de referencia principal.

Su relevancia es acotada: se publica con licencia Apache 2.0, sin descargas ni valoraciones en el momento de la consulta, y está orientado a investigadores que reproducen o auditan pipelines de destilación multimodal con refuerzo, más que a uso productivo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de Qwen3.5-9B); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 40960` |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B, un transformer multimodal con pipeline `image-text-to-text`. No se documentan en la información disponible innovaciones arquitectónicas propias: el interés está en el procedimiento de entrenamiento. La receta consta de dos etapas. Primero, un calentamiento SFT sobre los datos de vídeo del dataset M3OPD-SFT-1.35M (1,35 millones de ejemplos según el nombre del dataset). Después, aprendizaje por refuerzo con GSPO (Group Sequence Policy Optimization) sobre los prompts de vídeo de M3OPD-RL-193K (193.000 ejemplos según el nombre), restringido a la carpeta `video`. El checkpoint publicado es el paso 100 de esa ejecución GSPO.

El entrenamiento y la evaluación se realizaron con la plantilla de chat nativa de Qwen3.5, modo thinking activado, sin system prompt y con una línea de formato de respuesta tras la pregunta (por ejemplo, `Put your final answer within \boxed{}.`). Este detalle es relevante para reproducir resultados: desviarse de esa plantilla puede degradar el comportamiento esperado.

## Capacidades

- Generación de texto y razonamiento multimodal con entrada de imagen y vídeo (pipeline `image-text-to-text`).
- Modo thinking habilitado por defecto en el entrenamiento, orientado a razonamiento de varios pasos.
- Procesamiento de vídeo como dominio de especialización del profesor.
- Respuestas con formato de respuesta final delimitado (`\boxed{}`), útil para evaluación automática.
- Herencia completa del tokenizador, procesador y plantilla de chat de Qwen3.5-9B.
- Soporte de tool calling, agentes o audio: no disponible en la información proporcionada.

## Casos de uso

- Destilación on-policy: el modelo actúa como profesor que genera trayectorias de referencia sobre prompts de vídeo, que después se usan para entrenar un alumno de menor tamaño. Es su propósito declarado.
- Investigación en aprendizaje por refuerzo multimodal: sirve para comparar la receta con calentamiento SFT frente a los profesores sin calentamiento de la familia M3OPD-Teacher-*-9B.
- Evaluación de razonamiento sobre vídeo: permite medir la calidad de las cadenas de razonamiento con formato `\boxed{}` en tareas de vídeo.
- Reproducción de experimentos: al conservar la plantilla nativa de Qwen3.5, se puede integrar en pipelines existentes de Transformers, vLLM o SGLang sin adaptaciones.
- Generación de datos sintéticos anotados: las respuestas del profesor pueden filtrarse y convertirse en datos SFT para dominios específicos de vídeo.
- Análisis comparativo de checkpoints intermedios: al ser el paso 100 de una ejecución GSPO, permite estudiar la evolución del comportamiento durante el entrenamiento por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 19 GB solo para pesos, más memoria para caché KV y procesador multimodal; en la práctica, se recomienda al menos 24-32 GB.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S. Para contextos largos (hasta 40.960 tokens según el ejemplo), conviene A100 80 GB o H100.
- GPU de consumo: una RTX 4090 (24 GB) puede quedar justa en BF16 con contexto largo; con cuantización de 8 bits o 4 bits sería viable, aunque no se publican pesos GGUF ni cuantizados.
- Despliegue: vLLM (`vllm serve ngqtrung/M3OPD-Warmup-Teacher-Video-9B --max-model-len 40960`), SGLang y Transformers. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M3OPD-Warmup-Teacher-Video-9B | 9,41 B | no disponible (ejemplo a 40.960) | Profesor de vídeo con SFT + GSPO | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-9B (base) | 9 B (aprox.) | no disponible | Modelo multimodal generalista | Apache 2.0 | Hugging Face |
| M3OPD-Teacher-*-9B (familia del artículo) | 9 B (aprox.) | no disponible | Profesores de dominio sin calentamiento | no disponible | Colección M3OPD-Reasoner |

La comparación con otras alternativas de la misma categoría (profesores multimodales para destilación) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 100 de GSPO), no un modelo final pulido; su calidad puede ser inferior a la de los profesores de la receta principal.
- Sin descargas ni valoraciones en Hugging Face en el momento de la consulta: no hay evidencia comunitaria de uso ni validación externa.
- No se documentan sesgos, idiomas soportados ni evaluación de alucinación; se desconoce su comportamiento fuera del dominio de vídeo.
- Requiere ceñirse a la plantilla de chat nativa de Qwen3.5, modo thinking y formato `\boxed{}` para reproducir el comportamiento entrenado.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-9B conviene revisar también las condiciones del modelo base.
- No se publican pesos cuantizados, lo que limita el despliegue en hardware de consumo.
- Uso previsto principalmente investigador; no se recomienda como modelo de producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-Warmup-Teacher-Video-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset SFT: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset RL: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Colección M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
