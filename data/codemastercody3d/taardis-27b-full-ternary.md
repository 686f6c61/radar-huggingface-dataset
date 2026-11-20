# CodeMasterCody3D/taardis-27b-full-ternary

## Resumen

TAARDIS-27B Full-Ternary es una conversión post-entrenamiento del modelo Qwen/Qwen3.8-27B (26.895.998.464 parámetros) a un formato ternario extremo: cada peso, incluidos el LM head y la tabla de embeddings, se representa como un entero ternario `{-1, 0, +1} × escala`, con normas y escalas de grupo también en rejilla entera. El autor, CodeMasterCody3D, publica dos contenedores GGUF equivalentes en pesos: V1 a 2.125 bits por peso (7,16 GB) y V2 a 1,75 bits por peso (5,90 GB), este último un reempaquetado sin pérdida del primero mediante empaquetado de cinco trits por byte. El objetivo es ejecutar un transformer denso de 27B en hardware muy limitado: CPU con AVX2, GPUs de 6-8 GB o configuraciones híbridas CPU/GPU.

La innovación principal de la versión V2 es el sistema de corrección "The Doctors": 496 ramas ternarias de bajo rango entre capas que compensan el error de cuantización propagado y se cargan como adaptadores LoRA ternarios. Según la model card, esto reduce la perplejidad en wikitext (c512) de 13,61 a 11,83, a costa de 0,32 GB adicionales. El modelo se distribuye bajo licencia Apache 2.0, pero requiere un fork específico de llama.cpp porque los pesos viven en una base rotada (block-Hadamard) que el runtime estándar no sabe alinear.

