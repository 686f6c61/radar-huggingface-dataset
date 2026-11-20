# Jeesup/svd-safety-l3_svdllmjbbsep24_r50

## Resumen

`svd-safety-l3_svdllmjbbsep24_r50` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante SVD-LLM hasta conservar aproximadamente el 50 % de los parámetros densos (fracción resultante 0,4997, es decir, un 50,00 % de parámetros eliminados) y posteriormente recuperado con la etapa 2 de LoRA de SVD-LLM. Lo publica el usuario Jeesup en Hugging Face y forma parte de una batería de experimentos sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes lo repara mejor.

El modelo no es un asistente conversacional de propósito general: es una celda concreta de una cuadrícula de experimentos que cruza reglas de selección de componentes y presupuestos de compresión. Su interés es metodológico, ya que cuantifica el coste en seguridad (tasas de éxito de ataque) y en utilidad (perplejidad y precisión zero-shot) de aplicar una compresión agresiva sobre un modelo alineado de 8 000 millones de parámetros.

Arquitectónicamente hereda el transformer decoder-only de Llama 3 8B Instruct, con 8 030 261 248 parámetros según los pesos en safetensors, y se distribuye bajo la licencia Llama 3 Community License. El repositorio ocupa 16,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD-LLM |
| Parametros totales | 8 030 261 248 (checkpoint comprimido; fracción de parámetros densos 0,4997) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama 3 8B Instruct soporta 8 192 tokens) |
| Tipos de cuantizacion | No disponible en la información proporcionada; los pesos se publican en safetensors (bf16) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Llama 3 Community License (se incluyen LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El punto de partida es `Meta-Llama-3-8B-Instruct`, un transformer decoder-only con 8 000 millones de parámetros. Sobre él se aplica SVD-LLM, un método de compresión que descompone las matrices de pesos y descarta componentes según una regla de selección, usando un SVD blanqueado (whitened SVD) implementado por los autores originales en `AIoT-MLSys-Lab/SVD-LLM`. En esta celda se elimina el 50,00 % de los parámetros y se conserva una fracción de 0,4997, con semilla 42.

La calibración combina una parte de utilidad y otra de seguridad en un único conjunto agrupado: `wikitext2:256 + jbb_harm_resp_sep:24`. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2 048 tokens (muestreo de SVD-LLM, semilla 42) y todas las posiciones; la parte de seguridad usa los primeros 24 de los 94 objetivos de JailbreakBench junto con las negativas del propio Llama-3-8B-Instruct (orden con semilla 42), una conversación por muestra, con 1 406 posiciones en total. La proporción efectiva de posiciones dedicadas a seguridad es de solo 0,0027, un dato clave para interpretar el resultado. La matriz de calibración se construye como S·Sᵀ = suma sobre WikiText de x·xᵀ más suma sobre seguridad de x·xᵀ.

Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM mediante LoRA secuencial (primero U, luego V) sobre `alpaca-cleaned`, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama 3 8B Instruct, aunque degradada por la compresión y por el propósito experimental del checkpoint.
- Razonamiento y respuesta a instrucciones en el rango esperable de un Llama 3 8B, con pérdida de calidad medible (perplejidad en WikiText-2 de 81,6555 y precisión media zero-shot de 0,4523 en 7 tareas).
- Capacidad de rechazo de peticiones dañinas, pero con una tasa de éxito de ataque elevada (ASR de 0,4942 en AdvBench y 0,3514 en StrongREJECT, juez HarmBench), lo que indica que la compresión deteriora el alineamiento de seguridad.
- Soporte de tool calling y function calling: no documentado de forma específica para este checkpoint; el modelo base lo soporta, pero no hay garantía tras la compresión.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Estudio de la degradación de seguridad por compresión: sirve como sujeto experimental para medir cómo varía la tasa de éxito de ataque (AdvBench, StrongREJECT) al reducir parámetros, comparando esta celda con las demás de la cuadrícula.
- Evaluación de reglas de selección de componentes: permite contrastar distintas reglas de selección SVD (por ejemplo, esta variante frente a `svdllmwjsep24_r50` o `svdllmjbbsep24_r40`) manteniendo fijo el presupuesto de compresión.
- Investigación en interpretabilidad de mecanismos de rechazo: al conocer la proporción exacta de posiciones de seguridad en la calibración (0,0027), se puede analizar qué componentes sostienen el comportamiento de negativa y cuáles se pierden.
- Reproducción de experimentos de compresión: la semilla (42), el conjunto de calibración y los hiperparámetros de LoRA están documentados, lo que permite replicar el pipeline SVD-LLM con las mismas condiciones.
- Benchmarking de robustez frente a jailbreaks: útil para comparar la resistencia de checkpoints comprimidos frente a modelos densos en entornos de evaluación controlados.
- Análisis de la relación seguridad-utilidad: la pareja de métricas (perplejidad 81,6555 y ASR 0,4942) permite trazar curvas de compromiso y estudiar si la recuperación con LoRA repara la seguridad sin sacrificar utilidad.
- Docencia y formación en compresión de modelos: ejemplo realista de cómo una técnica de compresión ampliamente usada puede erosionar salvaguardas si el conjunto de calibración no las representa adecuadamente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,4942 |
| StrongREJECT ASR (juez HarmBench) | 0,3514 |
| Macro over-refusal (WildGuard) | 0,1757 |
| Perplejidad en WikiText-2 | 81,6555 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4523 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en estas mismas métricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más memoria para el contexto y el runtime; en la práctica se recomienda un mínimo de 18-20 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: en torno a 4,5-5 GB de pesos, con overhead adicional.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4090 o GPUs con 16 GB o más para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en bf16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio), y en principio vLLM, llama.cpp u Ollama si se generan pesos GGUF a partir del checkpoint, aunque no se documenta en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l3_svdllmjbbsep24_r50` | 8 030 261 248 (fracción 0,4997) | No disponible | Llama 3 Community License | Checkpoint experimental comprimido; ASR AdvBench 0,4942; perplejidad WikiText-2 81,6555 |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8 000 millones | 8 192 tokens | Llama 3 Community License | Modelo base sin comprimir; referencia de utilidad y seguridad frente a la que se mide la degradación |
| `Jeesup/svd-safety-l3_svdllmwjsep24_r50` | No disponible | No disponible | Llama 3 Community License | Variante de la misma cuadrícula con calibración solo de utilidad (WikiText-2 + JailbreakBench) |
| `Jeesup/svd-safety-l3_svdllmjbbsep24_r40` | No disponible | No disponible | Llama 3 Community License | Variante de la misma cuadrícula con presupuesto de compresión distinto (r40) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que varias celdas de la cuadrícula están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; esta celda presenta una tasa de éxito de ataque de 0,4942 en AdvBench, muy superior a la esperable en el modelo base alineado.
- No es un modelo de propósito general ni un asistente desplegable: es un artefacto de investigación y debe tratarse como sujeto experimental.
- La proporción efectiva de posiciones de seguridad en la calibración es de solo 0,0027, lo que sugiere que la señal de seguridad apenas influye en la selección de componentes y explica en parte la degradación observada.
- Riesgo de alucinación: no evaluado de forma específica en la información disponible, pero la compresión al 50 % y la perplejidad de 81,6555 en WikiText-2 indican una pérdida sustancial de calidad respecto al modelo base.
- La macro over-refusal medida es de 0,1757 (WildGuard), lo que indica que el modelo rechaza de más en algunos casos además de fallar en otros.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Restricciones de licencia: Llama 3 Community License, con LICENSE y USE_POLICY.md incluidos en el repositorio; el uso comercial está sujeto a los términos de Meta, incluidos los requisitos de atribución y las restricciones de la política de uso aceptable.
- No se han documentado evaluaciones de tool calling, agentes o contexto largo tras la compresión; no se debe asumir que estas capacidades se conservan.
- El repositorio no registra descargas ni interacciones, por lo que no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbsep24_r50
- Variante con calibración solo de utilidad: https://huggingface.co/Jeesup/svd-safety-l3_svdllmwjsep24_r50
- Variante de la misma familia (l2): https://huggingface.co/Jeesup/svd-safety-l2_svdllmjbbsep24_r50
- Ficha de la variante r40 en Free2AITools: https://free2aitools.com/model/jeesup/svd-safety-l3_svdllmjbbsep24_r40
- Perfil del autor en OpenModelStats: https://openmodelstats.com/owners/jeesup
- Endpoint de inferencia de una variante relacionada en FriendliAI: https://friendli.ai/models/Jeesup/svd-safety-l2_svdllmjbbsep24_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Implementación de SVD-LLM citada por el autor: https://github.com/AIoT-MLSys-Lab/SVD-LLM
