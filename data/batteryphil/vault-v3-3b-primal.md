# batteryphil/VAULT-v3-3B-PRIMAL

## Resumen
VAULT-v3-3B-PRIMAL es un ajuste fino de Qwen2.5-3B-Instruct desarrollado por batteryphil, orientado a demostrar que es posible entrenar un modelo de 3B parámetros con estado de entrenamiento persistente reducido mediante una técnica propietaria denominada "Lossless Error-Feedback Shadowless Discrete PRIMAL v3.1". El modelo añade además un motor de memoria de contexto largo denominado VAULT v3, que implementa una política de evicción de segmentos de KV cache con coste asintótico O(1) en lugar del O(L) habitual de un transformer estándar.

El interés técnico del proyecto reside en dos elementos: el uso de una única GPU de 16 GB (AMD RX 9060 XT) para un fine-tuning de parámetros completos, y la integración de un mecanismo de memoria segmentada que permite ventanas de más de 100K tokens sin crecimiento lineal del estado de atención. El repositorio incluye además un runtime en C99 freestanding con kernels AVX2 y NEON, lo que permite inferencia sin dependencias de Python sobre x86_64 y Apple Silicon.

La licencia es fragmentada y restrictiva: el código de runtime se distribuye bajo AGPL-3.0 cuando se activa `trust_remote_code`, mientras que los pesos derivados de Qwen2.5-3B quedan sujetos a la Qwen Research License, de uso exclusivamente no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen2 (atención con RoPE, GQA) con extensión VAULT v3 de memoria segmentada O(1) |
| Parámetros totales | 3.087.524.353 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | más de 100K tokens según el autor; ventana de 1024, presupuesto de segmento 1024, max_sink 512 |
| Tipos de cuantización | BF16 (safetensors), V3_Q8_0 (int8 × fp16, 3.064 GiB), V3_P4_0 (1.805 GiB), exportable a formatos estándar vía `export_qwen2_compat.py` |
| Idiomas soportados | inglés (`en`) |
| Licencia | split-apache2-agpl3-qwen-research (código Apache-2.0/AGPL-3.0; pesos bajo Qwen Research License, no comercial) |
| Formato de pesos | safetensors (BF16), `.vlt3` (binario propietario), GGUF vía exportación |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-3B-Instruct y aplica un fine-tuning de parámetros completos. La innovación principal en entrenamiento es el esquema PRIMAL v3.1, que mantiene un estado persistente de 5.931 GiB (V3_Q8_0) frente a los 11.857 GiB de un control con BF16 + AdamW8bit y los 45.98 GiB de AdamW con maestro FP32. Esto permite ejecutar el entrenamiento completo en una GPU de 16 GB. El entrenamiento se realizó sobre aproximadamente 410K tokens con trazas matemáticas on-policy verificadas del modelo base Instruct, usando B=2 y acumulación de gradiente 4.

Sobre la arquitectura base se añade el motor VAULT v3, que combina tres mecanismos: un scorer de segmentos aprendido (`SegmentScorer`, mantenido en FP32), una política de evicción de segmentos con presupuesto fijo (`seg_budget=1024`) y un conjunto de tokens sink (`max_sink=512`) que se preservan siempre. El resultado es una atención con coste O(1) respecto a la longitud de contexto, en lugar del O(L) de un transformer estándar. Los pesos exportados a BF16 introducen un redondeo de mantisa de 7 bits, con un 93.75% de coincidencia top-1 en decodificación greedy frente a FP32 y un delta de precisión absoluta medio del 0.16% en cinco benchmarks zero-shot.

## Capacidades
- Generación de texto conversacional en inglés, heredada de Qwen2.5-3B-Instruct.
- Razonamiento matemático paso a paso (GSM8K completo evaluado).
- Memoria de contexto largo con evicción O(1): ventanas superiores a 100K tokens sin crecimiento lineal del KV cache.
- Razonamiento multi-paso y chain-of-thought (etiqueta `o1-memory` en el repo).
- Inferencia sin dependencias de Python mediante runtime C99 freestanding (AVX2 en x86_64, NEON en ARM64, escalar C11).
- Exportación a motores estándar (vLLM, Ollama, llama.cpp) mediante `export_qwen2_compat.py`, con la advertencia de que en ese modo se pierde la memoria O(1) y se aplica el KV cache estándar de 32K.
- No se documenta soporte de tool calling, function calling, visión, audio ni capacidades multimodales.

## Casos de uso
- Procesamiento de documentos largos: análisis de contratos, informes o papers de más de 100K tokens aprovechando la memoria segmentada O(1), que evita el coste cuadrático de atención sobre contextos extensos.
- Razonamiento matemático asistido: resolución de problemas aritméticos y algebraicos paso a paso, con rendimiento en GSM8K comparable al modelo base Instruct (85.60% frente a 85.52%).
- Despliegue en entornos sin Python: integración del runtime C99 en sistemas embebidos, appliances o contenedores mínimos donde no se puede instalar PyTorch ni transformers.
- Inferencia en hardware de consumo: el formato V3_P4_0 (1.805 GiB) permite ejecutar el modelo en GPUs con 4-6 GB de VRAM, incluidas portátiles.
- Investigación sobre atención eficiente: reproducción y estudio del mecanismo de evicción de segmentos comparándolo con KV cache estándar y con variantes como StreamingLLM.
- Experimentación con esquemas de entrenamiento de bajo estado: el estado persistente de 5.931 GiB sirve como referencia para estudiar optimizadores de memoria reducida en GPUs de 16 GB.
- Prototipado de asistentes conversacionales en inglés con contexto largo, siempre que el uso sea no comercial por la licencia de los pesos.

