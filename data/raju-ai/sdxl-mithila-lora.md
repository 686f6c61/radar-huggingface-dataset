# raju-ai/sdxl-mithila-lora

## Resumen

sdxl-mithila-lora es un adaptador LoRA de rango 32 para Stable Diffusion XL 1.0, entrenado por el usuario raju-ai para generar ilustraciones con la estética del arte folclórico Mithila (Madhubani), originario de la región de Mithila, en Bihar (India) y Nepal. El adaptador se activa con la cadena `in sks_mithila style` y se aplica únicamente sobre las capas de proyección de atención del UNet, con un peso de aproximadamente 178 MB, lo que lo convierte en un complemento ligero sobre el checkpoint base de Stability AI.

El modelo no es un modelo de lenguaje: es un adaptador de difusión latente texto-a-imagen que reproduce recursos formales concretos del estilo, como el tramado de doble línea *kachni*, los rellenos de pigmento natural *bharni*, las figuras estilizadas de perfil y los bordes geométricos y florales densos. El autor seleccionó el checkpoint 750 de entrenamiento mediante una optimización de Pareto entre adherencia al prompt (CLIP) y similitud estilística (DINOv2), y publica la tabla de métricas de todos los checkpoints evaluados.

Su relevancia actual es acotada pero específica: cubre un nicho de estilo tradicional poco representado en el ecosistema SDXL, con una model card inusualmente cuantitativa para un LoRA artístico. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el conjunto de entrenamiento es de solo 30 obras, lo que condiciona tanto su cobertura como su robustez.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL 1.0: modelo de difusión latente con UNet y doble codificador de texto CLIP |
| Parámetros totales | No disponible para el adaptador (rango 32, ~178 MB en fp16); el modelo base SDXL 1.0 tiene aproximadamente 3.500 millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen, sin ventana de contexto conversacional) |
| Tipos de cuantización | Pesos publicados en fp16; no se documentan variantes GGUF, fp8 ni int8 |
| Idiomas soportados | No disponible; todos los prompts de ejemplo y la palabra de activación están en inglés |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (carga con `pipe.load_lora_weights`) |
| Modelo base | `stabilityai/stable-diffusion-xl-base-1.0` |
| VAE recomendado | `madebyollin/sdxl-vae-fp16-fix` |
| Palabra de activación | `in sks_mithila style` |
| Resolución nativa | 1024 × 1024 |
| Escala de LoRA recomendada | 0,80 – 0,95 (por defecto 0,85; 0,0 equivale al SDXL base) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre el UNet de SDXL 1.0 en las proyecciones de atención cruzada y propia, con rango 32 y sin tocar los codificadores de texto ni el VAE. Se entrenó sobre un conjunto de 30 pinturas de calidad museística procedentes de Wikimedia Commons (licencias CC-BY y CC-BY-SA) y de la colección Open Access del Victoria and Albert Museum, con obras de artistas identificadas como Karpuri Devi, Sita Devi, Anamana Devi y Ukha Devi. El captioning eliminó deliberadamente los términos de fuga de estilo (`painting`, `madhubani`, `folk art`) y antepuso el token de activación, de modo que el estilo queda anclado al trigger y no al vocabulario descriptivo.

El entrenamiento se ejecutó en una única Nvidia Tesla T4 de 16 GB en Kaggle, con Adam de 8 bits, precisión mixta fp16, `gradient_checkpointing`, tasa de aprendizaje 1e-4 con decaimiento coseno y 100 pasos de calentamiento, y ponderación Min-SNR con `snr_gamma=5.0`. El autor reporta una selección de checkpoint basada en dos métricas complementarias (CLIP Content Score para adherencia al contenido y DINOv2 Style Similarity para fidelidad estilística), más un control de memorización mediante similitud máxima de vecino más cercano. No se documentan pasos totales de entrenamiento, tamaño de lote, resolución de entrenamiento ni número de épocas.

## Capacidades

