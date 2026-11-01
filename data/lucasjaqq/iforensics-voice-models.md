# LucasJaqq/iforensics-voice-models

## Resumen

iForensics voice models es un repositorio de pesos publicado por el usuario LucasJaqq que empaqueta dos modelos de análisis de voz entrenados para tareas de seguridad biométrica: detección de deepfakes (anti-spoofing, tarea `cm`) y verificación de hablante (tarea `sv`). No se trata de un modelo generativo de lenguaje, sino de un paquete de checkpoints de audio orientado a pipelines de autenticación por voz y análisis forense. El repositorio ocupa 0,4 GB y se distribuye bajo licencia `other`, con soporte declarado de chino e inglés.

El componente de detección de deepfake se construye sobre WavLM-base-plus con el codificador congelado más una capa de pooling estadístico con atención (ASP), entrenado sobre el corpus completo ASVspoof5 (aproximadamente un millón de enunciados) durante 3 épocas, con recálculo del umbral de decisión sobre el mismo conjunto. El componente de verificación de hablante combina características fbank de 80 dimensiones con una arquitectura ECAPA-TDNN y ASP, entrenada sobre CN-Celeb 1 y 2 (2.993 hablantes, 650.000 enunciados) durante 8 épocas.

La relevancia del paquete es práctica: ofrece checkpoints listos para integrar en sistemas de autenticación biométrica y detección de audio sintético, con métricas EER publicadas en la propia model card y con la particularidad de incluir los ficheros de configuración del modelo base de HuggingFace para permitir la carga sin conexión a la red. El repositorio está pensado como artefacto de despliegue de una aplicación mayor (`voice_analysis`), no como modelo autónomo con API de inferencia estandarizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos: WavLM-base-plus (codificador congelado) + ASP para anti-spoofing; ECAPA-TDNN + ASP sobre fbank80 para verificación de hablante |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto; ventana dependiente del frontend de características) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en |
| Licencia | other |
| Formato de pesos | no disponible (pesos de PyTorch empaquetados en el directorio de ejecución; se mencionan ficheros `hf_config/` sin pesos) |

## Arquitectura y entrenamiento

El modelo de detección de deepfake (`full_data_weaker_aug_freeze_encoder_v3__cal_asvspoof5_full`) usa WavLM-base-plus como extractor de representaciones con el codificador congelado, seguido de una cabeza de pooling estadístico con atención (ASP). Se entrenó durante 3 épocas sobre el conjunto completo ASVspoof5, en torno a un millón de enunciados, y el umbral de decisión se recalibró sobre el mismo conjunto. El nombre del run sugiere una estrategia de aumento de datos más suave ("weaker_aug") y congelación del codificador ("freeze_encoder"). El paquete incluye el historial de entrenamiento, el log y los resultados de evaluación sobre FoR e In the Wild, además de los ficheros de configuración del modelo base de HuggingFace para carga offline.

El modelo de verificación de hablante (`sv_full_fbank_ecapa`) emplea características fbank de 80 dimensiones con una arquitectura ECAPA-TDNN y ASP, entrenada durante 8 épocas sobre CN-Celeb 1 y 2, que suman 2.993 hablantes y 650.000 enunciados. Los pesos contienen únicamente parámetros y la tabla de identificadores de hablante, sin ficheros de audio. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en modelos discriminativos de audio.

## Capacidades

- Detección de deepfake y audio sintético (anti-spoofing) en tarea de contramedida (`cm`), con salida de puntuación y umbral calibrado.
- Verificación de hablante (`sv`) para autenticación biométrica uno-a-uno.
- Extracción de embeddings de hablante mediante ECAPA-TDNN sobre fbank80.
- Procesamiento de audio en chino e inglés según la declaración de idiomas del repositorio.
- Carga offline del modelo base gracias a los ficheros `hf_config/` incluidos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.
- No se documenta soporte de visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Autenticación biométrica por voz: el modelo `sv_full_fbank_ecapa` permite comparar la voz de un usuario con su embedding registrado, con un EER de evaluación del 0,106 sobre CN-Celeb, adecuado para verificación en segundo factor.
- Detección de llamadas fraudulentas con voz sintética: el detector anti-spoofing con EER de desarrollo de 0,038 sobre ASVspoof5 puede filtrar audio generado por TTS o clonación de voz antes de que llegue a un operador humano.
- Protección de sistemas de banca telefónica: combinación de verificación de hablante y anti-spoofing en el mismo pipeline para validar identidad y detectar suplantación en la misma llamada.
- Análisis forense de grabaciones: uso del detector de deepfake para marcar evidencias de audio manipuladas en investigaciones, con puntuaciones calibradas sobre ASVspoof5.
- Incorporación a un servicio de verificación de identidad (KYC) por voz: el modelo de hablante aporta la comparación biométrica y el de anti-spoofing la comprobación de que el audio es humano.
- Despliegue dentro de la aplicación `voice_analysis`: el repositorio está empaquetado para descargarse con `python -m voice_analysis pull-models`, lo que facilita la integración en esa consola y en pipelines internos que ya usen esa librería.
- Investigación en contramedidas de audio: los historiales, logs y resultados de evaluación incluidos permiten reproducir y comparar experimentos sobre ASVspoof5 y CN-Celeb.

