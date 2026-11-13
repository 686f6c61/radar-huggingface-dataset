# codebucketsolutions/bolo-syspin-bhojpuri-male

## Resumen

`codebucketsolutions/bolo-syspin-bhojpuri-male` es una voz de síntesis de habla (text-to-speech) para bhojpuri masculino, empaquetada en formato ONNX para su uso con el servidor de voz `bolo` sobre el runtime sherpa-onnx. No es un modelo entrenado desde cero por el autor del repositorio: se trata de una conversión de formato del checkpoint Coqui VITS publicado originalmente por el proyecto SYSPIN (SPIRE Lab, Indian Institute of Science, Bengaluru). El autor, `codebucketsolutions`, únicamente ejecutó la herramienta `tools/voices/export_syspin.py` del proyecto bolo para transformar los pesos de Coqui VITS a ONNX, sin reentrenar ni modificar los pesos.

La relevancia de este artefacto es acotada pero concreta: permite desplegar una voz bhojpuri sin dependencia de PyTorch, lo que reduce el peso del stack de inferencia y facilita su integración en servidores ligeros basados en sherpa-onnx. El repositorio ocupa aproximadamente 0,1 GB y está publicado bajo licencia MIT, mientras que los datos de entrenamiento originales (corpus SYSPIN) están bajo CC-BY-4.0.

Se trata, por tanto, de un modelo TTS de arquitectura VITS, orientado a un único idioma (bho, bhojpuri) y a una única voz masculina. No debe evaluarse como un modelo de lenguaje general: su función es exclusivamente la síntesis de voz a partir de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | bhojpuri (bho) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 (corpus SYSPIN) |
| Formato de pesos | ONNX (sherpa-onnx) |
| Tamano del repositorio | ~0,1 GB |
| Pipeline | text-to-speech |
| Voz | masculina, bhojpuri |
| Runtime objetivo | sherpa-onnx (sin PyTorch) |
| Modelo de origen | SYSPIN/vits_Bhojpuri_Male (revision e5bb31ecf899f9a7e2559e0013a67933a6d78348) |

## Arquitectura y entrenamiento

La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), el modelo end-to-end de Coqui TTS que combina un codificador de texto, un prior variacional, un decoder generativo y un discriminador adversarial en entrenamiento, con alineamiento monotónico aprendido. VITS produce audio de forma directa desde texto sin un vocoder externo separado en el pipeline de inferencia, lo que simplifica el despliegue. En este repositorio los pesos se distribuyen exclusivamente en formato ONNX para su ejecución con sherpa-onnx.

No se ha realizado ningún reentrenamiento ni ajuste fino por parte del autor del repositorio: la model card indica explícitamente que se trata de una conversión de formato (Coqui VITS a ONNX) y que los pesos no fueron reentrenados ni modificados. Los datos de entrenamiento originales corresponden al corpus TTS SYSPIN del IISc, publicado bajo CC-BY-4.0. No se dispone de información sobre el número de tokens, horas de audio, composición del dataset ni sobre el uso de técnicas de alineamiento, RLHF o DPO en el entrenamiento original dentro de la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en bhojpuri.
- Voz masculina única, entrenada sobre el corpus SYSPIN.
- Inferencia sin PyTorch mediante sherpa-onnx, lo que reduce dependencias del stack.
- Integración con el servidor de voz `bolo` mediante el comando `bolo pull syspin-bho-male`.
- Ejecución en formato ONNX, adecuada para despliegues ligeros y entornos con recursos limitados.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Cobertura monolingüe (bhojpuri); no se documentan capacidades multilingües.

## Casos de uso

