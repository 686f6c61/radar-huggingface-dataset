# Novasaki/Nanbeige4.2-3B-GrugSpeech-Native

## Resumen

Nanbeige4.2-3B-GrugSpeech-Native es un adaptador PEFT/LoRA publicado por el usuario Novasaki (repo `Novasaki/Nanbeige4.2-3B-GrugSpeech-Native`) sobre el modelo base `Nanbeige/Nanbeige4.2-3B` de BOSS Zhipin. El objetivo declarado del ajuste es que el modelo razone internamente en "Grug Speech", un estilo de cadena de pensamiento telegráfico y de alta densidad (primitivas como `Goal:`, `Analyze:`, `Constraints:`, `Done.`) en lugar de prosa larga dentro de las etiquetas `<think>`. Según el autor, ese formato comprime el razonamiento entre 3,5 y 8 veces en tokens manteniendo la calidad de respuesta.

El modelo base es un transformer decoder-only denso (`NanbeigeForCausalLM`, 22 capas, vocabulario de 166.144 tokens, ventana de contexto declarada de 262.144 tokens). El repositorio incluye tanto el adaptador LoRA en BF16 (45,76 MB) como binarios GGUF cuantizados Q4_K_M (2,39 GB) y Q8_0 (4,13 GB), lo que lo hace desplegable en portátiles, equipos Apple Silicon y servidores de borde. El número real de parámetros en los ficheros safetensors del repo es de 4.169.800.704, por encima de los 3,8 B que anuncia la model card, presumiblemente por el padding del vocabulario.

Su relevancia es doble: por un lado, es un ejemplo práctico de reducción del coste de tokens de razonamiento (menos tokens de CoT se traducen en menos latencia y menos coste por consulta); por otro, es una ficha de muy bajo perfil (0 descargas, 0 likes) publicada en octubre de 2026, sin resultados de benchmarks independientes ni verificación externa. Los datos de rendimiento que se recogen más abajo proceden exclusivamente de la model card del autor y no han sido contrastados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`NanbeigeForCausalLM`), 22 capas; requiere `custom_code` en Transformers |
| Parametros totales | 4.169.800.704 (~4,17 B) según safetensors del repo; la model card declara 3,82 B y el nombre del repo indica 3B |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens (262k), según la model card |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0 publicados; adaptador LoRA en BF16; safetensors |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF (Q4_K_M, Q8_0) |
| Vocabulario | 166.144 tokens (padding corregido, según el autor) |
| Tamano del repositorio | 14,1 GB |
| Modelo base | Nanbeige/Nanbeige4.2-3B (BOSS Zhipin) |
| Libreria | peft |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Nanbeige4.2-3B: un transformer causal denso de 22 capas con vocabulario de 166.144 tokens y contexto declarado de 262.144 tokens, implementado como clase personalizada (`NanbeigeForCausalLM`), por lo que su uso en Transformers requiere `trust_remote_code=True`. Sobre esa base, Novasaki aplica un ajuste LoRA en BF16 (45,76 MB) cuyo único objetivo declarado es cambiar el formato de la cadena de pensamiento, no las capacidades del modelo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o preferencias. Tampoco se documenta metodología de evaluación. Lo que sí se explicita es un detalle de ingeniería: la corrección del padding del vocabulario hasta alinearlo exactamente con 166.144 tokens para evitar errores de `check_tensor_dims`. El "estilo Grug Speech" se inspira, según el autor, en la arquitectura de razonamiento de "GPT-5.6" ("Sol" y "Terra"), una referencia que no puede verificarse con la información disponible.

## Capacidades

- Generacion de texto conversacional en formato chat con plantilla `ChatML` (`<|im_start|>` / `<|im_end|>`).
- Razonamiento interno en modo "thinking" mediante etiquetas `<think>`, con cadenas de pensamiento telegráficas de alta densidad en lugar de prosa.
- Compresion de tokens de razonamiento: el autor declara factores de 3,5x a 8x frente a CoT estándar, con una media de 30-50 tokens de razonamiento por consulta.
- Razonamiento agéntico y multi-paso (etiqueta `agentic-reasoning` en el repo).
- Uso de herramientas y function calling (etiqueta `tool-use`).
- Generacion de codigo (etiqueta `coding`).
- Integracion con `endpoints_compatible`, es decir, apto para el endpoint de inferencia alojado de Hugging Face.
- Idiomas soportados: no especificados; la model card y el prompt de ejemplo están únicamente en inglés.
- No se declara soporte de visión, audio ni multimodalidad.

