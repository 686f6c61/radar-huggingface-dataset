# recoilme/moss_te_adapter

## Resumen

`recoilme/moss_te_adapter` no es un modelo generativo autónomo, sino un adaptador de destilación que sustituye el codificador de texto del pipeline MOSS-Image. El MOSS-Image original condiciona su DiT con los estados ocultos de Qwen3.5-VL-9B, lo que ocupa 15,63 GiB en bf16 y eleva el pico de VRAM del pipeline completo a unos 25,4 GiB, impidiendo su ejecución en tarjetas de 16 GB. Este adaptador reemplaza ese codificador por un Qwen3.5-0.8B congelado más una cabeza de regresión de 158,4 M parámetros que reproduce la misma condición `(L, 4096)`.

Lo desarrolla el usuario `recoilme`, no el equipo de OpenMOSS, y se distribuye bajo licencia Apache-2.0. El DiT, el VAE y el scheduler de MOSS-Image-Base no se modifican: el adaptador solo intercepta la fase de codificación del prompt. Con él, el pico de VRAM a 1024 px y 30 pasos baja a 12,7 GiB, lo que abre el pipeline a GPUs de consumo de 16 GB.

Su relevancia es práctica: permite experimentar con MOSS-Image en hardware asequible a cambio de una fidelidad imperfecta frente al codificador nativo (coseno medio de 0,924 en 128 captions reservadas, con un error relativo del 33,4 %). Es una pieza de ingeniería orientada a reducir requisitos de memoria, no un sustituto del modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de regresión (MLP 6144→6144→6144→4096 + 2 bloques de self-attention sobre tokens + 2 bloques de atención sobre el eje de slices, con residuales y zero-init) sobre estados ocultos congelados de Qwen3.5-0.8B |
| Parametros totales | 158,4 M en la cabeza; 0,8 B en el estudiante congelado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el metadato `attn_max_len` existe en el fichero, pero el valor no se publica) |
| Tipos de cuantizacion | Pesos en bf16; no se documentan otras cuantizaciones (GGUF, int8, etc.) |
| Idiomas soportados | No disponible (heredados del tokenizer del teacher, 248.077 tokens) |
| Licencia | Apache-2.0 (se aplican además las licencias upstream de MOSS-Image y Qwen3.5-0.8B) |
| Formato de pesos | safetensors (`adapter.safetensors`, 0,6 GB de repo) |

## Arquitectura y entrenamiento

La cabeza toma como entrada los estados ocultos de las capas `[4, 8, 12, 16, 20, 24]` de Qwen3.5-0.8B (es decir, tras sus capas de atención completa 3, 7, 11, 15, 19 y 23), aplica un LayerNorm por slice y concatena hasta una dimensión de entrada de 6144. Sobre esa representación se aplica un MLP de tres capas (6144→6144→6144→4096) y se le suman, mediante conexiones residuales inicializadas a cero, dos bloques de self-attention sobre el eje de tokens y otros dos sobre el eje de slices. La salida reproduce el `last_hidden_state` post-norm de la capa 32 del teacher, con forma `(L, 4096)`.

El entrenamiento es una destilación supervisada por regresión: objetivo MSE por token ponderado por `1/max(‖y‖², 128²)` y peso 0,1 para el padding. Se usaron 14.507 captions durante 2 épocas (1.798 pasos), batch 16 y learning rate 3e-4 con decaimiento coseno hasta 1e-5. El prompt vacío y negativos típicos se mezclan en cada batch, ya que el prompt vacío actúa como negativo de CFG. El teacher se ejecutó en 8 bits (bf16 no cabía en una tarjeta de 16 GB), lo que introduce un error de en torno al 1 % frente a bf16 en los objetivos. Estudiante y teacher comparten tokenizer (248.077 tokens, ids idénticos), de modo que no hay remapeo y el prompt se construye con `apply_chat_template(..., add_generation_prompt=True, enable_thinking=True)`.

## Capacidades

- Sustitución del codificador de texto de MOSS-Image: genera la condición `(L, 4096)` en bf16 más su máscara a partir de un prompt de texto.
- Producción del condicionamiento negativo mediante el prompt vacío, listo para classifier-free guidance.
- Compatibilidad directa con el tokenizer del teacher, sin remapeo de ids ni pérdida de tokens.
- Reutilización de la plantilla de chat con `enable_thinking=True` para alinear el formato de entrada.
- Integración en el pipeline de diffusers de MOSS-Image-Base sin cargar el componente `text_encoder`.
- No genera texto ni imágenes por sí mismo: requiere el DiT, el VAE y el scheduler de MOSS-Image-Base.
- Tool calling, agentes, razonamiento multi-paso, visión y audio: no disponible (no aplica a esta pieza).
- Capacidades multilingües: no disponible (dependen del tokenizer y del teacher, no se documentan).

## Casos de uso

