# mengetik/mengetik-voice-id-onnx

## Resumen
`mengetik-voice-id-onnx` es una conversión a ONNX del modelo de síntesis de voz Pocket TTS, adaptado al indonesio por el usuario anak10thn y empaquetado por Mengetik.id para su ejecución en el navegador mediante `onnxruntime-web`. El modelo original procede de Kyutai y se distribuye bajo licencia CC-BY-4.0; esta variante cuantiza los pesos a INT8 y los exporta con la herramienta `lomotron/pocket-tts-onnx-export` (MIT) para reducir el tamaño del repositorio a unos 0.2 GB y permitir inferencia local sin servidor.

El modelo resuelve la generación de voz en bahasa indonesio con capacidad de clonación de voz, pensado para integrarse en una aplicación web (Voice Studio de Mengetik.id). Su relevancia radica en que ofrece un pipeline de TTS ligero y desplegable en el cliente, sin depender de APIs externas, sobre una arquitectura Pocket TTS de 6 capas según la configuración `indonesian_6l.yaml` citada en la model card.

La información pública disponible es escasa: no se detallan parámetros totales, longitud de contexto ni composición del dataset de entrenamiento. Todo lo que sigue se limita a lo declarado en la model card y en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai), configuración `indonesian_6l.yaml` (6 capas); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (exportación ONNX) |
| Idiomas soportados | indonesio (`id`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (runtime `onnxruntime-web`) |

## Arquitectura y entrenamiento
El modelo es una conversión ONNX del checkpoint `anak10thn/pocket-tts-indonesian` (revisión `635cde7a28301861b120f57ec4dda8525073017c`), que a su vez es un reentrenamiento de Pocket TTS de Kyutai para bahasa indonesio usando datos LEMAS (CC-BY-4.0). La configuración empleada se identifica como `indonesian_6l.yaml`, lo que sugiere una variante de 6 capas, pero no se publican detalles sobre el número de parámetros, la composición exacta del corpus ni si hubo etapas de ajuste fino adicionales (RLHF/DPO) más allá del reentrenamiento declarado.

La conversión a ONNX se realizó con `lomotron/pocket-tts-onnx-export` (MIT, revisión `8f52199533098963fe1cbd90bed35bb20d871b5e`) aplicando cuantización INT8. El objetivo es la ejecución en el navegador a través de `onnxruntime-web`, lo que condiciona el diseño: pesos compactos, operaciones compatibles con WebAssembly/WebGPU y un pipeline de inferencia orientado a baja latencia en cliente. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Síntesis de voz (text-to-speech) en bahasa indonesio.
- Clonación de voz: la model card incluye una carpeta `voices/` con muestras de referencia procedentes de Common Voice (CC0).
- Ejecución en navegador mediante ONNX Runtime Web, sin necesidad de backend.
- Integración prevista en la aplicación Voice Studio de Mengetik.id.
- No se declaran capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada.
- Cobertura multilingüe limitada al indonesio según el campo `language: [id]`.

## Casos de uso
- Lectura por voz de artículos y contenidos web en indonesio: el modelo puede sintetizar texto directamente en el cliente, evitando enviar contenido a un servidor y reduciendo la latencia percibida.
- Accesibilidad para usuarios con discapacidad visual en aplicaciones web indonesias: al ejecutarse vía `onnxruntime-web`, se integra en el propio navegador sin instalación adicional.
- Prototipado de asistentes conversacionales en indonesio: sirve como capa de salida de voz en demos y MVPs donde no se quiere depender de APIs de TTS comerciales.
- Generación de narraciones para contenido educativo o divulgativo en bahasa indonesio, aprovechando la licencia CC-BY-4.0 para uso comercial con atribución.
- Clonación de voz controlada para doblaje de material propio: usando las muestras de referencia incluidas, siempre que se cuente con consentimiento del hablante.
- Pruebas de integración de TTS en el navegador para evaluar latencia y calidad antes de migrar a una variante de mayor tamaño o a un servicio gestionado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Tamaño del repositorio: aproximadamente 0.2 GB, lo que sugiere que la inferencia en INT8 puede ejecutarse en equipos de consumo sin GPU dedicada.
- Al estar orientado a `onnxruntime-web`, el despliegue previsto es en navegador (WebAssembly o WebGPU); no se documentan requisitos de VRAM específicos.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño reducido del modelo hace plausible su ejecución en hardware modesto, pero no hay datos publicados.
- Opciones de despliegue: ONNX Runtime Web (principal); otras opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo TTS en ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada. Como referencia cualitativa, el modelo base `anak10thn/pocket-tts-indonesian` es el punto de partida directo, y el Pocket TTS original de Kyutai sería la alternativa genérica multilingüe; sin embargo, no se han publicado métricas que permitan una comparación cuantitativa.

| Modelo | Idioma | Formato | Licencia | Contexto | Rendimiento |
|---|---|---|---|---|---|
| mengetik-voice-id-onnx | indonesio | ONNX INT8 | CC-BY-4.0 | no disponible | no disponible |
| anak10thn/pocket-tts-indonesian | indonesio | no disponible | no disponible | no disponible | no disponible |
| Pocket TTS (Kyutai) | multilingüe | no disponible | CC-BY-4.0 | no disponible | no disponible |

## Limitaciones y advertencias
- La model card prohíbe explícitamente el uso para suplantar la voz de personas sin consentimiento, fraude o contenido engañoso.
- Solo cubre bahasa indonesio; no se declara soporte para otras lenguas.
- Al ser una cuantización INT8, es esperable una pérdida de calidad respecto al checkpoint original en FP32, aunque no se cuantifica en la documentación.
- No se publican métricas de calidad (MOS, WER) ni evaluaciones de robustez ante texto ruidoso o dominios específicos.
- Riesgo de alucinación o artefactos de pronunciación en textos con nombres propios, siglas o mezcla de idiomas: no documentado, pero inherente a los sistemas TTS.
- Las muestras de voz de `voices/` proceden de Common Voice (CC0); su uso para clonación debe respetar las condiciones de consentimiento de los hablantes originales.
- El uso comercial está permitido por CC-BY-4.0 siempre que se atribuya adecuadamente al autor y al modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de su comportamiento en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mengetik/mengetik-voice-id-onnx
- Modelo base: https://huggingface.co/anak10thn/pocket-tts-indonesian
- Herramienta de exportación ONNX: https://huggingface.co/lomotron/pocket-tts-onnx-export
- Aplicación Voice Studio: https://www.mengetik.id/p/voice-studio.html