## Casos de uso

- Razonamiento de bajo coste en producción: al comprimir la CoT a 30-50 tokens, el coste por consulta en APIs de pago por token cae proporcionalmente, y la latencia de generación baja porque hay menos tokens que decodificar.
- Agentes con tool calling: el formato telegráfico deja más espacio de contexto útil para los resultados de herramientas dentro de la ventana de 262k tokens, reduciendo el riesgo de truncado en cadenas de varios pasos.
- Asistentes sobre documento largo: con 262.144 tokens de contexto puede ingerir contratos, expedientes o bases de código extensas en una sola pasada sin recuperación externa.
- Despliegue en portátil o borde: la cuantización Q4_K_M de 2,39 GB permite ejecutarlo en máquinas con 4-8 GB de RAM o VRAM, útil para demos locales, prototipos offline y entornos sin GPU.
- Generación de código asistida: las etiquetas `coding` y `tool-use` sugieren uso en autocompletado, revisión de PRs o generación de tests; el formato corto de razonamiento es adecuado para pipelines con presupuesto de latencia estricto.
- Análisis de datos con agentes: la model card menciona su evaluación en un agente de análisis empresarial sobre un Excel de 100.300 filas, con validación de esquema de salida (`Schema OK`), un escenario típico de generación de consultas y resúmenes estructurados.
- Investigación sobre compresión de razonamiento: sirve como caso de estudio reproducible para comparar calidad de respuesta entre CoT verbosa y CoT telegráfica sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos proceden de la propia model card del autor, que no incluye MMLU, HumanEval, GSM8K ni métricas estándar comparables, sino medidas de velocidad y una comparativa interna. Se reproducen a continuación tal cual, sin verificación independiente:

| Metrica declarada por el autor | Valor |
|---|---|
| Velocidad de ingesta de prompt | 3.583,0 tokens/s |
| Velocidad de generación | 218,1 tokens/s |
| Ratio de compresión de tokens de razonamiento | 3,5x - 8,0x |
| Tokens de razonamiento medio | 30-50 tokens |
| Tamano del binario Q4_K_M | 2,39 GB |
| Tamano del binario Q8_0 | 4,13 GB |
| Tamano del adaptador LoRA | 45,76 MB |

Comparativa entre familias declarada por el autor (modelos referenciados no verificables con la información disponible):

| Familia | Parametros activos | Velocidad de prompt | Velocidad de generación | Tokens de razonamiento | Factor de compresión |
|---|---|---|---|---|---|
| Nanbeige4.2-3B-GrugSpeech | 3,82 B | 3.583 tok/s | 218 tok/s | 30-50 | ~7,5x |
| MiniCPM5-2B-GrugSpeech | 2,48 B | 2.204 tok/s | 393 tok/s | 28-45 | ~8,2x |
| Qwen3.5-4B-GrugSpeech | 4,49 B | 1.450 tok/s | 208-257 tok/s | 42-75 | ~4,6x |
| Qwen3.5-2B-GrugSpeech | 2,17 B | 1.840 tok/s | 280 tok/s | 32-55 | ~6,5x |
| Gemma-4-E2B-GrugSpeech | 2,61 B | 2.591 tok/s | 87 tok/s | 35-60 | ~5,8x |
| Baseline CoT estandar | 2B-4B | ~1.200 tok/s | 80-200 tok/s | 300-1.200 | 1,0x |

La model card menciona además un "Full-Suit Master Leaderboard" con 11 modelos evaluados sobre un agente de análisis de datos, pero la tabla aparece truncada en la información disponible y, en el fragmento visible, el propio Nanbeige4.2-3B-GrugSpeech no figura entre los modelos listados, por lo que no se puede atribuir ningún resultado de ese ranking a este modelo.

## Requisitos de hardware

