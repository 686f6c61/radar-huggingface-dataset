# chienhsinlin/helioslm-chat-26b-a4b-GGUF

## Resumen

HeliosLM Chat 26B-A4B es un modelo conversacional derivado de Google Gemma 4 26B-A4B-it, publicado por Bitstar Inc. bajo el identificador `chienhsinlin/helioslm-chat-26b-a4b-GGUF`. El modelo parte de la arquitectura de mezcla de expertos (MoE) de Gemma 4, con 26 000 millones de parametros totales y aproximadamente 4000 millones activos por token, y se distribuye unicamente en formato GGUF cuantizado para su uso con llama.cpp.

El ajuste consiste en un preentrenamiento continuado sobre datos publicos en chino tradicional de Taiwan e ingles, seguido de la reincorporacion de la diferencia respecto al modelo base mediante la tecnica de *chat vector*. Ademas, el autor ha integrado un system prompt por defecto de HeliosLM dentro de la plantilla de chat, orientado a presentacion personal, terminologia local de Taiwan y neutralidad ante temas controvertidos. Esta version mantiene deliberadamente los segmentos de razonamiento cortos.

Su relevancia practica radica en la eficiencia de despliegue: al ser un MoE, permite ejecutar un modelo de 26B con solo unos 6 GB de VRAM si se descargan parte de las capas de expertos a memoria del sistema con llama.cpp, lo que lo hace viable en GPU de consumo de 8 GB. La licencia Apache-2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Gemma 4 |
| Parametros totales | 25 233 142 046 (~26B) |
| Parametros activos | ~4B por token |
| Longitud de contexto | no disponible (los ejemplos de despliegue usan `-c 8192` y `-c 16384`) |
| Tipos de cuantizacion | GGUF 4-bit (Q4_K_M); el autor no detalla otras variantes publicadas |
| Idiomas soportados | chino (tradicional, Taiwan), ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`helioslm-chat-26b-a4b-Q4_K_M.gguf`, ~17 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de mezcla de expertos de Gemma 4 26B-A4B-it: 26B parametros totales con aproximadamente 4B activos por token, lo que reduce el coste computacional por inferencia frente a un modelo denso del mismo tamano. El proceso de adaptacion descrito por el autor consta de un preentrenamiento continuado sobre datos publicos en chino tradicional de Taiwan, ingles y otros idiomas, tras el cual se calcula la diferencia de pesos respecto al modelo base instruct y se reinyecta como *chat vector*. Este enfoque permite conservar las capacidades del modelo original mientras se desplaza el estilo y la cobertura linguistica hacia el chino tradicional.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO adicionales. Tampoco se documentan innovaciones de decodificacion (por ejemplo, decodificacion especulativa) mas alla del soporte estandar de llama.cpp. Un detalle relevante de diseno es la inclusion de un system prompt por defecto dentro de la plantilla de chat, que define la identidad del asistente y su postura neutral ante temas sensibles.

## Capacidades

- Generacion de texto conversacional multi-turno en chino tradicional e ingles.
- Razonamiento con modo de pensamiento (*thinking*) configurable; el autor indica que esta version produce segmentos de razonamiento cortos y permite desactivarlo con `--reasoning-budget 0` y `enable_thinking: false`.
- Comprension y produccion de chino tradicional con terminologia de Taiwan, incluyendo variantes lexicas locales.
- Neutralidad ante temas controvertidos, segun el system prompt integrado.
- Ejecucion local mediante llama.cpp, con soporte de plantillas Jinja (`--jinja`).
- Compatibilidad con endpoints (tag `endpoints_compatible` en el repositorio).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistencia conversacional en chino tradicional para usuarios de Taiwan: el modelo responde con terminologia y registro local gracias al preentrenamiento continuado y al system prompt integrado, lo que reduce la necesidad de instrucciones de estilo adicionales.
- Despliegue en estaciones de trabajo con GPU de 8 GB: mediante `--n-cpu-moe 24` y unos 32 GB de RAM del sistema, se puede servir un modelo de 26B en hardware de consumo, adecuado para prototipos y uso personal.
- Traduccion y adaptacion de contenido entre ingles y chino tradicional: el modelo puede reformular textos manteniendo variantes lexicas de Taiwan, util para localizacion editorial.
- Atencion al cliente automatizada en mercados de habla china tradicional: la ventana de contexto configurable (8192 o 16384 tokens en los ejemplos) permite gestionar conversaciones multi-turno con historial extenso.
- Generacion de contenido con sesgo neutral: para resumenes o respuestas sobre temas sensibles donde se requiere una postura equilibrada, el system prompt por defecto ayuda a mantener la neutralidad.
- Experimentacion con tecnicas de adaptacion eficiente: el uso de *chat vector* sobre un modelo base MoE sirve como caso de estudio para investigadores que quieran replicar el metodo en otros dominios o idiomas.
- Inferencia en entornos con VRAM muy limitada: con `--cpu-moe` el consumo baja a unos 3 GB de VRAM, lo que permite ejecutarlo en GPU de gama baja a costa de menor velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 6 GB con `--n-cpu-moe 24` (expertos parcialmente en RAM); unos 3 GB con `--cpu-moe`; modelo completo en GPU con 24 GB o mas de VRAM.
- Memoria del sistema: aproximadamente 32 GB de RAM necesarios para el despliegue parcial en CPU.
- GPU recomendadas: RTX 3090/4090 o superiores (24 GB) para carga completa; GPU de 8 GB para despliegue hibrido; A100/H100 para servicio de alta concurrencia.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB mediante descarga de expertos a RAM, y en tarjetas de 24 GB con carga completa.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de plantillas Jinja; el repositorio incluye la etiqueta `endpoints_compatible`. No se documenta soporte explicito para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; el autor solo indica que la variante `--cpu-moe` es "un poco mas lenta" que el despliegue hibrido con `--n-cpu-moe`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| HeliosLM Chat 26B-A4B | ~26B | ~4B | no disponible | Apache-2.0 | GGUF |
| google/gemma-4-26B-A4B-it (base) | ~26B | ~4B | no disponible | Apache-2.0 (segun el autor) | safetensors |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas directa es con el modelo base Gemma 4 26B-A4B-it, del que hereda arquitectura, tamano y licencia; la diferencia principal es la adaptacion al chino tradicional de Taiwan y el system prompt integrado. No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo puede generar informacion erronea o desactualizada; es necesario verificar los contenidos importantes.
- El preentrenamiento continuado puede degradar capacidades del modelo base en tareas distintas del chino tradicional y el ingles; no hay evaluaciones publicadas que lo cuantifiquen.
- Cobertura linguistica limitada a chino e ingles; el rendimiento en otras lenguas no esta documentado.
- El system prompt integrado en la plantilla de chat impone una identidad y una postura determinadas; puede requerir ajustes para usos que no encajen con ese perfil.
- La distribucion es unicamente en GGUF 4-bit (Q4_K_M), lo que implica cierta perdida de precision frente a los pesos originales en safetensors; no se ofrecen variantes de mayor precision en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- Aunque la licencia es Apache-2.0, conviene confirmar las condiciones de uso del modelo base Gemma 4 antes de un despliegue comercial.
- El contexto maximo real no esta documentado; los ejemplos del autor usan 8192 y 16384 tokens, que no deben interpretarse como el limite de la arquitectura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chienhsinlin/helioslm-chat-26b-a4b-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Sitio web del proyecto: https://helioslm.pages.dev/
- llama.cpp (libreria de inferencia): https://github.com/ggml-org/llama.cpp
