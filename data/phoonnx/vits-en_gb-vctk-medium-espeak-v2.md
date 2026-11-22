# Phoonnx/vits-en_gb-vctk-medium-espeak-v2

## Resumen

`vits-en_gb-vctk-medium-espeak-v2` es una voz de síntesis de habla (text-to-speech) para el motor phoonnx, derivada del modelo Piper `en_GB-vctk-medium` de Rhasspy. Se trata de un modelo VITS (Variational Inference for Text-to-Speech) convertido a formato ONNX, con entrada de fonemas espeak-ng en alfabeto IPA y salida de audio a 22.050 Hz. Lo publica Phoonnx (TigreGotico Lda) como reemplazo de la versión anterior `vits-en_gb-vctk-medium-espeak`, ya que el modelo upstream fue reentrenado sobre la base Piper 1.5 (commit `e9c8a39444`).

El modelo resuelve la síntesis de voz en inglés británico con 109 hablantes distintos y una calidad media, empaquetado para inferencia ligera en CPU mediante ONNX Runtime. Su relevancia actual radica en que ofrece un pipeline TTS completo y autocontenido (grafo ONNX de 77 MB en fp32 y 22,1 MB en int8) con un RTF de 0,041 en fp32 sobre un Intel i9-11900H, lo que lo hace viable para asistentes de voz locales, sistemas OVOS y despliegues embebidos sin GPU.

