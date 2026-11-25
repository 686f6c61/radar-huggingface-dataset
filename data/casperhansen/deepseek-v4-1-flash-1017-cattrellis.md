# casperhansen/DeepSeek-V4.1-Flash-1017-CatTrellis

## Resumen

DeepSeek-V4.1-Flash-1017-CatTrellis es una cuantización extrema del modelo DeepSeek-V4.1-Flash-1017 (763B parámetros, 384 expertos enrutados) publicada por el usuario casperhansen mediante la herramienta CatTrellis. El resultado son pesos comprimidos a entre 1,76 y 2,25 bits por peso, lo que reduce un checkpoint original de cientos de gigabytes a ficheros de entre 309 y 340 GiB, manteniendo una divergencia KL baja respecto a la referencia FP8/FP4. Es relevante porque demuestra que es posible servir un modelo de escala 763B con calidad aceptable en un nodo de 8 GPU H200, algo impensable con cuantizaciones de 4 bits convencionales.

La técnica combina códigos trellis con asignación de bits mixta guiada por sensibilidad, inicialización YAQA block-LDLQ bilateral, reconstrucción de ventana deslizante y destilación KL de extremo a extremo contra el modelo original. Cada tamaño se distribuye en su propia rama del repositorio, e incluye un drafter de decodificación especulativa DSpark cuantizado y una torre de visión de 6 bits. La licencia es MIT, lo que facilita el uso comercial, aunque el modelo base hereda las limitaciones propias de DeepSeek-V4.1-Flash.

