# phanerozoic/coilstellaration-direct

## Resumen

`coilstellaration-direct` es un modelo neuronal ligero publicado por el usuario phanerozoic en Hugging Face, distribuido como un grafo ONNX de 7,3 millones de parametros. No es un modelo de lenguaje: es un predictor directo de bobinas (coilsets) para stellarators, es decir, para reactores de fusion de confinamiento magnetico. El modelo resuelve la pista `fixed_shape` del benchmark Coilstellaration (tres periodos de campo y cinco bobinas por medio periodo), donde se pide, dada una frontera de plasma y cuatro objetivos de ingenieria, devolver la geometria y las corrientes de las bobinas.

La relevancia del modelo es practica: sustituye un proceso de optimizacion iterativo, tipicamente costoso y con evaluaciones de fisica en bucle, por un unico paso hacia delante de una red feed-forward. Una sola inferencia mapea 81 coeficientes de Fourier de la frontera y cuatro objetivos (distancia minima bobina-bobina, distancia minima bobina-plasma, curvatura maxima de bobina y error de campo normalizado maximo) a 225 coeficientes de Fourier de las cinco bobinas y sus cinco corrientes en amperios.

El modelo es un MLP residual entrenado en dos fases, la segunda con un modelo diferenciable de las metricas fisicas del benchmark. Con el scorer oficial, satisface los cuatro objetivos en 146 de 472 instancias de fronteras reservadas (30,9%), con un rendimiento muy desigual segun la dificultad del estrato: 127/161 en el laxo, 15/161 en el medio y 4/150 en el estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP residual (perceptron multicapa con bloques residuales); no es un transformer ni un modelo de lenguaje |
| Parametros totales | 7,3 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de dimension fija: 81 coeficientes de frontera + 4 objetivos) |
| Tipos de cuantizacion | no disponible (pesos en float32 dentro del grafo ONNX) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

La red es un MLP residual: una capa lineal de entrada a anchura 768, seis bloques residuales (layer normalization, capa lineal, activacion SiLU, capa lineal), una layer normalization final y una capa lineal de salida. Las entradas son los 81 coeficientes de Fourier de la frontera que varian en el dataset y los logaritmos de los cuatro objetivos, estandarizados; las salidas son los 225 coeficientes de Fourier de las bobinas y las cinco corrientes, tambien estandarizados, con los factores de escala fijados como constantes del grafo. El grafo no contiene bucles ni evalua fisica.

El entrenamiento se hizo sobre el split de entrenamiento del dataset `proxima-fusion/coilstellaration` en dos etapas. La primera ajusta por error cuadratico a los coilsets del split, con 3000 pasos y lotes de 512. La segunda entrena contra los cuatro requisitos del benchmark, calculados sobre las propias salidas de la red mediante un modelo diferenciable de las metricas en PyTorch (`physics.py`), con lotes de 96. Las penalizaciones son el cuadrado del campo normal por encima de 0,85 del objetivo (evaluado en 512 puntos del medio periodo que se desplazan en cada paso con el campo de Biot-Savart) y los cuadrados de cada distancia bobina-bobina por debajo de 1,04 de su objetivo, cada distancia bobina-plasma por debajo de 1,03 y cada curvatura por encima de 0,985. La perdida por instancia es el logaritmo de uno mas la suma de las penalizaciones de campo, 300 veces las penalizaciones geometricas y 0,02 veces el error cuadratico respecto al coilset de entrenamiento.

Se reservo una veintena de las fronteras de entrenamiento en ambas etapas, y los pesos publicados son la media movil de los pesos de la segunda etapa en el paso, de los primeros 10 000, donde esas fronteras obtuvieron mejor puntuacion. El split de evaluacion del benchmark no se leyo.

## Capacidades

- Prediccion directa de coilsets de stellarator en un solo paso hacia delante, sin bucle de optimizacion.
- Mapeo de coeficientes de Fourier de la frontera del plasma y cuatro objetivos de ingenieria a coeficientes de Fourier y corrientes de cinco bobinas.
- Evaluacion implicita de restricciones fisicas aprendidas (distancias, curvatura y error de campo) gracias a la segunda fase de entrenamiento.
- Exportacion e inferencia via ONNX Runtime, con contrato de entrada y salida fijo definido por el benchmark.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues; no es un modelo generativo de texto.

