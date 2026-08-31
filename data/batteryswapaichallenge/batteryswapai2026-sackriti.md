# batteryswapaichallenge/BatterySwapAI2026-sackriti

## Resumen

BatterySwapAI2026-sackriti es una solución presentada al desafío BatterySwapAI 2026, organizado por NORA (Norwegian Artificial Intelligence Research Consortium) con datos de Soundsensing. No se trata de un modelo de lenguaje ni de un sistema de IA generativa, sino de un pipeline completo de predicción de vida útil restante (RUL) y planificación de reemplazos para baterías de sensores IoT desplegados en edificios comerciales noruegos. El repositorio contiene un planificador serializado en `best.pickle` y un script de entrada `script.py` que genera el archivo `submission.csv` requerido por la competición.

El método se basa en una observación clave: el fin de vida de una batería se define exactamente como el primer día en que la tensión suavizada oficial (usando la función `smooth_series` del propio organizador) alcanza o baja de 2,40 V. Esto convierte el problema en un problema de primer paso (first-passage), no de clasificación. La solución combina un modelo de supervivencia entrenado sobre la distribución de caídas de tensión, un factor estacional común y un scheduler que optimiza selección, timing y rutas de reemplazo según el coste esperado. El repositorio es reproducible solo con CPU, sin dependencias de red ni datos incluidos.

