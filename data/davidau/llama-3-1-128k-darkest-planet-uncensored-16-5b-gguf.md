# DavidAU/LLama-3.1-128k-Darkest-Planet-Uncensored-16.5B-GGUF

## Resumen
LLama-3.1-128k-Darkest-Planet-Uncensored-16.5B es un modelo de generación de texto derivado de Llama 3.1, desarrollado por DavidAU y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo entrenado desde cero, sino una modificación del modelo Dark Planet 8B mediante la técnica propietaria "Brainstorm 40x", que expande la red en 40 capas adicionales (hasta 71 capas y 642 tensores) para alcanzar 16.536.629.312 parámetros. El resultado es un modelo orientado exclusivamente a escritura creativa, ficción, narrativa, generación de tramas y roleplay, con un sesgo deliberado hacia el contenido explícito, violento y de terror, y sin filtros de censura.

El modelo mantiene la ventana de contexto de 128k tokens (131.072) de Llama 3.1 y está distribuido en formato GGUF, con cuantizaciones re-masterizadas a partir de pesos en float32, además de variantes en bfloat16. Su relevancia actual reside en que ocupa un nicho muy concreto: escritores y creadores que necesitan prosa vívida, detallada y sin restricciones de contenido, con capacidad para generar salidas largas (el autor documenta una salida de 8.700 tokens a partir de un prompt de una sola frase).

Se trata de un modelo uninlingüe en inglés, sin capacidades multimodales ni de tool calling documentadas, y cuyo interés técnico está en el método de expansión de capas y en el comportamiento de generación, no en benchmarks de razonamiento o código.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Llama 3.1, con expansión de capas mediante Brainstorm 40x (71 capas, 642 tensores) |
| Parámetros totales | 16.536.629.312 (16,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (128k) |
| Tipos de cuantización | GGUF en varias cuantizaciones; pesos fuente en float32 y bfloat16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); fuente en float32/bfloat16 |

## Arquitectura y entrenamiento
El modelo parte de Llama 3.1 y del modelo Dark Planet 8B, al que se le aplica el método Brainstorm 40x desarrollado por David_AU. Este método expande la red en 40 capas adicionales hasta las 71 capas y 642 tensores, lo que multiplica el tamaño hasta los 16,5B parámetros. El autor cita como referencia conceptual el paper "Progressive LLaMA with Block Expansion" (arXiv:2401.02413), aunque indica explícitamente que su enfoque va en una dirección distinta. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La versión 2 del modelo incorpora un mayor grado de "de-censoring", mejoras de rendimiento y una re-masterización de los GGUF a partir de pesos en float32. El autor señala que el modelo es "relativamente a prueba de balas" y tolera configuraciones de temperatura de 0 a 5, con penalización de repetición de 1.05 o superior. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto creativo: ficción, relatos cortos, novelas, ciencia ficción, romance, terror y todos los géneros.
- Generación de tramas y subtramas, continuación de escenas y desarrollo narrativo.
- Prosa vívida con niveles inusuales de detalle en escenas, localizaciones, entorno y objetos.
- Roleplay y conversación multi-turno, con advertencia del autor de que temperaturas demasiado altas pueden degradar el seguimiento de instrucciones.
- Generación de salidas largas: el autor documenta una salida de 8.700 tokens (un relato corto completo) a partir de un prompt de una sola frase.
- Capacidad de anticipar o prefigurar eventos futuros en la narración ("foreshadowing") como efecto secundario del método Brainstorm.
- Modelo instructivo: acepta system prompt e instrucciones detalladas, y el autor indica que a más instrucciones, mayor calidad de salida.
- No se documentan tool calling, function calling, agentes, matemáticas, código, visión ni audio.

