# codewithyug/certified-safe-neural-control

## Resumen

Certified-Safe Neural Control es un marco de certificación y un conjunto de pesos preentrenados para el filtrado de seguridad en tiempo real de sistemas de control autónomos. Lo desarrolla el equipo Certified Safe AI & Robotics Research Team y lo publica el usuario `codewithyug` en Hugging Face. El problema que aborda es el desplazamiento de distribución en bucle cerrado: los controladores neuronales nominales se comportan de forma segura en las condiciones de entrenamiento, pero pueden violar restricciones físicas cuando aparecen perturbaciones no modeladas (ráfagas de viento, pérdida de fricción, cambios de carga). La propuesta combina funciones de barrera de control neuronales (Neural CBF) verificadas formalmente con una calibración conformal adaptativa en línea (`AdaptNC`) que ajusta el margen de seguridad sin sacrificar demasiada agresividad en la actuación.

El repositorio incluye tres checkpoints orientados a encarnaciones físicas concretas: un robot móvil terrestre de 4 dimensiones de estado y 2 de control, una variante de alta capacidad del mismo robot y un cuadricóptero con estado SE(3) de 12 dimensiones y 4 dimensiones de control. Cada checkpoint se acompaña de una verificación formal mediante branch-and-bound (BaB) y de una envoltura de optimización convexa (OSQP) que resuelve el programa cuadrático de filtrado en menos de 2 ms en los casos documentados. La relevancia actual está en que ofrece una vía práctica para desplegar políticas neuronales en robótica con garantías de seguridad medibles, algo poco habitual en pesos publicados abiertamente.

El modelo no es un modelo de lenguaje ni un transformador generativo: es un artefacto de robótica con pesos PyTorch, licencia MIT y pipeline declarado `robotics`. No declara idiomas soportados ni contexto textual, y el tamaño del repositorio figura como 0.0 GB en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con activación Tanh (perceptrón multicapa) para la Neural CBF, integrada en un pipeline de filtrado con QP convexo (OSQP) |
| Parametros totales | no disponible (tres checkpoints con MLP de [64, 64], [128, 128, 64] y [64, 64]) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura combina una función de barrera de control neuronal \(h_\theta(x)\) implementada como MLP con activación Tanh, y un filtro de seguridad en tiempo real que resuelve un programa cuadrático convexo con OSQP. El pipeline se apoya en dinámicas de control afines \(\dot{x} = f(x) + g(x)u + w(t)\), donde \(w(t)\) representa el desplazamiento de distribución no estacionario en bucle cerrado. La innovación principal es el margen conformal adaptativo en línea \(\gamma_t\), que se actualiza según la puntuación de no conformidad \(s_t = -(\dot{h}_{\text{real}} - \dot{h}_{\text{model}})/\hat{\sigma}_t\) y una regla de actualización con tasa de aprendizaje \(\eta\), recorte en \([0, \gamma_{\max}]\) y nivel de riesgo \(\alpha_{\text{risk}}\). Este mecanismo permite mantener cobertura empírica de seguridad bajo distribuciones no intercambiables, algo que la calibración conformal estándar no garantiza.

Los checkpoints están verificados formalmente mediante branch-and-bound (BaB), lo que aporta garantías sobre la red neuronal de barrera. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO (no aplicables a este dominio). Tampoco se detallan los entornos de simulación o los datos de vuelo/rodadura usados para el ajuste.

## Capacidades

- Filtrado de seguridad en tiempo real de acciones de control nominales para robots móviles y cuadricópteros.
- Verificación formal de la red de barrera mediante branch-and-bound (BaB) en los tres checkpoints publicados.
- Calibración conformal adaptativa en línea para distribuciones no intercambiables (`AdaptNC`).
- Resolución de un QP convexo con restricciones de barrera de control y término de relajación \(\delta\).
- Soporte de tres encarnaciones: robot móvil 4D/2D, robot móvil de alta capacidad 4D/2D y cuadricóptero SE(3) 12D/4D.
- Frecuencias máximas declaradas de 884 Hz, 850 Hz y 820 Hz según checkpoint.
- Tiempo de resolución documentado inferior a 2 ms en el ejemplo de uso.
- No soporta tool calling, agentes multi-paso, visión, audio ni capacidades multilingües: es un componente de control, no un modelo generativo.

## Casos de uso

