# rezapop/IDFF

## Resumen

IDFF (Implicit Dynamical Flow Fusion) es un metodo de modelado generativo desarrollado por Mohammad R. Rezaei, Milos R. Popovic, Milad Lankarany y Rahul G. Krishnan, publicado en Transactions on Machine Learning Research (TMLR) en 2026. No es un modelo de lenguaje, sino una tecnica de generacion basada en Conditional Flow Matching (CFM) que reduce drasticamente el numero de evaluaciones de red (NFE) necesarias para producir muestras de alta calidad. El repositorio de Hugging Face aloja el paper y los checkpoints entrenados de los ejemplos bidimensionales, de series temporales y de dinamica molecular.

El problema que resuelve es la ineficiencia computacional del CFM deterministico, que tipicamente requiere mas de cien NFE por muestra. IDFF aumenta el campo vectorial de CFM con terminos de derivada del score de orden K, obtenidos por diferenciacion automatica del score de primer orden ya aprendido, sin entrenar redes adicionales. En primera aproximacion (K=1) el metodo se reduce a un flujo aumentado con Langevin cuya marginal se preserva exactamente en tiempo continuo.

La relevancia actual radica en que permite obtener calidad de muestreo comparable con muchas menos evaluaciones de red, lo que abarata la inferencia en modelos generativos. En CIFAR-10 la configuracion K=1 alcanza un FID de 2.78 con solo 10 NFE, y el metodo tambien se evalua en simulacion de dinamica molecular y prediccion de temperatura superficial del mar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow Matching condicional aumentado con terminos de score de orden K (MLP de cabezas conjuntas, `idff.JointHeadMLP`) |
| Parametros totales | no disponible (depende de la configuracion: `hidden=256, depth=3` para 2-D; `hidden=128, depth=2` para Lorenz) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; trabaja sobre estados de dimension 2, 46 o series de 200-2000 posiciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | PyTorch `state_dict` (`.pt`), cargables con `weights_only=True` |

## Arquitectura y entrenamiento

IDFF parte de Conditional Flow Matching, que aprende un transporte determinista del ruido a los datos. La innovacion consiste en aumentar el campo vectorial con derivadas del score de orden K, calculadas por diferenciacion automatica del score de primer orden aprendido. Esto implica que no se entrena ninguna red adicional: el coste de entrenamiento es el del CFM base. Para K=2 el paper aporta un analisis de error que acota la desviacion de la correccion de curvatura opcional mediante la perdida de score-matching ya minimizada por el objetivo.

Los checkpoints publicados corresponden a modelos pequenos: MLPs de cabezas conjuntas con `hidden=256, depth=3, sigma0=0.2` para las distribuciones 2-D (8 gaussianas, tablero de ajedrez, lunas); `hidden=128, depth=2, sigma0=0.05` para el atractor de Lorenz con 2000 posiciones; y un surrogate de dinamica molecular polyALA con 46 angulos diedros y 200 posiciones. Los ficheros `config.json` recogen los argumentos de entrenamiento y los ajustes del muestreador (`gamma_bar`, `alpha_2`) seleccionados sobre datos de validacion.

## Capacidades

