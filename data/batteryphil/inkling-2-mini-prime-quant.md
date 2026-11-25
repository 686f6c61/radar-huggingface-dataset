# batteryphil/Inkling-2-Mini-PRIME-Quant

## Resumen

Inkling-2-Mini-PRIME-Quant es una cuantización extrema del modelo base `thinkingmachines/Inkling-2-Mini`, desarrollado por Thinking Machines y distribuido en Hugging Face por el usuario `batteryphil`. Se trata de un transformer con arquitectura MoE (mixture of experts) y bucle de pasadas (looped transformer) de 26,4 mil millones de parámetros, donde 12 de las 24 capas físicas se ejecutan tres veces por token, dando lugar a 48 aplicaciones lógicas de capa. El objetivo de esta versión es hacer viable la inferencia íntegra en GPU de consumo de 12 o 16 GB, sin descarga a CPU, algo imposible con el checkpoint oficial.

El autor aplica una técnica propia denominada PRIME-Quant, que combina codebooks de escala con signo Prime-Harmonic de 2 bits (`P2_G32`, 2,50 bits por peso) y 4 bits (`P4_G32`, 4,50 bits por peso), junto con un runtime de decodificación fusionado en Triton y un motor de ejecución basado en grafos HIP/CUDA. Se ofrecen dos variantes: una de máxima compresión (8,83 GB, todos los bancos de expertos a 2 bits) y otra híbrida recomendada (10,87 GB) que promociona a 4 bits las ocho capas de mayor sensibilidad dentro del bucle.

