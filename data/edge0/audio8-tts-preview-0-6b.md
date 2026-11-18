# Edge0/Audio8-TTS-Preview-0.6b

## Resumen

Audio8 TTS Preview 0.6B es un modelo de síntesis de voz (text-to-speech) multilingüe con clonación de voz zero-shot, desarrollado por Edge0 (Audio8 AI). Con 601.159.424 parámetros (excluyendo el códec), resuelve el problema de generar habla natural en 11 idiomas a partir de una referencia de audio corta, sin necesidad de entrenamiento adicional por hablante. Es relevante ahora porque ofrece calidad calificada por el autor como "SOTA-class" en un tamaño compacto que cabe en GPU de consumo e incluso en CPU mediante una variante ONNX INT4.

El modelo emplea una arquitectura DualAR inspirada en Fish Audio S2 Pro: un transformer autorregresivo lento que predice un token semántico por trama de audio y un transformer autorregresivo rápido que predice los codebooks del códec condicionado al estado oculto del lento. Incluye su propio códec neuronal de audio a 44,1 kHz, por lo que no requiere checkpoints externos de códec.

La versión es una "preview": la cobertura de idiomas está intencionadamente limitada a 11 lenguas recomendadas y el autor anuncia mayor cobertura multilingüe y dialectos chinos en futuras releases. La licencia Apache 2.0 y el soporte de `transformers` con código remoto facilitan su integración en pipelines de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DualAR (slow AR + fast AR) sobre transformer, con códec neuronal de audio |
| Parámetros totales | 601.159.424 (excluyendo el códec) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantización | FP16/BF16 (pesos originales); INT4 weight-only en la variante ONNX (activaciones, KV cache y códec en FP16) |
| Idiomas soportados | yue (cantonés), zh, nl, en, fr, de, it, ja, ko, pl, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); ONNX INT4 disponible en repo separado |

Detalles de componentes según la model card:

| Componente | Configuración |
|---|---|
| Slow AR | 24 capas, anchura 896, 14 cabezas de atención, 2 KV heads |
| Fast AR | 4 capas, anchura 896, 14 cabezas de atención, 2 KV heads |
| Tokens acústicos | 10 codebooks, 4.096 entradas por codebook |
| Códec | 44,1 kHz, 2.048 muestras por trama (~21,5 tramas/s) |
| Contexto | hasta 2.048 posiciones empaquetadas texto/audio |

## Arquitectura y entrenamiento

La arquitectura es DualAR: el transformer lento (slow AR, 24 capas) predice un token semántico por cada trama de audio, mientras que el transformer rápido (fast AR, 4 capas) predice los codebooks del códec de esa trama condicionado al estado oculto del slow AR y a los codebooks precedentes. El códec integrado, a 44,1 kHz y con 2.048 muestras por trama del modelo (~21,5 tramas por segundo), se encarga tanto de codificar el audio de referencia como de decodificar la forma de onda, evitando dependencias de checkpoints de códec externos.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco detalla innovaciones adicionales como decodificación especulativa o atención lineal. La información disponible se limita a la arquitectura, los componentes y el proceso de inferencia.

## Capacidades

