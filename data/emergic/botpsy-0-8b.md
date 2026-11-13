# emergic/BotPsy-0.8B

## Resumen

BotPsy-0.8B es un modelo de lenguaje causal de 0,8 mil millones de parametros (852.985.920 pesos reales en safetensors) desarrollado por Tether AI Research (Tether Data, S.A. de C.V.) y especializado en *function calling* y flujos de trabajo agenticos. Se construye mediante un ajuste fino supervisado sobre Qwen3.5-0.8B y esta disenado explicitamente para despliegue en dispositivo (*on-device* / *edge*), con un perfil de "asistente personal" que invoca herramientas para tareas cotidianas: busqueda web, viajes, comercio, finanzas, control de dispositivos, gestion de documentos, calendario y correo.

Su relevancia actual radica en que demuestra que un modelo por debajo de los 1.000 millones de parametros puede alcanzar un rendimiento agentico competitivo: segun la model card, duplica aproximadamente la capacidad agentica de su modelo base (BFCL v4 pasa de 23,4 a 44,0; ACEBench de 30,1 a 58,7; τ-bench de 23,2 a 51,5) y supera a modelos de hasta 1,2B parametros en seis benchmarks de uso de herramientas, incluyendo a su hermano mayor Qwen3.5-2B-Think en cinco de ellos.

