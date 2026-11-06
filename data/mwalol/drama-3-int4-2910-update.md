# mwalol/drama-3-int4-2910-update

## Resumen

Drama 3 es un modelo de texto a voz (TTS) desarrollado por Fish Audio, orientado a la generación de escenas multi-personaje y contenido de formato largo. Esta ficha concreta, publicada por el usuario mwalol, contiene los pesos actualizados de Drama 3 cuantizados a INT4 a partir de los scripts de akhaliq, lo que reduce el requisito de almacenamiento y memoria respecto a la versión original en FP8/bf16. El modelo combina un backbone de texto de tipo MoE con atención híbrida (completa y lineal) y un decodificador de audio con múltiples codebooks, lo que le permite generar habla expresiva con control en lenguaje natural.

La relevancia de esta versión radica en su posicionamiento en rankings externos: la model card cita el primer puesto entre modelos de pesos abiertos en las categorías Provider Voice y Controlled Voice de Artificial Analysis, con incrementos de 38 y 22 puntos Elo respectivamente frente a la versión Preview. Además, soporta hasta 16 hablantes distintos en un mismo texto mediante etiquetas de hablante, clonación de voz a partir de una referencia corta y edición de audio por continuación de tokens VQ.

El modelo se distribuye bajo licencia de investigación de Fish Audio, con pipeline declarado de text-to-speech y soporte para más de 80 idiomas, entre ellos el castellano, el catalán, el euskera y el gallego. Su despliegue en producción está previsto mediante SGLang-Omni y vLLM-Omni.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de texto MoE con atención híbrida (completa + lineal) y decodificador de audio Codebook-MTP de 10 codebooks |
| Parametros totales | 6.857.815.168 (según safetensors del repo); la model card del autor original declara 35B en el modelo base |
| Parametros activos | 3B por token (según model card del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (expertos MoE y pesos densos); la versión original usa FP8 en expertos MoE y bf16 en el resto |
| Idiomas soportados | Más de 80, incluyendo zh, en, ja, ko, es, pt, ar, ru, fr, de, ca, eu, gl, entre otros |
| Licencia | fish-audio-research-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Drama 3 emplea un backbone de texto con arquitectura Mixture of Experts (MoE) que activa 3B parámetros por token sobre un total declarado de 35B, combinando capas de atención completa con capas de atención lineal para reducir el coste computacional en secuencias largas. Sobre este backbone se sitúa un decodificador de audio Codebook-MTP que genera 10 codebooks de forma causal a lo largo de toda la secuencia, lo que permite producir audio de forma autorregresiva y coherente con el texto de entrada.

Esta variante concreta aplica cuantización INT4 tanto a los expertos MoE como a los pesos densos, partiendo de los pesos actualizados publicados por Fish Audio. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones adicionales más allá de la atención híbrida, el decodificador multi-codebook y las etiquetas de hablante.

## Capacidades

- Generación de voz multi-hablante: hasta 16 personajes distintos en un mismo texto mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Clonación de voz a partir de un clip de referencia corto (por ejemplo, 3,9 s) con su transcripción.
- Control en lenguaje natural y etiquetas puntuales de eventos no verbales, como `[sighs]` o `[laughs]`, insertadas en la posición deseada del texto.
- Edición de audio como continuación: se envían las tomas previas (`previous_takes`) y el modelo genera una nueva versión coherente con el contexto anterior, permitiendo encadenar ediciones.
- Generación de contenido de formato largo con troceado automático del texto y streaming por fragmentos.
- Soporte multilingüe amplio, con más de 80 idiomas declarados, incluyendo castellano, catalán, euskera y gallego.
- Generación de habla emocional y expresiva, según las etiquetas del repositorio.

## Casos de uso

- Audiolibros y ficción con diálogos: el modelo puede narrar escenas con hasta 16 personajes diferenciados en un mismo texto, asignando una etiqueta de hablante a cada intervención y manteniendo la coherencia de voz a lo largo de capítulos largos gracias al troceado automático.
- Doblaje y localización de contenido: la clonación de voz desde un clip de referencia permite reproducir el timbre de un actor original y generar versiones en castellano, catalán, euskera o gallego, facilitando la localización multilingüe de vídeos y pódcasts.
- Producción de pódcasts sintéticos: con soporte multi-hablante y control de eventos no verbales, se pueden generar conversaciones entre varios locutores con pausas, risas y suspiros insertados mediante etiquetas puntuales.
- Asistentes de voz y atención al cliente: el modelo puede sintetizar respuestas con una voz clonada corporativa y emitir audio en streaming por fragmentos, lo que reduce la latencia percibida en interacciones conversacionales.
- Edición de locuciones sin regrabar: la funcionalidad de edición como continuación permite corregir una palabra o frase concreta enviando las tomas anteriores como contexto, útil en postproducción de anuncios y material formativo.
- Accesibilidad y lectura de textos: la generación de voz expresiva en múltiples idiomas permite convertir documentos y artículos en audio con entonación natural, incluyendo lenguas minoritarias como el euskera o el gallego.
- Prototipado de videojuegos y animación: la asignación de hasta 16 voces por escena y el control emocional permiten generar bocetos de diálogos para personajes antes de contratar actores.

## Benchmarks y rendimiento

La model card cita resultados de rankings de Artificial Analysis, no de benchmarks académicos:

| Categoría | Posición | Comparación |
|---|---|---|
| Provider Voice | 1.º en pesos abiertos, 6.º global | +38 Elo sobre la versión Preview |
| Controlled Voice | 1.º en pesos abiertos | +22 Elo sobre la versión Preview |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de texto a voz y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repo ocupa 24,0 GB en INT4, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos completos, más el espacio para cachés y estados de inferencia.
- GPU recomendadas: la model card reporta mediciones de producción en NVIDIA H200. No se especifican otras GPU validadas.
- GPU de consumo: no se confirma que quepa en GPU de consumo; con 24 GB de pesos en INT4, solo tarjetas con 24 GB o más (por ejemplo, RTX 4090) podrían albergarlo, aunque no hay confirmación oficial.
- Opciones de despliegue: SGLang-Omni (`sgl-omni serve --model-path ...`) y vLLM-Omni (`vllm serve ... --omni`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card indica que las cifras se midieron en H200 con peticiones en streaming sobre prompts en inglés de Seed-TTS, con temperatura 1.0, top_p 0.9, top_k 30 y max_new_tokens 500, reportando TTFA (tiempo hasta el primer audio) y RTF, pero la tabla de resultados está truncada en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Drama 3 (esta variante INT4) | 6,86B en safetensors (35B declarados en el base) | no disponible | fish-audio-research-license | TTS multi-hablante con clonación y edición |
| Drama 3 original (fishaudio/drama-3) | 35B (3B activos) | no disponible | fish-audio-research-license | TTS multi-hablante, pesos FP8/bf16 |
| akhaliq/drama-3-int4 | no disponible | no disponible | no disponible | Cuantización INT4 del Drama 3 original |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada.

## Limitaciones y advertencias

- La licencia fish-audio-research-license es restrictiva: no se garantiza su uso comercial sin revisar los términos del archivo LICENSE.md del repositorio.
- La model card no documenta sesgos conocidos ni tasas de alucinación o artefactos de audio; se recomienda evaluar la calidad por idioma antes de usarlo en producción.
- El soporte de más de 80 idiomas está declarado, pero no se aportan métricas de calidad por idioma; lenguas con pocos recursos como el euskera o el gallego podrían rendir peor.
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido; es necesario aplicar controles de consentimiento y verificación en cualquier despliegue.
- Los datos de rendimiento proceden de H200 con prompts en inglés; el comportamiento en otras GPU y en otros idiomas no está documentado.
- La tabla de producción de la model card está truncada, por lo que no se pueden verificar los valores de TTFA y RTF.
- Existe una discrepancia entre los 6,86B parámetros del safetensors y los 35B declarados en la model card del modelo base; conviene verificar la configuración exacta antes de dimensionar el hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mwalol/drama-3-int4-2910-update
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Scripts de cuantización: https://huggingface.co/akhaliq/drama-3-int4
- SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Cookbook de Drama 3 en SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Recipe de Drama 3 en vLLM: https://recipes.vllm.ai/fishaudio/drama-3
- Paper referenciado (arXiv): 2610.18010
