# Phoonnx/vits-vi_vn-vais1000

## Resumen

vits-vi_vn-vais1000 es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por phcatan9921 y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en vietnamita (vi-VN) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su publicacion responde a la necesidad de voces TTS ligeras y ejecutables en local dentro del ecosistema OVOS y phoonnx, sin depender de servicios en la nube.

El modelo se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo situa en la categoria de TTS compacto apto para dispositivos con recursos limitados. La arquitectura VITS combina un codificador de texto, un prior variacional y un decodificador generativo adversarial, lo que permite sintesis de alta calidad con un unico paso de inferencia. El modelo esta especializado exclusivamente en vietnamita y no soporta otros idiomas.

Su relevancia actual radica en que ofrece una voz vietnamita empaquetada para phoonnx, una libreria ONNX que facilita el despliegue en Python y en asistentes de voz OVOS, con licencia MIT y un tamano reducido que permite ejecucion en CPU sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; el autor no especifica variantes cuantizadas) |
| Idiomas soportados | vietnamita (vi-VN) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de sintesis de voz que integra un codificador de texto, un modulo de alineamiento monotono y un decodificador generativo entrenado con aprendizaje adversarial, junto con un prior variacional condicionado por el texto. Esta combinacion permite generar audio de forma directa a partir de fonemas, sin necesidad de un modelo acustico y un vocoder separados, lo que reduce la latencia y simplifica el despliegue.

El autor original es phcatan9921, cuyo repositorio upstream es phcatan9921/piper_tts. El modelo se ha entrenado presumiblemente sobre el corpus VAIS-1000 (segun el sufijo del nombre del modelo), aunque la model card no detalla el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La informacion sobre el proceso de entrenamiento es, por tanto, no disponible en la documentacion proporcionada.

## Capacidades

- Sintesis de voz en vietnamita (vi-VN) a partir de texto escrito.
- Conversion de texto a fonemas mediante espeak-ng en alfabeto IPA, con normalizacion previa del texto a traves de la libreria scriptconv.
- Generacion de audio en formato WAV mediante la API de phoonnx (`voice.synthesize_wav`).
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js, con entrada por espeak o Unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No dispone de capacidades multimodales de vision ni audio de entrada.
- No dispone de modo thinking ni capacidades especiales de razonamiento.

## Casos de uso

- Asistentes de voz en vietnamita sobre OVOS: el modelo se integra como plugin TTS en `mycroft.conf` y permite que un asistente domestico responda en vietnamita con sintesis local, sin enviar texto a servicios externos.
- Lectura de notificaciones y alertas en aplicaciones moviles: al ser un modelo ONNX de 0,1 GB, puede empaquetarse dentro de una app Android o iOS para leer notificaciones en vietnamita sin conexion.
- Accesibilidad para personas con discapacidad visual: conversion de texto de pantalla a voz en vietnamita en lectores de pantalla, ejecutandose en CPU y con baja latencia.
- Generacion de audiolibros y contenido narrado: sintesis por lotes de textos largos en vietnamita, dividiendo el texto en frases y concatenando los WAV resultantes.
- Sistemas de megafonia y anuncios automaticos: integracion en paneles de transporte o comercios que necesiten anuncios dinamicos en vietnamita con actualizacion frecuente de texto.
- Prototipado de interfaces conversacionales: uso en entornos de desarrollo para validar flujos de voz en vietnamita antes de contratar un servicio TTS comercial, gracias a la licencia MIT y al despliegue local.
- Demos web de TTS: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para demostraciones interactivas de sintesis en vietnamita sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del artefacto ONNX (0,1 GB), la inferencia cabe holgadamente en memoria de CPU y en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecucion en CPU mediante ONNX Runtime, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: si, practicamente cualquier GPU de consumo puede ejecutarlo, aunque no es necesario.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js para navegador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Dependencia externa: espeak-ng debe estar instalado en el sistema (por ejemplo, `apt install espeak-ng`) o bien usar el extra `phoonnx[espeak]`, que incluye el port espyak; el autor advierte que algunos fonemas de espyak difieren de espeak-ng y pueden producir pronunciaciones incorrectas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de TTS en vietnamita que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo solo soporta vietnamita (vi-VN); no es multilingue.
- La calidad de pronunciacion depende de la fidelidad de los fonemas generados por espeak-ng; el uso del port espyak puede producir errores en algunas palabras, segun advierte el autor.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un corpus concreto (presumiblemente VAIS-1000), puede reflejar las caracteristicas demograficas y dialectales de dicho corpus.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la sintesis puede producir prosodia incorrecta o pronunciaciones erroneas en palabras fuera del vocabulario o con grafia ambigua.
- No se dispone de informacion sobre el proceso de entrenamiento, lo que dificulta evaluar la robustez ante dominios especializados (medico, legal, tecnico).
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia del repositorio upstream (phcatan9921/piper_tts) y del corpus de entrenamiento original.
- El modelo tiene solo 30 descargas y 0 likes en el momento de la ficha, lo que indica una validacion comunitaria muy limitada; no se recomienda para produccion critica sin evaluacion propia.
- La fecha de creacion indicada (2026-11-14) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio; conviene verificar la vigencia del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-vi_vn-vais1000
- Repositorio upstream: https://huggingface.co/phcatan9921/piper_tts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
