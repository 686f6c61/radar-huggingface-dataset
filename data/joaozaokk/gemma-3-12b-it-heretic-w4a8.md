# JoaoZaokk/Gemma-3-12B-it-Heretic-W4A8

## Resumen

Gemma-3-12B-it-Heretic-W4A8 es una version cuantizada de los pesos del modelo DreamFast/gemma-3-12b-it-heretic, a su vez un ajuste de Gemma 3 12B it. La publica el usuario JoaoZaokk y su proposito no es la generacion de texto, sino actuar como text encoder (codificador de condicionamiento) dentro de ComfyUI: el fichero se distribuye en el formato de cuantizacion por capa nativo de ComfyUI, con pesos de 4 bits y ruta de activaciones de 8 bits (asym_w4a8_int8, group_size 16).

La relevancia es de memoria. El safetensors BF16 de origen ocupa 23.545.681.250 bytes (21,93 GiB) y este fichero 8.089.619.138 bytes (7,53 GiB), 2,91 veces menos, lo que libera 13,8 GiB de VRAM sin coste medible en tiempo de codificacion: 1.835,7 ms frente a 1.876,8 ms del BF16 en el prompt 0 (mediana de 5). Se cuantizan 336 capas y se preservan 293 tensores identicos byte a byte respecto al original.

La limitacion central esta documentada por el propio autor: en el flujo normal de ComfyUI el kernel cuantizado nunca se ejecuta. El cargador fija el tipo de computo a float32 y `full_precision_mm=True`, de modo que un forward real produce 0 forwards cuantizados y 336 llamadas a `dequantize`. La ganancia de velocidad (490,8 ms, 3,74x) solo es alcanzable liberando esos bloqueos con un monkeypatch posterior a la carga, algo que ComfyUI no permite seleccionar al usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion del repositorio (modelo base: Gemma 3 12B it, transformer decoder-only segun la documentacion de la familia) |
| Parametros totales | Aproximadamente 11,77 mil millones, derivado del peso BF16 de origen (23.545.681.250 B / 2 B por parametro) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del repositorio; la familia Gemma 3 it declara 128 000 tokens en su documentacion oficial |
| Tipos de cuantizacion | W4A8 asimetrico (`asym_w4a8_int8`), group_size 16; 336 capas cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | `gemma` (Gemma Terms of Use) |
| Formato de pesos | safetensors en el formato de cuantizacion por capa nativo de ComfyUI; fichero de 8.089.619.138 B (7,53 GiB) |
| Tamano del repositorio | 8,1 GB |
| Campos preservados sin cuantizar | 293 tensores, identicos byte a byte al modelo de origen |
| Herramienta de conversion | `tools/quant_w4a8.py` con comfy-kitchen 0.2.31, torch 2.13.0+cu130, backend `comfy_kitchen.backends.cuda`; 25,5 s en una RTX 3090 (sm86) |
| Fecha de creacion y actualizacion | 2026-09-12 (ambas) |
| Descargas y likes | 0 y 0 |

## Arquitectura y entrenamiento

Este repositorio no entrena ni ajusta ningun modelo: es una conversion de precision del safetensors `gemma_3_12B_it_heretic.safetensors`. La arquitectura subyacente es la del modelo base, Gemma 3 12B it, del que no se aportan detalles de capas, atencion ni ventana de contexto en la informacion disponible. El proceso aplicado es una cuantizacion post-entrenamiento W4A8 asimetrica con group_size 16 sobre 336 capas, dejando 293 tensores intactos byte a byte, presumiblemente las partes sensibles a la precision (normalizaciones, embeddings o cabezas, sin que la model card lo especifique).

El modelo de partida, DreamFast/gemma-3-12b-it-heretic, se etiqueta como `base_model:finetune`, es decir, un ajuste sobre Gemma 3 12B it, pero la model card no documenta el dataset, el numero de tokens, ni si se emplearon tecnicas de RLHF o DPO. La etiqueta "heretic" no viene acompanada de explicacion tecnica en la informacion proporcionada. Tampoco se describe la innovacion asociada a la etiqueta `convrot`, presente en los tags del repositorio.

## Capacidades

