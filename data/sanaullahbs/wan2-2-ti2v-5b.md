# Sanaullahbs/Wan2.2-TI2V-5B

## Resumen

Wan2.2-TI2V-5B es un modelo de generacion de video desarrollado por Wan-AI y publicado en Hugging Face. Se trata de la variante Text-Image-to-Video (TI2V) de 5000 millones de parametros de la familia Wan2.2, que permite generar video a partir de texto o de una imagen de entrada. El modelo produce clips a resolucion 720P y 24 FPS, y esta optimizado para ejecutarse en GPU de consumo como la RTX 4090.

La familia Wan2.2 introduce novedades como una arquitectura MoE en sus variantes mas grandes (A14B) y un VAE de alta compresion (16x16x4) en esta variante de 5B. El modelo se publica bajo licencia Apache 2.0 y su objetivo es acercar la generacion de video de alta calidad a entornos industriales y academicos sin necesidad de grandes clusters.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de video con VAE de alta compresion (16x16x4). Las variantes A14B usan MoE; no se documenta MoE en esta variante 5B. |
| Parametros totales | 5000 millones (5B) |
| Parametros activos | No aplica (no se describe como MoE en esta variante) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 34.2 GB |

## Arquitectura y entrenamiento

Wan2.2-TI2V-5B es un modelo de difusion de video que acepta tanto texto como imagenes como entrada. Su componente clave es el nuevo VAE del proyecto Wan2.2, que alcanza una tasa de compresion de 16x16x4 y permite generar video a 720P con 24 FPS en una sola GPU de consumo. La familia Wan2.2 incorpora una arquitectura Mixture-of-Experts para separar el proceso de denoising en distintos timesteps con expertos especializados; esto se aplica a las variantes A14B, mientras que la variante 5B se presenta como un modelo hibrido TI2V sin indicaciones explicitas de ser MoE.

En cuanto a los datos de entrenamiento, la model card indica que Wan2.2 se entrenó con un 65.6% mas de imagenes y un 83.2% mas de videos que Wan2.1. No se mencionan tecnicas de alineacion como RLHF o DPO. El resultado es una mejora en la generalizacion de movimientos, semantica y estetica, ademas de un control mas preciso sobre estilo cinematografico gracias a etiquetado detallado de iluminacion, composicion, contraste y tono de color.

## Capacidades

- Generacion de video a partir de texto (T2V) e imagen (I2V) mediante el flujo hibrido TI2V.
- Salida de video a 720P de resolucion con 24 FPS.
- Compresion de latentes con VAE 16x16x4, lo que reduce el coste computacional.
- Estetica de nivel cinematografico con control sobre iluminacion, composicion y tono.
- Movimientos mas complejos y generalizacion mejorada frente a Wan2.1.
- Ejecucion en GPU de consumo (se cita la RTX 4090 como ejemplo).
- Integracion con Diffusers y ComfyUI para inferencia.
- Soporte de inferencia multi-GPU para las variantes mas grandes (A14B y 14B).

No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-step ni capacidades de audio.

## Casos de uso

- Creacion de contenido para redes sociales: se pueden generar clips de 720P a 24 FPS a partir de prompts de texto sencillos o imagenes, lo que permite producir videos cortos de forma automatizada para plataformas como Instagram o TikTok.
- Prototipado en produccion cinematografica: el modelo ofrece un control fino sobre iluminacion y composicion, por lo que sirve para previsualizar planos, tonos de color y estilos visuales antes de un rodaje real.
- Publicidad y marketing: una agencia puede generar videos cortos de producto a partir de imagenes o descripciones, reduciendo la necesidad de sesiones de rodaje costosas.
- Animacion de fotografias e imagenes estaticas: mediante el flujo I2V, se pueden convertir fotos en clips animados, por ejemplo para e-commerce, museos o exposiciones.
- Investigacion en modelos de difusion: el VAE de alta compresion y la comparacion con las variantes MoE convierten a este modelo en un punto de referencia para trabajos sobre eficiencia en generacion de video.
- Pipelines de automatizacion con ComfyUI o Diffusers: se puede integrar en workflows de generacion por lotes y prototipado rapido en estudios pequenos.
- Iteracion en entornos con GPU limitadas: al ejecutarse en una RTX 4090, permite a investigadores y pequeños equipos experimentar con video 720P sin necesidad de clusters de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que Wan2.2 alcanza el mejor rendimiento entre modelos abiertos y cerrados, pero no incluye cifras concretas para MMLU, HumanEval, GSM8K u otros benchmarks comparables. Tampoco se ofrecen metricas de calidad de video como FVD, CLIP score ni similares.

## Requisitos de hardware

- VRAM estimada: no se publica una cifra exacta. El fabricante indica que el modelo puede ejecutarse en una RTX 4090 (24 GB de VRAM), lo que sugiere un consumo en el entorno de 16-24 GB para generacion a 720P en FP16 sin cuantizacion.
- GPU recomendadas: RTX 4090, o cualquier GPU equivalente con al menos 24 GB de VRAM. Para las variantes A14B se requiere configuracion multi-GPU, pero no para esta variante 5B.
- Compatibilidad con GPU de consumo: si, el modelo cabe en una RTX 4090 segun el fabricante.
- Opciones de despliegue: Diffusers, ComfyUI, codigo oficial de inferencia de Wan2.2 en GitHub y ModelScope.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de tarea | Resolucion soportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-TI2V-5B | 5B | Texto a video + Imagen a video | 720P @ 24 FPS | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.2-T2V-A14B | A14B (MoE) | Texto a video | 480P y 720P | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.2-I2V-A14B | A14B (MoE) | Imagen a video | 480P y 720P | Apache 2.0 | Hugging Face, ModelScope |

Las variantes A14B son modelos MoE mas grandes y con mayor capacidad, orientados a maxima calidad sin restricciones de VRAM. La variante TI2V-5B se diferencia por ser hibrida T2V+I2V y por estar pensada para GPU de consumo.

## Limitaciones y advertencias

- Los idiomas declarados en la model card son ingles y chino; no se garantiza buen rendimiento en espanol ni en otros idiomas.
- El riesgo de alucinacion visual (textos deformados, anatomias incorrectas, artefactos en movimientos rapidos) es inherente a los modelos generativos de video.
- No se publican benchmarks ni metricas objetivas, por lo que no es posible validar de forma independiente las afirmaciones de "TOP performance".
- La licencia Apache 2.0 permite uso comercial, pero hay que respetar los avisos de atribucion y las condiciones de la licencia.
- El repositorio Sanaullahbs/Wan2.2-TI2V-5B tiene 0 descargas y 0 likes. Puede ser un espejo no verificado; se recomienda usar el repositorio oficial Wan-AI/Wan2.2-TI2V-5B para produccion.
- No se documentan sesgos especificos del modelo, aunque al estar entrenado con datos de internet puede heredar sesgos presentes en esos datos.
- No se ofrecen cuantizaciones oficiales, por lo que el despliegue en VRAM limitada puede requerir adaptaciones externas.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/Sanaullahbs/Wan2.2-TI2V-5B
- Hugging Face (oficial): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Hugging Face (Diffusers): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- GitHub: https://github.com/Wan-Video/Wan2.2
- Paper (arXiv): https://arxiv.org/abs/2503.20314
- Blog: https://wan.video/welcome
- ModelScope: https://modelscope.cn/models/Wan-AI/Wan2.2-TI2V-5B
