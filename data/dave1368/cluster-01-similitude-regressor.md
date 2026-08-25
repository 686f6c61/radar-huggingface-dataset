# dave1368/cluster-01-similitude-regressor

## Resumen

El modelo `dave1368/cluster-01-similitude-regressor` es una red neuronal de tipo perceptrón multicapa (MLP) con aproximadamente 13 000 parámetros, desarrollada por David Tijani (dave1368) como parte del "Scientific AI Cluster Orchestration Framework". Su función es predecir el coeficiente de arrastre (Cd) y el coeficiente de presión (Cp) a partir de los grupos adimensionales clásicos de la mecánica de fluidos: número de Reynolds (Re), número de Froude (Fr) y número de Mach (Mach). El modelo está entrenado con etiquetas sintéticas generadas a partir de correlaciones publicadas, no con datos experimentales, y se presenta como una prueba de concepto para demostrar un patrón de arquitectura neuro-simbólica que combina esta red con un solucionador exacto del teorema Π de Buckingham.

La relevancia de este modelo radica en su lección metodológica: frente a un error del 184 % en la zona de crisis de arrastre, escalar la arquitectura 245 veces (hasta 3,15 millones de parámetros) apenas redujo el error al 135 %, mientras que el sobremuestreo de la ventana crítica y un entrenamiento más largo (de 300 a 3000 épocas) lograron reducirlo al 30 % con el mismo tamaño original. Esto demuestra que, en problemas con características agudas y datos escasos, la distribución de muestreo y el tiempo de optimización pueden ser más determinantes que la capacidad del modelo. El modelo está implementado en PyTorch puro, sin dependencias de transformers, y su checkpoint se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 4 capas, activación Tanh, 64 unidades ocultas por capa |
| Parametros totales | ~13 000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresión numérica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numérico) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de 4 capas con activación Tanh y 64 unidades ocultas por capa. La entrada son los valores físicos crudos de Re, Fr y Mach, y la normalización está integrada en el método `forward()`. La salida es un vector de dos componentes: Cd y Cp. El entrenamiento se realizó con el optimizador Adam en modo de lote completo, durante 3000 épocas, exclusivamente en CPU, con un tiempo total de aproximadamente 78 segundos.

Los datos de entrenamiento no provienen de un conjunto experimental, sino de dos correlaciones establecidas y citables: la correlación de Morrison (2013) para el coeficiente de arrastre de una esfera en función de Re, que incluye la crisis de arrastre cerca de Re ≈ 3×10⁵, y la corrección de Prandtl-Glauert para el coeficiente de presión en régimen subsónico, limitada a Mach 0,7 para evitar la singularidad transónica. El número de Froude se incluye como entrada para mantener la convención de llamada de la aplicación, pero las etiquetas no varían con él, ya que la resistencia de un cuerpo sumergido no tiene dependencia estándar de Froude. Esta decisión está documentada explícitamente.

La innovación técnica más destacable no está en la arquitectura, sino en la estrategia de muestreo: se sobremuestreó la ventana de crisis (Re ∈ [10⁵, 6×10⁵]) para que aproximadamente el 35 % de los puntos de entrenamiento cayeran dentro de la transición, y se prolongó el entrenamiento de 300 a 3000 épocas. Esta combinación redujo el error en el punto crítico de 184 % a ~30 %, superando al modelo 245 veces más grande a un coste 245 veces menor.

## Capacidades

- Predicción del coeficiente de arrastre (Cd) y del coeficiente de presión (Cp) a partir de los grupos adimensionales Re, Fr y Mach.
- Normalización de entrada integrada en el propio modelo, lo que permite alimentar valores físicos crudos sin preprocesamiento externo.
- Inferencia rápida en CPU: el modelo es extremadamente ligero (~13 000 parámetros) y puede ejecutarse en cualquier entorno con PyTorch.
- Reproducibilidad del patrón de entrenamiento: el repositorio incluye `modeling.py`, una copia autocontenida de la arquitectura, y `training_metrics.json` con el historial completo de pérdidas por época.
- Integración con un solucionador simbólico exacto del teorema Π de Buckingham, aunque el checkpoint puede usarse de forma independiente.
- Capacidad de demostrar el efecto del sobremuestreo en regiones de alta curvatura, útil como caso de estudio en aprendizaje automático científico.

## Casos de uso

