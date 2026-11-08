# mradermacher/LFM3-Omni-2B-Looped-Latent-v2.1-GGUF

## Resumen

LFM3-Omni-2B-Looped-Latent-v2.1 es un modelo ómnido (texto, imagen, vídeo y audio como entrada; texto y voz como salida) desarrollado originalmente por Liquid AI y publicado en su variante base por el usuario Guilherme34 en Hugging Face. La versión aquí descrita es la cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y compatibles. El modelo es de tipo "no razonador" (non-reasoning) y está pensado para despliegue en dispositivo (on-device), sustituyendo en una sola pieza a un ASR, un modelo visión-lenguaje, un LLM y un TTS.

El checkpoint base cuenta con 2.702.390.080 parámetros (aproximadamente 2,7 mil millones), lo que lo sitúa en la gama pequeña y lo hace viable en GPUs de consumo con cuantizaciones de 4 bits. La arquitectura concreta (transformer denso, híbrido o SSM) no está especificada en la información disponible; el nombre "Looped-Latent" sugiere un esquema de capas recurrentes o latentes compartidas, pero no se confirma en la documentación proporcionada.

La relevancia actual del modelo radica en su carácter multimodal end-to-end y su tamaño contenido: permite construir asistentes de voz y visión en tiempo real sin depender de la nube. No obstante, la información pública disponible es escasa (0 descargas, 0 likes en el momento de la ficha, sin benchmarks ni licencia declarada), por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ómnido multimodal; nombre comercial "Looped-Latent") |
| Parámetros totales | 2.702.390.080 (≈2,7 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj Q8_0 y f16 para la parte multimodal) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El nombre del checkpoint base ("LFM3-Omni-2B-Looped-Latent-v2.1") y la descripción de Liquid AI indican un modelo ómnido end-to-end que procesa texto, imagen, vídeo y audio, y genera texto, voz o texto y voz intercalados. La etiqueta "Looped-Latent" apunta a un mecanismo de capas recurrentes o latentes compartidas, pero no se confirma ni se detalla en las fuentes consultadas.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card de la cuantización GGUF es únicamente un README de conversión y no incluye información sobre el entrenamiento del modelo original. La única indicación relevante es que se trata de un modelo "non-reasoning", es decir, sin modo de razonamiento explícito ni cadena de pensamiento.

## Capacidades

- Comprensión multimodal de entrada: texto, imágenes, vídeo y audio en un único modelo end-to-end.
- Generación de salida multimodal: texto, voz (speech) o texto y voz intercalados.
- Reconocimiento automático de voz (ASR) integrado, al sustituir a un modelo ASR dedicado.
- Síntesis de voz (TTS) integrada, al sustituir a un modelo TTS dedicado.
- Comprensión visión-lenguaje (VLM) integrada para imágenes y vídeo.
- Conversación multi-turno (etiqueta "conversational" en Hugging Face).
- Compatible con endpoints de inferencia (etiqueta "endpoints_compatible").
- Modelo no razonador: no dispone de modo de pensamiento explícito ni cadena de razonamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Asistentes de voz en dispositivo: el modelo unifica ASR, LLM y TTS en una sola pieza de 2,7 B, lo que permite construir un asistente conversacional por voz que funcione sin conexión en un portátil o un dispositivo embebido con GPU integrada.
- Transcripción y resumen de reuniones: al combinar ASR y generación de texto, puede transcribir audio y producir resúmenes o actas en una sola pasada, reduciendo la latencia frente a pipelines con varios modelos.
- Descripción de imágenes y vídeo para accesibilidad: la entrada visual integrada permite generar descripciones en texto o en voz de imágenes y clips cortos, útil en aplicaciones de lectores de pantalla.
- Interfaces conversacionales con respuesta hablada: la salida de voz intercalada con texto permite construir agentes de atención al cliente que respondan hablando, con un coste de hardware muy inferior al de un pipeline multimodal en la nube.
- Prototipado rápido de aplicaciones multimodales: las cuantizaciones Q4_K_S y Q4_K_M (1,7-1,8 GB) permiten iterar en local con llama.cpp u Ollama sin infraestructura dedicada.
- Análisis de contenido audiovisual en el borde (edge): al ser un modelo pequeño y multimodal, puede desplegarse en dispositivos con recursos limitados para clasificar o resumir audio y vídeo en tiempo real.
- Investigación en modelos ómnidos: sirve como referencia ligera para estudiar la integración de modalidades en un único transformer, aunque la falta de documentación sobre arquitectura y entrenamiento limita su uso académico riguroso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,2 GB
  - Q3_K_S: ~1,4 GB
  - IQ4_XS: ~1,6 GB
  - Q4_K_S: ~1,7 GB
  - Q4_K_M: ~1,8 GB
  - Q5_K_M: ~2,0 GB
  - Q6_K: ~2,3 GB
  - Q8_0: ~3,0 GB
  - f16: ~5,5 GB
- Componente multimodal adicional: mmproj Q8_0 (~0,6 GB) o mmproj f16 (~1,0 GB) para entrada de imagen, vídeo y audio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones de 4 bits; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque para un modelo de 2,7 B las consumer son suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 4 GB o más de VRAM; también en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). vLLM y TGI no se confirman para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de modelos de la misma categoría en la información proporcionada. Como referencia cualitativa, la familia LFM2 de Liquid AI incluye modelos de 1,2 B y 2,6 B orientados a dispositivo, pero no se confirman sus especificaciones ni su rendimiento relativo a este checkpoint.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-Looped-Latent-v2.1 (este) | 2,7 B | no disponible | no disponible | GGUF, safetensors | Ómnido (texto/imagen/vídeo/audio) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo legal relevante para producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Modelo no razonador: no dispone de modo de pensamiento ni cadena de razonamiento, lo que limita tareas de razonamiento complejo o multi-paso.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no hay evaluación específica publicada.
- Sesgos: no documentados; al entrenarse presumiblemente con datos en inglés, es probable un sesgo cultural y lingüístico hacia ese idioma.
- Contexto: longitud no disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Checkpoint de terceros: la versión GGUF la publica mradermacher a partir de un checkpoint de Guilherme34, no de Liquid AI directamente; la fidelidad al modelo original no está verificada.
- Madurez: 0 descargas y 0 likes en el momento de la ficha, sin comunidad ni validación externa.
- Cuantizaciones estáticas únicamente: no hay cuantizaciones ponderadas/imatrix disponibles, lo que puede degradar la calidad en bits bajos (Q2_K, Q3_K_S).

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/mradermacher/LFM3-Omni-2B-Looped-Latent-v2.1-GGUF
- Modelo base: https://huggingface.co/Guilherme34/LFM3-Omni-2B-Looped-Latent-v2.1
- Variante GGUF del autor del base: https://huggingface.co/Guilherme34/LFM3-Omni-2B-Looped-Latent-v2.1-GGUF
- Documentación oficial de Liquid AI sobre LFM3-Omni-2B: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
- Página de descargas del cuantizador: https://hf.tst.eu/model#LFM3-Omni-2B-Looped-Latent-v2.1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
