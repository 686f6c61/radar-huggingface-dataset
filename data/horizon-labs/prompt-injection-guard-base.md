# Horizon-Labs/prompt-injection-guard-base

## Resumen

Prompt Injection Guard (base) es un clasificador de texto desarrollado por Horizon-Labs que detecta intentos de inyeccion de prompt (directa) y jailbreak en mensajes de usuario, asi como inyecciones indirectas plantadas en contenido no confiable que lee un agente de IA: correos, paginas web, documentos, fragmentos de RAG y salidas de herramientas o APIs. Devuelve dos etiquetas: `benign` (0) e `injection` (1). Se distribuye bajo licencia Apache-2.0 y sin gate, y esta afinado a partir del backbone multilingue `jhu-clsp/mmBERT-base`, de la familia ModernBERT.

El modelo cuenta con 307.531.778 parametros (aproximadamente 308M) y una ventana de contexto de 8.000 tokens, con soporte para ventana deslizante en documentos mas largos. Su propuesta de valor se centra en distinguir instrucciones dirigidas al modelo de simples palabras "sospechosas": esta entrenado con documentos realistas de 45 tipos con inyecciones plantadas y sus versiones limpias equivalentes, lo que reduce las falsas alarmas en textos benignos que contienen terminos disparadores (0,909 en NotInject y 0,992 en OR-Bench-hard, segun el autor).

