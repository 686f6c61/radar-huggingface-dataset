# pianobob/Qwen3.5-2B-Base-MED

## Resumen

pianobob/Qwen3.5-2B-Base-MED es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario pianobob. Se trata de un ajuste fino (SFT, supervisión supervisada) sobre una base identificada como Qwen3.5-2B, según el propio identificador del repositorio, y etiquetado con el tag de arquitectura qwen3_5 en el Hub. El modelo cuenta con 2.213.241.664 parámetros reales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos pequenos, aptos para inferencia en hardware de consumo.

El problema que aborda es el de adaptar un modelo base multimodal de aproximadamente 2.000 millones de parámetros a un dominio concreto (el sufijo "MED" sugiere ámbito médico, aunque el autor no lo confirma en la model card). Al ser un ajuste SFT, su interes principal esta en servir como punto de partida para tareas especializadas con requisitos de computo reducidos, manteniendo la capacidad de procesar imagen y texto de la base Qwen3.5.

La relevancia es limitada por el momento: el repositorio no incluye model card sustantiva (es la plantilla autogenerada de transformers sin rellenar), no declara licencia ni idiomas, y no registra descargas ni likes. Cualquier evaluacion de su calidad debe hacerse por prueba directa, no por documentacion del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag qwen3_5); detalles no disponibles |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modalidad | image-text-to-text |
| Metodo de ajuste | SFT (supervised fine-tuning) via TRL |
| Tamano del repositorio | 4,4 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. El tag qwen3_5 indica que deriva de la familia Qwen3.5, y el pipeline image-text-to-text confirma que acepta imagenes y texto como entrada y genera texto. Con 2.213 millones de parametros y un repositorio de 4,4 GB, los pesos parecen almacenados en precision bf16/fp16 (2 bytes por parametro darian aproximadamente 4,4 GB, coherente con el tamano del repo). No se especifica si emplea atencion lineal, decodificacion especulativa ni ninguna innovacion adicional.

El entrenamiento se realizo mediante SFT con la libreria TRL, segun los tags del repositorio. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, hiperparametros, hardware ni duracion. La model card es la plantilla autogenerada de transformers y todos los campos sustantivos aparecen como "[More Information Needed]". La unica referencia tecnica externa es la cita a Lacoste et al. (2019) sobre emisiones de carbono, que es parte de la plantilla y no aporta datos del modelo.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text): el pipeline declarado indica entrada multimodal y salida textual.
- Ajuste supervisado sobre una base Qwen3.5-2B, orientado presumiblemente a un dominio especializado (sufijo "MED"), aunque el autor no lo documenta.
- Conversacional: el tag "conversational" sugiere formato de dialogo, pero no se detalla el template de chat.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes sobre imagenes medicas: dado el sufijo "MED", puede emplearse para experimentar con descripcion o interpretacion inicial de imagenes clinicas en entornos de investigacion, siempre con validacion por profesionales y sin uso clinico directo.
- Clasificacion y etiquetado imagen-texto en dominios especializados: util como base para fine-tuning adicional en tareas de vision-lenguaje con recursos limitados, gracias a sus 2,2 mil millones de parametros.
- Despliegue en hardware de consumo: al caber en GPUs de gama alta para consumidores en bf16 (ver seccion de hardware), sirve para demos locales de modelos multimodales.
- Generacion de descripciones de imagenes en pipelines de accesibilidad: el modelo puede producir texto a partir de imagenes, integrable en flujos automatizados de alt-text.
- Investigacion en ajuste SFT: sirve como ejemplo reproducible de un fine-tuning multimodal con TRL para estudiar tecnicas de adaptacion de dominio.
- Evaluacion comparativa de bases Qwen3.5-2B: util para medir el efecto del ajuste SFT frente a la base original en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,5-5 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica, entre 6 y 8 GB para contexto corto.
- Cuantizacion a 8 bits: alrededor de 2,5-3 GB de pesos; a 4 bits: alrededor de 1,5-2 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 y superiores); A100/H100 no son necesarias por el tamano del modelo.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM en bf16; en 4 bits cabria en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados por el autor ni se ofrecen pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pianobob/Qwen3.5-2B-Base-MED | 2,21 B | no disponible | no disponible | safetensors | Ajuste SFT multimodal, sin documentacion |
| Qwen2-VL-2B (referencia de la familia Qwen multimodal) | ~2 B | 32.768 tokens (segun documentacion publica de Qwen2-VL) | Apache 2.0 (Qwen2-VL) | safetensors, GGUF | Modelo oficial con model card completa |
| Qwen2.5-VL-3B | ~3 B | 32.768 tokens (segun documentacion publica) | Apache 2.0 | safetensors | Alternativa oficial de mayor tamano |

La comparacion con Qwen2-VL-2B y Qwen2.5-VL-3B se ofrece como referencia de categoria (modelos multimodales pequenos), no como equivalencia directa, ya que no se dispone de datos de rendimiento del modelo evaluado. No se conocen resultados de benchmarks del modelo pianobob que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Model card practicamente vacia: todos los campos sustantivos aparecen como "[More Information Needed]", lo que impide conocer el dataset, el proceso de entrenamiento y la evaluacion.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Contexto no documentado: no se puede planificar el uso con ventanas largas sin medirlo empiricamente.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano, especialmente en dominios especializados como el medico, donde el sufijo "MED" sugiere un uso de alto riesgo.
- Posible sesgo de dominio: si el ajuste SFT se realizo sobre un corpus medico, el modelo puede degradarse en tareas generales; no hay datos para confirmarlo.
- Sin cuantizaciones oficiales: no se ofrecen pesos GGUF ni AWQ/GPTQ, lo que limita el despliegue en entornos de bajos recursos.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en la comunidad.
- Advertencia medica: cualquier aplicacion en salud requiere validacion por profesionales y cumplimiento normativo; el modelo no sustituye el juicio clinico.

## Enlaces

- Hugging Face: https://huggingface.co/pianobob/Qwen3.5-2B-Base-MED
- Paper citado en la model card (Lacoste et al., 2019, sobre emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Repositorio TRL: https://github.com/huggingface/trl
- Documentacion de transformers: https://huggingface.co/docs/transformers
