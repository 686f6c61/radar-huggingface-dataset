# oguzeldereli/ttf-VoxCPM2

## Resumen
ttf-VoxCPM2 es una conversión ternaria (1.58-bit) del modelo de síntesis de voz VoxCPM2 de OpenBMB, publicada por el usuario oguzeldereli. El modelo base es un TTS zero-shot de aproximadamente 2.000 millones de parámetros que cubre 30 idiomas y sintetiza audio a 48 kHz. La conversión sustituye las capas lineales grandes del LM base, el LM residual, el encoder local y el transformer de difusión por pesos ternarios en {-1, 0, +1} con una escala por fila, más un pequeño adaptador ternario de bajo rango junto a cada matriz.

El resultado se empaqueta en un único fichero de 1,04 GB (frente a los 4,96 GB del modelo base en bf16 con su VAE de audio) y se ejecuta en ttf-home, un runtime propio en C++17 sin Python ni PyTorch, sobre GPU NVIDIA o CPU. La propuesta es relevante porque demuestra que un TTS multilingüe de calidad razonable puede comprimirse unas cinco veces y desplegarse sin el stack de PyTorch, a costa de un incremento moderado del error de transcripción.

La licencia del modelo es Apache-2.0, igual que la del modelo base, pero el runtime ttf-home se distribuye bajo PolyForm Noncommercial 1.0.0, lo que condiciona el uso comercial del conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en LM base + LM residual + encoder local + transformer de difusion (VoxCPM2), con capas lineales ternarias y adaptadores ternarios de bajo rango |
| Parametros totales | Aproximadamente 2.000 millones (heredados del modelo base); el fichero empaquetado ocupa 1,04 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria 1.58-bit (pesos en {-1, 0, +1} con escala por fila), embeddings en 4-bit, activaciones con cuantizador int8 por token; resto en bf16 |
| Idiomas soportados | 30: zh, en, ar, my, da, nl, fi, fr, de, el, he, hi, id, it, ja, km, ko, lo, ms, no, pl, pt, ru, es, sw, sv, tl, th, tr, vi |
| Licencia | Apache-2.0 (modelo); runtime ttf-home bajo PolyForm Noncommercial 1.0.0 |
| Formato de pesos | `.ttf` (pesos ternarios empaquetados 5 por byte, bf16 en el resto), con los grafos del modelo incluidos |

## Arquitectura y entrenamiento
El modelo base VoxCPM2 combina un LM base, un LM residual, un encoder local y un transformer de difusión que genera el audio a 48 kHz. La conversión aplica ttf-conversion a 60 matrices lineales de esos cuatro componentes, convirtiéndolas a ternario con escala por fila y añadiendo un adaptador ternario de bajo rango de rango aproximado de una décima parte del ancho de la capa; los embeddings se codifican en 4 bits. Se incorporan rotaciones ortogonales plegadas en los pesos para que la inferencia no requiera operaciones adicionales.

La recuperación de calidad se hizo con TTF durante 3.000 pasos sobre voz multilingüe (inglés 35 %, chino 35 %, y aproximadamente 1 % por cada uno de los otros 28 idiomas). TTF actualiza directamente los pesos ternarios, sin pesos maestros en precisión completa ni estados de Adam. Permanecen en coma flotante el VAE de audio, las normas, las escalas de fila y de entrada, y los parámetros de grupo del embedding de 4 bits. Antes de cada producto ternario, las activaciones pasan por un cuantizador int8 por token, igual que en el entrenamiento.

## Capacidades
- Síntesis de voz zero-shot: la voz procede del propio modelo, sin audio de referencia.
- Síntesis multilingüe en 30 idiomas, con salida de audio a 48 kHz.
- Procesamiento por lotes mediante un fichero TSV (`--list jobs.tsv`) con una línea por trabajo (salida, texto y semilla opcional).
- Control del muestreador de difusión mediante `--timesteps` y `--cfg`, y de la semilla con `--seed`.
- Regeneración de respuestas desbocadas con `--retry-badcase`, equivalente al `retry_badcase` de VoxCPM2.
- Ejecución en CPU o GPU CUDA seleccionable con `--device`, y modo verboso con `-v` para medir tiempos.
- Clonación de voz desde un clip de referencia: disponible en el modelo (ruta de prompt-audio en PyTorch), pero no implementada aún en el runtime ttf-home.

## Casos de uso
- Generación de audiolibros y contenido narrado: el modelo sintetiza texto largo en 30 idiomas sin necesidad de referencia de voz, y el procesamiento por lotes vía TSV permite encolar capítulos completos en una sola ejecución.
- Locución para vídeo y pódcast: con un factor de tiempo real de 0,39 en una RTX 4080 Laptop, se generan 3 segundos de habla en 1,2 segundos, lo que permite iterar guiones con rapidez.
- Síntesis en el dispositivo o en servidores sin GPU: el runtime funciona en CPU sin Python ni PyTorch, útil para entornos embebidos o contenedores mínimos.
- Prototipado de asistentes de voz multilingües: la cobertura de 30 idiomas permite probar flujos de conversación en mercados distintos con un único artefacto de 1,04 GB.
- Generación de avisos y mensajes automatizados: la API de línea de comandos con salida WAV facilita integrar la síntesis en scripts de CI/CD o tareas programadas.
- Evaluación de técnicas de cuantización extrema: sirve como referencia práctica para medir el coste en calidad (CER) de llevar un TTS a pesos ternarios frente al modelo en precisión completa.
- Accesibilidad: conversión de texto a voz para lectura de documentos, con la ventaja de un despliegue ligero en hardware modesto.

