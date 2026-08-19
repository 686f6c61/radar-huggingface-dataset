# gurumurthy3/gpt2vl-stackformer-v2

## Resumen

El modelo `gurumurthy3/gpt2vl-stackformer-v2` es un sistema de generación de descripciones de imágenes (image captioning) construido combinando un backbone de lenguaje GPT-2 pequeño con un codificador visual CLIP ViT-B/16, ambos congelados, y un adaptador entrenable basado en un Perceiver Resampler y atención cruzada con compuerta tanh. El autor, gurumurthy3, lo presenta como una implementación "from scratch" sobre una librería propia llamada Stackformer, inspirada en el diseño de Flamingo para conectar visión y lenguaje.

El modelo resuelve el problema de describir automáticamente el contenido de una imagen con una arquitectura ligera y eficiente: solo se entrenan los módulos adaptadores (resampler y bloques de atención cruzada), lo que reduce drásticamente el coste de entrenamiento y permite reutilizar dos modelos preentrenados potentes. Con un tamaño de repositorio de 0.3 GB (solo los pesos entrenables), es adecuado para entornos con recursos limitados y para despliegue en GPU de consumo.

La relevancia actual radica en su enfoque modular y reproducible, que demuestra cómo combinar componentes existentes (GPT-2 y CLIP) con un mecanismo de compresión visual (Perceiver) para lograr una tarea multimodal sin necesidad de entrenar un modelo completo desde cero. Aunque no se publican métricas cuantitativas en la información disponible, la arquitectura sigue líneas probadas en la literatura (Flamingo, Llama 3.2-Vision) y está pensada para servir como base educativa o para prototipos rápidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 small (frozen) + CLIP ViT-B/16 (frozen) + Perceiver Resampler + cross-attention gated en capas 3, 7 y 11 |
| Parametros totales | No disponible (estimación: ~210M combinando GPT-2 small y CLIP ViT-B/16, más adaptadores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens de texto (ventana GPT-2) + 64 tokens visuales comprimidos |
| Tipos de cuantizacion | No disponible (pesos en float32, con autocast fp16 en GPU) |
| Idiomas soportados | No disponible (entrenado en captions en inglés de COCO, sin confirmación oficial) |
| Licencia | MIT |
| Formato de pesos | Safetensors (model_trainable.safetensors) + config.json |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida visión-lenguaje. La imagen se procesa con un codificador CLIP ViT-B/16 congelado, que produce una secuencia de tokens de parche (CLS + 196 parches de 768 dimensiones). Esta secuencia se pasa a un Perceiver Resampler de 3 capas y 8 cabezas, que la comprime en 64 tokens visuales fijos mediante atención cruzada iterativa. A continuación, estos tokens se inyectan en el backbone de texto GPT-2 small (12 capas, 12 cabezas, 768 dimensiones) en las capas 3, 7 y 11, mediante bloques de atención cruzada con compuerta `tanh(alpha)` inicializada a cero. Esta inicialización garantiza que al inicio del entrenamiento el modelo se comporte como un GPT-2 puro, y gradualmente aprenda a atender a la información visual.

El entrenamiento se realiza sobre el dataset `AKCIT/coco2017-captioning`, que proporciona 5 referencias de caption por imagen. Solo se actualizan los parámetros de los módulos `resampler.*` y `cross_blocks.*`; el resto de pesos permanecen congelados. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un entrenamiento supervisado estándar de generación de texto condicionado a imagen. La precisión de entrenamiento es float32 con autocast a fp16 para las multiplicaciones matriciales en GPU.

## Capacidades

- Generación de descripciones de imágenes (image captioning) en inglés, produciendo una frase corta que describe el contenido visual.
- Comprensión de imágenes mediante el codificador CLIP, que captura información semántica y espacial de los parches.
- Uso de un mecanismo de compresión visual (Perceiver Resampler) que reduce la secuencia de tokens visuales a 64, permitiendo una inyección eficiente en el modelo de lenguaje.
- Atención cruzada con compuerta adaptativa, que modula la influencia de la imagen en las capas profundas del transformer.
- Generación determinista mediante decodificación greedy (por defecto) o muestreo estocástico con temperatura, top-k y top-p (configurable en la interfaz Gradio).
- No soporta tool calling, agentes ni razonamiento multi-paso; su función se limita a la tarea de captioning.

## Casos de uso

- Accesibilidad web: generar automáticamente atributos `alt` descriptivos para imágenes en sitios web, mejorando la experiencia de usuarios con discapacidad visual. El modelo puede ejecutarse en servidores ligeros y procesar imágenes bajo demanda.
- Organización de bibliotecas de imágenes: etiquetar y clasificar colecciones de fotos personales o corporativas, generando descripciones que faciliten la búsqueda posterior por texto.
- Generación de metadatos para SEO: crear descripciones de productos o contenido visual para tiendas online, mejorando el posicionamiento en buscadores y la indexación de imágenes.
- Asistentes de redes sociales: sugerir pies de foto o descripciones automáticas para publicaciones en plataformas como Instagram o Twitter, ahorrando tiempo a gestores de contenido.
- Automatización de documentación técnica: describir capturas de pantalla, diagramas o figuras en manuales y guías, reduciendo el trabajo manual de redacción.
- Prototipado de sistemas multimodales: servir como componente base para experimentos académicos o pruebas de concepto en investigación de visión y lenguaje, gracias a su licencia MIT y su arquitectura modular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona métricas BLEU y METEOR, pero no proporciona valores numéricos ni comparaciones con otros modelos. Por tanto, no es posible evaluar cuantitativamente su rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo (GPT-2 + CLIP + adaptadores) tiene aproximadamente 210M de parámetros. En fp16, la memoria de pesos ronda los 420 MB; con activaciones y overhead, se recomienda al menos 2-4 GB de VRAM para inferencia en lote pequeño.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4060, o superiores (A100, H100 para despliegue en producción). También puede ejecutarse en CPU para inferencia lenta.
- Cabe en GPU de consumo: sí, siempre que se utilice fp16 o cuantización (aunque no se proporcionan versiones cuantizadas oficiales).
- Opciones de despliegue: la interfaz Gradio incluida (`app.py`) permite ejecutar el modelo localmente con `python app.py`. No se mencionan integraciones con vLLM, llama.cpp u otros servidores de inferencia optimizados.
- Latencia y throughput: no disponibles. Dado el tamaño pequeño, se espera una latencia de decenas a cientos de milisegundos por imagen en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a características arquitectónicas y de disponibilidad.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt2vl-stackformer-v2 | GPT-2 + CLIP + Perceiver | ~210M (estimado) | 128 tokens texto + 64 visuales | MIT | HuggingFace |
| BLIP-base | ViT + BERT + decoder | ~232M | 512 tokens | MIT | HuggingFace |
| GIT-base | Transformer encoder-decoder | ~174M | 512 tokens | MIT | HuggingFace |
| OFA-base | Transformer encoder-decoder | ~180M | 512 tokens | MIT | HuggingFace |

La principal diferencia es que `gpt2vl-stackformer-v2` usa un enfoque de adaptadores congelados, mientras que BLIP, GIT y OFA entrenan el modelo completo. Esto reduce el coste de entrenamiento pero puede limitar la capacidad de adaptación a dominios específicos.

## Limitaciones y advertencias

- Sesgos conocidos: entrenado exclusivamente en el dataset COCO, que contiene principalmente imágenes de escenas cotidianas y objetos comunes. Puede tener un rendimiento deficiente en imágenes de dominios especializados (médicas, industriales, artísticas) o con conceptos poco representados.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones plausibles pero incorrectas, especialmente en imágenes ambiguas o con objetos raros.
- Limitaciones de contexto: la ventana de texto es de solo 128 tokens, suficiente para captions cortos pero inadecuada para tareas que requieran razonamiento textual largo.
- Limitaciones de idioma: no se confirma soporte multilingüe; el entrenamiento en COCO sugiere que solo genera inglés.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero los pesos de GPT-2 y CLIP provienen de OpenAI (MIT) y del proyecto CLIP (MIT), por lo que no hay restricciones adicionales conocidas.
- Caveat de producción: el modelo no incluye mecanismos de control de sesgos ni filtros de contenido; en aplicaciones públicas se recomienda validar las salidas antes de su uso.
- Inconsistencia de versiones: la model card se refiere al modelo como "V3" aunque el identificador del repositorio es `v2`; se recomienda verificar la versión exacta antes de integrarlo.

## Enlaces

- [HuggingFace - gurumurthy3/gpt2vl-stackformer-v2](https://huggingface.co/gurumurthy3/gpt2vl-stackformer-v2)
- [Dataset AKCIT/coco2017-captioning](https://huggingface.co/datasets/AKCIT/coco2017-captioning)
- [Paper de Flamingo (arXiv:2204.14198)](https://arxiv.org/abs/2204.14198)
- [GPT-2 (OpenAI)](https://openai.com/research/better-language-models)
- [CLIP (OpenAI)](https://github.com/openai/CLIP)
