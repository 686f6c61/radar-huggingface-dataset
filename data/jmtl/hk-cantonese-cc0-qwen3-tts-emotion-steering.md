# jmtl/hk-cantonese-cc0-qwen3-tts-emotion-steering

## Resumen

`hk-cantonese-cc0-qwen3-tts-emotion-steering` es un paquete de direccionamiento emocional (emotion steering) para el modelo de síntesis de voz `jmtl/hk-cantonese-cc0-qwen3-tts` (v0.0.5), una voz en cantonés de Hong Kong derivada de Qwen3-TTS Base. El modelo base no dispone de control emocional: no es posible indicarle que suene enfadado o triste. Este paquete transfiere parte de la capacidad de control emocional de Qwen3-TTS CustomVoice al modelo cantonés en forma de tres presets: `angry`, `fear` y `sad`.

La innovación metodológica es que no requiere ningún corpus de voz etiquetado por emoción. El autor justifica esta vía porque no conoce ningún conjunto de datos de habla cantonesa etiquetado emocionalmente cuya licencia permita uso comercial. Al no emplear datos de audio etiquetados, el paquete preserva la licencia permisiva de la voz base (Apache-2.0 en código y pesos, CC-0 en datos de entrenamiento).

Se trata de la versión 0.1.0, compatible únicamente con la versión v0.0.5 del modelo base. En pruebas de escucha a ciegas la emoción se percibió en todos los presets y la identidad de la voz se mantuvo, aunque el autor advierte que el resultado aún no alcanza la naturalidad de una interpretación humana. El repositorio ocupa 0.0 GB, lo que sugiere que contiene únicamente los vectores de direccionamiento y no los pesos completos del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete aplica direccionamiento sobre Qwen3-TTS Base; la arquitectura del modelo base no se detalla en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible para este paquete; existe una variante GGUF del modelo base (`jmtl/hk-cantonese-cc0-qwen3-tts-GGUF`) |
| Idiomas soportados | yue (cantonés), zh (chino) |
| Licencia | Apache-2.0 (código y pesos); datos de entrenamiento CC-0 |
| Formato de pesos | no disponible (el tamaño del repo es 0.0 GB; el paquete de steering no incluye pesos completos) |

## Arquitectura y entrenamiento

El paquete no modifica el modelo: aplica un "pequeño empuje" (push) interno durante la síntesis, es decir, una intervención sobre las activaciones o representaciones internas del modelo de voz mientras genera audio. Los tres presets (`angry`, `fear`, `sad`) se aplican con una intensidad por defecto configurable y son reproducibles con una semilla fija (en los ejemplos publicados, 20261220).

El método de construcción se documenta en `METHOD.md` del repositorio, y las mediciones y limitaciones en `docs/MODEL_CARD.md`, aunque su contenido no está incluido en la información disponible. La clave del enfoque es que no se entrena con grabaciones etiquetadas por emoción: el control se transfiere desde Qwen3-TTS CustomVoice, que sí dispone de control emocional, hacia la voz cantonesa derivada de Qwen3-TTS Base. No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz en cantonés de Hong Kong (yue) con salida de audio en formato FLAC en los ejemplos publicados.
- Control emocional mediante tres presets: `angry` (enfado), `fear` (miedo) y `sad` (tristeza).
- Aplicación de presets sobre líneas neutras (el preset es la única fuente de emoción) y sobre líneas que ya llevan carga emocional por su significado (el preset se suma a esa carga).
- Preservación de la identidad de la voz: en escucha a ciegas la voz se mantuvo como la misma persona en todos los presets.
- Reproducibilidad: los renders de ejemplo usan semilla fija.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking, dado que se trata de un modelo de texto a voz.

## Casos de uso

