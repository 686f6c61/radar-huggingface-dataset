# ryusei-46/Irodori-TTS-v4.1-ONNX-WebGPU

## Resumen

Irodori-TTS v4.1 ONNX (WebGPU) es una conversión a formato ONNX del modelo de síntesis de voz japonesa Irodori-TTS v4.1, desarrollado originalmente por Aratako y convertido por ryusei-46 para su ejecución íntegra en el navegador mediante ONNX Runtime Web con aceleración WebGPU. El paquete incluye dos variantes del generador DiT: una versión MeanFlow de 4 pasos (v4.1-Small-MF) orientada a baja latencia y una versión de flujo rectificado con CFG de 40 pasos (v4.1-Small) orientada a calidad. Ambas comparten los módulos de codificación de texto, predicción de duración y decodificación de audio.

El modelo resuelve el problema de la síntesis de voz japonesa con control de estilo mediante una descripción textual de la voz (caption), sin necesidad de audio de referencia, y añade una ruta opcional de codificación de hablante para mantener coherencia de timbre en textos largos sintetizados oración por oración. Su relevancia actual radica en que permite inferencia TTS completamente local en el navegador de un PC de escritorio, sin enviar texto a servidores externos, con una descarga inicial de aproximadamente 1,7 GB para la variante estándar.

La arquitectura combina un codificador de texto basado en ModernBERT (modernbert-ja-310m), un transformer de difusión (DiT) que opera sobre latentes de 32 dimensiones y un decodificador de códec neuronal DACVAE que produce audio a 48 kHz. El repositorio ocupa 2,5 GB y la licencia es MIT, heredada de los modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con codificador ModernBERT, DiT (MeanFlow de 4 pasos y rectified flow de 40 pasos con CFG) y decodificador DACVAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la duración de salida se limita a 0,5-30 segundos por segmento) |
| Tipos de cuantizacion | Pesos en fp16 con Cast a fp32 en tiempo de ejecución; sin cuantización de 4 u 8 bits (descartada por degradación de calidad) |
| Idiomas soportados | Japones (ja) |
| Licencia | MIT (Copyright (c) 2026 Aratako) |
| Formato de pesos | ONNX con datos externos (`*.onnx.data`), opset 18, batch y longitud de secuencia dinámicos |

## Arquitectura y entrenamiento

El modelo es una conversión directa de los pesos PyTorch de Irodori-TTS v4.1-Small-MF y v4.1-Small mediante `torch.onnx.export(dynamo=True)` con opset 18. La arquitectura original consta de un codificador de texto y caption basado en ModernBERT japonés (modelo `sbintuitions/modernbert-ja-310m`, 310M parámetros) con proyección, un módulo de predicción de duración en log-frames, un DiT que genera latentes de 32 dimensiones y un decodificador DACVAE que reconstruye la onda a 48 kHz. El códec `Semantic-DACVAE-Japanese-32dim` deriva de `facebook/dacvae-watermarked`.

