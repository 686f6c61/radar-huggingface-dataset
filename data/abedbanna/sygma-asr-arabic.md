# abedbanna/Sygma-ASR-Arabic

## Resumen

Sygma ASR Arabic es un metodo de decodificacion para el modelo abierto de reconocimiento de voz `CohereLabs/cohere-transcribe-arabic-07-2026`. No es un modelo acustico nuevo: reutiliza intactos los 2,06 B de parametros del modelo de Cohere y anade una capa de decodificacion que reduce el word error rate (WER) medio en los seis conjuntos de test del Open Universal Arabic ASR Leaderboard del 24,16 % al 23,04 %, sin reentrenamiento y sin usar datos de entrenamiento o test del leaderboard para el ajuste.

La contribucion tecnica se concentra en tres piezas: una busqueda por haces de 8 candidatos con un extra por numero de palabras (beta = 1,0, penalizacion de longitud 0) que corrige el sesgo de la busqueda por haces hacia hipotesis cortas que pierden palabras; un detector de hipotesis degeneradas sin referencia que descarta bucles de palabras y secuencias de simbolos como `____` o `****`; y una decodificacion por fragmentos para clips de mas de 35 segundos empleando la propia rutina de transcripcion del modelo base.

Es relevante ahora porque demuestra que, en arabe dialectal, una parte apreciable de la mejora de WER puede obtenerse solo en la fase de decodificacion sobre un modelo base ya publicado bajo Apache-2.0, con un coste de integracion bajo y sin reentrenar. El ajuste de beta se hizo unicamente sobre audio saudí fuera de test (600 clips de `ahmedsamirtarjama/youtube_najdi` mas 8 clips de `HuggingPanda/Saudi_Podcasts_ASR`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer de ASR (modelo acustico Cohere); Sygma aporta la decodificacion |
| Parametros totales | 2,06 B (modelo acustico base, sin cambios) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por fragmentos; decodificacion por chunks para clips > 35 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (`ar`), incluido arabe dialectal y saudí (najdi) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio aporta codigo de decodificacion; los pesos provienen del modelo base Cohere) |

## Arquitectura y entrenamiento

El modelo acustico es el encoder-decoder de Cohere `cohere-transcribe-arabic-07-2026`, con 2,06 B de parametros, usado sin modificar bajo Apache-2.0. Sygma no reentrena ni ajusta los pesos: opera exclusivamente en el decodificador, sustituyendo la decodificacion greedy del modelo base por una busqueda por haces de 8 candidatos con un bonus por numero de palabras (beta = 1,0) y una comprobacion de degeneracion sin referencia. Para clips de mas de 35 segundos aplica decodificacion por fragmentos mediante la rutina de transcripcion del propio modelo base. La unica variable ajustada, beta, se calibro sobre 600 clips de audio saudí no pertenecientes a test.

Los detalles de composicion del dataset de entrenamiento del modelo base (numero de tokens de audio, horas, si hubo RLHF/DPO) no se detallan en la informacion disponible. Si se documenta un intento de rescoring con dos modelos de lenguaje (un KenLM de 4-gramos sobre 23 M de frases najdi y Qwen3-1.7B-Base) que no aporto ganancia tras el ajuste sobre audio no-test, por lo que ninguno se incluye en la configuracion final.

## Capacidades

- Reconocimiento automatico de voz en arabe, con foco en arabe dialectal y saudí (najdi).
- Reduccion del WER mediante decodificacion mejorada: 24,16 % a 23,04 % de media en los seis conjuntos del leaderboard evaluados.
- Deteccion y descarte de hipotesis degeneradas (bucles de palabras y secuencias de simbolos repetidos).
- Decodificacion por fragmentos para clips de audio de mas de 35 segundos.
- Modo opcional `repair=True`: redecodificacion de respaldo cuando las 8 hipotesis son degeneradas (no forma parte de la configuracion evaluada en el benchmark).
- No soporta tool calling, function calling, agentes, vision, audio de entrada multimodal ni generacion de texto general: es exclusivamente un componente de transcripcion de voz.

