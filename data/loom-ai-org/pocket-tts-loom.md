# loom-ai-org/pocket-tts-loom

## Resumen

Pocket TTS (English) es un modelo de síntesis de voz (text-to-speech) de 101.272.011 parámetros desarrollado originalmente por Kyutai y exportado a formato GGUF por loom-ai-org para su uso con el runtime loom.cpp y la librería loom-py-rt. Se trata de un modelo de lenguaje de flujo (flow language model) que opera sobre latentes del códec Mimi: el propio modelo codifica el texto de entrada, sin necesidad de fonemizador externo, y lleva integrada una voz por defecto.

El modelo base es `kyutai/pocket-tts` (release de septiembre de 2026 en inglés) y esta exportación conserva los mismos parámetros sin modificar en el fichero F32, del que se derivan las versiones cuantizadas. Su relevancia actual radica en que empaqueta en un único GGUF autodescriptivo las topologías de grafo, el tokenizador y el script de control necesarios para la inferencia, lo que simplifica el despliegue de TTS de calidad en entornos ligeros.

La exportación incluye 26 voces (una integrada, `alba`, y 25 adicionales como ficheros de voz bajo `voices/`), soporte de streaming de audio por fragmentos y una API de alto nivel que aplica automáticamente el ventaneo, el muestreo y el ensamblado que requiere el modelo. La licencia es CC-BY-4.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow language model sobre latentes del códec Mimi (transformer de flujo) |
| Parámetros totales | 101.272.011 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F32 y otras precisiones cuantizadas derivadas del F32 (el repo incluye varios ficheros GGUF; no se detallan los esquemas exactos) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (un único fichero autodescriptivo con grafos, tokenizador y driver) |

## Arquitectura y entrenamiento

El modelo es un flow language model de aproximadamente 100 millones de parámetros que genera audio sobre el espacio latente del códec Mimi. El texto se codifica internamente, de modo que no se requiere fonemizador ni pipeline de preprocesado lingüístico. La exportación a GGUF conserva las topologías de grafo y el driver de inferencia embebido, y el fichero F32 se ha verificado contra la implementación de referencia con las extracciones aleatorias fijadas, con una diferencia de 1,8e-06 rms respecto a la forma de onda de referencia paso a paso.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La generación es estocástica por defecto, con la temperatura propia del checkpoint (0,3), y admite una semilla (`seed`) para reproducir una muestra concreta.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con codificación de texto interna (sin fonemizador).
- Generación de audio en streaming: el driver del modelo entrega la forma de onda por fragmentos, que unidos equivalen exactamente a la salida de `infer` (`stream.exact`).
- Selección de voz mediante el parámetro `voice=`: una voz integrada (`alba`) y 25 voces adicionales en ficheros bajo `voices/`, además de ficheros de voz propios.
- Frecuencia de muestreo configurable por el usuario (`sample_rate=24000` en los ejemplos de la model card).
- Control de la estocasticidad mediante semilla para reproducibilidad.
- Acceso a la capa de bajo nivel (`model.infer(...)`) para pasar argumentos directamente al driver embebido y ajustar parámetros no expuestos por la API de alto nivel.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada ni multilingüismo más allá del inglés.

## Casos de uso

- Lectura de artículos y documentos: el modelo convierte texto plano en voz en inglés con una ventana de generación gestionada por la propia API, adecuado para pipelines de accesibilidad que convierten contenido escrito en audio.
- Asistentes de voz para aplicaciones: la API de streaming permite reproducir audio a medida que se genera, lo que reduce la latencia percibida en respuestas conversacionales de un solo turno.
- Generación de audiolibros y pódcasts sintéticos: con 26 voces disponibles y licencias por grabación documentadas, se pueden asignar voces distintas a personajes o secciones.
- Integración en aplicaciones de escritorio o embebidas: al ser un GGUF de ~100M de parámetros con runtime propio (loom-py-rt), encaja en entornos con recursos limitados donde no es viable un TTS de mayor tamaño.
- Pruebas de accesibilidad y localización: generación rápida de locuciones en inglés para validar interfaces, avisos y mensajes de sistema antes de la grabación definitiva con voces humanas.
- Investigación en TTS y modelos de flujo: el fichero F32 verificado contra la referencia permite reproducir resultados paso a paso con semilla fija, útil para experimentos comparativos sobre latentes de Mimi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de validación documentada es la fidelidad del fichero F32 frente a la implementación de referencia: 1,8e-06 rms de diferencia con las extracciones aleatorias fijadas, paso a paso.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; con 101,3M de parámetros, el fichero F32 ocupa aproximadamente 405 MB solo en pesos, y las versiones cuantizadas reducen esa cifra de forma proporcional.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por el tamaño del modelo es plausible que quepa en GPUs de consumo, pero no se aporta dato verificable.
- Opciones de despliegue: runtime loom.cpp mediante la librería `loom-py-rt` (PyPI), con API de alto nivel (`model.text2speech.infer`, `model.text2speech.stream`) y acceso al driver embebido (`model.infer`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| pocket-tts-loom (esta ficha) | 101.272.011 | no disponible | en | CC-BY-4.0 | GGUF | Export de `kyutai/pocket-tts` para loom.cpp; 26 voces; streaming |
| kyutai/pocket-tts | no disponible | no disponible | en | no disponible | no disponible | Modelo base original de Kyutai (release 2026-09) |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Aplican las restricciones de uso de Kyutai: se prohíbe, entre otras cosas, la suplantación o clonación de voz sin consentimiento explícito y lícito, y presentar el audio generado como grabación genuina de una persona real.
- Solo una voz (`alba`) está integrada en el fichero; las otras 25 son ficheros de voz que solo funcionan con estos pesos concretos, y loom rechaza ficheros creados para otra release.
- La licencia de cada voz corresponde a su grabación, no al modelo: `cosette` y `jean` son CC-BY-NC-4.0 (no comercial), y `juergen` y `rafael` no tienen licencia declarada por Kyutai. Las voces CC-BY requieren atribución a su dataset o hablante de origen.
- La clonación de voz a partir de una grabación requiere el encoder de Mimi, que esta exportación no incluye; solo se pueden convertir estados guardados previamente con `pocket-tts export-voice`.
- La generación es estocástica por defecto (temperatura 0,3), por lo que dos llamadas producen resultados distintos salvo que se fije `seed`.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- Si se pasa una frecuencia de muestreo incorrecta, la inferencia no falla: el audio se reproduce a velocidad incorrecta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/pocket-tts-loom
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Dataset de voces de Kyutai: https://huggingface.co/kyutai/tts-voices
