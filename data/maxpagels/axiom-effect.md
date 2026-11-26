# maxpagels/axiom-effect

## Resumen

Axiom Effect es un modelo de inferencia causal para datos tabulares desarrollado por Max Pagels. Su funcion es estimar el efecto causal de un tratamiento sobre una variable de resultado a partir de una tabla: calcula el efecto medio (ATE), el efecto sobre los tratados (ATT) y sobre los controles (ATC) para tratamientos binarios, y el efecto entre dos valores, la curva dosis-respuesta y el efecto por fila (CATE) para tratamientos continuos, todo con intervalos del 90% y del 50%.

El modelo emplea la red de CausalPFN (Balazadeh et al. 2025, arXiv:2506.07918), que a su vez deriva de TabDPT, y se entrena partiendo de los pesos de CausalPFN, extendidos a tratamientos continuos y a grafos causales. Con 19,8 millones de parametros en safetensors fp32 (79 MB), es un modelo pequeno que se ejecuta en CPU sin dificultad. Funciona sin grafo causal (asumiendo que todas las covariables son pre-tratamiento) o con un DAG, y puede integrarse con Axiom, el modelo hermano de descubrimiento causal, para leer el rol de cada covariable (confusor, instrumento, mediador, colisionador) como probabilidades.

Su relevancia radica en que automatiza el ajuste por confusores en escenarios tabulares, un paso habitualmente manual y propenso a errores en analisis observacional. La version 0.1.0 es experimental: la API y los pesos cambiaran en releases 0.x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal CausalPFN (derivada de TabDPT), ajuste por confusores sobre datos tabulares |
| Parametros totales | 19.817.735 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrenado con tablas de 128 a 2048 filas |
| Tipos de cuantizacion | no disponible; pesos en fp32 |
| Idiomas soportados | no disponible (modelo no linguistico, opera sobre datos tabulares) |
| Licencia | Apache 2.0 (con NOTICE y LICENSE-CausalPFN para los pesos heredados de CausalPFN) |
| Formato de pesos | safetensors (fp32, 79 MB) |

## Arquitectura y entrenamiento

La red es la de CausalPFN, un modelo de inferencia causal amortizada que estima efectos contrafactuales directamente sobre una tabla de entrada. El entrenamiento parte de los pesos publicados de CausalPFN y los extiende para cubrir tratamientos continuos (ademas de binarios) y grafos causales: cuando se le pasa un DAG, el modelo descarta los descendientes del tratamiento y ajusta solo por el conjunto de ajuste valido; cuando recibe un resultado de `discover()` de Axiom, interpreta el rol de cada covariable como probabilidades. El modelo se entrena sobre datos simulados en los que se conoce el efecto real de cada fila, lo que permite supervisar directamente la estimacion del efecto y calibrar los intervalos.

Como innovaciones destacables, la version 0.0.2 incorporo como entrada y linea base un ajuste por minimos cuadrados del resultado, lo que mejora la precision en datos lineales y bajo solapamiento pobre, y garantiza que el efecto de un valor a si mismo sea exactamente cero. La version 0.1.0 reemplaza la firma de la API (`effect(df, treatment, outcome, graph=None)`) e incorpora el modo `debiased`, que combina las predicciones del modelo con una propension logistica en un estimador doblemente robusto (AIPW) para tratamientos binarios.

## Capacidades

- Estimacion de ATE, ATT y ATC para tratamientos binarios, con intervalos del 90% y del 50%.
- Estimacion del efecto por fila (CATE) para tratamientos binarios y continuos.
- Curva dosis-respuesta para tratamientos continuos, con contraste configurable (`contrast`) y valores de curva (`values`).
- Ajuste por confusores sin grafo (asumiendo covariables pre-tratamiento) o con un DAG explicito (lista de aristas, matriz de adyacencia o DataFrame de adyacencia).
- Integracion con el modelo de descubrimiento causal Axiom: lectura del rol de cada covariable como probabilidades y exposicion en `r.roles`.
- Estimador doblemente robusto (AIPW) opcional para tratamientos binarios mediante `r.debiased`.
- Manejo de tablas de hasta 84 covariables; las tablas grandes se dividen en subconjuntos disjuntos de hasta 2048 filas (1024 con mas de 34 covariables) y se combinan.
- No soporta valores faltantes en las columnas utilizadas ni confusores no medidos.

## Casos de uso

