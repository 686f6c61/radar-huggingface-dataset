# AaronTekle/PySparkQwen

## Resumen

PySparkQwen es un adaptador LoRA (QLoRA) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por AaronTekle y publicado en Hugging Face. Su propósito es especializar un modelo pequeño de lenguaje en la generación de código PySpark y Apache Spark para tareas cotidianas de ingeniería de datos: manipulación de DataFrames, joins, Spark SQL, structured streaming, Delta Lake, optimización, MLlib y tipos complejos. El modelo recibe como entrada una tarea en lenguaje natural junto con el contexto del esquema del DataFrame (nombres de columnas y tipos) y devuelve el código Spark correspondiente.

La relevancia del proyecto es doble. Por un lado, demuestra que un ajuste fino parametralmente eficiente con 4 bits y adaptadores LoRA puede transformar un modelo de 1.700 millones de parámetros en un generador de código de dominio específico con recursos muy modestos (el repositorio ocupa 0,1 GB y solo se entrenaron 17.432.576 parámetros, el 1,0030 % del total). Por otro, ofrece una alternativa ligera y desplegable en local frente a modelos generalistas mucho mayores para una tarea concreta y repetitiva en pipelines de datos.

El modelo se distribuye exclusivamente como adaptador PEFT en formato safetensors, requiere cargar el modelo base Qwen3-1.7B y está pensado para prompts en inglés. No se ha publicado información sobre la licencia del adaptador ni resultados de benchmarks estandarizados (MMLU, HumanEval, etc.); la evaluación disponible se limita a métricas internas sobre un conjunto de test sintético de 150 tareas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptadores LoRA sobre proyecciones de atención y feed-forward |
| Parámetros totales | 1.738.007.552 (modelo base más adaptadores; 17.432.576 entrenables, 1,0030 %) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B; no especificada en la información) |
| Tipos de cuantización | Base cargado en 4-bit NF4 con doble cuantización durante el entrenamiento; el adaptador se publica en safetensors sin cuantizar |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino QLoRA del transformer decoder-only Qwen3-1.7B. Durante el entrenamiento, el modelo base se cargó con cuantización de 4 bits NF4 y doble cuantización, manteniéndose congelado, y se entrenaron adaptadores LoRA de bajo rango sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con TRL `SFTTrainer` sobre Transformers, PEFT, bitsandbytes y PyTorch, con tarea de causal language modeling. El resultado es un adaptador PEFT que debe combinarse con el modelo base para su uso.

El dataset de entrenamiento es sintético y generado localmente: 900 ejemplos en total (600 de entrenamiento, 150 de validación y 150 de test reservado), distribuidos en 15 categorías de tareas PySpark y 180 familias de algoritmos. Las categorías cubren transformaciones de DataFrame, ingesta y formatos de fichero, limpieza y preprocesado, filtrado/ordenación/agregación, joins y ventanas, Spark SQL, UDFs y Pandas UDFs, structured streaming, optimización de rendimiento, particionado y reparticionado, MLlib, tipos anidados y complejos, depuración, Delta Lake y ejecución distribuida en clúster. Los 900 fragmentos de referencia pasaron el parseo sintáctico con el AST de Python. La curva de pérdida muestra sobreajuste a partir de la segunda época: la pérdida de entrenamiento baja de 0,1145 a 0,0098 entre las épocas 1 y 3, mientras la de validación sube de 0,5008 a 0,6047.

## Capacidades

- Generación de código PySpark y Spark a partir de una tarea en lenguaje natural y del contexto de esquema del DataFrame.
- Manipulación de DataFrames: agregaciones, filtros, ordenaciones, joins, funciones de ventana y transformaciones de columnas.
- Spark SQL y consultas declarativas.
- Ingesta y escritura en distintos formatos de fichero.
- Limpieza y preprocesado de datos.
- UDFs y Pandas UDFs.
- Structured streaming.
- Operaciones sobre Delta Lake.
- Técnicas de optimización y particionado/reparticionado.
- MLlib para tareas de machine learning distribuido.
- Manejo de tipos anidados y complejos.
- Depuración de código y ejecución distribuida en clúster.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponible; la evaluación se realizó con prompts no-thinking.

## Casos de uso

