# ShuangheYang/rae2822-cst20-kriging-r05

## Resumen

El modelo `rae2822-cst20-kriging-r05`, publicado por el usuario ShuangheYang en Hugging Face, es un surrogate aerodinámico basado en dos procesos gaussianos exactos (Kriging) independientes que predicen el coeficiente de sustentación (CL) y el coeficiente de resistencia (CD) de perfiles alares parametrizados mediante 20 coeficientes CST (Class Shape Transformation). A partir de esas dos salidas deriva la relación sustentación-resistencia `L_D = CL / CD`. No es un modelo de lenguaje: es un regresor tabular de alta fidelidad para un dominio muy acotado.

El modelo resuelve el problema de sustituir costosas simulaciones CFD por una aproximación estadística rápida y determinista. Los objetivos de entrenamiento son resultados CFL3D de malla fina con el modelo de turbulencia SST, a Mach 0,73, Reynolds 6,5×10⁶, ángulo de ataque 2,79° y temperatura 288,15 K. El dominio validado corresponde al perfil RAE2822 con una variación de ±10 % en el valor absoluto de cada coeficiente CST, con los límites exactos en `cst_bounds.json`.

Su relevancia es doble: por un lado, demuestra una metodología rigurosa de surrogate Kriging con evaluación externa y test congelado; por otro, su alcance es extremadamente estrecho y no debe confundirse con un modelo aerodinámico general. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos regresores Gaussian Process (Kriging) exactos independientes, covarianza Matérn-5/2 isotrópica |
| Parametros totales | No disponible (10.000 centros de entrenamiento retenidos; coeficientes resueltos por Cholesky) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada fija de 20 coeficientes CST) |
| Tipos de cuantizacion | No disponible (pesos NPZ en precisión de entrenamiento) |
| Idiomas soportados | Inglés (documentación y metadatos) |
| Licencia | No disponible |
| Formato de pesos | NPZ sin pickle (`allow_pickle=False`), con escaladores y metadatos de construcción |

## Arquitectura y entrenamiento

Cada salida (CL y CD) se modela con un proceso gaussiano exacto con media constante fijada por centrado de los datos de entrenamiento y covarianza Matérn-5/2 isotrópica sobre las 20 entradas CST estandarizadas. Cada salida tiene su propia varianza de señal \(s_f^2\), su nugget \(s_n^2\) y una longitud de escala \(\ell\) compartida por las 20 direcciones de entrada. La predicción se obtiene mediante \( \hat y(z_*) = m + k_*^T (K + s_n^2 I)^{-1}(y - m\mathbf{1}) \), con resolución de Cholesky densa durante el ajuste. Los hiperparámetros se ajustan maximizando la verosimilitud marginal de entrenamiento.

El modelo por defecto, `n10000_s11`, retiene los 10.000 centros de entrenamiento sin aproximación dispersa ni puntos inductores. El repositorio contiene 22 ajustes Kriging: tres subconjuntos anidados para cada uno de siete presupuestos menores de entrenamiento más un ajuste a presupuesto completo. Los registros etiquetados como semillas 22 y 33 a 10.000 muestras reutilizan el ajuste de la semilla 11, por lo que son registros repetidos del mismo modelo determinista y no ajustes independientes. La comparación con un MLP emparejado se documenta en la guía de benchmark del dataset asociado, con un procedimiento de tuning distinto.

## Capacidades

