# mattbucci/Qwen3.8-27B-DSpark-sgl

## Resumen

Qwen3.8-27B-DSpark-sgl no es un modelo conversacional, sino un **modelo borrador (draft) para decodificación especulativa** del algoritmo DSPARK, empaquetado específicamente para el cargador `DSparkDraftModel` de SGLang. Lo publica el usuario individual mattbucci a partir de `RedHatAI/Qwen3.8-27B-speculator.dspark`, entrenado por Red Hat AI con la librería Speculators. Su función es proponer tokens candidatos que el modelo objetivo `Qwen/Qwen3.8-27B` verifica en paralelo, de modo que se reduzca el número de pasos de decodificación sin alterar la distribución de salida.

El repositorio no contiene pesos nuevos: los tensores son **idénticos byte a byte** al `model.safetensors` original. Lo único que cambia es `config.json`, aplanado para que SGLang lo lea sin envoltorios: `transformer_layer_config` se eleva al nivel superior, `aux_hidden_state_layer_ids` pasa a llamarse `target_layer_ids` (capas 4, 12, 20, 28, 36, 44, 52 y 60), se elimina `mrope_section` porque el borrador es solo texto y se descartan los campos `speculators_*` y `auto_map`.

El interés práctico es acotado pero real: permite montar un servidor de Qwen3.8-27B con ventana de 262.144 tokens en **dos RTX 3090 de 24 GB** y obtener entre 1,21× y 1,54× de aceleración en decodificación según la profundidad de contexto. El modelo tiene 1.988.431.617 parámetros (unos 2B) y se distribuye con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer como cabecera borradora para decodificación especulativa (DSPARK); el backbone se define en `transformer_layer_config` |
| Parametros totales | 1.988.431.617 (≈2B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 262.144 tokens en la configuración de servicio recomendada (ventana del modelo objetivo, no del borrador) |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors y el objetivo debe ejecutarse en bfloat16 |
| Idiomas soportados | No disponible; el borrador es solo texto (`mrope_section` eliminado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, byte-idéntico al upstream) |
| Algoritmo | DSPARK (`--speculative-algorithm DSPARK`) |
| Capas objetivo leídas | 4, 12, 20, 28, 36, 44, 52, 60 (`target_layer_ids`) |
| Tokens de borrador | 9 (`block_size + 1`, con `block_size` = 8) |
| Tamaño del repositorio | 4,0 GB |
| Modelo base | RedHatAI/Qwen3.8-27B-speculator.dspark, Qwen/Qwen3.8-27B |
| Librería declarada | sglang |

## Arquitectura y entrenamiento

El borrador es un transformer ligero que se acopla al modelo objetivo mediante estados ocultos auxiliares: en cada paso lee las activaciones de las capas 4, 12, 20, 28, 36, 44, 52 y 60 de Qwen3.8-27B y genera una secuencia de hasta 9 tokens candidatos que el verificador acepta o rechaza en bloque. El entrenamiento original lo realizó Red Hat AI con la librería Speculators; no se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF o DPO.

La innovación del repositorio es puramente de integración, no de modelado: el aplanado de `config.json` elimina la capa de envoltorio de Speculators y expone `transformer_layer_config` en la raíz, de forma que el loader nativo de SGLang lo consume sin transformaciones. Al ser un borrador text-only se prescinde del `mrope_section`, lo que implica que no hereda el enrutado posicional multimodal del objetivo. No se han documentado innovaciones adicionales como atención lineal o decodificación con árbol.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3.8-27B; no produce respuestas finales por sí mismo.
- Consumo de estados ocultos auxiliares bf16 de ocho capas concretas del modelo objetivo.
- Aceleración de la fase de decode (no de prefill) con ratios medidos de 1,21× a 1,54×.
- Longitud media de aceptación de aproximadamente 3 tokens en cargas de trabajo de codificación agéntica.
- Funcionamiento en configuraciones multi-GPU con tensor parallelism (`--tp 2`).
- Compatibilidad con caché KV en fp8 (`fp8_e4m3`) en el servidor objetivo.
- Sin soporte de tool calling, agentes, visión, audio ni modo de razonamiento: esas capacidades dependen íntegramente del modelo objetivo.
- Sin tokenizer propio ni chat template; no es invocable como endpoint de chat de forma aislada.

## Casos de uso

- **Servicio de Qwen3.8-27B en hardware consumer**: permite desplegar el modelo objetivo en 2× RTX 3090 (24 GB cada una) con SGLang, `--tp 2` y KV en fp8, obteniendo una bolsa de 307K tokens para una ventana de 262.144. Sin el borrador, ese mismo par de GPUs no sostendría la ventana completa con caché en bf16 (153K tokens).
- **Reducción de coste por token en agentes de codificación**: con una longitud de aceptación de ~3 tokens por paso de verificación y una ganancia de 1,54× a contextos cortos, un bucle agéntico que encadene muchas llamadas cortas reduce proporcionalmente el tiempo de GPU facturado.
- **Asistentes con contexto muy largo**: a 250.000 tokens reales el servidor pasa de 48,4 a 58,5 tok/s, lo que mantiene la latencia interactiva en casos de análisis de repositorios completos o expedientes extensos donde el prefill ya domina el coste.
- **Ajuste fino de recetas de serving**: el repositorio incluye un A/B en el mismo servidor (`benchmarks/quality/dspark-cuda-depth-ab-2026-09-27.md`), útil como plantilla reproducible para medir el impacto real de DSPARK antes de adoptarlo en producción.
- **Investigación en decodificación especulativa**: al mantener los pesos idénticos al upstream y cambiar solo el formato de configuración, sirve como banco de pruebas controlado para comparar DSPARK frente a otros esquemas de borrador sin reintroducir variabilidad de pesos.
- **Prototipado en estaciones de trabajo de doble GPU**: equipos con 2× RTX 3090 o 2× 4090 pueden validar cargas de 27B en bf16 antes de migrar a un clúster con A100/H100, usando la misma configuración de SGLang.
- **Generación por lotes de documentos largos**: para tareas offline donde el throughput agregado importa más que la latencia, el 1,39× a 49K tokens se traduce directamente en menos horas de GPU por job.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en 2× RTX 3090 con TP=2, decodificación greedy y comparación A/B en el mismo servidor. No hay resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) porque el modelo no es evaluable de forma autónoma: su calidad se mide como longitud de aceptación.

