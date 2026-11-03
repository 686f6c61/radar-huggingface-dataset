# mashbox-labs/whisper-large-v3-turbo-coreml-ane

## Resumen

Whisper large-v3-turbo para Apple Neural Engine es una conversión a Core ML del modelo de reconocimiento automático del habla Whisper large-v3-turbo de OpenAI, publicada por mashbox-labs. El objetivo es ejecutar tanto el codificador como el decodificador sobre la Neural Engine (ANE) de los chips Apple Silicon, algo que las implementaciones habituales en PyTorch o Metal no aprovechan directamente. El paquete pesa 970 MB gracias a una cuantización de pesos en 8 bits con paletización, frente a los aproximadamente 1,6 GB del modelo original en fp16.

La relevancia práctica es doble: por un lado, demuestra que es viable llevar un modelo de ASR de 809 millones de parámetros a la ANE con una degradación de precisión mínima; por otro, cubre las 99 lenguas de Whisper, incluidas tailandés, coreano, japonés y chino, que otros modelos optimizados para Apple (como Parakeet) no soportan. El autor lo emplea en producción en su aplicación Free Flow.

El repositorio incluye los tres submodelos Core ML (espectrograma mel, codificador y decodificador con estado), los embeddings en fp16, el vocabulario BPE y un manifiesto con el layout de tensores. Requiere iOS 18 o macOS 15 o posterior y está liberado bajo licencia MIT, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), convertido a Core ML con funciones especializadas por longitud de entrada |
| Parametros totales | 809 M (heredados de Whisper large-v3-turbo; el repositorio no los declara explicitamente) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 5, 10, 20 y 30 s (una función Core ML por longitud); el decodificador genera hasta 8 tokens por paso (`dec_<N>s_s8`) |
| Tipos de cuantizacion | Pesos en 8 bits con paletización (970 MB en total); embeddings del decodificador en fp16 |
| Idiomas soportados | 99 lenguas de Whisper (la model card no lista el conjunto completo) |
| Licencia | MIT (texto de OpenAI, sin modificar) |
| Formato de pesos | `.mlmodelc` (Core ML compilado), `embed_tokens.f16`, `embed_positions.f16`, `vocab.json`, `manifest.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder con atención completa, donde el codificador procesa espectrogramas log-mel de 16 kHz mono y el decodificador autorregresivo genera tokens BPE a partir de las claves y valores de atención cruzada producidos por el codificador. La versión turbo reduce el número de capas del decodificador respecto a large-v3, lo que rebaja el coste de inferencia manteniendo el codificador grande.

Esta publicación no entrena ni ajusta el modelo: es una conversión de la revisión `41f01f3f` de `openai/whisper-large-v3-turbo`. La innovación técnica está en la ingeniería de despliegue. El pipeline se divide en tres artefactos Core ML (`MelSpectrogram`, `AudioEncoder`, `TextDecoder`), cada uno con funciones separadas por longitud de ventana (`mel_<N>s`, `enc_<N>s`, `dec_<N>s_s1` y `dec_<N>s_s8`), de modo que la ANE recibe formas tensoriales estáticas y puede compilar y planificar cada variante por separado. El decodificador es stateful y admite decodificación en bloques de hasta 8 tokens, lo que reduce el número de llamadas al runtime. Los embeddings se mantienen fuera del grafo en fp16 con layout row-major, y el `manifest.json` documenta ids de tokens, listas de supresión y el layout exacto de cada entrada y salida, lo que permite reimplementar el bucle de decodificación sin depender del código del autor.

## Capacidades

- Reconocimiento automático del habla multilingüe en 99 lenguas, con detección de idioma integrada en el prompt del decodificador.
- Transcripción de audio de 16 kHz mono en ventanas de 5, 10, 20 y 30 segundos, con una función Core ML dedicada por longitud.
- Traducción de voz a texto en inglés (capacidad heredada de Whisper, no verificada en los resultados publicados).
- Decodificación greedy documentada; el paquete expone los logits y las listas de supresión, por lo que se pueden implementar búsqueda por haz u otras estrategias en el código anfitrión.
- Generación de hasta 8 tokens por invocación del decodificador (`dec_<N>s_s8`), además de la variante de un token por paso.
- Ejecución íntegra del codificador y el decodificador en la Neural Engine, sin intervención de la GPU ni del CPU para las capas principales.
- No soporta tool calling, function calling, agentes, visión ni audio de entrada distinto de la transcripción.

## Casos de uso

- Transcripción en tiempo casi real en aplicaciones iOS y macOS: con ventanas de 5 y 10 segundos y una latencia mediana de 180 ms por clip en inglés sobre un MacBook Air M5, el modelo encaja en dictado por voz y subtitulado en directo dentro de apps nativas.
- Procesamiento por lotes de archivos de audio en el dispositivo: la variante de 30 segundos maximiza la ocupación de la ANE y permite transcribir grabaciones largas sin enviar audio a la nube, algo crítico para cumplimiento de RGPD en entornos sanitarios o jurídicos.
- Aplicaciones de accesibilidad: subtitulado de conversaciones presenciales en el iPhone o el Mac con consumo energético bajo, ya que la ANE es mucho más eficiente que la GPU para inferencia sostenida.
- Transcripción multilingüe de reuniones: cubre japonés, coreano, chino y tailandés, lenguas que el autor señala como fuera del alcance de Parakeet, con tasas de error de 4,97 %, 3,63 %, 8,23 % y 13,76 % respectivamente en FLEURS.
- Indexación y búsqueda de archivos de audio locales: transcripción masiva de notas de voz, podcasts o grabaciones de clase en un Mac para alimentar un índice de texto sin coste de API.
- Preprocesado para pipelines de subtitulado y traducción: la salida BPE con `vocab.json` y el manifiesto permiten encadenar la transcripción con un modelo de traducción local en el mismo dispositivo.
- Integración en herramientas de desarrollo para macOS: transcripción de reuniones o notas de voz dentro de IDE y utilidades de línea de comandos nativas, aprovechando que no requiere dependencias de Python en tiempo de ejecución.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre clips de test FLEURS reservados, 100 por lengua, decodificación greedy, medidos en un MacBook Air (M5) con macOS 27.2. WER para inglés y CER para el resto. Se comparan con el modelo original en fp16 sobre los mismos clips con ventana fija de 30 s.

| Idioma | Este modelo, error (%) | Tiempo mediano por clip (ms) | Original fp16, error (%) |
|---|---|---|---|
| Inglés | 5,69 | 180 | 5,74 |
| Japonés | 4,97 | 363 | 4,65 |
| Coreano | 3,63 | 339 | 3,47 |
| Tailandés | 13,76 | 537 | 12,68 |
| Chino | 8,23 | 340 | 8,04 |

La cuantización en 8 bits con paletización introduce una degradación de entre 0,05 y 1,08 puntos porcentuales según la lengua, con el mayor impacto en tailandés. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo de ASR, ni comparaciones con otros modelos de reconocimiento del habla.

## Requisitos de hardware

- Ejecución exclusiva en Apple Silicon con Neural Engine: requiere iOS 18 o macOS 15 o posterior.
- Espacio en disco: 970 MB para los pesos más el espacio de compilación de Core ML, que puede duplicar temporalmente el tamaño del paquete.
- Memoria unificada: no se publica un requisito explícito; por el tamaño del paquete y las formas de 30 s, es asumible en dispositivos con 8 GB o más.
- GPU dedicadas (A100, H100, RTX 4090) no aplican: el modelo no se distribuye en formatos CUDA ni GGUF.
- Despliegue mediante el runtime de Core ML (`coremltools`, APIs `MLModel` en Swift/Objective-C); no hay soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia medida: 180 ms por clip en inglés y 537 ms en tailandés (mediana, ventana fija de 30 s, MacBook Air M5). No se publica throughput agregado ni latencia en iPhone.
- No cabe en GPU de consumo convencionales porque no existe una build para ellas; en Mac con Apple Silicon se ejecuta en la ANE, no en la GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| mashbox-labs/whisper-large-v3-turbo-coreml-ane | 809 M (heredados) | Ventanas de 5, 10, 20 y 30 s | 99 | MIT | Core ML, Apple Neural Engine |
| openai/whisper-large-v3-turbo | 809 M | 30 s | 99 | MIT | PyTorch / safetensors, GPU y CPU |
| openai/whisper-large-v3 | 1.550 M | 30 s | 99 | MIT | PyTorch / safetensors, GPU y CPU |
| Parakeet (mencionado por el autor) | no disponible | no disponible | Subconjunto sin tailandés, coreano, japonés ni chino | no disponible | no disponible |

La ventaja frente a Whisper large-v3-turbo original es la ejecución nativa en la ANE con un 40 % menos de peso y una precisión prácticamente idéntica; la desventaja es la dependencia exclusiva del ecosistema Apple y la ausencia de builds para GPU NVIDIA. Frente a large-v3, la variante turbo reduce el coste del decodificador a cambio de algo de precisión, aunque este repositorio no publica una comparación directa entre ambas.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con iOS 18 o macOS 15 o posterior; no hay rutas de despliegue para Linux, Windows ni GPU NVIDIA.
- La cuantización en 8 bits con paletización degrada la precisión entre 0,05 y 1,08 puntos porcentuales en las lenguas evaluadas, con tailandés como caso más afectado (13,76 % de CER).
- Solo se han publicado resultados en cinco lenguas; el rendimiento en las otras 94 no está verificado y puede ser sustancialmente peor en lenguas de bajos recursos.
- El modelo hereda los sesgos de Whisper large-v3-turbo, incluida la tendencia conocida a alucinar texto en silencios, música o ruido, y el sesgo hacia variedades estándar del inglés y otras lenguas mayoritarias.
- No se documenta el comportamiento con acentos marcados, habla con ruido de fondo, solapamiento de hablantes ni audio telefónico de banda estrecha.
- La decodificación documentada es greedy; no se publican resultados con búsqueda por haz, lo que puede infravalorar la precisión alcanzable.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso comunitario ni mantenimiento continuado.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; la licencia del modelo base es el texto de OpenAI sin modificar.
- Repositorio de 1,0 GB: conviene verificar la integridad de los artefactos `.mlmodelc` antes de desplegar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mashbox-labs/whisper-large-v3-turbo-coreml-ane
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Aplicación del autor: https://mashbox.gg
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentación de Core ML: https://developer.apple.com/documentation/coreml
- `coremltools`: https://github.com/apple/coremltools
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