- Generación texto-a-imagen a 1024 × 1024 con estética Mithila/Madhubani: tramado *kachni* de doble línea, rellenos *bharni*, figuras de perfil estilizadas y bordes geométricos y florales.
- Reproducción de motivos tradicionales concretos: pavos reales, árbol kadamba, lotos, elefantes decorados, procesiones reales y escenas cortesanas.
- Generalización fuera de distribución: la model card demuestra la combinación del estilo con escenas contemporáneas o ajenas a la tradición (un astronauta a caballo sobre la Luna, un gato en una cafetería con una taza de té).
- Control de intensidad del estilo mediante la escala de LoRA (0,80–0,95), lo que permite mezclar el estilo con el aspecto del SDXL base.
- Soporte de prompt negativo para descartar resultados fotorrealistas, renders 3D o anatomías defectuosas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión de entrada ni generación de audio o vídeo; es exclusivamente texto-a-imagen.
- Compatibilidad con el ecosistema SDXL (ComfyUI, Diffusers, AUTOMATIC1111) no documentada explícitamente más allá de Diffusers, aunque el formato safetensors es el estándar del ecosistema.
- Compatibilidad con ControlNet, SDXL Refiner, modelos Turbo/Lightning o Pony/Illustrious: no documentada.

## Casos de uso

- Ilustración editorial y cubiertas de libros sobre cultura del Bihar o del norte del subcontinente: el modelo produce composiciones con marcos decorativos y motivos reconocibles, adecuadas para portadas y aperturas de capítulo, con la ventaja de que la escala de LoRA permite rebajar el estilo cuando la portada requiere un tratamiento más sobrio.
- Diseño de producto impreso y papelería (láminas, cuadernos, textiles estampados): el condicionamiento por trigger y la resolución nativa de 1024 × 1024 permiten generar series coherentes de motivos con bordes geométricos repetibles.
- Material didáctico y divulgación cultural: generar pares de imágenes que ilustren la diferencia entre el tramado *kachni* y el relleno *bharni*, o entre motivos tradicionales y su reinterpretación contemporánea, para talleres y museos.
- Prototipado rápido en estudios de diseño: explorar variaciones de composición antes de encargar la pieza definitiva a un artista Mithila, usando prompts con la estructura de motivos documentada en la model card (pavos reales y kadamba, procesión con elefante).
- Ilustración de ambientación para juegos y narrativa visual: la capacidad demostrada de aplicar el estilo a escenas ajenas a la tradición (astronautas, interiores domésticos) permite generar arte conceptual con identidad visual coherente sin recurrir a un modelo afinado completo.
- Generación de fondos y assets decorativos por lotes en pipelines de Diffusers: el adaptador pesa ~178 MB y se carga y descarga en memoria con `load_lora_weights`/`unload_lora_weights`, lo que facilita alternar estilos en un mismo servidor de inferencia.
- Aumento de datos para clasificadores de arte folclórico: siempre con cautela, porque la similitud máxima de vecino más cercano (0,6317) indica que parte de las composiciones generadas puede quedar cerca de las obras de entrenamiento.

## Benchmarks y rendimiento

El autor publica una evaluación cuantitativa propia sobre una rejilla fija de 6 prompts, comparando checkpoints. No hay resultados de benchmarks estándar de generación (FID, CLIP Score global, comparación con otros LoRA) ni comparación con modelos de referencia.

| Checkpoint | CLIP Content Score ↑ | DINOv2 Style Sim ↑ | DINOv2 Max-NN (memorización) | Estado |
|---|---:|---:|---:|---|
| SDXL base (0) | 0,2961 | 0,1865 | 0,3956 | Línea base |
| ckpt-250 | 0,2718 | 0,3728 | 0,5945 | Infraentrenado |
| ckpt-500 | 0,2501 | 0,3544 | 0,5937 | Correcto |
| ckpt-750 | 0,2666 | 0,3949 | 0,6317 | Seleccionado |
| ckpt-1000 | 0,2588 | 0,3694 | 0,6043 | Correcto |
| ckpt-1250 | 0,2568 | 0,3957 | 0,6263 | Correcto |
| ckpt-1500 | 0,2641 | 0,3814 | 0,6214 | Saturación tardía |

El checkpoint 750 se elige porque la similitud estilística DINOv2 sube de 0,1865 (base) a 0,3949 (+111 %) manteniendo el CLIP Content Score más alto entre los checkpoints entrenados (0,2666), con una similitud de vecino más cercano de 0,6317, por debajo del umbral de sobreajuste que el autor sitúa en 0,88. Cabe señalar que el CLIP Content Score del modelo entrenado es inferior al del SDXL base (0,2666 frente a 0,2961), es decir, el estilo se gana a costa de cierta adherencia literal al prompt.

## Requisitos de hardware

