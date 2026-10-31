# Infatoshi/phonon-refiner-1.7b

## Resumen

Phonon refiner 1.7B es un modelo de texto afinado por Infatoshi que actúa como componente de corrección de Phonon, una aplicación local de dictado por voz para Mac con Apple Silicon. Su función es muy específica: recibe la transcripción cruda generada por el reconocedor Parakeet TDT 0.6B v2 y la reescribe en el texto que el hablante pretendía decir, corrigiendo palabras mal reconocidas y términos técnicos sin alterar el estilo ni el contenido del hablante. Resuelve así uno de los problemas clásicos de los sistemas de dictado: los errores de reconocimiento de vocabulario técnico, identificadores de código y nombres propios.

El modelo es un fine-tune de LiquidAI/LFM3-1.7B, un modelo de lenguaje de 1.7 mil millones de parámetros de la familia LFM3 de Liquid AI, entrenado mediante un LoRA de rango 16 sobre 78.056 filas generadas a partir de audio público (charlas técnicas de YouTube) y etiquetadas por un modelo profesor local (DeepSeek-V4.1-Flash-1017, con licencia MIT). Es relevante porque demuestra un caso de especialización vertical muy efectivo: con solo 1.7B de parámetros y cuantización a 4 bits, reduce sustancialmente la tasa de error de palabra (WER) frente a su predecesor Gemma 4 E2B y frente al modelo base sin ajustar.

El repositorio distribuye los pesos en dos formatos: GGUF Q4_K_S para el motor nativo de Metal de Phonon (junto con un drafter especulativo DFlash2 de 257 MB) y safetensors MLX en 4/6/8 bits como alternativa de respaldo. Solo está entrenado para inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI), fine-tune LoRA r-16 fusionado |
| Parametros totales | 1.728.801.536 (dato real de safetensors) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_S (embeddings y output head a 4 bits, con matriz de importancia); MLX 4 bits (grupo 64), 6 bits en atención y 8 bits en embeddings (~5,2 bits por peso) |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other") |
| Formato de pesos | GGUF (Q4_K_S) y safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B de Liquid AI y se ajusta mediante un LoRA de rango 16 (tasa de aprendizaje 2e-4, 2 épocas, batch 16), que posteriormente se fusiona en los pesos base y se cuantiza en dos variantes: GGUF Q4_K_S para el motor nativo de Metal y MLX 4 bits con precisión mixta (6 bits en atención, 8 bits en embeddings), aproximadamente 5,2 bits por peso. El repositorio incluye además un drafter especulativo DFlash2 (257 MB en GGUF) para acelerar la generación mediante decodificación especulativa en el motor de Phonon.

Los datos de entrenamiento proceden de 300 vídeos públicos de YouTube (charlas técnicas, tutoriales y cursos) troceados en fragmentos de 5 a 60 segundos que replican la distribución de longitud de dictados reales. Las entradas son transcripciones de Parakeet TDT 0.6B v2 (el mismo reconocedor que usa Phonon en producción) y las salidas objetivo las generó DeepSeek-V4.1-Flash-1017 ejecutado localmente, con verificación manual y filtrado de etiquetas. El conjunto total asciende a 78.056 filas: 35.358 filas etiquetadas por el profesor, 24.698 filas de reparación de términos técnicos (con identificadores partidos, letras deletreadas o palabras homófonas, acompañadas de un vocabulario con el término correcto entre distractores) y 18.000 negativos duros donde el vocabulario es ajeno y no debe modificarse nada. Se realizó una comprobación de fugas sin solapamiento con los conjuntos de evaluación, y se excluyeron los dictados del propio autor, datos de usuarios y vídeos del canal del autor.

## Capacidades

- Postprocesado de transcripciones ASR: reescritura de transcripciones crudas de dictado corrigiendo errores de reconocimiento manteniendo la redacción y el estilo de mayúsculas del hablante.
- Reparación de términos técnicos: corrige identificadores partidos, letras deletreadas y palabras homófonas, apoyándose en una línea de vocabulario opcional en el prompt (Phonon envía entre 30 y 80 términos, ordenados por confianza).
- Discriminación de vocabulario: entrenado con 18.000 negativos duros para no alterar transcripciones cuando el vocabulario proporcionado no es relevante.
- Generación de texto conversacional heredada del modelo base LFM3-1.7B, aunque no es su propósito.
- Pensamiento desactivado: el modelo se usa con `enable_thinking: false` y decodificación greedy.
- No tiene capacidades de visión, audio ni tool calling; su entrada es exclusivamente texto en inglés.

## Casos de uso

- Dictado por voz local en macOS: integrado en Phonon, convierte transcripciones de Parakeet en texto final limpio en tiempo real, todo en local sin APIs externas, adecuado para flujos de escritura por voz en Apple Silicon.
- Corrección de terminología técnica en dictados de programadores: al dictar código o nombres de funciones, el modelo repara identificadores partidos u homófonos usando el vocabulario del usuario como contexto.
- Dictado médico: obtiene un WER de 0,072 en el conjunto de dictado médico del benchmark, lo que lo hace útil para postprocesado de notas clínicas dictadas en inglés.
- Postprocesado en pipelines ASR propios: puede acoplarse tras cualquier reconocedor (idealmente Parakeet TDT 0.6B v2, con el que fue entrenado) para limpiar transcripciones de audio técnico en inglés.
- Sistemas de dictado con vocabulario personalizado: la línea de vocabulario del prompt permite adaptar la corrección al dominio del usuario (nombres propios, jerga, marcas) sin reentrenar.
- Despliegue en dispositivos con recursos limitados: con ~1 GB en Q4_K_S y decodificación especulativa mediante el drafter DFlash2, cabe en portátiles y ofrece baja latencia para uso interactivo.

