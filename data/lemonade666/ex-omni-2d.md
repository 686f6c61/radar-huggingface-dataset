# lemonade666/Ex-Omni-2D

## Resumen

Ex-Omni-2D es un modelo de diálogo omni-modal desarrollado por el grupo LOGO-CUHKSZ que extiende las capacidades de los modelos de diálogo multimodal con presencia visual nativa. A diferencia de los sistemas de diálogo omni-modal convencionales, que generan respuestas de texto y voz sin una representación visual del interlocutor, Ex-Omni-2D produce una respuesta coordinada que incluye texto, voz personalizada y vídeo sincronizado de un avatar, condicionado a una imagen de referencia y un clip de audio de referencia.

El modelo combina varios componentes base: Qwen3-8B como modelo de lenguaje principal, Wan2.1-T2V-1.3B para la generación de vídeo, Qwen3-0.6B para el tokenizador de voz y síntesis TTS, y Qwen3-TTS-Tokenizer-12Hz para la representación acústica. El checkpoint publicado en este repositorio corresponde al Teacher de secuencia completa; el Student causal no está incluido todavía. El peso total del modelo es de aproximadamente 11.180 millones de parámetros, distribuidos en 22,7 GB de ficheros safetensors.

La relevancia de este modelo reside en su enfoque innovador: utiliza unidades de voz multi-codebook como interfaz acústico-temporal compartida entre la síntesis de voz y la generación de vídeo, lo que permite sincronizar el habla con los movimientos labiales y faciales del avatar de forma natural. El paper asociado (arXiv:2608.10720) y el código de inferencia están disponibles públicamente, y la licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer omni-modal (texto, voz, vídeo) con componentes Qwen3-8B, Wan2.1-T2V-1.3B y Qwen3-TTS |
| Parametros totales | 11.178.017.856 (aproximadamente 11,18 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la documentacion publicada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (sharded) |

## Arquitectura y entrenamiento

Ex-Omni-2D es un marco de diálogo omni-modal que integra varios componentes preentrenados en una única pipeline de inferencia. El modelo de lenguaje principal es Qwen3-8B, que procesa las entradas multimodales y genera tanto el texto de respuesta como un plan estructurado denominado Visual Thought Plan (VTP). El VTP actúa como intermediario entre el lenguaje y la generación de vídeo, permitiendo que el modelo planifique qué contenido visual debe producir antes de sintetizarlo.

La síntesis de voz se apoya en Qwen3-TTS-Tokenizer-12Hz y Qwen3-TTS-12Hz-0.6B-Base, que convierten el texto en unidades de voz multi-codebook. Estas unidades forman una interfaz acústico-temporal compartida que se utiliza tanto para la generación de voz como para condicionar el generador de vídeo Wan2.1-T2V-1.3B, garantizando que los movimientos labiales y las expresiones faciales del avatar estén sincronizados con el audio generado. Además, el sistema incorpora Whisper-large-v3 para el reconocimiento de voz en las entradas y OmniAvatar-1.3B para el modelado del avatar.

El checkpoint publicado incluye el modelo completo de lenguaje, visión y voz en los ficheros `model-*.safetensors`, junto con un LoRA del generador de vídeo Teacher en `video_generator/teacher.safetensors`. El Student causal, que permitiría inferencia en tiempo real con decodificación autoregresiva, no se ha publicado todavía. Los detalles exactos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la documentación publicada.

## Capacidades

- Generación de diálogo multimodal coordinado: texto, voz personalizada y vídeo de avatar sincronizado en una única respuesta.
- Comprensión de entradas multimodales: texto, imágenes, audio y consultas combinadas.
- Síntesis de voz personalizada condicionada a un clip de audio de referencia, replicando timbre y estilo del hablante.
- Generación de vídeo reference-conditioned: produce un vídeo del avatar que imita los gestos y la expresión de la imagen de referencia.
- Planificación visual estructurada mediante el Visual Thought Plan (VTP), que organiza el contenido visual antes de generarlo.
- Sincronización labial y facial precisa entre el audio generado y el vídeo del avatar, gracias a la interfaz acústico-temporal compartida basada en unidades multi-codebook.
- Capacidades multilingües limitadas: la documentación indica únicamente soporte para inglés.
- No se documenta soporte explícito para tool calling, function calling ni razonamiento multi-paso orientado a agentes, aunque el modelo base Qwen3-8B sí incluye estas capacidades en su versión original.

## Casos de uso

- Asistentes virtuales con presencia visual: un asistente personal que no solo responde por voz, sino que muestra un avatar con expresiones faciales sincronizadas, útil en quioscos interactivos o aplicaciones de atención al cliente.
- Creación de contenido para educación: generar vídeos explicativos con un avatar que habla y gesticula de forma natural, partiendo de una imagen del presentador y un guion de texto.
- Doblaje y localización de vídeo: dado un vídeo original y una voz de referencia, el modelo puede producir una versión doblada con sincronización labial del avatar, reduciendo costes de producción audiovisual.
- Personajes virtuales para videojuegos o mundos virtuales: generar diálogos completos con voz y animación facial para NPCs, usando una imagen del personaje como referencia.
- Accesibilidad para personas con discapacidad auditiva o visual: combinar respuestas de texto, voz y vídeo en lenguaje de signos o con apoyo visual, mejorando la comprensión en entornos multiusuario.
- Prototipado rápido de interfaces conversacionales: los desarrolladores pueden integrar Ex-Omni-2D en pipelines de demostración para validar experiencias de usuario con avatares antes de invertir en producción de vídeo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2608.10720) no incluye en el resumen datos cuantitativos de rendimiento, y la model card no proporciona tablas comparativas con otros modelos. Se recomienda consultar el articulo completo en arXiv para obtener métricas detalladas si están disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero considerando que el modelo completo ocupa 22,7 GB en safetensors y que la pipeline requiere cargar además los componentes externos (Wan2.1-T2V-1.3B, Qwen3-VL-2B-Instruct, Whisper-large-v3, OmniAvatar-1.3B), se estima un consumo de al menos 30-40 GB de VRAM en FP16 para la inferencia completa.
- GPU recomendadas: no disponible en la documentación. Por el tamaño estimado, se necesitarían GPUs de clase profesional como A100 (40/80 GB), H100 (80 GB) o, en el caso de consumer, una RTX 4090 (24 GB) podría ser insuficiente para la pipeline completa, aunque podría ejecutar componentes por separado.
- No cabe en GPUs consumer de gama media (8-16 GB) para la inferencia completa; sería necesario cuantizar o ejecutar los componentes de forma secuencial y descargando pesos entre fases.
- Opciones de despliegue: el repositorio de inferencia oficial (LOGO-CUHKSZ/Ex-Omni-2D-Code) utiliza referencias `hf://` y descarga los pesos bajo demanda. No se mencionan integraciones con vLLM, TGI, llama.cpp u Ollama en la documentación publicada.
- Latencia y throughput: no disponibles. Dado que el checkpoint publicado es el Teacher de secuencia completa (no el Student causal), la inferencia probablemente no sea en tiempo real; el Student, cuando se publique, debería permitir decodificación autoregresiva más rápida.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos similares. Los sistemas de diálogo omni-modal comparables serían Ex-Omni (predecesor directo del mismo grupo) y modelos como Qwen2.5-Omni o Mini-Omni, pero no se han publicado resultados comparativos en la información disponible. A continuación se indican las diferencias estructurales conocidas:

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ex-Omni-2D (este) | 11,18 B | no disponible | texto, voz, vídeo | Apache-2.0 | pesos publicados |
| Ex-Omni (predecesor) | no disponible | no disponible | texto, voz | no disponible | pesos publicados |
| Qwen3-8B (base) | 8 B | 32K (original) | texto | Apache-2.0 | pesos publicados |

