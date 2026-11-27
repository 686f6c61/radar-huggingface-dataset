# HOWILLMAKEIT/ShopMaster-4B-SFT

## Resumen

ShopMaster-4B-SFT es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario HOWILLMAKEIT, orientado especificamente a la actuacion como agente de compras dentro de un entorno simulado (ShopSimulator). El modelo no es un asistente conversacional generalista: su objetivo es emitir llamadas a herramientas (`<tool_call>`) de forma fiable en un bucle multi-turno de navegacion, busqueda y compra de productos, minimizando errores de formato e invocaciones invalidas.

La relevancia de esta version concreta reside en su rol como punto de partida (cold start) para un pipeline de aprendizaje por refuerzo posterior de 100 pasos con GiGPO y DAPO, que da lugar al modelo final ShopMaster-4B. Este checkpoint intermedio (epoca 2) emplea una estrategia de "Action-Only SFT": se desactiva la cadena de pensamiento y solo se calcula la perdida sobre el segmento de accion de la llamada a herramienta, lo que reduce drasticamente las llamadas invalidas (del 19,9 % del modelo base al 1,1 %) a costa de un mayor numero de pasos por episodio.

El modelo conserva el backbone multimodal de Qwen3.5-4B (torre visual intacta tras el merge de LoRA), con 4.659.865.088 parametros totales, licencia Apache-2.0 y soporte de chino e ingles. Esta pensado para despliegue mediante SGLang, vLLM o Transformers, y su uso correcto exige `enable_thinking=False`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), con torre visual multimodal conservada |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto de evaluacion y servidor SGLang) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de ~4,66 mil millones de parametros con carcasa multimodal (image-text-to-text). Sobre el backbone de texto se entreno un LoRA con rango 16 y alpha 32 durante 2 epocas; posteriormente el adaptador se fusiono y se reescribio en la estructura de shards original del modelo base, preservando la torre visual sin modificar. Se anadio un `generation_config.json` con `eos_token_id: [248044, 248046]` para el control correcto del fin de turno y de la llamada a herramienta.

Los datos de entrenamiento proceden de 1.015 trayectorias exitosas recolectadas de DeepSeek-V4.1-Flash-1017 y verificadas con replay paso a paso en el entorno sin error (0 discrepancia). De ese conjunto se muestrearon 388 trayectorias de entrenamiento y 40 de validacion, estratificadas por longitud en 4 tramos. La innovacion central es el esquema Action-Only SFT: en cada turno se vacia el bloque `<think>` del asistente y la entropia cruzada se calcula unicamente sobre el segmento de accion del `<tool_call>`, lo que penaliza explicitamente las invocaciones mal formadas y libera presupuesto de contexto para las observaciones del entorno en conversaciones largas.

## Capacidades

- Generacion de llamadas a herramientas (`tool_call`) en formato estructurado, con parser compatible `qwen3_coder` en SGLang.
- Razonamiento multi-paso dentro de un bucle de agente: alterna observaciones del entorno y acciones durante episodios de varios turnos (media de 8,2 pasos por pregunta en evaluacion).
- Navegacion y busqueda de productos en un catalogo simulado, seleccion de variantes y finalizacion de compra.
- Operacion en modo sin cadena de pensamiento (`enable_thinking=False`), requisito tanto para inferencia como para reproduccion del entrenamiento RL.
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque el entrenamiento SFT se realizo sobre el backbone de texto.
- Soporte bilingue chino-ingles.
- Compatible con endpoints y con carga directa en SGLang, vLLM y Transformers; sirve como inicializacion para entrenamiento RL en veRL.

## Casos de uso

- Agente de compras en entorno simulado: el modelo ejecuta el bucle completo de buscar, comparar, seleccionar variante y confirmar pedido dentro de ShopSimulator, con una tasa de exito estricto del 58,34 % en Holdout-915, lo que lo hace adecuado para investigacion de agentes y para generar trayectorias sinteticas.
- Cold start para RL: al ser un checkpoint intermedio con LoRA fusionado y `generation_config` corregido, se puede cargar directamente como politica inicial en veRL para continuar el entrenamiento con GiGPO y DAPO durante los 100 pasos que producen el modelo final.
- Generacion de datos de entrenamiento: sus trayectorias, filtradas por exito, pueden emplearse para ampliar el corpus de SFT o para entrenar modelos evaluadores de agentes.
- Evaluacion de robustez de tool calling: con solo un 1,1 % de llamadas invalidas frente al 19,9 % del base, sirve como referencia para medir la calidad del formato de herramientas en pipelines de agentes.
- Investigacion sobre perdida enmascarada: el esquema Action-Only permite estudiar el efecto de supervisar solo acciones frente a supervisar tambien el razonamiento, comparando con el modelo base y con la version RL.
- Prototipado de asistentes de catalogo en chino e ingles: para entornos controlados donde las herramientas esten bien definidas y el dominio sea acotado, el modelo puede integrarse en un orquestador que valide y ejecute las llamadas.
- Benchmark interno de agentes de compra: Holdout-915, con 915 preguntas y metricas de exito estricto, compra y precision de pedido, constituye un banco de pruebas reproducible para comparar variantes.

