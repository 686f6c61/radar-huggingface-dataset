# maxpagels/axiom-base

## Resumen

Axiom (base) es un modelo desarrollado por maxpagels para descubrimiento causal (causal discovery) sobre datos tabulares. A diferencia de los modelos de lenguaje, su tarea consiste en etiquetar, para cada par de variables de una tabla, la relacion causal que las une: `causes` (a -> b), `caused_by` (b -> a), `undirected` (vinculo directo sin direccion identificable), `confounded` (sin arista directa pero con causa comun oculta) o `none`, acompanando cada etiqueta de una probabilidad y ensamblando el resultado en un grafo aciclico.

El modelo tiene 11.933.003 parametros (11,9 M) almacenados en safetensors en fp32 (48 MB), lo que lo situa en la categoria de modelos ligeros especializados. Realiza el descubrimiento en un unico forward pass sobre la tabla completa (filas x variables) y admite valores faltantes (NaN) asi como filas provenientes de experimentos conocidos mediante etiquetas de intervencion.

Es relevante porque aborda un problema clasico de la estadistica causal (inferencia de estructura) con un enfoque aprendido y rapido, pensado para generar hipotesis que el analista contrasta con conocimiento de dominio o con experimentos, en lugar de ofrecer un veredicto definitivo. La libreria `axiom` gestiona el preprocesado, la inferencia y la lectura del grafo resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo neuronal para descubrimiento causal sobre tablas; detalles de capas no publicados en la informacion disponible) |
| Parametros totales | 11.933.003 (11,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; opera sobre tablas de filas x variables (recomendado 256+ filas, 2-25 variables en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; los nombres de variables son cadenas arbitrarias) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 48 MB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (tipo de red, numero de capas, mecanismo de atencion o agregacion entre variables). Se sabe que el modelo procesa la tabla completa en un unico forward pass y que, a partir de la version 0.3.0, incorpora como entrada estadisticas clasicas de pares (correlaciones, correlaciones parciales y senales de direccion por pares), ademas de identificadores de condicion por fila (`discover(conditions=...)`).

El entrenamiento se realizo sobre tablas de 2 a 25 variables con un prior "mas realista" que incluye mezclas de experimentos y distribuciones sesgadas, segun la model card. No se especifica el volumen de datos de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). El modelo admite filas de experimentos etiquetadas con la variable o variables objetivo de la intervencion.

## Capacidades

- Descubrimiento causal por pares de variables con cinco clases de relacion y probabilidades asociadas.
- Ensamblaje del resultado en un grafo aciclico dirigido (solo aristas directas).
- Manejo de valores faltantes (NaN) en la tabla de entrada.
- Soporte de intervenciones: etiquetado de filas experimentales mediante lista por fila o mascara booleana (n, d).
- Agregacion automatica para tablas grandes: con mas de 2048 filas, promedia predicciones sobre subconjuntos aleatorios de 2048 filas (`n_subsets` configurable).
- Umbral de decision ajustable (`thresh`, por defecto 0,5) para filtrar relaciones de baja probabilidad.
- Salidas estructuradas: lista de `Relation`, aristas dirigidas, consulta por par concreto y exportacion a DataFrame (`to_frame`, incluido `all_pairs=True`).
- Preprocesado integrado (`axiom.preprocess`) que estandariza cada columna como en entrenamiento.
- No es un modelo de lenguaje: no genera texto, codigo, vision ni audio, y no soporta tool calling ni agentes.

## Casos de uso

