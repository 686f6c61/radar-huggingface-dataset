# mertkayacs/Karar-4B-web

## Resumen

Karar-4B-web es una distribucion cuantizada en GGUF del modelo Karar-4B, publicada por el usuario mertkayacs para su ejecucion en navegador mediante WebGPU. Se trata de una build Q4_K_M dividida en siete fragmentos (shards) disenada especificamente para el runtime Emberwick sobre wllama 4.0.0, con un manifiesto JSON que el navegador lee para verificar cada SHA-256, almacenar los fragmentos en OPFS y aplicar la calibracion incluida.

El modelo subyacente, Karar-4B, es un modelo de decision (decision-model) orientado a elegir entre un conjunto cerrado de 62 respuestas simbolicas, no un generador de texto libre. El GGUF embebe el tokenizer y la plantilla de chat de Qwen3.5, y el repositorio incluye un fichero `symbols.json` con los IDs de los tokens de respuesta y del marcador de decision. Con 4.205.751.296 parametros totales y un peso de 2,7 GB, esta pensado para inferencia local en el navegador con un minimo declarado de 8 GiB de memoria de dispositivo.

La relevancia de esta publicacion es acotada pero concreta: demuestra un flujo de cuantizacion con verificacion de integridad por shard, prueba de paridad numerica frente al modelo BF16 (96,72% de coincidencia de argmax en 61 decisiones retenidas) y una validacion de inferencia con offload GPU en una particion NVIDIA RTX Pro 6000 Blackwell. Es material util para quien quiera replicar despliegues de modelos pequenos en WebGPU con garantias de integridad, siempre teniendo en cuenta que el modelo solo soporta turco y esta especializado en decisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Karar-4B; plantilla de chat Qwen3.5 embebida) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica build publicada en este repo) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF dividido en 7 shards (Q4_K_M), mas `browser-manifest.json`, `symbols.json` y `export-report.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Karar-4B en la documentacion proporcionada; la model card de esta distribucion solo describe el proceso de cuantizacion y empaquetado, no el entrenamiento del modelo original. Lo que si se documenta es que el GGUF embebe el tokenizer y la plantilla de chat de Qwen3.5, lo que sugiere una ascendencia o compatibilidad con la familia Qwen en el formato de conversacion.

El trabajo tecnico destacable de este repositorio es el pipeline de exportacion: la build Q4_K_M se dividio en siete fragmentos cuyo mayor shard ocupa 521.472.192 bytes, con un total de 2.708.805.024 bytes. La verificacion de integridad confirma que los 426 tensores y los 39 campos de metadatos no pertenecientes a cabecera coinciden con la fuente sin dividir. Se reporta una concordancia de argmax del 96,72% frente a BF16 en 61 decisiones retenidas, con una brecha maxima de probabilidad de 0,1430, y una degradacion de ECE de 0,0000 atribuida a la operacion de split (por debajo del umbral de refit de 0,02). Los bytes de calibracion se mantienen sin cambios.

## Capacidades

- Modelo de decision: selecciona entre 62 respuestas simbolicas definidas en `symbols.json`, no genera texto libre.
- Marcador de decision dedicado para indicar la opcion elegida.
- Conversacional: incluye plantilla de chat de Qwen3.5 embebida en el GGUF.
- Ejecucion en navegador mediante WebGPU y wllama 4.0.0, con almacenamiento en OPFS.
- Verificacion de integridad por SHA-256 de cada shard antes de la carga.
- Soporte de offload GPU en llama.cpp (probado en NVIDIA RTX Pro 6000 Blackwell).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.
- Soporte multilingue limitado al turco.

## Casos de uso

- Clasificacion de decisiones en el navegador: el modelo elige entre 62 opciones predefinidas, lo que permite integrar un clasificador local sin backend ni envio de datos a servidores externos.
- Asistentes web con privacidad por diseno: al ejecutarse en WebGPU y almacenarse en OPFS, los datos del usuario no salen del dispositivo, adecuado para aplicaciones sensibles.
- Enrutamiento de intenciones en interfaces conversacionales: dado un turno de usuario en turco, el modelo puede mapearlo a una accion del conjunto cerrado de respuestas.
- Demostraciones y prototipos de IA en navegador: el manifiesto con hashes y la integridad verificada facilitan entornos de demo reproducibles sin infraestructura de servidor.
- Validacion de pipelines de cuantizacion: el repositorio sirve como referencia para verificar paridad numerica entre BF16 y Q4_K_M en modelos de ~4B.
- Aplicaciones offline o de baja conectividad: una vez descargados los 2,7 GB de shards, la inferencia no requiere red, util en entornos con conectividad intermitente.
- Control de acceso y admision en el cliente: las politicas declaradas (8 GiB de memoria, 3,1 GiB de almacenamiento libre) permiten decidir en el navegador si el dispositivo puede ejecutar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento reportados son internos al proceso de cuantizacion:

| Metrica | Valor |
|---|---|
| Concordancia de argmax Q4_K_M vs BF16 | 96,72% (61 decisiones retenidas) |
| Brecha maxima de probabilidad nativa | 0,1430 |
| Integridad del split | 426 tensores y 39 campos de metadatos coincidentes |
| Degradacion de ECE por el split | 0,0000 (umbral de refit 0,02) |
| Tamano total GGUF | 2.708.805.024 bytes (7 shards) |
| Shard mayor | 521.472.192 bytes |
| Prueba ZeroGPU | accion `socialize` coincidente, request 6b92b455... en RTX Pro 6000 Blackwell |

## Requisitos de hardware

- Memoria de dispositivo minima declarada: 8 GiB (politica de admision).
- Almacenamiento libre minimo: 3,1 GiB para los shards en OPFS.
- Memoria viva estimada: 4,8 GiB (estimacion pendiente de medicion real en hardware de navegador).
- GPU: probado con offload en NVIDIA RTX Pro 6000 Blackwell Server Edition; no se documentan pruebas en GPUs consumer.
- Compatibilidad con GPUs consumer: no confirmada en la informacion disponible.
- Despliegue: wllama 4.0.0 sobre WebGPU en navegador; llama.cpp con soporte de offload GPU para la prueba nativa.
- Latencia y throughput: no disponibles; la velocidad WebGPU y el pico de memoria en navegador se reportan desde el runtime Emberwick, no en este repositorio.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos de decision de ~4B para navegador) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo solo soporta turco; no se documenta soporte de otros idiomas.
- Es un modelo de decision con 62 respuestas posibles, no un generador de texto general; usarlo fuera de ese espacio de salida produce resultados invalidos.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de alucinacion del modelo base.
- La longitud de contexto no esta documentada, lo que impide planificar conversaciones multi-turno largas.
- Las cifras de memoria (8 GiB de admision, 4,8 GiB vivos) son estimaciones pendientes de medicion real en navegador.
- La velocidad y el pico de memoria en WebGPU no estan medidos en este repositorio; dependen del runtime Emberwick.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Karar-4B antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- La fecha de creacion indicada (2026-11-26) es posterior a la fecha actual de referencia; tratar como dato de la plataforma sin verificar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mertkayacs/Karar-4B-web
- Modelo base: https://huggingface.co/mertkayacs/Karar-4B
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales.
