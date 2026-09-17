# PS4Research/marimo-workshop-clip

## Resumen

`PS4Research/marimo-workshop-clip` es una copia sin modificaciones de `openai/clip-vit-base-patch32` (revisión `3d74acf9a28c67741b2f4f2ea7635f0aaf6f0268`), publicada por el usuario PS4Research con los pesos en formato safetensors y el preprocesador incluido. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de fijación de versión creado para que los notebooks del taller de marimo carguen exactamente los mismos pesos que generaron los vectores del catálogo `PS4Research/marimo-workshop-catalogue`.

El modelo es un CLIP de doble codificador (imagen y texto) con 151.277.312 parámetros, orientado a clasificación de imágenes zero-shot y a la generación de embeddings multimodales alineados. Su relevancia práctica no está en la arquitectura, que es la del CLIP original de OpenAI, sino en la reproducibilidad: cualquiera puede replicar los resultados del taller apuntando a este repositorio en lugar de depender de la revisión del modelo original.

Conviene ser explícito sobre su alcance: el repositorio acumula 0 descargas y 0 likes, no incluye resultados de evaluación propios y su model card remite a la del modelo base para usos previstos, limitaciones y sesgos. Es, por tanto, un recurso docente y de fijación de dependencias, no un modelo pensado para producción sin una validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP de doble codificador (transformer de visión ViT-B/32 + transformer de texto) |
| Parámetros totales | 151.277.312 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens en el codificador de texto (límite de la arquitectura CLIP del modelo base) |
| Tipos de cuantización | no disponible; el repositorio solo contiene safetensors en precisión completa |
| Idiomas soportados | no disponible en la información proporcionada; el modelo base se entrenó con pares imagen-texto predominantemente en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | openai/clip-vit-base-patch32 |
| Pipeline | zero-shot-image-classification |
| Entrada de imagen | 224 × 224 píxeles, parches de 32 × 32 (según la arquitectura del modelo base) |
| Tamaño del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |
| Idiomas de la model card | inglés |

## Arquitectura y entrenamiento

La arquitectura es la del CLIP original: dos torres transformer entrenadas de forma contrastiva para alinear representaciones de imagen y de texto en un mismo espacio vectorial. La torre visual es un ViT-B/32, que divide la imagen en parches de 32 × 32 píxeles, y la torre de texto es un transformer de tamaño base. La similitud coseno entre el embedding de una imagen y el de una descripción textual permite clasificar sin entrenamiento específico: basta con formular las etiquetas candidatas como texto.

Según la model card, no se realizó ningún ajuste sobre los pesos originales. El autor declara explícitamente que se trata de una copia sin modificar y remite a la model card de `openai/clip-vit-base-patch32` para todo lo relativo a datos de entrenamiento, usos previstos, limitaciones y sesgos. En la información disponible no se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, más allá de lo que documente el modelo base.

La innovación relevante aquí no es técnica sino de ingeniería de reproducibilidad: el repositorio fija una revisión concreta de los pesos y empaqueta el `CLIPProcessor` junto al modelo, de forma que el preprocesado también queda congelado. Los detalles sobre la composición del dataset de entrenamiento del modelo base no están disponibles en la información proporcionada.

## Capacidades

- Clasificación de imágenes zero-shot: asignar una de entre un conjunto de etiquetas definidas en lenguaje natural sin entrenamiento previo sobre esas categorías.
- Generación de embeddings de imagen y de texto en un espacio compartido, lo que habilita búsqueda y recuperación cruzada entre ambas modalidades.
- Similitud imagen-texto y texto-imagen mediante producto escalar o similitud coseno de los embeddings normalizados.
- Puntuación de similitud entre una imagen y múltiples descripciones candidatas, útil para ranking y para filtrado por umbral.
- Extracción de características visuales para tareas posteriores (clustering, deduplicación, detección de imágenes fuera de distribución) usando el encoder de visión como extractor congelado.
- Capacidades multilingües: no disponibles en la información proporcionada; el rendimiento con prompts en castellano no está documentado y, dado el origen del modelo base, cabe esperar un comportamiento inferior al de los prompts en inglés.
- Tool calling, function calling y flujo agéntico: no aplica; es un modelo de representación multimodal, no un modelo generativo de instrucciones.
- Modo de razonamiento explícito (thinking): no aplica.

