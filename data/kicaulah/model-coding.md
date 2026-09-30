# Kicaulah/model-coding

## Resumen

Model Coding es un ajuste fino del modelo Qwen2.5-Coder-3B-Instruct publicado por Kicaulah, y forma parte de un sistema de agentes compuesto por cinco especialistas mas un enrutador que se expone a traves de un unico endpoint compatible con la API de OpenAI. El modelo esta disenado para adoptar la persona de un "desarrollador senior pragmatico": respuestas directas, codigo funcional en primer lugar, explicaciones breves y senalamiento explicito de errores, riesgos de seguridad y problemas de rendimiento. La relevancia de esta ficha esta condicionada por un hecho central: los pesos del modelo no estan publicados todavia, por lo que el artefacto que realmente se puede probar hoy es el system prompt asociado, no los pesos.

El modelo base, Qwen2.5-Coder-3B-Instruct, es un transformer decoder-only de aproximadamente 3.000 millones de parametros, licencia Apache 2.0 y ventana de contexto nativa de 32.768 tokens, si bien la model card de este ajuste declara una longitud de contexto de 4.096 tokens. El ajuste se ha realizado mediante QLoRA y posterior fusion de la LoRA (merge-LoRA), segun los tags del repositorio.

No se han publicado datos de benchmarks, no hay cifras de descargas ni de interacciones (0 descargas, 0 likes en el momento de redactar esta ficha) y la model card reconoce explicitamente que los pesos no estan disponibles, por lo que cualquier evaluacion practica debe hacerse hoy mediante el system prompt sobre otro modelo instruct o esperando a la publicacion de los pesos. El idioma declarado es unicamente el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | ~3.000 millones (~3B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens segun la model card (el modelo base Qwen2.5-Coder-3B-Instruct soporta 32.768 nativos) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones propias; al derivar de Qwen2.5-Coder-3B-Instruct, el modelo base es compatible con bf16/fp16 e int8/int4) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (anunciado); los pesos no estan publicados todavia |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only con atencion causal y soporte de RoPE para contexto largo, y se ha adaptado mediante QLoRA (cuantizacion en 4 bits durante el entrenamiento) seguido de la fusion de los adaptadores LoRA en los pesos base (merge-LoRA). Los tags del repositorio indican instruction-tuning y SFT (supervised fine-tuning) orientados a una persona conversacional concreta, con enfasis en tono natural ("anti-robotic"), empatia y dominio experto. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion declarada no es arquitectonica sino de comportamiento: el objetivo del ajuste es fijar una voz concreta (un desarrollador senior directo que lidera con codigo y evita aperturas del tipo "Certainly! Here's an explanation of..."). La model card insiste en que el componente mas util y reutilizable del repositorio es el system prompt, que funciona sobre cualquier modelo instruct, y no tanto los pesos ajustados. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

## Capacidades

- Generacion de codigo: produce soluciones funcionales en bloques de codigo, con supuestos de version y dependencias explicitos, y con enfasis en la comprobacion de errores y casos limite en lugar de la ruta feliz unicamente.
- Revision de codigo: senala fallos concretos (por ejemplo, fugas de descriptores de fichero, riesgos de inyeccion) y problemas de rendimiento de forma directa.
- Conversacion multi-turno con persona fija: mantiene un estilo consistente de desarrollador senior mediante el system prompt.
- Soporte de tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: forma parte de un sistema de agentes de cinco especialistas con enrutador servido por protocolo OpenAI, pero no se detalla el comportamiento agéntico individual del modelo.
- Capacidades multilingues: limitadas al ingles, segun la etiqueta de idioma del repositorio.
- Capacidad especial: integracion declarada con clientes y entornos compatibles con la API de OpenAI (Open WebUI, LibreChat, Cline, Continue, Aider, LangChain, LiteLLM, vLLM, Ollama).
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponibles.

## Casos de uso

