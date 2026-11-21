# SadikNawazAI/SADIK-OMNI-AI

## Resumen

SADIK-OMNI-AI es un checkpoint publicado en Hugging Face por el usuario SadikNawazAI bajo el identificador `SadikNawazAI/SADIK-OMNI-AI`. El repositorio contiene pesos en formato safetensors con un total de 35.259.818.545 parámetros (aproximadamente 35,3 mil millones) y un tamaño de repositorio de 70,5 GB. La model card del autor reproduce la documentación de Qwen3-Omni, el modelo omni-modal de Alibaba Qwen, y la etiqueta de arquitectura declarada en los metadatos es `qwen3_omni_moe`, por lo que el contenido corresponde a una redistribución o reempaquetado de dicho modelo base.

El modelo se presenta como un sistema any-to-any nativo de extremo a extremo que procesa texto, imágenes, audio y vídeo, y genera respuestas en texto y voz con capacidad de streaming en tiempo real. La arquitectura combina un diseño MoE (mezcla de expertos) con el esquema Thinker–Talker y un preentrenamiento AuT (audio transformer) para representaciones generales, junto con un diseño multi-codebook orientado a minimizar la latencia en la síntesis de voz.

Su relevancia radica en que cubre tareas de reconocimiento de voz, comprensión de audio, traducción speech-to-speech, análisis musical, captioning de audio y conversación por voz, capacidades poco frecuentes en modelos abiertos. No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y la licencia declarada es contradictoria entre los metadatos (`other`) y el campo `license_name` (`apache-2.0`), lo que conviene verificar antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con diseno Thinker-Talker y preentrenamiento AuT (etiqueta `qwen3_omni_moe`) |
| Parametros totales | 35.259.818.545 (35,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 119 idiomas de texto; 19 idiomas de entrada de voz; 10 idiomas de salida de voz (metadatos del repo: `en`) |
| Licencia | `other` en los metadatos, con `license_name: apache-2.0` en la model card (contradictorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura descrita es un transformer MoE omni-modal con separación de roles Thinker–Talker: el componente Thinker procesa las entradas multimodales (texto, imagen, audio, vídeo) y el Talker genera la salida de voz. El entrenamiento se organiza en dos fases: un preentrenamiento text-first temprano seguido de entrenamiento multimodal mixto, de modo que las capacidades unimodales de texto e imagen no se degradan al añadir modalidades. El módulo AuT se preentrena para obtener representaciones de audio generales, y el diseño multi-codebook del decodificador de voz reduce la latencia de síntesis.

La model card afirma que el modelo alcanza SOTA en 22 de 36 benchmarks de audio y vídeo, y SOTA de código abierto en 32 de 36, con rendimiento en ASR, comprensión de audio y conversación por voz comparable a Gemini 2.5 Pro. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la innovación de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación y comprensión de texto multilingüe en 119 idiomas.
- Procesamiento de imágenes y vídeo como entrada multimodal.
- Reconocimiento automático de voz (ASR) multilingüe, con soporte de audio largo.
- Traducción speech-to-text y speech-to-speech.
- Comprensión y análisis de audio: música (estilo, género, ritmo), efectos de sonido y audio mixto con voz, música y ruido ambiental.
- Captioning detallado de audio, con una variante específica Qwen3-Omni-30B-A3B-Captioner orientada a baja alucinación.
- Generación de voz en 10 idiomas con interacción en streaming de baja latencia y turn-taking natural.
- Conversación multimodal en tiempo real con respuestas simultáneas en texto y voz.
- Control del comportamiento mediante system prompts.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y actas: el modelo acepta audio largo y realiza ASR multilingüe, lo que permite transcribir conversaciones con participantes que hablan distintos idiomas y generar resúmenes en texto.
- Subtitulado y doblaje automático: la combinación de traducción speech-to-text y speech-to-speech permite generar subtítulos y pistas de voz dobladas en los 10 idiomas de salida soportados.
- Atención al cliente por voz: el streaming de baja latencia y el turn-taking natural lo hacen adecuado para agentes telefónicos o asistentes conversacionales que responden con voz sintetizada.
- Accesibilidad: descripción automática de contenido audiovisual (captioning de audio e imagen) para personas con discapacidad visual o auditiva, incluyendo la variante Captioner de baja alucinación.
- Análisis de contenido musical y radiofónico: clasificación de género, estilo y ritmo, y descripción de audio mixto para catalogación de archivos sonoros o monitorización de emisiones.
- Moderación y análisis de vídeo: al procesar vídeo y audio conjuntamente, puede detectar contenido relevante en emisiones en directo y generar informes textuales en tiempo real.
- Asistentes multimodales en dispositivos: con 35,3 B de parámetros totales y arquitectura MoE, el despliegue requiere cuantización agresiva o hardware de centro de datos; encaja mejor en servicios en la nube que en local.

## Benchmarks y rendimiento

La model card afirma SOTA en 22 de 36 benchmarks de audio y vídeo y SOTA de código abierto en 32 de 36, con paridad con Gemini 2.5 Pro en ASR y conversación por voz, pero no se incluyen en la información proporcionada las tablas con valores numéricos por benchmark (MMLU, HumanEval, GSM8K, etc.).

No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 35,3 B de parámetros, en FP16 se requieren aproximadamente 70 GB solo para pesos, y en cuantización de 8 bits en torno a 35 GB, sin contar caché KV ni los módulos de audio y visión.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, un despliegue en FP16 requiere GPUs de 80 GB (A100, H100) o múltiples GPUs.
- Cabe en GPU de consumo: no en FP16; solo con cuantizaciones muy agresivas (4 bits o inferiores) podría aproximarse a GPUs de 24 GB, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: la librería declarada es transformers; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: la model card menciona streaming de baja latencia y diseño multi-codebook para minimizar la latencia de voz, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SADIK-OMNI-AI | 35,3 B | no disponible | texto, imagen, audio, vídeo; salida texto y voz | contradictoria (`other` / `apache-2.0`) | repo con 0 descargas |
| Qwen3-Omni (original) | no disponible en esta ficha | no disponible | texto, imagen, audio, vídeo; salida texto y voz | no disponible en esta ficha | publicado por QwenLM |
| Gemini 2.5 Pro | propietario | no disponible | multimodal | propietario | API de Google |

La comparativa con alternativas abiertas de la misma categoría (por ejemplo, otros modelos any-to-any) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La licencia es contradictoria: los metadatos del repositorio indican `other` mientras que el campo `license_name` de la model card indica `apache-2.0`. Es imprescindible aclarar los términos antes de un uso comercial.
- El repositorio tiene cero descargas y cero likes y fue creado y actualizado en la misma fecha, lo que sugiere una publicación reciente sin validación por parte de la comunidad.
- El autor del repositorio (SadikNawazAI) no coincide con el desarrollador original del modelo (QwenLM); se trata de un reempaquetado, por lo que la integridad y correspondencia de los pesos con la documentación no están garantizadas.
- Los metadatos declaran únicamente el idioma `en`, mientras que la model card afirma soporte de 119 idiomas de texto; esta discrepancia debe verificarse empíricamente.
- Riesgo de alucinación en tareas de captioning y descripción de audio, mitigado parcialmente según el autor por la variante Captioner de baja alucinación, pero sin métricas publicadas en esta ficha.
- No se dispone de datos sobre sesgos, contexto máximo, cuantizaciones soportadas ni rendimiento medido, lo que limita la evaluación para producción.
- El tamaño de 70,5 GB y los 35,3 B de parámetros implican requisitos de hardware elevados y costes de inferencia considerables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SadikNawazAI/SADIK-OMNI-AI
- Repositorio oficial de Qwen3-Omni en GitHub: https://github.com/QwenLM/Qwen3-Omni
- Cookbook de reconocimiento de voz: https://github.com/QwenLM/Qwen3-Omni/blob/main/cookbooks/speech_recognition.ipynb
- Cookbook de traducción de voz: https://github.com/QwenLM/Qwen3-Omni/blob/main/cookbooks/speech_translation.ipynb
- Cookbook de análisis musical: https://github.com/QwenLM/Qwen3-Omni/blob/main/cookbooks/music_analysis.ipynb
- Cookbook de análisis de sonido: https://github.com/QwenLM/Qwen3-Omni/blob/main/cookbooks/sound_analysis.ipynb
- Cookbook de captioning de audio: https://github.com/QwenLM/Qwen3-Omni/blob/main/cookbooks/audio_caption.ipynb
- Cookbook de análisis de audio mixto: https://github.com/QwenLM/Qwen3-Omni/blob/main/cookbooks/mixed_audio_analysis.ipynb
- Chat de Qwen: https://chat.qwen.ai/
