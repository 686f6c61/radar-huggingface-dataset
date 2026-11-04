# keithics/parakeet-tdt-0.6b-v2-coreml

## Resumen

Parakeet TDT 0.6B V2 - CoreML es una conversión al formato CoreML del modelo de reconocimiento automático del habla (ASR) Parakeet TDT 0.6B V2 de NVIDIA, realizada por el equipo de FluidInference (publicada bajo el identificador `keithics`). Su objetivo es permitir inferencia en dispositivo (on-device) sobre Apple Silicon, macOS 14+ e iOS 17+, aprovechando la arquitectura FastConformer-TDT de 0,6 mil millones de parámetros y una frecuencia de muestreo de 16 kHz.

El modelo resuelve el problema de ejecutar ASR de alta calidad sin depender de servicios en la nube ni de GPUs dedicadas: al estar en CoreML, se integra en aplicaciones nativas de Apple mediante Swift a través del repositorio FluidAudio. Según la model card, alcanza un factor de tiempo real de aproximadamente 110x en un M4 Pro con un pico de memoria de unos 800 MB, lo que lo hace apto para transcripción en tiempo real en portátiles y dispositivos móviles.

Es relevante ahora porque la transcripción local con baja latencia y sin coste por API es un requisito creciente en aplicaciones de notas de voz, subtitulado y asistentes personales en el ecosistema Apple. La contrapartida es que solo soporta inglés y que la información publicada sobre su entrenamiento y sus resultados de benchmarks es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (Transducer con decodificación TDT) |
| Parámetros totales | 0,6B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la model card) |
| Tipos de cuantización | no disponible (formato CoreML; no se detallan variantes) |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | CoreML (repo de 2,6 GB); modelo base original en PyTorch/NeMo |
| Frecuencia de muestreo | 16 kHz |
| Plataformas soportadas | macOS 14+, iOS 17+ (optimizado para Apple Silicon) |
| Tamaño del repositorio | 2,6 GB |

## Arquitectura y entrenamiento

El modelo base es un FastConformer-TDT de NVIDIA: un encoder Conformer con subsampling agresivo (FastConformer) acoplado a un decodificador Transducer con decodificación TDT (Token-and-Duration Transducer), que predice conjuntamente tokens y duraciones para acelerar la inferencia sin sacrificar precisión. La conversión a CoreML preserva esa arquitectura y la adapta para ejecución nativa en Apple Silicon e iOS.

No se dispone de información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras innovaciones de entrenamiento del modelo original. La model card solo confirma la arquitectura, el tamaño (0,6B), la frecuencia de muestreo (16 kHz) y que la conversión y la integración en Swift fueron realizadas por el equipo de FluidInference. Tampoco se detallan técnicas de optimización específicas de la conversión CoreML más allá de la mención a eficiencia y bajo consumo de memoria.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés a partir de audio a 16 kHz.
- Inferencia en dispositivo sobre Apple Silicon, macOS 14+ e iOS 17+.
- Transcripción en tiempo real: factor de tiempo real de ~110x en M4 Pro según la model card.
- Bajo consumo de memoria: pico de ~800 MB durante la inferencia.
- Integración nativa en Swift mediante el repositorio FluidAudio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión, audio más allá del ASR ni modo de pensamiento.
- Capacidad multilingüe: limitada al inglés.

## Casos de uso

- Transcripción de reuniones en local: una aplicación macOS puede procesar el audio de una videollamada en tiempo real con el modelo en CoreML, sin enviar datos a la nube, gracias al factor de tiempo real de ~110x en M4 Pro.
- Notas de voz en iPhone: integración en una app iOS 17+ para convertir grabaciones de voz en texto editable en el propio dispositivo, con un pico de memoria de ~800 MB compatible con dispositivos modernos.
- Subtitulado de vídeo: generación de subtítulos en inglés para contenido grabado o en directo en un Mac, aprovechando la velocidad de inferencia para procesar lotes de audio rápidamente.
- Asistentes de voz locales: alimentar un pipeline de comandos por voz en una app de escritorio, donde la baja latencia del ASR on-device evita la dependencia de servicios externos.
- Dictado en herramientas de productividad: integración en editores de texto o apps de notas para dictado continuo en inglés con privacidad total, al no salir el audio del dispositivo.
- Investigación y prototipado en ASR: uso del modelo como referencia on-device para comparar calidad y latencia frente a soluciones en servidor, dado que el formato CoreML simplifica el despliegue en el ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de rendimiento de inferencia: factor de tiempo real de ~110x en M4 Pro y pico de memoria de ~800 MB. No se incluyen cifras de WER ni comparaciones con otros modelos.

## Requisitos de hardware

- Memoria: pico de ~800 MB durante la inferencia según la model card.
- Plataformas: macOS 14+ e iOS 17+; optimizado para Apple Silicon.
- GPU recomendadas: Apple Silicon (la model card cita M4 Pro como referencia); no se especifican otros chips.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon y dispositivos iOS compatibles; no se menciona soporte para GPUs NVIDIA u otras plataformas.
- Opciones de despliegue: CoreML con integración en Swift mediante FluidAudio; el modelo base original está disponible en PyTorch/NeMo para otros entornos.
- Latencia y throughput: factor de tiempo real de ~110x en M4 Pro; no se detallan más métricas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| keithics/parakeet-tdt-0.6b-v2-coreml | 0,6B | inglés | CoreML | CC-BY-4.0 | Conversión on-device para Apple Silicon; ~110x RTF en M4 Pro |
| nvidia/parakeet-tdt-0.6b-v2 | 0,6B | inglés | PyTorch/NeMo | no disponible en la información proporcionada | Modelo base original de NVIDIA |
| Alternativas ASR on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- No se han publicado métricas de calidad (WER) en la información disponible, por lo que el rendimiento en dominios ruidosos o con acentos es desconocido.
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR; no se documentan mitigaciones específicas.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base de NVIDIA, cuya licencia no se detalla en la información proporcionada.
- Dependencia del ecosistema Apple: el formato CoreML limita su uso a macOS 14+ e iOS 17+ y a hardware Apple Silicon.
- La model card advierte que el modelo seguirá evolucionando; la versión publicada puede cambiar en rendimiento y precisión.
- No se detallan sesgos conocidos ni la composición de los datos de entrenamiento, lo que dificulta evaluar riesgos de equidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keithics/parakeet-tdt-0.6b-v2-coreml
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
- Repositorio FluidAudioSwift: https://github.com/FluidInference/FluidAudioSwift
- Discord de FluidInference: https://discord.gg/WNsvaCtmDe
