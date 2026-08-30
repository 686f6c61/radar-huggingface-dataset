# sleephashira/rei-character-noobai-xl-vpred-lora

## Resumen

El modelo `sleephashira/rei-character-noobai-xl-vpred-lora` es un adaptador LoRA (Low-Rank Adaptation) para el modelo base de difusión NoobAI XL V-Pred 1.0, desarrollado por el usuario sleephashira. Su propósito es añadir el personaje original "Rei" al repertorio del modelo base, permitiendo generar imágenes de este personaje mediante el token desencadenante `reichar`. El adaptador se entrenó sobre 28 imágenes sintéticas generadas y reestilizadas con otro adaptador (`multi3_lora.safetensors`) que a su vez fue entrenado con paneles con copyright de Bleach y JoJo, lo que introduce un linaje de material protegido.

La relevancia de este modelo radica en que ejemplifica el flujo de creación de adaptadores de personaje con datos sintéticos, pero también plantea cuestiones legales y éticas importantes debido a la procedencia del material de entrenamiento indirecto. El adaptador tiene un tamaño de archivo de aproximadamente 456 MB (0,5 GB en el repositorio) y está diseñado específicamente para la variante v-prediction de NoobAI XL, que requiere una configuración de inferencia particular (sampler Euler, `prediction_type="v_prediction"`, `rescale_betas_zero_snr=True`, etc.). No se trata de un modelo de lenguaje, sino de un componente de generación de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Stable Diffusion XL (base: NoobAI XL V-Pred 1.0) |
| Parametros totales | No disponible (archivo safetensors de 456 487 828 bytes) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes; el prompt tiene limites practicos pero no se especifican) |
| Tipos de cuantizacion | No disponible (se distribuye como safetensors sin cuantizacion declarada) |
| Idiomas soportados | No disponibles (el modelo base NoobAI XL soporta ingles y etiquetas Danbooru, pero el adaptador no declara idiomas) |
| Licencia | other (licencia personalizada con restricciones: solo uso personal, investigacion y educativo; prohibido uso comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA que se inserta en el modelo base NoobAI XL V-Pred 1.0, un checkpoint de difusion de imagenes basado en Stable Diffusion XL y entrenado sobre los datasets Danbooru y e621 con etiquetas nativas y captioning en lenguaje natural. El LoRA fue entrenado sobre 28 imagenes sinteticas del personaje Rei, generadas y reestilizadas con el adaptador `multi3_lora.safetensors`. Este adaptador auxiliar fue entrenado con 600 paneles monocromos de Bleach, 600 paneles a color oficiales de Bleach y 600 paneles de JoJo, todos ellos con copyright y sin licencia para ese entrenamiento. El checkpoint seleccionado para la publicacion corresponde al paso 1800 del entrenamiento.

No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion. La innovacion principal es la compatibilidad con la variante v-prediction de NoobAI XL, que requiere una configuracion especifica de inferencia: sampler Euler, `prediction_type="v_prediction"`, `rescale_betas_zero_snr=True`, `guidance_rescale=0.7` y CFG entre 4 y 5. El autor recomienda colocar el token `reichar` al inicio del prompt y describir explicitamente vestimenta, camara, expresion y escena. Un punto de partida probado es 28 pasos, CFG 5, escala LoRA 0.7 y un area total de aproximadamente 1024x1024 pixeles.

## Capacidades

- Generacion de imagenes del personaje Rei (un personaje original) mediante el token `reichar` en el prompt.
- Control de atributos visuales como vestimenta, peinado, expresion, encuadre y escena a traves de descripciones textuales.
- Compatibilidad con la libreria diffusers de Hugging Face, incluyendo la carga de pesos LoRA y la fusion con el modelo base.
- Requiere configuracion especifica de v-prediction (sampler Euler, `rescale_betas_zero_snr`, `guidance_rescale`) para un comportamiento correcto.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un adaptador de generacion de imagenes.
- Capacidades multilingues no declaradas; el modelo base acepta prompts en ingles y etiquetas de Danbooru, pero el adaptador no anade soporte adicional.

## Casos de uso

- Ilustracion personal de personajes: el adaptador permite generar imagenes del personaje Rei para proyectos artisticos personales, como concept art o ilustraciones de aficion, siempre que no haya fines comerciales.
- Variacion de diseno de personaje: se pueden explorar diferentes vestuarios, peinados y expresiones del personaje modificando el prompt, util para desarrolladores de personajes en entornos no comerciales.
- Investigacion sobre adaptacion con datos sinteticos: el modelo sirve como caso de estudio para analizar como el entrenamiento con pocas imagenes sinteticas afecta a la calidad y consistencia del personaje generado.
- Educacion en modelos de difusion: en cursos o talleres sobre Stable Diffusion y LoRA, se puede utilizar como ejemplo practico de configuracion de v-prediction y de los riesgos de sobreajuste.
- Pruebas de integracion con diffusers: desarrolladores pueden probar la carga de LoRA, la fusion de pesos y la configuracion de schedulers en pipelines de generacion de imagenes.
- Comparacion de calidad entre adaptadores: se puede comparar este LoRA con otros adaptadores de personaje entrenados con datos reales o sinteticos para evaluar diferencias en fidelidad y generalizacion.
- Estudio de linaje de datos y derechos de autor: el modelo es un ejemplo util para analizar las implicaciones legales del entrenamiento indirecto con material protegido, aunque su uso en este contexto debe limitarse a fines academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluacion cuantitativa como FID, CLIP score u otras metricas de calidad de imagen para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un LoRA sobre SDXL, se requiere al menos 8 GB de VRAM para el modelo base en precision fp16. Con cuantizacion (por ejemplo, 8-bit o 4-bit) podria reducirse a 6 GB, pero no se ha probado oficialmente.
- GPU recomendadas: tarjetas de gama media-alta como NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4080 o superiores. Tambien es posible usar GPUs de datacenter como A100 o H100, aunque no son necesarias.
- Compatibilidad con GPU de consumo: si, el modelo base SDXL y el LoRA caben en GPUs de consumo con 8 GB o mas de VRAM, siempre que se use fp16 o cuantizacion.
- Opciones de despliegue: se puede utilizar con la libreria diffusers de Python, asi como con interfaces graficas como ComfyUI o Automatic1111 (si se configura correctamente la v-prediction). Tambien es posible servirlo con herramientas como vLLM o TGI, aunque estas estan orientadas a modelos de lenguaje y no son habituales para difusion.
- Latencia y throughput: no disponibles. Dependen de la GPU, la resolucion y el numero de pasos. Como referencia, en una RTX 4090, una generacion de 1024x1024 con 28 pasos suele tardar entre 5 y 10 segundos, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRAs de personaje comparables en el mismo repositorio o en la documentacion proporcionada. Se puede comparar con el modelo base sin el adaptador:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoobAI XL V-Pred 1.0 (base) | Checkpoint SDXL completo | ~2.6B (estimado) | No aplica | Fair AI Public License 1.0-SD (con restricciones) | Hugging Face |
| Rei Character LoRA (este modelo) | Adaptador LoRA | No disponible (456 MB) | No aplica | other (uso personal/investigacion) | Hugging Face |

No se han encontrado otros adaptadores de personaje con caracteristicas similares en la informacion disponible.

## Limitaciones y advertencias

- Entrenamiento con solo 28 imagenes sinteticas: riesgo elevado de sobreajuste a poses, vestimentas, rasgos faciales o fondos especificos, lo que puede producir anatomias malformadas o detalles inconsistentes del personaje.
- Linaje con material con copyright: las imagenes sinteticas se generaron y reestilizaron con el adaptador `multi3`, entrenado con paneles de Bleach y JoJo sin licencia. Esto no otorga derechos sobre el material heredado y puede implicar riesgos legales para el usuario.
- Licencia restrictiva: solo se permite uso personal, investigacion y educativo. Queda prohibido el uso comercial, la publicidad, los servicios de pago, la reventa y cualquier actividad que genere ingresos.
- Configuracion de inferencia obligatoria: el modelo requiere ajustes especificos (Euler, v-prediction, `rescale_betas_zero_snr`, `guidance_rescale`) y no funcionara correctamente con otros samplers o modos de prediccion epsilon.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar elementos no deseados o distorsiones, especialmente con prompts complejos o fuera de la distribucion de entrenamiento.
- Sin garantias: el artefacto se proporciona "tal cual", sin garantias de ningun tipo, y el mantenedor excluye responsabilidad por usos, salidas, reclamaciones o danos derivados.
- El usuario es el unico responsable de verificar la legalidad del uso, obtener permisos necesarios y cumplir con las leyes locales y las condiciones de los modelos upstream (NoobAI XL, Illustrious XL, Fair AI Public License 1.0-SD).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sleephashira/rei-character-noobai-xl-vpred-lora
- Modelo base NoobAI XL V-Pred 1.0: https://huggingface.co/Laxhar/noobai-XL-Vpred-1.0
- Sitio oficial de NoobAI XL: https://noobaixl.org/
- Pagina de NoobAI XL en Civitai: https://civitai.com/models/833294/noobai-xl-nai-xl
- Pagina de NoobAI XL en Tensor.Art: https://tensor.art/models/809953668913885914
- Guia de NoobAI en BetterWaifu: https://betterwaifu.com/blog/noobai-guide
- Model card de Illustrious XL (upstream): https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Terminos de uso de Illustrious XL: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0/blob/main/TERM_OF_USE
- Fair AI Public License 1.0-SD: https://freedevproject.org/faipl-1.0-sd/
