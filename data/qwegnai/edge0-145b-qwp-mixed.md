# qwegnai/Edge0-145B-QWP-Mixed

## Resumen

Edge0-145B-QWP-Mixed es un empaquetado de pesos cuantizados del modelo Edge0-145B-NVFP4, publicado por el usuario qwegnai para su uso exclusivo con el motor de inferencia Qwegn (version 0.20.0 o superior). No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint NVFP4 original a los contenedores propietarios QWP1 y QNGRAM v3 del motor Qwegn, con el objetivo de ejecutarlo de forma nativa en Apple Silicon (Metal) con memoria unificada.

El modelo subyacente es un transformer híbrido MoE de 48 capas que combina 12 capas de Query-Aware Sparse Attention (QSA) con 36 capas Gated-DeltaNet (GDN), 512 expertos (10 enrutados más 1 compartido activos por token), Hyper-Connections de 4 ramas, embeddings por capa de 4-gramas (PLE), una cabeza MTP para decodificación especulativa y una torre de visión. El pack ocupa 83,13 GiB en disco y está diseñado para caber y ejecutarse de forma residente en un Mac de 128 GB de memoria unificada.

Su relevancia es acotada pero específica: demuestra una ruta de despliegue de un MoE de gran tamaño en hardware de consumo Apple con cuantización mixta (HQ8 para el tronco denso, HQ4 para los expertos enrutados, VQ2 para las tablas PLE) y contexto cualificado hasta 1M de tokens. No es un checkpoint portable: solo carga en Qwegn y no es compatible con safetensors, GGUF ni MLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 48 capas (12 QSA + 36 GDN), 512 expertos, Hyper-Connections de 4 ramas, PLE de 4-gramas, cabeza MTP, torre de visión |
| Parametros totales | no disponible (el nombre comercial indica 145B, no confirmado en la información) |
| Parametros activos | 10 expertos enrutados + 1 compartido por token (número de parámetros activos no disponible) |
| Longitud de contexto | 262.144 tokens nativos; cualificado hasta 300K, 320K, 512K y 1.048.576 tokens |
| Tipos de cuantizacion | HQ8_G32 (tronco denso), HQ4_G64 (expertos MoE enrutados), BF16 (norms, routers, embeddings), VQ2_G32 (tablas PLE); KV cache q4 y q8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QWP1 (`model.qwp`) + QNGRAM v3 (`assets/ngram.bin`); no es safetensors, GGUF ni MLX |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un MoE híbrido de 48 capas que alterna atención dispersa Query-Aware Sparse Attention (12 capas) con capas Gated-DeltaNet (36 capas), un esquema que mezcla atención tradicional con mecanismos de estado lineal para gestionar contexto largo. El MoE cuenta con 512 expertos, de los cuales 10 enrutados más 1 compartido están activos por token. Incorpora Hyper-Connections de 4 ramas, embeddings por capa basados en 4-gramas (PLE), una cabeza MTP (Multi-Token Prediction) para decodificación especulativa y una torre de visión.

No se dispone de información sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. El pack QWP-Mixed no entrena nada: es una conversión de pesos desde `Edge0/Edge0-145B-NVFP4` mediante dequantización de bloques NVFP4 en dos niveles (`f8_e4m3 + f32`) y posterior cuantización Hadamard mixta. La tabla PLE se empaqueta en formato QNGRAM v3 VQ2_G32 con 320.001.536 filas de 160 dimensiones a 90 bytes por fila (27,13 GiB).

## Capacidades

- Generación de texto y razonamiento: el modelo base está orientado a text-generation; las evaluaciones del pack reportan 9/10 en Code-10 y 9/10 en Core-10 con contexto de 16.384 tokens.
- Razonamiento multi-paso y agentes: la suite agentic de llmprobe reporta 7/8 escenarios superados.
- Codigo: evaluación Code-10 con 90% de acierto según el autor.
- Contexto largo: recuperación de 3 agujas en 3/3 a 16K, 128K y 300K tokens, con modos YaRN (1,25x) y RoPE crudo.
- Decodificación especulativa: la cabeza MTP permite modos `mtp3` con incrementos de throughput reportados (67,59 tok/s frente a 44,19–44,74 tok/s en decodificación estándar).
- Vision: incluye torre de visión, aunque el modo por defecto del pack la deja sin mapear (`--no-load-vision`); se puede cargar explícitamente.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos en local: con contexto cualificado hasta 1M de tokens y recuperación verificada a 300K, el modelo permite analizar contratos, informes o bases de código extensas en un único Mac de 128 GB sin enviar datos a la nube.
- Asistencia de código en estación de trabajo Apple: los 9/10 en Code-10 y la decodificación especulativa (hasta 116,4 tok/s en servidor) lo hacen adecuado para autocompletado y revisión de código en local sobre Metal.
- Agentes autónomos de múltiples pasos: el 7/8 en la suite agentic y la ventana de contexto larga permiten mantener estado de tareas prolongadas con historial extenso.
- Servicio de inferencia multiusuario en un solo equipo: el agregado de 4 streams concurrentes reportado (102,6 tok/s) y la caché de prefijo en caliente (TTFT de 8 ms) permiten atender varias sesiones desde un Mac con memoria unificada.
- Análisis de imágenes con texto asociado: al cargar la torre de visión de forma explícita, se pueden procesar documentos escaneados o capturas junto a instrucciones textuales largas.
- Investigación en cuantización y motores de inferencia: el pack sirve como referencia reproducible de cuantización mixta Hadamard (HQ8/HQ4/VQ2) y de gestión de residencia en memoria unificada para estudiar compromisos entre precisión y huella de memoria.
- Despliegue con streaming desde NVMe: el modo `--stream-ngrams` reduce la memoria planificada a 58,30 GiB a 4K y 69,73 GiB a 1M, útil para equipos con menos memoria unificada disponible.