## Casos de uso

- Reproducción de talleres y cuadernos docentes: el repositorio existe precisamente para que los notebooks de marimo carguen los mismos pesos y el mismo preprocesador que generaron el catálogo de vectores, evitando que una actualización del modelo original rompa los resultados del taller.
- Etiquetado automático de catálogos de imágenes: definir las categorías como texto y clasificar lotes de imágenes sin necesidad de un conjunto etiquetado, usando los scores de similitud para priorizar revisiones manuales.
- Triaje y curación de datasets: descartar o separar imágenes que no encajan en ninguna de las categorías previstas antes de una fase de anotación humana, lo que reduce el coste del etiquetado manual.
- Moderación y filtrado de contenido: construir clasificadores de contenido sensible definiendo las categorías como prompts de texto y aplicando un umbral sobre la similitud; al no requerir entrenamiento, las políticas se pueden modificar editando las etiquetas.
- Búsqueda semántica multimodal: indexar los embeddings de imagen en una base de datos vectorial y recuperar por consultas de texto (o al revés), lo que sirve para catálogos de producto, archivos fotográficos o bibliotecas de material gráfico.
- Deduplicación y agrupamiento de imágenes: calcular embeddings de todo un corpus y agrupar por similitud coseno para detectar duplicados o imágenes casi idénticas antes de entrenar otro modelo.
- Control de calidad visual en entornos industriales o logísticos: clasificar piezas o estados (por ejemplo, "correcto" frente a "defectuoso") mediante etiquetas textuales, como primera barrera antes de un sistema supervisado específico.
- Filtrado previo para aprendizaje activo: seleccionar las imágenes donde el modelo está menos seguro (scores próximos entre categorías) y enviar solo esas a anotación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card de este repositorio no incluye ninguna tabla de evaluación, y el autor indica que los pesos no han sido modificados, por lo que el comportamiento coincide con el de `openai/clip-vit-base-patch32`. Los resultados publicados para ese modelo base no forman parte de la información recopilada en esta búsqueda y, por tanto, no se reproducen aquí.

## Requisitos de hardware

- Memoria de los pesos: 151,3 millones de parámetros equivalen a unos 605 MB en fp32 (coherente con el tamaño de 0,6 GB del repositorio) y a unos 303 MB en fp16 o bf16.
- VRAM estimada para inferencia: del orden de 1 a 1,5 GB en fp16 incluyendo activaciones y el lote de imágenes; alrededor de 2 GB si se mantiene fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problemas en RTX 3050, RTX 3060, RTX 4090, A100 o H100; en estas dos últimas el modelo queda muy infrautilizado y solo tiene sentido en despliegues por lotes a gran escala.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo actuales, e incluso en CPU para inferencias puntuales o lotes pequeños (con latencias notablemente mayores).
- Aceleración en Apple Silicon: viable mediante MPS en PyTorch.
- Opciones de despliegue: `transformers` con PyTorch (vía `CLIPModel` y `CLIPProcessor`, tal como indica la model card), `open_clip` para cargar pesos compatibles, exportación a ONNX Runtime o TorchScript para servir sin dependencia de Python, y frameworks de embeddings multimodales que acepten CLIP como encoder.
- Limitaciones de despliegue: no hay conversiones GGUF ni cuantizaciones publicadas en el repositorio, por lo que llama.cpp y Ollama no pueden consumirlo directamente como modelo independiente. Tampoco es un caso de uso natural de vLLM, orientado a generación de texto y a tareas de embedding dentro de pipelines multimodales.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto de texto | Resolución de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PS4Research/marimo-workshop-clip | 151.277.312 | 77 tokens | 224 × 224 (parches de 32) | MIT | HuggingFace, safetensors |
| openai/clip-vit-base-patch32 | Idénticos (es el mismo modelo) | 77 tokens | 224 × 224 (parches de 32) | MIT | HuggingFace |
| openai/clip-vit-base-patch16 | ≈ 149,6 M (cifra aproximada, verificar en la ficha) | 77 tokens | 224 × 224 (parches de 16) | MIT | HuggingFace |
| openai/clip-vit-large-patch14 | ≈ 427,6 M (cifra aproximada, verificar en la ficha) | 77 tokens | 224 × 224 (parches de 14) | MIT | HuggingFace |

