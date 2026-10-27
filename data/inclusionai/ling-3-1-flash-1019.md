# inclusionAI/Ling-3.1-flash-1019

## Resumen

Ling-3.1-flash-1019 es un modelo de lenguaje de tipo Mixture-of-Experts con arquitectura híbrida de atención lineal, publicado por inclusionAI (equipo vinculado a Ant Group) bajo licencia MIT. Se trata de una actualización del Ling-3.1-flash previo en la que se han reforzado, mediante post-entrenamiento adicional, las capacidades de razonamiento y de ejecución de tareas agénticas en entornos reales. El modelo declara 560B parámetros totales y 25B activos por token según su model card, aunque el recuento real de los pesos en safetensors asciende a 572.120.680.768 parámetros.

Su rasgo diferencial es la combinación de 63 capas de atención lineal KDA con 9 capas de Gated MLA (proporción 7:1) más 4 capas densas, lo que permite sostener una ventana de contexto de 1M tokens con un coste de caché mucho menor que un transformer denso equivalente. La vertiente MoE utiliza 512 expertos enrutados con 8 activos por token y un experto compartido, sobre un hidden size de 4096 y 64 cabezas de atención.

Es relevante ahora porque compite en la franja de modelos abiertos de gran escala orientados a agentes: sube de 41 a 44 en el Artificial Analysis Intelligence Index v4.3.2, de ~1400 a 1524 Elo en AA-Briefcase y del 62% al 68% en AutomationBench-AA, con mejora también en benchmarks científicos (CritPt 18%→26%, SciCode 54%→57%). Todo ello con licencia MIT, lo que facilita su uso comercial sin restricciones de escalado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida lineal (`bailing_hybrid`): 63 capas KDA + 9 capas Gated MLA (7:1) + 4 capas densas |
| Parámetros totales | 560B según model card; 572,1B según safetensors (572.120.680.768) |
| Parámetros activos | ~25B por token (8 de 512 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | FP8 (pesos publicados en fp8); no se documentan GGUF, AWQ ni GPTQ en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con `custom_code` (requiere `trust_remote_code`) |
| Capas transformer | 63 KDA + 9 Gated MLA; 4 capas densas |
| Expertos | 512 enrutados, 1 compartido, 8 activados por token |
| Cabezas de atención | 64 |
| Hidden size | 4096 |
| Dimensión intermedia de experto | 1280 |
| Dimensión intermedia densa | 10240 |
| Vocabulario | 157.184 tokens |

## Arquitectura y entrenamiento

La arquitectura es una MoE híbrida que intercala capas de atención lineal KDA (Kimi Delta Attention) con capas de Gated MLA en proporción 7:1, más 4 capas densas. Las capas KDA reducen el coste de atención a memoria y cómputo casi lineal respecto a la longitud de secuencia, mientras que las Gated MLA aportan recuperación precisa de información a largo alcance; el resultado es un modelo capaz de operar con 1M tokens de contexto manteniendo un estado recurrente acotado en lugar de una caché KV que crece linealmente. El bloque MoE tiene 512 expertos enrutados de dimensión intermedia 1280, un experto compartido y 8 expertos activados por token, sobre un hidden size de 4096 con 64 cabezas.

El modelo incorpora decodificación especulativa MTP (NEXTN), con un módulo de predicción multi-token que SGLang y vLLM explotan de forma nativa (`--speculative-algorithm NEXTN`, `{"method":"mtp","num_speculative_tokens":3}`). También admite modo de razonamiento activable por plantilla (`enable_thinking`) y parsers dedicados de tool calling y razonamiento (`ling3`). Sobre el entrenamiento, la información disponible se limita a un resumen de contenidos de entrenamiento publicado por el autor (documento TDS); no se detallan en la model card el número de tokens, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineamiento, por lo que esos datos deben considerarse **no disponibles**.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 1M tokens.
- Razonamiento explícito en modo *thinking* (`enable_thinking: true`), desactivable para respuestas directas.
- Ejecución de tareas agénticas multi-paso: AutomationBench-AA sube del 62% al 68%.
- Tool calling / function calling con parser nativo (`--tool-call-parser ling3`) y `--enable-auto-tool-choice` en vLLM.
- Razonamiento científico y matemático: CritPt 26%, SciCode 57% en la evaluación del autor.
- Generación y edición de código dentro de flujos científicos y de automatización (SciCode).
- Razonamiento de "mundo real" medido por AA-Briefcase (1524 Elo).
- Decodificación especulativa MTP integrada para reducir latencia en generación.
- Capacidades multimodales (visión, audio): no documentadas en la información disponible.
- Cobertura multilingüe: no disponible (el campo de idiomas no está poblado en la ficha de HuggingFace).

## Casos de uso

- **Agentes autónomos de larga duración**: el modelo puede mantener el estado de una tarea durante cientos de miles de tokens gracias a la ventana de 1M y a la atención lineal KDA, lo que permite iterar sobre un repositorio completo o un expediente documental sin resumir ni truncar el contexto.
- **Automatización de procesos con herramientas**: con tool calling nativo y parser `ling3`, encaja en orquestadores tipo LangGraph o similar para encadenar llamadas a APIs internas, consultas a bases de datos y validaciones, usando el modo *thinking* en los pasos de planificación.
- **Análisis de bases de código extensas**: la combinación de contexto de 1M y buen rendimiento en SciCode (57%) permite tareas de revisión, refactorización y localización de bugs sobre monorepos, alimentando el contenido completo como contexto.
- **Asistencia a investigación científica**: con CritPt al 26% y SciCode al 57%, es adecuado como copiloto para razonamiento sobre literatura, generación de scripts de análisis y reproducción de experimentos computacionales.
- **Atención al cliente de nivel empresarial**: conversaciones multi-turno con historial largo, acceso a CRM mediante function calling y respuestas en modo no-thinking para minimizar latencia percibida.
- **Procesamiento de documentos legales o contractuales**: la ventana de 1M permite introducir contratos íntegros y comparar cláusulas entre múltiples versiones en una sola pasada, sin troceado que rompa referencias cruzadas.
- **Backend de asistentes de código en IDE**: integrable vía API OpenAI-compatible servida con SGLang o vLLM, con decodificación especulativa MTP para reducir el tiempo hasta el primer token en autocompletado.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, comparando con el Ling-3.1-flash anterior:

| Benchmark | Ling-3.1-flash | Ling-3.1-flash-1019 |
|---|---|---|
| Artificial Analysis Intelligence Index v4.3.2 | 41 | 44 |
| AA-Briefcase | ~1400 Elo | 1524 Elo |
| AutomationBench-AA | 62% | 68% |
| CritPt | 18% | 26% |
| SciCode | 54% | 57% |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks académicos estándar. Las cifras anteriores son las reportadas por el autor y no se han verificado de forma independiente en esta ficha.

## Requisitos de hardware

- **VRAM estimada**: los pesos en FP8 ocupan aproximadamente 574 GB (tamaño del repo: 573,8 GB), a los que hay que sumar la caché (KV en las capas Gated MLA y estado recurrente en las KDA, con `--mamba-cache-mode align` en vLLM). Para servir con comodidad se recomienda un agregado de al menos 640 GB de HBM.
- **Configuraciones verificadas por el autor**:
  - 8 × H200 con `--tp 8 --ep 8` (receta principal en SGLang).
  - 4 × GB300 con `--tp 4 --ep 4`.
  - Recetas adicionales verificadas para H200, GB300, H800, H100 y B200 (documentadas en el cookbook de SGLang).
- **GPU de consumo**: no es viable. El modelo no cabe en RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo; no se publican pesos GGUF para llama.cpp, Ollama u otros motores de CPU.
- **Motores de despliegue**: SGLang (imagen `lmsysorg/sglang:dev-ling-3.1-flash`, recomendada) y vLLM (build desde la rama `vllm`, con `--trust-remote-code`, `--enable-expert-parallel`, `--enable-prefix-caching` y config MTP).
- **Latencia y throughput**: no se publican cifras absolutas de tokens/s en la información disponible. El autor indica que las optimizaciones de decode para Hopper (`SGLANG_ENABLE_FP8_BLOCK_GEMV=1`, `SGLANG_ENABLE_FUSED_KDA_OUTPUT_QUANT=1`) aportan en torno a un 10% de mejora en decode con batch 1.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ling-3.1-flash-1019 | 560B (572B en safetensors) / 25B | 1M | MIT | MoE híbrida KDA + Gated MLA; FP8 |
| Ling-3.1-flash (predecesor) | 560B / 25B | 1M | MIT | Index AA 41, AutomationBench 62% |
| DeepSeek-V3 | 671B / 37B | 128K | licencia propia de DeepSeek | MoE con MLA; sin atención lineal |
| Qwen3-235B-A22B | 235B / 22B | 256K (extensible) | Apache 2.0 | MoE densa en atención; menor escala |

La comparación de rendimiento frente a estos modelos no puede establecerse con los datos de esta ficha: solo se dispone de las métricas del propio Ling-3.1-flash-1019 y de su predecesor. Las cifras de parámetros, contexto y licencia de los modelos alternativos provienen de sus fichas públicas y deben verificarse en la fuente antes de tomar decisiones de despliegue.

## Limitaciones y advertencias

- **Idiomas no declarados**: la ficha no enumera idiomas soportados; el rendimiento fuera de inglés y chino no está documentado y requiere evaluación propia.
- **Riesgo de alucinación**: no se publican evaluaciones de factualidad ni de tasa de alucinación; en un modelo orientado a agentes, los errores en tool calling pueden propagarse a acciones reales.
- **Contexto de 1M no equivale a uso efectivo de 1M**: no se aportan resultados de *needle-in-a-haystack* ni de recall a longitudes extremas; conviene validar el comportamiento en la longitud real de cada caso de uso.
- **Sin datos de sesgo ni safety**: la model card no incluye evaluaciones de sesgo, toxicidad ni robustez frente a *jailbreak*.
- **Licencia MIT**: permite uso comercial y modificaciones sin restricciones de escalado, pero implica ausencia de garantías y traslada al integrador la responsabilidad sobre el cumplimiento normativo (por ejemplo, obligaciones de transparencia del AI Act).
- **`trust_remote_code` obligatorio**: el modelo usa código personalizado; conviene auditar y fijar una revisión concreta del repositorio antes de desplegarlo en producción.
- **Solo FP8**: no hay pesos cuantizados a 4 bits ni GGUF, lo que excluye hardware de consumo y limita las opciones de reducción de coste.
- **Discrepancia en el recuento de parámetros**: 560B declarados frente a 572,1B reales en safetensors; hay que dimensionar el hardware con la cifra mayor.
- **Benchmarks reportados por el proveedor**: las cifras de AA Index, Briefcase, AutomationBench, CritPt y SciCode proceden de la model card y no se han replicado de forma independiente.
- **Descarga de ~574 GB**: requisitos de almacenamiento y de ancho de banda considerables para cualquier despliegue on-premise.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- Modelo predecesor: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Organización en HuggingFace: https://huggingface.co/inclusionAI
- Organización en ModelScope: https://modelscope.cn/organization/inclusionAI
- Endpoint en OpenRouter: https://openrouter.ai/inclusionai/ling-3.1-flash
- Cookbook de SGLang para Ling-3.1-flash: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.1-flash
- Resumen de contenidos de entrenamiento (PDF): https://huggingface.co/inclusionAI/AI-Transparency/resolve/main/Ling-3.1_TDS-Summary.pdf
- Índice de documentación de transparencia: https://huggingface.co/inclusionAI/AI-Transparency
- Repositorio de vLLM: https://github.com/vllm-project/vllm
