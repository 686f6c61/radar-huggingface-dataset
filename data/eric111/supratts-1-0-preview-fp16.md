# Eric111/SupraTTS-1.0-Preview-FP16

## Resumen

SupraTTS-1.0-Preview es un sistema de síntesis de voz (text-to-speech) en inglés publicado en HuggingFace por el autor Eric111, con licencia MIT y un total de 1.031.754 parámetros según los pesos en safetensors del repositorio. Se presenta como el sucesor de SupraTTS-0.1-Beta, un sistema basado en Glow-TTS más HiFi-GAN de unos 44 M de parámetros, y apuesta por una filosofia distinta: en lugar de priorizar la calidad maxima, busca el mejor equilibrio calidad-por-parametro del campo abierto de TTS, con un modelo 43 veces mas pequeno que su predecesor.

La arquitectura se describe en la model card como un sistema destilado en tres etapas, entrenado para sintetizar audio a 24 kHz con un peso en disco de unos 4 MB en fp32. Su principal argumento es la eficiencia: el autor reporta un factor de tiempo real (RTF) mediano de 0.0118, es decir, unas 85 veces mas rapido que el tiempo real sobre una CPU de escritorio Ryzen 5 3500X, sin necesidad de GPU. Frente a su predecesor, que en la misma maquina se quedaba en 1,9x tiempo real, supone una ventaja de velocidad de aproximadamente 44x.

El modelo es relevante ahora porque el segmento de TTS de muy bajo numero de parametros (por debajo de 2 M) esta creciendo con propuestas como sanoTTS, TinyTTS o Inflect Nano, y este lanzamiento se posiciona de forma explicita en esa frontera de Pareto. Se publica como version "Preview", sin descargas ni valoraciones en el momento de la consulta, y con una model card que incluye comparativas propias contra varios sistemas abiertos medidos con las mismas metricas automaticas (SCOREQ, UTMOS, DNSMOS).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema TTS destilado en tres etapas (detalle de cada etapa no disponible); predecesor basado en Glow-TTS + HiFi-GAN |
| Parametros totales | 1.031.754 (~1,03 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS; no se especifica limite de longitud del texto de entrada) |
| Tipos de cuantizacion | FP16 (variante del nombre del checkpoint); pesos en fp32 en disco; no se documentan otros formatos |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (library_name: pytorch) |
| Frecuencia de muestreo de salida | 24 kHz |
| Tamano en disco (fp32) | ~4 MB |
| Pipeline | text-to-speech |
| Tipo de voz | Monohablante (single-speaker) |

## Arquitectura y entrenamiento

La model card describe el sistema como un pipeline TTS destilado en tres etapas, pero no detalla la topologia concreta de cada etapa, el numero de capas, la dimension del modelo ni el vocoder empleado. Lo que si se explicita es la comparacion con el predecesor: SupraTTS-0.1-Beta combinaba Glow-TTS como modelo acustico (29,6 M de parametros) con HiFi-GAN como vocoder (14 M), sumando unos 43 M; SupraTTS-1.0-Preview sustituye ese diseno por una cadena destilada de 1,03 M, es decir, 1/43 del tamano. La etiqueta "distillation" del repositorio y la expresion "three-stage distilled system" confirman que el entrenamiento se apoya en destilacion, presumiblemente desde modelos docentes de mayor tamano (la tabla comparativa incluye a Kokoro de 82 M y Piper de ~15 M como "large teachers"), aunque el autor no publica el detalle del procedimiento de destilacion ni la identidad exacta de los docentes.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del corpus, ni si hubo etapas de RLHF, DPO o ajuste por preferencias humanas; en un sistema TTS estas etapas no son habituales y no se mencionan en ningun momento. La model card unicamente aporta el protocolo de evaluacion: un conjunto retenido y diverso de 24 frases (`benchmark/eval_sentences.txt`), audio normalizado a RMS 0.05, WER medido con Whisper small como juez y naturalidad medida con los scorers abiertos SCOREQ, DNSMOS y UTMOS. Como innovacion practica destacable, el autor incide en el runtime ligero (Python mas tres paquetes pip) y en el hecho de que la carga de pesos es practicamente instantanea (~4 MB) frente a un checkpoint de ~1,3 GB del predecesor.

## Capacidades

