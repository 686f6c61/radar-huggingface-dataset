# codebucketsolutions/bolo-syspin-maithili-female

## Resumen

`bolo-syspin-maithili-female` es un modelo de síntesis de voz (text-to-speech) para maithili, una lengua indoaria hablada principalmente en el estado de Bihar (India) y en la región oriental de Terai (Nepal). Lo publica la organización `codebucketsolutions` como parte del proyecto bolo, un servidor de voz ligero que funciona sin PyTorch mediante el runtime sherpa-onnx. El modelo no es un entrenamiento original: se trata de una conversión de formato del checkpoint Coqui VITS `SYSPIN/vits_Maithili_Female`, desarrollado por el proyecto SYSPIN del SPIRE Lab (Indian Institute of Science, Bengaluru), sin reentrenamiento ni modificación de los pesos.

La relevancia del modelo es doble. Por un lado, cubre una lengua de bajos recursos con pocos sistemas TTS disponibles, lo que facilita aplicaciones de accesibilidad, lectura de contenidos y preservación lingüística. Por otro, su empaquetado en ONNX y su integración con sherpa-onnx permiten desplegarlo en entornos sin GPU y sin dependencias pesadas de PyTorch, algo poco habitual en modelos TTS de calidad.

El repositorio ocupa aproximadamente 0,1 GB, lo que corresponde a un modelo VITS compacto. La arquitectura es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo end-to-end que genera waveforms directamente a partir de texto. La licencia de los pesos es MIT y los datos de entrenamiento (corpus SYSPIN) están bajo CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, Coqui VITS convertido a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por utterance, sin contexto de texto largo documentado) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | maithili (mai) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 |
| Formato de pesos | ONNX (exportado desde checkpoint Coqui VITS) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema TTS end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial multiperiodo durante el entrenamiento. VITS produce audio de forma directa sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. En este repositorio, el checkpoint original de Coqui VITS se ha convertido a ONNX mediante el script `tools/voices/export_syspin.py` del proyecto bolo, sin reentrenar ni alterar los pesos.

Los datos de entrenamiento provienen del corpus SYSPIN del IISc, distribuido bajo CC-BY-4.0. No se documenta en la información disponible el número de horas de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o ajuste fino adicional. Tampoco se detallan innovaciones técnicas más allá de la propia arquitectura VITS y la conversión a ONNX para inferencia sin PyTorch.

## Capacidades

- Síntesis de voz (text-to-speech) en maithili a partir de texto de entrada.
- Voz femenina, según indica el nombre del modelo y la procedencia del checkpoint original.
- Inferencia mediante sherpa-onnx, sin dependencias de PyTorch.
- Integración con el servidor de voz bolo mediante el comando `bolo pull syspin-mai-female`.
- Generación de audio end-to-end (texto a waveform) sin vocoder externo.
- No se documentan capacidades de clonación de voz, control de prosodia avanzado, tool calling ni razonamiento multi-paso.

## Casos de uso

- Lectura de contenidos en maithili: el modelo puede convertir artículos, noticias o textos educativos a audio para usuarios que prefieren o necesitan escuchar en lugar de leer, aprovechando que es un TTS específico para esa lengua.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de asistencia que requieran una voz femenina en maithili, con despliegue ligero en servidores sin GPU.
- Asistentes de voz locales: al funcionar sobre sherpa-onnx y sin PyTorch, puede incorporarse en dispositivos de borde o entornos con recursos limitados para respuestas habladas en maithili.
- Preservación y difusión lingüística: generación de audiolibros, materiales didácticos o contenido divulgativo en maithili, una lengua con pocos recursos TTS disponibles.
- Atención al cliente automatizada: respuestas de voz pregrabadas o dinámicas en maithili para servicios telefónicos o chatbots de voz, usando el modelo como componente de síntesis.
- Investigación en TTS de bajos recursos: sirve como referencia y punto de partida para experimentos de conversión de formato, evaluación de inteligibilidad o comparación con otros sistemas VITS en lenguas indoarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo VITS compacto (~0,1 GB de repo) y ejecutarse en ONNX, es probable que funcione en CPU, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible; el diseño con sherpa-onnx sugiere orientación a CPU y entornos sin GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño reducido del repo hace plausible su ejecución en hardware modesto, pero no hay datos oficiales.
- Opciones de despliegue: sherpa-onnx y el servidor bolo (`bolo pull syspin-mai-female`). No se documentan otras integraciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS en este caso).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bolo-syspin-maithili-female | maithili | VITS (ONNX) | ONNX | MIT | Hugging Face (codebucketsolutions) |
| SYSPIN/vits_Maithili_Female | maithili | VITS (Coqui) | checkpoint Coqui | MIT | Hugging Face (SYSPIN) |
| Otros TTS multilingües (p. ej. MMS-TTS de Meta) | varias, incluida mai | VITS | PyTorch / ONNX | según modelo | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, inteligibilidad, latencia) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo es una conversión de formato, no un entrenamiento nuevo; hereda las limitaciones del checkpoint original de SYSPIN.
- Solo soporta maithili; no es multilingüe y no se documenta cobertura de dialectos o variantes regionales.
- No se documentan métricas de calidad (MOS, inteligibilidad) ni evaluaciones subjetivas.
- Riesgo de alucinación o pronunciación incorrecta en textos con nombres propios, neologismos o préstamos de otras lenguas, habitual en TTS de bajos recursos.
- Posibles sesgos derivados de la composición del corpus SYSPIN (voz femenina, dominio y hablantes concretos no documentados en detalle).
- La licencia MIT de los pesos permite uso comercial, pero los datos de entrenamiento están bajo CC-BY-4.0, lo que exige atribución; conviene revisar el texto completo de `LICENSE` antes de un despliegue en producción.
- No se documentan requisitos de hardware, latencia ni límites de longitud de texto de entrada.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/bolo-syspin-maithili-female
- Modelo original: https://huggingface.co/SYSPIN/vits_Maithili_Female
- Proyecto bolo: https://github.com/cb-Sigma/bolo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- sherpa-onnx (runtime): https://github.com/k2-fsa/sherpa-onnx
