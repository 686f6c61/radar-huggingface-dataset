# loom-draft/unsloth-LFM2-1.2B-loom

## Resumen

LFM2-1.2B-loom es un paquete de despliegue para GPUs AMD generado a partir del checkpoint GGUF cuantizado `LFM2-1.2B-Q4_K_M.gguf` del modelo LiquidAI LFM2-1.2B, publicado por Unsloth. No se trata de un modelo nuevo ni de un ajuste fino: el repositorio contiene programas `.loom` y una tarjeta `model.json` que permiten ejecutar los pesos originales sin modificaciones en las GPUs AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El autor es `loom-draft`, y el paquete se ha generado con la herramienta `loom-next` sin intervención de un LLM en el proceso.

El interes practico esta en el entorno de ejecucion: Loom es un stack de inferencia nativo para ROCm que expone una API compatible con OpenAI (`/v1/chat/completions`) y compila kernels especificos para la arquitectura de la GPU objetivo. El paquete declara soporte de 32.768 tokens de contexto por peticion, 4 peticiones concurrentes y un maximo de 4.096 tokens de salida. No obstante, la propia model card indica que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `consistency`, etc.) aun no se han vuelto a medir para este paquete, por lo que no hay evidencia publicada de su comportamiento numerico.

La relevancia del artefacto es, por tanto, la de un ejemplo temprano de empaquetado de modelos abiertos para el ecosistema AMD via Loom, no la de un modelo con capacidades nuevas. El modelo subyacente, LFM2-1.2B, es un transformer pequeno de LiquidAI orientado a inferencia en el borde; este repositorio solo aporta la capa de despliegue. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM2-1.2B de LiquidAI); paquete de ejecucion Loom para ROCm |
| Parametros totales | 1,2 mil millones (heredado del modelo base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 32.768 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; consultar terminos de LFM2) |
| Formato de pesos | GGUF (`LFM2-1.2B-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

El paquete no define una arquitectura propia: envuelve el checkpoint GGUF de LFM2-1.2B, un transformer de 1,2 mil millones de parametros desarrollado por LiquidAI y distribuido por Unsloth en formato GGUF. La model card del paquete no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base uso RLHF, DPO u otras tecnicas de alineamiento; esos datos corresponden a la documentacion de LFM2 y no se incluyen aqui.

La innovacion tecnica del repositorio esta en la capa de ejecucion. `loom-next` genera kernels especificos para las arquitecturas gfx1151 (Strix Halo) y gfx1201 (R9700) a partir de la configuracion del modelo (`llm_config.json`), y `loom-serve` los ejecuta con un pool de memoria de respaldo fijo (`--pool_backing=fixed`) y precarga de parametros en host (`--parameter_mode=preload`). La opcion `completion_spin_ns=4294967295` activa espera activa de las finalizaciones de GPU, que consume CPU mientras hay trabajo en vuelo. El paquete incluye ademas un tokenizador (`tokenizer.json`) y un fichero `info.json` con las mediciones y versiones, aunque las filas de rendimiento y correccion aparecen como "not yet re-measured".

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Contexto de 32.768 tokens por peticion, adecuado para documentos medianos y conversaciones multi-turno largas.
- Hasta 4 peticiones concurrentes con salida maxima de 4.096 tokens por peticion.
- Tool calling: no aplicable segun la model card.
- Razonamiento / thinking mode: no aplicable.
- Decodificacion especulativa: no aplicable.
- Entrada de imagen: no aplicable.
- Entrada y salida de audio: no aplicable.
- Muestreo (temperature, top_k, seed): estado "no determinado" en la model card; la puerta de correccion `sampling` no se ha medido.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de inferencia en GPUs AMD: el paquete permite levantar un endpoint compatible con OpenAI en una Strix Halo o una R9700 con dos comandos (`loom-fetch` y `loom-serve`), lo que sirve para validar pipelines de aplicaciones antes de invertir en hardware o en portabilidad a otras plataformas.
- Evaluacion comparativa de stacks de inferencia: al ejecutar el mismo GGUF Q4_K_M que usaria llama.cpp, permite contrastar latencia, consumo de memoria y fidelidad de logits entre Loom y llama.cpp sobre la misma GPU, una vez se publiquen las mediciones pendientes.
- Asistentes conversacionales de contexto medio: con 32.768 tokens por peticion y 4 peticiones concurrentes, puede sostener sesiones de chat con historial largo en entornos de demostracion o internos.
- Procesamiento por lotes de documentos de hasta 32k tokens: resumenes, extraccion de campos o clasificacion de textos largos en un unico paso, sin necesidad de trocear el documento.
- Desarrollo en equipos con hardware AMD: permite a desarrolladores que trabajan sobre ROCm disponer de un servidor local de chat sin depender de CUDA ni de servicios en la nube.
- Banco de pruebas de cuantizacion: al fijar Q4_K_M como unica cuantizacion, sirve para medir el impacto de esa precision en la calidad de salida frente a otros formatos del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un checkpoint de 1,2 mil millones de parametros en Q4_K_M ocupa aproximadamente 0,7-0,9 GB de pesos, a lo que hay que sumar el pool de memoria fijo del runtime y el espacio para KV cache de hasta 32.768 tokens, cuyo tamano exacto no se detalla.
- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se documenta soporte para GPUs de consumo (Radeon RX, GeForce). El paquete esta generado para las dos arquitecturas AMD citadas.
- Opciones de despliegue: `loom-fetch` (version `hrx-loom[hf]==0.2.0`) para descargar el paquete y `loom-serve` para servir el endpoint. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card estan pendientes de medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2-1.2B-loom (este paquete) | 1,2 B | 32.768 tokens por peticion | GGUF Q4_K_M empaquetado en `.loom`, runtime Loom sobre ROCm | other | Hugging Face, 0 descargas |
| unsloth/LFM2-1.2B-GGUF (modelo base) | 1,2 B | no disponible en la informacion proporcionada | GGUF, ejecutable con llama.cpp y derivados | other | Hugging Face (repositorio de origen) |
| LFM2-1.2B (checkpoint original de LiquidAI) | 1,2 B | no disponible en la informacion proporcionada | safetensors, ejecutable con transformers y otros | other | Hugging Face |

La comparativa se limita al mismo modelo en distintos formatos porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastarlo con alternativas de tamano similar. No se dispone de cifras de benchmarks para ninguno de los tres formatos en esta ficha.

## Limitaciones y advertencias

- Ausencia de evidencia de correccion: todas las puertas de validacion (`golden`, `compare`, `consistency`, `sampling`, `logits`, etc.) figuran como no medidas, por lo que no hay garantia publicada de que la salida coincida con la referencia de llama.cpp.
- Ausencia de mediciones de rendimiento: no se han publicado cifras de latencia ni throughput para ninguna de las dos GPUs objetivo.
- Ambito de hardware muy restringido: el paquete solo declara soporte para gfx1151 y gfx1201; no se documenta funcionamiento en otras GPUs AMD ni en NVIDIA.
- Funcionalidades ausentes: sin tool calling, sin modo de razonamiento, sin decodificacion especulativa, sin vision ni audio. Esto limita su uso en pipelines de agentes.
- Estado del muestreo indeterminado: la model card marca la fila `sampling` como "not determined", lo que impide asumir el comportamiento de temperature, top_k y seed sin verificacion propia.
- Licencia "other": los terminos concretos no se detallan en la informacion proporcionada; es imprescindible revisar la licencia del modelo base LFM2 antes de cualquier uso comercial.
- Idiomas no declarados: no se especifica que lenguas soporta el modelo, lo que desaconseja su uso en produccion multilingue sin evaluacion previa.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al ser un modelo de 1,2 B parametros, la tasa de errores facticos es previsiblemente alta en tareas de conocimiento, aunque no se aportan datos al respecto.
- Madurez del artefacto: repositorio con 0 descargas y 0 likes, publicado y actualizado el mismo dia, sin historial de uso que permita inferir estabilidad.
- Nota sobre la busqueda web: los resultados obtenidos corresponden a la aplicacion de grabacion de pantalla Loom y a la marca de ropa Loom, sin relacion con este proyecto. No se han encontrado enlaces adicionales del ecosistema Loom para IA distintos de los citados en la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/unsloth-LFM2-1.2B-loom
- Modelo base en Hugging Face: https://huggingface.co/unsloth/LFM2-1.2B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
