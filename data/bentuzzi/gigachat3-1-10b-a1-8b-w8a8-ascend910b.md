# Bentuzzi/GigaChat3.1-10B-A1.8B-W8A8-Ascend910B

## Resumen

GigaChat3.1-10B-A1.8B-W8A8-Ascend910B es una re-cuantización W8A8 (pesos y activaciones en int8) del modelo GigaChat3.1-10B-A1.8B desarrollado originalmente por Sber (ai-sage) bajo licencia MIT. La variante publicada por Bentuzzi (MutTechDev) está específicamente orientada a la inferencia sobre aceleradores Huawei Ascend 910B, un ecosistema donde el camino rápido nativo es la GEMM en int8 y el formato FP8 no resulta aplicable. El checkpoint resultante ocupa 11 GB e incluye escalas dinámicas por tensor.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 10 000 millones de parámetros totales y 1 800 millones activos por token, diseñado para generación de texto en ruso e inglés. Esta ficha describe la variante cuantizada, que hereda la licencia MIT del modelo original y añade un parche de 71 líneas sobre `vllm_ascend/attention/mla_v1.py` para sortear un fallo del operador `npu_ring_mla` con las dimensiones no estándar del modelo (qk = 192, v_head = 192).

La relevancia de esta publicación es doble: por un lado, demuestra por primera vez de forma pública y reproducible la ejecución de este MoE sobre Ascend 910B con el stack vLLM + vllm-ascend; por otro, documenta con evidencia (20/20 pruebas semánticas superadas, verificación del operador de atención contra referencia CPU-fp32 con max_diff 0.0077, determinismo byte a byte) el proceso completo de restauración, parcheo y servicio. Es, por tanto, una referencia técnica útil para quien necesite desplegar modelos MoE en hardware Ascend, no un modelo nuevo con capacidades distintas al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con Multi-head Latent Attention (MLA); dims qk = 192, v_head = 192 |
| Parametros totales | 10 000 millones (10B) |
| Parametros activos | 1 800 millones (1.8B) por token |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de servicio usa `--max-model-len 4096`) |
| Tipos de cuantizacion | W8A8 (int8 pesos + activaciones, escalas dinamicas); checkpoint de 11 GB |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | MIT (heredada del modelo original, © Sber; cuantizacion y parche © 2026 MutTechDev) |
| Formato de pesos | Checkpoint para transformers / vLLM (no se especifica safetensors ni GGUF en la informacion disponible) |
| Modelo base | ai-sage/GigaChat3.1-10B-A1.8B-bf16 |
| Hardware objetivo | Huawei Ascend 910B 64 GB (CANN 8.5.0) |
| Stack verificado | torch 2.8.0, torch_npu 2.8.0.post5, vLLM 0.11.0, vllm-ascend 0.11.0, transformers 4.57.4 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención Multi-head Latent Attention (MLA), una variante de atención con compresión latente de claves y valores que reduce el coste de memoria del KV cache. La variante aquí descrita no modifica la arquitectura: aplica cuantización W8A8 sobre los pesos bf16 originales, manteniendo escalas dinámicas para las activaciones. Las dimensiones de atención (qk = 192, v_head = 192) son legales según la documentación de CANN, pero el operador `npu_ring_mla` de vllm-ascend no las acepta, lo que provoca el fallo `AtbRingMLAGetWorkspaceSize` en las versiones 0.11.0 y 0.13.0 de vllm-ascend combinadas con torch_npu 2.7.1/2.8.0.post5 y CANN 8.3/8.5.

El parche `_giga_shim` redirige ambas llamadas a `npu_ring_mla` hacia `npu_fused_infer_attention_score` con layout BSND [1, T, H, 192] y una máscara causal booleana reconstruida a T×S cuando la máscara de anillo de 512×512 resulta insuficiente; además desactiva la ruta rápida `_C_ascend`, ausente en las wheels de PyPI. La decodificación utiliza la ruta nativa de absorción (`torch.bmm`). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original empleó RLHF o DPO.

## Capacidades

