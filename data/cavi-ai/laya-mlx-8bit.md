# cavi-ai/laya-MLX-8bit

## Resumen

laya-MLX-8bit es una conversion a MLX del modelo Laya de convaiinnovations, un encoder de decisiones tipadas de 421.293.827 parametros que no genera texto libre. En lugar de producir tokens, recibe un estado (texto o JSON) y un conjunto de preguntas tipadas, y devuelve respuestas restringidas con probabilidades calibradas: elegir entre N opciones (`choice`), puntuar un nivel en una escala ordenada (`score`) o dar la probabilidad de un si/no (`noul`). La conversion la firma Sasan Sotoodehfar (CAVI AI) y esta pensada exclusivamente para Apple Silicon.

El repositorio empaqueta tres checkpoints: el raiz en ingles (ModernBERT-large, 28 capas, contexto de 512 tokens, 524 MB), la variante `multilingual/` (mmBERT-base, 22 capas, vocabulario de 256k, contexto de 1024, 569 MB) y `typed-decisions/` (ModernBERT-large, contexto de 1024, 524 MB). Los pesos estan cuantizados a 8 bits con cuantizacion afina y grupo de 32, mientras que embeddings de tokens, normas, embedding de tipo, scorer de opciones y la cabeza `act` se mantienen en float16.

