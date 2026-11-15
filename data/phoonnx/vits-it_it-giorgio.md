# Phoonnx/vits-it_it-giorgio

## Resumen

vits-it_it-giorgio es un modelo de síntesis de voz (text-to-speech) de tipo VITS para italiano (it-IT), empaquetado por Phoonnx a partir del modelo original de kirys79 alojado en `kirys79/piper_italiano/Giorgio`. El modelo no se entrena desde cero en este repositorio: Phoonnx toma los pesos originales, los exporta a ONNX y los integra en su librería de inferencia TTS, de modo que la voz pueda ejecutarse de forma portable en Python, en el asistente OVOS y en el navegador mediante phoonnx.js.

La relevancia de esta ficha es práctica: se trata de una voz italiana lista para producción en entornos con recursos limitados, con un repositorio de apenas 0,1 GB y una licencia permisiva (CC BY 4.0) que permite uso comercial con atribución. La entrada de texto no es texto plano directo, sino fonemas espeak en alfabeto IPA, lo que condiciona el pipeline de despliegue (requiere espeak-ng o el port espyak).

El modelo está pensado para integrarse en asistentes de voz, lectores de pantalla, sistemas de accesibilidad y automatizaciones de audio en italiano. Su valor no está en benchmarks de calidad de voz —no publicados— sino en la facilidad de integración y en el ecosistema de herramientas que lo acompañan (phoonnx, scriptconv, phoonnx.js).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, generativa adversarial con decoder condicional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Autor original | kirys79 |
| Empaquetador | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado de forma conjunta. El resultado es un modelo que genera waveform directamente a partir de fonemas, sin necesidad de un vocoder separado ni de un modelo acústico intermedio. Esta ficha no dispone de los detalles de entrenamiento del modelo original: no se especifican horas de audio, composición del dataset, ni si hubo ajuste fino posterior.

El trabajo de Phoonnx en este repositorio es de empaquetado e interoperabilidad: exportación a ONNX, integración en la librería phoonnx, definición del front-end fonémico mediante scriptconv (`EspeakPhonemizer` del módulo `scriptconv.phonemizers.mul`) y publicación de la voz bajo el identificador `piper_community/kirys79/it-IT_Giorgio`. No se documenta ninguna innovación técnica adicional más allá del pipeline de conversión y del soporte multi-entorno.

## Capacidades

- Síntesis de voz en italiano (it-IT) a partir de texto normalizado y convertido a fonemas espeak en IPA.
- Generación de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)` de phoonnx.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable vía `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js, con demo pública en tigregotico.pt/demo.
- Normalización y conversión de texto de entrada mediante scriptconv.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en italiano: integración directa como módulo TTS de OVOS mediante `ovos-tts-plugin-phoonnx`, seleccionando la voz `piper_community/kirys79/it-IT_Giorgio` en la configuración del asistente.
- Lectura de textos y accesibilidad: conversión de documentos o contenido web a audio en italiano para lectores de pantalla y sistemas de apoyo a personas con discapacidad visual, gracias a la API `synthesize_wav` sobre flujos WAV.
- Síntesis en el navegador: uso de phoonnx.js para generar voz italiana del lado del cliente sin enviar texto a servidores externos, útil en aplicaciones web con requisitos de privacidad.
- Automatización de audio para contenidos: generación de locuciones para vídeos, pódcast o avisos en italiano dentro de pipelines que ya procesan texto, con un repositorio de solo 0,1 GB que simplifica el despliegue.
- Sistemas embebidos y edge: al ser un modelo ONNX compacto, puede desplegarse en dispositivos con recursos limitados donde un TTS basado en nube no es viable por latencia o conectividad.
- Prototipado rápido de interfaces conversacionales en italiano: la instalación vía `pip install --pre phoonnx` y el gestor `TTSModelManager` permiten tener una voz funcional en pocas líneas de código.
- Pruebas de regresión de pipelines TTS: al estar empaquetado de forma reproducible, sirve como voz de referencia en tests automatizados de sistemas que consumen audio sintetizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; por el tamaño del repositorio (0,1 GB) se espera un consumo muy reducido, pero no se confirma una cifra.
- GPU recomendadas: no disponible. El modelo se distribuye en ONNX y está pensado para ejecución en CPU y entornos ligeros.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el formato ONNX y el tamaño reducido sugieren viabilidad en hardware de consumo, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin OVOS (`ovos-tts-plugin-phoonnx`), phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Dependencia externa: espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-it_it-giorgio (este) | VITS | it-IT | ONNX | CC BY 4.0 | Hugging Face, phoonnx, OVOS, navegador |
| kirys79/piper_italiano/Giorgio (upstream) | VITS | it-IT | Piper | CC BY 4.0 (declarada en upstream) | Hugging Face |
| Otras voces VITS de la colección Phoonnx | VITS | varios | ONNX | según modelo | Colección VITS de Phoonnx |

No se dispone de datos de benchmarks ni de especificaciones de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La entrada debe ser fonemas espeak en IPA; el texto plano requiere pasar por scriptconv y por espeak-ng, lo que añade dependencias al despliegue.
- Con el port espyak algunos fonemas difieren de espeak-ng, lo que puede provocar pronunciaciones incorrectas de ciertas palabras, según advierte el autor.
- No hay datos publicados sobre sesgos, calidad de voz, robustez ante ruido o dominios fuera del corpus de entrenamiento original.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí existe riesgo de prosodia o pronunciación incorrecta en textos no cubiertos por el corpus.
- Cobertura limitada a italiano (it-IT); no se documentan otros idiomas ni variantes regionales.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución; conviene revisar los términos de la licencia del modelo upstream para confirmar compatibilidad.
- El proyecto phoonnx se instala con `pip install --pre`, lo que indica estado de preproducción de la librería; validar estabilidad antes de usar en producción.
- El número de descargas (22) y de likes (0) es muy bajo, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-giorgio
- Modelo upstream: https://huggingface.co/kirys79/piper_italiano/tree/main/Giorgio
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
