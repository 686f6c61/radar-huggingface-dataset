# mlx-community/FastFrames-L-bf16-mlx

## Resumen

FastFrames-L es un modelo de generación de vídeo a partir de texto (text-to-video) desarrollado por Apple Machine Learning Research, publicado originalmente como `apple/FastFrames-L`. Este repositorio concreto (`mlx-community/FastFrames-L-bf16-mlx`) es un port no oficial de la comunidad a MLX, el framework de Apple para ejecutar modelos en silicio de Apple (chips M-series). El modelo genera clips de 5 segundos: 81 fotogramas a 832x480 píxeles y 16 fps.

El modelo tiene 14B parámetros y se compone de tres módulos: un generador DiT (Diffusion Transformer), una red de refinamiento de KV y un decodificador de píxeles. La innovación principal es su esquema de generación por roll-out con caché de atención autoregresiva, que permite generar vídeo de forma secuencial latente a latente reutilizando el KV cache, en lugar de procesar todos los fotogramas de golpe.

Es relevante ahora porque demuestra que la generación de vídeo de calidad puede ejecutarse localmente en un Mac de gama alta (M5 Max con 128 GB), sin depender de infraestructura en la nube. El port es estrictamente para investigación científica no comercial, bajo la licencia Apple Machine Learning Research Model License (apple-amlr).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con roll-out autoregresivo, red de refinamiento KV y decodificador de píxeles puenteado |
| Parámetros totales | 14B (según el título del port; desglose por módulo no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.760 tokens en el KV cache de self-attention (40 capas) para un clip de 81 fotogramas |
| Tipos de cuantización | bf16 (único formato publicado en este port); no disponible para otras precisiones |
| Idiomas soportados | no disponible (el prompt de texto se procesa con el tokenizador umT5 de Wan2.1-T2V-1.3B) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License); solo investigación no comercial |
| Formato de pesos | safetensors (DiT, KV refiner y pixel decoder en `fastframes-l/*.safetensors`; text encoder `umt5_xxl.safetensors`) |
| Salida de vídeo | 81 fotogramas, 832x480, 16 fps, 5 segundos |
| Memoria mínima recomendada | 96 GB de RAM unificada en Mac; pico de 60 GiB por clip |
| Framework | MLX (probado con mlx 0.32.4) |
| Tamaño de pesos | 30,6 GB (módulos de Apple) + 11,4 GB (text encoder umT5) |

## Arquitectura y entrenamiento

FastFrames-L se basa en un Diffusion Transformer (DiT) que genera latentes de vídeo de forma autoregresiva mediante un bucle de roll-out. En cada paso se produce un fotograma latente (que corresponde a 4 fotogramas de vídeo: `4N - 3` fotogramas totales para `N` latentes). El modelo mantiene un KV cache de self-attention de 40 capas y 32.760 tokens, lo que explica buena parte del consumo de memoria (25 GiB de los 60 GiB de pico). Dos componentes adicionales completan el pipeline: una `KVRefinementNetwork` que refina el estado latente y un `BridgedPixelDecoder` que convierte los latentes en píxeles RGB.

El port MLX reproduce fielmente los módulos PyTorch de Apple (`CausalWanModel` con `FastOps`, `KVRefinementNetwork`, `BridgedPixelDecoder`, `FlowMatchScheduler`) y valida la equivalencia numérica en fp32: el primer paso del DiT muestra un error L2 relativo de 3,3e-6 en el port plano y 6,4e-6 en la ruta rápida, frente a la implementación de referencia en CPU. El text encoder es umT5-XXL, tomado del port de FastFrames-S y del repositorio Wan2.1-T2V-1.3B. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable es el esquema de roll-out con caché: en lugar de atender a todos los fotogramas simultáneamente, el modelo reutiliza el KV cache de pasos anteriores, de modo que el coste por fotograma latente crece a medida que se llena la caché (de 2,65 s a 4,8 s por latente en el M5 Max). Esto reduce el coste computacional total frente a una atención completa sobre todos los fotogramas.

## Capacidades

