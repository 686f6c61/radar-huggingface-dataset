# aoiandroid/whisper-th-small-combined-whisperkit-coreml-macos

## Resumen

Este repositorio es una conversion a Core ML del modelo biodatlab/whisper-th-small-combined, un fine-tune de openai/whisper-small especializado en reconocimiento automatico de voz (ASR) en tailandes. La conversion la publica el usuario aoiandroid con el objetivo declarado de servir como espejo para el proyecto TranslateBlue, empaquetando los pesos en el formato que espera WhisperKit (MelSpectrogram.mlmodelc, AudioEncoder.mlmodelc y TextDecoder.mlmodelc en float16 con longitud de KV de 448).

El valor del repositorio no esta en un nuevo entrenamiento, sino en el formato: permite ejecutar un modelo ASR afinado para tailandes directamente sobre el stack de Apple (Core ML y Apple Neural Engine) sin necesidad de reexportar los pesos. Segun la model card, los pesos no se han modificado mas alla de la conversion de formato, por lo que las capacidades y limitaciones son las del modelo original de Mahidol University (biodatlab).

Es relevante porque el ecosistema de WhisperKit carece historicamente de variantes para idiomas distintos del ingles y los principales idiomas europeos, y el tailandes es un caso especialmente sensible: openai/whisper-small sin ajuste obtiene un CER de 0.239 en FLEURS th, frente al 0.100 del fine-tune. El repositorio ocupa 0.5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (modelo base: openai/whisper-small) |
| Parametros totales | no disponible en la informacion proporcionada (derivado de openai/whisper-small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en el sentido de contexto de texto; ventana de audio de 30 s y longitud de KV de 448 en el decodificador |
| Tipos de cuantizacion | float16 (unico formato publicado) |
| Idiomas soportados | tailandes (th) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML compilado (.mlmodelc), layout WhisperKit; sin TextDecoderContextPrefill |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder con entrada de espectrograma Mel, entrenado de forma supervisada para transcripcion multilingue y traduccion. El modelo original openai/whisper-small fue liberado por OpenAI bajo licencia Apache-2.0/MIT. El fine-tune biodatlab/whisper-th-small-combined lo produce Mahidol University (biodatlab) sobre ese checkpoint, con datos que incluyen, entre otros, el split de entrenamiento de FLEURS en tailandes; la model card aclara explicitamente que las utterances de test de FLEURS no se usaron en el entrenamiento.

La aportacion de este repositorio es exclusivamente de infraestructura: la conversion a Core ML se realizo con argmaxinc/whisperkittools (commit 84f77a83, comando `whisperkit-generate-model`), con valores PSNR de 56 para el decodificador y 66 para el encoder en la comparacion PyTorch a Core ML. Se generan tres submodelos (MelSpectrogram, AudioEncoder y TextDecoder) en float16, junto con config.json, generation_config.json, tokenizer.json y tokenizer_config.json. No se incluye TextDecoderContextPrefill, que es opcional en WhisperKit. No se documenta en la informacion disponible si el fine-tune original uso RLHF, DPO o alguna tecnica de alineacion adicional.

## Capacidades

- Transcripcion de voz a texto en tailandes, con ventanas de audio de 30 segundos (la evaluacion publicada usa clips de 60 s procesados con la logica de ventanas de Whisper).
- Reconocimiento robusto de contenido en tailandes: la model card reporta una cobertura ponderada por frecuencia de 0.933 de media en clips de 60 s de FLEURS th y 0.978 en un clip de noticias tailandesas de 60 s.
- Decodificacion greedy con una llamada de respaldo a temperatura 0.2, tal y como se describe en la configuracion de evaluacion.
- Ejecucion local en macOS sobre Core ML, con posibilidad de aprovechar el Apple Neural Engine.
- Conversiones de formato de audio a espectrograma Mel integradas en el paquete (MelSpectrogram.mlmodelc), lo que simplifica el pipeline de inferencia.
- No se documenta soporte de tool calling, capacidades de agente, vision, audio en otros idiomas ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de reuniones y notas de voz en tailandes en aplicaciones nativas de macOS e iOS: al estar en formato Core ML con layout WhisperKit, se integra sin reexportar pesos y aprovecha la aceleracion del Apple Neural Engine en lugar de la CPU.
- Subtitulado automatico de contenido audiovisual tailandes en flujos de postproduccion locales: la ventana de 30 s de Whisper y la cobertura de 0.933 en FLEURS th lo hacen adecuado para generar subtitulos base que luego se revisan manualmente.
- Dictado por voz en tailandes dentro de un editor o IDE en Mac: el tamano del paquete (0.5 GB) permite mantenerlo cargado en memoria en un portatil con Apple Silicon.
- Aplicaciones de accesibilidad para hablantes de tailandes: transcripcion en tiempo casi real en el propio dispositivo, lo que evita enviar audio a servicios en la nube y reduce requisitos de privacidad.
- Procesamiento por lotes de archivos de audio tailandeses en un servidor Mac (Mac mini, Mac Studio): transcripcion de archivos historicos o de centros de llamadas sin dependencia de APIs externas.
- Integracion en productos tipo TranslateBlue: el repositorio se publica explicitamente como espejo para ese proyecto, por lo que encaja como componente ASR de un pipeline de traduccion tailandes a otros idiomas.
- Investigacion en ASR de bajos recursos: sirve como checkpoint de referencia para comparar tecnicas de ajuste fino en tailandes manteniendo el mismo formato de despliegue que la version PyTorch.

## Benchmarks y rendimiento

Resultados publicados en la model card (Mac, offline, 2026-09-30). La metrica "coverage" es la cobertura ponderada por frecuencia de bag-of-tokens del contenido de la transcripcion frente a la referencia, con n-gramas de caracteres (1 y 2) para el tailandes, en clips de 60 s con decodificacion greedy y un respaldo a temperatura 0.2.

| Modelo | FLEURS th 60 s (media / minimo) | Clip de noticias th 60 s |
|---|---|---|
| Este paquete Core ML | 0.933 / 0.864 | 0.978 |
| biodatlab/whisper-th-small-combined (PyTorch) | 0.933 / 0.872 | 0.978 |
| openai/whisper-small | 0.838 / 0.811 | 0.865 |
| openai/whisper-base | 0.739 / 0.615 | 0.780 |

CER en FLEURS th test (200 utterances, PyTorch): 0.100 para el fine-tune frente a 0.239 para openai/whisper-small. La propia model card advierte que el fine-tune se entreno con el split de entrenamiento de FLEURS, entre otros datos, y que las utterances de test no se utilizaron. No se publican datos de latencia ni de throughput.

## Requisitos de hardware

- El repositorio completo ocupa 0.5 GB; los pesos en float16 del paquete Core ML quedan en ese orden de magnitud, por lo que la huella de memoria en inferencia es muy inferior a la de un modelo de lenguaje del mismo numero de parametros.
- Disenado para el stack de Apple: Mac con Apple Silicon (M1 o superior) e iPhone/iPad compatibles con Core ML y, opcionalmente, Apple Neural Engine.
- Cabe sin problema en GPU de consumo del ecosistema Apple (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No esta pensado para GPUs NVIDIA del tipo RTX 4090, A100 o H100, ya que el formato Core ML no es directamente ejecutable en CUDA.
- Opciones de despliegue: WhisperKit (formato nativo del repositorio) y Core ML directamente. No es compatible con vLLM, TGI, llama.cpp u Ollama en su formato actual; para esos entornos habria que usar el modelo PyTorch original, biodatlab/whisper-th-small-combined.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idioma | Cobertura FLEURS th (media) | CER FLEURS th | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| aoiandroid/whisper-th-small-combined-whisperkit-coreml-macos | Whisper small afinado, convertido | no disponible (base whisper-small) | th | 0.933 | no medido en este paquete (0.100 en PyTorch) | Apache-2.0 | Core ML float16 |
| biodatlab/whisper-th-small-combined | Whisper small afinado | no disponible (base whisper-small) | th | 0.933 | 0.100 | Apache-2.0 | PyTorch/safetensors |
| openai/whisper-small | Whisper small multilingue | no disponible | multilingue | 0.838 | 0.239 | Apache-2.0/MIT | PyTorch/safetensors, entre otros |
| openai/whisper-base | Whisper base multilingue | no disponible | multilingue | 0.739 | no disponible | Apache-2.0/MIT | PyTorch/safetensors, entre otros |

La diferencia entre este paquete y el modelo PyTorch original es unicamente el formato y una minima variacion en el minimo de cobertura (0.864 frente a 0.872), que la propia model card atribuye a la conversion.

## Limitaciones y advertencias

- Solo soporta tailandes (th). No se declaran capacidades multilingues ni de traduccion en este fine-tune.
- El modelo esta entrenado con el split de entrenamiento de FLEURS, por lo que las cifras de FLEURS th test pueden estar optimistas respecto a dominios completamente ajenos.
- Al ser un modelo ASR, no genera texto libre ni razona; cualquier uso fuera de transcripcion de audio queda fuera de su alcance.
- Riesgo de alucinacion tipico de Whisper en segmentos con silencio, ruido o audio musical: puede producir texto plausible no presente en la grabacion.
- No incluye TextDecoderContextPrefill, marcado como opcional en WhisperKit; si el pipeline de destino lo requiere, habria que generarlo.
- El formato Core ML limita el despliegue a plataformas Apple. No es utilizable en servidores Linux con CUDA sin volver al checkpoint PyTorch.
- Licencia Apache-2.0, sin restricciones adicionales declaradas para uso comercial. El autor atribuye todo el merito a biodatlab (Mahidol University) y a OpenAI.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y sin mantenimiento documentado: conviene verificar la integridad de los ficheros antes de usarlo en produccion.
- Las fechas de creacion y actualizacion del repositorio (2026-09-29) y de la evaluacion (2026-09-30) figuran asi en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/aoiandroid/whisper-th-small-combined-whisperkit-coreml-macos
- Modelo base (PyTorch): https://huggingface.co/biodatlab/whisper-th-small-combined
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-small
- Herramientas de conversion: https://github.com/argmaxinc/whisperkittools
