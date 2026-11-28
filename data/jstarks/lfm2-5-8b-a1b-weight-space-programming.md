# jstarks/LFM2.5-8B-A1B-Weight-Space-Programming

## Resumen
Este repositorio aloja una serie de variantes modificadas del modelo LiquidAI/LFM2.5-8B-A1B, un transformer híbrido de tipo MoE disperso con 8.467.856.832 parámetros totales (8B-A1B) y 24 capas que combina ShortConv, atención y 32 expertos. La modificación aplicada por el autor jstarks se denomina Weight-Space Programming (WSP): una técnica de edición de pesos en espacio de pesos, sin gradientes y en forma cerrada, que ajusta directamente un subconjunto reducido de tensores internos para mejorar el comportamiento en tareas de tool calling, agentes y razonamiento STEM.

El resultado son GGUFs autónomos listos para ejecutar en llama.cpp, LM Studio, Jan o KoboldCpp sin necesidad de cargar adaptadores LoRA por separado. Se ofrecen dos variantes cuantizadas, Q4_K_M (4,8352 GiB) y Q4_0 (4,5457 GiB), además de un adaptador fusionado de rango 16 (1160 KB) y subespacios modulares de rango 8. La modificación solo afecta a 12 tensores 2D internos de las capas blk.18 a blk.23, dejando intactos los otros 244 tensores del modelo base.

La relevancia de esta ficha radica en que demuestra una vía alternativa al ajuste fino tradicional (LoRA, RLHF) para especializar modelos abiertos en tareas concretas de agente, con mejoras medibles en benchmarks como NL2Bash, GSM8K o Terminal-Bench, y con un coste de almacenamiento mínimo. Es un ejemplo práctico de interpretabilidad mecanicista aplicada a la producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE disperso (24 capas, ShortConv + Attention + 32 expertos) |
| Parametros totales | 8.467.856.832 |
| Parametros activos | 1B (denominación A1B del modelo base) |
| Longitud de contexto | no disponible (la configuración de ejemplo usa -c 8192) |
| Tipos de cuantizacion | Q4_K_M y Q4_0 (GGUF); adaptadores en F16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (modelos empaquetados y adaptadores) |

## Arquitectura y entrenamiento
El modelo base LiquidAI/LFM2.5-8B-A1B es un transformer híbrido de 24 capas que combina capas ShortConv (convolución corta) con atención y una capa MoE dispersa de 32 expertos. La arquitectura se etiqueta como lfm2moe y pertenece a la familia Liquid. El modelo modificado conserva íntegramente esta arquitectura: solo se alteran 12 tensores 2D en las capas blk.18 a blk.23, que incluyen 6 routers MoE (ffn_gate_inp.weight en F32), 2 tensores attn_output.weight y 4 shortconv.out_proj.weight convertidos a F16 para evitar recorte por recuantización (incremento neto de +34,5 MiB). Los 244 tensores restantes (embeddings, layer norms, QKV de atención y pesos 3D de expertos MoE) son copias byte a byte del modelo original.

El entrenamiento no sigue el paradigma habitual de descenso de gradiente. La técnica WSP aplica una programación en espacio de pesos en forma cerrada y sin gradientes, que combina dos subespacios de rango 8 (wsp_s1_think_close y wsp_s2_tool_emit) con coeficientes de escala (1,1 y 1,5 en Q4_K_M; 1,0 y 1,5 en Q4_0) y los fusiona algebraicamente en un adaptador de rango 16. La fusión se valida con una cola SVD máxima de 7,34e-07 y un error relativo F16 máximo de 2,98e-04, garantizando paridad de logits top-1 (max |Δ| = 0,00000 en Q4_0 y 0,00001 en el adaptador fusionado). No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre el volumen de tokens utilizado.

## Capacidades
- Generación de texto conversacional y razonamiento general.
- Razonamiento matemático y STEM (evaluado en GSM8K, MATH-500 y un conjunto stem45).
- Tool calling y function calling (evaluado en EST_BFCL_IRR y S3_ROUTER).
- Generación de comandos de shell y bash a partir de lenguaje natural (NL2Bash).
- Comportamiento agéntico multi-paso y ejecución en terminal (Terminal-Bench, agent100).
- Modo de razonamiento "think" con cierre controlado (subespacio think_close).
- Emisión controlada de llamadas a herramientas (subespacio tool_emit).
- Guardas contra inyección de prompts (S7_INJECTION_GUARD).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión ni audio.

## Casos de uso
- Automatización de operaciones en terminal: el modelo puede traducir instrucciones en lenguaje natural a comandos bash (NL2Bash) con una mejora de 4/20 a 15/20 en Q4_0 y de 9/20 a 18/20 en Q4_K_M, lo que lo hace adecuado para asistentes de consola y scripts de aprovisionamiento.
- Agentes autónomos de resolución de tareas: con 86/100 en agent100 (Q4_K_M) y 89/100 en el adaptador fusionado, puede orquestar secuencias multi-paso con tool calling en entornos controlados.
- Asistencia en CI/CD: la mejora en la emisión fiable de llamadas a herramientas permite integrarlo en pipelines que invocan APIs o ejecutan comandos de build.
- Tutoría y resolución de problemas STEM: el incremento en stem45 (29/45 a 30/45) y GSM8K (14/20 a 16/20) lo hace útil para asistentes educativos de matemáticas y ciencias.
- Enrutamiento de consultas y clasificación: la mejora en S3_ROUTER (4/5 a 5/5) permite usarlo como clasificador o dispatcher en sistemas multi-agente.
- Defensa frente a inyección de prompts: la mejora en S7_INJECTION_GUARD (1/3 a 2/3) lo hace apropiado para despliegues expuestos a entradas no confiables.
- Despliegue en hardware de consumo: con 4,5-4,8 GiB en Q4 y 301-312 tok/s de decodificación mediana en una RTX 4070 Ti de 12 GB, es viable en estaciones de trabajo modestas.

