# luisbrel/proto-nemotron

## Resumen

Proto-Nemotron es un checkpoint experimental de ajuste posterior (post-training) sobre NVIDIA Nemotron 3.5 Lightning, un modelo de 30B parámetros totales con arquitectura híbrida que combina Mamba SSM, mezcla de expertos (MoE) con 128 expertos enrutados, atención multi-cabeza y predicción multi-token (MTP). Lo desarrolla el usuario independiente luisbrel como proyecto de investigación, aplicando un marco propio denominado Bender-Bench, que realiza una optimización geométrica de pesos en espacio de parámetros y un proceso de auto-mejora recursiva (RSI).

El modelo se distribuye cuantizado en 4 bits (afín) con un peso aproximado de 17,25 GB y está pensado para ejecutarse nativamente en Apple Silicon mediante MLX, en concreto en un M4 Max con 128 GB de memoria unificada. Su relevancia radica en explorar técnicas de cirugía de pesos sobre arquitecturas híbridas Mamba-MoE, un área poco documentada, y en ofrecer una alternativa ejecutable en hardware de consumo de Apple para tareas de razonamiento y agentes.

No obstante, la propia model card es explícita sobre el carácter preliminar del trabajo: el checkpoint fue marcado programáticamente como `REJECTED_REGRESSION` por su propia puerta de evaluación Pareto, y varias métricas antiguas aparecen como disputadas y pendientes de re-ejecución. Debe tratarse, por tanto, como material de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Mamba SSM + MoE (128 expertos enrutados, 6 activos por token, 1 experto compartido) + atención multi-cabeza + predicción multi-token (MTP) |
| Parametros totales | 31.577.940.288 (~31,6B) |
| Parametros activos | 3,55B por defecto (k=6); 4,24B en modo experimental k=8 |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | 4 bits afín (checkpoint publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (librería MLX) |
| Capas | 52 |
| Huella en disco | ~17,25 GB (repo 17,8 GB) |
| Hardware de referencia | Apple Silicon M4 Max, 128 GB memoria unificada, MLX |

## Arquitectura y entrenamiento

La arquitectura base es un transformer híbrido que intercala capas de espacio de estados Mamba con capas de atención multi-cabeza, e incorpora una capa MoE con 128 expertos enrutados (6 activos por token en la configuración por defecto, ampliable a 8) más un experto compartido siempre activo. Incluye además un cabezal de predicción multi-token (MTP), habitual en modelos orientados a decodificación especulativa. El modelo consta de 52 capas y soporta un contexto de 1.048.576 tokens.

El entrenamiento original corresponde a NVIDIA Nemotron 3.5 Lightning; el autor no documenta la composición del dataset ni el número de tokens de preentrenamiento. Sobre esa base, Proto-Nemotron aplica un proceso de "cirugía de pesos" (weight surgery) mediante optimización geométrica multi-etapa y alineamiento de representaciones, ejecutado en un M4 Max con MLX. La evaluación se realizó con el marco Bender-Bench sobre 10 generaciones de torneo y 798.025 tokens generados, sin simulaciones. No se documentan fases de RLHF o DPO específicas para este checkpoint.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Nemotron 3.5 Lightning.
- Razonamiento matemático y resolución de problemas tipo competición (evaluado en MATH-500 y BIG-bench Hard).
- Generación de código, evaluada en LiveCodeBench y HumanEval+ en la documentación del autor.
- Orquestación agéntica multi-paso, evaluada en la suite "Hard Agentic Orchestration".
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Modos de capacidad de parámetros activos: k=6 (3,55B) y k=8 (4,24B) para mayor capacidad computacional.
- Ejecución nativa en Apple Silicon mediante MLX; no se documenta soporte de tool calling, visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación en cirugía de pesos: servir como referencia reproducible para estudiar cómo la optimización geométrica de pesos afecta a un modelo híbrido Mamba-MoE, comparando los checkpoints base y ajustado con las mismas suites.
- Evaluación de arquitecturas híbridas en Apple Silicon: probar el rendimiento de Mamba SSM + MoE en MLX sobre M4 Max para medir throughput (~19,8 tok/s) y consumo de memoria (~17,2 GB) en escenarios reales.
- Procesamiento de documentos largos: aprovechar la ventana de 1M tokens para resumir o analizar corpus extensos en local, sin depender de servicios en la nube.
- Prototipado de agentes locales: usar la suite de orquestación agéntica como banco de pruebas para pipelines multi-paso ejecutados íntegramente en un equipo de sobremesa Apple.
- Generación de código asistida en local: emplear el modelo en entornos de desarrollo sobre macOS para autocompletado y generación de fragmentos, con la ventaja de privacidad de ejecución local.
- Reproducción de benchmarks: replicar las evaluaciones de Bender-Bench (LiveCodeBench, MATH-500, BBH, agéntico) para verificar o refutar los resultados reportados, dado el estado disputado de algunas métricas.
- Estudio de modos de capacidad MoE: comparar el comportamiento de k=6 frente a k=8 para analizar el equilibrio entre capacidad activa y latencia.

## Benchmarks y rendimiento

Resultados reportados en la model card (evaluación head-to-head, n=50 por suite, 200 muestras totales, M4 Max 128 GB MLX):

| Suite | Base Nemotron (k=6) | Proto-Nemotron (k=8) | Delta | Estado |
|---|---|---|---|---|
| LiveCodeBench | 96,0% (48/50) | 100,0% (50/50) | +4,0% | Ganancia verificada |
| Hard Agentic Orchestration | 90,0% (45/50) | 92,0% (46/50) | +2,0% | Ganancia verificada |
| MATH-500 (ancla) | 56,0% (28/50) | 54,0% (27/50) | -2,0% | Regresión |
| BIG-bench Hard (BBH) | 76,0% (38/50) | 68,0% (34/50) | -8,0% | Regresión |

Métricas de capacidad activa y rendimiento:

| Modo | Parámetros activos | Throughput | Memoria |
|---|---|---|---|
| k=6 (por defecto) | 3,55B | 19,8 tok/s | 17.168,1 MB |
| k=8 (experimental) | 4,24B | 19,9 tok/s | 17.176,8 MB |

Advertencia del autor: la puerta `ParetoAnchorGate.strict_rsi_gate` marcó el checkpoint como `REJECTED_REGRESSION` con `max_anchor_regression = 8.0`, y la invariante de cero regresiones no se mantuvo (`zero_regression_invariant_held: false`). Varias métricas de borradores anteriores (GPQA +32,7%, AIME +10,0%, tool calling 100%, HumanEval+ +3,3%, GSM8K +2,0%, macro de 11 suites 84,38%) figuran como `[DISPUTED — RE-RUN REQUIRED]` por falta de respaldo y por contradecir las regresiones medidas.

## Requisitos de hardware

- VRAM/memoria unificada: ~17,25 GB para el checkpoint cuantizado en 4 bits.
- Hardware de referencia: Apple Silicon M4 Max con 128 GB de memoria unificada, ejecutando MLX.
- Cabe en equipos Apple Silicon con al menos ~20 GB de memoria unificada disponibles; no se documenta compatibilidad con GPU NVIDIA ni CUDA.
- Despliegue: exclusivamente mediante `mlx_lm` (librería MLX). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: ~19,8 tok/s en modo k=6 y ~19,9 tok/s en modo k=8 sobre M4 Max.
- Latencia específica por petición: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Proto-Nemotron | ~31,6B totales / 3,55B activos | 1M | MIT | Hugging Face (MLX) | Checkpoint experimental, marcado como regresión por su propia puerta |
| NVIDIA Nemotron 3.5 Lightning (base) | ~30B totales / 3,5B activos | 1M | No disponible en la información | Modelo base de referencia | Base sobre la que se aplica el ajuste |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Carácter experimental: el autor lo define como proyecto de investigación independiente, no como modelo de producción.
- Regresión medida: BIG-bench Hard cae un 8,0% y MATH-500 un 2,0% respecto al base; la puerta Pareto lo marcó como `REJECTED_REGRESSION`.
- Métricas disputadas: varias cifras de borradores previos están retiradas o pendientes de re-ejecución; no deben citarse como válidas.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe.
- Riesgo de alucinación: no evaluado ni documentado por el autor.
- Sesgos: no documentados.
- Licencia MIT: permite uso comercial, pero el estado de validación del checkpoint desaconseja su uso en producción sin una evaluación propia.
- Dependencia de hardware: solo MLX/Apple Silicon; no hay soporte documentado para CUDA ni para servidores de inferencia estándar.
- Sin datos de tool calling, visión ni audio verificados.
- El modo k=8 es experimental y no muestra mejora de throughput frente a k=6 (19,9 vs 19,8 tok/s).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luisbrel/proto-nemotron
- DOI del proyecto (Concept DOI): https://doi.org/10.5281/zenodo.24122803
- Repositorio MLX: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