Su relevancia actual es la de los llamados modelos "System 1": decisiones de enrutado, moderacion o clasificacion que se ejecutan en local, sin API en la nube y sin coste de generacion autorregresiva. Segun las mediciones del autor, una peticion con tres preguntas se responde en 12-46 ms en un Apple M5 Max, con una desviacion media de probabilidad de 0,0009 frente a la referencia en float32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large en raiz y typed-decisions; mmBERT-base en multilingual) con cabeza de decision no autorregresiva |
| Parametros totales | 421.293.827 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en el checkpoint raiz (head_max_len 192); 1024 tokens en multilingual y typed-decisions (head_max_len 256) |
| Tipos de cuantizacion | 8 bits afina, group size 32, en las capas lineales del encoder y de la cabeza de decision; embeddings de tokens, normas, embedding de tipo, option scorer y act head en float16. Solo se distribuye en 8 bits: a 4 bits el checkpoint multilingual cambiaba 3 de 25 respuestas de referencia |
| Idiomas soportados | ingles (checkpoint raiz) y multilingue (checkpoint multilingual, con 7 idiomas en las preguntas de referencia; no se detalla la lista completa) |
| Licencia | Apache-2.0 para pesos, tokenizer y ficheros de configuracion; MIT para el codigo en `laya/` |
| Formato de pesos | safetensors (formato MLX), acompanado de `config.json`, `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

Laya es un modelo no autorregresivo: no tiene decodificador ni genera texto. La arquitectura combina un encoder transformer (ModernBERT-large de 28 capas en los checkpoints en ingles, mmBERT-base de 22 capas y vocabulario de 256k en el multilingue) con una cabeza de decision que puntua opciones, y un renderizado de peticion que transforma estado y preguntas en una entrada unica. Todas las preguntas de una misma peticion se resuelven en un solo forward pass, lo que explica la latencia baja. El `config.json` transporta los ajustes de decision y las temperaturas incluidas (`temperature`, `temperature_by_options`), y el codigo de `laya/` (encoder ModernBERT de mlx-embeddings, cabeza de decision, renderizado y respuestas calibradas) no esta incluido en mlx-embeddings 0.1.0. La conversion parte de la revision `55cf4c4ebb4ebe31b2550e8bdf3bd21b99753851` del modelo base.

No hay informacion disponible en los materiales proporcionados sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base; esos detalles corresponden a convaiinnovations y no se detallan en la model card de esta conversion. La innovacion tecnica destacable es el propio paradigma de decision tipada con respuestas calibradas y el port a MLX: el autor reporta que el codigo MLX en float32 sobre CPU coincide con la referencia (ModernBertModel de `transformers` mas capas de cabeza en `torch.nn`, float32 en CPU) dentro de 2,5e-5 en cada logit de opcion, con identicos input ids.

## Capacidades

- Clasificacion con eleccion cerrada (`choice`): selecciona una opcion entre N, con criterios definidos como lista o como objeto opcion-descripcion, y devuelve probabilidades y `confidence`.
- Puntuacion ordinal (`score`): dado un listado ordenado de niveles, devuelve el nivel esperado y su distribucion de probabilidades; util para urgencia, severidad o sentimiento graduado.
- Decisiones booleanas calibradas (`noul`): devuelve la probabilidad de verdadero para preguntas si/no, con textos `true`/`false` opcionales.
- Decisiones tipadas multiples en una sola pasada: varias preguntas sobre el mismo estado se responden en un unico forward pass.
- Enrutado (`routing`): asignacion de un caso a un equipo, cola o flujo, tal como aparece en el ejemplo de la model card (billing, technical, sales).
- Moderacion (`moderation`): clasificacion de contenido segun criterios definidos por el desarrollador.
- Cobertura multilingue mediante el checkpoint `multilingual/`, con vocabulario de 256k y contexto de 1024 tokens.
- Entrada flexible: el estado puede ser texto plano o un objeto JSON.

No se documenta soporte de tool calling ni de function calling, ni capacidades de agente multi-step, ni vision, ni audio. Tampoco genera texto, por lo que no hay modo "thinking" ni cadena de razonamiento visible.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket y una pregunta `choice` con equipos como criterios, y devuelve la opcion con mayor probabilidad y su `confidence`. En el ejemplo de la model card, un caso de doble cobro se clasifica como "billing" con probabilidad 0,95 en el checkpoint raiz y 1,00 en el multilingue.
- Priorizacion de urgencia: con una pregunta `score` sobre niveles ("not urgent", "somewhat urgent", "very urgent"), se obtiene un nivel esperado y una distribucion utilizable como umbral configurable en un sistema de colas.
- Deteccion de intencion de reembolso: una pregunta `noul` devuelve la probabilidad de que el cliente este pidiendo un reembolso (0,89 en el ejemplo del autor), lo que permite activar flujos de facturacion sin generar texto.
- Moderacion de contenido en local: clasificacion contra criterios definidos por el equipo (categorias de abuso, spam, contenido sensible) en una sola pasada, sin enviar el contenido a una API externa.
- Clasificacion de feedback y encuestas: preguntas `choice` y `score` combinadas sobre el mismo texto para obtener tema, tono y severidad en una unica inferencia.
- Filtro previo a un LLM generativo: usar Laya como router barato que decide si una consulta necesita un modelo grande, con latencias de 12-46 ms por peticion que permiten ponerlo delante de cada entrada.
- Analisis multilingue de documentacion o mensajes de usuario con el checkpoint `multilingual/`, que amplia el contexto a 1024 tokens y cubre 7 idiomas en las pruebas de referencia.
- Clasificacion de decisiones tipadas en pipelines con estado estructurado: al aceptar JSON como estado, se puede adjuntar metadata (producto, plan, historial) y combinarla con el texto en la misma pregunta.

## Benchmarks y rendimiento

Resultados medidos por el autor de la conversion en un Apple M5 Max. La referencia es `transformers` ModernBertModel mas capas de cabeza en `torch.nn`, en float32 sobre CPU, cargada desde los checkpoints originales, con tokenizacion via `AutoTokenizer`.

| Comprobacion | raiz | `multilingual` | `typed-decisions` |
|---|---|---|---|
| Preguntas de referencia | 17 (ingles) | 25 (7 idiomas) | 17 (ingles) |
| Misma respuesta que la referencia PyTorch fp32 | 17/17 | 25/25 | 17/17 |
| Cambio medio de probabilidad frente a la referencia | 0,0009 | 0,0026 | 0,0008 |
| Cambio maximo de probabilidad frente a la referencia | 0,011 | 0,021 | 0,003 |
| Ejemplo de uso (departamento, probabilidad de reembolso) | billing 0,95 / 0,89 | billing 1,00 / 0,99 | billing 0,82 / 0,73 |

Comprobacion del port: el codigo MLX en float32 sobre CPU coincide con la referencia dentro de 2,5e-5 en cada logit de opcion, con identicos input ids. Una peticion con tres preguntas responde en 12-46 ms tras la carga.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon. El modelo esta en formato MLX y no incluye pesos GGUF ni integracion con CUDA.
- Memoria: cada checkpoint ocupa 524 MB (raiz y typed-decisions) o 569 MB (multilingual) en 8 bits; el repositorio completo pesa 1,6 GB. Cabe sobradamente en la memoria unificada de cualquier Mac Apple Silicon, incluidos equipos de gama base.
- Hardware de referencia en las mediciones: Apple M5 Max. Las cifras de 7-14 ms para decisiones cortas en un M3 Max provienen del runtime comunitario laya-mlx (repositorio de mizorewww), no de este repo. El sitio oficial de Laya menciona 33 ms en su version multilingue.
- GPU Nvidia: no aplica. No hay soporte de A100, H100 ni RTX 4090 en esta conversion.
- Despliegue: Python 3.12 con `pip install mlx-embeddings==0.1.0`, mas `snapshot_download` de `huggingface_hub` y carga mediante `from laya import load, predict`. No se documentan integraciones con vLLM, llama.cpp, TGI ni Ollama; al no ser un modelo generativo y depender de MLX, estas rutas no son intercambiables con esta conversion.
- Latencia: 12-46 ms por peticion con tres preguntas (M5 Max), tras la carga. No se proporcionan datos de throughput en peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| cavi-ai/laya-MLX-8bit | 421.293.827 | 512 (raiz), 1024 (multilingual y typed-decisions) | MLX, safetensors 8 bits | Apache-2.0 (pesos), MIT (codigo) | 17/17, 25/25 y 17/17 de coincidencia con la referencia fp32; 12-46 ms por peticion | HuggingFace, 21 descargas, 1 like |
| convaiinnovations/laya (modelo base) | no disponible en la informacion (el port usa 421.293.827) | no disponible | PyTorch, float32 | Apache-2.0 | Es la referencia de comparacion del port | HuggingFace |
| mizorewww/laya-mlx | no disponible | no disponible | MLX nativo | no disponible | 7-14 ms en decisiones cortas (M3 Max) | GitHub |
| Jev | no disponible | no disponible | no disponible | no disponible | no disponible | Citado por explainx.ai como modelo de decision tipada de la misma categoria |

No se dispone de datos de parametros, contexto ni licencia de las alternativas comunitarias mas alla de lo indicado. La comparacion con modelos generativos de proposito general no es pertinente: Laya no produce texto libre y su metrica relevante es la coincidencia con la referencia y la latencia, no MMLU o HumanEval.

## Limitaciones y advertencias

- No es un modelo generativo: no puede redactar respuestas, resumir ni mantener conversaciones. Solo responde a preguntas tipadas predefinidas.
- Las preguntas y sus criterios deben especificarse en cada peticion; el modelo no infiere que preguntas hacer.
- El cambio maximo de probabilidad frente a la referencia llega a 0,021 en el checkpoint multilingual, por lo que las probabilidades no son identicas a las del modelo en float32.
- Solo se distribuye cuantizado a 8 bits. El autor documenta que a 4 bits el checkpoint multilingual alteraba 3 de 25 respuestas de referencia, de modo que no hay una version de menor precision validada.
- Dependencia de plataforma: requiere Apple Silicon y MLX. No hay ruta oficial para CUDA, ROCm ni para runtimes de servidor convencionales, lo que limita su uso en produccion sobre infraestructura x86.
- La model card no detalla la composicion del dataset de entrenamiento del modelo base, por lo que no se pueden evaluar sesgos de origen ni cobertura real por idioma mas alla del checkpoint multilingue.
- El autor declara explicitamente que la conversion no esta afiliada ni respaldada por convaiinnovations.
- El modelo tiene 21 descargas y 1 like en el momento de la ficha: es un artefacto con muy poca validacion externa.
- No se documentan resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni evaluaciones de robustez o de sesgo.
- Licencia Apache-2.0 en pesos y configuracion, y MIT en el codigo `laya/`: el uso comercial esta permitido, pero conviene conservar los ficheros `LICENSE` y `laya/LICENSE` y la atribucion al modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cavi-ai/laya-MLX-8bit
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Codigo fuente del port MLX: https://github.com/cavi-ai/mlx-agent
- Sitio oficial de Laya: https://laya.convaiinnovations.com/
- Repositorio comunitario laya (sistema de decisiones no autorregresivo): https://github.com/NandhaKishorM/laya
- Runtime MLX alternativo: https://github.com/mizorewww/laya-mlx
- Analisis de latencia y memoria en Apple Silicon: https://modelfit.io/blog/laya-mlx-ollaya-decision-models-apple-silicon/
- Comparativa laya-MLX frente a Jev: https://explainx.ai/blog/laya-mlx-jev-alternative-on-device-mlx-2026
