# nvidia/dlesym-v1-era5

## Resumen

DLESyM-V1-ERA5 es un modelo de pronóstico por conjuntos (ensemble) desarrollado por NVIDIA para el modelado del sistema terrestre global. Forma parte de la suite Earth-2 de NVIDIA y combina componentes de atmósfera y océano, utilizando variables atmosféricas y la temperatura superficial del mar sobre una cuadrícula HEALPix nside=64, que equivale a una resolución aproximada de 1 grado en latitud/longitud. El modelo está diseñado para predicción meteorológica subestacional-estacional (S2S) y simulación climática, ofreciendo una alternativa eficiente a los modelos numéricos tradicionales.

La arquitectura es un U-Net con operaciones de padding adaptadas a la malla HEALPix, con dos redes separadas para atmósfera y océano. El paquete incluye múltiples checkpoints entrenados individualmente que pueden combinarse para mejorar la variabilidad del conjunto. El modelo fue entrenado con datos ERA5 (1980-2015) y validado con datos de 2016-2017, empleando una pérdida CRPS y ruido aleatorio muestreado en cada paso para generar la variabilidad del conjunto. Su licencia es Apache-2.0, aunque los términos de uso se rigen por la NVIDIA Community Model License, y está listo para uso comercial y no comercial.

La relevancia de este modelo radica en su capacidad para simular el acoplamiento océano-atmósfera mediante aprendizaje profundo, una tarea tradicionalmente compleja en los modelos físicos. Al estar integrado en el ecosistema de Earth-2, permite a investigadores y desarrolladores ejecutar predicciones S2S con un coste computacional reducido, facilitando la exploración de escenarios climáticos y la generación de conjuntos probabilísticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (dos redes: atmósfera y océano) adaptada a malla HEALPix |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de datos numéricos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de datos climáticos) |
| Licencia | Apache-2.0 (con términos adicionales de NVIDIA Community Model License) |
| Formato de pesos | PyTorch (safetensors probable, no especificado) |

## Arquitectura y entrenamiento

La arquitectura de DLESyM-V1-ERA5 consiste en dos redes U-Net, una para la atmósfera y otra para el océano, ambas modificadas para operar sobre la malla HEALPix nside=64. Esta malla icosaédrica permite una discretización uniforme de la esfera sin distorsiones polares, lo que facilita el modelado global. Las operaciones de padding se adaptaron para mantener la conectividad espacial en esta malla. Cada red procesa un tensor 6D (batch, lead time, variable, face, height, width) con 9 variables de entrada: z500, tau300-700, z1000, t2m, tcwv, t850, z250, ws10m y sst. La resolución temporal del modelo es de 6 horas.

El entrenamiento se realizó con datos de ERA5 del período 1980-2015 (110,960 puntos de datos, partición 90% entrenamiento, 5% test, 5% validación). La función de pérdida es CRPS (Continuous Ranked Probability Score), que penaliza la incertidumbre del pronóstico y favorece la calibración de los conjuntos. Además, se introduce ruido aleatorio muestreado en cada pasada hacia adelante mediante el método `set_rng`, lo que genera variabilidad en las predicciones y permite construir conjuntos de pronósticos sin necesidad de ejecutar múltiples pasadas deterministas. Esta técnica es clave para aplicaciones de predicción estacional, donde la incertidumbre es fundamental.

El modelo se distribuye como un paquete de checkpoints individuales para atmósfera y océano, que pueden combinarse en un conjunto. El entrenamiento sigue las recetas de PhysicsNeMo y la inferencia se integra en Earth2Studio, lo que facilita su uso en flujos de trabajo científicos.

## Capacidades

- Predicción meteorológica por conjuntos: genera múltiples trayectorias de pronóstico mediante ruido estocástico, proporcionando incertidumbre calibrada.
- Acoplamiento atmósfera-océano: simula la interacción entre la atmósfera y la temperatura superficial del mar (SST), un factor clave en procesos subestacionales y estacionales.
- Procesamiento global en malla HEALPix: resolución uniforme de aproximadamente 1 grado, adecuada para simulaciones de gran escala.
- Predicción a 6 horas de resolución temporal: puede producir secuencias de pronóstico de varios días o semanas.
- Soporte de ensamblado: los múltiples checkpoints permiten construir conjuntos más amplios y robustos.
- Integración con Earth2Studio: herramientas para análisis de salida, visualización y comparación con datos observacionales.
- Capacidades de inferencia en GPU: optimizado para hardware NVIDIA (Turing, Ampere, Hopper) mediante PyTorch.

## Casos de uso