- Predicción de CL, CD y relación L_D a partir de 20 coeficientes CST ordenados (`U0…U9, L0…L9`).
- Regresión tabular determinista con inferencia en CPU o GPU (PyTorch opcional para CUDA).
- Predicción por lotes mediante arrays N×20.
- Comparación opcional de una predicción con una etiqueta fina almacenada en el dataset, mediante identificador local.
- Aviso automático cuando la entrada cae fuera del dominio validado.
- Rechazo de predicciones de CD no finitas o no positivas, sin recorte.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Exploración de diseño de perfiles RAE2822: evaluar rápidamente variantes CST dentro de ±10 % de cada coeficiente para filtrar candidatos antes de lanzar CFD.
- Optimización de forma con surrogate: usar CL, CD y L_D como función objetivo barata en bucles de optimización genética o basada en gradientes aproximados.
- Análisis de sensibilidad local: cuantificar cómo cambios pequeños en coeficientes CST afectan a sustentación y resistencia en las condiciones de validación.
- Generación de datasets sintéticos aumentados: producir etiquetas aproximadas para preentrenar o validar otros surrogate antes de la validación CFD fina.
- Docencia e investigación metodológica: ejemplo reproducible de Kriging exacto con evaluación externa, test congelado y trazabilidad de hiperparámetros.
- Verificación de pipelines CFD: comparar resultados CFL3D con la predicción Kriging para detectar anomalías en nuevas simulaciones dentro del dominio.
- Prototipado de herramientas de diseño aerodinámico: integrar el predictor en un script Python con CPU para entornos sin GPU.

## Benchmarks y rendimiento

MAPE sobre 1.500 geometrías de test congelado (modelo por defecto `n10000_s11`, 10.000 geometrías de entrenamiento, semilla 11):

| Objetivo | MAPE (%) |
|---|---:|
| CL | 0,059635 |
| CD | 0,212512 |
| L_D | 0,236063 |

No se han publicado en la información disponible resultados comparativos adicionales frente a otros modelos (MMLU, HumanEval, GSM8K u otros) por tratarse de un regresor aerodinámico y no de un modelo de lenguaje. La comparación con MLP emparejado se remite a la guía de benchmark del dataset asociado y no cubre todos los kernels ni modelos con longitud de escala direccional.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y el modelo retiene 10.000 centros, por lo que la huella es moderada pero no se especifica.
- GPU recomendadas: no disponible; se documenta soporte opcional de CUDA con PyTorch, sin modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; la inferencia en CPU está soportada explícitamente.
- Despliegue: script `airfoil_predict.py` con Python 3.11, NumPy y PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Salidas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rae2822-cst20-kriging-r05 | Kriging exacto (2 GP) | 20 CST | CL, CD, L_D | No aplica | No disponible | Hugging Face |
| rae2822-cst20-mlp-r05 | MLP (repo hermano) | 20 CST | CL, CD, L_D | No aplica | No disponible | Hugging Face |
| CFD CFL3D SST malla fina | Simulación numérica | Geometría completa | Campos completos | No aplica | No aplica | Herramienta externa |

La comparación con el MLP se describe en la guía de benchmark del dataset, con procedimiento de tuning distinto; no se dispone de cifras comparativas en la información proporcionada. No se conocen otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- Dominio muy restringido: solo válido para RAE2822 con ±10 % en cada coeficiente CST; fuera de ese rango se emite aviso pero no se corrige la predicción.
- Condiciones fijas: Mach 0,73, Re 6,5×10⁶, ángulo 2,79° y T 288,15 K; otras condiciones quedan fuera del alcance validado.
- Aproxima una respuesta numérica CFL3D, no aerodinámica certificada experimentalmente.
- No es un modelo multi-fidelidad ni coarse; el modelo por defecto es de malla fina.
- El pool de evaluación externa se usó en investigación exploratoria previa; el test se mantuvo aparte en este estudio pero no es históricamente ciego.
- La inferencia de covarianza exacta no garantiza un óptimo global de verosimilitud; los registros conservan banderas de terminación del optimizador, incluidas búsquedas lineales fallidas.
- Licencia no disponible: verificar condiciones antes de uso comercial.
- No aplica a familias de perfiles alares arbitrarias.
- Riesgo de extrapolación silenciosa si no se respetan los límites de `cst_bounds.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShuangheYang/rae2822-cst20-kriging-r05
- Dataset, métodos, figuras e informe: https://huggingface.co/datasets/ShuangheYang/rae2822-cst20-cfl3d-fine
- Guía de benchmark del dataset: https://huggingface.co/datasets/ShuangheYang/rae2822-cst20-cfl3d-fine/blob/main/research/README.md
- Repositorio MLP relacionado: https://huggingface.co/ShuangheYang/rae2822-cst20-mlp-r05
- Perfil del autor: https://huggingface.co/ShuangheYang
