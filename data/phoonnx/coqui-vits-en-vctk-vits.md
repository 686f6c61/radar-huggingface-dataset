# Phoonnx/coqui-vits-en-vctk-vits

## Resumen

`Phoonnx/coqui-vits-en-vctk-vits` es un modelo de síntesis de voz (text-to-speech) en formato ONNX derivado del modelo `coqui/en-vctk-vits` de Coqui. Lo publica el usuario Phoonnx como un artefacto individual extraído del repositorio agregador `Phoonnx/phoonnx-coqui-vits`, pensado para su uso con la librería `phoonnx` (proyecto de TigreGotico orientado a inferencia TTS ligera sobre ONNX Runtime). El modelo resuelve la conversión de texto a audio en inglés (en-US) con voces del corpus VCTK.

La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos y un discriminador adversarial durante el entrenamiento, con un vocoder HiFi-GAN integrado. El repositorio pesa aproximadamente 0,1 GB y se distribuye bajo licencia Apache-2.0, lo que facilita su integración en productos comerciales.

Su relevancia práctica es la de un componente de inferencia listo para desplegar en CPU o GPU sin depender del framework completo de Coqui TTS: al estar exportado a ONNX, puede ejecutarse con ONNX Runtime en entornos donde PyTorch no es viable (edge, servidores sin GPU, contenedores mínimos). No obstante, la información pública disponible es muy limitada: no hay métricas de calidad, ni detalles de entrenamiento, ni ejemplos de uso más allá de la referencia al repositorio origen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con decoder basado en flujos y vocoder HiFi-GAN integrado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la longitud de entrada la determina el texto, no una ventana de contexto) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (en-US), según la model card del repositorio origen |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX de `coqui/en-vctk-vits`, un checkpoint VITS entrenado sobre el corpus VCTK (conjunto de voces multi-hablante en inglés con acentos variados). VITS combina en un único modelo end-to-end: un encoder de texto fonetizado, un módulo de duración, un prior variacional condicionado por el texto, un decoder normalizing flow y un decoder de audio que actúa como vocoder generativo. Esta integración elimina la necesidad de un vocoder externo y permite inferencia en un solo paso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de VCTK, ni sobre si se aplicaron etapas de fine-tuning, RLHF o ajuste perceptual adicional. Tampoco se documentan innovaciones técnicas específicas de esta exportación más allá del propio empaquetado ONNX para la librería `phoonnx`. Los ficheros conservan las rutas del repositorio agregador original.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto plano.
- Soporte multi-hablante derivado de VCTK: el modelo origen está entrenado sobre múltiples hablantes del corpus, aunque esta exportación no documenta explícitamente los identificadores de voz disponibles.
- Inferencia sobre ONNX Runtime, lo que permite ejecución en CPU sin PyTorch.
- Integración con la librería `phoonnx` mediante el identificador de voz `coqui/en-vctk-vits`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No se documentan capacidades de clonación de voz zero-shot ni control de estilo o emoción.

## Casos de uso

- Lectura de artículos y contenido web: el modelo convierte texto plano en audio en inglés, adecuado para integrarse en pipelines de accesibilidad o lectores de noticias donde se requiere baja latencia y ejecución en CPU.
- Asistentes de voz embebidos: al estar en formato ONNX y pesar ~0,1 GB, puede desplegarse en dispositivos edge o contenedores mínimos sin dependencias de PyTorch, sirviendo respuestas habladas en inglés.
- Generación de audiolibros y pódcasts automatizados: la naturaleza multi-hablante del corpus VCTK permite alternar voces para narraciones con varios personajes, siempre que se validen los identificadores de hablante disponibles.
- Sistemas de alertas y notificaciones por voz: integración en servicios de telefonía o mensajería que necesiten sintetizar mensajes cortos en inglés con throughput alto y coste bajo.
- Pruebas de integración continua para pipelines TTS: al ser un artefacto ONNX pequeño y determinista, es útil como modelo de referencia en tests automatizados de sistemas de voz.
- Prototipado de interfaces conversacionales: combinado con un modelo de lenguaje y un ASR, permite montar un bucle de voz completo en local para demos y validación de producto antes de escalar a modelos TTS de mayor calidad.
- Localización de contenido en inglés: generación de pistas de voz para vídeos, tutoriales o cursos, con la salvedad de que solo cubre inglés y no se documenta control prosódico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (~0,1 GB) es plausible ejecutarlo en menos de 1 GB de memoria, pero es una estimación no confirmada por el autor.
- GPU recomendadas: no documentadas. Dado el tamaño reducido, cualquier GPU con soporte ONNX Runtime (incluso integradas) debería ser suficiente; no se confirma compatibilidad específica con A100, H100 o RTX 4090.
- Cabe en GPU consumer: probablemente sí, por el tamaño del artefacto, aunque no hay confirmación oficial.
- Opciones de despliegue: ONNX Runtime a través de la librería `phoonnx`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/coqui-vits-en-vctk-vits | VITS (ONNX) | en-US | ONNX | Apache-2.0 | Hugging Face |
| coqui/en-vctk-vits (origen) | VITS | en-US | PyTorch (checkpoint Coqui) | Apache-2.0 | Hugging Face / Coqui TTS |
| Piper (rhasspy/piper-voices) | VITS (ONNX) | múltiples | ONNX | MIT (mayoría de voces) | Hugging Face / GitHub |
| Kokoro-82M | StyleTTS2-like | varios | PyTorch / ONNX | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, RTF) para este modelo, por lo que la comparación se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no documenta parámetros, datos de entrenamiento, métricas de calidad ni ejemplos de audio.
- Solo inglés (en-US): no se documenta soporte multilingüe, lo que limita su uso en productos para otros idiomas.
- Calidad no verificada: al no haber benchmarks ni muestras publicadas, no es posible evaluar su naturalidad frente a alternativas como Piper o Kokoro sin pruebas propias.
- Riesgo de artefactos y prosodia limitada inherente a modelos VITS entrenados sobre VCTK, especialmente en textos largos o con puntuación compleja; no documentado por el autor.
- Sin control de estilo, emoción ni clonación de voz documentados.
- Posibles sesgos derivados del corpus VCTK (hablantes y acentos concretos), no analizados en la model card.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia y condiciones del checkpoint origen `coqui/en-vctk-vits` antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- Dependencia de la librería `phoonnx`: el artefacto está empaquetado para ese runtime, lo que puede requerir adaptación para otros entornos ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/coqui-vits-en-vctk-vits
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-coqui-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Modelo origen Coqui: https://huggingface.co/coqui/en-vctk-vits
- Paper VITS: https://arxiv.org/abs/2106.06103
- Corpus VCTK: https://datashare.ed.ac.uk/handle/10283/3443
