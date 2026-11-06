# cpral/HomeIMG-1.2B-PL-epoch22

## Resumen

HomeIMG-1.2B-PL-epoch22 es un modelo de generacion de imagenes texto-a-imagen de 256x256 pixeles desarrollado por el autor independiente cpral, entrenado desde cero en hardware doméstico (ocho tarjetas graficas). El componente generativo es un denoiser DiT (diffusion transformer) de 1.235 millones de parametros, condicionado por un modelo de lenguaje MoE polaco-ingles congelado (Poziomka-Baza, 4B) a traves de un refiner entrenable de 72,1 millones de parametros. El modelo es bilingue: acepta prompts tanto en polaco como en ingles.

El modelo es una ampliacion del anterior HomeIMG-641M-PL-epoch19, que pasa de 6 a 12 bloques y se entrena durante 3 epocas adicionales. Los nuevos bloques se anaden al final con proyecciones de salida inicializadas a cero (siguiendo el enfoque de SANA 1.5), de modo que al inicio del entrenamiento el modelo calcula exactamente lo mismo que su predecesor. El nombre "epoch22" refleja que el denoiser acumula 22 epocas de entrenamiento: 15 en ingles, 4 bilingues con 6 bloques y 3 bilingues tras la ampliacion.

La relevancia de este modelo radica en que demuestra que es posible entrenar un generador de imagenes bilingue funcional desde cero con recursos de consumo, y en que reporta mejoras medibles en metricas objetivas (FD-DINOv2 y val/loss) respecto a todas las versiones anteriores de la familia HomeIMG. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) con flow-matching / rectified flow; denoiser de 12 bloques, anchura 2560, 20 cabezas (128), SwiGLU 6912, un token por pixel de latente (rejilla 16x16); self-attention con RoPE 2D y QK-norm, cross-attention a texto (anchura 1280), MLP SwiGLU, tiempo via adaLN-single estilo PixArt |
| Parametros totales | 1.235.000.832 (denoiser 1235,0M + refiner 72,1M; el text encoder Poziomka-Baza de 4B esta congelado y no forma parte del recuento del repo) |
| Parametros activos | no disponible para el denoiser (no es MoE); el text encoder MoE activa aproximadamente 450M parametros por token (8 de 32 expertos) |
| Longitud de contexto | hasta 255 tokens de prompt (limite del refiner) |
| Tipos de cuantizacion | pesos del text encoder en int8 (escala por experto y por columna, multiplicaciones en bf16); no se documentan otros formatos de cuantizacion |
| Idiomas soportados | polaco (pl) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers, pipeline `AuroraIMG2Pipeline` con `custom_code`) |

## Arquitectura y entrenamiento

El denoiser es un transformer de difusion de 12 bloques con anchura 2560 y 20 cabezas de atencion de dimension 128, con MLP SwiGLU de 6912. Cada bloque combina self-attention con RoPE 2D y QK-norm, cross-attention hacia las representaciones de texto (anchura 1280) y MLP SwiGLU; la informacion temporal se inyecta mediante adaLN-single al estilo de PixArt. Los bloques 0-5 proceden del modelo predecesor HomeIMG-641M-PL-epoch19 y los bloques 6-11 son nuevos, anadidos con `attn.out`, `cross.out` y `mlp.out_proj` inicializados a cero (identidad al inicio), sin copiar bloques existentes. El text encoder es Poziomka-Baza, un BailingMoeV2 congelado de 16 capas, anchura 2048 y 128 expertos, de los cuales 8 de 32 estan activos por token; sus pesos se almacenan en int8. Sobre el se aplica un refiner entrenable de 72,1M (proyeccion 2048 a 1280, 4 bloques bidireccionales de anchura 1280, 20 cabezas q / 5 kv, RoPE 1D, SwiGLU 3456, RMSNorm) con un prompt vacio aprendido para CFG. El decodificador es el decoder pequeno de FLUX.2, congelado, que opera sobre latentes de 128x16x16.

