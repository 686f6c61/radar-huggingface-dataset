# Albert2109/qwen2.5-coder-3b-sqlite-uk-lora

## Resumen

El modelo `Albert2109/qwen2.5-coder-3b-sqlite-uk-lora` es un adaptador LoRA (entrenado con QLoRA en 4 bits NF4) sobre el modelo base `Qwen/Qwen2.5-Coder-3B-Instruct`, desarrollado por el usuario Albert2109. Su propósito es especializar un modelo de código de 3.000 millones de parámetros en la generación de SQL para el motor SQLite, con soporte bilingüe ucraniano-inglés. El adaptador se publica como un repositorio PEFT de aproximadamente 0,1 GB, lo que refleja que solo contiene los pesos incrementales del adaptador y no el modelo completo.

El problema que aborda es concreto: la traducción de lenguaje natural a SQL (text-to-SQL) específicamente para SQLite, un dialecto con particularidades propias (tipado dinámico, sintaxis de `AUTOINCREMENT`, triggers y `PRAGMA`) que los modelos generalistas suelen confundir con PostgreSQL o MySQL. El adaptador cubre sentencias `SELECT`, DDL, DML, triggers e índices, e incluye diálogos de autocorrección en dos turnos, lo que permite al modelo revisar y reparar su propia consulta ante errores de ejecución.