- Generación de texto en ruso e inglés, con calidad verificada mediante 10 pruebas de sentido común, aritmética y traducción.
- Seguimiento de instrucciones, validado con 5 pruebas específicas de instruction-following.
- Manejo de invariantes de contexto, con 5 pruebas dedicadas y determinismo byte a byte en repeticiones con seed=0.
- Razonamiento aritmético básico y respuesta a hechos de cultura general (dentro del conjunto de 20 pruebas semánticas).
- Traducción entre ruso e inglés.
- Servicio compatible con la API de OpenAI mediante `vllm serve` (tag `endpoints_compatible`).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Despliegue de inferencia en infraestructura Ascend: el checkpoint W8A8 permite servir el modelo en un Ascend 910B de 64 GB aprovechando la GEMM int8 nativa del hardware, con un TTFT medido de 0,2 s a 1k tokens y 0,5 s a 1,5k tokens.
- Sustitución de GPUs en entornos con hardware Huawei: organizaciones que ya operan clústeres Ascend pueden ejecutar un MoE de 10B sin depender de A100/H100, usando el parche documentado y el stack vLLM + vllm-ascend verificado.
- Asistentes conversacionales en ruso: el modelo cubre generación multi-turno en ruso con calidad validada en pruebas de instrucciones y contexto; el round-trip completo de QA se sitúa entre 0,3 y 1,5 s.
- Traducción ru-en en pipelines internos: las pruebas semánticas incluyen traducción, y el modelo puede integrarse vía API compatible con OpenAI para tareas de traducción por lotes.
- Reproducción de investigación en cuantización: el repositorio GitHub asociado documenta restauración LFS con sha256 por chunk, cascada de pip, parcheo y pruebas, lo que sirve como referencia reproducible para estudiar cuantización W8A8 en NPUs.
- Validación de stacks de inferencia: el operador de atención se verificó contra referencia CPU-fp32 (max_diff 0,0077, causalidad perfecta con rowFirst diff = 0,0), por lo que el checkpoint es útil como caso de prueba para validar nuevas versiones de vllm-ascend o CANN.
- Prototipado de QA sobre documentos cortos: con `--max-model-len 4096` y atención de 192 dimensiones, encaja en escenarios de preguntas y respuestas sobre fragmentos de hasta unos pocos miles de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento medidos por el autor son los siguientes:

| Metrica | Resultado |
|---|---|
| Pruebas semanticas | 20/20 PASS (10 hechos/aritmetica/traduccion, 5 instruction-following, 5 invariantes de contexto) |
| Determinismo | Byte-identico en repeticiones con seed=0 |
| TTFT @1k tokens | 0,2 s |
| TTFT @1.5k tokens | 0,5 s |
| Round-trip QA completo | 0,3-1,5 s |
| Max diff atencion vs CPU-fp32 | 0,0077 (ruido bf16) |
| Causalidad (rowFirst diff) | 0,0 |
| Tamano del checkpoint | 11 GB |
| Integridad | tar sha256 f5551738e672010b861077540f39ba8b9cae144601679a3c2530322ae827a28b, 42 chunks verificados contra LFS oids |

## Requisitos de hardware

- VRAM/NPU: el checkpoint W8A8 ocupa 11 GB; se ejecutó en un Ascend 910B de 64 GB, dejando margen amplio para KV cache y buffers de activación.
- Hardware verificado: Huawei Ascend 910B 64 GB con CANN 8.5.0.
- No se documenta compatibilidad con GPUs NVIDIA en la información proporcionada; el parche y el stack están orientados a vllm-ascend.
- Despliegue: `vllm serve /tmp/models/giga31_w8a8 --port 8000 --max-model-len 4096 --max-num-batched-tokens 4096 --enforce-eager --quantization ascend --no-enable-prefix-caching`.
- El prefix caching debe permanecer desactivado: los bloques KV cacheados son incompatibles con la ruta de prefill descomprimida del shim y producen salidas coherentes pero fuera de tema.
- No se dispone de estimaciones de throughput (tokens/s) más allá de las latencias TTFT y round-trip indicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| GigaChat3.1-10B-A1.8B-W8A8-Ascend910B (esta ficha) | 10B | 1.8B | no disponible | W8A8 int8 | MIT | Ascend 910B |
| ai-sage/GigaChat3.1-10B-A1.8B-bf16 | 10B | 1.8B | no disponible | bf16 | MIT | GPU generica |
| Alternativas MoE de ~10B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar la variante cuantizada con su modelo base bf16. No se dispone de datos de benchmarks ni de especificaciones de otros modelos comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El prefix caching produce salidas coherentes pero fuera de tema con esta ruta de shim; debe mantenerse desactivado en producción.
- Los acrónimos homónimos aislados (por ejemplo, "MLA") pueden muestrear expansiones incorrectas a temperaturas altas; se recomienda usar términos completos como "Multi-head Latent Attention (MLA)" o re-cuantizar con anti-outlier cuando las herramientas soporten dimensiones MLA no estándar.
- El modelo solo soporta ruso e inglés; no se documentan capacidades multilingües adicionales.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad en la documentación proporcionada.
- La licencia MIT permite uso comercial, pero la cuantización y el parche están atribuidos a MutTechDev y el modelo original a Sber; conviene conservar ambas atribuciones.
- El parche depende de versiones concretas del stack (torch 2.8.0, torch_npu 2.8.0.post5, vLLM 0.11.0, vllm-ascend 0.11.0, CANN 8.5.0); cambios de versión pueden requerir adaptaciones.
- El fallo del operador `npu_ring_mla` con qk = 192 y v_head = 192 es un problema conocido de vllm-ascend que el shim sortea, no resuelve en origen.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines de automatización complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bentuzzi/GigaChat3.1-10B-A1.8B-W8A8-Ascend910B
- Modelo base en ModelScope: https://modelscope.cn/models/ai-sage/GigaChat3.1-10B-A1.8B-bf16
- Repositorio de reproducción y evidencias: https://github.com/mrBenBern/GigaChat3.1-W8A8-Ascend910B
- Documentación del acto de inferencia (docs/ACT-INFERENCE.md): incluida en el repositorio anterior
