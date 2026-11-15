# Phoonnx/pockettts-it-kyutai

## Resumen

pockettts-it-kyutai es un modelo de síntesis de voz (text-to-speech) en italiano desarrollado originalmente por Kyutai y empaquetado por Phoonnx en formato ONNX para su biblioteca de inferencia phoonnx. Se trata de una conversión del modelo Pocket TTS de Kyutai, distribuida bajo licencia CC-BY-4.0 y orientada a entornos de inferencia ligera, incluyendo integraciones con asistentes de voz basados en OVOS.

El modelo toma texto en italiano codificado como puntos de código Unicode y genera audio mediante voces predefinidas. Phoonnx lo distribuye junto con un front-end de texto basado en la biblioteca scriptconv, que normaliza la entrada y la convierte al formato esperado por el modelo. El repositorio ocupa 0,8 GB, lo que sugiere un modelo compacto apto para despliegue en CPU o GPU de gama baja.

La relevancia de esta ficha radica en su carácter práctico: es un artefacto listo para producción en pipelines de TTS italianos, con voces múltiples (alba, anna, azelma, caro_davy, giovanni, etc.) y una integración directa con el ecosistema OVOS. No se dispone de datos sobre arquitectura interna, número de parámetros ni benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai), convertido a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | italiano (`it`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Puntos de código Unicode (`UnicodeCodepointPhonemizer`) |
| Voces disponibles | 26 voces en italiano |
| Tamaño del repositorio | 0,8 GB |
| Biblioteca de inferencia | phoonnx (`pip install --pre phoonnx`) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de la etiqueta "Pocket TTS", que corresponde a la familia de modelos de síntesis de voz de Kyutai. Se sabe que el artefacto publicado es una conversión ONNX realizada por KevinAHM (repositorio `KevinAHM/pocket-tts-onnx/onnx/italian`) a partir del modelo original `kyutai/pocket-tts/languages/italian`. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni técnicas de alineación o RLHF.

El front-end de texto es un componente destacable: phoonnx delega la normalización y conversión a scriptconv, que utiliza `UnicodeCodepointPhonemizer` para transformar el texto en la representación de entrada del modelo. Esto implica que el modelo trabaja directamente sobre puntos de código Unicode en lugar de fonemas lingüísticos convencionales, una decisión de diseño que simplifica el pipeline pero puede limitar el control sobre pronunciación.

## Capacidades

- Síntesis de voz en italiano a partir de texto plano, con salida en formato WAV.
- Múltiples voces predefinidas (26 identidades: alba, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, estelle, eve, fantine, george, giovanni, jane, javert, jean, juergen, lola, marius, mary, michael, paul, peter_yearsley, rafael, stuart_bell, vera).
- Normalización de texto mediante scriptconv antes de la síntesis.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Inferencia en Python mediante `TTSModelManager` de phoonnx.
- No se dispone de información sobre tool calling, agentes, vision, audio de entrada ni modo de razonamiento; son capacidades no aplicables a un modelo TTS.

## Casos de uso

- Asistentes de voz en italiano sobre OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite seleccionar la voz en `mycroft.conf`, lo que lo hace adecuado para asistentes domésticos y dispositivos empotrados que requieran respuestas habladas en italiano.
- Lectura de contenido editorial: artículos, blogs o noticias en italiano pueden convertirse a audio mediante la API `synthesize_wav`, usando voces distintas por sección o por tipo de contenido.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de lectura que necesiten TTS italiano con voces variadas y salida WAV estándar.
- Locución de vídeos y podcasts: generación de narraciones en italiano con voces consistentes (por ejemplo, `giovanni` o `alba`) para producción de contenido audiovisual sin necesidad de grabación humana.
- Sistemas de atención al cliente telefónica: síntesis de respuestas en italiano en IVR y chatbots de voz, aprovechando el formato ONNX para despliegue en servidores sin GPU dedicada.
- Pruebas de regresión de pipelines TTS: el artefacto ONNX y las voces fijas permiten generar audio reproducible para validar cambios en el front-end de texto (scriptconv) o en la integración con OVOS.
- Prototipado de interfaces conversacionales multilingües: aunque el modelo solo cubre italiano, puede combinarse con otros modelos Pocket TTS de la colección para construir sistemas multilingües por voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (0,8 GB) sugiere que el modelo es compacto, pero no se especifica el consumo de memoria en inferencia.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de tamaño reducido, es probable que funcione en CPU, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: phoonnx (`pip install --pre phoonnx`), plugin OVOS (`ovos-tts-plugin-phoonnx`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este artefacto TTS.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Licencia | Tamaño repo | Voces | Notas |
|---|---|---|---|---|---|---|
| pockettts-it-kyutai | Italiano | ONNX | CC-BY-4.0 | 0,8 GB | 26 | Este modelo |
| Otros Pocket TTS de la colección Phoonnx | Varios | ONNX | CC-BY-4.0 (según upstream) | no disponible | no disponible | Misma familia, distinto idioma |
| Modelos TTS comerciales (no disponibles en la información) | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Cobertura lingüística exclusivamente italiana (`it`); no se indica soporte multilingüe.
- El front-end basado en puntos de código Unicode puede producir pronunciaciones incorrectas en palabras con grafías ambiguas, siglas o extranjerismos.
- No se dispone de información sobre sesgos, robustez ante entradas adversas ni tasa de alucinación (en TTS, artefactos de audio o prosodia incorrecta).
- La licencia CC-BY-4.0 permite uso comercial con atribución; es obligatorio citar la autoría de Kyutai y, en su caso, la conversión ONNX de KevinAHM y el empaquetado de Phoonnx.
- El modelo se distribuye como artefacto ONNX dentro de phoonnx; no se ofrece información sobre cuantizaciones alternativas ni sobre fidelidad respecto al modelo original de Kyutai.
- La fecha de creación del repositorio (2026-11-14) y su bajo número de descargas (30) indican una adopción aún limitada; conviene validar la calidad del audio antes de usarlo en producción.
- No se dispone de información sobre latencia, throughput ni requisitos de memoria, lo que impide garantizar un rendimiento concreto en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pockettts-it-kyutai
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts/tree/main/languages/italian
- Conversión ONNX: https://huggingface.co/KevinAHM/pocket-tts-onnx/tree/main/onnx/italian
- Biblioteca phoonnx: https://github.com/TigreGotico/phoonnx
- Biblioteca scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Pocket TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/pocket-tts-6af8ea95fad812f585a5cb91
