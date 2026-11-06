# diablomike20/krea2-turbo-uncensored-v1.1

## Resumen

krea2-turbo-uncensored-v1.1 es un modelo de difusion para generacion y edicion de imagenes, publicado por el usuario diablomike20 en Hugging Face. Se trata de una compilacion pre-fusionada y cuantizada del modelo base Krea 2 Turbo, a la que se han incorporado cinco LoRA distintos directamente en los pesos: un LoRA de detalle fino, un LoRA de edicion de identidad, un LoRA turbo de 4 pasos, un LoRA de refinado de piel y un LoRA de reduccion de rechazos de contenido NSFW. El resultado es un modelo orientado a generacion y edicion de imagenes sin las restricciones habituales de contenido.

El modelo conserva la arquitectura del transformer original de Krea 2 Turbo, con aproximadamente 12.820 millones de parametros en formato safetensors, y utiliza un text encoder Qwen3-VL de 4B y el VAE de Qwen-Image. La licencia declarada es MIT, lo que permite uso comercial, aunque el contenido NSFW y las implicaciones legales asociadas quedan bajo responsabilidad del usuario. El modelo se distribuye en formatos GGUF (cuantizacion Q4_K_M) y FP8, con un tamano de repositorio de 36,4 GB.

Su relevancia actual radica en que reduce el numero minimo de pasos de inferencia de 8 a 4 gracias al LoRA turbo de rango 64, lo que abarata considerablemente el coste computacional por imagen, y en que elimina las barreras de contenido para casos de uso creativos o de investigacion que requieren imagenes sin censura. No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, y no se han publicado benchmarks objetivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo de imagen, no LLM) |
| Parametros totales | 12.820.073.036 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | GGUF Q4_K_M, FP8, safetensors (pesos completos) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF, FP8 |
| Modelo base | krea/Krea-2-Turbo, conradlocke/krea2-identity-edit |
| Text encoder | Qwen3-VL 4B (qwen3vl_4b_fp8_scaled.safetensors, ~5,24 GB) |
| VAE | Qwen-Image VAE (qwen_image_vae.safetensors, ~254 MB) |
| Resolucion de entrenamiento/inferencia | 1024 x 1024 (minimo 512 x 512) |
| Pasos de inferencia | 4 (minimo), 8 (recomendado), 16 (maximo) |
| CFG | 1.0 (obligatorio para variantes turbo) |
| Tamano del repositorio | 36,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para generacion de imagenes, heredado del Krea 2 Turbo original. Sobre esa base se han fusionado cinco adaptadores LoRA con intensidades distintas: Fine Detail LoRA a 0,75, Identity Edit LoRA a 1,0, 4-step Turbo LoRA (rango 64) a 1,0, Skin Detail LoRA a 0,45 y Refusal Reduction NSFW LoRA (rango 64) a 0,8. La fusion se realiza directamente en los pesos, de modo que el modelo resultante no requiere cargar los LoRA por separado en el pipeline de inferencia.

La innovacion tecnica principal es el LoRA turbo de 4 pasos, que reduce el minimo utilizable de 8 a 4 pasos de muestreo, y el uso de un text encoder Qwen3-VL de 4B que aporta comprension multimodal de prompts. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card no detalla el proceso de entrenamiento de los LoRA fusionados. El modelo se distribuye como un transformer completo que debe colocarse en la carpeta `diffusion_models` de ComfyUI, y el autor advierte que es necesario usar el cargador GGUF actualizado.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024 x 1024 con 4 a 16 pasos y CFG 1.0.
- Edicion de imagenes imagen-a-imagen con preservacion de identidad mediante el Identity Edit LoRA.
- Edicion selectiva por prompt: cambiar ropa, anadir o quitar elementos, mantener objetos concretos (por ejemplo, una camiseta con texto).
- Generacion de contenido NSFW sin restricciones, incluyendo desnudos y contenido explicito.
- Refinado de piel y detalles faciales para evitar el aspecto "plastico".
- Soporte de texto en ingles y chino en los prompts.
- Generacion rapida: 4 pasos minimos, 8 recomendados, con FP8 aproximadamente el doble de rapido que otras variantes.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente generativo de imagen.

## Casos de uso

