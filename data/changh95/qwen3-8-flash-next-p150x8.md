# changh95/qwen3.8-flash-next-p150x8

## Resumen

qwen3.8-flash-next-p150x8 es un bundle de despliegue, no un modelo entrenado desde cero, publicado por el usuario changh95. Sirve el checkpoint Qwen/Qwen3.8-Flash-Next sobre un chasis Tenstorrent P150x8, formado por ocho chips Blackhole organizados como una malla 1x8, mediante un servidor de chat propio compatible con la API de OpenAI (no vLLM). El modelo base es un transformer híbrido de 48 capas que combina gated delta-net (GDN) con atención dispersa dotada de un indexer, y una capa MoE de 512 expertos de los que se activan 10 por token, con 51,2 mil millones de parámetros totales y 262.000 tokens de contexto nativo.

El port aplica paralelismo tensorial de 8 vías (TP8) para la ruta densa y paralelismo de expertos de 8 vías (EP8, 64 expertos enrutados por chip en BF4), y expone 32.768 tokens de contexto (32.704 utilizables) con batching continuo sobre un paso de 32 filas: 28 ranuras de decodificación más 4 carriles de prefill. Un usuario greedy aislado pasa a una ruta rápida de batch 1 que rinde unos 20 t/s en lugar de los 13 t/s del paso compartido, bit a bit idéntico.

Su interés actual es doble: documenta un caso medido de servicio concurrente multiusuario (hasta 28 usuarios) sobre aceleradores Tenstorrent en lugar de GPU, y añade una puerta de aceptación en el arranque que compara la salida de un registro JSON contra la referencia greedy en CPU (96/96 tokens), lo que permite hablar de reproducibilidad bit a bit en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 48 capas hibridas de gated delta-net (GDN) y atencion dispersa con indexer; MoE de 512 expertos (10 activos por token) en 49 capas MoE |
| Parametros totales | 51,2 mil millones (modelo base Qwen/Qwen3.8-Flash-Next) |
| Parametros activos | no disponible (MoE con 10 de 512 expertos activados por token) |
| Longitud de contexto | 32.768 tokens servidos por el bundle P150x8 (32.704 utilizables); 262.000 tokens nativos en el checkpoint original |
| Tipos de cuantizacion | BF4 para la cache de expertos enrutados (107 GB generados en el primer arranque); no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible en la model card (el repositorio de 1,4 GB contiene el manifiesto y la imagen; los pesos se descargan aparte desde Qwen/Qwen3.8-Flash-Next, 360 GB, revision f5d08274bafd880402bd16f5e3e6c514136ec06c) |

Otros datos del bundle: empaquetado con tt-model-manager 0.1.0 (esquema de manifiesto 5.1, tipo `tt-dit-server`), etiquetas `blackhole`, `p150x8`, `tt-model-cache`, `tt-model-catalog`, `tt-model-container`, `region:us`.

## Arquitectura y entrenamiento

La arquitectura del modelo base es híbrida: 48 capas que alternan gated delta-net y atención dispersa con un indexer que selecciona las posiciones a atender, más 49 capas MoE con enrutamiento a 512 expertos y 10 expertos activos por token. El port mantiene tanto la ruta densa (TP8) como la de expertos (EP8), y compila kernels propios sobre un checkout de tt-metal con cambios específicos (`indexer_score` y correcciones de runtime del MoE y del all-gather, descritos en la sección 1 del README del fork).

No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO: esa información corresponde al checkpoint original de Qwen y no aparece en la información disponible. En el lado de la innovación de inferencia, el port implementa decodificación especulativa MTP-in-slots (borrador especulativo dentro del paso por lotes), pero está desactivada en este bundle porque, según el autor, la ruta híbrida en anillo ganó en todas las celdas medidas. Tampoco se usa decodificación especulativa de otro tipo.

El diseño de servicio es el otro elemento arquitectónico relevante: un único paso de decodificación atiende todas las ranuras activas, los prompts nuevos se prefilan a razón de 128 filas por paso y los prompts de más de 512 tokens pasan por la ruta de losa de 1.024 filas.

## Capacidades