## Benchmarks y rendimiento
Evaluaciones sobre splits completos según la model card del autor. La columna VAULT Q8_0 corresponde a la exportación BF16 desde V3_Q8_0.

| Métrica / Split completo | Qwen2.5-3B Base (BF16) | Qwen2.5-3B-Instruct (BF16) | Control BF16+AdamW8bit | VAULT v3.1 (Q8_0 → BF16) | VAULT v3.1 (P4_0) |
|---|---:|---:|---:|---:|---:|
| GSM8K completo (n=1.319, 1024 tok) | — | 85,52% | 86,20% | 85,60% | 84,69% |
| Media 8 tareas MC (splits completos) | 74,08% | 75,00% | 75,30% | 77,20% | 76,33% |
| Media 9 tareas zero-shot (splits completos) | 73,27% | 73,99% | 74,27% | 76,06% | 75,37% |
| WikiText-2 Word PPL (L=2048) | 13,14 | 14,21 | 14,15 | 13,58 | 14,09 |

Las tareas incluidas en los agregados son GSM8K, HellaSwag (n=10.042), LAMBADA (n=5.153), BoolQ (n=3.270), ARC-E (n=2.376), PIQA (n=1.838), Winogrande (n=1.267), ARC-C (n=1.172) y SciQ (n=1.000). No se han publicado resultados independientes fuera de la model card.

## Requisitos de hardware
- Inferencia en BF16 (safetensors): aproximadamente 6,2 GB de pesos, unos 8 GB de VRAM recomendados con overhead de activaciones y KV cache.
- Inferencia en V3_P4_0: 1.805 GiB de pesos, viable en GPUs de 4 GB de VRAM.
- Inferencia en V3_Q8_0: 3.064 GiB de pesos, viable en GPUs de 6 GB de VRAM.
- Runtime C99: 2,55 GiB de RSS pico según el autor, ejecutable en x86_64 con AVX2 y en Apple Silicon/ARM64 con NEON (verificado vía qemu-aarch64).
- GPUs recomendadas: RTX 4090, A100, H100 para BF16 con contexto largo; RTX 3060 12 GB o superior para BF16 en contextos moderados; GPUs de 4-6 GB para los formatos comprimidos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (memoria O(1) activa), runtime C99 nativo, y exportación a vLLM, Ollama o llama.cpp mediante `tools/export_qwen2_compat.py` (sin memoria O(1)).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Media 9 tareas zero-shot | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| VAULT-v3-3B-PRIMAL | 3,09B | >100K (O(1)) | 85,60% | 76,06% | Qwen Research (no comercial) + AGPL/Apache en código | Hugging Face |
| Qwen2.5-3B-Instruct | 3,09B | 32K | 85,52% | 73,99% | Apache-2.0 | Hugging Face |
| Qwen2.5-3B (base) | 3,09B | 32K | — | 73,27% | Apache-2.0 | Hugging Face |
| Llama-3.2-3B-Instruct | 3,21B | 128K | no disponible | no disponible | Llama 3.2 Community License | Hugging Face |

La ventaja de VAULT frente a Qwen2.5-3B-Instruct se concentra en los agregados zero-shot (+2,07 puntos) y en la ventana de contexto efectiva, a costa de una licencia no comercial y de un ecosistema de tooling mucho más limitado.

## Limitaciones y advertencias
- Licencia de pesos no comercial: la Qwen Research License prohíbe el uso comercial de los safetensors y de los archivos `.vlt3`. La licencia comercial de VAULT solo cubre el código, no los pesos derivados de Qwen2.5-3B.
- AGPL-3.0 en runtime: desplegar con `trust_remote_code=True` detrás de un endpoint de red activa la sección 13 de AGPLv3 sobre `vault_v3_core.py`, salvo que se adquiera la licencia comercial o se exporte a Qwen2ForCausalLM estándar.
- Solo inglés: el modelo no declara soporte multilingüe, a diferencia del Qwen2.5-3B-Instruct original.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni de calibración; al ser un fine-tuning sobre trazas matemáticas, el comportamiento fuera de ese dominio puede degradarse.
- Pérdida de la memoria O(1) al exportar: los motores estándar (vLLM, Ollama, llama.cpp) aplican un KV cache convencional de 32K, por lo que el contexto largo solo está disponible con el runtime propietario.
- Redondeo en la exportación BF16: la conversión desde V3_Q8_0 introduce un 6,25% de discrepancias top-1 en decodificación greedy frente a FP32.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y depende de código personalizado (`custom_code`) no auditado de forma independiente.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/batteryphil/VAULT-v3-3B-PRIMAL
- Repositorio de pesos `.vlt3`: https://huggingface.co/batteryphil/VAULT-v3-3B-PRIMAL-VLT3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/batteryphil/VAULT-v3-3B-PRIMAL/blob/main/LICENSE-QWEN-RESEARCH
- Licencia comercial VAULT: https://huggingface.co/batteryphil/VAULT-v3-3B-PRIMAL/blob/main/LICENSE-COMMERCIAL.md
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
