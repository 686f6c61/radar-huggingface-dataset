# littleborek/cse481-qwen3-8b-production-v3-lora

## Resumen

El modelo `cse481-qwen3-8b-production-v3-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario littleborek sobre el modelo base Qwen/Qwen3-8B. Se trata de un artefacto de investigación académica vinculado a la asignatura CSE-481 (Engineering Economics) y forma parte del proyecto "Pusula", un asistente de investigación retrospectiva sobre datos históricos del BIST (Borsa Istanbul, la bolsa de Estambul). El adaptador no contiene pesos del modelo base, sino únicamente los tensores LoRA, la configuración de carga, el tokenizer y la model card.

El modelo está especializado en dos tareas concretas: enrutamiento (router) hacia herramientas locales deterministas y generación de respuestas estructuradas en JSON con citas verificables sobre datos financieros retrospectivos. No es un modelo de propósito general ni un sistema de trading, sino un componente de un pipeline de investigación que combina el adaptador con herramientas locales y guardarraíles de verificación.

Su relevancia es limitada y muy específica: se publica como artefacto reproducible de un trabajo académico, con huellas SHA-256 de los pesos, configuración de entrenamiento detallada y resultados de evaluación sobre un conjunto de test retenido. No obstante, su utilidad fuera del contexto del proyecto es marginal, dado el tamaño ínfimo del conjunto de entrenamiento (90 ejemplos) y su dependencia de herramientas externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | no disponible (adaptador; el base Qwen3-8B tiene ~8.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó `max_length=4736`; el base Qwen3-8B soporta contexto nativo mayor, no confirmado en la información) |
| Tipos de cuantizacion | QLoRA NF4 con doble cuantización para entrenamiento; el adaptador se publica en safetensors (BF16) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), configuración PEFT (`adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA sobre Qwen3-8B, un transformer decoder-only de la familia Qwen3. La configuración LoRA emplea rango `r=16`, `lora_alpha=32`, `lora_dropout=0.05` y se aplica a todas las proyecciones lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento usa cuantización NF4 con doble cuantización y cómputo en BF16, con `max_length=4736`, `batch_size=1`, acumulación de gradiente de 4, tasa de aprendizaje `2e-4` con decaimiento lineal, 5 pasos de warmup y semilla 481.

El conjunto de entrenamiento es extremadamente pequeño: 90 ejemplos (45 de `train_answer` y 45 de `train_router`), con 68 pasos de optimización (~3 épocas) y una partición de validación de 42 ejemplos. La pérdida de validación final fue de `0.0495` (perplejidad `1.0507`), partiendo de `0.4361` (`1.5467`) en el paso 23. Se empleó pérdida solo en la completación (prompt enmascarado). El entrenamiento se ejecutó en una NVIDIA GeForce RTX 5060 Ti de 16 GB, con un pico de memoria asignada de `11.72 GB` y `13.19 GB` reservados, en un tiempo total de `2038.08s`.

## Capacidades

- Generación de texto estructurado en JSON para respuestas de investigación financiera retrospectiva.
- Enrutamiento (router) hacia nombres de herramientas locales deterministas, con esquema JSON validado.
- Generación de respuestas con citas verificables y comprobación de números fundamentados en evidencia.
- Cumplimiento de cortes temporales estrictos (`as_of <= 2026-09-10`).
- Refuerzo de patrones de seguridad y rechazo (verificado en el escenario `USD/TRY & EREGL`).
- Capacidad multilingüe limitada a turco e inglés.
- No se documentan capacidades de tool calling genérico, agentes multi-paso autónomos, visión, audio ni modo de razonamiento explícito más allá del enrutamiento y la generación estructurada descritos.

## Casos de uso

- Asistente de investigación bursátil retrospectiva: el adaptador enruta consultas sobre acciones del BIST (por ejemplo, `THYAO`, `ASELS`, `TUPRS`) hacia herramientas locales que recuperan datos históricos, y genera respuestas con citas validadas por `EvidenceGroundingGuardrail`.
- Enrutamiento de consultas a herramientas deterministas: dado un requerimiento en lenguaje natural, el modelo emite un JSON con los nombres de herramienta exactos y parámetros normalizados, lo que permite integrarlo en un orquestador que ejecuta funciones locales.
- Generación de respuestas auditables con citas: en contextos donde se exige trazabilidad (por ejemplo, informes académicos), el modelo produce JSON con citas exactas y comprobación de números fundamentados, facilitando la verificación automática.
- Análisis de cohortes y reversiones: el escenario `ASELS reversal cohorts` muestra el uso del modelo para responder preguntas sobre patrones de reversión en series históricas, combinando el enrutamiento con herramientas de cálculo local.
- Consultas sobre divulgaciones financieras: el escenario `TUPRS financial disclosures` ilustra el uso para recuperar y citar información de estados financieros pasados, con corte temporal estricto.
- Filtrado de seguridad y rechazo: el escenario `USD/TRY & EREGL` demuestra la capacidad del adaptador para activar patrones de rechazo ante consultas que podrían interpretarse como consejo de inversión, redirigiendo a un marco de investigación retrospectiva.
- Reproducción de experimentos académicos: al publicarse con huellas SHA-256 y configuración completa, el adaptador sirve como artefacto reproducible para validar el pipeline "Pusula" en entornos de investigación.