| Carga de trabajo | Contexto | Aceleración de decode | Throughput absoluto |
|---|---|---|---|
| Prosa densa | 60 tokens | 1,54× | No disponible |
| Prosa densa | 34.000 tokens | 1,47× | No disponible |
| Prosa densa | 49.000 tokens | 1,39× | No disponible |
| Prosa densa | 250.000 tokens reales | 1,21× | 58,5 tok/s frente a 48,4 tok/s sin borrador |
| Codificación agéntica | No disponible | No disponible | Longitud de aceptación ≈ 3 |

Las fuentes de estas cifras son `benchmarks/quality/dspark-cuda-depth-ab-2026-09-27.md` y el directorio `benchmarks/quality/dspark-cuda-2026-09-27/` del repositorio de GitHub del autor.

## Requisitos de hardware

- **VRAM del borrador**: los safetensors ocupan 4,0 GB, coherente con ~2B parámetros en bf16; hay que sumar el overhead del runtime y de los buffers de estados ocultos auxiliares.
- **VRAM del objetivo**: Qwen3.8-27B en formato AWQ sobre 2× 24 GB con `--dtype bfloat16` y `--tp 2`. El objetivo debe computar en bf16 porque el borrador consume estados ocultos en bf16.
- **Presupuesto de caché KV**: con `--kv-cache-dtype fp8_e4m3` se alcanzan 307K tokens de pool para una ventana de 262.144; con KV en bf16 el mismo servidor solo llega a 153K, insuficiente para la ventana completa.
- **GPU consumer**: sí cabe, en el escenario exacto de 2× RTX 3090 (o equivalente 2× 24 GB). No se documenta funcionamiento en una sola GPU de 24 GB.
- **GPU de datacenter**: no se han publicado mediciones en A100, H100 o L40S; no disponible.
- **Despliegue**: exclusivamente SGLang (probado en v0.5.22) con `python -m sglang.launch_server`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; el layout de configuración es específico del loader `DSparkDraftModel`.
- **Requisito de parche**: SGLang ≤ v0.5.22 necesita una corrección de una línea en `DSparkWorkerV2` (argumento `pp_proxy_tensors=`; parche 099 del repositorio del autor).
- **Parámetros obligatorios**: `--speculative-num-draft-tokens 9` debe ser igual a `block_size + 1`, y se requiere `--disable-overlap-schedule`.
- **Latencia y throughput**: ver tabla de benchmarks; el throughput absoluto solo se ha publicado para el caso de 250K tokens (58,5 tok/s).

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mattbucci/Qwen3.8-27B-DSpark-sgl | Borrador DSPARK con config para SGLang | 1,99B | 262.144 (heredado del objetivo) | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| RedHatAI/Qwen3.8-27B-speculator.dspark | Borrador DSPARK original con envoltorio Speculators | Mismos pesos (byte-idénticos) | No disponible | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.8-27B | Modelo objetivo que se acelera | 27B (según denominación) | 262.144 | No disponible en la información proporcionada | HuggingFace |
| Borradores EAGLE-3 / Medusa equivalentes | Alternativas de decodificación especulativa | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es frente al speculator de Red Hat AI: se trata del mismo artefacto con distinto `config.json`, por lo que la elección depende únicamente de si se usa SGLang (este repositorio) o la pila de Speculators (upstream). No se dispone de datos verificados de alternativas EAGLE-3 o Medusa para este modelo objetivo concreto.

