# franckverrot/vovo

## Resumen

Vovo es un modelo de síntesis de voz (text-to-speech) en inglés, de una sola voz, desarrollado por Franck Verrot. Está construido desde cero en Swift con kernels Metal escritos a mano, incluyendo su propio motor de tensores, autograd, optimizador, pipeline de datos y entrenador. El modelo tiene aproximadamente 20 millones de parámetros y fue entrenado sobre el dataset LJSpeech en unos 13 minutos en un Apple M2 Max, lo que lo convierte en un ejemplo extremo de entrenamiento rápido y ligero para TTS.

El modelo sigue una arquitectura inspirada en Matcha-TTS: un codificador de texto basado en un transformer con RoPE, un decodificador DiT con flow-matching y un vocoder Vocos afinado. Se distribuye con pesos en formato safetensors y se puede ejecutar desde Python en Apple Silicon mediante la librería `vovo-mlx`. Su relevancia radica en demostrar que es posible entrenar un TTS funcional con recursos mínimos y en un tiempo récord, aunque con limitaciones claras en calidad y versatilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-shaped: codificador de texto (transformer 6 capas, d=192, RoPE) + decodificador DiT flow-matching (6 capas, d=384, adaLN-zero) + vocoder Vocos (mel-24kHz) |
| Parametros totales | 20.010.953 (20 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa texto largo de forma explícita) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (codigo y pesos) |
| Formato de pesos | safetensors (model.safetensors, vocoder.safetensors, vocoder_base.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de Matcha-TTS. El texto de entrada pasa por un normalizador, un lexicon G2P basado en ipa-dict y se convierte en un inventario de 67 simbolos foneticos. Un prenet convolucional alimenta un transformer de 6 capas con atencion RoPE (dimension 192) que produce una prior mel por fonema y las duraciones logaritmicas. Tras la regulacion de longitud, un decodificador DiT de 6 capas (dimension 384) con normalizacion adaLN-zero realiza flow-matching, muestreado con 16 pasos de Euler y classifier-free guidance de 2 por defecto. El resultado se convierte en audio con un vocoder Vocos afinado sobre las mels predichas.

El entrenamiento se realizo sobre LJSpeech (dominio publico) en aproximadamente 13 minutos en un M2 Max. El alineamiento durante el entrenamiento se obtuvo mediante monotonic alignment search. El optimizador utilizado es Muon para las matrices de pesos. El modelo reporta un word error rate (WER) del 2,1 % en un conjunto de prueba propio de 20 frases, evaluado con el reconocedor on-device de Apple.

## Capacidades

- Generacion de voz en ingles a partir de texto, con una unica voz femenina (la del dataset LJSpeech).
- Sintesis de audio a 24 kHz con convencion mel (n_fft 1024, hop 256, 100 bandas HTK).
- Inferencia rapida en Apple Silicon gracias a la implementacion en Metal y la libreria `vovo-mlx`.
- Soporte de clasificador-free guidance (CFG) para mejorar la calidad de la muestra.
- No soporta tool calling, agentes, vision ni otras modalidades; es exclusivamente TTS.
- Capacidad multilingue: no, solo ingles.
- No dispone de modo de pensamiento (thinking mode) ni streaming.

## Casos de uso

- Prototipado rapido de aplicaciones de voz en ingles: al ser un modelo pequeno y de entrenamiento rapido, permite generar audios de prueba en minutos para validar ideas de productos sin invertir en infraestructura.
- Generacion de audios de demostracion para presentaciones o pitch: se puede sintetizar una frase o parrafo corto y exportarlo a WAV para incluir en demos.
- Lectura de textos cortos en ingles para aplicaciones educativas: por ejemplo, una app de aprendizaje de pronunciacion que muestre la transcripcion fonetica y reproduzca el audio.
- Integracion en pipelines de desarrollo en Mac: gracias a la API Python de `vovo-mlx`, se puede incorporar facilmente en scripts de automatizacion o en entornos de testing.
- Pruebas de accesibilidad: generar audio de forma local para evaluar interfaces de usuario con lectores de pantalla en entornos de desarrollo.
- Generacion de datos de audio sintetico para entrenar otros modelos: aunque la calidad no es de estudio, puede servir para aumentar datasets en tareas de reconocimiento de voz o de conversion de texto a voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque se trata de un modelo TTS. El unico dato de rendimiento disponible es el word error rate (WER) reportado por el autor:

| Metrica | Valor |
|---|---|
| WER en test set propio (20 frases, reconocedor Apple on-device) | 2,1 % |

No hay comparaciones con otros modelos TTS en la informacion proporcionada.

## Requisitos de hardware

- El modelo esta disenado para Apple Silicon (M1, M2, M3 y posteriores) y se ejecuta mediante Metal.
- No se especifica VRAM minima, pero al tener solo 20 M de parametros, cabe en cualquier Mac con Apple Silicon, incluso con memoria unificada de 8 GB.
- La inferencia se realiza con la libreria `vovo-mlx` (Python) o desde Swift con el proyecto `vovo-core`.
- No se mencionan opciones de despliegue en servidores (vLLM, TGI, etc.); el modelo esta pensado para uso local en Mac.
- No se proporcionan datos de latencia o throughput, pero al ser un modelo pequeno, se espera una generacion casi en tiempo real en hardware Apple Silicon.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se puede establecer una comparativa fiable con otros TTS de tamano similar (por ejemplo, VITS, FastSpeech2 o Tacotron2) sin datos objetivos de rendimiento y calidad.

## Limitaciones y advertencias

- Voz unica: solo genera una voz femenina (la de LJSpeech), no permite cambiar de locutor.
- Solo ingles: no soporta otros idiomas.
- Sin streaming: la generacion es offline, no se puede transmitir audio en tiempo real.
- Palabras fuera de vocabulario (OOV): se deletrean por reglas, lo que puede producir pronunciaciones incorrectas.
- Calidad de audio: el autor indica que es "inteligible, no de estudio", por lo que no es adecuado para produccion profesional de audio.
- Entrenamiento muy corto (13 minutos): el modelo puede tener artefactos o inconsistencias en la prosodia.
- Dependencia de Apple Silicon: no se puede ejecutar en GPUs NVIDIA o AMD sin adaptaciones.
- Licencia MIT: permite uso comercial, pero los datos de entrenamiento (LJSpeech) son de dominio publico; el vocoder Vocos es MIT, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/franckverrot/vovo
- Repositorio vovo-core (Swift): https://github.com/franckverrot/vovo-core
- Repositorio vovo-mlx (Python): https://github.com/franckverrot/vovo-mlx
- Perfil del autor en Hugging Face: https://huggingface.co/franckverrot
- Perfil del autor en GitHub: https://github.com/franckverrot