- Generación de vídeo a partir de texto: clips de 5 segundos, 81 fotogramas, 832x480 y 16 fps.
- Generación autoregresiva latente a latente con caché de atención, lo que permite clips más largos que la ventana inicial si se ajusta `--frames`.
- Control de semilla para reproducibilidad (los ejemplos del repositorio incluyen el seed junto a cada clip).
- Ejecución por lotes de varios prompts con una sola carga del modelo (`ffmlx/batch.py`).
- Caché de embeddings de texto en disco para evitar recalcular el codificador umT5 de 11 GB en prompts repetidos.
- Compatibilidad con el modelo menor FastFrames-S mediante el flag `--model S`, ejecutándolo de forma bit-idéntica al port original.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.

## Casos de uso

- Previsualización de vídeo en investigación: generar clips de 5 segundos para validar hipótesis sobre modelos de difusión de vídeo sin salir del entorno local de un Mac de gama alta.
- Prototipado de pipelines text-to-video: usar el port MLX como banco de pruebas para estudiar el efecto del número de latentes (`--frames`), la semilla y el prompt en la calidad y coherencia temporal del clip.
- Reproducción de experimentos académicos: al validarse numéricamente contra la implementación PyTorch de Apple (error L2 relativo del orden de 1e-6), sirve para replicar resultados del paper `arXiv:2611.23226` en hardware Apple.
- Generación de material para demostraciones y docencia: crear clips cortos de temática controlada (paisajes, escenas cotidianas) para ilustrar técnicas de difusión en cursos de visión por computador.
- Evaluación comparativa de modelos de vídeo: el repositorio incluye comparaciones S vs L con el mismo prompt y semilla, útiles para estudiar el efecto del escalado de parámetros en la calidad del vídeo generado.
- Investigación sobre eficiencia en inferencia: el desglose de memoria (28,5 GiB de pesos, 25 GiB de KV cache, resto memoria de trabajo) y los tiempos por latente permiten estudiar estrategias de compresión de caché o cuantización en silicio de Apple.
- Generación de clips para análisis de sesgos: al permitir prompts libres y semillas fijas, facilita estudios sobre representación y sesgos en modelos generativos de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VBench u otros) en la información disponible. El repositorio sí incluye métricas de rendimiento medidas en un Apple M5 Max con 128 GB y mlx 0.32.4 para un clip de 81 fotogramas:

| Métrica | FastFrames-S | FastFrames-L |
|---|---|---|
| Roll-out (clip completo) | 10,6–13,5 s | 81,5 s (80–86 s en 5 clips) |
| Tiempo por fotograma latente | 0,3–0,7 s | 2,65 s, subiendo a 4,8 s al llenarse la caché |
| Memoria pico durante el roll-out | 10,6 GiB | 60,0 GiB |
| Memoria pico a 5 / 9 latentes | no disponible | 40,7 / 45,5 GiB (1,21 GiB por latente) |
| Decodificación de 81 fotogramas | 0,44 s | 0,21 s |

Además, se reporta una precisión numérica frente a la implementación de referencia de Apple en CPU con fp32 (3 latentes, 9 llamadas al DiT): error L2 relativo de 3,3e-6 (port plano) y 6,4e-6 (ruta rápida) en las características pre-head de la primera llamada al DiT.

## Requisitos de hardware