Es relevante por su tamaño reducido (3B parámetros) y su enfoque en un nicho poco atendido: la combinación de dialecto SQLite, idioma ucraniano y un bucle de autocorrección validado por ejecución. El autor reporta una tasa de coincidencia de ejecución en test del 82,5 % y un 100 % de validez sintáctica SQLite tras la autocorrección, si bien estos datos provienen únicamente de la model card y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-3B-Instruct); adaptador LoRA sobre atención y proyecciones |
| Parametros totales | 3B en el modelo base; 0,96 % de parámetros entrenables en el adaptador (QLoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 (QLoRA); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | Ucraniano (uk), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-Coder-3B-Instruct`, un transformer decoder-only de 3.000 millones de parámetros especializado en código. El ajuste se realizó con QLoRA: el modelo base se cuantizó a 4 bits NF4 y se entrenaron adaptadores de bajo rango con `r=16`, `lora_alpha=32` y `lora_dropout=0.05`, lo que supone un 0,96 % de parámetros entrenables. El entrenamiento consistió en 200 pasos durante 1 época, con una pérdida de validación final de 0,2777.

El conjunto de datos consta de 1.600 ejemplos validados de SQLite que cubren `SELECT`, DDL, DML, triggers e índices, en ucraniano e inglés. Destaca la inclusión de diálogos de autocorrección de dos turnos: el modelo genera una consulta, recibe el error de ejecución y produce una versión corregida, lo que entrena explícitamente el bucle de reparación. La validación reportada combina una coincidencia de ejecución en test del 82,5 % y una validez sintáctica SQLite del 100 % tras la autocorrección. No se especifican en la información disponible la composición exacta del dataset, la procedencia de los ejemplos ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de consultas SQLite a partir de lenguaje natural en ucraniano e inglés (`SELECT`, DDL, DML, triggers, índices).
- Autocorrección en dos turnos: dado un error de ejecución, el modelo reformula la consulta hasta obtener una sentencia válida para SQLite.
- Comprensión de esquemas de base de datos expresados en el prompt (tablas, columnas, tipos).
- Generación de DDL: creación de tablas, índices y triggers con sintaxis específica de SQLite.
- Operaciones DML: `INSERT`, `UPDATE`, `DELETE` con condiciones en lenguaje natural.
- Capacidades heredadas del modelo base Qwen2.5-Coder-3B-Instruct (generación de código general, razonamiento sobre código), aunque el adaptador está orientado a SQLite y no se documenta su preservación.
- Soporte de tool calling y agentes: no disponible en la información proporcionada para el adaptador.
- Capacidades multimodales o de audio: no disponibles.

## Casos de uso

- **Asistentes de consulta sobre bases de datos SQLite embebidas**: aplicaciones de escritorio o móviles que usan SQLite como almacenamiento local pueden integrar el adaptador para que el usuario formule preguntas en ucraniano o inglés y obtenga la consulta SQL lista para ejecutar, con el bucle de autocorrección corrigiendo errores de sintaxis antes de mostrarla.
- **Generación de migraciones y DDL**: el adaptador produce sentencias `CREATE TABLE`, `CREATE INDEX` y `CREATE TRIGGER` con la sintaxis correcta de SQLite, útil en pipelines de inicialización de esquemas o en herramientas de gestión de bases de datos ligeras.
- **Autocorrección de consultas en producción**: gracias al entrenamiento con diálogos de reparación, el modelo puede recibir el mensaje de error de SQLite y regenerar la consulta; encaja en un middleware que reintente la ejecución una o dos veces antes de escalar al usuario.
- **Herramientas de análisis para hablantes de ucraniano**: organizaciones que trabajan con datos en ucraniano pueden ofrecer una interfaz text-to-SQL sin depender de modelos multilingües grandes, reduciendo coste de inferencia al operar sobre un modelo de 3B.
- **Generación de datos de prueba**: el adaptador puede producir inserciones `INSERT` y datos de ejemplo coherentes con un esquema dado, útil para poblar bases de datos de test en desarrollo.
- **Educación y formación en SQL**: un tutor que traduzca enunciados en lenguaje natural a SQLite y explique la corrección de errores, aprovechando el formato de diálogo de dos turnos con el que fue entrenado.
- **Prototipado rápido de agentes de datos**: al ser un adaptador ligero sobre un modelo de 3B, se puede desplegar en una sola GPU consumer para experimentar con flujos text-to-SQL antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y no han sido verificados de forma independiente:

| Metrica | Valor reportado |
|---|---|
| Pérdida de validación | 0,2777 (200 pasos, 1 época) |
| Coincidencia de ejecución en test (execution match) | 82,5 % |
| Validez SQLite tras autocorrección | 100,0 % |
| Parámetros entrenables | 0,96 % del total |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, Spider, BIRD) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el adaptador en sí ocupa ~0,1 GB; el modelo base de 3B en FP16 requiere aproximadamente 6-7 GB de VRAM, en 8 bits unos 3,5-4 GB y en 4 bits unos 2-2,5 GB. Cifras estimadas a partir del tamaño del modelo base, no publicadas por el autor.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- **GPU consumer**: sí, cabe en GPUs consumer con 8 GB o más en cuantización de 4 u 8 bits; en FP16 requiere al menos 8 GB.
- **Opciones de despliegue**: el adaptador es PEFT, por lo que se carga con la librería `peft` sobre el modelo base en Transformers. Para servir en producción puede fusionarse con el modelo base y exportarse a vLLM o TGI; también puede convertirse a GGUF para llama.cpp u Ollama, aunque no se documenta el procedimiento en la información disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Albert2109/qwen2.5-coder-3b-sqlite-uk-lora | 3B (base) + adaptador LoRA | no disponible | SQLite text-to-SQL, uk/en, autocorrección | no disponible | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3B | no disponible en esta ficha | Código general, multilingüe | no disponible en esta ficha | Hugging Face |
| Adaptadores text-to-SQL genéricos (p. ej. sobre Llama o CodeLlama) | variable | variable | SQL genérico (a menudo PostgreSQL/MySQL) | variable | Hugging Face |

La ventaja del adaptador frente al modelo base es la especialización en el dialecto SQLite y el bucle de autocorrección entrenado; su desventaja es que depende del modelo base y no se han publicado comparativas directas con otros adaptadores text-to-SQL.

## Limitaciones y advertencias

- **Datos no verificados**: las métricas de la model card (82,5 % de execution match, 100 % de validez tras autocorrección, pérdida 0,2777) provienen únicamente del autor y no hay evaluación independiente ni conjunto de test público documentado.
- **Dataset pequeño**: 1.600 ejemplos y una sola época de entrenamiento (200 pasos) limitan la cobertura de esquemas complejos, consultas anidadas, CTEs o `JOIN` múltiples, que no se mencionan explícitamente en la información disponible.
- **Idiomas**: solo ucraniano e inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- **Dialecto restringido**: el adaptador está entrenado para SQLite; puede producir SQL inválido en PostgreSQL, MySQL o SQL Server.
- **Licencia no disponible**: no se especifica la licencia del adaptador, lo que impide confirmar si se permite uso comercial. Además, la licencia del modelo base (Qwen) debe respetarse por separado.
- **Riesgo de alucinación**: como todo modelo generativo, puede inventar tablas, columnas o funciones de SQLite inexistentes; la validación por ejecución es imprescindible en producción.
- **Sesgos**: no se documentan análisis de sesgo; al entrenarse en ucraniano e inglés, puede tener un rendimiento desigual entre ambos idiomas.
- **Dependencia del modelo base**: requiere descargar `Qwen/Qwen2.5-Coder-3B-Instruct` por separado; el repositorio solo contiene los pesos del adaptador.
- **Madurez**: repositorio sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Albert2109/qwen2.5-coder-3b-sqlite-uk-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de SQLite: https://www.sqlite.org/docs.html
