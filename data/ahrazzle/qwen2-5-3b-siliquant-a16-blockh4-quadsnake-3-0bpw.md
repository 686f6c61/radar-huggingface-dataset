# ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadSnake-3.0bpw

## Resumen

Este repositorio contiene una versión cuantizada del modelo Qwen2.5-3B, desarrollada por el usuario ahrazzle, que aplica una técnica de cuantización de retícula denominada Siliquant sobre los pesos originales en bfloat16. El resultado es un checkpoint de aproximadamente 1.890 MiB (frente a los 5.886 MiB del modelo base en BF16), lo que supone una reducción de tamano de 3,12x, con un ratio efectivo de 3,9116 bits por peso en las capas lineales cuantizadas.

La relevancia de esta ficha no reside en el modelo base (Qwen2.5-3B, ya conocido y ampliamente evaluado), sino en el formato de compresión `siliquant-hf-v1`, que promete una reconstrucción sin pérdidas de los pesos cuantizados mediante un código Extended Hamming [16, 11, 4] combinado con transformadas de Hadamard por bloques (Block-H4) y empaquetado de cocientes con desbordamiento CSR. El autor certifica cero errores de síndrome en 173.408.256 bloques y una diferencia máxima de ida y vuelta de 0,0, es decir, reconstrucción bit a bit exacta del contenedor.

El modelo se distribuye con `transformers` estándar (requiere `trust_remote_code=True`) y no necesita compilación de kernels CUDA personalizados para su uso básico, aunque incluye kernels de referencia en PTX para Ampere (sm_86) y AVX-512 para CPU. La licencia heredada es la Qwen Research License, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), con capas lineales cuantizadas en formato Siliquant (`siliquant-hf-v1`) |
| Parametros totales | 1.628.452.742 (según safetensors del repo cuantizado); el modelo base Qwen2.5-3B declara 3B nominales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B, no confirmada aquí) |
| Tipos de cuantizacion | Siliquant A_16 Extended Hamming [16,11,4], Block-H4, group size g=128, objetivo 3,0 bpw, efectivo 3,9116 bpw; pesos no lineales en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License) |
| Formato de pesos | safetensors (formato `siliquant-hf-v1` con decodificador Python y kernels de referencia opcionales) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-3B, un transformer decoder-only de la familia Qwen2.5. Sobre él, este repositorio no reentrena ni hace fine-tuning: aplica una cuantización post-entrenamiento propietaria denominada Siliquant. Cada vector de 16 pesos se representa como un elemento de la retícula `A_16 = 2 Z^16 + C_[16,11,4]`, donde `C` es un código Extended Hamming [16, 11, 4]. La información se almacena en tres componentes: `qham11` (11 bits sistemáticos por bloque de 16, que reconstruyen algebraicamente los 5 bits de paridad en las posiciones {0, 1, 2, 4, 8}), `qquot` (cociente entero empaquetado por capa, con `k_bits` en {2, 3, 4} y desbordamiento CSR compacto) y escalas en patrones de bits IEEE-754 exactos (`scales_fp16_bits`, `colscale_fp32_bits`) para evitar la truncación de mantisa al convertir a bfloat16.

El proceso de cuantización se realizó con la receta `b30_hA16_BlockH4_quad_snake_real`, con grupo de 128 y objetivo de 3,0 bpw, sobre 252 capas lineales (2.774.532.096 pesos). Las capas `embed_tokens`, `lm_head`, RMSNorms y sesgos se preservan en bfloat16. La verificación de integridad reporta 0 errores de síndrome en 173.408.256 bloques y una diferencia máxima de ida y vuelta de 0,0. No se dispone de información sobre datos de entrenamiento adicionales, RLHF/DPO ni innovaciones de decodificación más allá del propio esquema de compresión.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-3B.
- Razonamiento y matemáticas de nivel medio, limitado por el tamano del modelo base (3B nominales).
- Generación de código, con soporte para lenguajes habituales según el modelo base.
- Capacidad multilingüe heredada de Qwen2.5, aunque los idiomas concretos no se detallan en la información proporcionada.
- No se documenta soporte de tool calling, function calling ni modo agente en la información disponible; debe asumirse el comportamiento del modelo base sin garantías adicionales.
- No se documenta visión, audio ni modo thinking.
- La capacidad diferencial de este repositorio es la compresión: permite servir el modelo con menor huella de memoria manteniendo fidelidad de pesos verificada bit a bit.

## Casos de uso

