# sarvesh74/PINN-Heat-Equation-Solver

## Resumen

PINN-Heat-Equation-Solver es una red neuronal informada por la física (Physics-Informed Neural Network, PINN) desarrollada por el usuario sarvesh74 (Sarvesh, estudiante de B.Tech en Ingeniería Informática, rama de IA/ML/DL, en Pillai College of Engineering, New Panvel). El modelo resuelve la ecuacion de difusion de calor 2D transitoria en el dominio [0,1]² × [0,1] con condicion inicial u(x,y,0) = sin(πx)·sin(πy) y condiciones de contorno de Dirichlet homogeneas, sin emplear ningun dato de simulacion etiquetado: unicamente aprende a satisfacer la EDP, las condiciones de contorno y la condicion inicial mediante diferenciacion automatica con torch.autograd.

Se trata de una red totalmente conectada (MLP) con activacion Tanh y cuatro capas ocultas de dimensiones 3→64→128→128→64→1, con aproximadamente 26.000 parametros. No es un modelo de lenguaje: no tiene tokenizador, ni ventana de contexto, ni capacidad de generar texto, tool calling o conversacion. Su unica funcion es aproximar el campo de temperatura u(x,y,t) como solucion de un problema de valor inicial y de contorno concreto.

Su relevancia es fundamentalmente formativa y de investigacion: sirve como implementacion de referencia reproducible de una PINN, incluye un notebook de recorrido completo, scripts separados de entrenamiento, evaluacion y visualizacion, y una funcion de perdida multiobjetivo (L_pde + λ_bc·L_bc + λ_ic·L_ic). El autor declara un error L2 relativo inferior al 1,5 % frente a la solucion analitica conocida, con un tiempo de entrenamiento de ~8 minutos en CPU y ~90 segundos en GPU. El repositorio acumulaba 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal totalmente conectada (MLP) con activacion Tanh; 4 capas ocultas (3→64→128→128→64→1); formulacion PINN (residual de EDP + condiciones de contorno e inicial en la funcion de perdida) |
| Parametros totales | ~26.000 |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje; la entrada es un punto (x, y, t) ∈ R³) |
| Tipos de cuantizacion | No disponible (la model card no documenta cuantizacion; el checkpoint se distribuye en precision completa de PyTorch) |
| Idiomas soportados | No aplicable (no procesa ni genera lenguaje natural) |
| Licencia | MIT segun la model card del autor; los metadatos de HuggingFace no declaran licencia |
| Formato de pesos | Checkpoint de PyTorch (`.pth`, estado del modelo generado con `torch.save`); no se documenta exportacion a safetensors, GGUF ni ONNX |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa de tamano reducido: una capa de entrada de 3 neuronas (coordenadas espaciales x, y y tiempo t), cuatro capas ocultas de 64, 128, 128 y 64 neuronas con activacion Tanh, y una capa de salida de una neurona que devuelve u(x,y,t). El uso de Tanh es habitual en PINN porque proporciona derivadas de orden superior suaves y bien definidas, necesarias para calcular ∂u/∂t, ∂²u/∂x² y ∂²u/∂y² mediante diferenciacion automatica con `torch.autograd`.

El entrenamiento es mesh-free (sin malla de elementos finitos) y no supervisado por datos: la funcion de perdida combina tres terminos, el residual de la EDP evaluado en puntos de colocacion (L_pde), la violacion de las condiciones de contorno de Dirichlet (L_bc) y la violacion de la condicion inicial (L_ic), ponderados por los coeficientes λ_bc y λ_ic. La model card indica 10.000 puntos de colocacion, optimizador Adam seguido de L-BFGS y 5.000 epocas. El repositorio separa el muestreo de puntos de colocacion (`utils/collocation.py`) y las perdidas modulares (`utils/losses.py`), y centraliza los hiperparametros en `configs/config.yaml`. No se documentan en la informacion disponible tecnicas adicionales como decodificacion especulativa, atencion lineal ni destilacion.

## Capacidades

