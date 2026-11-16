# Phoonnx/styletts2-eu_es-emo-ahotts

## Resumen

`styletts2-eu_es-emo-ahotts` es un modelo de síntesis de voz (text-to-speech) en euskera (eu-ES) basado en la arquitectura StyleTTS2, desarrollado originalmente por el HiTZ Center y empaquetado por Phoonnx en formato ONNX para su uso con la librería `phoonnx`. El modelo parte del checkpoint upstream `HiTZ/StyleTTS2-eu_emo` y añade un front-end fonémico basado en AhoTTS, de ahí el sufijo `ahotts` en el identificador.

El modelo resuelve la generación de voz sintética en euskera con control emocional explícito: ofrece seis voces predefinidas que combinan dos hablantes (Antton y Maider) con tres estados emocionales (happy, neutral y sad). Está pensado para integrarse en asistentes de voz y sistemas de diálogo, especialmente en el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.

Su relevancia radica en la escasez de modelos TTS de calidad para lenguas minoritarias como el euskera, y en su licencia Apache-2.0, que permite uso comercial sin restricciones adicionales. El repositorio ocupa 0,3 GB y la distribución se realiza como pesos ONNX optimizados para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS neuronal con modelado de estilo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | euskera (eu-ES) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas AhoTTS en alfabeto IPA |
| Voces incluidas | 6 (Antton y Maider en happy, neutral y sad) |
| Tamano del repositorio | 0,3 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de síntesis de voz que combina un generador acústico con modelado de estilo latente, lo que permite controlar la prosodia y la expresividad de la voz generada. El modelo upstream `HiTZ/StyleTTS2-eu_emo` fue entrenado por el HiTZ Center específicamente para euskera con variantes emocionales, y esta versión de Phoonnx lo reempaqueta en ONNX para eliminar dependencias de PyTorch en tiempo de inferencia.

El front-end de texto no forma parte del modelo en sí: `phoonnx` delega la normalización y la conversión a fonemas en la librería `scriptconv`, que en este caso utiliza `AhoTTSPhonemizer` del paquete `scriptconv_copyleft.phonemizers.eu` (instalable con el extra `scriptconv[eu]`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o fine-tuning por preferencias.

## Capacidades

- Síntesis de voz en euskera (eu-ES) a partir de texto, con salida en fichero WAV.
- Control emocional mediante selección de voz: tres estados (happy, neutral, sad) para cada uno de los dos hablantes.
- Dos identidades de voz diferenciadas (Antton y Maider).
- Fonemización automática de texto en euskera mediante AhoTTS, integrada en el pipeline de `phoonnx`.
- Integración con el ecosistema OVOS/Mycroft a través de `ovos-tts-plugin-phoonnx`.
- Inferencia en ONNX, sin requerir PyTorch en producción.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en euskera: integración en OVOS/Mycroft mediante el plugin oficial, seleccionando la voz en `mycroft.conf` para respuestas habladas en euskera con tono neutro o emocional según el contexto conversacional.
- Audiolibros y narración automatizada: las tres variantes emocionales permiten alternar el tono según el contenido del texto (pasajes alegres, neutros o tristes) sin necesidad de grabación humana.
- Sistemas de megafonía y anuncios públicos en euskera: generación de avisos pregrabados o dinámicos en entornos como transporte, aeropuertos o edificios públicos donde se requiere una voz consistente y ligera (0,3 GB).
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido digital en euskera con una voz natural y control de expresividad para mejorar la comprensión.
- Prototipado de interfaces conversacionales: al ejecutarse en ONNX y con un repositorio de 0,3 GB, permite iterar rápidamente en el desarrollo de productos de voz para el mercado vasco sin depender de servicios en la nube.
- Localización de videojuegos y contenido multimedia: generación de diálogos con distintas emociones para personajes, usando las seis voces disponibles como base para doblaje preliminar o placeholders.
- Investigación en TTS para lenguas minoritarias: punto de partida reproducible (Apache-2.0) para fine-tuning o evaluación de técnicas de síntesis en euskera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,3 GB, por lo que la huella en memoria es reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo debería ejecutarse en tarjetas consumer como RTX 3060, RTX 4060 o superiores. También es viable en CPU para cargas no críticas.
- Cabe en GPU consumer: sí, por el tamaño del repositorio (0,3 GB).
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. Al estar en ONNX, es compatible con runtimes ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Emociones | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/styletts2-eu_es-emo-ahotts` | eu-ES | StyleTTS2 | Sí (happy/neutral/sad) | Apache-2.0 | ONNX | Hugging Face |
| `HiTZ/StyleTTS2-eu_emo` (upstream) | eu-ES | StyleTTS2 | Sí | Apache-2.0 | PyTorch (no confirmado) | Hugging Face |
| Otros StyleTTS2 empaquetados por Phoonnx | varios | StyleTTS2 | variable | variable | ONNX | Colección Phoonnx en Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta euskera (eu-ES); el texto en otros idiomas producirá una fonemización incorrecta.
- Dependencia de AhoTTS para la fonemización: el paquete `scriptconv_copyleft.phonemizers.eu` debe instalarse por separado mediante el extra `scriptconv[eu]`.
- Riesgo de alucinación acústica: como todo modelo TTS neuronal, puede generar artefactos, prosodia incorrecta o pronunciaciones erróneas en textos con nombres propios, siglas o palabras fuera de vocabulario.
- Sesgos de voz: solo hay dos hablantes (Antton y Maider) y tres emociones; la diversidad de voces, acentos y registros es muy limitada.
- Sin datos publicados sobre el dataset de entrenamiento, lo que impide evaluar sesgos demográficos o de dominio.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint upstream `HiTZ/StyleTTS2-eu_emo` y de las dependencias (AhoTTS) antes de desplegar en producción.
- El modelo está empaquetado para `phoonnx`; no se documenta compatibilidad directa con otras librerías TTS.
- Repositorio con muy poca tracción (19 descargas, 0 likes en el momento de la consulta): no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-eu_es-emo-ahotts
- Modelo upstream: https://huggingface.co/HiTZ/StyleTTS2-eu_emo
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
