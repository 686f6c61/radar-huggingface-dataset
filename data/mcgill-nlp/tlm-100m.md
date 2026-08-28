# McGill-NLP/TLM-100M

## Resumen

TLM-100M es un modelo de lenguaje de tipo *Tiered Language Model* (TLM) desarrollado por el grupo McGill-NLP de la Universidad McGill y Mila. Su característica principal es que un único conjunto de pesos expone dos niveles de comportamiento distintos: un nivel público (C1) accesible sin ninguna clave, y un nivel protegido (C2) que se activa aplicando una permutación secreta sobre aproximadamente el 5% de los parámetros (cabezas de atención y columnas MLP). Esta técnica, denominada *tiered alignment*, permite que el mismo modelo sirva para dos propósitos diferentes según se aplique o no la clave de permutación, que es auto-inversa, de modo que se puede alternar entre ambos niveles de forma bit-exacta.

El modelo sigue la arquitectura GPT-Neo con 16 capas, dimensión oculta de 480, 12 cabezas de atención y una ventana de contexto de 2048 tokens. Tiene 98.993.137 parámetros totales y fue entrenado con 9.900 millones de tokens del dataset FineWeb (partición *retain*). Forma parte de una escalera de modelos TLM que va desde 20M hasta 650M de parámetros, y su configuración arquitectónica está interpolada entre los peldaños de 60M y 90M de la escalera DataDecide (arXiv:2504.11393). Su relevancia radica en que propone un mecanismo novedoso de control de comportamiento mediante permutaciones, con posibles aplicaciones en seguridad, alineación y despliegue selectivo de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-Neo (transformer causal) con capas tiered |
| Parametros totales | 98.993.137 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (no se publican checkpoints cuantizados) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), config.json, tokenizer.json |

## Arquitectura y entrenamiento

TLM-100M utiliza una arquitectura transformer causal estándar tipo GPT-Neo, con 16 capas, dimensión oculta de 480, 12 cabezas de atención y factor de expansión MLP de 8. La ventana de contexto es de 2048 tokens. El tokenizador es el BPE de GPT-2 con un vocabulario de 50.257 tokens. La innovación principal no está en la arquitectura base, sino en el mecanismo de *tiered alignment*: se define una permutación sobre un subconjunto reducido de parámetros (5% del total, repartidos entre cabezas de atención y columnas MLP) que, al aplicarse, transforma el comportamiento del modelo de un nivel público (C1) a un nivel protegido (C2). La permutación es auto-inversa, por lo que aplicar la clave dos veces devuelve el modelo a su estado original de forma bit-exacta.

El entrenamiento se realizó con 9.900 millones de tokens (aproximadamente 100 veces el número de parámetros) procedentes del dataset FineWeb (partición *retain*). Se usaron 35.542 pasos de optimización con un batch global de 136 secuencias, una tasa de aprendizaje máxima de 5,1e-4 y un warmup de 1000 pasos. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación supervisada; el *tiered alignment* se logra mediante la permutación de pesos, no mediante entrenamiento adicional. El modelo se enmarca en la escalera DataDecide, interpolando entre los peldaños de 60M y 90M en escala log-lineal respecto al número total de parámetros (fracción 0,7153).

## Capacidades