## Benchmarks y rendimiento

Resultados reportados por el autor en Apple M5 Max (128 GB, GPU de 40 núcleos, 585 GB/s), con `--kv-mode q4 --temperature 0`:

| Metrica | Resultado |
|---|---|
| Prefill 4K / 8K | 2.572,0 / 2.568,4 tok/s |
| Prefill 32K / 65K / 131K / 256K | 2.291,8 / 2.132,3 / 2.051,7 / 1.899,3 tok/s |
| TTFT en frío / en caliente (caché de prefijo) | 0,28 s / 8 ms (119,8x) |
| Decodificación estándar | 44,19–44,74 tok/s |
| Decodificación especulativa (mtp3) | 67,59 tok/s (+10,24% CLI); 80,9 tok/s novel / 116,4 tok/s (1,76x) en servidor |
| Agregado 4 streams concurrentes | 102,6 tok/s |
| Conformidad / Capacidad / Fidelidad / Agentic (llmprobe) | 140/141 (99,3%) / 100% / 36/36 / 7/8 |
| Code-10 / Core-10 a 16.384 | 9/10 (90%) / 9/10 (90%) |
| Recuperación de 3 agujas a 16K / 128K / 300K | 3/3 (100%) a 2.507,8 / 1.918,7 / 1.885,5 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las cifras anteriores son métricas del motor Qwegn y evaluaciones propias del autor, no comparables directamente con suites académicas.

## Requisitos de hardware

- Memoria: 83,13 GiB en disco (56,00 GiB de backbone + 27,13 GiB de tabla PLE). En ejecución residente: 85,36 GiB planificados a 4K con KV q4; 102,99 GiB a 1M con KV q8.
- Modo con streaming desde NVMe: 58,30 GiB a 4K y 69,73 GiB a 1M con `--stream-ngrams`.
- Hardware objetivo: Apple Silicon con Metal; el autor reporta pruebas en un Mac M5 Max con 128 GB de memoria unificada y GPU de 40 núcleos. No hay datos de funcionamiento en GPU NVIDIA, AMD u otras plataformas.
- GPU de consumo: no aplica en el sentido habitual; requiere un Mac con memoria unificada suficiente (128 GB recomendados). No se ha validado en equipos con menos memoria.
- Opciones de despliegue: exclusivamente el motor Qwegn (v0.20.0+), mediante `qwg pull` y `qwg serve`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Throughput y latencia: ver tabla de benchmarks; decodificación de 44,19–44,74 tok/s estándar y hasta 116,4 tok/s con decodificación especulativa en servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Edge0-145B-QWP-Mixed | 145B (nominal; activos no disponibles) | 262K nativo, hasta 1M cualificado | QWP1 + QNGRAM v3 / solo Qwegn | Apache 2.0 | Hugging Face (0 descargas) |
| Edge0/Edge0-145B-NVFP4 (base) | 145B (nominal) | 262K nativo | NVFP4 | no disponible | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- Portabilidad nula: el pack solo carga en Qwegn v0.20.0+; no funciona en vLLM, llama.cpp, Ollama, TGI, MLX ni con safetensors o GGUF.
- Requisito de hardware muy específico: pensado para Apple Silicon con 128 GB de memoria unificada; no hay evidencia de funcionamiento en otras plataformas.
- Cifras de rendimiento autoevaluadas: los benchmarks proceden del autor y de herramientas propias (llmprobe, paired_perf), sin validación independiente; además, el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe ni determinar qué lenguas cubre el modelo base.
- Sesgos y alucinaciones: no hay información sobre evaluación de sesgos ni sobre tasas de alucinación; al ser un modelo de 145B sin documentación de alineamiento, el riesgo de alucinación debe asumirse como no cuantificado.
- Licencia Apache 2.0 en el pack, pero la licencia y condiciones del modelo base (`Edge0/Edge0-145B-NVFP4`) no están disponibles en la información; conviene verificar antes de un uso comercial.
- Contexto más allá de 262K: las pruebas a 300K, 512K y 1M usan YaRN y RoPE crudo con modos específicos del motor; el comportamiento fuera de esos ajustes no está documentado.
- Visión desactivada por defecto: el modo por defecto no mapea la torre de visión; para usarla hay que cargarla explícitamente, con el coste de memoria asociado.

## Enlaces

- Hugging Face: https://huggingface.co/qwegnai/Edge0-145B-QWP-Mixed
- Modelo base: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Motor Qwegn: https://github.com/qwegnai/qwegn