- VRAM para inferencia: el adaptador ocupa ~178 MB en fp16, pero requiere cargar el pipeline SDXL completo. En fp16, el UNet de SDXL ronda los 5 GB y el pipeline completo con VAE y codificadores de texto se sitúa en torno a 7 GB; con `enable_model_cpu_offload` puede ejecutarse con bastante menos, a costa de latencia.
- GPU de entrenamiento reportada: una única Nvidia Tesla T4 de 16 GB (Kaggle), con Adam de 8 bits y checkpointing de gradientes.
- GPU recomendadas: A100/H100 para servicio de alto rendimiento con varias instancias; L40S, RTX 4090 o RTX 4080 para inferencia interactiva; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 como mínimo cómodo en consumo.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 12 GB o más sin trucos; en tarjetas de 8 GB es necesario fp16 con offloading a CPU o variantes cuantizadas del UNet base (no publicadas con este LoRA).
- Opciones de despliegue: Diffusers (ruta oficial documentada), ComfyUI, AUTOMATIC1111/Forge, InvokeAI, SD.Next, Hugging Face Spaces (existe una demo del autor) y endpoints gestionados tipo Replicate. No se documentan exportaciones a ONNX ni TensorRT.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia por paso ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raju-ai/sdxl-mithila-lora | SDXL 1.0 | LoRA rango 32, solo UNet | ~178 MB | CreativeML OpenRAIL-M | Hugging Face + Space de demo |
| Mithila XL (Modest Tiger) | SDXL 1.0 | LoRA de estilo Mithila | No disponible | No disponible | Tensor.Art |
| SDXL 1.0 base | — | Modelo completo | ~6,9 GB en fp16 | CreativeML OpenRAIL-M | Hugging Face |
| ralux3/sdxl-lora | SDXL | LoRA genérico | No disponible | No disponible | Hugging Face |

La comparación directa con otros LoRA de Mithila no es posible con los datos disponibles: el LoRA de Tensor.Art no publica especificaciones, métricas ni licencia en la información consultada, y los LoRA genéricos de SDXL no son comparables en tarea. La ventaja documentada de este adaptador frente al SDXL base es la similitud estilística DINOv2 (+111 %), a cambio de una ligera pérdida de adherencia al prompt.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido (30 imágenes): la cobertura de motivos, paletas y composiciones es limitada, y es probable que el modelo reproduzca esquemas recurrentes del dataset.
- Riesgo de memorización: la similitud máxima de vecino más cercano es 0,6317, por debajo del umbral de 0,88 que maneja el autor, pero no es despreciable en un corpus de 30 obras; conviene revisar visualmente los resultados antes de publicarlos.
- Las obras de origen son de artistas identificables (Karpuri Devi, Sita Devi, Anamana Devi, Ukha Devi) y proceden de colecciones con licencias CC-BY/CC-BY-SA y Open Access. La licencia del adaptador no sustituye la atribución de las obras originales ni resuelve posibles derechos de autor sobre composiciones concretas; el arte folclórico tradicional puede además estar sujeto a protecciones colectivas o de patrimonio cultural.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con las restricciones de uso del anexo (prohibición de usos ilícitos, dañinos o de vigilancia), exige incluir la licencia en la redistribución y no es una licencia de código abierto aprobada por la OSI. No se especifican cláusulas adicionales por parte del autor.
- Sesgos: no se documenta ningún análisis. El estilo Mithila tiene convenciones de representación de género, casta y divinidades; el modelo puede reforzar estereotipos o producir exotización de la cultura de origen si se usa sin criterio curatorial.
- Idioma: el trigger y los prompts de referencia están en inglés, y los codificadores CLIP de SDXL están dominados por ese idioma; no hay evidencia de buen rendimiento con prompts en castellano u otros idiomas.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y sin issues ni discusiones públicas que permitan contrastar la calidad percibida.
- Sin datos sobre compatibilidad con ControlNet, Refiner, SDXL Turbo/Lightning o merges con otros checkpoints; su uso en esos pipelines requiere validación propia.
- Metadatos del repositorio con fecha de creación 2026-10-29, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repo antes de integrarlo.
- No se publican tiempos de inferencia ni evaluaciones de calidad fuera de la rejilla de 6 prompts del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raju-ai/sdxl-mithila-lora
- Demo (Hugging Face Space): https://huggingface.co/spaces/raju-ai/sdxl-mithila-lora-demo
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE fp16-fix recomendado: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Fuente de datos citada, Wikimedia Commons: https://commons.wikimedia.org
- Fuente de datos citada, Victoria and Albert Museum: https://www.vam.ac.uk
- LoRA de estilo Mithila alternativo en Tensor.Art (sin especificaciones publicadas): https://tensor.art/models/735119546022640945
