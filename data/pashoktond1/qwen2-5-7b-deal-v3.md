# pashoktond1/qwen2.5-7b-deal-v3

## Resumen

Qwen2.5-7B-DEAL-v3 es un ajuste fino por QLoRA (LoRA de rango 32) sobre `Qwen/Qwen2.5-7B-Instruct`, publicado por el usuario pashoktond1. Su proposito no es el asistente generalista, sino un generador de codigo de dominio muy concreto: escribe programas DEAL, es decir, un unico fichero `.dealui` que contiene las vistas, una semilla `state {}` y bloques `update {}`, el dialecto empaquetado de un pequeno host de applets. El modelo recibe una frase y devuelve un fichero completo.

La relevancia de esta version (v3) esta en como se ha disenado el entrenamiento y el despliegue, no en el tamano: se apoya en decodificacion restringida por gramatica (GBNF) para que las construcciones invalidas del lenguaje (ternario `?:`, llamadas a metodo `x.f()`, bucles `for`) sean directamente irrepresentables durante el muestreo. Segun la model card, la gramatica vive en el repo (`deal-applet.gbnf`) y se pasa al servidor, nunca al prompt, mientras que el "brief" del sistema (437 caracteres) es lo que decide la calidad final. Con gramatica y brief alcanza 25/27 en el conjunto retenido y 12/12 en el fresco a temperatura 0,6.

Es heredero directo de `qwen2.5-7b-deal-v2`. Los cambios declarados incluyen presentar cada applet de entrenamiento dos veces (una con reglas en el mensaje de sistema y otra con un fragmento como maximo), anadir 40 negativos fuera de tema para ensenar *cuando no* escribir un applet, y alimentar nueve componentes de UI poco usados con 49 applets donantes, aunque el autor reconoce que este ultimo objetivo no se cumplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-7B-Instruct) con adaptador LoRA de rango 32 |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificado en la informacion proporcionada; el ejemplo de despliegue de llama.cpp usa `--ctx-size 8192` |
| Tipos de cuantizacion | GGUF Q8_0 (8,1 GB) y GGUF F16 (15,2 GB); adaptador LoRA en safetensors para fusion manual a fp16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA: `adapter_model.safetensors`, `adapter_config.json`, `chat_template.jinja`) y GGUF (Q8_0 y F16) |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Checkpoint | 72 (epoca 1), el usado para todas las metricas y para generar el GGUF |
| Tamano del repo | 23,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer decoder-only de Qwen2.5-7B-Instruct; el aporte de este repositorio es un adaptador LoRA de rango 32 entrenado con QLoRA. El ajuste no busca conocimiento general nuevo, sino inducir un dialecto de lenguaje muy cerrado (DEAL) y su formato de salida: exactamente un bloque de codigo etiquetado `dealui` y nada mas. Los pesos publicados corresponden al checkpoint 72 (epoca 1), que es tambien el punto de partida de la fusion que genero el GGUF.

En cuanto a datos, la model card indica dos decisiones clave. Primero, cada applet de entrenamiento se presenta dos veces: una con las reglas en el mensaje de sistema y otra acompanada como maximo de un fragmento, de modo que el modelo aprenda el par (brief completo, respuesta completa) y no dependa siempre de instrucciones detalladas. Segundo, se anadieron 40 negativos fuera de tema (chistes, aritmetica, capitales, recetas) para ensenar el limite en las dos direcciones: *esta peticion es un applet* y *esta no lo es*. Ademas, se incorporaron 49 applets donantes para intentar activar nueve componentes de UI poco frecuentes (Slider, Icon, Spacer, Scroll, Store, QRCode, Graph, Image y Load). La innovacion operativa mas destacable no es del modelo sino del pipeline: la gramatica GBNF restringe el muestreo y hace imposibles clases enteras de errores sintacticos.

## Capacidades

