# AdProducer/AdProducer-SFT-9B

## Resumen

AdProducer-SFT-9B es un ajuste fino supervisado (SFT) de Qwen3.5-9B, desarrollado por AdProducer como punto de partida del pipeline de entrenamiento por refuerzo que dio lugar a AdProducer-RL-9B. El modelo forma parte del trabajo *AdProducer: Towards Agentic Advertising Video Generation*, cuyo objetivo es convertir un brief creativo corto en una historia visual anclada al producto: descubre y verifica información real del producto, recupera referencias visuales oficiales y construye un storyboard plano a plano que un generador de vídeo congelado convierte después en vídeo publicitario.

La relevancia del modelo reside en su enfoque agéntico aplicado a la publicidad: frente a enviar el brief directamente al generador de vídeo, los storyboards intermedios de AdProducer mejoran la precisión del producto (forma, colores, logotipo correctos), la precisión de la información (datos y especificaciones en pantalla), la expresión de los puntos de venta, el diseño de planos y la calidad visual. El modelo es multimodal (entrada de imagen y texto, pipeline `image-text-to-text`) y se distribuye con licencia Apache 2.0, junto con los datos de entrenamiento, el código y el benchmark AdCreation-Bench (305 briefs publicitarios en ocho dominios).

El checkpoint es un ajuste fino de parámetros completos sobre Qwen3.5-9B con la torre de visión congelada, entrenado durante 2 épocas sobre 3.710 trayectorias agénticas con ms-swift. El repositorio ocupa 18,8 GB en formato safetensors; el recuento de parámetros declarado en los metadatos de safetensors (1.469.680) es inconsistente con el nombre del modelo y el tamaño del repositorio, por lo que debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-9B, pipeline image-text-to-text); detalles internos del transformer no disponibles |
| Parametros totales | 9B según el nombre del modelo; los metadatos de safetensors declaran 1.469.680 (dato inconsistente, tratar con cautela) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos de Qwen3.5-9B, un modelo multimodal que procesa entradas de imagen y texto y genera texto (pipeline `image-text-to-text`). La torre de visión permanece congelada durante el entrenamiento. El ajuste se realizó con ms-swift sobre 3.710 trayectorias agénticas durante 2 épocas; el repositorio incluye el fichero `args.json` con la configuración completa de ms-swift y `trainer_state.json` con el registro de entrenamiento, y los detalles de comando, datos y enmascaramiento de pérdida están en el directorio `training/sft/` del repositorio de GitHub.

El modelo se presenta como el checkpoint de arranque en frío de la etapa de RL que produjo AdProducer-RL-9B. No se especifican en la información disponible la composición del dataset de entrenamiento (más allá de su identificador `AdProducer/AdProducer-Train-Data`), el número de tokens, ni si se aplicaron técnicas como RLHF o DPO en esta fase. Tampoco se detallan innovaciones de arquitectura propias más allá del flujo agéntico de descubrimiento y verificación de producto, recuperación de referencias visuales y generación de storyboards.

## Capacidades

