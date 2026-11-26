# ChatLPO/qwen36-35b-a3b-travel-latam-mixed-qlora

## Resumen

`ChatLPO/qwen36-35b-a3b-travel-latam-mixed-qlora` es un derivado de ajuste fino del modelo multimodal `Qwen/Qwen3.6-35B-A3B` de Alibaba, especializado en planificacion de viajes y asistencia turistica para America Latina. Lo desarrolla el usuario ChatLPO (con infraestructura ClassMind/Lautum) mediante QLoRA de 4 bits sobre el modelo base, entrenado con 55.000 ejemplos de corpus regional y de planificacion de viajes en espanol latinoamericano (es-419), portugues brasileno (pt-BR) e ingles.

El modelo conserva la arquitectura MoE del Qwen3.6, con 35.951.822.704 parametros totales y unos 3.000 millones activos por token, repartidos en 256 expertos enrutados (top-8 activos) y una combinacion de 30 capas de atencion lineal Gated DeltaNet y 10 capas de atencion completa GQA. La ventana de contexto nativa es de 131.072 tokens, aunque el ajuste fino se realizo con `max_seq_length=2048`.

Su interes practico reside en que aplica un dominio vertical muy concreto (viajes LATAM, presupuestos en monedas locales, aclimatacion en altura, transit terrestre y aereo, cumplimiento de esquemas JSON para tool calling) sobre un modelo MoE de gran tamano, publicando pesos en FP8 con block-scaling dinamico `[128,128]` y un adaptador LoRA separado. La licencia Apache 2.0 permite uso comercial, pero el autor advierte explicitamente que no debe usarse sin grounding externo para datos en tiempo real (vuelos, tarifas, disponibilidad hotelera).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (MoE hibrida: 30 capas Gated DeltaNet linear-attention + 10 capas full GQA; 256 expertos enrutados, top-8 activos) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3.000 millones por token |
| Parametros entrenables (LoRA) | 926.187.520 en 240 tensores (r=16, alpha=32, scaling=2.0) |
| Longitud de contexto | 131.072 tokens (entrenado a `max_seq_length=2048`) |
| Tipos de cuantizacion | Pesos publicados en FP8 block-scaled dinamico `[128,128]`; adaptador QLoRA 4-bit NF4 fused-MoE; base disponible en BF16 |
| Idiomas soportados | es (es-419), pt (pt-BR), en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8, 37,50 GB en 9 shards) + `adapter/` (1,85 GB); repo total 39,3 GB |
| Dataset de entrenamiento | `latam-gpt/LatamGPT-Corpus-1.0`, `osunlp/TravelPlanner` |
| Metodo de adaptacion | SFT + 4-bit NF4 Fused-MoE QLoRA (`experts4bit-qlora >= 0.58`) |
| Commit base fijado | `345d467b117d1fd5eda9b879a5988de9ae5f47a7` |
| SHA-256 manifesto FP8 | `0d93d6edc65df60c28daab19b8013132d8b4af810b047ff97c519a6c54bae8a9` |
| SHA-256 manifesto BF16 | `77d6af5f89306e7042324eb8ac6b1cbbdbd88f1036afbea117bd9ffdd1f74ae9` |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer MoE hibrido: 40 capas en total, de las cuales 30 usan atencion lineal Gated DeltaNet (complejidad lineal respecto a la longitud de secuencia) y 10 usan atencion completa con GQA. El bloque MoE enruta cada token a 8 de 256 expertos, lo que mantiene el coste computacional de inferencia proximo al de un modelo denso de ~3B parametros pese a los ~36B totales. El modelo original es multimodal (`ForConditionalGeneration`, con una torre de vision de 27 capas), pero este derivado se entrena y se sirve en modo solo texto (`Qwen3_5MoeForCausalLM`), descartando la torre de vision.

El ajuste fino se realizo con QLoRA de 4 bits NF4 sobre los expertos fusionados (`experts4bit-qlora`), con r=16, alpha=32 y 926 millones de parametros entrenables. El corpus combina 55.000 ejemplos de `LatamGPT-Corpus-1.0` (dominio regional latinoamericano) y `TravelPlanner` (planificacion de viajes con restricciones), en es-419, pt-BR e ingles. El autor reporta paridad de merge: similitud coseno SwiGLU de 0,999996 en BF16 y 0,999021 en FP8 (minimo 0,998895, KL=4e-6), lo que indica que la publicacion FP8 introduce una distorsion numerica muy pequena respecto al merge BF16.

