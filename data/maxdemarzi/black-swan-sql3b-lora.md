# maxdemarzi/black-swan-sql3b-lora

## Resumen

El modelo `maxdemarzi/black-swan-sql3b-lora` es un adaptador LoRA de ajuste fino supervisado (SFT) desarrollado por Max De Marzi dentro del proyecto Black Swan. Su función es generar consultas SQL para DuckDB a partir de un esquema de base de datos y una pregunta en lenguaje natural. Forma parte de un pipeline de dos etapas para conversión de texto a PyRel: este adaptador emite SQL, y un transpilador determinista lo convierte al lenguaje intermedio PyRel. Está construido sobre el modelo base `Qwen/Qwen2.5-Coder-3B-Instruct`, con una configuración LoRA de rango 32 y alpha 64. El adaptador ocupa 0.1 GB y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en que permite comparar dos estrategias de generación de programas: emitir directamente PyRel o emitir SQL y luego transpilarlo. Los resultados en el conjunto de validación de BIRD muestran que el enfoque SQL→transpilador no es significativamente mejor que el directo, pero sí permite un enrutamiento que combina ambos brazos para mejorar la precisión global. El modelo requiere un prompt específico (incluido en el repositorio) y una decodificación greedy con temperatura cero para funcionar correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-3B-Instruct) con adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA de 0.1 GB sobre modelo base de 3B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=32, alpha=64) aplicado sobre `Qwen/Qwen2.5-Coder-3B-Instruct`, un transformer decoder-only con atención causal. El adaptador se entrenó mediante SFT sobre el conjunto de entrenamiento de BIRD, un benchmark de text-to-SQL. La receta de entrenamiento está fijada deliberadamente a una RTX 5090, ya que el autor observó que variaciones de hardware pueden mover el rendimiento en hasta 11 preguntas, un efecto mayor que el que se pretende medir. El modelo no incorpora razonamiento explícito (reasoning off); la generación es greedy con temperatura 0 y un máximo de 4096 tokens nuevos. El prompt es parte integral del modelo: se debe usar el `ARCTIC_SYSTEM` incluido en el repositorio y la plantilla de usuario Arctic con los campos `engine`, `db_details`, `question` y `output_format`. Cambiar el prompt del sistema degrada gravemente el comportamiento, hasta el punto de que el modelo puede emitir un lenguaje completamente distinto.

## Capacidades

- Generación de consultas SQL para DuckDB a partir de un esquema y una pregunta en lenguaje natural.
- Soporte de text-to-SQL con formato de salida en bloque SQL delimitado por vallas (fenced SQL block).
- Integración en un pipeline de dos etapas con un transpilador determinista que convierte SQL a PyRel.
- Generación de texto conversacional (heredada del modelo base), aunque el uso principal es text-to-SQL.
- No soporta tool calling ni function calling de forma nativa en este adaptador.
- No incluye modo de razonamiento (thinking mode); la generación es directa.
- Capacidades multilingües no documentadas; el prompt y los datos de entrenamiento están en inglés.

## Casos de uso

- Generación automatizada de consultas analíticas: un analista de datos puede formular preguntas en lenguaje natural sobre un esquema DuckDB y obtener SQL válido para ejecutar directamente, reduciendo el tiempo de escritura manual de consultas.
- Asistente de datos embebido en aplicaciones: integrar el modelo en una herramienta de BI o un cuaderno de análisis para que los usuarios no técnicos puedan consultar bases de datos sin conocer SQL.
- Pipeline de text-to-PyRel: usar este adaptador como primer brazo de un sistema que convierte lenguaje natural a programas PyRel, aprovechando el transpilador para obtener representaciones intermedias ejecutables.
- Enrutamiento de consultas: combinar este modelo con el adaptador directo a PyRel (black-swan-lora) y enrutar cada pregunta al brazo que tenga mayor probabilidad de éxito, logrando una precisión conjunta superior (48.1% en BIRD holdout).
- Evaluación de calidad de SQL: al ser un modelo pequeño (3B), puede usarse en entornos de prueba para validar la generación de SQL antes de desplegar modelos más grandes.
- Educación y formación: servir como ejemplo de adaptación LoRA para text-to-SQL, mostrando cómo un modelo pequeño puede alcanzar resultados razonables en un benchmark especializado.

