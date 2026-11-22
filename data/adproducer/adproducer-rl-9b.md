# AdProducer/AdProducer-RL-9B

## Resumen

AdProducer-RL-9B es un modelo multimodal de tipo image-text-to-text desarrollado por AdProducer como parte del trabajo *AdProducer: Towards Agentic Advertising Video Generation*. Se trata del checkpoint final de una política de agente entrenada para convertir un brief creativo breve en un storyboard visual anclado al producto: el modelo descubre y verifica información real del producto, recupera referencias visuales oficiales y construye un guion plano a plano que después alimenta a un generador de vídeo congelado (MiniMax H3). El modelo parte de Qwen3.5-9B, recibe un arranque en frío supervisado (AdProducer-SFT-9B) y se entrena después con aprendizaje por refuerzo agéntico (GRPO) sobre 1.000 briefs intensivos en búsqueda.

Con 9.409.813.744 parámetros totales y un repositorio de 18,8 GB en safetensors, el modelo se distribuye bajo licencia Apache 2.0 y es compatible con endpoints OpenAI. Su relevancia actual radica en que aborda un problema concreto de la generación de vídeo publicitario: la fidelidad del producto (forma, colores, logotipo) y de los datos en pantalla, que los generadores de vídeo directos suelen degradar. Los storyboards producidos por AdProducer mejoran la precisión de producto, la precisión informativa, la expresión de selling points, el diseño de planos y la calidad visual, y son transferibles a otros generadores de vídeo sin reentrenamiento.

