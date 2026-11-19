# loom-draft/mradermacher-Qwen3.8-14B-Instruct-Turbo-loom

## Resumen

`loom-draft/mradermacher-Qwen3.8-14B-Instruct-Turbo-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF sin modificar `Qwen3.8-14B-Instruct-Turbo.Q4_K_M.gguf`, derivado de `mradermacher/Qwen3.8-14B-Instruct-Turbo-GGUF`. No es un modelo entrenado desde cero ni un fine-tune: es una distribucion de inferencia generada con la herramienta `loom-next` (el generador, sin LLM en el bucle) para las GPU AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El interes practico esta en que permite servir un modelo de 14B en cuantizacion Q4_K_M sobre hardware AMD con una API compatible con OpenAI (`/v1/chat/completions`), soporte de tool calling, modo de razonamiento configurable y una ventana de contexto declarada de 262.144 tokens por peticion con 4 peticiones concurrentes. Es, por tanto, una pieza de infraestructura para equipos que quieran ejecutar modelos Qwen en GPU AMD sin depender de llama.cpp, aunque con un grado de validacion todavia incompleto.

La ficha del autor es explicitamente provisional: las secciones de rendimiento y de correccion indican «not yet re-measured» en ambas GPU, de modo que no hay cifras publicadas de throughput, latencia ni comparaciones con llama.cpp para este paquete concreto. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen; no se detalla en la informacion proporcionada) |
| Parametros totales | 14B (segun el nombre del checkpoint) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se listan otras variantes en este paquete |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint original) empaquetado como programa Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | no aplicable |
| Entrada de imagen | no determinada |
| Entrada/salida de audio | no determinada |
| Muestreo | no determinado |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base: solo se sabe que es un Qwen3.8-14B-Instruct-Turbo en formato GGUF, derivado del repositorio de cuantizaciones de mradermacher. No se aportan datos sobre numero de tokens de entrenamiento, composicion del dataset, fases de RLHF/DPO ni innovaciones de atencion. Cualquier afirmacion sobre estos puntos seria especulativa.

Lo que si documenta la model card es la capa de despliegue: `loom-next` genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF, y `loom-serve` los ejecuta con un pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El paquete incluye un `model.json` con los parametros del preset y un `model.json.lock` que fija la fuente. La decodificacion especulativa se marca como no aplicable en este paquete.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en formato OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de llamadas a herramientas.
- Modo de razonamiento (thinking) activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con valores `low`, `medium` y `xhigh` (por defecto `xhigh`).
- Contexto largo de hasta 262.144 tokens por peticion, adecuado para documentos extensos o historiales de conversacion amplios.
- Concurrencia de 4 peticiones simultaneas con pool de memoria fijo.
- Capacidades multimodales (imagen, audio) y de muestreo avanzado: no determinadas en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistente conversacional autohospedado en estacion de trabajo AMD: con 262.144 tokens de contexto y 4 peticiones concurrentes, un equipo con Ryzen AI Max+ 395 puede servir un chatbot interno multi-turno sin salir del hardware local.
- Agentes con herramientas en local: el soporte de `tools`/`tool_calls` y el bucle de agente permiten construir asistentes que consulten APIs internas, ejecuten busquedas o manipulen ficheros, con el modo thinking ajustable segun la latencia tolerada.
- Procesamiento de documentos largos: contratos, informes o bases de codigo de decenas de miles de tokens caben en una sola peticion, lo que simplifica pipelines de extraccion y resumen sin troceado agresivo.
- Razonamiento con esfuerzo configurable: para tareas de analisis se usa `reasoning_effort: xhigh`; para respuestas rapidas en produccion se baja a `low` o se desactiva el thinking, reduciendo tokens generados.
- Despliegue en Radeon AI PRO R9700 de 32 GB: la cuantizacion Q4_K_M de un 14B encaja en la VRAM de esta tarjeta, lo que permite montar un nodo de inferencia dedicado en un servidor con GPU AMD.
- Evaluacion y banco de pruebas de la pila Loom: el paquete sirve para validar kernels generados, comparar salidas contra llama.cpp con las puertas de correccion (`golden`, `compare`, `agent`, `sampling`) y medir regresiones antes de adoptar Loom en produccion.
- Integracion en entornos con requisitos de licencia permisiva: al ser Apache 2.0, puede incorporarse a productos comerciales internos sin obligaciones de copyleft, sujeto a las condiciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) «are not yet re-measured», y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured» en ambas GPU.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- VRAM estimada: no disponible de forma explicita; el checkpoint es un 14B en Q4_K_M, y la R9700 dispone de 32 GB, suficiente segun el diseno del paquete.
- Compatibilidad con GPU consumer: no se declara soporte para GPUs de consumo distintas de las dos plataformas AMD citadas; no hay informacion sobre NVIDIA u otras marcas.
- Despliegue: pila propia de Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Parametros de servicio relevantes: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa, consume CPU mientras hay trabajo en GPU).
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Estado de validacion |
|---|---|---|---|---|---|
| Este paquete (Qwen3.8-14B-Instruct-Turbo Q4_K_M, Loom) | 14B | 262.144 tokens | GGUF empaquetado en Loom para AMD gfx1151/gfx1201 | Apache 2.0 | Rendimiento y correccion sin re-medir |
| `mradermacher/Qwen3.8-14B-Instruct-Turbo-GGUF` (modelo base del paquete) | 14B | no disponible | GGUF para llama.cpp y derivados | Apache 2.0 | No disponible |
| llama.cpp sobre el mismo GGUF | 14B | no disponible | GGUF, runtime generico | MIT (runtime) | Referencia usada por las puertas de correccion de Loom |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a formato, plataforma y estado de validacion.

## Limitaciones y advertencias

- Paquete sin validacion publicada: todas las puertas de correccion y las mediciones de rendimiento figuran como «not yet re-measured»; no hay evidencia registrada de que las salidas coincidan con llama.cpp en esta version.
- Ambito de hardware muy restringido: solo se declaran Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte documentado para otras GPU.
- Capacidades sin determinar: entrada de imagen, audio y comportamiento de muestreo aparecen como «?» en la tabla de caracteristicas, por lo que no deben asumirse en produccion.
- Idiomas no declarados: la model card no especifica cobertura linguistica; el comportamiento multilingue del modelo base no esta verificado en este paquete.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad ni de sesgo para este checkpoint.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`), muy inferior a la ventana de contexto de 262.144 tokens; las tareas de generacion larga requeriran ajustar el preset.
- Concurrencia limitada a 4 peticiones simultaneas, lo que restringe el uso como servicio multiusuario de alta carga.
- La espera activa (`completion_spin_ns=4294967295`) consume CPU mientras hay trabajo en GPU; conviene revisar su impacto en servidores con CPU compartida.
- Licencia Apache 2.0 declarada en el paquete, pero las condiciones finales dependen del modelo base y de sus terminos; conviene verificar la licencia del checkpoint original antes de un uso comercial.
- Cero descargas y cero «likes» en el momento de la consulta: no hay senales de adopcion ni de mantenimiento por parte de la comunidad.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-draft/mradermacher-Qwen3.8-14B-Instruct-Turbo-loom
- Modelo base (GGUF): https://huggingface.co/mradermacher/Qwen3.8-14B-Instruct-Turbo-GGUF
- Repositorio de Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
