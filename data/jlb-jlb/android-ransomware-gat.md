# JLB-JLB/android-ransomware-gat

## Resumen

`JLB-JLB/android-ransomware-gat` es una coleccion de 18 checkpoints de redes de atencion sobre grafos (GAT) entrenados para clasificar aplicaciones Android como ransomware o benignas a partir del grafo de llamadas entre clases del APK. No es un modelo de lenguaje: es un clasificador binario sobre grafos, publicado como artefacto reproducible de la tesis de master *Ransomware Detection using Graph Neural Networks Enhanced by Large Language Models* de Joscha Lasse Bisping (TU Berlin). La relevancia del trabajo esta en el pipeline de caracteristicas: los atributos de cada nodo (clase) no se extraen con analisis estatico manual, sino pidiendole a un LLM (`google/gemma-4-E4B-it`) un veredicto estructurado en JSON sobre el codigo descompilado de cada clase, frente a una rama de comparacion que usa embeddings de codigo.

El modelo emplea una GAT de 4 capas con 8 cabezas de 32 canales cada una (256 canales en total, con concatenacion), normalizacion por lotes y agrupacion por media global, seguida de una cabeza de dos clases. Se publican tres variantes segun el tipo de caracteristica de nodo: `verdict` (2 bits de veredicto del LLM), `verdict_behavior` (7 bits: los dos anteriores mas comportamiento concreto) y `embedding` (768 dimensiones de `nomic-ai/CodeRankEmbed`). Cada variante se despliega en seis modelos, uno por cada familia de ransomware retenida en un esquema *family-leave-one-out*, de modo que ningun checkpoint es un detector calibrado para trafico real.

El interes practico inmediato es metodologico: permite reproducir y extender un experimento controlado sobre si las etiquetas semanticas generadas por un LLM aportan ventaja frente a embeddings de codigo en una tarea de deteccion de malware. La model card advierte de forma explicita que los checkpoints son artefactos de investigacion y no deben usarse para filtrar aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAT (Graph Attention Network) de 4 capas `GATConv`, 8 cabezas x 32 canales = 256 canales, `concat=True` |
| Parametros totales | no disponible (el repositorio declara 0,0 GB; no se publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo sobre grafos). El paso upstream con LLM usa `max_model_len` 8192 y trunca el codigo fuente de cada clase a 16.000 caracteres |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesa grafos de clases Java/Kotlin; el prompt del LLM upstream esta en ingles) |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch Lightning (`.ckpt`, `state_dict` + `hyper_parameters`), acompanado de `bundle.json` y `metrics.json` por fold |

## Arquitectura y entrenamiento

La arquitectura es identica en las tres variantes: cuatro capas `GATConv` con 8 cabezas de 32 canales concatenadas (256 canales por capa), cada una seguida de `BatchNorm1d(256)` y ReLU. Tras las capas de atencion se aplica `global_mean_pool` sobre los nodos y una cabeza `Linear(256,256) -> ReLU -> Dropout(0.5) -> Linear(256,2)`. El entrenamiento usa entropia cruzada ponderada por clase, AdamW con learning rate 1e-3 y weight decay 1e-4, y parada temprana sobre macro-F1 de validacion. La salida en el indice 1 corresponde a *ransomware* y el umbral de decision es 0,5.

La entrada es un grafo por APK: un nodo por clase externa con bytecode (las clases internas y anonimas `Foo$Bar` se pliegan en `Foo`, sin filtrado de librerias), y aristas dirigidas de clase llamadora a clase llamada agregando las referencias cruzadas de metodos de Androguard a nivel de clase (las llamadas intra-clase se descartan). Las caracteristicas de nodo dependen de la variante: 2 bits (`potentially_malicious`, `potentially_ransomware`), 7 bits (los dos anteriores mas `device_admin`, `screen_lock_or_overlay`, `sms_abuse`, `file_enumeration`, `anti_analysis`) o 768 dimensiones L2-normalizadas de `nomic-ai/CodeRankEmbed`. En las variantes de veredicto, los bits provienen de `google/gemma-4-E4B-it` servido con vLLM (temperatura 0, salida JSON estructurada, una llamada por clase) sobre el codigo JADX sin comentarios; el esquema JSON tiene nueve booleanos y solo siete (o dos) se alimentan al GAT. El corpus de las variantes `verdict` y `verdict_behavior` es de 2.166 aplicaciones benignas y 213 de ransomware (ratio 10,2:1); la variante `embedding` usa 502 benignas y 213 de ransomware. Las seis familias cubiertas son de 2014 a 2020, y las benignas provienen de Google Play del mismo periodo.

