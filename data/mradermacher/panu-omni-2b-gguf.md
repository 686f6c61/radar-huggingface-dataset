# mradermacher/Panu-Omni-2B-GGUF

## Resumen

Panu-Omni-2B-GGUF es la versión cuantizada en formato GGUF del modelo Panu-Omni-2B, desarrollado originalmente por JonusNattapong y convertido a GGUF por mradermacher. Se trata de un modelo multimodal de aproximadamente 1.728 millones de parámetros (1,73 B) construido sobre la arquitectura LFM3 (Liquid Foundation Model 3) de Liquid AI, con capacidades declaradas de audio, visión y speech-to-speech, además de generación de texto y razonamiento. El modelo se distribuye con etiquetas que indican una variante "abliterated" o "uncensored", es decir, con los mecanismos de rechazo suavizados respecto al modelo base.

La relevancia de esta ficha radica en que ofrece una vía práctica de ejecución local de un modelo omni-modal pequeno, cuantizado en múltiples precisiones (desde Q2_K de 0,9 GB hasta f16 de 3,6 GB), lo que permite desplegarlo en hardware de consumo. El modelo declara soporte para siete idiomas (tailandés, inglés, chino, japonés, francés, alemán y español) y hace hincapié en dialectos tailandeses, lo que lo hace especialmente interesante para aplicaciones de voz en el sudeste asiático.

No obstante, la información pública disponible es muy limitada: no se han publicado resultados de benchmarks, no se detalla la composición del dataset de entrenamiento ni la longitud exacta de contexto, y la licencia es "other" con nombre lfm1.0, lo que exige revisión legal antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en LFM3 (Liquid Foundation Model 3), multimodal (texto, audio, visión) |
| Parametros totales | 1.728.801.600 (1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); disponibles también quants ponderados/imatrix en repo separado |
| Idiomas soportados | th, en, zh, ja, fr, de, es |
| Licencia | lfm1.0 (licencia "other" según Hugging Face) |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |
| Tamano del repo | 15,9 GB |
| Modelo base | JonusNattapong/Panu-Omni-2B |
| Cuantizador | mradermacher |
| Fecha de creacion | 2026-11-11 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM3 de Liquid AI, según las etiquetas del repositorio (`liquid`, `lfm3`, `lfm3-omni`). Se trata de un modelo multimodal que integra procesamiento de texto, audio y visión, con capacidad declarada de speech-to-speech. El número de parámetros reales (1.728.801.600) corresponde a un modelo de aproximadamente 1,73 B, aunque el nombre comercial lo redondea a "2B".

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La etiqueta "abliterated" sugiere que se ha aplicado una técnica de ablación de direcciones de rechazo para reducir las negativas del modelo, y "reasoning" indica que se ha entrenado o ajustado para tareas de razonamiento. Tampoco se detalla si emplea decodificación especulativa, atención lineal u otras innovaciones técnicas. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional en siete idiomas (tailandés, inglés, chino, japonés, francés, alemán y español).
- Procesamiento de audio, incluyendo entrada de voz y salida speech-to-speech según las etiquetas del repositorio.
- Procesamiento de visión (etiqueta `vision` y `multimodal`).
- Razonamiento explícito (etiqueta `reasoning`), presumiblemente con modos de pensamiento o cadenas de razonamiento.
- Soporte específico de dialectos tailandeses (etiqueta `thai-dialects`).
- Variante "abliterated"/"uncensored": menor tendencia a rechazar peticiones, lo que puede ser útil para investigación sobre alineación pero también incrementa riesgos de contenido inapropiado.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- Asistentes de voz locales en tailandés: el modelo puede gestionar entrada y salida de audio (speech-to-speech) y está específicamente ajustado para dialectos tailandeses, lo que lo hace adecuado para aplicaciones de atención al cliente o asistentes personales en Tailandia que requieran ejecución en dispositivo.
- Transcripción y respuesta conversacional en tiempo real: gracias a sus capacidades de audio y su reducido tamaño (1,2 GB en Q4_K_M), puede desplegarse en GPUs de consumo para prototipos de asistentes por voz con latencia baja.
- Análisis de imágenes con descripción textual: la etiqueta `vision` sugiere que puede procesar imágenes y generar descripciones o responder preguntas sobre ellas, útil para aplicaciones de accesibilidad o moderación de contenido visual.
- Investigación sobre alineación y seguridad: al ser una variante "abliterated", permite estudiar el comportamiento de modelos sin mecanismos de rechazo, comparando respuestas con el modelo base para analizar sesgos y riesgos.
- Prototipado multilingüe en entornos con recursos limitados: con cuantizaciones desde 0,9 GB (Q2_K), puede ejecutarse en portátiles o dispositivos de borde para pruebas de concepto en siete idiomas sin necesidad de infraestructura cloud.
- Educación y traducción asistida: su soporte para tailandés, chino, japonés y lenguas europeas permite construir herramientas de traducción o tutoría lingüística que funcionen offline, preservando la privacidad del usuario.
- Desarrollo de agentes conversacionales experimentales: aunque no se documenta tool calling, su naturaleza multimodal y su modo de razonamiento permiten experimentar con pipelines que combinen percepción (audio/visión) y generación de texto en un solo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~0,9 GB
  - Q3_K_S / Q3_K_M: ~1,0 GB
  - Q3_K_L / IQ4_XS: ~1,1 GB
  - Q4_K_S / Q4_K_M: ~1,2 GB
  - Q5_K_S / Q5_K_M: ~1,3-1,4 GB
  - Q6_K: ~1,5 GB
  - Q8_0: ~1,9 GB
  - f16: ~3,6 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput. Las cuantizaciones Q2-Q3 pueden ejecutarse en GPUs integradas o incluso en CPU.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 en GPUs con 4 GB o más; la versión f16 requiere ~4 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El repositorio también ofrece quants imatrix/ponderados en un repo separado para mayor calidad.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 1,73 B, se espera un throughput alto en GPUs modernas, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Panu-Omni-2B-GGUF | 1,73 B | no disponible | Texto, audio, visión | lfm1.0 | GGUF en HF |
