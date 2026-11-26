# maxpagels/axiom-base

## Resumen

Axiom (base) es un modelo de descubrimiento causal para datos tabulares desarrollado por maxpagels. A diferencia de los modelos de lenguaje, no genera texto: recibe una tabla completa (filas x variables) y, en un único forward pass, etiqueta cada par de variables como `causes`, `caused_by`, `undirected`, `confounded` o `none`, con probabilidades asociadas, y ensambla el resultado en un grafo acíclico dirigido. El modelo está entrenado para manejar valores ausentes y filas provenientes de experimentos conocidos (intervenciones).

Con 11,9 millones de parámetros en fp32 (48 MB de pesos safetensors), Axiom es un modelo compacto y especializado, no un transformer de propósito general. Su relevancia radica en automatizar una tarea clásica de la inferencia causal —la identificación de estructura— sobre datos tabulares, un terreno donde los métodos tradicionales (PC, GES, LiNGAM) tienen supuestos restrictivos y los LLM no ofrecen garantías formales.

La versión base se distribuye con licencia Apache 2.0 y se acompaña de un paquete Python (`axiom`) que gestiona el preprocesado, la decodificación de pares y el promediado sobre subconjuntos de filas. El proyecto está documentado en maxpagels.com/axiom y referencia el paper arXiv:2609.11897.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo especializado en descubrimiento causal tabular; no se detalla la topología interna) |
| Parametros totales | 11.933.003 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular; recomendado 256-2048 filas, 2-50 variables) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 48 MB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de describirla como un modelo que procesa una tabla completa en un único forward pass y produce, para cada par de variables, una distribución de probabilidad sobre cinco relaciones causales. El diseño está orientado a datos tabulares con soporte nativo de valores ausentes (NaN) y de filas intervenidas, etiquetadas mediante una lista de objetivos por fila o una máscara booleana (n, d).

El entrenamiento se realizó sobre datos simulados y reales según la model card, que indica que el modelo "se mantuvo hasta 100 variables sin pérdida de precisión en datos simulados", aunque más allá de 50 variables en datos reales no está probado. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a este tipo de modelo). La innovación principal es la formulación del descubrimiento causal como un problema de clasificación por pares con decodificación en dos etapas (existencia de arista y orientación) que garantiza aciclicidad en el grafo resultante.

## Capacidades

- Descubrimiento causal sobre datos tabulares: etiqueta cada par de variables con una de cinco relaciones (`causes`, `caused_by`, `undirected`, `confounded`, `none`) y su probabilidad.
- Construcción de grafos acíclicos dirigidos a partir de las relaciones detectadas.
- Manejo de valores ausentes (NaN) en la tabla de entrada.
- Soporte de intervenciones: acepta filas provenientes de experimentos conocidos, etiquetadas por columna objetivo o mediante máscara booleana.
- Decodificación configurable mediante umbral (`thresh`, por defecto 0,5) para controlar la sensibilidad del grafo.
- Promediado automático sobre subconjuntos aleatorios de 2048 filas para tablas grandes, con `n_subsets` configurable.
- Salida estructurada: lista de relaciones, aristas dirigidas, consulta por par concreto y exportación a DataFrame de pandas.
- Análisis de estabilidad entre subconjuntos, conservando las probabilidades de cada subconjunto.
- No soporta generación de texto, código, visión, audio, tool calling ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Análisis exploratorio en bioinformática: dado un dataset de expresión de proteínas o genes (como el ejemplo PKA/PKC/PIP3 de la model card), Axiom propone un grafo de hipótesis causales que el investigador puede contrastar con literatura o experimentos dirigidos.
- Priorización de experimentos: las relaciones marcadas como `undirected` o con baja probabilidad señalan pares candidatos a intervención experimental, reduciendo el coste de diseñar experimentos a ciegas.
- Identificación de factores de confusión ocultos: la etiqueta `confounded` detecta pares sin arista directa pero con causa común no medida (por ejemplo, ventas de helado y ahogamientos por el calor), útil en epidemiología y ciencias sociales.
- Ingeniería de características causal: en pipelines de machine learning tabular, el grafo permite seleccionar variables con relación causal directa hacia el target y descartar correlaciones espurias, mejorando la robustez fuera de distribución.
- Análisis de datos industriales y de sensores: con tablas de 256-2048 filas y hasta 50 variables, se puede inferir la topología causal de un proceso (temperatura, presión, caudal) para diagnóstico de fallos.
- Validación de conocimiento de dominio: el grafo generado se compara con el grafo esperado por expertos; las discrepancias confiadas (p alta) señalan errores en el modelo mental del dominio o datos problemáticos.
- Investigación metodológica en causalidad: al ser un modelo pequeño y de código abierto, sirve como baseline reproducible para comparar con métodos clásicos (PC, GES) y con futuros modelos neuronales de descubrimiento causal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente aporta indicaciones cualitativas de robustez: funciona mejor con 256 filas o más (usable desde ~100, poco fiable por debajo), está entrenado para 2-50 variables, mantiene precisión hasta 100 variables en datos simulados, y consume aproximadamente 1 GB de RAM en CPU con 100 variables y ~3 GB con 200.