- Codificacion de texto para condicionamiento: genera los embeddings que los pipelines de difusion de ComfyUI consumen como prompt, no texto libre.
- Cuantizacion selectiva: 336 capas en W4A8 con group_size 16 y 293 tensores preservados byte a byte.
- Ahorro de VRAM en carga: 13,8 GiB liberados frente al BF16 de origen, con tiempo de codificacion equivalente en el camino bloqueado.
- Compatibilidad con el backend CUDA de comfy-kitchen (`comfy_kitchen.backends.cuda`) y con el cargador nativo de ComfyUI.
- Ejecucion en GPUs sm86 (probado en RTX 3090); no se documenta compatibilidad con otras arquitecturas.
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes o modo thinking: no disponible en la informacion proporcionada para esta variante. Cualquier capacidad de ese tipo dependeria del modelo base, no evaluado aqui.
- Idiomas: no disponible.

## Casos de uso

- Generacion de imagenes en ComfyUI con condicionamiento de Gemma 3 12B: el modelo sustituye al text encoder BF16 en el grafo, reduciendo el peso en VRAM de 21,93 GiB a 7,53 GiB, lo que permite mantener el UNet y el VAE cargados en la misma GPU sin recurrir a offload a CPU.
- Estaciones de trabajo con una sola GPU de 24 GB: en una RTX 3090 o RTX 4090, los 13,8 GiB liberados son el margen que hace viable ejecutar el pipeline completo en lugar de trocearlo entre dispositivos.
- Servicio multiusuario en un nodo unico: al reducir el consumo por instancia, un mismo servidor puede alojar mas copias del text encoder o combinarlo con otros modelos de difusion en paralelo.
- Prototipado rapido en equipos con GPU de gama media: el fichero de 7,53 GiB es candidato a caber en tarjetas de 12 GB, siempre que el resto del pipeline quepa en el presupuesto restante (no verificado en la informacion disponible).
- Auditoria y reprodubilidad de cuantizaciones: al preservar 293 tensores identicos byte a byte y publicar el script de conversion, el repositorio sirve como referencia para validar conversiones W4A8 equivalentes.
- Investigacion sobre degradacion por cuantizacion en text encoders: las metricas publicadas (1,1753e-1 de error al cuantizar el peso, 2,0684e-1 al liberar los bloqueos, coseno 0,9967 y 0,9780) permiten estudiar como afecta la precision al condicionamiento, aunque sin metrica perceptual ni imagenes generadas.
- Diagnostico de rutas de ejecucion en ComfyUI: el repositorio documenta con numeros concretos (0 forwards cuantizados, 336 `dequantize`) que el kernel cuantizado no se alcanza con el cargador estandar, un caso de uso util para quien depure rendimiento del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni metricas de calidad de imagen). El autor aporta unicamente mediciones de fidelidad y latencia de la cuantizacion, recogidas en la tabla siguiente. Las tres condiciones son: A = BF16 original, B = este fichero cargado como lo carga ComfyUI, C = este fichero con los dos bloqueos del text encoder liberados por monkeypatch.

| Metrica | Valor |
|---|---|
| Error de cuantizacion del peso (B frente a A) | 1,1753e-1 |
| Error anadido al liberar los bloqueos (C frente a B) | 1,8393e-1 |
| Error total con bloqueos liberados (C frente a A) | 2,0684e-1 |
| Similitud coseno con BF16, prompt 0, bloqueado | 0,9967 |
| Similitud coseno con BF16, prompt 0, liberado | 0,9780 |
| Latencia de codificacion, prompt 0, BF16 | 1.876,8 ms (mediana de 5) |
| Latencia de codificacion, prompt 0, bloqueado | 1.835,7 ms (mediana de 5) |
| Latencia de codificacion, prompt 0, liberado | 490,8 ms (mediana de 5) |
| Aceleracion con bloqueos liberados | 3,74x |
| Forwards cuantizados en carga estandar | 0 |
| Llamadas a `dequantize` en carga estandar | 336 |

## Requisitos de hardware

