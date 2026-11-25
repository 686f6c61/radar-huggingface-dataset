# Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p8-200d-diffusion

## Resumen

El modelo `elliptical-alpha-stable-mixture-1p8-200d-diffusion`, publicado por Diffusion-Research-Lab, es un conjunto de modelos de difusión de referencia entrenados de forma incondicional (sin condicionamiento externo) sobre un dataset sintético de mezclas elípticas simétricas alpha-estables de rango completo. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de investigación estadística destinado a estudiar cómo distintos formulaciones de difusión (DDPM, DLPM, t-EDM) aprenden distribuciones con colas pesadas y dependencia multivariante en dimensión 200.

El repositorio contiene tres entrenamientos independientes (DDPM-V, DLPM-Eps y t-EDM) más una variante de muestreo determinista (DDIM-V) que reutiliza los pesos de DDPM-V. Todos comparten una arquitectura MLP de 4 capas y anchura 240 con 717.944 parámetros entrenables, una dimensión de datos de 200 y un presupuesto de 640 épocas con parada temprana. El interés actual del modelo radica en que sirve como banco de pruebas reproducible para comparar objetivos de predicción (velocidad, ruido, dato denoised) sobre una misma distribución sintética con colas alpha-estables, un régimen donde los modelos de difusión convencionales suelen fallar.

La licencia es MIT y el tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere que los pesos, aunque declarados en safetensors, no están efectivamente alojados o su tamaño es despreciable. No hay pipeline declarado, no hay idiomas soportados y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con 4 capas, anchura 240, `time_dim` 128, normalización activada, dropout 0,0, dimensión de datos 200 |
| Parametros totales | 717.944 por cada modelo entrenado (DDPM-V, DLPM-Eps, t-EDM) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de difusión incondicional sobre vectores de 200 dimensiones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` por directorio), más `config.json`, `dataset.json`, `metrics.json`, `provenance.json`, `export_check.json` y, cuando aplica, `normalization.safetensors` |

## Arquitectura y entrenamiento

Cada uno de los tres modelos es una MLP de 4 capas con anchura 240, dimensión temporal de 128 y normalización, que opera sobre vectores de 200 dimensiones. No hay atención, ni convoluciones, ni mecanismos de estado recurrente: la arquitectura es deliberadamente simple para aislar el efecto del objetivo de entrenamiento y del sampler. DDPM-V predice la velocidad con 128 pasos de muestreo y `sigma_max` 2,0; DLPM-Eps predice el ruido con 128 pasos y alpha 1,8; t-EDM predice el dato denoised con 64 pasos, `nu` 2,2, `sigma_min` 0,005, `sigma_max` 5,0, `sigma_data` 1,0 y solver EDM stochastic Heun. DDIM-V comparte los pesos de DDPM-V y solo cambia el sampler reverso a DDIM determinista con `eta=0`.

El dataset es sintético y se genera con `gendynamics.datasets.fetch_synthetic_data('elliptical_alpha_stable_mixture')`: mezcla de componentes elípticas simétricas alpha-estables de rango completo, con rotaciones de componentes sembradas, escalas de eje log-espaciadas y traza de dispersión fija. Los splits son 25.000/1.000/10.000 muestras de forma `[200]`, sin normalización. El entrenamiento usa AdamW con learning rate 5e-4, weight decay 1e-6, grad clip 10,0, scheduler coseno con 400 pasos de calentamiento y `eta_min_ratio` 0,05, batch de 1024, 640 épocas máximas y paciencia de parada temprana de 100. Las épocas efectivas y la mejor época varían por modelo: DDPM-V 640/605 (val 4,592, test 2,766), DLPM-Eps 640/568 (val 0,7912, test 0,8682) y t-EDM 188/88 (val 1,239, test 2,537). Las pérdidas usan objetivos distintos y no son comparables como medida de calidad de muestra.

## Capacidades

- Generación incondicional de vectores sintéticos de 200 dimensiones que aproximan una mezcla elíptica alpha-estable.
- Muestreo con tres formulaciones distintas de difusión: DDPM (predicción de velocidad), DLPM (predicción de ruido) y t-EDM (predicción de dato denoised).
- Muestreo determinista mediante DDIM (`eta=0`) reutilizando los pesos de DDPM-V.
- Evaluación comparativa de objetivos de entrenamiento y samplers sobre una misma distribución de referencia.
- Reproducibilidad completa: semillas, argumentos del generador, checksums de ficheros procesados y versiones de software registrados en `dataset.json` y `provenance.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo thinking. No es un modelo de lenguaje.

