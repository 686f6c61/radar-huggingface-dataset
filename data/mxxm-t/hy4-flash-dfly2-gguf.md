# mxxm-t/Hy4-flash-DFly2-GGUF

## Resumen

Hy4-flash-DFly2-GGUF es la conversion a formato GGUF del drafter especulativo DFly2 (block size 6) desarrollado por AngelSlim (Tencent) para el modelo objetivo Hy4-flash. No se trata de un modelo autonomo: es un modelo borrador que propone bloques de tokens que el modelo objetivo verifica, acelerando la decodificacion mediante speculative decoding de tipo block-parallel. La conversion la firma el usuario mxxm-t y se publica bajo licencia Apache-2.0, heredada del checkpoint original.

El drafter emplea una arquitectura MoE ligera con tres capas, cada una con 128 expertos enrutados y 3 activos, emparejadas con las capas 33, 37 y 41 del objetivo. Aprovecha el mecanismo de KV sharing de DeepSeek Sparse Attention (DSA): no mantiene cache KV propia y lee la del objetivo en las posiciones seleccionadas por su indexer. Dispone ademas de una cabeza de correccion de 5 pasos que rellena los huecos del bloque.

Su relevancia es fundamentalmente prospectiva: en el momento de la publicacion ningun runtime carga estos pesos. Ni mx-llama.cpp ni llmx ejecutan el objetivo Hy4-flash, y el soporte de drafting DFly2 se esta construyendo primero para DeepSeek-V4.1-Flash. El repositorio se publica para que la conversion este disponible cuando exista soporte de ejecucion, por lo que hoy no es utilizable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con 3 capas de borrador, 128 expertos enrutados por capa y 3 activos; DFly2 block-parallel speculative drafter con KV sharing sobre DSA del objetivo |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo objetivo Hy4-flash) |
| Tipos de cuantizacion | Q8_0 (expertos y lineales densos), BF16 (lossless respecto al checkpoint) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint original) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa DFly2, entrenado con el framework AngelSpec de Tencent para decodificacion especulativa block-parallel y MTP. Cada una de sus tres capas MoE se empareja con una capa del objetivo que usa DeepSeek Sparse Attention (capas 33, 37 y 41 de Hy4-flash) y lee la cache KV ya calculada por esa capa, sin mantener KV propia. Una cabeza de correccion de 5 pasos rellena los slots del bloque de tamano 6. El drafter comparte embedding y cabeza de salida con el objetivo, por lo que no los almacena.

Los expertos enrutados operan en un latente de 1536 dimensiones: `ffn_routed_down` proyecta hacia ese espacio y `ffn_routed_up` de vuelta, con `ffn_combine_norm` como nuevo nombre de tensor respecto a `combine_output_norm` del checkpoint. El checkpoint original entrega los expertos enrutados en BF16 (no en FP4, por lo que no existe variante MXFP4). En la conversion Q8_0, expertos enrutados y todos los lineales densos (atencion, experto compartido, proyecciones de fusion y correccion) se almacenan en Q8_0; el router y el sesgo de experto permanecen en F32, `corr.block_gate` en BF16, y normas, sinks de atencion y tablas de sesgo en F32. El tokenizer del checkpoint no existe, por lo que se usa el del objetivo con token de mascara 120009. No se reentrenaron ni ajustaron pesos.

## Capacidades

- Generacion de tokens de borrador para decodificacion especulativa sobre Hy4-flash; no genera texto de forma autonoma.
- Borrado block-parallel con block size 6 y verificacion por el modelo objetivo.
- KV sharing: lectura de la cache KV del objetivo en las posiciones elegidas por el indexer de DSA.
- Cabeza de correccion de 5 pasos para rellenar slots del bloque.
- Comparticion de embedding y cabeza de salida con el objetivo.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible (depende del objetivo, no del drafter).
- Capacidades multilingues: no disponible.

## Casos de uso

