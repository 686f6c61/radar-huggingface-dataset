# loom-draft/alibiserikbay-JevK5-loom

## Resumen

JevK5 (Q4_K_M) para AMD Loom es un paquete de despliegue en formato `.loom` que empaqueta el checkpoint GGUF sin modificar `alibiserikbay/JevK5-GGUF`, concretamente el fichero `jevk5-4b-v0.2-Q4_K_M.gguf`, para su ejecución sobre las GPU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Lo publica el usuario `loom-draft` y se ha generado con la herramienta `loom-next`, el generador de paquetes del ecosistema Loom, sin intervención de un LLM en el bucle.

No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de distribución que traduce un GGUF existente a programas `.loom` y a una tarjeta `model.json`, de modo que el runtime `loom-serve` (paquete `hrx-loom[hf]==0.2.0`) pueda servirlo con una API compatible con OpenAI. El modelo subyacente, según la nomenclatura del fichero, es de aproximadamente 4 000 millones de parámetros en su versión v0.2, cuantizado a Q4_K_M y con una ventana de contexto declarada de 262 144 tokens por petición.

Su relevancia es acotada pero clara: cubre el nicho de servir modelos GGUF en hardware AMD con aceleración nativa (ROCm/HIP) a través de un runtime alternativo a llama.cpp, con soporte de tool calling, modo de razonamiento y cuatro peticiones concurrentes. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las mediciones de rendimiento y las puertas de corrección todavía no se han vuelto a medir para este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente transformer, inferido del formato GGUF; no confirmado en la información) |
| Parametros totales | ~4B (según el nombre del fichero `jevk5-4b-v0.2`; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (única incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF de origen, empaquetado como programas `.loom` (`program/*.loom`, `weights.loom`) más `tokenizer.json`, `llm_config.json` e `info.json` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base `alibiserikbay/JevK5-GGUF`: no se detallan capas, tipo de atención, composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo único verificable es el contenedor: un GGUF cuantizado a Q4_K_M, con tokenizer propio exportado a `tokenizer.json` y una configuración `llm_config.json` a partir de la cual `loom-next` generó los kernels y programas `.loom`.

La innovación técnica del paquete no está en el modelo sino en el pipeline de despliegue. `loom-next` genera programas `.loom` específicos para las arquitecturas gfx1151 y gfx1201, y `loom-serve` los ejecuta con un pool de memoria de tamaño fijo (`--pool_backing=fixed`), precarga de parámetros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El paquete incluye un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF; para este paquete todas aparecen como «not yet re-measured», es decir, sin evidencia registrada.

## Capacidades

- Generación de texto conversacional mediante endpoint compatible con OpenAI `/v1/chat/completions`.
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agentes.
- Modo de razonamiento (thinking) activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Contexto largo de 262 144 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Límite de 4 096 tokens de salida por petición (preset `max_tokens`).
- Sin soporte de entrada de imagen ni de audio (marcado como «not applicable»).
- Sin decodificación especulativa ni ajuste de esfuerzo de razonamiento (no aplicable en este preset).
- Capacidades multilingües: no disponibles en la información.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con Strix Halo: el modelo se sirve con `loom-serve` en la propia iGPU y expone una API compatible con OpenAI, lo que permite integrarlo en clientes existentes sin reescribir el frontend.
- Procesamiento de documentos largos: con 262 144 tokens de contexto por petición se pueden ingerir contratos, informes o bases de código extensas en una sola llamada, útil para resumen y extracción de entidades.
- Agentes con herramientas en entornos de desarrollo: el soporte de `tools`/`tool_calls` y de bucles multi-turno permite construir asistentes que consulten APIs internas, ejecuten comandos o consulten bases de datos, con el modo thinking desactivable para reducir latencia.
- Despliegue en GPU de escritorio profesional R9700: con 32 GB de VRAM y un modelo de ~4B en Q4_K_M, el paquete deja margen para el pool de memoria fijo y para atender hasta 4 peticiones concurrentes, adecuado para equipos pequeños de desarrollo.
- Evaluación de runtimes alternativos: sirve como banco de pruebas para comparar `loom-serve` frente a llama.cpp sobre el mismo GGUF, ya que el paquete incluye puertas de corrección diseñadas para esa comparación token a token.
- Prototipado de razonamiento con trazas: al estar el thinking activado por defecto, es útil para generar cadenas de razonamiento en tareas de matemáticas o lógica antes de decidir si se desactiva en producción.
- Sustituto ligero en flujos de CI: un modelo de ~4B cuantizado puede ejecutarse en hardware AMD consumer para tareas de clasificación, etiquetado o generación de texto auxiliar dentro de pipelines, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) «no se han vuelto a medir» para este paquete, y que todas las puertas de corrección figuran como «not yet re-measured».

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete está pensado para la Radeon AI PRO R9700 con 32 GB y para la iGPU del Ryzen AI Max+ 395 (Strix Halo), que comparte memoria del sistema.
- GPU soportadas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPU NVIDIA ni otras arquitecturas AMD.
- Cabe en GPU consumer: no confirmado; el soporte declarado se limita a las dos plataformas AMD anteriores.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas de ejecución para este paquete.
- Latencia y throughput: no disponibles; las filas de rendimiento de la tarjeta no se han vuelto a medir.
- Concurrencia: 4 peticiones simultáneas según la tabla de características.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, y el paquete no es directamente comparable con un checkpoint al uso, sino con otros empaquetados para el mismo runtime o con la ejecución del mismo GGUF bajo llama.cpp.

| Aspecto | Este paquete | llama.cpp sobre el mismo GGUF | Otros paquetes Loom |
|---|---|---|---|
| Modelo | JevK5 ~4B Q4_K_M | JevK5 ~4B Q4_K_M | no disponible |
| Contexto | 262 144 tokens | no disponible | no disponible |
| Tool calling | sí (formato OpenAI) | no disponible | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 (heredada) | no disponible |
| Rendimiento medido | no disponible | referencia usada por las puertas, sin cifras publicadas | no disponible |

## Limitaciones y advertencias

- Ausencia total de evidencia de corrección: las puertas `kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits` y `decision` figuran como no re-medidas, por lo que no hay garantía publicada de que la salida coincida con la referencia de llama.cpp.
- Sin mediciones de rendimiento: no se puede estimar latencia ni throughput reales en ninguna de las dos GPU objetivo.
- Modelo base poco documentado: la model card no describe arquitectura, datos de entrenamiento ni alineamiento, lo que impide evaluar sesgos y riesgo de alucinación con criterio.
- Idiomas no declarados: no se especifica qué lenguas cubre el modelo, lo que desaconseja asumir un buen rendimiento en castellano.
- Contexto máximo de 4 096 tokens de salida: insuficiente para generaciones largas aunque la ventana de entrada sea de 262 144 tokens.
- Dependencia de un runtime joven y específico: `hrx-loom[hf]==0.2.0` y el ecosistema Loom están atados a las arquitecturas gfx1151 y gfx1201; no hay soporte declarado para otras GPU.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de uso en producción.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint base `alibiserikbay/JevK5-GGUF` antes de redistribuir.
- Los resultados de búsqueda web devueltos corresponden a Loom (la herramienta de grabación de vídeo) y a la marca de ropa Loom, no al ecosistema Loom de AMD; no aportan información técnica sobre este paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/alibiserikbay-JevK5-loom
- Modelo base GGUF: https://huggingface.co/alibiserikbay/JevK5-GGUF
- Repositorio del runtime: https://github.com/ROCm/hrx-system
- Generador de paquetes: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
