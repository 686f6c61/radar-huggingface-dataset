# llmkat/qwen3.5

## Resumen

`llmkat/qwen3.5` es un checkpoint construido a mano por el autor `llmkat` cuyo objetivo no es generar lenguaje, sino servir como banco de pruebas determinista para motores de inferencia LLM (vLLM, SGLang y similares). El modelo combina dos capas Gated DeltaNet (lineales, con estado recurrente) y una capa de atención con puerta, y está diseñado de forma que su salida greedy es conocida en forma cerrada: el modelo se limita a seguir una "persecución de punteros" sobre el prompt. Cualquier token distinto del esperado indica un fallo del motor al leer el bloque de caché KV o el estado recurrente, no una diferencia de redondeo.

Con 58.015.616 parámetros totales y un repositorio de 0,1 GB, es un artefacto de test de tamano pequeno, licencia MIT y formato safetensors, pensado para integrarse en pipelines de validacion de servidores de inferencia. Su relevancia es practica: permite verificar de forma binaria (token correcto o incorrecto) el soporte de prefix caching, el almacenamiento del estado recurrente y la decodificacion especulativa con un modelo draft asociado (`llmkat/qwen3.5-draft`).

No debe confundirse con un modelo Qwen real de Alibaba: el nombre hace referencia a la familia de arquitecturas que emula (etiqueta `qwen3_5_text`), pero el checkpoint es un fixture sintetico del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 2 capas Gated DeltaNet (lineales, estado recurrente) + 1 capa de atencion con puerta |
| Parametros totales | 58.015.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje funcional) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es hibrida y esta construida manualmente: dos capas Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente, mas una capa de atencion con puerta. Los "registros" que el modelo manipula residen en el estado recurrente, lo que permite comprobar si el motor de inferencia cachea y recupera correctamente dicho estado, no solo la caché KV clasica.

No hay entrenamiento en el sentido habitual: los pesos estan disenados para que la salida greedy sea conocida en forma cerrada. El modelo ejecuta una persecucion de punteros sobre su prompt. Segun el autor, cada token correcto gana por unos 39 nats, de modo que un token erroneo senala un error del motor (bloque de caché KV o estado recurrente mal leido) y no una diferencia numerica de redondeo.

## Capacidades

- Verificacion determinista de motores de inferencia: la salida esperada es conocida, por lo que el test es binario (correcto o incorrecto).
- Comprobacion de prefix caching: se sirve con `--enable-prefix-caching` y se valida cada token contra la respuesta conocida.
- Comprobacion de cacheo de estado recurrente: los registros viven en el estado recurrente, lo que ejercita esa ruta especifica.
- Comprobacion de decodificacion especulativa: se sirve junto a `llmkat/qwen3.5-draft` con `num_speculative_tokens` configurable.
- Compatibilidad declarada con vLLM y SGLang (etiquetas del repositorio); el ejemplo de la model card usa vLLM.
- Compatible con endpoints (etiqueta `endpoints_compatible`) y con la libreria `transformers`.
- No soporta generacion de texto util, razonamiento, codigo, matematicas, vision, tool calling ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Validacion de prefix caching en vLLM: se arranca `vllm serve llmkat/qwen3.5 --enable-prefix-caching` y se ejecuta `check.py` con varias pasadas (`--passes 2`); cualquier token distinto del esperado revela un fallo en la reutilizacion de bloques de caché.
- Prueba de cacheo de estado recurrente: al residir los registros en el estado recurrente, el fixture detecta motores que no persisten correctamente dicho estado entre peticiones o entre turnos.
- Verificacion de decodificacion especulativa: se sirve con `--speculative-config '{"method": "draft_model", "model": "llmkat/qwen3.5-draft", "num_speculative_tokens": 3}'` y se comprueba que la aceptacion de tokens del draft no altera la salida greedy.
- Integracion en CI/CD de un servidor de inferencia: el test es binario y no requiere umbrales de tolerancia, por lo que encaja como gate automatico tras actualizar el motor o sus kernels.
- Regresion tras cambios de kernels o de backend de atencion: sirve para detectar roturas en la ruta de atencion lineal o en la gestion de estados recurrentes antes de desplegar a produccion.
- Comparacion entre motores (vLLM frente a SGLang): al ser la salida conocida, permite contrastar el comportamiento de distintos motores sobre la misma arquitectura hibrida.
- Validacion de despliegues en hardware nuevo: un fixture pequeno (0,1 GB) permite comprobar rapidamente que un entorno con GPU nueva sirve correctamente antes de cargar modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de calidad tipo MMLU, HumanEval o GSM8K porque el modelo no es un modelo de lenguaje. El unico criterio de rendimiento descrito es cualitativo: cada token correcto gana por aproximadamente 39 nats, lo que convierte la comprobacion en una prueba de igualdad exacta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 58 millones de parametros, en precision completa (fp32) ocupa unos 0,23 GB de pesos, y en bf16/fp16 unos 0,12 GB, mas el estado recurrente y la cache KV.
- GPU recomendadas: cualquier GPU con soporte para vLLM o SGLang; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, por el tamano del checkpoint (0,1 GB de repositorio); no se detallan modelos concretos.
- Opciones de despliegue: vLLM (ejemplo oficial de la model card) y SGLang (etiqueta del repositorio); tambien cargable con `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llmkat/qwen3.5 | 58.015.616 | no disponible | Fixture de test para motores de inferencia | MIT | Hugging Face |
| llmkat/qwen3.5-draft | no disponible | no disponible | Modelo draft para decodificacion especulativa | no disponible | Hugging Face |
| Modelos Qwen3.5 reales de Alibaba | no disponible | no disponible | Modelos de lenguaje de proposito general | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a proposito y licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto util, razonamiento, codigo ni respuestas a preguntas; solo sigue una persecucion de punteros sobre el prompt.
- No debe usarse en produccion para tareas de NLP, atencion al cliente, generacion de codigo ni ninguna aplicacion final.
- El nombre puede inducir a confusion con los modelos Qwen3.5 de Alibaba; es un fixture sintetico del autor `llmkat`, no un checkpoint oficial.
- Sin datos publicados de sesgos, alucinacion o comportamiento multilingue porque no aplica a su proposito.
- La longitud de contexto y los tipos de cuantizacion no estan documentados; conviene no asumir valores.
- El test depende de la salida greedy exacta: si el motor aplica tecnicas que alteren la seleccion de tokens (por ejemplo, sampling no greedy), la comprobacion pierde validez.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo carece de valor funcional fuera del testing.
- Las cifras de descargas y likes (0) indican que es un artefacto reciente y poco adoptado; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmkat/qwen3.5
- Repositorio del proyecto: https://github.com/sansblues/llmkat
- Modelo draft para decodificacion especulativa: https://huggingface.co/llmkat/qwen3.5-draft