- Generación de voz multilingüe en 11 idiomas: cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español.
- Clonación de voz zero-shot a partir de un audio de referencia y su transcripción exacta.
- Generación sin referencia de voz, omitiendo `reference_audio` y `reference_text`.
- Salida de audio a 44,1 kHz mediante el códec neuronal incluido.
- Inferencia con sampling configurable (temperatura, top-p, top-k) y `max_new_tokens`.
- Soporte de procesamiento por lotes (batching) según el repositorio del proyecto.
- Ajuste fino supervisado (SFT) documentado en el repositorio de GitHub.
- Despliegue en CPU mediante ONNX Runtime con pesos INT4 y servicio HTTP con streaming PCM.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada más allá de la referencia ni modo de razonamiento.

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera voz natural a 44,1 kHz en 11 idiomas, adecuado para convertir grandes volúmenes de texto en audio con una voz consistente mediante clonación zero-shot de un narrador de referencia.
- Doblaje y localización de contenidos: con clonación zero-shot se puede replicar la voz de un actor original en otro idioma (por ejemplo, español o francés) usando una muestra corta y su transcripción, reduciendo el coste frente al doblaje tradicional.
- Asistentes de voz y atención al cliente: la variante ONNX INT4 permite ejecutar síntesis en CPU con ~1 GiB de memoria tras la carga, lo que facilita desplegar voces personalizadas en servidores sin GPU o en entornos edge.
- Accesibilidad: conversión de texto a voz de alta fidelidad para lectores de pantalla y aplicaciones de accesibilidad, con selección de voz mediante referencia de audio y cobertura de idiomas europeos y asiáticos.
- Creación de contenido y podcasts: generación de locuciones con voces clonadas para vídeos, podcasts y anuncios, con control de sampling (temperatura, top-p, top-k) para ajustar la expresividad.
- Prototipado de productos de voz: integración vía `transformers` con `trust_remote_code=True` y servicio HTTP con streaming PCM de la variante ONNX, útil para validar interfaces de voz antes de invertir en infraestructura GPU.
- Investigación en TTS: el checkpoint completo con códec, tokenizer y processor, junto con el código de SFT en GitHub, sirve como base para experimentos de clonación de voz y ajuste fino en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,2 GB solo para los pesos del modelo principal (601 M de parámetros), más el códec y las cachés KV; se recomienda una GPU con al menos 4-8 GB de VRAM para operar con margen, aunque la cifra exacta no está publicada.
- GPU recomendadas: el autor indica que se recomienda una GPU con CUDA; no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: por el tamaño de pesos, es viable en GPUs consumer con suficiente VRAM; la model card no detalla modelos concretos.
- Despliegue en CPU: variante ONNX INT4 con ONNX Runtime `CPUExecutionProvider`, ~1 GiB de memoria tras la carga en la configuración probada con Apple M2, sin dependencia de PyTorch ni Transformers tras la descarga.
- Opciones de despliegue: `transformers` (PyTorch, `trust_remote_code=True`), ONNX Runtime (INT4 en CPU), CLI, servicio web y HTTP con streaming PCM, y registro de voces según el repositorio de GitHub.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audio8 TTS Preview 0.6B | 601 M (sin códec) | 2.048 posiciones | 11 | Apache 2.0 | HF (safetensors) + ONNX INT4 |
| Fish Audio S2 Pro (referencia arquitectónica citada) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card cita Fish Audio S2 Pro únicamente como inspiración arquitectónica; no se proporcionan datos comparativos de rendimiento ni especificaciones de modelos alternativos en la información disponible.

## Limitaciones y advertencias

- Estado "preview": la cobertura de idiomas está limitada intencionadamente a los 11 idiomas recomendados; el autor anuncia mayor cobertura y dialectos chinos en futuras releases.
- La clonación zero-shot exige que la transcripción de referencia coincida exactamente con el contenido hablado en el audio de referencia.
- Requiere `trust_remote_code=True` y revisión del código remoto del repositorio antes de cargar el modelo, lo que implica riesgos de seguridad si no se audita.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones específicas de contexto o idioma más allá de la cobertura declarada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar los términos del repositorio y del código remoto.
- En producción conviene evaluar la calidad de clonación con audios de referencia variados y controlar el uso de voces de terceros por implicaciones legales y éticas.
- Latencia y throughput no publicados; es necesario medirlos en el hardware objetivo antes de dimensionar infraestructura.
- La variante ONNX INT4 usa cuantización weight-only INT4 en los transformers slow y fast AR, con posibles pérdidas de calidad frente a FP16/BF16 no cuantificadas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Repositorio GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Demo en vivo: https://edge0-ai.github.io/Audio8_TTS/preview-0.6b/
- Variante ONNX INT4: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6B-ONNX-INT4
- Licencia: https://github.com/Edge0-AI/Audio8_TTS/blob/master/LICENSE
- Guía de CPU con ONNX Runtime: https://github.com/Audio8-AI/Audio8_TTS/tree
- Referencia arquitectónica (Fish Audio S2 Pro): https://github.com/fishaudio/fish-speech
