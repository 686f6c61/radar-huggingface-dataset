# ProfitOpsAI/pfnstudio-dopfn

## Resumen

Do-PFN es un modelo de tipo prior-fitted network (PFN) especializado en inferencia causal sobre datos tabulares: aprende a predecir la distribución interventional condicional `p(Y | do(T=t), X)` a partir de datos puramente observacionales, sin recibir nunca el grafo causal subyacente. El modelo es una reimplementación reproducible del trabajo de Robertson, Reuter, Guo, Hollmann, Hutter y Schölkopf presentado en NeurIPS 2025 (arXiv:2506.06039), portada de extremo a extremo a PFN Studio por el usuario ProfitOpsAI. El repositorio de Hugging Face contiene exclusivamente los artefactos del estudio (prior, bloques, configuración de modelo y evaluación), no un checkpoint entrenado listo para uso.

La arquitectura es un transformer de 12 capas con axial attention y dimensión de modelo d=192, que procesa cada tarea como una secuencia (contexto, consulta): los tokens de contexto transportan la distribución observacional `(X, T_obs, Y_obs)` y los de consulta la intervención deseada `(X, t_query, 0)`. La cabeza de salida es una bar-distribution head que modela la distribución completa del outcome sobre 100 cubos de masa equiprobable y se entrena con NLL por bucketización.

Su relevancia reside en el enfoque amortizado: una sola pasada forward por dataset nuevo, sin optimización por instancia y sin acceso al grafo causal, corrigiendo en contexto el sesgo del estimador observacional naive `E[Y|T=1,X] − E[Y|T=0,X]` bajo confusión no observada. No obstante, el propio autor indica que la tabla de resultados está pendiente de la primera ejecución completa de entrenamiento en GPU (H100/H200), por lo que no hay métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con axial attention, 12 capas, d=192; pipeline `grid_preprocessor` → `tabular_cell_embedder` → `axial_attention_block × 12` → `row_pool_for_head` → `bar_distribution_head` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el contexto se define por tarea: tokens de contexto observacional + tokens de consulta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo tabular, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0.2 GB con artefactos del estudio en YAML/Python; no se indica checkpoint en safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer de 12 capas con axial attention de dimensión d=192, diseñado para datos tabulares. Cada tarea se genera mediante el prior `do_pfn_scm`, una reimplementación fiel del algoritmo 1 del paper: se muestrea un DAG aleatorio sobre K = d + no observados + 2 nodos con densidad de aristas p variable por tarea, se leen covariables X ∈ ℝ⁶ de nodos no tratamiento/outcome, se incluyen nodos latentes que pueden confundir T e Y, se binariza un nodo de tratamiento T entre los que tienen descendientes y se define Y como descendiente de T con ecuaciones estructurales lineales aleatorias a través de no linealidades γ ∈ {x², tanh, ReLU} más ruido. Cada tarea se empaqueta como secuencia (contexto, consulta) y el modelo se entrena para predecir `Y_{do(T=t_query)}` en cada posición de consulta, valor muestreado del SCM bajo la operación do y nunca visible en el contexto observacional.

El entrenamiento usa hiperparámetros fijados al paper: `lr=5e-4`, batch size 32, AdamW con weight decay 1e-5, gradient clipping 1.0 y 12.000 pasos. La cabeza de salida es una bar-distribution head (bloque `bar_distribution_head.py`) que produce una distribución completa del outcome sobre 100 cubos de masa equiprobable, entrenada con NLL por bucketización. El autor declara que la reimplementación es fiel a las primitivas del paper y que no se copió código upstream; el prior requiere `networkx`. La validación (`pfnstudio validate` + `lint`) se verificó de extremo a extremo en CPU, pero la tabla de resultados queda pendiente de la primera ejecución completa en GPU.

## Capacidades

- Predicción de la distribución interventional condicional `p(Y | do(T=t), X)` a partir de datos observacionales, sin grafo causal.
- Estimación de CATE (Conditional Average Treatment Effect) derivada de consultas CID pareadas sobre la misma X.
- Cuantificación de incertidumbre calibrada mediante la bar-distribution head (PICP sobre el intervalo predictivo central del 90%).
- Aprendizaje en contexto (in-context learning) amortizado: una pasada forward por dataset nuevo, sin optimización por instancia.
- Manejo de confusión no observada mediante nodos latentes presentes en el prior de entrenamiento.
- Procesamiento de datos tabulares con covariables continuas (X ∈ ℝ⁶ en el prior) y tratamiento binario.
- No soporta tool calling, function calling, agentes, multimodalidad ni capacidades lingüísticas: es un modelo tabular/causal, no un LLM.

## Casos de uso

