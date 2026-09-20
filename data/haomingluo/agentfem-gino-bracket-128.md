# HaomingLuo/AgentFEM-GINO-Bracket-128

## Resumen

AgentFEM-GINO-Bracket-128 es un operador neuronal (neural operator) entrenado para predecir el campo de desplazamiento superficial de una familia concreta de soportes (brackets) de doble brazo simétricos, a partir únicamente de su geometría. Lo desarrolla HaomingLuo dentro del ecosistema AgentFEM y combina tres piezas: un backbone GINO (Geometry-Informed Neural Operator, Li et al., 2023) para la parte de operador sobre geometría 3D, un MLP residual con conciencia de simetría y una máscara de caras fijas. El objetivo es sustituir parcialmente al solver de elementos finitos (FEM) en fases de exploración de diseño, donde se necesitan miles de evaluaciones rápidas en lugar de un puñado de simulaciones exactas.

El checkpoint se ha entrenado con 128 geometrías del dataset AgentFEM-Bracket-Elasticity, con material y carga fijos (E = 70 GPa, nu = 0,33, carga uniforme descendente sobre el asiento). Sobre 32 geometrías nuevas nunca vistas reporta un error medio de desplazamiento superficial del 3,08 % y un error medio de deflexión del asiento superior del 0,80 %; el autor indica explícitamente que esas cifras corresponden al modelo híbrido completo, no al backbone GINO en bruto.

Es relevante ahora porque se publica junto a las curvas de aprendizaje por tamaño de dataset (32, 64 y 128 geometrías), lo que permite evaluar de forma reproducible cuánto aporta cada componente del pipeline y cuánto cuesta entrenar operadores neuronales en elasticidad 3D con datos escasos. No es un modelo de lenguaje: no procesa texto, no tiene contexto en tokens ni soporta tool calling, agentes o multimodalidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GINO (Geometry-Informed Neural Operator) como backbone + MLP residual con conciencia de simetría + máscara de caras fijas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es una nube de puntos de superficie más parámetros geométricos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (documentación y model card en inglés; el modelo no procesa lenguaje natural) |
| Licencia | Apache-2.0 (código y pesos); el dataset AgentFEM-Bracket-Elasticity se distribuye bajo CC BY 4.0 |
| Formato de pesos | PyTorch state dicts en formato `.pt`: `operator_state.pt` (backbone, arquitectura y normalización de entrenamiento), `correction.pt` (red residual), `mlp_only.pt` (baseline de coordenadas independiente) |
| Tarea | Predicción de campo de desplazamiento superficial (regresión de campo) a partir de geometría |
| Entradas | `surface_points` (puntos de superficie), parámetros `depth`, `radius`, `waist`, `bow` y `load_N` (por ejemplo 10000) |
| Salidas | Desplazamiento en metros en cada punto de superficie proporcionado |
| Dominio físico soportado | Familia fija de soportes de doble brazo simétricos, caras inferiores de apoyo fijas, carga uniforme descendente sobre el asiento, E = 70 GPa, nu = 0,33 |
| Rangos de los parámetros | `depth` 0,015–0,032 m; `radius` 0,010–0,023 m; `waist` 0,04–0,38 (adimensional); `bow` 0,005–0,030 m. `depth` y `radius` son semi-dimensiones de referencia en metros |
| Tamaño del repositorio | 0,0 GB según los metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-09-20 |
| Librería | pytorch |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo es un pipeline híbrido de tres etapas. La primera es un backbone GINO, un operador neuronal informado por geometría que combina un neural operator de tipo Fourier (FNO) sobre una representación de la geometría con una rama de consulta basada en coordenadas, lo que permite evaluar la solución en puntos arbitrarios de la malla de superficie. Sobre esa salida se aplica una segunda etapa: un MLP residual con conciencia de simetría, que corrige el sesgo sistemático del backbone, y una máscara de caras fijas que impone las condiciones de contorno de los apoyos. El repositorio incluye también `mlp_only.pt`, una red de coordenadas independiente que actúa como baseline y que en los experimentos publicados supera al backbone GINO crudo.

El entrenamiento se realizó con 128 geometrías del dataset AgentFEM-Bracket-Elasticity, generadas con el solver AgentFEM. Cada tamaño de dataset (32, 64 y 128 geometrías) se entrenó desde cero con la misma arquitectura y con conjuntos de validación y test fijos, y los resultados se promedian sobre tres semillas de entrenamiento. La semilla publicada (2026) se seleccionó usando el error de validación, no el de test, tal como indica el autor. No se documenta en la información disponible el número de tokens ni un proceso de RLHF o DPO, ya que no aplica a este tipo de modelo.

