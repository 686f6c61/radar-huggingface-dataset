# chiakic/chiaki-vocoder

## Resumen

chiaki-vocoder es un vocoder neuronal de tipo NSF-HiFiGAN desarrollado por chiakic (Chiaki.C, vinculado al voicebank Chiaki) que convierte mel-espectrogramas y curvas de f0 en forma de onda de audio. No es un modelo de lenguaje ni un generador de texto: es un componente de sintesis de voz cantada (singing voice synthesis) pensado para integrarse en el ecosistema DiffSinger / OpenUtau como etapa final del pipeline, transformando la salida del modelo acustico en audio a 44,1 kHz.

El modelo se ha entrenado desde cero (sin pesos preentrenados) sobre el codigo de openvpi/SingingVocoders y emplea un generador HiFiGAN de 14,2 millones de parametros con fuente NSF completa de 8 armonicos. La interfaz sigue el estandar de la comunidad OpenVPI de 44,1 kHz y 128 bins, lo que permite sustituir vocoders comunitarios como pc_nsf_hifigan en cualquier flujo que produzca esos mel-espectrogramas y una curva de f0.

Su relevancia practica reside en que los pesos se publican bajo Apache 2.0, lo que habilita uso comercial, ajuste fino y redistribucion. Incluye checkpoint de generador, checkpoint de fine-tuning con discriminadores, configuracion de OpenUtau y pesos ONNX listos para inferencia. La version actual es 2026.11 y el repositorio ocupa aproximadamente 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NSF-HiFiGAN (generador HiFiGAN con fuente NSF de 8 armonicos) |
| Parametros totales | 14,2 M (generador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; entrada mel [1, T, 128] y f0 [1, T]) |
| Tipos de cuantizacion | no disponible (pesos ONNX float32 y checkpoints de PyTorch) |
| Idiomas soportados | no disponible (no es linguistico; depende del modelo acustico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`chiaki_vocoder_2026.11.onnx`), PyTorch `.ckpt` (generador y fine-tuning) |

Especificaciones adicionales de la interfaz:

| Parametro | Valor |
|---|---|
| Frecuencia de muestreo | 44,1 kHz |
| Hop size | 512 |
| Ventana / FFT | 2048 / 2048 |
| Bins mel | 128 |
| Rango de frecuencias | 40-16.000 Hz |
| Escala mel | slaney |
| Entrada mel | float32 [1, T, 128], magnitud en logaritmo natural |
| Entrada f0 | float32 [1, T], en Hz |
| Salida | float32 [1, T x 512] |
| Discriminadores de entrenamiento | MPD, MSD, MRD, MS-SB-CQTD |

## Arquitectura y entrenamiento

El modelo es un vocoder NSF-HiFiGAN: un generador HiFiGAN de 14,2 M de parametros que recibe un mel-espectrograma de 128 bins junto con una curva de f0 y sintetiza la forma de onda. La fuente NSF (Neural Source Filter) utiliza 8 armonicos para modelar la excitacion periodica, lo que aporta control sobre el tono. Durante el entrenamiento se emplean cuatro discriminadores en multiples escalas y dominios: MPD (multi-period), MSD (multi-scale), MRD (multi-resolution) y MS-SB-CQTD (multi-scale sub-band constant-Q transform), este ultimo adaptado de Amphion.

El entrenamiento se realizo desde cero, sin pesos preentrenados, usando el codigo openvpi/SingingVocoders (MIT, commit a930663). El conjunto de datos suma aproximadamente 36 horas e incluye VocalSet (CC BY 4.0), NIT SONG070 F001 (CC BY 3.0) y grabaciones propias del creador del voicebank, ademas de renders del modelo acustico. El entrenamiento esta orientado mayoritariamente a voz cantada; el habla y las voces masculinas graves no se han probado. El repositorio incluye la configuracion del ultimo estadio de entrenamiento (`finetune/training_config.yaml`) y notas de receta en `NOTES.md`.

## Capacidades

- Sintesis de forma de onda a partir de mel-espectrograma y f0 (vocoder mel + f0 a waveform).
- Generacion de audio a 44,1 kHz con salida de 512 muestras por frame de mel.
- Control de tono mediante la curva de f0 de entrada (soporta tone shift SHFC en OpenUtau).
- Integracion directa con DiffSinger y OpenUtau, tanto como dependencia (`.oudep`) como empaquetado dentro de un voicebank (`dsvocoder/`).
- Compatibilidad de interfaz con vocoders comunitarios OpenVPI de 44,1 kHz y 128 bins, lo que permite intercambiarlo en pipelines existentes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades linguisticas: es un componente puramente acustico.
- No soporta vision ni audio de entrada; solo consume mel y f0.

## Casos de uso

- Produccion musical con DiffSinger: el vocoder se coloca como etapa final del pipeline para convertir los mel-espectrogramas generados por el modelo acustico en audio cantado a 44,1 kHz, sustituyendo a pc_nsf_hifigan cuando se busca una timbrica distinta.
- Voicebanks personalizados en OpenUtau: se empaqueta el `.onnx` y `vocoder.yaml` en `dsvocoder/` del voicebank y se referencia con `vocoder: dsvocoder` en `dsconfig.yaml`, de modo que el voicebank distribuya su propio vocoder sin dependencias externas.
- Doblaje y covers de voz cantada: al aceptar una curva de f0 externa, permite reutilizar una melodia concreta sobre una interpretacion vocal sintetica, util para versiones o adaptaciones.
- Investigacion en sintesis de voz cantada: el checkpoint de fine-tuning con discriminadores y la configuracion de entrenamiento permiten reproducir o adaptar la receta con SingingVocoders (`finetune_ckpt_path`) sobre nuevos datasets.
- Despliegue comercial de herramientas musicales: la licencia Apache 2.0 habilita integrar el vocoder en productos de pago, siempre que se conserven LICENSE y NOTICE.txt.
- Prototipado rapido en ONNX Runtime: el modelo ONNX de 0,5 GB de repositorio puede ejecutarse en entornos con runtime ONNX sin necesidad de PyTorch, facilitando su inclusion en aplicaciones de escritorio o servicios.
- Evaluacion comparativa de vocoders: sirve como referencia adicional en pruebas A/B de calidad de sintesis frente a vocoders comunitarios, dado que comparte la misma interfaz de mel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (tipo MMLU, HumanEval o GSM8K, no aplicables a este modelo) en la informacion disponible. El autor aporta pruebas de escucha ciega A/B frente a OpenVPI pc_nsf_hifigan 2025.02 sobre salida de modelos acusticos DiffSinger:

