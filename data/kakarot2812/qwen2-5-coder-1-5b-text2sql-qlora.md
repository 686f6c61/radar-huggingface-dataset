# Kakarot2812/qwen2.5-coder-1.5b-text2sql-qlora

## Resumen

`Kakarot2812/qwen2.5-coder-1.5b-text2sql-qlora` es un adaptador LoRA (entrenado con QLoRA de 4 bits) sobre el modelo instructivo `Qwen/Qwen2.5-Coder-1.5B-Instruct`, especializado en la tarea de text-to-SQL: traducir una pregunta en lenguaje natural junto con un esquema de base de datos a una consulta SQL ejecutable. Lo publica el usuario Kakarot2812 como experimento de ajuste fino parametralmente eficiente, y el repositorio contiene únicamente los pesos del adaptador, no una copia completa del modelo base.

El interés práctico del artefacto está en su relación coste/rendimiento: con solo 9,23 millones de parámetros entrenables (el 0,59 % del total) y una única época sobre 2.850 ejemplos, el autor reporta un salto en exact-match del 1,33 % (modelo base) al 69,33 % en su conjunto de evaluación de 150 ejemplos. Es una cifra modesta en términos absolutos y medida con una métrica laxa (comparación de cadenas normalizada, sin ejecutar la consulta), pero ilustra bien el patrón habitual en este tipo de ajustes: un modelo de 1.5B puede adquirir un sesgo fuerte hacia el formato SQL correcto con un coste de entrenamiento mínimo.

