# nvidia/magpie_tts_multilingual_357m

## Resumen

MagpieTTS Multilingual 357M es un modelo de síntesis de voz (text-to-speech) desarrollado por NVIDIA, diseñado para generar habla natural en 12 idiomas con una identidad de voz consistente. Forma parte de la familia de modelos Nemotron y se distribuye a través del framework NeMo Speech. El modelo resuelve el problema de la síntesis multilingüe de alta calidad con un único sistema, evitando la necesidad de modelos separados por idioma y manteniendo la misma voz del hablante en todas las lenguas soportadas.

Arquitectónicamente, es un transformer encoder-decoder con 364 millones de parámetros (el nombre comercial indica 357M) que predice de forma autorregresiva tokens de audio codec mediante multi-codebook (8 codebooks) y frame stacking (factor 2). El entrenamiento incorpora attention priors para una alineación texto-audio estable, classifier-free guidance (CFG) para un condicionamiento más fuerte y Group Relative Policy Optimization (GRPO) para alinear la generación con preferencias humanas. La versión actual (v2607) añade soporte para árabe, coreano y portugués, e incluye soporte IPA G2P para diccionarios personalizados y code-switching.

La relevancia actual del modelo radica en su capacidad para producir voz expresiva y consistente en un amplio abanico de idiomas con un solo checkpoint, lo que simplifica el despliegue en aplicaciones de voz multilingües. Además, al eliminar la clonación de voz zero-shot por razones de seguridad, se posiciona como una opción más responsable para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con predicción multi-codebook (8 codebooks) y frame stacking (factor 2) |
| Parametros totales | 364M (denominado comercialmente 357M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no especificado) |
| Tipos de cuantizacion | no disponible (aunque el tag incluye GGUF, no se detalla) |
| Idiomas soportados | arabe (ar), aleman (de), ingles (en), espanol (es), frances (fr), hindi (hi), italiano (it), japones (ja), coreano (ko), portugues (pt), vietnamita (vi), chino (zh) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer encoder-decoder que procesa texto normalizado y genera secuencias de tokens de audio codec de forma autorregresiva. La predicción multi-codebook (típicamente 8 codebooks) con frame stacking (factor 2) reduce la longitud de la secuencia y acelera la generación, mientras que un transformer local refina los frames apilados para mejorar la fidelidad del audio. El decodificador de audio es un codec preentrenado congelado llamado NanoCodec (22 kHz, 1.89 kbps, 21.5 fps).

El entrenamiento se realizó sobre una combinación de datasets públicos y propietarios, incluyendo ClArTTS, arabic_speech_corpus, Emilia-YODAS, GLOBE_V2, hifitts-2, Kathbath, japanese-anime-speech, Common-Voice-17-Ja, Emilia-Dataset, Emilia-YODAS-KO-filtered, pt-br_char e infore1_25hours. No se especifica el número total de tokens de entrenamiento. Se utilizaron técnicas de alineación por atención (attention priors), classifier-free guidance (CFG) y Group Relative Policy Optimization (GRPO) para mejorar la robustez, el control y la preferencia perceptual. La versión v2607 incorpora soporte IPA G2P para diccionarios personalizados y code-switching, así como normalización de texto para los 12 idiomas.

## Capacidades

- Generación de voz natural en 12 idiomas (ar, de, en, es, fr, hi, it, ja, ko, pt, vi, zh) con identidad de voz consistente.
- Cinco voces de hablantes ingleses: Aria, Jason, Leo, Sofia y John Van Stan (voz pública de LibriVox).
- Normalización de texto integrada para números, abreviaturas y caracteres especiales en todos los idiomas soportados.
- Soporte de code-switching (cambio de idioma dentro de una misma frase) mediante IPA G2P y diccionarios personalizados.
- Generación de habla de larga duración mediante un mecanismo de ventana deslizante (sliding-window) para textos extendidos.
- Síntesis por lotes (batched synthesis) de utterances completas para mayor eficiencia en inferencia.
- Sin capacidad de clonación de voz zero-shot (eliminada por seguridad en esta versión).

## Casos de uso

- Audiolibros multilingües: el modelo puede narrar libros completos en varios idiomas manteniendo la misma voz, lo que permite producir catálogos de audiolibros con una única identidad vocal y sin necesidad de locutores por idioma.
- Asistentes de voz para atención al cliente: integrado en sistemas de IVR o chatbots de voz, puede responder en el idioma del usuario con una voz consistente, reduciendo la fricción en entornos multilingües.
- Doblaje de contenido audiovisual: para traducir y doblar vídeos, podcasts o cursos online a los 12 idiomas soportados, manteniendo un tono y estilo uniforme.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en tiempo real para lectores de pantalla, con soporte multilingüe y voces naturales.
- Generación de contenido educativo: creación de materiales de aprendizaje en audio para plataformas de e-learning, con normalización de texto que maneja fórmulas, fechas y símbolos.
- Sistemas de navegación y avisos públicos: síntesis de anuncios en estaciones, aeropuertos o vehículos, con cambio de idioma dinámico según la región o preferencia del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo reporta métricas CER (Character Error Rate) y SSIM (Structural Similarity Index) en su ficha, pero no se proporcionan valores numéricos en la documentación accesible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación disponible.
- Dado el tamaño del modelo (364M parámetros), es probable que pueda ejecutarse en GPUs de consumo como RTX 3060 o superiores, aunque no hay confirmación oficial.
- Para inferencia en producción, se recomienda usar el framework NeMo Speech o el NIM de NVIDIA, que gestionan el despliegue optimizado.
- El modelo está disponible en formato GGUF (según tags), lo que sugiere compatibilidad con llama.cpp y Ollama, aunque no se detalla.
- No se especifican requisitos de VRAM, latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada (por ejemplo, otros TTS multilingües como XTTS, Bark o VITS), y no se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- La clonación de voz zero-shot ha sido eliminada deliberadamente por razones de seguridad; el modelo no puede imitar voces de hablantes no incluidos en el entrenamiento.
- El acceso al repositorio requiere aceptar una licencia con restricciones de uso no comercial (según el formulario de acceso), aunque el README indica que el modelo está listo para uso comercial. Se recomienda revisar los términos exactos de la NVIDIA Open Model License.
- No se especifican sesgos conocidos, pero al entrenarse con datos de dominio público, puede reflejar sesgos presentes en los corpus de voz (acentos, dialectos, registros).
- La calidad de síntesis puede variar entre idiomas; los idiomas con más datos de entrenamiento (inglés, español, etc.) probablemente tengan mejor rendimiento que otros con menos representación.
- El modelo no soporta entrada de audio (solo texto), por lo que no es adecuado para tareas de conversión de voz a voz.
- Para uso en producción, es necesario validar la latencia y el throughput en el hardware objetivo, ya que no se proporcionan cifras oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/magpie_tts_multilingual_357m
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/nvidia/magpie_tts_multilingual_demo
- Repositorio NeMo Speech: https://github.com/NVIDIA-NeMo/Speech
- API empresarial (NIM): https://build.nvidia.com/nvidia/magpie-tts-multilingual
- Ejemplos de voice agents: https://github.com/NVIDIA/voice-agent-examples/tree/riva_voice_agent_example
- Página de Nemotron: https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/
- Papers relacionados (IDs de arXiv): 2509.21718, 2509.19592, 2502.05236, 2508.05835, 2506.04152, 2409.12117, 2406.17957
