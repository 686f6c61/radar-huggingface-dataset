# Inomjonov/tiny-voca-english-reproduction

## Resumen

tiny-voca english reproduction es un modelo de síntesis de voz (text-to-speech) en inglés, desarrollado por el usuario Inomjonov como reproducción independiente del experimento tiny-voca de Muhammed Nazeem. El modelo parte de inicialización aleatoria y entrena pesos nuevos sobre el código y el dataset liberados por el autor original, con el objetivo de validar que el flujo de entrenamiento upstream es reproducible en un entorno local sin infraestructura especializada. Cuenta con 4.537.291 parámetros y genera audio mono a 24 kHz.

La relevancia del modelo es su tamaño extremadamente reducido: con poco más de cuatro millones de parámetros puede ejecutarse en CPU con latencias de decenas de milisegundos, lo que lo sitúa en la categoría de TTS ligero para sistemas embebidos, aplicaciones de escritorio y prototipado rápido. El entrenamiento completo se realizó en una única RTX 4090 en aproximadamente 6 horas y 21 minutos, lo que demuestra que el ciclo completo de entrenamiento es asequible para un desarrollador individual.

El modelo ofrece dos voces en inglés (F2, femenina, y M2, masculina) y se distribuye con licencia Apache 2.0. El checkpoint final corresponde al paso 104.737 y se entrenó sobre 17,595 horas únicas de audio sintético del dataset tiny-voca. No se trata de un modelo de propósito general ni multilingüe: es una reproducción técnica de un experimento concreto, orientada a la verificación y al uso en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (implementación upstream de tiny-voca; no se detalla en la información proporcionada) |
| Parametros totales | 4.537.291 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio PyTorch; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura concreta no se describe en la información disponible; el modelo reutiliza sin cambios el código de entrenamiento upstream de tiny-voca de Muhammed Nazeem, sobre el commit `62e2adef158bc997042cc6234f541f1e0e4cd55d`. El entrenamiento se dividió en dos etapas: la primera cubrió los pasos 0 a 66.000 con 8.186 clips y 10,017 horas de audio usando eSpeak y anotaciones v3; la segunda abarcó los pasos 66.000 a 104.737 con 16.018 clips y un total acumulado de 17,595 horas únicas, empleando el frontend Dizione y anotaciones v4. La validación final fue de 0,744 horas (714 clips) y el conjunto de test de 0,709 horas (594 clips), con duraciones calculadas sobre frames retenidos a hop 256 y 24.000 Hz.

El entrenamiento se ejecutó en una RTX 4090 con PyTorch 2.14.1+cu132, un presupuesto de batch de 9.000 frames con padding y un tamaño máximo de batch de 32. El tiempo total registrado por el trainer fue de 22.838,15 segundos (aproximadamente 6 horas y 21 minutos), excluyendo descarga de datos, preparación del entorno y procesamiento acústico. El autor advierte explícitamente que no se reclamó reproducción bit a bit ni calidad idéntica, porque el entorno software histórico completo no estaba disponible. Los detalles de configuración y procedencia están en `training_recipe.json` y `training_info.json`.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida mono a 24 kHz.
- Dos voces seleccionables: F2 (femenina) y M2 (masculina).
- Conversión de números y expresiones numéricas en habla (fechas, horas, importes), según los ejemplos publicados.
- Generación de audio de duración variable: desde frases cortas hasta párrafos completos.
- Inferencia en CPU sin GPU, con 4 hilos, y también en GPU CUDA.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente TTS.
- No dispone de capacidades multilingües más allá del inglés.
- No se documentan modos especiales como thinking, visión o audio de entrada.

## Casos de uso

- Lectura de notificaciones y alertas en aplicaciones de escritorio: el modelo sintetiza frases cortas en 38-53 ms en CPU con 4 hilos, lo que permite generar avisos de voz en tiempo real sin depender de la nube ni de una GPU.
- Asistentes de voz locales en sistemas embebidos o de gama baja: con 4,5 millones de parámetros y ejecución en CPU, cabe en dispositivos con recursos limitados y mantiene un factor de tiempo real muy por debajo de 1 en frases cortas.
- Prototipado de interfaces conversacionales: permite iterar sobre guiones de voz y probar dos timbres distintos (F2 y M2) sin coste de API ni latencia de red, útil en fases de diseño de producto.
- Accesibilidad en aplicaciones de lectura: conversión de texto a voz para usuarios con discapacidad visual en entornos de escritorio, con generación de párrafos de hasta 12 segundos en 82-86 ms en CPU.
- Generación de locuciones para vídeos y demos técnicas: el modelo produce audio de párrafo en 34-35 ms en GPU (RTX 3060 Ti), lo que agiliza la creación de narraciones para material de documentación o presentaciones internas.
- Pruebas de regresión en pipelines de TTS: al ser una reproducción con pesos y métricas de tiempo publicadas (`benchmark.json`), sirve como referencia para validar cambios en el frontend de texto o en el entorno de inferencia comparando latencias y duraciones de audio.
- Investigación sobre reproducibilidad en modelos de voz pequeños: el repositorio documenta receta, dataset fijado por commit y procedencia, lo que facilita estudios sobre variabilidad de entrenamiento y calidad en modelos de menos de 5 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MOS, MCD, WER) en la información disponible. Los únicos datos de rendimiento son mediciones de latencia de inferencia en una máquina concreta (Intel Core i7-10700KF a 3,80 GHz con 4 hilos de CPU y NVIDIA GeForce RTX 3060 Ti), con PyTorch 2.8.0+cu128, float32, TF32 desactivado, batch size 1, semilla 42, 3 calentamientos y 20 repeticiones cronometradas; se reportan medianas.

