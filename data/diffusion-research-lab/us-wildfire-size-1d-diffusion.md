# Diffusion-Research-Lab/us-wildfire-size-1d-diffusion

## Resumen

`us-wildfire-size-1d-diffusion` es un modelo generativo de difusión unidimensional desarrollado por Diffusion-Research-Lab. No es un modelo de lenguaje: es un modelo de referencia para generar muestras sintéticas de una única variable escalar, el tamaño final de incendios forestales en Estados Unidos (expresado en acres), a partir de la distribución empírica del dataset FPA-FOD del Servicio Forestal de EE. UU. (registros 1992-2024).

El repositorio contiene tres variantes entrenadas de forma independiente (DDPM-V, DLPM-Eps y t-EDM) más una cuarta (DDIM-V) que reutiliza los pesos de DDPM-V cambiando únicamente el muestreador inverso a DDIM determinista. Todas comparten una arquitectura MLP muy compacta de 133.505 parámetros entrenables, con anchura 128, profundidad 3 y dimensión temporal 64, y se entrenaron sobre 25.000 muestras de entrenamiento con normalización por media y desviación típica.

Su relevancia es metodológica: sirve como línea base reproducible para comparar objetivos de difusión (predicción de velocidad, ruido o dato denoised) y muestreadores sobre datos unidimensionales con colas pesadas, un escenario típico en modelado de riesgos extremos. No está pensado para generación de texto ni para tareas de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de difusión (width 128, depth 3, time_dim 64, use_norm true, dropout 0.0, dim 1) |
| Parametros totales | 133.505 (por variante entrenada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada/salida de dimensión 1) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `normalization.safetensors`) |

## Arquitectura y entrenamiento

Cada variante es una red MLP que parametriza un proceso de difusión sobre datos escalares. La arquitectura es idéntica en las tres variantes entrenadas: anchura 128, tres capas, embedding temporal de 64 dimensiones, normalización activada y dropout desactivado. Lo que cambia es el objetivo de predicción y el muestreador: DDPM-V predice velocidad con 128 pasos y `sigma_max` 2.0; DLPM-Eps predice ruido con 128 pasos y `alpha` 1.8; t-EDM predice el dato denoised con 64 pasos, `nu` 2.2, `sigma_min` 0.005, `sigma_max` 5.0 y solver EDM stochastic Heun. DDIM-V comparte pesos con DDPM-V y solo altera el muestreador a DDIM con `eta=0`.

El entrenamiento usó AdamW con learning rate 0.0005, weight decay 1e-6, grad clip 10.0, scheduler coseno con 100 pasos de calentamiento y `eta_min_ratio` 0.05, batch de 512 y hasta 640 épocas con paciencia de early stopping de 100. Los datos provienen de FPA-FOD (incendios con tamaño final positivo, en acres), con splits de 25.000/1.000/1.000.000 y normalización por media y desviación típica de entrenamiento. Las pérdidas de validación y test reportadas son: DDPM-V 0.09306/0.0727, DLPM-Eps 0.01579/0.03829 y t-EDM 0.1577/0.1586; el autor advierte que cada pérdida usa su propio objetivo y no son comparables como calidad de muestra.

## Capacidades

- Generación incondicional de muestras escalares de tamaño de incendio (acres) ajustadas a la distribución empírica del dataset.
- Muestreo estocástico (DDPM, DLPM nativo, EDM stochastic Heun) y determinista (DDIM con `eta=0` sobre pesos DDPM-V).
- Normalización y desnormalización integradas: el cargador devuelve media y desviación típica para reconstruir la escala original.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo thinking.
- No es un modelo de propósito general: su única tarea es modelar la marginal univariante de `fire_size`.

## Casos de uso

- Análisis de riesgo de incendios: generar muestras sintéticas de tamaños de incendio para estimar cuantiles extremos y curvas de excedencia cuando los registros históricos son escasos en la cola.
- Validación de pipelines de simulación de siniestros: usar las muestras como entrada estocástica en modelos de propagación o de pérdidas económicas que necesitan distribuciones realistas de tamaño final.
- Comparación metodológica de objetivos de difusión: emplear las tres variantes como referencia reproducible para evaluar DDPM frente a EDM o DLPM en datos 1D con colas pesadas.
- Docencia e investigación en modelos generativos: el tamaño reducido (133.505 parámetros) y el código de carga permiten ejecutar experimentos completos en CPU en segundos.
- Aumento de datos para modelos actuariales: generar escenarios sintéticos de tamaño de incendio para entrenar o stress-test modelos de tarificación y reservas.
- Pruebas de infraestructura MLOps: servir un modelo de difusión real de extremo a extremo (carga, muestreo, desnormalización) sin requerir GPU ni grandes volúmenes de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación y test bajo el objetivo propio de cada variante, que el autor indica explícitamente que no son comparables como medida de calidad de muestra.

| Variante | Pérdida validación | Pérdida test | Épocas ejecutadas / mejor | Pasos de muestreo |
|---|---:|---:|---:|---:|
| DDPM-V | 0.09306 | 0.0727 | 374 / 274 | 128 |
| DLPM-Eps | 0.01579 | 0.03829 | 549 / 449 | 128 |
| t-EDM | 0.1577 | 0.1586 | 191 / 91 | 64 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 133.505 parámetros (aproximadamente 0,5 MB en fp32) y se ejecuta sin problema en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con CUDA (por ejemplo, RTX 3060 o superior) acelera el muestreo pero no es necesaria.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: la librería `gendynamics` mediante `toolkit.huggingface.load_huggingface_model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño de la red y los 64-128 pasos de muestreo se espera un coste despreciable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de difusión unidimensional para tamaño de incendios; las alternativas habituales serían modelos estadísticos paramétricos (lognormal, Pareto) o modelos de difusión tabulares de mayor dimensión, pero no se dispone de datos de comparación verificables.

## Limitaciones y advertencias

- Modelo univariante: no captura dependencias entre el tamaño del incendio y otras variables (clima, vegetación, localización), por lo que no sirve para predicción condicionada.
- Las muestras no garantizan precisión en la cola; el autor advierte que las previsualizaciones de muestra no establecen exactitud en la cola.
- Entrenado con datos de EE. UU. (FPA-FOD); no es extrapolable a otras regiones sin reentrenamiento.
- Los datos de origen no se redistribuyen y sus términos dependen del proveedor (USDA Forest Service); la fuente es una API que puede cambiar, aunque el checksum del fichero procesado identifica la instantánea.
- Las pérdidas entre variantes no son comparables; no deben usarse para elegir la "mejor" variante sin una evaluación de calidad de muestra específica.
- Licencia MIT para los pesos; se recomienda citar la revisión del repositorio al reutilizarlos.
- No apto para generación de texto, código ni tareas de NLP: cualquier uso en ese sentido está fuera de su dominio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Diffusion-Research-Lab/us-wildfire-size-1d-diffusion
- Repositorio de entrenamiento: https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models
- Fuente de datos FPA-FOD (USDA Forest Service): https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_FireOccurrenceCurrentEdition_01/MapServer/0/query