Es relevante ahora porque el ecosistema de modelos pequeños especializados en SQL (1.5B–7B) se está consolidando como alternativa a los LLM generalistas para asistentes de bases de datos, con opciones de despliegue en CPU/edge. No obstante, esta ficha debe leerse con cautela: el repositorio no declara licencia ni idiomas, el tamaño reportado es de 0,0 GB y la documentación es deliberadamente preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5), adaptador LoRA sobre el modelo base |
| Parametros totales | 1.500 millones aprox. (modelo base Qwen2.5-Coder-1.5B-Instruct); 9,23 M entrenables en el adaptador (0,59 %) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base segun la documentacion publica de Qwen; el ajuste fino se realizo con longitud maxima de secuencia de 1.024 tokens |
| Tipos de cuantizacion | Entrenamiento con QLoRA 4-bit (carga del modelo base cuantizado); pesos del adaptador en precision completa (safetensors). No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5-Coder-1.5B-Instruct soporta multiples lenguajes naturales y de programacion |
| Licencia | No disponible en el repositorio del adaptador; el modelo base Qwen2.5-Coder-1.5B-Instruct se distribuye bajo licencia Apache 2.0 segun la documentacion de Qwen |
| Formato de pesos | safetensors (adaptador LoRA/PEFT; requiere cargar el modelo base por separado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen2.5-Coder-1.5B-Instruct`, un transformer decoder-only de la familia Qwen2.5-Coder, que segun el informe tecnico de la serie (arXiv 2409.12186) continua el preentrenamiento sobre un corpus de mas de 5,5 billones de tokens con tecnicas de limpieza de datos y generacion de datos sinteticos. La variante de 1.5B comparte la arquitectura Qwen2.5 (atención con RoPE, capas densas, sin mezcla de expertos) y se distribuye ya alineada para instrucciones.

El ajuste fino usa QLoRA con carga del modelo base en 4 bits y los frameworks Unsloth y TRL. Hiperparametros declarados: 1 época, longitud máxima de secuencia de 1.024 tokens, rango LoRA 8, alpha 16, learning rate 2e-4. El dataset es `dipanjanS/text2sql-dataset`, del que se toma un subconjunto barajado de 3.000 ejemplos dividido con semilla 42 en 2.850 de entrenamiento y 150 de evaluación. No se documenta composición del dataset, plantilla de prompt exacta, ni si se aplicaron técnicas de enmascaramiento de pérdida sobre el esquema. La ventana de 1.024 tokens es la restricción de diseño más relevante: los esquemas que la excedan quedarán truncados.

## Capacidades

- Generación de consultas SQL a partir de una pregunta en lenguaje natural y un esquema de base de datos, que es la tarea objetivo del ajuste.
- Formato conversacional: hereda la plantilla de chat instructiva de Qwen2.5-Coder, por lo que admite turnos de sistema, usuario y asistente.
- Generación de código en sentido amplio (Python, JavaScript y otros), heredada del modelo base, aunque el ajuste no la refuerza.
- Razonamiento multi-paso limitado: el modelo base soporta cadenas de razonamiento cortas, pero el adaptador no fue entrenado con trazas de razonamiento explícitas.
- Tool calling / function calling: no documentado para este adaptador; el modelo base Qwen2.5-Coder-Instruct sí soporta function calling segun su documentación, pero el ajuste no lo preserva de forma verificada.
- Capacidades de agente: no documentadas.
- Multilingüismo: no documentado a nivel de adaptador; heredado del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistente interno de consultas sobre un data warehouse: el adaptador recibe el DDL de las tablas relevantes y la pregunta del analista, y devuelve una consulta SQL candidata que se valida contra el motor antes de ejecutarse. Adecuado por su tamaño reducido, que permite desplegarlo junto al motor analítico sin coste de GPU dedicada.
- Generación de SQL en herramientas de BI de autoservicio: integrado como paso previo a un validador sintáctico y a un limitador de filas, sirve para que usuarios no técnicos formulen preguntas en lenguaje natural sobre catálogos de datos acotados.
- Enriquecimiento de pipelines ETL asistidos: generación de borradores de consultas de transformación que un ingeniero revisa y promociona; el 69,33 % de exact-match implica que el flujo debe ser humano-en-el-bucle.
- Docencia y formación en SQL: el modelo traduce enunciados a consultas para compararlas con la solución del alumno, en un entorno donde los errores son aceptables y no hay ejecución destructiva.
- Generación de tests de regresión de esquemas: producir consultas candidatas sobre tablas de prueba en CI para comprobar que las migraciones no rompen el esquema.
- Prototipado rápido de interfaces de consulta sobre bases de datos pequeñas, con despliegue en CPU o en una GPU de consumo dentro de un portátil de desarrollo.
- Evaluación comparativa de técnicas de ajuste: sirve como referencia reproducible de QLoRA con Unsloth sobre un modelo de 1.5B, útil para investigadores que calibran presupuestos de entrenamiento.

## Benchmarks y rendimiento

Únicos datos publicados, en la model card del autor. Comparación de coincidencia exacta sobre 150 ejemplos reservados, tras pasar a minúsculas y normalizar espacios:

| Modelo | Aciertos exactos | Exact-match |
|---|---:|---:|
| Modelo base (Qwen2.5-Coder-1.5B-Instruct) | 2/150 | 1,33 % |
| Adaptador fine-tuned | 104/150 | 69,33 % |

Advertencias sobre la métrica, tal como las declara el propio autor: no mide corrección de ejecución de la consulta y las consultas lógicamente equivalentes pueden contarse como fallo. No se han publicado resultados en MMLU, HumanEval, GSM8K, Spider ni BIRD para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base fusionado con el adaptador: en torno a 3 GB en fp16/bf16, 1,6 GB en int8 y 0,9–1,2 GB en 4 bits (estimación a partir de los 1.500 M de parámetros; no publicada por el autor).
- Entrenamiento/inferencia del adaptador sin fusionar: el adaptador pesa del orden de decenas de MB, pero requiere cargar el modelo base completo en memoria.
- GPU recomendadas: cualquier GPU con 8 GB o más para fp16 (RTX 3060 Ti, RTX 4060, RTX 4070, L4, T4); A100/H100 no aportan ventaja significativa para este tamaño salvo por concurrencia.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6–8 GB de VRAM en cuantización de 8 o 4 bits, e incluso en CPU con llama.cpp tras fusionar el adaptador y convertir a GGUF.
- Opciones de despliegue: transformers + PEFT, Unsloth, vLLM (tras fusionar el adaptador), TGI, llama.cpp/Ollama (requiere fusionar y convertir), y ONNX Runtime GenAI para ejecución en CPU/edge, enfoque empleado por adaptadores equivalentes de la misma base.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Artefacto | Parametros | Contexto | Resultado text-to-SQL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Kakarot2812) | 1,5B (9,23 M entrenables) | 1.024 tokens de entrenamiento; 32.768 del base | 69,33 % exact-match (150 ejemplos, `dipanjanS/text2sql-dataset`) | No disponible en el adaptador; base Apache 2.0 | HuggingFace, repo de 0,0 GB |
| Modelo base Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens | 1,33 % exact-match con el mismo prompt | Apache 2.0 | HuggingFace |
| `spcv/qwen2.5_coder_text2sql_onnx` | 1,5B | No disponible | No disponible (ajustado sobre `trl-lab/SQaLe-text-to-SQL`) | No disponible | HuggingFace, export ONNX Runtime GenAI INT4 |
| `thanita47/text2sql-qlora-finetuning` (repo de experimento, no modelo) | 1,5B | No disponible | 72,8 % exact-match con entrenamiento schema-aware, frente a 11,7 % sin él | No disponible | GitHub |

Los tres artefactos parten de la misma base y atacan el mismo problema con QLoRA; la diferencia principal es el dataset, el tratamiento del esquema y el formato de exportación. Las cifras no son directamente comparables porque usan conjuntos de evaluación distintos.

## Limitaciones y advertencias

- La métrica de 69,33 % es de coincidencia exacta de cadenas, no de ejecución correcta: el rendimiento real en producción será inferior y no está medido.
- El entrenamiento usa solo 1 época sobre 2.850 ejemplos y una ventana de 1.024 tokens: los esquemas largos se truncan, lo que favorece la invención de tablas o columnas (fallo de alucinación de esquema documentado en experimentos equivalentes con la misma base).
- Riesgo de alucinación de identificadores SQL y de sintaxis específica de dialecto: no se documenta sobre qué motores (SQLite, PostgreSQL, MySQL) se entrenó.
- No hay información sobre sesgos; al ser un ajuste sobre código, puede reproducir sesgos de los corpus de código del modelo base.
- Licencia del adaptador no declarada: para uso comercial debe confirmarse la licencia del repositorio y respetarse la Apache 2.0 del modelo base.
- Idiomas no declarados: no hay garantía de comportamiento en castellano ni en otros idiomas distintos del inglés del dataset.
- El tamaño del repositorio figura como 0,0 GB, lo que puede indicar que los pesos del adaptador no están efectivamente subidos o que son de muy pocos megabytes; conviene verificar los archivos antes de depender del repositorio.
- No se documenta plantilla de prompt, tokenizador especial ni formato de entrada esperado; la integración exigirá ingeniería inversa o pruebas.
- Ejecutar SQL generado sin sandbox es peligroso: debe validarse contra un usuario de solo lectura y con límites de coste antes de cualquier uso real.
- El autor declara el artefacto como experimento (QLoRA + Unsloth con 1 época) sin evaluación en benchmarks estándar de la tarea (Spider, BIRD), por lo que su calidad fuera del subconjunto de 150 ejemplos es desconocida.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Kakarot2812/qwen2.5-coder-1.5b-text2sql-qlora)
- [Modelo base Qwen2.5-Coder-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct)
- [Qwen2.5-Coder Technical Report (arXiv 2409.12186)](https://arxiv.org/abs/2409.12186v1)
- [Qwen2.5-1.5B en HuggingFace](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Repo de entrenamiento relacionado: thanita47/text2sql-qlora-finetuning](https://github.com/thanita47/text2sql-qlora-finetuning)
- [Repo de entrenamiento relacionado: unbiasederudite/qwen2.5-coder-text2sql-qlora](https://github.com/unbiasederudite/qwen2.5-coder-text2sql-qlora)
- [Adaptador equivalente exportado a ONNX: spcv/qwen2.5_coder_text2sql_onnx](https://huggingface.co/spcv/qwen2.5_coder_text2sql_onnx)