## Capacidades

- Clasificacion binaria de APKs Android en ransomware o benigno a partir del grafo de llamadas entre clases.
- Tres modos de representacion de nodos: veredicto LLM de 2 bits, veredicto mas comportamiento de 7 bits, y embeddings de codigo de 768 dimensiones.
- Evaluacion por familia retenida: cada checkpoint esta entrenado sin una familia y evaluado sobre ella con una muestra benigna de igual tamano.
- Reproduccion de los experimentos de la tesis: semilla, configuracion y metricas quedan registradas en `bundle.json` y `metrics.json`.
- No genera texto, no soporta tool calling, no implementa agentes ni razonamiento multi-paso.
- No procesa lenguaje natural ni imagenes; su entrada son exclusivamente grafos con el formato y el orden de columnas especificados.
- Sensible al pipeline de caracteristicas: las variantes `verdict` y `verdict_behavior` solo funcionan con bits producidos por el mismo paso upstream (Gemma con el prompt `v3_evidence`); caracteristicas de otro modelo, de otro prompt o codigo en bruto producen salidas sin sentido.

## Casos de uso

- Reproduccion de la tesis: cargar cada checkpoint con su `bundle.json` y volver a obtener las metricas de `metrics.json`, verificando la paridad del pipeline completo (descompilacion, extraccion de grafo, features y clasificacion).
- Extension del esquema leave-one-out a familias nuevas: reentrenar las seis particiones incorporando una familia adicional y medir si el patron de degradacion observado se mantiene.
- Estudio de ingenieria de caracteristicas: comparar de forma controlada la rama `verdict_behavior` (etiquetas semanticas de un LLM) con la rama `embedding` (CodeRankEmbed) manteniendo fijo el clasificador, para aislar la contribucion del LLM.
- Analisis de sensibilidad al prompt: sustituir el prompt `v3_evidence` por variantes y medir el efecto sobre macro-F1 de cada fold, aprovechando que los grafos son reutilizables y solo cambia el paso de extraccion.
- Docencia en deteccion de malware: usar los 18 checkpoints como caso practico de evaluacion con clases desbalanceadas, umbral fijo y fold pequenos, incluyendo el fold `blackroselucy` como ejemplo de resultado no concluyente.
- Investigacion sobre coste computacional: cuantificar el coste por APK de llamar a un LLM una vez por clase frente a calcular embeddings, usando el numero de nodos del grafo como variable.
- Punto de partida para transferencia: adaptar la cabeza de clasificacion a otra tarea a nivel de grafo de clases (por ejemplo, otro tipo de malware) reutilizando el extractor de grafos.
- Auditoria metodologica: revisar como un fold con n=12 o n=10 produce macro-F1 de 1,000 sin evidencia estadistica suficiente, un caso util para discutir validacion en conjuntos muy pequenos.

## Benchmarks y rendimiento

Resultados de test publicados en la model card (evaluacion *family-leave-one-out*, conjunto de test = familia retenida mas el mismo numero de aplicaciones benignas). Se reproduce la mejor semilla de cada fold.

| Variante | Fold retenido | Semilla | macro-F1 test | AUROC test | n test |
|---|---|---|---|---|---|
| verdict_behavior | wipelocker | 42 | 1.000 | 1.000 | 140 |
| verdict_behavior | simplelocker | 44 | 0.824 | 0.940 | 128 |
| verdict_behavior | wannalocker | 43 | 0.961 | 0.988 | 102 |
| verdict_behavior | blackroselucy | 44 | 0.333 | 0.059 | 34 |
| verdict_behavior | pletor | 44 | 1.000 | 1.000 | 12 |
| verdict_behavior | filecoder | 42 | 1.000 | 1.000 | 10 |
| verdict | wipelocker | 42 | 1.000 | 1.000 | 140 |
| verdict | simplelocker | 44 | 0.764 | 0.909 | 128 |
| verdict | wannalocker | 44 | 0.922 | 0.963 | 102 |
| verdict | blackroselucy | 44 | 1.000 | 1.000 | 34 |
| verdict | pletor | 43 | 1.000 | 1.000 | 12 |
| verdict | filecoder | 44 | 1.000 | 1.000 | 10 |
| embedding | wipelocker | 44 | 0.483 | 0.830 | 140 |
| embedding | simplelocker | 44 | 0.772 | 0.775 | 128 |
| embedding | wannalocker | 42 | 0.434 | 0.755 | 102 |
| embedding | blackroselucy | 43 | 0.333 | 0.872 | 34 |
| embedding | pletor | 42 | 1.000 | 1.000 | 12 |
| embedding | filecoder | 42 | 0.333 | 1.000 | 10 |