- VRAM/RAM unificada: mínimo 96 GB en Mac; pico de 60 GiB por clip de 81 fotogramas. A 5 latentes el pico es de 40,7 GiB y a 9 latentes de 45,5 GiB (1,21 GiB por latente adicional).
- GPU recomendadas: Apple Silicon de gama alta; el repositorio reporta mediciones en un M5 Max con 128 GB. No se documentan pruebas en M1, M2, M3, M4 ni en GPUs NVIDIA (A100, H100, RTX 4090), ya que MLX solo se ejecuta en silicio de Apple.
- ¿Cabe en GPU de consumo? No en GPUs de consumo convencionales: requiere un Mac con al menos 96 GB de memoria unificada, lo que excluye la mayoría de configuraciones de consumo. Un Mac Studio o MacBook Pro de gama alta con 128 GB es el entorno objetivo.
- Opciones de despliegue: MLX (librería `mlx`, probada con 0.32.4) mediante los scripts `ffmlx/run.py` y `ffmlx/batch.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: unos 45 GB de disco para los pesos (30,6 GB de módulos de Apple + 11,4 GB del text encoder).
- Latencia y throughput: 81,5 s por clip de 81 fotogramas en M5 Max (80–86 s en cinco clips); el modelo opera cerca del throughput de matmul de la GPU (unos 41 TFLOP/s en bf16 a esos tamaños). Un clip de prueba de 17 fotogramas (`--frames 5`) tarda unos 15 s y consume 41 GiB.
- Dependencias: Python 3 (probado con 3.12) y `ffmpeg` en el PATH.

## Comparativa con modelos similares

| Modelo | Parámetros | Salida | Contexto / caché | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastFrames-L (este port, MLX) | 14B | 81 fotogramas, 832x480, 16 fps | 32.760 tokens de KV cache (40 capas) | apple-amlr (solo investigación no comercial) | Hugging Face, requiere Mac con ≥96 GB |
| FastFrames-S (mlx-community/FastFrames-S-bf16-mlx) | no disponible (menor que L) | 81 fotogramas, misma resolución y fps | no disponible | apple-amlr | Hugging Face, MLX; pico de 10,6 GiB, ejecutable en Macs con menos memoria |
| FastFrames-L original (apple/FastFrames-L) | 14B | 81 fotogramas, 832x480, 16 fps | no disponible | apple-amlr | Hugging Face, pesos oficiales en safetensors (PyTorch) |
| Wan2.1-T2V-1.3B (Wan-AI) | 1,3B | no disponible en la información | no disponible | no disponible en la información | Hugging Face; usado aquí solo como fuente del tokenizador umT5 |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la Apple Machine Learning Research Model License permite uso, modificación y redistribución únicamente para investigación científica no comercial. Cualquier uso comercial está prohibido y afecta al port en su conjunto.
- Port no oficial: no está hecho, revisado ni respaldado por Apple; no tiene relación con la compañía. La validación se limita a la equivalencia numérica descrita en la model card.
- Requisito de hardware muy alto: necesita un Mac con 96 GB o más de memoria unificada; no es ejecutable en GPUs NVIDIA ni en Macs de consumo estándar.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede producir artefactos, incoherencias temporales o contenido no fiel al prompt; no se documentan evaluaciones sistemáticas de fidelidad.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al ser un modelo entrenado con datos no especificados, es probable que reproduzca sesgos de representación, pero no hay datos concretos.
- Idiomas: no se especifican los idiomas soportados para el prompt; el codificador umT5-XXL es multilingüe en origen, pero no se confirma el comportamiento del modelo con prompts en castellano.
- Longitud limitada: por defecto genera 5 segundos (81 fotogramas); clips más largos requieren ajustar `--frames` y aumentan el consumo de memoria a razón de 1,21 GiB por latente.
- Reproducibilidad: los clips no coinciden con los de Apple para los mismos prompts porque el ruido proviene del generador de MLX, no del de PyTorch.
- Desviaciones del original: el port se aparta de los ajustes publicados por Apple en algunos parámetros; para reproducir los ajustes oficiales hay que usar `--opts xcollapse=0 --decoder-dtype bf16`.
- Verificación de pesos: el script comprueba el SHA-256 de los archivos de Apple contra la release validada y detiene la ejecución si no coinciden, lo que puede romper flujos si Apple actualiza los pesos.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con tamaño de repo de 0,0 GB (solo contiene código, no pesos), lo que indica un uso muy incipiente y poca validación por parte de la comunidad.

## Enlaces

- Repositorio del port en Hugging Face: https://huggingface.co/mlx-community/FastFrames-L-bf16-mlx
- Modelo base original de Apple: https://huggingface.co/apple/FastFrames-L
- Port del modelo menor FastFrames-S: https://huggingface.co/mlx-community/FastFrames-S-bf16-mlx
- Licencia Apple AMLR: https://huggingface.co/mlx-community/FastFrames-L-bf16-mlx/blob/main/LICENSE-APPLE-AMLR
- Paper de referencia: https://arxiv.org/abs/2611.23226
- Framework MLX: https://github.com/ml-explore/mlx
- Tokenizador umT5 (Wan2.1-T2V-1.3B): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