- **Locución automatizada en bhojpuri para medios locales**: generación de narraciones para radios comunitarias o boletines en bhojpuri, usando la voz masculina del modelo para producir audio de forma reproducible y sin depender de un locutor humano.
- **Accesibilidad y lectura de textos**: conversión de documentos, noticias o avisos administrativos en bhojpuri a audio para personas con discapacidad visual o baja alfabetización, aprovechando que el modelo funciona sobre sherpa-onnx sin necesidad de GPU dedicada.
- **Asistentes de voz en dispositivos embebidos**: despliegue en Raspberry Pi o dispositivos de borde con sherpa-onnx, donde la ausencia de PyTorch y el tamaño reducido del repositorio (~0,1 GB) simplifican el empaquetado.
- **Sistemas de información telefónica (IVR)**: generación de mensajes pregrabados dinámicamente en bhojpuri para centralitas y servicios de atención telefónica en zonas donde este idioma es predominante.
- **Producción de contenido educativo**: síntesis de lecciones y materiales de aprendizaje en bhojpuri para plataformas de e-learning, con la ventaja de que el modelo es de licencia MIT y permite uso comercial.
- **Prototipado de aplicaciones de voz**: integración rápida en pipelines de TTS mediante `bolo pull`, útil para equipos que quieran validar una voz bhojpuri antes de invertir en un modelo propio o en un servicio en la nube.
- **Investigación en TTS de bajos recursos**: uso como línea base reproducible para experimentos con lenguas de bajos recursos, dado que los pesos y la procedencia están documentados y la licencia es permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MOS, MCD, WER), latencia ni throughput.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada; por el tamaño del repositorio (~0,1 GB) y la naturaleza de un modelo VITS, es esperable que la inferencia quepa en CPU, pero no se documentan cifras oficiales.
- **GPU recomendadas**: no disponible. El modelo está pensado para sherpa-onnx, que prioriza ejecución en CPU.
- **Consumer GPU**: no se documenta compatibilidad explícita; el diseño sin PyTorch y el tamaño reducido sugieren viabilidad en CPU y en GPUs de consumo, pero sin datos confirmados.
- **Opciones de despliegue**: sherpa-onnx (runtime objetivo) y el servidor `bolo` mediante `bolo pull syspin-bho-male`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Runtime | Contexto/parametros |
|---|---|---|---|---|---|---|
| bolo-syspin-bhojpuri-male (este) | bhojpuri | VITS (Coqui) | ONNX | MIT (pesos), CC-BY-4.0 (datos) | sherpa-onnx / bolo | no disponible |
| SYSPIN/vits_Bhojpuri_Male | bhojpuri | VITS (Coqui) | Coqui checkpoint | MIT (pesos) | Coqui TTS (PyTorch) | no disponible |
| Otras voces SYSPIN del proyecto bolo | varios idiomas indios | VITS (Coqui) | ONNX | MIT (pesos) | sherpa-onnx / bolo | no disponible |

La comparación más directa es con el checkpoint original `SYSPIN/vits_Bhojpuri_Male`: mismos pesos, distinto formato de distribución. La diferencia práctica es el runtime: el original requiere Coqui TTS con PyTorch, mientras que esta conversión funciona sobre sherpa-onnx sin PyTorch. No se dispone de datos de benchmarks que permitan comparar calidad o latencia entre ambos.

## Limitaciones y advertencias

- **Modelo monolingüe**: solo soporta bhojpuri (bho); no debe esperarse calidad en otros idiomas.
- **Voz única**: únicamente voz masculina; no hay variantes femeninas ni control de estilo o emoción documentado.
- **Sin reentrenamiento**: los pesos son idénticos al checkpoint original de SYSPIN; cualquier limitación del modelo original se hereda íntegramente.
- **Riesgo de alucinación en TTS**: como todo modelo generativo de voz, puede producir artefactos, pronunciaciones incorrectas o inestabilidad en textos fuera de dominio; no se documentan métricas de robustez.
- **Sesgos**: no se documentan sesgos específicos, pero al entrenarse sobre un corpus único (SYSPIN) puede reflejar las características demográficas y de grabación de dicho corpus.
- **Licencia**: los pesos son MIT y permiten uso comercial; los datos de entrenamiento son CC-BY-4.0, lo que exige atribución al proyecto SYSPIN y al IISc. La model card incluye el texto de atribución y procedencia que debe conservarse.
- **Documentación escasa**: no se publican parámetros, métricas de calidad, latencia ni requisitos de hardware; para producción conviene validar empíricamente el rendimiento antes de desplegar.
- **Repositorio con 0 descargas y 0 likes**: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/codebucketsolutions/bolo-syspin-bhojpuri-male
- Modelo de origen: https://huggingface.co/SYSPIN/vits_Bhojpuri_Male
- Proyecto bolo: https://github.com/cb-Sigma/bolo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- sherpa-onnx: no disponible en la información proporcionada
- Coqui TTS: no disponible en la información proporcionada