Es relevante ahora porque demuestra que la cuantización ternaria post-entrenamiento con correcciones aprendidas puede acercarse a alternativas entrenadas nativamente en ternario (Ternary-Bonsai-27B de PrismML), con un tamaño total inferior y una receta de conversión abierta. No obstante, la calidad final queda unos puntos porcentuales por debajo de Bonsai, y el ecosistema de herramientas es todavía muy restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.8-27B), pesos ternarios en base rotada block-Hadamard |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de ejecución usan `-c 4096` y `-c 8192` |
| Tipos de cuantizacion | Ternario `Q1_T_g128` (1,75 bpw, V2), `Q1_0_g128` (2,125 bpw, V1), KV cache ternaria `q1_t_g128`; adaptadores LoRA ternarios (V3, 0,32 GB) y f16 (V2, 0,92 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (requiere fork de llama.cpp `q1_0_g128-port`, commit ≥ `c4c56a5` para LoRA ternario) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Qwen (Qwen3.8-27B) con aproximadamente 26,9 mil millones de parámetros. TAARDIS no reentrena el modelo: aplica un pipeline de conversión post-entrenamiento que rota los pesos a una base block-Hadamard, los cuantiza a ternario `{-1, 0, +1}` con escalas de grupo en rejilla entera (pilas de dígitos balanced-ternary k8/k6 para normas y escalas) y empaqueta los estados en un sistema numeral base-3 (cinco trits por byte en V2, cuatro códigos de 2 bits por byte en V1). La conversión incluye LM head y embeddings, algo poco habitual en cuantizaciones ternarias.

Sobre los pesos congelados se entrenan "The Doctors", 496 ramas ternarias de bajo rango cruzadas entre capas que corrigen el error de cuantización propagado. Se cargan como LoRA en tiempo de inferencia y son independientes del contenedor (sirven tanto para V1 como para V2). No se detalla en la información disponible el volumen de tokens de entrenamiento de las correcciones, la composición del dataset ni si hubo RLHF/DPO; tampoco se especifican innovaciones como decodificación especulativa o atención lineal. El autor declara que el desarrollo se realizó en solitario durante 51 días con GPUs gratuitas de Colab/Kaggle y un equipo de sobremesa.

## Capacidades

- Generación de texto conversacional: la model card incluye ejemplos de prompt-respuesta tipo "Q: Why is the sky blue? A:".
- Razonamiento y conocimiento general heredados del modelo base Qwen3.8-27B (no se documentan evaluaciones específicas tras la cuantización).
- Generación de código y matemáticas: capacidad presumible del base, sin benchmarks publicados en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card solo muestra ejemplos en inglés.
- Capacidades especiales: caché KV ternaria (`q1_t_g128`) para reducir memoria en contexto largo; carga de correcciones vía `--lora`; ejecución híbrida CPU/GPU con offload selectivo de capas FFN.

## Casos de uso

- Inferencia en CPU de sobremesa: con el fichero V1 (2,125 bpw) y kernels AVX2, un 27B ocupa unos 8 GB de RAM y rinde aproximadamente 3 t/s en un Ryzen 3600 de 12 hilos, lo que permite prototipos y asistentes locales sin GPU.
- Despliegue en GPU de gama baja: el fichero V2 (5,90 GB) más los Doctors V3 (0,32 GB) caben en tarjetas de 8 GB; en una RX 5600 XT de 6 GB con split FFN en CPU se midieron 4,15 t/s frente a 2,85 t/s en CPU pura.
- Servicio local con `llama-server`: el fork compila el target `llama-server`, de modo que puede exponerse una API compatible con endpoints para integrarse en aplicaciones internas con presupuesto de VRAM reducido.
- Procesamiento de documentos con contexto medio: los ejemplos oficiales usan ventanas de 4096 y 8192 tokens con caché KV ternaria, adecuadas para resumen y extracción sobre documentos de varias páginas.
- Investigación en cuantización extrema: la receta abierta (fork y herramientas publicadas) permite reproducir la conversión, comparar V1 y V2 y estudiar el efecto de las correcciones de bajo rango sobre la perplejidad.
- Evaluación comparativa de métodos ternarios: sirve como referencia reproducible frente a modelos entrenados nativamente en ternario, con comandos de verificación de perplejidad incluidos (`llama-perplexity -m <file> -f wiki.test.raw -c 512`).
- Experimentación educativa y demos: el tamaño de descarga (5,90 GB) y la ejecución en hardware consumer facilitan talleres y pruebas de concepto sobre modelos de 27B.

## Benchmarks y rendimiento

| Metrica | TAARDIS-27B V2 | TAARDIS-27B V1 | Ternary-Bonsai-27B |
|---|---|---|---|
| Perplejidad wikitext c512 (solo pesos) | 13,6114 | 13,61 | no disponible |
| Perplejidad wikitext c512 (con Doctors) | 11,8346 | no disponible | 11,01 |
| Tamano GGUF ternario | 5,90 GB (1,75 bpw) | 7,16 GB (2,125 bpw) | 7,17 GB (2,125 bpw) |
| Tamano con correcciones | 6,22 GB (Doctors V3) | no disponible | no disponible |
| Decodificacion GPU (kernels fusionados, Blackwell) | 90 t/s | 101 t/s | no disponible |
| Decodificacion CPU (AVX2, Ryzen 3600, 12 hilos) | más lenta (unpack base-3) | ~3 t/s | no disponible |
| Split GPU 6 GB + CPU (RX 5600 XT + Ryzen 3600) | no disponible | 4,15 t/s | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica de calidad reportada es la perplejidad en wikitext.

## Requisitos de hardware

- VRAM/RAM para inferencia: V2 requiere 5,90 GB de pesos; con Doctors V3, 6,22 GB. V1 requiere 7,16 GB. La caché KV ternaria reduce adicionalmente el consumo en contexto largo.
- GPU recomendadas: el autor reporta cifras con kernels fusionados en arquitectura Blackwell (90-101 t/s); el fork compila para CUDA (`-DGGML_CUDA=ON`, `CMAKE_CUDA_ARCHITECTURES=75`), ROCm/HIP (`-DGGML_HIP=ON`) y CPU AVX2 sin cambios de código.
- GPU consumer: cabe en tarjetas de 8 GB con V2 + Doctors; en 6 GB funciona con offload de las capas FFN a RAM (medido en RX 5600 XT). En CPU pura, V1 ocupa unos 8 GB de RAM.
- Opciones de despliegue: exclusivamente el fork `taardis-llama.cpp` (rama `q1_0_g128-port`), con targets `llama-cli`, `llama-server` y `llama-perplexity`. llama.cpp estándar, Ollama, vLLM o TGI no son compatibles: el modelo estándar carga el fichero pero produce basura (perplejidad ≈ 1.260.000).
- Latencia y throughput: ~3 t/s en CPU (Ryzen 3600, 12 hilos, V1); 4,15 t/s con split 6 GB GPU + CPU; 90 t/s (V2) y 101 t/s (V1) en GPU Blackwell con kernels fusionados. No hay datos de latencia por petición ni de throughput en modo servidor concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad wikitext c512 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAARDIS-27B V2 (con Doctors) | 26,9B denso | no disponible (ejemplos a 4-8k) | 11,8346 | Apache 2.0 | GGUF en HF, requiere fork |
| Ternary-Bonsai-27B (PrismML) | ~27B (no confirmado) | no disponible | 11,01 | no disponible | publicado el 4 de julio de 2026, receta cerrada |
| Qwen/Qwen3.8-27B (base) | 26,9B denso | no disponible | no disponible | no disponible en la información | HF |

Frente a Bonsai, TAARDIS ocupa menos espacio (6,22 GB con correcciones frente a 7,17 GB del modelo solo), mantiene normas y escalas en rejilla entera, ofrece caché KV ternaria y publica la receta de conversión; a cambio, la calidad es unos puntos porcentuales inferior porque Bonsai entrena sus pesos ternarios. No se dispone de datos para comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Requiere obligatoriamente el fork de llama.cpp del autor; con llama.cpp estándar el modelo produce salida incoherente. Para LoRA ternario se necesita un build ≥ `c4c56a5`.
- La calidad medida es inferior a la de Ternary-Bonsai-27B (11,83 frente a 11,01 de perplejidad), y no hay benchmarks de tareas (razonamiento, código, matemáticas) que confirmen el comportamiento tras la cuantización.
- La cuantización ternaria agresiva puede degradar instrucciones, tool calling y coherencia en contextos largos; no se documenta ninguno de estos extremos.
- Idiomas soportados no documentados; los ejemplos son solo en inglés, por lo que el rendimiento en castellano es incierto.
- Riesgo de alucinación heredado del modelo base y potencialmente amplificado por el error de cuantización; se recomienda verificación humana en producción.
- Sesgos conocidos del modelo base no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de un fork no auditado y de kernels personalizados (CPU AVX2, CUDA, HIP) implica riesgos de mantenimiento y de soporte a largo plazo.
- El proyecto lo mantiene una sola persona; no hay garantías de actualizaciones, parches de seguridad ni soporte.
- El contexto máximo real no está especificado; usar ventanas mayores de 8192 tokens sin validar puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CodeMasterCody3D/taardis-27b-full-ternary
- Fork de llama.cpp: https://github.com/CodeMasterCody3D/taardis-llama.cpp (rama `q1_0_g128-port`)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o demo adicionales: no disponible
