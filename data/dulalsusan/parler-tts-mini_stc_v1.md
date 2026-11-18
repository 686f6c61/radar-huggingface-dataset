# dulalSusan/parler-tts-mini_stc_v1

## Resumen

`dulalSusan/parler-tts-mini_stc_v1` es un modelo de síntesis de voz (text-to-audio) publicado en Hugging Face por el usuario dulalSusan. Según los metadatos del repositorio, se trata de un modelo basado en la arquitectura VITS (etiqueta `vits`), empaquetado para su uso con la librería `transformers` y con pesos en formato `safetensors`. El nombre sugiere una variante reducida ("mini") de la familia Parler-TTS, aunque no hay confirmación documental de esa relación en la información disponible.

El modelo cuenta con 42.445.872 parámetros (aproximadamente 42,4 millones) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de modelos TTS ligeros, aptos para inferencia en CPU o GPU de gama baja. La model card está generada automáticamente y no contiene información sustantiva sobre datos de entrenamiento, licencia, idiomas o evaluación.

La relevancia de esta ficha es limitada: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y carece de documentación técnica publicada por el autor. Se documenta aquí como referencia de un checkpoint TTS pequeño, pero cualquier uso en producción requeriría una validación empírica previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (según etiqueta del repositorio); detalles no disponibles |
| Parametros totales | 42.445.872 (~42,4 M) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo text-to-audio; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La única información arquitectónica disponible es la etiqueta `vits` del repositorio, que apunta a la familia de modelos VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un enfoque de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normales invertibles y un discriminador adversarial entrenado con pérdidas GAN y de reconstrucción espectrograma. No obstante, el repositorio también declara la etiqueta `transformers`, lo que sugiere que el checkpoint se ha empaquetado para su carga mediante la API de `transformers`; la combinación exacta de componentes no está documentada.

No se dispone de información sobre el número de tokens o horas de audio de entrenamiento, la composición del dataset, el uso de RLHF/DPO (poco habitual en TTS) ni innovaciones técnicas específicas. La model card no incluye sección de detalles de entrenamiento cumplimentada. El nombre "stc_v1" no se aclara en la documentación.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-audio`), según los metadatos del repositorio.
- Generación de audio condicionada por texto; no se documenta control explícito de hablante, emoción o prosodia.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking, visión, audio de entrada).

## Casos de uso

- Lectura de artículos y boletines en aplicaciones de accesibilidad: un modelo de ~42 M de parámetros puede ejecutarse en tiempo real en CPU para convertir texto en voz en lectores de pantalla, siempre que la calidad se valide empíricamente.
- Generación de avisos de voz en sistemas embebidos o de bajo consumo: el tamaño reducido del checkpoint (0,2 GB) permite desplegarlo en dispositivos con recursos limitados, como Raspberry Pi o routers con servicios de notificación.
- Prototipado rápido de interfaces conversacionales: útil para pruebas de concepto de asistentes de voz antes de invertir en modelos TTS de mayor calidad.
- Síntesis de audio para videojuegos indie o demos: generación de líneas de diálogo de marcador de posición durante el desarrollo, sustituibles por voces profesionales en la fase final.
- Investigación en TTS ligero: punto de partida para experimentos de destilación, cuantización o fine-tuning sobre dominios específicos, dado su reducido coste computacional.
- Pruebas de integración del pipeline `text-to-audio` de `transformers`: validación de infraestructura de inferencia antes de migrar a modelos TTS de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 42,4 M de parámetros (los pesos ocupan aproximadamente 170 MB en fp32 y ~85 MB en fp16); el pico real depende de la longitud del audio generado y de los buffers intermedios.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede usar desde una GTX 1050 Ti hasta una H100 sin cuello de botella por memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna; también es viable en CPU.
- Opciones de despliegue: al estar etiquetado para `transformers`, la vía natural es el pipeline `text-to-audio` de la librería; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS VITS).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `dulalSusan/parler-tts-mini_stc_v1` | ~42,4 M | no aplica | no disponible | Hugging Face, 0 descargas |
| Parler-TTS Mini (referencia de la familia, si el nombre alude a ella) | no disponible en esta ficha | no aplica | no disponible | Hugging Face |
| VITS original (paper) | no disponible en esta ficha | no aplica | no disponible | Repositorio académico |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a la existencia y al tamaño declarado.

## Limitaciones y advertencias

- La model card está generada automáticamente y no aporta información sobre sesgos, datos de entrenamiento ni evaluación; no es posible auditar el modelo con la documentación disponible.
- Riesgo de alucinación no evaluado: en TTS, esto se traduce en posibles artefactos, prosodia incorrecta o pronunciación errónea no documentada.
- Idiomas soportados desconocidos; no se debe asumir cobertura multilingüe.
- Licencia no disponible: no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de integrarlo en productos.
- Modelo con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- El nombre sugiere una variante "mini" de Parler-TTS, pero no hay confirmación de que herede su arquitectura ni su tokenizador; la etiqueta `vits` apunta a una arquitectura distinta de la de Parler-TTS (basada en transformer autoregresivo y DAC).
- No se documentan limitaciones de longitud de texto ni de duración de audio generado.

## Enlaces

- Hugging Face: https://huggingface.co/dulalSusan/parler-tts-mini_stc_v1
- Paper de VITS (referenciado en las etiquetas del repositorio): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono citada en la model card: https://mlco2.github.io/impact#compute
- Referencia de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