- Generacion de texto: modelo causal de lenguaje capaz de producir texto coherente en ingles, dado el contexto de entrada.
- Razonamiento basico: al ser un modelo de 99M de parametros, su capacidad de razonamiento complejo es limitada, pero puede resolver tareas simples de lenguaje y seguir instrucciones cortas.
- Doble comportamiento (tiered): el modelo puede operar en dos niveles distintos (C1 publico y C2 con clave) usando los mismos pesos, lo que permite desplegar capacidades adicionales solo cuando se posee la clave de permutacion.
- Compatibilidad con transformers: se integra con la libreria transformers de HuggingFace, aunque requiere una clase personalizada (`GPTNeoForCausalLMTiered`) para cargar correctamente el bias del `lm_head`.
- Multilingue: no, solo ingles.
- Tool calling / function calling: no disponible.
- Agentes y multi-step reasoning: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion en alineacion de modelos: el mecanismo de tiered alignment permite estudiar como una permutacion de parametros puede cambiar el comportamiento de un modelo sin reentrenamiento, lo que resulta util para experimentos sobre control de capacidades y seguridad.
- Pruebas de seguridad y control de acceso: el nivel C2, activado por clave, podria usarse para habilitar funcionalidades restringidas solo para usuarios autorizados, mientras que el nivel C1 mantiene un comportamiento publico y seguro.
- Desarrollo de tecnicas de watermarking o marcado de modelos: la permutacion secreta podria servir como firma para identificar copias no autorizadas o para verificar la integridad de los pesos.
- Educacion y experimentacion en NLP: al ser un modelo pequeno (99M) y con licencia Apache-2.0, es adecuado para ensenar conceptos de transformers, entrenamiento y evaluacion en entornos academicos con recursos limitados.
- Baseline para estudios de escalado: al pertenecer a una escalera de modelos TLM, puede usarse como punto de referencia para ajustar curvas de escalado y comparar el efecto del tiered alignment en diferentes tamanos.
- Generacion de texto controlada en entornos de investigacion: el nivel C1 puede emplearse para tareas de generacion de texto estandar, mientras que el nivel C2 podria explorarse para comportamientos alternativos sin necesidad de mantener dos modelos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K u otras evaluaciones estandar. Tampoco se proporcionan comparaciones con modelos similares en terminos de rendimiento. Se recomienda consultar el repositorio de codigo o el articulo asociado (arXiv:2504.11393) para posibles evaluaciones adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 98.993.137 parametros, el modelo ocupa aproximadamente 400 MB en FP32, 200 MB en FP16 y 100 MB en int8. Cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas o de gama muy baja.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 3060, etc.) es suficiente. Tambien es viable la inferencia en CPU con un rendimiento aceptable para tareas de baja latencia.
- Compatibilidad con consumer GPU: si, es totalmente viable en GPUs de consumo, incluso en equipos sin GPU dedicada.
- Opciones de despliegue: al requerir una clase personalizada (`GPTNeoForCausalLMTiered`) y un fichero de clave (`key_5pct.json`), el despliegue con herramientas estandar como vLLM, llama.cpp u Ollama no es directo. Se recomienda usar la libreria transformers con el codigo proporcionado en el repositorio de tiered-language-models. Para el nivel C1 (sin clave), podria adaptarse a otras herramientas, pero la carga del bias del `lm_head` requiere la clase personalizada.
- Latencia y throughput: no se proporcionan datos especificos. Dado el tamano reducido, se espera una latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoria, ya que el tiered alignment es una tecnica novedosa y no existen modelos equivalentes publicados. Como referencia, se puede comparar con modelos densos de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TLM-100M | 98,99M | 2048 | Apache-2.0 | Tiered alignment, dos niveles de comportamiento |
| GPT-2 small | 124M | 1024 | MIT | Modelo clasico de referencia, sin tiered alignment |
| Pythia-70M | 70M | 2048 | Apache-2.0 | Modelo de la familia Pythia, entrenado en The Pile |

La comparacion con GPT-2 small o Pythia-70M es orientativa en cuanto a tamano y contexto, pero no refleja las diferencias arquitectonicas ni el proposito del tiered alignment. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Tamano reducido: con 99M de parametros, el modelo tiene una capacidad limitada para tareas complejas de razonamiento, generacion de codigo o comprension profunda. No es adecuado para produccion en tareas exigentes.
- Solo ingles: no soporta otros idiomas, lo que limita su uso en aplicaciones multilingues.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en contextos largos o ambiguos.
- Arquitectura personalizada: requiere el codigo especifico del repositorio tiered-language-models para cargar correctamente los pesos y aplicar la permutacion. Usar `AutoModelForCausalLM` estandar descartaria el bias del `lm_head`, degradando el rendimiento.
- Clave secreta: el nivel C2 solo es accesible con la clave `key_5pct.json`. Si la clave se pierde o se filtra, el control de acceso al nivel protegido se ve comprometido. Ademas, la seguridad del mecanismo depende de que la permutacion no sea deducible a partir de los pesos publicos.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento del modelo en tareas estandar, lo que dificulta evaluar su calidad relativa.
- Fecha de creacion futura: el modelo fue creado en agosto de 2026, lo que puede indicar que es un artefacto de investigacion reciente o experimental, con posible falta de madurez para uso general.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero el codigo asociado (permutation-alignment) puede tener condiciones adicionales; se recomienda revisar el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/McGill-NLP/TLM-100M
- Repositorio de codigo (tiered-language-models): https://github.com/McGill-NLP/tiered-language-models
- Repositorio de permutation-alignment: https://github.com/charbel08/permutation-alignment
- Articulo DataDecide (arXiv:2504.11393): https://arxiv.org/abs/2504.11393
- Grupo McGill-NLP: https://mcgill-nlp.github.io/
- Pagina del grupo en HuggingFace: https://huggingface.co/McGill-NLP
