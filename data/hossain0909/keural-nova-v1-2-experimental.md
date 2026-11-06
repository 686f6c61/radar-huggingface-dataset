# hossain0909/Keural-Nova-v1.2-experimental

## Resumen

Keural Nova v1.2 (experimental) es un modelo de lenguaje bilingüe coreano/inglés desarrollado por MKD, una empresa de IA con sede en Busan (Corea del Sur). Se trata de un ajuste fino supervisado mediante LoRA sobre Qwen3.6-35B-A3B, un modelo de arquitectura MoE con 35 mil millones de parámetros totales y unos 3 mil millones activos por token. El objetivo del ajuste es mejorar la fluidez en coreano, el tool-calling (incluido en contexto muy largo) y la generación de código, manteniendo intactas las capacidades generales del modelo base.

Esta versión v1.2 es la más capaz de la línea Keural Nova hasta la fecha en código y tool-calling: alcanza 12/12 en su suite de function calling (frente a 11/12 del modelo base), verifica llamadas a herramientas correctas en contextos de unos 237.000 tokens y recupera el rendimiento en código que las versiones v1.0 y v1.1 habían degradado (HumanEval 68,3 frente a 62,2 del base). Ofrece un contexto nativo de 256K tokens, ampliable a 1M mediante YaRN. Al ser una versión experimental, el propio autor recomienda validarla en cada carga de trabajo antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (transformer con Gated-DeltaNet linear-attention), basado en Qwen3.6 |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B |
| Longitud de contexto | 256K nativo (262.144 tokens); hasta 1M via YaRN (factor 4.0) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (71,9 GB el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, una arquitectura MoE que combina mecanismos de atencion estandar con atencion lineal Gated-DeltaNet, expertos compartidos y expertos enrutados. Keural Nova v1.2 se ajusta mediante LoRA (rank 16, alpha 32, dropout 0.0) usando `ms-swift`, aplicando los adaptadores a la atencion, la atencion lineal Gated-DeltaNet, los expertos compartidos y todos los expertos MoE enrutados (via `target_parameters` de PEFT), mientras se mantienen congelados el router y las gates. El entrenamiento se realizo durante 1 epoca con LR 5e-5, bf16, DeepSpeed ZeRO-2 sobre 2 GPU H200.

El dataset de entrenamiento consta de aproximadamente 162.000 ejemplos: una mezcla limpia y balanceada de coreano, ingles, codigo (validado por AST) y datos de replay, con exclusion de los splits de test de benchmarks y decontaminacion de identidad. Incluye ademas un bloque de tool-calling de unas 17.000 muestras (single-turn, multi-turn, negativas y de contexto largo hasta 32k), construido a partir de Glaive-function-calling-v2 y Hermes-function-calling (ambas Apache-2.0) convertidas al formato Qwen XML, mas un pequeno conjunto coreano de uso de herramientas. El objetivo de diseno era mejorar coreano, tool-calling y codigo sin degradar la capacidad general, verificado con una puerta de evaluacion contra el modelo base antes de la publicacion.

## Capacidades

- Generacion de texto conversacional bilingue (coreano/ingles), con modo non-thinking por defecto y modo thinking disponible por peticion (`enable_thinking=true`).
- Tool calling / function calling robusto en formato Qwen XML: 12/12 en suite propia de single-turn, soporte multi-turno (llamada → resultado → respuesta final) y llamadas verificadas en contextos de ~237k tokens.
- Cargas de trabajo agenticas y de razonamiento multi-paso, orientadas a frameworks de agentes (busqueda web, QA sobre documentos, orquestacion de funciones).
- Generacion y comprension de codigo: HumanEval 68,3, por encima del modelo base.
- Matematicas: GSM8K 72,3 (por encima del base, aunque inferior a las versiones v1.0/v1.1 de la misma linea).
- Conocimiento general en coreano (KoBEST 70,0; KMMLU 63,5) y en ingles (MMLU 82,9).
- Contexto nativo de 256K tokens, adecuado para RAG sobre documentos extensos.
- Etiquetado como image-text-to-text en Hugging Face, heredando la modalidad multimodal del base Qwen3.6; la model card no detalla capacidades de vision especificas del fine-tune.

## Casos de uso

- Asistentes empresariales coreanos: el modelo presenta el mejor resultado de la linea Nova en KoBEST (70,0) y KMMLU (63,5), lo que lo hace adecuado para chatbots corporativos en coreano con soporte de ingles.
- Agentes con herramientas y frameworks agenticos: su tool calling en formato Qwen XML con parser `qwen3_xml` y `--enable-auto-tool-choice` permite integrarlo directamente en pipelines de agentes (busqueda web, APIs, ejecucion de funciones) via vLLM.
- RAG sobre documentos muy largos: con 256K de contexto nativo puede ingerir corpora extensos (contratos, documentacion tecnica, expedientes) y realizar QA documental, incluyendo llamadas a herramientas dentro de contextos de ~237k tokens.
- Generacion de codigo en produccion: con HumanEval 68,3 y datos de codigo validados por AST, puede integrarse en asistentes de codigo y flujos de revision automatizada.
- Atencion al cliente automatizada multilingue: soporte multi-turno de tool calling (llamada → resultado → respuesta) permite gestionar conversaciones de servicio que requieren consultar sistemas externos (pedidos, cuentas, inventario).
- Procesamiento de logs y analisis de contextos masivos: la ventana de 256K (ampliable a 1M con YaRN) permite resumir y analizar volumenes de texto que exceden la capacidad de la mayoria de modelos de tamano comparable.
- Sistemas de function calling con validacion de argumentos: el dataset de entrenamiento incluye ejemplos negativos y de contexto largo, lo que mejora la fiabilidad en produccion frente al modelo base.

## Benchmarks y rendimiento

Evaluado con lm-eval (backend vLLM, seed 42), mismo harness para base y todas las versiones Nova:

| Benchmark | Base Qwen3.6-35B-A3B | Nova v1.0 | Nova v1.1 | Nova v1.2 |
|---|---:|---:|---:|---:|
| KoBEST (ko, conversacional) | 62,88 | 68,82 | 67,29 | 70,03 |
| KMMLU (ko, conocimiento) | 64,46 | 62,52 | 62,38 | 63,50 |
| HAE-RAE (ko, conocimiento) | 75,53 | 73,42 | 74,52 | 73,88 |
| MMLU (en, conocimiento) | 83,83 | 82,07 | 82,37 | 82,88 |
| GSM8K (matematicas, strict) | 32,15¹ | 87,11 | 86,88 | 72,25 |
| HumanEval (codigo) | 62,20 | 20,73 | 11,59 | 68,29 |

¹ El GSM8K del base esta deprimido por un fallo de formato de respuesta bajo strict-match; gran parte de la mejora del fine-tune es cumplimiento de formato.

Tool calling (suite XML propia, non-thinking, temperature 0):

| Metrica | Base Qwen | Nova v1.2 |
|---|---:|---:|
| Single-turn (12 casos) | 11/12 | 12/12 |
| Multi-turno (llamada → resultado → respuesta final) | Correcto | Correcto |
| Tool call en contexto largo (~237k tokens) | — | Correcto (llamada y argumentos) |

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 71,9 GB en bf16 (safetensors), por lo que se necesitan al menos ~80 GB de VRAM para inferencia en precision completa; con cuantizacion podria reducirse, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: la propia model card documenta el entrenamiento y servido en 2x NVIDIA H200; para inferencia con tensor parallelism 2 (configuracion recomendada en vLLM), 2 GPU de 80 GB (H100, A100, H200) son una referencia razonable.
- Consumer GPU: no cabe en una unica GPU de consumo (RTX 4090, 3090) en precision completa; sin versiones cuantizadas publicadas (GGUF, AWQ, GPTQ), el despliegue en hardware de consumo no esta cubierto por el autor.
- Despliegue: vLLM es el servidor recomendado, con `--tensor-parallel-size 2 --disable-custom-all-reduce --max-model-len 262144 --tool-call-parser qwen3_xml --enable-auto-tool-choice`. No se documentan oficialmente llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al activar solo ~3B de parametros por token (MoE), el throughput por token deberia ser alto en comparacion con un denso de 35B, pero no hay mediciones publicadas.
- Contexto 1M via YaRN: posible con `rope_scaling` factor 4.0, pero el YaRN estatico degrada el tool calling con prompts cortos; se recomienda servir nativo a 256K para agentes.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Keural Nova v1.2 | ~35B | ~3B | 256K (1M YaRN) | Apache-2.0 | Fine-tune bilingue ko/en, tool calling 12/12, HumanEval 68,3 |
| Qwen3.6-35B-A3B (base) | ~35B | ~3B | 256K | Apache-2.0 | Mejor MMLU (83,8) y HAE-RAE (75,5), pero peor coreano conversacional y tool calling |
| Keural Nova v1.0 | ~35B | ~3B | 256K | no disponible | Mejor GSM8K (87,1), pero codigo degradado (HumanEval 20,7) |

No se dispone de datos comparativos publicados frente a otros modelos de la misma categoria fuera de la linea Keural Nova y su base.

## Limitaciones y advertencias

- Version experimental: pensada para evaluacion; el autor recomienda validar en la carga de trabajo concreta antes de produccion.
- GSM8K (72,3) es notablemente inferior al de Nova v1.0/v1.1 (~87), aunque muy por encima del base; si las matematicas son criticas, conviene considerar las versiones anteriores o el base.
- Pequenas perdidas de conocimiento frente al base en MMLU (−0,9) y HAE-RAE (−1,7), un trade-off esperado del SFT.
- El tool calling en contexto 1M (YaRN) no esta garantizado; es una limitacion del servido, no del modelo, pero obliga a servir a 256K para agentes.
- La identidad del modelo es un comportamiento aprendido por fine-tune y no esta reforzado frente a ataques adversariales.
- Solo soporta coreano e ingles; el rendimiento en otros idiomas no esta evaluado ni garantizado.
- No se publican pesos cuantizados ni instrucciones para llama.cpp/Ollama, lo que limita el despliegue en hardware modesto.
- Riesgo de alucinacion: no se documentan mediciones especificas; al tratarse de un SFT (sin RLHF/DPO indicado), deben aplicarse las salvaguardas habituales en produccion.
- Licencia Apache-2.0, permisiva para uso comercial, con atribucion heredada del base Qwen3.6-35B-A3B (Alibaba Cloud / equipo Qwen).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hossain0909/Keural-Nova-v1.2-experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Empresa desarrolladora (MKD): https://mkd.kr
- Datasets de tool calling mencionados: Glaive-function-calling-v2 y Hermes-function-calling (Apache-2.0)
- Paper, blog o demo: no disponibles