## Benchmarks y rendimiento

Calidad zero-shot sobre FLEURS (30 idiomas, 8 frases de desarrollo por idioma, transcripción con Whisper-large-v3 forzando el idioma, tasa de error de carácter). La media y la mediana se calculan sobre 27 idiomas, excluyendo km, lo y my, que fallan también en el modelo en precisión completa:

| Modelo | CER mediana | CER media |
|---|---|---|
| VoxCPM2 (precisión completa, PyTorch) | 0,031 | 0,061 |
| ttf-VoxCPM2 (PyTorch) | 0,074 | 0,086 |
| ttf-VoxCPM2 (fichero .ttf en ttf-home) | 0,086 | 0,098 |

Por idioma, las menores pérdidas frente a precisión completa se dan en zh, pl, de, ru, it y el (dentro de 0,02); las mayores en da (+0,16), nb, he, sw, ar, fr y tr (+0,07 a +0,08). La diferencia entre el runtime y PyTorch no supera la variación entre dos semillas del propio runtime (mediana por idioma de aproximadamente 0,015).

Clonación de voz (ruta prompt-audio del modelo base en PyTorch; 100 elementos en inglés y en chino; transcripción con Whisper; similitud de hablante con WavLM, donde dos grabaciones reales del mismo hablante puntúan 0,943):

| Modelo | WER en | Similitud de hablante | CER zh |
|---|---|---|---|
| VoxCPM2 (precisión completa) | 2,56 % | 0,959 | 3,24 % |
| ttf-VoxCPM2 | 3,22 % | 0,951 | 5,76 % |

Velocidad (factor de tiempo real = tiempo de generación / duración del audio; menor es más rápido):

| Dispositivo | Factor de tiempo real |
|---|---|
| RTX 4080 Laptop (12 GB) | 0,39 (3,0 s de habla en 1,2 s) |
| RTX 3090 Ti (compartida con otro trabajo), 240 frases, 1.850 s de habla | 0,45 |

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; el fichero de pesos ocupa 1,04 GB y el modelo base ronda los 2.000 millones de parámetros, por lo que la huella en GPU es muy inferior a la del modelo en bf16 (4,96 GB).
- GPU recomendadas: se han publicado medidas en RTX 4080 Laptop (12 GB) y RTX 3090 Ti; el runtime compila con `-DGGML_CUDA=ON` para cualquier GPU compatible con CUDA.
- Cabe en GPU de consumo: sí, con 12 GB medidos en una RTX 4080 Laptop; también funciona en CPU con `-DGGML_CUDA=OFF`.
- Opciones de despliegue: runtime propio ttf-home (C++17, compilado con CMake, sin Python ni PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: factor de tiempo real de 0,39 en RTX 4080 Laptop y 0,45 en RTX 3090 Ti compartida; no se publican cifras de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (CER mediana FLEURS, 27 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ttf-VoxCPM2 | ~2.000 M (ternario, 1,04 GB) | No disponible | 0,086 (runtime) / 0,074 (PyTorch) | Apache-2.0 (runtime no comercial) | Hugging Face |
| VoxCPM2 (precisión completa) | ~2.000 M (bf16, 4,96 GB) | No disponible | 0,031 | Apache-2.0 | Hugging Face (openbmb/VoxCPM2) |
| Otros TTS multilingües de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- Pérdida de calidad medible: el CER mediano sube de 0,031 a 0,086 en el runtime, con degradaciones notables en da (+0,16) y en nb, he, sw, ar, fr y tr (+0,07 a +0,08).
- Idiomas problemáticos: km, lo y my presentan CER cercano o superior a 1, también en el modelo en precisión completa, por lo que no son utilizables en la práctica.
- Clonación de voz no disponible en el runtime: solo existe en la ruta PyTorch del modelo base; ttf-home genera únicamente voces zero-shot.
- Licencia del runtime: ttf-home usa PolyForm Noncommercial 1.0.0, de modo que un uso comercial requiere revisar las condiciones aunque los pesos del modelo sean Apache-2.0.
- Dependencia de un runtime propio: no hay soporte documentado para ecosistemas estándar (llama.cpp, vLLM, TGI), lo que limita la portabilidad.
- Riesgo de alucinación y respuestas desbocadas: el propio autor incluye la opción `--retry-badcase` para regenerar salidas que se descontrolan, señal de que el problema persiste.
- Sesgos: no se documentan análisis de sesgo por idioma, género o acento; la recuperación se entrenó con un 70 % del corpus en inglés y chino, lo que puede penalizar la calidad relativa del resto.
- Variabilidad por semilla: la diferencia entre semillas del runtime es del orden de 0,015 de mediana por idioma, relevante para evaluaciones reproducibles.
- Fecha de publicación reciente (noviembre de 2026) y cero descargas registradas en Hugging Face, sin validación externa independiente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/oguzeldereli/ttf-VoxCPM2
- Modelo base VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Runtime ttf-home: https://github.com/oguzeldereli/ttf-home
- Herramienta de conversión ttf-conversion: https://github.com/oguzeldereli/ttf-conversion
- Entrenamiento ternario TTF: https://github.com/oguzeldereli/ttf-ternary
