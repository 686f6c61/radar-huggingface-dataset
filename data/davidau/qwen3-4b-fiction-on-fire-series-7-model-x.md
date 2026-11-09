# DavidAU/Qwen3-4B-Fiction-On-Fire-Series-7-Model-X

## Resumen
Qwen3-4B-Fiction-On-Fire-Series-7-Model-X es un modelo de generacion de texto en ingles (con soporte limitado de frances, chino y aleman) especializado en escritura creativa y narrativa de ficcion, publicado por el usuario DavidAU en Hugging Face. Se trata de un merge de alta precision construido con mergekit sobre Qwen3-4B, combinando cuatro modelos derivados: Cetus-Qwen3_4B-GeneralThought, Qwen3-4B-antislop-exp15, Josiefied-Qwen3-4B-abliterated-v2 y el propio Qwen3-4B original, mediante el metodo dare_ties en bfloat16.

El modelo parte de la arquitectura transformer densa de Qwen3-4B, con 4.022.468.096 parametros totales (aproximadamente 4 mil millones) y una longitud de contexto declarada de 40.000 tokens, ampliable mediante YaRN. La variante "X" se distingue del resto de la serie (modelos 1000 a 1007) en que el merge se realizo sin aplicar poda aleatoria (density), por lo que conserva la totalidad de los pesos del merge y no incorpora la alteracion de prosa que introduce el pruning.

Su relevancia es acotada: se dirige a un nicho concreto de escritura de ficcion, roleplay y generacion de tramas, con un sesgo deliberado hacia la desinhibicion (parte de una base "abliterated") y con un rendimiento variable entre las distintas semillas de la serie. No es un modelo de proposito general ni compite en benchmarks estandar de razonamiento o codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.000 tokens (ampliable mediante YaRN) |
| Tipos de cuantizacion | bfloat16 en el repo; el autor menciona versiones GGUF para text-generation-webui con llama_HF, sin detallar niveles |
| Idiomas soportados | en, fr, zh, de |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento
El modelo es un merge de pesos, no un entrenamiento desde cero. Se construye con mergekit mediante el metodo dare_ties sobre una base Josiefied-Qwen3-4B-abliterated-v2, combinando Cetus-Qwen3_4B-GeneralThought, Qwen3-4B-antislop-exp15 y el Qwen3-4B original. La formula de merge especifica pesos por capa diferenciados para cada modelo fuente (por ejemplo, Cetus domina las primeras capas con pesos [1,1,.75,.5,.25,.25,.05,.01], mientras que Josiefied domina las ultimas con [0,0,0,.15,.35,.5,.65,.95]), con density 1 en todos los casos, lo que en esta variante "X" implica ausencia de poda aleatoria.

El autor indica que la reproducibilidad requiere fijar el random seed de mergekit al numero de modelo de la serie; en el caso de la variante X, el merge se realizo sin density/pruning. No se documentan datos de entrenamiento adicionales, numero de tokens, composicion del dataset ni etapas de RLHF o DPO, ya que el proceso es exclusivamente de fusion de pesos sobre modelos preexistentes. La innovacion tecnica declarada es la alteracion controlada de prosa y creatividad mediante merge y, en el resto de la serie, mediante pruning aleatorio; en esta variante X ese efecto de pruning no esta presente.

