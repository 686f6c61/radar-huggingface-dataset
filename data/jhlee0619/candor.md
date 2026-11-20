# jhlee0619/candor

## Resumen

CANDOR es un conjunto de adaptadores LoRA para Stable Diffusion 3.5 Medium, desarrollado por Junhyeok Lee, Byung-Hoon Kim y Kyu Sung Choi (Universidad Nacional de Seúl y EverEx). No es un modelo generativo independiente, sino un post-entrenamiento que se aplica sobre el modelo base de Stability AI para mejorar la fidelidad entre el prompt y la imagen generada sin necesidad de anotaciones humanas ni de un modelo de recompensa externo.

El método, descrito en el artículo *CANDOR: Contrastive Self-Denoising Rewards for Label-Free Text-to-Image Post-Training* (arXiv:2611.25457), introduce una recompensa auto-supervisada para Flow-GRPO. En lugar de puntuar qué tan bien desruidiza el modelo su propia muestra (señal dominada por la simplicidad de la imagen), CANDOR puntúa la diferencia entre el error de desruido condicional y el incondicional sobre el mismo latente y ruido, aprovechando la rama de prompt vacío que ya existe en classifier-free guidance.

El resultado es un adaptador de rango 32 y alpha 64 que mejora métricas como OCR, ImageReward y HPSv2.1 sobre el modelo base, y que también puede aplicarse encima de adaptadores Flow-GRPO públicos para mejorar sus resultados. Es relevante porque demuestra que se puede hacer RL post-entrenamiento en difusión sin etiquetas ni reward models, reduciendo el coste de alineación de modelos text-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, alpha 64) sobre el transformer de Stable Diffusion 3.5 Medium (MMDiT) |
| Parametros totales | no disponible (el repo ocupa 0,3 GB; el modelo base SD3.5 Medium tiene 2,5B parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, sin contexto de texto autoregresivo) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; el modelo base admite bfloat16 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponibles (el texto renderizado en imagen se evalua en ingles: GenEval y OCR) |
| Licencia | Stability AI Community License (license_name: stabilityai-ai-community, license: other) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer MMDiT de Stable Diffusion 3.5 Medium (2,5B parametros). CANDOR no modifica la arquitectura: entrena modulos LoRA de rango 32 y alpha 64 sobre el transformer y los fusiona con `merge_and_unload()` en el pipeline de `diffusers`. El entrenamiento se basa en Flow-GRPO con una recompensa contrastiva auto-supervisada.

La innovacion clave es la recompensa D = log MSE(∅) − log MSE(c), es decir, el log-ratio entre el error de desruido con prompt vacio y con prompt condicional sobre el mismo latente re-ruidoso y el mismo ruido. El log-ratio cancela cualquier factor de dificultad que escale ambos errores, de modo que D es alto cuando el prompt explica la muestra. Esto elimina la necesidad de anotaciones y de reward models: se reutiliza la rama incondicional de classifier-free guidance. El repositorio incluye cuatro adaptadores: `candor_sd35m` (desde el modelo base) y tres variantes sobre adaptadores Flow-GRPO publicos de GenEval, Text/OCR y PickScore.

## Capacidades

- Generacion de imagenes text-to-image a partir de prompts en lenguaje natural, heredando las capacidades de SD3.5 Medium.
- Mejora de la fidelidad prompt-imagen: mayor concordancia semantica y mejor renderizado de texto en imagen (OCR) que el modelo base.
- Renderizado de texto legible dentro de la imagen (rotulos, carteles, etiquetas), con mejora medida en el conjunto de test OCR de Flow-GRPO.
- Composicion de escenas con multiples objetos y relaciones espaciales (evaluado con GenEval).
- Mejora de preferencia estetica y alineacion perceptual (Aesthetic, PickScore, HPSv2.1, ImageReward, UnifiedReward).
- Compatibilidad con adaptadores Flow-GRPO existentes: se puede aplicar encima de ellos para mejorar sus metricas.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de difusion text-to-image, no un LLM.

## Casos de uso

- Generacion de creatividades publicitarias con texto integrado: el adaptador mejora el OCR de 0,63 a 0,70, lo que permite generar carteles, banners y etiquetas con texto legible sin post-edicion manual.
- Ilustracion editorial y de producto: la mejora en CLIPScore (0,284 a 0,285) y Aesthetic (5,38 a 5,45) permite obtener imagenes mas alineadas con el brief creativo en flujos de diseno.
- Prototipado rapido de conceptos visuales: al ser un LoRA de 0,3 GB sobre SD3.5 Medium, se puede cargar y fusionar en pipelines de `diffusers` existentes sin reentrenar el modelo base.
- Mejora de modelos Flow-GRPO ya desplegados: aplicar `candor_on_flowgrpo_geneval` sube el ImageReward de 1,12 a 1,28 y el HPSv2.1 de 0,280 a 0,305, util para equipos que ya usan esos adaptadores.
- Generacion de imagenes para accesibilidad y senalizacion: el mejor OCR permite crear paneles, avisos y carteles con texto comprensible en entornos simulados o sinteticos.
- Investigacion en RL para difusion: sirve como referencia reproducible de post-entrenamiento sin etiquetas, con codigo en GitHub y articulo en arXiv, para experimentar con recompensas auto-supervisadas.
- Aumento de datos sinteticos: generar imagenes con alta concordancia prompt-imagen para entrenar clasificadores o detectores en dominios con pocos datos reales.