- Sintesis de voz a partir de texto en ingles, con salida de audio a 24 kHz.
- Inferencia en CPU en tiempo real o muy por encima del tiempo real (RTF 0.0118 medido en Ryzen 5 3500X).
- Modelo monohablante: no se documenta soporte de multiples voces ni clonacion de voz.
- Bajo requisito de recursos: pesos de ~4 MB, arranque casi instantaneo.
- Uso desde Python con tres paquetes pip; runtime incluido en el repositorio del autor.
- Capacidades multilingues: no disponibles (solo ingles).
- Tool calling, function calling, agentes, razonamiento multi-paso, vision o audio de entrada: no aplica, es un modelo TTS puro.
- Modo "thinking" o control de prosodia/emocion: no documentado.

## Casos de uso

- Lectura de articulos y documentos en aplicaciones de accesibilidad: el modelo convierte texto en voz a 24 kHz en CPU, sin GPU, lo que permite integrarlo en lectores de pantalla o extensiones de navegador que corren en el equipo del usuario y no en la nube.
- Notificaciones por voz en dispositivos embebidos: con ~4 MB de pesos y RTF de 0.0118, cabe en una Raspberry Pi o en un mini-PC industrial para anuncios de estado en domotica o maquinaria.
- Generacion de audio para prototipos y pruebas de UX: equipos que necesitan voces de relleno para maquetas de interfaces conversacionales pueden sintetizar cientos de frases en segundos sin coste de API.
- Subtitulado y doblaje asistido en ingles: sintesis rapida de narracion para borradores de video o podcasts, dejando la locucion final a un sistema de mayor calidad.
- Test automatizado de pipelines de audio: al ser un modelo pequeno y determinista en coste, sirve para generar fixtures de audio en pruebas de regresion de sistemas ASR o de procesamiento de senal.
- Educacion de idiomas y pronunciation training: generacion de ejemplos de pronunciacion en ingles bajo demanda en aplicaciones de aprendizaje, con la ventaja de que la inferencia ocurre en local.
- Investigacion en destilacion de modelos: referencia reproducible de hasta donde se puede comprimir un pipeline TTS manteniendo inteligibilidad (WER 0.083 con juez Whisper small), util como linea base en experimentos academicos.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre el mismo checkpoint a traves del runtime distribuido, en un conjunto retenido de 24 frases, WER con Whisper small como juez y audio normalizado a RMS 0.05.

| Metrica | SupraTTS-1.0-Preview | SupraTTS-0.1-Beta |
|---|---|---|
| Parametros | 1,03 M | ~43 M (29,6 M acustico + 14 M vocoder) |
| UTMOS | 3,97 | 3,59 ± 0,07 (protocolo propio) |
| SCOREQ (sintetico, NR) | 4,04 | No reportado |
| DNSMOS-OVRL / SIG | 3,44 / 3,64 | No reportado |
| WER (Whisper small) | 0,083 (24 frases) | 3,64 % (20 frases, protocolo propio) |
| Velocidad CPU | 85x tiempo real (RTF 0,011) | 1,9x tiempo real (RTF 0,52) |

| Sistema | RTF mediano | Factor tiempo real | Ventaja |
|---|---:|---:|---:|
| SupraTTS-1.0-Preview | 0,0118 | ~85x | 44x mas rapido |
| SupraTTS-0.1-Beta (runtime propio) | 0,5237 | 1,9x | - |

Advertencia del propio autor: las filas de calidad del predecesor corresponden a su protocolo de evaluacion publicado (10 frases fuera de dominio mas 10 retenidas de LJSpeech, 5 semillas), mientras que las del nuevo modelo usan un protocolo propio de 24 frases; los conjuntos, semillas y material difieren, por lo que la comparacion de calidad es solo direccional. La comparacion de velocidad y el recuento de parametros si son directamente comparables (misma maquina, misma sesion).

## Requisitos de hardware

- VRAM estimada: practicamente nula; el checkpoint en fp32 ocupa ~4 MB, por lo que la inferencia cabe en cualquier GPU consumer con holgura (menos de 100 MB de memoria adicional para buffers).
- GPU recomendadas: no necesarias. El autor solo reporta mediciones en CPU (Ryzen 5 3500X); no se publican cifras en GPU.
- CPU: el escenario objetivo es CPU de escritorio; 85x tiempo real en Ryzen 5 3500X implica aproximadamente 85 segundos de audio por segundo de computo.
- Cabe en consumer GPU y en hardware de gama baja: si, incluida clase Raspberry Pi / mini-PC, aunque no se aportan mediciones en esas plataformas.
- Opciones de despliegue: runtime propio en Python distribuido con el repositorio (tres paquetes pip). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo TTS de este tipo.
- Latencia y throughput: RTF mediano 0,0118 en la maquina de referencia; el arranque es casi inmediato por el tamano del checkpoint. No se publican mediciones de latencia de primera respuesta desglosadas.

