# dinhthuan/kokoro-vi-ngoc-huyen

## Resumen

El modelo `dinhthuan/kokoro-vi-ngoc-huyen` es un sistema de síntesis de voz (text-to-speech) en vietnamita, desarrollado por el usuario dinhthuan como un ajuste fino del modelo base `hexgrad/Kokoro-82M`. Está diseñado específicamente para producir audio con la voz femenina denominada Ngọc Huyền, y se distribuye como un repositorio de solo inferencia que incluye el checkpoint convertido, el voicepack, la configuración con vocabulario vietnamita y un frontend de inferencia parcheado.

El problema que resuelve es la falta de voces vietnamitas de calidad en el ecosistema Kokoro, un modelo TTS ligero de 82 millones de parámetros. Al adaptar el modelo base al idioma vietnamita mediante un sistema de grafema-a-fonema (G2P) basado en la librería `vig2p`, se consigue una pronunciación más precisa de los contrastes fonéticos propios del vietnamita, como las distinciones entre `t/th`, `tr/ch`, `s/x` y `d/gi`. Su relevancia actual radica en que ofrece una alternativa de código abierto, con licencia Apache-2.0, para integrar voz vietnamita en aplicaciones de producción sin depender de servicios comerciales.

El repositorio incluye una interfaz de línea de comandos, una API Python y una demo Gradio, lo que facilita su adopción tanto en entornos de desarrollo como en despliegues automatizados. El tamaño del repositorio es de 0,3 GB, lo que lo hace manejable para entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo TTS basado en Kokoro-82M (arquitectura interna no documentada en la información disponible) |
| Parametros totales | 82 millones (según el modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de síntesis de voz, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en precisión completa; se menciona soporte ONNX en repositorios derivados) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pth`), con versiones ONNX disponibles en repositorios derivados |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `hexgrad/Kokoro-82M`, un sintetizador de voz de 82 millones de parámetros. La información disponible no detalla la arquitectura interna del modelo base (si es transformer, convolucional o híbrido), pero se sabe que Kokoro-82M está diseñado para ser eficiente y ligero, adecuado para inferencia en CPU y GPU de baja gama.

El entrenamiento del ajuste fino se centró en la voz Ngọc Huyền, y el repositorio incluye un frontend de inferencia parcheado que utiliza la librería `vig2p==0.1.0` para la conversión de grafema a fonema en vietnamita. Este frontend preserva los contrastes fonéticos iniciales del vietnamita, mapea los tonos a símbolos compatibles con Kokoro y mantiene la misma ruta texto-a-fonema utilizada durante el entrenamiento. No se proporcionan datos sobre el conjunto de datos de entrenamiento, el número de pasos o el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de voz en vietnamita con la voz femenina Ngọc Huyền.
- Conversión de texto a fonemas mediante el sistema G2P `vig2p`, con manejo correcto de tonos y contrastes fonéticos vietnamitas.
- Control de velocidad de síntesis mediante el parámetro `speed` en la API Python.
- Interfaz de línea de comandos (`infer.py`) que permite generar audio desde texto, con opción de imprimir los fonemas resultantes.
- API Python integrable en aplicaciones propias, con devolución de la tasa de muestreo, el audio y los fonemas.
- Demo Gradio incluida para pruebas interactivas.
- Soporte de inferencia en CPU y GPU (CUDA), con opción de usar ONNX Runtime en repositorios derivados.

## Casos de uso

- Audiolibros en vietnamita: el modelo puede convertir novelas o documentos largos a audio con una voz natural, aprovechando la licencia Apache-2.0 para uso comercial sin regalías.
- Asistentes de voz para aplicaciones móviles: gracias a su tamaño reducido (82M parámetros), puede ejecutarse en dispositivos con recursos limitados, ofreciendo respuestas habladas en vietnamita.
- Doblaje de vídeos y contenido multimedia: la voz Ngọc Huyền puede utilizarse para locuciones en vídeos educativos, publicitarios o de entretenimiento, con control de velocidad para ajustar el ritmo.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla que necesiten síntesis de voz vietnamita de alta calidad.
- Aprendizaje de idiomas: generación de ejemplos de pronunciación vietnamita para estudiantes, con la posibilidad de imprimir los fonemas para verificar la transcripción.
- Sistemas de respuesta de voz interactiva (IVR) en vietnamita: el modelo puede integrarse en centralitas telefónicas para proporcionar menús y respuestas automatizadas, gracias a su API Python y su baja latencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como MOS (Mean Opinion Score), comparaciones con otros modelos TTS vietnamitas o mediciones de latencia y throughput.

## Requisitos de hardware

- El modelo tiene 82 millones de parámetros, por lo que la VRAM necesaria para inferencia es reducida. En FP32, el checkpoint ocupa aproximadamente 328 MB (0,3 GB), y en FP16 se reduce a la mitad.
- Puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños; el script `infer.py` acepta `--device cpu`.
- Para GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente, como una NVIDIA GTX 1050 Ti, RTX 2060 o superior. También funciona en GPUs integradas con soporte CUDA.
- El repositorio incluye soporte para ONNX Runtime, lo que permite desplegar en entornos con `onnxruntime-gpu` y usar `CUDAExecutionProvider`.
- Opciones de despliegue: script CLI, API Python, Gradio demo, o integración en servicios web mediante la API. También se puede convertir a ONNX para entornos de producción con inferencia optimizada.
- No se proporcionan datos de latencia o throughput específicos, pero dado el tamaño del modelo, se espera una síntesis en tiempo real o cercana a ella en hardware moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos TTS vietnamitas. El modelo base Kokoro-82M es el punto de referencia directo, pero no se han publicado comparaciones con alternativas como VietTTS, FPT.AI TTS o modelos comerciales. La información disponible no incluye benchmarks ni evaluaciones comparativas.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para la voz Ngọc Huyền; no es posible cambiar de voz sin reentrenar o usar otro voicepack.
- Solo soporta vietnamita; no hay capacidades multilingües.
- La calidad de la pronunciación depende del sistema G2P `vig2p`; puede haber errores en textos con nombres propios extranjeros, siglas o palabras poco comunes.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos limitados, puede presentar variaciones en la entonación o en la pronunciación de ciertos dialectos regionales.
- Riesgo de alucinación: en TTS, el riesgo se manifiesta como errores de pronunciación o de entonación en frases complejas; se recomienda revisar el audio generado para usos críticos.
- La licencia Apache-2.0 permite uso comercial, pero se debe incluir la atribución correspondiente al modelo base y al autor del ajuste fino.
- El repositorio es de solo inferencia; no se incluyen scripts de entrenamiento ni datos de entrenamiento, lo que limita la capacidad de adaptar el modelo a otras voces sin acceso al proceso de fine-tuning.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dinhthuan/kokoro-vi-ngoc-huyen
- Espacio Gradio (Kokoro-Vietnamese): https://huggingface.co/spaces/dinhthuan/Kokoro-Vietnamese
- Repositorio GitHub (iamdinhthuan/Kokoro-Vietnamese): https://github.com/iamdinhthuan/Kokoro-Vietnamese
- Repositorio GitHub (tuyndoan/kokoro-vietnamese): https://github.com/tuyndoan/kokoro-vietnamese
- Página de LA Studio (contextboxai/kokoro-vietnamese): https://www.lastudioai.com/models/contextboxai/kokoro-vietnamese
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
