# OneScience-Group/NNCAM

## Resumen

NNCAM es un modelo de aprendizaje profundo para la parametrización de procesos subgrid en modelos climáticos. Predice tendencias físicas y flujos (calentamiento, humectación, radiación y precipitación) a partir de estados de columna atmosférica. Lo publica el grupo OneScience en HuggingFace como una reproducción de ingeniería independiente del método descrito en el artículo «Deep learning to represent subgrid processes in climate models» (Rasp, Pritchard y Gentine, GMD 2018), firmado por equipos de la Ludwig Maximilian University of Munich, la University of California Irvine y Columbia University.

No es un modelo de lenguaje: es un perceptrón multicapa totalmente conectado que mapea una entrada de 94 dimensiones (temperatura, humedad, viento y forzamiento de superficie sobre 30 niveles verticales) a 65 salidas (calentamiento, humectación, cuatro flujos radiativos y precipitación). El artículo entrena con aproximadamente 140 millones de muestras de columna atmosférica procedentes de un año de simulación SPCAM en configuración aquaplanet, con paso temporal de 30 minutos.

Su relevancia actual es metodológica: sustituir parametrizaciones físicas de convección, nubes y radiación por un emulador neuronal es una de las líneas activas en modelos climáticos híbridos, porque reduce el coste computacional del componente subgrid. Es importante señalar que este repositorio concreto no incluye pesos oficiales entrenados ni datos reales de SPCAM: incorpora un conjunto sintético estructurado y una configuración reducida (cuatro capas de 32 nodos frente a las nueve capas de 256 nodos del artículo) destinada únicamente a validación de ingeniería.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado, PyTorch |
| Parametros totales | no disponible (no se publica el recuento en la model card) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje). Entrada de 94 dimensiones por columna atmosférica; protocolo vertical de 30 niveles |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, para documentación y repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (`result/checkpoints/nncam.pt`, `nncam.pt`); no se distribuyen pesos oficiales en `weight/` |
| Dimensión de entrada | 94 (temperatura, humedad, viento y forzamiento de superficie) |
| Dimensión de salida | 65 (calentamiento, humectación, 4 flujos radiativos, precipitación) |
| Framework | PyTorch (framework declarado en la model card) |
| Capas ocultas (artículo) | 9 capas de 256 nodos |
| Capas ocultas (configuración por defecto del repo) | 4 capas de 32 nodos |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa denso sin componentes de atención ni recurrencia. El artículo de referencia emplea nueve capas ocultas de 256 nodos; la configuración por defecto del repositorio reduce esa profundidad a cuatro capas de 32 nodos y acorta el entrenamiento, pero mantiene invariantes las dimensiones del problema: 94 entradas, 65 salidas y el protocolo de 30 niveles verticales. El repositorio no detalla funciones de activación, normalización ni esquema de optimizador, por lo que esos datos figuran como no disponibles.

En cuanto a datos, el artículo entrena con aproximadamente 140 millones de muestras de columna atmosférica extraídas de un año de simulación SPCAM aquaplanet con paso temporal de 30 minutos. Los objetivos son tendencias físicas y flujos: calentamiento, humectación, cuatro componentes de flujo radiativo y precipitación. No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de regresión científica. Tampoco se describe decodificación especulativa ni mecanismos de atención lineal, que no aplican a este tipo de red. Las innovaciones destacables son de dominio: emular el componente subgrid completo (convección, nubes y radiación) desde el estado de columna, y la propia reproducción de ingeniería con scripts separados de generación de datos sintéticos, entrenamiento, inferencia y evaluación.

## Capacidades

- Predicción de tendencias físicas subgrid: calentamiento y humectación por nivel vertical a partir del estado de columna atmosférica.
- Predicción de flujos radiativos: cuatro componentes de radiación como salida del modelo.
- Predicción de precipitación: una de las 65 salidas del cabezal de regresión.
- Parametrización data-driven: sustitución o emulación del esquema físico de convección, nubes y radiación dentro de un modelo climático.
- Diagnóstico de columnas atmosféricas: validación de relaciones entre calentamiento, humectación, radiación y precipitación sobre 30 niveles.
- Entrenamiento distribuido: soporte de `torchrun` con 8 procesos por nodo (`--nproc_per_node=8`) para el flujo de checkpoints.
- Ejecución en entornos ModelScope/OneCode: validación de datos estructurados, entrenamiento, métricas de parametrización y visualización.
- Evaluación integrada: cálculo de RMSE agrupado y R², más gráficas comparativas de error agrupado y de predicción de precipitación.
- Inferencia sobre datos sintéticos estructurados: validación de conectividad y de conservación sin necesidad de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de lenguaje.

## Casos de uso

