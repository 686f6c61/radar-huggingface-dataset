# loom-draft/mradermacher-GameScaling-27B-S3-loom

## Resumen

`loom-draft/mradermacher-GameScaling-27B-S3-loom` es un paquete de despliegue en formato Loom (`.loom` más un `model.json` de tarjeta) que empaqueta el checkpoint GGUF sin modificar `GameScaling-27B-S3.Q4_K_M.gguf` del autor `mradermacher`. No es un modelo nuevo ni un fine-tune: es una distribucion de inferencia generada con la herramienta `loom-next` (sin LLM en el bucle) para ejecutar ese GGUF sobre dos aceleradores AMD concretos, la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un transformer multimodal de 27B parametros (la nomenclatura "27B" del nombre) con capacidad de entrada de imagen, servido a traves de una API compatible con OpenAI (`/v1/chat/completions`). El paquete declara soporte de tool calling, entrada de imagen mediante proyector `GameScaling-27B-S3.mmproj-f16.gguf`, ventana de contexto de 262.144 tokens por peticion, concurrencia de 4 peticiones y un maximo de 4.096 tokens de salida por defecto.

Su relevancia es de nicho pero clara: permite ejecutar un modelo de 27B con vision sobre hardware AMD consumer y profesional (Strix Halo y R9700) sin depender de CUDA ni de llama.cpp, con kernels generados especificamente para `gfx1151` y `gfx1201`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano declarado es de 0.0 GB, lo que sugiere que el contenido no esta completamente materializado en el repo o que la metadata no refleja los pesos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 27B (segun nomenclatura del nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en F16 (`mmproj-f16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como paquete Loom (`.loom`, `weights.loom`, `model.json`, `tokenizer.json`, `llm_config.json`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `GameScaling-27B-S3` mas alla de que es un transformer multimodal de tipo image-text-to-text con 27B parametros. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se documenta ninguna innovacion de atencion (linear attention, SSM, MoE) en la informacion proporcionada.

Lo que si esta documentado es la capa de despliegue: el paquete Loom contiene programas `.loom` generados por `loom-next` que implementan los kernels para las arquitecturas AMD `gfx1151` (Strix Halo) y `gfx1201` (R9700). El paquete incluye un `model.json` con los ficheros fuente fijados por sha256 (verificados por `loom-fetch`), el tokenizer, la configuracion `llm_config.json` y los pesos en `weights.loom`. La decodificacion especulativa figura como "not applicable" en la tabla de features, y el modo de razonamiento/thinking tambien como no aplicable.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Entrada de imagen (image-text-to-text) con partes `image_url` al estilo OpenAI, usando el proyector `GameScaling-27B-S3.mmproj-f16.gguf`.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`).
- Soporte de agentes multi-turno con bucle de tool calling (existe una puerta de validacion `agent` en el sistema de benchmarks del paquete).
- Contexto largo de hasta 262.144 tokens por peticion.
- Concurrencia de 4 peticiones simultaneas.
- Salida maxima de 4.096 tokens por defecto (preset `max_tokens`).
- Sin soporte de audio (entrada ni salida).
- Sin modo de razonamiento extendido ni ajuste de esfuerzo de razonamiento.
- Sin decodificacion especulativa.
- Capacidades multilingues: no disponibles en la informacion.

## Casos de uso

- Asistente conversacional con imagenes en local: el modelo acepta partes `image_url` y texto en la misma peticion, por lo que sirve para describir capturas, diagramas o documentos escaneados desde una estacion de trabajo con Strix Halo o R9700, sin enviar datos a la nube.
- Agente de automatizacion con tool calling: el soporte de `tools`/`tool_calls` y el bucle multi-turno permiten construir agentes que consulten APIs internas, ejecuten busquedas o encadenen pasos, con hasta 4 peticiones concurrentes.
- Procesamiento de documentos largos: con 262.144 tokens de contexto se pueden ingerir contratos, informes o transcripciones extensas en una sola peticion y hacer preguntas sobre ellos, siempre que el contenido quepa en el limite.
- Analisis de imagenes tecnicas en entornos regulados: al ejecutarse sobre hardware AMD local con licencia Apache 2.0, encaja en flujos donde no se permite exfiltrar imagenes a servicios externos (por ejemplo, inspeccion de capturas de paneles de control).
- Prototipado de aplicaciones sobre hardware AMD: el paquete Loom permite levantar un endpoint compatible con OpenAI en una R9700 o Strix Halo con dos comandos (`loom-fetch` y `loom-serve`), lo que facilita probar integraciones antes de mover cargas a produccion.
- Evaluacion comparativa de backends: al incluir puertas de correccion (`golden`, `compare`, `vision`, `agent`, `logits`) frente a llama.cpp sobre el mismo GGUF, sirve para validar la fidelidad numerica de un backend alternativo en hardware AMD.
- Chat de soporte interno con contexto largo: la ventana de 262k tokens permite mantener historiales extensos de incidencias por usuario sin truncar, aunque el limite de 4.096 tokens de salida acota la respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambos casos indica literalmente que "the results for this package are not yet re-measured". Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Para un modelo de 27B en Q4_K_M el peso de los pesos ronda los 16-18 GB, pero este dato no lo proporciona la informacion; el proyector de vision en F16 anade una cantidad no especificada.
- GPU soportadas oficialmente por el paquete: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU no soportadas: no se documenta soporte para NVIDIA (CUDA) ni para otras arquitecturas AMD distintas de gfx1151 y gfx1201.
- Cabe en GPU consumer: si, en el sentido de que Strix Halo es una APU consumer/prosumer; en GPU dedicada consumer AMD no se documenta compatibilidad.
- Despliegue: `hrx-loom[hf]==0.2.0` instalado con `pipx`, `loom-fetch` para descargar el paquete desde Hugging Face y `loom-serve` para servirlo. Opciones relevantes: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones del paquete no se han vuelto a realizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| GameScaling-27B-S3 (paquete Loom) | 27B | 262.144 | Si | Apache 2.0 | AMD gfx1151, gfx1201 |
| GameScaling-27B-S3-GGUF (mradermacher) | 27B | no disponible | Si (proyector aparte) | Apache 2.0 | Generico (llama.cpp) |
| llama.cpp como backend de referencia | no aplica | depende del modelo | Si | MIT | Multiples, incluido AMD |

La comparacion relevante no es con otro modelo, sino con el mismo checkpoint servido por llama.cpp: el paquete Loom se presenta como una alternativa con kernels generados para gfx1151 y gfx1201, y su propia model card usa llama.cpp como referencia de correccion (`golden`, `compare`, `logits`). No se dispone de datos de rendimiento que permitan cuantificar la diferencia, porque las mediciones estan pendientes.

## Limitaciones y advertencias

- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Tamano del repo declarado como 0.0 GB, incoherente con un modelo de 27B; conviene verificar que los pesos estan realmente materializados antes de usarlo.
- Todas las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured": no hay evidencia publicada de que la salida coincida con llama.cpp en esta version del paquete.
- Soporte de hardware muy restringido: solo gfx1151 y gfx1201. No hay soporte documentado para CUDA ni para otras GPU AMD.
- No se documentan idiomas soportados; no se puede asumir un rendimiento correcto en castellano sin evaluacion previa.
- No hay informacion sobre sesgos, datos de entrenamiento ni fases de alineamiento del modelo base, por lo que el riesgo de alucinacion y de sesgo no puede caracterizarse.
- El limite de salida por defecto es de 4.096 tokens, lo que puede truncar respuestas largas si no se ajusta el preset.
- La licencia Apache 2.0 se declara en este paquete, pero conviene verificar la licencia del checkpoint original de `mradermacher/GameScaling-27B-S3-GGUF` antes de un uso comercial, ya que la informacion proporcionada no la detalla.
- Concurrencia limitada a 4 peticiones: no es adecuado para cargas de alta concurrencia sin escalado horizontal.
- La decodificacion especulativa no esta disponible, lo que limita las optimizaciones de latencia en generacion larga.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/mradermacher-GameScaling-27B-S3-loom
- Checkpoint GGUF base: https://huggingface.co/mradermacher/GameScaling-27B-S3-GGUF
- Sistema Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
