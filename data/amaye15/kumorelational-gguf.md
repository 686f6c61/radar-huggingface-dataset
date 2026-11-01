# amaye15/kumorelational-gguf

## Resumen

Kumo-Relational GGUF es la conversión al formato GGUF del modelo fundacional tabular relacional Kumo-Relational de NVIDIA, realizada por el desarrollador independiente amaye15 mediante su herramienta zsfm-rs, un workspace en Rust que porta modelos fundacionales de forecasting y tabular zero-shot a GGUF y al framework Burn. El modelo resuelve tareas de clasificación tabular zero-shot sobre tablas relacionales: recibe una tabla de tarea junto con una o varias tablas relacionadas unidas por claves y devuelve probabilidades por clase para cada fila de consulta, sin necesidad de reentrenamiento.

La relevancia de esta conversión es eminentemente práctica: elimina la dependencia de PyTorch y del runtime de Python en inferencia, y el autor afirma que la salida es bit-exacta respecto al checkpoint original de PyTorch. Con 29.929.642 parámetros y un repositorio de 0,1 GB, es un modelo ligero que puede ejecutarse en entornos donde Python no está disponible o no se desea, como servicios escritos en Rust o pipelines embebidos.

La arquitectura combina embeddings de columna con codificación categórica y paso de mensajes tipo GNN sobre las relaciones entre tablas, con un número configurable de saltos (`num_hops`). El modelo solo está etiquetado para inglés y se distribuye con licencia MIT para el código de conversión y OpenMDW-1.1 para los pesos, lo que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional tabular relacional: embeddings de columna con codificación categórica y message-passing tipo GNN sobre relaciones entre tablas (hasta `num_hops` rondas) |
| Parametros totales | 29.929.642 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo opera sobre tablas, no sobre secuencias de texto; el tamaño viene determinado por el número de filas y columnas de soporte y consulta) |
| Tipos de cuantizacion | F32 (único fichero publicado: `kumorelational-classification-f32.gguf`) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Código de conversión: MIT; pesos: OpenMDW-1.1 (uso comercial permitido) |
| Formato de pesos | GGUF (F32); el GGUF embebe sus propios metadatos de arquitectura, sin necesidad de `config.json` |

## Arquitectura y entrenamiento

Kumo-Relational es un modelo fundacional tabular relacional pensado para razonar sobre una tabla de tarea más una o varias tablas relacionadas unidas por claves. La entrada admite celdas de tipo mixto (números, cadenas y nulos). El encoder aplica embeddings de columna con codificación categórica y después ejecuta paso de mensajes tipo GNN a través de las relaciones declaradas, con un número de saltos configurable mediante `num_hops`. La salida es, en clasificación, un vector de probabilidades por clase para cada fila de consulta; en regresión, 999 cuantiles por fila.

La conversión a GGUF se realiza con zsfm-rs, un workspace en Rust que porta modelos fundacionales zero-shot a GGUF y Burn. El autor declara verificación bit-exacta frente al checkpoint original de PyTorch. No se dispone de información sobre el volumen de tokens o datasets de entrenamiento originales, ni sobre si NVIDIA aplicó RLHF, DPO u otras fases de ajuste, ya que la model card de esta conversión no los detalla.

## Capacidades

- Clasificación tabular zero-shot sobre tablas relacionales, devolviendo etiquetas de clase y probabilidades por fila.
- Regresión tabular con salida de 999 cuantiles por fila de consulta (según la model card).
- Razonamiento sobre múltiples tablas unidas por relaciones declaradas explícitamente (`relationships`), con control del número de saltos de propagación (`num_hops`).
- Manejo de celdas de tipo mixto: columnas numéricas, categóricas (cadenas) y valores nulos.
- Configuración de claves de unión mediante `id_columns` y enlace entre la tabla de tarea y las tablas relacionadas mediante `task_link`.
- Control de aleatoriedad mediante `seed` y del número de estimadores mediante `estimators`.
- Inferencia sin PyTorch ni runtime de Python, tanto desde Python (`pip install zsfm`) como desde Rust/CLI (`cargo install zsfm`).
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales: es un modelo estrictamente tabular.

## Casos de uso

