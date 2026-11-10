# myk1019/zils-d3-lite-cand2

## Resumen

zils-d3-lite-cand2 es un modelo de lenguaje de aproximadamente 853 millones de parámetros publicado por el usuario myk1019 en Hugging Face. Se trata de un ajuste fino (fine-tuning) del backbone lingüístico Qwen3.5-0.8B, según declara el propio autor en la model card, e incorpora además una torre de visión ("vision tower") heredada del "pool parent" y una capa de respuesta ("answer layer") procedente de un "chassis" fijado. El modelo se enmarca dentro de lo que el autor denomina "Zils d3-lite soup pool", un conjunto de variantes obtenidas mediante técnicas de mezcla de pesos (model soup).

El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas, y emplea el formato de pesos safetensors. Requiere código personalizado (`custom_code`) y está etiquetado con la arquitectura `qwen3_5`, lo que implica que su carga no es directa con librerías estándar sin confiar en el código remoto del repositorio.

La relevancia de esta ficha es limitada por la escasez de información publicada: no hay datos de benchmarks, idiomas soportados, composición del dataset de entrenamiento ni detalles del proceso de mezcla. El repositorio tiene cero descargas y cero "likes" en el momento de la consulta, y la model card es extremadamente breve. Se trata, por tanto, de una variante experimental de nicho más que de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-0.8B) con torre de visión añadida; etiqueta `qwen3_5` con `custom_code` |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF/AWQ no publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere código personalizado para carga) |

## Arquitectura y entrenamiento

La arquitectura parte del backbone lingüístico Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5, al que se le ha practicado un fine-tuning. Según la model card, el modelo combina tres componentes: el backbone lingüístico ajustado, una torre de visión procedente del "pool parent" (el modelo padre del conjunto de mezcla) y una capa de respuesta tomada de un "chassis" fijado. Esta composición sugiere una estrategia de ensamblaje modular típica de los "model soups", donde se combinan pesos de distintos checkpoints para obtener un modelo híbrido.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción tuning. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La presencia de una torre de visión indica capacidades multimodales (imagen-texto), pero no se detalla su arquitectura interna ni el rango de resolución de entrada. La etiqueta `custom_code` implica que la implementación exacta de las capas (especialmente la fusión visión-lenguaje y la capa de respuesta) reside en el repositorio y debe revisarse antes de su uso.

## Capacidades

- Generación de texto autoregresiva sobre la base del backbone Qwen3.5-0.8B.
- Procesamiento de imágenes mediante la torre de visión heredada del pool parent (capacidad multimodal imagen-texto), aunque no se detallan los formatos ni resoluciones soportadas.
- Razonamiento y generación de código: presumiblemente heredados del backbone Qwen3.5, si bien no hay confirmación explícita en la model card.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Experimentación con mezclas de pesos (model soups): el modelo sirve como candidato dentro del "pool" del autor para estudiar cómo la combinación de backbone, torre de visión y capa de respuesta afecta al rendimiento; adecuado para investigadores que comparan variantes de ensamblaje.
- Prototipado de asistentes multimodales ligeros: con 853 M de parámetros, puede desplegarse en entornos con recursos limitados para probar flujos imagen-pregunta antes de escalar a modelos mayores.
- Investigación sobre fusión visión-lenguaje: la separación explícita entre torre de visión y capa de respuesta permite analizar el efecto de cada componente en tareas de captioning o VQA.
- Fine-tuning posterior en dominios específicos: al ser un modelo pequeño con licencia Apache 2.0, es viable reentrenarlo para tareas concretas (clasificación de imágenes con texto, extracción de información de documentos escaneados) con presupuesto de GPU reducido.
- Evaluación comparativa de checkpoints: útil como baseline de bajo coste en estudios que miden la degradación o mejora al sustituir componentes del pool.
- Docencia y reproducción de técnicas de model soup: su tamaño y licencia permiten reproducir experimentos de mezcla de pesos en un solo GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en precisión FP16/BF16 (coincide con el tamaño del repo); en cuantización de 8 bits rondaría 0,9 GB y en 4 bits unos 0,5 GB, aunque no se publican versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660 en adelante, con margen).
- Opciones de despliegue: al requerir `custom_code`, la carga estándar con vLLM, llama.cpp, Ollama o TGI no está garantizada; sería necesario adaptar el código del repositorio o exportar a un formato estándar. Transformers con `trust_remote_code=True` es la vía más directa, asumiendo el riesgo de ejecutar código del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-d3-lite-cand2 | 853 M | no disponible | Sí (torre de visión) | Apache 2.0 | Hugging Face, código personalizado |
| Qwen3.5-0.8B (base) | ~0,8 B | no disponible en esta ficha | No (solo texto) | según Qwen | Hugging Face, estándar |
| Qwen2.5-0.5B / 1.5B | 0,5-1,5 B | 32 K (Qwen2.5) | No | Apache 2.0 | Hugging Face, ampliamente soportado |
| SmolVLM-500M | ~0,5 B | no disponible | Sí | Apache 2.0 | Hugging Face, transformers estándar |

La comparativa es aproximada: no hay datos públicos de rendimiento para zils-d3-lite-cand2, por lo que la comparación se limita a tamaño, licencia y disponibilidad. Frente a SmolVLM, la diferencia clave es el soporte de herramientas estándar (transformers, llama.cpp), que en este modelo no está garantizado por el uso de `custom_code`.

## Limitaciones y advertencias

- Información mínima: la model card no documenta dataset, idiomas, contexto ni evaluación, lo que impide validar su comportamiento en producción.
- Riesgo de alucinación: al ser un modelo de 853 M parámetros, la tasa de alucinación es previsiblemente alta en tareas de conocimiento factual; no hay datos que lo cuantifiquen.
- Sesgos: desconocidos, al no publicarse la composición del dataset de entrenamiento ni del backbone original.
- Código personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; debe auditarse antes de usarlo en entornos sensibles.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que los componentes heredados (torre de visión, capa de respuesta) no arrastren licencias distintas no declaradas.
- Sin cuantizaciones oficiales: no hay GGUF ni AWQ publicados, lo que dificulta el despliegue en llama.cpp u Ollama sin trabajo adicional.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en la comunidad ni de mantenimiento.
- Idiomas y contexto no declarados: no es posible garantizar soporte multilingüe ni ventanas de contexto largas.

## Enlaces

- Hugging Face: https://huggingface.co/myk1019/zils-d3-lite-cand2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
