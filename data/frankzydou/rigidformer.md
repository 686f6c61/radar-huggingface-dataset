# frankzydou/RigidFormer

## Resumen

RigidFormer es un modelo de simulación aprendida de dinámica de cuerpos rígidos con múltiples objetos, desarrollado por Zhiyang Dou y colaboradores (con participación de investigadores del MIT CSAIL, entre ellos Wojciech Matusik) y presentado en NeurIPS 2026. No es un modelo de lenguaje: es un Transformer centrado en objetos (object-centric Transformer) que predice la evolución física de escenas con varios cuerpos rígidos a partir de unos pocos fotogramas de referencia.

El repositorio de HuggingFace publica tres checkpoints preentrenados, uno por cada conjunto de datos de RigidFormer-MOVi: `rigidformer_movisphere.pth` (MOVi-Sphere), `rigidformer_movia.pth` (MOVi-A) y `rigidformer_movib.pth` (MOVi-B). Cada uno tiene 148,4 millones de parámetros y se acompaña de su fichero de configuración YAML correspondiente, los mismos que se usaron para entrenar y evaluar los modelos.

Su relevancia actual está en el ámbito de los simuladores aprendidos y los world models físicos: sustituye o complementa a los motores de física clásicos en tareas donde se necesita predecir el movimiento futuro de objetos a partir de observaciones, con un protocolo de evaluación reproducible sobre 120 escenas de test y métricas explícitas de error de posición y de rotación a lo largo de horizontes de hasta 400 fotogramas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer centrado en objetos (object-centric Transformer) para dinámica de cuerpos rígidos multiobjeto |
| Parámetros totales | 148,4 M por checkpoint (tres checkpoints publicados) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la evaluación parte de cuatro fotogramas de referencia (*ground-truth*) en los que se condiciona el modelo |
| Tipos de cuantización | no disponible; los pesos se distribuyen en precisión completa (float32, aproximadamente 594 MB por checkpoint) |
| Idiomas soportados | no aplica (modelo de simulación física, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`); configuraciones en YAML (`.yaml`) |
| Librería | PyTorch |
| Tamaño del repositorio | 1,8 GB |
| Conjuntos de datos de entrenamiento | `frankzydou/RigidFormer-MOVi` (variantes MOVi-Sphere, MOVi-A, MOVi-B) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-12 |
| Fecha de última actualización | 2026-10-12 |

## Arquitectura y entrenamiento

RigidFormer se describe como un Transformer centrado en objetos que aprende la dinámica de cuerpos rígidos con múltiples objetos. A diferencia de un Transformer estándar sobre píxeles o tokens de lenguaje, opera sobre representaciones por objeto, lo que permite razonar sobre cada cuerpo de forma individualizada dentro de la escena. El repositorio no detalla el número de capas, la dimensión del modelo, el mecanismo de atención empleado ni el esquema de codificación posicional; esa información no está disponible en el material proporcionado.

En cuanto al entrenamiento, la model card indica que se publica un modelo preentrenado por cada conjunto de datos de RigidFormer-MOVi y que los ficheros de `configs/` son exactamente los usados para entrenar y evaluar cada variante, pero no se especifica el número de tokens o de fotogramas vistos, la composición exacta del dataset, ni si hubo etapas de ajuste con refuerzo o preferencias. El protocolo de evaluación sí está documentado: se parte de cuatro fotogramas de referencia y se despliega la predicción (*rollout*) con tamaños de paso 1, 5 y 10 sobre un conjunto completo de 120 escenas de test, usando un estimador de posición denominado *hopnet*. La innovación principal declarada es precisamente el uso de un Transformer centrado en objetos para la dinámica rígida, evaluado con un protocolo abierto y reproducible.

## Capacidades

- Predicción de dinámica de cuerpos rígidos: genera el estado futuro (posición y orientación) de múltiples objetos rígidos en una escena a partir de cuatro fotogramas de referencia.
- *Rollout* multi-paso: mantiene la predicción de forma autorregresiva a lo largo del tiempo, con tamaños de paso 1, 5 y 10 documentados en el directorio `eval/`.
- Estimación de posición y rotación: el protocolo reporta RMSE de posición en metros y error de rotación en grados, agregados en RMS sobre los objetos de la escena.
- Generalización entre variantes de escena: existen checkpoints específicos para MOVi-Sphere (esferas), MOVi-A y MOVi-B, cada uno entrenado sobre su distribución correspondiente.
- No dispone de soporte de *tool calling*, *function calling*, agentes, multi-step reasoning lingüístico, capacidades multilingües, visión general, audio ni modo de razonamiento explícito: la información disponible no documenta ninguna de estas capacidades.
- No se documenta ninguna capacidad de entrada o salida en lenguaje natural.

## Casos de uso

- Planificación y control en robótica: el modelo puede predecir la evolución de una escena con varios objetos rígidos y alimentar un planificador de manipulación, ya que su error de posición se mantiene por debajo de 0,08 m hasta el fotograma 100 en MOVi-A (RMSE 0,0779 m en el fotograma 100).
- Gemelos digitales industriales a corto plazo: para simular el comportamiento inmediato de piezas y contenedores en una línea de producción, donde el horizonte útil de decenas de fotogramas es suficiente y el coste de un motor de física completo no está justificado.
- Generación de datos sintéticos para aprendizaje por refuerzo: los *rollouts* del modelo pueden servir como transiciones sintéticas para entrenar políticas, especialmente en configuraciones tipo MOVi-Sphere donde el error a 25 fotogramas es de solo 0,0052 m de RMSE.
- Validación cruzada de motores de física: al comparar la trayectoria aprendida con la de un simulador clásico se pueden detectar discrepancias en la modelización de contactos y fricción, usando las métricas publicadas como referencia.
- Seguimiento y estimación de estado en visión por computador 3D: dado que el modelo opera con cuatro fotogramas de entrada, puede integrarse en un *pipeline* de *tracking* para predecir la posición futura de objetos rígidos y mantener la coherencia temporal cuando la detección falla.
- Animación y gráficos por computador: predicción de movimiento de objetos rígidos en escenas sintéticas para previsualización rápida, con la ventaja de que la inferencia de un modelo de 148,4 M de parámetros es mucho más ligera que un *rollout* físico completo.
- Investigación en world models: sirve como banco de pruebas reproducible (tres checkpoints, configuraciones YAML y protocolo de 120 escenas) para comparar arquitecturas centradas en objetos frente a enfoques alternativos de dinámica aprendida.
- Aumento de datos con horizontes controlados: para tareas que solo necesitan predicción a corto plazo, pueden generarse trayectorias sintéticas limitando el *rollout* a los primeros 50-100 fotogramas, donde el error de rotación se mantiene por debajo de 17,6 grados en MOVi-A.

## Benchmarks y rendimiento

Resultados publicados en la model card. Conjunto de test, tamaño de paso 1, *rollout* a partir de cuatro fotogramas de referencia; error medido en los fotogramas físicos 25 a 400:

| Modelo | Métrica | @25 | @50 | @75 | @100 | @200 | @300 | @400 |
|---|---|---|---|---|---|---|---|---|
| MOVi-Sphere | RMSE de posición (m) | 0,0052 | 0,0215 | 0,0451 | 0,0779 | 0,3183 | 0,7439 | 1,1911 |
| MOVi-Sphere | Error de rotación (grados) | 0,653 | 2,933 | 6,277 | 10,745 | 47,304 | 93,222 | 106,549 |
| MOVi-A | RMSE de posición (m) | 0,0109 | 0,0402 | 0,0860 | 0,1451 | 0,5181 | 1,0482 | 1,5685 |
| MOVi-A | Error de rotación (grados) | 1,369 | 4,809 | 10,637 | 17,568 | 56,553 | 91,524 | 106,223 |
| MOVi-B | RMSE de posición (m) | 0,0068 | 0,0298 | 0,0613 | 0,1080 | 0,4374 | 0,9402 | 1,4138 |
| MOVi-B | Error de rotación (grados) | 0,680 | 3,288 | 7,163 | 12,646 | 49,602 | 91,984 | 107,141 |

Protocolo declarado: estimador de posición *hopnet*; conjunto de escenas completo, 120 escenas de test; el error de rotación es el RMS sobre los objetos y el MAE de rotación es el ángulo absoluto medio sobre los objetos. Los registros completos, con tamaños de paso 5 y 10 y el MAE de rotación, están en el directorio `eval/`. No se han publicado en la información disponible resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como estimación derivada del tamaño del modelo, 148,4 M de parámetros en float32 ocupan aproximadamente 594 MB, por lo que el peso necesita menos de 1 GB de memoria; en float16 bajaría a unos 300 MB. A ello hay que sumar la memoria de activaciones y del entorno de simulación, que depende del número de objetos y del horizonte de *rollout*.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre debería poder ejecutar la inferencia en float32.
- GPU de consumo: sí, cabe holgadamente en tarjetas de consumo (por ejemplo, gama RTX xx60 o superior), dado que el checkpoint es de 148,4 M de parámetros. Esta afirmación es una inferencia a partir del tamaño, no un dato publicado.
- Opciones de despliegue: el repositorio solo documenta ejecución mediante PyTorch y el script `scripts/eval.sh` del repositorio de código, con descarga de pesos vía `hf download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de simulación física.
- Latencia y *throughput*: no disponibles.
- Almacenamiento: el repositorio completo ocupa 1,8 GB; cada checkpoint ronda los 594 MB.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros simuladores aprendidos ni con motores de física clásicos, y no se han facilitado datos de rendimiento de alternativas en el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Degradación con el horizonte: el error crece de forma marcada en *rollouts* largos. En MOVi-Sphere el error de rotación pasa de 10,745 grados en el fotograma 100 a 106,549 grados en el fotograma 400, y el RMSE de posición de 0,0779 m a 1,1911 m. Los resultados a partir del fotograma 200 deben tratarse con cautela.
- Dependencia del conjunto de datos: cada checkpoint está entrenado sobre una única variante de RigidFormer-MOVi (esferas, A o B), por lo que no hay evidencia publicada de generalización a otras distribuciones de escena, otros objetos u otras condiciones físicas.
- Protocolo de evaluación cerrado: el *rollout* parte de cuatro fotogramas de referencia y usa un estimador de posición concreto (*hopnet*) sobre 120 escenas; el rendimiento fuera de ese protocolo no está caracterizado.
- Riesgo de alucinación física: al ser un modelo aprendido, puede producir trayectorias plausibles pero físicamente inconsistentes, especialmente cuando la escena se aleja de la distribución de entrenamiento o cuando hay contactos complejos no representados en los datos.
- Sesgos: no disponible. La model card no documenta análisis de sesgos, y el término no aplica de la misma forma que en modelos de lenguaje, aunque sí puede existir un sesgo hacia las propiedades de los objetos y las dinámicas presentes en MOVi.
- Idiomas y contexto lingüístico: no aplica; el modelo no procesa texto.
- Licencia: MIT, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la licencia. No se documentan restricciones adicionales de uso.
- Madurez del repositorio: 0 descargas y 0 *likes* en el momento de la consulta, sin validación externa registrada, lo que desaconseja su uso directo en producción sin una evaluación propia.
- Dependencia de datos externos: la reproducción de los resultados exige preparar el conjunto de datos RigidFormer-MOVi tal y como se describe en la *dataset card* y disponer del código del repositorio de GitHub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frankzydou/RigidFormer
- Conjunto de datos RigidFormer-MOVi: https://huggingface.co/datasets/frankzydou/RigidFormer-MOVi
- Paper (arXiv): https://arxiv.org/abs/2605.09196
- Código fuente: https://github.com/Frank-ZY-Dou/Dynamics-Modeling/tree/main/RigidFormer
- Cita (BibTeX, NeurIPS 2026):
  ```
  @inproceedings{dou2026rigidformer,
    title     = {RigidFormer: Learning Rigid Dynamics using Transformers},
    author    = {Dou, Zhiyang and Guo, Minghao and Wu, Haixu and Roble, Doug and Stuyck, Tuur and Matusik, Wojciech},
    booktitle = {Advances in Neural Information Processing Systems (NeurIPS)},
    year      = {2026}
  }
  ```
