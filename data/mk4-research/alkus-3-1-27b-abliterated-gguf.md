# MK4-Research/Alkus-3.1-27B-Abliterated-GGUF

## Resumen

Alkus 3.1 27B Abliterated es un ajuste fino (fine-tune) de Qwen3.8-27B orientado a razonamiento compacto, honesto y persistente. Lo desarrolla MK4-Research y se distribuye en formato GGUF con cuantización Q4_K_M. El modelo se presenta como el hermano "puro de razonamiento" de Mizar 3.0 (centrado en uso de herramientas y agentes); ambos parten de una base Qwen3.8-27B "abliterated", es decir, con los mecanismos de rechazo eliminados del modelo original.

El objetivo declarado es un modelo que razone paso a paso con autoverificación explícita y que prefiera admitir desconocimiento antes que fabricar una respuesta. Está afinado con QLoRA (rango 16, alpha 32, 2 épocas) sobre la base abliterated y empaquetado en GGUF Q4_K_M de aproximadamente 15,8 GB, con una ventana de contexto de hasta 131.072 tokens.

Es relevante porque combina tres cosas poco habituales en un modelo local de 27B: un contexto muy largo, un sesgo explícito hacia la honestidad epistémica y una orientación a tareas de revisión de código y seguridad (code review, ciberseguridad). El autor reporta resultados locales medidos sobre el propio GGUF cuantizado, no sobre el modelo en precisión completa, y advierte que es un modelo de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | Hasta 131.072 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (unica cuantizacion publicada en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M, ~15,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, una base de tipo transformer de aproximadamente 26,9 mil millones de parámetros. Sobre esa base, y concretamente sobre su variante "abliterated" (a la que se le han eliminado las direcciones de rechazo para que no se niegue a responder), MK4-Research aplica un ajuste fino QLoRA con rango 16, alpha 32 y 2 épocas. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset.

La innovación declarada no es arquitectónica sino de comportamiento: el modelo se entrena para un "registro compacto y telegráfico" de razonamiento con autoverificación explícita, de modo que tiende a autocorregirse y a declarar incertidumbre en lugar de inventar. El autor indica que la ablación solo elimina rechazos y no afecta a los benchmarks de código. El paquete distribuido es únicamente el GGUF cuantizado, no los pesos en precisión completa (safetensors), aunque el dato de parámetros totales procede de los safetensors del modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con cadena de pensamiento compacta y autoverificación.
- Razonamiento matemático (reportado alto rendimiento en GSM8K).
- Generación y revisión de código (HumanEval, MBPP), incluida la extracción de respuestas desde bloques de código delimitados.
- Revisión de código y análisis orientado a seguridad (tags de cybersecurity y code-review).
- Comportamiento de honestidad epistémica: declarar desconocimiento en lugar de fabricar datos.
- Capacidad de agente con herramientas en el contexto de investigación de seguridad (el benchmark ExploitBench se midió sobre el hermano Alkus 3.0, no sobre 3.1).
- Contexto largo de hasta 131.072 tokens para conversaciones y documentos extensos.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente para 3.1 en la información disponible.

## Casos de uso

- Asistente de razonamiento multi-paso: para problemas de análisis o planificación donde interesa una cadena de pensamiento que se autocorrija y señale sus dudas en lugar de dar una respuesta segura pero errónea.
- Revisión de código en local: el modelo puede analizar fragmentos o ficheros completos aprovechando el contexto de 131k tokens para detectar patrones problemáticos, con resultados medidos en HumanEval (92%) y MBPP (84%).
- Investigación de vulnerabilidades asistida: ejecutado como agente con herramientas (setup/exec/read/write/grade) contra objetivos en contenedor, puede localizar y alcanzar código vulnerable (según el baseline de Alkus 3.0 en un CVE de Chrome V8), útil como primer filtro en triaje de seguridad.
- Generación de código en pipelines locales: al ser un GGUF Q4_K_M de ~15,8 GB, puede servirse con llama.cpp en una sola GPU de consumo para tareas de autocompletado y generación con verificación humana.
- Análisis de documentos largos: con 131k tokens de contexto puede procesar informes, expedientes o bases de código extensas en una sola pasada sin truncar.
- Evaluación de honestidad y calibración: útil en investigación para estudiar comportamiento de modelos que declaran incertidumbre, comparándolo con la base Qwen sin ajustar.
- Prototipado de asistentes de seguridad: como base para herramientas de análisis estático/dinámico asistido, siempre con revisión humana dada la advertencia del autor sobre no uso en producción sin supervisión.

## Benchmarks y rendimiento

Medidos sobre el propio GGUF Q4_K_M servido con llama.cpp, con EleutherAI lm-evaluation-harness, decodificación greedy (temperatura 0) y 100 ítems por tarea:

| Benchmark | Métrica | Alkus 3.1 |
|---|---|---|
| GSM8K | exact match | 96% |
| HumanEval | pass@1 | 92% |
| MBPP | pass@1 | 84% |

Comparación antes/después del ajuste fino en MBPP (misma tubería, 100 ítems):

| Modelo | MBPP pass@1 |
|---|---|
| Qwen3.8-27B (base vanilla) | 75% |
| Alkus 3.1 | 84% |

Mejora de +9 puntos en MBPP. El autor aclara que GSM8K y HumanEval no se volvieron a medir sobre la base, por lo que no se reclama comparación antes/después para esas tareas. Los resultados son una medición local reproducible sobre el GGUF cuantizado, no un envío oficial a leaderboards.

En seguridad (ExploitBench, medido sobre Alkus 3.0, no sobre 3.1): sobre el CVE-2024-1939 de Chrome V8, con una escalera de 16 indicadores, la mejor ejecución alcanzó 2/16 (`cov_func` y `cov_line`), es decir, localizó y ejecutó el código vulnerable sin producir crash, informe ASAN ni primitiva de exploit.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa ~15,8 GB, por lo que se necesita aproximadamente 16-18 GB de VRAM considerando caché KV y overhead (el autor recomienda caché K/V en Q8_0).
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo completo en VRAM; A100/H100 para mayor throughput o contextos muy largos.
- Cabe en GPU de consumo: sí, en GPUs con 24 GB o más (4090, 3090). En GPUs de 16 GB no cabe entero en Q4_K_M y requeriría offload a CPU o cuantizaciones más agresivas (no publicadas en el repo).
- Opciones de despliegue: llama.cpp (entorno de medición del autor), y por extensión otros runners compatibles con GGUF como Ollama o LM Studio; vLLM y TGI no aplican directamente al formato GGUF.
- Ajustes recomendados por el autor: Flash Attention activado, caché K/V en Q8_0 y máximo 1 petición concurrente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Alkus 3.1 27B Abliterated | ~26,9 B | 131.072 | GGUF Q4_K_M | Apache 2.0 | Fine-tune QLoRA de Qwen3.8-27B abliterated; GSM8K 96%, HumanEval 92%, MBPP 84% |
| Qwen3.8-27B (base vanilla) | ~26,9 B | no disponible en la información | safetensors | no disponible en la información | Base sin ajuste; MBPP 75% en la misma tubería |
| Mizar 3.0 | no disponible | no disponible | no disponible | no disponible | Hermano del mismo autor orientado a uso de herramientas y agentes; misma base abliterated |

No se dispone en la información proporcionada de datos de benchmarks de Mizar 3.0 ni de otros modelos de 27B comparables, por lo que la comparativa cuantitativa se limita a la base Qwen en MBPP.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente que no está pensado para producción sin revisión humana.
- Alucinación: puede producir detalles seguros pero incorrectos en hechos que no puede verificar desde el contexto (constantes numéricas, hashes de commit, nombres de API). Verificar especificaciones de seguridad o datos factuales contra fuentes primarias.
- La base es "abliterated", lo que elimina los rechazos del modelo original; esto puede aumentar el riesgo de respuestas a solicitudes dañinas y debe tenerse en cuenta en despliegues abiertos.
- Benchmarks medidos sobre una única cuantización (Q4_K_M) y 100 ítems por tarea con decodificación greedy; no son resultados oficiales ni comparables directamente con mediciones en precisión completa.
- Los datos de ExploitBench corresponden a Alkus 3.0, no a 3.1; no hay medición de seguridad para esta versión.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Configuración recomendada de 1 petición concurrente, lo que limita el despliegue como servicio de alto throughput.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza de investigación y la ablación aconsejan evaluación propia antes de cualquier uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/MK4-Research/Alkus-3.1-27B-Abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- CVE-2024-1939 (Chrome V8): https://nvd.nist.gov/vuln/detail/CVE-2024-1939