| Qwen2-Audio-7B | 7 B | no disponible en esta ficha | Texto, audio | Apache 2.0 (según modelo original) | HF |
| Llama 3.2 3B | 3 B | 128k (según modelo original) | Texto, visión (variante 11B) | Llama 3.2 Community License | HF |
| SmolVLM-2B | 2 B | no disponible en esta ficha | Texto, visión | Apache 2.0 (según modelo original) | HF |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo Panu-Omni-2B para establecer comparaciones cuantitativas. Los modelos alternativos se citan por tamaño y modalidad similar, pero sus especificaciones exactas deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- La licencia lfm1.0 es una licencia "other" que debe revisarse legalmente antes de uso comercial; no se garantiza permiso explícito para todos los casos.
- La variante "abliterated"/"uncensored" elimina o reduce los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido inapropiado, ofensivo o peligroso; no se recomienda su despliegue en producción orientada al público sin filtros adicionales.
- Riesgo de alucinación inherente a modelos de 1,73 B, especialmente en tareas de razonamiento complejo o matemáticas.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- El soporte multilingüe está declarado pero no verificado; la calidad en idiomas distintos del tailandés e inglés es incierta.
- El modelo base (JonusNattapong/Panu-Omni-2B) tiene muy poca tracción (0 descargas, 0 likes en el momento de la ficha), lo que sugiere falta de validación comunitaria.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado con datos web, es probable que herede sesgos sociales y culturales.
- La información sobre arquitectura y entrenamiento es mínima; no se puede confirmar la implementación exacta de las capacidades multimodales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Panu-Omni-2B-GGUF
- Modelo base: https://huggingface.co/JonusNattapong/Panu-Omni-2B
- Quants ponderados/imatrix: https://huggingface.co/mradermacher/Panu-Omni-2B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Panu-Omni-2B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
