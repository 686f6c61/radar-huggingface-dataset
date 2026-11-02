# ShuangheYang/rae2822-cst20-mlp-r05

## Resumen

RAE2822 CST20 MLP es un modelo subrogado de aerodinámica computacional publicado en HuggingFace por el usuario ShuangheYang. No es un modelo de lenguaje: es una red neuronal de regresión tabular que predice los coeficientes de sustentación (CL) y resistencia (CD) de perfiles alares a partir de 20 coeficientes CST (Class-Shape Transformation) que parametrizan la geometría del perfil. El modelo devuelve además la relación sustentación-resistencia L_D = CL/CD.

Técnicamente se trata de un perceptrón multicapa (MLP) de arquitectura 20-64-64-64-2 con activación Tanh y una rama lineal entrenable de entrada a salida (bypass), sin Dropout, con solo 9.834 parámetros. El entrenamiento combina AdamW con planificación coseno y un refinamiento posterior con L-BFGS en precisión float64. Los objetivos de entrenamiento son resultados de simulación CFD con el solver CFL3D (malla fina, SST) a Mach 0,73, Re 6,5×10⁶, ángulo de ataque 2,79° y temperatura 288,15 K.

Su relevancia es acotada pero concreta: sustituye una simulación CFD costosa por una inferencia de milisegundos dentro de un dominio de validez estrictamente definido (perfil RAE2822 base ±10 % del valor absoluto de cada coeficiente CST). Está pensado para optimización de formas y exploración de diseño, no para aerodinámica certificada experimentalmente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP 20-64-64-64-2 con activación Tanh y rama lineal entrenable de entrada a salida (bypass); capa de salida lineal |
| Parámetros totales | 9.834 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (regresión tabular; entrada fija de 20 coeficientes CST) |
| Tipos de cuantización | no disponible (pesos en NPZ; inferencia en CPU/GPU con PyTorch) |
| Idiomas soportados | en (documentación y metadatos; el modelo no procesa texto) |
| Licencia | no disponible (el autor indica que no se ha asignado licencia de reutilización) |
| Formato de pesos | NPZ (NumPy, sin pickle, `allow_pickle=False`), con escaladores y metadatos de construcción |

## Arquitectura y entrenamiento

La red es un MLP de cuatro capas (entrada 20, tres capas ocultas de 64 unidades con Tanh, salida 2) más una rama lineal entrenable que conecta directamente la entrada estandarizada con la salida. La predicción se calcula como la suma de ambas ramas y se desestandariza con la media y desviación de los objetivos de entrenamiento. La salida son dos valores (CL, CD); L_D se deriva como cociente. No hay Dropout ni mecanismos de atención: es un regresor puro.

El entrenamiento usa 10.000 geometrías (modelo por defecto `learning/M04_deep64_n10000_s11`, semilla 11), con 500 geometrías de validación externa y 1.500 de test congelado. El proceso combina AdamW con planificación coseno y un refinamiento final con L-BFGS en float64. El repositorio contiene 42 MLPs ajustados: 12 configuraciones de cribado con semilla 11, 6 ejecuciones adicionales de confirmación con semillas 22 y 33, y 24 ejecuciones de curva de aprendizaje en ocho presupuestos y tres semillas. Los objetivos son resultados CFL3D de malla fina con SST; el modelo aproxima esa respuesta numérica, no aerodinámica certificada experimentalmente.

## Capacidades

- Predicción de CL y CD a partir de 20 coeficientes CST adimensionales ordenados como `U0..U9, L0..L9`.
- Cálculo derivado de la relación sustentación-resistencia L_D = CL/CD.
- Inferencia por lotes: acepta una matriz N×20 para predicción vectorizada.
- Inferencia en CPU y GPU (PyTorch con CUDA opcional).
- Detección de entradas fuera de dominio con emisión de aviso.
- Rechazo de predicciones de CD no finitas o no positivas, sin recorte (clipping).
- Comparación opcional de una predicción con una etiqueta fina almacenada mediante ID de dataset.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un regresor numérico.

## Casos de uso

- Optimización de formas de perfil alar: integrar el modelo en un bucle de optimización (por ejemplo, algoritmos genéticos o descenso por gradiente sobre los coeficientes CST) para evaluar miles de geometrías en segundos en lugar de lanzar simulaciones CFD por cada candidato.
- Exploración de diseño preliminar: barrer el espacio de coeficientes CST dentro del dominio validado (RAE2822 ±10 %) para identificar regiones con mejor L_D antes de confirmar con CFD de alta fidelidad.
- Filtrado previo en pipelines CFD: usar el subrogado como primer filtro para descartar geometrías con CD elevado o CL bajo, reservando el solver CFL3D solo para los candidatos prometedores.
- Docencia y experimentación en aerodinámica: disponer de un modelo ligero (9.834 parámetros, ejecutable en CPU) para ilustrar la relación entre parametrización CST y coeficientes aerodinámicos sin infraestructura de simulación.
- Generación de datasets sintéticos etiquetados: producir pares (coeficientes CST, CL/CD) de forma rápida para preentrenar o aumentar otros modelos subrogados, siempre dentro del dominio validado.
- Validación cruzada de metodologías subrogadas: el repositorio incluye una comparativa emparejada con Kriging (repositorio separado), útil para investigar técnicas de regresión en ingeniería aerodinámica.
- Análisis de sensibilidad local: al ser diferenciable (PyTorch), permite calcular gradientes de CL, CD o L_D respecto a cada coeficiente CST para estudiar qué parámetros geométricos dominan el rendimiento.