## Casos de uso

- Exploracion rapida de disenos de stellarator: dado un contorno de plasma candidato y unos objetivos de ingenieria, obtener un coilset inicial en milisegundos para filtrar configuraciones antes de una optimizacion fisica completa.
- Generacion de puntos de partida para optimizadores: usar la salida de la red como inicializacion de un solver de fisica, reduciendo el numero de iteraciones necesarias.
- Barrido de objetivos de ingenieria: variar los cuatro requisitos (distancias, curvatura, error de campo) y observar como cambia la geometria de las bobinas, util para estudiar compromisos de diseno.
- Prototipado en pipelines de investigacion en fusion: integrar el grafo ONNX en scripts de Python con ONNX Runtime para generar datasets sinteticos de coilsets etiquetados.
- Docencia y divulgacion: ilustrar la relacion entre la frontera del plasma y la geometria de las bobinas con un modelo ligero que se ejecuta en CPU.
- Evaluacion comparativa de metodos: servir de baseline directo (sin optimizacion) frente a metodos iterativos en la pista `fixed_shape` del benchmark Coilstellaration.
- Despliegue en entornos con recursos limitados: al ser un grafo de 7,3 M de parametros, puede ejecutarse en CPU o en GPUs modestas sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card, con el scorer oficial del benchmark sobre fronteras reservadas (held-out):

| Metrica | Resultado |
|---|---|
| Instancias que cumplen los cuatro objetivos | 146 / 472 (30,9%) |
| Estrato laxo | 127 / 161 |
| Estrato medio | 15 / 161 |
| Estrato estricto | 4 / 150 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 7,3 M de parametros en float32 el grafo ocupa del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 3060 o superior, A100, H100) ejecutara la inferencia con latencia despreciable. La model card menciona que `physics.py` calcula las metricas en GPU para el entrenamiento, no para la inferencia del grafo.
- Cabe en GPU consumer: si, en practicamente todas; tambien en CPU.
- Opciones de despliegue: ONNX Runtime (usado en el ejemplo de la model card); otros runtimes compatibles con ONNX no estan documentados en la informacion disponible.
- Latencia y throughput estimados: no disponibles de forma explicita; por el tamano del grafo y la ausencia de bucles, se espera latencia de milisegundos o inferior por instancia, aunque no se aporta una cifra medida.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables de prediccion directa de coilsets para stellarators, ni resultados de benchmarks de alternativas.

## Limitaciones y advertencias

- Cobertura limitada: solo satisface los cuatro objetivos en el 30,9% de las instancias reservadas, y el rendimiento cae drasticamente en el estrato estricto (4 de 150).
- Ambito restringido a la pista `fixed_shape` del benchmark (tres periodos de campo, cinco bobinas por medio periodo); no se documenta soporte para otras configuraciones.
- El modelo no evalua fisica en el grafo: las restricciones son aprendidas y pueden violarse fuera de la distribucion de entrenamiento.
- El split de evaluacion del benchmark no se leyo durante el desarrollo, por lo que las cifras publicadas corresponden a fronteras reservadas del split de entrenamiento y no a una evaluacion independiente del benchmark.
- Riesgo de extrapolacion pobre ante fronteras de plasma u objetivos fuera del rango del dataset de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion, pero no se documentan garantias ni soporte.
- No apto para tareas de lenguaje, vision ni agentes; su uso esta acotado al dominio de diseno de bobinas de stellarator.
- No se documentan sesgos en el sentido de modelos de lenguaje; el analogo aqui es el sesgo de la distribucion del dataset `proxima-fusion/coilstellaration`, cuyas caracteristicas no se detallan en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phanerozoic/coilstellaration-direct
- Dataset de entrenamiento: https://huggingface.co/datasets/proxima-fusion/coilstellaration
- Benchmark Coilstellaration (Space): https://huggingface.co/spaces/proxima-fusion/coilstellaration-bench
