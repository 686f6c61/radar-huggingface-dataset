# jackyb1234/Kokoro-Vietnamese

## Resumen

Kokoro-Vietnamese es un conjunto de artefactos de síntesis de voz (text-to-speech) derivados de la arquitectura Kokoro, adaptados al vietnamita mediante fine-tuning. Lo publica el usuario jackyb1234 en Hugging Face bajo licencia Apache 2.0, y el código de inferencia y entrenamiento asociado se distribuye en el repositorio de GitHub iamdinhthuan/Kokoro-Vietnamese. El modelo soluciona la falta de voces vietnamitas de calidad dentro del ecosistema Kokoro, un family de modelos TTS ligeros y eficientes diseñados originalmente para inglés.

El repositorio incluye el checkpoint de PyTorch (`kokoro_vi.pth`), una exportación a ONNX Runtime del modelo acústico (`kokoro_vi.onnx`), un voicepack vietnamita por defecto y voicepacks adicionales. El pipeline declarado es `text-to-speech` y el único idioma soportado es el vietnamita. El tamaño total del repositorio es de 0,7 GB.

La relevancia actual radica en que Kokoro es una arquitectura compacta y de baja latencia que puede ejecutarse en CPU, y esta adaptación permite desplegar TTS vietnamita en entornos con recursos limitados. No obstante, el modelo no cuenta con descargas ni likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni métricas de calidad objetivas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (KModel), red neuronal para TTS; exportacion ONNX del modelo acustico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por fragmentos de texto, no modelo de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye checkpoint PyTorch y ONNX sin cuantizar declarada) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`), ONNX (`.onnx`), voicepacks en `.pt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Kokoro, un modelo TTS neuronal ligero que emplea un codificador de texto, un modelo acústico y un vocoder para generar waveform a partir de fonemas. En esta adaptación, el modelo acústico se ha fine-tuneado para vietnamita y se exporta a ONNX Runtime para inferencia en CPU o GPU mediante `CUDAExecutionProvider`. El procesamiento de texto a fonemas (G2P) vietnamita se delega en la librería `vig2p`, que se alinea con el código de inferencia y entrenamiento del repositorio de GitHub.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá del fine-tuning y la exportación ONNX. La model card únicamente describe los ficheros distribuidos, los comandos de instalación e inferencia y el flujo de exportación ONNX.

## Capacidades

- Síntesis de voz (text-to-speech) en vietnamita a partir de texto plano.
- Inferencia en PyTorch y en ONNX Runtime, con soporte de CPU y CUDA.
- Voicepacks intercambiables: un voicepack por defecto (`kokoro_vi_voicepack.pt`) y voicepacks adicionales en `voicepacks/*.pt`.
- Conversión de texto a fonemas vietnamitas mediante `vig2p`, con opción de imprimir fonemas (`--print-phonemes`).
- Exportación propia del modelo a ONNX mediante `kokoro-vietnamese-export-onnx`.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura de artículos y documentos en vietnamita: el modelo convierte texto plano en audio, adecuado para sistemas de accesibilidad y lectura por voz en aplicaciones móviles o web, con inferencia en CPU gracias a la exportación ONNX.
- Asistentes de voz para atención al cliente en vietnamita: integración en pipelines de IVR o chatbots que necesiten respuestas habladas, usando el voicepack por defecto o voces alternativas según el perfil del cliente.
- Generación de audiolibros y contenido educativo: síntesis por lotes de capítulos o lecciones, con selección de voicepack para mantener consistencia de voz a lo largo de un proyecto.
- Localización de vídeos y podcasts: doblaje automatizado de contenido al vietnamita, generando pistas de audio a partir de guiones o subtítulos.
- Sistemas de navegación y anuncios públicos: mensajes cortos sintetizados en tiempo real en dispositivos embebidos, donde la baja huella del modelo ONNX y la ejecución en CPU son ventajosas.
- Prototipado de productos TTS en vietnamita: uso del checkpoint PyTorch y del script de exportación ONNX para evaluar latencia y calidad antes de integrar en producción, con licencia Apache 2.0 que facilita la experimentación comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,7 GB) sugiere un modelo compacto que probablemente cabe en GPUs de consumo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. La model card menciona `--device cuda` y `onnxruntime-gpu` con `CUDAExecutionProvider`, sin especificar modelos de GPU.
- Cabe en GPU de consumo: no confirmado; la ejecución en CPU está soportada explícitamente mediante ONNX Runtime.
- Opciones de despliegue: PyTorch (CLI `kokoro-vietnamese`), ONNX Runtime (CLI `kokoro-vietnamese-onnx`), con soporte de CPU y CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Licencia | Formato | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|
| Kokoro-Vietnamese (este modelo) | vietnamita | Apache 2.0 | PyTorch, ONNX | texto plano | Hugging Face, GitHub |
| Kokoro original (hexgrad/Kokoro-82M) | inglés (principalmente) | Apache 2.0 | PyTorch, ONNX | texto plano | Hugging Face |
| Otros TTS vietnamitas open source | vietnamita | variable | variable | texto plano | Hugging Face, GitHub |

No se dispone de datos de rendimiento comparativo ni de parámetros de los modelos alternativos en la información proporcionada; la comparativa se limita a idioma, licencia y formato de distribución.

## Limitaciones y advertencias

- Solo soporta vietnamita; no se declaran otros idiomas.
- No se han publicado métricas de calidad (MOS, WER, inteligibilidad) ni benchmarks, por lo que la calidad real del fine-tuning no está verificada objetivamente.
- El modelo no registra descargas ni likes, lo que indica ausencia de validación por parte de la comunidad.
- Riesgo de alucinación y errores de pronunciación en textos con nombres propios, siglas, números o palabras extranjeras, dependiente de la calidad de `vig2p`.
- No se especifican sesgos conocidos; al ser un modelo de voz, puede reflejar sesgos de los datos de entrenamiento originales de Kokoro y del corpus vietnamita empleado en el fine-tuning.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de las dependencias (`vig2p`, Kokoro base) antes de producción.
- No se documentan limitaciones de longitud de texto; el procesamiento por fragmentos puede afectar a la prosodia en textos largos.
- La fecha de creación del repositorio (2026-11-14) y la ausencia de actualizaciones posteriores no permiten evaluar su mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/jackyb1234/Kokoro-Vietnamese
- GitHub (código de inferencia y entrenamiento): https://github.com/iamdinhthuan/Kokoro-Vietnamese
- Kokoro original (referencia): https://huggingface.co/hexgrad/Kokoro-82M
