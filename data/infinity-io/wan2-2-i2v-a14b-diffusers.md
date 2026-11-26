# Infinity-io/Wan2.2-I2V-A14B-Diffusers

## Resumen
Wan2.2-I2V-A14B es un modelo de difusion para generacion de video a partir de imagen (image-to-video), desarrollado por el equipo Wan (Wan-AI, vinculado a Alibaba). Esta publicacion concreta, Infinity-io/Wan2.2-I2V-A14B-Diffusers, es un espejo en formato Diffusers del modelo oficial Wan-AI/Wan2.2-I2V-A14B, empaquetado para su uso con la libreria diffusers mediante WanImageToVideoPipeline. Resuelve el problema de animar una imagen estatica en un clip de video coherente, con soporte para resoluciones de 480P y 720P.

La innovacion principal de la familia Wan2.2 es la incorporacion de una arquitectura Mixture-of-Experts (MoE) al modelo de difusion: el proceso de denoising se reparte entre expertos especializados segun el paso temporal, ampliando la capacidad del modelo sin incrementar proporcionalmente el coste computacional. El modelo cuenta con aproximadamente 14.288 millones de parametros en pesos (segun los safetensors del repositorio) y un repositorio de 126,2 GB.

Es relevante porque combina una licencia permisiva (Apache 2.0), soporte en Diffusers y ComfyUI, y una mejora sustancial de datos de entrenamiento respecto a Wan2.1 (+65,6 % de imagenes y +83,2 % de videos), lo que se traduce en mejor generalizacion en movimiento, semantica y estetica. Esta pensado para generacion de video con control estetico y movimiento de camara mas estable que su predecesor.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Difusion con arquitectura Mixture-of-Experts (MoE) sobre el proceso de denoising; pipeline WanImageToVideoPipeline |
| Parametros totales | 14.288.901.184 (≈14,29 mil millones) |
| Parametros activos | no disponible (MoE con expertos especializados por paso temporal; numero de expertos y parametros activos no especificados) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; es un modelo de difusion de video) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Diffusers) |

## Arquitectura y entrenamiento
Wan2.2-I2V-A14B se basa en un modelo de difusion para video con una arquitectura Mixture-of-Experts que separa el proceso de denoising a lo largo de los pasos temporales mediante modelos expertos especializados. Este diseno amplia la capacidad global del modelo manteniendo el mismo coste computacional que un modelo denso de menor tamano. El modelo esta orientado a image-to-video y soporta resoluciones de 480P y 720P.

En cuanto a los datos de entrenamiento, la model card indica que Wan2.2 se entreno con un volumen significativamente mayor que Wan2.1: un 65,6 % mas de imagenes y un 83,2 % mas de videos. Ademas, se incorporaron datos esteticos curados con etiquetas detalladas de iluminacion, composicion, contraste y tono de color, lo que permite un control mas preciso del estilo cinematografico. No se especifican en la informacion disponible el numero exacto de tokens o clips, la composicion detallada del dataset ni si se emplearon tecnicas de RLHF o DPO (poco habituales en modelos de difusion). Tampoco se detalla el uso de decodificacion especulativa u otras optimizaciones de inferencia para esta variante.

## Capacidades
- Generacion de video a partir de una imagen de entrada (image-to-video) en resoluciones de 480P y 720P.
- Generacion de movimiento complejo y estable, con menor incidencia de movimientos de camara irreales respecto a Wan2.1.
- Soporte de escenas estilizadas diversas gracias a la ampliacion del dataset de entrenamiento.
- Control estetico de estilo cinematografico mediante datos etiquetados (iluminacion, composicion, contraste, tono de color).
- Soporte multilingue de prompts en ingles (en) y chino (zh).
- Integracion con Diffusers (WanImageToVideoPipeline) y ComfyUI.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio o modo de razonamiento (no aplicables a un modelo de difusion de video).