## Capacidades

- Predicción de campos de desplazamiento superficial en metros para geometrías dentro del rango paramétrico declarado, sin necesidad de instalar ni ejecutar un solver de elementos finitos.
- Modo híbrido completo (backbone GINO + corrección residual + máscara), que es el que produce las cifras de error publicadas.
- Modo `kind="gino"` para inspeccionar el backbone crudo, y modo `kind="mlp_only"` para evaluar el baseline de red de coordenadas.
- Evaluación en puntos de superficie arbitrarios: la interfaz recibe `surface_points` y devuelve un desplazamiento por punto.
- Parametrización explícita de la geometría mediante cuatro variables (`depth`, `radius`, `waist`, `bow`) y de la carga (`load_N`), lo que permite barridos sistemáticos de diseño.
- Reproducibilidad de métricas: el repositorio publica `evaluation.json` y `learning_curve.csv` con métricas completas, registros por caso y variación entre semillas.
- No soporta generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio, tool calling, function calling ni flujos de agentes multi-paso.
- No tiene capacidades multilingües: la única lengua declarada es el inglés y solo afecta a la documentación.

## Casos de uso

- Exploración de diseño en fases tempranas: dado un soporte de doble brazo con `depth`, `radius`, `waist` y `bow` dentro de los rangos soportados, el modelo devuelve el campo de desplazamiento superficial en segundos, lo que permite descartar geometrías poco rígidas antes de gastar horas de cálculo FEM.
- Optimización paramétrica de rigidez y peso: el compromiso entre masa y deflexión del asiento superior se puede explorar barriendo miles de combinaciones de los cuatro parámetros y usando el error del 0,80 % en deflexión del asiento como criterio de cribado.
- Prefiltrado para pipelines de CAE: el modelo actúa como surrogate que prioriza qué casos merecen una simulación FEM completa, reduciendo el número de ejecuciones del solver de alta fidelidad.
- Generación de datos sintéticos y aumento de dataset: las predicciones se pueden usar para preetiquetar geometrías candidatas que después se validan con AgentFEM, acelerando la construcción de nuevos datasets de elasticidad.
- Integración en herramientas de diseño paramétrico: `inference.py` expone una clase `BracketPredictor` con un método `predict(...)` que se puede llamar desde scripts de Python o servicios internos, sin dependencia del solver de elementos finitos en tiempo de inferencia.
- Investigación en operadores neuronales: el repositorio permite comparar de forma controlada backbone GINO crudo, híbrido con corrección y MLP de coordenadas bajo los mismos splits y las mismas semillas, útil para estudiar el efecto de datos escasos en operadores geométricos.
- Benchmark de referencia para nuevos métodos: con conjuntos de validación y test fijos, el checkpoint sirve como baseline reproducible en elasticidad 3D para trabajos que propongan alternativas a GINO, FNO o DeepONet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para tareas de NLP (MMLU, HumanEval, GSM8K, etc.), ya que no es un modelo de lenguaje. Los únicos datos de rendimiento publicados son los del propio dominio:

Resultados sobre 32 geometrías nuevas, con el checkpoint de 128 geometrías:

| Métrica | Error medio |
|---|---|
| Error de desplazamiento superficial | 3,08 % |
| Error de deflexión del asiento superior | 0,80 % |

Curvas de aprendizaje publicadas (error de campo, media de tres semillas de entrenamiento):

| Geometrías de entrenamiento | GINO (backbone crudo) | GINO + corrección | MLP de coordenadas |
|---:|---:|---:|---:|
| 32 | 30,74 % | 7,99 % | 6,44 % |
| 64 | 30,05 % | 5,49 % | 4,05 % |
| 128 | 24,86 % | 3,27 % | 2,85 % |

El autor advierte que estas cifras son resultados del modelo híbrido y no de la precisión de GINO en bruto. Las métricas completas, los registros por caso y la variación entre semillas están en `evaluation.json` y `learning_curve.csv`.

## Requisitos de hardware

