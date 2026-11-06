# aipracticecafe/toy-diffusion

## Resumen

Toy-diffusion es un conjunto de experimentos controlados de arquitectura para modelos de difusión de texto a imagen, publicados por el usuario aipracticecafe. El repositorio no contiene un modelo de produccion unico, sino una coleccion de checkpoints resultantes de ablaciones sobre el backbone, el adaptador de texto y el esquema de entrenamiento disperso (SPRINT), entrenados sobre el dataset anime-faces-256px-v2 (87.505 recortes de rostros de alta calidad) y utilizando latentes del VAE de Flux 2.

El objetivo es empirico: comparar variantes dual-stream frente a single-stream, adaptadores de texto Transformer de dos capas frente a MLP simple, y entrenamiento denso frente a disperso con recuperacion mediante finetuning. El checkpoint con mejor FID-20K es dual_stream_768_12_trans_2_bs_1024, con un valor de 2,4240 tras 1400 epocas y batch size de 1024.

Es relevante ahora porque documenta con detalle decisiones de diseno poco habituales, como la eliminacion total del condicionamiento ADA-LN (el timestep se proyecta como token y se antepone a los tokens de texto) y el uso de SPRINT para reducir coste de preentrenamiento. El repositorio ocupa 170 GB, lo que refleja la acumulacion de multiples checkpoints mas que un unico modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con variantes dual-stream y single-stream; tambien una variante Conv-Attn hibrida tipo UNet (SnapGen) |
| Parametros totales | no disponible (se documentan anchura y profundidad, no el recuento de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de texto a imagen; no se especifica limite de tokens de prompt) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los checkpoints se basan en bloques DiT con anchura 768 y profundidades de 12, 13, 14 o 16. La variante dual-stream procesa tokens de texto e imagen en flujos separados, mientras que la single-stream los integra en un unico flujo. Ambas eliminan el condicionamiento ADA-LN y proyectan el timestep como un token antepuesto a la secuencia de texto. El adaptador de texto es el elemento diferenciador: las mejores variantes usan un Transformer de dos capas (trans_2), frente a un MLP simple que actua como cuello de botella. Tambien se evalua una variante con encoder de texto LLM y una hibrida Conv-Attn de SnapGen.

El entrenamiento emplea el optimizador AdamW de 8 bits con warmup y tasa de aprendizaje constante de 4e-4, batch size de 256 en la configuracion base (hasta 1024 en la mejor variante) y latentes del VAE de Flux 2. La innovacion principal es SPRINT, un marco de entrenamiento disperso con ratio de descarte de tokens del 75 por ciento, que reduce el tiempo de entrenamiento aproximadamente un 50 por ciento y baja la memoria activa de GPU de 23 GB a 17 GB, seguido de un finetuning denso para recuperar calidad. No se documenta el numero total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generacion de imagenes de texto a imagen, orientada especificamente a rostros de estilo anime a 256 px.
- Seguimiento de prompts en ingles; la variante con encoder LLM muestra mejor adherencia al prompt pero mayor inestabilidad con etiquetas poco representadas.
- Composicion condicional compleja y mezcla de conceptos (por ejemplo, personajes con vestuario de otros) en las variantes single-stream.
- Entrenamiento eficiente en memoria y tiempo mediante el esquema disperso SPRINT con recuperacion por finetuning denso.
- No se documenta soporte de tool calling, agentes, vision de entrada, audio ni modo de razonamiento.

## Casos de uso

- Investigacion en arquitecturas de difusion: comparar el impacto de adaptadores de texto Transformer frente a MLP usando los checkpoints y las metricas FID publicadas como referencia reproducible.
- Estudio de eficiencia de entrenamiento: replicar el esquema SPRINT con descarte del 75 por ciento para medir la reduccion de VRAM y tiempo de pared en hardware propio.
- Generacion de retratos anime para prototipos: usar el checkpoint dual_stream_768_12_trans_2_bs_1024 (FID 2,4240) para producir avatares de personajes con calidad visual alta dentro del dominio de entrenamiento.
- Analisis de sobreajuste conceptual: emplear las variantes dual-stream para estudiar por que asocian personajes con su vestuario nativo y no generalizan a combinaciones nuevas.
- Benchmarking de pipelines de difusion: integrar los checkpoints en scripts de evaluacion FID-20K para validar herramientas de medida o comparar con otros modelos del mismo dominio.
- Docencia y divulgacion: ilustrar el efecto de la anchura, la profundidad y el tipo de backbone en la calidad final de un modelo generativo con resultados cuantitativos concretos.

## Benchmarks y rendimiento

Resultados FID-20K publicados en la model card:

