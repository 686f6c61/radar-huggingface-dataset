# Diffusion-Research-Lab/hrrr-east-hourly-precipitation-100d-diffusion

## Resumen

Este repositorio contiene un conjunto de modelos de difusión de referencia para generación incondicional de precipitación horaria sobre 100 ciudades del este de Estados Unidos. Lo desarrolla Diffusion-Research-Lab y se publica bajo licencia MIT, con la librería `gendynamics` como dependencia de carga. No es un modelo de lenguaje: se trata de un generador tabular que produce vectores de dimensión 100, donde cada componente corresponde a la precipitación horaria normalizada de una ciudad concreta.

La arquitectura es un perceptrón multicapa (MLP) de 128 unidades de anchura y 3 capas con dimensión temporal de 64, con un total de 158.948 parámetros entrenables. El repositorio agrupa tres variantes entrenadas de forma independiente sobre el mismo dataset: `ddpm-v` (predice velocidad), `dlpm-eps` (predice ruido) y `tedm-origin` (predice dato limpio, formulación EDM). Cada una tiene su propio `config.json` y sus propios hiperparámetros de muestreo (128, 128 y 64 pasos respectivamente).

Su relevancia es acotada y muy específica: sirve como referencia reproducible y ligera para estudiar objetivos de difusión sobre datos tabulares científicos, y en particular para evaluar el comportamiento en las colas de la distribución (eventos de precipitación extrema), que es donde estos modelos suelen fallar. Al ser un modelo minúsculo, se entrena y se despliega en hardware muy modesto, lo que lo hace útil como banco de pruebas metodológico más que como herramienta operativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con condicionamiento temporal; anchura 128, profundidad 3, `time_dim` 64, `dropout` 0.0, `use_norm` true, dimensión de datos 100 |
| Parametros totales | 158.948 parámetros entrenables por variante |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo es un generador tabular incondicional de vectores de dimensión 100, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; los pesos se distribuyen en safetensors, presumiblemente en coma flotante de 32 bits) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (tag del repositorio); el repositorio incluye además `config.json`, `provenance.json`, `export_check.json` y `metrics.json` |
| Tamano del repositorio | 0.0 GB (reportado por HuggingFace) |
| Libreria de carga | gendynamics |
| Fecha de publicacion | 2026-10-03 (creación y última actualización el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Las tres variantes comparten exactamente la misma red, definida como `{"name": "mlp", "params": {"width": 128, "depth": 3, "time_dim": 64, "dropout": 0.0, "use_norm": true, "dim": 100}}`. Es decir, un MLP que recibe el vector ruidoso de 100 dimensiones más una codificación temporal de 64 dimensiones y devuelve una predicción de 100 dimensiones. Lo que cambia entre variantes es el objetivo de entrenamiento y el sampler: `ddpm-v` predice la velocidad con sampler DDPM y 128 pasos (`sigma_max` 2.0); `dlpm-eps` predice el ruido con sampler nativo, 128 pasos y `alpha` 1.9; `tedm-origin` predice el dato limpio con formulación EDM (`nu` 2.1, `sigma_min` 0.005, `sigma_max` 5.0, `sigma_data` 1.0) y solver `edm_stochastic_heun` con 64 pasos.

El entrenamiento es idéntico en configuración para las tres: dispositivo `cuda`, datos en `cpu`, batch de 512, optimizador AdamW, `lr` 0.0005 con schedule coseno, `warmup_steps` 100, `cosine_eta_min_ratio` 0.05, `weight_decay` 1e-06, `grad_clip_norm` 10.0, presupuesto máximo de 640 épocas y `early_stopping_patience` de 100. Las épocas realmente ejecutadas y la mejor época varían: DDPM-V corrió 640 épocas con mejor en la 639 (val loss 0.8587, test loss 0.9372); DLPM-Eps corrió 457 con mejor en la 357 (val 0.4512, test 0.5031); t-EDM corrió 640 con mejor en la 633 (val 0.3876, test 0.5899). La propia model card advierte que las pérdidas usan el objetivo de cada modelo y por tanto **no son comparables como medida de calidad de muestra**.

En cuanto a datos, se usa el análisis HRRR de NOAA distribuido por dynamical.org, tomando un valor horario de precipitación por ciudad del este de Estados Unidos, aproximado por la celda de rejilla HRRR más cercana. El conjunto alineado completo se divide aleatoriamente en 10.000/1.000/80.000 muestras de forma `[100]`. La normalización es por coordenada, con media y desviación típica de entrenamiento (las desviaciones nulas se sustituyen por uno). El fichero procesado `hrrr_east_hourly_precip.pt` tiene SHA-256 `9d664508dd554c4e235af392e229c6049ba6e2cca66aead46d2359a18e315020`. Los datos de origen no se redistribuyen y sus términos permanecen con el proveedor. El código de preparación está en `datasets/1_hrrr_east_tabular_dataset.py` dentro del repositorio de entrenamiento.

## Capacidades

- Muestreo incondicional de vectores de 100 dimensiones que representan precipitación horaria normalizada en 100 ciudades concretas del este de Estados Unidos.
- Generación de múltiples realizaciones sintéticas por muestreo estocástico, útil para construir conjuntos de escenarios.
- Tres formulaciones de difusión alternativas (DDPM sobre velocidad, DLPM sobre ruido, EDM sobre dato limpio) con distinto número de pasos de muestreo (128, 128 y 64).
- Reproducción exacta del pipeline de entrenamiento mediante ficheros de configuración y procedencia (`config.json`, `provenance.json`).
- Verificación de exportación documentada en `export_check.json`, con recarga y comprobación de cada modelo antes de la subida.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni procesa lenguaje natural.
- No es multimodal: no hay visión, audio ni entradas distintas de la representación tabular de precipitación.
- No es un modelo condicionado: no acepta fecha, hora, variables exógenas ni pronóstico como entrada (es explícitamente de generación incondicional).

## Casos de uso

- Generación de ensembles sintéticos de precipitación horaria: se pueden muestrear muchas realizaciones para las 100 ciudades y estudiar la variabilidad simulada de la serie, algo útil para construir escenarios sintéticos antes de disponer de datos históricos largos.
- Evaluación comparativa de objetivos de difusión sobre datos tabulares: las tres variantes comparten arquitectura y datos, así que sirven como banco de pruebas controlado para comparar DDPM, DLPM y EDM en un problema científico de baja dimensión.
- Estudio del comportamiento en las colas de la distribución: la model card identifica explícitamente estas variantes como "reference models" orientados a evaluar colas, por lo que el caso de uso natural es medir qué formulación reproduce mejor los eventos extremos de precipitación.
- Aumento de datos para modelos hidrológicos o estadísticos posteriores: los vectores sintéticos pueden alimentar clasificadores o regresores de riesgo cuando el volumen de datos reales es insuficiente, siempre con validación previa.
- Análisis de coherencia espacial entre ciudades: como la salida es un vector conjunto de 100 componentes, permite estudiar correlaciones espaciales simuladas entre ciudades próximas del este de Estados Unidos.
- Pruebas de estrés en seguros o planificación urbana: muestrear muchos escenarios horarios sintéticos para estimar exposiciones agregadas, con la advertencia de que la precisión en extremos no está establecida.
- Referencia docente y de reproducibilidad: al tener 158.948 parámetros y un coste de entrenamiento muy bajo, es adecuado para reproducir un pipeline completo de difusión de principio a fin en un curso o tutorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible; no aplican a este tipo de modelo. La model card sí reporta pérdidas de validación y test por variante:

| Directorio | Modelo | Objetivo de prediccion | Parametros entrenables | Pasos de muestreo | Learning rate | Epocas ejecutadas / mejor | Perdida validacion | Perdida test |
|---|---|---|---:|---:|---:|---:|---:|---:|
| ddpm-v | DDPM-V | velocity | 158.948 | 128 | 0.0005 | 640 / 639 | 0.8587 | 0.9372 |
| dlpm-eps | DLPM-Eps | noise | 158.948 | 128 | 0.0005 | 457 / 357 | 0.4512 | 0.5031 |
| tedm-origin | t-EDM | denoised data | 158.948 | 64 | 0.0005 | 640 / 633 | 0.3876 | 0.5899 |

Advertencia textual de la model card: las pérdidas usan el objetivo propio de cada modelo, de modo que no son puntuaciones de calidad de muestra comparables entre sí. El número de filas reservadas empleadas en cada pérdida de test está en `metrics.json`. Las previsualizaciones de muestras no establecen la precisión en las colas. No se dispone de métricas de error en extremos, cobertura de intervalos ni puntuaciones de energía.

## Requisitos de hardware

- VRAM para inferencia: ínfima. Con 158.948 parámetros en coma flotante de 32 bits, los pesos ocupan aproximadamente 0,64 MB; incluso sumando estados del sampler y lotes grandes, el consumo se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU CUDA sirve; el entrenamiento se documenta en `device: "cuda"` con `data_device: "cpu"` y batch de 512, configuración que cabe holgadamente en GPUs de gama baja. No hay indicios de que se requieran A100 o H100.
- Ejecución en CPU: perfectamente viable dada la escala del modelo y la dimensión de los datos (vectores de 100 componentes).
- GPU de consumo: cabe en cualquier GPU de consumo, incluidas integradas, aunque la información no especifica modelos concretos.
- Opciones de despliegue: la librería indicada es `gendynamics` sobre PyTorch; no se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Como referencia estructural, el muestreo requiere `n_steps` evaluaciones de la red por lote (128 pasos en DDPM-V y DLPM-Eps, 64 en t-EDM), pero no se publican medidas de tiempo.

## Comparativa con modelos similares

La información proporcionada no incluye modelos comparables externos ni referencias a alternativas de la misma categoría, por lo que la comparación con terceros es "no disponible". La comparación interna entre las tres variantes del propio repositorio es la siguiente:

| Modelo | Arquitectura | Parametros | Objetivo | Pasos de muestreo | Perdida validacion | Perdida test | Licencia |
|---|---|---:|---|---:|---:|---:|---|
| DDPM-V | MLP 128x3, time_dim 64 | 158.948 | velocity | 128 | 0.8587 | 0.9372 | MIT |
| DLPM-Eps | MLP 128x3, time_dim 64 | 158.948 | noise | 128 | 0.4512 | 0.5031 | MIT |
| t-EDM | MLP 128x3, time_dim 64 | 158.948 | denoised data | 64 | 0.3876 | 0.5899 | MIT |

Las pérdidas no son comparables entre columnas por corresponder a objetivos distintos, tal y como indica la propia model card.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo precipitación horaria y solo para 100 ciudades concretas del este de Estados Unidos, listadas nominalmente en la model card.
- Generación incondicional: no se puede condicionar por fecha, hora, estación, pronóstico numérico ni variables exógenas, lo que limita su uso como emulador predictivo.
- No es un modelo de lenguaje y no debe evaluarse ni desplegarse como tal: no genera texto, código ni respuestas conversacionales.
- Precisión en las colas no establecida: la model card señala explícitamente que las previsualizaciones de muestras no demuestran precisión en extremos, que es precisamente el objetivo declarado de estos modelos de referencia.
- Pérdidas no comparables entre variantes: cada una optimiza un objetivo distinto, por lo que elegir "la mejor" por su pérdida es un error metodológico.
- Dependencia de la normalización: las salidas están en espacio normalizado con media y desviación típica por coordenada del conjunto de entrenamiento; cualquier uso requiere aplicar la misma transformación inversa.
- Riesgo de sobreajuste y de baja diversidad de muestras: con 158.948 parámetros y 80.000 muestras de test, la capacidad del modelo es reducida y no se documentan métricas de diversidad ni de cobertura distribucional.
- Sesgos derivados de los datos: al derivarse del análisis HRRR y de una aproximación por celda de rejilla más cercana, hereda los sesgos del producto de reanálisis y de la discretización espacial.
- Restricciones de licencia: los pesos son MIT, pero los datos de origen no se redistribuyen y sus términos permanecen con el proveedor (NOAA HRRR distribuido por dynamical.org). Las fuentes con API pueden cambiar, y solo el checksum del fichero procesado identifica la instantánea concreta.
- Repositorio sin adopción: cero descargas y cero likes en el momento de la consulta, sin evidencia externa de validación por terceros.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron páginas sin relación alguna con el contenido técnico, por lo que no hay material externo que contrastar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Diffusion-Research-Lab/hrrr-east-hourly-precipitation-100d-diffusion
- Repositorio de entrenamiento (código de preparación de datos y entrenamiento): https://github.com/Diffusion-Research-Lab/2_training_2026_tail_reference_models
- Catálogo del dataset de origen (NOAA HRRR analysis, dynamical.org): https://dynamical.org/catalog/noaa-hrrr-analysis/
- Script de preparación del dataset: `datasets/1_hrrr_east_tabular_dataset.py` dentro del repositorio de entrenamiento
- Paper, blog o demo adicionales: no disponible
- Resultados de búsqueda web relevantes: no disponible (los resultados devueltos no guardan relación con el modelo)