El entrenamiento parte de las weights EMA de la etapa 2 de HomeIMG-641M-PL-epoch19 (val/loss 0,6284) ampliadas a 12 bloques, y se realiza durante 3 epocas (8750 pasos x 2016 = 17,6 millones de muestras) sobre 5,88 millones de imagenes del dataset QLNI/FLUX-Reason-6M-flux2-latents. Para cada imagen se usa un caption aleatorio, en el 50% de los casos traducido al polaco (cpral/FLUX-Reason-6M-captions-pl, generado con Index-Translate-2B; aproximadamente el 0,3% de traducciones marcadas como defectuosas se sustituyeron por el original ingles). Se entrena el modelo completo. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generacion de imagenes texto-a-imagen a resolucion 256x256 pixeles.
- Comprension de prompts en polaco e ingles, con paridad de comportamiento entre ambos idiomas.
- Generacion condicionada por prompts de hasta 255 tokens.
- Clasificador libre de guia (CFG) con prompt vacio aprendido, lo que permite ajustar la adherencia al prompt mediante la escala CFG.
- Muestreo con scheduler Euler (50 pasos, CFG 3,0 en los ejemplos publicados).
- No se documentan capacidades de tool calling, function calling, agentes, vision de entrada, audio ni modo de razonamiento explicito; el modelo es exclusivamente generativo de imagen.

## Casos de uso

- Generacion de ilustraciones para publicaciones bilingues: el modelo produce imagenes a partir de prompts en polaco o ingles con el mismo comportamiento, adecuado para medios que publican en ambos idiomas sin duplicar el pipeline de generacion.
- Prototipado rapido de conceptos visuales: con 256x256 pixeles y 1,2B parametros, permite iterar bocetos de escenas (paisajes, objetos, composiciones) en hardware de consumo antes de escalar a modelos mayores.
- Generacion de assets para videojuegos y aplicaciones en fase de preproduccion: sprites, iconos o fondos de baja resolucion que luego se reescalan o se usan como referencia.
- Experimentacion academica con arquitecturas DiT y flow-matching: al estar entrenado desde cero y publicar metricas de validacion (val/loss, FD-DINOv2), sirve como base reproducible para estudiar ampliacion de profundidad con inicializacion a cero.
- Investigacion sobre modelos bilingues de generacion: permite comparar directamente el rendimiento en polaco e ingles sobre los mismos prompts y semillas.
- Fine-tuning sobre dominios concretos: la licencia Apache 2.0 y el formato diffusers facilitan adaptar el modelo a estilos o datasets especificos (por ejemplo, ilustracion infantil o fotografia de producto) partiendo de las weights publicadas.
- Generacion de datos sinteticos de baja resolucion para aumento de datasets de vision: imagenes etiquetadas por prompt que pueden usarse como datos auxiliares en tareas de clasificacion o deteccion.

## Benchmarks y rendimiento

Metricas publicadas por el autor. FD-DINOv2 (Stein et al. 2023) mide la distancia de Frechet entre caracteristicas CLS de DINOv2 de imagenes generadas y reales; valores mas bajos son mejores. Evaluacion sobre 4096 captions reservados, 50 pasos Euler, CFG 3,0, semillas fijas, caracteristicas `vit_base_patch14_reg4_dinov2.lvd142m`; la referencia son latentes reales decodificados con el mismo decoder FLUX.2. La columna PL usa los mismos prompts traducidos al polaco. Val/loss es el MSE de velocidad sobre las mismas 4096 imagenes con captions en ingles, ruido y t fijos.

| Modelo | Bloques | val/loss | FD-DINOv2 (EN) | FD-DINOv2 (PL) |
|---|---|---|---|---|
| HomeIMG-641M-epoch15 (WSM, Slayer149) | 6 | 0,6297 | 27,66 | no disponible |
| HomeIMG-641M-PL-epoch19 (WSM) | 6 | 0,6277 | 28,90 | 29,29 |
| HomeIMG-1.2B-PL-epoch22 (EMA, este repo) | 12 | 0,6170 | no disponible | 26,35 |

