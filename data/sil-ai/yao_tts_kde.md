# sil-ai/yao_tts_kde

## Resumen

`yao_tts_kde` es un modelo de síntesis de voz (text-to-speech) publicado por el grupo SIL AI en Hugging Face. Se trata de un ajuste fino del modelo `microsoft/speecht5_tts`, un sistema TTS basado en la arquitectura SpeechT5 de Microsoft que combina un codificador y un decodificador tipo transformer con un vocoder basado en HiFi-GAN para generar formas de onda de audio a partir de texto. El modelo cuenta con 144.438.498 parámetros y se distribuye en formato safetensors bajo licencia MIT.

El modelo se ha entrenado con el Trainer de Hugging Face sobre un conjunto de datos no especificado en la model card (el campo de dataset aparece como "None"), lo que limita la reproducibilidad del ajuste. La pérdida de validación final reportada es de 0,0592 tras 15.000 pasos de entrenamiento, con una tasa de aprendizaje de 1e-4, optimizador AdamW fused y programación coseno con 1.500 pasos de calentamiento.

Su relevancia es acotada: se trata de un ajuste fino de bajo perfil (37 descargas, 0 likes en el momento de la consulta) orientado presumiblemente a una voz o idioma concretos, probablemente vinculado a las lenguas minoritarias que trabaja SIL AI. No hay información pública sobre el idioma, la voz ni el dominio de aplicación, por lo que debe evaluarse empíricamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5 (encoder-decoder transformer + vocoder HiFi-GAN) |
| Parametros totales | 144.438.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS; limitado por longitud de texto de entrada, no documentado) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (la model card no especifica idioma; el nombre "yao" sugiere una lengua concreta, sin confirmar) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SpeechT5 de Microsoft: un codificador de texto y un decodificador autorregresivo de espectrogramas mel, ambos basados en transformer, seguidos de un vocoder neuronal (HiFi-GAN) que convierte el espectrograma en forma de onda. SpeechT5 emplea además un mecanismo de "speaker embeddings" (x-vectors) para condicionar la identidad de la voz, lo que permite controlar el timbre en inferencia. El ajuste fino se realizó con la librería Transformers 4.57.1 y PyTorch 2.8.0+cu128.

El entrenamiento usó learning rate 1e-4, batch efectivo de 32 (batch 8 × acumulación 4), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con 1.500 pasos de warmup y 15.000 pasos totales, con precisión mixta nativa (AMP). La pérdida de entrenamiento descendió de 0,08 a 0,0484 y la de validación se estabilizó en torno a 0,0592-0,0597 desde el paso 4.000, sin mejoras significativas posteriores, lo que sugiere convergencia temprana y posible sobreajuste leve en las últimas fases. No se documenta el dataset, el número de tokens ni si hubo etapas de RLHF o DPO (no aplicables típicamente a TTS).

## Capacidades

- Síntesis de voz a partir de texto (text-to-audio) en el pipeline `text-to-audio` de Transformers.
- Generación de espectrogramas mel y forma de onda mediante el vocoder integrado de SpeechT5.
- Condicionamiento por speaker embedding (x-vector) para seleccionar o transferir timbre de voz, siempre que se disponga de un embedding compatible.
- Ajuste fino sobre una voz o dominio concreto (no documentado), lo que puede proporcionar una identidad de voz específica.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente TTS.
- Capacidades multilingües: no confirmadas; el nombre sugiere una lengua concreta pero no se especifica.

## Casos de uso

- Generación de audiolibros o narración automatizada: el modelo puede sintetizar texto largo por fragmentos y concatenar los audios resultantes, siempre que se valide la coherencia prosódica entre segmentos.
- Locuciones para vídeos y pódcasts: útil para producir voces en off de forma reproducible y con licencia MIT, sin depender de servicios comerciales de TTS.
- Accesibilidad: conversión de artículos o documentación a audio para personas con discapacidad visual, integrado en pipelines de preprocesado de texto.
- Preservación de lenguas minoritarias: dado el perfil de SIL AI, el ajuste podría estar orientado a una lengua concreta; sería adecuado para generar material audio en esa lengua tras validar la inteligibilidad con hablantes nativos.
- Prototipado de asistentes de voz: integración en un pipeline ASR + LLM + TTS para demos de conversación, usando el modelo como etapa final de síntesis.
- Generación de datasets sintéticos de audio: producción de muestras etiquetadas para entrenar o aumentar modelos ASR, con control de la voz mediante speaker embeddings.
- Pruebas de UX de voz en aplicaciones móviles o de escritorio, sustituyendo servicios cloud por inferencia local con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento (loss de validación final 0,0592) y no incluye evaluaciones objetivas como MOS, WER de ASR sobre el audio sintetizado, ni comparaciones con otros sistemas TTS.

