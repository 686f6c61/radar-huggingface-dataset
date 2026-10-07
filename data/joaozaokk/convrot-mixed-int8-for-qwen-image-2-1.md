# JoaoZaokk/ConvRot-Mixed-INT8-for-Qwen-Image-2.1

## Resumen

ConvRot-Mixed-INT8-for-Qwen-Image-2.1 es una coleccion de checkpoints cuantizados del transformer de difusion Qwen-Image 2.1, publicada por el usuario JoaoZaokk en HuggingFace. No es un modelo nuevo ni un modelo de lenguaje: son pesos modificados y cuantizados del transformer BF16 original repaquetado por Comfy-Org, listos para cargarse en ComfyUI mediante el nodo estandar Load Diffusion Model. El repositorio incluye un build completo en INT8 ConvRot y cuatro builds de precision mixta que combinan capas en W4A4 (4 bits en pesos y activaciones) con capas promovidas a INT8 segun el error de cuantizacion medido por capa.

El transformer del modelo base tiene 192 capas lineales. Las mezclas se generan con `tools/quant_mixed.py --promote-format int8 --promote-error <umbral>`: se mide el error W4A4 de cada capa sobre activaciones de calibracion procedentes de ejecuciones de muestreo reales y se promueven a INT8 las capas con mayor error. Los cuatro umbrales publicados (0,08 / 0,10 / 0,12 / 0,15) dan lugar a ficheros de entre 4,61 GB y 6,93 GB, frente a los 7,26 GB del build INT8 completo.

La relevancia del repositorio es doble. Por un lado, permite ejecutar un modelo de generacion de imagen de gran tamano en una GPU de consumo (las mediciones se hicieron en una RTX 3090 a 280 W) con perdidas de calidad evaluadas mediante revision ciega. Por otro lado, aporta una advertencia metodologica: el estudio del autor muestra que PSNR frente a BF16 no correlaciona con la calidad percibida, ya que un schedule hibrido con 2 dB mas de PSNR fue el peor en 24 de 24 escenas. La licencia es Qwen Research License, de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) del modelo base Qwen-Image 2.1, con cuantizacion ConvRot aplicada a sus 192 capas lineales |
| Parametros totales | no disponible (el autor no publica el recuento de parametros; el repo ocupa 31,2 GB e incluye varios checkpoints mas sidecars `.quant.json`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion texto-a-imagen; no se especifica la ventana del text encoder) |
| Tipos de cuantizacion | W4A4 ConvRot (4 bits en pesos y activaciones), INT8 ConvRot (8 bits) y mezclas por capa W4A4/INT8; los ficheros mezclados parten del transformer BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | other / qwen-research (Qwen Research License Agreement, Copyright (c) 2026 Hangzhou Tongyi Laboratory Technology Co., Ltd.). Solo uso no comercial |
| Formato de pesos | safetensors (libreria `diffusion-single-file`), con fichero sidecar `.quant.json` por checkpoint que registra el hash de origen, el umbral y el formato de cada capa |

Checkpoints publicados y sus caracteristicas:

| Fichero | Capas W4A4 / INT8 | Tamano |
|---|---:|---:|
| `qwen_image_2.1_bf16_mixed_p015_int8.safetensors` | 120 / 72 | 4,61 GB |
| `qwen_image_2.1_bf16_mixed_p012_int8.safetensors` | 88 / 104 | 5,81 GB |
| `qwen_image_2.1_bf16_mixed_p010_int8.safetensors` | 68 / 124 | 6,55 GB |
| `qwen_image_2.1_bf16_mixed_p008_int8.safetensors` | 35 / 157 | 6,93 GB |
| `qwen_image_2.1_bf16_int8_convrot.safetensors` (INT8 completo) | 0 / 192 | 7,26 GB |

## Arquitectura y entrenamiento

El modelo subyacente es el transformer de difusion de Qwen-Image 2.1, un modelo texto-a-imagen que el autor no entrena ni modifica en su estructura: parte del transformer BF16 repaquetado por Comfy-Org y le aplica cuantizacion. La innovacion tecnica del repositorio es el esquema ConvRot combinado con precision mixta por capa. En lugar de cuantizar todas las capas al mismo numero de bits, cada capa se evalua individualmente con activaciones de calibracion extraidas de ejecuciones de muestreo reales; las capas cuyo error en W4A4 supera un umbral determinado se promueven a INT8. El umbral controla, por tanto, el equilibrio entre tamano, velocidad y fidelidad.