La ficha cubre tanto la versión fp32 como las copias int8 generadas con cuantización dinámica de onnxruntime, e incluye los resultados de control de calidad publicados por el autor (WER 0,000 sobre tres frases de FLORES-200 devtest evaluadas con ASR nemo-parakeet-tdt-0.6b-v3 int8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper 1.5 o superior) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autorregresivo de contexto) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime 1.32.0, pesos QInt8) |
| Idiomas soportados | en-GB (ingles britanico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22.050 Hz |
| Numero de hablantes | 109 |
| Entrada de texto | fonemas espeak (IPA), fonemizador espeak-ng voz `en-gb-x-rp` |
| Puntuacion soportada | coma, punto, exclamacion, interrogacion, dos puntos, punto y coma |
| Tamano del grafo | 77,0 MB (fp32) / 22,1 MB (int8) |
| Pico de RSS | 246,5 MB (fp32) / 184,9 MB (int8) |
| RTF (mediana de 3, 4 hilos) | 0,041 (fp32) / 0,101 (int8) |
| Caracteres por segundo | 17,7 a 22,5 |
| Ajustes de inferencia | noise_scale 0,333; noise_w 0,5 |
| Libreria | phoonnx |
| Modelo base | rhasspy/piper-voices `en/en_GB/vctk/medium` (commit `e9c8a39444`) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional condicionado por alineamientos monotónicos (MAS) y un decodificador generativo adversarial. En esta variante Piper, el texto se convierte primero a fonemas espeak-ng (IPA) y el modelo produce directamente la forma de onda a 22.050 Hz. La voz concreta se entrena con 109 hablantes del corpus VCTK 0.92 (`mic1`, grabado a 48 kHz y remuestreado a 22.050 Hz), y se afina desde el modelo base `hifi_tts_92` (voz de Cori Samuel, lector 92 de Hi-Fi TTS) con MRD y SDP. Los datos exactos de entrenamiento no están registrados upstream.

El repositorio no contiene checkpoint de entrenamiento: solo publica los grafos ONNX convertidos desde los pesos de Piper. Las copias int8 se obtienen con `onnxruntime.quantization.quantize_dynamic` y pasan un control de calidad que exige audio finito y no silencioso, longitud entre 0,8 y 1,25 veces la de fp32, y un WER como máximo 0,05 superior al de fp32. El modelo requiere Piper 1.5 o superior y phoonnx 1.96.1a1 o posterior para preservar la puntuación de cláusula en la síntesis.

## Capacidades

- Síntesis de voz en inglés británico (en-GB) a partir de texto, con salida WAV a 22.050 Hz.
- Multihablante: 109 voces distintas seleccionables por identificador de hablante.
- Fonemización IPA mediante espeak-ng (voz `en-gb-x-rp`); también admite el port espyak con posibles divergencias fonéticas.
- Preservación de puntuación de cláusula (`,` `.` `!` `?` `:` `;`) en la síntesis con phoonnx 1.96.1a1 o superior.
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS seleccionando la voz `piper/en_GB-vctk-medium-v2` en `mycroft.conf`, y sintetiza respuestas en inglés británico en CPU con RTF de 0,041 (fp32), adecuado para dispositivos sin GPU.
- Lectura de textos largos en aplicaciones de accesibilidad: el modelo convierte documentos a audio WAV a 22.050 Hz con un throughput de 17,7 a 22,5 caracteres por segundo, suficiente para lectura por lotes en segundo plano.
- Generación de audio para contenidos educativos o audiolibros: los 109 hablantes permiten asignar voces distintas a personajes o secciones sin cambiar de modelo.
- Pruebas automatizadas de pipelines de voz: al ser un grafo ONNX pequeño (22,1 MB en int8) y con pico de RSS de 184,9 MB, se puede desplegar en contenedores ligeros para tests de integración de sistemas de diálogo.
- Síntesis embebida en sistemas de megafonía o domótica: la inferencia en CPU con ONNX Runtime y la licencia CC BY 4.0 permiten integrarlo en productos comerciales citando la autoría de Rhasspy.
- Prototipado de interfaces conversacionales en inglés británico: la combinación de phoonnx y espeak-ng permite generar muestras de voz rápidamente en notebooks o entornos de desarrollo sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados de control de calidad publicados por el autor (ASR `nemo-parakeet-tdt-0.6b-v3` int8, tres frases de FLORES-200 devtest, medidos en Intel Core i9-11900H a 2,50 GHz):

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,000 | 0,000 |
| Caracteres por segundo | 17,7 a 22,5 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,98 a 1,04 |
| Tamano del grafo | 77,0 MB | 22,1 MB |
| Pico de RSS | 246,5 MB | 184,9 MB |
| RTF (mediana de 3, 4 hilos) | 0,041 | 0,101 |

No se han publicado resultados de benchmarks comparativos (MOS, MCD, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para CPU con ONNX Runtime.
- GPU recomendadas: no se especifican; no requiere GPU. Cualquier GPU compatible con ONNX Runtime podría acelerar la inferencia, pero no hay datos publicados.
- Cabe en cualquier CPU consumer moderna; el pico de RSS es de 246,5 MB en fp32 y 184,9 MB en int8.
- Opciones de despliegue: phoonnx (biblioteca principal), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime directamente sobre los grafos.
- Dependencia externa: espeak-ng instalado en el sistema (o el port espyak vía `phoonnx[espeak]`).
- Latencia y throughput: RTF 0,041 en fp32 y 0,101 en int8 (mediana de 3 ejecuciones con 4 hilos en i9-11900H); 17,7 a 22,5 caracteres por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Hablantes | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_gb-vctk-medium-espeak-v2 | VITS (Piper) | en-GB | 109 | ONNX fp32/int8 | CC BY 4.0 | Version actual, base Piper 1.5 |
| Phoonnx/vits-en_gb-vctk-medium-espeak | VITS (Piper) | en-GB | no disponible | ONNX | CC BY 4.0 | Version anterior, pesos previos al reentrenamiento upstream |
| rhasspy/piper-voices en/en_GB/vctk/medium | VITS (Piper) | en-GB | 109 | pesos Piper originales | CC BY 4.0 | Modelo upstream del que deriva esta conversion |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés británico (en-GB); no es multilingüe.
- La calidad es "medium" según la nomenclatura de Piper; no está pensada para síntesis de alta fidelidad.
- Depende de espeak-ng para la fonemización; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- La puntuación de cláusula solo se preserva con phoonnx 1.96.1a1 o superior; versiones anteriores pueden ignorarla.
- Requiere Piper 1.5 o superior; los pesos no son compatibles con versiones anteriores.
- Los datos de entrenamiento no están registrados upstream, lo que limita la auditoría de sesgos y cobertura fonética.
- Riesgo de alucinación acústica o artefactos en entradas fuera de distribución (texto muy corto, caracteres no ingleses, siglas).
- Licencia CC BY 4.0: permite uso comercial con atribución a Rhasspy (entrenamiento) y a TigreGotico Lda (conversión ONNX).
- El QA publicado se basa en solo tres frases de FLORES-200 devtest; no es una evaluación exhaustiva de calidad.
- El repositorio no incluye checkpoint de entrenamiento, solo los grafos ONNX de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-vctk-medium-espeak-v2
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/en/en_GB/vctk/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Version anterior del modelo: https://huggingface.co/Phoonnx/vits-en_gb-vctk-medium-espeak
- TigreGotico: https://tigregotico.pt
- Dataset VCTK 0.92: https://datashare.ed.ac.uk/handle/10283/3443
- Licencia CC BY 4.0 del dataset: https://creativecommons.org/licenses/by/4.0/
