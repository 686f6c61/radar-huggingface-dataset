# OneScience-Group/FuXi-DA

## Resumen

FuXi-DA es un marco de asimilacion de datos atmosfericos basado en aprendizaje profundo, desarrollado por equipos del Shanghai Artificial Intelligence Laboratory, la Universidad de Fudan e instituciones colaboradoras. Su funcion es fusionar campos de fondo meteorologicos (background fields) con observaciones satelitales para generar analisis atmosfericos globales mejorados, que despues sirven como inicializacion de modelos de prediccion numerica y de modelos de prediccion basados en deep learning. El modelo aprende de forma conjunta los errores de fondo, los sesgos de observacion y los incrementos de analisis dentro de un mismo espacio de caracteristicas.

Tecnicamente, FuXi-DA emplea una U-Net multirrama con codificadores separados para fondo, observacion y condicion, y una etapa de fusion multiescala. Trabaja sobre campos de fondo de 70 variables y observaciones multitemporales del radiametro AGRI a bordo del satelite geoestacionario Fengyun-4B (8 tiempos, 15 canales de observacion, relacion temporal de 6 horas), con correccion de fondo global a 0.25 grados de resolucion. El entrenamiento usa ERA5, campos de fondo de FuXi y observaciones AGRI reales en el articulo, y supervisa la asimilacion con los errores de prediccion de un FuXi congelado.

