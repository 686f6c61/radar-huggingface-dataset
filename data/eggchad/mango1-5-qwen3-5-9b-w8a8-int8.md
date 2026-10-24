# Eggchad/MANGO1.5-Qwen3.5-9B-W8A8-INT8

## Resumen

MANGO1.5-Qwen3.5-9B-W8A8-INT8 es una cuantización INT8 de pesos y activaciones (W8A8) del modelo `CMKL/MANGO1.5-Qwen3.5-9B`, un modelo bilingüe tailandés-inglés de 9.653.104.368 parámetros construido sobre la arquitectura Qwen3.5. La conversión la firma el usuario Eggchad, del equipo ThunderPermanent, durante el hackathon GreenMind de octubre de 2026, partiendo de los pesos BF16 oficiales del modelo base. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto de despliegue cuyo interés está en reducir el coste de servir un modelo de ~9,6B en una única GPU A100 de 40 GB sin perder precisión medible.

El modelo base combina atención completa con capas lineales Gated-DeltaNet (24 de las 32 capas), incorpora una torre de visión y una cabeza MTP (multi-token prediction) que habilita decodificación especulativa. La cuantización respeta esos componentes: solo se cuantizan las 200 capas lineales de los MLP y de las proyecciones de atención, mientras que embeddings, normas, `lm_head`, `in_proj_a`/`in_proj_b`, `conv1d`, `A_log`, `dt_bias`, la torre visual y la cabeza MTP se conservan en bf16.

Es relevante ahora porque demuestra un flujo de cuantización reproducible (script de ~3 minutos en CPU, shard a shard) con resultados medidos sobre un stack completo de serving en vLLM 0.32.0: precisión macro del 91,8 % frente al 87,8 % del baseline BF16 en el grader de GreenMind, y 300/300 peticiones dentro de SLO con p95 TTFT de 1,30 s. La contrapartida es que esas cifras corresponden a la pila de serving y no a benchmarks estándar de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 32 capas, 8 con atención completa y 24 con Gated-DeltaNet (atención lineal/SSM); incluye torre de visión y cabeza MTP |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | No aplica (no se describe como MoE en la información disponible) |
| Longitud de contexto | 40.960 tokens en la configuración de servicio de referencia (`--max-model-len 40960`); máximo nativo del modelo base: no disponible |
| Tipos de cuantizacion | INT8 W8A8: pesos simétricos per-output-channel con RTN (escala absmax/127, float32, forma `[out, 1]`); activaciones dinámicas per-token simétricas INT8. Componentes críticos en bf16 |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | Apache 2.0 (según metadatos; la model card remite a la licencia del modelo base) |
| Formato de pesos | safetensors con formato `compressed-tensors` (`int-quantized`); librería declarada: vLLM |
| Capas cuantizadas | 200 capas lineales: gate/up/down de los 32 MLP, q/k/v/o de las 8 capas de atención completa, `in_proj_qkv`, `in_proj_z` y `out_proj` de las 24 capas Gated-DeltaNet |
| Capas en bf16 (ignore list) | `lm_head`, embeddings, normas, `in_proj_a`/`in_proj_b` de GDN, `conv1d`, `A_log`, `dt_bias`, torre de visión y cabeza MTP |
| Tamano del repositorio | 12,4 GB |
| Version de vLLM de referencia | 0.32.0 |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 32 capas que alterna 8 capas de atención completa con 24 capas Gated-DeltaNet, un mecanismo de atención lineal con estado recurrente que reduce el coste de memoria y cómputo en contextos largos. A esto se suma una torre visual (el ignore list incluye `re:.*visual.*`), lo que apunta a capacidades multimodales, y una cabeza MTP que permite decodificación especulativa nativa: en la configuración de servicio se declara `"method": "mtp"` con 3 tokens especulativos, ajustados dinámicamente por tamaño de batch (3 para batches de 1 a 32, 2 para 33 a 64, 1 para 65 a 128). La presencia de capas SSM obliga a usar `--mamba-ssm-cache-dtype float16`.

Sobre el entrenamiento no hay información en la documentación disponible: no se detallan tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí está documentado es el proceso de cuantización, que no incluye entrenamiento ni calibración: se aplica cuantización round-to-nearest por canal de salida sobre los pesos BF16, se deja que el kernel cuantice las activaciones en tiempo de ejecución y se copian literalmente la cabeza MTP y el resto de componentes sensibles. El script (`scripts/quant_w8a8_int8.py`) tarda unos 3 minutos en CPU y se puede reconstruir con `scripts/setup.sh --convert`.

