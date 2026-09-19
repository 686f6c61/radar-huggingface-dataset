# bokuweb/gemma-4-E2B-it-grande-wgpu-ja

## Resumen

`bokuweb/gemma-4-E2B-it-grande-wgpu-ja` es un artefacto de pesos derivado de `google/gemma-4-E2B-it`, publicado por el desarrollador bokuweb y adaptado al motor wgpu de su herramienta [grande](https://github.com/bokuweb/grande). No es un checkpoint autónomo: el repositorio contiene los tensores del modelo base reempaquetados a partir de las "Q4_0 codes" de un GGUF de llama.cpp, junto con un `manifest.json` que mapea cada tensor a su fichero correspondiente. El objetivo declarado es ejecutar el modelo en el navegador mediante WebGPU o de forma nativa sobre Metal y Vulkan.

La motivación técnica es concreta: el motor de grande procesa el estado de la conversación y cada pregunta en un único forward pass block-causal, lo que simplifica el bucle de inferencia frente a las implementaciones clásicas con caché KV incremental. El artefacto se generó con el script `tools/export_wgpu_gguf.py` del propio proyecto y se invoca mediante la orden `grande probe --model <directorio> --request examples/ticket-ja.json`.

El sufijo `-ja` del identificador y el ejemplo de petición empleado (`ticket-ja.json`) apuntan a un uso orientado al japonés, aunque no se documenta en la información disponible el conjunto de idiomas cubiertos por este artefacto. Se trata además de una publicación con 0 descargas y 0 likes en el momento de la consulta, creada y actualizada el 19 de septiembre de 2026, y con un tamaño de repositorio de 1,2 GB. Su relevancia es, por tanto, la de una pieza de infraestructura para despliegue en navegador más que la de un modelo nuevo con resultados propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `google/gemma-4-E2B-it`; no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se confirma que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, segun la model card: "Q4_0 codes from the llama.cpp GGUF, repacked" |
| Idiomas soportados | no disponible (el identificador y el ejemplo `examples/ticket-ja.json` sugieren uso en japones) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | formato propio de grande: ficheros de tensores mas `manifest.json`; explicitamente "not a standalone checkpoint format" |

Nota sobre el tamano: el repositorio ocupa 1,2 GB y la cuantizacion declarada es Q4_0 (4 bits por peso). Como estimacion derivada de esos dos datos, el conjunto de pesos estaria en el orden de los 2.000-2.400 millones de parametros, cifra coherente con la nomenclatura "E2B" del modelo base, pero que no esta confirmada en la informacion disponible.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `google/gemma-4-E2B-it` ni su proceso de entrenamiento: no hay datos sobre numero de tokens, composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Lo unico documentado en este repositorio es el formato de exportacion y el motor de ejecucion al que va destinado.

La innovacion tecnica del artefacto es, por tanto, de despliegue. Segun la model card, el motor de grande realiza "state + every question in one block-causal forward pass", es decir, procesa el estado acumulado y la nueva pregunta en una unica pasada causal por bloques, sin cache KV incremental clasica. Los pesos se exportaron desde las Q4_0 codes de un GGUF de llama.cpp mediante `tools/export_wgpu_gguf.py`, y el `manifest.json` actua como indice que asocia cada tensor con su fichero. El resultado se ejecuta en navegador sobre WebGPU o de forma nativa sobre Metal y Vulkan, lo que implica kernels especificos por backend en lugar de los kernels CUDA habituales.

## Capacidades

- Generacion de texto conversacional: al derivar de un modelo con sufijo `-it`, esta orientado a instrucciones y dialogo multi-turno, aunque las capacidades concretas heredadas del modelo base no se documentan en este repositorio.
- Ejecucion en navegador: soporte de WebGPU para inferencia local sin instalacion, con el estado de la conversacion gestionado por el motor.
- Ejecucion nativa: backends Metal (macOS/iOS) y Vulkan (Linux/Windows, Android) a traves de wgpu.
- Procesamiento de estado y pregunta en un unico forward pass block-causal, una capacidad del motor que cambia el patron de inferencia respecto a la decodificacion token a token con cache.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el sufijo `-ja` y el ejemplo empleado indican un enfoque hacia el japones.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Demostraciones de LLM en navegador: el artefacto permite cargar el modelo en una pagina web y ejecutar inferencia local sobre WebGPU, util para demos interactivas o entornos donde no se quiere enviar datos a un servidor.
- Asistentes de atencion al cliente en japones: el ejemplo incluido, `examples/ticket-ja.json`, apunta a flujos de tickets de soporte; el motor gestiona el estado de la conversacion en la misma pasada que la pregunta entrante.
- Aplicaciones de escritorio nativas en macOS: mediante el backend Metal, se puede integrar inferencia local en aplicaciones de escritorio sin depender de runtime CUDA.
- Distribucion en Linux o Windows con Vulkan: despliegue en equipos con GPU de gama media sin necesidad de drivers propietarios de computo.
- Investigacion en formatos de exportacion: el par `tools/export_wgpu_gguf.py` mas `manifest.json` sirve como referencia para portar pesos GGUF a motores wgpu.
- Entornos con requisitos de privacidad: al ejecutarse localmente en el cliente, los datos de conversacion no salen del dispositivo, lo que encaja en escenarios con restricciones de tratamiento de datos.
- Pruebas de latencia en GPU integrada o movil: el backend Vulkan permite evaluar el modelo en hardware grafico de consumo y en dispositivos moviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 1,2 GB, por lo que el conjunto de pesos en Q4_0 esta en ese orden de magnitud. La memoria necesaria para inferencia es algo superior, ya que hay que anadir el espacio de trabajo del motor, el estado de la conversacion y los buffers de activaciones; no se proporciona una cifra oficial de VRAM.
- Por ese tamano, el modelo es candidato a ejecutarse en GPUs de consumo, pero no se documenta una lista concreta de modelos compatibles ni el soporte real por backend.
- GPU de datacenter (A100, H100): no disponible.
- GPUs de consumo (RTX 4090 y similares): no se confirma compatibilidad explicita; el motor usa wgpu, no CUDA.
- Backends soportados: WebGPU en navegador, Metal y Vulkan de forma nativa, a traves de wgpu.
- Opciones de despliegue: la CLI de grande (`grande probe --model <directorio> --request <json>`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; de hecho, la model card aclara que no es un checkpoint autonomo, por lo que no puede cargarse directamente en esos servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bokuweb/gemma-4-E2B-it-grande-wgpu-ja | no disponible (estimado en el orden de 2.000-2.400 M por tamano de repositorio y Q4_0) | no disponible | Formato grande (tensores + `manifest.json`) | gemma | HuggingFace, 0 descargas |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors (modelo base original) | gemma | Modelo base oficial |
| Distribucion GGUF equivalente de llama.cpp | no disponible | no disponible | GGUF, Q4_0 | gemma | No disponible en la informacion consultada |

No se dispone de datos de rendimiento de ninguna de las alternativas en la informacion proporcionada, por lo que la comparacion se limita al formato de pesos, la licencia y el canal de distribucion.

## Limitaciones y advertencias

- No es un checkpoint autonomo: la model card indica explicitamente que no es un formato de checkpoint independiente, por lo que no puede cargarse en vLLM, llama.cpp, Ollama o TGI sin una conversion adicional.
- Dependencia de herramienta: su uso esta ligado al motor grande y a su CLI; la interfaz documentada es `grande probe --model <directorio> --request <json>`.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de un modelo Gemma cabe esperar los sesgos del modelo base, pero no se documentan aqui.
- Riesgo de alusionacion: no evaluado en este artefacto; no se han publicado benchmarks ni evaluaciones de calidad.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el enfoque parece orientado al japones, sin confirmacion de cobertura multilingue.
- Restricciones de licencia: la licencia es "gemma" (Gemma Terms of Use), no una licencia de codigo abierto permisiva; conviene revisar sus clausulas de uso comercial, atribucion y redistribucion antes de integrarlo en un producto.
- Publicacion sin traccion: 0 descargas y 0 likes en el momento de la consulta, creada y actualizada el mismo dia; no hay validacion por parte de la comunidad ni historial de mantenimiento.
- Ausencia de model card detallada: no se documentan datos de entrenamiento, evaluaciones, limitaciones ni uso previsto mas alla del formato de exportacion.
- Fecha de creacion futura respecto a la informacion de referencia disponible (19 de septiembre de 2026), lo que impide contrastar el estado del proyecto con fuentes externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bokuweb/gemma-4-E2B-it-grande-wgpu-ja
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio del motor grande: https://github.com/bokuweb/grande
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a portadas de Wikipedia y no guardan relacion con el modelo.