La comparativa con Ex-Omni es la más relevante: Ex-Omni-2D añade la generación de vídeo sincronizado, que Ex-Omni no ofrecía, y utiliza una interfaz acústico-temporal compartida entre voz y vídeo que es la principal innovación técnica.

## Limitaciones y advertencias

- El checkpoint publicado es el Teacher de secuencia completa, no el Student causal. Esto implica que la inferencia probablemente no sea adecuada para aplicaciones en tiempo real sin modificaciones adicionales.
- La pipeline de inferencia depende de múltiples componentes externos (Wan2.1-T2V-1.3B, Qwen3-VL-2B-Instruct, Whisper-large-v3, OmniAvatar-1.3B), lo que aumenta la complejidad de despliegue y el riesgo de incompatibilidades entre versiones.
- Solo se documenta soporte para inglés. El uso en otros idiomas puede degradar la calidad de la síntesis de voz y la sincronización labial.
- No se han publicado benchmarks cuantitativos, por lo que el rendimiento real en tareas estándar es desconocido.
- El modelo es un prototipo de investigación; no se mencionan evaluaciones de sesgos, robustez ni seguridad. Como cualquier modelo generativo, existe riesgo de alucinación y de generar contenido inapropiado.
- La generación de vídeo de avatares personalizados plantea riesgos de uso indebido (deepfakes, suplantación de identidad). Los desarrolladores deben considerar salvaguardas antes de desplegar el modelo en producción.
- El tamaño del repositorio (22,7 GB) y la necesidad de descargar pesos adicionales bajo demanda pueden suponer una barrera para entornos con ancho de banda limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lemonade666/Ex-Omni-2D
- Paper en arXiv: https://arxiv.org/abs/2608.10720
- Página del proyecto: https://logo-cuhksz.github.io/Ex-Omni-2D
- Código de inferencia en GitHub: https://github.com/LOGO-CUHKSZ/Ex-Omni-2D-Code
- Modelo predecesor Ex-Omni: https://huggingface.co/lemonade666/Ex-Omni
