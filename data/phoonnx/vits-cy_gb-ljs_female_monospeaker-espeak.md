# Phoonnx/vits-cy_gb-ljs_female_monospeaker-espeak

## Resumen

El modelo `vits-cy_gb-ljs_female_monospeaker-espeak` es un sistema de síntesis de voz (text-to-speech) basado en la arquitectura VITS, publicado por el usuario Phoonnx. No se trata de un modelo entrenado desde cero por este autor, sino de un empaquetado en formato ONNX del modelo original `ylacombe/vits_ljs_welsh_female_monospeaker`, desarrollado por ylacombe. Su función concreta es convertir texto en galés (variante `cy-GB`) en audio con una voz femenina monohablante, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA.

La relevancia de este modelo reside en su formato de distribución: está adaptado para la librería phoonnx, una herramienta de inferencia TTS en Python y ONNX que integra el modelo en el ecosistema OVOS (Open Voice OS). Esto permite desplegar síntesis de voz en galés en asistentes de voz locales, aplicaciones de accesibilidad o sistemas embebidos sin depender de servicios en la nube. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia ligera.

Al estar empaquetado en ONNX y contar con licencia MIT, el modelo es adecuado para integraciones comerciales y para su ejecución en hardware modesto. No obstante, su alcance es limitado: cubre un único idioma, una única voz y no incorpora capacidades multimodales ni de razonamiento. Es una pieza especializada dentro de un pipeline TTS más amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | galés (`cy`, `cy-GB`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Voz | femenina, monohablante |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujo normalizador y un discriminador adversarial entrenado de forma conjunta. El modelo original fue entrenado por ylacombe sobre el conjunto de datos LJSpeech adaptado al galés (de ahí el sufijo `ljs_welsh`), con una única voz femenina. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, algo por otra parte poco habitual en modelos TTS.

La innovación principal de este empaquetado no está en el entrenamiento, sino en la conversión a ONNX realizada por BricksDisplay y en su integración con la librería phoonnx. El front-end de texto utiliza `scriptconv` con el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, que requiere espeak-ng instalado en el sistema. El autor advierte que la variante espyak (un port de espeak-ng) puede producir fonemas distintos y provocar errores de pronunciación en algunas palabras.

## Capacidades

- Síntesis de voz a partir de texto en galés (`cy-GB`) con voz femenina monohablante.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Conversión de texto a fonemas IPA mediante espeak-ng (o espyak como alternativa).
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en Python mediante `TTSModelManager` y en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al galés; no cubre otros idiomas.

## Casos de uso

- Asistentes de voz locales en galés: el modelo puede integrarse en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz en `mycroft.conf`, para responder oralmente a consultas de usuarios en galés sin conexión a internet.
- Accesibilidad para lectores de pantalla: permite convertir texto en galés a audio en aplicaciones de escritorio o web, ejecutándose en local gracias a su formato ONNX y su reducido tamaño (~0,1 GB).
- Aplicaciones educativas de aprendizaje de galés: el modelo puede generar pronunciaciones de frases y vocabulario para herramientas de aprendizaje de idiomas, con la salvedad de que la calidad depende de la fonemización correcta por espeak-ng.
- Síntesis de voz en navegador: mediante phoonnx.js, el modelo puede ejecutarse en el cliente para generar audio en galés sin enviar texto a un servidor, útil en aplicaciones web de privacidad estricta.
- Generación de audiolibros o contenido pregrabado en galés: el modelo permite convertir textos largos en audio de forma automatizada, aunque requiere segmentar el texto y gestionar la prosodia manualmente.
- Sistemas embebidos y dispositivos de bajo consumo: al ser un modelo compacto en ONNX, puede desplegarse en Raspberry Pi u otros dispositivos con recursos limitados para anuncios o interfaces habladas en galés.
- Pruebas de integración en pipelines TTS: sirve como voz de referencia para validar el funcionamiento de phoonnx y scriptconv en entornos de desarrollo antes de desplegar otras voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (~0,1 GB) se estima un consumo de memoria muy bajo, inferior a 1 GB en la mayoría de configuraciones.
- GPU recomendadas: no se especifican; al ser un modelo ONNX compacto, puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, aunque no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / entrada |
|---|---|---|---|---|---|
| vits-cy_gb-ljs_female_monospeaker-espeak (este modelo) | VITS | Galés (`cy-GB`) | MIT | ONNX | Fonemas espeak IPA |
| ylacombe/vits_ljs_welsh_female_monospeaker | VITS | Galés | no disponible en la informacion | no disponible en la informacion | Texto/fonemas (modelo upstream) |
| BricksDisplay/vits-eng-welsh-female | VITS | Inglés-galés | no disponible en la informacion | ONNX | no disponible en la informacion |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a arquitectura, idioma, licencia y formato.

## Limitaciones y advertencias

- Modelo monohablante y monolingüe: solo genera voz femenina en galés; no cubre otros idiomas ni voces.
- Dependencia de espeak-ng: la calidad de pronunciación depende de la fonemización externa; el uso de espyak en lugar de espeak-ng puede producir errores en algunas palabras, según advierte el autor.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos ante texto mal normalizado o fuera del dominio de entrenamiento.
- Sin datos de benchmarks: no hay métricas publicadas de calidad (MOS, inteligibilidad) en la información disponible.
- Licencia MIT: permite uso comercial, pero el autor remite a los términos del release upstream, cuyas condiciones no se detallan en la información proporcionada.
- Sin soporte documentado para cuantización ni para despliegue en frameworks distintos de phoonnx/ONNX.
- Repositorio con muy pocas descargas (18) y sin likes, lo que sugiere escasa validación comunitaria.
- No apto para tareas de razonamiento, generación de texto, código o visión; su alcance se limita estrictamente a la síntesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-cy_gb-ljs_female_monospeaker-espeak
- Modelo upstream: https://huggingface.co/ylacombe/vits_ljs_welsh_female_monospeaker
- Conversión ONNX: https://huggingface.co/BricksDisplay/vits-eng-welsh-female/tree/main/onnx
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
