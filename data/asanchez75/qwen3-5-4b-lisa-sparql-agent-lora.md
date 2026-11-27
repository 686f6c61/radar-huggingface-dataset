# asanchez75/qwen3.5-4b-lisa-sparql-agent-lora

## Resumen

El modelo `asanchez75/qwen3.5-4b-lisa-sparql-agent-lora` es un adaptador LoRA de 42,5 millones de parametros entrenables (aproximadamente el 1,0 % del total) montado sobre el modelo base `Qwen/Qwen3.5-4B`. Lo desarrolla el usuario asanchez75 y su proposito es convertir un modelo de lenguaje de 4B en un agente que responde preguntas abiertas del curriculo medico frances explorando de forma interactiva un grafo de conocimiento RDF (la ontologia UNESS LISA) mediante consultas SPARQL.

El adaptador resuelve un problema concreto: que un modelo pequeno pueda fundamentar sus respuestas en un grafo de conocimiento estructurado en lugar de depender de su memoria parametrica, reduciendo asi el riesgo de alucinacion en un dominio sensible como la formacion medica. Para ello aprende un bucle de herramientas en el que emite consultas `<sparql>...</sparql>`, recibe resultados `<result>...</result>` y finalmente produce una respuesta `<answer>...</answer>`.

Es relevante ahora porque demuestra una receta de entrenamiento hibrida (SFT de calentamiento seguido de RL on-policy con GRPO) aplicada a un modelo de tan solo 4B de parametros, con licencia Apache 2.0 y un formato de interaccion bien especificado. El grafo cubre 4.872 paginas `KnowledgeObjective` con `fullWikitext` vinculadas a 367 capitulos `KnowledgeItem`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B |
| Parametros totales | 42,5 M entrenables en el adaptador (~1,0 % del modelo base); total del base no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la receta de despliegue usa `--max-model-len 16384`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Frances (`fr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rank / alpha LoRA | `r=32`, `lora_alpha=64`, `lora_dropout=0.0` |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Libreria | `peft==0.21.3` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base `Qwen/Qwen3.5-4B` mediante LoRA con rango 32 y alpha 64, sin dropout, cubriendo las proyecciones de atencion y de la MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). La arquitectura subyacente es la del transformer decoder-only de Qwen3.5, cuyos detalles completos (numero de capas, dimension oculta, atencion) no se detallan en la informacion disponible.

El entrenamiento se realizo en tres etapas: una primera etapa de GRPO estilo "title" (60 pasos), una etapa 2A de calentamiento SFT sobre 488 trazas durante 2 epocas, y una etapa 2B de GRPO sobre preguntas abiertas (70 pasos) con la regla de actualizacion `--rule neghalf`. La innovacion principal es el entrenamiento del bucle de herramientas SPARQL: el modelo aprende a explorar el esquema de la ontologia UNESS LISA, localizar objetivos de conocimiento por palabras clave en `fullWikitext`, navegar capitulos mediante `hasKnowledgeObjective` y fundamentar la respuesta final estrictamente en el texto recuperado. El adaptador se entreno con un prompt de completions renderizado a mano (`enable_thinking=False`, prefijo vacio `\n\n` en cada turno del asistente) y requiere las instrucciones de esquema de la ontologia LISA en el system prompt.

## Capacidades

- Generacion de texto en frances orientada a preguntas del curriculo medico.
- Razonamiento multi-paso con bucle de herramientas: emite consultas SPARQL y consume resultados iterativamente hasta un maximo recomendado de 16 turnos.
- Construccion de consultas SPARQL sobre un grafo RDF con grafo nombrado `https://uness.fr/lisa/ontology/`.
- Exploracion de esquema: localizacion de objetivos de conocimiento por palabras clave en `fullWikitext` y navegacion entre capitulos via `hasKnowledgeObjective`.
- Fundamentacion (grounding) de respuestas en texto recuperado, con instruccion explicita de no adivinar.
- Capacidad de correccion: si la pregunta contiene una afirmacion falsa, el modelo debe corregirla tras leer la pagina.
- Manejo de preguntas de dos volets o comparaciones leyendo una pagina por cada parte.
- Capacidad de declarar que un tema no esta cubierto en el grafo.
- Soporte de tool calling mediante el protocolo propio `<sparql>` / `<result>` / `<answer>`.

## Casos de uso

- Asistente de estudio medico en frances: el modelo responde preguntas abiertas del curriculo explorando las 4.872 paginas `KnowledgeObjective` del grafo UNESS LISA y fundamentando la respuesta en el texto recuperado, lo que lo hace adecuado para entornos donde la trazabilidad de la fuente es critica.
- Motor de retrieval aumentado sobre grafos de conocimiento: en lugar de un RAG vectorial clasico, el adaptador genera consultas SPARQL para localizar y leer paginas concretas, util para dominios con ontologias estructuradas y texto asociado.
- Generacion y depuracion de consultas SPARQL: el modelo aprende a escribir consultas con `LIMIT`, `GRAPH` y `FILTER(CONTAINS(...))`, reutilizable como componente de un pipeline de consulta sobre Virtuoso.
- Navegacion de capitulos y planes de estudio: mediante `hasKnowledgeObjective` puede listar los objetivos de un mismo capitulo, util para construir rutas de aprendizaje o resumenes tematicos.
- Verificacion de afirmaciones: el modelo esta entrenado para corregir afirmaciones falsas tras leer la pagina correspondiente, lo que permite usarlo como comprobador de contenido contra una fuente oficial.
- Deteccion de cobertura tematica: puede indicar explicitamente cuando un tema no aparece en el grafo, util para sistemas que necesitan distinguir entre "no cubierto" y "no encontrado".
- Prototipado de agentes con modelos pequenos: con 42,5 M de parametros entrenables sobre un base de 4B, sirve como referencia para validar recetas SFT + GRPO antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,2 GB y se carga junto al modelo base `Qwen/Qwen3.5-4B` en bfloat16; la VRAM total depende del base, no disponible en la informacion proporcionada.
- Despliegue recomendado con vLLM: `vllm serve Qwen/Qwen3.5-4B --dtype bfloat16 --max-model-len 16384 --enable-lora --max-lora-rank 32 --lora-modules lisa-best=... --reasoning-parser qwen3`.
- Carga alternativa con PEFT + Transformers (`PeftModel.from_pretrained`) y `device_map="auto"`, lo que permite distribuir el base entre varias GPU.
- Requiere un endpoint SPARQL (Virtuoso) con el grafo `https://uness.fr/lisa/ontology/` y truncado de resultados a 2.500 caracteres.
- No se especifican GPU concretas (A100, H100, RTX 4090) ni si cabe en GPU de consumo; no disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-lisa-sparql-agent-lora | 42,5 M entrenables sobre base 4B | no disponible | Agente SPARQL sobre grafo RDF medico (frances) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | LLM generalista | no disponible en la informacion | Hugging Face |
| Alternativas de agente SPARQL de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador solo esta entrenado para frances (`fr`); su uso en otros idiomas degradara la calidad.
- Requiere obligatoriamente el system prompt con el esquema de la ontologia LISA y el bucle `<sparql>` / `<result>`; usarlo con la plantilla de chat estandar sin ese prompt reduce significativamente la precision de recuperacion.
- Entrenado con `enable_thinking=False` y un prefijo `\n\n` vacio; el modo de razonamiento extendido puede no comportarse como se espera.
- Depende de un endpoint SPARQL externo (Virtuoso) y del grafo UNESS LISA; si el grafo cambia o no esta disponible, el modelo no puede fundamentar sus respuestas.
- Riesgo de alucinacion si el modelo no sigue el protocolo o si los resultados del grafo son incompletos; el entrenamiento mitiga pero no elimina este riesgo.
- El truncado de resultados a 2.500 caracteres puede omitir informacion relevante en paginas largas.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.5-4B antes de produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa ni de evaluacion independiente.
- No se documentan sesgos conocidos; al estar especializado en un curriculo medico frances concreto, su cobertura queda limitada a ese dominio.

## Enlaces

- Hugging Face: https://huggingface.co/asanchez75/qwen3.5-4b-lisa-sparql-agent-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ontologia UNESS LISA: https://uness.fr/lisa/ontology/
- Repositorio PEFT: https://github.com/huggingface/peft
- vLLM: https://github.com/vllm-project/vllm
- Virtuoso (endpoint SPARQL): https://virtuoso.openlinksw.com/