## Benchmarks y rendimiento

Resultados medidos por los autores a 512 × 512, 40 pasos y CFG 7,0. Mayor es mejor en todas las metricas.

| Modelo | GenEval | OCR | CLIPScore | Aesthetic | PickScore | HPSv2.1 | ImageReward | UnifiedReward |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Stable Diffusion 3.5 Medium | 0,69 | 0,63 | 0,284 | 5,38 | 22,37 | 0,283 | 0,91 | 3,11 |
| `candor_sd35m` | 0,71 | 0,70 | 0,285 | 5,45 | 22,56 | 0,297 | 1,09 | 3,20 |
| Flow-GRPO (GenEval) | 0,94 | 0,71 | 0,294 | 5,33 | 22,53 | 0,280 | 1,12 | 3,27 |
| `candor_on_flowgrpo_geneval` | 0,92 | 0,73 | 0,301 | 5,52 | 22,73 | 0,305 | 1,28 | 3,20 |
| Flow-GRPO (OCR) | 0,70 | 0,92 | 0,290 | 5,31 | 22,45 | 0,284 | 0,99 | 3,16 |
| `candor_on_flowgrpo_text` | 0,74 | 0,92 | 0,293 | 5,24 | 22,55 | 0,293 | 1,13 | 3,11 |
| Flow-GRPO (PickScore) | 0,75 | 0,73 | 0,280 | 5,91 | 23,47 | 0,321 | 1,31 | 3,41 |
| `candor_on_flowgrpo_pickscore` | 0,74 | 0,76 | 0,281 | 5,97 | 23,55 | 0,322 | 1,36 | 3,43 |

Datos adicionales del articulo: concordancia de la recompensa con la correccion dentro de grupos del mismo prompt de 0,60 (GenEval) y 0,63 (OCR); confianza absoluta auto-reportada de 0,48 y 0,51 frente a 0,5 de azar.

## Requisitos de hardware

- VRAM estimada: el adaptador pesa 0,3 GB; el modelo base SD3.5 Medium requiere aproximadamente 10-12 GB en bfloat16 para inferencia a 512 × 512, y alrededor de 6-8 GB con cuantizacion a 8 bits o fp16 con offloading.
- GPU recomendadas: A100 40/80 GB y H100 para lotes grandes y alta resolucion; RTX 4090 (24 GB) para inferencia comoda en bfloat16; RTX 3090 (24 GB) y RTX 4080 (16 GB) tambien son viables.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y 4070 Ti Super (16 GB) en bfloat16; en GPUs de 8-12 GB requiere cuantizacion u offloading.
- Despliegue: `diffusers` con `StableDiffusion3Pipeline` y `peft.PeftModel` (flujo oficial documentado); tambien es compatible con ComfyUI y con runners que acepten LoRA de SD3.5.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de los 40 pasos de inferencia usados en la evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GenEval | OCR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CANDOR (`candor_sd35m`) | LoRA sobre 2,5B | no aplica | 0,71 | 0,70 | Stability AI Community | Hugging Face (repo 0,3 GB) |
| Stable Diffusion 3.5 Medium | 2,5B | no aplica | 0,69 | 0,63 | Stability AI Community | Hugging Face |
| Flow-GRPO (GenEval) | LoRA sobre 2,5B | no aplica | 0,94 | 0,71 | no disponible | Hugging Face (`jieliu/SD3.5M-FlowGRPO-GenEval`) |
| Flow-GRPO (PickScore) | LoRA sobre 2,5B | no aplica | 0,75 | 0,73 | no disponible | Hugging Face (`jieliu/SD3.5M-FlowGRPO-PickScore`) |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar Stable Diffusion 3.5 Medium y fusionar el adaptador; no funciona como pipeline independiente.
- El OCR y las evaluaciones se han realizado en ingles; el rendimiento en otros idiomas no esta documentado.
- La licencia es la Stability AI Community License, no una licencia open source permisiva; el uso comercial esta sujeto a los terminos de Stability AI y al archivo `LICENSE.md` y `NOTICE` del repositorio.
- Riesgo de alucinacion visual y de sesgos heredados del modelo base (SD3.5 Medium), no evaluados de forma especifica en el articulo.
- El adaptador `candor_sd35m` mejora GenEval solo de 0,69 a 0,71, por debajo de Flow-GRPO (GenEval) con 0,94; la eleccion del adaptador depende de la metrica objetivo.
- Los resultados se midieron a 512 × 512, 40 pasos y CFG 7,0; el comportamiento a otras resoluciones, pasos o escalas de guiado no esta documentado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- No hay informacion sobre sesgos demograficos, toxicidad o fidelidad en dominios especializados (medico, legal, industrial).

## Enlaces

- Hugging Face: https://huggingface.co/jhlee0619/candor
- Articulo arXiv: https://arxiv.org/abs/2611.25457
- Pagina del proyecto: https://jhlee0619.github.io/candor/
- Codigo en GitHub: https://github.com/jhlee0619/candor
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Adaptador Flow-GRPO GenEval: https://huggingface.co/jieliu/SD3.5M-FlowGRPO-GenEval
- Adaptador Flow-GRPO Text: https://huggingface.co/jieliu/SD3.5M-FlowGRPO-Text
- Adaptador Flow-GRPO PickScore: https://huggingface.co/jieliu/SD3.5M-FlowGRPO-PickScore
