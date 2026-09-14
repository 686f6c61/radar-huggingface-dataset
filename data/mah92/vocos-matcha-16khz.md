# mah92/vocos-matcha-16khz

## Resumen

Vocos Matcha 16 kHz es un vocoder neuronal entrenado por Ali Mahmoudi (@mah92) y publicado en HuggingFace con licencia Apache-2.0. Su función no es generar texto ni razonar, sino convertir espectrogramas mel en forma de onda de audio: recibe 80 bins de log-mel con normalización y escala mel slaney a 16 kHz y devuelve la representación espectral necesaria para reconstruir la señal. Está pensado para emparejarse con modelos acústicos Matcha-TTS en el ecosistema sherpa-onnx.

El modelo se distribuye como un único fichero ONNX exportado en el formato "raw-head" de sherpa-onnx: la red produce las salidas `mag`, `x` e `y`, y la iSTFT se ejecuta fuera del grafo, dentro de sherpa-onnx o de `MatchaTTSInfer` (C++ sobre ONNX Runtime), usando los metadatos de la transformada (n_fft 1024, hop 256, win 1024, ventana hann, centrado y padding reflect).

Su relevancia práctica es doble. Por un lado, permite montar un pipeline TTS completo y offline (persa e inglés) con sherpa-onnx sin depender de infraestructura GPU. Por otro, resuelve un problema habitual de compatibilidad: el Vocos original de gemelo-ai usa mels de estilo htk, que "colapsan" aproximadamente un factor de 50 cuando se alimentan con mels de Matcha; este modelo se ha entrenado explícitamente con la configuración mel slaney del fork langtech-bsc/vocos para evitar ese desajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vocos (vocoder neuronal; cabezal "raw-head" exportado a ONNX: entrada `mels`, salidas `mag`/`x`/`y`; la iSTFT se ejecuta fuera del modelo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesa tramas de mel, no secuencias de tokens) |
| Tipos de cuantizacion | no disponible (se distribuye un unico fichero ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | fa (persa) y en (ingles) segun los tags; el vocoder es agnostico al idioma y hereda el idioma del modelo acustico emparejado |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`vocos-matcha-16khz.onnx`) + configuracion de entrenamiento YAML (`vocos-matcha-16KHz.yaml`) |
| Frecuencia de muestreo | 16000 Hz |
| Numero de bins mel | 80 |
| n_fft / hop_length / win_length | 1024 / 256 / 1024 |
| Ventana y padding | hann, `center=True`, `reflect` |
| Configuracion mel | slaney norm + slaney mel scale, f_min 0, f_max 8000 |
| Framework de entrenamiento | PyTorch Lightning 1.8.6 (segun el YAML incluido) |
| Runtime de inferencia | sherpa-onnx (Python/C++) y `MatchaTTSInfer` sobre ONNX Runtime |

## Arquitectura y entrenamiento

Se trata de un vocoder Vocos autoentrenado por el autor y exportado al formato ONNX de sherpa-onnx. La innovacion relevante no esta en la topologia interna (no se documentan en la model card el numero de capas, dimenson del backbone ni parametros totales), sino en el contrato de entrada/salida: el modelo consume 80 bins de log-mel y emite `mag`, `x` e `y`, dejando la iSTFT a cargo del runtime. Ese diseno "raw-head" es el que permite que sherpa-onnx y `MatchaTTSInfer` reutilicen el vocoder con distintos modelos acusticos Matcha.

El punto critico del entrenamiento es la configuracion mel: se uso el fork `langtech-bsc/vocos@matcha` con normalizacion y escala mel slaney, f_min 0 y f_max 8000. Esto alinea la entrada del vocoder con los mels que emite Matcha-TTS. La propia model card advierte de que los valores por defecto de gemelo-ai/vocos usan htk y, alimentados con mels de Matcha, se produce un colapso de aproximadamente 50x; es decir, mezclar estilos mel rompe el modelo. El corpus de entrenamiento del TTS emparejado es `mah92/Musa-FA_EN-Public-Phone-Audio-Dataset` (audio telefonico publico en persa e ingles); no se especifica el volumen de horas, el numero de tokens de audio ni si hubo etapas de ajuste adicionales (no aplica RLHF/DPO en el sentido de los LLM).

