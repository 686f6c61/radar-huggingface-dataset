# OBLITERATUS/feyospace-s1-OBLITERATED

## Resumen

feyospace-s1-OBLITERATED es una variante "abliterada" del modelo feyospace/feyospace-v1.1-small, un transformer denso de 27.781 millones de parámetros construido sobre la arquitectura Qwen3.5. Lo desarrolla el usuario OBLITERATUS aplicando su propio conjunto de herramientas de abliteración (eliminación del vector de rechazo mediante descomposición en valores singulares) sobre los pesos del modelo base. El objetivo declarado es eliminar las negativas de seguridad específicas del dominio de ciberseguridad sin degradar el conocimiento general del modelo, de modo que pueda emplearse en investigación de vulnerabilidades, pentesting autorizado y competiciones CTF.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de modificación de pesos cada vez más habitual en el ecosistema open source (abliteration) y su impacto medible en benchmarks. Por otro, sirve como caso de estudio de los riesgos asociados a publicar variantes sin salvaguardas: la model card reconoce explícitamente que el modelo elimina las barreras de rechazo y traslada toda la responsabilidad al operador.

El modelo se distribuye en formato safetensors con licencia Apache 2.0, un repositorio de 109,4 GB (coherente con pesos en bf16 de un modelo de ~28B) y la etiqueta `image-text-to-text` en Hugging Face, aunque la model card solo documenta uso de generación de texto. No se especifican la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5 (según model card) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base feyospace/feyospace-v1.1-small, descrita en la model card como Qwen3.5, con 28B parámetros en precisión bf16. No se detalla en la información disponible la composición del dataset de preentrenamiento, el número de tokens, ni si el modelo base pasó por fases de RLHF o DPO. Tampoco se especifican innovaciones de atención (atención lineal, decodificación especulativa, etc.).

La modificación respecto al base es una abliteración dirigida al dominio de ciberseguridad, ejecutada con las herramientas de OBLITERATUS en cuatro pasos declarados: (1) recogida de residuales de activación a partir de pares de prompts de rechazo (dañinos frente a inofensivos) que cubren desarrollo de exploits, análisis de vulnerabilidades, ingeniería inversa y herramientas ofensivas; (2) cálculo de la dirección de rechazo mediante SVD sobre la diferencia de activaciones medias; (3) proyección de esa dirección fuera de los pesos del flujo residual; y (4) validación de que las capacidades generales se conservan mediante una batería completa de benchmarks. El autor afirma que la intervención es estadísticamente transparente, con desviaciones dentro de 1σ del error estándar en todos los benchmarks reportados.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), orientada a instrucciones.
- Razonamiento general y conocimiento enciclopédico: MMLU 5-shot de 82,4% según el autor.
- Conocimiento especializado en ciberseguridad: 63,8% en WMDP-Cyber, 85,3% en CyberMetric-10K, 61,8% en SecQA v1 y 55,0% en SecQA v2.
- Reproducción de exploits en entornos reales: 98,9% de éxito en 90 tareas de CyberGym (44/44 en Arvo y 45/46 en OSS-Fuzz), según la model card.
- Ejecución de tareas de seguridad ofensiva sin rechazos: análisis de vulnerabilidades, desarrollo de exploits, ingeniería inversa y uso de tooling ofensivo.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode). La etiqueta `image-text-to-text` de Hugging Face no está respaldada por la model card.

## Casos de uso

- Pentesting autorizado: el modelo puede redactar y explicar cadenas de explotación sobre objetivos con contrato firmado, sin las negativas que un modelo alineado aplicaría a prompts de seguridad ofensiva. Adecuado por su conocimiento medido en WMDP-Cyber y CyberMetric.
- Investigación de vulnerabilidades: análisis de código fuente o binarios para identificar patrones de memory safety (buffer overflows, use-after-free) y proponer reproducciones, apoyándose en el 100% declarado en tareas Arvo de CyberGym.
- Competiciones CTF: generación rápida de hipótesis de explotación, scripts de fuzzing y análisis de binarios en categorías de pwn y reversing, donde la latencia de iteración importa más que la cautela del modelo.
- Formación en ciberseguridad: construcción de laboratorios y material docente que ilustre técnicas ofensivas reales, usando el modelo como generador de ejemplos controlados en un entorno aislado.
- Fuzzing asistido: generación de harnesses y corpus de entrada para OSS-Fuzz, dado el 97,8% de éxito declarado en esa categoría de CyberGym.
- Red teaming de modelos alineados: uso del modelo como referencia "sin salvaguardas" para comparar respuestas y evaluar la robustez de filtros de seguridad en otros sistemas.
- Automatización de informes técnicos de seguridad: redacción de hallazgos, PoCs y recomendaciones de remediación a partir de notas de un escaneo, con la ventaja de no bloquear contenido técnico legítimo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), ejecutados en A100-80GB en bf16 con lm-evaluation-harness:

