# Phoonnx/f5tts-multi-sema_afro-unicode

## Resumen

`f5tts-multi-sema_afro-unicode` es una voz de síntesis de voz (text-to-speech) del modelo F5-TTS, convertida a formato ONNX para su uso con la librería phoonnx. La publica Phoonnx (TigreGotico Lda) a partir del modelo original `travis-moore/sema-tts-afro`, entrenado por travis-moore (Sema). El modelo base de la cadena es `mrfakename/OpenF5-TTS`. No es un modelo de lenguaje: es un modelo acústico de TTS que genera audio a 24 kHz a partir de texto, con una única voz y capacidad de clonación de hablante mediante un clip de referencia.

El interés principal está en su cobertura multilingüe: cubre 23 idiomas, con un peso claro hacia lenguas africanas (afrikáans, amárico, fula, hausa, igbo, kamba, criollo caboverdiano, luganda, lingala, luo, chichewa, sotho septentrional, oromo, shona, somalí, suajili, twi, umbundu, wolof, xhosa, yoruba y zulú) además de inglés. Es una de las pocas voces TTS empaquetadas en ONNX con esta cobertura lingüística, lo que la hace relevante para aplicaciones de accesibilidad y asistentes de voz en mercados africanos.

La conversión a ONNX incluye variantes en fp32 (1455,8 MB) e int8 (463,3 MB), lo que permite despliegue en CPU sin GPU. La licencia Apache 2.0 facilita el uso comercial. El modelo no emplea fonemizador: lee directamente los puntos de código Unicode del texto, descompuestos en NFD por phoonnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (modelo acústico TTS, no transformer de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa texto por cláusulas; sin ventana declarada) |
| Tipos de cuantizacion | fp32, int8 (quantize_dynamic con QInt8, onnxruntime 1.32.0) |
| Idiomas soportados | af, am, en, ff, ha, ig, kam, kea, lg, ln, luo, ny, nso, om, sn, so, sw, tw, umb, wo, xh, yo, zu (23) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`<graph>.onnx` fp32 y `<graph>_int8.onnx` int8) |
| Frecuencia de muestreo | 24000 Hz |
| Hablantes | 1 (clonación mediante clip de referencia) |
| Fonemizador | Ninguno; lee puntos de código Unicode (NFD) |
| Puntuación entrenada | `, . ! ? : ;` |
| Tamaño del grafo | 1455,8 MB (fp32) / 463,3 MB (int8) |
| Pico de RSS | 3200,7 MB (fp32) / 1204,2 MB (int8) |
| Modelo base | mrfakename/OpenF5-TTS → travis-moore/sema-tts-afro |
| Librería | phoonnx (pip install --pre phoonnx) |

## Arquitectura y entrenamiento

Se trata de un modelo F5-TTS, una familia de TTS de flujo matching basada en difusión que sintetiza audio a partir de texto y de una referencia de hablante. La conversión a ONNX no altera los pesos; las copias int8 se generan con `onnxruntime.quantization.quantize_dynamic` sobre los pesos QInt8. El modelo no usa fonemizador: phoonnx descompone el texto en NFD y el modelo consume los puntos de código Unicode directamente, lo que simplifica el pipeline pero implica que letras precompuestas (por ejemplo en yoruba) llegan como letra base más marca combinante.

Los datos de entrenamiento no están documentados en la model card upstream (`travis-moore/sema-tts-afro`). No se declara número de horas de audio, composición del corpus ni si hubo etapas de ajuste fino con RLHF o DPO (no aplicable en TTS). El control de calidad se realizó con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest, con clip de referencia LJ001-0009 (dominio público), y solo cubre inglés.

## Capacidades