| Texto | Voz | Duración del audio | Generación en CPU (4 hilos) | Generación en GPU |
|---|---|---:|---:|---:|
| Corto | F2 | 4,704 s | 53,5 ms | 22,9 ms |
| Corto | M2 | 4,277 s | 38,8 ms | 22,3 ms |
| Números | F2 | 6,592 s | 47,0 ms | 23,0 ms |
| Números | M2 | 5,941 s | 46,7 ms | 23,1 ms |
| Párrafo | F2 | 12,149 s | 85,7 ms | 34,7 ms |
| Párrafo | M2 | 11,200 s | 82,7 ms | 34,2 ms |

Las mediciones cubren el frontend de texto, la síntesis y la forma de onda devuelta en CPU; se sincroniza CUDA antes y después de la medición. Quedan excluidos la carga del modelo, los calentamientos, la codificación WAV, la escritura en disco y la reproducción. Los valores p95, los factores de tiempo real y el desglose individual están en `benchmark.json`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 4,5 millones de parámetros en float32 el peso de los parámetros ronda los 18 MB, por lo que la huella es mínima, pero no se publica una cifra oficial de VRAM.
- GPU recomendadas: el autor midió inferencia en una RTX 3060 Ti; el entrenamiento se hizo en una RTX 4090. Cualquier GPU CUDA con suficiente memoria para el modelo y el batch es suficiente; no se especifican mínimos.
- CPU: funciona en Intel Core i7-10700KF con 4 hilos; no se documentan requisitos mínimos de CPU.
- Cabe en GPU de consumo: sí, según la evidencia de la RTX 3060 Ti; también se ejecuta íntegramente en CPU.
- Opciones de despliegue: el repositorio usa PyTorch (2.8.0+cu128 en inferencia, 2.14.1+cu132 en entrenamiento) e incluye `benchmark.py` para reproducir las mediciones. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: medianas de 22,3-34,7 ms en GPU y 38,8-85,7 ms en CPU para audios de 4,3 a 12,1 segundos; el factor de tiempo real es muy inferior a 1 en todos los casos medidos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría (TTS ligero). Como referencia cualitativa, el propio modelo se define como reproducción del tiny-voca original de Muhammed Nazeem, que comparte arquitectura y dataset, pero no se publican métricas comparativas entre ambos.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-voca english reproduction (este) | 4.537.291 | no disponible | en | Apache 2.0 | Hugging Face |
| tiny-voca original (Nazeem) | no disponible | no disponible | no disponible | no disponible | código y dataset publicados por el autor |
| Otras alternativas TTS ligeras | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües documentadas.
- El modelo se entrenó exclusivamente con audio sintético del dataset tiny-voca, lo que puede limitar la naturalidad y la variedad prosódica frente a modelos entrenados con voz humana.
- El autor no reclama reproducción bit a bit ni calidad idéntica al modelo original, debido a diferencias en el entorno software histórico.
- No se han publicado métricas de calidad subjetiva (MOS) ni objetivas (MCD, WER), por lo que la calidad percibida no está cuantificada.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de pronunciación incorrecta en palabras fuera del dominio del dataset sintético, especialmente en nombres propios y términos técnicos.
- Las latencias publicadas provienen de una única máquina y de mediciones en caliente; los arranques en frío, otro hardware y la carga del sistema pueden alterar los tiempos.
- La licencia Apache 2.0 permite uso comercial, pero el crédito de la arquitectura, el código de entrenamiento, el dataset sintético, las alineaciones y el frontend Dizione corresponde a Muhammed Nazeem, según indica el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos podrían no estar completamente alojados o que el repositorio es muy reciente; conviene verificar la disponibilidad de los archivos antes de integrarlo en producción.
- No se documentan formatos de cuantización ni pesos en GGUF, lo que limita su uso con runtimes de inferencia ligeros distintos de PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Inomjonov/tiny-voca-english-reproduction
- Dataset tiny-voca: https://huggingface.co/datasets/n4ze3m/tiny-voca
- Publicación original de Muhammed Nazeem sobre tiny-voca: https://x.com/n4ze3m/status/2121799813679419515
- Repositorio upstream de tiny-voca (GitHub): https://github.com/n4ze3m/tiny-voca
- Ejemplos de audio corto (F2, CPU): https://huggingface.co/Inomjonov/tiny-voca-english-reproduction/resolve/main/examples/short_f2_cpu.wav
- Ejemplos de audio corto (F2, GPU): https://huggingface.co/Inomjonov/tiny-voca-english-reproduction/resolve/main/examples/short_f2_cuda.wav
- Ejemplos de audio corto (M2, CPU): https://huggingface.co/Inomjonov/tiny-voca-english-reproduction/resolve/main/examples/short_m2_cpu.wav
- Ejemplos de audio corto (M2, GPU): https://huggingface.co/Inomjonov/tiny-voca-english-reproduction/resolve/main/examples/short_m2_cuda.wav
- Ejemplos de números (F2, CPU): https://huggingface.co/Inomjonov/tiny-voca-english-reproduction/resolve/main/examples/numbers_f2_cpu.wav
- Ejemplos de números (F2, GPU): https://huggingface.co/Inomjonov/tiny-voca-english-reproduction/resolve/main/examples/numbers_f2_cuda.wav
- Ejemplos de números (M2, CPU): https://huggingface.co/Inomjonov/tiny-voca-english-reproduction/resolve/main/examples/numbers_m2_cpu.wav
- Ejemplos de números (M2, GPU): https://huggingface.co/Inomjonov/tiny-voca-english-reproduction/resolve/main/examples/numbers_m2_cuda.wav
