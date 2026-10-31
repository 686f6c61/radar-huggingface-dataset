# GrootTeam/Groot-65B-A6B-261023-GGUF

## Resumen

Groot-65B-A6B-261023 es un modelo de razonamiento multimodal de pesos abiertos desarrollado por GrootTeam, diseñado para tareas complejas del mundo real con especial énfasis en razonamiento y uso de herramientas (tool calling). Se trata de un modelo Mixture-of-Experts (MoE) con aproximadamente 65B de parámetros totales, de los cuales solo se activan unos 6B por token, lo que permite un coste de inferencia bajo manteniendo una capacidad elevada. Esta ficha corresponde a la edición GGUF en cuantización Q4_K_M, que ocupa 78,8 GB en disco y añade un modelo acompañante MTP (Multi-Token Prediction) de 5,3 GB como draft model para decodificación especulativa.

El modelo parte de Qwen3.8-Flash-Next y fue post-entrenado con menos de 0,1B tokens de datos open source. Su valor diferencial es la eficiencia: es aproximadamente la mitad de grande que Qwen3.5-122B-A10B y Qwen3.8-Flash-Next, supera ampliamente al primero en 14 de 16 benchmarks y se acerca al segundo, generando además respuestas un 28,3% más cortas que este último. Ofrece una ventana de contexto nativa de 262.144 tokens, ampliable a cerca de 1M con YaRN, y funciona en modo thinking por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal nativo (transformer causal, híbrido Qwen Sparse Attention + Gated DeltaNet) |
| Parametros totales | ~65B (+51B de n-gram embedding y 1,4B de capa MTP; safetensors reporta 116.514.464.640 en total) |
| Parametros activos | ~6B por token (10 expertos enrutados + 1 compartido de 256+1) |
| Longitud de contexto | 262.144 tokens nativos, extensible a ~1M con YaRN |
| Tipos de cuantizacion | BF16, FP8 (E4M3, bloques 128x128), NVFP4, GGUF Q4_K_M (esta edición) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | GGUF (Q4_K_M, 78,8 GB + 5,3 GB MTP companion); también safetensors en otras ediciones |

## Arquitectura y entrenamiento

Groot-65B-A6B es un modelo causal MoE nativamente multimodal con 48 capas: 12 capas de Qwen Sparse Attention y 36 capas de Gated DeltaNet, una arquitectura híbrida attention/SSM que reduce el coste de atención en contextos largos. El tamaño oculto es de 2560. La capa de expertos consta de 256 expertos enrutados más 1 compartido, activando 10 expertos enrutados por token. Incluye una capa de Multi-Token Prediction (MTP) de 1,4B parámetros, distribuida también como draft model independiente en la edición GGUF para decodificación especulativa.

Un componente distintivo es el n-gram embedding de 51B parámetros (~102 GB en BF16), una tabla de consulta de tokens que no añade cómputo activado y puede residir en memoria del host en lugar de en la GPU, dejando en GPU unos 134 GB de pesos BF16 más la caché KV. El modelo parte de Qwen3.8-Flash-Next y fue post-entrenado con menos de 0,1B tokens de datos open source. Opera en modo thinking por defecto, abriendo cada respuesta con un bloque `<think>…</think>`.

## Capacidades

- Generación de texto y razonamiento en modo thinking por defecto (bloque `<think>…</think>` separable mediante reasoning parser).
- Tool calling nativo: los bloques `<tool_call>` se exponen como `tool_calls` estilo OpenAI mediante el tool-call parser.
- Capacidades agénticas multi-paso: destacados resultados en Terminal Bench 2.1, ALE Agent, AutomationBench, JobBench y DeepSWE, evaluados con scaffolds tipo Claude Code y mini-SWE-agent.
- Multimodalidad image-text-to-text: procesa entradas de imagen y texto.
- Contexto muy largo: 262.144 tokens nativos, ampliable a ~1M con YaRN.
- Eficiencia de tokens: usa un 23,9% menos de tokens de salida que Qwen3.5-122B-A10B y un 28,3% menos que Qwen3.8-Flash-Next.
- Decodificación especulativa vía el draft model MTP incluido en la edición GGUF.
- Ingeniería de software: SWE-bench Verified 56,11 y SWE-bench Pro evaluados con SWE-agent.

## Casos de uso

- Agentes de terminal y automatización de sistemas: con 63,37 en Terminal Bench 2.1 (evaluado con agente Claude Code, 500 turnos máximo), es adecuado para agentes que ejecutan comandos, depuran entornos y completan tareas de operaciones de forma autónoma.
- Resolución de issues en repositorios reales: su puntuación de 56,11 en SWE-bench Verified y 42,64 en NL2Repo-Bench lo hace apto para pipelines de CI/CD que corrigen bugs o implementan funcionalidades sobre codebases completas.
- Automatización de flujos de trabajo: en AutomationBench alcanza 41,50 (frente a 7,44 de Qwen3.5-122B-A10B), útil para orquestar tareas multi-paso con herramientas externas.
- Ejecución de trabajos largos con herramientas (JobBench): su ventana de 256K tokens y soporte de tool calling permiten gestionar tareas de larga duración con timeouts de cientos de segundos.
- Asistentes con contexto extenso: la ventana nativa de 262.144 tokens (ampliable a ~1M con YaRN) permite analizar documentación técnica extensa, bases de código grandes o conversaciones muy largas.
- Despliegue en hardware unificado de memoria: la edición GGUF Q4_K_M (78,8 GB) funciona con contexto completo de 256K en máquinas con 128 GB de memoria unificada como NVIDIA DGX Spark (GB10), AMD Strix Halo o Mac M5 Max 128GB, ideal para estaciones de trabajo locales de desarrollo agéntico.
- Investigación sobre arquitecturas híbridas: la combinación de Gated DeltaNet, sparse attention, MTP y n-gram embeddings lo convierte en un buen sujeto de estudio para eficiencia en inferencia.

