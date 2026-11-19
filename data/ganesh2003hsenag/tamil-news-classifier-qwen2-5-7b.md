# Ganesh2003hsenag/tamil-news-classifier-qwen2.5-7b

## Resumen

Tamil News Classifier es un ajuste fino supervisado del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario Ganesh2003hsenag, orientado a la clasificación temática de noticias regionales de Tamil Nadu en publicaciones en tamil e inglés. El modelo parte de la base instructiva de Qwen y se ha adaptado mediante LoRA de 4 bits con la librería Unsloth sobre Google Colab, para después cuantizarse a formato GGUF Q4_K_M y distribuirse para su uso con Ollama o llama.cpp.

El problema que aborda es concreto: la categorización automática de noticias locales en una taxonomía jerárquica de siete grandes dominios (política estatal, nacional e internacional, infraestructura cívica, medio ambiente y desastres, accidentes, crimen y justicia, y entretenimiento), con más de cincuenta etiquetas específicas documentadas en la model card del autor. Es relevante para medios regionales, agregadores de noticias y sistemas de monitorización que necesitan enrutar contenido en tamil con precisión temática.

El modelo conserva la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales y una ventana de contexto heredada del modelo base (32.768 tokens según la documentación de Qwen2.5, aunque no se explicita en la información proporcionada). Se distribuye bajo licencia Apache 2.0 en un repositorio de 4,7 GB que contiene pesos GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada de Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | Tamil (ta), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 4,7 GB); safetensors declarados en metadatos del Hub |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only denso Qwen2.5-7B-Instruct, que emplea atención con RoPE, normalización RMSNorm y activaciones SwiGLU, con 28 capas y dimensión oculta de 3584 en su configuración original (datos del modelo base, no verificados en esta ficha). El ajuste se realizó con LoRA de 4 bits mediante Unsloth sobre Google Colab, una configuración típica para adaptaciones de bajo coste con recursos limitados. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO adicionales.

La innovación principal no es arquitectónica sino de dominio: la definición de una taxonomía jerárquica de noticias de Tamil Nadu con etiquetas bilingües (tamil e inglés) que el modelo aprende a asignar. La conversión a GGUF Q4_K_M con runtime Ollama/llama.cpp indica que el autor prioriza el despliegue ligero en CPU o GPU de gama media frente a la inferencia en precisión completa.

## Capacidades

- Clasificación de noticias en tamil e inglés dentro de una taxonomía de siete dominios y más de cincuenta subcategorías (política, infraestructura, medio ambiente, accidentes, crimen, entretenimiento, asuntos nacionales e internacionales).
- Generación de texto conversacional heredada de Qwen2.5-7B-Instruct, aunque el ajuste está orientado a la tarea de clasificación.
- Comprensión de titulares y cuerpos de noticia en tamil, incluyendo terminología administrativa y política regional (TASMAC, TNEB, CMRL, DVAC, etc.).
- Soporte bilingüe tamil-inglés en la misma taxonomía, lo que permite clasificar publicaciones de medios en ambos idiomas con etiquetas consistentes.
- Capacidad de tool calling y function calling heredada del modelo base, no verificada tras el ajuste fino.
- Modo de razonamiento multi-paso y agentes: no documentado en la información proporcionada.
- Capacidades de visión, audio o thinking mode: no disponibles en este modelo.

## Casos de uso