La relevancia actual del modelo reside en que demuestra que un MoE de 26,4B con bucle puede ejecutarse a 52-56 tok/s en una GPU de 16 GB (Radeon RX 9060 XT, RDNA4) manteniendo una divergencia KL media de 0,0542 frente a la referencia BF16 y una concordancia Top-1 del 93,35%. La licencia es propietaria y restrictiva: gratuita para uso personal y con un umbral del 5% para uso comercial, lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de 3 pasadas en capas 6-17 (looped transformer) |
| Parametros totales | 26,39B (26,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 16K en GPU de 16 GB (según variante y VRAM) |
| Tipos de cuantizacion | PRIME-Quant 2-bit (`P2_G32`, 2,50 bpw) y 4-bit (`P4_G32`, 4,50 bpw); checkpoint base NVFP4+MXFP8 |
| Idiomas soportados | inglés y multilingüe |
| Licencia | `bartsch-personal-free-5pct-commercial` (gratuita personal, comercial hasta 5%) |
| Formato de pesos | safetensors (`inkling2_mini_p2_looptop8.safetensors`, `inkling2_mini_p2_maxcomp.safetensors`) |
| Parametros cuantizados | 99,85% (26,35B / 26,39B); 0,15% (40,2M) en BF16/FP32 |
| Tamano en disco (loop_top8) | 10,87 GB |
| Tamano en disco (maxcomp) | 8,83 GB |
| Tamano del repo | 19,7 GB |
| Libreria | transformers |
| Pipeline | text-generation (image-text-to-text en tags) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 24 capas físicas, de las cuales las capas intermedias (L6 a L17, 12 capas) se ejecutan tres veces por token, generando 48 aplicaciones lógicas de capa. Cada capa MoE contiene 128 expertos, y el modelo incorpora además una torre ViT de 23 capas para entrada de imagen, mecanismos de atención con parámetros de sink por cabeza, posición relativa, una convolución corta de 4 taps y residuales de atención. La innovación estructural clave es el bucle de capas, que amplía la profundidad efectiva sin incrementar el número de parámetros físicos.

El proceso de cuantización PRIME-Quant, desarrollado por `batteryphil`, no entrena el modelo sino que comprime los pesos con codebooks Prime-Harmonic de escala con signo. La variante híbrida `loop_top8` mantiene a 2 bits los 16 bancos de expertos menos sensibles y promociona a 4 bits las ocho capas de mayor sensibilidad dentro del bucle (L5, L8, L9, L11, L12, L14, L15, L16). El runtime de decodificación está implementado íntegramente en Triton y se ejecuta mediante un único grafo HIP/CUDA, lo que reduce la sobrecarga de lanzamiento de kernels. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni sobre si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y de prosa técnica en inglés y otros idiomas (multilingüe).
- Generación y razonamiento sobre código, con especial énfasis en Python y C++ según la evaluación del autor.
- Razonamiento matemático multi-paso, incluyendo expresiones con precedencia y semántica estricta.
- Procesamiento de imagen y texto (image-text-to-text), gracias a la torre ViT de 23 capas del modelo base.
- Soporte de tool calling y conversaciones con formato de herramientas (`inkling_chat_tool` evaluado en el informe).
- Capacidad de razonamiento agéntico multi-paso, validada en el arena adversarial de compilador de hojas de cálculo y motor DAG.
- Ejecución en GPU de consumo de 12 y 16 GB sin offload a CPU.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistente de código en estación de trabajo local: el checkpoint `loop_top8` (10,87 GB) cabe en una GPU de 16 GB y ofrece 54 tok/s a 4K de contexto, suficiente para autocompletado y refactorización interactiva sin depender de la nube.
- Generación de código en pipelines de CI/CD: la concordancia Top-1 del 97,5% en Python y 97,6% en C++ frente a BF16 permite usar el modelo para generar parches y tests en entornos con GPU modesta.
- Compiladores y motores de reglas: el modelo fue evaluado en la generación de un compilador de hojas de cálculo con parser de fórmulas, detección de ciclos DFS y rollback transaccional, lo que lo hace adecuado para generar lógica de dominio con requisitos estrictos de precedencia y semántica.
- Atención al cliente multilingüe autoalojada: con contexto de hasta 16K y soporte multilingüe, puede gestionar conversaciones multi-turno en una GPU de 16 GB, evitando costes de API.
- Prototipado de agentes con tool calling: el formato `inkling_chat_tool` está evaluado explícitamente, lo que permite construir agentes que invocan funciones en local con latencia de decodificación de ~48-54 tok/s.
- Inferencia sobre documentos con imagen: la torre ViT permite tareas image-text-to-text, como extracción de datos de capturas o tablas, en el mismo hardware de consumo.
- Investigación en cuantización extrema: el modelo sirve como banco de pruebas reproducible para estudiar el impacto del 2-bit en capas con bucle, con informes de KLD y SNR por capa incluidos en el repo.

## Benchmarks y rendimiento

| Modelo / checkpoint | Disco y VRAM | Compresión vs BF16 | KLD media (1.849 tok) | PPL (ref = 2,1416) | Top-1 agree (global / Python / C++) | Decode (4K / 16K) | Cabe en |
|---|---|---|---|---|---|---|---|
| BF16 oficial (híbrido Xeon + GPU) | 52,8 GB (12,1 GPU + 40,7 RAM) | 1,00× | 0,0000 | 2,1416 | 100% | 2,62 tok/s (offload) | 64 GB+ |
| NVFP4+MXFP8 oficial (Blackwell) | 20,16 GB | 2,62× | no disponible | no disponible | no disponible | OOM en 16 GB | 24-32 GB+ |
| `loop_top8` (recomendado) | 10,87 GB | 4,86× | 0,0542 | 2,1542 (+0,0059) | 93,35% / 97,50% / 97,61% | 54,22 / 48,60 tok/s | 16 GB |
| `maxcomp` | 8,83 GB | 5,98× | 0,1138 | 2,2143 (+0,0334) | 91,35% / 95,39% / 96,90% | 56,23 tok/s (4K) | 12 y 16 GB |

Desglose por dominio del checkpoint `loop_top8` frente a BF16:

| Dominio (n_tokens) | PPL BF16 | PPL loop_top8 | KLD loop_top8 | Top-1 loop_top8 |
|---|---|---|---|---|
| `python_code` (521) | 1,3042 | 1,3190 | 0,0217 | 97,50% |
| `systems_cpp` (419) | 1,2216 | 1,2525 | 0,0181 | 97,61% |
| `math_reasoning` (390) | 1,7601 | 1,8209 | 0,0437 | 93,59% |
| `technical_prose` (216) | 6,9495 | 7,6525 | 0,1021 | 83,33% |
| `inkling_chat_tool` (303) | 6,0739 | 5,3300 | 0,1395 | 87,13% |
| Global (1.849) | 2,1416 | 2,1542 | 0,0542 | 93,35% |

La relación señal-ruido por capa MoE es de 10,04-10,12 dB en las capas a 2 bits y 23,80-23,89 dB en las de 4 bits, con medias de 14,68 dB (`gate_up`) y 14,65 dB (`down`) en los 24 bancos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 8,83 GB en residente para `maxcomp` (cabe en 12 GB); 10,87 GB para `loop_top8` (cabe en 16 GB con hasta 16K de contexto).
- GPU recomendadas: AMD Radeon RX 9060 XT (16 GB GDDR6, 320 GB/s, gfx1200 RDNA4, ROCm 7.2 / PyTorch 2.14) es la plataforma de referencia medida. El runtime Triton también funciona en NVIDIA CUDA.
- GPU de consumo compatibles: 12 GB (RTX 3060 12 GB, RX 6700 XT) para `maxcomp`; 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RX 9060 XT) para `loop_top8`.
- GPU de datacenter: el checkpoint oficial NVFP4+MXFP8 requiere 24-32 GB+ (Blackwell, DGX Spark); BF16 requiere 64 GB+.
- Despliegue: runtime Triton propio con grafo HIP/CUDA incluido; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: 54,22 tok/s a 4K y 48,60 tok/s a 16K para `loop_top8`; 56,23 tok/s a 4K para `maxcomp`. El BF16 con offload cae a 2,62 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD / calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-PRIME-Quant `loop_top8` | 26,4B (MoE, 3 pasadas) | hasta 16K | KLD 0,0542; Top-1 93,35% | personal gratis, comercial 5% | 10,87 GB, GPU 16 GB |
| Inkling-2-Mini-PRIME-Quant `maxcomp` | 26,4B (MoE, 3 pasadas) | 4K medido | KLD 0,1138; Top-1 91,35% | personal gratis, comercial 5% | 8,83 GB, GPU 12 GB |
| Inkling-2-Mini oficial NVFP4+MXFP8 | 26,4B | no disponible | referencia de compresión 2,62× | licencia del modelo base | 20,16 GB, 24-32 GB+ |
| Inkling-2-Mini oficial BF16 | 26,4B | no disponible | referencia exacta (PPL 2,1416) | licencia del modelo base | 52,8 GB, 64 GB+ |