## Capacidades

- Generacion de texto multi-turno con contexto largo (hasta 131.072 tokens nativos) para conversaciones de planificacion de viajes.
- Razonamiento multi-paso con trazas `<think>` (parser `qwen3` en vLLM) y modo no-thinking desactivable via `chat_template_kwargs={"enable_thinking": False}`.
- Tool calling y function calling con cumplimiento de esquemas JSON (el autor reporta 62,5 % de precision de esquema e IATA en modo unguided).
- Sintesis de itinerarios con restricciones multiples (presupuesto, fechas, moneda, preferencias).
- Calculo de presupuestos en monedas locales: CLP, BRL, MXN, COP, PEN, ARS, USD.
- Planificacion de aclimatacion en altura (Cusco, San Pedro de Atacama, La Paz).
- Analisis de trade-offs entre transporte terrestre y aereo regional (Mercosur y region andina).
- Capacidades multilingues en es-419, pt-BR e ingles.
- Capacidad de abtencion ante falta de grounding (el autor reporta 62,5 % en probes de abstención y defensa frente a prompt injection indirecto via RAG).
- Capacidad multimodal heredada del base (torre de vision de 27 capas), aunque no se entrena ni se sirve en este derivado.

## Casos de uso

- **Asistente de agencia de viajes LATAM**: gestion de conversaciones multi-turno con contexto largo para refinar itinerarios, comparar alternativas y ajustar presupuesto en moneda local, aprovechando la ventana de 131.072 tokens para mantener historial extenso de preferencias del cliente.
- **Generacion de itinerarios con restricciones**: el modelo sintetiza planes que respetan simultaneamente fechas, presupuesto, moneda, tipo de transporte y preferencias; el autor reporta 76,39 % de satisfaccion de restricciones en 12 escenarios multi-restriccion.
- **Agente de tool calling para reservas**: integrable en pipelines con vLLM structured decoding (`guided_json`) para emitir JSON conforme a esquemas de busqueda de vuelos, hoteles y actividades; util para orquestar APIs de terceros con validacion estricta.
- **Planificacion de viajes de altura**: asistencia especifica para itinerarios en Cusco, San Pedro de Atacama o La Paz, con recomendaciones de aclimatacion y buffers temporales.
- **Presupuestacion multi-moneda**: calculo de costes en CLP, BRL, MXN, COP, PEN, ARS y USD, util para agencias que operan en varios paises de la region.
- **Atencion al cliente en portugues brasileno y espanol latinoamericano**: cobertura nativa de es-419 y pt-BR para mercados de Mercosur y region andina, sin depender de traduccion intermedia.
- **Backend de RAG turistico con defensa frente a injection**: el modelo muestra capacidad de abstenerse ante falta de grounding y de resistir prompt injection indirecto, adecuado para integrarse en pipelines RAG que recuperan contenido de terceros.
- **Generacion de contenido turistico regional**: redaccion de descripciones de destinos, guias y material promocional en es-419 y pt-BR con conocimiento del corpus LatamGPT.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Planificacion de viajes multilingue con restricciones (es-419 / pt-BR / en) | Lautum-Travel-LATAM-Holdout (12 escenarios multi-restriccion) | Constraint Satisfaction (%) | 76,39 |
| Retencion aritmetica y presupuesto multi-paso | Lautum-BudgetMath-GSM8K-Protocol (8 problemas) | Exact Match (%) | 50,00 |
| Tool calling agentico y cumplimiento de esquema JSON | Lautum-ToolSchema-Travel (8 esquemas, unguided) | Schema & IATA Accuracy (%) | 62,50 |
| Retencion de formato e instruction-following (unguided) | Lautum-IFEval-Protocol (6 restricciones estrictas) | Strict Prompt Accuracy (%) | 33,33 |
| Abtencion sin grounding y defensa frente a prompt injection indirecto via RAG | Lautum-Travel-Safety-RedTeam (8 probes adversariales y de abtencion) | Safety & Grounding Pass Rate (%) | 62,50 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este derivado ni comparaciones con el modelo base en las mismas tareas.

## Requisitos de hardware