- Síntesis de voz a 24 kHz a partir de texto en 23 idiomas, con foco en lenguas africanas.
- Clonación de hablante zero-shot mediante un clip de referencia corto y su transcripción (`speaker_reference` y `speaker_reference_text`).
- Manejo de puntuación de cláusula (`, . ! ? : ;`) entrenada explícitamente.
- Procesamiento directo de Unicode (NFD), sin fonemizador externo.
- Inferencia en CPU: las variantes int8 caben en ~1,2 GB de RSS.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz en lenguas africanas: el modelo cubre suajili, hausa, yoruba, zulú, amárico y otras 18 lenguas, lo que permite construir asistentes locales sin depender de servicios en la nube con cobertura limitada.
- Accesibilidad y lectura de textos: convertir artículos, documentos o interfaces en audio a 24 kHz para usuarios con discapacidad visual en idiomas minorizados donde escasean voces TTS de calidad.
- Integración en asistentes domésticos OVOS/Mycroft: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `f5tts/sema-afro` en `mycroft.conf` sin infraestructura adicional.
- Clonación de voz para locuciones personalizadas: dado un clip de referencia y su transcripción, se puede generar audio con la voz del hablante para doblaje, audiolibros o contenido educativo.
- Despliegue en dispositivos de borde: la variante int8 (463,3 MB de grafo, 1,2 GB de RSS) es viable en CPU de escritorio o servidores modestos, útil para kioscos, señalética hablada o terminales de atención pública.
- Generación de audio para pruebas y prototipado: al ser Apache 2.0 y ONNX, se puede integrar en pipelines de CI para validar sistemas de ASR o de diálogo con audio sintético en múltiples idiomas.
- Localización de contenidos: generar pistas de voz en varios idiomas africanos a partir de un mismo guion para formación corporativa o campañas de salud pública.

## Benchmarks y rendimiento

Resultados de QA publicados en la model card (ASR `nemo-parakeet-tdt-0.6b-v3` int8, 3 frases FLORES-200 devtest, medición en AMD Ryzen 5 7600, 4 hilos):

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,038 | 0,000 |
| Caracteres por segundo | 13,8 | no disponible |
| Longitud int8/fp32 | no aplica | 1,00 |
| Tamaño del grafo | 1455,8 MB | 463,3 MB |
| Pico de RSS | 3200,7 MB | 1204,2 MB |
| RTF (mediana de 3) | 29,445 | 22,578 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo TTS. El RTF superior a 1 indica síntesis más lenta que tiempo real en la CPU medida.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU con onnxruntime.
- RAM estimada: ~3,2 GB de pico en fp32 y ~1,2 GB en int8.
- GPU: no se documenta aceleración por GPU; la conversión es ONNX CPU-first. No hay datos de rendimiento en A100, H100 o RTX 4090.
- Cabe en cualquier equipo de consumo con al menos 4 GB de RAM libres (int8) o 4 GB (fp32).
- Despliegue: phoonnx (`pip install --pre phoonnx`), plugin OVOS `ovos-tts-plugin-phoonnx`; onnxruntime como runtime.
- Latencia y throughput: RTF 22,578 (int8) y 29,445 (fp32) en Ryzen 5 7600 con 4 hilos; es decir, entre 22 y 29 veces más lento que tiempo real en ese hardware. No hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| f5tts-multi-sema_afro-unicode | F5-TTS ONNX | 23 (foco africano) | Apache 2.0 | ONNX fp32/int8 | Clonación por referencia; CPU |
| travis-moore/sema-tts-afro | F5-TTS (upstream) | 23 | Apache 2.0 | pesos originales | Mismo modelo sin conversión ONNX |
| mrfakename/OpenF5-TTS | F5-TTS base | mayoritariamente inglés | no disponible en esta ficha | safetensors | Modelo base de la cadena |
| Otros TTS multilingües (p. ej. Coqui XTTS, MMS) | TTS | variable | variable | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de comparativas de rendimiento (WER, MOS o RTF) frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- El QA solo cubre inglés; no hay validación publicada del WER en las lenguas africanas soportadas.
- La descomposición NFD puede degradar la pronunciación de letras precompuestas (por ejemplo, caracteres con diacríticos en yoruba) al llegar al modelo como letra base más marca combinante.
- El RTF es alto (22-29 en la CPU medida): no es apto para síntesis en tiempo real sin hardware más potente o paralelización.
- Una sola voz; la variación requiere clonación con clip de referencia, cuya calidad condiciona el resultado.
- Los datos de entrenamiento no están documentados, lo que impide auditar sesgos de acento, género o calidad por idioma.
- Riesgo de alucinación acústica y artefactos en textos largos o fuera de distribución; se recomienda segmentar por cláusulas.
- Licencia Apache 2.0 permite uso comercial, pero exige atribución a travis-moore (Sema) y a TigreGotico Lda por la conversión.
- Dependencia de la librería phoonnx en versión preliminar (`--pre`), lo que implica API potencialmente inestable.
- No soporta SSML avanzado, control de prosodia fino ni marcas de hablante múltiple.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/f5tts-multi-sema_afro-unicode
- Modelo upstream: https://huggingface.co/travis-moore/sema-tts-afro
- Modelo base de la cadena: https://huggingface.co/mrfakename/OpenF5-TTS
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