- Generación de texto con plantilla de chat de Qwen, con modo thinking activado por defecto y posibilidad de desactivarlo mediante `enable_thinking: false` o `chat_template_kwargs`.
- Razonamiento multi-paso: el contenido de razonamiento se expone en el campo `reasoning_content` de la respuesta.
- Tool calling y function calling en formato OpenAI (`tools` / `tool_choice`, con motivo de finalización `tool_calls`).
- Decodificación greedy y con muestreo: temperatura, top-p, top-k, min-p, penalizaciones, `seed` y `logprobs`.
- Streaming mediante SSE (`"stream": true`), con comentario `: keepalive` cada 600 s durante prefills largos.
- Control de generación con `stop`, `ignore_eos` y `max_tokens` hasta el contexto restante.
- Procesamiento de contexto largo: hasta 32.704 tokens utilizables por petición.
- Atención concurrente de hasta 28 usuarios decodificando en el mismo paso, con 4 carriles adicionales de prefill.
- Reproducibilidad bit a bit: cada flujo de ranura es la continuación exacta de su propia ejecución en flujo único.
- Endpoints de operación: `GET /v1/models`, `GET /health` (contabilidad del planificador: ranuras, carriles, ruta rápida y DRAM libre) y `GET /` (perfil resuelto del bundle y comando exacto del servidor).
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Atención al cliente automatizada: el servidor mantiene conversaciones multi-turno de hasta 32.704 tokens y admite 28 usuarios decodificando simultáneamente en un solo chasis, con una cola de 4 peticiones adicionales antes de devolver HTTP 503; es adecuado para volúmenes medios con prompts cortos, donde el agregado llega a unos 300 t/s.
- Agentes con tool calling: el soporte de `tools` y `tool_choice` en formato OpenAI permite integrar el modelo en bucles de agente sin adaptadores, y el modo thinking resulta útil para planificación de varios pasos.
- Razonamiento asistido con trazas verificables: al separar el razonamiento en `reasoning_content`, se puede auditar la cadena de pensamiento en aplicaciones de análisis técnico o legal antes de mostrar la respuesta final.
- Análisis de documentos largos y RAG con contexto extenso: con un prefill de unos 0,85 ms por token a un solo usuario (TTFT medido de 3,5 s para 4.096 tokens, 6,3 s para 8.192 y 12,0 s para 16.384), es viable resumir informes extensos o ingerir múltiples fragmentos recuperados en una sola petición.
- Generación de código en herramientas internas: el streaming SSE, los parámetros `stop` y `logprobs` permiten construir autocompletado y revisión de código con puntuación de confianza, y el tool calling facilita invocar linters o ejecutores de tests.
- Evaluación y regresión de modelos: la puerta de aceptación del arranque compara el registro `json` contra la referencia greedy en CPU con 96/96 tokens, lo que convierte este bundle en una plataforma razonable para comparativas reproducibles (semillas fijas, sin decodificación especulativa) entre versiones del port.
- Investigación en arquitecturas híbridas: al ser un despliegue funcional de un modelo con gated delta-net más atención dispersa con indexer, sirve para estudiar el comportamiento real de este tipo de capas en cargas concurrentes.
- Sustitución de servidores GPU en entornos con hardware Tenstorrent: al hablar la API de chat de OpenAI, un cliente existente puede apuntar al puerto 20000 cambiando únicamente la URL y el identificador de modelo, sin reescribir la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card extraída menciona tablas de rendimiento (decodificación y prefill) que aparecen truncadas en el contenido proporcionado, y no incluye cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación estándar.

Los únicos datos de rendimiento disponibles son medidas de servicio, recogidas en la sección de requisitos de hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en esta configuración. El despliegue no utiliza GPU, sino un chasis Tenstorrent P150x8 (8 chips Blackhole en malla 1x8 sobre la rejilla ethernet 2x4 de la máquina).
- GPU recomendadas: no disponible para el modelo base; el bundle documentado no soporta GPU.
- Compatibilidad con GPU de consumo: no, en ningún caso. El port requiere específicamente la malla `P150x8`.
- Espacio en disco: 360 GB de pesos (descargados aparte) más aproximadamente 132 GB de cachés (107 GB de caché de expertos en BF4 y 23 GB de cachés de componentes para 32K de contexto). El primer arranque tarda unos 34 minutos (2.017 s hasta READY, de los cuales unos 23 minutos corresponden a la conversión de expertos); los arranques en caliente tardan unos 4 minutos (244 s medidos).
- Memoria del host: la tabla n-gram del PLE (104 GB del checkpoint) se lee a través de la caché de páginas en la decodificación, por lo que un host cuya RAM pueda alojarla decodifica a velocidad plena.
- Throughput y latencia medidos:
  - Decodificación en ruta rápida (un único usuario greedy): ~20 t/s.
  - Decodificación en el paso compartido de 32 filas: ~13 t/s por usuario.
  - Agregado a 28 usuarios con prompts cortos: ~300 t/s.
  - Prefill: ~0,85 ms por token de prompt en la losa de 1.024 filas a un usuario, más un coste fijo de ~1 s por petición (paso por carril y transferencia a ranura).
  - TTFT medido: 3,5 s para 4.096 tokens, 6,3 s para 8.192 tokens, 12,0 s para 16.384 tokens.
