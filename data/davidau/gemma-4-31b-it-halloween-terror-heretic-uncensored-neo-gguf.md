# DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-NEO-GGUF

## Resumen

El modelo `gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-NEO-GGUF` es un ajuste fino (fine-tune) del modelo Gemma 4 31B en su variante instruction-tuned, publicado por el creador independiente DavidAU en HuggingFace. Se distribuye como repositorio de pesos cuantizados en formato GGUF y está pensado para inferencia local. Su linaje parte de `DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking`, un fine-tune previo del mismo autor sobre la base Gemma 4 de Google.

La propuesta del modelo es temática y explícitamente no alineada: incorpora las etiquetas *heretic*, *abliterated* y *uncensored*, lo que indica que se han eliminado o reducido los mecanismos de rechazo del modelo base. La variante "Halloween-Terror" está orientada a escritura creativa de terror, ficción, rol y simulaciones, e incluye modos predefinidos de razonamiento e instrucción (13 de cada, según los tags) y constructos de personaje "EVIL AI".

Es relevante para desarrolladores e investigadores que necesitan un modelo de 31B sin filtros para experimentación creativa, generación de ficción o investigación sobre alineación y comportamiento de modelos abliterated. El repositorio declara licencia apache-2.0, acceso restringido (gated) y pipeline `image-text-to-text`, lo que sugiere capacidad multimodal de entrada imagen-texto heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4; detalles internos no disponibles |
| Parámetros totales | 31B (según la denominación del modelo) |
| Parámetros activos | No aplica (no consta como MoE; confirmación no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (el repositorio es una recopilación GGUF; niveles concretos no disponibles en la información proporcionada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | apache-2.0 (declarada en el repositorio; ver advertencias) |
| Formato de pesos | GGUF; modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 4 31B instruction-tuned de Google, un transformer decoder-only de la familia Gemma. No se dispone de información detallada sobre el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto nativa en la documentación accesible. El pipeline declarado `image-text-to-text` indica que conserva la capacidad de procesar entradas multimodales (imagen y texto).

El entrenamiento consiste en un fine-tune realizado por DavidAU sobre su propio modelo `The-DECKARD-HERETIC-UNCENSORED-Thinking`, que a su vez deriva de Gemma 4 31B. Los tags indican el uso de Unsloth como herramienta de ajuste y mencionan datasets privados en la línea de otros fine-tunes del autor. Se ha aplicado abliteration o técnicas equivalentes para retirar la alineación de seguridad, y se han incorporado modos de razonamiento (*thinking*) e instrucción predefinidos. No se especifican el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto y escritura creativa en múltiples géneros, con especialización en terror, horror, ficción y narrativa de Halloween.
- Modo de razonamiento (*thinking*) explícito y 13 modos de razonamiento preconfigurados según los tags del repositorio.
- 13 modos de instrucción predefinidos para distintos estilos de respuesta.
- Roleplaying y simulación de personajes, incluidos los denominados "10 EVIL AI Constructs" y "Turbo-Brilliance Evil Ed".
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Comportamiento sin filtros de seguridad (*uncensored*, *heretic*, *abliterated*): no aplica rechazos por contenido.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo thinking podría habilitarlo.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas del repositorio.

## Casos de uso

- Escritura de ficción de terror y horror: el modelo está ajustado específicamente en este género, por lo que puede generar relatos, descripciones atmosféricas y tramas de suspense con coherencia estilística sin rechazos por contenido violento o perturbador.
- Roleplay y juegos de rol de mesa: los modos de personaje y los "EVIL AI Constructs" permiten mantener personajes antagonistas con consistencia a lo largo de sesiones multi-turno.
- Simulaciones narrativas y "evil sims": útil para experimentar con dinámicas de personajes malvados en entornos de simulación o videojuegos narrativos.
- Investigación sobre alineación y seguridad: al ser un modelo abliterated, sirve para estudiar cómo se comporta un modelo de 31B sin salvaguardas, comparándolo con la versión alineada.
- Generación de contenido para campañas de Halloween o marketing temático: permite producir textos ambientados en terror y horror de forma rápida y local.
- Prototipado de asistentes creativos sin restricciones: para autores que necesitan explorar temas oscuros o controvertidos sin que el modelo se niegue a responder.
- Inferencia local en hardware de consumo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo con GPU de 24 GB o sistemas con memoria unificada amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo concreto. Una nota de prensa secundaria (LMSA) atribuye a un fine-tune multi-etapa de DavidAU —sin especificar si es exactamente este modelo— superar los 700 puntos en ARC-C tanto en 8 bits como en 4 bits y superar al modelo base Qwen 3.6 27B en 6 de 7 pruebas; estos datos no están confirmados para esta ficha y no deben tomarse como resultados verificados del modelo aquí descrito.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 62 GB (31B × 2 bytes por parámetro).
- VRAM estimada en 8 bits: aproximadamente 33 GB.
- VRAM estimada en Q8_0: en torno a 33 GB.
- VRAM estimada en Q6_K: en torno a 26 GB.
- VRAM estimada en Q5_K_M: en torno a 22 GB.
- VRAM estimada en Q4_K_M: en torno a 18-20 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o 2× RTX 4090 para FP16/8 bits; RTX 3090/4090 (24 GB) para Q4 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 (ajustado) y en sistemas Apple Silicon con 32-64 GB de memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores basados en GGUF; para el modelo base en safetensors, vLLM o TGI. La inferencia multimodal GGUF requiere el archivo `mmproj` correspondiente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-NEO-GGUF | 31B | No disponible | apache-2.0 (declarada) | Gated en HuggingFace | Fine-tune temático sin filtros, GGUF |
| Gemma 4 31B IT (base de Google) | 31B | No disponible | Términos de Gemma | Público | Versión alineada con filtros de seguridad |
| DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking | 31B | No disponible | No disponible | HuggingFace | Modelo base directo de este fine-tune |
| Qwen 3.6 27B | 27B | No disponible | No disponible | Público | Citado como referencia comparativa en prensa secundaria |

## Limitaciones y advertencias

- Modelo explícitamente sin filtros (*uncensored*, *abliterated*): puede generar contenido violento, perturbador u ofensivo; no es apto para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a los modelos de lenguaje de 31B; la desalineación puede aumentar la confianza en respuestas incorrectas.
- Sesgo temático hacia el terror y el horror, lo que puede condicionar respuestas en dominios neutros.
- Soporte exclusivo de inglés según los metadatos; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia sin verificarla.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de descargar los pesos.
- La licencia apache-2.0 está declarada en el repositorio, pero al derivar de Gemma 4 podrían aplicar los términos de uso de Google; conviene verificar antes de un uso comercial.
- El autor y el modelo tienen un volumen de descargas de 0 y 6 likes en el momento de la ficha, por lo que la validación comunitaria es escasa.
- El tamaño del repositorio reportado es 0.0 GB, lo que sugiere que la información de metadatos puede estar incompleta o que los archivos aún no se han indexado correctamente.
- Uso en producción desaconsejado en contextos sensibles o regulados sin auditoría previa.

## Enlaces

- HuggingFace: https://huggingface.co/DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-NEO-GGUF
- Modelo base: https://huggingface.co/DavidAU/gemma-4-31B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking
- Perfil del autor en aimodels.fyi: https://www.aimodels.fyi/creators/huggingFace/DavidAU
- Artículo de LMSA sobre modelos GGUF sin censura: https://lmsa.app/blog/best-uncensored-gguf-models-for-8gb-vram-in-2026/
- Leaderboard de modelos sin restricciones: https://unrestricted.ai/
- Copia GGUF en Ollama de un modelo hermano (no de este exacto): https://ollama.com/ttempvnn/DavidAU-gemma-4-31B-it-Mystery-Fine-Tune-HERETIC-UNCENSORED-Thinking-Q4-K-M:latest
