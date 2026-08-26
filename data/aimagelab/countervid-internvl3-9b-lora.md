# aimagelab/CounterVid-InternVL3-9B-LoRA

## Resumen

CounterVid-InternVL3-9B-LoRA es un modelo de lenguaje y visión (VLM) desarrollado por el laboratorio AImageLab de la Universidad de Módena y Reggio Emilia, en colaboración con Amazon Prime Video. Se trata de un ajuste fino del modelo base OpenGVLab/InternVL3-9B-Instruct, orientado a mitigar las alucinaciones en acciones y razonamiento temporal en tareas de comprensión de vídeo. El modelo se entrena con el dataset CounterVid, compuesto por 26 167 pares de preferencias visuales y textuales generados a partir de vídeos contrafactuales controlados, y utiliza un objetivo de optimización de preferencias (MixDPO / PaMi-VDPO) con anclas contrafactuales.

La arquitectura sigue el paradigma ViT-MLP-LLM, con un encoder de visión InternViT, un proyector MLP y un modelo de lenguaje de 9 000 millones de parámetros. El LoRA aplicado al LLM se ha fusionado con los pesos base antes de la liberación, por lo que no se requiere PEFT en inferencia. El modelo está pensado para investigación en comprensión de vídeo, con especial énfasis en el reconocimiento de acciones y el orden temporal, y hereda las capacidades multimodales generales del modelo base, incluyendo tool usage y razonamiento visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-MLP-LLM (InternViT + MLP projector + LLM) |
| Parametros totales | 9 138 793 472 (9,14 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en InternVL3-9B-Instruct, que sigue la arquitectura "ViT-MLP-LLM": un encoder de visión InternViT preentrenado incrementalmente, un proyector MLP inicializado aleatoriamente y un modelo de lenguaje (probablemente Qwen2.5-9B o InternLM3-8B, aunque no se especifica en la documentación disponible). El ajuste fino con CounterVid aplica un LoRA sobre el LLM, que se fusiona con los pesos base antes de la publicación, y entrena un nuevo proyector multimodal. El encoder de visión se mantiene congelado durante la optimización de preferencias.

El entrenamiento utiliza 26 167 pares de preferencias sintéticos generados a partir de vídeos contrafactuales, diseñados para corregir el sesgo hacia prioridades lingüísticas y forzar al modelo a atender a dinámicas visuales finas. El objetivo de optimización es MixDPO / PaMi-VDPO, una variante de DPO que combina preferencias textuales y visuales. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset más allá de los pares de preferencias.

## Capacidades

- Comprensión de vídeo: reconoce acciones, eventos y su orden temporal en secuencias de vídeo, con menor tendencia a alucinar comparado con el modelo base.
- Razonamiento multimodal: integra información visual y textual para responder preguntas sobre contenido de vídeo.
- Generación de descripciones: produce descripciones textuales de vídeos, incluyendo acciones y relaciones temporales.
- Tool usage y agentes: hereda las capacidades del modelo base InternVL3, que incluyen uso de herramientas y razonamiento multi-paso.
- Procesamiento de imágenes: al estar basado en InternVL3, también puede procesar imágenes estáticas, aunque el foco del ajuste es vídeo.
- Multilingüe: aunque la model card indica solo inglés, el modelo base InternVL3 soporta múltiples idiomas; el ajuste no restringe explícitamente el idioma, pero los datos de entrenamiento están en inglés.

## Casos de uso

- Análisis de vídeo de vigilancia: el modelo puede identificar acciones y su secuencia temporal en grabaciones de cámaras, ayudando a detectar comportamientos anómalos o eventos ordenados.
- Revisión de contenido audiovisual: moderación automática de vídeos generados por usuarios, verificando si las acciones mostradas coinciden con las descripciones textuales asociadas.
- Asistencia a personas con discapacidad visual: descripción de vídeos en tiempo real, indicando qué acciones ocurren y en qué orden, mejorando la accesibilidad.
- Investigación en visión por computador: como modelo de referencia para estudiar alucinaciones en VLMs y evaluar técnicas de mitigación basadas en contrafactuales.
- Generación de subtítulos para vídeo: producción de subtítulos descriptivos que reflejen con precisión las acciones y su cronología, útil para plataformas de streaming.
- Agentes de vídeo interactivos: integración en sistemas que responden preguntas sobre vídeos (por ejemplo, "¿qué hizo el usuario después de abrir la puerta?"), aprovechando el razonamiento temporal mejorado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de CounterVid (arXiv:2601.04778) podría contener evaluaciones, pero no se han extraído datos numéricos en esta ficha.

## Requisitos de hardware

- VRAM estimada: los pesos en BF16 ocupan aproximadamente 18,3 GB (9,14 B × 2 bytes). Con cuantización a 4 bits, el modelo podría caber en ~5-6 GB, aunque no se proporcionan versiones cuantizadas oficiales.
- GPU recomendadas: para inferencia en BF16 se necesitan GPUs con al menos 20 GB de VRAM, como A100 (40 GB), RTX 4090 (24 GB) o A6000 (48 GB). Con cuantización, podría ejecutarse en GPUs consumer de 8-12 GB (RTX 3080, RTX 4070).
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI o directamente con la API de transformers. Para entornos ligeros, se podría convertir a GGUF y usar llama.cpp u Ollama, aunque no hay conversiones oficiales.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 9B en BF16, se espera una latencia de decodificación de ~20-40 ms/token en una A100, dependiendo de la longitud de la secuencia y el batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| CounterVid-InternVL3-9B-LoRA | 9,14 B | No disponible | Video-language, mitigación de alucinaciones | MIT |
| OpenGVLab/InternVL3-9B-Instruct | 9 B | No disponible (probablemente 128K) | Multimodal general, tool usage | MIT (según base) |
| Qwen2-VL-7B-Instruct | 7,6 B | 128K | Multimodal, vídeo e imagen | Apache 2.0 |
| Video-LLaVA-7B | 7 B | 32K | Video-language, instrucción | MIT |

No se dispone de comparativas de rendimiento numéricas entre estos modelos en la información recopilada. La comparativa se limita a características generales.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación y puede producir respuestas incorrectas o sin fundamento, especialmente en escenarios no cubiertos por los datos de entrenamiento.
- Hereda los sesgos y limitaciones del modelo base InternVL3-9B-Instruct, incluyendo posibles sesgos culturales o de género en los datos de preentrenamiento.
- La licencia MIT permite uso comercial, pero se debe verificar la licencia del modelo base (InternVL3) y del dataset CounterVid, que pueden tener condiciones adicionales.
- El ajuste se centra en inglés; el rendimiento en otros idiomas puede degradarse.
- No se han publicado benchmarks independientes que validen la mejora sobre el base en tareas de vídeo; la eficacia debe evaluarse en cada caso de uso.
- El modelo requiere `trust_remote_code=True` al cargarlo, lo que implica ejecutar código personalizado del repositorio; se recomienda auditar el código antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/aimagelab/CounterVid-InternVL3-9B-LoRA
- Paper (arXiv): https://arxiv.org/abs/2601.04778
- Repositorio GitHub: https://github.com/aimagelab/CounterVid
- Página del proyecto: https://aimagelab.github.io/CounterVid/
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-9B-Instruct
- Dataset CounterVid: https://huggingface.co/datasets/aimagelab/CounterVid