## Benchmarks y rendimiento

| Benchmark | Q4_0 Base | Q4_0 WSP | Q4_K_M Base | Q4_K_M WSP | Adaptador r16 |
|---|---|---|---|---|---|
| Track A total (155 tareas) | 103/155 (66,5 %) | 117/155 (75,5 %) | no disponible | 119/155 (76,8 %) | 120/155 (77,4 %) |
| agent100 | no disponible | 84/100 | no disponible | 86/100 | 89/100 |
| EST_NL2BASH | 4/20 | 15/20 | 9/20 | 18/20 | no disponible |
| EST_GSM8K | no disponible | no disponible | 14/20 | 16/20 | no disponible |
| stem45 | 29/45 | 30/45 | 29/45 | 30/45 | no disponible |
| tbench10 (WSL2) | 1/10 | 3/10 | 2/10 | 3/10 | no disponible |
| VAL_LFM25 | 19/28 (67,9 %) | 26/28 (92,9 %) | no disponible | 27/28 (96,4 %) | no disponible |
| S3_ROUTER | no disponible | no disponible | 4/5 | 5/5 | no disponible |
| S7_INJECTION_GUARD | no disponible | no disponible | 1/3 | 2/3 | no disponible |
| S8_GROUNDING | 2/3 | 3/3 | no disponible | no disponible | no disponible |
| EST_BFCL_IRR | no disponible | 13/15 | 12/15 | 13/15 | no disponible |
| Tokens/s (decodificación mediana) | no disponible | 312,1 | no disponible | 301,7 | 304,7 |

Mediciones realizadas en RTX 4070 Ti de 12 GB con llama-server y temperatura 0,0.

## Requisitos de hardware
- VRAM estimada: aproximadamente 4,5-4,8 GiB para los pesos en Q4_0 y Q4_K_M; con contexto de 8192 tokens y caché KV en q8_0 el consumo total se mantiene por debajo de 6-7 GiB.
- GPU recomendadas: RTX 4070 Ti (12 GB) es la plataforma de referencia medida; cualquier GPU con al menos 8 GB de VRAM debería poder ejecutar los GGUFs.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080, RTX 4090 y equivalentes.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, Jan, KoboldCpp; los tags indican compatibilidad con endpoints.
- Throughput medido: 301,7 tok/s (Q4_K_M WSP), 312,1 tok/s (Q4_0 WSP) y 304,7 tok/s (adaptador fusionado r16) en decodificación mediana sobre RTX 4070 Ti.
- Los adaptadores LoRA requieren llama.cpp con soporte de --lora; los GGUFs empaquetados no necesitan flags adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jstarks/LFM2.5-8B-A1B-WSP (este) | 8,47B totales / 1B activos | no disponible | LFM v1.0 | GGUF Q4_K_M, Q4_0 | Especializado en agentes y tool calling vía WSP |
| LiquidAI/LFM2.5-8B-A1B (base) | 8,47B totales / 1B activos | no disponible | LFM v1.0 | safetensors, GGUF | Modelo original sin modificar; referencia de comparación |
| LiquidAI/LFM2.5-8B-A1B-GGUF | 8,47B totales / 1B activos | no disponible | LFM v1.0 | GGUF | Versión cuantizada oficial del base |
| Otros MoE de ~8B con ~1B activos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias
- La licencia LFM Open License v1.0 impone condiciones específicas para uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- La modificación WSP solo altera 12 tensores; las capacidades no relacionadas con tool calling, agentes o STEM probablemente se mantienen idénticas al modelo base, pero no se han evaluado de forma independiente.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas más allá de las guardas de inyección.
- Los resultados de benchmarks se han obtenido con temperatura 0,0 y en una única GPU (RTX 4070 Ti); la reproducibilidad en otros entornos no está garantizada.
- El contexto máximo no está documentado en la información disponible; los ejemplos usan 8192 tokens, pero el límite real del modelo base podría ser distinto.
- No se dispone de información sobre sesgos, idiomas soportados ni evaluación de seguridad.
- Las mejoras en tbench10 son modestas (3/10) y las tareas de terminal complejas pueden seguir fallando.
- El modelo está pensado para investigación e interpretabilidad mecanicista; su uso en producción requiere validación adicional.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/jstarks/LFM2.5-8B-A1B-Weight-Space-Programming
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- GGUF oficial del base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF
- Licencia: https://huggingface.co/jstarks/LFM2.5-8B-A1B-Weight-Space-Programming/blob/main/LICENSE
- GGUF Q4_K_M empaquetado: https://huggingface.co/jstarks/LFM2.5-8B-A1B-Weight-Space-Programming/blob/main/LFM2.5-8B-A1B-WSP-Q4_K_M.gguf
- GGUF Q4_0 empaquetado: https://huggingface.co/jstarks/LFM2.5-8B-A1B-Weight-Space-Programming/blob/main/LFM2.5-8B-A1B-WSP-Q4_0.gguf
- Adaptador fusionado r16: https://huggingface.co/jstarks/LFM2.5-8B-A1B-Weight-Space-Programming/blob/main/adapters/wsp_lfm25_s1_1.0_s2_1.5_fused_r16.gguf
