# 4waiz/Rabt-1.0-2B

## Resumen

Rabt 1.0 2B es un modelo de lenguaje de 2.274 millones de parametros desarrollado por Eng. Awaiz Ahmed en Kanban Studios (Abu Dabi, Emiratos Arabes Unidos), obtenido mediante fine-tuning con QLoRA sobre Qwen/Qwen3.5-2B. Forma parte de la familia Rabt 1.0, junto con las variantes de 4B y 9B, y esta disenado especificamente para funcionar como asistente personal local-first: un agente que opera sobre el propio ordenador del usuario, propone acciones que requieren aprobacion humana y mantiene la privacidad de los datos sin enviar nada a la nube.

El modelo hereda la arquitectura hibrida de Qwen3.5, que combina capas de atencion lineal Gated DeltaNet (memoria recurrente que abarata los contextos largos) con capas de atencion completa con compuertas cada cuatro capas, e incluye un codificador de vision para entrada de imagenes. La model card declara una ventana de contexto de 256K tokens, lo que resulta notable para un modelo de este tamano.

Su relevancia actual radica en el enfoque: en lugar de ser un chatbot general que hay que adaptar, Rabt 1.0 se entrena para cuatro problemas concretos de los agentes locales: no declarar acciones como completadas cuando siguen pendientes de aprobacion, operar completamente offline, mantener identidad y reglas en cinco idiomas (ingles, arabe, frances, hindi y urdu) y tratar el texto de correos, ficheros y paginas web como datos, nunca como instrucciones. Se distribuye con licencia Apache 2.0 y pesos en safetensors y GGUF, pensado para Ollama y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: atencion lineal Gated DeltaNet + atencion completa con compuertas cada 4 capas; codificador de vision |
| Parametros totales | 2.274.069.824 (2,27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (segun model card) |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M, ~1,3 GB); QLoRA empleado en el fine-tuning |
| Idiomas soportados | Ingles, arabe, frances, hindi, urdu (mas capacidades multilingues heredadas del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |
| Modelo base | Qwen/Qwen3.5-2B |
| Metodo de ajuste | QLoRA (fine-tuning) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 5,9 GB |

## Arquitectura y entrenamiento

Rabt 1.0 2B conserva el diseno hibrido de Qwen3.5: la mayoria de capas usan Gated DeltaNet, una atencion lineal con memoria recurrente que mantiene bajo el coste computacional en contextos largos, mientras que cada cuarta capa es de atencion completa con compuertas para permitir un recuerdo preciso. Un codificador de vision se situa en paralelo para procesar imagenes junto con tokens de texto. El modelo se obtuvo mediante fine-tuning QLoRA sobre Qwen3.5-2B, orientado a un unico cometido: ser un agente fiable al que un usuario pueda confiar su propio ordenador.

El entrenamiento se centra en cuatro objetivos declarados por el autor: identidad propia (el modelo sabe que es Rabt 1.0, creado por Eng. Awaiz Ahmed en Kanban Studios, y admite que esta construido sobre Qwen3.5), honestidad sobre acciones pendientes de aprobacion, resistencia a inyeccion de instrucciones ocultas en correos, ficheros y paginas web, y coherencia de identidad y reglas en los cinco idiomas soportados. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Entrada multimodal image-text-to-text mediante codificador de vision.
- Tool calling y function calling: la model card reporta 6/6 en llamadas correctas a herramientas para peticiones directas en ingles, frances y arabe.
- Comportamiento de agente con human-in-the-loop: prepara acciones y espera aprobacion explicita antes de ejecutarlas.
- Resistencia a prompt injection: trata instrucciones ocultas en correos, ficheros y paginas web como datos, no como ordenes.
- Identidad consistente en cinco idiomas (ingles, arabe, frances, hindi, urdu) y transparencia sobre su modelo base.
- Soporte de despliegue local en Ollama y llama.cpp, incluida ejecucion en CPU.
- Capacidades multilingues mas amplias heredadas de Qwen3.5, mas alla de los cinco idiomas principales.

## Casos de uso

- Asistente personal en local para gestion de correo y calendario: el modelo propone redactar o enviar mensajes y espera confirmacion, lo que encaja con su entrenamiento en honestidad sobre acciones pendientes y evita falsos "enviado".
- Busqueda y organizacion de ficheros en el equipo del usuario: con 256K tokens de contexto puede manejar listados y fragmentos extensos de documentos, y su diseno local-first garantiza que el contenido no sale de la maquina.
- Generacion de hojas de calculo y documentos ofimaticos: el modelo prepara la accion y la somete a aprobacion, adecuado para flujos donde un error de escritura tendria consecuencias.
- Despliegue en entornos regulados (despachos juridicos, clinicas, ingenieria, administracion publica): al ejecutarse completamente offline, incluso en CPU con la cuantizacion Q4_K_M (~1,3 GB), permite procesar datos sensibles sin enviarlos a servicios alojados.
- Atencion al cliente multilingue en la region del Golfo: cubre arabe, hindi, urdu, frances e ingles, los idiomas de uso cotidiano en los Emiratos Arabes Unidos, con identidad y reglas estables en todos ellos.
- Automatizacion de tareas con agentes y aprobacion humana: integrable como capa de decision en pipelines donde cada accion debe validarse antes de ejecutarse, gracias a su soporte de tool calling y a su entrenamiento contra instrucciones inyectadas.
- Prototipado rapido en portatiles modestos: al caber en 4 GB de memoria o incluso ejecutarse en CPU, sirve para desarrollar y probar flujos de agente sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card (mismos prompts y ajustes, temperatura 0, prompts no vistos en entrenamiento):

| Prueba | Rabt 1.0 2B | Qwen3.5-2B (base) |
|---|---|---|
| Identidad y creador, 11 prompts en 5 idiomas | 10/11 | 0/11 |
| Honestidad: no declarar completada una accion pendiente de aprobacion | 2/4 | 2/4 |
| Inyeccion: ignorar instrucciones ocultas en correos, ficheros y paginas web | 2/6 | 2/6 |
| Herramientas: llamar a la herramienta correcta en peticiones directas (EN, FR, AR) | 6/6 | 6/6 |
| Benchmark del motor Rabt: 14 turnos reales reservados con el prompt propio y 21 herramientas | 12/14 | 7/14 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB con cuantizacion Q4_K_M en GGUF; el modelo completo en safetensors ocupa 5,9 GB de repositorio.
- Hardware recomendado por el autor: 4 GB o mas de memoria, o CPU.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); tambien en CPU.
- Opciones de despliegue: Ollama y llama.cpp (soporte nativo declarado), ademas de transformers y vLLM por compatibilidad de arquitectura y formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Rabt 1.0 2B | 2,27B | 256K | Apache 2.0 | Agente personal local-first con aprobacion humana y 5 idiomas | Hugging Face, GGUF/Ollama |
| Qwen3.5-2B (base) | ~2B | no disponible | no disponible en la informacion | Chatbot general multimodal | Hugging Face |
| Rabt 1.0 4B | 4B | no disponible | Apache 2.0 (segun familia) | Misma familia, tier Core, ~2,7 GB en Q4_K_M | Hugging Face |
| Rabt 1.0 9B | 9B | no disponible | Apache 2.0 (segun familia) | Misma familia, tier Flagship, ~5,8 GB en Q4_K_M | Hugging Face |

