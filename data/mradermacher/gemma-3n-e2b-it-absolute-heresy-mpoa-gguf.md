# mradermacher/gemma-3n-E2B-it-absolute-heresy-MPOA-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `MuXodious/gemma-3n-E2B-it-absolute-heresy-MPOA`, un fine-tune no oficial de Gemma 3n E2B-it de Google. El trabajo de cuantización lo firma mradermacher, un publicador habitual de GGUF en Hugging Face, y cubre un rango amplio de tipos de cuantización (desde Q2_K hasta f16, además de los ficheros `mmproj` necesarios para las capacidades multimodales). El modelo subyacente es un derivado "abliterated"/"decensored" del Gemma 3n E2B-it, es decir, se ha modificado para eliminar total o parcialmente los mecanismos de rechazo y alineación de seguridad del modelo original.

La relevancia de este artefacto es doble. Por un lado, permite ejecutar un modelo multimodal (audio, imagen y vídeo, además de texto) de aproximadamente 4.460 millones de parámetros en hardware de consumo gracias a las cuantizaciones de 2-5 GB. Por otro, su naturaleza "uncensored" lo hace interesante para investigación sobre alineación, evaluación de sesgos y estudios de robustez, pero problemático para despliegues comerciales convencionales.

Conviene subrayar que no se trata de un modelo oficial de Google ni de un lanzamiento de investigación revisado por pares: es una modificación comunitaria distribuida bajo los términos de la licencia Gemma, sin model card técnica detallada sobre el proceso de entrenamiento del fine-tune.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Gemma 3n E2B-it; arquitectura base no detallada en la información proporcionada) |
| Parámetros totales | 4.458.122.848 (≈4,46 mil millones, según safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, más mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | gemma (Gemma Terms of Use de Google, con acceso restringido mediante aceptación) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna más allá de que el modelo deriva de Gemma 3n E2B-it. La model card del repositorio de cuantización no documenta la arquitectura del transformer subyacente, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el fine-tune. Los tags del repositorio indican explícitamente que se trata de un modelo "heretic", "uncensored", "decensored" y "abliterated", lo que sugiere una intervención sobre las direcciones de activación o los pesos asociados al comportamiento de rechazo, pero no se detalla el método concreto (abliteration por direcciones de rechazo, fine-tune con datos sin censura, etc.).

La innovación técnica destacable de este artefacto es la disponibilidad de cuantizaciones estáticas de alta cobertura, incluyendo los ficheros `mmproj` (multi-modal projection) en Q8_0 y f16, que son imprescindibles para conservar las capacidades de audio, imagen y vídeo del modelo original. El autor remite a su repositorio de cuantizaciones con imatrix (`mradermacher/gemma-3n-E2B-it-absolute-heresy-MPOA-i1-GGUF`) para quienes prefieran cuantizaciones ponderadas de mayor calidad.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Gemma 3n E2B-it.
- Reconocimiento automático de voz (ASR): el pipeline declarado es `automatic-speech-recognition`.
- Traducción automática de voz (AST): tag `automatic-speech-translation`.
- Procesamiento audio-texto (`audio-text-to-text`).
- Procesamiento vídeo-texto (`video-text-to-text`), lo que implica capacidad de comprensión de vídeo además de imagen.
- Capacidades multimodales conservadas mediante los ficheros `mmproj` (Q8_0 y f16).
- Comportamiento "uncensored": el modelo ha sido modificado para reducir o eliminar rechazos ante peticiones que el Gemma original declinaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar qué comportamientos emergen cuando se eliminan los mecanismos de rechazo de un modelo multimodal, comparando respuestas con el Gemma 3n E2B-it original en un conjunto controlado de prompts.
- Transcripción de audio en local: gracias a las cuantizaciones de 2-3 GB y a los ficheros `mmproj`, se puede desplegar ASR en una estación de trabajo sin GPU dedicada, útil para prototipos de dictado o procesamiento de reuniones en inglés.
- Análisis de vídeo para prototipos: el tag `video-text-to-text` permite experimentar con descripción y respuesta a preguntas sobre clips cortos en entornos de investigación, aceptando la pérdida de calidad de las cuantizaciones bajas.
- Evaluación de sesgos y robustez: al ser un modelo "decensored", sirve como caso de estudio para medir cómo cambian las tasas de toxicidad, alucinación y rechazo respecto al modelo base, en el marco de auditorías de seguridad.
- Experimentación con cuantizaciones extremas: los ficheros Q2_K (2,0 GB) y Q3_K_S (2,3 GB) permiten estudiar la degradación de calidad en modelos multimodales pequeños, comparando perplejidad y fidelidad multimodal frente a Q5_K_M o Q8_0.
- Docencia y demos de IA multimodal en local: con llama.cpp u Ollama se puede montar una demo de asistente que acepte audio e imagen en un portátil con GPU de consumo, siempre que el caso de uso no requiera contenido sensible ni cumplimiento normativo estricto.
- Generación de datos sintéticos para aumento de dataset: en pipelines de investigación, el modelo puede producir descripciones de audio o vídeo en inglés que luego se filtran y revisan manualmente antes de incorporarse a un corpus de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~2,0 GB de pesos; ~3-4 GB de VRAM total con contexto moderado.
  - Q4_K_M: ~2,9 GB de pesos; ~4-5 GB de VRAM total.
  - Q8_0: ~4,9 GB de pesos; ~6-7 GB de VRAM total.
  - f16: ~9,0 GB de pesos; ~10-11 GB de VRAM total.
  - Añadir ~1,4 GB (mmproj-Q8_0) o ~2,1 GB (mmproj-f16) si se usan capacidades multimodales.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 (cualquier cuantización hasta Q8_0 con mmproj).
  - Profesional: A100, H100, L40S para despliegues concurrentes con vLLM (si bien la compatibilidad de vLLM con este fine-tune concreto no está documentada).
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB (Q4_K_S sin multimodal) hasta una RTX 4090 para Q8_0 con mmproj f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. La model card indica `endpoints_compatible` y librería `transformers`, pero el formato entregado es GGUF, por lo que el uso con transformers requeriría el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3n-E2B-it-absolute-heresy-MPOA (GGUF) | ~4,46 mil M | no disponible | audio, imagen, vídeo | gemma (gated) | Hugging Face, 175 descargas |
| Gemma 3n E2B-it (original de Google) | ~4,46 mil M (E2B) | no disponible en esta ficha | audio, imagen, vídeo | gemma (gated) | Hugging Face, muy alta difusión |
| Gemma 3n E4B-it | no disponible en esta ficha | no disponible | audio, imagen, vídeo | gemma (gated) | Hugging Face |
| Qwen2.5-Omni-3B / 7B | 3-7 mil M | no disponible en esta ficha | audio, imagen, vídeo | Apache 2.0 (Qwen) | Hugging Face |

La comparación con Qwen2.5-Omni es relevante porque ofrece capacidades multimodales comparables con licencia permisiva (Apache 2.0), lo que evita la fricción del gating de Gemma. No obstante, no se dispone de datos de benchmarks de este fine-tune que permitan comparar rendimiento real frente a esas alternativas.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": se ha eliminado o reducido el comportamiento de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso sin filtros. No apto para producción orientada al usuario final sin capas adicionales de moderación.
- Riesgo elevado de alucinación: los fine-tunes "decensored" suelen degradar la fidelidad factual respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Idiomas: la model card declara únicamente inglés (`language: en`); el rendimiento en castellano no está garantizado ni documentado.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, con restricciones de redistribución y obligación de aceptar la licencia (gating). Verificar compatibilidad antes de cualquier despliegue comercial.
- Modelo comunitario no oficial: no ha pasado por revisión de seguridad de Google ni por un proceso de red teaming documentado.
- Contexto: no se ha documentado la longitud de contexto efectiva de este fine-tune; asumir la del Gemma 3n E2B-it original sin garantías.
- Cuantizaciones bajas (Q2_K, Q3_K_S): degradación notable de calidad, especialmente en tareas multimodales; para uso serio, emplear Q4_K_M o superior.
- Ficheros `mmproj` obligatorios para multimodal: sin ellos, el modelo solo procesa texto.
- Repositorio con pocas descargas (175) y pocos likes (3): ecosistema de validación muy limitado; no hay informes independientes de calidad.
- Fecha de creación del repositorio (2026-02-11) y última actualización (2026-11-01): verificar que los ficheros no hayan cambiado respecto a lo documentado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-3n-E2B-it-absolute-heresy-MPOA-GGUF
- Modelo base (fine-tune): https://huggingface.co/MuXodious/gemma-3n-E2B-it-absolute-heresy-MPOA
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/gemma-3n-E2B-it-absolute-heresy-MPOA-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#gemma-3n-E2B-it-absolute-heresy-MPOA-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH (patrocinador del autor): https://www.nethype.de/
