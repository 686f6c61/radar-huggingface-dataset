# manuelgscom/askmdb-0.8b-GGUF

## Resumen

`askmdb-0.8b` es un ajuste completo (full fine-tune) de Qwen/Qwen3.5-0.8B desarrollado por Manuel García Sanz, orientado a una tarea muy concreta: convertir una pregunta en castellano o en inglés sobre una base de datos MongoDB en un único pipeline de `aggregate` de solo lectura, devuelto como un objeto JSON pequeño junto con una explicación breve. El modelo lee en el prompt una descripción compacta del esquema de la base de datos, de modo que puede operar sobre bases que nunca ha visto durante el entrenamiento. Con 752.393.024 parámetros reales, es el miembro más pequeño de la familia askmdb, que incluye también variantes de 2B, 4B y 9B.

Su relevancia práctica radica en que es el modelo por defecto y de reserva de la CLI `askmdb`, una herramienta de línea de comandos que funciona sin conexión: muestrea el esquema, ejecuta el modelo en local mediante llama.cpp en un único binario nativo, valida el pipeline con un verificador determinista de solo lectura y solo entonces lo ejecuta. Esto lo convierte en una opción viable para entornos con CPU únicamente o con GPUs modestas, donde modelos mayores no caben.

La distribución disponible es un GGUF cuantizado en Q4_K_M con imatrix, de 529,3 MB, lo que permite ejecutarlo en hardware de consumo e incluso en CPU con latencias bajas cuando el esquema está en caché. La licencia Apache-2.0 facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); detalles internos no disponibles |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (imatrix); otras cuantizaciones no disponibles |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 0,5 GB; archivo Q4_K_M de 529,3 MB) |

## Arquitectura y entrenamiento

El modelo es un full fine-tune de Qwen/Qwen3.5-0.8B, un transformer de 752 millones de parámetros. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. Lo que sí se especifica es el contrato de la tarea: el modelo recibe una descripción compacta del esquema de MongoDB en el prompt y debe producir un único pipeline de `aggregate` de solo lectura, acompañado de una explicación breve, en formato JSON.

La innovación principal no está en la arquitectura, sino en el diseño del sistema que lo rodea. Dentro de la CLI `askmdb`, el modelo no decide la seguridad: un verificador determinista independiente comprueba que el pipeline sea exclusivamente de lectura antes de ejecutarlo. El modelo se distribuye en GGUF Q4_K_M con imatrix, optimizado para inferencia en CPU mediante llama.cpp. La familia askmdb comparte la misma tarea, datos, contrato y prompt en cuatro tamaños (0.8B, 2B, 4B y 9B), lo que sugiere un pipeline de entrenamiento común del que no se han publicado más detalles.

## Capacidades

- Generación de pipelines de agregación de MongoDB (`aggregate`) de solo lectura a partir de lenguaje natural.
- Traducción de preguntas en español e inglés a consultas estructuradas en formato JSON.
- Generalización a esquemas de base de datos no vistos, gracias a la descripción del esquema incluida en el prompt.
- Generación de una explicación breve del pipeline producido.
- Soporte de conversación multi-turno (tag `conversational`).
- Integración con llama.cpp y con la CLI `askmdb` como modelo por defecto y de reserva en CPU.
- No se ha documentado soporte de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Consultas ad hoc sobre MongoDB en lenguaje natural: un analista escribe una pregunta en castellano o inglés y el modelo genera el pipeline de agregación correspondiente, que la CLI valida y ejecuta, sin necesidad de conocer la sintaxis de agregación.
- Despliegue en entornos sin GPU: al ser el modelo de CPU de la familia, permite usar `askmdb` en portátiles, servidores sin acelerador o contenedores con recursos limitados, con una latencia mediana de 1,18 s por pregunta con el esquema en caché en el equipo de referencia del autor.
- Modo de reserva en sistemas con GPU: cuando `askmdb-4b` o `askmdb-9b` no están disponibles o fallan, la CLI recurre a `askmdb-0.8b`, manteniendo la funcionalidad con menor consumo de memoria.
- Asistentes internos de explotación de datos: equipos de soporte o de negocio pueden consultar métricas y registros almacenados en MongoDB sin escribir código, con la garantía de que solo se ejecutan lecturas.
- Automatización de informes y paneles: integración en scripts que traducen preguntas predefinidas a pipelines y obtienen resultados de forma reproducible en pipelines de CI o tareas programadas.
- Prototipado y evaluación de sistemas text-to-query: al ser pequeño y de licencia permisiva, sirve como base para experimentar con verificación determinista, prompts de esquema y comparación entre tamaños de la familia askmdb.