## Benchmarks y rendimiento

Evaluacion sobre Holdout-915 con temperatura 0,0 y contexto de 32K, segun la model card:

| Modelo | Validas | Exito estricto | Puntuacion media | Tasa de compra | Precision de pedido | `repeat_loop` | `invalid_tool` | Pasos/pregunta | Tokens generados/pregunta |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen/Qwen3.5-4B (Instruct, sin thinking) | 906/915 | 35,10 % (318) | 0,382 | 74,83 % | 46,90 % | 19 (2,1 %) | 182 (19,9 %) | 4,5 | 311 |
| ShopMaster-4B-SFT (ep2, este modelo) | 905/915 | 58,34 % (528) | 0,607 | 84,75 % | 68,84 % | 124 (13,6 %) | 10 (1,1 %) | 8,2 | 267 |
| ShopMaster-4B (+100 pasos GiGPO + DAPO) | 911/915 | 65,75 % (599) | 0,675 | 91,11 % | 72,17 % | 63 (6,9 %) | 7 (0,8 %) | 6,7 | 226 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, en FP16 el modelo de 4,66 mil millones de parametros requiere aproximadamente 9,3 GB solo para pesos, mas cache KV para 32K de contexto; en cuantizaciones de 8 bits o 4 bits el peso baja a rangos de ~5 GB y ~2,5-3 GB respectivamente (estimaciones por tamano, no publicadas por el autor).
- GPU recomendadas: no especificadas por el autor. Para servicio con SGLang a 32K de contexto se recomienda una GPU con al menos 24 GB (A10G, L4 de 24 GB, RTX 4090) para FP16 con margen para cache KV; A100 o H100 para mayor concurrencia.
- Viabilidad en GPU de consumo: probable en RTX 4090 (24 GB) en FP16 para una sola peticion con contexto amplio, y en GPUs de 16 GB solo con cuantizacion.
- Opciones de despliegue: SGLang (comando documentado con `--context-length 32768` y `--tool-call-parser qwen3_coder`), vLLM, Transformers y como politica inicial en veRL. No se documenta soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exito estricto (Holdout-915) | `invalid_tool` | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| ShopMaster-4B-SFT | 4,66 B | 32K | 58,34 % | 1,1 % | Apache-2.0 | Hugging Face (135 descargas) |
| ShopMaster-4B (RL) | 4,66 B | 32K | 65,75 % | 0,8 % | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4,66 B | no disponible en la informacion | 35,10 % | 19,9 % | Apache-2.0 | Hugging Face |

No se dispone de datos de otros agentes de compra comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en el dominio de ShopSimulator: fuera de ese entorno o de esquemas de herramientas muy similares, su rendimiento cae y no debe tratarse como un asistente generalista.
- Requiere `enable_thinking=False`; usarlo con cadena de pensamiento activa se aparta del regimen de entrenamiento y puede degradar la calidad de las llamadas.
- Tasa de `repeat_loop` elevada: 13,6 % (124 casos), superior al 6,9 % del modelo final y al 2,1 % del base. Es el principal defecto conocido de este checkpoint y la razon por la que el autor recomienda el modelo RL como opcion por defecto.
- Mayor coste por episodio: 8,2 pasos y 267 tokens generados de media por pregunta, frente a 4,5 pasos del base, lo que incrementa la latencia y el consumo en produccion.
- Idiomas limitados a chino e ingles; no hay evidencia de comportamiento correcto en castellano.
- Riesgo de alucinacion de productos, precios o identificadores no presentes en el catalogo; el entorno de evaluacion valida contra el simulador, pero en produccion real seria necesario un validador externo.
- Sesgos: no documentados por el autor; al entrenarse sobre trayectorias de un unico profesor (DeepSeek-V4.1-Flash-1017) puede heredar sus sesgos de seleccion de productos y de estrategia de compra.
- Licencia Apache-2.0, que permite uso comercial, pero condicionada a los terminos del modelo base Qwen/Qwen3.5-4B; conviene revisar dichos terminos antes de un despliegue comercial.
- Modelo con muy poca adopcion (1 like, 135 descargas) y sin validacion independiente; los resultados de la tabla proceden unicamente de la model card del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HOWILLMAKEIT/ShopMaster-4B-SFT
- Modelo final RL: https://huggingface.co/HOWILLMAKEIT/ShopMaster-4B
- Repositorio GitHub: https://github.com/HOWILLMAKEIT/ShopMaster-4B
- Pagina del proyecto: https://howillmakeit.github.io/ShopMaster-4B/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
