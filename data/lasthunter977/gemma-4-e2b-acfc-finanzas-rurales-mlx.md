# lasthunter977/gemma-4-e2b-acfc-finanzas-rurales-mlx

## Resumen

El modelo `lasthunter977/gemma-4-e2b-acfc-finanzas-rurales-mlx` es un adaptador QLoRA publicado en formato MLX que se aplica sobre el checkpoint cuantizado a 4 bits `mlx-community/gemma-4-e2b-it-4bit`. Lo desarrolla el usuario lasthunter977 y está orientado a una tarea muy concreta: la clasificación estructurada de decisiones de financiación rural y de Agricultura Campesina, Familiar y Comunitaria (ACFC) en la subregión PDET de Montes de María (Bolívar y Sucre, Colombia). No es un modelo completo, sino un adaptador de 52 MB (rank 16, 16 capas de texto) que modifica el comportamiento del modelo base para producir salidas JSON validadas contra un esquema.

El problema que aborda es la falta de herramientas offline-first para técnicos y entidades que trabajan con pequeños productores rurales en zonas con conectividad limitada. El adaptador se entrenó localmente en un Apple M4 con 16 GB de memoria unificada usando `mlx-lm 0.32.2`, con un corpus de 380 ejemplos redactados manualmente y trazabilidad criptográfica SHA-256 sobre 11 documentos públicos oficiales (Banco Agrario, FINAGRO, FAO/FIDA, MADR/RENAF). La relevancia actual reside en su enfoque de despliegue en hardware de consumo y en la evaluación estadística publicada, inusual en adaptadores de este tamaño.

