# cicalooo/MOSSLiteTE

## Resumen

MOSSLiteTE es un codificador de texto ligero para el sistema de generacion de imagenes MOSS-Image, publicado por el usuario cicalooo en Hugging Face. Se trata de una conversion a formato nativo de ComfyUI del adaptador `recoilme/moss_te_adapter`, que combina un Qwen3.5-0.8B (version solo texto, sin componentes visuales) con una cabeza de regresion de 158 millones de parametros. Su proposito es sustituir el codificador de texto nativo de MOSS-Image, basado en Qwen3.5-9B, reduciendo drasticamente el peso en disco y la VRAM necesaria: el conjunto completo ocupa aproximadamente 1,8 GB frente a los varios GB del encoder de 9B.

El problema que resuelve es la barrera de hardware y de integracion: permite ejecutar MOSS-Image en ComfyUI con un consumidor de recursos mucho menor, manteniendo una calidad de condicionamiento razonable (coseno de ~0,92 respecto al encoder nativo de 9B, segun la model card del adaptador original). Es relevante para usuarios de ComfyUI que quieren generar imagenes con MOSS-Image en GPUs de consumo sin sacrificar demasiada fidelidad en la interpretacion de los prompts.

El paquete se distribuye en dos ficheros safetensors en bf16: el modelo de lenguaje Qwen3.5-0.8B podado (sin modulos `mtp.*` ni `model.visual.*`) y la cabeza de regresion `mosslite_te_head`. Requiere el node pack ComfyUI-MOSSLiteTE para funcionar dentro de ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de texto: LLM Qwen3.5-0.8B (solo texto) + cabeza de regresion de 158M |
| Parametros totales | ~0,8B (LLM) + 158M (cabeza de regresion) |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | 1024 tokens (los prompts mas largos se truncan) |
| Tipos de cuantizacion | bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El componente principal es Qwen3.5-0.8B, del que se ha eliminado todo lo no necesario para codificacion de texto: los pesos del modulo MTP (multi-token prediction) y la torre visual (`model.visual.*`) se han descartado, dejando un LLM puramente textual. Sobre sus salidas actua una cabeza de regresion de 158 millones de parametros, cuyo papel es proyectar las representaciones del LLM pequeno al espacio de condicionamiento que espera el modelo de difusion MOSS-Image, imitando la salida del encoder nativo Qwen3.5-9B. No es un modelo generativo por si mismo: es un componente de un pipeline de imagen.

El entrenamiento se realizo sobre MOSS-Image-Base, con el objetivo de maximizar la similitud (coseno ~0,92) entre las incrustaciones producidas por este encoder ligero y las del encoder nativo de 9B. La model card indica que no se ha probado con la variante SFT de MOSS-Image, por lo que su comportamiento con checkpoints ajustados no esta verificado. No se dispone de informacion sobre el numero de tokens, la composicion del dataset ni el uso de tecnicas como RLHF o DPO, dado que no es un modelo conversacional.

Como detalle de ingenieria, la conversion a ComfyUI se verifico con paridad 1.0 respecto a la implementacion de referencia, es decir, produce resultados identicos al adaptador original fuera de ComfyUI.

## Capacidades

- Codificacion de prompts de texto para el pipeline de generacion de imagenes MOSS-Image, como sustituto ligero del encoder Qwen3.5-9B nativo.
- Procesamiento exclusivamente textual: no acepta entradas de imagen en el encoder.
- Gestion de prompts de hasta 1024 tokens; los prompts mas largos se truncan.
- Integracion nativa en ComfyUI mediante el node pack ComfyUI-MOSSLiteTE.
- Reproduccion exacta (paridad 1.0) de la implementacion de referencia del adaptador original.
- No genera texto ni imagenes por si mismo, no soporta tool calling ni razonamiento multi-paso: su funcion es unicamente servir de codificador de condicionamiento.

## Casos de uso

