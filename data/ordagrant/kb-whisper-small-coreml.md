# Ordagrant/kb-whisper-small-coreml

## Resumen

Ordagrant/kb-whisper-small-coreml es una conversión a Core ML del modelo KBLab/kb-whisper-small, un ajuste fino en sueco del conocido Whisper small de OpenAI. Lo publica el proyecto Ordagrant, una herramienta de transcripción, y su propósito es permitir la inferencia local y eficiente de reconocimiento automático del habla (ASR) en sueco sobre hardware Apple mediante el framework WhisperKit.

El modelo hereda la arquitectura transformer encoder-decoder de Whisper en su variante small, con aproximadamente 244 millones de parámetros, y está empaquetado en formato Core ML (`.mlpackage`) en lugar de los pesos originales de PyTorch. El repositorio ocupa 0,3 GB, lo que refleja el tamaño compacto del modelo convertido.

Su relevancia es acotada pero clara: cubre un nicho concreto, la transcripción de audio en sueco en dispositivos Apple (macOS, iOS) sin conexión a servicios en la nube, con licencia Apache 2.0 que permite uso comercial. No está pensado como modelo generalista multilingüe, sino como una pieza de infraestructura lista para integrarse en aplicaciones de dictado o subtitulado en sueco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small), convertido a Core ML |
| Parametros totales | no disponible (Whisper small tiene ~244 M en su version original; no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper small original: ventana de audio de 30 s por segmento) |
| Tipos de cuantizacion | no disponible (build Core ML; el conversor whisperkittools suele generar variantes fp16, no confirmado) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage`), libreria `whisperkit` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder entrenado originalmente por OpenAI para ASR multitarea, que procesa audio en ventanas de 30 segundos convertidas a espectrogramas Mel. El modelo base KBLab/kb-whisper-small es un ajuste fino de ese checkpoint sobre datos de habla en sueco, realizado por KBLab (el laboratorio de la Biblioteca Nacional de Suecia). No se dispone en la información proporcionada de detalles sobre el volumen de datos de ajuste, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO.

La contribución de este repositorio es exclusivamente la conversión a Core ML mediante la herramienta whisperkittools, que traza el grafo del modelo y lo compila para ejecutarse con aceleración en el Neural Engine y la GPU de Apple. El repositorio incluye un `conversion.json` con la receta exacta de conversión y un `NOTICE.md` con las licencias. No hay innovaciones arquitectónicas propias: es un artefacto de despliegue, no un modelo nuevo.

## Capacidades

- Reconocimiento automático del habla (ASR) en sueco, con transcripción de audio a texto.
- Detección de idioma y marcas temporales por segmento, heredadas de la arquitectura Whisper.
- Ejecución local en dispositivos Apple mediante WhisperKit y Core ML, sin llamadas a red.
- Inferencia acelerada por Neural Engine/GPU en chips de la serie M y A.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada al sueco en este ajuste; el Whisper small original es multilingüe, pero el fine-tuning de KBLab está orientado a sv.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones en sueco en macOS: integrar el `.mlpackage` en una app de escritorio con WhisperKit para generar actas locales sin enviar audio a la nube, aprovechando el tamaño reducido (0,3 GB) del paquete.
- Subtitulado automático de vídeo en sueco: procesar pistas de audio y generar ficheros SRT con marcas temporales, adecuado por la ventana de 30 s y la salida segmentada de Whisper.
- Dictado por voz en aplicaciones iOS: usar el modelo embebido en una app nativa para convertir voz a texto en campos de formulario, con latencia baja gracias a la aceleración Core ML.
- Indexación y búsqueda de archivos de audio: transcribir un archivo de entrevistas o podcasts en sueco y alimentar un índice de texto para búsqueda posterior.
- Accesibilidad: generar subtítulos en directo para contenido en sueco en dispositivos Apple, con la ventaja de que no requiere conectividad.
- Prototipado de pipelines ASR: servir como componente de referencia para validar flujos de transcripción antes de escalar a modelos mayores, dado su bajo coste de despliegue y licencia permisiva.
- Transcripción por lotes en un Mac: procesar carpetas de audio en local con un script que invoque WhisperKit, útil para investigadores que trabajan con corpus en sueco y necesitan privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en memoria unificada de los chips Apple. El paquete ocupa 0,3 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no aplica; está optimizado para Apple Silicon (M1, M2, M3, M4 y posteriores) y chips A-series compatibles con Core ML.
- Cabe en cualquier Mac con Apple Silicon y en iPhone/iPad recientes; no está pensado para GPU NVIDIA ni para ejecución en CUDA.
- Opciones de despliegue: WhisperKit (librería nativa de Argmax) sobre Core ML; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que esperan formatos GGUF o safetensors de PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Ordagrant/kb-whisper-small-coreml | ~244 M (Whisper small, no confirmado) | ventana de 30 s | sueco | Apache 2.0 | Core ML |
| KBLab/kb-whisper-small | ~244 M (Whisper small) | ventana de 30 s | sueco | Apache 2.0 | safetensors (PyTorch) |
| openai/whisper-small | ~244 M | ventana de 30 s | multilingüe | Apache 2.0 | safetensors (PyTorch) |
| openai/whisper-large-v3 | ~1.550 M | ventana de 30 s | multilingüe | Apache 2.0 | safetensors (PyTorch) |

La diferencia principal frente a KBLab/kb-whisper-small es el formato: este repositorio ofrece el artefacto listo para Core ML, mientras que el original requiere conversión. Frente a whisper-small de OpenAI, el ajuste de KBLab está especializado en sueco y probablemente rinda mejor en ese idioma, aunque no hay datos de benchmarks disponibles para confirmarlo. Frente a whisper-large-v3, este modelo es mucho más ligero y desplegable en dispositivos, a costa de menor capacidad general.

## Limitaciones y advertencias

- Especializado únicamente en sueco; no debe usarse para otros idiomas sin esperar degradación severa.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o habla solapada, un comportamiento conocido de la familia Whisper.
- Sesgos heredados de los datos de entrenamiento de Whisper y del corpus de ajuste de KBLab; no se documentan en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el `NOTICE.md` incluido por posibles atribuciones adicionales.
- Dependencia del ecosistema Apple: no es portable a Linux ni a GPU NVIDIA sin reconversión.
- No hay información publicada sobre cuantizaciones, latencia ni métricas de calidad (WER) en este repositorio.
- El número de descargas (14) y de likes (0) indica un artefacto muy reciente y poco validado por la comunidad; conviene evaluarlo con datos propios antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Ordagrant/kb-whisper-small-coreml
- Modelo base: https://huggingface.co/KBLab/kb-whisper-small
- Proyecto Ordagrant: https://github.com/svenclaesson/ordagrant
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- Whisper (OpenAI): https://github.com/openai/whisper