El autor senala que la val/loss seguia descendiendo hasta el ultimo paso (0,6171 en el paso 8704, 0,6170 en el paso 8750), por lo que el modelo no esta saturado. Los valores no son comparables con los FD-DINOv2 publicados en la literatura.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repo ocupa 9,8 GB en safetensors, pero incluye el text encoder MoE congelado ademas del denoiser y el refiner; el desglose de VRAM por componente no se documenta.
- GPU recomendadas: no disponible. El autor indica que el entrenamiento se realizo en ocho tarjetas graficas domesticas, pero no especifica modelos ni memoria.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; el hecho de que el entrenamiento se hiciera en hardware domestico sugiere viabilidad en GPUs de consumo, pero no se aportan cifras.
- Opciones de despliegue: libreria diffusers con pipeline `AuroraIMG2Pipeline` (requiere `custom_code`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La unica comparacion documentada es interna a la familia HomeIMG (ver tabla de benchmarks). Como referencia cualitativa, el modelo se situa en la categoria de generadores texto-a-imagen de baja resolucion (256x256) entrenados desde cero, con un text encoder congelado de tipo MoE y licencia Apache 2.0; no se aportan parametros, contexto ni rendimiento de alternativas como SANA, PixArt o SDXL en esta informacion.

| Modelo | Parametros | Contexto de prompt | FD-DINOv2 (PL) | Licencia |
|---|---|---|---|---|
| HomeIMG-1.2B-PL-epoch22 | 1,2B | 255 tokens | 26,35 | Apache 2.0 |
| HomeIMG-641M-PL-epoch19 | 641M | 255 tokens | 29,29 | no disponible en esta informacion |
| HomeIMG-641M-epoch15 | 641M | 255 tokens | no disponible | no disponible en esta informacion |

## Limitaciones y advertencias

- Resolucion fija de 256x256 pixeles; no se documenta soporte para resoluciones superiores ni para aspect ratios distintos.
- Longitud maxima de prompt de 255 tokens, limitada por el refiner.
- Solo polaco e ingles; no se documenta comportamiento en otros idiomas.
- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre FLUX-Reason-6M, hereda los sesgos de composicion y representacion de ese dataset.
- Riesgo de alucinacion visual: inherente a los modelos generativos; las metricas FD-DINOv2 publicadas son relativas a la propia distribucion de referencia y no garantizan fidelidad semantica en prompts complejos.
- La val/loss seguia descendiendo al final del entrenamiento, lo que sugiere que el modelo no esta saturado y que un entrenamiento adicional podria mejorar los resultados.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion con atribucion; conviene revisar las condiciones de los datasets de origen (QLNI/FLUX-Reason-6M-flux2-latents y cpral/FLUX-Reason-6M-captions-pl) antes de un despliegue comercial.
- El pipeline requiere `custom_code` de diffusers (`AuroraIMG2Pipeline`), lo que anade dependencia de codigo especifico del autor y puede complicar la integracion en stacks estandar.
- El recuento de parametros del repo (1,235B) no incluye el text encoder Poziomka-Baza de 4B, que debe cargarse aparte y consume memoria adicional en inferencia.
- Modelo con 0 descargas y 1 like en el momento de la consulta: ecosistema de validacion muy limitado, sin garantias de robustez en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-epoch22
- Perfil del autor: https://huggingface.co/cpral
- Modelo base (predecesor): https://huggingface.co/cpral/HomeIMG-641M-PL-epoch19
- Text encoder Poziomka-Baza: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Version anterior HomeIMG-641M-epoch15: https://huggingface.co/cpral/HomeIMG-641M-epoch15
- Dataset de latentes: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Dataset de captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Paper SANA 1.5 (arxiv:2501.18427): https://arxiv.org/abs/2501.18427
- Paper FD-DINOv2 (arxiv:2306.04675): https://arxiv.org/abs/2306.04675