La arquitectura heredada de Qwen3.5 es hibrida: combina *Gated DeltaNet* con atencion con puerta (*gated attention*), lo que reduce el coste computacional del contexto largo. El modelo se distribuye en BF16 (safetensors) en este repositorio y en cuantizaciones GGUF (BF16, Q8_0 y Q4_K_M) en el repositorio oficial de Tether, bajo licencia Apache 2.0. Esta ficha describe la copia espejo `emergic/BotPsy-0.8B`, identica byte a byte al original salvo la nota de espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido: Gated DeltaNet + atencion con puerta (arquitectura Qwen3.5); uso solo texto |
| Parametros totales | 852.985.920 (0,8B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors); GGUF en BF16, Q8_0 y Q4_K_M (repositorio aparte) |
| Idiomas soportados | Ingles (recomendado); declarado `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF en repositorio separado |
| Modelo base | Qwen/Qwen3.5-0.8B (finetune) |
| Tamano del repositorio | 1,7 GB |
| Modo de razonamiento | Thinking mode (`enable_thinking=True`) |

## Arquitectura y entrenamiento

BotPsy-0.8B es un ajuste fino del modelo Qwen3.5-0.8B, que emplea una arquitectura hibrida de estado recurrente y atencion: *Gated DeltaNet* combinado con atencion con puerta. Esta mezcla busca reducir el coste de atencion en secuencias largas manteniendo la capacidad de recuperacion de informacion del transformer clasico. Aunque el modelo base es multimodal (etiqueta `image-text-to-text`), BotPsy se utiliza en modo solo texto.

El entrenamiento consiste en un ajuste fino supervisado orientado a uso de herramientas y razonamiento agentico, con el modelo operando en modo *thinking* (piensa antes de responder). La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion se remite al blog post de Tether. La innovacion principal no es arquitectonica sino de especializacion: el ajuste eleva de forma marcada la fiabilidad en la seleccion y ejecucion de herramientas, la abstencion cuando no existe herramienta adecuada y el cumplimiento de instrucciones, preservando ademas las capacidades de conocimiento general del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, con modo de razonamiento previo (*thinking mode*) activable mediante `enable_thinking=True`.
- *Tool calling* y *function calling*: seleccion y parametrizacion de herramientas en dominios de busqueda web, viajes, comercio, finanzas, operaciones de negocio, control de dispositivos y vehiculos, documentos, calendario y mensajeria.
- Flujos agenticos multi-turno: mantiene conversaciones largas, sigue politicas estrictas y actua en nombre del usuario (evaluado en τ-bench y τ²-bench).
- Razonamiento multi-paso y encadenamiento de herramientas.
- Abstencion calibrada: declina actuar cuando no existe herramienta adecuada (tests de alucinacion de BFCL v4) o cuando la peticion es incompleta o incorrecta (casos especiales de ACEBench).
- Seguimiento de instrucciones reforzado (IFEval, IFBench).
- Conocimiento general y razonamiento academico (MMLU-Pro, GPQA Diamond).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades de vision: no disponibles en este ajuste (se usa solo texto).

## Casos de uso

- Asistente personal en dispositivo: el modelo puede ejecutarse localmente en moviles o equipos de gama media y gestionar tareas cotidianas (calendario, correo, recordatorios) invocando herramientas del sistema, gracias a su tamano de 0,8B y a las cuantizaciones Q4_K_M para llama.cpp.
- Atencion al cliente automatizada multi-turno: su puntuacion de 82,5 en τ²-bench (telecom) y 51,5 en τ-bench lo hacen adecuado para agentes que deben seguir una politica estricta y actuar en nombre del cliente en retail, telecomunicaciones y banca.
- Agente de comercio y servicios: con puntuaciones multi-paso de 58,3 en comercio y servicios (la mejor de los modelos probados), sirve para flujos de compra, reservas y gestion de pedidos con varias llamadas a API encadenadas.
- Control de dispositivos y sistemas: su puntuacion de 46,1 en gestion de dispositivos y sistemas lo habilita para agentes que traducen ordenes en lenguaje natural a comandos de dispositivo o vehiculo.
- Busqueda web y research asistido: evaluado en BrowseComp-Plus (4,5), puede orquestar busquedas y sintesis de resultados en un pipeline agentico ligero.
- Automatizacion de oficina y documentos: gestion de archivos, extraccion de datos y generacion de respuestas de correo mediante *function calling*, con la ventaja de que el modelo cabe en memoria de un portatil.
- Prototipado de agentes en *edge*: util para desarrolladores que necesitan un agente funcional con latencia baja y sin dependencia de la nube, usando el SDK QVAC o llama.cpp.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todos los modelos se evaluaron en modo *thinking* con un arnes comun; BotPsy servido con vLLM desde los pesos BF16. Mejor puntuacion en negrita, segunda mejor subrayada (se indica entre parentesis).

| Benchmark | BotPsy-0.8B | Qwen3.5-0.8B-Think (base, 1x) | Qwen3.5-2B-Think (2,5x) | LFM2.5-1.2B-Think (1,5x) | MiniCPM5-1B-Think (1,25x) |
|---|---|---|---|---|---|
| BFCL v4 | 44,0 | 23,4 | 37,7 | no disponible | no disponible |
| ACEBench | 58,7 | 30,1 | 55,4 | no disponible | no disponible |
| τ-bench (media retail/telecom/banca) | 51,5 | 23,2 | 46,5 | no disponible | no disponible |
| ToolSandbox | 64,6 | no disponible | 41,2 | no disponible | no disponible |
| Claw-Eval | 46,5 | no disponible | 48,9 | no disponible | no disponible |
| BrowseComp-Plus | 4,5 | no disponible | 2,8 | no disponible | no disponible |
| τ²-bench (telecom) | 82,5 | no disponible | 69,3 | no disponible | no disponible |
| BFCL v4 multi-turno | 46,1 | 7,5 | 23,8 | no disponible | no disponible |
| BFCL v4 alucinacion | 86,1 | no disponible | no disponible | no disponible | no disponible |
| ACEBench casos especiales | 51,3 | 13,7 | no disponible | no disponible | no disponible |
| IFEval | 90,8 | 59,7 | no disponible | no disponible | no disponible |
| IFBench | 55,9 | 22,0 | no disponible | no disponible | no disponible |
| GPQA Diamond | 38,1 | 33,2 | no disponible | no disponible | no disponible |
| MMLU-Pro | 48,9 | 41,6 | no disponible | no disponible | no disponible |

La model card afirma que BotPsy supera a Qwen3.5-0.8B-Think, LFM2.5-1.2B-Think y MiniCPM5-1B-Think en los seis benchmarks agenticos evaluados, pero la tabla publicada solo muestra los valores completos de BotPsy y del modelo base; los resultados de LFM2.5 y MiniCPM5 no se detallan en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,7 GB de pesos (coincide con el tamano del repositorio); con overhead de activaciones y KV cache, unos 2-3 GB.
- VRAM estimada en Q8_0 GGUF: en torno a 0,9-1,0 GB.
- VRAM estimada en Q4_K_M GGUF: en torno a 0,5-0,6 GB.
- GPU recomendadas: cualquier GPU consumer moderna. Cabe holgadamente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 y en GPUs de portatil con 4-8 GB; tambien en aceleradores de borde y en CPU.
- Despliegue: vLLM (usado por el autor para los benchmarks), llama.cpp, Ollama, TGI y el SDK QVAC de Tether. Los GGUF estan en `qvac/BotPsy-0.8B-GGUFs`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento agentico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BotPsy-0.8B | 0,8B | no disponible | BFCL v4 44,0; ACEBench 58,7; τ-bench 51,5 | Apache 2.0 | Hugging Face (original y espejo), GGUF |
| Qwen3.5-0.8B-Think | 0,8B | no disponible | BFCL v4 23,4; ACEBench 30,1; τ-bench 23,2 | no disponible en la informacion | Hugging Face |
| Qwen3.5-2B-Think | 2B | no disponible | BFCL v4 37,7; ACEBench 55,4; τ-bench 46,5 | no disponible en la informacion | Hugging Face |
| LFM2.5-1.2B-Think | 1,2B | no disponible | inferior a BotPsy segun la model card (cifras no detalladas) | no disponible en la informacion | Hugging Face |
| MiniCPM5-1B-Think | 1B | no disponible | inferior a BotPsy segun la model card (cifras no detalladas) | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Modelo pequeno (0,8B): la propia model card advierte que comete errores y que es adecuado para tareas de dificultad baja a media; no debe usarse como agente autonomo en dominios de alto riesgo sin supervision.
- Riesgo de alucinacion: aunque obtiene 86,1 en los tests de alucinacion de BFCL v4 (la mejor puntuacion de los modelos probados), sigue siendo un modelo de 0,8B y puede inventar parametros o herramientas en casos limite.
- Idioma: solo ingles recomendado; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de trabajo con documentos largos.
- Multimodalidad: el modelo base es image-text-to-text, pero este ajuste se usa solo texto; no se debe asumir capacidad de vision.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y atribuciones (`ATTRIBUTIONS.md`).
- Repositorio espejo: `emergic/BotPsy-0.8B` es una copia sin modificaciones de `qvac/BotPsy-0.8B`; para dudas, issues o soporte debe consultarse el repositorio original.
- Sin datos de benchmarks propios: las cifras provienen del autor del modelo y no de una evaluacion independiente.

## Enlaces

- Modelo en Hugging Face (espejo): https://huggingface.co/emergic/BotPsy-0.8B
- Modelo original: https://huggingface.co/qvac/BotPsy-0.8B
- GGUF (BF16, Q8_0, Q4_K_M): https://huggingface.co/qvac/BotPsy-0.8B-GGUFs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog post de BotPsy: https://huggingface.co/blog/qvac/botpsy
- Coleccion BotPsy: https://huggingface.co/collections/qvac/botpsy
- Licencia: https://huggingface.co/qvac/BotPsy-0.8B/blob/main/LICENSE
- Tether AI Research: https://tether.io/
