# Parikshirendupoojiyamettu/drama-3

## Resumen

Drama 3 es un modelo de síntesis de voz (text-to-speech) de Fish Audio orientado a escenas con múltiples personajes y contenido de formato largo. El modelo combina un backbone de texto de tipo mezcla de expertos (MoE) de 35.899.643.008 parámetros totales con unos 3.000 millones de parámetros activos por token, junto con un decodificador de audio basado en códigos (codebook-MTP) que genera 10 codebooks de forma causal sobre toda la secuencia. Frente a los TTS clásicos, el problema que resuelve no es solo convertir texto en voz, sino permitir dirección explícita de la interpretación: emoción, ritmo, pausas, sonidos vocales y cambios de voz a mitad de frase, escritos en lenguaje natural.

El modelo admite hasta 16 personajes en una sola petición mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`, clona la voz a partir de un clip de referencia con su transcripción y permite editar tomas anteriores pasando el contexto de `previous_takes`, de modo que una corrección de una palabra conserva el audio circundante. Soporta 89 idiomas, incluidos español, catalán, gallego y euskera, y está pensado para servirse con SGLang-Omni o vLLM-Omni desde el día de lanzamiento.

Es relevante ahora porque desplaza parte del control de un TTS hacia instrucciones en texto plano en lugar de esquemas de etiquetado rígidos, y porque su naturaleza MoE con expertos en FP8 permite throughput alto en hardware de datacenter: según el autor, una sola NVIDIA H200 alcanza 166,7 frames/s con concurrencia 1 y 1.687,3 frames/s con concurrencia 64, con un TTFA p50 de 88,9 ms en el caso secuencial. La licencia es de investigación (`fish-audio-research-license`), lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de texto MoE con atención híbrida (full + linear); decodificador de audio codebook-MTP con 10 codebooks decodificados causalmente sobre toda la secuencia |
| Parametros totales | 35.899.643.008 (35,9 B) |
| Parametros activos | 3 B por token |
| Longitud de contexto | no disponible (el texto largo se trocea automáticamente y se puede emitir en streaming por fragmentos) |
| Tipos de cuantizacion | Expertos MoE en FP8 y resto de pesos en bf16; no se listan variantes GGUF ni cuantizaciones de menor precisión |
| Idiomas soportados | 89 idiomas: zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | fish-audio-research-license (licencia de investigación; enlace a LICENSE.md en el repositorio) |
| Formato de pesos | safetensors (tamaño del repositorio: 41,5 GB) |

## Arquitectura y entrenamiento

El modelo separa dos componentes. El primero es un backbone de lenguaje de tipo transformer con mezcla de expertos: 35,9 B de parámetros totales con 3 B activos por token, y atención híbrida que combina capas de atención completa con capas de atención lineal, lo que reduce el coste de secuencias largas y encaja con la generación de audio de formato largo. Los expertos MoE se almacenan en FP8 mientras el resto de pesos permanece en bf16, una decisión de despliegue que mantiene el peso del repositorio en 41,5 GB y permite servir el modelo en una sola GPU de datacenter. El repositorio incluye la etiqueta `bsgemm-moe`, asociada a kernels de multiplicación de matrices en bloques para expertos dispersos.

El segundo componente es un decodificador de audio codebook-MTP: diez codebooks que se decodifican de forma causal a lo largo de toda la secuencia, en lugar de un decodificador que opere ventana a ventana. Sobre esa base se apoyan las capacidades de control: las etiquetas de hablante `<|speaker:N|>` asignan turnos dentro de una misma generación, las instrucciones entre corchetes dirigen la interpretación y las etiquetas puntuales insertan eventos en la posición exacta del texto. La edición se plantea como continuación: se envían los tokens VQ de tomas previas (`previous_takes`) y el modelo reutiliza ese contexto para regenerar solo el fragmento afectado. El autor no documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; tampoco se detalla el proceso de alineación de la voz clonada.

## Capacidades

- Generación de voz multi-personaje: hasta 16 hablantes distintos en una sola petición mediante las etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Clonación de voz a partir de un clip de referencia y su transcripción, sin ajuste fino adicional.
- Dirección en lenguaje natural: instrucciones del tipo `[nervous, barely holding it together]` antes de una línea para controlar emoción, ritmo y entrega.
- Etiquetas puntuales de sonido y pausa insertadas en el punto exacto del texto donde debe ocurrir el evento, por ejemplo `[sighs]` o `[laughs]`.
- Edición por continuación: corrección de palabras concretas conservando el audio circundante, con encadenamiento de varias ediciones sobre las tomas anteriores.
- Regeneración de una sola palabra manteniendo el contexto sonoro que la rodea.
- Cambios de voz a mitad de frase y cambios de idioma dentro de una misma petición.
- Síntesis multilingüe en 89 idiomas, con soporte explícito de es, ca, gl y eu además de las lenguas principales.
- Streaming por fragmentos: el texto largo se trocea automáticamente y la salida puede emitirse por partes.
- API compatible con `/v1/tts`, con parámetros de muestreo (`temperature`, `top_p`, `top_k`, `max_new_tokens`).
- No se documentan en la información disponible capacidades de tool calling, agentes ni visión.

## Casos de uso

- Producción de audiolibros y ficción sonora: una novela con diálogos de varios personajes se puede sintetizar en una sola pasada usando las etiquetas de hablante, asignando una referencia de voz distinta a cada etiqueta y manteniendo consistencia de timbre entre capítulos.
- Doblaje y localización: el cambio de idioma dentro de una misma petición y las 89 lenguas soportadas permiten generar versiones de un mismo guion conservando la dirección de interpretación escrita por el guionista.
- Edición iterativa de podcast y anuncios: gracias a `previous_takes`, un cambio de "Wednesday" a "Thursday" o de "by noon" a "by five" regenera solo ese tramo y evita volver a grabar la locución completa, algo crítico cuando el cliente pide ajustes de última hora.
- Videojuegos y experiencias interactivas: con 16 hablantes por petición y TTFA por debajo de 100 ms en un solo stream sobre H200, es viable generar diálogo de PNJ bajo demanda sin pregenerar todos los árboles de conversación.
- Asistentes de voz y atención al cliente: el control de emoción y pausas en lenguaje natural permite ajustar el tono por tipo de incidencia (reclamación, soporte técnico, información neutra) sin reentrenar ni mantener catálogos de voces.
- Accesibilidad y lectura de contenidos: la longitud de texto se trocea automáticamente, de modo que artículos o documentos extensos se pueden convertir en audio por fragmentos y servirse en streaming al usuario.
- Prototipado rápido de creatividades publicitarias: escribir la dirección en corchetes permite al equipo de marketing probar diez lecturas distintas del mismo eslogan en minutos, sin sesión de estudio ni locutor.
- E-learning y cursos multilingües: un mismo temario se genera en varias lenguas y con voces distintas para el narrador y los ejemplos, manteniendo la terminología y el ritmo definidos en el guion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de comprensión o razonamiento (MMLU, HumanEval, GSM8K) en la información disponible, ya que se trata de un modelo de síntesis de voz y esas métricas no aplican. El autor sí publica mediciones de servicio en streaming sobre NVIDIA H200, con peticiones sobre prompts en inglés de Seed-TTS, clonación de una referencia precodificada (`vq_codes` con transcripción), `temperature` 1.0, `top_p` 0.9, `top_k` 30 y `max_new_tokens` 500. Cada celda es la media de cuatro ejecuciones.

| Concurrencia | Throughput (frames/s) | TTFA p50 | TTFA p95 | RTF (media) |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1.244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1.687,3 | 450,9 ms | 1.020,1 ms | 0,801 |

Lectura de la tabla: un único stream obtiene el primer audio en menos de 100 ms y mantiene un RTF de 0,131, es decir, genera audio más rápido que tiempo real. El throughput escala de forma casi lineal hasta concurrencia 8-16 (678-928 frames/s); a partir de 32 la latencia de cola se degrada de forma apreciable (TTFA p95 de 1.020 ms con concurrencia 64) y el RTF sube a 0,801, por lo que el régimen recomendado para interacción en vivo está por debajo de 16 peticiones simultáneas por GPU. El texto del autor se interrumpe en la frase sobre concurrencia 16, por lo que no se dispone de la conclusión completa.

## Requisitos de hardware

- Los pesos del repositorio ocupan 41,5 GB (expertos MoE en FP8, resto en bf16), por lo que el modelo no cabe en GPUs de consumo de 24 GB.
- Las mediciones oficiales se realizaron en una sola NVIDIA H200; el autor no publica cifras para otras GPU.
- Estimación de VRAM para inferencia: se necesita al menos el tamaño de los pesos más caché de decodificador y buffers de streaming; en la práctica, una GPU de 80 GB (A100, H100) o una H200 es el objetivo natural. Esta estimación es una deducción del tamaño del repositorio, no un dato publicado.
- No cabe en consumer GPU: ni RTX 4090 (24 GB) ni RTX 5090 (32 GB) alojan 41,5 GB de pesos; no se han publicado cuantizaciones de menor precisión que lo hicieran viable.
- Despliegue soportado: SGLang-Omni (`sgl-omni serve --model-path fishaudio/drama-3 --port 8000`, instalación con el extra `fishaudio`) y vLLM-Omni (`vllm serve fishaudio/drama-3 --omni --port 8091`).
- No se documentan rutas de despliegue con llama.cpp, Ollama o TGI en la información disponible.
- Throughput y latencia medidos: 166,7 frames/s y TTFA p50 de 88,9 ms con concurrencia 1; 927,6 frames/s y TTFA p50 de 210,1 ms con concurrencia 16; 1.687,3 frames/s con concurrencia 64 sobre H200.
- El RTF se mantiene por debajo de 1,0 hasta concurrencia 64, lo que indica capacidad de servir más rápido que tiempo real en todos los regímenes medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drama 3 (este modelo) | 35,9 B totales / 3 B activos | no disponible | Tabla de streaming en H200 en la model card (166,7-1.687,3 frames/s) | fish-audio-research-license | Pesos en safetensors; servicio vía SGLang-Omni y vLLM-Omni |
| Fish Audio S1-mini | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| Kokoro-82M | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| XTTS-v2 | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificados de parámetros, contexto, rendimiento ni licencia de los modelos alternativos, por lo que no se comparan cifras. Las alternativas citadas son las habitualmente empleadas en la misma categoría (TTS con clonación de voz y control de estilo), pero cualquier comparación numérica requiere consultar sus fichas oficiales.

## Limitaciones y advertencias

- Licencia de investigación: `fish-audio-research-license` restringe el uso comercial; cualquier despliegue en producción requiere revisar LICENSE.md y, previsiblemente, un acuerdo con Fish Audio.
- Repositorio de terceros: la ficha corresponde a `Parikshirendupoojiyamettu/drama-3`, con 0 descargas y 0 likes y sin verificación de linaje respecto al repositorio oficial `fishaudio/drama-3` que aparece en los comandos de la model card. Conviene descargar desde el repositorio oficial y contrastar hashes antes de usar los pesos.
- Riesgo de suplantación de identidad: la clonación de voz funciona con un clip de referencia de pocos segundos (el ejemplo usa 3,9 s). Sin controles de consentimiento, el modelo puede replicar la voz de una persona sin autorización; es un requisito legal y ético establecer verificación de consentimiento en cualquier producto.
- Riesgo de alucinación trasladado al audio: en TTS se manifiesta como pronunciación incorrecta, omisión o repetición de palabras, ruido, cambios de timbre a mitad de frase o interpretación que ignora la instrucción entre corchetes. La model card no publica tasas de error de palabra ni métricas de inteligibilidad.
- Idiomas de bajos recursos: aunque se listan 89 idiomas, no hay datos de calidad por lengua; es razonable esperar un rendimiento notablemente inferior en lenguas con pocos hablantes o escaso material, y no se publica ninguna evaluación específica para es, ca, gl o eu.
- Longitud de contexto no publicada: el troceado automático del texto largo evita el límite de ventana, pero puede introducir discontinuidades de prosodia entre fragmentos que no se documentan.
- Dependencia de infraestructura: el servicio está atado a SGLang-Omni y vLLM-Omni, con instalación mediante `--prerelease=allow`; no hay soporte documentado en runtimes más extendidos como llama.cpp u Ollama.
- Coste de hardware: 41,5 GB de pesos y necesidad de GPU de 80 GB o H200 limitan el despliegue a entornos de datacenter, lo que descarta prototipado en estaciones de trabajo con GPU de consumo.
- Estado del arte cambiante: el autor etiqueta el modelo como disponible y medido, pero parte de la documentación pública lo describe en estado de preview; verificar la versión antes de comprometer una integración.
- La tabla de rendimiento está medida únicamente en inglés con un conjunto concreto de parámetros de muestreo; no se ofrecen cifras para otros idiomas, longitudes de referencia o configuraciones de decodificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Parikshirendupoojiyamettu/drama-3
- Página de producto de Drama 3: https://fish.audio/drama-3/
- Documentación de Drama 3: https://docs.fish.audio/features/text-to-speech/drama-3
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Cookbook de Drama 3 en SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Recipe de Drama 3 en vLLM-Omni: https://recipes.vllm.ai/fishaudio/drama-3
- Ficha en OpenRouter: https://openrouter.ai/fish-audio/drama-3
- Ficha en Vercel AI Gateway: https://vercel.com/ai-gateway/models/drama-3
- Ficha en There's An AI For That: https://theresanaiforthat.com/model/drama-3/
- Identificador arXiv presente en los tags del repositorio: arxiv:2610.18010 (título y contenido del paper no disponibles en la información proporcionada)
- Clip de referencia del ejemplo (en0.wav): https://github.com/user-attachments/files/33393249/en0.wav
- Ejemplo de etiquetas puntuales: https://github.com/user-attachments/files/33393205/A1_point_tags.wav
- Ejemplo de edición por continuación: https://github.com/user-attachments/files/33393156/K1_edit_word_with_context.wav
- Ejemplo de edición encadenada: https://github.com/user-attachments/files/33393164/K5_second_edit_chained.wav
- Conjunto de evaluación Seed-TTS mini: https://huggingface.co/datasets/zhaochenyang20/seed-tts-eval-mini
