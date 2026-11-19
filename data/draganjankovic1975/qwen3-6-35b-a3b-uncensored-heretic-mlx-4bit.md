# draganjankovic1975/Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-4bit

## Resumen

Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-4bit es una cuantizacion en 4 bits para MLX de un derivado "abliterated" del modelo Qwen3.6-35B-A3B de Alibaba Cloud. Lo publica el usuario draganjankovic1975 como espejo del repositorio original de froggeric, que a su vez parte del trabajo de desensurado de llmfan46 sobre el modelo base Qwen. El modelo conserva la arquitectura MoE de Qwen3.6 (35.107.181.936 parametros totales, con 3B activos por token segun el sufijo A3B) y anade capacidades multimodales de texto, imagen y video, ademas de modo de razonamiento (thinking) y tool calling.

La relevancia de esta variante esta en tres frentes. Primero, aplica el desensurado con Heretic v1.2.0 y una variante del metodo MPOA (Magnitude-Preserving Orthogonal Ablation) tratando de forma separada los bloques de atencion lineal (estilo DeltaNet) y los de softmax tradicional, que Qwen3.6 mezcla en proporcion 3:1; el autor reporta una divergencia KL de 0.0015 y un 88% menos de rechazos. Segundo, sustituye la plantilla de chat oficial por una reescrita que corrige cinco fallos (filtros `|items` y `|safe`, rol `developer`, bloques de thinking vacios y el tag de cierre `</thinking>`) y que funciona en runtimes C++ como LM Studio, llama.cpp o vLLM. Tercero, corrige 333 claves del vision tower con prefijos erroneos, de modo que las entradas de imagen y video funcionan.

El resultado es un modelo multimodal de gran tamano pensado para ejecucion nativa en Apple Silicon mediante MLX, con licencia Apache-2.0 y pesos en safetensors cuantizados a 4 bits (repo de 20,4 GB). No es un modelo para servidores GPU convencionales: su formato esta atado al ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrida con atencion lineal (DeltaNet-style) y softmax en proporcion 3:1, con vision tower |
| Parametros totales | 35.107.181.936 |
| Parametros activos | 3B (segun el sufijo A3B del nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); existen variantes 6-bit y 8-bit del autor original |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 4-bit) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.6-35B-A3B: un transformer de mezcla de expertos (MoE) con 35.107.181.936 parametros totales y aproximadamente 3B activos por token. La innovacion estructural de Qwen3.6 es un diseno de atencion hibrido que combina bloques de atencion lineal de estilo DeltaNet con bloques de softmax tradicional en una proporcion 3:1. Incorpora ademas un vision tower que habilita entradas de imagen y video, y un modo de razonamiento explicito (thinking).

Sobre el modelo base se aplico un proceso de desensurado con Heretic v1.2.0 y una variante del metodo MPOA (Magnitude-Preserving Orthogonal Ablation), que identifica la "direccion de rechazo" en el residual stream comparando activaciones ante prompts inocuos y daninos, y ortogonaliza las matrices de pesos contra esa direccion. La diferencia clave frente a otras abliteraciones de Qwen3.6 es que llmfan46 aplico parametros separados para cada tipo de atencion (lineal y softmax), en lugar de tratarlas de forma identica. El autor reporta una divergencia KL de 0.0015 y una reduccion del 88% en rechazos con perdida de capacidad negligible. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

La conversion a MLX 4-bit incluye dos correcciones adicionales: una plantilla de chat reescrita que arregla cinco fallos de la oficial (filtros `|items` y `|safe` incompatibles con Jinja en C++, rol `developer` no soportado, bloques de thinking vacios que consumen contexto y el tag de cierre `</thinking>` que el modelo a veces genera mal) y la correccion de 333 claves del vision tower con prefijos erroneos que rompian las entradas de imagen.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo thinking activable y desactivable mediante los tags `<|think_on|>` y `<|think_off|>`.
- Tool calling y function calling, con plantilla de chat compatible con runtimes C++ (LM Studio, llama.cpp con `--jinja`, vLLM, MLX, oMLX).
- Capacidades multimodales: entrada de imagen y video ademas de texto (pipeline image-text-to-text).
- Capacidades multilingues, con soporte declarado de ingles, chino y otros idiomas.
- Modo sin censura: se elimina el comportamiento de rechazo mediante abliteracion, manteniendo segun el autor la capacidad general.
- Vision funcional tras la correccion de las claves del vision tower.

## Casos de uso