No hay informacion sobre el entrenamiento del modelo base en la informacion proporcionada (numero de tokens, composicion del dataset, uso de RLHF o DPO). Tampoco se documenta un proceso de entrenamiento posterior a la cuantizacion: las mezclas se construyen con scripts de cuantizacion post-entrenamiento (`tools/quant_mixed.py` y `tools/quant_int8.py --convrot`, ambos del repositorio comfy-quant-bench), no con fine-tuning ni destilacion. La evaluacion se hizo con tres rondas ciegas de 24 escenas (12 prompts x 2 semillas), con un unico evaluador y comparacion lado a lado en orden aleatorio por escena, con parpadeo a tamano completo.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante el pipeline de difusion del modelo base Qwen-Image 2.1.
- Inferencia con precision reducida: ejecuta el mismo transformer con pesos y activaciones en 4 bits o 8 bits, con seleccion por capa del formato mas agresivo que no degrade la calidad.
- Integracion directa con ComfyUI: los ficheros se cargan con el nodo estandar Load Diffusion Model y funcionan con los nodos KSampler habituales.
- Compatibilidad con dos rutas de atencion medidas: SageAttention 2 con acumulador PV en fp16 y Flash Attention 2 (`--use-flash-attention`).
- Trazabilidad de la cuantizacion: cada checkpoint incluye un sidecar `.quant.json` con el hash del origen, el umbral y el formato de cada capa, lo que permite auditar o reproducir la mezcla.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene modo thinking, vision ni audio como entradas; la unica modalidad de entrada es texto en ingles.

## Casos de uso

- Generacion de imagenes en GPU de consumo para investigacion: el checkpoint INT8 completo ocupa 7,26 GB y fue medido en una RTX 3090, por lo que permite reproducir experimentos de difusion de gran tamano en hardware de gama alta para consumidores y no solo en A100/H100.
- Prototipado rapido de conceptos visuales en ComfyUI: con la mezcla p015 (4,61 GB, 9,25 s por render con SageAttention) un estudio puede iterar bocetos de direccion de arte y reservar el build INT8 completo para las versiones finales.
- Estudio y docencia sobre cuantizacion post-entrenamiento: los cinco checkpoints con distintos umbrales permiten comparar curvas de calidad frente a tasa de compresion en un caso real, no en un benchmark sintetico.
- Validacion de kernels de cuantizacion: el repositorio sirve como banco de pruebas para backends CUDA de ConvRot, comparando tiempos de KSampler con SageAttention frente a Flash Attention 2 a 1024x1024 y 25 pasos.
- Generacion de imagenes en entornos con VRAM limitada y sin requisitos comerciales: al reducir el peso del transformer a entre 4,61 GB y 7,26 GB, deja mas margen para el text encoder, el VAE y los latentes en una misma GPU.
- Investigacion academica sobre metricas de evaluacion: el hallazgo de que PSNR frente a BF16 no predice la calidad percibida es directamente utilizable en trabajos sobre evaluacion de modelos generativos.
- Analisis de fallos por tipo de escena: el autor documenta que las mezclas p012 y p015 fallan sistematicamente en escenas dificiles (desenfoque de movimiento, interiores abarrotados), lo que sirve para estudiar la sensibilidad de las capas a la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval ni GSM8K, ya que no es un modelo de lenguaje). Si se documenta una evaluacion ciega de calidad visual y tiempos de inferencia.

Revision ciega de calidad (24 escenas, un evaluador, RTX 3090 a 280 W, 1024², 25 pasos, euler/simple):

| Version | Mejor | Buena | Aceptable | Mala |
|---|---:|---:|---:|---:|
| W4A4 puro | 0 | 0 | 6 | 18 |
| p015 | 0 | 11 | 7 | 6 |
| p012 | 0 | 13 | 5 | 6 |
| p010 | 0 | 17 | 6 | 0 |
| p008 | 3 | 16 | 5 | 0 |

Significancia declarada por el autor: p010 y p008 no son separables con n = 24 (Wilcoxon p = 0,16); p010 supera a p012 y p015 (p < 0,01). El build INT8 completo se evaluo en otra ronda: nunca fue elegido como el peor y fue descrito repetidamente como "casi identico" a BF16.

Tiempos de render (mediana de 24 renders, RTX 3090 a 280 W, 1024², 25 pasos):

| Version | Capas W4A4 / INT8 | Tamano | Escenas malas (de 24) | KSampler, Sage | KSampler, FA2 |
|---|---:|---:|---:|---:|---:|
| W4A4 puro (no publicado aqui) | 192 / 0 | 3,77 GB | 18 | 8,41 s | 9,72 s |
| p015 | 120 / 72 | 4,61 GB | 6 | 9,25 s | 10,56 s |
| p012 | 88 / 104 | 5,81 GB | 6 | 10,92 s | 12,07 s |
| p010 | 68 / 124 | 6,55 GB | 0 | 11,79 s | 12,89 s |
| p008 | 35 / 157 | 6,93 GB | 0 | 12,96 s | 13,80 s |
| INT8 completo | 0 / 192 | 7,26 GB | nunca el peor | 12,70 s | 14,19 s |

Advertencia del autor sobre PSNR: un schedule por pasos (INT8 en los primeros 5 pasos, W4A4 en el resto) obtuvo 2 dB mas de PSNR frente a BF16 que p008 y fue la peor version en 24 de 24 escenas ciegas. El PSNR frente a BF16 mide si se mantiene la composicion, no si la imagen es limpia.

## Requisitos de hardware

