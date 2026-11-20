# nzxyin/sparc-hifigan-24k

## Resumen

sparc-hifigan-24k es un vocoder neuronal de tipo HiFi-GAN adaptado a la arquitectura SPARC (speech articulatory representation coding), desarrollado por el usuario nzxyin y publicado en Hugging Face bajo licencia MIT. Su funcion es convertir representaciones acusticas o articulatorias intermedias en waveforms de audio a 24 kHz, actuando como etapa final de sintesis en pipelines de text-to-speech o de codificacion articulatoria del habla. El modelo tiene 15,2 millones de parametros y un peso de repositorio de aproximadamente 0,1 GB, lo que lo situa en la categoria de vocoders ligeros.

El modelo esta entrenado sobre el dataset `parler-tts/libritts_r_filtered`, una version filtrada de LibriTTS-R, y esta etiquetado exclusivamente para ingles. No se dispone de informacion publica sobre la arquitectura interna detallada, el numero de tokens de entrenamiento ni los resultados de benchmarks. El repositorio esta marcado como gated (acceso restringido), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.

Su relevancia actual reside en el interes creciente por los vocoders condicionados por representaciones articulatorias (frentes, lengua, mandibula) en lugar de mel-espectrogramas, un enfoque que puede mejorar la controlabilidad y la interpretabilidad en sintesis de voz. Al ser un componente de un pipeline mayor y no un modelo generativo de texto, debe evaluarse como pieza de infraestructura de TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HiFi-GAN (generador GAN para sintesis de waveform), adaptado a SPARC |
| Parametros totales | 15.222.298 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un vocoder HiFi-GAN a 24 kHz integrado en el marco SPARC. HiFi-GAN es una arquitectura GAN con generador convolucional y discriminadores multiperiodo y multiescala, disenada para sintetizar waveforms de alta fidelidad a partir de representaciones acusticas comprimidas. La variante SPARC sugiere que la entrada del generador no es un mel-espectrograma convencional, sino una representacion articulatoria o una combinacion de rasgos articulatorios y acusticos; sin embargo, el repositorio no detalla la configuracion exacta de canales de entrada, upsampling ni discriminadores.

El entrenamiento se realizo sobre `parler-tts/libritts_r_filtered`, un corpus de habla inglesa derivado de LibriTTS-R con filtrado de calidad. No se especifican el numero total de horas, el numero de pasos de entrenamiento, la funcion de perdida exacta ni si se aplicaron tecnicas de fine-tuning adicionales. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras innovaciones de inferencia, ya que no aplican a un vocoder convolucional.

## Capacidades

- Sintesis de waveform de audio a 24 kHz a partir de representaciones intermedias del pipeline SPARC.
- Conversion de caracteristicas articulatorias o acusticas en senal de voz inteligible en ingles.
- Integracion como etapa final de un sistema TTS o de un codec articulatorio.
- Inferencia en CPU y GPU gracias a su tamano reducido (15,2 M de parametros).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un componente de audio, no un modelo de lenguaje.
- No dispone de capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision ni audio de entrada; unicamente genera audio.

## Casos de uso

- Sintesis de voz en pipelines TTS de investigacion: el vocoder recibe la representacion articulatoria generada por el modelo SPARC y produce el waveform final a 24 kHz, lo que permite experimentar con control articulatorio sin depender de mel-espectrogramas.
- Prototipado de sistemas de habla personalizada: al ser ligero (15,2 M de parametros) y estar bajo licencia MIT, se puede integrar en prototipos academicos de conversion texto-a-voz en ingles con requisitos de computo modestos.
- Evaluacion de representaciones articulatorias: investigadores que comparan mel-espectrogramas frente a rasgos articulatorios pueden usar este vocoder como linea base para medir inteligibilidad y calidad perceptual (MOS) de cada representacion.
- Generacion de audio para datasets sinteticos: permite aumentar corpus de habla en ingles con muestras sinteticas controladas, util para entrenar o validar otros modelos de reconocimiento o diarizacion.
- Despliegue en entornos con recursos limitados: su tamano de 0,1 GB y sus 15,2 M de parametros permiten ejecutarlo en CPU o en GPUs de gama baja para tareas de sintesis por lotes.
- Educacion y docencia: sirve como ejemplo practico de vocoder GAN condicionado por rasgos articulatorios en cursos de procesamiento de voz, gracias a su licencia permisiva y a su reducido coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (15,2 M de parametros, ~61 MB de pesos) y menos de 0,5 GB en fp16; el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso una GTX 1650 pueden ejecutar el modelo sin problemas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors, se puede cargar con `torch` o `safetensors` directamente; no se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible; al ser un vocoder convolucional ligero, se espera inferencia en tiempo real o superior en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia de muestreo | Licencia | Contexto de uso |
|---|---|---|---|---|
| sparc-hifigan-24k | 15,2 M | 24 kHz | MIT | Vocoder condicionado por representacion articulatoria (SPARC) |
| HiFi-GAN oficial (V1) | ~13,9 M (generador V1) | 22,05 kHz | MIT | Vocoder mel-espectrograma generico |
| Parallel WaveGAN | ~1,4 M | 24 kHz | MIT | Vocoder mel-espectrograma ligero |
| MelGAN | ~4,3 M | 22,05 kHz | MIT | Vocoder mel-espectrograma |

La comparativa se limita a arquitecturas de vocoder de proposito general; no se dispone de datos de rendimiento (MOS, RTF) para sparc-hifigan-24k que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en otros idiomas.
- No hay informacion publica sobre sesgos acusticos, calidad perceptual ni robustez ante voces fuera de dominio (LibriTTS-R es habla de audiolibros en ingles).
- Riesgo de artefactos y alucinaciones acusticas: como todo vocoder GAN, puede generar ruido, zumbidos o inestabilidades en representaciones de entrada fuera de la distribucion de entrenamiento.
- El repositorio esta marcado como gated: es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion a la reproducibilidad.
- No es un modelo autonomo: requiere un front-end SPARC o un extractor de representaciones compatible; sin el, no puede generar audio por si mismo.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; la ausencia de benchmarks y de documentacion tecnica detallada limita su uso en produccion sin validacion previa.
- El numero de descargas (2) y de likes (0) indica que el modelo es muy reciente y no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/nzxyin/sparc-hifigan-24k
- Dataset de entrenamiento: https://huggingface.co/datasets/parler-tts/libritts_r_filtered