- Despliegue en GPUs de consumo con VRAM limitada: el checkpoint de 1.890 MiB permite cargar el modelo en tarjetas de 8 GB o incluso 6 GB, dejando margen para el contexto y el runtime, algo inviable con el BF16 de 5.886 MiB.
- Inferencia en CPU con AVX-512: el kernel de referencia `avx512_a16_blockh4.c` (con `vpermb`, `vpopcntq`, `vpdpbusd`) está pensado para decodificar el formato en servidores x86 sin GPU, útil para entornos de borde o CI.
- Evaluación de técnicas de cuantización: el repositorio incluye métricas certificadas (KL, perplejidad, top-1 match) que permiten comparar Siliquant frente a otras cuantizaciones (BlockH2 3bpw, global sort 3bpw) con datos reproducibles.
- Prototipado de asistentes conversacionales ligeros: al ser un modelo de 3B parámetros con licencia de investigación, sirve para experimentación académica en diálogo multi-turno sin requerir hardware de datacenter.
- Investigación en formatos de compresión sin pérdidas: el contenedor `siliquant-hf-v1` con verificación SHA-256 y síndromes es un caso de estudio para integridad de pesos en pipelines de distribución de modelos.
- Generación de código en entornos de recursos limitados: el modelo base Qwen2.5-3B tiene capacidades de código razonables, y esta versión permite ejecutarlo en portátiles con GPU modesta para autocompletado o asistencia local.
- Exportación a otros motores: el CLI `siliquant_dequant.py unpack` permite generar pesos densos en BF16 para usarlos en vLLM, llama.cpp u otros motores que no soporten el formato nativo.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de fidelidad de la cuantización respecto al modelo base en BF16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Se presentan a continuación tal cual:

| Corpus / Métrica | BF16 (base) | Siliquant 3,0 bpw |
|---|---|---|
| Perplejidad WikiText-2 | 10,970193 | 12,140713 |
| Perplejidad CPython | 3,111936 | 3,59318 |
| KL medio WikiText-2 | — | 0,168874 |
| KL medio CPython | — | 0,15101 |
| Top-1 match WikiText-2 | — | 81,4824 % |
| Top-1 match CPython | — | 86,4726 % |
| Delta KL vs BlockH2 3bpw (WikiText-2) | — | -11,42 % (0,168874 vs 0,190650) |
| Delta KL vs global sort 3bpw (WikiText-2) | — | -14,38 % (0,168874 vs 0,197239) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1.890 MiB en disco; en memoria, la decodificación a bfloat16 puede requerir más, pero el kernel de referencia empaquetado opera en 4 bits fijos, por lo que se estima un uso de VRAM en el rango de 2 a 4 GB según el runtime y la longitud de contexto (estimación, no dato oficial).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; el kernel PTX de referencia está optimizado para Ampere `sm_86` (RTX 30xx, A10, A40).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 3070 8 GB, e incluso en tarjetas de 6 GB con contexto corto.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (soporte nativo); exportación a BF16 denso con `siliquant_dequant.py unpack` para usar en vLLM, llama.cpp, Ollama o TGI; kernels de referencia AVX-512 para CPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadSnake-3.0bpw | 1.628.452.742 (safetensors) | no disponible | Siliquant 3,0 bpw (3,9116 efectivo) | qwen-research | Hugging Face |
| Qwen/Qwen2.5-3B (BF16) | 3B nominales | no disponible | BF16 | qwen-research | Hugging Face |
| Cuantizaciones GPTQ/AWQ de Qwen2.5-3B | 3B nominales | no disponible | 4 bits (típico) | qwen-research | Hugging Face (múltiples autores) |

No se dispone de datos de benchmarks de tareas para comparar rendimiento funcional frente a alternativas; solo se pueden comparar métricas de fidelidad de cuantización publicadas por el autor.

## Limitaciones y advertencias

- Licencia Qwen Research License: restringe el uso comercial; es imprescindible revisar los términos upstream antes de cualquier despliegue productivo.
- Modelo de 3B parámetros: capacidad de razonamiento y conocimiento factual limitada en comparación con modelos de mayor tamano; riesgo de alucinación inherente al modelo base.
- La cuantización introduce degradación medible: perplejidad en WikiText-2 sube de 10,97 a 12,14 y el top-1 match cae al 81,48 %, lo que puede afectar a tareas sensibles a la fidelidad de logits.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación independiente de las métricas certificadas por el autor.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de usar en entornos sensibles.
- El formato `siliquant-hf-v1` no es estándar: la compatibilidad con motores de inferencia populares (vLLM, llama.cpp, TGI) no es directa y requiere exportación previa a BF16.
- No se documentan idiomas soportados ni sesgos específicos; debe asumirse el comportamiento del modelo base Qwen2.5-3B.
- Las fechas de creación y actualización del repositorio (2026) no coinciden con el ciclo de vida conocido de Qwen2.5; conviene verificar la procedencia y reproducibilidad del checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadSnake-3.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia upstream: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Repositorio de investigación Siliquant: https://github.com/Moissanite-Labs/siliquant
- PR #83: https://github.com/Moissanite-Labs/siliquant/pull/83
- PR #85: https://github.com/Moissanite-Labs/siliquant/pull/85
- PR #91: https://github.com/Moissanite-Labs/siliquant/pull/91
- PR #93: https://github.com/Moissanite-Labs/siliquant/pull/93
- PR #95: https://github.com/Moissanite-Labs/siliquant/pull/95
