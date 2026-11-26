# LUHAI/FirePFN

## Resumen

FirePFN es un modelo fundacional para clasificacion tabular basado en aprendizaje en contexto (in-context learning). Lo desarrolla el grupo LUH-AI (Leibniz University Hannover) y se apoya en el encoder tabular preentrenado Kumo-Tabular de NVIDIA, que permanece congelado. El modelo recibe una tabla de entrenamiento ya etiquetada y predice las filas de test en un unico forward pass, sin entrenamiento ni ajuste de hiperparametros por dataset. Su coste crece de forma lineal con el numero de filas de contexto, lo que le permite manejar tablas de millones de filas en una sola GPU.

La arquitectura combina el encoder de filas de Kumo-Tabular con un backbone de 6 bloques que mezcla SSM bidireccional Mamba-3, gated linear attention y Gated DeltaNet, en el patron `ssm, ssm, attn, ssm, deltanet, attn`. La prediccion se realiza mediante cross-attention con temperatura dependiente de la longitud del contexto y un decodificador que emite probabilidades de clase. El checkpoint tiene 55,7 M de parametros (10,0 M corresponden al encoder congelado) y esta entrenado exclusivamente con tablas sinteticas generadas con el prior `graph_scm` de TabICLv2.

Es relevante porque propone una alternativa a los metodos clasicos de AutoML y a los gradient-boosted trees para clasificacion tabular: un unico modelo preentrenado que generaliza a nuevos datasets sin reentrenamiento, con soporte para contextos de hasta 32.768 filas durante el entrenamiento y hasta 100.000 filas en el protocolo de evaluacion por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tabular Kumo-Tabular (congelado) + backbone hibrido de 6 bloques (Mamba-3 SSM bidireccional, gated linear attention, Gated DeltaNet, atencion) + cross-attention y decodificador |
| Parametros totales | 55,7 M (10,0 M del encoder Kumo-Tabular congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 filas en entrenamiento; hasta 100.000 filas en el protocolo de evaluacion por defecto (`max_context_rows=None` usa todas las filas) |
| Tipos de cuantizacion | no disponible (pesos en float32; inferencia en bf16) |
| Idiomas soportados | no disponible (modelo tabular, no linguistico) |
| Licencia | BSD-3-Clause para los parametros FirePFN y OpenMDW-1.1 para el encoder Kumo-Tabular |
| Formato de pesos | checkpoint PyTorch `fire-pfn.ckpt` (223 MB, float32), cargable con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

El modelo se compone de tres piezas. Primero, un encoder de filas basado en Kumo-Tabular (variante large classifier, revision `v1.0.1` de NVIDIA), que se mantiene congelado y transforma cada fila en una representacion. Segundo, un backbone de 6 bloques que mezcla las filas de contexto siguiendo el patron `ssm, ssm, attn, ssm, deltanet, attn`, combinando SSM bidireccional Mamba-3, gated linear attention y Gated DeltaNet. Tercero, un mecanismo de prediccion en el que las filas de test leen el contexto mediante cross-attention con una temperatura dependiente de la longitud del contexto, y un decodificador produce las probabilidades de clase.

El entrenamiento se realizo en dos etapas: una primera desde cero durante 1000 epocas y una segunda con longitudes de contexto de hasta 32.768 filas, ejecutada como tres ciclos cosenoidales de 250 epocas cada uno, donde cada ciclo continua desde el modelo final del anterior. El checkpoint publicado es el modelo final del tercer ciclo. Los datos de entrenamiento son exclusivamente tablas sinteticas generadas con el prior `graph_scm` de TabICLv2; no se usaron datos reales. La innovacion principal es el mecanismo de codificacion en contexto rapido que da nombre al modelo, orientado a escalar PFNs a contextos de decenas de miles de filas con coste lineal.

## Capacidades

- Clasificacion tabular mediante in-context learning: recibe `X_train`, `y_train` y `X_test` y devuelve probabilidades por clase en un unico forward pass.
- Clasificacion directa de hasta 10 clases; para mas clases emplea error-correcting output codes.
- Manejo de valores faltantes (NaN) en las features numericas.
- Soporte de features numericas como arrays de NumPy o DataFrames de pandas.
- Soporte de columnas categoricas y de texto mediante el wrapper `make_dataframe_classifier`: columnas con mas de 500 valores distintos se codifican por target encoding (excepto fechas y identificadores de entidad) y el resto por ordinal encoding.
- Seleccion automatica de features por ANOVA F-score (hasta 200 features por defecto).
- Submuestreo estratificado del contexto para conjuntos de entrenamiento grandes (100.000 filas por defecto).
- Capacidad de ensembling configurable (un miembro por defecto).
- No soporta regresion, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Clasificacion de riesgo crediticio: con un historial etiquetado de clientes, el modelo predice la probabilidad de impago de nuevas solicitudes en un solo forward pass, sin reentrenar por cada campana ni ajustar hiperparametros.
- Deteccion de fraude transaccional: al crecer el coste de forma lineal con las filas de contexto, puede usar cientos de miles de transacciones historicas etiquetadas como contexto y puntuar transacciones nuevas con latencia de una sola pasada.
- Scoring de leads y propension de compra en marketing: se alimenta la tabla de clientes historicos con su etiqueta de conversion y se predicen las probabilidades para la base nueva, integrable en pipelines de batch.
- Triaje clinico sobre datos tabulares: clasificacion de pacientes a partir de variables numericas y categoricas (con NaN permitidos), util como linea base rapida antes de modelos especificos.
- Mantenimiento predictivo con sensores: clasificacion de estado de equipos a partir de lecturas tabulares, aprovechando la ventana de contexto de decenas de miles de filas para incluir historicos amplios.
- Benchmarking y evaluacion de modelos tabulares: sirve como referencia PFN en entornos como TabArena, TALENT, BeyondArena o RamanBench, con codigo de evaluacion publicado en el repositorio.
- Prototipado rapido en ciencia de datos: dado un dataset tabular nuevo, obtener una linea base de clasificacion sin entrenamiento ni busqueda de hiperparametros, como paso previo a modelos mas costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el repositorio de GitHub contiene los resultados por split de este checkpoint y 12 lineas base en TabArena, TALENT, BeyondArena y RamanBench, ademas de los scripts que generan las tablas y figuras del paper, pero no se incluyen cifras concretas en la informacion proporcionada.

## Requisitos de hardware

- GPU CUDA obligatoria: el backbone usa kernels de Triton y el modelo no funciona en CPU.
- VRAM estimada: no disponible de forma explicita; el checkpoint ocupa 223 MB en float32 y la inferencia se ejecuta en bf16, por lo que el peso de los parametros es reducido y el consumo dominante proviene de las activaciones del contexto (hasta 100.000 filas por defecto).
- GPU recomendadas: no disponible; cualquier GPU NVIDIA con soporte CUDA y kernels Mamba-3 compatibles deberia poder ejecutarlo, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: paquete Python `firepfn` instalable desde GitHub (`pip install git+https://github.com/LUH-AI/FirePFN`), con dependencias `torch >= 2.9.1` (build CUDA) y `mamba-ssm >= 2.3.2` con los kernels de Mamba-3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FirePFN | 55,7 M | hasta 32.768 filas en entrenamiento; 100.000 por defecto en evaluacion | PFN con encoder Kumo-Tabular congelado y backbone hibrido SSM/atencion | BSD-3-Clause + OpenMDW-1.1 | Hugging Face y GitHub |
| Kumo-Tabular (NVIDIA) | no disponible | no disponible | Encoder tabular preentrenado; usado como componente congelado en FirePFN | OpenMDW-1.1 | Hugging Face (nvidia/Kumo-Tabular) |
| TabICLv2 | no disponible | no disponible | PFN tabular; su prior `graph_scm` se usa para generar los datos sinteticos de FirePFN | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo clasificacion: no existe cabeza de regresion.
- Requiere GPU CUDA; no se ejecuta en CPU.
- Diferencias pequenas entre ejecuciones: las probabilidades pueden variar hasta aproximadamente 1e-2 entre procesos, porque los kernels de Triton eligen su configuracion por medicion de tiempos y el redondeo en bf16 difiere. Dentro de un mismo proceso los resultados son deterministas.
- Entrenado exclusivamente con datos sinteticos: deben validarse las predicciones sobre datos propios antes de confiar en ellas, especialmente en entornos de alto riesgo.
- Licencia mixta: los parametros FirePFN son BSD-3-Clause, pero el encoder Kumo-Tabular esta bajo OpenMDW-1.1; si se redistribuyen los pesos hay que conservar el texto de esa licencia y el aviso de copyright de NVIDIA.
- Limites practicos del protocolo por defecto: 200 features (por ANOVA F-score) y 100.000 filas de contexto (submuestreo estratificado), lo que puede descartar informacion en datasets muy anchos o muy grandes si no se ajustan los parametros.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo tabular, el riesgo principal es la calibracion de probabilidades fuera de la distribucion de entrenamiento sintetica.
- Idiomas: no aplica, al no ser un modelo linguistico.

## Enlaces

- Hugging Face: https://huggingface.co/LUHAI/FirePFN
- Codigo: https://github.com/LUH-AI/FirePFN
- Paper: https://arxiv.org (enlace generico en la model card, sin identificador concreto)
- Modelo base: https://huggingface.co/nvidia/Kumo-Tabular