- Generacion de texto de un solo turno orientada a la produccion de un fichero DEAL (`.dealui`) con vistas, `state {}` y bloques `update {}`.
- Generacion de codigo con restricciones formales: la gramatica GBNF impide ternarios, llamadas a metodo y bucles `for` en la salida.
- Mapeo de una descripcion en una frase a un applet completo; el autor reporta 4/4 en ideas de applet sin system message ni gramatica (frente a 0/4 de v2).
- Discriminacion de dominio: responde en prosa a peticiones fuera de tema (chistes, aritmetica, capitales, recetas), con 8/8 en las pruebas del autor.
- Uso de funciones predefinidas del lenguaje como `length(list)`, `total(list, "field")` y `fixed(value, 2)`, y de comparaciones `===` y `!==`.
- Capacidad de activar componentes de UI concretos cuando la peticion los nombra explicitamente (Slider, Graph, y con matices Icon y Load).
- No consta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito ("thinking mode").
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente para `en`.

## Casos de uso

- Generacion de applets a partir de una idea en una frase: dado un texto como "un contador de los libros que leo este mes", el modelo produce un fichero `.dealui` completo con su semilla de estado y sus bloques de actualizacion. Es su proposito principal y el escenario donde se midieron todos los numeros de la model card.
- Generacion asistida de UI dentro de un host de applets: el fichero resultante se entrega directamente a un interprete DEAL que renderiza vistas y gestiona el estado, de modo que el modelo actua como capa de autoria sobre un runtime cerrado.
- Integracion en un servidor de inferencia con `llama-server`: sirviendo el GGUF Q8_0 con `--grammar-file deal-applet.gbnf` y `--ctx-size 8192`, el modelo queda accesible por API compatible con OpenAI para peticiones de un applet cada una.
- Prototipado rapido de paneles internos: para generar vistas de formulario o listas con estado local en herramientas internas, siempre que el componente deseado se nombre de forma explicita en el prompt.
- Filtrado de peticiones dentro de tema y fuera de tema: en un pipeline, el modelo puede separar las solicitudes que son ideas de applet de las que deben derivarse a un asistente generalista, gracias a su entrenamiento con negativos.
- Desarrollo de infraestructura de decodificacion restringida: el repositorio sirve como ejemplo reproducible de como combinar un LoRA pequeno, una gramatica GBNF y un brief de sistema para obtener salidas estructuradas con alta validez.
- Evaluacion y comparacion de estrategias de ajuste: por su documentacion detallada de checkpoints, prompts y temperaturas, resulta util como caso de estudio para medir el efecto del mensaje de sistema en modelos ajustados a un dominio.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre conjuntos retenidos de 27 applets y un conjunto fresco de 12 (todos medidos sobre el checkpoint 72 y el GGUF Q8_0):

| Configuracion | Retenido 27 | Fresco 12 |
|---|---|---|
| GBNF + brief, temperatura 0,6 | 25/27 | 12/12 |
| GBNF + brief, temperatura 0,3 | 22/27 | 12/12 |
| Solo GBNF, temperatura 0,6 | no disponible | 9/12 |
| Solo GBNF, temperatura 0,3 | no disponible | 10/12 |

Comparacion con el predecesor v2, mismo harness, prompts y semillas:

| Configuracion | v2 | v3 |
|---|---|---|
| Brief + gramatica, 0,6 | 20/27 y 9/12 | 25/27 y 12/12 |
| Brief + gramatica, 0,3 | 22/27 y 11/12 | 22/27 y 12/12 |
| Gramatica sin brief | 0/12 | no disponible |

Limite de dominio y componentes raros:

| Prueba | v2 | v3 |
|---|---|---|
| Ideas de applet sin system message ni gramatica | 0/4 | 4/4 |
| Peticiones fuera de tema respondidas en prosa | no disponible | 8/8 |
| Validez en nueve sondas, con brief a 0,6 | 6/9 | 9/9 |
| Validez en nueve sondas, sin mensaje de sistema a 0,6 | 0/9 | 8/9 |

