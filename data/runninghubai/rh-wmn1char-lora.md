# RunningHubAI/rh-wmn1char-lora

## Resumen

rh-wmn1char-lora es un adaptador LoRA de text-to-image publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje, sino de un ajuste fino de bajo rango (Low-Rank Adaptation) pensado para inyectar un concepto concreto —una identidad femenina etiquetada con la palabra de activación `wmn1char`— en un modelo base de difusión identificado en la model card como Z-image-turbo. El repositorio contiene un único archivo de pesos de aproximadamente 81 MiB, lo que es coherente con un LoRA y no con un modelo completo.

Su relevancia es acotada y muy específica: sirve para flujos de generación de imágenes fotorrealistas en ComfyUI y en la plataforma RunningHub, con instrucciones explícitas del autor para mantener una estética de "fotografía de móvil real" (textura de piel natural, imperfecciones leves, sin suavizado excesivo). La model card documenta seis niveles de encuadre (desde plano general hasta primerísimo plano) para verificar la consistencia de la identidad a distintas escalas, lo que indica que el LoRA está orientado a la coherencia de personaje.

No hay información pública sobre el conjunto de datos de entrenamiento, hiperparámetros, licencia ni resultados cuantitativos. El repositorio registra cero descargas y cero likes en el momento de la consulta, y su fecha de creación indicada es 2026-11-21.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image; modelo base indicado: Z-image-turbo |
| Parámetros totales | no disponible (el archivo de pesos ocupa 81 MiB, propio de un adaptador LoRA) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de prompting de la model card están en chino) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors (`women_1_lora_wmn1char_v1.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas de un modelo de difusión preentrenado para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es Z-image-turbo, un modelo de generación de imágenes por difusión. El tamaño del repositorio (0,1 GB) y del archivo de pesos (81 MiB) confirman que se distribuye únicamente el adaptador, no el modelo completo.

No se dispone de información sobre el número de pasos de entrenamiento, el tamaño o la composición del dataset, la resolución de entrenamiento, el rango del LoRA, la tasa de aprendizaje ni si se aplicaron técnicas adicionales. La model card sí revela una decisión de diseño relevante: el autor indica que el modelo base "no acepta prompts negativos", por lo que las restricciones de calidad (textura de piel natural, imperfecciones leves, sin suavizado excesivo, sin texto, sin marca de agua, sin distorsiones) deben incorporarse al prompt positivo. También se documenta que la precisión del tipo de plano se controla mediante la fórmula "encuadre hasta XX" en el prompt, y que las relaciones de aspecto 768×1344 y 1344×768 favorecen respectivamente planos cercanos y planos generales.

## Capacidades

- Generación de imágenes fotorrealistas de una identidad femenina concreta mediante la palabra de activación `wmn1char`.
- Coherencia de personaje a través de distintos niveles de encuadre: plano general, plano entero, plano medio, plano cercano, primer plano y primerísimo plano (detalle de ojo y ceja).
- Reproducción de estética de fotografía de móvil: luz natural, textura de piel con imperfecciones leves y ausencia de suavizado artificial.
- Control del encuadre mediante lenguaje natural en el prompt ("encuadre hasta la cintura", "encuadre hasta los hombros", etc.).
- Integración en flujos de ComfyUI y en la plataforma RunningHub, incluyendo su API.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje; no es un modelo multimodal de texto.

## Casos de uso

- Creación de personajes consistentes para narrativa visual: usar `wmn1char` junto con variaciones de encuadre para generar un conjunto de imágenes del mismo personaje en escenas distintas, manteniendo el parecido facial entre planos generales y primeros planos.
- Pruebas de estabilidad de un LoRA antes de publicarlo: la propia model card propone una batería de seis prompts (del plano general al primerísimo plano) que sirve como protocolo de evaluación cualitativa de coherencia de identidad.
- Generación de material para redes sociales con estética de foto casual: los prompts de café, parque o interior doméstico producen imágenes con apariencia de fotografía espontánea de móvil, útiles para contenido de estilo lifestyle.
- Prototipado rápido en ComfyUI: al ser un safetensors de 81 MiB, se puede cargar y descargar rápidamente en un grafo de ComfyUI para iterar sobre prompts sin reentrenar nada.
- Automatización vía API de RunningHub: integración del flujo de generación en un pipeline externo que llame a la API para producir imágenes bajo demanda.
- Investigación sobre control de encuadre en modelos de difusión: el LoRA permite estudiar cómo responde el modelo base a instrucciones de tipo de plano y qué relación de aspecto conviene para cada uno.
- Generación de referencias para artistas o diseñadores: obtener variaciones de un mismo rostro en distintos contextos de iluminación y distancia como material de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud de identidad, etc.) ni comparaciones numéricas con otros LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este adaptador en concreto; depende enteramente del modelo base Z-image-turbo, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el LoRA en sí ocupa solo 81 MiB, pero el modelo base debe caber en memoria.
- Opciones de despliegue: ComfyUI (plataforma indicada por el autor), la plataforma RunningHub y su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de identidad comparables ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El LoRA está entrenado para generar una identidad de mujer joven de Asia Oriental, lo que restringe su rango demográfico de salida.
- Riesgo de alucinación: no aplica en el sentido de texto; en imagen, el riesgo es la deriva de identidad y la aparición de artefactos anatómicos (manos, extremidades) o de texto y marcas de agua no deseados, que el autor intenta mitigar incluyendo restricciones en el prompt positivo.
- Limitaciones de encuadre: la coherencia del rostro puede degradarse en planos generales, donde el personaje ocupa poca superficie de la imagen; el autor recomienda verificar precisamente esos casos.
- Dependencia del prompt positivo: el modelo base no acepta prompts negativos según la model card, por lo que las restricciones de calidad deben repetirse en cada prompt.
- Licencia: no disponible. La model card indica que los derechos permanecen con el autor y remite a la licencia del proyecto original o del modelo base; antes de un uso comercial es imprescindible verificar la licencia de Z-image-turbo y contactar con el autor.
- Madurez: cero descargas y cero likes, sin documentación de entrenamiento ni evaluación cuantitativa; no es un artefacto validado por la comunidad.
- Idiomas: la documentación de prompting está en chino; no se declaran idiomas soportados para el texto de los prompts.
- Fecha de creación indicada en el repositorio: 2026-11-21, posterior a la fecha habitual de consulta; conviene verificar la vigencia de los metadatos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-wmn1char-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2116414259046477826
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/2005999197210001409
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