- Asistente de programacion en el editor: integrar el modelo o su system prompt en Cline, Continue o Aider para obtener respuestas que priorizan codigo ejecutable y senalan los supuestos de version, reduciendo el ruido explicativo tipico de otros asistentes.
- Revision de pull requests: emplearlo como primer filtro automatico para detectar patrones problematicos (manejo de errores ausente, riesgos de inyeccion, fugas de recursos) antes de la revision humana, gracias a su tono directo y a su enfoque en casos limite.
- Soporte tecnico a desarrolladores noveles: el system prompt incluye ejemplos de explicaciones concisas (por ejemplo, como definir una funcion en Python), lo que encaja en un canal de ayuda interna donde se busca respuesta breve y operativa.
- Chatbot de onboarding en equipos de ingenieria: con una ventana de 4.096 tokens puede mantener conversaciones acotadas sobre convenciones de codigo y dudas puntuales, aunque no para contexto largo de repositorio completo.
- Generacion de fragmentos de codigo en pipelines internos: si finalmente se publican los pesos, un modelo de 3B puede desplegarse con coste bajo en GPU de consumo para tareas de autocompletado o transformacion de codigo en lote.
- Base para ajustes de persona en ingles: reutilizar el system prompt en modelos instruct mayores cuando se necesita un asistente que no abra con formulas de cortesia genericas y que vaya directo a la solucion.
- Prototipado rapido de agentes con enrutador: usar el endpoint compatible con OpenAI del sistema Kicaulah para enrutar consultas de codigo al especialista correspondiente dentro de una arquitectura multiagente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos estandar para ~3B parametros, no datos medidos del autor): aproximadamente 6-7 GB en bf16/fp16, unos 3-4 GB en int8 y unos 2-2,5 GB en int4.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100). Para cuantizacion int4 bastan 4 GB.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPU de gama media y alta (RTX 3060 12 GB en adelante); la propia model card indica que el entrenamiento cabe en una GPU de 16 GB (Colab T4).
- Opciones de despliegue: transformers (pipeline de text-generation), vLLM, TGI, llama.cpp y Ollama (estos dos ultimos previa conversion a GGUF), ademas de cualquier cliente con API compatible con OpenAI.
- Latencia y throughput estimados: no disponible (no se aportan mediciones).
- Consideracion practica: dado que los pesos no estan publicados, hoy el despliegue factible es el del system prompt sobre otro modelo instruct, no el del modelo en si.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kicaulah/model-coding | ~3B | 4.096 tokens (declarados) | no disponible | Apache 2.0 | Pesos no publicados; system prompt si |
| Qwen/Qwen2.5-Coder-3B-Instruct | ~3B | 32.768 tokens nativos | no disponible en esta informacion | Apache 2.0 | Pesos publicados en HuggingFace |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | ~1,5B | 32.768 tokens nativos | no disponible en esta informacion | Apache 2.0 | Pesos publicados en HuggingFace |
| Qwen/Qwen2.5-Coder-7B-Instruct | ~7B | 32.768 tokens nativos (ampliable con YaRN) | no disponible en esta informacion | Apache 2.0 | Pesos publicados en HuggingFace |

Los datos de parametros, contexto y licencia de los modelos Qwen proceden de su documentacion publica. No se dispone de cifras de benchmarks para realizar una comparacion de rendimiento entre ellos en esta ficha.

## Limitaciones y advertencias

- Los pesos no estan publicados: la model card indica explicitamente "Weights not published yet" y describe el script de entrenamiento necesario para generarlos. Hasta que se publiquen, no es posible cargar el modelo tal cual desde HuggingFace.
- Ventana de contexto reducida: 4.096 tokens declarados, muy inferior a los 32.768 del modelo base, lo que limita tareas que requieran contexto amplio (repositorios grandes, conversaciones largas).
- Idioma unico: solo ingles; no hay soporte documentado de castellano ni de otros idiomas.
- Ausencia de evaluacion: no hay benchmarks publicados, ni cifras de descargas (0) ni de interacciones (0) que permitan validar la calidad del ajuste.
- Riesgo de alucinacion de APIs: el propio system prompt recomienda decir "no estoy seguro" cuando no se conoce una funcion, lo que reconoce implicitamente ese riesgo; aun asi, un modelo de 3B puede inventar metodos o firmas inexistentes.
- Sesgos: no se documentan analisis de sesgo; al ser un ajuste de persona que "puede ser brusco" ("blunt"), conviene revisar el tono en contextos de atencion al cliente.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-Coder-3B-Instruct conviene verificar las condiciones de dicho modelo base (tambien Apache 2.0).
- Caveat de produccion: el valor real del artefacto en su estado actual es el system prompt; cualquier afirmacion sobre el rendimiento del modelo ajustado queda pendiente de la publicacion de pesos y de evaluaciones independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kicaulah/model-coding
- Perfil del autor en HuggingFace: https://huggingface.co/Kicaulah
- Modelos del autor: https://huggingface.co/Kicaulah/models
- Demo en vivo (Space): https://huggingface.co/spaces/Kicaulah/Kicaulah-AI-Demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