- Generacion de muestras en distribuciones 2-D sinteticas (8 gaussianas, tablero de ajedrez, lunas).
- Rollouts autoregresivos sobre sistemas dinamicos (atractor de Lorenz) con 5 NFE por fotograma.
- Simulacion surrogate de dinamica molecular (angulos diedros de polyALA).
- Prediccion de series temporales (temperatura superficial del mar, segun el abstract).
- Muestreo con NFE reducido (5-10 evaluaciones) manteniendo calidad comparable al CFM deterministico.
- Configuraciones K=0 (CFM base), K=1 (flujo aumentado con Langevin) y K=2 (correccion de curvatura).
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Generacion rapida de muestras sinteticas 2-D: util para validar y comparar metodos generativos con pocas evaluaciones de red, usando los checkpoints de 8 gaussianas, tablero de ajedrez o lunas como referencia reproducible.
- Simulacion acelerada de dinamica molecular: el surrogate polyALA predice angulos diedros con menos NFE, lo que reduce el coste de exploracion conformacional en pipelines de diseno de farmacos.
- Prediccion de series temporales geoespaciales: el metodo se evalua en temperatura superficial del mar, adecuado para forecasting climatico donde el coste de inferencia importa.
- Modelado de sistemas dinamicos caoticos: los rollouts sobre Lorenz permiten estudiar estabilidad de generadores autoregresivos en regimenes caoticos con presupuesto computacional ajustado.
- Investigacion en metodos generativos: sirve como baseline para estudiar el compromiso entre NFE y calidad (FID) frente a CFM y modelos de difusion.
- Prototipado en CPU: al tratarse de MLPs pequenos con checkpoints de pocos MB, se pueden ejecutar en portatil para experimentos docentes o de validacion.
- Generacion condicionada en entornos con latencia estricta: la reduccion de NFE a 5-10 hace viable el muestreo en tiempo real en aplicaciones de simulacion interactiva.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| CIFAR-10 (FID) | IDFF K=1, 10 NFE | 2.78 |
| 8 gaussianas | IDFF K=1 y K=2, 5 NFE | comparacion cualitativa (GIF en el repo) |
| Lorenz (rollout 2000 pasos) | IDFF K=1 y K=2, 5 NFE por fotograma | comparacion cualitativa frente a trayectoria simulada |

No se han publicado en la informacion disponible resultados numericos adicionales de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada: minima; los checkpoints son MLPs de pocos cientos de miles de parametros y caben en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada; una GPU integrada o CPU es suficiente para los ejemplos publicados.
- Cabe en consumer GPU: si, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: PyTorch nativo con el paquete `idff` del repositorio `rezapop/IDFF-code`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles de forma numerica; el beneficio clave es la reduccion de NFE (5-10 frente a mas de 100 del CFM tipico).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IDFF (este) | MLPs pequenos (hidden 128-256) | no aplica | FID 2.78 en CIFAR-10 a 10 NFE | other | Hugging Face + GitHub |
| CFM deterministico (baseline del paper) | mismo tamano | no aplica | requiere >100 NFE tipicamente | segun implementacion | codigo abierto |
| Modelos de difusion tipo DDPM | no disponible en la informacion | no aplica | no disponible en la informacion | segun implementacion | amplia |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada mas alla del baseline CFM citado en el propio paper.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni mantiene conversaciones; cualquier uso en esos dominios es inadecuado.
- Los checkpoints publicados cubren solo ejemplos 2-D, Lorenz y polyALA; no hay pesos para CIFAR-10 ni para temperatura superficial del mar en el repositorio.
- La licencia es "other": es necesario revisar los terminos exactos antes de un uso comercial.
- El metodo depende de la calidad del score de primer orden aprendido; errores en este se propagan a las correcciones de orden superior.
- El analisis de error para K=2 acota la desviacion por la perdida de score-matching, pero no garantiza calidad en regimenes fuera de distribucion.
- Los ajustes del muestreador (`gamma_bar`, `alpha_2`) se seleccionan sobre validacion y pueden no transferirse a otros datasets.
- No se han publicado resultados de sesgo, alucinacion ni robustez porque el modelo no opera sobre texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica validacion externa limitada.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/rezapop/IDFF
- Hugging Face (codigo): https://huggingface.co/rezapop/IDFF-code
- arXiv: https://arxiv.org/abs/2409.14599
- OpenReview: https://openreview.net/forum?id=RWnohJJKbq
- GitHub: https://github.com/MrRezaeiUofT/Implicit_Dynamical_Flow_Fusion_for_Genereative_Modeling
- Paper (PDF en el repo): paper/IDFF_TMLR_2026.pdf