El paquete está pensado para servirse nativamente con vLLM y paralelismo de expertos, no para uso en GPU de consumo. Su público objetivo son equipos de infraestructura que necesitan desplegar un MoE de gran escala en clústeres con memoria limitada por GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE transformer (modelo base DeepSeek-V4.1-Flash-1017) |
| Parámetros totales | 763B (modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 1,76 bpw; 2,05 bpw; 2,25 bpw (trellis con asignación mixta de bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors cuantizados servidos con vLLM (ramas `1.76bpw`, `2.05bpw`, `2.25bpw`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 763B parámetros y 384 expertos enrutados. La cuantización CatTrellis aplica códigos trellis sobre las capas lineales del decodificador, con una asignación de tasa de bits guiada por la sensibilidad de cada capa, inicialización YAQA mediante descomposición block-LDLQ de dos lados, reconstrucción con ventana deslizante y destilación KL de extremo a extremo contra el checkpoint FP8/FP4 original. Las puertas del router se almacenan en FP32 (32 bits), y la cabeza de salida se cuenta dentro del bpw de capa en el motor exllamav3.

Cada exportación incorpora además un drafter DSpark cuantizado para decodificación especulativa (activo por defecto, con 5 tokens especulados) y una torre de visión de 6 bits. El tamaño de fichero indicado incluye las tablas engram y la torre de visión. Los pesos se sirven nativamente en vLLM con paralelismo de expertos y tensor-parallel; la primera arrancada compila los kernels de serving para la GPU concreta y las siguientes los cargan de caché.

## Capacidades

- Generación de texto y razonamiento con el modelo base DeepSeek-V4.1-Flash-1017.
- Procesamiento de visión gracias a la torre de visión de 6 bits incluida en cada exportación.
- Decodificación especulativa integrada mediante el drafter DSpark (5 tokens especulados, activado por defecto).
- Servicio con paralelismo de expertos y tensor-parallel en vLLM.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada (depende del modelo base).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de 763B en un nodo de 8 GPU H200: la variante 2,25 bpw ocupa 340 GiB y se sirve con `--tensor-parallel-size 8 --enable-expert-parallel`, lo que permite operar el modelo en un único nodo de alta memoria.
- Inferencia con latencia reducida mediante decodificación especulativa: el drafter DSpark incluido alcanza una longitud media de aceptación de 3,53 tokens sobre 5 especulados en la variante 2,25 bpw, lo que amortiza el coste por token generado.
- Evaluación de cuantizaciones extremas en investigación: las tres ramas permiten comparar calidad (KLD de 0,0472 a 0,0871) frente a ExLlamaV3 y GGUF GSQ-RCO sobre la misma traza de qbench.
- Pipelines multimodales con restricciones de memoria: la torre de visión de 6 bits permite procesar imágenes sin cargar un checkpoint de visión en precisión completa.
- Entornos con requisitos de licencia permisiva: la licencia MIT del artefacto facilita su integración en productos comerciales, sujeto a las condiciones del modelo base.
- Servicio por API interna con vLLM: el comando de serving documentado permite levantar un endpoint compatible con la API de OpenAI sobre la rama elegida.
- Reproducción de benchmarks de cuantización: los scripts de `examples/deepseek-v41-flash/` y `tools/dense_reference.py` permiten reconstruir la referencia densa y validar la KLD.

## Benchmarks y rendimiento

Resultados de qbench (KL media por token frente a la referencia FP8/FP4; suelo de ruido 0,00209; PPL de referencia 1,5628):

| Modelo | bpw | KLD media | KLD p90 | PPL |
|---|---|---|---|---|
| ExLlamaV3 1.68 bpw | 1,703 | 0,1860 | 0,4640 | 1,8855 |
| GGUF GSQ-RCO IQ1_M | 1,737 | 0,2420 | 0,6223 | 2,0079 |
| CatTrellis 1.76 bpw | 1,756 | 0,0871 | 0,2153 | 1,7129 |
| GGUF GSQ-RCO IQ2_XXS | 1,991 | 0,1882 | 0,4698 | 1,8968 |
| CatTrellis 2.05 bpw | 2,046 | 0,0603 | 0,1437 | 1,6657 |
| ExLlamaV3 2.25 bpw | 2,208 | 0,0787 | 0,1824 | 1,6879 |
| GGUF GSQ-RCO IQ2_XS | 2,238 | 0,1229 | 0,2928 | 1,7715 |

Mejora relativa frente a ExLlamaV3 a igual bpw: -37% (2,25 bpw), -42% (2,05 bpw) y -49% (1,76 bpw) en KLD media. Aceptación media del drafter DSpark en 8x H200: 3,53 (2,25 bpw), 2,75 sobre muestra corta (2,05 bpw) y 3,22 (1,76 bpw), con 5 tokens especulados.

## Requisitos de hardware

- VRAM: 340 GiB (2,25 bpw), 327 GiB (2,05 bpw) y 309 GiB (1,76 bpw), según el tamaño de fichero del repositorio.
- GPU recomendadas: 8x H200 (configuración verificada por el autor); se requiere un nodo con memoria agregada suficiente para el tamaño de la rama elegida más el drafter y la torre de visión.
- GPU de consumo: no cabe en ninguna GPU consumer; el modelo base es de 763B parámetros y el artefacto mínimo ocupa 309 GiB.
- Despliegue: vLLM con `cattrellis[serve]` (Python 3.12), `--tensor-parallel-size 8 --enable-expert-parallel` y `--speculative-config` apuntando a la rama elegida; también admite copia local con `hf download` y serving sin flag de drafter.
- Latencia y throughput: no disponibles; la primera arrancada compila kernels (varios minutos) y las posteriores cargan de caché.

## Comparativa con modelos similares

| Modelo | Parámetros | bpw | KLD media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CatTrellis 2.25 bpw | 763B | 2,246 | 0,0472 | MIT | Hugging Face, rama `2.25bpw` |
| ExLlamaV3 2.25 bpw | 763B | 2,208 | 0,0787 | no disponible | Hugging Face (turboderp) |
| GGUF GSQ-RCO IQ2_XS | 763B | 2,238 | 0,1229 | no disponible | Hugging Face (IST-DASLab) |
| CatTrellis 1.76 bpw | 763B | 1,756 | 0,0871 | MIT | Hugging Face, rama `1.76bpw` |
| GGUF GSQ-RCO IQ1_M | 763B | 1,737 | 0,2420 | no disponible | Hugging Face (IST-DASLab) |

## Limitaciones y advertencias

- La cuantización a 1,76–2,25 bpw introduce degradación medible: KLD media de 0,0472 a 0,0871 frente al suelo de ruido de 0,00209.
- El drafter DSpark falla al cargar en versiones de CatTrellis anteriores a su corrección de serving; en ese caso hay que servir con `--speculative-config '{}'`.
- Si se sirve desde el repositorio remoto sin `--speculative-config`, vLLM resuelve el drafter desde `main`, que no contiene pesos; es necesario apuntar a la rama o usar copia local.
- El modelo base puede presentar sesgos y alucinaciones; la cuantización agresiva puede amplificarlos en tareas de razonamiento largo.
- Idiomas soportados y longitud de contexto no documentados en la información disponible; conviene verificar la model card del modelo base.
- La licencia MIT del artefacto no exime de comprobar las condiciones del modelo base DeepSeek-V4.1-Flash-1017 para uso comercial.
- Requiere hardware de clase H200 en nodo de 8 GPU; no es desplegable en estaciones de trabajo ni GPU consumer.
- El repositorio tiene 5 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es mínima.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/casperhansen/DeepSeek-V4.1-Flash-1017-CatTrellis
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio CatTrellis: https://github.com/casper-hansen/CatTrellis
- Recetas de ejemplo: https://github.com/casper-hansen/CatTrellis/tree/main/examples/deepseek-v41-flash
- qbench de ExLlamaV3: https://github.com/turboderp-org/exllamav3/tree/master/eval
- Cuantización ExLlamaV3 de referencia: https://huggingface.co/turboderp/DeepSeek-V4.1-Flash-1017-exl3
