# GuidenAI/genpio_voice

## Resumen

Genpio Voice es un modelo de texto a voz (TTS) multilingüe desarrollado por GuidenAI, diseñado para la clonación de voz zero-shot y el diseño de voces sintéticas. Está entrenado desde cero (trained-from-scratch) y combina un codificador de texto basado en Qwen3 con un codec de audio DAC (Descript Audio Codec) para generar habla natural en más de 100 idiomas, desde afrikáans hasta chino cantonés. El modelo cuenta con 612 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 2,5 GB.

Su relevancia radica en que cubre un espectro lingüístico muy amplio (incluyendo lenguas de baja representación como el bambara, el luo o el umbundu) y ofrece capacidades avanzadas de clonación de voz sin necesidad de entrenamiento adicional, lo que lo hace atractivo para aplicaciones de doblaje, asistentes de voz y accesibilidad. El acceso al modelo está restringido (gated) y se rige por una licencia personalizada, la genpio-voices-model-license, por lo que cualquier uso requiere aceptar las condiciones en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador de texto basado en Qwen3 + codec de audio DAC (Descript Audio Codec) |
| Parametros totales | 612.577.288 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | af, am, ar, as, ast, az, be, bg, bn, bs, ca, ceb, ckb, cs, cy, da, de, el, en, es, et, fa, ff, fi, fil, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, ig, is, it, ja, jv, ka, kam, kea, kk, km, kn, ko, ky, lb, lg, ln, lo, lt, luo, lv, mi, mk, ml, mn, mr, ms, mt, my, nb, ne, nl, nso, ny, oc, om, or, pa, pl, ps, pt, ro, ru, sd, sk, sl, sn, so, sr, su, sv, sw, ta, te, tg, th, tr, tw, uk, umb, ur, uz, vi, wo, xh, yo, yue, zh, zu (más de 100 idiomas) |
| Licencia | genpio-voices-model-license (licencia personalizada, requiere aceptación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un codificador de texto basado en la arquitectura Qwen3, que procesa la entrada lingüística, con un codec de audio DAC para la síntesis de voz. Según las etiquetas del repositorio, el modelo fue entrenado desde cero (trained-from-scratch), lo que sugiere que no se trata de un ajuste fino de un TTS existente, sino de un entrenamiento completo sobre datos de habla. Los datasets utilizados incluyen google/fleurs, facebook/multilingual_librispeech y AISHELL-1, lo que proporciona una cobertura multilingüe amplia con énfasis en inglés, chino y lenguas europeas. No se dispone de información sobre el número total de tokens de entrenamiento, ni sobre el uso de técnicas de alineación como RLHF o DPO. La innovación principal declarada es la capacidad de clonación de voz zero-shot y el diseño de voces, lo que implica que el modelo puede imitar una voz a partir de una muestra breve sin necesidad de ajuste fino.

## Capacidades

- Generación de voz natural a partir de texto en más de 100 idiomas, incluyendo variantes regionales (p. ej., yue para cantonés, ckb para kurdo sorani).
- Clonación de voz zero-shot: puede replicar una voz a partir de una grabación de referencia sin entrenamiento adicional.
- Diseño de voz (voice design): permite crear voces sintéticas con características personalizadas, útil para asistentes virtuales o personajes.
- Soporte multilingüe extenso, cubriendo lenguas de baja representación como luo, umbundu, nso o twi.
- Integración con la librería omnivoice, lo que facilita su uso en pipelines de TTS.
- Formato de pesos safetensors, compatible con el ecosistema HuggingFace.

## Casos de uso

- Audiolibros multilingües: el modelo puede generar narraciones en decenas de idiomas a partir de texto, lo que permite producir audiolibros para mercados locales sin necesidad de locutores humanos. Su soporte de clonación de voz permite mantener una voz consistente en toda la obra.
- Asistentes de voz personalizados: gracias a la clonación zero-shot, una empresa puede crear un asistente con la voz de una celebridad o de un personaje de marca, usando solo unos segundos de audio de referencia. Esto es útil para asistentes en apps de banca, comercio electrónico o atención al cliente.
- Doblaje de contenido audiovisual: el modelo puede doblar vídeos, series o películas a múltiples idiomas manteniendo el tono y la emoción de la voz original, reduciendo costes frente al doblaje tradicional con actores.
- Accesibilidad para personas con discapacidad visual: sistemas de lectura de pantalla que convierten texto digital en voz natural en el idioma del usuario, incluyendo lenguas minoritarias que otros TTS no cubren.
- Sistemas de respuesta de voz interactiva (IVR): integración en centralitas telefónicas para dar respuestas automáticas en el idioma del cliente, con la posibilidad de clonar la voz de un agente humano para una experiencia más cercana.
- Creación de contenido educativo: generación de explicaciones narradas en múltiples idiomas para cursos online, tutoriales o aplicaciones de aprendizaje de idiomas, con voces claras y naturales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 612 millones de parámetros, en FP16 los pesos ocupan aproximadamente 1,2 GB. Para inferencia, se recomienda al menos 4 GB de VRAM para margen de activaciones y buffers.
- GPU recomendadas: tarjetas consumer como NVIDIA RTX 3060 (12 GB) o superiores pueden ejecutar el modelo sin problemas. GPUs profesionales como A100 o H100 no son necesarias para inferencia, aunque acelerarían el procesamiento por lotes.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y alta.
- Opciones de despliegue: no se especifican en la documentación. Al usar la librería omnivoice, es probable que se integre con el ecosistema HuggingFace Transformers o con pipelines dedicados. No hay confirmación de soporte en vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible. Dependerá del hardware y del tamaño del lote.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre modelos comparables en la misma categoría (TTS multilingüe con clonación de voz).

## Limitaciones y advertencias

- Licencia personalizada (genpio-voices-model-license) que no es de código abierto estándar; es necesario revisar sus términos para uso comercial y redistribución.
- Acceso restringido (gated): hay que solicitar permiso en HuggingFace y aceptar las condiciones antes de descargar el modelo.
- Modelo nuevo con cero descargas y cero likes en el momento de la consulta, lo que implica falta de validación por parte de la comunidad.
- No se dispone de información sobre sesgos, alucinaciones (errores de pronunciación) o comportamientos problemáticos en lenguas específicas.
- La cobertura de idiomas es amplia pero no se conoce la calidad por lengua; es probable que el rendimiento varíe entre idiomas mayoritarios y minoritarios.
- No hay documentación sobre el uso de técnicas de mitigación de sesgos de género o acento.
- El tamaño del modelo (612M) puede implicar latencias altas en CPU; se recomienda GPU para producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GuidenAI/genpio_voice
- Paper asociado (referencia arxiv): https://arxiv.org/abs/2604.00688
- Datasets de entrenamiento: https://huggingface.co/datasets/google/fleurs, https://huggingface.co/datasets/facebook/multilingual_librispeech, https://huggingface.co/datasets/AISHELL/AISHELL-1