## Capacidades

- Generación de texto conversacional bilingüe tailandés-inglés, el eje declarado del modelo base.
- Razonamiento multi-paso con modo de pensamiento: la configuración de servicio usa `--reasoning-parser qwen3` y un middleware de presupuesto de thinking.
- Tool calling y function calling: `--enable-auto-tool-choice --tool-call-parser qwen3_coder`, lo que habilita agentes que invocan herramientas en formato estructurado.
- Recuperación aumentada (RAG): una de las seis clases de tarea evaluadas en el grader de GreenMind.
- Razonamiento matemático y generación de código: clases explícitas del conjunto de evaluación.
- Contexto largo: la configuración de referencia sirve hasta 40.960 tokens con prefix caching y chunked prefill.
- Decodificación especulativa mediante la cabeza MTP conservada, con speedup medido en el stack de serving.
- Capacidades visuales potenciales por la torre de visión presente en los pesos, aunque no se documenta su evaluación ni su uso en el grader.

## Casos de uso

- Atención al cliente bilingüe tailandés-inglés: el modelo puede mantener conversaciones multi-turno con hasta 40.960 tokens de contexto, suficiente para arrastrar historial e información de cuenta, y el vocabulario bilingüe evita tener que encadenar un modelo de traducción delante.
- Asistentes RAG sobre documentación corporativa: con prefix caching activado, un mismo bloque de contexto recuperado se reutiliza entre peticiones y reduce el TTFT; el modelo está evaluado específicamente en esta clase de tarea.
- Agentes con tool calling en producción: el parser `qwen3_coder` y el auto tool choice permiten conectar el modelo a APIs internas, con la decodificación especulativa MTP rebajando el coste por paso del bucle agente.
- Razonamiento y cálculo con presupuesto acotado: el middleware de thinking budget del stack de referencia permite limitar los tokens de razonamiento para cumplir SLO de latencia, útil en tareas de matemáticas o análisis donde no siempre hace falta la traza completa.
- Generación y revisión de código en pipelines de CI/CD: la clase de código está entre las evaluadas, y el modelo puede exponerse como endpoint compatible con OpenAI mediante `vllm serve` para integrarse en revisiones automáticas.
- Despliegue de un 9,6B en una sola A100 40 GB: el caso de uso central del artefacto; el perfil publicado sostiene 128 secuencias concurrentes y 2.560 tokens por batch con 300/300 peticiones dentro de SLO.
- Sustitución directa del modelo base BF16 en infraestructura ya existente: al mantener la cabeza MTP y el tokenizador, puede reemplazar al BF16 en un despliegue vLLM cambiando solo el identificador del modelo, con una precisión macro declarada superior en el grader.

## Benchmarks y rendimiento

Resultados del grader de GreenMind sobre el stack completo de serving (300 peticiones finales por ejecución). No son benchmarks estándar de los pesos, sino medidas de la pila con middleware de thinking budget:

| Ejecucion | Puntuacion S | R (precision vs BF16) | SLO cumplidos | J/peticion | p95 TTFT | p95 TPOT |
|---|---|---|---|---|---|---|
| #9 | 98,6 | 1,039 | 287/300 | 170 | 3,42 s | 26 ms |
| #10 | 99,5 | 1,037 | 295/300 | 166 | 2,32 s | 27 ms |
| #11 | 99,5 | 1,054 | 295/300 | 168 | 2,42 s | 27 ms |
| #12 | 99,7 | 1,045 | 297/300 | 166 | 1,62 s | 24 ms |
| #13 | 99,5 | 1,037 | 295/300 | 176 | 2,43 s | 27 ms |
| #14 (enviada) | 100,0 | 1,045 | 300/300 | 169 | 1,30 s | 25 ms |

