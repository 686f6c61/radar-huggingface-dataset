# Rin247/Qwen3-VL-4B-Uncensored-Aquarion-INT4

## Resumen

Este modelo es una cuantización INT4 *weight-only* del modelo multimodal Qwen3-VL-4B, publicada por el usuario Rin247 bajo el sello *Aquarion Forge*. La particularidad principal es que ha sido sometido a un proceso de *abliteration* (eliminación de la dirección de rechazo) mediante proyección ortogonal antes de la cuantización, con el objetivo de eliminar los guardarraíles de seguridad del modelo original. El resultado es un modelo de visión-lenguaje de 2.415.636.992 parámetros (4B nominales) que conserva las capacidades multimodales del Qwen3-VL-4B pero sin las restricciones de contenido que incorpora el modelo base.

La relevancia de este modelo reside en su doble naturaleza: por un lado, ofrece una versión cuantizada a INT4 que reduce los requisitos de memoria para inferencia en hardware consumer; por otro, presenta una variante *uncensored* que interesa a desarrolladores que trabajan en entornos donde los guardarraíles del modelo base interfieren con casos de uso legítimos (ficción adulta, investigación de sesgos, generación creativa sin restricciones). Es importante señalar que el repositorio no incluye licencia explícita, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal, vision-language) |
| Parametros totales | 2.415.636.992 (4B nominales) |
| Parametros activos | no disponible (no se especifica si es MoE; el base Qwen3-VL-4B es denso) |
| Longitud de contexto | no disponible (el base Qwen3-VL-4B soporta 32.768 tokens, pero no se confirma en esta version) |
| Tipos de cuantizacion | INT4 weight-only (RTN, escalas almacenadas junto a los pesos) |
| Idiomas soportados | no disponibles (el base Qwen3-VL-4B soporta multilenguaje, pero no se especifica aqui) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con buffers de escala y forma: `*.weight_scale`, `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B, un transformer multimodal denso de la familia Qwen3-VL que combina un codificador de vision con un decodificador de lenguaje. La version publicada aqui no ha sido entrenada desde cero, sino que ha pasado por dos procesos: primero, un *abliteration* mediante proyeccion ortogonal de la direccion de rechazo (metodo que elimina la activacion que el modelo asocia con negarse a responder), y segundo, una cuantizacion INT4 *weight-only* realizada con PyTorch RTN en CPU, donde las escalas se almacenan junto a los pesos en buffers separados.

No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens vistos, ni si se aplicaron tecnicas como RLHF o DPO. El proceso de cuantizacion es posterior al abliteration, lo que implica que la perdida de precision afecta tanto a las capacidades originales como a las modificaciones introducidas. La cuantizacion es *weight-only* (solo pesos), no activaciones, y requiere un paso de de-cuantizacion manual antes de alimentar un motor de inferencia, segun indica el autor.

## Capacidades

- Generacion de texto y comprension multimodal: al derivar de Qwen3-VL-4B, conserva capacidades de vision-lenguaje (descripcion de imagenes, respuesta a preguntas visuales, OCR, etc.), aunque la cuantizacion INT4 puede degradar ligeramente la precision.
- Razonamiento y comprension de contexto largo: el modelo base soporta hasta 32.768 tokens de contexto, pero no se confirma si esta version mantiene esa longitud tras la cuantizacion.
- Capacidad *uncensored*: el abliteration elimina la direccion de rechazo, por lo que el modelo responde a peticiones que el base bloquearia (contenido adulto, violencia, instrucciones peligrosas, etc.). El autor no publica metricas de HarmBench para esta version concreta.
- Tool calling y agentes: no se especifica en la documentacion, aunque el base Qwen3-VL-4B-Instruct soporta function calling; no se confirma si la cuantizacion preserva esta funcionalidad.
- Multilingue: no se indica que idiomas conserva tras la cuantizacion.

## Casos de uso

- Generacion de ficcion adulta y creativa sin restricciones: el modelo puede producir narrativa explicita o temas tabu que el base bloquearia, util para escritores que necesitan explorar contenido maduro sin filtros.
- Investigacion academica sobre sesgos y guardarrailes: permite estudiar como se comporta un modelo sin direccion de rechazo, comparando respuestas con el base para analizar que tipos de contenido activan los mecanismos de seguridad.
- Desarrollo de personajes de rol (roleplay) en entornos locales: al ser INT4, cabe en GPUs consumer y puede ejecutarse en local para aplicaciones de chat sin censura.
- Generacion de prompts para modelos de imagen: el base Qwen3-VL-4B se usa como text encoder en pipelines de difusion (Z-Image, FLUX Klein4B); esta version uncensored permite generar prompts descriptivos sin restricciones de contenido.
- Pruebas de robustez en sistemas de moderacion: las empresas que desarrollan filtros de contenido pueden usar este modelo como caso adversarial para evaluar la eficacia de sus sistemas de deteccion.
- Prototipado rapido de aplicaciones multimodales en hardware limitado: la cuantizacion INT4 reduce la huella de memoria, permitiendo desplegar un modelo de vision-lenguaje en equipos con 4-6 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni evaluaciones de vision-lenguaje para esta version cuantizada. Tampoco se indican resultados de HarmBench ni de regresion respecto al modelo base. La unica referencia indirecta es que el abliteration del base Qwen3-VL-4B (version de huihui-ai) logra un 100% de Attack Success Rate en HarmBench frente al 30.8% del base, pero ese dato corresponde a otra publicacion, no a este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.415.636.992 parametros en INT4, el peso del modelo ronda los 1.2 GB (2.4B x 0.5 bytes por parametro), mas overhead de escalas y activaciones. Se estima un consumo de 3-5 GB de VRAM en inferencia con contexto corto.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 2060, RTX 3060, RTX 4060, etc.). En GPUs de 8 GB (RTX 3070, RTX 4070) se puede operar con comodidad. No requiere GPU de datacenter.
- Compatibilidad con consumer GPU: si, es el objetivo principal de la cuantizacion INT4.
- Opciones de despliegue: el formato safetensors con buffers de escala personalizados requiere un paso de de-cuantizacion manual antes de usar motores estandar. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI. El autor indica que hay que "dequantize with the matching scale/shape buffers before feeding to an inference engine", lo que sugiere que no es directamente cargable en los motores habituales sin adaptacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct (base) | 4B | 32.768 | Apache 2.0 | safetensors, BF16 | Modelo original con guardarrailes |
| Huihui-Qwen3-VL-4B-Instruct-abliterated | 4B | 32.768 | Apache 2.0 (derivado) | safetensors, BF16 | Abliterated sin cuantizar, 100% HarmBench ASR |
| Rin247/Qwen3-VL-4B-Uncensored-Aquarion-INT4 | 2.4B (INT4) | no disponible | no disponible | safetensors INT4 | Abliterated + cuantizado, sin benchmarks publicados |

La comparativa muestra que este modelo es el unico de los tres que combina abliteration con cuantizacion INT4, lo que lo hace mas ligero pero tambien mas opaco en cuanto a rendimiento y licencia. El base y la version de huihui-ai mantienen la licencia Apache 2.0, mientras que este repositorio no declara licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una version abliterated, el modelo puede generar contenido ofensivo, violento, sexual o peligroso sin filtro. Esto es intencional, pero implica un riesgo legal y etico significativo si se usa en aplicaciones publicas.
- Riesgo de alucinacion: la cuantizacion INT4 puede aumentar la tasa de alucinaciones respecto al base BF16, especialmente en tareas de razonamiento y recuperacion de hechos. No hay datos cuantitativos que lo confirmen, pero es un riesgo conocido en cuantizaciones agresivas.
- Limitaciones de contexto: no se confirma si la ventana de 32.768 tokens del base se mantiene tras la cuantizacion. Es posible que el proceso RTN afecte a la atencion de largo alcance.
- Restricciones de licencia: no se declara licencia en el repositorio. Esto impide su uso comercial sin autorizacion explicita del autor, y crea incertidumbre legal sobre la distribucion de derivados.
- Compatibilidad de despliegue: el formato de pesos con buffers de escala personalizados no es compatible con los motores de inferencia estandar (vLLM, llama.cpp, Ollama). Requiere desarrollo de codigo propio para de-cuantizar y cargar el modelo, lo que limita su uso practico.
- Sin garantias de calidad: el autor no publica benchmarks ni evaluaciones de regresion. El rendimiento real en tareas de vision-lenguaje es desconocido.
- Fecha de creacion: el modelo fue creado en agosto de 2026, lo que sugiere que es reciente y no ha sido ampliamente probado por la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/Qwen3-VL-4B-Uncensored-Aquarion-INT4
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Version abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated
- Repositorio oficial Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Noticia sobre Qwen3-VL-4B Heretic (ComfyUI): https://comfyui-wiki.com/en/news/2026-07-16-qwen3-vl-4b-heretic-comfyui