## Casos de uso

- Investigación en teoría de difusión con colas pesadas: el modelo permite medir cómo DDPM, DLPM y t-EDM aproximan una distribución alpha-estable con alpha 1,8 en 200 dimensiones, un régimen donde la cola domina las métricas de error.
- Benchmark reproducible de samplers: al compartir arquitectura y datos, DDIM-V frente a DDPM-V aísla el efecto de la estocasticidad del sampler sin confundirlo con diferencias de entrenamiento.
- Validación de pipelines de entrenamiento: los ficheros `provenance.json` y `export_check.json` permiten verificar que un nuevo entorno reproduce las pérdidas de validación y test reportadas.
- Estudio de la estabilidad numérica de objetivos de predicción: DLPM-Eps reporta val 0,7912 frente a val 4,592 de DDPM-V, lo que sirve para analizar la escala y condicionamiento de cada objetivo, no para concluir superioridad de muestra.
- Docencia y divulgación: el tamaño reducido (717.944 parámetros) y la arquitectura MLP permiten ejecutar el entrenamiento completo en CPU o en una GPU consumer en tiempos acotados.
- Pruebas de integración de la librería `gendynamics`: carga mediante `load_huggingface_model`, muestreo con `model.sample(16)` y desnormalización opcional con `normalization["std"]` y `normalization["mean"]`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta únicamente pérdidas de validación y test bajo el objetivo propio de cada modelo, que el propio autor advierte que no son comparables como puntuaciones de calidad de muestra. Los valores son: DDPM-V val 4,592 / test 2,766; DLPM-Eps val 0,7912 / test 0,8682; t-EDM val 1,239 / test 2,537. No hay MMLU, HumanEval, GSM8K ni métricas de calidad de muestra (FID, MMD, cobertura de colas) publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 717.944 parámetros de un modelo individual (aproximadamente 2,9 MB de pesos en fp32, más activaciones y buffers del sampler).
- GPU recomendadas: cualquier GPU con CUDA disponible; el entrenamiento se realizó con `device: cuda` y `data_device: cpu`, con batch de 1024.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia; el autor documenta carga explícita con `device="cpu"`.
- Opciones de despliegue: la librería `gendynamics` mediante `load_huggingface_model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El muestreo requiere 128 pasos para DDPM-V y DLPM-Eps, 64 para t-EDM y los pasos configurados en `ddim-v/config.json` para DDIM.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (difusión incondicional sobre mezclas alpha-estables en dimensión 200). Las alternativas habituales de difusión (modelos de imagen o de moléculas) difieren en arquitectura, dimensión y objetivo, por lo que una comparación directa de parámetros, contexto y licencia no sería significativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni respuestas; cualquier uso en esos dominios es un error de categoría.
- El modelo aproxima una distribución sintética concreta; no se ha validado su fidelidad en las colas, y la propia model card advierte que las previsualizaciones de muestras no establecen precisión en las colas.
- Las pérdidas reportadas usan objetivos distintos por modelo y no son comparables entre sí ni constituyen una medida de calidad de muestra.
- El dataset es sintético y generado con semillas concretas; los resultados no se extrapolan a datos reales ni a otras distribuciones alpha-estables.
- El repositorio figura con 0,0 GB de tamaño y 0 descargas, lo que sugiere que los pesos pueden no estar efectivamente alojados; conviene verificar la integridad antes de depender de ellos.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el modelo no opera sobre texto ni sobre datos humanos.
- La licencia MIT permite uso comercial, pero el uso previsto es de investigación; no se documentan garantías ni soporte.
- El código de preparación de datos vive en un repositorio externo y las fuentes respaldadas por API pueden cambiar; el checksum del fichero procesado identifica la instantánea concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Diffusion-Research-Lab/elliptical-alpha-stable-mixture-1p8-200d-diffusion
- Repositorio de la librería `gendynamics`: https://github.com/Diffusion-Research-Lab/gendynamics
- Repositorio de entrenamiento: https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a definiciones genéricas de "difusión" (Wikipedia, Larousse, Le Robert, Futura Sciences) y no aportan información técnica sobre este artefacto.