Precisión macro del grader por ejecución: 91,2 / 91,0 / 92,5 / 91,8 / 91,0 / 91,8 %, frente al 87,8 % del baseline BF16, sobre seis clases de tarea (chat/instrucciones, RAG, tool calling, razonamiento/matemáticas/código, tailandés y contexto largo).

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos INT8 de 9,65B ocupan aproximadamente 9,7 GB en teoría; el repositorio pesa 12,4 GB por los componentes conservados en bf16 (embeddings, `lm_head`, torre visual, MTP). Con overhead de runtime, se puede estimar un suelo de 12-14 GB, dejando el resto para caché KV y estados SSM. Estimación propia, no publicada por el autor.
- GPU recomendadas: A100 40 GB es la configuración validada y la que aparece en el perfil publicado (con potencia fijada a 400 W). No se documentan pruebas en H100, L40S ni otras tarjetas.
- GPU de consumo: por tamaño de pesos cabría en tarjetas de 24 GB (RTX 3090/4090) con contexto reducido, pero no hay ninguna medición publicada que lo confirme; los 40.960 tokens de contexto y 128 secuencias concurrentes del perfil de referencia no son alcanzables en 24 GB.
- Opciones de despliegue: vLLM 0.32.0 es el único runtime soportado de forma explícita (formato `compressed-tensors`, decodificación especulativa MTP, caché SSM en float16). No hay conversión GGUF ni instrucciones para llama.cpp u Ollama en la información disponible.
- Latencias medidas: p95 TTFT de 1,30 s y p95 TPOT de 25 ms en la ejecución final, con 169 julios por petición. Throughput en tokens/s: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MANGO1.5-Qwen3.5-9B W8A8-INT8) | 9,65B | 40.960 tokens en config. de referencia | INT8 W8A8 (MLP y atenciones), resto bf16 | Apache 2.0 | Pesos publicados en HF, 0 descargas |
| CMKL/MANGO1.5-Qwen3.5-9B (base BF16) | 9,65B | No disponible | BF16 | Apache 2.0 (según remisión de la model card) | Modelo de referencia, upstream |
| Qwen/Qwen3.5-9B (upstream de la arquitectura) | 9B (aproximado) | No disponible | BF16 | Apache 2.0 (enlace de licencia en la model card) | Público |

No hay en la información disponible datos de otras cuantizaciones INT8 W8A8 comparables de la misma familia, ni resultados de benchmarks comunes que permitan una comparación cuantitativa entre estas tres variantes más allá de las métricas del grader de GreenMind.

## Limitaciones y advertencias

- Cuantización RTN sin calibración ni fine-tuning: el propio autor advierte de posibles diferencias de calidad frente a BF16 en tareas que no se midieron. La cuantización per-output-channel sin datos de calibración tiende a penalizar capas con distribuciones de pesos muy asimétricas.
- Evaluación acotada: los resultados provienen únicamente de las seis clases del grader de GreenMind, y siempre sobre el stack de serving completo con middleware de thinking budget. No equivalen al rendimiento aislado de los pesos ni cubren dominios fuera de esas clases.
- Idiomas: solo tailandés e inglés están declarados. El comportamiento en castellano no está evaluado ni documentado, por lo que no debería asumirse paridad con el inglés.
- Alucinación: no hay documentación sobre tasas de alucinación ni sobre el entrenamiento de alineación del modelo base (no se indica RLHF/DPO), lo que impide estimar su fiabilidad en dominios factuales.
- Licencia: los metadatos declaran Apache 2.0, pero la model card remite a la licencia del modelo base y al enlace de Qwen3.5-9B. Conviene verificar los términos aplicables antes de un uso comercial, especialmente por las condiciones del modelo upstream.
- Madurez: el repositorio tiene 0 descargas y 0 «likes», y se publicó como artefacto de un hackathon. No hay validación independiente de las cifras ni historial de mantenimiento.
- Dependencia de runtime: requiere vLLM 0.32.0 y `compressed-tensors`; las activaciones INT8 dinámicas dependen del kernel, y el uso de la decodificación especulativa depende de la caché SSM en float16. Desplegarlo en otras versiones o runtimes no está soportado.
- Cabeza MTP y torre visual en bf16: incrementan el peso del repositorio (12,4 GB) por encima de los ~9,7 GB teóricos de los pesos INT8 y elevan el consumo de VRAM respecto a una cuantización puramente INT8.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Eggchad/MANGO1.5-Qwen3.5-9B-W8A8-INT8
- Modelo base: https://huggingface.co/CMKL/MANGO1.5-Qwen3.5-9B
- Repositorio con código, configuración de serving y resultados: https://github.com/Up2mEz/Mango-Optimization
- Licencia referenciada del upstream Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de la red social X y no guardan relación con el artefacto.
