# Saraswathy/vlm-mix-resume-broader-stem-expert-step90

## Resumen

Saraswathy/vlm-mix-resume-broader-stem-expert-step90 no es un modelo entrenado desde cero, sino un archivo público de reanudación (resume checkpoint) de un entrenamiento EasyR1 detenido en el paso global 90. El repositorio contiene el estado completo del entrenamiento: pesos del modelo y del optimizador en formato FSDP, estado extra, estado del dataloader y, dentro de `actor/lora_adapter/`, un adaptador LoRA listo para evaluación. No es un modelo autónomo fusionado: para usarlo hay que cargar el adaptador sobre el modelo base Qwen/Qwen3-VL-4B-Instruct.

El modelo subyacente, Qwen3-VL-4B-Instruct, es un transformer multimodal de aproximadamente 4.000 millones de parámetros que procesa imagen y texto (pipeline `image-text-to-text`). El adaptador se ha entrenado sobre una mezcla de datos (VLM mix) con un enfoque declarado de "experto STEM", es decir, orientado a dominios de ciencia, tecnología, ingeniería y matemáticas. El repositorio ocupa 11,8 GB, un tamaño coherente con un checkpoint de entrenamiento completo y no con un adaptador aislado.

Su relevancia es fundamentalmente de investigación y reproducibilidad: permite auditar y reanudar un experimento de fine-tuning de un VLM, inspeccionar el adaptador resultante y evaluar el efecto de la mezcla de datos STEM sobre Qwen3-VL-4B. No hay métricas publicadas, licencia declarada ni idiomas documentados en la información disponible, por lo que debe tratarse como material experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) heredada del modelo base Qwen/Qwen3-VL-4B-Instruct; el artefacto es un adaptador LoRA (PEFT) |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina Qwen3-VL-4B, es decir, del orden de 4.000 millones de parametros |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors y estado de entrenamiento FSDP) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT); el checkpoint incluye estado FSDP de modelo y optimizador, estado extra y estado del dataloader; verificacion mediante `SHA256SUMS.json` |
| Tamano del repositorio | 11,8 GB |
| Libreria | peft |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct |
| Modalidad | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base Qwen3-VL-4B-Instruct: un transformer multimodal que acepta entradas de imagen y texto y genera texto. Sobre esa base se ha aplicado un adaptador LoRA (Low-Rank Adaptation) entrenado con EasyR1, un framework de entrenamiento por refuerzo para modelos multimodales. El adaptador vive en `actor/lora_adapter/`, lo que indica que el pipeline de entrenamiento usa una arquitectura actor-critic o de política con LoRA como representación eficiente de parámetros.

El repositorio es un checkpoint de reanudación en el paso global 90, no el resultado final de un entrenamiento. Incluye el estado del modelo y del optimizador distribuidos con FSDP (Fully Sharded Data Parallel), el estado del dataloader (para reanudar exactamente el mismo flujo de datos) y estado extra del entrenador. No se documentan en la información disponible el número de tokens de entrenamiento, la composición concreta del dataset, ni si se aplicaron etapas de RLHF o DPO; el nombre del repositorio sugiere una mezcla de datos de visión y lenguaje orientada a STEM, pero no hay detalle técnico verificable.

## Capacidades

- Generación de texto e imagen-texto: heredadas del modelo base Qwen3-VL-4B-Instruct; la información disponible no documenta qué capacidades concretas conserva o mejora el adaptador.
- Razonamiento multimodal y respuesta a preguntas sobre imágenes: esperable por el pipeline `image-text-to-text` del modelo base, sin verificación publicada en esta ficha.
- Especialización declarada en dominios STEM ("broader stem expert") según el nombre del repositorio; no se aportan métricas ni ejemplos que la cuantifiquen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, audio, visión de vídeo): no disponibles.

## Casos de uso

- Reanudación de un experimento de entrenamiento: cargar el estado FSDP, del optimizador y del dataloader para continuar el run de EasyR1 exactamente desde el paso global 90, evitando recalcular 90 pasos de entrenamiento.
- Auditoría y reproducibilidad de investigación: verificar la integridad de los ficheros con `SHA256SUMS.json`, inspeccionar la configuración del adaptador y comparar el efecto de distintas mezclas de datos sobre el mismo modelo base.
- Evaluación de un adaptador LoRA STEM: cargar `actor/lora_adapter/` sobre Qwen/Qwen3-VL-4B-Instruct y medir su comportamiento en tareas de matemáticas, física o ciencias frente al modelo base sin adaptador.
- Estudio de mezclas de datos multimodales: usar el checkpoint como punto de partida para experimentos controlados sobre proporciones de datos de visión y lenguaje en dominios científicos.
- Análisis de dinámica de entrenamiento: al tratarse de un corte en el paso 90, permite estudiar la evolución de la pérdida, del adaptador y de las métricas de evaluación antes de la convergencia.
- Base para fine-tuning posterior: partir del adaptador como inicialización para un entrenamiento específico de dominio más largo, reduciendo coste frente a empezar desde el modelo base.
- Docencia y formación técnica: ilustrar en un curso o taller cómo se estructura un checkpoint FSDP de PEFT para un VLM, incluidos estados de optimizador y dataloader.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se aportan datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación, ni para el adaptador ni para el modelo base en el contexto de este repositorio.