- Analisis exploratorio en ciencia de datos: dada una tabla de observaciones (por ejemplo, biomarcadores o sensores), obtener un grafo de hipotesis causales para priorizar que relaciones investigar, aprovechando que el modelo etiqueta pares como `confounded` o `undirected` y evita falsas certezas.
- Diseno de experimentos: usar las relaciones con probabilidad baja o direccion ambigua como candidatas a intervencion experimental, y luego reejecutar `discover` con las filas experimentales etiquetadas para refinar el grafo.
- Analisis de datos observacionales con confusores: identificar pares marcados como `confounded` (sin arista directa pero con causa comun oculta) para justificar la inclusion de variables de control antes de estimar efectos causales.
- Integracion en pipelines de analisis tabular: la API basada en pandas DataFrame y la salida `to_frame()` permiten encadenar el descubrimiento con herramientas de analisis estadistico existentes en notebooks o scripts de Python.
- Analisis de datos de laboratorio con intervenciones conocidas: en experimentos donde se manipula una variable concreta, etiquetar esas filas con `interventions=` mejora la orientacion de las aristas, evitando que las filas experimentales actuen como causas ocultas.
- Prototipado rapido en CPU: con 11,9 M de parametros y 48 MB de pesos, el modelo puede ejecutarse en entornos sin GPU para tablas de hasta 25 variables, lo que facilita la validacion inicial de hipotesis antes de invertir en metodos mas costosos.
- Docencia y formacion en causalidad: el modelo devuelve probabilidades por clase y distingue explicitamente entre vinculos directos, confusores y ausencia de relacion, lo que sirve como material didactico para ilustrar conceptos de inferencia causal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica observaciones cualitativas: el modelo se entreno con 2-25 variables y "en datos simulados resistio hasta 100 variables sin perdida de precision"; por encima de 25 variables en datos reales no ha sido probado.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 48 MB en fp32; el consumo dominante es la memoria de activaciones y estadisticas, que crece con el numero de variables (aproximadamente 1 GB de RAM en CPU con 100 variables y unos 3 GB con 200, segun la model card).
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es mas que suficiente, y el modelo esta disenado para funcionar tambien en CPU.
- Cabe en GPU consumer: si, con amplio margen, dado el tamano de pesos.
- Opciones de despliegue: la libreria oficial `axiom` (instalacion via `pip install "git+https://huggingface.co/maxpagels/axiom-base"`), con carga mediante `Axiom.from_pretrained`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros metodos de descubrimiento causal (por ejemplo, algoritmos clasicos como PC, GES o NOTEARS, ni otros modelos aprendidos de la misma categoria), por lo que no se pueden aportar datos de parametros, contexto o rendimiento frente a alternativas.

## Limitaciones y advertencias

- Las aristas y, sobre todo, sus direcciones deben tratarse como hipotesis ordenadas por probabilidad, no como un veredicto; la propia model card lo advierte.
- Fiabilidad dependiente del tamano de la tabla: funciona mejor con 256 filas o mas; por debajo de unas 100 filas los resultados dejan de ser fiables.
- Entrenado con 2-25 variables; el comportamiento con mas de 25 variables en datos reales no ha sido probado, y la memoria crece rapidamente con el numero de variables.
- Las filas provenientes de experimentos deben etiquetarse todas; las filas experimentales sin etiquetar actuan como causas ocultas y pueden producir aristas erroneas o invertidas.
- Solo detecta vinculos directos: en una cadena a -> b -> c, el par a, c se marca como `none`, y lo que se considera directo depende de que variables se incluyan en la tabla.
- Riesgo de sesgos y alucinacion en el sentido de relaciones espurias: al ser un modelo aprendido sobre datos simulados con un prior concreto, puede no generalizar a dominios con distribuciones muy distintas; no se documentan sesgos especificos.
- Limitaciones de idioma: no aplica como modelo de lenguaje, pero no se documenta el tratamiento de nombres de variables no ASCII.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y aviso de licencia; no se documentan restricciones adicionales.
- Caveat de versiones: antes de la version 0.3.0, las instalaciones cargaban los pesos de `main` sin verificar correspondencia, lo que podia producir resultados incorrectos sin error; se recomienda usar 0.3.1 o posterior y fijar la revision de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxpagels/axiom-base
- Pagina del proyecto: https://maxpagels.com/axiom
- Instalacion: `pip install "git+https://huggingface.co/maxpagels/axiom-base"`
