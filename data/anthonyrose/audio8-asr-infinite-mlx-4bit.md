# anthonyrose/Audio8-ASR-Infinite-MLX-4bit

## Resumen

Audio8-ASR-Infinite-MLX-4bit es una conversión al framework MLX del modelo de reconocimiento automático de voz Edge0/Audio8-ASR-Infinite, publicada por el usuario anthonyrose (conversión atribuida a Sasan Sotoodehfar, CAVI AI). No se trata de un modelo nuevo entrenado desde cero, sino de una cuantización y portabilidad a Apple Silicon del checkpoint original, orientada a ejecutar transcripción de audio en streaming directamente sobre hardware Apple (se ha medido en un Apple M5 Max).

El modelo pesa 4.086.290.208 parámetros (unos 4,09 mil millones) y ocupa 3,74 GB en safetensors. La conversión aplica cuantización de 4 bits (afín, tamaño de grupo 64) únicamente al decodificador de texto, incluido el embedding de tokens atado, mientras que mantiene en bf16 la torre de audio tipo Voxtral Realtime, el proyector multimodal, el embedding de longitud de trama, las cabezas de VAD semántico y los MLP `ada_rms_norm`. El resultado es un modelo de ASR con decodificación greedy en streaming que emite un token cada 80 ms, con una ventana rodante de 30 segundos para audio largo.

