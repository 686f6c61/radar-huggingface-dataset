# manuelgscom/askmdb-2b-GGUF

## Resumen

askmdb-2b es un ajuste completo (full fine-tune) de Qwen/Qwen3.5-2B desarrollado por Manuel García Sanz (manuelgscom). Su tarea es convertir una pregunta en castellano o en inglés sobre una base de datos MongoDB en un único pipeline de `aggregate` de solo lectura, devuelto como un objeto JSON pequeño que incluye una explicación breve. El modelo lee en el prompt una descripción compacta del esquema de la base de datos, por lo que puede operar sobre bases que nunca ha visto durante el entrenamiento.

Con 1.881.825.088 parámetros (aproximadamente 1,88 B), se distribuye en formato GGUF con cuantización Q4_K_M generada con imatrix, ocupando 1.274,4 MB. Forma parte de una familia de cuatro tamaños (0,8B, 2B, 4B y 9B) entrenados con los mismos datos, contrato y prompt, y se posiciona como un paso intermedio entre el 0,8B y el 4B en la curva de precisión frente a tamaño.

Es relevante porque demuestra que un modelo de menos de 2 B parámetros, ajustado específicamente, supera ampliamente a modelos generalistas mucho mayores en una tarea concreta: obtiene un 86,8 % de precisión por ejecución en el test público, frente al 47,8 % de Qwen3.5-9B y el 45,4 % de Gemma 4 E4B-it sin ajustar. La licencia Apache-2.0 y el formato GGUF lo hacen desplegable en CPU o GPU con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B, ajuste completo) |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (imatrix); no se documentan otras variantes en la informacion disponible |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero principal Q4_K_M de 1.274,4 MB) |

## Arquitectura y entrenamiento

El modelo es un ajuste completo de Qwen/Qwen3.5-2B, es decir, se actualizan todos los pesos del modelo base en lugar de aplicar un adaptador LoRA. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO. Sí se indica que se entrenó con los mismos datos y el mismo contrato que askmdb-0.8b, el modelo por defecto de la CLI `askmdb`.

La innovación principal no está en la arquitectura, sino en el contrato de la tarea: el modelo recibe una descripción compacta del esquema de MongoDB en el prompt y debe producir un único pipeline de `aggregate` de solo lectura junto con una explicación breve, en un formato JSON acotado. Esa especialización estrecha explica que un modelo de 1,88 B parámetros supere en precisión a modelos generalistas de 9 B en el test público. La cuantización Q4_K_M se generó con imatrix, lo que suele preservar mejor la calidad en cuantizaciones agresivas.

## Capacidades

- Generación de pipelines de agregación de MongoDB (`aggregate`) de solo lectura a partir de preguntas en lenguaje natural, en castellano e inglés.
- Traducción de lenguaje natural a consulta (NL2Query) limitada al dominio de MongoDB.
- Generalización a esquemas de base de datos no vistos, gracias a la descripción del esquema incluida en el prompt.
- Salida estructurada en un objeto JSON pequeño con la consulta y una explicación breve.
- Conversación multi-turno (tag `conversational` en el repositorio).
- Integración con llama.cpp y `llama-server` para uso en aplicaciones propias, en CPU o GPU.
- No se documentan capacidades de tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Asistentes de consulta sobre bases MongoDB en producción: el modelo traduce preguntas de usuarios no técnicos a pipelines de agregación ejecutables, leyendo el esquema de la base en el prompt, lo que permite usarlo sobre colecciones que no existían en el momento del entrenamiento.
- Herramientas internas de analítica self-service: equipos de negocio formulan preguntas en castellano o inglés y obtienen la consulta junto con una explicación, reduciendo la dependencia del equipo de datos para consultas repetitivas.
- Integración en aplicaciones propias mediante `llama-server`: al publicarse en GGUF Q4_K_M de 1,27 GB, puede desplegarse en un servidor modesto o incluso en CPU, sirviendo peticiones NL2Query a través de la API compatible de llama.cpp.
- Generación asistida de consultas en editores o interfaces de administración de MongoDB: el modelo propone el pipeline y su explicación, y el usuario lo revisa antes de ejecutarlo.
- Prototipado y evaluación de pipelines NL2Query: al ser un modelo pequeño y con licencia Apache-2.0, es adecuado para experimentar con contratos de prompt, esquemas y verificadores deterministas en entornos de investigación.
- Filtrado previo en arquitecturas con verificador: en un sistema donde un componente determinista valida que el pipeline sea de solo lectura, askmdb-2b actúa como generador candidato con un coste computacional bajo frente a alternativas de mayor tamaño.
- Despliegue en entornos con restricciones de memoria: con 1,27 GB en Q4_K_M, cabe en máquinas sin GPU dedicada, algo relevante para herramientas de desarrollo locales.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente), evaluados por ejecución sobre el conjunto de test público `manuelgscom/askmdb-test` (500 casos):