- Asistente local en Apple Silicon: el modelo se ejecuta de forma nativa con MLX en Macs con memoria unificada suficiente, sin depender de servicios en la nube ni de GPUs dedicadas.
- Analisis de imagenes y video en local: gracias al vision tower corregido, se pueden procesar capturas, documentos escaneados o fotogramas de video con `mlx_vlm` en flujos de trabajo que requieran privacidad de datos.
- Investigacion sobre alineacion y seguridad: el modelo sirve como objeto de estudio para analizar el efecto de la abliteracion (metodo MPOA, divergencia KL de 0.0015) sobre el comportamiento de rechazo y la calidad del modelo.
- Generacion de codigo con tool calling: la plantilla reescrita permite integrar el modelo en pipelines que envian el rol `developer` y esperan llamadas a funciones bien formadas, algo que la plantilla oficial rompia.
- Razonamiento profundo bajo demanda: con `<|think_on|>` se activa la cadena de razonamiento para tareas complejas, y con `<|think_off|>` se obtienen respuestas rapidas sin gasto de contexto en tareas simples.
- Desarrollo de agentes multi-paso en local: la combinacion de tool calling, contexto conversacional y modo thinking permite construir agentes que planifican y ejecutan acciones sobre herramientas locales.
- Prototipado de aplicaciones multimodales en LM Studio: el modelo esta publicado en LM Studio y funciona con la plantilla corregida, lo que facilita pruebas sin escribir codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo aportado por el autor es la divergencia KL de 0.0015 del proceso de abliteracion y la reduccion del 88% en rechazos, que no son metricas de rendimiento en tareas estandar.

## Requisitos de hardware

- VRAM/memoria: el repo pesa 20,4 GB en 4-bit; en Apple Silicon se necesita memoria unificada suficiente para cargar los pesos mas el contexto y el vision tower (orientativamente 24 GB o mas, aunque no se especifica un minimo oficial).
- GPU: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4 y posteriores con memoria unificada). No es compatible de forma nativa con GPUs NVIDIA o AMD.
- GPU de consumo: no aplica en el sentido habitual; el equivalente es un Mac con memoria unificada. Existen variantes 6-bit y 8-bit del autor original que requieren mas memoria.
- Despliegue: `mlx-lm >= 0.31.2` y `mlx-vlm >= 0.4.4`; tambien LM Studio (modelo publicado) y cualquier motor que soporte plantillas Jinja de HuggingFace, como llama.cpp con `--jinja`, vLLM u oMLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-4bit | 35,1B totales / 3B activos | no disponible | Apache-2.0 | MLX safetensors 4-bit | Objeto de esta ficha; abliterado, vision, thinking |
| Qwen3.6-35B-A3B (oficial) | 35,1B totales / 3B activos | no disponible | Apache-2.0 | safetensors | Modelo base con censura y plantilla de chat con fallos conocidos |
| froggeric/Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-8bit | 35,1B totales / 3B activos | no disponible | Apache-2.0 | MLX safetensors 8-bit | Misma variante en 8 bits; mas memoria, mayor fidelidad |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic | 35,1B totales / 3B activos | no disponible | Apache-2.0 | safetensors | Modelo fuente del desensurado, sin cuantizar para MLX |

## Limitaciones y advertencias

- El modelo esta deliberadamente desensurado: puede generar contenido que los modelos alineados rechazarian. No es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- La abliteracion puede degradar sutilmente capacidades; el autor afirma que la perdida es negligible (KL 0.0015), pero no hay benchmarks independientes que lo verifiquen.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- La longitud de contexto no esta documentada en esta ficha; conviene verificar la del modelo base antes de disenar aplicaciones con ventanas largas.
- El formato MLX limita el despliegue a Apple Silicon; no se puede usar directamente en servidores con GPU NVIDIA.
- El modelo exige que la primera linea del system prompt sea exactamente "You are Qwen, created by Alibaba Cloud. You are a helpful assistant."; sin ella el rendimiento cae.
- La plantilla de chat es una reescritura no oficial; cambios en los runtimes o en el tokenizador podrian requerir ajustes.
- Aunque la licencia es Apache-2.0, el uso comercial de un modelo desensurado conlleva riesgos legales y reputacionales que deben evaluarse segun la jurisdiccion y el caso de uso.

## Enlaces

- Hugging Face: https://huggingface.co/draganjankovic1975/Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-4bit
- Repositorio original: https://huggingface.co/froggeric/Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-4bit
- Variante 8-bit: https://huggingface.co/froggeric/Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-8bit
- Variante 6-bit: https://huggingface.co/froggeric/Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-6bit
- Modelo en LM Studio: https://lmstudio.ai/froggeric/qwen3.6-35b-a3b-uncensored-heretic-mlx-4bit
- Modelo base del desensurado: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic
- Modelo oficial Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Heretic: https://github.com/p-e-w/heretic
- Blog sobre MPOA: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Paper de referencia (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