- Asistente de ingeniería de datos en el IDE: el modelo recibe el esquema de un DataFrame y una descripción de la transformación deseada, y devuelve el código PySpark listo para revisar. Es adecuado por su especialización en las 15 categorías de tareas Spark y por su bajo coste de inferencia.
- Generación de pipelines ETL: a partir de la descripción de las fuentes y los destinos, el modelo puede proponer el código de ingesta, limpieza y escritura en Delta Lake, cubriendo las fases típicas de un pipeline.
- Migración de lógica SQL a PySpark: dado un esquema y una consulta, el modelo puede generar la versión DataFrame equivalente, útil en procesos de modernización de plataformas de datos.
- Documentación y ejemplos de código para equipos: generación de fragmentos de referencia para Spark SQL, structured streaming o MLlib que sirvan como punto de partida en formación interna.
- Automatización de tareas repetitivas de transformación: agregaciones, joins y ventanas que se repiten con distintos esquemas, donde el modelo puede generar el código a partir del contexto de columnas.
- Prototipado rápido en notebooks: al ser un adaptador de 0,1 GB sobre un modelo de 1,7B, puede ejecutarse en local para explorar soluciones sin depender de APIs externas.
- Generación de código para optimización y particionado: el modelo cubre explícitamente técnicas de rendimiento y reparticionado, útil para revisar y proponer mejoras en jobs existentes.

## Benchmarks y rendimiento

La única evaluación publicada es interna, sobre 150 tareas sintéticas reservadas, con prompts no-thinking, decodificación greedy y un máximo de 384 tokens nuevos. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Métrica | Qwen3-1.7B base | Qwen3-1.7B + adaptador PySpark |
|---|---:|---:|
| Salidas sintácticamente válidas (AST de Python) | 58,67 % (88/150) | 95,33 % (143/150) |
| Similitud media de secuencia de caracteres con la referencia | 0,1009 | 0,6354 |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,1 GB; el modelo base Qwen3-1.7B en 4 bits requiere del orden de 1-2 GB, y en fp16 alrededor de 3,5 GB. No se dispone de cifras oficiales de VRAM publicadas por el autor.
- GPU recomendadas: no disponible en la información; por tamaño, el modelo es apto para GPU de consumo.
- Cabe en GPU de consumo: sí, por el tamaño del modelo base (1,7B) y del adaptador; no se especifican modelos concretos.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con Transformers + PEFT sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas oficiales con otros modelos en la información proporcionada. Como referencia estructural, se compara con el modelo base del que deriva y con la alternativa de usar el base sin ajustar:

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PySparkQwen (este modelo) | 1,7B + adaptador LoRA (17,4M entrenables) | no disponible | PySpark/Spark | no disponible | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Generalista | no disponible | Hugging Face |
| Alternativas de generación de código Spark | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Riesgo de alucinación: el propio autor advierte que, si no se proporciona contexto suficiente, el modelo puede inventar columnas, tablas, rutas de fichero o dependencias.
- Sobreajuste: la pérdida de validación aumenta a partir de la época 2 (0,5008 en la época 1, 0,5720 en la 2 y 0,6047 en la 3), lo que sugiere un ajuste excesivo al dataset sintético.
- Validación limitada: el entrenamiento usó 600 ejemplos sintéticos de 120 familias de algoritmos y el modelo no ha sido validado en producción, según el propio autor.
- Dominio restringido: está especializado en PySpark/Spark; su rendimiento en otras tareas de código o lenguaje general no está documentado y probablemente sea inferior al del modelo base.
- Idioma: solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Licencia: no disponible; no se puede confirmar si permite uso comercial.
- Formato: se distribuye únicamente como adaptador PEFT, por lo que requiere cargar el modelo base Qwen3-1.7B y las librerías Transformers, PEFT y bitsandbytes para su uso.
- Evaluación: las métricas publicadas son internas (AST y similitud de caracteres) sobre un test sintético, no benchmarks estándar, y no son directamente comparables con resultados de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AaronTekle/PySparkQwen
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper de Qwen3 (referenciado en los tags): https://arxiv.org/abs/2505.09388
- Paper de LoRA (referenciado en los tags): https://arxiv.org/abs/2106.09685
- Paper de QLoRA (referenciado en los tags): https://arxiv.org/abs/2305.14314
- Artículo sobre estrategias de decodificación (greedy decoding): https://machinelearningmastery.com/decoding-strategies-and-output-control/