La comparación relevante es que este repositorio no aporta ninguna mejora sobre `openai/clip-vit-base-patch32`: mismos pesos, misma licencia y mismo pipeline. Las variantes con parches más pequeños (B/16 y L/14) suelen ofrecer mejor calidad de representación a cambio de más cómputo, pero no se dispone en la información proporcionada de cifras de rendimiento comparadas para respaldar esa afirmación con datos concretos.

## Limitaciones y advertencias

- No es un modelo nuevo ni ajustado: cualquier limitación, sesgo o comportamiento del CLIP original se hereda de forma íntegra.
- Sesgos conocidos: al proceder de un entrenamiento con pares imagen-texto extraídos de internet, el modelo base arrastra sesgos sociales y de representación. La model card remite a la del modelo original para el detalle, que no se reproduce aquí.
- Riesgo de falsos positivos: CLIP no genera texto, por lo que no "alucina" en el sentido generativo, pero sí puede asignar una similitud alta a etiquetas incorrectas cuando ninguna de las candidatas describe bien la imagen. Los scores no son probabilidades calibradas y los umbrales deben ajustarse por caso de uso.
- Dependencia del prompt: el rendimiento varía de forma notable según cómo se redacten las etiquetas; conviene usar plantillas del tipo "una foto de ..." y validar con un conjunto de prueba propio.
- Límite de 77 tokens en el codificador de texto: las descripciones largas se truncan, lo que restringe la riqueza de las etiquetas.
- Idiomas: no hay información sobre el rendimiento multilingüe y el modelo base está entrenado principalmente con texto en inglés; usar prompts en castellano puede degradar los resultados.
- Licencia MIT: permite uso comercial y modificación, pero no cubre los derechos sobre los datos o catálogos asociados, como el dataset de vectores del taller, cuya licencia debe comprobarse por separado.
- Madurez del repositorio: 0 descargas y 0 likes, sin garantía de mantenimiento ni soporte por parte del autor. Es un artefacto de taller y conviene fijar la revisión concreta en cualquier uso serio.
- Ausencia de cuantizaciones y de conversiones a formatos de inferencia optimizados dentro del repositorio: habrá que generarlas si se necesita desplegar en entornos con restricciones de memoria.
- Metadatos temporales: las fechas de creación y actualización publicadas (2026) deben verificarse contra la revisión real de los pesos antes de integrarlos en un pipeline reproducible.
- Para producción se recomienda evaluar el modelo en el dominio concreto y considerar alternativas de la familia CLIP con mejor relación calidad/coste o modelos más recientes de alineación imagen-texto si la precisión es crítica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PS4Research/marimo-workshop-clip
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Dataset asociado del taller: https://huggingface.co/datasets/PS4Research/marimo-workshop-catalogue
- Documentación de marimo sobre asistencia con IA en el editor: https://docs.marimo.io/guides/editor_features/ai_completion/
- Sitio oficial de marimo: https://marimo.io/
- Artículo original de CLIP (Radford et al., 2021), referencia del modelo base y no procedente de esta búsqueda: https://arxiv.org/abs/2103.00020