- Scoring de riesgo en entornos Rust: un servicio backend escrito en Rust puede cargar el GGUF y obtener probabilidades por clase sin incorporar un runtime de Python, usando `zsfm kumorelational infer` o la API de la librería.
- Predicción de churn con datos relacionales: se declara una tabla de tarea (por ejemplo, pedidos) y una tabla relacionada de usuarios unida por `user_id`, y el modelo propaga información entre ambas para estimar la probabilidad de abandono por cliente.
- Enriquecimiento de pipelines ETL: tras un join entre tablas, se puede invocar el modelo sobre las filas resultantes para etiquetar registros con una clase predicha y su probabilidad, integrándolo como etapa de un proceso batch.
- Prototipado rápido de modelos tabulares sin entrenamiento: al ser zero-shot, permite obtener una línea base de clasificación sobre un nuevo conjunto de datos con solo aportar filas de soporte etiquetadas, sin ajuste de pesos.
- Despliegue en entornos con restricciones de dependencias: al no requerir PyTorch, encaja en contenedores mínimos o sistemas embebidos donde el tamaño del stack de Python es un problema; el repositorio ocupa 0,1 GB en F32.
- Evaluación comparativa de modelos fundacionales tabulares: sirve para contrastar el rendimiento zero-shot de Kumo-Relational frente a alternativas en tareas de clasificación relacional, usando el mismo protocolo de soporte/consulta.
- Análisis de datos con relaciones múltiples: escenarios con varias tablas enlazadas (por ejemplo, usuarios, pedidos y productos) donde `num_hops` permite controlar cuánta información relacional se propaga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 29,9 millones de parámetros en F32, los pesos ocupan aproximadamente 120 MB; la memoria adicional depende del tamaño de las tablas de soporte y consulta y del número de saltos.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, el modelo es apto para GPUs de consumo, aunque la model card no detalla requisitos de GPU.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros, siempre que el backend Burn utilizado soporte el hardware objetivo; no se detallan modelos concretos.
- Opciones de despliegue: `zsfm` (Python, `pip install zsfm`) y `zsfm` CLI/Rust (`cargo install zsfm`), ambos sobre GGUF y Burn. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo tabular.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Kumo-Relational GGUF (amaye15) | 29,9 M | No disponible (tabular) | Clasificación/regresión tabular relacional zero-shot | MIT (código) / OpenMDW-1.1 (pesos) | GGUF |
| NVIDIA Kumo-Relational (original) | No disponible en la información | No disponible (tabular) | Clasificación/regresión tabular relacional zero-shot | OpenMDW-1.1 | PyTorch |
| Otros modelos fundacionales tabulares | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación directa documentada es con el checkpoint original de NVIDIA, del que esta conversión es funcionalmente equivalente según el autor (verificación bit-exacta). No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo estrictamente tabular: no genera texto, no hace tool calling ni razonamiento en lenguaje natural; no debe evaluarse con benchmarks de LLM.
- Solo etiquetado para inglés; no se documenta soporte multilingüe.
- Solo se publica una cuantización F32 para clasificación; no hay variantes cuantizadas ni fichero de regresión en el repositorio.
- El rendimiento depende críticamente de la declaración correcta de relaciones, claves de unión (`id_columns`, `task_link`) y del valor de `num_hops`; una especificación errónea del esquema produce resultados inválidos.
- La verificación bit-exacta es una afirmación del autor de la conversión; no se aportan en la información logs ni scripts de verificación reproducibles.
- No se documentan sesgos del modelo original ni tasas de error en la model card de esta conversión.
- Riesgo de extrapolación fuera de distribución si las tablas de consulta difieren mucho de las de soporte; al ser zero-shot, la calidad depende de la representatividad de las filas de soporte etiquetadas.
- Licencia de los pesos OpenMDW-1.1: permite uso comercial según la model card, pero conviene revisar los términos completos de OpenMDW-1.1 antes de un despliegue en producción.
- Repositorio con 36 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amaye15/kumorelational-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Kumo-Relational
- Repositorio zsfm-rs: https://github.com/amaye15/zsfm-rs
- Framework Burn: https://github.com/tracel-ai/burn