Sobre los nueve componentes poco frecuentes, el propio autor declara que el objetivo no se cumplio: el modelo recurre al componente solicitado en 0-2 de 9 casos, y `Load` no aparece nunca de forma espontanea. Los restantes benchmarks habituales (MMLU, HumanEval, GSM8K) no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para el artefacto principal (GGUF Q8_0, 8,1 GB): alrededor de 10 GB de VRAM contando cache KV para 8192 tokens; es una estimacion, no un dato publicado.
- VRAM estimada para el GGUF F16 (15,2 GB): alrededor de 17-18 GB, tambien como estimacion.
- Si el adaptador se fusiona a fp16, el peso resultante corresponde a un modelo de ~7,6 B, con los requisitos habituales de esa categoria.
- GPU recomendadas: tarjetas de 24 GB (RTX 3090, RTX 4090, A10G, L4, A100 40 GB) para la variante Q8_0 con margen holgado; para F16, 24 GB justos o tarjetas de 40-80 GB (A100, H100).
- Cabe en GPU de consumo: si, la variante Q8_0 entra en tarjetas de 12-16 GB (por ejemplo RTX 4070 Ti, RTX 4060 Ti 16 GB) con contexto moderado; en 8 GB requeriria cuantizaciones mas agresivas que no se publican en este repo.
- Opciones de despliegue: `llama.cpp` / `llama-server` de forma nativa con GGUF y `--grammar-file` (metodo documentado por el autor, disponible en macOS, Linux y Windows); la fusion del adaptador a fp16 abre la puerta a vLLM, TGI u otros servidores, aunque no se documenta una receta concreta.
- Parametros de muestreo recomendados por el autor: `temperature` 0,6, `top_p` 0,95, `dry_multiplier` 0,8, `dry_base` 1,75, `dry_allowed_length` 8, `repeat_penalty` 1,05, `max_tokens` 4096.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-DEAL-v3 | ~7,6 B (LoRA rango 32) | no especificado (ejemplo a 8192) | 25/27 y 12/12 con gramatica y brief a 0,6 | apache-2.0 | HuggingFace (safetensors + GGUF) |
| qwen2.5-7b-deal-v2 | ~7,6 B (QLoRA) | no especificado | 20/27 y 9/12 con gramatica y brief a 0,6; 0/12 con gramatica sin brief | no especificada en la informacion disponible | HuggingFace (predecesor directo) |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | nativo del modelo base, no detallado en esta informacion | asistente generalista, sin metricas DEAL | apache-2.0 | HuggingFace |

No se dispone de otros modelos comparables de generacion de UI con decodificacion restringida por gramatica en la informacion proporcionada.

## Limitaciones y advertencias

- El autor reconoce que el objetivo de ensenar el uso espontaneo de nueve componentes poco usados (Slider, Icon, Spacer, Scroll, Store, QRCode, Graph, Image, Load) no se cumplio: el modelo los elige en 0-2 de 9 sondas, y `Load` nunca aparece de forma espontanea.
- Con el brief completo de 437 caracteres, algunos componentes empeoran: `Load` se interpreta como verbo y `Icon` cae hacia `Image`; la recomendacion practica es nombrar el componente en el prompt del usuario.
- La calidad depende criticamente de dos entradas externas al modelo (la gramatica GBNF y el brief de sistema); sin brief, el comportamiento medido es peor y en v2 equivalia a 0/12.
- La temperatura invertida respecto a v2 (v3 funciona mejor a 0,6 que a 0,3) implica revisar las configuraciones heredadas de hosts ya existentes.
- Riesgo de alucinacion estructural fuera de la gramatica: aunque GBNF hace irrepresentables muchas construcciones invalidas, un applet puede seguir siendo sintacticamente valido y semanticamente erroneo (por ejemplo, botones con despacho mal conectado).
- Idioma: el modelo esta etiquetado unicamente para ingles; no hay evidencia de comportamiento equivalente en castellano y el brief documentado esta en ingles.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base y de cualquier runtime DEAL o host de applets con el que se combine.
- Vocacion de dominio muy estrecha: no es un asistente general, no soporta tool calling, agentes, vision ni audio, y su uso fuera de la generacion de applets DEAL no esta respaldado por pruebas.
- Cifras de descargas y "likes" a cero en el momento de la consulta, lo que implica escasa validacion por parte de terceros.
- Las estimaciones de VRAM de esta ficha son calculos propios a partir de los tamanos de fichero publicados, no cifras ofrecidas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pashoktond1/qwen2.5-7b-deal-v3
- Predecesor v2: https://huggingface.co/pashoktond1/qwen2.5-7b-deal-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Gramatica GBNF incluida en el repo: `deal-applet.gbnf`
- Peso Q8_0: `gguf/qwen-deal-v3-q8_0.gguf` (8,1 GB)
- Peso F16: `gguf/qwen-deal-v3-f16.gguf` (15,2 GB)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web proporcionada (los resultados devueltos no guardan relacion con el modelo).