Es relevante ahora porque cubre un nicho concreto: ASR local y de baja latencia en Macs con chip de la serie M, sin depender de servicios en la nube, con soporte para inglés y chino mandarín y una licencia Apache-2.0 heredada del modelo base que permite uso comercial. La contrapartida es que es una conversión de terceros, no afiliada a Edge0, con muy poca adopción registrada (0 descargas y 0 likes en el momento de la consulta) y con código de arquitectura que aún no está incluido en `mlx-audio` 0.5.7.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR multimodal en streaming: torre de audio tipo Voxtral Realtime + proyector multimodal + decodificador de texto (language model) con embedding atado; cabezas de VAD semántico, embedding de longitud de trama y MLP `ada_rms_norm` |
| Parametros totales | 4.086.290.208 (~4,09 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como contexto de tokens; para audio usa una ventana rodante de decodificador de 30 s y se ha probado con una grabación de 96 s |
| Tipos de cuantizacion | 4 bits afín con tamaño de grupo 64 en el decodificador de texto (incluido el embedding atado); bf16 en torre de audio, proyector, embedding de longitud de trama, cabezas VAD y MLP `ada_rms_norm`. Existe referencia en bf16 sin cuantizar |
| Idiomas soportados | chino (zh) e inglés (en). El parámetro `language` es obligatorio |
| Licencia | Apache-2.0 (pesos y configuración, heredada del modelo base); MIT para el código de `audio8_asr_infinite/` |
| Formato de pesos | safetensors (MLX), `model.safetensors` de 3,74 GB (3,48 GiB) |

## Arquitectura y entrenamiento

La arquitectura es un sistema de ASR compuesto por varios módulos. El front-end de audio es una torre tipo Voxtral Realtime que se mantiene en bf16, seguida de un proyector multimodal que alinea las representaciones acústicas con el espacio del decodificador de texto. El decodificador es un modelo de lenguaje con embedding de tokens atado, y es el único bloque cuantizado a 4 bits en esta conversión. Se añaden componentes específicos para streaming: un embedding de longitud de trama, cabezas de VAD semántico (detección de actividad de voz a nivel semántico) y MLP con normalización `ada_rms_norm`.

El modo de decodificación documentado es greedy en streaming, emitiendo exactamente un token de texto por cada paso de 80 ms. El parámetro `transcription_delay_ms` debe ser un múltiplo positivo de 80 y vale 480 por defecto, lo que fija el retardo entre audio y transcripción. Para audio largo se emplea una ventana rodante de decodificador de 30 segundos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base Edge0/Audio8-ASR-Infinite y no se detallan aquí.

La innovación destacable de este repositorio no es arquitectónica sino de portabilidad: traslada el modelo a MLX para Apple Silicon y demuestra que la cuantización de 4 bits del decodificador apenas degrada la precisión (8,35 % de WER frente a 7,30 % en bf16 sobre el mismo subconjunto de evaluación). Como verificación de fidelidad, el autor indica que el código MLX y una referencia en PyTorch fp32 construida con clases de `transformers` produjeron transcripciones idénticas en 4 clips.

## Capacidades

- Reconocimiento automático de voz en streaming con decodificación greedy, un token de texto cada 80 ms.
- Transcripción en inglés (`en`) y chino mandarín (`zh`); el idioma debe especificarse de forma obligatoria.
- Procesamiento de audio largo mediante ventana rodante de decodificador de 30 s; se documenta una prueba con una grabación de 96 s.
- Retardo de transcripción ajustable mediante `transcription_delay_ms` en múltiplos de 80 ms (480 ms por defecto), lo que permite priorizar latencia o estabilidad.
- Detección de actividad de voz semántica integrada mediante cabezas VAD específicas, útil para segmentar y filtrar silencio o ruido.
- Entrada de audio flexible: ruta a fichero o array mono a 16 kHz.
- Capacidad de audio (torre Voxtral Realtime y proyector multimodal); no se documenta soporte de visión ni de otras modalidades.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de pensamiento (thinking mode), audio de salida o traducción: no disponible.

## Casos de uso

- Dictado y notas de voz en macOS: el modelo se ejecuta íntegramente en Apple Silicon vía MLX y consume 4,2 GB de pico de memoria en un clip de 6 segundos, por lo que puede integrarse en una aplicación de escritorio sin enviar audio a servidores externos.
- Subtitulado en directo: la decodificación emite un token cada 80 ms con un retardo configurable (480 ms por defecto), lo que permite generar subtítulos con latencia controlada en retransmisiones o videollamadas.
- Transcripción de reuniones largas en inglés o chino: la ventana rodante de 30 s permite procesar audio de duración extensa; en la prueba de 96 segundos el modelo transcribió con un WER del 7,11 % en 23,4 segundos de cómputo.
- Preprocesado local de audio con requisitos de privacidad: al ejecutarse en el dispositivo, es adecuado para entornos sanitarios, legales o corporativos donde no se permite exportar grabaciones a la nube.
- Indexación y búsqueda sobre archivos de audio: la transcripción resultante puede alimentar índices de texto o sistemas RAG para localizar fragmentos hablados en archivos y archivos históricos.
- Aplicaciones de accesibilidad sin conexión: transcripción en tiempo real de conversaciones presenciales para personas con discapacidad auditiva, con la ventaja de funcionar sin red.
- Procesamiento por lotes en portátiles Apple: el tamaño de 3,74 GB de pesos permite procesar colas de grabaciones en un Mac con memoria unificada, sin necesidad de GPU dedicada.
- Integración en pipelines MLX nativos: mediante `mlx-audio` y el módulo de arquitectura incluido en el repositorio, se puede invocar desde código Python 3.12 con una API de `load_model` y `generate`.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los medidos por el autor de la conversión en un Apple M5 Max.

| Prueba | 4 bits (este repositorio) | bf16, mismo código MLX |
|---|---|---|
| LibriSpeech validation-clean, subconjunto `hf-internal-testing/librispeech_asr_dummy` (73 enunciados, 1.150 palabras), WER | 8,35 % | 7,30 % |
| Grabación en inglés de 96 s, WER | 7,11 % (decodificada en 23,4 s) | no disponible |
| Grabación en mandarín | transcripción exacta | no disponible |
| Memoria pico, clip de 6 s | 4,2 GB | no disponible |

Notas metodológicas declaradas por el autor: la puntuación de WER se calcula en mayúsculas, con la puntuación eliminada salvo apóstrofos y sin normalización de números ni de ortografía. La comprobación de portabilidad (MLX frente a referencia PyTorch fp32 con clases de `transformers`) produjo transcripciones idénticas en 4 clips. No se han publicado resultados comparativos con otros modelos ASR en la información disponible.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX). No hay soporte CUDA ni ROCm documentado.
- Memoria: pesos de 3,74 GB (3,48 GiB) más activaciones; el autor mide 4,2 GB de pico de memoria con un clip de 6 s. Se recomienda un Mac con al menos 8 GB de memoria unificada, y 16 GB o más para márgenes cómodos en audio largo.
- GPU recomendadas: no aplica; el modelo está pensado para la GPU integrada y la memoria unificada de los chips Apple M (validado en M5 Max). GPU tipo A100, H100 o RTX 4090 no están soportadas por esta implementación.
- ¿Cabe en GPU de consumo? Sí, en el sentido de que cabe en Macs de consumo con Apple Silicon; no está diseñado para GPUs de consumo NVIDIA.
- Despliegue: `mlx-audio==0.5.7` sobre Python 3.12, registrando manualmente el módulo `audio8_asr_infinite` (la versión citada de `mlx-audio` no incluye esta arquitectura). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en la prueba de 96 s de audio, el tiempo de decodificación fue 23,4 s, lo que equivale a un factor de tiempo real aproximado de 4,1x (RTF ~0,24) en un Apple M5 Max con cuantización de 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audio8-ASR-Infinite-MLX-4bit (este repositorio) | 4,09 mil millones, decodificador a 4 bits | Ventana rodante de 30 s | WER 8,35 % en subconjunto LibriSpeech dummy; 7,11 % en grabación de 96 s | Apache-2.0 (pesos) y MIT (código) | HuggingFace, MLX, Apple Silicon |
| Edge0/Audio8-ASR-Infinite (modelo base) | 4,09 mil millones, bf16 | ídem | WER 7,30 % en el mismo subconjunto (según medición del autor de la conversión) | Apache-2.0 | HuggingFace, pesos originales |
| Otros modelos ASR comparables (Whisper large-v3, Voxtral) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar esta conversión con su propio modelo base, donde se observa una degradación de 1,05 puntos porcentuales de WER al pasar de bf16 a 4 bits. No se han facilitado resultados de benchmarks frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Pérdida de precisión por cuantización: el WER sube de 7,30 % a 8,35 % en el subconjunto de evaluación al pasar de bf16 a 4 bits en el decodificador de texto.
- La cuantización solo afecta al decodificador de texto; la torre de audio y otros componentes siguen en bf16, por lo que el ahorro de memoria es parcial respecto a una cuantización completa.
- Cobertura de idiomas limitada a inglés y chino mandarín. No hay soporte documentado de español ni de otros idiomas.
- Dependencia de plataforma: requiere Apple Silicon y MLX; no es desplegable en GPUs NVIDIA ni en servidores x86 convencionales.
- El módulo de arquitectura no está incluido en `mlx-audio` 0.5.7, por lo que hay que registrar `audio8_asr_infinite` manualmente con `sys.modules` antes de cargar el modelo, lo que añade fragilidad al despliegue.
- Es una conversión de terceros: el autor declara no estar afiliado ni respaldado por Edge0, de modo que la calidad y el mantenimiento no dependen del desarrollador original.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes), sin comunidad que valide resultados de forma independiente.
- Riesgo de alucinación inherente a los modelos de ASR neuronales, especialmente en audio con ruido, solapamiento de hablantes, terminología especializada o nombres propios; no se documentan tasas de inserción de texto inexistente.
- Los resultados de WER proceden de un subconjunto pequeño (73 enunciados, 1.150 palabras) y de una única grabación de 96 s, por lo que no deben extrapolarse a dominios distintos ni a audio muy ruidoso.
- Restricciones de licencia: los pesos son Apache-2.0 y el código de la carpeta `audio8_asr_infinite/` es MIT, lo que permite uso comercial, pero conviene verificar la licencia del modelo base Edge0/Audio8-ASR-Infinite y de sus dependencias antes de un despliegue en producción.
- El parámetro `language` es obligatorio y no hay detección automática de idioma documentada, lo que obliga a conocer el idioma del audio de antemano.
- No hay datos publicados sobre consumo energético, comportamiento en audio con música o ruido de fondo intenso, ni sobre estabilidad de la decodificación en ventanas superiores a 96 s.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/anthonyrose/Audio8-ASR-Infinite-MLX-4bit
- Modelo base: https://huggingface.co/Edge0/Audio8-ASR-Infinite
- Código upstream del modelo base: https://github.com/Edge0-AI/Audio8-ASR-Infinite
- Código fuente del port a MLX: https://github.com/cavi-ai/mlx-agent
- Sitio del autor de la conversión: https://cavi-ai.xyz
- Licencia de pesos y configuración: fichero `LICENSE` del repositorio
- Licencia del código de arquitectura: `audio8_asr_infinite/LICENSE` (MIT)

Nota: las búsquedas web realizadas no devolvieron resultados útiles (únicamente páginas genéricas de Google), por lo que no se han podido incorporar papers, blogs o demos adicionales a esta ficha.