## Casos de uso

- Transcripcion de audio saudí y dialectal: el metodo esta calibrado con audio najdi y mejora el modelo base en todos los grupos SADA medidos (limpio, ruidoso, con musica, varios hablantes, voces femeninas y masculinas), por lo que es adecuado para contenido conversacional del Golfo.
- Subtitulado de podcasts y YouTube: la decodificacion por fragmentos para clips de mas de 35 s permite procesar episodios completos sin truncar, y el detector de degeneracion evita los bucles de palabras tipicos en audio largo.
- Atencion al cliente en arabe: transcripcion de llamadas y mensajes de voz para su posterior analitica o enrutado; la mejora en condiciones ruidosas (SADA ruidoso: 41,12 a 37,25) reduce el esfuerzo de correccion manual.
- Investigacion linguistica sobre arabe dialectal: al descargar el modelo base y usar solo la decodificacion, se puede comparar sistematicamente el impacto de una estrategia de decodificacion sobre el mismo modelo acustico, sin reentrenar.
- Post-procesado de pipelines de ASR existentes: puede aplicarse como etapa de decodificacion sobre salidas del modelo base Cohere ya desplegado para bajar el WER sin cambiar la infraestructura de inferencia acustica.
- Evaluacion y reproduccion de leaderboards: el repositorio incluye la normalizacion del leaderboard (`eval.py`) y el detalle de cobertura por conjunto (SADA 6.087/6.189 clips, 98,4 %; resto 100 %), util para replicar resultados.
- Transcripcion de contenido con musica de fondo: la mejora especifica en el grupo SADA "background music" (39,20 a 35,60) resulta util para video musical o retransmisiones.
- Generacion de transcripciones para entrenamiento de otros sistemas: el mejor WER reduce el ruido de etiquetado en corpus pseudo-etiquetados en arabe dialectal.

## Benchmarks y rendimiento

WER por conjunto (mismo pipeline, normalizacion del leaderboard, WER a nivel de corpus, en %):

| Test set | Cohere greedy (base) | Sygma ASR Arabic | Audar-ASR-V1-Turbo |
|---|---|---|---|
| SADA | 36,57 | 33,60 | 28,24 |
| Common Voice 18 | 5,41 | 5,26 | 8,13 |
| MASC clean | 16,33 | 15,95 | 17,20 |
| MASC noisy | 25,78 | 25,13 | 28,49 |
| MGB-2 | 15,19 | 13,56 | 12,03 |
| Casablanca | 45,70 | 44,75 | 50,18 |
| Media | 24,16 | 23,04 | 24,05 |

Desglose de SADA sobre los mismos clips:

| Grupo SADA | Cohere greedy | Sygma | Audar-ASR-V1-Turbo |
|---|---|---|---|
| Grabacion limpia | 30,09 | 28,47 | 23,80 |
| Grabacion ruidosa | 41,12 | 37,25 | 31,84 |
| Musica de fondo | 39,20 | 35,60 | 29,42 |
| Varios hablantes | 40,73 | 37,38 | 31,45 |
| Voces femeninas | 33,40 | 29,68 | 24,16 |
| Voces masculinas | 31,07 | 28,92 | 24,50 |