- Generacion de imagenes con MOSS-Image en GPUs de consumo: al reducir el encoder de 9B a ~1,8 GB, usuarios con tarjetas de gama media pueden ejecutar el pipeline completo sin agotar la VRAM, liberando memoria para el modelo de difusion y mayores resoluciones.
- Workflows de ComfyUI en local: la integracion nativa permite anadir el encoder como un nodo mas en grafos complejos de ComfyUI, junto a loaders, samplers y upscalers, sin dependencias externas.
- Optimizacion de pipelines de produccion ligeros: en despliegues donde se generan muchas imagenes por segundo, un encoder mas pequeno reduce la latencia del paso de codificacion del prompt.
- Experimentacion con adaptadores de destilacion de encoders: la cabeza de regresion de 158M sirve como ejemplo practico de como aproximar un encoder grande con uno pequeno, util para investigadores que exploran destilacion de condicionamiento textual.
- Sistemas con almacenamiento limitado: el repo completo ocupa 1,8 GB frente a los multiples GB del encoder de 9B, util en setups con discos pequenos o descargas frecuentes de modelos.
- Prototipado rapido de prompts: la menor huella de memoria permite iterar prompts rapidamente en portatiles con GPU dedicada antes de pasar a hardware mayor para la produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento publicado es la metrica de aproximacion del encoder: aproximadamente 0,92 de similitud coseno respecto al encoder nativo Qwen3.5-9B, segun la model card del adaptador original de recoilme.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB solo para el encoder en bf16 (0,8B de LLM + 158M de cabeza); la VRAM total dependera del modelo de difusion MOSS-Image que se use junto a el.
- GPU recomendadas: no disponible; por su tamano, cualquier GPU moderna con al menos 4 GB de VRAM deberia alojar el encoder sin problemas, dejando el resto para el modelo de imagen.
- Cabe en GPUs de consumo: si, es precisamente su objetivo; tarjetas como una RTX 3060 de 12 GB o una RTX 4060 Ti deberian ejecutar el pipeline completo con holgura en el componente de texto.
- Opciones de despliegue: ComfyUI mediante el node pack ComfyUI-MOSSLiteTE (via de uso prevista); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo standalone.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Caracteristica | MOSSLiteTE (0.8B + head) | Encoder nativo MOSS-Image (Qwen3.5-9B) | T5-XXL (usado en Flux) |
|---|---|---|---|
| Parametros | ~0,8B + 158M | ~9B | ~4,7B |
| Tamano aproximado | ~1,8 GB (bf16) | no disponible | ~9-19 GB segun precision |
| Contexto | 1024 tokens | no disponible | 512 tokens |
| Formato | safetensors (bf16, ComfyUI) | no disponible | safetensors |
| Licencia | Apache-2.0 | no disponible | Apache-2.0 |
| Integracion | ComfyUI nativa | pipeline original MOSS-Image | ComfyUI / diffusers |
| Fidelidad | coseno ~0,92 vs nativo | referencia (1,0) | referencia en su pipeline |

La alternativa principal es el encoder nativo Qwen3.5-9B de MOSS-Image: mayor fidelidad, pero un consumo de recursos muy superior. MOSSLiteTE sacrifica alrededor de un 8% de similitud coseno a cambio de una fraccion del tamano y la VRAM.

## Limitaciones y advertencias

- Aproximacion imperfecta: con coseno ~0,92 respecto al encoder nativo de 9B, es esperable alguna perdida de fidelidad en la adherencia al prompt, especialmente en prompts complejos o con composiciones detalladas.
- Limite de 1024 tokens: los prompts mas largos se truncan, lo que puede degradar resultados en descripciones extensas.
- Validado solo sobre MOSS-Image-Base: no se ha probado con la variante SFT, por lo que su comportamiento con checkpoints ajustados no esta garantizado.
- Solo texto: el encoder no admite entradas de imagen; no sirve para flujos que requieran condicionamiento visual en el encoder.
- Uso restringido al ecosistema MOSS-Image/ComfyUI: no es un LLM de proposito general y requiere el node pack ComfyUI-MOSSLiteTE.
- Proyecto comunitario con 0 descargas registradas en el momento de la ficha: escaso historial de uso y validacion por terceros; conviene probarlo antes de usarlo en produccion.
- Restricciones de licencia: Apache-2.0, sin limitaciones relevantes para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cicalooo/MOSSLiteTE
- Node pack ComfyUI: https://github.com/cicalooo/ComfyUI-MOSSLiteTE
- Adaptador original: https://huggingface.co/recoilme/moss_te_adapter
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Organizacion MOSS-Image (OpenMOSS): https://huggingface.co/OpenMOSS