## Benchmarks y rendimiento

Los resultados proceden del model-index declarado por el autor y no están verificados de forma independiente (`verified: false`).

| Benchmark | Métrica | Resultado |
|---|---|---|
| askmdb test (500 casos, split test) | Accuracy (por ejecución) | 83,6 % (418/500) |

Según la model card, el modelo base Qwen3.5-9B sin ajustar obtiene un 47,8 % y Gemma 4 E4B-it un 45,4 % en el mismo test, también medido por ejecución. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 529,3 MB; con overhead de contexto y runtime de llama.cpp, cabe holgadamente en menos de 2 GB de memoria.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En el ecosistema askmdb, la GPU se reserva para los modelos de 4B (≥ 4 GiB de VRAM libre) y 9B (≥ 8 GiB de VRAM libre).
- Cabe en cualquier GPU de consumo con al menos 2 GB de memoria, así como en CPU.
- Opciones de despliegue: llama.cpp (integrado en el binario nativo de `askmdb`), llama-server para el modelo de 2B según la model card; otros runtimes compatibles con GGUF no se detallan.
- Latencia y throughput: 1,18 s de mediana por pregunta con el esquema en caché, en un equipo de sobremesa de referencia del autor, ejecutando en CPU. No se han publicado cifras de throughput.

## Comparativa con modelos similares

| Modelo | Base | Tamaño GGUF (Q4_K_M) | Test askmdb | Uso en la CLI | Licencia |
|---|---|---:|---:|---|---|
| askmdb-0.8b | Qwen3.5-0.8B | 529,3 MB | 83,6 % | CPU (por defecto y reserva) | Apache-2.0 |
| askmdb-2b | Qwen3.5-2B | 1.274,4 MB | 86,8 % | no usado (solo llama-server) | no disponible |
| askmdb-4b | Qwen3.5-4B | 2.708,8 MB | 89,6 % | GPU, ≥ 4 GiB VRAM libre | no disponible |
| askmdb-9b | Qwen3.5-9B | 5.629,1 MB | 91,6 % | GPU, ≥ 8 GiB VRAM libre | no disponible |

Como referencia externa, la model card indica que Qwen3.5-9B sin ajustar obtiene un 47,8 % y Gemma 4 E4B-it un 45,4 % en el test askmdb, frente al 83,6 % de este modelo de 0,8B. No se dispone de comparativas con otros modelos especializados en text-to-query para MongoDB.

## Limitaciones y advertencias

- El modelo no decide la seguridad: fuera de la CLI `askmdb` no hay verificador determinista, por lo que debe revisarse siempre la consulta generada y conectarse con un usuario de solo lectura.
- Riesgo de alucinación en nombres de campos, colecciones u operadores del pipeline, especialmente con esquemas ambiguos o descripciones incompletas.
- La precisión medida (83,6 %) implica que aproximadamente una de cada seis consultas del test no se ejecuta correctamente; no es adecuado para operaciones críticas sin validación.
- Idiomas limitados a español e inglés; no se ha documentado comportamiento en otras lenguas.
- Longitud de contexto no disponible; esquemas muy grandes podrían no caber en el prompt.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- El modelo está especializado exclusivamente en la tarea text-to-query sobre MongoDB; su uso como modelo de propósito general no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manuelgscom/askmdb-0.8b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de evaluación: https://huggingface.co/datasets/manuelgscom/askmdb-test
- Colección askmdb: https://huggingface.co/collections/manuelgscom/askmdb-6ae398e10b4817ed0e7431f1
- Código fuente de la CLI: https://github.com/manuelgscom/askmdb
- Sitio web del autor: https://manuelgs.com
- Modelo askmdb-2b: https://huggingface.co/manuelgscom/askmdb-2b-GGUF
- Modelo askmdb-4b: https://huggingface.co/manuelgscom/askmdb-4b-GGUF
- Modelo askmdb-9b: https://huggingface.co/manuelgscom/askmdb-9b-GGUF
- Descarga directa del GGUF: https://huggingface.co/manuelgscom/askmdb-0.8b-GGUF/resolve/main/askmdb-0.8b-1.0.0-Q4_K_M.gguf?download=true
