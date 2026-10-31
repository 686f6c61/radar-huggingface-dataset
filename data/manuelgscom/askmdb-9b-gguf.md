# manuelgscom/askmdb-9b-GGUF

## Resumen

`askmdb-9b` es un ajuste fino LoRA de Qwen3.5-9B, fusionado con los pesos del modelo base, desarrollado por Manuel García Sanz (manuelgscom). Su función es muy concreta: convertir una pregunta en castellano o en inglés sobre una base de datos MongoDB en un único pipeline de `aggregate` de solo lectura, devuelto como un pequeño objeto JSON acompañado de una explicación breve. Resuelve así el problema clásico del text-to-query especializado en MongoDB, evitando que el usuario tenga que escribir pipelines de agregación a mano.

La característica diferencial es que el modelo lee en el prompt una descripción compacta del esquema de la base de datos, por lo que funciona con bases de datos que nunca ha visto durante el entrenamiento. Está diseñado para ejecutarse sin conexión mediante llama.cpp (con Vulkan en GPU), tanto en la CLI `askmdb` como con `llama-server` en cualquier otra aplicación. En el test público de 500 casos, puntuado ejecutando cada consulta, alcanza un 91,6 % de acierto, frente al 47,8 % del Qwen3.5-9B sin ajustar.

Es relevante porque ofrece una alternativa local, privada y ligera (5,6 GB en cuantización Q4_K_M) a los servicios en la nube de generación de consultas, con licencia Apache-2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B), ajuste LoRA fusionado |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (con imatrix) |
| Idiomas soportados | Español (es), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (5.629,1 MB); base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer de 9B de parámetros, al que se aplica un ajuste LoRA que posteriormente se fusiona con los pesos base, de modo que el resultado es un modelo único sin adaptadores separados. La cuantización publicada es Q4_K_M con matriz de importancia (imatrix), una técnica que mejora la calidad de la cuantización a 4 bits estimando la importancia de cada peso.

El entrenamiento utiliza los mismos datos y el mismo contrato de salida que su hermano pequeño `askmdb-0.8b`: pares de pregunta (en español o inglés) más descripción de esquema como entrada, y un pipeline de `aggregate` de solo lectura en formato JSON como salida. El número de tokens de entrenamiento y la composición detallada del dataset no están disponibles. No se menciona el uso de RLHF ni DPO; al ser una tarea de generación estructurada con salida determinista, el ajuste parece supervisado puro.

## Capacidades

- Generación de pipelines de agregación de MongoDB (`aggregate`) de solo lectura a partir de lenguaje natural, en español o inglés.
- Adaptación a bases de datos desconocidas mediante una descripción compacta del esquema incluida en el prompt.
- Salida estructurada: un pequeño objeto JSON con el pipeline y una explicación breve de lo que hace.
- Soporte de `llama-server` para integración en otras aplicaciones vía API.
- Ejecución totalmente offline, sin envío de datos a servicios externos.
- Compatible con llama.cpp en CPU y GPU (Vulkan en la CLI `askmdb`).
- No está indicado soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Exploración de bases de datos MongoDB por personal no técnico: un analista de negocio puede preguntar en castellano ("¿cuántos pedidos hubo el mes pasado por región?") y obtener el pipeline listo para ejecutar, sin conocer la sintaxis de agregación.
- Integración en la CLI `askmdb` para administradores de sistemas: consulta interactiva offline sobre bases de producción, con verificación determinista de que el pipeline es de solo lectura antes de ejecutarlo.
- Chatbots internos de datos: mediante `llama-server`, se puede exponer el modelo como API para que una aplicación interna traduzca preguntas de usuarios a consultas MongoDB sin depender de servicios en la nube.
- Entornos con requisitos de privacidad estrictos (salud, legal, sector público): al ejecutarse localmente, ni el esquema ni los datos salen de la infraestructura del cliente.
- Asistencia a desarrolladores: generación de un primer borrador de pipeline de agregación complejo ($lookup, $group, $match) que el desarrollador revisa y refina, ahorrando tiempo en consultas multinivel.
- Automatización de informes: un script puede construir el prompt con el esquema y la pregunta periódica, y ejecutar el pipeline devuelto para generar métricas recurrentes.
- Documentación viva de esquemas: al pedir explicaciones de pipelines sobre el esquema actual, el equipo puede validar que la descripción del esquema refleja la realidad de la base.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el dataset público `manuelgscom/askmdb-test` (500 casos, puntuados por ejecución de la consulta):