- VRAM/RAM para Q4_K_M: 2,39 GB de pesos; con overhead de contexto, unos 3-4 GB. Cabe en portátiles de 4-8 GB y en Apple Silicon.
- VRAM/RAM para Q8_0: 4,13 GB de pesos; requiere 6-8 GB de memoria libre.
- Adaptador LoRA en BF16: 45,76 MB, pero necesita cargar la base completa (en BF16, aproximadamente 8,4 GB de pesos calculados a partir de los 4,17 B de parámetros; cifra estimada, no declarada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060/4060 de 12 GB o superior es suficiente para Q8_0 con contexto moderado; A100 o H100 solo tendrían sentido para servir lotes grandes, no por requisito de memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más para cuantizaciones Q4_K_M y Q8_0.
- Opciones de despliegue documentadas: llama.cpp (`llama-cli -ngl 99`) y Ollama mediante `Modelfile`; el adaptador requiere Transformers con PEFT y `trust_remote_code`. No se documenta soporte de vLLM, TGI ni SGLang.
- Latencia y throughput: 3.583 tok/s de prefill y 218,1 tok/s de generación según el autor. No se indica el hardware ni el lote con el que se obtuvieron esas cifras, por lo que no son extrapolables.

## Comparativa con modelos similares

No hay datos verificables suficientes para una comparativa rigurosa. La única información disponible son las tablas del propio autor, que comparan con familias (MiniCPM5-2B, Qwen3.5-4B/2B, Gemma-4-E2B, PrismML "bonsai") cuya existencia y especificaciones no se pueden confirmar con las fuentes proporcionadas. Como referencia estructural mínima:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nanbeige4.2-3B-GrugSpeech-Native | 4,17 B (safetensors) | 262k (declarado) | apache-2.0 | Hugging Face, 0 descargas |
| Nanbeige/Nanbeige4.2-3B (base) | no disponible | 262k (declarado) | no disponible en la información facilitada | Hugging Face |
| Alternativas de 2B-4B con CoT | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de validación externa: 0 descargas, 0 likes, ninguna evaluación independiente y ningún benchmark estándar publicado.
- Riesgo de alucinación: el formato telegráfico de razonamiento reduce el número de tokens dedicados a la verificación explícita, lo que puede degradar la detección de errores en tareas de razonamiento complejo. No se aportan datos sobre tasas de error.
- Idiomas no declarados: no hay información sobre el soporte real de castellano ni de otros idiomas; todos los ejemplos de la model card están en inglés.
- Referencias no verificables: la model card apela a "GPT-5.6", "Qwen3.5", "Gemma-4" y "bonsai-prismml", modelos cuya existencia no se puede confirmar con la información disponible.
- Inconsistencia de tamaños: el nombre del repo indica 3B, la model card 3,8 B/3,82 B y los safetensors 4,17 B.
- Requiere `trust_remote_code` y `custom_code` para cargar la arquitectura `NanbeigeForCausalLM`, lo que implica ejecutar código del repositorio y aumentar la superficie de riesgo en producción.
- Licencia apache-2.0 en el adaptador, pero conviene revisar la licencia del modelo base Nanbeige4.2-3B, no incluida en la información facilitada, antes de un uso comercial.
- El rendimiento declarado (3.583 tok/s de prompt) no viene acompañado del hardware empleado; no debe tomarse como referencia para dimensionar infraestructura.
- El repositorio ocupa 14,1 GB, muy por encima de lo que sugieren los tamaños de los ficheros citados, lo que sugiere duplicación de pesos o artefactos adicionales no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Novasaki/Nanbeige4.2-3B-GrugSpeech-Native
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Repositorio del proyecto: https://github.com/Nov4Saki/grug-speech-reasoning
- Fichero GGUF Q4_K_M: https://huggingface.co/Novasaki/Nanbeige4.2-3B-GrugSpeech-Native/blob/main/Nanbeige4.2-3B-GrugSpeech-Q4_K_M.gguf
- Fichero GGUF Q8_0: https://huggingface.co/Novasaki/Nanbeige4.2-3B-GrugSpeech-Native/blob/main/Nanbeige4.2-3B-GrugSpeech-Q8_0.gguf
- Adaptador LoRA: https://huggingface.co/Novasaki/Nanbeige4.2-3B-GrugSpeech-Native/tree/main/lora_adapter
