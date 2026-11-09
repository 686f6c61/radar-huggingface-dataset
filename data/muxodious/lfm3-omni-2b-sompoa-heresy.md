# MuXodious/LFM3-Omni-2B-SOMPOA-heresy

## Resumen

LFM3-Omni-2B-SOMPOA-heresy es una variante "decensored" (abliterated) del modelo multimodal LiquidAI/LFM3-Omni-2B, publicada por el usuario independiente MuXodious. El modelo base, desarrollado por Liquid AI, es un modelo ómnido de extremo a extremo de 2.166.928.384 parámetros que comprende texto, imágenes, vídeo y audio como entrada, y genera texto, habla o una mezcla intercalada de ambos como salida. Forma parte de la familia LFM3, presentada el 27 de octubre de 2026, cuyos seis modelos de la clase 2B comparten el mismo backbone LFM3-1.7B-Base.

La modificación aplicada consiste en un proceso de eliminación de rechazos mediante Heretic v2.2.0.dev0 con el algoritmo SOMPOA (una variante de abliteration con dirección de rechazo y pesos por capa en las proyecciones `attn.o_proj` y `mlp.down_proj`). Según la model card, el resultado reduce las negativas de 98/101 a 2/101 en el conjunto de evaluación del autor, con una divergencia KL de 0.0413 respecto al original. Es relevante para quien necesite un modelo ómnido pequeño, ejecutable en el borde, sin las capas de rechazo del modelo alineado original.

El modelo conserva la arquitectura y las capacidades del LFM3-Omni-2B, pero su licencia heredada (lfm1.0) y la naturaleza de la modificación plantean advertencias importantes para uso en producción. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que se trata de un experimento de publicación reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal ómnido (familia LFM3, backbone LFM3-1.7B-Base); detalles internos no disponibles |
| Parámetros totales | 2.166.928.384 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo con safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B es, según la documentación de Liquid AI, el primer modelo ómnido de la compañía: un único modelo de extremo a extremo que comprende texto, imágenes, vídeo y audio y responde en texto, habla o texto y habla intercalados. Pertenece a la familia LFM3, publicada el 27 de octubre de 2026, en la que seis modelos de la clase 2B (texto, visión, audio, ómnido y de decisión) ramifican desde el mismo backbone LFM3-1.7B-Base. No se dispone de detalles públicos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada.

La variante aquí descrita aplica Heretic v2.2.0.dev0 con el algoritmo SOMPOA. La model card detalla los parámetros del proceso: `direction_index` de 14.07, `attn.o_proj.max_weight_position` de 12.85 y `mlp.down_proj.max_weight_position` de 6.57, con vectores de pesos por capa (índices 0 a 5) para las proyecciones de atención y de la MLP. El autor reporta cuatro ensayos (T130, T183, T237, T356) con divergencias KL de 0.0413, 0.0205, 0.0179 y 0.0159 respectivamente, y una tabla adicional de hasta 10 ensayos con recuentos de rechazo entre 2/101 y 23/101. La técnica es una abliteration quirúrgica que modifica direcciones de activación asociadas al rechazo, no un reentrenamiento.

## Capacidades

- Comprensión multimodal de entrada: texto, imágenes, vídeo y audio en un único modelo de extremo a extremo.
- Generación de salida multimodal: texto, habla (speech-to-speech) o texto y habla intercalados.
- Conversación multi-turno orientada a despliegue en el borde ("edge", "conversational" en los tags).
- Soporte de 23 idiomas, incluidos español, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso, polaco, danés, griego, finés, hebreo, neerlandés, sueco y turco.
- Modo "any-to-any" según el pipeline declarado en Hugging Face.
- Comportamiento decensored: la model card reporta 2/101 rechazos frente a 98/101 del original en su conjunto de evaluación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en dispositivos de borde: el modelo acepta audio y responde con habla en un único paso, lo que permite construir interfaces conversacionales locales sin pipeline separado de ASR + LLM + TTS, aprovechando su tamaño de 2B parámetros.
- Transcripción y respuesta hablada en atención al cliente: al ser speech-to-speech de extremo a extremo, puede gestionar interacciones telefónicas o de mostrador donde se requiere baja latencia y no hay conectividad garantizada.
- Descripción de imágenes y vídeo para accesibilidad: generación de descripciones textuales o narradas de contenido visual, útil en herramientas de lectura de pantalla y catalogación de archivos multimedia.
- Análisis de reuniones y notas de voz: entrada de audio con salida de texto estructurado (resumen, acciones) en cualquiera de los 23 idiomas soportados, incluido el español.
- Investigación sobre alineación y seguridad: la variante permite estudiar el efecto de la abliteration SOMPOA sobre un modelo ómnido, comparando rechazos y divergencia KL con el original.
- Prototipado de agentes conversacionales multilingües: con 23 idiomas y modalidad any-to-any, sirve para validar flujos de conversación en mercados con varios idiomas antes de escalar a modelos mayores.
- Experimentación con modelos sin censura en entornos controlados: útil para estudiar comportamientos del modelo base cuando se eliminan las capas de rechazo, siempre con las cautelas de la licencia y del contenido generado.