| Modelo | Base | GGUF (Q4_K_M) | Precision en test |
|---|---|---:|---:|
| askmdb-0.8b | Qwen3.5-0.8B | 529,3 MB | 83,6 % |
| **askmdb-2b** | Qwen3.5-2B | 1.274,4 MB | **86,8 %** (434/500) |
| askmdb-4b | Qwen3.5-4B | 2.708,8 MB | 89,6 % |
| askmdb-9b | Qwen3.5-9B | 5.629,1 MB | 91,6 % |
| Qwen3.5-9B (sin ajustar) | — | — | 47,8 % |
| Gemma 4 E4B-it (sin ajustar) | — | — | 45,4 % |

La métrica es "accuracy by execution": cada consulta generada se ejecuta y se comprueba su corrección, en lugar de compararse textualmente con una referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q4_K_M ocupa 1.274,4 MB, por lo que la inferencia completa en GPU requiere aproximadamente 1,3-2 GB de VRAM, según el contexto y el backend.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por el tamaño del fichero, cualquier GPU con al menos 2 GB de VRAM libre debería poder alojarlo; una RTX 4090, A100 o H100 lo ejecutarían con holgura y baja latencia.
- Cabe en GPU de consumo: sí, con cuantización Q4_K_M y un tamaño de 1,27 GB es viable en GPUs de consumo con 2 GB o más de VRAM. También puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp mediante `llama-server` (el autor indica explícitamente este uso). No se documentan otras opciones como vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. La model card incluye una demostración en vídeo con askmdb-0.8b sobre CPU de escritorio, pero sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en test askmdb | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| askmdb-2b | 1,88 B | no disponible | 86,8 % | Apache-2.0 | GGUF en Hugging Face |
| askmdb-0.8b | no disponible (base Qwen3.5-0.8B) | no disponible | 83,6 % | Apache-2.0 (segun repositorio de la familia) | GGUF en Hugging Face; modelo por defecto de la CLI askmdb |
| askmdb-4b | no disponible (base Qwen3.5-4B) | no disponible | 89,6 % | Apache-2.0 (segun repositorio de la familia) | GGUF en Hugging Face; usado por la CLI en GPU con ≥ 4 GiB |
| askmdb-9b | no disponible (base Qwen3.5-9B) | no disponible | 91,6 % | Apache-2.0 (segun repositorio de la familia) | GGUF en Hugging Face; opción en la CLI con ≥ 8 GiB |

La comparación más directa es dentro de la propia familia askmdb, ya que comparten datos, contrato y prompt. Frente a modelos generalistas sin ajustar, askmdb-2b casi duplica la precisión de Qwen3.5-9B (86,8 % frente a 47,8 %) y de Gemma 4 E4B-it (45,4 %) en esta tarea concreta.

## Limitaciones y advertencias

- El modelo no decide la seguridad de las consultas: fuera de la CLI `askmdb` no hay verificador determinista, por lo que el autor recomienda revisar siempre la consulta generada y conectarse con un usuario de solo lectura.
- La CLI `askmdb` no utiliza este modelo; está pensado para aplicaciones propias con `llama-server`.
- Especialización estrecha: está entrenado exclusivamente para generar pipelines de agregación de MongoDB. No debe esperarse un rendimiento generalista en otras tareas de texto.
- Idiomas limitados a castellano e inglés.
- Riesgo de alucinación en nombres de campos, colecciones u operadores si el esquema descrito en el prompt es ambiguo o incompleto; no se documentan tasas de error específicas.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- No se documentan sesgos conocidos, longitud de contexto máxima ni detalles del dataset de entrenamiento, lo que limita la evaluación de riesgos en producción.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B y de los datos de entrenamiento, no detalladas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manuelgscom/askmdb-2b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de test: https://huggingface.co/datasets/manuelgscom/askmdb-test
- Colección de la familia askmdb: https://huggingface.co/collections/manuelgscom/askmdb-6ae398e10b4817ed0e7431f1
- Repositorio de la CLI askmdb: https://github.com/manuelgscom/askmdb
- Modelo askmdb-0.8b: https://huggingface.co/manuelgscom/askmdb-0.8b-GGUF
- Modelo askmdb-4b: https://huggingface.co/manuelgscom/askmdb-4b-GGUF
- Modelo askmdb-9b: https://huggingface.co/manuelgscom/askmdb-9b-GGUF
- Sitio web del autor: https://manuelgs.com
- Fichero GGUF Q4_K_M: https://huggingface.co/manuelgscom/askmdb-2b-GGUF/resolve/main/askmdb-2b-1.0.0-Q4_K_M.gguf
- Licencia: https://huggingface.co/manuelgscom/askmdb-2b-GGUF/blob/main/LICENSE
