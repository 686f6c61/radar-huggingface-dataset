# olo-labs/olo-qwen2.5-0.5b-hotfolder

## Resumen

olo-qwen2.5-0.5b-hotfolder es un adaptador QLoRA publicado por olo-labs sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,49 mil millones de parametros. El adaptador esta especializado en una unica tarea: emitir llamadas a herramientas (tool calling) en el formato nativo de Qwen2.5 cuando se le presentan las herramientas mediante la plantilla de chat o el campo `tools` de un servidor compatible con OpenAI (vLLM, Ollama, llama.cpp). Las herramientas objetivo son las expuestas por olo-toolgate, una pasarela MCP del mismo autor, e incluyen operaciones de sistema de ficheros como `read_text`, `write_text`, `copy`, `move`, `hash` o `search_text`.

El interes del modelo es empirico y muy concreto: el autor reporta que el adaptador eleva la tasa de acierto en 259 prompts retenidos del 54,4 % al 98,1 %, y la validez de argumentos segun esquema del 54,7 % al 99,2 %, sobre el mismo modelo base y con decodificacion greedy. Es decir, no anade conocimiento nuevo sino que alinea un modelo pequeno con el formato exacto de function calling, algo que el modelo base de 0,5B cumple solo a medias.

Por su tamano, el modelo no compite en razonamiento general ni en generacion de codigo: es un componente de enrutamiento barato para agentes y pipelines que necesitan convertir lenguaje natural en llamadas JSON validas con una latencia y un coste minimos. La informacion publica no incluye licencia, idiomas soportados ni detalles del dataset de entrenamiento mas alla del numero de filas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) con adaptador QLoRA (PEFT) |
| Parametros totales | 0,49 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32 768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible; el adaptador se entrena con QLoRA (cuantizacion en 4 bits durante el entrenamiento), los pesos publicados son safetensors del adaptador |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre Qwen2.5-0.5B-Instruct, sin modificaciones arquitectonicas: se anaden matrices de bajo rango a las capas del transformer y se congela el resto de pesos. El entrenamiento cubre 1461 filas de entrenamiento, 366 pasos y 10 herramientas, con una perdida final media (ultimos 50 pasos) de 0,0177 y un tiempo de ejecucion de 25,6 minutos. El pipeline de generacion de datos es olo-ai-training-mcp, del mismo autor.

La innovacion no esta en la arquitectura sino en el formato: el adaptador aprende a responder en la convencion de tool calling propia del chat template de Qwen2.5, de modo que funciona con los parsers de herramientas ya existentes en vLLM, Ollama y llama.cpp sin postprocesado adicional. El autor indica que las herramientas no vistas durante el entrenamiento se ofrecen por la misma via y el modelo las trata igual, aunque no aporta metricas especificas de generalizacion a esquemas nuevos.

## Capacidades

- Generacion de llamadas a herramientas en el formato nativo de Qwen2.5, con un unico tool call por respuesta.
- Ajuste de argumentos al esquema JSON de la herramienta: nombres exactos, tipos, valores de enum y limites.
- Distincion entre llamar a una herramienta y responder en texto plano cuando ninguna encaja.
- Manejo de valores por defecto y de parametros opcionales no solicitados por el usuario.
- Respuesta en texto plano pidiendo un valor obligatorio que falta, en lugar de inventarlo.
- Reconocimiento de herramientas no disponibles en la peticion (categoria `unavailable`, 6/6 en la evaluacion).
- No se documentan capacidades de razonamiento general, codigo, matematicas, vision, audio ni modo thinking; el adaptador esta orientado exclusivamente a function calling.

## Casos de uso

- Enrutamiento de intenciones en agentes MCP: el modelo recibe la lista de herramientas de olo-toolgate y el mensaje del usuario, y devuelve la llamada concreta con argumentos validos, lo que elimina el parseo defensivo en el orquestador.
- Automatizacion de sistemas de ficheros: operaciones como listar, leer, escribir, copiar, mover, crear directorios, calcular hashes o buscar texto se invocan desde lenguaje natural con un modelo de 0,5B que cabe en cualquier GPU consumer.
- Preprocesado barato en pipelines RAG: clasificar la peticion del usuario y decidir que herramienta de recuperacion invocar antes de pasar el control a un modelo mayor, reduciendo coste y latencia en el primer salto.
- Servidores OpenAI-compatibles: al respetar el formato de Qwen2.5, se puede desplegar en vLLM u Ollama con el parser de herramientas del modelo base y sin cambios en el cliente.
- Agentes de escritorio o locales con recursos limitados: al ocupar poco mas de 1 GB en cuantizacion de 4 bits, es viable en portatiles y en entornos sin GPU dedicada mediante llama.cpp.
- Generacion de datos sinteticos de tool calling: sirve como anotador de pares peticion-llamada para construir datasets de entrenamiento de modelos mayores, dado su 98,7 % de argumentos exactos en la evaluacion del autor.
- Validacion de esquemas en CI: comprobar que las definiciones de herramientas de un proyecto son invocables correctamente por un modelo pequeno antes de publicarlas a un agente en produccion.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 259 prompts retenidos, mismo system prompt y decodificacion greedy, comparando el modelo base con el adaptador:

