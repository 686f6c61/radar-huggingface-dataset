# AarthShah/CyberQwen-14B-Security-V2-GGUF

## Resumen

CyberQwen-14B-Security-V2 es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-14B-Instruct orientado a ciberseguridad defensiva. Lo desarrolla AarthShah y se distribuye en formato GGUF cuantizado para ejecución local mediante Ollama, LM Studio, llama.cpp y Jan. El modelo base es un transformer decoder-only de 14.000 millones de parámetros, por lo que hereda la arquitectura y la ventana de contexto de la familia Qwen2.5-Coder.

El problema que aborda es la reparación automática de vulnerabilidades en código y el diagnóstico de causa raíz en escenarios de seguridad. Según la model card, el autor reporta métricas muy altas en benchmarks propios y de terceros (CWE-Bench, ExploitGym y un benchmark defensivo de 100 escenarios), si bien estas cifras no están acompañadas de una descripción metodológica detallada en la información disponible.

La relevancia actual reside en la posibilidad de desplegar un asistente de seguridad en hardware de consumo (a partir de unos 12 GB de VRAM/RAM con la cuantización Q4_K_M) sin depender de APIs externas, lo que encaja en flujos de trabajo donde el código no puede salir de la infraestructura local. La licencia Apache 2.0 facilita su uso comercial, aunque las métricas declaradas deben tratarse con cautela hasta que sean replicadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-14B-Instruct) |
| Parametros totales | 14.000 millones (14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa -c 4096) |
| Tipos de cuantizacion | Q4_K_M (~8,5 GB), Q5_K_M (~10,2 GB), Q8_0 (~15,1 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con Modelfile para Ollama) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning sobre Qwen2.5-Coder-14B-Instruct, un transformer decoder-only denso de 14B parámetros. La distribución publicada en este repositorio son pesos GGUF cuantizados; los pesos originales del ajuste se ofrecen por separado como adaptador LoRA (CyberQwen-14B-Security-V2) y como pesos BF16 standalone de la versión V1 (CyberQwen-14B-Security).

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Se menciona un dataset de curación propio, cybersecurity-dataset-v4, con 1.668 registros, y se citan como referencia los benchmarks CWE-Bench y ExploitGym, además del uso de Semgrep en el flujo de trabajo de seguridad. No se describen innovaciones arquitectónicas propias: las capacidades provienen del modelo base más el ajuste específico de dominio.

## Capacidades

- Generación de texto y código con especialización en ciberseguridad defensiva.
- Reparación de vulnerabilidades (vulnerability repair) y generación de parches de código seguro, con foco en CWE y en parches memory-safe para C/C++.
- Diagnóstico de causa raíz (root cause diagnosis) en escenarios de explotación simulados (ExploitGym).
- Análisis de código orientado a seguridad, con integración mencionada de Semgrep en el flujo de trabajo.
- Generación de código general y refactorización, heredadas de Qwen2.5-Coder-14B-Instruct.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Revisión y parcheo de código en pipelines de CI/CD: el modelo puede recibir un fragmento con una CWE identificada (por ejemplo, CWE-78 por inyección de comandos en `os.system`) y devolver una versión corregida, integrándose como paso de análisis estático asistido por LLM.
- Auditoría de seguridad en local: al ejecutarse con Ollama o llama.cpp sobre hardware de consumo, permite analizar código propietario sin enviarlo a servicios externos, algo crítico en entornos con requisitos de confidencialidad.
- Formación y concienciación en seguridad: sirve como asistente interactivo que explica vulnerabilidades y propone remediaciones en un entorno controlado.
- Triaje de hallazgos de SAST: combinado con herramientas como Semgrep, el modelo puede priorizar y contextualizar alertas, generando explicaciones de causa raíz y parches candidatos.
- Reparación de código C/C++ con foco en seguridad de memoria: la model card declara una tasa de parches memory-safe del 98 % en ExploitGym, lo que lo hace adecuado para revisar código de sistemas.
- Asistente de desarrollo seguro en el IDE: desplegado vía LM Studio o Jan, puede sugerir alternativas seguras a APIs peligrosas mientras se escribe código.
- Automatización de informes de remediación: generar descripciones técnicas de la vulnerabilidad, el impacto y el parche aplicado para documentación de cumplimiento.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente en la información disponible):

