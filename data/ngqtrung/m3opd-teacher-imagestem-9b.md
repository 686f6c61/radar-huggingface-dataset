# ngqtrung/M3OPD-Teacher-ImageSTEM-9B

## Resumen

M3OPD-Teacher-ImageSTEM-9B es un ajuste fino del modelo multimodal Qwen3.5-9B publicado por el usuario ngqtrung en Hugging Face. No se trata de un modelo de propósito general, sino de un "teacher" de dominio dentro de la receta M3OPD-Reasoner: un modelo profesor especializado en razonamiento sobre imágenes de temática STEM (ciencia, tecnología, ingeniería y matemáticas) que posteriormente se destila en un modelo alumno mediante Multi-Teacher On-Policy Distillation (MOPD). El modelo parte de los pesos de Qwen3.5-9B, conserva su tokenizador, procesador y plantilla de chat, y añade una fase de SFT seguida de aprendizaje por refuerzo con GSPO sobre los prompts del subconjunto `image_stem` del dataset M3OPD-RL-193K.

Con 9.409.813.744 parámetros reales (según los safetensors del repositorio) y un tamaño de repo de 18,8 GB, es un modelo de escala media-alta que hereda la arquitectura y las capacidades del Qwen3.5-9B original. El checkpoint publicado corresponde al paso 160 del entrenamiento con GSPO, descrito por el autor como el mejor checkpoint evaluado de esa ejecución. Su relevancia actual radica en que documenta una pieza concreta de un pipeline de destilación multi-profesor: en lugar de entrenar un único modelo generalista, se entrena un profesor de dominio que luego transfiere conocimiento a un alumno, una estrategia que reduce el coste de entrenamiento del modelo final.