Notas del autor: Audar-ASR-V1-Turbo se ejecuto en el mismo pipeline con su receta de transformers (bf16, greedy, batch 16) y la misma proteccion anti-bucles; sin esa proteccion promedia 26,37. Su media oficial en el leaderboard es 23,17. En conjuntos sin bucles el pipeline reproduce sus puntuaciones oficiales con una desviacion de hasta 0,5 WER; en Casablanca (50,18 frente a 47,02 oficial) y MGB-2 (12,03 frente a 11,08 oficial) quedan por encima. El propio autor indica que estas cifras no son numeros oficiales del leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del tamano de 2,06 B, aproximadamente 4,1 GB en bf16, 2,1 GB en int8 y 1,1 GB en int4 para los pesos (calculo derivado del numero de parametros; la model card no publica cifras de VRAM).
- La busqueda por haces de 8 candidatos consume mas memoria y computo que la decodificacion greedy del modelo base; el autor senala que la busqueda por haces es varias veces mas lenta que greedy.
- GPU recomendadas: el codigo usa `device="cuda"`; por tamano de modelo cabe en GPUs de consumo (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090) y en GPUs de centro de datos (A100, H100). No se especifican modelos concretos validados.
- Despliegue: la unica ruta documentada es `transformers==4.57.6` junto con `torch`, `soundfile`, `librosa`, `huggingface_hub` y `sentencepiece`, a traves del paquete `sygma_asr` (`SygmaASR(device="cuda")`). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, ni existen pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER medio (SADA/CV18/MASC/MGB-2/Casablanca) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sygma ASR Arabic (decodificacion sobre Cohere) | 2,06 B (base) | no disponible | 23,04 % | Apache-2.0 | HuggingFace `abedbanna/Sygma-ASR-Arabic` |
| Cohere Transcribe Arabic (base, greedy) | 2,06 B | no disponible | 24,16 % | Apache-2.0 | HuggingFace `CohereLabs/cohere-transcribe-arabic-07-2026` |
| Audar-ASR-V1-Turbo | no disponible | no disponible | 23,17 % oficial (24,05 % en el pipeline del autor) | no disponible | leaderboard Open Universal Arabic ASR |

Diferencias clave: Sygma reutiliza el modelo base de Cohere y solo aporta decodificacion, por lo que su licencia y disponibilidad son las del modelo base mas el codigo de decodificacion. Audar-ASR-V1-Turbo supera a Sygma en habla saudí (SADA 28,24 frente a 33,60) y en MGB-2, mientras que Sygma es mejor en Casablanca, MASC y Common Voice 18. Los datos de parametros, contexto y licencia de Audar no se detallan en la informacion disponible.

## Limitaciones y advertencias

- En habla saudí, Audar-ASR-V1-Turbo es claramente mejor en todas las condiciones medidas; Sygma no mejora el reconocimiento acustico del modelo base, solo la decodificacion.
- En clips muy cortos (menos de 5 segundos) el bonus por numero de palabras puede sobre-generar texto.
- Cuando las 8 hipotesis entran en bucle, puede persistir un bucle residual (16 de 6.087 clips de SADA).
- Hereda alucinaciones raras de estilo subtitulo del modelo base (por ejemplo, "اشتركوا بالقناة").
- La busqueda por haces es varias veces mas lenta que la decodificacion greedy.
- Los rescoring con KenLM de 4-gramos y Qwen3-1.7B-Base no aportaron ganancia; su uso no esta soportado por la configuracion publicada.
- Las cifras del autor no son numeros oficiales del leaderboard y se obtuvieron con un mirror publico de los conjuntos de test (SADA con 98,4 % de clips emparejados).
- Uso comercial permitido bajo Apache-2.0; el modelo base es copyright de Cohere y el repositorio no implica respaldo de Cohere. Debe respetarse el `NOTICE`.
- No hay cifras publicadas de cuantizacion, VRAM concreta, latencia ni throughput, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abedbanna/Sygma-ASR-Arabic
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Open Universal Arabic ASR Leaderboard: https://huggingface.co/spaces/elmresearchcenter/open_universal_arabic_asr_leaderboard
- Dataset de ajuste (audio najdi): https://huggingface.co/datasets/ahmedsamirtarjama/youtube_najdi
- Dataset Saudi Podcasts ASR: https://huggingface.co/datasets/HuggingPanda/Saudi_Podcasts_ASR
