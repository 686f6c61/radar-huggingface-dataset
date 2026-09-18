# hosseinbv/bedrock-checkpoints-58

## Resumen

`bedrock-checkpoints-58` es un checkpoint de una red neuronal informada por la física (PINN) que actúa como modelo sustituto (*surrogate*) de simulaciones CFD RANS de flujo estacionario de refrigerante. Lo publica el usuario `hosseinbv` en Hugging Face y está entrenado sobre resultados de STAR-CCM+ para un dominio de refrigerante LLC-10 a 298,15 K y 25,0 L/min. No es un modelo de lenguaje: su tarea es mapear 58 características geométricas y de coordenadas a campos de flujo.

La arquitectura es un perceptrón multicapa de 6 capas ocultas de anchura 384 con activación SiLU y codificación Fourier de 8 bandas de frecuencia, más una cabeza separada que estima la caída de presión a partir de 11 descriptores geométricos. El total de parámetros entrenables es de 1.122.388, un orden de magnitud propio de un modelo ligero que puede ejecutarse en CPU.

Su relevancia es acotada pero clara: proporciona una vía de inferencia casi instantánea para sustituir barridos paramétricos de CFD en fase de diseño térmico, a cambio de una validez restringida al régimen físico y al conjunto de 35 geometrías con el que se entrenó. El repositorio no declara licencia, idiomas ni métricas de error, y no registra descargas ni interacciones, por lo que la validación externa es nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con codificación Fourier de la entrada y cabeza de regresión de caída de presión independiente |
| Parámetros totales | 1.122.388 (red principal 1.120.903 + cabeza de presión 1.485) |
| Parámetros activos | No aplicable (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplicable (la entrada es un vector fijo de 58 características, no una secuencia de tokens) |
| Tipos de cuantización | No disponible (no se documenta ninguna cuantización; el checkpoint está en punto flotante) |
| Idiomas soportados | No aplicable (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch `.pt` basado en pickle, con `state_dict` de modelo y cabeza de presión más metadatos NumPy; no hay safetensors ni GGUF |
| Dimensión de entrada | 58 características crudas → 986 valores tras codificación Fourier (58 + 58 × 2 × 8 frecuencias) |
| Variables de salida | 7: `u`, `v`, `w`, `p`, `k`, `epsilon`, `temperature` |
| Anchura oculta | 384 |
| Capas ocultas | 6 (7 capas lineales en la red principal) |
| Activación | SiLU |
| Paso de entrenamiento | 600.000 |
| Geometrías de entrenamiento | 35 (33 con objetivos de presión ajustados) |
| Backend de datos | CUDA |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

La red principal recibe 58 características (coordenadas `x`, `y`, `z`, distancias a entrada, salida y pared, descriptores de "gráfico local" como radios, eigenvalores de covarianza, anisotropía y planaridad, métricas geométricas globales como área superficial, volumen, diámetro hidráulico equivalente y número de constricciones fuertes, y tres características geodésicas de conectividad de flujo: `geodesic_distance_from_inlet`, `geodesic_distance_to_outlet` y `flow_coordinate_s`). Estas 58 entradas se codifican con 8 bandas de frecuencia en seno y coseno, generando 986 valores que alimentan un MLP de 986 → 384 → 384 → 384 → 384 → 384 → 384 → 7. La cabeza de presión es una rama aparte que predice `log(delta_p)` a partir de 11 descriptores geométricos mediante un regresor lineal tipo ridge (11 → 1) más una corrección no lineal (11 → 32 → 32 → 1).

El entrenamiento se realizó con Adam durante 600.000 pasos sobre datos generados con STAR-CCM+ (versión 2402.0001 / 19.02.013), usando el modelo de turbulencia `RkeTwoLayerTurbModel` y el tratamiento de pared `KeTwoLayerAllYplusWallTreatment` en el continuo `02.Coolant(LLC-10) - Steady`. Los campos supervisados son `u`, `v` y `w` junto con objetivos derivados de la presión; `k`, `epsilon` y `temperature` se describen como campos latentes restringidos por la física, no supervisados directamente. La presión física no se predice de forma directa: se reconstruye como `p = outlet_pressure + delta_p * p_shape`, donde `p_shape` es una salida interna y `delta_p` proviene de la cabeza de presión condicionada por geometría.

El checkpoint incluye además el estado del optimizador Adam, el estado del planificador de tasa de aprendizaje, los arrays de normalización (`feature_mean`, `feature_scale`, `label_mean`, `label_scale`), los contratos de características y salidas, y metadatos de similitud geométrica. El identificador de esquema guardado es `canonical_local_chart_dim55_geometry_conditioned_v1`, un nombre heredado que no refleja la dimensión real de 58 entradas.

## Capacidades

- Predicción de los tres componentes de velocidad (`u`, `v`, `w`) en régimen estacionario para el dominio de refrigerante modelado.
- Reconstrucción de presión física mediante una cabeza de caída de presión condicionada por 11 descriptores geométricos.
- Predicción de campos latentes `k` (energía cinética turbulenta), `epsilon` (disipación) y `temperature`, restringidos por la física pero no supervisados directamente.
- Codificación de geometría compleja mediante 58 características que combinan coordenadas, gráficos locales, estadísticas globales de la geometría y distancias geodésicas de conectividad de flujo.
- Inferencia por punto espacial independiente, sin dependencia de secuencia ni de memoria de estado.
- No soporta *tool calling*, ni *function calling*, ni uso como agente.
- No tiene capacidades multilingües, de visión, de audio ni de razonamiento en lenguaje natural.
- No dispone de modo de "pensamiento" ni de generación autoregresiva.

## Casos de uso

- **Sustitución de CFD en etapas tempranas de diseño térmico**: en lugar de lanzar una simulación RANS completa en STAR-CCM+ para cada variante de un circuito de refrigeración, se evalúa la red sobre la malla de puntos deseada y se obtiene una estimación inmediata de velocidades y presión. Es adecuado porque el modelo fue entrenado precisamente sobre ese flujo y ese refrigerante.

- **Barridos paramétricos y optimización geométrica**: la cabeza de presión permite obtener `delta_p` para variantes geométricas descritas por 11 descriptores, de modo que puede insertarse como función objetivo en bucles de optimización (por ejemplo, optimización bayesiana o algoritmos genéticos) donde cada evaluación CFD sería prohibitiva.

- **Detección temprana de zonas de estancamiento y puntos calientes**: a partir del campo de velocidad y del campo latente de temperatura, el modelo permite localizar regiones de baja velocidad o recirculación en el diseño de un canal o colector antes de comprometer recursos en una simulación completa.

- **Generación de campos iniciales para simulaciones de alto coste**: los campos `u`, `v`, `w` y `p` predichos pueden servir como condición inicial para una simulación RANS o URANS posterior, reduciendo el número de iteraciones necesarias para alcanzar convergencia.

- **Análisis de sensibilidad a la geometría**: modificando los descriptores geométricos globales (área superficial, volumen, diámetro hidráulico equivalente, número de constricciones fuertes, fracción de superficie de alta curvatura) es posible estudiar de forma rápida cómo afectan al campo fluido, siempre dentro del rango cubierto por las 35 geometrías de entrenamiento.

- **Prototipado de herramientas de diseño interactivas**: al ser un modelo de 1,1 millones de parámetros, puede integrarse en una aplicación de escritorio o servicio web que devuelva campos de flujo en milisegundos, algo inviable con un solver CFD completo.

- **Validación cruzada con simulaciones puntuales**: usar el sustituto como filtro previo para decidir qué configuraciones merecen una simulación CFD completa, reduciendo el número total de simulaciones de alta fidelidad.

- **Investigación en PINN aplicadas a CFD**: el repositorio incluye el historial de pérdida (`starccm_pinn_loss_history.csv`, 3.001 registros), el *script* de entrenamiento y el constructor de datos en CUDA, lo que permite reutilizar la metodología de características en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de error (ni RMSE, ni error relativo, ni comparaciones contra el solver de referencia) en la model card, y el historial de pérdida se menciona pero no se transcriben sus valores. Los benchmarks habituales de modelos de lenguaje (MMLU, HumanEval, GSM8K) no son aplicables a este modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los 1.122.388 parámetros ocupan aproximadamente 4,5 MB en punto flotante de 32 bits y unos 2,2 MB en 16 bits, antes de tener en cuenta los tensores intermedios del lote. Un lote de un único punto tiene una dimensión de entrada efectiva de 986 valores, por lo que el consumo de memoria es mínimo.
- **Cabe en GPU de consumo**: sí, en cualquier GPU consumer actual (serie RTX 30/40, e incluso GPUs integradas). También es viable la inferencia en CPU.
- **GPU recomendadas**: no hay una recomendación publicada. El autor indica que el backend de datos durante el entrenamiento fue CUDA, pero no especifica el modelo de GPU utilizado.
- **Opciones de despliegue**: al ser un checkpoint de PyTorch con dependencia de las clases del entrenador incluido, el despliegue requiere cargar `bedrock_trainer_dim55.py` para instanciar la arquitectura y después cargar los `state_dict` de `model` y `pressure_head`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje. Una exportación a TorchScript u ONNX no está documentada.
- **Latencia y throughput**: no hay cifras publicadas. Como estimación derivada del recuento de parámetros (no facilitada por el autor), cada punto evaluado requiere del orden de 2,2 millones de operaciones de multiplicación-acumulación, lo que sitúa la evaluación por punto en el rango de microsegundos en una GPU moderna, excluyendo el coste de construir las 58 características de entrada.

## Comparativa con modelos similares

No disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con su categoría; los resultados obtenidos corresponden a la base de datos geográfica BD TOPO del IGN francés y no guardan relación. No se dispone, por tanto, de datos comparativos contrastados frente a otras arquitecturas sustitutas de CFD (por ejemplo, DeepONet, Fourier Neural Operator o PINN de dominio completo).

## Limitaciones y advertencias

- **Validez física muy restringida**: el modelo está entrenado para un único refrigerante (LLC-10), un único régimen de entrada (25,0 L/min), una única temperatura de entrada (298,15 K) y un único modelo de turbulencia. No hay evidencia de que las predicciones sean válidas fuera de ese intervalo.
- **Dependencia de la geometría de entrenamiento**: solo se declaran 35 geometrías de entrenamiento. La extrapolación a geometrías sustancialmente distintas no está validada y puede producir errores arbitrariamente grandes.
- **Campos latentes no supervisados**: `k`, `epsilon` y `temperature` no tienen objetivos directos de supervisión según la propia model card, por lo que su fiabilidad es menor que la de `u`, `v` y `w`.
- **Ausencia de métricas de error**: no se publica ningún RMSE, error relativo ni comparación contra el solver STAR-CCM+. Sin estas cifras no es posible acotar el error esperado en producción.
- **Ausencia de licencia declarada**: el repositorio no especifica licencia. No se puede asumir permiso de uso comercial, modificación o redistribución.
- **Riesgo de seguridad en la carga**: el checkpoint requiere `torch.load` con `weights_only=False` porque contiene metadatos NumPy además de tensores. Esto permite la ejecución de código arbitrario contenido en el pickle; solo debe cargarse desde fuentes de confianza.
- **No es un modelo autónomo**: no existe una clase de modelo serializada. Es necesaria la implementación del entrenador incluida en el repositorio para reconstruir la arquitectura antes de cargar los pesos.
- **Contrato de entrada estricto**: las 58 características deben construirse en el orden exacto documentado y normalizarse con `feature_mean` y `feature_scale`. Cualquier reordenación o cambio de escala invalida silenciosamente las predicciones.
- **Inconsistencia de nombres**: el identificador de esquema conserva el sufijo `dim55` aunque el checkpoint usa 58 entradas, y el archivo del entrenador se llama `bedrock_trainer_dim55.py`. Es un riesgo de confusión al integrar versiones distintas.
- **Tamaño de repositorio reportado de 0,0 GB**: la métrica de Hugging Face no refleja el contenido declarado en la model card, lo que puede indicar que los archivos no están efectivamente alojados o que la medición no se ha actualizado.
- **Sin validación por la comunidad**: cero descargas y cero interacciones en el momento de la consulta.
- **Sesgo de dominio**: cualquier conclusión extraída sobre el comportamiento del flujo está condicionada por los datos sintéticos de STAR-CCM+ y por la configuración de malla usada en el entrenamiento, que no se detalla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hosseinbv/bedrock-checkpoints-58
- No se han encontrado papers, blogs, repositorios ni demostraciones asociados al modelo en la búsqueda web realizada. Los únicos resultados devueltos corresponden a la BD TOPO del IGN francés y no son relevantes.
