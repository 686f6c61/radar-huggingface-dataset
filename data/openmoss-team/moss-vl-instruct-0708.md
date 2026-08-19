# OpenMOSS-Team/MOSS-VL-Instruct-0708

## Resumen

MOSS-VL-Instruct-0708 es un modelo de lenguaje y visión (vision-language) de código abierto desarrollado por el equipo OpenMOSS, dentro de la familia MOSS-VL. Se trata del checkpoint ajustado por instrucciones (SFT) sobre la base MOSS-VL-Base-0708, y está diseñado para comprensión de imágenes, vídeo largo y razonamiento multimodal offline. El modelo resuelve el problema de la comprensión temporal y espacial en vídeo, permitiendo tareas como reconocimiento de acciones, localización de eventos a nivel de segundo y razonamiento sobre el orden y duración de los eventos.

Con 11.336 millones de parámetros y una ventana de contexto de 256K tokens, MOSS-VL-Instruct-0708 emplea una arquitectura basada en cross-attention que desacopla la codificación visual del razonamiento lingüístico. Su relevancia actual radica en ser una alternativa abierta (licencia Apache 2.0) para tareas de vídeo de formato largo, un área donde pocos modelos de peso abierto ofrecen capacidades comparables. El modelo soporta inglés y chino, y se distribuye en formato safetensors con pesos BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cross-attention (visión-lenguaje) |
| Parametros totales | 11.336.371.208 (~11B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | BF16 (no se documentan cuantizaciones adicionales) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MOSS-VL-Instruct-0708 utiliza una arquitectura de cross-attention que separa la codificación visual del razonamiento de lenguaje. Los tokens de texto y los parches visuales se proyectan en un espacio tridimensional unificado mediante Cross-attention Rotary Position Embedding (XRoPE), con coordenadas de tiempo (t), altura (h) y anchura (w). Esto proporciona una representación posicional consistente para imágenes y vídeos. Para entradas de vídeo, el modelo inyecta marcas de tiempo absolutas junto a los fotogramas muestreados, lo que permite razonar sobre el orden de eventos, duración y localización temporal en lugar de depender únicamente del orden de los fotogramas.

El checkpoint se obtiene mediante supervisión fina (SFT) sobre MOSS-VL-Base-0708, actualizando la receta de instrucciones para uso multimodal offline. Los detalles sobre el dataset de entrenamiento (número de tokens, composición, fases de RLHF/DPO) no se especifican en la documentación disponible. La configuración clave incluye un tamaño de parche visual de 16, parche temporal de 1, FPS por defecto de 1.0 y un máximo de 256 fotogramas por vídeo. El modelo requiere `trust_remote_code=True` al cargarse con Transformers, dado que usa código personalizado.

## Capacidades

- Comprensión de imágenes: descripción, reconocimiento visual de detalle fino y razonamiento visual.
- OCR y análisis de documentos: extracción de texto y comprensión de documentos escaneados o digitales.
- Comprensión de vídeo largo: razonamiento temporal, reconocimiento de acciones y localización de eventos a nivel de segundo.
- Seguimiento de instrucciones multimodales: alineación mediante SFT para tareas combinadas de imagen, vídeo y texto.
- Razonamiento multimodal: integra información visual y textual para responder preguntas complejas.
- Capacidades multilingües: soporte nativo para inglés y chino.
- Procesamiento por lotes offline: permite inferencia por lotes sobre imágenes y vídeos independientes mediante `offline_batch_generate`.

## Casos de uso

- Análisis forense de vídeo: el modelo puede localizar eventos específicos en grabaciones de larga duración (por ejemplo, cámaras de seguridad) gracias a su ventana de 256K tokens y las marcas de tiempo absolutas, identificando acciones y su orden cronológico.
- Transcripción y resumen de vídeos educativos o de conferencias: procesa vídeos de hasta 256 fotogramas a 1 FPS, generando resúmenes estructurados con referencia temporal a los segmentos clave.
- Automatización de control de calidad en manufactura: inspección visual de imágenes de productos para detectar defectos o anomalías, apoyándose en la capacidad de OCR para leer etiquetas o códigos.
- Extracción de datos de documentos escaneados: convierte facturas, contratos o formularios en texto estructurado mediante OCR y comprensión de documentos, útil en flujos de digitalización empresarial.
- Asistente de accesibilidad para contenido audiovisual: genera descripciones detalladas de vídeos para personas con discapacidad visual, incluyendo acciones, transiciones y eventos temporales.
- Moderación de contenido en plataformas de vídeo: analiza vídeos largos para detectar acciones inapropiadas o contenido sensible, con capacidad de señalar el instante exacto donde ocurre el evento.
- Investigación académica en visión por computador: sirve como modelo base para fine-tuning en tareas específicas de vídeo-comprensión, dado que se publica junto al checkpoint base para continuación de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación indica que las tablas de rendimiento para la release 0708 se mantendrán en los recursos del proyecto MOSS-VL, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 22,7 GB en BF16, por lo que se estima un uso de memoria similar durante la carga del modelo en precisión BF16. Con cuantización a 8 bits podría reducirse a ~11-12 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: se requiere una GPU con al menos 24 GB de VRAM para inferencia en BF16 sin offload (por ejemplo, RTX 3090, RTX 4090, A100 40GB). Para ventanas de contexto largas (256K), se recomienda una GPU profesional como A100 80GB o H100.
- Compatibilidad con GPU de consumo: es posible ejecutar el modelo en una RTX 4090 (24 GB) con BF16, pero la ventana de contexto máxima estará limitada por la memoria disponible.
- Opciones de despliegue: la documentación oficial muestra carga mediante Transformers con `trust_remote_code=True` y `attn_implementation="flash_attention_2"`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no se proporcionan datos oficiales. La inferencia con vídeo depende del número de fotogramas (máximo 256) y del parámetro `vision_chunked_length=64`, que procesa la visión en fragmentos para limitar el uso de memoria.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos alternativos de la misma categoría. La documentación menciona el checkpoint anterior MOSS-VL-Instruct-0408 como referencia interna, pero no se ofrecen datos comparativos de rendimiento ni especificaciones de otros modelos de vídeo-lenguaje como Video-LLaVA o Qwen-VL. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo está optimizado para comprensión multimodal offline general; vídeos muy densos, dominios altamente especializados y OCR de texto pequeño pueden requerir prompting específico, ajuste de muestreo o fine-tuning adicional.
- Tareas que exigen razonamiento numérico estricto o razonamiento de código pueden presentar limitaciones; el equipo declara estar trabajando en mejorar estas capacidades.
- Los idiomas soportados se limitan a inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- El modelo requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código personalizado del autor; se recomienda auditar el código antes de usarlo en entornos de producción.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real en tareas estándar no puede verificarse de forma independiente.
- Al ser un modelo de 11B parámetros, el coste de inferencia y la huella de memoria son significativos; no es adecuado para despliegue en dispositivos de baja capacidad sin cuantización adicional.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de atribución y las posibles patentes asociadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0708
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-VL
- Página del proyecto OpenMOSS: https://openmoss.ai/MOSS-VL/moss-vl.html
- Informe técnico (arXiv): https://arxiv.org/pdf/2608.15045
- Checkpoint anterior: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Instruct-0408
