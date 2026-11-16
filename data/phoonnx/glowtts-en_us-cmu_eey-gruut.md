# Phoonnx/glowtts-en_us-cmu_eey-gruut

## Resumen

Glow-TTS en_us-cmu_eey-gruut es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy como parte del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la librería de TTS homónima. El modelo genera espectrogramas a partir de fonemas IPA procedentes del fonemizador gruut, que posteriormente son convertidos en audio mediante el vocoder HiFi-GAN multi-VCTK small. Está orientado exclusivamente al inglés estadounidense (en-US) y a una única voz identificada como `larynx/en-us-cmu_eey-glow_tts`.

El modelo resuelve el problema de la síntesis de voz local y ligera en entornos con recursos limitados, al ofrecer un pipeline completo de TTS que cabe en un repositorio de aproximadamente 0,1 GB y puede ejecutarse mediante ONNX Runtime sin depender de servicios en la nube. Su integración con el ecosistema OVOS (Open Voice OS) a través del plugin `ovos-tts-plugin-phoonnx` lo hace relevante para asistentes de voz autoalojados, domótica por voz y aplicaciones de accesibilidad que requieren inferencia offline.

La relevancia actual del modelo radica en su carácter práctico: no compite en calidad con los sistemas neuronales de gran escala, sino que ofrece una alternativa reproducible, de bajo consumo y fácilmente desplegable para pipelines de TTS deterministas. La ausencia de una licencia explícita registrada en el repositorio constituye, no obstante, una limitación importante para su adopción en producción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico normalizing flow) + vocoder HiFi-GAN |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, sin ventana de contexto definida) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | inglés estadounidense (en-US) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |
| Vocoder asociado | hifigan-multi-vctk-small |
| Entrada de texto | fonemas gruut en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Glow-TTS, un modelo acústico basado en normalizing flows que aprende una correspondencia biyectiva entre fonemas y marcos de espectrograma mel. A diferencia de los modelos autorregresivos como Tacotron 2, Glow-TTS permite una síntesis paralela y determinista, lo que se traduce en una latencia baja y estable. La alineación entre texto y audio se aprende de forma monotónica mediante programación dinámica durante el entrenamiento, sin necesidad de un mecanismo de atención explícito. El modelo fue entrenado originalmente por Rhasspy dentro del proyecto Larynx, orientado a voces de alta calidad para asistentes de voz offline.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, dado que en TTS estos procedimientos no son habituales. El vocoder empleado, HiFi-GAN multi-VCTK small, convierte los espectrogramas mel generados por Glow-TTS en formas de onda de audio. La innovación técnica principal del empaquetado de Phoonnx es la exportación a ONNX y la integración con la librería scriptconv para la normalización de texto y la fonemización mediante gruut, lo que permite un pipeline completo reproducible en Python y en OVOS.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US) con una única voz (`larynx/en-us-cmu_eey-glow_tts`).
- Conversión de texto a fonemas IPA mediante el fonemizador gruut integrado en scriptconv.
- Generación de espectrogramas mel y conversión a audio WAV mediante el vocoder HiFi-GAN.
- Inferencia local y offline mediante ONNX Runtime, sin dependencia de servicios externos.
- Integración con el ecosistema OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Salida determinista y paralela gracias a la arquitectura de normalizing flows de Glow-TTS.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No dispone de capacidades multilingües: únicamente en-US.
- No incorpora modo de razonamiento (thinking mode) ni otras capacidades cognitivas.

## Casos de uso

- Asistentes de voz autoalojados en OVOS: el modelo se integra mediante el plugin `ovos-tts-plugin-phoonnx` y permite sintetizar respuestas del asistente en local, sin enviar texto a servicios en la nube, lo que preserva la privacidad y reduce la latencia de red.
- Domótica por voz: en sistemas de control del hogar basados en Raspberry Pi u otros dispositivos de bajo consumo, el tamaño reducido del repositorio (0,1 GB) y la inferencia ONNX permiten ejecutar el TTS en el propio dispositivo.
- Aplicaciones de accesibilidad: lectores de pantalla y herramientas de asistencia para personas con discapacidad visual que requieran una voz en inglés estadounidense con funcionamiento offline y sin coste por uso.
- Generación de avisos y notificaciones pregrabadas dinámicamente: sistemas de megafonía, paneles informativos o servicios de alerta que necesiten convertir texto variable en audio en tiempo de ejecución.
- Pruebas y desarrollo de pipelines de TTS: al ser un modelo pequeño y determinista, resulta adecuado como referencia para validar pipelines de fonemización, generación de espectrogramas y vocoder antes de migrar a modelos de mayor calidad.
- Prototipado de interfaces conversacionales: equipos que desarrollan asistentes de voz pueden usar este modelo para iterar rápidamente en la lógica de diálogo sin depender de APIs externas de TTS.
- Investigación en síntesis de voz: sirve como línea base reproducible para comparar arquitecturas de normalizing flows frente a modelos autorregresivos o de difusión en tareas de TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,1 GB) y el uso de ONNX Runtime, se espera un consumo de memoria muy reducido, aunque no se confirma una cifra concreta.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de pequeño tamaño, es probable que funcione en CPU y en GPUs de gama baja, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño del artefacto sugiere que podría ejecutarse en GPUs de consumo, pero no se aportan datos verificables.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato |
|---|---|---|---|---|---|
| Glow-TTS en_us-cmu_eey-gruut (este modelo) | Glow-TTS + HiFi-GAN | en-US | 0,1 GB (repo) | other (sin registrar) | ONNX |
| Otros modelos de la colección Glow-TTS de Phoonnx | Glow-TTS + HiFi-GAN | variable según voz | no disponible | variable | ONNX |
| Modelos Larynx originales de Rhasspy | Glow-TTS + vocoder | múltiples | no disponible | variable | tar.gz original |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos comparables en la información proporcionada, por lo que la comparativa se limita a aspectos de formato, idioma y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos específicos en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido habitual de generación de texto, pero la síntesis puede producir pronunciaciones incorrectas en palabras fuera del dominio o no cubiertas por el fonemizador gruut.
- Limitaciones de idioma: el modelo solo soporta inglés estadounidense (en-US); no es multilingüe.
- Limitación de voz: únicamente ofrece una voz (`larynx/en-us-cmu_eey-glow_tts`), sin variedad de hablantes.
- Restricciones de licencia: la licencia figura como "other" y no hay licencia registrada para este modelo; el autor indica explícitamente que se consulte la release upstream antes de usarlo. Esto supone un riesgo legal para uso comercial.
- Dependencia de la fonemización: la calidad de la síntesis depende del fonemizador gruut y de la normalización de texto de scriptconv; errores en esta etapa afectan directamente al audio generado.
- Dependencia del vocoder: requiere descargar el vocoder HiFi-GAN multi-VCTK small, que phoonnx gestiona automáticamente pero que añade una dependencia externa.
- Madurez: el modelo tiene muy pocas descargas (21) y ningún "like", lo que sugiere una adopción limitada y escasa validación por parte de la comunidad.
- Fecha de creación registrada en 2026-11-14, lo que conviene verificar dado que puede tratarse de un dato anómalo o de un empaquetado reciente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_eey-gruut
- Release upstream de Rhasspy Larynx: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_eey-glow_tts.tar.gz
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
