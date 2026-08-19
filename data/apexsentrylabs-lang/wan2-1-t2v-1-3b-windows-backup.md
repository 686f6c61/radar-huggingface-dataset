# apexsentrylabs-lang/Wan2.1-T2V-1.3B-Windows-Backup

## Resumen

Wan2.1-T2V-1.3B es un modelo de generación de vídeo a partir de texto desarrollado por el equipo Wan-AI de Alibaba, dentro de la familia Wan2.1 de modelos de vídeo de código abierto. Este repositorio concreto (`apexsentrylabs-lang/Wan2.1-T2V-1.3B-Windows-Backup`) es una copia de respaldo del modelo original, publicada por un usuario independiente, con los mismos pesos y licencia Apache 2.0. El modelo está diseñado para ejecutarse en GPUs de consumo, requiriendo solo 8.19 GB de VRAM, y es capaz de generar vídeos de 5 segundos a resolución 480P en una RTX 4090 en aproximadamente 4 minutos sin técnicas de optimización adicionales.

La arquitectura se basa en un modelo de difusión para vídeo, acompañado de un VAE propio (Wan-VAE) que codifica y decodifica vídeo de alta resolución preservando información temporal. El modelo soporta generación de texto visual tanto en chino como en inglés, una característica poco común en modelos de vídeo. Con 1.418.996.800 parámetros, se posiciona como una alternativa ligera y accesible frente a los modelos de 14B de la misma familia, manteniendo un rendimiento competitivo para tareas de texto a vídeo.