## Benchmarks y rendimiento

La model card solo publica resultados de PIQA para cuatro ensayos de abliteration, comparados con el modelo original. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales en la información disponible.

| Ensayo | Métrica | Este modelo | Modelo original |
|---|---|---|---|
| T130 | PIQA acc | 0.6186 | 0.6175 |
| T130 | PIQA acc_norm | 0.6295 | 0.6262 |
| T183 | PIQA acc | 0.6126 | 0.6175 |
| T183 | PIQA acc_norm | 0.6251 | 0.6262 |
| T237 | PIQA acc | 0.6181 | 0.6175 |
| T237 | PIQA acc_norm | 0.6230 | 0.6262 |
| T356 | PIQA acc | 0.6170 | 0.6175 |
| T356 | PIQA acc_norm | 0.6262 | 0.6262 |

| Métrica de decensoring | Este modelo (T130) | Modelo original |
|---|---|---|
| Rechazos | 2/101 | 98/101 |
| Divergencia KL | 0.0413 | 0 (por definición) |

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.166.928.384 parámetros en safetensors, el repo ocupa 4.5 GB. En fp16 se requieren aproximadamente 4.3 GB solo para pesos, más overhead de activaciones y del codificador multimodal; en cuantización de 8 bits, en torno a 2.2 GB, y en 4 bits, alrededor de 1.1 GB. No se dispone de cifras oficiales de VRAM para el modelo ómnido completo.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una GPU consumer con 8-12 GB de VRAM debería poder alojar los pesos en fp16, pero el soporte de audio y vídeo puede elevar los requisitos.
- Cabe en GPU consumer: sí, por el tamaño de pesos (2B parámetros); las GPU concretas no están documentadas.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-SOMPOA-heresy | 2.166.928.384 | no disponible | any-to-any (texto, imagen, vídeo, audio) | lfm1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-Omni-2B (original) | ~2B | no disponible | any-to-any | lfm1.0 | Hugging Face (modelo base) |
| LFM3-1.7B (familia LFM3) | ~1.7B | no disponible | texto | lfm1.0 | Hugging Face |
| Otros modelos ómnido de la clase 2B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación se limita a los modelos de la propia familia LFM3 porque la información proporcionada no incluye alternativas externas de la misma categoría (ómnido, 2B) con datos verificables.

## Limitaciones y advertencias

- La abliteration elimina las capas de rechazo del modelo alineado: puede generar contenido dañino, ofensivo o ilegal sin las salvaguardas del original. No es apto para despliegues públicos sin moderación externa.
- La model card reporta una divergencia KL de 0.0413 respecto al original en el mejor ensayo, lo que indica que el comportamiento general puede haberse degradado ligeramente; los benchmarks publicados se limitan a PIQA.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual en la información disponible; el modelo base es de 2B parámetros y la modificación no está validada más allá de PIQA.
- Licencia lfm1.0 (license: other): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; la licencia del modelo base puede imponer restricciones que la modificación no elimina.
- El autor es un usuario independiente (MuXodious), no Liquid AI; el modelo no está respaldado ni validado por la compañía.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni informes de uso en producción.
- No se dispone de información sobre longitud de contexto, cuantizaciones disponibles ni soporte de tool calling, lo que limita la planificación de despliegues.
- El soporte de 23 idiomas procede de los metadatos del modelo base; no hay evaluación publicada de calidad por idioma en esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuXodious/LFM3-Omni-2B-SOMPOA-heresy
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Documentación de Liquid AI sobre LFM3-Omni-2B: https://docs.liquid.ai/lfm/models/lfm3-omni-2b
- Anuncio de la familia LFM3 (Unite.AI): https://www.unite.ai/liquid-ai-launches-lfm3-family-of-six-open-weight-2b-class-models/
- Proyecto Heretic: https://heretic-project.org
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground de Liquid AI: https://playground.liquid.ai/talk