| Prueba | chiaki_vocoder | pc_nsf_hifigan | Empate |
|---|---|---|---|
| Cancion de test, 3 voicebanks, lineas suaves | 2 | 0 | 0 (2 de 2) |
| Cancion de test, 3 voicebanks, lineas agudas | 2 | 0 | 0 (2 de 2) |
| Cancion de test, 3 voicebanks, lineas de coro | 4 | 2 | 2 |
| Cancion completa exportada de OpenUtau | 8 | 3 | 1 |
| Cancion completa, lineas agudas | 4 | 0 | 0 |
| Tone shift a -4, -7 y +7 semitonos | 1 | 11 | 0 |

Estos datos son recuentos de preferencia en pruebas de escucha, no metricas objetivas de error espectral ni de MOS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 14,2 M de parametros en el generador, el peso de los pesos es del orden de decenas de MB en float32; el consumo dominante sera el buffer de audio para secuencias largas (T frames x 512 muestras). Cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime o PyTorch; no se especifican minimos. Una RTX 3060 o superior es mas que suficiente para inferencia en tiempo real o mas rapido.
- Cabe en GPU consumer: si, con margen amplio, dado el reducido numero de parametros.
- Opciones de despliegue: ONNX Runtime (formato principal), OpenUtau (via `.oudep` o `dsvocoder/`), y PyTorch para fine-tuning con SingingVocoders. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un vocoder.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia / bins | Licencia | Integracion | Notas |
|---|---|---|---|---|---|
| chiaki-vocoder 2026.11 | 14,2 M (generador) | 44,1 kHz / 128 bins | Apache 2.0 | DiffSinger / OpenUtau (ONNX) | Entrenado desde cero; mejor en lineas agudas y coro segun el autor; peor en tone shift |
| OpenVPI pc_nsf_hifigan 2025.02 | no disponible | 44,1 kHz / 128 bins | no disponible en la informacion | DiffSinger / OpenUtau | Referencia de la comunidad; mejor en tone shift y respiraciones segun las pruebas del autor |
| Otros vocoders NSF-HiFiGAN comunitarios OpenVPI | no disponible | 44,1 kHz / 128 bins | no disponible en la informacion | DiffSinger / OpenUtau | Misma interfaz de mel, intercambiables |

No se dispone de datos de parametros, contexto ni rendimiento objetivo de los modelos comparados mas alla de lo indicado.

## Limitaciones y advertencias

- Entrenado mayoritariamente con voz cantada: el habla y las voces masculinas graves no se han probado y su calidad es incierta.
- El tone shift (SHFC) suena menos natural que en pc_nsf_hifigan porque se entreno sin pc_aug; se recomienda no bajar de -7 semitonos. El autor planea un experimento con pc_aug.
- Algunas respiraciones e inhalaciones suenan menos naturales que en pc_nsf_hifigan.
- Solo se ha probado con DiffSinger / OpenUtau; otros usos no estan testeados.
- El modelo acustico debe usar exactamente los mismos ajustes de mel (44,1 kHz, hop 512, ventana y FFT 2048, 128 bins, 40-16.000 Hz, slaney); una discrepancia degradara o rompera la sintesis.
- No se recomienda usar una curva de pitch del propio vocoder.
- Licencia Apache 2.0: permite uso comercial, fine-tuning y redistribucion siempre que se conserven LICENSE y NOTICE.txt. El credito sugerido es "chiaki-vocoder 2026.11 by Chiaki.C (Chiaki voicebank), Apache-2.0".
- Los datasets de entrenamiento tienen licencias propias (VocalSet CC BY 4.0, NIT SONG070 CC BY 3.0) que conviene revisar en NOTICE.txt antes de usos derivados.
- No es un modelo linguistico: no genera texto, no razona y no soporta agentes ni tool calling; cualquier evaluacion debe centrarse en calidad de audio.
- Riesgo de sesgo: al estar entrenado con un conjunto limitado de voces cantadas, puede generalizar peor fuera de esos dominios timbricos.

## Enlaces

- Hugging Face: https://huggingface.co/chiakic/chiaki-vocoder
- Release de OpenUtau (`.oudep`): https://github.com/chiakich/chiaki-vocoder/releases/latest
- Codigo de entrenamiento (openvpi/SingingVocoders, MIT, commit a930663): https://github.com/openvpi/SingingVocoders
- Amphion (discriminador MS-SB-CQTD adaptado, MIT): https://github.com/open-mmlab/Amphion
- OpenUtau: https://github.com/stakira/OpenUtau
- DiffSinger: https://github.com/MoonInTheRiver/DiffSinger
- OpenVPI: https://github.com/openvpi
- Notas de entrenamiento: `NOTES.md` dentro del repositorio de Hugging Face
- Detalles de licencia y creditos: `NOTICE.txt` dentro del repositorio de Hugging Face