## Benchmarks y rendimiento

Promedio de los 16 benchmarks evaluados (en modo thinking, temp=1.0, top_p=0.95, top_k=20, contexto 256K):

| Benchmark | Groot-65B-A6B | Qwen3.5-122B-A10B | Qwen3.8-Flash-Next |
|---|---|---|---|
| Promedio (16 benchmarks) | 51,51 | 38,62 | 55,39 |
| Terminal Bench 2.1 | 63,37 | 45,26 | no disponible |
| AutomationBench | 41,50 | 7,44 | no disponible |
| SWE-bench Verified | 56,11 | 23,00 | no disponible |
| HLE (con herramientas) | 22,27 | no disponible | 18,16 |
| NL2Repo-Bench | 42,64 | no disponible | 42,46 |

En eficiencia, Groot usa un 23,9% menos de tokens de salida que Qwen3.5-122B-A10B y un 28,3% menos que Qwen3.8-Flash-Next en promedio. Supera a Qwen3.5-122B-A10B en 14 de los 16 benchmarks y lidera frente a Qwen3.8-Flash-Next en HLE y NL2Repo-Bench. Los valores no publicados individualmente se marcan como no disponibles.

## Requisitos de hardware

- Edición GGUF Q4_K_M (esta ficha): 78,8 GB en disco + 5,3 GB del draft model MTP. Ejecuta el contexto completo de 256K en una sola tarjeta de 96 GB (RTX PRO 6000 Blackwell, H20).
- Máquinas con 128 GB de memoria unificada (NVIDIA DGX Spark y otros sistemas GB10, AMD Strix Halo, Mac M5 Max 128GB): ejecutan 256K de contexto con GGUF y NVFP4.
- Edición FP8 (123,8 GB): 256K de contexto en un H200 o dos H100.
- Edición BF16 (236,6 GB, ~134 GB en GPU + 102 GB de n-gram en host): requiere cuatro GPUs de 80 GB.
- Consumer GPUs estándar (24 GB, como RTX 4090): no es viable para este modelo dada la cuantización mínima publicada (Q4_K_M, 78,8 GB).
- Despliegue: formato GGUF compatible con runtimes llama.cpp y derivados (Ollama, LM Studio); el modelo base se sirve con vLLM o TGI habilitando reasoning parser y tool-call parser. Latencia y throughput concretos: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Promedio (16 benchmarks) | Licencia |
|---|---|---|---|---|---|
| Groot-65B-A6B-261023 | ~65B (+51B n-gram) | ~6B | 262K (~1M con YaRN) | 51,51 | qwen-community-1.0 |
| Qwen3.5-122B-A10B | 122B | 10B | no disponible | 38,62 | no disponible |
| Qwen3.8-Flash-Next | 125B (aprox., ~2x Groot) | no disponible | no disponible | 55,39 | no disponible |

Groot ofrece el mejor ratio capacidad/tamaño del trío: supera a Qwen3.5-122B-A10B con un 46,7% menos de parámetros totales y se sitúa a 3,88 puntos de Qwen3.8-Flash-Next con un 48,0% menos, siendo además el único de los tres que carga con 256K de contexto en una sola tarjeta de 96 GB sin offload a CPU.

## Limitaciones y advertencias

- Licencia qwen-community-1.0 (heredada de Qwen): conviene revisar las condiciones de la licencia antes de uso comercial, ya que las licencias comunitarias de Qwen suelen incluir restricciones según número de usuarios o tamaño de despliegue.
- El n-gram embedding de 51B parámetros (~102 GB en BF16) debe alojarse en memoria del host; esto añade un requisito de RAM significativo fuera de la GPU.
- El modo thinking está activo por defecto, lo que incrementa el número de tokens generados por respuesta; los reasoning parser deben configurarse correctamente en el servidor de inferencia.
- La cuantización Q4_K_M implica pérdida de precisión frente a BF16/FP8; no se publican benchmarks específicos de esta edición GGUF.
- Datos de entrenamiento post-entrenamiento limitados (menos de 0,1B tokens open source); sesgos y riesgos de alucinación específicos: no disponible.
- Idiomas soportados: no disponible en la documentación.
- Los benchmarks se evaluaron con scaffolds agénticos concretos (Claude Code, SWE-agent, mini-SWE-agent) y configuraciones de sampling específicas; los resultados pueden no trasladarse directamente a otros setups.

## Enlaces

- Modelo (esta edición GGUF): https://huggingface.co/GrootTeam/Groot-65B-A6B-261023-GGUF
- Licencia (qwen-community-1.0): https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Otras ediciones (BF16, FP8, NVFP4): no disponible (URLs no proporcionadas; buscar bajo la organización GrootTeam en HuggingFace)
