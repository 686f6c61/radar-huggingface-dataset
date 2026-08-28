# OjikSenpai/OmniVoice

## Resumen

OmniVoice es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por el equipo k2-fsa, con una versión publicada en HuggingFace bajo el usuario OjikSenpai. Se trata de un sistema zero-shot masivamente multilingüe capaz de generar voz natural en más de 600 idiomas, lo que lo convierte en uno de los modelos TTS con mayor cobertura lingüística disponibles actualmente. Además de la síntesis convencional, soporta clonación de voz a partir de una breve muestra de audio de referencia y diseño de voces sintéticas.

El modelo emplea una arquitectura novedosa de tipo "diffusion language model", combinando un modelo de lenguaje difusivo con un backbone basado en Qwen3-0.6B. Con aproximadamente 612 millones de parámetros, ofrece una calidad de audio alta y una velocidad de inferencia superior a la de otros sistemas de su categoría. Su relevancia actual radica en la demanda de soluciones TTS multilingües y de clonación de voz para aplicaciones de accesibilidad, doblaje, asistentes virtuales y generación de contenido, todo ello con una licencia abierta (Apache 2.0 según la web oficial, aunque no confirmada en la ficha de HuggingFace).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (basado en Qwen/Qwen3-0.6B) |
| Parametros totales | 612.577.288 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no procesa texto largo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 600 (lista completa de códigos ISO en la ficha de HuggingFace) |
| Licencia | Apache 2.0 (según la web oficial; no confirmado en la ficha de HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OmniVoice se basa en una arquitectura de "diffusion language model", un enfoque que integra procesos de difusión con modelado de lenguaje para generar audio de forma autoregresiva o en paralelo. El modelo utiliza como backbone el modelo de lenguaje Qwen3-0.6B, que actúa como codificador de texto y de condiciones acústicas. La parte de difusión se encarga de refinar las representaciones latentes para producir formas de onda de alta calidad. Esta combinación permite una síntesis rápida y estable, con una calidad comparable a la de modelos mucho más grandes.

No se dispone de información detallada sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF o DPO, ni técnicas específicas de optimización. La documentación oficial menciona que el modelo fue entrenado con datos multilingües masivos, pero no se ofrecen cifras concretas. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en más de 600 idiomas, con cobertura de lenguas minoritarias y regionales.
- Clonación de voz zero-shot: genera una voz similar a la de una muestra de referencia de pocos segundos, sin necesidad de fine-tuning.
- Diseño de voz: permite crear voces sintéticas nuevas mediante la manipulación de características acústicas.
- Inferencia rápida: la arquitectura de difusión permite generar audio con baja latencia, adecuada para aplicaciones en tiempo real.
- Soporte multilingüe extenso: incluye lenguas de África, Asia, Europa, América y Oceanía, con códigos ISO 639-3.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de síntesis de voz.

## Casos de uso

- Doblaje de vídeos y películas: OmniVoice puede clonar la voz de un actor a partir de una muestra breve y generar diálogos en decenas de idiomas, reduciendo costes de producción en la localización de contenido audiovisual.
- Asistentes virtuales multilingües: integrado en un sistema de diálogo, permite que un asistente responda con voz natural en el idioma del usuario, incluso en lenguas con pocos recursos.
- Accesibilidad para personas con discapacidad visual: lectores de pantalla que convierten texto en voz con calidad casi humana, mejorando la experiencia de navegación y lectura.
- Audiolibros y podcasts automatizados: generación de narraciones de larga duración con voces consistentes, a partir de texto escrito, en múltiples idiomas.
- Educación y e-learning: creación de materiales de aprendizaje con locuciones en la lengua materna del estudiante, incluyendo lenguas indígenas o minoritarias.
- Atención al cliente automatizada: sistemas IVR que responden con voz clonada de un agente humano, manteniendo la coherencia de marca y reduciendo la fricción en interacciones telefónicas.
- Creación de contenido para redes sociales: generación de voces para vídeos cortos, memes o anuncios, con la posibilidad de diseñar voces personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos objetivos sobre métricas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparativas con otros modelos TTS en la documentación consultada.

## Requisitos de hardware

- El modelo tiene 612 millones de parámetros y un tamaño de repositorio de 3,3 GB (incluyendo pesos en safetensors y posiblemente otros archivos).
- En FP16, los pesos ocupan aproximadamente 1,2 GB, por lo que una GPU con al menos 4 GB de VRAM podría ejecutar la inferencia básica.
- Para un rendimiento fluido y con lotes, se recomienda una GPU con 8 GB o más, como una RTX 3060, RTX 4060 o superior.
- No se dispone de datos oficiales sobre latencia o throughput. La arquitectura de difusión suele ser más rápida que los modelos autoregresivos puros, pero no hay cifras publicadas.
- Opciones de despliegue: la librería oficial es `omnivoice`, disponible en el repositorio de GitHub. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo TTS y no un LLM de texto.
- Se puede ejecutar en Google Colab mediante el notebook oficial proporcionado.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos TTS en los datos proporcionados. No se han encontrado referencias a modelos como XTTS, Bark o VITS en la documentación consultada, por lo que no es posible realizar una comparación objetiva.

## Limitaciones y advertencias

- La licencia no está confirmada en la ficha de HuggingFace; la web oficial indica Apache 2.0, pero se recomienda verificar antes de un uso comercial.
- Al ser un modelo zero-shot, la calidad de la clonación de voz puede degradarse con muestras de audio de baja calidad o con ruido de fondo.
- Aunque soporta más de 600 idiomas, la calidad de síntesis puede variar significativamente entre lenguas con más o menos datos de entrenamiento.
- Riesgo de alucinación acústica: en textos ambiguos o con nombres propios poco comunes, el modelo puede producir pronunciaciones incorrectas.
- No se han publicado evaluaciones de sesgos o de comportamientos no deseados; el uso de clonación de voz plantea riesgos éticos de suplantación de identidad.
- El modelo no está diseñado para tareas de comprensión del lenguaje; es exclusivamente un generador de voz.
- No hay información sobre el proceso de entrenamiento, por lo que se desconoce la procedencia de los datos y posibles sesgos lingüísticos o culturales.

## Enlaces

- [Modelo en HuggingFace (OjikSenpai/OmniVoice)](https://huggingface.co/OjikSenpai/OmniVoice)
- [Modelo original en HuggingFace (k2-fsa/OmniVoice)](https://huggingface.co/k2-fsa/OmniVoice)
- [Paper en arXiv](https://huggingface.co/papers/2604.00688)
- [Repositorio en GitHub](https://github.com/k2-fsa/OmniVoice)
- [Demo en Hugging Face Space](https://huggingface.co/spaces/k2-fsa/OmniVoice)
- [Notebook en Google Colab](https://colab.research.google.com/github/k2-fsa/OmniVoice/blob/master/docs/OmniVoice.ipynb)
- [Página de demostración](https://zhu-han.github.io/omnivoice)
- [Web oficial de OmniVoice](https://omnivoice.app/)