Notas aportadas por el autor: un macro-F1 de 0,333 indica que el modelo no marco nada o lo marco todo en ese fold; los folds con pocos APKs (pletor, filecoder, blackroselucy) aportan poca evidencia. No se publican resultados de MMLU, HumanEval, GSM8K ni ningun benchmark de modelos de lenguaje, porque el modelo no es un LLM.

## Requisitos de hardware

- El clasificador en si es muy pequeno (4 capas de 256 canales), por lo que la inferencia cabe holgadamente en CPU y en cualquier GPU consumer; no se publican cifras de VRAM ni de latencia.
- El coste real del pipeline esta en la extraccion de caracteristicas: la variante `verdict` y `verdict_behavior` requiere una llamada a `google/gemma-4-E4B-it` por cada clase del APK, servida con vLLM, con salida estructurada y `max_model_len` 8192. No se especifica la GPU necesaria para ese paso.
- La variante `embedding` requiere calcular un vector de 768 dimensiones por clase con `nomic-ai/CodeRankEmbed`.
- Opciones de despliegue: PyTorch + PyTorch Geometric para el GAT; vLLM para el LLM upstream. No se documentan integraciones con llama.cpp, Ollama ni TGI (los checkpoints son `.ckpt` de Lightning, no GGUF).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se proporcionan modelos externos comparables en la informacion disponible. La unica comparacion con datos es interna, entre las tres variantes de caracteristicas del mismo trabajo:

| Variante | Dimensionalidad de nodo | Origen de las caracteristicas | macro-F1 medio en folds con n >= 100 (wipelocker, simplelocker, wannalocker) |
|---|---|---|---|
| verdict_behavior | 7 | Veredicto y comportamiento de `google/gemma-4-E4B-it` | 0.928 |
| verdict | 2 | Veredicto de `google/gemma-4-E4B-it` | 0.895 |
| embedding | 768 | `nomic-ai/CodeRankEmbed` | 0.563 |

La media de la ultima columna es un calculo sobre los datos publicados en la model card, no una cifra aportada por el autor. Para modelos comparables de deteccion de malware Android con GNN, no disponible.

## Limitaciones y advertencias

- No es un detector utilizable en produccion. Los 18 checkpoints reproducen un experimento leave-one-out; cada uno fue entrenado sin la familia sobre la que se evalua y con un hold-out equilibrado, mientras que en trafico real las aplicaciones benignas superan al ransomware en ordenes de magnitud.
- El umbral de decision es 0,5 y nunca se ajusto ni se calibraron las probabilidades.
- Los folds con n=12 y n=10 (pletor, filecoder) no permiten extraer conclusiones; el resultado de 1,000 en esos casos es anecdota.
- El fold `blackroselucy` de `verdict_behavior` obtiene AUROC 0,059, es decir, muy por debajo del azar.
- Las variantes `verdict` y `verdict_behavior` solo son validas con caracteristicas generadas por el mismo paso upstream (Gemma 4 E4B con el prompt `v3_evidence`). Otra version del modelo, otro prompt o codigo en bruto producen salidas sin significado.
- Cobertura temporal y de familias limitada: seis familias de ransomware de 2014 a 2020 y aplicaciones de Google Play del mismo periodo. Otros tipos de malware y ransomware mas reciente quedan fuera del dominio de entrenamiento.
- El esquema de validacion no mide generalizacion a familias completamente nuevas en un sentido amplio, sino a una familia concreta retenida por fold.
- No se documentan sesgos especificos, comportamiento multilingue ni evaluaciones de robustez frente a ofuscacion, y no hay informacion sobre cuantizacion ni sobre rendimiento en produccion.
- Licencia MIT: permite uso comercial y modificacion, pero eso no convierte el artefacto en apto para decision automatica sobre aplicaciones.

## Enlaces

- HuggingFace: https://huggingface.co/JLB-JLB/android-ransomware-gat
- Tesis referenciada: *Ransomware Detection using Graph Neural Networks Enhanced by Large Language Models*, Joscha Lasse Bisping, TU Berlin (no se proporciona URL).
- Modelo upstream de caracteristicas de veredicto: `google/gemma-4-E4B-it` (identificador tal como aparece en la model card; no verificado).
- Modelo upstream de embeddings de codigo: https://huggingface.co/nomic-ai/CodeRankEmbed
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos corresponden a empresas y marcas homonimas sin relacion con el proyecto.