## Requisitos de hardware

- VRAM/RAM: los pesos ocupan 48 MB en fp32; la memoria dominante es la de la tabla y el grafo. Aproximadamente 1 GB de RAM en CPU con 100 variables y ~3 GB con 200 variables según la model card.
- GPU: no se especifican requisitos de GPU; el modelo es lo bastante pequeño para ejecutarse en CPU. Cualquier GPU consumer (incluso integradas) es suficiente para los pesos; el cuello de botella es la memoria del sistema para tablas anchas.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Despliegue: paquete Python `axiom` instalable vía `pip install "git+https://huggingface.co/maxpagels/axiom-discovery"`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada. El coste escala con el número de variables (memoria cuadrática en el número de pares) y con el número de subconjuntos para tablas de más de 2048 filas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Axiom (base) | Descubrimiento causal tabular | 11,9 M | Tabla (filas x variables) | Apache 2.0 | Hugging Face (maxpagels/axiom-base) |
| PC algorithm | Algoritmo causal clásico (basado en tests de independencia) | no aplica | Tabla | Implementaciones varias (p. ej. causal-learn, pcalg) | Bibliotecas open source |
| GES (Greedy Equivalence Search) | Algoritmo causal clásico (score-based) | no aplica | Tabla | Implementaciones varias | Bibliotecas open source |
| NOTEARS | Descubrimiento causal diferenciable | variable (MLP pequeño) | Tabla | MIT (implementación de referencia) | GitHub |

La comparación directa con benchmarks no está disponible. Frente a los métodos clásicos, Axiom ofrece un enfoque aprendido que maneja valores ausentes e intervenciones de forma nativa y produce probabilidades calibradas por par, mientras que PC y GES dependen de tests de independencia condicional y NOTEARS de supuestos de linealidad y acyclicidad continua. La contrapartida es que Axiom es una caja parcialmente opaca (arquitectura no detallada) y su validez fuera del régimen de entrenamiento (2-50 variables, 256-2048 filas) no está garantizada.

## Limitaciones y advertencias

- Las aristas y, sobre todo, sus direcciones deben tratarse como hipótesis ordenadas por probabilidad, no como un veredicto; la propia model card lo advierte explícitamente.
- Las filas experimentales no etiquetadas actúan como causas ocultas y pueden producir aristas incorrectas o invertidas; es obligatorio etiquetar todas las filas de intervención.
- Por debajo de ~100 filas los resultados son poco fiables; por encima de 50 variables en datos reales no está probado.
- El consumo de memoria crece rápidamente con el número de variables (~1 GB a 100 variables, ~3 GB a 200 en CPU).
- Solo detecta relaciones directas: en una cadena a -> b -> c, el par (a, c) se marca como `none`; el grafo depende del conjunto de variables incluido.
- En datos lineal-gaussianos la dirección puede ser no identificable y el modelo devuelve `undirected` con probabilidad baja, lo que puede confundirse con baja confianza si no se interpreta correctamente la decodificación.
- No se detalla la arquitectura interna ni la composición del dataset de entrenamiento, lo que dificulta auditar sesgos o generalización.
- No hay información sobre sesgos conocidos ni sobre comportamiento en dominios específicos (salud, finanzas, etc.); se recomienda validación con conocimiento de dominio antes de usar el grafo para identificación de efectos causales en producción.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías de exactitud causal; el uso en decisiones de alto riesgo requiere supervisión experta.
- La API ha cambiado entre versiones (paquete renombrado de `axiom-causal` a `axiom-discovery`, carga de pesos ligada a la versión desde 0.3.0); instalaciones antiguas pueden cargar pesos actuales y dar resultados erróneos sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxpagels/axiom-base
- Paquete Python (repositorio de instalación): https://huggingface.co/maxpagels/axiom-discovery
- Página del proyecto: https://maxpagels.com/axiom
- Paper de referencia: arXiv:2609.11897