## Benchmarks y rendimiento

Evaluación sobre el split de test retenido de `production_corpus_v3` (10 casos: 5 rutas + 5 respuestas, `max_new_tokens=768`, decodificación greedy limpia):

| Métrica | 23 pasos (cap 512) | 68 pasos (cap 768) |
|---|---:|---:|
| Aciertos de tope de salida | 5/10 | 0/10 |
| Router JSON y esquema válidos | 5/5 | 5/5 |
| Nombres de herramienta exactos en router | — | 5/5 |
| Ruta normalizada exacta en router | 2/5 | 4/5 |
| Respuesta JSON y esquema válidos | 0/5 | 5/5 |
| Estado de resultado correcto en respuesta | — | 5/5 |
| Citas válidas / exactas | 0/5 / 0/5 | 5/5 / 5/5 |
| Comprobación de número fundamentado superada | 0/5 | 5/5 |
| Patrón de consejo activado | — | 0/5 |

Verificación end-to-end en interfaz Chrome (`http://127.0.0.1:8765`, `as_of=2026-09-10`) superada en las 5 familias de escenario, con `#audit-replay: passed` determinista.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 0.2 GB (tamaño del repo), pero requiere cargar el modelo base Qwen3-8B completo para inferencia.
- VRAM estimada para el modelo base en BF16: ~16 GB; en cuantización de 8 bits: ~9 GB; en 4 bits (NF4): ~5-6 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) para BF16; RTX 3090/4080/5060 Ti (16 GB) para cuantización 8 o 4 bits.
- Cabe en GPU de consumo con cuantización: RTX 4090, RTX 3090, RTX 5060 Ti (16 GB) con 4/8 bits; en BF16 requiere al menos 16 GB, ajustado en 16 GB.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (soporte de adaptadores LoRA), TGI (soporte de adaptadores), llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento reporta `2038.08s` para 68 pasos en RTX 5060 Ti, pero no se documentan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `littleborek/cse481-qwen3-8b-production-v3-lora` | Adaptador sobre 8B | no disponible | Router + respuestas JSON financieras BIST | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | ~8B | contexto nativo Qwen3 (no confirmado aquí) | Propósito general | Apache 2.0 | Hugging Face |
| Adaptadores LoRA financieros genéricos | variable | variable | Dominio financiero general | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores LoRA financieros en la información proporcionada. La comparación con el base Qwen3-8B es la más directa: el adaptador añade especialización en enrutamiento y generación estructurada con citas, pero pierde generalidad y no aporta mejoras medibles fuera del dominio BIST retrospectivo.

## Limitaciones y advertencias

- Conjunto de entrenamiento extremadamente pequeño (90 ejemplos), lo que limita la generalización y aumenta el riesgo de sobreajuste a los escenarios concretos del corpus.
- El adaptador no incluye los pesos del modelo base; requiere descargar Qwen/Qwen3-8B (revisión `b968826d9c46dd6066d109eabc6255188de91218`) para funcionar.
- Dependencia crítica de herramientas locales deterministas y del guardarraíl `EvidenceGroundingGuardrail`; sin ellos, las salidas no son verificables ni seguras.
- Corte temporal estricto (`as_of <= 2026-09-10`); el modelo no debe usarse para datos posteriores a esa fecha sin reentrenamiento o validación.
- Idiomas limitados a turco e inglés; no se documenta soporte para castellano ni otros idiomas.
- Riesgo de alucinación en respuestas fuera del dominio de entrenamiento; el propio autor lo describe como artefacto de investigación retrospectiva, no como sistema de trading ni consejo de inversión.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3-8B tiene su propia licencia (Apache 2.0 según la información), que debe verificarse en su repositorio.
- No se documentan sesgos específicos, pero el dominio (BIST, datos financieros turcos) puede introducir sesgos de mercado y temporales.
- El autor declara explícitamente que no es asesoramiento financiero ni generación de precios objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/littleborek/cse481-qwen3-8b-production-v3-lora
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio GitHub del proyecto: https://github.com/littleborek/engineering-economics