La variante MeanFlow emplea 4 pasos de integración con `delta_t` como entrada, mientras que la variante RF usa 40 pasos con classifier-free guidance, aplicando tres términos de corrección (texto y caption) con coeficiente 3 y un cuarto término de hablante con coeficiente 5 cuando se usa referencia. Entre las modificaciones técnicas de la conversión destacan la sustitución del RoPE complejo por un cálculo real equivalente, la reescritura del ConvTranspose del decodificador como Conv más pixel-shuffle (debido a salidas corruptas en WebGPU de ONNX Runtime Web, con correlación 1,000000 respecto al original) y la eliminación de ramas dependientes de datos y longitudes fijas. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Síntesis de voz japonesa a partir de texto plano con normalización lingüística previa (`normalize_text`).
- Control de estilo de voz mediante caption textual (descripción del timbre o atmósfera).
- Predicción automática de duración con salida limitada al rango de 0,5 a 30 segundos por segmento.
- Coherencia de hablante en textos largos: la ruta de referencia permite usar la primera oración generada como muestra para alinear las siguientes.
- Codificación de hablante a partir de audio de referencia a 48 kHz mono, con normalización de sonoridad a −16 LUFS (ITU-R BS.1770).
- Inferencia completamente local en navegador mediante WebGPU, sin envío de texto a servidores.
- Dos modos de calidad/latencia: estándar (4 pasos) y alta calidad (40 pasos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de artículos y documentos en japonés dentro de una aplicación web: el modelo se ejecuta en el navegador con WebGPU y permite convertir texto a voz sin que el contenido salga del dispositivo, adecuado para herramientas de accesibilidad o lectura asistida.
- Audiolibros y contenido narrado de formato largo: la ruta de referencia con `dac_encoder` y `speaker` permite sintetizar oración por oración manteniendo un timbre consistente, usando la primera frase generada como muestra de voz.
- Prototipado de interfaces de voz en japonés: la variante MeanFlow de 4 pasos reduce la latencia lo suficiente para respuestas interactivas en aplicaciones conversacionales desplegadas en el cliente.
- Generación de voces con estilo controlado: el caption textual permite describir la atmósfera de la voz (tono, carácter) sin necesidad de grabar referencias, útil en producción de pódcast o vídeo.
- Demostraciones y herramientas educativas offline: al no requerir backend, puede distribuirse como aplicación estática que funciona tras la primera carga de 1,7 GB, con caché en el navegador.
- Evaluación de TTS en entornos con restricciones de privacidad: sectores que no pueden enviar texto a la nube pueden ejecutar la síntesis localmente en equipos de escritorio con Chrome o Edge y GPU compatible con WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card sí documenta métricas de fidelidad de la conversión: con pesos fp32, la diferencia máxima respecto a PyTorch es de 1,1e-4 (4 pasos) y 1,5e-4 (40 pasos), y con referencia de 1,0e-3 y 1,8e-4 respectivamente. Con pesos fp16, la correlación con la salida fp32 es de 0,997 (4 pasos) y 0,981 (40 pasos), y de 0,93 en textos largos con referencia. Estas pruebas se realizaron en una GPU integrada AMD Radeon 780M con Chromium y WebGPU.

## Requisitos de hardware

- Inferencia en navegador de escritorio con WebGPU: Chrome o Edge en PC con GPU compatible. No funciona en iPhone ni iPad por superar el límite de memoria.
- Descarga inicial de aproximadamente 1,7 GB para el modo estándar; las cargas posteriores usan la caché del navegador.
- Tamaño de los módulos: encoder 644 MB, duration 44 MB, decoder 167 MB, dac_encoder 56 MB, speaker 122 MB, DiT MeanFlow 749 MB, DiT RF 734 MB, tokenizer 7 MB.
- Los pesos se cargan directamente en la GPU mediante `externalData`; los cuatro módulos simultáneos no caben en el límite de 4 GB de la implementación wasm.
- Entorno de validación documentado: AMD Radeon 780M (GPU integrada) con Chromium y WebGPU.
- No se proporcionan datos de latencia ni throughput para GPUs dedicadas como A100, H100 o RTX 4090.
- Opciones de despliegue: ONNX Runtime Web (WebGPU) en navegador; el formato ONNX con datos externos es compatible con otros runtimes ONNX, aunque no se documentan recetas para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a este TTS).

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto/duración | Licencia | Despliegue |
|---|---|---|---|---|---|
| Irodori-TTS v4.1 ONNX (este) | TTS con DiT y DACVAE | ja | 0,5-30 s por segmento | MIT | Navegador (WebGPU), ONNX |
| Irodori-TTS v4.1-Small (original) | TTS con DiT y DACVAE | ja | 0,5-30 s por segmento | MIT | PyTorch |
| Irodori-TTS v4.1-Small-MF (original) | TTS MeanFlow 4 pasos | ja | 0,5-30 s por segmento | MIT | PyTorch |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada, ni de métricas de calidad subjetiva (MOS) que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Solo acepta texto de entrada en japonés; no se documenta soporte multilingüe.
- No es un modelo de lenguaje: no realiza razonamiento, generación de código, tool calling ni tareas de agente.
- La duración de cada segmento está acotada a 30 segundos; textos más largos requieren segmentación y, para coherencia de voz, el uso de la ruta de referencia.
- La cuantización a 4 y 8 bits se descartó por degradación audible de la calidad de voz; solo se ofrece fp16 con cálculo fp32.
- No funciona en dispositivos iOS por límites de memoria del navegador.
- Riesgo de que la voz generada sin referencia se parezca casualmente a una persona real, según advierte la model card original.
- Restricciones éticas explícitas: prohibido clonar o suplantar voces sin consentimiento, generar deepfakes o desinformación. La licencia MIT no exime de estas restricciones.
- El modelo base incluye un códec derivado de `facebook/dacvae-watermarked`, lo que puede implicar marcas de agua en el audio generado (no detallado en la información disponible).
- No se publican métricas de sesgo, MOS ni evaluaciones de robustez lingüística.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ryusei-46/Irodori-TTS-v4.1-ONNX-WebGPU
- Modelo base v4.1-Small-MF: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small-MF
- Modelo base v4.1-Small: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Códec DACVAE japonés: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Códec original con marca de agua: https://huggingface.co/facebook/dacvae-watermarked
- Tokenizador ModernBERT japonés: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Repositorio del proyecto Irodori-TTS: https://github.com/Aratako/Irodori-TTS
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Demo en navegador (japonés): https://media.tools.ryusei.io/audio/text-to-speech
- Demo en navegador (inglés): https://media.tools.ryusei.io/en/audio/text-to-speech
