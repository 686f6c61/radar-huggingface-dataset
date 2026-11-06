# KlangAI/pianissimo-da-coreml

## Resumen

KlangAI/pianissimo-da-coreml es la conversión a CoreML del modelo de reconocimiento automático del habla (ASR) KlangAI/pianissimo-da, especializado en danés y desarrollado por Klang. El modelo original es un sistema FastConformer con decodificación TDT (Token-and-Duration Transducer) que se ha empaquetado en formato CoreML para ejecutarse sobre la Neural Engine de chips Apple silicon (Macs, iPhones e iPads) mediante la librería FluidAudio, reutilizando el mismo esquema de carpetas y las mismas interfaces de entrada/salida que el modelo Parakeet v3 de FluidInference.

La relevancia de esta conversión es doble: por un lado, permite ejecutar un ASR específico de danés en hardware de consumo Apple sin depender de la nube; por otro, la cuantización en 8 bits con paletización k-means reduce el encoder a 567 MB manteniendo una tasa de error de palabra (WER) del 6,9 % en FLEURS, frente al 18,6 % del Parakeet v3 estándar, con una velocidad de 183× en tiempo real sobre un M5. Esto la convierte en una alternativa práctica para transcripción local en danés en el ecosistema Apple.

El repositorio ocupa 1,8 GB e incluye dos variantes (8 bits recomendada y fp16), junto con los ficheros de preprocesado, configuración y vocabulario heredados sin cambios del Parakeet v3 de FluidInference. La licencia es CC BY 4.0, igual que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por segmentos; FluidAudio divide grabaciones largas automaticamente) |
| Tipos de cuantizacion | 8 bits con paletizacion k-means (256 valores por capa) en el encoder; fp16 en variante alternativa |
| Idiomas soportados | danés (da) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CoreML (.mlmodelc compilado), empaquetado en carpetas compatibles con FluidAudio/Parakeet v3 |

## Arquitectura y entrenamiento

El modelo subyacente, KlangAI/pianissimo-da, es un sistema ASR basado en FastConformer (una variante eficiente de Conformer para audio) con decodificación TDT, un esquema transducer que predice conjuntamente tokens y duraciones. Esta conversión CoreML conserva el encoder, decoder y joint network del modelo original, y reutiliza sin modificaciones el preprocesador (`Preprocessor.mlmodelc`), el `config.json` y los dos ficheros de vocabulario del Parakeet v3 de FluidInference, lo que implica que Pianissimo mantiene las mismas características acústicas de entrada y el mismo tokenizador que v3.

La conversión se realizó con coremltools y posterior compilación en un Mac. La variante de 8 bits aplica paletización de pesos del encoder a 256 valores por capa mediante k-means. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o ajuste fino específico; esos datos corresponden al modelo original y no se reproducen aquí.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en danés.
- Ejecución sobre Neural Engine de Apple silicon (Macs, iPhones, iPads), con resultados idénticos en CPU.
- Procesamiento de grabaciones largas: FluidAudio divide automáticamente el audio en segmentos.
- Integración con la API de FluidAudio mediante `AsrModels.loadLocal` y `AsrManager.transcribe`.
- Compatibilidad de interfaz con Parakeet v3 (`Encoder`, `Decoder`, `JointDecisionv3`), lo que facilita sustituir un modelo por otro.
- No se documentan capacidades de tool calling, agentes, visión, audio más allá del ASR ni modo thinking.

## Casos de uso

- Transcripción local en macOS: integrar el modelo en una app de escritorio Swift para dictado o notas de voz sin enviar audio a la nube, aprovechando la Neural Engine y la carga en unos 7 segundos.
- Subtitulado de contenido en danés: procesar archivos de audio o vídeo con FluidAudio, que segmenta automáticamente grabaciones largas, para generar subtítulos con un WER del 6,9 % en FLEURS.
- Asistentes de voz en iPhone/iPad: usar la variante de 8 bits (567 MB de encoder) para reconocimiento en tiempo real en dispositivos con memoria limitada, con velocidad de 183× RTFx.
- Análisis de llamadas o reuniones en danés: transcribir grabaciones de客服 o reuniones internas en local para cumplir requisitos de privacidad de datos.
- Investigación en ASR de lenguas minoritarias: emplear el modelo como referencia o base para experimentos con danés en hardware Apple, comparando contra Parakeet v3.
- Pipelines de accesibilidad: convertir voz a texto en aplicaciones de accesibilidad para usuarios daneses, con licencia CC BY 4.0 que permite uso comercial con atribución.