- Navegación segura de robots móviles en almacenes: el checkpoint `cbf_dubins.pt` filtra las acciones de un controlador nominal de un AMR 4D/2D, impidiendo trayectorias hacia obstáculos incluso con fricción degradada o viento lateral, gracias a la calibración conformal adaptativa.
- Control de cuadricópteros con carga variable: el checkpoint `cbf_quadrotor.pt` opera sobre estado SE(3) de 12 dimensiones y 4 actuaciones, manteniendo holgura mínima positiva ante cambios de masa no modelados.
- Robots de alta capacidad en logística: `cbf_dubins_production.pt` emplea una MLP de mayor capacidad ([128, 128, 64]) para entornos con mayor complejidad dinámica, manteniendo 850 Hz de frecuencia máxima.
- Capa de seguridad en pipelines de aprendizaje por refuerzo: se puede envolver una política RL entrenada y filtrar sus acciones antes de enviarlas a los actuadores, reduciendo la tasa de violación de restricciones del 41,82 % (política nominal) al 0,00 % documentado.
- Validación y certificación de controladores neuronales: el marco de verificación BaB permite generar evidencia formal para procesos de homologación de sistemas autónomos.
- Investigación en seguridad de sistemas ciberfísicos: el código y los pesos permiten reproducir los experimentos de desplazamiento de distribución en bucle cerrado y comparar variantes de CBF (estándar, conservadora, adaptativa).
- Integración en simuladores de robótica: al ser pesos PyTorch con licencia MIT, se pueden incorporar en bucles de simulación (Gazebo, Isaac Sim) para pruebas de estrés antes del despliegue físico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados con desplazamientos de distribución en bucle cerrado hasta \(\kappa = 2.0\):

| Metodo | Tasa de violacion de seguridad (%) | Cobertura empirica de seguridad (%) | Frecuencia media de resolucion (Hz) | Holgura minima \(h_{\min}\) (m) |
|---|---|---|---|---|
| Politica nominal sin filtro | 41,82 | 58,18 | no aplica | -0,284 (colision) |
| CBF-QP estandar no adaptativa | 10,36 | 89,64 | 892 | -0,071 (colision) |
| CBF conservadora en el peor caso | 0,00 | 100,0 | 874 | +0,412 (sobreconservadora) |
| CBF conformal adaptativa propuesta | 0,00 | 99,55 | 884 | +0,148 (optima certificada) |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) porque el modelo no es lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los metadatos indican un tamaño de repositorio de 0.0 GB y las MLP son de tamaño reducido, por lo que la huella de pesos es mínima.
- GPU recomendadas: no especificadas por el autor; dado el tamaño de las redes (MLP de dos o tres capas) y el uso de OSQP, la inferencia puede ejecutarse en CPU o en GPU de gama baja, aunque no se aportan mediciones.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, aunque no hay datos oficiales de latencia por hardware.
- Opciones de despliegue: PyTorch con las dependencias `torch`, `cvxpy`, `osqp` y `numpy`; el repositorio incluye un `CertifiedSafetyPipeline` para carga y filtrado.
- Latencia y throughput: el ejemplo de uso declara menos de 2 ms por filtrado; las frecuencias máximas por checkpoint son 884 Hz (dubins), 850 Hz (dubins production) y 820 Hz (quadrotor).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Certified-Safe Neural Control (este) | Neural CBF + QP + conformal adaptativo | no disponible (MLP pequeñas) | no aplica | 0,00 % violaciones, 99,55 % cobertura, 884 Hz | MIT | Hugging Face |
| CBF-QP estándar (línea base del paper) | CBF clásica + QP | no disponible | no aplica | 10,36 % violaciones, 89,64 % cobertura, 892 Hz | no aplica | Referencia en el paper |
| CBF conservadora en el peor caso (línea base del paper) | CBF conservadora | no disponible | no aplica | 0,00 % violaciones, 100 % cobertura, 874 Hz, sobreconservadora | no aplica | Referencia en el paper |
| Política nominal sin filtro (línea base del paper) | Controlador neuronal sin filtro | no disponible | no aplica | 41,82 % violaciones, 58,18 % cobertura | no aplica | Referencia en el paper |

No se dispone de comparación con otros repositorios públicos de CBF neuronales en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (24 de noviembre de 2026): no hay evidencia de uso independiente ni de replicación externa.
- Los benchmarks son autoinformados por el autor; no se aportan scripts de evaluación ni resultados de terceros.
- La verificación formal BaB se declara para los checkpoints, pero no se detallan los dominios de entrada cubiertos ni las cotas exactas.
- El modelo está especializado en tres encarnaciones concretas (AMR 4D/2D y cuadricóptero 12D/4D); no es generalizable a otros sistemas sin reentrenamiento.
- No es un modelo de lenguaje: no admite tool calling, agentes, visión, audio ni multilingüismo; cualquier uso fuera del control robótico queda fuera de su alcance.
- Riesgo de alucinación no aplicable en el sentido lingüístico, pero sí existe riesgo de que la CBF no cubra perturbaciones fuera del rango \(\kappa \le 2.0\) evaluado.
- La licencia MIT permite uso comercial, pero la responsabilidad de validar la seguridad en un despliegue físico recae en el integrador.
- No se documentan sesgos, composición del dataset ni procedencia de los datos de entrenamiento.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que la medición es incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/codewithyug/certified-safe-neural-control
- Demo interactiva: https://huggingface.co/spaces/codewithyug/certified-safe-neural-control
- Paper citado: *Certified-Safe Neural Control Under Closed-Loop Distribution Shift* (2026), arXiv preprint, sin identificador disponible en la información proporcionada.
- Repositorio de código: no disponible (el clon del repo de Hugging Face incluye el directorio `src/` con `pipeline.py`).
