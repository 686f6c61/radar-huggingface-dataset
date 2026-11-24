# At1uri/hamiltonian-neural-network-symplectic-engine

## Resumen

El modelo `At1uri/hamiltonian-neural-network-symplectic-engine` es una red neuronal hamiltoniana (Hamiltonian Neural Network, HNN) desarrollada por Ramprasad Atluri (usuario `At1uri`) que parametriza una funcion escalar de energia $\mathcal{H}_\theta(\mathbf{q}, \mathbf{p})$ sobre el espacio de fases canonico. A diferencia de las redes neuronales diferenciales convencionales, que aprenden campos vectoriales arbitrarios y pueden generar trayectorias fisicamente inconsistentes (disipacion o explosion de energia), este modelo deriva la dinamica estrictamente a traves de la matriz simplectica $\mathbf{J}$, lo que garantiza por construccion la conservacion de la energia total y la preservacion del volumen de fase de Liouville.

Se trata de un modelo de escala muy reducida, con 8.705 parametros totales, disenado para sistemas con dos grados de libertad canonicos ($n = 2$): entrada de 4 dimensiones ($q_1, q_2, p_1, p_2$), tres capas densas de 64 unidades con activacion $\tanh$ y salida escalar de energia. No es un modelo de lenguaje ni un modelo generativo de proposito general: es una herramienta de computacion cientifica para integracion de sistemas dinamicos.

Su relevancia radica en que incorpora las leyes de conservacion como invariantes arquitectonicos en lugar de aproximarlas mediante datos. Los pesos se distribuyen en formato `safetensors` bajo licencia MIT, y el autor declara errores de deriva energetica relativa del orden de $10^{-6}$ en trayectorias de 500 pasos sobre bancos de prueba como Henon-Heiles, pendulo doble, oscilador de Duffing y fuerza central kepleriana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal hamiltoniana (MLP que parametriza $\mathcal{H}_\theta$; dinamica via $\dot{\mathbf{z}} = \mathbf{J}\nabla_\mathbf{z}\mathcal{H}_\theta$) |
| Parametros totales | 8.705 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada de 4 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; por tamano, FP32/FP16 nativos sin necesidad de cuantizacion) |
| Idiomas soportados | no aplica (modelo numerico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) |
| Dimension de entrada | 4 ($q_1, q_2, p_1, p_2$) |
| Capas ocultas | 3 capas densas de 64 unidades, activacion $\tanh$ |
| Dimension de salida | 1 (energia escalar $\mathcal{H}$) |
| Grados de libertad canonicos | $n = 2$ |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa de tres capas ocultas de 64 neuronas con activacion $\tanh$, elegida por su derivabilidad continua de segundo orden, necesaria para calcular el gradiente $\nabla_\mathbf{z}\mathcal{H}_\theta$ y la matriz hessiana implicita en la divergencia de Liouville. La salida es un unico escalar que representa la energia total del sistema. La dinamica no se aprende de forma directa: se obtiene aplicando la matriz simplectica canonica $\mathbf{J} = \begin{pmatrix} 0 & I_n \\ -I_n & 0 \end{pmatrix}$ al gradiente de la energia, de modo que $\dot{\mathbf{q}} = \nabla_\mathbf{p}\mathcal{H}$ y $\dot{\mathbf{p}} = -\nabla_\mathbf{q}\mathcal{H}$.

Esta construccion impone dos invariantes de forma exacta: la conservacion de la energia, ya que $\frac{d\mathcal{H}}{dt} = (\nabla_\mathbf{z}\mathcal{H})^T \mathbf{J} (\nabla_\mathbf{z}\mathcal{H}) \equiv 0$ por la antisimetria de $\mathbf{J}$, y la preservacion del volumen de fase de Liouville, ya que $\nabla_\mathbf{z}\cdot\dot{\mathbf{z}} = \text{Tr}(\mathbf{J}\nabla^2\mathcal{H}_\theta) \equiv 0$ por el teorema de Schwarz sobre derivadas parciales mixtas.

La informacion disponible no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o ajuste preferencial (no aplicables en este dominio). El autor menciona evaluacion sobre el banco `At1uri/hamiltonian-phase-space-benchmarks`, que cubre orbitas galacticas de Henon-Heiles, pendulo doble, oscilador de Duffing bistable y fuerza central kepleriana, pero no se especifica el procedimiento de optimizacion ni la funcion de perdida empleada.

## Capacidades

- Prediccion de trayectorias en el espacio de fases para sistemas hamiltonianos con dos grados de libertad.
- Calculo de la energia conservada $\mathcal{H}_\theta(\mathbf{q}, \mathbf{p})$ para un estado dado.
- Calculo de la derivada temporal $\dot{\mathbf{z}} = \mathbf{J}\nabla_\mathbf{z}\mathcal{H}_\theta$ (velocidad de fase).
- Simulacion de trayectorias multi-paso con integradores tipo RK4 y devolucion de la serie de energias para monitorizar la deriva.
- Conservacion exacta de la energia y del volumen de fase por construccion arquitectonica, no por ajuste empirico.
- Trazado de orbitas homoclinicas y transiciones caoticas sin decaimiento espurio (segun el autor, en Henon-Heiles, Duffing y pendulo doble).
- Preservacion del momento angular en problemas de fuerza central (segun el autor, sin degradacion en el caso kepleriano).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbolico, vision, audio ni capacidades multilingues: es un modelo numerico de dominio especifico.

## Casos de uso

