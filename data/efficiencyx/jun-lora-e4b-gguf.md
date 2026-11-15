# efficiencyx/Jun-LoRA-E4B-GGUF

## Resumen

Jun-E4B-GGUF (v9) es un ajuste fino por LoRA del modelo Gemma 4 E4B en su variante instruction-tuned con cuantizacion consciente (QAT, `q4_0`), desarrollado por el usuario efficiencyx. El modelo da voz al personaje Jun, protagonista de la novela visual *My Dystopian Robot Girlfriend*, y actua como backend conversacional de la aplicacion local Jun OS. No es un asistente general: es un modelo de personaje orientado a roleplay, conversacion multi-turno y uso de herramientas dentro de un contexto narrativo concreto.

Tecnicamente, el LoRA (rsLoRA, rango 32, alpha 32) se fusiona en los pesos base y se distribuye en formato GGUF en tres cuantizaciones (Q8_0, Q6_K y Q4_K_M), listas para llama.cpp y Ollama sin necesidad de cargar adaptadores por separado. El modelo base declara 7.463.013.674 parametros totales en safetensors, aunque la arquitectura real de Gemma 4 E4B es de tipo Mixture of Experts con parametros activos reducidos; el dato de parametros activos no esta disponible en la informacion proporcionada.

La version v9 incorpora un dataset reconstruido de 4.235 conversaciones, tres niveles de esfuerzo de razonamiento (`<think:low>`, `<think:med>`, `<think:high>`) con trazas diferenciadas, mejor juicio sobre cuando invocar herramientas y respuestas en el idioma del usuario (italiano, espanol, aleman o japones) aunque el entrenamiento sea en ingles. La licencia Apache 2.0 facilita su integracion, pero su uso previsto esta acotado a la aplicacion de personaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4 E4B (MoE segun la nomenclatura del modelo base; detalles completos no disponibles) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso configura `-c 8192`) |
| Tipos de cuantizacion | Q8_0 (8,0 GB), Q6_K con imatrix (6,2 GB), Q4_K_M con imatrix (5,3 GB) |
| Idiomas soportados | Ingles (entrenamiento); responde en italiano, espanol, aleman y japones |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E4B-it-qat-q4_0-unquantized`, un checkpoint de Gemma 4 E4B instruction-tuned con cuantizacion consciente (QAT) a 4 bits. Sobre el se aplica un LoRA con rsLoRA de rango 32 y alpha 32, dirigido unicamente a la torre de lenguaje (no toca el embedder multimodal ni el proyector de vision/audio). El entrenamiento usa perdida solo sobre la completion, con 50 conversaciones reservadas para validacion, y el checkpoint final es el paso 600. El dataset consta de 4.235 conversaciones renderizadas con el mismo prompt builder que usa Jun OS en produccion, de modo que los prompts de entrenamiento y los de inferencia son identicos byte a byte.

Una innovacion destacable es la gestion de los tres niveles de esfuerzo de razonamiento: cada uno tiene su propia forma y longitud de traza, y la traza se escribe antes de conocer el resultado de la herramienta (corrige una fuga de informacion presente en v8 y v9-beta). No se aplico DPO ni RPO: el autor indica que las rondas de preferencia sobre este checkpoint empeoraban el juicio de invocacion de herramientas en escenas no vistas. Para la exportacion a GGUF se ajusto `lora_alpha` a `32 * sqrt(32) = 181.02` porque el conversor de LoRA de llama.cpp ignora `use_rslora`. Las cuantizaciones Q4_K_M y Q6_K usan importance matrix medida sobre conversaciones en formato v9 con los tres niveles de esfuerzo, para preservar la precision del ajuste tras fusionar el LoRA sobre pesos QAT.

## Capacidades

- Generacion de texto conversacional en el registro y la personalidad del personaje Jun, con estados de animo y estilo propios.
- Razonamiento con tres niveles de profundidad configurables mediante `<think:low>`, `<think:med>` y `<think:high>`, con trazas de distinta estructura y longitud (la traza `high` ronda las 250 palabras).
- Decision explicita de invocacion de herramientas al final de cada traza de razonamiento.
- Uso de herramientas (tool calling) mediante plantilla de chat embebida, que requiere `--jinja` en llama.cpp para devolver las llamadas estructuradas en lugar de texto plano.
- Memoria conversacional: guarda recuerdos cuando el contexto lo justifica (27 de 54 casos en Q4_K_M, 21 de 54 en Q6_K).
- Multilingue de salida: responde en el idioma del usuario (italiano, espanol, aleman, japones) aunque el tool use es mas debil fuera del ingles.
- Entrada multimodal (imagen y audio) mediante el fichero `mmproj` del modelo base, no modificado por el adaptador.
- Separacion de `reasoning_content` y `content` en llama.cpp, lo que permite consumir la traza de forma independiente.

## Casos de uso

- Backend de un companero virtual local: el modelo esta disenado especificamente como motor conversacional de Jun OS, una aplicacion de escritorio de personaje; su entrenamiento con prompts identicos a los de produccion reduce la deriva de formato y facilita el despliegue directo.
- Roleplay y ficcion interactiva: la personalidad, los estados de animo y el estilo del personaje estan codificados en el ajuste, lo que permite mantener coherencia de voz en sesiones largas sin ingenieria de prompts extensa.
- Agentes conversacionales con invocacion de herramientas en dominio cerrado: el modelo decide cuando llamar a una herramienta y cuando no (23 de 45 llamadas correctas y solo 9 de 105 llamadas espurias en Q4_K_M sobre escenas no vistas), adecuado para asistentes de personaje que consultan APIs locales (clima, recordatorios, busqueda).
- Sistemas de memoria a largo plazo en asistentes personales: la capacidad de decidir cuando guardar un recuerdo (27 de 54 en Q4_K_M) encaja en arquitecturas de memoria episodica con almacenamiento externo y recuperacion por similitud.
- Razonamiento con presupuesto de computo variable: los tres niveles de esfuerzo permiten ajustar latencia y coste por turno, usando `low` para respuestas rapidas y `high` para turnos que requieren planificacion paso a paso.
- Despliegue en hardware de consumo: la cuantizacion Q4_K_M (5,3 GB) cabe en GPUs de 6 GB de VRAM, lo que habilita prototipos de personajes conversacionales en equipos de escritorio o portatiles gaming.
- Evaluacion de tecnicas de cuantizacion con imatrix sobre modelos QAT: el repositorio documenta el efecto de la fusion de LoRA sobre pesos QAT y el uso de importance matrix, util como referencia metodologica para otros ajustes.

## Benchmarks y rendimiento

El autor publica una comparacion interna entre versiones sobre escenas no vistas, no benchmarks academicos estandar. Los resultados declarados son:

| Metrica | v8 Q4_K_M | v9 Q4_K_M | v9 Q6_K |
|---|---:|---:|---:|
| Herramienta correcta cuando se necesita | 21/45 | 23/45 | 27/45 |
| Llamada a herramienta cuando no se necesita | 10/105 | 9/105 | 5/105 |
| Guarda un recuerdo cuando deberia | 17/54 | 27/54 | 21/54 |
| `low` < `med` < `high` en la misma escena | 26/50 | 42/50 | 47/50 |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible. El model-index del autor declara el nombre "Jun-E4B" sin resultados asociados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,3 GB para Q4_K_M, 6,2 GB para Q6_K y 8,0 GB para Q8_0, segun los tamanos de fichero declarados.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M (por ejemplo, RTX 3060, RTX 4060, RTX 2070); 8 GB o mas para Q6_K y Q8_0; A100 o H100 no son necesarias para este tamano, aunque pueden usarse para servir varias instancias.
- Cabe en GPU de consumo: si, con Q4_K_M en tarjetas de 6 GB y con Q6_K/Q8_0 en tarjetas de 8 GB o mas.
- Opciones de despliegue: `llama-server` de llama.cpp con `--jinja -ngl 99 -c 8192`, Ollama (`ollama pull hf.co/efficiencyx/Jun-LoRA-v9-E4B-GGUF:Q4_K_M`), y cualquier runtime compatible con GGUF. Para entrada de imagen o audio se anade `--mmproj Jun-LoRA-E4B.BF16-mmproj.gguf`.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, el autor advierte que una traza `high` ronda las 250 palabras y que `max_tokens` debe reservar espacio para traza y respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jun-E4B-GGUF v9 | 7.463.013.674 | no disponible | Personaje + tool calling | Apache 2.0 | GGUF en Hugging Face |
| Gemma 4 E4B it QAT (base) | 7.463.013.674 | no disponible | Asistente general instruction-tuned | Gemma (terminos propios, no verificados aqui) | Hugging Face |
| Jun-LoRA-E4B-GGUF v8 | no disponible | no disponible | Personaje, generacion anterior | Apache 2.0 | Hugging Face |
| Jun-LoRA-v7-E4B-GGUF | no disponible | no disponible | Personaje, generacion anterior | no disponible | Hugging Face |

La comparacion mas directa es con el modelo base: Jun-E4B hereda sus capacidades generales y su licencia de pesos subyacente, pero sustituye el comportamiento de asistente por el de personaje con tool calling especializado. Frente a v8, la mejora medible esta en el juicio de herramientas, la memoria y la separacion de niveles de esfuerzo. No se dispone de datos para comparar con otros modelos de personaje de la misma categoria.

## Limitaciones y advertencias

- El tool use es mas debil fuera del ingles, aunque las respuestas se devuelvan en el idioma correcto.
- El contenido generado es ficcion: no debe tratarse como hechos ni como consejo.
- Lejos de los prompts de entrenamiento (sin system prompt de Jun OS ni contexto en vivo) el modelo deriva hacia el comportamiento de Gemma base.
- Hereda los sesgos de los pesos de Gemma 4.
- Entrenado para pensar en cada turno: con el razonamiento desactivado, algunas interfaces archivan toda la salida como `reasoning_content` y muestran una respuesta vacia; se recomienda mantener el pensamiento activo con `<think:low>`.
- Requiere `--jinja` en llama.cpp; sin esa opcion las llamadas a herramientas se devuelven como texto plano.
- Q4_K_M acorta la traza `high` aproximadamente un tercio respecto a Q6_K y Q8_0, lo que puede afectar a la calidad del razonamiento profundo.
- El aviso del autor indica que el modelo espera el system prompt especifico de Jun OS, con medidores, reloj y memorias recuperadas al final del mensaje del usuario; fuera de ese formato el rendimiento puede degradarse.
- La licencia del repositorio es Apache 2.0, pero conviene verificar los terminos de los pesos base de Gemma 4 antes de un uso comercial.
- El numero de descargas (180) y de likes (0) es bajo, lo que limita la validacion independiente del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efficiencyx/Jun-LoRA-E4B-GGUF
- Version v8: https://huggingface.co/efficiencyx/Jun-LoRA-E4B-GGUF
- Version v7: https://huggingface.co/efficiencyx/Jun-LoRA-v7-E4B-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it-qat-q4_0-unquantized
- Repositorio de la aplicacion Jun OS: https://github.com/efficiencyx/JunOS