No se dispone de datos de benchmarks estándar para comparar con modelos de otros autores de tamaño similar; la comparativa se limita a las variantes del propio modelo base.

## Limitaciones y advertencias

- La licencia `bartsch-personal-free-5pct-commercial` es propietaria y restrictiva: el uso comercial solo es gratuito hasta un umbral del 5%, y debe revisarse el archivo `LICENSE` antes de cualquier despliegue en producción.
- La cuantización a 2 bits degrada la prosa técnica (Top-1 del 83,33% y KLD de 0,1021) y el razonamiento matemático (93,59%), por lo que no es adecuada para tareas que exijan fidelidad alta en texto libre o cálculo.
- El checkpoint `maxcomp` duplica la divergencia KL respecto a `loop_top8` (0,1138 frente a 0,0542) y reduce la concordancia Top-1 global al 91,35%.
- El error de cuantización se amplifica tres veces por token en las capas con bucle, lo que hace que la elección de qué capas promocionar a 4 bits sea crítica.
- El contexto máximo verificado es de 16K en 16 GB de VRAM; no se documenta comportamiento más allá de esa longitud.
- El modelo está orientado principalmente al inglés; el soporte multilingüe no está cuantificado con métricas.
- Riesgo de alucinación inherente al modelo base, agravado por la compresión extrema; no se han publicado evaluaciones de sesgo.
- El runtime depende de Triton y de grafos HIP/CUDA; la compatibilidad con otros motores de inferencia no está garantizada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/batteryphil/Inkling-2-Mini-PRIME-Quant
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Informe KLD `loop_top8`: `benchmarks/kld_looptop8.json` (incluido en el repo)
- Informe KLD `maxcomp`: `benchmarks/kld_p2_maxcomp.json` (incluido en el repo)
- Informe SNR por capa: `benchmarks/inkling2_looptop8_report.json` (incluido en el repo)
- Arena adversarial de código: `benchmarks/test_spreadsheet_engine.py` (incluido en el repo)
- Licencia: `LICENSE` (incluido en el repo)
