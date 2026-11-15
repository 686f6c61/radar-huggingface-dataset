# Phoonnx/matcha-gl_es-icia_extended_phonemes

## Resumen

matcha-gl_es-icia_extended_phonemes es un modelo de síntesis de voz (text-to-speech) en gallego desarrollado originalmente por Proxecto Nós y empaquetado por Phoonnx para su uso con la librería ONNX `phoonnx`. El modelo subyacente es Matcha-TTS, una arquitectura de síntesis neuronal basada en flujos de coincidencia (matcha) que genera mel-espectrogramas a partir de fonemas, que posteriormente se convierten en audio mediante un vocoder. El modelo se distribuye en formato ONNX, lo que permite inferencia eficiente en CPU y GPU sin necesidad de framework de deep learning completo.

La particularidad de esta versión es que trabaja con fonemas extendidos del alfabeto Cotovia, el sistema de fonemización empleado por Proxecto Nós para el gallego. El paquete incluye la integración con `scriptconv`, que normaliza el texto de entrada y lo convierte a la representación fonémica que espera el modelo. Está pensado para integrarse en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`.

El modelo resuelve el problema de la síntesis de voz en gallego de forma ligera: el repositorio ocupa aproximadamente 0,1 GB, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados, asistentes de voz locales y aplicaciones que requieran TTS offline. Su licencia Apache 2.0 facilita el uso comercial y la integración en productos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (síntesis neuronal basada en flujos de coincidencia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | gallego (gl-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Matcha-TTS es una arquitectura de síntesis de voz que combina un encoder de fonemas con un decoder basado en flujos de coincidencia (conditional flow matching) para generar mel-espectrogramas. A diferencia de los modelos autorregresivos como Tacotron, Matcha-TTS emplea un proceso de generación no autorregresivo que permite síntesis rápida y estable. El modelo original fue entrenado por Proxecto Nós sobre el corpus Icia Extended para gallego, con representación fonémica extendida del alfabeto Cotovia.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). La innovación principal de este empaquetado es la conversión a ONNX y la integración con el pipeline de `scriptconv` para fonemización en gallego mediante `CotoviaPhonemizer`, lo que elimina la dependencia de frameworks pesados en tiempo de inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) en gallego a partir de texto plano.
- Fonemización automática mediante `CotoviaPhonemizer` del paquete `scriptconv[gl]`.
- Generación de audio en formato WAV mediante la API `synthesize_wav`.
- Integración con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en ONNX, compatible con CPU y GPU sin framework de deep learning completo.
- Soporte de voces gestionadas por `TTSModelManager` con carga y merge de voces por defecto.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-step (es un modelo TTS puro).

## Casos de uso

- Asistentes de voz locales en gallego: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en gallego en asistentes domésticos sin conexión a la nube, gracias a su formato ONNX y su tamaño reducido (0,1 GB).
- Lectura de contenido accesible: conversión de artículos, noticias o documentos en gallego a audio para personas con discapacidad visual o para consumo en formato podcast, usando la API `synthesize_wav` sobre texto normalizado por `scriptconv`.
- Señalización y anuncios en transporte público: generación de avisos pregrabados o dinámicos en gallego para estaciones y aeropuertos, donde la latencia baja de Matcha-TTS y la inferencia ONNX en CPU permiten despliegue en hardware embebido.
- Aplicaciones educativas de aprendizaje de gallego: síntesis de pronunciación de palabras y frases para herramientas de idiomas, aprovechando la fonemización Cotovia para una representación fonética consistente.
- Integración en pipelines de accesibilidad web: generación bajo demanda de audio para contenido web en gallego mediante un servicio ligero que carga el modelo ONNX y sintetiza texto por petición.
- Prototipado de interfaces conversacionales: uso del modelo como componente TTS en sistemas de diálogo experimentales en gallego, con la ventaja de que el empaquetado `phoonnx` gestiona la carga de voces y la normalización de texto.
- Generación de audiolibros o contenido editorial en gallego: síntesis por lotes de capítulos completos, con la posibilidad de ejecutar en CPU en servidores sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que el modelo ONNX es muy ligero y probablemente cabe en menos de 1 GB de memoria.
- GPU recomendadas: no se especifican; al ser ONNX, puede ejecutarse en CPU y en GPUs consumer modestas (por ejemplo, GTX 1650 o superiores) sin requisitos documentados.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria libre, aunque no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecución ONNX Runtime directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| matcha-gl_es-icia_extended_phonemes | Matcha-TTS | gallego | no aplica | Apache 2.0 | ONNX | Hugging Face (Phoonnx) |
| proxectonos/Nos_TTS-icia-extended-matcha-phonemes | Matcha-TTS | gallego | no aplica | Apache 2.0 | no disponible | Hugging Face (Proxecto Nós) |
| Otros modelos Matcha-TTS de la colección Phoonnx | Matcha-TTS | varios | no aplica | según modelo | ONNX | Hugging Face (Phoonnx) |

La comparativa con modelos de otros idiomas o arquitecturas (VITS, Piper, Coqui TTS) no está disponible en la información proporcionada. El modelo upstream de Proxecto Nós es la referencia directa; este empaquetado añade la conversión a ONNX y la integración con `scriptconv` y OVOS.

## Limitaciones y advertencias

- El modelo solo soporta gallego (gl-ES); no es multilingüe.
- La entrada debe ser texto en gallego y pasar por el fonemizador Cotovia; texto en otros idiomas o con caracteres no soportados puede producir una síntesis incorrecta.
- No se dispone de información sobre sesgos de voz (género, acento, edad) ni sobre la diversidad de hablantes del corpus de entrenamiento.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar pronunciaciones incorrectas ante palabras fuera de vocabulario, siglas o nombres propios.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream y del corpus Icia Extended.
- El número de descargas (26) y likes (0) es muy bajo, lo que sugiere poca validación comunitaria; conviene evaluar la calidad de síntesis antes de usarlo en producción.
- No hay datos publicados de benchmarks, latencia ni throughput; el rendimiento real debe medirse en el hardware objetivo.
- Depende de paquetes en versión preliminar (`pip install --pre phoonnx`) y de extras específicos (`scriptconv[gl]`), lo que puede afectar a la estabilidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-gl_es-icia_extended_phonemes
- Modelo upstream: https://huggingface.co/proxectonos/Nos_TTS-icia-extended-matcha-phonemes
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
