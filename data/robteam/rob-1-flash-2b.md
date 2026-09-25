# RobTeam/rob-1-flash-2b

## Resumen

rob-1-flash-2b es un modelo de chat en ruso publicado por RobTeam (usuario robanik10101) como derivado no oficial de Qwen/Qwen3.5-2B. Se distribuye unicamente en formato GGUF, con dos cuantizaciones (F16 y Q8_0), y esta pensado para ejecutarse localmente en llama.cpp, llama-server, LM Studio u Ollama. El ajuste consiste en un SFT con LoRA (r=8) aplicado sobre las capas de atencion y MLP, con los pesos base congelados, sobre 2934 filas limpias en ruso.

El modelo resuelve un nicho muy concreto: conversacion cotidiana en ruso, preguntas y respuestas generales, matematicas basicas y generacion de codigo en Python, Java, Lua y C++, ademas de filas de identidad que fijan el nombre del asistente (rob-1-flash) y su creador (robanik). No se ha entrenado con RLHF ni DPO, y el propio autor reconoce que no se ejecutaron benchmarks formales: solo comprobaciones puntuales por dominio.

Su relevancia es limitada y hay que leerla con honestidad: se trata de un fine-tune pequeno, con 1.942.653.248 parametros reales en safetensors, licencia Apache 2.0 heredada y un repo de 7,3 GB. Con 3 descargas y 0 likes en el momento de la consulta, es un experimento de autor individual mas que un modelo de produccion. El interes tecnico esta en que ejemplifica el flujo completo de adaptacion de un modelo base moderno a un idioma concreto con recursos minimos (LoRA r=8 sobre 2934 filas, entrenamiento en CPU) y su empaquetado posterior a GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen/Qwen3.5-2B (detalles internos del base no disponibles; tensores MTP preservados segun la model card) |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens (valor recomendado por el autor para LM Studio; el maximo del modelo base no se especifica) |
| Tipos de cuantizacion | F16 (3,9 GB) y Q8_0 (1,9 GB) |
| Idiomas soportados | ruso (ru); capacidades en otros idiomas no declaradas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo total de 7,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B con los pesos base congelados y aplica un SFT mediante LoRA de rango 8 sobre los modulos de atencion y MLP. El conjunto de entrenamiento son 2934 filas en ruso, mezcladas aleatoriamente, con contenido de Q&A cotidiano, matematicas, codigo (Python, Java, Lua, C++) y filas de identidad que asocian el nombre rob-1-flash y el creador robanik. El entrenamiento se ejecuto en CPU. Posteriormente los adaptadores se fusionaron en los pesos originales, preservando los tensores MTP (multi-token prediction) del base, y se convirtio el resultado a GGUF con llama.cpp en dos variantes: F16 y Q8_0.

No hay innovacion arquitectonica propia: es un fine-tune de estilo e idioma sobre un modelo preexistente. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni decodificacion especulativa, atencion lineal u otras optimizaciones. Tampoco se distribuyen scripts ni codigo de entrenamiento, por lo que la reproducibilidad del proceso no esta garantizada. El autor declara que el ajuste desplaza el estilo hacia las filas de entrenamiento y que el razonamiento dificil se mantiene en el nivel del base de 2B.

## Capacidades