- Pesos del modelo cuantizado: 7,53 GiB en disco y en VRAM; el BF16 equivalente requiere 21,93 GiB.
- Ahorro de VRAM medido: 13,8 GiB al cargar el fichero cuantizado en lugar del original.
- GPU probada: RTX 3090 (sm86), unica tarjeta sobre la que se publican mediciones de conversion y latencia.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para alojar el encoder junto al resto del pipeline de difusion; no se documentan pruebas en A100, H100 ni en tarjetas de 12 GB o 16 GB, por lo que su encaje en estas ultimas no esta verificado.
- Cabida en GPU de consumo: si para los pesos del text encoder, con margen amplio en tarjetas de 24 GB; en tarjetas de 12 GB el encoder entra, pero el resto del grafo (UNet, VAE) competira por el mismo presupuesto de VRAM.
- Software necesario: ComfyUI, comfy-kitchen 0.2.31 o posterior, torch 2.13.0+cu130 y el backend `comfy_kitchen.backends.cuda`.
- Opciones de despliegue: ComfyUI (`library_name: comfyui`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos es especifico de ComfyUI, por lo que no son directamente aplicables.
- Latencia: 1.835,7 ms por codificacion en el camino bloqueado (practicamente identico a los 1.876,8 ms del BF16) y 490,8 ms en el camino con bloqueos liberados, sobre el prompt 0 y mediana de 5 ejecuciones.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Licencia | Observaciones |
|---|---|---|---|---|
| Gemma-3-12B-it-Heretic-W4A8 (este repositorio) | ~11,77 mil millones | safetensors W4A8, 7,53 GiB | gemma | Cuantizacion por capa nativa de ComfyUI; kernel cuantizado no alcanzable con el cargador estandar |
| DreamFast/gemma-3-12b-it-heretic (origen, BF16) | ~11,77 mil millones | safetensors BF16, 21,93 GiB | gemma | Modelo del que se deriva; sin datos de entrenamiento publicados en la informacion disponible |
| Text encoders W4A4 de otros autores para ComfyUI | No disponible | No disponible | No disponible | La model card los menciona como referencia cualitativa, sin identificarlos ni aportar cifras |
| Versiones GGUF de Gemma 3 12B | No disponible | No disponible | no disponible | No se mencionan en la informacion proporcionada; no se dispone de datos para comparar |

## Limitaciones y advertencias

- El kernel cuantizado no se ejecuta con el flujo normal de ComfyUI: `comfy/sd.py:269` aplica `set_model_compute_dtype(torch.float32)` y `comfy/sd1_clip.py:114` fija `full_precision_mm=True`, de modo que el rendimiento real es el del BF16 en tiempo, aunque no en memoria.
- La aceleracion de 3,74x solo se obtiene con un monkeypatch posterior a la carga que ComfyUI no expone; el propio autor no afirma que liberar esos bloqueos sea seguro para la calidad de salida.
- No hay metrica perceptual ni imagenes generadas: los numeros miden el condicionamiento, no la imagen resultante.
- Las mediciones corresponden a un unico modelo, una unica tarjeta (sm86), un unico conjunto de prompts y la mediana de 5 ejecuciones; no hay validacion cruzada en otro hardware.
- Error de cuantizacion no trivial: 1,1753e-1 al cuantizar el peso y 2,0684e-1 en el camino liberado, con coseno de 0,9780 en ese ultimo caso.
- La variante "heretic" del modelo base no viene documentada en la informacion proporcionada; se desconoce que ajustes se aplicaron y si afectan a los rechazos o al comportamiento del modelo.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o alineacion para esta variante ni para el modelo base en la informacion consultada.
- Riesgo de alucinacion: no evaluable como generador de texto, ya que el uso documentado es como text encoder.
- Idiomas soportados: no disponibles.
- Licencia `gemma`: el uso comercial esta sujeto a los Gemma Terms of Use y a la politica de usos prohibidos de Google; no es una licencia permisiva tipo Apache 2.0 o MIT, e impone obligaciones de redistribucion de los terminos.
- Repositorio sin validacion de la comunidad: creado y actualizado el mismo dia, con 0 descargas y 0 likes, y pipeline no declarado.
- Dependencia de versiones concretas (comfy-kitchen 0.2.31, torch 2.13.0+cu130) que pueden romper la compatibilidad en instalaciones de ComfyUI distintas.
- La etiqueta `convrot` aparece en los tags pero no se explica en la model card; no disponible su significado tecnico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/Gemma-3-12B-it-Heretic-W4A8
- Modelo base declarado: https://huggingface.co/DreamFast/gemma-3-12b-it-heretic
- Modelo de origen de la familia: https://huggingface.co/google/gemma-3-12b-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante para este modelo; los resultados devueltos corresponden a sitios no relacionados (Pinkbike y el centro de ayuda de YouTube) y se descartan.
