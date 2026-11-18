# Audio8/Audio8-TTS-Preview-0.6b

## Resumen

Audio8 TTS Preview 0.6B es un modelo de síntesis de voz (text-to-speech) multilingüe con clonación de voz zero-shot, desarrollado por Audio8. Con 601.159.424 parámetros (excluyendo el códec), resuelve el problema de generar habla natural en 11 idiomas a partir de una referencia de audio corta, sin necesidad de entrenamiento adicional por voz. Es relevante porque ofrece calidad que el autor califica de "SOTA-class" en un tamaño compacto que cabe en GPU de consumo e incluso en CPU mediante una variante ONNX INT4.

La arquitectura es un transformer autorregresivo dual (DualAR) inspirado en Fish Audio S2 Pro: un transformer AR lento predice un token semántico por frame de audio y un transformer AR rápido predice los codebooks del códec condicionado al estado oculto del lento. El modelo incluye su propio códec neuronal de audio a 44,1 kHz, tokenizador, procesador y código remoto de Hugging Face, por lo que no requiere checkpoints adicionales.

Se distribuye con licencia Apache 2.0, lo que facilita su uso comercial, y admite tanto clonación de voz con audio de referencia como generación sin referencia. Es una versión preview: la cobertura de idiomas está deliberadamente limitada a 11 lenguas y el autor anuncia mayor cobertura multilingüe y dialectos chinos en futuras versiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo dual (DualAR): Slow AR + Fast AR, con códec neuronal de audio |
| Parametros totales | 601.159.424 (excluyendo el códec) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | BF16/FP32 en el checkpoint original; INT4 weight-only (ONNX) para CPU con activaciones, KV cache y códec en FP16 |
| Idiomas soportados | Cantonés (yue), chino (zh), neerlandés (nl), inglés (en), francés (fr), alemán (de), italiano (it), japonés (ja), coreano (ko), polaco (pl), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); variante ONNX INT4 en repo separado |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DualAR. El transformer Slow AR (24 capas, anchura 896, 14 cabezas de atención, 2 cabezas KV) predice un token semántico por cada frame de audio. El transformer Fast AR (4 capas, anchura 896, 14 cabezas de atención, 2 cabezas KV) predice los codebooks del códec para ese frame, condicionado al estado oculto del Slow AR y a los codebooks precedentes. La representación acústica usa 10 codebooks con 4.096 entradas cada uno.

El códec incluido opera a 44,1 kHz con 2.048 muestras por frame del modelo (aproximadamente 21,5 frames por segundo) y se encarga tanto de la codificación del audio de referencia como de la decodificación a forma de onda. El contexto máximo es de 2.048 posiciones empaquetadas de texto y audio.