- GPU validada: RTX 3090 a 280 W (sm86). El autor indica explicitamente que no se probaron otras GPU. Concretamente, las mediciones se hicieron con el backend CUDA de comfy-kitchen para ConvRot.
- VRAM: no disponible de forma explicita en la model card. Como referencia, los pesos del transformer ocupan entre 4,61 GB (p015) y 7,26 GB (INT8 completo); a eso hay que sumar el text encoder, el VAE y los tensores de trabajo, que el autor no cuantifica.
- Cabe en GPU de consumo: si, al menos en la RTX 3090 empleada en las mediciones; el build INT8 completo (7,26 GB) es el que mas se acerca al limite de una GPU de 8 GB, por lo que las mezclas p015 y p012 son las opciones con mas margen.
- Despliegue: ComfyUI con el nodo Load Diffusion Model, mas el text encoder y el VAE de Qwen-Image 2.1 publicados por Comfy-Org. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Aceleracion de atencion: SageAttention 2 con acumulador PV en fp16 da los mejores tiempos (por ejemplo, 12,70 s para INT8 completo frente a 14,19 s con Flash Attention 2); con SageAttention el build INT8 completo iguala en velocidad a p008.
- Latencia: entre 8,41 s y 14,19 s por imagen de 1024² a 25 pasos en la RTX 3090, segun version y backend de atencion. No se publican datos de throughput en lote.

## Comparativa con modelos similares

| Version | Capas W4A4 / INT8 | Tamano | Calidad (escenas malas de 24) | KSampler, Sage | Licencia |
|---|---:|---:|---:|---:|---|
| p015 (esta familia) | 120 / 72 | 4,61 GB | 6 | 9,25 s | qwen-research, no comercial |
| p012 (esta familia) | 88 / 104 | 5,81 GB | 6 | 10,92 s | qwen-research, no comercial |
| p010 (esta familia) | 68 / 124 | 6,55 GB | 0 | 11,79 s | qwen-research, no comercial |
| p008 (esta familia) | 35 / 157 | 6,93 GB | 0 | 12,96 s | qwen-research, no comercial |
| INT8 completo (esta familia) | 0 / 192 | 7,26 GB | nunca el peor | 12,70 s | qwen-research, no comercial |
| `Comfy-Org/Qwen-Image-2.1` (INT8 ConvRot propio) | no disponible | no disponible | no medido en este estudio | no disponible | qwen-research, no comercial |
| Transformer BF16 original | 0 / 0 | no disponible | referencia de calidad | no disponible | qwen-research, no comercial |

No se dispone de datos de otros modelos comparables de la misma categoria (por ejemplo, otros DiT texto-a-imagen cuantizados) en la informacion proporcionada; el autor solo compara variantes dentro de la propia familia.

## Limitaciones y advertencias

- Licencia restrictiva: Qwen Research License Agreement, uso exclusivamente no comercial. El uso comercial requiere una licencia separada de los autores originales (Hangzhou Tongyi Laboratory Technology Co., Ltd.). Hay copia de la licencia en `LICENSE_QWEN_RESEARCH.txt` y aviso de atribucion en `NOTICE.txt`.
- Son pesos modificados y cuantizados, no el modelo original; la model card lo subraya explicitamente.
- Evaluacion estadisticamente debil: tres rondas de 24 escenas con un unico evaluador. Los propios resultados reconocen que p010 y p008 no son separables con n = 24 (Wilcoxon p = 0,16), por lo que la eleccion entre ambos no esta resuelta por los datos.
- Artefactos conocidos: las mezclas p012 y p015 fallan las mismas escenas dificiles (desenfoque de movimiento, interiores abarrotados) en 6 de 24 casos. En las escenas mas exigentes, p010 y p008 pueden verse "ligeramente forzadas".
- PSNR no es una metrica fiable para esta familia: el schedule por pasos con mayor PSNR fue el peor en 24 de 24 escenas ciegas. No se debe usar PSNR frente a BF16 como criterio de seleccion.
- Cobertura de hardware muy limitada: todos los tiempos se midieron en una RTX 3090 (sm86) con el backend CUDA de comfy-kitchen. El comportamiento en otras arquitecturas (Ada, Hopper, AMD) no se probo.
- Idioma: solo ingles.
- Adopcion nula en el momento del registro: 0 descargas y 0 likes, sin validacion independiente por parte de terceros.
- Riesgo de alucinacion: no aplica en el sentido de texto factual, pero si en el de fidelidad prompt-imagen propia de los modelos de difusion, no cuantificada en esta model card.
- Trazabilidad parcial: la mezcla es reproducible mediante el sidecar `.quant.json` y los scripts del autor, pero el estudio de calidad no se ha replicado de forma independiente.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/JoaoZaokk/ConvRot-Mixed-INT8-for-Qwen-Image-2.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio de text encoder y VAE (Comfy-Org), que publica tambien su propio `qwen_image_2.1_int8_convrot`: https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Herramientas de cuantizacion comfy-quant-bench: https://github.com/JoaoZaokk/comfy-quant-bench
- Documento tecnico sobre la optimizacion de kernels: https://github.com/JoaoZaokk/comfy-quant-bench/blob/main/docs/kernel-optimization.md
- La busqueda web realizada no devolvio resultados relevantes para este modelo: los enlaces recuperados no guardan relacion con Qwen-Image ni con cuantizacion, por lo que se descartan.