| Checkpoint | Configuracion | Epoca | FID (menor es mejor) |
|---|---|---|---|
| dual_stream_768_12_trans_2_bs_1024 | Anchura 768, profundidad 12, trans_2, BS 1024 | 1400 | 2,4240 |
| dual_stream_768_12_trans_2 | Anchura 768, profundidad 12, trans_2, BS 512 | 600 | 3,0635 |
| dual_stream_768_12_llm_te_log_normal | Anchura 768, profundidad 12, encoder LLM, log-normal | 1000 | 3,1219 |
| dual_stream_768_12_modern_cfm | Anchura 768, profundidad 12, trans_2, CFM contrastivo | 700 | 3,2707 |
| efficient_unet_bs_256 | Hibrido Conv-Attn SnapGen, BS 256 | 400 | 3,4479 |
| single_stream_768_14_trans_2 | Anchura 768, profundidad 14, single-stream, BS 512 | 600 | 3,8954 |
| sprint_dual_stream_768_13_trans_2_fined | SPRINT disperso, finetuning denso | 1000 | 3,9647 |
| dual_stream_768_16_mlp | Anchura 768, profundidad 16, adaptador MLP | 400 | 4,2485 |
| sprint_single_stream_768_14_fined | SPRINT single-stream, finetuning denso | 1000 | 7,3793 |
| sprint_single_stream_768_14_trans_img_2_rope_text | SPRINT disperso sin finetuning (75 por ciento) | 750 | 9,7705 |
| sprint_dual_stream_768_13_trans_2 | SPRINT disperso sin finetuning (75 por ciento) | 700 | 13,8281 |

Datos adicionales de eficiencia: los bloques dual-stream completan una epoca en aproximadamente 3,5 minutos frente a 5,1 minutos de los single-stream bajo la misma restriccion de VRAM (unos 23 GB). En la comparacion a 500 epocas, dual_stream_768_12_trans_2 alcanza FID 3,54 frente a 4,57 de dual_stream_768_16_mlp.

## Requisitos de hardware

- VRAM de entrenamiento: aproximadamente 23 GB en configuracion densa y 17 GB con SPRINT (descarte del 75 por ciento), segun la model card.
- VRAM de inferencia: no disponible; depende del checkpoint concreto y no se documenta.
- GPU recomendadas: no se especifican modelos; los 23 GB de entrenamiento encajan en tarjetas de 24 GB como RTX 4090 o A10G, y con holgura en A100 y H100.
- Cabe en GPU de consumo: probablemente si, en tarjetas de 24 GB para las variantes densas, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de difusion, requeriria un pipeline de text-to-image compatible con safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| toy-diffusion (dual_stream_768_12_trans_2_bs_1024) | no disponible (anchura 768, profundidad 12) | no disponible | FID-20K 2,4240 en anime-faces-256px-v2 | MIT | Hugging Face, 170 GB de repo |
| SDXL | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Flux.1 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| SnapGen (variante Conv-Attn) | no disponible | no disponible | FID-20K 3,4479 en la misma evaluacion | no disponible | integrado como ablacion en este repo |

No se dispone de datos de benchmarks comparables de otros modelos en la informacion proporcionada; la comparativa se limita a las variantes internas evaluadas por el autor.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente con recortes de rostros anime a 256 px; no se espera generalizacion a fotografia real ni a escenas complejas.
- Sobreajuste conceptual en las variantes dual-stream: tienden a asociar cada personaje con su vestuario original y fallan en composiciones de tipo cosplay.
- Inestabilidad con etiquetas poco representadas en la variante con encoder LLM, pese a su mejor seguimiento de prompt.
- Los checkpoints SPRINT sin finetuning denso presentan FID muy degradado (hasta 13,8281); no deben usarse directamente en inferencia.
- Contenido NSFW: el dataset de entrenamiento incluye material sensible, segun advierte el propio autor.
- Derechos de imagen: el autor declara no poseer los derechos de las imagenes del dataset, lo que puede afectar a un uso comercial aunque la licencia del modelo sea MIT.
- No se documentan sesgos demograficos, tasas de alucinacion, limites de contexto ni procesos de alineacion.
- El repositorio de 170 GB agrega multiples checkpoints; conviene descargar solo el checkpoint deseado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aipracticecafe/toy-diffusion
- Dataset de entrenamiento: https://huggingface.co/datasets/aipracticecafe/anime-faces-256px-v2
- Dataset previo citado (paper i1): https://huggingface.co/datasets/aipracticecafe/anime-faces-256px
- Codigo de entrenamiento Toy-diffusion: https://github.com/deeplearningcafe/toy-diffusion
- Perfil del autor: https://huggingface.co/aipracticecafe
