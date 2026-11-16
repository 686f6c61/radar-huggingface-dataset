# Phoonnx/matcha-ca-multispeaker_wavenext-espeak

## Resumen

matcha-ca-multispeaker_wavenext-espeak es un modelo de síntesis de voz (text-to-speech) para catalán, empaquetado en formato ONNX por Phoonnx a partir del modelo original `projecte-aina/matxa-tts-cat-multispeaker` desarrollado por Projecte AINA. El modelo emplea la arquitectura Matcha-TTS, un modelo de difusión condicionada por texto basado en flujos continuos de normalización, y está preparado para ejecutarse mediante la librería phoonnx, tanto en Python como en el ecosistema OpenVoiceOS (OVOS).

El modelo cubre la síntesis multihablante en catalán y toma como entrada fonemas en alfabeto IPA generados por espeak-ng, lo que lo hace útil para asistentes de voz, lectores de pantalla y aplicaciones de accesibilidad en catalán. Su empaquetado en ONNX permite su despliegue en entornos ligeros sin depender de frameworks de aprendizaje profundo pesados.

La relevancia actual radica en la escasez de modelos TTS abiertos de calidad para lenguas de menor difusión como el catalán, y en la posibilidad de integrarlo en pipelines de producción mediante phoonnx y el plugin `ovos-tts-plugin-phoonnx`. El repositorio tiene un tamaño de 0,1 GB y, en el momento de la consulta, registra 21 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (difusión condicionada por texto, flujos de normalización) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | catalán (`ca`) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Matcha-TTS es una arquitectura de síntesis de voz basada en modelos de difusión condicionada por texto que emplea flujos continuos de normalización (continuous normalizing flows) para generar espectrogramas mel de forma eficiente. El modelo original fue entrenado por Projecte AINA para el catalán multihablante; el modelo aquí descrito es un empaquetado en ONNX de los pesos fusionados (fused Wavenext) del modelo upstream, preparado para su ejecución con phoonnx.

La entrada de texto se procesa mediante un front-end que normaliza el texto y lo convierte a fonemas IPA con espeak-ng (a través de `scriptconv` y su fonemizador `EspeakPhonemizer`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El vocoder asociado es Wavenext, según la nota de licencia del modelo.

## Capacidades

- Síntesis de voz en catalán a partir de texto.
- Soporte multihablante (multispeaker) en catalán.
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Entrada basada en fonemas IPA generados por espeak-ng.
- Integración con el ecosistema OpenVoiceOS mediante `ovos-tts-plugin-phoonnx`.
- Ejecución en formato ONNX, sin dependencia de frameworks de deep learning pesados.
- No se documenta soporte de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en catalán: el modelo puede integrarse en OVOS configurando el plugin `ovos-tts-plugin-phoonnx` en `mycroft.conf`, proporcionando respuestas habladas en catalán con voces múltiples.
- Lectores de pantalla y accesibilidad: conversión de texto a voz para usuarios con discapacidad visual en catalán, con la ventaja de ejecutarse en ONNX y poder desplegarse en dispositivos de recursos limitados.
- Generación de audiolibros y contenido narrado: síntesis de textos largos en catalán con selección de voz entre las disponibles del modelo multihablante.
- Aplicaciones educativas de aprendizaje de catalán: generación de pronunciaciones y material auditivo a partir de texto, útil en plataformas de aprendizaje de idiomas.
- Sistemas de megafonía y avisos automatizados: generación de mensajes hablados en catalán para transporte público, aeropuertos o comercios.
- Integración en pipelines de accesibilidad web: conversión de contenido textual de páginas web a audio para usuarios catalanohablantes, mediante la API de phoonnx en Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo ligero apto para CPU.
- GPU recomendadas: no disponible. No se documentan requisitos de GPU específicos.
- Compatibilidad con GPU de consumo: no disponible, aunque el formato ONNX y el tamaño reducido del repositorio indican que debería ejecutarse en CPU sin GPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OpenVoiceOS, y ejecución ONNX estándar.
- Latencia y throughput: no disponible.
- Dependencia externa: es necesario instalar espeak-ng (`apt install espeak-ng`) o el extra `phoonnx[espeak]`. Algunos fonemas de espyak difieren de espeak-ng y pueden producir pronunciaciones incorrectas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/matcha-ca-multispeaker_wavenext-espeak | Matcha-TTS | catalán | ONNX | GPL-3.0 | Hugging Face, phoonnx, OVOS |
| projecte-aina/matxa-tts-cat-multispeaker | Matcha-TTS | catalán | no disponible | GPL-3.0 | Hugging Face |
| Otros modelos Matcha-TTS de la colección Phoonnx | Matcha-TTS | varias lenguas | ONNX | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia GPL-3.0: impone restricciones copyleft para uso comercial y distribución; es necesario revisar las obligaciones de la licencia antes de integrarlo en productos propietarios.
- Dependencia de espeak-ng: la calidad de la síntesis depende del fonemizador; el uso de espyak en lugar de espeak-ng puede producir pronunciaciones incorrectas en algunas palabras.
- Cobertura lingüística limitada al catalán; no soporta otros idiomas.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de habla catalana puede reflejar sesgos de los corpus de entrenamiento (variedad dialectal, género, edad de los hablantes).
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos o prosodia incorrecta en textos fuera de dominio.
- No se especifican limitaciones de longitud de entrada; textos muy largos pueden requerir segmentación manual.
- El modelo empaquetado es una conversión ONNX del original; no se garantiza paridad exacta con el modelo upstream.
- Escasa adopción en el momento de la consulta (21 descargas, 0 likes), lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-ca-multispeaker_wavenext-espeak
- Modelo upstream: https://huggingface.co/projecte-aina/matxa-tts-cat-multispeaker
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