La relevancia actual de este modelo radica en su capacidad para democratizar la generación de vídeo con IA, permitiendo su uso en hardware asequible. Aunque el repo original de Wan-AI es la fuente canónica, esta copia de respaldo garantiza disponibilidad adicional para la comunidad, especialmente en entornos Windows, tal como sugiere el nombre del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (arquitectura interna no especificada) |
| Parametros totales | 1.418.996.800 (1.3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (aplica a tokens de texto de entrada, no especificado) |
| Tipos de cuantizacion | No especificados (pesos en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se detalla en la documentación proporcionada, pero se sabe que es un modelo de difusión para generación de vídeo. Incluye un VAE propio denominado Wan-VAE, que destaca por su eficiencia y capacidad para codificar y decodificar vídeo 1080P de cualquier duración preservando información temporal, lo que lo convierte en una base sólida para tareas de generación de vídeo e imagen. El modelo T2V-1.3B es la variante más ligera de la familia Wan2.1, diseñada específicamente para funcionar en GPUs de consumo.

No se han publicado detalles sobre el proceso de entrenamiento, como el número de tokens de vídeo utilizados, la composición del dataset o si se emplearon técnicas de RLHF o DPO. La model card menciona que el modelo soporta múltiples tareas (texto a vídeo, imagen a vídeo, edición de vídeo, texto a imagen y vídeo a audio), aunque este repositorio se centra en la tarea de texto a vídeo. El modelo es capaz de generar texto visual tanto en chino como en inglés, una innovación técnica destacable que mejora su aplicabilidad práctica.

## Capacidades

- Generación de vídeo a partir de prompts de texto, produciendo clips de 5 segundos a resolución 480P (y 720P con menor estabilidad).
- Generación de texto visual integrado en el vídeo, tanto en chino como en inglés, siendo el primer modelo de vídeo con esta capacidad.
- Compatibilidad con GPUs de consumo: requiere solo 8.19 GB de VRAM, lo que lo hace accesible para la mayoría de hardware doméstico.
- Soporte para múltiples resoluciones (480P recomendada, 720P experimental).
- Integración con el ecosistema diffusers y disponibilidad de pesos en formato safetensors.
- Capacidad de procesar vídeo de alta resolución (1080P) mediante su VAE, aunque la generación se limita a resoluciones menores.

## Casos de uso

- Creación de contenido para redes sociales: generar clips cortos de 5 segundos para plataformas como TikTok, Instagram Reels o YouTube Shorts, a partir de descripciones textuales, sin necesidad de equipos de renderizado costosos.
- Prototipado de animaciones y storyboards: los diseñadores pueden generar rápidamente vídeos conceptuales a partir de guiones escritos, facilitando la comunicación de ideas en equipos creativos.
- Generación de material educativo: crear vídeos explicativos breves sobre conceptos científicos, históricos o técnicos, a partir de prompts descriptivos, para uso en aulas o cursos online.
- Producción de vídeos publicitarios de bajo coste: pequeñas empresas pueden generar anuncios de producto con texto visual en chino o inglés, aprovechando la capacidad de generación de texto del modelo.
- Investigación académica en generación de vídeo: servir como modelo base ligero para estudiar técnicas de difusión, evaluación de calidad de vídeo o fine-tuning en dominios específicos, gracias a su licencia abierta y bajo requisito de hardware.
- Automatización de contenido para marketing: integrar el modelo en pipelines de generación de vídeo para campañas de email o web, donde se necesitan múltiples variantes de un mismo mensaje visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que Wan2.1 supera a modelos open-source y soluciones comerciales en varios benchmarks, pero no proporciona cifras concretas. Tampoco se incluyen comparativas numéricas con otros modelos de generación de vídeo. Por tanto, no es posible presentar una tabla de rendimiento verificable.

## Requisitos de hardware

- VRAM estimada: 8.19 GB para inferencia estándar (según la model card).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A100 (aunque no es necesaria).
- Compatibilidad con GPUs de consumo: sí, es uno de los principales objetivos del modelo.
- Opciones de despliegue: el repositorio oficial proporciona código de inferencia multi-GPU, soporte para Gradio demo y está pendiente la integración con diffusers y ComfyUI. Se puede ejecutar con PyTorch >= 2.4.0.
- Latencia y throughput: en una RTX 4090, genera un vídeo de 5 segundos a 480P en aproximadamente 4 minutos sin optimizaciones (cuantización, etc.). Con técnicas de optimización el tiempo podría reducirse, pero no se especifican cifras.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables con otros modelos de generación de vídeo de tamaño similar, como CogVideoX, Open-Sora o ModelScope T2V. La model card afirma superioridad sobre alternativas open-source, pero no ofrece métricas concretas. Por tanto, no es posible realizar una comparativa cuantitativa fiable. Se recomienda consultar los benchmarks publicados por la organización Wan-AI en su documentación oficial para obtener datos actualizados.

## Limitaciones y advertencias

- La generación a 720P es menos estable que a 480P debido a limitaciones en el entrenamiento a esa resolución; se recomienda usar 480P para resultados óptimos.
- El modelo es de 1.3B parámetros, por lo que la calidad de vídeo puede ser inferior a la de modelos de mayor tamaño (como el T2V-14B de la misma familia), especialmente en escenas complejas o con movimiento rápido.
- Riesgo de alucinación en el texto visual generado: aunque el modelo es capaz de generar texto en chino e inglés, puede producir caracteres incorrectos o incoherentes, especialmente en prompts largos o ambiguos.
- No se especifican sesgos conocidos, pero al ser entrenado con datos mayoritariamente en inglés y chino, puede presentar sesgos culturales o lingüísticos en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la organización Wan-AI para posibles restricciones adicionales sobre el uso de los modelos generados.
- Este repositorio es una copia de respaldo no oficial; para uso en producción se recomienda utilizar el repositorio original de Wan-AI para garantizar la integridad y actualización de los pesos.

## Enlaces

- Repositorio HuggingFace de esta copia: https://huggingface.co/apexsentrylabs-lang/Wan2.1-T2V-1.3B-Windows-Backup
- Repositorio original en HuggingFace: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- GitHub oficial de Wan2.1: https://github.com/Wan-Video/Wan2.1
- Página de la organización Wan-AI en HuggingFace: https://huggingface.co/Wan-AI/
- ModelScope (modelos de Wan-AI): https://modelscope.cn/organization/Wan-AI
- Blog de Wan: https://wanxai.com
- Discord de Wan: https://discord.gg/p5XbdQV7
