# qinghuali/Ornith-1.5-35B-MLX-VL-oQ6e

## Resumen

Ornith-1.5-35B-MLX-VL-oQ6e es una cuantización en formato MLX del modelo multimodal Ornith-1.5-35B-A3B, desarrollado originalmente por ornith-ai y convertido por el usuario qinghuali mediante la herramienta oMLX. El modelo base emplea una arquitectura de mezcla de expertos (MoE) con 35.107.181.936 parámetros totales y una variante A3B que indica aproximadamente 3.000 millones de parámetros activos por token, lo que permite un equilibrio entre capacidad y coste de inferencia. Está diseñado para tareas de imagen-texto a texto (image-text-to-text), es decir, comprensión y generación conjunta de contenido visual y lingüístico.

La relevancia de esta ficha radica en que se trata de una cuantización mixta de 6 bits (oQ6e) que preserva la multimodalidad original del modelo, algo poco habitual en los pipelines de cuantización orientados únicamente a texto. El resultado es un repositorio de 29,5 GB que puede ejecutarse en hardware Apple Silicon mediante el framework MLX, lo que abre la puerta a desplegar un modelo de 35B parámetros en equipos de sobremesa y portátiles de gama alta con memoria unificada.

El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial, y está etiquetado únicamente para inglés. La ficha original no aporta detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (etiqueta `qwen3_5_moe`), multimodal image-text-to-text |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | aproximadamente 3B (según nomenclatura A3B del modelo base; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6 bits, cuantización mixta dinámica oQ (oMLX v0.6.3rc2) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX |
| Tamaño del repositorio | 29,5 GB |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Pipeline | image-text-to-text |
| Librería | mlx |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base Ornith-1.5-35B-A3B es un transformer de mezcla de expertos con 35.107.181.936 parámetros totales y una designación A3B que sugiere alrededor de 3.000 millones de parámetros activos por token. La etiqueta `qwen3_5_moe` en Hugging Face apunta a una arquitectura derivada de la familia Qwen 3.5 MoE, aunque la model card del repositorio cuantizado no desarrolla esta correspondencia ni detalla la configuración de expertos, el número de capas o las dimensiones del modelo. El pipeline image-text-to-text confirma que integra un codificador visual junto con el tronco lingüístico, pero no se especifican ni el tipo de encoder ni la resolución de imagen soportada.

Respecto al entrenamiento, no se han publicado en la información disponible datos sobre el volumen de tokens, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación. La model card del repositorio cuantizado se limita a describir el proceso de conversión y cuantización: se aplicó oMLX v0.6.3rc2 con cuantización mixta dinámica oQ, que asigna precisiones distintas a capas o módulos según su sensibilidad, y se conservó la modalidad visión-lenguaje (la etiqueta VL indica que la cuantización no elimina el codificador visual). El resultado son pesos en safetensors compatibles con MLX, no con otros runtimes.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational`.
- Comprensión de imágenes y respuesta en texto (image-text-to-text): descripción de contenido visual, respuesta a preguntas sobre imágenes y tareas de razonamiento visual.
- Razonamiento y generación de lenguaje natural en inglés.
- Capacidad potencial de código y matemáticas heredada del modelo base, aunque no documentada en la información disponible.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual para accesibilidad: el modelo puede recibir una imagen y generar una descripción textual en inglés, útil para prototipos de lectores de pantalla o etiquetado automático de contenido visual en dispositivos Apple Silicon.
- Moderación de contenido multimodal: análisis de imágenes acompañadas de texto para detectar contenido inapropiado en plataformas de publicación, aprovechando la ventana de contexto del modelo base (no confirmada) para procesar hilos completos.
- Extracción de información de documentos escaneados: dado que procesa imagen y texto conjuntamente, puede transcribir y resumir facturas, formularios o capturas en un pipeline local sin depender de APIs externas.
- Prototipado en investigación con MLX: al estar cuantizado en 6 bits y ocupar 29,5 GB, permite a investigadores ejecutar un modelo de 35B parámetros en un Mac Studio o MacBook Pro de gama alta para experimentos de evaluación multimodal sin infraestructura de GPU dedicada.
- Generación de descripciones de producto para comercio electrónico: a partir de una fotografía, el modelo puede redactar texto descriptivo en inglés, integrándose en flujos de publicación de catálogo.
- Análisis de capturas de interfaz en desarrollo de software: interpretación de screenshots para generar documentación o informes de errores, aprovechando la naturaleza conversacional del modelo.
- Chatbot de atención al cliente con soporte de imágenes: el usuario puede adjuntar una foto de un producto defectuoso y el modelo responde en inglés con contexto conversacional, siempre que el despliegue en MLX sea aceptable para el entorno de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 29,5 GB en pesos de 6 bits, por lo que se necesita al menos esa cantidad más el overhead de activaciones y del codificador visual; se recomienda un mínimo de 36-40 GB de memoria unificada para inferencia cómoda.
- GPU recomendadas: al ser un formato MLX, requiere hardware Apple Silicon (series M1, M2, M3, M4 y superiores). No es compatible de forma nativa con CUDA.
- Configuraciones consumer viables: Mac Studio con 64 GB o 96 GB de memoria unificada, MacBook Pro con 48 GB o más. En equipos con 32 GB no es recomendable por el riesgo de swap intensivo.
- Opciones de despliegue: MLX y ecosistema oMLX; no se ha validado su uso con vLLM, llama.cpp, Ollama ni TGI, que no soportan pesos MLX de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-MLX-VL-oQ6e | 35,1B totales, ~3B activos | no disponible | MIT | MLX safetensors 6 bits | Cuantización mixta, multimodal, solo Apple Silicon |
| Ornith-1.5-35B-MLX-VL-oQ8e | no disponible | no disponible | MIT | MLX safetensors 8 bits | Variante de mayor precisión del mismo autor; mayor tamaño y calidad potencialmente superior |
| ornith-ai/Ornith-1.5-35B-A3B | 35,1B totales, ~3B activos | no disponible | MIT | safetensors (formato original) | Modelo base sin cuantizar; requiere más memoria y no está optimizado para MLX |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con modelos de la competencia en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés, por lo que su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos: no se documentan en la model card los sesgos conocidos del modelo base ni del proceso de cuantización; al heredar el entrenamiento del modelo original, es previsible que arrastre sesgos de sus datos.
- Alucinación: no hay información específica sobre tasas de alucinación; la cuantización a 6 bits puede degradar ligeramente la fidelidad respecto al modelo original.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base ornith-ai/Ornith-1.5-35B-A3B, ya que el repositorio cuantizado la declara como MIT sin aportar documentación adicional.
- Compatibilidad: los pesos MLX no son portables a CUDA, ROCm ni CPU convencional; esto limita el despliegue en producción a infraestructura Apple.
- Cuantización mixta: la asignación dinámica de precisión oQ puede introducir diferencias de comportamiento frente al modelo original en tareas sensibles a la precisión numérica.
- Documentación escasa: la model card no detalla contexto máximo, configuración de expertos ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para casos de uso con requisitos estrictos.
- Repositorio con pocas descargas (210) y sin likes: menor validación comunitaria que otras cuantizaciones, lo que implica mayor riesgo de incidencias no documentadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qinghuali/Ornith-1.5-35B-MLX-VL-oQ6e
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante oQ8: https://huggingface.co/liqinghhua/Ornith-1.5-35B-MLX-VL-oQ8e
- Variante oQ6 (enlace de la model card): https://huggingface.co/liqinghhua/Ornith-1.5-35B-MLX-VL-oQ6e
- Herramienta oMLX: https://github.com/jundot/omlx
- Documentación de cuantización oQ: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Apoyo al autor: https://ko-fi.com/qinghuali