## Casos de uso
- Escritura de ficción y relatos cortos: el modelo puede generar narraciones completas de miles de tokens a partir de un prompt breve, gracias a su ventana de 128k y a su tendencia a producir salidas largas; adecuado para autores que buscan un primer borrador con prosa detallada.
- Generación de tramas y subtramas para novelas: se le puede pedir que desarrolle arcos argumentales, giros y prefiguraciones, aprovechando su tendencia natural al foreshadowing documentada por el autor.
- Terror y horror narrativo: el autor indica que se puede forzar el registro con etiquetas en el prompt como "(vivid horror)" o "(graphic vivid horror)", lo que lo hace útil para antologías de terror o guiones de género.
- Roleplay y narrativa interactiva: soporta conversaciones multi-turno con contexto largo, útil para juegos de rol por texto o experiencias narrativas interactivas, con la cautela de mantener la temperatura moderada para no perder el seguimiento de instrucciones.
- Continuación de escenas y "scene continue": adecuado para escritores que necesitan extender un fragmento existente manteniendo el tono y el estilo, con la ventaja de que distintas cuantizaciones producen variaciones ligeras de prosa que permiten explorar alternativas.
- Prototipado de diálogos y guiones: puede generar diálogo y estructura de párrafos variada, útil para guionistas que necesitan material de trabajo sin restricciones de contenido.
- Creación de contenido sin censura para proyectos adultos: el modelo está explícitamente descensurado y admite violencia, lenguaje soez y contenido NSFW, lo que lo hace apto para proyectos de ficción para adultos que otros modelos rechazarían.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- El repo GGUF ocupa 113,4 GB en total, lo que refleja el conjunto de cuantizaciones disponibles; una cuantización Q4_K_M de un modelo de 16,5B ronda los 9-10 GB, y Q8_0 en torno a 17-18 GB (estimación según el tamaño de parámetros, no dato publicado).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 16,5B en Q4 cabe en GPUs consumer con 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); en Q8 o float16 requiere GPUs de 24 GB o más (RTX 4090, A100, H100).
- Cabe en GPU consumer en cuantizaciones bajas y medias; para contexto completo de 128k la VRAM de caché KV adicional puede exigir GPUs de 24 GB o más.
- Opciones de despliegue: al estar en formato GGUF, es compatible con llama.cpp, Ollama y otros runners GGUF; el autor menciona compatibilidad con endpoints. No se documenta soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LLama-3.1-128k-Darkest-Planet-Uncensored-16.5B | 16,5B | 128k | Apache 2.0 | Escritura creativa sin censura |
| L3-Dark-Planet-8B (mismo autor) | 8B | no disponible | Apache 2.0 | Escritura creativa, base del 16.5B |
| L3-DARKEST-PLANET-Seven-Rings-Of-DOOM-16.5B (mismo autor) | 16,5B | 128k | Apache 2.0 | Variante con adaptador Brainstorm de siete modelos |
| MN-DARKEST-UNIVERSE-29B (mismo autor) | 29B | 131k | Apache 2.0 | Escritura creativa, versión superior de la familia |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas de otros autores.

## Limitaciones y advertencias
- Contenido explícito: el modelo está deliberadamente descensurado y produce NSFW, violencia gráfica, terror y lenguaje soez; no es apto para aplicaciones de uso general ni para entornos con requisitos de moderación.
- Sesgo negativo: el autor advierte explícitamente de que "no es un modelo de final feliz" y tiene un sesgo negativo, lo que condiciona el tono de todas las salidas.
- Riesgo de alucinación: no se documenta una evaluación específica, pero al ser un modelo de ficción sin benchmarks publicados no hay garantías de fiabilidad factual.
- Idioma: solo inglés; no soporta castellano de forma fiable.
- Contexto: aunque soporta 128k, el autor advierte que si se usa rope para extender contexto hay que subir la temperatura y el detalle de las instrucciones para compensar los problemas de rope.
- Seguimiento de instrucciones: el autor advierte que temperaturas altas pueden degradar el seguimiento de instrucciones en roleplay.
- Salidas largas: el modelo tiende a generar salidas muy largas salvo que se imponga un límite duro, lo que puede complicar su uso en producción con requisitos de latencia.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir políticas de plataformas o normativas sobre contenido explícito; la responsabilidad recae en el desplegador.
- No dispone de tool calling ni capacidades de agente documentadas, por lo que no es adecuado para pipelines automatizados que requieran interacción con herramientas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DavidAU/LLama-3.1-128k-Darkest-Planet-Uncensored-16.5B-GGUF
- Modelo base: https://huggingface.co/DavidAU/LLama-3.1-128k-Darkest-Planet-Uncensored-16.5B
- Modelo original de la serie: https://huggingface.co/DavidAU/L3-Dark-Planet-8B-GGUF
- Variante Seven Rings Of Doom: https://huggingface.co/DavidAU/L3-DARKEST-PLANET-Seven-Rings-Of-DOOM-16.5B-GGUF
- Modelo superior de la familia: https://huggingface.co/DavidAU/MN-DARKEST-UNIVERSE-29B-GGUF
- Primera entrega de la serie: https://huggingface.co/DavidAU/L3-Darker-Planet-12.15B-GGUF
- Segunda entrega de la serie: https://huggingface.co/DavidAU/DARKER-PLANET-Broken-Land-12.15B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Paper de referencia citado por el autor: https://arxiv.org/pdf/2401.02413