## Benchmarks y rendimiento

MAPE sobre las 1.500 geometrías de test congelado del modelo por defecto (`learning/M04_deep64_n10000_s11`):

| Objetivo | MAPE (%) |
|---|---:|
| CL | 0,030353 |
| CD | 0,061773 |
| L_D | 0,046815 |

Notas de interpretación publicadas por el autor: el conjunto de evaluación externa se usó en investigación exploratoria previa; el split de test se mantuvo reservado durante este estudio, pero no es históricamente ciego. Los resultados aplican a los modelos y al dominio de diseño especificados. No se han publicado en la información disponible resultados de benchmarks frente a otros modelos subrogados más allá de la comparativa con Kriging referenciada en el repositorio de dataset.

## Requisitos de hardware

- VRAM estimada: despreciable; con 9.834 parámetros, los pesos ocupan decenas de kilobytes. Cabe en cualquier GPU, incluida una iGPU, y en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con CUDA y PyTorch compatible acelera la inferencia por lotes, pero no es necesaria.
- GPU de consumo: sí, en todas (RTX 4090, RTX 3060, etc.) e incluso en CPU sin GPU.
- Opciones de despliegue: script `airfoil_predict.py` incluido (CPU/GPU), carga directa de pesos NPZ con NumPy y PyTorch, integración como módulo Python (`Predictor`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explícita; por el tamaño del modelo y la naturaleza de la operación (MLP de 9.834 parámetros), la inferencia es del orden de microsegundos a milisegundos por muestra en CPU, aunque el autor no publica cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Salida | Licencia |
|---|---|---|---|---|---|
| RAE2822 CST20 MLP (este) | MLP con bypass lineal | 9.834 | 20 coeficientes CST | CL, CD, L_D | no disponible |
| Kriging RAE2822 CST20 (`ShuangheYang/rae2822-cst20-kriging-r05`) | Kriging (GPR) | no disponible | 20 coeficientes CST | CL, CD (según repositorio) | no disponible |
| Otros subrogados aerodinámicos públicos | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor referencia una comparativa emparejada MLP frente a Kriging en la guía de benchmark del repositorio de dataset; los resultados numéricos de esa comparación no se detallan en la información disponible.

## Limitaciones y advertencias

- Dominio de validez estricto: solo el perfil RAE2822 base con cada coeficiente CST dentro de ±10 % de su valor absoluto (límites exactos en `cst_bounds.json`). Fuera de ese dominio las predicciones no están garantizadas y el script emite aviso.
- Condiciones fijas: Mach 0,73, Re 6,5×10⁶, ángulo 2,79° y T 288,15 K. Otras condiciones y familias de perfiles arbitrarias quedan fuera del alcance validado.
- Aproxima resultados CFD (CFL3D, malla fina, SST), no aerodinámica certificada experimentalmente; no debe usarse para certificación.
- El modelo por defecto es de fidelidad fina; no es un modelo grueso ni multi-fidelidad.
- El conjunto de evaluación externa no es históricamente ciego (se usó en investigación exploratoria previa).
- Licencia no asignada: no hay licencia de reutilización, lo que impide un uso comercial claro sin contactar al autor.
- Riesgo de extrapolación silenciosa: aunque se avisa de entradas fuera de dominio, el modelo devuelve medias predictivas sin intervalos de incertidumbre.
- Rechaza CD no positivos o no finitos sin recorte, lo que puede romper pipelines que esperen siempre un valor.
- El código de la plataforma de generación CFD y los ejecutables del solver no se distribuyen.
- No procesa texto ni imágenes; no debe evaluarse como modelo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ShuangheYang/rae2822-cst20-mlp-r05
- Dataset, métodos, figuras e informe: https://huggingface.co/datasets/ShuangheYang/rae2822-cst20-cfl3d-fine
- Guía de benchmark del dataset: https://huggingface.co/datasets/ShuangheYang/rae2822-cst20-cfl3d-fine/blob/main/research/README.md
- Repositorio Kriging: https://huggingface.co/ShuangheYang/rae2822-cst20-kriging-r05
- Perfil del autor: https://huggingface.co/ShuangheYang