- Aceleracion de inferencia de Hy4-flash en produccion: una vez exista un runtime compatible, el drafter propone bloques de 6 tokens que el objetivo verifica, reduciendo el numero de pasos de decodificacion en cargas de generacion larga.
- Despliegue en entornos con presupuesto de VRAM ajustado: la variante Q8_0 ocupa 3,32 GB y la BF16 6,25 GB, un coste adicional modesto frente al modelo objetivo completo.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de un drafter DFly2 con KV sharing sobre un objetivo con atencion dispersa (DSA).
- Evaluacion de pipelines de conversion GGUF: el repositorio documenta la correspondencia de 91 tensores GGUF frente a 88 del checkpoint, util para validar conversores y nombres de tensor.
- Pruebas de integracion de runtimes: permite a desarrolladores de mx-llama.cpp o llmx validar la carga de claves DFly2 (`dflash.kind`, block size, capas KV e index, token de mascara) cuando implementen el soporte.
- Benchmarking de latencia en speculative decoding: comparar throughput con y sin drafter sobre el mismo objetivo, midiendo la tasa de aceptacion de tokens borrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 3,32 GB para la variante Q8_0 y 6,25 GB para la BF16, adicionales a la VRAM del modelo objetivo Hy4-flash.
- GPU recomendadas: no disponible; depende del objetivo y del runtime, que aun no existe.
- Cabe en GPU de consumo: los pesos del drafter caben en cualquier GPU con 8 GB o mas, pero el objetivo completo condiciona el requisito real.
- Opciones de despliegue: ninguna operativa. Se espera integracion en mx-llama.cpp (rama `feat/dfly2-convert` para la conversion, clase `Hy4DFly2Model`) y en llmx; el flag `--spec-type` es un marcador de posicion no definitivo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-DFly2-GGUF (este) | Drafter DFly2, block size 6 | no disponible | no disponible | Apache-2.0 | Pesos publicados, sin runtime |
| AngelSlim/Hy4-flash-DFly2-B6 | Drafter DFly2 original (safetensors) | no disponible | no disponible | Apache-2.0 | Pesos publicados, sin runtime |
| Drafters DFly2 para DeepSeek-V4.1-Flash | Drafter DFly2 | no disponible | no disponible | no disponible | Soporte de runtime en desarrollo |
| tencent/Hy4-flash | Modelo objetivo MoE | no disponible | no disponible | no disponible | Pesos publicados |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo Hy4-flash y su verificacion no produce salida valida.
- Ningun runtime carga estos pesos actualmente; no hay linea de comandos funcional y los nombres de tensor pueden cambiar con el soporte futuro.
- No se publica un GGUF del modelo objetivo junto a este repositorio, por lo que falta la pieza necesaria para ejecutarlo.
- La cuantizacion Q8_0 introduce perdida numerica en el drafter, aunque el objetivo verifica cada token y la salida final no cambia.
- No hay datos de benchmarks, idiomas ni tamano de parametros en la informacion disponible.
- La licencia Apache-2.0 cubre el drafter; el modelo objetivo esta sujeto a su propia licencia, que debe verificarse antes de uso comercial.
- Riesgo de alucinacion y sesgos: no evaluables en un drafter verificado por el objetivo; dependen del modelo objetivo.
- Uso en produccion desaconsejado hasta que exista soporte de ejecucion estable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mxxm-t/Hy4-flash-DFly2-GGUF
- Checkpoint original: https://huggingface.co/AngelSlim/Hy4-flash-DFly2-B6
- Modelo objetivo: https://huggingface.co/tencent/Hy4-flash
- Repositorio mx-llama.cpp: https://github.com/mxxm-t/mx-llama.cpp
- Repositorio AngelSpec: https://github.com/Tencent/AngelSpec
- Documentacion AngelSpec: https://angelspec.readthedocs.io
- Coleccion AngelSpec en Hugging Face: https://huggingface.co/collections/AngelSlim/angelspec
- Informe tecnico (arXiv 2607.25852): https://arxiv.org/abs/2607.25852
- Paper DFly2 (arXiv 2611.34776): https://arxiv.org/abs/2611.34776