| Benchmark | Metrica | CyberQwen-14B-Security-V2 | Referencia declarada |
|---|---|---|---|
| CWE-Bench (100 repositorios empresariales) | Code Patch Rate | 99,0 % | Claude 3.5 Sonnet 81,0 %; GPT-4o 78,0 % |
| ExploitGym | Composite Score | 99,6 % | no disponible |
| ExploitGym | Root cause diagnosis | 100 % | no disponible |
| ExploitGym | Memory-safe C/C++ patch rate | 98 % | no disponible |
| Enterprise Cybersecurity Defensive Benchmark (100 escenarios) | Overall Score | 88,0 % | no disponible |

No se han publicado en la información disponible resultados de benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K) para este ajuste.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q4_K_M ~8,5 GB (recomendado ≥12 GB), Q5_K_M ~10,2 GB (≥16 GB), Q8_0 ~15,1 GB (≥20 GB).
- Cabe en GPU de consumo: sí, con Q4_K_M en GPUs de 12 GB o superiores (por ejemplo, RTX 3060 12 GB, RTX 4070) y en portátiles de 16 GB o Mac con memoria unificada.
- GPU recomendadas para mayor precisión: Q8_0 requiere ~20 GB, por lo que encaja en RTX 4090 (24 GB), A100 o H100; Q5_K_M es viable en GPUs de 16 GB.
- Opciones de despliegue: Ollama (soporte nativo de `hf.co/...`), LM Studio, llama.cpp, Jan; también es posible usar el adaptador LoRA o los pesos BF16 con frameworks de inferencia estándar, aunque la información no detalla soporte explícito de vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| CyberQwen-14B-Security-V2 | 14B | no disponible | Ciberseguridad defensiva | Apache 2.0 | GGUF, LoRA, BF16 |
| Qwen2.5-Coder-14B-Instruct (base) | 14B | no disponible | Código general | Apache 2.0 | safetensors, GGUF |
| Claude 3.5 Sonnet (referencia citada) | no disponible | no disponible | Propósito general | Propietaria | API |
| GPT-4o (referencia citada) | no disponible | no disponible | Propósito general | Propietaria | API |

La comparación con Claude 3.5 Sonnet y GPT-4o procede únicamente de las cifras declaradas por el autor en CWE-Bench; no se dispone de una evaluación independiente que permita contrastarlas.

## Limitaciones y advertencias

- Las métricas de benchmarks (99 % en CWE-Bench, 99,6 % en ExploitGym) las declara el propio autor y no consta replicación independiente; deben tomarse como indicativas.
- El modelo está etiquetado únicamente para inglés, lo que limita su uso en castellano u otros idiomas.
- No se documenta la ventana de contexto efectiva del ajuste; el ejemplo de llama.cpp usa 4096 tokens, muy por debajo del contexto nativo del modelo base.
- Riesgo de alucinación inherente a los LLM: puede generar parches plausibles pero incorrectos o introducir nuevas debilidades si no se valida con pruebas automatizadas.
- Es un modelo de seguridad defensiva; su uso para generación de exploits o actividades ofensivas no está respaldado por el autor y puede contravenir políticas de uso responsable.
- Sesgos: no se documentan sesgos específicos en la información disponible; hereda los del corpus de Qwen2.5-Coder.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base Qwen2.5-Coder-14B-Instruct.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- Para producción, es imprescindible validar los parches generados con tests, análisis estático y revisión humana antes de aplicarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AarthShah/CyberQwen-14B-Security-V2-GGUF
- Adaptador LoRA V2: https://huggingface.co/AarthShah/CyberQwen-14B-Security-V2
- Pesos BF16 V1: https://huggingface.co/AarthShah/CyberQwen-14B-Security
- Demo interactiva (ZeroGPU Space): https://huggingface.co/spaces/AarthShah/CyberQwen-14B-Security
- Dataset de curación V4: https://huggingface.co/datasets/AarthShah/cybersecurity-dataset-v4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
