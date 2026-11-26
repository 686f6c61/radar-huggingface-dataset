# mradermacher/Persistent-Exploration-Qwen3VLi-i1-GGUF

## Resumen

Persistent-Exploration-Qwen3VLi es un modelo multimodal de 8.190.735.360 parámetros (aproximadamente 8,2 mil millones) afinado mediante aprendizaje por refuerzo para tareas de búsqueda visual y razonamiento visual con uso de herramientas. Está construido sobre la familia Qwen3-VL (la variante "VLi" del nombre sugiere una base Qwen3-VL, aunque la model card no detalla el checkpoint exacto de partida) y ha sido desarrollado por el usuario gsarch, con datos de RL publicados en el dataset `gsarch/Persistent-Exploration-RL-Data`.

La ficha que nos ocupa corresponde a la versión cuantizada en GGUF publicada por mradermacher, un conocido cuantizador de la comunidad que distribuye pesos en múltiples formatos (IQ1 a Q6_K) generados con imatrix. El modelo base destaca por su orientación a "persistent exploration": un paradigma de razonamiento visual en el que el modelo interactúa repetidamente con herramientas de búsqueda o percepción visual antes de emitir una respuesta, en lugar de resolver la tarea en un único paso.

Es relevante ahora porque combina tres tendencias activas en IA open source: modelos multimodales de tamaño medio aptos para hardware de consumo, entrenamiento con RL para uso de herramientas, y distribución en GGUF para inferencia local eficiente. No obstante, la información pública es escasa: la model card del cuantizador no incluye benchmarks, licencia ni detalles de entrenamiento, y el modelo base tiene un perfil de uso muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3-VL, según nomenclatura del modelo base); detalles no disponibles |
| Parametros totales | 8.190.735.360 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (i1/imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base original en safetensors |
| Tamano del repo | 96,4 GB |
| Modelo base | gsarch/Persistent-Exploration-Qwen3VLi |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo multimodal con capacidades de visión (la model card indica explícitamente "This is a vision model" y remite a los ficheros mmproj en el repositorio estático). Por la nomenclatura del modelo base (Qwen3VLi) y el tamaño de 8,2 mil millones de parámetros, es razonable inferir que se apoya en la familia Qwen3-VL, pero el autor no confirma el checkpoint exacto ni la configuración de capas, atención o proyección visual.

En cuanto al entrenamiento, la model card solo indica que se trata de un modelo afinado mediante reinforcement learning sobre el dataset `gsarch/Persistent-Exploration-RL-Data`, orientado a "persistent exploration", búsqueda visual y uso de herramientas. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases previas de SFT, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La cuantización ha sido realizada por mradermacher con imatrix (pesos ponderados), lo que suele mejorar la calidad de los quants de baja precisión respecto a los estáticos.

## Capacidades

- Generación de texto conversacional en inglés (pipeline declarado: reinforcement-learning, con soporte de formato conversacional).
- Razonamiento visual multimodal: interpretación de imágenes y razonamiento sobre contenido visual.
- Búsqueda visual (visual-search): localización e identificación de elementos en imágenes.
- Uso de herramientas (tool-use): el modelo está entrenado para invocar herramientas durante el razonamiento.
- Exploración persistente (persistent exploration): capacidad de iterar sobre observaciones visuales antes de responder, en lugar de un único paso de inferencia.
- Razonamiento multi-paso orientado a tareas visuales.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de audio, thinking mode explícito ni function calling genérico más allá del tool-use visual.

## Casos de uso

- Búsqueda visual en catálogos de producto: el modelo puede recibir una imagen y localizar o describir elementos concretos mediante iteraciones de exploración, útil en comercio electrónico para etiquetado y búsqueda por imagen.
- Automatización de inspección visual de documentos: análisis de capturas, formularios o diagramas donde el modelo explora regiones de la imagen de forma iterativa para extraer información, aprovechando su entrenamiento en persistent exploration.
- Asistentes de accesibilidad: descripción detallada y guiada de imágenes para usuarios con discapacidad visual, con capacidad de responder preguntas de seguimiento sobre zonas concretas de la imagen.
- Agentes de automatización de interfaz gráfica: el modelo puede interpretar capturas de pantalla y razonar sobre elementos de UI para tareas de test automatizado o RPA, apoyándose en su capacidad de tool-use visual.
- Análisis de imágenes técnicas o científicas: localización de componentes en fotografías de equipos o diagramas, con razonamiento multi-paso sobre las regiones relevantes.
- Prototipado local de pipelines multimodales: gracias a los quants GGUF de 2,2 a 6,0 GB, permite experimentar con razonamiento visual en hardware de consumo sin depender de APIs, útil para investigación y pruebas de concepto.
- Moderación de contenido visual: clasificación y descripción de imágenes con contexto, aprovechando la exploración iterativa para reducir falsos positivos en casos ambiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto ni proyección visual):
  - i1-IQ1_S: ~2,2 GB
  - i1-IQ2_M: ~3,2 GB
  - i1-IQ3_M: ~4,0 GB
  - i1-Q4_K_M: ~5,1 GB
  - i1-Q5_K_M: ~6,0 GB
  - i1-Q6_K: ~6,7 GB (estimado a partir del tamaño del repo y la escala de quants)