No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz multilingüe en 11 idiomas: cantonés, chino, neerlandés, inglés, francés, alemán, italiano, japonés, coreano, polaco y español.
- Clonación de voz zero-shot a partir de un audio de referencia y su transcripción exacta.
- Generación de voz sin referencia (voz por defecto) omitiendo los parámetros de audio y texto de referencia.
- Salida de audio a 44,1 kHz mediante el códec neuronal integrado.
- Procesamiento por lotes (batching) y streaming de PCM según la documentación del repositorio.
- Registro de voces en el flujo de despliegue ONNX para reutilización posterior.
- Ajuste fino supervisado (SFT) soportado según el repositorio del proyecto.
- Control de generación mediante parámetros de muestreo (temperatura, top-p, top-k) y `max_new_tokens`.

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera habla natural a 44,1 kHz en varios idiomas y permite clonar una voz concreta a partir de una muestra corta, manteniendo consistencia de timbre en textos largos dentro del contexto de 2.048 posiciones.
- Doblaje y localización de contenido: con soporte para 11 idiomas y clonación zero-shot, se puede reutilizar la voz del actor original en distintas lenguas sin reentrenar el modelo.
- Asistentes de voz y atención al cliente: la variante ONNX INT4 funciona en CPU con aproximadamente 1 GiB de memoria tras la carga, lo que permite desplegar servicios HTTP de síntesis en infraestructura sin GPU.
- Accesibilidad y lectura de textos: generación de voz sin referencia para convertir artículos, documentos o notificaciones en audio, con despliegue ligero en dispositivos de bajos recursos.
- Prototipado de interfaces conversacionales: el pipeline de transformers con `trust_remote_code=True` y el CLI del repositorio permiten integrar TTS en aplicaciones de prueba con pocas líneas de código.
- Producción de contenido para redes y vídeo: generación por lotes y streaming PCM facilitan la creación de pistas de voz para vídeos, pódcasts o anuncios en varios idiomas.
- Investigación en clonación de voz: el checkpoint completo, el códec, el tokenizador y el procesador permiten experimentar con SFT y estudiar el comportamiento del esquema DualAR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1,2-1,5 GB solo para los pesos del modelo principal (601 M de parámetros), más el códec y las cachés KV; se recomienda una GPU con al menos 4 GB para trabajar con margen.
- GPU recomendadas: cualquier GPU CUDA moderna con soporte BF16; el modelo es lo bastante pequeño para ejecutarse en RTX 4090, A100 o H100 sin problemas, aunque no aprovecha su capacidad.
- GPU de consumo: cabe holgadamente en tarjetas de 8 GB o menos, incluidas gamas medias con soporte BF16.
- CPU: la variante ONNX INT4 corre con ONNX Runtime `CPUExecutionProvider` sin CUDA, con aproximadamente 1 GiB de memoria tras la carga en la configuración probada por el autor (Apple M2).
- Opciones de despliegue: transformers (con `trust_remote_code=True`), ONNX Runtime con el paquete INT4 (CLI, servicio web y HTTP, streaming PCM) y el repositorio oficial para inferencia por línea de comandos, batching y SFT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Audio8 TTS Preview 0.6B | 601 M (sin códec) | 2.048 posiciones | 11 | Apache 2.0 | Clonación zero-shot, códec 44,1 kHz incluido, variante ONNX INT4 para CPU |
| Fish Audio S2 Pro | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia del diseño DualAR; datos no disponibles en la información proporcionada |
| Alternativas de TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Es una versión preview: la cobertura de idiomas está limitada intencionalmente a los 11 idiomas recomendados; el soporte multilingüe amplio y los dialectos chinos quedan para futuras versiones.
- La clonación de voz exige que la transcripción de referencia coincida exactamente con el contenido hablado del audio; discrepancias degradan la calidad.
- Riesgo de uso indebido para suplantación de identidad o deepfakes de voz; la licencia Apache 2.0 no impone restricciones de uso, por lo que la responsabilidad ética y legal recae en el desplegador.
- Posibles sesgos en la voz generada derivados de los datos de entrenamiento; no se documenta la composición del dataset en la información disponible.
- Riesgo de alucinación acústica o artefactos en textos fuera de distribución, idiomas no soportados o referencias de audio ruidosas.
- El contexto de 2.048 posiciones empaquetadas limita la duración de las síntesis en una sola pasada; para textos largos conviene segmentar.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene revisar los ficheros antes de cargarlo en producción.
- No se han publicado métricas de calidad objetivas (MOS, WER, similitud de hablante) en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6b
- Variante ONNX INT4: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6B-ONNX-INT4
- Repositorio GitHub: https://github.com/Audio8-AI/Audio8_TTS
- Demo en vivo: https://edge0-ai.github.io/Audio8_TTS/preview-0.6b/
- Licencia en GitHub: https://github.com/Edge0-AI/Audio8_TTS/blob/master/LICENSE
- Guía de CPU con ONNX Runtime: https://github.com/Audio8-AI/Audio8_TTS/tree
- Proyecto de referencia (Fish Audio S2 Pro): https://github.com/fishaudio/fish-speech
