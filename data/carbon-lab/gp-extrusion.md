# carbon-lab/gp-extrusion

## Resumen

gp-extrusion es un modelo de proceso gaussiano (Gaussian Process, GP) desarrollado por carbon-lab que actúa como motor de diseño experimental y optimización bayesiana para un proceso de extrusión de materiales. No es un modelo de lenguaje: es un modelo probabilístico supervisado que mapea tres parámetros de proceso (CD.T., RPM y B.T.) a doce salidas estructurales medidas mediante SAXS y corte, y propone qué combinaciones de parámetros ejecutar a continuación para reducir la incertidumbre sobre todo el espacio de proceso.

El modelo se distribuye como un checkpoint PyTorch (`model.pt`) con código de inferencia y propuesta de nuevos experimentos en el repositorio. Su valor diferencial no está en predecir con precisión un punto concreto, sino en cuantificar de forma calibrada dónde el conocimiento es escaso y seleccionar los siguientes experimentos en consecuencia. En el benchmark simulado incluido por el autor, tras 24 ejecuciones adicionales el error sobre todo el espacio cae a 0,16 σ frente a 0,24 σ de muestreo aleatorio y 0,77 σ de un barrido one-factor-at-a-time.

Es relevante para grupos de investigación experimental que necesitan optimizar el uso de recursos limitados (cada extrusión consume material, tiempo de máquina y presupuesto) y quieren sustituir barridos sistemáticos por campañas de aprendizaje activo con incertidumbre explícita. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el checkpoint está ajustado únicamente a 8 configuraciones, la mitad sintéticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proceso gaussiano por salida (12 GPs independientes), kernel RBF con lengthscales ARD, ruido fijo 1e-6, salidas z-scored |
| Parametros totales | no disponible (hiperparámetros de GP, no pesos de red neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 3 variables de proceso) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `model.pt`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch), más `config.json` con los límites de las variables de entrada |

Entradas: CD.T. (40–90, paso 5), RPM (150–500, paso 25), B.T. en °C (120–150, paso 5). Salidas: `saxs_np_radius`, `saxs_fractal_dim`, `saxs_nematic_order` y `cutting_ai`, cada una en tres posiciones (Mid, Side, Top), total 12 salidas.

## Arquitectura y entrenamiento

El modelo es un conjunto de 12 procesos gaussianos independientes, uno por cada salida. Cada GP usa un kernel de base radial (RBF) con lengthscales por dimensión (ARD), ruido fijo de 1e-6 y salidas estandarizadas (z-score). Las entradas se escalan al cubo unitario usando los límites definidos en `config.json`. La adquisición de nuevos puntos es un batch greedy: se toma la configuración no medida de la rejilla con mayor varianza posterior media, se condiciona el modelo sobre ella y se repite hasta completar el lote de tamaño q. Como la varianza posterior no depende de los valores medidos, un lote de q configuraciones puede elegirse exactamente sin ejecutar nada entre medias.

El checkpoint distribuido está ajustado a las 8 configuraciones del dataset `carbon-lab/extrusion-saxs` (4 reales y 4 sintéticas, estas últimas con RPM = 300). No hay información sobre un proceso de entrenamiento adicional, regularización, validación cruzada ni búsqueda de hiperparámetros más allá de la configuración descrita. El autor indica explícitamente que las lengthscales apenas están identificadas con 8 puntos y que la dimensión B.T. no está identificada en absoluto.

## Capacidades

- Predicción de 12 salidas estructurales (radio de nanopartículas, dimensión fractal, orden nemático y corte AI, cada una en Mid, Side y Top) a partir de tres parámetros de proceso.
- Cuantificación de incertidumbre calibrada: `predict` devuelve media y varianza, con la varianza expresada en unidades de la varianza previa (0 = totalmente conocido, 1 = nada conocido).
- Selección de los siguientes experimentos por máxima varianza posterior media sobre una rejilla de configuraciones ejecutables.
- Generación de lotes de tamaño q mediante condicionamiento secuencial greedy, sin necesidad de ejecutar experimentos intermedios.
- Bucle de refinamiento: proponer lote, ejecutar extrusiones, añadir filas y reajustar el modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo de texto.

## Casos de uso

- Planificación de campañas experimentales de extrusión: dado un conjunto inicial de 8 configuraciones medidas, el modelo propone el siguiente lote de 4 experimentos en las zonas del espacio CD.T. × RPM × B.T. con mayor incertidumbre, reduciendo el número de extrusiones necesarias para caracterizar el proceso.
- Sustitución de barridos one-factor-at-a-time: en el benchmark del autor, el GP alcanza 0,52 σ de error tras 4 ejecuciones adicionales frente a 0,88 σ del barrido, lo que permite justificar ante un comité científico el cambio de metodología experimental.
- Exploración de regiones no muestreadas: la figura del modelo muestra que con datos solo en la rebanada B.T. = 130 °C, el GP propone puntos en B.T. = 120 y 150 °C, donde no ha visto nada, para identificar el efecto de esa variable.
- Control de presupuesto de material y máquina: al priorizar configuraciones de alta varianza, se evita gastar extrusiones en zonas ya bien caracterizadas, algo crítico cuando cada ejecución consume material escaso.
- Integración en un pipeline de laboratorio automatizado: el comando `python -m gp_extrusion.propose -q 4` devuelve las siguientes configuraciones en formato consumible por un sistema de control de la extrusora.
- Docencia y prototipado de aprendizaje activo: el repositorio incluye la verdad simulada (`truth.py`) y las figuras de comparación, lo que permite reproducir el benchmark de estrategias (barrido, aleatorio, GP) con fines formativos o para validar variantes del algoritmo de adquisición.
- Análisis de sensibilidad por salida: al disponer de 12 GPs independientes con lengthscales ARD, se puede inspeccionar qué parámetro de proceso domina cada salida estructural, aunque con las limitaciones de identificación señaladas por el autor.