- Agregadores de noticias regionales: el modelo puede etiquetar automáticamente miles de artículos diarios de medios tamiles en las categorías definidas, permitiendo construir secciones temáticas y sistemas de recomendación por interés del lector.
- Monitorización de medios para administraciones públicas: clasificar noticias sobre esquemas de bienestar, órdenes gubernamentales o protestas permite a gabinetes de comunicación detectar temas emergentes y hacer seguimiento de la opinión pública en tamil.
- Alertas de seguridad y emergencias: la taxonomía incluye categorías específicas de accidentes, desastres naturales, inundaciones y crimen, lo que permite enrutar noticias críticas a sistemas de alerta temprana o paneles de situación.
- Análisis de reputación de marcas y entidades políticas: al distinguir entre corrupción, fraude, crimen violento y política partidista, el modelo facilita la extracción de menciones negativas o positivas sobre figuras y organizaciones concretas.
- Moderación y curación de contenido en plataformas: la clasificación en categorías sensibles (delitos sexuales, narcóticos, cibercrimen) permite aplicar políticas de visibilidad o revisión humana según el tipo de noticia.
- Investigación en ciencias sociales y periodismo de datos: la asignación consistente de etiquetas a corpus históricos de noticias tamiles facilita estudios longitudinales sobre cobertura de temas como sequías, elecciones o infraestructura.
- Enrutamiento en asistentes conversacionales: el modelo puede actuar como clasificador previo en un pipeline RAG, decidiendo qué base de conocimiento o herramienta invocar según el tema de la consulta del usuario en tamil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con GGUF Q4_K_M: aproximadamente 4,5-5 GB para los pesos, más overhead de contexto; en la práctica, entre 6 y 8 GB de VRAM para ventanas de contexto moderadas.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10G, L4, A100 o H100 para despliegues de mayor concurrencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer con 8 GB o más de VRAM en cuantización Q4_K_M; en 6 GB puede requerir contextos reducidos.
- Opciones de despliegue: Ollama y llama.cpp son los runtimes documentados por el autor; también es viable servir el GGUF con llama-cpp-python o como backend en vLLM si se convierte a otro formato, aunque no está documentado.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la longitud de los artículos de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Tamil News Classifier (Qwen2.5-7B) | 7,6 B | No disponible (heredado del base) | ta, en | Apache 2.0 | GGUF Q4_K_M | Ajuste especifico para taxonomia de noticias de Tamil Nadu |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32.768 tokens (segun documentacion de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF | Modelo generalista; requiere prompting para clasificar noticias |
| Modelos de clasificacion tipo XLM-R large | ~0,56 B | 512 tokens | multilingue | MIT / CC-BY-NC | safetensors | Mucho mas pequeno y rapido, pero sin generacion ni razonamiento; requiere cabezal de clasificacion |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens (segun documentacion de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF | Alternativa mas ligera para clasificacion con prompting, menor calidad en tamil |

La comparativa con modelos específicos de clasificación de noticias en tamil no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está ajustado para una taxonomía cerrada y específica de Tamil Nadu; fuera de esas categorías o de otras regiones de la India, su precisión puede degradarse notablemente.
- No se han publicado métricas de evaluación (accuracy, F1, matriz de confusión) que permitan validar la calidad de la clasificación; el repositorio tiene cero descargas y cero likes, por lo que no hay evidencia de uso comunitario.
- Riesgo de alucinación inherente a los modelos generativos: si se usa en modo generación libre en lugar de clasificación restringida, puede producir etiquetas inexistentes o justificaciones incorrectas.
- El ajuste con LoRA de 4 bits sobre Google Colab sugiere un dataset de entrenamiento limitado en tamaño y diversidad; posible sobreajuste a los medios o estilos presentes en el corpus.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base Qwen2.5-7B-Instruct tiene sus propios términos que conviene revisar; la licencia Apache 2.0 del ajuste no exime de cumplir la del base.
- El soporte de tamil puede verse afectado por la tokenización del base Qwen2.5, que no está optimizada específicamente para escrituras dravídicas; la calidad en textos tamiles largos o con transliteraciones mixtas no está documentada.
- Solo se publica una cuantización Q4_K_M, lo que limita el equilibrio entre precisión y tamaño para despliegues que requieran mayor fidelidad numérica.
- No hay información sobre sesgos políticos, de casta o de género en la clasificación de noticias, un aspecto crítico en el contexto de medios regionales indios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ganesh2003hsenag/tamil-news-classifier-qwen2.5-7b
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (framework de ajuste): https://github.com/unslothai/unsloth
- Ollama (runtime de inferencia): https://ollama.com
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