La licencia es Apache 2.0, la misma que Qwen3.5-9B, lo que facilita su uso comercial y su integración en pipelines existentes. El modelo se distribuye en formato safetensors y es compatible con los principales motores de inferencia que soportan Qwen3.5 (Transformers, vLLM y SGLang).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-9B); pipeline image-text-to-text |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 40960` |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo reutiliza íntegramente la arquitectura, tokenizador, procesador y plantilla de chat de Qwen3.5-9B, por lo que su comportamiento de inferencia es idéntico al del modelo base. El entrenamiento sigue un esquema en dos fases: primero un calentamiento mediante SFT (supervised fine-tuning) sobre los datos de imagen STEM del dataset M3OPD-SFT-1.35M, y después una fase de aprendizaje por refuerzo con GSPO (Group Sequence Policy Optimization) sobre los prompts del subconjunto `image_stem` del dataset M3OPD-RL-193K. El checkpoint publicado corresponde al paso 160 de esa ejecución con GSPO.

La innovación técnica principal no está en el modelo en sí, sino en su papel dentro de la receta M3OPD-Reasoner: este profesor se destila, junto con otros profesores de dominio, en un modelo alumno mediante Multi-Teacher On-Policy Distillation (MOPD). Según la documentación de NeMo-RL, MOPD sustituye la ventaja basada en recompensa de GRPO por una ventaja de destilación a nivel de token, y se ejecuta sobre GRPO asíncrono recogiendo rollouts mediante NeMo Gym, lo que permite interacción multi-turno y multi-paso. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como DPO.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto y genera respuestas razonadas (pipeline `image-text-to-text`).
- Razonamiento STEM sobre imágenes: especializado en problemas de ciencia, tecnología, ingeniería y matemáticas presentados visualmente.
- Modo "thinking": el autor entrena y evalúa con la plantilla de chat nativa de Qwen3.5 con el modo de pensamiento activado.
- Formato de respuesta controlado: admite instrucciones de formato como `Put your final answer within \boxed{}.`, útil para evaluación automática.
- Compatibilidad con tool calling y function calling: no documentada explícitamente en la model card; se heredaría, en su caso, del modelo base Qwen3.5-9B.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado para este checkpoint concreto.

## Casos de uso

- Profesor en pipelines de destilación: el uso previsto es servir como modelo profesor de dominio STEM visual dentro de la receta M3OPD-Reasoner, generando rollouts y señales de destilación a nivel de token para entrenar un modelo alumno más pequeño o más eficiente.
- Evaluación de razonamiento STEM multimodal: permite generar cadenas de razonamiento con respuesta final en formato `\boxed{}` sobre problemas de imagen, lo que facilita la corrección automática en benchmarks y pruebas internas.
- Generación de datos sintéticos de razonamiento: al ser un profesor especializado, puede producir trazas de razonamiento de alta calidad sobre imágenes STEM para ampliar datasets de entrenamiento supervisado.
- Tutoría automática de problemas científicos: con su ventana de contexto configurable (el ejemplo de despliegue usa 40.960 tokens), puede gestionar explicaciones paso a paso de ejercicios con figuras, diagramas o gráficos.
- Investigación en RL y destilación: sirve como referencia reproducible de un checkpoint intermedio (paso 160 de GSPO) para estudiar el efecto de la destilación multi-profesor frente a un único profesor generalista.
- Despliegue en infraestructura existente de Qwen3.5: al conservar arquitectura y plantilla de chat, se puede servir con vLLM o SGLang sin adaptaciones específicas, integrándose en servicios ya construidos alrededor de Qwen3.5-9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño real (9,41 mil millones de parámetros), en precisión BF16 se necesitarían aproximadamente 19 GB solo para los pesos, más memoria para el procesador visual y la caché KV; en cuantizaciones de 8 bits o 4 bits el requisito bajaría considerablemente, pero no se documentan cuantizaciones publicadas para este checkpoint.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encaja en GPUs de centro de datos como A100 (40/80 GB) o H100, y previsiblemente en GPUs de consumo de gama alta con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB en BF16, aunque el margen para contexto largo sería ajustado).
- ¿Cabe en GPU de consumo? Probable en GPUs de 24 GB o más en BF16 con contexto moderado; no confirmado por el autor.
- Opciones de despliegue: Transformers, vLLM (`vllm serve ngqtrung/M3OPD-Teacher-ImageSTEM-9B --max-model-len 40960`) y SGLang, según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M3OPD-Teacher-ImageSTEM-9B | 9,41 B | no disponible (ejemplo con 40.960) | Profesor de dominio STEM visual (destilación) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B | 9 B (aprox., según nombre) | no disponible | Modelo base multimodal generalista | no disponible en la información | Hugging Face |
| Otros profesores de la colección M3OPD-Reasoner | no disponible | no disponible | Profesores de dominio de la misma receta | no disponible | Colección de Hugging Face de ngqtrung |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo profesor de dominio, no un asistente general: su especialización en imagen STEM puede degradar su comportamiento en tareas fuera de ese ámbito respecto al Qwen3.5-9B original.
- Riesgo de alucinación: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos, especialmente en problemas visuales ambiguos o con diagramas de baja calidad.
- Idiomas soportados no documentados: se desconoce si el ajuste fino ha alterado el equilibrio multilingüe del modelo base.
- Longitud de contexto no confirmada oficialmente: el valor de 40.960 tokens aparece solo como parámetro de ejemplo en el comando de vLLM, no como especificación del modelo.
- Sin datos de benchmarks publicados: no es posible verificar su rendimiento frente al modelo base ni frente a alternativas.
- Sin cuantizaciones publicadas: desplegarlo en hardware limitado requerirá generar las cuantizaciones por cuenta propia.
- Uso comercial permitido por la licencia Apache 2.0, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y de los datasets utilizados en el entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni evidencia de uso en producción.
- El checkpoint corresponde al paso 160 de una ejecución con GSPO; no se documenta la curva de evaluación completa ni los criterios de selección más allá de "el mejor evaluado".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-Teacher-ImageSTEM-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset M3OPD-SFT-1.35M: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset M3OPD-RL-193K: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Colección M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
- Perfil del autor en Hugging Face: https://huggingface.co/ngqtrung
- Documentación de Multi-Teacher On-Policy Distillation (NeMo-RL): https://docs.nvidia.com/nemo/rl/nightly/about/algorithms/mopd.html
