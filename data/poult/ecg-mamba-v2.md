# poult/ECG-Mamba-V2

## Resumen

ECG-Mamba-V2 es un modelo de clasificación automática de electrocardiogramas (ECG) de 12 derivaciones basado en modelos de espacio de estado (SSM) bidireccionales. Desarrollado por Jiang Huawei (poult), este modelo refina la arquitectura ECG-Mamba original para abordar el problema de la clasificación multi-etiqueta de anomalías cardíacas, donde un único registro puede presentar múltiples patologías simultáneamente. El trabajo ha sido aceptado como carta en la revista Frontiers of Computer Science (FCS).

La arquitectura combina un escaneo SSM bidireccional con convoluciones depthwise bidireccionales, incorporando además mejoras como la colocación del token de clase al final de la secuencia y un programa de ajuste de tasa de aprendizaje con recocido coseno y calentamiento lineal. Con 17,17 millones de parámetros, el modelo logra un rendimiento superior a su predecesor en los conjuntos de datos PhysioNet/CinC 2020 y 2021, alcanzando un AUPRC de 0,6494 y un AUROC de 0,9716 en el desafío de 2021. Su relevancia radica en ofrecer una alternativa eficiente a los transformadores para el procesamiento de señales biomédicas de larga duración, con un coste computacional significativamente menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de espacio de estado bidireccional (BiSSM) con convoluciones depthwise bidireccionales |
| Parametros totales | 17,17 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa registros ECG completos de 12 derivaciones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (procesa señales biomédicas, no texto) |
| Licencia | MIT / Apache-2.0 (pendiente de elección por el autor) |
| Formato de pesos | No disponible (repositorio de código oficial, no pesos preentrenados) |

## Arquitectura y entrenamiento

ECG-Mamba-V2 se basa en la arquitectura Vision Mamba (Vim) adaptada para señales ECG unidimensionales. La arquitectura incorpora dos componentes principales de procesamiento bidireccional: un escaneo SSM bidireccional que modela dependencias temporales en ambas direcciones de la señal, y convoluciones depthwise bidireccionales que capturan patrones morfológicos locales. El modelo coloca el token de clase al final de la secuencia de tokens, una modificación respecto a la posición inicial habitual, y elimina el factor de escalado de salida presente en ECG-Mamba original.

El entrenamiento utiliza una validación cruzada de 5 pliegues agrupados por paciente, con 3 semillas aleatorias, totalizando 15 ejecuciones cuyos resultados se promedian. Los datos provienen de los conjuntos de entrenamiento de los desafíos PhysioNet/CinC 2020 y 2021. Para evitar la fuga de datos, los registros que comparten la misma clave de paciente proxy (fuente, edad, sexo y conjunto de etiquetas) se mantienen en el mismo pliegue. El entrenamiento emplea una tasa de dropout uniforme de 0,1 en cada bloque y un programa de recocido coseno con calentamiento lineal. Las etiquetas de clasificación incluyen superclases diagnósticas como NORM (normal), MI (infarto de miocardio), STTC (cambios ST-T), CD (enfermedad de conducción) y HYP (hipertrofia).

## Capacidades

- Clasificación multi-etiqueta de anomalías cardíacas en registros ECG de 12 derivaciones, pudiendo asignar múltiples diagnósticos simultáneamente a un mismo registro.
- Detección de superclases diagnósticas: NORM, MI, STTC, CD y HYP, cubriendo las principales categorías de anomalías cardíacas.
- Procesamiento de señales biomédicas de larga duración mediante modelado de dependencias temporales bidireccionales con complejidad lineal respecto a la longitud de la secuencia.
- Modelado de correlaciones entre derivaciones del ECG mediante el mecanismo de atención implícito del SSM combinado con convoluciones depthwise.
- Eficiencia computacional: 17,49 GMac por inferencia, con un throughput de 252 muestras por segundo en una RTX 3090 Ti con batch size 20.
- Entrenamiento y evaluación robustos mediante validación cruzada agrupada por paciente, lo que proporciona estimaciones fiables de generalización.

## Casos de uso

- Detección automática de infarto de miocardio en servicios de urgencias: el modelo puede analizar un ECG de 12 derivaciones en tiempo real y alertar al personal médico ante la presencia de patrones compatibles con IM, reduciendo el tiempo de diagnóstico en pacientes con dolor torácico.
- Telemedicina y monitorización remota de pacientes cardíacos: integrado en plataformas de salud digital, permite el cribado automático de ECG capturados en dispositivos portátiles, priorizando los casos que requieren revisión cardiología urgente.
- Análisis de grandes cohortes para estudios epidemiológicos: su eficiencia computacional (252 muestras/s) permite procesar bases de datos masivas de ECG para investigar la prevalencia de anomalías cardíacas en distintas poblaciones.
- Triaje de pacientes en atención primaria: el modelo puede servir como herramienta de apoyo al médico de familia para derivar a cardiología solo aquellos casos con alta probabilidad de anomalía, optimizando los recursos sanitarios.
- Sistemas de monitorización continua en unidades de cuidados intensivos: la clasificación multi-etiqueta permite detectar múltiples anomalías simultáneas (por ejemplo, infarto más bloqueo de conducción) en pacientes críticos.
- Validación cruzada de algoritmos de ECG en entornos de investigación: la metodología de evaluación con agrupación por paciente y múltiples semillas lo convierte en un punto de referencia fiable para comparar nuevas arquitecturas.

## Benchmarks y rendimiento