- Generacion de texto conversacional en ruso (charla general, small talk).
- Respuestas a preguntas cotidianas y de conocimiento general dentro del alcance de un modelo de 2B.
- Matematicas basicas; verificado por el autor en llama-server.
- Generacion de codigo en Python, Java, Lua y C++ a partir de ejemplos de entrenamiento.
- Respuestas de identidad consistentes (por ejemplo, "Меня зовут rob-1-flash").
- Soporte de tool calling / function calling: no disponible (no declarado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: no declaradas; el modelo esta orientado a ruso y no se documenta transferencia a otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Chatbot de atencion al cliente en ruso para dominios acotados: con una ventana de 4096 tokens puede mantener conversaciones multi-turno breves sobre catalogos, horarios o preguntas frecuentes, siempre que el alcance tematico este limitado y se validen las respuestas.
- Asistente local de escritorio sin conexion: al pesar 1,9 GB en Q8_0 y funcionar en llama.cpp, puede desplegarse en portatiles sin GPU dedicada para tareas de redaccion y resumen en ruso.
- Generacion de fragmentos de codigo en Python, Java, Lua o C++ para prototipado rapido: adecuado para autocompletar funciones cortas o traducir pseudocodigo, no para refactorizaciones complejas.
- Practica de conversacion y tutoring de ruso: el modelo mantiene registro conversacional y puede usarse como interlocutor de bajo coste en herramientas de aprendizaje.
- Clasificacion y reformulacion de texto en ruso dentro de pipelines ETL: por ejemplo, normalizar titulares o resumir entradas cortas antes de indexarlas, aprovechando su tamano reducido para procesar lotes en CPU.
- Base para experimentos de fine-tuning en idiomas de bajos recursos: sirve como punto de partida reproducible (Apache 2.0) para quien quiera replicar el flujo LoRA + GGUF con presupuesto minimo.
- Chat de identidad de marca o demos internas: las filas de identidad permiten presentar un asistente con nombre propio, util para prototipos y pruebas de concepto.
- Inferencia en el borde o en contenedores con CPU limitada: a ~15 tok/s en CPU, encaja en tareas de generacion asincrona donde la latencia no es critica (procesado por lotes nocturno, respuestas en cola).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ejecutaron benchmarks formales y que solo se hicieron comprobaciones puntuales por dominio (matematicas, small talk en ruso e identidad) verificadas en llama-server, con un rendimiento aproximado de 15 tok/s en CPU.

| Metrica | Valor |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Throughput en CPU | ~15 tok/s (dato del autor, llama.cpp) |
| Throughput en GPU | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q8_0 y 4,5-5,5 GB con F16, contando pesos, cache KV para 4096 tokens y overhead del runtime.
- GPUs recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070). En GPUs de datacenter (A100, H100) el modelo esta sobredimensionado en cuanto a VRAM, aunque funcionaria sin problema; su utilidad alli seria la agregacion de muchas instancias.
- Compatibilidad con GPU consumer: si, cabe holgadamente en la mayoria de tarjetas consumer actuales e incluso en iGPU con memoria unificada suficiente.
- Ejecucion en CPU: viable; el autor reporta ~15 tok/s con llama-server.
- Opciones de despliegue: llama.cpp y llama-server (verificado por el autor), LM Studio y Ollama (recomendado por el autor para Q8_0); vLLM y TGI no estan confirmados con GGUF en esta informacion.
- Parametros de muestreo sugeridos por el autor: temperature 1.0, top_k 20, top_p 1.0, presence_penalty 2.0, contexto 4096.
- Latencia y throughput estimados: solo se dispone del dato de ~15 tok/s en CPU; no hay mediciones en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| RobTeam/rob-1-flash-2b | 1.942.653.248 | 4096 (recomendado por el autor) | ru | Apache 2.0 | GGUF (F16, Q8_0) | Sin benchmarks publicos; spot-checks del autor |
| Qwen/Qwen3.5-2B (modelo base) | no disponible en la informacion | no disponible | multilingue segun el base | Apache 2.0 | safetensors y otros | No disponible en esta informacion |
| RobTeam/qwen2.5-7b-ru-gguf (mismo autor) | no disponible | no disponible | ru | no disponible | GGUF | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas rusas de tamano comparable en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- No es un modelo oficial de Alibaba Qwen; es un derivado no afiliado y la model card lo declara explicitamente.
- Ausencia total de benchmarks formales: cualquier afirmacion de calidad se basa en comprobaciones puntuales del autor, no en evaluaciones reproducibles.
- El razonamiento complejo se mantiene en el nivel del base de 2B, segun reconoce el propio autor; no cabe esperar capacidades de razonamiento de modelos mayores.
- Riesgo de alucinacion elevado en un modelo de este tamano, especialmente en preguntas factuales, matematicas no triviales y codigo con dependencias externas.
- Sesgos conocidos: no documentados. La composicion del dataset (2934 filas no publicadas) impide auditar sesgos de genero, origen o ideologia.
- El ajuste desplaza el estilo hacia las filas de entrenamiento, lo que puede producir respuestas rigidas o repetitivas fuera de los dominios vistos.
- Limitacion idiomatica: solo se declara ruso. No hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- Ventana de contexto limitada: el autor recomienda 4096 tokens; no se especifica el maximo del base, por lo que superar ese valor es arriesgado.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo base y sus condiciones siguen aplicando; el derivado debe mantener los avisos correspondientes.
- No se distribuyen scripts ni codigo de entrenamiento, lo que dificulta la reproduccion y la auditoria del proceso.
- Traccion practicamente nula (3 descargas, 0 likes en el momento de la consulta): no hay comunidad, issues ni soporte.
- No hay evidencia de soporte de tool calling, agentes, vision ni audio; no debe asumirse su disponibilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobTeam/rob-1-flash-2b
- Espejo del autor: https://huggingface.co/robanik10101/rob-1-flash-2b
- Perfil del autor en HuggingFace: https://huggingface.co/RobTeam
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