- Simulacion de orbitas en mecanica celeste: el modelo puede integrar trayectorias de cuerpos sujetos a potenciales centrales (por ejemplo, el caso kepleriano evaluado por el autor) preservando el momento angular y la energia durante cientos de pasos, lo que evita la deriva artificial tipica de los integradores numericos clasicos en simulaciones de largo plazo.
- Estudio de dinamica caotica en sistemas galacticos: para potenciales tipo Henon-Heiles, el modelo permite trazar la transicion entre regimenes regulares y caoticos ($E \le 0.1667$ segun el autor) manteniendo la conservacion energetica, util en investigacion sobre estabilidad de orbitas estelares.
- Modelado de osciladores no lineales en ingenieria: el oscilador de Duffing bistable aparece en sistemas mecanicos y electronicos; el modelo traza orbitas homoclinicas sin el decaimiento en espiral que introducen las redes neuronales sin restricciones geometricas.
- Analisis de sistemas acoplados tipo pendulo doble: adecuado para robomtica y mecanica de sistemas multicuerpo donde se requiere seguimiento no disipativo de la dinamica acoplada no lineal.
- Generacion de datos sinteticos fisicamente consistentes: al garantizar $\Delta H/H \approx 0$, el modelo puede emplearse como generador de trayectorias de referencia para entrenar o validar otros integradores y modelos sustitutos (surrogate models).
- Prototipado de control y prediccion en sistemas conservativos: integrable en pipelines de Python con NumPy y safetensors (sin dependencias de GPU) para experimentos rapidos de prediccion de estados futuros en laboratorios con recursos limitados.
- Docencia e investigacion en ML informado por fisica: ejemplo minimo (8.705 parametros) para estudiar como las restricciones geometricas (simplecticas) mejoran la generalizacion frente a MLPs sin estructura.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente; `verified: false`). Tarea: regresion tabular sobre `At1uri/hamiltonian-phase-space-benchmarks`.

| Metrica | Valor declarado |
|---|---|
| Deriva relativa de conservacion de energia ($\Delta H/H$, maximo en 500 pasos) | $1{,}5 \times 10^{-6}$ |
| Divergencia del volumen de fase de Liouville (MAE) | $3{,}35 \times 10^{-4}$ |
| Error de preservacion de la 2-forma simplectica (RMSE) | $2{,}1 \times 10^{-6}$ |
| Deriva relativa media de energia (model card) | $3{,}69 \times 10^{-7}$ (< 0,0001 %) |

No se han publicado en la informacion disponible comparaciones numericas frente a otros modelos en terminos de MMLU, HumanEval, GSM8K ni metricas equivalentes, por no ser aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en FP32 (8.705 parametros, ~35 KB de pesos); irrelevante en la practica.
- GPU recomendadas: no requiere GPU; funciona en CPU con NumPy.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso en Raspberry Pi) y en cualquier CPU moderna.
- Opciones de despliegue: Python puro con NumPy y `safetensors` segun el quickstart del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles de forma explicita; por el tamano del modelo, la evaluacion de un estado y su gradiente es del orden de microsegundos en CPU, aunque el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Conservacion energetica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| At1uri/hamiltonian-neural-network-symplectic-engine | 8.705 | HNN con matriz simplectica $\mathbf{J}$ | Garantizada por construccion | MIT | Hugging Face |
| Neural ODE generico (Chen et al., 2018) | variable | Campo vectorial libre $f_\theta(\mathbf{z})$ | No garantizada; deriva empirica | segun implementacion | Multiple |
| HNN original (Greydanus et al., 2019) | variable | $\dot{\mathbf{z}} = \mathbf{J}\nabla\mathcal{H}_\theta$ | Garantizada por construccion | segun implementacion | Codigo abierto |
| Symplectic ODE-Net (Zhong et al., 2020) | variable | HNN con control/entrada externa | Garantizada por construccion | segun implementacion | Codigo abierto |

La informacion disponible no incluye comparaciones numericas directas con estas alternativas; la comparativa se limita a caracteristicas arquitectonicas.

## Limitaciones y advertencias

- Dominio muy restringido: solo sistemas hamiltonianos con $n = 2$ grados de libertad (4 dimensiones de entrada); no generaliza a otros $n$ sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades de razonamiento simbolico, codigo ni vision.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados (`verified: false`); deben tratarse con cautela hasta su replicacion independiente.
- El banco de evaluacion (`At1uri/hamiltonian-phase-space-benchmarks`) es del propio autor, lo que introduce un posible sesgo de seleccion de casos favorables.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- No se documenta el proceso de entrenamiento (datos, perdida, hiperparametros), lo que dificulta evaluar la robustez fuera de los cuatro sistemas reportados.
- Riesgo de extrapolacion deficiente en regimenes alejados de la distribucion de entrenamiento, pese a los invariantes geometricos.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantias explicitas de idoneidad para produccion.
- No se han documentado sesgos de datos; al ser un modelo numerico, los sesgos relevantes serian los derivados de la distribucion de trayectorias de entrenamiento, no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/hamiltonian-neural-network-symplectic-engine
- Dataset de benchmarks (referenciado en el model-index): https://huggingface.co/datasets/At1uri/hamiltonian-phase-space-benchmarks
- Perfil del autor: https://huggingface.co/At1uri
- Paper de referencia HNN (Greydanus et al., 2019): https://arxiv.org/abs/1906.01563
- Paper de referencia Neural ODE (Chen et al., 2018): https://arxiv.org/abs/1806.07366
- Paper de referencia Symplectic ODE-Net (Zhong et al., 2020): https://arxiv.org/abs/1902.02328