| Metrica | Modelo base | Adaptador | Cambio |
|---|---|---|---|
| Tasa de acierto | 54,4 % | 98,1 % | +43,6 pts |
| Herramienta correcta | 57,3 % | 99,2 % | +41,9 pts |
| JSON estricto | 98,3 % | 99,6 % | +1,3 pts |
| Argumentos validos segun esquema | 54,7 % | 99,2 % | +44,5 pts |
| Argumentos exactos | 41,4 % | 98,7 % | +57,3 pts |
| Sin herramienta correcto | 52,0 % | 88,0 % | +36,0 pts |

Desglose por categoria:

| Categoria | Modelo base | Adaptador |
|---|---|---|
| defaults | 31/41 (75,6 %) | 41/41 (100,0 %) |
| missing | 0/4 (0,0 %) | 2/4 (50,0 %) |
| negative | 7/15 (46,7 %) | 14/15 (93,3 %) |
| parameter_variation | 27/60 (45,0 %) | 60/60 (100,0 %) |
| positive | 70/133 (52,6 %) | 131/133 (98,5 %) |
| unavailable | 6/6 (100,0 %) | 6/6 (100,0 %) |

El autor indica ademas que el entrenamiento corrigio 113 prompts que el modelo base fallaba y no rompio ninguno, y que en un conjunto de validacion escrito por autores de herramientas y por personas (125 prompts, nunca vistos en entrenamiento) el adaptador alcanza un 94,4 % (118/125). No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: en torno a 1 GB para el modelo base en 4 bits mas el adaptador; aproximadamente 2 GB en fp16 para el modelo base completo, mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en GTX 1650, RTX 3050, RTX 4060 y superiores; tambien en CPU mediante llama.cpp u Ollama con cuantizacion GGUF.
- Opciones de despliegue: transformers con PEFT, vLLM (con el parser de herramientas de Qwen2.5), Ollama, llama.cpp y TGI mediante exportacion a un modelo fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento completo tardo 25,6 minutos, lo que sugiere un coste de inferencia muy bajo, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olo-qwen2.5-0.5b-hotfolder | 0,49B (adaptador) | no disponible | Tool calling especializado en olo-toolgate | no disponible | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32 768 tokens (segun documentacion del modelo base) | Instrucciones generales, tool calling nativo | Apache 2.0 (segun documentacion del modelo base) | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32 768 tokens (segun documentacion del modelo base) | Instrucciones generales, mayor capacidad | Apache 2.0 (segun documentacion del modelo base) | Hugging Face |
| Hermes-2-Pro / modelos afinados para function calling de 1-3B | variable | variable | Tool calling generico | variable | Hugging Face |

La comparacion directa con alternativas de la misma categoria no esta disponible en la informacion proporcionada: no hay datos publicados de otros adaptadores de tool calling sobre Qwen2.5-0.5B evaluados con el mismo conjunto de 259 prompts.

## Limitaciones y advertencias

- El adaptador esta entrenado sobre 10 herramientas concretas de `examples.hotfolder`; no hay metricas publicadas de generalizacion a esquemas completamente nuevos, solo la afirmacion cualitativa del autor.
- La categoria `missing` es la mas debil: 2/4 (50,0 %), lo que indica dificultad para pedir en texto plano un argumento obligatorio ausente.
- La categoria `negative` queda en 93,3 %, con 1 fallo de 15: el modelo puede invocar una herramienta cuando la respuesta correcta era texto plano.
- El modelo base de 0,5B tiene capacidad de razonamiento limitada; no debe usarse para tareas que exijan comprension profunda del dominio, solo para enrutamiento y formateo.
- No se especifica la licencia del adaptador; antes de uso comercial hay que verificar los terminos en el repositorio y la licencia del modelo base Qwen2.5.
- No se documentan idiomas soportados; el system prompt de ejemplo esta en ingles y no hay evaluacion multilingue.
- Riesgo de alucinacion de valores de argumentos: el autor lo mitiga con instrucciones explicitas en el system prompt, pero no hay garantia formal; conviene validar los argumentos contra el esquema en el servidor.
- El adaptador requiere cargar el modelo base por separado; el tamano del repositorio (0,0 GB) refleja que solo contiene los pesos LoRA.
- No hay resultados en benchmarks estandar de conocimiento o razonamiento, por lo que no es comparable en esas dimensiones con modelos mayores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olo-labs/olo-qwen2.5-0.5b-hotfolder
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio olo-toolgate: https://github.com/olo-labs/olo-toolgate
- Repositorio olo-ai-training-mcp: https://github.com/olo-labs/olo-ai-training-mcp