Los resultados presentados corresponden a las puntuaciones macro-promediadas, calculadas como la media de 15 ejecuciones (3 semillas x 5 pliegues) con validación cruzada de 5 pliegues agrupada por paciente.

| Dataset | Modelo | AUPRC | AUROC |
|---|---|---|---|
| PhysioNet/CinC 2021 | ECG-Mamba | 0,6083 | 0,9643 |
| PhysioNet/CinC 2021 | ECG-Mamba-V2 | 0,6494 | 0,9716 |
| PhysioNet/CinC 2020 | ECG-Mamba | 0,5554 | 0,9524 |
| PhysioNet/CinC 2020 | ECG-Mamba-V2 | 0,5681 | 0,9561 |

La mejora respecto a ECG-Mamba es de +0,0411 en AUPRC y +0,0073 en AUROC para el conjunto de 2021, y de +0,0127 en AUPRC y +0,0037 en AUROC para el de 2020. El modelo presenta una complejidad de 17,17 millones de parámetros, 17,49 GMac y un throughput de 252 muestras por segundo con batch size 20 en una RTX 3090 Ti.

## Requisitos de hardware

- Requiere GPU NVIDIA con soporte CUDA; el código necesita los paquetes `mamba-ssm` y `causal-conv1d` instalados para el camino rápido.
- Con 17,17 millones de parámetros, el modelo es ligero: la inferencia puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o superiores sin problemas de memoria.
- La RTX 3090 Ti utilizada en las pruebas de rendimiento alcanza 252 muestras por segundo con batch size 20, lo que sugiere que GPUs más modestas pueden lograr un throughput aceptable para aplicaciones en tiempo real.
- Para entrenamiento desde cero, se recomienda al menos una GPU con 16-24 GB de VRAM para acomodar los gradientes y el optimizador.
- Opciones de despliegue: el código oficial proporciona scripts de entrenamiento y evaluación; para inferencia en producción, puede exportarse a formatos optimizados como ONNX o TensorRT, aunque no se documenta explícitamente en el repositorio.
- La latencia por muestra se estima en aproximadamente 4 milisegundos en la RTX 3090 Ti (252 muestras/s), lo que permite su uso en aplicaciones de monitorización en tiempo real.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento (AUPRC 2021) | Licencia |
|---|---|---|---|---|---|
| ECG-Mamba-V2 | BiSSM + Conv depthwise bidireccional | 17,17 M | Registro ECG completo | 0,6494 | MIT/Apache-2.0 (pendiente) |
| ECG-Mamba | BiSSM | No disponible | Registro ECG completo | 0,6083 | No disponible |
| 1DCNN-ECG-Mamba | CNN 1D + Mamba | No disponible | Registro ECG completo | No disponible (supera a ECG-Mamba) | No disponible |
| ECGMamba | SSM + normalización de capa + FFN | No disponible | Registro ECG completo | No disponible | No disponible |

ECG-Mamba-V2 supera consistentemente a ECG-Mamba en ambos conjuntos de datos. El modelo 1DCNN-ECG-Mamba, también del mismo autor, reporta mejoras adicionales sobre ECG-Mamba, aunque no se dispone de comparación directa con ECG-Mamba-V2. La arquitectura ECGMamba propone una combinación diferente de técnicas sobre la base Mamba, pero no se han publicado comparativas directas con este modelo.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para registros ECG de 12 derivaciones; su rendimiento en otras configuraciones (menos derivaciones, señales de diferente frecuencia de muestreo) no está validado.
- La clasificación se limita a cinco superclases diagnósticas (NORM, MI, STTC, CD, HYP), no cubriendo la granularidad completa de diagnósticos cardíacos que un cardiólogo podría identificar.
- Los datos de entrenamiento provienen de los desafíos PhysioNet/CinC 2020 y 2021, que pueden no representar completamente la diversidad de poblaciones y equipos de adquisición de ECG en todo el mundo.
- La licencia del modelo está indicada como "MIT / Apache-2.0 — elegir uno" en el modelo card, pero no se ha especificado cuál de las dos se aplica finalmente, lo que genera incertidumbre legal para uso comercial.
- El repositorio contiene el código de entrenamiento y evaluación, pero no se proporcionan pesos preentrenados, por lo que el usuario debe entrenar el modelo desde cero con los datos de PhysioNet.
- No se han documentado evaluaciones de sesgo por edad, sexo o etnia, aunque la agrupación por clave de paciente proxy sugiere cierta atención a la variabilidad demográfica.
- Como herramienta de apoyo diagnóstico, el modelo no debe utilizarse como sustituto del juicio clínico profesional; cualquier resultado debe ser verificado por personal médico cualificado.
- El modelo requiere GPU CUDA y las dependencias `mamba-ssm` y `causal-conv1d`, que pueden presentar problemas de compatibilidad con ciertas versiones de PyTorch o sistemas sin soporte CUDA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/poult/ECG-Mamba-V2
- Repositorio de referencia Vision Mamba (Vim): https://github.com/hustvl/Vim
- Repositorio de referencia Mamba: https://github.com/state-spaces/mamba
- Paper ECG-Mamba (BiSSM): https://arxiv.org/pdf/2406.10098
- Paper 1DCNN-ECG-Mamba: https://arxiv.org/pdf/2510.13046v2
- Repositorio ECG-Mamba original: https://github.com/skkuhg/ecg-mamba
- Datos PhysioNet/CinC 2021: https://physionet.org/content/challenge-2021/
- Otros modelos del autor: https://huggingface.co/poult/models
