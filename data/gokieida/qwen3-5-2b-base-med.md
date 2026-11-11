# gokieida/Qwen3.5-2B-Base-MED

## Resumen
El modelo `gokieida/Qwen3.5-2B-Base-MED` es un checkpoint publicado en Hugging Face por el usuario gokieida, derivado de la familia Qwen3.5 en su variante Base de 2B. Los metadatos del repositorio indican que se ha sometido a un ajuste fino supervisado (SFT) mediante la librería TRL, y la pipeline declarada es `image-text-to-text`, lo que sugiere capacidades multimodales de entrada imagen y texto. El modelo cuenta con 2.213.241.664 parámetros totales según los pesos en safetensors, y el repositorio ocupa 4,4 GB.

La relevancia de este checkpoint es doble. Por un lado, se trata de un modelo de 2B parámetros, un tamaño que cabe en GPU de consumo y permite despliegues de bajo coste. Por otro lado, el sufijo "MED" y la naturaleza de ajuste fino apuntan a una especialización en dominio médico, aunque el autor no ha documentado dicha especialización en la model card. La model card está generada automáticamente y no contiene información sustantiva sobre datos de entrenamiento, licencia, idiomas o evaluación.

La ficha que sigue se basa exclusivamente en los metadatos verificables del repositorio (tags, pipeline, recuento de parámetros, tamaño) y en la información proporcionada. Cualquier dato no confirmado se marca explícitamente como no disponible, dado que la ausencia de documentación del autor impide afirmaciones más precisas sobre el proceso de entrenamiento o el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal, pipeline `image-text-to-text`); detalles internos no disponibles |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
Los tags del repositorio identifican la arquitectura como `qwen3_5`, lo que sitúa al modelo en la familia Qwen3.5 de Alibaba. La pipeline `image-text-to-text` implica que el modelo acepta imágenes y texto como entrada y genera texto, por lo que incorpora algún tipo de codificador visual junto con el backbone de lenguaje. No se dispone de información sobre el número de capas, dimensión oculta, cabezas de atención ni configuración del componente visual.

En cuanto al entrenamiento, los tags `trl` y `sft` indican que el checkpoint se ha producido mediante ajuste fino supervisado con la librería TRL de Hugging Face, presumiblemente partiendo de un modelo base Qwen3.5-2B. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posterior ni hiperparámetros. El tag `conversational` sugiere que el ajuste ha adaptado el modelo al formato de diálogo. La model card no aporta ninguna de estas secciones: todas aparecen como "[More Information Needed]".

## Capacidades
- Generación de texto e interacción conversacional, según el tag `conversational` y el ajuste SFT declarado.
- Procesamiento de entrada multimodal imagen-texto, según la pipeline `image-text-to-text`; el alcance exacto (captioning, VQA, OCR) no está documentado.
- Ajuste fino orientado a dominio médico inferido del sufijo "MED" del identificador; no confirmado por el autor.
- Compatibilidad con `transformers` y con endpoints compatibles (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Asistente clínico de apoyo a la documentación: dado el sufijo "MED" y el ajuste SFT, el modelo podría emplearse para resumir notas clínicas o estructurar informes a partir de texto e imágenes de documentos; requiere validación previa porque no hay evaluación publicada.
- Procesamiento de informes médicos escaneados: la pipeline `image-text-to-text` permitiría extraer y resumir texto de imágenes de analíticas o recetas en un flujo OCR + generación, aunque la calidad no está verificada.
- Prototipado rápido en GPU de consumo: con 2,2B parámetros y 4,4 GB de pesos, cabe en tarjetas de 8-12 GB y sirve para experimentar con fine-tuning adicional o para demos locales.
- Clasificación y etiquetado de texto especializado: un modelo de 2B ajustado por SFT puede emplearse para tareas de extracción de entidades o categorización en dominio sanitario, siempre con supervisión humana.
- Generación aumentada por recuperación (RAG) en entornos con recursos limitados: el tamaño reducido permite desplegar el modelo junto a un índice vectorial en una sola máquina.
- Evaluación comparativa de checkpoints comunitarios: útil como referencia para estudiar el efecto del SFT sobre un base Qwen3.5-2B en tareas de dominio, dado que el autor no documenta el proceso.
- Filtrado y preanotación de datasets: el modelo puede preetiquetar grandes volúmenes de texto o pares imagen-texto antes de la revisión humana, reduciendo coste de anotación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en bf16/fp16: aproximadamente 4,4-5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 8-10 GB para inferencia cómoda con contexto moderado.
- Cuantización a 8 bits: alrededor de 2,5 GB de pesos; a 4 bits (GGUF/AWQ/GPTQ), alrededor de 1,3-1,5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en datacenter, A10, L4, A100 o H100 para servir varias instancias.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en precisión completa y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: `transformers` (soporte nativo declarado), vLLM y TGI previsiblemente compatibles al ser un transformer estándar, aunque no se ha verificado; llama.cpp/Ollama requerirían conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gokieida/Qwen3.5-2B-Base-MED | 2,21B | no disponible | sí (image-text-to-text) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-VL-3B-Instruct (referencia de familia) | ~3B | no verificable en esta ficha | sí | Apache 2.0 (según familia Qwen) | ampliamente disponible |
| SmolVLM-2B (referencia de tamaño) | ~2B | no verificable en esta ficha | sí | Apache 2.0 | ampliamente disponible |
| Qwen3.5-2B-Base (modelo del que deriva) | ~2B | no disponible | según variante | no disponible | presumiblemente en el Hub |

La comparativa es orientativa: los datos de los modelos alternativos no proceden de la información proporcionada y deben verificarse en sus respectivas model cards. La principal diferencia de este checkpoint es su ajuste SFT específico y su estado de publicación reciente (noviembre de 2026) sin descargas ni validación comunitaria.

## Limitaciones y advertencias
- La model card está generada automáticamente y no documenta datos de entrenamiento, evaluación, sesgos ni uso previsto; no hay garantía de calidad del ajuste SFT.
- El sufijo "MED" sugiere dominio médico, pero no hay evidencia publicada de la calidad clínica; no debe usarse en decisiones sanitarias sin validación externa y supervisión profesional.
- Riesgo de alucinación inherente a modelos de 2B y a ajustes SFT sin evaluación; especialmente crítico en dominio médico.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Longitud de contexto desconocida; no se puede planificar su uso en tareas de contexto largo.
- Cero descargas y cero likes en el momento de la consulta: sin validación de la comunidad ni reportes de uso.
- El tag `endpoints_compatible` sugiere compatibilidad con la infraestructura de Hugging Face, pero no se ha verificado el despliegue en vLLM/TGI.
- Fecha de creación futura respecto a la mayoría de checkpoints públicos (2026-11-11): conviene confirmar la integridad de los pesos antes de usarlos en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/gokieida/Qwen3.5-2B-Base-MED
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Librería TRL: https://github.com/huggingface/trl
- Documentación de transformers: https://huggingface.co/docs/transformers