- **VRAM para pesos FP8**: el checkpoint FP8 ocupa 37,50 GB en 9 shards; con `--language-model-only` se evitan ~8 GiB de la torre de vision, permitiendo servir en una sola GPU de 48 GB.
- **GPU recomendada por el autor**: NVIDIA L40S 48 GB (instancia `g6e.2xlarge`), con margen para cache KV de la atencion hibrida DeltaNet + GQA.
- **Alternativas de mayor capacidad**: A100 80 GB, H100 80 GB o H200 para mayor throughput y contextos largos; el modelo no cabe en GPUs consumer de 24 GB en FP8 ni en BF16.
- **Consumer GPU**: no cabe en RTX 4090 (24 GB) en FP8; requeriria cuantizaciones adicionales (GGUF/AWQ/GPTQ) que no estan publicadas en el repo.
- **Despliegue recomendado**: vLLM >= 0.19.0 con `--reasoning-parser qwen3 --language-model-only --trust-remote-code`; tambien carga via HuggingFace Transformers >= 5.2.0 con `Qwen3_5MoeForCausalLM`.
- **Structured decoding**: vLLM `guided_json` / `response_format={"type": "json_schema", ...}` para tool calling estricto; presupuestar `max_tokens >= 2048` cuando el modo thinking esta activo.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `ChatLPO/qwen36-35b-a3b-travel-latam-mixed-qlora` | 35,95B | ~3B | 131.072 | Apache 2.0 | Derivado QLoRA especializado en viajes LATAM; pesos FP8 + adaptador |
| `Qwen/Qwen3.6-35B-A3B` (base) | 35,95B | ~3B | 131.072 | Apache 2.0 | Modelo generalista multimodal; sin especializacion regional ni datos de viajes |
| Modelos densos de ~30-35B (familia Qwen, Llama, Mistral) | ~30-35B | ~30-35B | Variable | Variable | Mayor coste de inferencia por token al no ser MoE; sin especializacion LATAM |
| Modelos pequenos (7-14B) especializados en viajes | 7-14B | 7-14B | Variable | Variable | Menor capacidad de razonamiento multi-restriccion y de contexto largo |

No se dispone en la informacion proporcionada de comparaciones cuantitativas con alternativas en las mismas tareas de viajes LATAM.

## Limitaciones y advertencias

- Los benchmarks declarados por el autor no estan verificados de forma independiente (`verified: false`); tratarlos como orientativos.
- El rendimiento en instruction-following estricto es bajo (33,33 % en IFEval-Protocol unguided), lo que sugiere deriva respecto al modelo base en cumplimiento de formato.
- El cumplimiento de esquema JSON en modo unguided es del 62,5 %; en produccion conviene usar structured decoding (guided_json) para garantizar validez.
- El modelo no debe usarse sin grounding externo para horarios de vuelo, puertas de embarque, tarifas en vivo o disponibilidad hotelera.
- No debe usarse para decisiones migratorias, de visado, vacunacion, medicas, legales o financieras vinculantes, ni para ejecucion autonoma de pagos sin confirmacion humana.
- Riesgo de alucinacion en datos factuales de viajes (precios, horarios, requisitos de entrada) si se consulta sin herramientas.
- El ajuste fino se realizo con `max_seq_length=2048`; aunque la ventana nativa es de 131.072 tokens, el comportamiento mas alla de 2.048 tokens no ha sido validado por el autor.
- Cobertura linguistica limitada a es-419, pt-BR e ingles; no se declara soporte para otras variantes de espanol o portugues.
- La torre de vision del modelo base no se entrena ni se sirve en este derivado; las capacidades multimodales no estan garantizadas.
- Licencia Apache 2.0 permite uso comercial, pero el autor impone restricciones de uso en la model card (grounding obligatorio para datos en tiempo real, prohibicion de decisiones vinculantes sin humano).
- El modelo tiene muy pocas descargas (7) y 0 likes en el momento de la ficha; no hay evidencia de adopcion en produccion ni de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChatLPO/qwen36-35b-a3b-travel-latam-mixed-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset LatamGPT: https://huggingface.co/datasets/latam-gpt/LatamGPT-Corpus-1.0
- Dataset TravelPlanner: https://huggingface.co/datasets/osunlp/TravelPlanner
- Libreria `experts4bit-qlora`: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
