# Jeesup/svd-safety-l3_svdllmorc48_r50

## Resumen

`svd-safety-l3_svdllmorc48_r50` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante SVD-LLM hasta conservar el 50,0 % de los parámetros densos (fracción resultante 0,4997) y posteriormente recuperado con una etapa de LoRA de segundo orden (U seguido de V). Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. No es un modelo de propósito general: es una celda concreta de una malla experimental sobre reglas de selección y presupuestos de compresión.

El modelo mantiene la arquitectura transformer decoder-only de Llama 3 8B, con 8.030.261.248 parámetros declarados en los safetensors del repositorio y una ventana de contexto heredada del modelo base (8.192 tokens según la familia Llama 3). Su interés técnico reside en la metodología: la selección de componentes se hace con un SVD blanqueado estimado sobre un conjunto de calibración mixto que combina utilidad (WikiText-2) y seguridad (prompts benignos pero aparentemente tóxicos de OR-Bench-hard), con una cuota efectiva de seguridad de solo el 4,61 % de las posiciones.

Es relevante ahora porque cuantifica empíricamente el coste de seguridad de la compresión: el checkpoint presenta una tasa de éxito de ataque (ASR) de 0,4135 en AdvBench y 0,3546 en StrongREJECT, ambas medidas con el juez HarmBench, frente a un modelo base alineado. Cualquier equipo que comprima modelos alineados con SVD debería considerar estos números como referencia del riesgo introducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido con SVD-LLM y recuperado con LoRA en dos etapas |
| Parametros totales | 8.030.261.248 (fracción densa resultante 0,4997 respecto al base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3 8B Instruct soporta 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de partida es el transformer decoder-only de Llama 3 8B Instruct. La compresión aplica SVD-LLM con el estimador de SVD blanqueado de los autores (AIoT-MLSys-Lab/SVD-LLM) sobre un conjunto de calibración agrupado: la matriz de covarianza se estima como S·Sᵀ = Σ_WikiText x·xᵀ + Σ_safety x·xᵀ. La parte de utilidad usa WikiText-2 train con 255 ventanas de 2.048 tokens (muestreo de SVD-LLM, semilla 42) evaluando todas las posiciones; la parte de seguridad usa los primeros 48 de 403 prompts de OR-Bench-hard-1k (aparentemente tóxicos pero benignos) con las respuestas conformes del propio Llama-3-8B-Instruct (orden con semilla 42), una conversación por muestra desempaquetada, con 25.213 posiciones evaluadas. La cuota efectiva de seguridad es de 0,0461 de las posiciones.

Tras eliminar el 50,00 % de los parámetros se aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16, usando el dataset alpaca-cleaned. No se documenta en la información disponible ningún proceso de RLHF o DPO adicional más allá del ya presente en el modelo base; la recuperación es puramente supervisada sobre instrucciones.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-3-8B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla de Llama 3).
- Conocimiento factual y tareas de comprensión de lenguaje natural, aunque degradadas por la compresión (perplejidad en WikiText-2 de 82,2038 y precisión media zero-shot de 0,4591 en 7 tareas).
- No se documenta soporte específico de tool calling o function calling en la model card; el modelo base lo soporta parcialmente, pero la compresión puede afectar a este comportamiento y no hay medición al respecto.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá de lo heredado del base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación sobre seguridad en compresión de modelos: usar este checkpoint como celda de control para medir cómo varía la ASR (0,4135 en AdvBench, 0,3546 en StrongREJECT) al cambiar la regla de selección de componentes o el presupuesto de compresión.
- Estudio de interpretabilidad de subspacios SVD: analizar qué direcciones de la matriz de pesos se eliminan y cómo se correlacionan con comportamientos de rechazo o conformidad, gracias a que la receta de calibración está documentada de forma reproducible (semilla 42, ventanas y prompts concretos).
- Evaluación de pipelines de recuperación con LoRA: comparar la etapa 2 (LoRA secuencial U→V, r=8, alpaca-cleaned) frente a otras estrategias de recuperación para determinar cuál preserva mejor la alineación.
- Benchmarking de robustez adversarial: emplear el modelo como sujeto de pruebas en harnesses de red-teaming (HarmBench, StrongREJECT, WildGuard) para calibrar detectores de degradación de seguridad en modelos comprimidos.
- Estudio de sobre-rechazo: la métrica de sobre-rechazo macro (0,0963 con WildGuard) permite analizar el equilibrio entre rechazar peticiones dañinas y rechazar peticiones benignas en modelos comprimidos.
- Reproducibilidad de experimentos académicos: al estar publicados los pesos, la semilla y la composición exacta del calibrado, sirve para replicar resultados de papers sobre compresión SVD sin reentrenar desde cero.
- Análisis de eficiencia memoria/calidad: comparar la huella de 16,1 GB del repositorio frente al modelo denso para estudiar el ahorro real de memoria en despliegues con requisitos estrictos, aceptando la pérdida de calidad medida.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,4135 |
| StrongREJECT ASR (juez HarmBench) | 0,3546 |
| Sobre-rechazo macro (WildGuard) | 0,0963 |
| Perplejidad WikiText-2 | 82,2038 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4591 |