- Analisis de campanas de descuento: estimar el efecto de aplicar un descuento frente a no aplicarlo sobre el gasto del cliente (`effect(df, "discount", "spend")`), obteniendo ATE, ATT y el efecto individual por cliente para segmentar la politica comercial.
- Evaluacion de tratamientos medicos observacionales: con un DAG que refleje el conocimiento clinico, estimar el efecto de una intervencion sobre un biomarcador descartando mediadores y colisionadores del ajuste.
- Analisis de politicas publicas con datos administrativos: calcular el efecto de un programa sobre la poblacion tratada (ATT) y sobre los controles (ATC) para valorar expansion o focalizacion.
- Optimizacion de precios con tratamientos continuos: obtener la curva dosis-respuesta del precio sobre la conversion y el efecto entre dos niveles de precio concretos mediante `contrast=(a, b)`.
- Analisis de experimentos A/B con covariables: usar `r.debiased` (AIPW) como contraste frente a la estimacion directa del modelo para comprobar la robustez del efecto estimado.
- Integracion en pipelines de analitica causal: encadenar Axiom (`discover()`) con Axiom Effect para pasar de un grafo descubierto a una estimacion del efecto ajustada por roles, automatizando el flujo completo sobre tablas nuevas.
- Analisis de sensibilidad y exploracion: comparar estimaciones con y sin grafo, o con distintos grafos candidatos, para identificar que covariables cambian la conclusion.

## Benchmarks y rendimiento

El autor indica que el modelo se entrena con datos simulados y se evalua con datos semisinteticos (IHDP, ACIC 2016) con covariables reales, pero no se han publicado cifras de benchmarks en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; los pesos ocupan 79 MB en fp32 y el modelo tiene 19,8 M de parametros.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente, y la inferencia en CPU es viable.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: paquete Python propio (`pip install "git+https://huggingface.co/maxpagels/axiom-effect"`), con integracion opcional del paquete `axiom` para descubrimiento causal. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Tratamientos | Grafo causal | Licencia |
|---|---|---|---|---|---|
| Axiom Effect | 19,8 M | Inferencia causal tabular (CausalPFN) | Binarios y continuos | Opcional (DAG o descubierto) | Apache 2.0 |
| CausalPFN (vdblm) | no disponible | Inferencia causal tabular (base de Axiom Effect) | no disponible en la informacion | no disponible en la informacion | Apache 2.0 (segun la model card de Axiom Effect) |
| Axiom (maxpagels/axiom-discovery) | no disponible | Descubrimiento causal (modelo hermano) | no aplica | Produce el grafo | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No maneja confusores ocultos: la identificacion es solo por ajuste, y se asume que no existen causas comunes no medidas del tratamiento y el resultado.
- Un DAG se toma como verdadero; un grafo descubierto se lee como probabilidades, pero puede estar equivocado de formas que las probabilidades no reflejan.
- Las tablas grandes y anchas se dividen en subconjuntos de filas y el modelo es mas debil en ellas que en tablas pequenas.
- `r.debiased` no es de forma fiable mejor que `r.ate`; se incluye para comparar.
- Entrenado con datos simulados y evaluado con datos semisinteticos (IHDP, ACIC 2016); no hay evaluacion sobre efectos reales.
- Los intervalos son los cuantiles propios del modelo, calibrados sobre sus datos simulados; se desconoce su cobertura en otros dominios.
- No soporta valores faltantes en las columnas utilizadas.
- Los tratamientos continuos deben tener al menos 10 valores distintos y situarse dentro de sus cuantiles 2-98%.
- Version 0.1.0 experimental: la API y los pesos cambiaran en releases 0.x, con cambios incompatibles ya documentados entre versiones.
- Los pesos heredados de CausalPFN estan sujetos a los terminos Apache 2.0 y a los archivos NOTICE y LICENSE-CausalPFN del repositorio.
- No se documentan sesgos especificos ni comportamiento multilingue (el modelo no procesa lenguaje).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxpagels/axiom-effect
- Modelo hermano de descubrimiento causal: https://huggingface.co/maxpagels/axiom-discovery
- Modelo base CausalPFN: https://huggingface.co/vdblm/causalpfn
- Paper de CausalPFN (Balazadeh et al. 2025): https://arxiv.org/abs/2506.07918
- Pagina del proyecto: https://maxpagels.com/axiom
- Instalacion del paquete: `pip install "git+https://huggingface.co/maxpagels/axiom-effect"`
