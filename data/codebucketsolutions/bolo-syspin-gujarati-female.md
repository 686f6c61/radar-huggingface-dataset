# codebucketsolutions/bolo-syspin-gujarati-female

## Resumen

`bolo-syspin-gujarati-female` es un modelo de síntesis de voz (text-to-speech) para gujarati (`gu`) publicado por `codebucketsolutions` como conversión de formato del checkpoint original `SYSPIN/vits_Gujarati_Female` del proyecto SYSPIN (SPIRE Lab, Indian Institute of Science, Bengaluru). No se trata de un modelo nuevo ni reentrenado: es el mismo conjunto de pesos VITS convertido de Coqui a ONNX mediante `tools/voices/export_syspin.py` del proyecto bolo, para su uso con el servidor de voz sherpa-onnx, que funciona sin PyTorch.

El modelo resuelve un problema de despliegue: permite servir una voz femenina en gujarati en entornos ligeros (ONNX Runtime) sin arrastrar la pila de PyTorch/Coqui, integrándose en el servidor bolo mediante `bolo pull syspin-gu-female`. Es relevante para desarrolladores que necesitan TTS en un idioma de bajos recursos como el gujarati con una huella de disco pequeña (el repositorio ocupa aproximadamente 0,1 GB) y una licencia permisiva (MIT sobre los pesos).

Arquitectura VITS (variational inference with adversarial learning for end-to-end text-to-speech), un modelo generativo end-to-end que combina codificador de texto, alineador por monotonic alignment search, decodificador generativo y discriminadores adversarios durante el entrenamiento. Los detalles de tamaño en parámetros no están publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, Coqui VITS convertido a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | gujarati (`gu`) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 (corpus SYSPIN) |
| Formato de pesos | ONNX (sherpa-onnx) |

## Arquitectura y entrenamiento

La arquitectura es VITS, un sistema TTS end-to-end que modela la distribución condicional de mel-espectrogramas dado el texto mediante inferencia variacional, con un alineador monotónico (MAS) que aprende la alineación texto-audio sin supervisión explícita, y un decodificador generativo entrenado de forma adversaria con discriminadores. El checkpoint original es un modelo Coqui VITS; esta ficha corresponde a la conversión a ONNX, sin reentrenamiento ni modificación de pesos.

Los datos de entrenamiento provienen del corpus TTS SYSPIN del IISc, licenciado bajo CC-BY-4.0. No se especifica en la información disponible el número de horas de audio, el número de tokens ni la composición exacta del dataset. No se documenta uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de la propia conversión de formato para inferencia sin PyTorch.

## Capacidades

- Síntesis de voz femenina en gujarati a partir de texto.
- Ejecución mediante sherpa-onnx / ONNX Runtime, sin dependencia de PyTorch.
- Integración con el servidor de voz bolo (`bolo pull syspin-gu-female`).
- Salida de audio end-to-end (texto a forma de onda) mediante VITS.
- No se documentan capacidades de clonación de voz, control de prosodia, emoción, tool calling, agentes ni multimodalidad en la información disponible.

## Casos de uso

- Servicio de TTS en gujarati de bajo coste: desplegar la voz en un servidor sherpa-onnx sin PyTorch reduce el consumo de memoria y las dependencias, lo que simplifica el empaquetado en contenedores ligeros.
- Lectura de contenido en aplicaciones para hablantes de gujarati: artículos, noticias o documentación convertidos a audio con una voz femenina consistente.
- Accesibilidad: convertir texto de interfaces o formularios a voz para usuarios con discapacidad visual que usan gujarati.
- Asistentes de voz locales: integrar el modelo en un pipeline de reconocimiento de voz más TTS para interacción por turnos en gujarati.
- Generación de audio para formación y e-learning: narrar material didáctico en gujarati con una voz única y predecible.
- Prototipado rápido de productos de voz: al ser un repositorio de ~0,1 GB y licencia MIT, permite incorporar TTS en gujarati en demos y pruebas internas sin coste de licencia.
- Síntesis por lotes de avisos o mensajes: generar ficheros de audio a partir de plantillas de texto para distribución telefónica o por altavoz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (~0,1 GB) se trata de un modelo de huella reducida, apto para CPU.
- GPU recomendadas: no disponible; el despliegue objetivo es sherpa-onnx, que puede ejecutarse en CPU sin GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el diseño sin PyTorch y el tamaño reducido sugieren viabilidad en hardware modesto, pero no hay datos publicados.
- Opciones de despliegue: sherpa-onnx (objetivo principal), servidor bolo; otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bolo-syspin-gujarati-female | gu | VITS | MIT | ONNX | Conversión de SYSPIN/vits_Gujarati_Female, sin PyTorch |
| SYSPIN/vits_Gujarati_Female | gu | VITS (Coqui) | MIT | Coqui checkpoint | Modelo original del IISc, requiere pila Coqui/PyTorch |
| Otros modelos TTS multilingües | varios | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Modelo mono-idioma: solo gujarati; no se documenta soporte de code-switching ni de otros idiomas.
- Es una conversión de formato, no un modelo reentrenado: hereda todas las limitaciones del checkpoint original SYSPIN.
- No se publican métricas de calidad (MOS, WER, latencia), por lo que la evaluación subjetiva queda a cargo del usuario.
- Riesgo de artefactos y errores de pronunciación en texto fuera de dominio o con números, siglas y nombres propios, habitual en sistemas VITS; no cuantificado en la información disponible.
- Riesgo de sesgos acústicos y de prosodia derivados del corpus de entrenamiento; no se documenta la composición del dataset.
- Licencia MIT sobre los pesos, pero los datos de entrenamiento son CC-BY-4.0: en uso comercial debe conservarse la atribución exigida por esa licencia.
- El repositorio no incluye pipeline de seguridad, filtrado de contenido ni control de prosodia; en producción conviene validar la salida de audio.
- No hay datos publicados sobre estabilidad en cargas concurrentes ni sobre throughput del servidor bolo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/bolo-syspin-gujarati-female
- Modelo original: https://huggingface.co/SYSPIN/vits_Gujarati_Female (revisión `3533cda87bf83e698464c911ea4237fb9efcf152`)
- Proyecto bolo: https://github.com/cb-Sigma/bolo
- Script de conversión: `tools/voices/export_syspin.py` del repositorio bolo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- sherpa-onnx: no disponible en la información proporcionada
