# Efficient-Large-Model/SANA-Video_2.0_5B_720p

## Resumen

SANA-Video 2.0 5B 720p es un modelo de difusión tipo transformer (DiT) desarrollado por el equipo Efficient-Large-Model (NVIDIA) para generación de vídeo de alta resolución. Está diseñado para producir clips de aproximadamente 8 segundos a 720p (736×1280) a partir de texto (text-to-video) o de texto más una imagen inicial (text-image-to-video). El modelo combina atención lineal bidireccional con anclajes periódicos de atención softmax densa, lo que reduce el coste computacional frente a la atención completa manteniendo calidad en secuencias largas.

Con 4,47 mil millones de parámetros entrenables, el checkpoint liberado es un artefacto de inferencia que ya incluye los pesos EMA y el adaptador de post-entrenamiento ReFL fusionados. Utiliza el codificador de texto Gemma 2 2B IT y el VAE LTX 2.3 con 128 canales latentes y compresión temporal/espacial de (8, 32, 32). Su licencia Apache 2.0 permite uso comercial y modificación, lo que lo hace atractivo para investigación y despliegue en producción. La relevancia actual radica en que ofrece generación de vídeo de alta resolución con una arquitectura eficiente y un coste de inferencia relativamente bajo para su clase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SanaVideo2_5B (diffusion transformer con atención lineal gated y anclajes softmax densos) |
| Parametros totales | 4.466.980.960 (4,47B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa secuencias de vídeo latentes; no hay especificación de tokens de texto) |
| Tipos de cuantizacion | BF16 (recomendado); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch (.pth) con state_dict fusionado; no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión con 32 capas y tamaño oculto de 2.560. La atención se reparte en un 75% de capas con atención lineal gated bidireccional y un 25% con anclajes de atención softmax densa periódicos. Además, incorpora agregación de residuales de atención compartida e independiente del timestep cada 8 capas, lo que mejora la estabilidad del entrenamiento y la calidad de la generación. El condicionamiento textual lo proporciona el codificador Gemma 2 2B IT, y el VAE LTX 2.3 comprime el espacio latente con 128 canales y un stride de (8, 32, 32) en tiempo y espacio.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el pipeline de alineación (si hubo RLHF o DPO). El checkpoint liberado es un artefacto de inferencia que ya incorpora los pesos EMA y el adaptador ReFL fusionados, lo que indica que hubo un post-entrenamiento con refuerzo (ReFL) para mejorar la adherencia al prompt, pero no se especifican los datos ni el procedimiento exacto.

## Capacidades

- Generación de vídeo de texto a vídeo (T2V) y de texto-imagen a vídeo (TI2V) a 720p (736×1280) con 193 fotogramas a 24 FPS (aproximadamente 8 segundos).
- Condicionamiento por imagen inicial: permite partir de un primer fotograma para generar la continuación del vídeo.
- Soporte multilingüe para prompts en inglés y chino mediante el codificador Gemma 2 2B IT.
- Generación de movimiento controlable mediante el parámetro `motion_score` (recomendado 20), que ajusta la dinámica de la escena.
- Inferencia con flujo de muestreo (flow matching) y CFG (classifier-free guidance) con escala 8 y 50 pasos.
- Arquitectura eficiente: la combinación de atención lineal y anclajes densos reduce el coste computacional frente a transformers de atención completa, permitiendo resoluciones altas con menos recursos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de audio.

## Casos de uso

- Creación de contenido para marketing y publicidad: generar clips cortos de producto o escenas promocionales a partir de descripciones textuales, con la opción de partir de una imagen de referencia para mantener la identidad visual.
- Prototipado de storyboards en producción audiovisual: los guionistas y directores pueden visualizar rápidamente escenas descritas en texto antes de rodar, ahorrando tiempo y costes en preproducción.
- Generación de vídeos educativos y divulgativos: crear animaciones explicativas de conceptos científicos o técnicos a partir de prompts, sin necesidad de equipos de animación.
- Asistencia en diseño de moda y producto: generar vídeos de prendas u objetos desde una imagen estática para mostrar su movimiento o uso en diferentes contextos.
- Investigación en visión por computador: servir como modelo base para fine-tuning en tareas específicas de generación de vídeo, gracias a su licencia Apache 2.0 y su arquitectura modular.
- Generación de contenido para redes sociales: producir clips cortos de alta resolución para plataformas como Instagram o TikTok, con control sobre el movimiento y la composición mediante el prompt y el motion score.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como FVD, CLIP score ni comparaciones con otros modelos de generación de vídeo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 8,94 GB solo en pesos del transformer (4,47B × 2 bytes). Añadiendo el VAE, el codificador de texto y las activaciones durante el muestreo, se estima un consumo total de 16-24 GB para la resolución 720p con 50 pasos. Esta cifra es una estimación orientativa; no se dispone de mediciones oficiales.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A5000) es suficiente para inferencia en BF16. Para mayor velocidad o procesamiento por lotes, se recomiendan GPUs de datacenter como A100 (40/80 GB) o H100.
- En consumer GPU: sí, cabe en una RTX 3090 o RTX 4090 con 24 GB, siempre que se use BF16 y se limite el tamaño del batch a 1.
- Opciones de despliegue: el soporte oficial se proporciona a través del repositorio SANA (rama `release/sana-video-2.0`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de difusión y no un LLM autoregresivo.
- Latencia y throughput: no disponibles. El tiempo de generación dependerá de la GPU, el número de pasos (50 recomendados) y la resolución. En una RTX 4090 se podría esperar del orden de minutos por clip, pero no hay datos oficiales.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de generación de vídeo como CogVideoX, Mochi, HunyuanVideo o LTX-Video. Tampoco se especifican modelos de la misma categoría con los que se haya comparado.

## Limitaciones y advertencias

- El movimiento, la anatomía, el renderizado de texto, la permanencia de objetos y las interacciones físicas pueden ser inconsistentes, especialmente en escenas concurridas o muy dinámicas.
- El seguimiento del prompt puede degradarse con instrucciones largas, ambiguas o composicionalmente complejas.
- La generación condicionada por imagen puede desviarse de los detalles finos de la imagen de origen.
- Los resultados pueden reflejar sesgos sociales y culturales presentes en los datos de entrenamiento y en el codificador de texto cargado por separado (Gemma 2 2B IT).
- El modelo no verifica de forma independiente si el contenido generado es factual, seguro o libre de derechos de terceros.
- No se recomienda su uso para producir evidencia factual, identificar personas, tomar decisiones automatizadas de alto impacto ni generar contenido que viole la privacidad, los derechos de autor o las políticas de la plataforma.
- El checkpoint solo incluye el state_dict del transformer fusionado; no contiene optimizador, scheduler ni tensores LoRA independientes, por lo que no es adecuado para continuar el entrenamiento directamente sin reconstruir el estado de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir con las leyes aplicables y de revisar los resultados antes de su publicación.

## Enlaces

- [Repositorio SANA](https://github.com/NVlabs/Sana)
- [PR de liberación de SANA-Video 2.0](https://github.com/NVlabs/Sana/pull/439)
- [Documentación de SANA-Video 2.0](https://github.com/NVlabs/Sana/blob/release/sana-video-2.0/docs/sana_video2.md)
- [Model zoo de SANA](https://github.com/NVlabs/Sana/blob/release/sana-video-2.0/docs/model_zoo.md#sana-video-20)
- [Página del proyecto SANA](https://nvlabs.github.io/Sana/Video/)
- [Modelo en HuggingFace](https://huggingface.co/Efficient-Large-Model/SANA-Video_2.0_5B_720p)