- Generación de texto multimodal: recibe imágenes y texto y produce texto estructurado (storyboards publicitarios plano a plano).
- Comportamiento agéntico: descubre y verifica información real del producto y recupera referencias visuales oficiales como parte del flujo de trabajo.
- Construcción de storyboards: genera descripciones detalladas por plano que preservan la fidelidad del producto (forma, colores, logotipo) y la exactitud de la información en pantalla.
- Expresión de puntos de venta: integra las características diferenciales del producto en la narrativa visual.
- Transferencia a generadores de vídeo: los storyboards producidos se pueden usar con otros generadores de vídeo sin reentrenar.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo de razonamiento (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Generación de storyboards publicitarios: a partir de un brief creativo corto, el modelo produce una secuencia de planos con indicaciones visuales detalladas que un generador de vídeo puede convertir en anuncio, mejorando la fidelidad al producto frente a enviar el brief directamente al generador.
- Verificación de información de producto: el flujo agéntico permite descubrir y contrastar especificaciones reales del producto antes de incorporarlas al guion, reduciendo datos incorrectos en pantalla.
- Recuperación de referencias visuales oficiales: el modelo localiza imágenes de referencia del producto para que el storyboard respete forma, colores y logotipo.
- Publicidad multicanal y por dominio: con AdCreation-Bench cubriendo ocho dominios, el modelo puede adaptar el enfoque creativo a categorías de producto distintas dentro de un mismo pipeline.
- Prototipado rápido de campañas: equipos creativos pueden generar múltiples variantes de storyboard en minutos y evaluarlas antes de comprometer recursos de producción de vídeo.
- Evaluación y benchmarking de agentes publicitarios: el checkpoint sirve como referencia base para comparar modelos SFT frente a RL en tareas de generación de anuncios.
- Investigación en agentes multimodales: al liberarse datos, código y benchmark, es útil para estudiar el paso de SFT a RL en tareas agénticas con verificación de información externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona el benchmark AdCreation-Bench (305 briefs en ocho dominios) como parte de la release, pero no incluye cifras de rendimiento del modelo en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo de 9B en precisión completa (BF16) se requieren aproximadamente 18 GB solo para pesos, más memoria para activaciones y caché KV; el repositorio ocupa 18,8 GB en safetensors, lo que es coherente con este orden de magnitud.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de 9B en BF16 encaja en GPU de 24 GB o más (RTX 4090, A100 40 GB, H100) con margen variable según la longitud de contexto.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) en BF16 con contexto moderado; en cuantizaciones de 8 o 4 bits podría caber en GPU de 16 GB o menos, aunque no se han publicado cuantizaciones oficiales.
- Opciones de despliegue: la librería declarada es transformers; no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI. El autor remite al repositorio de GitHub para instrucciones de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| AdProducer-SFT-9B | 9B (según nombre) | no disponible | imagen-texto-a-texto | Apache 2.0 | Checkpoint SFT del pipeline AdProducer |
| AdProducer-RL-9B | 9B (según nombre) | no disponible | imagen-texto-a-texto | no disponible en la información | Versión tras RL del mismo pipeline; sucesor directo |
| Qwen3.5-9B | 9B | no disponible | multimodal | no disponible en la información | Modelo base sobre el que se ajusta AdProducer-SFT-9B |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El recuento de parámetros de los metadatos de safetensors (1.469.680) no es coherente con el nombre del modelo ni con el tamaño del repositorio (18,8 GB); conviene verificar los pesos antes de usarlos en producción.
- No se documentan sesgos conocidos, pero al ser un ajuste fino orientado a publicidad, puede heredar sesgos del modelo base y del dataset de entrenamiento.
- Riesgo de alucinación: aunque el flujo agéntico incluye verificación de información del producto, no se han publicado métricas de fiabilidad que cuantifiquen este riesgo.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe más allá del que herede del modelo base.
- Longitud de contexto no especificada, lo que dificulta planificar casos de uso con briefs o historiales largos.
- Licencia Apache 2.0 permite uso comercial, pero debe revisarse también la licencia del modelo base Qwen3.5-9B, no detallada en esta información.
- El modelo está diseñado como checkpoint intermedio del pipeline SFT→RL; para producción probablemente sea preferible AdProducer-RL-9B, aunque no se aportan comparativas de rendimiento.
- El paper está anunciado como "coming soon" y la autoría figura como anónima, lo que limita la trazabilidad académica del trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdProducer/AdProducer-SFT-9B
- Modelo RL sucesor: https://huggingface.co/AdProducer/AdProducer-RL-9B
- Página del proyecto: https://lky-ang.github.io/AdProducer-page/
- Código: https://github.com/lky-ang/AdProducer
- Dataset de entrenamiento: https://huggingface.co/datasets/AdProducer/AdProducer-Train-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper: anunciado como "coming soon" (no disponible)