- Estimación de efecto causal en ensayos observacionales: dado un dataset con covariables, tratamiento binario y outcome, el modelo produce en una sola pasada la distribución interventional por individuo, corrigiendo el sesgo del estimador naive cuando se sospecha confusión no observada.
- Evaluación de políticas en marketing: estimar el efecto de una campaña (T) sobre la conversión (Y) condicionado a características del cliente (X) sin experimento aleatorizado, usando la CATE derivada de consultas do(1) y do(0).
- Análisis de eficacia en sanidad: predecir la distribución de outcomes bajo tratamiento frente a control en cohortes observacionales, con intervalos predictivos calibrados (PICP ≈ 0,90) para comunicar incertidumbre.
- Priorización de intervenciones en operaciones: ordenar subpoblaciones por CATE estimado para asignar recursos limitados donde el efecto esperado es mayor.
- Investigación metodológica en inferencia causal: banco de pruebas reproducible para comparar estimadores amortizados frente a ridge por tarea y frente al oráculo Monte-Carlo en 50 DGPs frescos.
- Auditoría de sesgo en decisiones automatizadas: cuantificar cómo cambia la distribución de Y bajo intervenciones hipotéticas sobre T en distintos subgrupos de X.
- Prototipado de pipelines causales en PFN Studio: servir de estudio de referencia para extender el toolkit a benchmarks de datos reales (RealCause, Amazon, Law School, hoja de ruta v0.2).

## Benchmarks y rendimiento

El autor declara explícitamente que la tabla de resultados está pendiente de la primera ejecución completa de entrenamiento en GPU (H100/H200). Las métricas previstas son CID-MSE, CID-NMSE, CATE-MSE, CATE-NMSE y PICP, comparadas contra ridge por tarea (baseline observacional sesgado) y el oráculo Monte-Carlo (suelo alcanzable, CATE-MSE ≈ 0). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica número de parámetros ni checkpoint).
- GPU recomendadas para entrenamiento: H100 o H200 según el propio autor (ejecución completa pendiente).
- Entrenamiento verificado en CPU únicamente para la validación del pipeline (`pfnstudio validate` + `lint`), no para la convergencia completa.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el modelo se ejecuta mediante el toolkit `pfnstudio` (`pip install "pfnstudio-core[torch]" pfnstudio`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el tiempo de entrenamiento en pared también está pendiente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque causal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Do-PFN (este) | PFN tabular, axial attention 12 capas d=192 | no disponible | no disponible | Distribución interventional completa `p(Y\|do(T=t),X)` | no disponible | Artefactos del estudio en HF; sin checkpoint entrenado |
| PFN base de pfnstudio (ej. regresión lineal bayesiana) | PFN tabular | no disponible | no disponible | No causal (posterior predictivo) | no disponible | Toolkit open source en GitHub |
| Estimador ridge por tarea | Regresión lineal | no aplica | no aplica | Observacional naive, sesgado bajo confusión | no aplica | Baseline incluido en la evaluación |
| Oráculo Monte-Carlo | Simulación SCM | no aplica | no aplica | CATE verdadera vía `E[Y\|do(1),X] − E[Y\|do(0),X]` | no aplica | Suelo de referencia en la evaluación |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay checkpoint entrenado ni resultados publicados: el repositorio contiene artefactos del estudio, no un modelo listo para producción.
- El modelo se entrena exclusivamente sobre SCM sintéticos con DAGs aleatorios, covariables en ℝ⁶ y tratamiento binario; la generalización a datos reales de alta dimensión no está validada (benchmarks reales en hoja de ruta v0.2).
- Depende de supuestos del prior (linealidad a través de no linealidades γ, ruido, estructura del DAG); violaciones de estos supuestos pueden degradar la estimación.
- Riesgo de mala calibración del intervalo predictivo (PICP) fuera de la distribución del prior; el propio autor define PICP ≈ 0,90 como criterio de calibración correcta.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas y modalidades: no aplica; no es un modelo de lenguaje y no puede procesar texto, imagen ni audio.
- El sesgo del estimador naive bajo confusión no observada se corrige solo en la medida en que el prior de entrenamiento capture el tipo de confusión presente en los datos de destino.
- Requiere `networkx` para el prior y el toolkit `pfnstudio`; no hay soporte documentado para runtimes de inferencia estándar (vLLM, llama.cpp, Ollama, TGI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProfitOpsAI/pfnstudio-dopfn
- Paper Do-PFN (arXiv:2506.06039): https://arxiv.org/abs/2506.06039
- Toolkit pfnstudio en GitHub: https://github.com/profitopsai/pfnstudio
- Repositorios del autor: https://github.com/profitopsai?tab=repositories