- No se documenta VRAM estimada para inferencia, ni número de parámetros, ni precisión numérica de los pesos.
- El tamaño del repositorio reportado por los metadatos de HuggingFace es de 0,0 GB; este dato no permite estimar de forma fiable el consumo de memoria.
- La inferencia se realiza en PyTorch mediante `inference.py`, tras instalar las dependencias con `pip install -r requirements.txt`; no requiere instalación de elementos finitos.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) ni si el modelo cabe en GPU de consumo.
- Al tratarse de un checkpoint pequeño de PyTorch, la ejecución en CPU es plausible, pero no está confirmada por el autor y debe verificarse empíricamente.
- Opciones de despliegue: ejecución local con PyTorch. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- No se publican datos de latencia ni de throughput.
- Existe un Space interactivo (`AgentFEM-GINO-Structural-Design-Lab`), pero el autor aclara que es una demo ligera con candidatos grabados, no este checkpoint ejecutándose en un endpoint de inferencia de HuggingFace.

## Comparativa con modelos similares

Dentro del propio repositorio se pueden comparar tres variantes bajo los mismos splits y semillas:

| Variante | Error de campo (32 geom.) | Error de campo (64 geom.) | Error de campo (128 geom.) | Naturaleza |
|---|---:|---:|---:|---|
| GINO crudo (`kind="gino"`) | 30,74 % | 30,05 % | 24,86 % | Backbone de operador neuronal |
| GINO + corrección residual (por defecto) | 7,99 % | 5,49 % | 3,27 % | Modelo híbrido publicado |
| MLP de coordenadas (`kind="mlp_only"`) | 6,44 % | 4,05 % | 2,85 % | Baseline independiente |

No se dispone de resultados comparables publicados para alternativas como FNO, DeepONet u otros operadores neuronales aplicados a esta misma familia de soportes, ni de comparaciones con modelos de tamaño o categoría equivalente en la información disponible.

## Limitaciones y advertencias

- Ámbito geométrico cerrado: solo cubre una familia fija de soportes de doble brazo simétricos con caras inferiores de apoyo fijas, dentro de los rangos `depth` 0,015–0,032 m, `radius` 0,010–0,023 m, `waist` 0,04–0,38 y `bow` 0,005–0,030 m. Fuera de ese ámbito la predicción no es válida.
- Material y carga fijos: E = 70 GPa, nu = 0,33 y carga uniforme descendente sobre el asiento. Otros materiales, topologías, condiciones de contacto o respuestas no lineales requieren otro modelo.
- La salida es un campo de desplazamiento superficial, no tensiones ni un certificado de resistencia. No debe usarse para validar seguridad estructural.
- Riesgo de error no despreciable: incluso el modelo híbrido con 128 geometrías presenta un 3,08 % de error medio de desplazamiento superficial en geometrías nuevas, y el backbone GINO crudo supera el 24 % de error de campo.
- El MLP de coordenadas supera al modelo híbrido en las tres curvas de aprendizaje publicadas, lo que sugiere que la ventaja del operador neuronal no está demostrada en este régimen de datos tan escaso.
- La elección de la semilla 2026 se hizo con el error de validación, no con el de test; esto es práctica correcta, pero implica que las cifras de test dependen de esa selección.
- No hay indicios de sesgos sociales, ya que el modelo no procesa lenguaje ni datos personales; el sesgo relevante es de cobertura geométrica y de distribución de datos.
- Licencia Apache-2.0 para código y pesos, lo que permite uso comercial; el dataset asociado se distribuye bajo CC BY 4.0 y exige atribución.
- El Space publicado es una demo con resultados grabados, no una instancia del checkpoint en producción; no debe tomarse como referencia de rendimiento en vivo.
- Advertencia de producción: conviene validar cualquier predicción crítica con el solver FEM antes de tomar decisiones de diseño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HaomingLuo/AgentFEM-GINO-Bracket-128
- Dataset: https://huggingface.co/datasets/HaomingLuo/AgentFEM-Bracket-Elasticity
- Demo interactiva: https://huggingface.co/spaces/HaomingLuo/AgentFEM-GINO-Structural-Design-Lab
- Repositorio de integración de entrenamiento: https://github.com/haoming-luo/agentfem-learning
- Solver y generación de datos FEM: https://github.com/haoming-luo/agentfem
- Paper de GINO (Li et al., Geometry-Informed Neural Operator for Large-Scale 3D PDEs): https://arxiv.org/abs/2309.00583
- Implementación del backbone: https://github.com/neuraloperator/neuraloperator

Nota: la búsqueda web asociada a esta ficha devolvió únicamente resultados genéricos sobre programación de robótica, sin relación con el modelo, por lo que no se han incluido.
