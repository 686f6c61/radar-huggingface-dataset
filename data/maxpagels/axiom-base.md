# maxpagels/axiom-base

## Resumen

Axiom (base) es un modelo de descubrimiento causal para datos tabulares desarrollado por maxpagels. A diferencia de los modelos de lenguaje, Axiom no genera texto: recibe una tabla completa (filas x variables) y, en un único forward pass, etiqueta cada par de variables como `causes` (a -> b), `caused_by` (b -> a), `undirected` (vinculadas pero sin dirección identificable), `confounded` (sin arista directa pero con causa común oculta) o `none`, con probabilidades asociadas, y ensambla el resultado en un grafo acíclico.

El modelo tiene 11.933.003 parámetros (11,9 M) en safetensors fp32 (48 MB), lo que lo sitúa en la categoría de modelos pequeños y desplegables en CPU. Está entrenado para trabajar con entre 2 y 50 variables (ampliado desde 2-25 en la versión 1.0.0) y con tablas de 256 filas o más, aunque admite desde ~100 filas. Soporta valores ausentes y filas procedentes de experimentos conocidos mediante el argumento `interventions`.

Su relevancia radica en que aborda el descubrimiento causal tabular como una tarea de clasificación de relaciones por pares en lugar de estimación de estructura clásica, con un modelo neuronal que produce probabilidades calibradas y un grafo acíclico directamente utilizable. La librería `axiom` acompaña a los pesos y permite invocarlo con `Axiom.from_pretrained("maxpagels/axiom-base")`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo neuronal para descubrimiento causal tabular; la model card no detalla la topología interna) |
| Parametros totales | 11.933.003 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada tabular de 2-50 variables (hasta 100 en datos simulados) y 256+ filas recomendadas (submuestreo a 2048 filas) |
| Tipos de cuantizacion | no disponible; pesos publicados en fp32 safetensors (48 MB) |
| Idiomas soportados | no disponible (modelo tabular, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

La model card no especifica la topología interna del modelo más allá de indicar que es un modelo neuronal (tag `pytorch`) que opera sobre una tabla completa en un único forward pass y produce, para cada par de variables, una distribución de probabilidad sobre cinco tipos de relación. El resultado se ensambla en un grafo acíclico. La entrada se estandariza por columna con el mismo preprocesamiento que en entrenamiento (función `axiom.preprocess`).

El entrenamiento se basa en un prior sobre familias de modelos causales estructurales (SCM) sintéticos. La versión 1.0.0 introduce una nueva familia de SCM físicos en el prior: mecanismos con forma de ecuación sobre escalas naturales, relaciones exactas, nodos con muchas entradas y variables discretas dentro del sistema. Además, amplía el rango de variables de entrenamiento de 2-25 a 2-50. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF/DPO (no aplica a este tipo de modelo). El modelo se distribuye con la librería `axiom`, cuya versión 0.3.1 o superior carga los pesos de forma estricta para evitar desajustes silenciosos entre código y pesos.

## Capacidades

- Descubrimiento causal sobre datos tabulares: etiqueta cada par de variables con una de cinco relaciones (`causes`, `caused_by`, `undirected`, `confounded`, `none`) y una probabilidad asociada.
- Construcción de un grafo acíclico a partir de las relaciones detectadas, con aristas dirigidas y sus probabilidades (`g.edges`).
- Manejo de valores ausentes (NaN) en la tabla de entrada.
- Soporte de intervenciones conocidas: etiquetado por fila de experimentos mediante lista de objetivos o máscara booleana (n, d).
- Submuestreo automático para tablas grandes: divide tablas de más de 2048 filas en subconjuntos aleatorios de 2048 filas y promedia las predicciones (`n_subsets` configurable).
- Umbral de decisión ajustable (`thresh`, por defecto 0.5) para controlar la sensibilidad de las relaciones detectadas.
- Exportación de resultados a DataFrame de pandas (`to_frame`, `to_frame(all_pairs=True)`).
- No soporta generación de texto, código, matemáticas, visión, audio, tool calling ni agentes; es un modelo especializado en una única tarea.

## Casos de uso

- Análisis exploratorio de datos científicos: dado un conjunto de variables medidas (por ejemplo, marcadores biológicos como PKA, PKC o PIP3), el modelo propone un grafo de hipótesis causales que el investigador puede contrastar con conocimiento de dominio y priorizar para experimentos.
- Priorización de experimentos: las relaciones con baja probabilidad o clasificadas como `undirected` o `confounded` señalan pares candidatos a intervención experimental, reduciendo el coste de diseñar estudios.
- Identificación y estimación de efectos causales: las aristas dirigidas con alta confianza (`g.edges`) pueden alimentar pipelines posteriores de identificación y estimación de efectos causales.
- Detección de confusión oculta: el filtrado de relaciones `confounded` permite identificar pares de variables que probablemente comparten una causa no medida, útil en control de calidad y auditoría de datos.
- Análisis de datos observacionales con experimentos parciales: en tablas mixtas donde algunas filas provienen de experimentos, el modelo incorpora esa información vía `interventions` para mejorar la orientación de las aristas.
- Exploración en dominios con muchas variables y pocas muestras: con 256 filas o más y hasta 50 variables, el modelo ofrece un grafo inicial en un único forward pass, adecuado para fases tempranas de análisis en genómica, epidemiología o ciencias sociales.
- Integración en notebooks y pipelines de ciencia de datos: al ser un modelo de 48 MB ejecutable en CPU, puede incorporarse a flujos de análisis interactivos sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso base; los pesos fp32 ocupan 48 MB y el modelo puede ejecutarse en CPU.
- Memoria RAM: la model card indica que el consumo crece rápidamente con el número de variables: ~1 GB en CPU con 100 variables y ~3 GB con 200 variables.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU. Por tamaño, cualquier GPU consumer con suficiente memoria para el grafo de cómputo sería suficiente, pero no se confirma en la documentación.
- Cabe en GPU consumer: sí, por el tamaño del modelo (11,9 M de parámetros, 48 MB), aunque la documentación no lo indica explícitamente.
- Opciones de despliegue: instalación vía `pip install "git+https://huggingface.co/maxpagels/axiom-base"` y uso con la librería `axiom` (`Axiom.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de descubrimiento causal tabular ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Las aristas y, especialmente, sus direcciones deben tratarse como hipótesis ordenadas por probabilidad, no como un veredicto; la propia model card lo advierte.
- Con menos de ~100 filas los resultados dejan de ser fiables; por debajo de 256 filas la calidad se degrada.
- Entrenado con 2-50 variables; más de 50 variables en datos reales no está probado (hasta 100 solo se validó en datos simulados).
- El consumo de memoria crece rápidamente con el número de variables (~1 GB a 100 variables, ~3 GB a 200 en CPU).
- Las filas procedentes de experimentos deben etiquetarse todas; las no etiquetadas actúan como causas ocultas y pueden producir aristas erróneas o invertidas.
- Solo detecta enlaces directos: en una cadena a -> b -> c, el par a, c se clasifica como `none`; qué se considera directo depende de las variables incluidas en la tabla.
- En datos lineales-gaussianos, la dirección no es identificable y el modelo puede devolver `undirected`.
- Antes de la versión 0.3.0, la instalación cargaba los pesos de `main` sin error pero producía resultados incorrectos; es necesario actualizar o fijar la revisión.
- No se detallan sesgos conocidos ni riesgos de alucinación en el sentido lingüístico (no es un modelo de lenguaje); el riesgo principal es la sobreinterpretación de relaciones espurias.
- Licencia apache-2.0: permite uso comercial, pero no se documentan restricciones adicionales ni garantías.

## Enlaces

- Hugging Face: https://huggingface.co/maxpagels/axiom-base
- Página del proyecto: https://maxpagels.com/axiom
- Paper referenciado en los tags: arXiv:2609.11897
