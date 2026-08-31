# DKFZ-RadOpt/pyRadPlan-dosecalc-Det-VHEE-150-lung

## Resumen

El modelo `pyRadPlan-dosecalc-Det-VHEE-150-lung` es un predictor determinista de dosis física para terapia con electrones de muy alta energía (VHEE, por sus siglas en inglés) en casos de pulmón, desarrollado por el grupo DKFZ-RadOpt del Centro Alemán de Investigación del Cáncer (DKFZ). Está diseñado para una energía fija de haz de 150 MeV y utiliza una arquitectura de red neuronal convolucional denominada `ConvBayes_new` que, a partir de un cubo de tomografía computarizada (CT) y un beamlet (haz elemental), predice en una única pasada hacia adelante el cubo de dosis física local depositada.

El modelo se integra directamente como motor de cálculo de dosis `AIBeamletEngine` en el paquete de planificación de tratamiento radioterápico de código abierto pyRadPlan, lo que permite sustituir los costosos cálculos Monte Carlo por una inferencia neuronal rápida. Su relevancia radica en acelerar significativamente la planificación de tratamientos con VHEE, una modalidad emergente que promete ventajas dosimétricas frente a fotones y protones, especialmente en tumores profundos o con heterogeneidades como el pulmón. El repositorio incluye los pesos entrenados en formato `safetensors`, la definición de la red, el preprocesador y un archivo de configuración declarativa, siguiendo el contrato de modelos de pyRadPlan.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (`ConvBayes_new`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada 3D: CT + beamlet) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura convolucional (`ConvBayes_new`) que procesa un cubo de CT y un beamlet para producir un cubo de dosis física. Es un modelo determinista, es decir, realiza una única pasada hacia adelante sin muestreo estocástico, lo que lo hace adecuado para integración en pipelines de optimización donde se requiere consistencia y rapidez. El entrenamiento se realizó con datos simulados (presumiblemente mediante métodos Monte Carlo, aunque no se especifica en la documentación disponible) para la modalidad VHEE, con energía fija de 150 MeV, anatomía de pulmón y una máquina genérica. La cuadrícula de muestreo tiene un espaciado de 2 mm, con un ancho de campo lateral de 52 mm (±26 mm) y una ventana de profundidad de [−350, 350] mm relativa al origen del beamlet. No se proporcionan detalles sobre el número de muestras, el proceso de entrenamiento (pérdida, optimizador, épocas) ni sobre técnicas como aumento de datos o regularización.

## Capacidades

- Predicción de dosis física local (`physical_dose`) a partir de un cubo de CT y un beamlet.
- Integración como motor de cálculo de dosis `AIBeamletEngine` en pyRadPlan, permitiendo el cálculo de la matriz de influencia de dosis (dij) de forma eficiente.
- Soporte para un único nivel de energía (150 MeV) en modo VHEE; existen modelos complementarios para 100 y 200 MeV en la misma colección.
- Salida en formato de cubo 3D con resolución espacial de 2 mm, alineada con la cuadrícula de planificación.
- No es un modelo de lenguaje ni multimodal; no ofrece capacidades de generación de texto, razonamiento simbólico, tool calling ni agentes.

## Casos de uso

- Planificación de tratamiento con VHEE en pulmón: el modelo permite calcular la matriz de influencia de dosis (dij) de forma casi instantánea, sustituyendo a los algoritmos Monte Carlo en el bucle de optimización de fluencia. Esto reduce el tiempo de cómputo de horas a segundos, facilitando la exploración de múltiples planes.
- Optimización de intensidad modulada (IMRT/VMAT adaptado a electrones): al ser determinista y rápido, puede integrarse en algoritmos de optimización iterativa que requieren múltiples evaluaciones de la función de coste.
- Investigación en dosimetría de VHEE: permite estudiar el impacto de la energía del haz (comparando con los modelos de 100 y 200 MeV) en la distribución de dosis para casos de pulmón, sin necesidad de ejecutar simulaciones costosas.
- Validación y verificación de planes: el modelo puede usarse como herramienta de segunda opinión para comprobar la coherencia de los resultados de otros motores de cálculo, aunque se debe tener en cuenta su rango de validez limitado.
- Docencia y formación en física médica: al estar integrado en pyRadPlan, sirve como ejemplo práctico de aplicación de aprendizaje profundo en radioterapia, permitiendo a estudiantes e investigadores experimentar con cálculo de dosis neuronal.
- Desarrollo de nuevos algoritmos de planificación: al proporcionar una salida diferenciable (a través de la red), puede emplearse en optimización basada en gradientes o en aprendizaje por refuerzo para planificación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas cuantitativas de precisión dosimétrica (p. ej., comparación con Monte Carlo mediante gamma index), ni comparaciones con otros motores de cálculo. Tampoco se indican tiempos de inferencia ni requisitos de hardware específicos.

