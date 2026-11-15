# Phoonnx/vits-de_de-glados_turret-medium

## Resumen

vits-de_de-glados_turret-medium es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por systemofapwne y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo genera audio a partir de texto en alemán (de-DE) y emplea fonemas espeak en alfabeto IPA como entrada, lo que lo integra en el ecosistema de voces Piper y en el asistente de voz OVOS.

Se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que corresponde a una variante "medium" de VITS orientada a un equilibrio entre calidad y coste computacional. Su relevancia radica en que ofrece una voz alemana lista para producción dentro de un pipeline TTS moderno (phoonnx + scriptconv), con licencia MIT y sin dependencia de GPUs de gama alta.

La información disponible es limitada: no se publican detalles sobre el dataset de entrenamiento, el número de parámetros ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables de la model card y los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, inferencia ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; sin ventana de contexto definida) |
| Tipos de cuantización | no disponible (pesos ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | alemán (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento, con un generador HiFi-GAN para la waveform. El modelo se ejecuta en inferencia mediante ONNX, lo que permite despliegue sin framework de deep learning pesado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino. La model card indica únicamente que el modelo procede del repositorio upstream `systemofapwne/piper-de-glados/de/de_DE/glados-turret/medium` y que la entrada de texto se convierte a fonemas espeak en alfabeto IPA mediante `scriptconv`.

## Capacidades

- Síntesis de voz a partir de texto en alemán (de-DE), con salida en formato WAV.
- Fonemización mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Integración con la librería phoonnx para Python y con el plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Ejecución en navegador a través de phoonnx.js (con entrada espeak o unicode).
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa ni multimodalidad.

## Casos de uso

- Asistentes de voz en alemán sobre OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, lo que permite dotar de voz a un asistente doméstico sin infraestructura GPU dedicada.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: la inferencia ONNX ligera (0,1 GB) permite generar audio en tiempo real en equipos de gama media.
- Síntesis de voz en aplicaciones web: phoonnx.js ejecuta la voz en el navegador con entrada espeak o unicode, útil para interfaces accesibles sin backend de TTS.
- Generación de audiolibros o contenido narrado en alemán: el pipeline phoonnx + scriptconv normaliza el texto y produce WAV por frase, adecuado para procesamiento por lotes.
- Prototipado de interfaces conversacionales en alemán: la licencia MIT y el formato ONNX facilitan la integración en demos y pruebas de concepto sin coste de licencia.
- Sistemas de accesibilidad para personas con discapacidad visual: la síntesis local evita el envío de texto a servicios en la nube y reduce la latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere un modelo ligero que puede ejecutarse en CPU.
- GPU recomendadas: no disponibles; por el tamaño del artefacto, no se requiere GPU dedicada.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS) y phoonnx.js (navegador). Requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo soporta alemán (de-DE); no se documentan otros idiomas.
- La fonemización depende de espeak-ng; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la model card.
- No se han publicado datos sobre sesgos, tasa de alucinación (en TTS, artefactos o pronunciaciones incorrectas) ni evaluación de calidad subjetiva (MOS).
- La licencia MIT permite uso comercial, pero la model card remite a los términos del release upstream para cualquier condición adicional.
- No se documentan limitaciones de longitud de texto; el uso típico es por frase.
- El modelo tiene 32 descargas y 0 likes en Hugging Face, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-glados_turret-medium
- Repositorio upstream: https://huggingface.co/systemofapwne/piper-de-glados/tree/main/de/de_DE/glados-turret/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