- Parametrización de procesos subgrid en modelos climáticos: el modelo recibe temperatura, humedad, viento y forzamiento de superficie y devuelve tendencias físicas y flujos, lo que permite emular el componente de convección, nubes y radiación a una fracción del coste del esquema físico.
- Diagnóstico atmosférico por niveles: con el protocolo de 30 niveles verticales, se pueden auditar relaciones entre calentamiento, humectación y radiación columna a columna para detectar inconsistencias en simulaciones.
- Validación de conservación energética: los scripts de evaluación permiten comprobar que las tendencias y flujos predichos mantienen presupuestos físicos razonables antes de integrar el emulador en un modelo acoplado.
- Investigación en emuladores neuronales: sirve como base reproducible para comparar arquitecturas MLP frente a alternativas (random forests, CNN, arquitecturas con memoria) sobre el mismo protocolo de entrada y salida.
- Desarrollo y depuración de pipelines AI4S: el conjunto sintético estructurado permite validar el flujo completo de datos, entrenamiento, inferencia y visualización en pocos minutos, sin depender de datos reales de SPCAM.
- Pruebas de escalado distribuido: el flujo con `torchrun` y 8 procesos sirve para verificar el guardado y carga de checkpoints y la sincronización en clústeres GPU o DCU.
- Validación en hardware nacional (DCU): el repositorio documenta explícitamente el entorno DCU con DTK 25.04.2 o superior, útil para equipos que trabajan sobre aceleradores no NVIDIA.
- Formación y docencia: al ser un modelo pequeño y con datos sintéticos, es adecuado para prácticas sobre parametrizaciones neuronales y métricas agrupadas de regresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el repositorio usa un conjunto sintético estructurado para validación de ingeniería y que sus resultados «no representan la distribución real de SPCAM, la escala de entrenamiento ni el rendimiento del artículo». El script `scripts/result.py` calcula RMSE agrupado y R² y genera `result/evaluation/metrics.json` y `result/evaluation/comparison.png`, pero los valores concretos no se facilitan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. La configuración por defecto (cuatro capas de 32 nodos) es un MLP de tamaño muy reducido, por lo que la huella de memoria es mínima; el artículo con nueve capas de 256 nodos sigue siendo igualmente ligero en comparación con modelos generativos.
- GPU recomendadas: no se especifica un modelo concreto. El repositorio recomienda disponer de GPU o DCU; no menciona A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no se indica explícitamente. Dado el tamaño de la red por defecto, es razonable esperar que quepa en cualquier GPU de consumo moderna, pero este dato no está confirmado en la model card.
- Ejecución en CPU: soportada para validación de conectividad con la configuración de muestra pequeña por defecto.
- Hardware DCU: requiere DTK 25.04.2 o superior, o la versión recomendada por OneScience para el clúster en uso.
- Despliegue: no se documentan opciones tipo vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo. El despliegue se realiza mediante scripts propios: `scripts/fake_data.py`, `scripts/train.py`, `scripts/inference.py` y `scripts/result.py`.
- Entrenamiento distribuido: `torchrun --nproc_per_node=8 --nnodes=1 --rdzv_id=1000 --rdzv_backend=c10d --master_addr="localhost" --master_port=29500 scripts/train.py`.
- Latencia y throughput: no disponibles.
- Dependencias: Python 3.11, entorno conda `onescience311`, paquete `onescience[earth-gpu]` o `onescience[earth-dcu]` desde el índice `mirrors.onescience.ai`.

## Comparativa con modelos similares

No se dispone de datos numéricos comparativos en la información proporcionada (ni parámetros, ni métricas, ni consumo). La comparación se limita a aspectos cualitativos:

| Modelo | Categoria | Parametros | Contexto / E-S | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NNCAM (este repositorio) | MLP para parametrización subgrid | no disponible | 94 entradas / 65 salidas, 30 niveles | Apache 2.0 | Código y pipeline en HuggingFace; sin pesos oficiales |
| NNCAM del artículo (Rasp et al., 2018) | MLP, 9 capas de 256 nodos | no disponible | 94 entradas / 65 salidas, 30 niveles | no disponible | Publicación científica; sin pesos publicados según la model card |
| Random forest / baseline del artículo | Modelo de regresión alternativo | no disponible | mismo protocolo E/S | no disponible | no disponible |
| Otras parametrizaciones neuronales de la literatura | MLP, CNN o arquitecturas con memoria | no disponible | variable | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier uso conversacional es un error de categoría.
- Ausencia de pesos oficiales: la model card indica que el artículo no proporciona pesos cargables y que este repositorio no incluye ninguno en `weight/`. El checkpoint local (`result/checkpoints/nncam.pt`) no debe presentarse como un peso preentrenado oficial.
- Datos sintéticos: el repositorio usa un conjunto sintético estructurado que no reproduce la distribución real de SPCAM, ni la escala de entrenamiento, ni el rendimiento del artículo. Los resultados de los scripts de evaluación validan la ingeniería, no la física.
- Configuración reducida: la red por defecto (cuatro capas de 32 nodos) es mucho menor que la del artículo (nueve capas de 256 nodos), por lo que la capacidad de representación es limitada.
- Reproducción independiente: el repositorio se declara reproducción de ingeniería de especificaciones públicas; no es una publicación oficial de los autores del artículo.
- Riesgo de extrapolación: al ser un emulador entrenado sobre un régimen concreto (aquaplanet, un año de simulación), su comportamiento fuera de la distribución de entrenamiento no está caracterizado en la información disponible.
- Idiomas: la documentación está en inglés; no se declaran capacidades multilingües, algo irrelevante para un modelo numérico pero relevante si se integra en documentación o interfaces de usuario.
- Licencia: el código y los metadatos del repositorio son Apache 2.0, pero la model card advierte que el uso del código, los pesos oficiales y los datos de este repositorio sigue sujeto a las licencias y términos de sus proyectos respectivos. Conviene verificar la licencia del dataset SPCAM antes de un uso comercial o de redistribución.
- Ausencia de métricas publicadas: no hay cifras de RMSE, R² ni comparaciones cuantitativas en la información disponible, por lo que no es posible avalar afirmaciones de precisión.
- Fecha de creación del repositorio inusual (2026-09-11) y contadores de descargas y likes a cero: la adopción y el mantenimiento son desconocidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/NNCAM
- Artículo de referencia (GMD): https://gmd.copernicus.org/articles/11/3999/2018/
- Entorno OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
- Índice de paquetes: http://mirrors.onescience.ai:3141/pypi/simple/
