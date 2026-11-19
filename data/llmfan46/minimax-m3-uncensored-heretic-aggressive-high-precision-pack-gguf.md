# llmfan46/MiniMax-M3-uncensored-heretic-aggressive-high-precision-pack-GGUF

## Resumen

MiniMax-M3-uncensored-heretic-aggressive-high-precision-pack-GGUF es una cuantización en formato GGUF del modelo MiniMax-M3, publicada por el contribuidor independiente llmfan46. El modelo base, MiniMaxAI/MiniMax-M3, es un modelo multimodal de tipo Mixture of Experts (MoE) desarrollado por MiniMax, orientado a tareas de agente, generación de código, razonamiento y comprensión de imagen y vídeo (pipeline image-text-to-text). Esta versión concreta aplica un proceso de "abliteration" mediante la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) para reducir los rechazos del modelo ante determinadas peticiones.

El modelo cuenta con 426.174.572.928 parámetros totales según los pesos en safetensors del modelo base, lo que lo sitúa en la categoría de modelos de gran escala. El repositorio GGUF ocupa 1.658,7 GB, lo que refleja el tamaño de las cuantizaciones de alta precisión incluidas (BF16, Q8_0 y Q6_K). La licencia es "minimax-community", una licencia propia del desarrollador original que conviene revisar antes de cualquier uso comercial.

