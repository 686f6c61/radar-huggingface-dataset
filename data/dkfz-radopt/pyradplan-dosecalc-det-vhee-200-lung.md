# DKFZ-RadOpt/pyRadPlan-dosecalc-Det-VHEE-200-lung

## Resumen

El modelo `pyRadPlan-dosecalc-Det-VHEE-200-lung` es un predictor determinista de dosis física para radioterapia con electrones de muy alta energía (VHEE, por sus siglas en inglés) a una energía fija de 200 MeV, desarrollado por el grupo Radiotherapy Optimization del Centro Alemán de Investigación del Cáncer (DKFZ). Forma parte de la colección `pyRadPlan-dosecalc` y está diseñado para integrarse como motor de cálculo de dosis (`AIBeamletEngine`) en el paquete de planificación de tratamiento de código abierto pyRadPlan.

El modelo emplea una arquitectura de red neuronal convolucional denominada `ConvBayes_new` y realiza una única pasada hacia adelante para predecir un cubo de dosis local a partir de un cubo de tomografía computarizada (CT) y un beamlet (haz elemental). Su relevancia radica en acelerar el cálculo de dosis en planificación de tratamiento, sustituyendo métodos convencionales más lentos como la simulación de Monte Carlo, manteniendo una precisión adecuada para el rango de aplicación declarado. Está entrenado específicamente para anatomía de pulmón, con un espaciado de rejilla de 2 mm, un campo lateral de 52 mm y una ventana de profundidad de ±350 mm relativa al origen del beamlet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvBayes_new (red neuronal convolucional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por computador, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura convolucional denominada `ConvBayes_new`, que procesa un cubo de CT junto con la información geométrica de un beamlet para generar un cubo de dosis física. Es un modelo determinista, es decir, produce una salida fija para una entrada dada, sin muestreo estocástico. La entrada se compone mediante un preprocesador (`ConvDoseSinglePreprocessor`) que ensambla los datos y escala la salida. El entrenamiento se realizó presumiblemente con datos simulados de transporte de partículas (típicamente Monte Carlo), aunque la información disponible no especifica el número de muestras, la composición del dataset ni el procedimiento de optimización. No se menciona el uso de técnicas como RLHF o DPO, que no son aplicables a este tipo de modelo. La innovación principal es la integración directa como motor de cálculo de dosis en pyRadPlan, permitiendo sustituir el cálculo convencional por una predicción neuronal.

## Capacidades

- Predicción de dosis física local para radioterapia VHEE a 200 MeV en casos de pulmón.
- Integración nativa con pyRadPlan como motor `AIBeamletEngine`, configurable mediante `pln.prop_dose_calc = {"engine": "AIBeamlet", "model": "pyRadPlan-dosecalc-Det-VHEE-200-lung"}`.
- Soporte para un único haz con energía fija de 200 MeV; para otras energías (100, 150 MeV) existen modelos complementarios en la misma colección.
- Genera un cubo de dosis con espaciado de 2 mm, campo lateral de 52 mm y ventana de profundidad de ±350 mm.
- Avisa al usuario cuando el plan de tratamiento queda fuera del rango declarado de validez.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento conversacional.

## Casos de uso

- Planificación de radioterapia VHEE en pulmón: el modelo se usa dentro de pyRadPlan para calcular la matriz de influencia de dosis (`dij`) de forma rápida, permitiendo iterar sobre distintas configuraciones de haz y fluencia sin recurrir a simulaciones Monte Carlo costosas.
- Optimización de tratamiento: al acelerar el cálculo de dosis, facilita la optimización de la distribución de fluencia mediante algoritmos iterativos, reduciendo el tiempo total de planificación.
- Investigación en radioterapia: investigadores pueden evaluar el impacto de diferentes geometrías de beamlet o configuraciones de haz en la dosis pulmonar sin necesidad de infraestructura de cálculo intensivo.
- Validación de algoritmos de planificación: sirve como referencia rápida para comparar con métodos analíticos o Monte Carlo en el rango de validez declarado.
- Docencia y formación: en entornos académicos, permite demostrar conceptos de cálculo de dosis y planificación con un modelo neuronal de bajo coste computacional.
- Desarrollo de nuevas técnicas de VHEE: al ser un modelo determinista y ligero, puede integrarse en pipelines de optimización que requieren miles de evaluaciones de dosis, como búsqueda de energías o ángulos de haz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas cuantitativas de precisión (p. ej., comparación con Monte Carlo) ni comparaciones con otros modelos de cálculo de dosis.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación disponible.
- Dado que es una red convolucional pequeña (el tamaño del repositorio es 0.0 GB, lo que sugiere pesos compactos), es probable que pueda ejecutarse en GPUs de consumo (p. ej., NVIDIA RTX 3060 o superior) y también en CPU, aunque con menor rendimiento.
- La integración con pyRadPlan requiere tener instalado el paquete y sus dependencias (PyTorch).
- No se dispone de datos de latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Energía | Anatomía | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pyRadPlan-dosecalc-Det-VHEE-200-lung | 200 MeV | Pulmón | ConvBayes_new | BSD-3-Clause | HuggingFace |
| pyRadPlan-dosecalc-Det-VHEE-100-lung | 100 MeV | Pulmón | ConvBayes_new (presumible) | BSD-3-Clause | HuggingFace |
| pyRadPlan-dosecalc-Det-VHEE-150-lung | 150 MeV | Pulmón | ConvBayes_new (presumible) | BSD-3-Clause | HuggingFace |

No se dispone de información sobre otros modelos de cálculo de dosis basados en aprendizaje profundo fuera de la colección pyRadPlan-dosecalc. Los modelos de la misma colección se diferencian únicamente en la energía del haz, por lo que la elección depende de la configuración del plan.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una energía fija de 200 MeV y anatomía de pulmón; su uso fuera de este rango no está garantizado.
- La validez de las predicciones se limita al rango declarado: espaciado de rejilla de 2 mm, campo lateral de 52 mm y ventana de profundidad de ±350 mm. Fuera de estos límites, los resultados pueden ser inexactos.
- No se proporcionan datos sobre la precisión clínica del modelo; cualquier uso en entornos clínicos requiere validación adicional con métodos estándar.
- La carga del modelo ejecuta código remoto (`model.py` y `preprocessor.py`) con `trust_remote_code` activado por defecto en `pyRadPlan.ml`, lo que implica un riesgo de seguridad si el repositorio se ve comprometido.
- No se especifican sesgos conocidos, pero al estar entrenado en un dominio específico (pulmón, VHEE 200 MeV), su generalización a otras localizaciones o energías es limitada.
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar los términos de la misma y las políticas del DKFZ.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DKFZ-RadOpt/pyRadPlan-dosecalc-Det-VHEE-200-lung
- Colección pyRadPlan-dosecalc: https://huggingface.co/collections/DKFZ-RadOpt/pyradplan-dosecalc
- Organización DKFZ-RadOpt: https://huggingface.co/DKFZ-RadOpt
- Repositorio de pyRadPlan en GitHub: https://github.com/e0404/pyRadPlan
- Documentación de pyRadPlan: https://pyradplan.readthedocs.io/en/latest/
- Guía de cálculo de dosis en pyRadPlan: https://pyradplan.readthedocs.io/en/latest/user_guide/concepts/dose_calculation.html
