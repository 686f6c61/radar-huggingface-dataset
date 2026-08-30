# latent-variable/pocket-tts-cloning-en

## Resumen

El modelo `latent-variable/pocket-tts-cloning-en` es un espejo (mirror) byte-idéntico de los pesos de clonación de voz en inglés del modelo Pocket TTS desarrollado por Kyutai Labs. El repositorio original `kyutai/pocket-tts` está restringido (gated) y exige a cada usuario autenticarse con una cuenta de Hugging Face para acceder a estos pesos. Este mirror los redistribuye bajo licencia CC-BY-4.0, manteniendo las mismas condiciones de uso, para que aplicaciones locales como Yap (una app macOS sin cuenta ni telemetría) puedan instalar la funcionalidad de clonación de voz sin fricciones.

Pocket TTS es un sistema de texto a voz de alta calidad diseñado para ejecutarse en CPU, con un tamaño reducido y capacidad de clonar una voz a partir de unos pocos segundos de audio de referencia. Este mirror solo incluye los pesos de clonación para inglés (`languages/english/model.safetensors`, 219 MB); no incluye el tokenizer ni los pesos de las voces catálogo, que están disponibles sin restricciones en `kyutai/pocket-tts-without-voice-cloning`. El modelo es relevante para desarrolladores que buscan integrar síntesis de voz y clonación vocal en entornos locales, sin depender de servicios en la nube ni de credenciales externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo propietario de Kyutai; emplea el codec neuronal Mimi para representación de audio) |
| Parametros totales | No disponible (archivo safetensors de 219 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (tarea de TTS, no contexto de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, precisión no especificada) |
| Idiomas soportados | Solo inglés (este mirror contiene únicamente los pesos de clonación en inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo generador de audio. Se sabe que Pocket TTS utiliza el codec neuronal Mimi de Kyutai, que comprime el audio en representaciones discretas y facilita un modelo más pequeño y eficiente para CPU. El modelo original fue entrenado por Kyutai Labs con técnicas de generación de voz condicionada por texto y una referencia de voz para la clonación. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de ajuste como RLHF o DPO.

Este mirror no modifica, entrena ni retoca nada; es una copia exacta verificada mediante SHA-256 (`473f47d99560bd50eb8b4509d3cacfe7f316ab20bdca86505403a2e6a936a6e9`) de los pesos originales de clonación en inglés.

## Capacidades

- **Texto a voz (TTS)**: genera audio hablado a partir de texto de entrada, con calidad suficiente para aplicaciones de lectura y asistencia.
- **Clonación de voz**: puede imitar una voz de referencia a partir de una muestra de audio corta (según la documentación de Kyutai, unos 20 segundos son suficientes para una clonación básica).
- **Ejecución en CPU**: diseñado para funcionar en hardware sin GPU, con requisitos de memoria moderados (219 MB de pesos).
- **Integración local**: al ser un mirror sin restricciones de acceso, permite su uso en aplicaciones que requieren funcionamiento sin conexión y sin cuentas de usuario.
- **Compatibilidad con servidores de inferencia**: existen proyectos como `pocket-tts-server` que exponen una API compatible con OpenAI, permitiendo integrar clonación de voz en flujos de chat y agentes.
- **Limitación de voces**: este mirror solo trae los pesos de clonación; las voces predefinidas del catálogo (ocho voces según documentación del SDK) no están incluidas y deben obtenerse del repositorio sin clonación.

## Casos de uso

- **Asistentes de voz locales**: integrar Pocket TTS en una aplicación de escritorio o móvil que lea notificaciones o responda con voz personalizada, sin enviar datos a la nube.
- **Audiolibros y narración**: generar versiones narradas de textos largos usando una voz clonada con consentimiento del hablante, ideal para creadores de contenido.
- **Doblaje y localización**: clonar la voz de un actor para doblar contenido en otro idioma (inglés), siempre con permiso explícito.
- **Accesibilidad**: proporcionar síntesis de voz a personas con discapacidad visual o dificultades de lectura, con una voz natural y personalizable.
- **Automatización de atención al cliente**: usar la clonación de voz para crear respuestas de voz en sistemas IVR, manteniendo una experiencia coherente y local.
- **Desarrollo de aplicaciones de chat con voz**: combinar con un LLM y un servidor compatible con OpenAI para crear asistentes conversacionales que hablan con una voz clonada (como el ejemplo de `pocket-tts-server`).
- **Pruebas y prototipado**: evaluar rápidamente la calidad de la clonación vocal en entornos de desarrollo sin necesidad de GPU ni servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Memoria**: los pesos ocupan 219 MB en disco; la memoria RAM necesaria para inferencia es inferior a 1 GB en la mayoría de configuraciones.
- **CPU**: el modelo está optimizado para ejecutarse en CPU; cualquier procesador moderno (Intel/AMD de los últimos años) es suficiente para inferencia en tiempo real o casi tiempo real.
- **GPU**: no es necesaria. Puede ejecutarse en GPU si se desea, pero no aporta ventaja significativa.
- **Opciones de despliegue**: se puede usar con los scripts de inferencia del repositorio original de Kyutai (`kyutai-labs/pocket-tts`), con el servidor `pocket-tts-server` (API compatible OpenAI), o integrarlo en aplicaciones Python mediante carga directa del safetensors.
- **Latencia**: no hay datos oficiales, pero al ser un modelo ligero, la latencia en CPU suele ser de decenas de milisegundos por token de audio generado, permitiendo streaming en tiempo real.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de clonación de voz (como XTTS, Tortoise TTS o Coqui TTS) en la información proporcionada. Sin embargo, Pocket TTS destaca por su tamaño reducido y su capacidad de ejecución en CPU, lo que lo diferencia de modelos más grandes que requieren GPU. No hay benchmarks públicos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Sesgos y ética**: el modelo puede clonar voces de forma convincente; está estrictamente prohibido usarlo sin consentimiento explícito de la persona cuya voz se clona. Los términos de uso originales de Kyutai prohíben su uso para suplantación, fraude o desinformación.
- **Alucinación**: como modelo generativo de audio, puede producir artefactos o pronunciaciones incorrectas en textos complejos, aunque no se han documentado casos específicos.
- **Idioma**: este mirror solo incluye pesos para inglés. El modelo original puede soportar más idiomas, pero no están disponibles en este repositorio.
- **Dependencias**: el mirror no incluye el tokenizer ni las voces catálogo; para un uso completo del sistema es necesario descargar `kyutai/pocket-tts-without-voice-cloning` o el repositorio original (con autenticación).
- **Licencia**: aunque la licencia CC-BY-4.0 permite uso comercial con atribución, las restricciones de uso ético del modelo original se mantienen y deben respetarse.
- **Producción**: al ser un mirror sin mantenimiento activo, no se garantiza soporte ni actualizaciones. Se recomienda verificar la integridad de los pesos mediante el hash SHA-256.

## Enlaces

- Repositorio HuggingFace de este mirror: https://huggingface.co/latent-variable/pocket-tts-cloning-en
- Modelo original (gated): https://huggingface.co/kyutai/pocket-tts
- Repositorio sin clonación (ungated): https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- GitHub de Pocket TTS (Kyutai Labs): https://github.com/kyutai-labs/pocket-tts
- Página oficial de Pocket TTS: https://kyutai.org/pocket-tts/
- Servidor de clonación de voz con API OpenAI (proyecto de terceros): https://github.com/ai-joe-git/pocket-tts-server
- Proyecto Yap (app que motivó el mirror): https://github.com/latent-variable/Yap
- Documentación sobre el codec Mimi y el modelo en el SDK mlx-audio-swift: https://deepwiki.com/Blaizzy/mlx-audio-swift/4.3.3-pockettts-model