Su relevancia actual radica en que propone una alternativa generalizada a la asimilacion variacional clasica (4D-Var, EnVar) para observaciones satelitales geoestacionarias, un terreno donde los metodos tradicionales tienen coste computacional elevado. Conviene advertir desde el principio que el repositorio de HuggingFace no incluye pesos oficiales: el articulo no publica checkpoints cargables y el codigo distribuido esta orientado a validacion de ingenieria con un conjunto de datos sintetico de muestra reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net multirrama con codificadores de fondo, observacion y condicion, y fusion de caracteristicas multiescala |
| Parametros totales | no disponible (no se publica recuento de parametros ni pesos oficiales) |
| Longitud de contexto | no aplica (modelo geoespacial de asimilacion de datos, no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (dominio geoespacial); documentacion en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de PyTorch (`result/checkpoints/fuxi_da.pt`); no se incluyen pesos oficiales en el repositorio |
| Framework | PyTorch |
| Resolucion espacial | 0.25 grados (correccion de fondo global) |
| Canales de fondo | 70 variables |
| Observaciones | AGRI de Fengyun-4B: 8 tiempos, 15 canales, relacion de 6 horas |
| Protocolo de fondo real | `[70, 721, 1440]` |
| Protocolo de observacion real | `[8, 15, 640, 640]` |

## Arquitectura y entrenamiento

La arquitectura es una U-Net de multiples ramas. Tres codificadores independientes procesan el campo de fondo, las observaciones satelitales y las variables de condicion; sus representaciones se combinan mediante un modulo de fusion multiescala que genera un incremento de analisis. Ese incremento se suma al fondo para producir el analisis final. El diseno permite aprender simultaneamente errores de fondo, sesgos instrumentales de las observaciones y la estructura espacial del incremento, en lugar de modelar cada termino por separado como hacen los esquemas variacionales clasicos.

Los datos de entrenamiento del articulo combinan ERA5, campos de fondo generados por FuXi y observaciones AGRI de Fengyun-4B. La supervision combina una perdida L1 de analisis ponderada por latitud con supervision multi-lead procedente de un proxy de prediccion (FuXi) congelado: el analisis generado se evalua por su efecto sobre predicciones a varios plazos, de modo que la asimilacion se optimiza para mejorar la prediccion posterior y no solo para reducir el error instantaneo. El articulo reporta 6.000 iteraciones de entrenamiento y diez plazos de prediccion supervisados. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable dado que no es un modelo generativo de lenguaje.

Es importante subrayar que el repositorio publico no reproduce ese entrenamiento: el script `scripts/fake_data.py` genera un conjunto sintetico con campos de coordenada completa y unas pocas teselas alineadas en coordenadas originales, que preservan variables, canales y especificaciones espaciotemporales pero reducen el numero de muestras y la cobertura. El entrenamiento por defecto tambien reduce cobertura de teselas, anchura de red, iteraciones y pasos de prediccion. Estos datos validan exclusivamente el pipeline de ingenieria y no representan las distribuciones ni la escala de ERA5 o AGRI.

## Capacidades

- Asimilacion de observaciones satelitales: fusiona campos de fondo de 70 canales con temperaturas de brillo multitemporales de AGRI.
- Correccion de fondo global: produce incrementos de analisis sobre una malla global de 0.25 grados.
- Fusion multimodal: integra las ramas de fondo, observacion y condicion y permite estudiar interacciones multiescala entre ellas.
- Inicializacion de prediccion: genera analisis utilizables como estado inicial de modelos de prediccion, con supervision directa sobre el error a multiples plazos.
- Evaluacion integrada: calcula RMSE ponderado por latitud para fondo bruto, linea base de correccion y analisis FuXi-DA, agrupado por variables Z, T, U, V, R y variables de superficie.
- Localizacion del incremento: analiza la extension espacial del incremento de analisis ante una perturbacion de una sola observacion.
- Entrenamiento distribuido: soporte de entrenamiento multi-GPU y multi-nodo mediante `torchrun` (ejemplo con 8 procesos).
- Generacion de texto: no aplica.
- Tool calling / function calling: no disponible; no es una capacidad de este modelo.
- Agentes y razonamiento multi-paso en lenguaje: no aplica.
- Capacidades multilingues: no aplica (modelo geoespacial).
- Modo thinking, vision o audio: no aplica en el sentido de modelos multimodales generativos; su multimodalidad se refiere a la fusion de fuentes de datos meteorologicos.

## Casos de uso

- Asimilacion operativa de satelites geoestacionarios: introducir temperaturas de brillo de AGRI (15 canales, 8 tiempos) en el analisis atmosferico para mejorar la representacion de la atmosfera en regiones con cobertura convencional escasa, aprovechando que el modelo aprende el sesgo de observacion en lugar de requerir una correccion estadistica previa.
- Inicializacion de modelos de prediccion basados en deep learning: usar el analisis resultante como estado inicial de FuXi u otro modelo de prediccion, ya que el entrenamiento esta supervisado precisamente por el error de prediccion multi-lead del proxy congelado.
- Correccion de campos de fondo a escala global: aplicar la rama de correccion sobre mallas de 0.25 grados para rebajar el error del fondo antes de lanzar la prediccion, con una ganancia medible mediante RMSE ponderado por latitud frente a una linea base de correccion.
- Investigacion en asimilacion de datos: banco de pruebas para comparar esquemas de asimilacion (fondo bruto, correccion simple y analisis neuronal) bajo protocolos identicos y con agrupacion de errores por familia de variable.
- Validacion y desarrollo en entornos con recursos limitados: la configuracion por defecto con datos sinteticos permite verificar conectividad, entrenamiento, inferencia y metricas en CPU, y escalar despues a GPU o DCU.
- Formacion y docencia en AI4S: el repositorio incluye scripts separados de generacion de datos, entrenamiento, inferencia, evaluacion y visualizacion, lo que facilita usar FuXi-DA como ejemplo completo de ciclo de vida de un modelo cientifico.
- Integracion en plataformas de ciencia con agentes de codigo: la model card menciona la ejecucion mediante OneCode y ModelScope para validar datos, entrenamiento, inferencia, metricas y visualizacion en un unico flujo.
- Analisis de sensibilidad de redes de observacion: la evaluacion de localizacion del incremento ante una unica observacion perturbada permite estudiar que peso relativo tiene cada observacion en el analisis final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y el material consultado describen el protocolo de evaluacion (RMSE ponderado por latitud para fondo bruto, linea base de correccion y analisis FuXi-DA, con grupos de variables Z, T, U, V, R y superficie, y errores por paso de prediccion), pero no incluyen cifras numericas. Los resultados del articulo original no estan disponibles en la informacion proporcionada, y la model card advierte explicitamente que los resultados sobre teselas sinteticas validan unicamente la ingenieria y no representan el rendimiento global descrito en el paper. Por tanto, no se presentan tablas comparativas de MMLU, HumanEval, GSM8K ni metricas equivalentes, que ademas no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La informacion proporcionada no incluye recuento de parametros ni consumo de memoria.
- GPU recomendadas: no disponible. La model card solo indica que se recomienda GPU o DCU.
- DCU: requiere DTK instalado previamente, version 25.04.2 o posterior, o la version recomendada por OneScience para el cluster en uso.
- Uso en CPU: soportado para validacion de conectividad con la configuracion de muestra pequena por defecto; no se indica como opcion para entrenamiento real.
- Entrenamiento distribuido: soporte verificado mediante `torchrun` con 8 procesos por nodo (`--nproc_per_node=8 --nnodes=1`).
- Opciones de despliegue: paquete `onescience[earth-gpu]` o `onescience[earth-dcu]` sobre Python 3.11 y PyTorch; scripts `train.py`, `inference.py` y `result.py`. No aplican servidores de inferencia de modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion disponible no incluye especificaciones comparativas de otros sistemas. La tabla siguiente recoge la comparacion cualitativa que puede extraerse del material proporcionado; los campos no documentados se marcan como no disponibles.

| Sistema | Categoria | Parametros | Contexto o resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FuXi-DA | Asimilacion de datos con deep learning | no disponible | 0.25 grados, fondo de 70 canales, AGRI 15 canales / 8 tiempos | Apache 2.0 | Codigo y pipeline publicos; sin pesos oficiales |
| FuXi | Prediccion meteorologica con deep learning | no disponible | no disponible | no disponible | Referenciado en la model card como modelo de prediccion congelado usado para supervisar FuXi-DA |
| Esquemas variacionales clasicos (tipo 4D-Var / EnVar) | Asimilacion de datos numerica | no aplica | no disponible | depende de la implementacion | Ampliamente desplegados en centros operativos; no se aportan datos comparativos en la informacion disponible |

No se dispone de cifras de rendimiento, parametros ni contexto de modelos alternativos en el material consultado, por lo que cualquier comparacion cuantitativa seria especulativa.

## Limitaciones y advertencias

- Ausencia de pesos oficiales: la model card afirma que el articulo no proporciona pesos cargables directamente y que no hay ningun checkpoint incluido en `weight/`. Cualquier uso practico exige entrenar desde cero.
- Datos sinteticos: el repositorio distribuido emplea un conjunto sintetico generado por procedimiento con cobertura reducida. No representa las distribuciones ni la escala reales de ERA5 o de AGRI, y sus resultados solo validan el pipeline de ingenieria.
- Sin resultados de benchmarks verificables: no hay cifras publicadas en la informacion disponible, y la propia model card advierte que los resultados sinteticos no reflejan el rendimiento global del articulo.
- Alcance restringido del dominio: el diseno se centra en asimilacion de observaciones geoestacionarias AGRI y en correccion de fondo a 0.25 grados. No se documenta su comportamiento con otras constelaciones, sensores de sondeo vertical u observaciones in situ.
- Cobertura incompleta: la inferencia conserva metadatos de coordenadas y cobertura e indica explicitamente cobertura global incompleta en la configuracion de muestra.
- Dependencia del proxy congelado: la supervision depende de los errores de prediccion de un FuXi congelado, de modo que los sesgos de ese modelo pueden transferirse al analisis.
- Riesgo de sobreajuste a la configuracion reducida: la configuracion por defecto disminuye cobertura de teselas, anchura de red, iteraciones y pasos de prediccion, lo que puede dar una falsa sensacion de funcionamiento si se interpretan sus metricas como rendimiento real.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; cabe esperar los propios de los datos de reanalisis y del instrumento AGRI, pero no se aportan evidencias en el material consultado.
- Alucinacion en el sentido generativo: no aplica, ya que el modelo no genera texto libre; el riesgo equivalente es producir incrementos de analisis fisicamente inconsistentes, no cuantificado en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y atribucion, y de indicar los cambios realizados. La licencia no cubre los datos de ERA5, FuXi o AGRI, cuyos terminos de uso son independientes.
- Dependencia de infraestructura: en DCU es necesario instalar DTK antes de usar el paquete; el canal de distribucion es un indice PyPI propio de OneScience, no PyPI estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OneScience-Group/FuXi-DA
- Articulo: FuXi-DA: a generalized deep learning data assimilation framework for assimilating satellite observations: https://doi.org/10.1038/s41612-025-01039-3
- Repositorio principal en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio de skills en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio principal en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio de skills en Gitee: https://gitee.com/onescience-ai/oneskills
- Entorno OneCode para programacion AI4S: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home

Nota sobre la busqueda web: los resultados obtenidos no contienen documentacion adicional sobre FuXi-DA. La mayoria corresponden a proyectos sin relacion (repositorios de prompts, sitios de preguntas y respuestas, herramientas de asistencia de codigo y un documento juridico). Unicamente se ha localizado una referencia tangencial del mismo dominio, un trabajo sobre asimilacion de datos y prediccion numerica del tiempo, que no forma parte de la documentacion oficial del modelo: https://arxiv.org/html/2605.01599
