# Phoonnx/vits-en_gb-semaine-medium-espeak

## Resumen

`vits-en_gb-semaine-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y reempaquetado por Phoonnx para su uso con la librería ONNX `phoonnx`. El modelo genera audio a partir de texto en inglés británico (`en-GB`) y utiliza fonemas espeak en alfabeto IPA como entrada, lo que lo hace dependiente de un front-end de fonemización externo.

Se trata de una voz de tamano medio ("medium") del catálogo Piper, distribuida en formato ONNX con un repositorio de apenas 0,1 GB, lo que la hace adecuada para despliegues ligeros en CPU y entornos embebidos. Su relevancia radica en que permite integrar TTS de calidad razonable en asistentes de voz open source como OVOS sin depender de infraestructura GPU.

El modelo no es un modelo de lenguaje generativo ni un sistema multimodal: es un sintetizador acústico puro que transforma fonemas en forma de onda. No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-GB (inglés británico) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento, junto con un decoder de forma de onda (habitualmente HiFi-GAN). El resultado es un modelo que genera audio de forma directa desde fonemas sin necesidad de un vocoder separado en inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo procede del catálogo `rhasspy/piper-voices`, concretamente de la voz `en_GB/semaine/medium`, y ha sido reempaquetado por Phoonnx para su consumo mediante ONNX Runtime. La innovación destacable en este empaquetado es la integración con el front-end `scriptconv`, que normaliza el texto y lo convierte a fonemas espeak antes de la inferencia.

## Capacidades

- Síntesis de voz a partir de texto en inglés británico (`en-GB`).
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, lo que permite control fino de la pronunciación si se proporcionan fonemas directamente.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante `phoonnx.js` (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No dispone de modo "thinking", visión ni audio de entrada.
- Monolingüe: únicamente inglés británico.

## Casos de uso

- Asistentes de voz locales: integración en OVOS mediante `ovos-tts-plugin-phoonnx` para dar respuesta hablada en inglés británico sin conexión a servicios en la nube, gracias al bajo tamano del modelo (0,1 GB) y su ejecución en CPU.
- Lectura de notificaciones y alertas: síntesis de mensajes cortos en sistemas embebidos o domótica donde se requiere una voz clara y ligera sin GPU.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de asistencia a personas con discapacidad visual en entornos de habla inglesa británica.
- Generación de audio para prototipos y demos: creación rápida de clips de voz para pruebas de UX, vídeos explicativos o maquetas de aplicaciones conversacionales.
- Síntesis en el navegador: uso de `phoonnx.js` para generar voz en cliente sin backend, útil en aplicaciones web educativas o de aprendizaje de idiomas.
- Pruebas de pronunciación y fonética: al aceptar fonemas IPA directamente, permite experimentar con pronunciaciones concretas del inglés británico en herramientas de investigación lingüística.
- Automatización de pipelines de audio: generación por lotes de locuciones para audiolibros cortos, podcasts sintéticos o contenido de formación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es de 0,1 GB en ONNX y está pensado para ejecución en CPU.
- GPU recomendadas: no se especifican; al ser un modelo VITS de tamano medio, no requiere GPU dedicada.
- Cabe en cualquier GPU consumer y en CPU de gama baja; el despliegue típico es en CPU.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-en_gb-semaine-medium-espeak (este) | VITS | en-GB | 0,1 GB | MIT | ONNX | Empaquetado para phoonnx, entrada espeak IPA |
| Otras voces Piper `en_GB` (p. ej. alan, northern_english_male) | VITS | en-GB | ~0,1 GB | MIT (segun Piper) | ONNX | Mismo origen Rhasspy, distinto hablante/estilo |
| Coqui TTS (modelos VITS) | VITS | multi | variable | MPL-2.0 / otras | PyTorch | Ecosistema más amplio, no ONNX nativo |
| Kokoro TTS | StyleTTS2 / arquitectura propia | multi | ~0,3 GB | Apache-2.0 | ONNX / PyTorch | Mayor calidad reportada, mayor tamano |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo inglés británico; no soporta otros idiomas ni cambio de voz.
- Dependencia de espeak-ng: sin el binario `espeak-ng` instalado, la fonemización falla o requiere el extra `phoonnx[espeak]`, y los fonemas de espyak pueden diferir de los de espeak-ng, provocando pronunciaciones incorrectas en algunas palabras.
- Calidad "medium": al ser una voz de tamano medio del catálogo Piper, la naturalidad y prosodia son inferiores a modelos más grandes; puede presentar artefactos en frases largas o complejas.
- Riesgo de alucinación acústica: como todo TTS, puede generar pronunciaciones erróneas en palabras fuera del vocabulario, siglas o nombres propios no cubiertos por la fonemización.
- Sin datos de sesgos: no se documenta información sobre sesgos de hablante, acento o género en la model card.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la licencia upstream en `rhasspy/piper-voices` para confirmar compatibilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy reciente y poca validación comunitaria.
- No apto para tareas de NLP: no genera texto, no razona, no soporta tool calling ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-semaine-medium-espeak
- Upstream Piper voices (en_GB/semaine/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/semaine/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo phoonnx.js: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