## Benchmarks y rendimiento

Datos publicados en la model card sobre 200 clips de test de FLEURS en danés (minúsculas y sin puntuación; menor es mejor):

| Modelo / variante | Pesos del encoder | Tamano encoder | WER FLEURS (%) | Velocidad (RTFx, Neural Engine) |
|---|---|---:|---:|---:|
| Original fp32 (ONNX en Linux) | fp32 | no disponible | 6,5 | no disponible |
| CoreML 8 bits (recomendado) | paletizado 8 bits | 567 MB | 6,9 | 183× |
| CoreML fp16 | fp16 | 1,1 GB | 7,0 | 174× |
| Parakeet v3 estandar (FluidInference) | no disponible | 434 MB | 18,6 | 180× |

La velocidad se midió sobre los 200 clips (38 minutos de audio) en un Apple M5 (MacBook Pro, 24 GB) con los modelos ya cargados. La primera carga, incluyendo compilación para la Neural Engine, tarda unos 7 segundos (8 bits) o 9 segundos (fp16).

## Requisitos de hardware

- Hardware objetivo: chips Apple silicon (M-series en Mac, A-series recientes en iPhone/iPad) con Neural Engine; también funciona en CPU con resultados idénticos.
- VRAM/memoria: el encoder de 8 bits ocupa 567 MB y el fp16 1,1 GB; el repositorio completo son 1,8 GB.
- No cabe en GPUs NVIDIA ni en hardware x86 convencional: el formato es CoreML y depende de FluidAudio en Swift.
- Despliegue: FluidAudio (Swift Package) cargando la carpeta como modelo local Parakeet v3 (`AsrModels.loadLocal`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia/throughput: 183× RTFx (8 bits) y 174× (fp16) en M5; primera carga de 7–9 segundos por compilación.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamano encoder | WER FLEURS danes (%) | Licencia | Formato |
|---|---|---|---:|---:|---|---|
| Pianissimo-da CoreML 8 bits | da | FastConformer + TDT | 567 MB | 6,9 | CC BY 4.0 | CoreML |
| Pianissimo-da CoreML fp16 | da | FastConformer + TDT | 1,1 GB | 7,0 | CC BY 4.0 | CoreML |
| Parakeet v3 (FluidInference) | multi (incluye da) | no disponible | 434 MB | 18,6 | CC BY 4.0 | CoreML |
| Pianissimo-da original | da | FastConformer + TDT | no disponible | 6,5 | CC BY 4.0 | ONNX |

## Limitaciones y advertencias

- Solo soporta danés; no es multilingüe.
- El WER del 6,9 % implica errores residuales en condiciones acústicas difíciles; no se documentan evaluaciones con ruido, acentos o audio telefónico.
- La cuantización de 8 bits produce transcripciones ligeramente distintas del original en aproximadamente una cuarta parte de los clips.
- Dependencia del ecosistema Apple y de FluidAudio: no hay soporte para GPUs NVIDIA ni para servidores Linux estándar en este formato.
- Los ficheros de preprocesado, configuración y vocabulario provienen de Parakeet v3 (CC BY 4.0) y deben atribuirse también.
- Licencia CC BY 4.0: permite uso comercial con atribución; hay que citar a Klang y respetar la licencia de FluidInference para los componentes heredados.
- No se han publicado datos sobre sesgos, alucinaciones en ASR (inserciones) ni rendimiento fuera del conjunto FLEURS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KlangAI/pianissimo-da-coreml
- Modelo original: https://huggingface.co/KlangAI/pianissimo-da
- FluidAudio (repositorio): https://github.com/FluidInference/FluidAudio
- Parakeet v3 CoreML (FluidInference): https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v3-coreml
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
