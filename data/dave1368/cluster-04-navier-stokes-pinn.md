# dave1368/cluster-04-navier-stokes-pinn

## Resumen

El modelo `dave1368/cluster-04-navier-stokes-pinn` es una red neuronal informada por la física (PINN) desarrollada por el autor `dave1368` para predecir el campo de velocidad bidimensional `(u, v)` y la presión `p` de un flujo laminar incompresible sobre una placa plana, para cualquier velocidad de corriente libre `U∞`. Forma parte de un marco de orquestación de clústeres de IA científica (Scientific AI Cluster Orchestration Framework) que combina esta red con un solucionador simbólico exacto de similitud de Blasius y auditorías de seguridad basadas en física.

Con aproximadamente 66 000 parámetros, la arquitectura es una red feedforward de 5 capas ocultas con 128 neuronas y activación Tanh. La principal innovación es la normalización mediante la variable de similitud de Blasius, que mejora el condicionamiento del problema y permite generalizar a distintos valores de `U∞` sin necesidad de reentrenar. El modelo se entrenó con 60 000 puntos generados a partir de la solución exacta de la ecuación de Blasius, integrada numéricamente con RK4, y ha sido validado contra fuentes clásicas (Navier, Stokes, Prandtl, Blasius) con resultados que coinciden en 4-5 decimales.

La relevancia actual reside en demostrar cómo las PINNs pueden resolver ecuaciones diferenciales parciales de la mecánica de fluidos con alta precisión y bajo coste computacional, ofreciendo una alternativa rápida a los solvers numéricos tradicionales para problemas específicos. El modelo está publicado bajo licencia MIT y su repositorio incluye un espacio interactivo de demostración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red feedforward (PINN) con 5 capas ocultas de 128 neuronas, activación Tanh |
| Parametros totales | ~66 000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de regresión física, no secuencial) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal feedforward clásica con 5 capas ocultas de 128 neuronas y activación Tanh. La entrada es un vector de 3 características `(x, y, U∞)` y la salida son tres valores `(u, v, p)`. La peculiaridad está en la normalización de entrada/salida: en lugar de alimentar la red con coordenadas físicas crudas (mal condicionadas, ya que `y` es del orden de milímetros y `x` del orden de metros), se utiliza la variable de similitud de Blasius `η = y·√(U∞/(ν·x))`. La red predice cantidades universales O(1) — `u/U∞ = f'(η)` y `v/(0.5·√(ν·U∞/x)) = η·f'(η) − f(η)` — y las velocidades físicas se reconstruyen multiplicando por factores de escala exactos calculados analíticamente. Esta normalización no evita el aprendizaje, sino que condiciona el problema para que la red aprenda la forma de las funciones universales.

Los datos de entrenamiento provienen de la solución exacta de Blasius: la ecuación diferencial ordinaria de tercer orden `2f''' + f''f = 0` se integra una vez con RK4 en el intervalo `η ∈ [0, 8]` y se reutiliza para cada muestra `(x, η, U∞)` mediante interpolación. Se generaron 60 000 puntos de entrenamiento y 10 000 de validación en el dominio `x ∈ [0.05·L, L]`, `η ∈ [0, 8]`, `U∞ ∈ [1, 50] m/s`. El entrenamiento duró 3000 épocas con pérdida MSE, alcanzando una pérdida final de 1.62e-05 en entrenamiento y 8.62e-06 en validación.

Durante el desarrollo se corrigieron dos errores importantes: primero, la red original solo recibía `(x, y)` y no podía incorporar la velocidad de corriente libre, por lo que el deslizador de `U∞` en la demo no tenía efecto; segundo, el muestreo de `y` se hacía uniformemente en metros, pero la capa límite de Blasius tiene solo unos milímetros de espesor, por lo que casi todos los puntos caían en la región de flujo libre trivial. Ambos problemas se resolvieron extendiendo la entrada a `(x, y, U∞)` y muestreando directamente en la variable de similitud `η`.

## Capacidades

- Predicción del campo de velocidad `(u, v)` y presión `p` para flujo laminar incompresible sobre placa plana con gradiente de presión nulo.
- Generalización a cualquier velocidad de corriente libre `U∞` en el rango `[1, 50] m/s` sin reentrenamiento.
- Precisión validada contra la solución clásica de Blasius: coincidencia de 4-5 decimales en el perfil de similitud.
- Cumplimiento exacto de la ecuación de continuidad `u_x + v_y = 0` para cualquier `U∞` (verificado por autograd en un barrido completo).
- Reproducción correcta de la ley de fricción superficial `Cf = 0.664/√Re_x` con decaimiento `1/√Re_x` en tres órdenes de magnitud de `Re_x` (con un error sistemático de ~12-15%).
- Integración sencilla en entornos Python mediante PyTorch y Hugging Face Hub.
- No incluye capacidades de procesamiento de lenguaje, tool calling, agentes, visión ni audio.

## Casos de uso