| Modelo | Accuracy (by execution) |
|---|---|
| askmdb-9b (este modelo) | 91,6 % (458/500) |
| Qwen3.5-9B sin ajustar | 47,8 % |
| Gemma 4 E4B-it sin ajustar | 45,4 % |

Rendimiento en la CLI `askmdb` (GPU con Vulkan): 1,85 s por pregunta, con 5,5 GiB de VRAM en uso. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; al ser un modelo de tarea única, la métrica relevante es la precisión por ejecución indicada arriba.

## Requisitos de hardware

- VRAM estimada para inferencia: 5,5 GiB en uso con el GGUF Q4_K_M en GPU; la CLI lo ofrece cuando hay al menos 8 GiB de VRAM libre en una GPU dedicada.
- GPU recomendadas: cualquier GPU dedicada con ≥ 8 GiB de VRAM libre compatible con Vulkan (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); no se especifican requisitos concretos de NVIDIA/AMD.
- Cabe en GPUs de consumo con 8 GiB o más de VRAM (con 5,5 GiB en uso, una RTX 3060 Ti u 8 GiB ajustados sería el límite práctico). En CPU es ejecutable vía llama.cpp, aunque la CLI reserva la CPU para `askmdb-0.8b` por defecto.
- Opciones de despliegue: llama.cpp (CLI `askmdb` con Vulkan), `llama-server` para servir vía API, y cualquier runtime compatible con GGUF (Ollama, LM Studio, etc., no confirmado explícitamente).
- Latencia: 1,85 s por pregunta en GPU; throughput y latencia en CPU no disponibles.

## Comparativa con modelos similares

La familia `askmdb` ofrece el mismo modelo en cuatro tamaños, todos en Q4_K_M y evaluados sobre el mismo test:

| Modelo | Base | GGUF (Q4_K_M) | Accuracy (test) | Uso en la CLI askmdb |
|---|---|---|---|---|
| askmdb-0.8b | Qwen3.5-0.8B | 529,3 MB | 83,6 % | CPU (por defecto) |
| askmdb-2b | Qwen3.5-2B | 1.274,4 MB | 86,8 % | no usado (solo llama-server) |
| askmdb-4b | Qwen3.5-4B | 2.708,8 MB | 89,6 % | GPU, ≥ 4 GiB VRAM libre |
| askmdb-9b | Qwen3.5-9B | 5.629,1 MB | 91,6 % | GPU, ≥ 8 GiB VRAM libre (opcional) |

Frente a los modelos base sin ajustar (Qwen3.5-9B: 47,8 %; Gemma 4 E4B-it: 45,4 %), el ajuste fino especializado casi duplica la precisión en esta tarea. No se dispone de comparativas con otros modelos de text-to-MongoDB de terceros en la información proporcionada.

## Limitaciones y advertencias

- El modelo genera un único pipeline de `aggregate` de solo lectura; no está diseñado para operaciones de escritura, consultas de otro tipo ni tareas generales de lenguaje.
- Fuera de la CLI `askmdb` no existe el verificador determinista de seguridad: el usuario debe revisar siempre la consulta generada y conectarse a MongoDB con un usuario de solo lectura.
- La precisión del 91,6 % procede del test del propio autor y no está verificada por terceros; el rendimiento en esquemas muy distintos a los del entrenamiento no está garantizado.
- La calidad depende de que la descripción del esquema incluida en el prompt sea correcta y completa; un esquema mal descrito degradará las consultas generadas.
- En modo `auto` de la CLI, las consultas con joins piden confirmación previa; fuera de ella no hay salvaguardas equivalentes.
- Longitud de contexto no documentada: no se puede confirmar cuánto esquema cabe en el prompt.
- Los datos de benchmarks de modelos base (Qwen3.5-9B, Gemma 4 E4B-it) son declaraciones del autor, no resultados independientes.
- La licencia Apache-2.0 no impone restricciones al uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manuelgscom/askmdb-9b-GGUF
- Colección de la familia askmdb: https://huggingface.co/collections/manuelgscom/askmdb-6ae398e10b4817ed0e7431f1
- Dataset de test público: https://huggingface.co/datasets/manuelgscom/askmdb-test
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código fuente de la CLI askmdb: https://github.com/manuelgscom/askmdb
- Modelo hermano askmdb-0.8b: https://huggingface.co/manuelgscom/askmdb-0.8b-GGUF
- Descarga directa del GGUF Q4_K_M: https://huggingface.co/manuelgscom/askmdb-9b-GGUF/resolve/main/askmdb-9b-1.0.0-Q4_K_M.gguf
- Sitio web del autor: https://manuelgs.com