| Benchmark | Preguntas | Base | Abliterado | Delta |
|---|---:|---:|---:|---:|
| MMLU (5-shot) | 14.042 | 82,4% ±0,31 | 82,4% ±0,31 | 0,0% |
| WMDP-Cyber (0-shot) | 1.987 | 63,9% ±1,08 | 63,8% ±1,08 | -0,1% |
| CyberMetric-10K (0-shot) | 9.190 | 86,6% ±0,36 | 85,3% ±0,37 | -1,3% |
| SecQA v1 (0-shot) | 127 | 60,0% ±4,69 | 61,8% ±4,65 | +1,8% |
| SecQA v2 (0-shot) | 115 | 53,0% ±5,02 | 55,0% ±5,00 | +2,0% |

Comparativa de WMDP-Cyber ofrecida por el autor (referencias del paper de WMDP, Li et al., ICML 2024):

| Modelo | WMDP-Cyber |
|---|---:|
| GPT-4 | 72,6% |
| feyospace-s1-obliterated (28B) | 63,8% |
| Mixtral-8x7B | 52,0% |
| Yi-34B | 49,7% |
| Zephyr-7B | 44,0% |

Desglose por asignatura de MMLU (solo materias relevantes):

| Asignatura | Base | Abliterado |
|---|---:|---:|
| Computer Security | 88,0% | 88,0% |
| High School Computer Science | 92,0% | 92,0% |
| Electrical Engineering | 84,8% | 84,8% |
| College Computer Science | 80,0% | 80,0% |
| Machine Learning | 80,4% | 78,6% |

CyberGym (90 tareas de reproducción de exploits reales):

| Categoría | Éxitos | Total | Tasa |
|---|---:|---:|---:|
| Arvo (memory safety) | 44 | 44 | 100% |
| OSS-Fuzz (fuzzing) | 45 | 46 | 97,8% |
| Total | 89 | 90 | 98,9% |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 56 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica requiere 80 GB para contextos largos.
- VRAM estimada en cuantización de 8 bits: ~28 GB; en 4 bits: ~15-16 GB. Estas cifras son estimaciones por tamaño de parámetros, no valores publicados por el autor.
- GPU recomendadas: A100-80GB (el autor usó esta para los benchmarks), H100-80GB, o múltiples GPU de 24 GB en paralelo con `device_map="auto"`.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16; sí podría caber en 4 bits, aunque no se documenta soporte de GGUF ni de llama.cpp. La inferencia en transformers con cuantización bitsandbytes sería la vía más directa.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WMDP-Cyber | Licencia | Notas |
|---|---:|---|---:|---|---|
| feyospace-s1-obliterated | ~27,8B | no disponible | 63,8% | Apache 2.0 | Variante abliterada, sin salvaguardas |
| feyospace/feyospace-v1.1-small (base) | ~28B | no disponible | 63,9% | no disponible | Modelo alineado de referencia |
| Mixtral-8x7B | 46,7B totales (12,9B activos) | 32K (típico) | 52,0% | Apache 2.0 | MoE; referencia del paper WMDP |
| Yi-34B | 34B | 4K/200K según variante | 49,7% | Apache 2.0 (con condiciones) | Denso; referencia del paper WMDP |
| Zephyr-7B | 7B | 32K | 44,0% | MIT | Denso; referencia del paper WMDP |

La comparativa de WMDP-Cyber procede de la model card y de las referencias del paper de WMDP. No se dispone de comparaciones con otros modelos abliterados de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Eliminación deliberada de salvaguardas: el modelo no rechaza peticiones de contenido ofensivo. Cualquier despliegue debe asumir control de acceso, registro de uso y un entorno de aislamiento.
- Riesgo legal y de cumplimiento: el uso en la UE puede entrar en conflicto con obligaciones de la AI Act y con normativa de ciberseguridad; el uso ofensivo sin autorización escrita es ilegal en la mayoría de jurisdicciones.
- Benchmarks no verificados: todos los resultados proceden del autor y están marcados como `verified: false`. No hay replicación independiente.
- Posible sobreajuste a los benchmarks de seguridad: el modelo se abliteró con pares de prompts de ciberseguridad y se evalúa con benchmarks del mismo dominio, lo que puede inflar la aparente preservación de capacidades.
- Alucinación: no se documentan evaluaciones de factualidad ni de calibración; el riesgo es el habitual en modelos de ~28B sin datos específicos.
- Idiomas y contexto: no se especifican la ventana de contexto ni la cobertura lingüística, lo que impide garantizar calidad multilingüe o en documentos largos.
- Caveat de producción: la etiqueta `image-text-to-text` de Hugging Face no está respaldada por la model card; no asumir capacidades multimodales.
- Repositorio de 109,4 GB: requiere almacenamiento y ancho de banda considerables para descarga y despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/OBLITERATUS/feyospace-s1-OBLITERATED
- Modelo base: https://huggingface.co/feyospace/feyospace-v1.1-small
- Herramientas OBLITERATUS: https://github.com/OBLITERATUS
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Paper WMDP (Li et al., ICML 2024): referencia citada en la model card, sin enlace directo en la información disponible
- CyberGym benchmark: referencia citada en la model card, sin enlace directo en la información disponible
