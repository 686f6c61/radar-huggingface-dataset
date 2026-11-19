# At1uri/fourier-neural-operator-2d-navier-stokes

## Resumen

El modelo `At1uri/fourier-neural-operator-2d-navier-stokes` es un operador neuronal de Fourier (Fourier Neural Operator, FNO) en 2D entrenado para aproximar la solucion de las ecuaciones de Navier-Stokes incompresibles y la dinamica de vorticidad turbulenta. Lo desarrolla Ramprasad Atluri (usuario `At1uri`) y se publica como pesos de investigacion en formato safetensors bajo licencia MIT. No es un modelo de lenguaje: es un surrogate de operador que aprende un mapeo entre espacios de funciones (campo de vorticidad inicial a campo terminal) directamente en el espacio de Fourier.

La propuesta de valor frente a la CFD clasica es doble: por un lado, evita el mallado fino y el paso temporal restringido por CFL; por otro, la parametrizacion espectral del nucleo integral confiere al modelo invariancia a la discretizacion, de modo que puede evaluarse a resoluciones distintas de las de entrenamiento (super-resolucion zero-shot). El autor declara un error relativo L2 de 0,0184 sobre su propio conjunto de benchmarks de flujo turbulento.

Con 2.365.825 parametros y un repositorio de menos de 0,1 GB, es un modelo muy ligero, pensado para experimentacion cientifica y validacion de pipelines de ML fisico mas que para despliegue en produccion generalista. Su relevancia actual radica en el interes creciente por los neural operators como alternativas rapidas a simuladores numericos en ingenieria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fourier Neural Operator (FNO) 2D con 4 capas espectrales |
| Parametros totales | 2.365.825 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (operador sobre campos 2D; entrenado a 64x64, evaluable a 128x128, 256x256 y 512x512) |
| Tipos de cuantizacion | no disponible (pesos en float32 dentro de safetensors) |
| Idiomas soportados | en (la model card declara `en`; el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

La red sigue el diseno canonico de FNO: una capa de lifting `P` que proyecta 3 canales de entrada (vorticidad inicial y coordenadas espaciales `x`, `y`) a 32 canales ocultos, seguida de 4 bloques de convolucion espectral. Cada bloque aplica una transformada de Fourier 2D truncada a 12 modos en cada eje (`k_x,max = k_y,max = 12`), multiplica por un nucleo complejo aprendido `R(k)` de dimension `32 x 32 x 12 x 12`, y vuelve al dominio espacial mediante la transformada inversa; a esa rama se le suma un bypass residual puntual `W` (convolucion 1x1). La activacion es GeLU y la proyeccion final `Q` es un MLP de dos capas `32 -> 64 -> 1`.

El entrenamiento se realiza sobre pares entrada-salida de campos de vorticidad generados con un solver pseudo-espectral (Crank-Nicolson / Runge-Kutta segun la model card), a resolucion 64x64. La model card no detalla el numero de trayectorias, el numero de tokens ni si se aplicaron tecnicas de regularizacion adicionales; esa informacion no esta disponible. La innovacion tecnica clave es la invariancia a la discretizacion: al parametrizar el operador en el espacio de Fourier, el mismo conjunto de pesos puede evaluarse sobre mallas mas finas sin reentrenamiento.

## Capacidades

- Prediccion de campos de vorticidad 2D a partir de un campo inicial, en un paso (one-step terminal field prediction).
- Super-resolucion zero-shot: entrenado a 64x64, el autor declara evaluacion directa a 128x128, 256x256 y 512x512 sin perdida de precision.
- Aproximacion de la solucion de Navier-Stokes incompresibles en regimen turbulento.
- Aprendizaje de mapeos entre espacios de funciones infinito-dimensionales (`A -> U`).
- Inferencia rapida: el autor declara mas de 100x de aceleracion frente a solvers pseudo-espectrales.
- No soporta tool calling, function calling, agentes, vision, audio ni razonamiento multi-step: no es un modelo generativo de lenguaje.
- Capacidades multilingues: no aplica; el modelo no procesa texto.

## Casos de uso

- Prototipado rapido de simulaciones de flujo turbulento: el modelo sustituye al solver numerico en fases de diseno preliminar, donde se necesita explorar muchos escenarios con latencia baja y no se requiere precision de ingenieria final.
- Super-resolucion de campos de vorticidad: partiendo de una simulacion gruesa a 64x64, el operador puede evaluarse a 256x256 o 512x512 para obtener un campo refinado sin reentrenar ni remallar.
- Generacion de datos sinteticos para entrenar otros modelos: el surrogate puede producir grandes volumenes de pares entrada-salida a bajo coste computacional, utiles para aumentar datasets de ML fisico.
- Validacion de pipelines de neural operators: al ser un modelo pequeno y con pesos en safetensors, sirve como banco de pruebas para integrar inferencia en frameworks cientificos (NumPy, PyTorch) antes de escalar a variantes mayores.
- Control y asimilacion de datos en tiempo casi real: la velocidad de inferencia permite iterar sobre condiciones iniciales en bucles de optimizacion o de control, algo inviable con CFD de alta fidelidad.
- Educacion y divulgacion: la demo WebGL/Canvas asociada permite visualizar la dinamica de vorticidad sin infraestructura de calculo cientifico.
- Investigacion en operadores espectrales: como implementacion de referencia de FNO 2D para comparar variantes (truncado de modos, profundidad, canales).

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| tabular-regression | navier-stokes-turbulent-flow-benchmarks (`At1uri/navier-stokes-turbulent-flow-benchmarks`) | Relative L2 Error | 0,0184 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones numericas con solvers clasicos o con otros neural operators.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (2,37 M de parametros, unos 9,5 MB de pesos, mas activaciones para mallas de hasta 512x512).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; una RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. Tambien es viable en CPU para mallas pequenas.
- Cabe en cualquier GPU consumer actual e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: carga directa con `safetensors.numpy.load_file` y el motor `FNO2dInferenceEngine` referenciado en la model card; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma numerica; el autor declara mas de 100x de aceleracion frente a solvers pseudo-espectrales, pero sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / dominio | Licencia | Disponibilidad |
|---|---|---|---|---|
| FNO-2D Navier-Stokes (este modelo) | 2,37 M | Campos 2D de vorticidad, entrenado a 64x64 | MIT | Hugging Face |
| DeepONet (referencia generica) | no disponible | Operadores genericos 1D/2D | variable | Multiples repositorios |
| PINN Navier-Stokes (referencia generica) | no disponible | Resolucion de EDPs con fisica informada | variable | Multiples repositorios |

No se dispone de datos numericos comparativos publicados en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas; los modelos citados son familias de referencia y no implementaciones especificas comparables.

## Limitaciones y advertencias

- Modelo de investigacion: la model card lo etiqueta explicitamente como "research-grade"; no hay garantias de robustez para uso en produccion critica.
- Error relativo L2 de 0,0184 declarado por el autor y no verificado de forma independiente; puede degradarse fuera de la distribucion de entrenamiento.
- Entrenado unicamente a 64x64; aunque el autor declara super-resolucion zero-shot, no se aportan curvas de error por resolucion.
- Dominio restringido a Navier-Stokes incompresibles 2D con condiciones de contorno no detalladas en la model card.
- No procesa lenguaje natural, imagenes ni audio; no admite tool calling ni razonamiento multi-step.
- Riesgo de alucinacion en el sentido de predicciones fisicamente inconsistentes fuera del regimen turbulento cubierto por los datos de entrenamiento.
- Sin informacion sobre sesgos del dataset de entrenamiento (tipos de flujo, numeros de Reynolds, condiciones iniciales).
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/At1uri/fourier-neural-operator-2d-navier-stokes
- Dataset de benchmarks: https://huggingface.co/datasets/At1uri/navier-stokes-turbulent-flow-benchmarks
- Demo interactiva (WebGL/Canvas): https://huggingface.co/spaces/At1uri/fourier-neural-operator-fluid-studio
