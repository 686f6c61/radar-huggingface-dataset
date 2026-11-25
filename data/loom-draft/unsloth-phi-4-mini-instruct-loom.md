# loom-draft/unsloth-Phi-4-mini-instruct-loom

## Resumen

`loom-draft/unsloth-Phi-4-mini-instruct-loom` es un paquete de despliegue para el runtime AMD Loom que empaqueta el checkpoint GGUF sin modificar `unsloth/Phi-4-mini-instruct-GGUF`, concretamente la cuantizacion `Phi-4-mini-instruct-Q4_K_M.gguf`. No se trata de un modelo nuevo ni de un fine-tuning: es una distribucion de inferencia generada con la herramienta `loom-next` (sin intervencion de un LLM en el proceso de generacion) que contiene programas `.loom`, un `model.json` con la ficha y el tokenizador, orientada a ejecutar el modelo sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es Phi-4-mini-instruct de Microsoft, un transformer denso de la familia Phi-4 en su variante compacta, distribuido por Unsloth en formato GGUF. La aportacion de este repositorio es el empaquetado especifico para el ecosistema Loom sobre ROCm, con soporte de una API compatible con OpenAI (`/v1/chat/completions`), contexto de 131.072 tokens por peticion, hasta 4 peticiones concurrentes y un limite de 4.096 tokens de salida configurado en el preset.