## Capacidades
- Generacion de texto narrativo y prosa vivida orientada a ficcion, con etiquetas declaradas para todos los generos (ciencia ficcion, romance, terror, etc.).
- Generacion de tramas y subtramas, continuacion de escenas y construccion de historias.
- Roleplay y conversacion multi-turno, con soporte de plantilla ChatML o Jinja embebida.
- Razonamiento con modo "thinking" activable mediante etiquetas `<think>` y system prompt, heredado de Qwen3.
- Capacidades multilingues limitadas a en, fr, zh y de segun la model card.
- Reduccion de rechazos (decensoring) por su base abliterated, aunque el autor advierte que no es del 100 % y varia entre modelos de la serie.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso
- Escritura de ficcion por capitulos: el modelo puede continuar escenas y mantener coherencia narrativa con un contexto de hasta 40.000 tokens, adecuado para manuscritos largos y arcos argumentales extensos.
- Generacion de tramas y subtramas para guionistas o novelistas: sirve como generador de ideas y estructuras narrativas en cualquier genero declarado, con ajuste de temperatura entre 0,4 y 2,5 para variar el registro.
- Roleplay y narrativa interactiva: integrable en Silly Tavern, KoboldCpp o text-generation-webui, con parametros de smoothing recomendados (1,5 a 2,5) para conversaciones multi-turno.
- Prototipado de asistentes de escritura creativa: al ser un modelo de 4B en bfloat16, puede desplegarse en una unica GPU consumer para iterar rapidamente sobre prompts y estilos.
- Generacion de variantes de estilo: la serie permite comparar semillas y niveles de pruning para explorar cambios de prosa, aunque la variante X concreta no aplica pruning.
- Experimentacion con merges: la formula publicada y las instrucciones de mergekit permiten reproducir o derivar variantes cambiando el random seed, la densidad o el orden de los modelos.
- Bases para fine-tuning creativo: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para ajustes posteriores en dominios narrativos especificos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: en torno a 8 GB solo para pesos, mas overhead de cache KV; con contexto de 40.000 tokens el consumo adicional de KV puede ser significativo.
- Cuantizaciones de 8 bits o 4 bits reducen el requisito a aproximadamente 4-5 GB y 2,5-3 GB respectivamente, aunque el autor no detalla niveles concretos de GGUF.
- GPU recomendadas: cabe en GPUs consumer como RTX 3090, RTX 4090 o RTX 4070 Ti en bfloat16; en cuantizacion 4 bits podria ejecutarse en GPUs con 6-8 GB. Para despliegue profesional, A100 o H100 son sobredimensionadas para 4B pero validas para servir muchas instancias.
- Opciones de despliegue: llama.cpp, Ollama, KoboldCpp, text-generation-webui (con llama_HF para GGUF) y Silly Tavern como frontend. vLLM y TGI son compatibles con arquitectura Qwen3, aunque no se documentan explicitamente en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Fiction-On-Fire-Series-7-Model-X | 4,02 B | 40.000 (ampliable YaRN) | Ficcion y escritura creativa (merge) | Apache 2.0 | Hugging Face, 44 descargas |
| Qwen/Qwen3-4B | 4 B aprox. | 32.768 nativo, ampliable | Proposito general, razonamiento | Apache 2.0 | Hugging Face, ampliamente usado |
| Goekdeniz-Guelmez/Josiefied-Qwen3-4B-abliterated-v2 | 4 B aprox. | heredado de Qwen3-4B | Base desinhibida para roleplay | Apache 2.0 | Hugging Face |
| prithivMLmods/Cetus-Qwen3_4B-GeneralThought | 4 B aprox. | heredado de Qwen3-4B | Razonamiento general | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos de la cadena de merge, ya que no se dispone de datos de rendimiento que permitan contrastar con alternativas de la misma categoria fuera de esta familia.

## Limitaciones y advertencias
- Al ser un merge con pruning y sin evaluacion publicada, el rendimiento es variable e impredecible entre semillas; el autor reconoce diferencias notables entre modelos de la serie.
- Riesgo de alucinacion elevado en tareas factuales: el modelo esta optimizado para ficcion, no para precision factual.
- La desinhibicion (base abliterated) puede producir contenido soez, sesgado o inapropiado; el autor incluye "swearing" entre las etiquetas y advierte que los rechazos no son consistentes.
- Cobertura multilingue limitada a en, fr, zh y de; no se garantiza calidad fuera de esos idiomas.
- El contexto de 40.000 tokens es una recomendacion del autor; ampliarlo con YaRN altera el comportamiento y puede degradar la coherencia.
- Aunque la licencia es Apache 2.0, el uso comercial debe evaluar los sesgos y la calidad del contenido generado, asi como las implicaciones de la base abliterated.
- Solo 44 descargas y 5 likes en el momento de la ficha: comunidad muy reducida, sin validacion externa significativa.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines de automatizacion que las requieran.

## Enlaces
- Hugging Face: https://huggingface.co/DavidAU/Qwen3-4B-Fiction-On-Fire-Series-7-Model-X
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Modelo base Josiefied-Qwen3-4B-abliterated-v2: https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen3-4B-abliterated-v2
- Modelo base Cetus-Qwen3_4B-GeneralThought: https://huggingface.co/prithivMLmods/Cetus-Qwen3_4B-GeneralThought
- Modelo base Qwen3-4B-antislop-exp15: https://huggingface.co/sam-paech/Qwen3-4B-antislop-exp15
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- Coleccion del autor: https://huggingface.co/DavidAU/collections
- Pagina de soporte del autor: https://huggingface.co/DavidAU/support
