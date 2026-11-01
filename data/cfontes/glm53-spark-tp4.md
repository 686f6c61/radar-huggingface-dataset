# cfontes/glm53-spark-tp4

## Resumen

GLM-5.3 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Z.ai, con 753 mil millones de parametros totales. Esta ficha describe `cfontes/glm53-spark-tp4`, un kit de despliegue reproducible que permite servir el modelo base en cuatro NVIDIA DGX Spark (GB10) con 512 GB de memoria unificada agregada, empleando una cuantizacion EXL3 MixedK de 3,38 bits por peso. El repositorio incluye los pesos cuantizados, un motor TensorFold parcheado, un drafter DFlash2 para decodificacion especulativa y un sistema de cache de prefijos KV incremental.

El problema que resuelve es concreto: GLM-5.3 en BF16 no cabe en cuatro Sparks, pero a 3,38 bpw si, dejando espacio para una cache KV de 1.048.576 tokens. La contribucion tecnica principal es el cache de prefijos KV incremental, que hace que el coste por turno en conversaciones agente multi-turno sea constante en lugar de crecer linealmente con el historial (de O(n²) a O(n)), con aceleraciones medidas de hasta 4,4x en el sexto turno de una sesion agente.

Es relevante ahora porque demuestra que un modelo de 753B puede servirse en hardware de escritorio de gama alta (cuatro estaciones DGX Spark) con contexto de un millon de tokens y latencias utilizables, algo que hasta hace poco requeria clusters de GPUs de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (glm_moe_dsa) |
| Parametros totales | 753 mil millones (modelo base GLM-5.3) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | EXL3 MixedK 3,38 bpw (3 bits); cache KV en fp8 latente |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (licencia propia de Z.ai, marcada como "other") |
| Formato de pesos | safetensors (58 shards, 297,1 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 753B parametros de Z.ai, identificado en los tags como `glm_moe_dsa`. La cuantizacion EXL3 MixedK de 3,38 bits por peso es una compresion post-entrenamiento realizada por el autor del pack (vcruz305), con una fidelidad declarada de KL 0,0948, acuerdo top-1 del 92,98% y un incremento de perplejidad del 2,1% respecto al modelo original. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

La innovacion tecnica del kit de despliegue es el cache de prefijos KV incremental. El diseno exige que el chunking de prefill sea funcion unicamente de la posicion: el codigo original dimensionaba los chunks a partir de la longitud total del prompt, de modo que dos peticiones de distinta longitud calculaban las mismas filas de prefijo con teselado diferente y el KV heredado no coincidia con el de una ejecucion en frio. La solucion combina chunking de rejilla fija con un limite en la frontera canonica de prefill, sin reutilizar nunca filas escritas durante decodificacion, lo que hace la reutilizacion exacta. Se puede desactivar con `TF_GLM53_PREFIX_CACHE=0`, restaurando la ruta previa byte-identica. Ademas, la decodificacion especulativa usa un drafter DFlash2 con profundidad de hasta 13 y aceptacion relajada `top2`; el pack de pesos no incluye capa MTP, por lo que el drafter es un checkpoint separado.

## Capacidades

- Generacion de texto en prosa, codigo y salida estructurada (JSON y similares), con throughput medido distinto por carga: 55,7 tok/s en prosa, 69,2 tok/s en codigo y 73,6 tok/s en estructurado.
- Razonamiento matematico de alta precision: 96,7% en GSM8K completo (1.271 de 1.315 respuestas comprometidas).
- Razonamiento cientifico de nivel experto: 87,8% en una muestra estratificada de 50 preguntas de GPQA-Diamond (36 de 41 comprometidas).
- Modo de razonamiento con presupuesto de pensamiento (`thinking_budget`), necesario para cargas de razonamiento.
- Soporte de contexto largo de hasta 1.048.576 tokens, con cache de prefijos que abarata las sesiones multi-turno.
- Capacidad de servir como backend compatible con la API de OpenAI (`/v1/chat/completions`) en el endpoint `http://<rank0>:8300/v1` con id de modelo `glm-5.3-exl3`.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Sesiones agente de largo recorrido: el cache de prefijos KV mantiene el coste por turno constante, con 4,4x de aceleracion en el sexto turno de una conversacion que acumula 15.930 tokens. Adecuado para agentes que iteran sobre un mismo contexto durante decenas de pasos.
- Analisis de repositorios o documentos extensos: con 1M de tokens de contexto, el modelo puede ingerir codebases completas o expedientes largos en una sola ventana, y el cache evita re-prefijar en cada pregunta de seguimiento.
- Generacion de codigo en produccion: 69,2 tok/s en carga de codigo y buen rendimiento en tareas estructuradas lo hacen apto para pipelines de generacion y revision, siempre en regimen de una peticion concurrente por lane.
- Razonamiento matematico y cientifico asistido: GSM8K al 96,7% y GPQA-Diamond al 87,8% permiten usarlo como asistente de verificacion en dominios tecnicos, con `thinking_budget` configurado.
- Despliegue on-premise con soberania de datos: cuatro DGX Spark en una sola red QSFP/RoCE permiten servir un 753B sin depender de la nube, util para entornos con requisitos de confidencialidad.
- Investigacion sobre cuantizacion extrema y serving de MoE: el kit es reproducible (`fetch_weights.sh`, `serve.sh`, `verify.sh`) y sirve como banco de pruebas para estudiar el impacto de 3,38 bpw en calidad y latencia.
- Prototipado de aplicaciones con contexto de un millon de tokens: la extension de un prompt de 19.215 tokens con una sola palabra pasa de 46,4 s en frio a 0,41 s con reutilizacion, lo que hace viable la iteracion interactiva sobre contextos enormes.

## Benchmarks y rendimiento

Calidad:

| Benchmark | Resultado | Metodo |
|---|---|---|
| GSM8K (completo, 1.319) | 96,7% (1.271 / 1.315 comprometidas) | `runeval.py`, T=0 |
| GPQA-Diamond (estratificado, 50) | 87,8% (36 / 41 comprometidas) | T=0,6, `thinking_budget=12000` |

Nota del autor: en GPQA se responden 41 de 50; las 9 restantes son degeneraciones en bucles de repeticion en items dificiles de fisica y quimica, detectadas por el detector de bucles y no descartadas silenciosamente.

Throughput de decodificacion (320 tokens nuevos, temperatura 0, n=6, p50, cuatro Sparks, TP4, DCP=4, DFlash2):

| Carga | tok/s |
|---|---:|
| Prosa | 55,7 |
| Codigo | 69,2 |
| Estructurado | 73,6 |

Cache de prefijos incremental (conversacion agente de seis turnos, ~2,7k tokens por turno):

| Turno | Tokens de prompt | En cache | Tiempo por turno | Baseline sin cache | Aceleracion |
|---:|---:|---:|---:|---:|---:|
| 1 | 2.670 | 0 | 13,0 s | 15,5 s | 1,2x |
| 3 | 7.974 | 5.120 | 17,2 s | 44,5 s | 2,6x |
| 5 | 13.278 | 10.240 | 17,7 s | 72,0 s | 4,1x |
| 6 | 15.930 | 12.288 | 19,4 s | 85,3 s | 4,4x |

Extension de un prompt de 19.215 tokens con una palabra: 46,4 s en frio frente a 0,41 s con 19.212 tokens reutilizados.

## Requisitos de hardware

- VRAM/memoria: 512 GB de memoria unificada agregada (4x DGX Spark GB10 de 128 GB cada una). Los pesos ocupan 297,1 GiB en 58 shards; el resto queda para cache KV fp8 latente y overhead del motor.
- GPU recomendadas: cuatro NVIDIA DGX Spark (GB10) conectadas por un switch QSFP con RoCE. No se documenta soporte para A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: no en el sentido habitual; requiere cuatro estaciones DGX Spark, no una GPU consumer individual.
- Topologia: tensor parallel 4, decode context parallel 4 (la posicion `p` reside en el rank `p % 4`).
- Opciones de despliegue: motor TensorFold parcheado incluido en el repositorio, con `serve.sh` como lanzador; endpoint compatible con la API de OpenAI. No se documenta vLLM, llama.cpp, Ollama ni TGI.
- Arranque: READY en aproximadamente 14 minutos.
- Latencia y throughput: 55,7-73,6 tok/s en decodificacion segun carga; single-flight, las peticiones concurrentes se encolan y cuestan entre 1,5x y 2,9x mas por item.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3 (este kit, EXL3 3,38 bpw) | 753B MoE | 1.048.576 | EXL3 3,38 bpw | glm-5.3 | HuggingFace, 4x DGX Spark |
| GLM-5.3 (BF16, zai-org) | 753B MoE | no disponible | BF16 | glm-5.3 | HuggingFace, no cabe en 4 Sparks |
| GLM-5.3-EXL3-3,38bpw (vcruz305) | 753B MoE | no disponible | EXL3 3,38 bpw | no disponible | HuggingFace, solo pesos |
| incoai/GLM-5.3-DFlash2 | drafter | no aplica | no disponible | CC BY-NC-ND 4.0 | HuggingFace, solo drafter |

No se dispone de datos de benchmarks comparativos con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Single request a la vez: el lane es single-flight; las peticiones concurrentes se encolan y cuestan entre 1,5x y 2,9x mas por item. No apuntar una flota de agentes en paralelo a un solo lane.
- `"draft": false` es patologico en esta build: aproximadamente 9x mas lento, con un `tok/s` enganoso. Mantener el drafting activado.
- Cargas de razonamiento requieren `temperature >= 0,6` y un `thinking_budget`; a T=0 el modelo degenera en repeticion literal en cadenas largas, y sin presupuesto puede pensar hasta el limite de tokens sin responder nunca.
- El pack de pesos no incluye capa MTP; se necesita un checkpoint drafter DFlash2 separado.
- El drafter incluido es un derivado recalibrado de `incoai/GLM-5.3-DFlash2`, con licencia upstream CC BY-NC-ND 4.0: no redistribuir ni usar comercialmente (ver `NOTICE`).
- Licencia del modelo base `glm-5.3` marcada como "other": verificar los terminos de Z.ai antes de uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero inherentes a un modelo de este tipo; el autor advierte de degeneracion en bucles de repeticion en items cientificos dificiles.
- Las cifras se midieron en un unico lane de cuatro Sparks; tratarlas como propias de ese lane, no como garantia.
- Idiomas soportados: no disponibles en la informacion proporcionada.

## Enlaces

- Repositorio del kit: https://huggingface.co/cfontes/glm53-spark-tp4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Pesos cuantizados EXL3: https://huggingface.co/vcruz305/GLM-5.3-EXL3-3.38bpw
- Drafter upstream: https://huggingface.co/incoai/GLM-5.3-DFlash2
- Notas de diseno del cache KV, parches y tests de aceptacion: directorio `kv_cache/` del repositorio del kit
- Documentacion de despliegue: `DEPLOY.md` del repositorio del kit