## Benchmarks y rendimiento

El modelo se evaluó en el conjunto de validación de BIRD (428 preguntas puntuables), comparado con un adaptador hermano que emite PyRel directamente. Los resultados son los siguientes:

| Brazo | Correctas | Precisión | Comparación pareada vs PyRel |
|---|---|---|---|
| 3B → PyRel directo | 165/428 | 38.6% | — |
| 3B → SQL → transpilador (este adaptador) | 179/428 | 41.8% | +60/−46, p = 0.21 |
| Enrutado: SQL donde acierta, PyRel donde declina | 206/428 | 48.1% | +60/−19, p = 4.2e-06 |

La diferencia entre el brazo SQL y el directo no es estadísticamente significativa (p = 0.21). La descomposición de rendimiento es: precisión SQL del 44.3% multiplicada por la tasa de transpilación del 94.2% = 41.7% observado. Se registraron 0 salidas malformadas en 445 generaciones. El transpilador declinó 143 de 445 predicciones (32.1%) por falta de plantilla, lo que se considera una limitación del transpilador, no del modelo.

## Requisitos de hardware

- No se proporcionan datos específicos de VRAM para inferencia en la información disponible.
- El modelo base es Qwen2.5-Coder-3B-Instruct, que en cuantización FP16 requiere aproximadamente 6-7 GB de VRAM; el adaptador LoRA añade un coste mínimo (0.1 GB). Por tanto, es plausible que quepa en GPUs consumer como RTX 3060 (12 GB) o superiores, pero esto no está confirmado por el autor.
- El entrenamiento se realizó en una RTX 5090, según la model card.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la librería `peft` sobre el modelo base, o exportarse a formatos como GGUF para su uso con llama.cpp u Ollama, aunque no se documenta explícitamente.
- No se indican latencias ni throughput estimados.

## Comparativa con modelos similares

La comparativa principal es con el adaptador hermano `maxdemarzi/black-swan-lora`, que emite PyRel directamente sobre el mismo modelo base (Qwen2.5-Coder-1.5B-Instruct según la búsqueda web, aunque la model card de este adaptador no lo especifica). La tabla siguiente resume la comparación basada en los datos de la model card:

| Modelo | Enfoque | Precisión BIRD holdout | Dependencia externa |
|---|---|---|---|
| black-swan-sql3b-lora (este) | SQL → transpilador | 41.8% | sqlglot (obligatorio) |
| black-swan-lora (directo PyRel) | PyRel directo | 38.6% | no documentada |
| Enrutado de ambos | Mixto | 48.1% | ambas |

No se dispone de comparaciones con otros modelos text-to-SQL de la literatura (p. ej., CodeLlama, SQLCoder) en la información proporcionada.

## Limitaciones y advertencias

- El transpilador declina aproximadamente un tercio de las consultas (143 de 445) por falta de plantilla; esto no es un error del modelo sino una limitación del componente determinista.
- `sqlglot` es una dependencia dura y su ausencia es silenciosa: el transpilador captura el `ImportError` y devuelve `None`, lo que se interpreta como una declinación. Un despliegue sin sqlglot declinará el 100% de las peticiones y parecerá un transpilador que no puede manejar las consultas.
- El rendimiento no es significativamente superior al del adaptador directo a PyRel; la ventaja solo aparece con el enrutamiento.
- El prompt del sistema es parte integral del modelo; usar un prompt diferente degrada gravemente el comportamiento, hasta el punto de emitir un lenguaje distinto.
- El modelo se entrenó exclusivamente con datos de BIRD (train) y se evaluó en cuatro bases de datos específicas; su generalización a otros dominios o dialectos SQL no está garantizada.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en un corpus técnico en inglés, puede tener limitaciones en otros idiomas o dominios.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-3B-Instruct tiene su propia licencia (Apache 2.0 también), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/maxdemarzi/black-swan-sql3b-lora
- Proyecto PyRel (mencionado en la model card): https://github.com/maxdemarzi/swan
- Perfil del autor en HuggingFace: https://huggingface.co/maxdemarzi
- Adaptador hermano (directo a PyRel): https://huggingface.co/maxdemarzi/black-swan-lora
