# EInnovator/pra-qwen3-8b-mlx-6bit

## Resumen

EInnovator/pra-qwen3-8b-mlx-6bit es un paquete de runtime para Progressive Retrieval Attention (PRA), una tecnica que extiende la ventana de contexto efectiva de modelos transformer mediante recuperacion progresiva de informacion relevante. Este bundle no contiene los pesos del modelo base, sino el mapeo estructural, los perfiles de runtime, los componentes aprendidos opcionales y la metadatos de compatibilidad necesarios para ejecutar PRA sobre el modelo cuantizado `mlx-community/Qwen3-8B-6bit` en el motor MLX de Apple.

El paquete esta desarrollado por EInnovator y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que permite evaluar y desplegar PRA sobre un modelo Qwen3 de 8B parametros cuantizado a 6 bits, optimizado para hardware Apple Silicon. El bundle incluye evidencia de validacion de runtime (nivel SMOKE) obtenida en un MacBook Pro con chip M4 Pro, pero no incluye benchmarks de calidad de tarea final para esta identidad exacta de modelo, revision, cuantizacion y motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only) |
| Parametros totales | 8B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | 6-bit MLX (modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (el bundle contiene adaptadores y metadatos, no pesos del modelo base) |

## Arquitectura y entrenamiento

El bundle implementa Progressive Retrieval Attention (PRA), un mecanismo que modifica la atencion del transformer para recuperar progresivamente informacion relevante del contexto, en lugar de procesar toda la ventana de atencion de forma uniforme. PRA introduce proyecciones de adaptador que se integran en las capas del modelo base, permitiendo un enrutamiento selectivo del contexto. El paquete incluye perfiles de configuracion (QUALITY, BALANCED, ECONOMY) que determinan como se distribuyen las capas consumidoras y el enrutamiento.

El modelo base es `mlx-community/Qwen3-8B-6bit`, una version cuantizada a 6 bits del Qwen3-8B, preparada para el ecosistema MLX de Apple. El bundle referencia una revision inmutable especifica (`35a99712f90d6c2c9a2407a3857e104a46edd9e6`) tanto para el modelo como para el tokenizador. No se proporcionan datos sobre el entrenamiento del adaptador PRA (datos, numero de tokens, metodo de post-entrenamiento), mas alla de indicar que el modelo base fue "pretrained and post-trained". El bundle no incluye un router aprendido para esta identidad cuantizada exacta; el enrutamiento se realiza mediante coseno generico.

## Capacidades

- Extension de contexto efectiva mediante recuperacion progresiva de atencion (PRA), disenada para tareas de contexto largo.
- Modo "Selected Context" recomendado con perfil BALANCED, que preserva la geometria de consumo de todas las capas elegibles.
- Modo "Native Memory" disponible, aunque sin calificacion de calidad para esta identidad exacta.
- Compatibilidad con el motor MLX para hardware Apple Silicon.
- Integracion con la libreria `pra-hf` para inspeccion, evaluacion, recomendacion y servido del modelo.
- Capacidades del modelo base Qwen3-8B (generacion de texto, razonamiento, codigo, multilingue) heredadas, aunque no validadas especificamente en este bundle.

## Casos de uso

- Evaluacion de PRA en hardware Apple Silicon: el bundle permite ejecutar `pra evaluate` con el dataset Qasper para medir el rendimiento del mecanismo PRA sobre el modelo Qwen3-8B-6bit en un MacBook Pro, antes de decidir un despliegue en produccion.
- Analisis de documentos largos: el modo Selected Context con perfil BALANCED esta disenado para tareas donde solo una parte del contexto es relevante, como la respuesta a preguntas sobre articulos cientificos (caso del dataset Qasper).
- Comparativa de perfiles de runtime: permite medir el impacto de los perfiles QUALITY, BALANCED y ECONOMY en memoria y latencia, para seleccionar la configuracion adecuada segun los recursos disponibles.
- Despliegue local en Mac con MLX: el comando `pra serve` permite servir el modelo con el adaptador PRA cargado, usando el motor MLX nativo de Apple.
- Validacion de identidad de artefacto: el bundle fija una revision inmutable del modelo base y del tokenizador, lo que permite reproducir exactamente la configuracion evaluada.
- Investigacion sobre atencion selectiva: el paquete sirve como base para experimentos controlados comparando PRA con atencion completa (No PRA) en la misma identidad de modelo, aunque las ejecuciones de la cohorte canonica estan pendientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea final en la informacion disponible. El bundle incluye unicamente una prueba de humo de runtime (SMOKE) que valida la carga del checkpoint, el descubrimiento de proyecciones del adaptador y una generacion corta:

| Metrica | Valor |
|---|---|
| Estado | RUNTIME_SMOKE_VALIDATED |
| Hardware | MacBook Pro, Apple M4 Pro, 48 GB |
| Tiempo de carga | 202,8 s |
| Tiempo de generacion | 1,004 s |
| Memoria pico (modelo/runtime) | 6,24 GiB |
| Alcance | Carga exacta del checkpoint, descubrimiento de proyecciones del adaptador, generacion acotada |

Las metricas de calidad de tarea final, paridad de Native Memory, enrutamiento aprendido, TTFT, ITL y throughput sostenido figuran como `NOT_MEASURED` para esta identidad exacta.

## Requisitos de hardware

- VRAM estimada: 6,24 GiB de memoria pico medida en la prueba de humo con el modelo 6-bit MLX en Apple Silicon.
- GPU recomendada: Apple Silicon (M4 Pro validado; se espera compatibilidad con otros chips de la familia M).
- Cabe en hardware de consumo: si, en Macs con Apple Silicon y al menos 8 GB de memoria unificada (48 GB usados en la prueba, pero la memoria pico del modelo es de 6,24 GiB).
- Opciones de despliegue: motor MLX nativo; la libreria `pra-hf` ofrece comandos `pra serve`, `pra evaluate` y `pra inspect`.
- Latencia y throughput: no medidos para esta identidad (TTFT, ITL y throughput sostenido figuran como `NOT_MEASURED`).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este bundle especifico. Como referencia estructural, se puede comparar con el modelo base sin PRA:

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| EInnovator/pra-qwen3-8b-mlx-6bit (bundle PRA) | 8B (base) | 6-bit MLX | no disponible | Apache 2.0 | Añade mecanismo PRA sobre Qwen3-8B-6bit |
| mlx-community/Qwen3-8B-6bit (base) | 8B | 6-bit MLX | no disponible | Apache 2.0 | Modelo base sin PRA, atencion completa |
| Qwen3-8B (original) | 8B | bf16/fp16 | 32K (segun documentacion de Qwen) | Apache 2.0 | Modelo original sin cuantizar ni adaptador PRA |

No se dispone de comparativas con otros mecanismos de extension de contexto (p. ej., sparse attention, sliding window) en la informacion proporcionada.

## Limitaciones y advertencias

- No se incluye un router aprendido para esta identidad cuantizada exacta; la transferencia del adaptador de enrutamiento desde otra cuantizacion esta deshabilitada intencionalmente.
- Solo se ha realizado validacion estructural de configuracion inmutable para esta identidad cuantizada exacta.
- Los perfiles de capas consumidoras nativas y la generacion de tarea final no estan calibrados para esta identidad exacta.
- La identidad de calificacion es el modelo MLX 6-bit exacto y su revision; no se transfiere automaticamente a otras cuantizaciones, motores o revisiones.
- No hay evidencia de calidad de tarea final (end-task) para este bundle; los diagnosticos de enrutamiento no deben interpretarse como calidad de aplicacion.
- El bundle no contiene los pesos del modelo base; es necesario descargar `mlx-community/Qwen3-8B-6bit` por separado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia que debe verificarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EInnovator/pra-qwen3-8b-mlx-6bit
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-6bit
- Libreria PRA: `pip install 'pra-hf[hf-hub,hf-runtime]'` (documentacion de instalacion en la model card)