- Estimación preliminar de coeficientes aerodinámicos en anteproyectos de ingeniería: el modelo puede proporcionar valores aproximados de Cd y Cp para una esfera en un rango de Re, Fr y Mach, útil en las fases iniciales de diseño antes de recurrir a simulaciones CFD o ensayos en túnel de viento. Su rapidez permite explorar múltiples combinaciones de parámetros en segundos.
- Validación cruzada de correlaciones analíticas: al estar entrenado sobre la correlación de Morrison y la corrección de Prandtl-Glauert, puede usarse como una implementación alternativa para verificar cálculos manuales o scripts de referencia en entornos educativos.
- Enseñanza de dinámica de fluidos: el modelo sirve como herramienta interactiva para ilustrar la crisis de arrastre y la influencia de la compresibilidad, permitiendo a estudiantes variar Re y Mach y observar cambios en Cd y Cp sin necesidad de resolver ecuaciones complejas.
- Demostración de técnicas de muestreo en aprendizaje automático científico: el repositorio documenta cómo el sobremuestreo de una región crítica mejora el rendimiento sin aumentar la capacidad del modelo, un caso práctico para cursos de ML aplicado a la física.
- Integración en pipelines neuro-simbólicos: el modelo está diseñado para funcionar junto con un solucionador exacto de análisis dimensional, por lo que puede emplearse como componente de un sistema más amplio que combine razonamiento simbólico y redes neuronales para auditorías de coherencia física.
- Benchmark de eficiencia computacional: con solo 13 000 parámetros y entrenamiento en CPU en menos de 80 segundos, el modelo puede utilizarse como punto de referencia para comparar estrategias de optimización o para probar entornos de despliegue ligero en dispositivos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo no es un modelo de lenguaje. En su lugar, la model card reporta la precisión puntual frente a la correlación de Morrison y la curva de entrenamiento.

| Punto de evaluación | Error relativo |
|---|---|
| Re = 50 | 1,9 % |
| Re = 500 | 3,2 % |
| Re = 5 000 | 5,8 % |
| Re = 5×10⁵ (crisis) | ~30 % |

| Época | Pérdida de entrenamiento (MSE) | Pérdida de validación (MSE) |
|---|---|---|
| 1 | 1,149 | 1,053 |
| 100 | 0,0889 | 0,0896 |
| 500 | 0,00329 | 0,00341 |
| 1000 | 0,00153 | 0,00154 |
| 2000 | 0,00262* | 0,00331* |
| 3000 | 0,00122 | 0,00122 |

\* Bump transitorio en la época 2000, recuperado en el siguiente checkpoint; se considera ruido de optimización normal, no divergencia.

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero y puede ejecutarse en cualquier CPU moderna sin necesidad de GPU. El entrenamiento completo (3000 épocas) tomó ~78 segundos en CPU, por lo que la inferencia es prácticamente instantánea.
- VRAM: no requiere VRAM dedicada; funciona con la memoria RAM del sistema.
- GPU recomendadas: no se requiere ninguna GPU. Si se desea acelerar el entrenamiento o la inferencia, cualquier GPU con soporte CUDA y PyTorch serviría, pero no es necesario.
- Opciones de despliegue: al ser un `nn.Module` de PyTorch estándar, puede integrarse en cualquier aplicación Python. También podría exportarse a ONNX para entornos de producción, aunque no se documenta en el repositorio.
- Latencia y throughput: no se proporcionan mediciones formales, pero dado el tamaño del modelo, la latencia por inferencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (regresión de coeficientes aerodinámicos a partir de grupos adimensionales). El autor no menciona alternativas ni benchmarks comparativos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo es una prueba de concepto: está entrenado con etiquetas sintéticas procedentes de correlaciones publicadas, no con datos reales de túnel de viento o CFD. No debe utilizarse para aplicaciones de ingeniería críticas sin validación adicional.
- El error en la zona de crisis de arrastre (Re ≈ 5×10⁵) es de aproximadamente el 30 %, incluso después de las mejoras de muestreo y entrenamiento. Esta es una limitación inherente a un MLP pequeño frente a una característica aguda y estrecha.
- El número de Froude se incluye como entrada, pero las etiquetas no dependen de él. El modelo no modela efectos de superficie libre ni resistencia por olas; solo es válido para cuerpos sumergidos sin dependencia de Froude.
- La corrección de Prandtl-Glauert está limitada a Mach ≤ 0,7; el modelo no es válido en régimen transónico o supersónico.
- No se proporcionan métricas de incertidumbre ni intervalos de confianza para las predicciones.
- El repositorio no incluye un conjunto de datos de validación independiente; la validación se realiza contra las mismas correlaciones utilizadas para generar las etiquetas de entrenamiento.
- La licencia MIT permite uso comercial, pero el estado de prueba de concepto y las limitaciones documentadas deben tenerse en cuenta antes de cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dave1368/cluster-01-similitude-regressor
- Demo en vivo (análisis dimensional): https://huggingface.co/spaces/dave1368/cluster-01-dimensional-analysis
- Perfil del autor: https://huggingface.co/dave1368