- Aproximacion del campo de temperatura u(x,y,t) para la ecuacion de calor 2D transitoria ∂u/∂t = α(∂²u/∂x² + ∂²u/∂y²) en el dominio [0,1]² × [0,1].
- Resolucion de un problema directo (forward problem) de EDP con condicion inicial sinusoide separable y contorno de Dirichlet homogeneo.
- Calculo de derivadas espaciales y temporales de primer y segundo orden mediante diferenciacion automatica de PyTorch.
- Entrenamiento sin datos etiquetados: la supervision proviene del propio operador diferencial y de las condiciones del problema.
- Inferencia puntual: dado un punto (x, y, t) devuelve un escalar, lo que permite evaluar la solucion en cualquier malla de consulta sin reentrenar.
- Evaluacion cuantitativa frente a la solucion analitica conocida, u(x,y,t) = e^(−2π²αt)·sin(πx)·sin(πy), con metricas de error implementadas en `evaluate.py`.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision, audio ni modo de pensamiento. No es un modelo generativo de lenguaje.

## Casos de uso

- Docencia de scientific machine learning: el repositorio incluye un notebook de recorrido completo y una estructura modular de perdidas, lo que permite ilustrar en clase como se formula una PINN, como se ponderan los terminos de la funcion de perdida y como se visualiza la solucion frente a la referencia analitica.
- Verificacion de solvers numericos: al disponer de solucion analitica para el caso concreto, las predicciones de la red pueden usarse como segunda opinion cualitativa frente a resultados de diferencias finitas o elementos finitos, comprobando ordenes de magnitud del error.
- Prototipo base para otras EDP: el esqueleto de codigo (colocation, losses, train, evaluate) es reutilizable cambiando el residual de la EDP y las condiciones, por ejemplo para la ecuacion de Burgers, Poisson o difusion con contorno no homogeneo.
- Experimentacion con estrategias de muestreo: los 10.000 puntos de colocacion y el modulo `utils/collocation.py` permiten estudiar el efecto de distintas distribuciones de puntos (uniforme, Sobol, remuestreo adaptativo) en el error L2 relativo.
- Estudio de optimizacion en dos fases: la combinacion Adam + L-BFGS documentada permite medir el impacto de la segunda fase sobre el error final y comparar tiempos entre CPU (~8 min) y GPU (~90 s).
- Generacion de superficies de temperatura sinteticas: el modelo puede evaluarse sobre mallas densas en (x, y) para distintos instantes t y producir campos escalares utiles en demostraciones, figuras de publicacion o material divulgativo.
- Benchmark de infraestructura para PINN: al ser un modelo de ~26.000 parametros, sirve como prueba minima de rendimiento y de interoperabilidad de PyTorch con autograd de segundo orden en distintas GPUs.
- Integracion en un portfolio tecnico o trabajo de fin de asignatura: la estructura de repositorio (configs, notebooks, results, utils) y la licencia MIT facilitan su publicacion y reutilizacion con atribucion.

## Benchmarks y rendimiento