## Benchmarks y rendimiento

Word error rate tras el normalizador del banco de pruebas (menor es mejor). La entrada es la transcripción de Parakeet más la línea de vocabulario, tal como la envía Phonon. "Diferencia" es este modelo menos Gemma 4 E2B, con intervalo de confianza del 95% mediante bootstrap emparejado (2.000 remuestreos).

| Conjunto | Filas | Este modelo | Gemma 4 E2B | Diferencia [IC 95%] | LFM3-1.7B base |
|---|---:|---:|---:|---|---:|
| Dictados reales A | 580 | 0,118 | 0,169 | -0,051 [-0,055, -0,046] | 0,673 |
| Dictados reales B | 606 | 0,107 | 0,157 | -0,049 [-0,054, -0,045] | 0,642 |
| Dictados reales C | 102 | 0,127 | 0,168 | -0,041 [-0,054, -0,026] | 0,634 |
| Dictado médico | 113 | 0,072 | 0,096 | -0,023 [-0,046, -0,004] | 0,571 |
| Dictado médico, referencias limpias | 112 | 0,062 | 0,067 | -0,005 [-0,029, +0,015] | 0,617 |
| Audio público, held-out (etiquetas ronda 1) | 580 | 0,032 | 0,039 | -0,007 [-0,025, +0,007] | 0,446 |

El README original incluye una fila adicional de audio público held-out con etiquetas de ronda 3 cuyo contenido aparece truncado en la información disponible, por lo que no se reproducen sus valores. No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM / memoria estimada: el GGUF Q4_K_S ocupa 988 MB y el safetensors MLX unos 1,13 GB; con contexto y overhead, aproximadamente 1,5-2 GB de memoria unificada son suficientes para inferencia.
- GPU recomendadas: está diseñado para Apple Silicon (Mac con Metal); el GGUF se ejecuta en el motor nativo de Metal de Phonon y el drafter DFlash2 añade solo 257 MB.
- Consumer GPU: cabe con holgura en cualquier GPU moderna con 4 GB de VRAM o más (por ejemplo RTX 3060 o superiores) vía llama.cpp, aunque la variante MLX está orientada específicamente a Mac.
- Despliegue: motor nativo de Phonon sobre Metal; llama.cpp con los GGUF (pasando `--temp 0` porque los metadatos del GGUF traen `temp 0.1` y el entrenamiento usó decodificación greedy); MLX como ruta de respaldo en Macs donde el motor nativo no esté disponible. No consta soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput: no se publican cifras concretas; el uso de decodificación especulativa con DFlash2 y la cuantización a 4 bits indican que está optimizado para latencia baja en dictado interactivo.
- Parámetros de generación recomendados: greedy (`temp 0`), sin penalización por repetición, límite de salida en `1,5 x tokens de entrada + 32`, y fallback a la transcripción cruda si la salida duplica las palabras de entrada o, con más de 8 palabras, tiene menos del 40% de ellas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | WER dictados reales (A) | Licencia |
|---|---|---|---|---:|---|
| Phonon refiner 1.7B | 1,73B | GGUF Q4_K_S, MLX | Corrección de dictado ASR | 0,118 | LFM Open License v1.0 |
| Gemma 4 E2B (anterior por defecto en Phonon) | no disponible | no disponible | Corrección de dictado ASR | 0,169 | no disponible |
| LFM3-1.7B (base, sin ajustar) | 1,73B | safetensors | Uso general | 0,673 | LFM Open License v1.0 |

Phonon refiner 1.7B supera a Gemma 4 E2B en todos los conjuntos evaluados (diferencia de -0,051 a -0,023 de WER con significación estadística en dictados reales y médicos) siendo de un tamaño comparable, y reduce drásticamente el WER del modelo base (0,673 frente a 0,118).

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado exclusivamente con audio técnico en inglés; no debe esperarse funcionamiento en castellano ni en otros idiomas.
- Dominio específico: está afinado para reescribir transcripciones de dictado con un formato de prompt concreto; usarlo fuera de ese formato degrada la calidad según el propio autor.
- Dependencia del reconocedor: fue entrenado con transcripciones de Parakeet TDT 0.6B v2; acoplarlo a otro ASR puede reducir el rendimiento al cambiar la distribución de errores de entrada.
- Riesgo de alucinación: como todo modelo de lenguaje, puede añadir o alterar contenido; Phonon mitiga esto con límites de longitud y comprobaciones de proporción de palabras, con fallback a la transcripción cruda.
- Licencia LFM Open License v1.0: es una licencia de tipo "other" no estándar; conviene revisar sus términos antes de cualquier uso comercial o redistribución.
- Sesgos: los datos de entrenamiento proceden de charlas técnicas de YouTube, por lo que el modelo está sesgado hacia registro técnico en inglés; no se verificó acústicamente la identidad de los hablantes del corpus.
- Cuantización: el GGUF usa 4 bits con matriz de importancia derivada de los datos de entrenamiento públicos; en dominios muy distintos la calidad de la cuantización podría degradarse.
- El audio de entrenamiento no se redistribuye con los pesos, y las etiquetas fueron generadas por un modelo profesor (DeepSeek-V4.1-Flash-1017), con verificación manual por muestreo, no exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Infatoshi/phonon-refiner-1.7b
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio de la aplicación Phonon: https://github.com/Infatoshi/phonon