- **Simulación rápida de flujo laminar en diseño preliminar**: un ingeniero puede obtener el campo de velocidades y presión sobre una placa plana para diferentes velocidades de corriente libre en milisegundos, sin necesidad de ejecutar un solver CFD completo. La red es adecuada porque su tamaño reducido permite inferencia instantánea incluso en CPU.
- **Validación cruzada de solvers numéricos**: los resultados del modelo pueden compararse con salidas de métodos de volúmenes finitos o elementos finitos para verificar la correcta implementación de condiciones de contorno y mallas en problemas de capa límite laminar.
- **Educación en mecánica de fluidos**: el modelo puede integrarse en materiales docentes para ilustrar la solución de Blasius, mostrando perfiles de velocidad y presión en tiempo real al variar `U∞` y la posición `x`. Su bajo coste computacional permite ejecutarlo en portátiles de estudiantes.
- **Generación de datos sintéticos para entrenamiento de otros modelos**: las predicciones precisas del modelo pueden servir para generar conjuntos de datos etiquetados de flujo laminar sobre placa plana, útiles para entrenar redes más complejas o algoritmos de aprendizaje por refuerzo en control de flujo.
- **Monitorización de condiciones de operación en túneles de viento**: en experimentos de laboratorio, el modelo puede proporcionar una referencia teórica instantánea para comparar con mediciones experimentales y detectar desviaciones debidas a efectos tridimensionales o de turbulencia.
- **Optimización de parámetros de diseño**: al ser diferenciable, el modelo puede usarse en bucles de optimización para ajustar parámetros geométricos o de condiciones de operación (por ejemplo, encontrar la posición `x` donde el espesor de capa límite alcanza un valor objetivo) mediante retropropagación.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (como MMLU o HumanEval) porque no es un modelo de lenguaje. En su lugar, proporciona una tabla de validación contra fuentes clásicas de la mecánica de fluidos:

| Check | Resultado |
|---|---|
| Constante de Blasius `f''(0)` vs. valor clásico | Coincidencia exacta (0.33205733) |
| Perfil de similitud RK4 vs. tabla clásica (Schlichting) | Coincidencia en 4-5 decimales en cada `η` probado |
| Ecuación de continuidad (solución exacta) | `u_x + v_y = 0` exacto para cualquier `U∞` |
| Ecuación de continuidad (red, autograd, barrido completo) | Pasa en todo `U∞ ∈ [1, 50] m/s` |
| Coeficiente de fricción superficial `Cf` vs. ley de Blasius | Decaimiento `1/√Re_x` correcto en 3 órdenes de magnitud, con subestimación sistemática de ~12-15% |
| Error puntual en `u, v` vs. perfil exacto | Error máximo cerca de la pared (`η≈0`); ~0.2% de `U∞` en el resto |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un modelo de solo ~66 000 parámetros, la inferencia se ejecuta en cualquier CPU moderna sin necesidad de GPU.
- La memoria necesaria es inferior a 100 MB en RAM (el checkpoint ocupa menos de 1 MB).
- El entrenamiento (3000 épocas con 60 000 puntos) es factible en una GPU de gama media (p. ej., RTX 3060) o incluso en CPU en tiempos razonables, aunque no se especifica el hardware utilizado.
- Para despliegue en producción, puede servirse como un endpoint REST con frameworks como FastAPI o TorchServe; también es posible exportar a ONNX para optimización en entornos de inferencia.
- No requiere cuantización ni técnicas de optimización especiales; el modelo completo cabe en la caché L2 de cualquier procesador moderno.
- La latencia de inferencia es del orden de microsegundos por muestra (medición no disponible, pero estimable por el tamaño de la red).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la documentación proporcionada. Existen otros PINNs para Navier-Stokes (por ejemplo, los basados en el trabajo de Raissi et al., 2019), pero no se han encontrado datos concretos de rendimiento o arquitectura que permitan una comparación rigurosa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo es válido únicamente para flujo laminar, incompresible, con gradiente de presión nulo y sobre una placa plana. No modela turbulencia, transición, separación ni efectos tridimensionales.
- La precisión puntual es menor en la región inmediatamente adyacente a la pared (`η≈0`), donde el gradiente de velocidad es máximo; el error puede alcanzar ~0.2% de `U∞` en el resto del dominio.
- La auditoría de continuidad utiliza una tolerancia calibrada empíricamente, no una cota física dimensionalmente exacta; aunque se ha verificado que el residual escala linealmente con `U∞`, la justificación es heurística.
- El coeficiente de fricción superficial presenta una subestimación sistemática de ~12-15% respecto a la ley de Blasius, lo que debe tenerse en cuenta en aplicaciones que requieran precisión en este parámetro.
- No es un modelo generalista: su uso fuera del dominio de entrenamiento (por ejemplo, `U∞ > 50 m/s` o geometrías distintas) no está validado y puede producir resultados incorrectos.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías de exactitud para aplicaciones críticas de seguridad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dave1368/cluster-04-navier-stokes-pinn)
- [Space de demostración interactiva](https://huggingface.co/spaces/dave1368/cluster-04-fluid-dynamics)
- [Marco de orquestación de clústeres de IA científica (referencia en el Space)](https://huggingface.co/spaces/dave1368/cluster-04-fluid-dynamics)
