# Phoonnx/vits-ne_np-google-medium-espeak

## Resumen

`vits-ne_np-google-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en nepalí (locale `ne-NP`) en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. No es un modelo de lenguaje generativo: es un sintetizador acústico compacto orientado a despliegue local y de baja latencia.

El modelo resuelve el problema de dotar de voz a asistentes y aplicaciones en nepalí sin depender de servicios en la nube. Su formato ONNX y su tamaño reducido (repo de 0,1 GB) lo hacen adecuado para ejecución en CPU y dispositivos con recursos limitados, así como para integración en el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.

Es relevante para desarrolladores que necesitan TTS multilingüe de código abierto con licencia permisiva (MIT) y sin dependencias propietarias. La información pública disponible es escasa: no se detallan parámetros, contexto ni datos de entrenamiento, y el modelo no registra descargas ni interacciones en Hugging Face en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | nepalí (`ne-NP`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Autor original | Rhasspy (upstream: `rhasspy/piper-voices`) |
| Empaquetado | Phoonnx |
| Libreria | phoonnx |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador acústico basado en flujos normalizadores y un discriminador adversarial en entrenamiento, con decodificación de waveform integrada mediante HiFi-GAN. Esto permite generar audio de forma directa desde fonemas sin un vocoder separado en inferencia, lo que reduce la latencia y simplifica el despliegue.

El modelo procede de la colección Piper de Rhasspy, concretamente de la variante `ne/ne_NP/google/medium`, que corresponde a una voz de tamano "medium" entrenada sobre datos de Google. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. La innovación relevante en este empaquetado es la conversión a ONNX para inferencia portable y la integración con la cadena de normalización y fonemización de `scriptconv`, que usa espeak-ng para producir la entrada IPA.

## Capacidades

- Síntesis de voz a partir de texto en nepalí (`ne-NP`), con salida en formato WAV.
- Fonemización mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Ejecución en ONNX, apta para CPU y entornos sin GPU.
- Integración con OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`.
- Uso en navegador a través de `phoonnx.js` (con entrada espeak o unicode).
- Normalización y conversión de texto delegadas a `scriptconv`.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en nepalí: integración como motor TTS en OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz `piper/ne_NP-google-medium` en `mycroft.conf` para respuestas habladas locales sin nube.
- Lectura de contenido accesible: conversión de artículos, notificaciones o interfaces de aplicaciones a audio en nepalí para usuarios con discapacidad visual o preferencia por consumo auditivo.
- Sistemas de anuncios y megafonía: generación de avisos pregrabados o dinámicos en nepalí para transporte, comercio o servicios públicos, aprovechando la inferencia ONNX en CPU.
- Aplicaciones educativas de idiomas: producción de audio de referencia en nepalí para materiales de aprendizaje, con control local sobre la generación y sin coste por petición.
- Kioscos y terminales interactivas: respuestas habladas en entornos con conectividad limitada, donde el tamano reducido del modelo (0,1 GB) y la ejecución offline son determinantes.
- Prototipado de interfaces de voz: uso de la API Python de `phoonnx` (`TTSModelManager`, `voice.synthesize_wav`) para validar flujos de TTS antes de escalar a otros idiomas o voces de la colección VITS.
- Demos web: síntesis en el navegador con `phoonnx.js` para aplicaciones que requieran TTS en nepalí sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamano del repo (0,1 GB) se espera un consumo de memoria muy bajo, compatible con CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para inferencia ONNX, incluyendo CPU.
- Compatibilidad con GPU de consumo: probable en cualquier GPU moderna por el reducido tamano, aunque no hay datos oficiales.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vits-ne_np-google-medium-espeak | VITS | ne-NP | ONNX | MIT | Empaquetado Phoonnx; entrada espeak IPA |
| Otras voces Piper `ne_NP` | VITS | ne-NP | ONNX | MIT (upstream) | Variantes de la colección `rhasspy/piper-voices`; specs no detalladas aquí |
| Otras voces de la colección VITS de Phoonnx | VITS | varios | ONNX | MIT | Mismo pipeline, distinto idioma; comparación directa no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Cobertura monolingüe: solo nepalí (`ne-NP`); no sintetiza otros idiomas.
- Dependencia de espeak-ng: sin él, la fonemización falla o requiere el port espyak, cuyos fonemas pueden diferir y producir pronunciaciones incorrectas en algunas palabras.
- Calidad limitada por la variante "medium" del upstream; no hay métricas objetivas (MOS, WER) publicadas.
- Sesgos: no documentados; al derivar de datos de Google, pueden existir sesgos de pronunciación o cobertura léxica no especificados.
- Riesgo de alucinación acústica: como todo TTS, puede generar prosodia o pronunciaciones erróneas en texto fuera de dominio, siglas o números.
- Licencia MIT permisiva para uso comercial, pero conviene verificar la licencia del upstream (`rhasspy/piper-voices`) y de los datos originales.
- Sin descargas ni validación comunitaria registrada en Hugging Face: madurez y soporte inciertos.
- No apto para tareas de razonamiento, código o agentes; su alcance es exclusivamente la síntesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ne_np-google-medium-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/ne/ne_NP/google/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo de phoonnx.js: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