| Metrica | Valor |
|---|---|
| Loss de validacion final | 0,0592 |
| Loss de entrenamiento final | 0,0484 |
| Pasos de entrenamiento | 15.000 |
| Epocas | ~174,4 |
| Benchmarks estandar (MOS, WER, etc.) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~144 M de parámetros; en fp32 ocupa ~0,58 GB y en fp16 ~0,29 GB, más el vocoder y los buffers intermedios. En la práctica, cabe holgadamente en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); para despliegues en servidor, A100 o H100 no son necesarias pero funcionan sin problema.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM; también puede ejecutarse en CPU con latencias mayores.
- Opciones de despliegue: `transformers` con el pipeline `text-to-audio`, `TextToSpectrogram` + vocoder de SpeechT5, y servidores compatibles con endpoints de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS en este formato).
- Latencia y throughput: no disponibles; no se han publicado mediciones. En una RTX 4090 se espera síntesis en tiempo real o superior para frases cortas, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sil-ai/yao_tts_kde | 144,4 M | texto (longitud no documentada) | MIT | Hugging Face | Ajuste fino de SpeechT5; idioma y voz no documentados |
| microsoft/speecht5_tts | ~144 M (arquitectura base) | texto (longitud no documentada) | MIT | Hugging Face | Modelo base multilingüe con speaker embeddings; referencia directa |
| Coqui XTTS-v2 | ~467 M | texto (multilingüe, clonación de voz) | Coqui Public Model License (no comercial) | Hugging Face | Clonación de voz zero-shot; licencia restrictiva para uso comercial |
| VITS / Piper | variable (~20-100 M) | texto (por voz) | MIT / GPL según modelo | Hugging Face / GitHub | Optimizado para inferencia en CPU; ecosistema de voces comunitarias |

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset, el idioma, la voz ni el dominio de entrenamiento; la reproducibilidad es nula con la información pública.
- Riesgo de alucinación y artefactos de audio: como todo TTS neuronal, puede producir pronunciaciones incorrectas, ruidos, cortes o prosodia antinatural en textos fuera de distribución.
- La pérdida de validación se estanca desde el paso 4.000 (~0,0594) y no mejora hasta el final, lo que sugiere sobreajuste o agotamiento de la señal de entrenamiento; la calidad real debe medirse con MOS y pruebas de inteligibilidad.
- No se especifica el idioma soportado; usar el modelo con un idioma distinto al de entrenamiento producirá resultados deficientes. El nombre "yao" sugiere una lengua concreta, pero no está confirmado.
- Licencia MIT: permite uso comercial y modificación, pero al derivar de `microsoft/speecht5_tts` conviene revisar también las condiciones del modelo base (MIT en este caso).
- Uso responsable: la síntesis de voz puede emplearse para suplantación o desinformación; no se documentan mecanismos de marca de agua ni de detección.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad frente a alternativas como XTTS-v2 o Piper; la elección debe basarse en pruebas propias.
- El repositorio tiene 37 descargas y 0 likes, lo que indica escasa validación comunitaria; no se recomienda para producción sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sil-ai/yao_tts_kde
- Modelo base: https://huggingface.co/microsoft/speecht5_tts
- Paper de SpeechT5: https://arxiv.org/abs/2110.07205
- Organización SIL AI en Hugging Face: https://huggingface.co/sil-ai
- Documentación de SpeechT5 en Transformers: https://huggingface.co/docs/transformers/model_doc/speecht5
- Repositorio de Transformers: https://github.com/huggingface/transformers