No se han publicado en la información disponible resultados comparativos frente a Llama-3-8B-Instruct denso ni frente a otras celdas de la malla; los valores anteriores son absolutos y deben interpretarse como referencia de la celda concreta.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un GPU con 24 GB o más para contexto largo.
- En cuantización de 8 bits: alrededor de 8-9 GB de pesos, viable en GPUs consumer de 12-16 GB.
- En cuantización de 4 bits: alrededor de 4-5 GB de pesos, viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 con margen amplio.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB para serving de alta concurrencia; RTX 4090 24 GB para desarrollo e inferencia individual; RTX 3090 24 GB como alternativa económica.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ASR AdvBench | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| svd-safety-l3_svdllmorc48_r50 | 8,03 B (50 % denso) | no disponible (base 8.192) | 0,4135 | 82,2038 | Llama 3 | Hugging Face, 0 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | no disponible en esta ficha | no disponible en esta ficha | Llama 3 | Hugging Face, ampliamente adoptado |
| Otras celdas de la malla SVD-LLM del mismo autor | ~8 B comprimidos | no disponible | no disponible | no disponible | Llama 3 | Hugging Face, no disponibles en la información |

La comparación cuantitativa con el modelo denso no puede completarse porque la model card no incluye las métricas del base sin comprimir; se recomienda medirlas con el mismo harness (HarmBench, WildGuard, lm-evaluation-harness) antes de extraer conclusiones.

## Limitaciones y advertencias

- El propio autor advierte de que varias celdas de la malla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; este checkpoint no debe tratarse como asistente desplegable.
- La ASR de 0,4135 en AdvBench y 0,3546 en StrongREJECT indican una degradación sustancial de la alineación frente al modelo base, aunque no se dispone del valor del base para cuantificar la diferencia exacta.
- La perplejidad de 82,2038 en WikiText-2 y la precisión media zero-shot de 0,4591 en 7 tareas reflejan una pérdida de calidad de lenguaje y conocimiento considerable tras eliminar el 50 % de parámetros.
- Riesgo de alucinación elevado por la compresión agresiva y por la recuperación limitada a 2 épocas de LoRA sobre alpaca-cleaned.
- Sesgos: no documentados en la model card; hereda los del modelo base Llama 3, no mitigados específicamente.
- Idiomas soportados no documentados; se asume el perfil multilingüe del base, pero sin garantías tras la compresión.
- La licencia Llama 3 Community License impone restricciones de uso comercial (cláusulas de escala de usuarios, atribución "Built with Meta Llama 3" y políticas de uso aceptable en `USE_POLICY.md`); es obligatorio revisar `LICENSE` y `USE_POLICY.md` incluidos en el repositorio.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados reportados.
- No se distribuyen pesos en GGUF ni cuantizaciones listas para usar; cualquier despliegue en consumer requiere conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmorc48_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM de referencia (AIoT-MLSys-Lab): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Política de uso de Llama 3: https://llama.meta.com/llama3/use-policy/
