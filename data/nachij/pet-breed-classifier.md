# nachij/pet-breed-classifier

## Resumen

`nachij/pet-breed-classifier` es un modelo de clasificación de imágenes publicado en Hugging Face por el usuario nachij, orientado a la identificación de razas de animales de compañía. Se distribuye en formato `safetensors` con la librería `transformers` y expone el pipeline `image-classification`, lo que permite integrarlo en flujos estándar de Hugging Face sin conversiones adicionales.

El modelo emplea una arquitectura de tipo Vision Transformer (ViT), tal como indican los tags del repositorio (`vit`, `image-classification`). Cuenta con 85.827.109 parámetros totales según los pesos reales del archivo `safetensors`, lo que sitúa el checkpoint en el rango de los ViT-base y ViT-large pequeños, con un tamaño de repositorio de 0,3 GB. No se dispone de información sobre el número de clases de salida, el dataset de entrenamiento ni el procedimiento de ajuste.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo tiene cero descargas y cero likes en el momento de la consulta, la model card es la plantilla automática de Hugging Face sin contenido sustantivo y no se declaran licencia ni idiomas. Cualquier evaluación seria de este checkpoint requiere inspección directa del repositorio y de su configuración (`config.json`, `preprocessor_config.json`) para determinar la taxonomía de razas, la resolución de entrada y las métricas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), según tags del repositorio |
| Parametros totales | 85.827.109 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer (ViT), según los tags `vit` e `image-classification` del repositorio. El ViT divide la imagen en parches, los proyecta linealmente, añade codificación posicional y procesa la secuencia resultante con bloques de autoatención y MLP, emitiendo una clasificación a partir del token `[CLS]`. El número exacto de capas, dimensión oculta, número de cabezas y resolución de entrada no está documentado en la información disponible y debe consultarse en el `config.json` del repositorio.

No se dispone de información sobre el dataset de entrenamiento (número de imágenes, composición por razas, procedencia), el régimen de entrenamiento (fine-tuning desde un checkpoint preentrenado tipo ImageNet o entrenamiento desde cero), las hiperparámetros utilizados ni si hubo aumento de datos o regularización específica. Tampoco consta el uso de técnicas de ajuste fino supervisado, RLHF o DPO, que en un modelo de clasificación de imágenes no serían aplicables en su forma habitual. La model card es la plantilla automática de Hugging Face y no aporta detalles técnicos.

## Capacidades

- Clasificación de imágenes de animales de compañía en categorías de raza, según el pipeline declarado `image-classification`.
- Integración directa con la librería `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- Compatibilidad con los endpoints de Hugging Face (`endpoints_compatible` en los tags), lo que permite desplegarlo como Inference Endpoint sin infraestructura propia.
- Inferencia por lotes de imágenes, sujeta a la resolución de entrada definida en el preprocesador.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión general más allá de la clasificación, audio ni modos de pensamiento.

## Casos de uso

- Identificación de raza en aplicaciones de adopción: dado un conjunto de fotografías de un animal en un refugio, el modelo devuelve la distribución de probabilidad sobre razas, que el personal puede revisar para completar fichas de adopción. Requiere validar previamente la taxonomía de clases del checkpoint.
- Etiquetado asistido de catálogos fotográficos: en plataformas de fotografía de mascotas, el modelo puede preetiquetar imágenes para su posterior revisión humana, reduciendo el coste de anotación manual.
- Filtrado y organización de galerías en apps de mascotas: clasificación automática de fotos subidas por usuarios para agruparlas por raza y mejorar la búsqueda y las recomendaciones.
- Módulo de verificación en seguros o registros de animales: apoyo a la validación de la raza declarada en pólizas o registros, siempre como señal auxiliar y nunca como decisión automatizada única.
- Investigación en visión por computador: punto de partida para fine-tuning sobre taxonomías propias o para comparativas de ViT en dominios de grano fino como razas de perros y gatos.
- Prototipado rápido de demos: al ser un checkpoint pequeño (0,3 GB) y compatible con `transformers`, sirve para validar pipelines de clasificación de imágenes en entornos de desarrollo sin grandes requisitos de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,34 GB solo para pesos (85,8 M de parámetros × 4 bytes), más activaciones y buffers; en la práctica, menos de 1 GB para lotes pequeños.
- VRAM estimada en FP16/BF16: aproximadamente 0,17 GB para pesos, más activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque las GPU de gama alta estarán infrautilizadas.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida para lotes pequeños.
- Opciones de despliegue: `transformers` con PyTorch, Hugging Face Inference Endpoints (tag `endpoints_compatible`), y servidores de inferencia compatibles con el pipeline de clasificación de imágenes. No se documentan variantes GGUF ni soporte para llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; dependerán de la GPU, el tamaño de lote y la resolución de entrada, que no está documentada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nachij/pet-breed-classifier | 85,8 M | no aplica | Clasificación de razas de mascotas | no disponible | Hugging Face, 0 descargas |
| google/vit-base-patch16-224 | 86 M (aprox.) | no aplica | Clasificación de imágenes general (ImageNet) | Apache 2.0 | Hugging Face, ampliamente usado |
| openai/clip-vit-base-patch32 | 151 M (aprox.) | 77 tokens de texto | Clasificación zero-shot imagen-texto | MIT | Hugging Face, ampliamente usado |

La comparación con `google/vit-base-patch16-224` es la más directa por tamaño y arquitectura, pero este último está entrenado en ImageNet y no en razas de mascotas; la ventaja del checkpoint de nachij, si la taxonomía es adecuada, sería la especialización en el dominio, algo que no puede confirmarse sin métricas. `openai/clip-vit-base-patch32` ofrece clasificación zero-shot mediante prompts de texto, lo que aporta flexibilidad que un clasificador cerrado no tiene. No se dispone de datos de rendimiento del modelo evaluado para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card es la plantilla automática de Hugging Face y no documenta el modelo: no hay información sobre dataset, procedimiento de entrenamiento, taxonomía de clases ni métricas.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; en ausencia de licencia explícita, debe asumirse que no hay autorización clara para producción.
- No se declaran idiomas soportados; al ser un clasificador de imágenes, la relevancia es limitada, pero afecta a la documentación de etiquetas si estas están en un idioma concreto.
- Riesgo de alucinación en sentido estricto no aplica, pero sí riesgo de clasificación errónea en razas visualmente similares, en animales mestizos o en imágenes con oclusión, iluminación deficiente o ángulos no canónicos; sin métricas publicadas no puede acotarse.
- Sesgos potenciales desconocidos: la distribución del dataset de entrenamiento (razas sobrerrepresentadas, sesgo geográfico o de fotografía de estudio) no está documentada.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.
- El repositorio se creó y actualizó el mismo día (2026-11-11), con tres minutos de diferencia entre creación y actualización, lo que sugiere una publicación sin iteración posterior.
- No debe usarse como decisión automatizada única en contextos con consecuencias legales o económicas (seguros, registros oficiales) sin revisión humana y validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nachij/pet-breed-classifier
- Paper de referencia del cálculo de emisiones citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML citada en la model card: https://mlco2.github.io/impact#compute
