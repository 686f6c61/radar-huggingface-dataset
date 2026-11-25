# nilsbc/pansecho-duality-karaoke-onnx

## Resumen

Pansecho Duality Karaoke ONNX es una conversión al formato ONNX del modelo `musetric/mel-band-roformer-duality-kara2-student`, un separador de fuentes de audio basado en la arquitectura Mel-Band RoFormer. Lo publica el usuario nilsbc como artefacto de distribución para la aplicación de escritorio PansEcho, que lo descarga bajo demanda del usuario. Su función es descomponer una canción en una sola pasada en tres pistas: instrumental, voz principal (lead) y coros (backing), a partir de una ventana estéreo de 11 segundos a 44,1 kHz.

El modelo original es una destilación del Mel-Band RoFormer Duality de Aname, combinado con capacidades aprendidas del modelo UVR MDX-Net KARA 2 del proyecto Ultimate Vocal Remover. La conversión a ONNX preserva los pesos sin modificación alguna: solo cambia el contenedor, con precisión fp32 y opset 18, verificado contra la implementación en PyTorch con una diferencia máxima absoluta de 2,8e-7 en las pistas de salida sobre una ventana de 11 segundos.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de un componente de procesamiento de señal de audio con una interfaz tensorial muy concreta (STFT de entrada, máscaras complejas de salida). Su interés práctico reside en la licencia Apache-2.0, el tamaño contenido (470 MB en un único fichero ONNX) y la posibilidad de ejecutarlo con onnxruntime sin depender de PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mel-Band RoFormer (arXiv:2310.01809) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 11 s por inferencia |
| Tipos de cuantización | solo fp32 en este repositorio; no se publican variantes cuantizadas |
| Idiomas soportados | no aplica (modelo de audio, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18), fichero único `duality_kara2_student.onnx` de 470.022.151 bytes |
| Frecuencia de muestreo | 44,1 kHz, estéreo |
| STFT de entrada | n_fft 2048, hop 441, ventana Hann periódica, center=True con padding reflect, sin normalizar |
| Tensor de entrada | `stft_repr` `[1, 2050, 1101, 2]` (bin, canal) x frame x (real, imag) |
| Tensor de salida | `masks` `[2, 2050, 1101, 2]` (máscaras complejas por bin) |
| Tamaño del repositorio | 0,5 GB |
| Pipeline | audio-to-audio |

## Arquitectura y entrenamiento

La arquitectura es Mel-Band RoFormer, un transformer con atención sobre bandas mel aplicada a la representación STFT del audio. El modelo recibe la STFT completa de una ventana estéreo de 11 segundos y devuelve dos máscaras complejas por bin de frecuencia: la máscara 0 estima la voz sobre la mezcla y la máscara 1 estima los coros sobre la voz. La reconstrucción de pistas se hace por multiplicación sucesiva: `vocals = mix × m0`, `backing = vocals × m1`, `lead = vocals − backing`, `instrumental = mix − vocals`.

El modelo original es un estudiante destilado a partir de dos fuentes: el Mel-Band RoFormer Duality de Aname (Apache-2.0) y el modelo UVR MDX-Net KARA 2 desarrollado por el equipo de Ultimate Vocal Remover (MIT). Según la model card del repositorio fuente, el entrenamiento se realizó sobre música de FMA y ccMixter exclusivamente bajo licencias CC BY, CC0 y Public Domain Mark, con el listado completo en `training-data.csv` del repositorio original. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales más allá de la destilación.

La conversión a ONNX se realizó con torch 2.8.0 y se validó con onnxruntime 1.30.0. El repositorio no modifica los pesos: es exclusivamente un cambio de formato para permitir la inferencia fuera del ecosistema PyTorch.

## Capacidades

- Separación de fuentes de audio en una sola pasada con tres salidas derivadas: instrumental, voz principal y coros.
- Procesamiento de audio estéreo a 44,1 kHz con ventanas de 11 segundos.
- Estimación de máscaras complejas por bin de frecuencia, lo que permite reconstrucción de fase coherente con la mezcla original.
- Ejecución mediante onnxruntime, sin dependencia de PyTorch en tiempo de inferencia.
- Integración como `audio-to-audio` en pipelines de procesamiento de audio.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües en el sentido de procesamiento de lenguaje; es independiente del idioma de la canción.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Karaoke automático: el modelo genera en una pasada la pista instrumental y la pista de voz principal, de modo que la app puede ofrecer modo karaoke sin necesidad de un pipeline de dos etapas. La separación lead/backing permite además silenciar coros por separado.
- Herramientas de producción musical (DAW): extracción de stems para remezclas, sampling o edición. La ventana de 11 segundos obliga a trocear la canción y recomponer con solapamiento, pero el coste por ventana es bajo al ejecutarse en ONNX.
- Aplicaciones de escritorio sin GPU dedicada: al ser un fichero ONNX de 470 MB en fp32, puede ejecutarse con onnxruntime en CPU o con aceleración opcional (CoreML, DirectML), lo que encaja en apps como PansEcho que descargan el modelo bajo demanda.
- Limpieza de voces para podcasts o directos: aunque el modelo está entrenado con música, la máscara de voz sobre mezcla puede emplearse para atenuar coros o voces de fondo en grabaciones con acompañamiento musical.
- Investigación en separación de fuentes: sirve como referencia reproducible en ONNX para comparar implementaciones de Mel-Band RoFormer frente a la versión PyTorch, gracias a la verificación numérica publicada (2,8e-7 de diferencia máxima).
- Preprocesado para transcripción o alineación: separar la voz principal del acompañamiento antes de pasar un sistema ASR o de alineación forzada mejora la relación señal-ruido del material de entrada.
- Distribución embebida: el formato ONNX y la licencia Apache-2.0 permiten integrarlo en productos comerciales sin obligaciones de copyleft, siempre que se respeten las atribuciones del modelo fuente.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| SDR mediano de voces | 11,24 dB | MUSDB18-HQ |
| SDR mediano de backing en stems reales | 0,5 a 1,9 dB | Separación débil de coros |
| Diferencia máxima absoluta ONNX vs PyTorch | 2,8e-7 | Ventana de 11 s, onnxruntime 1.30.0 |