La model card unicamente publica las metricas internas del proyecto frente a la solucion analitica del caso concreto. No se han publicado resultados en benchmarks estandar de IA (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un modelo de lenguaje y esos conjuntos no son aplicables.

| Metrica | Valor |
|---|---|
| Error L2 relativo (frente a solucion analitica) | < 1,5 % |
| Tiempo de entrenamiento (CPU) | ~8 minutos |
| Tiempo de entrenamiento (GPU) | ~90 segundos |
| Puntos de colocacion | 10.000 |
| Optimizador | Adam + L-BFGS |
| Epocas | 5.000 |

No se dispone de comparaciones con otras PINN ni con solvers numericos dentro de la informacion proporcionada, ni de desglose del error por instante temporal o por region del dominio.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB. Con ~26.000 parametros en float32, los pesos ocupan del orden de 100 KB, por lo que el cuello de botella es el framework, no el modelo.
- GPU recomendadas: cualquiera con soporte CUDA, incluidas GPUs de gama de entrada. El autor reporta ~90 segundos de entrenamiento en GPU, sin especificar el modelo concreto; no hay requisitos de memoria que justifiquen A100 o H100.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en GPU integrada. El entrenamiento completo en CPU se documenta en ~8 minutos, lo que lo hace viable sin acelerador.
- Opciones de despliegue: script de PyTorch (`train.py`, `evaluate.py`, `visualize.py`) con pesos `.pth`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, que no son aplicables a un modelo de este tipo. La exportacion a ONNX o TorchScript no esta documentada.
- Latencia y throughput: no documentados explicitamente. Al tratarse de una pasada forward de un MLP de cuatro capas sobre tres entradas, el coste por consulta es despreciable, pero no se publican mediciones formales de latencia ni de evaluaciones por segundo.
- Almacenamiento y dependencias: requisitos minimos; `requirements.txt` recoge las dependencias de PyTorch y el stack de visualizacion. Configuracion reproducible mediante `configs/config.yaml`.

## Comparativa con modelos similares

No existen alternativas con pesos publicados y metricas comparables dentro de la informacion disponible. La comparacion siguiente es cualitativa y contrasta enfoques, no cifras de rendimiento equivalentes.

| Enfoque | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PINN-Heat-Equation-Solver (sarvesh74) | PINN, MLP con Tanh | ~26.000 | No aplicable | Error L2 relativo < 1,5 % en el caso concreto | MIT (declarada en la model card) | Pesos `.pth` en HuggingFace; 0 descargas, 0 likes |
| PINN de referencia (Raissi, Perdikaris y Karniadakis, 2019) | PINN, MLP | No disponible en esta ficha | No aplicable | No disponible en esta ficha | Publicacion academica; codigo de referencia con licencia propia | Referencia metodologica, sin pesos preentrenados comparables |
| Solver numerico clasico (diferencias finitas o elementos finitos) | Metodo numerico, no neuronal | No aplicable | No aplicable | Error controlado por el refinamiento de malla | Variable segun la biblioteca | Bibliotecas maduras y ampliamente desplegadas |

## Limitaciones y advertencias

- Sesgos: no aplica en el sentido de sesgos sociales o linguisticos, ya que el modelo no procesa texto. El sesgo relevante es de cobertura fisica: solo se ha validado para un dominio, una condicion inicial y unas condiciones de contorno concretas.
- Alucinacion en sentido estricto: no aplica (no genera lenguaje). Si aplica el riesgo de extrapolacion no validada: fuera del dominio [0,1]² × [0,1] o con otros valores de α, la salida de la red carece de garantias y puede violar la fisica del problema sin aviso.
- Generalizacion limitada: los pesos publicados corresponden al caso sinusoide separable con contorno de Dirichlet homogeneo. No hay evidencia en la informacion disponible de que el modelo resuelva condiciones iniciales o de contorno distintas sin reentrenamiento.
- Validacion incompleta: solo se reporta el error L2 relativo global (< 1,5 %). No se documentan errores maximos, error por instante, sensibilidad a los pesos λ de la funcion de perdida, ni estudio de convergencia con el numero de puntos de colocacion.
- Informacion tecnica ausente: la model card no especifica el valor de la difusividad α empleado, la semilla aleatoria, el desglose de hiperparametros de Adam y L-BFGS ni el procedimiento de muestreo de puntos de colocacion.
- Licencia: la model card declara MIT, lo que permitiria uso comercial y modificacion con atribucion, pero los metadatos de HuggingFace no declaran licencia. Conviene verificar el fichero LICENSE antes de un uso en produccion.
- Madurez y trazabilidad: 0 descargas y 0 likes, sin revision por pares ni validacion externa conocida. Los metadatos de HuggingFace registran creacion y ultima actualizacion el 16 de septiembre de 2026, sin actividad posterior registrada.
- Idoneidad para produccion: no es un sustituto de un solver numerico verificado en entornos criticos (por ejemplo, analisis termico certificado). Su uso razonable es educativo, de prototipado y de investigacion.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los resultados obtenidos correspondian a dominios de reservas de alojamiento y no guardan relacion con el proyecto. Por tanto, cualquier dato externo adicional figura como no disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sarvesh74/PINN-Heat-Equation-Solver
- Perfil del autor en HuggingFace: https://huggingface.co/sarvesh74
- Raissi, M., Perdikaris, P. y Karniadakis, G. E. (2019). Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. Journal of Computational Physics, 378, 686-707 (referencia citada en la model card; enlace directo no proporcionado).
- Karniadakis, G. E. et al. (2021). Physics-informed machine learning. Nature Reviews Physics, 3(6), 422-440 (referencia citada en la model card; enlace directo no proporcionado).
- Documentacion de PyTorch: https://pytorch.org/docs/
- Documentacion de PyTorch sobre diferenciacion automatica: https://pytorch.org/docs/stable/autograd.html
- Repositorio de codigo: segun la model card, el propio repositorio de HuggingFace incluye los scripts `pinn_heat_equation.py`, `train.py`, `evaluate.py`, `visualize.py`, `configs/config.yaml` y `notebooks/PINN_Heat_Equation.ipynb`; no se indica un repositorio externo de GitHub.