La relevancia actual radica en que aborda un problema real de mantenimiento predictivo en IoT, con un enfoque que reduce el coste operativo en un 28,7% respecto a la versión anterior (submission 016) en validación out-of-fold. Aunque no es un modelo de IA generativa, su inclusión en este blog responde a la necesidad de documentar soluciones técnicas de IA aplicada en competiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de planificacion: modelo de supervivencia sobre distribucion de drawdown + scheduler (no se especifica algoritmo exacto del modelo de supervivencia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (no es un modelo de redes neuronales con pesos cuantizables) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | pickle (archivo `best.pickle`) |

## Arquitectura y entrenamiento

La solucion no emplea una arquitectura transformer ni MoE. Se compone de varios modulos:

1. **Smoother oficial reimplementado**: una version vectorizada de `smooth_series` del organizador, bit-identica al original (max diferencia absoluta 0.0 en 336.096 filas publicas). El detalle critico es que el smoother oficial remuestrea a una rejilla diaria densa antes de descartar dias con menos de cinco lecturas, y la mediana movil de siete slots abarca siete dias calendario, no siete observaciones.

2. **Modelo de supervivencia sobre la distribucion de drawdown**: en lugar de predecir directamente "falla en h dias", se entrena sobre la pregunta general "la tension cae al menos m en h dias", donde m es el margen actual de la bateria. Esto convierte 454 filas positivas en 2,0 millones de preguntas etiquetadas, sobremuestreando el margen real para mayor precision en la zona de consulta.

3. **Estacionalidad**: se estima un factor comun transversal contemporaneo y una climatologia dia-del-ano basada solo en datos pasados. La oscilacion estacional es de ~0,048 V pico a valle, frente a una caida tipica de 0,0022 V/dia cerca del fallo. Esto explica que 46 de 82 cruces ocurran entre septiembre y enero.

4. **Scheduler de coste esperado**: cada bateria se valora con su curva de supervivencia, incluyendo el coste de retiro tardio (10 horas-equivalentes por dia) y el coste de reemplazo innecesario (0,5 por dia de vida restante). El scheduler decide seleccion, timing y rutas conjuntamente, respetando los limites diarios y semanales del evaluador.

El entrenamiento se realiza con datos publicos del desafio, sin usar etiquetas en inferencia (el umbral de 2,40 V se deriva de los minimos historicos de baterias vivas). No se menciona uso de RLHF ni DPO.

## Capacidades

- Prediccion de vida util restante (RUL) de baterias IoT mediante un modelo de supervivencia.
- Planificacion de reemplazos optimizando coste total (retiro tardio vs reemplazo prematuro).
- Gestion de rutas de trabajo de campo con restricciones de tiempo, desplazamiento y capacidad diaria/semanal.
- Manejo de incertidumbre: el modelo produce distribuciones de supervivencia, no solo puntos.
- Deteccion de estacionalidad y su impacto en el envejecimiento de baterias.
- Recomputacion completa del estado causal en cada escenario, sin dependencia de datos futuros.
- Ejecucion reproducible en CPU, sin necesidad de GPU ni aceleracion.

## Casos de uso

- **Mantenimiento predictivo de flotas de sensores IoT**: el sistema predice cuando cada bateria alcanzara el umbral de 2,40 V, permitiendo programar reemplazos antes del fallo. Es adecuado porque el modelo de supervivencia captura la incertidumbre inherente a la degradacion.
- **Optimizacion de rutas de tecnicos de campo**: el scheduler integra seleccion de baterias, timing y rutas, minimizando costes de desplazamiento y horas extra. Util para empresas con decenas de edificios y cientos de sensores.
- **Reduccion de costes operativos en monitorizacion ambiental**: al evitar reemplazos innecesarios y retiros tardios, se ahorra en material y mano de obra. El coste se reduce un 28,7% frente a una estrategia basada en clasificacion simple.
- **Planificacion estacional de mantenimiento**: dado que los fallos se concentran en otono e invierno, el sistema permite anticipar picos de trabajo y asignar recursos en consecuencia.
- **Auditoria de datos de telemetria**: el smoother reimplementado verifica la integridad de las series temporales, detectando dias con pocas lecturas que podrian distorsionar el analisis.
- **Benchmarking de estrategias de reemplazo**: el repositorio incluye un procedimiento de validacion out-of-fold que permite comparar diferentes politicas de mantenimiento sobre datos historicos.

## Benchmarks y rendimiento

La model card reporta resultados de validacion out-of-fold (coste menor es mejor) para la submission 021 frente a la 016:

| Vista de validacion | Submission 016 | Submission 021 | Delta |
| --- | ---: | ---: | ---: |
| Out-of-fold disjunto por bateria, 48 escenarios | 1735.7828 | **1237.0882** | **−498.6946 (−28.7%)** |
| Out-of-fold disjunto por edificio, 48 escenarios | 1767.6100 | **1350.6761** | **−416.9339 (−23.6%)** |

No se proporcionan benchmarks clasicos (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje. El rendimiento se mide en coste operativo simulado por el evaluador oficial.

## Requisitos de hardware

- **CPU-only**: el repositorio esta disenado para ejecutarse sin GPU. El script principal `script.py` carga el planner y genera la submission.
- **Memoria**: no especificada, pero el tamano del repo es de 0.2 GB, lo que sugiere que el pickle del planner es ligero y cabe en RAM de cualquier maquina moderna.
- **Tiempo de ejecucion**: el smoother vectorizado tarda 1.6 segundos en procesar 336.096 filas, lo que indica que el pipeline completo es rapido en CPU.
- **Despliegue**: no requiere vLLM, llama.cpp ni Ollama. Se ejecuta como un script Python estandar.
- **Latencia**: no se reportan metricas de latencia, pero al ser un proceso batch (no tiempo real), la latencia no es critica.

## Comparativa con modelos similares

No disponible. No se han encontrado otras soluciones publicadas del mismo desafio con las que comparar directamente. El repositorio de ZRPATeam (enlace en la seccion de enlaces) usa LightGBM con calibracion por tipo de edificio y un solver OR-Tools para rutas, pero no se dispone de sus metricas de coste para una comparacion cuantitativa.

## Limitaciones y advertencias

- **Dependencia del umbral de 2,40 V**: aunque el sistema no usa el umbral en inferencia, la definicion del fin de vida esta ligada a ese valor, que fue leido de las etiquetas publicas. Si el organizador cambiara el criterio en la split oculta, el modelo podria degradarse.
- **Sobreajuste a datos noruegos**: la estacionalidad y los patrones de uso son especificos de edificios comerciales en Noruega. Aplicarlo a otras regiones o tipos de sensores requeriria reentrenamiento.
- **Riesgo de alucinacion**: no aplica, al no ser un modelo generativo.
- **Sesgos**: no se han documentado sesgos especificos, pero el modelo depende de la calidad de la telemetria; dias con pocas lecturas pueden afectar al smoother.
- **Restricciones de licencia**: licencia MIT, permite uso comercial y modificacion, pero el repositorio no incluye los datos del desafio (por cumplimiento de la competicion).
- **Caveat de produccion**: el scheduler asume que el evaluador usa la misma funcion de coste; en un despliegue real, los costes de desplazamiento y mano de obra pueden variar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/batteryswapaichallenge/BatterySwapAI2026-sackriti
- Perfil del organizador en HuggingFace: https://huggingface.co/batteryswapaichallenge
- Ejemplo de submission del organizador: https://huggingface.co/batteryswapaichallenge/BatterySwapAI2026-Example
- Pagina del desafio en NORA: https://www.nora.ai/competitions/batteryswapai/batteryswapai2026.html
- FAQ del desafio: https://www.nora.ai/competitions/batteryswapai/batteryswapai-faq.html
- Solucion alternativa de ZRPATeam en GitHub: https://github.com/ZRPATeam/BatterySwapAI-2026/