- Generacion de imagenes de producto y marketing: el modelo permite crear escenas a 1024 x 1024 con 8 pasos y CFG 1.0, adecuado para prototipado rapido de conceptos visuales en equipos de diseno.
- Edicion de fotografia con preservacion de identidad: el Identity Edit LoRA a fuerza 1,0 permite modificar ropa o entorno manteniendo el rostro del sujeto, util para retoque fotografico profesional.
- Creacion de contenido para ilustracion editorial: el modelo acepta prompts detallados y directos, lo que facilita generar escenas complejas con composicion controlada.
- Investigacion sobre sesgos y censura en modelos generativos: al ser un modelo descensurado con licencia MIT, sirve para estudiar el comportamiento de modelos sin filtros y comparar con variantes censuradas.
- Prototipado de personajes para videojuegos o narrativa visual: la capacidad de mantener coherencia de identidad entre generaciones permite iterar sobre un mismo personaje.
- Generacion de contenido NSFW para plataformas adultas legales: el modelo elimina las restricciones de contenido, aunque el autor advierte que mantiene barreras contra contenido ilegal.
- Flujos de trabajo en ComfyUI: se integra como nodo de diffusion_models con el cargador GGUF actualizado, lo que permite encadenarlo con otros nodos de postprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como FID, CLIP score ni comparaciones cuantitativas con otros modelos. Solo se indica cualitativamente que FP8 es aproximadamente el doble de rapido que otras variantes y que tanto GGUF como FP8 producen alta calidad.

## Requisitos de hardware

- VRAM estimada: el transformer en Q4_K_M ocupa 7,22 GB; en FP8, aproximadamente el doble (no confirmado en la informacion). Sumando text encoder (5,24 GB) y VAE (254 MB), el total en Q4_K_M ronda los 12,7 GB, por lo que cabe en GPUs consumer de 16 GB.
- GPU recomendadas: RTX 4090 (24 GB) para FP8 sin problemas; RTX 4080/4070 Ti (16 GB) para Q4_K_M; A100 o H100 para despliegues de produccion con mayor throughput.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas con cuantizacion Q4_K_M; en FP8 se recomienda 24 GB.
- Opciones de despliegue: ComfyUI con el cargador GGUF actualizado (canal "Channel (remote)" en ComfyUI Manager), pipeline diffusers, y presumiblemente llama.cpp-style GGUF loading a traves de ComfyUI. No se mencionan vLLM ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles de forma numerica; el autor afirma que FP8 es 2x mas rapido y que la generacion con 8 pasos es "muy rapida", pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| krea2-turbo-uncensored-v1.1 | 12,82 B | 1024 x 1024 | 4-16 | MIT | Hugging Face (0 descargas) |
| Krea-2-Turbo (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (krea) |
| conradlocke/krea2-identity-edit | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes. La comparativa se limita a la existencia de los modelos y sus formatos de distribucion.

## Limitaciones y advertencias

- El modelo esta disenado para generar contenido NSFW y explicito; su uso en produccion requiere verificacion de cumplimiento legal en la jurisdiccion correspondiente.
- El autor advierte que la edicion "no es perfecta" y que los rostros pueden cambiar entre generaciones si el prompt no es suficientemente fuerte.
- Riesgo de alucinacion visual: al ser un modelo de difusion, puede generar elementos incoherentes o no solicitados, especialmente en composiciones complejas.
- Sesgos conocidos: no se documentan sesgos especificos, pero al entrenarse sobre datos sin filtrar es probable que reproduzca sesgos de genero, etnia y cuerpo presentes en el dataset original.
- Limitaciones de idioma: solo se declaran ingles y chino; los prompts en otros idiomas pueden degradar la calidad.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el contenido generado puede infringir derechos de terceros o normativas locales sobre contenido adulto.
- Requiere el cargador GGUF actualizado de ComfyUI; versiones antiguas pueden fallar al cargar el modelo.
- El modelo tiene cero descargas y cero likes, sin validacion de la comunidad; no hay evidencia de calidad mas alla de las muestras del autor.
- El autor menciona "guardrails" contra contenido ilegal, pero no detalla su implementacion ni su eficacia.

## Enlaces

- [Hugging Face: diablomike20/krea2-turbo-uncensored-v1.1](https://huggingface.co/diablomike20/krea2-turbo-uncensored-v1.1)
- [Repositorio FP8 de referencia: ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8](https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8)
- [Modelo base: krea/Krea-2-Turbo](https://huggingface.co/krea/Krea-2-Turbo)
- [Modelo base de edicion: conradlocke/krea2-identity-edit](https://huggingface.co/conradlocke/krea2-identity-edit)
- [Transformer GGUF Q4_K_M](https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8/resolve/main/split/diffusion_models/Krea2_turbo_uncensored_edit_v1.1-Q4_K_M.gguf)
- [Text encoder Qwen3-VL 4B FP8](https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8/resolve/main/split/text_encoders/qwen3vl_4b_fp8_scaled.safetensors)
- [VAE Qwen-Image](https://huggingface.co/ChrisColeTech/krea2-turbo-uncensored-v1.1-FP8/resolve/main/split/vae/qwen_image_vae.safetensors)