## Capacidades

- Sintesis de forma de onda a partir de espectrogramas mel: convierte 80 bins de log-mel slaney a 16 kHz en audio PCM.
- Integracion directa con sherpa-onnx mediante `OfflineTtsMatchaModelConfig`, con parametros de inferencia `noise_scale`, `length_scale` y `num_threads`.
- Integracion con `MatchaTTSInfer` (C++, ONNX Runtime) pasando `--vocoder-model` y `--sample-rate 16000`.
- Equivalencia numerica con la implementacion PyTorch de referencia: diferencia maxima absoluta inferior a 1e-3.
- Salida con nivel de senal saludable en la verificacion publicada: rms aproximado de 0.067 con el modelo acustico `matcha-fa_en-zahra-16000` en sherpa-onnx 1.13.8.
- Cobertura de persa e ingles a traves del modelo acustico emparejado (el vocoder en si no procesa texto).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada; no es un modelo de lenguaje.

## Casos de uso

- Sintesis de voz offline en persa e ingles: emparejado con un modelo acustico Matcha-TTS que emita mels slaney de 80 bins a 16 kHz, genera audio sin conexion a internet ni servicios externos. Es el caso de uso documentado en la propia model card.
- Despliegue en dispositivos sin GPU: al ser un vocoder ONNX de cabezal ligero, el ejemplo oficial se ejecuta en CPU con `num_threads=4`, lo que habilita integracion en portatiles, Raspberry Pi o dispositivos embebidos con el runtime de sherpa-onnx.
- Asistentes de voz e IVR telefonico: el TTS emparejado se entreno con un corpus de audio telefonico publico, por lo que el pipeline completo encaja en respuestas automaticas y menus de voz en persa e ingles.
- Accesibilidad y lectura de pantalla: conversion de notificaciones, articulos o mensajes a audio en tiempo cuasi real dentro de aplicaciones de escritorio o moviles, usando el vocoder como etapa final del TTS.
- Generacion de contenido hablado a escala: audiolibros, boletines, avisos y resumenes narrados, procesando lotes de texto en un servidor con sherpa-onnx y varios hilos de CPU.
- Migracion de pipelines Matcha existentes: cualquier despliegue que ya emita mels slaney de 80 bins a 16 kHz puede sustituir el vocoder sin reentrenar el modelo acustico, manteniendo la interfaz `mels` en entrada.
- Investigacion y evaluacion de vocoders: sirve como referencia numerica (diferencia inferior a 1e-3 frente a PyTorch) y como candidato en pruebas de escucha comparativas A/B/C frente a otros vocoders.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de lenguaje, no existen resultados de MMLU, HumanEval o GSM8K. La unica evidencia cuantitativa publicada es de verificacion tecnica:

| Prueba | Resultado |
|---|---|
| Diferencia numerica ONNX vs PyTorch | max abs diff < 1e-3 |
| Audio generado con sherpa-onnx 1.13.8 + `matcha-fa_en-zahra-16000` | rms ≈ 0.067 (audio saludable) |
| Prueba de escucha A/B/C (bsc-prev vs este modelo vs k2-fsa vocos-22khz-univ) | calidad equivalente |

## Requisitos de hardware

