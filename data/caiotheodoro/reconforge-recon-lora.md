# caiotheodoro/reconforge-recon-lora

## Resumen

ReconForge Recon es un adaptador LoRA desarrollado por Caio Theodoro sobre el modelo base cuantizado `mlx-community/Qwen3-1.7B-4bit`. Su propósito es resolver una tarea muy concreta del back-office financiero: la conciliación bancaria. El modelo recibe un asiento contable (ledger entry) y un apunte de extracto bancario (bank statement entry), y devuelve un veredicto estructurado en JSON con tres posibles resultados: MATCH (coincidencia), EXCEPTION (excepción tipificada con severidad) o ESCALATE (escalado a revisión humana).

El proyecto destaca por su enfoque metodológico: el entrenamiento duró aproximadamente 100 minutos en un Apple M5 usando la librería MLX, y el adaptador se publica junto con un conjunto de evaluación (ReconEval v0.1.0, 800 tareas) diseñado con metodología inspirada en ARC. El autor reporta que este checkpoint supera a un modelo frontier en la métrica clave, la recall ponderada por severidad (R_w), aunque advierte explícitamente de que este checkpoint es el mejor de cuatro ejecuciones y que el resultado típico esperado de un reentrenamiento se sitúa más cerca de 0.80 que de 0.9451.

