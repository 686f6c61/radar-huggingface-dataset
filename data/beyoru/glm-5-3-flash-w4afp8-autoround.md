# beyoru/GLM-5.3-Flash-W4AFP8-AutoRound

## Resumen

GLM-5.3-Flash-W4AFP8-AutoRound es una compilación cuantizada del modelo zai-org/GLM-5.3-Flash, un transformer de arquitectura Mixture-of-Experts (MoE) con 320.000 millones de parámetros totales y 18.000 millones activos por token. La publicación corre a cargo del usuario beyoru, que no entrena ni modifica los valores de los pesos: toma una cuantización INT4 ya existente de intel/auto-round y la reempaqueta del formato `auto_gptq` al formato `pack-quantized` de `compressed-tensors`, sin alterar los valores dequantizados (verificado tensor a tensor como bit-idéntico).

El interés de esta ficha está en el formato híbrido W4AFP8: pesos INT4 simétricos con grupo de 128 para los expertos enrutados y activaciones FP8 E4M3 dinámicas por token, de modo que el MoE se ejecuta sobre los tensor cores de Hopper. El resultado ocupa unos 168 GB y cabe en 2× H200 con tensor parallelism 2, lo que rebaja de forma notable el coste de servir un modelo de 320B frente a alternativas en BF16 o W4A16.

La model card incluye además datos concretos de despliegue con SGLang (flags obligatorios, backend de kernels, decodificación especulativa EAGLE) y una tabla de throughput comparativa. Es, por tanto, una ficha orientada a quien vaya a poner el modelo en producción, no a quien busque un checkpoint de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con capa MTP y atención/indexer; detalles completos no disponibles |
| Parametros totales | 50.303.291.708 (según safetensors del repo cuantizado); 320B según la model card para el modelo base |
| Parametros activos | 18B (modelo base) |
| Longitud de contexto | 131.072 tokens (configuración de servicio indicada en la model card) |
| Tipos de cuantizacion | INT4 simétrico grupo 128 (expertos enrutados) + FP8 E4M3 dinámico por token (activaciones); resto en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con `compressed-tensors` (`pack-quantized`), compatible con transformers y SGLang |

## Arquitectura y entrenamiento

El modelo base es un MoE con 320.000 millones de parámetros totales y 18.000 millones activos, según la model card del autor de la cuantización. La arquitectura incluye expertos enrutados, expertos compartidos, un router, una capa MTP (multi-token prediction) y un mecanismo de atención con indexer que SGLang sirve mediante los backends `dsa-prefill-backend` y `dsa-decode-backend` sobre TileLang. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

Esta publicación no entrena nada: parte de una cuantización INT4 de intel/auto-round (`--iters 200`, set de calibración por defecto) y la reempaqueta. Las capas lineales cuantizadas pasan de `qweight` int32 `[K/8, N]` a `weight_packed` int32 `[N, K/8]`, las escalas de fp16 `[K/128, N]` a bf16 `[N, K/128]`, y se eliminan los `qzeros` por ser simétricos. Permanecen en 16 bits la atención y el indexer, los expertos compartidos, el router, el MLP de las capas 0 a 2, los embeddings, el `lm_head` y las partes no expertas de la capa MTP. El error relativo de pesos frente al checkpoint FP8 oficial es de aproximadamente 0,102 en `gate_proj` y 0,103 en `down_proj`, mejor que el round-to-nearest INT4 con el mismo tamaño de grupo (0,111 y 0,118-0,185).

## Capacidades

- Generación de texto conversacional y razonamiento, con modo thinking y non-thinking configurables mediante la plantilla de chat.
- Procesamiento de imagen y texto (`image-text-to-text`), según los tags del repositorio.
- Razonamiento multi-paso con esfuerzo de razonamiento ajustable (`reasoning_effort`, por defecto Max en la plantilla oficial).
- Tool calling y function calling, con parser dedicado en SGLang (`--tool-call-parser glm47`).
- Decodificación especulativa EAGLE con MTP: la model card reporta 2,8-3,2 tokens aceptados por paso.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat de larga conversación: con 131.072 tokens de contexto y prefix caching, el modelo mantiene sesiones multi-turno extensas sin truncar historial; la tabla de throughput reporta un 25-30 % de aciertos de caché de prefijo en cargas realistas.
- Asistentes con uso de herramientas: el soporte de tool calling y el parser `glm47` permiten integrar el modelo en orquestadores de agentes que encadenan llamadas a APIs externas.
- Razonamiento complejo por lotes: el modo thinking con esfuerzo Max es adecuado para tareas de análisis, planificación o resolución de problemas donde la latencia no es crítica.
- Atención al cliente automatizada: el modo non-thinking con `reasoning_effort: low` reduce la latencia (TPOT p50 de 17 ms con kernels Humming) y encaja en flujos de respuesta rápida.
- Procesamiento de documentos con imagen: la modalidad image-text-to-text permite extraer y razonar sobre contenido de capturas, formularios o diagramas.
- Despliegue en clústeres pequeños de Hopper: al caber en 2× H200 con TP2, es viable para equipos que no disponen de nodos de 8 GPU para servir un modelo de 320B.
- Evaluación de cuantizaciones: sirve como referencia para comparar W4A16 (Marlin) frente a W4AFP8 (CUTLASS y Humming) en el mismo hardware, con las métricas de TTFT y TPOT ya publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Sí hay datos de throughput en 2× H200 con TP2, carga sintética de contexto largo (prompt p50 ≈ 14K, p90 ≈ 34K tokens; salida p50 ≈ 50 tokens; 25-30 % de aciertos de caché de prefijo; modo non-thinking):