## Requisitos de hardware

- Almacenamiento: 11,8 GB para el repositorio completo (checkpoint FSDP con estados de modelo, optimizador y dataloader). El adaptador LoRA de `actor/lora_adapter/` es una fracción de ese tamaño, pero no se especifica su peso exacto.
- Inferencia con el adaptador: requiere el modelo base Qwen/Qwen3-VL-4B-Instruct completo más el adaptador; la VRAM necesaria no está documentada. Como referencia orientativa por tamaño de parámetros (~4.000 millones), cabría esperar del orden de 8-10 GB en fp16 y 3-5 GB en cuantización de 4 bits para pesos y caché, aunque son estimaciones no verificadas en esta ficha.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño del modelo base, una GPU de 16 GB o superior sería suficiente para fp16, y GPU de 8-12 GB podrían bastar con cuantización; no hay confirmación del autor.
- GPU de consumo: plausible en tarjetas con 8-16 GB de VRAM (por ejemplo, gama RTX 4060 Ti 16 GB, RTX 4070/4080/4090) si se cuantiza el modelo base, siempre como estimación no verificada.
- Entrenamiento o reanudación: reanudar el checkpoint FSDP exige memoria muy superior a la inferencia, ya que hay que cargar estados de optimizador y shards distribuidos; se recomienda multi-GPU de datacenter (A100, H100) o almacenamiento en CPU con `offload` de FSDP.
- Opciones de despliegue: el adaptador es PEFT, por lo que el camino natural es `transformers` + `peft` con el modelo base. También podría fusionarse el adaptador en los pesos base y servirse con vLLM o TGI, o convertirse a GGUF para llama.cpp u Ollama, aunque ninguna de estas rutas está documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saraswathy/vlm-mix-resume-broader-stem-expert-step90 | Adaptador LoRA sobre VLM (checkpoint de entrenamiento) | No disponible (base ~4B) | No disponible | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct | VLM completo | ~4B (segun nomenclatura) | No disponible | No disponible en esta ficha | HuggingFace (modelo base) |
| Otros VLM de tamano similar (por ejemplo, la familia Qwen2.5-VL en sus variantes pequenas) | VLM completo | No disponible en esta ficha | No disponible | No disponible en esta ficha | No disponible |

La comparación relevante aquí no es de rendimiento, sino de naturaleza del artefacto: frente al modelo base Qwen3-VL-4B-Instruct, este repositorio no es un modelo desplegable, sino un adaptador más un estado de entrenamiento. Cualquier comparación numérica con alternativas de la misma categoría no puede realizarse con la información disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: sin cargar el adaptador sobre Qwen/Qwen3-VL-4B-Instruct no se puede ejecutar; no se ha publicado una versión fusionada.
- Checkpoint intermedio: corresponde al paso global 90 del entrenamiento, no a un modelo convergido ni validado; su calidad final es desconocida.
- Ausencia total de métricas: no hay benchmarks, evaluaciones ni ejemplos de uso publicados, por lo que no puede acreditarse su rendimiento ni su especialización STEM.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita de uso comercial y persisten dudas sobre las condiciones de redistribución, que además dependen de la licencia del modelo base Qwen3-VL-4B-Instruct.
- Idiomas no documentados: se desconoce la cobertura lingüística real del adaptador.
- Riesgo de alucinación: no cuantificado; los VLM pueden generar descripciones o respuestas plausibles pero incorrectas sobre imágenes, especialmente en dominios técnicos.
- Sesgos: no evaluados ni documentados por el autor.
- Estado FSDP y del dataloader incluidos: cargar el repositorio completo consume 11,8 GB de disco y puede requerir configuración distribuida específica; no es un fichero listo para `from_pretrained` directo.
- Cero descargas y cero interacciones: no hay evidencia de uso por terceros ni de validación externa.
- Contenido de la model card limitado: no se documentan datos de entrenamiento, hiperparámetros de LoRA (rango, alpha, módulos objetivo) ni metodología de la mezcla de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-resume-broader-stem-expert-step90
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, repositorios o demos) asociados a este modelo.