## Benchmarks y rendimiento

| Modelo / tarea | Conjunto de evaluación | Métrica | Resultado |
|---|---|---|---|
| Detección de deepfake (`full_data_weaker_aug_freeze_encoder_v3__cal_asvspoof5_full`) | ASVspoof5 (dev) | EER | 0,038 |
| Verificación de hablante (`sv_full_fbank_ecapa`) | CN-Celeb (dev) | EER | 0,101 |
| Verificación de hablante (`sv_full_fbank_ecapa`) | CN-Celeb (eval) | EER | 0,106 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, al no tratarse de un modelo de texto. Tampoco se detallan métricas adicionales como min-tDCF, AUC o precisión/recall para el detector de deepfake.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. WavLM-base-plus ronda los 95 millones de parámetros y ECAPA-TDNN es un modelo compacto, por lo que ambos checkpoints deberían caber holgadamente en GPUs de consumo, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño de los componentes, una RTX 3060 o superior sería suficiente en la práctica, pero es una estimación no confirmada por el autor.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio (0,4 GB) y la naturaleza de los modelos; sin confirmación oficial.
- Opciones de despliegue: la librería propietaria `voice_analysis` mediante `python -m voice_analysis pull-models`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de audio discriminativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Contexto / datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iForensics voice models (este) | Anti-spoofing y verificación de hablante | WavLM-base-plus + ASP; ECAPA-TDNN + ASP | Audio; ASVspoof5 y CN-Celeb | other | HuggingFace, 0 descargas |
| WavLM (Microsoft) | Representaciones de voz para múltiples tareas | Transformer sobre audio | Audio; LibriSpeech y otros | MIT (según versión) | HuggingFace, ampliamente usado |
| ECAPA-TDNN (SpeechBrain) | Verificación de hablante | TDNN con atención y estadísticas | Audio; VoxCeleb | Apache 2.0 | SpeechBrain / HuggingFace |
| AASIST | Anti-spoofing | Grafo atencional sobre espectrogramas | Audio; ASVspoof | MIT | Repositorio público |

La comparativa se limita a los componentes arquitectónicos de referencia, ya que no se dispone de datos de benchmarks cruzados en la información proporcionada. Los EER publicados (0,038 en dev para anti-spoofing y 0,101/0,106 en dev/eval para hablante) no son directamente comparables con los de los modelos base sin conocer las condiciones exactas de evaluación.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al entrenar sobre ASVspoof5 y CN-Celeb, el rendimiento puede degradarse en dominios de audio distintos (teléfono, micrófono lejano, ruido de fondo).
- Riesgo de falsos negativos en deepfakes generados con técnicas no representadas en ASVspoof5; el umbral está calibrado sobre ese corpus y puede no transferir a otros ataques.
- La licencia es `other`, sin texto de licencia visible en la información disponible; es imprescindible revisar las condiciones antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (28 de octubre de 2026 según los metadatos), lo que indica ausencia de validación comunitaria.
- El paquete está diseñado para la librería `voice_analysis` y su estructura de directorios de ejecución; no es un modelo autónomo con `pipeline` de HuggingFace, lo que complica su integración directa en otros entornos.
- Los idiomas declarados son chino e inglés; el rendimiento en castellano no está documentado.
- No se especifican los formatos de pesos ni los parámetros totales, lo que dificulta estimar requisitos de hardware con precisión.
- El nombre del run de anti-spoofing incluye "weaker_aug", lo que sugiere un aumento de datos reducido y posible menor robustez ante variaciones acústicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LucasJaqq/iforensics-voice-models
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios de código ni demos.
