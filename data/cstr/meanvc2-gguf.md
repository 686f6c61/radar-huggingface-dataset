# cstr/MeanVC2-GGUF

## Resumen

MeanVC2 es una arquitectura de conversión de voz (voice conversion) zero-shot y en streaming de baja latencia, desarrollada por ASLP@NPU (Audio, Speech and Language Processing Lab de la Northwestern Polytechnical University). El repositorio `cstr/MeanVC2-GGUF` contiene los pesos del modelo original `ASLP-lab/MeanVC2` convertidos al formato GGUF y cuantizados para su uso con el motor de inferencia CrispASR, lo que permite ejecutar la conversión de voz en hardware de consumo sin necesidad de GPU de datacenter.

El modelo resuelve el problema de transformar la identidad vocal de un audio fuente (timbre del hablante) hacia la de un hablante objetivo, preservando el contenido lingüístico y la prosodia, sin necesidad de entrenamiento específico por hablante (zero-shot) y con capacidad de operar en modo streaming con ventanas de 120 ms y 40 ms. Combina un codificador ASR preentrenado invariante al hablante, un codificador universal de tokens de timbre y un modelo de difusión basado en flow matching de un solo paso (1-NFE), seguido de un vocoder neuronal.

Este repositorio GGUF es relevante porque reduce un pipeline de conversión de voz de varios cientos de millones de parámetros a ficheros de 77 a 175 MB, haciéndolo desplegable en entornos con recursos limitados y en aplicaciones de tiempo real. El modelo base está publicado bajo licencia Apache-2.0 y soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: Conformer ASR (Fast-U2++), encoder de timbre UTTE (GTM + TVT), DiT con flow matching 1-NFE y vocoder Vocos (ConvNeXt + iSTFT) |
| Parametros totales | 83.388.050 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de streaming de 120 ms / 40 ms) |
| Tipos de cuantizacion | Q4_K/Q6_K (lineales), Q8_0, F16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

MeanVC2 es un pipeline de conversión de voz compuesto por cuatro módulos acoplados. El primero es un codificador ASR Conformer Fast-U2++ preentrenado en modo streaming, con ventanas de 160 ms y 80 ms, que extrae características bottleneck invariantes al hablante. El segundo es el Universal Timbre Token Encoder (UTTE), que incorpora Global Timbre Memory (GTM) y atención cruzada temporal de timbre (TVT) para representar la identidad vocal del hablante objetivo de forma desacoplada del contenido. El tercero es un Diffusion Transformer (DiT) entrenado con flow matching de un solo paso de evaluación (1-NFE), con Future-Receptive Chunking (FRC) y caché KV causal para permitir generación en streaming con latencia baja. El cuarto es el vocoder neuronal Vocos, con backbone ConvNeXt y síntesis mediante STFT inversa.

El modelo está diseñado explícitamente para robustez y baja latencia en streaming, con ventanas de 120 ms y 40 ms en la variante publicada en este repositorio. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles.

## Capacidades

- Conversión de voz zero-shot: transforma el timbre de un audio fuente hacia un hablante objetivo sin entrenamiento específico por hablante.
- Streaming de baja latencia: procesa audio en ventanas de 120 ms con solapamiento de 40 ms, apto para aplicaciones en tiempo real.
- Preservación de contenido lingüístico: al usar un codificador ASR invariante al hablante, mantiene el contenido del habla mientras cambia la identidad vocal.
- Soporte multilingüe limitado a inglés (en) y chino (zh).
- Inferencia cuantizada: disponible en Q4_K/Q6_K, Q8_0 y F16, con paridad numérica completa en la versión F16.
- Integración con CrispASR mediante CLI (`crispasr-convert`).
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no aplica a este tipo de modelo.

## Casos de uso

- Anonimización de voz en producción: el modelo puede transformar la identidad vocal de grabaciones de clientes o pacientes hacia una voz genérica antes de almacenarlas, preservando el contenido para análisis posteriores y reduciendo el riesgo de reidentificación.
- Doblaje y localización de contenido: permite sustituir la voz de un actor por la de otro hablante manteniendo la prosodia y el contenido, útil en pipelines de doblaje automatizado para inglés y chino.
- Prototipado de asistentes de voz personalizados: integrado en CrispASR, permite asignar una identidad vocal consistente a un asistente conversacional sin entrenar un modelo TTS específico por voz.
- Investigación en privacidad del habla: sirve como herramienta de referencia para estudiar hasta qué punto la conversión de voz preserva o elimina rasgos biométricos del hablante.
- Generación de datos sintéticos para entrenamiento de sistemas ASR: se pueden generar variantes de un mismo corpus con distintas identidades vocales para aumentar la diversidad de hablantes en datasets de entrenamiento.
- Aplicaciones de accesibilidad: conversión de voz hacia un timbre preferido por el usuario en tiempo real, con latencia de ventana de 120 ms, adecuada para comunicación asistida.
- Despliegue en dispositivos de borde: al ocupar entre 77 y 175 MB en GGUF, puede ejecutarse en CPUs y GPUs de consumo para aplicaciones embebidas de conversión de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; el fichero Q4_K ocupa 77 MB, Q8_0 111 MB y F16 175 MB, por lo que el pico de memoria incluye además buffers de activación del pipeline ASR, DiT y vocoder.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no se requiere A100 ni H100. Una RTX 4090 o RTX 3060 es más que suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: CrispASR (CLI `crispasr-convert`); el formato GGUF es compatible con el ecosistema ggml, aunque la integración documentada es específica de CrispASR.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el diseño apunta a streaming con ventanas de 120 ms y 40 ms, pero no se publican cifras de RTF ni de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MeanVC2 (este repo) | 83,4 M | streaming 120 ms / 40 ms | en, zh | Apache-2.0 | GGUF |
| ASLP-lab/MeanVC2 (original) | 83,4 M | streaming 120 ms / 40 ms | en, zh | Apache-2.0 | safetensors |
| Otros modelos de voice conversion zero-shot | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de conversión de voz zero-shot comparables, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse presumiblemente con corpus de inglés y chino, el rendimiento puede degradarse en otros idiomas y acentos.
- Riesgo de alucinación: en conversión de voz, el riesgo se traduce en artefactos, prosodia incorrecta o pérdida de inteligibilidad, especialmente en hablantes fuera de dominio.
- Limitaciones de contexto o idioma: solo se declaran inglés y chino; no hay soporte documentado para otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al modelo base `ASLP-lab/MeanVC2`.
- Caveats para producción: la integración documentada es exclusivamente con CrispASR; no se garantiza compatibilidad con otros runners GGUF. La cuantización Q4_K/Q6_K preserva atenciones, convoluciones y normas en FP16/FP32, pero puede introducir degradación numérica frente a F16, que es la referencia de paridad.
- Uso dual: la conversión de voz puede emplearse para suplantación de identidad o deepfakes; es responsabilidad del desplegador aplicar controles de consentimiento y marcas de agua.
- Madurez del repositorio: 87 descargas y 0 likes en el momento de la consulta, lo que indica baja validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/cstr/MeanVC2-GGUF
- Modelo base: https://huggingface.co/ASLP-lab/MeanVC2
- Repositorio GitHub del modelo base: https://github.com/ASLP-lab/MeanVC2
- Motor de inferencia CrispASR: https://github.com/CrispStrobe/CrispASR