## Requisitos de hardware

- No se especifican requisitos mínimos de VRAM ni de GPU en la documentación del modelo.
- Al ser una red convolucional para procesamiento de volúmenes 3D, se espera que sea ligera y pueda ejecutarse en GPUs de consumo (p. ej., NVIDIA RTX series) con al menos 8 GB de VRAM, aunque no hay confirmación oficial.
- El modelo se ejecuta mediante PyTorch y se integra en pyRadPlan, que requiere una instalación de Python con dependencias científicas (NumPy, SciPy, etc.).
- Para despliegue en producción, se puede utilizar el propio pyRadPlan o exportar el modelo a formatos optimizados (TorchScript, ONNX) si se desea integrar en otros entornos.
- No se dispone de datos de latencia o throughput; al ser una única pasada hacia adelante, se espera que sea del orden de milisegundos en GPU, pero no está documentado.

## Comparativa con modelos similares

| Modelo | Modalidad | Energía | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pyRadPlan-dosecalc-Det-VHEE-150-lung` (este) | VHEE | 150 MeV | ConvBayes_new (determinista) | BSD-3-Clause | HuggingFace |
| `pyRadPlan-dosecalc-Det-VHEE-100-lung` | VHEE | 100 MeV | ConvBayes_new (determinista) | BSD-3-Clause | HuggingFace (colección) |
| `pyRadPlan-dosecalc-Det-VHEE-200-lung` | VHEE | 200 MeV | ConvBayes_new (determinista) | BSD-3-Clause | HuggingFace (colección) |
| `pyRadPlan-dosecalc-Bayes-proton-lung` | Protones | no especificada | Bayes (probabilístico) | BSD-3-Clause | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparación se limita a la modalidad, energía y tipo de arquitectura. Todos pertenecen a la misma colección de DKFZ-RadOpt y siguen el mismo contrato de integración con pyRadPlan.

## Limitaciones y advertencias

- El modelo solo es válido para la energía de 150 MeV, anatomía de pulmón y dentro del rango de profundidad [−350, 350] mm y ancho de campo lateral de 52 mm. Las predicciones fuera de este rango no están garantizadas; el motor `AIBeamletEngine` emite una advertencia si el plan excede los límites declarados.
- La precisión clínica no está documentada; no se han publicado validaciones dosimétricas formales (p. ej., comparación con medidas experimentales o simulaciones Monte Carlo de referencia).
- Al ser un modelo entrenado con datos simulados, puede presentar sesgos derivados de las suposiciones del simulador (por ejemplo, la composición del tejido pulmonar, la heterogeneidad, etc.).
- Riesgo de alucinación: aunque no es un modelo generativo de texto, puede producir predicciones incorrectas en regiones fuera de su dominio de entrenamiento, lo que podría llevar a errores en la planificación si no se valida adecuadamente.
- Ejecución de código remoto: cargar el modelo ejecuta `model.py` y `preprocessor.py` incluidos en el repositorio, con `trust_remote_code` activado por defecto en `pyRadPlan.ml`. Esto implica un riesgo de seguridad si el repositorio se ve comprometido; se recomienda auditar el código antes de su uso en entornos sensibles.
- No hay información sobre la versión de PyTorch requerida ni sobre compatibilidad con versiones futuras de pyRadPlan.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente y aún no ampliamente adoptado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DKFZ-RadOpt/pyRadPlan-dosecalc-Det-VHEE-150-lung
- Colección pyRadPlan-dosecalc: https://huggingface.co/collections/DKFZ-RadOpt/pyradplan-dosecalc
- Documentación de pyRadPlan (cálculo de dosis): https://pyradplan.readthedocs.io/en/latest/user_guide/concepts/dose_calculation.html
- Repositorio GitHub de pyRadPlan: https://github.com/e0404/pyRadPlan
- Modelo relacionado (protones, Bayes): https://huggingface.co/DKFZ-RadOpt/pyRadPlan-dosecalc-Bayes-proton-lung