## Benchmarks y rendimiento

Resultados del benchmark simulado del autor. Error RMSE sobre todas las configuraciones extruibles de la rejilla, en desviaciones estándar de la verdad simulada (placeholder), promediado sobre las 12 salidas. Menor es mejor.

| Ejecuciones añadidas | One factor at a time | Aleatorio, mediana (10 semillas, rango) | GP-guided |
|---|---|---|---|
| 0 | 1,02 | 1,02 (1,02 a 1,02) | 1,02 |
| 4 | 0,88 | 0,76 (0,62 a 0,98) | 0,52 |
| 8 | 0,91 | 0,53 (0,42 a 0,66) | 0,39 |
| 12 | 0,91 | 0,38 (0,32 a 0,51) | 0,25 |
| 16 | 0,89 | 0,31 (0,25 a 0,46) | 0,22 |
| 20 | 0,88 | 0,28 (0,21 a 0,39) | 0,21 |
| 24 | 0,77 | 0,24 (0,19 a 0,29) | 0,16 |

Extrusiones fallidas (configuraciones que no extruyen): 4 con one-factor-at-a-time, 0,9 de media con aleatorio y 0 con GP-guided. El autor advierte que el GP no modela la viabilidad, por lo que esa diferencia es en parte suerte.

Primer lote propuesto por el GP:

| CD.T. | RPM | B.T. |
|---|---|---|
| 40 | 500 | 150 |
| 90 | 500 | 150 |
| 65 | 200 | 150 |
| 40 | 500 | 120 |

No se han publicado resultados de benchmarks sobre datos reales ni comparaciones con otros modelos de GP o de optimización bayesiana en la información disponible.

## Requisitos de hardware

- El modelo es un conjunto de 12 GPs con 8 puntos de entrenamiento; la inferencia y la propuesta de lotes se ejecutan en CPU sin problema.
- VRAM estimada: no disponible; no requiere GPU. Cabe en cualquier equipo con Python y PyTorch instalado.
- GPU recomendadas: no aplica. Cualquier GPU compatible con PyTorch funcionaría, pero no aporta ventaja significativa para este tamaño de modelo.
- Cabe en cualquier consumer GPU y en CPU.
- Opciones de despliegue: ejecución directa con PyTorch (`GPModel.load("model.pt")`) y el módulo `gp_extrusion.propose`; el autor documenta el uso con `uv` y `requirements.txt`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explícita. Por la naturaleza del modelo (12 GPs con 8 puntos y una rejilla de configuraciones de tamaño moderado), se espera latencia de milisegundos a pocos segundos por propuesta de lote en CPU, aunque el autor no publica mediciones.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de la misma categoría (GP para diseño experimental en extrusión o SAXS) con parámetros, contexto y licencia verificables. La comparación relevante que aporta el autor es frente a estrategias de muestreo, no frente a otros modelos:

| Estrategia | Error tras 24 ejecuciones (σ) | Modela incertidumbre | Modela viabilidad | Requiere checkpoint |
|---|---|---|---|---|
| One factor at a time | 0,77 | No | No | No |
| Muestreo aleatorio | 0,24 (mediana) | No | No | No |
| GP-guided (este modelo) | 0,16 | Sí | No | Sí |

## Limitaciones y advertencias

- La verdad simulada del benchmark es un placeholder: está anclada a la hoja de cálculo en B.T. = 130 y diseñada a mano en el resto (`truth.py`). Los resultados muestran la eficiencia de la estrategia, no el comportamiento real del material.
- La mitad de los datos de entrenamiento son sintéticos (RPM = 300). El checkpoint distribuido es para validar el pipeline, no para afirmaciones científicas.
- Con 8 configuraciones, las lengthscales apenas están identificadas y la dimensión B.T. no está identificada en absoluto.
- No hay modelo de viabilidad: las extrusiones fallidas solo cuestan presupuesto y el GP no aprende la bandera de extrusión.
- El modelo asume ausencia de ruido; las mediciones reales son ruidosas y requieren repeticiones para estimar la varianza.
- La adquisición por máxima varianza favorece los bordes de la caja, por lo que los primeros lotes se sitúan en los límites y pueden agruparse.
- XRD no está modelado (solo hay 3 mediciones reales de esa técnica).
- Las salidas se modelan de forma independiente; no se explota la correlación entre posiciones ni entre salidas.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Sin datos de sesgo, alucinación o comportamiento multilingüe por no ser un modelo de lenguaje; los riesgos relevantes son los de extrapolación del GP fuera del dominio muestreado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/carbon-lab/gp-extrusion
- Dataset de entrenamiento: https://huggingface.co/datasets/carbon-lab/extrusion-saxs
- Repositorio de código: incluido en el propio repositorio de Hugging Face (módulo `gp_extrusion`, `src/gp_extrusion/truth.py`, `config.json`, `model.pt`)
- Figuras de referencia en el repo: `figures/hero.png`, `figures/truth.png`, `figures/fit.png`, `figures/feasibility.png`, `figures/uncertainty.png`, `figures/campaign.gif`
- Paper, blog o demo adicionales: no disponible
