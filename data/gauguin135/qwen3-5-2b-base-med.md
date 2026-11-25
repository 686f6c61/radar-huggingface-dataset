# gauguin135/Qwen3.5-2B-Base-MED

## Resumen

Qwen3.5-2B-Base-MED es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario gauguin135 bajo el identificador `gauguin135/Qwen3.5-2B-Base-MED`. Por su nombre y por la etiqueta de arquitectura `qwen3_5` que aparece en los metadatos del repositorio, se trata de un ajuste fino (fine-tuning) supervisado (SFT, mediante la librería TRL) sobre una base de la familia Qwen3.5 de 2B parámetros, orientado a tareas del ámbito médico. El sufijo "MED" sugiere ese enfoque sanitario, aunque la model card no lo confirma explícitamente.

El modelo cuenta con 2.213.241.664 parámetros totales según los pesos en safetensors, y el repositorio ocupa 4,4 GB, lo que es coherente con pesos en precisión de 16 bits. La pipeline declarada es `image-text-to-text`, de modo que el modelo acepta entradas de imagen y texto y genera texto, lo que lo sitúa en la categoría de modelos vision-language (VLM) pequeños. Es relevante porque los modelos multimodales de ~2B parámetros permiten desplegar capacidades de visión y lenguaje en hardware de consumo, algo poco habitual en el segmento médico.

La información pública disponible es muy escasa: la model card es la plantilla automática de Hugging Face sin rellenar, no hay licencia declarada, no se especifican idiomas, no hay datos de entrenamiento ni resultados de benchmarks, y el repositorio no registra descargas ni interacciones. Cualquier evaluación rigurosa del modelo requiere, por tanto, pruebas propias por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), etiqueta `qwen3_5` en los metadatos; detalles no disponibles |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 4,4 GB |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. Los metadatos indican la etiqueta `qwen3_5`, lo que apunta a que el modelo deriva de la familia Qwen3.5 de Alibaba, y la pipeline `image-text-to-text` confirma que incorpora un codificador visual junto a un decodificador de lenguaje, es decir, un diseño VLM típico con proyección de las características visuales al espacio de embeddings del modelo de lenguaje. El número de parámetros (2,21B) corresponde al conjunto de los pesos publicados.

En cuanto al entrenamiento, la única información fiable es que se ha utilizado TRL con SFT (supervised fine-tuning), según las etiquetas del repositorio y la referencia a `trl` y `sft` en la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO, ni los hiperparámetros empleados. Tampoco se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, thinking mode, etc.).

## Capacidades

- Generación de texto e imagen-texto: el modelo acepta pares imagen-texto y produce respuestas textuales, según la pipeline declarada.
- Procesamiento de imágenes: al ser un modelo image-text-to-text, puede describir, interpretar o responder preguntas sobre imágenes de entrada.
- Ajuste orientado a dominio médico: el sufijo "MED" sugiere un fine-tuning sobre datos clínicos o sanitarios, aunque no está documentado.
- Conversación multi-turno: la etiqueta `conversational` indica soporte de diálogo.
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Asistencia en triaje de imágenes médicas: el modelo podría recibir una imagen (por ejemplo, una radiografía o una fotografía de una lesión) junto con una consulta en texto y generar una descripción preliminar o una pregunta de seguimiento. Su tamaño de 2B permite ejecutarlo en una GPU de consumo, lo que facilita prototipos en entornos con recursos limitados.
- Educación sanitaria y divulgación: generación de explicaciones en lenguaje natural a partir de figuras anatómicas o diagramas, útil para materiales formativos dirigidos a estudiantes.
- Preprocesado de documentación clínica con imágenes: extracción de descripciones textuales de capturas de informes, gráficos o imágenes adjuntas a historiales, como paso previo a un pipeline de NLP.
- Chatbot de apoyo a profesionales: conversaciones multi-turno (etiqueta `conversational`) para consultas de referencia rápida, siempre con supervisión humana y sin uso diagnóstico autónomo.
- Investigación en VLM pequeños: servir como base para experimentos de fine-tuning multimodal en dominios especializados, dado su reducido tamaño y su formato safetensors compatible con transformers.
- Despliegue en el borde o en local: al caber en GPUs de consumo, puede integrarse en aplicaciones de escritorio o entornos con requisitos de privacidad que impidan enviar imágenes a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,21B parámetros, en bf16/fp16 se requieren aproximadamente 4,4 GB solo para los pesos, más overhead de activaciones y del codificador visual; en cuantización de 8 bits, alrededor de 2,2-3 GB; en 4 bits, alrededor de 1,5-2 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090, A100 o H100 para despliegues de producción; para pruebas, cualquier GPU con al menos 8 GB de VRAM en bf16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en bf16; en cuantización 4 bits podría caber en GPUs de 6-8 GB, aunque no está verificado.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura concreta y deberían validarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gauguin135/Qwen3.5-2B-Base-MED | 2,21B | no disponible | image-text-to-text | no disponible | Hugging Face |
| Qwen2-VL-2B-Instruct (referencia de la familia) | ~2B | no disponible en esta ficha | image-text-to-text | Apache 2.0 (según el modelo original) | Hugging Face |
| SmolVLM-2B (referencia de VLM pequeno) | ~2B | no disponible en esta ficha | image-text-to-text | Apache 2.0 (según el modelo original) | Hugging Face |

Nota: los datos de los modelos comparativos corresponden a sus versiones públicas originales y no se han verificado contra la información proporcionada para este modelo; se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- Model card vacía: la documentación es la plantilla automática de Hugging Face, sin información sobre uso previsto, datos de entrenamiento ni evaluación.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Ámbito médico sin validación: el sufijo "MED" sugiere un fine-tuning sanitario, pero no hay evidencia publicada de su calidad clínica; no debe usarse para diagnóstico ni decisiones médicas sin validación externa y supervisión profesional.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño, especialmente en dominios especializados y con entradas visuales ambiguas.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas.
- Contexto desconocido: se desconoce la longitud máxima de contexto, lo que limita el diseño de aplicaciones con documentos largos.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan evaluar su robustez.
- Fecha de creación futura (2026-11-25): el repositorio aparece con una fecha posterior a la actual, lo que puede indicar un artefacto de metadatos o un modelo de prueba; conviene verificar la integridad de los pesos antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gauguin135/Qwen3.5-2B-Base-MED
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental ML: https://mlco2.github.io/impact
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de transformers: https://huggingface.co/docs/transformers
