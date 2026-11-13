# huangdffs/toy-diffusion

## Resumen

Toy-diffusion es un modelo de difusion texto-a-imagen desarrollado por el usuario huangdffs (vinculado al proyecto aipracticecafe) cuyo objetivo principal no es la generacion de imagenes de proposito general, sino servir como banco de pruebas reproducible para experimentos controlados de arquitectura en modelos de difusion. El repositorio recoge una ablacion sistematica de variantes de backbone (single-stream frente a dual-stream), adaptadores de texto (MLP frente a transformer de 2 capas), esquemas de entrenamiento disperso (SPRINT) y funciones de coste (flow matching contrastivo), todas evaluadas sobre el mismo dataset de caras de anime.

El modelo se entrena desde cero sobre el dataset aipracticecafe/anime-faces-256px-v2 (87.505 recortes de caras de alta calidad a 256 px), utilizando latentes del VAE de Flux 2 y el codigo de entrenamiento Toy-diffusion. La arquitectura es un transformer de difusion (DiT) con anchura 768 y profundidades de 12 a 16, que elimina el condicionamiento ADA-LN tradicional y proyecta el timestep como un token antepuesto a los tokens de texto.

Su relevancia es metodologica: publica curvas de FID-20K comparables entre once checkpoints y documenta hallazgos practicos sobre el coste de entrenamiento, el consumo de VRAM y el equilibrio entre fidelidad visual y composicion condicional. No es un modelo pensado para produccion ni para uso general, sino una referencia para investigadores que disenan arquitecturas de difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) dual-stream o single-stream; ablaciones con adaptador de texto transformer de 2 capas o MLP; variante Conv-Attn hibrida estilo SnapGen; variante dispersa SPRINT |
| Parametros totales | no disponible (se documentan anchura 768 y profundidad 12-16, sin recuento de parametros) |
| Parametros activos | no disponible (SPRINT aplica un ratio de descarte de tokens del 75 %, no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion que procesa latentes del VAE de Flux 2. La innovacion arquitectonica central es la eliminacion completa del condicionamiento ADA-LN: el timestep se proyecta como un token y se antepone a la secuencia de tokens de texto, de modo que el modelo trata la informacion temporal como contexto textual mas. Se comparan dos familias de backbone: dual-stream, donde los tokens de texto e imagen se procesan en bloques separados, y single-stream, donde se concatenan en una unica secuencia. El adaptador de texto varia entre un MLP simple y un transformer de 2 capas (`trans_2`), y una de las variantes sustituye el backbone por un hibrido Conv-Attn al estilo SnapGen.

El entrenamiento usa el optimizador AdamW de 8 bits con un scheduler de learning rate warmup-constant a 4e-4 y un tamano de lote de 256 (hasta 1024 en la mejor configuracion). El dataset son 87.505 recortes de caras de anime a 256 px. La ablacion SPRINT introduce un marco de preentrenamiento disperso con descarte del 75 % de tokens, que reduce el tiempo de entrenamiento aproximadamente un 50 % y baja la memoria de GPU activa de 23 GB a 17 GB, seguido de un finetuning denso que recupera la calidad. No se documenta el numero total de tokens de entrenamiento ni el uso de RLHF o DPO, algo esperable en un modelo de difusion.

## Capacidades

- Generacion de imagenes de caras de anime a partir de prompts de texto en ingles.
- Composicion condicional de atributos (personaje, vestuario, expresion) mediante prompt, con diferencias cualitativas segun el backbone: los modelos dual-stream sobreajustan conceptos locales y los single-stream manejan mejor la mezcla de condiciones tipo "cosplay".
- Seguimiento de prompt reforzado en la variante con codificador de texto LLM, a costa de inestabilidad con etiquetas poco representadas.
- Entrenamiento e inferencia sobre latentes del VAE de Flux 2, lo que permite reutilizar dicho VAE en pipelines externos.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion en arquitecturas de difusion: el repositorio permite reproducir la comparacion entre single-stream y dual-stream con el mismo dataset y presupuesto de computo, sirviendo de linea base para nuevos disenos de backbone.
- Estudio de adaptadores de texto: la comparacion entre MLP y transformer de 2 capas cuantifica el impacto del adaptador en FID (4,57 frente a 3,54 a 500 epocas) y sirve para justificar decisiones de capacidad en modelos propios.
- Evaluacion de preentrenamiento disperso: SPRINT con descarte del 75 % permite medir el ahorro de tiempo y VRAM y validar recetas de finetuning denso antes de aplicarlas a modelos mayores.
- Generacion de avatares de anime para prototipos: con la configuracion `dual_stream_768_12_trans_2_bs_1024` (FID 2,42) se pueden producir caras consistentes a 256 px para demos y pruebas de interfaz.
- Docencia y formacion: el codigo de Toy-diffusion y las curvas de FID publicadas permiten explicar el efecto del tamano de lote, la profundidad y el adaptador de texto en un modelo de difusion completo.
- Analisis de sobreajuste conceptual: los prompts de mezcla de personajes y vestuario documentados en la model card permiten estudiar sesgos de asociacion en modelos entrenados sobre datasets de personajes.

## Benchmarks y rendimiento

Resultados de FID-20K publicados en la model card (menor es mejor):

| Checkpoint | Configuracion | Epoca | FID |
|---|---|---|---|
| dual_stream_768_12_trans_2_bs_1024 | Ancho 768, profundidad 12, adaptador trans_2, BS 1024 | 1400 | 2,4240 |
| dual_stream_768_12_trans_2 | Ancho 768, profundidad 12, adaptador trans_2, BS 512 | 600 | 3,0635 |
| dual_stream_768_12_llm_te_log_normal | Codificador de texto LLM, log-normal | 1000 | 3,1219 |
| dual_stream_768_12_modern_cfm | Adaptador moderno, flow matching contrastivo | 700 | 3,2707 |
| efficient_unet_bs_256 | Hibrido Conv-Attn SnapGen, BS 256 | 400 | 3,4479 |
| single_stream_768_14_trans_2 | Single-stream, profundidad 14, BS 512 | 600 | 3,8954 |
| sprint_dual_stream_768_13_trans_2_fined | SPRINT disperso + finetuning denso | 1000 | 3,9647 |
| dual_stream_768_16_mlp | Profundidad 16, adaptador MLP | 400 | 4,2485 |
| sprint_single_stream_768_14_fined | SPRINT single-stream + finetuning denso | 1000 | 7,3793 |
| sprint_single_stream_768_14_trans_img_2_rope_text | SPRINT sin finetuning (75 % descarte) | 750 | 9,7705 |
| sprint_dual_stream_768_13_trans_2 | SPRINT sin finetuning (75 % descarte) | 700 | 13,8281 |

Datos de eficiencia de entrenamiento reportados: los bloques dual-stream completan una epoca en unos 3,5 minutos frente a 5,1 minutos de los single-stream con la misma restriccion de VRAM (~23 GB).

## Requisitos de hardware

- VRAM de entrenamiento: aproximadamente 23 GB en configuracion densa y 17 GB con SPRINT al 75 % de descarte, segun la model card.
- VRAM de inferencia: no disponible de forma explicita; el repositorio ocupa 176,6 GB, lo que sugiere pesos sin cuantizar de gran tamano y requiere previsiblemente GPUs de datacenter para carga completa.
- GPU recomendadas: no disponibles; por el consumo de entrenamiento reportado, una RTX 3090 o RTX 4090 de 24 GB seria el minimo practico para reproducir el entrenamiento denso.
- Ajuste en GPU de consumo: probable solo con cuantizacion, y no se publican pesos cuantizados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de difusion, el despliegue pasaria por Diffusers o por el codigo de Toy-diffusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | FID publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Toy-diffusion (dual_stream_768_12_trans_2_bs_1024) | no disponible (ancho 768, profundidad 12) | 256 px | 2,42 (FID-20K, dataset propio) | MIT | Hugging Face |
| SDXL | no disponible en la informacion | 1024 px | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Flux.1 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos comparables de otros modelos en la informacion proporcionada; las cifras de FID de Toy-diffusion no son directamente equiparables a las de modelos entrenados sobre otros datasets.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre caras de anime a 256 px: no generaliza a fotografia, escenas, texto en imagen ni otras resoluciones.
- Solo admite prompts en ingles.
- Los modelos dual-stream muestran sobreajuste de conceptos locales (asociacion fija personaje-vestuario) y peor composicion zero-shot que los single-stream.
- La variante con codificador de texto LLM es inestable con etiquetas poco representadas en el dataset.
- Los checkpoints SPRINT sin finetuning denso presentan FID muy degradado (hasta 13,8) y no deben usarse para inferencia directa.
- El dataset contiene material NSFW segun la propia model card, lo que condiciona los sesgos y el contenido generado.
- El autor declara no poseer los derechos de las imagenes del dataset, lo que anade riesgo legal al uso comercial pese a la licencia MIT del modelo.
- No hay datos publicados de sesgos demograficos, tasas de alucinacion visual ni evaluaciones humanas.
- Proyecto con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huangdffs/toy-diffusion
- Dataset de entrenamiento: https://huggingface.co/datasets/aipracticecafe/anime-faces-256px-v2
- Dataset previo citado (paper i1): https://huggingface.co/datasets/aipracticecafe/anime-faces-256px
- Codigo de entrenamiento Toy-diffusion: https://github.com/deeplearningcafe/toy-diffusion
- Perfil del desarrollador: https://huggingface.co/aipracticecafe