- Generación text-to-image en GPUs de 16 GB: al bajar el pico de VRAM de 25,4 GiB a 12,7 GiB a 1024 px y 30 pasos, permite ejecutar MOSS-Image-Base en tarjetas como RTX 4080, RTX 4090 o RTX 4060 Ti de 16 GB, que con el codificador nativo no podrían cargar el pipeline.
- Prototipado local de un pipeline de difusión: con los scripts `src/example.py` y `src/moss_lib.py` se puede montar una demo funcional en una sola GPU de consumo sin descargar el encoder de 9B.
- Servicios de generación por lotes en GPUs de 24 GB: el margen libre de VRAM (aproximadamente 11 GiB en una L4 o A10G) deja espacio para aumentar resolución, batch o pasos de muestreo.
- Investigación sobre el DiT sin cargar el encoder grande: útil para ablaciones de scheduler, guidance o fine-tuning del DiT aislando la variable del condicionamiento de texto.
- Estudio de la tolerancia del DiT a errores de condición: la diferencia entre tipos de prompt (coseno 0,940 en etiquetas frente a 0,756 en JSON) permite medir qué parte de la señal textual es crítica para la generación.
- Reproducción de la metodología de destilación de codificadores: los ficheros `src/cache_targets.py` y `src/train_adapter.py` documentan el flujo completo de extracción de objetivos del teacher y entrenamiento sobre caché, reutilizable para otros pares teacher/student.
- Docencia y demos en notebooks: el peso combinado del adaptador (1,7 GB del estudiante más 0,63 GB de la cabeza) es manejable en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el adaptador no es un modelo de lenguaje. Las métricas publicadas miden la fidelidad de la condición generada frente a la del codificador nativo:

| Prueba | Similitud coseno | Error relativo |
|---|---|---|
| 5 sondas fijas (prosa, letrero, etiquetas, JSON, vacío) | 0,905 | 33,0 % |
| 128 captions reservadas (held-out) | 0,924 | 33,4 % |

| Tipo de prompt (A/B, una semilla, 1024 px, 30 pasos) | Coseno de la condición del adaptador frente a la nativa |
|---|---|
| Prosa | 0,931 |
| Letrero | 0,902 |
| Etiquetas | 0,940 |
| Layout JSON | 0,756 |

El error de los objetivos del teacher en 8 bits frente a bf16 se estima en torno al 1 %, un orden de magnitud por debajo del error de regresión del adaptador.

## Requisitos de hardware

- VRAM pico con adaptador: 12,7 GiB a 1024 px y 30 pasos (frente a 25,4 GiB con el codificador nativo).
- Memoria del codificador: 1,7 GB para Qwen3.5-0.8B más 0,63 GB para la cabeza, frente a 15,63 GiB del Qwen3.5-VL-9B en bf16.
- Cabe en GPU de consumo de 16 GB (RTX 4080, RTX 4090, RTX 4060 Ti 16 GB, A4000 16 GB) y en GPUs de 24 GB (L4, A10G) con margen amplio.
- El pico medido de 12,7 GiB excede la VRAM de tarjetas de 8 y 12 GB, por lo que estas no son suficientes según los datos publicados.
- El teacher original requería ejecutarse en 8 bits incluso en una tarjeta de 16 GB, lo que da idea del ahorro respecto al pipeline nativo.
- Opciones de despliegue: pipeline de diffusers más transformers y safetensors mediante los scripts incluidos (`src/example.py`, `src/moss_lib.py`, `src/adapter_lib.py`). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a esta pieza.
- Latencia y throughput: no disponible. No se publican tiempos por imagen ni comparativas de velocidad frente al codificador nativo.

## Comparativa con modelos similares

| Configuracion | Funcion | Parametros | VRAM del codificador | Coseno frente al nativo | Licencia |
|---|---|---|---|---|---|
| MOSS-Image con Qwen3.5-VL-9B (nativo) | Codificador de texto del DiT | 9 B (15,63 GiB en bf16) | 15,63 GiB (pico total 25,4 GiB) | 1,0 (referencia) | Apache-2.0 (upstream) |
| Este adaptador con Qwen3.5-0.8B | Codificador de texto destilado | 0,8 B + 158,4 M | 1,7 GB + 0,63 GB (pico total 12,7 GiB) | 0,924 en 128 captions | Apache-2.0 |
| Qwen3.5-0.8B sin adaptador | Modelo de lenguaje | 0,8 B | 1,7 GB | No aplica: no produce la condicion de 4096 dimensiones | Apache-2.0 |

No se dispone de información sobre otros adaptadores de destilación equivalentes para MOSS-Image u otros pipelines comparables, por lo que la comparativa se limita a las tres configuraciones anteriores.

## Limitaciones y advertencias

- Error de regresión apreciable: el error relativo se sitúa en torno al 33 % y el coseno en 0,924, de modo que la condición generada no es equivalente a la nativa.
- Los prompts de layout JSON son el caso más débil (coseno 0,756) porque no estaban representados en el conjunto de entrenamiento; se desaconseja su uso en producción con este adaptador.
- Los objetivos de entrenamiento provienen de un teacher ejecutado en 8 bits, con un error aproximado del 1 % frente a bf16; no constituyen una referencia bit a bit.
- El techo de fidelidad es el propio codificador nativo: el adaptador reproduce sus estados, no mejora la comprensión del DiT ni corrige prompts que el modelo original no entendía.
- Entrenado únicamente sobre MOSS-Image-Base y no probado sobre MOSS-Image-SFT; no hay garantía de comportamiento en esa variante.
- El fichero `adapter.safetensors` contiene solo la cabeza: es inservible sin el estudiante congelado Qwen3.5-0.8B.
- Licencia Apache-2.0 para el adaptador, con las licencias upstream de MOSS-Image y Qwen3.5-0.8B aplicables en uso comercial; conviene revisarlas antes de distribuirlo en producto.
- Adopción muy baja en el momento de la ficha (0 descargas y 0 likes), sin validación externa conocida.
- Idiomas soportados y longitud de contexto no documentados en la información disponible.
- No se publican métricas de latencia ni de calidad visual subjetiva más allá de la cuadrícula de comparación con una sola semilla.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/recoilme/moss_te_adapter
- Modelo base del pipeline: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Estudiante congelado: https://huggingface.co/Qwen/Qwen3.5-0.8B