La relevancia de esta ficha radica en que combina dos factores poco habituales: por un lado, un modelo multimodal MoE de gran tamaño con capacidades de agente y código; por otro, una modificación de alineación (decensoring) que reduce los rechazos del 98/100 al 8/100 según el autor, con una divergencia KL de 0,0258 respecto al modelo original. Es importante señalar que la información disponible sobre el modelo base es limitada en esta ficha y que muchos datos técnicos no están confirmados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text); detalles de capas y configuración no disponibles |
| Parametros totales | 426.174.572.928 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K (GGUF); proyector de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (license: other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base MiniMax-M3 emplea una arquitectura de tipo Mixture of Experts (MoE) con capacidades multimodales, según las etiquetas del repositorio (multimodal, moe, image-text-to-text). El pipeline declarado es image-text-to-text, lo que indica que acepta imágenes y texto como entrada y genera texto. No se dispone en la información proporcionada de detalles sobre el número de expertos, la dimensión de las capas, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La modificación de esta versión se realizó con Heretic v1.2.0 aplicando Arbitrary-Rank Ablation (ARA) sobre el componente attn.o_proj, entre las capas 14 y 51. Los parámetros de abliteración reportados son: preserve_good_behavior_weight 0,0847, steer_bad_behavior_weight 0,0002, overcorrect_relative_weight 1,1741 y neighbor_count 15. El autor reporta una divergencia KL de 0,0258 respecto al modelo original y una reducción de rechazos de 98/100 a 8/100. No se detallan innovaciones técnicas adicionales del modelo base como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y resolución de tareas de agente (etiqueta "agent").
- Generación de código (etiqueta "coding").
- Comprensión multimodal de imagen y texto (pipeline image-text-to-text); requiere el fichero proyector de visión mmproj en BF16.
- Procesamiento de vídeo según la etiqueta "video" del repositorio (sin detalles adicionales disponibles).
- Soporte de tool calling / function calling, probado por el autor con búsqueda web mediante SearXNG.
- Comportamiento "decensored": reducción de rechazos y respuestas de tipo lecturing según la métrica del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia conversacional sin restricciones temáticas: el modelo está diseñado para reducir rechazos (8/100 según el autor), lo que lo hace adecuado para entornos de investigación donde se necesita explorar respuestas sin filtros de contenido, siempre que se cumpla la licencia.
- Generación de código en pipelines de desarrollo: la etiqueta "coding" y el soporte de tool calling permiten integrarlo en flujos de asistencia a programación, aunque requiere un runtime compatible con la arquitectura minimax-m3.
- Agentes autónomos con búsqueda web: el autor reporta funcionamiento de tool calling con SearXNG, lo que permite construir agentes que consulten fuentes externas y razonen sobre los resultados.
- Análisis de imágenes y documentos visuales: gracias al pipeline image-text-to-text y al proyector de visión en BF16, puede emplearse para describir imágenes o extraer información de capturas y documentos escaneados.
- Procesamiento de vídeo: la etiqueta "video" sugiere capacidad de análisis de contenido audiovisual, útil en tareas de descripción o resumen de clips, aunque no se detallan los límites.
- Investigación sobre alineación y abliteración: el modelo sirve como caso de estudio para medir el impacto de ARA sobre el comportamiento (KL 0,0258) y comparar con el modelo original.
- Experimentación local con llama.cpp o LM Studio: las cuantizaciones Q8_0 y Q6_K permiten desplegar el modelo en entornos con backend actualizado, aunque el tamaño del repositorio (1.658,7 GB) exige almacenamiento considerable.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (MiniMaxAI/MiniMax-M3) |
|---|---|---|
| Divergencia KL | 0,0258 | 0 (por definición) |
| Rechazos | 8/100 | 98/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son las métricas de abliteración reportadas por el autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 426.174 millones de parámetros totales, incluso en Q6_K el modelo requiere un volumen de memoria muy elevado, muy por encima de cualquier GPU de consumo.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo, se necesitarían configuraciones multi-GPU de clase centro de datos (A100/H100) o inferencia en CPU con RAM abundante.
- ¿Cabe en GPU de consumo? No es viable en una única GPU de consumo; el tamaño del repositorio (1.658,7 GB) y los parámetros totales lo impiden.
- Opciones de despliegue: llama.cpp (build compatible con MiniMax-M3), llama-server, llama-ui, LM Studio (última versión) y Unsloth Studio con soporte MiniMax-M3. No garantizado en Ollama, KoboldCpp, Jan u otros frontends sin backend compatible.
- Requisitos de software: transformers 5.12.0 o 5.12.1, CUDA 13.0–13.3, PyTorch 2.12.0+cu132 o 2.12.1+cu132, torchvision 0.27.0/0.27.1+cu132 y Triton 3.6.0 o 3.7.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa es con el modelo base MiniMaxAI/MiniMax-M3, del que esta versión es una cuantización decensored:

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMax-M3-uncensored-heretic-aggressive (este) | 426.174.572.928 | no disponible | minimax-community | GGUF | 8/100 rechazos, KL 0,0258 |
| MiniMaxAI/MiniMax-M3 (base) | 426.174.572.928 | no disponible | minimax-community | safetensors | 98/100 rechazos |

## Limitaciones y advertencias

- El proceso de abliteración altera el comportamiento de alineación del modelo; puede generar contenido que el modelo original rechazaría, con implicaciones éticas y legales según el contexto de uso.
- La divergencia KL de 0,0258 indica cambios respecto al modelo original; aunque el autor la presenta como baja, puede afectar a la calidad en tareas sensibles.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de fiabilidad factual en la información disponible.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe adecuado.
- Longitud de contexto no disponible; no se puede planificar su uso en tareas de contexto largo sin verificación previa.
- Licencia "minimax-community": es una licencia propia del desarrollador original; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Compatibilidad limitada: requiere runtimes con soporte de la arquitectura minimax-m3; errores como "unknown model architecture: 'minimax-m3'" indican backend no compatible, no un fichero corrupto.
- El repositorio tiene un tamaño de 1.658,7 GB, lo que exige infraestructura de almacenamiento y descarga considerable.
- El autor declara haber alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura de actualizaciones.
- Solo 1 descarga y 10 likes en el momento de la ficha: baja validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/MiniMax-M3-uncensored-heretic-aggressive-high-precision-pack-GGUF
- Modelo intermedio del autor: https://huggingface.co/llmfan46/MiniMax-M3-uncensored-heretic-aggressive
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/download
- Unsloth Studio: https://unsloth.ai/docs/new/studio/install
- MiniMax Agent: https://agent.minimax.io/
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Paper referenciado (arxiv:2606.13392): no disponible como enlace verificado en la búsqueda
