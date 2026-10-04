# Diffusion-Research-Lab/hrrr-west-hourly-precipitation-100d-diffusion

## Resumen

El modelo `hrrr-west-hourly-precipitation-100d-diffusion`, publicado por Diffusion-Research-Lab, no es un modelo de lenguaje: es un conjunto de tres modelos de difusion incondicional entrenados para generar vectores de 100 valores de precipitacion horaria, uno por cada ciudad fija del oeste de Estados Unidos incluida en el dataset. Los pesos publicados corresponden a la mejor epoca de validacion de cada variante y se cargan mediante la libreria `gendynamics`.

Se distribuyen tres formulaciones de difusion independientes sobre la misma red: DDPM-V (predice velocidad), DLPM-Eps (predice ruido) y t-EDM (predice dato denoizado). Todas comparten una arquitectura MLP muy pequena, de 158.948 parametros entrenables, con ancho 128, profundidad 3, dimension temporal 64 y dimension de salida 100. La relevancia actual del artefacto es como modelo de referencia reproducible para el modelado de colas y eventos extremos de precipitacion (el repositorio de entrenamiento se denomina `tail_reference_models`), no como sistema operativo de prediccion meteorologica.

El dataset de entrenamiento procede del analisis HRRR de NOAA distribuido por dynamical.org, con 100 ciudades del oeste de Estados Unidos y divisiones de 10.000/1.000/80.000 muestras para entrenamiento, validacion y prueba. La licencia es MIT, el formato de pesos es safetensors y el repositorio ocupa 0,0 GB, coherente con el tamano reducido de los tres checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP condicionada por paso de tiempo de difusion; width 128, depth 3, time_dim 64, dim 100, use_norm true, dropout 0.0 |
| Parametros totales | 158.948 por modelo (tres variantes: DDPM-V, DLPM-Eps, t-EDM) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es un vector de 100 dimensiones) |
| Tipos de cuantizacion | no disponible (se publican pesos safetensors sin cuantizaciones declaradas) |
| Idiomas soportados | no aplica (genera series numericas, no texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria de carga | gendynamics |
| Dimension de salida | 100 (una columna por ciudad) |
| Pasos de muestreo | 128 en DDPM-V y DLPM-Eps; 64 en t-EDM |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

Las tres variantes comparten la misma red troncal, definida como MLP con `width: 128`, `depth: 3`, `time_dim: 64`, `dropout: 0.0`, `use_norm: true` y `dim: 100`. Sobre esa red se aplican tres formulaciones de difusion distintas: DDPM-V con `n_steps: 128`, `sigma_max: 2.0` y muestreador `ddpm`, que predice la velocidad; DLPM-Eps con `n_steps: 128`, `alpha: 1.9` y muestreador `native`, que predice el ruido; y t-EDM con `n_steps: 64`, `nu: 2.1`, `sigma_min: 0.005`, `sigma_max: 5.0`, `sigma_data: 1.0` y solver `edm_stochastic_heun`, que predice el dato denoizado. El ajuste es incondicional: no se condiciona en covariables meteorologicas, solo en el nivel de ruido o tiempo de difusion.

Los datos provienen del analisis HRRR de NOAA distribuido por dynamical.org, aproximando la precipitacion horaria de cada ciudad por su celda HRRR mas cercana. Las horas alineadas completas en 100 ciudades se dividen aleatoriamente en 10.000/1.000/80.000 muestras de forma `[100]`. La normalizacion es por coordenada, con media y desviacion tipica de entrenamiento, y las desviaciones cero se sustituyen por uno. El fichero procesado `hrrr_west_hourly_precip.pt` tiene SHA-256 `2d0b70823234bd96200352f1c82546631f1e381e6f0f86b80254a9dfac4ff084`. El entrenamiento uso `cuda` para el modelo y `cpu` para los datos, lote de 512, presupuesto maximo de 640 epocas con paciencia de parada temprana de 100, optimizador AdamW con `weight_decay: 1e-06`, learning rate 0,0005, recorte de gradiente de norma 10,0, planificador coseno con 100 pasos de calentamiento y `cosine_eta_min_ratio: 0.05`. Los pesos subidos corresponden a la mejor epoca de validacion, y cada modelo se recargo y verifico antes de la subida, con el resultado registrado en `export_check.json`.

## Capacidades

- Generacion incondicional de vectores de 100 valores de precipitacion horaria, uno por ciudad del conjunto fijo del oeste de Estados Unidos.
- Tres objetivos de difusion alternativos (velocidad, ruido y dato denoizado) que permiten comparar formulaciones sobre la misma red y los mismos datos.
- Muestreo configurable: 128 pasos en DDPM-V y DLPM-Eps, y 64 pasos con solver estocastico de Heun en t-EDM.
- Modelado de la distribucion marginal de precipitacion por ciudad, sin condicionamiento en estado atmosferico ni en tiempo.
- Reproducibilidad completa: configuracion, versiones de software y revision de las fuentes en `provenance.json`, y semilla y particiones en `dataset.json`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni soporte multilingue, ya que no es un modelo de lenguaje.

## Casos de uso

- Generacion de escenarios sinteticos de precipitacion horaria: el modelo permite muestrear series plausibles de 100 ciudades simultaneas para analisis de variabilidad marginal, sin necesidad de datos historicos adicionales.
- Aumento de datos para experimentos estadisticos: con 80.000 muestras de prueba y una red de 158.948 parametros, se pueden generar conjuntos sinteticos grandes a un coste computacional muy bajo para calibrar estimadores o comparar pruebas estadisticas.
- Referencia para investigacion en modelado de colas y extremos: el repositorio de entrenamiento se denomina `tail_reference_models`, y el modelo sirve como linea base para estudiar si las formulaciones de difusion reproducen correctamente la cola de la distribucion de precipitacion.
- Docencia y reproduccion de metodos de difusion: la red MLP pequena y las tres formulaciones comparables facilitan explicar y replicar DDPM, DLPM y EDM en un caso tabular real sin requerir GPU de gran capacidad.
- Comparacion de formulaciones de difusion: permite medir sobre el mismo dataset como cambian las perdidas de validacion y prueba al pasar de predecir velocidad a predecir ruido o dato denoizado.
- Evaluacion de pipelines de datos meteorologicos: al fijar un checksum del fichero procesado y la identidad de las particiones, se puede usar como caso de prueba para verificar que un pipeline de preparacion de datos reproduce exactamente el mismo conjunto.
- Analisis de cobertura geografica: las 100 ciudades de California, Oregón y Washington permiten estudiar diferencias de comportamiento del modelo entre zonas costeras, valles y zonas aridas.

## Benchmarks y rendimiento

Los unicos datos numericos publicados son las perdidas de validacion y prueba de cada variante. El propio autor advierte que las perdidas usan el objetivo propio de cada modelo y no son comparables como medidas de calidad de muestra.

| Directorio | Modelo | Objetivo de prediccion | Parametros entrenables | Pasos de muestreo | Learning rate | Epocas ejecutadas / mejor | Perdida de validacion | Perdida de prueba |
|---|---|---|---:|---:|---:|---:|---:|---:|
| ddpm-v | DDPM-V | velocidad | 158.948 | 128 | 0,0005 | 640 / 639 | 0,7949 | 0,8585 |
| dlpm-eps | DLPM-Eps | ruido | 158.948 | 128 | 0,0005 | 457 / 357 | 0,4581 | 0,4861 |
| tedm-origin | t-EDM | dato denoizado | 158.948 | 64 | 0,0005 | 640 / 638 | 0,3525 | 0,5281 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB de pesos en precision completa (158.948 parametros x 4 bytes ≈ 0,64 MB), mas activaciones despreciables; puede ejecutarse en cualquier GPU o en CPU.
- GPU recomendadas: no se requiere GPU. El entrenamiento se realizo en `cuda` con lote de 512, pero el tamano del modelo no exige acelerador.
- Cabe en GPU de consumo: si, en cualquier GPU consumer actual e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: la libreria declarada es `gendynamics`; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El muestreo requiere entre 64 y 128 pasos de red, pero no se publican tiempos medidos.

## Comparativa con modelos similares

No se dispone de modelos externos comparables en la informacion proporcionada. La unica comparacion posible es entre las tres variantes publicadas en el mismo repositorio, que comparten red, datos y particiones y solo difieren en la formulacion de difusion y el numero de pasos:

| Variante | Formulacion | Pasos | Perdida de validacion | Perdida de prueba | Licencia |
|---|---|---:|---:|---:|---|
| DDPM-V | DDPM sobre velocidad | 128 | 0,7949 | 0,8585 | MIT |
| DLPM-Eps | DLPM sobre ruido (alpha 1.9) | 128 | 0,4581 | 0,4861 | MIT |
| t-EDM | EDM sobre dato denoizado (nu 2.1) | 64 | 0,3525 | 0,5281 | MIT |

Comparativa con alternativas de la misma categoria (otros modelos de difusion meteorologica o de generacion tabular): no disponible.

## Limitaciones y advertencias

- Es un modelo incondicional: no acepta condiciones de entrada como presion, temperatura o humedad, por lo que no sirve para prediccion meteorologica condicionada.
- La cobertura geografica esta limitada a 100 ciudades fijas de California, Oregón y Washington; no generaliza a otras regiones ni a puntos arbitrarios.
- La aproximacion por celda HRRR mas cercana introduce error de representatividad espacial en cada ciudad.
- La perdida de cada variante usa su propio objetivo, por lo que las cifras de validacion y prueba no son comparables entre si como medida de calidad de muestra.
- El propio autor advierte que las previsualizaciones de muestras no demuestran precision en la cola de la distribucion.
- La normalizacion por coordenada sustituye desviaciones tipicas cero por uno, lo que puede distorsionar coordenadas con variabilidad nula en entrenamiento.
- Los datos de origen no se redistribuyen y sus terminos dependen del proveedor; las fuentes respaldadas por API pueden cambiar, y el checksum solo identifica esta instantanea concreta.
- El repositorio presenta 0 descargas y 0 likes, y un tamano de 0,0 GB, por lo que no cuenta con validacion externa de la comunidad.
- Las fechas de creacion y actualizacion del repositorio (2026-10-03) estan fijadas en el futuro respecto al momento habitual de publicacion, un detalle a verificar antes de citarlo.
- Licencia MIT, sin restricciones declaradas para uso comercial, pero la ausencia de datos de rendimiento en colas limita su uso en produccion sin validacion propia.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Diffusion-Research-Lab/hrrr-west-hourly-precipitation-100d-diffusion)
- [Repositorio de entrenamiento](https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models)
- [Script de preparacion del dataset: `datasets/2_hrrr_west_tabular_dataset.py`](https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models)
- [Catalogo del analisis HRRR de NOAA en dynamical.org](https://dynamical.org/catalog/noaa-hrrr-analysis/)
