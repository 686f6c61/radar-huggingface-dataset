# robinbijo/vit-faq-qwen3-1.7b

## Resumen

VIT FAQ Chatbot Solver es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por Robin Bijo con financiación de la profesora Nivedita S y compartido por Jey Sudharsan Balaji y Rahul James Emmanuel. Su propósito es responder preguntas frecuentes sobre la Universidad VIT Vellore, principalmente relacionadas con el proceso de admisión. No se trata de un modelo completo, sino de un adaptador PEFT que debe cargarse junto al modelo base Qwen3-1.7B.

El modelo hereda la arquitectura transformer de Qwen3 con 1.700 millones de parámetros del modelo base, y se ha ajustado mediante SFT con QLoRA (cuantización de 4 bits y adaptadores de bajo rango) usando las librerías transformers, trl, bitsandbytes y PEFT 0.21.2. El repositorio tiene un tamaño de 0.0 GB, lo que confirma que solo contiene los pesos del adaptador, no los del modelo completo.

La relevancia de esta ficha es limitada: se trata de un proyecto académico de tipo MVP, marcado como archivado y sin mantenimiento activo, con solo 30 descargas y ningún "like". Su interés principal es como ejemplo de fine-tuning ligero de un modelo pequeño para un dominio muy concreto (FAQ universitarias), no como modelo de propósito general. El propio autor advierte de que el modelo alucina con frecuencia debido a la escasez de datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) con adaptador LoRA/QLoRA |
| Parámetros totales | 1.700 millones (modelo base Qwen3-1.7B); el adaptador LoRA añade un número no especificado de parámetros |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-1.7B, no confirmada en la información proporcionada) |
| Tipos de cuantización | QLoRA (cuantización de 4 bits durante el entrenamiento); el adaptador se distribuye en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango (LoRA) entrenado con QLoRA sobre Qwen3-1.7B. Qwen3 es una familia de modelos transformer densos desarrollada por Alibaba Qwen; la variante de 1.700 millones de parámetros sirve como base congelada sobre la que se insertan las matrices de bajo rango entrenables. El entrenamiento utilizó SFT (supervised fine-tuning) con las librerías transformers, trl, bitsandbytes y PEFT 0.21.2, cuantizando el modelo base a 4 bits para reducir los requisitos de memoria.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset de FAQ, ni si se aplicaron técnicas de RLHF o DPO. El autor indica que la falta de datos ha sido un problema ("due to lack of datasets the model heavily hallucinates"), lo que sugiere un corpus de entrenamiento pequeño y limitado al dominio de admisiones de VIT Vellore. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés orientada a preguntas frecuentes sobre la Universidad VIT Vellore, especialmente admisiones.
- Respuesta a preguntas de un solo turno o multi-turno dentro del dominio acotado de FAQ universitarias.
- Capacidad de razonamiento general y conocimiento del mundo heredada del modelo base Qwen3-1.7B, aunque el ajuste la especializa hacia el dominio VIT.
- Soporte de tool calling / function calling: no documentado en la información proporcionada; dependería de las capacidades del modelo base, no verificadas aquí.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no documentadas para este adaptador.

## Casos de uso

- Chatbot de admisiones para VIT Vellore: el adaptador puede desplegarse junto a Qwen3-1.7B para responder preguntas sobre plazos, requisitos y procedimientos de admisión, aprovechando el ajuste específico sobre el dataset de FAQ.
- Asistente web embebido en el sitio de la universidad: el autor publica un repositorio de implementación (vitmitra.site-local) con React, FastAPI y Vite que integra el adaptador vía PEFT para servir respuestas por API REST.
- Prototipo académico de fine-tuning: sirve como ejemplo reproducible de QLoRA sobre un modelo de 1.700 millones de parámetros para estudiantes e investigadores que quieran replicar el flujo con transformers, trl y bitsandbytes.
- Base para ampliar el dataset de FAQ: al ser un adaptador LoRA, puede reentrenarse o combinarse con nuevos datos de admisiones sin tocar los pesos del modelo base.
- Inferencia local en hardware modesto: al requerir solo el adaptador más un modelo de 1.700 millones de parámetros cuantizado, puede ejecutarse en una GPU de consumo para demos y pruebas internas.
- Filtrado y enrutamiento de consultas: puede usarse como primer nivel de clasificación de preguntas entrantes sobre VIT antes de derivar a sistemas más completos, siempre con revisión humana dada su tendencia a alucinar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un modelo base de 1.700 millones de parámetros, una cuantización de 4 bits requeriría del orden de 1-2 GB para los pesos, más el adaptador y el overhead de activaciones (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, el modelo base cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del modelo base y el uso de QLoRA; no verificado en la documentación.
- Opciones de despliegue: PEFT + transformers (método indicado por el autor), text-generation-inference (etiqueta presente en el repositorio) y, potencialmente, llama.cpp u Ollama tras convertir el modelo fusionado a GGUF (no documentado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VIT FAQ Qwen3-1.7B (este) | 1.700 M + adaptador LoRA | No disponible | MIT | Hugging Face (30 descargas) | Adaptador de dominio para FAQ de VIT Vellore; alucina según el autor |
| Qwen/Qwen3-1.7B | 1.700 M | No disponible en esta ficha | No disponible en esta ficha | Hugging Face | Modelo base generalista; sin ajuste de dominio |
| Alternativas de fine-tuning LoRA sobre modelos pequeños | Variable | Variable | Variable | Hugging Face | No se dispone de comparaciones de rendimiento publicadas para este adaptador |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El autor advierte explícitamente de que el modelo alucina con frecuencia debido a la falta de datos de entrenamiento.
- Proyecto marcado como archivado, con mantenimiento inactivo y desarrollo completado; no se esperan actualizaciones.
- Seguridad no auditada y nivel de seguridad no verificado, según los badges de la model card.
- Documentación no disponible y auditoría de dependencias no verificada.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Dominio muy restringido (FAQ de admisiones de VIT Vellore); fuera de ese ámbito su fiabilidad es baja.
- Requiere cargar el modelo base Qwen3-1.7B por separado; no es un modelo autónomo.
- Licencia MIT, lo que permite uso comercial, pero la falta de auditoría y la tendencia a la alucinación desaconsejan su uso en producción sin revisión humana y validación adicional.
- No se especifican sesgos conocidos más allá de los heredados del modelo base, que no se documentan en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robinbijo/vit-faq-qwen3-1.7b
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio de implementación web: https://github.com/rbijo/vitmitra.site-local.git