## Limitaciones y advertencias

- En las pruebas de honestidad e inyeccion el modelo acierta solo 2 de 4 y 2 de 6 casos respectivamente, por lo que las garantias frente a acciones falsamente reportadas y prompt injection son parciales y requieren defensas adicionales en produccion.
- La model card indica que la aplicacion Rabt incorpora un guardia en el motor que bloquea respuestas que declaren acciones no ejecutadas; fuera de esa aplicacion, esa proteccion no existe y debe implementarse aparte.
- Riesgo de alucinacion inherente a un modelo de 2B: menor capacidad de razonamiento y conocimiento factual que modelos mayores, lo que limita tareas complejas.
- La ventana de 256K tokens es la declarada en la model card; no se aportan mediciones de rendimiento en contextos largos ni de degradacion por posicion.
- Cobertura idiomatica centrada en ingles, arabe, frances, hindi y urdu; el resto de idiomas depende de las capacidades del modelo base y no esta evaluado.
- No se documentan sesgos especificos ni evaluaciones de seguridad mas alla de las pruebas citadas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte declarados.
- No hay datos publicados de benchmarks estandar ni de latencia/throughput, lo que dificulta comparaciones objetivas con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/4waiz/Rabt-1.0-2B
- Producto Rabt: https://rabt.kanbanstudios.ae
- Variante 4B: https://huggingface.co/4waiz/Rabt-1.0-4B
- Variante 9B: https://huggingface.co/4waiz/Rabt-1.0-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Resultados de evaluacion: eval/results.json (incluido en el repositorio del modelo)
