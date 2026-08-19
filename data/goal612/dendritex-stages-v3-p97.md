# goal612/dendritex-stages-v3-p97

## Resumen

El modelo `goal612/dendritex-stages-v3-p97` es un modelo multimodal de tipo imagen-texto a texto, desarrollado por el usuario goal612 y publicado en HuggingFace con acceso restringido (gated). Según las etiquetas asociadas, emplea una arquitectura basada en Qwen3.5 con mezcla de expertos (MoE), lo que sugiere un diseño orientado a eficiencia computacional y escalabilidad. El modelo cuenta con aproximadamente 35.950 millones de parámetros totales y un tamaño de repositorio de 71,9 GB, lo que indica pesos en precisión media (probablemente fp16 o bf16). Su licencia Apache 2.0 permite uso comercial y modificación, aunque el acceso restringido obliga a aceptar condiciones adicionales antes de la descarga.

La relevancia de este modelo radica en su naturaleza multimodal (procesa imágenes y texto) combinada con una arquitectura MoE, una tendencia actual en modelos de gran escala que busca reducir el coste de inferencia manteniendo capacidades amplias. Sin embargo, al ser un modelo reciente (creado en agosto de 2026) y con escasa documentación pública, su adopción en producción requiere una evaluación cuidadosa de sus capacidades reales y limitaciones, que aún no han sido publicadas de forma detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en Qwen3.5 (según tags) |
| Parametros totales | 35.951.822.704 (~35,95 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. Las etiquetas indican `qwen3_5_moe`, lo que sugiere una variante de la familia Qwen3.5 con mezcla de expertos (MoE). En una arquitectura MoE típica, solo una fracción de los parámetros se activa por token, lo que permite reducir el coste computacional durante la inferencia. Sin embargo, no se dispone de datos sobre el número de expertos, la estrategia de enrutamiento, ni los detalles de entrenamiento como el volumen de tokens, la composición del dataset o si se aplicaron técnicas de alineación (RLHF, DPO). El pipeline `image-text-to-text` confirma que el modelo acepta tanto imágenes como texto como entrada y genera texto, pero se desconocen los detalles del codificador visual o el mecanismo de fusión multimodal.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que está diseñado para diálogos multi-turno.
- Comprensión de imágenes: al ser `image-text-to-text`, puede procesar imágenes como entrada y responder con texto (por ejemplo, descripción, respuesta a preguntas visuales).
- Soporte de tool calling: no disponible en la información pública.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no se han documentado modos de razonamiento extendido, audio u otras modalidades.

## Casos de uso

- Asistente visual para documentación técnica: el modelo podría describir diagramas, capturas de pantalla o esquemas, ayudando a desarrolladores a entender documentación visual. Su naturaleza multimodal permite procesar imágenes de arquitecturas o flujos.
- Moderación de contenido en redes sociales: análisis de imágenes y texto para detectar contenido inapropiado, aunque se requiere validación previa de su rendimiento en esta tarea.
- Generación de descripciones accesibles: creación de textos alternativos (alt text) para imágenes en sitios web, mejorando la accesibilidad.
- Soporte en atención al cliente con envío de capturas: los usuarios podrían adjuntar imágenes de errores o pantallas y el modelo ayudaría a diagnosticar problemas, siempre que se verifique su precisión.
- Extracción de información de facturas o recibos: procesamiento de imágenes de documentos para extraer datos estructurados, aunque se necesita confirmar su capacidad OCR.
- Asistente educativo multimodal: explicación de figuras, gráficos o fotografías en entornos de aprendizaje, con la salvedad de que su conocimiento y precisión no están verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con ~35,95 B parámetros y un tamaño de repo de 71,9 GB, se asume que los pesos están en fp16 (2 bytes por parámetro). La inferencia en precisión fp16 requeriría al menos 72 GB de VRAM para cargar todos los pesos, más memoria para activaciones y KV cache. Si se aplicara cuantización a 8 bits, la VRAM bajaría a ~36 GB, y a 4 bits a ~18 GB, pero no se dispone de archivos cuantizados oficiales.
- GPU recomendadas: para carga completa en fp16 se necesitaría una GPU con 80 GB (A100, H100) o varias GPUs en paralelo. Para cuantización 8 bits, una RTX 4090 (24 GB) no sería suficiente; se requeriría una A6000 (48 GB) o similar. Con cuantización 4 bits podría caber en una RTX 4090, pero no hay confirmación de compatibilidad.
- Si cabe en consumer GPU: no es viable en GPU de consumo (16-24 GB) sin cuantización agresiva y aun así podría ser ajustado.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI o llama.cpp si se convierten los pesos a GGUF. Sin embargo, al ser multimodal, se necesitaría el procesador de imágenes correspondiente, lo que complica el despliegue en motores ligeros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con modelos de la misma categoría (MoE multimodal). Se podría mencionar que existen modelos como Qwen-VL-MoE o Mixtral-8x7B (solo texto), pero no se tienen datos de rendimiento de este modelo para comparar. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que requiere aceptar condiciones específicas en HuggingFace antes de su uso, lo que puede limitar su adopción.
- Documentación insuficiente: no se han publicado detalles sobre arquitectura, entrenamiento, datos, idiomas o rendimiento, lo que dificulta evaluar su idoneidad para tareas concretas.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje, puede generar información falsa o reflejar sesgos presentes en sus datos de entrenamiento, pero al desconocer estos datos no se puede cuantificar el riesgo.
- Compatibilidad y formato: solo se ofrecen pesos en safetensors; no hay versiones cuantizadas ni conversiones a GGUF, lo que limita su despliegue en entornos con recursos reducidos.
- Fecha de creación futura: el modelo está fechado en 2026, lo que sugiere que es muy reciente y no ha sido ampliamente probado por la comunidad.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el acceso gated puede imponer condiciones adicionales que deben revisarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/goal612/dendritex-stages-v3-p97
- Perfil del autor: https://huggingface.co/goal612 (inferido, no confirmado)
- Organización Dendritex: https://huggingface.co/Dendritex (aparece en resultados de búsqueda, pero no se confirma relación con este modelo)
