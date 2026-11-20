# nzxyin/sparc-wavenext-24k

## Resumen

sparc-wavenext-24k es un modelo de audio publicado por el usuario nzxyin en Hugging Face. Por sus etiquetas (audio, speech, vocoder, articulatory, sparc) y su nombre, se trata de un vocoder neuronal orientado a la sintesis de voz a partir de representaciones articulatorias, probablemente integrado en el ecosistema SPARC (un framework de sintesis de habla controlable mediante rasgos articulatorios). El modelo convierte representaciones de tracto vocal o parametros articulatorios en forma de onda de audio, en lugar de partir de texto o de tokens discretos.

Con 15.132.154 parametros (unos 15,1 millones), es un modelo muy compacto: aproximadamente dos ordenes de magnitud por debajo de los vocoders neuronales convencionales de gran tamano. Esta escala reducida sugiere un diseno pensado para inferencia rapida y despliegue en CPU o GPUs de gama baja, aunque a costa de fidelidad en la sintesis. El sufijo "24k" apunta a una frecuencia de muestreo de salida de 24 kHz.

El modelo esta entrenado sobre el dataset LibriTTS-R filtrado (parler-tts/libritts_r_filtered), lo que indica un dominio de habla inglesa leida de calidad. Su licencia es MIT, pero el acceso al repositorio esta restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo. Es relevante para investigadores que trabajen en sintesis articulatoria, vocoders ligeros o pipelines de habla controlable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como vocoder; probablemente red neuronal convolucional o hibrida para sintesis de forma de onda) |
| Parametros totales | 15.132.154 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

No se dispone de documentacion tecnica publica sobre la arquitectura interna del modelo en la informacion proporcionada. Las etiquetas indican que se trata de un vocoder para audio y habla, con enfasis en representaciones articulatorias ("articulatory", "sparc"). El tamano de 15,1 millones de parametros es coherente con un vocoder ligero, posiblemente basado en convoluciones o en un generador de forma de onda de tipo HiFi-GAN reducido, aunque esta hipotesis no puede confirmarse con los datos disponibles.

El entrenamiento se realizo sobre el dataset parler-tts/libritts_r_filtered, una version filtrada de LibriTTS-R (habla inglesa leida, 24 kHz, con limpieza de ruido). No se especifican el numero de tokens de audio, la composicion exacta del dataset, ni si hubo etapas de ajuste fino con objetivos perceptuales (por ejemplo, perdidas adversarias o de STFT). Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal; al ser un vocoder, estas tecnicas no aplican de forma directa.

## Capacidades

- Sintesis de forma de onda de audio a partir de representaciones articulatorias o acusticas intermedias.
- Generacion de habla en ingles a 24 kHz (segun el sufijo del nombre del modelo).
- Integracion en pipelines de sintesis de voz controlable (SPARC), donde el control se ejerce sobre parametros del tracto vocal.
- Modelo de audio, no de texto: no realiza generacion de lenguaje, razonamiento ni codigo.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- Capacidades multilingues limitadas al ingles.
- No se documentan modos especiales como thinking mode, vision o audio de entrada.

## Casos de uso

- Investigacion en sintesis articulatoria: el modelo puede emplearse como etapa final de un pipeline SPARC que transforme trayectorias de articuladores en audio, permitiendo experimentar con control fonetico fino.
- Vocoder ligero para prototipos: con 15,1 millones de parametros, es adecuado para entornos de desarrollo con recursos limitados, donde un vocoder grande no es viable.
- Generacion de habla en tiempo real en CPU: su tamano reducido permite explorar inferencia de baja latencia en dispositivos sin GPU dedicada.
- Educacion y docencia: util para demostrar el funcionamiento de un vocoder y la relacion entre representaciones articulatorias y forma de onda en cursos de procesamiento de habla.
- Evaluacion comparativa de vocoders: sirve como linea base de bajo coste frente a vocoders de mayor tamano en estudios de calidad perceptual.
- Reproduccion de experimentos academicos: al estar entrenado sobre LibriTTS-R filtrado, facilita la comparacion con otros sistemas entrenados en el mismo corpus.
- Integracion en herramientas de accesibilidad experimental: para generar voz sintetica controlable en ingles en aplicaciones de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (15,1 millones de parametros ocupan unos 60 MB en FP32 y unos 30 MB en FP16), mas el overhead de activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100. La eleccion depende mas del throughput deseado que de la memoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors, puede cargarse con PyTorch directamente. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje; llama.cpp podria requerir conversion a GGUF no documentada).
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera una latencia baja en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia de muestreo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sparc-wavenext-24k | 15,1 M | 24 kHz (segun nombre) | Representaciones articulatorias (no confirmado) | MIT | Gated en Hugging Face |
| HiFi-GAN (referencia) | ~13-14 M (variante V1) | 22,05 kHz | Mel-espectrograma | MIT | Publico |
| Parallel WaveGAN | ~1,4 M | 24 kHz | Mel-espectrograma | MIT | Publico |
| Vocoder de LibriTTS-R (generico) | no disponible | 24 kHz | Mel-espectrograma | variable | variable |

La comparacion es aproximada: no se dispone de datos de rendimiento del modelo evaluado, por lo que la tabla solo contrasta parametros y licencia. HiFi-GAN y Parallel WaveGAN son referencias habituales de vocoders ligeros, pero sus entradas son mel-espectrogramas, no representaciones articulatorias.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de su descarga.
- Documentacion escasa: no hay model card detallada, paper ni resultados de evaluacion publicados en la informacion disponible.
- Dominio limitado: entrenado sobre LibriTTS-R filtrado (habla inglesa leida), por lo que su generalizacion a otros idiomas, acentos o condiciones acusticas es incierta.
- Riesgo de artefactos: los vocoders pequenos pueden generar ruido, zumbidos o inestabilidades en fonemas dificiles; no se documenta su robustez.
- Sin soporte de texto: no es un modelo de lenguaje; no debe emplearse para tareas de generacion textual, razonamiento o codigo.
- Licencia MIT: permite uso comercial, pero el acceso gated puede imponer condiciones adicionales que deben revisarse antes de su uso en produccion.
- Sin garantias de calidad perceptual: no se han publicado metricas MOS, PESQ ni STOI en la informacion disponible.
- Fecha de creacion futura (2026-11-19): conviene verificar la autenticidad y vigencia del repositorio antes de integrarlo en flujos de trabajo.

## Enlaces

- Hugging Face: https://huggingface.co/nzxyin/sparc-wavenext-24k
- Dataset de entrenamiento: https://huggingface.co/datasets/parler-tts/libritts_r_filtered