- Predicción subestacional a estacional (S2S): el modelo puede generar pronósticos de temperatura, precipitación y otros variables con horizonte de semanas a meses, útil para planificación agrícola, gestión de recursos hídricos y preparación ante eventos extremos. Su naturaleza de conjunto permite estimar probabilidades de anomalías climáticas.
- Simulación de escenarios climáticos: investigadores pueden usar DLESyM para explorar el comportamiento del sistema acoplado atmósfera-océano bajo diferentes condiciones iniciales, proporcionando una base para estudios de variabilidad y cambio climático.
- Generación de conjuntos para asimilación de datos: la capacidad de producir múltiples trayectorias a partir de un mismo estado inicial facilita la construcción de perturbaciones iniciales en sistemas de asimilación de datos para mejorar la calidad de los pronósticos.
- Análisis de fenómenos de teleconexión: el modelo puede ayudar a estudiar interacciones como El Niño-Oscilación del Sur (ENOS), donde la temperatura superficial del mar juega un papel central. Al predecir SST junto con variables atmosféricas, se pueden investigar patrones de teleconexión a escala global.
- Prototipado rápido en investigación: gracias a su bajo coste computacional (en comparación con modelos numéricos físicos), permite a grupos académicos y de gobierno realizar experimentos de sensibilidad y análisis de incertidumbre de manera rápida.
- Integración en sistemas de alerta temprana: las salidas probabilísticas pueden combinarse con umbrales de riesgo para generar alertas tempranas de eventos meteorológicos extremos, como olas de calor o sequías, en horizontes subestacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo se utilizó en la competición ECMWF AI Weather Quest S2S, pero no se proporcionan métricas numéricas. Tampoco se incluyen comparaciones con otros modelos (por ejemplo, PDR-Weather, FourCast, GraphCast). Por tanto, no es posible presentar una tabla de rendimiento en este documento.

## Requisitos de hardware

- Se requiere una GPU NVIDIA compatible con las arquitecturas Turing, Ampere o Hopper (según la documentación).
- No se especifica la cantidad de VRAM necesaria, pero al tratarse de un modelo con 0.2 GB de pesos, es plausible que quepa en GPUs de consumo como RTX 3060 o superiores, aunque la inferencia con múltiples conjuntos puede requerir más memoria.
- El modelo está optimizado para ejecución en GPU con PyTorch; no se menciona soporte para CPU.
- Se recomienda usar el framework Earth2Studio para la inferencia, que maneja la carga de datos y la gestión de conjuntos.
- Para obtener un rendimiento óptimo en producción, se podría considerar el uso de vLLM u otros motores de inferencia, aunque no se indica en la documentación. La inferencia se ejecuta en PyTorch nativo, por lo que la latencia dependerá del tamaño del lote y de la resolución de los datos de entrada.
- No se proporcionan cifras de latencia ni throughput específicas.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos climáticos de aprendizaje profundo (como PDR-Weather, FourCast, GraphCast) en los datos proporcionados. No se incluyen tablas de comparación de parámetros, rendimiento o licencia. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- El modelo se entrenó con datos ERA5 de un período específico (1980-2015) y se validó con 2016-2017. Su capacidad de generalización a otros períodos o a condiciones climáticas extremas no se ha documentado explícitamente.
- La resolución espacial es de aproximadamente 1 grado, lo que limita su utilidad para fenómenos locales o de pequeña escala. No es adecuado para predicciones de alta resolución.
- Aunque el modelo incluye componentes de atmósfera y océano, no incorpora otras variables como hielo marino, suelo o química atmosférica, por lo que su aplicabilidad a ciertos fenómenos puede ser limitada.
- La variabilidad del conjunto se genera mediante ruido aleatorio, lo que puede no capturar toda la incertidumbre del sistema real; la calibración de las probabilidades no se ha verificado en todos los casos.
- La licencia Apache-2.0 permite uso comercial, pero los términos de uso de NVIDIA Community Model License pueden imponer restricciones adicionales. Se recomienda revisar los términos exactos antes de su despliegue en producción.
- No se documentan sesgos específicos, pero es posible que el modelo reproduzca sesgos presentes en los datos de ERA5 (por ejemplo, en regiones con escasa cobertura de observaciones).
- El modelo requiere datos de entrada en el formato específico (HEALPix XY) y variables definidas (z500, tau300-700, etc.). Cualquier desviación de este formato puede causar errores de inferencia.
- La documentación no menciona la posibilidad de ejecutar el modelo en CPU, lo que limita su uso en entornos sin GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/dlesym-v1-era5
- Página del modelo en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/earth-2/models/dlesym-v1-era5/
- Documentación de Earth2Studio (ejemplo de inferencia): https://nvidia.github.io/earth2studio/examples/14_dlesym_example.html
- Repositorio de Earth2Studio: https://github.com/NVIDIA/earth2studio
- Repositorio de PhysicsNeMo (recetas de entrenamiento): https://github.com/NVIDIA/physicsnemo/tree/main/examples/weather/dlwp_healpix
- Artículo 1: "Advancing Parsimonious Deep Learning Weather Prediction using the HEALPix Mesh" - https://arxiv.org/abs/2311.06253
- Artículo 2: "A Deep Learning Earth System Model for Efficient Simulation of the Observed Climate" - https://arxiv.org/abs/2409.16247
- Análisis externo del modelo: https://richardsbenjamin.github.io/2025/09/20/dlesym-output-analysis.html