## Casos de uso
- Animacion de fotografias para marketing y redes sociales: a partir de una imagen fija de producto o escena, el modelo genera un clip de 480P/720P con movimiento coherente, util para anuncios y contenido promocional.
- Previsualizacion de storyboards en produccion audiovisual: convertir frames clave en clips animados para validar ritmo, movimiento de camara y composicion antes del rodaje.
- Creacion de contenido para videojuegos y entornos interactivos: animar ilustraciones conceptuales o assets 2D para prototipos de cinemáticas y menus animados.
- Generacion de video para e-commerce: animar fotos de catalogo para mostrar productos en uso, con control estetico para mantener coherencia de marca.
- Prototipado rapido en estudios de diseno y VFX: iterar sobre variaciones de movimiento y estilo a partir de una imagen de referencia, integrandolo en ComfyUI para flujos de trabajo existentes.
- Investigacion en generacion de video: servir como base reproducible (licencia Apache 2.0, pesos safetensors) para experimentos academicos sobre difusion con MoE y control estetico.
- Automatizacion de contenido educativo: animar diagramas o ilustraciones didacticas para materiales formativos, con prompts en ingles o chino.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 126,2 GB en safetensors, lo que da una idea del orden de magnitud del almacenamiento necesario; la VRAM requerida depende de la precision y del particionado, y no se detalla en la informacion.
- GPU recomendadas: no se especifican para la variante I2V-A14B. La model card menciona que el modelo TI2V-5B de la misma familia puede ejecutarse en GPUs de consumo como la RTX 4090; para el A14B se indica soporte de inferencia multi-GPU en el codigo oficial.
- Cabe en GPU de consumo: no confirmado para esta variante A14B; el modelo de 5B de la familia si se indica compatible con RTX 4090.
- Opciones de despliegue: Diffusers (WanImageToVideoPipeline), ComfyUI y el repositorio oficial Wan2.2 (con inferencia multi-GPU). Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este modelo (no aplicables a difusion de video).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Resolucion | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-I2V-A14B (este) | ≈14,29 mil millones | 480P y 720P | Difusion MoE | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.2-TI2V-5B | 5B (no confirmado en detalle) | 720P a 24 fps | Difusion con VAE de alta compresion (16x16x4) | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.1 (familia previa) | no disponible | no disponible | Difusion (sin MoE) | Apache 2.0 | Hugging Face, GitHub |

La comparativa con modelos de terceros de la misma categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con datos web y esteticos curados, puede heredar sesgos de representacion de esos datasets.
- Riesgo de alucinacion visual: como modelo generativo, puede producir movimientos fisicamente inconsistentes, artefactos o deformaciones en escenas complejas, aunque la model card indica mayor estabilidad que Wan2.1.
- Limitaciones de idioma: los prompts estan soportados en ingles y chino; no se garantiza un rendimiento equivalente en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del repositorio oficial y de los datasets subyacentes.
- Caveats para produccion: esta publicacion es un espejo de la comunidad (Infinity-io) con 0 descargas y 0 likes en el momento de la consulta; se recomienda validar su integridad frente al repositorio oficial Wan-AI/Wan2.2-I2V-A14B-Diffusers. El tamano del repositorio (126,2 GB) exige infraestructura de almacenamiento considerable. No se detallan requisitos de VRAM ni latencias, lo que dificulta la planificacion de capacidad.

## Enlaces
- Repositorio Hugging Face (este modelo): https://huggingface.co/Infinity-io/Wan2.2-I2V-A14B-Diffusers
- Repositorio oficial Diffusers: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Repositorio oficial (pesos): https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- ModelScope oficial: https://modelscope.cn/models/Wan-AI/Wan2.2-I2V-A14B
- GitHub: https://github.com/Wan-Video/Wan2.2
- Informe tecnico (arXiv): https://arxiv.org/abs/2503.20314
- Blog: https://wan.video/welcome
- Sitio web: https://wan.video
- Organizacion en Hugging Face: https://huggingface.co/Wan-AI/
- Documentacion ComfyUI: https://docs.comfy.org/tutorials/video/wan/wan2_2
- Discord: https://discord.gg/AKNgpMK4Yj
