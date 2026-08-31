# DKFZ-RadOpt/pyRadPlan-dosecalc-Det-VHEE-100-lung

## Resumen

El modelo `pyRadPlan-dosecalc-Det-VHEE-100-lung`, desarrollado por el grupo DKFZ-RadOpt del Centro Alemán de Investigación Oncológica (DKFZ), es un predictor determinista de dosis física para radioterapia con electrones de muy alta energía (VHEE, por sus siglas en inglés). A diferencia de los modelos generativos de lenguaje, se trata de una red neuronal convolucional especializada en física médica que, dado un cubo de tomografía computarizada (CT) y un haz elemental (beamlet), predice el cubo de dosis física local depositada en el tejido.

Su relevancia radica en que actúa como un motor de cálculo de dosis alternativo a los métodos tradicionales de Monte Carlo, ofreciendo una inferencia en un único paso hacia adelante (single forward pass) que acelera drásticamente la planificación de tratamientos. El modelo está entrenado específicamente para una energía fija de haz de 100 MeV y anatomía de pulmón, y se integra directamente en el ecosistema pyRadPlan como motor `AIBeamletEngine`. La arquitectura empleada es `ConvBayes_new`, y los pesos se distribuyen en formato `safetensors` bajo licencia BSD-3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvBayes_new (red convolucional determinista) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana espacial de 52 mm lateral y profundidad [−350, 350] mm) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura `ConvBayes_new` es una red neuronal convolucional diseñada para el cálculo determinista de dosis. El modelo toma como entrada un cubo de CT y un beamlet, y produce un cubo de dosis física local. El entrenamiento se realizó bajo supuestos específicos: modo de radiación VHEE, energía de haz fija de 100 MeV, anatomía de pulmón y una máquina genérica. La rejilla de muestreo emplea un espaciado de 2 mm, con un ancho de campo lateral de 52 mm (±26 mm) y una ventana de profundidad de [−350, 350] mm relativa al origen del beamlet.

No se dispone de información pública sobre el número de parámetros, el tamaño del dataset de entrenamiento, el número de épocas o la composición de los datos. Al ser un modelo discriminativo de regresión, no se aplican técnicas como RLHF o DPO. La inferencia se realiza en un único paso hacia adelante, lo que lo hace adecuado para integración en pipelines de optimización de tratamiento donde la velocidad es crítica.

## Capacidades

- Predicción de dosis física local en radioterapia VHEE para casos de pulmón.
- Integración directa como motor de cálculo de dosis (`AIBeamletEngine`) en pyRadPlan, sustituyendo el cálculo convencional.
- Inferencia determinista en un único paso hacia adelante (sin muestreo iterativo).
- Soporte para energía fija de 100 MeV; existen modelos compañeros para 150 MeV y 200 MeV en la misma colección.
- Generación de la matriz de influencia de dosis (dij) necesaria para la optimización de fluencia.
- No es un modelo de lenguaje: no genera texto, código, ni soporta tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Planificación de tratamientos VHEE en pulmón: el modelo puede sustituir el cálculo Monte Carlo, reduciendo el tiempo de cómputo de minutos u horas a milisegundos por beamlet, lo que permite iterar sobre múltiples planes en una misma sesión clínica.
- Optimización de fluencia en pyRadPlan: al integrarse como `AIBeamletEngine`, genera la matriz de influencia `dij` que el optimizador utiliza para calcular la dosis resultante de cualquier vector de fluencia `w` mediante un producto matriz-vector.
- Investigación en física médica: permite explorar rápidamente el impacto de diferentes configuraciones de haz (ángulos, posiciones) en la distribución de dosis para estudios de robustez y planificación adaptativa.
- Comparación de energías de haz: combinando este modelo con los de 150 MeV y 200 MeV, los investigadores pueden evaluar sistemáticamente el efecto de la energía en la cobertura del tumor y la preservación de tejido sano.
- Prototipado de algoritmos de optimización: al ser rápido y determinista, es adecuado para probar nuevas funciones de coste o restricciones en el optimizador sin cuellos de botella computacionales.
- Educación y formación: sirve como herramienta didáctica para demostrar la aplicación de redes neuronales en dosimetría y planificación de tratamientos, integrada en un toolkit de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas cuantitativas de precisión dosimétrica (p. ej., comparación gamma con Monte Carlo), latencia de inferencia ni throughput en la model card o en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 0.0 GB, lo que sugiere que los pesos son de pocos megabytes, pero no se especifica la memoria necesaria para inferencia.
- GPU recomendadas: no disponible. Al ser una red convolucional pequeña en PyTorch, es probable que funcione en GPUs de consumo como RTX 3060 o superiores, pero no hay confirmación oficial.
- Opciones de despliegue: integración nativa en pyRadPlan (Python/PyTorch). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Se espera que sea rápido por ser un único forward pass, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Energia | Anatomia | Licencia | Formato |
|---|---|---|---|---|---|
| pyRadPlan-dosecalc-Det-VHEE-100-lung | ConvBayes_new | 100 MeV | Pulmon | BSD-3-Clause | safetensors |
| pyRadPlan-dosecalc-Det-VHEE-150-lung | ConvBayes_new | 150 MeV | Pulmon | BSD-3-Clause | safetensors |
| pyRadPlan-dosecalc-Det-VHEE-200-lung | ConvBayes_new | 200 MeV | Pulmon | BSD-3-Clause | safetensors |
| pyRadPlan-dosecalc-Det-proton-lung | ConvBayes_new | no disponible (protones) | Pulmon | BSD-3-Clause | safetensors |

La comparativa se limita a los modelos de la misma colección DKFZ-RadOpt, ya que no se dispone de información sobre alternativas externas equivalentes. La diferencia principal entre los modelos VHEE es la energía del haz, mientras que el modelo de protones cambia el modo de radiación.

## Limitaciones y advertencias

- Energía fija: el modelo solo es válido para 100 MeV. Usarlo con otras energías requiere cargar el modelo compañero correspondiente.
- Anatomía restringida: entrenado únicamente para casos de pulmón; su precisión en otras localizaciones anatómicas no está garantizada.
- Rango espacial limitado: las predicciones fuera del rango declarado (52 mm lateral, [−350, 350] mm en profundidad) no son precisas. `AIBeamletEngine` emite una advertencia si el plan excede este rango.
- Ejecución de código remoto: cargar el modelo ejecuta `model.py` y `preprocessor.py` incluidos en el repositorio, con `trust_remote_code` activado por defecto en `pyRadPlan.ml`. Esto supone un riesgo de seguridad si el repositorio se ve comprometido.
- Sin datos de validación clínica: no se publican benchmarks ni métricas de precisión dosimétrica, por lo que su uso en entornos clínicos reales requiere una validación independiente exhaustiva.
- Modelo muy reciente y sin adopción: cuenta con 0 descargas y 0 likes en HuggingFace (fecha de creación: 2026-08-31), lo que indica que aún no ha sido ampliamente evaluado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DKFZ-RadOpt/pyRadPlan-dosecalc-Det-VHEE-100-lung
- Colección pyRadPlan-dosecalc: https://huggingface.co/collections/DKFZ-RadOpt/pyradplan-dosecalc
- Documentación de pyRadPlan: https://pyradplan.readthedocs.io/en/latest/
- Repositorio GitHub de pyRadPlan: https://github.com/e0404/pyRadPlan
- Modelo similar (protones): https://huggingface.co/DKFZ-RadOpt/pyRadPlan-dosecalc-Det-proton-lung
