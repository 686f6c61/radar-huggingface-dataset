# ggml-org/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni-2B es un modelo multimodal "any-to-any" desarrollado originalmente por LiquidAI, capaz de aceptar texto, imagen, audio y vídeo como entrada y de generar texto y voz como salida. Esta ficha cubre la versión cuantizada en formato GGUF publicada por ggml-org, pensada para ejecutarse con llama.cpp y con el servidor `llama serve`, lo que permite desplegarlo en hardware de consumo.

El modelo base cuenta con 1.728.801.600 parámetros reales (etiquetado comercialmente como 2B) y combina un núcleo de lenguaje con codificadores multimodales empaquetados en un fichero `mmproj`: un codificador de visión, un codificador de audio y una ruta de salida de audio basada en un depthformer más un códec. Esta separación permite cargar el modelo de lenguaje y los adaptadores multimodales de forma independiente.

Su relevancia actual radica en que ofrece una pipeline completa de entrada y salida multimodal (incluida síntesis de voz) en un tamaño que cabe en GPU de consumo, algo poco habitual en modelos any-to-any. La licencia LFM1.0 ("other") condiciona el uso comercial, por lo que conviene revisarla antes de integrarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal any-to-any con codificadores de visión y audio y ruta de salida de audio depthformer + códec) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (incluye Q8_0 y Q4_K_M con la misma cuantización que los GGUF oficiales de LiquidAI) |
| Idiomas soportados | no disponible |
| Licencia | LFM1.0 (identificador `other`, enlace a LICENSE del modelo base) |
| Formato de pesos | GGUF (modelo + `mmproj` para visión, audio y salida de voz) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del transformer ni sobre la composición del dataset de entrenamiento en la información proporcionada. Lo que sí se documenta es la estructura de despliegue: el repositorio GGUF separa el modelo de lenguaje del fichero `mmproj`, que contiene el codificador de visión, el codificador de audio y la ruta de salida de audio (depthformer + códec). Esta modularidad es la que permite que llama.cpp cargue las capacidades multimodales de forma opcional.

Tampoco se especifican el número de tokens de entrenamiento, si hubo RLHF/DPO ni innovaciones como decodificación especulativa o atención lineal. La conversión a GGUF se realiza automáticamente mediante la herramienta `ggml-org/convert`, y las cuantizaciones Q8_0 y Q4_K_M replican exactamente las publicadas por LiquidAI, lo que garantiza paridad con los pesos oficiales.

## Capacidades

- Entrada multimodal: acepta texto, imagen, audio y vídeo (el vídeo requiere `ffmpeg` disponible en el `PATH`).
- Salida de voz: la síntesis de habla se sirve a través del endpoint `/tts` del servidor de llama.cpp.
- Generación de texto conversacional (pipeline `any-to-any`, tag `conversational`).
- Procesamiento de audio de entrada mediante el codificador incluido en `mmproj`.
- Procesamiento de imagen y vídeo mediante el codificador de visión incluido en `mmproj`.
- Compatible con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios HTTP.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistentes de voz en local: el modelo acepta audio como entrada y genera voz vía `/tts`, lo que permite construir un asistente conversacional por voz sin depender de APIs externas, ejecutándose con `llama serve`.
- Descripción y análisis de imágenes en el borde: con el codificador de visión en `mmproj`, se puede desplegar en una estación de trabajo para tareas de captioning, accesibilidad o moderación de contenido visual.
- Transcripción y comprensión de audio: el codificador de audio permite resumir reuniones, generar actas o extraer información de grabaciones directamente en el servidor.
- Análisis de vídeo con `ffmpeg`: al aceptar vídeo como entrada, resulta adecuado para indexar clips, generar descripciones automáticas o detectar eventos en grabaciones.
- Prototipado rápido de aplicaciones multimodales: el comando `llama serve -hf ggml-org/LFM3-Omni-2B-GGUF` permite tener un endpoint any-to-any operativo en minutos, ideal para validar ideas antes de invertir en infraestructura.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M y Q8_0 y un total de 1,73B parámetros, encaja en GPU de gama media para demos, investigación y entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 1,73B parámetros en Q4_K_M ocupa del orden de 1-1,5 GB para los pesos del lenguaje, a lo que hay que sumar el tamaño del fichero `mmproj` (codificadores de visión, audio y salida de voz), que incrementa el consumo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, debería funcionar en GPU de consumo con suficiente VRAM para pesos más `mmproj`.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque el dato exacto no está publicado.
- Opciones de despliegue: llama.cpp (requiere una build con soporte LFM3-Omni, PR #31257) y el servidor `llama serve`; también `llama.app`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría any-to-any.

## Limitaciones y advertencias

- Licencia LFM1.0 (identificador `other`): es imprescindible revisar el texto completo en el enlace de LICENSE del modelo base antes de cualquier uso comercial.
- El vídeo como entrada requiere `ffmpeg` instalado y accesible en el `PATH`.
- La salida de voz solo está disponible a través del endpoint `/tts` del servidor, no como capacidad genérica del modelo.
- Es necesario usar una build de llama.cpp con soporte específico para LFM3-Omni (PR #31257); las builds estándar pueden no cargarlo.
- Los pesos son una conversión automática de ggml-org/convert; pueden existir diferencias menores frente a los pesos originales de LiquidAI.
- No se documentan sesgos, riesgo de alucinación, idiomas soportados ni longitud de contexto, por lo que no es posible evaluar estos aspectos con la información disponible.
- Al ser una versión cuantizada, la calidad puede degradarse respecto al modelo en precisión completa, especialmente en Q4_K_M.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/LFM3-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- GGUF oficiales de LiquidAI: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Licencia: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31257
- Herramienta de conversión: https://github.com/ggml-org/convert
- Aplicación de ejecución: https://llama.app