El checkpoint publicado corresponde a la iteración 47 del run de RL. El modelo piensa y llama a una herramienta por ronda (`search`, `image_search`, `browse`), con un máximo de 8 llamadas y 2 búsquedas de imagen, y responde con un prompt multi-plano de referencia-a-vídeo para MiniMax H3 citando las imágenes de referencia seleccionadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (configuración de servicio indicada por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Modelo base | AdProducer/AdProducer-SFT-9B (finetune) |
| Dataset de entrenamiento | AdProducer/AdProducer-Train-Data |
| Compatibilidad | endpoints_compatible (API compatible con OpenAI) |
| Tamano del repositorio | 18,8 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-9B, un transformer multimodal capaz de procesar entradas de imagen y texto. El pipeline de entrenamiento tiene dos fases: primero un arranque en frío supervisado que da lugar a AdProducer-SFT-9B, y después un entrenamiento con aprendizaje por refuerzo agéntico mediante GRPO sobre 1.000 briefs intensivos en búsqueda. La recompensa combina una recompensa de vídeo (Gemini 3.1 Pro evalúa el vídeo MiniMax H3 renderizado a partir del storyboard generado por la política) y una recompensa de texto. El checkpoint publicado es la iteración 47 del run de RL.

La innovación técnica principal es el bucle agéntico de recuperación de información: en cada ronda el modelo razona y ejecuta una única herramienta (`search`, `image_search` o `browse`), con un límite de 8 llamadas y 2 búsquedas de imagen, y finalmente emite un prompt multi-plano de referencia-a-vídeo para MiniMax H3 que cita explícitamente las imágenes de referencia seleccionadas. El generador de vídeo permanece congelado durante todo el proceso, de modo que el aprendizaje se concentra en la política que produce el storyboard. No se dispone de datos sobre el número exacto de tokens de entrenamiento ni sobre la composición detallada del dataset más allá del identificador AdProducer/AdProducer-Train-Data.

## Capacidades

- Generación de texto y razonamiento multimodal sobre entradas de imagen y texto.
- Comprensión de imágenes: verificación de producto, forma, colores y logotipo a partir de referencias visuales.
- Tool calling / function calling con tres herramientas integradas: `search`, `image_search` y `browse`.
- Razonamiento agéntico multi-paso con límite de 8 llamadas a herramientas y 2 búsquedas de imagen por episodio.
- Descubrimiento y verificación de información real de producto a partir de un brief creativo.
- Recuperación de referencias visuales oficiales del producto.
- Generación de storyboards multi-plano en formato de prompt de referencia-a-vídeo para MiniMax H3, citando las imágenes de referencia seleccionadas.
- Transferencia de storyboards a otros generadores de vídeo sin reentrenamiento.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Generación automática de anuncios en vídeo a partir de una URL de producto: el modelo recibe el enlace, busca y verifica información del producto, recupera referencias visuales oficiales y produce un storyboard que un generador de vídeo congelado convierte en anuncio. Es el flujo principal para el que fue entrenado.
- Publicidad con fidelidad de producto garantizada: en sectores donde la forma, el color o el logotipo son críticos (moda, electrónica, alimentación), el modelo verifica las referencias visuales antes de escribir el storyboard, reduciendo errores de representación del producto.
- Generación de contenido con datos verificados en pantalla: el bucle de búsqueda y navegación permite citar especificaciones y hechos correctos, adecuado para anuncios con claims técnicos o comparativas de producto.
- Producción de storyboards para equipos creativos: el modelo genera guiones plano a plano con referencias visuales citadas, que pueden revisarse y editarse antes de pasar al generador de vídeo, integrándose en flujos de aprobación humana.
- Automatización de campañas a escala en agencias y marketplaces: con compatibilidad de endpoints OpenAI y despliegue vía sglang, permite procesar lotes de briefs de forma programática dentro de pipelines existentes.
- Evaluación y benchmarking de generadores de vídeo: los storyboards producidos sirven como entrada controlada y reproducible para comparar distintos generadores de vídeo sin reentrenar la política, útil en investigación sobre generación de vídeo publicitario.
- Investigación en RL agéntico: el checkpoint, el dataset, el código de entrenamiento y AdCreation-Bench (305 briefs en ocho dominios) permiten reproducir y extender el entrenamiento con GRPO y recompensas basadas en modelos evaluadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona AdCreation-Bench (305 briefs publicitarios en ocho dominios) como conjunto de evaluación, pero no incluye cifras de rendimiento en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9.409.813.744 parámetros, en precisión completa (fp16/bf16) se requieren aproximadamente 18,8 GB solo para los pesos, más memoria para el contexto de hasta 65.536 tokens y el procesamiento de imágenes.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo encaja en GPU de 24 GB o más en cuantizaciones de 8 bits, y requiere GPU de 40-80 GB (A100, H100) para fp16 con contexto largo.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) con cuantización, aunque no hay confirmación oficial ni formatos GGUF publicados.
- Opciones de despliegue: el autor indica sglang como servidor utilizado (`python -m sglang.launch_server --model-path AdProducer/AdProducer-RL-9B --served-model-name adproducer --context-length 65536`), y cualquier servidor compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdProducer-RL-9B | 9,41 B | 65.536 | Storyboard publicitario agéntico image-text-to-text | Apache 2.0 | Hugging Face, código y dataset publicados |
| AdProducer-SFT-9B | no disponible | no disponible | Storyboard publicitario (fase SFT previa al RL) | no disponible | Hugging Face |
| Qwen3.5-9B | ~9 B | no disponible | Modelo base multimodal | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en generación de storyboards publicitarios; su uso fuera de ese dominio no está validado.
- El bucle agéntico está limitado a 8 llamadas a herramientas y 2 búsquedas de imagen por episodio, lo que puede ser insuficiente para productos con información dispersa o poco documentada.
- Depende de servicios externos de búsqueda y navegación; la calidad del storyboard está condicionada por la disponibilidad y calidad de esos servicios.
- El entrenamiento con RL utiliza Gemini 3.1 Pro como juez de vídeo y MiniMax H3 como generador; posibles sesgos o preferencias de esos modelos pueden haberse transferido a la política.
- Riesgo de alucinación en hechos de producto si la búsqueda no recupera fuentes fiables; el propio diseño del modelo intenta mitigarlo con verificación, pero no lo elimina.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe uniforme.
- No se han publicado benchmarks oficiales, por lo que el rendimiento relativo frente a alternativas no está cuantificado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo cita el paper como anónimo y pendiente de publicación; conviene revisar los términos finales cuando se publique.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdProducer/AdProducer-RL-9B
- Modelo SFT base: https://huggingface.co/AdProducer/AdProducer-SFT-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/AdProducer/AdProducer-Train-Data
- Página del proyecto: https://lky-ang.github.io/AdProducer-page/
- Código: https://github.com/lky-ang/AdProducer
- Paper: pendiente de publicación (no disponible)