Su relevancia es acotada pero concreta: permite servir Phi-4-mini-instruct en hardware AMD consumer y profesional (Strix Halo y R9700) mediante un stack alternativo a llama.cpp, con verificacion criptografica de los ficheros fuente (sha256) y una bateria de puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, etc.). En el momento de la publicacion, ninguna de esas puertas tiene mediciones registradas y el repositorio no cuenta con descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-4-mini-instruct de Microsoft); empaquetado para runtime Loom |
| Parametros totales | no disponible (corresponde a Phi-4-mini-instruct; el repositorio no declara cifra) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Phi-4-mini-instruct-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| API | Compatible con OpenAI (`/v1/chat/completions`) |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0` (pipx) |

## Arquitectura y entrenamiento

El modelo base es Phi-4-mini-instruct, un transformer denso de la familia Phi-4 de Microsoft. El repositorio no incluye informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card original de Microsoft y no se reproducen aqui. Unsloth distribuye el checkpoint en formato GGUF, y este paquete utiliza la variante Q4_K_M sin modificaciones, tal como indica el autor.

La innovacion tecnica de este repositorio no esta en el modelo sino en el empaquetado: `loom-next` genera programas `.loom` y `weights.loom` a partir del GGUF y de un `llm_config.json`, y `loom-fetch` verifica el sha256 de los ficheros fuente fijados en `model.json.lock`. El runtime `loom-serve` permite ajustar el comportamiento de ejecucion mediante parametros como `completion_spin_ns` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva anticipada del pool de memoria) y `--parameter_mode=preload` (modo de carga de pesos en host). El paquete incluye ademas un `tokenizer.json` y un `info.json` con mediciones, evidencia de puertas y versiones.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones, heredadas de Phi-4-mini-instruct.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integracion con clientes existentes.
- Contexto largo de hasta 131.072 tokens por peticion, adecuado para documentos extensos o historiales de conversacion amplios.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Tool calling: no aplicable segun la tabla de caracteristicas del autor.
- Reasoning / thinking mode: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen o audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat autohospedado en hardware AMD: desplegar un endpoint compatible con OpenAI sobre Strix Halo o R9700 para prototipos y entornos de desarrollo, usando `loom-serve` y el cliente HTTP estandar.
- Procesamiento de documentos largos en local: con 131.072 tokens de contexto, el modelo puede recibir informes, contratos o transcripciones extensas en una sola peticion para tareas de resumen o extraccion, sin depender de servicios en la nube.
- Evaluacion de la paridad con llama.cpp: el paquete incluye puertas de correccion (`golden`, `compare`, `logits`, `sampling`) disenadas para comparar la salida token a token contra una referencia de llama.cpp sobre el mismo GGUF, lo que lo hace util como banco de pruebas del runtime Loom.
- Integracion en pipelines de CI que validen kernels: los tests `kernel_tests` y `consistency` permiten comprobar que los kernels generados coinciden con implementaciones de referencia y que las peticiones concurrentes producen la misma salida que las aisladas.
- Despliegue en estaciones de trabajo con GPU profesional AMD: la variante para Radeon AI PRO R9700 (32 GB) esta pensada para servir el modelo en un equipo unico con memoria suficiente para el Q4_K_M y el pool fijo.
- Reproducibilidad de entornos: el uso de `model.json.lock` con verificacion sha256 y de una version fijada de `hrx-loom` facilita reconstruir exactamente el mismo entorno de inferencia en distintas maquinas.
- Base para experimentos de serving alternativo: util para investigadores que quieran comparar latencia, throughput y fidelidad de salida frente a llama.cpp en el mismo hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican explicitamente que "the results for this package are not yet re-measured". Del mismo modo, todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es Q4_K_M de Phi-4-mini-instruct y el paquete esta orientado a GPU con al menos 32 GB (Radeon AI PRO R9700) o a la memoria unificada de Strix Halo.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que depende del runtime Loom sobre ROCm.
- Cabe en GPU consumer: si, en el caso de Strix Halo (APU con memoria unificada); para GPUs discretas consumer AMD no se declara soporte.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete.
- Parametros de ejecucion recomendados por el autor: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, consume CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` y `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones no se han vuelto a realizar para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|---|
| `loom-draft/unsloth-Phi-4-mini-instruct-loom` (este) | no disponible (Phi-4-mini) | 131.072 | GGUF Q4_K_M empaquetado en `.loom` | MIT | AMD Strix Halo, R9700 | Paquete de serving para runtime Loom; sin benchmarks ni puertas de correccion medidas |
| `unsloth/Phi-4-mini-instruct-GGUF` | Phi-4-mini-instruct | no disponible en la informacion | GGUF | MIT (heredada) | Generico (llama.cpp y similares) | Checkpoint base sin modificar; referencia para las comparaciones del paquete Loom |
| Phi-4-mini-instruct (Microsoft) | Phi-4-mini-instruct | no disponible en la informacion | safetensors y otras | MIT | Generico | Modelo original; datos de entrenamiento y benchmarks no incluidos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a formato, licencia y plataforma de ejecucion.

## Limitaciones y advertencias

- El repositorio no es un modelo nuevo: cualquier limitacion de calidad, sesgo o alucinacion de Phi-4-mini-instruct se hereda sin cambios, ya que el GGUF se distribuye sin modificar.
- No hay evidencia de correccion registrada: todas las puertas (`golden`, `compare`, `consistency`, `logits`, etc.) figuran como no re-medidas, por lo que no esta demostrada la equivalencia de salida con llama.cpp.
- No hay mediciones de rendimiento para este paquete en ninguna de las dos plataformas objetivo.
- El soporte de hardware esta restringido a AMD Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se declara compatibilidad con GPUs NVIDIA ni con otras GPU AMD.
- La tabla de caracteristicas marca tool calling, reasoning/thinking, decodificacion especulativa y entrada de imagen/audio como "no aplicable"; el estado del muestreo figura como "no determinado".
- El limite de salida es de 4.096 tokens por peticion, inferior al contexto de entrada; las tareas que requieran respuestas mas largas necesitaran trocear la generacion.
- El parametro `completion_spin_ns=4294967295` implica espera activa y consumo de CPU mientras hay trabajo en GPU en vuelo; conviene tenerlo en cuenta en entornos con CPU limitada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (25 de noviembre de 2026), lo que sugiere un estado inicial y poca validacion externa.
- La licencia declarada es MIT, lo que en principio permite uso comercial, pero debe verificarse que se mantienen los avisos de copyright correspondientes al modelo base.
- Los resultados de la busqueda web no aportan informacion tecnica relevante sobre este modelo: corresponden a productos no relacionados (Loom la herramienta de grabacion de pantalla y Loom la marca de ropa).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-Phi-4-mini-instruct-loom
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Phi-4-mini-instruct-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
