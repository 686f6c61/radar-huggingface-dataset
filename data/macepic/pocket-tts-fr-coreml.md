# MacEpic/pocket-tts-fr-coreml

## Resumen

Pocket TTS French for Core ML es una exportación a Core ML del modelo de síntesis de voz Pocket TTS de Kyutai, en su variante para francés. Lo publica MacEpic (bajo la marca TextSniper) y deriva directamente de `kyutai/pocket-tts-without-voice-cloning`, concretamente de la carpeta `languages/french`. El modelo original es un TTS ligero de aproximadamente 100 millones de parámetros en su forma destilada de inferencia, diseñado por el laboratorio francés Kyutai para ejecutarse en CPU sin GPU y a velocidad superior al tiempo real.

La relevancia de esta ficha está en el formato: no es un modelo nuevo, sino un empaquetado Core ML pensado para integrarse en aplicaciones macOS/iOS. El repositorio incluye los pesos convertidos con la herramienta `xn-ptts` 0.6.0, un manifiesto `bundle.json` con tamaños y hashes SHA-256 de los 15 ficheros (398.574.710 bytes en total) y cuatro voces precalculadas a partir de grabaciones de `kyutai/tts-voices`. La conversión no altera los pesos más allá del propio proceso de exportación.

Se trata, por tanto, de un artefacto de despliegue para síntesis de voz en francés, con licencia CC BY 4.0 y sin datos de benchmarks publicados en la información disponible. Su interés práctico es permitir TTS en local dentro del ecosistema Apple sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS de Kyutai, variante de seis capas según la model card) |
| Parametros totales | aproximadamente 100 millones en forma destilada de inferencia (dato del modelo original Pocket TTS) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportación Core ML; el repo ocupa 0,2 GB) |
| Idiomas soportados | francés (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (paquete con `bundle.json` y 15 ficheros, 398.574.710 bytes) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de la variante francesa de seis capas de Pocket TTS, destilada para inferencia ligera. El modelo original de Kyutai se describe como un TTS de aproximadamente 100 millones de parámetros que funciona en CPU a velocidad superior al tiempo real, sin necesidad de GPU. No se especifican en la documentación proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica relevante en este repositorio es el proceso de exportación: los pesos se convierten con el ejemplo `export_coreml` de `xn-ptts` 0.6.0, que genera un bundle verificable mediante SHA-256. Las voces se construyen con el codificador de voz de `kyutai/pocket-tts` a partir de grabaciones recortadas de silencios, anteponiendo el token `bos_before_voice` en formato `emb` propio de xn-ptts. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en francés a partir de texto.
- Generación de audio con cuatro voces predefinidas: estelle, alba, anna y bill.
- Ejecución en local sobre Core ML, orientada a dispositivos Apple (macOS/iOS).
- Inferencia en CPU sin GPU, según las características del modelo original Pocket TTS.
- Integración con la aplicación TextSniper, que descarga el modelo automáticamente al seleccionar Pocket TTS para francés.
- No se documentan capacidades de clonación de voz (el modelo base es explícitamente `without-voice-cloning`).
- No se documentan tool calling, agentes, visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura de texto en voz alta dentro de aplicaciones macOS: el bundle Core ML permite invocar el TTS en local desde una app nativa sin conexión a internet, usando las voces incluidas.
- Accesibilidad para usuarios con discapacidad visual: integración en lectores de pantalla o utilidades de dictado inverso en francés, aprovechando la ejecución en CPU y la ausencia de dependencias de red.
- Procesamiento por lotes de documentos en francés: conversión de artículos, informes o correos a audio en pipelines locales, con coste marginal nulo por petición al no requerir API externa.
- Prototipado de asistentes conversacionales en francés: uso como capa de salida de voz en un asistente que corra íntegramente en el dispositivo, con las cuatro voces disponibles para diferenciar interlocutores.
- Aplicaciones educativas de aprendizaje de francés: generación de ejemplos de pronunciación con voces distintas (estelle, alba, anna, bill) para exponer al estudiante a diferentes timbres.
- Sustitución de servicios TTS en la nube por privacidad: al ejecutarse en local, el texto no sale del dispositivo, lo que encaja en entornos con requisitos de confidencialidad.
- Empaquetado dentro de herramientas de productividad tipo TextSniper: captura de texto en pantalla y reproducción inmediata en francés sin latencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 0,2 GB (398.574.710 bytes en 15 ficheros según `bundle.json`).
- VRAM: no aplica; el modelo está exportado para Core ML y el original está diseñado para ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; el modelo original funciona en CPU de portátil estándar a velocidad superior al tiempo real.
- Compatibilidad consumer: orientado a hardware Apple (macOS/iOS) por el formato Core ML; no se documentan requisitos mínimos de chip.
- Opciones de despliegue: Core ML a través de `xn-ptts` 0.6.0, que lee el bundle directamente; integración en apps Apple mediante el runtime de Core ML.
- Latencia y throughput: no disponibles de forma numérica; la referencia del modelo original es "más rápido que tiempo real en CPU de portátil".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MacEpic/pocket-tts-fr-coreml | ~100 M (destilado) | no disponible | fr | CC BY 4.0 | Core ML |
| kyutai/pocket-tts-without-voice-cloning | ~100 M (destilado) | no disponible | múltiples (incluye fr) | CC BY 4.0 | no disponible |
| kyutai/pocket-tts | ~100 M (destilado) | no disponible | múltiples | CC BY 4.0 | no disponible |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de otros sistemas TTS comparables (por ejemplo, modelos de mayor tamaño o de otros proveedores). No se dispone de métricas de calidad (MOS, WER) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta francés; no se debe esperar calidad en otros idiomas.
- El modelo base excluye clonación de voz; las voces están fijadas a las cuatro incluidas.
- No hay benchmarks publicados, por lo que la calidad de síntesis no está cuantificada en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Licencia CC BY 4.0: el uso comercial está permitido, pero exige atribución a Kyutai (Pocket TTS) y a las fuentes de las voces (Kyutai, Alba MacKenna, VCTK, Voice-Zero/LibriVox según la tabla de la model card).
- El formato Core ML limita el despliegue a plataformas Apple; no es portable a entornos Linux o Windows sin reconversión.
- Al ser una conversión de pesos, cualquier sesgo o artefacto del modelo original se hereda sin cambios.
- Riesgo de alucinación acústica (pronunciación incorrecta, prosodia anómala) no evaluado en la documentación disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MacEpic/pocket-tts-fr-coreml
- Modelo base: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Modelo con voces de referencia: https://huggingface.co/kyutai/pocket-tts
- Voces fuente: https://huggingface.co/kyutai/tts-voices
- Blog de Kyutai sobre Pocket TTS: https://kyutai.org/blog/2026-01-13-pocket-tts
- Repositorio GitHub de Pocket TTS: https://github.com/kyutai-labs/pocket-tts
- Herramienta de exportación xn-ptts: https://github.com/gradium-ai/xn-ptts
- Corpus VCTK: https://datashare.ed.ac.uk/handle/10283/3443
- Voice-Zero: https://github.com/OwenTyme/voice-zero
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Página de referencia en Learn AI: https://ai.miraheze.org/wiki/Pocket_TTS