- VRAM estimada: no disponible. No se documentan requisitos de memoria ni tamano del fichero ONNX.
- GPU recomendadas: no disponibles. El modelo no requiere GPU; el ejemplo oficial funciona en CPU.
- Compatibilidad con GPU de consumo: no documentada de forma explicita, pero un vocoder ONNX de este tipo es candidato natural a ejecutarse en CPU o en GPUs de gama baja mediante ONNX Runtime.
- Opciones de despliegue: sherpa-onnx (Python, C++) y `MatchaTTSInfer` sobre ONNX Runtime. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Parametros de runtime documentados: `num_threads=4`, `noise_scale=1.0`, `length_scale=1.0`, `speed=1.0`.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia de muestreo | Configuracion mel | Licencia | Notas |
|---|---|---|---|---|---|
| mah92/vocos-matcha-16khz | Vocos ONNX (raw-head) | 16 kHz | slaney, 80 bins, f_max 8000 | Apache-2.0 | Disenado para mels de Matcha-TTS en sherpa-onnx |
| k2-fsa vocos-22khz-univ | Vocos | 22 kHz | no disponible | no disponible | Usado como referencia en la prueba de escucha A/B/C del autor; calidad equivalente |
| gemelo-ai/vocos (por defecto) | Vocos | no disponible | htk por defecto | no disponible | Alimentado con mels de Matcha colapsa aproximadamente 50x segun la model card |
| langtech-bsc/vocos@matcha ("bsc-prev") | Vocos (fork) | no disponible | slaney (configuracion de referencia) | no disponible | Usado como referencia A/B/C; calidad equivalente |

No se dispone de datos de parametros totales, contexto ni benchmarks de calidad objetiva (MOS) para ninguno de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del formato de entrada: solo acepta log-mel slaney estandar de 80 bins a 16 kHz (media aproximada de -6). Alimentarlo con mels de 22 kHz o de estilo htk produce resultados invalidos; el autor advierte de un colapso de aproximadamente 50x al mezclar estilos mel.
- No es un sistema TTS completo: convierte mels en audio, pero no procesa texto. Necesita un modelo acustico Matcha-TTS y un frontend de texto a fonemas (por ejemplo, `espeak-ng-data`) para funcionar de extremo a extremo.
- Cobertura linguistica heredada: los idiomas fa y en dependen exclusivamente del modelo acustico emparejado; el vocoder no aporta capacidades multilingues propias.
- Riesgo de artefactos: como todo vocoder neuronal, puede introducir ruido, zumbidos o prosodia imperfecta, especialmente fuera de la distribucion del corpus de entrenamiento (audio telefonico).
- Verificacion limitada: las unicas comprobaciones publicadas son la equivalencia numerica frente a PyTorch, un rms concreto y una prueba de escucha subjetiva A/B/C. No hay MOS, PESQ ni evaluacion objetiva de inteligibilidad.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe retroalimentacion independiente de terceros.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio indican 2026-09-14, lo que resulta inconsistente y puede afectar a la trazabilidad de la version.
- Licencia: Apache-2.0 permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y licencia. No se documentan restricciones adicionales, pero conviene revisar la licencia del modelo acustico emparejado y del corpus de audio, que son componentes independientes.
- Ambiguedad en la atribucion de la arquitectura base: no se detallan en la model card el numero de parametros, el backbone ni el dataset exacto de entrenamiento del vocoder, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mah92/vocos-matcha-16khz
- Repositorio de referencia Vocos: https://github.com/gemelo-ai/vocos
- Fork con configuracion mel de Matcha: https://huggingface.co/langtech-bsc
- Modelo acustico emparejado: https://huggingface.co/mah92/Zahra-FA_EN-16KHz-Matcha-TTS-Model
- Dataset del TTS emparejado: https://huggingface.co/datasets/mah92/Musa-FA_EN-Public-Phone-Audio-Dataset
- sherpa-onnx (runtime de inferencia): https://github.com/k2-fsa/sherpa-onnx
- Ficheros del repositorio: `vocos-matcha-16khz.onnx`, `vocos-matcha-16KHz.yaml`

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los unicos enlaces utiles son los de la model card y los repositorios de referencia citados.