La relevancia actual del modelo radica en que demuestra que un modelo pequeño (1.7B) y local, afinado con LoRA, puede competir en tareas verticales de alto valor con modelos mucho mayores, siempre que la tarea esté bien acotada y el prompt de entrenamiento se respete rigurosamente. El adaptador está publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B) con adaptador LoRA |
| Parametros totales | 1.7B (modelo base) + parametros del adaptador LoRA (no especificados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo base en 4-bit (MLX); adaptador LoRA en precision nativa MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (adaptador LoRA en formato mlx; base en safetensors vía mlx-community) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `mlx-community/Qwen3-1.7B-4bit`, la versión cuantizada a 4 bits de Qwen3-1.7B convertida al formato MLX para Apple Silicon. El entrenamiento se realizó con LoRA (Low-Rank Adaptation) utilizando la librería `mlx-lm`, en aproximadamente 100 minutos sobre un Apple M5. El modelo se entrena en modo no-thinking (`enable_thinking=False`) y emite una media de ~38 tokens por veredicto.

Una innovación metodológica destacable es el diseño del prompt de entrenamiento, que forma parte de los pesos del modelo. El autor demuestra que modificar el prompt (por ejemplo, definiendo las clases de excepción en lugar de solo nombrarlas) degrada drásticamente el rendimiento: la accuracy cae de 0.805 a 0.434 y la precisión de flag de 0.824 a 0.508. El entrenamiento usó un mix rebalanceado de datos (la ejecución B2) y la evaluación emplea self-consistency sampling (5 muestras, temperatura 0.6, votación mayoritaria), no una única muestra greedy.

El dataset de evaluación, `caiotheodoro/recon-eval` (ReconEval v0.1.0), contiene 800 tareas held-out con semilla 777, con 0/800 de contaminación exacta por solapamiento y una tasa de casi-duplicados del 3.6% (Jaccard ≥ 0.8). La infraestructura completa del sistema, según el repositorio GitHub, corre sobre Kafka, Temporal Cloud y un ledger de auditoría en Postgres.

## Capacidades

- Conciliación financiera: compara un asiento de ledger con un apunte bancario y emite un veredicto MATCH, EXCEPTION o ESCALATE.
- Salida estructurada en JSON estricto: el modelo devuelve un objeto JSON con claves `verdict`, `exception_type`, `severity`, `confidence`, `reason` y `resolution`.
- Tipificación de excepciones: reconoce 9 clases de excepción (AMOUNT_MISMATCH, FX_CONVERSION_ERROR, BENEFICIARY_MISMATCH, COUNTERPARTY_MISMATCH, VALUE_DATE_MISMATCH, MISSING_MESSAGE, DUPLICATE, FIELD_CORRUPTION, PARTIAL_MATCH).
- Clasificación de severidad: asigna severidad LOW, MEDIUM o HIGH a cada excepción, con recall perfecto (1.000) en excepciones de severidad HIGH en este checkpoint.
- Acciones de resolución sugeridas: propone una de cinco acciones (auto-adjust, escalate, reject, rebook, flag-review).
- Capacidad de parseo robusto: tasa de parseo de 1.000 sobre las 800 tareas de evaluación.
- Integración en pipelines de agentes: diseñado para ser usado como componente de un sistema de agentes de conciliación (el ecosistema ReconForge incluye evaluación de agentes).

## Casos de uso

- Conciliación bancaria automatizada en back-office: el modelo procesa pares de asientos contables y apuntes bancarios de forma masiva, reduciendo el trabajo manual de los equipos de operaciones. Su salida JSON estricta permite integrarlo directamente en sistemas de colas como Kafka.
- Detección de excepciones de alto riesgo: con recall de 1.000 en excepciones de severidad HIGH, es adecuado como primer filtro de triaje que garantiza que ningún caso grave pase desapercibido, aunque arrastre falsos positivos.
- Enriquecimiento de sistemas de auditoría: el veredicto estructurado (con `confidence` y `reason`) puede registrarse en un ledger de auditoría Postgres para trazabilidad regulatoria y revisión posterior.
- Orquestación con Temporal: al devolver acciones de resolución concretas (auto-adjust, escalate, reject, rebook), el modelo puede alimentar workflows de Temporal Cloud que decidan automáticamente el siguiente paso del proceso.
- Evaluación comparativa de modelos financieros: el adaptador y su conjunto de evaluación ReconEval sirven como benchmark reproducible para comparar modelos locales pequeños contra modelos frontier en tareas verticales de conciliación.
- Prototipado de agentes financieros en Apple Silicon: al ser un adaptador MLX sobre un modelo de 1.7B, permite desarrollar y probar agentes de conciliación localmente en hardware de consumo sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados reportados en el conjunto de evaluación ReconEval v0.1.0 (800 tareas, semilla 777), con self-consistency sampling (5 muestras, temp 0.6, votación mayoritaria):

| Metrica | Valor |
|---|---|
| Accuracy | 0.805 |
| Recall ponderado por severidad (R_w) | 0.901 |
| Recall en excepciones HIGH | 1.000 |
| Flag F1 (cualquier predicción no-MATCH sobre las 800 tareas) | 0.824 |
| Tasa de parseo | 1.000 |
| Coste operacional (excepciones HIGH no detectadas) | 0.000 |

Variabilidad entre semillas (mismos datos e hiperparámetros, 4 ejecuciones):

| Ejecucion | R_w |
|---|---|
| Semilla 1 | 0.7457 |
| Semilla 2 | 0.8198 |
| Semilla 3 | 0.8353 |
| Semilla 4 (este checkpoint) | 0.9451 |
| Desviacion estandar | 0.0823 |

Advertencias del autor: este checkpoint es el mejor de cuatro ejecuciones, no un resultado típico; un reentrenamiento debería situarse más cerca de 0.80. Las otras tres ejecuciones no detectan excepciones HIGH (coste operacional 0.150 / 0.267 / 0.167). Además, el conjunto de evaluación no se mantuvo fuera del proceso de selección de hiperparámetros; se ha congelado una semilla 999 como conjunto de test definitivo.

## Requisitos de hardware

- Entrenamiento: se realizó en un Apple M5 en ~100 minutos, lo que indica que cualquier Mac con chip M-series reciente puede reentrenar el adaptador.
- Inferencia: el modelo base es Qwen3-1.7B en 4-bit, por lo que cabe holgadamente en la memoria unificada de cualquier Apple Silicon (8 GB de RAM son suficientes para inferencia).
- GPU recomendadas: no aplica GPU NVIDIA; MLX está optimizado para Apple Silicon (M1/M2/M3/M4/M5).
- No cabe en GPU consumer NVIDIA directamente: el formato MLX es específico de Apple; para ejecutar en CUDA habría que convertir el adaptador a otro formato (no se proporcionan pesos GGUF ni safetensors estándar).
- Opciones de despliegue: MLX (`mlx-lm`), con carga del adaptador vía `mlx_lm.lora.load`. La integración con Kafka, Temporal Cloud y Postgres sugiere despliegue como servicio interno.
- Latencia: no disponible, pero con ~38 tokens de salida media por veredicto y un modelo de 1.7B, la latencia por inferencia debería ser de decenas de milisegundos en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reconforge-recon-lora (este) | 1.7B + LoRA | no disponible | Conciliación financiera (JSON verdict) | Apache 2.0 | HuggingFace (MLX) |
| Qwen3-1.7B (base) | 1.7B | no disponible | Texto general | Apache 2.0 | HuggingFace |
| Modelos frontier (no especificados) | no disponible | no disponible | Conciliación financiera | no disponible | no disponible |

El autor afirma en el repositorio GitHub que este adaptador supera a un modelo frontier en recall ponderado por severidad, pero no se proporcionan los nombres de los modelos comparados ni los números exactos en la información disponible. No se han encontrado otros adaptadores LoRA públicos especializados en conciliación financiera con los que comparar directamente.

## Limitaciones y advertencias

- Selección de checkpoint sesgada: este modelo es el mejor de cuatro ejecuciones (R_w 0.9451 frente a una mediana de ~0.82). Un reentrenamiento con los mismos datos producirá probablemente un rendimiento inferior.
- El conjunto de evaluación no fue aislado del proceso de selección: las decisiones de configuración se tomaron comparando sobre las mismas 800 tareas con las que se reportan las métricas. Existe riesgo de sobreajuste a la semilla 777.
- Sensibilidad extrema al prompt: el modelo solo funciona con el prompt de entrenamiento exacto. Modificarlo degrada la accuracy de 0.805 a 0.434 y aumenta los falsos positivos.
- El modo thinking debe estar desactivado: activar `enable_thinking=True` cambia el formato de salida y rompe el parseo del JSON.
- Una única muestra greedy no reproduce los resultados reportados: se requiere self-consistency sampling (5 muestras, temp 0.6, votación mayoritaria).
- Variabilidad entre semillas alta (SD 0.0823 en R_w): el rendimiento no es estable entre ejecuciones de entrenamiento.
- Riesgo de alucinación: como modelo de 1.7B, puede generar razones o confianzas incorrectas; el campo `reason` está limitado a menos de 10 palabras por diseño, pero no se garantiza su exactitud.
- Sin datos de idiomas: no se especifican los idiomas soportados; los ejemplos están en inglés.
- Formato propietario de despliegue: al ser MLX, no se puede ejecutar directamente en infraestructura CUDA estándar sin conversión.
- Sin adopción verificada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un proyecto de un único autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caiotheodoro/reconforge-recon-lora
- Dataset de evaluación: https://huggingface.co/datasets/caiotheodoro/recon-eval
- Colección ReconForge: https://huggingface.co/collections/caiotheodoro/reconforge-6a89e9d6539e5b51403dd9ca
- Repositorio GitHub: https://github.com/caiotheodoro/reconforge
- README del repositorio: https://github.com/caiotheodoro/reconforge/blob/main/README.md
- Perfil del autor en HuggingFace: https://huggingface.co/caiotheodoro/models
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