| Configuración | TTFT p50 / p95 a 1,0 req/s | TPOT p50 | TTFT p95 a 1,5 req/s |
|---|---|---|---|
| W4A16 (AutoRound, Marlin MoE) | 8,0 / 18,7 s | 312 ms | saturado |
| W4AFP8, CUTLASS MoE | 2,5 / 6,4 s | 33 ms | 33 s |
| W4AFP8, Humming MoE | 1,6 / 4,4 s | 17 ms | 14 s |
| Gemma-4-31B BF16 (referencia, mismas GPU) | 3,1 / 9,0 s | 136 ms | 52 s |

Decodificación en un solo stream con MTP: aproximadamente 175-210 tokens/s, con 2,8-3,2 tokens aceptados por paso.

## Requisitos de hardware

- VRAM estimada: unos 168 GB de pesos, más caché KV en bfloat16; el autor indica que cabe en 2× H200 con `--mem-fraction-static 0.88`.
- GPU recomendadas: H200 (probado), H100 por arquitectura Hopper y soporte de tensor cores FP8; el backend CUTLASS W4A8 y los kernels Humming dependen de Hopper.
- GPU de consumo: no cabe en ninguna GPU consumer actual por tamaño (168 GB) ni por los kernels requeridos.
- Despliegue: SGLang es la vía documentada (imagen nightly `lmsysorg/sglang:11.11.26`), con `--tp-size 2`, `--context-length 131072`, `--chunked-prefill-size 16384`, `--kv-cache-dtype bfloat16` y decodificación especulativa EAGLE (`--speculative-num-steps 3`, `--speculative-eagle-topk 1`, `--speculative-num-draft-tokens 4`).
- Flags críticos: `--disable-shared-experts-fusion` es obligatorio; sin él SGLang fusiona el experto compartido BF16 en el kernel de expertos enrutados INT4 y la salida es incorrecta desde el primer token. Para los kernels Humming (≥ 0.1.18) hay que usar `--quantization humming --moe-runner-backend humming` y fijar `group_size` a 0 en `input_activations` del `config.json`.
- Latencia y throughput: ver tabla de la sección anterior; el mejor caso es Humming MoE con TTFT p50 de 1,6 s y TPOT p50 de 17 ms a 1,0 req/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Hardware de referencia |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-W4AFP8-AutoRound | 320B (50,3B en safetensors) | 18B | 131.072 | INT4 + FP8 | MIT | 2× H200 |
| GLM-5.3-Flash (base, FP8 oficial) | 320B | 18B | no disponible | FP8 | MIT | no disponible |
| GLM-5.3-Flash W4A16 (AutoRound, Marlin) | 320B | 18B | no disponible | INT4 pesos, 16 bits activaciones | MIT | 2× H200 (TTFT p50 8,0 s) |
| Gemma-4-31B BF16 (referencia del autor) | 31B | denso | no disponible | BF16 | no disponible | 2× H200 (TTFT p50 3,1 s) |

La comparación relevante es interna: frente a W4A16, la variante W4AFP8 reduce el TTFT p50 de 8,0 a 1,6-2,5 s y el TPOT p50 de 312 a 17-33 ms en el mismo hardware.

## Limitaciones y advertencias

- La cuantización INT4 introduce error de pesos (≈ 0,102-0,103 relativo frente al FP8 oficial); no se han publicado evaluaciones de calidad que cuantifiquen la degradación en tareas concretas.
- El repositorio solo cambia el formato de almacenamiento y la configuración de cuantización; cualquier problema de calidad del checkpoint AutoRound subyacente se hereda.
- `--disable-shared-experts-fusion` es obligatorio en SGLang: omitirlo produce salida corrupta sin aviso evidente.
- El modo thinking de la plantilla oficial abre `<think>` y fija `Reasoning Effort: Max`; para servir sin razonamiento hay que cerrar con `<think></think>`, bajar el esfuerzo y pasar `--default-chat-template-kwargs '{"enable_thinking": false}'`. Con esfuerzo en Max el modelo puede razonar igualmente y emitir un `</think>` huérfano.
- Los kernels Humming exigen SGLang con humming ≥ 0.1.18 y un ajuste manual de `group_size` en `input_activations`; sin él el backend rechaza la configuración.
- Dependencia fuerte de Hopper: el rendimiento documentado se ha medido en H200; no hay datos para otras arquitecturas.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe más allá de lo que haga el modelo base.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- Licencia MIT, igual que el modelo base, sin restricciones comerciales adicionales indicadas; conviene verificar la licencia del checkpoint AutoRound de origen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/beyoru/GLM-5.3-Flash-W4AFP8-AutoRound
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Herramienta de cuantización AutoRound: https://github.com/intel/auto-round