El modelo base es un Gemma 4 de la familia "E2B" (variante eficiente de 2 mil millones de parámetros, según la nomenclatura del checkpoint). El adaptador conserva la licencia Apache 2.0 y soporta español e inglés, aunque el corpus de entrenamiento es fundamentalmente español rural colombiano (47,4 % de los ejemplos con registro coloquial).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre transformer decoder-only (Gemma 4 E2B, cuantizado a 4 bits) |
| Parámetros totales | No disponible (depende del modelo base; el adaptador añade rank 16 sobre 16 capas) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó `max_seq_length=1024`) |
| Tipos de cuantización | Base en 4 bits (MLX); adaptador en safetensors sin cuantizar |
| Idiomas soportados | Español (es) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapters.safetensors` + `adapter_config.json` (MLX) |
| Tamaño del artefacto | 52 MB |
| Framework | `mlx-lm 0.32.2` / `mlx 0.32.4` |
| Hardware de entrenamiento | Apple M4, 16 GB memoria unificada, macOS |
| Configuración ganadora | `v3_r16_l16`: rank=16, scale=32.0, dropout=0.05, num_layers=16, lr=1.5e-5, iters=180 |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre el modelo base cuantizado a 4 bits, aplicando LoRA de rank 16 sobre 16 capas de texto con escala 32.0 y dropout 0.05. La plantilla de chat usa `enable_thinking=False` y `mask_prompt=true`, con `batch_size=1`, acumulación de gradiente de 4 pasos y longitud máxima de secuencia de 1024 tokens. El entrenamiento se ejecutó durante 180 iteraciones con una tasa de aprendizaje de 1.5e-5, alcanzando una pérdida de validación de 0.629 (partiendo de 1.791 en la iteración 1). Se realizó una ablación comparando `r=8/L=16`, `r=16/L=16` y `r=8/L=24`, resultando ganadora la configuración `r=16/L=16` por F1-Macro (0.9556) y recall de abstención (100 %).

El corpus de entrenamiento consta de 380 ejemplos redactados individualmente (0 % plantillas rígidas, 47,4 % español rural coloquial, distribución 50/25/25 entre casos puros, conflictivos y ambiguos), más 60 ejemplos de validación. La trazabilidad se documenta con un manifiesto SHA-256 (`corpus_manifest_sha256.json`) que cubre 1.325 fragmentos BM25 y 8 creencias verificadas literalmente del PATR Montes de María, extraídas de 11 documentos oficiales de Banco Agrario, FINAGRO, FAO/FIDA, MADR/RENAF y la cartilla Sembrando Capacidades. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre pares instrucción-respuesta con salida JSON estructurada.

## Capacidades

- Clasificación estructurada de decisiones de financiación rural en formato JSON validado contra esquema (100 % de validez de esquema en el benchmark sellado).
- Clasificación de casos ACFC con tres etiquetas de tipo de caso (`pure`, `conflict`, `unclear`) y campo `requires_human_review`.
- Evaluación de riesgo de flujo de caja (`cashflow_risk`) con precisión del 83,33 % en el conjunto OOD sellado.
- Abstención calibrada: recall de abstención del 100 % en validación y 98,33 % en OOD, derivando casos ambiguos a revisión humana.
- Generación de texto en español e inglés, heredada del modelo base Gemma 4 E2B.
- Salida determinista recomendada (`temp=0.0`) para integración en pipelines.
- Capacidad de razonamiento aritmético y no-JSON preservada (sin olvido catastrófico medido: 90 % vs 90 % en 20 casos, 0 fugas de JSON).
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta capacidad de visión ni audio.

## Casos de uso

- Clasificación de solicitudes de crédito rural: el adaptador recibe la descripción de un caso de un pequeño productor y devuelve un JSON con tipo de caso, riesgo de flujo de caja y necesidad de revisión humana, permitiendo triaje automático en oficinas de extensión con conectividad intermitente.
- Herramienta de campo offline en Apple Silicon: al ejecutarse sobre `mlx-lm` en un Mac con 16 GB de memoria unificada, un técnico puede procesar casos en la finca sin conexión, algo crítico en la subregión de Montes de María.
- Validación de elegibilidad ACFC: el modelo aplica los lineamientos de la Resolución 000464 de 2017 y del RENAF para determinar si un caso encaja en la categoría de Agricultura Campesina, Familiar y Comunitaria, con trazabilidad a los documentos fuente.
- Detección de ambigüedad y derivación a humano: gracias a su recall de abstención del 98-100 %, el sistema puede marcar automáticamente los casos que requieren revisión de un funcionario, reduciendo el riesgo de decisiones automatizadas erróneas.
- Evaluación de riesgo de flujo de caja en proyectos productivos: el campo `cashflow_risk` permite priorizar asistencia técnica o acompañamiento financiero en los casos con mayor riesgo identificado.
- Integración en pipelines de extensión agraria: la salida JSON con 100 % de validez de esquema permite encadenar el adaptador con sistemas de gestión de casos, bases de datos o dashboards sin post-procesamiento correctivo.
- Formación y auditoría de criterios: al estar entrenado sobre documentos oficiales con manifiesto SHA-256, sirve como herramienta de consulta estructurada para verificar la aplicación consistente de criterios ACFC entre distintos técnicos.

## Benchmarks y rendimiento

Benchmark OOD sellado (`test_ood_q1_sealed.jsonl`, n=90, 30/30/30), temperatura 0.0, `enable_thinking=False`:

| Sistema | Esquema válido | Accuracy | F1-Macro | Alineación `human_review` | Recall abstención | Accuracy `cashflow_risk` | Latencia p50 |
|---|---|---|---|---|---|---|---|
| `base_e2b` (fábrica) | 98,9 % | 68,89 % | 0,6518 | 65,56 % | 90,00 % | 65,56 % | 3,53 s |
| `qlora_e2b_v2` (plantillas) | 98,9 % | 68,89 % | 0,6760 | 83,33 % | 50,00 % | 70,00 % | 3,58 s |
| **`qlora_e2b_v3` (esta versión)** | **100,0 %** | **94,44 %** | **0,9444** | **95,56 %** | **98,33 %** | **83,33 %** | **2,92 s** |
| `qlora_e2b_v3` + RAG condicional + coherencia | 100,0 % | 91,11 % | 0,9110 | 94,44 % | 98,33 % | 83,33 % | 3,01 s |

Ablación sobre `valid_v3.jsonl` (n=60):

| Configuración | val_loss | Esquema válido | Accuracy | F1-Macro | Alineación `human_review` | Recall abstención |
|---|---|---|---|---|---|---|
| `v3_r8_l16` | 0,646 | 100,0 % | 95,00 % | 0,9378 | 98,33 % | 96,67 % |
| **`v3_r16_l16` (ganadora)** | **0,629** | **100,0 %** | **96,67 %** | **0,9556** | **98,33 %** | **100,00 %** |
| `v3_r8_l24` | 0,618 | 100,0 % | 95,00 % | 0,9378 | 100,00 % | 96,67 % |

Estadística formal (bootstrap 2.000 iteraciones): `v3` vs `base_e2b` → ΔAcc IC 95 % [+16,67 %, +35,56 %], ΔF1-Macro IC 95 % [+0,2063, +0,3871], McNemar exacto bilateral p = 0,000002, Stuart-Maxwell Q = 20,32 (p = 0,000039). `v3` vs `v2` → McNemar p = 0,000002, Stuart-Maxwell Q = 26,00 (p = 0,000002). En distribución (`test.jsonl`, n=50): Accuracy 90,00 %, F1-Macro 0,8957, `human_review` 94,00 %, recall de abstención 100,00 %, McNemar vs base p = 0,000488. Robustez ante paráfrasis (n=20): tasa de cambio 10,0 % en `case_type`, 0,0 % en `requires_human_review`, 10,0 % en `cashflow_risk`.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16 GB de memoria unificada en Apple Silicon es suficiente (configuración de entrenamiento y referencia del autor en M4 con 16 GB). El adaptador añade solo 52 MB sobre el modelo base cuantizado a 4 bits.
- GPU recomendadas: el adaptador está diseñado para MLX en Apple Silicon (M1, M2, M3, M4). No se documenta soporte nativo en CUDA, aunque el adaptador podría en teoría convertirse a otros formatos; no disponible en la información proporcionada.
- Cabe en GPU de consumo: sí, en Apple Silicon con 16 GB de memoria unificada. Para GPUs NVIDIA consumer no hay datos de despliegue documentados.
- Opciones de despliegue: `mlx-lm` (versión 0.32.2 o superior) con `adapter_path` apuntando al repositorio. No se documenta vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia: p50 de 2,92 s por inferencia en el benchmark OOD sellado (n=90) sobre el hardware de referencia (M4, 16 GB). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | F1-Macro (OOD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **`gemma-4-e2b-acfc-finanzas-rurales-mlx` (v3)** | Gemma 4 E2B 4-bit | No disponible (adaptador rank 16) | No disponible (entrenado a 1024) | 0,9444 | Apache 2.0 | Hugging Face, MLX |
| `gemma-4-e2b-it-4bit` (base) | Gemma 4 E2B | No disponible | No disponible | 0,6518 | Apache 2.0 | Hugging Face, MLX |
| `qlora_e2b_v2` (versión previa) | Gemma 4 E2B 4-bit | No disponible | No disponible | 0,6760 | Apache 2.0 | No publicado como release independiente |
| `qlora_e2b_v3` + RAG condicional | Gemma 4 E2B 4-bit | No disponible | No disponible | 0,9110 | Apache 2.0 | Configuración experimental |

No se dispone de comparación con modelos de clasificación de finanzas rurales de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el adaptador está entrenado exclusivamente para clasificación de decisiones de finanzas rurales y ACFC en Montes de María; su uso fuera de ese dominio no está validado y puede degradar el rendimiento del modelo base.
- Corpus pequeño: 380 ejemplos de entrenamiento y 60 de validación; aunque la evaluación estadística es sólida, la cobertura de casos reales puede ser limitada.
- Dependencia de hardware Apple Silicon: el formato MLX limita el despliegue a equipos Apple; no hay conversión documentada a GGUF, CUDA ni otros runtimes.
- Riesgo de alucinación: aunque el esquema JSON se valida al 100 %, los valores de los campos (por ejemplo, `cashflow_risk`) pueden ser incorrectos en casos atípicos; la precisión en `cashflow_risk` es del 83,33 % en OOD.
- Sesgo geográfico y lingüístico: entrenado con español rural colombiano de una subregión concreta; puede no generalizar a otras regiones de Colombia, otros países latinoamericanos ni a registro formal.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 puede tener términos adicionales de uso aceptable que deben verificarse en su propia licencia.
- Fugas de JSON: aunque el autor reporta 0 fugas en 20 casos de no-JSON, no se garantiza que el adaptador no imponga el formato JSON en consultas generales fuera del dominio.
- Sin soporte documentado de tool calling, agentes multi-paso, visión ni audio.
- Latencia de ~3 s por inferencia en hardware de referencia; puede ser insuficiente para aplicaciones de alto throughput.
- Fecha de creación del repositorio (2026-11-19) y cero descargas/likes: no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/lasthunter977/gemma-4-e2b-acfc-finanzas-rurales-mlx
- Modelo base: https://huggingface.co/mlx-community/gemma-4-e2b-it-4bit
- Framework MLX-LM: https://github.com/ml-explore/mlx-lm
- Documentación MLX: https://ml-explore.github.io/mlx/
- FINAGRO (Manual de Servicios V. 26.50): https://www.finagro.com.co
- Banco Agrario de Colombia: https://www.bancoagrario.gov.co
- FAO — Política de desarrollo agrícola: https://www.fao.org
- FAO/FIDA — Decenio de la Agricultura Familiar 2019-2028: https://www.fao.org/family-farming-decade
- MADR/RENAF — Resolución 000464 de 2017: https://www.minagricultura.gov.co
- PATR Montes de María: no disponible enlace directo en la información proporcionada