No se han publicado en la información disponible resultados de benchmarks adicionales (SDR por pista de instrumental, comparativas con otros separadores, latencia o throughput). Los únicos datos numéricos aportados son los de la model card del repositorio fuente y la verificación de equivalencia numérica de la conversión.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El fichero ONNX ocupa 470 MB en fp32; la inferencia sobre un tensor de entrada `[1, 2050, 1101, 2]` requiere memoria adicional para activaciones, pero no se publica una cifra concreta.
- GPU recomendadas: no disponibles. El modelo está pensado para ejecutarse con onnxruntime, que soporta CPU, CoreML (macOS), DirectML (Windows) y CUDA.
- GPU de consumo: por el tamaño del fichero (470 MB) es plausible que quepa en GPUs de consumo con 4-8 GB de VRAM, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: onnxruntime (CPU, CoreML, DirectML, CUDA). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pansecho-duality-karaoke-onnx (este) | Mel-Band RoFormer | Separación en instrumental, lead y backing | Apache-2.0 | ONNX fp32 | Conversión del estudiante Duality + KARA 2 |
| musetric/mel-band-roformer-duality-kara2-student | Mel-Band RoFormer | Igual | Apache-2.0 | safetensors | Modelo fuente en PyTorch |
| Aname-Tommy/Mel-Band-Roformer_Duality | Mel-Band RoFormer | Separación de voces e instrumental | Apache-2.0 | safetensors | Modelo profesor del que se destila el estudiante |
| UVR MDX-Net KARA 2 | MDX-Net | Separación lead/backing | MIT | pesos UVR | Fuente de la capacidad de separación de coros |

No se dispone de datos comparativos de rendimiento (SDR, latencia) entre estas alternativas en la información proporcionada, más allá del SDR de voces de 11,24 dB en MUSDB18-HQ del modelo fuente.

## Limitaciones y advertencias

- La separación de coros (backing) es débil: SDR mediano de 0,5 a 1,9 dB en stems reales, según la propia model card. No debe esperarse una separación limpia de coros en producciones complejas.
- El SDR mediano de voces es de 11,24 dB en MUSDB18-HQ, una cifra moderada que implica artefactos audibles en pasajes densos o con reverberación.
- La ventana de inferencia es fija de 11 segundos; canciones completas requieren troceado y recomposición con solapamiento, lo que puede introducir discontinuidades si no se gestiona con cuidado.
- El modelo está entrenado exclusivamente con música bajo licencias CC BY, CC0 y Public Domain Mark de FMA y ccMixter; su comportamiento en otros géneros o en audio hablado no está documentado.
- No se publican datos sobre sesgos, pero al ser un modelo de separación de audio, los sesgos se manifiestan como degradación diferencial según género musical, idioma del cantante o técnica vocal.
- Licencia Apache-2.0: permite uso comercial, pero exige mantener el aviso de licencia y las atribuciones. El modelo fuente incorpora componentes de UVR (MIT) y de Aname (Apache-2.0), cuyas condiciones deben respetarse en la redistribución.
- El repositorio no incluye variantes cuantizadas ni versiones para otras precisiones; solo fp32.
- No hay información sobre latencia, throughput ni consumo de memoria en producción, lo que dificulta dimensionar despliegues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nilsbc/pansecho-duality-karaoke-onnx
- Modelo fuente: https://huggingface.co/musetric/mel-band-roformer-duality-kara2-student
- Modelo profesor (Duality): https://huggingface.co/Aname-Tommy/Mel-Band-Roformer_Duality
- Ultimate Vocal Remover: https://github.com/Anjok07/ultimatevocalremovergui
- Paper de Mel-Band RoFormer: https://arxiv.org/abs/2310.01809
- Implementación de referencia: https://github.com/lucidrains/BS-RoFormer