- Opciones de despliegue: CLI `tt-model` (0.1.0) con `tt-model pull --with-weights` y `tt-model serve`, que levanta una imagen Docker con el servidor ASGI bajo uvicorn en el puerto 20000 (o el siguiente libre). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; de hecho el autor indica explícitamente que no es vLLM. La vigilancia de readiness de `tt-model serve` es de 4 horas por defecto, suficiente para cubrir el primer arranque.
- Concurrencia: 28 ranuras de decodificación más 4 carriles de prefill; la petición 29 espera en cola (hasta 4) y la siguiente recibe HTTP 503.

## Comparativa con modelos similares

La información disponible solo permite comparar este bundle con el checkpoint original que sirve. No se documentan otras alternativas comparables (ni otros ports del mismo modelo, ni cuantizaciones para GPU, ni modelos MoE de tamaño equivalente) en el material proporcionado.

| Aspecto | qwen3.8-flash-next-p150x8 (este port) | Qwen/Qwen3.8-Flash-Next (checkpoint original) |
|---|---|---|
| Naturaleza | Bundle de despliegue sobre hardware Tenstorrent | Modelo base publicado por Qwen |
| Parametros totales | 51,2 mil millones (heredados) | 51,2 mil millones |
| Contexto | 32.768 tokens (32.704 utilizables) | 262.000 tokens nativos |
| Hardware | P150x8: 8 chips Blackhole, TP8 + EP8, BF4 para expertos | no disponible en la informacion proporcionada |
| Servidor | Propio, compatible con la API de chat de OpenAI; no vLLM | no disponible en la informacion proporcionada |
| Decodificacion especulativa | Implementada (MTP-in-slots) pero desactivada | no disponible en la informacion proporcionada |
| Licencia | no disponible | no disponible |
| Rendimiento medido | ~20 t/s (fast path), ~13 t/s/usuario en paso compartido, ~300 t/s agregados a 28 usuarios | no disponible |

## Limitaciones y advertencias

- La model card no declara licencia para este bundle ni se indican idiomas soportados. Antes de cualquier uso comercial es imprescindible verificar la licencia del checkpoint Qwen/Qwen3.8-Flash-Next y del código del fork, ya que no se puede asumir permisividad.
- El contexto servido es de 32.704 tokens utilizables, muy inferior a los 262.000 tokens nativos del checkpoint. Las aplicaciones que dependan de contexto ultra largo deben rediseñarse.
- El arranque en frío es costoso: unos 34 minutos en el equipo del autor, con conversión de expertos a BF4 y compilación de kernels. Además, ese arranque genera 107 GB de caché de expertos y 23 GB de cachés de componentes.
- La huella de almacenamiento es alta: 360 GB de pesos más unos 132 GB de cachés, y el rendimiento de decodificación depende de que la RAM del host pueda alojar la tabla PLE de 104 GB a través de la caché de páginas.
- La concurrencia está acotada: 28 usuarios decodificando, 4 en cola y HTTP 503 a partir de ahí.
- La ruta rápida de ~20 t/s solo aplica a un usuario greedy aislado; en cuanto el paso se comparte, el rendimiento por usuario baja a ~13 t/s.
- En este bundle no hay decodificación especulativa activa, por lo que no se aprovecha la mejora potencial de MTP-in-slots.
- Riesgo de alucinación: no se documenta ningún estudio al respecto en la información disponible, pero es un riesgo inherente a los modelos generativos y debe mitigarse a nivel de aplicación.
- Sesgos conocidos: no disponible.
- Al no ser vLLM ni un servidor convencional, las herramientas y los patrones de operación habituales (por ejemplo, los perfiles de despliegue estándar para GPU) no son aplicables; hay que seguir la documentación del propio port (`code/models/demos/blackhole/qwen38_flash_next/docs/SERVER.md`).
- Dependencia de hardware muy específica: el bundle solo funciona en una malla `P150x8`. No hay portabilidad a GPU documentada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-09-16) es posterior a las referencias habituales; conviene validar la vigencia y el soporte del proyecto antes de comprometer un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/changh95/qwen3.8-flash-next-p150x8
- Checkpoint base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta de empaquetado: https://github.com/tenstorrent/tt-model-manager
- Fork del port: https://github.com/sjettTT/tt-qwen-3.8-flash-next (rama `qwen38-p150x8-batching`, commit `4894edf46db336763d74c561affa49fae636495e`)
- Revision de pesos referenciada: `f5d08274bafd880402bd16f5e3e6c514136ec06c`
- Documentacion de reglas de peticion: `code/models/demos/blackhole/qwen38_flash_next/docs/SERVER.md` (ruta dentro del arbol del port)
- La busqueda web realizada no devolvio enlaces adicionales relevantes: los resultados fueron paginas de inicio de buscadores sin relacion con el modelo.