## Limitaciones y advertencias

- **No es un modelo autónomo**: no genera respuestas útiles sin el modelo objetivo; no debe desplegarse como endpoint de chat.
- **Acoplamiento estricto**: solo funciona con `Qwen/Qwen3.8-27B` (o variantes con la misma estructura de capas); con otro objetivo la longitud de aceptación se desplomaría.
- **Dependencia de versión**: requiere SGLang ≤ v0.5.22 con un parche manual en `DSparkWorkerV2`; versiones posteriores pueden cambiar la API del loader.
- **Restricción de precisión**: obliga a que el modelo objetivo compute en bf16, lo que descarta configuraciones puramente fp8/int4 en el objetivo.
- **Ganancia decreciente con contexto**: la aceleración cae de 1,54× a 60 tokens hasta 1,21× a 250K, de modo que en cargas de contexto muy largo el beneficio es marginal y el coste de VRAM del borrador sigue presente.
- **Sin datos de sesgo ni alucinación**: al no generar texto final, los sesgos y alucinaciones proceden del modelo objetivo y no están caracterizados en esta ficha.
- **Solo texto**: el borrador no procesa multimodalidad; si el objetivo se usa con entradas de imagen, la decodificación especulativa pierde parte de su ventaja.
- **Madurez del artefacto**: 0 descargas y 0 likes, publicado por un autor individual, con un único conjunto de mediciones del propio autor y sin replicación independiente.
- **Licencia**: Apache-2.0 permite uso comercial del borrador, pero la licencia del modelo objetivo (`Qwen/Qwen3.8-27B`) no se detalla en la información disponible y debe verificarse por separado antes de un despliegue en producción.
- **Idiomas**: no se especifica ningún listado de idiomas soportados; la cobertura lingüística efectiva la determina el modelo objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattbucci/Qwen3.8-27B-DSpark-sgl
- Borrador original de Red Hat AI: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de inferencia y parches: https://github.com/letsrtfm/2x-3090-GA102-300-A1-sglang-inference
- Script de aplanado de configuración: https://github.com/letsrtfm/2x-3090-GA102-300-A1-sglang-inference/blob/main/scripts/specforge/flatten_dspark_speculators_config.py
- Benchmark A/B por profundidad de contexto: `benchmarks/quality/dspark-cuda-depth-ab-2026-09-27.md` (en el repositorio anterior)
- Directorio de resultados brutos: `benchmarks/quality/dspark-cuda-2026-09-27/` (en el repositorio anterior)
- Paper o blog de referencia: no disponible