- Doblaje y localización de contenido audiovisual al cantonés: el preset permite ajustar la interpretación emocional de cada línea sin necesidad de un actor de voz distinto para cada emoción, manteniendo la misma identidad vocal en toda la producción.
- Audiolibros y narración: las líneas neutras pueden renderizarse con el preset adecuado al pasaje (tristeza en escenas dramáticas, miedo en suspense) usando la misma voz base.
- Asistentes de voz y atención al cliente en cantonés: el preset `angry` o `fear` permite generar respuestas con carga emocional controlada en escenarios de escalado o disculpa, aunque el autor advierte que la naturalidad aún no es la de un actor humano.
- Videojuegos y experiencias interactivas: generación de voces de personajes en cantonés con variación emocional por estado del juego, reutilizando un único modelo base y cambiando solo el preset.
- Investigación en control emocional de TTS: el paquete sirve como referencia de una técnica de steering que evita corpus etiquetados, útil para estudiar transferencia de control entre variantes de un mismo modelo (Base frente a CustomVoice).
- Prototipado rápido con licencia permisiva: al conservar Apache-2.0 en pesos y CC-0 en datos, es adecuado para productos comerciales que necesiten voz cantonesa emocional sin las restricciones de licencia de datasets de habla etiquetada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una evaluación subjetiva mediante escucha a ciegas: la emoción se percibió en todos los presets y la identidad de la voz se mantuvo, con la salvedad de que el resultado no es tan natural como una interpretación humana.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio del paquete ocupa 0.0 GB; los requisitos dependen del modelo base `jmtl/hk-cantonese-cc0-qwen3-tts` v0.0.5, cuyas especificaciones no se detallan en la información proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; existe una variante GGUF del modelo base que podría facilitar el despliegue en hardware más modesto, pero no se confirman requisitos.
- Opciones de despliegue: no disponible para este paquete; el modelo base cuenta con variante GGUF (`jmtl/hk-cantonese-cc0-qwen3-tts-GGUF`) y los ejemplos publicados incluyen renders tanto en GGUF como en PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Control emocional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jmtl/hk-cantonese-cc0-qwen3-tts-emotion-steering` (este) | Paquete de steering sobre TTS | yue, zh | Sí (angry, fear, sad) | Apache-2.0 / CC-0 | Hugging Face |
| `jmtl/hk-cantonese-cc0-qwen3-tts` (v0.0.5) | TTS cantonés | yue, zh | No | Apache-2.0 / CC-0 | Hugging Face |
| Qwen3-TTS CustomVoice | TTS con control emocional | no disponible | Sí (nativo) | no disponible | no disponible |
| Qwen3-TTS Base | TTS base | no disponible | No | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni benchmarks de los modelos comparados en la información proporcionada, por lo que la comparación se limita a capacidades y licencia.

## Limitaciones y advertencias

- Versión 0.1.0: es un primer corte y el autor indica que aún no alcanza la naturalidad de una persona interpretando la emoción.
- Compatibilidad restringida: funciona únicamente con la versión v0.0.5 del modelo base `jmtl/hk-cantonese-cc0-qwen3-tts`.
- Alcance emocional limitado a tres presets (`angry`, `fear`, `sad`); no se documentan otras emociones.
- Idiomas limitados a cantonés (yue) y chino (zh); no se documenta soporte de otros idiomas.
- No se detallan sesgos conocidos, riesgo de alucinación ni limitaciones de contexto en la información disponible; al ser un modelo de texto a voz, el riesgo relevante es de pronunciación o entonación inadecuada, no evaluado en la documentación disponible.
- Licencia Apache-2.0 en código y pesos y CC-0 en datos de entrenamiento, lo que permite uso comercial según la model card; conviene verificar los términos del modelo base y de Qwen3-TTS del que deriva.
- Las mediciones completas y limitaciones detalladas se encuentran en `docs/MODEL_CARD.md` y el método en `METHOD.md`, no incluidos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts-emotion-steering
- Modelo base (Qwen3-TTS Cantonese v0.0.5): https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts
- Variante GGUF del modelo base: https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts-GGUF
- Documentación de mediciones y limitaciones: `docs/MODEL_CARD.md` (en el repositorio del modelo)
- Metodología: `METHOD.md` (en el repositorio del modelo)
- Script de generación de muestras: `samples/make_samples.py` (en el repositorio del modelo)