Es relevante ahora porque los agentes basados en LLM consumen cada vez mas contenido externo y llaman a herramientas, lo que amplia la superficie de ataque de la inyeccion indirecta. El modelo cabe en cualquier entorno (PyTorch, ONNX en fp32 e int8, y transformers.js en el navegador) y cubre 30 idiomas en datos de entrenamiento sinteticos, lo que lo hace util como guardrail de bajas latencias en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (backbone mmBERT) |
| Parametros totales | 307.531.778 (aprox. 308M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.000 tokens (ventana deslizante para entradas mayores) |
| Tipos de cuantizacion | fp32 (ONNX), int8 (ONNX `model_quantized.onnx`), q8 en transformers.js |
| Idiomas soportados | Multilingue; codigos declarados: en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id, th; datos sinteticos de entrenamiento en 30 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`, `onnx/model_quantized.onnx`), compatible con transformers.js |

Otros datos: pipeline `text-classification`, tamano del repositorio 3,1 GB, etiquetas `benign` (0) e `injection` (1), autor Horizon-Labs, fecha de creacion 2026-09-23, actualizacion 2026-09-23, 0 descargas y 0 likes en el momento del registro.

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencia basado en un encoder transformer de tipo ModernBERT. Parte del backbone multilingue `jhu-clsp/mmBERT-base` (tambien disponible en variante cuantizada), lo que le aporta representaciones multilingues y una ventana de contexto de 8.000 tokens. La cabeza de clasificacion produce dos logits correspondientes a `benign` e `injection`. Al ser un encoder sin decodificacion autoregresiva, no dispone de cache KV y su coste de inferencia depende del numero de tokens de entrada.

El entrenamiento se apoya en fuentes con licencias permisivas: `neuralchemy/Prompt-injection-dataset`, `S-Labs/prompt-injection-dataset`, `microsoft/llmail-inject-challenge`, `hendzh/PromptShield`, `TrustAIRLab/in-the-wild-jailbreak-prompts`, `nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1`, `3nesdeniz/agentic-prompt-injection-5k`, `rgeada/tool-response-injections`, `OpenAssistant/oasst2`, `CohereLabs/aya_dataset`, `HuggingFaceFW/fineweb-edu` y `HuggingFaceFW/fineweb-2`. Segun el autor, se generaron datos sinteticos en 30 idiomas y se cubrieron 45 tipos de documento con inyecciones plantadas y sus contrapartidas limpias. Los conjuntos de evaluacion se deduplicaron respecto a los datos de entrenamiento. La innovacion principal es el enfoque "agent-oriented": el clasificador busca instrucciones dirigidas a la IA, no vocabulario amenazante, lo que incluye inyecciones educadas u ocultas en comentarios HTML y notas falsas atribuidas al usuario. No se detalla en la informacion disponible si hubo fases de RLHF o DPO, ni el numero exacto de tokens de entrenamiento.

## Capacidades

- Clasificacion binaria de texto en `benign` o `injection`, con puntuacion de probabilidad.
- Deteccion de inyeccion directa: anulacion de instrucciones, mensajes falsos de sistema o desarrollador, trucos de delimitadores.
- Deteccion de jailbreak: personajes, modo desarrollador y encuadres hipoteticos para eludir las reglas del modelo.
- Deteccion de extraccion de system prompt.
- Deteccion de inyeccion indirecta en documentos y salidas de herramientas (exfiltracion de datos, envio de correos, llamadas a herramientas, insercion de enlaces), incluidas variantes educadas u ocultas.
- Procesamiento de entradas largas de hasta 8.000 tokens, con soporte de ventana deslizante (`window`/`stride`) para textos mayores.
- Capacidad multilingue sobre 20 codigos de idioma declarados y datos sinteticos en 30 idiomas.
- Ejecucion en PyTorch, ONNX Runtime (fp32 e int8) y transformers.js en el navegador.
- No incorpora generacion de texto, tool calling, razonamiento multi-paso ni vision: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada en chatbots: interceptar el mensaje del usuario antes de enviarlo al LLM principal y bloquear intentos de anulacion de instrucciones o extraccion del system prompt, con umbral ajustable (por ejemplo 0,5) segun el nivel de riesgo aceptado.
- Seguridad de agentes sobre contenido no confiable: escanear correos, paginas web descargadas, documentos y fragmentos de RAG antes de que el agente los lea, sustituyendo el contenido por un aviso de cuarentena cuando la puntuacion supere el umbral.
- Proteccion frente a inyecciones en respuestas de herramientas: aplicar el clasificador a la salida de APIs y funciones (el modelo se entreno sobre `rgeada/tool-response-injections`) para evitar que una respuesta maliciosa redirija al agente.
- Guardrail en pipelines RAG: puntuar cada fragmento recuperado y descartar o marcar los que contengan instrucciones dirigidas al modelo, reduciendo el riesgo de secuestro del contexto en sistemas de pregunta-respuesta documental.
- Pre-filtro de moderacion de contenido: separar solicitudes problematicas sin intento de anulacion (que corresponden a un clasificador de seguridad aparte) de los ataques reales de inyeccion, evitando que el moderador de contenido se sature con falsos positivos.
- Monitorizacion y telemetria de seguridad: registrar la probabilidad de inyeccion por peticion para detectar campanas de jailbreak o patrones de ataque recurrentes en produccion.
- Despliegue en el navegador o en el borde: usar la variante ONNX int8 o transformers.js (`dtype: "q8"`) para clasificar texto localmente sin enviar datos sensibles a un servidor.
- Filtrado multilingue en plataformas internacionales: aprovechar la cobertura de 20 codigos de idioma para aplicar el mismo guardrail en mercados con varios idiomas sin desplegar clasificadores separados.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a la seccion de "sobre-defensa" (a mayor valor, menos falsas alarmas), calculados con el mismo script y umbral por defecto de 0,5. Las entradas largas se puntuan con ventana deslizante (maximo sobre ventanas; 512 tokens para las lineas base basadas en DeBERTa). La informacion disponible esta truncada en la fila de OR-Bench-hard-1k, por lo que solo se reproducen las filas completas:

| Conjunto de evaluacion | prompt-injection-guard-base | small (141M) | ProtectAI v2 | deepset | PIGuard | Prompt Guard 2 86M | Prompt Guard 2 22M | Wolf Defender | NeuralTrust small |
|---|---|---|---|---|---|---|---|---|---|
| NotInject (accuracy) | 0,909 | 0,861 | 0,563 | 0,286 | 0,885 | 0,953 | **0,994** | 0,920 | 0,944 |
| XSTest (accuracy) | **1,000** | **1,000** | **1,000** | **1,000** | **1,000** | **1,000** | **1,000** | 0,964 | 0,720 |
| OR-Bench-hard-1k (accuracy) | datos truncados en la informacion disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

En el texto introductorio de la model card el autor cifra en 0,992 la exactitud sobre OR-Bench-hard, pero la tabla con el detalle esta incompleta en la informacion proporcionada. No se han publicado en la informacion disponible resultados de benchmarks clasicos como MMLU, HumanEval o GSM8K, ya que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 1,23 GB en fp32, 0,62 GB en fp16/bf16 y 0,31 GB en int8. La version ONNX cuantizada ocupa la mitad que la ONNX fp32, segun el autor, y mantiene las mismas decisiones.
- Al ser un encoder sin cache KV, la memoria adicional procede de las activaciones y crece con la longitud de secuencia y el tamano de lote; con 8.000 tokens conviene ajustar el lote.
- Cabe sin problema en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 4060, RTX 4090) es suficiente incluso en fp32; en fp16 o int8 bastan 1-2 GB.
- Tambien puede ejecutarse en CPU para cargas moderadas y en el navegador mediante transformers.js con cuantizacion `q8`.
- GPU para despliegue a gran escala: A100, H100, L40S o T4 son mas que suficientes; el cuello de botella sera el throughput por lote, no la memoria.
- Opciones de despliegue: `transformers` (pipeline de clasificacion), ONNX Runtime, transformers.js, y el tag `text-embeddings-inference` sugiere compatibilidad con TEI y con endpoints gestionados.
- Latencia y throughput: no disponible. El autor solo indica que el modelo es "rapido", sin cifras de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NotInject (accuracy) | XSTest (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Horizon-Labs prompt-injection-guard-base | 308M | 8.000 tokens | 0,909 | 1,000 | Apache-2.0 | HuggingFace, ONNX, transformers.js |
| Horizon-Labs prompt-injection-guard-small | 141M | no disponible | 0,861 | 1,000 | no disponible | HuggingFace |
| Meta Prompt Guard 2 86M | 86M | no disponible | 0,953 | 1,000 | no disponible | HuggingFace |
| Meta Prompt Guard 2 22M | 22M | no disponible | 0,994 | 1,000 | no disponible | HuggingFace |
| ProtectAI v2 | no disponible | no disponible | 0,563 | 1,000 | no disponible | HuggingFace |
| deepset (detector de inyeccion) | no disponible | no disponible | 0,286 | 1,000 | no disponible | HuggingFace |
| PIGuard | no disponible | no disponible | 0,885 | 1,000 | no disponible | HuggingFace |
| Wolf Defender | no disponible | no disponible | 0,920 | 0,964 | no disponible | HuggingFace |
| NeuralTrust small | no disponible | no disponible | 0,944 | 0,720 | no disponible | HuggingFace |

Salvo el modelo base y la variante small, los parametros, el contexto y las licencias de los competidores no se especifican en la informacion proporcionada, por lo que se marcan como no disponibles. En NotInject, Prompt Guard 2 22M obtiene el mejor resultado (0,994) y Prompt Guard 2 86M (0,953) supera a este modelo (0,909); en XSTest el modelo, la variante small, ProtectAI v2, deepset, PIGuard y Prompt Guard 2 empatan en 1,000. Destaca el mejor equilibrio de este modelo frente a ProtectAI v2 y deepset en falsas alarmas, y frente a NeuralTrust small en XSTest. La comparativa de rendimiento en deteccion de ataques (no solo sobre-defensa) no esta disponible porque la tabla original aparece truncada.

## Limitaciones y advertencias

- Es un clasificador, no un modelo generativo: no responde a peticiones ni ejecuta acciones; solo etiqueta texto.
- Las solicitudes daninas sin intento de anulacion (por ejemplo "como abrir una cerradura") se etiquetan deliberadamente como `benign`; para eso hace falta un clasificador de seguridad de contenido aparte.
- Riesgo de falsos positivos y falsos negativos: los umbrales son configurables y el autor recomienda ajustarlos, pero no se publican curvas de precision-recall ni tasas de error por idioma.
- Puede confundirse con documentos que contienen instrucciones para humanos o que simplemente discuten la inyeccion de prompt; el propio autor reconoce este diseno.
- Riesgo de evasion: un atacante novel puede redactar la inyeccion de forma que no active al clasificador; conviene combinarlo con defensas en profundidad.
- Cobertura idiomatica desigual: aunque se declaran 20 codigos y datos sinteticos en 30 idiomas, no se aportan metricas de precision por idioma, por lo que el rendimiento fuera del ingles puede degradarse.
- Contexto limitado a 8.000 tokens por pasada; para documentos mayores hay que usar ventana deslizante y agregar por maximo, lo que puede omitir inyecciones diluidas en textos muy largos.
- Parte de los datos de evaluacion (los marcados con asterisco en la model card) proviene del mismo generador que los datos de entrenamiento, por lo que sus resultados estan inflados y no son comparables con conjuntos externos.
- Licencia Apache-2.0, sin gate, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de la propia licencia (atribucion, aviso de cambios).
- Los metadatos indican 0 descargas y 0 likes en el momento del registro, y el repositorio se creo y actualizo el mismo dia: se trata de un lanzamiento muy reciente sin validacion independiente publica.
- La busqueda web realizada no devolvio ningun resultado relacionado con Horizon-Labs; los enlaces obtenidos corresponden a entidades homonimas (partido politico Horizons, Meta Horizon, la saga Horizon y el programa Horizon Europe) y no son pertinentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Horizon-Labs/prompt-injection-guard
- Variante small (141M): https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Conjuntos de datos de entrenamiento:
  - https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset
  - https://huggingface.co/datasets/S-Labs/prompt-injection-dataset
  - https://huggingface.co/datasets/microsoft/llmail-inject-challenge
  - https://huggingface.co/datasets/hendzh/PromptShield
  - https://huggingface.co/datasets/TrustAIRLab/in-the-wild-jailbreak-prompts
  - https://huggingface.co/datasets/nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1
  - https://huggingface.co/datasets/3nesdeniz/agentic-prompt-injection-5k
  - https://huggingface.co/datasets/rgeada/tool-response-injections
  - https://huggingface.co/datasets/OpenAssistant/oasst2
  - https://huggingface.co/datasets/CohereLabs/aya_dataset
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Paper, blog o repositorio adicional: no disponible (la busqueda web no devolvio resultados relacionados con este modelo).
