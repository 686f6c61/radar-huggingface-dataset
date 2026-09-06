# psaegert/flash-ansr-v25.0-T7-3M

## Resumen

flash-ansr-v25.0-T7-3M es un modelo de regresión simbólica amortizada desarrollado por Paul Saegert y Ullrich Köthe, que forma parte de la librería Flash-ANSR. A diferencia de los modelos de lenguaje, este modelo recibe un conjunto de pares entrada-salida y propone expresiones simbólicas que los describen, con constantes numéricas predichas a precisión completa y refinadas posteriormente por un optimizador. Es el checkpoint de referencia de flash-ansr 0.14 y fue presentado en ICML 2026.

Con 3.510.130 parámetros, combina un encoder Set Transformer (192 dimensiones, 3 cabezas, 1 ISAB + 1 SAB, 128 inducing points) que codifica hasta 18 variables de entrada, con un decoder Transformer (192 dimensiones, 3 capas, 3 cabezas, atención con RoPE) que genera expresiones simbólicas token a token. Está entrenado para regresión simbólica, no para tareas de lenguaje natural, y su relevancia radica en ofrecer un enfoque rápido y amortizado para descubrir ecuaciones interpretables a partir de datos tabulares.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Set Transformer encoder (192-d, 3 cabezas, 1 ISAB + 1 SAB, 128 inducing points) + Transformer decoder (192-d, 3 capas, 3 cabezas, RoPE self-attention) |
| Parámetros totales | 3.510.130 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza un encoder Set Transformer que procesa hasta 18 variables de entrada, con las entradas numéricas pre-codificadas como patrones binarios de 64 bits (binary64). El decoder es un Transformer con atención propia basada en posición rotatoria (RoPE) y genera expresiones simbólicas sobre un vocabulario en el que las constantes se representan como 8 bytes. El checkpoint incluye la memoria nula para el condicionamiento opcional y una cabeza específica para detectar outliers por punto.

El entrenamiento se realizó durante 1.000.000 de pasos con un tamaño de lote de 128, utilizando expresiones muestreadas sobre la marcha desde symbolic-data con el prior definido en `catalog_train.yaml` y la mezcla de tareas de `dataset_train.yaml`. La mezcla incluye ruido con outliers, condicionamiento y predicción de complejidad, predicción de puntos retenidos, enmascaramiento e infilling de constantes. Las expresiones se simplificaron en el bucle de entrenamiento con SimpliPy y el conjunto de reglas `acj-5-4-llm`. Todos los catálogos evaluados por srbf se mantienen fuera del entrenamiento por forma canónica: 6.660 expresiones en 29 catálogos. No se aplicaron técnicas de RLHF ni DPO.

## Capacidades

- Regresión simbólica amortizada: dado un conjunto de pares entrada-salida, propone expresiones simbólicas que ajustan los datos.
- Predicción de constantes numéricas a precisión completa (binary64) y refinamiento posterior mediante un optimizador.
- Soporte para hasta 18 variables de entrada.
- Funciones auxiliares: `predict_y`, `predict_complexity`, `predict_constants` y `score_outliers`.
- Detección de outliers por punto mediante la cabeza específica incluida en el checkpoint.
- Condicionamiento por complejidad, que permite controlar la complejidad de las expresiones generadas.
- No es un modelo de lenguaje general: no soporta tool calling, razonamiento multi-paso ni tareas de texto.

## Casos de uso

- Descubrimiento de leyes físicas: a partir de datos experimentales medidos, el modelo propone ecuaciones simbólicas que relacionan variables físicas, lo que facilita la interpretación de fenómenos naturales.
- Modelado de procesos químicos: permite identificar relaciones no lineales entre variables de un reactor, como temperatura, presión y concentración, para optimizar condiciones de operación.
- Análisis financiero: se puede utilizar para encontrar expresiones que modelen la relación entre indicadores económicos, generando modelos interpretables para análisis de riesgo o predicción de series temporales.
- Identificación de sistemas dinámicos: en ingeniería de control, el modelo puede inferir ecuaciones que describan el comportamiento de un sistema a partir de datos de entrada y salida, útiles para diseñar controladores.
- Modelado de datos biológicos: permite ajustar curvas de crecimiento o respuestas a fármacos con expresiones simbólicas, facilitando la interpretación de experimentos en biología.
- Mantenimiento predictivo: a partir de sensores de maquinaria, el modelo puede generar expresiones que relacionen variables de vibración, temperatura y carga, ayudando a detectar patrones de fallo.
- Enseñanza de regresión simbólica: como modelo de referencia de Flash-ANSR, es útil para investigar y comparar métodos de regresión simbólica neuronal en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: muy baja, en torno a 14 MB en FP32 para los pesos; cabe en cualquier GPU o incluso en CPU.
- GPU recomendada: no requiere GPU; puede ejecutarse en CPU. Si se usa GPU, cualquier tarjeta compatible con CUDA es suficiente.
- Cabe en consumer GPU: sí, en todas las GPU de consumo actuales.
- Opciones de despliegue: mediante la librería flash-ansr, con `pip install "flash-ansr>=0.14,<0.15"` y carga con `FlashANSR.load`. No es compatible con vLLM, llama.cpp ni Ollama al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados.

## Limitaciones y advertencias

- El modelo está especializado en regresión simbólica y no procesa texto ni lenguaje natural.
- Riesgo de alucinación simbólica: puede proponer expresiones incorrectas o sobreajustadas, especialmente con datos ruidosos o escasos.
- Limitado a un máximo de 18 variables de entrada, lo que restringe su uso en problemas de alta dimensionalidad.
- Los resultados dependen del prior de expresiones utilizado en el entrenamiento; puede mostrar sesgo hacia las formas presentes en el catálogo.
- No se han reportado sesgos específicos, pero al entrenarse con datos sintéticos, la generalización a dominios fuera de la distribución de entrenamiento no está garantizada.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías de rendimiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/psaegert/flash-ansr-v25.0-T7-3M
- GitHub: https://github.com/psaegert/flash-ansr
- Paper (arXiv): https://arxiv.org/abs/2602.08885
- Documentación: https://flash-ansr.readthedocs.io/