- Añadir margen para el contexto KV y el proyector multimodal (mmproj, alojado en el repositorio estático): entre 1 y 3 GB adicionales según longitud de contexto y resolución de imagen.
- GPU recomendadas: para los quants Q4/Q5, una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4090 permiten ejecución cómoda; para Q6_K o contexto largo, se recomienda 16 GB o más. En entornos de servidor, A100 o H100 no son necesarias para este tamaño, pero ofrecen mayor throughput.
- Cabe en GPU de consumo: sí, desde GPUs de 6-8 GB con quants IQ2/IQ3 (calidad reducida) hasta 12-16 GB con Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, text-generation-webui) para GGUF; los ficheros mmproj del repositorio estático son necesarios para la parte visual. vLLM y TGI requerirían los pesos originales en safetensors del modelo base.
- Latencia y throughput: no disponibles; dependen del hardware y del número de iteraciones de exploración que realice el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Persistent-Exploration-Qwen3VLi (este) | 8,2 B | no disponible | Texto + visión | no disponible | GGUF, safetensors |
| Qwen2.5-VL-7B (referencia de la familia) | 7 B aprox. | 32k aprox. (según variante) | Texto + visión | Apache 2.0 (variantes) | safetensors, GGUF |
| Llama 3.2 11B Vision | 11 B | 128k | Texto + visión | Llama Community License | safetensors, GGUF |
| InternVL2.5-8B | 8 B aprox. | variable | Texto + visión | MIT (variantes) | safetensors, GGUF |

Nota: los datos de los modelos comparables son orientativos y pueden variar según la variante concreta; no se dispone de benchmarks del modelo evaluado para comparar rendimiento de forma rigurosa. La comparativa se limita a parámetros, modalidad y licencia.

## Limitaciones y advertencias

- Información pública muy escasa: no hay benchmarks, licencia declarada ni detalles de entrenamiento, lo que dificulta evaluar su calidad y su viabilidad en producción.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor del modelo base (gsarch) antes de cualquier despliegue comercial.
- Entrenado y declarado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos, potencialmente amplificado en tareas visuales ambiguas o imágenes de baja calidad.
- El paradigma de "persistent exploration" puede incrementar la latencia al requerir múltiples iteraciones de razonamiento y llamadas a herramientas.
- Los quants de muy baja precisión (IQ1, IQ2) degradan notablemente la calidad; la propia model card los etiqueta como "for the desperate" o "mostly desperate".
- El repositorio es grande (96,4 GB) por incluir todos los quants; conviene descargar solo el fichero necesario.
- Para la parte visual es imprescindible descargar los ficheros mmproj del repositorio estático; el repositorio i1 no los incluye.
- Modelo con 0 descargas y 1 like en el momento de la consulta: sin validación comunitaria significativa.
- No se documentan sesgos específicos, pero al derivar de un modelo base generalista es probable que herede sesgos de sus datos de preentrenamiento.

## Enlaces

- Repositorio GGUF i1 (este modelo): https://huggingface.co/mradermacher/Persistent-Exploration-Qwen3VLi-i1-GGUF
- Repositorio GGUF estático (incluye mmproj): https://huggingface.co/mradermacher/Persistent-Exploration-Qwen3VLi-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Persistent-Exploration-Qwen3VLi-i1-GGUF
- Modelo base: https://huggingface.co/gsarch/Persistent-Exploration-Qwen3VLi
- Dataset de RL: https://huggingface.co/datasets/gsarch/Persistent-Exploration-RL-Data
- Ejemplo de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