## Comparativa con modelos similares

Comparacion con sistemas abiertos de TTS monohablante, mismos scorers (SCOREQ, UTMOS, DNSMOS-SIG) sobre el mismo conjunto de 24 frases segun la tabla publicada por el autor.

| Sistema | Parametros | SCOREQ | UTMOS | DNS-SIG | Licencia |
|---|---:|---:|---:|---:|---|
| SupraTTS-1.0-Preview | 1,03 M | 4,04 | 3,97 | 3,64 | MIT |
| sanoTTS (amy) | 1,46 M | 4,13 | 4,10 | 3,61 | No disponible en la informacion proporcionada |
| TinyTTS | 1,62 M | 3,94 | 3,65 | 3,62 | No disponible |
| Inflect Nano | 4,63 M | 3,81 | 3,65 | 3,58 | No disponible |
| Kitten TTS nano | 15 M | 3,02 | 3,58 | 3,43 | No disponible |
| sanoTTS (heart-nano) | 0,29 M | 2,29 | 2,45 | 3,35 | No disponible |
| Piper (docente grande) | ~15 M | 4,71 | 4,47 | 3,65 | No disponible |
| Kokoro (docente grande) | 82 M | 4,89 | No disponible | No disponible | No disponible |

Lectura: en el segmento por debajo de 2 M de parametros, sanoTTS (amy) obtiene mejor SCOREQ y UTMOS con un 42 % mas de parametros, mientras que SupraTTS-1.0-Preview lidera en DNSMOS-SIG (3,64) y en calidad por millon de parametros (4,04 / 1,03 M = 3,92 frente a 2,83 de sanoTTS amy). Los docentes grandes (Piper ~15x el tamano, Kokoro ~80x) mantienen la corona de calidad absoluta, algo que el autor no reclama cerrar.

## Limitaciones y advertencias

- Solo ingles: no hay soporte multilingue declarado y el comportamiento con texto en castellano no esta documentado.
- Monohablante: no se documenta clonacion de voz, seleccion de hablante ni control de emocion o prosodia.
- Calidad medida con metricas automaticas (SCOREQ, UTMOS, DNSMOS) y juez ASR (Whisper small), no con pruebas de escucha humana formales; los valores pueden no correlacionar con la preferencia subjetiva.
- Conjunto de evaluacion muy pequeno (24 frases) y protocolo propio, distinto del usado con el predecesor; el WER de 0,083 implica un 8,3 % de errores de palabra, que en produccion puede traducirse en palabras mal pronunciadas.
- Es una version "Preview": sin descargas ni valoraciones en el momento de la consulta y sin paper ni documentacion tecnica detallada de arquitectura o datos de entrenamiento.
- Discrepancia de procedencia: la model card hace referencia al repositorio `SupraLabs/SupraTTS-1.0-Preview` y al autor `arthurblg1802`, mientras que la publicacion consultada esta bajo `Eric111/SupraTTS-1.0-Preview-FP16`. Conviene verificar el origen y la integridad de los pesos antes de usarlos en produccion.
- La model card proporcionada esta truncada (la tabla comparativa se corta en la fila de Kokoro), por lo que parte de los datos de comparacion no estan disponibles.
- Licencia MIT: permite uso comercial y modificacion con atribucion y sin garantias; aun asi, verificar derechos sobre los datos de entrenamiento, que no se documentan.
- Riesgo de alucinacion en el sentido TTS: el modelo puede producir pronunciaciones incorrectas o audio degenerado en entradas fuera de distribucion (siglas, numeros, nombres propios, puntuacion atipica).
- No dispone de tool calling, agentes ni razonamiento; cualquier flujo conversacional debe orquestarse con otro modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Eric111/SupraTTS-1.0-Preview-FP16
- Repositorio referenciado en la model card: https://huggingface.co/SupraLabs/SupraTTS-1.0-Preview
- Predecesor, SupraTTS-0.1-Beta: https://huggingface.co/SupraLabs/SupraTTS-0.1-Beta
- Perfil del autor citado en la model card: https://huggingface.co/arthurblg1802
- sanoTTS, fuente de la tabla comparativa: https://huggingface.co/ampixa/sanoTTS
- Muestra de audio: https://huggingface.co/SupraLabs/SupraTTS-1.0-Preview/resolve/main/samples/showcase.wav
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
